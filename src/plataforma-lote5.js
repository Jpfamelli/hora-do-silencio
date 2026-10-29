// A HORA DO SILÊNCIO — Plataforma e acessibilidade, lote 5.
// Áudio 3D do Inspetor (respiração e estalos que te rodeiam no fone), névoa de direção na caçada
// (acessibilidade para quem não ouve), soltar do agarrão segurando o botão, legendas de estado,
// alto contraste, opções de conforto/controle e um punhado de ajustes de desempenho e compartilhamento.
// Instalado por src/plataforma.js (instalarPlat5). Fala com o motor só pelo contexto C e pelos ajudantes U.

const $ = s => document.querySelector(s);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

export function instalarPlat5(C, U) {
  const { O } = U;
  const robo = U.robo || !!window.__teste;
  const menosMov = !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
  const emJogo = () => U.emJogoAtivo();
  const qual = () => U.qual();

  // ===================================================================
  // 1. ÁUDIO 3D DO INSPETOR: respiração e estalos que giram em volta de você
  //    A respiração sai de uma fonte posicionada na cabeça do Inspetor e passa pelo PannerNode:
  //    de fone, dá a volta na sua cabeça (HRTF); sem fone ou no mono, vira pan simples.
  // ===================================================================
  let AC = null, panner = null, noise = null, bgain = null, cgain = null, montado = false, falhou = false;
  let fase = 0, creakT = 2.5, respVol = 0;
  const temAC = () => C.AC && C.master;
  const panModelo = () => (O.mono || !O.fone) ? 'equalpower' : 'HRTF';
  function pos3(p, x, y, z) { try { if (p.positionX) { p.positionX.value = x; p.positionY.value = y; p.positionZ.value = z; } else p.setPosition(x, y, z); } catch (e) {} }
  function construir() {
    if (montado || falhou || robo || !temAC()) return;
    try {
      AC = C.AC;
      const buf = AC.createBuffer(1, Math.floor(AC.sampleRate * 2), AC.sampleRate), d = buf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      noise = AC.createBufferSource(); noise.buffer = buf; noise.loop = true;
      const bf = AC.createBiquadFilter(); bf.type = 'bandpass'; bf.frequency.value = 470; bf.Q.value = .8;
      bgain = AC.createGain(); bgain.gain.value = 0;
      const cf = AC.createBiquadFilter(); cf.type = 'bandpass'; cf.frequency.value = 1500; cf.Q.value = 1.6;
      cgain = AC.createGain(); cgain.gain.value = 0;
      panner = AC.createPanner(); panner.panningModel = panModelo(); panner.distanceModel = 'inverse'; panner.refDistance = 1.6; panner.rolloffFactor = 1.1;
      noise.connect(bf); bf.connect(bgain); bgain.connect(panner);
      noise.connect(cf); cf.connect(cgain); cgain.connect(panner);
      panner.connect(C.master);
      noise.start();
      montado = true;
    } catch (e) { falhou = true; }
  }
  function respFrame(dt) {
    if (falhou || robo) return;
    const M = C.M, S = C.S;
    const caca = !!(M && (M.state === 'caca' || M.state === 'bote' || M.state === 'alerta'));
    const quer = O.respInsp && temAC() && emJogo() && M && M.ativo && S && !S.dead && (!O.respSoCaca || caca);
    if (quer && !montado) construir();
    if (!montado) return;
    if (panner.panningModel !== panModelo()) panner.panningModel = panModelo();
    const t = AC.currentTime;
    if (!quer) { if (bgain.gain.value > .0002) bgain.gain.setTargetAtTime(0, t, .3); return; }
    const cam = C.camera.position, dx = M.pos.x - cam.x, dz = M.pos.z - cam.z, d = Math.hypot(dx, dz);
    pos3(panner, M.pos.x, 1.6, M.pos.z);
    const taxa = caca ? .62 : (M.state === 'procura' || M.state === 'investiga' ? .4 : .25);
    fase = (fase + dt * taxa) % 1;
    const env = Math.pow(Math.max(0, Math.sin(fase * Math.PI * 2)), 2); // inala/exala
    const prox = clamp(1 - d / (caca ? 16 : 10), 0, 1);
    respVol = (caca ? .17 : .09) * prox * clamp(O.respVol == null ? 1 : +O.respVol, 0, 1.5);
    bgain.gain.setTargetAtTime(respVol * (.2 + env * .95), t, .05);
    if (O.respEstalos) {
      creakT -= dt;
      if (creakT <= 0 && d < 8) {
        creakT = 1.3 + Math.random() * 3.2 * (caca ? .5 : 1);
        cgain.gain.cancelScheduledValues(t); cgain.gain.setValueAtTime(.0001, t);
        cgain.gain.linearRampToValueAtTime(.085 * prox, t + .012); cgain.gain.exponentialRampToValueAtTime(.0001, t + .1);
      }
    }
    if (O.legSom && (caca || d < 6)) U.legenda('respInsp', 'a respiração dele', { x: M.pos.x, z: M.pos.z }, 5);
  }
  // botão "Ouvir a respiração": uma demonstração dando a volta na cabeça
  function ouvirResp() {
    try { if (C.iniciarAudio) C.iniciarAudio(); } catch (e) {}
    if (!temAC()) { C.toast('O som ainda não começou. Clique na tela primeiro.'); return; }
    try {
      const ac = C.AC, L = ac.listener;
      const lx = L.positionX ? L.positionX.value : 0, ly = L.positionY ? L.positionY.value : 1.6, lz = L.positionZ ? L.positionZ.value : 0;
      const buf = ac.createBuffer(1, Math.floor(ac.sampleRate), ac.sampleRate), d = buf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      const src = ac.createBufferSource(); src.buffer = buf; src.loop = true;
      const bf = ac.createBiquadFilter(); bf.type = 'bandpass'; bf.frequency.value = 470; bf.Q.value = .8;
      const g = ac.createGain(); g.gain.value = 0;
      const p = ac.createPanner(); p.panningModel = panModelo(); p.distanceModel = 'inverse'; p.refDistance = 1.6;
      src.connect(bf); bf.connect(g); g.connect(p); p.connect(C.master);
      src.start();
      const ini = performance.now(); let ph = 0, raf = 0;
      const passo = () => {
        const dt = .016, el = (performance.now() - ini) / 1000;
        if (el > 4) { g.gain.setTargetAtTime(0, ac.currentTime, .1); setTimeout(() => { try { src.stop(); src.disconnect(); } catch (e) {} }, 300); return; }
        const a = el / 4 * Math.PI * 2;
        pos3(p, lx + Math.sin(a) * 2.2, ly, lz + Math.cos(a) * 2.2);
        ph = (ph + dt * .5) % 1; const env = Math.pow(Math.max(0, Math.sin(ph * Math.PI * 2)), 2);
        g.gain.setTargetAtTime(.14 * (.2 + env), ac.currentTime, .05);
        raf = requestAnimationFrame(passo);
      };
      passo();
      C.toast('Feche os olhos: a respiração dá a volta na sua cabeça (melhor de fone).');
    } catch (e) {}
  }

  // ===================================================================
  // 2. NÉVOA DE DIREÇÃO NA CAÇADA (acessibilidade): quando ele caça fora da sua vista,
  //    a borda avermelhada aponta de que lado ele está. Desligada por padrão; nunca no Pesadelo.
  // ===================================================================
  function corNevoa() { return O.dalt === 'tritan' ? '255,80,150' : '150,20,18'; }
  function nevoaFrame() {
    const el = $('#pl5-nevoa'); if (!el) return;
    const M = C.M, S = C.S;
    const on = O.nevoaDir && emJogo() && S && S.dif !== 'pesadelo' && M && M.ativo && (M.state === 'caca' || M.state === 'bote');
    if (!on) { if (el.className) el.className = ''; return; }
    const cam = C.camera.position, d = Math.hypot(M.pos.x - cam.x, M.pos.z - cam.z), dist = clamp(+O.nevoaDist || 6, 3, 9);
    if (d > dist) { if (el.className) el.className = ''; return; }
    const a = U.direcao(M.pos.x, M.pos.z), g = Math.abs(a);
    if (g < Math.PI * .33) { if (el.className) el.className = ''; return; } // já está no seu campo de visão
    const lado = g > Math.PI * .75 ? 'baixo' : a > 0 ? 'dir' : 'esq';
    el.style.setProperty('--nc', corNevoa());
    el.style.setProperty('--f', clamp(1 - d / dist, .15, 1).toFixed(2));
    const cls = 'n-' + lado + (menosMov ? ' estatica' : '');
    if (el.className !== cls) el.className = cls;
    // um tranco leve de vibração do lado dele, para quem joga de vibração e não ouve
    if (O.vibMundo && performance.now() - nevVib > 1400) { nevVib = performance.now(); U.vibrar(.12 + (1 - d / dist) * .12, .08, 50); }
  }
  let nevVib = 0;

  // ===================================================================
  // 3. LEGENDAS DE ESTADO (acessibilidade para quem não ouve): avisos de texto para o que o som já diz
  // ===================================================================
  const prev = { caca: false, ana: false, proc: false, procA: false, vasc: false, cham: false, esc: false, bat: 100 };
  function perigoVibra() { if (O.vibMundo) U.vibrar(.3, .2, 80); } // um tranco de aviso para quem joga de vibração
  function capFrame() {
    if (!(O.legSom && O.capEstado) || !emJogo()) return;
    const S = C.S, P = C.P, M = C.M, so = !!O.capSoPerigo; // so = só as de perigo
    const caca = !!(M && M.ativo && (M.state === 'caca' || M.state === 'bote'));
    if (caca && !prev.caca) { U.legenda('caca-ini', 'o Inspetor começou a caçar', null, 1); perigoVibra(); }
    else if (!caca && prev.caca && M && M.ativo) U.legenda('caca-fim', 'ele parou de caçar', null, 1);
    prev.caca = caca;
    if (caca) { const a = U.direcao(M.pos.x, M.pos.z), d = Math.hypot(M.pos.x - C.P.pos.x, M.pos.z - C.P.pos.z); if (d < 2.6 && Math.abs(a) > Math.PI * .6) U.legenda('atras-ins', 'ele está bem atrás de você', null, 2); }
    const esc = !!(M && M.ativo && (M.state === 'alerta' || M.state === 'escuta')); if (esc && !prev.esc) U.legenda('escuta', 'ele parou para escutar', null, 1); prev.esc = esc;
    const vasc = !!(M && M.state === 'vasculha'); if (vasc && !prev.vasc) U.legenda('vasc', 'ele vasculha o armário', null, 1); prev.vasc = vasc;
    const ana = !!(C.ANA && C.ANA.ativa); if (ana && !prev.ana) U.legenda('ana-ap', 'a menina apareceu', null, 1); prev.ana = ana;
    const procA = !!(C.PROC && C.PROC.fase === 'aviso'); if (procA && !prev.procA) { U.legenda('proc-a', 'a Procissão está vindo (luzes piscando)', null, 1); perigoVibra(); } prev.procA = procA;
    const proc = !!(C.PROC && C.PROC.fase === 'passando'); if (proc && !prev.proc) U.legenda('proc-p', 'a Procissão está passando', null, 1); prev.proc = proc;
    const cham = !!C.chamado; if (cham && !prev.cham) U.legenda('chamado', 'alguém chama de outra sala', null, 1); prev.cham = cham;
    if (prev.bat > 0 && S.battery <= 0) U.legenda('pilha0', 'a lanterna apagou', null, 1); prev.bat = S.battery;
    if (prev.hp != null && S.health < prev.hp - 8) U.legenda('golpe', 'você levou um golpe', null, 1); prev.hp = S.health;
    if (!so) {
      if (S.fear > 88) U.legenda('coracao', 'coração disparado', null, 6);
      if (P.semAr) U.legenda('semar', 'sem fôlego', null, 4);
      const mov = C.keys.KeyW || C.keys.KeyS || C.keys.KeyA || C.keys.KeyD;
      if (P.naAgua && mov) U.legenda('agua', 'passos na água', { x: P.pos.x, z: P.pos.z }, 3);
    }
    if (S.battery < 10 && S.flashOn) U.legenda('pilha-f', 'a lanterna fraqueja', null, 6);
  }

  // ===================================================================
  // 4. CONFORTO E DESEMPENHO que o motor lê ao vivo (classes e camadas)
  // ===================================================================
  let descT = 0;
  function vivoFrame(dt) {
    document.body.classList.toggle('pl5-mira-caca', !!(O.miraCaca && emJogo() && C.M && C.M.ativo && C.M.state === 'caca'));
    if (O.semChuva && C.chuvaGeo && C.chuvaGeo.drawRange && C.chuvaGeo.drawRange.count !== 0) C.chuvaGeo.setDrawRange(0, 0);
    if (O.semSombra && C.flash && C.flash.castShadow) C.flash.castShadow = false;
    if (O.descanso && emJogo()) { descT += dt; if (descT >= 2400) { descT = 0; C.toast('Você está nisso há um bom tempo. Respira, pisca, talvez uma pausa. O internato espera.'); } }
    else if (!O.descanso) descT = 0;
  }

  // ===================================================================
  // 4b. VIBRAÇÃO POR ENTIDADE (estende o sistema de vibração do lote 3):
  //    cada entidade tem um envelope de haptic próprio, para você sentir QUEM
  //    está perto sem olhar a tela. Inspetor = pulso grave e lento (duplo baque);
  //    Ana = estalidos curtos e nervosos; Procissão = uma onda que cresce.
  //    Respeita o volume geral, "vibrar só em perigo" e a opção. Opt-in pela caixa.
  // ===================================================================
  let hInsp = 0, hAna = 0, hProc = 0, procRamp = 0;
  const vfAtual = () => clamp(O.vibForca == null ? 1 : +O.vibForca, 0, 1.5);
  function hapFrame(dt) {
    if (!O.hapEntidade || !O.vibrar || robo || !emJogo()) return;
    const S = C.S; if (!S || S.dead || S.fim) return;
    if (vfAtual() <= 0) return;
    const cam = C.camera.position, M = C.M;
    // --- Inspetor: pulso grave, lento e pesado; acelera e sobe de intensidade na caçada ---
    if (M && M.ativo) {
      const caca = (M.state === 'caca' || M.state === 'bote' || M.state === 'alerta');
      const alc = caca ? 9 : 7;
      const d = Math.hypot(M.pos.x - cam.x, M.pos.z - cam.z);
      const mostra = d < alc && (caca || !O.hapSoCaca) && !(O.vibSoPerigo && !caca);
      if (mostra) {
        hInsp -= dt;
        if (hInsp <= 0) {
          hInsp = caca ? .95 : 1.8;
          const prox = clamp(1 - d / alc, .12, 1);
          const forte = (caca ? .55 : .3) * prox, fraco = (caca ? .12 : .06) * prox;
          U.vibrar(forte, fraco, caca ? 200 : 170);
          // segundo baque, menor: o passo pesado que arrasta atrás do primeiro
          setTimeout(() => { if (O.hapEntidade && O.vibrar) U.vibrar(forte * .5, fraco * .4, 90); }, caca ? 150 : 190);
        }
      } else if (hInsp < .3) hInsp = .3;
    }
    // --- Ana: estalidos curtos e agudos enquanto a menina está por perto (tensão, não dano) ---
    const A = C.ANA;
    if (A && A.ativa && A.pos) {
      const d = Math.hypot(A.pos.x - cam.x, A.pos.z - cam.z);
      if (d < 11) {
        hAna -= dt;
        if (hAna <= 0) {
          hAna = .42 + Math.random() * .2;
          const prox = clamp(1 - d / 11, .2, 1);
          U.vibrar(.08 * prox, .5 * prox, 26); // estalo: grave fraco, agudo forte, curtíssimo
          if (Math.random() < .35) setTimeout(() => { if (O.hapEntidade && O.vibrar) U.vibrar(.06 * prox, .4 * prox, 22); }, 70);
        }
      }
    }
    // --- Procissão: uma onda que cresce no aviso e na passagem, como maré que se aproxima ---
    const PR = C.PROC;
    if (PR && (PR.fase === 'aviso' || PR.fase === 'passando')) {
      procRamp = (procRamp + dt / 1.25) % 1; // sobe em ~1,25 s e recomeça
      hProc -= dt;
      if (hProc <= 0) {
        hProc = .16;
        const sub = procRamp; // 0 -> 1 crescendo
        U.vibrar(.1 + sub * .5, .05 + sub * .25, Math.round(60 + sub * 60));
      }
    } else procRamp = 0;
  }
  // demonstração dos três padrões em sequência, com legenda de quem é cada um
  function sentirPadroes() {
    if (!O.vibrar) { C.toast('Ligue a Vibração primeiro para sentir os padrões.'); return; }
    const salvo = O.hapEntidade; O.hapEntidade = true;
    U.vibrar(.5, .1, 200); setTimeout(() => { if (O.vibrar) U.vibrar(.25, .04, 90); }, 180);
    C.toast('Inspetor: pulso grave e lento, com um segundo baque atrás.');
    setTimeout(() => { for (let i = 0; i < 4; i++) setTimeout(() => { if (O.vibrar) U.vibrar(.08, .5, 26); }, i * 170); C.toast('Ana: estalidos curtos e nervosos.'); }, 1500);
    setTimeout(() => { for (let i = 0; i < 7; i++) setTimeout(() => { if (O.vibrar) U.vibrar(.1 + i / 7 * .5, .05 + i / 7 * .25, 60 + i * 10); }, i * 130); C.toast('Procissão: uma onda que cresce.'); }, 3200);
    setTimeout(() => { O.hapEntidade = salvo; }, 4600);
  }
  // um toque de teste da vibração geral, para quem só quer sentir a intensidade escolhida
  function testarVibra() {
    if (!O.vibrar) { C.toast('A Vibração está desligada.'); return; }
    if (vfAtual() <= 0) { C.toast('A intensidade da vibração está em zero.'); return; }
    U.vibrar(.7, .5, 260);
  }

  // ===================================================================
  // 5. INSTALAR O JOGO (PWA): o convite aparece no título quando o navegador oferece
  // ===================================================================
  let promptInstalar = null;
  addEventListener('beforeinstallprompt', e => {
    if (robo) return; e.preventDefault(); promptInstalar = e;
    const menu = $('#title .menu'); if (!menu || $('#pl5-instalar')) return;
    const b = document.createElement('button'); b.className = 'btn'; b.id = 'pl5-instalar'; b.textContent = 'Instalar o jogo';
    menu.appendChild(b);
    b.onclick = async () => { if (!promptInstalar) return; promptInstalar.prompt(); try { await promptInstalar.userChoice; } catch (er) {} promptInstalar = null; b.remove(); };
  });
  addEventListener('appinstalled', () => { const b = $('#pl5-instalar'); if (b) b.remove(); try { C.toast('Jogo instalado. Dá para abrir direto da tela inicial, sem internet.'); } catch (e) {} });

  // título: anuncia os recursos de acessibilidade (descoberta)
  function blurbTitulo() {
    const t = $('#title'); if (!t || $('#pl5-acess')) return;
    const d = document.createElement('div'); d.id = 'pl5-acess'; d.className = 'ctrl';
    d.textContent = 'Acessível: legendas de som e de estado · daltonismo · alto contraste · teclas, controle e toque · soltar do agarrão por segurar · névoa de direção na caçada · vibração por entidade';
    const ult = t.querySelector('.ctrl:last-of-type'); if (ult) ult.after(d); else t.appendChild(d);
  }

  // ===================================================================
  // 6. DESEMPENHO: nome da placa de vídeo e medidor rápido
  // ===================================================================
  function gpuNome() {
    try { const gl = C.renderer.getContext(), ext = gl.getExtension('WEBGL_debug_renderer_info'); return String(gl.getParameter(ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER) || '').slice(0, 80); } catch (e) { return ''; }
  }
  function medirAgora() {
    let n = 0, soma = 0, ult = 0;
    const f = t => { if (ult) { soma += t - ult; n++; } ult = t; if (n < 45) requestAnimationFrame(f); else { const ms = soma / n; C.toast('Desempenho: ' + Math.round(1000 / ms) + ' quadros por segundo (' + ms.toFixed(1) + ' ms por quadro · qualidade ' + qual() + ').'); } };
    requestAnimationFrame(f);
  }

  // ===================================================================
  // OPÇÕES: a seção extra com os botões (as caixas e barras já entram pela lista de src/plataforma.js)
  // ===================================================================
  function montarOpcoes(wrap) {
    if (!wrap || $('#pl5-extra')) return;
    const sec = document.createElement('div'); sec.id = 'pl5-extra';
    sec.innerHTML = '<h3>Som 3D e desempenho</h3><p class="pl-nota">A respiração do Inspetor sai de onde ele está. Melhor de fone.</p><div class="op-bts"><button class="btn" id="pl5-ouvir">Ouvir a respiração</button><button class="btn" id="pl5-medir">Medir desempenho</button></div><p class="pl-nota">Vibração por entidade: o Inspetor é um pulso grave e lento, a Ana são estalidos curtos, a Procissão é uma onda que cresce.</p><div class="op-bts"><button class="btn" id="pl5-haptic">Sentir cada um</button><button class="btn" id="pl5-vibtest">Testar a vibração</button></div><div class="pl-nota" id="pl5-gpu"></div>';
    const fim = wrap.querySelector(':scope > .op-bts'); if (fim) wrap.insertBefore(sec, fim); else wrap.appendChild(sec);
    $('#pl5-ouvir').onclick = ouvirResp; $('#pl5-medir').onclick = medirAgora;
    $('#pl5-haptic').onclick = sentirPadroes; $('#pl5-vibtest').onclick = testarVibra;
    const g = $('#pl5-gpu'), nome = gpuNome(); if (g) g.textContent = nome ? ('Placa de vídeo: ' + nome) : '';
  }
  function aplicarClasses() {
    const b = document.body;
    b.classList.toggle('pl5-contraste', !!O.contraste);
    b.classList.toggle('pl5-legcaixa', !!O.legSomCaixa);
    b.classList.toggle('pl5-semgrao', !!O.semGrao);
    b.classList.toggle('pl5-vinheta-fraca', !!O.vinhetaFraca);
    b.classList.toggle('pl5-verm-fraco', !!O.vermFraco);
    b.classList.remove('pl5-legsom-p', 'pl5-legsom-g'); if (O.legSomTam === 'p') b.classList.add('pl5-legsom-p'); else if (O.legSomTam === 'g') b.classList.add('pl5-legsom-g');
  }
  function opcoes(id) {
    if (!id || ['contraste', 'legSomCaixa', 'legSomTam', 'semGrao', 'vinhetaFraca', 'vermFraco'].includes(id)) aplicarClasses();
    // desligou a chuva/sombra/grão? recoloca no estado da qualidade atual
    if ((id === 'semChuva' && !O.semChuva) || (id === 'semSombra' && !O.semSombra) || (id === 'semGrao' && !O.semGrao)) { try { U.aplicarQual(); } catch (e) {} }
  }

  // ===================================================================
  // INSTALAÇÃO
  // ===================================================================
  // os elementos próprios do HUD/título
  if (!$('#pl5-nevoa')) { const n = document.createElement('div'); n.id = 'pl5-nevoa'; document.body.appendChild(n); }
  aplicarClasses(); blurbTitulo();

  let acc = 0;
  const hz = () => { const q = qual(); return q === 'minima' ? 10 : q === 'baixa' ? 15 : 60; };

  return {
    montarOpcoes, opcoes,
    antes(dt) {
      // soltar do agarrão segurando o botão (acessibilidade para motricidade reduzida)
      if (O.soltar === 'segurar' && C.M && C.M.state === 'agarra' && emJogo() && C.AG && C.keys.KeyE) C.AG.sacode += 1700 * dt;
    },
    depois(dt, ativo) {
      // camadas pesadas (áudio 3D e névoa) em passo reduzido na Baixa/Mínima; o resto é barato e roda sempre
      acc += dt; const per = 1 / hz();
      if (acc >= per) { respFrame(acc); nevoaFrame(); acc = 0; }
      capFrame(); vivoFrame(dt); hapFrame(dt);
    },
    mapa() { creakT = 2; },
    // para testes
    teste: { get montado() { return montado; }, respFrame, nevoaFrame, gpuNome, panModelo, ouvirResp, hapFrame, sentirPadroes, testarVibra }
  };
}
