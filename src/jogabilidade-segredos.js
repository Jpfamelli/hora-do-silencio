// Jogabilidade, lote 4: segredos e easter eggs para quem explora.
// Bolso de segredos (U usa, Y troca), máquina de escrever, telefone interno com ramais, relógio da recepção,
// sapateira, bolo de doze velas, duto, chuveiro, centrífuga, lâmpada que pisca um número, folha de limão,
// lata do tesouro, bolinha de gude, câmera instantânea, papel de bala vermelho, soldadinho, jogo da velha
// do Davi, bilhete para a próxima Lia, apito, lanterninha, pião, barquinhos de papel, pilha roxa,
// S.O.S. com a lanterna, contar junto com a Ana, bichinho de sombra, lanterna da tentativa anterior...
// Ligado ao motor por ganchos curtos (procure "SEG." em jogo.js). Nada aqui é obrigatório para terminar o jogo.

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const rand = (a, b) => a + Math.random() * (b - a);
const pick = a => a[Math.random() * a.length | 0];
const semAcento = s => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase();
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export const TXT = {
  maquina: {
    SOCORRO: 'NINGUÉM VEM.',
    ALBANO: 'EU, ALBANO, MANDEI PASSAR A CHAVE NO DORMITÓRIO. ERA A HORA. ERA A REGRA. DEUS ME PERDOE A REGRA.',
    MOACIR: '1951. NOVE ANOS. ARMÁRIO 4.',
    DAVI: 'TÔ AQUI EMBAIXO.',
    LIA: 'FICHA DE MATRÍCULA — MORAES, LIA. IDADE: 23. MOTIVO DA INTERNAÇÃO: VEIO BUSCAR O IRMÃO. DATA DE SAÍDA: ',
    CELESTE: 'ELA CANTAVA BAIXINHO PRA GENTE DORMIR.',
    ANA: 'UM. DOIS. TRÊS. QUATRO. CINCO.',
    TOME: 'O CARRINHO É AZUL. NÃO É PRETO. É AZUL.',
    JOAQUIM: 'O HOMEM DO RÁDIO SABE MAIS DO QUE DIZ.',
    BENTO: 'TRÊS BOLINHAS DE GUDE. UMA LISTRADA, UMA PINTADA, UMA LISA. ERAM MINHAS.',
    LUIZ: 'EU SÓ QUERIA DORMIR. EU SÓ QUERIA DORMIR. EU SÓ QUERIA DORMIR.',
    SILENCIO: 'A HORA DO SILÊNCIO COMEÇA ÀS NOVE E NÃO ACABA.',
    REGRA: 'A SÉTIMA REGRA NÃO ESTÁ NA PAREDE. A SÉTIMA REGRA É VOCÊ.',
    '1979': 'FOI NESSE ANO. NINGUÉM SAIU. NEM ELE.',
    ficha: nome => `FICHA DE MATRÍCULA — ${nome}. IDADE: ??. MOTIVO: ENTROU SOZINHO(A). LEITO: 38. DATA DE SAÍDA: `
  },
  ramais: 'RAMAIS INTERNOS — 1979\n\n03 .... cozinha\n05 .... enfermaria\n07 .... lavanderia\n11 .... biblioteca\n13 .... refeitório\n15 .... casa de máquinas\n09 .... capela\n\n00 .... NÃO DISCAR\n\n(a lápis, embaixo, letra de criança: tem um que não tá aqui)',
  pai: { titulo: 'Papel enrolado no fundo da lanterna', texto: '(a letra do seu pai, a caneta azul, de quando a lanterna era dele)\n\nSe um dia você for lá, filha, não confia no homem do rádio.\nEle mente pra proteger.\nProteger quem, eu nunca descobri.\n\n— Pai' },
  mapaLimao: { titulo: 'A folha em branco (agora não mais)', texto: '(o calor da luz escureceu o suco de limão. Aparece um mapa de pirata, desenhado por uma criança)\n\nO PÁTIO — a porta grande — o muro da frente.\nUm X bem embaixo, rente ao chão, à direita da porta.\n\nTESOURO DO CLUBE. SÓ PRA QUEM NÃO DORME.\n— D.M.' },
  barcos: [
    'se a água subir, o barco sobe junto',
    'eu dobrei sete. um afundou. ficaram seis',
    'um pra cada lugar que tem água aqui',
    'a irmã celeste disse que barco de papel não afunda se tiver nome',
    'escrevi o seu nome em todos, lia',
    'quando você achar o último, eu vou estar te esperando no portão'
  ],
  bilheteCompleto: 'Lia,\nse a água subir, o barco sobe junto.\nEu dobrei sete. Um afundou. Ficaram seis, um pra cada lugar que tem água aqui.\nA Irmã Celeste disse que barco de papel não afunda se tiver nome.\nEscrevi o seu nome em todos.\nQuando você achar o último, eu vou estar te esperando no portão.\n— Davi',
  joaquimSOS: {
    1: 'O gerador é o barulho mais alto do mundo. Liga e sai pelo outro lado.',
    2: 'Quando piscar a luz, o esconderijo mais perto é o melhor.',
    3: 'A menina tem medo do escuro, não de você. Olha pra ela.',
    4: 'Embaixo, agachada, a água esconde o seu passo.',
    5: 'Cava, entra, toca. E não olha pra trás.'
  },
  morteFrases: ['Eu já estive aqui.', 'Essa lanterna é minha. Ainda está quente.', 'Foi daqui que ele veio.', 'Eu morri aqui. Não vou morrer de novo.'],
  vermelho: ['NÃO CONFIA NA SEXTA REGRA', 'O PRIMEIRO NÚMERO É {n}', '← D  POR AQUI'],
  velha: { perdeu: 'PERDEU. AGORA CONTA', empate: 'VOCÊ AINDA JOGA IGUAL' }
};
const SALA_OBJ = { posto: 'posto', chave_portao: 'posto', galao: 'despensa', fusiveis: 'enferm', gerador: 'maq', fita_diretor: 'diret', chave_escada: 'hall', subir: 'hall', engrenagens: 'dormE', caixinha: 'brinq', quarto_celeste: 'celeste', fita_celeste: 'celeste', chave_porao: 'sotao', valvulas: 'v1', cofre: 'secreta', tumulos: 'cem', capela: 'capela', altar: 'capela', sino: 'capela' };
const ROXA = { terreo: ['hall', 'ce', 'cw', 'diret', 'enferm'], superior: ['corr', 'patamar', 'brinq', 'dormE', 'celeste'], tuneis: ['entrada', 't1', 'hub', 't4', 'secreta'] };
export const CONQUISTAS = [
  { id: 'l4_doce', nome: 'Doce de Verdade', desc: 'Dê uma bala de goma para a Ana.', secreta: true, dica: 'um pote no balcão' },
  { id: 'l4_hora', nome: 'Fora de Hora', desc: 'Adiante o relógio da recepção até as nove.', secreta: true, dica: 'o relógio parado' },
  { id: 'l4_descalca', nome: 'Como Elas', desc: 'Passe os Capítulos I e II descalça.', secreta: true, dica: 'de sapato ele ouve' },
  { id: 'l4_maquina', nome: 'Datilógrafa', desc: 'Faça a máquina da diretoria responder três vezes.', secreta: true, dica: 'nomes' },
  { id: 'l4_ramal', nome: 'Ramal Zero', desc: 'Disque o ramal que diz NÃO DISCAR.', secreta: true, dica: 'a lista de ramais' },
  { id: 'l4_bolo', nome: 'Doze Velas', desc: 'Sopre as velas do bolo do forno.', secreta: true, dica: 'o forno apagado' },
  { id: 'l4_sos', nome: 'Três Curtas', desc: 'Peça socorro com a lanterna de uma janela.', secreta: true, dica: 'curta, longa, curta' },
  { id: 'l4_tesouro', nome: 'O X do Mapa', desc: 'Ache a lata do tesouro do clube.', secreta: true, dica: 'cheira a limão' },
  { id: 'l4_sombra', nome: 'Teatro de Sombras', desc: 'Faça a Ana rir com um bichinho de sombra.', secreta: true, dica: 'a mão e a parede' },
  { id: 'l4_velha', nome: 'Velha de Giz', desc: 'Empate três vezes com o Davi no jogo da velha.', secreta: true, dica: 'ele joga perfeito' },
  { id: 'l4_recreio', nome: 'Hora do Recreio', desc: 'Sopre o apito reserva do Inspetor.', secreta: true, dica: 'num prego da rouparia' },
  { id: 'l4_contei', nome: 'Contei Junto', desc: 'Conte junto com a Ana, no ritmo dela.', secreta: true, dica: 'as teclas de número' },
  { id: 'l4_badalada', nome: 'Badalada Torta', desc: 'Acerte uma garrafa no alto da capela.', secreta: true, dica: 'mire para cima' },
  { id: 'l4_barcos', nome: 'Frota do Davi', desc: 'Ache os seis barquinhos de papel.', secreta: true, dica: 'perto da água' },
  { id: 'l4_bilhete', nome: 'Recado Para Mim', desc: 'Leia o bilhete que você deixou na noite anterior.', secreta: true, dica: 'papel e lápis' },
  { id: 'l4_nahora', nome: 'Na Hora Certa', desc: 'Esteja no internato quando o relógio de verdade marcar 21h.', secreta: true, dica: 'jogue às nove' },
  { id: 'l4_lampada', nome: 'Pisca-Pisca', desc: 'Abra a gaveta da enfermaria com o número da lâmpada.', secreta: true, dica: 'não está piscando à toa' },
  { id: 'l4_pontaria', nome: 'Pontaria', desc: 'Apague uma lâmpada com o estilingue do Davi.', secreta: true, dica: 'ele acertava passarinho do outro lado do pátio' },
  { id: 'l4_sal', nome: 'Linha de Sal', desc: 'Segure a fila numa linha de sal grosso.', secreta: true, dica: 'a avó sempre dizia' },
  { id: 'l4_cesta', nome: 'Cesta', desc: 'Jogue uma garrafa dentro do poço de longe.', secreta: true, dica: 'o poço do monta-cargas' },
  { id: 'l4_bento', nome: 'Bolso do Bento', desc: 'Encaixe as três bolinhas de gude na lápide certa.', secreta: true, dica: 'cada uma num mapa' },
  { id: 'l4_vitral', nome: 'Pela Janela', desc: 'Deixe o luar entrar quebrando o vitral.', secreta: true, dica: 'uma janela pintada de preto' },
  { id: 'l4_olho', nome: 'Como Ele Vê', desc: 'Use o olho de vidro para enxergar através das paredes.', secreta: true, dica: 'numa gaveta do depósito' },
  { id: 'l4_recepcao', nome: 'A Cobrar', desc: 'Atenda a telefonista de 1979 no telefone da recepção.', secreta: true, dica: 'disque 0' },
  { id: 'l4_canecas', nome: 'Passa a Caneca', desc: 'Dê a volta inteira no ritmo das canecas do refeitório.', secreta: true, dica: 'no tempo do batuque' }
];
const ITENS = {
  bala: { nome: 'Bala de goma', dica: 'Para alguém que goste de doce. Chegue perto da Ana iluminada.' },
  folha: { nome: 'Folha que cheira a limão', dica: 'Segure U parada perto de uma luz.' },
  fita: { nome: 'Fita "SINO — NÃO GASTAR"', dica: 'Toque perto dele. Só funciona uma vez.' },
  camera: { nome: 'Câmera instantânea', dica: 'U tira foto com flash.' },
  celofane: { nome: 'Papel de bala vermelho', dica: 'U põe ou tira da lanterna.' },
  soldado: { nome: 'Soldadinho de corda', dica: 'U dá corda e solta no chão.' },
  apito: { nome: 'Apito reserva', dica: 'U sopra. Ele obedece ao apito.' },
  lanterninha: { nome: 'Lanterninha do Davi', dica: 'U troca de lanterna. Não gasta pilha.' },
  piao: { nome: 'Pião confiscado', dica: 'U solta o pião girando no chão.' },
  roxa: { nome: 'Pilha roxa', dica: 'U coloca. Dura pouco.' },
  estilingue: { nome: 'Estilingue do Davi', dica: 'U atira uma pedrinha longe, quase sem ruído. Só 3 pedras.' },
  olho: { nome: 'Olho de vidro', dica: 'U vê como ele por 3 s — mas a audição dele dobra.' },
  sal: { nome: 'Saco de sal grosso', dica: 'U risca uma linha na porta mais perto. A fila para no sal.' },
  vela: { nome: 'Toco de vela', dica: 'U acende em cima de um móvel. A luz prende a Ana de perto.' }
};

