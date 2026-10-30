// INTERNATO — REJOGABILIDADE (Lote 6)
// Modos, desafios, variações por semente, conquistas, recordes e segredos que só aparecem na
// segunda jogada, no térreo (Capítulos I e II) e no andar dos dormitórios (Capítulo III).
// Ganchos chamados por terreo()/superior() em mapas.js, encadeados com juntar() de internato.js.
// Tudo procedural (geometria em canvas/box, som do motor). Nada de assets externos.
//
// Regras seguidas:
// - Nada de backtracking: só muda O QUE está onde e o que aparece, nunca obriga a voltar.
// - Objetivos e páginas continuam no caminho; só trocam de canto DENTRO da mesma sala (spot sorteado).
// - Segredos de "segunda jogada" ficam invisíveis e sem interação na primeira campanha.
// - QA seguro: nenhum colisor novo perto de porta; os itens continuam achados pelo rótulo.

const LS = 'hora-silencio-l6';
const CONQ = 'hora-silencio-v2-conq';

function ler() { try { return JSON.parse(localStorage.getItem(LS) || '{}') || {}; } catch (e) { return {}; } }
function gravar(o) { try { localStorage.setItem(LS, JSON.stringify(o)); } catch (e) {} }
function mexer(fn) { const o = ler(); fn(o); gravar(o); return o; }

// a campanha já chegou a um final alguma vez? (vale entre partidas, por isso os segredos de 2ª jogada)
function jaTerminou() {
  try { const c = JSON.parse(localStorage.getItem(CONQ) || '{}'); return !!(c.final_comum || c.final_silencio || c.final_verdadeiro); } catch (e) { return false; }
}

// RNG da Semente da Noite (determinístico): mesma noite = mesmo sorteio; noites diferentes = buscas diferentes
function rngDe(str) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
  return () => { h = Math.imul(h ^ (h >>> 15), 2246822507); h = Math.imul(h ^ (h >>> 13), 3266489909); return ((h ^= h >>> 16) >>> 0) / 4294967296; };
}

// conquistas novas do lote 6 (entram uma vez em window.ROTEIRO.conquistas)
export const conquistas = [
  { id: 'l6_veterana', nome: 'Veterana do Internato', desc: 'Entre no internato pela quinta noite.' },
  { id: 'l6_decorou', nome: 'Decorou?', desc: 'Termine o Capítulo I numa noite de volta, com a casa embaralhada.', secreta: true },
  { id: 'l6_nicho', nome: 'O Que Pregaram', desc: 'Abra a porta que só cede na segunda noite.', secreta: true },
  { id: 'l6_turma', nome: 'Falta Um', desc: 'Repare na criança que sumiu da foto da turma.', secreta: true },
  { id: 'l6_recorde', nome: 'Pé Ligeiro', desc: 'Bata o seu recorde de tempo num capítulo do internato.' },
  { id: 'l6_moacir', nome: 'Quarto do Castigo', desc: 'Leia os desenhos do menino na segunda jogada.', secreta: true }
];
(function registrar() {
  try { const R = window.ROTEIRO; if (R && R.conquistas) for (const c of conquistas) if (!R.conquistas.some(x => x.id === c.id)) R.conquistas.push(c); } catch (e) {}
})();

// base comum aos dois mapas
function base(A, S, mapa) {
  const seedStr = (S.semente || 'SEMCOD') + '|' + (S.dif || 'normal');
  const trocada = !!(S.semente && S.semente !== 'SEMCOD'); // Noite Trocada: semente de desafio / Noite da Semana
  const ng = jaTerminou() || !!S.replay; // segunda jogada (já viu um final antes, ou rejogo imediato)
  // inteiro sorteado por semente para um "salt" (usado como índice de spot; spot() aplica módulo sozinho)
  const idx = salt => Math.floor(rngDe(seedStr + '|' + mapa + '|' + salt)() * 997);
  const rnd = salt => rngDe(seedStr + '|' + mapa + '|r|' + salt)();
  const esc = (salt, n) => Math.floor(rnd(salt) * n); // 0..n-1
  const dist = (x, z) => Math.hypot(A.P.pos.x - x, A.P.pos.z - z);
  // placa de leitura (ler de perto, src/interface-mundo.js) + canvas de texto
  const placa = (linhas, x, y, z, w, h, ry, opts) => {
    const m = A.plano(w, h, new A.THREE.MeshStandardMaterial({ map: A.textoTex(linhas, opts), roughness: .9, transparent: true }), x, y, z, ry);
    m.userData.leitura = { t: linhas.map(l => l.t).join(' · ') };
    return m;
  };
  return { seedStr, trocada, ng, idx, rnd, esc, dist, placa };
}

