// LORE DO SUBTERRÂNEO — Lote 2: túneis (Cap. IV), cemitério e capela (Cap. V)
// Lugares que contam a história sozinhos: marcas, objetos, vozes nos canos, segredos.
// Ganchos chamados por tuneis() e cemiterio() em mapas.js. Tudo procedural (canvas + WebAudio do motor).
import { juntar } from './internato.js';

const R = window.ROTEIRO;
const LS = {
  get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
};
const BENED_KEY = 'hora-silencio-benedito';
const CONQ_KEY = 'hora-silencio-v2-conq';

// ---------------------------------------------------------------------
// Texto novo (entra no roteiro na carga do módulo, antes do motor copiar)
// ---------------------------------------------------------------------
const NOTAS = [
  { id: 'sl_reg', secreta: true, titulo: 'Regulamento do asilo, 1932', texto: 'ASILO-COLÔNIA SÃO LÁZARO — REGULAMENTO INTERNO (1932)\n\nI. Às nove horas toca-se o sino. Os internos recolhem-se em silêncio.\nII. Não se fala nos corredores depois do sino.\nIII. Quem for encontrado fora do leito será recolhido pelo inspetor.\nIV. Os que choram são levados ao pavilhão de baixo, para não acordar os outros.\n\n(a lápis, na margem, letra antiga) o sino é pra gente dormir. não é pra acordar.' },
  { id: 'sl_transf', secreta: true, titulo: 'Livro de alunos transferidos', texto: 'ALUNOS TRANSFERIDOS — sem destino anotado\n\n1951 — 1 · 1952 — 1 · 1955 — 1 · 1958 — 2 · 1962 — 1\n1965 — 1 · 1966 — 1 · 1971 — 2 · 1975 — 1 · 1979 — 3\n\nTodos em março. Todos depois das nove.\n(na última linha, a caneta) "Transferência" é a palavra que o bispo prefere. — A.' },
  { id: 'sl_cartas', secreta: true, titulo: 'Cartas devolvidas', texto: 'Uma caixa de sapato cheia de envelopes fechados. Remetente: Helena Moraes. Destinatário: Davi Moraes.\nO primeiro é de abril de 1979. O último, de dezembro de 1985.\nTodos têm o mesmo carimbo vermelho: DEVOLVER — FUGITIVO.\n\nNo de cima, a letra de uma menina de catorze anos, colada no verso:\n"davi, a mãe chora toda noite. volta. — lia"' },
  { id: 'sl_caixa', secreta: true, titulo: 'Livro-caixa da diretoria', texto: 'Doação da diocese ........................ recebido\nPedreiro — sala seca — pago em espécie .... pago\nArgolas de ferro (cisterna) .............. pago\nQuerosene — 2 latas — 14/03 .............. pago\nCadeado reforçado — capela — 14/03 ....... pago\nTijolos — 1 milheiro — 20/03 ............. pago\n\n(a última linha está rasurada até rasgar o papel)' },
  { id: 'sl_fichas', secreta: true, titulo: 'Fichas carimbadas', texto: 'Três fichas de matrícula, cada uma com um carimbo vermelho: SILENCIADO.\nANA LUÍSA PRADO — 9 anos — "conta alto".\nTOMÉ RIBEIRO — 10 anos — "rodinhas".\nDAVI MORAES — 12 anos — "líder".\n\nPresa na do Davi, um bilhete: "Irmã mais velha fez perguntas em 1979. Não responder. — A."' },
  { id: 'sl_bispo', secreta: true, titulo: 'Resposta do bispo', texto: 'Albano,\nqueime os livros. Que ninguém fale disso.\nAs famílias receberão a notícia da fuga. A capela fica lacrada.\nO senhor sabe melhor do que ninguém: o silêncio salva.\n\n(no pé da página, a mão do diretor) salva quem?' },
  { id: 'sl_arquivo', secreta: true, titulo: 'Arquivo morto — folha de resumo', texto: 'CAIXAS 1931 a 1979 — fichas recolhidas do pavilhão de baixo.\nCarimbo mais usado: FUGITIVO.\n\nFugitivos desde a fundação: 41.\nProcurados pela polícia: 0.\nDevolvidos às famílias: 0.' },
  { id: 'sl_tijolos', secreta: true, titulo: 'Carta dentro do caixão', texto: 'O caixão do diretor está cheio de tijolos. Por cima deles, um envelope com o selo da diocese:\n\n"Faça como combinamos. O senhor morreu em 1980.\nUma casa de repouso em Minas o recebe com outro nome.\nQue Deus tenha piedade de nós dois."' }
];
for (const n of NOTAS) if (!R.notas.some(x => x.id === n.id)) R.notas.push(n);

const CONQS = [
  { id: 'sl_velho', nome: 'Mais Velho que o Fogo', desc: 'Leia o regulamento de 1932 nos túneis.', secreta: true },
  { id: 'sl_benedito', nome: 'Ninguém Lembra', desc: 'Prenda o ar no armário certo e ouça quem não tem nome.', secreta: true },
  { id: 'sl_chave', nome: 'Devolvi a Chave', desc: 'Devolva a chave do portão ao Seu Joaquim.', secreta: true },
  { id: 'sl_cova', nome: 'Cova Vazia', desc: 'Descubra o que tem no túmulo do diretor.', secreta: true },
  { id: 'sl_orgao', nome: 'A Água Cantou', desc: 'Toque no órgão da capela as notas que os canos cantaram.', secreta: true }
];
for (const c of CONQS) if (!R.conquistas.some(x => x.id === c.id)) R.conquistas.push(c);

// a anotação do pedreiro ganha o que ele viu na obra
{ const n9 = R.notas.find(n => n.id === 'n9');
  if (n9 && !n9.texto.includes('argolas')) n9.texto += '\nO diretor pediu argolas de ferro na cisterna, na altura de uma criança. Disse que era pra bomba.\nO padre mandou fechar a ala velha com tijolo em 51. Não perguntei por quê.\nAs crianças carregavam o balde de cimento. O diretor disse que era educação.'; }
// lápides antigas: todas as crianças morreram em março; a da Irmã Celeste foi corrigida à unha
{ const mes = { 'JOÃO, 7 ANOS': 1955, 'LUIZ, 11 ANOS': 1952, 'MARIA DAS DORES': 1958, 'ROSA, 8 ANOS': 1965 };
  for (const l of R.lapides) {
    if (mes[l.nome] && l.epitafio && !l.epitafio.includes('março')) l.epitafio += ` Embaixo, quase apagado: março de ${mes[l.nome]}.`;
    if (l.nome === 'IRMÃ CELESTE' && l.epitafio && !l.epitafio.includes('trancada')) l.epitafio += ' Embaixo do nome, “transferida” foi riscado. Por cima, à unha: trancada.';
  } }

// ---------------------------------------------------------------------
// utilidades por carga de mapa
// ---------------------------------------------------------------------
function base(A, S) {
  const { THREE } = A;
  const agenda = [];
  const depois = (seg, f) => agenda.push({ t: seg, f });
  A.W.tick.push(dt => { for (let i = agenda.length - 1; i >= 0; i--) { agenda[i].t -= dt; if (agenda[i].t <= 0) { const f = agenda[i].f; agenda.splice(i, 1); try { f(); } catch (e) { console.warn(e); } } } });
  const _v = new THREE.Vector3(), _f = new THREE.Vector3();
  const olhando = (x, y, z, cos = .85, alc = 10) => {
    _v.set(x, y, z).sub(A.camera.position); const d = _v.length(); if (d > alc || d < .01) return false;
    A.camera.getWorldDirection(_f); return _f.dot(_v.multiplyScalar(1 / d)) > cos;
  };
  const dist = (x, z) => Math.hypot(A.P.pos.x - x, A.P.pos.z - z);
  const luz = () => !!S.flashOn && A.flash.intensity > 2;
  const iluminado = (x, y, z, alc = 6, cos = .9) => luz() && olhando(x, y, z, cos, alc);
  const tex = (w, h, draw) => A.canvasTex(w, h, (g, W, H) => { g.clearRect(0, 0, W, H); draw(g, W, H); });
  const decal = (t, w, h, x, y, z, ry = 0, o = {}) => {
    const m = new THREE.MeshStandardMaterial({ map: t, transparent: true, depthWrite: false, roughness: 1, polygonOffset: true, polygonOffsetFactor: -2, ...(o.mat || {}) });
    const p = A.plano(w, h, m, x, y, z, ry, o.parent || A.W.grupo); if (o.rx) p.rotation.x = o.rx; return p;
  };
  const chao = (t, w, h, x, z, rz = 0, y = .012, o = {}) => { const p = decal(t, w, h, x, y, z, 0, o); p.rotation.set(-Math.PI / 2, 0, rz); return p; };
  const uma = (id, f) => { if (S.flags[id]) return false; S.flags[id] = true; f && f(); return true; };
  const fala = (txt, quem = 'lia') => A.sub(quem, txt);
  const rotulo = (obj, txt, act) => A.interact(obj, typeof txt === 'function' ? txt : () => txt, act || (() => {}));
  const noMapa = id => A.W.mapa === id && !A.S.dead;
  return { THREE, depois, olhando, dist, luz, iluminado, tex, decal, chao, uma, fala, rotulo, noMapa };
}

// sons próprios (mesmo AudioContext do motor)
function sonsL(A) {
  const au = A.audio, ok = () => au && au.AC && au.AC.state !== 'closed';
  const p3 = p => p ? { x: p.x, y: p.y ?? 1, z: p.z } : null;
  return {
    batidas(pos, n = 3, vol = .35, abaf = 520, gap = .34) {
      if (!ok()) return; const t0 = au.AC.currentTime;
      for (let i = 0; i < n; i++) { const t = t0 + i * gap * (.85 + Math.random() * .3); const g = au.saida(p3(pos), .5); au.burst(t, .08, 'lowpass', abaf, 1.4, g, 0); au.env(g, t, .003, vol, .11); const g2 = au.saida(p3(pos), .4); au.osc('sine', 72 + Math.random() * 18, t, .16, g2); au.env(g2, t, .003, vol * .8, .13); }
    },
    chiado(pos, dur = 1.4, vol = .1) { if (!ok()) return; const t = au.AC.currentTime, g = au.saida(p3(pos), .2); au.burst(t, dur, 'bandpass', 2600, .6, g); au.env(g, t, .05, vol, dur * .9); },
    respiro(pos, vol = .22) { if (!ok()) return; const t = au.AC.currentTime; for (const [k, d] of [[0, 1.2], [1.7, 1.4]]) { const g = au.saida(p3(pos), .3); const f = au.burst(t + k, d, 'lowpass', 700, 2, g); f.frequency.linearRampToValueAtTime(380, t + k + d); au.env(g, t + k, .5, vol, d * .7); } },
    latido(pos) { if (!ok()) return; const t0 = au.AC.currentTime; for (const k of [0, .26]) { const t = t0 + k, g = au.saida(p3(pos), .6); const f = au.burst(t, .14, 'bandpass', 640 - k * 300, 3, g, 0); f.frequency.exponentialRampToValueAtTime(380, t + .12); au.env(g, t, .006, .45, .13); const g2 = au.saida(p3(pos), .5); const o = au.osc('sawtooth', 310 - k * 80, t, .14, g2); o.frequency.exponentialRampToValueAtTime(170, t + .12); au.env(g2, t, .006, .12, .12); } },
    nota(f, pos, vol = .45, dur = 2.4, tipo = 'triangle') { if (!ok()) return; const t = au.AC.currentTime; for (const [m, a] of [[1, 1], [2, .4], [4, .12]]) { const g = au.saida(p3(pos), .9); au.osc(m === 1 ? tipo : 'sine', f * m, t, dur + .2, g); au.env(g, t, .04, vol * a, dur); } },
    cantiga(pos, vol = .2) { // disco riscado: a mesma frase de ninar, torta, com chiado
      if (!ok()) return 0; const t0 = au.AC.currentTime, frase = [392, 330, 392, 330, 294, 330, 262, 0, 392, 330, 392, 440, 392, 330, 294, 0];
      for (let r = 0; r < 3; r++) frase.forEach((f, i) => { if (!f) return; const t = t0 + (r * 16 + i) * .42, g = au.saida(p3(pos), .7); const o = au.osc('triangle', f * (1 + (Math.random() - .5) * .012) * (r === 2 ? .97 : 1), t, .5, g); au.env(g, t, .02, vol, .45); });
      const g = au.saida(p3(pos), .3); au.burst(t0, 20, 'highpass', 3500, .5, g); au.env(g, t0, .2, .05, 19.5);
      return 20;
    },
    chuva(pos, dur = 2, vol = .12) { if (!ok()) return; const t = au.AC.currentTime, g = au.saida(p3(pos), .3); au.burst(t, dur, 'highpass', 2200, .4, g); g.gain.setValueAtTime(.0001, t); g.gain.linearRampToValueAtTime(vol, t + .3); g.gain.setValueAtTime(vol, t + dur - .4); g.gain.linearRampToValueAtTime(.0001, t + dur); },
    sussurro(pos, vol = .16, dur = 1.4) { if (!ok()) return; const t = au.AC.currentTime; for (let i = 0; i < 4; i++) { const g = au.saida(p3(pos), .5); const f = au.burst(t + i * dur / 4, dur / 3, 'bandpass', 1800 + Math.random() * 1600, 4, g); au.env(g, t + i * dur / 4, .04, vol, dur / 3); } }
  };
}

// ---------------------------------------------------------------------
// desenhos em canvas
// ---------------------------------------------------------------------
function mao(g, x, y, s, a, cor) {
  g.save(); g.translate(x, y); g.rotate(a); g.scale(s, s); g.fillStyle = cor;
  g.beginPath(); g.ellipse(0, 0, 9, 11, 0, 0, 7); g.fill();
  for (const [dx, dy, rx, ry, r] of [[-8, -13, 2.6, 7.5, -.35], [-3, -17, 2.8, 8.5, -.1], [2, -18, 2.8, 9, .05], [7, -15, 2.6, 7.5, .25], [11, -2, 2.6, 6.5, .9]]) { g.beginPath(); g.ellipse(dx, dy, rx, ry, r, 0, 7); g.fill(); }
  g.restore();
}
function giz(g, linhas, { cor = 'rgba(232,228,214,.9)', tam = 34, x, y0 = 60, passo = 46, alinhar = 'center', fonte = '"Special Elite",monospace' } = {}) {
  g.fillStyle = cor; g.textAlign = alinhar; g.font = `${tam}px ${fonte}`;
  linhas.forEach((l, i) => { g.save(); g.translate(x ?? g.canvas.width / 2, y0 + i * passo); g.rotate((Math.random() - .5) * .07); g.fillText(l, 0, 0); g.globalAlpha = .35; g.fillText(l, 1.5, 1); g.restore(); });
}
function tracos(g, x, y, n, h = 16, esp = 4, cor = 'rgba(226,222,206,.8)') { // contagem em grupos de cinco
  g.strokeStyle = cor; g.lineWidth = 1.3;
  for (let i = 0; i < Math.min(4, n); i++) { g.beginPath(); g.moveTo(x + i * esp + Math.random(), y); g.lineTo(x + i * esp + Math.random() * 1.5, y + h); g.stroke(); }
  if (n >= 5) { g.beginPath(); g.moveTo(x - 2, y + h * .8); g.lineTo(x + 3 * esp + 3, y + h * .2); g.stroke(); }
}
function bonequinho(g, x, y, s, cor, semRosto) {
  g.strokeStyle = cor; g.fillStyle = cor; g.lineWidth = 2.4 * s;
  g.beginPath(); g.arc(x, y, 7 * s, 0, 7); semRosto ? g.fill() : g.stroke();
  if (!semRosto) { g.fillRect(x - 3 * s, y - 1.5 * s, 1.5 * s, 1.5 * s); g.fillRect(x + 1.5 * s, y - 1.5 * s, 1.5 * s, 1.5 * s); }
  g.beginPath(); g.moveTo(x, y + 7 * s); g.lineTo(x, y + 26 * s); g.moveTo(x - 9 * s, y + 14 * s); g.lineTo(x + 9 * s, y + 14 * s); g.moveTo(x, y + 26 * s); g.lineTo(x - 7 * s, y + 38 * s); g.moveTo(x, y + 26 * s); g.lineTo(x + 7 * s, y + 38 * s); g.stroke();
}

// =====================================================================
// TÚNEIS (Capítulo IV)
// =====================================================================
let morreuNosTuneis = false, mortesTun = null; // vale para a noite inteira (sobrevive às recargas de checkpoint)

