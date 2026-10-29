// =====================================================================
// SEGREDOS DO SOM (Lote 4) — recompensas para quem escuta
// Números do telefone, bipes no fim da fita do Tomé, sussurros num ouvido só, a voz dentro do sino,
// o gravador que repete a sua noite, a cisterna que devolve o seu barulho, o rádio que pega a respiração
// dele, o dueto com o Inspetor, ralos, panelas, lata, chuva, fitas em outra rotação, o fim do dial.
// Ligado ao motor por poucas linhas (procure AUDS em jogo.js). Usa as vozes e cadeias de src/audio-mundo.js.
// =====================================================================

const LS_KEY = 'hora-silencio-l4som';
const NUMS = ['zero', 'um', 'dois', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove'];
const NUM_CELESTE = '5813'; // os bipes no fim da fita do Tomé
const DTMF = { 1: [697, 1209], 2: [697, 1336], 3: [697, 1477], 4: [770, 1209], 5: [770, 1336], 6: [770, 1477], 7: [852, 1209], 8: [852, 1336], 9: [852, 1477], 0: [941, 1336] };
// tudo o que conta no "Segredo do som (n/N)"
const SEGREDOS = ['agulha', 'estrofe', 'luiz', 'ninar', 'narra', 'dial_cozinha', 'dial_celeste', 'dial_secreta', 'dial_cem', 'tel_0190', 'tel_2241', 'tel_0037', 'tel_celeste', 'dtmf', 'sus_diret', 'sus_corr', 'sus_t4', 'gravador', 'eco', 'freq', 'dueto', 'ralo', 'ralo2', 'panelas', 'lata', 'chuva', 'rotacao', 'baixinho', 'recado'];

export const CONQ_SOM = [
  { id: 'l4a_celeste', nome: 'A Última Ligação', desc: 'Disque o número escondido no fim da fita do Tomé.', secreta: true, dica: 'quatro bipes' },
  { id: 'l4a_ninguem', nome: 'Ninguém Vem', desc: 'Ligue para a delegacia do telefone da recepção.', secreta: true, dica: 'a lista da parede' },
  { id: 'l4a_disco', nome: 'Lado Escondido do Disco', desc: 'Gire o disco da vitrola para trás.', secreta: true, dica: 'segure para trás' },
  { id: 'l4a_luiz', nome: 'O Nome na Caixinha', desc: 'Dê corda na caixinha ao contrário.', secreta: true, dica: 'a manivela também volta' },
  { id: 'l4a_ninar', nome: 'Dorme, Meus Três', desc: 'Ouça a caixinha até a última nota.', secreta: true, dica: 'não saia de perto' },
  { id: 'l4a_radio', nome: 'Notícia de Última Hora', desc: 'Fique parada tempo demais perto de um rádio.', secreta: true, dica: 'o locutor está vendo' },
  { id: 'l4a_fone', nome: 'Ouvido Direito', desc: 'Ouça os três sussurros que só o fone entrega.', secreta: true, dica: 'jogue de fone' },
  { id: 'l4a_gravador', nome: 'Eu Tava Junto', desc: 'Ouça o gravador da sala do diretor sem olhar para trás.', secreta: true, dica: 'a luz vermelha' },
  { id: 'l4a_eco', nome: 'A Casa Repete', desc: 'Faça o eco da cisterna enganar o Inspetor.', secreta: true, dica: 'nove segundos' },
  { id: 'l4a_freq', nome: 'Na Mesma Frequência', desc: 'Sintonize a respiração dele no rádio do Seu Joaquim.', secreta: true, dica: 'segure B perto dele' },
  { id: 'l4a_dueto', nome: 'Dueto', desc: 'Assobie o hino com o Inspetor três vezes.', secreta: true, dica: 'segure V quando ele cantarola' },
  { id: 'l4a_ralo', nome: 'Pelo Cano', desc: 'Escute os túneis pelo ralo do banheiro.', secreta: true, dica: 'agachada e quieta' },
  { id: 'l4a_panelas', nome: 'Já Pra Mesa', desc: 'Toque o hino nas panelas da cozinha.', secreta: true, dica: 'a agulha sabe as notas' },
  { id: 'l4a_lata', nome: 'Telefone de Lata', desc: 'Escute a lata do dormitório até ninguém falar.', secreta: true, dica: 'três vezes' },
  { id: 'l4a_chuva', nome: 'A Chuva Lembra', desc: 'Fique parada olhando a capela até a chuva cantar.', secreta: true, dica: 'quarenta segundos' },
  { id: 'l4a_rotacao', nome: 'Rotação Errada', desc: 'Ouça uma fita em outra velocidade.', secreta: true, dica: 'ALT ou SHIFT na fita' },
  { id: 'l4a_baixinho', nome: 'Baixinho', desc: 'Ouça a fita da Irmã com o volume quase no zero.', secreta: true, dica: 'de madrugada' },
  { id: 'l4a_espectro', nome: 'O Som Tem Desenho', desc: 'Ache o chiado desenhado no fim do dial.', secreta: true, dica: 'sala do diretor' },
  { id: 'l4a_tudo', nome: 'Ouvido Absoluto', desc: 'Ache todos os segredos do som.', secreta: true, dica: 'escute tudo' }
];

const TXT = {
  achou: (n, t) => `Segredo do som (${n}/${t})`,
  // telefone da recepção
  t190: [
    { quem: 'voz', texto: '(no telefone, uma telefonista de outro tempo) Delegacia da Serra, boa noite.', f0: 230 },
    { quem: 'voz', texto: '(no telefone) O incêndio no São Lázaro? A viatura já está a caminho, moça. Fica na linha.', f0: 230 }
  ],
  t190sirene: '(no telefone, uma sirene que vai chegando... chegando... e para de uma vez)',
  t190insp: '(no telefone, depois de uma respiração funda) Ninguém vem.',
  t190de: '(no telefone: só a sirene, longe, que nunca chega)',
  t2241: [
    { quem: 'voz', texto: '(no telefone, um padre cansado) Bispado da Serra.', f0: 110 },
    { quem: 'voz', texto: '(no telefone) Irmã Celeste de novo? O diretor Albano responde pelo internato, irmã. Vá dormir.', f0: 110 }
  ],
  t2241Lia: 'Ela pediu ajuda. E mandaram ela dormir.',
  t0037: [
    { quem: 'voz', texto: '(no telefone, uma criança contando) Trinta e cinco... trinta e seis...', f0: 340 },
    { quem: 'voz', texto: '(no telefone) ...cadê o trinta e sete?', f0: 360 }
  ],
  t0037Lia: 'Trinta e sete. Sempre trinta e sete.',
  celeste: [
    { quem: 'celeste', texto: '(no telefone, uma mulher sem fôlego, a ligação chiando) Aqui é a Irmã Celeste, do São Lázaro. Tem fogo na capela.', f0: 215 },
    { quem: 'celeste', texto: '(no telefone) As crianças estão no porão. A porta foi trancada por fora. Pelo amor de Deus, alguém...', f0: 225 }
  ],
  celesteCai: '(a linha cai. Depois, bem baixinho, alguém do outro lado continua respirando)',
  celesteLia: 'Mil novecentos e setenta e nove. Ela ligou. Ninguém atendeu a tempo.',
  dtmfLia: 'Bipes no fim da fita. Quatro. Alguém discou um número enquanto gravava.',
  // sussurros de um lado só
  susDiret: q => `${q.split('').reverse().map(d => NUMS[d]).join('... ')}... ao contrário.`,
  susCorr: 'ela não abre porta fechada. fecha a porta.',
  susT4: (a, b) => `o primeiro é ${NUMS[a]}. o último é ${NUMS[b]}.`,
  susLeg: (lado, t) => lado.startsWith('que') ? `(um sussurro ${lado}) ${t}` : `(um sussurro só no ouvido ${lado}) ${t}`,
  susPerdeu: '[um sussurro que você não pegou]',
  sinoVoz: '(dentro do sino, uma voz grave) ...fique.',
  // gravador da sala do diretor
  gravLabel: '<b>E</b>Rebobinar e tocar o gravador<small style="opacity:.6"> · a luz vermelha está acesa</small>',
  gravJa: 'O gravador. A fita acabou.',
  gravVazio: '(só chiado. Você andou quieta demais até para ele.)',
  gravIni: '(o gravador rebobina com um guincho. Depois toca os seus passos, com eco, desde que você desceu)',
  gravJunto: '(no fim da fita, uma voz de menino, bem perto do microfone) ...eu tava junto.',
  gravVirou: 'Não tem ninguém. Não tinha ninguém. ...Tinha?',
  gravNada: 'Os meus passos. Só os meus.',
  // cisterna
  ecoLia: 'O meu barulho voltou. Nove segundos depois. A cisterna repete tudo.',
  // rádio do Seu Joaquim
  freqJoaquim: '(no rádio, a voz do Seu Joaquim por cima da respiração) O diretor pôs um rádio de babá no apito dele, moça. Pra saber onde ele anda. Agora você sabe também.',
  // dueto
  duetoUm: '(ele para de cantarolar. Vira a cabeça. E completa a última nota)',
  duetoDois: 'Quem assobia o hino da casa?',
  duetoTres: '(assobiando junto, baixinho) ...o Davi assobiava assim. Vai dormir, menina.',
  // ralos
  raloT: v => [
    { quem: 'voz', texto: `(cochichos de criança, pelo cano) ...a ${v[1]} primeiro... depois a ${v[0]}...` },
    { quem: 'voz', texto: `(outra voz, brava) Não! A ${v[0]} primeiro. Depois a ${v[1]}. Depois a ${v[2]}.` },
    { quem: 'voz', texto: '(as duas, de uma vez) Shh. Ela tá ouvindo.' }
  ],
  raloS: '(pelo cano, de muito longe, um menino cantarola o hino. Do outro lado, alguém encosta o ouvido e respira)',
  raloGota: 'Uma gota. No meu rosto. Veio de cima... não tem nada em cima.',
  raloDica: 'Tem água correndo lá embaixo. E alguém.',
  // panelas
  panelaLabel: n => `<b>E</b>Bater na panela<small style="opacity:.6"> · ${n}</small>`,
  panelaOk: '(uma colher bate três vezes na mesa. Uma voz de cozinheira, de outro tempo) Já pra mesa, que esfria!',
  panelaPremio: 'Dentro da última panela, embrulhado num pano de prato: um curativo.',
  // lata
  lataLabel: '<b>E</b>Encostar o ouvido na lata',
  lata: [
    [{ quem: 'voz', texto: '(cochicho de menino, pela lata) Tomé? Tá acordado?', f0: 300 }, { quem: 'tome', texto: '(pela lata) Tô. O Inspetor passou duas vezes.', f0: 380 }, { quem: 'voz', texto: '(pela lata) Se ele parar na porta, puxa o barbante duas vezes.', f0: 300 }],
    [{ quem: 'voz', texto: '(pela lata) Amanhã a gente toca o sino. O Davi prometeu.', f0: 300 }, { quem: 'tome', texto: '(pela lata) E se ele ouvir?', f0: 380 }, { quem: 'voz', texto: '(pela lata) Aí a gente não respira.', f0: 300 }]
  ],
  lataNinguem: '(ninguém fala. Do outro lado do barbante, alguém respira. O barbante treme.)',
  lataLia: 'Do outro lado não tem ninguém. A lata de lá está fora do gancho.',
  lataFrouxo: 'Só o barbante, frouxo. Ninguém do outro lado.',
  // chuva
  chuvaLia: 'A chuva... tocou o hino. Nota por nota, nas calhas.',
  // fitas
  rot3: '(em meia velocidade, por baixo da voz do Moacir, outra voz, adulta e cansada) ...eu ouvi tudo isso também.',
  rot1: '(acelerada, no fim da fita, uma risada de menina que não estava ali)',
  baixo: o => [
    { quem: 'celeste', texto: '(sussurrado, por baixo da fita) Aumenta não. Ele tá ouvindo você ouvir.' },
    { quem: 'celeste', texto: `(sussurrado) A primeira válvula é a ${o[0]}. A última é a ${o[2]}.` }
  ],
  // rádio do posto, da segunda noite em diante
  recado: nome => `(o locutor, quase sussurrando) Agora um pedido de quem não dorme: para ${nome}, de um ouvinte do São Lázaro.`,
  recadoMortes: '...e o ouvinte pediu pra dizer que tá esperando. Que da outra vez ela demorou.',
  recadoCalmo: '...e ele pediu pra ela não responder quando chamarem o nome dela.',
  // fim do dial
  numerosIni: '(no fim do dial, entre duas estações, uma menina lê números em grupos de quatro)',
  numerosLia: 'Números. Quatro e quatro. Alguém quer que eu anote.',
  novela: [
    { quem: 'radio', texto: '(uma radionovela, abafada) ...e continua Coração de Serra. A menina chega ao colégio queimado, de noite, com a lanterna fraca.', f0: 128 },
    { quem: 'voz', texto: '(voz de atriz) Eu vim buscar o meu irmão. Eu não vou embora sem ele.', f0: 230 },
    { quem: 'voz', texto: '(voz de ator, grave) Aqui ninguém vai embora, menina. Aqui todo mundo fica.', f0: 90 },
    { quem: 'radio', texto: '(o locutor) ...e a Lia chegou. Não perca amanhã, no mesmo horário.', f0: 128 }
  ],
  novelaLia: 'Lia. Ele disse Lia.',
  espectroLia: 'Esse chiado tem forma. Como se tivesse alguma coisa desenhada dentro do som.',
  fogo: nome => [
    { quem: 'radio', texto: '(uma transmissão de 1979, tremida) ...o fogo já tomou a capela do São Lázaro. A estrada velha está fechada.', f0: 128 },
    { quem: 'radio', texto: '(o locutor lê devagar) ...a lista dos desaparecidos: Davi Moraes. Ana Luísa Prado. Tomé Ribeiro.', f0: 124 },
    { quem: 'radio', texto: `(depois de uma pausa) ...e ${nome}.`, f0: 120 }
  ],
  fogoLia: 'Esse é o meu nome. Numa transmissão de 1979.'
};

const LEG = {
  dtmf: { t: 'bipes de telefone, no fim da fita', imp: 1, cd: 5, cat: 'h' },
  vozSino: { t: 'dentro do sino, uma voz: "fique"', imp: 0, cd: 30, cat: 'h' },
  sussLado: { t: 'um sussurro, só de um lado', imp: 0, cd: 10, cat: 'h' },
  panelaBate: { t: 'uma panela ressoa, alto', imp: 1, cd: 2, cat: 'p', pos: a => a[0] },
  ecoCisterna: { t: 'o seu barulho volta, atrasado', imp: 1, cd: 6, cat: 'p', pos: a => a[0] },
  gravRolo: { t: 'o gravador toca passos com eco', imp: 1, cd: 10, cat: 'h', pos: a => a[0] },
  radioInsp: { t: 'no rádio, uma respiração que não é sua', imp: 1, cd: 8, cat: 'p' },
  assobioLia: { t: 'a Lia assobia o hino', imp: 1, cd: 6, cat: 'p' },
  raloCano: { t: 'cochichos pelo cano', imp: 1, cd: 10, cat: 'h' },
  lataVoz: { t: 'cochichos pela lata', imp: 1, cd: 6, cat: 'h' },
  chuvaHino: { t: 'as gotas nas calhas tocam uma melodia', imp: 1, cd: 30, cat: 'h' },
  espectro: { t: 'o chiado fica estranho, quase organizado', imp: 1, cd: 10, cat: 'h' },
  telLinha: { t: 'uma voz no telefone, longe', imp: 0, cd: 6, cat: 'h' }
};

export function instalarAudioSegredos(C) {
  const { P, M, W, keys, THREE, MAT, OPT, R } = C;
  const ac = () => C.AC, St = () => C.S, fl = () => C.S.flags, I = () => C.AUDM && C.AUDM.int;
  const rand = (a, b) => a + Math.random() * (b - a), pick = a => a[Math.random() * a.length | 0];
  const teste = () => !!window.__teste;
  const mais = (s, fn) => setTimeout(() => { try { if (ac()) fn(); } catch (e) { console.warn('segredos do som', e); } }, Math.max(0, s * 1000));
  const ruidoMundo = (x, z, r, garrafa) => { if (!teste() && St() && !St().dead) C.emitNoise(x, z, r, false, garrafa); };
  const dist = (a, x, z) => Math.hypot(a.x - x, a.z - z);
  const biq = (tipo, f, q = 1) => { const b = ac().createBiquadFilter(); b.type = tipo; b.frequency.value = f; b.Q.value = q; return b; };
  const ls = { get() { try { return JSON.parse(localStorage.getItem(LS_KEY)) || {}; } catch (e) { return {}; } }, set(v) { try { localStorage.setItem(LS_KEY, JSON.stringify(v)); } catch (e) {} } };
  const nomeJ = () => { try { const n = JSON.parse(localStorage.getItem('hora-silencio-nome') || '""'); return typeof n === 'string' ? n.trim().slice(0, 16) : ''; } catch (e) { return ''; } };
  for (const c of CONQ_SOM) if (!R.conquistas.some(x => x.id === c.id)) R.conquistas.push(c);
  if (C.legendas) Object.assign(C.legendas, LEG);
  for (const k of Object.keys(LEG)) if (!C.SOM[k]) C.SOM[k] = () => {}; // o som de verdade é tocado aqui; o SOM só leva a legenda
  const conq = id => { try { C.conquista(id); } catch (e) {} };

  // ---------------------------------------------------------------- contador dos segredos do som (vale entre noites)
  function achar(id) {
    if (!SEGREDOS.includes(id)) return;
    const d = ls.get(); d.achados = d.achados || [];
    if (d.achados.includes(id)) return;
    d.achados.push(id); ls.set(d);
    const n = d.achados.length;
    mais(2.5, () => C.toast(TXT.achou(n, SEGREDOS.length)));
    if (n >= SEGREDOS.length) conq('l4a_tudo');
  }

  // ---------------------------------------------------------------- cadeias
  function linhaTel() { // fone do telefone no ouvido: banda estreita, chiado e um zumbido de linha
    const A = ac(), out = C.saida(null, .04, 'voz'); out.gain.value = .9;
    const inp = A.createGain(), hp = biq('highpass', 330), lp = biq('lowpass', 3100), ws = A.createWaveShaper(); ws.curve = C.curvaDist(3);
    inp.connect(hp); hp.connect(lp); lp.connect(ws); ws.connect(out);
    const s = C.ruido(true), sf = biq('bandpass', 2400, .7), sg = A.createGain(); sg.gain.value = .018; s.connect(sf); sf.connect(sg); sg.connect(out); s.start(A.currentTime, Math.random());
    const hum = A.createOscillator(); hum.frequency.value = 50; const hg = A.createGain(); hg.gain.value = .006; hum.connect(hg); hg.connect(out); hum.start();
    return { inp, out, fim(t) { out.gain.setValueAtTime(.9, t); out.gain.linearRampToValueAtTime(0, t + .25); for (const x of [s, hum]) try { x.stop(t + .3); } catch (e) {} } };
  }
  // fala uma sequência de linhas por uma cadeia, com a legenda na hora de cada uma
  function falarLinhas(dest, t, linhas, base = {}) {
    for (const l of linhas) {
      const ini = t; mais(ini - ac().currentTime, () => C.sub(l.quem, l.texto, true));
      t = I().falarTxt(dest, t, l.fala || l.texto, { f0: l.f0 || base.f0 || 140, vel: l.vel || base.vel || .14, formK: l.f0 > 250 ? 1.3 : l.f0 < 100 ? .9 : 1, q: 5, sussurro: base.sussurro, pk: base.pk }) + .8;
    }
    return t;
  }
  function tom(dest, t, f, dur, pk, tipo = 'sine') { const g = ac().createGain(); g.connect(dest); C.osc(tipo, f, t, dur + .05, g); C.env(g, t, .005, pk, dur); }

  // ---------------------------------------------------------------- 1. telefone da recepção: números que atendem
  function sirene(dest, t, dur) {
    const A = ac(), o = A.createOscillator(); o.type = 'sawtooth'; const l = A.createOscillator(); l.frequency.value = .6; const lg = A.createGain(); lg.gain.value = 170; l.connect(lg); lg.connect(o.frequency); o.frequency.value = 780;
    const g = A.createGain(); g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(.06, t + dur - .05); g.gain.setValueAtTime(0, t + dur); o.connect(g); g.connect(dest); o.start(t); l.start(t); o.stop(t + dur + .05); l.stop(t + dur + .05);
  }
  const TEL = {
    '0190'() {
      const A = ac(), h = linhaTel(), t0 = A.currentTime + .6, n = fl().am4_190 = (fl().am4_190 || 0) + 1;
      if (n > 1) { sirene(h.inp, t0, 6); mais(.6, () => C.sub('voz', TXT.t190de)); h.fim(t0 + 6.3); return; }
      let t = falarLinhas(h.inp, t0, TXT.t190);
      sirene(h.inp, t, 9); mais(t - A.currentTime, () => C.subPequeno('voz', TXT.t190sirene)); t += 11;
      I().respiracao(h.inp, t, 3, false);
      I().falarTxt(h.inp, t + 1, 'Ninguém vem.', { f0: 82, vel: .22, formK: .85, q: 4, pk: .25 });
      mais(t + 1 - A.currentTime, () => { C.sub('inspetor', TXT.t190insp, true); conq('l4a_ninguem'); achar('tel_0190'); });
      h.fim(t + 3);
    },
    '2241'() {
      const A = ac(), h = linhaTel(), t = falarLinhas(h.inp, A.currentTime + .6, TXT.t2241);
      h.fim(t); mais(t - A.currentTime + .5, () => { C.sub('lia', TXT.t2241Lia); achar('tel_2241'); });
    },
    '0037'() {
      const A = ac(), h = linhaTel(), t = falarLinhas(h.inp, A.currentTime + .6, TXT.t0037);
      h.fim(t); mais(t - A.currentTime + .5, () => { C.sub('lia', TXT.t0037Lia); achar('tel_0037'); });
    },
    [NUM_CELESTE]() {
      const A = ac(), h = linhaTel(), t0 = A.currentTime + .8;
      const t = falarLinhas(h.inp, t0, TXT.celeste, { vel: .11 });
      // a linha cai com um estalo; depois, alguém continua respirando
      const g = A.createGain(); g.connect(h.inp); C.burst(t, .06, 'highpass', 1200, 1, g); C.env(g, t, .001, .6, .05);
      for (let k = 0; k < 3; k++) I().respiracao(h.inp, t + 1.5 + k * 1.6, 2, false);
      mais(t - A.currentTime + .3, () => C.subPequeno('voz', TXT.celesteCai));
      mais(t - A.currentTime + 6.5, () => { C.sub('lia', TXT.celesteLia); conq('l4a_celeste'); achar('tel_celeste'); });
      h.fim(t + 6.2);
    }
  };
  function codigo(titulo, dig) {
    if (!/TELEFONE/.test(titulo) || !TEL[dig] || !ac()) return false;
    try { C.fecharTeclado(); } catch (e) {}
    C.SFX.telLinha();
    try { TEL[dig](); } catch (e) { console.warn('telefone', e); }
    return true;
  }

  // ---------------------------------------------------------------- 2. bipes no fim da fita do Tomé
  function bipes(num, t) {
    const A = ac(), out = C.saida(null, .1, 'sfx'); out.gain.value = .5; const lp = biq('lowpass', 3600, .5); lp.connect(out);
    [...num].forEach((d, i) => { const [a, b] = DTMF[d], at = t + i * .32; tom(lp, at, a, .17, .09); tom(lp, at, b, .17, .09); });
    return t + num.length * .32;
  }

  // ---------------------------------------------------------------- 3. sussurros num ouvido só (fone)
  // lado -1 esquerdo, 1 direito, 0 = fase invertida (no mono e na caixa de som as ondas se cancelam)
  function sussurroLado(txt, lado, id) {
    const A = ac(), g = A.createGain(); g.gain.value = 1.1;
    if (lado) { const pn = A.createStereoPanner(); pn.pan.value = lado; g.connect(pn); pn.connect(C.BUS.voz); }
    else { const mg = A.createChannelMerger(2), inv = A.createGain(); inv.gain.value = -1; g.connect(mg, 0, 0); g.connect(inv); inv.connect(mg, 0, 1); mg.connect(C.BUS.voz); }
    I().falarTxt(g, A.currentTime + .2, txt, { sussurro: true, vel: .15, pk: .1 });
    C.SFX.sussLado();
    const deFone = C.fone() && !OPT.mono;
    if (OPT.legSom === 'todos') mais(.3, () => C.subPequeno('voz', TXT.susLeg(lado > 0 ? 'direito' : lado < 0 ? 'esquerdo' : 'que só o fone separa', txt)));
    else if (!deFone && OPT.legSom !== 'nao') mais(.3, () => C.toast(TXT.susPerdeu));
    if (deFone || OPT.legSom === 'todos') achar('sus_' + id);
    if (deFone) { const d = ls.get(); d.fone = d.fone || []; if (!d.fone.includes(id)) { d.fone.push(id); ls.set(d); } if (d.fone.length >= 3) conq('l4a_fone'); }
  }
  function pontosSussurro(s) {
    const m = W.mapa;
    if (m === 'terreo') return [{ id: 'diret', sala: 'diret', lado: -1, txt: () => TXT.susDiret(s.quadro.join('')) }];
    if (m === 'superior') return [{ id: 'corr', x: 0, z: -30, r: 4, lado: 1, txt: () => TXT.susCorr }];
    if (m === 'tuneis') return [{ id: 't4', sala: 't4', lado: 0, txt: () => TXT.susT4(s.code[0], s.code[3]) }];
    return [];
  }

  // ---------------------------------------------------------------- 4. a voz dentro da nona badalada
  function sinoNona() {
    if (C.mode !== 'jogo' || !ac()) return;
    mais(3.6, () => {
      const g = C.saida(null, .9, 'ent'); g.gain.value = .8; const lp = biq('lowpass', 700); lp.connect(g);
      I().falarTxt(lp, ac().currentTime, 'fique', { f0: 64, vel: .34, formK: .75, q: 4, pk: .06 });
      C.SFX.vozSino();
    });
  }

  // ---------------------------------------------------------------- estado por mapa
  let grupo = null, E = null, Sref = null;
  function montar() {
    E = { mapa: W.mapa, log: [], passoT: 0, sus: {}, susT: 0, ecoCd: 0, ecoando: false, ecoAvisou: false, radT: 0, vT: 0, duetoFeito: false, raloT: 0, raloFeito: {}, chuvaT: 0, chuva: null, grav: null, panelas: [], seq: [], lata: null, recadoT: 0 };
    try {
      if (W.mapa === 'tuneis') montarGravador();
      if (W.mapa === 'terreo') { montarPanelas(); montarRalo(20, -20.6); }
      if (W.mapa === 'superior') { montarLata(); montarRalo(-7, -30.5); }
    } catch (e) { console.warn('segredos do som (montar)', e); }
  }
  function montarRalo(x, z) {
    const g = new THREE.Group(); g.position.set(x, .006, z); W.grupo.add(g);
    C.cyl(.13, .13, .012, MAT.ferrugem, 0, 0, 0, 12, g);
    for (let i = -2; i <= 2; i++) C.box(.2, .014, .018, MAT.preto, 0, .002, i * .045, g, false);
    E.ralo = { x, z };
  }

  // ---------------------------------------------------------------- 5. gravador de rolo da sala do diretor (túneis)
  function montarGravador() {
    const sp = W.spots.secreta, r = W.salas.find(s => s.id === 'secreta'); if (!r) return;
    const m = sp && sp.mesa && sp.mesa.length ? sp.mesa[0] : null;
    const p = m ? { x: m.x - .3, y: m.y, z: m.z } : { x: r.x0 + .6, y: .5, z: r.z1 - .8 };
    if (!m) C.box(.5, .5, .4, MAT.madeiraEsc, p.x, .25, p.z);
    const g = new THREE.Group(); g.position.set(p.x, p.y, p.z); W.grupo.add(g);
    C.box(.36, .1, .26, MAT.madeiraEsc, 0, .05, 0, g);
    C.box(.3, .01, .2, MAT.metal, 0, .105, 0, g, false);
    const rolos = [-.08, .08].map(dx => C.cyl(.07, .07, .02, MAT.preto, dx, .12, -.02, 14, g));
    const luz = C.box(.025, .02, .02, new THREE.MeshBasicMaterial({ color: 0xff2a10 }), .14, .09, .13, g, false);
    E.grav = { x: p.x, z: p.z, tocando: false, rolos, luz };
    W.tick.push(dt => { if (!E || !E.grav || E.grav.luz !== luz) return; luz.visible = E.grav.tocando || (C.perf % 1.4) < .9; if (E.grav.tocando) for (const ro of rolos) ro.rotation.y -= dt * 9; });
    C.interact(g, () => fl().am4_grav ? TXT.gravJa : TXT.gravLabel, () => { if (!fl().am4_grav) tocarGravador(); });
  }
  function registrar(x, z, k) {
    if (!E || W.mapa !== 'tuneis') return;
    const t = C.perf; E.log.push({ t, x, z, k });
    while (E.log.length && E.log[0].t < t - 60) E.log.shift();
  }
  function somEvento(dest, t, k) {
    const A = ac(), g = A.createGain(); g.connect(dest);
    if (k === 'passo') { C.burst(t, .09, 'lowpass', rand(260, 420), 1.2, g, 0); C.env(g, t, .004, .5, .08); }
    else if (k === 'porta') I().rangeLongo(dest, t, Math.random() < .5, 1.4, 1);
    else if (k === 'vidro') { C.burst(t, .25, 'highpass', 2600, 1, g); C.env(g, t, .002, .6, .22); for (let i = 0; i < 4; i++) I().clink(dest, t + rand(.02, .3), 1.4); }
    else { C.burst(t, .2, 'lowpass', 700, 1, g, 0); C.env(g, t, .005, .5, .18); }
  }
  function tocarGravador() {
    const A = ac(), G = E.grav; fl().am4_grav = 1; G.tocando = true;
    const t0 = A.currentTime + 1.6, agora = C.perf;
    // guincho de rebobinar
    const gg = C.saida(G, .2, 'sfx'); const o = C.osc('sawtooth', 900, A.currentTime, 1.4, gg); o.frequency.linearRampToValueAtTime(2400, A.currentTime + 1.3); C.env(gg, A.currentTime, .05, .03, 1.3);
    const ev = E.log.filter(e => e.t > agora - 45 && dist(e, G.x, G.z) > .1);
    C.SFX.gravRolo(G); C.toast(TXT.gravIni);
    if (ev.length < 3) { mais(1.6, () => { C.SFX.estatica(3, G); C.subPequeno('voz', TXT.gravVazio); }); mais(5, () => { G.tocando = false; }); return; }
    const ini = ev[0].t, k = Math.min(1, 18 / Math.max(1, ev[ev.length - 1].t - ini));
    const extra = (ls.get().noites || 1) % 2 === 1; let tExtra = null;
    ev.forEach((e, i) => {
      const at = t0 + (e.t - ini) * k, h = I().cadeiaEco({ x: e.x, y: 1, z: e.z }, .8, 'sfx'); somEvento(h.inp, at, e.k);
      // no meio, um passo a mais logo atrás de onde a Lia estava
      if (extra && !tExtra && i >= ev.length / 2 && e.k === 'passo') {
        const ant = ev[Math.max(0, i - 1)], dx = e.x - ant.x, dz = e.z - ant.z, n = Math.hypot(dx, dz) || 1;
        const h2 = I().cadeiaEco({ x: e.x - dx / n * 1.1, y: 1, z: e.z - dz / n * 1.1 }, .8, 'sfx'); tExtra = at + .35; somEvento(h2.inp, tExtra, 'passo');
      }
    });
    const fim = t0 + (ev[ev.length - 1].t - ini) * k + 1;
    for (let s = 2; s < fim - A.currentTime; s += 2.5) mais(s, () => ruidoMundo(G.x, G.z, 6));
    E.giro = { yaw0: P.yaw, max: 0 };
    mais(fim - A.currentTime, () => {
      G.tocando = false; const virou = E.giro && E.giro.max > 1.4; E.giro = null;
      if (extra && !virou) {
        const h = I().cadeiaEco({ x: G.x, y: 1, z: G.z }, .9, 'voz'); I().falarTxt(h.inp, ac().currentTime + .3, 'eu tava junto.', { f0: 320, vel: .17, formK: 1.3, pk: .1 });
        C.sub('voz', TXT.gravJunto, true); conq('l4a_gravador');
      } else C.sub('lia', extra ? TXT.gravVirou : TXT.gravNada);
      achar('gravador');
    });
  }

  // ---------------------------------------------------------------- 6. panelas da cozinha (térreo)
  const PANELAS = [['dó', 261.63], ['ré', 293.66], ['mi', 329.63], ['fá', 349.23], ['sol', 392], ['rachada', 0], ['lá', 440]];
  const SEQ = ['ré', 'fá', 'lá', 'sol', 'fá'];
  function montarPanelas() {
    const r = W.salas.find(s => s.id === 'cozinha'); if (!r) return;
    const x = r.x0 + .14, z0 = (r.z0 + r.z1) / 2 - 1.35;
    C.box(.04, .04, 3.1, MAT.ferrugem, x + .02, 2.12, z0 + 1.35, W.grupo, false);
    PANELAS.forEach(([nome, f], i) => {
      const g = new THREE.Group(); g.position.set(x + .14, 2.1, z0 + i * .45); W.grupo.add(g);
      C.box(.01, .16, .01, MAT.metal, 0, -.06, 0, g, false);
      const corpo = C.cyl(.15, .12, .09, MAT.metal, .02, -.26, 0, 14, g); corpo.rotation.z = Math.PI / 2;
      C.box(.02, .02, .2, MAT.metal, .02, -.12, 0, g, false);
      const P0 = { g, nome, f, x: g.position.x, z: g.position.z, bal: 0 };
      E.panelas.push(P0);
      C.interact(g, () => TXT.panelaLabel(nome), () => baterPanela(P0));
    });
    W.tick.push(dt => { if (!E || !E.panelas) return; for (const p of E.panelas) if (p.bal > 0) { p.bal = Math.max(0, p.bal - dt); p.g.rotation.x = Math.sin(p.bal * 18) * p.bal * .5; } });
  }
  function baterPanela(p) {
    const A = ac(); if (!A) return;
    const t = A.currentTime, pos = { x: p.x, y: 1.9, z: p.z }, g = C.saida(pos, .5, 'sfx');
    if (p.f) { for (const [m, a, d] of [[1, 1, 1.6], [2.76, .35, .7], [5.4, .12, .3]]) tom(g, t, p.f * m, d, .12 * a); }
    else { C.burst(t, .12, 'lowpass', 500, 1, g, 0); C.env(g, t, .002, .5, .1); }
    p.bal = .6; C.SFX.panelaBate(pos); ruidoMundo(p.x, p.z, 9);
    E.seq.push(p.nome); if (E.seq.length > SEQ.length) E.seq.shift();
    if (!fl().am4_panelas && E.seq.join() === SEQ.join()) {
      fl().am4_panelas = 1; E.seq = [];
      mais(1, () => {
        const r = W.salas.find(s => s.id === 'cozinha'), c = { x: (r.x0 + r.x1) / 2, y: 1, z: (r.z0 + r.z1) / 2 }, h = I().cadeiaEco(c, .9, 'voz');
        I().batidas(h.inp, ac().currentTime, 3, 1.2);
        I().falarTxt(h.inp, ac().currentTime + 1, 'já pra mesa, que esfria!', { f0: 190, vel: .14, formK: 1.1, pk: .16 });
        C.sub('voz', TXT.panelaOk, true);
        mais(3.5, () => { const s = St(); s.inv.kits++; try { C.renderInvMini(); } catch (e) {} C.SFX.pegar(); C.toast(TXT.panelaPremio); conq('l4a_panelas'); achar('panelas'); });
      });
    }
  }

  // ---------------------------------------------------------------- 7. telefone de lata entre os dormitórios A e B (andar de cima)
  function montarLata() {
    const r = W.salas.find(s => s.id === 'dormA'); if (!r) return;
    const x = r.x0 + .45, z = r.z0 + .12;
    const g = new THREE.Group(); g.position.set(x, 1.15, z); W.grupo.add(g);
    const lata = C.cyl(.05, .05, .1, MAT.metal, 0, 0, .05, 10, g); lata.rotation.x = Math.PI / 2;
    C.box(.004, .004, .12, MAT.papel || MAT.tecido, 0, 0, -.02, g, false);
    C.box(.03, .14, .02, MAT.madeiraEsc, 0, .12, -.01, g, false);
    E.lata = { g, x, z, treme: 0 };
    W.tick.push(dt => { if (!E || !E.lata || E.lata.g !== g) return; if (E.lata.treme > 0) { E.lata.treme -= dt; g.position.x = x + (Math.random() - .5) * .012; } else g.position.x = x; });
    C.interact(g, () => TXT.lataLabel, () => ouvirLata());
  }
  function ouvirLata() {
    const A = ac(), L = E.lata; if (!A) return;
    const n = fl().am4_lata = (fl().am4_lata || 0) + 1;
    const out = C.saida(null, .05, 'voz'); out.gain.value = .9; const bp = biq('bandpass', 1150, 3.5), hp = biq('highpass', 480); bp.connect(hp); hp.connect(out);
    C.emitNoise(L.x, L.z, 2);
    if (n <= 2) { C.SFX.lataVoz(); falarLinhas(bp, A.currentTime + .4, TXT.lata[n - 1], { vel: .12, sussurro: false, pk: .1 }); return; }
    if (n === 3) {
      for (let k = 0; k < 4; k++) I().respiracao(bp, A.currentTime + .5 + k * 1.3, 3);
      L.treme = 2; C.subPequeno('voz', TXT.lataNinguem);
      mais(5.5, () => { C.sub('lia', TXT.lataLia); conq('l4a_lata'); achar('lata'); });
      return;
    }
    C.toast(TXT.lataFrouxo);
  }

  // ---------------------------------------------------------------- 8. fim do dial dos rádios de válvula (audio-mundo.js chama)
  function dialPode(r) { return ['cozinha', 'celeste', 'secreta', 'cem'].includes(r.chave) && !fl()['am4_dial_' + r.chave]; }
  function sintonia(pos) {
    const A = ac(), t = A.currentTime, g = C.saida(pos, .2, 'voz'); g.gain.value = .5;
    const f = C.burst(t, 1.4, 'bandpass', 600, 4, g); f.frequency.exponentialRampToValueAtTime(4200, t + 1.3); C.env(g, t, .05, .3, 1.3);
    const g2 = C.saida(pos, .1, 'voz'); const o = C.osc('sine', 300, t, 1.4, g2); o.frequency.exponentialRampToValueAtTime(2200, t + 1.3); C.env(g2, t, .1, .02, 1.2);
    return t + 1.5;
  }
  function dial(r) {
    if (!dialPode(r) || !ac()) return false;
    fl()['am4_dial_' + r.chave] = 1;
    const A = ac(), t0 = sintonia(r); ruidoMundo(r.x, r.z, 8);
    if (r.chave === 'cozinha') {
      const s = St(), g1 = [0, ...s.quadro], g2 = s.code.slice(0, 4), h = I().cadeiaRadio(r, { vol: .7, chiado: 1.8 });
      mais(.3, () => C.subPequeno('voz', TXT.numerosIni));
      let t = t0 + .5;
      for (let vez = 0; vez < 2; vez++) for (const grp of [g1, g2]) {
        const txt = grp.map(d => NUMS[d]).join(', '); const ini = t;
        mais(ini - A.currentTime, () => C.sub('voz', '(no rádio, uma menina) ' + txt + '...'));
        for (const d of grp) t = I().falarTxt(h.inp, t, NUMS[d], { f0: 350, vel: .17, formK: 1.3, pk: .12 }) + .35;
        t += 1.2;
      }
      h.fim(t); mais(t - A.currentTime + .6, () => { C.sub('lia', TXT.numerosLia); achar('dial_cozinha'); });
    } else if (r.chave === 'celeste') {
      const h = I().cadeiaRadio(r, { vol: .8 }), t = falarLinhas(h.inp, t0 + .3, TXT.novela);
      h.fim(t); mais(t - A.currentTime + .4, () => { C.sub('lia', TXT.novelaLia); achar('dial_celeste'); });
    } else if (r.chave === 'cem') {
      const h = I().cadeiaRadio(r, { vol: .8, chiado: 1.4 }), t = falarLinhas(h.inp, t0 + .3, TXT.fogo(nomeJ() || 'Lia Moraes'));
      I().sirene(h.inp, t0 + .3, 5);
      h.fim(t); mais(t - A.currentTime + .4, () => { C.sub('lia', TXT.fogoLia); achar('dial_cem'); });
    } else if (r.chave === 'secreta') {
      const fim = espectro(r, t0 + .2); C.SFX.espectro();
      mais(fim - A.currentTime + .5, () => { C.sub('lia', TXT.espectroLia); conq('l4a_espectro'); achar('dial_secreta'); });
    }
    return true;
  }
  // um desenho dentro do chiado: cada coluna da imagem vira um instante, cada linha uma frequência (2 a 8 kHz).
  // Ouvido, é só um chiado esquisito. Num programa de espectrograma, aparece "PORÃO" e um rosto.
  function espectro(pos, t0) {
    const A = ac(), W0 = 72, H0 = 20, cv = document.createElement('canvas'); cv.width = W0; cv.height = H0;
    const g = cv.getContext('2d'); g.fillStyle = '#000'; g.fillRect(0, 0, W0, H0); g.fillStyle = '#fff'; g.font = 'bold 13px sans-serif'; g.textBaseline = 'middle'; g.fillText('PORÃO', 1, 11);
    g.strokeStyle = '#fff'; g.lineWidth = 1.4; g.beginPath(); g.arc(62, 10, 7.5, 0, 6.29); g.stroke(); g.fillRect(58, 7, 2, 2); g.fillRect(64, 7, 2, 2); g.beginPath(); g.arc(62, 14, 2.5, 3.4, 6); g.stroke();
    const px = g.getImageData(0, 0, W0, H0).data, col = .085;
    const out = C.saida(pos, .05, 'voz'); out.gain.value = .9;
    for (let y = 0; y < H0; y++) {
      const f = 8000 - y * (6000 / (H0 - 1)), o = A.createOscillator(); o.frequency.value = f; const og = A.createGain(); og.gain.value = 0; o.connect(og); og.connect(out);
      for (let x = 0; x < W0; x++) og.gain.setValueAtTime(px[(y * W0 + x) * 4] / 255 * .012, t0 + x * col);
      og.gain.setValueAtTime(0, t0 + W0 * col); o.start(t0); o.stop(t0 + W0 * col + .05);
    }
    const s = C.ruido(true), sf = biq('bandpass', 1500, .6), sg = A.createGain(); sg.gain.value = .03; s.connect(sf); sf.connect(sg); sg.connect(out); s.start(t0 - .5); s.stop(t0 + W0 * col + .5);
    return t0 + W0 * col;
  }

  // ---------------------------------------------------------------- ruídos do motor (emitNoise): gravador e cisterna
  function ruido(x, z, r, doJogador, garrafa) {
    if (!E || !ac() || !St() || C.mode !== 'jogo') return;
    if (E.ecoando) return;
    const porta = W.doors.some(d => d.x === x && d.z === z);
    if (doJogador || garrafa || porta) registrar(x, z, garrafa ? 'vidro' : porta ? 'porta' : r <= 5 ? 'passo' : 'barulho');
    // câmara do eco: na cisterna, o que a Lia faz volta nove segundos depois e chama o Inspetor de novo
    if (W.mapa === 'tuneis' && (doJogador || garrafa) && r >= 3 && E.ecoCd <= 0) {
      const rr = C.roomAt(x, z); if (!rr || rr.id !== 'hub') return;
      E.ecoCd = 1.4;
      mais(9, () => {
        if (!E || W.mapa !== 'tuneis' || St().dead) return;
        const h = I().cadeiaEco({ x, y: 1.4, z }, .9, 'sfx'); somEvento(h.inp, ac().currentTime, garrafa ? 'vidro' : r > 6 ? 'barulho' : 'passo');
        C.SFX.ecoCisterna({ x, z });
        E.ecoando = true; try { ruidoMundo(x, z, r * .85, garrafa); } finally { E.ecoando = false; }
        if (!E.ecoAvisou) { E.ecoAvisou = true; mais(1.2, () => C.subPequeno('lia', TXT.ecoLia)); achar('eco'); }
        if (garrafa && M.ativo) conq('l4a_eco');
      });
    }
  }

  // ---------------------------------------------------------------- noites (para o rádio do posto e o gravador)
  function contarNoite(s) {
    const d = ls.get();
    if (s.chapter === 0 && (s.tempo || 0) < 4) { d.noites = (d.noites || 0) + 1; d.mortesAnt = d.mortesUlt || 0; d.mortesUlt = 0; ls.set(d); }
  }

  // ---------------------------------------------------------------- FUNÇÃO DE CADA FRAME
  let fitaAnt = null, fitaInd = '', altT = 0, shiftFim = false;
  function tick(dt) {
    const A = ac(), s = St();
    if (!A || !s || C.mode !== 'jogo' || C.ui) return;
    if (s !== Sref) { Sref = s; contarNoite(s); }
    if (W.grupo !== grupo) { grupo = W.grupo; montar(); }
    if (!E || s.dead || s.fim) return;
    if ((s.mortes || 0) !== (E.mortesVistas ?? -1)) { E.mortesVistas = s.mortes || 0; const d = ls.get(); d.mortesUlt = E.mortesVistas; ls.set(d); }
    const m = W.mapa, room = P.room, rid = room ? room.id : null, now = A.currentTime;
    const dM = M.ativo ? M.pos.distanceTo(P.pos) : 99, est = M.ativo ? M.state : null;
    const calma = !(M.ativo && dM < 12) && !C.PROC.fase && !C.fita;
    const parada = P.noiseR === 0;
    E.paradoT = parada ? (E.paradoT || 0) + dt : 0;
    E.ecoCd -= dt;

    // --- passos da Lia nos túneis ficam no gravador
    if (m === 'tuneis' && P.noiseR > 0) { E.passoT -= dt; if (E.passoT <= 0) { E.passoT = .5; registrar(P.pos.x, P.pos.z, 'passo'); } }
    if (E.giro) { let d = Math.abs(P.yaw - E.giro.yaw0) % (Math.PI * 2); if (d > Math.PI) d = Math.PI * 2 - d; E.giro.max = Math.max(E.giro.max, d); }

    // --- fitas: bipes no fim da do Tomé, outra rotação (ALT/SHIFT), a da Irmã com o volume baixinho
    const fid = C.fita ? C.fita.id : null;
    if (fid) { const el = document.getElementById('fita-ind'); if (el) fitaInd = el.textContent; }
    if (fid === 'f3' && (keys.AltLeft || keys.AltRight)) { altT += dt; if (altT > 1.2 && !fl().am4_rot3) { fl().am4_rot3 = 1; meiaVelocidade(); } } else altT = 0;
    if (fid === 'f1') shiftFim = !!(keys.ShiftLeft || keys.ShiftRight);
    if (fid === 'f2' && fitaAnt !== 'f2' && OPT.vol > 0 && OPT.vol <= .15 && !fl().am4_baixo) {
      fl().am4_baixo = 1; const o = s.ordem || [1, 2, 3], linhas = TXT.baixo(o);
      mais(6, () => { const g = C.saida(null, .1, 'voz'); g.gain.value = 1.4; linhas.forEach((l, i) => mais(i * 4.5, () => { C.sub(l.quem, l.texto, true); I().falarTxt(g, ac().currentTime + .05, l.texto, { sussurro: true, vel: .15, pk: .12 }); })); });
      mais(14, () => { conq('l4a_baixinho'); achar('baixinho'); });
    }
    if (!fid && fitaAnt) {
      const completa = /(\d+)\/\1$/.test(fitaInd);
      if (completa && fitaAnt === 'f6') { const fimB = bipes(NUM_CELESTE, now + .6); C.SFX.dtmf(); mais(fimB - now + .8, () => { C.sub('lia', TXT.dtmfLia); achar('dtmf'); }); }
      if (completa && fitaAnt === 'f1' && shiftFim) { const g = C.saida(null, .3, 'voz'); I().risadas(g, now + .3, 6, 1.2); C.subPequeno('ana', TXT.rot1); conq('l4a_rotacao'); achar('rotacao'); }
      fitaInd = ''; shiftFim = false;
    }
    fitaAnt = fid;

    // --- sussurros de um lado só
    for (const p of pontosSussurro(s)) {
      if (E.sus[p.id] || fl()['am4_sus_' + p.id]) continue;
      const perto = p.sala ? rid === p.sala : dist(P.pos, p.x, p.z) < p.r;
      if (!perto || !calma || s.hidden) { E.susT = 0; continue; }
      E.susT += dt; if (E.susT < 2.5) continue;
      E.sus[p.id] = true; fl()['am4_sus_' + p.id] = 1; E.susT = 0; sussurroLado(p.txt(), p.lado, p.id);
    }

    // --- o rádio do Seu Joaquim pega a respiração dele quando ele está perto
    if (keys.KeyB && fl().l2radio && !s.hidden && M.ativo && dM < 12) {
      E.radT -= dt;
      if (E.radT <= 0) {
        E.radT = .8 + dM * .1;
        const g = C.saida(null, 0, 'voz'); g.gain.value = .5 + (1 - dM / 12) * 1.5; const bp = biq('bandpass', 1300, 2), ws = A.createWaveShaper(); ws.curve = C.curvaDist(6); bp.connect(ws); ws.connect(g);
        I().respiracao(bp, now, 3, false); C.SFX.radioInsp();
        if (!fl().am4_freq) { fl().am4_freq = 1; mais(1.5, () => C.sub('joaquim', TXT.freqJoaquim)); conq('l4a_freq'); achar('freq'); }
      }
    } else E.radT = 0;

    // --- dueto: segure V enquanto ele cantarola o hino
    const hum = I() && I().E() ? I().E().hum : null;
    if (hum && !hum.parou && M.ativo && keys.KeyV && !C.chamado && !s.hidden && !E.duetoFeito) {
      E.vT += dt;
      if (E.vT >= 2) {
        E.duetoFeito = true; const d = ls.get(); d.dueto = (d.dueto || 0) + 1; ls.set(d);
        const gl = C.saida(null, .3, 'voz'), hh = I().hino(gl, { notas: I().HINO.slice(0, 4), timbre: 'assobio', bpm: 80 }); C.SFX.assobioLia();
        const mp = { x: M.pos.x, y: 1.6, z: M.pos.z };
        if (d.dueto === 1) { ruidoMundo(P.pos.x, P.pos.z, 5); mais(hh.fim - now + .3, () => { I().hino(C.saida(mp, .4, 'ent'), { notas: I().HINO.slice(4, 5), timbre: 'humm', bpm: 56 }); C.subPequeno('inspetor', TXT.duetoUm); }); }
        else if (d.dueto === 2) mais(hh.fim - now + .2, () => { C.sub('inspetor', TXT.duetoDois); ruidoMundo(P.pos.x, P.pos.z, 30); });
        else mais(hh.fim - now + .2, () => { I().hino(C.saida(mp, .5, 'ent'), { notas: I().ASSOBIO, timbre: 'assobio', bpm: 70 }); C.sub('inspetor', TXT.duetoTres); conq('l4a_dueto'); achar('dueto'); });
      }
    } else E.vT = 0;

    // --- ralos dos banheiros: agachada, parada, o ouvido no cano
    if (E.ralo && P.crouch && parada && !s.hidden && dist(P.pos, E.ralo.x, E.ralo.z) < 1.6 && !(M.ativo && dM < 8)) {
      E.raloT += dt;
      if (E.raloT > 5 && !fl()['am4_ralo_' + m]) {
        fl()['am4_ralo_' + m] = 1; E.raloFeito[m] = now;
        const pos = { x: E.ralo.x, y: .05, z: E.ralo.z }, h = I().cadeiaEco(pos, .9, 'voz'), lp = biq('lowpass', 1300); lp.connect(h.inp);
        for (let k = 0; k < 10; k++) I().pingo(lp, now + k * .8 + rand(0, .3), .8, false);
        const ag = A.createGain(); ag.connect(lp); const rs = C.ruido(true), rf = biq('lowpass', 380, .7); rs.connect(rf); rf.connect(ag); rs.start(now, Math.random()); rs.stop(now + 9.2); ag.gain.setValueAtTime(.0001, now); ag.gain.exponentialRampToValueAtTime(.1, now + 1.5); ag.gain.exponentialRampToValueAtTime(.0001, now + 9);
        C.SFX.raloCano(); mais(.5, () => C.subPequeno('lia', TXT.raloDica));
        if (m === 'terreo') {
          const v = (s.ordem || [1, 2, 3]).map(String); let t = now + 2;
          TXT.raloT(v).forEach(l => { const ini = t; mais(ini - now, () => C.sub(l.quem, l.texto, true)); t = I().falarTxt(lp, t, l.texto, { sussurro: true, vel: .13, pk: .1 }) + .9; });
          mais(t - now, () => { conq('l4a_ralo'); achar('ralo'); });
        } else {
          I().hino(lp, { timbre: 'humm', oit: 2, bpm: 60, fim: 5, pk: .5, t: now + 1.5 });
          for (let k = 0; k < 3; k++) I().respiracao(lp, now + 4 + k * 1.4, 2);
          mais(1.5, () => C.subPequeno('voz', TXT.raloS)); achar('ralo2'); conq('l4a_ralo');
        }
      }
      // ficar demais: uma gota cai no rosto e a Lia levanta assustada
      if (E.raloFeito[m] && now - E.raloFeito[m] > 8 && !E.gota) {
        E.gota = true; I().pingo(C.saida(null, .2, 'sfx'), now, 2.2, false); P.crouch = false; P.shake = Math.max(P.shake || 0, .04); C.sub('lia', TXT.raloGota);
      }
    } else E.raloT = 0;

    // --- cemitério: parada olhando a capela, a chuva toca o hino nas calhas
    if (m === 'cemiterio' && room && room.fora && parada && !s.hidden && !(M.ativo && (dM < 14 || est === 'caca')) && !fl().am4_chuva) {
      const fw = new THREE.Vector3(); C.camera.getWorldDirection(fw); fw.y = 0; fw.normalize();
      const dx = 0 - P.pos.x, dz = -48 - P.pos.z, n = Math.hypot(dx, dz) || 1, olha = (fw.x * dx + fw.z * dz) / n > .75;
      if (olha) E.chuvaT += dt; else if (!E.chuva) E.chuvaT = 0;
      if (E.chuvaT > 40 && !E.chuva) {
        const pos = { x: 0, y: 3.2, z: -47.4 }, out = C.saida(pos, .7, 'amb'); out.gain.value = 1;
        let t = now + .3; for (const [f, b] of I().HINO) { tom(out, t, f * 2, .5, .05); tom(out, t, f * 4.1, .2, .012); t += b * .55; }
        E.chuva = { out, fim: t }; C.SFX.chuvaHino(pos);
      }
    } else if (E.chuva && now < E.chuva.fim) { E.chuva.out.gain.setTargetAtTime(0, now, .05); E.chuva = null; E.chuvaT = 0; }
    else if (!E.chuva) E.chuvaT = 0;
    if (E.chuva && now >= E.chuva.fim && !fl().am4_chuva) { fl().am4_chuva = 1; E.chuva = null; C.sub('lia', TXT.chuvaLia); conq('l4a_chuva'); achar('chuva'); }

    // --- prólogo, da segunda noite em diante: o rádio do posto tem um pedido
    if (m === 'estrada' && s.chapter === 0 && !fl().am4_recado && (ls.get().noites || 0) >= 2 && dist(P.pos, 16.4, -15.4) < 9 && !C.fita) {
      const EM = I().E(), ocupado = EM && ((EM.posto && EM.posto.tocando) || (EM.posto2 && EM.posto2.tocando));
      if (!ocupado) recado();
    }
  }
  function meiaVelocidade() {
    const A = ac(), t = A.currentTime, g = C.saida(null, .2, 'voz'); g.gain.value = 1.2; const lp = biq('lowpass', 1100); lp.connect(g);
    const og = A.createGain(); og.connect(lp); const o = C.osc('sawtooth', 120, t, 1.2, og); o.frequency.exponentialRampToValueAtTime(40, t + 1.1); C.env(og, t, .05, .05, 1.1);
    I().falarTxt(lp, t + 1, 'eu ouvi tudo isso também.', { f0: 58, vel: .3, formK: .75, q: 4, pk: .2 });
    mais(1, () => C.sub('voz', TXT.rot3, true)); conq('l4a_rotacao'); achar('rotacao');
  }
  function recado() {
    fl().am4_recado = 1;
    const A = ac(), d = ls.get(), pos = { x: 16.4, y: 1.2, z: -15.4 }, nome = nomeJ() || 'a moça da estrada velha';
    const h = I().cadeiaRadio(pos, { vol: .55, chiado: 1.3 }), t0 = A.currentTime + .5;
    mais(.5, () => C.sub('radio', TXT.recado(nome)));
    let t = I().falarTxt(h.inp, t0, TXT.recado(nome), { f0: 138, vel: .13, q: 5 }) + .8;
    const lp = biq('lowpass', 1600); lp.connect(h.inp);
    const p = I().hino(lp, { timbre: 'caixinha', oit: 2, bpm: 70, t, desaf: 45, pk: 1.4 });
    t = p.fim + 1;
    const fala = (d.mortesAnt || 0) >= 5 ? TXT.recadoMortes : TXT.recadoCalmo;
    mais(t - A.currentTime, () => C.sub('radio', fala));
    t = I().falarTxt(h.inp, t, fala, { f0: 138, vel: .13, q: 5 }) + .5;
    h.fim(t); mais(t - A.currentTime, () => achar('recado'));
  }

  const API = { tick, ruido, codigo, sinoNona, dialPode, dial, achar };
  window.__som4 = { API, E: () => E, TEL, bipes, sussurroLado, tocarGravador, baterPanela, ouvirLata, espectro, recado, meiaVelocidade, sinoNona }; // kit de teste
  return API;
}
