// =====================================================================
// ÁUDIO — PLATAFORMA E POLIMENTO (Lote 3)
// Menus que soam como um toca-fitas velho, o som que cai (iOS, bluetooth) e volta com um toque,
// o fone que sai no meio do jogo, tábuas e ladrilhos soltos que entregam você,
// e o Inspetor batendo nos armários com a mão. Ligado ao motor por poucas linhas (procure AUDP em jogo.js).
// =====================================================================

const LEGENDAS = {
  tocArmario: { t: 'batidas de mão na madeira de um armário', imp: 1, cd: 5, pos: a => a[0], cat: 'p' },
  tabua: { t: 'o chão solto range alto', imp: 1, cd: 2, pos: a => a[0], cat: 'p' },
  portaLonge: { t: 'uma porta bate, longe', imp: 1, cd: 10, pos: a => a[0], cat: 'h' },
  passoLonge: { t: 'um passo pesado, muito longe', imp: 1, cd: 20, pos: a => a[0], cat: 'p' },
  pilha: { t: 'a mola da lanterna estala', imp: 0, cd: 3 },
  agarrao: { t: 'a Lia grita com a boca tapada', imp: 1, cd: 3, cat: 'p' }
};

export function instalarAudioPlataforma(C) {
  const { SOM, OPT, W, P, M, THREE } = C;
  const ac = () => C.AC;
  const robo = !!navigator.webdriver;
  const teste = () => !!window.__teste;
  const $ = s => document.querySelector(s);
  if (C.legendas) Object.assign(C.legendas, LEGENDAS);
  const st = document.createElement('style');
  st.textContent = '#som-caiu{position:fixed;left:50%;bottom:86px;transform:translateX(-50%);z-index:60;background:rgba(10,8,8,.88);color:#d9cfc0;border:1px solid #6b5b4a;padding:10px 18px;font:15px "IM Fell English SC",serif;letter-spacing:.06em;cursor:pointer;border-radius:3px}'
    + '#som-fone{position:fixed;left:50%;top:22%;transform:translateX(-50%);z-index:70;background:rgba(8,6,6,.95);color:#d9cfc0;border:1px solid #6b5b4a;padding:18px 22px;text-align:center;max-width:min(92vw,440px);font:16px "IM Fell English SC",serif;border-radius:3px}#som-fone p{margin:0 0 12px}#som-fone .btn{margin:4px}'
    + '.btn.som-treme{animation:somTreme .18s linear 1}@keyframes somTreme{25%{transform:translateX(-1px)}75%{transform:translateX(1px)}}';
  document.head.appendChild(st);

  // ---------------------------------------------------------------- MENUS
  let ultBotao = null, ultTecla = 0, ultPot = 0, ultAmostra = 0, passadas = 0;
  const agoraS = () => performance.now() / 1000;
  const podeMenu = el => ac() && OPT.vMenu > 0 && el && !el.closest('#toque, #hud, #c');
  const marca = () => { if (C.AUD) C.AUD.menuT = ac().currentTime; };
  const botao = e => e.target && e.target.closest ? e.target.closest('button, .btn, summary, [role="button"]') : null;
  function passou(el) {
    if (!podeMenu(el) || el === ultBotao) return;
    ultBotao = el; const t = agoraS(); if (t - ultTecla < .06) return; ultTecla = t;
    SOM.mTecla();
    // no título, às vezes um sussurro atravessa de um ouvido ao outro (e raramente vem do lado errado)
    if (C.mode === 'titulo' && el.closest('#title') && !+OPT.vFlash && Math.random() < .18) {
      passadas++; const r = el.getBoundingClientRect(), lado = (r.left + r.width / 2) < innerWidth / 2 ? -1 : 1;
      SOM.mSussurro(passadas % 30 === 0 ? -lado : lado);
      el.classList.remove('som-treme'); void el.offsetWidth; el.classList.add('som-treme');
    }
  }
  document.addEventListener('pointerover', e => { const b = botao(e); if (b) passou(b); else ultBotao = null; }, true);
  document.addEventListener('focusin', e => { const b = botao(e); if (b) passou(b); }, true);
  document.addEventListener('pointerdown', e => { const b = botao(e); if (b && podeMenu(b) && (b.disabled || b.getAttribute('aria-disabled') === 'true' || b.classList.contains('bloq'))) { SOM.mBaque(); marca(); } }, true);
  document.addEventListener('click', e => {
    const b = botao(e); if (!b || !podeMenu(b) || b.disabled) return;
    if (b.tagName === 'SUMMARY') { SOM.mCatraca(); return; }
    const txt = (b.textContent || '').trim(), id = b.id || '';
    if (/voltar|fechar|cancelar|sair|menu/i.test(txt) || /voltar|fechar|menu/i.test(id) || txt === '×' || txt === '✕') SOM.mRebobina(); else SOM.mPlay();
    marca();
  }, true);
  document.addEventListener('input', e => {
    const el = e.target; if (!el || el.type !== 'range' || !podeMenu(el)) return;
    const t = agoraS(), v = (el.value - (el.min || 0)) / ((el.max || 1) - (el.min || 0));
    if (t - ultPot > .07) { ultPot = t; SOM.mPot(v); }
    const m = /-(v[A-Z]\w*)$/.exec(el.id || '');
    if (m && t - ultAmostra > .35) { ultAmostra = t; setTimeout(() => { try { if (ac()) SOM.amostra(m[1]); } catch (er) {} }, 60); }
  }, true);
  document.addEventListener('change', e => {
    const el = e.target; if (!el || !podeMenu(el)) return;
    if (el.type === 'checkbox') SOM.mInterruptor(el.checked); else if (el.tagName === 'SELECT') SOM.mCatraca();
  }, true);

  // ---------------------------------------------------------------- O SOM CAIU (iOS, ligação, bluetooth)
  const caiu = document.createElement('button'); caiu.id = 'som-caiu'; caiu.hidden = true; caiu.textContent = 'O som caiu — toque aqui para religar';
  caiu.onclick = () => { try { ac().resume(); } catch (e) {} caiu.hidden = true; };
  document.body.appendChild(caiu);
  let caiuT = 0;
  setInterval(() => {
    try {
      const A = ac(); if (!A || robo) return;
      const parado = A.state !== 'running' && A.state !== 'closed', emJogo = C.mode === 'jogo' && !C.ui && !document.hidden;
      caiuT = parado && emJogo ? caiuT + 1 : 0;
      caiu.hidden = caiuT < 2;
    } catch (e) {}
  }, 1000);

  // ---------------------------------------------------------------- O FONE SAIU
  let foneT = 0;
  const painel = document.createElement('div'); painel.id = 'som-fone'; painel.hidden = true;
  painel.innerHTML = '<p>O som mudou de saída. Este jogo se joga pelo ouvido.</p><p>Ainda está de fone?</p><button class="btn" id="sf-sim">Sim, de fone</button><button class="btn" id="sf-nao">Não, sem fone</button>';
  document.body.appendChild(painel);
  const escolherFone = on => {
    painel.hidden = true;
    try { const pl = window.__plat; if (pl && pl.O) { pl.O.fone = on; const k = 'hora-silencio-plat'; let o = {}; try { o = JSON.parse(localStorage.getItem(k)) || {}; } catch (e) {} o.fone = on; localStorage.setItem(k, JSON.stringify(o)); } } catch (e) {}
    try { C.toast(on ? 'Som em 3D para fone.' : 'Som ajustado para caixa de som. Os passos atrás ficam mais difíceis de achar.'); } catch (e) {}
  };
  painel.querySelector('#sf-sim').onclick = () => escolherFone(true);
  painel.querySelector('#sf-nao').onclick = () => escolherFone(false);
  try {
    if (navigator.mediaDevices && navigator.mediaDevices.addEventListener && !robo) navigator.mediaDevices.addEventListener('devicechange', () => {
      const t = agoraS(); if (t - foneT < 20) return; foneT = t;
      setTimeout(() => {
        const S = C.S; if (teste() || C.mode !== 'jogo' || !S || S.dead || S.fim) return;
        if (!C.ui) C.abrirPausa();
        painel.hidden = false;
      }, 600);
    });
  } catch (e) {}

  // ---------------------------------------------------------------- CHÃO SOLTO
  // Tábuas (andar de cima) e ladrilhos (térreo) soltos em pontos fixos dos corredores: mais claros, com rachadura.
  let soltos = [], grupoPrev = null;
  const texSolto = {};
  function textura(piso) {
    if (texSolto[piso]) return texSolto[piso];
    const cv = document.createElement('canvas'); cv.width = 128; cv.height = 40; const x = cv.getContext('2d');
    if (piso === 'ladrilho') { x.fillStyle = 'rgba(205,200,186,.5)'; x.fillRect(2, 2, 124, 36); x.strokeStyle = 'rgba(30,24,20,.85)'; x.lineWidth = 2; x.strokeRect(2, 2, 124, 36); }
    else { x.fillStyle = 'rgba(176,138,96,.45)'; x.fillRect(0, 4, 128, 32); x.strokeStyle = 'rgba(20,14,10,.9)'; x.lineWidth = 2; x.strokeRect(0, 4, 128, 32); for (const px of [10, 118]) { x.fillStyle = 'rgba(40,36,34,.9)'; x.beginPath(); x.arc(px, 20, 2.5, 0, 7); x.fill(); } }
    x.strokeStyle = 'rgba(15,10,8,.9)'; x.lineWidth = 1.5; x.beginPath(); x.moveTo(30, 6); x.lineTo(46, 18); x.lineTo(40, 24); x.lineTo(62, 34); x.moveTo(46, 18); x.lineTo(70, 14); x.lineTo(92, 22); x.stroke();
    const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; texSolto[piso] = t; t.userData = { compartilhado: true }; return t;
  }
  function semear(s) { let h = 2166136261; for (const ch of s) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); } return () => { h ^= h << 13; h ^= h >>> 17; h ^= h << 5; return ((h >>> 0) % 10000) / 10000; }; }
  function montarSoltos() {
    soltos = [];
    if (!W.grupo || !['terreo', 'superior'].includes(W.mapa)) return;
    const corr = W.salas.filter(r => r.tipo === 'corredor' && (r.piso === 'madeira' || r.piso === 'ladrilho'));
    const porSala = Math.max(2, Math.ceil(7 / Math.max(1, corr.length)));
    for (const r of corr) {
      const rnd = semear(W.mapa + ':' + r.id), lx = r.x1 - r.x0, lz = r.z1 - r.z0, longoX = lx >= lz;
      for (let i = 0; i < porSala && soltos.length < 8; i++) {
        const k = (i + .5 + (rnd() - .5) * .5) / porSala;
        const x = longoX ? r.x0 + .8 + (lx - 1.6) * k : r.x0 + .9 + (lx - 1.8) * rnd();
        const z = longoX ? r.z0 + .9 + (lz - 1.8) * rnd() : r.z0 + .8 + (lz - 1.6) * k;
        const mat = new THREE.MeshStandardMaterial({ map: textura(r.piso), transparent: true, depthWrite: false, roughness: .95, polygonOffset: true, polygonOffsetFactor: -2 });
        const m = new THREE.Mesh(new THREE.PlaneGeometry(r.piso === 'ladrilho' ? .55 : .95, r.piso === 'ladrilho' ? .55 : .26), mat);
        m.rotation.x = -Math.PI / 2; m.rotation.z = longoX ? 0 : Math.PI / 2; m.position.set(x, .013, z); m.renderOrder = 1;
        W.grupo.add(m);
        soltos.push({ x, z, piso: r.piso, dentro: false, monstro: false });
      }
    }
  }

  // ---------------------------------------------------------------- VIBRAR (controle e celular)
  function vibrar(ms, forte) {
    try { const pl = window.__plat; if (pl && pl.O && pl.O.vibrar === false) return; } catch (e) {}
    try { if (navigator.vibrate && matchMedia('(pointer:coarse)').matches) navigator.vibrate(ms); } catch (e) {}
    try { for (const g of navigator.getGamepads ? navigator.getGamepads() : []) if (g && g.vibrationActuator && g.vibrationActuator.playEffect) g.vibrationActuator.playEffect('dual-rumble', { duration: ms, strongMagnitude: forte, weakMagnitude: forte * .6 }).catch(() => {}); } catch (e) {}
  }

  // ---------------------------------------------------------------- TICK
  function tick(dt, x) {
    const S = C.S, A = ac(); if (!A || !S) return;
    if (W.grupo !== grupoPrev) { grupoPrev = W.grupo; try { montarSoltos(); } catch (e) { soltos = []; } }
    if (!x.jogando) return;
    // chão solto: a Lia e o Inspetor
    for (const b of soltos) {
      const d = Math.hypot(P.pos.x - b.x, P.pos.z - b.z), em = d < .42;
      if (em && !b.dentro) {
        const vol = P.crouch ? .5 : P.sprinting ? 1.3 : P.devagar ? .75 : 1;
        SOM.tabua({ x: b.x, z: b.z }, vol, b.piso);
        if (!teste()) C.emitNoise(b.x, b.z, 7 * vol);
      }
      b.dentro = em;
      const dm = M.ativo ? Math.hypot(M.pos.x - b.x, M.pos.z - b.z) : 99, mEm = dm < .5;
      if (mEm && !b.monstro) SOM.tabua({ x: b.x, z: b.z }, .9, b.piso);
      b.monstro = mEm;
    }
    // ele passa a mão nos armários: toc, toc. No seu, o som vem colado no ouvido
    if (M.ativo && ['patrulha', 'procura', 'investiga', 'reza'].includes(x.est)) {
      const now = A.currentTime;
      for (const L of W.lockers) {
        if (L.tipo === 'cama' || now - (L._toc || -99) < 14) continue;
        if (Math.hypot(M.pos.x - L.x, M.pos.z - L.z) > 1.05) continue;
        L._toc = now; if (Math.random() > .55) continue;
        if (S.hidden === L) { SOM.tocArmario(null, true); P.shake = Math.max(P.shake || 0, .05); vibrar(160, .9); S.fear = Math.min(100, S.fear + 12); }
        else SOM.tocArmario({ x: L.x, z: L.z }, false);
      }
    }
  }
  return { tick, get soltos() { return soltos; } };
}