export function tuneis(A, S, def, ctx) {
  const U = base(A, S), som = sonsL(A), { THREE } = U, { MAT, box, cyl, prop } = A;
  const nivel = ctx.nivel, O = ctx.O, B = ctx.B;
  const X = {}; const ticks = [];
  const tick = f => ticks.push(f);
  if (S.chapter < 4 || mortesTun == null || S.mortes < mortesTun) mortesTun = S.mortes;
  morreuNosTuneis = S.mortes > mortesTun;

  // ---------- ENTRADA: a placa de fundação e o canto do pedreiro
  { const bronze = U.tex(512, 256, (g, w, h) => {
      g.fillStyle = '#3d4a36'; g.fillRect(8, 8, w - 16, h - 16); g.strokeStyle = '#7d8a62'; g.lineWidth = 6; g.strokeRect(16, 16, w - 32, h - 32);
      for (let i = 0; i < 260; i++) { g.fillStyle = `rgba(${90 + Math.random() * 60 | 0},${150 + Math.random() * 60 | 0},${120 + Math.random() * 40 | 0},${Math.random() * .4})`; g.fillRect(Math.random() * w, Math.random() * h, 4, 4); }
      g.fillStyle = '#b8b080'; g.textAlign = 'center'; g.font = 'bold 34px Georgia'; g.fillText('ASILO-COLÔNIA SÃO LÁZARO', w / 2, 92); g.font = '26px Georgia'; g.fillText('1931 · PAVILHÃO DE ISOLAMENTO', w / 2, 140);
    });
    const nova = A.textoTex([{ t: 'INTERNATO SÃO LÁZARO — 1962', tam: 30 }], { w: 512, h: 96, fundo: '#2a2218', cor: '#a89a72', manchas: 2 });
    const pl = U.decal(bronze, 1, .5, -3.86, 1.75, -2.6, Math.PI / 2, { mat: { metalness: .4, roughness: .6, transparent: false } });
    U.decal(nova, .86, .16, -3.84, 1.62, -2.6, Math.PI / 2, { mat: { transparent: false } });
    for (const dz of [-.4, .4]) box(.02, .02, .02, MAT.ferrugem, -3.84, 1.62, -2.6 + dz, A.W.grupo, false);
    U.rotulo(pl, () => '<b>E</b>Ler a placa de bronze', () => {
      A.toast('“ASILO-COLÔNIA SÃO LÁZARO — 1931 · PAVILHÃO DE ISOLAMENTO”. Pregada por cima, mais nova: “INTERNATO SÃO LÁZARO — 1962”.');
      U.uma('sl_placa', () => U.depois(2.5, () => U.fala('Isolamento. Antes de ser internato isso era asilo de doente. Esses túneis não eram drenagem... era por onde levavam quem ninguém podia ver.')));
    });
  }
  { // canto do pedreiro: marmita, capacete, rádio mudo e a lamparina ainda acesa
    const cx = 3.2, cz = -1.4;
    prop(.7, .45, .55, MAT.madeiraEsc, cx, .225, cz);
    cyl(.09, .09, .1, MAT.metal, cx - .18, .5, cz, 10);
    const cap = new THREE.Mesh(new THREE.SphereGeometry(.13, 10, 6, 0, Math.PI * 2, 0, 1.5), new THREE.MeshStandardMaterial({ color: 0x8a6a1a, roughness: .7 })); cap.position.set(cx + .12, .46, cz + .12); A.W.grupo.add(cap);
    box(.16, .1, .07, MAT.preto, cx + .18, .5, cz - .14);
    const lamp = new THREE.Group(); lamp.position.set(cx - .05, .45, cz - .12); A.W.grupo.add(lamp);
    cyl(.05, .06, .05, MAT.ferrugem, 0, .025, 0, 8, lamp); cyl(.035, .035, .12, MAT.vidro, 0, .11, 0, 8, lamp);
    const chama = new THREE.Mesh(new THREE.SphereGeometry(.014, 6, 5), new THREE.MeshBasicMaterial({ color: 0xffb050 })); chama.scale.y = 2; chama.position.y = .11; lamp.add(chama);
    const luz = new THREE.PointLight(0xffa040, 0, 4.5, 1.8); luz.position.set(0, .25, 0); lamp.add(luz);
    const planta = U.tex(512, 384, (g, w, h) => {
      g.strokeStyle = 'rgba(20,18,16,.85)'; g.lineWidth = 7; g.lineCap = 'round';
      const L = (a, b, c, d) => { g.beginPath(); g.moveTo(a, b); g.lineTo(c, d); g.stroke(); };
      L(256, 20, 256, 200); L(120, 120, 392, 120); L(60, 100, 60, 150); L(452, 100, 452, 150); L(256, 200, 256, 300); L(256, 240, 420, 240); L(256, 240, 100, 240);
      g.strokeRect(210, 180, 92, 70); g.strokeRect(220, 300, 72, 56);
      g.lineWidth = 5; L(232, 312, 280, 344); L(280, 312, 232, 344);
      g.fillStyle = 'rgba(20,18,16,.85)'; g.font = '22px "Special Elite",monospace'; g.textAlign = 'left'; g.fillText('NÃO EXISTE', 300, 342); g.fillText('saída', 424, 232); g.fillText('V1', 30, 92); g.fillText('V2', 440, 92); g.fillText('V3', 214, 172);
    });
    const pp = U.decal(planta, 1.3, .98, 3.86, 1.5, -3.6, -Math.PI / 2);
    U.rotulo(pp, '<b>E</b>Olhar a planta riscada a carvão', () => {
      A.toast('A planta dos túneis, a carvão: a cisterna no meio, uma válvula em cada câmara e a terceira na cisterna. A saída fica a leste. Embaixo do túnel norte, um X: “NÃO EXISTE”.');
      U.uma('sl_planta', () => U.depois(2, () => U.fala('O pedreiro sabia da sala. Fez de conta que não.')));
    });
    const it = U.rotulo(lamp, () => S.flags.sl_lampApagada ? 'A lamparina do pedreiro, apagada.' : '<b>E</b>Apagar a lamparina do pedreiro', () => {
      if (S.flags.sl_lampApagada) return; S.flags.sl_lampApagada = true; A.SFX.clique();
      U.depois(.8, () => U.fala('Pronto. Agora ele não vê o brilho na água.')); U.depois(4.5, () => U.fala('...ele é cego, Lia.'));
    });
    tick(t => { const on = !S.flags.sl_lampApagada; chama.visible = on; luz.intensity = on ? 1.1 + Math.sin(t * 7) * .12 + Math.sin(t * 17) * .06 : 0; });
  }

  // ---------- TÚNEL CENTRAL: mãos no cimento, a carteira do Moacir, nomes riscados, o eco nos canos
  { const t = U.tex(256, 256, (g) => { for (let i = 0; i < 9; i++) mao(g, 30 + Math.random() * 196, 120 + Math.random() * 110, .9 + Math.random() * .4, Math.random() - .5, 'rgba(30,26,20,.55)'); mao(g, 128, 150, 2.1, .15, 'rgba(18,14,10,.6)'); });
    const d = U.decal(t, .9, .9, -1.87, 1, -9.5, Math.PI / 2);
    U.rotulo(d, 'Mãos de criança marcadas no cimento. Uma mão grande por cima, apertando.'); }
  const mesa = { x: -1.25, z: -22.6 };
  { box(.62, .06, .45, MAT.madeiraEsc, mesa.x, .58, mesa.z); for (const [dx, dz] of [[-.27, -.18], [.27, -.18], [-.27, .18], [.27, .18]]) box(.04, .56, .04, MAT.madeiraEsc, mesa.x + dx, .28, mesa.z + dz);
    A.addCollider(mesa.x - .32, mesa.x + .32, mesa.z - .24, mesa.z + .24);
    const ent = A.textoTex([{ t: 'MOACIR, 9 ANOS', tam: 40 }], { w: 256, h: 64, fundo: '#3a2a1a', cor: '#1a120a', manchas: 2 });
    const tampo = A.plano(.5, .12, new THREE.MeshStandardMaterial({ map: ent, roughness: 1 }), mesa.x, .615, mesa.z + .05); tampo.rotation.x = -Math.PI / 2;
    const sold = new THREE.Group(); sold.position.set(mesa.x + .12, .61, mesa.z - .08); A.W.grupo.add(sold);
    const lata = new THREE.MeshStandardMaterial({ color: 0x6a1a14, metalness: .6, roughness: .5, emissive: 0x1a0604, emissiveIntensity: .5 });
    cyl(.018, .022, .07, lata, 0, .035, 0, 6, sold); const cab = new THREE.Mesh(new THREE.SphereGeometry(.016, 6, 5), lata); cab.position.y = .085; sold.add(cab); cyl(.005, .005, .09, MAT.metal, .025, .07, 0, 4, sold);
    U.rotulo(sold, 'Uma carteira velha. Entalhado no tampo: “MOACIR, 9 ANOS”. Em cima, um soldadinho de lata.');
    U.rotulo(tampo, 'Uma carteira velha. Entalhado no tampo: “MOACIR, 9 ANOS”. Em cima, um soldadinho de lata.');
    tick(() => { // iluminar o soldadinho com ele perto: a única fala humana dele
      const M = A.M; if (S.flags.sl_soldado || !M.ativo || M.state === 'caca') return;
      if (Math.hypot(M.pos.x - mesa.x, M.pos.z - mesa.z) < 8 && U.iluminado(mesa.x, .65, mesa.z, 7, .93)) {
        S.flags.sl_soldado = true; M.wait = Math.max(M.wait, 4.5); A.SFX.suspiro({ x: M.pos.x, y: 1.6, z: M.pos.z });
        U.depois(.6, () => A.sub('inspetor', '(baixinho, quase com voz de menino) ...esse era meu.'));
        U.depois(4.6, () => { if (!A.M.ativo) return; const alvos = [[0, -3], [-30, -18], [30, -18], [0, -48]]; let m = alvos[0], md = -1; for (const a of alvos) { const d = U.dist(a[0], a[1]); if (d > md) { md = d; m = a; } } A.planejar(A.M, m[0], m[1]); });
      }
    });
  }
  { const t = U.tex(512, 256, (g) => { const ns = ['Luiz 1950', 'João 55', 'M. das Dores 58', 'Rosa 64', 'Bené 75', 'Davi 79']; ns.forEach((n, i) => { g.save(); g.translate(40 + (i % 3) * 160, 70 + Math.floor(i / 3) * 110 + Math.random() * 20); g.rotate((Math.random() - .5) * .3); g.fillStyle = 'rgba(214,206,186,.7)'; g.font = `${24 + Math.random() * 8}px "Special Elite",monospace`; g.fillText(n, 0, 0); g.restore(); }); });
    const d = U.decal(t, 1.6, .8, -1.87, .85, -26.2, Math.PI / 2);
    U.rotulo(d, 'Nomes riscados com pedra, na altura de uma criança: Luiz 1950, João 55, Rosa 64... e Davi 79.');
    tick(() => { if (!S.flags.sl_davi79 && U.iluminado(-1.9, .7, -25.7, 3.5, .95)) { S.flags.sl_davi79 = true; const P = A.P; for (let i = 0; i < 4; i++) U.depois(i * .35, () => O.criar(P.pos.x, nivel(), P.pos.z, .6 + i * .5, .25, 1.6)); A.SFX.sussurros(.8); } });
  }
  { // o eco preso nos canos: segurar E e ficar parada na água para ouvir 1979
    const cano = cyl(.07, .07, 2.6, MAT.ferrugem, 1.8, 1.3, -24.6, 8); box(.2, .1, .1, MAT.ferrugem, 1.8, 1.9, -24.6);
    const falas = [[.12, 'moacir', '(no cano, abafado) Eles vão tocar o sino hoje, diretor. Eu ouvi pelo cano do dormitório.'], [.4, 'diretor', '(no cano, abafado) Então tranca a capela. Por fora.'], [.66, 'moacir', '(no cano, abafado) ...e as crianças?'], [.9, 'diretor', '(no cano, abafado) Silêncio, Moacir. É pra isso que você serve.']];
    let idx = 0;
    const it = U.rotulo(cano, () => S.flags.sl_eco ? 'O cano está mudo agora.' : '<b>E</b>Encostar o ouvido no cano (segure; você fica parada na água)', () => { S.flags.sl_eco = true; U.depois(1.5, () => U.fala('Ele mandou trancar. Com eles lá dentro.')); });
    it.hold = 8; it.guarda = true; it.ruido = 0; it.pode = () => !S.flags.sl_eco;
    tick(() => {
      if (S.flags.sl_eco || idx >= falas.length) return;
      const k = (it.progresso || 0) / it.hold, segura = A.perf() - (it.seguradoT ?? -9) < .1;
      if (segura && k >= falas[idx][0]) { const [, q, txt] = falas[idx++]; A.sub(q, txt); som.chiado({ x: 1.8, y: 1.5, z: -24.6 }, 1.6, .06); }
    });
  }

  // ---------- TÚNEL OESTE: a ala velha emparedada e a lanterninha do Davi
  { const t = U.tex(512, 448, (g, w, h) => {
      for (let y = 0; y < h; y += 32) for (let x = (y / 32 % 2) * 32 - 32; x < w; x += 64) { g.fillStyle = `rgb(${120 + Math.random() * 30 | 0},${58 + Math.random() * 18 | 0},${44 + Math.random() * 12 | 0})`; g.fillRect(x + 2, y + 2, 60, 28); }
      g.fillStyle = 'rgba(60,56,50,.9)'; g.font = 'bold 54px Georgia'; g.textAlign = 'center'; g.fillText('1951', w / 2, 120);
      for (let i = 0; i < 7; i++) mao(g, 80 + Math.random() * 360, 250 + Math.random() * 150, 1.2, Math.random() - .5, 'rgba(26,22,16,.5)');
      g.fillStyle = '#050403'; g.fillRect(300, 330, 90, 16);
      g.fillStyle = 'rgba(120,40,30,.9)'; g.beginPath(); g.ellipse(340, 339, 20, 5, 0, 0, 7); g.fill();
    });
    const d = U.decal(t, 2.2, 1.9, -12, 1.05, -19.87, 0, { mat: { transparent: false } });
    U.rotulo(d, 'Tijolos mais novos que o resto, com “1951” no cimento. Mãozinhas por cima. Pela fresta, um sapato de criança.', () => U.uma('sl_tijolo51', () => U.fala('Fecharam a ala velha com alguém do outro lado?')));
  }
  { const nx = -20, nz = -16.32;
    box(.4, .04, .22, MAT.madeiraEsc, nx, .95, nz + .1);
    const lt = new THREE.Group(); lt.position.set(nx, .99, nz + .1); A.W.grupo.add(lt);
    const verm = new THREE.MeshStandardMaterial({ color: 0xa01810, emissive: 0x300404, emissiveIntensity: .6, roughness: .5 });
    const c = cyl(.025, .03, .14, verm, 0, .03, 0, 8, lt); c.rotation.z = Math.PI / 2;
    const lente = cyl(.032, .032, .01, new THREE.MeshStandardMaterial({ color: 0xffe0b0, emissive: 0xffb070, emissiveIntensity: 1 }), .075, .03, 0, 8, lt); lente.rotation.z = Math.PI / 2;
    const luz = new THREE.PointLight(0xffb070, .55, 2.6, 2); luz.position.set(.2, .05, 0); lt.add(luz);
    if (S.flags.sl_lanterninha) lt.visible = false;
    U.rotulo(lt, () => '<b>E</b>Pegar a lanterninha de plástico vermelho (ainda acesa)', () => {
      if (S.flags.sl_lanterninha) return; S.flags.sl_lanterninha = true; lt.visible = false; A.SFX.pegar(); S.inv.pilhas++;
      A.toast('A pilha dentro é nova. Você guardou (R para trocar).');
      U.depois(1.2, () => U.fala('Pilha nova. Ele ainda vem aqui.'));
      U.depois(3.4, () => { if (!U.noMapa('tuneis')) return; const P = A.P, x = P.pos.x + Math.sin(P.yaw) * 2.2, z = P.pos.z + Math.cos(P.yaw) * 2.2; A.SFX.anaPasso({ x, y: .2, z }); O.criar(x, nivel(), z, .5, .2, 1.4); });
    });
  }

  // ---------- TÚNEL LESTE: a cela de castigo dos anos 50
  { const t = U.tex(512, 384, (g, w, h) => {
      g.fillStyle = '#0a0907'; g.fillRect(0, 0, w, h);
      for (let k = 0; k < 3; k++) { const x = 60 + k * 150; g.strokeStyle = 'rgba(110,80,60,.85)'; g.lineWidth = 6; g.strokeRect(x, 220, 110, 60); for (let i = 1; i < 6; i++) { g.beginPath(); g.moveTo(x + i * 18, 220); g.lineTo(x + i * 18, 180); g.stroke(); }
        g.strokeStyle = 'rgba(70,50,30,.9)'; g.lineWidth = 4; for (const dy of [236, 262]) { g.beginPath(); g.moveTo(x - 4, dy); g.quadraticCurveTo(x + 55, dy + 14, x + 114, dy); g.stroke(); }
        g.fillStyle = 'rgba(190,180,150,.85)'; g.fillRect(x + 30, 292, 50, 18); g.fillStyle = '#1a1612'; g.font = 'bold 13px Georgia'; g.textAlign = 'center'; g.fillText(['JOÃO', 'ROSA', 'LUIZ'][k], x + 55, 306); }
      const gr = g.createRadialGradient(w / 2, h / 2, 40, w / 2, h / 2, 300); gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(0,0,0,.85)'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    });
    const d = U.decal(t, 2.2, 1.65, 18, 1.15, -19.88, 0, { mat: { transparent: false } });
    for (let i = 0; i < 9; i++) cyl(.018, .018, 1.7, MAT.ferrugem, 17 + i * .25, 1.15, -19.8, 6);
    for (const y of [.32, 1.98]) box(2.2, .05, .05, MAT.ferrugem, 18, y, -19.8);
    let vistas = 0, ultimaT = -99;
    U.rotulo(d, 'Uma grade enferrujada. Lá dentro, berços de ferro com correias. Plaquinhas: JOÃO, ROSA, LUIZ.');
    tick(t => { if (vistas >= 2 || !U.iluminado(18, 1.1, -19.9, 6, .9)) return; if (t - ultimaT > 18) { vistas++; ultimaT = t; if (vistas === 2) U.fala('Eram crianças. Eram berços.'); } });
  }

  // ---------- CÂMARA OESTE: o regulamento de 1932 e o acampamento das crianças
  { const fr = box(.62, .8, .04, MAT.madeiraEsc, -30, 1.7, -12.1, A.W.grupo, false);
    const n = A.ITENS.nota('sl_reg', { x: -30, y: 1.7, z: -12.14 }, true); n.obj.rotation.y = Math.PI;
    const est = U.tex(128, 128, g => { for (let i = 0; i < 40; i++) { g.fillStyle = `rgba(40,60,30,${Math.random() * .4})`; g.beginPath(); g.arc(Math.random() * 128, Math.random() * 128, 4 + Math.random() * 12, 0, 7); g.fill(); } });
    U.decal(est, .6, .78, -30, 1.7, -12.15, Math.PI); void fr; }
  { const px = -29.6, pz = -23.25;
    prop(2.6, .5, .9, MAT.madeiraEsc, px, .25, pz);
    const azul = new THREE.MeshStandardMaterial({ color: 0x2a3a52, roughness: 1 }), xadrez = new THREE.MeshStandardMaterial({ color: 0x5a2a22, roughness: 1 });
    [azul, xadrez, MAT.colchao].forEach((m, i) => box(.75, .07, .8, m, px - .85 + i * .85, .535, pz, A.W.grupo, false));
    for (let i = 0; i < 5; i++) { const h = .02 + Math.random() * .05; cyl(.03, .045, h, MAT.vela, px - 1.1 + Math.random() * 2.2, .57 + h / 2, pz + .3, 6); }
    for (let i = 0; i < 3; i++) cyl(.04, .04, .1, MAT.metal, px + .9 - i * .1, .62, pz - .3, 8);
    const gibi = A.plano(.2, .26, new THREE.MeshStandardMaterial({ map: A.textoTex([{ t: 'GIBI', tam: 60 }], { w: 128, h: 160, fundo: '#7a5a2a', cor: '#2a1a0a', manchas: 4 }) }), px + .4, .575, pz + .1); gibi.rotation.x = -Math.PI / 2; gibi.rotation.z = .5;
    const mapa = A.plano(.32, .24, new THREE.MeshStandardMaterial({ map: U.tex(256, 192, g => { g.fillStyle = '#cbbf9c'; g.fillRect(0, 0, 256, 192); g.strokeStyle = '#3a3a3a'; g.lineWidth = 3; g.beginPath(); g.moveTo(20, 170); g.lineTo(128, 120); g.lineTo(128, 50); g.lineTo(220, 30); g.stroke(); g.font = '20px "Special Elite",monospace'; g.fillStyle = '#2a2a2a'; g.fillText('sino', 196, 24); g.fillText('a irmã vai abrir', 14, 70); g.fillText('às nove', 30, 94); }) }), px - .3, .576, pz + .25); mapa.rotation.x = -Math.PI / 2; mapa.rotation.z = -.2;
    const cal = U.decal(U.tex(256, 256, g => { g.fillStyle = '#d8ccb0'; g.fillRect(8, 8, 240, 240); g.fillStyle = '#3a2a1a'; g.font = 'bold 26px Georgia'; g.textAlign = 'center'; g.fillText('MARÇO 1979', 128, 44); g.font = '16px Georgia'; for (let d = 1; d <= 31; d++) { const c = (d + 3) % 7, r = Math.floor((d + 3) / 7); const x = 30 + c * 32, y = 80 + r * 32; g.fillStyle = '#3a2a1a'; g.fillText(String(d), x, y); if (d <= 14) { g.strokeStyle = 'rgba(120,20,10,.8)'; g.lineWidth = 2; g.beginPath(); g.moveTo(x - 10, y - 14); g.lineTo(x + 10, y + 4); g.stroke(); } } }), .5, .5, -27.6, 1.4, -23.87, 0, { mat: { transparent: false } });
    const lamb = () => U.uma('sl_acamp', () => U.depois(1, () => U.fala('Eles moravam aqui embaixo. Se escondendo da Hora.')));
    U.rotulo(gibi, 'Três colchonetes, velas derretidas, latas vazias e gibis molhados.', lamb);
    U.rotulo(mapa, 'Um mapa a lápis: o túnel até a capela. Escrito: “a irmã vai abrir às nove”.', lamb);
    U.rotulo(cal, 'Um calendário de março de 1979, riscado até o dia 14.', lamb);
    tick(() => { if (!S.flags.sl_acamp && U.iluminado(px, .6, pz, 4.5, .9)) lamb(); });
  }

  // ---------- CÂMARA LESTE: os nichos das outras Horas
  { const nichos = [['um estilingue', 1947], ['uma bola de meia', 1962], ['um ioiô de madeira', 1975], [null, 1994]];
    nichos.forEach(([oque, ano], i) => {
      const x = 28 + i * 1.3, z = -23.86;
      box(.46, .4, .06, MAT.preto, x, 1.3, z + .02, A.W.grupo, false); box(.46, .03, .2, MAT.madeiraEsc, x, 1.12, z + .1, A.W.grupo, false);
      const et = A.textoTex([{ t: String(ano), tam: 44, estilo: 'bold' }], { w: 128, h: 48, fundo: '#8a8a7a', cor: '#2a2a22', manchas: 2 });
      const pl = A.plano(.16, .06, new THREE.MeshStandardMaterial({ map: et, metalness: .5, roughness: .5 }), x, 1.04, z + .21);
      let o;
      if (i === 0) { o = new THREE.Group(); const y = cyl(.008, .008, .12, MAT.madeiraEsc, 0, 0, 0, 4, o); y.rotation.z = .4; const y2 = cyl(.008, .008, .12, MAT.madeiraEsc, 0, 0, 0, 4, o); y2.rotation.z = -.4; }
      else if (i === 1) { o = new THREE.Mesh(new THREE.SphereGeometry(.06, 8, 6), new THREE.MeshStandardMaterial({ color: 0x8a7a5a, roughness: 1 })); }
      else if (i === 2) { o = new THREE.Group(); for (const s of [-1, 1]) { const d = cyl(.035, .035, .015, MAT.madeira, 0, 0, s * .01, 12, o); d.rotation.x = Math.PI / 2; } }
      else o = new THREE.Group();
      o.position.set(x, 1.2, z + .1); A.W.grupo.add(o);
      const cx = box(.44, .38, .02, new THREE.MeshBasicMaterial({ visible: false }), x, 1.3, z + .2, A.W.grupo, false);
      const N = i === 3 ? { pl, cx } : null;
      U.rotulo(cx, () => oque ? `Um nicho com ${oque}. Na etiqueta de lata: ${ano}.` : 'Um nicho vazio. A etiqueta de lata é nova: 1994.', () => { if (!oque) U.uma('sl_1994', () => U.fala('Mil novecentos e noventa e quatro. Esse ano é hoje.')); });
      if (N) { N.pl.visible = !!S.flags.aguaBaixa; N.cx.visible = !!S.flags.aguaBaixa; tick(() => { N.pl.visible = N.cx.visible = !!S.flags.aguaBaixa; }); }
    });
  }

  // ---------- CISTERNA: marcas de enchente, alturas das crianças, argolas, a parede de nomes
  { const t = U.tex(256, 768, (g, w, h) => {
      const y = m => h - m / 3.2 * h;
      g.strokeStyle = 'rgba(220,210,180,.8)'; g.lineWidth = 3;
      for (let m = 0; m <= 3; m += .1) { g.beginPath(); g.moveTo(10, y(m)); g.lineTo(m * 10 % 5 < .01 ? 60 : 34, y(m)); g.stroke(); }
      g.fillStyle = 'rgba(220,210,180,.85)'; g.font = '18px Georgia'; for (let m = 0; m <= 3; m += .5) g.fillText(m.toFixed(1) + ' m', 66, y(m) + 6);
      for (const [m, ano] of [[.62, '1955'], [1.0, '1962'], [1.3, '1975']]) { g.fillStyle = 'rgba(40,30,20,.55)'; g.fillRect(0, y(m) - 3, w, 6); g.fillStyle = 'rgba(232,220,190,.9)'; g.font = 'bold 26px Georgia'; g.fillText('CHEIA ' + ano, 120, y(m) - 8); }
      g.fillStyle = 'rgba(16,12,8,.75)'; g.fillRect(0, y(2.1) - 8, w, 16); g.fillStyle = 'rgba(232,220,190,.95)'; g.font = 'bold 22px Georgia'; g.fillText('A ÁGUA CHEGOU', 70, y(2.1) - 34); g.fillText('AQUI — 14/03/79', 70, y(2.1) - 12);
      mao(g, 200, y(2.0), 1.4, .2, 'rgba(50,40,24,.75)');
    });
    const alt = U.tex(128, 768, (g, w, h) => { const y = m => h - m / 3.2 * h; g.fillStyle = 'rgba(214,204,176,.85)'; g.font = '17px "Special Elite",monospace'; for (const [m, n] of [[1.21, 'Ana'], [1.32, 'Tomé'], [1.48, 'Davi']]) { g.fillRect(8, y(m) - 1, 60, 2); g.fillText(n, 10, y(m) - 5); } });
    U.decal(alt, .5, 3.15, -5.87, 1.6, -31.35, Math.PI / 2);
    const d = U.decal(t, 1.05, 3.15, -5.87, 1.6, -32.2, Math.PI / 2);
    const marca = U.rotulo(d, () => {
      const cm = Math.max(0, Math.round(nivel() * 100));
      return `Uma régua de pedreiro pintada na parede: cheias de 1955, 1962 e 1975. Bem acima da sua cabeça: “A ÁGUA CHEGOU AQUI — 14/03/79”. A água de hoje bate em ${cm} cm. Ao lado, riscos de altura a canivete: Ana, Tomé, Davi.`;
    });
    void marca;
    tick(() => {
      if (!S.flags.sl_marcas && U.iluminado(-5.9, 1.4, -32.2, 6, .9)) { S.flags.sl_marcas = true; U.fala('Cinquenta e cinco, sessenta e dois, setenta e cinco, setenta e nove... toda vez que a água sobe, alguém some.'); }
      if (S.flags.aguaBaixa && S.flags.sl_marcas && !S.flags.sl_maoAlta && U.iluminado(-5.9, 2.05, -31.9, 5, .94)) { S.flags.sl_maoAlta = true; U.fala('Essa mão tá alta demais pra uma criança em pé. Ela tava boiando.'); }
    });
  }
  { const ax = -4.2, az = -30.12, argolas = new THREE.Group(); argolas.position.set(ax, .9, az); A.W.grupo.add(argolas);
    for (let i = 0; i < 3; i++) { const r = new THREE.Mesh(new THREE.TorusGeometry(.07, .014, 6, 12), MAT.ferrugem); r.position.set((i - 1) * .5, 0, -.04); argolas.add(r); const c = cyl(.012, .012, .3, new THREE.MeshStandardMaterial({ color: 0x4a3a20, roughness: 1 }), (i - 1) * .5 + .01, -.2, -.07, 4, argolas); c.rotation.z = .2; }
    let bolhaT = 0;
    U.rotulo(argolas, 'Argolas de ferro chumbadas na parede, na altura de uma criança. Restos de corda podre.');
    tick((t, dt) => { if (U.iluminado(ax, .9, az, 5, .93) && !S.flags.aguaBaixa) { bolhaT -= dt; if (bolhaT <= 0) { bolhaT = .25; B.emitir(ax + (Math.random() - .5) * 1.4, nivel(), az - .5 - Math.random() * .5, 1, .3); } } });
  }
  const paredeNomes = (() => {
    const t = U.tex(512, 256, (g, w, h) => {
      const nomes = ['JOSÉ 31', 'MARIA 33', 'ANTÔNIO 36', 'FRANCISCA 40', 'PEDRO 44', 'IRENE 47', 'SEBASTIÃO 47', 'LUIZ 52', 'JOÃO 55', 'M. DORES 58', 'BEBÊ 62', 'ROSA 65', 'ZÉ 66', 'CÉLIA 71', 'NINO 71', 'B. 75', 'TOMÉ 79', 'ANA 79', 'DAVI 79'];
      nomes.forEach((n, i) => { g.save(); g.translate(20 + (i % 5) * 98 + Math.random() * 10, 34 + Math.floor(i / 5) * 50 + Math.random() * 12); g.rotate((Math.random() - .5) * (.1 + i * .02)); g.fillStyle = `rgba(214,206,186,${.45 + Math.random() * .3})`; g.font = `${16 + Math.random() * 6}px "Special Elite",monospace`; g.fillText(n, 0, 0); g.restore(); });
      if (morreuNosTuneis) { g.save(); g.translate(380, 236); g.rotate(-.06); g.fillStyle = 'rgba(250,246,232,.95)'; g.font = 'bold 30px "Special Elite",monospace'; g.fillText('LIA 94', 0, 0); g.restore(); for (let i = 0; i < 40; i++) { g.fillStyle = 'rgba(240,236,220,.5)'; g.fillRect(380 + Math.random() * 110, 244 + Math.random() * 10, 2, 2); } }
    });
    const d = U.decal(t, 3.2, 1.6, 3.85, 1.35, -41.87, 0);
    U.rotulo(d, () => 'Dezenas de nomes riscados na pedra, de 1931 a 1979, cada vez mais tortos.' + (morreuNosTuneis ? ' O último ainda solta pó: LIA 94.' : ''), () => { if (morreuNosTuneis) U.uma('sl_lia94', () => U.fala('Esse risco não tava aqui antes. Esse é o meu nome.')); });
    return d;
  })(); void paredeNomes;
  { // a bolinha de gude do João, boiando na cisterna
    const gude = new THREE.Mesh(new THREE.SphereGeometry(.035, 10, 8), new THREE.MeshStandardMaterial({ color: 0x5a8a9a, roughness: .1, metalness: .2, transparent: true, opacity: .85, emissive: 0x0a1a20, emissiveIntensity: .6 }));
    gude.position.set(2.6, .45, -36.8); A.W.grupo.add(gude);
    U.rotulo(gude, 'Uma bolinha de gude gasta, boiando sozinha.', () => U.uma('sl_gude', () => U.fala('Uma bolinha de gude. Quem brincava aqui embaixo?')));
    tick(t => { const n = nivel(); gude.position.y = n > .08 ? n + .02 + Math.sin(t * 1.3) * .008 : .035; gude.position.x = 2.6 + Math.sin(t * .2) * (n > .08 ? .3 : 0); });
  }

  // ---------- TÚNEL NORTE: o nicho dos confiscados e o giz do Davi
  { const nx = -1.86, nz = -46.2;
    const tampa = cyl(.09, .09, .5, MAT.ferrugem, nx + .08, 1.25, nz, 8);
    const caixa = new THREE.Group(); caixa.position.set(nx + .14, 1.05, nz); caixa.visible = !!S.flags.sl_confisc; A.W.grupo.add(caixa);
    box(.22, .12, .3, MAT.madeiraEsc, 0, 0, 0, caixa, false);
    const piao = new THREE.Mesh(new THREE.ConeGeometry(.03, .06, 8), MAT.madeira); piao.rotation.x = Math.PI; piao.position.set(0, .09, -.07); caixa.add(piao);
    box(.12, .01, .03, new THREE.MeshStandardMaterial({ color: 0x8a1420, emissive: 0x2a0408 }), .02, .065, .06, caixa, false);
    for (let i = 0; i < 3; i++) { const b = new THREE.Mesh(new THREE.SphereGeometry(.014, 6, 5), MAT.vidro); b.position.set(-.05 + i * .03, .075, .1); caixa.add(b); }
    U.rotulo(tampa, () => S.flags.sl_confisc ? 'Uma caixa atrás do cano solto: pião, fita de cabelo vermelha, bolinhas de gude. Etiquetas: “CONFISCADO — A.”' : '<b>E</b>Mexer no cano solto', () => {
      if (S.flags.sl_confisc) return; S.flags.sl_confisc = true; caixa.visible = true; tampa.rotation.z = .5; tampa.position.x += .1; A.SFX.metal(.4); A.emitNoise(nx, nz, 4);
      A.toast('Atrás do cano, uma caixa: um pião, uma fita de cabelo vermelha, bolinhas de gude. Cada um com uma etiqueta: “CONFISCADO — A.”');
      U.depois(2.5, () => U.fala('Tiravam tudo deles. Até o brinquedo.'));
    });
  }
  const gizes = [];
  const gizDecal = (linhas, w, h, x, y, z, ry, cond) => {
    const t = U.tex(512, Math.round(512 * h / w), g => giz(g, linhas, { tam: 46, y0: 70, passo: 60 }));
    const d = U.decal(t, w, h, x, y, z, ry, { mat: { emissive: 0xe8e4d0, emissiveIntensity: 0, emissiveMap: t } });
    gizes.push({ d, x, y, z, cond }); return d;
  };
  gizDecal(['POR AQUI LIA', '↓'], 1, .5, 3.86, 1.05, -5.2, -Math.PI / 2);
  gizDecal(['NÃO VAI PRO', 'NORTE AINDA'], 1.1, .55, -2.6, 1.05, -41.86, 0, () => !S.flags.aguaBaixa);
  gizDecal(['AGORA PODE', '↑ D.'], 1.1, .55, -2.6, 1.05, -41.86, 0, () => !!S.flags.aguaBaixa);
  gizDecal(['A SALA DELE', '↓  ↓'], .9, .45, 1.86, 1.0, -50.2, -Math.PI / 2);
  gizDecal(['SAÍDA →', '(depois)'], .9, .45, 5.86, 1.05, -38.8, -Math.PI / 2);
  tick(() => {
    for (const G of gizes) {
      G.d.visible = !!S.fitas.f2 && (!G.cond || G.cond());
      const k = G.d.visible && U.luz() && U.dist(G.x, G.z) < 7 ? .35 : 0; G.d.material.emissiveIntensity += (k - G.d.material.emissiveIntensity) * .1;
    }
  });

  // ---------- SALA DO DIRETOR
  // poltrona virada para a parede dos canos de escuta
  const pol = new THREE.Group(); pol.position.set(5.6, 0, -55.6); pol.rotation.y = Math.PI / 2 - .25; A.W.grupo.add(pol);
  { const couro = new THREE.MeshStandardMaterial({ color: 0x3a1c12, roughness: .7 });
    box(.8, .42, .75, couro, 0, .21, 0, pol); box(.8, .7, .16, couro, 0, .75, -.3, pol); for (const s of [-1, 1]) box(.14, .25, .75, couro, s * .4, .55, 0, pol);
    A.addCollider(5.15, 6.05, -56.05, -55.15); }
  // o fantasma do diretor: só aparece sentado com a lanterna apagada
  const fant = new THREE.Group(); pol.add(fant);
  { const terno = new THREE.MeshBasicMaterial({ color: 0x0c0c10, transparent: true, opacity: .0, depthWrite: false });
    box(.5, .7, .3, terno, 0, .8, -.05, fant, false); const cab = new THREE.Mesh(new THREE.SphereGeometry(.13, 10, 8), terno); cab.position.set(0, 1.32, -.08); fant.add(cab);
    fant.userData.mat = terno; }
  // cinzeiro com um cigarro ainda aceso (o diretor morreu em 1980)
  const mesinha = { x: 6.5, z: -54.6 };
  box(.4, .55, .4, MAT.madeiraEsc, mesinha.x, .275, mesinha.z); A.addCollider(mesinha.x - .2, mesinha.x + .2, mesinha.z - .2, mesinha.z + .2);
  cyl(.07, .06, .03, MAT.vidro, mesinha.x - .08, .565, mesinha.z, 10);
  const brasaMat = new THREE.MeshBasicMaterial({ color: 0xff6a20 });
  const cig = cyl(.005, .005, .07, MAT.papel, mesinha.x - .06, .585, mesinha.z, 5); cig.rotation.z = Math.PI / 2;
  const ponta = new THREE.Mesh(new THREE.SphereGeometry(.007, 5, 4), brasaMat); ponta.position.set(mesinha.x - .025, .585, mesinha.z); A.W.grupo.add(ponta);
  const copo = cyl(.03, .025, .08, new THREE.MeshStandardMaterial({ color: 0x8a5a20, transparent: true, opacity: .7, roughness: .1 }), mesinha.x + .1, .59, mesinha.z - .08, 8);
  box(.12, .07, .06, MAT.preto, mesinha.x + .08, .585, mesinha.z + .1);
  const cera = new THREE.Mesh(new THREE.SphereGeometry(.012, 6, 5), new THREE.MeshStandardMaterial({ color: 0xd8c890 })); cera.position.set(mesinha.x - .1, .57, mesinha.z + .12); A.W.grupo.add(cera);
  U.rotulo(copo, () => S.flags.cofre ? 'O cigarro foi esmagado no cinzeiro. Ninguém viu quem fez isso.' : 'Um cinzeiro com um cigarro aceso. Um copo de conhaque pela metade, um rádio baixinho e um tampão de ouvido de cera, usado.', () => U.uma('sl_cigarro', () => U.fala('Cigarro aceso. O diretor morreu em 1980.')));
  const fumaca = [];
  for (let i = 0; i < 6; i++) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ color: 0x9aa0a8, transparent: true, opacity: 0, depthWrite: false })); s.scale.setScalar(.06); A.W.grupo.add(s); fumaca.push({ s, t: i / 6 }); }
  // tubos de escuta: bocais com plaquinhas (o diretor ouvia os dormitórios daqui)
  { const bocais = [
      ['DORM A', () => { A.sub('voz', '(no cano, muito longe) ...um... dois... três... (alguém conta baixinho, sem parar)'); }],
      ['DORM B', () => { A.sub('voz', '(no cano, colado do outro lado) ...é a moça? A moça da lanterna?'); }],
      ['CELESTE', () => { A.sub('celeste', '(no cano, rezando) ...que eles cheguem até o sino. Que eu tenha coragem de abrir.'); }],
      ['CAPELA', () => { A.sub('davi', '(no cano, cochichando, 1979) Às nove a irmã abre a porta. Ninguém fala nada.'); U.depois(3.2, () => A.sub('tome', '(no cano) E se ele ouvir?')); U.depois(5.6, () => A.sub('ana', '(no cano) Eu fico olhando pra ele. Ele não anda se eu olhar.')); }]
    ];
    bocais.forEach(([nome, fn], i) => {
      const z = -55.2 - i * .55, g = new THREE.Group(); g.position.set(7.82, 1.45, z); A.W.grupo.add(g);
      cyl(.03, .03, 1.5, MAT.bronze, 0, .8, 0, 8, g); const b = cyl(.08, .035, .12, MAT.bronze, -.08, 0, 0, 10, g); b.rotation.z = Math.PI / 2;
      A.plano(.2, .06, new THREE.MeshStandardMaterial({ map: A.textoTex([{ t: nome, tam: 30, estilo: 'bold' }], { w: 128, h: 40, fundo: '#b8a878', cor: '#2a2010', manchas: 1 }), metalness: .4 }), -.01, -.16, 0, -Math.PI / 2, g);
      U.rotulo(g, `<b>E</b>Encostar o ouvido no bocal “${nome}”`, () => { som.chiado({ x: 7.7, y: 1.45, z }, 1.4, .07); fn(); U.uma('sl_bocal', () => U.depois(6.5, () => U.fala('Ele ouvia tudo daqui de baixo. Cada dormitório.'))); });
    });
  }
  // negatoscópio com radiografias de mãos (acende quando você entra)
  const nega = new THREE.MeshStandardMaterial({ map: U.tex(256, 192, (g, w, h) => {
      g.fillStyle = '#0a0d10'; g.fillRect(0, 0, w, h);
      for (let k = 0; k < 2; k++) { const ox = 30 + k * 120; g.strokeStyle = 'rgba(220,230,240,.85)'; g.lineWidth = 5; g.lineCap = 'round';
        for (let d = 0; d < 4; d++) { const x = ox + 14 + d * 18; g.beginPath(); g.moveTo(x, 150); g.lineTo(x + (d === 2 && k === 0 ? 10 : 0), 110); g.lineTo(x + (d === 2 && k === 0 ? 22 : 0), 70); g.stroke(); }
        g.beginPath(); g.moveTo(ox + 6, 160); g.lineTo(ox - 8, 120); g.stroke(); g.fillStyle = 'rgba(220,230,240,.4)'; g.fillRect(ox + 4, 150, 70, 30);
        g.fillStyle = '#e8e0c8'; g.font = '13px "Special Elite",monospace'; g.fillText('castigo — régua', ox - 6, 22); }
    }), emissive: 0xc8d8e8, emissiveIntensity: 0, roughness: .5 });
  nega.emissiveMap = nega.map;
  const negaM = A.plano(.9, .62, nega, 4.4, 1.7, -65.86);
  box(1, .72, .05, MAT.metal, 4.4, 1.7, -65.9, A.W.grupo, false);
  U.rotulo(negaM, 'Radiografias de mãos pequenas presas na luz. Dedos tortos. Etiqueta: “castigo — régua”.');
  // estante de rolos “SILÊNCIO” e o gravador de rolo
  { const est = U.tex(512, 256, (g, w, h) => { g.fillStyle = '#20180f'; g.fillRect(0, 0, w, h); for (let r = 0; r < 4; r++) for (let i = 0; i < 9; i++) { const x = 10 + i * 56, y = 8 + r * 62; g.fillStyle = '#3a2e20'; g.beginPath(); g.arc(x + 25, y + 25, 22, 0, 7); g.fill(); g.fillStyle = '#d8ccb0'; g.fillRect(x + 4, y + 46, 44, 10); g.fillStyle = '#2a2010'; g.font = '8px monospace'; g.fillText('SILÊNCIO ' + String(2 + (r * 9 + i) % 27).padStart(2, '0') + '/03', x + 5, y + 54); } });
    U.decal(est, 1.9, .95, -4.4, 1.6, -65.85, 0, { mat: { transparent: false } });
    box(2, .04, .3, MAT.madeiraEsc, -4.4, 1.1, -65.75, A.W.grupo, false);
    const grav = new THREE.Group(); grav.position.set(-4.4, 1.12, -65.7); A.W.grupo.add(grav);
    box(.5, .12, .28, MAT.metal, 0, .06, 0, grav); const rolos = [];
    for (const x of [-.13, .13]) { const r = cyl(.09, .09, .02, new THREE.MeshStandardMaterial({ color: 0x3a2e20 }), x, .14, 0, 14, grav); rolos.push(r); }
    let tocando = 0;
    U.rotulo(grav, () => tocando > 0 ? 'O rolo gira. Quase nenhum som.' : '<b>E</b>Tocar o rolo “SILÊNCIO 14/03/79”', () => {
      if (tocando > 0) return; tocando = 21; A.SFX.fitaClique(); A.emitNoise(-4.4, -65.7, 3);
      A.SFX.silencio(19, .08); som.chiado({ x: -4.4, y: 1.2, z: -65.7 }, 19, .025);
      const segunda = !!S.flags.sl_rolo; S.flags.sl_rolo = true;
      U.depois(17, () => { if (!segunda) { som.batidas({ x: -4.4, y: 1.2, z: -65.7 }, 6, .1, 300, .55); U.depois(3.2, () => A.SFX.sino(.08, { x: -4.4, y: 1.4, z: -65.7 })); } else { A.sub('voz', '(no fim do rolo, uma criança, baixinho) ...posso falar agora?'); A.SFX.susto(); S.fear = Math.min(100, S.fear + 18); } });
      U.depois(22, () => { if (!segunda) U.fala('Ele gravava o silêncio. Toda noite. E nessa noite gravou as batidas.'); });
    });
    tick((t, dt) => { if (tocando > 0) { tocando -= dt; for (const r of rolos) r.rotation.y += dt * 2; } });
  }
  // vitrola com o disco de cantigas: barulho alto, mas ele para quando ouve
  { const vx = -3.6, vz = -55.0;
    prop(.5, .7, .45, MAT.madeiraEsc, vx, .35, vz);
    const prato = cyl(.16, .16, .015, MAT.preto, vx, .71, vz, 16); const braco = box(.02, .02, .2, MAT.metal, vx + .18, .73, vz, A.W.grupo, false); braco.rotation.y = .4;
    let disco = 0, parou = false;
    U.rotulo(prato, () => disco > 0 ? 'O disco toca a mesma cantiga, riscado.' : S.flags.sl_vitrola ? 'O disco está riscado demais para tocar de novo.' : '<b>E</b>Pôr o disco de cantigas para tocar (faz barulho)', () => {
      if (disco > 0 || S.flags.sl_vitrola) return; S.flags.sl_vitrola = true; disco = som.cantiga({ x: vx, y: .9, z: vz }, .2) || 20; parou = false;
      A.emitNoise(vx, vz, 16); A.toast('A cantiga ecoa pelos túneis. Alguém ouviu.');
    });
    tick((t, dt) => {
      if (disco <= 0) return; disco -= dt; prato.rotation.y += dt * 3.5;
      if (disco > 8 && Math.random() < dt * .5) A.emitNoise(vx, vz, 9);
      const M = A.M;
      if (!parou && M.ativo && Math.hypot(M.pos.x - vx, M.pos.z - vz) < 6) { parou = true; M.wait = Math.max(M.wait, 8); M.path = []; A.toast('Ele para ao ouvir a cantiga. Fica parado, de cabeça baixa, balançando. Agora!'); U.depois(2.5, () => A.sub('inspetor', '(cantarolando junto, desafinado) ...dorme, menino...')); }
    });
  }
  // máscaras de gesso na prateleira (com o apagão, viram para você)
  const mascaras = [];
  { box(.3, .04, 1.9, MAT.madeiraEsc, 7.78, 1.55, -64.2, A.W.grupo, false);
    const gesso = new THREE.MeshStandardMaterial({ color: 0xd8d2c4, roughness: .9 });
    for (let i = 0; i < 6; i++) { const m = new THREE.Group(); m.position.set(7.72, 1.7, -65 + i * .32); A.W.grupo.add(m); const r = new THREE.Mesh(new THREE.SphereGeometry(.09, 10, 8, 0, Math.PI), gesso); r.scale.set(.8, 1.05, .45); r.rotation.y = -Math.PI / 2; m.add(r); for (const s of [-1, 1]) { const o = new THREE.Mesh(new THREE.SphereGeometry(.014, 5, 4), MAT.preto); o.position.set(-.04, .02, s * .028); m.add(o); } mascaras.push(m); }
    const et = A.textoTex([{ t: '1951 · 1958 · 1962 · 1965 · 1975 · 1979 1979 1979', tam: 14 }], { w: 512, h: 32, fundo: '#c8bc98', cor: '#2a2010', manchas: 1 });
    const pl = A.plano(1.8, .06, new THREE.MeshStandardMaterial({ map: et }), 7.86, 1.5, -64.2, -Math.PI / 2);
    U.rotulo(pl, 'Máscaras de gesso de rostos de crianças. Cada uma com uma etiqueta de ano. Três de 1979.'); }
  let mascVirou = false;
  // riscos de dias e as iniciais M.D. (trancaram o Moacir aqui depois do fogo)
  { const t = U.tex(512, 256, (g) => { for (let r = 0; r < 6; r++) for (let c = 0; c < 18; c++) tracos(g, 14 + c * 27, 20 + r * 36, 5, 22, 4, 'rgba(190,180,160,.65)'); g.fillStyle = 'rgba(200,190,170,.85)'; g.font = 'bold 40px "Special Elite",monospace'; g.fillText('M.D.', 400, 244); });
    const d = U.decal(t, 1.6, .8, 7.86, 1.15, -62.3, -Math.PI / 2);
    U.rotulo(d, 'Riscos de dias feitos a prego, centenas. Embaixo, as iniciais “M.D.”', () => U.uma('sl_md', () => U.fala('Moacir Duarte. Trancaram ele aqui embaixo também.'))); }
  // a quinta foto, mais velha: 1951
  const foto5 = A.plano(.7, .52, new THREE.MeshStandardMaterial({ map: U.tex(256, 192, (g, w, h) => { g.fillStyle = '#5a4a36'; g.fillRect(0, 0, w, h); for (let i = 0; i < 500; i++) { g.fillStyle = `rgba(20,16,10,${Math.random() * .3})`; g.fillRect(Math.random() * w, Math.random() * h, 2, 2); } g.fillStyle = '#2a2018'; g.fillRect(100, 70, 30, 90); g.beginPath(); g.arc(115, 60, 15, 0, 7); g.fill(); g.fillStyle = '#c8bca0'; g.fillRect(100, 54, 30, 8); g.fillStyle = '#16120c'; g.fillRect(150, 30, 40, 140); g.beginPath(); g.arc(170, 22, 17, 0, 7); g.fill(); g.fillStyle = '#d8ccb0'; g.font = '14px Georgia'; g.fillText('Moacir aprendendo a ouvir — 1951', 12, 186); }), roughness: .8 }), -7.86, 1.75, -58.5, Math.PI / 2);
  box(.04, .6, .78, MAT.madeiraEsc, -7.89, 1.75, -58.5, A.W.grupo, false);
  U.rotulo(foto5, 'Uma foto mais velha que as outras: um menino magro de olhos vendados num corredor. Atrás dele, um homem de terno. “Moacir aprendendo a ouvir — 1951”.');
  let foto5Vista = false, foto5Costas = 0;
  // documentos da sala (lore secreta)
  { A.ITENS.nota('sl_transf', { x: -1.4, y: 1.33, z: -65.6 });
    const cx = box(.36, .16, .26, MAT.papel, 5.9, .08, -64.9); void cx; A.ITENS.nota('sl_cartas', { x: 5.9, y: .17, z: -64.9 });
    A.ITENS.nota('sl_caixa', { x: 1.4, y: 1.33, z: -65.6 });
    prop(.45, .7, .35, MAT.madeiraEsc, -2.85, .35, -55.05); A.ITENS.nota('sl_fichas', { x: -2.85, y: .71, z: -55.05 }); }
  const bispo = A.ITENS.nota('sl_bispo', { x: 6.55, y: .02, z: -60.3 }); // caiu do fundo do cofre quando a porta abriu
  bispo.obj.visible = !!S.flags.cofre;
  // brasa de cigarro no escuro (túnel norte e sala do diretor)
  const brasa = new THREE.Sprite(new THREE.SpriteMaterial({ color: 0xff7030, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending })); brasa.scale.setScalar(.05); A.W.grupo.add(brasa);
  let brasaT = 14 + Math.random() * 14, brasaVida = 0;

  // ---------- GALERIA OESTE: o ninho do Moacir
  const ninho = { x: -15, z: -34.75 };
  { prop(2.3, .5, 1.05, MAT.madeiraEsc, ninho.x, .25, ninho.z);
    box(1.9, .1, .9, new THREE.MeshStandardMaterial({ color: 0x8a7a3a, roughness: 1 }), ninho.x - .1, .55, ninho.z, A.W.grupo, false);
    cyl(.1, .09, .02, MAT.metal, ninho.x + .85, .52, ninho.z + .25, 12); box(.015, .005, .14, MAT.metal, ninho.x + .85, .535, ninho.z + .22, A.W.grupo, false);
    const radio = box(.22, .14, .08, MAT.preto, ninho.x + .85, .57, ninho.z - .25);
    const rel = A.plano(.07, .07, new THREE.MeshStandardMaterial({ map: U.tex(64, 64, g => { g.fillStyle = '#c8bc98'; g.beginPath(); g.arc(32, 32, 30, 0, 7); g.fill(); g.strokeStyle = '#1a1208'; g.lineWidth = 3; g.beginPath(); g.moveTo(32, 32); g.lineTo(32 + Math.sin(-.36) * 16, 32 - Math.cos(-.36) * 16); g.moveTo(32, 32); g.lineTo(32 + Math.sin(5.24) * 24, 32 - Math.cos(5.24) * 24); g.stroke(); }) }), ninho.x + .5, .61, ninho.z + .3); rel.rotation.x = -Math.PI / 2;
    const ocl = new THREE.Group(); ocl.position.set(ninho.x - .7, .615, ninho.z + .2); A.W.grupo.add(ocl); for (const s of [-1, 1]) { const l = cyl(.03, .03, .006, MAT.preto, s * .04, 0, 0, 10, ocl); l.rotation.x = Math.PI / 2; l.rotation.z = s * .3; }
    const latas = new THREE.Group(); latas.position.set(ninho.x + 1.4, 0, ninho.z + .1); A.W.grupo.add(latas);
    for (let i = 0; i < 15; i++) { const l = cyl(.05, .05, .11, MAT.metal, (i % 3) * .11 - .11, .56 + Math.floor(i / 3) * .115, 0, 8, latas); l.rotation.y = i; }
    prop(.32, .5, .32, MAT.madeiraEsc, ninho.x + 1.4, .25, ninho.z + .1);
    for (let i = 0; i < 5; i++) box(.3, .02, .1, MAT.lencol, ninho.x - .5, .61 + i * .022, ninho.z - .25, A.W.grupo, false);
    const cad = new THREE.Group(); cad.position.set(ninho.x - 2.4, 0, ninho.z + .15); cad.rotation.y = Math.PI; A.W.grupo.add(cad);
    box(.4, .04, .4, MAT.madeiraEsc, 0, .45, 0, cad); box(.4, .4, .04, MAT.madeiraEsc, 0, .7, .18, cad); for (const [dx, dz] of [[-.17, -.17], [.17, -.17], [-.17, .17], [.17, .17]]) box(.03, .45, .03, MAT.ferrugem, dx, .22, dz, cad);
    A.addCollider(ninho.x - 2.62, ninho.x - 2.18, ninho.z - .07, ninho.z + .37);
    const lin = () => U.uma('sl_ninho', () => U.depois(.8, () => U.fala('Ele ficou aqui embaixo esse tempo todo. Sozinho.')));
    U.rotulo(radio, 'Um rádio de pilha chiando, sintonizado em lugar nenhum.', lin);
    U.rotulo(rel, 'Um relógio de bolso parado em 21h50. A hora em que pegaram o Davi.', lin);
    U.rotulo(ocl, 'Óculos escuros com uma lente rachada. Um colchão de palha afundado no meio.', lin);
    U.rotulo(latas, 'Latas de comida empilhadas, com datas: 1980, 1981... 1994. A mais nova está aberta. Fresca.', () => U.uma('sl_latas', () => U.fala('Quem traz comida pra ele?')));
    U.rotulo(cad, 'Uma cadeira de escola virada para a parede. Vendas de pano empilhadas no colchão. Na parede, na altura da testa, a pedra está gasta.');
    let chiadoT = 3, paradaT = 0;
    tick((t, dt) => {
      chiadoT -= dt; if (chiadoT <= 0) { chiadoT = 2.6; if (U.dist(ninho.x, ninho.z) < 9) som.chiado({ x: ninho.x + .85, y: .6, z: ninho.z - .25 }, 2.4, .035); }
      const M = A.M; paradaT -= dt;
      if (M.ativo && M.state === 'patrulha' && paradaT <= 0 && Math.hypot(M.pos.x - ninho.x, M.pos.z - ninho.z) < 2.8) {
        paradaT = 40; M.wait = Math.max(M.wait, 3.2); if (U.dist(ninho.x, ninho.z) < 14) { A.SFX.suspiro({ x: M.pos.x, y: 1.5, z: M.pos.z }); A.toast('Ele para no colchão e passa a mão na palha. Três segundos.'); }
      }
    });
  }

  // ---------- DEPÓSITO: as medidas permanentes e o arquivo morto
  const correias = [];
  { for (const bx of [-30.4, -27.6]) {
      const g = new THREE.Group(); g.position.set(bx, 0, -31.4); A.W.grupo.add(g);
      box(1.9, .08, .85, MAT.ferrugem, 0, .62, 0, g); for (const [dx, dz] of [[-.9, -.38], [.9, -.38], [-.9, .38], [.9, .38]]) box(.05, .62, .05, MAT.ferrugem, dx, .31, dz, g);
      box(.06, .5, .85, MAT.ferrugem, -.95, .87, 0, g);
      for (const dx of [-.5, .1, .6]) { const c = new THREE.Group(); c.position.set(dx, .64, .44); g.add(c); box(.07, .4, .01, new THREE.MeshStandardMaterial({ color: 0x3a2a1a, roughness: 1 }), 0, -.2, 0, c, false); correias.push(c); }
      A.addCollider(bx - .97, bx + .97, -31.85, -30.95);
    }
    const balde = cyl(.13, .1, .26, MAT.ferrugem, -26.3, .13, -32.6, 10);
    const lista = U.decal(U.tex(512, 256, g => { const ns = ['L. 1952', 'J. 1955', 'M.D. 1958', 'S/N 1962', 'R. 1965', 'Z. 1966', 'C. 1971', 'N. 1971', 'B. 1975', 'T. 1979', 'A. 1979', 'D. 1979']; ns.forEach((n, i) => { const x = 24 + (i % 4) * 120, y = 50 + Math.floor(i / 4) * 70; g.fillStyle = 'rgba(226,222,206,.85)'; g.font = '26px "Special Elite",monospace'; g.fillText(n, x, y); g.strokeStyle = 'rgba(226,222,206,.85)'; g.lineWidth = 3; g.beginPath(); g.moveTo(x - 6, y - 8); g.lineTo(x + 96, y - 12); g.stroke(); }); }), 1.6, .8, -31.87, 1.5, -33.2, Math.PI / 2);
    U.rotulo(lista, 'Uma lista de nomes a giz, todos riscados. De 1952 a 1979.');
    U.rotulo(balde, 'Duas camas de ferro com correias de couro. Um balde. Nada mais.');
    tick(() => { if (!S.flags.sl_medidas && U.iluminado(-29, .8, -31.4, 5.5, .9)) { S.flags.sl_medidas = true; U.depois(.6, () => U.fala('“Medidas permanentes”. Aqui ninguém ouvia.')); } });
    for (let i = 0; i < 6; i++) box(.42, .32, .32, MAT.papel, -31.5 + (i % 3) * .44, .16 + Math.floor(i / 3) * .32, -35.6, A.W.grupo, false);
    A.addCollider(-31.75, -30.4, -35.8, -35.4);
    A.ITENS.nota('sl_arquivo', { x: -31.06, y: .65, z: -35.6 });
  }

  // ---------- GALERIA LESTE: o mural de giz da noite do fogo e o bueiro
  const mural = [];
  { const cenas = [
      (g) => { g.beginPath(); g.moveTo(128, 40); g.quadraticCurveTo(70, 60, 70, 150); g.lineTo(186, 150); g.quadraticCurveTo(186, 60, 128, 40); g.stroke(); g.beginPath(); g.arc(128, 160, 10, 0, 7); g.stroke(); },
      (g) => { bonequinho(g, 70, 70, 1.6, g.strokeStyle); bonequinho(g, 128, 82, 1.3, g.strokeStyle); bonequinho(g, 186, 90, 1.1, g.strokeStyle); },
      (g) => { g.strokeRect(70, 50, 100, 140); g.beginPath(); g.arc(150, 125, 6, 0, 7); g.stroke(); bonequinho(g, 210, 70, 2, g.strokeStyle); g.beginPath(); g.moveTo(190, 120); g.lineTo(160, 125); g.stroke(); g.strokeRect(128, 96, 22, 18); g.beginPath(); g.arc(139, 96, 8, Math.PI, 0); g.stroke(); },
      (g) => { for (let i = 0; i < 9; i++) { g.beginPath(); const x = 30 + i * 24; g.moveTo(x, 200); g.quadraticCurveTo(x - 20, 120, x + 6, 50 + Math.random() * 40); g.quadraticCurveTo(x + 20, 120, x + 12, 200); g.stroke(); } },
      (g) => { for (let i = 0; i < 7; i++) { g.beginPath(); const x = 20 + i * 34; g.moveTo(x, 200); g.quadraticCurveTo(x - 14, 150, x + 4, 110); g.stroke(); } bonequinho(g, 128, 30, 3.6, g.strokeStyle); g.beginPath(); g.moveTo(120, 52); g.lineTo(136, 52); g.stroke(); },
      (g) => { g.beginPath(); for (let i = 0; i < 6; i++) { g.moveTo(40 + i * 12, 60); g.lineTo(40 + i * 12, 200); } g.stroke(); bonequinho(g, 170, 70, 2.6, g.strokeStyle); g.beginPath(); g.moveTo(190, 110); g.lineTo(230, 100); g.stroke(); g.beginPath(); g.moveTo(232, 100); g.lineTo(256, 80); g.lineTo(256, 120); g.closePath(); g.stroke(); }
    ];
    cenas.forEach((desenha, i) => {
      const fresco = i === 5;
      const t = U.tex(256, 224, (g) => { g.strokeStyle = fresco ? 'rgba(250,248,240,.98)' : 'rgba(226,222,206,.82)'; g.fillStyle = g.strokeStyle; g.lineWidth = fresco ? 4 : 3.2; g.lineCap = 'round'; desenha(g); });
      const x = [8.3, 10.7, 13.1, 17.0, 19.4, 21.8][i];
      const d = U.decal(t, .95, .83, x, 1.0, -37.87, 0, { mat: { opacity: 0 } });
      if (fresco) { const p = U.chao(U.tex(64, 64, g => { for (let k = 0; k < 120; k++) { g.fillStyle = 'rgba(240,236,222,.7)'; g.fillRect(20 + Math.random() * 24, 20 + Math.random() * 24, 2, 2); } }), .3, .3, x, -37.7); p.position.y = .44; mural.push({ d, x, p, k: 0, fresco }); }
      else mural.push({ d, x, k: 0 });
      U.rotulo(d, ['Um sino desenhado a giz.', 'Três crianças de giz, de mãos dadas.', 'Um homem trancando uma porta com cadeado.', 'Fogo. Muito fogo, desenhado com força.', 'Um homem alto no meio das chamas, com o dedo na boca.', 'Uma mulher adulta, de lanterna na mão, chegando a um portão. O giz ainda solta pó.'][i]);
    });
  }
  const bueiro = { x: 20.5, z: -36 };
  const gotas = [];
  { const grade = U.tex(128, 128, g => { g.fillStyle = 'rgba(10,10,12,.9)'; g.fillRect(0, 0, 128, 128); g.fillStyle = 'rgba(120,140,160,.5)'; for (let i = 0; i < 7; i++) g.fillRect(8 + i * 17, 8, 9, 112); });
    const gm = U.decal(grade, .9, .9, bueiro.x, 2.78, bueiro.z, 0); gm.rotation.x = Math.PI / 2;
    const rosto = new THREE.Mesh(new THREE.PlaneGeometry(.32, .38), new THREE.MeshBasicMaterial({ map: U.tex(64, 80, g => { g.fillStyle = 'rgba(200,196,186,.9)'; g.beginPath(); g.ellipse(32, 40, 22, 30, 0, 0, 7); g.fill(); g.fillStyle = '#050505'; g.fillRect(20, 34, 7, 5); g.fillRect(37, 34, 7, 5); g.fillRect(28, 56, 8, 3); }), transparent: true, opacity: 0, depthWrite: false }));
    rosto.rotation.x = Math.PI / 2; rosto.position.set(bueiro.x, 2.95, bueiro.z); A.W.grupo.add(rosto);
    const raio = new THREE.PointLight(0xb8c8ff, 0, 7, 1.4); raio.position.set(bueiro.x, 2.6, bueiro.z); A.W.grupo.add(raio);
    for (let i = 0; i < 40; i++) { const s = new THREE.Mesh(new THREE.PlaneGeometry(.008, .14), new THREE.MeshBasicMaterial({ color: 0xa8b8c8, transparent: true, opacity: .45, depthWrite: false })); s.position.set(bueiro.x + (Math.random() - .5) * .8, Math.random() * 2.8, bueiro.z + (Math.random() - .5) * .8); A.W.grupo.add(s); gotas.push(s); }
    let flashT = 6 + Math.random() * 8, flashK = 0, chuvaT = 0, rostoVez = false;
    U.rotulo(gm, 'Uma grade de bueiro no teto. Chove lá fora. O barulho da chuva aqui embaixo esconde os seus passos.');
    tick((t, dt) => {
      for (const s of gotas) { s.position.y -= dt * 5.5; if (s.position.y < nivel()) { s.position.y = 2.75; if (Math.random() < .2) O.criar(s.position.x, nivel(), s.position.z, .18, .08, .8); } s.lookAt(A.camera.position.x, s.position.y, A.camera.position.z); }
      const perto = U.dist(bueiro.x, bueiro.z);
      chuvaT -= dt; if (chuvaT <= 0) { chuvaT = 1.9; if (perto < 11) som.chuva({ x: bueiro.x, y: 2.6, z: bueiro.z }, 2.1, .09); }
      flashT -= dt; if (flashT <= 0) { flashT = 12 + Math.random() * 16; flashK = 1; rostoVez = !rostoVez && Math.random() < .55; if (perto < 14) U.depois(.8 + Math.random(), () => A.SFX.trovao()); }
      if (flashK > 0) { flashK = Math.max(0, flashK - dt * 2.6); raio.intensity = (flashK > .7 || (flashK > .3 && flashK < .45)) ? 5 : 0; rosto.material.opacity = rostoVez ? Math.min(.9, flashK * 1.4) : 0; if (rostoVez && flashK > .5 && perto < 6 && U.olhando(bueiro.x, 2.9, bueiro.z, .8, 8)) U.uma('sl_rosto', () => { S.fear = Math.min(100, S.fear + 18); U.depois(1.2, () => U.fala('Tinha uma criança olhando pela grade. Lá de cima.')); }); }
      else { raio.intensity = 0; rosto.material.opacity = 0; }
    });
  }

  // ---------- SAÍDA: mãos de fuligem, a porta emparedada da capela, a grade no teto, a inscrição de 1931
  { const tm = U.tex(128, 128, g => mao(g, 64, 74, 2.6, .1, 'rgba(14,12,10,.8)'));
    const pts = [[9, -34.13, Math.PI], [11.6, -34.13, Math.PI], [14.2, -34.13, Math.PI], [17.4, -34.13, Math.PI], [19.8, -34.13, Math.PI], [22.4, -34.13, Math.PI], [31.87, -37.1, -Math.PI / 2], [31.87, -34.9, -Math.PI / 2]];
    pts.forEach(([x, z, ry], i) => U.decal(tm, .2, .2, x, .9 + (i % 3) * .1, z, ry, { mat: { opacity: .9 } }).rotation.z = (i % 2 ? .3 : -.2));
    const arco = U.tex(512, 512, (g, w, h) => {
      g.fillStyle = '#4a4440'; g.fillRect(0, 0, w, h);
      g.save(); g.beginPath(); g.moveTo(80, h); g.lineTo(80, 200); g.arc(256, 200, 176, Math.PI, 0); g.lineTo(432, h); g.closePath(); g.clip();
      for (let y = 0; y < h; y += 30) for (let x = (y / 30 % 2) * 30 - 30; x < w; x += 60) { g.fillStyle = `rgb(${132 + Math.random() * 26 | 0},${64 + Math.random() * 16 | 0},${48 + Math.random() * 10 | 0})`; g.fillRect(x + 2, y + 2, 56, 26); }
      g.restore(); g.strokeStyle = '#2a2420'; g.lineWidth = 10; g.beginPath(); g.moveTo(80, h); g.lineTo(80, 200); g.arc(256, 200, 176, Math.PI, 0); g.lineTo(432, h); g.stroke();
      g.fillStyle = '#d0c8b0'; g.font = 'bold 40px Georgia'; g.textAlign = 'center'; g.fillText('CAPELA', w / 2, 70); g.font = '26px Georgia'; g.fillText('1931', w / 2, 102);
    });
    const ad = U.decal(arco, 2.4, 2.4, 28, 1.2, -30.13, Math.PI, { mat: { transparent: false } });
    let batT = 1.5, calou = false;
    U.rotulo(ad, () => 'Um arco de tijolos novos fechando uma passagem velha. Gravado na pedra: “CAPELA — 1931”.' + (calou ? ' Do outro lado, silêncio.' : ''));
    tick((t, dt) => {
      if (calou || !A.P.room || A.P.room.id !== 'saida') return; const d = U.dist(28, -30.2);
      if (d < 2.6) { calou = true; U.depois(.6, () => U.fala('...pararam. Quando eu cheguei perto, pararam.')); return; }
      batT -= dt; if (batT <= 0 && d < 10) { batT = 2.4 + Math.random() * 1.6; som.batidas({ x: 28, y: .8, z: -29.6 }, 3 + (Math.random() * 3 | 0), .22, 600, .28); }
    });
    const gr = U.tex(128, 128, g => { const r = g.createRadialGradient(64, 64, 4, 64, 64, 64); r.addColorStop(0, 'rgba(255,170,80,.75)'); r.addColorStop(1, 'rgba(60,20,4,.6)'); g.fillStyle = r; g.fillRect(0, 0, 128, 128); g.fillStyle = 'rgba(8,6,4,.95)'; for (let i = 0; i < 6; i++) g.fillRect(6 + i * 21, 0, 9, 128); });
    const gc = new THREE.Mesh(new THREE.PlaneGeometry(.8, .8), new THREE.MeshBasicMaterial({ map: gr, transparent: true })); gc.rotation.x = Math.PI / 2; gc.position.set(27, 2.78, -33.4); A.W.grupo.add(gc);
    const cinzas = [];
    for (let i = 0; i < 18; i++) { const c = new THREE.Mesh(new THREE.PlaneGeometry(.02, .02), new THREE.MeshBasicMaterial({ color: 0x9a9088, transparent: true, opacity: .7, depthWrite: false, side: THREE.DoubleSide })); c.position.set(27 + (Math.random() - .5) * .7, Math.random() * 2.7, -33.4 + (Math.random() - .5) * .7); A.W.grupo.add(c); cinzas.push(c); }
    tick((t, dt) => {
      for (const c of cinzas) { c.position.y -= dt * .35; c.position.x += Math.sin(t * 1.3 + c.id) * dt * .05; c.rotation.z += dt; if (c.position.y < nivel()) c.position.y = 2.75; }
      if (!S.flags.sl_gradeTeto && U.dist(27, -33.4) < 2.6 && A.P.pitch > .7) { S.flags.sl_gradeTeto = true; U.fala('É o chão da capela. Tô bem embaixo dela. Tá caindo cinza.'); }
    });
    const ins = U.decal(A.textoTex([{ t: 'Feito por ordem do Pe. Osvaldo', tam: 26, y: 40 }, { t: 'para guardar o silêncio da casa — 1931', tam: 22, y: 80 }], { w: 512, h: 112, fundo: '#6a4a38', cor: '#2a1a10', manchas: 2 }), .7, .16, 31.87, 2.15, -37.4, -Math.PI / 2, { mat: { transparent: false } });
    U.rotulo(ins, 'Num tijolo, gravado: “Feito por ordem do Pe. Osvaldo para guardar o silêncio da casa — 1931”.');
  }

  // ---------- A ÁGUA: folhas do livro de ocorrências, brinquedos com nome, o crachá, o reflexo
  const folhas = [];
  { const textos = [
      '03/1947 — aluna I. falou durante o sino. Pavilhão de baixo. Não voltou.',
      '03/1955 — aluno J. (7) falou durante a Hora. Armário. Transferido.',
      '03/1962 — bebê da roda, sem nome. Chorava à noite. Cisterna. Não constar.',
      '03/1965 — aluna R. (8) chorou. Armário. Transferida.',
      '03/1975 — aluno B., 9 anos, sem documentos. Armário 7. Não constar.',
      '03/1979 — capela trancada. Não constar nada.'
    ];
    const pos = [[0, -12], [-.8, -27], [3, -33], [-3.5, -38], [-12, -18], [12, -17.6]];
    textos.forEach((tx, i) => {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(.22, .3), new THREE.MeshStandardMaterial({ map: U.tex(128, 160, g => { g.fillStyle = 'rgba(196,186,156,.92)'; g.fillRect(4, 4, 120, 152); g.fillStyle = 'rgba(40,30,20,.6)'; for (let l = 0; l < 9; l++) g.fillRect(12, 18 + l * 15, 70 + Math.random() * 30, 2); }), transparent: true, roughness: 1 }));
      m.rotation.x = -Math.PI / 2; m.position.set(pos[i][0], .43, pos[i][1]); A.W.grupo.add(m);
      U.rotulo(m, `Uma folha boiando, do livro de ocorrências: “${tx}”`);
      folhas.push({ m, f: Math.random() * 6, x: pos[i][0], z: pos[i][1] });
    });
  }
  const etiquetas = [];
  { const ns = [['ROSA', -3.4, -35.5], ['LUIZ', 3.6, -39.2], ['JOÃO', -1.1, -12.5], ['MARIA', .9, -47.5]];
    for (const [n, x, z] of ns) {
      const g = new THREE.Group(); g.position.set(x, .06, z); A.W.grupo.add(g);
      box(.14, .1, .14, new THREE.MeshStandardMaterial({ color: 0x5a4a30, roughness: .9 }), 0, 0, 0, g, false);
      A.plano(.12, .05, new THREE.MeshStandardMaterial({ map: A.textoTex([{ t: n, tam: 40, estilo: 'bold' }], { w: 128, h: 48, fundo: '#d8ccb0', cor: '#5a1410', manchas: 1 }) }), 0, .02, .072, 0, g);
      g.visible = !!S.flags.aguaBaixa;
      U.rotulo(g, `Um brinquedo de pano com uma etiqueta costurada: ${n}.`);
      etiquetas.push({ g, n, x, z, dito: false });
    }
  }
  const cracha = new THREE.Group(); cracha.position.set(-2.2, .03, -33.6); A.W.grupo.add(cracha);
  { box(.09, .005, .13, MAT.ferrugem, 0, 0, 0, cracha, false); const ft = A.plano(.05, .06, new THREE.MeshStandardMaterial({ map: A.textoTex([{ t: 'M. DUARTE', tam: 20, y: 110 }, { t: 'INSPETOR', tam: 16, y: 140 }], { w: 128, h: 160, fundo: '#a89878', cor: '#1a1410', manchas: 3 }) }), 0, .004, .02, 0, cracha); ft.rotation.x = -Math.PI / 2; }
  cracha.visible = !!S.flags.aguaBaixa && !S.flags.sl_cracha;
  U.rotulo(cracha, '<b>E</b>Pegar um crachá enferrujado', () => {
    if (S.flags.sl_cracha) return; S.flags.sl_cracha = true; cracha.visible = false; A.SFX.pegar();
    A.toast('“M. DUARTE — INSPETOR DE DISCIPLINA”. Na foto, um homem novo, de olhos abertos.');
    U.depois(2.2, () => U.fala('Ele tinha olhos bons. Antes disso tudo.'));
  });
  const reflexo = new THREE.Mesh(new THREE.PlaneGeometry(.55, 1.45), new THREE.MeshBasicMaterial({ map: U.tex(64, 160, g => { g.fillStyle = 'rgba(14,22,30,.95)'; g.beginPath(); g.arc(32, 140, 15, 0, 7); g.fill(); g.fillRect(18, 40, 28, 92); g.fillRect(20, 4, 9, 40); g.fillRect(35, 4, 9, 40); }), transparent: true, opacity: 0, depthWrite: false }));
  reflexo.rotation.x = -Math.PI / 2; reflexo.renderOrder = 4; A.W.grupo.add(reflexo);
  let reflexoT = 0, reflexoCd = 18;
  const valvPos = { 1: [-33.85, -18], 2: [33.85, -18], 3: [-4, -41.85] };

  // ---------- Benedito: o menino sem nome do armário 7
  const lockers = A.W.lockers.filter(l => l.tipo === 'armario');
  if (S.flags.sl_arm7 == null) S.flags.sl_arm7 = Math.random() * lockers.length | 0;
  const arm7 = lockers[S.flags.sl_arm7 % Math.max(1, lockers.length)];
  if (arm7) { const t7 = U.tex(64, 64, g => { g.fillStyle = 'rgba(200,190,160,.85)'; g.font = 'bold 48px Georgia'; g.textAlign = 'center'; g.fillText('7', 32, 50); }); const d = U.decal(t7, .16, .16, 0, 1.25, .34, 0, { parent: arm7.g }); void d; }
  let benT = 0, benFase = 0;

  // ---------- vida do subterrâneo (sino distante, canos que repetem, brasa, reflexo)
  let sinoT = 70 + Math.random() * 40, canoT = 45 + Math.random() * 35;
  const ecos = [
    ['voz', '(nos canos, de muito longe) ...passos pequenos, correndo descalços...'],
    ['diretor', '(nos canos, distorcido) Silêncio no dormitório B.'],
    ['voz', '(nos canos, com a SUA voz) ...Lia? Lia, cadê você?'],
    ['voz', '(nos canos) uma porta batendo, três vezes, e depois nada.']
  ];
  let ecoI = 0;
  A.W.tick.push(dt => {
    const t = A.perf(), P = A.P, M = A.M;
    for (const f of ticks) f(t, dt);
    // folhas boiando (grudam no chão quando a água baixa)
    const n = nivel();
    for (const F of folhas) { F.m.position.y = n > .06 ? n + .004 : .012; if (n > .06) { F.m.rotation.z += dt * .05; F.m.position.x = F.x + Math.sin(t * .15 + F.f) * .25; } }
    // brinquedos com nome e o crachá, só com a água baixa
    for (const E of etiquetas) { E.g.visible = !!S.flags.aguaBaixa; if (E.g.visible && !E.dito && U.iluminado(E.x, .06, E.z, 3.5, .95)) { E.dito = true; A.SFX.sussurros(.7); A.sub('voz', `(bem baixinho, perto do chão) ...${E.n[0]}${E.n.slice(1).toLowerCase()}.`); } }
    cracha.visible = !!S.flags.aguaBaixa && !S.flags.sl_cracha;
    bispo.obj.visible = !!S.flags.cofre;
    // poltrona, fantasma, cigarro, negatoscópio, máscaras, foto de 1951
    const naSala = P.room && P.room.id === 'secreta';
    if (naSala) {
      if (S.fitas.f7) pol.rotation.y = Math.atan2(P.pos.x - pol.position.x, P.pos.z - pol.position.z);
      const dP = U.dist(pol.position.x, pol.position.z), escuro = !S.flashOn || A.flash.intensity < 1;
      const alvo = escuro && dP < 7 && dP > 1.6 ? .82 : 0; const fm = fant.userData.mat; fm.opacity += (alvo - fm.opacity) * Math.min(1, dt * (alvo ? 1.2 : 6));
      if (fm.opacity > .5 && U.olhando(pol.position.x, 1, pol.position.z, .9, 8)) U.uma('sl_fantasma', () => { S.fear = Math.min(100, S.fear + 22); A.SFX.suspiro({ x: pol.position.x, y: 1.3, z: pol.position.z }); U.depois(1.5, () => U.fala(S.fitas.f7 ? 'A poltrona... tá virada pra mim.' : 'Tem alguém sentado na poltrona. De costas. Não acende a luz... acende a luz!')); });
      const ligado = !!S.flags.sl_nega; const pertoM = M.ativo && M.pos.distanceTo(P.pos) < 12;
      nega.emissiveIntensity = ligado ? (pertoM && Math.random() < .3 ? .15 : .9 + Math.sin(t * 40) * .03) : 0;
      if (!mascVirou && S.flags.apagao) { mascVirou = true; for (const m of mascaras) { m.lookAt(P.pos.x, 1.7, P.pos.z); m.rotateY(-Math.PI / 2); } }
      if (!foto5Vista && U.olhando(-7.86, 1.75, -58.5, .9, 8)) foto5Vista = true;
      else if (foto5Vista && foto5.visible && !U.olhando(-7.86, 1.75, -58.5, .5, 12)) { foto5Costas += dt; if (foto5Costas > 1.4) { foto5.visible = false; A.SFX.estalo({ x: -7.9, z: -58.5 }, .3); } }
    }
    const acesoCig = !S.flags.cofre;
    ponta.visible = acesoCig; ponta.scale.setScalar(1 + Math.sin(t * 3) * .3);
    for (const F of fumaca) { F.t += dt * .25; if (F.t > 1) F.t -= 1; F.s.position.set(mesinha.x - .02 + Math.sin(F.t * 9) * .02, .6 + F.t * .6, mesinha.z + Math.cos(F.t * 7) * .02); F.s.material.opacity = acesoCig ? .25 * (1 - F.t) : 0; F.s.scale.setScalar(.04 + F.t * .12); }
    // a brasa de cigarro que acende no escuro e some com a luz
    const brasaSala = P.room && (P.room.id === 't4' || P.room.id === 'secreta');
    if (brasaVida > 0) {
      brasaVida -= dt; brasa.material.opacity = Math.min(1, brasaVida) * (.55 + Math.sin(t * 2.2) * .35);
      if (U.dist(brasa.position.x, brasa.position.z) < 3.5 || (U.luz() && U.olhando(brasa.position.x, brasa.position.y, brasa.position.z, .96, 6))) brasaVida = Math.min(brasaVida, .25);
    } else { brasa.material.opacity = 0; if (brasaSala) { brasaT -= dt; if (brasaT <= 0) { brasaT = 25 + Math.random() * 25; const r = P.room, a = P.yaw + Math.PI + (Math.random() - .5) * 1.4, dd = 5 + Math.random() * 3; brasa.position.set(Math.max(r.x0 + .4, Math.min(r.x1 - .4, P.pos.x - Math.sin(a) * dd)), 1.66, Math.max(r.z0 + .4, Math.min(r.z1 - .4, P.pos.z - Math.cos(a) * dd))); brasaVida = 6; U.uma('sl_brasa', () => { A.toast('Cheiro de cigarro e cera.'); U.depois(2.5, () => U.fala('Cigarro. Ainda. Ele também ficou aqui embaixo.')); }); } } }
    // o reflexo do Davi na água funda: olhe para baixo
    reflexoCd -= dt;
    const alta = !S.flags.aguaBaixa && n > .3;
    if (reflexoT > 0) { reflexoT -= dt; reflexo.material.opacity = Math.min(.5, reflexoT * .6, (3 - reflexoT) * 1.2); reflexo.position.y = n + .006; if (!U.olhando(reflexo.position.x, n, reflexo.position.z, .75, 5)) reflexoT = Math.min(reflexoT, .3); }
    else { reflexo.material.opacity = 0; if (alta && P.naAgua && !S.hidden && P.pitch < -.6 && reflexoCd <= 0 && (!M.ativo || M.pos.distanceTo(P.pos) > 10)) {
      reflexoCd = 40; reflexoT = 3; let lado = 1;
      const prox = S.ordem[S.valv.length], vp = valvPos[prox];
      if (vp && P.room && P.room.id === 'hub') { const ax = vp[0] - P.pos.x, az = vp[1] - P.pos.z, rx = Math.cos(P.yaw), rz = -Math.sin(P.yaw); lado = ax * rx + az * rz >= 0 ? 1 : -1; }
      const fx = -Math.sin(P.yaw), fz = -Math.cos(P.yaw), rx = Math.cos(P.yaw), rz = -Math.sin(P.yaw);
      reflexo.position.set(P.pos.x + fx * .9 + rx * .55 * lado, n + .006, P.pos.z + fz * .9 + rz * .55 * lado); reflexo.rotation.z = -P.yaw + Math.PI;
      U.uma('sl_reflexo', () => U.depois(3.4, () => U.fala('Na água... tinha um menino do meu lado. Não tem ninguém do meu lado.')));
    } }
    // de vez em quando o sino bate lá em cima e a água inteira se arrepia
    if (S.chapter === 4) {
      sinoT -= dt;
      if (sinoT <= 0) { sinoT = 80 + Math.random() * 50; A.SFX.sinoLonge(); if (alta && P.room && P.room.agua) for (let i = 0; i < 6; i++) { const a = i / 6 * 6.28; U.depois(i * .12, () => O.criar(P.pos.x + Math.cos(a) * 2.5, nivel(), P.pos.z + Math.sin(a) * 2.5, 1.2, .3, 2)); } U.uma('sl_sinoLonge', () => U.depois(2.4, () => U.fala('O sino... a capela fica em cima desses túneis?'))); }
      canoT -= dt;
      if (canoT <= 0) { canoT = 55 + Math.random() * 45; const [q, txt] = ecos[ecoI++ % ecos.length]; A.SFX.sussurros(1.2); A.sub(q, txt); }
    }
    // Benedito: escondida no armário 7, prendendo o ar, com ele longe
    if (arm7 && S.hidden === arm7 && P.prende && !LS.get(BENED_KEY, false) && (!M.ativo || M.pos.distanceTo(P.pos) > 14)) {
      benT += dt;
      if (benT > 3.5 && benFase === 0) { benFase = 1; som.respiro({ x: arm7.x, y: 1.3, z: arm7.z }, .14); }
      if (benT > 9 && benFase === 1) { benFase = 2; LS.set(BENED_KEY, true); A.SFX.sussurros(1); A.sub('voz', '(bem perto, dentro do armário, com você) ...Benedito. Ninguém lembra.'); A.conquista('sl_benedito'); S.fear = Math.min(100, S.fear + 15); U.depois(5, () => U.fala('Tinha mais alguém no armário. Igual o Tomé disse.')); }
    } else if (benFase < 2) { benT = 0; benFase = 0; }
    // correias do depósito balançando sem vento
    for (const c of correias) c.rotation.x = Math.sin(t * 1.1 + c.position.x * 3) * .12;
    // mural de giz: cada desenho aparece quando a lanterna passa por ele
    for (const Mu of mural) {
      if (Mu.k < 1 && U.iluminado(Mu.x, 1, -37.9, 5.5, .93)) { Mu.k = Math.min(1, Mu.k + dt * .7); if (Mu.k >= 1 && Mu.fresco) U.uma('sl_mural', () => U.depois(.5, () => U.fala('Uma mulher com lanterna chegando no portão... o giz tá fresco. Ele desenhou isso hoje.'))); }
      Mu.d.material.opacity = Mu.k;
    }
  });

  X.entrouSala = r => {
    if (r.id === 'secreta' && !S.flags.sl_nega) { S.flags.sl_nega = true; A.SFX.clique(); U.depois(.3, () => A.SFX.estalo({ x: 4.4, z: -65.8 }, .25)); }
  };
  X.notaLida = id => {
    if (id === 'sl_reg') { A.conquista('sl_velho'); U.depois(1, () => U.fala('“Às nove horas toca-se o sino”... A Hora já existia antes do Moacir. Antes de todo mundo.')); }
    if (id === 'sl_transf') U.depois(1, () => U.fala('Um, um, um, dois... dezessete crianças “transferidas”. Todas em março.'));
    if (id === 'sl_cartas') U.depois(1, () => U.fala('A mãe escreveu seis anos. Eu escrevi também. Ninguém nunca entregou.'));
    if (id === 'sl_caixa') U.depois(1, () => U.fala('Querosene e um cadeado pra capela. No mesmo dia.'));
    if (id === 'sl_fichas') U.depois(1, () => U.fala('“Irmã mais velha fez perguntas.” Sou eu. Ele sabia de mim.'));
    if (id === 'sl_bispo') U.depois(1, () => U.fala('Não foi um homem só. Foi a casa inteira.'));
    if (id === 'sl_arquivo') U.depois(1, () => U.fala('Quarenta e uma crianças que ninguém procurou.'));
  };
  return juntar(def, X);
}

