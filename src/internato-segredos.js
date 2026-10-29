// INTERNATO — SEGREDOS (Lote 4): salas escondidas, jogos de criança, códigos e recompensas para quem explora.
// segredosTerreo() (este arquivo) e segredosSuperior() (internato-segredos-sup.js) são chamados por terreo() e
// superior() em mapas.js, depois do polimento, e devolvem ganchos { sync, entrar } que juntar() encadeia.
// Contador próprio ("Achado escondido N/M", em S.flags.sg4) e a foto da turma no corredor oeste, que lembra
// entre noites (localStorage 'hora-silencio-l4seg'). Tudo procedural: canvas e som com o AudioContext do motor.

export const SG4_T = ['velha', 'relogio', 'foto', 'apagao', 'cabine', 'carteira', 'cubiculo', 'cola', 'vaso', 'achados', 'lampada', 'bebedouro', 'pedra', 'sopa', 'doce', 'calendario', 'passa', 'poco'];
export const SG4_S = ['estrelas', 'dormF', 'gude', 'descargas', 'bonecas', 'forro', 'calha', 'cela', 'andar0', 'luzes'];
export const SG4_TOTAL = SG4_T.length + SG4_S.length;
const LS = 'hora-silencio-l4seg';
// a tecla V (responder) vista por todos os segredos, sem um ouvinte novo a cada mapa
if (typeof window !== 'undefined' && !window.__sg4Vinst) { window.__sg4Vinst = true; window.addEventListener('keydown', e => { if (e.code === 'KeyV') window.__sg4V = performance.now(); }); }
export const lsLer = () => { try { return JSON.parse(localStorage.getItem(LS) || '{}') || {}; } catch (e) { return {}; } };
export const lsGravar = o => { try { localStorage.setItem(LS, JSON.stringify(o)); } catch (e) {} };
export function nomeJogador() {
  try { const r = localStorage.getItem('hora-silencio-nome'); if (!r) return ''; let v = r; try { v = JSON.parse(r); } catch (e) {} return typeof v === 'string' ? v.trim().slice(0, 16) : ''; } catch (e) { return ''; }
}

// ---------- texto novo: notas secretas (só aparecem no diário depois de achadas) e conquistas secretas
(function (R) {
  if (!R) return;
  const NOTAS = [
    { id: 'sg4_relogio', secreta: true, titulo: 'Bilhete dentro do pêndulo', texto: 'Quem acertou as três horas leu o livro inteiro. Então você sabe.\n21h04 o Tomé. 21h31 a Ana. 21h50 eu.\nA medalha é do São Lázaro. Ela esquenta quando a fila vem. Foi assim que eu sempre soube a hora de deitar.\n— D.' },
    { id: 'sg4_apagao', secreta: true, titulo: 'O Escuro Era Nosso', texto: 'Quando a luz caía, a gente saía. Ele ouvia tudo, mas no escuro ele também tinha medo do barulho do gerador voltando.\nPintei as mãozinhas com a tinta do relógio do refeitório. Só aparecem quando tudo apaga.\nSe você achou a gaveta, você também é do escuro.\n— D., T., A.' },
    { id: 'sg4_cabine', secreta: true, titulo: 'Clube dos Que Não Dormem', texto: 'SÓCIOS: Davi M. (presidente), Tomé R. (tesoureiro, guarda as velas), Ana L. P. (conta as batidas).\nREGRA ÚNICA: quem bate nove vezes é do clube.\nQuem bate oito é o Inspetor tentando enganar.\n(embaixo, letra de outra criança) entrou mais uma. não sei o nome.' },
    { id: 'sg4_lampada', secreta: true, titulo: 'Envelope de fotos 3x4', texto: '(três fotos 3x4 de documento, presas com clipe enferrujado)\nDAVI M. — sorriso torto, um dente faltando.\nANA L. P. — tranças, olhando para fora da foto.\nTOMÉ R. — o cabelo molhado penteado para trás.\n(no envelope, carimbo) RETIDOS PELA DIREÇÃO — NÃO ENVIAR ÀS FAMÍLIAS. 14/03/79.' },
    { id: 'sg4_estrelas', secreta: true, titulo: 'Estrelas do Davi', texto: 'Colei essas estrelas pra Lia quando ela veio dormir aqui na visita, porque ela tinha medo do escuro.\nEla nunca viu. Foi embora antes de apagar a luz.\nSe for você, Lia: o segundo número do cofre é {d2}. Não conta pros outros que eu disse.\n— Davi' },
    { id: 'sg4_gude', secreta: true, titulo: 'Álbum do Clube', texto: 'ÁLBUM DE FIGURINHAS DO SÃO LÁZARO — feito à mão.\n37 figurinhas desenhadas a lápis, uma por aluno, com nome e apelido.\nTrês espaços em branco, com a cola ainda brilhando: DAVI, ANA, TOMÉ.\nNa última página, colada torta, uma 38ª figurinha: uma menina de nove anos, de capa de chuva.\nEmbaixo: "a irmã que vem".' },
    { id: 'sg4_forro', secreta: true, titulo: 'O Forro', texto: 'ESCONDERIJO DOS TRÊS — PROIBIDO ADULTO.\nPlacar da semana: DAVI 12 x TOMÉ 9 x ANA 30 (ela roubou).\nO Inspetor não sobe aqui. A escada range e ele odeia barulho que não é dele.\nSe for descer, desce de uma vez. Ele vem ver.' },
    { id: 'sg4_andar0', secreta: true, titulo: 'Guardanapo da copa de 1979', texto: '(um guardanapo de pano, bordado à mão: LIA)\nDentro, embrulhado, um dente de leite.\n(a lápis, letra do Davi) o primeiro que caiu desde que você foi embora. guardei pra te mostrar no natal.\nmesa 3, lugar 8. a Dona Cida guarda o seu lugar todo dia.' },
    { id: 'sg4_luzes', secreta: true, titulo: 'Caixa de memória do diretor', texto: 'APARELHO PARA EDUCAR A MEMÓRIA — A. Teixeira, 1975.\nQuem errar a sequência: uma noite no armário por cor errada.\n(riscado por dentro do fundo falso, com prego)\nas válvulas lá embaixo: {v}. a Irmã cantava assim pra gente lembrar.\n— T.' }
  ];
  if (R.notas) for (const n of NOTAS) if (!R.notas.some(x => x.id === n.id)) R.notas.push(n);
  const CONQ = [
    { id: 'l4_velha', nome: 'Ganhei do Fantasma', desc: 'Vença o jogo da velha da lousa.', secreta: true },
    { id: 'l4_relogio', nome: 'Hora Certa', desc: 'Acerte o relógio de pêndulo nas três horas do livro.', secreta: true },
    { id: 'l4_foto', nome: 'Fotografada', desc: 'Repare em quem está no fundo da foto da turma.', secreta: true },
    { id: 'l4_apagao', nome: 'Apagão', desc: 'Apague o prédio de propósito e siga as mãozinhas.', secreta: true },
    { id: 'l4_cabine', nome: 'Nove Batidas', desc: 'Entre para o clube da cabine do banheiro.', secreta: true },
    { id: 'l4_ausente', nome: 'Ausente', desc: 'Não responda à chamada.', secreta: true },
    { id: 'l4_cubiculo', nome: 'Achados do Inspetor', desc: 'Abra a portinhola embaixo da escada.', secreta: true },
    { id: 'l4_vaso', nome: 'Visita Educada', desc: 'Entre pela porta da frente sem arrombar nada.', secreta: true },
    { id: 'l4_pedra', nome: 'Pedra Fundamental', desc: 'Leia quem construiu o internato.', secreta: true },
    { id: 'l4_doce', nome: 'Não Mexe', desc: 'Mexa no que o Davi escondeu.', secreta: true },
    { id: 'l4_dia', nome: 'Dia Seguinte', desc: 'Risque um dia que nunca veio.', secreta: true },
    { id: 'l4_lanche', nome: 'Hora do Lanche', desc: 'Troque alguma coisa pelo passa-pratos.', secreta: true },
    { id: 'l4_desejo', nome: 'Desejo', desc: 'Jogue alguma coisa no poço e espere.', secreta: true },
    { id: 'l4_ceu', nome: 'Céu de Papel', desc: 'Veja as estrelas do Dormitório B no escuro.', secreta: true },
    { id: 'l4_vaga', nome: 'A Vaga Era Minha', desc: 'Durma no dormitório que não existe.', secreta: true },
    { id: 'l4_descarga', nome: 'Mexeu, Pagou', desc: 'Puxe a corrente errada.', secreta: true },
    { id: 'l4_forro', nome: 'O Forro', desc: 'Suba onde adulto não sobe.', secreta: true },
    { id: 'l4_cela', nome: 'Não Ligue de Novo', desc: 'Pare na segunda vez.', secreta: true },
    { id: 'l4_andar0', nome: 'Andar Zero', desc: 'Pare o monta-cargas num andar que não existe.', secreta: true },
    { id: 'l4_luzes', nome: 'Boa Memória', desc: 'Vença a caixa de luzes do diretor.', secreta: true },
    { id: 'l4_tudo', nome: 'Ninguém Esconde Nada', desc: 'Ache todos os segredos escondidos do internato.', secreta: true }
  ];
  if (R.conquistas) for (const c of CONQ) if (!R.conquistas.some(x => x.id === c.id)) R.conquistas.push(c);
})(typeof window !== 'undefined' ? window.ROTEIRO : null);

