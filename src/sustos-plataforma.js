// SUSTOS E EVENTOS — Lote 3 (polimento e plataforma)
// Impacto (o mundo para no golpe, zumbido no ouvido), "por um fio", alívio quando a caçada acaba, pausa e aba que
// não são seguras, truques de tela (travamento falso, HUD que mente, conquista falsa), segredos do título e da
// calibragem, morte com a lanterna rolando pelo chão, aviso antes dos sustos (acessibilidade) e alucinações pequenas.
// Instalado por src/sustos.js (L3 = instalarSustosL3(E, K)); o motor só chama SUST.escala / SUST.golpe / SUST.atrasoMorte.
import * as THREE from 'three';

const CHAVE = 'hora-silencio-l3';
const NUM = ['zero', 'um', 'dois', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove', 'dez'];

export function instalarSustosL3(E, K) {
  const { R, rand, pick, clamp, lerp, camera, scene, P, M, ANA, ANA_G, PROC, MON, W } = E;
  const T = Object.assign({
    pausa_perto: 'Ele também está esperando.',
    pausa_proc: '(eles continuam cantando)',
    pausa_ana: '...{n}...',
    eu_espero: 'eu espero.',
    caderno: 'você não pode parar a gente',
    pausa_lia: 'Lia?',
    saiu: 'você saiu. ela não.',
    ainda_ai: 'Lia? Você ainda está aí?',
    resp_perto: '[respiração bem perto, atrás de você]',
    nove: '...nove...',
    dez: 'DEZ.',
    achei: '(bem baixinho, atrás de você) ...achei.',
    fio: 'Por um fio',
    fio_cap: 'Por um fio: {n} {vez} neste capítulo',
    murmuros: ['(baixinho) ...ele passou do meu lado.', '(tremendo) Não respira. Não respira...', '(baixinho) Ele quase... ele quase.', '(sussurro) Tô viva. Tô viva.'],
    hff: '[a Lia solta um "hff" de susto]',
    surdo_leg: '[ele ainda ouve você]',
    surdo_lia: '(sussurro) Tirar o som não me deixa invisível.',
    fone: '(sussurro) Não tira... ele ouve pelo alto-falante.',
    passo_mais: '[um passo a mais, atrás de você, depois que você parou]',
    sopro: '[um sopro frio no seu pescoço]',
    doi: '(voz de criança, do seu lado) ...dói?',
    parada: '(do lado esquerdo, colado na orelha) Lia...',
    tres: '(sussurro) São três e {m}... você devia estar dormindo.',
    leu: '(sussurro, atrás de você) ...leu tudo?',
    conq_falsa: 'Ninguém Ouviu',
    conq_eu: 'EU OUVI',
    conq_rot: 'Conquista',
    mente_obj: 'NÃO OLHE',
    insonia: 'Você também não dorme?',
    fica: 'FICA',
    morte_olha: 'ainda está aí, Lia?',
    morte_fica: 'Fica, Lia. Aqui é quieto.',
    invertido: 'ELE NÃO ENXERGA. ELE LEMBRA.',
    rew: '◀◀ REBOBINANDO'
  }, R.sustos3 || {});
  const S = () => E.S;
  const $ = s => document.querySelector(s);
  const agoraR = () => performance.now();
  const teste = () => !!window.__teste;
  const truques = () => E.OPT.truques !== false && !teste();
  const semFlash = () => !!+E.OPT.vFlash;
  const menosMov = () => E.OPT.vCam !== undefined && +E.OPT.vCam === 0;
  const facil = () => !!S() && S().dif === 'facil';
  const emJogo = () => E.mode === 'jogo' && !!S() && !S().dead && !S().fim;
  const jogando = () => emJogo() && !E.ui;
  const dM = () => (M.ativo ? K.dist2(M.pos, P.pos) : 99);
  const ameaca = () => (M.ativo && (M.state === 'caca' || M.state === 'agarra' || dM() < 10)) || !!PROC.fase || !!ANA.ativa;
  const fl = () => (S() ? S().flags : {});
  const toqueDev = () => !!(window.matchMedia && matchMedia('(pointer:coarse)').matches && !matchMedia('(pointer:fine)').matches);
  const seguro = K.seguro;
  const ls = { get() { try { return JSON.parse(localStorage.getItem(CHAVE) || '{}'); } catch (e) { return {}; } }, set(o) { try { localStorage.setItem(CHAVE, JSON.stringify(o)); } catch (e) {} } };
  const lsMarca = (k, v = 1) => { const o = ls.get(); o[k] = v; ls.set(o); };
  const sess = {}; // uma vez por sessão (até recarregar a página)
  const conquista = id => { try { if (E.conquista && !teste()) E.conquista(id); } catch (e) {} };

  // ---------------- conquistas novas (as secretas aparecem como ??? até serem achadas)
  for (const c of [
    { id: 'l3_fio', nome: 'Por Um Fio', desc: 'Deixe o Inspetor passar a menos de um metro e meio de você dez vezes sem ser notada.' },
    { id: 'l3_esperou', nome: 'Esperou Demais', desc: 'Deixe a pausa aberta por nove minutos.', segredo: true },
    { id: 'l3_ele_esperou', nome: 'Ele Esperou Com Você', desc: 'Fique três minutos na pausa com o Inspetor solto no mapa.', segredo: true },
    { id: 'l3_fresta', nome: 'Pela Fresta', desc: 'Espreme a janela do jogo até virar uma fresta.', segredo: true },
    { id: 'l3_insonia', nome: 'Insônia', desc: 'Abra o jogo de madrugada, entre meia-noite e quatro da manhã.', segredo: true },
    { id: 'l3_surdo', nome: 'Ele Ainda Ouve', desc: 'Tire o som do jogo com o Inspetor por perto.', segredo: true },
    { id: 'l3_sino4', nome: 'O Quarto Sino', desc: 'Deixe o brilho no máximo na tela dos sinos por dez segundos.', segredo: true }
  ]) if (R.conquistas && !R.conquistas.some(x => x.id === c.id)) R.conquistas.push(c);

  // ---------------- camada visual própria
  const css = document.createElement('style');
  css.textContent = `
  .l3{position:fixed;inset:0;pointer-events:none;opacity:0}
  .l3.off{display:none}
  #l3-desat,#l3-desat2{background:#808080;mix-blend-mode:saturation;transition:opacity .7s}
  #l3-tunel{background:radial-gradient(ellipse at center,transparent 36%,rgba(0,0,0,.93) 80%);transition:opacity 1.5s}
  #l3-borda{box-shadow:inset 0 0 9vw rgba(150,12,6,.8);transition:opacity .22s}
  #l3-aviso{box-shadow:inset 0 0 16vw 5vw rgba(0,0,0,.96);transition:opacity .3s}
  #l3-trava{background:radial-gradient(ellipse 17vw 30vh at 50% 44%,rgba(0,0,0,0) 20%,rgba(0,0,0,.97) 72%);transition:opacity .6s}
  #l3-fita{background:repeating-linear-gradient(0deg,rgba(255,255,255,0) 0 5px,rgba(210,215,255,.13) 5px 8px),linear-gradient(90deg,rgba(255,0,70,.16),transparent 28%,transparent 72%,rgba(0,170,255,.16));animation:l3fita .2s steps(3) infinite;transition:opacity .25s}
  #l3-fita::after{content:'';position:absolute;left:0;right:0;height:14vh;top:-20vh;background:linear-gradient(180deg,transparent,rgba(240,240,255,.35) 40%,rgba(20,20,30,.5) 60%,transparent);animation:l3banda 1.1s linear infinite;filter:blur(2px)}
  @keyframes l3fita{0%{transform:translate(0,0)}33%{transform:translate(-.6vw,.4vh)}66%{transform:translate(.5vw,-.3vh)}}
  @keyframes l3banda{to{top:110vh}}
  #l3-rew{background:repeating-linear-gradient(0deg,rgba(0,0,0,.0) 0 3px,rgba(255,255,255,.22) 3px 5px),rgba(10,12,20,.55);animation:l3fita .09s steps(2) infinite}
  #l3-rew b{position:absolute;right:6vw;top:6vh;font:24px "Special Elite","Courier New",monospace;color:#e8e8e8;letter-spacing:.1em;text-shadow:0 0 6px #000}
  #l3-fresta{background:linear-gradient(90deg,#000 0,#000 31%,rgba(0,0,0,.6) 34%,transparent 37%,transparent 63%,rgba(0,0,0,.6) 66%,#000 69%,#000 100%);transition:opacity 1.2s}
  #l3-fresta i{position:absolute;top:42%;left:-12vw;width:9vw;height:4vw;border-radius:50%;background:radial-gradient(circle at 50% 50%,#000 22%,#3b2a20 26%,#c9bfae 34%,#8c8274 60%,transparent 64%);opacity:.85;filter:blur(1px)}
  #l3-dedos{transition:opacity 1.5s}
  #l3-rosto{background:radial-gradient(ellipse 15vw 24vh at 50% 48%,#d6d0c3 0,#b9b1a2 55%,rgba(0,0,0,.95) 72%),#000}
  #l3-rosto i{position:absolute;top:40%;width:3.4vw;height:4.6vh;background:#000;border-radius:50%;filter:blur(1px)}
  #l3-rosto b{position:absolute;left:47.6%;top:57%;width:4.8vw;height:6vh;background:#120404;border-radius:45%;filter:blur(1.5px)}
  #l3-conq{position:fixed;left:50%;top:9%;transform:translateX(-50%);pointer-events:none;opacity:0;transition:opacity .4s;background:linear-gradient(180deg,rgba(40,30,12,.92),rgba(18,14,6,.92));border:1px solid #b8963e;padding:10px 22px;text-align:center;font-family:"IM Fell English SC",Georgia,serif;color:#e7cf86;letter-spacing:.08em;box-shadow:0 0 18px rgba(0,0,0,.8)}
  #l3-conq small{display:block;font-size:12px;color:#a88f4d;letter-spacing:.18em}
  #l3-conq span.t{font-size:22px;display:inline-block}
  #l3-conq span.t i{font-style:normal;display:inline-block;transition:transform 1.6s cubic-bezier(.6,0,.9,.5),opacity 1.6s,filter 1.6s}
  #l3-conq.escorre span.t i{transform:translateY(5vh) scaleY(2.2);opacity:0;filter:blur(3px)}
  #l3-conq.eu{border-color:#7d1d14;background:rgba(10,0,0,.94)}
  #l3-conq.eu span.t{color:#c0392b;font-size:26px;letter-spacing:.3em}
  #l3-cursor{position:fixed;width:16px;height:24px;pointer-events:none;opacity:0;transform:rotate(9deg);transition:left 7s cubic-bezier(.4,0,.2,1),top 7s cubic-bezier(.4,0,.2,1),opacity .6s;background:#f2f2f2;clip-path:polygon(0 0,0 72%,24% 56%,40% 96%,54% 90%,38% 52%,72% 52%);filter:drop-shadow(1px 1px 0 #000)}
  #l3-nevoa{transition:opacity 2.5s}
  #l3-insonia{position:absolute;top:56px;right:22px;font:13px "Special Elite","Courier New",monospace;color:#d8b25a;letter-spacing:.12em;animation:l3pisca 1.4s steps(2) infinite;pointer-events:none}
  @keyframes l3pisca{50%{opacity:.15}}
  #l3-menina-tit{position:absolute;top:22%;left:-12%;width:7vw;height:30vh;z-index:-1;background:#000;opacity:.85;filter:blur(1.5px);pointer-events:none;clip-path:polygon(40% 0,60% 0,66% 9%,62% 17%,74% 22%,80% 52%,72% 54%,76% 100%,58% 100%,52% 66%,48% 66%,42% 100%,24% 100%,28% 54%,20% 52%,26% 22%,38% 17%,34% 9%);transition:left 9s linear}
  #l3-pausa{position:absolute;inset:0;pointer-events:none;z-index:-1;overflow:hidden}
  #l3-pausa .sil{position:absolute;left:58%;bottom:16%;width:4.5vw;height:22vh;background:#000;opacity:0;filter:blur(5px);transition:opacity 2.5s;clip-path:polygon(40% 0,60% 0,66% 9%,62% 17%,74% 22%,80% 52%,72% 54%,76% 100%,58% 100%,52% 66%,48% 66%,42% 100%,24% 100%,28% 54%,20% 52%,26% 22%,38% 17%,34% 9%)}
  #l3-pausa .sil.alta{background:#1a1612;width:7vw;height:48vh;bottom:6%;left:12%}
  #l3-pausa .linha{position:absolute;left:50%;bottom:7%;transform:translateX(-50%) rotate(-2deg);font:22px "IM Fell English",Georgia,serif;font-style:italic;color:#8a6f5a;letter-spacing:.06em;white-space:nowrap;text-shadow:0 0 3px #000}
  #l3-pausa .inv{position:absolute;left:50%;top:5%;transform:translateX(-50%) rotate(180deg);font:15px "Special Elite","Courier New",monospace;color:#4a3f33;letter-spacing:.2em;opacity:.55;white-space:nowrap}
  #l3-pausa .nota{position:absolute;left:50%;top:13%;transform:translateX(-50%);font:16px "IM Fell English",Georgia,serif;font-style:italic;color:#9a8566}
  #pause h2.l3-perto{color:#c0392b;font-size:clamp(22px,4vw,40px)}
  #pause h2 i.l3-cai{font-style:normal;display:inline-block;transition:transform 2s ease-in,opacity 2s}
  #pause h2 i.l3-cai.foi{transform:translateY(30vh) rotate(25deg);opacity:0}
  #b-pilha.l3-zero{--v:0%!important}
  #obj-list.l3-mente li{visibility:hidden}
  #obj-list.l3-mente::before{content:attr(data-l3);display:block;color:#c0392b;letter-spacing:.3em;font-family:"IM Fell English SC",Georgia,serif}
  #vc-simb i.l3-sino4{background:#141414!important}
  #vc-simb b.l3-menina{display:inline-block;width:14px;height:34px;margin-left:-6px;background:#0c0c0c;vertical-align:bottom;clip-path:polygon(40% 0,60% 0,66% 12%,80% 30%,74% 100%,26% 100%,20% 30%,34% 12%)}
  @media (prefers-reduced-motion:reduce){#l3-fita,#l3-rew,#l3-fita::after{animation:none!important}#l3-insonia{animation:none}}
  `;
  document.head.appendChild(css);
  const div = (id, html) => { const el = document.createElement('div'); el.id = id; el.className = 'l3 off'; if (html) el.innerHTML = html; document.body.appendChild(el); return el; };
  const elCor = div('l3-cor'), elDesat = div('l3-desat'), elDesat2 = div('l3-desat2'), elTunel = div('l3-tunel'), elBorda = div('l3-borda'), elAviso = div('l3-aviso');
  const elTrava = div('l3-trava'), elFita = div('l3-fita'), elRew = div('l3-rew', `<b>${T.rew}</b>`), elFresta = div('l3-fresta', '<i></i>');
  const elRosto = div('l3-rosto', '<i style="left:44%"></i><i style="left:52.6%"></i><b></b>');
  // liga/desliga sem custo de composição quando está apagado (notebook fraco: nada de camada transparente a tela toda)
  function mostrar(el, op, ms) { el.classList.remove('off'); if (ms === 0) el.style.transition = 'none'; void el.offsetWidth; el.style.opacity = op; if (ms === 0) requestAnimationFrame(() => { el.style.transition = ''; }); }
  function sumir(el, depoisMs = 1600) { el.style.opacity = 0; clearTimeout(el._l3t); el._l3t = setTimeout(() => { if (+el.style.opacity === 0) el.classList.add('off'); }, depoisMs); }
  const elConq = document.createElement('div'); elConq.id = 'l3-conq'; document.body.appendChild(elConq);
  const elCursor = document.createElement('div'); elCursor.id = 'l3-cursor'; document.body.appendChild(elCursor);
  const cvDedos = document.createElement('canvas'); cvDedos.id = 'l3-dedos'; cvDedos.className = 'l3 off'; document.body.appendChild(cvDedos);
  const cvNevoa = document.createElement('canvas'); cvNevoa.id = 'l3-nevoa'; cvNevoa.className = 'l3 off'; document.body.appendChild(cvNevoa);
  const pausaEl = $('#pause'), h2 = pausaEl && pausaEl.querySelector('h2'), H2_ORIG = h2 ? h2.textContent : 'Pausa';
  let camadaPausa = null;
  if (pausaEl) { camadaPausa = document.createElement('div'); camadaPausa.id = 'l3-pausa'; camadaPausa.innerHTML = '<div class="sil"></div><div class="linha"></div><div class="nota"></div>' + (toqueDev() ? `<div class="inv">${T.invertido}</div>` : ''); pausaEl.style.position = pausaEl.style.position || ''; pausaEl.prepend(camadaPausa); }

  // ---------------- som próprio: saída direta (fica mesmo quando o resto do mundo é cortado)
  const som = K.som;
  function direto(pan = 0) {
    const ac = E.AC, g = ac.createGain(), v = ac.createGain(); v.gain.value = Math.max(0, +E.OPT.vol || 0); let p = null;
    if (ac.createStereoPanner) { p = ac.createStereoPanner(); p.pan.value = clamp(pan, -1, 1); g.connect(p); p.connect(v); } else g.connect(v);
    v.connect(ac.destination); setTimeout(() => { try { v.disconnect(); } catch (e) {} }, 14000);
    return { g, p };
  }
  function panDe(pos) { const f = K.fwdH(), dx = pos.x - P.pos.x, dz = pos.z - P.pos.z, l = Math.hypot(dx, dz) || 1; return clamp((dx * -f.z + dz * f.x) / l, -1, 1); }
  function zumbido(dur = 2, f = 5200, vol = .03) { som((ac, t) => { const { g } = direto(); const o = ac.createOscillator(); o.frequency.value = f; o.connect(g); g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + .02); g.gain.exponentialRampToValueAtTime(.0001, t + dur); o.start(t); o.stop(t + dur + .05); }); }
  function cortarMaster(ms = 80, nivel = .45, recupera = 2) { som((ac, t) => { const g = E.master.gain, vol = +E.OPT.vol, a = t + ms / 1000; g.cancelScheduledValues(t); g.setValueAtTime(g.value, t); g.linearRampToValueAtTime(0, t + .012); g.setValueAtTime(0, a); g.linearRampToValueAtTime(vol * nivel, a + .02); g.linearRampToValueAtTime(vol, a + recupera); }); }
  function baque(vol = .5) { som((ac, t) => { const { g } = direto(); const o = ac.createOscillator(); o.frequency.setValueAtTime(52, t); o.frequency.exponentialRampToValueAtTime(27, t + .7); o.connect(g); g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + .012); g.gain.exponentialRampToValueAtTime(.0001, t + .9); o.start(t); o.stop(t + 1); }); }
  function respDireta(dur = 2, { pan = 0, panFim = null, grave = false, vol = .22, tremor = 0 } = {}) {
    som((ac, t) => {
      const { g, p } = direto(pan), s = E.ruido(true), f = ac.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = grave ? 520 : 1400; f.Q.value = 1.2;
      let n = f; if (tremor) { const am = ac.createGain(); am.gain.value = .5; const lfo = ac.createOscillator(); lfo.frequency.value = tremor; const lg = ac.createGain(); lg.gain.value = .5; lfo.connect(lg); lg.connect(am.gain); f.connect(am); n = am; lfo.start(t); lfo.stop(t + dur + .2); }
      s.connect(f); n.connect(g); g.gain.setValueAtTime(.0001, t);
      for (let k = 0; k < dur; k += 1.6) { g.gain.exponentialRampToValueAtTime(vol, t + k + .6); g.gain.exponentialRampToValueAtTime(.002, t + k + 1); g.gain.exponentialRampToValueAtTime(vol * .6, t + k + 1.3); g.gain.exponentialRampToValueAtTime(.0005, t + k + 1.6); }
      if (p && panFim !== null) { p.pan.setValueAtTime(pan, t); p.pan.linearRampToValueAtTime(panFim, t + dur); }
      s.start(t); s.stop(t + dur + .1);
    });
  }
  function coracaoD(vol = 1) { som((ac, t) => { const { g } = direto(); for (const k of [0, .17]) { const o = ac.createOscillator(), eg = ac.createGain(); o.frequency.setValueAtTime(58, t + k); o.frequency.exponentialRampToValueAtTime(35, t + k + .14); o.connect(eg); eg.connect(g); E.env(eg, t + k, .01, (k ? .3 : .45) * vol, .16); o.start(t + k); o.stop(t + k + .25); } }); }
  function soltarAr(vol = .2) { respDireta(1.5, { vol, tremor: 9 }); } // a Lia solta o ar tremendo
  function risadinha(pan0 = -1, pan1 = 1, vol = .08) {
    som((ac, t) => {
      const { g, p } = direto(pan0); g.gain.value = vol; if (p) { p.pan.setValueAtTime(pan0, t); p.pan.linearRampToValueAtTime(pan1, t + 1.4); }
      for (let i = 0; i < 6; i++) { const at = t + i * .2 + Math.random() * .04, o = ac.createOscillator(), bp = ac.createBiquadFilter(), eg = ac.createGain(); o.type = 'sawtooth'; o.frequency.setValueAtTime(560 - i * 14, at); o.frequency.linearRampToValueAtTime(470, at + .12); bp.type = 'bandpass'; bp.frequency.value = 2300; bp.Q.value = 5; o.connect(bp); bp.connect(eg); eg.connect(g); eg.gain.setValueAtTime(.0001, at); eg.gain.exponentialRampToValueAtTime(1, at + .02); eg.gain.exponentialRampToValueAtTime(.0001, at + .14); o.start(at); o.stop(at + .16); }
    });
  }
  function lingua(pos, pan) { som((ac, t) => { const g = pos ? E.saida(pos, .2) : direto(pan || 0).g; E.burst(t, .03, 'bandpass', 2600, 4, g, 0); E.env(g, t, .001, pos ? .6 : .25, .03); const g2 = pos ? E.saida(pos, .1) : direto(pan || 0).g; E.osc('sine', 900, t, .06, g2); E.env(g2, t, .001, pos ? .15 : .07, .05); }); }
  function unhaVidro(dur = 1.4) { som((ac, t) => { const { g } = direto(.3); const f = E.burst(t, dur, 'bandpass', 3800, 9, g); f.frequency.linearRampToValueAtTime(3100, t + dur); g.gain.setValueAtTime(0, t); for (let i = 0; i < dur * 16; i++) g.gain.setValueAtTime(Math.random() * .05, t + i / 16); g.gain.setValueAtTime(0, t + dur); }); }
  function dedoVidro() { som((ac, t) => { const { g } = direto(rand(-.3, .3)); const o = ac.createOscillator(); o.frequency.setValueAtTime(1700, t); o.frequency.linearRampToValueAtTime(2500, t + .22); const v = ac.createOscillator(); v.frequency.value = 31; const vg = ac.createGain(); vg.gain.value = 120; v.connect(vg); vg.connect(o.frequency); o.connect(g); g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(.025, t + .03); g.gain.exponentialRampToValueAtTime(.0001, t + .28); o.start(t); o.stop(t + .3); v.start(t); v.stop(t + .3); }); }
  function engasgo(dur = 2.5) {
    som((ac, t) => {
      const n = Math.floor(ac.sampleRate * .08), b = ac.createBuffer(1, n, ac.sampleRate), d = b.getChannelData(0);
      for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * .45 * Math.sin(i / n * Math.PI) + Math.sin(i * 2 * Math.PI * 110 / ac.sampleRate) * .35;
      const s = ac.createBufferSource(); s.buffer = b; s.loop = true; const { g } = direto(), f = ac.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 1800; s.connect(f); f.connect(g);
      g.gain.setValueAtTime(.1, t); g.gain.setValueAtTime(.1, t + dur - .02); g.gain.linearRampToValueAtTime(0, t + dur); s.start(t); s.stop(t + dur + .05);
    });
  }
  function fitaArrastada() { som((ac, t) => { const g = E.saida(null, .1); const o = ac.createOscillator(); o.type = 'sawtooth'; o.frequency.setValueAtTime(240, t); o.frequency.exponentialRampToValueAtTime(28, t + 1.1); const v = ac.createOscillator(); v.frequency.value = 6; const vg = ac.createGain(); vg.gain.value = 18; v.connect(vg); vg.connect(o.frequency); const f = ac.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 900; o.connect(f); f.connect(g); E.env(g, t, .05, .05, 1.1); o.start(t); o.stop(t + 1.25); v.start(t); v.stop(t + 1.25); }); }
  function rebobinar() { som((ac, t) => { const { g } = direto(); const f = E.burst(t, .55, 'bandpass', 400, 3, g); f.frequency.exponentialRampToValueAtTime(3600, t + .5); g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(.09, t + .05); g.gain.exponentialRampToValueAtTime(.0001, t + .55); }); }
  function tomGrave(dur = .6, vol = .05) { som((ac, t) => { const { g } = direto(); E.osc('sine', 55, t, dur + .1, g); g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + .1); g.gain.exponentialRampToValueAtTime(.0001, t + dur); }); }
  function vozGrave(pos) { K.voz(pos, { f0: 86, vogais: [[400, 900], [320, 800], [500, 1000], [300, 760]], dur: 1.6, vol: .15, cai: .82, wet: .2 }); }
  function sussurro(pos, dur = .8, vol = .14) { K.voz(pos, { sopro: true, vogais: [[500, 1900], [700, 1700], [350, 2300]], dur, vol, wet: .1 }); }
  const vibrarCelular = ms => { try { if (document.body.classList.contains('toque') && navigator.vibrate) { const o = JSON.parse(localStorage.getItem('hora-silencio-plat') || '{}'); if (o.vibrar !== false) navigator.vibrate(ms); } } catch (e) {} };

  // ---------------- tempo do mundo: congelar (hitstop) e câmera lenta (o motor multiplica o dt por isto)
  const janelas = [];
  function pararTempo(ms, k = 0) { janelas.push({ ate: agoraR() + ms, k }); }
  function escala(dt) {
    if (!janelas.length) return dt;
    const n = agoraR(); let k = 1;
    for (let i = janelas.length - 1; i >= 0; i--) { if (janelas[i].ate <= n) janelas.splice(i, 1); else k = Math.min(k, janelas[i].k); }
    return teste() ? dt : dt * k;
  }

  // ---------------- modelos e pontos
  const V = new THREE.Vector3();
  function pontoAtras(m) { const f = K.fwdH(); for (const mm of [m, m * .75, m * .5]) { const x = P.pos.x - f.x * mm, z = P.pos.z - f.z * mm; if (E.roomAt(x, z) === P.room) return { x, z }; } return null; }
  function pontoFrente(m, ang = 0) { const f = K.fwdH(), c = Math.cos(ang), s = Math.sin(ang), fx = f.x * c - f.z * s, fz = f.x * s + f.z * c; for (const mm of [m, m * .75, m * .5]) { const x = P.pos.x + fx * mm, z = P.pos.z + fz * mm; if (E.roomAt(x, z) === P.room) return { x, z }; } return null; }
  function olhando(p, cos = .9) { const f = K.fwdH(), dx = p.x - P.pos.x, dz = p.z - P.pos.z, l = Math.hypot(dx, dz) || 1; return (f.x * dx + f.z * dz) / l > cos; }
  function por(g, p, costas = false) { V.set(p.x, 0, p.z); E.collide(V, .25); g.position.set(V.x, 0, V.z); g.rotation.set(0, Math.atan2(P.pos.x - V.x, P.pos.z - V.z) + (costas ? Math.PI : 0), 0); g.visible = true; }

  // ===================================================================== IMPACTO
  let roll = 0, rollV = 0;
  function corDoGolpe(cor) { if (semFlash()) return; elCor.style.background = cor; mostrar(elCor, .55, 0); setTimeout(() => { elCor.style.opacity = 0; elCor.classList.add('off'); }, 55); }
  const golpe = seguro(quem => {
    const ana = quem === 'ana';
    pararTempo(ana ? 90 : 80, ana ? .05 : 0); // o mundo para por um instante antes do tranco
    corDoGolpe(ana ? 'rgba(40,80,200,.9)' : quem === 'procissao' ? 'rgba(220,140,40,.9)' : 'rgba(210,10,0,.95)');
    cortarMaster(85, .4, 2.1); setTimeout(() => zumbido(2, ana ? 4700 : 5300, .028), 90);
    mostrar(elDesat, .85, 0); setTimeout(() => sumir(elDesat, 900), 120);
    vibrarCelular(ana ? [60, 40, 60] : 140);
    if (!menosMov()) { const lado = quem === 'inspetor' && M.ativo ? (panDe(M.pos) >= 0 ? -1 : 1) : (Math.random() < .5 ? -1 : 1); rollV = lado * .2; }
  });
  // o agarrão: 110 ms de mundo parado, o túnel fecha de uma vez e todo som corta menos um tom agudo
  function agarrou() { pararTempo(110, 0); cortarMaster(110, .7, .5); zumbido(.45, 3600, .03); mostrar(elTunel, .9, 0); setTimeout(() => sumir(elTunel), 600); }
  // ele te notou: 120 ms congelado e um baque grave abaixo de tudo
  const notou = seguro(() => { if (D3.notouT > agoraR() - 4000) return; D3.notouT = agoraR(); pararTempo(120, 0); baque(.45); mostrar(elTunel, .55, 0); setTimeout(() => sumir(elTunel), 300); });

  // ===================================================================== AVISO ANTES DOS SUSTOS (acessibilidade)
  const avisar = seguro((espera = .6) => {
    if (!E.OPT.avisoSusto) return;
    mostrar(elAviso, 1); tomGrave(Math.max(.4, espera), .05); setTimeout(() => sumir(elAviso, 500), Math.max(400, espera * 1000));
    som((ac, t) => { const g = E.master.gain, vol = +E.OPT.vol, a = t + espera + .04; g.setValueAtTime(vol * .6, a); g.linearRampToValueAtTime(vol, a + 1.2); }); // o estalo do susto toca a 60%
  });
  const suave = seguro(() => { if (!E.OPT.avisoSusto) return; som((ac, t) => { const g = E.master.gain, vol = +E.OPT.vol; g.cancelScheduledValues(t); g.setValueAtTime(vol * .6, t); g.linearRampToValueAtTime(vol, t + 1.2); }); });
  // o susto tem preço: meio passo para trás e um "hff" que faz barulho
  const assustou = seguro(() => {
    const s = S(); if (!s || s.hidden || P.bloqueado || !jogando()) return;
    const f = K.fwdH(); V.set(P.pos.x - f.x * .22, 0, P.pos.z - f.z * .22); E.collide(V, .33); P.pos.x = V.x; P.pos.z = V.z;
    som((ac, t) => { const g = E.saida(null, 0, 'corpo'); E.burst(t, .14, 'bandpass', 1100, 1.5, g); E.env(g, t, .005, .35, .12); });
    E.emitNoise(P.pos.x, P.pos.z, 2); setTimeout(() => soltarAr(.12), 500);
    if (!s.flags.l3_hff) { s.flags.l3_hff = true; E.sub('', T.hff); }
  });

  // ===================================================================== ESTADO DO LOTE
  const D3 = { estM: null, cacaMin: 99, cacaFoi: 0, fio: null, fioUlt: -1e9, slowUlt: -1e9, cap: -1, fioCap: 0, conta: 0, desat: 0, tunelOn: false,
    andando: 0, parouEm: 0, passoN: 0, passoUlt: -1e9, qAnt: false, qN: 0, pilha: 100, kits: 0, vida: 100, escuroT: 0, escuroPend: false, parado: 0, ultPos: null,
    horaT: 0, hora: null, trava: false, hudMente: false, conqFalsa: false, escondidaT: 0, surdo: 0, surdoPulso: 0, tres: false, notouT: 0, ultInput: agoraR() };
  addEventListener('keydown', () => { D3.ultInput = agoraR(); }, true);
  addEventListener('mousemove', () => { D3.ultInput = agoraR(); }, true);
  addEventListener('pointerdown', () => { D3.ultInput = agoraR(); }, true);
  addEventListener('touchstart', () => { D3.ultInput = agoraR(); }, { capture: true, passive: true });

  // ---------------- giz: a contagem da Ana rabiscada nas paredes (uma malha só, redesenhada a cada número)
  const giz = (() => {
    const cv = document.createElement('canvas'); cv.width = 256; cv.height = 192; const ctx = cv.getContext('2d');
    const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace;
    const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false, opacity: .85 });
    const m = new THREE.Mesh(new THREE.PlaneGeometry(.9, .68), mat); m.visible = false; m.renderOrder = 2; scene.add(m);
    function desenhar(n) {
      ctx.clearRect(0, 0, 256, 192); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      for (let k = 0; k < 4; k++) { ctx.fillStyle = `rgba(232,230,218,${.28 + k * .1})`; ctx.font = `bold ${118 + k * 2}px "Special Elite","Courier New",monospace`; ctx.save(); ctx.translate(128 + rand(-3, 3), 100 + rand(-3, 3)); ctx.rotate(rand(-.12, .12)); ctx.fillText(String(n), 0, 0); ctx.restore(); }
      ctx.globalCompositeOperation = 'destination-out'; for (let i = 0; i < 340; i++) { ctx.fillStyle = `rgba(0,0,0,${rand(.3, 1)})`; ctx.fillRect(rand(0, 256), rand(0, 192), rand(1, 3), rand(1, 2)); } ctx.globalCompositeOperation = 'source-over';
      if (n >= 7) { ctx.strokeStyle = 'rgba(230,228,215,.5)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(40, 170); ctx.lineTo(220, 165 + rand(-6, 6)); ctx.stroke(); }
      tex.needsUpdate = true;
    }
    // ponto na parede da sala na direção pedida (as paredes ficam nos limites da sala)
    function naParede(ang) {
      const r = P.room; if (!r || r.fora) return false;
      const f = K.fwdH(), c = Math.cos(ang), s = Math.sin(ang), dx = f.x * c - f.z * s, dz = f.x * s + f.z * c;
      let tx = 1e9, tz = 1e9;
      if (Math.abs(dx) > 1e-3) tx = ((dx > 0 ? r.x1 : r.x0) - P.pos.x) / dx;
      if (Math.abs(dz) > 1e-3) tz = ((dz > 0 ? r.z1 : r.z0) - P.pos.z) / dz;
      const t = Math.min(tx, tz); if (!(t > .8 && t < 9)) return false;
      const x = P.pos.x + dx * t, z = P.pos.z + dz * t, nx = tx < tz ? -Math.sign(dx) : 0, nz = tx < tz ? 0 : -Math.sign(dz);
      m.position.set(x + nx * .04, rand(1.15, 1.6), z + nz * .04); m.rotation.set(0, Math.atan2(nx, nz), rand(-.1, .1)); return true;
    }
    return {
      mostrar(n) { desenhar(n); const ang = n === 9 ? Math.PI : pick([1, -1]) * rand(.7, 1.15); m.visible = naParede(ang) || (n !== 9 && naParede(-ang)); },
      esconder() { m.visible = false; }
    };
  })();

  // ===================================================================== POR UM FIO / ALÍVIO / TÚNEL
  function porUmFio(dt, s) {
    const d = dM(), livre = M.ativo && M.state !== 'caca' && M.state !== 'agarra';
    if (!D3.fio && livre && d < 1.5 && agoraR() - D3.fioUlt > 25000) {
      D3.fio = { ini: agoraR(), min: d };
      if (agoraR() - D3.slowUlt > 90000) { // câmera lenta, o coração falha e só a respiração dele fica
        D3.slowUlt = agoraR(); pararTempo(400, .6); K.vacuo(.9, .07);
        coracaoD(1); vibrarCelular([40, 160, 40]); respDireta(1.6, { pan: panDe(M.pos), grave: true, vol: .3 });
        setTimeout(() => coracaoD(.6), 1500); // a batida do meio não vem
      }
    }
    if (D3.fio) {
      D3.fio.min = Math.min(D3.fio.min, d);
      if (!M.ativo || M.state === 'caca' || M.state === 'agarra' || s.dead) D3.fio = null;
      else if (d > 4) {
        D3.fio = null; D3.fioUlt = agoraR(); soltarAr(.22);
        const o = ls.get(); o.fio = (o.fio || 0) + 1; ls.set(o); D3.fioCap++;
        E.toast(T.fio + (o.fio > 1 ? ` (${o.fio})` : '')); if (o.fio >= 10) conquista('l3_fio');
      }
    }
    // escondida, ele passa colado: as bordas fecham e tudo volta em 1,5 s
    const tunel = !!s.hidden && M.ativo && d < 1.2;
    if (tunel !== D3.tunelOn) { D3.tunelOn = tunel; if (tunel) mostrar(elTunel, .75); else sumir(elTunel); }
  }
  function alivio(s) {
    const st = M.ativo ? M.state : null;
    if (st === 'caca') { D3.cacaMin = Math.min(D3.cacaMin, dM()); D3.cacaFoi = agoraR(); D3.desat = Math.min(.3, D3.desat + .01); }
    if (D3.estM === 'caca' && st && st !== 'caca' && st !== 'agarra' && !s.dead) {
      // o coração desacelera de forma audível, a cor volta e a Lia solta o ar
      [0, .55, 1.2, 2, 2.9].forEach((k, i) => setTimeout(() => { if (S() && !S().dead) E.SFX.coracao(.9 - i * .16); }, k * 1000));
      setTimeout(() => { if (S() && !S().dead && !(M.ativo && M.state === 'caca')) { soltarAr(.2); if (D3.cacaMin < 2) E.sub('lia', pick(T.murmuros)); } }, 1600);
      D3.cacaMin = 99;
    }
    if (st !== 'caca') D3.desat = Math.max(0, D3.desat - .0045);
    if (D3.desat > .01) { elDesat2.classList.remove('off'); elDesat2.style.transition = 'none'; elDesat2.style.opacity = D3.desat; } else if (!elDesat2.classList.contains('off')) { elDesat2.style.opacity = 0; elDesat2.classList.add('off'); }
    if (st === 'agarra' && D3.estM !== 'agarra') agarrou();
    D3.estM = st;
  }

  // ===================================================================== ALUCINAÇÕES PEQUENAS
  function alucinacoes(dt, s) {
    const calmo = !ameaca() && !s.hidden && s.chapter >= 1 && !P.room.fora;
    const capK = k => `l3_${k}${s.chapter}`;
    // um passo a mais depois que você para
    const moving = E.keys.KeyW || E.keys.KeyA || E.keys.KeyS || E.keys.KeyD;
    if (moving && !P.sprinting && P.room.tipo === 'corredor') D3.andando += dt;
    else if (!moving) {
      if (D3.andando > 6 && calmo && D3.passoN < 2 && agoraR() - D3.passoUlt > 90000 && Math.random() < .35) {
        D3.passoN++; D3.passoUlt = agoraR(); const a = K.atras(2.4);
        setTimeout(() => { K.passoPos({ x: a.x, y: .1, z: a.z }, .5); if (!s.flags.l3_passoLeg) { s.flags.l3_passoLeg = true; E.sub('', T.passo_mais); } }, 350);
      }
      D3.andando = 0;
    }
    // Q: olhar para trás com muito medo às vezes mostra uma criança por três quadros
    const q = !!E.keys.KeyQ;
    if (q && !D3.qAnt && s.fear > 60 && s.chapter >= 2 && D3.qN < 2 && !ameaca() && Math.random() < .2) {
      D3.qN++; setTimeout(() => { if (!E.keys.KeyQ || !jogando()) return; const p = pontoFrente(4.2); if (!p) return; por(K.CRIANCA, p); let n = 0; K.anima(K.CRIANCA, () => { if (++n > 3) { K.CRIANCA.visible = false; return true; } }); }, 260);
    }
    D3.qAnt = q;
    // trocar a pilha no escuro: um sopro no pescoço
    if (s.battery > D3.pilha + 40 && !s.flags[capK('sopro')] && !P.room.fora) { s.flags[capK('sopro')] = true; respDireta(1, { pan: -.6, vol: .16 }); E.sub('', T.sopro); }
    D3.pilha = s.battery;
    // usar o curativo: alguém pergunta se dói (uma vez por partida)
    if (s.inv.kits < D3.kits && s.health > D3.vida + 25 && !s.flags.l3_doi && s.chapter >= 1) { s.flags.l3_doi = true; setTimeout(() => { sussurro(K.atras(.5), .6, .11); E.sub('', T.doi); }, 900); }
    D3.kits = s.inv.kits; D3.vida = s.health;
    // parada 40 s sem mexer em nada: o nome dela na orelha esquerda e a lanterna treme
    if (calmo && agoraR() - D3.ultInput > 40000 && !s.flags[capK('parada')] && !teste()) {
      s.flags[capK('parada')] = true; const f = K.fwdH(); sussurro({ x: P.pos.x + f.z * .5, y: 1.6, z: P.pos.z - f.x * .5 }, .7, .13); E.sub('ana', T.parada); K.D.piscaAte = K.agora() + .9;
    }
    // vinte segundos de lanterna apagada numa sala: ao acender, alguém corre para longe
    if (s.inv.lanterna && !s.flashOn && calmo) { D3.escuroT += dt; if (D3.escuroT > 20 && !s.flags[capK('escuro')]) D3.escuroPend = true; }
    else if (s.flashOn) {
      if (D3.escuroPend && !s.flags[capK('escuro')]) {
        s.flags[capK('escuro')] = true; const f = K.fwdH();
        for (let i = 0; i < 7; i++) setTimeout(() => K.passoPos({ x: P.pos.x + f.x * (2.5 + i * .9), y: .1, z: P.pos.z + f.z * (2.5 + i * .9) }, .5 - i * .05, true), 200 + i * 160);
        setTimeout(() => risadinha(0, panDe({ x: P.pos.x + f.x * 6, z: P.pos.z + f.z * 6 }), .05), 1300);
      }
      D3.escuroT = 0; D3.escuroPend = false;
    }
    // jogando às três da manhã: uma vez por capítulo, o nome sussurrado com a hora certa
    D3.horaT -= dt; if (D3.horaT <= 0) { D3.horaT = 10; D3.hora = new Date(); } // o relógio real é lido de 10 em 10 s
    const h = D3.hora;
    if (h && h.getHours() === 3 && calmo && s.capT > 60 && !s.flags[capK('tres')]) {
      s.flags[capK('tres')] = true; sussurro(K.atras(.4), 1.1, .14);
      E.sub('ana', T.tres.replace('{m}', h.getMinutes() < 10 ? '0' + h.getMinutes() : String(h.getMinutes())));
    }
  }

  // ===================================================================== A CONTAGEM DA ANA (giz e vibração)
  function contagem(s) {
    const c = ANA.ativa ? ANA.conta : 0;
    if (c !== D3.conta) {
      if (ANA.ativa && c >= 1 && c <= 9) { giz.mostrar(c); vibrarCelular(25 + c * 14); }
      else giz.esconder(); // no DEZ: silêncio total, nem vibração
      D3.conta = c;
    }
    if (!ANA.ativa && D3.conta) { D3.conta = 0; giz.esconder(); }
  }

  // ===================================================================== TRUQUES DE TELA
  // "O jogo travou": o quadro congela, o som repete um pedaço curto e o rosto dele aparece dentro do quadro parado
  function travar(s) {
    D3.trava = true; s.flags.l3_trava = true;
    const prev = P.bloqueado; P.bloqueado = true; pararTempo(3700, 0);
    document.body.style.cursor = 'progress'; cortarMaster(3600, 1, .3); engasgo(2.5);
    const fps = $('#fps'); let fpsI = null; if (fps && !fps.hidden) fpsI = setInterval(() => { fps.textContent = '0 qps · ' + (2500).toFixed(1) + ' ms'; }, 60);
    const anaContando = ANA.ativa && ANA.conta > 0 && ANA.conta < 7;
    setTimeout(seguro(() => {
      const f = K.fwdH(), c = camera.position, yawCam = Math.atan2(-f.x, -f.z), G = K.SOMBRA;
      G.position.set(c.x + f.x * .7, c.y - 2.98, c.z + f.z * .7); G.rotation.set(0, yawCam, 0); G.visible = true;
      K.luzRosto.position.set(c.x + f.x * .3, c.y - .3, c.z + f.z * .3); K.luzRosto.intensity = 5;
      mostrar(elTrava, 1); respDireta(1.3, { grave: true, vol: .3 });
    }), 2500);
    setTimeout(seguro(() => {
      K.SOMBRA.visible = false; K.luzRosto.intensity = 0; sumir(elTrava, 700); document.body.style.cursor = ''; if (fpsI) clearInterval(fpsI);
      P.bloqueado = prev; D3.trava = false;
      if (anaContando && ANA.ativa) { ANA.conta = Math.max(ANA.conta, 7); if (!ANA.vista) { const dx = P.pos.x - ANA.pos.x, dz = P.pos.z - ANA.pos.z, l = Math.hypot(dx, dz) || 1; if (l > 2.5) { ANA.pos.x += dx / l; ANA.pos.z += dz / l; } } }
    }), 3700);
  }
  // o HUD mente uma vez por capítulo
  function hudMente(s) {
    s.flags['l3_hud' + s.chapter] = true;
    const ops = []; if (s.inv.lanterna && $('#b-pilha')) ops.push('pilha'); if ($('#obj-list')) ops.push('obj');
    const o = pick(ops); if (!o) return;
    if (o === 'pilha') { const b = $('#b-pilha'); b.classList.add('l3-zero'); setTimeout(() => b.classList.remove('l3-zero'), 550); }
    else { const b = $('#obj-list'); b.dataset.l3 = T.mente_obj; b.classList.add('l3-mente'); setTimeout(() => b.classList.remove('l3-mente'), 650); }
  }
  // uma conquista que mente
  function conqFalsa(s) {
    s.flags.l3_conqFalsa = true; const L = s.hidden;
    elConq.className = ''; elConq.innerHTML = `<small>${T.conq_rot}</small><span class="t">${[...T.conq_falsa].map(c => `<i>${c === ' ' ? '&nbsp;' : c}</i>`).join('')}</span>`;
    elConq.style.opacity = 1; E.SFX.clique && E.SFX.clique();
    setTimeout(() => elConq.classList.add('escorre'), 1700);
    setTimeout(() => {
      elConq.className = 'eu'; elConq.innerHTML = `<span class="t">${T.conq_eu}</span>`;
      if (L && L.face) lingua({ x: L.x - L.face[0] * .7, y: 1.2, z: L.z - L.face[1] * .7 }); else lingua(K.atras(.8));
    }, 3400);
    setTimeout(() => { elConq.style.opacity = 0; }, 5600);
  }
  function truquesTela(dt, s) {
    if (!truques()) return;
    const calmo = !ameaca() && !s.hidden;
    if (!D3.trava && !s.flags.l3_trava && (s.chapter === 3 || s.chapter === 4) && calmo && s.tempo > 600 && s.capT > 90 && !P.bloqueado && !P.room.fora && Math.random() < dt / 150) travar(s);
    if (!s.flags['l3_hud' + s.chapter] && !facil() && s.chapter >= 1 && (s.fear > 55 || dM() < 14) && Math.random() < dt / 40) hudMente(s);
    if (s.hidden) D3.escondidaT += dt; else D3.escondidaT = 0;
    if (!s.flags.l3_conqFalsa && s.hidden && D3.escondidaT > 7 && s.chapter >= 1 && !ameaca() && Math.random() < dt / 12) conqFalsa(s);
  }
  // ele ainda ouve você: volume do jogo a zero com ele perto
  function surdo(dt, s) {
    const perto = M.ativo && (M.state === 'caca' || dM() < 8);
    if (+E.OPT.vol === 0 && perto) {
      if (!D3.surdo) { D3.surdo = 1; E.sub('', T.surdo_leg); if (!s.flags.l3_surdo) { s.flags.l3_surdo = true; setTimeout(() => E.sub('lia', T.surdo_lia), 1800); conquista('l3_surdo'); } }
      D3.surdoPulso -= dt; if (D3.surdoPulso <= 0 && M.path && M.path.length) { D3.surdoPulso = M.state === 'caca' ? .38 : .6; mostrar(elBorda, clamp(1.2 - dM() / 8, .25, 1), 0); setTimeout(() => sumir(elBorda, 300), 120); }
    } else D3.surdo = 0;
  }

  // ===================================================================== PAUSA QUE NÃO É SEGURA
  let PZ = null; // pausa aberta agora
  const pend = { tipo: null };
  const paraPend = (tipo, prio) => { const ordem = ['anaAba', 'esperou', 'abaLonga', 'eleEsperou', 'susto']; if (!pend.tipo || ordem.indexOf(tipo) < ordem.indexOf(pend.tipo)) pend.tipo = tipo; };
  function limparCamadaPausa() {
    if (!camadaPausa) return; const sil = camadaPausa.querySelector('.sil'); sil.style.opacity = 0; sil.className = 'sil';
    camadaPausa.querySelector('.linha').textContent = ''; camadaPausa.querySelector('.nota').textContent = '';
    if (h2) { h2.textContent = H2_ORIG; h2.classList.remove('l3-perto'); h2.style.color = ''; }
  }
  const aoPausar = seguro(() => {
    const s = S(); if (!s || !pausaEl) return;
    if (PZ && PZ.vivo) return; // voltou das opções para a mesma pausa
    limparCamadaPausa();
    const d = dM();
    PZ = { ini: agoraR(), vivo: true, perto: M.ativo && d < 3 && M.state !== 'agarra', ameaca: ameaca(), sala: P.room && P.room.id, foto: false, feito: {} };
    const nota = camadaPausa && camadaPausa.querySelector('.nota');
    if (PZ.perto) { h2.textContent = T.pausa_perto; h2.classList.add('l3-perto'); PZ.respI = setInterval(() => { if (M.ativo && E.ui === 'pausa') respDireta(2.2, { pan: panDe(M.pos), grave: true, vol: .05 }); }, 4200); }
    else if (ANA.ativa && ANA.conta > 0 && ANA.conta < 10 && nota) nota.textContent = T.pausa_ana.replace('{n}', NUM[ANA.conta]);
    else if (PROC.fase && nota) nota.textContent = T.pausa_proc;
    // a foto da pausa mostra o que não estava lá (raro, depois do cap. III, nunca na mesma sala duas vezes)
    s.flags.l3_salasFoto = s.flags.l3_salasFoto || [];
    PZ.foto = truques() && s.chapter >= 3 && s.tempo > 1200 && !PZ.ameaca && !s.flags.l3_salasFoto.includes(PZ.sala) && Math.random() < 1 / 12;
    PZ.tick = setInterval(seguro(tickPausa), 1000);
  });
  function tickPausa() {
    const s = S(); if (!PZ || !s) return;
    if (E.ui !== 'pausa') return;
    const t = (agoraR() - PZ.ini) / 1000, sil = camadaPausa && camadaPausa.querySelector('.sil'), ok = truques();
    if (PZ.foto && t >= 20 && !PZ.feito.foto && sil) { PZ.feito.foto = true; s.flags.l3_salasFoto.push(PZ.sala); sil.style.opacity = .3; }
    if (!ok) return;
    if (t >= 120 && !s.flags.l3_euEspero && !PZ.perto) { s.flags.l3_euEspero = true; const n = camadaPausa.querySelector('.nota'); n.textContent = T.eu_espero; unhaVidro(1.6); }
    if (t >= 180 && !s.flags.l3_caderno) { s.flags.l3_caderno = true; escrever(camadaPausa.querySelector('.linha'), T.caderno, 210); }
    if (t >= 180 && M.ativo && s.chapter >= 1 && !s.flags.l3_eleEsperou) paraPend('eleEsperou');
    if (t >= 240 && !s.flags.l3_letras && h2 && !PZ.perto) { s.flags.l3_letras = true; letrasCaem(); respDireta(3.2, { pan: -1, panFim: 1, vol: .12 }); }
    if (t >= 540 && !s.flags.l3_esperou) paraPend('esperou');
  }
  function escrever(el, txt, ms) { if (!el) return; el.textContent = ''; let i = 0; const f = () => { if (!PZ || !PZ.vivo || i >= txt.length) return; el.textContent += txt[i++]; if (txt[i - 1] !== ' ') dedoVidro(); setTimeout(f, ms + rand(-60, 90)); }; f(); }
  function letrasCaem() {
    const alvo = T.pausa_lia; h2.innerHTML = [...h2.textContent].map(c => `<i class="l3-cai">${c}</i>`).join('');
    const is = [...h2.querySelectorAll('i')]; is.forEach((el, k) => setTimeout(() => { if (PZ && PZ.vivo) el.classList.add('foi'); }, 600 + k * 700));
    setTimeout(() => { if (PZ && PZ.vivo && E.ui === 'pausa') { h2.textContent = alvo; h2.style.color = '#8a6f5a'; } }, 600 + is.length * 700 + 1800);
  }
  function fimPausa() {
    if (!PZ) return; const pz = PZ; PZ = null; pz.vivo = false; clearInterval(pz.tick); clearInterval(pz.respI); limparCamadaPausa();
    setTimeout(seguro(() => {
      if (!jogando() || E.ui) { pend.tipo = null; return; }
      const dur = (agoraR() - pz.ini) / 1000, s = S();
      if (!pend.tipo && truques() && !s.flags.l3_sustoPausa && s.chapter >= 4 && !facil() && !menosMov() && dur > 8 && !pz.ameaca && Math.random() < .35) pend.tipo = 'susto';
      const tipo = pend.tipo; pend.tipo = null; if (!tipo || !truques()) return;
      if (ameaca() && tipo !== 'anaAba') return;
      RETORNO[tipo](s);
    }), 300);
  }
  // o que espera por você quando a pausa fecha (nenhum deles dá dano)
  function sumirQuandoOlhar(g, p, { cos = .82, max = 6, luz = false, ao, fim } = {}) {
    let t = 0;
    K.anima(g, dt => {
      t += dt; if (!g.visible) return true;
      const s = S(); if (!s || s.dead) { g.visible = false; return true; }
      if (olhando(p, cos) && (!luz || s.flashOn) && t > .25) { g.visible = false; if (ao) ao(); return true; }
      if (t > max) { g.visible = false; if (fim) fim(); return true; }
    });
  }
  const RETORNO = {
    anaAba(s) { // a aba contou até dez: ela está a 3 m atrás de você
      const p = pontoAtras(3); if (!p) return; por(K.ANA2, p); sussurro({ x: p.x, y: 1.2, z: p.z }, .6, .12);
      sumirQuandoOlhar(K.ANA2, p, { luz: true, max: 2.2, ao: () => E.SFX.estalo({ x: p.x, z: p.z }, .6), fim: () => { sussurro(K.atras(.4), .7, .14); E.sub('ana', T.achei); } });
    },
    esperou(s) { // nove minutos: a contagem chegou ao dez e ela está colada atrás da Lia
      s.flags.l3_esperou = true; conquista('l3_esperou'); E.sub('ana', T.ainda_ai);
      const p = pontoAtras(.9); if (p) { por(K.ANA2, p); respDireta(3, { vol: .2 }); sumirQuandoOlhar(K.ANA2, p, { cos: .6, max: 7 }); }
      // e alguma coisa andou enquanto você não olhava: a porta fechada mais perto está aberta
      const d = W.doors.filter(d => !d.open && !d.grade && d.id !== 'main' && !(d.trava && d.trava()) && Math.hypot(d.x - P.pos.x, d.z - P.pos.z) < 9).sort((a, b) => Math.hypot(a.x - P.pos.x, a.z - P.pos.z) - Math.hypot(b.x - P.pos.x, b.z - P.pos.z))[0];
      if (d) K.abrirDevagar(d, -Math.PI * .5, .2);
    },
    abaLonga(s) { // dez minutos fora: por meio segundo, a Ana parada no seu lugar, de costas
      s.flags.l3_abaLonga = true; const p = pontoFrente(1.6); if (!p) return; por(K.ANA2, p, true); let n = 0; K.anima(K.ANA2, dt => { n += dt; if (n > .5) { K.ANA2.visible = false; return true; } });
    },
    eleEsperou(s) { // três minutos com ele solto: ele está parado logo atrás, e vai embora se você não correr
      s.flags.l3_eleEsperou = true; conquista('l3_ele_esperou'); const p = pontoAtras(2); if (!p) return;
      const G = K.SOMBRA; por(G, p); E.sub('', T.resp_perto); respDireta(2.6, { pan: panDe(p), grave: true, vol: .28 });
      let t = 0;
      K.anima(G, dt => {
        t += dt; if (!G.visible) return true;
        if (t > 4.5 || P.sprinting || (olhando(p, .85) && t > 1.2)) {
          G.visible = false; const f = { x: p.x - P.pos.x, z: p.z - P.pos.z }, l = Math.hypot(f.x, f.z) || 1;
          K.andarModelo(G, { x: G.position.x, z: G.position.z }, { x: p.x + f.x / l * 7, z: p.z + f.z / l * 7 }, 1.1, { passo: .95, sumirSe: () => !jogando() });
          return true;
        }
      });
    },
    susto(s) { // a câmera voltou 30 graus virada e a Ana está à frente, contando nove
      s.flags.l3_sustoPausa = true; const p = pontoFrente(3); if (!p) return; P.yaw += .52; // ela fica onde você olhava; a câmera é que voltou virada
      por(K.ANA2, p); sussurro({ x: p.x, y: 1.2, z: p.z }, .7, .13); E.sub('ana', T.nove);
      sumirQuandoOlhar(K.ANA2, p, { cos: .95, max: 5, ao: () => { E.sub('ana', T.dez); E.SFX.susto(); suave(); }, fim: () => E.SFX.risada(p.x, p.z) });
    }
  };
  if (pausaEl) new MutationObserver(() => {
    if (pausaEl.hidden) { setTimeout(() => { if (pausaEl.hidden && E.ui !== 'pausa') fimPausa(); }, 250); } // das opções para a mesma pausa não conta
  }).observe(pausaEl, { attributes: true, attributeFilter: ['hidden'] });

  // ===================================================================== ABA ESCONDIDA
  const linkIcone = document.querySelector('link[rel="icon"]'), ICONE = linkIcone && linkIcone.getAttribute('href');
  let olhoURL = null;
  function olhoIcone() {
    if (olhoURL) return olhoURL;
    const c = document.createElement('canvas'); c.width = c.height = 32; const x = c.getContext('2d');
    x.fillStyle = '#000'; x.fillRect(0, 0, 32, 32); x.fillStyle = '#d8d0c0'; x.beginPath(); x.ellipse(16, 16, 14, 7, 0, 0, Math.PI * 2); x.fill();
    x.fillStyle = '#5a1a12'; x.beginPath(); x.arc(16, 16, 5.5, 0, Math.PI * 2); x.fill(); x.fillStyle = '#000'; x.beginPath(); x.arc(16, 16, 2.6, 0, Math.PI * 2); x.fill();
    try { olhoURL = c.toDataURL('image/png'); } catch (e) { olhoURL = ICONE; } return olhoURL;
  }
  let abaIni = 0, abaAna = false, abaI = null, iconeT = null;
  document.addEventListener('visibilitychange', seguro(() => {
    if (teste()) return;
    const s = S();
    if (document.hidden) {
      if (E.mode !== 'jogo' || !s || s.dead || s.fim) return;
      abaIni = agoraR(); abaAna = !!ANA.ativa;
      if (truques() && linkIcone) { clearTimeout(iconeT); linkIcone.setAttribute('href', olhoIcone()); }
      if (abaAna && truques()) { clearInterval(abaI); abaI = setInterval(() => { const e = agoraR() - abaIni; if (e < 30000) return; const n = Math.min(10, Math.floor((e - 30000) / 3000) + 1); document.title = n < 10 ? `${n}...` : 'DEZ.'; }, 1000); }
    } else if (abaIni) {
      const dur = agoraR() - abaIni; abaIni = 0; clearInterval(abaI); abaI = null;
      if (linkIcone && ICONE) { clearTimeout(iconeT); iconeT = setTimeout(() => linkIcone.setAttribute('href', ICONE), 30000); }
      if (!s || s.dead || !truques()) return;
      if (dur > 120000 && E.ui === 'pausa' && camadaPausa) { // você saiu. ela não.
        const n = camadaPausa.querySelector('.nota'), sil = camadaPausa.querySelector('.sil'); n.textContent = T.saiu; sil.style.transition = 'none'; sil.style.opacity = .45;
        setTimeout(() => { sil.style.transition = ''; sil.style.opacity = 0; }, 1000);
      }
      if (abaAna && dur > 30000) paraPend('anaAba');
      if (dur > 600000 && !s.flags.l3_abaLonga) paraPend('abaLonga');
    }
  }));
  // largou o computador com o jogo visível: dedinhos no vidro da tela
  let blurIni = 0, blurEscondeu = false;
  addEventListener('blur', () => { blurIni = agoraR(); blurEscondeu = document.hidden; });
  document.addEventListener('visibilitychange', () => { if (document.hidden && blurIni) blurEscondeu = true; });
  addEventListener('focus', seguro(() => {
    const dur = blurIni ? agoraR() - blurIni : 0; blurIni = 0; const s = S();
    if (dur < 90000 || blurEscondeu || !truques() || E.mode !== 'jogo' || !s || s.dead || s.flags['l3_dedos' + s.chapter]) return;
    s.flags['l3_dedos' + s.chapter] = true; dedinhos(); risadinha(-1, 1, .06);
  }));
  let dedosDe = null;
  function dedinhos() {
    const w = cvDedos.width = Math.min(1280, innerWidth), h = cvDedos.height = Math.round(w * innerHeight / innerWidth), x = cvDedos.getContext('2d');
    x.clearRect(0, 0, w, h); const cx = rand(.3, .7) * w, cy = rand(.35, .65) * h;
    for (let m = 0; m < 2; m++) {
      const bx = cx + (m ? rand(.12, .2) * w : 0), by = cy + (m ? rand(-.05, .05) * h : 0);
      for (let i = 0; i < 5; i++) { const ax = bx + (i - 2) * w * .022 + rand(-4, 4), ay = by - (i === 0 || i === 4 ? 0 : w * .03) + rand(-4, 4), r = w * (i === 0 ? .009 : .008); const gr = x.createRadialGradient(ax, ay, 0, ax, ay, r * 1.6); gr.addColorStop(0, 'rgba(200,205,210,.55)'); gr.addColorStop(.6, 'rgba(170,175,180,.25)'); gr.addColorStop(1, 'rgba(160,160,160,0)'); x.fillStyle = gr; x.beginPath(); x.ellipse(ax, ay, r * 1.2, r * 1.6, rand(-.3, .3), 0, Math.PI * 2); x.fill(); }
      const gr = x.createRadialGradient(bx, by + w * .045, 0, bx, by + w * .045, w * .04); gr.addColorStop(0, 'rgba(190,195,200,.35)'); gr.addColorStop(1, 'rgba(160,160,160,0)'); x.fillStyle = gr; x.beginPath(); x.ellipse(bx, by + w * .045, w * .035, w * .04, 0, 0, Math.PI * 2); x.fill();
    }
    cvDedos.style.filter = 'blur(1.5px)'; mostrar(cvDedos, .85); dedosDe = { x: P.pos.x, z: P.pos.z };
  }
  // trocou o fone de ouvido: um estalo de língua só no lado esquerdo
  try { if (navigator.mediaDevices && navigator.mediaDevices.addEventListener) navigator.mediaDevices.addEventListener('devicechange', seguro(() => {
    let fone = true; try { fone = JSON.parse(localStorage.getItem('hora-silencio-plat') || '{}').fone !== false; } catch (e) {}
    if (!fone || sess.fone || !truques() || !emJogo()) return; sess.fone = true;
    E.sub('lia', T.fone); setTimeout(() => lingua(null, -1), 2200);
  })); } catch (e) {}
  // janela espremida: a tela vira a fresta de um armário e um olho passa do outro lado
  let largAnt = innerWidth;
  addEventListener('resize', seguro(() => {
    const w = innerWidth, era = largAnt; largAnt = w;
    if (sess.fresta || toqueDev() || !truques() || !emJogo() || !(w < 480 && era >= 480)) return;
    sess.fresta = true; mostrar(elFresta, 1); conquista('l3_fresta');
    const olho = elFresta.firstChild; olho.style.transition = 'none'; olho.style.left = '-12vw'; void olho.offsetWidth; olho.style.transition = 'left 2.4s cubic-bezier(.5,0,.5,1)';
    setTimeout(() => { olho.style.left = '104vw'; sussurro(null, .5, .12); E.sub('ana', T.achei); }, 900);
    setTimeout(() => sumir(elFresta, 1300), 4200);
  }));
  // saiu da tela cheia no cap. III: o rosto dela colado na câmera por dois quadros (uma vez por save)
  let estavaCheia = !!document.fullscreenElement;
  document.addEventListener('fullscreenchange', seguro(() => {
    const cheia = !!document.fullscreenElement, saiu = estavaCheia && !cheia; estavaCheia = cheia; const s = S();
    if (!saiu || !truques() || !s || s.chapter !== 3 || E.mode !== 'jogo' || s.dead || ls.get().telaCheia) return;
    lsMarca('telaCheia');
    setTimeout(() => { if (semFlash()) { risadinha(0, 0, .04); return; } mostrar(elRosto, 1, 0); setTimeout(() => { elRosto.style.opacity = 0; elRosto.classList.add('off'); }, 70); E.SFX.susto && E.SFX.susto(); }, 1000);
  }));

  // ===================================================================== MORTE
  let ultRapido = false, lantSolta = false, mortaI = null;
  function soltarLanterna() {
    const L = E.flash; if (!L || lantSolta) return false;
    L.updateMatrixWorld(true); const wp = new THREE.Vector3(); L.getWorldPosition(wp);
    camera.remove(L); camera.remove(L.target); scene.add(L); scene.add(L.target); L.position.copy(wp); L.target.position.copy(wp); lantSolta = true; return true;
  }
  function devolverLanterna() {
    const L = E.flash; if (!L || !lantSolta) return;
    scene.remove(L); scene.remove(L.target); camera.add(L); camera.add(L.target); L.position.set(.22, -.18, 0); L.target.position.set(0, -.15, -5); lantSolta = false;
  }
  const atrasoMorte = rapido => { ultRapido = !!rapido; return rapido ? 0 : 700; }; // a morte demora um pouco mais, menos quando você morre seguido no mesmo ponto
  const morte = seguro(quem => {
    const s = S(); if (!s) return;
    if (quem === 'ana') s.flags.l3_mAna = (s.flags.l3_mAna || 0) + 1;
    D3.fio = null; giz.esconder(); D3.desat = 0; sumir(elDesat, 100); elDesat2.style.opacity = 0; elDesat2.classList.add('off'); sumir(elTunel, 100);
    const comLuz = s.flashOn && s.inv.lanterna;
    // o coração para e a respiração da Lia falha
    [600, 1150, 1900].forEach((ms, i) => setTimeout(() => { if (S() && S().dead) E.SFX.coracao(1 - i * .32); }, ms));
    setTimeout(() => { if (!S() || !S().dead) return; respDireta(.9, { vol: .16, tremor: 8 }); }, 520);
    setTimeout(() => { if (!S() || !S().dead || ultRapido) return; K.vacuo(.7, .12); fitaArrastada(); mostrar(elFita, .9); }, 1000);
    setTimeout(() => sumir(elFita, 400), 2300);
    // quem te pegou, visto do chão
    setTimeout(seguro(() => {
      if (!S() || !S().dead || ultRapido) return; const c = camera.position, f = K.fwdH();
      if (quem === 'inspetor') { const p = { x: c.x + f.x * .7, y: .1, z: c.z + f.z * .7 }; K.passoPos(p, .9); setTimeout(() => K.passoPos({ x: p.x + f.z * .3, y: .1, z: p.z - f.x * .3 }, 1), 380); }
      else if (quem === 'ana') { for (let i = 0; i < 3; i++) setTimeout(() => K.passoPos({ x: c.x + f.x * (1 - i * .2), y: .1, z: c.z + f.z * (1 - i * .2) }, .6, true), i * 180); setTimeout(() => risadinha(-.2, .2, .04), 700); }
      else if (quem === 'procissao') { // as velas passam por cima de você
        const L = K.luzRosto, a0 = performance.now(), sx = -f.z, sz = f.x; L.color.setHex(0xffa040);
        (function anim() { const k = (performance.now() - a0) / 900; if (k >= 1 || !S() || !S().dead) { L.intensity = 0; L.color.setHex(0xfff4e8); return; } L.position.set(c.x + sx * lerp(-2.4, 2.4, k), c.y + .7, c.z + sz * lerp(-2.4, 2.4, k)); L.intensity = 5 + Math.random() * 3; requestAnimationFrame(anim); })();
      }
    }), 900);
    // a lanterna cai, rola girando o facho pela sala e para iluminando os pés de quem te pegou
    if (comLuz) setTimeout(seguro(() => {
      if (!S() || !S().dead || ultRapido || !soltarLanterna()) return;
      const L = E.flash, p0 = L.position.clone(), f = K.fwdH(), lado = Math.random() < .5 ? -1 : 1;
      const chao = new THREE.Vector3(p0.x + f.x * .35 - f.z * .45 * lado, .07, p0.z + f.z * .35 + f.x * .45 * lado);
      const alvoPes = () => quem === 'inspetor' && MON.g.visible ? MON.g.position : quem === 'ana' ? (K.ANA2.visible ? K.ANA2.position : ANA_G.position) : PROC.pos;
      const a0 = Math.atan2(f.x, f.z), t0 = performance.now(), I0 = L.intensity || 20; let bateu = false;
      (function anim() {
        const s2 = S(); if (!s2 || !s2.dead || !lantSolta) return;
        const k = (performance.now() - t0) / 1000, q = Math.min(1, k / .32);
        const y = k < .32 ? lerp(p0.y, .07, q * q) : .07 + Math.abs(Math.sin(Math.min(1, (k - .32) / .25) * Math.PI)) * .08 * Math.max(0, 1 - (k - .32) * 4);
        if (k >= .32 && !bateu) { bateu = true; K.batida({ x: chao.x, y: .1, z: chao.z }, .45); K.rolar({ x: chao.x, y: .1, z: chao.z }, .9); }
        const r = Math.min(1, k / 1.1), e = 1 - Math.pow(1 - r, 3);
        L.position.set(lerp(p0.x, chao.x, Math.min(1, k / .5)), y, lerp(p0.z, chao.z, Math.min(1, k / .5)));
        const pe = alvoPes(), af = Math.atan2(pe.x - L.position.x, pe.z - L.position.z), a = af + lado * Math.PI * 2.5 * (1 - e) + (a0 - af) * (1 - e) * .1;
        L.target.position.set(L.position.x + Math.sin(a) * 3, .02, L.position.z + Math.cos(a) * 3);
        L.intensity = k > 1.3 ? (Math.random() < .5 ? 0 : I0 * .6) : I0;
        if (k < 1.6) requestAnimationFrame(anim); else L.intensity = 0;
      })();
    }), 500);
  });
  // a tela de morte: olha de volta, o foco anda sozinho, e raramente ele fala com você
  const elMorte = $('#death');
  if (elMorte) new MutationObserver(seguro(() => {
    clearInterval(mortaI); mortaI = null; const s = S();
    if (elMorte.hidden || !s || !s.dead) return;
    devolverLanterna();
    const dica = $('#death-dica'), quem = s.causa;
    if (quem === 'inspetor' && s.mortes > 2 && Math.random() < 1 / 40 && dica && truques()) { dica.textContent = T.morte_fica; setTimeout(() => vozGrave(null), 600); }
    if (quem === 'ana' && (s.flags.l3_mAna || 0) >= 3 && !s.flags.l3_foco && truques()) {
      s.flags.l3_foco = true; const a = $('#dt-retry'), b = $('#dt-menu');
      setTimeout(() => { if (!elMorte.hidden && b) { b.focus(); risadinha(.3, -.3, .05); } }, 2200);
      setTimeout(() => { if (!elMorte.hidden && a) a.focus(); }, 3100);
    }
    const ini = agoraR();
    mortaI = setInterval(() => {
      if (elMorte.hidden) { clearInterval(mortaI); mortaI = null; return; }
      if (s.flags.l3_mortaOlha || !truques()) return;
      if (agoraR() - D3.ultInput > 25000 && agoraR() - ini > 25000) { s.flags.l3_mortaOlha = true; if (dica) dica.textContent = T.morte_olha; sussurro(null, .9, .1); }
    }, 1000);
  })).observe(elMorte, { attributes: true, attributeFilter: ['hidden'] });
  // tentar de novo: a fita rebobina até o ponto salvo
  const btRetry = $('#dt-retry');
  if (btRetry) btRetry.addEventListener('click', seguro(() => {
    devolverLanterna(); if (teste()) return;
    rebobinar(); mostrar(elRew, 1, 0); setTimeout(() => sumir(elRew, 400), 520);
  }));

  // ===================================================================== TÍTULO E CALIBRAGEM
  const tit = $('#title');
  const noTitulo = () => tit && !tit.hidden && E.mode === 'titulo';
  let nevoaN = 0, nevoaOn = false, cursorFeito = false, tituloIni = 0, insoniaFeita = false;
  function nevoaEscrever() {
    nevoaOn = true; nevoaN++; const w = cvNevoa.width = Math.min(1280, innerWidth), h = cvNevoa.height = Math.round(w * innerHeight / innerWidth), x = cvNevoa.getContext('2d');
    const gr = x.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w * .7); gr.addColorStop(0, 'rgba(190,198,205,.55)'); gr.addColorStop(1, 'rgba(150,158,165,.35)'); x.fillStyle = gr; x.fillRect(0, 0, w, h);
    for (let i = 0; i < 260; i++) { x.fillStyle = `rgba(220,226,232,${rand(.03, .1)})`; x.beginPath(); x.arc(rand(0, w), rand(0, h), rand(2, 14), 0, Math.PI * 2); x.fill(); }
    mostrar(cvNevoa, 1);
    const palavra = nevoaN >= 3 ? 'LIA' : T.fica, tam = Math.round(h * .16); x.font = `${tam}px "IM Fell English SC",Georgia,serif`; x.textBaseline = 'middle';
    const larg = x.measureText(palavra).width; let px = w / 2 - larg / 2, i = 0;
    const letra = () => {
      if (!nevoaOn || i >= palavra.length) return; const c = palavra[i++];
      x.save(); x.globalCompositeOperation = 'destination-out'; x.fillStyle = 'rgba(0,0,0,.85)'; x.translate(px, h * .62 + rand(-6, 6)); x.rotate(rand(-.08, .08)); x.fillText(c, 0, 0);
      x.globalAlpha = .4; for (let k = 0; k < 3; k++) x.fillRect(rand(0, tam * .5), tam * .3, 2, rand(10, tam * .6)); x.restore(); // escorre
      px += x.measureText(c).width + tam * .08; dedoVidro(); setTimeout(dedoVidro, 160); setTimeout(letra, 900);
    };
    setTimeout(letra, 2600);
  }
  function apagarTitulo() {
    if (nevoaOn) { nevoaOn = false; sumir(cvNevoa, 2600); }
    if (elCursor.style.opacity !== '0' && elCursor.style.opacity) { elCursor.style.transition = 'opacity .1s'; elCursor.style.opacity = 0; }
  }
  addEventListener('mousemove', apagarTitulo); addEventListener('keydown', apagarTitulo); addEventListener('pointerdown', apagarTitulo);
  addEventListener('touchstart', apagarTitulo, { passive: true });
  function cursorFantasma() {
    const alvo = $('#b-novo'); if (!alvo) return; cursorFeito = true; const r = alvo.getBoundingClientRect();
    elCursor.style.transition = 'none'; elCursor.style.left = (innerWidth - 40) + 'px'; elCursor.style.top = (innerHeight - 50) + 'px'; elCursor.style.opacity = 0; void elCursor.offsetWidth;
    elCursor.style.transition = ''; elCursor.style.opacity = .9;
    setTimeout(() => { elCursor.style.left = (r.left + r.width * .62) + 'px'; elCursor.style.top = (r.top + r.height * .45) + 'px'; }, 60);
  }
  function insonia() {
    insoniaFeita = true; conquista('l3_insonia');
    const rr = $('#radiorel'); if (rr && rr.parentElement) { const e = document.createElement('div'); e.id = 'l3-insonia'; e.textContent = T.insonia; rr.parentElement.appendChild(e); }
    setTimeout(() => { if (!noTitulo()) return; const h1 = $('#t-titulo'); if (!h1) return; const m = document.createElement('div'); m.id = 'l3-menina-tit'; tit.appendChild(m); requestAnimationFrame(() => requestAnimationFrame(() => { m.style.left = '108%'; })); setTimeout(() => m.remove(), 10000); }, 30000);
  }
  // a calibragem: brilho no máximo por 10 s revela um quarto sino e alguém atrás dele
  let sinoT = 0, sinoOn = false;
  function calibragem(dt) {
    const simb = $('#vc-simb'), br = $('#vc-brilho'); if (!simb || !br || !simb.offsetParent) { sinoT = 0; return; }
    if (+br.value >= +br.max - .001) { sinoT += dt; if (sinoT > 10 && !sinoOn) { sinoOn = true; const i = document.createElement('i'); i.className = 'l3-sino4'; const b = document.createElement('b'); b.className = 'l3-menina'; simb.append(i, b); if (!ls.get().sino4) { lsMarca('sino4'); conquista('l3_sino4'); } } }
    else { sinoT = 0; if (sinoOn) { sinoOn = false; simb.querySelectorAll('.l3-sino4,.l3-menina').forEach(e => e.remove()); } }
  }
  // fechou o diário ou a nota com medo: alguém respira (ou pergunta) logo atrás, uma vez por capítulo
  let uiAnt = null;
  function depoisDoMenu() {
    const s = S(), ui = E.ui; if (!s || E.mode !== 'jogo') { uiAnt = ui; return; }
    if (!ui && (uiAnt === 'diario' || uiAnt === 'nota') && !s.dead && s.chapter >= 1 && !ameaca() && !P.room.fora) {
      const k = 'l3_menu' + uiAnt + s.chapter;
      if (!s.flags[k] && (uiAnt === 'nota' ? Math.random() < 1 / 6 : s.fear > 45 && Math.random() < 1 / 4)) {
        s.flags[k] = true;
        if (uiAnt === 'nota') setTimeout(() => { if (jogando()) { sussurro(K.atras(.5), .8, .12); E.sub('', T.leu); } }, 700);
        else setTimeout(() => { if (jogando()) respDireta(1.2, { pan: rand(-.4, .4), vol: .2 }); }, 500);
      }
    }
    uiAnt = ui;
  }
  setInterval(seguro(() => {
    depoisDoMenu(); calibragem(.5);
    if (!noTitulo() || teste()) { tituloIni = 0; return; }
    if (!tituloIni) tituloIni = agoraR();
    const parado = agoraR() - D3.ultInput;
    if (truques()) {
      if (parado > 60000 && !nevoaOn && agoraR() - (sess.nevoaUlt || 0) > 60000) { sess.nevoaUlt = agoraR(); nevoaEscrever(); }
      if (parado > 120000 && !cursorFeito && !toqueDev()) cursorFantasma();
      const hr = new Date().getHours(); if (hr < 4 && !insoniaFeita) insonia();
    }
  }), 500);

  // ===================================================================== CICLO
  const update = seguro((dt, s) => {
    if (lantSolta) devolverLanterna();
    if (D3.cap !== s.chapter) { D3.cap = s.chapter; D3.fioCap = 0; D3.passoN = 0; D3.qN = 0; }
    if (!D3.ultPos) D3.ultPos = { x: P.pos.x, z: P.pos.z };
    if (Math.hypot(P.pos.x - D3.ultPos.x, P.pos.z - D3.ultPos.z) > .02) { D3.ultInput = agoraR(); D3.ultPos.x = P.pos.x; D3.ultPos.z = P.pos.z; } // controle e toque também contam como mexer
    porUmFio(dt, s); alivio(s); alucinacoes(dt, s); contagem(s); truquesTela(dt, s); surdo(dt, s);
    if (dedosDe && Math.hypot(P.pos.x - dedosDe.x, P.pos.z - dedosDe.z) > 1.2) { dedosDe = null; sumir(cvDedos, 1600); }
    // a câmera torce para o lado do golpe e volta
    if (rollV) { roll += rollV; rollV = 0; }
    if (Math.abs(roll) > .002) { camera.rotation.z += roll; roll *= Math.pow(.02, dt); } else roll = 0;
  });
  const fimCap = seguro(() => {
    const s = S(); const fc = $('#fimcap'); if (!fc) return;
    let el = $('#l3-fc'); if (!el) { el = document.createElement('div'); el.id = 'l3-fc'; el.className = 'stats'; const ref = $('#fc-stats'); if (ref) ref.after(el); else fc.appendChild(el); }
    el.textContent = D3.fioCap ? T.fio_cap.replace('{n}', D3.fioCap).replace('{vez}', D3.fioCap > 1 ? 'vezes' : 'vez') : '';
  });
  const novoMapa = seguro(() => { devolverLanterna(); giz.esconder(); D3.fio = null; D3.tunelOn = false; sumir(elTunel, 100); sumir(elBorda, 100); janelas.length = 0; roll = rollV = 0; D3.estM = null; D3.pilha = 1e9; D3.kits = -1; D3.vida = 1e9; D3.ultPos = null; dedosDe = null; sumir(cvDedos, 100); });
  return { update, golpe, notou, avisar, suave, assustou, escala, atrasoMorte, morte, aoPausar, fimCap, novoMapa, _D3: D3, _t: { RETORNO, giz, travar, conqFalsa, hudMente, dedinhos, nevoaEscrever, cursorFantasma, insonia, fimPausa, get lantSolta() { return lantSolta; } } };
}
