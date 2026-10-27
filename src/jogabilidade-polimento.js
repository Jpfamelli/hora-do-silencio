// Jogabilidade, lote 3: polimento e plataforma.
// Sensação (hit-stop, câmera lenta no "por um fio", alívio quando ele desiste, item que voa até a mão),
// acessibilidade (ritmo do mundo, ajuda para mirar, realce do que dá para usar, avisos antecipados,
// sentir os passos, reinício rápido, jogar só com o mouse) e os sons pequenos do corpo da Lia.
// O motor (jogo.js, seção JOGADOR) chama estas funções por poucos ganchos.

const $ = s => document.querySelector(s);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

export function criarPolimento(C) {
  const { THREE, P, M, ANA, PROC, W, OPT, keys, camera, scene, SFX, A } = C;
  const S = () => C.S;

  // ------------------------------------------------------------ estilo e HUD próprio
  const css = document.createElement('style');
  css.textContent = `
  #jp-escapou{position:absolute;left:50%;top:62%;transform:translateX(-50%);font-family:"Special Elite";font-size:14px;letter-spacing:.14em;color:#c9a75a;text-shadow:0 0 8px #000;opacity:0;transition:opacity .5s;pointer-events:none}
  #jp-escapou.on{opacity:.9}
  #jp-acao{position:absolute;left:50%;top:calc(50% + 22px);transform:translateX(-50%);font-family:"Special Elite";font-size:11px;letter-spacing:.1em;color:#b8ab8e;text-shadow:0 0 6px #000;pointer-events:none}
  #jp-volta{font-family:"Special Elite";font-size:13px;color:#c9a75a;margin-top:10px;letter-spacing:.08em}
  #jp-assist{font-family:"Special Elite";font-size:13px;color:#8e846c;letter-spacing:.12em;margin:-4px 0 8px}
  #inv-mini em.jp-pulo{display:inline-block;animation:jpPulo .45s cubic-bezier(.2,1.8,.4,1);color:#f0e2b8;text-shadow:0 0 10px rgba(240,220,170,.8)}
  @keyframes jpPulo{0%{transform:scale(1.35)}100%{transform:scale(1)}}
  #toast.jp-nao{color:#e0574a}`;
  document.head.appendChild(css);
  const hud = $('#hud');
  const novoEl = (id, pai = hud) => { const e = document.createElement('div'); e.id = id; if (pai) pai.appendChild(e); return e; };
  const elEscapou = hud ? novoEl('jp-escapou') : null, elAcao = hud ? novoEl('jp-acao') : null;
  if (elAcao) elAcao.hidden = true;

  // ------------------------------------------------------------ teclas com o nome do aparelho em uso
  const NOMES = {
    toque: { KeyE: 'Usar', Space: 'Prender fôlego', KeyR: 'Pilha', KeyH: 'Curativo', KeyG: 'Garrafa', KeyQ: 'Olhar atrás', KeyF: 'Lanterna', KeyZ: '◂ Espiar', KeyX: 'Espiar ▸', ZX: 'os botões de Espiar', KeyC: 'Agachar', Alt: 'o analógico empurrado de leve', ShiftLeft: 'o analógico empurrado até o fim' },
    pad: { KeyE: 'A', Space: 'RB', KeyR: '↑ no direcional', KeyH: '↓ no direcional', KeyG: 'LB', KeyQ: 'o analógico direito (R3)', KeyF: 'X', KeyZ: '◂ no direcional', KeyX: '▸ no direcional', ZX: '◂ e ▸ no direcional', KeyC: 'B', Alt: 'LT', ShiftLeft: 'RT' },
    tec: { KeyE: 'E', Space: 'ESPAÇO', KeyR: 'R', KeyH: 'H', KeyG: 'G', KeyQ: 'Q', KeyF: 'F', KeyZ: 'Z', KeyX: 'X', ZX: 'Z e X', KeyC: 'C', Alt: 'ALT', ShiftLeft: 'SHIFT' }
  };
  const aparelho = () => document.body.classList.contains('toque') ? 'toque' : document.body.classList.contains('pad') ? 'pad' : 'tec';
  const t = code => NOMES[aparelho()][code] || NOMES.tec[code] || code;

  // ------------------------------------------------------------ vibração (controle e celular), respeita a opção de Desempenho
  function vibraLigada() { try { const o = JSON.parse(localStorage.getItem('hora-silencio-plat') || '{}'); return o.vibrar !== false; } catch (e) { return true; } }
  let vibOk = vibraLigada(), vibChecado = 0;
  function vibrar(forte, fraco, ms) {
    if (window.__teste) return;
    if (performance.now() - vibChecado > 3000) { vibChecado = performance.now(); vibOk = vibraLigada(); }
    if (!vibOk) return;
    try { const g = [...(navigator.getGamepads ? navigator.getGamepads() : [])].find(x => x && x.connected); if (g && g.vibrationActuator && g.vibrationActuator.playEffect) g.vibrationActuator.playEffect('dual-rumble', { duration: ms, strongMagnitude: clamp(forte, 0, 1), weakMagnitude: clamp(fraco, 0, 1) }).catch(() => {}); } catch (e) {}
    try { if (aparelho() === 'toque' && navigator.vibrate) navigator.vibrate(ms); } catch (e) {}
  }

  // ------------------------------------------------------------ sons pequenos do corpo (procedurais)
  const ok = () => !!C.AC;
  const som = {
    tecido(vol = 1) { if (!ok()) return; const tt = C.AC.currentTime, g = A.saida(null, .05); A.burst(tt, .22, 'bandpass', 1800, .7, g); A.env(g, tt, .04, .05 * vol, .18); },
    joelho() { if (!ok()) return; const tt = C.AC.currentTime, g = A.saida(null, .1); A.burst(tt, .03, 'bandpass', 2600, 6, g); A.env(g, tt, .001, .35, .03); const g2 = A.saida(null, .1); A.burst(tt + .035, .02, 'bandpass', 1900, 6, g2); A.env(g2, tt + .035, .001, .2, .02); },
    baque(x, z) { if (!ok()) return; const tt = C.AC.currentTime, g = A.saida({ x, y: 1, z }, .25); A.osc('sine', 70, tt, .25, g); A.burst(tt, .12, 'lowpass', 380, 1, g); A.env(g, tt, .003, .5, .22); },
    tilintar(x, y, z, vol = 1, agudo = 1) { if (!ok()) return; const tt = C.AC.currentTime; for (const [d, f] of [[0, 2900], [.07, 3700]]) { const g = A.saida(x === undefined ? null : { x, y, z }, .15); A.osc('triangle', f * agudo, tt + d, .12, g); A.env(g, tt + d, .002, .07 * vol, .1); } },
    vidroBaixo() { if (!ok()) return; const tt = C.AC.currentTime, g = A.saida(null, .1); A.osc('sine', 1900, tt, .2, g); A.env(g, tt, .002, .06, .18); },
    galao() { if (!ok()) return; const tt = C.AC.currentTime, g = A.saida(null, .1); A.burst(tt, .35, 'lowpass', 500, 2, g); A.env(g, tt, .05, .12, .3); },
    alivio() { if (!ok()) return; const tt = C.AC.currentTime; [110, 164.8, 220].forEach((f, i) => { const g = A.saida(null, .5, 'mus'); A.osc('sine', f, tt + i * .08, 2.6, g); A.env(g, tt + i * .08, .5, .035, 2); }); },
    quique(x, z) { if (!ok()) return; const tt = C.AC.currentTime, g = A.saida({ x, y: .2, z }, .2); A.osc('triangle', 1500, tt, .1, g); A.env(g, tt, .002, .18, .08); },
    terra(x, z) { if (!ok()) return; const tt = C.AC.currentTime, g = A.saida({ x, y: .2, z }, .15); A.burst(tt, .15, 'lowpass', 300, 1, g); A.env(g, tt, .005, .25, .12); }
  };
  // legendas de som para quem joga sem ouvir (as do motor ficam na interface)
  const LEG = C.legendas || {};
  Object.assign(LEG, {
    tabua: { t: 'a tábua range', imp: 1, cd: 1.5, cat: 'p' },
    joelho: { t: 'seu joelho estala', imp: 1, cd: 3, cat: 'p' },
    trombou: { t: 'você bateu em alguma coisa', imp: 1, cd: 2, cat: 'p' },
    tropecou: { t: 'você tropeçou', imp: 1, cd: 2, cat: 'p' },
    portaBate: { t: 'a porta bate na parede', imp: 1, cd: 1.5, cat: 'p' },
    pilhaCai: { t: 'a pilha velha quica no chão', imp: 0, cd: 2, cat: 'p' }
  });

  // ------------------------------------------------------------ tempo: hit-stop e câmera lenta
  let paraT = 0, lentoT = 0;
  function tempo(dt) {
    if (paraT > 0) { paraT -= dt; return dt * .04; }
    if (lentoT > 0) { lentoT -= dt; return dt * .3; }
    return dt;
  }
  function golpe(quem) {
    if (quem !== 'inspetor') return;
    paraT = .09; P.shake = Math.max(P.shake, +OPT.vFlash ? .05 : .09);
    if (C.abafarMundo) C.abafarMundo(.25, .4);
    vibrar(.9, .5, 220);
  }
  function agarrao() { paraT = .07; vibrar(1, .8, 260); }
  function porUmFio() {
    lentoT = .4; if (C.abafarMundo) C.abafarMundo(.35, .45);
    const s = S(); if (s) s.escapadas = (s.escapadas || 0) + 1;
    setTimeout(() => SFX.ofego(), 380);
  }

  // ------------------------------------------------------------ ritmo do mundo (acessibilidade)
  function ritmo() {
    const s = S(); if (!s || s.dif === 'pesadelo' || (s.modo && s.modo.umaVida)) return 1;
    const r = clamp(+OPT.ritmo || 1, .7, 1);
    if (r < 1) s.flags.assistida = Math.min(s.flags.assistida || 1, r);
    return r;
  }
  // a tela de fim de capítulo diz que a noite foi assistida
  const fim = $('#fimcap');
  if (fim) new MutationObserver(() => {
    const s = S(); let el = $('#jp-assist');
    if (fim.hidden) return;
    const a = s && s.flags && s.flags.assistida, esc = s && s.escapadas || 0, fugiu = s && s.escapou || 0;
    if (!a && !esc && !fugiu) { if (el) el.remove(); return; }
    if (!el) { el = document.createElement('div'); el.id = 'jp-assist'; const r = $('#fc-rank'); if (r) r.after(el); else fim.appendChild(el); }
    // a noite conta as fugas: quantas vezes ele desistiu de você e quantas você escapou por um fio
    el.textContent = [a ? `noite assistida · mundo a ${Math.round(a * 100)}%` : '', fugiu ? `ele desistiu de você ${fugiu}x` : '', esc ? `por um fio: ${esc}x` : ''].filter(Boolean).join(' · ');
  }).observe(fim, { attributes: true, attributeFilter: ['hidden'] });

  // ------------------------------------------------------------ menus travados no agarrão e nos últimos números da Ana
  function travado() {
    const s = S(); if (!s || C.mode !== 'jogo' || C.ui || s.dead) return false;
    return M.state === 'agarra' || M.state === 'bote' || (ANA.ativa && ANA.conta >= 8 && !ANA.script);
  }
  let naoT;
  function agoraNao() {
    const el = $('#toast'); if (!el) return;
    el.textContent = 'Agora não.'; el.classList.add('jp-nao'); el.style.opacity = 1; clearTimeout(naoT);
    naoT = setTimeout(() => { el.classList.remove('jp-nao'); el.style.opacity = 0; }, 1200);
  }
  // chamado no começo do keydown do motor: TAB, J, O e P não abrem nada no agarrão nem no fim da contagem
  function bloqueia(e) {
    if (!['Tab', 'KeyJ', 'KeyO', 'KeyP'].includes(e.code) || !travado()) return false;
    e.preventDefault(); e.stopImmediatePropagation(); if (!e.repeat) agoraNao(); return true;
  }
  addEventListener('keydown', e => { bloqueia(e); }, true);

  // ------------------------------------------------------------ item que voa até a mão
  const voando = [], quedas = [];
  const _v = new THREE.Vector3(), _f = new THREE.Vector3();
  function tipoItem(txt) {
    const s = String(txt || '').toLowerCase();
    if (s.includes('pilha')) return 'pilha'; if (s.includes('curativo')) return 'kit'; if (s.includes('garrafa')) return 'garrafa';
    if (s.includes('galão')) return 'galao'; if (/chave|engrenagem|fusív|crachá|relógio|medalha/.test(s)) return 'metal';
    return 'outro';
  }
  function pegou(mesh, label) {
    const tipo = tipoItem(label);
    if (tipo === 'pilha' || tipo === 'metal') som.tilintar(undefined, 0, 0, 1, tipo === 'metal' ? .8 : 1);
    else if (tipo === 'kit') SFX.papel(); else if (tipo === 'garrafa') som.vidroBaixo(); else if (tipo === 'galao') som.galao();
    vibrar(0, .25, 40);
    try {
      const c = mesh.clone(true); mesh.getWorldPosition(_v); c.position.copy(_v); c.quaternion.identity(); mesh.getWorldQuaternion(c.quaternion);
      c.traverse(o => { o.castShadow = false; o.userData = {}; });
      scene.add(c); voando.push({ m: c, ini: _v.clone(), t: 0, esc: c.scale.x });
    } catch (e) {}
    setTimeout(() => pulsoInv(tipo), 260);
  }
  function pulsoInv(tipo) {
    const nome = { pilha: 'Pilhas', kit: 'Curativos', garrafa: 'Garrafas' }[tipo]; if (!nome) return;
    for (const em of document.querySelectorAll('#inv-mini em')) {
      const tx = em.previousSibling && em.previousSibling.textContent || '';
      if (tx.includes(nome)) { em.classList.remove('jp-pulo'); void em.offsetWidth; em.classList.add('jp-pulo'); }
    }
  }
  function updVoando(dt) {
    for (let i = voando.length - 1; i >= 0; i--) {
      const o = voando[i]; o.t += dt / .25; const k = Math.min(1, o.t), e = k * k * (3 - 2 * k);
      camera.getWorldDirection(_f); _v.copy(camera.position).addScaledVector(_f, .35); _v.y -= .32;
      o.m.position.lerpVectors(o.ini, _v, e); o.m.rotation.y += dt * 9; o.m.scale.setScalar(o.esc * (1 - .7 * e));
      if (k >= 1) { scene.remove(o.m); voando.splice(i, 1); }
    }
    for (let i = quedas.length - 1; i >= 0; i--) {
      const q = quedas[i];
      if (q.grupo !== W.grupo) { quedas.splice(i, 1); continue; }
      if (q.parada) continue;
      q.vy -= 9.8 * dt; q.m.position.x += q.vx * dt; q.m.position.z += q.vz * dt; q.m.position.y += q.vy * dt; q.m.rotation.z += dt * 8;
      if (q.m.position.y <= .03) {
        q.m.position.y = .03; q.quiques++;
        if (q.quiques === 1) { som.tilintar(q.m.position.x, .1, q.m.position.z, .8); SFX.pilhaCai(q.m.position.x, q.m.position.z); C.emitNoise(q.m.position.x, q.m.position.z, 1.5, true); }
        if (q.quiques >= 3) { q.parada = true; q.m.rotation.set(0, Math.random() * 6, Math.PI / 2 * 0); continue; }
        q.vy = Math.abs(q.vy) * .35; q.vx *= .5; q.vz *= .5;
      }
    }
  }
  function soltarPilha(mesh) {
    camera.getWorldDirection(_f); mesh.position.copy(camera.position).addScaledVector(_f, .3); mesh.position.y -= .35;
    W.grupo.add(mesh); quedas.push({ m: mesh, vx: _f.x * .6, vz: _f.z * .6, vy: .5, quiques: 0, grupo: W.grupo });
    while (quedas.length > 6) { const q = quedas.shift(); if (q.grupo === W.grupo) W.grupo.remove(q.m); }
  }

  // ------------------------------------------------------------ ajuda para mirar: atrito (nunca puxa) e realce do que dá para usar
  const ajudaMira = () => { const v = OPT.miraAjuda; return v === 1 || ((v === undefined || v === 2 || isNaN(v)) && !!(C.semMouse && C.semMouse())); };
  const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: C.texHalo, color: 0xf2e6c8, transparent: true, opacity: 0, depthWrite: false, depthTest: false, blending: THREE.AdditiveBlending }));
  halo.scale.set(.42, .42, 1); halo.visible = false; halo.renderOrder = 5; scene.add(halo);
  const _bx = new THREE.Box3(); let haloDe = null, atritoT = 0;
  function updMira(dt) {
    const s = S(), alvo = C.alvo;
    atritoT = alvo ? .2 : Math.max(0, atritoT - dt);
    const fina = (s && (s.hidden || P.mirarG > .3)) ? clamp(+OPT.sensFina || .6, .3, 1) : 1;
    P.sensMul = fina * (ajudaMira() && atritoT > 0 ? .62 : 1);
    const quer = +OPT.realce && s && s.dif !== 'pesadelo' && alvo && !s.hidden && !alvo.porta;
    if (!quer) { halo.visible = false; haloDe = null; return; }
    if (haloDe !== alvo) { haloDe = alvo; _bx.setFromObject(alvo.obj); if (_bx.isEmpty()) { halo.visible = false; return; } _bx.getCenter(halo.position); }
    halo.visible = true; halo.material.opacity = .14 + .12 * Math.sin(C.perf * 4.5);
  }

  // ------------------------------------------------------------ alívio quando ele desiste, avisos antecipados, sentir os passos
  let estAnt = 'patrulha', cacou = false, escT = 0, passoAcc = 0;
  const mAnt = new THREE.Vector3();
  const avisosVistos = {};
  function avisoRegra(id, txt) {
    const s = S(); const k = s.chapter + ':' + id;
    if (avisosVistos[k]) return; avisosVistos[k] = true; C.toast(txt);
  }
  function updEntidades(dt) {
    const s = S();
    if (M.ativo) {
      if (['caca', 'alerta', 'bote', 'agarra'].includes(M.state)) cacou = true;
      if (cacou && M.state === 'patrulha' && estAnt !== 'patrulha' && !s.dead) {
        cacou = false; s.escapou = (s.escapou || 0) + 1; som.alivio(); setTimeout(() => SFX.ofego(), 500); vibrar(.12, .3, 260);
        if (elEscapou) { elEscapou.textContent = `escapou ${s.escapou}x`; elEscapou.classList.add('on'); escT = 2.2; }
      }
      estAnt = M.state;
      // cada passo dele por perto vira um toque de vibração (para quem joga sem som)
      if (+OPT.sentirPassos) {
        const d = M.pos.distanceTo(P.pos); passoAcc += mAnt.distanceTo(M.pos);
        if (passoAcc > .8) { passoAcc = 0; if (d < 10) { const k = (10 - d) / 10; const ang = Math.atan2(M.pos.x - P.pos.x, M.pos.z - P.pos.z) - Math.atan2(-Math.sin(P.yaw), -Math.cos(P.yaw)); const lado = Math.sin(ang); vibrar(.15 + k * .6 * (lado > 0 ? 1 : .3), .1 + k * .5 * (lado > 0 ? .3 : 1), 45); } }
      }
      mAnt.copy(M.pos);
    } else { cacou = false; estAnt = 'patrulha'; mAnt.copy(M.pos); }
    // com a Menina perto e o medo alto, a Lia lembra que prender o ar firma a mão da lanterna
    if (ANA.ativa && s.fear > 70 && !s.flags.dicaFirmar && !s.hidden) { s.flags.dicaFirmar = true; C.toast(`Prenda o ar (${t('Space')}): a mão firma e a luz para de tremer.`); }
    if (escT > 0) { escT -= dt; if (escT <= 0 && elEscapou) elEscapou.classList.remove('on'); }
    if (+OPT.avisoCedo && s.dif !== 'pesadelo') {
      if (M.ativo && M.state === 'caca') avisoRegra('insp', 'Regra: ele é cego e caça pelo som. Agache, esconda-se ou prenda o ar.');
      if (ANA.ativa) avisoRegra('ana', 'Regra: ela só anda quando não está vista e iluminada. Mantenha a luz nela.');
      if (PROC.fase === 'aviso') avisoRegra('proc', 'Regra: luzes piscando. Vá para o esconderijo mais perto, agora.');
    }
  }

  // ------------------------------------------------------------ jogar só com o mouse (uma mão)
  const ACOES = [['KeyF', 'lanterna'], ['KeyG', 'garrafa'], ['KeyR', 'pilha'], ['KeyH', 'curativo'], ['Space', 'prender o ar'], ['KeyQ', 'olhar para trás'], ['KeyC', 'agachar']];
  let acaoI = 0;
  const umaMao = () => +OPT.umaMao && C.mode === 'jogo' && !C.ui && document.pointerLockElement;
  const tecla = (code, desce) => { try { dispatchEvent(new KeyboardEvent(desce ? 'keydown' : 'keyup', { code, key: code, bubbles: true, cancelable: true })); } catch (e) {} };
  const segura = {};
  addEventListener('mousedown', e => {
    if (!umaMao()) return;
    const code = e.button === 0 ? 'KeyW' : e.button === 2 ? 'KeyE' : e.button === 3 ? ACOES[acaoI][0] : e.button === 4 ? 'KeyC' : null;
    if (!code) return; e.preventDefault(); segura[e.button] = code; tecla(code, true);
  });
  addEventListener('mouseup', e => { const code = segura[e.button]; if (!code) return; segura[e.button] = null; tecla(code, false); });
  addEventListener('contextmenu', e => { if (+OPT.umaMao && C.mode === 'jogo') e.preventDefault(); });
  addEventListener('wheel', e => { if (!umaMao()) return; acaoI = (acaoI + (e.deltaY > 0 ? 1 : ACOES.length - 1)) % ACOES.length; mostrarAcao(); }, { passive: true });
  function mostrarAcao() { if (!elAcao) return; const on = !!(+OPT.umaMao && C.mode === 'jogo'); elAcao.hidden = !on; if (on) elAcao.textContent = `roda: ${ACOES[acaoI][1]} · botão lateral de trás usa`; }

  // ------------------------------------------------------------ reinício rápido depois de várias mortes no mesmo trecho
  let voltaTO = null;
  function aoMorrer(n) {
    clearTimeout(voltaTO); const ant = $('#jp-volta'); if (ant) ant.remove();
    if (window.__teste || OPT.reinicio === 0 || n < 3) return;
    const ini = performance.now();
    const tenta = () => {
      const d = $('#death'), b = $('#dt-retry');
      if (!d || d.hidden || !b || b.hidden || b.disabled || b.offsetParent === null) { if (performance.now() - ini < 4000) voltaTO = setTimeout(tenta, 200); return; }
      let el = $('#jp-volta'); if (!el) { el = document.createElement('div'); el.id = 'jp-volta'; b.after(el); }
      let n2 = 2; el.textContent = `Voltando em ${n2}… (qualquer outra tecla espera)`;
      const cancela = ev => { if (['KeyE', 'Space', 'Enter'].includes(ev.code)) return; clearTimeout(voltaTO); el.textContent = 'Tudo bem. Respire.'; removeEventListener('keydown', cancela, true); };
      addEventListener('keydown', cancela, true);
      const conta = () => { n2--; if (d.hidden) { removeEventListener('keydown', cancela, true); el.remove(); return; } if (n2 <= 0) { removeEventListener('keydown', cancela, true); el.remove(); b.click(); return; } el.textContent = `Voltando em ${n2}… (qualquer outra tecla espera)`; voltaTO = setTimeout(conta, 1000); };
      voltaTO = setTimeout(conta, 1000);
    };
    voltaTO = setTimeout(tenta, 300);
  }

  // ------------------------------------------------------------ portas: quique no batente
  function updPortas(dt) {
    for (const d of W.doors) {
      if (!(d.quique > 0)) { d.qOff = 0; continue; }
      if (Math.abs(d.ang - d.target) > .12) continue;
      d.quique -= dt; const k = Math.max(0, d.quique) / .5;
      d.qOff = Math.sin((.5 - d.quique) * 30) * .1 * k * (d.target === 0 ? -1 : 1);
    }
  }

  function update(dt) {
    updVoando(dt); updMira(dt); updEntidades(dt); updPortas(dt);
    if (elAcao) { const on = !!(+OPT.umaMao && C.mode === 'jogo'); if (elAcao.hidden === on) mostrarAcao(); }
  }
  function mapa() { for (const o of voando) scene.remove(o.m); voando.length = 0; quedas.length = 0; halo.visible = false; haloDe = null; cacou = false; estAnt = 'patrulha'; }

  return { t, vibrar, travado, agoraNao, bloqueia, som, tempo, golpe, agarrao, porUmFio, ritmo, pegou, soltarPilha, update, mapa, aoMorrer, updVoando };
}