// =====================================================================
// TÉRREO — Capítulos I e II
// =====================================================================
export function rejogoTerreo(A, S, ctx = {}) {
  const { THREE, MAT, box, cyl, interact, SFX } = A;
  const B = base(A, S, 'terreo');
  const grupo = A.W.grupo;
  // exposto para mapas.js sortear o canto de cada objetivo/lembrança DENTRO da sala (sem backtracking)
  const api = {
    // índice de spot sorteado pela semente (térreo); spot() já aplica módulo pelo tamanho do array
    i: salt => B.idx(salt),
    noiteTrocada: B.trocada,
    segundaJogada: B.ng
  };

  // ---------- decoração sorteada pela semente (sem colisor; só muda a leitura da sala) ----------
  const variantes = []; // { aplica(e) }  e = número da variante

  // refeitório: cadeiras em volta / viradas de costas / empilhadas num canto
  (function refeitorio() {
    const cadeiras = [];
    for (let k = 0; k < 8; k++) { const c = box(.42, .9, .42, MAT.madeiraEsc, 0, .45, 0, grupo, false); c.visible = false; cadeiras.push(c); }
    const emVolta = [[-18, -17], [-14, -17], [-18, -23], [-14, -23], [-20, -20], [-12, -20], [-16, -16], [-16, -24]];
    const canto = [-9.5, -25.5];
    variantes.push(e => {
      cadeiras.forEach((c, k) => { c.visible = true; c.rotation.set(0, 0, 0); });
      if (e === 0) cadeiras.forEach((c, k) => { c.position.set(emVolta[k][0], .45, emVolta[k][1]); c.rotation.y = Math.atan2(-15 - emVolta[k][0], -20 - emVolta[k][1]); });
      else if (e === 1) cadeiras.forEach((c, k) => { c.position.set(emVolta[k][0], .45, emVolta[k][1]); c.rotation.y = Math.PI + Math.atan2(-15 - emVolta[k][0], -20 - emVolta[k][1]); }); // viradas de costas
      else cadeiras.forEach((c, k) => { c.position.set(canto[0] + (k % 3) * .22, .45 + Math.floor(k / 3) * .9, canto[1]); c.rotation.z = .25 + (k % 2) * .1; }); // empilhadas
    });
  })();

  // cozinha: panelas penduradas em ganchos diferentes
  (function cozinha() {
    const panelas = [];
    for (let k = 0; k < 4; k++) { const p = cyl(.16, .14, .16, MAT.metal, 0, 2.2, 0, 10, grupo); p.visible = false; panelas.push(p); }
    const linhas = [[-33, -16], [-31, -16], [-29, -16], [-27, -16], [-33, -24], [-27, -24], [-30, -25.5], [-25, -20]];
    variantes.push(e => panelas.forEach((p, k) => { const g = linhas[(k + e * 2) % linhas.length]; p.position.set(g[0], 2.15 + B.rnd('pan' + k + e) * .15, g[1]); p.visible = true; }));
  })();

  // enfermaria: biombo em três posições
  (function enfermaria() {
    const biombo = new THREE.Group(); grupo.add(biombo);
    for (let k = 0; k < 3; k++) { const f = box(.6, 1.5, .05, MAT.lencol, k * .58 - .58, .9, 0, biombo); f.rotation.y = (k - 1) * .35; }
    biombo.visible = false;
    const poses = [[22, -6, 0], [30, -7, Math.PI / 2], [26, -2.5, .4]];
    variantes.push(e => { const p = poses[e % 3]; biombo.position.set(p[0], 0, p[1]); biombo.rotation.y = p[2]; biombo.visible = true; });
  })();

  // sala de aula: carteiras alinhadas ou tombadas
  (function aula() {
    const carteiras = [];
    for (let k = 0; k < 6; k++) { const c = box(.6, .75, .45, MAT.madeiraEsc, 0, .38, 0, grupo, false); c.visible = false; carteiras.push(c); }
    const base6 = [[-17, -8], [-13, -8], [-9, -8], [-17, -4], [-13, -4], [-9, -4]];
    variantes.push(e => carteiras.forEach((c, k) => {
      c.visible = true; c.position.set(base6[k][0], .38, base6[k][1]); c.rotation.set(0, 0, 0);
      if (e === 1) { c.rotation.z = (B.rnd('cart' + k) - .5) * 1.4; c.rotation.y = B.rnd('carty' + k) * 2; c.position.y = .25; } // tombadas
      else if (e === 2) c.rotation.y = .4; // de esguelha
    }));
  })();

  // biblioteca: pilha de livros caídos num canto sorteado
  (function biblio() {
    const pilhas = [];
    const cantos = [[-32, -2], [-21.5, -8.5], [-32, -8.5], [-23, -1.5]];
    for (let j = 0; j < cantos.length; j++) { const g = new THREE.Group(); grupo.add(g); for (let k = 0; k < 5; k++) { const l = box(.3, .06, .22, MAT.madeira, 0, .03 + k * .07, 0, g, false); l.rotation.y = B.rnd('lv' + j + k) * .6; } g.position.set(cantos[j][0], 0, cantos[j][1]); g.visible = false; pilhas.push(g); }
    variantes.push(e => { pilhas.forEach(p => p.visible = false); pilhas[e % pilhas.length].visible = true; });
  })();

  // lavanderia: lençóis no varal em configuração diferente
  (function lavanderia() {
    const lencos = [];
    for (let k = 0; k < 5; k++) { const l = box(.02, .9, .7, MAT.lencol, 7 + k * 1.6, 1.6, -20, grupo, false); l.visible = false; lencos.push(l); }
    variantes.push(e => lencos.forEach((l, k) => { l.visible = (k + e) % 5 !== (e % 5); l.position.z = -20 + (B.rnd('len' + k + e) - .5) * 2; }));
  })();

  // recepção: a cadeira do porteiro de pé ou tombada
  (function recep() {
    const cad = box(.42, .9, .42, MAT.madeiraEsc, -1.4, .45, -6.5, grupo, false); cad.visible = false;
    variantes.push(e => { cad.visible = true; cad.rotation.z = e === 2 ? 1.3 : 0; cad.position.y = e === 2 ? .3 : .45; });
  })();

  // ---------- foto da turma de 1979 na recepção: na 2ª noite falta uma criança ----------
  let fotoTurma = null;
  (function foto() {
    const n = B.ng ? 6 : 7; // segunda jogada = uma a menos
    const linhas = [{ t: 'Turma de 1979', tam: 20, estilo: 'bold' }, { t: '◦ '.repeat(n).trim(), tam: 40 }, { t: B.ng ? 'uma cadeira vazia na ponta' : 'São Lázaro · internato', tam: 15, estilo: 'italic' }];
    fotoTurma = B.placa(linhas, 4.3, 1.7, -13.84, 1.1, 1.0, 0, { fundo: '#1a150f', cor: '#cbbb98', manchas: 4 });
    const it = interact(fotoTurma, () => B.ng ? '<b>E</b>Olhar a foto da turma de perto' : 'Foto da turma de 1979.', () => {
      if (!B.ng) return;
      A.sub('lia', 'Essa foto... tinha mais um menino aqui na ponta. Tenho certeza.'); A.conquista('l6_turma');
      mexer(o => { o.turma = true; });
    });
  })();

  // ---------- quadro de chaves: etiquetas reescritas pela semente (só leitura; o código continua o do estado) ----------
  (function etiquetas() {
    const nomes = ['escada', 'porão', 'capela', 'sótão', 'depósito', 'enfermaria', 'cozinha'];
    const emb = nomes.slice(); for (let i = emb.length - 1; i > 0; i--) { const j = B.esc('et' + i, i + 1); [emb[i], emb[j]] = [emb[j], emb[i]]; }
    B.placa(emb.slice(0, 4).map((t, k) => ({ t: (k + 1) + ' — ' + t, tam: 16 })), 2.2, 1.55, -13.8, .9, .9, 0, { fundo: '#201a12', cor: '#b9a877' });
  })();

  // ---------- SEGUNDA NOITE / NG+: a porta que não existia (nicho com bilhete, sem sala nova nem colisor) ----------
  let nicho = null;
  (function portaPregada() {
    // tábuas pregadas num trecho de parede do corredor oeste; sem colisor (a parede já colide)
    const g = new THREE.Group(); g.position.set(-20, 1.4, -13.9); grupo.add(g);
    for (let k = 0; k < 4; k++) { const t = box(1.0, .14, .05, MAT.madeira, 0, -.5 + k * .35, 0, g, false); t.rotation.z = (B.rnd('tab' + k) - .5) * .12; }
    const porta = box(.9, 1.9, .06, MAT.madeiraEsc, -20, 1.1, -13.95, grupo, false);
    const it = interact(porta, () => {
      if (!B.ng) return 'Uma porta pregada por fora. Hoje não.';
      if (S.flags._l6nicho) return 'O nicho atrás da porta está vazio agora.';
      return '<b>E</b>Arrancar as tábuas da porta';
    }, () => {
      if (!B.ng || S.flags._l6nicho) return;
      S.flags._l6nicho = true; SFX.rangido(1.6, .9, -20, .6); A.emitNoise(-20, -13, 8); g.visible = false;
      A.toast('Atrás das tábuas, um quartinho de vassouras. Alguém escondeu um bilhete aqui.');
      A.sub('davi', 'se vc ta lendo isso vc ja morreu aqui uma vez. eu tambem.'); A.conquista('l6_nicho');
      mexer(o => { o.nicho = true; });
    });
    it.on = () => porta.visible;
    nicho = { g, porta };
  })();

  // ---------- quarto do castigo: painel no hall com os desenhos do menino Moacir (só 2ª jogada) ----------
  (function castigo() {
    const linhas = [{ t: 'rabiscos de criança, a lápis', tam: 15, estilo: 'italic' }, { t: 'uma casa · um sino · uma porta sem maçaneta', tam: 14 }, { t: 'e, embaixo: NÃO FOI EU QUE TRANQUEI', tam: 14, estilo: 'bold' }];
    const painel = B.placa(linhas, -5.9, 1.4, -8, .9, 1.1, Math.PI / 2, { fundo: '#15110b', cor: '#b7a079', manchas: 6 });
    painel.visible = false;
    const it = interact(painel, () => '<b>E</b>Olhar os desenhos na parede', () => { A.conquista('l6_moacir'); A.sub('lia', 'Esses desenhos não estavam aqui na primeira noite.'); });
    it.on = () => painel.visible;
    ctx._castigo = v => { painel.visible = v; };
  })();

  // ---------- giz do Davi: marca de um atalho de serviço na rejogada daquele capítulo ----------
  let giz = null;
  (function gizAtalho() {
    const m = A.plano(.8, .8, new THREE.MeshStandardMaterial({ map: A.TX.rabisco, transparent: true, opacity: .8 }), -5.9, 1.2, -2.5, Math.PI / 2);
    m.visible = false; giz = m;
  })();

  // ---------- armário podre sorteado: aviso de que o esconderijo decorado pode falhar ----------
  (function armarioPodre() {
    // uma plaquinha de giz "range" marca, por semente, qual canto tem o armário que não aguenta
    const cantos = [[-33, -3], [20, -2.5], [-7, -22], [31, -24]];
    const c = cantos[B.esc('podre', cantos.length)];
    const m = A.plano(.5, .5, new THREE.MeshStandardMaterial({ map: A.TX.rabisco, transparent: true, opacity: .55 }), c[0], 1.3, c[1], 0);
    // cosmético; o aviso sai uma vez quando o jogador passa perto
    let avisou = false;
    A.W.tick.push(() => { if (!avisou && B.dist(c[0], c[1]) < 2.2 && S.chapter >= 1) { avisou = true; A.sub('lia', 'Essa madeira está podre. Não me esconderia aqui hoje.'); } });
  })();

  // ---------- luminária piscante sorteada num corredor (sensação de casa viva) ----------
  (function lampPisca() {
    const pts = [[-20, -12], [20, -12], [-5, -3], [10, -12]];
    const p = pts[B.esc('pisca', pts.length)];
    const mat = new THREE.MeshStandardMaterial({ color: 0x000, emissive: 0xffe6b0, emissiveIntensity: .4 });
    box(.5, .06, .18, mat, p[0], 2.9, p[1], grupo, false);
    A.W.tick.push(() => { if (S.flags.energia) mat.emissiveIntensity = Math.random() < .08 ? .05 : .9; else mat.emissiveIntensity = Math.random() < .03 ? .3 : .02; });
  })();

  // ---------- poça refletindo sorteada numa sala ----------
  (function poca() {
    const salas = [[-15, -20], [26, -5], [11, -20], [-29, -20]];
    const p = salas[B.esc('poca', salas.length)];
    A.plano(1.6, 1.2, new THREE.MeshStandardMaterial({ color: 0x0a0f0c, roughness: .05, metalness: .5, transparent: true, opacity: .55 }), p[0], .02, p[1], 0).rotation.x = -Math.PI / 2;
  })();

  // ---------- torneira pingando sorteada nos banheiros (som ocasional) ----------
  (function pinga() {
    const x = 16.5 + B.esc('torn', 3) * 2, z = -22 + B.esc('torn2', 2) * 3; let t = 2 + B.rnd('tp') * 3;
    A.W.tick.push(dt => { t -= dt; if (t <= 0) { t = 2.4 + Math.random() * 2.6; if (B.dist(x, z) < 14) A.SFX.gota({ x, y: 1, z }); } });
  })();

  // ---------- relógio da recepção parado numa hora sorteada por noite ----------
  (function relogioParado() {
    const h = 1 + B.esc('rel', 12), m = B.esc('relm', 12) * 5;
    B.placa([{ t: `${('0' + h).slice(-2)}:${('0' + m).slice(-2)}`, tam: 40, estilo: 'bold' }, { t: 'parado', tam: 14, estilo: 'italic' }], -3.5, 2.6, -13.86, .5, .5, 0, { fundo: '#120e09', cor: '#9a8b66' });
  })();

  // ---------- 2ª jogada: o lema da fachada aparece riscado por baixo ----------
  (function lema() {
    if (!B.ng) return;
    B.placa([{ t: 'Ordem · Fé · Silêncio', tam: 22, estilo: 'italic' }, { t: 'e, raspado por baixo: MENTIRA', tam: 16, estilo: 'bold' }], 0, 3.2, .36, 6, .6, 0, { fundo: 'transparent', cor: '#7a1a12' });
  })();

  // ---------- bilhete sorteado entre dois cantos (acervo sem repetir no automático) ----------
  (function bilhete() {
    const cantos = [[-7.5, -4], [7.5, -4]];
    const c = cantos[B.esc('bil', 2)];
    const m = A.plano(.3, .4, MAT.papel, c[0], 1.15, c[1], c[0] < 0 ? Math.PI / 2 : -Math.PI / 2);
    m.userData.leitura = { t: 'bilhete: "a chave de cima nunca foi perdida. foi escondida."' };
    const it = interact(m, () => '<b>E</b>Ler o bilhete dobrado', () => { A.sub('lia', 'A chave de cima nunca foi perdida. Foi escondida.'); m.visible = false; });
    it.on = () => m.visible;
  })();

  // ---------- marca de giz contando as noites nesta parede (cresce a cada noite) ----------
  (function tally() {
    const n = Math.min(12, (ler().noites || 0));
    if (n <= 0) return;
    B.placa([{ t: '|'.repeat(n).replace(/(.)(?=(.{5})+$)/g, '$1 '), tam: 36, estilo: 'bold' }], -5.9, 1.9, -11.5, 1.1, .4, Math.PI / 2, { fundo: 'transparent', cor: '#d8cba8' });
  })();

  // ---------- lousa da sala de aula com uma frase de giz sorteada ----------
  (function lousa() {
    const frases = ['não corram nos corredores', 'quem contou até dez', 'silêncio é obediência', 'o diretor está ouvindo', 'rezem alto hoje'];
    B.placa([{ t: frases[B.esc('lou', frases.length)], tam: 20, estilo: 'italic' }], -13, 1.7, -.6, 2.4, .7, 0, { fundo: '#101510', cor: '#cfd8c0' });
  })();

  // ---------- fogão da cozinha com a chama piloto acesa, num bico sorteado ----------
  (function fogao() {
    const bx = -33 + B.esc('bic', 3) * .5;
    const chama = new THREE.MeshBasicMaterial({ color: 0x3a66ff, transparent: true, opacity: .8 });
    const m = box(.06, .1, .06, chama, bx, .95, -15.5, grupo, false);
    A.W.tick.push(() => { m.visible = Math.random() > .1; m.scale.y = .7 + Math.random() * .6; });
  })();

  // ---------- despensa: sacos empilhados em arranjo sorteado ----------
  (function sacos() {
    const e = B.esc('sac', 3);
    for (let k = 0; k < 4; k++) { const s = box(.5, .5, .4, MAT.tecido, -32 + (k % 2) * .6, .25 + (e === 1 ? Math.floor(k / 2) * .5 : 0), -31 + (e === 2 ? k * .5 : (k % 2) * .6), grupo, false); s.rotation.y = B.rnd('sk' + k) * .5; }
  })();

  // ---------- diretoria: gaveta deixada aberta num móvel sorteado ----------
  (function gaveta() {
    const x = 8 + B.esc('gav', 3) * 2.5;
    box(.5, .12, .35, MAT.madeiraEsc, x, .7, -1.2, grupo, false);
  })();

  // ---------- pátio: galho caído num ponto sorteado ----------
  (function galho() {
    const p = [[-6, 6], [6, 8], [0, 11], [-9, 12]][B.esc('galho', 4)];
    const g = cyl(.08, .14, 2.2, MAT.tronco, p[0], .15, p[1], 6, grupo); g.rotation.z = Math.PI / 2; g.rotation.y = B.rnd('gy') * 3;
  })();

  // ---------- qual lâmpada do corredor já está acesa (canto seguro) muda por noite ----------
  (function luzSegura() {
    const pts = [[-28, -12], [28, -12], [-5, -5]];
    const p = pts[B.esc('luz', pts.length)];
    const mat = new THREE.MeshStandardMaterial({ color: 0x000, emissive: 0xffe6b0, emissiveIntensity: .7 });
    box(.4, .06, .14, mat, p[0], 2.85, p[1], grupo, false);
  })();

  // ---------- uma porta range sozinha ao chegar no térreo (sorteada) ----------
  (function rangeSozinha() {
    const pts = [[-13, -10], [8, -10], [-15, -14], [11, -14]];
    const p = pts[B.esc('range', pts.length)]; let fez = false;
    A.W.tick.push(() => { if (!fez && S.chapter >= 1 && B.dist(p[0], p[1]) < 8) { fez = true; A.SFX.rangido(1.4, .8, p[0], .5); } });
  })();

  // ---------- mortes no térreo: a parede ganha um arranhão a cada queda ----------
  (function mortes() {
    let morto = false;
    A.W.tick.push(() => { if (S.dead && !morto) { morto = true; mexer(x => { x.mortesTerreo = (x.mortesTerreo || 0) + 1; }); } else if (!S.dead) morto = false; });
  })();

  // ---------- recordes, noites, mortes e noites perfeitas ----------
  let marcouI = false, marcouII = false, contou = false;
  function recorde(chave, t, rotulo) {
    const o = ler(); const ant = o[chave];
    if (ant == null || t < ant) { mexer(x => { x[chave] = t; }); if (ant != null) { A.toast(`Novo recorde — ${rotulo}: ${t | 0}s (antes ${ant | 0}s).`); A.conquista('l6_recorde'); } else A.toast(`Tempo gravado — ${rotulo}: ${t | 0}s.`); }
  }

  return {
    _rj: api,
    sync() {
      // marca recorde de tempo ao ligar o gerador (fim do Cap I) e ao subir (fim do Cap II)
      if (!marcouI && S.flags.energia && S.chapter <= 2) {
        marcouI = true; recorde('recI', S.capT || 0, 'Capítulo I');
        if (B.ng && B.trocada) A.conquista('l6_decorou');
        if ((S.capDano || 0) === 0) { const o = mexer(x => { x.perfeitasTerreo = (x.perfeitasTerreo || 0) + 1; }); A.toast(`Capítulo I sem um arranhão (${o.perfeitasTerreo}ª vez).`); }
      }
      if (!marcouII && S.done && S.done.subir) { marcouII = true; recorde('recII', S.capT || 0, 'Capítulo II'); }
    },
    entrar(cap) {
      // aplica a decoração sorteada da noite (uma vez)
      if (!S.flags._l6terreoVar) {
        S.flags._l6terreoVar = true;
        for (const v of variantes) { try { v(B.esc('v' + variantes.indexOf(v), 3)); } catch (e) {} }
      }
      // conta a noite no internato só na primeira entrada do Capítulo I
      if (cap === 1 && !contou && !S.flags._l6noite) {
        contou = true; S.flags._l6noite = true;
        const o = mexer(x => { x.noites = (x.noites || 0) + 1; });
        if (o.noites >= 5) A.conquista('l6_veterana');
        setTimeout(() => A.toast(B.trocada ? `Noite ${o.noites} no internato — a casa está trocada.` : `Noite ${o.noites} no internato.`), 1800);
      }
      // segredos de segunda jogada ligam aqui
      if (B.ng) {
        if (ctx._castigo) ctx._castigo(true);
        if (giz) giz.visible = true;
      }
    }
  };
}