// ---------- utilidades
export function base(A, S, nomeMod) {
  const { THREE } = A;
  const agenda = [];
  const depois = (t, f) => agenda.push({ t, f });
  let avisou = false;
  const tick = f => A.W.tick.push(dt => { try { f(dt); } catch (e) { if (!avisou) { avisou = true; console.warn(nomeMod, e); } } });
  tick(dt => { for (let i = agenda.length - 1; i >= 0; i--) { agenda[i].t -= dt; if (agenda[i].t <= 0) { const f = agenda[i].f; agenda.splice(i, 1); try { f(); } catch (e) { console.warn(nomeMod, e); } } } });
  const _v = new THREE.Vector3(), _f = new THREE.Vector3();
  const olhando = (x, y, z, cos = .9, alc = 8) => {
    _v.set(x, y, z).sub(A.camera.position); const d = _v.length(); if (d > alc || d < .01) return false;
    A.camera.getWorldDirection(_f); return _f.dot(_v.multiplyScalar(1 / d)) > cos;
  };
  const dirY = () => { A.camera.getWorldDirection(_f); return _f.y; };
  const dist = (x, z) => Math.hypot(A.P.pos.x - x, A.P.pos.z - z);
  const sala = () => (A.P.room && A.P.room.id) || '';
  const J = () => window.__jogo;
  // textura de canvas que pode ser redesenhada
  const tela = (w, h, draw) => { const t = A.canvasTex(w, h, draw); t.userData = { clone: true }; t.redesenhar = d => { const g = t.image.getContext('2d'); g.clearRect(0, 0, w, h); d(g, w, h); t.needsUpdate = true; }; return t; };
  const decal = (t, w, h, x, y, z, ry = 0, extra = {}) => A.plano(w, h, new THREE.MeshBasicMaterial({ map: t, transparent: true, depthWrite: false, ...extra }), x, y, z, ry);
  const caixaInvisivel = (w, h, d, x, y, z) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), new THREE.MeshBasicMaterial({ visible: false })); m.position.set(x, y, z); A.W.grupo.add(m); return m; };
  const leg = (txt, imp = true) => { try { if (window.__mlore && window.__mlore.legenda) window.__mlore.legenda(txt, imp); } catch (e) {} };
  const medo = n => { S.fear = Math.max(0, Math.min(100, (S.fear || 0) + n)); };
  const vida = n => { S.health = Math.max(1, Math.min(100, (S.health || 0) + n)); };
  const tremor = k => { const m = (window.__plat && window.__plat.O && window.__plat.O.tremor) ?? 1; A.P.shake = Math.max(A.P.shake || 0, k * m); };
  const vib = ms => { try { if (document.body.classList.contains('toque') && navigator.vibrate) navigator.vibrate(ms); } catch (e) {} };
  const perigo = () => { const M = A.M; return M.ativo && ['caca', 'procura', 'alerta'].includes(M.state) && dist(M.pos.x, M.pos.z) < 12; };
  const ameaca = () => (A.M.ativo && A.M.state === 'caca') || (A.ANA && A.ANA.ativa && A.ANA.conta > 0);
  // contador próprio dos achados escondidos (mapa a mapa, junta na foto da turma entre noites)
  const achou = (id, texto) => {
    const sg = S.flags.sg4 || (S.flags.sg4 = {});
    if (sg[id]) return false; sg[id] = true;
    const n = Object.keys(sg).length;
    A.toast(`${texto} · Achado escondido ${n}/${SG4_TOTAL}`);
    const ls = lsLer(); ls.achados = ls.achados || {}; ls.achados[id] = Date.now(); lsGravar(ls);
    if (n >= SG4_TOTAL) { A.conquista('l4_tudo'); depois(4, () => A.sub('lia', 'Achei todos. Todos os lugares onde eles se esconderam. Ninguém mais precisa se esconder.')); }
    else if (n === 10) depois(4, () => A.sub('lia', '(sussurro) Esse prédio tem mais buraco que parede. As crianças fizeram um internato inteiro dentro do outro.'));
    return true;
  };
  const tem = id => !!(S.flags.sg4 && S.flags.sg4[id]);
  // som procedural (sem contexto de áudio, fica em silêncio)
  const au = () => { try { const a = A.audio(); return a && a.AC && a.AC.state !== 'closed' ? a : null; } catch (e) { return null; } };
  const p3 = (p, y = 1.2) => p ? { x: p.x, y: p.y ?? y, z: p.z } : null;
  const SOM = {
    tom(pos, tipo, f0, f1, dur, vol, wet = .3) { const a = au(); if (!a) return; const t = a.AC.currentTime, g = a.saida(p3(pos), wet, 'sfx'); const o = a.AC.createOscillator(); o.type = tipo; o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + dur); o.connect(g); a.env(g, t, .004, vol, dur); o.start(t); o.stop(t + dur + .05); o.onended = () => o.disconnect(); },
    giz(pos, n = 3, vol = .12) { const a = au(); if (!a) return; const t = a.AC.currentTime; for (let i = 0; i < n; i++) { const k = t + i * .16 + Math.random() * .04, g = a.saida(p3(pos), .25, 'sfx'); a.burst(k, .14, 'bandpass', 3200 + Math.random() * 1500, 6, g); a.env(g, k, .01, vol, .12); } },
    tique(pos, vol = .08, alto) { const a = au(); if (!a) return; const t = a.AC.currentTime, g = a.saida(p3(pos), .15, 'sfx'); a.burst(t, .02, 'highpass', alto ? 5200 : 3800, 1, g, 0); a.env(g, t, .001, vol, .03); },
    sino(pos, vol = .3, f = 520) { const a = au(); if (!a) return; const t = a.AC.currentTime; for (const [m, v, d] of [[1, 1, 3.2], [2.4, .45, 2.2], [3.9, .25, 1.4], [5.4, .12, 1]]) { const g = a.saida(p3(pos, 1.8), .6, 'sfx'); a.osc('sine', f * m, t, d + .1, g); a.env(g, t, .004, vol * v, d); } },
    baque(pos, vol = .35) { const a = au(); if (!a) return; const t = a.AC.currentTime, g = a.saida(p3(pos), .35, 'sfx'); a.burst(t, .12, 'lowpass', 420, 1, g, 0); a.env(g, t, .002, vol, .12); const g2 = a.saida(p3(pos), .2, 'sfx'); const o = a.osc('sine', 95, t, .18, g2); o.frequency.exponentialRampToValueAtTime(50, t + .16); a.env(g2, t, .002, vol * .7, .16); },
    batidas(pos, n, vol = .3, passo = .32) { for (let i = 0; i < n; i++) depois(i * passo, () => SOM.baque(pos, vol * (.85 + Math.random() * .3))); },
    agua(pos, vol = .2, dur = 1.6, freq = 900) { const a = au(); if (!a) return; const t = a.AC.currentTime, g = a.saida(p3(pos, .6), .45, 'sfx'); const f = a.burst(t, dur, 'lowpass', freq, 2, g, 0); f.frequency.linearRampToValueAtTime(freq * .4, t + dur); a.env(g, t, .08, vol, dur); for (let i = 0; i < 5; i++) { const k = t + Math.random() * dur * .8, g2 = a.saida(p3(pos, .6), .3, 'sfx'); const o = a.osc('sine', 500 + Math.random() * 700, k, .08, g2); o.frequency.exponentialRampToValueAtTime(200, k + .07); a.env(g2, k, .003, vol * .25, .07); } },
    splash(pos, vol = .3) { const a = au(); if (!a) return; const t = a.AC.currentTime, g = a.saida(p3(pos, -2), .8, 'sfx'); a.burst(t, .5, 'bandpass', 1300, 1.2, g, 0); a.env(g, t, .005, vol, .45); },
    vidro(pos, vol = .08) { const a = au(); if (!a) return; const t = a.AC.currentTime; for (const f of [2637, 3951, 3136]) { const g = a.saida(p3(pos, .1), .3, 'sfx'); a.osc('sine', f * (.98 + Math.random() * .04), t + Math.random() * .03, .3, g); a.env(g, t, .002, vol, .25); } },
    pano(pos, vol = .06, dur = .5) { const a = au(); if (!a) return; const t = a.AC.currentTime, g = a.saida(p3(pos), .2, 'sfx'); a.burst(t, dur, 'bandpass', 2200, 1.1, g, 0); a.env(g, t, dur * .3, vol, dur * .7); },
    rangido(pos, vol = .07, dur = .7, f0 = 240) { const a = au(); if (!a) return; const t = a.AC.currentTime, g = a.saida(p3(pos), .3, 'sfx'); const bp = a.AC.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 800; bp.Q.value = 6; bp.connect(g); const o = a.AC.createOscillator(); o.type = 'sawtooth'; o.frequency.setValueAtTime(f0, t); o.frequency.linearRampToValueAtTime(f0 * .75, t + dur); o.connect(bp); o.start(t); o.stop(t + dur + .05); o.onended = () => { o.disconnect(); bp.disconnect(); }; a.env(g, t, .06, vol, dur); },
    campainha(pos, vol = .14, dur = 1.6) { const a = au(); if (!a) return; const t = a.AC.currentTime; for (let i = 0; i < dur / .06; i++) { const g = a.saida(p3(pos, 1.4), .4, 'sfx'); a.osc('square', 980, t + i * .06, .03, g); a.env(g, t + i * .06, .001, vol, .03); } },
    clique(pos, vol = .1) { const a = au(); if (!a) return; const t = a.AC.currentTime, g = a.saida(p3(pos), .2, 'sfx'); a.burst(t, .03, 'bandpass', 1800, 2, g, 0); a.env(g, t, .001, vol, .03); },
    clunk(pos, vol = .5) { SOM.baque(pos, vol); depois(.05, () => SOM.tique(pos, vol * .5, true)); },
    cantiga(pos, vol = .05) { const notas = [659, 587, 523, 587, 659, 659, 659]; notas.forEach((f, i) => depois(i * .38, () => SOM.tom(pos, 'triangle', f, f * .99, .34, vol, .5))); }
  };
  // um véu escuro nas bordas da tela (tosse, fuligem, sonho)
  let veu = document.getElementById('sg4-veu');
  if (!veu) { veu = document.createElement('div'); veu.id = 'sg4-veu'; veu.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:5;opacity:0;transition:opacity .6s;background:radial-gradient(ellipse at center,rgba(0,0,0,0) 30%,rgba(8,6,4,.92) 100%)'; document.body.appendChild(veu); }
  const escurecer = (ms = 1000, forte = 1) => { veu.style.opacity = String(forte); setTimeout(() => { veu.style.opacity = '0'; }, ms); };
  // lanterna apaga por um instante (quando estava acesa, volta sozinha)
  const apagarLanterna = (seg = 2) => { const ac = S.flashOn; S.flashOn = false; if (ac) depois(seg, () => { if (!S.dead && (S.battery ?? 1) > 0) S.flashOn = true; }); };
  // sala escondida: piso, teto e quatro paredes, fora da planta. Entra em W.salas só enquanto a Lia está lá dentro
  const salaOculta = (id, nome, x0, x1, z0, z1, h = 3.2, opts = {}) => {
    const r = { id, nome, x0, x1, z0, z1, h, tipo: opts.tipo || 'quarto', piso: opts.piso || 'madeira', oculta: true };
    A.piso(x0, x1, z0, z1, opts.piso || 'madeira', 3);
    A.teto(x0, x1, z0, z1, h);
    const T = .1, o = { h, tex: opts.parede || 'reboco', cor: opts.cor };
    A.parede(x0, z0 + T / 2, x1, z0 + T / 2, o); A.parede(x0, z1 - T / 2, x1, z1 - T / 2, o);
    A.parede(x0 + T / 2, z0, x0 + T / 2, z1, o); A.parede(x1 - T / 2, z0, x1 - T / 2, z1, o);
    const luz = new THREE.PointLight(opts.luzCor || 0xffb060, 0, Math.max(x1 - x0, z1 - z0) * 1.4, 1.4);
    luz.position.set((x0 + x1) / 2, h - .4, (z0 + z1) / 2); A.W.grupo.add(luz);
    const entrar = () => { if (!A.W.salas.includes(r)) A.W.salas.push(r); A.W.spots[id] = A.W.spots[id] || { chao: [], mesa: [], cama: [], prateleira: [], parede: [] }; };
    const sair = () => { const k = A.W.salas.indexOf(r); if (k >= 0) A.W.salas.splice(k, 1); luz.intensity = 0; };
    return { r, luz, entrar, sair, cx: (x0 + x1) / 2, cz: (z0 + z1) / 2 };
  };
  // teleporte com fade (a Lia "atravessa"), sem deixar nada pela metade se o jogo pausar
  const atravessar = (x, z, yaw, depoisFn, ms = 700) => {
    A.fade(true, () => { A.P.pos.set(x, 0, z); A.P.yaw = yaw; A.P.vx = A.P.vz = 0; try { if (depoisFn) depoisFn(); } catch (e) { console.warn(nomeMod, e); } A.fade(false); }, ms);
  };
  return { THREE, depois, tick, olhando, dirY, dist, sala, J, tela, decal, caixaInvisivel, leg, medo, vida, tremor, vib, perigo, ameaca, achou, tem, SOM, escurecer, apagarLanterna, salaOculta, atravessar, nome: nomeJogador };
}

