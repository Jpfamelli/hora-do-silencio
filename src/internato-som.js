// Lote 7 — SOM E ATMOSFERA do térreo e dos dormitórios.
// Ambiência por sala, vozes à deriva, silêncio usado como arma, clima e chuva dentro do internato.
// Tudo com o mesmo AudioContext do motor (A.audio) e sem assets externos. Entra por somTerreo()/somSuperior(),
// encadeados com juntar() em mapas.js. Não muda fluxo de capítulo nem rótulos de interação existentes.
// Tudo à prova de erro: cada fonte roda dentro de try/catch e some sozinha se o áudio não existir.

const rand = (a, b) => a + Math.random() * (b - a);
const pick = a => a[Math.random() * a.length | 0];
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
function hash(str) { let h = 2166136261 >>> 0; for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }

// legendas de som próprias (aparecem na legenda de sons da interface, com direção)
const LEG = {
  s7Pendulo: { t: 'o relógio de pêndulo bate, constante', imp: 0, cd: 12, cat: 'h', pos: a => a[0] },
  s7PenduloPara: { t: 'o pêndulo para de repente', imp: 1, cd: 10, cat: 'p', pos: a => a[0] },
  s7Tres: { t: 'o pêndulo bate três vezes sozinho e para', imp: 1, cd: 30, cat: 'h', pos: a => a[0] },
  s7Barometro: { t: 'o ponteiro do barômetro estala e muda de faixa', imp: 1, cd: 6, cat: 'p', pos: a => a[0] },
  s7Geladeira: { t: 'o compressor da geladeira morre num estalo', imp: 1, cd: 20, cat: 'p', pos: a => a[0] },
  s7Acorda: { t: 'a casa acorda: bomba, caldeira e transformador voltam um a um', imp: 1, cd: 25, cat: 'h' },
  s7Vapor: { t: 'a caldeira solta um sopro de vapor', imp: 0, cd: 14, cat: 'h', pos: a => a[0] },
  s7Monitor: { t: 'um monitor cardíaco bipa, quase no seu ritmo', imp: 0, cd: 18, cat: 'h', pos: a => a[0] },
  s7MonitorLinha: { t: 'o monitor vira um apito contínuo', imp: 1, cd: 14, cat: 'p', pos: a => a[0] },
  s7Frascos: { t: 'frascos de vidro tilintam na prateleira', imp: 1, cd: 5, cat: 'p', pos: a => a[0] },
  s7Maca: { t: 'uma maca range sobre rodinhas, sozinha', imp: 0, cd: 20, cat: 'h', pos: a => a[0] },
  s7Refeit: { t: 'quarenta crianças comem atrás da porta', imp: 0, cd: 20, cat: 'h', pos: a => a[0] },
  s7RefCala: { t: 'o refeitório cala de uma vez: só o eco', imp: 1, cd: 12, cat: 'p' },
  s7Marcha: { t: 'talheres batem nos pratos em compasso de marcha', imp: 1, cd: 14, cat: 'h', pos: a => a[0] },
  s7Cadeira: { t: 'uma cadeira é arrastada, vazia', imp: 1, cd: 10, cat: 'p', pos: a => a[0] },
  s7Talheres: { t: 'talheres tilintam em mesas vazias', imp: 0, cd: 10, cat: 'h', pos: a => a[0] },
  s7Colher: { t: 'uma colher cai no chão com estrondo', imp: 1, cd: 6, cat: 'p', pos: a => a[0] },
  s7Louca: { t: 'a louça treme depois do trovão', imp: 0, cd: 8, pos: a => a[0] },
  s7Pratos: { t: 'uma pilha de pratos treme', imp: 1, cd: 5, cat: 'p', pos: a => a[0] },
  s7Aula: { t: 'trinta vozes de criança abafadas atrás da porta', imp: 0, cd: 20, cat: 'h', pos: a => a[0] },
  s7AulaCala: { t: 'a sala de aula cala de uma vez: está vazia', imp: 1, cd: 12, cat: 'p' },
  s7Giz: { t: 'giz arranha a lousa', imp: 0, cd: 8, pos: a => a[0] },
  s7GizRola: { t: 'um giz rola na calha do quadro e cai', imp: 0, cd: 8, pos: a => a[0] },
  s7Contagem: { t: 'uma voz de mulher conta devagar, atrás da porta', imp: 1, cd: 20, cat: 'h', pos: a => a[0] },
  s7Psiu: { t: 'um coro fraco de "psiu" responde de todos os lados', imp: 1, cd: 10, cat: 'p' },
  s7Paginas: { t: 'páginas viram entre as estantes, e o som anda', imp: 0, cd: 12, cat: 'h', pos: a => a[0] },
  s7Traca: { t: 'asas de traça batem no escuro', imp: 0, cd: 16, pos: a => a[0] },
  s7Tunel: { t: 'o corredor sopra como um túnel de vento', imp: 0, cd: 14, cat: 'h' },
  s7Seguem: { t: 'passos atrás de você, no mesmo ritmo', imp: 1, cd: 20, cat: 'p' },
  s7Tabua: { t: 'uma tábua do corredor range alto sob o seu peso', imp: 1, cd: 4, cat: 'p', pos: a => a[0] },
  s7Cano: { t: 'cano batendo na parede', imp: 1, cd: 5, cat: 'p', pos: a => a[0] },
  s7Interfone: { t: 'o interfone toca ding-dong e avisa uma ala', imp: 1, cd: 20, cat: 'p', pos: a => a[0] },
  s7TuboOuve: { t: 'o latão do tubo traz o som de outra sala', imp: 0, cd: 6, cat: 'h' },
  s7TuboSopro: { t: 'o seu sopro desce pelo tubo e sai do outro lado', imp: 1, cd: 10, cat: 'p', pos: a => a[0] },
  s7Tel: { t: 'um telefone toca ao longe, e para', imp: 1, cd: 25, cat: 'h', pos: a => a[0] },
  s7Lavadora: { t: 'o tambor da máquina de lavar gira vazio', imp: 0, cd: 16, cat: 'h', pos: a => a[0] },
  s7Banheiro: { t: 'o cano do banheiro respira e dá um golpe grave', imp: 0, cd: 12, cat: 'h', pos: a => a[0] },
  s7Tres3: { t: 'três batidas nos canos, em sequência', imp: 1, cd: 25, cat: 'h', pos: a => a[0] },
  s7Assovio: { t: 'o vento assovia pela janela quebrada', imp: 0, cd: 14, cat: 'h', pos: a => a[0] },
  s7Rajada: { t: 'uma rajada sacode as janelas', imp: 0, cd: 10, pos: a => a[0] },
  s7Poca: { t: 'seu passo espirra numa poça', imp: 1, cd: 3, cat: 'p', pos: a => a[0] },
  s7Balanco: { t: 'um balanço de ferro range lá fora e para no meio', imp: 0, cd: 14, cat: 'h', pos: a => a[0] },
  s7Mariposa: { t: 'uma mariposa bate no vidro da lâmpada', imp: 0, cd: 14, pos: a => a[0] },
  s7PortaBate: { t: 'ao longe, uma porta solta bate no vento', imp: 1, cd: 8, cat: 'p', pos: a => a[0] },
  s7Coro: { t: 'um coro abafado reza atrás da parede', imp: 1, cd: 18, cat: 'h', pos: a => a[0] },
  s7Sino: { t: 'um sino distante marca o quarto de hora', imp: 0, cd: 20, cat: 'h' },
  s7Fino: { t: 'uma respiração vaza clara pelo reboco fino', imp: 1, cd: 14, cat: 'p', pos: a => a[0] },
  s7Despensa: { t: 'a madeira da despensa estala seca', imp: 0, cd: 14, pos: a => a[0] },
  s7Duto: { t: 'um duto estala por dilatação', imp: 0, cd: 12, pos: a => a[0] },
  s7Armarios: { t: 'portas de armário batem uma a uma, vindo na sua direção', imp: 1, cd: 30, cat: 'p', pos: a => a[0] },
  s7Uivo: { t: 'um cachorro uiva muito longe, e para', imp: 0, cd: 30, cat: 'h' },
  s7Coruja: { t: 'uma coruja pia no pátio', imp: 0, cd: 25, cat: 'h' },
  s7Frestas: { t: 'o vento assovia sob a porta principal', imp: 0, cd: 16, cat: 'h', pos: a => a[0] },
  s7Grade: { t: 'a grade da escada range na rajada', imp: 0, cd: 14, pos: a => a[0] },
  s7Murmurio: { t: 'um murmúrio de muita gente, no limite da audição', imp: 1, cd: 16, cat: 'h' },
  s7Parlenda: { t: 'crianças cantam uma cantiga de roda, à deriva', imp: 1, cd: 18, cat: 'h', pos: a => a[0] },
  s7Veneziana: { t: 'uma veneziana solta bate no batente', imp: 1, cd: 7, cat: 'p', pos: a => a[0] },
  s7Suspiro: { t: 'um suspiro de criança dentro do estalo da madeira', imp: 1, cd: 14, cat: 'h', pos: a => a[0] },
  s7Respira: { t: 'doze camas respiram juntas, devagar', imp: 0, cd: 20, cat: 'h' },
  s7RespiraErrada: { t: 'uma das respirações está fora do compasso', imp: 1, cd: 20, cat: 'h', pos: a => a[0] },
  s7Colchao: { t: 'um colchão range quando você passa', imp: 1, cd: 14, cat: 'p', pos: a => a[0] },
  s7Espelho: { t: 'o espelho emite um subgrave que treme', imp: 1, cd: 14, cat: 'p', pos: a => a[0] },
  s7Morcegos: { t: 'asas e guinchos descem do teto', imp: 1, cd: 10, cat: 'p', pos: a => a[0] },
  s7Degrau: { t: 'um degrau range logo atrás de você', imp: 1, cd: 6, cat: 'p', pos: a => a[0] },
  s7Escada: { t: 'a escada de madeira desaba em estalos sob a sua corrida', imp: 1, cd: 6, cat: 'p', pos: a => a[0] },
  s7Telhado: { t: 'a chuva martela o telhado, bem em cima', imp: 0, cd: 25, cat: 'h' },
  s7Harmonio: { t: 'um acorde desafinado de harmônio preenche o ar', imp: 1, cd: 20, cat: 'h', pos: a => a[0] },
  s7Caixinha: { t: 'uma caixinha de música toca fraco e some', imp: 1, cd: 20, cat: 'h', pos: a => a[0] },
  s7Cadeirao: { t: 'uma cadeira de balanço range onde ninguém senta', imp: 1, cd: 14, cat: 'h', pos: a => a[0] },
  s7Assoalho: { t: 'as tábuas do corredor tocam uma nota ao pisar', imp: 0, cd: 3, cat: 'h', pos: a => a[0] },
  s7Hino: { t: 'as tábuas completam o primeiro verso do hino', imp: 1, cd: 20, cat: 'h' },
  s7Forro: { t: 'passos arrastados no forro, acima do dormitório', imp: 1, cd: 20, cat: 'p', pos: a => a[0] },
  s7Tosse: { t: 'a tosse abafada de uma criança, atrás da porta', imp: 1, cd: 20, cat: 'h', pos: a => a[0] },
  s7Cabo: { t: 'o cabo do monta-cargas geme e a gaiola balança', imp: 1, cd: 6, cat: 'p', pos: a => a[0] },
  s7Roupa: { t: 'roupa pendurada farfalha numa corrente de ar', imp: 0, cd: 14, pos: a => a[0] },
  s7Hush: { t: 'a vida da sala emudece', imp: 1, cd: 14, cat: 'p' },
  s7Ar: { t: 'prender o ar cala os sons da casa: só o perigo fica', imp: 0, cd: 30, cat: 'h' }
};
function instalarLeg(A) { try { const d = A.legendas; if (d) for (const k in LEG) if (!d[k]) d[k] = LEG[k]; } catch (e) {} }