// =====================================================================
// SUPERIOR — Capítulo III (dormitórios)
// =====================================================================
export function rejogoSuperior(A, S, ctx = {}) {
  const { THREE, MAT, box, cyl, interact, SFX } = A;
  const B = base(A, S, 'superior');
  const grupo = A.W.grupo;
  const api = { i: salt => B.idx(salt), noiteTrocada: B.trocada, segundaJogada: B.ng };

  const variantes = [];

  // qual cama está desarrumada/virada, por dormitório, muda por noite
  (function camasViradas() {
    const dorms = [[-8, -8], [-8, -20], [-8, -42], [8, -18], [8, -44]];
    const cobertas = dorms.map(d => { const c = box(.9, .1, 1.8, MAT.lencol, d[0], .62, d[1], grupo, false); c.visible = false; return c; });
    variantes.push(e => cobertas.forEach((c, k) => { const virada = (k + e) % dorms.length === e % dorms.length; c.visible = true; c.rotation.z = virada ? 1.2 : 0; c.position.y = virada ? .3 : .62; }));
  })();

  // sala de brinquedos: brinquedos espalhados em arranjo diferente
  (function brinquedos() {
    const bs = [];
    for (let k = 0; k < 6; k++) { const b = box(.2, .2, .2, k % 2 ? MAT.madeira : MAT.branco, 0, .1, 0, grupo, false); b.visible = false; bs.push(b); }
    const pts = [[5, -28], [7, -30], [9, -27], [11, -32], [6, -34], [13, -29], [8, -36], [10, -26]];
    variantes.push(e => bs.forEach((b, k) => { const p = pts[(k + e * 3) % pts.length]; b.position.set(p[0], .1, p[1]); b.rotation.y = B.rnd('br' + k + e) * 6; b.visible = true; }));
  })();

  // rouparia: prateleiras arrumadas ou reviradas
  (function rouparia() {
    const trapos = [];
    for (let k = 0; k < 4; k++) { const t = box(.5, .12, .3, MAT.lencol, 10 + (k % 2) * 1.5, .6 + Math.floor(k / 2) * .5, -4 - (k % 2), grupo, false); t.visible = false; trapos.push(t); }
    variantes.push(e => trapos.forEach((t, k) => { t.visible = true; t.position.y = (e === 1 ? .1 : .6) + (B.rnd('rp' + k) * (e === 1 ? .4 : .1)); t.rotation.y = e === 1 ? B.rnd('rpy' + k) * 3 : 0; }));
  })();

  // ---------- quadro da turma no corredor: na 2ª jogada falta uma criança ----------
  (function quadroTurma() {
    const n = B.ng ? 5 : 6;
    const linhas = [{ t: 'Dormitório · chamada', tam: 16, estilo: 'bold' }, { t: '◦ '.repeat(n).trim(), tam: 34 }];
    const q = B.placa(linhas, -2.86, 1.7, -22, .9, .9, Math.PI / 2, { fundo: '#17120c', cor: '#c3b18e', manchas: 3 });
    interact(q, () => B.ng ? '<b>E</b>Contar os nomes da chamada' : 'A lista da chamada, desbotada.', () => { if (B.ng) { A.sub('ana', 'Um... dois... faltou um hoje. Sempre falta um.'); A.conquista('l6_turma'); } });
  })();

  // ---------- esconderijo ocupado sorteado: a semente marca um armário com "Esse é meu" ----------
  (function esconderijoOcupado() {
    const cantos = [[-12.5, -6], [-12.5, -24], [12.5, -14], [12.5, -46]];
    const c = cantos[B.esc('ocup', cantos.length)];
    A.plano(.5, .5, new THREE.MeshStandardMaterial({ map: A.TX.rabisco, transparent: true, opacity: .5 }), c[0], 1.4, c[1], c[0] < 0 ? Math.PI / 2 : -Math.PI / 2);
    let avisou = false;
    A.W.tick.push(() => { if (!avisou && B.dist(c[0], c[1]) < 2 && S.chapter >= 3) { avisou = true; A.sub('ana', 'Esse é meu. Acha outro.'); } });
  })();

  // ---------- NG+: a rouparia lacrada que só abre na segunda volta (nicho com carta do Davi) ----------
  (function roupariaLacrada() {
    const porta = box(.06, 1.9, .9, MAT.madeiraEsc, 12.95, 1.1, -8, grupo, false);
    const g = new THREE.Group(); g.position.set(12.9, 1.4, -8); grupo.add(g);
    for (let k = 0; k < 3; k++) { const t = box(.05, .14, 1.0, MAT.madeira, 0, -.4 + k * .4, 0, g, false); t.rotation.x = (B.rnd('rl' + k) - .5) * .1; }
    const it = interact(porta, () => {
      if (!B.ng) return 'Uma portinha lacrada da rouparia. Não é hoje.';
      if (S.flags._l6roup) return 'O armário embutido está aberto e vazio.';
      return '<b>E</b>Forçar a portinha lacrada';
    }, () => {
      if (!B.ng || S.flags._l6roup) return;
      S.flags._l6roup = true; SFX.rangido(1.5, .9, 12.9, .6); A.emitNoise(12, -8, 7); g.visible = false;
      A.sub('davi', 'guardei aqui o que a irmã celeste nao quis queimar. agora é seu.'); A.conquista('l6_nicho'); A.toast('Dentro, uma carta dobrada e um retrato riscado.');
      mexer(o => { o.roupNG = true; });
    });
    it.on = () => porta.visible;
  })();

  // ---------- giz do atalho ao depósito (rejogada) ----------
  let giz = null;
  (function gizAtalho() { const m = A.plano(.7, .7, new THREE.MeshStandardMaterial({ map: A.TX.rabisco, transparent: true, opacity: .8 }), 2.9, 1.2, -52, -Math.PI / 2); m.visible = false; giz = m; })();

  // ---------- janela batendo num dormitório sorteado (vento + susto calado) ----------
  (function janelaBate() {
    const ds = [[-12.8, -8], [-12.8, -20], [12.8, -18], [12.8, -44]];
    const d = ds[B.esc('jan', ds.length)];
    const bat = box(.05, .9, .7, MAT.madeiraEsc, d[0], 1.7, d[1], grupo, false); let t = 4 + B.rnd('jt') * 4;
    A.W.tick.push(dt => { t -= dt; const a = Math.max(0, Math.sin(A.perf() * 6)) * (t < .6 ? 1 : 0); bat.rotation.y = a * .5; if (t <= 0) { t = 5 + Math.random() * 5; if (B.dist(d[0], d[1]) < 10) A.SFX.pancada(d[0], d[1]); } });
  })();

  // ---------- caixinha/cavalinho de brinquedo que se mexe sozinho, sorteado ----------
  (function brinqMexe() {
    const pts = [[6, -27], [12, -31], [8, -35], [5, -29]];
    const p = pts[B.esc('mexe', pts.length)];
    const c = cyl(.03, .05, .18, MAT.branco, p[0], .12, p[1], 6, grupo);
    A.W.tick.push(() => { if (S.chapter >= 3) c.rotation.y += .02; });
  })();

  // ---------- relógio parado do andar, hora sorteada ----------
  (function relogio() {
    const h = 1 + B.esc('rel', 12), m = B.esc('relm', 12) * 5;
    B.placa([{ t: `${('0' + h).slice(-2)}:${('0' + m).slice(-2)}`, tam: 36, estilo: 'bold' }], -2.86, 2.4, -34, .5, .5, Math.PI / 2, { fundo: '#120e09', cor: '#9a8b66' });
  })();

  // ---------- bilhete da Celeste sorteado entre dois cantos do quarto ----------
  (function bilhete() {
    const cantos = [[-11, -56], [-5, -50]];
    const c = cantos[B.esc('bilc', 2)];
    const mm = A.plano(.3, .4, MAT.papel, c[0], 1.1, c[1], 0);
    mm.userData.leitura = { t: 'recado: "se a menina contar até dez, não corra. fique de pedra."' };
    const it = interact(mm, () => '<b>E</b>Ler o recado da Irmã', () => { A.sub('lia', 'Se a menina contar até dez, não corra. Fique de pedra.'); mm.visible = false; });
    it.on = () => mm.visible;
  })();

  // ---------- risadinha vem de um dormitório sorteado ao passar ----------
  (function risada() {
    const ds = [[-8, -8], [-8, -42], [8, -18], [8, -44]];
    const d = ds[B.esc('ris', ds.length)]; let soltou = false;
    A.W.tick.push(() => { if (!soltou && S.chapter >= 3 && B.dist(d[0], d[1]) < 4) { soltou = true; A.SFX.risada(d[0], d[1]); } });
  })();

  // ---------- espelho do banheiro embaçado com uma palavra sorteada (2ª jogada) ----------
  (function espelho() {
    const palavras = ['VOLTE', 'ELE OUVE', 'NÃO É SEU', 'DEZ', 'FIQUE'];
    const w = palavras[B.esc('esp', palavras.length)];
    const m = B.placa([{ t: B.ng ? w : '', tam: 30, estilo: 'bold' }], -12.8, 1.6, -31, .8, .6, Math.PI / 2, { fundo: '#0c110e', cor: '#9fb5a6' });
    m.visible = B.ng;
  })();

  // ---------- marca de giz contando as noites no andar ----------
  (function tally() {
    const n = Math.min(12, (ler().noites || 0)); if (n <= 0) return;
    B.placa([{ t: '|'.repeat(n).replace(/(.)(?=(.{5})+$)/g, '$1 '), tam: 32, estilo: 'bold' }], -2.86, 1.9, -46, 1.0, .4, Math.PI / 2, { fundo: 'transparent', cor: '#d8cba8' });
  })();

  // ---------- depósito: caixas empilhadas em arranjo sorteado ----------
  (function caixas() {
    const e = B.esc('cx', 3);
    for (let k = 0; k < 4; k++) { const c = box(.5, .5, .5, MAT.madeira, 5 + (k % 2) * .6, .25 + (e === 1 ? Math.floor(k / 2) * .5 : 0), -56 + (e === 2 ? k * .5 : (k % 2) * .6), grupo, false); c.rotation.y = B.rnd('cxk' + k) * .5; }
  })();

  // ---------- um urso de pano aparece numa cama sorteada ----------
  (function urso() {
    const camas = [[-8, -8], [-8, -20], [-8, -42], [8, -18], [8, -44]];
    const c = camas[B.esc('urso', camas.length)];
    const g = new THREE.Group(); g.position.set(c[0], .7, c[1]); grupo.add(g);
    box(.18, .22, .14, MAT.tecido, 0, 0, 0, g, false); const cab = new THREE.Mesh(new THREE.SphereGeometry(.1, 8, 6), MAT.tecido); cab.position.y = .18; g.add(cab);
  })();

  // ---------- a chamada no corredor marca um número de presentes sorteado ----------
  (function chamada() {
    const n = 8 + B.esc('cha', 8);
    B.placa([{ t: 'presentes: ' + n, tam: 18, estilo: 'bold' }, { t: 'faltas: ' + (3 + B.esc('cha2', 4)), tam: 15 }], 2.86, 1.4, -10, .8, .7, -Math.PI / 2, { fundo: '#17120c', cor: '#c3b18e' });
  })();

  // ---------- vela do quarto da Celeste acesa ou apagada por noite ----------
  (function vela() {
    const acesa = B.esc('vela', 2) === 0;
    const m = new THREE.MeshBasicMaterial({ color: 0xffb050, transparent: true, opacity: acesa ? .9 : 0 });
    const ch = box(.04, .12, .04, m, -11, 1.1, -55, grupo, false);
    if (acesa) A.W.tick.push(() => { ch.scale.y = .7 + Math.random() * .6; });
  })();

  // ---------- torneira pingando no banheiro, ponto sorteado ----------
  (function pinga() {
    const x = -12 + B.esc('tap', 2) * 1.5, z = -31 + B.esc('tap2', 3); let t = 2 + B.rnd('tpt') * 3;
    A.W.tick.push(dt => { t -= dt; if (t <= 0) { t = 2.4 + Math.random() * 2.4; if (B.dist(x, z) < 12) A.SFX.gota({ x, y: 1, z }); } });
  })();

  // ---------- rouparia: luz piscando com uma mariposa, por noite ----------
  (function roupariaLuz() {
    const mat = new THREE.MeshStandardMaterial({ color: 0x000, emissive: 0xffe0a0, emissiveIntensity: .5 });
    box(.3, .05, .12, mat, 8 + B.esc('rl', 3), 2.7, -6, grupo, false);
    A.W.tick.push(() => { mat.emissiveIntensity = Math.random() < .12 ? .05 : .7; });
  })();

  // ---------- desenho de giz no chão da sala de brinquedos, sorteado ----------
  (function gizChao() {
    const desenhos = ['amarelinha', 'um círculo de dez', 'mãos dadas', 'uma cruz'];
    B.placa([{ t: desenhos[B.esc('gz', desenhos.length)], tam: 18, estilo: 'italic' }], 9, .03, -31, 1.6, 1.0, 0, { fundo: 'transparent', cor: '#cfd8c0' }).rotation.x = -Math.PI / 2;
  })();

  // ---------- mortes no andar ----------
  (function mortes() {
    let morto = false;
    A.W.tick.push(() => { if (S.dead && !morto) { morto = true; mexer(x => { x.mortesSuperior = (x.mortesSuperior || 0) + 1; }); } else if (!S.dead) morto = false; });
  })();

  let marcou = false, contou = false;
  function recorde(chave, t, rotulo) {
    const o = ler(); const ant = o[chave];
    if (ant == null || t < ant) { mexer(x => { x[chave] = t; }); if (ant != null) { A.toast(`Novo recorde — ${rotulo}: ${t | 0}s (antes ${ant | 0}s).`); A.conquista('l6_recorde'); } else A.toast(`Tempo gravado — ${rotulo}: ${t | 0}s.`); }
  }

  return {
    _rj: api,
    sync() {
      if (!marcou && S.done && S.done.ana) {
        marcou = true; recorde('recIII', S.capT || 0, 'Capítulo III');
        if ((S.capDano || 0) === 0) { const o = mexer(x => { x.perfeitasSuperior = (x.perfeitasSuperior || 0) + 1; }); A.toast(`Andar atravessado sem ser tocada (${o.perfeitasSuperior}ª vez).`); }
      }
    },
    entrar(cap) {
      if (!S.flags._l6supVar) { S.flags._l6supVar = true; for (const v of variantes) { try { v(B.esc('v' + variantes.indexOf(v), 3)); } catch (e) {} } }
      if (B.ng && giz) giz.visible = true;
      if (cap === 3 && B.trocada && !S.flags._l6supAviso) { S.flags._l6supAviso = true; setTimeout(() => A.toast('Noite trocada: a engrenagem e os brinquedos não estão onde ficavam.'), 2000); }
    }
  };
}
