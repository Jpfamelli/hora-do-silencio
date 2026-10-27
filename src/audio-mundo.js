// =====================================================================
// ÁUDIO DO MUNDO (Lote 2) — o internato contado pelo som
// Hino do internato, alto-falantes do Diretor Albano, rádios da Serra FM, ecos de 1979,
// chaves do Inspetor, reza da Irmã Celeste, a Hora do Silêncio na nona badalada
// e a ambiência própria de cada ala. Ligado ao motor por poucas linhas (procure AUDM em jogo.js).
// =====================================================================

// O hino do São Lázaro: 8 notas em ré menor [frequência, tempos]
export const HINO = [[293.66, 1], [349.23, 1], [440, 2], [392, 1], [349.23, 1], [329.63, 1], [293.66, 2], [220, 2]];
// a mesma frase em ré maior, terminando numa nota que nunca tocou antes
const HINO_MAIOR = [[293.66, 1], [369.99, 1], [440, 2], [392, 1], [369.99, 1], [329.63, 1], [440, 1], [587.33, 4]];
// o assobio do Seu Joaquim: as cinco primeiras notas do hino
const ASSOBIO = HINO.slice(0, 5);

const ALUNOS = ['Fontes, Cecília', 'Vieira, Paulo', 'Amaral, Rosa', 'Lima, Sebastião', 'Bueno, Teresa', 'Paiva, Miguel', 'Ramos, Lúcia', 'Neves, Antônio', 'Siqueira, Marta', 'Cunha, Rafael', 'Machado, Dora', 'Bastos, Inácio', 'Franco, Helena', 'Dutra, Joana', 'Alves, Benedito', 'Prates, Olga'];
const NUM = ['um', 'dois', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove', 'dez'];

const TXT = {
  hora: [
    { quem: 'diretor', texto: '(pelos alto-falantes, chiando) Início da Hora do Silêncio. Todos para as camas.' },
    { quem: 'diretor', texto: 'Quem estiver fora da cama, o Inspetor decide.' }
  ],
  nemChuva: '(bem baixinho) ...Nem a chuva.',
  voltaSom: '(o barulho da chuva volta devagar, como se alguém aumentasse o volume)',
  mentira: lado => `(pelos alto-falantes) Atenção, funcionários. O Inspetor faz a ronda na ala ${lado}.`,
  mentiraLia: 'Ele está mentindo. Ou não está.',
  chamadaIni: '(pelos alto-falantes) Chamada da noite.',
  chamadaTres: 'Prado, Ana Luísa... Ribeiro, Tomé... Moraes, Davi...',
  chamadaLia: 'Moraes, Lia.',
  chamadaFim: 'Fora da cama.',
  chamadaReacao: 'Ele disse o meu nome. Agora a casa inteira sabe que eu estou aqui.',
  anaImita: '(pelo alto-falante, uma menina engrossando a voz) Hora do Silêncio! Todos para a cama!',
  regrasCeleste: '(do outro lado da porta, rezando baixinho) ...não corra... não respire... não tire os olhos dela... amém.',
  tercoSozinho: '(o quarto está vazio. Um terço pendurado na cabeceira ainda balança.)',
  rezaPrimeira: '(bem baixinho, de algum lugar perto) ...rogai por nós... agora e na hora...',
  celesteAtras: '(atrás de você, uma mulher cantarola o hino da casa. Para quando você vira.)',
  coroCapela: '(as vozes de crianças vão sumindo, uma por verso, até sobrar uma só)',
  capelaBatidas: '(de dentro da capela trancada: batidas pequenas na porta. Muitas mãos.)',
  respiracoes: ['(o refeitório está cheio de respirações pequenas)', '(menos respirações que da outra vez)', '(quase ninguém mais respira aqui)', '(três respirações. Bem atrás de você.)'],
  vitrolaRisca: '(a agulha risca o disco. O mesmo verso, de novo, e de novo.)',
  vitrolaLia: 'Isso vai trazer ele pra cá. Que bom. Desde que eu não esteja aqui.',
  ecosFim: 'Ouvi a casa inteira lembrar. Todas as salas.',
  radios: {
    cozinha1: [
      '...Rádio Serra FM, vinte horas e cinquenta. A polícia rodoviária encontrou um carro parado na estrada velha, perto do antigo internato.',
      '...a porta do motorista aberta, os faróis acesos. Ninguém por perto.',
      '(chiado) ...pedimos a quem passar pela estrada velha esta noite que não pare.'
    ],
    cozinha2: [
      '...moradores da Serra ligaram para a rádio. Dizem que as luzes do São Lázaro acenderam sozinhas.',
      '...o prédio está sem energia desde 1979. A polícia diz que ninguém passa daquele portão.',
      '(o locutor ri, nervoso) ...e o sino da capela, gente. Alguém mais ouviu o sino?'
    ],
    celeste: [
      '(uma música antiga some no chiado) ...Rádio Serra, quinze de março de 1979.',
      '...três alunos do Internato São Lázaro fugiram durante a noite, segundo a direção.',
      '...o diretor Albano pede às famílias que não procurem a imprensa. Disse que eles voltam quando tiverem fome.'
    ],
    secreta: [
      '(gritaria e sirene) ...estamos ao vivo do São Lázaro! O fogo começou pela capela, as chamas já pegam o telhado!',
      '(alguém grita ao fundo) TEM CRIANÇA LÁ NO PORÃO!',
      '...os bombeiros não conseguem passar pela escada. O diretor diz que estão todos contados. Todos contados...',
      '(o chiado engole a voz)'
    ],
    cem: [
      '...Rádio Serra FM. As buscas na estrada velha foram suspensas até o amanhecer.',
      '...Lia Moraes, irmã de um dos meninos desaparecidos em 1979. O carro foi encontrado vazio, com a chave no contato.',
      hora => `(um sino ao fundo) ...a hora certa: ${hora}.`,
      '(outra voz, baixinho, por cima do locutor) ...ela ainda está lá dentro.'
    ],
    futebol: [
      '...tarde de domingo, onze de março de 1979, e o Serrano ataca pela esquerda...',
      '...cruzou, cabeceou... pra fora! A torcida não acredita!',
      '...vai terminando o primeiro tempo, zero a zero aqui no estádio municipal...'
    ],
    postoConta: '(o mesmo locutor, sem torcida nenhuma) ...um... dois... três... quatro...'
  },
  // ecos de 1979: ficar parada, de lanterna apagada, sem perigo por perto
  ecos: {
    terreo: {
      refeit: { quem: 'celeste', texto: '(eco) (colheres batendo nos pratos) Shhh. Na mesa não se fala.' },
      aula: { quem: 'celeste', texto: '(eco) Davi Moraes? ... (uma voz pequena, do fundo) ...presente.' },
      enferm: { quem: 'diretor', texto: '(eco) (uma correia apertando, um choro tapado) Quieto. Se chorar, aperta mais.' },
      diret: { quem: 'diretor', texto: '(eco, tossindo) ...anote aí, irmã: trinta e sete. Sempre trinta e sete.' },
      lavand: { quem: 'voz', texto: '(eco) (um tanque, um choro baixinho) ...não conta pra ninguém que eu molhei a cama...' },
      cozinha: { quem: 'voz', texto: '(eco) (panelas) Trinta e cinco... trinta e seis... cadê o prato trinta e sete?' },
      biblio: { quem: 'celeste', texto: '(eco) (páginas) Página quarenta. Em silêncio. Quem ler em voz alta desce pro porão.' },
      banh: { quem: 'voz', texto: '(eco) (chuveiro e risada de meninos) ...corre, que ele vem! ...(as risadas param de uma vez)' }
    },
    superior: {
      dormA: { quem: 'voz', texto: '(eco) (cochicho entre as camas) ...ele tá no corredor. Fecha o olho e não respira.' },
      dormC: { quem: 'ana', texto: '(eco) ...um... dois... três... quem se mexer é o próximo.' },
      celeste: { quem: 'celeste', texto: '(eco) ...e livrai-nos do mal. Que ele não desça hoje. Amém.' },
      brinq: { quem: 'voz', texto: '(eco) (crianças cantando o hino da casa, que param no meio)' }
    },
    tuneis: {
      hub: { quem: 'ana', texto: '(eco, pelos canos, lá de cima) ...sete... oito... ela desceu. Ela desceu!' }
    },
    cemiterio: {
      capela: { quem: 'voz', texto: '(eco) (muitas mãos batendo na porta) Abre! Abre, irmã!' }
    }
  }
};
const TOTAL_ECOS = Object.values(TXT.ecos).reduce((n, m) => n + Object.keys(m).length, 0);

const LEGENDAS = {
  chaves: { t: 'chaves tilintando', imp: 0, cd: 6, pos: a => a[0], insp: true },
  cantarola: { t: 'alguém cantarola uma melodia, de boca fechada', imp: 1, cd: 20, pos: a => a[0] },
  assobio: { t: 'alguém assobia uma melodia', imp: 0, cd: 15, pos: a => a[0] },
  corneta: { t: 'os alto-falantes chiam', imp: 1, cd: 6, pos: a => a[0] },
  shhh: { t: 'pelos alto-falantes, respirações de criança e um "shhh"', imp: 0, cd: 20, pos: a => a[0] },
  radioLiga: { t: 'um rádio liga sozinho', imp: 1, cd: 8, pos: a => a[0] },
  futebol: { t: 'um rádio narra um jogo de futebol, abafado', imp: 0, cd: 25, pos: a => a[0] },
  eco: { t: 'um som abafado, de muito tempo atrás', imp: 1, cd: 8 },
  reza: { t: 'uma reza baixinha e contas de terço', imp: 0, cd: 12, pos: a => a[0] },
  hinoCeleste: { t: 'uma mulher cantarola um hino', imp: 1, cd: 25, pos: a => a[0] },
  coroCapela: { t: 'um coro de crianças canta o hino', imp: 1, cd: 30, pos: a => a[0] },
  batidasCapela: { t: 'batidas na porta da capela, por dentro', imp: 1, cd: 10, pos: a => a[0] },
  respiracoes: { t: 'muitas respirações pequenas no escuro', imp: 1, cd: 14 },
  balde: { t: 'uma goteira pinga num balde', imp: 0, cd: 12, pos: a => a[0] },
  baldeConta: { t: 'uma vozinha conta junto com a goteira', imp: 1, cd: 6, pos: a => a[0] },
  predioRespira: { t: 'o prédio range', imp: 0, cd: 10 },
  vitrola: { t: 'a vitrola toca o hino, alto', imp: 1, cd: 10, pos: a => a[0] },
  vitrolaPula: { t: 'o disco pula no mesmo verso', imp: 0, cd: 14, pos: a => a[0] },
  sapos: { t: 'sapos coaxando longe', imp: 0, cd: 30 },
  saposCalam: { t: 'os sapos se calam de uma vez', imp: 1, cd: 30 },
  catavento: { t: 'um cata-vento enferrujado gira', imp: 0, cd: 20, pos: a => a[0] },
  aguaLonge: { t: 'água correndo em algum lugar', imp: 0, cd: 60 },
  ventoFresta: { t: 'o vento assobia nas frestas', imp: 0, cd: 60 },
  horaSilencio: { t: 'a chuva para. O vento para. Tudo para.', imp: 1, cd: 30 },
  tercoBalanca: { t: 'contas de terço batendo na madeira', imp: 1, cd: 10, pos: a => a[0] }
};

export function instalarAudioMundo(C) {
  const { SOM, BUS, AMB, VOGAL, THREE, MAT, P, M, ANA, PROC, W, keys, rand, pick, clamp } = C;
  const ac = () => C.AC, St = () => C.S, fl = () => C.S.flags;
  const teste = () => !!window.__teste;
  const mais = (s, fn) => setTimeout(() => { try { if (ac()) fn(); } catch (e) { console.warn('áudio do mundo', e); } }, Math.max(0, s * 1000));
  const ruidoMundo = (x, z, r) => { if (!teste() && St() && !St().dead) C.emitNoise(x, z, r); };
  const dist = (a, x, z) => Math.hypot(a.x - x, a.z - z);
  const biq = (tipo, f, q = 1) => { const b = ac().createBiquadFilter(); b.type = tipo; b.frequency.value = f; b.Q.value = q; return b; };
  if (C.legendas) Object.assign(C.legendas, LEGENDAS);

  // ---------------------------------------------------------------- VOZES
  function vozNo(dest, t, f0, vog, dur, pk, o = {}) {
    const A = ac(), os = A.createOscillator(); os.type = o.tipo || 'sawtooth';
    os.frequency.setValueAtTime(f0, t); os.frequency.linearRampToValueAtTime(f0 * (o.cai ?? .95), t + dur);
    if (o.wow) o.wow.connect(os.detune);
    let l = null;
    if (o.vib) { l = A.createOscillator(); l.frequency.value = o.vib; const lg = A.createGain(); lg.gain.value = f0 * .012; l.connect(lg); lg.connect(os.frequency); l.start(t); l.stop(t + dur + .15); }
    const g = A.createGain(); g.gain.value = 0; g.connect(dest);
    const [f1, f2] = VOGAL[vog] || VOGAL.a, k = o.formK || 1;
    for (const [ff, a] of [[f1 * k, 1], [f2 * k, .5]]) { const bp = biq('bandpass', ff, o.q || 6), bg = A.createGain(); bg.gain.value = a; os.connect(bp); bp.connect(bg); bg.connect(g); }
    C.env(g, t, Math.min(.05, dur * .3), pk, dur);
    os.start(t); os.stop(t + dur + .12); os.onended = () => { try { g.disconnect(); } catch (e) {} };
  }
  function sussNo(dest, t, vog, dur, pk) {
    const A = ac(), s = C.ruido(), g = A.createGain(); g.gain.value = 0; g.connect(dest);
    const [f1, f2] = VOGAL[vog] || VOGAL.a;
    for (const [ff, a] of [[f1 * 1.3, .6], [f2 * 1.2, 1], [3300, .35]]) { const bp = biq('bandpass', ff, 5), bg = A.createGain(); bg.gain.value = a; s.connect(bp); bp.connect(bg); bg.connect(g); }
    C.env(g, t, .04, pk, dur); s.start(t, Math.random()); s.stop(t + dur + .1); s.onended = () => { try { g.disconnect(); } catch (e) {} };
  }
  // texto -> sílabas (vogais), pausas nas pontuações; o que está entre parênteses não é falado
  function silabas(txt) {
    const s = [...String(txt).normalize('NFD')].filter(ch => { const c = ch.charCodeAt(0); return c < 768 || c > 879; }).join('').toLowerCase().replace(/\([^)]*\)/g, ' ');
    const out = []; let prev = '';
    for (const ch of s) {
      const vg = 'aeiou'.includes(ch);
      if (vg && !'aeiou'.includes(prev)) out.push(ch);
      else if (ch === '?') out.push('?');
      else if ('.!;:'.includes(ch)) out.push('|');
      else if (ch === ',') out.push(',');
      prev = ch;
    }
    return out.slice(0, 80);
  }
  function falarTxt(dest, t, txt, o = {}) {
    const sil = silabas(txt), f0 = o.f0 || 120, vel = o.vel || .16, n = sil.filter(x => 'aeiou'.includes(x)).length || 1;
    let at = t, i = 0;
    for (let k = 0; k < sil.length; k++) {
      const x = sil[k];
      if (x === '|') { at += vel * 2.4; continue; }
      if (x === ',') { at += vel * 1.3; continue; }
      if (x === '?') { at += vel * 2; continue; }
      const perg = sil[k + 1] === '?' || sil[k + 2] === '?';
      const f = f0 * (1 - .14 * i / n) * rand(.94, 1.06) * (perg ? 1.22 : 1), dur = vel * rand(.75, 1.3);
      if (o.sussurro) sussNo(dest, at, x, dur, o.pk || .05);
      else vozNo(dest, at, f, x, dur, o.pk || .2, { vib: o.vib, q: o.q, formK: o.formK, wow: o.wow });
      at += dur + vel * .15; i++;
    }
    return at;
  }

  // ---------------------------------------------------------------- CADEIAS (rádio, corneta, eco)
  function cadeiaRadio(pos, o = {}) {
    const A = ac(), out = C.saida(pos, .3, 'voz'); out.gain.value = o.vol ?? .9;
    const inp = A.createGain(), hp = biq('highpass', 420), lp = biq('lowpass', 2600, .7), ws = A.createWaveShaper(); ws.curve = C.curvaDist(5);
    inp.connect(hp); hp.connect(lp); lp.connect(ws); ws.connect(out);
    const l = A.createOscillator(); l.frequency.value = rand(.15, .4); const lg = A.createGain(); lg.gain.value = 650; l.connect(lg); lg.connect(lp.frequency); l.start();
    const s = C.ruido(true), sf = biq('bandpass', 1800, .8), sg = A.createGain(); sg.gain.value = .05 * (o.chiado ?? 1); s.connect(sf); sf.connect(sg); sg.connect(out); s.start(A.currentTime, Math.random());
    const hum = A.createOscillator(); hum.type = 'square'; hum.frequency.value = 60; const hg = A.createGain(); hg.gain.value = .004; hum.connect(hg); hg.connect(lp); hum.start();
    let feito = false;
    const H = {
      inp, out, pos,
      fim(t) { // chiado que vai e volta até o fim da transmissão
        const n = ac().currentTime; for (let i = 0; i < (t - n) * 5; i++) sg.gain.setValueAtTime(rand(.025, .09) * (o.chiado ?? 1), n + i / 5);
        sg.gain.setValueAtTime(0, t); out.gain.setValueAtTime(out.gain.value, t); out.gain.linearRampToValueAtTime(0, t + .3);
        for (const x of [s, l, hum]) try { x.stop(t + .4); } catch (e) {}
      },
      parar() { if (feito) return; feito = true; const n = ac().currentTime; out.gain.cancelScheduledValues(n); out.gain.setTargetAtTime(0, n, .03); for (const x of [s, l, hum]) try { x.stop(n + .3); } catch (e) {} }
    };
    return H;
  }
  function cadeiaCorneta(pos) {
    const A = ac(), out = C.saida(pos, .9, 'voz'); out.gain.value = .9;
    const inp = A.createGain(), bp = biq('bandpass', 1250, 1.3), ws = A.createWaveShaper(); ws.curve = C.curvaDist(14); const hp = biq('highpass', 320);
    const dl = A.createDelay(1); dl.delayTime.value = .23; const fb = A.createGain(); fb.gain.value = .32;
    inp.connect(bp); bp.connect(ws); ws.connect(hp); hp.connect(out); hp.connect(dl); dl.connect(fb); fb.connect(dl); dl.connect(out);
    const s = C.ruido(true), sf = biq('highpass', 2800), sg = A.createGain(); sg.gain.value = .018; s.connect(sf); sf.connect(sg); sg.connect(out); s.start(A.currentTime, Math.random());
    const hum = A.createOscillator(); hum.type = 'square'; hum.frequency.value = 120; const hg = A.createGain(); hg.gain.value = .02; hum.connect(hg); hg.connect(bp); hum.start();
    let feito = false;
    return {
      inp, out, pos,
      fim(t) { sg.gain.setValueAtTime(sg.gain.value, t); out.gain.setValueAtTime(.9, t); out.gain.linearRampToValueAtTime(0, t + .4); for (const x of [s, hum]) try { x.stop(t + .5); } catch (e) {} },
      parar() { if (feito) return; feito = true; const n = ac().currentTime; out.gain.cancelScheduledValues(n); out.gain.setTargetAtTime(0, n, .03); for (const x of [s, hum]) try { x.stop(n + .3); } catch (e) {} }
    };
  }
  function cadeiaEco(pos, vol = .7, bus = 'voz') {
    const A = ac(), out = C.saida(pos, 1.2, bus); out.gain.value = vol;
    const inp = A.createGain(), lp = biq('lowpass', 1100, .5), hp = biq('highpass', 160); inp.connect(lp); lp.connect(hp); hp.connect(out);
    return { inp, out };
  }

  // ---------------------------------------------------------------- SONS CURTOS
  function clink(dest, t, v = 1) { const g = ac().createGain(); g.connect(dest); C.burst(t, .03, 'bandpass', rand(3200, 5600), 18, g); C.osc('sine', rand(3800, 6800), t, .2, g); C.env(g, t, .001, .05 * v, .14); }
  function talheres(dest, t, dur, v = 1) { for (let k = 0; k < dur * 6; k++) clink(dest, t + rand(0, dur), v * rand(.4, 1)); }
  function shhh(dest, t, v = 1) { const g = ac().createGain(); g.connect(dest); C.burst(t, 1.3, 'highpass', 2600, .7, g); C.env(g, t, .25, .22 * v, 1); }
  function batidas(dest, t, n, v = 1) { for (let k = 0; k < n; k++) { const at = t + k * rand(.08, .2), g = ac().createGain(); g.connect(dest); C.burst(at, .07, 'lowpass', rand(260, 480), 1.3, g, 0); C.env(g, at, .002, rand(.3, .6) * v, .06); } }
  function terco(dest, t, n, v = 1) { for (let k = 0; k < n; k++) { const at = t + k * rand(.12, .3), g = ac().createGain(); g.connect(dest); C.burst(at, .02, 'bandpass', rand(2600, 4200), 9, g); C.env(g, at, .001, .09 * v, .025); } }
  function rangeLongo(dest, t, sobe, v = 1, dur = 1.6) {
    const A = ac(), o = A.createOscillator(); o.type = 'sawtooth'; o.frequency.setValueAtTime(sobe ? 55 : 78, t); o.frequency.linearRampToValueAtTime(sobe ? 80 : 50, t + dur);
    const f = biq('bandpass', rand(480, 700), 9), tr = A.createOscillator(); tr.frequency.value = rand(9, 14); const trg = A.createGain(); trg.gain.value = .5; tr.connect(trg);
    const g = A.createGain(); g.connect(dest); trg.connect(g.gain); o.connect(f); f.connect(g);
    g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(.08 * v, t + dur * .45); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
    o.start(t); tr.start(t); o.stop(t + dur + .05); tr.stop(t + dur + .05);
  }
  function choroTapado(dest, t, dur, v = 1) {
    for (let k = 0; k < dur / .45; k++) { const at = t + k * .45 + rand(0, .1); vozNo(dest, at, rand(320, 380), k % 2 ? 'i' : 'e', .28, .05 * v, { q: 4, vib: 7, cai: .85, tipo: 'triangle' }); }
  }
  function tosse(dest, t, v = 1) { for (let k = 0; k < 3; k++) { const at = t + k * .32, g = ac().createGain(); g.connect(dest); C.burst(at, .2, 'lowpass', 900, 1, g, 0); C.env(g, at, .01, .5 * v, .17); vozNo(dest, at, 105, 'o', .14, .12 * v, { q: 3 }); } }
  function agua(dest, t, dur, v = 1) { const g = ac().createGain(); g.connect(dest); C.burst(t, dur, 'highpass', 1900, .6, g); g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(.12 * v, t + .3); g.gain.setValueAtTime(.12 * v, t + dur - .3); g.gain.exponentialRampToValueAtTime(.0001, t + dur); }
  function risadas(dest, t, n, v = 1) { for (let k = 0; k < n; k++) vozNo(dest, t + k * rand(.11, .16), rand(560, 760), k % 2 ? 'i' : 'a', .1, .06 * v, { q: 5, tipo: 'triangle' }); }
  function pagina(dest, t, v = 1) { const g = ac().createGain(); g.connect(dest); C.burst(t, .28, 'highpass', 2700, .5, g); C.env(g, t, .03, .12 * v, .22); }
  function panela(dest, t, v = 1) { const g = ac().createGain(); g.connect(dest); for (const f of [420, 1130, 2210]) C.osc('sine', f * rand(.97, 1.03), t, 1.2, g); C.env(g, t, .002, .06 * v, 1); }
  function correia(dest, t, v = 1) { const g = ac().createGain(); g.connect(dest); const f = C.burst(t, .5, 'bandpass', 700, 6, g); f.frequency.linearRampToValueAtTime(420, t + .5); C.env(g, t, .08, .2 * v, .4); clink(dest, t + .55, v * 2); }
  function giz(dest, t, v = 1) { const g = ac().createGain(); g.connect(dest); const f = C.burst(t, .25, 'bandpass', 3000, 14, g); f.frequency.linearRampToValueAtTime(3600, t + .25); C.env(g, t, .02, .05 * v, .2); }
  function maquina(dest, t, v = 1) { for (let k = 0; k < 4; k++) { const g = ac().createGain(); g.connect(dest); C.burst(t + k * .5, .3, 'lowpass', 160, 1, g, 0); C.env(g, t + k * .5, .03, .2 * v, .25); } }
  function sirene(dest, t, dur) { const A = ac(), o = A.createOscillator(); o.type = 'sawtooth'; const l = A.createOscillator(); l.frequency.value = .7; const lg = A.createGain(); lg.gain.value = 180; l.connect(lg); lg.connect(o.frequency); o.frequency.value = 760; const g = A.createGain(); g.gain.value = .025; o.connect(g); g.connect(dest); o.start(t); l.start(t); o.stop(t + dur); l.stop(t + dur); }
  function torcida(dest, t, dur, v = 1) { const g = ac().createGain(); g.connect(dest); C.burst(t, dur, 'bandpass', 900, .6, g); g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(.12 * v, t + dur * .4); g.gain.exponentialRampToValueAtTime(.0001, t + dur); }
  function apito(dest, t) { const A = ac(), o = A.createOscillator(); o.frequency.value = 2900; const l = A.createOscillator(); l.frequency.value = 28; const lg = A.createGain(); lg.gain.value = 120; l.connect(lg); lg.connect(o.frequency); const g = A.createGain(); g.connect(dest); o.connect(g); C.env(g, t, .01, .05, .6); o.start(t); l.start(t); o.stop(t + .7); l.stop(t + .7); }
  function gritaria(dest, t, dur) { for (let k = 0; k < dur * 4; k++) vozNo(dest, t + rand(0, dur), rand(180, 420), pick(['a', 'e', 'o']), rand(.2, .5), .05, { q: 3, cai: .8 }); }
  function respiracao(dest, t, v = 1, crianca = true) { const g = ac().createGain(); g.connect(dest); const f = C.burst(t, .7, 'bandpass', crianca ? rand(1500, 2100) : 1100, 1.4, g); f.frequency.linearRampToValueAtTime(crianca ? 1100 : 800, t + .7); g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(.05 * v, t + .3); g.gain.exponentialRampToValueAtTime(.0001, t + .7); }
  function pingo(dest, t, v = 1, lata = true) { const g = ac().createGain(); g.connect(dest); const o = C.osc('sine', rand(1300, 1600), t, .12, g); o.frequency.exponentialRampToValueAtTime(500, t + .08); C.env(g, t, .002, .07 * v, .09); if (lata) { const g2 = ac().createGain(); g2.connect(dest); for (const f of [880, 1990]) C.osc('sine', f, t, .5, g2); C.env(g2, t, .002, .02 * v, .4); } }

  // ---------------------------------------------------------------- O HINO
  function notaHino(tb, dest, t, f, dur, k, n, o) {
    const A = ac(), pk = o.pk || 1;
    if (tb === 'caixinha') {
      const g = A.createGain(); g.connect(dest); C.osc('sine', f, t, 2.8, g); const g2 = A.createGain(); g2.gain.value = .22; g2.connect(g); C.osc('sine', f * 2.76, t, .6, g2);
      C.env(g, t, .002, .075 * pk, k === n - 1 ? 2.6 : 1.3);
    } else if (tb === 'assobio') {
      const g = A.createGain(); g.connect(dest); const os = C.osc('sine', f * 2, t, dur + .1, g); os.frequency.setValueAtTime(f * 1.94, t); os.frequency.exponentialRampToValueAtTime(f * 2, t + .07);
      const l = A.createOscillator(); l.frequency.value = 5.5; const lg = A.createGain(); lg.gain.value = f * .024; l.connect(lg); lg.connect(os.frequency); l.start(t); l.stop(t + dur + .1);
      g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(.045 * pk, t + .05); g.gain.setValueAtTime(.045 * pk, t + dur * .8); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
      const g2 = A.createGain(); g2.gain.value = .25; g2.connect(g); C.burst(t, dur, 'bandpass', f * 2, 7, g2);
    } else if (tb === 'coro') {
      const nv = typeof o.vozes === 'function' ? o.vozes(k, n) : (o.vozes || 4);
      for (let v = 0; v < nv; v++) vozNo(dest, t + rand(0, .05), f * Math.pow(2, rand(-25, 25) * (o.desafCoro ?? 1) / 1200), pick(['u', 'o', 'a']), dur * .95, .07 * pk / Math.sqrt(nv), { q: 4, vib: rand(4, 6), wow: o.wow, cai: 1, formK: 1.2 });
    } else if (tb === 'humm') {
      vozNo(dest, t, f / 2, 'u', dur * .9, .16 * pk, { q: 3, vib: 4.5, cai: .99 });
    } else if (tb === 'celeste') {
      vozNo(dest, t, f, k % 2 ? 'o' : 'a', dur * .92, .09 * pk, { q: 5, vib: 5, cai: .99, formK: 1.1 });
    } else if (tb === 'orgao') {
      const g = A.createGain(), lp = biq('lowpass', 1700, .5); lp.connect(dest); g.connect(lp);
      for (const [m, a, tp] of [[1, 1, 'sawtooth'], [2, .4, 'square'], [.5, .7, 'triangle'], [1.5, .18, 'sine']]) { const gg = A.createGain(); gg.gain.value = a; gg.connect(g); C.osc(tp, f * m, t, dur + .6, gg); }
      g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(.045 * pk, t + .09); g.gain.setValueAtTime(.045 * pk, t + Math.max(.1, dur - .05)); g.gain.exponentialRampToValueAtTime(.0001, t + dur + .5);
    }
  }
  function hino(dest, o = {}) {
    const A = ac(), t0 = (o.t ?? A.currentTime) + .05, notas = o.notas || HINO, beat = 60 / (o.bpm || 72), pg = A.createGain(); pg.gain.value = o.vol ?? 1; pg.connect(dest);
    let seq = notas.map(nt => [nt[0], nt[1]]); seq = seq.slice(o.ini || 0, o.fim ?? seq.length); if (o.reverso) seq.reverse();
    let t = t0;
    seq.forEach(([f, b], k) => {
      const des = o.desaf ? Math.pow(2, rand(-o.desaf, o.desaf) / 1200) : 1, dur = b * beat;
      notaHino(o.timbre || 'caixinha', pg, t, f * (o.oit || 1) * des * (o.ultDesaf && k === seq.length - 1 ? o.ultDesaf : 1), dur, k, seq.length, o);
      t += dur;
    });
    return { pg, fim: t, parar(r = .04) { const n = ac().currentTime; pg.gain.cancelScheduledValues(n); pg.gain.setValueAtTime(pg.gain.value, n); pg.gain.setTargetAtTime(0, n, r); } };
  }

  // ---------------------------------------------------------------- ESTADO POR MAPA
  let grupo = null, E = null;
  const vivos = new Set(); // cadeias e fontes para parar quando o mapa muda
  function pararTudo() {
    for (const v of vivos) try { v.parar ? v.parar() : null; } catch (e) {}
    vivos.clear();
    if (E) { for (const F of E.fontes) { C.FONTES.delete(F); try { F.og.disconnect(); } catch (e) {} } for (const n of E.nos) try { n.stop(); } catch (e) {} }
  }
  function vivo(h) { vivos.add(h); return h; }
  function montar() {
    pararTudo();
    E = { mapa: W.mapa, cornetas: [], radios: [], fontes: [], nos: [], t: {}, paradoT: 0, ecoT: 0, eco: null, memT: 3, evT: rand(25, 45), humT: rand(25, 45), hum: null, cel: null, celT: 2, sala: null, refN: 0, respT: 0, prendeT: 0, baldeT: 1, contaPrev: 0, predF: 0, predT: 0, mPrev: null, mParadoT: 0, mAndava: false, chavesT: 0, rezaT: 4, assT: 6, futT: 4, futI: 0, capT: rand(8, 14), sapoT: 3, saposOn: true, catT: rand(10, 20), canoT: rand(40, 70), shhT: rand(60, 100), procPrev: null, quartoPrev: !!St().done.quarto_celeste, lampPrev: !!fl().lampHallMorta };
    if (!E.quartoPrev && W.mapa !== 'superior') E.quartoPrev = true;
    const def = W.def;
    if (def && !(def.ruidoMul && def.ruidoMul.__am)) { const orig = def.ruidoMul; def.ruidoMul = () => (orig ? orig() : 1) * (horaAtiva() && !teste() ? 2 : 1); def.ruidoMul.__am = true; }
    const m = W.mapa;
    if (m === 'terreo') {
      E.cornetas.push(meshCorneta(-20, 2.72, -13.86, 0), meshCorneta(15.5, 2.72, -13.86, 0));
      E.radios.push(meshRadio('cozinha', 'cozinha'));
      montarVitrola();
      E.baldes = [{ x: 13.2, y: .2, z: -24.6 }];
    } else if (m === 'superior') {
      E.cornetas.push(meshCorneta(-2.86, 2.72, -14, Math.PI / 2), meshCorneta(-2.86, 2.72, -36.5, Math.PI / 2));
      E.radios.push(meshRadio('celeste', 'celeste'));
      E.baldes = [{ x: -10.5, y: .2, z: -33.5 }];
      ventoFresta();
    } else if (m === 'tuneis') {
      E.radios.push(meshRadio('secreta', 'secreta'));
      aguaLonge();
    } else if (m === 'cemiterio') {
      const r = meshRadio('cem', 'cem', { x: 21.6, y: .55, z: 4.2 }); if (r) { C.box(.5, .5, .5, MAT.madeira, r.x, .25, r.z); E.radios.push(r); }
    }
    for (const r of E.radios) if (r && fl()['am_r_' + r.chave]) r.ouvido = true;
    if (m === 'terreo' && fl().am_vitrola) vitrolaPulando();
  }
  // cornetas de alto-falante presas no alto da parede
  function meshCorneta(x, y, z, ry) {
    const g = new THREE.Group(); g.position.set(x, y, z); g.rotation.y = ry; W.grupo.add(g);
    C.box(.06, .34, .05, MAT.metal, 0, .12, .02, g, false);
    C.box(.1, .06, .2, MAT.metal, 0, .27, .1, g, false);
    const c = C.cyl(.045, .17, .34, MAT.ferrugem, 0, .1, .26, 14, g); c.rotation.x = -Math.PI / 2;
    const boca = C.cyl(.16, .16, .005, MAT.preto, 0, .1, .43, 14, g); boca.rotation.x = -Math.PI / 2;
    const fx = ry ? 1 : 0, fz = ry ? 0 : 1;
    return { x: x + fx * .3, y, z: z + fz * .3 };
  }
  function lugarMesa(sala, fixo) {
    if (fixo) return fixo;
    const sp = W.spots[sala], r = W.salas.find(s => s.id === sala); if (!r) return null;
    const l = sp && sp.mesa && sp.mesa.length ? sp.mesa : null;
    if (l) { const p = l[l.length - 1]; return { x: p.x + .25, y: p.y, z: p.z }; }
    return { x: r.x0 + .5, y: 0, z: (r.z0 + r.z1) / 2 };
  }
  function meshRadio(sala, chave, fixo) {
    const p = lugarMesa(sala, fixo); if (!p) return null;
    const g = new THREE.Group(); g.position.set(p.x, p.y, p.z); W.grupo.add(g);
    C.box(.38, .24, .18, MAT.madeiraEsc, 0, .12, 0, g);
    C.box(.2, .13, .01, MAT.tecido, -.06, .13, .092, g, false);
    C.box(.06, .06, .02, MAT.bronze, .12, .15, .095, g, false);
    C.box(.06, .06, .02, MAT.bronze, .12, .07, .095, g, false);
    const ant = C.cyl(.006, .006, .45, MAT.metal, .14, .44, -.04, 6, g); ant.rotation.z = -.45;
    const r = { x: p.x, y: p.y + .15, z: p.z, sala, chave, tocando: null, ouvido: false, g };
    C.interact(g, () => r.tocando ? '<b>E</b>Desligar o rádio' : r.ouvido ? 'Um rádio velho. Agora só chia.' : 'Um rádio velho, de válvula. Desligado.', () => {
      if (r.tocando) { desligarRadio(r); C.SFX.clique(); ruidoMundo(r.x, r.z, 2); }
      else if (r.ouvido) C.SFX.estatica(.5, r);
    });
    return r;
  }
  function montarVitrola() {
    const p = lugarMesa('refeit'); if (!p) return;
    const g = new THREE.Group(); g.position.set(p.x - .4, p.y, p.z); W.grupo.add(g);
    C.box(.44, .12, .36, MAT.tecido, 0, .06, 0, g);
    const tampa = C.box(.44, .3, .02, MAT.tecido, 0, .27, -.18, g, false); tampa.rotation.x = -.25;
    C.cyl(.14, .14, .012, MAT.preto, -.03, .125, .02, 20, g);
    C.cyl(.03, .03, .014, MAT.vidro, -.03, .13, .02, 10, g);
    C.box(.02, .02, .22, MAT.metal, .15, .14, .01, g, false);
    E.vit = { x: p.x - .4, y: p.y + .2, z: p.z, g };
    C.interact(g, () => fl().am_vitrola ? 'A agulha pula no mesmo verso, sem parar.' : '<b>E</b>Ligar a vitrola', () => { if (!fl().am_vitrola) ligarVitrola(); });
  }

  // ---------------------------------------------------------------- HORA DO SILÊNCIO (nona badalada)
  let hora = null;
  function horaAtiva() { return !!(hora && ac() && ac().currentTime >= hora.ini && ac().currentTime < hora.fim); }
  function ambK() {
    if (!hora || !ac()) return 1;
    const n = ac().currentTime;
    if (n < hora.ini) return 1;
    if (n < hora.fim) return 0;
    if (n < hora.fim + 6) return (n - hora.fim) / 6;
    hora = null; return 1;
  }
  function horaDoSilencio() {
    const t0 = ac().currentTime + 1.4;
    const fim = anunciar(TXT.hora, { f0: 92, vel: .17, formK: .9, q: 5 }, t0);
    hora = { ini: fim + .4, fim: fim + 20.4 };
    mais(hora.ini - ac().currentTime, () => { C.SFX.horaSilencio(); C.SOM.silencio(.6, .02, true); });
    mais(hora.ini - ac().currentTime + 2.5, () => C.sub('lia', TXT.nemChuva));
    mais(hora.fim - ac().currentTime + 1, () => C.subPequeno ? C.subPequeno('lia', TXT.voltaSom) : null);
  }
  // fala pelas cornetas: todas as que estiverem perto falam juntas, com o atraso do corredor
  function anunciar(falas, voz, t0, o = {}) {
    const A = ac(), perto = E.cornetas.filter(c => dist(P.pos, c.x, c.z) < 45);
    const alvo = perto.length ? perto : E.cornetas.slice(0, 1);
    if (!alvo.length) return t0;
    const fan = A.createGain(), cadeias = alvo.map(c => { const h = vivo(cadeiaCorneta(c)); fan.connect(h.inp); return h; });
    // estalo de ligar
    for (const h of cadeias) { const g = A.createGain(); g.connect(h.inp); C.burst(t0 - .5, .06, 'highpass', 1500, 1, g); C.env(g, t0 - .5, .001, .8, .05); }
    C.SFX.corneta(alvo[0]);
    let t = t0;
    for (const f of falas) {
      const ini = t; mais(ini - A.currentTime, () => { if (f.texto) C.sub(f.quem || 'diretor', f.texto); });
      t = falarTxt(fan, t, f.fala || f.texto, voz) + (f.pausa ?? .7);
    }
    for (const h of cadeias) h.fim(t + .3);
    if (o.ruido !== false) { const c = alvo.reduce((a, b) => dist(P.pos, a.x, a.z) < dist(P.pos, b.x, b.z) ? a : b); for (let k = 0; k < (t - t0) / 2; k++) mais(t0 - A.currentTime + k * 2, () => ruidoMundo(c.x, c.z, o.raio || 12)); }
    return t;
  }

  // ---------------------------------------------------------------- RÁDIOS DA SERRA FM
  function horaCerta() {
    const min = Math.floor((St().tempo || 0) / 60), hh = 21 + Math.floor(min / 60), mm = min % 60;
    const H = ['vinte e uma horas', 'vinte e duas horas', 'vinte e três horas'][hh - 21] || 'meia-noite';
    return mm ? `${H} e ${extenso(mm)} ${mm === 1 ? 'minuto' : 'minutos'}` : `${H} em ponto`;
  }
  function extenso(n) {
    const u = ['zero', 'um', 'dois', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove', 'dez', 'onze', 'doze', 'treze', 'quatorze', 'quinze', 'dezesseis', 'dezessete', 'dezoito', 'dezenove'];
    if (n < 20) return u[n];
    const d = ['', '', 'vinte', 'trinta', 'quarenta', 'cinquenta'][Math.floor(n / 10)], r = n % 10;
    return r ? `${d} e ${u[r]}` : d;
  }
  function tocarRadio(r, linhas, o = {}) {
    if (r.tocando) return;
    const A = ac(), h = vivo(cadeiaRadio(r, { vol: o.vol ?? .9, chiado: o.chiado })), voz = { f0: o.f0 || 128, vel: o.vel || .13, q: 5, formK: 1 };
    let t = A.currentTime + .5;
    const sintonia = A.createGain(); sintonia.connect(h.inp); C.burst(A.currentTime, .4, 'bandpass', 1400, 2, sintonia); C.env(sintonia, A.currentTime, .01, .5, .35);
    if (o.subs !== false) C.SFX.radioLiga(r);
    for (const ln of linhas) {
      const texto = typeof ln === 'function' ? ln(horaCerta()) : ln, ini = t;
      if (o.subs !== false) mais(ini - A.currentTime, () => { if (r.tocando === h) C.sub('radio', texto); });
      if (o.ruido !== false) mais(ini - A.currentTime, () => { if (r.tocando === h) ruidoMundo(r.x, r.z, 6); });
      if (o.extra) o.extra(h.inp, t, texto);
      t = falarTxt(h.inp, t, texto, voz) + .9;
    }
    h.fim(t); r.tocando = h; r.ate = t;
    mais(t - A.currentTime + .5, () => { if (r.tocando === h) { r.tocando = null; vivos.delete(h); } });
  }
  function desligarRadio(r) { if (r.tocando) { r.tocando.parar(); vivos.delete(r.tocando); r.tocando = null; } }
  function linhasRadio(r) {
    const s = St();
    if (r.chave === 'cozinha') {
      if (s.chapter <= 1 && !fl().am_r_cozinha1) return ['cozinha1', TXT.radios.cozinha1];
      if (s.chapter >= 2 && !fl().am_r_cozinha2) return ['cozinha2', TXT.radios.cozinha2];
      return null;
    }
    const k = r.chave; return fl()['am_r_' + k] ? null : [k, TXT.radios[k]];
  }
  function extraRadio(chave) {
    if (chave === 'secreta') return (dest, t, texto) => { sirene(dest, t, 6); gritaria(dest, t, 4); if (/PORÃO/.test(texto)) vozNo(dest, t, 240, 'a', .8, .25, { q: 3, cai: .7 }); };
    if (chave === 'cem') return (dest, t, texto) => { if (/sino/.test(texto)) for (let k = 0; k < 3; k++) { const g = ac().createGain(); g.connect(dest); for (const m of [1, 2, 2.4]) C.osc('sine', 196 * m, t + k * 1.2, 2, g); C.env(g, t + k * 1.2, .004, .03, 1.6); } };
    if (chave === 'celeste') return (dest, t, texto) => { if (/música/.test(texto)) hino(dest, { timbre: 'coro', t: t - .4, bpm: 96, vozes: 3, pk: .7, fim: 4, desaf: 30 }); };
    if (chave === 'futebol') return (dest, t, texto) => { torcida(dest, t, 3.5, /torcida/.test(texto) ? 1.6 : .6); if (/apito|tempo/.test(texto)) apito(dest, t + 2.4); };
    return null;
  }

  // ---------------------------------------------------------------- VITROLA
  function ligarVitrola() {
    const v = E.vit; if (!v) return;
    fl().am_vitrola = 1; C.SFX.vitrola(v); C.SFX.clique();
    const A = ac(), h = vivo(cadeiaVinil(v, 1.3)), t0 = A.currentTime + .6;
    const p1 = hino(h.inp, { timbre: 'coro', t: t0, bpm: 64, vozes: (k) => 6, pk: 1.6, desaf: 20, wow: h.wow });
    const p2 = hino(h.inp, { timbre: 'coro', t: p1.fim + .3, bpm: 62, vozes: (k, n) => Math.max(1, 6 - k), pk: 1.6, desaf: 35, wow: h.wow });
    for (let k = 0; k < 20; k++) mais(.6 + k, () => ruidoMundo(v.x, v.z, 26));
    mais(p2.fim - A.currentTime, () => {
      const g = A.createGain(); g.connect(h.inp); const f = C.burst(A.currentTime, .5, 'bandpass', 3200, 6, g); f.frequency.exponentialRampToValueAtTime(700, A.currentTime + .45); C.env(g, A.currentTime, .005, .9, .45);
      h.parar(); vivos.delete(h); C.toast(TXT.vitrolaRisca); mais(2, () => C.sub('lia', TXT.vitrolaLia)); vitrolaPulando();
    });
  }
  function cadeiaVinil(v, vol) {
    const A = ac(), out = C.saida(v, .5, 'amb'); out.gain.value = vol;
    const inp = A.createGain(), lp = biq('lowpass', 3400, .6), hp = biq('highpass', 180); inp.connect(hp); hp.connect(lp); lp.connect(out);
    const wow = A.createOscillator(); wow.frequency.value = .55; const wow2 = A.createGain(); wow2.gain.value = 22; wow.connect(wow2); wow.start();
    const s = C.ruido(true), sf = biq('highpass', 4000), sg = A.createGain(); sg.gain.value = .012; s.connect(sf); sf.connect(sg); sg.connect(out); s.start();
    const est = setInterval(() => { try { if (!ac() || feito) return clearInterval(est); const t = ac().currentTime, g = ac().createGain(); g.connect(out); C.burst(t, .01, 'highpass', 2500, 1, g); C.env(g, t, .001, rand(.05, .2), .01); } catch (e) {} }, 170);
    let feito = false;
    return { inp, out, wow: wow2, parar() { if (feito) return; feito = true; clearInterval(est); const n = ac().currentTime; out.gain.setTargetAtTime(0, n, .05); for (const x of [s, wow]) try { x.stop(n + .4); } catch (e) {} } };
  }
  // depois que risca: o disco pula no mesmo verso, para sempre, e o refeitório fica perigoso
  function vitrolaPulando() {
    const v = E.vit; if (!v || E.pula) return;
    const h = vivo(cadeiaVinil(v, .55)); E.pula = { h, t: 1, n: 0 };
  }

  // ---------------------------------------------------------------- AMBIÊNCIA DAS ALAS
  function ventoFresta() {
    const A = ac(), g = A.createGain(); g.gain.value = 0; g.connect(BUS.amb);
    for (const [f, d] of [[1150, 240], [1730, 310]]) { const o = A.createOscillator(); o.frequency.value = f; const l = A.createOscillator(); l.frequency.value = rand(.08, .17); const lg = A.createGain(); lg.gain.value = d; l.connect(lg); lg.connect(o.frequency); const og = A.createGain(); og.gain.value = .5; o.connect(og); og.connect(g); o.start(); l.start(); E.nos.push(o, l); }
    const s = C.ruido(true), sf = biq('bandpass', 2300, 9); s.connect(sf); sf.connect(g); s.start(); E.nos.push(s);
    E.fresta = g; C.SFX.ventoFresta();
  }
  function aguaLonge() {
    const F = C.fonteFixa({ x: 0, y: .3, z: -36 }, 'amb', .5); E.fontes.push(F);
    const A = ac(), s = C.ruido(true), lp = biq('lowpass', 420, .7), g = A.createGain(); g.gain.value = .14; s.connect(lp); lp.connect(g); g.connect(F.g);
    const s2 = C.ruido(true), bp = biq('bandpass', 950, 4), g2 = A.createGain(); g2.gain.value = .05; const l = A.createOscillator(); l.frequency.value = 3.2; const lg = A.createGain(); lg.gain.value = .04; l.connect(lg); lg.connect(g2.gain); s2.connect(bp); bp.connect(g2); g2.connect(F.g);
    s.start(); s2.start(); l.start(); E.nos.push(s, s2, l); C.SFX.aguaLonge();
  }

  // ---------------------------------------------------------------- SONS PÚBLICOS (vão para o SOM: legendas automáticas)
  const X = {
    chaves(pos, est = 'patrulha', v = 1) {
      const t = ac().currentTime, p = { x: pos.x, y: 1, z: pos.z }, n = est === 'caca' ? 5 : est === 'procura' ? 3 : 2;
      for (let k = 0; k < n; k++) { const at = t + .04 + k * rand(.03, est === 'caca' ? .05 : .09), g = C.saida(p, .4, 'ent'); C.burst(at, .025, 'bandpass', rand(3600, 6400), 16, g); C.osc('sine', rand(4200, 7400), at, .18, g); C.env(g, at, .001, (est === 'caca' ? .09 : .05) * v, .12); }
    },
    chavesParam(pos) { const t = ac().currentTime, g = C.saida({ x: pos.x, y: 1, z: pos.z }, .3, 'ent'); C.burst(t, .05, 'lowpass', 1800, 2, g); C.env(g, t, .002, .08, .05); },
    cantarola(pos) { E.hum = { F: C.fonteFixa({ x: pos.x, y: 1.6, z: pos.z }, 'ent', .4) }; E.fontes.push(E.hum.F); E.hum.h = hino(E.hum.F.g, { timbre: 'humm', bpm: 56, fim: 6, desaf: 45, pk: 1 }); },
    assobio(pos) { const g = C.saida(pos, .4, 'voz'); hino(g, { notas: ASSOBIO, timbre: 'assobio', bpm: 88 }); },
    corneta() {}, shhh(pos) {}, radioLiga() {}, futebol() {}, eco() {}, reza() {}, hinoCeleste() {}, horaSilencio() {}, ventoFresta() {}, aguaLonge() {}, predioRespira() {}, vitrola() {}, vitrolaPula() {}, sapos() {}, saposCalam() {}, respiracoes() {}, balde() {}, baldeConta() {},
    coroCapela(pos) {
      const out = C.saida(pos, 1.4, 'amb'); out.gain.value = .9;
      return hino(out, { timbre: 'coro', bpm: 60, vozes: k => k < 2 ? 6 : k < 4 ? 4 : k < 6 ? 2 : 1, desaf: 18, pk: 1.4 });
    },
    batidasCapela(pos) { const out = C.saida(pos, .7, 'ent'), lp = biq('lowpass', 900); lp.connect(out); out.gain.value = .9; batidas(lp, ac().currentTime, 12, 1); return out; },
    tercoBalanca(pos) { const g = C.saida(pos, .5, 'amb'); for (let k = 0; k < 6; k++) terco(g, ac().currentTime + k * .7, 2, 1 - k * .13); },
    catavento(pos) { const t = ac().currentTime, g = C.saida(pos, .5, 'amb'); for (let k = 0; k < 3; k++) { const o = C.osc('sawtooth', rand(700, 900), t + k * .55, .4, g); o.frequency.linearRampToValueAtTime(rand(1000, 1300), t + k * .55 + .35); } g.gain.setValueAtTime(0, t); for (let k = 0; k < 3; k++) { g.gain.setValueAtTime(.0001, t + k * .55); g.gain.exponentialRampToValueAtTime(.012, t + k * .55 + .15); g.gain.exponentialRampToValueAtTime(.0001, t + k * .55 + .4); } },
    // temas do final: o hino em três versões
    temaFinal(tipo) {
      const A = ac(), out = C.saida(null, 1.2, 'mus'); out.gain.value = 1;
      if (tipo === 'verdadeiro') { hino(out, { timbre: 'orgao', notas: HINO_MAIOR, bpm: 66, t: A.currentTime + 1.2, pk: 1.2 }); hino(out, { timbre: 'coro', notas: HINO_MAIOR, bpm: 66, t: A.currentTime + 1.2, vozes: 5, desafCoro: .15, pk: 1.1 }); }
      else if (tipo === 'silencio') hino(out, { timbre: 'coro', bpm: 54, t: A.currentTime + 1.5, vozes: 1, fim: 7, pk: 1.2, desaf: 15 });
      else { const lp = biq('lowpass', 1400); lp.connect(out); hino(lp, { timbre: 'caixinha', oit: 2, bpm: 70, t: A.currentTime + 1.5, reverso: true, pk: .8, ultDesaf: .96 }); }
    }
  };
  for (const k of Object.keys(X)) if (!SOM[k]) SOM[k] = X[k];
  // a caixinha da Ana passa a tocar o hino; termina com o assobio do Joaquim ao contrário
  function caixinha(x, z) {
    const A = ac(), t = A.currentTime + .7, pos = { x, y: 1, z };
    for (let i = 0; i < 8; i++) { const g = C.saida(pos, .3); C.burst(t - .7 + i * .08, .015, 'highpass', 3500, 2, g); C.env(g, t - .7 + i * .08, .001, .1, .015); }
    const g = C.saida(pos, .7), p1 = hino(g, { timbre: 'caixinha', oit: 2, bpm: 84, t: t - .05, ultDesaf: .97 });
    const p2 = hino(g, { timbre: 'caixinha', notas: ASSOBIO, oit: 2, bpm: 60, t: p1.fim + .5, reverso: true, ultDesaf: .94, pk: .8 });
    C.SOM.silencio(p2.fim - A.currentTime + 1, .2);
  }

  // ---------------------------------------------------------------- ECOS DE 1979
  const somEco = {
    refeit: (d, t) => { talheres(d, t, 2.6); shhh(d, t + 2.4, .8); return t + 4; },
    aula: (d, t) => { giz(d, t); let e = falarTxt(d, t + .5, 'Davi Moraes?', { f0: 230, vel: .16, formK: 1.15 }); e = falarTxt(d, e + 1.4, 'presente', { f0: 330, vel: .14, formK: 1.3, pk: .09 }); return e + 1; },
    enferm: (d, t) => { correia(d, t); choroTapado(d, t + .7, 2.2); return t + 3.4; },
    diret: (d, t) => { tosse(d, t); const e = falarTxt(d, t + 1.2, 'trinta e sete. Sempre trinta e sete.', { f0: 95, vel: .16, formK: .9 }); batidas(d, e + .2, 1, .8); return e + .8; },
    lavand: (d, t) => { maquina(d, t); choroTapado(d, t + .4, 2.4, .8); return t + 3.2; },
    cozinha: (d, t) => { panela(d, t); return falarTxt(d, t + .5, 'Trinta e cinco, trinta e seis, cadê o trinta e sete?', { f0: 200, vel: .15, formK: 1.1 }) + .5; },
    biblio: (d, t) => { pagina(d, t); pagina(d, t + .7); return falarTxt(d, t + 1.2, 'Página quarenta. Em silêncio.', { sussurro: true, vel: .15, pk: .07 }) + .5; },
    banh: (d, t) => { agua(d, t, 3); risadas(d, t + .5, 7); return t + 3.2; },
    dormA: (d, t) => { rangeLongo(d, t, true, 1.2, 1.2); return falarTxt(d, t + .8, 'ele tá no corredor. fecha o olho e não respira.', { sussurro: true, vel: .13, pk: .08 }) + .4; },
    dormC: (d, t) => { let e = t; for (let k = 0; k < 3; k++) e = falarTxt(d, e, NUM[k], { f0: 340, vel: .2, formK: 1.3, pk: .1 }) + .6; return e; },
    celeste: (d, t) => { terco(d, t, 8); return falarTxt(d, t + .3, 'e livrai-nos do mal. que ele não desça hoje. amém.', { f0: 205, vel: .14, formK: 1.1, pk: .08 }) + .5; },
    brinq: (d, t) => hino(d, { timbre: 'coro', t, bpm: 90, vozes: 5, fim: 5, pk: 1.2 }).fim,
    hub: (d, t) => { const lp = biq('lowpass', 600); lp.connect(d); const e = falarTxt(lp, t, 'sete. oito. ela desceu. ela desceu!', { f0: 330, vel: .15, formK: 1.3, pk: .12 }); rangeLongo(lp, e, false, 1); return e + 1.5; },
    capela: (d, t) => { batidas(d, t, 14, 1.2); const g = ac().createGain(); g.connect(d); for (const m of [1, 2, 2.4, 3]) C.osc('sine', 196 * m, t + 2.2, 4, g); C.env(g, t + 2.2, .004, .05, 3.5); return t + 5; }
  };
  function contarEcos() { return Object.entries(TXT.ecos).reduce((n, [m, salas]) => n + Object.keys(salas).filter(id => fl()[`am_eco_${m}_${id}`]).length, 0); }
  function tocarEco(sala, def) {
    const k = `am_eco_${W.mapa}_${sala.id}`; fl()[k] = 1;
    const centro = { x: (sala.x0 + sala.x1) / 2, y: 1.5, z: (sala.z0 + sala.z1) / 2 }, h = cadeiaEco(centro, .75), t = ac().currentTime + .2;
    const fim = somEco[sala.id](h.inp, t);
    E.eco = { h, fim };
    C.SFX.eco(); C.sub(def.quem, def.texto);
    const n = contarEcos();
    mais(Math.min(6, fim - ac().currentTime) + .6, () => { C.toast(`Eco de 1979 (${n}/${TOTAL_ECOS})`); if (n >= TOTAL_ECOS) mais(1.5, () => C.sub('lia', TXT.ecosFim)); });
  }

  // memória baixinha de cada sala: o prédio lembra sem precisar de texto
  const MEMO = { refeit: (d, t) => clink(d, t, .8), aula: (d, t) => giz(d, t, .7), lavand: (d, t) => maquina(d, t, .4), cozinha: (d, t) => panela(d, t, .35), biblio: (d, t) => pagina(d, t, .6), celeste: (d, t) => terco(d, t, 3, .7), dormB: (d, t) => rangeLongo(d, t, Math.random() < .5, .5, 1), brinq: (d, t) => risadas(d, t, 2, .4), enferm: (d, t) => clink(d, t, .5) };

  // ---------------------------------------------------------------- FUNÇÃO DE CADA FRAME
  function tick(dt) {
    const A = ac(), s = St();
    if (!A || !s || C.mode !== 'jogo' || C.ui) return;
    if (W.grupo !== grupo) { grupo = W.grupo; montar(); }
    if (!E || s.dead || s.fim) return;
    const now = A.currentTime, perf = C.perf, room = P.room;
    const dM = M.ativo ? M.pos.distanceTo(P.pos) : 99, dA = ANA.ativa ? ANA.pos.distanceTo(P.pos) : 99, est = M.ativo ? M.state : null;
    const calma = !(M.ativo && dM < 15) && !PROC.fase && !(ANA.ativa && dA < 12) && !C.fita;
    const parada = P.noiseR === 0;
    E.paradoT = parada ? E.paradoT + dt : 0;
    const m = W.mapa, rid = room ? room.id : null;

    // --- nona badalada do cap. II: a Hora do Silêncio de verdade
    if (m === 'terreo' && s.chapter === 2 && fl().lampHallMorta && !E.lampPrev && !fl().am_hora) { fl().am_hora = 1; horaDoSilencio(); }
    E.lampPrev = !!fl().lampHallMorta;
    // ...e, depois dela, o Albano mente (ou não) sobre onde o Inspetor está
    if (m === 'terreo' && s.chapter === 2 && fl().am_hora && !fl().am_mentira && !hora && M.ativo && calma) {
      E.t.mentira = (E.t.mentira ?? 70) - dt;
      if (E.t.mentira <= 0) { fl().am_mentira = 1; const lado = M.pos.x < 0 ? 'oeste' : 'leste', diz = Math.random() < .5 ? lado : (lado === 'oeste' ? 'leste' : 'oeste'); anunciar([{ quem: 'diretor', texto: TXT.mentira(diz) }], { f0: 92, vel: .17, formK: .9, q: 5 }, now + .8); mais(7, () => C.sub('lia', TXT.mentiraLia)); }
    }
    // --- cap. III: a chamada noturna pelos alto-falantes
    if (m === 'superior' && E.cornetas.length && !fl().am_chamada && calma) {
      E.t.chamada = (E.t.chamada ?? 22) - dt;
      if (E.t.chamada <= 0) {
        fl().am_chamada = 1;
        const nomes = [...ALUNOS].sort(() => Math.random() - .5).slice(0, 4).join('... ') + '...';
        const fim = anunciar([{ texto: TXT.chamadaIni, pausa: .5 }, { texto: '(pelos alto-falantes) ' + nomes, fala: nomes, pausa: .6 }, { texto: TXT.chamadaTres, pausa: 3 }, { texto: TXT.chamadaLia, pausa: 2.2 }, { texto: TXT.chamadaFim }], { f0: 92, vel: .17, formK: .9, q: 5 }, now + .8, { raio: 24 });
        mais(fim - now + 1, () => C.sub('lia', TXT.chamadaReacao));
      }
    }
    // --- a Ana imita o diretor pela mesma corneta
    if (m === 'superior' && fl().am_chamada && !fl().am_anaImita && s.done.ana && !ANA.ativa && calma) {
      E.t.ana = (E.t.ana ?? 35) - dt;
      if (E.t.ana <= 0) { fl().am_anaImita = 1; const fim = anunciar([{ quem: 'ana', texto: TXT.anaImita }], { f0: 300, vel: .14, formK: 1.25, q: 5 }, now + .6, { raio: 10 }); const c = E.cornetas[0]; mais(fim - now, () => C.SFX.risada(c.x, c.z)); }
    }
    // --- calmaria: respiração de crianças e um "shhh" coletivo pelas cornetas; e o chiado antes da Procissão
    if (E.cornetas.length) {
      E.shhT -= dt;
      const perto = E.cornetas.find(c => dist(P.pos, c.x, c.z) < 14);
      if (E.shhT <= 0 && perto && calma && !hora) {
        E.shhT = rand(70, 120); const h = vivo(cadeiaCorneta(perto)), t = now + .3; h.out.gain.value = .35;
        for (let k = 0; k < 6; k++) respiracao(h.inp, t + k * .45 + rand(0, .2), 2.4);
        shhh(h.inp, t + 3, 1.4); h.fim(t + 4.8); C.SFX.shhh(perto);
      }
      if (PROC.fase === 'aviso' && E.procPrev !== 'aviso') for (const c of E.cornetas) if (dist(P.pos, c.x, c.z) < 40) { const h = vivo(cadeiaCorneta(c)), g = A.createGain(); g.connect(h.inp); C.burst(now, 1.6, 'bandpass', 1600, .8, g); g.gain.setValueAtTime(0, now); for (let i = 0; i < 24; i++) g.gain.setValueAtTime(Math.random() * .5, now + i / 15); h.fim(now + 1.8); C.SFX.corneta(c); }
    }
    E.procPrev = PROC.fase;

    // --- rádios que ligam sozinhos
    for (const r of E.radios) {
      if (!r || r.tocando) continue;
      const entrou = r.chave === 'cem' ? dist(P.pos, r.x, r.z) < 9 : rid === r.sala;
      if (!entrou || PROC.fase || C.fita) continue;
      const qual = linhasRadio(r); if (!qual) continue;
      fl()['am_r_' + qual[0]] = 1; r.ouvido = true;
      tocarRadio(r, qual[1], { extra: extraRadio(qual[0] === 'cozinha1' || qual[0] === 'cozinha2' ? 'cozinha' : qual[0]), chiado: qual[0] === 'secreta' ? 1.6 : 1 });
    }
    // --- prólogo: o rádio do posto narra futebol de 1979; depois que o velho some, só conta
    if (m === 'estrada' && s.chapter === 0) {
      const pr = { x: 16.4, y: 1.2, z: -15.4, chave: 'posto' }, d = dist(P.pos, pr.x, pr.z);
      if (!fl().joaquimSumiu) {
        E.futT -= dt;
        if (E.futT <= 0 && d < 13 && !C.fita) { E.futT = rand(9, 13); const ln = TXT.radios.futebol[E.futI++ % TXT.radios.futebol.length]; C.SFX.futebol(pr); tocarRadio(E.posto || (E.posto = { ...pr }), [ln], { subs: false, ruido: false, vol: .45, f0: 140, vel: .11, extra: extraRadio('futebol') }); }
        E.assT -= dt;
        if (E.assT <= 0 && dist(P.pos, 15.5, -17.5) < 30) { E.assT = rand(16, 26); C.SFX.assobio({ x: 15.5, y: 1.6, z: -17.5 }); }
      } else if (!fl().am_postoConta && d < 6 && !C.fita) {
        fl().am_postoConta = 1; if (E.posto) desligarRadio(E.posto);
        tocarRadio(E.posto2 || (E.posto2 = { ...pr }), [TXT.radios.postoConta], { ruido: false, vol: .6, f0: 140, vel: .2 });
      }
    }

    // --- ecos de 1979: parada, lanterna apagada, sem perigo
    const ecos = TXT.ecos[m];
    if (E.eco) { if (now > E.eco.fim + 1) E.eco = null; else if (!parada) { E.eco.h.out.gain.setTargetAtTime(0, now, .08); E.eco = null; } }
    else if (ecos && room && ecos[rid] && !fl()[`am_eco_${m}_${rid}`] && !s.flashOn && !s.hidden && calma && E.paradoT > 6) tocarEco(room, ecos[rid]);
    // --- memória baixinha da sala
    E.memT -= dt;
    if (E.memT <= 0) {
      E.memT = rand(3, 7);
      if (room && MEMO[rid] && !(M.ativo && dM < 15) && !PROC.fase && !E.eco) { const p = { x: rand(room.x0 + 1, room.x1 - 1), y: 1, z: rand(room.z0 + 1, room.z1 - 1) }, h = cadeiaEco(p, .32, 'amb'); MEMO[rid](h.inp, now + .05); }
    }

    // --- chaves do Inspetor: chacoalham na caça, param quando ele para para escutar
    if (M.ativo) {
      if (!E.mPrev) E.mPrev = M.pos.clone();
      const mov = M.pos.distanceTo(E.mPrev) / Math.max(dt, .001); E.mPrev.copy(M.pos);
      if (mov > .3) { E.mParadoT = 0; E.mAndava = true; } else E.mParadoT += dt;
      if (E.mAndava && E.mParadoT > .5) { E.mAndava = false; if (dM < 16) C.SOM.chavesParam(M.pos); }
      E.chavesT -= dt;
      if (est === 'caca' && mov > .3 && E.chavesT <= 0 && dM < 30) { E.chavesT = rand(.18, .3); C.SOM.chaves(M.pos, 'caca', .6); }
      // ele cantarola o hino na patrulha, desafinado; para no meio se algo chama a atenção
      E.humT -= dt;
      if (!E.hum && E.humT <= 0 && est === 'patrulha' && dM > 6 && dM < 22) { E.humT = rand(40, 75); C.SFX.cantarola(M.pos); }
    } else E.mPrev = null;
    if (E.hum) {
      C.moverFonte(E.hum.F, { x: M.pos.x, y: 1.6, z: M.pos.z });
      if (!E.hum.parou && (!M.ativo || est !== 'patrulha')) { E.hum.parou = true; E.hum.h.parar(.02); E.hum.h = { parar() {}, fim: now }; }
      if (now > E.hum.h.fim + .6) { C.FONTES.delete(E.hum.F); E.hum = null; }
    }

    // --- andar de cima: a Irmã Celeste
    if (m === 'superior') {
      const dCel = dist(P.pos, -8, -53), dPorta = dist(P.pos, -3, -53), contando = ANA.ativa && ANA.conta > 0;
      // reza as regras do outro lado da porta, antes de você entrar
      if (!s.done.quarto_celeste && !fl().am_regras && rid === 'corr' && dPorta < 6 && calma) {
        fl().am_regras = 1; const h = vivo(cadeiaEco({ x: -8, y: 1.4, z: -53 }, .9)), t = now + .2;
        terco(h.inp, t, 10); falarTxt(h.inp, t + .3, 'não corra. não respire. não tire os olhos dela. amém.', { sussurro: true, vel: .17, pk: .1 }); C.SFX.reza({ x: -8, z: -53 }); C.sub('celeste', TXT.regrasCeleste);
      }
      if (s.done.quarto_celeste && !E.quartoPrev) mais(1.2, () => { C.SFX.tercoBalanca({ x: -11.5, y: 1, z: -55 }); C.toast(TXT.tercoSozinho); });
      E.quartoPrev = !!s.done.quarto_celeste;
      // cantarola o hino vindo do quarto; para quando a Ana começa a contar; depois da fita dela, nunca mais
      if (!s.fitas.f2) {
        E.celT -= dt;
        if (E.cel && contando) { E.cel.h.parar(.015); E.cel.cortou = true; }
        if (E.cel && now > E.cel.h.fim + .4) { C.FONTES.delete(E.cel.F); E.cel = null; E.celT = rand(3, 6); }
        if (!E.cel && E.celT <= 0 && !contando && dCel < 20 && rid !== 'celeste' && calma) {
          const F = C.fonteFixa({ x: -8, y: 1.5, z: -53 }, 'voz', .5); E.fontes.push(F);
          E.cel = { F, h: hino(F.g, { timbre: 'celeste', bpm: 54, desaf: 12 }) }; C.SFX.hinoCeleste({ x: -8, z: -53 });
        }
      } else {
        if (E.cel) { E.cel.h.parar(.3); E.cel = null; }
        if (!fl().am_celAtras && calma && E.paradoT > 1.5) {
          fl().am_celAtras = 1; const fw = new THREE.Vector3(); C.camera.getWorldDirection(fw); fw.y = 0; fw.normalize();
          const g = C.saida({ x: P.pos.x - fw.x * 1.3, y: 1.6, z: P.pos.z - fw.z * 1.3 }, .2, 'voz'); hino(g, { timbre: 'celeste', bpm: 58, fim: 5, pk: .7 }); mais(.6, () => C.subPequeno ? C.subPequeno('celeste', TXT.celesteAtras) : C.sub('celeste', TXT.celesteAtras));
        }
      }
      // goteira no balde do banheiro: com a Ana contando, pinga junto com o número e uma vozinha conta junto
      if (ANA.ativa && ANA.conta !== E.contaPrev && ANA.conta > 0 && E.baldes) {
        const b = E.baldes[0]; if (dist(P.pos, b.x, b.z) < 30) { const g = C.saida(b, .7, 'ent'); pingo(g, now, 1.4); falarTxt(g, now + .08, NUM[clamp(ANA.conta, 1, 10) - 1], { sussurro: true, vel: .12, pk: .06 }); C.SFX.baldeConta(b); }
      }
      E.contaPrev = ANA.ativa ? ANA.conta : 0;
    }
    // goteira de balde (lavanderia e banheiro de cima), no ritmo de quem conta
    if (E.baldes && !(ANA.ativa && ANA.conta > 0)) {
      E.baldeT -= dt;
      if (E.baldeT <= 0) { E.baldeT = 1.15; for (const b of E.baldes) if (dist(P.pos, b.x, b.z) < 12) { const g = C.saida(b, .5, 'amb'); pingo(g, now, ambK()); C.SFX.balde(b); } }
    }
    // --- reza da Irmã Celeste como radar: acelera com o perigo e se cala quando ele está a menos de 5 m
    if ((m === 'superior' || m === 'tuneis') && E.paradoT > 2.5) {
      const dT = Math.min(dM, dA);
      E.rezaT -= dt;
      if (E.rezaT <= 0 && dT >= 5 && !E.eco && !C.fita) {
        const aflita = dT < 12;
        E.rezaT = aflita ? rand(1, 1.6) : dT < 25 ? rand(2.5, 4) : rand(5, 8);
        const a = rand(0, 6.28), p = { x: P.pos.x + Math.cos(a) * rand(3, 5), y: 1.3, z: P.pos.z + Math.sin(a) * rand(3, 5) }, h = cadeiaEco(p, aflita ? .6 : .4, 'voz');
        falarTxt(h.inp, now + .05, pick(['ave maria, cheia de graça', 'santa maria, mãe de deus', 'rogai por nós', 'agora e na hora']), { sussurro: true, vel: aflita ? .09 : .16, pk: aflita ? .08 : .05 });
        terco(h.inp, now + .1, aflita ? 6 : 3); C.SFX.reza(p);
        if (!fl().am_rezaOuvida) { fl().am_rezaOuvida = 1; C.sub('celeste', TXT.rezaPrimeira); }
      }
    }

    // --- refeitório: 37 respirações (cada visita, menos; prender o ar faz elas pararem)
    if (rid !== E.sala) {
      if (rid === 'refeit' && m === 'terreo') { const n = fl().am_refVis = (fl().am_refVis || 0) + 1; E.refN = [37, 20, 9, 3][Math.min(n, 4) - 1]; if (n === 1 || n >= 4) C.SFX.respiracoes(); if (n >= 2) mais(1.5, () => C.subPequeno ? C.subPequeno('voz', TXT.respiracoes[Math.min(n, 4) - 1]) : null); }
      E.sala = rid;
    }
    if (rid === 'refeit' && m === 'terreo' && room) {
      if (P.prende) E.prendeT = 1.5; else E.prendeT -= dt;
      E.respT -= dt;
      if (E.respT <= 0 && E.prendeT <= 0 && !(M.ativo && dM < 8)) {
        E.respT = E.refN >= 30 ? .14 : E.refN >= 15 ? .3 : E.refN >= 9 ? .6 : 1.8;
        let p;
        if (E.refN <= 3) { const fw = new THREE.Vector3(); C.camera.getWorldDirection(fw); const a = Math.atan2(-fw.x, -fw.z) + rand(-.5, .5); p = { x: P.pos.x + Math.sin(a) * rand(.9, 1.4), y: 1.1, z: P.pos.z + Math.cos(a) * rand(.9, 1.4) }; }
        else p = { x: rand(room.x0 + .8, room.x1 - .8), y: .9, z: rand(room.z0 + .8, room.z1 - .8) };
        const g = C.saida(p, .3, 'amb'); respiracao(g, now, (E.refN <= 3 ? .35 : .12) * (fl().energia ? .6 : 1));
      }
    }

    // --- vitrola riscada: o disco pula no mesmo verso e chama quem estiver por perto
    if (E.pula) {
      E.pula.t -= dt;
      if (E.pula.t <= 0) {
        E.pula.t = 2.6; E.pula.n++; const v = E.vit;
        if (dist(P.pos, v.x, v.z) < 30) { hino(E.pula.h.inp, { timbre: 'coro', bpm: 64, ini: 2, fim: 4, vozes: 3, pk: 1, desaf: 30, wow: E.pula.h.wow }); if (E.pula.n % 5 === 1) C.SFX.vitrolaPula(v); }
        if (E.pula.n % 2 === 0 && M.ativo) ruidoMundo(v.x, v.z, 9);
      }
    }

    // --- cemitério: batidas na capela, coro lá dentro, sapos e cata-vento
    if (m === 'cemiterio') {
      const nT = Object.keys(s.tumulos || {}).length, dPorta = dist(P.pos, 0, -48);
      if (nT >= 2 && !s.done.capela) {
        E.capT -= dt;
        if (E.cap && dPorta < 7) { E.cap.gain.setTargetAtTime(0, now, .05); E.cap = null; }
        if (E.capT <= 0 && dPorta > 7 && rid !== 'capela') { E.capT = rand(12, 24); E.cap = C.SFX.batidasCapela({ x: 0, y: 1.2, z: -48.6 }) || null; if (!fl().am_batCap) { fl().am_batCap = 1; mais(1.5, () => C.subPequeno ? C.subPequeno('voz', TXT.capelaBatidas) : null); } }
      }
      if (rid === 'capela' && !fl().am_coroCap) { fl().am_coroCap = 1; mais(1.2, () => { C.SFX.coroCapela({ x: 0, y: 1.6, z: -66 }); mais(9, () => C.subPequeno ? C.subPequeno('voz', TXT.coroCapela) : null); }); }
      const silenciam = (M.ativo && est === 'caca') || fl().sino;
      if (E.saposOn && silenciam) { E.saposOn = false; C.SFX.saposCalam(); }
      else if (!E.saposOn && !silenciam && !M.ativo) E.saposOn = true;
      E.sapoT -= dt;
      if (E.saposOn && E.sapoT <= 0) {
        E.sapoT = rand(1.2, 3.5); const a = rand(0, 6.28), p = { x: P.pos.x + Math.cos(a) * rand(14, 24), y: .1, z: P.pos.z + Math.sin(a) * rand(14, 24) }, g = C.saida(p, .3, 'amb');
        const f0 = rand(140, 210), n = 2 + (Math.random() * 3 | 0); for (let k = 0; k < n; k++) { const at = now + k * .16, o = C.osc('square', f0, at, .1, g); o.frequency.exponentialRampToValueAtTime(f0 * .7, at + .09); } g.gain.setValueAtTime(0, now); for (let k = 0; k < n; k++) { g.gain.setValueAtTime(.006 * ambK(), now + k * .16); g.gain.setValueAtTime(0, now + k * .16 + .09); }
        if (Math.random() < .08) C.SFX.sapos();
      }
      E.catT -= dt; if (E.catT <= 0) { E.catT = rand(14, 28); C.SFX.catavento({ x: -22, y: 4, z: -30 }); }
    }

    // --- térreo: canos batendo nas paredes nas calmarias
    if (m === 'terreo' && calma) { E.canoT -= dt; if (E.canoT <= 0) { E.canoT = rand(45, 90); const a = rand(0, 6.28); C.SFX.cano({ x: P.pos.x + Math.cos(a) * 5, y: 2.6, z: P.pos.z + Math.sin(a) * 5 }); } }
    // --- andar de cima: o vento assobia nas frestas, mais nas rajadas
    if (E.fresta) { const raj = .5 + .5 * Math.sin(perf * .23) * Math.sin(perf * .61); E.fresta.gain.setTargetAtTime(.0045 * raj * raj * ambK() * (room && room.tipo === 'dorm' ? 1.6 : 1), now, .4); }
    // --- corredores: o prédio range em ciclos de inspira e expira (acelera na caça)
    if (room && (room.tipo === 'corredor' || rid === 'corr') && !fora(room)) {
      const per = est === 'caca' ? 3.4 : 9, f0 = E.predF; E.predF = (E.predF + dt / per) % 1;
      if ((f0 < .5 && E.predF >= .5) || E.predF < f0) {
        const sobe = E.predF < f0, p = { x: P.pos.x + rand(-4, 4), y: room.h || 3.2, z: P.pos.z + rand(-4, 4) }, g = C.saida(p, .6, 'amb');
        rangeLongo(g, now, sobe, (est === 'caca' ? 1 : .55) * ambK(), per * .4); if (sobe) C.SFX.predioRespira();
      }
    }
  }
  const fora = r => !!r.fora;
  // fator do ambiente: zero na Hora do Silêncio e quase nada nas salas de lore
  let salaK = 1;
  function ambiente(dt) {
    const r = P.room, s = St(), lore = r && s && (r.id === 'secreta' || (r.id === 'celeste' && s.done && s.fitas && s.fitas.f2));
    salaK += ((lore ? .15 : 1) - salaK) * Math.min(1, dt * 1.5);
    return ambK() * salaK;
  }
  return { tick, ambiente, ambK, horaAtiva, caixinha, passoK: () => horaAtiva() ? 1.5 : 1, coracaoK: () => horaAtiva() ? 1.3 : 1 };
}