// texturas utilitárias
function papel(g, w, h, linhas, { fundo = '#cbbd98', cor = '#2a2018', fonte = '22px Georgia', lh = 30, x = 18, y = 38 } = {}) {
  g.fillStyle = fundo; g.fillRect(0, 0, w, h);
  for (let i = 0; i < 6; i++) { const gx = Math.random() * w, gy = Math.random() * h, r = 20 + Math.random() * 60; const gr = g.createRadialGradient(gx, gy, 0, gx, gy, r); gr.addColorStop(0, 'rgba(90,60,20,.22)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, h); }
  g.fillStyle = cor; g.font = fonte; linhas.forEach((l, i) => { g.save(); g.translate(x + (Math.random() - .5) * 3, y + i * lh); g.rotate((Math.random() - .5) * .03); g.fillText(l, 0, 0); g.restore(); });
}
function giz(g, texto, x, y, tam = 30, cor = 'rgba(225,225,210,.9)', alinhar = 'center') {
  g.fillStyle = cor; g.font = `${tam}px "Comic Sans MS", Georgia`; g.textAlign = alinhar; g.save(); g.translate(x, y); g.rotate((Math.random() - .5) * .04); g.fillText(texto, 0, 0); g.restore(); g.textAlign = 'left';
}

// =====================================================================
// TÉRREO (Capítulos I e II)
// =====================================================================
export function segredosTerreo(A, S, ctx = {}) {
  const U = base(A, S, 'internato-segredos'), { THREE } = U, { MAT, box, cyl, plano } = A;
  const ganchos = { sync: [], entrar: [] };
  // registro de noites (para o cubículo do Inspetor lembrar das outras noites)
  {
    const ls = lsLer(); ls.noites = ls.noites || [];
    if (S.flags.sg4_noite === undefined) {
      const d = new Date(), p = n => String(n).padStart(2, '0');
      ls.noites.push({ d: `${p(d.getDate())}/${p(d.getMonth() + 1)}`, m: 0 }); if (ls.noites.length > 10) ls.noites.shift();
      S.flags.sg4_noite = ls.noites.length - 1; lsGravar(ls);
    }
    let nT = 0; U.tick(dt => { nT -= dt; if (nT > 0) return; nT = 5; const l = lsLer(); const k = Math.min(S.flags.sg4_noite, (l.noites || []).length - 1); if (k >= 0 && l.noites[k].m !== (S.mortes || 0)) { l.noites[k].m = S.mortes || 0; lsGravar(l); } });
  }

  // ---------------- 1. JOGO DA VELHA NA LOUSA (sala de aula, parede leste)
  {
    const BX = -6.115, BY = 1.6, BZ = -7.6, LW = 1.1, LH = 1.29, CEL = LW / 3;
    const tab = Array(9).fill(''); let vez = 'X', fim = null, msg = '', jogando = false, primeiroLance = -1, lances = 0;
    const desenhar = (g, w, h) => {
      g.fillStyle = '#17241c'; g.fillRect(0, 0, w, h);
      for (let i = 0; i < 40; i++) { g.fillStyle = `rgba(200,210,200,${Math.random() * .05})`; g.fillRect(Math.random() * w, Math.random() * h, 30 + Math.random() * 60, 4 + Math.random() * 10); }
      g.strokeStyle = 'rgba(225,225,210,.85)'; g.lineWidth = 5; g.lineCap = 'round';
      for (const k of [1, 2]) { g.beginPath(); g.moveTo(k * 85 + (Math.random() - .5) * 3, 12); g.lineTo(k * 85 + (Math.random() - .5) * 3, 244); g.stroke(); g.beginPath(); g.moveTo(12, k * 85); g.lineTo(244, k * 85 + (Math.random() - .5) * 3); g.stroke(); }
      tab.forEach((v, i) => {
        const cx = (i % 3) * 85 + 42, cy = Math.floor(i / 3) * 85 + 42;
        if (v === 'X') { g.strokeStyle = 'rgba(235,230,210,.95)'; g.beginPath(); g.moveTo(cx - 24, cy - 24); g.lineTo(cx + 24, cy + 24); g.moveTo(cx + 24, cy - 24); g.lineTo(cx - 24, cy + 24); g.stroke(); }
        else if (v === 'O') { g.strokeStyle = 'rgba(255,215,200,.9)'; g.beginPath(); g.ellipse(cx, cy, 25, 27, .2, 0, 6.2); g.stroke(); }
      });
      if (msg) giz(g, msg, w / 2, 285, msg.length > 18 ? 19 : 24, fim === 'derrota' ? 'rgba(255,190,180,.95)' : 'rgba(230,230,215,.95)');
      else giz(g, 'X  joga  O', w / 2, 285, 18, 'rgba(200,200,190,.45)');
    };
    const tx = U.tela(256, 300, desenhar);
    const lousa = plano(LW, LH, new THREE.MeshStandardMaterial({ map: tx, roughness: .95, emissive: 0x0a120c, emissiveIntensity: .5 }), BX, BY, BZ, -Math.PI / 2);
    box(.04, .06, LW + .1, MAT.madeiraEsc, BX + .02, BY - LH / 2 - .03, BZ, A.W.grupo, false); // tabuleiro do giz
    lousa.userData.leitura = { t: 'Um jogo da velha desenhado a giz. Alguém sempre joga de O.' };
    const venceu = b => { for (const [a, c, d] of [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]]) if (b[a] && b[a] === b[c] && b[a] === b[d]) return b[a]; return b.every(v => v) ? 'velha' : null; };
    const minimax = (b, quem) => {
      const r = venceu(b); if (r === 'O') return { s: 1 }; if (r === 'X') return { s: -1 }; if (r === 'velha') return { s: 0 };
      let melhor = { s: quem === 'O' ? -9 : 9, i: -1 };
      for (let i = 0; i < 9; i++) if (!b[i]) { b[i] = quem; const v = minimax(b, quem === 'O' ? 'X' : 'O').s; b[i] = ''; if (quem === 'O' ? v > melhor.s : v < melhor.s) melhor = { s: v, i }; }
      return melhor;
    };
    const lanceO = () => {
      // o erro de propósito que o Davi ensinou: X no canto de cima à esquerda, e o fantasma responde na beirada do lado
      if (lances === 1 && primeiroLance === 0 && !tab[1]) return 1;
      const m = minimax(tab.slice(), 'O'); return m.i >= 0 ? m.i : tab.findIndex(v => !v);
    };
    const encerrar = r => {
      fim = r === 'X' ? 'vitoria' : r === 'O' ? 'derrota' : 'empate'; S.flags.sg4_velhaJogou = true;
      const nome = U.nome() || 'LIA';
      if (fim === 'vitoria') {
        msg = 'GANHOU. COMO ELE ENSINOU.'; U.SOM.giz({ x: BX, y: BY, z: BZ }, 5);
        U.depois(1.2, () => A.sub('davi', '(longe, rindo) Trapaceira. Igualzinho eu.'));
        if (!S.flags.sg4_velhaVenceu) { S.flags.sg4_velhaVenceu = true; S.inv.pilhas++; A.SFX.pegar(); A.conquista('l4_velha'); U.achou('velha', 'A lousa deixou cair uma pilha do apagador'); }
      } else if (fim === 'empate') {
        msg = 'EMPATE. DE NOVO AMANHÃ'; U.SOM.giz({ x: BX, y: BY, z: BZ }, 6);
        if (!S.flags.sg4_velhaEmpate) { S.flags.sg4_velhaEmpate = true; S.inv.pilhas++; A.SFX.pegar(); A.toast('Uma pilha rola do apagador até a sua mão.'); U.achou('velha', 'O fantasma da lousa empatou com você'); }
      } else {
        msg = `PERDEU, ${nome.toUpperCase()}`; U.SOM.giz({ x: BX, y: BY, z: BZ }, 5, .16);
        U.apagarLanterna(2); U.escurecer(2000, .85); U.medo(15); U.leg('o giz risca sozinho, rápido');
        U.depois(2.4, () => A.sub('lia', '(sussurro) Ele não perde. Nunca perdeu de ninguém... só do Davi.'));
      }
      tx.redesenhar(desenhar);
      U.depois(fim === 'vitoria' ? 30 : 6, () => { tab.fill(''); fim = null; msg = ''; vez = 'X'; lances = 0; primeiroLance = -1; tx.redesenhar(desenhar); });
    };
    const NOMES = ['canto de cima, à esquerda', 'meio de cima', 'canto de cima, à direita', 'meio da esquerda', 'centro', 'meio da direita', 'canto de baixo, à esquerda', 'meio de baixo', 'canto de baixo, à direita'];
    for (let i = 0; i < 9; i++) {
      const r = Math.floor(i / 3), c = i % 3;
      // a grade ocupa os 256 px de cima da lousa (o resto é a linha da mensagem)
      const cel = U.caixaInvisivel(.06, CEL * .92, CEL * .92, BX - .03, BY + LH / 2 - (r + .5) * (LH * 256 / 300) / 3, BZ - LW / 2 + (c + .5) * CEL);
      A.interact(cel, () => fim || jogando ? '' : tab[i] ? '' : `<b>E</b>Marcar X no ${NOMES[i]}`, () => {
        if (fim || jogando || tab[i] || vez !== 'X') return;
        tab[i] = 'X'; if (lances === 0) primeiroLance = i; lances++; vez = 'O'; msg = ''; tx.redesenhar(desenhar);
        U.SOM.giz({ x: BX, y: BY, z: BZ }, 2); A.emitNoise(BX, BZ, 3, true);
        const r1 = venceu(tab); if (r1) return encerrar(r1);
        jogando = true;
        U.depois(.9 + Math.random() * .5, () => {
          jogando = false; const k = lanceO(); if (k < 0) return;
          tab[k] = 'O'; vez = 'X'; tx.redesenhar(desenhar); U.SOM.giz({ x: BX, y: BY, z: BZ }, 2, .1); U.leg('giz rangendo na lousa, sem ninguém');
          if (!S.flags.sg4_velhaViu) { S.flags.sg4_velhaViu = true; U.depois(.8, () => A.sub('lia', '(bem baixinho) ...o giz se mexeu sozinho.')); U.medo(8); }
          const r2 = venceu(tab); if (r2) encerrar(r2);
        });
      });
    }
    // bilhete do Davi colado embaixo da lousa: a dica do erro do fantasma
    const tb = U.tela(128, 96, (g, w, h) => papel(g, w, h, ['Lia: começa no', 'canto de cima.', 'ele erra a 2ª — D.'], { fonte: 'italic 15px Georgia', lh: 22, x: 8, y: 26 }));
    const bil = plano(.22, .165, new THREE.MeshStandardMaterial({ map: tb, roughness: 1, emissive: 0x2a2418, emissiveIntensity: .5 }), BX - .005, BY - LH / 2 - .2, BZ + LW / 2 - .12, -Math.PI / 2);
    A.interact(bil, () => `<b>E</b>Ler o bilhete preso embaixo da lousa${S.flags.sg4_bilVelha ? '<small style="opacity:.6"> (lido)</small>' : ''}`, () => {
      S.flags.sg4_bilVelha = true; A.SFX.papel();
      A.dialogo([{ quem: 'lia', texto: 'Um bilhete dobrado em quatro, letra de criança: "Lia: começa no canto de cima. Ele sempre erra a segunda. — D."' }, { quem: 'lia', texto: 'A gente jogava isso nas visitas. Ele sempre me deixava começar... e sempre ganhava.' }]);
    });
  }

  // ---------------- 2. RELÓGIO DE PÊNDULO DA RECEPÇÃO (acertar nas três horas do livro de ocorrências)
  {
    const RX = 5.2, RZ = -13.62;
    const g = new THREE.Group(); g.position.set(RX, 0, RZ); A.W.grupo.add(g);
    box(.62, 2.05, .4, MAT.madeiraEsc, 0, 1.025, 0, g);
    box(.66, .08, .44, MAT.madeira, 0, 2.08, 0, g);
    const vidroP = box(.36, .9, .02, new THREE.MeshStandardMaterial({ color: 0x182018, roughness: .1, metalness: .3, transparent: true, opacity: .45 }), 0, .78, .205, g, false);
    const pend = new THREE.Group(); pend.position.set(0, 1.2, .16); g.add(pend);
    box(.015, .62, .015, MAT.bronze, 0, -.31, 0, pend, false); cyl(.07, .07, .02, MAT.bronze, 0, -.64, 0, 12, pend).rotation.x = Math.PI / 2;
    A.addCollider(RX - .32, RX + .32, RZ - .22, RZ + .22);
    let h = 21, m = 0, girandoT = 0, parouT = 0, mexeu = false, seq = 0, correndo = 0;
    const desenharMostrador = (gg, w) => {
      gg.fillStyle = '#c4b590'; gg.beginPath(); gg.arc(64, 64, 60, 0, 7); gg.fill(); gg.strokeStyle = '#211'; gg.lineWidth = 3; gg.stroke();
      gg.fillStyle = '#211'; gg.font = '13px Georgia'; gg.textAlign = 'center';
      for (let i = 1; i <= 12; i++) { const a = i / 12 * Math.PI * 2; gg.fillText(['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'][i - 1], 64 + Math.sin(a) * 47, 69 - Math.cos(a) * 47); }
      const ah = ((h % 12) + m / 60) / 12 * Math.PI * 2, am = m / 60 * Math.PI * 2;
      gg.lineWidth = 4; gg.beginPath(); gg.moveTo(64, 64); gg.lineTo(64 + Math.sin(ah) * 28, 64 - Math.cos(ah) * 28); gg.stroke();
      gg.lineWidth = 2; gg.beginPath(); gg.moveTo(64, 64); gg.lineTo(64 + Math.sin(am) * 44, 64 - Math.cos(am) * 44); gg.stroke();
      gg.font = 'italic 9px Georgia'; gg.fillText('SÃO LÁZARO', 64, 96);
    };
    const tm = U.tela(128, 128, desenharMostrador);
    const most = plano(.42, .42, new THREE.MeshStandardMaterial({ map: tm, roughness: .7, emissive: 0x1a1408, emissiveIntensity: .35 }), 0, 1.68, .205, 0, g);
    const hhmm = () => `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    const avancar = () => { m++; if (m >= 60) { m = 0; h = (h + 1) % 24; } mexeu = true; parouT = 0; tm.redesenhar(desenharMostrador); U.SOM.tique({ x: RX, y: 1.7, z: RZ }, .06); if (m % 5 === 0) A.emitNoise(RX, RZ, 2.5, true); };
    const itR = A.interact(g, () => {
      if (S.flags.sg4_relogioAberto) return 'O relógio de pêndulo voltou a andar. A portinhola do pêndulo está aberta.';
      return `<b>E</b>Mexer nos ponteiros do relógio de pêndulo <small style="opacity:.7">(segure para girar · ${hhmm()})</small>`;
    }, () => { if (!S.flags.sg4_relogioAberto) avancar(); });
    const SEQ = ['21:04', '21:31', '21:50'];
    const FALA = [['tome', '(de dentro do relógio, baixinho) ...eu só falei "mãe". Foi só isso.'], ['ana', '(risadinha, de dentro da caixa) Um... dois... achou a minha hora.'], ['davi', '(perto, muito perto) Você leu até o fim, né?']];
    const avaliar = () => {
      const agora = hhmm();
      if (agora === SEQ[seq]) {
        U.SOM.sino({ x: RX, y: 1.9, z: RZ }, .07, 880); A.sub(FALA[seq][0], FALA[seq][1]); seq++;
        if (seq >= SEQ.length) {
          S.flags.sg4_relogioAberto = true; S.flags.sg4_medalha = true; correndo = 1;
          U.depois(1.2, () => {
            U.SOM.clunk({ x: RX, y: .8, z: RZ }, .3); vidroP.position.x = .12; vidroP.rotation.y = -1.2; pend.visible = false; A.SFX.pegar();
            S.inv.pilhas++; A.conquista('l4_relogio'); U.achou('relogio', 'O pêndulo caiu: uma pilha e a medalha de São Lázaro do Davi');
            A.lerNota('sg4_relogio'); U.leg('o relógio volta a andar');
          });
        } else A.toast(`O relógio aceitou ${agora}. Ele espera outra hora.`);
        return;
      }
      if (agora === '21:00') { U.SOM.sino({ x: RX, y: 1.9, z: RZ }, .45, 330); U.leg('o relógio bate uma vez, alto'); A.emitNoise(RX, RZ, 22, true); U.tremor(.06); U.depois(1, () => A.sub('lia', 'Nove horas. A Hora. Ele ouviu isso do prédio inteiro.')); seq = 0; return; }
      if (agora === '21:58') { U.medo(10); A.sub('lia', '(sussurro) Vinte e uma e cinquenta e oito. A hora em que trancaram a capela.'); return; }
      if (seq > 0) { seq = 0; U.SOM.sino({ x: RX, y: 1.9, z: RZ }, .35, 300); U.leg('o relógio badala alto, fora de hora'); A.emitNoise(RX, RZ, 18, true); A.toast('Hora errada. O relógio esquece as horas que você já tinha acertado.'); }
    };
    let ang = 0, pendT = 0;
    U.tick(dt => {
      if (U.dist(RX, RZ) > 14) return;
      const j = U.J();
      if (j && j.alvo === itR && j.keys.KeyE && !S.flags.sg4_relogioAberto) { girandoT += dt; if (girandoT > .35) { pendT -= dt; if (pendT <= 0) { pendT = .09; avancar(); } } }
      else { girandoT = 0; if (mexeu) { parouT += dt; if (parouT > .9) { mexeu = false; avaliar(); } } }
      if (correndo) { ang += dt * 2.6; pend.rotation.z = Math.sin(ang) * .22; pendT -= dt; if (Math.sin(ang) * Math.sin(ang - dt * 2.6) <= 0) U.SOM.tique({ x: RX, y: 1.2, z: RZ }, .04); }
    });
    void most;
  }
  // a medalha de São Lázaro esquenta quando a Procissão vem (vale nos dois andares)
  medalha(A, S, U);

  // ---------------- 3. FOTO DA TURMA DE 1979 (corredor oeste): quem está no fundo, e os rostos que os achados desriscam
  {
    const FX = -9.6, FY = 1.72, FZ = -13.87;
    box(1.02, .76, .05, MAT.madeiraEsc, FX, FY, FZ - .02, A.W.grupo, false);
    let viuMulher = !!S.flags.sg4_fotoMulher;
    const desenhar = (g, w, h) => {
      const ls = lsLer(), achados = { ...(ls.achados || {}), ...(S.flags.sg4 || {}) };
      const todos = SG4_T.concat(SG4_S), nAchou = todos.filter(id => achados[id]).length;
      g.fillStyle = '#6b5a40'; g.fillRect(0, 0, w, h);
      const gr = g.createRadialGradient(w / 2, h / 2, 20, w / 2, h / 2, w * .7); gr.addColorStop(0, 'rgba(230,205,160,.35)'); gr.addColorStop(1, 'rgba(30,20,10,.6)'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
      // fundo: a fachada e a porta
      g.fillStyle = 'rgba(40,30,20,.55)'; g.fillRect(0, 0, w, 54); g.fillStyle = 'rgba(20,14,8,.6)'; g.fillRect(w / 2 - 18, 10, 36, 44);
      if (viuMulher) { g.fillStyle = 'rgba(28,22,18,.85)'; g.beginPath(); g.ellipse(w - 46, 34, 7, 8, 0, 0, 7); g.fill(); g.beginPath(); g.moveTo(w - 58, 44); g.lineTo(w - 34, 44); g.lineTo(w - 30, 70); g.lineTo(w - 62, 70); g.fill(); g.fillStyle = 'rgba(255,240,190,.7)'; g.fillRect(w - 33, 52, 4, 3); }
      // 37 crianças em três fileiras; um X de caneta em cada rosto que esconde um segredo ainda não achado
      let k = 0;
      for (let fil = 0; fil < 3; fil++) {
        const n = fil === 0 ? 12 : fil === 1 ? 12 : 13, y = 72 + fil * 30, x0 = 18 + (fil === 2 ? 0 : 9);
        for (let i = 0; i < n; i++, k++) {
          const x = x0 + i * 17.5;
          g.fillStyle = 'rgba(45,32,22,.9)'; g.fillRect(x - 6, y + 6, 12, 18);
          g.fillStyle = 'rgba(205,180,140,.95)'; g.beginPath(); g.arc(x, y, 6, 0, 7); g.fill();
          g.fillStyle = 'rgba(40,28,18,.9)'; g.fillRect(x - 6, y - 7, 12, 4);
          if (k < todos.length && !achados[todos[k]]) { g.strokeStyle = 'rgba(20,20,60,.9)'; g.lineWidth = 2; g.beginPath(); g.moveTo(x - 6, y - 6); g.lineTo(x + 6, y + 6); g.moveTo(x + 6, y - 6); g.lineTo(x - 6, y + 6); g.stroke(); }
        }
      }
      // com tudo achado: uma menina a mais na ponta, de mão dada com o menino de óculos
      if (nAchou >= todos.length) { const x = w - 12, y = 132; g.fillStyle = 'rgba(70,40,40,.9)'; g.fillRect(x - 5, y + 6, 10, 16); g.fillStyle = 'rgba(215,190,150,.95)'; g.beginPath(); g.arc(x, y, 5.5, 0, 7); g.fill(); g.fillStyle = 'rgba(60,35,20,.95)'; g.fillRect(x - 6, y - 7, 3, 14); g.fillRect(x + 3, y - 7, 3, 14); }
      g.fillStyle = 'rgba(250,240,220,.85)'; g.font = 'italic 11px Georgia'; g.textAlign = 'center'; g.fillText('TURMA DE 1979 — INTERNATO SÃO LÁZARO', w / 2, h - 8); g.textAlign = 'left';
      return nAchou;
    };
    const tf = U.tela(256, 180, desenhar);
    const foto = plano(.94, .66, new THREE.MeshStandardMaterial({ map: tf, roughness: .6, emissive: 0x1a140c, emissiveIntensity: .45 }), FX, FY, FZ + .01, 0);
    let olharT = 0;
    A.interact(foto, () => `<b>E</b>Olhar a foto da turma de 1979${viuMulher ? '<small style="opacity:.6"> (tem alguém no fundo)</small>' : ''}`, () => {
      const ls = lsLer(), achados = { ...(ls.achados || {}), ...(S.flags.sg4 || {}) }, todos = SG4_T.concat(SG4_S), n = todos.filter(id => achados[id]).length;
      const linhas = [{ quem: 'lia', texto: `Trinta e sete crianças na frente do prédio. ${todos.length - n > 0 ? `${todos.length - n} rostos riscados a caneta, com força.` : 'Nenhum rosto riscado. Alguém desriscou todos.'}` }];
      if (n > 0 && n < todos.length) linhas.push({ quem: 'lia', texto: 'Os que eu achei... os rostos deles estão limpos de novo. Como se cada esconderijo devolvesse uma criança.' });
      if (viuMulher) linhas.push({ quem: 'lia', texto: 'E no fundo, perto da porta, uma mulher de capa de chuva segurando uma lanterna. Sou eu. Em 1979.' });
      if (n >= todos.length) linhas.push({ quem: 'lia', texto: 'Na ponta, de mão dada com o Davi, uma menina de nove anos que nunca estudou aqui. Eu não tava aqui. Eu não tava.' });
      A.SFX.papel(); A.dialogo(linhas);
    });
    U.tick(dt => {
      if (viuMulher || U.dist(FX, FZ) > 2.4 || !U.olhando(FX, FY, FZ, .93, 2.6)) { olharT = Math.max(0, olharT - dt); return; }
      olharT += dt;
      if (olharT > 4) {
        viuMulher = true; S.flags.sg4_fotoMulher = true; tf.redesenhar(desenhar); U.medo(12); U.tremor(.03);
        U.leg('no fundo da foto, uma mulher de capa. é você'); A.sub('lia', '(sussurro) Quem é essa... no fundo? De capa. Com uma lanterna.');
        A.conquista('l4_foto'); U.achou('foto', 'Tem alguém a mais na foto da turma');
      }
    });
    ganchos.sync.push(() => tf.redesenhar(desenhar));
  }

  // ---------------- 4. APAGÃO: a chave geral da casa de máquinas e as mãozinhas que só brilham no escuro
  {
    const KX = 33.88, KY = 1.35, KZ = -24.3;
    box(.06, .6, .4, MAT.metal, KX + .02, KY, KZ, A.W.grupo, false);
    const alav = new THREE.Group(); alav.position.set(KX - .04, KY, KZ); A.W.grupo.add(alav);
    box(.04, .32, .05, MAT.ferrugem, -.02, .14, 0, alav); box(.07, .07, .14, MAT.preto, -.05, .3, 0, alav);
    const placaK = U.decal(U.tela(128, 48, (g, w, h) => { g.fillStyle = '#7a1a12'; g.fillRect(0, 0, w, h); g.fillStyle = '#e8d9b0'; g.font = 'bold 15px Georgia'; g.textAlign = 'center'; g.fillText('CHAVE GERAL', w / 2, 20); g.font = '11px Georgia'; g.fillText('não desligar — A.', w / 2, 38); }), .3, .11, KX - .01, KY + .42, KZ, -Math.PI / 2);
    void placaK;
    let apagao = false, apagaoT = 0; S.flags.sg4_apagao = false;
    const orig = () => !!S.flags.energia;
    const religar = (sozinha) => {
      if (!apagao) return; apagao = false; S.flags.sg4_apagao = false; alav.rotation.z = 0;
      U.SOM.clunk({ x: KX, y: KY, z: KZ }, .45); A.syncLuzes(); A.SFX.gerador(true, { x: 31.6, y: 1, z: -19 }); U.leg(sozinha ? 'a chave geral volta sozinha com um estalo' : 'o gerador volta a roncar');
      if (sozinha) A.sub('lia', '(sussurro) Voltou sozinha. Alguém empurrou de volta.');
    };
    const itK = A.interact(alav, () => {
      if (!S.flags.energia) return 'Uma chave geral de ferro. Sem energia, não faz nada.';
      return apagao ? '<b>E</b>Empurrar a chave geral de volta' : '<b>E</b>Puxar a chave geral (apaga o prédio inteiro)';
    }, () => {
      if (!S.flags.energia) return;
      if (apagao) return religar(false);
      apagao = true; S.flags.sg4_apagao = true; apagaoT = 40; alav.rotation.z = -1.1;
      U.SOM.clunk({ x: KX, y: KY, z: KZ }, .6); A.SFX.gerador(false); A.syncLuzes(); U.tremor(.05);
      A.emitNoise(KX, KZ, 30, true); U.leg('o prédio inteiro apaga de uma vez'); U.medo(10);
      if (!S.flags.sg4_apagaoFala) { S.flags.sg4_apagaoFala = true; U.depois(1.4, () => A.sub('lia', 'Tudo apagou. Ele vai vir ver o que foi. Rápido.')); }
    });
    itK.hold = 1.2; itK.ruido = 5; itK.pode = () => !!S.flags.energia;
    // o mapa passa a perguntar à chave geral se há energia (só as lâmpadas; o resto do capítulo segue igual)
    ganchos.energia = () => orig() && !apagao;
    // mãozinhas fosforescentes: da porta da casa de máquinas até a gaveta da lavanderia
    const tm = U.tela(64, 64, (g, w, h) => { g.clearRect(0, 0, w, h); g.fillStyle = 'rgba(170,255,190,.95)'; g.beginPath(); g.ellipse(32, 40, 11, 13, 0, 0, 7); g.fill(); for (let i = 0; i < 4; i++) { g.save(); g.translate(21 + i * 7, 25); g.rotate((i - 1.5) * .14); g.fillRect(-2.5, -14, 5, 16); g.restore(); } g.save(); g.translate(44, 40); g.rotate(.9); g.fillRect(-2.5, -11, 5, 13); g.restore(); });
    const mMao = new THREE.MeshBasicMaterial({ map: tm, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending, color: 0x9fffb8 });
    const maos = [];
    const pMao = (x, y, z, ry, rz = 0) => { const p = plano(.17, .17, mMao, x, y, z, ry); p.rotation.z = rz; maos.push(p); };
    for (const [i, x] of [28.6, 27.4, 24.4, 22.5, 20.6, 18.7, 16.8, 14.9, 13.0].entries()) { pMao(x, .95 + (i % 2) * .25, -10.12, Math.PI, (i % 2 ? .3 : -.2)); } // parede norte do corredor leste
    pMao(12.0, 1.0, -13.88, 0, .2); pMao(10.0, 1.25, -13.88, 0, -.3); // em volta da porta da lavanderia, pelo lado do corredor
    for (let i = 0; i < 5; i++) { const p = plano(.17, .17, mMao, 11.4 + i * .3, .012, -16.5 - i * 1.8, 0); p.rotation.x = -Math.PI / 2; p.rotation.z = i * .2; maos.push(p); } // no chão da lavanderia
    // a cômoda da lavanderia: a gaveta emperrada só abre no escuro total
    const GX = 12.6, GZ = -25.68;
    A.prop(.9, .82, .45, MAT.madeiraEsc, GX, .41, GZ);
    const gav = box(.8, .2, .04, MAT.madeira, GX, .58, GZ + .235, A.W.grupo, false);
    box(.14, .03, .03, MAT.bronze, GX, .58, GZ + .26, A.W.grupo, false);
    pMao(GX - .2, .58, GZ + .262, 0, .4); pMao(GX + .22, .62, GZ + .262, 0, -.3);
    A.interact(gav, () => S.flags.sg4_gaveta ? 'A gaveta está vazia. Só as mãozinhas pintadas por dentro.' : apagao ? '<b>E</b>Abrir a gaveta das mãozinhas' : 'Uma gaveta emperrada. Tem marcas em volta do puxador que só daria pra ver no escuro.', () => {
      if (S.flags.sg4_gaveta) return;
      if (!apagao) { A.SFX.trancado(); A.emitNoise(GX, GZ, 2.5, true); return; }
      S.flags.sg4_gaveta = true; gav.position.z += .25; U.SOM.rangido({ x: GX, y: .6, z: GZ }, .06, .5, 300);
      S.inv.kits++; A.SFX.pegar(); A.conquista('l4_apagao'); U.achou('apagao', 'No escuro, a gaveta abriu: um curativo e uma nota');
      A.lerNota('sg4_apagao');
    });
    U.tick(dt => {
      if (apagao) { apagaoT -= dt; if (apagaoT <= 0 || !S.flags.energia) religar(true); }
      const alvo = apagao ? (S.flashOn ? .18 : .95) : 0;
      mMao.opacity += (alvo - mMao.opacity) * Math.min(1, dt * 1.2);
      const vis = mMao.opacity > .01; for (const p of maos) p.visible = vis;
      if (apagao && !S.flashOn && !S.flags.sg4_maosViu && U.sala() === 'ce') { S.flags.sg4_maosViu = true; U.leg('mãozinhas brilhando na parede, em fila'); A.sub('lia', '(bem baixinho) Mãozinhas... pintadas. Elas vão pra lavanderia.'); }
    });
    ganchos.sync.push(() => { if (apagao && !S.flags.energia) religar(true); });
  }

  // ---------------- 5. CABINE "OCUPADO" NO BANHEIRO: bata, ela responde com uma batida a mais
  {
    const CX = 21.12, CZ = -24.62;
    const piv = new THREE.Group(); piv.position.set(20.5, 0, CZ); A.W.grupo.add(piv);
    const porta = box(1.22, 1.7, .04, MAT.porta, .61, 1.0, 0, piv);
    const tp = U.tela(128, 48, (g, w, h) => { g.fillStyle = '#5a1810'; g.fillRect(0, 0, w, h); g.fillStyle = '#e8d9b0'; g.font = 'bold 20px Georgia'; g.textAlign = 'center'; g.fillText('OCUPADO', w / 2, 31); });
    const placaO = plano(.26, .1, new THREE.MeshBasicMaterial({ map: tp }), .95, 1.35, .025, 0, piv);
    void placaO;
    const col = A.addCollider(20.52, 21.74, CZ - .05, CZ + .05);
    let n = 0, resetT = 0, aberta = !!S.flags.sg4_cabine, ocupado = false;
    if (aberta) { piv.rotation.y = 1.3; if (col) col.on = false; }
    const itC = A.interact(porta, () => aberta ? (S.flags.sg4_cabineItens ? 'A cabine do clube. Um toco de vela apagado.' : '<b>E</b>Pegar o que as crianças guardaram na cabine') : `<b>E</b>Bater na porta da cabine "OCUPADO"${n ? ` <small style="opacity:.7">(${n} batida${n > 1 ? 's' : ''})</small>` : ''}`, () => {
      if (aberta) {
        if (S.flags.sg4_cabineItens) return;
        S.flags.sg4_cabineItens = true; S.inv.kits++; A.SFX.pegar(); A.conquista('l4_cabine'); U.achou('cabine', 'O esconderijo do clube: um curativo e a ata dos sócios'); A.lerNota('sg4_cabine'); return;
      }
      if (ocupado) return;
      n++; resetT = 6; ocupado = true;
      U.SOM.baque({ x: CX, y: 1.2, z: CZ }, .3); A.emitNoise(CX, CZ, 5, true);
      U.depois(.7, () => {
        ocupado = false;
        if (n >= 9) {
          aberta = true; S.flags.sg4_cabine = true; U.SOM.tique({ x: CX, y: 1.1, z: CZ }, .12, true); U.leg('um trinco corre do lado de dentro');
          U.depois(.5, () => { U.SOM.rangido({ x: CX, y: 1, z: CZ }, .08, .9); if (col) col.on = false; });
          U.depois(1.6, () => A.sub('lia', '(sussurro) Nove. O clube era de quem batia nove.'));
          return;
        }
        U.SOM.batidas({ x: CX, y: 1.1, z: CZ + -.4 }, n + 1, .22, .28); U.leg(`do lado de dentro, ${n + 1} batidas`);
        if (n === 1) U.depois(2, () => A.sub('lia', '...tem alguém aí dentro. Bateu uma vez a mais.'));
        if (n === 5) U.medo(10);
      });
    });
    void itC;
    U.tick(dt => {
      if (aberta) { if (piv.rotation.y < 1.3) piv.rotation.y = Math.min(1.3, piv.rotation.y + dt * 1.5); return; }
      if (n > 0) { resetT -= dt; if (resetT <= 0) { n = 0; U.leg('silêncio na cabine'); A.toast('A cabine ficou quieta. Recomece a contar.'); } }
    });
    // dentro da cabine: o toco de vela do Tomé e uma caixinha
    cyl(.025, .03, .08, MAT.vela, CX + .3, .04, CZ - .9, 8);
    box(.18, .08, .12, MAT.madeiraEsc, CX - .2, .04, CZ - .95, A.W.grupo, false);
  }

  // ---------------- 6. A CARTEIRA "L. MORAES": sentar, ouvir a chamada e NÃO responder
  {
    const DX = -18.85, DZ = -1.15;
    const g = new THREE.Group(); g.position.set(DX, 0, DZ); g.rotation.y = Math.PI; A.W.grupo.add(g);
    box(.6, .04, .42, MAT.madeira, 0, .72, 0, g); for (const [x, z] of [[-.26, -.18], [.26, -.18], [-.26, .18], [.26, .18]]) box(.03, .7, .03, MAT.ferrugem, x, .35, z, g, false);
    box(.42, .03, .36, MAT.madeiraEsc, 0, .42, .42, g, false); box(.42, .4, .03, MAT.madeiraEsc, 0, .62, .6, g, false);
    A.addCollider(DX - .32, DX + .32, DZ - .24, DZ + .24);
    const tt = U.tela(128, 64, (gg, w, h) => { gg.clearRect(0, 0, w, h); gg.strokeStyle = 'rgba(220,210,180,.8)'; gg.fillStyle = 'rgba(220,210,180,.85)'; gg.font = 'italic bold 22px Georgia'; gg.fillText('L. MORAES', 8, 30); gg.lineWidth = 2; for (let i = 0; i < 6; i++) { gg.beginPath(); gg.moveTo(4 + i * 20, 12 + Math.random() * 5); gg.lineTo(14 + i * 20, 38 - Math.random() * 5); gg.stroke(); } gg.font = 'italic 14px Georgia'; gg.fillText('falta · falta · falta', 8, 56); });
    const tampo = plano(.5, .25, new THREE.MeshBasicMaterial({ map: tt, transparent: true, opacity: 0, depthWrite: false }), DX, .745, DZ, 0); tampo.rotation.x = -Math.PI / 2;
    let sentada = false, sT = 0, fase = 0, esperaT = 0, sx = 0, sz = 0, vIni = 0, chamK = -1;
    const NOMES = ['Abreu, Bento', 'Almeida, Rosa', 'Barros, Jurandir', 'Campos, Teresa', 'Duarte... não', 'Ferraz, Paulo', 'Lima, Graça', 'Moraes, Davi', 'Nogueira, Célia', 'Prado, Ana Luísa', 'Ramos, Tomé', 'Souza, Ivone'];
    const levantar = (msgSilencio) => { if (!sentada) return; sentada = false; A.P.crouch = false; if (msgSilencio) A.toast('Você levantou. A chamada parou no meio.'); };
    A.interact(g, () => S.flags.sg4_carteira ? 'A carteira "L. MORAES". A tampa está aberta, vazia.' : sentada ? '' : '<b>E</b>Sentar na carteira riscada "L. MORAES"', () => {
      if (S.flags.sg4_carteira || sentada) return;
      if (U.ameaca()) { A.toast('Agora não. Tem alguma coisa vindo.'); return; }
      sentada = true; sT = 0; fase = 0; A.P.crouch = true; sx = DX; sz = DZ - .55; A.P.pos.set(sx, 0, sz); A.P.yaw = Math.PI; A.P.pitch = -.12; vIni = performance.now();
      U.SOM.rangido({ x: DX, y: .5, z: DZ }, .04, .4, 180);
      A.toast('Sentada na carteira. Ande para levantar.');
    });
    U.tick(dt => {
      const perto = U.dist(DX, DZ) < 2.2;
      tampo.material.opacity += (((S.flashOn && perto) || sentada ? .9 : 0) - tampo.material.opacity) * Math.min(1, dt * 3);
      if (!sentada) return;
      if (U.dist(sx, sz) > .35 || S.hidden || S.dead) { levantar(fase > 0 && fase < 3); return; }
      sT += dt;
      if (fase === 0 && sT > 5) { fase = 1; esperaT = 0; U.leg('uma voz de freira, em eco, fazendo a chamada'); A.sub('celeste', '(eco) Chamada. Respondam "presente".'); }
      if (fase === 1) {
        esperaT += dt; const k = Math.floor(esperaT / Math.max(.6, 1.5 - esperaT * .06));
        if (k > chamK && k < NOMES.length) {
          chamK = k; const nm = NOMES[k], calado = /Davi|Ana|Tomé|Duarte/.test(nm);
          A.sub('celeste', `(eco) ${nm}?`); if (!calado) U.depois(.5, () => U.leg('"presente", baixinho, de carteiras vazias', false)); else U.depois(.6, () => U.leg('ninguém responde'));
        }
        if (k >= NOMES.length) { fase = 2; esperaT = 0; chamK = -1; vIni = performance.now(); A.sub('celeste', `(eco) ...Moraes, Lia${U.nome() ? ` — ${U.nome()}` : ''}?`); A.toast('V responde. Ou fique calada.'); U.medo(8); }
      } else if (fase === 2) {
        esperaT += dt;
        const jj = U.J(); if (jj && jj.keys.KeyV) window.__sg4V = performance.now();
        if ((window.__sg4V || 0) > vIni) {
          fase = 3; A.sub('lia', 'Presente.'); U.apagarLanterna(3); U.escurecer(2600, .9); A.emitNoise(sx, sz, 28, true); U.medo(25);
          U.depois(1.4, () => A.sub('celeste', '(eco) Não tem ninguém com esse nome matriculado.'));
          U.depois(3, () => { A.sub('lia', 'Regra cinco. Não responder. Eu respondi.'); levantar(false); });
          U.leg('a sala inteira apaga');
        } else if (esperaT > 5) {
          fase = 3; A.sub('celeste', '(eco) Ausente.'); U.SOM.giz({ x: -6.2, y: 1.6, z: -5 }, 4);
          U.depois(1.5, () => {
            S.flags.sg4_carteira = true; S.inv.kits++; A.SFX.pegar(); U.SOM.rangido({ x: DX, y: .7, z: DZ }, .05, .5, 320);
            A.conquista('l4_ausente'); U.achou('carteira', 'A tampa da carteira abriu sozinha: um curativo e um uniforme do seu tamanho de criança');
            A.sub('lia', '(sussurro) Falta abonada. Quinze anos de falta.'); levantar(false);
          });
        }
      }
    });
  }

  // ---------------- 7. O CUBÍCULO DO INSPETOR: a portinhola embaixo da escada
  {
    const PX = -1.66, PZ = -12.75;
    const port = box(.04, .78, .62, MAT.porta, PX, .4, PZ);
    box(.03, .05, .05, MAT.bronze, PX + .02, .45, PZ + .22, A.W.grupo, false);
    const fresta = plano(.02, .76, new THREE.MeshBasicMaterial({ color: 0xffb060, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending }), PX + .03, .4, PZ - .3, Math.PI / 2);
    let cantigaT = 6;
    A.interact(port, () => {
      if (S.flags.sg4_cubiculo) return 'A portinhola do Moacir. Você não quer abrir de novo.';
      return A.P.crouch ? '<b>E</b>Abrir a portinhola embaixo da escada' : 'Uma portinhola baixa embaixo da escada. Só agachada.';
    }, () => {
      if (S.flags.sg4_cubiculo) return;
      if (!A.P.crouch) { A.toast('Agache para caber.'); return; }
      if (U.perigo()) { A.toast('Ele está perto demais. Agora não.'); return; }
      U.SOM.rangido({ x: PX, y: .4, z: PZ }, .05, .6, 210); A.emitNoise(PX, PZ, 3, true);
      const ls = lsLer(), noites = (ls.noites || []).slice(0, Math.max(0, S.flags.sg4_noite ?? 0)).slice(-9);
      const linhas = [
        { quem: 'lia', texto: 'Um vão do tamanho de uma criança. Uma cama de ferro curta demais. Orelhas desenhadas a carvão nas paredes, dezenas, todas viradas pra porta.' },
        { quem: 'lia', texto: 'Uma caixa de sapato escrita "ACHADOS".' }
      ];
      if (noites.length) linhas.push({ quem: 'lia', texto: `Crachás de visitante. ${noites.length === 1 ? 'Um' : noites.length}. ${noites.map(n => `"${n.d} — ${n.m ? `caiu ${n.m} ${n.m === 1 ? 'vez' : 'vezes'}` : 'não caiu'}"`).join(', ')}.` }, { quem: 'lia', texto: 'São as minhas outras noites. Ele guarda tudo que a gente perde aqui.' });
      else linhas.push({ quem: 'lia', texto: 'Dentro, um crachá de visitante em branco, com o carimbo de hoje. Esperando o meu nome.' }, { quem: 'lia', texto: 'Ele guarda tudo que a gente perde aqui. Até o que a gente ainda não perdeu.' });
      linhas.push({ quem: 'lia', texto: 'E um rolo de esparadrapo. Esse eu levo.' });
      A.dialogo(linhas, () => { S.flags.sg4_cubiculo = true; S.inv.kits++; A.SFX.pegar(); A.conquista('l4_cubiculo'); U.achou('cubiculo', 'O cubículo onde o Inspetor guarda os achados'); });
    });
    U.tick(dt => {
      const d = U.dist(PX, PZ); if (d > 9 || S.flags.sg4_cubiculo) { fresta.material.opacity = 0; return; }
      const luz = S.flashOn && U.olhando(PX, .4, PZ, .85, 5);
      fresta.material.opacity += ((luz ? .5 : 0) - fresta.material.opacity) * Math.min(1, dt * 4);
      cantigaT -= dt; if (cantigaT <= 0) { cantigaT = 14 + Math.random() * 8; if (d < 5 && (luz || A.P.crouch)) { U.SOM.cantiga({ x: PX, y: .4, z: PZ }, .035); U.leg('uma cantiga de ninar, de dentro da escada', false); } }
    });
  }

  // ---------------- 8. A COLA DA PROVA: o estojo de lata do Davi
  {
    const EX = -16.9, EY = .745, EZ = -3.45;
    const est = box(.22, .045, .07, new THREE.MeshStandardMaterial({ color: 0x3a5a7a, metalness: .5, roughness: .4, emissive: 0x0a1420, emissiveIntensity: .7 }), EX, EY, EZ, A.W.grupo, false);
    A.interact(est, () => `<b>E</b>Abrir o estojo de lata "D.M."${S.flags.sg4_cola ? '<small style="opacity:.6"> (lido)</small>' : ''}`, () => {
      const primeira = !S.flags.sg4_cola; S.flags.sg4_cola = true; U.SOM.clique({ x: EX, y: EY, z: EZ }, .08); A.SFX.papel();
      A.dialogo([
        { quem: 'lia', texto: 'Dentro do estojo, uma cola de prova dobrada em mil. Tabuada do sete, a capital da Bahia...' },
        { quem: 'lia', texto: 'E bem pequeno, no canto: "quadro das chaves: {q} — pro caso de esquecer".' },
        { quem: 'lia', texto: '(ri baixinho, sem querer) Ele colava até nisso.' }
      ], () => { if (primeira) U.achou('cola', 'A cola do Davi tem o código do quadro de chaves'); });
      if (primeira) A.emitNoise(EX, EZ, 2, true);
    });
  }

  // ---------------- 9. A CHAVE DEBAIXO DO VASO (pátio): entrar sem arrombar
  {
    const VX = 2.75, VZ = .95;
    const vaso = new THREE.Group(); vaso.position.set(VX, 0, VZ); A.W.grupo.add(vaso);
    cyl(.2, .15, .38, new THREE.MeshStandardMaterial({ color: 0x7a3d24, roughness: .9 }), 0, .19, 0, 10, vaso);
    for (let i = 0; i < 7; i++) { const f = box(.03, .35, .1, new THREE.MeshStandardMaterial({ color: 0x4a4028, roughness: 1 }), Math.cos(i) * .06, .5, Math.sin(i) * .06, vaso, false); f.rotation.z = Math.cos(i * 2.3) * .6; f.rotation.x = Math.sin(i * 1.7) * .5; }
    A.addCollider(VX - .22, VX + .22, VZ - .22, VZ + .22);
    A.interact(vaso, () => {
      if (S.flags.sg4_chaveVaso) return 'Um vaso de samambaia seca. Era aqui que ficava a chave.';
      if (S.done.forcar_porta) return 'Um vaso de samambaia seca, rachado.';
      return A.P.crouch ? '<b>E</b>Levantar o vaso de samambaia seca' : 'Um vaso de samambaia seca do lado da porta. Agachada dá pra levantar.';
    }, () => {
      if (S.flags.sg4_chaveVaso || S.done.forcar_porta) return;
      if (!A.P.crouch) { A.toast('Agache para levantar o vaso.'); return; }
      S.flags.sg4_chaveVaso = true; vaso.position.x += .3; U.SOM.baque({ x: VX, y: .1, z: VZ }, .15); A.SFX.pegar();
      A.sub('lia', '(sussurro) Uma chave enferrujada. A mãe também escondia a chave aqui.');
      A.toast('Chave da porta principal: dá pra entrar sem arrombar.');
    });
    const itMain = A.W.inter.find(i => i.porta && i.porta.id === 'main');
    if (itMain) {
      // o internato.js redefine hold/ruido da porta como getters: delegamos a eles em vez de sobrescrever
      const lb = itMain.label;
      const dH = Object.getOwnPropertyDescriptor(itMain, 'hold'), dR = Object.getOwnPropertyDescriptor(itMain, 'ruido'), dS = Object.getOwnPropertyDescriptor(itMain, 'som');
      const orig = d => d ? (d.get ? d.get() : d.value) : undefined;
      const comChave = () => S.flags.sg4_chaveVaso && !itMain.porta.open;
      itMain.label = () => comChave() ? '<b>E</b>Destrancar a porta principal com a chave do vaso' : lb();
      Object.defineProperty(itMain, 'hold', { configurable: true, get: () => comChave() ? 1.2 : orig(dH) });
      Object.defineProperty(itMain, 'ruido', { configurable: true, get: () => comChave() ? 1.5 : orig(dR) });
      Object.defineProperty(itMain, 'som', { configurable: true, get: () => comChave() ? undefined : orig(dS) });
      U.tick(() => {
        if (S.flags.sg4_chaveVaso && itMain.porta.open && !S.flags.sg4_vasoEntrou) {
          S.flags.sg4_vasoEntrou = true;
          if (S.timers.insp > 0) S.timers.insp += 45; // ninguém acordou com o arrombamento
          A.conquista('l4_vaso'); U.achou('vaso', 'Entrou pela porta da frente, sem barulho');
          U.depois(1.5, () => A.sub('lia', 'Sem barulho. Visita educada. Ele ainda não sabe que eu cheguei.'));
        }
      });
    }
  }

  // ---------------- 10. A CAIXA "ACHADOS" DA RECEPÇÃO: um objeto diferente a cada noite
  {
    const AX = 4.35, AZ = -.7;
    const cx = A.prop(.5, .34, .4, new THREE.MeshStandardMaterial({ color: 0x8a6a40, roughness: 1 }), AX, .17, AZ);
    U.decal(U.tela(128, 40, (g, w, h) => { g.clearRect(0, 0, w, h); g.fillStyle = 'rgba(30,20,10,.85)'; g.font = 'bold 20px Georgia'; g.textAlign = 'center'; g.fillText('ACHADOS', w / 2, 27); }), .34, .1, AX, .22, AZ + .205, 0);
    const OBJ = [
      ['um ioiô de madeira com "T.R." riscado', 'O cordão ainda tem um nó de criança.', () => U.medo(-20)],
      ['uma presilha de borboleta, de lata', 'Da Ana. Ela prendia a franja pra contar sem trapacear.', () => U.vida(10)],
      ['um apito de metal amassado', 'Não apita mais. Ainda bem.', () => { S.inv.garrafas++; A.toast('Embaixo do apito, uma garrafa vazia. G joga longe.'); }],
      ['uns óculos sem uma das lentes', 'Do Davi. Eu reconheceria esses óculos em qualquer lugar.', () => U.medo(-35)],
      ['um isqueiro com "J.C. — 1986" gravado', 'Do repórter que entrou aqui em 86. Ainda tem gás.', () => U.vida(5)],
      ['um walkman sem fita, de 1988', 'Alguém veio procurar alguma coisa aqui, como eu. Não voltou pra buscar.', () => {}],
      ['um relógio digital parado em 21:00', 'Todos os relógios daqui param na mesma hora.', () => {}],
      ['um terço de contas soltas', 'Da Irmã Celeste. As contas fazem barulho na mão.', () => U.medo(-15)],
      ['um bilhete dobrado: "volta pra casa"', 'Letra de criança. Endereçado a ninguém.', () => U.vida(5)]
    ];
    const d = new Date(), semente = d.getFullYear() * 372 + d.getMonth() * 31 + d.getDate();
    const idx = S.flags.sg4_achadoIdx ?? (S.flags.sg4_achadoIdx = semente % OBJ.length);
    A.interact(cx, () => S.flags.sg4_achado ? `A caixa "ACHADOS". Hoje tinha ${OBJ[idx][0]}.` : '<b>E</b>Mexer na caixa "ACHADOS"', () => {
      if (S.flags.sg4_achado) return;
      S.flags.sg4_achado = true; U.SOM.pano({ x: AX, y: .3, z: AZ }, .06); A.SFX.pegar();
      const [o, f, efeito] = OBJ[idx]; efeito();
      const linhas = [{ quem: 'lia', texto: `Achados de visitantes que não voltaram. Por cima de tudo, ${o}.` }, { quem: 'lia', texto: f }];
      if ((S.mortes || 0) > 0) { S.inv.pilhas++; linhas.push({ quem: 'lia', texto: 'E embaixo... uma lanterna igual à minha. Ainda quente. Com pilha.' }, { quem: 'lia', texto: '(sussurro) De qual das outras noites ela é?' }); }
      A.dialogo(linhas, () => U.achou('achados', 'O achado de hoje na caixa da recepção'));
    });
  }

  // ---------------- 11. A LÂMPADA QUE NÃO ACENDEU (refeitório) e o ladrilho solto embaixo dela
  {
    const LX = -22.6, LZ = -18.2;
    const pivo = new THREE.Group(); pivo.position.set(LX, 3.2, LZ); A.W.grupo.add(pivo);
    box(.01, .6, .01, MAT.preto, 0, -.3, 0, pivo, false);
    const bulbo = new THREE.Mesh(new THREE.SphereGeometry(.075, 8, 6), new THREE.MeshStandardMaterial({ color: 0x2a2620, emissive: 0xff2010, emissiveIntensity: 0 })); bulbo.position.y = -.66; pivo.add(bulbo);
    const luzV = new THREE.PointLight(0xff2010, 0, 6, 1.6); luzV.position.set(LX, 2.4, LZ); A.W.grupo.add(luzV);
    const lad = plano(.42, .42, new THREE.MeshStandardMaterial({ color: 0x8a8070, roughness: .7 }), LX, .006, LZ, 0); lad.rotation.x = -Math.PI / 2; lad.rotation.z = .08;
    let olharT = 0, acesa = 0, balanco = 0;
    A.interact(lad, () => S.flags.sg4_ladrilho ? 'O ladrilho solto. Embaixo, só poeira.' : !S.flags.energia ? 'Um ladrilho meio solto.' : A.P.crouch ? '<b>E</b>Levantar o ladrilho embaixo da lâmpada apagada' : 'Um ladrilho solto bem embaixo da única lâmpada que não acendeu. Agachada dá pra levantar.', () => {
      if (S.flags.sg4_ladrilho || !S.flags.energia) return;
      if (!A.P.crouch) { A.toast('Agache para levantar o ladrilho.'); return; }
      S.flags.sg4_ladrilho = true; lad.position.y = .05; lad.rotation.x = -1.2; U.SOM.baque({ x: LX, y: .1, z: LZ }, .12); A.emitNoise(LX, LZ, 3, true);
      U.achou('lampada', 'Embaixo do ladrilho, um envelope de fotos'); A.lerNota('sg4_lampada');
    });
    U.tick(dt => {
      if (U.dist(LX, LZ) > 16) return;
      balanco += dt; pivo.rotation.x = Math.sin(balanco * 1.1) * .12; pivo.rotation.z = Math.sin(balanco * .7) * .06;
      if (acesa > 0) { acesa -= dt; const k = acesa > .3 ? 1 : acesa / .3; bulbo.material.emissiveIntensity = 2.5 * k; luzV.intensity = 2.2 * k; return; }
      bulbo.material.emissiveIntensity = 0; luzV.intensity = 0;
      if (!S.flags.energia || S.flags.sg4_lampVermelha) return;
      if (U.dist(LX, LZ) < 4 && U.dirY() > .35 && U.olhando(LX, 2.55, LZ, .9, 5)) {
        olharT += dt;
        if (olharT > 3) {
          S.flags.sg4_lampVermelha = true; acesa = .8; U.medo(14); U.tremor(.1); U.vib(120);
          U.SOM.tom({ x: LX, y: 2.5, z: LZ }, 'sawtooth', 120, 60, .5, .08); U.leg('a lâmpada acende vermelha e estoura de volta no escuro');
          U.depois(1.3, () => A.sub('lia', '(ofegante) Ela acendeu. Vermelha. Bem em cima de... do ladrilho.'));
        }
      } else olharT = Math.max(0, olharT - dt * .5);
    });
  }

  // ---------------- 12. O BEBEDOURO DE FERRO (corredor oeste)
  {
    const BX = -9.2, BZ = -10.33;
    const g = new THREE.Group(); g.position.set(BX, 0, BZ); A.W.grupo.add(g);
    box(.46, .82, .34, MAT.metal, 0, .41, 0, g); box(.5, .08, .38, MAT.ferrugem, 0, .86, 0, g);
    cyl(.012, .012, .1, MAT.bronze, .05, .95, .02, 6, g);
    A.addCollider(BX - .25, BX + .25, BZ - .19, BZ + .19);
    A.interact(g, () => (S.flags.sg4_beber || 0) >= 2 ? 'O bebedouro só pinga.' : '<b>E</b>Beber água no bebedouro', () => {
      const n = S.flags.sg4_beber = (S.flags.sg4_beber || 0) + 1;
      if (n === 1) {
        U.SOM.agua({ x: BX, y: .9, z: BZ }, .12, 1.2, 600); U.escurecer(1100, .8); U.tremor(.04); A.emitNoise(BX, BZ, 4, true);
        U.leg('água preta, com fuligem; a Lia tosse'); A.sub('lia', '(tossindo) Preta. Cinza... a água tem gosto de cinza.');
      } else if (n === 2) {
        U.SOM.agua({ x: BX, y: .9, z: BZ }, .1, 1.4, 1100); U.vida(5); A.toast('Agora a água vem limpa. +5 de vida.');
        U.achou('bebedouro', 'O bebedouro limpou depois do primeiro gole');
      }
    });
  }

  // ---------------- 13. A PEDRA FUNDAMENTAL (recepção): a placa só se lê com a lanterna em cima
  {
    const PX = 5.885, PY = 1.15, PZ = -10.0;
    const tb = U.tela(256, 128, (g, w, h) => { g.fillStyle = '#4a5a40'; g.fillRect(0, 0, w, h); for (let i = 0; i < 900; i++) { g.fillStyle = `rgba(${90 + Math.random() * 60},${130 + Math.random() * 60},${100 + Math.random() * 40},${Math.random() * .4})`; g.fillRect(Math.random() * w, Math.random() * h, 3, 3); } g.strokeStyle = 'rgba(30,25,15,.6)'; g.lineWidth = 6; g.strokeRect(4, 4, w - 8, h - 8); });
    plano(.5, .25, new THREE.MeshStandardMaterial({ map: tb, roughness: .5, metalness: .6 }), PX, PY, PZ, -Math.PI / 2);
    const tt = U.tela(256, 128, (g, w, h) => { g.clearRect(0, 0, w, h); g.fillStyle = 'rgba(230,190,110,.95)'; g.textAlign = 'center'; g.font = 'bold 20px Georgia'; g.fillText('PEDRA FUNDAMENTAL — 1931', w / 2, 38); g.font = '15px Georgia'; g.fillText('Eng. J. P. Famelli', w / 2, 70); g.fillText('Mestre de obras: C.', w / 2, 94); });
    const texto = plano(.5, .25, new THREE.MeshBasicMaterial({ map: tt, transparent: true, opacity: 0, depthWrite: false }), PX - .005, PY, PZ, -Math.PI / 2);
    A.interact(texto, () => texto.material.opacity > .5 ? `<b>E</b>Ler a placa de bronze${S.flags.sg4_pedra ? '<small style="opacity:.6"> (lido)</small>' : ''}` : 'Uma placa de bronze coberta de azinhavre. Com a lanterna bem em cima dá pra ler.', () => {
      if (texto.material.opacity <= .5) return;
      const p = !S.flags.sg4_pedra; S.flags.sg4_pedra = true;
      A.dialogo([{ quem: 'lia', texto: '"Pedra fundamental — 1931. Eng. J. P. Famelli. Mestre de obras: C."' }, { quem: 'lia', texto: 'Quem constrói um lugar desses dorme bem?' }], () => { if (p) { A.conquista('l4_pedra'); U.achou('pedra', 'A placa de quem construiu o internato'); } });
    });
    U.tick(dt => { const v = S.flashOn && U.dist(PX, PZ) < 1.8 && U.olhando(PX, PY, PZ, .9, 2.2); texto.material.opacity += ((v ? 1 : 0) - texto.material.opacity) * Math.min(1, dt * 3); });
  }

  // ---------------- 14. SOPA DE LETRINHAS (cozinha): as letras se arrumam sob a lanterna
  {
    const SX = -31.45, SY = .98, SZ = -25.55;
    const g = new THREE.Group(); g.position.set(SX, SY, SZ); A.W.grupo.add(g);
    cyl(.16, .14, .16, MAT.metal, 0, .08, 0, 12, g); for (const s of [-1, 1]) box(.07, .02, .02, MAT.preto, s * .19, .13, 0, g, false);
    const FRASE = 'ATRÁS DO FOGÃO'.split('');
    const letras = FRASE.map((c, i) => ({ c, x: 20 + Math.random() * 88, y: 20 + Math.random() * 88, a: Math.random() * 6, tx: 14 + (i % 7) * 15, ty: i < 7 ? 52 : 80 }));
    let arrumar = 0, mexida = !!S.flags.sg4_sopaMexida, viu = !!S.flags.sg4_sopaViu;
    const desenhar = (gg, w, h) => {
      gg.fillStyle = '#6a4a22'; gg.beginPath(); gg.arc(w / 2, h / 2, 62, 0, 7); gg.fill(); gg.fillStyle = 'rgba(160,110,50,.5)'; gg.beginPath(); gg.arc(w / 2, h / 2, 54, 0, 7); gg.fill();
      gg.fillStyle = '#e8d8a8'; gg.font = 'bold 13px Arial'; gg.textAlign = 'center';
      for (const l of letras) { const k = mexida ? 0 : arrumar; const x = l.x + (l.tx - l.x) * k, y = l.y + (l.ty - l.y) * k; gg.save(); gg.translate(x, y); gg.rotate(l.a * (1 - k)); gg.fillText(l.c, 0, 0); gg.restore(); }
    };
    const ts = U.tela(128, 128, desenhar);
    const sup = plano(.27, .27, new THREE.MeshStandardMaterial({ map: ts, roughness: .3, emissive: 0x201408, emissiveIntensity: .4, transparent: true }), 0, .145, 0, 0, g); sup.rotation.x = -Math.PI / 2;
    let redT = 0;
    A.interact(g, () => mexida ? 'Uma panela de sopa fria. As letrinhas viraram uma papa.' : viu ? '<b>E</b>Mexer a sopa fria' : 'Uma panela de sopa de letrinhas, fria há quinze anos.', () => {
      if (mexida) return;
      mexida = true; S.flags.sg4_sopaMexida = true; ts.redesenhar(desenhar); U.SOM.agua({ x: SX, y: SY, z: SZ }, .05, .6, 700);
      A.sub('lia', viu ? 'Pronto. Desfiz. Ainda bem que eu li antes.' : 'Pronto. Estraguei.');
    });
    const atras = U.caixaInvisivel(.3, .5, .5, -31.98, .5, -25.5);
    A.interact(atras, () => S.flags.sg4_atrasFogao ? '' : viu ? '<b>E</b>Enfiar a mão atrás do fogão' : '', () => {
      if (S.flags.sg4_atrasFogao || !viu) return;
      S.flags.sg4_atrasFogao = true; S.inv.pilhas++; A.SFX.pegar(); U.SOM.pano({ x: -32, y: .5, z: -25.5 }, .05);
      A.dialogo([{ quem: 'lia', texto: 'Atrás do fogão, embrulhado num pano de prato: uma pilha e um bilhete.' }, { quem: 'lia', texto: '"Pros meninos da Hora. Comam quieto e não contem pra ninguém. — Dona Cida, da cozinha."' }], () => U.achou('sopa', 'A sopa de letrinhas mandou olhar atrás do fogão'));
    });
    U.tick(dt => {
      if (mexida || U.dist(SX, SZ) > 4) return;
      const luz = S.flashOn && U.dist(SX, SZ) < 1.8 && U.olhando(SX, SY + .1, SZ, .85, 2.4);
      const alvo = luz || viu ? 1 : 0, ant = arrumar;
      arrumar += (alvo - arrumar) * Math.min(1, dt * (luz ? .45 : .2));
      if (Math.abs(arrumar - ant) > .002) { redT -= dt; if (redT <= 0) { redT = .12; ts.redesenhar(desenhar); } }
      if (!viu && arrumar > .92) { viu = true; S.flags.sg4_sopaViu = true; ts.redesenhar(desenhar); U.leg('as letrinhas da sopa se arrumam sozinhas'); A.sub('lia', '(sussurro) "Atrás do fogão". As letrinhas... se arrumaram.'); U.medo(6); }
    });
  }

  // ---------------- 15. O DOCE DE LEITE DO DAVI (despensa): "DAVI — NÃO MEXE"
  {
    const DX = -25.55, DZ = -33.35;
    A.prop(.5, .44, .5, MAT.madeiraEsc, DX, .22, DZ);
    const pote = new THREE.Group(); pote.position.set(DX, .44, DZ); A.W.grupo.add(pote);
    cyl(.07, .07, .13, new THREE.MeshStandardMaterial({ color: 0xb8a070, transparent: true, opacity: .8, roughness: .2, emissive: 0x281c08, emissiveIntensity: .7 }), 0, .065, 0, 10, pote);
    cyl(.075, .075, .02, MAT.metal, 0, .14, 0, 10, pote);
    box(.1, .03, .002, new THREE.MeshStandardMaterial({ color: 0xd8cca0, emissive: 0x302810, emissiveIntensity: .6 }), 0, .07, .071, pote, false);
    const it = A.interact(pote, () => S.flags.sg4_doce ? 'O pote do Davi. Raspado até o fundo.' : '<b>E</b>Comer o doce de leite escondido "DAVI — NÃO MEXE"', () => {
      if (S.flags.sg4_doce) return;
      S.flags.sg4_doce = true; U.vida(10); S.fear = 0; A.emitNoise(DX, DZ, 3, true); A.SFX.pegar();
      A.sub('lia', '(ri baixinho, pela primeira vez na noite) Ele escondia em todo lugar.'); U.leg('a Lia ri baixinho');
      A.conquista('l4_doce'); U.achou('doce', 'O doce de leite do Davi (+10 de vida, medo zerado)');
    });
    it.hold = 1.5; it.pode = () => !S.flags.sg4_doce;
  }

  // ---------------- 16. O CALENDÁRIO DA COZINHA: riscar o dia 15 de março de 1979
  {
    const CX = -33.88, CY = 1.6, CZ = -23.4;
    const ls0 = lsLer();
    const desenhar = (g, w, h) => {
      g.fillStyle = '#d8ccaa'; g.fillRect(0, 0, w, h); g.fillStyle = '#7a1a12'; g.fillRect(0, 0, w, 30); g.fillStyle = '#f0e6c8'; g.font = 'bold 18px Georgia'; g.textAlign = 'center'; g.fillText('MARÇO 1979', w / 2, 22);
      g.font = '13px Georgia'; g.fillStyle = '#2a2018';
      for (let d = 1; d <= 31; d++) {
        const c = (d + 3) % 7, r = Math.floor((d + 3) / 7), x = 12 + c * 33, y = 50 + r * 26;
        g.fillText(String(d), x + 8, y + 4);
        if (d <= 14 || (d === 15 && (S.flags.sg4_dia15 || ls0.dia15))) { g.strokeStyle = d === 15 ? (S.flags.sg4_dia15 ? 'rgba(220,220,210,.95)' : 'rgba(40,40,120,.9)') : 'rgba(40,20,10,.8)'; g.lineWidth = 2; g.beginPath(); g.moveTo(x - 2, y - 10); g.lineTo(x + 18, y + 8); g.stroke(); }
      }
      if (ls0.dia15 && !S.flags.sg4_dia15) { g.fillStyle = 'rgba(40,40,120,.85)'; g.font = 'italic 12px Georgia'; g.textAlign = 'left'; g.fillText('alguém riscou o 15 de novo', 10, h - 8); }
    };
    const tc = U.tela(256, 220, desenhar);
    const cal = plano(.42, .36, new THREE.MeshStandardMaterial({ map: tc, roughness: 1, emissive: 0x2a2418, emissiveIntensity: .4 }), CX, CY, CZ, Math.PI / 2);
    A.interact(cal, () => S.flags.sg4_dia15 ? 'O calendário de março de 1979. O dia 15 está riscado a giz.' : '<b>E</b>Riscar o dia 15 no calendário da cozinha', () => {
      if (S.flags.sg4_dia15) return;
      S.flags.sg4_dia15 = true; tc.redesenhar(desenhar); U.SOM.giz({ x: CX, y: CY, z: CZ }, 1);
      for (const L of A.W.lampadas) if (L.ligada) { L.luz.intensity = 0; L.bulbo.material.emissiveIntensity = 0; }
      U.depois(.35, () => A.syncLuzes()); U.leg('as luzes da ala piscam uma vez');
      const l = lsLer(); l.dia15 = true; lsGravar(l);
      U.depois(1, () => A.sub('lia', 'Quinze de março. O dia seguinte que nunca veio pra eles.'));
      A.conquista('l4_dia'); U.achou('calendario', 'Você riscou o dia que nunca veio');
    });
  }

  // ---------------- 17. O PASSA-PRATOS DA COPA: trocar alguma coisa com quem está do outro lado
  {
    const QX = -5.72, QY = 1.3, QZ = -25.2;
    const alvoP = U.caixaInvisivel(.22, .55, .66, QX, QY, QZ);
    let pendente = S.flags.sg4_passaPend || null, prontoT = 0;
    const capOk = () => !S.flags['sg4_passa' + S.chapter];
    A.interact(alvoP, () => {
      if (pendente) return prontoT > 0 ? 'A portinhola está fechada. Alguém mexe do outro lado.' : '<b>E</b>Abrir a portinhola do passa-pratos';
      if (!capOk()) return 'O passa-pratos. Por hoje, chega de troca.';
      if (S.inv.garrafas > 0 || S.inv.pilhas > 0 || S.inv.kits > 0) return `<b>E</b>Deixar ${S.inv.garrafas > 0 ? 'uma garrafa' : S.inv.pilhas > 0 ? 'uma pilha' : 'um curativo'} no passa-pratos`;
      return 'O passa-pratos da copa. Dá pra deixar alguma coisa ali.';
    }, () => {
      if (pendente) {
        if (prontoT > 0) return;
        const t = pendente; pendente = null; delete S.flags.sg4_passaPend; S.flags['sg4_passa' + S.chapter] = true;
        U.SOM.rangido({ x: QX, y: QY, z: QZ }, .05, .4, 280); A.SFX.pegar();
        if (t === 'garrafa') { S.inv.kits++; A.dialogo([{ quem: 'lia', texto: 'A garrafa sumiu. No lugar, um curativo e um bilhete de criança: "pra sua mão".' }]); }
        else if (t === 'pilha') { S.inv.pilhas += 2; A.dialogo([{ quem: 'lia', texto: 'Duas pilhas velhas, meio gastas, no lugar da minha. Bilhete: "as nossas duram mais".' }]); }
        else { U.vida(5); A.dialogo([{ quem: 'lia', texto: 'Um pão duro, de 1979, embrulhado num guardanapo. "Hora do lanche."' }, { quem: 'lia', texto: '(chorando baixinho) ...eu como. Eu como, tá bom.' }]); }
        A.conquista('l4_lanche'); U.achou('passa', 'Alguém do outro lado do passa-pratos fez uma troca');
        return;
      }
      if (!capOk()) return;
      const t = S.inv.garrafas > 0 ? 'garrafa' : S.inv.pilhas > 0 ? 'pilha' : S.inv.kits > 0 ? 'kit' : null; if (!t) return;
      if (t === 'garrafa') S.inv.garrafas--; else if (t === 'pilha') S.inv.pilhas--; else S.inv.kits--;
      pendente = t; S.flags.sg4_passaPend = t; prontoT = 7;
      U.SOM.baque({ x: QX, y: QY, z: QZ }, .2); A.toast('Você fechou a portinhola. Espere um pouco.');
      U.depois(3, () => { U.SOM.pano({ x: QX - .6, y: QY, z: QZ }, .05); U.leg('alguém mexe do outro lado do passa-pratos'); });
    });
    U.tick(dt => { if (prontoT > 0) prontoT -= dt; });
  }

  // ---------------- 18. O POÇO DO PÁTIO: ele devolve
  {
    const WX = -5.6, WZ = 12.4;
    const g = new THREE.Group(); g.position.set(WX, 0, WZ); A.W.grupo.add(g);
    const pedra = A.texMat('pedra', 1.5, .5, { side: THREE.DoubleSide });
    const anel = new THREE.Mesh(new THREE.CylinderGeometry(.78, .82, .78, 16, 1, true), pedra); anel.position.y = .39; g.add(anel);
    const borda = new THREE.Mesh(new THREE.TorusGeometry(.79, .07, 6, 18), pedra); borda.rotation.x = Math.PI / 2; borda.position.y = .78; g.add(borda);
    const fundo = new THREE.Mesh(new THREE.CircleGeometry(.75, 16), new THREE.MeshBasicMaterial({ color: 0x020202 })); fundo.rotation.x = -Math.PI / 2; fundo.position.y = .55; g.add(fundo);
    for (let i = 0; i < 5; i++) box(.03, .03, 1.5, MAT.ferrugem, -.6 + i * .3, .8, 0, g, false);
    for (const s of [-1, 1]) box(.07, 1.6, .07, MAT.madeiraEsc, s * .85, .8, 0, g, false);
    box(1.8, .07, .07, MAT.madeiraEsc, 0, 1.6, 0, g, false);
    A.addCollider(WX - .85, WX + .85, WZ - .85, WZ + .85);
    const mao = new THREE.Group(); mao.position.set(WX + .55, .8, WZ - .3); mao.visible = false; A.W.grupo.add(mao);
    for (let i = 0; i < 4; i++) box(.018, .06, .018, new THREE.MeshStandardMaterial({ color: 0x9a8a7a, roughness: 1 }), -.03 + i * .02, .03, 0, mao, false);
    const voa = MK => { const m = A.MK.garrafa(); m.visible = false; A.W.grupo.add(m); return m; };
    const garr = voa();
    let ocupado = false, vooT = -1;
    A.interact(g, () => {
      if (ocupado) return '';
      const n = S.flags.sg4_poco || 0;
      if (n >= 3) return 'O poço. Lá no fundo, alguém respira.';
      return S.inv.garrafas > 0 ? '<b>E</b>Jogar uma garrafa no poço' : 'Um poço com grade. Lá no fundo, água. Dá pra jogar alguma coisa.';
    }, () => {
      const n0 = S.flags.sg4_poco || 0; if (ocupado || n0 >= 3 || S.inv.garrafas <= 0) return;
      S.inv.garrafas--; ocupado = true; const n = S.flags.sg4_poco = n0 + 1;
      U.SOM.vidro({ x: WX, y: .8, z: WZ }, .05); U.leg('a garrafa cai, cai...');
      U.depois(4, () => { U.SOM.splash({ x: WX, y: -2, z: WZ }, .3); U.leg('splash, lá embaixo'); });
      if (n === 3) {
        U.depois(9, () => { ocupado = false; mao.visible = true; U.medo(18); U.leg('uma mão pequena na borda do poço'); U.depois(.5, () => { mao.visible = false; }); U.depois(2, () => { A.sub('voz', '(de dentro do poço) Liiia...'); U.leg('a voz chama de dentro do poço'); }); });
        return;
      }
      U.depois(13, () => {
        garr.position.set(WX, .9, WZ); garr.visible = true; vooT = 0; U.SOM.splash({ x: WX, y: -1, z: WZ }, .15); U.leg('alguma coisa sobe voando de dentro do poço');
        if (n === 2) { A.SFX.risada(WX, WZ); U.leg('uma risada de menino sobe pelo poço'); }
      });
    });
    U.tick(dt => {
      if (vooT < 0) return;
      vooT += dt; const k = Math.min(1, vooT / .9);
      const ax = A.P.pos.x + Math.sin(A.P.yaw) * -.5, az = A.P.pos.z + Math.cos(A.P.yaw) * -.5;
      garr.position.set(WX + (ax - WX) * k, .9 + Math.sin(k * Math.PI) * 1.6 - k * .85, WZ + (az - WZ) * k); garr.rotation.z += dt * 9;
      if (k >= 1) {
        vooT = -1; garr.visible = false; ocupado = false; U.SOM.vidro(garr.position, .07); S.inv.garrafas++; A.SFX.pegar();
        if ((S.flags.sg4_poco || 0) === 1) { A.dialogo([{ quem: 'lia', texto: 'A garrafa voltou. Inteira, molhada, com um bilhete enrolado dentro.' }, { quem: 'tome', texto: '"Não joga lixo aqui. — T."' }]); A.conquista('l4_desejo'); U.achou('poco', 'O poço devolveu a garrafa'); }
        else A.sub('lia', '(sussurro) Voltou de novo. Ele está brincando comigo.');
      }
    });
  }

  // ---------------- 19. O PEDIDO DA COZINHA NA COPA: a pista do botão zero do monta-cargas
  {
    const tp = U.tela(160, 112, (g, w, h) => papel(g, w, h, ['PEDIDO DA COZINHA', 'pro andar de antes:', 'raspa o botão sem', 'número e aperta.', 'não conta pra Irmã.'], { fonte: 'italic 15px Georgia', lh: 19, x: 10, y: 20 }));
    const ped = plano(.24, .17, new THREE.MeshStandardMaterial({ map: tp, roughness: 1, emissive: 0x2a2418, emissiveIntensity: .5 }), 1.6, 1.55, -20.115, Math.PI);
    ped.userData.leitura = { t: 'Pedido da cozinha: "pro andar de antes: raspa o botão sem número e aperta. Não conta pra Irmã."' };
  }

  return montar(ganchos);
}

// a medalha esquenta antes da Procissão chegar (vale em qualquer mapa do internato)
export function medalha(A, S, U) {
  let fase = null;
  U.tick(() => {
    const P = window.__jogo && window.__jogo.PROC; if (!P) return;
    const f = P.fase || null;
    if (f && !fase && S.flags.sg4_medalha) { U.vib(200); U.leg('a medalha esquenta na sua mão'); A.toast('A medalha de São Lázaro esquentou: a fila está vindo. Esconda-se.'); }
    fase = f;
  });
}

// junta os ganchos do módulo num objeto só (juntar() encadeia com os do mapa)
export function montar(g) {
  const out = {};
  if (g.sync.length) out.sync = () => { for (const f of g.sync) try { f(); } catch (e) { console.warn('internato-segredos', e); } };
  if (g.entrar.length) out.entrar = cap => { for (const f of g.entrar) try { f(cap); } catch (e) { console.warn('internato-segredos', e); } };
  // a energia do mapa passa pela chave geral (apagão de propósito)
  if (g.energia) out._energia = g.energia;
  return out;
}
