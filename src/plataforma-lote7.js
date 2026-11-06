// A HORA DO SILÊNCIO — Plataforma e acessibilidade, lote 7: SOM E ATMOSFERA NA PLATAFORMA.
// O som certo para cada aparelho: perfil de saída (fone, fone sem fio, caixa de notebook, celular), assistente de
// calibragem (audibilidade, fone, sincronia imagem-som, graves), graves virtuais e EQ de presença para caixinha,
// compressão do celular, teto de vozes por aparelho, áudio leve que se liga sozinho quando o áudio engasga,
// pulso de tensão no controle e no celular, "só o mundo, sem trilha", clipe do susto (opt-in) e medidor de saída.
// Instalado por src/plataforma.js (instalarPlat7). Ligado ao motor por PLAT.somAjuste (fim de aplicarVolumes),
// PLAT.audioOpcoes (AudioContext), PLAT.atraso (relâmpago e tremor) e PLAT.aquecerSom. Tudo em try/catch,
// silenciado no QA (navigator.webdriver): nunca toca no caminho obrigatório nem no T.tudo().

const $ = s => document.querySelector(s);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

const PERFIS = {
  fone: { nome: 'Fone com fio', saida: 'normal', fone: true },
  bt: { nome: 'Fone sem fio (Bluetooth)', saida: 'normal', fone: true },
  notebook: { nome: 'Caixa do notebook ou do computador', saida: 'notebook', fone: false },
  celular: { nome: 'Alto-falante do celular', saida: 'celular', fone: false }
};
// amplitudes dos 6 níveis do teste de audibilidade (cada um metade do anterior)
const NIVEIS = [.30, .15, .075, .0375, .019, .0095];

const CSS = `
#p7-cal{position:fixed;inset:0;z-index:240;background:rgba(0,0,0,.93);display:flex;align-items:center;justify-content:center;padding:16px;overflow:auto}
#p7-cal .p7-caixa{max-width:560px;width:100%;border:1px solid #4a3d33;background:#0c0908;padding:22px 24px;text-align:center;font-family:"IM Fell English",Georgia,serif;color:#cfc3a6}
#p7-cal h2{font-family:"IM Fell English SC",serif;font-weight:400;letter-spacing:.1em;font-size:22px;margin-bottom:10px}
#p7-cal p{line-height:1.5;margin:8px 0;font-size:16px}
#p7-cal .p7-acoes{display:flex;flex-wrap:wrap;gap:10px;justify-content:center;margin-top:14px}
#p7-cal .p7-passo{font-size:12px;letter-spacing:.14em;color:#857a63;text-transform:uppercase}
#p7-cal input[type=range]{width:min(100%,360px)}
#p7-cal .p7-res{min-height:1.6em;color:#c9a75a;font-size:15px}
.p7-med{height:8px;border:1px solid #3a3228;background:#080605;margin:10px auto;max-width:360px;position:relative;overflow:hidden}
.p7-med i{position:absolute;left:0;top:0;bottom:0;width:0;background:#7a6236;transition:width .08s linear}
#p7-flash{width:120px;height:44px;margin:12px auto;border:1px solid #3a3228;background:#050403}
#p7-flash.on{background:#e8dcc0}
#p7-flash.on.suave{background:#5c5240}
#p7-op small{display:block;opacity:.65;font-size:12px;margin:2px 0 6px}
#p7-op select{background:#151110;color:inherit;border:1px solid #4a3d33;font:inherit;padding:3px 6px}
#p7-op .p7-status{font-family:"IM Fell English SC",serif;font-size:13px;letter-spacing:.05em;color:#c9a75a}
#p7-clipe{margin-left:6px}
@media (prefers-reduced-motion:reduce){.p7-med i{transition:none}}
@media (max-width:520px){#p7-cal .p7-caixa{padding:16px 14px}#p7-cal h2{font-size:19px}}
`;

