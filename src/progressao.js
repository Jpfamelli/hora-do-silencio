// PROGRESSÃO E REJOGABILIDADE — rank com metas, selos, desafios secretos, checkpoints por objetivo,
// ajuda invisível, diagnóstico de morte, dicas progressivas, modos (Uma Vida, cronômetro, amuletos,
// código de desafio), conquistas extras, acervo de lore entre partidas, estatísticas e memória do título.
// O motor (jogo.js) chama PG.ligar(ctx) uma vez e usa os ganchos PG.* em pontos pontuais.
const LORE_KEY = 'hora-silencio-v3-acervo';
const STATS_KEY = 'hora-silencio-stats';
const ULTIMA_KEY = 'hora-silencio-ultima';
const SEGREDO_KEY = 'hora-silencio-segredos';
const ORDEM_RANK = 'CBAS';
const ROMANOS = ['Prólogo', 'Capítulo I', 'Capítulo II', 'Capítulo III', 'Capítulo IV', 'Capítulo V'];
const LORE_MAPA = { estrada: ['f5', 'n1'], terreo: ['f1', 'p1', 'n2', 'n3', 'n4', 'n5'], superior: ['f2', 'p2', 'p3', 'n6', 'n7', 'n8'], tuneis: ['f3', 'f4', 'p4', 'n9', 'n10'], cemiterio: ['n11', 'n12'] };
const FITAS_FINAL = ['f1', 'f2', 'f3', 'f4', 'f5'], PAGINAS_FINAL = ['p1', 'p2', 'p3', 'p4'];

let C = null; // contexto do motor
const $ = s => document.querySelector(s);
const ls = { get: (k, d) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } }, set: (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} } };
const fmt = s => { s = Math.max(0, Math.round(s)); return `${Math.floor(s / 60)}min ${String(s % 60).padStart(2, '0')}s`; };
const fmtC = s => { s = Math.max(0, Math.floor(s)); const h = Math.floor(s / 3600), m = Math.floor(s / 60) % 60, ss = s % 60; return (h ? h + ':' + String(m).padStart(2, '0') : String(m).padStart(2, '0')) + ':' + String(ss).padStart(2, '0'); };
const RP = () => window.ROTEIRO.progressao || { capitulos: {}, conquistas: [] };
const capInfo = id => RP().capitulos[id] || {};
const meta = id => capInfo(id).meta || { s: 8, a: 13 };

