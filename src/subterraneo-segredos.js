// SEGREDOS DO SUBTERRÂNEO — Lote 4: túneis (Cap. IV), cemitério e capela (Cap. V)
// Salas secretas, colecionáveis escondidos, recompensas para quem explora e coisas para contar aos amigos.
// Tudo opcional e perto do caminho: nada trava objetivo, nada obriga a voltar.
// Ganchos: tuneis()/cemiterio() em mapas.js devolvem SUBS.tuneis(...)/SUBS.cemiterio(...) por fora do lote 3,
// e a cabana de lençóis entra na lista de salas dos túneis (salasTuneis/portasTuneis/soltar).
import { juntar } from './internato.js';

const R = window.ROTEIRO;

// ---------------------------------------------------------------------
// texto novo (entra no roteiro na carga do módulo, antes do motor copiar)
// ---------------------------------------------------------------------
const NOTAS = [
  { id: 'l4_poco', secreta: true, titulo: 'Bilhete no gargalo', texto: 'Um papel de caderno enrolado no gargalo da garrafa, seco, com letra redonda de menina:\n\n"não joga lixo no meu quarto.\naqui embaixo é onde eu conto.\nse quiser brincar, desce. — A."\n\n(no verso, a mesma letra, menor) eu sempre ganho.' },
  { id: 'l4_pipoca', secreta: true, titulo: 'Bilhete do Pipoca', texto: 'Um bilhete dobrado dentro de uma gaiola de arame, do tamanho de uma mão:\n\n"Esse é o Pipoca. Ele é branco porque nasceu aqui embaixo e nunca viu sol.\nEle sabe o caminho de tudo. Quando o seu Moacir vem, ele fica parado.\nSe alguém achar ele, não acende a luz na cara dele. Ele não gosta.\nA gente vai voltar pra buscar. — Davi, 12 anos"\n\n(embaixo, outra letra) eu dei comida pra ele. — T.' },
  { id: 'l4_carta', secreta: true, titulo: 'Carta dos três', texto: 'Uma folha de caderno dobrada em quatro, com três letras diferentes.\n\n"LIA,\nse você achou isso é porque veio. A gente sabia.\nO Davi disse que você ia achar o X porque você sempre achava tudo que ele escondia.\nTem uma figurinha que brilha (é a mais rara), uma bolinha de gude (a azul é do Tomé, a outra é sua agora) e o apito.\nO apito é pra quando você tiver medo. A gente nunca usou.\nNão chora. Aqui é bom quando ninguém conta.\n\n— Davi, Tomé e Ana"\n\n(no canto, a letra do Davi, apertada) você cresceu? aposto que cresceu.' }
];
for (const n of NOTAS) if (!R.notas.some(x => x.id === n.id)) R.notas.push(n);

const CONQS = [
  { id: 'l4_tamanho', nome: 'Do Tamanho Dele', desc: 'Agache junto às marcas de altura do túnel norte.', secreta: true },
  { id: 'l4_oitavo', nome: 'O Oitavo Nicho', desc: 'Ilumine o nicho que ainda não tem dono.', secreta: true },
  { id: 'l4_sapatos', nome: 'Trinta e Oito', desc: 'Ache o par que não é de criança na prateleira dos sapatos.', secreta: true },
  { id: 'l4_poco', nome: 'Fundo do Poço', desc: 'Jogue uma garrafa no poço seco dos túneis.', secreta: true },
  { id: 'l4_livre', nome: 'Livre', desc: 'Solte o canário e ouça o que ele faz quando o sino toca.', secreta: true },
  { id: 'l4_eco', nome: 'Eco Desobediente', desc: 'Chame o irmão na cisterna até o eco responder.', secreta: true },
  { id: 'l4_rato', nome: 'Rato de Laboratório', desc: 'Siga o rato branco sem assustar ele.', secreta: true },
  { id: 'l4_cicero', nome: 'O Quadragésimo Primeiro', desc: 'Puxe o sapato da parede de 1951 até a mão soltar.', secreta: true },
  { id: 'l4_afinada', nome: 'Afinada', desc: 'Ouça o canto das três válvulas antes de girar e acerte a ordem sem errar.', secreta: true },
  { id: 'l4_emergencia', nome: 'Válvula do Pedreiro', desc: 'Esvazie os túneis de uma vez pela válvula escondida.', secreta: true },
  { id: 'l4_cabana', nome: 'Debaixo do Lençol', desc: 'Encontre o esconderijo dos três nos túneis.', secreta: true },
  { id: 'l4_eraeu', nome: 'Era Eu', desc: 'Limpe a lápide coberta de musgo no fundo do cemitério.', secreta: true },
  { id: 'l4_fatuo', nome: 'Luz de Defunto', desc: 'Siga a luz azul no escuro até onde ela se apaga.', secreta: true },
  { id: 'l4_aindaaqui', nome: 'Ainda Aqui', desc: 'Puxe a cordinha do sininho que entra na terra.', secreta: true },
  { id: 'l4_setepalmos', nome: 'Sete Palmos', desc: 'Deite na cova aberta e aguente o máximo que puder.', secreta: true },
  { id: 'l4_tesouro', nome: 'Tesouro de Pirata', desc: 'Ache o que os três enterraram e leia a carta.', secreta: true },
  { id: 'l4_lua', nome: 'Lua Cheia', desc: 'Jogue numa noite de lua cheia de verdade e leia a pedra que só ela mostra.', secreta: true },
  { id: 'l4_lugar', nome: 'Lugar Reservado', desc: 'Remexa a terra fofa da cova sem nome.', secreta: true },
  { id: 'l4_cambio', nome: 'Câmbio', desc: 'Pisque o pedido de socorro para o posto do Seu Joaquim.', secreta: true },
  { id: 'l4_guardado', nome: 'Lugar Guardado', desc: 'Esconda-se no confessionário e leia a madeira.', secreta: true }
];
for (const c of CONQS) if (!R.conquistas.some(x => x.id === c.id)) R.conquistas.push(c);
const TOTAL = CONQS.length;

// a anotação do pedreiro ganha a válvula que ninguém conta
{ const n9 = R.notas.find(n => n.id === 'n9');
  if (n9 && !n9.texto.includes('emergência')) n9.texto += '\n(embaixo, a lápis, outra letra) A de emergência fica no fundo da cisterna, deitada. Só se vê de joelhos, com luz em cima da água. Abre tudo de uma vez, mas o cano berra.'; }

// ---------------------------------------------------------------------
// legendas de som próprias
// ---------------------------------------------------------------------
const LEG = {
  l4Canta: { t: 'um canário canta', imp: 0, cd: 14, cat: 'h', pos: a => a[0] },
  l4Cala: { t: 'o canário se calou de repente', imp: 1, cd: 10, cat: 'p', pos: a => a[0] },
  l4Eco: { t: 'o eco devolve a sua voz, mais fraca', imp: 0, cd: 5, cat: 'h', pos: a => a[0] },
  l4EcoForte: { t: 'o eco volta mais alto que a sua voz', imp: 1, cd: 5, cat: 'p', pos: a => a[0] },
  l4Ronco: { t: 'os canos roncam pelo túnel inteiro', imp: 1, cd: 4, cat: 'p' },
  l4Nota: { t: 'o cano canta uma nota baixinha', imp: 0, cd: 1, cat: 'h', pos: a => a[0] },
  l4Patinhas: { t: 'patinhas pequenas correndo na água', imp: 0, cd: 5, pos: a => a[0] },
  l4Unha: { t: 'unha raspando na pedra', imp: 1, cd: 8, cat: 'p', pos: a => a[0] },
  l4Puxa: { t: 'alguém puxa de volta, do outro lado dos tijolos', imp: 1, cd: 3, cat: 'p', pos: a => a[0] },
  l4Fareja: { t: 'alguém fareja do lado de fora da grade', imp: 1, cd: 6, cat: 'p', pos: a => a[0] },
  l4Caixinha: { t: 'uma caixinha de música toca bem baixo', imp: 0, cd: 25, cat: 'h', pos: a => a[0] },
  l4Conta: { t: 'uma menina conta lá no fundo do poço', imp: 1, cd: 8, cat: 'p', pos: a => a[0] },
  l4Rola: { t: 'uma garrafa rolando até você', imp: 1, cd: 4, cat: 'p', pos: a => a[0] },
  l4Sininho: { t: 'um sininho toca sozinho em cima de uma cova', imp: 1, cd: 10, cat: 'h', pos: a => a[0] },
  l4Pedra: { t: 'pedra rangendo atrás de você', imp: 1, cd: 8, cat: 'p', pos: a => a[0] },
  l4TerraCai: { t: 'punhados de terra caindo em cima de você', imp: 1, cd: 4, cat: 'p' },
  l4Fria: { t: 'algo frio fecha a sua mão lá dentro', imp: 1, cd: 6, cat: 'p' },
  l4Radio: { t: 'o rádio chia e responde em código', imp: 1, cd: 6, cat: 'h' },
  l4Canto9: { t: 'o canário canta nove notas', imp: 0, cd: 10, cat: 'h', pos: a => a[0] },
  l4Riso: { t: 'uma risadinha lá no fundo', imp: 1, cd: 6, cat: 'p', pos: a => a[0] }
};
function legendas(A) { try { const d = A.legendas; if (d) for (const [k, v] of Object.entries(LEG)) if (!d[k]) d[k] = v; } catch (e) {} }
const legenda = (A, k, pos) => { try { A.SFX[k](pos ? { x: pos.x, y: pos.y ?? 1, z: pos.z } : null); } catch (e) {} };

// ---------------------------------------------------------------------
// utilidades
// ---------------------------------------------------------------------
const nomeJogador = () => { try { const r = localStorage.getItem('hora-silencio-nome'); if (!r) return ''; let v = r; try { v = JSON.parse(r); } catch (e) {} return typeof v === 'string' ? v.trim().slice(0, 16) : ''; } catch (e) { return ''; } };
const dois = n => String(n).padStart(2, '0');
const dataHoje = () => { const d = new Date(); return `${dois(d.getDate())}/${dois(d.getMonth() + 1)}/${d.getFullYear()}`; };
const baixa = () => { try { return !!(window.__plat && window.__plat.O && window.__plat.O.qual === 'baixa'); } catch (e) { return false; } };
// fase real da lua pela data do aparelho (ciclo sinódico, sem rede): 0 nova, ~14,8 cheia
function luaIdade(d = new Date()) { const ref = Date.UTC(2000, 0, 6, 18, 14), sin = 29.530588853; return (((d.getTime() - ref) / 864e5) % sin + sin) % sin; }

// teclas extras (V nos lugares certos, E/C para levantar da cova): um ouvinte só, cada mapa registra as suas
const TECLAS = {};
let teclasOn = false;
function ligarTeclas() {
  if (teclasOn) return; teclasOn = true;
  window.addEventListener('keydown', e => {
    try { const J = window.__jogo; if (!J || J.mode !== 'jogo' || J.ui || !J.S || J.S.dead || e.repeat) return; const f = TECLAS[e.code]; if (f) f(e); } catch (er) { console.warn('segredos (lote 4)', er); }
  });
}
// garrafas que caem em lugares especiais (poço seco): um embrulho só no SUST.garrafaVolta
const ALVOS = [];
function ligarGarrafa(A) {
  const SU = A.sustos; if (!SU || SU._l4) return; SU._l4 = true;
  const orig = SU.garrafaVolta;
  SU.garrafaVolta = fim => {
    try { const W = A.W; for (const z of ALVOS) if (z.grupo === W.grupo && Math.hypot(fim.x - z.x, fim.z - z.z) < z.r) return z.f(fim) !== false; } catch (e) { console.warn('segredos (lote 4)', e); }
    return orig ? orig(fim) : false;
  };
}

function base(A, S) {
  const { THREE } = A;
  const agenda = [], ticks = [];
  const depois = (seg, f) => agenda.push({ t: seg, f });
  A.W.tick.push(dt => {
    for (let i = agenda.length - 1; i >= 0; i--) { agenda[i].t -= dt; if (agenda[i].t <= 0) { const f = agenda[i].f; agenda.splice(i, 1); try { f(); } catch (e) { console.warn('segredos (lote 4)', e); } } }
    const t = A.perf();
    for (const f of ticks) try { f(dt, t); } catch (e) { console.warn('segredos (lote 4)', e); }
  });
  const _v = new THREE.Vector3(), _f = new THREE.Vector3();
  const olhando = (x, y, z, cos = .85, alc = 10) => {
    _v.set(x, y, z).sub(A.camera.position); const d = _v.length(); if (d > alc || d < .01) return false;
    A.camera.getWorldDirection(_f); return _f.dot(_v.multiplyScalar(1 / d)) > cos;
  };
  const dist = (x, z) => Math.hypot(A.P.pos.x - x, A.P.pos.z - z);
  const luz = () => !!S.flashOn && A.flash.intensity > 1.2;
  const iluminado = (x, y, z, alc = 6, cos = .9) => luz() && olhando(x, y, z, cos, alc);
  const tex = (w, h, draw) => A.canvasTex(w, h, (g, W, H) => { g.clearRect(0, 0, W, H); draw(g, W, H); });
  const decal = (t, w, h, x, y, z, ry = 0, o = {}) => {
    const m = new THREE.MeshStandardMaterial({ map: t, transparent: true, depthWrite: false, roughness: 1, polygonOffset: true, polygonOffsetFactor: -2, ...(o.mat || {}) });
    return A.plano(w, h, m, x, y, z, ry, o.parent || A.W.grupo);
  };
  const uma = (id, f) => { if (S.flags[id]) return false; S.flags[id] = true; f && f(); return true; };
  const fala = (txt, quem = 'lia') => A.sub(quem, txt);
  const rotulo = (obj, txt, act, extra) => A.interact(obj, typeof txt === 'function' ? txt : () => txt, act || (() => {}), extra);
  const noMapa = id => A.W.mapa === id && !A.S.dead;
  const medo = n => { S.fear = Math.max(0, Math.min(100, S.fear + n)); };
  const segurando = it => A.perf() - (it.seguradoT ?? -9) < .1;
  // segredo achado: conquista + contador do subterrâneo
  const segredo = (id, texto) => {
    const sg = S.flags.l4seg || (S.flags.l4seg = {});
    A.conquista(id);
    if (sg[id]) return; sg[id] = true;
    const n = Object.keys(sg).length;
    depois(1.2, () => A.toast(`${texto ? texto + ' · ' : ''}Segredo do subterrâneo ${n}/${TOTAL}`));
  };
  const texto = (linhas, o) => A.textoTex(linhas, o);
  return { THREE, depois, ticks, olhando, dist, luz, iluminado, tex, decal, uma, fala, rotulo, noMapa, medo, segurando, segredo, texto };
}