const VOG = { a: [800, 1200], e: [500, 1800], i: [300, 2300], o: [500, 900], u: [320, 800] };

// motor de áudio compartilhado entre os dois mapas do internato
function motor(A, S) {
  const au = A.audio, P = A.P, M = A.M, W = A.W, grupo = W.grupo;
  const vistos = new Set();
  const aviso = (e, onde) => { const k = onde + (e && e.message); if (vistos.has(k)) return; vistos.add(k); try { console.warn('[som7]', onde, e && e.message); } catch (_) {} };
  const AC = () => { try { return au && au.AC && au.AC.state !== 'closed' ? au.AC : null; } catch (e) { return null; } };
  const noMapa = () => A.W.grupo === grupo;
  const jogando = () => { try { return A.mode === 'jogo' && !S.dead && !S.fim; } catch (e) { return false; } };
  const ok = () => noMapa() && jogando() && !!AC();
  const baixa = () => { try { return !!(window.__plat && window.__plat.O && window.__plat.O.qual === 'baixa'); } catch (e) { return false; } };
  const dist = (x, z) => Math.hypot(P.pos.x - x, P.pos.z - z);
  const salaId = () => (P.room && P.room.id) || null;
  const mAtivo = () => { try { return !!M.ativo; } catch (e) { return false; } };
  const mSala = () => { try { if (!mAtivo()) return null; const r = A.roomAt(M.pos.x, M.pos.z); return r && r.id; } catch (e) { return null; } };
  const mDist = (x, z) => { try { return mAtivo() ? Math.hypot(M.pos.x - x, M.pos.z - z) : 1e9; } catch (e) { return 1e9; } };
  const porta = id => A.W.doors.find(d => d.id === id);
  const aberta = d => !!d && Math.abs(d.ang || 0) > .3;
  const leg = (k, pos) => { try { A.SFX[k](pos ? { x: pos.x, y: pos.y ?? 1.4, z: pos.z } : null); } catch (e) {} };
  const depois = (ms, fn) => setTimeout(() => { if (ok()) { try { fn(); } catch (e) { aviso(e, 'depois'); } } }, ms);
  const saida = (pos, wet, bus) => au.saida(pos || null, wet ?? .3, bus || 'amb');
  const flag = k => { const f = S.flags; return f['s7_' + k]; };
  const marca = k => { S.flags['s7_' + k] = true; };

  // ---- primitivas de som (todas posicionais, passam pela oclusão do motor)
  function tom(pos, f, vol, dur, tipo = 'sine', wet = .25, bus = 'amb') {
    const C = AC(); if (!C) return; const t = C.currentTime, g = saida(pos, wet, bus);
    const o = C.createOscillator(); o.type = tipo; o.frequency.value = f; o.connect(g); o.onended = () => o.disconnect();
    const atk = Math.min(dur * .3, .4); au.env(g, t, atk, vol, dur - atk); o.start(t); o.stop(t + dur + .1); return o;
  }
  function sopro(pos, filtro, freq, q, dur, vol, atk = .02, wet = .3, bus = 'amb') {
    const C = AC(); if (!C) return null; const t = C.currentTime, g = saida(pos, wet, bus);
    const f = au.burst(t, dur, filtro, freq, q, g); au.env(g, t, Math.min(atk, dur * .6), vol, Math.max(.03, dur - atk)); return f;
  }
  function clique(pos, vol, freq, dur = .03) { sopro(pos, 'highpass', freq, 1, dur, vol, .001, .15); }
  function nota(pos, f, vol, dur, wet = .4, bus = 'amb') {
    const C = AC(); if (!C) return; const t = C.currentTime, g = saida(pos, wet, bus);
    for (const [m, a, tp] of [[1, 1, 'sine'], [2.01, .3, 'sine'], [3.9, .1, 'triangle']]) { const o = C.createOscillator(); o.type = tp; o.frequency.value = f * m; const og = C.createGain(); og.gain.value = a; o.connect(og); og.connect(g); o.onended = () => o.disconnect(); o.start(t); o.stop(t + dur + .1); }
    au.env(g, t, .006, vol, dur);
  }
  function pingo(pos, vol = .3) {
    const C = AC(); if (!C) return; const t = C.currentTime, g = saida(pos, .35), o = C.createOscillator(); o.type = 'sine'; const f = rand(900, 1500);
    o.frequency.setValueAtTime(f, t); o.frequency.exponentialRampToValueAtTime(f * .4, t + .05); o.connect(g); o.onended = () => o.disconnect();
    au.env(g, t, .002, vol, .09); o.start(t); o.stop(t + .12);
  }
  function vidrinho(pos, vol = .22, n = 3) {
    const C = AC(); if (!C) return; const t0 = C.currentTime;
    for (let i = 0; i < n; i++) { const t = t0 + i * rand(.02, .08), g = saida(pos, .4), o = C.createOscillator(); o.type = 'sine'; o.frequency.value = rand(2200, 4200); o.connect(g); o.onended = () => o.disconnect(); au.env(g, t, .001, vol, rand(.08, .2)); o.start(t); o.stop(t + .3); }
  }
  function assovio(pos, f, vol, dur) { const bp = sopro(pos, 'bandpass', f, 14, dur, vol, dur * .3, .3); if (bp) { const C = AC(); bp.frequency.linearRampToValueAtTime(f * rand(1.04, 1.12), C.currentTime + dur); } }
  function metal(pos, vol = .2, f = 1500) { const C = AC(); if (!C) return; const t = C.currentTime, g = saida(pos, .4); au.burst(t, .1, 'bandpass', f, 12, g); au.env(g, t, .001, vol, .1); tom(pos, f * .31, vol * .45, .25, 'triangle', .3); }
  function silaba(pos, f0, v, dur, vol, wet = .5, t0) {
    const C = AC(); if (!C) return; const t = t0 ?? C.currentTime, g = saida(pos, wet, 'voz'), o = C.createOscillator(); o.type = 'sawtooth';
    o.frequency.setValueAtTime(f0, t); o.frequency.linearRampToValueAtTime(f0 * .94, t + dur);
    const [f1, f2] = VOG[v] || VOG.a;
    for (const [ff, a] of [[f1, 1], [f2, .5]]) { const bp = C.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = ff; bp.Q.value = 6; const bg = C.createGain(); bg.gain.value = a; o.connect(bp); bp.connect(bg); bg.connect(g); }
    au.env(g, t, .05, vol, dur); o.onended = () => { try { o.disconnect(); } catch (e) {} }; o.start(t); o.stop(t + dur + .12);
  }
  // murmúrio de gente: sílabas curtas sussurradas de pontos espalhados, mais um colchão de sopro
  function murmurio(pos, vol, n, aberto = 2.5) {
    const C = AC(); if (!C) return; const t0 = C.currentTime;
    for (let i = 0; i < n; i++) silaba({ x: pos.x + rand(-aberto, aberto), y: pos.y ?? 1.3, z: pos.z + rand(-aberto, aberto) }, rand(190, 330), pick(['a', 'e', 'i', 'o', 'u']), rand(.07, .2), vol * rand(.8, 1.6), .6, t0 + i * rand(.05, .3));
    sopro(pos, 'bandpass', rand(700, 1100), 1.2, 1.2, vol * .1, .3, .5);
  }
  function raspa(pos, vol = .2) { // cadeira arrastada no ladrilho
    const C = AC(); if (!C) return; const t = C.currentTime, g = saida(pos, .5, 'amb'), f = au.burst(t, .45, 'bandpass', 380, 3, g); f.frequency.linearRampToValueAtTime(240, t + .45); au.env(g, t, .06, vol, .4);
  }

  // ---- agendador de fontes: dispara fn em intervalos, só quando perto e o som está disponível
  const fontes = [], reativos = [];
  function fonte(x, z, every, jit, maxd, fn, cond, nome) { const s = { x, z, every, jit, maxd, fn, cond, nome, t: rand(0, every) }; fontes.push(s); return s; }
  function reativo(fn) { reativos.push(fn); }

  // silêncio como arma: a vida do prédio (grilos, murmúrios, pingos) cala quando a entidade entra na sala
  // e quando a Lia prende o ar para escutar; o que fica é só o perigo
  let vivo = 1, calouAte = 0, arAvisou = 0, segurouAr = 0;
  function silencioUpdate(dt) {
    const perto = (mAtivo() && mSala() === salaId() && salaId()) || (mAtivo() && (M.state === 'bote' || M.state === 'agarra'));
    const segura = !!P.prende;
    segurouAr = segura ? segurouAr + dt : 0;
    const alvo = perto ? 0 : segura ? .08 : 1;
    const antes = vivo; vivo += (alvo - vivo) * Math.min(1, dt * (alvo < vivo ? 6 : 1.2));
    if (antes > .5 && vivo <= .5) {
      if (perto && A.perf() - calouAte > 5) { calouAte = A.perf(); leg('s7Hush'); }
      else if (segura && A.perf() - arAvisou > 30) { arAvisou = A.perf(); leg('s7Ar'); }
    }
  }
  const mult = () => vivo;

  // ritmo de passos da Lia (para ecos e tábuas): distância andada, ignora teleporte
  let ux = P.pos.x, uz = P.pos.z, andou = 0;
  const passoEvt = [];
  function passosUpdate() {
    const d = Math.hypot(P.pos.x - ux, P.pos.z - uz); ux = P.pos.x; uz = P.pos.z;
    if (d > 1.5 || d < .003) return; // parada ou teleporte
    andou += d;
    const L = P.sprinting ? 1.15 : (P.crouch || P.devagar) ? .6 : .8;
    while (andou >= L) { andou -= L; for (const f of passoEvt) { try { f(); } catch (e) { aviso(e, 'passo'); } } }
  }
  const aoPasso = fn => passoEvt.push(fn);

  // tom de sala: cada tipo de sala tem a sua "respiração" grave de fundo (ambiência por sala), com troca suave
  const TONS = {
    hall: { f: 'lowpass', fr: 260, q: .6, v: .030 }, corredor: { f: 'bandpass', fr: 170, q: 1.2, v: .024 }, aula: { f: 'lowpass', fr: 200, q: .7, v: .014 },
    biblioteca: { f: 'lowpass', fr: 140, q: .7, v: .012 }, refeitorio: { f: 'lowpass', fr: 230, q: .6, v: .032 }, cozinha: { f: 'bandpass', fr: 320, q: 1.5, v: .016 },
    despensa: { f: 'lowpass', fr: 110, q: .8, v: .006 }, diretoria: { f: 'lowpass', fr: 250, q: .7, v: .012 }, enfermaria: { f: 'bandpass', fr: 520, q: 2.4, v: .012 },
    lavanderia: { f: 'bandpass', fr: 90, q: 1.4, v: .03 }, banheiro: { f: 'bandpass', fr: 420, q: 3, v: .016 }, maquinas: { f: 'lowpass', fr: 120, q: .9, v: .04 },
    dorm: { f: 'lowpass', fr: 180, q: .7, v: .014 }, quarto: { f: 'lowpass', fr: 100, q: .8, v: .006 }, rouparia: { f: 'lowpass', fr: 150, q: .7, v: .01 },
    brinquedos: { f: 'bandpass', fr: 600, q: 4, v: .008 }, deposito: { f: 'lowpass', fr: 130, q: .9, v: .022 }
  };
  let tomT = 0;
  function tomSalaUpdate(dt) {
    tomT -= dt; if (tomT > 0) return; tomT = 1.4;
    const r = P.room; if (!r || r.fora) return; const d = TONS[r.tipo] || TONS.corredor;
    const C = AC(); if (!C) return; const t = C.currentTime, g = saida(null, .1, 'amb'), f = au.burst(t, 2.2, d.f, d.fr, d.q, g);
    f.frequency.linearRampToValueAtTime(d.fr * rand(.8, 1.2), t + 2); au.env(g, t, .6, d.v * (.5 + .5 * vivo), 1.6);
  }

  // uma tick só para tudo
  let disparos = 0;
  W.tick.push(dt => {
    if (!noMapa() || !jogando() || window.__SOM7OFF) return; // __SOM7OFF: interruptor de teste (A/B de desempenho)
    const C = AC();
    try { silencioUpdate(dt); } catch (e) { aviso(e, 'silencio'); }
    try { passosUpdate(); } catch (e) { aviso(e, 'passos'); }
    for (const f of reativos) { try { f(dt); } catch (e) { aviso(e, 'reativo'); } }
    if (!C) return;
    try { tomSalaUpdate(dt); } catch (e) { aviso(e, 'tom'); }
    disparos = 0; const lento = baixa() ? 1.8 : 1;
    for (const s of fontes) {
      s.t -= dt; if (s.t > 0) continue;
      if (disparos >= 2) { s.t = .06; continue; }
      s.t = (s.every + rand(0, s.jit)) * lento;
      if (s.cond && !s.cond()) continue;
      if (dist(s.x, s.z) > s.maxd) continue;
      disparos++; try { s.fn(); } catch (e) { aviso(e, s.nome || 'fonte'); }
    }
  });
  instalarLeg(A);
  const E = { fontes, reativos, au, A, S, P, M, W, rand, pick, clamp, AC, ok, dist, salaId, mAtivo, mSala, mDist, porta, aberta, leg, depois, saida, flag, marca, tom, sopro, clique, nota, pingo, vidrinho, assovio, metal, silaba, murmurio, raspa, fonte, reativo, aoPasso, mult, baixa };
  try { window.__som7 = E; } catch (e) {}
  return E;
}