// --- semente (código de desafio)
function rng(seed) { let a = seed >>> 0 || 1; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
function novaSemente() { return Math.floor(Math.random() * 2176782335 + 1).toString(36).toUpperCase().padStart(6, '0'); }
function semear(st, sem) {
  st.semente = sem;
  const r = rng(parseInt(sem, 36)), d = n => Math.floor(r() * n);
  st.code = [1 + d(9), d(10), 1 + d(9), d(10)];
  st.quadro = [1 + d(9), d(10), d(10)];
  const a = [1, 2, 3]; for (let i = 2; i > 0; i--) { const j = d(i + 1); [a[i], a[j]] = [a[j], a[i]]; } st.ordem = a;
}
const DIF_LETRA = { facil: 'F', normal: 'N', pesadelo: 'P' };
function codigoDesafio(S) { if (!S.semente || S.semente === 'SEMCOD') return '—'; return `${S.semente}-${DIF_LETRA[S.dif] || 'N'}${(S.mods || []).map(m => ({ pilha: 'P', ouvido: 'O', passos: 'A', aviso: 'V' })[m] || '').join('')}`; }
function lerCodigo(txt) {
  const m = String(txt || '').trim().toUpperCase().match(/^([0-9A-Z]{4,7})(?:-([FNP])([POAV]*))?$/);
  if (!m) return null;
  const dif = { F: 'facil', N: 'normal', P: 'pesadelo' }[m[2] || 'N'];
  const mapa = { P: 'pilha', O: 'ouvido', A: 'passos', V: 'aviso' };
  return { semente: m[1], dif, mods: [...new Set((m[3] || '').split('').map(c => mapa[c]).filter(Boolean))] };
}

// --- estatísticas globais
const stats = () => ls.get(STATS_KEY, { partidas: 0, concluidas: 0, mortes: 0, causas: {}, tempo: 0, finais: {}, garrafas: 0, melhorTotal: 0, capsS: 0 });
function somaStat(fn) { const s = stats(); fn(s); ls.set(STATS_KEY, s); return s; }
let tempoPend = 0;
const segredos = () => ls.get(SEGREDO_KEY, {});
const acervo = () => ls.get(LORE_KEY, {});
const algumFinal = () => Object.keys(stats().finais || {}).length > 0;

// --- conquistas (fila, secretas, som)
const filaConq = []; let conqMostrando = false;
function defConq(id) { return window.ROTEIRO.conquistas.find(x => x.id === id); }
function conquista(id) {
  if (!C) return;
  const c = ls.get(C.KEYS.CONQ_KEY, {}); if (c[id]) return;
  const def = defConq(id); if (!def) return;
  c[id] = Date.now(); ls.set(C.KEYS.CONQ_KEY, c);
  if (C.S) (C.S.conqNoite = C.S.conqNoite || []).push(id);
  filaConq.push(def); if (!conqMostrando) proxConq();
}
function proxConq() {
  const def = filaConq.shift(), el = $('#conq');
  if (!def) { conqMostrando = false; return; }
  conqMostrando = true;
  el.innerHTML = `${def.secreta || def.segredo ? 'Conquista secreta' : 'Conquista'}: ${def.nome}<small>${def.desc}</small>`; el.classList.add('on');
  try { C.SFX.pegar(); } catch (e) {}
  setTimeout(() => { el.classList.remove('on'); setTimeout(proxConq, 700); }, 4200);
}

// --- rank
function calcRank(S) {
  const c = window.ROTEIRO.capitulos[S.chapter], mt = meta(c.id), dano = S.capDano || 0;
  const desconto = Math.min(S.capT * .3, (S.capLore || 0) * 30);
  const tEf = Math.max(0, S.capT - desconto), min = tEf / 60;
  const ruido = S.capT > 1 ? (S.capRuido || 0) / S.capT : 0;
  const selos = { intocada: dano === 0, rapida: min < mt.s, invisivel: (S.capVisto || 0) <= 1, silenciosa: ruido < 3 };
  let pts = (dano === 0 ? 3 : dano < 60 ? 2 : dano < 120 ? 1 : 0) + (min < mt.s ? 2 : min < mt.a ? 1 : 0) + (selos.invisivel ? 1 : 0) + (selos.silenciosa ? 1 : 0)
    - (S.capMortes || 0) + ((S.mods || []).length ? 1 : 0);
  const letra = pts >= 6 ? 'S' : pts >= 4 ? 'A' : pts >= 2 ? 'B' : 'C';
  const falta = [];
  if (!selos.intocada) falta.push('sem dano');
  if (!selos.rapida) falta.push(`abaixo de ${mt.s}:00 (fez ${fmtC(tEf)})`);
  if (!selos.invisivel) falta.push(`perseguida no máximo 1 vez (foram ${S.capVisto})`);
  if (!selos.silenciosa) falta.push('ruído baixo');
  if (S.capMortes) falta.push(`sem morrer (${S.capMortes} ${S.capMortes > 1 ? 'mortes' : 'morte'})`);
  const nivelRuido = ruido < 3 ? 'Silenciosa' : ruido < 5.5 ? 'Cuidadosa' : 'Barulhenta';
  return { letra, pts, selos, falta, tEf, desconto, ruido, nivelRuido, meta: mt };
}
function desafioOk(S, id) {
  switch (id) {
    case 'c0': return (S.capCorreu || 0) < .5;
    case 'c1': return (S.capLuzT || 0) < 60;
    case 'c2': return S.procTipo === 'cama';
    case 'c3': return !S.flags.tocada_ana_3 && !!S.done.ana;
    case 'c4': return (S.capGarrafas || 0) === 0;
    case 'c5': return (S.capDano || 0) === 0;
  }
  return false;
}
function registrarCap(S, c, r) {
  const caps = ls.get(C.KEYS.CAPS_KEY, {}), ant = caps[c.id] || {};
  const selos = { ...(ant.selos || {}) }; for (const k in r.selos) if (r.selos[k]) selos[k] = true;
  const des = desafioOk(S, c.id);
  caps[c.id] = { ...ant, rank: !ant.rank || ORDEM_RANK.indexOf(r.letra) > ORDEM_RANK.indexOf(ant.rank) ? r.letra : ant.rank, tempo: Math.min(ant.tempo || 1e9, S.capT), selos, desafio: ant.desafio || des };
  ls.set(C.KEYS.CAPS_KEY, caps);
  (S.ranks = S.ranks || {})[c.id] = r.letra;
  if (r.letra === 'S') { conquista('rank_s'); if (!ant.rank || ant.rank !== 'S') somaStat(s => { s.capsS = (s.capsS || 0) + 1; }); }
  if (r.selos.silenciosa && S.capT > 30) conquista('silenciosa');
  if (S.chapter >= 1) { if ((S.capCorreu || 0) < .5) conquista('nao_corra'); if ((S.capVisto || 0) === 0) conquista('fantasma'); }
  if ((S.mods || []).length >= 2) conquista('amuleto');
  const todos = window.ROTEIRO.capitulos;
  if (todos.every(x => caps[x.id] && caps[x.id].rank === 'S')) conquista('boletim');
  if (todos.every(x => caps[x.id] && caps[x.id].desafio)) conquista('desafios');
  return { ant, des, novoDes: des && !ant.desafio };
}

// --- checkpoints
let seqMortes = 0;
const SEM_SAVE = new Set(['caixinha', 'cofre', 'sino', 'fugir', 'gerador', 'subir', 'chave_porao', 'sair_tuneis', 'abrir_portao']);
function podeSalvar() {
  const S = C.S, M = C.M;
  if (!S || S.dead || S.fim || S.hidden || S.flags.sino) return false;
  if (M.ativo && M.state === 'caca') return false;
  if (C.PROC.fase) return false;
  if (C.ANA.ativa && C.ANA.script) return false;
  return C.mode === 'jogo';
}
let salvoTO;
function mostrarSalvo() { const el = $('#salvo'); if (!el) return; el.classList.add('on'); clearTimeout(salvoTO); salvoTO = setTimeout(() => el.classList.remove('on'), 2200); }

// --- painéis
function abrirPainel(titulo, html) { $('#pn-tit').textContent = titulo; $('#pn-lista').innerHTML = html; $('#title').hidden = true; $('#painel').hidden = false; }
const SELOS = [['intocada', 'Intocada', 'nenhum dano'], ['rapida', 'Rápida', 'abaixo da meta'], ['invisivel', 'Invisível', 'perseguida no máx. 1x'], ['silenciosa', 'Silenciosa', 'ruído baixo']];
function selosHTML(selos, alvo) { return `<span class="selos">${SELOS.map(([k, n, a]) => `<i class="selo ${selos[k] ? 'on' : ''}" title="${n}: ${a}">${n}${alvo ? `<em>${k === 'rapida' ? `abaixo de ${alvo.s}:00` : a}</em>` : ''}</i>`).join('')}</span>`; }

function painelCapitulos() {
  const R = window.ROTEIRO, caps = ls.get(C.KEYS.CAPS_KEY, {}), ac = acervo();
  const nS = R.capitulos.filter(c => caps[c.id] && caps[c.id].rank === 'S').length, nD = R.capitulos.filter(c => caps[c.id] && caps[c.id].desafio).length;
  const totalAc = Object.keys(ac).length, total = R.notas.length + R.paginas.length + R.fitas.length;
  let h = `<p class="pn-resumo">Ranks S ${nS}/${R.capitulos.length} · desafios secretos ${nD}/${R.capitulos.length} · acervo ${totalAc}/${total} · o rejogo usa a dificuldade escolhida no menu</p>`;
  h += R.capitulos.map((c, i) => {
    const d = caps[c.id] || {}, ok = !!d.snap, info = capInfo(c.id);
    if (!ok) return `<div class="it x riscada"><div><b>${ROMANOS[i]} — fita riscada</b><br><small>ainda não alcançado</small></div></div>`;
    const lore = LORE_MAPA[c.mapa] || [], achou = lore.filter(id => ac[id]).length;
    const linhas = [d.tempo ? `melhor tempo ${fmt(d.tempo)} · meta S ${meta(c.id).s}:00` : 'liberado', `lore do mapa ${achou}/${lore.length}`,
      `desafio secreto: ${d.desafio ? `<b class="ouro">${info.desafio ? info.desafio.nome : 'cumprido'}</b>` : '???'}`];
    if (d.rank === 'S' && info.frase_s) linhas.push(`<i class="frase">“${info.frase_s}”</i>`);
    return `<div class="it"><div><b>${c.titulo}</b><br><small>${linhas.join(' · ')}</small><br>${selosHTML(d.selos || {})}</div><div style="display:flex;align-items:center;gap:12px"><span class="rank">${d.rank || ''}</span><button class="btn" data-cap="${c.id}">Jogar</button></div></div>`;
  }).join('');
  abrirPainel('Capítulos', h);
  $('#pn-lista').querySelectorAll('[data-cap]').forEach(b => b.onclick = () => {
    C.iniciarAudio();
    const snap = { ...caps[b.dataset.cap].snap, dif: $('#o-dif').value };
    C.setS(null); $('#painel').hidden = true;
    try { C.carregarSnap(snap); } catch (e) { console.warn('save do capítulo inválido', e); $('#title').hidden = false; memoria('Essa fita estava estragada. Jogue o capítulo de novo para regravar.'); return; }
    const S = C.S; S.replay = true; S.completo = false; S.modo = { ...(S.modo || {}), crono: !!C.OPT.crono, umaVida: false };
    C.entrarJogo();
  });
}
function painelConquistas() {
  const R = window.ROTEIRO, c = ls.get(C.KEYS.CONQ_KEY, {}), n = R.conquistas.filter(x => c[x.id]).length;
  const pct = Math.round(n / R.conquistas.length * 100);
  const data = t => { try { return new Date(t).toLocaleDateString('pt-BR'); } catch (e) { return ''; } };
  const h = `<p class="pn-resumo">${n} de ${R.conquistas.length} · ${pct}%<span class="barra"><i style="width:${pct}%"></i></span></p>` + R.conquistas.map(x => {
    const tem = c[x.id];
    if (!tem && x.secreta) return `<div class="it x"><div><b>???</b><br><small>conquista secreta · “${x.dica || '...'}”</small></div><span class="rank"></span></div>`;
    return `<div class="it ${tem ? '' : 'x'}"><div><b>${x.nome}</b>${x.secreta ? ' <small>(secreta)</small>' : ''}<br><small>${x.desc}${tem && typeof tem === 'number' ? ` · em ${data(tem)}` : ''}</small></div><span class="rank">${tem ? '✦' : ''}</span></div>`;
  }).join('');
  abrirPainel(`Conquistas ${n}/${R.conquistas.length}`, h);
}
function painelStats() {
  const s = stats(), R = window.ROTEIRO, nf = Object.keys(s.finais || {}).length;
  const causas = { inspetor: 'o Inspetor', ana: 'a Menina Que Conta', procissao: 'a Procissão' };
  const L = [
    ['Noites começadas', s.partidas || 0], ['Noites terminadas', s.concluidas || 0], ['Tempo dentro do internato', fmt((s.tempo || 0) + tempoPend)],
    ['Melhor tempo até um final', s.melhorTotal ? fmt(s.melhorTotal) : '—'], ['Finais vistos', `${nf}/3`],
    ['Vezes encontrada', s.mortes || 0], ...Object.entries(causas).map(([k, n]) => [`  · por ${n}`, (s.causas || {})[k] || 0]),
    ['Garrafas jogadas', s.garrafas || 0], ['Capítulos em S', `${(s.capsS || 0)}/${R.capitulos.length}`],
    ['Acervo (notas, páginas e fitas)', `${Object.keys(acervo()).length}/${R.notas.length + R.paginas.length + R.fitas.length}`]
  ];
  abrirPainel('Estatísticas', L.map(([a, b]) => `<div class="it"><div><b>${a}</b></div><span class="rank" style="font-size:20px">${b}</span></div>`).join(''));
}

// --- título
function memoria(txt) { const el = $('#t-memoria'); if (el) el.textContent = txt || ''; }
let bufTitulo = '', horaTocou = false;
function titulo() {
  const R = window.ROTEIRO, P = RP(), M = P.memoria || {}, ult = ls.get(ULTIMA_KEY, null), s = stats(), seg = segredos();
  let sub = R.subtitulo;
  if (ult && ult.tipo === 'final' && M.subtitulo && M.subtitulo[ult.final]) sub = M.subtitulo[ult.final];
  let mem = '';
  if (ult && ult.tipo === 'morte' && M.morte) mem = (M.morte[ult.quem] || M.morte.inspetor).replace('{cap}', ROMANOS[ult.cap] || 'algum lugar');
  else if (ult && ult.tipo === 'final' && M.final) mem = M.final[ult.final] || '';
  const h = new Date().getHours();
  $('#t-titulo').classList.toggle('hora', h === 21);
  if (h === 21) { sub = M.hora || sub; conquista('hora_certa'); }
  $('#t-sub').textContent = sub; memoria(mem);
  $('#l-umavida').hidden = !(algumFinal() || seg.umaVida);
  const am = $('#t-amuletos');
  if (am) {
    am.hidden = !algumFinal();
    const sel = C.OPT.mods || [];
    am.innerHTML = 'Amuletos (+1 no rank): ' + (P.amuletos || []).map(a => `<label title="${a.desc}"><input type="checkbox" data-amuleto="${a.id}" ${sel.includes(a.id) ? 'checked' : ''}> ${a.nome}</label>`).join('');
    am.querySelectorAll('[data-amuleto]').forEach(cb => cb.onchange = () => { C.OPT.mods = [...am.querySelectorAll('[data-amuleto]:checked')].map(x => x.dataset.amuleto); C.salvarOpt(); });
  }
  difDesc();
  // ele lembra de quem morreu muito
  try {
    const sp = C.W.def && C.W.def.spawns && C.W.def.spawns.titulo;
    if (sp && (s.mortes || 0) >= 20) { const y = sp.yaw || 0; C.MON.g.visible = true; C.MON.g.position.set(sp.x - Math.sin(y) * 30, 0, sp.z - Math.cos(y) * 30); C.MON.g.rotation.y = y; }
  } catch (e) {}
}
function difDesc() { const el = $('#o-dif-desc'); if (el) el.textContent = (RP().dificuldades || {})[$('#o-dif').value] || ''; }
function teclaTitulo(e) {
  if (!C || C.mode !== 'titulo' || $('#title').hidden || (document.activeElement && document.activeElement.tagName === 'INPUT')) return;
  const k = e.key && e.key.length === 1 ? e.key.toLowerCase() : '';
  if (!k) return;
  bufTitulo = (bufTitulo + k).slice(-12);
  const M = RP().memoria || {};
  if (bufTitulo.endsWith('silencio')) { bufTitulo = ''; const sg = segredos(); sg.umaVida = true; ls.set(SEGREDO_KEY, sg); C.iniciarAudio(); C.SFX.sinoLonge(); conquista('senha'); memoria(M.senha); $('#l-umavida').hidden = false; }
  if (bufTitulo.endsWith('1403')) { bufTitulo = ''; C.iniciarAudio(); C.SFX.papel(); conquista('quem_lembra'); memoria(M.data); }
}

// --- API pública
export const PG = {
  conquista,
  ligar(ctx) {
    C = ctx;
    const R = window.ROTEIRO;
    for (const x of RP().conquistas || []) if (!R.conquistas.some(y => y.id === x.id)) R.conquistas.push(x);
    addEventListener('keydown', e => {
      teclaTitulo(e);
      if (C.ui === 'morte' && (e.code === 'Enter' || e.code === 'KeyE' || e.code === 'NumpadEnter') && !$('#dt-retry').hidden && !$('#death').hidden) $('#dt-retry').click();
    });
    $('#o-dif').addEventListener('change', difDesc);
    const cr = ['#o-crono', '#p-crono'];
    for (const id of cr) { const el = $(id); if (!el) continue; el.checked = !!C.OPT.crono; el.onchange = () => { C.OPT.crono = el.checked; for (const o of cr) if ($(o)) $(o).checked = el.checked; C.salvarOpt(); }; }
    $('#b-caps').onclick = painelCapitulos;
    $('#b-conq').onclick = painelConquistas;
    if ($('#b-stats')) $('#b-stats').onclick = painelStats;
    if ($('#e-copiar')) $('#e-copiar').onclick = copiarResultado;
    // as nove badaladas tocam no primeiro clique às 21h (o áudio só existe depois de um gesto)
    $('#title').addEventListener('pointerdown', () => { if (horaTocou || new Date().getHours() !== 21) return; horaTocou = true; C.iniciarAudio(); C.SFX.badaladas(9); }, true);
    setInterval(() => { if (tempoPend > 5) { const t = tempoPend; tempoPend = 0; somaStat(s => { s.tempo = (s.tempo || 0) + t; }); } }, 10000);
  },
  // estado novo (também usado no título): contadores de capítulo e semente
  novo(st) {
    Object.assign(st, { capMortes: 0, capRuido: 0, capCorreu: 0, capLuzT: 0, capLore: 0, capGarrafas: 0, semObjT: 0, garrafasUsadas: 0, kitsUsados: 0, correu: 0, chamIgn: 0, chamResp: 0, procTipo: null, ranks: {}, mods: [], modo: {}, ajuda: 0 });
    semear(st, novaSemente());
    return st;
  },
  // "Novo jogo": código de desafio, amuletos e modos
  novoJogo(S) {
    const cod = lerCodigo($('#o-desafio') && $('#o-desafio').value);
    if (cod) { semear(S, cod.semente); S.dif = cod.dif; S.mods = cod.mods; $('#o-dif').value = cod.dif; }
    else S.mods = algumFinal() ? (C.OPT.mods || []).slice() : [];
    S.modo = { umaVida: !!($('#o-umavida') && $('#o-umavida').checked && !$('#l-umavida').hidden), crono: !!C.OPT.crono };
    S.completo = true; S.desafio = !!cod;
    seqMortes = 0;
    somaStat(s => { s.partidas = (s.partidas || 0) + 1; });
  },
  // dificuldade efetiva: base + amuletos + ajuda invisível
  dif(S, DIFS) {
    const base = DIFS[S && S.dif] || DIFS.normal;
    if (!S) return base;
    const aj = S.ajuda || 0, mods = S.mods || [], k = (S.dif || '') + aj + mods.join();
    if (PG._k === k && PG._v) return PG._v;
    const v = { ...base };
    if (mods.includes('pilha')) v.pilha *= 2;
    if (mods.includes('ouvido')) v.ouvido *= 1.4;
    if (mods.includes('passos')) v.vel *= 1.12;
    if (mods.includes('aviso')) v.aviso = Math.max(2, v.aviso - 3);
    if (aj) { v.vel *= 1 - aj; v.ouvido *= 1 - aj; v.aviso += aj >= .2 ? 3 : 2; }
    PG._k = k; PG._v = v; return v;
  },
  tick(dt) {
    const S = C.S, P = C.P, M = C.M;
    tempoPend += dt;
    S.capRuido = (S.capRuido || 0) + (P.noiseR || 0) * dt;
    if (P.sprinting && !S.flags.sino) { S.capCorreu = (S.capCorreu || 0) + dt; S.correu = (S.correu || 0) + dt; }
    if (S.flashOn) S.capLuzT = (S.capLuzT || 0) + dt;
    if (C.PROC.fase === 'passando' && S.hidden) S.procTipo = S.procTipo === 'armario' ? 'armario' : S.hidden.tipo === 'cama' ? 'cama' : 'armario';
    // Coração Frio: chegar a 2 m dele sem ser notada e sair inteira
    if (M.ativo && !S.dead) {
      const d = M.pos.distanceTo(P.pos);
      if (d < 2 && !S.hidden && M.state !== 'caca' && PG._perto == null) PG._perto = S.capDano;
      else if (PG._perto != null && (d > 5 || M.state === 'caca')) { if (M.state !== 'caca' && S.capDano === PG._perto) conquista('coracao_frio'); PG._perto = null; }
    } else PG._perto = null;
    // dica progressiva quando a jogadora trava
    S.semObjT = (S.semObjT || 0) + dt;
    if (S.dif !== 'pesadelo' && !S.modo?.umaVida) {
      const c = window.ROTEIRO.capitulos[S.chapter], obj = c && c.objetivos.find(o => !S.done[o.id]);
      const dica = obj && (capInfo(c.id).dicas || {})[obj.id];
      if (dica) {
        if (!C.dicaExterna && S.semObjT > 150 && !S.flags['dica1_' + obj.id]) { S.flags['dica1_' + obj.id] = true; C.sub('lia', dica.texto); }
        if (S.semObjT > 270 && dica.sala && !S.flags['dica2_' + obj.id]) { S.flags['dica2_' + obj.id] = true; S.dicaSala = dica.sala; C.toast('Você se lembrou de algo. Olhe o mapa do diário (TAB).'); }
      }
    }
    // cronômetro
    const el = $('#crono'), mostra = !C.OPT.cron && !!(C.OPT.crono || (S.modo && (S.modo.crono || S.modo.umaVida))); // com o cronômetro da interface ligado, só ele aparece
    if (el) { if (el.hidden === mostra) el.hidden = !mostra; if (mostra) { const t = `${fmtC(S.capT)}<small>total ${fmtC(S.tempo)}${S.modo && S.modo.umaVida ? ' · uma vida' : ''}</small>`; if (PG._crono !== t) { el.innerHTML = t; PG._crono = t; } } }
  },
  objetivo(id) {
    const S = C.S; if (!S) return;
    S.semObjT = 0; S.dicaSala = null;
    if (C.saveExterno) return; // o motor já salva depois de cada objetivo (agendarSave)
    if (SEM_SAVE.has(id)) return; // depois destes vem uma cena roteirizada (Ana, fita do cofre, fuga)
    const ch = S.chapter, sem = S.semente, feitos = Object.keys(S.done).length;
    // espera a cena do objetivo assentar; se houver perigo ou fita tocando, tenta de novo (até ~40 s)
    let tent = 0;
    const tentar = () => {
      const S2 = C.S; if (!S2 || S2.chapter !== ch || S2.semente !== sem || S2.dead || S2.fim) return;
      if (Object.keys(S2.done).length !== feitos) return; // outro objetivo assumiu o save
      const c = window.ROTEIRO.capitulos[S2.chapter];
      if (c.objetivos.every(o => S2.done[o.id])) return; // o capítulo está acabando: o save do próximo começa limpo
      if (!podeSalvar() || !$('#fita-ind').hidden) { if (++tent < 10) setTimeout(tentar, 4000); return; }
      C.salvarCheckpoint(); mostrarSalvo();
    };
    setTimeout(tentar, 6000);
  },
  salvando(inicioCap) { const S = C && C.S; if (!S) return; S.ajuda = 0; seqMortes = 0; if (inicioCap) mostrarSalvo(); },
  salaDica(r) { const S = C.S; return !!(S && S.dicaSala && r && r.id === S.dicaSala); },
  lore(id) {
    const S = C.S; if (!S) return;
    S.capLore = (S.capLore || 0) + 1;
    const ac = acervo(); if (!ac[id]) { ac[id] = true; ls.set(LORE_KEY, ac); }
    const R = window.ROTEIRO;
    if (Object.keys(ac).length >= R.notas.length + R.paginas.length + R.fitas.length) conquista('arqueologa');
  },
  garrafa() { const S = C.S; S.capGarrafas = (S.capGarrafas || 0) + 1; S.garrafasUsadas = (S.garrafasUsadas || 0) + 1; somaStat(s => { s.garrafas = (s.garrafas || 0) + 1; }); },
  kit() { const S = C.S; S.kitsUsados = (S.kitsUsados || 0) + 1; },
  dano(quem) { const S = C.S; S.flags['tocada_' + quem + '_' + S.chapter] = true; },
  chamado(entrou) {
    const S = C.S;
    if (!entrou) { S.chamIgn = (S.chamIgn || 0) + 1; if (S.chamIgn >= 3) conquista('regra_cinco'); return; }
    S.chamResp = (S.chamResp || 0) + 1;
    if (S.chamResp >= 3) { const sem = S.semente; setTimeout(() => { const S2 = C.S; if (S2 && S2.semente === sem && !S2.dead && C.mode === 'jogo') conquista('desobediente'); }, 20000); }
  },
  // rank / fim de capítulo
  rank() { return calcRank(C.S).letra; },
  fimCap(c) {
    const S = C.S, r = calcRank(S), { ant, novoDes } = registrarCap(S, c, r), info = capInfo(c.id);
    const R = window.ROTEIRO, P = RP();
    const el = $('#fc-rank'); el.textContent = r.letra; el.classList.remove('carimbo'); void el.offsetWidth; el.classList.add('carimbo');
    if ($('#fc-boletim')) $('#fc-boletim').textContent = (P.boletim || {})[r.letra] || '';
    if ($('#fc-selos')) $('#fc-selos').innerHTML = selosHTML(r.selos, r.meta);
    const ac = acervo(), lore = LORE_MAPA[c.mapa] || [], achou = lore.filter(id => S.notes[id] || S.fitas[id] || ac[id]).length;
    $('#fc-stats').innerHTML = `tempo ${fmt(S.capT)}${r.desconto > 1 ? ` (−${Math.round(r.desconto)}s por explorar)` : ''} · dano sofrido ${Math.round(S.capDano)} · perseguida ${S.capVisto}x · mortes ${S.capMortes || 0} · garrafas ${S.capGarrafas || 0}<br>você foi ${r.nivelRuido.toLowerCase()} (ruído médio ${r.ruido.toFixed(1)}) · lore deste mapa ${achou}/${lore.length} · notas, páginas e fitas ${C.loreAchado()}/${C.totalLore()}`;
    const linhas = [];
    if (ant.tempo && ant.tempo < 1e9) { const dif = S.capT - ant.tempo; linhas.push(dif < 0 ? `novo recorde: ${Math.round(-dif)}s mais rápida` : `+${Math.round(dif)}s do seu recorde (${fmt(ant.tempo)})`); }
    if (ant.rank) linhas.push(`melhor rank anterior: ${ant.rank}`);
    if (r.letra !== 'S' && r.falta.length) linhas.push(`para o S faltou: ${r.falta.join(' · ')}`);
    if (novoDes && info.desafio) linhas.push(`desafio secreto cumprido: <b class="ouro">${info.desafio.nome}</b> — ${info.desafio.desc}`);
    if (r.letra === 'S' && info.frase_s) linhas.push(`<i>“${info.frase_s}”</i>`);
    if ($('#fc-falta')) $('#fc-falta').innerHTML = linhas.join('<br>');
  },
  zerarCap() { const S = C.S; Object.assign(S, { capMortes: 0, capRuido: 0, capCorreu: 0, capLuzT: 0, capLore: 0, capGarrafas: 0, semObjT: 0, procTipo: null, dicaSala: null }); PG._perto = null; },
  // carregar checkpoint: a morte não apaga o cronômetro, o dano nem as perseguições do capítulo
  antesCarregar() {
    const S = C.S; if (!S) return null;
    const cap = {}; for (const k of ['capT', 'capDano', 'capVisto', 'capMortes', 'capRuido', 'capCorreu', 'capLuzT', 'capGarrafas']) cap[k] = S[k] || 0;
    const tot = {}; for (const k of ['garrafasUsadas', 'kitsUsados', 'correu', 'chamIgn', 'chamResp']) tot[k] = S[k] || 0;
    return { ch: S.chapter, sem: S.semente, dead: !!S.dead, cap, tot, flags: Object.keys(S.flags).filter(f => f.startsWith('tocada_')), ranks: { ...(S.ranks || {}) }, conq: (S.conqNoite || []).slice(), modo: S.modo, completo: S.completo, replay: S.replay };
  },
  depoisCarregar(info) {
    const S = C.S; if (!S.semente) S.semente = 'SEMCOD';
    if (!info || info.sem !== S.semente) return;
    for (const k in info.tot) S[k] = Math.max(S[k] || 0, info.tot[k]);
    S.ranks = { ...(S.ranks || {}), ...info.ranks }; S.conqNoite = info.conq; S.modo = info.modo || S.modo; S.completo = info.completo; S.replay = info.replay;
    if (info.ch !== S.chapter) return;
    for (const k in info.cap) S[k] = Math.max(S[k] || 0, info.cap[k]);
    for (const f of info.flags) S.flags[f] = true;
    if (info.dead) {
      S.capT += 15;
      const ajuda = S.dif === 'pesadelo' || (S.modo && S.modo.umaVida) ? 0 : seqMortes >= 3 ? .2 : seqMortes >= 2 ? .1 : 0;
      S.ajuda = C.ajudaExterna ? 0 : ajuda; // no jogo integrado a ajuda invisível fica em ajudaOculta() (jogo.js)
    }
  },
  // morte
  morte(quem) {
    const S = C.S, P = C.P, M = C.M;
    S.capMortes = (S.capMortes || 0) + 1; seqMortes++;
    const D = RP().diagnostico || {};
    let diag = '';
    if (quem === 'inspetor') {
      const longe = M.pos.distanceTo(P.pos);
      diag = S.flags.sino ? D.fuga : (performance.now() - (PG._escT || -1e9)) < 800 ? D.escondida : P.sprinting ? D.correndo : P.naAgua ? D.agua : P.crouch ? D.agachada : (P.noiseR || 0) < .1 ? D.parada : D.andando;
      if (longe < 30 && diag) diag += ` (ele estava a ${Math.max(1, Math.round(longe))} m)`;
    } else if (quem === 'ana') diag = !S.flashOn ? D.ana_escuro : D.ana_costas;
    else diag = (D.procissao || '').replace('{s}', Math.round(C.D().aviso));
    PG._diag = diag || '';
    const st = somaStat(s => { s.mortes = (s.mortes || 0) + 1; (s.causas = s.causas || {})[quem] = ((s.causas || {})[quem] || 0) + 1; });
    if ((st.mortes || 0) >= 10) conquista('teimosa');
    ls.set(ULTIMA_KEY, { tipo: 'morte', quem, cap: S.chapter, t: Date.now() });
    if (S.modo && S.modo.umaVida) { try { localStorage.removeItem(C.KEYS.SAVE_KEY); } catch (e) {} }
  },
  escondidaAntes() { PG._escT = performance.now(); },
  telaMorte() {
    const S = C.S, c = window.ROTEIRO.capitulos[S.chapter], faltam = c.objetivos.filter(o => !S.done[o.id]).length;
    const uv = !!(S.modo && S.modo.umaVida);
    $('#dt-retry').hidden = uv;
    if ($('#dt-diag')) $('#dt-diag').textContent = PG._diag || '';
    if ($('#dt-stats')) $('#dt-stats').innerHTML = uv
      ? `Modo Uma Vida: a noite acabou aqui. ${c.titulo} · ${fmtC(S.tempo)} de jogo.`
      : `morte nº ${S.capMortes || 1} neste capítulo · ${S.mortes} na noite · ${faltam ? `faltava${faltam > 1 ? 'm' : ''} ${faltam} objetivo${faltam > 1 ? 's' : ''}` : 'o capítulo estava quase no fim'} · +15s no cronômetro do capítulo<br><small>E ou ENTER para tentar de novo</small>`;
  },
  // pausa
  pausa() {
    const S = C.S, el = $('#p-info'); if (!el || !S) return;
    const am = (S.mods || []).map(id => ((RP().amuletos || []).find(a => a.id === id) || {}).nome).filter(Boolean);
    el.innerHTML = `${window.ROTEIRO.capitulos[S.chapter].titulo} · ${fmtC(S.capT)} neste capítulo · ${fmtC(S.tempo)} na noite · ${S.mortes} ${S.mortes === 1 ? 'morte' : 'mortes'}<br>${C.D().nome}${am.length ? ' · ' + am.join(', ') : ''}${S.modo && S.modo.umaVida ? ' · Uma Vida' : ''} · código de desafio ${codigoDesafio(S)}`;
  },
  // final
  loreFinal() {
    const S = C.S, ac = acervo(), tem = id => S.notes[id] || S.fitas[id] || ac[id];
    const fitas = FITAS_FINAL.filter(id => !tem(id)).length, pags = PAGINAS_FINAL.filter(id => !tem(id)).length;
    return { ok: !fitas && !pags, fitas, pags };
  },
  final(tipo) {
    const S = C.S, R = window.ROTEIRO, c = R.capitulos[S.chapter];
    if (c && !(S.ranks || {})[c.id]) registrarCap(S, c, calcRank(S)); // o Capítulo V não tem tela de fim: registra aqui
    const st = somaStat(s => { s.finais = s.finais || {}; s.finais[tipo] = (s.finais[tipo] || 0) + 1; if (S.completo) { s.concluidas = (s.concluidas || 0) + 1; if (!s.melhorTotal || S.tempo < s.melhorTotal) s.melhorTotal = S.tempo; } });
    if (['comum', 'silencio', 'verdadeiro'].every(f => st.finais[f])) conquista('tres_finais');
    if (S.completo) {
      if (!S.garrafasUsadas) conquista('sem_garrafa');
      if (!S.kitsUsados) conquista('sem_curativo');
      if (!S.mortes) conquista('sem_morrer');
      if (S.tempo < 3600) conquista('menos_hora');
      if (S.modo && S.modo.umaVida) conquista('uma_vida');
    }
    ls.set(ULTIMA_KEY, { tipo: 'final', final: tipo, t: Date.now(), tempo: S.tempo });
    PG._tipoFinal = tipo;
  },
  telaFinal(tipo) {
    const S = C.S, R = window.ROTEIRO, st = stats();
    const ranks = R.capitulos.map((c, i) => `${['P', 'I', 'II', 'III', 'IV', 'V'][i]} ${(S.ranks || {})[c.id] || '–'}`).join(' · ');
    const nf = Object.keys(st.finais || {}).length, conqs = (S.conqNoite || []).length;
    const lf = PG.loreFinal();
    let extra = `<br>ranks: ${ranks}<br>finais vistos ${nf}/3 · conquistas nesta noite ${conqs} · código de desafio ${codigoDesafio(S)}`;
    if (false && tipo === 'comum' && !lf.ok) extra += // o fim verdadeiro depende das atitudes (src/historia.js), não de coleta `<br>para a outra escolha no portão faltaram ${[lf.fitas ? `${lf.fitas} fita${lf.fitas > 1 ? 's' : ''}` : '', lf.pags ? `${lf.pags} página${lf.pags > 1 ? 's' : ''} do Davi` : ''].filter(Boolean).join(' e ')} (use o menu Capítulos para voltar e procurar)`;
    $('#e-stats').innerHTML += extra;
    if (S.completo && S.tempo < 3600) $('#e-txt').textContent += '\n\nA Hora durou menos que uma hora.';
  }
};

function copiarResultado() {
  const S = C.S; if (!S) return;
  const R = window.ROTEIRO, F = R.finais[PG._tipoFinal] || {};
  const ranks = R.capitulos.map(c => (S.ranks || {})[c.id] || '–').join(' ');
  const txt = `A Hora do Silêncio · ${C.D().nome} · desafio ${codigoDesafio(S)} · ${fmtC(S.tempo)} · ranks ${ranks} · mortes ${S.mortes} · ${C.loreAchado()}/${C.totalLore()} lore · ${(F.titulo || '').replace('FINAL: ', '').toLowerCase()}\n${location.href.split('#')[0]}`;
  const ok = () => { const b = $('#e-copiar'); b.textContent = 'Copiado!'; setTimeout(() => b.textContent = 'Copiar resultado', 1800); };
  try { navigator.clipboard.writeText(txt).then(ok, () => fallback()); } catch (e) { fallback(); }
  function fallback() { const t = document.createElement('textarea'); t.value = txt; document.body.appendChild(t); t.select(); try { document.execCommand('copy'); ok(); } catch (e) {} t.remove(); }
}
PG.titulo = titulo;
PG.falaAbertura = () => {
  const ult = ls.get(ULTIMA_KEY, null), RL = RP().radio_lembra || {};
  if (!ult) return null;
  const texto = ult.tipo === 'morte' ? RL.morte : RL[ult.final];
  return texto ? { t: 29, quem: 'radio', texto } : null;
};
PG.semear = semear; PG.lerCodigo = lerCodigo; PG.codigo = s => codigoDesafio(s);
