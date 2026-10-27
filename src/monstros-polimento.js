// MONSTROS — POLIMENTO (Lote 3, área Monstros e IA)
// Sensação, plataforma e acessibilidade das entidades: o som de "ele te ouviu", o replay de como ele te achou,
// a sombra dele dobrando a esquina, a porta arrombada, o microfone, a graça da porta aberta, a vibração da contagem,
// o cérebro em ritmo menor no aparelho fraco, legendas para os sons das entidades e a vida nos corpos deles.
// O motor (jogo.js) chama criarMonstrosPolimento(E) uma vez; os ganchos devolvidos entram com poucas linhas.
import * as THREE from 'three';

export function criarMonstrosPolimento(E) {
  const { R, rand, clamp, lerp, camera, scene, W, P, M, MON, VULTO, ANA, ANA_G, PROC, MAT, UIX, SOMX } = E;
  const S = () => E.S;
  const F = () => (E.S && E.S.flags) || {};
  const seguro = fn => (...a) => { try { return fn(...a); } catch (e) { console.warn('[monstros-polimento]', e && e.message); } };
  const $ = s => document.querySelector(s);
  const dist = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);
  const agora = () => performance.now() / 1000;
  const plat = () => (window.__plat && window.__plat.O) || {};
  const qual = () => plat().qual || 'alta';
  const toque = () => document.body.classList.contains('toque');
  const tremorK = () => { const t = plat().tremor; return t === undefined ? 1 : clamp(+t, 0, 1); };
  const temAudio = () => !!E.AC;
  const pesadelo = () => S() && S().dif === 'pesadelo';
  const _a = new THREE.Vector3(), _b = new THREE.Vector3(), _c = new THREE.Vector3();
  const rc = new THREE.Raycaster(), EIXO_Y = new THREE.Vector3(0, 1, 0);

  // ---------------------------------------------------------------- estilo
  const css = document.createElement('style');
  css.textContent = `
  #toque button.ml3-pulsa{animation:ml3pulsa .45s ease-in-out infinite alternate;border-color:#c0392b!important;color:#f6ddd6!important}
  @keyframes ml3pulsa{from{box-shadow:0 0 0 0 rgba(192,57,43,0)}to{box-shadow:0 0 18px 5px rgba(192,57,43,.7)}}
  @media (prefers-reduced-motion: reduce){#toque button.ml3-pulsa{animation:none;box-shadow:0 0 12px 3px rgba(192,57,43,.65)}}
  #ml3-frio{position:fixed;inset:0;pointer-events:none;opacity:0;transition:opacity .45s;background:radial-gradient(ellipse at 50% 50%,rgba(0,0,0,0) 52%,rgba(150,190,235,.22) 82%,rgba(190,220,255,.38) 100%)}
  #ml3-entregou{font-family:"Special Elite",monospace;font-size:14px;color:#c9a75a;margin:4px 0 8px;letter-spacing:.04em}
  #ml3-ver{border-color:#6d2a22}
  body.ml3-replay #death{opacity:0!important;pointer-events:none!important}
  body.ml3-replay #hud{display:none!important}
  #ml3-tarja{position:fixed;left:0;right:0;top:5vh;text-align:center;pointer-events:none;font-family:"Special Elite",monospace;color:#e9dfc8;text-shadow:0 0 8px #000,0 0 2px #000;z-index:60;opacity:0}
  #ml3-tarja.on{opacity:1}
  #ml3-tarja b{display:block;font-size:22px;letter-spacing:.12em;font-weight:normal}
  #ml3-tarja small{display:block;margin-top:6px;font-size:13px;color:#a99e86}
  #ml3-tarja .leg{margin-top:10px;font-size:13px}
  #ml3-tarja .leg i{font-style:normal;margin:0 8px}
  #ml3-barra{position:fixed;left:50%;bottom:7vh;width:240px;height:3px;margin-left:-120px;background:rgba(255,255,255,.12);z-index:60;opacity:0;pointer-events:none}
  #ml3-barra.on{opacity:1}#ml3-barra i{display:block;height:100%;width:0;background:#c9a75a}`;
  document.head.appendChild(css);
  const frio = document.createElement('div'); frio.id = 'ml3-frio'; frio.className = 'fx';
  { const fm = $('#fx-monstro') || $('#fx-locker'); if (fm) fm.before(frio); else document.body.appendChild(frio); }

  // ---------------------------------------------------------------- vibração (controle e celular)
  let vibProprio = false, vibCd = -99;
  function vib(forte, fraco, ms) {
    if (plat().vibrar === false) return;
    try { const pads = navigator.getGamepads ? navigator.getGamepads() : []; for (const g of pads) if (g && g.connected && g.vibrationActuator && g.vibrationActuator.playEffect) { g.vibrationActuator.playEffect('dual-rumble', { duration: ms, strongMagnitude: clamp(forte, 0, 1), weakMagnitude: clamp(fraco, 0, 1) }).catch(() => {}); break; } } catch (e) {}
    try { if (toque() && navigator.vibrate) { vibProprio = true; navigator.vibrate(Math.round(ms)); } } catch (e) {}
    vibProprio = false;
  }
  // o aparelho vibrou (dano, badalada): com ele colado no seu esconderijo, ele vira a cabeça
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    const orig = navigator.vibrate.bind(navigator);
    try { navigator.vibrate = p => { if (!vibProprio) seguro(aoVibrar)(); return orig(p); }; } catch (e) {}
  }
  function aoVibrar() {
    const St = S(); if (!St || St.dead || !St.hidden || !M.ativo || E.mode !== 'jogo') return;
    if (dist(M.pos, P.pos) > 4 || ['agarra', 'bote', 'vasculha', 'fareja', 'caca'].includes(M.state)) return;
    if (agora() - vibCd < 6) return; vibCd = agora();
    M.olhar = new THREE.Vector3(St.hidden.x, 0, St.hidden.z); M.olharT = 1.1; M.wait = Math.max(M.wait, 1);
    E.SX.estalo(M.pos, .8); leg('ml3_vira', M.pos); St.fear = Math.min(100, St.fear + 12);
    if (!F().ml3_vibrou) { F().ml3_vibrou = true; setTimeout(() => E.subPequeno('lia', 'Ele sentiu alguma coisa tremer aqui dentro...'), 900); }
  }

  // ---------------------------------------------------------------- tranco na mira (respeita "tremor de câmera")
  function tranco(k) { const t = tremorK(); if (!t) return; P.pitch = (P.pitch || 0) + k * t; P.yaw += rand(-.6, .6) * k * t; P.shake = Math.max(P.shake || 0, k * 1.5 * t); }

  // ---------------------------------------------------------------- sons novos
  const SOM = {
    corda() { // nota grave de corda, curta: o instante em que ele te ouviu
      const AC = E.AC, t = AC.currentTime, g = E.saida(null, .25), lp = AC.createBiquadFilter();
      lp.type = 'lowpass'; lp.Q.value = 2; lp.frequency.setValueAtTime(1500, t); lp.frequency.exponentialRampToValueAtTime(240, t + .9); lp.connect(g);
      for (const [f, k] of [[55, 1], [55.7, .7], [110.4, .3]]) { const o = AC.createOscillator(), gg = AC.createGain(); o.type = 'sawtooth'; o.frequency.setValueAtTime(f * 1.04, t); o.frequency.exponentialRampToValueAtTime(f, t + .08); gg.gain.value = k; o.connect(gg); gg.connect(lp); o.onended = () => { o.disconnect(); gg.disconnect(); }; o.start(t); o.stop(t + 1.3); }
      E.burst(t, .12, 'bandpass', 700, 1.5, lp);
      g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(.55, t + .025); g.gain.exponentialRampToValueAtTime(.12, t + .35); g.gain.exponentialRampToValueAtTime(.0001, t + 1.2);
    },
    racha(x, z) { // a porta estoura: madeira lascando e o baque na parede
      const AC = E.AC, t = AC.currentTime, p = { x, y: 1.2, z };
      const g = E.saida(p, .6); E.burst(t, .25, 'bandpass', 1800, 1.2, g, 0); E.env(g, t, .002, 1.6, .3);
      for (let i = 0; i < 7; i++) { const g2 = E.saida(p, .4), k = rand(.04, .55); E.burst(t + k, .04, 'highpass', 2600, 2, g2); E.env(g2, t + k, .001, .45, .05); }
      const g3 = E.saida(p, .7), o = AC.createOscillator(); o.frequency.setValueAtTime(95, t); o.frequency.exponentialRampToValueAtTime(38, t + .3); o.connect(g3); E.env(g3, t, .003, 1.3, .35); o.start(t); o.stop(t + .45);
    },
    pescoco(pos) { const t = E.AC.currentTime; for (const k of [0, .05, .11]) { const g = E.saida({ x: pos.x, y: pos.baixo ? 1.1 : 2.9, z: pos.z }, .3); E.burst(t + k, .014, 'highpass', 3400, 1, g); E.env(g, t + k, .001, .38, .02); } },
    uivo(pos) { // a presa escapou: um grito de raiva, curto e rachado
      const AC = E.AC, t = AC.currentTime, g = E.saida({ x: pos.x, y: 2.8, z: pos.z }, .5), f = AC.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 620; f.Q.value = 3; f.connect(g);
      const o = AC.createOscillator(); o.type = 'sawtooth'; o.frequency.setValueAtTime(150, t); o.frequency.linearRampToValueAtTime(95, t + .7); o.connect(f); o.start(t); o.stop(t + .8);
      E.burst(t, .7, 'bandpass', 1100, 2, f); E.env(g, t, .04, .5, .7);
    },
    arrasto(pos) { const t = E.AC.currentTime, g = E.saida({ x: pos.x, y: .1, z: pos.z }, .3); const fl = E.burst(t, .4, 'lowpass', 420, 1, g); fl.frequency.linearRampToValueAtTime(260, t + .4); E.env(g, t, .06, .3, .34); },
    alivio() { const t = E.AC.currentTime, g = E.saida(null, .1); const f = E.burst(t, .7, 'bandpass', 1000, 1.2, g); f.frequency.linearRampToValueAtTime(600, t + .7); E.env(g, t, .05, .22, .6); },
    rangeTeto(pos) { const AC = E.AC, t = AC.currentTime, g = E.saida({ x: pos.x, y: 3.1, z: pos.z }, .4), o = AC.createOscillator(), f = AC.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 900; f.Q.value = 6; o.type = 'sawtooth'; o.frequency.setValueAtTime(70, t); o.frequency.linearRampToValueAtTime(55, t + .6); o.connect(f); f.connect(g); E.env(g, t, .15, .12, .5); o.start(t); o.stop(t + .8); },
    lasca(x, z) { const t = E.AC.currentTime, g = E.saida({ x, y: .05, z }, .3); E.burst(t, .03, 'highpass', 3000, 1, g); E.env(g, t, .001, .25, .03); }
  };
  const SM = new Proxy({}, { get: (t, k) => (...a) => { if (!temAudio()) return; try { return SOM[k] && SOM[k](...a); } catch (e) { console.warn(e); } } });

  // ---------------------------------------------------------------- legendas (sons das entidades e o que eles estão fazendo)
  const xz = a => ({ x: a[0], z: a[1] });
  const p0 = a => a[0] && a[0].x !== undefined ? a[0] : null;
  const LEG = {
    ml3_ouviu: { t: 'ele te ouviu', imp: 1, cd: 1.5, cat: 'p', insp: true, pos: p0 },
    ml3_quase: { t: 'ele quase te ouviu', imp: 1, cd: 3, cat: 'p', insp: true, pos: p0 },
    ml3_vira: { t: 'ele vira o rosto para você', imp: 1, cd: 2, cat: 'p', insp: true, pos: p0 },
    ml3_escuta: { t: 'ele parou para escutar', imp: 1, cd: 4, cat: 'p', insp: true, pos: p0 },
    ml3_alerta: { t: 'tudo fica em silêncio de repente', imp: 1, cd: 3, cat: 'p', insp: true, pos: p0 },
    ml3_bote: { t: 'ele ergue os braços', imp: 1, cd: 2, cat: 'p', insp: true, pos: p0 },
    ml3_fareja: { t: 'ele fareja a porta do esconderijo', imp: 1, cd: 3, cat: 'p', insp: true, pos: p0 },
    ml3_vasculha: { t: 'ele bate no seu esconderijo', imp: 1, cd: 3, cat: 'p', insp: true, pos: p0 },
    ml3_desiste: { t: 'ele se afasta do esconderijo', imp: 1, cd: 4, cat: 'p', pos: p0 },
    ml3_recuo: { t: 'ele está indo embora', imp: 1, cd: 6, cat: 'p', pos: p0 },
    ml3_volta: { t: 'um estalo perto da porta: ele voltou', imp: 1, cd: 6, cat: 'p', insp: true, pos: p0 },
    ml3_arromba: { t: 'uma porta é arrombada', imp: 1, cd: 2, cat: 'p', insp: true, pos: p0 },
    ml3_porta: { t: 'ele parou do outro lado da porta', imp: 1, cd: 3, cat: 'p', insp: true, pos: p0 },
    ml3_ana_perto: { t: 'pezinhos descalços bem perto', imp: 1, cd: 5, cat: 'p', pos: p0 },
    ml3_ana_teto: { t: 'algo cai do teto', imp: 1, cd: 3, cat: 'p', pos: p0 },
    ml3_teto: { t: 'algo range no teto, logo acima', imp: 1, cd: 5, cat: 'p', pos: p0 },
    ml3_dez: { t: 'DEZ — ela está atrás de você', imp: 1, cd: 2, cat: 'p', pos: p0 },
    ml3_fresta: { t: 'a porta abre uma fresta', imp: 1, cd: 3, cat: 'p', pos: p0 },
    ml3_proc_para: { t: 'a fila para', imp: 1, cd: 4, cat: 'p', pos: p0 },
    ml3_luzes: { t: 'as luzes voltam, uma a uma', imp: 0, cd: 6, cat: 'h' },
    // sons das entidades que até aqui passavam sem legenda
    x_estalo: { t: 'estalos de língua', imp: 0, cd: 5, cat: 'p', insp: true, pos: p0 },
    x_cantarola: { t: 'alguém cantarola a música da caixinha', imp: 0, cd: 8, cat: 'h', insp: true, pos: p0 },
    x_fungada: { t: 'fungadas', imp: 0, cd: 4, cat: 'p', insp: true, pos: p0 },
    x_respiraRasgada: { t: 'respiração rasgada', imp: 1, cd: 4, cat: 'p', insp: true, pos: p0 },
    x_inspira: { t: 'ele puxa o ar pelo nariz, devagar', imp: 1, cd: 3, cat: 'p', insp: true, pos: p0 },
    x_macaneta: { t: 'uma maçaneta gira devagar', imp: 1, cd: 3, cat: 'p', pos: xz },
    x_armarioBate: { t: 'um armário é aberto com violência', imp: 1, cd: 2, cat: 'p', pos: p0 },
    x_batida: { t: 'batidas na madeira', imp: 1, cd: 2.5, cat: 'p', pos: xz },
    x_corrente: { t: 'correntes arrastando no chão', imp: 0, cd: 5, cat: 'p', insp: true, pos: p0 },
    x_passosLonge: { t: 'passos se afastando', imp: 0, cd: 5, cat: 'p', pos: p0 },
    x_passoCima: { t: 'passos no andar de cima', imp: 0, cd: 8, cat: 'h' },
    x_unhas: { t: 'unhas raspando a parede', imp: 0, cd: 8, cat: 'p', pos: p0 },
    x_boteChiado: { t: 'um chiado, como um bote', imp: 1, cd: 2, cat: 'p', insp: true, pos: p0 },
    x_respiracaoNuca: { t: 'uma respiração na sua nuca', imp: 1, cd: 3, cat: 'p' },
    x_pesDescalcos: { t: 'pezinhos descalços', imp: 0, cd: 5, cat: 'p', pos: p0 },
    x_passinhos: { t: 'passinhos correndo', imp: 0, cd: 5, cat: 'p', pos: p0 },
    x_sussurroSilencio: { t: 'alguém pede silêncio, sussurrando', imp: 0, cd: 6, cat: 'h', pos: p0 },
    x_faisca: { t: 'uma lâmpada estoura em faíscas', imp: 1, cd: 2, cat: 'p', pos: xz },
    x_vozFalsa: { t: 'uma voz conhecida chama você', imp: 1, cd: 3, cat: 'p', pos: xz },
    x_tropeco: { t: 'ele tropeça e cai', imp: 1, cd: 3, cat: 'p', insp: true, pos: p0 },
    x_portaLonge: { t: 'uma porta bate, longe', imp: 0, cd: 5, cat: 'p', pos: xz },
    x_arrastoAr: { t: 'a mão dele corta o ar acima de você', imp: 1, cd: 3, cat: 'p' }
  };
  if (UIX && UIX.som && UIX.som.def) Object.assign(UIX.som.def, LEG);
  function leg(k, pos) { try { UIX.som(k, [pos ? { x: pos.x, z: pos.z } : null]); } catch (e) {} }

  // ---------------------------------------------------------------- conquistas secretas novas
  const CONQ = [
    { id: 'ml3_boanoite', nome: 'Boa Noite, Criança', desc: 'Fique agachada e imóvel perto dele até a cantiga acabar.', secreta: true },
    { id: 'ml3_ninguem', nome: 'Ninguém Aqui', desc: 'Prenda o ar fora do esconderijo enquanto ele escuta colado em você.', secreta: true },
    { id: 'ml3_garrafada', nome: 'Não É Brinquedo', desc: 'Faça uma garrafa estourar bem no pé dele.', secreta: true },
    { id: 'ml3_castigo', nome: 'De Castigo Também', desc: 'Agache diante da Ana ajoelhada, com a luz nela.', secreta: true },
    { id: 'ml3_cobertor', nome: 'Alguém Te Cobriu', desc: 'Esteja numa cama, no escuro, quando a Procissão passar rente.', secreta: true },
    { id: 'ml3_lascas', nome: 'Lascas', desc: 'Sobreviva a uma caçada em que ele arrombou uma porta.' }
  ];
  try { const lista = window.ROTEIRO && window.ROTEIRO.conquistas; if (lista) for (const c of CONQ) if (!lista.some(x => x.id === c.id)) lista.push(c); } catch (e) {}

  // ---------------------------------------------------------------- 1. "ele te ouviu"
  const CALMO = ['patrulha', 'procura', 'conferir', 'escuta', 'emboscada', 'reza'];
  const MOTIVO = { correu: 'você correu', corrida: 'você correu', agua: 'passos na água', cacos: 'vidro sob os seus pés', entrou: 'a porta do esconderijo', respirou: 'a sua respiração', respira: 'a sua respiração', voz: 'a sua voz, no microfone', fita: 'o gravador tocando', radio: 'o rádio', fone: 'o fone', porta: 'uma porta', vidro: 'o vidro', falso: 'um barulho seu' };
  let ouviuCd = -99; const ouviuUlt = { txt: '', t: -99 };
  function motivoAgora(tipo) {
    if (P.causaRuido && E.perf - (P.causaRuidoEm || -99) < 3 && MOTIVO[P.causaRuido]) return MOTIVO[P.causaRuido];
    if (tipo && MOTIVO[tipo]) return MOTIVO[tipo];
    if (P.sprinting) return 'você correu';
    if (P.naAgua) return 'passos na água';
    if (P.crouch) return 'passos, mesmo agachada';
    return 'os seus passos';
  }
  function ouviu(antes, tipo) {
    if (!CALMO.includes(antes) || CALMO.includes(M.state) || M.state === antes) return;
    ouviuUlt.txt = motivoAgora(tipo); ouviuUlt.t = E.perf;
    if (agora() - ouviuCd < 1.5) return; ouviuCd = agora();
    SM.corda(); tranco(.012); leg('ml3_ouviu', M.pos); vib(.35, .5, 90);
  }
  function quase() { leg('ml3_quase', M.pos); vib(.05, .25, 60); }

  // ---------------------------------------------------------------- ruído do mundo (hook do emitNoise)
  let portaJog = null; // a última porta que você abriu
  function ruido(x, z, r, doJogador, garrafa) {
    if (doJogador && Math.hypot(x - P.pos.x, z - P.pos.z) < 2) { RP.ruidoJ = Math.max(RP.ruidoJ, r); if (portaJog && r >= 7) portaJog.alto = true; }
    // segredo: a garrafa estoura no pé dele
    if (garrafa && M.ativo && Math.hypot(x - M.pos.x, z - M.pos.z) < 1.4 && !F().ml3_garrafada) {
      F().ml3_garrafada = true; anim.recua = .9;
      setTimeout(() => { if (!S() || S().dead) return; E.sub('inspetor', 'Isso não é brinquedo, menina.'); E.SFX.voz && E.SFX.voz(M.pos, 'Isso não é brinquedo, menina.'); E.conquista('ml3_garrafada'); }, 500);
    }
  }

  // ---------------------------------------------------------------- 6. nada de morte barata atrás da porta
  const portasAnt = new Map();
  function vigiarPortas() {
    for (const d of W.doors) {
      const ant = portasAnt.get(d); portasAnt.set(d, d.open);
      if (ant === false && d.open && Math.hypot(d.x - P.pos.x, d.z - P.pos.z) < 2.4 && !(M.ativo && Math.hypot(d.x - M.pos.x, d.z - M.pos.z) < 1.6) && !(PROC.fase === 'passando' && Math.hypot(d.x - PROC.pos.x, d.z - PROC.pos.z) < 3)) portaJog = { d, t: E.perf, alto: !!P.sprinting, avisou: false };
    }
  }
  function portaGraca() {
    const St = S(); if (!portaJog || !St || !M.ativo) return false;
    if (E.perf - portaJog.t > 2) { portaJog = null; return false; }
    if (portaJog.alto || P.sprinting || St.flags.sino || M.furia > 0 || St.hidden || ['agarra', 'bote'].includes(M.state)) return false;
    if (dist(M.pos, P.pos) > 4) return false;
    const rm = E.roomAt(M.pos.x, M.pos.z), d = portaJog.d;
    if (rm === P.room && Math.hypot(M.pos.x - d.x, M.pos.z - d.z) > 2.6) return false; // ele já estava aqui dentro com você
    if (!portaJog.avisou) { portaJog.avisou = true; M.olhar = new THREE.Vector3(d.x, 0, d.z); M.olharT = 1.4; E.SX.estalo(M.pos, 1.2, true); leg('ml3_porta', M.pos); vib(.6, .3, 120); M.cool = Math.max(M.cool, .8); }
    return true;
  }

  // ---------------------------------------------------------------- 4. porta arrombada na caçada
  const lascas = []; let lascasGrupo = null;
  function travarArrombada(dr) {
    dr.arrombada = true; dr.pivot.rotation.z = dr.ml3Torta || (dr.ml3Torta = rand(.035, .06) * (Math.random() < .5 ? -1 : 1)); dr.pivot.position.y = -.035;
    const it = W.inter.find(i => i.porta === dr);
    if (it && !it.ml3) {
      it.ml3 = true; const lb = it.label, ac = it.act, nome = dr.nome ? dr.nome[0].toUpperCase() + dr.nome.slice(1) : 'Porta';
      it.label = () => dr.arrombada ? `${nome} — arrombada, não fecha mais` : lb();
      it.act = (...a) => { if (dr.arrombada) { E.SFX.rangido(dr.x, 1.2, dr.z, .3); E.toast('A porta está arrombada. Não fecha mais.'); return; } return ac(...a); };
    }
  }
  function arrombar(dr) {
    const St = S();
    E.setDoor(dr, true, true); dr.ang = -Math.PI * .25; dr.target = -Math.PI * .64;
    travarArrombada(dr);
    const k = 'ml3arr:' + St.chapter, lst = St.flags[k] || (St.flags[k] = {}); lst[W.mapa + ':' + dr.id] = 1;
    if (lascasGrupo !== W.grupo) { lascasGrupo = W.grupo; lascas.length = 0; }
    const mat = dr.grade ? MAT.ferrugem : MAT.porta;
    for (let i = 0; i < 16; i++) {
      const m = E.box(rand(.02, .06), rand(.08, .32), .02, mat, dr.x + rand(-.4, .4), rand(.4, 1.9), dr.z + rand(-.4, .4), W.grupo, false);
      m.rotation.set(rand(0, 3), rand(0, 3), rand(0, 3));
      const fora = new THREE.Vector3(P.pos.x - M.pos.x, 0, P.pos.z - M.pos.z).normalize();
      lascas.push({ m, v: new THREE.Vector3(fora.x * rand(1.5, 4) + rand(-1, 1), rand(.5, 3), fora.z * rand(1.5, 4) + rand(-1, 1)), w: rand(-9, 9), parada: false });
    }
    E.SFX.pancada(dr.x, dr.z); SM.racha(dr.x, dr.z); E.SX.armarioBate({ x: dr.x, z: dr.z });
    const dd = Math.hypot(dr.x - P.pos.x, dr.z - P.pos.z);
    P.shake = Math.max(P.shake, clamp(.3 - dd * .025, .03, .3) * tremorK()); vib(clamp(1 - dd / 14, .2, 1), .7, 260);
    leg('ml3_arromba', { x: dr.x, z: dr.z }); M.wait = .3; anim.arrombou = 1;
    if (!F().ml3_arrombou) { F().ml3_arrombou = true; setTimeout(() => E.subPequeno('lia', 'Ele arrombou a porta... fechar não segura mais ele.'), 1100); }
    cacaArrombou = true;
  }
  function updateLascas(dt) {
    if (lascasGrupo !== W.grupo) { lascasGrupo = W.grupo; lascas.length = 0; }
    for (const l of lascas) {
      if (l.parada) continue;
      l.v.y -= 9.8 * dt; l.m.position.addScaledVector(l.v, dt); l.m.rotation.x += l.w * dt; l.m.rotation.z += l.w * .7 * dt;
      if (l.m.position.y <= .012) { l.m.position.y = .012; if (Math.abs(l.v.y) > 1.2) { l.v.y *= -.25; l.v.x *= .4; l.v.z *= .4; if (Math.random() < .3) SM.lasca(l.m.position.x, l.m.position.z); } else { l.parada = true; l.m.rotation.x = Math.PI / 2; } }
    }
  }
  // as portas arrombadas no capítulo continuam tortas quando o mapa recarrega
  function reaplicarArrombadas() {
    const St = S(); if (!St) return; const lst = St.flags['ml3arr:' + St.chapter]; if (!lst) return;
    for (const d of W.doors) if (lst[W.mapa + ':' + d.id]) { if (!d.open) E.setDoor(d, true, true); d.target = d.ang = -Math.PI * .64; d.pivot.rotation.y = d.ang; travarArrombada(d); }
  }
  let cacaArrombou = false;

  // ---------------------------------------------------------------- 5. o microfone: ele vira o rosto antes de vir
  let micPend = null;
  function mic(v) {
    const St = S(); if (!St || !M.ativo) return false;
    if (micPend) { micPend.v = Math.max(micPend.v, v); micPend.de_novo = true; return true; }
    if (!St.hidden || dist(M.pos, P.pos) > 10 || !CALMO.includes(M.state)) return false;
    micPend = { v, t: 1, de_novo: false };
    M.olhar = P.pos.clone(); M.olharT = 1.2; M.wait = Math.max(M.wait, 1.05);
    E.SX.estalo(M.pos, .9); leg('ml3_vira', M.pos); E.toast('[ele vira o rosto para você]');
    return true;
  }
  function updateMic(dt) {
    if (!micPend) return; micPend.t -= dt; if (micPend.t > 0) return;
    const pend = micPend; micPend = null;
    if (pend.de_novo && S() && !S().dead) { E.emitNoise(P.pos.x, P.pos.z, pend.v, true); E.marcarCausa('voz'); }
    else if (M.ativo) { M.olharT = 0; E.SX.fungada(M.pos); }
  }

  // ---------------------------------------------------------------- 9. cérebro em ritmo menor (qualidade Baixa)
  let cerebroAcc = 0;
  function cerebro(dt) {
    if (qual() !== 'baixa' || window.__teste) return dt;
    cerebroAcc += dt; if (cerebroAcc < 1 / 15) return 0;
    const r = cerebroAcc; cerebroAcc = 0; return r;
  }

  // ---------------------------------------------------------------- 7. a contagem da Ana na mão
  function conta(n, d) {
    if (d > 16) return;
    const k = clamp(n / 9, 0, 1); vib(lerp(.12, .85, k), lerp(.3, .6, k), lerp(140, 45, k));
  }
  function dez(atras) {
    vib(1, 1, 90); setTimeout(() => vib(1, 1, 140), 160);
    if (atras) { leg('ml3_dez', ANA.pos); tranco(.01); }
  }
  function fresta(dr) { leg('ml3_fresta', { x: dr.x, z: dr.z }); vib(.3, .2, 90); }

  // ---------------------------------------------------------------- 3. a sombra dele dobra a esquina antes dele
  const TX_SOMBRA = E.canvasTex(64, 192, (g, w, h) => {
    g.clearRect(0, 0, w, h); g.fillStyle = '#000'; g.shadowColor = '#000'; g.shadowBlur = 6;
    g.beginPath(); g.ellipse(33, 22, 6, 11, .45, 0, 7); g.fill(); // cabeça torta, comprida
    g.fillRect(29, 31, 5, 8); // pescoço
    g.beginPath(); g.moveTo(22, 40); g.lineTo(42, 40); g.lineTo(46, 112); g.lineTo(18, 112); g.closePath(); g.fill(); // casaco
    g.fillRect(23, 110, 5, 76); g.fillRect(36, 110, 5, 76); // pernas
    g.lineWidth = 3.5; g.strokeStyle = '#000'; g.beginPath(); g.moveTo(23, 44); g.lineTo(13, 128); g.moveTo(41, 44); g.lineTo(52, 128); g.stroke(); // braços até os joelhos
    g.lineWidth = 1.5; for (let i = 0; i < 4; i++) { g.beginPath(); g.moveTo(13, 126); g.lineTo(9 + i * 2.5, 146 + (i % 2) * 3); g.moveTo(52, 126); g.lineTo(50 + i * 2.5, 146 + (i % 2) * 3); g.stroke(); } // dedos longos
  });
  TX_SOMBRA.wrapS = TX_SOMBRA.wrapT = THREE.ClampToEdgeWrapping;
  const sombraMat = new THREE.MeshBasicMaterial({ map: TX_SOMBRA, color: 0x000000, transparent: true, opacity: 0, depthWrite: false, fog: true });
  sombraMat.userData.compartilhado = true;
  const sombra = new THREE.Mesh(new THREE.PlaneGeometry(1, 3), sombraMat); sombra.visible = false; sombra.renderOrder = 2; scene.add(sombra);
  const SB = { t: 0, op: 0, alvo: 0, pos: new THREE.Vector3(), n: new THREE.Vector3(), h: 2.6, ok: false };
  function updateSombra(dt) {
    const q = qual();
    if (q === 'baixa' || !M.ativo || !MON.g.visible || RP.on) { SB.alvo = 0; }
    else {
      SB.t -= dt;
      if (SB.t <= 0) {
        SB.t = .05; SB.ok = false;
        const dP = dist(M.pos, P.pos);
        if (dP < 10 && dP > 1.6 && !E.visivel(M.pos, 1.6, 14)) {
          let L = null, dl = 7;
          for (const l of W.lampadas) { if (!l.ligada || l.estourou || l.luz.intensity < .4) continue; const dd = Math.hypot(l.x - M.pos.x, l.z - M.pos.z); if (dd < dl && dd > .5) { dl = dd; L = l; } }
          if (L) {
            _a.set(M.pos.x - L.x, 0, M.pos.z - L.z).normalize();
            _b.set(M.pos.x, 1.4, M.pos.z); let hit = null;
            // primeiro na direção da luz; num corredor comprido, a luz bate de lado e a sombra cai na parede lateral
            for (const giro of [0, .85, -.85]) { _c.copy(_a).applyAxisAngle(EIXO_Y, giro); rc.set(_b, _c); rc.near = .2; rc.far = giro ? 4.5 : 7; const h = rc.intersectObjects(W.solid, false)[0]; if (h && h.face) { hit = h; break; } }
            if (hit && hit.face) {
              const n = hit.face.normal.clone().transformDirection(hit.object.matrixWorld); n.y = 0;
              if (n.lengthSq() > .5) {
                n.normalize(); const k = (dl + hit.distance) / dl;
                SB.h = clamp(2.4 * k, 2.2, 3.05); SB.pos.set(hit.point.x + n.x * .03, SB.h / 2 + .02, hit.point.z + n.z * .03); SB.n.copy(n); SB.ok = true;
                SB.alvo = clamp(L.luz.intensity / Math.max(.1, L.base), .2, 1) * .62;
              }
            }
          }
        }
        if (!SB.ok) SB.alvo = 0;
      }
    }
    SB.op = lerp(SB.op, SB.alvo, Math.min(1, dt * (SB.alvo > SB.op ? 5 : 3)));
    sombraMat.opacity = SB.op; sombra.visible = SB.op > .02;
    if (sombra.visible && SB.ok) {
      sombra.position.lerp(SB.pos, sombra.position.distanceTo(SB.pos) > 2 ? 1 : Math.min(1, dt * 10));
      _c.copy(sombra.position).add(SB.n); sombra.lookAt(_c);
      sombra.rotateZ(Math.sin(M.anim || 0) * .05 + (MON.cabeca.rotation.z - .45) * .15);
      sombra.scale.set(SB.h / 3, SB.h / 3, 1);
    }
  }

  // ---------------------------------------------------------------- mancha de sombra sob os pés (qualidade Baixa, sem sombras)
  const TX_BLOB = E.canvasTex(64, 64, (g, w, h) => { const gr = g.createRadialGradient(32, 32, 2, 32, 32, 31); gr.addColorStop(0, 'rgba(0,0,0,.85)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.clearRect(0, 0, w, h); g.fillStyle = gr; g.fillRect(0, 0, w, h); });
  const blobMat = new THREE.MeshBasicMaterial({ map: TX_BLOB, transparent: true, depthWrite: false, opacity: .7 }); blobMat.userData.compartilhado = true;
  const blobs = [[MON.g, 1.1], [ANA_G, .55]].map(([alvo, r]) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(r, r), blobMat); m.rotation.x = -Math.PI / 2; m.visible = false; scene.add(m); return { m, alvo }; });
  function updateBlobs() {
    const on = qual() === 'baixa';
    for (const b of blobs) { const v = on && b.alvo.visible && !(b.alvo === ANA_G && ANA.teto); b.m.visible = v; if (v) b.m.position.set(b.alvo.position.x, .02, b.alvo.position.z); }
  }

  // ---------------------------------------------------------------- monstros além da névoa saem do desenho (menos desenhos por quadro)
  let monCortado = false;
  function setCorte(on) { if (on === monCortado) return; monCortado = on; MON.g.traverse(o => { if (on) o.layers.disable(0); else o.layers.enable(0); }); }
  function updateCorte() {
    if (!M.ativo || RP.on || !scene.fog || scene.fog.density < .07) { setCorte(false); return; }
    const lim = 2.6 / Math.max(.01, scene.fog.density) + 3;
    setCorte(camera.position.distanceTo(MON.g.position) > lim);
  }

  // ---------------------------------------------------------------- a vida nos corpos (animação depois do motor, no mesmo quadro)
  const anim = { animAnt: 0, recua: 0, escudo: 0, maos: 0, estalo: 0, arrombou: 0, soco: 0, olharAnt: 0, stepAnt: 0, manca: false, calorAnt: 0, fungaT: 0, vascAnt: 0, agarraAnt: false, agarraN: 0, agVib: 0 };
  function animInspetor(dt) {
    if (!M.ativo || !MON.g.visible) return;
    const St = S(), d = dist(M.pos, P.pos);
    const andando = Math.abs((M.anim || 0) - anim.animAnt) > 1e-4; anim.animAnt = M.anim || 0;
    // manca: a perna direita arrasta, o corpo pende a cada passo
    if (andando) { MON.legR.rotation.x *= .6; MON.g.rotation.z = lerp(MON.g.rotation.z, Math.sin(M.anim) * .06, Math.min(1, dt * 8)); }
    else MON.g.rotation.z = lerp(MON.g.rotation.z, M.state === 'patrulha' && M.wait > 0 ? Math.sin(E.perf * 1.3) * .04 : 0, Math.min(1, dt * 3)); // parado, ele balança de leve
    // passos irregulares: um curto, um longo
    if (M.stepT > anim.stepAnt + .5) { anim.manca = !anim.manca; M.stepT = anim.manca ? .82 : 1.3; if (M.state === 'procura') SM.arrasto(M.pos); }
    anim.stepAnt = M.stepT;
    // alerta: os braços sobem pela metade, os dedos abrem e a boca vai se abrindo
    if (M.state === 'alerta') { MON.armL.rotation.x = lerp(MON.armL.rotation.x, -.75, Math.min(1, dt * 10)); MON.armR.rotation.x = lerp(MON.armR.rotation.x, -.75, Math.min(1, dt * 10)); MON.boca.scale.y = lerp(MON.boca.scale.y, 1.6, Math.min(1, dt * 4)); for (const m of MON.maos) m.children.forEach((f, i) => { f.rotation.z = (i - 1.5) * .4; }); }
    // caçando: os ombros sobem e descem com a respiração rasgada
    if (M.state === 'caca') { const b = Math.max(0, Math.sin(E.perf * 7)) * .09; MON.armL.rotation.z = -.07 - b; MON.armR.rotation.z = .07 + b; }
    else { MON.armL.rotation.z = lerp(MON.armL.rotation.z, -.07, Math.min(1, dt * 4)); MON.armR.rotation.z = lerp(MON.armR.rotation.z, .07, Math.min(1, dt * 4)); }
    // farejando: a cabeça sobe e desce em fungadas curtas, e dá para ouvir
    const cy0 = 3.62;
    if (M.state === 'fareja') { MON.cabeca.position.y = cy0 + Math.max(0, Math.sin(E.perf * 11)) * .03; anim.fungaT -= dt; if (anim.fungaT <= 0) { anim.fungaT = rand(.6, .9); E.SX.fungada(M.pos); vib(.05, .2, 40); } }
    else MON.cabeca.position.y = lerp(MON.cabeca.position.y, cy0, Math.min(1, dt * 6));
    // vasculhando: o braço dá um soco na porta a cada batida
    if (M.state === 'vasculha') { for (const tb of [3.8, 3.2, 2.6]) if (anim.vascAnt > tb && M.vasculhaT <= tb) { anim.soco = .18; vib(.7, .4, 110); } }
    anim.vascAnt = M.state === 'vasculha' ? M.vasculhaT : 99;
    if (anim.soco > 0) { anim.soco -= dt; MON.armR.rotation.x = -1.75; }
    // a lanterna no rosto: ele cobre a cara com a mão
    if (M.calorCd > anim.calorAnt + 5) anim.escudo = 1.1;
    anim.calorAnt = M.calorCd;
    if (anim.escudo > 0) { anim.escudo -= dt; MON.armR.rotation.x = lerp(MON.armR.rotation.x, -2.6, Math.min(1, dt * 12)); MON.armR.rotation.z = .5; }
    // tropeço na fuga: as mãos vão ao chão
    if (M.caidoT > 0) { MON.armL.rotation.x = lerp(MON.armL.rotation.x, -1.3, Math.min(1, dt * 8)); MON.armR.rotation.x = lerp(MON.armR.rotation.x, -1.3, Math.min(1, dt * 8)); }
    // recuo: porta na cara, garrafa no pé ou presa que escapou
    if (anim.recua > 0) { anim.recua -= dt; MON.g.rotation.x = lerp(MON.g.rotation.x, -.3, Math.min(1, dt * 10)); MON.cabeca.rotation.z = lerp(MON.cabeca.rotation.z, 1.1, Math.min(1, dt * 8)); }
    // parado na ronda, os dedos tamborilam no ar
    if (M.state === 'patrulha' && M.wait > 0) for (const m of MON.maos) m.children.forEach((f, i) => { f.rotation.x = .25 + Math.max(0, Math.sin(E.perf * 11 - i * .9)) * .35; });
    else for (const m of MON.maos) m.children.forEach(f => { f.rotation.x = lerp(f.rotation.x, .25, Math.min(1, dt * 6)); });
    // virada brusca de cabeça: o pescoço estala
    anim.estalo = Math.max(0, anim.estalo - dt);
    if (M.olharT > anim.olharAnt + .5 && M.olhar && anim.estalo <= 0 && d < 14) { let a = Math.atan2(M.olhar.x - M.pos.x, M.olhar.z - M.pos.z) - M.yaw; a = Math.atan2(Math.sin(a), Math.cos(a)); if (Math.abs(a) > .8) { anim.estalo = 3; SM.pescoco(M.pos); } }
    anim.olharAnt = M.olharT;
    // uma lâmpada estoura em cima dele: ele se encolhe
    const nf = (M.flashes || []).length; if (nf > (anim.flashAnt || 0) && M.flashes[nf - 1] && Math.hypot(M.flashes[nf - 1].l.position.x - M.pos.x, M.flashes[nf - 1].l.position.z - M.pos.z) < 2) anim.recua = Math.max(anim.recua, .45); anim.flashAnt = nf;
    // agarrão: a mão aperta mais conforme o tempo acaba (vibração cada vez mais forte)
    if (M.state === 'agarra') {
      if (!anim.agarraAnt) { const k = 'ml3ag:' + St.chapter; St.flags[k] = (St.flags[k] || 0) + 1; if (St.flags[k] === 3) setTimeout(() => { if (!S().dead) E.sub('inspetor', 'De novo você. Não aprende.'); }, 300); }
      anim.agVib -= dt; if (anim.agVib <= 0) { anim.agVib = .25; vib(.3 + clamp(E.AG.t / E.AG.dur, 0, 1) * .7, .4, 70); }
    } else if (anim.agarraAnt && !St.dead && St.health > 0 && E.AG.sacode > 1400) { // escapou: ele uiva de raiva e cambaleia para trás
      SM.uivo(M.pos); anim.recua = 1; vib(.6, .6, 200);
    }
    anim.agarraAnt = M.state === 'agarra';
    // bote: a Lia solta o ar quando a mão passa por cima (esquiva)
    if (anim.boteAnt && M.state === 'procura' && M.cool > 2 && P.crouch && !St.dead && St.health === anim.vidaBote) { SM.alivio(); vib(.2, .5, 120); }
    if (M.state === 'bote' && !anim.boteAnt) anim.vidaBote = St.health;
    anim.boteAnt = M.state === 'bote';
  }
  function cara() { anim.recua = .8; vib(.7, .5, 160); }

  // a Ana: cabelo que balança, cabeça que treme quando você encara, o teto
  const anim2 = { pos: new THREE.Vector3(), teto: false, ativa: false, cansou: false, vida: 0, rangeT: 2, pertoCd: 0, castigo: false };
  function animAna(dt) {
    const St = S();
    if (!ANA.ativa) {
      if (anim2.ativa && St && !St.dead && St.health === anim2.vida && dist(ANA.pos, P.pos) < 14) E.SX.passinhos(ANA.pos); // ela vai embora correndo
      anim2.ativa = false; return;
    }
    if (!anim2.ativa) { anim2.ativa = true; anim2.cansou = false; anim2.pos.copy(ANA.pos); anim2.teto = ANA.teto; }
    anim2.vida = St.health;
    const vel = anim2.pos.distanceTo(ANA.pos) / Math.max(dt, 1e-3); anim2.pos.copy(ANA.pos);
    const U = ANA_G.userData, cabelo = U.cabG && U.cabG.children[1];
    if (cabelo) cabelo.rotation.x = lerp(cabelo.rotation.x, -clamp(vel * .06, 0, .35) + Math.sin(E.perf * 2) * .02, Math.min(1, dt * 6));
    if (ANA.vista && ANA.encaraT > 4) { U.cabG.rotation.z += rand(-.04, .04) * Math.min(1, (ANA.encaraT - 4) / 3); U.cabG.rotation.y += rand(-.03, .03); }
    const d = dist(ANA.pos, P.pos);
    // muda de pose fora da sua vista, perto: os ossinhos estalam
    if (ANA.pose !== anim2.pose && !ANA.vista && d < 3.5 && anim2.pose !== undefined) SM.pescoco({ x: ANA.pos.x, z: ANA.pos.z, baixo: true });
    anim2.pose = ANA.pose;
    // desceu do teto
    if (anim2.teto && !ANA.teto) { const k = clamp(1 - d / 8, 0, 1); P.shake = Math.max(P.shake, .08 * k * tremorK()); vib(.4 + k * .5, .4, 150); leg('ml3_ana_teto', ANA.pos); }
    anim2.teto = ANA.teto;
    // grudada no teto, logo acima: a madeira range
    if (ANA.teto && d < 5) { anim2.rangeT -= dt; if (anim2.rangeT <= 0) { anim2.rangeT = rand(2.5, 4); SM.rangeTeto(ANA.pos); leg('ml3_teto', ANA.pos); } }
    // pertinho e fora da luz
    anim2.pertoCd -= dt;
    if (!ANA.vista && !ANA.teto && d < 4 && vel > .2 && anim2.pertoCd <= 0) { anim2.pertoCd = 5; leg('ml3_ana_perto', ANA.pos); }
    // ela cansa de esperar você sair
    if (St.hidden && ANA.escondT > 12 && ANA.vida <= 1.6 && !anim2.cansou) { anim2.cansou = true; E.subPequeno('ana', 'Chata... você não brinca direito.'); }
    // segredo: agachar diante dela ajoelhada, com a luz nela
    if (ANA.vista && ANA.pose === 4 && P.crouch && d < 4 && !F().ml3_castigo) { F().ml3_castigo = true; E.SFX.risada(ANA.pos.x, ANA.pos.z); E.subPequeno('ana', 'Você também tá de castigo?'); E.conquista('ml3_castigo'); }
  }
  // o frio dela: a borda da tela gela quando ela está perto e você não a vê
  let frioOp = 0;
  function updateFrio(dt) {
    let alvo = 0;
    if (ANA.ativa && !ANA.vista && !S().dead) { const d = dist(ANA.pos, P.pos); if (d < 3.6) alvo = (1 - d / 3.6) * .95; }
    frioOp = lerp(frioOp, alvo, Math.min(1, dt * 3)); const v = frioOp < .02 ? '0' : frioOp.toFixed(2);
    if (frio.style.opacity !== v) frio.style.opacity = v;
  }

  // a Procissão: crianças que balançam, armário que treme, luzes que voltam uma a uma
  const anim3 = { fase: null, pausa: 0, tremT: 0, cobre: false };
  function animProc(dt) {
    const St = S(), fase = PROC.fase;
    if (anim3.fase === 'passando' && !fase) { // as luzes voltam uma a uma
      let n = 0; for (const L of W.lampadas) if (L.ligada && !L.estourou) { n++; L.luz.intensity = L.base * .04; L.bulbo.material.emissiveIntensity = .1; L.flick = rand(.15, 1.8); L.alvoI = L.base * .04; L.alvoE = .1; }
      if (n) leg('ml3_luzes');
    }
    anim3.fase = fase;
    if (fase !== 'passando') { anim3.cobre = false; return; }
    if (PROC.pausa > 0 && anim3.pausa <= 0) { leg('ml3_proc_para', PROC.pos); vib(.2, .5, 200); }
    anim3.pausa = PROC.pausa;
    if (PROC.pausa <= 0) for (const s of PROC.filhos) s.rotation.z = Math.sin(E.perf * 2.4 + s.userData.f) * .08;
    const dP = dist(PROC.pos, P.pos);
    if (St.hidden && dP < 3.2) { // o esconderijo treme quando a fila passa rente
      anim3.tremT -= dt; if (anim3.tremT <= 0) { anim3.tremT = .32; E.tremer(St.hidden.g, .22, .018); vib(.15 + (1 - dP / 3.2) * .45, .5, 80); }
      // segredo: na cama, no escuro, alguém ajeita o seu cobertor
      if (St.hidden.tipo === 'cama' && !St.flashOn && dP < 2.6 && !anim3.cobre && !F().ml3_cobertor) {
        anim3.cobre = true; F().ml3_cobertor = true;
        setTimeout(() => { const s = S(); if (!s || s.dead) return; E.toast('[alguém ajeita o seu cobertor]'); E.subPequeno('crianca', 'Dorme. Senão ele vem.'); s.fear = Math.max(0, s.fear - 20); E.conquista('ml3_cobertor'); }, 1200);
      }
    }
  }
  // a criança que fica para trás vira a cabeça devagar quando você chega perto; o vulto inclina a cabeça
  function animResto(dt) {
    if (PROC.ret && PROC.retG.visible) { const d = Math.hypot(P.pos.x - PROC.ret.x, P.pos.z - PROC.ret.z); if (d < 6) { let a = Math.atan2(P.pos.x - PROC.ret.x, P.pos.z - PROC.ret.z) - PROC.retG.rotation.y; a = Math.atan2(Math.sin(a), Math.cos(a)); PROC.retG.rotation.y += a * Math.min(1, dt * .5); } }
    if (VULTO && VULTO.g.visible) VULTO.cabeca.rotation.z = Math.min(1.15, VULTO.cabeca.rotation.z + dt * .12);
    else if (VULTO) { if (anim.vultoAnt && S().fear > anim.medoVulto + 8) { tranco(.006); vib(.35, .3, 80); } VULTO.cabeca.rotation.z = .45; }
    if (VULTO) { anim.vultoAnt = VULTO.g.visible; anim.medoVulto = S().fear; }
  }

  // ---------------------------------------------------------------- vigia de estados do Inspetor (legendas, vibração, dica no toque)
  const est = { ant: null, escutaOk: false, desistiu: 0, farejaDicas: 0, recuoAnt: 0 };
  function vigiarInspetor() {
    const St = S();
    if (!M.ativo) { est.ant = null; return; }
    const e = M.state, ant = est.ant;
    if (e !== ant) {
      est.ant = e;
      if (e === 'escuta') { leg('ml3_escuta', M.pos); est.escutaOk = !St.hidden && dist(M.pos, P.pos) < 4; est.escutaIni = E.perf; }
      else if (e === 'alerta') { leg('ml3_alerta', M.pos); vib(.25, .4, 80); }
      else if (e === 'bote') { leg('ml3_bote', M.pos); vib(.85, .3, 120); }
      else if (e === 'fareja') {
        leg('ml3_fareja', M.pos); vib(.15, .4, 160);
        if (!pesadelo() && est.farejaDicas < 2 && !E.prendendo()) { est.farejaDicas++; E.toast(toque() ? 'Ele está farejando. Segure "Prender fôlego"!' : 'Ele está farejando. Segure ESPAÇO!'); }
      }
      else if (e === 'vasculha') leg('ml3_vasculha', M.pos);
      if ((ant === 'fareja' || ant === 'vasculha') && e === 'procura' && St.hidden) leg('ml3_desiste', M.pos);
      // segredo: ele escutou colado em você e você prendeu o ar o tempo todo
      if (ant === 'escuta' && est.escutaOk && !St.hidden && !St.dead && !F().ml3_ninguem && CALMO.includes(e)) { F().ml3_ninguem = true; E.subPequeno('inspetor', '...ninguém?'); E.conquista('ml3_ninguem'); }
      // a caçada em que ele arrombou uma porta acabou e você está viva
      if (ant === 'caca' && e !== 'caca' && !['alerta', 'bote', 'agarra'].includes(e) && cacaArrombou && !St.dead) { cacaArrombou = false; if (dist(M.pos, P.pos) > 6) E.conquista('ml3_lascas'); }
    }
    if (e === 'escuta' && est.escutaOk && (St.hidden || (!P.prende && E.perf - est.escutaIni > .5) || P.noiseR > 0 || dist(M.pos, P.pos) > 5)) est.escutaOk = false;
    // diretor de tensão: o recuo e a volta ganham legenda
    if (M.recuo > 0 && est.recuoAnt <= 0) leg('ml3_recuo', M.pos);
    else if (M.recuo <= 0 && est.recuoAnt > 0) leg('ml3_volta', M.pos);
    est.recuoAnt = M.recuo;
  }

  // segredo: a cantiga inteira, agachada e imóvel perto dele
  let cant = null;
  if (SOMX) {
    const c0 = SOMX.cantarola, c1 = SOMX.cortaCantiga;
    SOMX.cantarola = pos => { const r = c0(pos); if (!cant || agora() > cant.fim) cant = { fim: agora() + 5, falhou: false }; return r; };
    SOMX.cortaCantiga = () => { const r = c1(); if (r) cant = null; return r; };
  }
  function vigiarCantiga() {
    if (!cant) return; const St = S();
    if (!M.ativo || M.state !== 'patrulha' || St.hidden || !P.crouch || P.noiseR > 0 || dist(M.pos, P.pos) > 5) cant.falhou = true;
    if (agora() < cant.fim) return;
    const ok = !cant.falhou; cant = null;
    if (ok && !F().ml3_boanoite && !St.dead) { F().ml3_boanoite = true; E.sub('inspetor', 'Boa noite, criança. Volte pra cama.'); E.SFX.voz && E.SFX.voz(M.pos, 'Boa noite, criança.'); M.recuo = Math.max(M.recuo, 14); E.patrulhar(); E.conquista('ml3_boanoite'); }
  }

  // ---------------------------------------------------------------- toque: botões que pulsam quando importam
  const BT = { t: 0, ar: null, ag: null, usar: null };
  function updateToque(dt) {
    if (!toque()) return;
    BT.t -= dt; if (BT.t <= 0) { BT.t = 1; BT.ar = $('#toque button[data-k="Space"]'); BT.ag = $('#toque button[data-k="KeyC"]'); BT.usar = $('#toque button[data-k="KeyE"]'); }
    const St = S();
    const ar = !!(St.hidden && M.ativo && (['fareja', 'vasculha'].includes(M.state) || (dist(M.pos, P.pos) < 3 && St.fear > 70)));
    const ag = M.ativo && M.state === 'bote' && !St.hidden;
    const us = M.ativo && M.state === 'agarra';
    if (BT.ar) BT.ar.classList.toggle('ml3-pulsa', ar);
    if (BT.ag) BT.ag.classList.toggle('ml3-pulsa', ag);
    if (BT.usar) BT.usar.classList.toggle('ml3-pulsa', us);
  }

  // ---------------------------------------------------------------- 2. "Ver como ele te achou": replay de 3 segundos
  const RP = { on: false, buf: [], snap: null, quem: null, amostraT: 0, ruidoJ: 0, grupo: null, raf: 0, t0: 0, salvo: null, objs: null, ondas: [] };
  function gravar(dt) {
    if (RP.grupo !== W.grupo) { RP.grupo = W.grupo; RP.buf.length = 0; }
    RP.amostraT -= dt; if (RP.amostraT > 0) return; RP.amostraT = .1;
    const St = S();
    RP.buf.push({ px: P.pos.x, pz: P.pos.z, py: P.yaw, cr: !!P.crouch, fl: !!St.flashOn, hid: !!St.hidden,
      ma: M.ativo, mx: M.pos.x, mz: M.pos.z, my: M.yaw || 0, mst: M.state,
      aa: ANA.ativa, ax: ANA.pos.x, az: ANA.pos.z, ay: ANA_G.rotation.y,
      gv: PROC.fase === 'passando', gx: PROC.pos.x, gz: PROC.pos.z, gy: PROC.g.rotation.y,
      ru: Math.max(P.noiseR || 0, RP.ruidoJ) });
    RP.ruidoJ = 0;
    if (RP.buf.length > 45) RP.buf.shift();
  }
  const bt = document.createElement('button'); bt.className = 'btn'; bt.id = 'ml3-ver'; bt.hidden = true; bt.textContent = 'Ver como ele te achou (V)';
  const entregou = document.createElement('p'); entregou.id = 'ml3-entregou'; entregou.hidden = true;
  { const retry = $('#dt-retry'); if (retry) retry.before(bt); const ca = $('#death-causa'); if (ca) ca.after(entregou); const tc = $('#death .teclas'); if (tc && !/V vê/.test(tc.textContent)) tc.textContent += ' · V vê como foi'; }
  bt.onclick = () => iniciarReplay();
  const tarja = document.createElement('div'); tarja.id = 'ml3-tarja'; document.body.appendChild(tarja);
  const barra = document.createElement('div'); barra.id = 'ml3-barra'; barra.innerHTML = '<i></i>'; document.body.appendChild(barra);
  addEventListener('keydown', e => {
    if (RP.on) { e.preventDefault(); e.stopImmediatePropagation(); if (!e.repeat) pararReplay(); return; }
    if (e.code === 'KeyV' && E.ui === 'morte' && !$('#death').hidden && !bt.hidden && !e.repeat) { e.preventDefault(); e.stopImmediatePropagation(); iniciarReplay(); }
  }, true);
  addEventListener('pointerdown', e => { if (RP.on && e.target !== bt) { e.preventDefault(); e.stopImmediatePropagation(); pararReplay(); } }, true);

  function morte(quem) {
    const St = S();
    if (quem === 'inspetor') { MON.cabeca.rotation.z = .02; MON.boca.scale.y = 2.6; } // no fim ele endireita a cabeça e abre a boca
    RP.quem = quem; RP.snap = RP.buf.slice(-31);
    const tem = RP.snap.length >= 8 && RP.snap.some(a => quem === 'inspetor' ? a.ma : quem === 'ana' ? a.aa : quem === 'procissao' ? a.gv : false);
    bt.hidden = !tem;
    bt.textContent = quem === 'ana' ? 'Ver como ela chegou (V)' : quem === 'procissao' ? 'Ver por onde eles vieram (V)' : 'Ver como ele te achou (V)';
    const recente = quem === 'inspetor' && ouviuUlt.txt && E.perf - ouviuUlt.t < 60;
    entregou.hidden = !recente; if (recente) entregou.textContent = 'O que te entregou: ' + ouviuUlt.txt + '.';
    vib(1, 1, 300);
    if (St) St.flags.ml3_mortes = (St.flags.ml3_mortes || 0) + 1;
  }
  function silhueta(cor, op, partes) {
    const g = new THREE.Group(), mat = new THREE.MeshBasicMaterial({ color: cor, transparent: true, opacity: op, depthTest: false, depthWrite: false, fog: false });
    for (const [tipo, a, b, c, y] of partes) { const m = new THREE.Mesh(tipo === 'c' ? new THREE.CylinderGeometry(a, b, c, 10) : new THREE.SphereGeometry(a, 10, 8), mat); m.position.y = y; m.renderOrder = 999; g.add(m); }
    g.userData.mat = mat; return g;
  }
  function iniciarReplay() {
    if (RP.on || !RP.snap || RP.snap.length < 2 || E.ui !== 'morte') return;
    RP.on = true; RP.t0 = performance.now(); RP.ultOnda = -1;
    const fb = $('#fx-black'), fr = $('#fx-red');
    RP.salvo = { cp: camera.position.clone(), cq: camera.quaternion.clone(), mon: [MON.g.position.clone(), MON.g.rotation.clone(), MON.g.visible], ana: [ANA_G.position.clone(), ANA_G.rotation.clone(), ANA_G.visible], proc: [PROC.g.position.clone(), PROC.g.rotation.y, PROC.g.visible],
      fb: fb ? [fb.style.opacity, fb.style.transition] : null, fr: fr ? fr.style.opacity : null, fl: [E.flash.intensity, E.flash.angle, E.flash.penumbra] };
    if (fb) { fb.style.transition = 'opacity .3s'; fb.style.opacity = 0; } if (fr) fr.style.opacity = 0;
    document.body.classList.add('ml3-replay'); setCorte(false); sombra.visible = false;
    E.flash.intensity = 24; E.flash.angle = .8; E.flash.penumbra = .8;
    const g = new THREE.Group(); scene.add(g);
    const lia = silhueta(0xd8ccb0, .6, [['c', .17, .22, 1.05, .55], ['e', .13, 0, 0, 1.25]]); g.add(lia);
    const cone = new THREE.Mesh(new THREE.CircleGeometry(5, 16, Math.PI / 2 - .38, .76), new THREE.MeshBasicMaterial({ color: 0xfff0c8, transparent: true, opacity: .16, depthTest: false, depthWrite: false, fog: false, side: THREE.DoubleSide }));
    cone.rotation.x = -Math.PI / 2; cone.renderOrder = 998; cone.position.y = .03; g.add(cone);
    const cor = RP.quem === 'ana' ? 0x9fc3ff : RP.quem === 'procissao' ? 0xff8a3a : 0xb0231a;
    const ele = RP.quem === 'ana' ? silhueta(cor, .38, [['c', .1, .2, .95, .48], ['e', .12, 0, 0, 1.25]]) : RP.quem === 'procissao' ? silhueta(cor, .3, [['c', .7, .9, 1.1, .55]]) : silhueta(cor, .32, [['c', .18, .3, 2.5, 1.3], ['e', .15, 0, 0, 2.75]]);
    g.add(ele);
    RP.objs = { g, lia, cone, ele };
    MON.g.visible = RP.quem === 'inspetor' || RP.snap.some(a => a.ma); ANA_G.visible = RP.snap.some(a => a.aa); PROC.g.visible = RP.quem === 'procissao';
    if (ANA_G.visible) ANA_G.rotation.set(0, ANA_G.rotation.y, 0);
    const nome = RP.quem === 'ana' ? 'a menina' : RP.quem === 'procissao' ? 'a fila' : 'ele';
    tarja.innerHTML = `<b>${RP.quem === 'ana' ? 'COMO ELA CHEGOU' : RP.quem === 'procissao' ? 'POR ONDE ELES VIERAM' : 'COMO ELE TE ACHOU'}</b><small>os 3 segundos antes · qualquer tecla volta</small><div class="leg"><i style="color:#d8ccb0">● você</i><i style="color:#${cor.toString(16).padStart(6, '0')}">● ${nome}</i><i style="color:#c9a75a">◯ o barulho que você fez</i></div>`;
    tarja.classList.add('on'); barra.classList.add('on');
    RP.camPos = null; RP.raf = requestAnimationFrame(passoReplay);
  }
  function amostra(t) { const b = RP.snap, f = clamp(t / .1, 0, b.length - 1), i = Math.floor(f), k = f - i, a = b[i], c = b[Math.min(b.length - 1, i + 1)]; return { a, c, k, i }; }
  const ang = (a, b, k) => { let d = b - a; d = Math.atan2(Math.sin(d), Math.cos(d)); return a + d * k; };
  function passoReplay(now) {
    if (!RP.on) return;
    if (E.ui !== 'morte' || $('#death').hidden) { pararReplay(); return; }
    const dur = (RP.snap.length - 1) * .1, t = Math.min(dur, (now - RP.t0) / 1000);
    const { a, c, k, i } = amostra(t), L = (x, y) => x + (y - x) * k;
    const px = L(a.px, c.px), pz = L(a.pz, c.pz), py = ang(a.py, c.py, k);
    const O = RP.objs;
    O.lia.position.set(px, 0, pz); O.lia.scale.y = a.cr || a.hid ? .68 : 1; O.lia.userData.mat.opacity = a.hid ? .32 : .6;
    O.cone.visible = a.fl && !a.hid; O.cone.position.set(px, .03, pz); O.cone.rotation.z = py + Math.PI;
    let sx = px, sz = pz, sy = py + Math.PI, alt = 2.3, atras = 2.6;
    if (a.ma) { const mx = L(a.mx, c.mx), mz = L(a.mz, c.mz), my = ang(a.my, c.my, k); MON.g.position.set(mx, 0, mz); MON.g.rotation.set(0, my, 0); MON.legL.rotation.x = Math.sin(now / 160) * .5; MON.legR.rotation.x = -Math.sin(now / 160) * .3; if (RP.quem === 'inspetor') { sx = mx; sz = mz; sy = my; alt = 2.75; atras = 2.4; O.ele.position.set(mx, 0, mz); } }
    if (a.aa) { const ax = L(a.ax, c.ax), az = L(a.az, c.az); ANA_G.position.set(ax, 0, az); ANA_G.rotation.y = ang(a.ay, c.ay, k); if (RP.quem === 'ana') { sx = ax; sz = az; sy = Math.atan2(px - ax, pz - az); alt = 2.1; atras = 2.2; O.ele.position.set(ax, 0, az); } }
    if (a.gv) { const gx = L(a.gx, c.gx), gz = L(a.gz, c.gz); PROC.g.position.set(gx, 0, gz); PROC.g.rotation.y = ang(a.gy, c.gy, k); if (RP.quem === 'procissao') { sx = gx; sz = gz; sy = ang(a.gy, c.gy, k); alt = 2.7; atras = 3; O.ele.position.set(gx, 0, gz); } }
    O.ele.visible = RP.quem === 'inspetor' ? a.ma : RP.quem === 'ana' ? a.aa : a.gv;
    // câmera: por cima do ombro de quem caçou, olhando para a Lia
    const r = E.roomAt(sx, sz), teto = r && !r.fora ? (r.h || 3.2) - .3 : 4.5;
    _a.set(sx - Math.sin(sy) * atras, Math.min(alt, teto), sz - Math.cos(sy) * atras);
    if (!RP.camPos) RP.camPos = _a.clone(); else RP.camPos.lerp(_a, .12);
    camera.position.copy(RP.camPos); camera.lookAt((sx + px) / 2, .8, (sz + pz) / 2);
    // as ondas do barulho no chão
    if (i !== RP.ultOnda) { RP.ultOnda = i; if (a.ru > 1.2 && (i % 2 === 0 || a.ru > 8)) novaOnda(a.px, a.pz, a.ru); }
    for (let j = RP.ondas.length - 1; j >= 0; j--) { const o = RP.ondas[j]; o.t += 1 / 30; const f = clamp(o.t / .8, 0, 1); o.m.scale.setScalar(.2 + f * o.r); o.m.material.opacity = .55 * (1 - f); if (f >= 1) { O.g.remove(o.m); o.m.geometry.dispose(); o.m.material.dispose(); RP.ondas.splice(j, 1); } }
    barra.firstChild.style.width = (t / Math.max(.1, dur) * 100).toFixed(1) + '%';
    if ((now - RP.t0) / 1000 > dur + .7) { pararReplay(); return; }
    RP.raf = requestAnimationFrame(passoReplay);
  }
  function novaOnda(x, z, r) {
    const m = new THREE.Mesh(new THREE.RingGeometry(.92, 1, 40), new THREE.MeshBasicMaterial({ color: 0xc9a75a, transparent: true, opacity: .55, depthTest: false, depthWrite: false, fog: false, side: THREE.DoubleSide }));
    m.rotation.x = -Math.PI / 2; m.position.set(x, .04, z); m.renderOrder = 997; RP.objs.g.add(m); RP.ondas.push({ m, t: 0, r: clamp(r * .45, 1, 9) });
  }
  function pararReplay() {
    if (!RP.on) return; RP.on = false; cancelAnimationFrame(RP.raf);
    const s = RP.salvo, fb = $('#fx-black'), fr = $('#fx-red');
    camera.position.copy(s.cp); camera.quaternion.copy(s.cq);
    MON.g.position.copy(s.mon[0]); MON.g.rotation.copy(s.mon[1]); MON.g.visible = s.mon[2];
    ANA_G.position.copy(s.ana[0]); ANA_G.rotation.copy(s.ana[1]); ANA_G.visible = s.ana[2];
    PROC.g.position.copy(s.proc[0]); PROC.g.rotation.y = s.proc[1]; PROC.g.visible = s.proc[2];
    [E.flash.intensity, E.flash.angle, E.flash.penumbra] = s.fl;
    if (fb && s.fb) { fb.style.transition = 'opacity .3s'; fb.style.opacity = s.fb[0]; setTimeout(() => { fb.style.transition = s.fb[1]; }, 350); } if (fr && s.fr !== null) fr.style.opacity = s.fr;
    const O = RP.objs; if (O) { scene.remove(O.g); O.g.traverse(o => { if (o.isMesh) { o.geometry.dispose(); o.material.dispose(); } }); }
    RP.objs = null; RP.ondas.length = 0;
    document.body.classList.remove('ml3-replay'); tarja.classList.remove('on'); barra.classList.remove('on');
  }

  // ---------------------------------------------------------------- quadro (chamado pelo motor a cada quadro jogando, depois das entidades)
  let grupoAnt = null;
  const tick = seguro(dt => {
    const St = S(); if (!St || St.dead) return;
    if (W.grupo !== grupoAnt) { grupoAnt = W.grupo; portasAnt.clear(); portaJog = null; micPend = null; cacaArrombou = false; reaplicarArrombadas(); SB.op = SB.alvo = 0; sombra.visible = false; for (const b of blobs) b.m.visible = false; }
    vigiarPortas(); vigiarInspetor(); vigiarCantiga();
    animInspetor(dt); animAna(dt); animProc(dt); animResto(dt);
    updateLascas(dt); updateMic(dt); updateFrio(dt); updateToque(dt);
    updateSombra(dt); updateBlobs(); updateCorte();
    gravar(dt);
  });

  const api = {
    tick, ouviu: seguro(ouviu), quase: seguro(quase), ruido: seguro(ruido), portaGraca: () => { try { return portaGraca(); } catch (e) { return false; } },
    arrombar: seguro(arrombar), cara: seguro(cara), mic: v => { try { return mic(v); } catch (e) { return false; } }, cerebro,
    conta: seguro(conta), dez: seguro(dez), fresta: seguro(fresta), morte: seguro(morte), vib, armadilha: seguro(() => { vib(1, .8, 300); tranco(.02); }),
    alivio: seguro(() => { const St = S(); if (!St || St.dead) return; SM.alivio(); St.fear = Math.max(0, St.fear - 10); }),
    get replay() { return RP.on; }, _RP: RP, _SB: SB, arrombadaTeste: dr => arrombar(dr), iniciarReplay
  };
  window.__ml3 = api; // kit de teste
  return api;
}