// ---- relógio de rajada de chuva/trovão do motor: brilho do relâmpago (0..1)
const raio = A => { try { return A.raioI || 0; } catch (e) { return 0; } };

// tubo de latão: encosta o ouvido e escuta a outra ponta, com o filtro e a ressonância do metal
function montarTubo(E, o) {
  const { A, S, au, M } = E, T = A.THREE, MAT = A.MAT;
  const g = new T.Group(); g.position.set(o.x, o.y, o.z); g.rotation.y = o.ry; A.W.grupo.add(g);
  const brass = MAT.bronze || MAT.metal;
  const placa = new T.Mesh(new T.BoxGeometry(.34, .34, .03), brass); g.add(placa);
  const funil = new T.Mesh(new T.CylinderGeometry(.11, .035, .24, 12), brass); funil.rotation.x = Math.PI / 2; funil.position.z = .12; g.add(funil);
  const aro = new T.Mesh(new T.TorusGeometry(.115, .012, 6, 14), brass); aro.position.z = .24; g.add(aro);
  let ouvindo = 0, esfria = 0, nota = 0;
  const it = A.interact(g, () => esfria > 0 ? 'O latão ainda vibra. Espere um pouco.' : ouvindo > 0 ? 'Você encosta o ouvido no latão frio…' : '<b>E</b>Encostar o ouvido no tubo de latão',
    () => {
      if (esfria > 0 || ouvindo > 0 || !E.ok()) return;
      ouvindo = 6; nota = 0; E.leg('s7TuboOuve'); E.sopro(null, 'bandpass', 2200, 3, 1.4, .03, .4, .1);
    });
  E.reativo(dt => {
    if (esfria > 0) esfria -= dt;
    if (ouvindo <= 0) return;
    ouvindo -= dt; nota -= dt;
    const longe = E.dist(o.x, o.z) > 3.2 || A.mode !== 'jogo'; // saiu de perto: perde o tubo
    if (longe) { ouvindo = 0; esfria = 4; return; }
    if (nota <= 0) {
      const ativo = E.mAtivo(), d = E.mDist(o.px, o.pz), perto = ativo && d < 16;
      // chiado do tubo: sopro com a ressonância de um cano de 2 m
      E.sopro(null, 'bandpass', 540, 9, .5, .05, .1, .1); E.sopro(null, 'bandpass', 1080, 6, .4, .02, .1, .1);
      if (perto) {
        const rit = M.state === 'caca' ? .22 : M.state === 'procura' ? .34 : .5;
        nota = rit; E.sopro(null, 'lowpass', 700, 1, .09, .22, .002, .2); E.tom(null, 130, .12, .18, 'triangle', .2);
        if (!E.flag('tubo' + o.id) && ouvindo < 5.2) { E.marca('tubo' + o.id); A.toast('[pelo tubo: passos pesados. ' + ((A.roomAt(M.pos.x, M.pos.z) || {}).nome || 'em algum lugar') + ']'); }
      } else { nota = rand(.5, .9); if (Math.random() < .25) E.tom(null, rand(180, 260), .03, .8, 'sine', .3); }
    }
    if (ouvindo <= 0) { // fim da escuta: o sopro também desce pelo tubo
      esfria = 12;
      if (E.mAtivo() && E.mDist(o.px, o.pz) < 30 && Math.random() < .3) { A.emitNoise(o.px, o.pz, 7); E.leg('s7TuboSopro', { x: o.px, y: 1.4, z: o.pz }); }
    }
  });
  return it;
}