// =====================================================================
// CEMITÉRIO E CAPELA (Capítulo V)
// =====================================================================
// antes de montar as lápides: aoLer e variações que dependem do que a Lia já viu
export function antesCemiterio(A, S) {
  const L = nome => A.R.lapides.find(l => l.nome === nome || l.id === nome);
  let marcoLidas = 0;
  for (const n of ['JOÃO, 7 ANOS', 'LUIZ, 11 ANOS', 'MARIA DAS DORES', 'ROSA, 8 ANOS']) {
    const l = L(n); if (!l) continue;
    const ant = l.aoLer;
    l.aoLer = () => {
      if (ant) ant();
      const ja = (S.flags.sl_marco = S.flags.sl_marco || {}); if (!ja[n]) { ja[n] = true; marcoLidas = Object.keys(ja).length; if (marcoLidas === 3) setTimeout(() => { if (A.W.mapa === 'cemiterio') A.sub('lia', 'Março. Todos em março. A vida inteira desse lugar acontecia em março.'); }, 1800); }
      if (n === 'JOÃO, 7 ANOS' && S.flags.sl_gude && !S.flags.sl_gudeJoao) { S.flags.sl_gudeJoao = true; setTimeout(() => A.sub('lia', 'A bolinha da cisterna... era dele.'), 1200); }
      if (n === 'LUIZ, 11 ANOS' && S.flags.sl_confisc && !S.flags.sl_piaoLuiz) { S.flags.sl_piaoLuiz = true; setTimeout(() => A.sub('lia', 'O pião da caixa do túnel. Alguém tirou de lá e trouxe pra ele.'), 1200); }
      if (n === 'ROSA, 8 ANOS' && S.flags.sl_confisc && !S.flags.sl_fitaRosa) { S.flags.sl_fitaRosa = true; setTimeout(() => A.sub('lia', 'A fita vermelha da caixa dos confiscados. Devolveram pra ela.'), 1200); }
    };
  }
  for (const id of ['semnome62', 'semnome75']) {
    const l = L(id); if (!l || l.nome !== 'SEM NOME') continue;
    if (id === 'semnome75' && LS.get(BENED_KEY, false)) Object.assign(l, { nome: 'BENEDITO', datas: '1966 — 1975', epitafio: 'Alguém riscou um nome na pedra, com unha de criança. Agora alguém lembra.' });
    const ant = l.aoLer;
    l.aoLer = () => { if (ant) ant(); if (S.flags.sl_marcas && !S.flags['sl_ano' + id]) { S.flags['sl_ano' + id] = true; setTimeout(() => A.sub('lia', id === 'semnome62' ? 'Sessenta e dois. Tava pintado na cisterna, numa marca de enchente.' : 'Setenta e cinco. Outra marca de cheia. Outra criança sem nome.'), 1200); } };
  }
  const cel = L('IRMÃ CELESTE'); if (cel) { const ant = cel.aoLer; cel.aoLer = () => { if (ant) ant(); if (!S.flags.sl_celeste) { S.flags.sl_celeste = true; setTimeout(() => A.sub('lia', 'Transferida não. Trancada. Ela tava lá dentro com eles.'), 1400); } }; }
  const alb = L('albano'); if (alb) { const ant = alb.aoLer; alb.aoLer = () => { if (ant) ant(); if (S.inv.pa && !S.flags.sl_covaAlb) setTimeout(() => A.toast('A terra na frente da pedra do diretor está fofa demais. Dá para cavar.'), 900); }; }
}