export function instalarPlat7(C, U) {
  const { O } = U;
  const robo = U.robo || !!window.__teste || !!navigator.webdriver;
  const salvar = U.salvar || (() => {});
  const OPT = C.OPT;
  for (const [k, v] of Object.entries({ somPerfil: '', somCal: '', audBoost: 0, gravesVirt: 1, presenca: 1, latMs: 0, latModo: 'auto', audioLeve: 'auto', semTrilha: false, hapTema: true, clip7: false })) if (O[k] === undefined) O[k] = v;
  const st = document.createElement('style'); st.textContent = CSS; document.head.appendChild(st);

  const ac = () => C.AC;
  const fraco = () => O.qual === 'baixa' || O.qual === 'minima';
  const celular = () => (OPT.saidaSom || 'normal') === 'celular';

  // ===================================================================
  // 1. GRAFO DE SAÍDA: EQ de presença, compressor do celular e ganho da calibragem entram entre o perfil e a saída
  // ===================================================================
  let ligado = false, pk2 = null, cmp2 = null, cal = null, analis = null, limBase = 24, leve = false, motivoLeve = '', cheap = null;
  const rotuloDispositivo = () => celular() ? 'celular' : (OPT.saidaSom === 'notebook' ? 'notebook' : (O.fone ? 'fone' : 'caixa'));

  function montarGrafo() {
    const A = C.AUD, AC = ac();
    if (ligado || !AC || !A || !A.pk || !A.entrada) return;
    try {
      pk2 = AC.createBiquadFilter(); pk2.type = 'peaking'; pk2.frequency.value = 900; pk2.Q.value = .7; pk2.gain.value = 0;
      cmp2 = AC.createDynamicsCompressor(); cmp2.threshold.value = 0; cmp2.knee.value = 0; cmp2.ratio.value = 1; cmp2.attack.value = .005; cmp2.release.value = .2;
      cal = AC.createGain(); cal.gain.value = 1;
      A.pk.disconnect(A.entrada); A.pk.connect(pk2); pk2.connect(cmp2); cmp2.connect(cal); cal.connect(A.entrada);
      if (A.exc) { A.exc.disconnect(A.entrada); A.exc.connect(cal); } // os harmônicos do grave também passam pelo ganho da calibragem
      analis = AC.createAnalyser(); analis.fftSize = 256; analis.smoothingTimeConstant = .3; A.entrada.connect(analis);
      // teto de vozes por aparelho: o motor continua escrevendo AUD.limVoz, o valor lido já vem com o limite do aparelho
      limBase = A.limVoz || 24;
      Object.defineProperty(A, 'limVoz', { configurable: true, get: limiteVozes, set: v => { limBase = v; } });
      ligado = true;
    } catch (e) { ligado = false; console.warn("som: grafo do lote 7 não montou", e); }
  }
  function limiteVozes() {
    let v = limBase;
    if (celular()) v = Math.min(v, 12); // celular: metade das vozes do PC
    if (leve) v = Math.min(v, 8);
    return v;
  }
  // chamado no fim de aplicarVolumes() do motor (idempotente)
  function ajuste() {
    const A = C.AUD, AC = ac(); if (!AC || !A) return;
    montarGrafo(); if (!ligado) return;
    const t = AC.currentTime, pf = OPT.saidaSom || 'normal';
    // graves virtuais: harmônicos 2x e 3x do grave (fundamental ausente) para caixinha de notebook e de celular
    const baseG = pf === 'notebook' ? .38 : pf === 'celular' ? .24 : (!O.fone ? .12 : 0);
    if (A.exc) A.exc.gain.setTargetAtTime(baseG * clamp(+O.gravesVirt, 0, 2), t, .05);
    // presença de voz (médios) para quem não tem fone; compressão forte no celular
    pk2.gain.setTargetAtTime((pf === 'celular' ? 3.5 : pf === 'notebook' ? 2 : 0) * clamp(+O.presenca, 0, 2), t, .05);
    if (pf === 'celular') { cmp2.threshold.setTargetAtTime(-20, t, .05); cmp2.knee.setTargetAtTime(10, t, .05); cmp2.ratio.setTargetAtTime(4, t, .05); }
    else { cmp2.threshold.setTargetAtTime(0, t, .05); cmp2.knee.setTargetAtTime(0, t, .05); cmp2.ratio.setTargetAtTime(1, t, .05); }
    // calibragem de audibilidade: ganho que sobe os passos distantes acima do limiar de quem ouve baixo
    cal.gain.setTargetAtTime(emTeste ? 1 : Math.pow(10, clamp(+O.audBoost || 0, 0, 12) / 20), t, .1);
    // reverb menor onde o alto-falante é pequeno (a cauda embola); infrassom suavizado ou cortado para quem prefere
    if (A.revIn) A.revIn.gain.setTargetAtTime(pf === 'celular' ? .55 : pf === 'notebook' ? .8 : 1, t, .1);
    const corte = O.infra === 'cortado' ? 80 : O.infra === 'suave' ? 40 : 0;
    if (A.hp) A.hp.frequency.setTargetAtTime(Math.max(corte, pf === 'celular' ? 180 : pf === 'notebook' ? 110 : 10), t, .05);
    // só o mundo, sem trilha
    if (O.semTrilha && C.BUS && C.BUS.mus) { C.BUS.mus.gain.setTargetAtTime(0, t, .05); if (C.BUS.musR) C.BUS.musR.gain.setTargetAtTime(0, t, .05); }
    camadas();
  }
  // camadas contínuas da trilha (osciladores que giram o tempo todo): fora do grafo, nem custam CPU
  const fora = new Set();
  function camadas() {
    const amb = C.AMB, bus = C.BUS && C.BUS.amb; if (!amb || !bus) return;
    const querFora = O.semTrilha ? ['cordas', 'violino', 'cluster', 'caca'] : (leve ? ['cordas', 'cluster'] : []);
    for (const k of ['cordas', 'violino', 'cluster', 'caca']) {
      const g = amb[k]; if (!g || !g.disconnect) continue;
      const off = querFora.includes(k);
      try { if (off && !fora.has(k)) { g.disconnect(bus); fora.add(k); } else if (!off && fora.has(k)) { g.connect(bus); fora.delete(k); } } catch (e) {}
    }
  }

  // ===================================================================
  // 2. ÁUDIO LEVE: reverb sem convolução, menos vozes. Liga sozinho quando o áudio engasga
  // ===================================================================
  function reverbBarato(on) {
    const A = C.AUD, AC = ac(); if (!A || !A.revIn || !A.rev || !AC) return;
    try {
      if (on && !cheap) {
        const saida = AC.createGain(); saida.gain.value = .5; saida.connect(A.vacuo);
        const atrasos = [.037, .061].map(tm => { const d = AC.createDelay(.5); d.delayTime.value = tm; const lp = AC.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 1800; const fb = AC.createGain(); fb.gain.value = .38; A.revIn.connect(d); d.connect(lp); lp.connect(fb); fb.connect(d); lp.connect(saida); return d; });
        for (const k of ['p', 'g', 't']) try { A.revIn.disconnect(A.rev[k]); } catch (e) {}
        cheap = { saida, atrasos };
      } else if (!on && cheap) {
        for (const d of cheap.atrasos) try { A.revIn.disconnect(d); d.disconnect(); } catch (e) {}
        try { cheap.saida.disconnect(); } catch (e) {}
        for (const k of ['p', 'g', 't']) try { A.revIn.connect(A.rev[k]); } catch (e) {}
        cheap = null;
      }
    } catch (e) {}
  }
  function aplicarLeve(on, motivo) {
    if (on === leve) { if (on) motivoLeve = motivo || motivoLeve; return; }
    leve = on; motivoLeve = on ? (motivo || '') : '';
    reverbBarato(on); camadas(); atualizarTextos();
  }
  function decidirLeve() {
    if (O.audioLeve === 'ligado') return aplicarLeve(true, 'ligado por você');
    if (O.audioLeve === 'desligado') return aplicarLeve(false);
    if (O.qual === 'minima') return aplicarLeve(true, 'qualidade Mínima');
    if (modesto) return aplicarLeve(true, 'aparelho modesto');
    if (bateriaBaixa) return aplicarLeve(true, 'bateria baixa');
  }
  // aparelho modesto (pouca memória, poucos núcleos, economia de dados) e bateria no fim ligam o áudio leve sozinhos
  const modesto = (navigator.deviceMemory || 8) <= 2 || (navigator.hardwareConcurrency || 8) <= 2 || !!(navigator.connection && navigator.connection.saveData);
  let bateriaBaixa = false;
  if (!robo && navigator.getBattery) navigator.getBattery().then(bt => { const ver = () => { const b = !bt.charging && bt.level <= .15; if (b !== bateriaBaixa) { bateriaBaixa = b; decidirLeve(); if (!b && leve && motivoLeve === 'bateria baixa') aplicarLeve(false); } }; ver(); bt.addEventListener('levelchange', ver); bt.addEventListener('chargingchange', ver); }).catch(() => {});
  // monitor de quadros e do relógio do áudio
  let ult = 0, lentoAcc = 0, janela = 0, bomT = 0, a0 = null, w0 = 0, falhas = [], tFalha = 0;
  function monitorar(dt, agora) {
    if (robo || !ac()) return;
    if (O.audioLeve === 'ligado' || O.audioLeve === 'desligado' || O.qual === 'minima' || modesto || bateriaBaixa) { decidirLeve(); return; }
    const delta = ult ? agora - ult : 16; ult = agora;
    if (delta > 400 || document.hidden || C.mode !== 'jogo') { lentoAcc = 0; janela = 0; return; }
    janela += delta; if (delta > 33.4) lentoAcc += delta;
    // relógio do áudio: se anda mais devagar que o da página, o buffer estourou
    const A = ac();
    if (A.state === 'running' && !C.ui) {
      if (a0 === null) { a0 = A.currentTime; w0 = agora; }
      else if (agora - w0 >= 1000) {
        const dw = (agora - w0) / 1000, da = A.currentTime - a0; a0 = A.currentTime; w0 = agora;
        if (dw < 1.6 && da < dw - .12) { falhas.push(agora); tFalha = agora; }
      }
    } else a0 = null;
    falhas = falhas.filter(t => agora - t < 10000);
    if (janela >= 5000) { // mais de 40% do tempo em quadros lentos nos últimos 5 s = abaixo de 30 qps
      const lento = lentoAcc / janela > .4; janela = 0; lentoAcc = 0;
      if (lento) { bomT = 0; if (!leve) aplicarLeve(true, 'quadros abaixo de 30 por segundo'); } else bomT += 5;
    }
    if (falhas.length > 2 && !leve) aplicarLeve(true, 'o relógio do áudio atrasou');
    if (leve && motivoLeve !== 'ligado por você' && bomT >= 40 && falhas.length === 0 && agora - tFalha > 40000) aplicarLeve(false); // carga caiu: tudo volta
  }

  // ===================================================================
  // 3. SINCRONIA IMAGEM-SOM (fone sem fio): atrasa relâmpago e tremor de câmera
  // ===================================================================
  const filas = {};
  let latCache = 0, latT = 0;
  function latencia() {
    if (O.latModo === 'zero') return 0;
    if (O.latModo === 'manual') return clamp(+O.latMs || 0, 0, 400);
    const agora = performance.now(); if (agora - latT < 1000) return latCache; latT = agora;
    const A = ac(); let ms = 0;
    try { ms = ((A && A.outputLatency) || 0) * 1000 + ((A && A.baseLatency) || 0) * 1000; } catch (e) {}
    if (ms <= 120) ms = O.somPerfil === 'bt' ? Math.max(ms, 160) : 0; // o Chrome costuma informar zero em fone sem fio
    return latCache = clamp(ms, 0, 300);
  }
  function atraso(k, v) {
    const L = latencia();
    if (L <= 0) { if (filas[k] && filas[k].length) filas[k].length = 0; return v; }
    const q = filas[k] || (filas[k] = []), t = performance.now(); q.push(t, v);
    const alvo = t - L; while (q.length > 2 && q[2] <= alvo) q.splice(0, 2);
    if (q.length > 240) q.splice(0, q.length - 240);
    return q[1];
  }

  // ===================================================================
  // 4. PERFIL, TESTES SONOROS E ASSISTENTE DE CALIBRAGEM
  // ===================================================================
  let emTeste = false, ruidoB = null, somPendente = false;
  function setSaida(v) {
    OPT.saidaSom = v;
    const el = $('#o-saidaSom'); if (el) { el.value = v; el.dispatchEvent(new Event('input', { bubbles: true })); el.dispatchEvent(new Event('change', { bubbles: true })); }
    try { localStorage.setItem('hora-silencio-opt', JSON.stringify(OPT)); } catch (e) {}
    try { ajuste(); } catch (e) {}
  }
  function definirPerfil(id) {
    const p = PERFIS[id]; if (!p) return;
    O.somPerfil = id; O.fone = p.fone; salvar();
    setSaida(p.saida);
    try { if (U.syncOpcoes) U.syncOpcoes(); } catch (e) {}
    ajuste(); atualizarTextos();
  }
  function audio() { if (!C.AC) { try { C.iniciarAudio(); } catch (e) {} } const A = ac(); if (A && A.state === 'suspended') A.resume(); return A; }
  const destino = () => C.master || ac().destination;
  function buf() { const A = ac(); if (!ruidoB) { ruidoB = A.createBuffer(1, Math.floor(A.sampleRate * 1.5), A.sampleRate); const d = ruidoB.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; } return ruidoB; }
  function tom(f, dur, amp, q = 0, saida) { const A = ac(), t = A.currentTime + q + .02, o = A.createOscillator(), g = A.createGain(); o.type = 'sine'; o.frequency.value = f; g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(amp, t + .06); g.gain.linearRampToValueAtTime(0, t + dur); o.connect(g); g.connect(saida || destino()); o.start(t); o.stop(t + dur + .05); }
  function ruido(dur, tipo, f, amp, q = 0, ataque = .01, saida) { const A = ac(), t = A.currentTime + q + .02, s = A.createBufferSource(), fl = A.createBiquadFilter(), g = A.createGain(); s.buffer = buf(); fl.type = tipo; fl.frequency.value = f; fl.Q.value = .8; g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(amp, t + ataque); g.gain.exponentialRampToValueAtTime(.0001, t + dur); s.connect(fl); fl.connect(g); g.connect(saida || destino()); s.start(t); s.stop(t + dur + .05); }
  function passoSeco(amp, q = 0, saida) { ruido(.11, 'lowpass', 420, amp, q, .004, saida); tom(70, .1, amp * .8, q, saida); }
  function respiracao(amp, q = 0) { ruido(1.0, 'bandpass', 900, amp * .5, q, .45); }
  function clique(q = 0) { const A = ac(), t = A.currentTime + q, o = A.createOscillator(), g = A.createGain(); o.type = 'square'; o.frequency.value = 1500; g.gain.setValueAtTime(.18, t); g.gain.exponentialRampToValueAtTime(.0001, t + .05); o.connect(g); g.connect(destino()); o.start(t); o.stop(t + .08); return t; }
  function passoEm(x, z, q = 0) { // passo secos num ponto do espaço, com HRTF
    const A = ac(), p = A.createPanner(); p.panningModel = 'HRTF'; p.distanceModel = 'inverse'; p.refDistance = 1;
    try { p.positionX.value = x; p.positionY.value = 0; p.positionZ.value = z; } catch (e) { try { p.setPosition(x, 0, z); } catch (e2) {} }
    p.connect(destino());
    for (let i = 0; i < 3; i++) passoSeco(.5, q + i * .32, p);
  }

  let caixa = null, E = null, tTimers = [], medTimer = 0;
  const limpa = () => { tTimers.forEach(clearTimeout); tTimers = []; };
  const dep = (fn, ms) => { tTimers.push(setTimeout(fn, ms)); };
  function ordemPassos() { const l = ['perfil', 'ouvir']; if (O.fone) l.push('fone'); l.push('sinc', 'grave', 'fim'); return l; }

  function abrirAssistente(primeira) {
    if (!caixa) {
      caixa = document.createElement('div'); caixa.id = 'p7-cal'; caixa.hidden = true; caixa.setAttribute('role', 'dialog'); caixa.setAttribute('aria-modal', 'true'); caixa.setAttribute('aria-labelledby', 'p7-tit');
      document.body.appendChild(caixa);
      addEventListener('keydown', e => { if (!caixa.hidden && e.code === 'Escape') { e.preventDefault(); e.stopPropagation(); fechar(false); } }, true);
    }
    audio(); emTeste = true; ajuste();
    E = { i: 0, primeira: !!primeira, boost: +O.audBoost || 0 };
    caixa.hidden = false; passo();
    setTimeout(() => { const A = ac(); if (A && A.state !== 'running' && caixa && !caixa.hidden) { const r = $('#p7-res'); if (r) r.textContent = 'O navegador ainda não liberou o som. Toque em qualquer botão e tente de novo.'; } }, 700);
    if (document.pointerLockElement) try { document.exitPointerLock(); } catch (e) {}
  }
  function fechar(concluiu) {
    limpa(); emTeste = false; if (caixa) caixa.hidden = true;
    if (!O.somCal) { O.somCal = concluiu ? 'ok' : 'pulado'; salvar(); }
    ajuste(); atualizarTextos();
    const b = $('#b-novo'); if (b && C.mode === 'titulo') try { b.focus(); } catch (e) {}
  }
  function medidorHTML() { return '<div class="p7-med" aria-hidden="true"><i id="p7-med-i"></i></div>'; }
  function passo() {
    limpa();
    const ordem = ordemPassos(), id = ordem[Math.min(E.i, ordem.length - 1)], n = ordem.length;
    const tela = (tit, corpo, acoes) => {
      caixa.innerHTML = `<div class="p7-caixa"><div class="p7-passo">Calibrar o som · passo ${E.i + 1} de ${n}</div><h2 id="p7-tit">${tit}</h2>${corpo}<div class="p7-res" id="p7-res" aria-live="polite"></div>${medidorHTML()}<div class="p7-acoes">${acoes}</div></div>`;
      const b = caixa.querySelector('.p7-acoes .btn'); if (b) setTimeout(() => { try { b.focus(); } catch (e) {} }, 30);
    };
    const prox = () => { E.i++; passo(); };
    const pular = '<button class="btn" data-a="pular">Pular este passo</button><button class="btn" data-a="sair">Sair</button>';
    const lig = fn => caixa.querySelectorAll('[data-a]').forEach(b => b.onclick = () => { try { if (U.toque) U.vibrar(0, .4, 15); } catch (e) {} fn(b.dataset.a, b); }); // no celular, cada toque nos botões dá um tique na mão
    const res = t => { const r = $('#p7-res'); if (r) r.textContent = t; };
    if (id === 'perfil') {
      tela('Como você está ouvindo?', '<p>O jogo ajusta os graves, os médios e a espacialização para o seu aparelho. É a base de tudo o que vem depois.</p>',
        Object.entries(PERFIS).map(([k, p]) => `<button class="btn" data-a="${k}">${p.nome}${k === 'celular' && U.toque ? ' (sugerido)' : ''}</button>`).join('') + '<button class="btn" data-a="sair">Pular a calibragem</button>');
      lig(a => { if (a === 'sair') return fechar(false); definirPerfil(a); prox(); });
    } else if (id === 'ouvir') {
      tela('Você consegue ouvir?', '<p>Vão tocar um tom grave, um passo seco e uma respiração, cada vez mais baixos. Aperte <b>Não ouvi</b> quando eles sumirem.</p>',
        '<button class="btn" data-a="tocar">Começar</button>' + pular);
      lig(a => { if (a === 'pular') return prox(); if (a === 'sair') return fechar(false); if (a === 'tocar') return serie(); });
      const serie = () => {
        let nivel = 0, ouvindo = true;
        caixa.querySelector('.p7-acoes').innerHTML = '<button class="btn" data-a="nao">Não ouvi</button>';
        lig(a => { if (a === 'nao') { ouvindo = false; fim(Math.max(0, nivel - 1)); } });
        const fim = ouvidos => {
          limpa(); const alvo = 5; // o passo mais baixo que importa é o nível 5
          const db = clamp(6 * (alvo - ouvidos), 0, 12);
          E.boost = db; O.audBoost = db; salvar(); ajuste();
          res(ouvidos >= alvo ? 'Você ouve até os níveis mais baixos. Nenhum ajuste.' : `Ouviu até o nível ${ouvidos} de 6. Os passos distantes do Inspetor ganham +${db} dB para ficarem audíveis.`);
          caixa.querySelector('.p7-acoes').innerHTML = '<button class="btn" data-a="mais">Refazer</button><button class="btn" data-a="prox">Continuar</button>';
          lig(a => { if (a === 'mais') return passo(); prox(); });
        };
        const tocarNivel = () => {
          if (!ouvindo) return;
          if (nivel >= NIVEIS.length) return fim(NIVEIS.length);
          const a = NIVEIS[nivel]; nivel++;
          res(`Nível ${nivel} de ${NIVEIS.length}`);
          tom(110, .7, a, 0); passoSeco(a * 1.3, .9); respiracao(a * 1.2, 1.5);
          dep(tocarNivel, 3300);
        };
        tocarNivel();
      };
    } else if (id === 'fone') {
      tela('De onde vem o passo?', '<p>Um passo vai circular a sua cabeça. Diga de que lado ele veio. Três vezes.</p>', '<button class="btn" data-a="tocar">Tocar o primeiro</button>' + pular);
      let rodada = 0, acertos = 0, atual = null;
      const dirs = { esquerda: [-2, -.4], direita: [2, -.4], atras: [0, 2] };
      const jogar = () => { atual = ['esquerda', 'direita', 'atras'][Math.floor(Math.random() * 3)]; const [x, z] = dirs[atual]; passoEm(x, z); };
      lig(a => {
        if (a === 'pular') return prox(); if (a === 'sair') return fechar(false);
        if (a === 'tocar') { jogar(); caixa.querySelector('.p7-acoes').innerHTML = '<button class="btn" data-a="esquerda">Esquerda</button><button class="btn" data-a="atras">Atrás</button><button class="btn" data-a="direita">Direita</button><button class="btn" data-a="outra">Ouvir de novo</button>'; lig(responder); }
      });
      const responder = a => {
        if (a === 'outra') return jogar(); if (a === 'pular') return prox();
        rodada++; if (a === atual) acertos++;
        if (rodada < 3) { res(`${acertos} de ${rodada}. Mais um.`); setTimeout(jogar, 500); return; }
        const ok = acertos >= 2;
        res(ok ? `${acertos} de 3: o som espacial funciona para você.` : `${acertos} de 3: parece que o som não está chegando separado em cada ouvido. Passei para o som simples (sem HRTF); em caixa isso é o melhor.`);
        if (!ok) { O.fone = false; salvar(); try { U.syncOpcoes && U.syncOpcoes(); } catch (e) {} }
        caixa.querySelector('.p7-acoes').innerHTML = '<button class="btn" data-a="prox">Continuar</button>'; lig(prox);
      };
    } else if (id === 'sinc') {
      const sem = O.somPerfil === 'bt' ? 180 : (+O.latMs || 0);
      tela('Imagem e som juntos', `<p>Um quadrado acende a cada clique (uma vez por segundo, sem piscar rápido). Mexa no controle até o clarão e o clique chegarem <b>juntos</b>. Em fone sem fio o som costuma atrasar de 150 a 250 ms; os relâmpagos e os tremores do jogo esperam esse tempo.</p><p>O aparelho informa ${Math.round(((ac() && ac().outputLatency) || 0) * 1000 + ((ac() && ac().baseLatency) || 0) * 1000)} ms de latência de saída.</p><div id="p7-flash"></div><label>Atraso da imagem <input type="range" id="p7-w-lat" min="0" max="400" step="10" value="${sem}" aria-label="Atraso da imagem em milissegundos"> <output id="p7-w-lat-v">${sem} ms</output></label>`,
        '<button class="btn" data-a="auto">Usar a detecção automática</button><button class="btn" data-a="ok">Está sincronizado</button>' + pular);
      lig(a => { if (a === 'pular') return prox(); if (a === 'sair') return fechar(false); if (a === 'auto') { O.latModo = 'auto'; salvar(); res('Automática: o jogo lê a latência que o aparelho informa.'); return; } O.latModo = 'manual'; O.latMs = +$('#p7-w-lat').value; salvar(); res(`Guardado: ${O.latMs} ms.`); prox(); });
      const sl = $('#p7-w-lat'); sl.oninput = () => { $('#p7-w-lat-v').textContent = sl.value + ' ms'; };
      const bat = () => {
        const A = ac(); if (!A || caixa.hidden) return;
        const t = clique(.05), esperaMs = (t - A.currentTime) * 1000 + (+sl.value || 0);
        setTimeout(() => { const f = $('#p7-flash'); if (!f) return; f.classList.toggle('suave', !!OPT.vFlash); f.classList.add('on'); setTimeout(() => f.classList.remove('on'), 90); }, Math.max(0, esperaMs)); // com "reduzir flashes" ligado o clarão é fraco
        dep(bat, 1100);
      };
      bat();
    } else if (id === 'grave') {
      tela('O grave chega?', '<p>Primeiro um tom muito grave (55 Hz); depois o mesmo tom com os harmônicos que o jogo sintetiza para alto-falantes pequenos.</p>', '<button class="btn" data-a="tocar">Tocar os dois</button>' + pular);
      lig(a => {
        if (a === 'pular') return prox(); if (a === 'sair') return fechar(false);
        if (a === 'tocar') { tom(55, 1.2, .35); tom(55, 1.2, .28, 1.8); tom(110, 1.2, .2, 1.8); tom(165, 1.2, .12, 1.8); res('Tocando: primeiro o puro, depois o com harmônicos...'); dep(() => { caixa.querySelector('.p7-acoes').innerHTML = '<button class="btn" data-a="sim">Ouvi os dois</button><button class="btn" data-a="segundo">Só o segundo</button><button class="btn" data-a="nenhum">Quase nada</button>'; lig(r => { O.gravesVirt = r === 'sim' ? .6 : r === 'segundo' ? 1.4 : 2; salvar(); ajuste(); res(r === 'sim' ? 'Ótimo: graves virtuais discretos.' : r === 'segundo' ? 'Graves virtuais mais fortes: o aparelho não toca o grave real.' : 'Graves virtuais no máximo e presença de voz mais alta.'); if (r === 'nenhum') { O.presenca = 1.4; salvar(); ajuste(); } caixa.querySelector('.p7-acoes').innerHTML = '<button class="btn" data-a="prox">Continuar</button>'; lig(prox); }); }, 3600); }
      });
    } else {
      tela('Pronto', `<p>Perfil: <b>${(PERFIS[O.somPerfil] || {}).nome || 'não escolhido'}</b>. Reforço dos passos distantes: +${+O.audBoost || 0} dB. Sincronia: ${O.latModo === 'manual' ? O.latMs + ' ms' : 'automática'}. Dá para refazer em Desempenho, ou pelo botão Som do título.</p>`, '<button class="btn" data-a="ok">Fechar</button><button class="btn" data-a="ref">Refazer do início</button>');
      lig(a => { if (a === 'ref') { E.i = 0; return passo(); } fechar(true); });
      O.somCal = 'ok'; salvar();
    }
  }

  // ===================================================================
  // 5. VIBRAÇÃO COMO TEMA: o ritmo da ameaça sentido no controle e no celular
  // ===================================================================
  let hapT = 0, hapGap = 0, anaT = 0, procT = 0, mundoT = 6;
  function gatilho(forte, fraca, ms) {
    try {
      const gs = navigator.getGamepads ? navigator.getGamepads() : []; for (const g of gs) { if (!g || !g.connected || !g.vibrationActuator || !g.vibrationActuator.playEffect) continue; g.vibrationActuator.playEffect('trigger-rumble', { duration: ms, startDelay: 0, strongMagnitude: 0, weakMagnitude: 0, leftTrigger: fraca, rightTrigger: forte }).catch(() => {}); break; }
    } catch (e) {}
  }
  function pulso(f, w, ms, tipo) {
    if (hapGap > 0) return; hapGap = .42; // limite de frequência para poupar o motor
    try { U.vibrar(f, w, ms); if (U.padAtivo) gatilho(f, w, ms); } catch (e) {}
  }
  function tema(dt) {
    if (!O.hapTema || !O.vibrar || !(U.toque || U.padAtivo)) return;
    hapGap -= dt; hapT -= dt; anaT -= dt; procT -= dt;
    const M = C.M, P = C.P, S = C.S;
    if (!S || S.dead || C.ui) return;
    if (M.ativo && (M.state === 'caca' || M.state === 'procura')) { // o Inspetor: batida dupla que acelera quando ele chega perto
      const d = Math.hypot(M.pos.x - P.pos.x, M.pos.z - P.pos.z);
      if (hapT <= 0) { hapT = clamp(.55 + d * .09, .55, 1.7) * (M.state === 'procura' ? 1.4 : 1); pulso(.5, .25, 90); setTimeout(() => { if (!S.dead) pulso(.3, .12, 60); }, 190); }
    }
    if (C.ANA && C.ANA.ativa && C.ANA.pos) { // a Ana: toque curto e agudo (só o motor fraco)
      const d = Math.hypot(C.ANA.pos.x - P.pos.x, C.ANA.pos.z - P.pos.z);
      if (d < 12 && anaT <= 0) { anaT = clamp(.3 + d * .06, .35, 1); pulso(0, .7, 32); }
    }
    if (C.PROC && C.PROC.fase && C.PROC.fase !== 'aviso') { // a Procissão: onda longa e grave
      if (procT <= 0) { procT = 1.1; pulso(.85, .1, 260); }
    }
  }

  // ===================================================================
  // 6. SÓ O MUNDO, SEM TRILHA: os avisos da música passam para sons do prédio
  // ===================================================================
  function sonsDoMundo(dt) {
    if (!O.semTrilha || !C.AC || C.mode !== 'jogo' || C.ui) return;
    const M = C.M; mundoT -= dt; if (mundoT > 0) return;
    if (M && M.ativo && M.state === 'caca') { mundoT = 7 + Math.random() * 5; try { C.SOM.predio(); U.legenda && U.legenda('p7mundo', 'o prédio range, perto', null, 6); } catch (e) {} } else mundoT = 3;
  }
  function embrulhar() {
    const S = C.SOM;
    const emb = (k, fn) => { const o = S[k]; if (typeof o !== 'function') return; S[k] = (...a) => { try { fn(...a); } catch (e) {} return o(...a); }; };
    const leg = () => { try { U.legenda && U.legenda('p7mundo', 'o prédio treme e range', null, 6); } catch (e) {} };
    emb('stinger', () => { if (O.semTrilha) { leg(); setTimeout(() => { try { S.batidasChao(); } catch (e) {} }, 120); } if (O.hapTema && O.vibrar) pulso(.8, .5, 180); });
    emb('procissao', () => { if (O.semTrilha) { leg(); setTimeout(() => { try { S.batidasChao(); S.predio(); } catch (e) {} }, 200); } });
    emb('passoMonstro', (pos, vol) => { try { if (!O.hapTema || !pos || vol < .5 || !(U.toque || U.padAtivo)) return; const d = Math.hypot(pos.x - C.P.pos.x, pos.z - C.P.pos.z); if (d < 7) pulso(.2 + (7 - d) * .05, .1, 40); } catch (e) {} });
    emb('trovao', () => { if (O.hapTema && O.vibrar) setTimeout(() => pulso(.35, .2, 320), 150); });
  }

  // ===================================================================
  // 7. PRÉ-AQUECIMENTO e pequenas medidas de plataforma
  // ===================================================================
  // respostas de impulso do reverb geradas no título, em pedaços de ~30 mil amostras entre quadros (sem AudioContext, a 48 kHz).
  // O motor pega o pronto em gerarIR(); a 44,1 kHz ou com outra qualidade ele gera na hora, como antes.
  const irs = new Map();
  let irParado = false;
  function preGerarIR() {
    if (robo || typeof AudioBuffer !== 'function') return;
    const m = fraco() ? .5 : 1, lista = [[.6, 3], [2.8 * m, 2.4], [4 * m, 1.8]], sr = 48000;
    let li = 0, canal = 0, i = 0, cur = null;
    const passo = () => {
      if (li >= lista.length || irParado) return;
      const [seg, curva] = lista[li], n = Math.max(1, sr * seg | 0);
      if (!cur) cur = { n, d: [new Float32Array(n), new Float32Array(n)], pronto: false };
      const fim = Math.min(n, i + 30000), d = cur.d[canal];
      for (; i < fim; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, curva);
      if (i >= n) { i = 0; canal++; if (canal > 1) { cur.pronto = true; irs.set(seg + '|' + curva, cur); cur = null; canal = 0; li++; } }
      setTimeout(passo, 16);
    };
    setTimeout(passo, 250);
  }
  function irPronto(seg, curva, sr) {
    const k = seg + '|' + curva, r = irs.get(k); if (!r || !r.pronto || sr !== 48000) return null;
    irs.delete(k);
    try { const b = new AudioBuffer({ numberOfChannels: 2, length: r.n, sampleRate: sr }); b.copyToChannel(r.d[0], 0); b.copyToChannel(r.d[1], 1); return b; } catch (e) { return null; }
  }
  let aquecido = false;
  function aquecer() { // depois que o áudio existe, o impulso e o ruído da voz do Inspetor nascem em ocioso, não na primeira fala
    if (aquecido || robo || !C.AC) return; aquecido = true;
    irParado = true; setTimeout(() => irs.clear(), 2500); // o áudio já existe: o que sobrou do pré-cálculo só gastaria memória
    (window.requestIdleCallback || (f => setTimeout(f, 400)))(() => { try { C.aquecerVoz && C.aquecerVoz(); } catch (e) {} });
  }

  // ===================================================================
  // 8. CLIPE DO SUSTO (opt-in): últimos segundos de imagem e som, só no seu aparelho
  // ===================================================================
  const clipeOk = !!(window.MediaRecorder && HTMLCanvasElement.prototype.captureStream);
  let cv2 = null, cx2 = null, fluxo = null, destAudio = null, recs = [], clipeBlob = null, clipeUrl = '', clipeT = 0, clipeTick = 0;
  function mimeClipe() { return ['video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm'].find(m => { try { return MediaRecorder.isTypeSupported(m); } catch (e) { return false; } }) || ''; }
  function clipeLigar() {
    if (!clipeOk || robo || fluxo || !C.AC || !C.AUD || !C.AUD.lim) return !!fluxo;
    try {
      cv2 = document.createElement('canvas'); cv2.width = 640; cv2.height = 360; cx2 = cv2.getContext('2d');
      fluxo = cv2.captureStream(15);
      destAudio = ac().createMediaStreamDestination(); C.AUD.lim.connect(destAudio);
      destAudio.stream.getAudioTracks().forEach(t => fluxo.addTrack(t));
      return true;
    } catch (e) { fluxo = null; return false; }
  }
  function novoRec() {
    const r = { ch: [], ini: performance.now(), mr: null };
    try { const m = mimeClipe(); r.mr = new MediaRecorder(fluxo, m ? { mimeType: m, videoBitsPerSecond: 550000, audioBitsPerSecond: 64000 } : {}); r.mr.ondataavailable = e => { if (e.data && e.data.size) r.ch.push(e.data); }; r.mr.start(1000); } catch (e) { return null; }
    return r;
  }
  function clipeParar(tudo) { for (const r of recs) try { r.mr.ondataavailable = null; r.mr.stop(); } catch (e) {} recs = []; if (tudo && destAudio) { try { C.AUD.lim.disconnect(destAudio); } catch (e) {} fluxo = null; destAudio = null; } }
  function clipeRodar(agora) { // gira dois gravadores defasados em 10 s: sempre há um com 10 a 20 s de imagem
    if (!O.clip7 || !clipeOk || robo || !C.AC || C.mode !== 'jogo') return;
    if (fraco() || leve) { if (recs.length) clipeParar(false); return; }
    if (!fluxo && !clipeLigar()) return;
    if (!recs.length) { const r = novoRec(); if (r) recs.push(r); return; }
    const a = recs.find(r => agora - r.ini >= 20000); if (a) { try { a.mr.ondataavailable = null; a.mr.stop(); } catch (e) {} recs = recs.filter(r => r !== a); const r = novoRec(); if (r) recs.push(r); }
    if (recs.length === 1 && agora - recs[0].ini >= 10000) { const r = novoRec(); if (r) recs.push(r); }
  }
  function clipeQuadro(agora) {
    if (!cx2 || !recs.length || agora - clipeT < 66) return; clipeT = agora;
    try {
      cx2.drawImage(C.renderer.domElement, 0, 0, 640, 360);
      const tit = (window.ROTEIRO && window.ROTEIRO.capitulos && C.S && window.ROTEIRO.capitulos[C.S.chapter]) ? window.ROTEIRO.capitulos[C.S.chapter].titulo : '';
      cx2.fillStyle = 'rgba(0,0,0,.55)'; cx2.fillRect(0, 326, 640, 34); cx2.fillStyle = '#e8dcc0'; cx2.font = '16px Georgia,serif'; cx2.textBaseline = 'middle';
      cx2.fillText('sobrevivi até aqui' + (tit ? ' — ' + tit : ''), 12, 343); cx2.textAlign = 'right'; cx2.fillText('A HORA DO SILÊNCIO', 628, 343); cx2.textAlign = 'left';
    } catch (e) {}
  }
  function clipeSalvarDaMorte() {
    if (!O.clip7 || !recs.length) return;
    const agora = performance.now(); const r = recs.slice().sort((a, b) => a.ini - b.ini).find(x => agora - x.ini >= 6000) || recs[0];
    if (!r || !r.mr) return; recs = recs.filter(x => x !== r);
    try {
      r.mr.onstop = () => { try { if (clipeUrl) URL.revokeObjectURL(clipeUrl); clipeBlob = new Blob(r.ch, { type: (r.mr.mimeType || 'video/webm') }); clipeUrl = URL.createObjectURL(clipeBlob); mostrarBotaoClipe(true); } catch (e) {} };
      r.mr.stop();
    } catch (e) {}
    const n = novoRec(); if (n) recs.push(n);
  }
  function mostrarBotaoClipe(on) {
    let b = $('#p7-clipe'); if (!b) { const ref = $('#dt-lapide') || $('#dt-menu'); if (!ref) return; b = document.createElement('button'); b.className = 'btn'; b.id = 'p7-clipe'; b.hidden = true; ref.after(b); b.onclick = salvarClipe; }
    b.textContent = typeof navigator.canShare === 'function' && clipeBlob && (() => { try { return navigator.canShare({ files: [new File([clipeBlob], 'clipe.webm', { type: clipeBlob.type })] }); } catch (e) { return false; } })() ? 'Mandar o clipe do susto' : 'Salvar clipe do susto';
    b.hidden = !on;
  }
  async function salvarClipe() {
    if (!clipeBlob) return; const b = $('#p7-clipe');
    try { const f = new File([clipeBlob], 'hora-do-silencio-clipe.webm', { type: clipeBlob.type }); if (navigator.canShare && navigator.canShare({ files: [f] })) { await navigator.share({ files: [f], title: 'A Hora do Silêncio', text: 'Sobrevivi até aqui. Consegue mais?' }); return; } } catch (e) { if (e && e.name === 'AbortError') return; }
    const a = document.createElement('a'); a.href = clipeUrl; a.download = 'hora-do-silencio-clipe.webm'; document.body.appendChild(a); a.click(); a.remove();
    if (b) { b.textContent = 'Clipe salvo no aparelho'; setTimeout(() => { b.textContent = 'Salvar clipe do susto'; }, 2400); }
  }

  // ===================================================================
  // 9. OPÇÕES (Desempenho) e textos de estado
  // ===================================================================
  function atualizarTextos() {
    const s = $('#p7-leve-st'); if (s) s.textContent = leve ? 'Áudio leve ativado: ' + (motivoLeve || 'reverb simples e menos vozes') + '.' : 'Áudio completo.';
    const c = $('#p7-cal-st'); if (c) c.textContent = O.somCal === 'ok' ? `Calibrado: ${(PERFIS[O.somPerfil] || {}).nome || 'perfil não escolhido'}, reforço +${+O.audBoost || 0} dB.` : O.somCal === 'pulado' ? 'Calibragem pulada. Dá para fazer quando quiser.' : 'Ainda não calibrado.';
    const p = $('#p7-perfil'); if (p && O.somPerfil) p.value = O.somPerfil;
    const b = $('#b-calsom'); if (b) { const pf = (PERFIS[O.somPerfil] || {}).nome; b.innerHTML = 'Som' + (pf ? '<small style="display:block;opacity:.6;font-size:.62em;letter-spacing:.04em">' + pf + (O.somCal === 'ok' ? ' · calibrado' : '') + '</small>' : ''); b.title = (O.somCal === 'ok' ? 'Calibrado' : 'Ainda não calibrado') + (pf ? ': ' + pf : ''); }
  }
  function montarOpcoes(wrap) {
    if (!wrap || $('#p7-op')) return;
    const d = document.createElement('div'); d.id = 'p7-op'; d.className = 'op-grupo';
    d.innerHTML = `<h3>Som e atmosfera</h3>
      <label>Meu som <select id="p7-perfil"><option value="">(não escolhido)</option>${Object.entries(PERFIS).map(([k, p]) => `<option value="${k}">${p.nome}</option>`).join('')}</select></label>
      <small>Muda os graves, os médios, a compressão e a espacialização de uma vez.</small>
      <div class="op-bts"><button class="btn" id="p7-abrir">Calibrar o som</button><span class="p7-status" id="p7-cal-st"></span></div>
      <label>Graves virtuais <input type="range" id="p7-gv" min="0" max="2" step="0.1"><output id="p7-gv-v"></output></label>
      <small>Para caixa de notebook e celular: o jogo soma harmônicos do grave que o aparelho não toca.</small>
      <label>Presença de voz (médios) <input type="range" id="p7-pr" min="0" max="2" step="0.1"><output id="p7-pr-v"></output></label>
      <label>Infrassom <select id="p7-infra"><option value="completo">Completo</option><option value="suave">Suavizado (corta abaixo de 40 Hz)</option><option value="cortado">Cortado (abaixo de 80 Hz)</option></select></label>
      <small>Para quem se incomoda com o zumbido grave da caçada, do sino e dos sustos.</small>
      <label>Sincronia imagem e som <select id="p7-lat"><option value="auto">Automática</option><option value="zero">Sem ajuste</option><option value="manual">Manual</option></select> <input type="range" id="p7-latms" min="0" max="400" step="10" aria-label="Atraso da imagem em milissegundos"><output id="p7-latms-v"></output></label>
      <small>Em fone sem fio, atrasa relâmpagos e tremores de câmera para chegarem junto do som.</small>
      <label>Áudio leve <select id="p7-leve"><option value="auto">Automático</option><option value="ligado">Sempre ligado</option><option value="desligado">Desligado</option></select></label>
      <small class="p7-status" id="p7-leve-st"></small>
      <label><input type="checkbox" id="p7-trilha"> Só o mundo, sem trilha (os avisos da música viram sons do prédio)</label>
      <label><input type="checkbox" id="p7-hap"> Pulso de tensão no controle e no celular (Inspetor, Ana e Procissão têm batidas diferentes)</label>
      ${clipeOk ? '<label><input type="checkbox" id="p7-clip"> Gravar o clipe do susto (grava os últimos segundos só no seu aparelho; gasta mais bateria)</label>' : ''}
      <div class="op-bts"><button class="btn" id="p7-t-passo">Ouvir o Inspetor a 8 m</button><button class="btn" id="p7-t-trovao">Ouvir um trovão</button><button class="btn" id="p7-t-vib">Sentir os avisos</button><button class="btn" id="p7-t-destrava">Destravar o som</button><button class="btn" id="p7-t-link">Mandar o jogo a um amigo</button><button class="btn" id="p7-t-zerar">Zerar a calibragem</button></div>
      <small id="p7-t-res" aria-live="polite"></small>
      <div class="p7-med" aria-hidden="true"><i id="p7-med-o"></i></div>
      <small id="p7-info"></small>`;
    wrap.appendChild(d);
    const $$ = s => d.querySelector(s);
    $$('#p7-perfil').onchange = e => { if (e.target.value) definirPerfil(e.target.value); };
    $$('#p7-abrir').onclick = () => abrirAssistente(false);
    const gv = $$('#p7-gv'); gv.value = O.gravesVirt; $$('#p7-gv-v').textContent = Math.round(O.gravesVirt * 100) + '%'; gv.oninput = () => { O.gravesVirt = +gv.value; $$('#p7-gv-v').textContent = Math.round(gv.value * 100) + '%'; salvar(); ajuste(); };
    const pr = $$('#p7-pr'); pr.value = O.presenca; $$('#p7-pr-v').textContent = Math.round(O.presenca * 100) + '%'; pr.oninput = () => { O.presenca = +pr.value; $$('#p7-pr-v').textContent = Math.round(pr.value * 100) + '%'; salvar(); ajuste(); };
    const lm = $$('#p7-lat'), ls = $$('#p7-latms'); lm.value = O.latModo; ls.value = O.latMs; $$('#p7-latms-v').textContent = O.latMs + ' ms'; ls.disabled = O.latModo !== 'manual';
    lm.onchange = () => { O.latModo = lm.value; ls.disabled = lm.value !== 'manual'; salvar(); };
    ls.oninput = () => { O.latMs = +ls.value; $$('#p7-latms-v').textContent = ls.value + ' ms'; salvar(); };
    const lv = $$('#p7-leve'); lv.value = O.audioLeve; lv.onchange = () => { O.audioLeve = lv.value; salvar(); if (lv.value === 'auto' && motivoLeve === 'ligado por você') aplicarLeve(false); decidirLeve(); atualizarTextos(); };
    const tr = $$('#p7-trilha'); tr.checked = !!O.semTrilha; tr.onchange = () => { O.semTrilha = tr.checked; salvar(); try { const t = ac() && ac().currentTime; if (!O.semTrilha && C.BUS && C.BUS.mus && t !== undefined) { C.BUS.mus.gain.setTargetAtTime(OPT.vAmb ?? 1, t, .05); if (C.BUS.musR) C.BUS.musR.gain.setTargetAtTime(OPT.vAmb ?? 1, t, .05); } } catch (e) {} ajuste(); };
    const inf = $$('#p7-infra'); inf.value = O.infra || 'completo'; inf.onchange = () => { O.infra = inf.value; salvar(); ajuste(); };
    const dizer = t => { const r = $$('#p7-t-res'); if (r) r.textContent = t; };
    $$('#p7-t-passo').onclick = () => { if (!audio() || !C.AUD) return dizer('O som ainda não começou: aperte um botão do título primeiro.'); const p = C.P.pos; try { C.SOM.passoMonstro({ x: p.x, z: p.z - 8 }, .8); setTimeout(() => C.SOM.passoMonstro({ x: p.x, z: p.z - 8 }, .8), 520); setTimeout(() => C.SOM.passoMonstro({ x: p.x, z: p.z - 8 }, .8), 1040); dizer('Três passos, 8 metros à frente. Se não ouviu, aumente o reforço em Calibrar o som.'); } catch (e) { dizer('Não deu para tocar agora.'); } };
    $$('#p7-t-trovao').onclick = () => { if (!audio()) return; try { C.SOM.trovao(); dizer('Um trovão. Ele chega depois do clarão.'); } catch (e) {} };
    $$('#p7-t-vib').onclick = () => { const bom = U.toque || U.padAtivo; if (!bom) return dizer('Sem celular ou controle ligado: nada para vibrar.'); const ms = [[.5, .25, 90], [0, .7, 32], [.85, .1, 260]]; ms.forEach((m, i) => setTimeout(() => { try { U.vibrar(m[0], m[1], m[2]); if (U.padAtivo) gatilho(m[0], m[1], m[2]); } catch (e) {} }, i * 1100)); dizer('Primeiro o Inspetor (batida dupla), depois a Ana (toque agudo), por último a Procissão (onda longa e grave).'); };
    $$('#p7-t-destrava').onclick = () => { const A = audio(); try { if (A) { const b = A.createBuffer(1, 1, A.sampleRate), s = A.createBufferSource(); s.buffer = b; s.connect(A.destination); s.start(); } } catch (e) {} dizer(A ? 'Som destravado (estado: ' + A.state + ').' : 'O áudio ainda não começou.'); };
    $$('#p7-t-link').onclick = async () => { const url = location.origin + location.pathname, txt = 'A Hora do Silêncio: terror no navegador. Jogue de fone, no escuro.'; try { if (navigator.share) { await navigator.share({ title: 'A Hora do Silêncio', text: txt, url }); return; } } catch (e) { if (e && e.name === 'AbortError') return; } try { await navigator.clipboard.writeText(url); dizer('Link copiado.'); } catch (e) { dizer(url); } };
    $$('#p7-t-zerar').onclick = () => { Object.assign(O, { somCal: '', audBoost: 0, gravesVirt: 1, presenca: 1, latModo: 'auto', latMs: 0, infra: 'completo' }); salvar(); gv.value = 1; pr.value = 1; lm.value = 'auto'; ls.value = 0; ls.disabled = true; inf.value = 'completo'; $$('#p7-gv-v').textContent = '100%'; $$('#p7-pr-v').textContent = '100%'; $$('#p7-latms-v').textContent = '0 ms'; ajuste(); atualizarTextos(); dizer('Calibragem zerada: reforço, graves, presença e sincronia voltaram ao padrão.'); };
    const hp = $$('#p7-hap'); hp.checked = !!O.hapTema; hp.onchange = () => { O.hapTema = hp.checked; salvar(); };
    const cp = $$('#p7-clip'); if (cp) { cp.checked = !!O.clip7; cp.onchange = () => { O.clip7 = cp.checked; salvar(); if (!O.clip7) clipeParar(true); }; }
    atualizarTextos();
  }
  // medidor da saída e contagem de vozes (só gasta algo com o painel ou o assistente abertos)
  function medidor() {
    const vis = (caixa && !caixa.hidden) || ($('#p7-op') && $('#plat-opcoes') && !$('#plat-opcoes').hidden);
    if (!vis || !analis) return;
    const a = new Uint8Array(analis.fftSize); analis.getByteTimeDomainData(a); let pico = 0; for (let i = 0; i < a.length; i++) pico = Math.max(pico, Math.abs(a[i] - 128) / 128);
    const w = Math.round(clamp(Math.sqrt(pico), 0, 1) * 100) + '%';
    for (const id of ['p7-med-i', 'p7-med-o']) { const el = $('#' + id); if (el) el.style.width = w; }
    const info = $('#p7-info'); if (info) { const A = C.AUD; info.textContent = `vozes de áudio: ${A && A.vozes ? A.vozes.length : 0}/${A ? A.limVoz : 0} · limite para ${rotuloDispositivo()} · latência de saída: ${Math.round(latencia())} ms · falhas do áudio em 10 s: ${falhas.length}`; }
  }

  // ===================================================================
  // ligações com o motor e com a plataforma
  // ===================================================================
  function iniciar() {
    embrulhar(); preGerarIR();
    try { if (navigator.mediaDevices && navigator.mediaDevices.addEventListener) navigator.mediaDevices.addEventListener('devicechange', () => { latT = 0; latCache = 0; setTimeout(atualizarTextos, 300); }); } catch (e) {} // trocou de fone: lê a latência de novo
    medTimer = setInterval(() => { try { medidor(); } catch (e) {} }, 140);
    // primeira abertura: pergunta como a pessoa ouve (some ao escolher ou pular)
    somPendente = !robo && !O.somCal && !/[?&]opcoes=1/.test(location.search);
    // botão "Som" no título, ao lado de Desempenho
    const bo = $('#b-opcoes'); if (bo && !$('#b-calsom')) { const b = document.createElement('button'); b.className = 'btn'; b.id = 'b-calsom'; b.textContent = 'Som'; b.setAttribute('aria-label', 'Calibrar o som'); bo.after(b); b.onclick = () => abrirAssistente(false); }
  }
  function aposPortal() {
    if (robo) return;
    if (/[?&]som=1/.test(location.search)) { setTimeout(() => abrirAssistente(false), 120); return true; }
    if (somPendente && !O.somCal) { somPendente = false; setTimeout(() => abrirAssistente(true), 350); return true; }
    return false;
  }
  iniciar();

  return {
    montarOpcoes, ajuste, atraso, aposPortal, abrirAssistente,
    audioOpcoes() { return { latencyHint: (fraco() || celular() || U.toque) ? 'balanced' : 'interactive' }; },
    depois(dt, ativo) {
      const agora = performance.now();
      aquecer();
      try { monitorar(dt, agora); } catch (e) {}
      try { tema(dt); } catch (e) {}
      try { sonsDoMundo(dt); } catch (e) {}
      try { if (O.clip7) clipeRodar(agora); else if (recs.length) clipeParar(true); } catch (e) {}
    },
    aoMorte() { try { clipeSalvarDaMorte(); } catch (e) {} },
    aposRender() { if (O.clip7 && recs.length) clipeQuadro(performance.now()); }, // depois do render: o canvas 3D ainda tem a imagem
    aoNovaNoite() { try { mostrarBotaoClipe(false); } catch (e) {} },
    aoCarregar() { try { mostrarBotaoClipe(false); } catch (e) {} },
    get leve() { return leve; },
    irPronto,
    infoFps() { try { const A = C.AUD; return A && A.vozes ? ' · vozes ' + A.vozes.length + '/' + A.limVoz + (leve ? ' · áudio leve' : '') + (latencia() ? ' · sinc ' + Math.round(latencia()) + ' ms' : '') : ''; } catch (e) { return ''; } },
    latencia,
    _teste: { limiteVozes, reverbBarato, aplicarLeve, definirPerfil, atraso, estado: () => ({ ligado, leve, cheap: !!cheap, limVoz: C.AUD && C.AUD.limVoz, cal: cal && cal.gain.value, pk2: pk2 && pk2.gain.value, exc: C.AUD && C.AUD.exc && C.AUD.exc.gain.value, cmp2: cmp2 && cmp2.ratio.value, foraMusica: [...fora], irs: irs.size, saida: OPT.saidaSom, fone: O.fone }) }
  };
}
