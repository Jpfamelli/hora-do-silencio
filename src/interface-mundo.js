// INTERFACE — MUNDO E HISTÓRIA (lote 2)
// Linha do tempo e fichas de personagens que se montam sozinhas no diário, papel de cada nota,
// leitura de placas e paredes sem tela cheia, placa das salas com a história de 1979, descrição de cena,
// olho da Menina na mira, rádio-relógio do título, soma dos melhores trechos e selo de corrida.
// Criado por src/interface.js (criarInterface) — o motor não chama este arquivo direto.
import * as THREE from 'three';
import { PG } from './progressao.js';

export function criarMundo(C) {
  const $ = s => document.querySelector(s);
  const R = C.R, OPT = C.OPT;
  const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const mmss = s => `${Math.floor(s / 60)}min ${String(Math.floor(s % 60)).padStart(2, '0')}s`;
  const relogio = s => { s = Math.max(0, Math.round(s)); const h = Math.floor(s / 3600), m = Math.floor(s % 3600 / 60), ss = s % 60; return (h ? h + ':' + String(m).padStart(2, '0') : m) + ':' + String(ss).padStart(2, '0'); };
  const S = () => C.S;
  const fl = () => (S() && S().flags) || {};

  // conquistas novas
  for (const c of [
    { id: 'quem_lembra', nome: 'Quem Lembra Conta', desc: 'Complete a linha do tempo do internato no diário.' },
    { id: 'quem_eram', nome: 'Quem Eram Eles', desc: 'Complete as fichas de todas as pessoas no diário.' },
    { id: 'segredo_radio', nome: 'Sintonia', desc: 'Sintonize o rádio-relógio do título até ouvir quem não devia estar lá.', segredo: true }
  ]) if (!R.conquistas.some(x => x.id === c.id)) R.conquistas.push(c);

  // ------------------------------------------------------------- O QUE A LIA JÁ VIU
  const n = id => !!(S() && S().notes[id]);
  const f = id => !!(S() && S().fitas[id]);
  const vis = k => !!(S() && S().visited[k]);
  const feito = id => !!(S() && S().done[id]);
  const tum = id => !!(S() && S().tumulos && S().tumulos[id]);
  const lap = k => !!(fl().lap && fl().lap[k]);
  const sempre = () => true;
  // lápides: o epitáfio sai num aviso (toast); o histórico avisa aqui e a Lia "lembra"
  function texto(t) {
    const st = S(); if (!st || !t) return;
    const todas = [...(R.lapides || []), ...Object.values(R.lapidesVariantes || {}).filter(x => x && typeof x === 'object')];
    for (const l of todas) if (l.epitafio && t === l.epitafio) {
      const k = l.id || (l.nome === 'LIA MORAES' ? 'lia' : l.nome);
      st.flags.lap = st.flags.lap || {};
      if (!st.flags.lap[k]) { st.flags.lap[k] = true; checar(); }
    }
  }

  // ------------------------------------------------------------- LINHA DO TEMPO
  const TEMPO = [
    { a: '1922', t: 'Nasce Albano Teixeira, o diretor.', de: 'lápide do diretor', ok: () => lap('albano') },
    { a: '1931', t: 'Nasce Celeste. Vai ser a irmã que ajudou as crianças.', de: 'lápide da irmã', ok: () => lap('IRMÃ CELESTE') },
    { a: '1938', t: 'Nasce Moacir Duarte.', de: 'ficha médica (41 anos em 1979)', ok: () => n('n4') },
    { a: 'anos 40', t: 'Moacir é aluno do internato. O diretor de antes tranca ele no armário.', de: 'fita do Moacir', ok: () => f('f3') },
    { a: '1951', t: 'Morre o Padre Osvaldo, que fundou a casa "para acolher". Alguém riscou ACOLHER.', de: 'lápide', ok: () => lap('PADRE OSVALDO') },
    { a: '1952', t: 'Luiz, 11 anos. Alguém ainda deixa um pião novo em cima da pedra.', de: 'lápide', ok: () => lap('LUIZ, 11 ANOS') },
    { a: '1955', t: 'João, 7 anos. Uma bolinha de gude presa no musgo.', de: 'lápide', ok: () => lap('JOÃO, 7 ANOS') },
    { a: '1958', t: 'Maria das Dores, 8 anos. "Falou durante a Hora."', de: 'lápide', ok: () => lap('MARIA DAS DORES') },
    { a: '1962', t: 'Uma cova sem nome. Marcas de unha na terra.', de: 'lápide', ok: () => lap('semnome62') },
    { a: '1965', t: 'Eu nasço.', de: 'eu sei', ok: sempre },
    { a: '1965', t: 'Rosa, 8 anos. Uma fita vermelha amarrada na pedra.', de: 'lápide', ok: () => lap('ROSA, 8 ANOS') },
    { a: '1967', t: 'Nasce o Davi. Meu irmão.', de: 'eu sei', ok: sempre },
    { a: '1975', t: 'Outra cova sem nome. A terra remexida, recente demais.', de: 'lápide', ok: () => lap('semnome75') },
    { a: '12/10/1978', t: 'O diretor grava: "A Hora do Silêncio está funcionando."', de: 'fita do diretor', ok: () => f('f1') },
    { a: '1979', t: 'A enfermaria pede o afastamento do Moacir, que está ficando cego. O diretor recusa.', de: 'ficha médica', ok: () => n('n4') },
    { a: '14/03/1979', t: 'O incêndio. Trinta e quatro crianças saem. Três não.', de: 'eu sei', ok: sempre },
    { a: '14/03/1979', t: 'Os bombeiros acham a capela trancada por fora. O sino tocava sozinho.', de: 'recorte de jornal', ok: () => n('n12') },
    { a: '1979', t: 'O diretor escreve ao bispo: o fogo vira acidente, e os três viram "fugitivos".', de: 'carta ao bispo', ok: () => n('n10') },
    { a: '1979', t: 'Seu Joaquim morre tentando tirar os três. Continua avisando pelo rádio.', de: 'rádio do posto', ok: () => f('f5') },
    { a: '1979', t: 'Morre a Irmã Celeste. As contas do terço ainda estão mornas.', de: 'lápide', ok: () => lap('IRMÃ CELESTE') },
    { a: '1980', t: 'Morre Albano Teixeira, "homem de disciplina".', de: 'lápide', ok: () => lap('albano') },
    { a: '1994', t: 'Chega uma fita sem remetente. A voz é do Davi.', de: 'eu sei', ok: sempre },
    { a: '1994', t: 'Hoje. Eu entrei.', de: 'eu sei', ok: sempre },
    { a: '1965 — 1994', t: 'Uma lápide com o meu nome. A pedra é velha.', de: 'lápide', ok: () => lap('lia'), secreta: true }
  ];
  // outras áreas podem acrescentar fatos em roteiro.js: linhaTempo: [{ ano, texto, nota|fita|flag|sala }]
  for (const x of (R.linhaTempo || [])) TEMPO.push({ a: x.ano, t: x.texto, de: x.de || 'achado', secreta: !!x.secreta, ok: () => (x.nota && n(x.nota)) || (x.fita && f(x.fita)) || (x.flag && fl()[x.flag]) || (x.sala && vis(x.sala)) || false });
  const ordemAno = a => { const m = String(a).match(/(\d{4})/); return m ? +m[1] + (/anos/.test(a) ? .5 : /\//.test(a) ? .3 : 0) : 9999; };
  TEMPO.forEach((x, i) => x.i = i);
  TEMPO.sort((a, b) => ordemAno(a.a) - ordemAno(b.a) || a.i - b.i);
  const NOITE = [
    { h: '21h00', t: 'O sino bate nove vezes. Começa a Hora do Silêncio.', de: 'regras', ok: () => !!fl().regras || n('n7') },
    { h: '21h04', t: 'O Tomé fala durante a Hora. Armário.', de: 'livro de ocorrências', ok: () => n('n2') },
    { h: '21h31', t: 'A Ana chora durante a Hora. Armário.', de: 'livro de ocorrências', ok: () => n('n2') },
    { h: '21h50', t: 'O Davi é pego fora da cama, perto da capela. "Medidas permanentes." Autorizado.', de: 'livro de ocorrências', ok: () => n('n2') },
    { h: 'depois', t: 'A Irmã Celeste leva as crianças até o sino.', de: 'fita da irmã', ok: () => f('f2') },
    { h: 'depois', t: 'O Davi, a Ana e o Tomé tocam o sino. O Inspetor fica preso na Hora.', de: 'fita do Davi', ok: () => f('f4') },
    { h: 'depois', t: 'O diretor tranca a capela por fora.', de: 'gaveta falsa', ok: () => f('f7') },
    { h: 'depois', t: 'O fogo começa nas velas. Ele ouve as batidas na porta até o fim.', de: 'gaveta falsa', ok: () => f('f7') },
    { h: 'depois', t: 'O fogo pega a escada antes que o Seu Joaquim chegue até os três.', de: 'rádio do posto', ok: () => f('f5') },
    { h: 'dias depois', t: 'A cozinha passa a servir trinta e quatro pratos. Ninguém diz nada.', de: 'caderno da cozinheira', ok: () => n('n3') }
  ];
  const conta = lista => { const b = lista.filter(x => !x.secreta); return { tem: b.filter(x => x.ok()).length, tot: b.length }; };

  // ------------------------------------------------------------- PESSOAS
  const PESSOAS = [
    { id: 'lia', nome: 'Lia', ret: 'lia', visto: sempre, linhas: [
      ['Eu. A irmã mais velha do Davi.', sempre], ['Vim por causa de uma fita sem remetente.', sempre],
      ['Tenho as regras. Não respondo quando chamarem.', () => !!fl().regras], ['Ele já me ouviu uma vez. Não vai ouvir de novo.', () => !!fl().avist],
      ['Tem uma lápide com o meu nome.', () => lap('lia')]], liga: ['davi'] },
    { id: 'davi', nome: 'Davi', ret: 'menino', visto: sempre, linhas: [
      ['12 anos em 1979. Sumiu no incêndio.', sempre], ['Fez um desenho pro meu aniversário e escondeu atrás dos livros do diretor.', () => n('p1')],
      ['Foi pego fora da cama, perto da capela, às 21h50.', () => n('n2')], ['Anotou os números do cofre do diretor.', () => n('p4')],
      ['Toca o sino toda noite pra ele não sair.', () => f('f4')], ['Guardou o desenho esse tempo todo.', () => n('n13')]], liga: ['lia', 'ana', 'tome', 'celeste'] },
    { id: 'ana', nome: 'Ana', anon: 'A Menina', ret: 'menina', visto: () => n('n1') || !!fl().anaVista, revela: () => n('n1') || n('n6'), linhas: [
      ['Ana Luísa Prado, 9 anos.', () => n('n1')], ['Conta até dez e nunca para de olhar.', () => n('n6')],
      ['Chorou durante a Hora, às 21h31. Armário.', () => n('n2')], ['"Se parar de olhar, a gente some."', () => n('p3')],
      ['Só se mexe quando eu não olho pra ela com luz.', () => !!fl().anaVista], ['Deixou uma fita de cabelo vermelha na cova.', () => tum('ana')]], liga: ['davi', 'tome'] },
    { id: 'tome', nome: 'Tomé', ret: 'menino2', visto: () => n('n1') || n('n5') || f('f6'), linhas: [
      ['Tomé Ribeiro, 10 anos.', () => n('n1')], ['Queria ser bombeiro.', () => n('n5')], ['Trouxe um carrinho azul escondido.', () => n('p2') || n('n5')],
      ['Falou durante a Hora, às 21h04. Armário.', () => n('n2')], ['Escondeu o carrinho no muro do cemitério.', () => f('f6')],
      ['"Tem mais alguém no armário com a gente."', () => f('f6')], ['Deixou um pneu de carrinho na cova.', () => tum('tome')]], liga: ['davi', 'ana'] },
    { id: 'moacir', nome: 'Moacir', anon: 'O Inspetor', ret: 'alto', visto: () => !!fl().avist || n('n4') || f('f3'), revela: () => n('n4') || f('f3'), linhas: [
      ['Cego? Caça pelo som.', () => !!fl().avist || f('f2')], ['Moacir Duarte, 41 anos, inspetor de disciplina.', () => n('n4')],
      ['Foi aluno daqui. O diretor de antes trancava ele no armário.', () => f('f3')], ['Não pisca pra lanterna, mas vira a cabeça pra um terço.', () => n('n8')],
      ['Comia sozinho, de olhos fechados, ouvindo a colher.', () => n('n3')], ['"Só queria silêncio."', () => f('f3')],
      ['"Não será encontrado."', () => n('n10')]], liga: ['albano', 'celeste'] },
    { id: 'albano', nome: 'Diretor Albano', ret: 'terno', visto: () => f('f1') || n('n10') || n('n2') || lap('albano'), linhas: [
      ['O diretor. Gravava tudo.', () => f('f1')], ['Assinava "Autorizado. — A."', () => n('n2')], ['Pagou em dinheiro por uma sala que ninguém devia lembrar.', () => n('n9')],
      ['Tinha um escritório seco debaixo dos túneis.', () => vis('tuneis:secreta')], ['Chamou o incêndio de acidente.', () => n('n10')],
      ['Trancou a capela por fora.', () => f('f7')], ['Morreu em 1980.', () => lap('albano')]], liga: ['moacir'] },
    { id: 'celeste', nome: 'Irmã Celeste', ret: 'veu', visto: () => n('n8') || f('f2') || vis('superior:celeste'), linhas: [
      ['Rezava por eles. Um terço em cima do travesseiro.', () => vis('superior:celeste')], ['Viu o Moacir ficar cego.', () => n('n8')],
      ['Levou as crianças até o sino.', () => f('f2')], ['1931 — 1979.', () => lap('IRMÃ CELESTE')]], liga: ['davi', 'moacir', 'joaquim'] },
    { id: 'joaquim', nome: 'Seu Joaquim', ret: 'chapeu', visto: () => feito('posto') || f('f5'), linhas: [
      ['O velho de capa do posto.', () => feito('posto')], ['Escreveu as regras pras crianças sobreviverem.', () => !!fl().regras],
      ['A sexta regra não é dele.', () => !!fl().verso || f('f2')], ['Morreu em 1979, tentando tirar os três do fogo.', () => f('f5')]], liga: ['celeste'] },
    { id: 'antes', nome: 'Os que vieram antes', ret: 'pedra', visto: () => vis('cemiterio:cem'), linhas: [
      ['Luiz, 11 anos. 1952.', () => lap('LUIZ, 11 ANOS')], ['João, 7 anos. 1955.', () => lap('JOÃO, 7 ANOS')], ['Maria das Dores. "Falou durante a Hora."', () => lap('MARIA DAS DORES')],
      ['Rosa, 8 anos. 1965.', () => lap('ROSA, 8 ANOS')], ['Duas covas sem nome: 1962 e 1975.', () => lap('semnome62') && lap('semnome75')]], liga: [] }
  ];
  const cor = id => ((R.personagens[id] || {}).cor) || (id === 'antes' ? '#9a948a' : '#cfc3a6');
  const contaPessoas = () => { let tem = 0, tot = 0; for (const p of PESSOAS) for (const l of p.linhas) { tot++; if (p.visto() && l[1]()) tem++; } return { tem, tot }; };

  // retratos em canvas (silhueta simples; escura enquanto ninguém sabe quem é)
  const retCache = {};
  function retrato(tipo, conhecido, c) {
    const k = tipo + conhecido + c; if (retCache[k]) return retCache[k];
    const cv = document.createElement('canvas'); cv.width = 84; cv.height = 104; const g = cv.getContext('2d');
    g.fillStyle = conhecido ? '#1e1a14' : '#0b0a08'; g.fillRect(0, 0, 84, 104);
    for (let i = 0; i < 260; i++) { g.fillStyle = `rgba(255,240,210,${Math.random() * .035})`; g.fillRect(Math.random() * 84, Math.random() * 104, 1, 1); }
    g.fillStyle = conhecido ? c : '#000'; g.globalAlpha = conhecido ? .62 : 1;
    const cabeca = (x, y, r) => { g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill(); };
    const ombros = (y, w) => { g.beginPath(); g.moveTo(42 - w, 104); g.quadraticCurveTo(42 - w, y, 42, y - 4); g.quadraticCurveTo(42 + w, y, 42 + w, 104); g.fill(); };
    if (tipo === 'menino' || tipo === 'menino2' || tipo === 'menina') { cabeca(42, 52, 15); ombros(76, 24); if (tipo === 'menina') { g.fillRect(24, 50, 6, 26); g.fillRect(54, 50, 6, 26); } if (tipo === 'menino2') { g.fillRect(26, 38, 32, 6); } }
    else if (tipo === 'alto') { g.save(); g.translate(46, 30); g.rotate(.22); g.beginPath(); g.ellipse(0, 0, 12, 16, 0, 0, Math.PI * 2); g.fill(); g.restore(); ombros(62, 34); }
    else if (tipo === 'terno') { cabeca(42, 38, 15); ombros(66, 32); if (conhecido) { g.globalAlpha = 1; g.strokeStyle = '#0b0a08'; g.lineWidth = 2; g.strokeRect(32, 34, 8, 6); g.strokeRect(44, 34, 8, 6); g.beginPath(); g.moveTo(42, 70); g.lineTo(42, 104); g.stroke(); } }
    else if (tipo === 'veu') { g.beginPath(); g.moveTo(20, 104); g.quadraticCurveTo(18, 22, 42, 22); g.quadraticCurveTo(66, 22, 64, 104); g.fill(); if (conhecido) { g.globalAlpha = 1; g.fillStyle = '#d8ccb0'; g.beginPath(); g.ellipse(42, 44, 10, 13, 0, 0, Math.PI * 2); g.fill(); } }
    else if (tipo === 'chapeu') { cabeca(42, 44, 14); g.fillRect(20, 30, 44, 5); g.fillRect(29, 18, 26, 14); ombros(70, 32); }
    else if (tipo === 'lia') { cabeca(42, 42, 15); g.beginPath(); g.ellipse(58, 50, 5, 14, -.3, 0, Math.PI * 2); g.fill(); ombros(70, 30); }
    else if (tipo === 'pedra') { g.beginPath(); g.moveTo(22, 104); g.lineTo(22, 40); g.quadraticCurveTo(42, 14, 62, 40); g.lineTo(62, 104); g.fill(); if (conhecido) { g.globalAlpha = 1; g.fillStyle = '#0b0a08'; g.fillRect(40, 44, 4, 22); g.fillRect(33, 51, 18, 4); } }
    g.globalAlpha = 1;
    if (!conhecido) { g.fillStyle = '#3a3329'; g.font = '30px Georgia'; g.textAlign = 'center'; g.fillText('?', 42, 62); }
    return (retCache[k] = cv.toDataURL());
  }

  // ------------------------------------------------------------- NOVIDADE NO DIÁRIO (pena no canto)
  let ultChecar = 0, conhecidos = null, penaTO;
  function chaves() { const s = new Map(); for (const x of TEMPO) if (x.ok()) s.set('t' + x.a + x.t, x.a + ' — ' + x.t); for (const x of NOITE) if (x.ok()) s.set('n' + x.t, '14/03/1979, ' + x.h + ' — ' + x.t); for (const p of PESSOAS) if (p.visto()) for (const l of p.linhas) if (l[1]()) s.set('p' + p.id + l[0], ((p.anon && !(p.revela && p.revela())) ? p.anon : p.nome) + ': ' + l[0]); return s; }
  function checar() {
    const st = S(); if (!st) return;
    const agora = chaves();
    if (conhecidos && conhecidos.ref === st) {
      const novos = [...agora.keys()].filter(k => !conhecidos.s.has(k));
      if (novos.length && C.mode === 'jogo') {
        st.flags.fatosNovos = (st.flags.fatosNovos || 0) + novos.length;
        st.flags.ultFato = agora.get(novos[novos.length - 1]);
        const p = $('#pena'); p.hidden = false; p.classList.remove('on'); void p.offsetWidth; p.classList.add('on'); clearTimeout(penaTO); penaTO = setTimeout(() => p.hidden = true, 2600);
      }
    }
    conhecidos = { ref: st, s: agora };
    const t = conta(TEMPO), nt = conta(NOITE);
    if (t.tem >= t.tot && nt.tem >= nt.tot) C.conquista('quem_lembra');
    const pc = contaPessoas(); if (pc.tem >= pc.tot) C.conquista('quem_eram');
  }
  function novidade(aba) {
    const st = S(); if (!st) return false;
    const vistos = (st.flags.abaVista || {})[aba] || 0;
    const tot = aba === 'tempo' ? conta(TEMPO).tem + conta(NOITE).tem : contaPessoas().tem;
    return tot > vistos;
  }
  function marcarVista(aba) {
    const st = S(); if (!st) return;
    st.flags.abaVista = st.flags.abaVista || {};
    st.flags.abaVista[aba] = aba === 'tempo' ? conta(TEMPO).tem + conta(NOITE).tem : contaPessoas().tem;
  }
  function marcasAbas() {
    document.querySelectorAll('#diario nav .btn').forEach(b => {
      const k = b.dataset.tab; let extra = '';
      if (k === 'tempo') { const t = conta(TEMPO), nt = conta(NOITE); extra = `${t.tem + nt.tem}/${t.tot + nt.tot}`; }
      else if (k === 'pessoas') { const p = contaPessoas(); extra = `${p.tem}/${p.tot}`; }
      else if (k === 'notas' && C.loreAchado) extra = `${C.loreAchado()}/${C.totalLore()}`;
      let sp = b.querySelector('.cont'); if (!sp) { sp = document.createElement('span'); sp.className = 'cont'; b.appendChild(sp); }
      sp.textContent = extra; b.classList.toggle('novo', (k === 'tempo' || k === 'pessoas') && novidade(k));
    });
  }

  // ------------------------------------------------------------- ABAS NOVAS DO DIÁRIO
  function renderTempo(el) {
    const t = conta(TEMPO), nt = conta(NOITE), st = S(), visto = ((st.flags.abaVista || {}).tempoChaves) || [];
    let h = `<p class="d-intro">O que eu já sei, em ordem. ${t.tem}/${t.tot} anos · ${nt.tem}/${nt.tot} da noite do fogo${t.tem >= t.tot && nt.tem >= nt.tot ? ' · a história inteira' : ' · o que falta está no caminho, não escondido'}</p>`;
    let buraco = null, ultimoOk = null;
    h += '<ol class="tempo">';
    for (const x of TEMPO) {
      if (x.secreta && !x.ok()) continue;
      const ok = x.ok(), k = 't' + x.a + x.t, novo = ok && !visto.includes(k);
      if (ok) { if (buraco === null && ultimoOk && ordemAno(x.a) - ordemAno(ultimoOk) > 15) buraco = [ultimoOk, x.a]; ultimoOk = x.a; }
      h += ok ? `<li class="${novo ? 'novo' : ''}${x.secreta ? ' secreta' : ''}"><b>${esc(x.a)}</b><span>${esc(x.t)}</span><small>${esc(x.de)}</small></li>`
        : `<li class="falta"><b>${esc(x.a.replace(/\d{2}\/\d{2}\//, '__/__/'))}</b><span>????</span></li>`;
    }
    h += '</ol>';
    if (buraco) h += `<p class="d-intro">Entre ${esc(buraco[0])} e ${esc(buraco[1])} a história tem um buraco.</p>`;
    h += `<h3>A noite de 14 de março de 1979</h3><ol class="tempo noite">`;
    for (const x of NOITE) { const ok = x.ok(); h += ok ? `<li><b>${esc(x.h)}</b><span>${esc(x.t)}</span><small>${esc(x.de)}</small></li>` : `<li class="falta"><b>??:??</b><span>????</span></li>`; }
    h += '</ol>';
    el.innerHTML = h;
    st.flags.abaVista = st.flags.abaVista || {}; st.flags.abaVista.tempoChaves = TEMPO.filter(x => x.ok()).map(x => 't' + x.a + x.t);
    marcarVista('tempo'); marcasAbas();
  }
  function renderPessoas(el) {
    const pc = contaPessoas();
    let h = `<p class="d-intro">Quem é quem. ${pc.tem}/${pc.tot} coisas que eu sei sobre eles.</p><div class="pessoas">`;
    const vistos = new Set(PESSOAS.filter(p => p.visto()).map(p => p.id));
    for (const p of PESSOAS) {
      const v = p.visto(), nome = !v ? '???' : (p.anon && !(p.revela && p.revela())) ? p.anon : p.nome, c = cor(p.id);
      const ls = v ? p.linhas.map(l => l[1]() ? `<li>${esc(l[0])}</li>` : '<li class="falta">…</li>').join('') : '<li class="falta">Ainda não sei quem é.</li>';
      const lig = v ? p.liga.filter(x => vistos.has(x)).map(x => { const q = PESSOAS.find(y => y.id === x); return (q.anon && !(q.revela && q.revela())) ? q.anon : q.nome; }) : [];
      const sabe = v ? p.linhas.filter(l => l[1]()).length : 0;
      h += `<div class="ficha${v ? '' : ' x'}" style="--c:${c}"><img alt="" src="${retrato(p.ret, v, c)}"><div><b>${esc(nome)}</b><em>${sabe}/${p.linhas.length}</em><ul>${ls}</ul>${lig.length ? `<small>ligado a: ${lig.map(esc).join(' · ')}</small>` : ''}</div></div>`;
    }
    el.innerHTML = h + '</div>';
    marcarVista('pessoas'); marcasAbas();
  }
  // paredes e placas lidas (vão na aba Notas e fitas)
  function renderParedes() {
    const L = fl().lidos || {}; const ks = Object.keys(L); if (!ks.length) return '';
    return `<h3>Escrito nas paredes e nas placas</h3><div class="paredes">${ks.map(k => `<div><span>${esc(L[k].onde || '')}</span>${esc(L[k].t)}</div>`).join('')}</div>`;
  }
  const ondeNota = id => ((fl().onde || {})[id]) || '';

  // ------------------------------------------------------------- PAPEL DE CADA NOTA
  const PAPEL = { n1: 'cartaz', n2: 'livro', n3: 'cozinha', n4: 'ficha', n5: 'caderno', n6: 'giz', n7: 'lista', n8: 'pautado', n9: 'pardo', n10: 'timbrado', n11: 'pedra', n12: 'jornal', n13: 'desenho', p1: 'caderno', p2: 'caderno', p3: 'caderno', p4: 'caderno', regras: 'regras', fita: 'k7' };
  const ORIGEM = { cartaz: 'cartaz colado no poste', livro: 'livro de ocorrências · nº 7', cozinha: 'caderno da cozinha', ficha: 'ficha da enfermaria', caderno: 'caderno escolar', giz: 'bilhete a giz de cera', lista: 'quadro de avisos', pautado: 'diário de capa preta', pardo: 'papel de embrulho', timbrado: 'Internato São Lázaro · Diretoria', pedra: 'pedra', jornal: 'recorte guardado numa gaveta', desenho: 'folha de desenho dobrada em quatro', regras: 'folha datilografada', k7: 'fita cassete · lado A' };
  function papel(id, doMundo) {
    const p = $('#note .paper'); if (!p) return;
    for (const c of [...p.classList]) if (c.startsWith('pp-')) p.classList.remove(c);
    let tipo = null;
    if (id) { const doc = (R.notas || []).find(x => x.id === id) || (R.paginas || []).find(x => x.id === id); tipo = (doc && doc.papel) || PAPEL[id] || (/^p\d/.test(id) ? 'caderno' : null); }
    if (tipo) p.classList.add('pp-' + tipo);
    let o = p.querySelector('.origem'); if (!o) { o = document.createElement('div'); o.className = 'origem'; p.prepend(o); }
    o.textContent = tipo ? ORIGEM[tipo] || '' : '';
    for (const d of ['d1', 'd2']) if (!p.querySelector('.' + d)) { const i = document.createElement('i'); i.className = 'deco ' + d; p.prepend(i); }
    const st = S();
    if (doMundo && id && id !== 'regras' && st && C.P.room) { st.flags.onde = st.flags.onde || {}; if (!st.flags.onde[id]) st.flags.onde[id] = C.P.room.nome || ''; }
    let w = p.querySelector('.onde'); if (!w) { w = document.createElement('span'); w.className = 'onde'; p.appendChild(w); }
    w.textContent = id && ondeNota(id) ? `achada: ${ondeNota(id)}` : '';
    p.style.animation = 'none'; void p.offsetWidth; p.style.animation = '';
    setTimeout(checar, 50);
  }

  // ------------------------------------------------------------- PLACA DAS SALAS (com 1979) E DESCRIÇÃO DE CENA
  const PLACA = {
    'estrada:estrada': ['por onde subiam os pais, aos domingos', 'Asfalto molhado entre as árvores. Nenhuma luz à frente, só a chuva.'],
    'estrada:patioPosto': ['o último telefone antes do internato', 'Bombas de gasolina apagadas. Uma placa alta range com o vento.'],
    'estrada:posto': ['onde o Seu Joaquim ouvia o rádio a noite inteira', 'Prateleiras quase vazias, um balcão e um rádio velho.'],
    'terreo:patio': ['onde formavam fila antes das nove', 'Chão de pedra encharcado. A fachada inteira olha para você.'],
    'terreo:hall': ['onde os pais deixavam as crianças e não entravam mais', 'Um balcão, um quadro de chaves e a escada para cima.'],
    'terreo:cw': ['proibido correr, proibido falar', 'Corredor comprido de ladrilho, portas dos dois lados.'],
    'terreo:ce': ['a ronda das nove passava por aqui', 'Corredor de ladrilho. No fundo, a porta da casa de máquinas.'],
    'terreo:aula': ['onde se copiava "eu não vou falar" cem vezes', 'Carteiras em fileira e uma lousa na parede.'],
    'terreo:biblio': ['livros de reza e de boas maneiras', 'Estantes até o teto. Cheiro de papel úmido.'],
    'terreo:refeit': ['comia-se calado, de cabeça baixa', 'Mesas compridas, postas para muita gente.'],
    'terreo:cozinha': ['sopa para trinta e sete', 'Panelas, um balcão e canecas penduradas na parede.'],
    'terreo:despensa': ['mantimentos para um inverno inteiro', 'Prateleiras de latas e sacos, pouco espaço entre elas.'],
    'terreo:diret': ['a sala do Diretor Albano', 'Uma mesa pesada, estantes de livros e um gravador.'],
    'terreo:enferm': ['onde se esperava a Hora passar', 'Camas de ferro com correias. Cortinas entre elas.'],
    'terreo:lavand': ['lençóis de trinta e sete camas, toda segunda', 'Tanques de cimento e varais vazios.'],
    'terreo:banh': ['banho frio, cinco minutos, em fila', 'Azulejos, pias em fila e cheiro de ferrugem.'],
    'terreo:maq': ['só o Inspetor tinha a chave', 'Um gerador grande e um quadro de fusíveis na parede.'],
    'superior:patamar': ['o alto da escada, onde ele parava para ouvir', 'O alto da escada. A madeira geme a cada passo.'],
    'superior:corr': ['a ronda passava de hora em hora', 'Um corredor longo e estreito, portas dos dois lados.'],
    'superior:dormA': ['os menores dormiam perto da escada', 'Fileiras de camas de ferro arrumadas.'],
    'superior:dormB': ['oito camas, oito armários, nenhuma conversa', 'Camas de ferro e armários encostados na parede.'],
    'superior:dormC': ['quem falava dormia de porta aberta', 'Camas de ferro. Um lençol caído no chão.'],
    'superior:dormD': ['o dormitório das meninas', 'Camas pequenas, cobertores dobrados em quadrado.'],
    'superior:dormE': ['o mais longe da escada', 'Camas arrumadas com cuidado demais.'],
    'superior:banhS': ['luz apagada às nove, até aqui', 'Azulejos frios e uma fileira de pias.'],
    'superior:celeste': ['a única porta em que as crianças batiam', 'Uma cama estreita, uma mesa e um terço em cima do travesseiro.'],
    'superior:roup': ['o armário mais fundo', 'Prateleiras de uniformes dobrados e armários altos.'],
    'superior:brinq': ['aberta só aos domingos, por uma hora', 'Brinquedos velhos espalhados e uma caixinha de música.'],
    'superior:sotao': ['o monta-cargas descia direto para baixo', 'Caixas empilhadas e a porta de um monta-cargas.'],
    'tuneis:entrada': ['a escada que só os funcionários usavam', 'Água pela canela. A escada some no escuro, acima.'],
    'tuneis:t1': ['drenagem das enchentes; ninguém descia', 'Túnel de tijolo com água parada.'],
    'tuneis:t2': ['os canos que vinham da cozinha', 'Túnel estreito. A água pinga do teto.'],
    'tuneis:t3': ['os canos que vinham da casa de máquinas', 'Túnel estreito. Canos enferrujados nas paredes.'],
    'tuneis:v1': ['a primeira das três válvulas', 'Uma câmara pequena com uma roda de válvula na parede.'],
    'tuneis:v2': ['a última das três válvulas', 'Uma câmara pequena com uma roda de válvula na parede.'],
    'tuneis:hub': ['toda a água do internato passava aqui', 'Uma cisterna redonda. O eco devolve cada passo.'],
    'tuneis:t4': ['o caminho do diretor', 'Um túnel reto até uma porta de ferro.'],
    'tuneis:secreta': ['a sala que o pedreiro devia esquecer', 'Uma sala seca, de madeira, com um cofre.'],
    'tuneis:t5': ['galeria de serviço', 'Galeria baixa, água escura até o fundo.'],
    'tuneis:t6': ['galeria de serviço', 'Galeria baixa, água escura até o fundo.'],
    'tuneis:saida': ['a escotilha para o cemitério das irmãs', 'Uma escada de ferro sobe até uma escotilha.'],
    'tuneis:dep': ['ferramentas, e o que mais quiseram esconder', 'Prateleiras de ferramentas enferrujadas.'],
    'cemiterio:cem': ['onde enterravam as irmãs, e às vezes as crianças', 'Lápides tortas na lama. Algumas velas acesas.'],
    'cemiterio:capela': ['trancada por fora na noite do fogo', 'Bancos queimados, cera no chão e a corda do sino ao fundo.']
  };
  let placaFila = null, placaTO;
  function mostrarPlaca(r) {
    const st = S(), k = `${C.W.mapa}:${r.id}`, info = (R.placas && R.placas[k]) || PLACA[k];
    const el = $('#placa-sala');
    el.querySelector('b').textContent = r.nome || '';
    el.querySelector('span').textContent = OPT.placaSala === 'historia' && info ? `1979 · ${info[0]}` : '';
    el.querySelector('em').textContent = OPT.descCena && info && info[1] ? info[1] : '';
    el.classList.remove('on'); void el.offsetWidth; el.classList.add('on'); el.hidden = false;
    clearTimeout(placaTO); placaTO = setTimeout(() => { el.classList.remove('on'); }, OPT.legTempo === 'longo' ? 6500 : 4600);
    if (info && C.historico) C.historico('Lugar', `${r.nome}${OPT.descCena && info[1] ? ': ' + info[1] : ''}`);
    void st;
  }
  let salaAnt = null;
  function vigiarSala() {
    const st = S(), P = C.P; if (!st || !P.room || P.room === salaAnt) return;
    salaAnt = P.room; const r = P.room, k = `${C.W.mapa}:${r.id}`;
    st.flags.placa = st.flags.placa || {};
    if (st.flags.placa[k] || !r.nome || (OPT.placaSala === 'nao' && !OPT.descCena)) return;
    st.flags.placa[k] = true; placaFila = r;
  }

  // ------------------------------------------------------------- LER PLACAS E PAREDES DE PERTO (sem tela cheia)
  let alvosLer = [], grupoRef = null, nFilhos = -1, scanT = 0, olhaT = 0, olhaM = null, leituraTO, ultLido = null;
  const fw = new THREE.Vector3(), v1 = new THREE.Vector3();
  function escanear() {
    const W = C.W; alvosLer = [];
    if (!W.grupo) return;
    W.grupo.traverse(o => { if (o.userData && o.userData.leitura) alvosLer.push(o); });
    grupoRef = W.grupo; nFilhos = W.grupo.children.length;
  }
  function mostrarLeitura(txt) {
    const el = $('#leitura'); el.textContent = txt; el.classList.remove('on'); void el.offsetWidth; el.classList.add('on');
    clearTimeout(leituraTO); leituraTO = setTimeout(() => el.classList.remove('on'), OPT.legTempo === 'longo' ? 6000 : 4000);
  }
  function ler(dt) {
    const st = S(), W = C.W; if (!st || OPT.leitura === false) return;
    scanT -= dt;
    if (W.grupo !== grupoRef || (scanT <= 0 && W.grupo.children.length !== nFilhos)) { scanT = 2; escanear(); }
    if (!alvosLer.length) return;
    C.camera.getWorldDirection(fw);
    let melhor = null, md = 1e9;
    for (const m of alvosLer) {
      if (!m.visible) continue;
      const L = m.userData.leitura; m.getWorldPosition(v1); const d = v1.distanceTo(C.camera.position);
      if (d > (L.parede ? 7 : 4.5)) continue;
      if (L.parede && !(m.material && m.material.opacity > .35)) continue; // só com a lanterna em cima
      v1.sub(C.camera.position).normalize(); const dot = fw.dot(v1);
      if (dot < (L.parede ? .95 : .93)) continue;
      if (d < md) { md = d; melhor = m; }
    }
    if (melhor !== olhaM) { olhaM = melhor; olhaT = 0; }
    if (!melhor) return;
    olhaT += dt;
    const L = melhor.userData.leitura;
    if (olhaT >= (L.parede ? 1 : .5) && ultLido !== melhor) {
      ultLido = melhor;
      const t = String(L.t).replace(/\s*\n\s*/g, ' ');
      if (t === '#contagem') mostrarLeitura('Na parede: dez riscos, contados de um em um.');
      else mostrarLeitura((L.parede ? 'Na parede: ' : 'Placa: ') + t);
      st.flags.lidos = st.flags.lidos || {};
      const k = W.mapa + ':' + t;
      if (!st.flags.lidos[k]) { st.flags.lidos[k] = { t: t === '#contagem' ? 'dez riscos, contados de um em um' : t, onde: (C.P.room && C.P.room.nome) || '' }; if (C.historico) C.historico('nota', (L.parede ? 'Na parede: ' : 'Placa: ') + t); }
    }
  }

  // ------------------------------------------------------------- OLHO DA MENINA NA MIRA
  function olho() {
    const el = $('#olho-ana'), A = C.ANA, st = S();
    const on = OPT.olhoAna !== false && st && C.mode === 'jogo' && !C.ui && !st.dead && A.ativa && !A.script;
    el.hidden = !on; if (!on) return;
    el.classList.toggle('fechado', !A.vista);
    el.classList.toggle('falha', !!(st.flashOn && st.battery < 18));
  }

  // ------------------------------------------------------------- TEMPO EM FITAS, NOTAS E DIÁLOGOS · SOMA DOS MELHORES
  let refS = null, refCap = -1;
  function tempos(dt) {
    const st = S(); if (!st || C.mode !== 'jogo' || st.dead) return;
    if (st !== refS) { refS = st; refCap = st.chapter; if (st.flags.capFatos0 === undefined) st.flags.capFatos0 = chaves().size; }
    else if (st.chapter !== refCap) { refCap = st.chapter; st.flags.capLeit = 0; st.flags.capFita = 0; st.flags.capFatos0 = chaves().size; st.flags.segBase = 0; }
    if (C.ui === 'nota' || C.ui === 'dialogo') { st.flags.capLeit = (st.flags.capLeit || 0) + dt; st.flags.totLeit = (st.flags.totLeit || 0) + dt; }
    else if (C.fita && !C.ui) { st.flags.capFita = (st.flags.capFita || 0) + dt; st.flags.totFita = (st.flags.totFita || 0) + dt; }
  }
  function objetivo(id) {
    const st = S(); if (!st) return;
    const c = R.capitulos[st.chapter]; if (!c) return;
    const caps = C.lsGet(C.CAPS_KEY, {}), reg = caps[c.id] || {}, segs = { ...(reg.segs || {}) };
    if (st.chapter !== refCap) { refCap = st.chapter; st.flags.segBase = 0; }
    const seg = Math.max(0, st.capT - (st.flags.segBase || 0)); st.flags.segBase = st.capT;
    if (!segs[id] || seg < segs[id]) { segs[id] = seg; caps[c.id] = { ...reg, segs }; C.lsSet(C.CAPS_KEY, caps); }
  }
  function somaMelhores(c) {
    const reg = (C.lsGet(C.CAPS_KEY, {})[c.id]) || {}, segs = reg.segs || {};
    if (!c.objetivos.every(o => segs[o.id] !== undefined)) return null;
    return c.objetivos.reduce((a, o) => a + segs[o.id], 0);
  }
  function fimCap(c) {
    const st = S(), el = $('#fc-mundo'); if (!st || !el) return;
    const L = [];
    const sm = somaMelhores(c); if (sm !== null) L.push(`soma dos melhores trechos ${mmss(sm)}${st.capT - sm > 5 ? ` · dá para tirar ${mmss(st.capT - sm)}` : ''}`);
    const fi = st.flags.capFita || 0, le = st.flags.capLeit || 0;
    if (fi > 3 || le > 3) L.push(`ouvindo fitas ${mmss(fi)} (o relógio corre) · lendo e conversando ${mmss(le)} (o relógio para)`);
    const novos = Math.max(0, chaves().size - (st.flags.capFatos0 || 0));
    if (novos) L.push(`você descobriu ${novos} ${novos === 1 ? 'coisa nova' : 'coisas novas'} sobre o internato · TAB · Linha do tempo e Pessoas`);
    el.innerHTML = L.join('<br>');
  }

  // ------------------------------------------------------------- FINAL: SOMA DOS RECORDES E SELO DE CORRIDA
  const hash = s => { let h = 2166136261; for (const ch of String(s)) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619) >>> 0; } return h.toString(36).toUpperCase().slice(-6).padStart(6, '0'); };
  const codNoite = st => { try { return PG.codigo ? PG.codigo(st) : '—'; } catch (e) { return '—'; } };
  const verifica = (tempo, cod, mortes) => hash(`${Math.round(tempo)}|${cod}|${mortes}|hora`);
  function desenharSelo(cv, tipo) {
    const st = S(), g = cv.getContext('2d'), w = cv.width, h = cv.height, F = R.finais[tipo] || {};
    g.fillStyle = '#070605'; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 2600; i++) { g.fillStyle = `rgba(255,235,200,${Math.random() * .05})`; g.fillRect(Math.random() * w, Math.random() * h, 1.5, 1.5); }
    g.strokeStyle = '#3a3228'; g.lineWidth = 2; g.strokeRect(10, 10, w - 20, h - 20);
    g.fillStyle = '#8e1b14'; g.fillRect(10, 10, 6, h - 20);
    g.fillStyle = '#cfc3a6'; g.font = '30px "IM Fell English SC", Georgia'; g.fillText('A HORA DO SILÊNCIO', 34, 52);
    g.fillStyle = '#857a63'; g.font = 'italic 16px "IM Fell English", Georgia'; g.fillText((F.titulo || '').replace('FINAL: ', 'final: ').toLowerCase(), 34, 76);
    g.fillStyle = '#e9dfc8'; g.font = '64px "Special Elite", monospace'; g.fillText(relogio(st.tempo), 34, 150);
    const cod = codNoite(st), lore = C.loreAchado ? `${C.loreAchado()}/${C.totalLore()}` : '', secr = Object.keys(st.notes || {}).concat(Object.keys(st.fitas || {})).filter(id => [...R.notas, ...R.paginas, ...R.fitas].some(x => x.id === id && x.secreta)).length;
    const t = conta(TEMPO);
    const linhas = [['dificuldade', C.D().nome], ['noite', cod], ['mortes', String(st.mortes || 0)], ['notas e fitas', lore + (secr ? ` · ${secr} segredo${secr > 1 ? 's' : ''}` : '')], ['linha do tempo', `${t.tem}/${t.tot}`]];
    g.font = '15px "Special Elite", monospace';
    linhas.forEach(([a, b], i) => { g.fillStyle = '#6d6452'; g.fillText(a, 34 + (i % 2) * 290, 192 + Math.floor(i / 2) * 26); g.fillStyle = '#cfc3a6'; g.fillText(b, 164 + (i % 2) * 290, 192 + Math.floor(i / 2) * 26); });
    g.fillStyle = '#c9a75a'; g.font = '13px "Special Elite", monospace'; g.fillText(`selo ${verifica(st.tempo, cod, st.mortes || 0)}`, w - 150, h - 24);
    g.fillStyle = '#5d5546'; g.fillText('jogue de fone, no escuro', 34, h - 24);
    g.save(); g.translate(w - 92, 92); g.rotate(-.18); g.strokeStyle = 'rgba(142,27,20,.75)'; g.lineWidth = 3; g.beginPath(); g.arc(0, 0, 50, 0, Math.PI * 2); g.stroke(); g.beginPath(); g.arc(0, 0, 42, 0, Math.PI * 2); g.stroke();
    g.fillStyle = 'rgba(142,27,20,.85)'; g.font = '13px "IM Fell English SC", Georgia'; g.textAlign = 'center'; g.fillText('SÃO LÁZARO', 0, -6); g.fillText(st.dif === 'pesadelo' ? 'PESADELO' : '1979 · 1994', 0, 12); g.restore();
  }
  async function copiar(t) {
    try { await navigator.clipboard.writeText(t); return true; } catch (e) {}
    try { const a = document.createElement('textarea'); a.value = t; document.body.appendChild(a); a.select(); const ok = document.execCommand('copy'); a.remove(); return ok; } catch (e) { return false; }
  }
  function telaFinal(tipo) {
    const st = S(); if (!st) return;
    const caps = C.lsGet(C.CAPS_KEY, {}), recs = R.capitulos.map(c => (caps[c.id] || {}).tempo).filter(x => x && x < 1e9);
    const extra = [];
    if (recs.length === R.capitulos.length) extra.push(`soma dos seus recordes por capítulo ${mmss(recs.reduce((a, b) => a + b, 0))}`);
    if ((st.flags.totFita || 0) > 3 || (st.flags.totLeit || 0) > 3) extra.push(`fitas ${mmss(st.flags.totFita || 0)} · notas e diálogos ${mmss(st.flags.totLeit || 0)}`);
    const t = conta(TEMPO), nt = conta(NOITE), pc = contaPessoas();
    extra.push(`linha do tempo ${t.tem + nt.tem}/${t.tot + nt.tot} · pessoas ${pc.tem}/${pc.tot}`);
    $('#e-stats').innerHTML += '<br>' + extra.join(' · ');
    // selo
    let cv = $('#e-selo');
    if (!cv) { cv = document.createElement('canvas'); cv.id = 'e-selo'; cv.width = 640; cv.height = 300; $('#e-stats').after(cv); }
    desenharSelo(cv, tipo);
    const menu = $('#e-menu');
    if (!$('#e-salvar')) {
      const a = document.createElement('button'); a.className = 'btn'; a.id = 'e-salvar'; a.textContent = 'Salvar selo';
      const b = document.createElement('button'); b.className = 'btn'; b.id = 'e-bata'; b.textContent = 'Copiar "bata meu tempo"';
      menu.before(a, b);
      a.onclick = () => { try { const l = document.createElement('a'); l.href = $('#e-selo').toDataURL('image/png'); l.download = 'selo-hora-do-silencio.png'; document.body.appendChild(l); l.click(); l.remove(); a.textContent = 'Selo salvo'; } catch (e) { a.textContent = 'Não deu para salvar'; } setTimeout(() => a.textContent = 'Salvar selo', 2000); };
      b.onclick = async () => {
        const s2 = S(); if (!s2) return; const cod = codNoite(s2);
        const url = location.origin + location.pathname + '?noite=' + encodeURIComponent(cod) + '&bata=' + Math.round(s2.tempo).toString(36) + '&m=' + (s2.mortes || 0) + '&v=' + verifica(s2.tempo, cod, s2.mortes || 0);
        b.textContent = await copiar(`Bata ${relogio(s2.tempo)} na mesma noite de A Hora do Silêncio.\n${url}`) ? 'Link copiado' : 'Não deu para copiar';
        setTimeout(() => b.textContent = 'Copiar "bata meu tempo"', 2200);
      };
    }
  }
  // quem abre o link: mesma noite e o tempo a bater
  function lerBata() {
    let q; try { q = new URLSearchParams(location.search); } catch (e) { return; }
    const cod = q.get('noite'), bt = q.get('bata'); if (!cod || !bt || !/^[0-9a-z]{1,6}$/i.test(bt)) return;
    const tempo = parseInt(bt, 36), m = +(q.get('m') || 0), ok = q.get('v') === verifica(tempo, cod, m);
    const inp = $('#o-desafio'); if (inp && !inp.value && /^[0-9A-Z]{4,7}(-[FNP][POAV]*)?$/i.test(cod)) inp.value = cod.toUpperCase();
    const el = document.createElement('div'); el.id = 'bata';
    el.innerHTML = `Bata <b>${relogio(tempo)}</b> · a mesma noite (${esc(cod)}) já está no campo Desafio · ${m} ${m === 1 ? 'morte' : 'mortes'}<small>${ok ? 'selo conferido' : 'selo não confere: o tempo pode ter sido mexido'}</small>`;
    $('#title').appendChild(el);
  }

  // ------------------------------------------------------------- RÁDIO-RELÓGIO DO TÍTULO
  let tituloT = 0, radioT = 0, alarmeMin = -1, clRadio = 0, clRadioT = 0, radioTO;
  function radio(dt) {
    const el = $('#radiorel'); if (!el) return;
    const noTitulo = C.mode === 'titulo' && !$('#title').hidden;
    if (!noTitulo) { tituloT = 0; el.classList.remove('parado', 'alarme'); return; }
    tituloT += dt; radioT -= dt; clRadioT -= dt;
    if (radioT > 0) return; radioT = .5;
    if (clRadioT > 0) return; // mostrando a frequência
    el.classList.remove('sint');
    const hh = el.querySelector('.h'), mi = el.querySelector('.m');
    if (tituloT > 540) { el.classList.add('parado'); el.classList.remove('alarme'); hh.textContent = '20'; mi.textContent = '47'; return; }
    const d = new Date(), h = d.getHours(), m = d.getMinutes();
    hh.textContent = String(h).padStart(2, '0'); mi.textContent = String(m).padStart(2, '0');
    const alarme = h === 21 && m === 0; el.classList.toggle('alarme', alarme);
    if (alarme && alarmeMin !== d.getDate()) { alarmeMin = d.getDate(); try { C.SFX.estatica(); C.SFX.badaladas(9); } catch (e) {} subT('...Rádio Serra FM, vinte e uma horas em ponto. Começou a Hora.'); }
  }
  function subT(t) { const s = $('#t-sub'); if (!s) return; const o = R.subtitulo; s.textContent = t; s.classList.add('segredo'); clearTimeout(radioTO); radioTO = setTimeout(() => { s.textContent = o; s.classList.remove('segredo'); }, 6500); }
  const FREQ = ['FM 88,3', 'FM 94,7', 'AM 790'];
  function clicarRadio() {
    const el = $('#radiorel'); clRadio++; clRadioT = 2.6; el.classList.add('sint');
    el.querySelector('.h').textContent = ''; el.querySelector('.m').textContent = FREQ[(clRadio - 1) % FREQ.length];
    try { C.SFX.estatica(); } catch (e) {}
    if (clRadio % 3 === 0) { el.querySelector('.m').textContent = '21:04'; subT('(no rádio, uma criança cochicha) ...tá gravando?'); C.conquista('segredo_radio'); }
  }

  // ------------------------------------------------------------- QUADRO A QUADRO
  function frame(dt, ativo) {
    radio(dt); olho(); tempos(dt);
    ultChecar -= dt;
    if (ultChecar <= 0 && S() && C.mode === 'jogo') { ultChecar = 1; checar(); }
    if (!ativo || !S()) return;
    vigiarSala();
    const M = C.M, caca = M.ativo && M.state === 'caca';
    if (placaFila && !caca && !C.ui) { mostrarPlaca(placaFila); placaFila = null; }
    ler(dt);
  }
  function lembranca() { const u = fl().ultFato; return u ? `a última coisa que eu soube: ${u}` : ''; }

  // ganchos de HTML
  const rr = $('#radiorel'); if (rr) rr.onclick = clicarRadio;
  lerBata();
  return { texto, papel, renderTempo, renderPessoas, renderParedes, ondeNota, marcasAbas, objetivo, fimCap, telaFinal, frame, lembranca,
    marcaMapa(r) { const k = `${C.W.mapa}:${r.id}`, info = (R.placas && R.placas[k]) || PLACA[k], st = S(); if (!st || !(st.visited[k] || r.fora)) return ''; const notas = Object.entries(fl().onde || {}).filter(([, v]) => v === r.nome).length; return { titulo: info ? `${r.nome} — 1979: ${info[0]}` : r.nome, notas }; } };
}