// sons próprios (mesmo AudioContext do motor)
function sonsS(A) {
  const au = A.audio, ok = () => au && au.AC && au.AC.state !== 'closed' && !window.__teste;
  const p3 = (p, y = 1) => p ? { x: p.x, y: p.y ?? y, z: p.z } : null;
  return {
    piado(pos, vol = .05) { if (!ok()) return; const t0 = au.AC.currentTime, n = 2 + (Math.random() * 3 | 0); for (let i = 0; i < n; i++) { const t = t0 + i * (.09 + Math.random() * .05), g = au.saida(p3(pos, 2.3), .4); const o = au.osc('sine', 3100 + Math.random() * 700, t, .1, g); o.frequency.exponentialRampToValueAtTime(4700, t + .05); au.env(g, t, .004, vol, .08); } },
    sininho(pos, vol = .22) { if (!ok()) return; const t = au.AC.currentTime; for (const [m, a] of [[1, 1], [2.76, .4], [5.4, .15]]) { const g = au.saida(p3(pos, 1.3), .7); au.osc('sine', 1760 * m, t, 1.7, g); au.env(g, t, .003, vol * a, 1.5); } },
    unha(pos, dur = 1.4, vol = .16) { if (!ok()) return; const t = au.AC.currentTime, g = au.saida(p3(pos), .4); const f = au.burst(t, dur, 'bandpass', 2900, 6, g); f.frequency.linearRampToValueAtTime(1800, t + dur); au.env(g, t, .06, vol, dur * .9); },
    eco(pos, vol = .12, grave = false) { if (!ok()) return; const t = au.AC.currentTime; const g = au.saida(p3(pos), .95); au.burst(t, .32, 'bandpass', grave ? 520 : 760, 5, g); au.env(g, t, .03, vol, .3); const g2 = au.saida(p3(pos), .95); au.burst(t + .28, .34, 'bandpass', grave ? 900 : 1180, 5, g2); au.env(g2, t + .28, .03, vol * .8, .32); },
    plop(pos, vol = .1) { if (!ok()) return; const t = au.AC.currentTime, g = au.saida(p3(pos, .2), .9); const o = au.osc('sine', 260, t, .28, g); o.frequency.exponentialRampToValueAtTime(820, t + .12); au.env(g, t, .004, vol, .22); },
    patinha(pos) { if (!ok()) return; const t = au.AC.currentTime, g = au.saida(p3(pos, .1), .3); au.burst(t, .025, 'highpass', 3200, 2, g, 0); au.env(g, t, .002, .035, .02); },
    rolar(pos, dur = 1.4) { if (!ok()) return; const t0 = au.AC.currentTime; for (let i = 0; i < 16; i++) { const t = t0 + i * dur / 16, g = au.saida(p3(pos, .1), .3); au.burst(t, .03, 'bandpass', 2300 + Math.random() * 900, 4, g, 0); au.env(g, t, .002, .09, .03); } },
    caixinha(pos, notas, vol = .045, passo = .4) { if (!ok()) return notas.length * passo; const t0 = au.AC.currentTime; notas.forEach((f, i) => { if (!f) return; const t = t0 + i * passo, g = au.saida(p3(pos, .4), .6); au.osc('triangle', f * 2 * (1 + (Math.random() - .5) * .01), t, .55, g); au.env(g, t, .005, vol, .5); }); return notas.length * passo; },
    ronco(dur = 4, vol = .5) { if (!ok()) return; const t = au.AC.currentTime, g = au.saida(null, .6); const f = au.burst(t, dur, 'lowpass', 140, 1.5, g); f.frequency.linearRampToValueAtTime(70, t + dur); au.env(g, t, .3, vol, dur * .85); const g2 = au.saida(null, .4); const o = au.osc('sawtooth', 44, t, dur, g2); o.frequency.linearRampToValueAtTime(31, t + dur); au.env(g2, t, .4, vol * .25, dur * .8); },
    pedra(pos, dur = 1.3, vol = .28) { if (!ok()) return; const t = au.AC.currentTime, g = au.saida(p3(pos), .5); const f = au.burst(t, dur, 'lowpass', 300, 3, g); f.frequency.linearRampToValueAtTime(160, t + dur); au.env(g, t, .15, vol, dur * .85); },
    respiro(vol = .12) { if (!ok()) return; const t = au.AC.currentTime; for (const [k, d] of [[0, 1.3], [1.9, 1.5], [4, 1.4]]) { const g = au.saida(null, .2); const f = au.burst(t + k, d, 'lowpass', 650, 2, g); f.frequency.linearRampToValueAtTime(360, t + k + d); au.env(g, t + k, .45, vol, d * .7); } },
    terra(pos, vol = .3) { if (!ok()) return; const t = au.AC.currentTime, g = au.saida(p3(pos, .3), .3); au.burst(t, .3, 'lowpass', 420, 1, g, 0); au.env(g, t, .01, vol, .28); const g2 = au.saida(p3(pos, .3), .3); au.osc('sine', 70, t, .2, g2); au.env(g2, t, .005, vol * .7, .18); },
    canto9(pos) { if (!ok()) return; const t0 = au.AC.currentTime; [523, 587, 659, 523, 659, 784, 659, 587, 523].forEach((f, i) => { const t = t0 + i * .42, g = au.saida(p3(pos, 5.6), .7); const o = au.osc('sine', f * 4, t, .36, g); o.frequency.setValueAtTime(f * 4, t); o.frequency.linearRampToValueAtTime(f * 4.12, t + .08); o.frequency.linearRampToValueAtTime(f * 4, t + .3); au.env(g, t, .01, .07, .33); }); },
    risada(pos, vol = .08) { if (!ok()) return; const t0 = au.AC.currentTime; for (let i = 0; i < 4; i++) { const t = t0 + i * .16, g = au.saida(p3(pos), .8); const f = au.burst(t, .1, 'bandpass', 1500 + i * 60, 6, g, 0); f.frequency.linearRampToValueAtTime(1150, t + .09); au.env(g, t, .01, vol, .09); } },
    bipes(pos, seq, vol = .06) { if (!ok()) return; const t0 = au.AC.currentTime; let t = t0; for (const c of seq) { const d = c === 'L' ? .36 : .12; const g = au.saida(p3(pos), .3); au.osc('square', 880, t, d, g); au.env(g, t, .005, vol, d); t += d + .14; } }
  };
}

// melodias da caixinha (a da sala de brinquedos e a cantiga que a Irmã Celeste cantarolava)
const MEL_CAIXA = [659, 784, 659, 523, 587, 494, 523, 0, 440, 523, 587, 659, 0, 0];
const MEL_CANTIGA = [392, 330, 392, 330, 294, 330, 262, 0, 392, 330, 392, 440, 392, 0, 0];

// =====================================================================
// TÚNEIS (Capítulo IV)
// =====================================================================
// a cabana de lençóis: um vão escondido atrás da grade baixa do túnel norte (lado leste)
const CAB = { x0: 2, x1: 4.8, z0: -48.2, z1: -44.8, bx: 2, bz: -46.5, larg: 1.0, alto: 1.0 };
export const salasTuneis = () => [{ id: 'cabana', nome: 'Cabana de lençóis', x0: CAB.x0, x1: CAB.x1, z0: CAB.z0, z1: CAB.z1, piso: 'madeira', parede: 'tijolo', h: 1.3, semLuz: true, seguro: true }];
export const portasTuneis = () => [{ id: 'cabT4', a: 't4', b: 'cabana', x: CAB.bx, z: CAB.bz, eixo: 'z', tipo: 'aberta', largura: CAB.larg, alto: CAB.alto }];
// a cabana não entra no mapa de caminhos: ele não cabe, a Procissão e a Menina não passam
export function soltar(A) { const L = A.W.links; for (let i = L.length - 1; i >= 0; i--) if (L[i].a === 'cabana' || L[i].b === 'cabana') L.splice(i, 1); }