export function carvao(A) { return new A.THREE.MeshStandardMaterial({ color: 0x1e1814, roughness: 1, emissive: 0x050302, emissiveIntensity: .4 }); }

// as batidas do outro lado da porta trancada
export function tentouCapela(A, S) {
  const som = sonsL(A); som.batidas({ x: 0, y: 1.1, z: -48.6 }, 3, .3, 450, .4);
  if (!S.flags.sl_bateuPorta) { S.flags.sl_bateuPorta = true; setTimeout(() => { if (A.W.mapa === 'cemiterio') A.sub('lia', 'Tem alguém batendo. Do lado de dentro.'); }, 1700); }
}

export function cemiterio(A, S, def, ctx) {
  const U = base(A, S), som = sonsL(A), { THREE } = U, { MAT, box, cyl, prop } = A;
  const X = {}, ticks = []; const tick = f => ticks.push(f);
  const cq = LS.get(CONQ_KEY, {});
  const raio = () => Math.min(1, (A.raioI || 0) * 2.6);

  // ---------- A PORTA DA CAPELA: por fora a tranca, por dentro as mãos
  const D = A.DOOR('cap');
  if (D) {
    const piv = D.pivot;
    const dentro = U.tex(512, 640, (g, w, h) => {
      const gr = g.createLinearGradient(0, h, 0, h * .35); gr.addColorStop(0, 'rgba(8,6,4,.5)'); gr.addColorStop(1, 'rgba(8,6,4,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
      const yM = m => h - m / 2.2 * h;
      for (let i = 0; i < 46; i++) { const x = 40 + Math.random() * 430, y = yM(.35 + Math.random() * .95), s = .8 + Math.random() * .5, a = (Math.random() - .5) * .9; mao(g, x + 2, y + 2, s * 1.08, a, 'rgba(4,3,2,.75)'); mao(g, x, y, s, a, i % 3 ? `rgba(150,140,124,${.35 + Math.random() * .3})` : 'rgba(6,5,4,.9)'); }
      mao(g, 240, yM(1.62), 1.7, .1, 'rgba(10,8,6,.75)');
      g.strokeStyle = 'rgba(190,150,110,.75)'; g.lineWidth = 3; for (let i = 0; i < 9; i++) { g.beginPath(); const x = 400 + i * 9; g.moveTo(x, yM(1.12)); g.lineTo(x + 2 + Math.random() * 3, yM(.86)); g.stroke(); }
      for (let i = 0; i < 30; i++) { g.strokeStyle = `rgba(180,140,100,${.2 + Math.random() * .4})`; g.lineWidth = 1.5; g.beginPath(); const x = 60 + Math.random() * 380, y = yM(.4 + Math.random() * .8); g.moveTo(x, y); g.lineTo(x + Math.random() * 6 - 3, y + 20 + Math.random() * 30); g.stroke(); }
    });
    const md = U.decal(dentro, 1.86, 2.2, 1, 1.1, -.045, Math.PI, { parent: piv });
    const nomesT = U.tex(256, 96, g => { g.fillStyle = 'rgba(200,160,120,.85)'; g.font = '26px "Special Elite",monospace'; g.fillText('DAVI', 14, 40); g.fillText('ANA', 100, 56); g.fillText('TOMÉ', 168, 36); });
    const nomes = U.decal(nomesT, .5, .19, 1.15, .62, -.047, Math.PI, { parent: piv, mat: { opacity: 0 } });
    void md;
    const fora = U.tex(256, 128, g => { g.fillStyle = 'rgba(14,10,8,.8)'; g.fillRect(0, 0, 256, 128); });
    U.decal(fora, 1.86, .9, 1, .45, .045, 0, { parent: piv, mat: { opacity: .55 } });
    const ald = new THREE.Group(); ald.position.set(1.72, 1.12, .07); piv.add(ald);
    box(.22, .05, .03, MAT.ferrugem, 0, 0, 0, ald, false); const cad = box(.09, .11, .04, new THREE.MeshStandardMaterial({ color: 0x2a2420, roughness: .6, metalness: .5 }), .08, -.08, .01, ald, false); cad.rotation.z = .5; cad.scale.set(1, .8, 1.3);
    const ini = A.plano(.07, .035, new THREE.MeshStandardMaterial({ map: A.textoTex([{ t: 'A.T.', tam: 36, estilo: 'bold' }], { w: 64, h: 32, fundo: '#3a3430', cor: '#a89070', manchas: 1 }) }), .08, -.08, .032, 0, ald); ini.rotation.z = .5;
    box(.08, .3, .06, MAT.ferrugem, 1.15, 1.12, -47.9);
    const cig = cyl(.006, .006, .05, MAT.papel, .4, .006, -47.45, 5); cig.rotation.z = Math.PI / 2; cig.scale.y = .6;
    const terco = new THREE.Group(); terco.position.set(.65, .01, -48.6); A.W.grupo.add(terco);
    for (let i = 0; i < 14; i++) { const a = i / 14 * 6.28; const c = new THREE.Mesh(new THREE.SphereGeometry(.012, 5, 4), new THREE.MeshStandardMaterial({ color: 0x2a201a, roughness: .5 })); c.position.set(Math.cos(a) * .07, 0, Math.sin(a) * .05); c.scale.y = .5; terco.add(c); }
    box(.012, .004, .05, MAT.metal, .1, 0, 0, terco, false);
    U.rotulo(terco, 'Um terço derretido no chão, colado à pedra.', () => U.uma('sl_terco', () => U.fala('O terço da Irmã Celeste. Ela ficou com eles até o fim.')));
    tick(t => {
      const P = A.P, dentroCap = P.pos.z < -48.4;
      nomes.material.opacity = dentroCap && U.luz() && U.dist(0, -48) < 1.9 ? Math.min(.95, nomes.material.opacity + .03) : Math.max(0, nomes.material.opacity - .03);
      if (nomes.material.opacity > .7) U.uma('sl_nomesPorta', () => U.fala('DAVI. ANA. TOMÉ. Riscados com a unha.'));
      if (dentroCap && S.done.capela && U.olhando(0, 1.1, -48, .85, 4.5)) U.uma('sl_maosPorta', () => { U.fala('Eles bateram aqui. Por dentro.'); U.depois(3.6, () => U.fala('Nove riscos de unha. Eles contaram as badaladas daqui de dentro.')); if (S.fitas.f7) U.depois(7.5, () => U.fala('Ele ouviu as batidas até o fim. E deixou.')); });
      if (!dentroCap && P.pos.z < -44 && U.olhando(1.6, 1.1, -47.9, .9, 4)) U.uma('sl_tranca', () => U.fala(S.fitas.f7 ? 'Uma tranca do lado de fora. “A.T.” Albano Teixeira. Como ele disse na fita.' : 'Uma tranca do lado de fora. Trancaram por fora.'));
      if (dentroCap && U.iluminado(.65, .05, -48.6, 3, .9)) U.uma('sl_terco', () => U.fala('O terço da Irmã Celeste. Ela ficou com eles até o fim.'));
    });
  }

  // ---------- A CAPELA POR DENTRO: cinzas, sapatinhos, bancos entalhados, quadro de promessas
  { const cz = U.tex(256, 256, g => { for (let i = 0; i < 26; i++) { const x = Math.random() * 256, y = Math.random() * 256, r = 20 + Math.random() * 50; const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, 'rgba(60,56,52,.55)'); gr.addColorStop(1, 'rgba(60,56,52,0)'); g.fillStyle = gr; g.fillRect(0, 0, 256, 256); } });
    for (const [x, z, s] of [[-3, -53, 4], [3.5, -57, 3.5], [0, -61, 5], [-4.5, -63, 3], [4, -51, 3]]) U.chao(cz, s, s, x, z, Math.random() * 6, .006); }
  const sapMat = new THREE.MeshStandardMaterial({ color: 0x2a1e16, roughness: .8 });
  { const n = 34, inst = new THREE.InstancedMesh(new THREE.BoxGeometry(.07, .05, .15), sapMat, n * 2), m = new THREE.Matrix4(), q = new THREE.Quaternion(), s = new THREE.Vector3(1, 1, 1), p = new THREE.Vector3();
    let k = 0; const vazios = [];
    for (let i = 0; i < 5 && k < n * 2; i++) for (const bx of [-4, 4]) for (let j = 0; j < 4 && k < n * 2; j++) {
      const x = bx - 1.9 + j * 1.25 + (Math.random() - .5) * .2, z = -51 - i * 2 - .45;
      if (i === 4 && bx === -4 && j < 3) { vazios.push([x, z]); continue; }
      for (const d of [-.05, .05]) { q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), (Math.random() - .5) * .3); m.compose(p.set(x + d, .025, z), q, s); inst.setMatrixAt(k++, m); }
    }
    inst.count = k; A.W.grupo.add(inst);
    const tres = new THREE.Group(); A.W.grupo.add(tres);
    for (const [x, z] of vazios) for (const d of [-.05, .05]) box(.07, .05, .15, sapMat, x + d, .025, z, tres, false);
    tres.visible = S.placed >= 3;
    tick(() => { if (!tres.visible && S.placed >= 3) { tres.visible = true; } });
    const rot = box(2.6, .03, .3, new THREE.MeshBasicMaterial({ visible: false }), -4.6, .03, -59.45, A.W.grupo, false);
    U.rotulo(rot, () => tres.visible ? 'Pares de sapatos de criança cobertos de cera. Na primeira fila, os três lugares vazios agora estão ocupados.' : 'Pares de sapatos de criança na frente dos bancos, cobertos de cera e fuligem. Na primeira fila, três lugares vazios.');
  }
  { const ent = U.tex(512, 64, g => { g.fillStyle = 'rgba(200,170,120,.7)'; g.font = '22px "Special Elite",monospace'; const ns = ['ZÉ 52', 'NINO 63', 'CÉLIA 71', 'IRENE 47', 'JOÃO 55', 'ROSA 65']; ns.forEach((n, i) => g.fillText(n, 10 + i * 82, 38 + (i % 2) * 14)); });
    for (let i = 0; i < 5; i++) for (const x of [-4, 4]) if (!(i === 4 && x === -4)) U.decal(ent, 4.6, .3, x, .72, -50.705 - i * 2, 0, { mat: { opacity: .8 } });
    const ult = U.decal(U.tex(512, 64, g => { g.fillStyle = 'rgba(220,190,140,.9)'; g.font = 'bold 28px "Special Elite",monospace'; g.fillText('DAVI ANA TOMÉ 79', 20, 44); g.fillStyle = 'rgba(220,190,140,.35)'; g.font = '22px "Special Elite",monospace'; g.fillText('LIA', 400, 46); }), 2.2, .28, -4.6, .72, -58.705, 0);
    U.rotulo(ult, 'Nomes entalhados a canivete nos bancos, com anos: 1947, 1952, 1963, 1971... No último: “DAVI ANA TOMÉ 79”. Ao lado, quase apagado: LIA.', () => U.uma('sl_banco', () => U.fala('Outras crianças tentaram o sino antes. E ele já sabia que eu vinha.')));
  }
  { const q = U.tex(512, 384, (g, w, h) => {
      g.fillStyle = '#3a2a22'; g.fillRect(0, 0, w, h); g.strokeStyle = '#1a120c'; g.lineWidth = 12; g.strokeRect(6, 6, w - 12, h - 12);
      for (let i = 0; i < 8; i++) { const x = 30 + (i % 4) * 118, y = 30 + Math.floor(i / 4) * 170; g.fillStyle = '#a89878'; g.fillRect(x, y, 56, 70); g.fillStyle = '#3a3026'; g.beginPath(); g.arc(x + 28, y + 30, 14, 0, 7); g.fill(); g.fillRect(x + 12, y + 46, 32, 24); }
      const b = ['que eu volte pra casa', 'que meu irmão me escreva', 'que o seu moacir fique surdo', 'que a hora acabe']; b.forEach((t, i) => { const x = 96 + (i % 2) * 220, y = 120 + Math.floor(i / 2) * 170; g.save(); g.translate(x, y); g.rotate((Math.random() - .5) * .2); g.fillStyle = '#d8ccb0'; g.fillRect(0, 0, 200, 38); g.fillStyle = '#2a2010'; g.font = '16px "Special Elite",monospace'; g.fillText(t, 8, 25); g.restore(); });
    });
    const qd = U.decal(q, 1.3, .98, -7.88, 1.65, -52.6, Math.PI / 2, { mat: { transparent: false } });
    U.rotulo(qd, '<b>E</b>Ler o quadro de promessas', () => { A.toast('Bilhetes de criança, presos com alfinete: “que eu volte pra casa” · “que meu irmão me escreva” · “que o seu Moacir fique surdo” · “que a hora acabe”.'); U.uma('sl_promessas', () => U.depois(3, () => U.fala('Todo mundo aqui pedia a mesma coisa. Silêncio, de um jeito ou de outro.'))); });
  }

  // ---------- A TORRE: os risquinhos de quinze anos, a viga das datas, o ninho do Davi, a corda
  { const t = U.tex(1024, 512, (g, w, h) => {
      let n = 0; const tot = 5475;
      for (let r = 0; r < 26 && n < tot; r++) for (let c = 0; c < 44 && n < tot; c++) { const k = Math.min(5, tot - n); tracos(g, 6 + c * 23, 6 + r * 19.5, k, 13, 3.4, `rgba(232,228,214,${.4 + Math.random() * .35})`); n += 5; }
      tracos(g, 6 + 44 * 23 - 23, h - 30, 3, 13, 3.4, 'rgba(250,248,240,.95)');
    });
    const tal = U.decal(t, 4.8, 2.4, 7.88, 1.45, -64.2, -Math.PI / 2);
    U.rotulo(tal, 'A parede inteira coberta de risquinhos de giz em grupos de cinco. Uma noite cada. O último grupo está incompleto.', () => U.uma('sl_riscos', () => U.fala('Toda noite. Quinze anos. Sozinho.')));
    tick(() => { if (!S.flags.sl_riscos && U.iluminado(7.9, 1.4, -64.2, 4, .85)) U.uma('sl_riscos', () => U.fala('Toda noite. Quinze anos. Sozinho.')); });
    const vigaTex = (fim) => A.textoTex([{ t: Array.from({ length: 14 }, (_, i) => 1980 + i).join('  ') + '  ' + (fim ? '1994' : '199'), tam: 17 }], { w: 1024, h: 48, fundo: '#3a2a1a', cor: '#c8b898', fonte: '"Special Elite",monospace', manchas: 2 });
    const viga = A.plano(4.2, .2, new THREE.MeshStandardMaterial({ map: vigaTex(!!S.flags.sino), roughness: 1 }), 7.86, 3.0, -64.2, -Math.PI / 2);
    box(.06, .26, 4.3, MAT.madeiraEsc, 7.9, 3.0, -64.2, A.W.grupo, false);
    U.rotulo(viga, () => S.flags.sino ? 'Quinze datas entalhadas com letra de criança, de 1980 a 1994. A última está completa agora.' : 'Quinze datas entalhadas com letra de criança, de 1980 a 1994. A última ficou pela metade: “199”.');
    let vigaFim = !!S.flags.sino;
    tick(() => { if (!vigaFim && S.flags.sino) { vigaFim = true; viga.material.map.dispose(); viga.material.map = vigaTex(true); viga.material.needsUpdate = true; } });
  }
  { const nx = 6.9, nz = -66.8;
    box(.62, .07, 1.3, new THREE.MeshStandardMaterial({ color: 0x5a6a7a, roughness: 1 }), nx, .035, nz, A.W.grupo, false);
    const cob = box(.5, .05, .6, new THREE.MeshStandardMaterial({ color: 0x8a5a4a, roughness: 1 }), nx, .09, nz + .3, A.W.grupo, false); cob.rotation.y = .3;
    const lt = cyl(.025, .03, .14, new THREE.MeshStandardMaterial({ color: 0x2a5a8a }), nx - .2, .1, nz - .45, 8); lt.rotation.z = Math.PI / 2;
    const cad = box(.16, .02, .22, new THREE.MeshStandardMaterial({ color: 0x2d4a2a }), nx + .15, .08, nz - .4);
    A.addCollider(nx - .31, nx + .31, nz - .65, nz + .65);
    U.rotulo(cad, '<b>E</b>Ler o caderno do colchonete', () => { A.toast('Contas a lápis, página atrás de página. A última diz “noite 5.478”. Embaixo: “amanhã a corda arrebenta”.'); U.uma('sl_ninhoDavi', () => U.depois(3, () => U.fala('Ele dormia aqui, do lado da corda. Quinze anos acordado.'))); });
  }
  const sinoP = ctx.sinoP;
  { if (ctx.corda) ctx.corda.visible = false;
    const cordaM = new THREE.MeshStandardMaterial({ color: 0x9a8a6a, roughness: 1 }), uni = [new THREE.MeshStandardMaterial({ color: 0x2a3a6a, roughness: 1 }), new THREE.MeshStandardMaterial({ color: 0xd8d4c8, roughness: 1 })];
    const corda = new THREE.Group(); corda.position.set(0, -3.1, 0); sinoP.add(corda);
    const c = cyl(.022, .026, 4.4, cordaM, 0, 0, 0, 6, corda);
    for (let i = 0; i < 15; i++) { const y = -2.0 + i * .26; const n = new THREE.Mesh(new THREE.SphereGeometry(.04, 6, 5), cordaM); n.position.y = y; n.scale.y = .8; corda.add(n); const tira = box(.1, .03, .012, uni[i % 2], .05, y - .03, 0, corda, false); tira.rotation.z = -.9 + (i % 3) * .2; }
    for (const [y, cor] of [[-1.0, 0x8a1420], [-.6, 0x1d4a7a], [-.2, 0x5a2a22]]) { const f = box(.14, .04, .01, new THREE.MeshStandardMaterial({ color: cor, roughness: .8 }), .07, y, .01, corda, false); f.rotation.z = -1.1; }
    const el = new THREE.Mesh(new THREE.TorusGeometry(.03, .007, 5, 10), new THREE.MeshStandardMaterial({ color: 0xd8a0b8 })); el.position.y = -1.35; el.rotation.x = Math.PI / 2; corda.add(el);
    void c;
  }
  // segurar a corda: as tiras de uniforme passam pela mão dela
  const itS = ctx.itSino;
  if (itS) {
    itS.guarda = true;
    const passos = [[.15, () => A.toast('Uma tira de uniforme amarrada na corda, com um nome bordado: ANA.')], [.38, () => A.toast('Outra tira, mais gasta: TOMÉ.')], [.6, () => A.toast('A última, quase desfeita: DAVI. E um elástico de cabelo cor-de-rosa... é seu.')], [.82, () => { A.P.shake = .3; A.SFX.estalo({ x: 4.8, z: -64 }, .9); A.toast('Um nó cede no meio da corda! Ela aguenta.'); }]];
    let pI = 0;
    tick(() => {
      if (S.flags.sino || pI >= passos.length) return;
      const k = (itS.progresso || 0) / itS.hold, seg = A.perf() - (itS.seguradoT ?? -9) < .1;
      if (seg && k >= passos[pI][0]) passos[pI++][1]();
    });
    const lb = itS.label;
    itS.label = () => { const s = lb(); return S.placed < 3 && !S.flags.sino ? 'O sino. Gravado no bronze: “SÃO LÁZARO · 1903 · QUE O SILÊNCIO NÃO SE ROMPA”. Riscado embaixo, a prego: “QUE A HORA ACABE — D.M.” A corda emendada com tiras de uniforme está podre, mas aguenta.' : s; };
  }

  // ---------- SOMBRAS NA PAREDE, VITRAL DAS NOVE CRIANÇAS, PERTENCES ANTIGOS
  const somb = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 1.4), new THREE.MeshBasicMaterial({ map: U.tex(256, 200, g => { g.fillStyle = 'rgba(8,6,4,.95)'; for (const [x, s] of [[60, 1.15], [128, .95], [196, .85]]) { g.beginPath(); g.arc(x, 200 - 150 * s, 15 * s, 0, 7); g.fill(); g.fillRect(x - 13 * s, 200 - 134 * s, 26 * s, 75 * s); g.fillRect(x - 11 * s, 200 - 60 * s, 9 * s, 60 * s); g.fillRect(x + 2 * s, 200 - 60 * s, 9 * s, 60 * s); } g.fillRect(70, 200 - 110, 50, 7); g.fillRect(138, 200 - 98, 46, 7); }), transparent: true, opacity: 0, depthWrite: false }));
  somb.position.set(-4.6, .75, -69.86); A.W.grupo.add(somb);
  const vitralTex = (rostos, alto) => U.tex(256, 448, (g, w, h) => {
    const cores = ['#6a1a20', '#1a3a6a', '#7a6a1a', '#1a5a3a', '#5a2a6a'];
    for (let y = 0; y < h; y += 32) for (let x = 0; x < w; x += 32) { g.fillStyle = cores[(x / 32 + y / 32 * 3) % 5]; g.fillRect(x, y, 32, 32); }
    g.strokeStyle = '#0a0806'; g.lineWidth = 4; for (let y = 0; y <= h; y += 32) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); } for (let x = 0; x <= w; x += 32) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); }
    if (alto) { g.fillStyle = 'rgba(6,4,4,.92)'; g.fillRect(100, 40, 56, 300); g.beginPath(); g.arc(128, 36, 26, 0, 7); g.fill(); }
    for (let i = 0; i < 9; i++) { const x = 44 + (i % 3) * 84, y = 150 + Math.floor(i / 3) * 96; g.fillStyle = '#e8dcc0'; bonequinho(g, x, y, 1.6, '#e8dcc0', i >= rostos); }
    g.lineWidth = 8; g.strokeRect(4, 4, w - 8, h - 8);
  });
  let rostosV = 6 + Math.min(3, S.placed), altoV = !!S.flags.sino;
  const vitral = A.plano(1.4, 2.45, new THREE.MeshBasicMaterial({ map: vitralTex(rostosV, altoV), color: 0x404040 }), -7.88, 3.5, -61, Math.PI / 2);
  U.rotulo(vitral, () => `Um vitral: nove crianças de mãos dadas, uma por badalada.${9 - rostosV ? ` ${9 - rostosV === 1 ? 'Uma está' : (9 - rostosV) + ' estão'} sem rosto.` : ' Todas com rosto agora.'}`);
  const antigos = new THREE.Group(); A.W.grupo.add(antigos);
  { const ceraM = new THREE.MeshStandardMaterial({ color: 0xe0d8c0, roughness: .6 });
    const b = new THREE.Mesh(new THREE.SphereGeometry(.025, 8, 6), MAT.vidro); b.position.set(-1.25, 1.08, -66.15); antigos.add(b);
    const pi = new THREE.Mesh(new THREE.ConeGeometry(.04, .08, 8), MAT.madeira); pi.rotation.x = Math.PI; pi.position.set(1.22, 1.1, -66.1); antigos.add(pi);
    box(.14, .01, .04, new THREE.MeshStandardMaterial({ color: 0x8a1420 }), -.35, 1.055, -66.35, antigos, false);
    const ceras = []; for (const [x, z] of [[-1.25, -66.15], [1.22, -66.1], [-.35, -66.35]]) { const c = new THREE.Mesh(new THREE.SphereGeometry(.07, 8, 6), ceraM); c.scale.y = .55; c.position.set(x, 1.07, z); antigos.add(c); ceras.push(c); }
    const chamas = []; for (let i = 0; i < 8; i++) { const x = -1.4 + i * .4, z = -66.5 + (i % 2) * .12; cyl(.02, .02, .12, MAT.vela, x, 1.11, z, 6); const ch = new THREE.Mesh(new THREE.SphereGeometry(.013, 5, 4), new THREE.MeshBasicMaterial({ color: 0xffc060 })); ch.scale.y = 2.2; ch.position.set(x, 1.2, z); A.W.grupo.add(ch); chamas.push(ch); }
    let derr = S.placed >= 3 ? 1 : 0;
    const rot = box(.3, .1, .2, new THREE.MeshBasicMaterial({ visible: false }), 1.22, 1.1, -66.1, A.W.grupo, false);
    U.rotulo(rot, () => derr >= 1 ? 'Uma bolinha de gude, um pião, uma fita vermelha. A cera que os cobria derreteu.' : 'Coisas mais antigas, cobertas de cera: uma bolinha de gude, um pião, uma fita de cabelo vermelha.');
    tick((t, dt) => {
      if (S.placed >= 3 && derr < 1) { derr = Math.min(1, derr + dt * .35); if (derr >= 1 && ctx.avivar) ctx.avivar(5); }
      for (const c of ceras) c.scale.set(1 - derr * .5, .55 * (1 - derr * .8), 1 - derr * .5);
      for (const ch of chamas) { ch.visible = derr >= 1; ch.scale.y = 2 + Math.random() * .6; }
    });
  }

  // ---------- O ÓRGÃO (as notas dos canos) e o CONFESSIONÁRIO
  const org = { x: -6.9, z: -66.2 };
  { const carv = carvao(A);
    prop(.9, 1.1, 1.8, carv, org.x, .55, org.z);
    for (let i = 0; i < 9; i++) cyl(.05, .05, 1.2 + (4 - Math.abs(i - 4)) * .25, MAT.bronze, org.x - .3, 1.7 + (4 - Math.abs(i - 4)) * .12, org.z - .8 + i * .2, 8);
    const nomesN = ['dó', 'ré', 'mi', 'fá', 'sol', 'lá', 'si'], freqs = [130.81, 146.83, 164.81, 174.61, 196, 220, 246.94];
    const seq = [];
    nomesN.forEach((nm, i) => {
      const tecla = box(.16, .05, .2, new THREE.MeshStandardMaterial({ color: 0xd8d0b8, roughness: .5 }), org.x + .5, 1.02, org.z - .63 + i * .21);
      U.rotulo(tecla, () => `<b>E</b>Apertar a tecla ${nm} do órgão (alto)`, () => {
        S.flags.sl_orgaoUsado = true; tecla.position.y = .99; U.depois(.25, () => { tecla.position.y = 1.02; });
        som.nota(freqs[i], { x: org.x, y: 1.6, z: org.z }, .5, 2.2, 'sawtooth'); A.emitNoise(org.x, org.z, 13);
        U.uma('sl_poeira', () => A.toast('A poeira sobe dos tubos. O som enche a capela. Alguém ouviu.'));
        seq.push(nm); if (seq.length > 3) seq.shift();
        if (!S.flags.sl_gaveta && seq.join() === 'dó,mi,sol') {
          S.flags.sl_gaveta = true; A.SFX.clique(); S.inv.kits++; A.conquista('sl_orgao');
          U.depois(.6, () => A.toast('Uma gavetinha se abre embaixo das teclas: um lenço bordado e um curativo antigo (H para usar).'));
          U.depois(2.4, () => A.sub('celeste', '(muito perto) Você ouviu a água cantar.'));
          U.depois(6, () => U.fala('As mesmas notas dos canos lá de baixo. Dó, mi, sol.'));
        }
      });
    });
  }
  let conf = null;
  { const L = A.armario(-7.05, -57.6, [1, 0]); conf = L;
    const mad = MAT.madeiraEsc; L.g.traverse(o => { if (o.isMesh) o.material = mad; });
    const cruz = new THREE.Group(); cruz.position.set(0, 2.15, .3); L.g.add(cruz); box(.04, .22, .03, MAT.bronze, 0, 0, 0, cruz, false); box(.14, .04, .03, MAT.bronze, 0, .04, 0, cruz, false);
    const it = L.g.userData.it; if (it) { const lb = it.label; it.label = () => lb().replace('do armário', 'do confessionário').replace('no armário', 'no confessionário'); }
  }
  const confissoes = [
    ['diretor', '(do outro lado da grade, frio) Eu tranquei a porta. Por fora. E fui dormir.'],
    ['moacir', '(do outro lado da grade, chorando) Eu ouvi eles queimando... e não abri. Eu não consigo parar, padre.'],
    ['celeste', '(do outro lado da grade, sussurrando) Eu sabia. E rezei, em vez de gritar.']
  ];
  let confT = 0, confDita = false;

  // ---------- O CEMITÉRIO: cruz do Joaquim, cruzinhas, pegadas, cata-ventos, lamparina, Faísca, galpão, ala dos pequenos, covas
  // a cruz do Seu Joaquim, do lado de fora do muro (vista pela grade dos fundos)
  const joaq = new THREE.Group(); joaq.position.set(1.4, 0, 14.4); joaq.rotation.y = .2; A.W.grupo.add(joaq);
  const lanternaJ = new THREE.Group(), chapeu = new THREE.Group();
  { const m = MAT.madeiraEsc; const p = box(.1, 1.4, .08, m, 0, .7, 0, joaq); p.rotation.z = .08; box(.7, .09, .08, m, 0, 1.05, 0, joaq);
    box(.5, .06, .4, new THREE.MeshStandardMaterial({ color: 0x3a4a3a, roughness: .9 }), .2, .03, .5, joaq, false);
    chapeu.position.set(-.02, 1.42, .04); joaq.add(chapeu); const palha = new THREE.MeshStandardMaterial({ color: 0xb89a5a, roughness: 1 }); cyl(.22, .22, .02, palha, 0, 0, 0, 12, chapeu); cyl(.1, .12, .1, palha, 0, .06, 0, 10, chapeu);
    lanternaJ.position.set(.32, 1.0, .06); joaq.add(lanternaJ); cyl(.05, .06, .14, MAT.ferrugem, 0, -.12, 0, 8, lanternaJ);
    const vid = new THREE.Mesh(new THREE.SphereGeometry(.04, 8, 6), new THREE.MeshBasicMaterial({ color: 0xffc070 })); vid.position.y = -.11; lanternaJ.add(vid);
    const halo = new THREE.Sprite(new THREE.SpriteMaterial({ color: 0xffb060, transparent: true, opacity: .5, depthWrite: false, blending: THREE.AdditiveBlending })); halo.scale.setScalar(.5); halo.position.y = -.11; lanternaJ.add(halo);
    if (S.flags.sl_chaveDev) chapeu.visible = false; }
  { const pl = A.plano(.5, .3, new THREE.MeshStandardMaterial({ map: A.textoTex([{ t: 'pela grade:', tam: 20, y: 30 }, { t: 'JOAQUIM — ZELADOR', tam: 24, y: 64 }, { t: '1979 · subiu a escada', tam: 18, y: 96 }], { w: 256, h: 128, fundo: '#4a463e', cor: '#1a1814', manchas: 3 }) }), 2.7, 1.25, 11.78, Math.PI);
    U.rotulo(pl, () => S.flags.sl_chaveDev ? 'A chave do portão está pendurada na grade. Do lado de fora, o chapéu caiu da cruz.' : (S.inv.chaves && S.inv.chaves.portao) ? '<b>E</b>Pendurar a chave do portão na grade, para o Seu Joaquim' : 'Pela grade, do lado de fora do muro: uma cruz de madeira com um chapéu de palha. “JOAQUIM — ZELADOR — 1979. Subiu a escada.”', () => {
      if (S.flags.sl_chaveDev || !(S.inv.chaves && S.inv.chaves.portao)) { U.uma('sl_cruzJ', () => U.fala('Enterraram ele do lado de fora. Ninguém quis ele aqui dentro.')); return; }
      S.flags.sl_chaveDev = true; delete S.inv.chaves.portao; A.SFX.metal(.3); som.chiado({ x: 1.4, y: 1, z: 14.4 }, 1.8, .12);
      const k = A.MK.chave(); k.position.set(2.1, 1.15, 11.72); k.rotation.x = Math.PI / 2; A.W.grupo.add(k);
      U.depois(1.6, () => { chapeu.userData.cai = 0; }); A.conquista('sl_chave');
      U.depois(2.6, () => U.fala('Obrigada, Seu Joaquim. Pode descansar.'));
    });
    if (S.flags.sl_chaveDev) { const k = A.MK.chave(); k.position.set(2.1, 1.15, 11.72); k.rotation.x = Math.PI / 2; A.W.grupo.add(k); } }
  // três cruzinhas de graveto com os nomes, que alguém fez por conta própria
  { const g = new THREE.Group(); g.position.set(-27.4, 0, -12); A.W.grupo.add(g);
    const flor = [0xd8c040, 0xe8e0e8, 0xa04060].map(c => new THREE.MeshStandardMaterial({ color: c, roughness: .8 }));
    ['DAVI', 'ANA', 'TOMÉ'].forEach((n, i) => {
      const c = new THREE.Group(); c.position.set(0, 0, (i - 1) * .9); c.rotation.z = (Math.random() - .5) * .2; g.add(c);
      box(.04, .6, .04, MAT.tronco, 0, .3, 0, c); box(.3, .04, .04, MAT.tronco, 0, .45, 0, c);
      A.plano(.18, .07, new THREE.MeshStandardMaterial({ map: A.textoTex([{ t: n, tam: 40, estilo: 'bold' }], { w: 128, h: 48, fundo: '#8a8a7a', cor: '#2a2420', manchas: 2 }), metalness: .5 }), 0, .34, .03, Math.PI / 2, c).rotation.y = Math.PI / 2;
      for (let k = 0; k < 4; k++) { const f = new THREE.Mesh(new THREE.SphereGeometry(.025, 5, 4), flor[k % 3]); f.position.set(.15 + Math.random() * .1, .03, (Math.random() - .5) * .2); c.add(f); }
    });
    A.addCollider(-27.6, -27.2, -13.4, -10.6);
    U.rotulo(g, '<b>E</b>Ajoelhar diante das três cruzinhas de graveto', () => {
      A.P.crouch = true; S.fear = Math.max(0, S.fear - 15);
      A.toast('DAVI, ANA, TOMÉ, em plaquinhas de lata batidas a prego. As flores do mato são de hoje. Alguém enterrou os nomes por conta própria.');
      U.uma('sl_cruzinhas', () => U.depois(4.5, () => U.fala('...')));
    });
  }
  // flores frescas e pegadas de botina nas covas das crianças antigas
  { const nomes = ctx.nomes || A.R.lapides, cel = ctx.cel || [];
    const botina = U.tex(64, 128, g => { g.fillStyle = 'rgba(20,16,12,.8)'; g.beginPath(); g.ellipse(32, 44, 18, 36, 0, 0, 7); g.fill(); g.beginPath(); g.ellipse(32, 104, 14, 18, 0, 0, 7); g.fill(); });
    const joelho = U.tex(64, 64, g => { g.fillStyle = 'rgba(20,16,12,.75)'; g.beginPath(); g.ellipse(32, 32, 22, 16, 0, 0, 7); g.fill(); });
    const fl = [0xd8c040, 0xe8e0e8, 0xa04060].map(c => new THREE.MeshStandardMaterial({ color: c, roughness: .8 }));
    nomes.forEach((l, i) => {
      if (!cel[i] || !['JOÃO, 7 ANOS', 'ROSA, 8 ANOS', 'LUIZ, 11 ANOS', 'MARIA DAS DORES', 'IRMÃ CELESTE'].includes(l.nome)) return;
      const [x, z] = cel[i];
      if (l.nome !== 'IRMÃ CELESTE') for (let k = 0; k < 5; k++) { const f = new THREE.Mesh(new THREE.SphereGeometry(.03, 5, 4), fl[k % 3]); f.position.set(x - .2 + Math.random() * .4, .14, z + .4 + Math.random() * .3); A.W.grupo.add(f); }
      for (let k = 0; k < 4; k++) U.chao(botina, .13, .26, x + .7 + (k % 2) * .25, z + .6 + k * .55, .1, .014);
      if (l.nome === 'IRMÃ CELESTE') for (const dx of [-.15, .15]) U.chao(joelho, .18, .14, x + dx, z + .45, 0, .015);
    });
    tick(() => { if (!S.flags.sl_flores) for (let i = 0; i < nomes.length; i++) { if (!cel[i] || !/JOÃO|ROSA|LUIZ|MARIA DAS DORES/.test(nomes[i].nome)) continue; if (U.dist(cel[i][0], cel[i][1]) < 3 && U.olhando(cel[i][0], .1, cel[i][1] + .5, .8, 4)) { U.uma('sl_flores', () => U.fala('Flores do mato. De hoje. Alguém ainda vem aqui.')); break; } } });
  }
  // pegadas pequenas de fuligem do muro até a capela (e pés enormes por cima)
  { const pe = U.tex(48, 96, g => { g.fillStyle = 'rgba(10,8,6,.85)'; g.beginPath(); g.ellipse(24, 58, 11, 24, 0, 0, 7); g.fill(); for (let i = 0; i < 5; i++) { g.beginPath(); g.ellipse(13 + i * 5.5, 26 - Math.abs(i - 1.5) * 2, 3, 4, 0, 0, 7); g.fill(); } });
    const pts = []; const a = [29.4, -6], b = [1.6, -46.5];
    for (let i = 0; i <= 34; i++) { const k = i / 34, x = a[0] + (b[0] - a[0]) * k + Math.sin(k * 9) * 1.6, z = a[1] + (b[1] - a[1]) * k; pts.push([x, z]); }
    const pegs = [];
    for (let i = 0; i < pts.length - 1; i++) { const [x, z] = pts[i], [x2, z2] = pts[i + 1], ang = Math.atan2(x2 - x, z2 - z); for (const s of [-1, 1]) { const ox = Math.cos(ang) * .12 * s, oz = -Math.sin(ang) * .12 * s; const p = U.chao(pe, .1, .2, x + ox + (x2 - x) * (s > 0 ? .5 : 0), z + oz + (z2 - z) * (s > 0 ? .5 : 0), ang + Math.PI, .016, { mat: { emissive: 0x403a30, emissiveIntensity: 0 } }); pegs.push(p); } }
    for (let i = 0; i < 8; i++) { const k = .35 + i * .04, x = a[0] + (b[0] - a[0]) * k - 2 + i * .5, z = a[1] + (b[1] - a[1]) * k + 2 - i * .9; U.chao(pe, .2, .42, x, z, 2.2, .018); }
    tick(() => { const on = U.luz(); for (const p of pegs) { const d = U.dist(p.position.x, p.position.z); p.material.emissiveIntensity = on && d < 7 ? .5 * (1 - d / 7) : 0; } });
  }
  // cata-ventos de papel nas covas pequenas: param todos quando ele chega perto
  const catas = [];
  { const covas = (ctx.covas || []).slice(0, 60).filter((_, i) => i % 6 === 1).slice(0, 9);
    const cores = [0xc84030, 0x3060a8, 0xd8b030, 0x40a060].map(c => new THREE.MeshStandardMaterial({ color: c, roughness: .9, side: THREE.DoubleSide }));
    for (const c of covas) {
      const g = new THREE.Group(); g.position.set(c.x + .35, 0, c.z + .5); A.W.grupo.add(g);
      box(.015, .7, .015, MAT.madeiraEsc, 0, .35, 0, g, false);
      const roda = new THREE.Group(); roda.position.set(0, .7, .02); g.add(roda);
      for (let k = 0; k < 4; k++) { const p = new THREE.Mesh(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0), new THREE.Vector3(.1, .02, 0), new THREE.Vector3(.08, .1, 0)]), cores[k]); p.geometry.setIndex([0, 1, 2]); p.geometry.computeVertexNormals(); p.rotation.z = k * Math.PI / 2; roda.add(p); }
      catas.push({ roda, x: g.position.x, z: g.position.z, v: 3 + Math.random() * 2 });
    }
  }
  // a lamparina do Seu Joaquim: marca de longe o túmulo que falta cavar
  const lamp = new THREE.Group(); A.W.grupo.add(lamp);
  const lampLuz = new THREE.PointLight(0xffb060, 0, 7, 1.6); lamp.add(lampLuz);
  { cyl(.05, .07, .16, MAT.ferrugem, 0, 0, 0, 8, lamp); const ch = new THREE.Mesh(new THREE.SphereGeometry(.035, 6, 5), new THREE.MeshBasicMaterial({ color: 0xffc070 })); ch.position.y = .03; lamp.add(ch); lamp.visible = false; }
  let lampK = 0, lampAlvo = null;
  // Faísca, o cão do zelador: late quando ele chega perto
  const fai = { x: -27.6, z: 8.5 };
  { const g = new THREE.Group(); g.position.set(fai.x, 0, fai.z); g.rotation.y = Math.PI / 2; A.W.grupo.add(g);
    const tx = A.textoTex([{ t: 'FAÍSCA', tam: 40, estilo: 'bold', y: 60 }, { t: 'cão do Joaquim', tam: 24, y: 104 }], { w: 256, h: 140, fundo: '#55534c', cor: '#1a1814', manchas: 4 });
    const p = box(.42, .3, .1, [MAT.pedraLap, MAT.pedraLap, MAT.pedraLap, MAT.pedraLap, new THREE.MeshStandardMaterial({ map: tx, roughness: .95 }), MAT.pedraLap], 0, .15, 0, g);
    A.addCollider(fai.x - .1, fai.x + .1, fai.z - .22, fai.z + .22);
    U.rotulo(p, 'Uma lápide pequena, de bicho: “FAÍSCA — cão do Joaquim”. Uma coleira de couro em cima.'); }
  let latidoCd = 0;
  // o galpão do coveiro (as velas do Joaquim)
  { const gx = 26.6, gz = -44.6, m = A.texMat('madeira', 1, 1);
    prop(.12, 2.2, 3, m, gx + 1.6, 1.1, gz); prop(3.2, 2.2, .12, m, gx, 1.1, gz - 1.5); prop(.12, 2.2, 1.2, m, gx - 1.6, 1.1, gz - .9);
    box(3.5, .1, 3.3, MAT.telhado, gx, 2.25, gz, A.W.grupo, false);
    for (let i = 0; i < 4; i++) box(.4, .25, .3, MAT.papel, gx + .9, .13 + (i % 2) * .26, gz - 1.1 + Math.floor(i / 2) * .35);
    prop(.9, .7, .5, MAT.madeiraEsc, gx - .2, .35, gz - 1.1);
    const capa = box(.5, 1, .06, new THREE.MeshStandardMaterial({ color: 0x3a4a2a, roughness: .5 }), gx + 1.5, 1.3, gz + .4, A.W.grupo, false);
    A.ITENS.garrafa('sl_galpaoG', { x: gx - .4, y: .7, z: gz - 1.1 }); A.ITENS.kit('sl_galpaoK', { x: gx + .05, y: .7, z: gz - 1.1 });
    U.rotulo(capa, 'Um galpão de coveiro: caixas de velas, fósforos. Uma capa de chuva igual à do Seu Joaquim, ainda pingando.', () => U.uma('sl_galpao', () => U.fala('É ele que acende as velas. Ainda.')));
    const gotas = []; for (let i = 0; i < 5; i++) { const s = new THREE.Mesh(new THREE.SphereGeometry(.008, 4, 3), new THREE.MeshBasicMaterial({ color: 0x9ab0c0 })); s.position.set(gx + 1.5 + (Math.random() - .5) * .4, Math.random() * .8, gz + .42); A.W.grupo.add(s); gotas.push(s); }
    tick((t, dt) => { for (const s of gotas) { s.position.y -= dt * 2.4; if (s.position.y < 0) s.position.y = .8; } });
  }
  // a ala dos pequenos: cruzes sem nome e brinquedos de corda que seguem a Lia
  const corda = [];
  { const datas = [1951, 1954, 1958, 1960, 1963, 1967, 1970, 1974, 1978];
    datas.forEach((d, i) => { const x = 11 + i * 1.5, z = -44.6 + (i % 2) * .4; const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.z = (Math.random() - .5) * .2; A.W.grupo.add(g); box(.05, .6, .05, MAT.madeiraEsc, 0, .3, 0, g); box(.3, .05, .05, MAT.madeiraEsc, 0, .44, 0, g); A.plano(.16, .06, new THREE.MeshStandardMaterial({ map: A.textoTex([{ t: String(d), tam: 40 }], { w: 128, h: 48, fundo: '#4a3a28', cor: '#c8b898', manchas: 1 }) }), 0, .3, .03, 0, g); A.addCollider(x - .1, x + .1, z - .1, z + .1); });
    const cores = [0x8a2a20, 0x2a4a7a, 0x7a6a2a, 0x3a6a3a, 0x6a3a6a];
    for (let i = 0; i < 5; i++) { const g = new THREE.Group(); g.position.set(11.7 + i * 2.6, 0, -43.7); A.W.grupo.add(g); const m = new THREE.MeshStandardMaterial({ color: cores[i], roughness: .6, metalness: .3 }); box(.16, .1, .1, m, 0, .06, 0, g); box(.08, .06, .08, m, .02, .14, 0, g); cyl(.006, .006, .06, MAT.metal, -.1, .08, 0, 4, g).rotation.z = Math.PI / 2; corda.push({ g, giro: 0, foi: false }); }
    const pl = box(.6, .04, .3, new THREE.MeshBasicMaterial({ visible: false }), 17, .3, -44.6, A.W.grupo, false);
    U.rotulo(pl, 'Cruzes pequenas, sem nome. Só datas: 1951, 1954, 1958... 1978. Brinquedos de corda espalhados na terra.', () => U.uma('sl_ala', () => U.fala('A ala dos pequenos. Nenhum nome. Só o ano.')));
  }
  // a cova aberta do Moacir (depois do final verdadeiro, fechada e com a data)
  { const mx = -27.4, mz = -28; const fechada = !!cq.final_verdadeiro;
    const g = new THREE.Group(); g.position.set(mx, 0, mz); g.rotation.y = Math.PI / 2; A.W.grupo.add(g);
    const tx = A.textoTex([{ t: '✝', tam: 36, y: 46 }, { t: 'MOACIR DUARTE', tam: 26, y: 112 }, { t: fechada ? '1938 — 1994' : '1938 —', tam: 24, y: 160 }], { w: 256, h: 220, fundo: '#55534c', cor: '#1a1814', manchas: 5 });
    const pd = box(.8, 1, .16, [MAT.pedraLap, MAT.pedraLap, MAT.pedraLap, MAT.pedraLap, new THREE.MeshStandardMaterial({ map: tx, roughness: .95 }), MAT.pedraLap], 0, .5, 0, g);
    A.addCollider(mx - .12, mx + .12, mz - .42, mz + .42); A.W.solid.push(pd);
    if (fechada) box(.9, .14, 1.7, A.texMat('terra', .5, .5), 0, .07, 1, g, false);
    else { const buraco = A.plano(.8, 1.6, new THREE.MeshBasicMaterial({ color: 0x050403 }), 0, .012, 1, 0, g); buraco.rotation.x = -Math.PI / 2; box(.6, .35, .7, A.texMat('terra', .5, .5), .7, .17, 1.2, g, false); }
    U.rotulo(pd, () => fechada ? 'MOACIR DUARTE · 1938 — 1994. Terra nova. A data foi entalhada há pouco.' : 'MOACIR DUARTE · 1938 — . Sem data de morte. Na frente, uma cova aberta e vazia.', () => { if (!fechada) U.uma('sl_covaM', () => U.fala('Alguém cavou e ficou esperando ele.')); });
  }
  // a cova vazia do diretor: cavar (opcional, barulhento)
  { const nomes = ctx.nomes || A.R.lapides, cel = ctx.cel || []; const i = nomes.findIndex(l => l.id === 'albano');
    if (i >= 0 && cel[i]) {
      const [x, z] = cel[i];
      const fenda = box(.9, .05, .55, A.texMat('terra', .5, .5), x, .03, z + 2.15, A.W.grupo, false);
      const pilha = box(.5, .01, .5, A.texMat('terra', .5, .5), x + .8, .02, z + 2.1, A.W.grupo, false);
      const it = U.rotulo(fenda, () => S.flags.sl_covaAlb ? 'A cova do diretor, aberta: um caixão cheio de tijolos.' : !S.inv.pa ? 'A terra na frente da pedra do diretor está fofa demais.' : `<b>E</b>Cavar a cova do diretor (opcional; a pá faz barulho)`, () => {
        if (S.flags.sl_covaAlb || !S.inv.pa) return; S.flags.sl_covaAlb = true; fenda.scale.y = 3; pilha.scale.y = 30; A.SFX.pancada(x, z + 2); A.emitNoise(x, z + 2, 10);
        A.conquista('sl_cova'); U.depois(.4, () => A.lerNota('sl_tijolos')); U.depois(1.5, () => U.fala('Tijolos. Ele nunca esteve aqui.'));
      });
      it.hold = 4; it.guarda = true; it.som = 'cavar'; it.pode = () => !!S.inv.pa && !S.flags.sl_covaAlb; Object.defineProperty(it, 'ruido', { get: () => 6 + 3 * Math.min(1, (it.progresso || 0) / it.hold) });
      if (S.flags.sl_covaAlb) { fenda.scale.y = 3; pilha.scale.y = 30; }
    } }

  // ---------- vida do capítulo
  A.W.tick.push(dt => {
    const t = A.perf(), P = A.P, M = A.M;
    for (const f of ticks) f(t, dt);
    // relâmpago: as sombras das três crianças (só com a lanterna apagada) e o vitral
    const rk = raio();
    somb.material.opacity = !S.flashOn ? Math.min(.85, rk * 1.4) : 0;
    if (somb.material.opacity > .4 && P.pos.z < -48.4 && U.olhando(-4.6, .8, -69.8, .85, 16)) U.uma('sl_sombras', () => U.depois(.8, () => A.sub('lia', '(baixinho) ...três. De mãos dadas.')));
    vitral.material.color.setScalar(.25 + rk * 1.6 + (S.flags.sino ? .1 : 0));
    const rost = 6 + Math.min(3, S.placed), alt = !!S.flags.sino;
    if (rost !== rostosV || alt !== altoV) { rostosV = rost; altoV = alt; vitral.material.map.dispose(); vitral.material.map = vitralTex(rostosV, altoV); vitral.material.needsUpdate = true; }
    // a lanterna do Joaquim balança na fuga, como quem acena; o chapéu cai quando a chave volta
    lanternaJ.rotation.z = S.flags.sino ? Math.sin(t * 2.4) * .5 : Math.sin(t * .8) * .06;
    if (chapeu.userData.cai != null && chapeu.visible) { chapeu.userData.cai += dt; chapeu.position.y = 1.42 - Math.min(1.4, chapeu.userData.cai * chapeu.userData.cai * 4); chapeu.rotation.x = Math.min(1.5, chapeu.userData.cai * 3); if (chapeu.userData.cai > .7) chapeu.userData.cai = null; }
    // cata-ventos: giram com o vento e param todos de uma vez quando ele está perto
    const perto = M.ativo && catas.some(c => Math.hypot(M.pos.x - c.x, M.pos.z - c.z) < 10);
    for (const c of catas) c.roda.rotation.z -= dt * (perto ? 0 : c.v);
    if (perto && !S.flags.sl_catas && catas.some(c => U.dist(c.x, c.z) < 12)) U.uma('sl_catas', () => U.depois(.5, () => U.fala('Os cata-ventos pararam. Todos ao mesmo tempo.')));
    // Faísca: um latido abafado quando ele chega a menos de 15 m
    latidoCd -= dt;
    if (M.ativo && latidoCd <= 0 && M.pos.distanceTo(P.pos) < 15 && S.chapter === 5) { latidoCd = 22; som.latido({ x: fai.x, y: .4, z: fai.z }); U.uma('sl_latido', () => U.depois(1, () => U.fala('Um cachorro? ...Faísca. Ele tá avisando.'))); }
    // lamparina do Joaquim: aparece sobre o túmulo que falta cavar, só de longe
    let alvoL = null;
    if (S.inv.pa && !S.flags.sino && ctx.importantes) { let md = 1e9; for (const [id, L] of Object.entries(ctx.importantes)) { if (S.tumulos[id]) continue; const d = U.dist(L.g.position.x, L.g.position.z); if (d < md) { md = d; alvoL = L.g.position; } } }
    if (alvoL !== lampAlvo) { lampAlvo = alvoL; if (alvoL) lamp.position.set(alvoL.x + .9, 1.1, alvoL.z + 1.2); }
    const dl = alvoL ? U.dist(lamp.position.x, lamp.position.z) : 0, quer = alvoL && dl > 10 ? 1 : 0;
    lampK += (quer - lampK) * Math.min(1, dt * (quer ? .6 : 2.5));
    lamp.visible = lampK > .02; lampLuz.intensity = lampK * 1.6 * (.9 + Math.sin(t * 5) * .1); lamp.rotation.z = Math.sin(t * 1.4) * .15;
    // brinquedos de corda dão uma volta, um depois do outro, quando ela passa
    for (const c of corda) { if (!c.foi && U.dist(c.g.position.x, c.g.position.z) < 2.6) { c.foi = true; c.giro = Math.PI * 2; A.SFX.tique(); } if (c.giro > 0) { const d = Math.min(c.giro, dt * 4); c.giro -= d; c.g.rotation.y += d; } }
    // confessionário: escondida e calma, alguém confessa do outro lado
    if (conf && S.hidden === conf && (!M.ativo || M.pos.distanceTo(P.pos) > 8)) { confT += dt; if (confT > 6 && !confDita) { confDita = true; const i = (S.flags.sl_confI = ((S.flags.sl_confI ?? (Math.random() * 3 | 0)) + 1) % 3); const [q, txt] = confissoes[i]; A.SFX.sussurros(1); A.sub(q, txt); U.depois(5.5, () => { if (S.hidden === conf) A.sub('voz', '(a voz espera, do outro lado da grade) ...e você, filha?'); }); } }
    else if (!conf || S.hidden !== conf) { confT = 0; confDita = false; }
  });

  // na fuga, o órgão que ninguém tocou toca uma nota sozinho (e chama a atenção dele para lá)
  let fugaOrg = false;
  tick(() => { if (S.flags.sino && !fugaOrg) { fugaOrg = true; if (!S.flags.sl_orgaoUsado) U.depois(6, () => { if (!U.noMapa('cemiterio')) return; som.nota(98, { x: org.x, y: 1.6, z: org.z }, .6, 3, 'sawtooth'); A.emitNoise(org.x, org.z, 30); }); } });
  return juntar(def, X);
}