// =====================================================================
// TÉRREO
// =====================================================================
export function somTerreo(A, S, ctx = {}) {
  const E = motor(A, S);
  const { fonte, reativo, leg, tom, sopro, clique, nota, pingo, vidrinho, assovio, metal, silaba, murmurio, raspa, rand, pick, clamp, dist, mAtivo, mDist, mSala, salaId, mult, porta, aberta, depois, au, ok, aoPasso } = E;
  const P = A.P, M = A.M, W = A.W;
  const seed = hash((S.semente || 'SEMCOD') + '|som7t');
  const energia = () => !!S.flags.energia;

  // ---------------------------------------------------------------- RECEPÇÃO: relógio de pêndulo
  // tic e tac com timbres diferentes; vira bússola: onde o pêndulo cala, algo entrou
  const rel = { x: -3.5, y: 2.2, z: -13.88 };
  let lado = 0, parado = 0, hallEra = false, presagio = 0, doisTres = false;
  fonte(rel.x, rel.z, 1, .02, 38, () => {
    if (parado > 0) return;
    clique(rel, lado ? .1 : .085, lado ? 2600 : 2250, .025); tom(rel, lado ? 96 : 118, .02, .06, 'square', .2);
    if (!lado) leg('s7Pendulo', rel);
    lado ^= 1;
  }, null, 'pendulo');
  reativo(dt => {
    if (parado > 0) parado -= dt;
    // o pêndulo cala 6 s quando o Inspetor entra no hall (cala de verdade, o salão prende o ar)
    const nele = mAtivo() && mSala() === 'hall';
    if (nele && !hallEra && parado <= 0) { parado = 6; leg('s7PenduloPara', rel); }
    hallEra = nele;
    // presságio sem monstro nenhum: de vez em quando o pêndulo para por conta própria
    presagio -= dt;
    if (presagio <= 0) { presagio = rand(70, 140); if (dist(rel.x, rel.z) < 22 && parado <= 0 && Math.random() < .4) { parado = rand(2.5, 4.5); leg('s7PenduloPara', rel); } }
    // às 3h07 do relógio real o pêndulo bate três vezes sozinho e para
    if (!doisTres) {
      const d = new Date();
      if (d.getHours() === 3 && d.getMinutes() === 7) { doisTres = true; parado = 70; [0, 1100, 2200].forEach(ms => depois(ms, () => nota(rel, 196, .24, 2.4, .6))); leg('s7Tres', rel); }
    }
  });

  // ---------------------------------------------------------------- DIRETORIA: relógio desregulado e barômetro
  const diret = { x: 17, y: 2, z: -9.6 };
  let dLado = 0, dT = 0, faixaAnt = 0;
  reativo(dt => {
    if (dist(diret.x, diret.z) > 24) return;
    let iv = 1.05, faixa = 0; // o intervalo entre cliques mede a ameaça: calmo, intranquilo, caça
    if (mAtivo()) { const st = M.state; faixa = st === 'caca' || st === 'bote' ? 3 : st === 'procura' || st === 'fareja' ? 2 : st === 'investiga' || st === 'alerta' ? 1 : 0; iv = [1.05, .8, .62, .42][faixa]; }
    const calado = mAtivo() && M.state === 'escuta';
    dT -= dt;
    if (dT <= 0 && !calado) { dT = iv * (faixa === 3 ? rand(.8, 1.3) : 1); clique(diret, dLado ? .07 : .06, dLado ? 2500 : 2250, .022); dLado ^= 1; }
    // barômetro: o ponteiro estala ao mudar de faixa de ameaça (dá para ouvir da porta)
    if (faixa !== faixaAnt) { if (dist(diret.x, diret.z) < 16) { metal({ x: 11, y: 1.6, z: -9.7 }, .16, 3000); leg('s7Barometro', { x: 11, y: 1.6, z: -9.7 }); } faixaAnt = faixa; }
  });
  // telefone da diretoria: toca ao longe e para no instante em que a porta abre
  const tel = { x: 12, y: 1, z: -2 };
  let telT = 0, telNext = 0;
  fonte(tel.x, tel.z, 45, 30, 30, () => { if (salaId() === 'diret') return; telT = rand(5, 9); }, null, 'telefone');
  reativo(dt => {
    if (telT <= 0) return;
    if (salaId() === 'diret') { telT = 0; return; }
    telT -= dt; telNext -= dt;
    if (telNext <= 0 && E.AC() && dist(tel.x, tel.z) < 34) {
      telNext = 1.15; const C = E.AC(), t = C.currentTime;
      for (const k of [0, .26]) { const g = E.saida(tel, .3); const o1 = C.createOscillator(), o2 = C.createOscillator(); o1.type = o2.type = 'square'; o1.frequency.value = 1100; o2.frequency.value = 1300; o1.connect(g); o2.connect(g); au.env(g, t + k, .005, .05, .18); for (const o of [o1, o2]) { o.start(t + k); o.stop(t + k + .22); } }
      if (Math.random() < .3) leg('s7Tel', tel);
    }
  });

  // ---------------------------------------------------------------- COZINHA E REFEITÓRIO
  // geladeira com compressor: ronca com energia, morre num estalo quando a energia some e volta com tranco
  const gel = { x: -33.4, y: 1, z: -22 };
  let gelOn = false, geladeiraEnergiaAnt = energia();
  fonte(gel.x, gel.z, 1.4, .1, 30, () => {
    const C = E.AC(); if (!C || !energia()) return; const t = C.currentTime, g = E.saida(gel, .12), o = C.createOscillator(); o.type = 'sawtooth'; o.frequency.value = 52; const lp = C.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 200;
    o.connect(lp); lp.connect(g); au.env(g, t, .3, .05 * mult(), 1.3); o.onended = () => o.disconnect(); o.start(t); o.stop(t + 1.8); gelOn = true;
  }, null, 'geladeira');
  reativo(() => {
    const e = energia();
    if (geladeiraEnergiaAnt && !e && dist(gel.x, gel.z) < 34) { clique(gel, .22, 1500, .03); tom(gel, 48, .1, .6, 'sine', .1); leg('s7Geladeira', gel); }
    if (!geladeiraEnergiaAnt && e && dist(gel.x, gel.z) < 34) { depois(900, () => { metal(gel, .22, 700); tom(gel, 60, .08, .9, 'sawtooth', .1); }); }
    geladeiraEnergiaAnt = e;
  });
  // fogão a lenha esfriando: tiques de metal contraindo
  const fogao = { x: -32.6, y: .9, z: -15.5 };
  fonte(fogao.x, fogao.z, 3.4, 3, 20, () => clique(fogao, rand(.05, .12), rand(2600, 4200), .02), null, 'fogao');
  // as fontes fixas da casa (bomba, caldeira, transformador) acordam uma a uma quando o gerador liga e morrem juntas
  const bomba = { x: 25.5, y: .6, z: -16.8 }, caldeira = { x: 30, y: 1, z: -24.6 }, trafo = { x: 20, y: 2.4, z: -12.3 };
  const fix = { bomba: 0, caldeira: 0, trafo: 0 }; let fixAnt = false, fixT = 0;
  const hum = (pos, f, vol, tipo, lp) => { const C = E.AC(); if (!C) return; const t = C.currentTime, g = E.saida(pos, .12), o = C.createOscillator(); o.type = tipo; o.frequency.value = f; const fl = C.createBiquadFilter(); fl.type = 'lowpass'; fl.frequency.value = lp; o.connect(fl); fl.connect(g); au.env(g, t, .3, vol, 1.3); o.onended = () => o.disconnect(); o.start(t); o.stop(t + 1.8); };
  fonte(bomba.x, bomba.z, 1.35, 0, 30, () => { if (fix.bomba) { hum(bomba, 63, .06 * mult(), 'sawtooth', 260); if (Math.random() < .3) clique(bomba, .06, 900, .03); } }, null, 'bomba');
  fonte(caldeira.x, caldeira.z, 1.3, 0, 30, () => { if (fix.caldeira) hum(caldeira, 38, .07 * mult(), 'sawtooth', 160); }, null, 'caldeira');
  fonte(trafo.x, trafo.z, 1.3, 0, 26, () => { if (fix.trafo) { hum(trafo, 120, .035 * mult(), 'square', 700); hum(trafo, 240, .012 * mult(), 'sine', 900); } }, null, 'trafo');
  reativo(dt => {
    const e = energia();
    if (e && !fixAnt) { fixAnt = true; fixT = 0; if (dist(28, -19) < 40) leg('s7Acorda'); }
    if (!e && fixAnt) { fixAnt = false; if (fix.bomba || fix.caldeira || fix.trafo) { if (dist(28, -19) < 34) metal(caldeira, .24, 900); } fix.bomba = fix.caldeira = fix.trafo = 0; }
    if (e) { fixT += dt; if (fixT > 1.2) fix.bomba = 1; if (fixT > 3.3) fix.caldeira = 1; if (fixT > 5.6) fix.trafo = 1; }
  });
  // a tubulação desenha a casa quando o gerador liga: estalos e assovios em cadeia, do gerador até o hall
  let canosAnt = false;
  reativo(() => {
    const e = energia();
    if (e && !canosAnt) { canosAnt = true; [[31.6, -19], [24, -20], [16, -20], [8, -18], [0, -12]].forEach((p, i) => depois(i * 420, () => { assovio({ x: p[0], y: 2, z: p[1] }, 700, .06, .5); metal({ x: p[0], y: 2.2, z: p[1] }, .12, 1800); })); }
    if (!e) canosAnt = false;
  });
  // caldeira solta um sopro de vapor de tempos em tempos (só com energia)
  fonte(caldeira.x, caldeira.z, 22, 14, 26, () => { if (!fix.caldeira) return; sopro(caldeira, 'highpass', 2400, .7, 1.4, .08, .25, .3); leg('s7Vapor', caldeira); }, null, 'vapor');
  // dutos estalam por dilatação, mais perto do gerador quente
  fonte(31.6, -19, 5, 4, 28, () => { const p = { x: rand(20, 33), y: 2.5, z: rand(-25, -15) }; metal(p, energia() ? .13 : .07, rand(1400, 2400)); if (Math.random() < .25) leg('s7Duto', p); }, null, 'dutos');

  // refeitório: quarenta crianças comendo atrás da porta; ao abrir, tudo cala de uma vez e fica só o eco
  const ref = { x: -15, y: 1.4, z: -19.5 };
  let refCal = 0, refSaiu = -99, refDentroAnt = false, murmuroVolta = 1;
  fonte(ref.x, ref.z, 1.15, .5, 32, () => {
    const dentro = salaId() === 'refeit', procissao = S.chapter === 2;
    if (dentro && !procissao) return; if (refCal > 0 && !procissao) return;
    const k = clamp((A.perf() - refSaiu) / 22, .15, 1);
    murmurio(ref, .075 * mult() * (dentro ? .6 : k), dentro ? 2 : 4, 4.5);
    if (Math.random() < .25) { clique({ x: ref.x + rand(-4, 4), y: 1, z: ref.z + rand(-3, 3) }, .06, 3200, .02); }
    if (!dentro && Math.random() < .12) leg('s7Refeit', ref);
  }, null, 'refeitorio');
  reativo(dt => {
    if (refCal > 0) refCal -= dt;
    const dentro = salaId() === 'refeit';
    if (dentro && !refDentroAnt) {
      refCal = 16; murmuroVolta = 0;
      if (S.chapter !== 2) {
        leg('s7RefCala'); sopro({ x: ref.x, y: 2.4, z: ref.z }, 'lowpass', 260, .6, 1.8, .06, .5, .95); // o eco vazio do pé-direito alto
        depois(900, () => { const p = { x: P.pos.x + rand(-3, 3), y: .1, z: P.pos.z + rand(-4, -2) }; raspa(p, .2); leg('s7Cadeira', p); });
      }
    }
    if (!dentro && refDentroAnt) refSaiu = A.perf();
    refDentroAnt = dentro;
  });
  // ao se aproximar: talheres e pratos batem em marcha lenta (3 tempos); para quando você entra
  fonte(ref.x, ref.z, 14, 8, 14, () => {
    if (salaId() === 'refeit' || refCal > 0) return; const p = { x: ref.x + rand(-3, 3), y: 1.1, z: ref.z + rand(-3, 3) };
    [0, 640, 1280].forEach(ms => depois(ms, () => { if (salaId() === 'refeit') return; metal(p, .13, 2900); clique(p, .08, 1800, .04); })); leg('s7Marcha', p);
  }, () => !aberta(porta('refeit')) || dist(-15, -14) < 6, 'marcha');
  // talheres tilintam sozinhos quando você anda devagar lá dentro e param quando você para; correndo, uma colher cai de verdade
  let talT = 0, colherCd = 0;
  reativo(dt => {
    colherCd -= dt;
    if (salaId() !== 'refeit') { talT = 0; return; }
    const anda = P.noiseR > 0;
    if (P.sprinting && colherCd <= 0 && Math.random() < dt * .8) {
      colherCd = 26; const p = { x: P.pos.x + rand(-2.5, 2.5), y: .05, z: P.pos.z + rand(-2.5, 2.5) };
      metal(p, .3, 1900); depois(160, () => metal(p, .2, 2600)); A.emitNoise(p.x, p.z, 7); leg('s7Colher', p); return;
    }
    if (!anda) { talT = 0; return; }
    talT -= dt; if (talT <= 0 && !P.sprinting && refCal < 8) { talT = rand(.35, .8); const p = { x: P.pos.x + rand(-5, 5), y: 1.0, z: P.pos.z + rand(-5, 5) }; vidrinho(p, .1, 2); if (Math.random() < .12) leg('s7Talheres', p); }
  });
  // pé-direito alto: os passos no refeitório voltam em eco duas vezes
  aoPasso(() => {
    if (salaId() !== 'refeit') return; const v = P.sprinting ? .26 : .15;
    depois(300, () => { try { A.SFX.passo(v, 'ladrilho'); } catch (e) {} }); depois(620, () => { try { A.SFX.passo(v * .55, 'ladrilho'); } catch (e) {} });
  });
  // trovão: a louça da cozinha e do refeitório tilinta em ressonância
  let raioAnt = 0;
  reativo(() => {
    const r = raio(A); const sobe = r > .5 && raioAnt <= .5; raioAnt = r;
    if (sobe && dist(-24, -20) < 26) depois(rand(300, 1500), () => { const p = { x: rand(-32, -16), y: 1.1, z: rand(-24, -16) }; vidrinho(p, .2, 4); metal(p, .08, 2800); leg('s7Louca', p); });
  });
  // pilha de pratos na cozinha: correr perto faz tilintar, às vezes cai
  const pratos = { x: -25.5, y: 1.1, z: -16 }; let pratCd = 0;
  reativo(dt => {
    if (pratCd > 0) { pratCd -= dt; return; }
    if (dist(pratos.x, pratos.z) < 1.8 && P.sprinting) { pratCd = 9; vidrinho(pratos, .16, 3); leg('s7Pratos', pratos); if (Math.random() < .45) depois(500, () => { A.SFX.vidro(pratos.x, pratos.z); A.emitNoise(pratos.x, pratos.z, 12); }); }
  });
  // parede fina entre o refeitório e a cozinha: encostar nela deixa a respiração do outro lado vazar clara
  const fino = { x: -24, z: -20 }; let finoCd = 0, finoDica = -99;
  reativo(dt => {
    if (finoCd > 0) { finoCd -= dt; return; }
    if (Math.hypot(P.pos.x - fino.x, P.pos.z - fino.z) > 2.4 || !mAtivo()) return;
    const outra = mSala(); if (!(outra === 'cozinha' || outra === 'refeit') || outra === salaId()) return;
    finoCd = 1.5; sopro({ x: fino.x + (outra === 'cozinha' ? -1.2 : 1.2), y: 1.3, z: fino.z }, 'lowpass', 900, 1, .5, .09, .15, .1); leg('s7Fino', { x: fino.x, y: 1.3, z: fino.z });
    if (A.perf() - finoDica > 50 && S.chapter >= 1) { finoDica = A.perf(); A.sub('lia', 'A parede aqui é só reboco. Dá pra ouvir o outro lado.'); }
  });
  // despensa: a prateleira esfria e estala seca
  fonte(-29, -30, 7, 5, 18, () => { const p = { x: rand(-33, -25), y: rand(.6, 1.8), z: rand(-33, -27) }; A.SFX.rangido(p.x, p.y, p.z, .22, 'amb'); leg('s7Despensa', p); }, null, 'despensa');

  // ---------------------------------------------------------------- SALA DE AULA
  const aula = { x: -13, y: 1.4, z: -4.5 }; let aulaCal = 0, aulaDentroAnt = false, contouAte = 3 + (seed % 7), contagemT = 0;
  fonte(aula.x, aula.z, 1.4, .8, 26, () => {
    if (salaId() === 'aula' || aulaCal > 0 || aberta(porta('aula')) && salaId() !== 'cw') return;
    murmurio(aula, .06 * mult(), 4, 4); if (Math.random() < .12) leg('s7Aula', aula);
  }, null, 'aula-murmura');
  reativo(dt => {
    if (aulaCal > 0) aulaCal -= dt; contagemT -= dt;
    const dentro = salaId() === 'aula';
    if (dentro && !aulaDentroAnt) {
      aulaCal = 18; leg('s7AulaCala'); sopro(aula, 'lowpass', 300, .6, 1.4, .05, .4, .6, 'amb');
      depois(1800, () => { if (salaId() === 'aula' && !E.flag('aula')) { E.marca('aula'); A.sub('lia', 'Vazia. As carteiras viradas pra porta, e o giz ainda caindo do quadro. Parou no ' + contouAte + '.'); } });
    }
    aulaDentroAnt = dentro;
  });
  // a professora conta devagar em formantes, atrás da porta; quando você entra a contagem para
  fonte(aula.x, aula.z, 30, 25, 18, () => {
    if (salaId() === 'aula' || aulaCal > 0) return; const V = ['u', 'o', 'e', 'e', 'i', 'e', 'e', 'o', 'o'], t0 = E.AC().currentTime;
    for (let i = 0; i < Math.min(contouAte, 7); i++) silaba(aula, 150 + i * 4, V[i] || 'a', .45, .12, .6, t0 + i * 1.15);
    leg('s7Contagem', aula);
  }, null, 'professora');
  // giz arranhando e rolando na calha
  const quadroAula = { x: -13, y: 1.6, z: -9.6 };
  fonte(quadroAula.x, quadroAula.z, 11, 9, 16, () => {
    const C = E.AC(); if (!C) return; const t = C.currentTime, g = E.saida(quadroAula, .2), bp = au.burst(t, .22, 'bandpass', rand(3200, 4200), 22, g);
    const lfo = C.createOscillator(); lfo.frequency.value = 7; const lg = C.createGain(); lg.gain.value = 300; lfo.connect(lg); lg.connect(bp.frequency); lfo.start(t); lfo.stop(t + .3);
    au.env(g, t, .01, .22, .2); leg('s7Giz', quadroAula);
  }, null, 'giz');
  let raio2 = 0;
  reativo(() => {
    const r = raio(A), tremor = (r > .5 && raio2 <= .5) || (mAtivo() && M.state === 'caca' && mDist(quadroAula.x, quadroAula.z) < 8 && Math.random() < .004); raio2 = r;
    if (tremor && dist(quadroAula.x, quadroAula.z) < 20) { tom(quadroAula, 220, .09, .5, 'triangle', .2); depois(560, () => clique(quadroAula, .18, 900, .04)); leg('s7GizRola', quadroAula); }
  });

  // ---------------------------------------------------------------- BIBLIOTECA
  const bib = { x: -27, y: 1.4, z: -5 }; let psiuCd = 0, andandoBib = 0, pagT = 0, pag = null;
  reativo(dt => {
    psiuCd -= dt;
    if (salaId() === 'biblio') { andandoBib = P.noiseR > 0 ? andandoBib + dt : 0; }
    else andandoBib = 0;
    // qualquer ruído forte (corrida) ou andar sem cuidado por muito tempo é respondido 1 s depois por um coro de "psiu"
    if (salaId() === 'biblio' && psiuCd <= 0 && (P.noiseR >= 18 || andandoBib > 7)) {
      psiuCd = 14; andandoBib = 0;
      depois(1000, () => {
        for (let i = 0; i < 6; i++) { const a = rand(0, 6.28), r = rand(3, 7), p = { x: P.pos.x + Math.cos(a) * r, y: 1.3, z: P.pos.z + Math.sin(a) * r }; setTimeout(() => { if (ok()) { const f = sopro(p, 'highpass', 3600, 1.3, .35, .09, .02, .6); } }, i * 140); }
        leg('s7Psiu'); A.emitNoise(bib.x, bib.z, 4); // o Inspetor ouve o coro também
      });
    }
    // páginas virando que andam entre as estantes
    pagT -= dt;
    if (pag) { pag.t += dt; pag.x += pag.vx * dt; if (pag.t > pag.dur) pag = null; }
    if (pag && pagT <= 0) { pagT = rand(.25, .5); sopro({ x: pag.x, y: 1.3, z: pag.z }, 'highpass', 3000, .6, .3, .05, .05, .4); }
  });
  fonte(bib.x, bib.z, 15, 10, 20, () => { if (salaId() === 'biblio' && Math.random() < .5) return; pag = { x: -33, z: rand(-8, -2), vx: 2.2, t: 0, dur: 6 }; leg('s7Paginas', { x: -30, y: 1.3, z: pag.z }); }, null, 'paginas');
  fonte(bib.x, bib.z, 9, 6, 16, () => { const p = { x: bib.x + rand(-5, 5), y: 1.4, z: bib.z + rand(-3, 3) }; sopro(p, 'bandpass', rand(900, 1500), 3, .15, .035, .02, .4); if (Math.random() < .3) leg('s7Traca', p); }, null, 'traca');

  // ---------------------------------------------------------------- CORREDORES
  // túnel de vento: o assopro sobe de tom quando as portas das pontas estão abertas
  const tunel = (pos, a, b, nome) => fonte(pos.x, pos.z, 2.8, 1, 28, () => {
    const C = E.AC(); if (!C) return; let n = 0; for (const d of W.doors) if ((d.id === a || d.id === b) && Math.abs(d.ang || 0) > .5) n++;
    const f = 150 + n * 90; sopro(pos, 'bandpass', f, 6, 1.8, .04 + n * .02, .6, .4); if (n === 2 && Math.random() < .4) leg('s7Tunel');
  }, null, nome);
  tunel({ x: -20, y: 1.6, z: -12 }, 'hcw', 'biblio', 'tunel-oeste'); tunel({ x: 20, y: 1.6, z: -12 }, 'hce', 'maq', 'tunel-leste');
  // alguém te segue no mesmo ritmo: no corredor oeste, depois de uns 10 m, os passos voltam um instante depois; ao olhar, nada
  let seguiu = 0, seguiAvisou = -99;
  aoPasso(() => {
    if (salaId() !== 'cw') { seguiu = 0; return; } seguiu++;
    if (seguiu < 12 || P.crouch) return;
    depois(rand(380, 460), () => { try { A.SFX.passo(.1, 'ladrilho'); } catch (e) {} });
    if (A.perf() - seguiAvisou > 40) { seguiAvisou = A.perf(); leg('s7Seguem'); }
  });
  // tábuas soltas: o corredor tem três tábuas que rangem alto se você as pisa em pé (agachada ou devagar passa em silêncio)
  const tabuas = [[-12.5, -12.3], [-19, -11.6], [-28, -12.4]]; let tabCd = 0;
  reativo(dt => {
    tabCd -= dt; if (tabCd > 0 || salaId() !== 'cw' || P.crouch || P.devagar) return;
    for (const [tx, tz] of tabuas) if (Math.hypot(P.pos.x - tx, P.pos.z - tz) < .5) { tabCd = 5; const p = { x: tx, y: .05, z: tz }; A.SFX.rangido(tx, .1, tz, .6, 'sfx'); A.SFX.tabua(p, .9, 'madeira'); A.emitNoise(tx, tz, P.sprinting ? 9 : 4.5, true); leg('s7Tabua', p); break; }
  });
  // cano que acompanha o Inspetor do outro lado da parede: golpes metálicos em fila, como se arrastasse algo
  let canoT = 0;
  reativo(dt => {
    canoT -= dt; if (canoT > 0 || !mAtivo()) return;
    const st = M.state; if (st === 'caca' || st === 'bote' || st === 'agarra') return;
    const d = mDist(P.pos.x, P.pos.z), outra = mSala() !== salaId(); if (!outra || d > 20 || d < 3) return;
    canoT = rand(2.2, 3.6); const p = { x: M.pos.x, y: 2.4, z: M.pos.z };
    metal(p, .16, rand(700, 1300)); tom(p, 82, .1, .35, 'sine', .2); leg('s7Cano', p);
  });
  // interfone: o aviso de rotina muda de ala quando o Inspetor muda de ala; quem entende a linguagem do ding-dong ganha um radar
  const horn = { x: 0, y: 3, z: -8 }; let alaAnt = null, infCd = 0;
  const ala = () => { if (!mAtivo()) return null; const x = M.pos.x, z = M.pos.z; return z < -14 && Math.abs(x) < 6 ? 'fundos' : x < -6 ? 'oeste' : x > 6 ? 'leste' : 'centro'; };
  reativo(dt => {
    infCd -= dt; const a = ala();
    if (a && a !== alaAnt && alaAnt !== null && infCd <= 0 && S.chapter >= 1 && M.state !== 'caca') {
      infCd = 45;
      const seq = a === 'oeste' ? [880, 659] : a === 'leste' ? [659, 880] : a === 'fundos' ? [660, 520, 440] : [784, 784];
      seq.forEach((f, i) => depois(i * 520, () => { nota(horn, f, .22, 1.3, .5, 'amb'); nota(horn, f / 2, .1, 1.5, .5, 'amb'); }));
      depois(seq.length * 520 + 200, () => { silaba(horn, 160, 'a', .3, .1, .5); silaba(horn, 150, 'o', .5, .1, .5, E.AC().currentTime + .3); sopro(horn, 'bandpass', 1800, 1, .9, .05, .05, .2); });
      leg('s7Interfone', horn);
    }
    if (a) alaAnt = a;
  });
  // armários batem uma a uma na sua direção e param no armário ao lado, entreaberto: dentro, nada (uma vez por noite, no corredor)
  let armTocou = false;
  reativo(() => {
    if (armTocou || S.chapter < 1 || salaId() !== 'cw' || P.crouch) return; if (Math.random() > .0015) return;
    const ls = W.lockers.filter(l => l.tipo === 'armario' && dist(l.x, l.z) < 16 && dist(l.x, l.z) > 3).sort((a, b) => dist(b.x, b.z) - dist(a.x, a.z));
    if (ls.length < 2) return; armTocou = true;
    ls.forEach((l, i) => depois(i * 360, () => { const p = { x: l.x, y: 1.1, z: l.z }; sopro(p, 'lowpass', 500, 1, .1, .35, .002, .4); metal(p, .14, 700); if (i === 0) leg('s7Armarios', p); }));
  });
  // poças que crescem: onde pinga a goteira dos corredores, a poça aumenta ao longo da noite; pisar espirra e faz barulho
  const pocas = [{ x: 15, z: -12.4 }, { x: -20.5, z: -11.6 }]; let splashCd = 0;
  aoPasso(() => {
    if (splashCd > 0) return;
    for (const pc of pocas) {
      const raioP = .45 + clamp((S.tempo || 0) / 900, 0, 1) * .7; // 0,45 m no começo, ~1,15 m ao fim de 15 minutos
      if (Math.hypot(P.pos.x - pc.x, P.pos.z - pc.z) < raioP) { splashCd = .3; const p = { x: pc.x, y: .05, z: pc.z }; sopro(p, 'bandpass', 1600, .8, .2, .26, .004, .4, 'sfx'); if (!P.crouch) A.emitNoise(pc.x, pc.z, P.sprinting ? 9 : 5.5 * (1 + clamp((S.tempo || 0) / 900, 0, 1) * .4), true); leg('s7Poca', p); break; }
    }
  });
  reativo(dt => { splashCd -= dt; });
  // grade da escada e frestas da porta principal assoviam nas rajadas
  const grade = { x: -3.1, y: 1.2, z: -9.2 }, main = { x: 0, y: 1, z: -.4 };
  fonte(grade.x, grade.z, 6, 4, 22, () => { if (raio(A) < .12 && Math.random() > .35) return; A.SFX.rangido(grade.x, grade.y, grade.z, .3, 'amb'); leg('s7Grade', grade); }, null, 'grade');
  fonte(main.x, main.z, 3, 2, 26, () => { assovio(main, 760 + raio(A) * 500, .05 + raio(A) * .05, 1.5); if (Math.random() < .25) leg('s7Frestas', main); }, null, 'frestas');

  // ---------------------------------------------------------------- ENFERMARIA
  const frasc = { x: 33, y: 1.5, z: -5 }; let frCd = 0;
  reativo(dt => {
    frCd -= dt; if (frCd > 0 || !mAtivo()) return; const d = mDist(frasc.x, frasc.z);
    if (d < 10 && dist(frasc.x, frasc.z) < 22) { frCd = 1.4; vidrinho(frasc, Math.min(.3, (10 - d) / 26), 2 + (Math.random() * 3 | 0)); if (d < 6) leg('s7Frascos', frasc); }
  });
  const fluor = { x: 26, y: 2.8, z: -7 };
  fonte(fluor.x, fluor.z, 1, .2, 24, () => { if (!energia()) return; tom(fluor, 100, .018 * mult(), .5, 'sawtooth', .2); tom(fluor, 2010, .006 * mult(), .5, 'sine', .2); if (Math.random() < .25) clique(fluor, .05, 2600, .02); }, null, 'fluorescente');
  // monitor cardíaco: bipa na cadência do coração da Lia, um pouco atrasado; às vezes o ritmo não é o dela; com o Inspetor lá dentro vira linha contínua
  const mon = { x: 30, y: 1.2, z: -2 }; let monT = 0, monLinha = 0, monEstranho = 0;
  reativo(dt => {
    if (dist(mon.x, mon.z) > 26 || !energia()) { monLinha = 0; return; }
    const noInsp = mAtivo() && mSala() === 'enferm';
    if (noInsp) { if (!monLinha) { monLinha = 1; leg('s7MonitorLinha', mon); } }
    else monLinha = 0;
    monT -= dt; if (monT > 0) return;
    if (monLinha) { monT = .5; tom(mon, 1000, .05, .55, 'sine', .15); return; }
    const bpm = 60 + clamp(S.fear || 0, 0, 100) * .9; monT = 60 / bpm;
    // o ritmo "estranho": de vez em quando bipa fora do tempo, como se fosse de outra pessoa
    const fora = (monEstranho -= 1) <= 0 && Math.random() < .08; if (fora) monEstranho = 20;
    depois(fora ? rand(250, 450) : 180, () => { tom(mon, 1000, .07, .1, 'sine', .15); });
    if (Math.random() < .08) leg('s7Monitor', mon);
  });
  // maca que range sobre as rodinhas, sozinha
  fonte(24, -3, 38, 30, 20, () => { const p = { x: rand(21, 30), y: .3, z: rand(-8, -2) }; A.SFX.rangido(p.x, p.y, p.z, .22, 'amb'); depois(500, () => A.SFX.rangido(p.x + 1, p.y, p.z, .16, 'amb')); leg('s7Maca', p); }, () => salaId() !== 'enferm', 'maca');

  // ---------------------------------------------------------------- LAVANDERIA, BANHEIROS, CASA DE MÁQUINAS
  const lav = { x: 14, y: .8, z: -24 }; let lavFase = 0, lavOn = true;
  fonte(lav.x, lav.z, 1.1, .05, 26, () => {
    if (!lavOn) return; lavFase++; tom(lav, 44, .04 * mult(), 1, 'sine', .2);
    if (lavFase % 3 === 0) { clique(lav, .09, 1200, .03); metal(lav, .06, 900); } if (lavFase % 7 === 0) leg('s7Lavadora', lav);
  }, null, 'lavadora');
  reativo(() => { const nela = salaId() === 'lavand'; if (nela) lavOn = false; else if (!lavOn && dist(lav.x, lav.z) > 14) lavOn = true; }); // o tambor desacelera e para quando você entra
  const banh = { x: 20, y: 1.2, z: -20 };
  fonte(banh.x, banh.z, 7, 5, 22, () => {
    const C = E.AC(); if (!C) return; const t = C.currentTime; sopro(banh, 'bandpass', 500, 2, .7, .1, .25, .5);
    if (Math.random() < .5) { const g = E.saida(banh, .4), o = C.createOscillator(); o.type = 'sine'; o.frequency.setValueAtTime(70, t + .5); o.frequency.exponentialRampToValueAtTime(40, t + .9); o.connect(g); o.onended = () => o.disconnect(); au.env(g, t + .5, .02, .18, .4); o.start(t + .5); o.stop(t + 1); }
    leg('s7Banheiro', banh);
  }, null, 'cano-banheiro');
  fonte(banh.x, banh.z, 55, 40, 24, () => { [0, 480, 960].forEach(ms => depois(ms, () => metal({ x: banh.x + rand(-2, 2), y: 1.6, z: banh.z + rand(-3, 3) }, .22, rand(600, 900)))); leg('s7Tres3', banh); }, () => salaId() !== 'banh', 'tres-batidas');

  // ---------------------------------------------------------------- COPA E PÁTIO (clima e chuva)
  const janela = { x: 6, y: 1.5, z: -23 };
  fonte(janela.x, janela.z, 2.4, 1.2, 40, () => { const r = Math.min(1, raio(A) * 2 + .4); assovio(janela, 820 + r * 500, .05 + r * .08, 1.4); if (Math.random() < .3) leg('s7Assovio', janela); }, null, 'janela-vento');
  fonte(janela.x, janela.z, 1.5, .3, 26, () => { sopro(janela, 'highpass', 2600, .8, .9, .05, .15, .35); }, null, 'janela-chuva');
  const bal = { x: 6.5, y: 2, z: 6 };
  fonte(bal.x, bal.z, 3.4, 1.4, 34, () => { if (Math.random() < .2) return; A.SFX.rangido(bal.x, bal.y, bal.z, .32, 'amb'); leg('s7Balanco', bal); }, null, 'balanco');
  fonte(0, -7, 1.5, .8, 40, () => { // mariposas nas lâmpadas acesas
    try { const vivas = W.lampadas.filter(L => L.ligada && L.luz.intensity > 1 && dist(L.x, L.z) < 12); if (!vivas.length) return; const L = pick(vivas), p = { x: L.x, y: 2.8, z: L.z }; clique(p, .05, rand(3200, 4600), .015); if (Math.random() < .2) leg('s7Mariposa', p); } catch (e) {}
  }, null, 'mariposas');
  fonte(0, 0, 70, 50, 50, () => { if (!(P.room && P.room.fora)) return; A.SFX.rangido(P.pos.x + rand(-20, 20), 3, P.pos.z + rand(8, 22), .25, 'amb'); tom({ x: P.pos.x + rand(-26, 26), y: 3, z: P.pos.z + rand(-26, -14) }, 330, .05, 3, 'sine', .8); leg('s7Uivo'); }, null, 'uivo');
  fonte(0, 8, 40, 30, 22, () => { const p = { x: rand(-12, 12), y: 4, z: rand(2, 14) }; tom(p, 520, .08, .35, 'sine', .5); depois(520, () => tom(p, 470, .08, .5, 'sine', .5)); leg('s7Coruja', p); }, () => !!(P.room && P.room.fora), 'coruja');
  // rajadas batem portas soltas ao longe (o Inspetor também ouve)
  fonte(0, 0, 8, 6, 60, () => {
    const forte = raio(A) > .25 || Math.random() < .4; if (!forte) return;
    const ps = W.doors.filter(d => Math.abs(d.ang || 0) < .1 && dist(d.x, d.z) > 7 && dist(d.x, d.z) < 30);
    if (ps.length && Math.random() < .5) { const d = pick(ps); A.SFX.rangido(d.x, 1.4, d.z, .4, 'amb'); depois(500, () => { A.SFX.pancada(d.x, d.z); A.emitNoise(d.x, d.z, 6); leg('s7PortaBate', { x: d.x, y: 1.4, z: d.z }); }); }
    else { const p = { x: P.pos.x + rand(-14, 14), y: 1.6, z: P.pos.z + rand(-14, 14) }; A.SFX.rangido(p.x, 1.6, p.z, .3, 'amb'); leg('s7Rajada', p); }
  }, null, 'rajada-portas');
  // coro abafado atrás da parede: cessa quando você chega à sala
  const coro = { x: -33, y: 1.5, z: -5 };
  fonte(coro.x, coro.z, 22, 14, 30, () => {
    if (salaId() === 'biblio') return; const C = E.AC(); if (!C) return; const t = C.currentTime;
    for (const f of [90, 135, 180]) { const g = E.saida(coro, .6), o = C.createOscillator(); o.type = 'sawtooth'; o.frequency.value = f; const lp = C.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 380; o.connect(lp); lp.connect(g); o.onended = () => o.disconnect(); au.env(g, t, 1.2, .045 * mult(), 3.4); o.start(t); o.stop(t + 5); }
    leg('s7Coro', coro);
  }, null, 'coro');
  // sino distante: a cada quarto de hora do relógio real, bem fraco sob a chuva
  let quarto = -1;
  reativo(() => { const q = Math.floor(new Date().getMinutes() / 15); if (quarto !== q) { if (quarto !== -1) { try { A.SFX.sinoLonge(); } catch (e) {} leg('s7Sino'); } quarto = q; } });

  // ---------------------------------------------------------------- tubos de latão (rede de escuta do diretor)
  const tubos = [
    montarTubo(E, { id: 1, x: -5.88, y: 1.35, z: -6.5, ry: Math.PI / 2, px: -15, pz: -20 }),
    montarTubo(E, { id: 2, x: -33.88, y: 1.35, z: -12, ry: Math.PI / 2, px: 28, pz: -5 }),
    montarTubo(E, { id: 3, x: 33.88, y: 1.35, z: -12, ry: -Math.PI / 2, px: -29, pz: -5 })
  ];

  return {
    entrar() {},
    entrouSala() {},
    _tubos: tubos
  };
}