export function criarSegredos(C) {
  const { THREE, W, P, M, ANA, PROC, R, OPT, SFX, keys, camera } = C;
  const S = () => C.S, F = () => C.S.flags, perf = () => C.perf, A = C.audio;
  R.lote4 = R.lote4 || {}; R.lote4.maquina = TXT.maquina;
  for (const c of CONQUISTAS) if (!R.conquistas.some(x => x.id === c.id)) R.conquistas.push(c);
  const LS = 'hora-silencio-l4';
  const ls = { get() { try { return JSON.parse(localStorage.getItem(LS) || '{}') || {}; } catch (e) { return {}; } }, set(o) { try { localStorage.setItem(LS, JSON.stringify(o)); } catch (e) {} } };
  const sess = { morte: null, hora21: false, piscadas: [], pulsos: [], ligouEm: 0, sel: 0 };
  let G = null; // estado do mapa atual

  // ------------------------------------------------ estilo, HUD e telas próprias
  const css = document.createElement('style');
  css.textContent = `#l4-hud{position:absolute;left:50%;top:calc(50% + 40px);transform:translateX(-50%);font-family:"Special Elite",monospace;font-size:12px;letter-spacing:.1em;color:#c9b98a;text-shadow:0 0 6px #000;pointer-events:none;text-align:center}
  #l4-flash{position:fixed;inset:0;background:#fff;opacity:0;pointer-events:none;z-index:40}
  #l4-modo{position:fixed;left:50%;top:50%;transform:translate(-50%,-50%);width:min(560px,92vw);background:#d9ccad;color:#2a1d12;font-family:"Special Elite",monospace;padding:22px 26px;box-shadow:0 0 0 2px #1a120a,0 20px 60px #000;z-index:45;line-height:1.5}
  #l4-modo h3{margin:0 0 8px;font-size:15px;letter-spacing:.2em;color:#5a2010}#l4-modo pre{white-space:pre-wrap;font-family:inherit;font-size:16px;margin:0;min-height:120px;max-height:50vh;overflow:hidden}
  #l4-modo small{display:block;margin-top:10px;opacity:.7;font-size:12px}#l4-modo input{width:100%;font:italic 20px cursive;background:transparent;border:0;border-bottom:1px solid #6a5a40;color:#1a2a5a;outline:none}
  #l4-modo .disco{font-size:42px;letter-spacing:.3em;text-align:center;margin:6px 0}#l4-modo .resp{color:#7a1a12}`;
  document.head.appendChild(css);
  const hud = document.createElement('div'); hud.id = 'l4-hud'; document.getElementById('hud')?.appendChild(hud);
  const flashEl = document.createElement('div'); flashEl.id = 'l4-flash'; document.body.appendChild(flashEl);
  const ov = document.createElement('div'); ov.id = 'l4-modo'; ov.hidden = true; document.body.appendChild(ov);
  let modo = null;
  function abrirModo(m) { fecharModo(); modo = m; ov.hidden = false; for (const k of ['KeyW', 'KeyA', 'KeyS', 'KeyD', 'ShiftLeft', 'ShiftRight', 'KeyE', 'Space']) keys[k] = false; m.render(); if (m.foco) setTimeout(() => { const i = ov.querySelector('input'); if (i) i.focus(); }, 30); }
  function fecharModo() { if (!modo) return; const m = modo; modo = null; ov.hidden = true; ov.innerHTML = ''; if (m.fechar) m.fechar(); try { document.activeElement && document.activeElement.blur && document.activeElement.blur(); } catch (e) {} }
  addEventListener('keydown', e => {
    if (!modo) return;
    e.stopImmediatePropagation();
    if (modo.tipo !== 'bilhete') e.preventDefault();
    if (!e.repeat || modo.tipo === 'maquina') modo.tecla(e);
  }, true);
  ov.addEventListener('pointerdown', e => e.stopPropagation());

  // ------------------------------------------------ som procedural
  const ok = () => !!C.AC;
  const som = {
    clac(pos) { if (!ok()) return; const t = C.AC.currentTime, g = A.saida(pos, .15); A.burst(t, .035, 'highpass', 2600, 1, g); A.env(g, t, .001, .5, .04); const g2 = A.saida(pos, .15); A.osc('square', 140, t + .01, .05, g2); A.env(g2, t + .01, .002, .12, .05); },
    ding(pos) { if (!ok()) return; const t = C.AC.currentTime; for (const f of [2093, 3140]) { const g = A.saida(pos, .4); A.osc('sine', f, t, 1.2, g); A.env(g, t, .002, .12, 1.1); } },
    tique(pos, n = 1, gap = .07) { if (!ok()) return; const t = C.AC.currentTime; for (let i = 0; i < n; i++) { const g = A.saida(pos, .1); A.burst(t + i * gap, .012, 'bandpass', 3200, 4, g); A.env(g, t + i * gap, .001, .25, .012); } },
    toque(pos) { if (!ok()) return; const t = C.AC.currentTime; for (let k = 0; k < 2; k++) { const g = A.saida(pos, .5); const o1 = A.osc('square', 440, t + k * .45, .38, g), o2 = A.osc('square', 480, t + k * .45, .38, g); g.gain.value = 0; for (let i = 0; i < 14; i++) { g.gain.setValueAtTime(i % 2 ? .0001 : .05, t + k * .45 + i * .027); } g.gain.setValueAtTime(.0001, t + k * .45 + .38); void o1; void o2; } },
    respira(pos) { if (!ok()) return; const t = C.AC.currentTime; for (let i = 0; i < 4; i++) { const g = A.saida(pos, .2, 'voz'); A.burst(t + i * 1.4, 1.1, 'bandpass', i % 2 ? 900 : 650, 1.5, g); A.env(g, t + i * 1.4, .45, .08, .6); } },
    loop(pos, tipo, freq, vol, q = .8) { if (!ok()) return null; const s = A.ruido(true), f = C.AC.createBiquadFilter(); f.type = tipo; f.frequency.value = freq; f.Q.value = q; const g = A.saida(pos, .3); g.gain.value = vol; s.connect(f); f.connect(g); s.start(); return { s, g, f, parar() { try { g.gain.setTargetAtTime(0, C.AC.currentTime, .15); s.stop(C.AC.currentTime + .6); } catch (e) {} } }; },
    lata(pos, vol = .5) { if (!ok()) return; const t = C.AC.currentTime; for (const f of [310, 523, 811, 1290]) { const g = A.saida(pos, .5); A.osc('sine', f * rand(.97, 1.03), t, .9, g); A.env(g, t, .002, vol / 3, .8); } const g = A.saida(pos, .3); A.burst(t, .2, 'bandpass', 900, 2, g); A.env(g, t, .002, vol, .18); },
    sino(pos, vol = .45, desafina = 1) { if (!ok()) return; const t = C.AC.currentTime; for (const [f, k] of [[220, 1], [528, .6], [702, .35], [1210, .2]]) { const g = A.saida(pos, .8); A.osc('sine', f * desafina * rand(.995, 1.005), t, 4, g); A.env(g, t, .004, vol * k, 3.8); } },
    giz(pos) { if (!ok()) return; const t = C.AC.currentTime; for (let i = 0; i < 3; i++) { const g = A.saida(pos, .1); A.burst(t + i * .09, .07, 'bandpass', rand(2800, 4200), 3, g); A.env(g, t + i * .09, .005, .22, .06); } },
    motor(pos) { if (!ok()) return; const t = C.AC.currentTime, g = A.saida(pos, .2); const f = A.burst(t + .1, .7, 'bandpass', 500, 3, g); f.frequency.linearRampToValueAtTime(1400, t + .8); A.env(g, t + .1, .05, .3, .65); const g2 = A.saida(pos, .1); const o = A.osc('sine', 2400, t, .25, g2); o.frequency.linearRampToValueAtTime(5200, t + .22); A.env(g2, t, .02, .06, .22); },
    tambor(pos) { if (!ok()) return; const t = C.AC.currentTime, g = A.saida(pos, .3); A.burst(t, .05, 'bandpass', 700, 2, g); A.env(g, t, .001, .35, .05); const g2 = A.saida(pos, .2); A.osc('triangle', 180, t, .08, g2); A.env(g2, t, .001, .15, .07); },
    corda() { if (!ok()) return; const t = C.AC.currentTime; for (let i = 0; i < 8; i++) { const g = A.saida(null, .05); A.burst(t + i * .14, .02, 'highpass', 3800, 2, g); A.env(g, t + i * .14, .001, .14, .02); } },
    apito(pos) { if (!ok()) return; const t = C.AC.currentTime, g = A.saida(pos, .6); const o = A.osc('sine', 2900, t, 1.4, g); const lfo = C.AC.createOscillator(), lg = C.AC.createGain(); lfo.frequency.value = 28; lg.gain.value = 140; lfo.connect(lg); lg.connect(o.frequency); lfo.start(t); lfo.stop(t + 1.4); A.env(g, t, .03, .4, 1.3); const g2 = A.saida(pos, .4); A.burst(t, 1.3, 'bandpass', 2900, 6, g2); A.env(g2, t, .03, .12, 1.2); },
    piao(pos, dur = 6) { if (!ok()) return; const t = C.AC.currentTime, g = A.saida(pos, .3); const o = A.osc('sine', 330, t, dur, g); o.frequency.linearRampToValueAtTime(240, t + dur); const lfo = C.AC.createOscillator(), lg = C.AC.createGain(); lfo.frequency.value = 9; lg.gain.value = 12; lfo.connect(lg); lg.connect(o.frequency); lfo.start(t); lfo.stop(t + dur); g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(.09, t + .2); g.gain.setValueAtTime(.09, t + dur - 1.2); g.gain.exponentialRampToValueAtTime(.0001, t + dur); },
    parabens(pos) { if (!ok()) return; const t = C.AC.currentTime, n = [[392, .3], [392, .15], [440, .45], [392, .45], [523, .45], [494, .9], [392, .3], [392, .15], [440, .45], [392, .45]]; let k = 0; for (const [f, d] of n) { const g = A.saida(pos, .7, 'voz'); const o = A.osc('triangle', f * rand(.96, 1.04), t + k, d, g); void o; A.env(g, t + k, .03, .06, d * .9); k += d + .04; } },
    chocalho(pos) { if (!ok()) return; const t = C.AC.currentTime; for (let i = 0; i < 6; i++) { const g = A.saida(pos, .3); A.burst(t + i * .05, .04, 'bandpass', rand(600, 1600), 2, g); A.env(g, t + i * .05, .002, .3, .04); } },
    rolar(pos) { if (!ok()) return; const t = C.AC.currentTime, g = A.saida(pos, .15); A.burst(t, .5, 'bandpass', 1500, 6, g); A.env(g, t, .02, .08, .45); },
    zumbido() { if (!ok()) return; const t = C.AC.currentTime, g = A.saida(null, 0); A.osc('sine', 5200, t, 3, g); A.env(g, t, .05, .03, 2.8); }
  };

  // ------------------------------------------------ utilidades do mundo
  const mat = (cor, em = 0x000000, ei = .6, extra = {}) => new THREE.MeshStandardMaterial({ color: cor, emissive: em, emissiveIntensity: ei, roughness: .7, ...extra });
  const descartar = t => { t.userData.clone = true; return t; };
  const texCanvas = (w, h, draw) => { const cv = document.createElement('canvas'); cv.width = w; cv.height = h; draw(cv.getContext('2d'), w, h); const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; return descartar(t); };
  const matTex = (tex, extra = {}) => new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false, ...extra });
  const escrita = (linhas, cor = 'rgba(225,220,205,.85)', w = 512, h = 256, tam = 34) => texCanvas(w, h, (g, W2, H2) => { g.clearRect(0, 0, W2, H2); g.fillStyle = cor; g.textAlign = 'center'; linhas.forEach((l, i) => { g.font = `${tam}px "Special Elite", Georgia`; g.fillText(l, W2 / 2 + rand(-4, 4), H2 / 2 - (linhas.length - 1) * tam * .6 + i * tam * 1.2); }); });
  function livre(x, z, m = .35) {
    if (W.colliders.some(c => c.on && Math.min(c.maxX - c.minX, c.maxZ - c.minZ) > .13 && x > c.minX - m && x < c.maxX + m && z > c.minZ - m && z < c.maxZ + m)) return false; // paredes e portas (finas) não contam
    if (W.links.some(l => Math.hypot(l.x - x, l.z - z) < 2.1)) return false;
    const sp = W.def && W.def.spawns; if (sp) for (const k in sp) { const s = sp[k]; if (s && Math.hypot(s.x - x, s.z - z) < 1.3) return false; }
    return true;
  }
  // lado: n (z0), s (z1), o (x0), l (x1). Devolve o ponto no chão a "off" da parede e o ponto colado na parede.
  function lugar(sid, lado, t = .5, off = .5, margem = .45) {
    const r = C.SALA(sid); if (!r) return null;
    let best = null;
    for (let k = 0; k < 26; k++) {
      const tt = clamp(t + (k ? (k % 2 ? 1 : -1) * Math.ceil(k / 2) * .035 : 0), .07, .93);
      let x, z, wx, wz, ry;
      if (lado === 'n') { x = wx = r.x0 + tt * (r.x1 - r.x0); z = r.z0 + off; wz = r.z0 + .115; ry = 0; }
      else if (lado === 's') { x = wx = r.x0 + tt * (r.x1 - r.x0); z = r.z1 - off; wz = r.z1 - .115; ry = Math.PI; }
      else if (lado === 'o') { z = wz = r.z0 + tt * (r.z1 - r.z0); x = r.x0 + off; wx = r.x0 + .115; ry = Math.PI / 2; }
      else { z = wz = r.z0 + tt * (r.z1 - r.z0); x = r.x1 - off; wx = r.x1 - .115; ry = -Math.PI / 2; }
      const p = { x, z, wx, wz, ry, r };
      if (!best) best = p;
      if (livre(x, z, margem)) return p;
    }
    return best;
  }
  function grupo(x, y, z, ry = 0) { const g = new THREE.Group(); g.position.set(x, y, z); g.rotation.y = ry; W.grupo.add(g); return g; }
  const dist = (x, z) => Math.hypot(P.pos.x - x, P.pos.z - z);
  const umaVida = () => !!(S().modo && S().modo.umaVida);
  const capF = k => 'l4_' + k + '_' + S().chapter;
  function examinar(obj, label, fn, extra) { return C.interact(obj, () => { const l = typeof label === 'function' ? label() : label; return l && l.startsWith('!') ? l.slice(1) : '<b>E</b>' + l; }, fn, extra); }
  function ferir(n, causa) { const s = S(); s.health = Math.max(1, s.health - n); s.capDano = (s.capDano || 0) + n; if (SFX.ofego) SFX.ofego(); P.shake = Math.max(P.shake || 0, .05); if (causa) C.marcarCausa(causa); }
  function lia(t, curta) { curta ? C.subPequeno('lia', t) : C.sub('lia', t); }

  // ------------------------------------------------ bolso de segredos (U usa, Y troca)
  function bolso() { const s = S(); return s ? (s.flags.l4bolso || (s.flags.l4bolso = {})) : {}; }
  function itensBolso() { const b = bolso(); return Object.keys(ITENS).filter(k => b[k] > 0); }
  function dar(k, n = 1, silencioso) {
    const b = bolso(), novo = !b[k]; b[k] = (b[k] || 0) + n;
    const l = itensBolso(); sess.sel = Math.max(0, l.indexOf(k));
    if (!silencioso) C.toast(`${ITENS[k].nome} no bolso. ${ITENS[k].dica}${l.length > 1 ? ' (Y troca o item.)' : ''}`);
    if (novo && !F().l4dicaBolso) { F().l4dicaBolso = true; setTimeout(() => C.toast('Bolso de segredos: U usa o item, Y troca.'), 2600); }
    C.renderInvMini();
  }
  function tirar(k, n = 1) { const b = bolso(); b[k] = Math.max(0, (b[k] || 0) - n); const l = itensBolso(); sess.sel = clamp(sess.sel, 0, Math.max(0, l.length - 1)); C.renderInvMini(); }
  function selecionado() { const l = itensBolso(); if (!l.length) return null; sess.sel = clamp(sess.sel, 0, l.length - 1); return l[sess.sel]; }
  function inv() {
    const s = S(); if (!s) return [];
    const out = [], l = itensBolso(), k = selecionado();
    if (k) { const n = bolso()[k]; out.push(`${ITENS[k].nome}${n > 1 || k === 'camera' ? ` <em>${n}</em>` : ''}${k === 'celofane' && F().l4vermelho ? ' (na lente)' : ''}${k === 'lanterninha' && F().l4lanterninha ? ' (acesa)' : ''}<kbd>U</kbd>${l.length > 1 ? `<small style="opacity:.6"> +${l.length - 1} <kbd>Y</kbd></small>` : ''}`); }
    if (F().l4amuleto) out.push('Amuleto do relógio');
    if (F().l4descalca) out.push('Descalça');
    if (F().l4adrenalina === s.chapter && !F().l4adrUsada) out.push('Ampola de adrenalina');
    return out;
  }
  function usar() {
    const k = selecionado();
    if (!k) return false;
    const fn = USOS[k]; if (fn) fn();
    return true;
  }

  // ------------------------------------------------ o Inspetor atraído para um ponto (fica ouvindo)
  const ocupado = () => ['caca', 'bote', 'agarra', 'alerta', 'vasculha', 'fareja'].includes(M.state);
  function atrair(x, z, espera = 6, o = {}) {
    if (!M.ativo || (ocupado() && !o.forca) || M.state === 'agarra' || M.state === 'bote' || (S().flags.sino && !o.forca)) return false;
    M.state = 'investiga'; M.acao = null; M.searchT = 0; M.ultimo = new THREE.Vector3(x, 0, z);
    if (!C.planejar(M, x, z)) return false;
    G.isca = { x, z, espera, chegou: false, t: 0, max: 45, ouvido: o.ouvido ?? .35, aoChegar: o.aoChegar, depois: o.depois };
    return true;
  }
  function updateIsca(dt) {
    const c = G.isca; if (!c) return;
    c.max -= dt;
    if (!M.ativo || c.max <= 0 || ['caca', 'bote', 'agarra'].includes(M.state)) { G.isca = null; return; }
    if (!c.chegou) {
      if (Math.hypot(M.pos.x - c.x, M.pos.z - c.z) < 1.8) { c.chegou = true; c.t = c.espera; M.path = []; M.wait = c.espera; M.state = 'procura'; M.searchT = c.espera + 2; M.acao = null; c.aoChegar && c.aoChegar(); }
      else if (!M.path.length && M.state !== 'investiga') G.isca = null;
      return;
    }
    c.t -= dt; if (c.t <= 0) { G.isca = null; c.depois && c.depois(); }
  }

  // ------------------------------------------------ montagem por mapa
  function mapa(id) {
    if (G) { for (const l of G.loops) l && l.parar(); }
    fecharModo();
    G = { mapa: id, loops: [], tick: [], isca: null, chuva: null, centri: null, toques: [], bolo: null, gude: null, piao: null, soldado: null, presa: 0, luzNegra: 0, decais: [], vermelhos: [], lamp: null, olharLamp: 0, sombraT: 0, velha: null, giraT: 0, limaoT: 0, slide: 0, sprintAnt: false, crouchAnt: false, batAnt: null, contou: { ultimo: 0, t: -9, acertos: 0 }, olhosT: 0, anaVistaEm: -9, espelho: null, revelados: [] };
    const s = S(); if (!s || !W.def) return;
    if (!F().l4noite) { const o = ls.get(); o.noite = (o.noite || 0) + 1; ls.set(o); F().l4noite = o.noite; }
    try {
      if (id === 'estrada') montarEstrada();
      else if (id === 'terreo') montarTerreo();
      else if (id === 'superior') montarSuperior();
      else if (id === 'tuneis') montarTuneis();
      else if (id === 'cemiterio') montarCemiterio();
      montarRoxa(id); montarMorte(id); montarBilheteAntigo(id);
    } catch (e) { console.warn('jogabilidade-segredos', e); }
    window.__seg = { G, sess, bolso, dar, usar, TXT };
  }

  // ------------------------------------------------ barquinhos de papel (um por mapa, perto da água)
  const TX_BARCO = texCanvas(64, 64, (g, w, h) => { g.fillStyle = '#e6dcc4'; g.fillRect(0, 0, w, h); g.strokeStyle = 'rgba(40,40,90,.6)'; g.font = 'italic 14px cursive'; g.fillStyle = 'rgba(30,30,90,.7)'; g.fillText('Lia', 20, 40); });
  TX_BARCO.userData.clone = false;
  const MAT_BARCO = new THREE.MeshStandardMaterial({ map: TX_BARCO, emissive: 0x2a2620, emissiveIntensity: .8, side: THREE.DoubleSide, roughness: 1 }); MAT_BARCO.userData.compartilhado = true;
  function barquinho(id, x, y, z) {
    const o = ls.get(); if (o.barcos && o.barcos[id]) return null;
    const g = grupo(x, y, z, rand(0, 6.28));
    const casco = new THREE.Mesh(new THREE.CylinderGeometry(.09, .05, .05, 3, 1, true), MAT_BARCO); casco.rotation.z = Math.PI / 2; casco.scale.set(1, 1, .6); casco.position.y = .03; g.add(casco);
    const vela = new THREE.Mesh(new THREE.ConeGeometry(.05, .1, 3), MAT_BARCO); vela.position.y = .1; g.add(vela);
    const y0 = y; G.tick.push(() => { g.position.y = y0 + Math.sin(perf() * 1.3 + x) * .006; g.rotation.z = Math.sin(perf() * .9) * .05; });
    const it = examinar(g, 'Pegar o barquinho de papel', () => {
      const o2 = ls.get(); o2.barcos = o2.barcos || {}; if (o2.barcos[id]) return; o2.barcos[id] = Date.now(); ls.set(o2);
      g.visible = false; SFX.papel();
      const n = Object.keys(o2.barcos).length, linha = TXT.barcos[Math.min(n, 6) - 1];
      C.abrirNotaUI(`Barquinho de papel (${n} de 6)`, `(dentro da dobra, a lápis, letra do Davi)\n\n${linha}`);
      if (n >= 6) setTimeout(() => { C.abrirNotaUI('A frota inteira', TXT.bilheteCompleto); C.conquista('l4_barcos'); }, 400);
      else if (n === 1) setTimeout(() => lia('Um barquinho. Ele dobrava esses na pia de casa.', true), 900);
    });
    it.on = () => g.visible;
    G.segredos = G.segredos || []; G.segredos.push({ x, z, feito: () => !g.visible });
    return g;
  }

  // ------------------------------------------------ prólogo
  function montarEstrada() {
    const sp = W.def.spawns.inicio;
    if (sp) for (const [dx, dz] of [[2.4, -4], [-2.4, -4], [2.4, 4], [-2.6, -7]]) if (livre(sp.x + dx, sp.z + dz)) { barquinho('estrada', sp.x + dx, .02, sp.z + dz); break; }
    // pote de balas de goma na loja do posto
    const p = lugar('posto', 's', .7, .3); if (!p) return;
    const g = grupo(p.wx - Math.sin(p.ry) * .12, 1.05, p.wz - Math.cos(p.ry) * .12, p.ry);
    C.box(.42, .03, .2, mat(0x4a3420, 0x140c06), 0, -.02, 0, g, false);
    const vidro = new THREE.Mesh(new THREE.CylinderGeometry(.08, .08, .18, 12), new THREE.MeshStandardMaterial({ color: 0xbfd8d0, transparent: true, opacity: .35, roughness: .1, emissive: 0x203030, emissiveIntensity: .5 })); vidro.position.y = .09; g.add(vidro);
    for (let i = 0; i < 9; i++) { const b = new THREE.Mesh(new THREE.SphereGeometry(.018, 6, 4), mat(pick([0xc0392b, 0x2e8b57, 0xe0a020, 0x8e44ad]), 0x301010, .9)); b.position.set(rand(-.05, .05), .02 + i * .012, rand(-.05, .05)); g.add(b); }
    const it = examinar(g, () => bolso().bala || F().l4balaDada ? '!Um pote de vidro sem rótulo. Balas de goma de 1979, duras como pedra.' : 'Pegar uma bala de goma do pote', () => {
      if (bolso().bala || F().l4balaDada) return;
      SFX.papel(); dar('bala'); setTimeout(() => lia('Uma bala de goma. Ainda no papel. Quem guarda bala por quinze anos?', true), 700);
    });
    void it;
    // moeda de 1979 no chão do ponto de ônibus + orelhão
    const sp2 = W.def.spawns.inicio;
    if (sp2 && !F().l4moeda && !F().l4orelhao) {
      let mx = sp2.x + 1.2, mz = sp2.z + 1.2; if (!livre(mx, mz)) { mx = sp2.x - 1.2; }
      const gm = grupo(mx, .02, mz, 0);
      const moeda = C.cyl(.03, .03, .006, mat(0xb8a850, 0x403010, .6, { metalness: .7 }), 0, 0, 0, 14, gm); moeda.rotation.x = Math.PI / 2;
      const itm = examinar(gm, 'Pegar a moeda de 1979 do chão', () => { gm.visible = false; F().l4moeda = true; SFX.pegar(); setTimeout(() => lia('Uma moeda velha. 1979. Dá pra uma ligação a cobrar.', true), 700); });
      itm.on = () => gm.visible;
    }
    const po = lugar('posto', 'o', .3, .4);
    if (po) {
      const g2 = grupo(po.wx - Math.sin(po.ry) * .03, 1.2, po.wz - Math.cos(po.ry) * .03, po.ry);
      C.box(.22, .5, .14, mat(0x204a30, 0x081810, .5), 0, 0, .07, g2);
      examinar(g2, () => F().l4moeda && !F().l4orelhao ? 'Pôr a moeda e fazer uma ligação a cobrar' : F().l4orelhao ? '!Um orelhão de rua, o fone frio.' : '!Um orelhão. Precisa de uma moeda.', () => {
        if (!F().l4moeda || F().l4orelhao) return;
        F().l4orelhao = true; som.tique({ x: po.x, y: 1.2, z: po.z }, 2, .12);
        C.sub('voz', '(a telefonista) Ligação a cobrar do Internato São Lázaro. A senhora aceita?', true);
        setTimeout(() => C.sub('davi', '(do outro lado, longe) Lia, não sobe. Por favor, não sobe. Ele tá acordado.', true), 4200);
        setTimeout(() => lia('Davi? Davi, é você?'), 9000);
      });
    }
  }

  // ------------------------------------------------ térreo
  function montarTerreo() {
    const s = S();
    montarRelogio(); montarSapateira(); montarMaquina(); montarTelefone(); montarForno(); montarDuto();
    montarGaveta(); montarLampada(); montarChuveiro(); montarCentrifuga(); montarCarteira(); montarTijolo(); montarGude(); montarAtalhoBalcao();
    montarEstilingue(); montarCarrinho(); montarCanecas(); montarSal(); montarVela(); montarRecepcao(); montarGudeMapa('terreo');
    notaEscondida('despensa', 'o', .5, 'Carta da cozinheira', '(dobrada atrás de um pote de sal)\n\nFui eu que deixava os pães no porão. As crianças tinham fome de noite. O diretor dizia que fome ensina. Eu não acreditava em regra que faz criança chorar.\n\n— D. Corina, cozinha', 'l4notaT');
    const pc = lugar('cozinha', 'n', .7, .45); if (pc) { C.box(.7, .8, .5, mat(0x9a9a92, 0x202020, .4), pc.x, .4, pc.z, W.grupo, true); barquinho('cozinha', pc.x, .82, pc.z); }
    const pl = lugar('lavand', 'n', .25, .5); if (pl) { C.box(.8, .62, .6, mat(0x7a7a72, 0x181818, .4), pl.x, .31, pl.z, W.grupo, true); barquinho('lavand', pl.x, .64, pl.z); }
    void s;
  }
  // relógio de pêndulo da recepção: girar os ponteiros, nove badaladas fora de hora e o amuleto
  function horaTxt() { const m = 20 * 60 + 47 + (F().l4hora || 0); return `${Math.floor(m / 60)}h${String(m % 60).padStart(2, '0')}`; }
  function montarRelogio() {
    const p = lugar('hall', 'n', .22, .3, .55); if (!p) return;
    const g = grupo(p.x, 0, p.z, p.ry);
    const madeira = mat(0x3a2414, 0x120804, .6);
    C.box(.55, 2.05, .32, madeira, 0, 1.025, 0, g); C.box(.62, .1, .36, madeira, 0, 2.1, 0, g);
    const cv = document.createElement('canvas'); cv.width = 128; cv.height = 128; const tex = descartar(new THREE.CanvasTexture(cv)); tex.colorSpace = THREE.SRGBColorSpace;
    const desenhar = () => { const c = cv.getContext('2d'), m = 20 * 60 + 47 + (F().l4hora || 0); c.fillStyle = '#d8cdb0'; c.beginPath(); c.arc(64, 64, 62, 0, 6.28); c.fill(); c.strokeStyle = '#2a1a10'; c.lineWidth = 3; c.stroke(); for (let i = 0; i < 12; i++) { const a = i / 12 * 6.28; c.fillStyle = '#2a1a10'; c.fillRect(64 + Math.sin(a) * 52 - 2, 64 - Math.cos(a) * 52 - 2, 4, 4); } const ah = ((m / 60) % 12) / 12 * 6.28, am = (m % 60) / 60 * 6.28; c.lineWidth = 5; c.beginPath(); c.moveTo(64, 64); c.lineTo(64 + Math.sin(ah) * 30, 64 - Math.cos(ah) * 30); c.stroke(); c.lineWidth = 3; c.beginPath(); c.moveTo(64, 64); c.lineTo(64 + Math.sin(am) * 46, 64 - Math.cos(am) * 46); c.stroke(); tex.needsUpdate = true; };
    desenhar();
    const face = new THREE.Mesh(new THREE.CircleGeometry(.2, 20), new THREE.MeshStandardMaterial({ map: tex, emissive: 0x2a2418, emissiveIntensity: .7 })); face.position.set(0, 1.72, .165); g.add(face);
    const pend = new THREE.Group(); pend.position.set(0, 1.45, .14); g.add(pend);
    C.box(.015, .7, .015, mat(0xb08a40, 0x302010), 0, -.35, 0, pend, false); const disco = C.cyl(.07, .07, .015, mat(0xb08a40, 0x403010, .8), 0, -.72, 0, 14, pend); disco.rotation.x = Math.PI / 2;
    C.addCollider(p.x - .35, p.x + .35, p.z - .35, p.z + .35);
    G.tick.push(() => { pend.rotation.z = (F().l4hora || 0) > 0 ? Math.sin(perf() * 2.6) * .22 : 0; });
    const trava = () => (F().l4hora || 0) >= 13;
    examinar(g, () => trava() ? `!O relógio marca ${horaTxt()}. O ponteiro travou.` : `Girar os ponteiros do relógio (${horaTxt()})`, () => {
      if (trava()) return;
      const h = F().l4hora || 0; F().l4hora = h === 0 ? 3 : h + 5; desenhar();
      som.tique({ x: p.x, y: 1.7, z: p.z }, 3, .09); C.emitNoise(p.x, p.z, 4, true);
      if (F().l4hora === 3) setTimeout(() => lia('O relógio voltou a andar com a minha mão.', true), 300);
      if (trava()) noveHoras(p);
    });
  }
  function noveHoras(p) {
    const s = S(); C.conquista('l4_hora');
    if (SFX.badaladas) SFX.badaladas(9); else som.sino(null);
    C.toast('[nove badaladas, fora de hora]');
    if (s.chapter === 2 && s.flags.energia && !s.done.procissao) { s.timers.procissao = Math.min(s.timers.procissao, 4); setTimeout(() => lia('Fui eu que chamei. Agora eles vêm. Esconde, Lia.'), 2400); }
    else if (s.chapter <= 1) { C.emitNoise(p.x, p.z, 40); setTimeout(() => lia('As nove badaladas. Todo mundo no prédio ouviu isso.'), 2400); }
    if (!F().l4amuletoDado) {
      F().l4amuletoDado = true;
      setTimeout(() => { F().l4amuleto = 1; SFX.pegar(); C.toast('O fundo do relógio abriu. Um amuleto de lata caiu no chão: a próxima Procissão machuca menos.'); C.renderInvMini(); }, 4200);
    }
  }
  // sapateira: descalça é mais silenciosa, mas o chão machuca
  function montarSapateira() {
    const s = S(), p = lugar('hall', 's', .82, .3, .65); if (!p) return;
    const g = grupo(p.x, 0, p.z, p.ry);
    C.box(.9, .5, .3, mat(0x4a3020, 0x140a04), 0, .25, 0, g); C.addCollider(p.x - .5, p.x + .5, p.z - .5, p.z + .5);
    const sap = new THREE.Group(); g.add(sap);
    for (const dx of [-.12, .12]) C.box(.1, .07, .24, mat(0x2a1a14, 0x0a0604), dx, .54, 0, sap);
    sap.visible = !!F().l4descalca;
    const it = examinar(g, () => F().l4descalca ? 'Calçar os sapatos de novo' : 'Tirar os sapatos (de sapato ele ouve)', () => {
      if (!F().l4descalca) {
        F().l4descalca = true; if (s.chapter <= 1) F().l4desc1 = true; sap.visible = true; C.SFX.papel && SFX.papel();
        C.toast('Descalça: os passos ficam bem mais baixos. O chão frio e os cacos não perdoam.');
        setTimeout(() => lia('As crianças andavam assim à noite. Agora eu entendo.', true), 900);
      } else { F().l4descalca = false; F().l4calcou = true; sap.visible = false; C.toast('Sapatos calçados.'); }
      C.renderInvMini();
    });
    Object.defineProperty(it, 'hold', { get: () => F().l4descalca ? 3 : 0, configurable: true });
    // no Capítulo II, os sapatos deixados aparecem arrumados no chão, apontando para a escada
    if (s.chapter >= 2 && F().l4descalca) {
      const esc2 = W.inter.find(i => { try { return /dormitórios|grade com cadeado/.test(i.label()); } catch (e) { return false; } });
      if (esc2) {
        const v = new THREE.Vector3(); esc2.obj.getWorldPosition(v);
        sap.visible = false; const a = Math.atan2(v.x - p.x, v.z - p.z), fx = p.x + Math.sin(p.ry) * .8, fz = p.z + Math.cos(p.ry) * .8;
        const ch = grupo(fx, 0, fz, a); for (const dx of [-.1, .1]) C.box(.1, .07, .24, mat(0x2a1a14, 0x0a0604), dx, .035, 0, ch);
        examinar(ch, '!Os seus sapatos. Alguém arrumou os dois, lado a lado, apontando para a escada.', () => {});
      }
    }
  }
  // máquina de escrever da diretoria
  function montarMaquina() {
    const p = lugar('diret', 's', .7, .45, .6); if (!p) return;
    const g = grupo(p.x, 0, p.z, p.ry);
    const mad = mat(0x3a2414, 0x100804);
    C.box(.7, .05, .5, mad, 0, .74, 0, g); for (const [dx, dz] of [[-.3, -.2], [.3, -.2], [-.3, .2], [.3, .2]]) C.box(.04, .72, .04, mad, dx, .36, dz, g, false);
    C.box(.38, .12, .28, mat(0x1a1a1a, 0x080808, .5, { metalness: .4 }), 0, .83, .02, g); C.box(.4, .04, .06, mat(0x222222, 0x080808), 0, .92, -.1, g);
    const folha = new THREE.Mesh(new THREE.PlaneGeometry(.22, .26), new THREE.MeshStandardMaterial({ color: 0xd8ccb0, emissive: 0x2a2418, emissiveIntensity: .8, side: THREE.DoubleSide })); folha.position.set(0, 1.04, -.1); folha.rotation.x = -.25; g.add(folha);
    C.addCollider(p.x - .4, p.x + .4, p.z - .4, p.z + .4);
    G.maq = { x: p.x, z: p.z };
    examinar(g, 'Datilografar na máquina de escrever', () => abrirMaquina());
  }
  function abrirMaquina() {
    const mq = G.maq, pos = { x: mq.x, y: 1, z: mq.z };
    const st = { linhas: (F().l4maqTexto || '').split('\n').slice(-6), atual: '', fila: [], n: 0, ruidoN: 0 };
    const render = () => { ov.innerHTML = `<h3>MÁQUINA DE ESCREVER</h3><pre>${st.linhas.map(l => esc(l)).join('\n')}\n${esc(st.atual)}<span style="opacity:.5">_</span></pre><small>digite · ENTER muda de linha · ESC sai · cada tecla faz barulho</small>`; };
    const tecla = e => {
      if (e.code === 'Escape') { fecharModo(); return; }
      if (st.fila.length) return; // a máquina está escrevendo sozinha
      let ch = null;
      if (e.code === 'Enter') { conferir(); st.linhas.push(st.atual); st.atual = ''; som.ding(pos); C.emitNoise(mq.x, mq.z, 5); }
      else if (e.code === 'Backspace') st.atual = st.atual.slice(0, -1);
      else if (e.code === 'Space') { conferir(); st.atual += ' '; }
      else if (e.key && e.key.length === 1 && /[\p{L}\d.,!?-]/u.test(e.key)) { ch = e.key.toUpperCase(); st.atual += ch; }
      else return;
      if (st.atual.length > 46) { st.linhas.push(st.atual); st.atual = ''; }
      st.n++; som.clac(pos); C.emitNoise(mq.x, mq.z, 2.4); C.marcarCausa('maquina');
      if (st.n % 14 === 0) { st.ruidoN++; som.ding(pos); C.emitNoise(mq.x, mq.z, 9 + st.ruidoN * 4); if (st.ruidoN === 2) C.toast('O sininho da máquina tocou de novo. Ele está ouvindo.'); }
      if (st.n === 40 && M.ativo) { atrair(mq.x, mq.z, 3, { forca: false }); }
      render();
    };
    function conferir() {
      const w = semAcento(st.atual.split(' ').pop() || ''); if (!w) return;
      const nome = semAcento((localStorage.getItem('hora-silencio-nome') || '').replace(/^"|"$/g, '').trim());
      let r = TXT.maquina[w];
      if (!r && nome && w === nome && nome !== 'LIA') r = TXT.maquina.ficha(nome);
      if (w === 'LIA' || (r && w === nome)) r = (w === 'LIA' ? TXT.maquina.LIA : r) + new Date().toLocaleDateString('pt-BR');
      if (!r) return;
      const vistos = F().l4maqVistas || (F().l4maqVistas = {}); vistos[w] = true;
      if (Object.keys(vistos).length >= 3) C.conquista('l4_maquina');
      st.linhas.push(st.atual); st.atual = '';
      st.fila = [...('   ' + r)];
      if (w === 'DAVI') setTimeout(() => { if (modo && modo.tipo === 'maquina') C.sub('davi', '(do outro lado da parede, muito baixo) Lia...'); }, 2600);
    }
    abrirModo({ tipo: 'maquina', render, tecla, tick(dt) {
      if (!st.fila.length) return;
      st.ft = (st.ft || 0) - dt; if (st.ft > 0) return; st.ft = .07 + Math.random() * .05;
      const c = st.fila.shift(); st.atual += c; som.clac(pos); C.emitNoise(mq.x, mq.z, 1.5);
      if (!st.fila.length) { st.linhas.push(st.atual); st.atual = ''; som.ding(pos); }
      render();
    }, fechar() { F().l4maqTexto = [...st.linhas, st.atual].filter(Boolean).slice(-6).join('\n'); } });
    if (!F().l4maqDica) { F().l4maqDica = true; setTimeout(() => lia('Uma folha ainda presa no rolo. Dá pra escrever... mas faz barulho.', true), 400); }
  }
  // telefone interno da diretoria: ramais
  const RAMAIS = { '03': 'cozinha', '05': 'enferm', '07': 'lavand', '11': 'biblio', '13': 'refeit', '15': 'maq' };
  function montarTelefone() {
    const p = lugar('diret', 'l', .25, .5); if (!p) return;
    const g = grupo(p.wx - Math.sin(p.ry) * .05, 1.35, p.wz - Math.cos(p.ry) * .05, p.ry);
    C.box(.2, .26, .08, mat(0x5a1a12, 0x200806, .6), 0, 0, .04, g); C.cyl(.06, .06, .012, mat(0xd8d0c0, 0x303030, .5), 0, -.02, .085, 14, g).rotation.x = Math.PI / 2;
    const lista = new THREE.Mesh(new THREE.PlaneGeometry(.3, .4), new THREE.MeshStandardMaterial({ map: descartar(C.textoTex(['RAMAIS', '03 cozinha', '05 enfermaria', '07 lavanderia', '11 biblioteca', '13 refeitório', '15 máquinas', '09 capela', '00 NÃO DISCAR'], { w: 256, h: 340, fundo: '#d0c4a4', cor: '#2a1a10', tam: 24, manchas: 5 })), roughness: 1 }));
    lista.position.set(.32, .05, .02); g.add(lista);
    G.tel = { x: p.x, z: p.z };
    examinar(g, () => S().flags.energia ? 'Discar no telefone interno (ramais)' : 'Discar no telefone interno (ramais) · sem energia, só o disco gira', () => abrirDisco());
    examinar(lista, 'Ler a lista de ramais', () => C.abrirNotaUI('Lista de ramais (datilografada)', TXT.ramais));
  }
  function abrirDisco() {
    const st = { d: '' };
    const render = () => { ov.innerHTML = `<h3>TELEFONE INTERNO</h3><div class="disco">${esc((st.d + '__').slice(0, 2))}</div><small>números 0 a 9 giram o disco (o disco faz barulho) · ESC desliga</small>`; };
    abrirModo({ tipo: 'disco', render, tecla(e) {
      if (e.code === 'Escape') { fecharModo(); return; }
      const m = /^(Digit|Numpad)(\d)$/.exec(e.code); if (!m) return;
      const n = +m[2]; st.d += m[2]; som.tique({ x: G.tel.x, y: 1.3, z: G.tel.z }, n || 10, .06); C.emitNoise(G.tel.x, G.tel.z, 2.5); render();
      if (st.d.length >= 2) { const d = st.d; setTimeout(() => { fecharModo(); discar(d); }, 650); }
    } });
  }
  function discar(d) {
    const s = S(), cap = s.chapter;
    if (!s.flags.energia) { C.toast('A linha está muda. Sem energia, o telefone interno não toca.'); return; }
    if (d === '00') { som.respira(null); C.sub('lia', '(no fone, a sua própria voz, chiando) ...Seu Joaquim? Cheguei no portão. O cadeado tá aberto. Eu vou entrar.', true); setTimeout(() => lia('Essa era eu. Hoje. Chegando.'), 5200); C.conquista('l4_ramal'); return; }
    if (d === '09') { C.sub('celeste', '(no fone, muito longe, rezando) Ave Maria, cheia de graça, o Senhor é convosco, bendita sois vós entre as mulh—', true); setTimeout(() => C.toast('[a linha caiu]'), 6000); return; }
    if (d === '26') { som.respira(null); C.toast('[alguém respira do outro lado. Uma criança.]'); setTimeout(() => { if (G && G.tel && W.mapa === 'terreo') { tocarSala(G.tel.x, G.tel.z, 8); C.toast('[o telefone da diretoria está tocando]'); } }, 20000); return; }
    if (d === '37') {
      if (F().l4r37) { C.toast('Todos os ramais estão ocupados.'); return; }
      F().l4r37 = true; for (const sid of Object.values(RAMAIS)) { const r = C.SALA(sid); if (r) G.toques.push({ x: (r.x0 + r.x1) / 2, z: (r.z0 + r.z1) / 2, t: 20, cd: 0, mudo: true }); }
      C.toast('[todos os telefones do prédio tocam ao mesmo tempo]');
      if (M.ativo && !ocupado()) { M.path = []; M.state = 'procura'; M.searchT = 22; M.wait = 20; G.giraT = 20; G.isca = null; }
      setTimeout(() => { if (G && G.tel && M.ativo) atrair(G.tel.x, G.tel.z, 4, { forca: true }); }, 20000);
      return;
    }
    const sid = RAMAIS[d];
    if (!sid) { C.toast('Ninguém atende.'); return; }
    const k = capF('ram' + d);
    if (F()[k]) { C.toast('Chama, chama... e ninguém vem. Ele já conhece esse toque.'); return; }
    F()[k] = true;
    const r = C.SALA(sid); if (!r) return;
    const x = (r.x0 + r.x1) / 2, z = (r.z0 + r.z1) / 2;
    tocarSala(x, z, 9);
    C.toast(`[lá longe, o telefone da ${r.nome.toLowerCase()} começa a tocar]`);
    const VOZES = { '11': ['voz', '(no fone, soletrando baixinho) ...s-i-l-ê-n-c-i-o... silêncio...'], '13': ['voz', '(arrastar de cadeiras e um pedido de prato pelo fone) ...mais um, mais um, falta sempre um...'], '15': ['moacir', '(o gerador tosse do outro lado) ...liga... desliga... liga...'] };
    if (VOZES[d]) setTimeout(() => { if (W.mapa === 'terreo') C.sub(VOZES[d][0], VOZES[d][1], true); }, 1600);
    if (!F().l4ramalDica) { F().l4ramalDica = true; setTimeout(() => lia('Ele vai atender. Ele sempre atendia.', true), 1800); }
  }
  function tocarSala(x, z, dur) { G.toques.push({ x, z, t: dur, cd: 0 }); atrair(x, z, 5, { aoChegar: () => { const t = G.toques.find(q => q.x === x && q.z === z); if (t) t.t = Math.min(t.t, 1); } }); }
  // forno: bolo de doze velas
  function montarForno() {
    const p = lugar('cozinha', 's', .3, .4, .65); if (!p) return;
    const g = grupo(p.x, 0, p.z, p.ry), ferro = mat(0x1e1c1a, 0x080606, .5, { metalness: .5 });
    C.box(.9, .9, .6, ferro, 0, .45, 0, g); const porta = new THREE.Group(); porta.position.set(-.35, .45, .31); g.add(porta); C.box(.7, .5, .03, ferro, .35, 0, 0, porta);
    C.addCollider(p.x - .5, p.x + .5, p.z - .5, p.z + .5);
    const bolo = new THREE.Group(); bolo.position.set(0, .3, .05); g.add(bolo); bolo.visible = false;
    C.cyl(.16, .16, .1, mat(0x5a3a22, 0x1a0c06, .7), 0, .05, 0, 16, bolo);
    const chamas = [];
    for (let i = 0; i < 12; i++) { const a = i / 12 * 6.28; C.cyl(.006, .006, .07, mat(0xe8e0d0, 0x302820), Math.cos(a) * .12, .135, Math.sin(a) * .12, 4, bolo); const ch = new THREE.Mesh(new THREE.SphereGeometry(.009, 5, 4), new THREE.MeshBasicMaterial({ color: 0xffc060 })); ch.scale.y = 2; ch.position.set(Math.cos(a) * .12, .18, Math.sin(a) * .12); ch.visible = false; bolo.add(ch); chamas.push(ch); }
    G.bolo = { p, porta, bolo, chamas, aceso: false, t: 0, ar: 0, apagando: -1 };
    examinar(g, () => F().l4bolo ? '!O forno de ferro, aberto. Um bolo seco e doze velas apagadas.' : G.bolo.aceso ? '!Doze velas acesas. (prenda o ar com ESPAÇO e solte para soprar)' : 'Abrir o forno de ferro', () => {
      if (F().l4bolo || G.bolo.aceso) return;
      porta.rotation.y = -1.3; bolo.visible = true; SFX.rangido && SFX.rangido(p.x, 1, p.z, .8, 'sfx', true); C.emitNoise(p.x, p.z, 4);
      setTimeout(() => { if (!G.bolo || G.bolo.bolo !== bolo) return; G.bolo.aceso = true; G.bolo.t = 20; chamas.forEach((c, i) => setTimeout(() => { c.visible = true; }, i * 60)); C.toast('As doze velas acenderam sozinhas.'); lia('Doze velas. Ele fez doze anos aqui dentro.', true); }, 700);
    });
    if (F().l4bolo) { porta.rotation.y = -1.3; bolo.visible = true; }
  }
  function updateBolo(dt) {
    const b = G.bolo; if (!b || !b.aceso) return;
    if (b.apagando >= 0) { b.apagando -= dt; const n = Math.ceil(clamp(b.apagando / 3, 0, 1) * 12); b.chamas.forEach((c, i) => { c.visible = i < n; }); if (b.apagando <= 0) { b.aceso = false; } return; }
    b.t -= dt;
    for (const c of b.chamas) c.scale.y = 2 + Math.sin(perf() * 9 + c.position.x * 40) * .4;
    const perto = dist(b.p.x, b.p.z) < 2.3;
    if (perto && keys.Space) { b.ar += dt; hud.textContent = b.ar >= 3 ? 'solte para soprar' : `enchendo o peito... ${Math.min(99, Math.round(b.ar / 3 * 100))}%`; }
    else if (b.ar > 0) {
      hud.textContent = '';
      if (b.ar >= 3 && perto) {
        b.aceso = false; F().l4bolo = true; b.chamas.forEach(c => { c.visible = false; }); C.conquista('l4_bolo');
        const s = S(); s.health = Math.min(100, s.health + 30); C.toast('Você soprou as doze velas de uma vez.');
        setTimeout(() => { som.parabens({ x: b.p.x + Math.sin(b.p.ry) * -2.5, y: 1.2, z: b.p.z + Math.cos(b.p.ry) * -2.5 }); C.toast('[do outro lado da parede, uma voz de criança desafinada canta parabéns... e para no meio]'); }, 900);
        setTimeout(() => lia('Parabéns, Davi. Eu nunca esqueci o dia.'), 6500);
        return;
      }
      b.ar = 0;
    }
    if (b.t <= 0) { b.apagando = 3; C.toast('As velas estão apagando sozinhas, uma por uma, de trás para frente.'); }
  }
  // duto atrás do fogão até a casa de máquinas (e de volta)
  function montarDuto() {
    const a = lugar('cozinha', 'o', .5, .2), b = lugar('maq', 'l', .5, .2); if (!a || !b) return;
    const grade = (p, destino, nome) => {
      const g = grupo(p.wx + Math.sin(p.ry) * .01, .32, p.wz + Math.cos(p.ry) * .01, p.ry);
      const m = new THREE.Mesh(new THREE.PlaneGeometry(.6, .45), matTex(texCanvas(128, 96, (c, w, h) => { c.fillStyle = '#1a1816'; c.fillRect(0, 0, w, h); c.strokeStyle = '#6a6458'; c.lineWidth = 5; for (let x = 8; x < w; x += 16) { c.beginPath(); c.moveTo(x, 4); c.lineTo(x, h - 4); c.stroke(); } c.strokeRect(3, 3, w - 6, h - 6); }), { transparent: false }));
      g.add(m);
      examinar(g, () => P.crouch ? `Entrar no duto (sai na ${nome}) · faz um estrondo de lata` : '!Uma grade solta, rente ao chão. Só agachada.', () => {
        if (!P.crouch) return;
        som.lata({ x: p.x, y: .4, z: p.z }, .7); C.emitNoise(p.x, p.z, 16); C.marcarCausa('duto');
        C.fade(true, () => { P.pos.set(destino.x + Math.sin(destino.ry) * .45, 0, destino.z + Math.cos(destino.ry) * .45); P.yaw = destino.ry + Math.PI; P.room = C.roomAt(P.pos.x, P.pos.z); som.lata({ x: destino.x, y: .4, z: destino.z }, .8); C.emitNoise(destino.x, destino.z, 16); C.fade(false); if (!F().l4duto) { F().l4duto = true; lia('Dentro da parede tudo ecoa. O prédio inteiro ouviu.', true); } }, 900);
      });
    };
    grade(a, b, 'casa de máquinas'); grade(b, a, 'cozinha');
  }
  // gaveta trancada da enfermaria e a lâmpada que pisca o número
  function codLampada() { const s = S(), h = (s.code || [1, 2, 3, 4]).join('') + (s.quadro || [5, 6, 7]).join(''); let n = 0; for (const c of h) n = (n * 31 + c.charCodeAt(0)) % 99991; return [1 + n % 9, 1 + (n >> 3) % 9, 1 + (n >> 6) % 9]; }
  function montarGaveta() {
    const p = lugar('enferm', 'n', .8, .3, .55); if (!p) return;
    const g = grupo(p.x, 0, p.z, p.ry);
    C.box(.55, .85, .4, mat(0xd8d8d0, 0x202020, .5), 0, .425, 0, g); C.box(.45, .18, .02, mat(0xb8b8b0, 0x181818), 0, .62, .21, g); C.box(.08, .03, .02, MAT_METAL(), 0, .62, .225, g);
    C.addCollider(p.x - .35, p.x + .35, p.z - .35, p.z + .35);
    examinar(g, () => F().l4gaveta ? '!A gaveta aberta. Vazia agora.' : 'Abrir a gaveta trancada (teclado de três números)', () => {
      if (F().l4gaveta) return;
      C.abrirTeclado('GAVETA DA ENFERMARIA', codLampada().join(''), () => {
        F().l4gaveta = true; F().l4adrenalina = S().chapter; SFX.pegar(); C.conquista('l4_lampada'); C.renderInvMini();
        C.toast('Uma ampola de adrenalina. Se ele te pegar de vez neste capítulo, você levanta.');
        setTimeout(() => lia('O número da lâmpada. Alguém deixou isso piscando pra mim.', true), 900);
      });
    });
  }
  function MAT_METAL() { return mat(0x8a8a88, 0x202020, .5, { metalness: .6 }); }
  function montarLampada() {
    const r = C.SALA('ce'); if (!r) return;
    const x = 21.5, z = (r.z0 + r.z1) / 2;
    C.box(.01, .5, .01, mat(0x111111), x, 2.95, z, W.grupo, false);
    const bulbo = new THREE.Mesh(new THREE.SphereGeometry(.07, 8, 6), new THREE.MeshStandardMaterial({ color: 0x332e25, emissive: 0xffc070, emissiveIntensity: 0 })); bulbo.position.set(x, 2.65, z); W.grupo.add(bulbo);
    const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: C.texHalo, color: 0xffd090, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending })); halo.scale.set(.9, .9, 1); halo.position.copy(bulbo.position); W.grupo.add(halo);
    G.lamp = { bulbo, halo, x, z, seq: [], t: 0 };
    const cod = codLampada(), devagar = !!OPT.vFlash, on = devagar ? .55 : .22, off = devagar ? .55 : .25;
    for (const n of cod) { for (let i = 0; i < n; i++) G.lamp.seq.push([1, on], [0, off]); G.lamp.seq.push([0, 1.3]); }
    G.lamp.seq.push([0, 2.6]); G.lamp.dur = G.lamp.seq.reduce((a, b) => a + b[1], 0); G.lamp.devagar = devagar;
  }
  function updateLampada(dt) {
    const L = G.lamp; if (!L) return;
    L.t = (L.t + dt) % L.dur; let acc = 0, v = 0;
    for (const [on, d] of L.seq) { if (L.t < acc + d) { v = on; break; } acc += d; }
    L.bulbo.material.emissiveIntensity = v ? 2 : 0; L.halo.material.opacity = v ? (L.devagar ? .35 : .8) : 0;
    const fw = new THREE.Vector3(); camera.getWorldDirection(fw);
    const to = new THREE.Vector3(L.x, 2.65, L.z).sub(camera.position), d = to.length(); to.normalize();
    if (d < 11 && fw.dot(to) > .96) { G.olharLamp += dt; if (G.olharLamp > 6 && !F().l4lampDita) { F().l4lampDita = true; lia('Isso não tá piscando à toa. É um número.'); } } else G.olharLamp = Math.max(0, G.olharLamp - dt * .5);
  }
  // chuveiro do banheiro: água que cobre os passos e o espelho que embaça
  function montarChuveiro() {
    const p = lugar('banh', 's', .3, .5); if (!p) return;
    const g = grupo(p.wx, 0, p.wz, p.ry), metal = MAT_METAL();
    C.cyl(.015, .015, 1.3, metal, 0, 1.6, .02, 6, g); const cab = C.cyl(.08, .05, .05, metal, 0, 2.25, .1, 10, g); cab.rotation.x = -.6; const reg = C.cyl(.04, .04, .03, mat(0xc0a060, 0x302010, .7), .15, 1.2, .03, 8, g); reg.rotation.x = Math.PI / 2;
    const jato = new THREE.Mesh(new THREE.CylinderGeometry(.06, .2, 2.1, 10, 1, true), new THREE.MeshBasicMaterial({ color: 0xa8c0c8, transparent: true, opacity: .18, depthWrite: false })); jato.position.set(0, 1.12, .25); g.add(jato); jato.visible = false;
    G.chuv = { x: p.x, z: p.z, jato };
    examinar(g, () => G.chuva ? '!A água corre. O barulho cobre tudo.' : 'Abrir o chuveiro (barulho de água)', () => {
      if (G.chuva) return;
      const k = capF('chuv'), n = (F()[k] || 0) + 1; F()[k] = n;
      jato.visible = true; SFX.rangido && SFX.rangido(p.x, 1.2, p.z, .6, 'sfx', true);
      G.chuva = { t: 40, x: p.x, z: p.z, loop: som.loop({ x: p.x, y: 1.5, z: p.z }, 'bandpass', 2800, .1, .5), espelhoT: 0 };
      G.loops.push(G.chuva.loop);
      if (n === 1) { C.emitNoise(p.x, p.z, 22); atrair(p.x, p.z, 10, { aoChegar: () => setTimeout(() => fecharChuveiro(true), 5000) }); setTimeout(() => lia('Água correndo. Ninguém anda em silêncio perto disso... nem ouve.', true), 1200); }
      else { C.emitNoise(P.pos.x, P.pos.z, 30, true); C.toast('Ele não foi até o chuveiro. Veio direto até você.'); }
    });
    const pe = lugar('banh', 'n', .5, .3); if (!pe) return;
    const ge = grupo(pe.wx + Math.sin(pe.ry) * .01, 1.5, pe.wz + Math.cos(pe.ry) * .01, pe.ry);
    C.box(.62, .82, .02, mat(0x2a2620, 0x0a0806), 0, 0, -.005, ge, false);
    const vidro = new THREE.Mesh(new THREE.PlaneGeometry(.56, .76), new THREE.MeshStandardMaterial({ color: 0x8a9496, metalness: .9, roughness: .15, emissive: 0x101416, emissiveIntensity: .6 })); vidro.position.z = .01; ge.add(vidro);
    const cv = document.createElement('canvas'); cv.width = 128; cv.height = 160; const tex = descartar(new THREE.CanvasTexture(cv));
    const vapor = new THREE.Mesh(new THREE.PlaneGeometry(.56, .76), new THREE.MeshBasicMaterial({ map: tex, transparent: true, opacity: 0, depthWrite: false })); vapor.position.z = .015; ge.add(vapor);
    G.espelho = { ge, cv, tex, vapor, ry: pe.ry, x: pe.wx, z: pe.wz, t: 0 };
  }
  function fecharChuveiro(porEle) {
    const c = G.chuva; if (!c) return; c.loop && c.loop.parar(); G.chuva = null; if (G.chuv) G.chuv.jato.visible = false;
    if (SFX.rangido) SFX.rangido(c.x, 1.2, c.z, .9, 'sfx', true);
    if (porEle) C.toast('[o registro range: alguém fechou o chuveiro]');
  }
  function updateChuva(dt) {
    const c = G.chuva; if (!c) return;
    c.t -= dt; if (c.t <= 0) { fecharChuveiro(false); return; }
    c.espelhoT += dt;
    const e = G.espelho;
    if (e && c.espelhoT > 5 && !e.feito) {
      e.feito = true; e.t = 60;
      const alvo = (G.segredos || []).filter(s => !s.feito()).sort((a, b) => Math.hypot(a.x - e.x, a.z - e.z) - Math.hypot(b.x - e.x, b.z - e.z))[0];
      const g = e.cv.getContext('2d'); g.clearRect(0, 0, 128, 160); g.fillStyle = 'rgba(230,236,238,.85)'; g.fillRect(0, 0, 128, 160);
      g.globalCompositeOperation = 'destination-out'; g.lineWidth = 9; g.lineCap = 'round'; g.strokeStyle = '#000';
      if (alvo) { const rx = Math.cos(e.ry), rz = -Math.sin(e.ry), dx = alvo.x - e.x, dz = alvo.z - e.z, lado = dx * rx + dz * rz; const s = lado >= 0 ? 1 : -1; g.beginPath(); g.moveTo(64 - 40 * s, 80); g.lineTo(64 + 40 * s, 80); g.moveTo(64 + 40 * s, 80); g.lineTo(64 + 18 * s, 58); g.moveTo(64 + 40 * s, 80); g.lineTo(64 + 18 * s, 102); g.stroke(); }
      else { g.font = '40px Georgia'; g.fillText('LIA', 30, 95); }
      g.globalCompositeOperation = 'source-over'; e.tex.needsUpdate = true;
      setTimeout(() => lia('O espelho embaçou... tem uma seta desenhada com o dedo.', true), 400);
    }
  }
  function updateEspelho(dt) { const e = G.espelho; if (!e || !e.t) return; e.t = Math.max(0, e.t - dt); e.vapor.material.opacity = Math.min(1, e.t / 6) * .9; }
  // centrífuga da lavanderia
  function montarCentrifuga() {
    const p = lugar('lavand', 'l', .6, .6, .7); if (!p) return;
    const g = grupo(p.x, 0, p.z, p.ry), ferro = mat(0x3a3e40, 0x0c0e10, .6, { metalness: .5 });
    C.box(.95, 1, .95, ferro, 0, .5, 0, g); const tampa = C.cyl(.36, .36, .05, mat(0x5a5e60, 0x101214, .6, { metalness: .6 }), 0, 1.03, 0, 16, g);
    const alav = C.box(.05, .4, .05, mat(0x8a2010, 0x300806, .8), .52, 1.05, 0, g); alav.rotation.z = -.3;
    C.addCollider(p.x - .55, p.x + .55, p.z - .55, p.z + .55);
    examinar(g, () => G.centri ? '!A centrífuga bate e ronca.' : F()[capF('centri')] ? '!A centrífuga esfriou. A alavanca emperrou.' : 'Puxar a alavanca da centrífuga (barulho enorme)', () => {
      if (G.centri || F()[capF('centri')]) return;
      F()[capF('centri')] = true; alav.rotation.z = .4;
      G.centri = { t: 20, x: p.x, z: p.z, g, tampa, cd: 0, loop: som.loop({ x: p.x, y: .8, z: p.z }, 'lowpass', 160, .35, 2), riu: false };
      G.loops.push(G.centri.loop);
      if (M.ativo) atrair(p.x, p.z, 4, { forca: true, ouvido: 1, aoChegar: () => desligarCentri(true) });
    });
  }
  function desligarCentri(porEle) {
    const c = G.centri; if (!c) return; c.loop && c.loop.parar(); G.centri = null; c.g.rotation.z = 0;
    if (porEle) { C.toast('[a máquina para de uma vez: ele desligou com a mão]'); if (P.room && C.roomAt(c.x, c.z) === P.room && !S().hidden && M.ativo) { M.state = 'investiga'; M.ultimo = P.pos.clone(); C.planejar(M, P.pos.x, P.pos.z); M.wait = 0; C.subPequeno('inspetor', 'Quem ligou a máquina?'); } }
  }
  function updateCentri(dt) {
    const c = G.centri; if (!c) return;
    c.t -= dt; c.cd -= dt;
    c.g.rotation.z = Math.sin(perf() * 19) * .012; c.tampa.rotation.y += dt * 8;
    if (c.cd <= 0) { c.cd = 1; C.emitNoise(c.x, c.z, 30); if (c.loop) c.loop.g.gain.value = .35 + Math.sin(perf() * 6.28 * 3) * .1; }
    if (!c.riu && c.t < 16 && M.ativo && M.state === 'investiga') { c.riu = true; C.subPequeno('lia', '(rindo de nervoso) Funcionou.'); }
    if (c.t <= 0) desligarCentri(false);
  }
  // carteira D.M. da sala de aula: a folha de limão
  function montarCarteira() {
    const p = lugar('aula', 's', .12, .6); if (!p) return;
    const g = grupo(p.x, 0, p.z, p.ry), mad = mat(0x5a3a20, 0x140a04);
    C.box(.6, .04, .42, mad, 0, .7, 0, g); for (const [dx, dz] of [[-.26, -.18], [.26, -.18], [-.26, .18], [.26, .18]]) C.box(.03, .7, .03, MAT_METAL(), dx, .35, dz, g, false);
    const tampo = new THREE.Mesh(new THREE.PlaneGeometry(.5, .34), matTex(escrita(['D.M.'], 'rgba(30,20,10,.7)', 256, 160, 60))); tampo.rotation.x = -Math.PI / 2; tampo.position.y = .725; g.add(tampo);
    const folha = new THREE.Mesh(new THREE.PlaneGeometry(.2, .26), new THREE.MeshStandardMaterial({ color: 0xe8e0c8, emissive: 0x302a20, emissiveIntensity: .8 })); folha.rotation.x = -Math.PI / 2; folha.position.set(.1, .73, 0); g.add(folha);
    folha.visible = !bolso().folha && !F().l4mapa;
    examinar(g, () => folha.visible ? 'Pegar a folha em branco da carteira D.M.' : '!Uma carteira riscada: D.M.', () => {
      if (!folha.visible) return; folha.visible = false; SFX.papel(); dar('folha');
      setTimeout(() => lia('Uma folha em branco... cheirando a limão. A gente fazia tinta invisível assim.', true), 700);
    });
  }
  function luzPerto() {
    for (const L of W.lampadas) if (L.ligada && !L.estourada && Math.hypot(L.x - P.pos.x, L.z - P.pos.z) < 2) return true;
    let achou = false;
    W.grupo.traverse(o => { if (!achou && o.isPointLight && o.userData.vela && !o.userData.apagada && o.intensity > .2) { const v = new THREE.Vector3(); o.getWorldPosition(v); if (Math.hypot(v.x - P.pos.x, v.z - P.pos.z) < 1.8) achou = true; } });
    if (achou) return true;
    return !!(G.bolo && G.bolo.aceso && dist(G.bolo.p.x, G.bolo.p.z) < 2);
  }
  function updateLimao(dt) {
    if (!bolso().folha || selecionado() !== 'folha') { if (G.limaoT) { G.limaoT = 0; hud.textContent = ''; } return; }
    if (!keys.KeyU) { if (G.limaoT > 0) { G.limaoT = 0; hud.textContent = ''; } return; }
    if (!luzPerto()) { hud.textContent = 'a folha precisa de calor: chegue perto de uma luz acesa'; return; }
    if (Math.hypot(P.vx || 0, P.vz || 0) > .3) { G.limaoT = 0; hud.textContent = 'parada, com a folha perto da luz'; return; }
    if (M.ativo && M.pos.distanceTo(P.pos) < 6) { G.limaoT = 0; hud.textContent = ''; keys.KeyU = false; C.toast('A folha caiu da sua mão. Ele está perto.'); SFX.papel(); return; }
    G.limaoT += dt; hud.textContent = `a folha escurece devagar... ${Math.min(99, Math.round(G.limaoT / 4 * 100))}%`;
    if (G.limaoT >= 4) { G.limaoT = 0; hud.textContent = ''; keys.KeyU = false; tirar('folha'); F().l4mapa = true; C.abrirNotaUI(TXT.mapaLimao.titulo, TXT.mapaLimao.texto); }
  }
  // tijolo solto no muro da frente: a lata do tesouro
  function montarTijolo() {
    const r = C.SALA('hall'); if (!r) return;
    const x = 3.8, z = r.z1 + .02;
    const g = grupo(x, .22, z, 0);
    const tij = new THREE.Mesh(new THREE.PlaneGeometry(.26, .1), new THREE.MeshStandardMaterial({ color: 0x7a3a24, emissive: 0x1a0804, emissiveIntensity: .5, roughness: 1 })); g.add(tij);
    const giz = new THREE.Mesh(new THREE.PlaneGeometry(.14, .14), matTex(escrita(['X'], 'rgba(225,220,205,.7)', 64, 64, 48))); giz.position.set(0, .15, .002); g.add(giz);
    examinar(g, () => F().l4lata ? '!O buraco do tijolo, vazio.' : P.crouch ? 'Puxar o tijolo solto' : '!Um tijolo meio solto, rente ao chão. Um X de giz por cima.', () => {
      if (F().l4lata || !P.crouch) return;
      F().l4lata = true; tij.position.z = .12; som.lata({ x, y: .3, z }, .25); C.emitNoise(x, z, 3, true);
      dar('fita', 1, true); C.abrirNotaUI('Lata de biscoito, enferrujada', 'Dentro: sete bolinhas de gude, um botão de farda e uma fita cassete com etiqueta escrita à mão:\n\nSINO — NÃO GASTAR\n\n(Fita do sino no bolso. Toque perto dele: a cabeça dele desliga. Só uma vez.)');
      if (F().l4mapa) C.conquista('l4_tesouro');
    });
    G.segredos = G.segredos || []; G.segredos.push({ x, z, feito: () => !!F().l4lata });
  }
  // bolinha de gude que rola pelo piso torto do corredor oeste
  function montarGude() {
    const r = C.SALA('cw'); if (!r || F().l4gude) return;
    const m = new THREE.Mesh(new THREE.SphereGeometry(.035, 10, 8), new THREE.MeshStandardMaterial({ color: 0x3a7ab0, emissive: 0x0a2040, emissiveIntensity: 1, roughness: .1, metalness: .2 }));
    const z = (r.z0 + r.z1) / 2 + .7; m.position.set(-15.5, .035, z); W.grupo.add(m);
    G.gude = { m, v: 0, alvoX: r.x0 + .35, z, fim: false, somT: 0 };
    const tampa = new THREE.Mesh(new THREE.PlaneGeometry(.3, .22), new THREE.MeshStandardMaterial({ color: 0x4a3020, emissive: 0x140a04, emissiveIntensity: .6 })); tampa.rotation.x = -Math.PI / 2; tampa.position.set(r.x0 + .35, .004, z); W.grupo.add(tampa);
    const it = examinar(tampa, () => !G.gude.fim ? '!' : P.crouch ? 'Abrir o alçapão pequeno no rodapé' : '!Um alçapão pequeno no rodapé. Só agachada.', () => {
      if (!G.gude.fim || !P.crouch || F().l4gude) return;
      F().l4gude = true; tampa.rotation.z = .8; S().inv.pilhas++; SFX.pegar(); C.renderInvMini(); C.toast('Dentro do alçapão: uma pilha, enrolada num papel de bala.');
    });
    it.on = () => !!G.gude && G.gude.fim && !F().l4gude;
  }
  function updateGude(dt) {
    const b = G.gude; if (!b || b.fim) return;
    if (b.v === 0 && Math.hypot(P.pos.x - b.m.position.x, P.pos.z - b.m.position.z) < .5 && Math.hypot(P.vx || 0, P.vz || 0) > .5) { b.v = 3.2; C.toast('[você chutou alguma coisa pequena: ela rola sozinha pelo piso torto]'); }
    if (b.v <= 0) return;
    b.m.position.x -= b.v * dt; b.m.rotation.z += b.v * dt / .035; b.v = Math.max(.6, b.v - dt * .12);
    b.somT -= dt; if (b.somT <= 0) { b.somT = .45; som.rolar({ x: b.m.position.x, y: .1, z: b.z }); C.emitNoise(b.m.position.x, b.z, 5); }
    if (b.m.position.x <= b.alvoX + .1) { b.m.position.x = b.alvoX + .1; b.v = 0; b.fim = true; som.tique({ x: b.m.position.x, y: .1, z: b.z }, 2, .12); C.toast('[a bolinha bateu no rodapé, lá no fim do corredor]'); }
  }
  // atalho de quem já voltou: tijolo atrás do balcão até a copa (a partir da segunda noite com o Cap. I completo)
  function montarAtalhoBalcao() {
    const o = ls.get(); if (!o.cap1 || o.cap1 >= (F().l4noite || 0)) return;
    const a = lugar('hall', 'n', .62, .2), b = lugar('copa', 's', .5, .3); if (!a || !b) return;
    const g = grupo(a.wx + Math.sin(a.ry) * .01, .3, a.wz + Math.cos(a.ry) * .01, a.ry);
    g.add(new THREE.Mesh(new THREE.PlaneGeometry(.5, .4), new THREE.MeshStandardMaterial({ color: 0x5a2a18, emissive: 0x140804, emissiveIntensity: .5, roughness: 1 })));
    const d = new THREE.Mesh(new THREE.PlaneGeometry(.18, .18), matTex(escrita(['D'], 'rgba(225,220,205,.75)', 64, 64, 50))); d.position.set(0, .3, .002); g.add(d);
    examinar(g, () => P.crouch ? 'Empurrar o tijolo e passar pelo buraco até a copa' : '!Um tijolo frouxo atrás do balcão. Você lembra dele. Agachada.', () => {
      if (!P.crouch) return; C.emitNoise(a.x, a.z, 6, true); som.chocalho({ x: a.x, y: .3, z: a.z });
      C.fade(true, () => { P.pos.set(b.x, 0, b.z); P.yaw = b.ry + Math.PI; P.room = C.roomAt(b.x, b.z); C.emitNoise(b.x, b.z, 6); C.fade(false); lia('Eu lembrava desse buraco. Eu já fiz isso antes.', true); }, 900);
    });
  }

  // ------------------------------------------------ andar de cima
  function montarSuperior() {
    const s = S();
    // baú da sala de brinquedos: câmera instantânea
    const pb = lugar('brinq', 'l', .3, .45);
    if (pb) {
      const g = grupo(pb.x, 0, pb.z, pb.ry), mad = mat(0x5a3418, 0x180a04, .6);
      C.box(.8, .42, .45, mad, 0, .21, 0, g); const tampa = C.box(.82, .06, .47, mad, 0, .45, 0, g);
      examinar(g, () => F().l4bau ? '!O baú de brinquedos, aberto. Bonecos sem cabeça.' : 'Abrir o baú de brinquedos', () => {
        if (F().l4bau) return; F().l4bau = true; tampa.rotation.x = -1; tampa.position.z = -.2; tampa.position.y = .6; SFX.rangido && SFX.rangido(pb.x, .5, pb.z, .7, 'sfx', true); C.emitNoise(pb.x, pb.z, 4);
        dar('camera', 3); setTimeout(() => lia('Uma câmera instantânea. Três fotos no filme. O flash vai acordar o prédio.', true), 800);
      });
    }
    // papel de bala vermelho
    const pc = lugar('brinq', 's', .3, .5);
    if (pc && !bolso().celofane) {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(.12, .09), new THREE.MeshStandardMaterial({ color: 0xd02020, emissive: 0x500808, emissiveIntensity: 1, transparent: true, opacity: .85, side: THREE.DoubleSide, roughness: .2 }));
      m.rotation.x = -Math.PI / 2; m.position.set(pc.x, .006, pc.z); W.grupo.add(m);
      const it = examinar(m, 'Pegar o papel de bala vermelho', () => { m.visible = false; SFX.papel(); dar('celofane'); setTimeout(() => lia('Celofane vermelho. A gente punha na lanterna pra ler os bilhetes do clube.', true), 700); });
      it.on = () => m.visible;
    }
    // soldadinho de corda
    const ps = lugar('brinq', 'n', .55, .5);
    if (ps && !bolso().soldado && !F().l4soldadoUsado) {
      const g = soldadinho(); g.position.set(ps.x, 0, ps.z); W.grupo.add(g);
      const it = examinar(g, 'Pegar o soldadinho de corda', () => { g.visible = false; SFX.pegar(); dar('soldado'); });
      it.on = () => g.visible;
    }
    // escritas que só a luz vermelha mostra
    const n0 = (s.code || [7])[0];
    for (const [sid, lado, t, txt] of [['corr', 'o', .3, TXT.vermelho[0]], ['brinq', 'o', .5, TXT.vermelho[1].replace('{n}', n0)], ['corr', 'l', .7, TXT.vermelho[2]]]) {
      const p = lugar(sid, lado, t, .5); if (!p) continue;
      const m = new THREE.Mesh(new THREE.PlaneGeometry(1.4, .7), matTex(escrita([txt], 'rgba(255,240,230,.95)', 640, 256, 46)));
      m.position.set(p.wx + Math.sin(p.ry) * .01, 1.45, p.wz + Math.cos(p.ry) * .01); m.rotation.y = p.ry; m.visible = false; W.grupo.add(m);
      G.vermelhos.push(m);
    }
    montarVelha();
    // papel e lápis no quarto da Celeste: bilhete para a próxima Lia
    const pp = lugar('celeste', 'l', .3, .45);
    if (pp) {
      const g = grupo(pp.x, 0, pp.z, pp.ry);
      C.box(.4, .55, .4, mat(0x4a2c18, 0x140a04), 0, .275, 0, g);
      const papel = new THREE.Mesh(new THREE.PlaneGeometry(.2, .26), new THREE.MeshStandardMaterial({ color: 0xe0d6bc, emissive: 0x302a20, emissiveIntensity: .8 })); papel.rotation.x = -Math.PI / 2; papel.position.y = .555; g.add(papel);
      C.cyl(.006, .006, .16, mat(0xd0a020, 0x302008), .12, .56, 0, 5, g).rotation.z = Math.PI / 2;
      const it = examinar(g, () => F().l4escreveu ? '!Papel e lápis. Você já deixou um bilhete esta noite.' : 'Escrever um bilhete (para a próxima Lia)', () => { if (!F().l4escreveu) abrirBilhete(pp); });
      it.hold = .8;
    }
    // apito reserva num prego da rouparia
    const pa = lugar('roup', 'l', .5, .4);
    if (pa && !bolso().apito && !F().l4apitoUsado) {
      const g = grupo(pa.wx - Math.sin(pa.ry) * .03, 1.45, pa.wz - Math.cos(pa.ry) * .03, pa.ry);
      C.cyl(.012, .012, .05, MAT_METAL(), 0, 0, .02, 5, g).rotation.x = Math.PI / 2;
      const ap = C.box(.07, .025, .025, mat(0xc0c0b8, 0x303030, .8, { metalness: .7 }), 0, -.05, .04, g);
      void ap;
      const it = examinar(g, 'Pegar o apito do prego', () => { g.visible = false; SFX.pegar(); dar('apito'); setTimeout(() => lia('O apito dele. Igual ao que pendura no pescoço.', true), 700); });
      it.on = () => g.visible;
    }
    // lanterninha do Davi no depósito
    const pl = lugar('sotao', 'n', .75, .45);
    if (pl && !bolso().lanterninha) {
      const g = grupo(pl.x, .03, pl.z, rand(0, 6));
      const c = C.cyl(.022, .025, .13, mat(0x2a6aa0, 0x0a2040, .9), 0, 0, 0, 8, g); c.rotation.z = Math.PI / 2;
      const it = examinar(g, 'Pegar a lanterninha de lata', () => { g.visible = false; SFX.pegar(); dar('lanterninha'); setTimeout(() => lia('A lanterninha dele. Não gasta pilha nenhuma... quase não ilumina.', true), 700); });
      it.on = () => g.visible;
    }
    // barquinho na banheira de cima
    const pbh = lugar('banhS', 'o', .7, .55);
    if (pbh) { C.box(.7, .45, 1.4, mat(0xd8d8d0, 0x202020, .4), pbh.x, .225, pbh.z, W.grupo, true); barquinho('banheira', pbh.x, .47, pbh.z); }
    // jogo de luz do Dormitório A (janela para a mata): S.O.S.
    montarAtalhoGiz(); montarVitral(); montarOlho(); montarGudeMapa('superior');
    vermelhoPlano('patamar', 's', .5, 'ELE DORME DE OLHO ABERTO');
    notaEscondida('dormE', 'n', .7, 'Desenho numa folha dobrada', '(giz de cera, mão de criança: uma casa, um sol, quatro bonequinhos de mãos dadas)\n\nembaixo, a lápis:\n"A gente ia fugir pela janela. O Davi disse que dava. Eu desenhei pra lembrar."', 'l4notaS');
  }
  function soldadinho() {
    const g = new THREE.Group(), verm = mat(0xa02020, 0x300808, .8), azul = mat(0x203a80, 0x081030, .8);
    C.box(.05, .08, .04, azul, 0, .04, 0, g, false); C.box(.06, .08, .045, verm, 0, .12, 0, g, false);
    const cab = new THREE.Mesh(new THREE.SphereGeometry(.025, 8, 6), mat(0xd8b898, 0x302018)); cab.position.y = .185; g.add(cab);
    C.cyl(.02, .02, .05, mat(0x111111), 0, .225, 0, 8, g); const tb = C.cyl(.03, .03, .03, mat(0xd8c080, 0x403010, .7), .045, .1, 0, 10, g); tb.rotation.z = Math.PI / 2;
    return g;
  }
  // jogo da velha de giz no corredor: o Davi joga com o O
  function montarVelha() {
    const p = lugar('corr', 'o', .12, .55); if (!p) return;
    const g = grupo(p.wx + Math.sin(p.ry) * .012, 1.3, p.wz + Math.cos(p.ry) * .012, p.ry);
    const cv = document.createElement('canvas'); cv.width = 256; cv.height = 256; const tex = descartar(new THREE.CanvasTexture(cv));
    const quadro = new THREE.Mesh(new THREE.PlaneGeometry(.75, .75), matTex(tex)); g.add(quadro);
    const st = G.velha = { b: Array(9).fill(''), fim: false, cv, tex, x: p.x, z: p.z, ocupado: false };
    const desenhar = () => { const c = cv.getContext('2d'); c.clearRect(0, 0, 256, 256); c.strokeStyle = 'rgba(225,220,205,.8)'; c.lineWidth = 6; c.lineCap = 'round'; for (const k of [85, 171]) { c.beginPath(); c.moveTo(k, 10); c.lineTo(k + 3, 246); c.stroke(); c.beginPath(); c.moveTo(10, k); c.lineTo(246, k + 2); c.stroke(); } st.b.forEach((v, i) => { const cx = (i % 3) * 85 + 43, cy = Math.floor(i / 3) * 85 + 43; if (v === 'X') { c.beginPath(); c.moveTo(cx - 24, cy - 24); c.lineTo(cx + 24, cy + 24); c.moveTo(cx + 24, cy - 24); c.lineTo(cx - 24, cy + 24); c.stroke(); } else if (v === 'O') { c.beginPath(); c.arc(cx, cy, 25, 0, 6.28); c.stroke(); } }); if (st.msg) { c.fillStyle = 'rgba(240,230,210,.95)'; c.font = '22px "Special Elite", Georgia'; c.textAlign = 'center'; c.fillText(st.msg, 128, 250); } tex.needsUpdate = true; };
    st.desenhar = desenhar; desenhar();
    for (let i = 0; i < 9; i++) {
      const cel = new THREE.Mesh(new THREE.PlaneGeometry(.23, .23), new THREE.MeshBasicMaterial({ transparent: true, opacity: .001, depthWrite: false }));
      cel.position.set(((i % 3) - 1) * .25, (1 - Math.floor(i / 3)) * .25, .005); g.add(cel);
      const it = examinar(cel, () => st.fim || st.ocupado ? '!Jogo da velha de giz.' : st.b[i] ? '!Essa casa já tem.' : 'Marcar um X de giz (jogo da velha)', () => jogarVelha(i));
      it.on = () => true;
    }
  }
  const LINHAS = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];
  const vence = b => { for (const [a, c, d] of LINHAS) if (b[a] && b[a] === b[c] && b[a] === b[d]) return b[a]; return b.every(Boolean) ? 'E' : null; };
  function minimax(b, vez) { const v = vence(b); if (v === 'O') return { s: 1 }; if (v === 'X') return { s: -1 }; if (v === 'E') return { s: 0 }; let best = null; for (let i = 0; i < 9; i++) { if (b[i]) continue; b[i] = vez; const r = minimax(b, vez === 'O' ? 'X' : 'O'); b[i] = ''; if (!best || (vez === 'O' ? r.s > best.s : r.s < best.s)) best = { s: r.s, i }; } return best; }
  function jogarVelha(i) {
    const st = G.velha; if (!st || st.fim || st.ocupado || st.b[i]) return;
    st.b[i] = 'X'; st.desenhar(); som.giz({ x: st.x, y: 1.3, z: st.z }); C.emitNoise(st.x, st.z, 4, true);
    if (vence(st.b)) return fimVelha();
    st.ocupado = true;
    setTimeout(() => { if (G.velha !== st) return; const m = minimax(st.b.slice(), 'O'); if (m && m.i !== undefined) st.b[m.i] = 'O'; st.ocupado = false; st.desenhar(); som.giz({ x: st.x, y: 1.3, z: st.z }); C.emitNoise(st.x, st.z, 3); if (vence(st.b)) fimVelha(); }, 700);
  }
  function fimVelha() {
    const st = G.velha, v = vence(st.b); st.fim = true;
    if (v === 'O') {
      st.msg = TXT.velha.perdeu; st.desenhar(); C.toast('O giz escreveu sozinho embaixo do jogo.');
      if (S().chapter === 3 && S().done.ana && !ANA.ativa && C.spawnAna) setTimeout(() => { if (!ANA.ativa) C.spawnAna(null); }, 2500);
      else setTimeout(() => SFX.risada && SFX.risada(st.x, st.z - 6), 1500);
    } else {
      const n = (F().l4velhaEmp || 0) + 1; F().l4velhaEmp = n; st.msg = n >= 3 ? TXT.velha.empate : 'DE NOVO'; st.desenhar();
      if (n === 3) { C.conquista('l4_velha'); S().inv.pilhas++; C.renderInvMini(); SFX.pegar(); C.toast('Uma pilha caiu do alto do batente, aos seus pés.'); setTimeout(() => lia('"Você ainda joga igual." ...Ele sempre ganhava de mim.', true), 1200); }
    }
    setTimeout(() => { if (G.velha !== st) return; st.b = Array(9).fill(''); st.fim = false; st.msg = ''; st.desenhar(); }, 4000);
  }
  // bilhete para a próxima Lia
  function abrirBilhete(pp) {
    const render = () => { ov.innerHTML = '<h3>UM BILHETE PARA A PRÓXIMA LIA</h3><input maxlength="80" placeholder="escreva aqui (até 80 letras)"><small>ENTER deixa o bilhete aqui · ESC desiste</small>'; };
    abrirModo({ tipo: 'bilhete', foco: true, render, tecla(e) {
      if (e.code === 'Escape') { fecharModo(); return; }
      if (e.code === 'Enter' || e.code === 'NumpadEnter') {
        const i = ov.querySelector('input'), txt = (i && i.value || '').replace(/[<>]/g, '').trim().slice(0, 80);
        fecharModo(); if (!txt) return;
        const o = ls.get(); o.bilhete = { texto: txt, mapa: 'superior', x: pp.x + Math.sin(pp.ry) * .3, z: pp.z + Math.cos(pp.ry) * .3, noite: F().l4noite || 1, fuligem: false }; ls.set(o);
        F().l4escreveu = true; SFX.papel(); C.toast('Você dobrou o bilhete e deixou em cima do banquinho.');
      }
    } });
  }
  function montarBilheteAntigo(id) {
    const o = ls.get(), b = o.bilhete; if (!b || b.mapa !== id) return;
    if (b.noite === (F().l4noite || 0) && !b.fuligem) return;
    const m = new THREE.Mesh(new THREE.PlaneGeometry(.16, .12), new THREE.MeshStandardMaterial({ color: b.fuligem ? 0x6a6050 : 0xe8dcc0, emissive: 0x302a20, emissiveIntensity: .9, side: THREE.DoubleSide }));
    m.rotation.x = -Math.PI / 2; m.rotation.z = .4; m.position.set(b.x, .58, b.z); W.grupo.add(m);
    examinar(m, 'Ler o bilhete dobrado', () => {
      C.abrirNotaUI('Um bilhete dobrado', ' ');
      const el = document.querySelector('#note p');
      if (el) el.innerHTML = `<span style="font-family:cursive;font-style:italic;font-size:1.25em;${b.fuligem ? 'color:#4a3a2a;text-shadow:0 0 6px rgba(20,10,0,.7)' : ''}">${esc(b.texto)}</span><br><br>— Lia, noite ${b.noite | 0}${b.fuligem ? '<br><br><small>(o papel está manchado de fuligem, como se tivesse passado por um incêndio)</small>' : ''}`;
      C.conquista('l4_bilhete');
      setTimeout(() => lia(b.fuligem ? 'A minha letra... queimada. Eu morri depois de escrever isso.' : 'A minha letra. Eu deixei isso pra mim.', true), 900);
    });
  }

  // ------------------------------------------------ túneis e cemitério
  function montarTuneis() {
    const r = C.SALA('hub'); if (r) barquinho('cisterna', (r.x0 + r.x1) / 2 + 2.2, .44, (r.z0 + r.z1) / 2 - 2);
    const p = lugar('secreta', 'o', .5, .45);
    if (p && !bolso().piao && !F().l4piaoLargado) {
      const g = grupo(p.x, 0, p.z, p.ry);
      C.box(.4, .25, .3, mat(0x5a4028, 0x180c04), 0, .125, 0, g);
      const et = new THREE.Mesh(new THREE.PlaneGeometry(.36, .12), matTex(escrita(['CONFISCADO — A.'], 'rgba(40,20,10,.9)', 256, 64, 26))); et.position.set(0, .15, .152); g.add(et);
      const pi = piao(); pi.position.set(0, .26, 0); g.add(pi);
      const it = examinar(g, () => pi.visible ? 'Pegar o pião confiscado' : '!Uma caixa: CONFISCADO — A.', () => { if (!pi.visible) return; pi.visible = false; SFX.pegar(); dar('piao'); setTimeout(() => lia('O pião dela. Confiscado. Ninguém nunca devolveu.', true), 700); });
      void it;
    }
    const pv = lugar('hub', 'n', .3, .5);
    if (pv) { const m = new THREE.Mesh(new THREE.PlaneGeometry(1.4, .7), matTex(escrita(['A ÁGUA ESCUTA'], 'rgba(255,240,230,.95)', 640, 256, 50))); m.position.set(pv.wx + Math.sin(pv.ry) * .01, 1.5, pv.wz + Math.cos(pv.ry) * .01); m.rotation.y = pv.ry; m.visible = false; W.grupo.add(m); G.vermelhos.push(m); }
    montarGudeMapa('tuneis'); vermelhoPlano('secreta', 's', .5, 'QUEM ABRIU A MINHA GAVETA');
    notaEscondida('secreta', 'n', .3, 'Botão de farda', '(um botão de metal enrolado num pedaço de pano)\n\nno pano, bordado torto:\n"M. D. — inspetor. Devolver quando ele parar de usar."', 'l4notaU');
  }
  function piao() { const g = new THREE.Group(); const c = new THREE.Mesh(new THREE.ConeGeometry(.04, .06, 10), mat(0xc07020, 0x402008, .9)); c.rotation.x = Math.PI; c.position.y = .03; g.add(c); const t = C.cyl(.042, .042, .02, mat(0x2050a0, 0x081840, .9), 0, .07, 0, 10, g); void t; return g; }
  function montarCemiterio() {
    const pc = lugar('capela', 's', .78, .6);
    if (pc) { C.cyl(.25, .12, .9, mat(0x8a8a82, 0x181818, .4), pc.x, .45, pc.z, 12); barquinho('capela', pc.x, .91, pc.z); }
    if (F().l4sos2 && !F().l4trouxa) {
      const sp = W.def.spawns.tuneis || W.def.spawns.inicio; if (!sp) return;
      let x = sp.x + 1.6, z = sp.z - 1.2; if (!livre(x, z, .1)) { x = sp.x - 1.6; }
      const g = grupo(x, 0, z, .3); C.box(.35, .18, .25, mat(0x6a5a40, 0x1a1408, .7), 0, .09, 0, g);
      examinar(g, 'Abrir a trouxa de pano deixada no portão', () => {
        if (F().l4trouxa) return; F().l4trouxa = true; g.visible = false; const s = S(); s.inv.pilhas++; s.inv.kits++; SFX.pegar(); C.renderInvMini();
        C.abrirNotaUI('Trouxa de pano', 'Uma pilha, um curativo e um papel de embrulho de pão:\n\nVi seu sinal. — J.');
      });
    }
    montarRespiro(); montarLapide(); vermelhoPlano('cem', 'o', .5, 'ELE NÃO DORME. ELE ESPERA.');
  }

  // ------------------------------------------------ pilha roxa (luz negra), uma por noite
  function montarRoxa(id) {
    if (!ROXA[id] || F().l4roxaPega) return;
    const s = S(), sem = ((s.code || [1])[0] * 7 + (s.quadro || [1])[0] * 3 + (s.code || [0, 0, 0])[2]);
    const mapas = Object.keys(ROXA); if (mapas[sem % 3] !== id) return;
    const sid = ROXA[id][sem % 5], p = lugar(sid, pick(['n', 's', 'o', 'l']), rand(.3, .7), .5); if (!p) return;
    const g = grupo(p.x, .03, p.z, rand(0, 6));
    const c = C.cyl(.03, .03, .11, new THREE.MeshStandardMaterial({ color: 0x6a2aa0, emissive: 0x4a1080, emissiveIntensity: 1.2, metalness: .5, roughness: .3 }), 0, 0, 0, 8, g); c.rotation.z = Math.PI / 2;
    const it = examinar(g, 'Pegar a pilha roxa', () => { g.visible = false; F().l4roxaPega = true; SFX.pegar(); dar('roxa'); setTimeout(() => lia('Uma pilha roxa. Nunca vi dessa cor.', true), 700); });
    it.on = () => g.visible;
    G.segredos = G.segredos || []; G.segredos.push({ x: p.x, z: p.z, feito: () => !g.visible });
  }
  const TX_MAO = texCanvas(128, 128, (g, w, h) => { g.clearRect(0, 0, w, h); g.fillStyle = 'rgba(210,190,255,.85)'; g.beginPath(); g.ellipse(64, 80, 26, 30, 0, 0, 6.28); g.fill(); for (const [x, y, a] of [[34, 40, -.4], [50, 28, -.15], [66, 24, 0], [82, 30, .15], [100, 56, .7]]) { g.save(); g.translate(x, y); g.rotate(a); g.beginPath(); g.ellipse(0, 0, 7, 20, 0, 0, 6.28); g.fill(); g.restore(); } });
  TX_MAO.userData.clone = false;
  const TX_SETA = texCanvas(64, 128, (g, w, h) => { g.clearRect(0, 0, w, h); g.strokeStyle = 'rgba(230,220,255,.9)'; g.lineWidth = 7; g.lineCap = 'round'; g.beginPath(); g.moveTo(32, 120); g.lineTo(32, 14); g.moveTo(32, 10); g.lineTo(12, 40); g.moveTo(32, 10); g.lineTo(52, 40); g.stroke(); });
  TX_SETA.userData.clone = false;
  function luzNegra() {
    G.luzNegra = 40; C.toast('Luz negra. Quarenta segundos.');
    const rc = new THREE.Raycaster();
    for (let i = 0; i < 10; i++) {
      const a = rand(0, 6.28), dir = new THREE.Vector3(Math.sin(a), 0, Math.cos(a)); rc.set(new THREE.Vector3(P.pos.x, rand(.6, 1.7), P.pos.z), dir); rc.far = 9;
      const h = rc.intersectObjects(W.solid, false)[0]; if (!h || !h.face) continue;
      const n = h.face.normal.clone().transformDirection(h.object.matrixWorld);
      const m = new THREE.Mesh(new THREE.PlaneGeometry(.3, .3), new THREE.MeshBasicMaterial({ map: TX_MAO, transparent: true, depthWrite: false, opacity: .9 }));
      m.position.copy(h.point).addScaledVector(n, .01); m.lookAt(m.position.clone().add(n)); m.rotation.z += rand(-.6, .6); W.grupo.add(m); G.decais.push(m);
    }
    const r = objetivoSala();
    if (r && r !== P.room) {
      const ent = { pos: P.pos.clone(), path: [] };
      if (C.planejar(ent, (r.x0 + r.x1) / 2, (r.z0 + r.z1) / 2)) {
        const pts = [P.pos.clone(), ...ent.path]; let n = 0;
        for (let i = 1; i < pts.length && n < 30; i++) { const a = pts[i - 1], b = pts[i], dx = b.x - a.x, dz = b.z - a.z, L = Math.hypot(dx, dz); for (let t = 1; t < L && n < 30; t += 1.4) { const m = new THREE.Mesh(new THREE.PlaneGeometry(.22, .44), new THREE.MeshBasicMaterial({ map: TX_SETA, transparent: true, depthWrite: false })); m.rotation.set(-Math.PI / 2, 0, Math.atan2(-dx, -dz) + Math.PI); m.position.set(a.x + dx / L * t, .02, a.z + dz / L * t); W.grupo.add(m); G.decais.push(m); n++; } }
      }
    }
    setTimeout(() => lia('Mãos. Nas paredes todas. E setas de giz... ele marcou o caminho.', true), 900);
  }
  function objetivoSala() { const s = S(), c = R.capitulos[s.chapter]; if (!c) return null; for (const o of c.objetivos) { if (s.done[o.id]) continue; const sid = SALA_OBJ[o.id]; return sid ? C.SALA(sid) : null; } return null; }
  function updateLuzNegra(dt) {
    if (!G.luzNegra) return;
    G.luzNegra = Math.max(0, G.luzNegra - dt);
    const vis = S().flashOn;
    for (const m of G.decais) { m.visible = vis; if (G.luzNegra < 4) m.material.opacity = G.luzNegra / 4 * .9; }
    if (vis && ANA.ativa) { try { C.ANA_G.userData.olhoMat.color.setHex(0xc89cff); } catch (e) {} }
    if (vis) hud.textContent = `luz negra · ${Math.ceil(G.luzNegra)} s`;
    if (G.luzNegra <= 0) { hud.textContent = ''; for (const m of G.decais) { W.grupo.remove(m); m.geometry.dispose(); m.material.dispose(); } G.decais = []; C.toast('A pilha roxa acabou.'); }
  }

  // ------------------------------------------------ lanterna da tentativa anterior
  function montarMorte(id) {
    const m = sess.morte; if (!m || m.mapa !== id || m.cap !== S().chapter || umaVida()) return;
    const g = grupo(m.x, .05, m.z, m.yaw);
    const c = C.cyl(.04, .05, .28, mat(0x6a6a68, 0x1a1a18, .6, { metalness: .5 }), 0, 0, 0, 10, g); c.rotation.x = Math.PI / 2;
    const lente = C.cyl(.053, .053, .02, new THREE.MeshStandardMaterial({ color: 0xfff2c0, emissive: 0xffe0a0, emissiveIntensity: 1.4 }), 0, 0, -.15, 12, g); lente.rotation.x = Math.PI / 2;
    const cone = new THREE.Mesh(new THREE.ConeGeometry(.6, 3, 16, 1, true), new THREE.MeshBasicMaterial({ color: 0xffe6b0, transparent: true, opacity: .07, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide }));
    cone.rotation.x = -Math.PI / 2; cone.position.z = -1.65; g.add(cone);
    G.tick.push(() => { const p = Math.sin(perf() * 13) > .7 ? .2 : 1; lente.material.emissiveIntensity = 1.4 * p; cone.material.opacity = .07 * p; });
    const it = examinar(g, 'Pegar a lanterna caída', () => {
      g.visible = false; sess.morte = null; const s = S(); s.battery = Math.min(100, s.battery + 50); SFX.pegar(); C.toast('Meia pilha a mais.'); lia(pick(TXT.morteFrases));
    });
    it.on = () => g.visible;
  }

  // ------------------------------------------------ usos dos itens do bolso
  const USOS = {
    bala() { if (!darBala()) C.toast('Guarde para alguém que goste de doce. Ela precisa estar iluminada, bem perto.'); },
    folha() { if (!keys.KeyU) C.toast('Segure U parada, com a folha perto de uma luz acesa.'); },
    fita() {
      if (!M.ativo || M.pos.distanceTo(P.pos) > 14 || M.state === 'agarra') { C.toast('Ele não está perto o bastante. A fita só toca uma vez.'); return; }
      tirar('fita'); som.sino(M.pos ? { x: M.pos.x, y: 2, z: M.pos.z } : null, .5, .97); som.sino(null, .25);
      M.path = []; M.acao = null; M.state = 'procura'; M.searchT = 6; M.wait = 4; M.bote = null; M.achou = false; G.isca = null;
      C.toast('[o sino da fita toca: ele segura a cabeça com as duas mãos]'); C.subPequeno('inspetor', 'O sino... não... o sino não...');
      setTimeout(() => C.sub('davi', '(no fim da fita, baixinho) Pra quando você precisar. — D.'), 4500);
    },
    camera() { foto(); },
    celofane() { F().l4vermelho = !F().l4vermelho; SFX.papel(); C.toast(F().l4vermelho ? 'Papel vermelho na lente. A luz fica cor de sangue.' : 'Você tirou o papel vermelho da lente.'); if (F().l4vermelho && !F().l4vermelhoDica) { F().l4vermelhoDica = true; setTimeout(() => lia('No vermelho aparecem coisas... mas a Ana acha que vermelho é escuro.', true), 1400); } C.renderInvMini(); },
    soldado() {
      if (S().hidden) { C.toast('Aqui dentro não dá.'); return; }
      tirar('soldado'); F().l4soldadoUsado = true; som.corda();
      const fw = new THREE.Vector3(); camera.getWorldDirection(fw); fw.y = 0; fw.normalize();
      const g = soldadinho(); g.position.set(P.pos.x + fw.x * .9, 0, P.pos.z + fw.z * .9); g.rotation.y = Math.atan2(fw.x, fw.z); W.grupo.add(g);
      G.soldado = { g, t: 8, dir: fw.clone(), cd: 1.4, avisou: false };
    },
    apito() {
      tirar('apito'); F().l4apitoUsado = true; som.apito(null); C.conquista('l4_recreio');
      const alvo = C.SALA('patio') || C.SALA('patamar') || C.SALA('entrada') || P.room;
      if (M.ativo && M.state !== 'agarra') { M.bote = null; M.achou = false; atrair((alvo.x0 + alvo.x1) / 2, (alvo.z0 + alvo.z1) / 2, 4, { forca: true, ouvido: 0 }); G.apitoT = 15; C.subPequeno('inspetor', 'Recreio... é a hora do recreio.'); }
      if (PROC.fase === 'aviso') { PROC.t = Math.max(.5, PROC.t - 5); C.toast('As luzes piscam mais rápido. Eles também ouviram o apito.'); }
    },
    lanterninha() { F().l4lanterninha = !F().l4lanterninha; SFX.clique && SFX.clique(); C.toast(F().l4lanterninha ? 'Lanterninha do Davi: não gasta pilha, mas a luz é curta. A Ana só respeita bem de perto.' : 'De volta à lanterna de verdade.'); C.renderInvMini(); },
    piao() {
      const r = C.roomAt(P.pos.x, P.pos.z);
      if (r && r.agua && !S().flags.aguaBaixa) { C.toast('Na água o pião não gira.'); return; }
      if (S().hidden) { C.toast('Aqui dentro não dá.'); return; }
      tirar('piao'); F().l4piaoLargado = true;
      const fw = new THREE.Vector3(); camera.getWorldDirection(fw); fw.y = 0; fw.normalize();
      const x = P.pos.x + fw.x * 1, z = P.pos.z + fw.z * 1, g = piao(); g.position.set(x, 0, z); W.grupo.add(g);
      som.piao({ x, y: .2, z }, 6); C.emitNoise(x, z, 14);
      G.piao = { g, t: 6, x, z };
      atrair(x, z, 6, { ouvido: .15 });
      if (ANA.ativa && ANA.pos.distanceTo(P.pos) < 14) setTimeout(() => SFX.risada && SFX.risada(ANA.pos.x, ANA.pos.z), 700);
      const it = examinar(g, () => G.piao && G.piao.t > 0 ? '!O pião zumbe girando.' : 'Pegar o pião de volta', () => { if (G.piao && G.piao.t > 0) return; g.visible = false; F().l4piaoLargado = false; dar('piao', 1, true); C.toast('Pião de volta no bolso.'); });
      it.on = () => g.visible;
    },
    roxa() { tirar('roxa'); luzNegra(); },
    estilingue() { if (S().hidden) { C.toast('Aqui dentro não dá.'); return; } atirarPedra(); },
    olho() { usarOlho(); },
    sal() { riscarSal(); },
    vela() { acenderVela(); }
  };
  function darBala() {
    if (!bolso().bala || !ANA.ativa) return false;
    if (ANA.pos.distanceTo(P.pos) > 2.2 || !ANA.vista) return false;
    tirar('bala'); F().l4balaDada = true; SFX.papel();
    G.presa = Math.max(G.presa, 7); ANA.conta = 0; ANA.contaT = 6;
    C.sub('ana', '(ela para de contar, cheira a bala devagar) Faz quinze anos que ninguém me dá nada.');
    C.conquista('l4_doce');
    return true;
  }
  // câmera instantânea: flash que congela a Ana e mostra o que a lanterna não mostra
  function foto() {
    const b = bolso(); if (!b.camera) return;
    tirar('camera'); som.motor({ x: P.pos.x, y: 1.4, z: P.pos.z }); C.emitNoise(P.pos.x, P.pos.z, 9, true); C.marcarCausa('camera');
    const suave = !!OPT.vFlash;
    flashEl.style.transition = 'none'; flashEl.style.opacity = suave ? .3 : .95;
    requestAnimationFrame(() => { flashEl.style.transition = `opacity ${suave ? .4 : .9}s`; flashEl.style.opacity = 0; });
    if (ANA.ativa && ANA.pos.distanceTo(P.pos) < 12) { const fw = new THREE.Vector3(); camera.getWorldDirection(fw); const to = ANA.pos.clone().sub(P.pos).setY(0).normalize(); if (fw.setY(0).normalize().dot(to) > .5) { G.presa = Math.max(G.presa, 3); C.toast('O flash pegou a Ana em cheio. Ela ficou parada, de olhos fechados.'); } }
    revelarCriancas();
    const resta = bolso().camera || 0;
    setTimeout(() => C.toast(resta ? `A foto saiu... e tem alguém nela que não estava aqui. (${resta} no filme)` : 'Acabou o filme. Na última foto, uma mão no batente da porta.'), 1300);
  }
  function revelarCriancas() {
    const fw = new THREE.Vector3(); camera.getWorldDirection(fw); fw.y = 0; fw.normalize();
    const sombra = new THREE.MeshBasicMaterial({ color: 0x0a0a0c, transparent: true, opacity: .92 });
    for (let i = 0; i < 4; i++) {
      const a = Math.atan2(fw.x, fw.z) + rand(-.6, .6), d = rand(2.5, 6), x = P.pos.x + Math.sin(a) * d, z = P.pos.z + Math.cos(a) * d;
      if (C.roomAt(x, z) !== P.room || !livre(x, z, .05)) continue;
      const g = grupo(x, 0, z, Math.atan2(P.pos.x - x, P.pos.z - z));
      const corpo = new THREE.Mesh(new THREE.CylinderGeometry(.13, .18, 1.05, 8), sombra); corpo.position.y = .55; g.add(corpo);
      const cab = new THREE.Mesh(new THREE.SphereGeometry(.13, 8, 6), sombra); cab.position.y = 1.2; g.add(cab);
      G.revelados.push({ g, t: .5 });
    }
  }
  function updateRevelados(dt) { for (let i = G.revelados.length - 1; i >= 0; i--) { const r = G.revelados[i]; r.t -= dt; if (r.t <= 0) { W.grupo.remove(r.g); r.g.traverse(o => { if (o.geometry) o.geometry.dispose(); }); G.revelados.splice(i, 1); } } }
  function updateSoldado(dt) {
    const sd = G.soldado; if (!sd) return;
    sd.t -= dt; sd.cd -= dt;
    if (sd.t > 2) { sd.g.position.addScaledVector(sd.dir, .3 * dt); sd.g.rotation.z = Math.sin(perf() * 12) * .08; if (sd.cd <= 0) { sd.cd = .5; som.tambor({ x: sd.g.position.x, y: .2, z: sd.g.position.z }); C.emitNoise(sd.g.position.x, sd.g.position.z, 12); } if (ANA.ativa && ANA.pos.distanceTo(sd.g.position) < 15) { G.presa = Math.max(G.presa, .5); if (!sd.avisou) { sd.avisou = true; C.toast('[a contagem parou: ela está olhando o soldadinho]'); } } }
    else if (sd.t > 0) sd.g.rotation.z = Math.min(1.5, sd.g.rotation.z + dt * 3);
    else G.soldado = null;
    if (!sd.atraiu && M.ativo) { sd.atraiu = true; atrair(sd.g.position.x, sd.g.position.z, 4); }
  }
  function updatePiao(dt) { const p = G.piao; if (!p || p.t <= 0) return; p.t -= dt; p.g.rotation.y += dt * 30; p.g.rotation.z = p.t < 1 ? (1 - p.t) * 1.2 : Math.sin(perf() * 5) * .05; if (p.t <= 0) som.tique({ x: p.x, y: .1, z: p.z }, 2, .1); }

  // ------------------------------------------------ lanterna: piscadas, S.O.S. e a Ana
  function piscou() {
    const t = perf(), s = S();
    if (s.flashOn) sess.ligouEm = t; else if (sess.ligouEm) { const d = t - sess.ligouEm; sess.pulsos.push({ d, t }); sess.pulsos = sess.pulsos.filter(p => t - p.t < 14).slice(-9); conferirSOS(); }
    sess.piscadas.push(t); sess.piscadas = sess.piscadas.filter(x => t - x < 2.6);
    G.piscaChecar = t + .75;
  }
  function conferirSOS() {
    const p = sess.pulsos; if (p.length < 9) return;
    const tipo = p.map(x => x.d < .45 ? 'c' : x.d > .55 && x.d < 2.2 ? 'l' : '?').join('');
    if (tipo !== 'ccclllccc') return;
    sess.pulsos = [];
    const sala = P.room && P.room.id, s = S();
    if (W.mapa === 'terreo' && sala === 'enferm' && !F().l4sos1) {
      F().l4sos1 = true; C.conquista('l4_sos');
      setTimeout(() => C.toast('[lá longe, depois da mata, a luz do posto pisca de volta: três curtas, três longas, três curtas]'), 900);
      setTimeout(() => C.sub('joaquim', `(no rádio, chiado) ${TXT.joaquimSOS[s.chapter] || TXT.joaquimSOS[5]} ...Eu sei que é você, menina.`, true), 4200);
    } else if (W.mapa === 'superior' && sala === 'dormA' && !F().l4sos2) {
      F().l4sos2 = true; C.conquista('l4_sos');
      setTimeout(() => C.toast('[no morro, um lampião responde com o mesmo sinal]'), 900);
      setTimeout(() => lia('Alguém viu. Alguém lá fora viu.'), 3600);
    } else if (!P.room || !['enferm', 'dormA'].includes(sala)) {
      if (!F().l4sosJanela) { F().l4sosJanela = true; C.toast('Três curtas, três longas, três curtas. Daqui ninguém vê. Precisa de uma janela para fora.'); }
    }
  }
  function updatePiscadas(dt) {
    if (ANA.ativa && ANA.vista) G.anaVistaEm = perf();
    if (G.olhosT > 0) { G.olhosT -= dt; const on = Math.floor(G.olhosT * 5) % 2 === 0; try { C.ANA_G.userData.olhoMat.color.setHex(on ? 0xd6e6ff : 0x000000); } catch (e) {} }
    if (!G.piscaChecar || perf() < G.piscaChecar || !S().flashOn) return;
    G.piscaChecar = 0;
    const n = Math.floor(sess.piscadas.length / 2); sess.piscadas = [];
    if (n < 3 || !ANA.ativa || perf() - G.anaVistaEm > 2.5 || ANA.pos.distanceTo(P.pos) > 10) return;
    const k = capF('piscaAna'), usadas = F()[k] || 0;
    if (n >= 4) { ANA.conta = Math.max(ANA.conta, 7); C.subPequeno('ana', 'Tá rindo de mim?'); return; }
    if (usadas >= 2) return;
    F()[k] = usadas + 1; G.olhosT = 1.2; S().battery = Math.max(0, S().battery - 3);
    const r = objetivoSala(); if (!r) return;
    const dx = (r.x0 + r.x1) / 2 - ANA.pos.x, dz = (r.z0 + r.z1) / 2 - ANA.pos.z;
    const m = new THREE.Mesh(new THREE.PlaneGeometry(.3, .6), new THREE.MeshBasicMaterial({ map: TX_SETA, transparent: true, depthWrite: false, color: 0xfff4e0 }));
    m.rotation.set(-Math.PI / 2, 0, Math.atan2(-dx, -dz) + Math.PI); m.position.set(ANA.pos.x + Math.sign(dx || 1) * .5, .02, ANA.pos.z + Math.sign(dz || 1) * .5); W.grupo.add(m);
    setTimeout(() => { if (m.parent) { m.parent.remove(m); m.geometry.dispose(); m.material.dispose(); } }, 20000);
    C.toast('[os olhos dela piscaram três vezes de volta. Uma seta de giz apareceu no chão.]');
  }
  // contar junto com a Ana (teclas 1 a 9 no ritmo dela)
  function updateConta() {
    const c = G.contou;
    if (!ANA.ativa) { c.ultimo = 0; return; }
    if (ANA.conta !== c.ultimo) { if (ANA.conta > c.ultimo && ANA.conta <= 9) c.t = perf(); c.ultimo = ANA.conta; }
  }
  function contarJunto(d) {
    const c = G.contou; if (!ANA.ativa || F().l4contou) return false;
    if (d === c.ultimo && perf() - c.t < .9) {
      c.acertos++; som.tique(null, 1);
      if (c.acertos >= 3) {
        F().l4contou = true; c.acertos = 0; ANA.conta = 0; ANA.contaT = 7; G.presa = Math.max(G.presa, 2.5);
        if (SFX.risada) SFX.risada(ANA.pos.x, ANA.pos.z); C.sub('ana', 'Você sabe brincar.'); C.conquista('l4_contei');
      }
    } else { c.acertos = 0; ANA.contaT = Math.min(ANA.contaT, .35); C.toast('[fora do ritmo: ela acelera a contagem]'); }
    return true;
  }
  // bichinho de sombra na parede
  const TX_COELHO = texCanvas(128, 128, (g, w, h) => { g.clearRect(0, 0, w, h); g.fillStyle = 'rgba(0,0,0,.85)'; g.beginPath(); g.ellipse(64, 84, 34, 24, 0, 0, 6.28); g.fill(); g.beginPath(); g.ellipse(48, 40, 9, 30, -.25, 0, 6.28); g.fill(); g.beginPath(); g.ellipse(76, 38, 9, 30, .25, 0, 6.28); g.fill(); g.clearRect(70, 76, 6, 6); });
  TX_COELHO.userData.clone = false;
  const _rcS = new THREE.Raycaster();
  function updateSombra(dt) {
    const s = S();
    if (F().l4sombra || !keys.KeyE || C.alvo || s.hidden || !s.flashOn || Math.hypot(P.vx || 0, P.vz || 0) > .3) { if (G.sombraT) { G.sombraT = 0; } return; }
    const fw = new THREE.Vector3(); camera.getWorldDirection(fw); _rcS.set(camera.position, fw); _rcS.far = 1.6;
    const h = _rcS.intersectObjects(W.solid, false)[0]; if (!h || !h.face) { G.sombraT = 0; return; }
    G.sombraT += dt; if (G.sombraT < 1) return;
    G.sombraT = 0; F().l4sombra = true;
    const n = h.face.normal.clone().transformDirection(h.object.matrixWorld);
    const m = new THREE.Mesh(new THREE.PlaneGeometry(.55, .55), new THREE.MeshBasicMaterial({ map: TX_COELHO, transparent: true, depthWrite: false }));
    m.position.copy(h.point).addScaledVector(n, .015); m.lookAt(m.position.clone().add(n)); W.grupo.add(m);
    let t = 0; G.tick.push(dt2 => { if (!m.parent) return; t += dt2 || .03; m.scale.y = 1 + Math.sin(t * 6) * .06; if (t > 6) { m.parent.remove(m); m.geometry.dispose(); m.material.dispose(); } });
    if (ANA.ativa && ANA.pos.distanceTo(P.pos) < 12) { G.presa = Math.max(G.presa, 8); ANA.conta = 0; ANA.contaT = 8; if (SFX.risada) SFX.risada(ANA.pos.x, ANA.pos.z); setTimeout(() => C.subPequeno('ana', 'De novo!'), 900); C.conquista('l4_sombra'); }
    else lia('Um coelho. O Davi fazia isso na parede do quarto quando faltava luz.', true);
  }

  // ------------------------------------------------ deslize agachado depois da corrida
  function updateDeslize(dt) {
    const s = S();
    if (G.slide > 0) {
      G.slide -= dt; const k = G.slide / .35;
      P.pos.x += G.slideDir.x * 5 * k * dt; P.pos.z += G.slideDir.z * 5 * k * dt; if (C.collide) C.collide(P.pos, .33);
      return;
    }
    const vel = Math.hypot(P.vx || 0, P.vz || 0);
    if (P.crouch && !G.crouchAnt && G.sprintAnt && vel > 2.5 && !s.hidden && !umaVida() && s.stamina > 15) {
      G.slide = .35; G.slideDir = { x: P.vx / vel, z: P.vz / vel }; s.stamina = Math.max(0, s.stamina - 15);
      C.emitNoise(P.pos.x, P.pos.z, 7, true); C.marcarCausa('deslize'); if (C.somTecido) C.somTecido(1.6); P.shake = Math.max(P.shake || 0, .03);
      if (!F().l4dicaDeslize) { F().l4dicaDeslize = true; C.toast('Você deslizou agachada. Rápido, mas o tecido no chão faz barulho.'); }
    }
    G.crouchAnt = P.crouch; G.sprintAnt = P.sprinting;
  }
  // descalça: o chão machuca às vezes
  function updateDescalca(dt) {
    if (!F().l4descalca || S().hidden) return;
    const vel = Math.hypot(P.vx || 0, P.vz || 0); if (vel < .5 || P.crouch) return;
    const piso = (P.room && P.room.piso) || '';
    const duro = /ladrilho|concreto|pedra|cascalho|asfalto/.test(piso);
    if (Math.random() < dt * (P.sprinting ? .18 : duro ? .035 : .01)) { ferir(5, 'descalca'); C.emitNoise(P.pos.x, P.pos.z, 6, true); C.subPequeno('lia', pick(['Ai!', 'Ai... um caco.', 'Ssss... farpa.'])); }
  }
  // 21h de verdade
  function updateHora(dt) {
    G.horaCd = (G.horaCd || 0) - dt; if (G.horaCd > 0) return; G.horaCd = 5;
    if (sess.hora21 || W.mapa === 'estrada' || S().chapter < 1) return;
    const d = new Date(); if (d.getHours() !== 21 || d.getMinutes() > 0) return;
    sess.hora21 = true; if (SFX.badaladas) SFX.badaladas(9); C.toast('[são nove horas de verdade. O sino bate fora do roteiro.]'); C.conquista('l4_nahora');
    if (W.def.procissao && W.def.procissao()) S().timers.procissao = Math.min(S().timers.procissao, 60);
  }

  // ============================================================ LOTE 4 — segredos novos
  // --------- escritas da luz vermelha/negra: um plano extra por mapa
  function vermelhoPlano(sid, lado, t, txt) {
    const p = lugar(sid, lado, t, .5); if (!p) return;
    const m = new THREE.Mesh(new THREE.PlaneGeometry(1.4, .7), matTex(escrita([txt], 'rgba(255,240,230,.95)', 640, 256, 46)));
    m.position.set(p.wx + Math.sin(p.ry) * .01, 1.45, p.wz + Math.cos(p.ry) * .01); m.rotation.y = p.ry; m.visible = false; W.grupo.add(m); G.vermelhos.push(m);
  }

  // --------- bilhetes escondidos, um por mapa, cada um com uma referência interna
  function notaEscondida(sid, lado, t, titulo, texto, flag) {
    const p = lugar(sid, lado, t, .35); if (!p || F()[flag]) return;
    const g = grupo(p.wx - Math.sin(p.ry) * .04, 1.1, p.wz - Math.cos(p.ry) * .04, p.ry);
    const m = new THREE.Mesh(new THREE.PlaneGeometry(.16, .2), new THREE.MeshStandardMaterial({ color: 0xe0d6bc, emissive: 0x302a20, emissiveIntensity: .8, side: THREE.DoubleSide })); m.rotation.x = .1; g.add(m);
    const it = examinar(g, 'Pegar o papel escondido', () => { g.visible = false; F()[flag] = true; SFX.papel(); C.abrirNotaUI(titulo, texto); });
    it.on = () => g.visible;
    G.segredos = G.segredos || []; G.segredos.push({ x: p.x, z: p.z, feito: () => !!F()[flag] });
  }

  // --------- estilingue do Davi: pedrinha com arco longo, quase sem ruído
  function montarEstilingue() {
    const p = lugar('aula', 'n', .8, .55); if (!p || bolso().estilingue || F().l4estilUsado) return;
    const g = grupo(p.x, 0, p.z, p.ry); const mad = mat(0x5a3a20, 0x140a04);
    C.box(.5, .04, .4, mad, 0, .7, 0, g); for (const [dx, dz] of [[-.2, -.16], [.2, -.16], [-.2, .16], [.2, .16]]) C.box(.03, .7, .03, MAT_METAL(), dx, .35, dz, g, false);
    const forq = new THREE.Group(); forq.position.set(0, .78, 0); g.add(forq);
    C.box(.015, .1, .015, mat(0x6a4824, 0x201004), 0, .05, 0, forq, false);
    for (const dx of [-.04, .04]) C.box(.012, .08, .012, mat(0x6a4824, 0x201004), dx, .13, 0, forq, false);
    const it = examinar(g, 'Pegar o estilingue (3 pedrinhas)', () => { g.visible = false; SFX.pegar(); dar('estilingue', 3); setTimeout(() => lia('O estilingue do Davi. Ele acertava passarinho do outro lado do pátio.', true), 700); });
    it.on = () => g.visible;
  }
  function atirarPedra() {
    tirar('estilingue'); if (bolso().estilingue <= 0) F().l4estilUsado = true;
    const fw = new THREE.Vector3(); camera.getWorldDirection(fw); fw.normalize();
    const peso = new THREE.Mesh(new THREE.SphereGeometry(.02, 6, 5), new THREE.MeshStandardMaterial({ color: 0x8a8278, emissive: 0x1a1814, emissiveIntensity: .5 }));
    peso.position.copy(camera.position).addScaledVector(fw, .4); W.grupo.add(peso);
    const vel = fw.clone().multiplyScalar(14); G.pedrinhas = G.pedrinhas || []; G.pedrinhas.push({ m: peso, v: vel, t: 0, estourou: false });
    som.corda(); C.emitNoise(P.pos.x, P.pos.z, .6);
  }
  function updatePedrinhas(dt) {
    const L = G.pedrinhas; if (!L || !L.length) return;
    for (let i = L.length - 1; i >= 0; i--) {
      const p = L[i]; p.t += dt; p.v.y -= 7 * dt; p.m.position.addScaledVector(p.v, dt);
      for (const Lmp of W.lampadas) {
        if (!Lmp.ligada || Lmp.estourada || !Lmp.bulbo) continue;
        if (p.m.position.distanceTo(Lmp.bulbo.position) < .4) {
          Lmp.estourada = true; Lmp.ligada = false; Lmp.luz.intensity = 0; Lmp.bulbo.material.emissiveIntensity = 0; if (Lmp.halo) Lmp.halo.material.opacity = 0;
          SFX.vidro(Lmp.bulbo.position.x, Lmp.bulbo.position.z); C.emitNoise(Lmp.bulbo.position.x, Lmp.bulbo.position.z, 10);
          C.conquista('l4_pontaria'); p.estourou = true;
        }
      }
      if (ANA.ativa && !p.assustou && p.m.position.distanceTo(ANA.pos) < 1) { p.assustou = true; G.presa = Math.max(G.presa, .8); C.subPequeno('ana', 'Quem jogou isso?'); }
      if (W.mapa === 'cemiterio' && p.m.position.y > 3 && C.roomAt(p.m.position.x, p.m.position.z) && C.roomAt(p.m.position.x, p.m.position.z).id === 'capela' && !F().l4badalada) {
        F().l4badalada = true; som.sino({ x: p.m.position.x, y: 5, z: p.m.position.z }, .5, .91); C.conquista('l4_badalada'); C.toast('[a pedrinha acertou o sino: uma badalada torta]'); if (M.ativo) atrair(p.m.position.x, p.m.position.z, 8, { forca: true, ouvido: .2 }); p.estourou = true;
      }
      const parou = p.estourou || p.t > 1.6 || p.m.position.y < .03 || (C.collide && !livre(p.m.position.x, p.m.position.z, .02));
      if (parou) {
        const salaP = C.roomAt(p.m.position.x, p.m.position.z);
        if (!p.estourou && salaP && salaP.agua) { som.rolar({ x: p.m.position.x, y: .1, z: p.m.position.z }); C.emitNoise(p.m.position.x, p.m.position.z, 3); }
        else if (!p.estourou) { som.tique({ x: p.m.position.x, y: p.m.position.y, z: p.m.position.z }, 1); C.emitNoise(p.m.position.x, p.m.position.z, 6); atrair(p.m.position.x, p.m.position.z, 4, { ouvido: .3 }); }
        W.grupo.remove(p.m); p.m.geometry.dispose(); p.m.material.dispose(); L.splice(i, 1);
      }
    }
  }

  // --------- olho de vidro: ver como ele por 3 s (silhueta através das paredes), com a audição dele dobrada
  function montarOlho() {
    const p = lugar('sotao', 'l', .3, .4); if (!p || bolso().olho || F().l4olhoPego) return;
    const g = grupo(p.x, 0, p.z, p.ry);
    C.box(.3, .4, .3, mat(0x4a2c18, 0x140a04), 0, .2, 0, g);
    const olho = new THREE.Mesh(new THREE.SphereGeometry(.03, 10, 8), new THREE.MeshStandardMaterial({ color: 0xe8e4e0, emissive: 0x403a30, emissiveIntensity: .6, roughness: .1 })); olho.position.y = .43; g.add(olho);
    const it = examinar(g, 'Pegar o olho de vidro', () => { g.visible = false; F().l4olhoPego = true; SFX.pegar(); dar('olho'); setTimeout(() => lia('Um olho de vidro. Do Moacir, antes de perder os dois. Ainda olha.', true), 700); });
    it.on = () => g.visible;
  }
  function usarOlho() {
    if (G.olhoCd > 0) { C.toast(`O olho ainda está frio. (${Math.ceil(G.olhoCd)} s)`); return; }
    G.olhoT = 3; G.olhoCd = 45; C.conquista('l4_olho');
    if (!G.olhoMesh) {
      const mt = new THREE.MeshBasicMaterial({ color: 0xffb060, transparent: true, opacity: .55, depthTest: false, depthWrite: false });
      const silh = new THREE.Group();
      const corpo = new THREE.Mesh(new THREE.CylinderGeometry(.18, .26, 1.5, 8), mt); corpo.position.y = .9; silh.add(corpo);
      const cab = new THREE.Mesh(new THREE.SphereGeometry(.17, 8, 6), mt); cab.position.y = 1.85; silh.add(cab);
      silh.traverse(o => { o.renderOrder = 999; }); silh.visible = false; W.grupo.add(silh); G.olhoMesh = silh;
      const mt2 = new THREE.MeshBasicMaterial({ color: 0xffd090, transparent: true, opacity: .5, depthTest: false, depthWrite: false });
      const silhA = new THREE.Group();
      const corpoA = new THREE.Mesh(new THREE.CylinderGeometry(.1, .14, .95, 7), mt2); corpoA.position.y = .55; silhA.add(corpoA);
      const cabA = new THREE.Mesh(new THREE.SphereGeometry(.12, 8, 6), mt2); cabA.position.y = 1.12; silhA.add(cabA);
      silhA.traverse(o => { o.renderOrder = 999; }); silhA.visible = false; W.grupo.add(silhA); G.olhoAna = silhA;
    }
    C.toast('A visão dele: âmbar, através das paredes — ele e a menina. Mas agora ele te ouve o dobro.');
  }
  function updateOlho(dt) {
    if (G.olhoCd > 0) G.olhoCd = Math.max(0, G.olhoCd - dt);
    const s = G.olhoMesh; if (!s) return;
    const sa = G.olhoAna;
    if (G.olhoT > 0) { G.olhoT -= dt; s.visible = M.ativo; if (M.ativo && M.pos) s.position.set(M.pos.x, 0, M.pos.z); if (sa) { sa.visible = ANA.ativa; if (ANA.ativa) sa.position.set(ANA.pos.x, 0, ANA.pos.z); } if (G.olhoT <= 0) { s.visible = false; if (sa) sa.visible = false; C.toast('A visão passou.'); } }
    else { s.visible = false; if (sa) sa.visible = false; }
  }

  // --------- carrinho azul da lavanderia: distração que faz uma trilha de som
  function montarCarrinho() {
    const p = lugar('lavand', 's', .4, .6); if (!p || F().l4carrinhoUsado) return;
    const g = grupo(p.x, 0, p.z, p.ry), azul = mat(0x203a80, 0x081030, .7), metal = MAT_METAL();
    C.box(.5, .4, .7, azul, 0, .45, 0, g); for (const [dx, dz] of [[-.2, -.3], [.2, -.3], [-.2, .3], [.2, .3]]) { const roda = C.cyl(.06, .06, .03, metal, dx, .06, dz, 10, g); roda.rotation.z = Math.PI / 2; }
    C.box(.52, .3, .02, azul, 0, .7, -.34, g);
    examinar(g, () => F().l4carrinhoUsado ? '!O carrinho azul, parado lá na frente.' : P.crouch ? 'Empurrar o carrinho de roupa com força' : '!Um carrinho de roupa suja, cheio de lençóis. Agachada, dá pra empurrar.', () => {
      if (F().l4carrinhoUsado || !P.crouch) return;
      F().l4carrinhoUsado = true; g.visible = true;
      const fw = new THREE.Vector3(); camera.getWorldDirection(fw); fw.y = 0; fw.normalize();
      G.carrinho = { g, dir: fw.clone(), t: 4, cd: 0 }; C.emitNoise(p.x, p.z, 5, true);
      if (ANA.ativa && ANA.pos.distanceTo(P.pos) < 12) setTimeout(() => { if (SFX.risada) SFX.risada(p.x, p.z); }, 900);
    });
  }
  function updateCarrinho(dt) {
    const c = G.carrinho; if (!c) return;
    c.t -= dt; c.cd -= dt;
    const adiant = c.dir.clone().multiplyScalar(2.2 * dt), nx = c.g.position.x + adiant.x, nz = c.g.position.z + adiant.z;
    if (c.t > 0 && livre(nx, nz, .25)) { c.g.position.x = nx; c.g.position.z = nz; if (c.cd <= 0) { c.cd = .35; som.rolar({ x: nx, y: .2, z: nz }); C.emitNoise(nx, nz, 7); } }
    else if (c.t > 0) { c.t = 0; som.rolar({ x: c.g.position.x, y: .2, z: c.g.position.z }); C.emitNoise(c.g.position.x, c.g.position.z, 9); }
    if (c.t <= 0 && !c.parou) { c.parou = true; if (M.ativo) atrair(c.g.position.x, c.g.position.z, 5, { ouvido: .3 }); G.carrinho = null; }
  }

  // --------- canecas de lata do refeitório: passar no ritmo
  function montarCanecas() {
    const r = C.SALA('refeit'); if (!r || F().l4canecas) return;
    const cx = (r.x0 + r.x1) / 2, cz = (r.z0 + r.z1) / 2, metal = mat(0xb0a890, 0x201c14, .6, { metalness: .5 });
    const g = grupo(cx - .9, .78, cz, 0); const canecas = [];
    for (let i = 0; i < 7; i++) { const cn = C.cyl(.035, .03, .07, metal, i * .3, 0, 0, 10, g); canecas.push(cn); }
    G.canecas = { idx: 0, per: .6, t: 0, cx, cz, g, canecas, erro: 0 };
    examinar(g, () => F().l4canecas ? '!Sete canecas de lata. A gaveta já foi aberta.' : `Passar a caneca no ritmo (${G.canecas.idx}/7)`, () => {
      const q = G.canecas; if (!q || F().l4canecas) return;
      const fase = (perf() % q.per) / q.per, perto = Math.min(fase, 1 - fase);
      som.lata({ x: cx, y: .8, z: cz }, .25);
      if (perto < .13) { q.idx++; if (q.canecas[q.idx - 1]) q.canecas[q.idx - 1].position.x += .08; C.subPequeno('lia', '…'); if (q.idx >= 7) { F().l4canecas = true; C.conquista('l4_canecas'); S().inv.kits++; S().inv.pilhas++; C.renderInvMini(); C.toast('A volta inteira. A gaveta da mesa destravou: um curativo e uma pilha.'); } }
      else { q.idx = 0; q.canecas.forEach((cn, i) => cn.position.x = i * .3); C.emitNoise(cx, cz, 12, true); C.toast('[uma caneca caiu no chão com barulho de lata]'); }
    });
  }
  function updateCanecas(dt) {
    const q = G.canecas; if (!q || F().l4canecas) return;
    q.t -= dt; if (q.t <= 0 && dist(q.cx, q.cz) < 6) { q.t = q.per; som.tique({ x: q.cx, y: .8, z: q.cz }, 1, .05); }
  }

  // --------- saco de sal grosso: a linha que a fila não cruza
  function montarSal() {
    const p = lugar('despensa', 'n', .5, .4); if (!p || bolso().sal || F().l4salUsado) return;
    const g = grupo(p.x, 0, p.z, p.ry);
    C.box(.28, .34, .22, mat(0xcac4b2, 0x201c14, .5), 0, .5, 0, g);
    const et = new THREE.Mesh(new THREE.PlaneGeometry(.22, .14), matTex(escrita(['SAL'], 'rgba(40,20,10,.8)', 128, 80, 34))); et.position.set(0, .5, .12); g.add(et);
    const it = examinar(g, 'Pegar o saco de sal grosso', () => { g.visible = false; SFX.papel(); dar('sal'); setTimeout(() => lia('Sal grosso. A avó dizia que alma ruim não cruza sal.', true), 700); });
    it.on = () => g.visible;
  }
  function riscarSal() {
    const porta = (W.links || []).map(l => ({ l, d: Math.hypot(l.x - P.pos.x, l.z - P.pos.z) })).sort((a, b) => a.d - b.d)[0];
    if (!porta || porta.d > 2.6) { C.toast('Chegue perto de uma porta para riscar o sal no batente.'); return; }
    tirar('sal'); F().l4salUsado = true; SFX.papel();
    const l = porta.l, linha = new THREE.Mesh(new THREE.PlaneGeometry(1.1, .12), new THREE.MeshBasicMaterial({ color: 0xf0ece0, transparent: true, opacity: .85, depthWrite: false }));
    linha.rotation.x = -Math.PI / 2; linha.position.set(l.x, .02, l.z); W.grupo.add(linha);
    G.sal = { x: l.x, z: l.z, m: linha, usado: false };
    C.toast('Uma linha branca de sal no batente. A primeira que tentar passar vai parar aqui.');
  }
  function updateSal(dt) {
    const s = G.sal; if (!s || s.usado) return; void dt;
    if (PROC.fase === 'passando' && Math.hypot(PROC.pos.x - s.x, PROC.pos.z - s.z) < 2.2) {
      s.usado = true; PROC.t = Math.min(PROC.t, .6); C.conquista('l4_sal');
      C.toast('[a fila para no sal. Uma criança se abaixa pra olhar a linha. A procissão dá a volta.]');
      fadeSal(s); return;
    }
    if (M.ativo && M.pos && ['caca', 'investiga', 'procura', 'vasculha', 'fareja'].includes(M.state) && Math.hypot(M.pos.x - s.x, M.pos.z - s.z) < .7) {
      s.usado = true; C.conquista('l4_sal');
      M.state = 'procura'; M.path = []; M.wait = 3; M.searchT = 3; if (M.ultimo) M.ultimo.set(s.x - (P.pos.x - s.x) * .2, 0, s.z - (P.pos.z - s.z) * .2);
      C.subPequeno('inspetor', '(para no batente, fareja o chão) O que é isso...'); C.toast('[ele parou na linha de sal e voltou]'); fadeSal(s);
    }
  }
  function fadeSal(s) { let t = 0; G.tick.push(dt => { if (!s.m.parent) return; t += dt; s.m.material.opacity = Math.max(0, .85 - t * .4); if (t > 2.2) { s.m.parent.remove(s.m); s.m.geometry.dispose(); s.m.material.dispose(); } }); }

  // --------- atalho de giz das crianças (um vão agachada dentro do andar de cima)
  function montarAtalhoGiz() {
    const a = lugar('roup', 's', .3, .2), b = lugar('corr', 'n', .7, .2); if (!a || !b) return;
    const boca = (p, destino, nome) => {
      const g = grupo(p.wx + Math.sin(p.ry) * .01, .3, p.wz + Math.cos(p.ry) * .01, p.ry);
      g.add(new THREE.Mesh(new THREE.PlaneGeometry(.5, .45), new THREE.MeshStandardMaterial({ color: 0x1a1612, emissive: 0x0a0806, emissiveIntensity: .4, roughness: 1 })));
      const bon = new THREE.Mesh(new THREE.PlaneGeometry(.16, .2), matTex(escrita(['ꝗ'], 'rgba(225,220,205,.7)', 64, 80, 44))); bon.position.set(.22, .26, .003); g.add(bon);
      examinar(g, () => P.crouch ? `Passar pelo vão das crianças (sai perto da ${nome}) · a lanterna não cabe acesa` : '!Um vão baixo na parede, com um bonequinho de giz agachado. Só agachada.', () => {
        if (!P.crouch) return;
        const eraLuz = S().flashOn; if (eraLuz) S().flashOn = false;
        C.emitNoise(p.x, p.z, 3, true); som.chocalho({ x: p.x, y: .3, z: p.z });
        C.fade(true, () => { P.pos.set(destino.x, 0, destino.z); P.yaw = destino.ry + Math.PI; P.room = C.roomAt(P.pos.x, P.pos.z); C.fade(false); if (!F().l4giz) { F().l4giz = true; lia('O caminho das crianças. Elas passavam por dentro das paredes.', true); } }, 800);
      });
    };
    boca(a, b, 'corredor'); boca(b, a, 'rouparia');
  }

  // --------- vitral pintado de preto: a garrafa quebra e o luar entra
  function montarVitral() {
    const p = lugar('corr', 's', .5, .25); if (!p || F().l4vitral) return;
    const m = new THREE.Mesh(new THREE.PlaneGeometry(.9, 1.3), new THREE.MeshStandardMaterial({ color: 0x0c0c10, emissive: 0x060608, emissiveIntensity: .3, roughness: 1 }));
    m.position.set(p.wx + Math.sin(p.ry) * .02, 1.8, p.wz + Math.cos(p.ry) * .02); m.rotation.y = p.ry; W.grupo.add(m);
    G.vitral = { x: m.position.x, y: 1.8, z: m.position.z, m };
    examinar(m, '!Uma janela alta, pintada de preto por dentro. O vidro ainda está lá.', () => {});
  }
  function quebrarVitral(fim) {
    const v = G.vitral; if (!v || F().l4vitral) return false;
    if (Math.hypot(fim.x - v.x, fim.z - v.z) > 1.2 || Math.abs(fim.y - v.y) > 1.1) return false;
    F().l4vitral = true; v.m.material.color.setHex(0x2a3a60); v.m.material.emissive.setHex(0x3a4a80); v.m.material.emissiveIntensity = 1;
    SFX.vidro(v.x, v.z); C.emitNoise(v.x, v.z, 16); C.conquista('l4_vitral');
    if (M.ativo) atrair(v.x, v.z, 5, { ouvido: .4 });
    C.abrirNotaUI('O luar na parede', 'O vidro cai. O luar entra azul e bate numa parede onde as crianças pintaram, com tinta clara, o mapa dos esconderijos seguros deste andar — e as velas que os marcam.\n\n(O mapa foi para o diário.)');
    return true;
  }

  // --------- respiro do Davi: prender o ar antes de cavar
  function montarRespiro() {
    const p = lugar('cem', 'n', .3, .6) || lugar('capela', 'n', .3, .6); if (!p || F().l4respiro) return;
    const g = grupo(p.x, 0, p.z, p.ry);
    C.box(.04, .5, .04, mat(0x6a5a44, 0x1a1408, .6), 0, .25, 0, g, false); C.box(.22, .04, .04, mat(0x6a5a44, 0x1a1408, .6), 0, .36, 0, g, false);
    const et = new THREE.Mesh(new THREE.PlaneGeometry(.2, .08), matTex(escrita(['DAVI'], 'rgba(230,225,210,.7)', 128, 48, 26))); et.position.set(0, .15, .03); g.add(et);
    G.respiro = { x: p.x, z: p.z, t: 0 };
    examinar(g, () => F().l4respiro ? '!A cruzinha do Davi. A terra já cedeu, quieta.' : '!Uma cruz pequena de madeira: DAVI. (prenda o ar com ESPAÇO bem aqui)', () => {});
  }
  function updateRespiro(dt) {
    const r = G.respiro; if (!r || F().l4respiro) return;
    if (dist(r.x, r.z) < 1.6 && keys.Space && !S().hidden) {
      r.t += dt; hud.textContent = r.t >= 9 ? '' : `segurando o ar... ${Math.min(99, Math.round(r.t / 9 * 100))}%`;
      if (r.t >= 9) {
        F().l4respiro = true; hud.textContent = ''; S().inv.pilhas++; C.renderInvMini(); SFX.pegar();
        C.toast('A terra afunda sozinha, devagar, sem o barulho da pá.');
        setTimeout(() => C.sub('davi', '(de baixo, quase nada) Obrigado por não fazer barulho.'), 900);
      }
    } else if (r.t > 0) { r.t = 0; hud.textContent = ''; }
  }

  // --------- toco de vela: luz fraca que prende a Ana de perto
  function montarVela() {
    const p = lugar('banh', 'o', .7, .35); if (!p || bolso().vela || F().l4velaUsada) return;
    const g = grupo(p.wx - Math.sin(p.ry) * .05, 1.0, p.wz - Math.cos(p.ry) * .05, p.ry);
    C.cyl(.02, .025, .06, mat(0xe8e0cc, 0x403828, .6), 0, 0, 0, 8, g);
    const it = examinar(g, 'Pegar o toco de vela', () => { g.visible = false; SFX.pegar(); dar('vela'); setTimeout(() => lia('Um toco de vela. Do Clube dos Que Não Dormem.', true), 700); });
    it.on = () => g.visible;
  }
  function acenderVela() {
    if (S().hidden) { C.toast('Aqui dentro não dá.'); return; }
    tirar('vela'); F().l4velaUsada = true;
    const fw = new THREE.Vector3(); camera.getWorldDirection(fw); fw.y = 0; fw.normalize();
    const x = P.pos.x + fw.x * .9, z = P.pos.z + fw.z * .9;
    const g = grupo(x, .9, z, 0); C.cyl(.02, .025, .07, mat(0xe8e0cc, 0x403828, .6), 0, 0, 0, 8, g);
    const chama = new THREE.Mesh(new THREE.SphereGeometry(.015, 6, 5), new THREE.MeshBasicMaterial({ color: 0xffc060 })); chama.scale.y = 2.2; chama.position.y = .05; g.add(chama);
    const luz = new THREE.PointLight(0xffb060, .7, 3.2, 2); luz.position.y = .1; g.add(luz);
    G.vela = { g, luz, x, z, t: 40 };
    C.toast('A vela acesa. A luzinha segura a Ana se ela chegar perto.');
  }
  function updateVela(dt) {
    const v = G.vela; if (!v) return;
    v.t -= dt; v.luz.intensity = (v.t < 4 ? v.t / 4 : 1) * (.55 + Math.sin(perf() * 11) * .12);
    if (ANA.ativa && ANA.pos.distanceTo(v.g.position) < 2.4) { G.presa = Math.max(G.presa, .4); ANA.conta = Math.min(ANA.conta, ANA.conta); }
    if (M.ativo && M.pos && M.pos.distanceTo(v.g.position) < 1.2) { v.t = 0; C.subPequeno('inspetor', 'Quem acendeu isso?'); }
    if (v.t <= 0) { W.grupo.remove(v.g); v.g.traverse(o => { if (o.geometry) o.geometry.dispose(); }); G.vela = null; C.toast('A vela apagou.'); }
  }

  // --------- telefone de disco da recepção: ramais de 1979
  function montarRecepcao() {
    const p = lugar('hall', 'o', .35, .5); if (!p || !C.SALA('hall')) return;
    const g = grupo(p.wx - Math.sin(p.ry) * .05, 1.1, p.wz - Math.cos(p.ry) * .05, p.ry);
    C.box(.2, .24, .12, mat(0x201c18, 0x080604, .5), 0, 0, .06, g); C.cyl(.06, .06, .012, mat(0xd8d0c0, 0x303030, .5), 0, -.02, .12, 14, g).rotation.x = Math.PI / 2;
    G.tel2 = { x: p.x, z: p.z };
    examinar(g, () => S().flags.energia ? 'Discar no telefone preto da recepção' : '!Um telefone preto, pesado. Sem energia, só o disco gira.', () => abrirDisco2());
  }
  function abrirDisco2() {
    const st = { d: '' };
    const render = () => { ov.innerHTML = `<h3>TELEFONE DA RECEPÇÃO</h3><div class="disco">${esc((st.d + '__').slice(0, 2))}</div><small>números 0 a 9 giram o disco · ESC desliga</small>`; };
    abrirModo({ tipo: 'disco', render, tecla(e) {
      if (e.code === 'Escape') { fecharModo(); return; }
      const m = /^(Digit|Numpad)(\d)$/.exec(e.code); if (!m) return;
      const n = +m[2]; st.d += m[2]; som.tique({ x: G.tel2.x, y: 1.1, z: G.tel2.z }, n || 10, .06); C.emitNoise(G.tel2.x, G.tel2.z, 2.5); render();
      if (st.d.length >= 2) { const d = st.d; setTimeout(() => { fecharModo(); discar2(d); }, 650); }
    } });
  }
  function discar2(d) {
    if (!S().flags.energia) { C.toast('A linha está muda.'); return; }
    if (d === '20') { som.respira(null); C.sub('voz', '(voz de mulher, cansada, de muito longe) A linha do Internato São Lázaro está ocupada desde o dia 14. Desde o dia 14. Desde o...', true); C.conquista('l4_recepcao'); return; }
    if (d === '21') { C.sub('moacir', '(voz de menino, baixinho) Eu quero voltar pra cama. Por favor. Eu quero voltar pra cama.', true); setTimeout(() => lia('Esse era ele. Menino. Antes.'), 4200); return; }
    if (d === '37') { C.sub('voz', '(uma voz lê sem parar) Albano. Ana. Bento. Davi. Luiz. Moacir. Tomé. Albano. Ana. Bento...', true); setTimeout(() => C.toast('[a lista recomeça do começo]'), 6500); return; }
    C.toast('Chama, chama... e ninguém atende.');
  }

  // --------- bolinhas de gude com padrão: três mapas, uma lápide
  const GUDE_DEF = { terreo: { sid: 'biblio', flag: 'l4gudeA', nome: 'listrada' }, superior: { sid: 'dormE', flag: 'l4gudeB', nome: 'pintada' }, tuneis: { sid: 't4', flag: 'l4gudeC', nome: 'lisa' } };
  function montarGudeMapa(id) {
    const d = GUDE_DEF[id]; if (!d || F()[d.flag]) return;
    const p = lugar(d.sid, pick(['n', 's', 'o', 'l']), rand(.3, .7), .45); if (!p) return;
    const cor = id === 'terreo' ? 0xc04040 : id === 'superior' ? 0x40a060 : 0xd8d0c0;
    const m = new THREE.Mesh(new THREE.SphereGeometry(.035, 10, 8), new THREE.MeshStandardMaterial({ color: cor, emissive: 0x201008, emissiveIntensity: .8, roughness: .2, metalness: .2 }));
    m.position.set(p.x, .035, p.z); W.grupo.add(m);
    const it = examinar(m, `Pegar a bolinha de gude ${d.nome}`, () => { m.visible = false; F()[d.flag] = true; SFX.pegar(); C.renderInvMini(); setTimeout(() => lia(`Uma bolinha de gude ${d.nome}. Igual às do Bento.`, true), 700); });
    it.on = () => m.visible;
    G.segredos = G.segredos || []; G.segredos.push({ x: p.x, z: p.z, feito: () => !!F()[d.flag] });
  }
  function montarLapide() {
    const p = lugar('cem', 's', .6, .5) || lugar('capela', 'o', .3, .5); if (!p) return;
    const g = grupo(p.x, 0, p.z, p.ry);
    C.box(.5, .7, .1, mat(0x8a847a, 0x1a1816, .4), 0, .35, 0, g);
    const et = new THREE.Mesh(new THREE.PlaneGeometry(.4, .16), matTex(escrita(['BENTO'], 'rgba(30,28,24,.8)', 256, 96, 34))); et.position.set(0, .45, .055); g.add(et);
    for (let i = 0; i < 3; i++) { C.cyl(.04, .04, .03, mat(0x2a2824, 0x0a0806, .5), (i - 1) * .12, .2, .05, 10, g).rotation.x = Math.PI / 2; }
    examinar(g, () => {
      const n = ['l4gudeA', 'l4gudeB', 'l4gudeC'].filter(k => F()[k]).length;
      return F().l4bento ? '!A lápide do Bento. A gaveta de pedra já abriu.' : n < 3 ? `!Lápide de BENTO, com três furinhos. Faltam ${3 - n} bolinhas de gude.` : 'Encaixar as três bolinhas de gude';
    }, () => {
      if (F().l4bento) return;
      const n = ['l4gudeA', 'l4gudeB', 'l4gudeC'].filter(k => F()[k]).length; if (n < 3) return;
      F().l4bento = true; som.rolar({ x: p.x, y: .2, z: p.z }); C.conquista('l4_bento');
      const s = S(); s.inv.kits++; s.inv.pilhas++; C.renderInvMini();
      C.abrirNotaUI('A gaveta de pedra do Bento', 'As três bolinhas encaixam com um estalo. Uma gaveta de pedra desliza:\n\nUm curativo, uma pilha e um bilhete —\n"Guardei pra quem viesse me procurar. Ninguém veio. Até você. — B."');
    });
  }

  // --------- a bala faz da Ana uma aliada que avisa
  function updateAliada(dt) {
    if (!F().l4balaDada || !ANA.ativa) { G.aliadaCd = 0; return; }
    G.aliadaCd = (G.aliadaCd || 0) - dt; if (G.aliadaCd > 0) return;
    if (M.ativo && M.pos && M.pos.distanceTo(P.pos) < 9 && ANA.pos.distanceTo(P.pos) < 14) { G.aliadaCd = 12; C.subPequeno('ana', '(cantarolando, só pra você) ele tá chegando...'); }
  }

  const COR_LATA = new THREE.Color(1, .82, .5);
  // ------------------------------------------------ ganchos para o motor
  return {
    mapa,
    update(dt) {
      if (!G || !S()) return;
      try {
        if (modo && (S().dead || C.ui || C.mode !== 'jogo' || M.state === 'agarra')) fecharModo();
        if (modo && modo.tick) modo.tick(dt);
        for (const f of G.tick) f(dt);
        G.presa = Math.max(0, G.presa - dt); if (G.apitoT) G.apitoT = Math.max(0, G.apitoT - dt); if (G.ecoCd) G.ecoCd = Math.max(0, G.ecoCd - dt);
        if (G.giraT > 0) { G.giraT -= dt; if (M.ativo) M.yaw += dt * 2.2; }
        updateIsca(dt); updateBolo(dt); updateLampada(dt); updateChuva(dt); updateEspelho(dt); updateCentri(dt); updateLimao(dt); updateGude(dt);
        updateSoldado(dt); updatePiao(dt); updateRevelados(dt); updateLuzNegra(dt); updatePiscadas(dt); updateConta(); updateSombra(dt); updateDeslize(dt); updateDescalca(dt); updateHora(dt);
        updatePedrinhas(dt); updateOlho(dt); updateCarrinho(dt); updateCanecas(dt); updateSal(dt); updateRespiro(dt); updateVela(dt); updateAliada(dt);
        for (let i = G.toques.length - 1; i >= 0; i--) { const q = G.toques[i]; q.t -= dt; q.cd -= dt; if (q.cd <= 0) { q.cd = 2.2; som.toque({ x: q.x, y: 1.3, z: q.z }); if (!q.mudo) C.emitNoise(q.x, q.z, 14); } if (q.t <= 0) G.toques.splice(i, 1); }
        for (const m of G.vermelhos) { m.visible = !!(F().l4vermelho && S().flashOn && m.position.distanceTo(camera.position) < 8); }
        if (F().l4lanterninha && S().flashOn) { if (G.batAnt != null && S().battery < G.batAnt) S().battery = G.batAnt; G.batAnt = S().battery; } else G.batAnt = null;
        if (S().chapter >= 2 && !sess.cap1ok) { sess.cap1ok = true; const o = ls.get(); if (!o.cap1) { o.cap1 = F().l4noite || 1; ls.set(o); } }
      } catch (e) { if (!G.erro) { G.erro = true; console.warn('jogabilidade-segredos', e); } }
    },
    depois() { // depois da luz da lanterna ser montada (visual): cor e força da luz
      if (!S() || C.mode !== 'jogo') return;
      const f = C.flash; if (!f || !S().flashOn) return;
      if (G && G.luzNegra > 0) { f.color.setRGB(.55, .25, 1); if (C.flashFill) C.flashFill.color.setRGB(.4, .2, .9); }
      else if (F().l4vermelho) { f.color.setRGB(1, .14, .08); if (C.flashFill) C.flashFill.color.setRGB(.8, .1, .06); }
      if (F().l4lanterninha) { f.intensity *= .45; f.angle *= .75; f.color.lerp(COR_LATA, .5); }
    },
    tecla(e) {
      const s = S(); if (!s || !G) return false;
      if (e.code === 'KeyU') { if (!itensBolso().length) return false; usar(); return true; }
      if (e.code === 'KeyY') { const l = itensBolso(); if (l.length < 2) { if (l.length) C.toast(`No bolso: ${ITENS[l[0]].nome}. ${ITENS[l[0]].dica}`); return !!l.length; } sess.sel = (sess.sel + 1) % l.length; C.renderInvMini(); C.toast(`No bolso: ${ITENS[l[sess.sel]].nome}. ${ITENS[l[sess.sel]].dica}`); return true; }
      if (e.code === 'KeyE' && bolso().bala && darBala()) return true;
      const m = /^Digit([1-9])$/.exec(e.code); if (m && ANA.ativa) return contarJunto(+m[1]);
      return false;
    },
    piscou() { try { piscou(); } catch (e) {} },
    pilha() { const n = (F().l4pilhas || 0) + 1; F().l4pilhas = n; if (n === 9) setTimeout(() => { C.abrirNotaUI(TXT.pai.titulo, TXT.pai.texto); setTimeout(() => lia('O pai... ele já tinha vindo aqui?'), 600); }, 900); },
    ruidoMul() { let k = 1; const s = S(); if (!s) return 1; if (F().l4descalca) k *= .6; if (G && G.chuva && dist(G.chuva.x, G.chuva.z) < 10) k *= .5; return k; },
    ouvidoMul() { if (!G) return 1; if (G.apitoT > 0) return 0; if (G.olhoT > 0) return 2; if (G.isca && G.isca.chegou) return G.isca.ouvido; return 1; },
    semLuzAna(d) { if (!S()) return false; if (F().l4vermelho && S().flashOn) return true; if (F().l4lanterninha && d > 4) return true; return false; },
    anaPresa() { return !!(G && G.presa > 0); },
    danoMul(quem) { if (quem === 'procissao' && F().l4amuleto) { F().l4amuleto = 0; C.toast('O amuleto do relógio esquentou no seu bolso e rachou.'); C.renderInvMini(); return .5; } return 1; },
    salvarDaMorte() { const s = S(); if (F().l4adrenalina === s.chapter && !F().l4adrUsada) { F().l4adrUsada = true; setTimeout(() => { C.toast('A adrenalina. O seu coração disparou e você levantou.'); lia('Ainda não. Ainda não.'); }, 300); C.renderInvMini(); return true; } return false; },
    morte(quem) {
      try {
        const k = quem === 'inspetor' ? M.pos : quem === 'ana' ? ANA.pos : PROC.pos;
        sess.morte = { mapa: W.mapa, cap: S().chapter, x: P.pos.x, z: P.pos.z, yaw: Math.atan2(-(k.x - P.pos.x), -(k.z - P.pos.z)) };
        const o = ls.get(); if (o.bilhete && o.bilhete.noite === F().l4noite && !o.bilhete.fuligem) { o.bilhete.fuligem = true; ls.set(o); }
        fecharModo();
      } catch (e) {}
    },
    garrafa(g) {
      try {
        const fim = g.fim, ini = g.ini;
        for (const L of W.lampadas) {
          if (!L.ligada || L.estourada || !L.bulbo) continue;
          const b = L.bulbo.position, ab = fim.clone().sub(ini), t = clamp(b.clone().sub(ini).dot(ab) / Math.max(.01, ab.lengthSq()), 0, 1), q = ini.clone().addScaledVector(ab, t);
          q.y += Math.sin(t * Math.PI) * 1.2;
          if (q.distanceTo(b) < .45) {
            L.estourada = true; L.ligada = false; L.luz.intensity = 0; L.bulbo.material.emissiveIntensity = 0; if (L.halo) L.halo.material.opacity = 0;
            SFX.vidro(b.x, b.z); C.emitNoise(b.x, b.z, 17, false, true);
            for (let i = 0; i < 6; i++) { const f = new THREE.Mesh(new THREE.SphereGeometry(.012, 4, 3), new THREE.MeshBasicMaterial({ color: 0xffd080 })); f.position.copy(b); W.grupo.add(f); const v = new THREE.Vector3(rand(-1, 1), rand(0, 1), rand(-1, 1)); let tt = 0; G.tick.push(dt => { if (!f.parent) return; tt += dt; v.y -= 9.8 * dt; f.position.addScaledVector(v, dt); if (tt > .8 || f.position.y < .02) { f.parent.remove(f); f.geometry.dispose(); f.material.dispose(); } }); }
            if (!F().l4lampadaQuebrada) { F().l4lampadaQuebrada = true; setTimeout(() => lia('Escuro de vez aqui. Pra Procissão... e pra Ana também.', true), 900); }
            return true;
          }
        }
        if (G.vitral && quebrarVitral(fim)) return true;
        const sala = C.roomAt(fim.x, fim.z);
        if (sala && ['sotao', 'lavand', 'hub'].includes(sala.id) && (G.ecoCd || 0) <= 0) {
          G.ecoCd = 15; som.lata({ x: fim.x, y: .2, z: fim.z }, .3);
          C.toast('[o vidro caiu lá no fundo, com um eco: parece ter vindo de outro canto]');
          const r = objetivoSala() || C.SALA('hall') || sala, ex = (r.x0 + r.x1) / 2, ez = (r.z0 + r.z1) / 2;
          if (M.ativo) atrair(ex, ez, 10, { forca: true, ouvido: .4 });
          if (dist(fim.x, fim.z) > 6) C.conquista('l4_cesta');
          return true;
        }
        if (W.mapa === 'cemiterio' && fim.y > 3 && C.roomAt(fim.x, fim.z).id === 'capela' && !F().l4badalada) {
          F().l4badalada = true; som.sino({ x: fim.x, y: 5, z: fim.z }, .6, .91); C.conquista('l4_badalada'); C.toast('[uma badalada torta, rachada]');
          if (M.ativo) { M.state = 'investiga'; atrair(fim.x, fim.z, 8, { forca: true, ouvido: .2 }); }
          if (W.def.procissao && W.def.procissao() && !PROC.fase) S().timers.procissao = Math.min(S().timers.procissao, 8);
          return false;
        }
      } catch (e) {}
      return false;
    },
    inv,
    get modo() { return modo; },
    teste: { USOS, abrirMaquina: () => abrirMaquina(), discar, jogarVelha, luzNegra, foto, codLampada, conferirSOS, sess, get G() { return G; } }
  };
}