export function tuneis(A, S, def, ctx = {}) {
  const U = base(A, S), som = sonsS(A), { THREE } = U, { MAT, box, cyl } = A;
  const X = {}, tick = f => U.ticks.push(f);
  const nivel = ctx.nivel || (() => .3), O = ctx.O, FX = ctx.FX;
  legendas(A); ligarTeclas(); ligarGarrafa(A);
  for (let i = ALVOS.length - 1; i >= 0; i--) if (ALVOS[i].grupo !== A.W.grupo) ALVOS.splice(i, 1);
  for (const k of Object.keys(TECLAS)) delete TECLAS[k];
  const nome = nomeJogador(), hoje = dataHoje();

  // ---------- ESCADA: a lista de quem desceu, riscada a prego — a última linha é você
  { const t = U.tex(512, 400, (g, w) => {
      const linhas = [['ANTÔNIO', '1951'], ['LUIZ', '1952'], ['JOÃO', '1955'], ['M. DAS DORES', '1958'], ['ROSA', '1965'], ['ZÉ', '1966'], ['CÉLIA', '1971'], ['BENEDITO', '1975'], ['TOMÉ', '1979'], ['ANA', '1979'], ['DAVI', '1979']];
      g.font = '21px "Special Elite",monospace'; g.textAlign = 'left';
      g.fillStyle = 'rgba(214,206,186,.75)'; g.fillText('QUEM DESCEU', 30, 28);
      linhas.forEach(([n, a], i) => { const y = 58 + i * 27; g.save(); g.translate(30 + Math.random() * 8, y); g.rotate((Math.random() - .5) * .04); g.fillStyle = `rgba(214,206,186,${.42 + Math.random() * .2})`; g.fillText(`${n} — ${a}`, 0, 0); g.strokeStyle = 'rgba(30,26,20,.7)'; g.lineWidth = 2; g.beginPath(); g.moveTo(-4, -7); g.lineTo(g.measureText(`${n} — ${a}`).width + 6, -5); g.stroke(); g.restore(); });
      const ult = `${(nome || 'A IRMÃ').toUpperCase()} — ${hoje}`;
      g.save(); g.translate(30, 58 + 11 * 27 + 8); g.rotate(-.02); g.font = 'bold 23px "Special Elite",monospace'; g.fillStyle = 'rgba(250,246,234,.95)'; g.fillText(ult, 0, 0); g.restore();
      for (let i = 0; i < 50; i++) { g.fillStyle = 'rgba(240,232,214,.5)'; g.fillRect(30 + Math.random() * Math.min(w - 60, 15 * ult.length), 58 + 11 * 27 + 12 + Math.random() * 12, 1.5, 1.5); }
    });
    const d = U.decal(t, 1.5, 1.17, -1.8, 1.45, -.13, Math.PI);
    const fim = () => U.uma('l4_lista', () => U.depois(1, () => U.fala(nome ? `“${nome}”... a tinta do prego ainda tá fresca. Como ele sabe esse nome?` : '“A irmã”. Desceu hoje. ...Sou eu.')));
    U.rotulo(d, () => `Nomes riscados a prego ao lado da escada, cada um com o ano em que desceu. A última linha é nova: “${(nome || 'A IRMÃ').toUpperCase()} — ${hoje}”.`, fim);
    tick(() => { if (!S.flags.l4_lista && U.iluminado(-1.8, 1.3, -.13, 4, .93)) fim(); });
  }

  // ---------- TÚNEL NORTE: marcas de altura numa coluna — a sua está lá, na altura dos seus olhos
  { const x = 1.87, z = -44.4, y0 = .3, y1 = 2.1;
    const t = U.tex(128, 512, (g, w, h) => {
      const Y = m => (y1 - m) / (y1 - y0) * h;
      g.font = '13px "Special Elite",monospace'; g.textAlign = 'left';
      for (const [m, n] of [[.84, 'JOSÉ 31'], [.92, 'IRENE 47'], [1.0, 'LUIZ 52'], [.88, 'ROSA 65'], [1.07, 'BENÉ 75'], [.82, 'ANA 79'], [.9, 'TOMÉ 79']]) { g.fillStyle = 'rgba(214,206,186,.6)'; g.fillRect(6, Y(m), 44, 2); g.fillText(n, 54, Y(m) + 4); }
      g.fillStyle = 'rgba(232,224,204,.85)'; g.fillRect(6, Y(.95), 52, 3); g.font = 'bold 14px "Special Elite",monospace'; g.fillText('DAVI 79', 60, Y(.95) + 5);
      g.fillStyle = 'rgba(252,248,238,.97)'; g.fillRect(4, Y(1.62), 60, 3); g.fillText('LIA 94', 66, Y(1.62) + 5);
      for (let i = 0; i < 30; i++) g.fillRect(4 + Math.random() * 60, Y(1.62) + 4 + Math.random() * 6, 1.5, 1.5);
    });
    const d = U.decal(t, .48, y1 - y0, x, (y0 + y1) / 2, z, -Math.PI / 2);
    U.rotulo(d, () => 'Riscos de altura a canivete, com nome e ano, de 1931 a 1979. O mais alto é recente: “LIA 94”, na altura exata dos seus olhos.', () => U.uma('l4_maoAltura', () => A.toast('[a Lia encosta a mão no risco e não diz nada]')));
    let agT = 0;
    tick(dt => {
      if (S.flags.l4_tamanho) return;
      if (U.dist(x - .4, z) < 1.1 && A.P.crouch && !S.hidden) { agT += dt; if (agT > 1.4) { S.flags.l4_tamanho = true; A.SFX.sussurros(1); U.depois(.5, () => A.sub('davi', '(do outro lado da parede, baixinho) ...você cresceu.')); U.depois(3, () => U.segredo('l4_tamanho', 'Agachada, os olhos dela ficam no risco do Davi')); } }
      else agT = 0;
    });
  }

  // ---------- TÚNEL NORTE: os nichos dos Inspetores — sete chapéus, sete apitos, e o oitavo já tem placa
  { const anos = [['1931', 'J.'], ['1938', 'O.'], ['1946', 'S.'], ['1951', 'B.'], ['1958', 'R.'], ['1966', 'T.'], ['1979', 'M.'], ['1994', 'L.']];
    const feltro = new THREE.MeshStandardMaterial({ color: 0x1a1612, roughness: .95 }), fundo = new THREE.MeshBasicMaterial({ color: 0x050403 });
    const zs = [];
    anos.forEach(([ano, ini], i) => {
      const z = -47.4 - i * .78, x = -1.9; zs.push(z);
      box(.02, .42, .5, fundo, x - .04, 1.32, z, A.W.grupo, false);
      box(.2, .03, .52, MAT.madeiraEsc, x + .08, 1.1, z, A.W.grupo, false);
      const pl = A.plano(.28, .08, new THREE.MeshStandardMaterial({ map: U.texto([{ t: `${ano} — ${ini}`, tam: 34, estilo: 'bold' }], { w: 256, h: 72, fundo: i === 7 ? '#b8b4a4' : '#6a6658', cor: '#1a1814', manchas: i === 7 ? 0 : 3 }), metalness: .4, roughness: .5 }), x + .19, 1.02, z, Math.PI / 2);
      if (i < 7) {
        const ch = new THREE.Group(); ch.position.set(x + .06, 1.13, z); ch.rotation.y = (Math.random() - .5) * .5; A.W.grupo.add(ch);
        cyl(.16, .16, .015, feltro, 0, 0, 0, 14, ch); cyl(.09, .1, .1, feltro, 0, .055, 0, 12, ch);
        const ap = cyl(.012, .012, .07, MAT.metal, .02, .02, .15, 6, ch); ap.rotation.x = Math.PI / 2;
      }
      U.rotulo(pl, i < 7 ? `Um nicho na pedra com um chapéu de feltro e um apito de metal. Na plaquinha: ${ano} — ${ini}` : 'Um nicho vazio e limpo, sem poeira. A plaquinha já está gravada: 1994 — L.', () => { if (i === 7) U.uma('l4_oitavoLido', () => U.depois(.8, () => U.fala('...L.'))); });
    });
    tick(() => {
      if (S.flags.l4_oitavo || !U.iluminado(-1.85, 1.2, zs[7], 4.5, .93)) return;
      S.flags.l4_oitavo = true; U.medo(25); A.SFX.estalo({ x: -1.9, z: zs[7] }, .25);
      A.toast('[a Lia fica muda]');
      U.depois(2.5, () => U.segredo('l4_oitavo', 'Sete Inspetores antes dele. O oitavo lugar é seu'));
    });
  }

  // ---------- TÚNEL OESTE: a prateleira dos sapatos (37 pares de criança e um de adulto)
  { const x0 = -9.4, x1 = -3.3, z = -19.8, y = .74, n = 38, passo = (x1 - x0) / (n - 1);
    box(x1 - x0 + .3, .05, .3, MAT.madeiraEsc, (x0 + x1) / 2, y - .025, z, A.W.grupo, false);
    for (const xx of [x0 - .1, (x0 + x1) / 2, x1 + .1]) box(.05, y, .05, MAT.madeiraEsc, xx, y / 2, z + .1, A.W.grupo, false);
    A.addCollider(x0 - .15, x1 + .15, -20, -19.64);
    const couro = new THREE.MeshStandardMaterial({ color: 0x3a2a1e, roughness: .8 }), lama = new THREE.MeshStandardMaterial({ color: 0x4a3a22, roughness: .4, metalness: .1, emissive: 0x0a0804 });
    const molhados = { 9: 'TOMÉ', 21: 'ANA', 33: 'DAVI' };
    const geo = new THREE.BoxGeometry(.05, .045, .12);
    const inst = new THREE.InstancedMesh(geo, couro, (n - 1 - 3) * 2); let k = 0; const m4 = new THREE.Matrix4();
    for (let i = 0; i < n - 1; i++) {
      const xx = x0 + i * passo;
      if (molhados[i]) {
        for (const s of [-1, 1]) box(.05, .045, .12, lama, xx + s * .032, y + .022, z + .02, A.W.grupo, false);
        const et = A.plano(.07, .03, new THREE.MeshStandardMaterial({ map: U.texto([{ t: molhados[i], tam: 30, estilo: 'bold' }], { w: 128, h: 48, fundo: '#c8bfa0', cor: '#2a2018', manchas: 1 }) }), xx, y + .03, z + .09, 0);
        U.rotulo(et, `Um par de sapatos molhados de lama, ainda pingando. Etiqueta: ${molhados[i]}.`);
      } else for (const s of [-1, 1]) { m4.makeTranslation(xx + s * .032, y + .022, z + .02); inst.setMatrixAt(k++, m4); }
    }
    inst.count = k; inst.instanceMatrix.needsUpdate = true; inst.frustumCulled = false; if (inst.computeBoundingSphere) inst.computeBoundingSphere(); A.W.grupo.add(inst);
    U.rotulo(inst, 'Trinta e sete pares de sapatos de criança enfileirados, cada um com etiqueta. Trinta e quatro secos de anos. Três molhados de lama.');
    // o lugar 38: botas de adulto, número 36, ainda quentes
    const bx = x0 + (n - 1) * passo, botas = new THREE.Group(); botas.position.set(bx, y, z + .02); A.W.grupo.add(botas);
    const cano = new THREE.MeshStandardMaterial({ color: 0x1e1a18, roughness: .6 });
    for (const s of [-1, 1]) { box(.07, .05, .2, cano, s * .045, .025, .02, botas, false); box(.065, .16, .08, cano, s * .045, .12, -.04, botas, false); }
    U.rotulo(botas, () => S.flags.l4_sapatos ? 'Botas de adulto, número 36, iguais às suas. Já frias.' : '<b>E</b>Tocar nas botas do lugar 38', () => {
      if (S.flags.l4_sapatos) return; S.flags.l4_sapatos = true; A.SFX.pegar(); S.inv.pilhas++;
      A.toast('Botas de adulto, número 36. Ainda quentes por dentro. Enfiada numa delas, uma pilha nova (R para trocar).');
      U.depois(1.6, () => U.fala('São as minhas. ...Eu tô de bota.'));
      U.depois(3.5, () => U.segredo('l4_sapatos', 'O lugar trinta e oito'));
    });
  }

  // ---------- TÚNEL OESTE: o sapato pela fresta de 1951 (puxe três vezes)
  { const sx = -11.62, sy = .57, sz = -19.86;
    const sap = new THREE.Group(); sap.position.set(sx, sy, sz); A.W.grupo.add(sap);
    const ms = new THREE.MeshStandardMaterial({ color: 0x2a1c14, roughness: .7 });
    box(.06, .055, .15, ms, 0, 0, .075, sap, false); box(.058, .03, .05, ms, 0, .035, .02, sap, false);
    if ((S.flags.l4cicero || 0) >= 3) sap.visible = false;
    let anim = 0, tipo = 0;
    const it = U.rotulo(sap, () => '<b>E</b>Puxar o sapato que sai da fresta', () => {
      const n = S.flags.l4cicero = (S.flags.l4cicero || 0) + 1;
      if (n < 3) {
        anim = 1; tipo = 1; legenda(A, 'l4Puxa', { x: sx, y: sy, z: sz }); A.SFX.estalo({ x: sx, z: sz }, .35); U.medo(10 + n * 5); A.P.shake = .08 + n * .06;
        A.toast(n === 1 ? '[uma mãozinha puxou o sapato de volta para dentro da parede]' : '[puxou de volta, com mais força]');
        if (n === 2) U.depois(1.4, () => U.fala('Tem alguém segurando do outro lado. Alguém pequeno.'));
      } else {
        anim = 1; tipo = 2; A.SFX.pegar();
        U.depois(.6, () => { A.SFX.sussurros(1.2); A.sub('voz', '(do outro lado dos tijolos, um menino, cansado) ...Cícero.'); });
        U.depois(3.4, () => A.toast('Dentro do sapato, riscado a prego: “CÍCERO — 1951 — fugitivo”. Ninguém escreveu esse nome em lugar nenhum.'));
        U.depois(6.5, () => U.segredo('l4_cicero', 'O quadragésimo primeiro fugitivo'));
      }
    }, { hold: .7 });
    it.pode = () => (S.flags.l4cicero || 0) < 3; it.ruido = 2;
    tick(dt => {
      if (anim <= 0) return; anim = Math.max(0, anim - dt * (tipo === 1 ? 1.6 : .8));
      if (tipo === 1) { const k = 1 - anim; sap.position.z = sz + (k < .4 ? k * .35 : Math.max(-.12, .14 - (k - .4) * .65)); if (anim <= 0) sap.position.z = sz; }
      else { const k = 1 - anim; sap.position.z = sz + k * .9; sap.position.y = sy - k * .2; if (anim <= 0) sap.visible = false; }
    });
  }

  // ---------- CÂMARA OESTE: o poço seco (jogue uma garrafa: ela volta)
  { const px = -30.5, pz = -15.6, pedra = A.texMat ? A.texMat('pedra', 1, .5) : MAT.metal;
    const anel = new THREE.Mesh(new THREE.CylinderGeometry(.62, .66, .85, 16, 1, true), pedra); anel.material.side = THREE.DoubleSide; anel.position.set(px, .425, pz); A.W.grupo.add(anel);
    const borda = new THREE.Mesh(new THREE.TorusGeometry(.64, .06, 6, 18), pedra); borda.rotation.x = Math.PI / 2; borda.position.set(px, .86, pz); A.W.grupo.add(borda);
    const fundo = A.plano(1.15, 1.15, new THREE.MeshBasicMaterial({ color: 0x020202 }), px, .45, pz, 0); fundo.rotation.x = -Math.PI / 2;
    A.addCollider(px - .66, px + .66, pz - .66, pz + .66);
    U.rotulo(anel, () => S.flags.l4_poco ? 'O poço seco. Lá do fundo, às vezes, alguém conta.' : 'Um poço de pedra no meio da câmara, seco. A lanterna não alcança o fundo.', () => U.uma('l4_pocoOlhou', () => U.depois(.8, () => U.fala('Sem fundo... se eu jogar alguma coisa aí, nem vou ouvir cair.'))));
    ALVOS.push({ grupo: A.W.grupo, x: px, z: pz, r: 1.0, f: () => {
      const pos = { x: px, y: .3, z: pz };
      if (S.flags.l4_poco) { U.depois(2.5, () => { som.risada(pos, .08); legenda(A, 'l4Riso', pos); }); return true; } // a segunda garrafa ela guarda
      S.flags.l4_poco = true;
      U.depois(1.4, () => { legenda(A, 'l4Conta', pos); A.sub('ana', '(lá no fundo, baixinho) ...um... dois... três...'); });
      U.depois(4.4, () => A.sub('ana', '(lá no fundo) ...quatro... cinco... seis...'));
      U.depois(7.4, () => A.sub('ana', '(lá no fundo, mais perto) ...sete... oito...'));
      U.depois(9.6, () => {
        A.sub('ana', '(na borda do poço) ...nove.');
        const g = A.MK.garrafa(); g.rotation.z = Math.PI / 2; g.position.set(px, .9, pz); A.W.grupo.add(g);
        som.rolar({ x: px, y: .2, z: pz }, 1.6); legenda(A, 'l4Rola', { x: px, y: .2, z: pz });
        let t = 0; const ini = { x: px, z: pz };
        tick(dt => {
          if (!g.parent) return; t += dt; const k = Math.min(1, t / 1.6), P = A.P;
          g.position.set(ini.x + (P.pos.x - ini.x) * k * .9, Math.max(.05, .9 - k * 3), ini.z + (P.pos.z - ini.z) * k * .9); g.rotation.x += dt * 10;
          if (k >= 1) { A.W.grupo.remove(g); S.inv.garrafas++; A.toast('A garrafa voltou rolando até o seu pé. Inteira, seca, com um bilhete enrolado no gargalo.'); U.depois(1.2, () => { if (U.noMapa('tuneis')) A.lerNota('l4_poco'); }); U.depois(2, () => U.segredo('l4_poco', 'Ela devolveu a garrafa')); }
        });
      });
      return true;
    } });
  }

  // ---------- CISTERNA: o canário na gaiola (canta com ele longe, cala com ele perto)
  { const cx = 4.8, cy = 2.35, cz = -39.4, solto = () => !!S.flags.l4canario;
    cyl(.008, .008, 3.4 - cy - .2, MAT.ferrugem, cx, (3.4 + cy + .2) / 2, cz, 4);
    const gai = new THREE.Group(); gai.position.set(cx, cy, cz); A.W.grupo.add(gai);
    const arame = new THREE.MeshStandardMaterial({ color: 0x8a7a50, metalness: .6, roughness: .4 });
    cyl(.17, .17, .02, arame, 0, -.18, 0, 14, gai);
    const topo = new THREE.Mesh(new THREE.ConeGeometry(.18, .14, 14, 1, true), arame); topo.position.y = .25; gai.add(topo);
    for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; cyl(.004, .004, .38, arame, Math.cos(a) * .17, 0, Math.sin(a) * .17, 4, gai); }
    const portinha = new THREE.Group(); portinha.position.set(.17, -.06, 0); gai.add(portinha);
    for (let i = 0; i < 3; i++) cyl(.004, .004, .2, arame, 0, 0, -.05 + i * .05, 4, portinha);
    const ave = new THREE.Group(); ave.position.set(0, -.08, 0); gai.add(ave);
    const amarelo = new THREE.MeshStandardMaterial({ color: 0xe8c840, roughness: .6, emissive: 0x2a2004, emissiveIntensity: .5 });
    const corpo = new THREE.Mesh(new THREE.SphereGeometry(.04, 8, 6), amarelo); corpo.scale.set(1, .9, 1.4); ave.add(corpo);
    const cab = new THREE.Mesh(new THREE.SphereGeometry(.026, 8, 6), amarelo); cab.position.set(0, .035, .04); ave.add(cab);
    const bico = new THREE.Mesh(new THREE.ConeGeometry(.008, .02, 5), new THREE.MeshStandardMaterial({ color: 0xd88a30 })); bico.rotation.x = Math.PI / 2; bico.position.set(0, .033, .07); ave.add(bico);
    box(.03, .006, .05, amarelo, 0, -.005, -.07, ave, false);
    if (solto()) { ave.visible = false; portinha.rotation.y = 1.4; }
    let cantoT = 2, calado = false, voo = null;
    const it = U.rotulo(gai, () => solto() ? 'A gaiola vazia, com a portinha aberta.' : '<b>E</b>Abrir a portinhola da gaiola (segure)', () => {
      if (solto()) return; S.flags.l4canario = true; portinha.rotation.y = 1.4; voo = { t: 0 }; som.piado({ x: cx, y: cy, z: cz }, .08);
      U.depois(1.2, () => U.fala('Vai. Pelo menos um de nós sai daqui.'));
    }, { hold: 1 });
    it.pode = () => !solto(); it.ruido = 2;
    tick((dt, t) => {
      if (voo) { voo.t += dt; const k = Math.min(1, voo.t / 2.2); ave.position.set(.17 + k * 1.5, -.08 + k * 1.2 + Math.sin(voo.t * 30) * .02, -k * 3); if (k >= 1) { ave.visible = false; voo = null; } return; }
      if (solto() || !ave.visible) return;
      ave.rotation.y = Math.sin(t * .7) * .8; ave.position.y = -.08 + (Math.sin(t * 5) > .9 ? .01 : 0);
      const M = A.M, perto = M.ativo && Math.hypot(M.pos.x - cx, M.pos.z - cz) < 15;
      if (perto && !calado) { calado = true; if (U.dist(cx, cz) < 22) legenda(A, 'l4Cala', { x: cx, y: cy, z: cz }); }
      if (!perto) { calado = false; cantoT -= dt; if (cantoT <= 0) { cantoT = 1.6 + Math.random() * 3; if (U.dist(cx, cz) < 24) { som.piado({ x: cx, y: cy, z: cz }); legenda(A, 'l4Canta', { x: cx, y: cy, z: cz }); } } }
      if (!S.flags.l4canarioViu && U.iluminado(cx, cy, cz, 7, .93)) { S.flags.l4canarioViu = true; U.depois(.6, () => U.fala(calado ? 'Um canário... e ele parou de cantar. Por quê?' : 'Um canário. Vivo, aqui embaixo. Cantando.')); U.depois(4, () => { if (U.noMapa('tuneis') && !S.flags.l4canarioDica) { S.flags.l4canarioDica = true; U.fala('Minero levava canário pra mina. Quando ele cala, é porque vem coisa ruim.'); } }); }
    });
  }

  // ---------- CISTERNA: chamar o irmão (V, parada na cisterna) — o eco volta, e na quarta vez responde
  { let ultimaV = -9;
    TECLAS.KeyV = () => {
      const P = A.P; if (A.W.mapa !== 'tuneis' || !P.room || P.room.id !== 'hub' || S.hidden || (ctx.sub && ctx.sub.on)) return;
      if (A.perf() - ultimaV < 4.5) return; ultimaV = A.perf();
      const n = S.flags.l4eco = (S.flags.l4eco || 0) + 1;
      if (n > 4) return;
      U.fala('(baixinho, para dentro da cisterna) ...Davi?'); A.emitNoise(P.pos.x, P.pos.z, 3, true);
      const longe = { x: -P.pos.x * .6, y: 1.6, z: -36 + (-36 - P.pos.z) * .6 };
      if (n < 4) { [[1.2, .1], [2.1, .06], [2.9, .035]].forEach(([s, v], i) => U.depois(s, () => { som.eco(longe, v); if (i === 0) legenda(A, 'l4Eco', longe); })); if (n === 3) U.depois(4, () => U.fala('O eco tá demorando cada vez mais pra voltar...')); }
      else U.depois(2.6, () => {
        som.eco(longe, .4, true); legenda(A, 'l4EcoForte', longe); A.emitNoise(0, -36, 28); U.medo(22); A.P.shake = .12;
        A.sub('davi', '(o eco, mais alto que a sua voz) LIA. AQUI NÃO. ELE TÁ OUVINDO.');
        U.depois(3.2, () => U.segredo('l4_eco', 'O eco respondeu'));
      });
    };
  }

  // ---------- CÂMARA LESTE: o tijolo do canivete (agachada)
  { const tx = 29.6, ty = .72, tz = -12.13;
    const tijolo = U.decal(U.tex(128, 64, g => { g.fillStyle = '#7a3a2a'; g.fillRect(2, 2, 124, 60); g.strokeStyle = 'rgba(230,224,206,.85)'; g.lineWidth = 4; g.beginPath(); g.moveTo(48, 14); g.lineTo(48, 50); g.quadraticCurveTo(84, 48, 82, 32); g.quadraticCurveTo(82, 14, 48, 14); g.stroke(); }), .3, .15, tx, ty, tz, Math.PI, { mat: { transparent: false } });
    const buraco = A.plano(.3, .15, new THREE.MeshBasicMaterial({ color: 0x050403 }), tx, ty, tz - .005, Math.PI); buraco.visible = !!S.flags.l4canivete; tijolo.visible = !S.flags.l4canivete;
    const it = U.rotulo(tijolo, () => A.P.crouch ? '<b>E</b>Puxar o tijolo marcado com “D”' : 'Um tijolo baixo, com um “D” riscado. Agache (C) para alcançar.', () => {
      if (S.flags.l4canivete || !A.P.crouch) return; S.flags.l4canivete = true; tijolo.visible = false; buraco.visible = true; A.SFX.pegar(); A.emitNoise(tx, tz, 3);
      A.toast('Atrás do tijolo, enrolado num pano: um canivete de cabo vermelho, com “D.M.” gravado.');
      U.depois(1.8, () => U.fala('O canivete do Davi. Ele dizia que era pra cortar linha de pipa. Nunca soltou pipa nenhuma aqui.'));
    }, { hold: .8 });
    it.pode = () => !S.flags.l4canivete && A.P.crouch; it.ruido = 2;
  }

  // ---------- TÚNEL LESTE: arranhões na parede — fique parada no escuro e o nono se completa
  { const ax = 21.1, az = -19.87;
    const desenha = completo => U.tex(256, 256, g => { g.strokeStyle = 'rgba(226,220,204,.8)'; g.lineCap = 'round'; for (let i = 0; i < 9; i++) { const x = 26 + i * 25; g.lineWidth = 3 + Math.random(); g.beginPath(); g.moveTo(x, 40); g.lineTo(x + 6, i === 8 && !completo ? 120 : 220); g.stroke(); } });
    const d = U.decal(desenha(!!S.flags.l4unha), .5, .5, ax, 1.2, az, 0);
    U.rotulo(d, () => S.flags.l4unha ? 'Nove arranhões fundos na pedra, em fila. O nono agora está inteiro.' : 'Arranhões de unha na pedra, em fila: oito fundos e o nono pela metade.');
    let paradaT = 0; const ult = new THREE.Vector3().copy(A.P.pos);
    tick(dt => {
      if (S.flags.l4unha) return;
      const P = A.P, mov = Math.hypot(P.pos.x - ult.x, P.pos.z - ult.z); ult.copy(P.pos);
      if (U.dist(ax, az + .8) < 2.6 && !S.flashOn && mov < .002) { paradaT += dt; if (paradaT > 5) { S.flags.l4unha = true; d.material.map.dispose(); d.material.map = desenha(true); d.material.needsUpdate = true; som.unha({ x: ax, y: 1.2, z: az }, 1.6); legenda(A, 'l4Unha', { x: ax, y: 1.2, z: az }); U.medo(14); A.P.shake = .05; U.depois(2.2, () => U.fala('(num fio de voz) ...nove.')); } }
      else paradaT = 0;
    });
  }

  // ---------- TÚNEL LESTE: o rato branco (só anda com ela agachada; leva a um buraco na parede)
  { const WP = [[4.5, -17.4], [9, -18.6], [13.5, -17.2], [20.2, -18.5], [23.6, -19.6]];
    const hx = 23.6, hy = .66, hz = -19.87;
    const tampa = U.decal(U.tex(64, 32, g => { g.fillStyle = '#7a3a2a'; g.fillRect(1, 1, 62, 30); }), .3, .15, hx, hy, hz, 0, { mat: { transparent: false } });
    const buraco = A.plano(.3, .15, new THREE.MeshBasicMaterial({ color: 0x030202 }), hx, hy, hz - .005, 0);
    const feito = () => !!S.flags.l4_rato, entrou = () => !!S.flags.l4ratoEntrou;
    tampa.visible = !entrou(); buraco.visible = entrou();
    const rato = new THREE.Group(); A.W.grupo.add(rato);
    const branco = new THREE.MeshStandardMaterial({ color: 0xe8e4dc, roughness: .9, emissive: 0x141210 });
    const c = new THREE.Mesh(new THREE.SphereGeometry(.05, 8, 6), branco); c.scale.set(1, .75, 1.9); rato.add(c);
    const ca = new THREE.Mesh(new THREE.SphereGeometry(.03, 8, 6), branco); ca.position.set(0, .015, .09); ca.scale.z = 1.3; rato.add(ca);
    for (const s of [-1, 1]) { const o = new THREE.Mesh(new THREE.SphereGeometry(.012, 5, 4), new THREE.MeshStandardMaterial({ color: 0xe8a0a0 })); o.position.set(s * .02, .045, .08); rato.add(o); const ol = new THREE.Mesh(new THREE.SphereGeometry(.005, 4, 3), new THREE.MeshBasicMaterial({ color: 0xc02020 })); ol.position.set(s * .015, .025, .12); rato.add(ol); }
    const rabo = cyl(.004, .008, .16, new THREE.MeshStandardMaterial({ color: 0xd8a8a0 }), 0, 0, -.16, 4, rato); rabo.rotation.x = Math.PI / 2;
    let i = 0, alvo = null, luzT = 0, passoT = 0, viu = false, avisouPe = false, avisouLuz = false;
    rato.position.set(WP[0][0], .05, WP[0][1]); rato.visible = S.chapter === 4 && !entrou();
    U.rotulo(rato, 'Um rato branco, de olhos vermelhos. Ele para e olha para você.');
    U.rotulo(buraco, () => feito() ? 'O buraco onde o rato branco mora. Vazio agora.' : '<b>E</b>Enfiar a mão no buraco onde o rato entrou', () => {
      if (feito()) return; S.flags.l4_rato = true; A.SFX.pegar(); S.inv.pilhas++;
      A.toast('Lá dentro, uma gaiolinha de arame vazia, um papel dobrado e uma pilha, guardada como tesouro (R para trocar).');
      U.depois(1.4, () => { if (U.noMapa('tuneis')) A.lerNota('l4_pipoca'); });
      U.depois(2.4, () => U.segredo('l4_rato', 'O Pipoca te levou até a casa dele'));
    });
    tick((dt, t) => {
      if (!rato.visible) return;
      const P = A.P, rp = rato.position, n = nivel();
      rp.y = Math.max(.04, n - .02);
      const d = U.dist(rp.x, rp.z);
      if (!viu && d < 9 && U.iluminado(rp.x, rp.y, rp.z, 9, .93)) { viu = true; U.depois(.5, () => U.fala('Um rato branco. Branco, aqui embaixo?')); }
      if (alvo) {
        const dx = alvo[0] - rp.x, dz = alvo[1] - rp.z, l = Math.hypot(dx, dz), v = 2.3 * dt;
        rato.rotation.y = Math.atan2(dx, dz);
        if (l <= v) { rp.x = alvo[0]; rp.z = alvo[1]; i = WP.findIndex(w => w === alvo); alvo = null; if (i === WP.length - 1) { rato.visible = false; S.flags.l4ratoEntrou = true; tampa.visible = false; buraco.visible = true; A.SFX.estalo({ x: hx, z: hz }, .2); U.depois(.8, () => U.fala('Ele empurrou o tijolo e entrou na parede. Tem um buraco ali.')); } }
        else { rp.x += dx / l * v; rp.z += dz / l * v; passoT -= dt; if (passoT <= 0) { passoT = .14; som.patinha({ x: rp.x, y: .1, z: rp.z }); if (O && n > .08 && Math.random() < .4) O.criar(rp.x, n, rp.z, .25, .1, 1); } legenda(A, 'l4Patinhas', rp); }
        return;
      }
      rabo.rotation.z = Math.sin(t * 4) * .3;
      if (d < 6) rato.rotation.y = Math.atan2(P.pos.x - rp.x, P.pos.z - rp.z);
      const naLuz = S.flashOn && A.flash.intensity > 1.2 && d < 7 && U.olhando(rp.x, rp.y, rp.z, .95, 7);
      if (naLuz) { luzT += dt; if (luzT > 1.6 && i > 0) { luzT = 0; alvo = WP[i - 1]; som.piado(rp, .03); if (!avisouLuz) { avisouLuz = true; U.depois(.4, () => U.fala('Assustei ele com a luz. Correu pro lado errado.')); } return; } }
      else luzT = Math.max(0, luzT - dt);
      if (d < 4.5 && i < WP.length - 1) {
        if (P.crouch && !P.sprinting && !naLuz) alvo = WP[i + 1];
        else if (!P.crouch && !avisouPe && d < 3.5) { avisouPe = true; U.depois(.4, () => U.fala('Ele congelou. Tá me encarando... em pé eu assusto ele.')); }
      }
    });
  }

  // ---------- CISTERNA: a válvula de emergência do pedreiro, deitada no fundo (agachada, com luz em cima)
  { const vx = -2.3, vz = -40.3, emerg = new THREE.Group(); emerg.position.set(vx, .1, vz); A.W.grupo.add(emerg);
    const roda = new THREE.Group(); emerg.add(roda);
    const tor = new THREE.Mesh(new THREE.TorusGeometry(.24, .035, 6, 16), MAT.ferrugem); tor.rotation.x = Math.PI / 2; roda.add(tor);
    for (let k = 0; k < 3; k++) { const r = box(.48, .025, .025, MAT.ferrugem, 0, 0, 0, roda, false); r.rotation.y = k * Math.PI / 3; }
    cyl(.06, .06, .12, MAT.ferrugem, 0, -.05, 0, 8, emerg);
    const pode = () => !S.flags.aguaBaixa;
    const it = U.rotulo(emerg, () => S.flags.aguaBaixa ? 'O volante de emergência do pedreiro, no fundo seco.' : '<b>E</b>Girar o volante afundado (segure; esvazia tudo de uma vez, mas os canos roncam)', () => {
      if (S.flags.aguaBaixa) return;
      S.valv = S.ordem.slice(); S.flags.aguaBaixa = true; S.flags.l4emerg = true;
      A.objDone('valvulas'); A.progresso();
      som.ronco(4.5, .55); legenda(A, 'l4Ronco'); A.SFX.cano(null); A.P.shake = .3;
      const P = A.P, M = A.M; A.emitNoise(P.pos.x, P.pos.z, 60);
      if (!M.ativo) A.ativarInspetor(0, -18, 'caca'); else { M.state = 'caca'; M.path = []; M.wait = 0; }
      M.cool = 1.2; A.planejar(M, P.pos.x, P.pos.z);
      A.toast('Os canos roncam pelo túnel inteiro e a água despenca pelos ralos. E ele sabe exatamente onde você está.');
      U.depois(2, () => U.fala('Esvaziou tudo... e berrou pra ele também. Corre!'));
      U.depois(4, () => U.segredo('l4_emergencia', 'A válvula que o pedreiro escondeu'));
    }, { hold: 3, guarda: true });
    it.pode = pode; it.ruido = 8; it.som = 'forcar';
    tick(dt => {
      const P = A.P;
      const ver = S.flags.aguaBaixa || (P.crouch && S.flashOn && A.flash.intensity > 1.2 && U.dist(vx, vz) < 3.4 && U.olhando(vx, .1, vz, .9, 3.6));
      emerg.visible = !!ver; emerg.position.y = S.flags.aguaBaixa ? .06 : .1;
      if (U.segurando(it)) roda.rotation.y -= dt * 2.2;
      if (ver && !S.flags.aguaBaixa) U.uma('l4emergViu', () => U.depois(.4, () => U.fala('Tem uma roda no fundo... deitada. Uma quarta válvula.')));
    });
  }

  // ---------- VÁLVULAS: um toque rápido faz o cano cantar a nota dela (a mais grave vem primeiro)
  { const tons = [130.81, 164.81, 196];
    let errou = false, viuJato = false, baixou = !!S.flags.aguaBaixa;
    for (const V of ctx.valvIts || []) {
      V.l4 = { segurando: false, pico: 0 };
      const lb = V.it.label; V.it.label = () => { const s = lb(); return !S.flags.aguaBaixa && !S.valv.includes(V.n) ? s + '<small style="opacity:.6"> · toque rápido: ouvir o cano</small>' : s; };
    }
    tick(() => {
      const t = A.perf();
      if (ctx.jato && ctx.jato.visible && !viuJato) { viuJato = true; errou = true; }
      if (ctx.jato && !ctx.jato.visible) viuJato = false;
      for (const V of ctx.valvIts || []) {
        const seg = t - (V.it.seguradoT ?? -9) < .1, L = V.l4;
        if (seg) { if (!L.segurando) { L.segurando = true; L.pico = 0; L.ini = V.it.progresso || 0; } L.pico = Math.max(L.pico, (V.it.progresso || 0) - L.ini); }
        else if (L.segurando) {
          L.segurando = false;
          if (L.pico < .5 && !S.valv.includes(V.n) && !S.flags.aguaBaixa) {
            const f = tons[Math.max(0, S.ordem.indexOf(V.n))];
            if (som && A.audio && A.audio.AC && !window.__teste) { const au = A.audio, t0 = au.AC.currentTime, g = au.saida({ x: V.pos.x, y: 1.3, z: V.pos.z }, .9); au.osc('triangle', f, t0, 1.4, g); au.env(g, t0, .03, .12, 1.2); }
            legenda(A, 'l4Nota', V.pos); A.emitNoise(V.pos.x, V.pos.z, 3);
            const tq = S.flags.l4toques || (S.flags.l4toques = {}); tq[V.n] = true;
            U.uma('l4notaDica', () => A.toast('O cano respondeu com uma nota, baixinho. Cada válvula canta a sua: uma mais grave, outra mais aguda.'));
          }
        }
      }
      if (S.flags.aguaBaixa && !baixou) {
        baixou = true;
        if (!S.flags.l4emerg && !errou && Object.keys(S.flags.l4toques || {}).length >= 3) U.depois(3, () => U.segredo('l4_afinada', 'Grave, médio, agudo: você ouviu a ordem'));
      }
    });
  }

  // ---------- TÚNEL NORTE: a grade baixa e a cabana de lençóis (sala segura, uma vez por noite)
  { const sala = A.SALA ? A.SALA('cabana') : null, usada = () => !!S.flags.l4cabanaUsada;
    if (sala && usada()) sala.seguro = false;
    // a grade baixa na parede leste do túnel norte
    const grade = new THREE.Group(); grade.position.set(CAB.bx - .04, 0, CAB.bz - CAB.larg / 2); A.W.grupo.add(grade);
    for (let k = 0; k < 6; k++) cyl(.015, .015, CAB.alto, MAT.ferrugem, 0, CAB.alto / 2, .08 + k * .17, 6, grade);
    for (const y of [.08, CAB.alto - .06]) box(.03, .04, CAB.larg, MAT.ferrugem, 0, y, CAB.larg / 2, grade, false);
    const colG = A.addCollider(CAB.bx - .25, CAB.bx + .25, CAB.bz - CAB.larg / 2, CAB.bz + CAB.larg / 2); colG.on = !S.flags.l4grade;
    if (S.flags.l4grade) grade.rotation.y = -1.45;
    const colPe = A.addCollider(CAB.bx - .25, CAB.bx + .25, CAB.bz - CAB.larg / 2, CAB.bz + CAB.larg / 2); colPe.on = false;
    const itG = U.rotulo(grade, () => S.flags.l4grade ? 'A grade baixa, aberta. Lá dentro, cheiro de pano velho.' : A.P.crouch ? '<b>E</b>Soltar a grade baixa (agachada)' : 'Uma grade baixa e frouxa na parede. Do outro lado, cheiro de pano velho. Agache (C) para mexer.', () => {
      if (S.flags.l4grade || !A.P.crouch) return; S.flags.l4grade = true; colG.on = false; A.SFX.metal(.35); A.emitNoise(CAB.bx, CAB.bz, 4);
      let k = 0; tick(dt => { if (k >= 1) return; k = Math.min(1, k + dt * 1.5); grade.rotation.y = -1.45 * k; });
    }, { hold: 1.2 });
    itG.pode = () => !S.flags.l4grade && A.P.crouch; itG.ruido = 3;
    // a cabana: dois cabos de vassoura, um lençol por cima, lanterna de pilha velha, figurinhas e um gibi
    const cx = (CAB.x0 + CAB.x1) / 2, cz = (CAB.z0 + CAB.z1) / 2;
    for (const [dx, dz] of [[-.8, -1], [.8, -1], [-.8, 1], [.8, 1]]) cyl(.015, .015, 1.05, MAT.madeira, cx + dx * .9, .52, cz + dz * 1.1, 5);
    const lencolG = new THREE.PlaneGeometry(1.9, 2.6, 8, 8); { const p = lencolG.attributes.position; for (let k = 0; k < p.count; k++) { const x = p.getX(k), y = p.getY(k); p.setZ(k, -Math.pow(Math.abs(x) / .95, 2) * .35 + Math.sin(y * 4) * .03); } lencolG.computeVertexNormals(); }
    const lencol = new THREE.Mesh(lencolG, new THREE.MeshStandardMaterial({ color: 0xc8c0b0, roughness: 1, side: THREE.DoubleSide, map: U.tex(128, 128, g => { g.fillStyle = '#c8c0b0'; g.fillRect(0, 0, 128, 128); g.strokeStyle = 'rgba(120,140,170,.5)'; g.lineWidth = 3; for (let k = 0; k < 128; k += 16) { g.beginPath(); g.moveTo(k, 0); g.lineTo(k, 128); g.stroke(); g.beginPath(); g.moveTo(0, k); g.lineTo(128, k); g.stroke(); } }) }));
    lencol.rotation.x = -Math.PI / 2; lencol.position.set(cx, 1.08, cz); A.W.grupo.add(lencol);
    if (usada()) { lencol.position.y = .05; lencol.rotation.z = .3; }
    box(1.4, .06, 2, new THREE.MeshStandardMaterial({ color: 0x5a3a2a, roughness: 1 }), cx, .03, cz, A.W.grupo, false);
    const lamp = new THREE.Group(); lamp.position.set(cx + .5, .06, cz - .7); A.W.grupo.add(lamp);
    cyl(.04, .04, .14, new THREE.MeshStandardMaterial({ color: 0x2a4a7a }), 0, .07, 0, 8, lamp);
    const vidro = new THREE.Mesh(new THREE.SphereGeometry(.035, 8, 6), new THREE.MeshBasicMaterial({ color: 0xffc070 })); vidro.position.y = .16; lamp.add(vidro);
    const luzC = new THREE.PointLight(0xffb060, .7, 3, 2); luzC.position.y = .3; lamp.add(luzC);
    for (let k = 0; k < 7; k++) { const f = A.plano(.07, .09, new THREE.MeshStandardMaterial({ color: [0xc04030, 0x3060a0, 0xd0b030, 0x40a050][k % 4], roughness: .6, metalness: k === 3 ? .8 : 0 }), cx - .4 + Math.random() * .7, .065, cz + Math.random() * .8 - .2, 0); f.rotation.x = -Math.PI / 2; f.rotation.z = Math.random() * 6; }
    const caixa = box(.12, .07, .09, MAT.madeira, cx - .45, .095, cz - .75, A.W.grupo, false);
    U.rotulo(caixa, 'Uma caixinha de música de madeira, dando corda sozinha.');
    // parede de dentro: nomes de quem se escondeu, pauzinhos de noites e o último nome
    const nomesT = U.tex(512, 256, g => {
      g.font = '22px "Special Elite",monospace'; g.textAlign = 'left';
      [['ZÉ 66', 6], ['CÉLIA 71', 11], ['BENÉ 75', 23], ['TOMÉ', 31], ['ANA', 28], ['DAVI', 40]].forEach(([n, q], i) => { const y = 32 + i * 32; g.fillStyle = 'rgba(220,212,192,.7)'; g.fillText(n, 14, y); g.strokeStyle = 'rgba(220,212,192,.6)'; g.lineWidth = 1.4; for (let k = 0; k < q; k++) { const x = 150 + (k % 25) * 13 + Math.floor(k / 5) * 4; g.beginPath(); g.moveTo(x, y - 16 + Math.floor(k / 25) * 9); g.lineTo(x + 1, y - 4 + Math.floor(k / 25) * 9); g.stroke(); } });
      g.save(); g.translate(250, 238); g.rotate(-.04); g.font = 'bold 24px "Special Elite",monospace'; g.fillStyle = 'rgba(250,246,234,.92)'; g.fillText('LIA — pra quando ela vier', -170, 0); g.restore();
    });
    const pn = U.decal(nomesT, 1.6, .8, CAB.x1 - .13, .62, cz, -Math.PI / 2);
    U.rotulo(pn, '<b>E</b>Ler os nomes riscados por dentro da cabana', () => {
      A.toast('Nomes de quem se escondeu aqui, cada um com pauzinhos contando as noites: ZÉ 66, CÉLIA 71, BENÉ 75, TOMÉ, ANA, DAVI. Embaixo, com a letra do Davi: “LIA — pra quando ela vier”.');
      if (U.uma('l4cantiga')) U.depois(2.2, () => U.fala('Ele guardou lugar pra mim. ...Essa música mudou. É a que a Irmã Celeste cantava.'));
    });
    // o mapa do tesouro dos três (o X fica no cemitério, entre duas árvores secas)
    const mapaT = U.tex(256, 256, g => {
      g.fillStyle = '#d6caa6'; g.fillRect(4, 4, 248, 248); g.strokeStyle = '#3a2a1a'; g.fillStyle = '#3a2a1a'; g.lineWidth = 3;
      g.strokeRect(96, 18, 64, 48); g.font = '15px "Special Elite",monospace'; g.textAlign = 'center'; g.fillText('CAPELA', 128, 46);
      for (let k = 0; k < 14; k++) { const x = 40 + (k % 5) * 30, y = 100 + Math.floor(k / 5) * 34; g.beginPath(); g.moveTo(x, y); g.lineTo(x, y - 12); g.moveTo(x - 5, y - 8); g.lineTo(x + 5, y - 8); g.stroke(); }
      for (const y of [92, 168]) { g.beginPath(); g.moveTo(220, y); g.lineTo(220, y - 34); g.moveTo(220, y - 22); g.lineTo(206, y - 34); g.moveTo(220, y - 26); g.lineTo(234, y - 38); g.stroke(); }
      g.strokeStyle = '#8a1a14'; g.lineWidth = 5; g.beginPath(); g.moveTo(210, 116); g.lineTo(230, 136); g.moveTo(230, 116); g.lineTo(210, 136); g.stroke();
      g.fillStyle = '#3a2a1a'; g.font = 'bold 18px "Special Elite",monospace'; g.fillText('TESOURO', 128, 226); g.font = '13px "Special Elite",monospace'; g.fillText('D.  T.  A.', 200, 246);
      g.fillRect(200, 190, 40, 24); g.fillStyle = '#d6caa6'; g.fillText('galpão', 220, 206);
    });
    const mp = U.decal(mapaT, .55, .55, cx + .3, .7, CAB.z0 + .13, 0);
    U.rotulo(mp, 'Um mapa de tesouro a lápis: o cemitério, a capela, duas árvores secas perto do galpão e um X vermelho bem no meio delas. Assinado: D. T. A.', () => U.uma('l4mapaTesouro', () => U.depois(1, () => U.fala('O tesouro deles... tá enterrado lá em cima. Entre duas árvores secas, do lado do galpão.'))));
    // vida da cabana
    let dentroT = 0, musT = 0, farejou = false, avisouSaida = false;
    tick((dt, t) => {
      const P = A.P, dentro = !!(P.room && P.room.id === 'cabana'), M = A.M;
      luzC.intensity = .55 + Math.sin(t * 6) * .05 + Math.sin(t * 13) * .03;
      // só se passa agachada pela grade (em pé ela bate a cabeça), e lá dentro o teto é baixo
      colPe.on = !!S.flags.l4grade && !P.crouch && !dentro && U.dist(CAB.bx, CAB.bz) < 2.2;
      if (dentro) {
        P.crouch = true; dentroT += dt;
        if (dentroT < dt * 1.5) { U.uma('l4cabanaVista', () => { U.depois(.6, () => U.fala('Uma cabana de lençol. Eles se escondiam aqui... É quente aqui dentro.')); U.depois(3, () => U.segredo('l4_cabana', 'O esconderijo dos três')); }); }
        if (!usada()) {
          S.fear = Math.max(0, S.fear - 22 * dt);
          musT -= dt; if (musT <= 0) { musT = som.caixinha({ x: cx - .45, y: .1, z: cz - .75 }, S.flags.l4cantiga ? MEL_CANTIGA : MEL_CAIXA, .04, .42) + 2.5; legenda(A, 'l4Caixinha', { x: cx - .45, y: .1, z: cz - .75 }); }
          if (M.ativo && !farejou && Math.hypot(M.pos.x - CAB.bx + .6, M.pos.z - CAB.bz) < 3.2 && !S.flags.sino) {
            farejou = true; M.wait = Math.max(M.wait || 0, 3); M.path = []; legenda(A, 'l4Fareja', { x: CAB.bx - .5, y: 1.2, z: CAB.bz });
            A.sub('inspetor', '(do lado de fora da grade, farejando o ar) ...pano. Só pano velho.');
            U.depois(3.2, () => { if (A.M.ativo && A.M.state !== 'caca') A.planejar(A.M, 0, -30); });
          }
        }
      } else if (dentroT > 0) {
        // saiu: os lençóis caem e a cabana não esconde mais ninguém nesta noite
        if (dentroT > 4 && !usada()) { S.flags.l4cabanaUsada = true; if (sala) sala.seguro = false; let k = 0; tick(d2 => { if (k >= 1) return; k = Math.min(1, k + d2 * 1.4); lencol.position.y = 1.08 - k * 1.03; lencol.rotation.z = k * .3; }); A.SFX.estalo({ x: cx, z: cz }, .15); if (!avisouSaida) { avisouSaida = true; A.toast('Os lençóis caíram quando você saiu. A cabana não esconde mais ninguém esta noite.'); } }
        dentroT = 0; farejou = false; musT = 0;
      }
      if (M.ativo && farejou && Math.hypot(M.pos.x - CAB.bx, M.pos.z - CAB.bz) > 7) farejou = false;
    });
    if (!S.flags.l4cabanaDica) tick(() => { if (!S.flags.l4cabanaDica && S.flags.l4grade && U.dist(cx, cz) < 2.4) { S.flags.l4cabanaDica = true; A.toast('Aqui dentro ele não te pega. Mas só desta vez: ao sair, os lençóis caem.'); } });
  }

  return juntar(def, X);
}