// =====================================================================
// DORMITÓRIOS (andar de cima)
// =====================================================================
export function somSuperior(A, S, ctx = {}) {
  const E = motor(A, S);
  const { fonte, reativo, leg, tom, sopro, clique, nota, pingo, assovio, metal, silaba, rand, pick, clamp, dist, mAtivo, mDist, mSala, salaId, mult, porta, aberta, depois, au, ok, aoPasso } = E;
  const P = A.P, M = A.M, W = A.W;
  const seed = hash((S.semente || 'SEMCOD') + '|som7s');
  const dorms = [{ x: -8, z: -8 }, { x: -8, z: -20 }, { x: -8, z: -42 }, { x: 8, z: -18 }, { x: 8, z: -44 }];
  const corr = { x: 0, z: -30 };

  // murmúrio de multidão subliminar nos corredores: o passado lotado; cai quando a lanterna aponta
  fonte(corr.x, corr.z, 2.4, 1.4, 60, () => {
    const C = E.AC(); if (!C || mult() < .4) return; const foco = S.flashOn ? .35 : 1, t = C.currentTime;
    for (const f of [120, 180, 240]) { const g = E.saida({ x: P.pos.x + rand(-3, 3), y: 1.3, z: P.pos.z + rand(-4, -1) }, .55), o = C.createOscillator(); o.type = 'sawtooth'; o.frequency.value = f + rand(-4, 4); const lp = C.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 500; o.connect(lp); lp.connect(g); o.onended = () => o.disconnect(); au.env(g, t, 1, .018 * foco * mult(), 2.2); o.start(t); o.stop(t + 3.4); }
    if (foco > .9 && Math.random() < .2) leg('s7Murmurio');
  }, null, 'multidao');
  // parlenda: uma cantiga de roda sussurrada à deriva que para seco quando você olha na direção dela
  let parl = null;
  fonte(corr.x, corr.z, 26, 18, 50, () => {
    const salas = dorms.filter(d => dist(d.x, d.z) < 30 && dist(d.x, d.z) > 6); if (!salas.length) return; const d = pick(salas);
    parl = { x: d.x, z: d.z, t: 0, dur: 5.5 }; const t0 = E.AC().currentTime, N = [330, 392, 330, 262, 294, 330], V = ['a', 'o', 'a', 'e', 'i', 'a'];
    N.forEach((f, i) => silaba({ x: d.x, y: 1.2, z: d.z }, f, V[i], .55, .1, .6, t0 + i * .85)); leg('s7Parlenda', { x: d.x, y: 1.2, z: d.z });
  }, null, 'parlenda');
  reativo(dt => {
    if (!parl) return; parl.t += dt;
    try { const d = Math.atan2(parl.x - P.pos.x, -(parl.z - P.pos.z)), yaw = ((P.yaw % 6.283) + 6.283) % 6.283, al = ((d % 6.283) + 6.283) % 6.283; let dif = Math.abs(yaw - al); if (dif > Math.PI) dif = 6.283 - dif; if (dif < .5 && E.AC()) { parl = null; } } catch (e) {}
    if (parl && parl.t > parl.dur) parl = null;
  });

  // doze respirações: as camas respiram juntas, em coro lento; uma delas respira fora do compasso (cama muda por noite) e a Lia reconhece
  const camas = W.lockers.filter(l => l.tipo === 'cama'), idxErrada = camas.length ? seed % camas.length : -1;
  let respT = 0, respFase = 0, paradaT = 0, pertoErrada = 0;
  reativo(dt => {
    respT -= dt; if (!camas.length) return;
    const anda = P.noiseR > 0, parouLia = !anda; paradaT = parouLia ? paradaT + dt : 0;
    if (respT > 0) return; const C = E.AC(); if (!C) return;
    // ao parar, o coro para junto: o prédio inteiro te observa
    if (paradaT > 2.5 && respFase % 2 === 0) { respT = .5; return; }
    const ciclo = 4.2; respT = ciclo; respFase++; let ouviu = false;
    camas.forEach((c, i) => {
      if (dist(c.x, c.z) > (i === idxErrada ? 16 : 11)) return; const errada = i === idxErrada, atraso = errada ? .9 : rand(0, .12), p = { x: c.x, y: .6, z: c.z };
      depois(atraso * 1000, () => sopro(p, 'bandpass', errada ? 340 : 520, 1.4, errada ? 2.2 : 1.5, (errada ? .06 : .04) * mult(), .8, .35)); ouviu = true;
    });
    if (ouviu && respFase % 6 === 1) leg('s7Respira');
  });
  reativo(dt => { // quem para ao lado da cama que respira fora do compasso ganha a pista, uma vez por noite
    if (idxErrada < 0 || E.flag('cama')) return; const c = camas[idxErrada]; if (!c) return;
    if (dist(c.x, c.z) < 2.4 && !P.sprinting && P.noiseR === 0) { pertoErrada += dt; if (pertoErrada > 3) { E.marca('cama'); leg('s7RespiraErrada', { x: c.x, y: .6, z: c.z }); A.sub('lia', 'Essa cama respira fora da hora. Ninguém aqui dorme há quarenta e cinco anos.'); } } else pertoErrada = 0;
  });
  // um colchão range sozinho quando você passa perto de uma cama
  let colchCd = 0;
  reativo(dt => {
    colchCd -= dt; if (colchCd > 0 || P.noiseR === 0) return;
    for (const c of camas) if (dist(c.x, c.z) < 1.6 && Math.random() < dt * .6) { colchCd = 16; const p = { x: c.x, y: .5, z: c.z }; A.SFX.rangido(c.x, .5, c.z, .35, 'amb'); depois(400, () => A.SFX.rangido(c.x, .5, c.z, .25, 'amb')); leg('s7Colchao', p); break; }
  });
  // suspiro de criança dentro do rangido da madeira
  fonte(corr.x, corr.z, 9, 7, 40, () => {
    const d = pick(dorms); if (dist(d.x, d.z) > 20) return; A.SFX.rangido(d.x, 2.6, d.z, .28, 'amb');
    if (Math.random() < .5) depois(150, () => { sopro({ x: d.x, y: 1.2, z: d.z }, 'bandpass', 900, 3, .5, .04, .2, .5); leg('s7Suspiro', { x: d.x, y: 1.2, z: d.z }); });
  }, null, 'suspiro');
  // tosse abafada de criança atrás da porta de um dormitório
  fonte(corr.x, corr.z, 40, 30, 30, () => {
    const d = pick(dorms); if (dist(d.x, d.z) > 22 || salaId() === 'corr' && dist(d.x, d.z) < 4) return; const p = { x: d.x, y: 1, z: d.z };
    [0, 190, 420].forEach(ms => depois(ms, () => { sopro(p, 'bandpass', 600, 2, .12, .12, .005, .4); silaba(p, 230, 'a', .1, .1, .4); })); leg('s7Tosse', p);
  }, null, 'tosse');

  // espelho do banheiro: com a Ana em cena, emite um subgrave que treme
  const banhS = { x: -8, y: 1.3, z: -31 }; let espCd = 0;
  reativo(dt => {
    espCd -= dt; if (espCd > 0) return;
    const ana = !!(A.ANA && A.ANA.ativa); if (ana && dist(banhS.x, banhS.z) < 16 && Math.random() < dt * .3) {
      espCd = 8; const C = E.AC(); if (!C) return; const t = C.currentTime, g = E.saida(banhS, .5), o = C.createOscillator(); o.type = 'sine'; o.frequency.value = 38; const tr = C.createOscillator(); tr.frequency.value = 6; const tg = C.createGain(); tg.gain.value = 4; tr.connect(tg); tg.connect(o.frequency); o.connect(g);
      au.env(g, t, .4, .14, 1.6); o.start(t); o.stop(t + 2.2); tr.start(t); tr.stop(t + 2.2); leg('s7Espelho', banhS);
    }
  });
  fonte(banhS.x, banhS.z, 2.8, 1.8, 20, () => pingo(banhS, .2), () => salaId() !== 'banhS', 'pia-sup');

  // vento e chuva: veneziana solta, janela quebrada, telhado, poça
  const ven = { x: 11, y: 1.4, z: -18 };
  fonte(ven.x, ven.z, 3, 2, 30, () => {
    if (!((raio(A) > .2) || Math.random() < .5)) return; sopro(ven, 'lowpass', 500, 1, .08, .3, .002, .4); depois(180, () => sopro(ven, 'bandpass', 1400, 3, .06, .15, .002, .4)); leg('s7Veneziana', ven);
  }, null, 'veneziana');
  let venCd = 0; // a veneziana delata a aproximação do Inspetor
  reativo(dt => {
    venCd -= dt; if (venCd > 0 || !mAtivo()) return;
    if (mDist(ven.x, ven.z) < 10 && dist(ven.x, ven.z) < 22) { venCd = 3; [0, 220, 440].forEach(ms => depois(ms, () => sopro(ven, 'lowpass', 520, 1, .07, .25, .002, .4))); leg('s7Veneziana', ven); }
  });
  const jan = { x: 11, y: 1.6, z: -44 };
  fonte(jan.x, jan.z, 2.6, 1.3, 40, () => { const r = Math.min(1, raio(A) * 2 + .3); assovio(jan, 900 + r * 600, .05 + r * .07, 1.3); if (Math.random() < .25) leg('s7Assovio', jan); }, null, 'jan-vento');
  fonte(jan.x, jan.z, 1.5, .3, 24, () => sopro(jan, 'highpass', 2800, .8, .9, .045, .15, .35), null, 'jan-chuva');
  fonte(jan.x, jan.z, 7, 5, 26, () => { if (raio(A) < .2 && Math.random() > .4) return; sopro(jan, 'bandpass', 1800, 2, .25, .12, .01, .4); assovio(jan, 1400, .06, .6); leg('s7Rajada', jan); }, null, 'jan-rajada');
  // chuva no telhado: o andar de cima fica sob as telhas, o martelar é mais grave e mais perto nos dormitórios dos fundos
  fonte(corr.x, corr.z, .9, .2, 70, () => { const f = (P.pos.z < -36 ? 1400 : 1900); sopro({ x: P.pos.x, y: 4.2, z: P.pos.z }, 'bandpass', f, .7, .9, .03 + clamp(raio(A), 0, 1) * .02, .25, .4); if (Math.random() < .04) leg('s7Telhado'); }, null, 'telhado');
  const gota = { x: -8, y: .1, z: -42 };
  fonte(gota.x, gota.z, 1.9, 1, 22, () => { if (raio(A) < .08 && Math.random() > .5) return; pingo(gota, .2); }, null, 'goteira-c');
  let splashCd = 0;
  aoPasso(() => { if (splashCd > 0) return; if (Math.hypot(P.pos.x - gota.x, P.pos.z - gota.z) < 1.2) { splashCd = .3; const p = { x: gota.x, y: .05, z: gota.z }; sopro(p, 'bandpass', 1600, .8, .2, .22, .004, .4, 'sfx'); if (!P.crouch) A.emitNoise(gota.x, gota.z, 4.5, true); leg('s7Poca', p); } });
  reativo(dt => { splashCd -= dt; });
  // corredor longo sopra como túnel de vento quando as pontas estão abertas
  fonte(corr.x, corr.z, 2.8, 1.2, 40, () => {
    let n = 0; for (const d of W.doors) if ((d.id === 'pat' || d.id === 'so') && Math.abs(d.ang || 0) > .5) n++; if (aberta(porta('so'))) n = Math.max(n, 1);
    const f = 150 + n * 90; sopro({ x: 0, y: 1.6, z: -30 }, 'bandpass', f, 6, 1.8, .035 + n * .02, .6, .4); if (n >= 1 && Math.random() < .3) leg('s7Tunel');
  }, null, 'tunel');

  // objetos que sussurram: harmônio-fantasma, caixinha antes de montar, roupa, dutos do monta-cargas
  fonte(9, -31, 18, 12, 30, () => {
    const C = E.AC(); if (!C) return; const t = C.currentTime, pos = { x: 9, y: 1.5, z: -31 };
    for (const r of [1, 1.414, 1.5]) { const g = E.saida(pos, .6), o = C.createOscillator(); o.type = 'sine'; o.frequency.value = 110 * r + rand(-1.5, 1.5); o.connect(g); o.onended = () => o.disconnect(); au.env(g, t, 1.5, .035, 3.5); o.start(t); o.stop(t + 5.2); }
    leg('s7Harmonio', pos);
  }, null, 'harmonio');
  fonte(9, -31, 28, 18, 26, () => { if (S.done.caixinha) return; const pos = { x: 9, y: .9, z: -31 }; [523, 659, 784, 659].forEach((f, i) => depois(i * 350, () => nota(pos, f, .05, .5, .5))); leg('s7Caixinha', pos); }, null, 'caixinha');
  fonte(8, -7, 4.5, 3, 18, () => sopro({ x: 8, y: 1.3, z: -7 }, 'highpass', 3000, .6, .6, .04, .1, .3), null, 'roupa');
  fonte(11.6, -56, 5, 4, 24, () => { metal({ x: 11.6, y: 1.5, z: -56 }, .12, rand(1200, 2000)); if (Math.random() < .4) assovio({ x: 11.6, y: 1.5, z: -56 }, 600, .05, .5); }, null, 'dutos-montacargas');
  fonte(9, -54, 40, 30, 22, () => { if (salaId() === 'sotao') return; [0, 700, 1500].forEach(ms => depois(ms, () => sopro({ x: 8 + rand(-1, 1), y: 3, z: -44 + rand(-2, 2) }, 'lowpass', 320, 1, .25, .12, .01, .4))); leg('s7Forro', { x: 8, y: 3, z: -44 }); }, null, 'forro');

  // cadeira de balanço no depósito: range num ritmo que não é o do vento, para quando você entra e recomeça mais rápido
  const cadeira = { x: 5, y: .6, z: -55 }; let cadVel = 1, cadDentroAnt = false;
  const cadF = fonte(cadeira.x, cadeira.z, 1.7, .1, 22, () => {
    if (salaId() === 'sotao') return; A.SFX.rangido(cadeira.x, cadeira.y, cadeira.z, .22, 'amb'); if (Math.random() < .08) leg('s7Cadeirao', cadeira);
  }, null, 'cadeira-balanco');
  reativo(() => {
    const dentro = salaId() === 'sotao';
    if (cadDentroAnt && !dentro) { cadVel *= .78; cadF.every = Math.max(.7, 1.7 * cadVel); }
    cadDentroAnt = dentro;
  });

  // morcegos no depósito: fazer barulho demais lá dentro dispara asas e guinchos que descem do teto (o Inspetor ouve)
  const sot = { x: 8, y: 2.6, z: -54 }; let morcCd = 0, barulho = 0;
  reativo(dt => {
    morcCd -= dt; if (morcCd > 0) return;
    if (salaId() === 'sotao' && P.noiseR >= 18) barulho += dt * 2; else barulho = Math.max(0, barulho - dt);
    if (barulho > 2.2) {
      morcCd = 12; barulho = 0; const C = E.AC(); if (!C) return; const t0 = C.currentTime;
      for (let i = 0; i < 12; i++) { const t = t0 + i * rand(.02, .1), g = E.saida({ x: sot.x + rand(-2, 2), y: 3 - i * .1, z: sot.z + rand(-2, 2) }, .3), o = C.createOscillator(); o.type = 'sine'; o.frequency.setValueAtTime(rand(3200, 4800), t); o.frequency.linearRampToValueAtTime(rand(2000, 3000), t + .08); o.connect(g); o.onended = () => o.disconnect(); au.env(g, t, .004, .05, .08); o.start(t); o.stop(t + .15); }
      A.emitNoise(sot.x, sot.z, 8); leg('s7Morcegos', sot);
    }
  });

  // escada do patamar: cada degrau tem uma nota (menor); correr vira cascata de estalos que o Inspetor ouve; um degrau nunca soa
  const ESC = [220, 261.6, 293.7, 329.6, 349.2, 392]; let degrauAnt = -1;
  reativo(() => {
    const z = P.pos.z; if (Math.abs(P.pos.x) > 1.5 || z < 3.9 || z > 5.7) { degrauAnt = -1; return; }
    const i = clamp(Math.floor((z - 4) / .3), 0, 5); if (i === degrauAnt) return; degrauAnt = i;
    if (i === 3) return; // onde algo se esconde embaixo: o degrau mudo
    if (P.sprinting) { nota({ x: 0, y: .1, z: 4.5 }, ESC[i] * 2, .12, .15, .3, 'sfx'); metal({ x: 0, y: .1, z: z }, .2, 500); A.emitNoise(0, 4.5, 7, true); leg('s7Escada', { x: 0, y: .1, z: 4.5 }); }
    else nota({ x: 0, y: .1, z: 4.5 }, ESC[i], .07, 1.6, .5, 'amb');
  });
  // um degrau range logo atrás de você, um instante depois de você subir
  let degCd = 0, zAnt = 99;
  reativo(dt => {
    degCd -= dt; const sobe = Math.abs(P.pos.x) < 2 && P.pos.z > 1 && P.pos.z < 6 && P.pos.z < zAnt - .3; zAnt = P.pos.z;
    if (sobe && degCd <= 0 && Math.random() < .35) { degCd = 14; depois(320, () => { const z = Math.min(6, P.pos.z + rand(.8, 1.6)); A.SFX.rangido(P.pos.x + rand(-.4, .4), .15, z, .5, 'ent'); leg('s7Degrau', { x: 0, y: .15, z }); }); }
  });
  // assoalho-piano: sete tábuas do corredor tocam notas ao ser pisadas; na ordem do hino a escala se completa e a Lia reconhece
  const HINO = [293.7, 329.6, 349.2, 392, 349.2, 329.6, 293.7], TAB = [-8, -13, -18, -23, -28, -33, -38]; let proxima = 0, ultimaNota = -1, hinoCd = 0;
  aoPasso(() => {
    if (salaId() !== 'corr' || P.sprinting) return;
    const k = TAB.findIndex(tz => Math.abs(P.pos.z - tz) < .5 && Math.abs(P.pos.x) < 2); if (k < 0 || k === ultimaNota) return; ultimaNota = k;
    nota({ x: P.pos.x, y: .1, z: TAB[k] }, HINO[k], .1, 1.4, .5, 'amb'); leg('s7Assoalho', { x: P.pos.x, y: .1, z: TAB[k] });
    if (k === proxima) { proxima++; if (proxima >= 7 && !E.flag('hino')) { E.marca('hino'); leg('s7Hino'); [0, 1, 2].forEach(i => depois(i * 90, () => nota({ x: P.pos.x, y: .1, z: P.pos.z }, [293.7, 369.99, 440][i], .09, 3, .7, 'amb'))); depois(1200, () => A.sub('lia', 'O primeiro verso do hino. As tábuas sabem a música.')); } } else proxima = k === 0 ? 1 : 0;
  });
  // piso do corredor tem o seu rangido próprio quando o Inspetor ronda o mesmo andar: um "cano" metálico também denuncia a ala
  let canoT = 0;
  reativo(dt => {
    canoT -= dt; if (canoT > 0 || !mAtivo()) return;
    const st = M.state; if (st === 'caca' || st === 'bote' || st === 'agarra') return;
    const d = mDist(P.pos.x, P.pos.z), outra = mSala() !== salaId(); if (!outra || d > 20 || d < 3) return;
    canoT = rand(2.2, 3.6); const p = { x: M.pos.x, y: 2.4, z: M.pos.z }; metal(p, .15, rand(700, 1300)); tom(p, 82, .1, .35, 'sine', .2); leg('s7Cano', p);
  });
  // o monta-cargas geme antes de partir: cabos tensionando, correntes batendo e a gaiola balançando até o baque
  try {
    const it = W.inter.find(i => i.obj && i.obj.position && Math.abs(i.obj.position.x - 11.6) < .02 && Math.abs(i.obj.position.z + 56.2) < .02);
    if (it && it.act) {
      const orig = it.act;
      it.act = function (...a) {
        if (S.inv.chaves.porao && E.ok()) {
          try {
            const C = E.AC(), t = C.currentTime, pos = { x: 11.6, y: 1.5, z: -56 };
            const g = E.saida(null, .3, 'amb'), o = C.createOscillator(); o.type = 'sawtooth'; o.frequency.setValueAtTime(70, t); o.frequency.exponentialRampToValueAtTime(190, t + 1.4); const lp = C.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 520; o.connect(lp); lp.connect(g); au.env(g, t, .6, .16, 1.4); o.start(t); o.stop(t + 2.1);
            for (let i = 0; i < 6; i++) setTimeout(() => { try { if (E.AC()) metal(null, .14, rand(500, 1100)); } catch (e) {} }, 200 + i * 230);
            setTimeout(() => { try { if (E.AC()) { E.sopro(null, 'lowpass', 120, 1, .6, .4, .005, .3); } } catch (e) {} }, 1500);
            leg('s7Cabo', pos);
          } catch (e) {}
        }
        return orig.apply(this, a);
      };
    }
  } catch (e) {}

  return { entrar() {}, entrouSala() {} };
}