// =====================================================================
// CEMITÉRIO E CAPELA (Capítulo V)
// =====================================================================
function arvoreSeca(A, x, z, h) {
  const { THREE, MAT } = A, g = new THREE.Group(); g.position.set(x, 0, z); A.W.grupo.add(g);
  const m = MAT.madeiraEsc;
  A.cyl(.1, .2, h, m, 0, h / 2, 0, 6, g);
  for (const [a, y, l, inc] of [[.4, h * .55, 1.6, .9], [2.6, h * .7, 1.3, .8], [4.4, h * .82, 1.1, .7], [1.5, h * .9, .9, .6]]) { const b = A.cyl(.03, .06, l, m, Math.cos(a) * l * .35, y, Math.sin(a) * l * .35, 5, g); b.rotation.z = Math.cos(a) * inc; b.rotation.x = -Math.sin(a) * inc; }
  A.addCollider(x - .22, x + .22, z - .22, z + .22);
  return g;
}

export function cemiterio(A, S, def, ctx = {}) {
  const U = base(A, S), som = sonsS(A), { THREE } = U, { MAT, box, cyl } = A;
  const X = {}, tick = f => U.ticks.push(f), FX = ctx.FX;
  legendas(A); ligarTeclas(); ligarGarrafa(A);
  for (let i = ALVOS.length - 1; i >= 0; i--) if (ALVOS[i].grupo !== A.W.grupo) ALVOS.splice(i, 1);
  for (const k of Object.keys(TECLAS)) delete TECLAS[k];
  const nome = nomeJogador(), hoje = dataHoje();
  const pedraM = A.texMat ? A.texMat('pedra', 1, 1) : MAT.pedraLap;
  const fuga = () => !!S.flags.sino;

  // ---------- A LUA DE VERDADE: o luar acompanha a fase real; na cheia, uma pedra a mais
  const idade = luaIdade(), ilum = (1 - Math.cos(idade / 29.530588853 * Math.PI * 2)) / 2, cheia = idade > 13.3 && idade < 16.3;
  if (def.fora) { def.fora.moon *= .75 + ilum * .5; if (cheia) { def.fora.moon *= 1.35; def.fora.hemi *= 1.2; } }
  if (cheia) {
    const g = new THREE.Group(); g.position.set(28.6, 0, -24.2); g.rotation.y = -Math.PI / 2; A.W.grupo.add(g);
    const tx = U.texto([{ t: '☾', tam: 40, y: 50 }, { t: 'AQUI JAZ', tam: 26, y: 112 }, { t: 'O QUE A LUA', tam: 24, y: 152 }, { t: 'MOSTROU', tam: 24, y: 188 }], { w: 256, h: 240, fundo: '#7a7a74', cor: '#1a1814', manchas: 3 });
    const p = box(.8, 1.05, .16, [MAT.pedraLap, MAT.pedraLap, MAT.pedraLap, MAT.pedraLap, new THREE.MeshStandardMaterial({ map: tx, roughness: .9, emissive: 0x202024, emissiveIntensity: .5 }), MAT.pedraLap], 0, .52, 0, g);
    A.addCollider(28.48, 28.72, -24.62, -23.78);
    U.rotulo(p, '<b>E</b>Ler a lápide clara, que brilha no luar', () => { A.toast('“AQUI JAZ O QUE A LUA MOSTROU”. Sem nome, sem data. A pedra está morna, como se o sol tivesse batido nela. À noite.'); U.segredo('l4_lua', 'Só aparece na lua cheia de verdade'); });
  }

  // ---------- O FUNDO DO CEMITÉRIO: a lápide coberta de musgo (segure E para limpar)
  { const lx = -9.2, lz = -45.4;
    const g = new THREE.Group(); g.position.set(lx, 0, lz); A.W.grupo.add(g);
    const tx = U.texto([{ t: '✝', tam: 40, y: 50 }, { t: 'LIA MORAES', tam: 30, y: 116 }, { t: '1967 — 1979', tam: 24, y: 160 }, { t: '“transferida”', tam: 18, y: 204, estilo: 'italic' }], { w: 256, h: 256, fundo: '#5a5850', cor: '#1a1814', manchas: 5 });
    box(.78, 1.02, .16, [MAT.pedraLap, MAT.pedraLap, MAT.pedraLap, MAT.pedraLap, new THREE.MeshStandardMaterial({ map: tx, roughness: .95 }), MAT.pedraLap], 0, .51, 0, g);
    A.addCollider(lx - .42, lx + .42, lz - .1, lz + .1);
    const musgoT = U.tex(256, 256, gg => { for (let i = 0; i < 900; i++) { gg.fillStyle = `rgba(${40 + Math.random() * 30 | 0},${70 + Math.random() * 40 | 0},${30 + Math.random() * 20 | 0},${.6 + Math.random() * .4})`; gg.beginPath(); gg.arc(Math.random() * 256, Math.random() * 256, 4 + Math.random() * 12, 0, 7); gg.fill(); } });
    const musgo = U.decal(musgoT, .8, 1.04, lx, .51, lz + .085, 0);
    const limpo = () => !!S.flags.l4_eraeu;
    if (limpo()) musgo.visible = false;
    const it = U.rotulo(musgo, () => limpo() ? 'LIA MORAES · 1967 — 1979 · “transferida”.' : '<b>E</b>Limpar o musgo da lápide (segure; devagar)', () => {
      if (limpo()) return; S.flags.l4_eraeu = true; musgo.visible = false; U.medo(18);
      A.toast('Embaixo do musgo: “LIA MORAES · 1967 — 1979 · transferida”. A vaga que não foi sua. A data é a do Davi.');
      U.depois(1.6, () => { som.respiro(.12); A.sub('lia', '(ela só respira)'); });
      U.depois(5, () => U.segredo('l4_eraeu', 'Era para ser você'));
    }, { hold: 6, guarda: true });
    it.pode = () => !limpo(); it.ruido = 1;
    tick(() => {
      if (limpo()) return;
      const k = Math.min(1, (it.progresso || 0) / it.hold); musgo.material.opacity = 1 - k * .92;
      if (U.segurando(it) && FX && Math.random() < .15) FX.emitir('poeira', lx + (Math.random() - .5) * .5, .6 + Math.random() * .4, lz + .2, 2, .1);
    });
  }

  // ---------- AO LADO: uma lápide pequena com o nome dela para cada vez que ela morreu esta noite
  { const n = Math.min(30, S.mortes || 0);
    if (n > 0) {
      const regras = ['CORREU', 'RESPONDEU', 'NÃO SE ESCONDEU', 'ACENDEU A LUZ', 'OLHOU PRA ELA', 'RESPIROU ALTO', 'PAROU NA ÁGUA', 'ABRIU A PORTA', 'CONTOU ATÉ DEZ', 'FICOU'];
      const atlas = U.tex(1024, 512, g => {
        for (let i = 0; i < 32; i++) {
          const cx = (i % 8) * 128 + 64, cy = Math.floor(i / 8) * 128 + 64;
          g.fillStyle = '#5a5850'; g.fillRect(cx - 62, cy - 62, 124, 124);
          for (let k = 0; k < 40; k++) { g.fillStyle = `rgba(20,18,14,${Math.random() * .2})`; g.fillRect(cx - 62 + Math.random() * 124, cy - 62 + Math.random() * 124, 3, 3); }
          g.fillStyle = '#1a1814'; g.textAlign = 'center'; g.font = 'bold 30px Georgia'; g.fillText('LIA', cx, cy - 6);
          g.font = '13px Georgia'; g.fillText(regras[(i * 7 + 3) % regras.length], cx, cy + 26);
        }
      });
      for (let i = 0; i < n; i++) {
        const x = -28.8 + (i % 15) * .5, z = i < 15 ? -47.1 : -46.3, gg = new THREE.Group(); gg.position.set(x, 0, z); gg.rotation.y = (Math.random() - .5) * .25; gg.rotation.z = (Math.random() - .5) * .12; A.W.grupo.add(gg);
        box(.32, .44, .07, MAT.pedraLap, 0, .22, 0, gg, false);
        const t = atlas.clone(); t.repeat.set(1 / 8, 1 / 4); t.offset.set((i % 8) / 8, 1 - (Math.floor(i / 8) % 4 + 1) / 4); t.needsUpdate = true;
        A.plano(.3, .3, new THREE.MeshStandardMaterial({ map: t, roughness: 1 }), 0, .26, .037, 0, gg);
      }
      const meio = { x: -28.8 + Math.min(14, n - 1) * .25, z: -46.7 };
      const alvo = box(Math.min(15, n) * .5, .5, 1.2, new THREE.MeshBasicMaterial({ visible: false }), meio.x, .25, meio.z, A.W.grupo, false);
      U.rotulo(alvo, () => `Lápides pequenas e novas, uma ao lado da outra: ${n}. Todas dizem “LIA”. Embaixo de cada nome, uma regra quebrada.`);
      tick(() => { if (n >= 3 && !S.flags.l4lapidesLia && U.olhando(meio.x, .3, meio.z, .9, 12)) { S.flags.l4lapidesLia = true; U.depois(.8, () => U.fala('Quantas vezes eu já vim aqui?')); } });
    }
  }

  // ---------- O FOGO-FÁTUO: uma luz azul que só aparece com a lanterna apagada, e espera por você
  { const FW = [[26.4, -1.2], [26.4, -17.1], [14, -17.1], [14, -29.1], [6, -29.1], [6, -31.2]];
    const caida = new THREE.Group(); caida.position.set(6, .06, -31.6); caida.rotation.set(-Math.PI / 2 + .05, 0, .3); A.W.grupo.add(caida);
    box(.4, .55, .1, MAT.pedraLap, 0, 0, 0, caida, false);
    const gude = new THREE.Mesh(new THREE.SphereGeometry(.03, 10, 8), new THREE.MeshStandardMaterial({ color: 0x3a7ad8, roughness: .1, transparent: true, opacity: .9, emissive: 0x0a2a6a, emissiveIntensity: .8 }));
    gude.position.set(6.1, .14, -31.45); gude.visible = false; A.W.grupo.add(gude);
    const brilho = U.tex(64, 64, g => { const r = g.createRadialGradient(32, 32, 2, 32, 32, 30); r.addColorStop(0, 'rgba(220,240,255,1)'); r.addColorStop(.3, 'rgba(110,170,255,.7)'); r.addColorStop(1, 'rgba(40,80,200,0)'); g.fillStyle = r; g.fillRect(0, 0, 64, 64); });
    const luz = new THREE.Sprite(new THREE.SpriteMaterial({ map: brilho, color: 0x9ac4ff, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0 })); luz.scale.setScalar(.45); A.W.grupo.add(luz);
    const pl = baixa() ? null : new THREE.PointLight(0x6aa0ff, 0, 4, 2); if (pl) luz.add(pl);
    let i = 0, alvo = null, op = 0, escondeT = 0, viu = false;
    luz.position.set(FW[0][0], 1.2, FW[0][1]);
    const acabou = () => !!S.flags.l4fatuoFim;
    if (acabou()) gude.visible = !S.flags.l4_fatuo;
    U.rotulo(caida, 'Uma lápide pequena, caída de bruços. Sem nome. Uma pedra de criança.');
    U.rotulo(gude, '<b>E</b>Pegar a bolinha de gude azul', () => {
      if (S.flags.l4_fatuo) return; S.flags.l4_fatuo = true; gude.visible = false; A.SFX.pegar();
      A.toast('Uma bolinha de gude azul, gelada. A luz ficou presa lá dentro, bem fraquinha.');
      U.depois(1.6, () => U.fala('A bolinha azul do Tomé. Ele dizia que essa dava sorte.'));
      U.depois(3.4, () => U.segredo('l4_fatuo', 'A luz de defunto se apagou na bolinha'));
    });
    tick((dt, t) => {
      if (S.chapter !== 5 || fuga() || acabou()) { luz.visible = false; return; }
      const escuro = !S.flashOn, d = U.dist(luz.position.x, luz.position.z);
      if (!escuro) { escondeT = 2; if (op > .05 && d < 20) { op = Math.max(0, op - dt * 4); } }
      else if (escondeT > 0) escondeT -= dt;
      const quer = escuro && escondeT <= 0 && d < 18 ? 1 : 0;
      op += (quer - op) * Math.min(1, dt * (quer ? 1.2 : 4));
      luz.visible = op > .02; luz.material.opacity = op * (.75 + Math.sin(t * 7) * .15); if (pl) pl.intensity = op * .9;
      if (op > .5 && !viu) { viu = true; U.depois(.6, () => U.fala('(sussurrando) Uma luz azul... só aparece com a lanterna apagada. A vó chamava isso de fogo que anda.')); }
      const by = 1.1 + Math.sin(t * 1.7) * .15;
      if (alvo) {
        const dx = alvo[0] - luz.position.x, dz = alvo[1] - luz.position.z, l = Math.hypot(dx, dz), v = 1.7 * dt;
        if (l <= v) { luz.position.x = alvo[0]; luz.position.z = alvo[1]; i = FW.indexOf(alvo); alvo = null; }
        else { luz.position.x += dx / l * v; luz.position.z += dz / l * v; }
      } else if (op > .4 && d < 3.4) {
        if (i < FW.length - 1) alvo = FW[i + 1];
        else { S.flags.l4fatuoFim = true; let k = 0; tick(d2 => { if (k >= 1) return; k = Math.min(1, k + d2 * .6); luz.position.y = 1.1 - k * .95; luz.material.opacity = (1 - k) * .9; luz.visible = true; if (pl) pl.intensity = (1 - k); if (k >= 1) { luz.visible = false; gude.visible = true; } }); U.depois(1.8, () => U.fala('Entrou na pedra... tem alguma coisa brilhando ali.')); return; }
      }
      luz.position.y = by;
    });
  }

  // ---------- O SININHO: uma cova antiga com sino de segurança e a corda entrando na terra
  { const sx = 28.2, sz = -8.6;
    const g = new THREE.Group(); g.position.set(sx, 0, sz); A.W.grupo.add(g);
    box(.55, .7, .12, MAT.pedraLap, 0, .35, .5, g, false);
    cyl(.035, .045, 1.5, MAT.ferrugem, -.35, .75, 0, 6, g); box(.35, .04, .04, MAT.ferrugem, -.2, 1.48, 0, g, false);
    const sinoG = new THREE.Group(); sinoG.position.set(-.05, 1.44, 0); g.add(sinoG);
    const sn = new THREE.Mesh(new THREE.ConeGeometry(.07, .1, 10, 1, true), MAT.bronze); sn.position.y = -.06; sn.material.side = THREE.DoubleSide; sinoG.add(sn);
    const corda = cyl(.006, .006, 1.5, new THREE.MeshStandardMaterial({ color: 0x8a7a5a }), .12, .72, -.1, 4, g); corda.rotation.z = -.22;
    A.addCollider(sx - .45, sx - .25, sz - .1, sz + .1);
    const pos = { x: sx, y: 1.4, z: sz };
    let balanco = 0, soloT = 30 + Math.random() * 30;
    const tocar = (forte) => { balanco = forte ? 1.4 : .8; som.sininho(pos, forte ? .35 : .18); legenda(A, 'l4Sininho', pos); };
    U.rotulo(g, () => '<b>E</b>Puxar a cordinha que entra na terra', () => {
      const P = A.P, dx = sx - P.pos.x, dz = sz - P.pos.z, l = Math.hypot(dx, dz) || 1;
      tocar(true); P.pos.x += dx / l * .35; P.pos.z += dz / l * .35; P.shake = .3; if (FX) { FX.tranco(.15); FX.vib(260, .8); FX.emitir('terra', sx + .1, .1, sz - .1, 10, .2); }
      A.emitNoise(sx, sz, fuga() ? 22 : 14); U.medo(20);
      if (U.uma('l4sininhoPuxou')) { U.depois(.4, () => U.fala('Puxou de volta! Alguma coisa lá embaixo puxou a corda de volta!')); U.depois(3, () => U.segredo('l4_aindaaqui', 'Alguém ainda está aí embaixo')); }
    });
    tick((dt) => {
      if (balanco > 0) { balanco = Math.max(0, balanco - dt * .7); sinoG.rotation.z = Math.sin(A.perf() * 18) * .5 * balanco; }
      if (S.chapter !== 5) return;
      soloT -= dt; if (soloT <= 0) { soloT = 35 + Math.random() * 40; if (U.dist(sx, sz) < 24) tocar(false); }
    });
  }

  // ---------- A COVA ABERTA DO MOACIR: deitar lá dentro (quase não se ouve nada... até cair terra)
  { const mx = -26.4, mz = -28, cq = (() => { try { return JSON.parse(localStorage.getItem('hora-silencio-v2-conq')) || {}; } catch (e) { return {}; } })();
    if (!cq.final_verdadeiro) {
      const alvo = box(1.5, .08, .7, new THREE.MeshBasicMaterial({ visible: false }), mx, .04, mz, A.W.grupo, false);
      let deit = null, saiuT = -9;
      const tela = (() => { let d = document.getElementById('l4-cova'); if (!d) { d = document.createElement('div'); d.id = 'l4-cova'; d.style.cssText = 'position:fixed;inset:0;background:#000;opacity:0;pointer-events:none;transition:opacity .8s;z-index:6'; document.body.appendChild(d); } d.style.opacity = 0; return d; })();
      const levantar = (motivo) => {
        if (!deit) return; const durou = deit.t; deit = null; saiuT = A.perf(); tela.style.opacity = 0;
        A.P.pos.set(mx + 1.3, A.P.pos.y, mz + .9); A.P.crouch = false;
        if (motivo === 'preta') { U.medo(25); U.depois(.6, () => U.fala('(tossindo terra) Não fica muito tempo aí dentro. Nunca mais.')); }
        if (durou > 15) U.segredo('l4_setepalmos', 'Você aguentou embaixo da terra');
      };
      U.rotulo(alvo, () => deit ? '' : '<b>E</b>Deitar na cova aberta (ninguém ouve você aí dentro)', () => {
        if (deit || fuga() || A.perf() - saiuT < .6) return; deit = { t: 0, terraT: 0 }; A.P.crouch = true; A.SFX.pegar();
        U.uma('l4covaDica', () => A.toast('Deitada na cova. E, C ou W para sair.'));
      });
      for (const k of ['KeyE', 'KeyC', 'KeyW', 'Space']) TECLAS[k] = () => { if (deit && deit.t > .5 && A.W.mapa === 'cemiterio') levantar('sair'); };
      const rui0 = def.ruidoMul; def.ruidoMul = () => (rui0 ? rui0() : 1) * (deit ? .08 : 1);
      tick(dt => {
        if (!deit) return;
        const P = A.P; deit.t += dt;
        if (fuga() || S.dead || A.W.mapa !== 'cemiterio') { levantar('sair'); return; }
        P.pos.x = mx; P.pos.z = mz; P.crouch = true; P.pitch += (1.25 - P.pitch) * Math.min(1, dt * 3);
        A.camera.position.y = .28;
        if (deit.t > 15) { deit.terraT -= dt; if (deit.terraT <= 0) { deit.terraT = 1.1 + Math.random(); som.terra({ x: mx, y: 1, z: mz }, .3); if (FX) FX.emitir('terra', mx + (Math.random() - .5) * .6, 1.6, mz, 8, .3); P.shake = .05; legenda(A, 'l4TerraCai'); U.uma('l4terraFala', () => U.fala('Tem alguém jogando terra. Alguém tá me enterrando!')); } tela.style.opacity = Math.min(.9, (deit.t - 15) / 10).toFixed(2); }
        if (deit.t > 25) { tela.style.opacity = 1; levantar('preta'); }
      });
    }
  }

  // ---------- O TESOURO DOS TRÊS: duas árvores secas perto do galpão, e o X no meio
  { const tx = 27.4, tz = -33.2;
    arvoreSeca(A, tx, -29.6, 5.5); arvoreSeca(A, tx, -36.8, 5);
    const cruz = new THREE.Group(); cruz.position.set(tx, .03, tz); A.W.grupo.add(cruz);
    for (const r of [.7, -.7]) { const b = box(.7, .05, .12, MAT.pedraLap, 0, 0, 0, cruz, false); b.rotation.y = r; }
    const monte = box(.9, .1, .9, A.texMat ? A.texMat('terra', .5, .5) : MAT.madeiraEsc, tx, .02, tz, A.W.grupo, false);
    const lata = new THREE.Group(); lata.position.set(tx + .3, .08, tz + .2); lata.visible = !!S.flags.l4tesouro; A.W.grupo.add(lata);
    box(.3, .12, .2, new THREE.MeshStandardMaterial({ color: 0x8a6a3a, metalness: .6, roughness: .5 }), 0, 0, 0, lata, false);
    const tampa = box(.3, .02, .2, new THREE.MeshStandardMaterial({ color: 0x8a2a1a, metalness: .6, roughness: .5 }), 0, .1, -.12, lata, false); tampa.rotation.x = -1.1;
    const it = U.rotulo(cruz, () => S.flags.l4tesouro ? '<b>E</b>Ler de novo a carta dos três' : !S.inv.pa ? 'Duas pedras chatas em cruz entre as árvores secas. A terra embaixo está fofa.' : '<b>E</b>Cavar entre as duas árvores secas (opcional; a pá faz barulho)', () => {
      if (S.flags.l4tesouro) { A.lerNota('l4_carta'); return; }
      if (!S.inv.pa) return;
      S.flags.l4tesouro = true; lata.visible = true; monte.scale.y = 4; A.SFX.pegar(); A.emitNoise(tx, tz, 8);
      A.toast('Uma caixa de lata enferrujada: uma figurinha que brilha, uma bolinha de gude, o apito do Tomé e uma carta dobrada em quatro.');
      U.depois(1.4, () => { if (U.noMapa('cemiterio')) A.lerNota('l4_carta'); });
    }, { hold: 3, guarda: true });
    it.pode = () => !!S.inv.pa && !S.flags.l4tesouro; it.som = 'cavar'; it.ruido = 7;
    X.notaLida = id => {
      if (id !== 'l4_carta' || S.flags.l4cartaLida) return; S.flags.l4cartaLida = true;
      S.health = 100; S.fear = 0;
      U.depois(.6, () => A.toast('Você leu duas vezes. O corpo parou de doer, e o medo foi embora. Só por agora.'));
      U.depois(2, () => U.segredo('l4_tesouro', 'O tesouro de pirata dos três'));
    };
  }

  // ---------- A POÇA: o reflexo da lápide diz outra coisa (agachada, olhando para a água)
  { const px = -6, pz = -1.1;
    const poca = A.plano(1.5, 1.1, new THREE.MeshStandardMaterial({ color: 0x0c1014, roughness: .05, metalness: .9 }), px, .008, pz, 0); poca.rotation.x = -Math.PI / 2;
    const refT = U.tex(256, 160, g => { g.save(); g.translate(256, 0); g.scale(-1, 1); g.fillStyle = 'rgba(200,196,184,.9)'; g.textAlign = 'center'; g.font = 'bold 28px Georgia'; g.fillText('MOACIR DUARTE', 128, 60); g.font = '22px Georgia'; g.fillText(`1938 — ${hoje}`, 128, 104); g.restore(); });
    const ref = A.plano(1.1, .7, new THREE.MeshBasicMaterial({ map: refT, transparent: true, opacity: 0, depthWrite: false }), px, .012, pz, 0); ref.rotation.x = -Math.PI / 2; ref.rotation.z = Math.PI;
    U.rotulo(poca, 'Uma poça escura e parada, refletindo a lápide do lado.');
    let k = 0;
    tick(dt => {
      const P = A.P, quer = P.crouch && U.dist(px, pz) < 2.6 && U.olhando(px, .01, pz, .8, 3.2) ? 1 : 0;
      k += (quer - k) * Math.min(1, dt * 2); ref.material.opacity = k * .75;
      if (k > .6 && !S.flags.l4poca) { S.flags.l4poca = true; U.medo(12); U.depois(.5, () => U.fala('...o reflexo diz outra coisa.')); U.depois(3.2, () => U.fala('Na pedra não tem nada disso. Só na água.')); }
    });
  }

  // ---------- A COVA SEM NOME: terra fofa, mexida há pouco (remexer com a pá)
  { const covas = ctx.covas || [];
    let c = null, md = 1e9; for (const cv of covas) { const d = Math.hypot(cv.x - 7, cv.z + 14); if (d < md) { md = d; c = cv; } }
    if (c) {
      const fofa = box(.75, .06, 1.3, new THREE.MeshStandardMaterial({ color: 0x2a1c12, roughness: 1 }), 0, .1, -.9, c.g, false);
      const cartao = A.plano(.12, .08, new THREE.MeshStandardMaterial({ map: U.texto([{ t: 'MATRÍCULA', tam: 22, y: 30, estilo: 'bold' }, { t: (nome || 'LIA MORAES').toUpperCase(), tam: 20, y: 64 }, { t: hoje, tam: 18, y: 94 }], { w: 192, h: 120, fundo: '#d8d0b8', cor: '#2a2018', manchas: 1 }) }), 0, .16, -.9, 0, c.g); cartao.rotation.x = -Math.PI / 2; cartao.visible = false;
      const it = U.rotulo(c.g, () => S.flags.l4_lugar ? 'A cova sem nome, fechada de novo às pressas.' : !S.inv.pa ? 'Uma cova sem nome. A terra está fofa, mexida há pouco.' : '<b>E</b>Remexer a terra fofa da cova sem nome (opcional; barulho)', () => {
        if (S.flags.l4_lugar || !S.inv.pa) return; S.flags.l4_lugar = true; cartao.visible = true; fofa.scale.y = 3; A.emitNoise(c.x, c.z, 8); U.medo(20); A.SFX.estalo({ x: c.x, z: c.z }, .3);
        A.toast(`Vazia. No fundo, um cartão de matrícula plastificado: “${(nome || 'LIA MORAES').toUpperCase()} — matriculada em ${hoje}”. A foto foi arrancada.`);
        U.depois(1.8, () => { U.fala('Não. Não, não, não... fecha isso.'); fofa.scale.y = 1; cartao.visible = false; som.terra({ x: c.x, y: .3, z: c.z }, .35); });
        U.depois(4, () => U.segredo('l4_lugar', 'Já tem lugar guardado pra você'));
      }, { hold: 3, guarda: true });
      it.pode = () => !!S.inv.pa && !S.flags.l4_lugar; it.som = 'cavar'; it.ruido = 7;
    }
  }

  // ---------- O BARRACÃO DE FERRAMENTAS: porta presa por arame e a pá do coveiro, de cabo curto
  { const bx = 27.6, bz = 1.8, mad = A.texMat ? A.texMat('madeira', 1, 1) : MAT.madeiraEsc;
    box(1.6, 2.1, 1.4, mad, bx, 1.05, bz); A.addCollider(bx - .8, bx + .8, bz - .7, bz + .7);
    const tel = box(1.9, .08, 1.7, MAT.ferrugem, bx, 2.14, bz, A.W.grupo, false); tel.rotation.z = .08;
    const porta = new THREE.Group(); porta.position.set(bx - .82, 0, bz - .5); A.W.grupo.add(porta);
    box(.04, 1.8, 1, mad, 0, .9, .5, porta, false);
    const arame = new THREE.Mesh(new THREE.TorusGeometry(.05, .006, 4, 10), MAT.metal); arame.position.set(-.04, 1, .92); arame.rotation.y = Math.PI / 2; porta.add(arame);
    const dentro = A.plano(.95, 1.75, new THREE.MeshBasicMaterial({ color: 0x0a0806 }), bx - .81, .9, bz, -Math.PI / 2);
    const pa = new THREE.Group(); pa.position.set(bx - .9, .55, bz + .25); pa.rotation.z = .15; A.W.grupo.add(pa);
    cyl(.02, .02, .7, MAT.madeira, 0, .35, 0, 5, pa); box(.18, .22, .02, MAT.ferrugem, 0, -.05, 0, pa, false);
    const aberta = () => !!S.flags.l4barracao;
    if (aberta()) { porta.rotation.y = -1.6; arame.visible = false; }
    pa.visible = aberta() && !S.flags.l4pa; dentro.visible = aberta();
    const itP = U.rotulo(porta, () => aberta() ? 'O barracão do coveiro, aberto.' : S.flags.l4canivete ? '<b>E</b>Cortar o arame da porta com o canivete do Davi' : '<b>E</b>Soltar o arame da porta do barracão (segure; range baixo)', () => {
      if (aberta()) return; S.flags.l4barracao = true; arame.visible = false; dentro.visible = true; pa.visible = !S.flags.l4pa;
      let k = 0; tick(dt => { if (k >= 1) return; k = Math.min(1, k + dt * 1.3); porta.rotation.y = -1.6 * k; });
      if (S.flags.l4canivete) U.depois(.8, () => U.fala('O canivete dele cortou o arame sem um barulho. ...Ele ia gostar de saber que serviu pra alguma coisa.'));
      else A.emitNoise(bx, bz, 4);
    }, { hold: 2 });
    itP.pode = () => !aberta(); itP.som = null;
    Object.defineProperty(itP, 'hold', { get: () => S.flags.l4canivete ? .3 : 2, configurable: true });
    Object.defineProperty(itP, 'ruido', { get: () => S.flags.l4canivete ? 0 : 3, configurable: true });
    const holdOrig = {};
    const aplicarPa = () => { for (const [id, { it }] of Object.entries(ctx.itsTum || {})) { if (holdOrig[id] == null) holdOrig[id] = it.hold; it.hold = holdOrig[id] * (S.flags.l4pa ? .6 : 1); } };
    aplicarPa();
    U.rotulo(pa, '<b>E</b>Pegar a pá do coveiro, de cabo curto', () => {
      if (S.flags.l4pa) return; S.flags.l4pa = true; pa.visible = false; A.SFX.pegar(); aplicarPa();
      A.toast('A pá do coveiro: cabo curto, lâmina gasta e afiada. Com ela os túmulos saem bem mais rápido (menos tempo fazendo barulho).');
      U.depois(1.5, () => U.fala('Essa aqui já cavou muito.'));
    });
  }

  // ---------- O ANJO DE PEDRA: aponta para o túmulo que falta, e muda quando ninguém olha
  { const ax = 2.3, az = -13.3;
    const g = new THREE.Group(); g.position.set(ax, 0, az); A.W.grupo.add(g);
    box(.55, .45, .55, pedraM, 0, .225, 0, g);
    const corpo = new THREE.Group(); corpo.position.y = .45; g.add(corpo);
    const manto = new THREE.Mesh(new THREE.ConeGeometry(.26, 1.1, 8), pedraM); manto.position.y = .55; corpo.add(manto);
    const cab = new THREE.Mesh(new THREE.SphereGeometry(.12, 8, 6), pedraM); cab.position.y = 1.18; corpo.add(cab);
    for (const s of [-1, 1]) { const asa = box(.05, .7, .38, pedraM, s * .12, .85, -.2, corpo, false); asa.rotation.z = s * .3; asa.rotation.x = .2; }
    const braco = new THREE.Group(); braco.position.set(.14, .95, 0); corpo.add(braco);
    const b = cyl(.04, .035, .55, pedraM, 0, 0, .27, 6, braco); b.rotation.x = Math.PI / 2;
    A.addCollider(ax - .3, ax + .3, az - .3, az + .3);
    U.rotulo(g, 'Um anjo de pedra com o braço estendido, apontando para algum lugar do cemitério.');
    let olhaT = 0, rangeCd = 0, mudou = false;
    const mira = () => {
      if (fuga()) return { x: 0, z: 12 };
      let m = null, md = 1e9; for (const [id, L] of Object.entries(ctx.importantes || {})) { if (S.tumulos[id]) continue; const p = L.g.position, d = Math.hypot(p.x - ax, p.z - az); if (d < md) { md = d; m = { x: p.x, z: p.z }; } }
      return m || { x: 0, z: -48 };
    };
    { const m = mira(); corpo.rotation.y = Math.atan2(m.x - ax, m.z - az); }
    tick(dt => {
      const vendo = U.olhando(ax, 1.2, az, .7, 35);
      if (!vendo) { const m = mira(), y = Math.atan2(m.x - ax, m.z - az); if (Math.abs(y - corpo.rotation.y) > .05) { corpo.rotation.y = y; mudou = true; } }
      else if (mudou && U.dist(ax, az) < 16) { mudou = false; U.uma('l4anjoMudou', () => U.depois(.5, () => U.fala(fuga() ? 'O anjo... agora aponta pro portão dos fundos.' : 'O braço do anjo... tava apontando pra outro lado.'))); if (fuga()) U.uma('l4anjoFuga', () => U.depois(.5, () => U.fala('O anjo tá apontando pro portão. Vai!'))); }
      rangeCd -= dt;
      if (U.olhando(ax, 1.2, az, .97, 14)) { olhaT += dt; if (olhaT > 7 && rangeCd <= 0) { rangeCd = 40; olhaT = 0; const P = A.P, p = { x: P.pos.x + Math.sin(P.yaw) * 2, y: .8, z: P.pos.z + Math.cos(P.yaw) * 2 }; som.pedra(p, 1.4, .3); legenda(A, 'l4Pedra', p); U.medo(12); } }
      else olhaT = 0;
    });
  }

  // ---------- A ÁRVORE DOS SAPATINHOS (a árvore seca do fundo) e um par de adulto, novo
  { const tx = -14, tz = -38, pares = [];
    const cores = [0x3a2a1e, 0x5a2020, 0x20304a, 0x4a3a2a, 0x2a2a2a];
    for (let i = 0; i < 6; i++) {
      const a = i / 6 * Math.PI * 2 + .3, r = .7 + (i % 2) * .35, y = 2.7 + (i % 3) * .3, adulto = i === 4;
      const piv = new THREE.Group(); piv.position.set(tx + Math.cos(a) * r, y, tz + Math.sin(a) * r); A.W.grupo.add(piv);
      cyl(.003, .003, .5, MAT.lencol, 0, -.25, 0, 3, piv);
      const m = new THREE.MeshStandardMaterial({ color: adulto ? 0x1e1a18 : cores[i % 5], roughness: .7 }), s = adulto ? 1.6 : 1;
      for (const k of [-1, 1]) box(.05 * s, .045 * s, .12 * s, m, k * .03 * s, -.53, 0, piv, false);
      pares.push({ piv, adulto, fase: Math.random() * 6 });
      if (adulto) U.rotulo(piv, () => `Um par de botas de adulto, novas, número 36, penduradas pelo cadarço.${S.flags.l4_sapatos ? ' As mesmas da prateleira lá de baixo.' : ''}`);
    }
    U.rotulo(pares[0].piv, 'Sapatinhos de criança pendurados pelos cadarços nos galhos secos.');
    tick((dt, t) => {
      for (const p of pares) {
        const luzN = p.adulto && U.iluminado(p.piv.position.x, p.piv.position.y - .5, p.piv.position.z, 14, .97);
        p.amp = Math.max(luzN ? .5 : .05, (p.amp || .05) - dt * .2);
        p.piv.rotation.z = Math.sin(t * 1.3 + p.fase) * p.amp; p.piv.rotation.x = Math.cos(t * 1.1 + p.fase) * p.amp * .5;
        if (luzN) U.uma('l4arvoreBotas', () => U.depois(.6, () => U.fala('Sem vento... e só aquele par balança.')));
      }
    });
  }

  // ---------- CAPELA: a pia batismal de água preta (segure E: algo frio fecha a sua mão)
  { const px = -7.1, pz = -49.7;
    cyl(.12, .18, .8, pedraM, px, .4, pz, 8);
    const bacia = new THREE.Mesh(new THREE.CylinderGeometry(.34, .22, .22, 14, 1, true), pedraM); bacia.material.side = THREE.DoubleSide; bacia.position.set(px, .9, pz); A.W.grupo.add(bacia);
    const agua = A.plano(.6, .6, new THREE.MeshStandardMaterial({ color: 0x020203, roughness: .02, metalness: .95 }), px, .96, pz, 0); agua.rotation.x = -Math.PI / 2;
    A.addCollider(px - .34, px + .34, pz - .34, pz + .34);
    let frio = false;
    const it = U.rotulo(agua, () => S.flags.l4terco ? 'A pia batismal. A água preta está parada, sem reflexo.' : '<b>E</b>Pôr a mão na água preta da pia (segure)', () => {
      if (S.flags.l4terco) return; S.flags.l4terco = true;
      A.toast('Você puxou a mão de volta. Enrolado nos dedos: um escapulário de pano da Irmã Celeste, seco.');
      U.depois(1.6, () => U.fala('Ela tá do meu lado. Até agora.'));
    }, { hold: 3, guarda: true });
    it.pode = () => !S.flags.l4terco; it.ruido = 0;
    let segurou = false, ativo = false;
    tick(dt => {
      if (!S.flags.l4terco && U.segurando(it)) { U.medo(14 * dt); const k = (it.progresso || 0) / it.hold; if (k > .5 && !frio) { frio = true; legenda(A, 'l4Fria'); A.P.shake = .05; } }
      // na fuga: ele demora mais para sair da capela
      if (S.flags.l4terco && fuga() && !segurou) { if (A.M.ativo && !ativo) { ativo = true; segurou = true; A.M.wait = Math.max(A.M.wait || 0, 3); U.depois(.4, () => A.sub('celeste', '(muito perto, rezando) ...vai, menina. Eu seguro ele um pouquinho.')); } }
      if (!A.M.ativo) ativo = false;
    });
  }

  // ---------- O SOCORRO EM LUZ: três curtas, três longas, três curtas para o posto do Seu Joaquim
  { const wx = -6, wz = 11.87;
    const sinal = U.decal(U.tex(512, 192, g => { g.fillStyle = 'rgba(232,228,214,.85)'; g.font = '48px "Special Elite",monospace'; g.textAlign = 'center'; g.fillText('•  •  •    —  —  —    •  •  •', 256, 80); g.font = '26px "Special Elite",monospace'; g.fillText('PRO SEU JOAQUIM VER — D.', 256, 150); }), 1.5, .56, wx, 1.4, wz, Math.PI);
    U.rotulo(sinal, 'Riscado a giz no muro dos fundos: três pontos, três traços, três pontos. “PRO SEU JOAQUIM VER — D.” Lá longe, depois do muro, uma luzinha amarela no posto.');
    const longe = new THREE.Sprite(new THREE.SpriteMaterial({ color: 0xffd080, transparent: true, opacity: .25, depthWrite: false, blending: THREE.AdditiveBlending }));
    longe.position.set(14, 3, 80); longe.scale.setScalar(1.2); A.W.grupo.add(longe);
    const vela = new THREE.Group(); vela.position.set(2.5, 0, 11.3); vela.visible = false; A.W.grupo.add(vela);
    cyl(.03, .03, .2, MAT.vela || MAT.lencol, 0, .1, 0, 6, vela);
    const chama = new THREE.Mesh(new THREE.SphereGeometry(.015, 6, 5), new THREE.MeshBasicMaterial({ color: 0xffb050 })); chama.scale.y = 2; chama.position.y = .23; vela.add(chama);
    const luzV = baixa() ? null : new THREE.PointLight(0xffa040, 0, 3.5, 2); if (luzV) { luzV.position.y = .35; vela.add(luzV); }
    let ant = !!S.flashOn, ini = 0, fimUlt = 0, seq = '', resposta = null, freou = false;
    tick((dt, t) => {
      // detecta o padrão nas piscadas da lanterna (perto do muro dos fundos)
      const on = !!S.flashOn, P = A.P;
      if (on !== ant) {
        if (on) { if (t - fimUlt > 1.6) seq = ''; ini = t; }
        else { const d = t - ini; seq += d < .5 ? 'S' : d < 2.4 ? 'L' : 'X'; fimUlt = t; if (seq.length > 9) seq = seq.slice(-9); if (seq === 'SSSLLLSSS' && P.pos.z > 2 && !S.flags.l4_cambio && S.chapter === 5) { S.flags.l4_cambio = true; resposta = { t: 0 }; } }
        ant = on;
      }
      if (resposta) {
        resposta.t += dt; const r = resposta.t - 1.5, pad = 'SSSLLLSSS'; let acesa = false, acc = 0;
        for (const c of pad) { const d = c === 'L' ? .7 : .25; if (r >= acc && r < acc + d) acesa = true; acc += d + .3; }
        longe.material.opacity = acesa ? 1 : .25; longe.scale.setScalar(acesa ? 2.2 : 1.2);
        if (r > acc + .6) { resposta = null; legenda(A, 'l4Radio'); som.bipes(null, 'SSSLLLSSS', .04); A.sub('joaquim', '(no rádio, bem baixinho) Recebido, menina. Na hora de correr... corre pelo lado esquerdo do portão.'); U.depois(4, () => U.segredo('l4_cambio', 'O posto respondeu')); }
      } else longe.material.opacity = .25 + Math.sin(t * .7) * .05;
      // na fuga: a vela do lado esquerdo do portão, e ele perde três segundos ali
      vela.visible = !!S.flags.l4_cambio && fuga();
      if (vela.visible && luzV) luzV.intensity = 1.1 + Math.sin(t * 9) * .15;
      if (vela.visible && !freou && A.M.ativo && P.pos.z > 0 && A.M.pos.distanceTo(P.pos) < 9) { freou = true; A.M.wait = Math.max(A.M.wait || 0, 3); A.SFX.estalo({ x: 2.5, z: 11.3 }, .2); U.depois(.3, () => U.fala('A vela! Ele parou... vai, vai!')); }
    });
  }

  // ---------- O CONFESSIONÁRIO: a madeira por dentro, e uma voz que conhece a sua noite
  { const cx = -7.05, cz = -57.6;
    let dentroT = 0, entrou = false;
    tick(dt => {
      const H = S.hidden, P = A.P;
      const ali = !!H && Math.hypot((H.x ?? P.pos.x) - cx, (H.z ?? P.pos.z) - cz) < 1.2;
      if (!ali) { if (entrou && dentroT > 15) S.flags.l4confFalou = true; dentroT = 0; entrou = false; return; }
      if (!entrou) { entrou = true; if (S.flags.l4confFalou && !S.flags.l4confVazio) { S.flags.l4confVazio = true; U.depois(2, () => A.toast('O outro lado da grade está vazio. A madeira está molhada, como se alguém tivesse acabado de chorar ali.')); } }
      dentroT += dt;
      if (dentroT > 2.5 && !S.flags.l4_guardado) { S.flags.l4_guardado = true; A.toast('Na madeira, na altura do rosto, nomes riscados por crianças. Entre eles, com a letra do Davi: “LIA — 14/03/79 — guardei teu lugar”.'); U.depois(3, () => U.segredo('l4_guardado', 'Ele guardou um lugar pra você')); }
      if (dentroT > 14 && !S.flags.l4confFalou && !S.flags.l4confFala && (!A.M.ativo || A.M.pos.distanceTo(P.pos) > 8)) {
        S.flags.l4confFala = true;
        const m = S.mortes || 0, mort = m === 0 ? 'Não morreu nenhuma vez esta noite. Ninguém consegue isso.' : m === 1 ? 'Morreu uma vez esta noite. Uma só.' : `Morreu ${m} vezes esta noite. Eu contei.`;
        const dica = !S.flags.l4tesouro ? 'cave entre as duas árvores secas, do lado do galpão.' : !S.flags.l4_eraeu ? 'limpe a pedra coberta de musgo, no fundo, perto da capela.' : !S.flags.l4_cambio ? 'pisque a sua luz para o posto: três curtas, três longas, três curtas.' : 'reze pela menina que ficou no seu lugar.';
        A.sub('voz', `(do outro lado da grade, um homem velho) E você, moça? ${mort}`);
        U.depois(4.5, () => A.sub('voz', `(do outro lado da grade) Penitência: ${dica}`));
      }
    });
  }

  // ---------- O CANÁRIO NO SINO (se você soltou ele lá embaixo)
  if (S.flags.l4canario) {
    const ave = new THREE.Group(); ave.position.set(5.5, 5.48, -64); ave.rotation.y = -Math.PI / 2; A.W.grupo.add(ave);
    const amarelo = new THREE.MeshStandardMaterial({ color: 0xe8c840, roughness: .6, emissive: 0x3a2c06, emissiveIntensity: .7 });
    const c = new THREE.Mesh(new THREE.SphereGeometry(.05, 8, 6), amarelo); c.scale.set(1, .9, 1.4); ave.add(c);
    const h = new THREE.Mesh(new THREE.SphereGeometry(.032, 8, 6), amarelo); h.position.set(0, .045, .05); ave.add(h);
    U.rotulo(ave, 'Um canário amarelo, pousado na trave do sino. O mesmo da gaiola lá de baixo.', () => U.uma('l4canarioSino', () => U.fala('Você veio. Você achou o caminho sozinho.')));
    let cantou = false;
    tick((dt, t) => {
      ave.position.y = 5.48 + (Math.sin(t * 4) > .95 ? .015 : 0);
      if (S.flags.sino && !cantou) { cantou = true; U.depois(1.5, () => { som.canto9({ x: 5.5, y: 5.5, z: -64 }); legenda(A, 'l4Canto9', { x: 5.5, y: 5.5, z: -64 }); }); U.depois(5.6, () => U.fala('Ele cantou... nove vezes. Não fugiu.')); U.depois(7, () => U.segredo('l4_livre', 'O canário cantou as nove badaladas')); }
    });
  }

  // na lua cheia, a Lia comenta a claridade ao chegar
  X.entrar = () => { if (cheia) U.uma('l4luaFala', () => U.depois(9, () => U.fala('Lua cheia. Hoje não tem sombra pra me esconder.'))); };
  return juntar(def, X);
}
