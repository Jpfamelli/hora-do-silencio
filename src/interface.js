// INTERFACE — opções, acessibilidade, legendas de som, anel de ruído, tela de morte que ensina,
// dicas da Lia, cronômetro, pistas e histórico no diário, segredos do título.
// O motor (jogo.js) chama criarInterface(ctx) uma vez e usa os ganchos devolvidos.
import { criarMundo } from './interface-mundo.js';
export function criarInterface(C) {
  let MU = null; // mundo e história (lote 2): src/interface-mundo.js
  const $ = s => document.querySelector(s);
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const pick = arr => arr[Math.random() * arr.length | 0];
  const OPT = C.OPT, R = C.R;
  const PAD = { brilho: 1.1, fov: 72, invY: false, agachar: 'alternar', leg: 'M', legFundo: 'nenhum', contraste: false, legTempo: 'normal', legSom: 'importantes', ruido: 'auto', mira: 'ponto', miraTam: 'M', textoSimples: false, vFlash: 0, cron: false, hudMin: false, dicas: true, calibrado: false, velorio: false, velorioLib: false, letraNotas: 'manuscrita', descCena: false, placaSala: 'historia', leitura: true, olhoAna: true, somSimb: true };
  for (const k in PAD) if (OPT[k] === undefined) OPT[k] = PAD[k];
  if (OPT.agachar === 0 || OPT.agachar === 1) OPT.agachar = OPT.agachar ? 'segurar' : 'alternar'; // valor antigo (0/1) das opções de controle
  let agora = 0;
  const rel = () => performance.now() / 1000;
  const mmss = s => `${Math.floor(s / 60)}min ${String(Math.floor(s % 60)).padStart(2, '0')}s`;
  const relogio = s => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(Math.floor(s % 60)).padStart(2, '0')}.${String(Math.floor(s * 100 % 100)).padStart(2, '0')}`;

  // Conquistas secretas (aparecem como ??? até serem achadas)
  for (const c of [
    { id: 'segredo_velorio', nome: 'Velório', desc: 'Escreva a palavra proibida na tela de título.', segredo: true },
    { id: 'segredo_davi', nome: 'Irmã Mais Velha', desc: 'Chame seu irmão pelo nome na tela de título.', segredo: true },
    { id: 'segredo_estatua', nome: 'Estátua', desc: 'Fique imóvel por 20 segundos com o Inspetor a menos de 6 metros, fora do esconderijo.', segredo: true },
    { id: 'segredo_nove', nome: 'Nove Vezes', desc: 'Faça o sino bater nove vezes antes de começar.', segredo: true }
  ]) if (!R.conquistas.some(x => x.id === c.id)) R.conquistas.push(c);

  // ---------------------------------------------------------------- OPÇÕES
  const SIMNAO = [[false, 'Não'], [true, 'Sim']];
  const GRUPOS = [
    ['Imagem', [
      { k: 'brilho', nome: 'Brilho', tipo: 'range', min: .6, max: 1.6, step: .05 },
      { k: 'fov', nome: 'Campo de visão', tipo: 'range', min: 60, max: 90, step: 1 },
      { k: 'vFlash', nome: 'Reduzir flashes (relâmpago, golpes, lâmpadas)', tipo: 'sel', ops: [[0, 'Não'], [1, 'Sim']] },
      { k: 'velorio', nome: 'Modo Velório', tipo: 'sel', ops: SIMNAO, se: () => OPT.velorioLib }
    ]],
    ['Som', [
      { k: 'vol', nome: 'Volume', tipo: 'range', min: 0, max: 1, step: .05, motor: true }
    ]],
    ['Legendas', [
      { k: 'leg', nome: 'Tamanho do texto', tipo: 'sel', ops: [['P', 'Pequeno'], ['M', 'Médio'], ['G', 'Grande'], ['GG', 'Enorme']] },
      { k: 'legFundo', nome: 'Fundo da legenda', tipo: 'sel', ops: [['nenhum', 'Nenhum'], ['meio', 'Meio escuro'], ['solido', 'Sólido']] },
      { k: 'contraste', nome: 'Cores de alto contraste', tipo: 'sel', ops: SIMNAO },
      { k: 'legTempo', nome: 'Tempo de leitura', tipo: 'sel', ops: [['normal', 'Normal'], ['longo', 'Longo']] },
      { k: 'legSom', nome: 'Legendar sons', tipo: 'sel', ops: [['nao', 'Desligado'], ['importantes', 'Importantes'], ['todos', 'Todos']] },
      { k: 'somSimb', nome: 'Símbolo nos sons (▲ perigo, ✦ história)', tipo: 'sel', ops: SIMNAO },
      { k: 'descCena', nome: 'Descrição de cena ao entrar numa sala', tipo: 'sel', ops: SIMNAO }
    ]],
    ['Controles', [
      { k: 'sens', nome: 'Sensibilidade do mouse', tipo: 'range', min: .4, max: 2.5, step: .1, motor: true },
      { k: 'invY', nome: 'Inverter mouse vertical', tipo: 'sel', ops: SIMNAO },
      { k: 'agachar', nome: 'Agachar (C)', tipo: 'sel', ops: [['alternar', 'Apertar alterna'], ['segurar', 'Segurar']] }
    ]],
    ['Interface', [
      { k: 'ruido', nome: 'Anel do seu barulho', tipo: 'sel', ops: [['auto', 'Automático (sem no Pesadelo)'], ['sim', 'Sempre'], ['nao', 'Nunca']] },
      { k: 'mira', nome: 'Mira', tipo: 'sel', ops: [['ponto', 'Ponto'], ['cruz', 'Cruz'], ['anel', 'Anel']] },
      { k: 'miraTam', nome: 'Tamanho da mira', tipo: 'sel', ops: [['P', 'Pequena'], ['M', 'Média'], ['G', 'Grande']] },
      { k: 'dicas', nome: 'Dicas da Lia quando travar', tipo: 'sel', ops: [[true, 'Ligadas'], [false, 'Desligadas']] },
      { k: 'hudMin', nome: 'HUD mínimo (O mostra o objetivo)', tipo: 'sel', ops: SIMNAO },
      { k: 'cron', nome: 'Cronômetro com parciais', tipo: 'sel', ops: SIMNAO },
      { k: 'textoSimples', nome: 'Notas em texto simples', tipo: 'sel', ops: SIMNAO },
      { k: 'letraNotas', nome: 'Letra das notas', tipo: 'sel', ops: [['manuscrita', 'Manuscrita'], ['legivel', 'Legível']] },
      { k: 'placaSala', nome: 'Placa das salas', tipo: 'sel', ops: [['historia', 'Nome e 1979'], ['nome', 'Só o nome'], ['nao', 'Desligada']] },
      { k: 'leitura', nome: 'Ler placas e paredes de perto', tipo: 'sel', ops: [[true, 'Sim'], [false, 'Não']] },
      { k: 'olhoAna', nome: 'Olho da Menina ao lado da mira', tipo: 'sel', ops: [[true, 'Sim'], [false, 'Não']] }
    ]]
  ];
  function setar(k, v, motor) {
    if (motor) C.setOpt(k, v); else { OPT[k] = v; C.salvarOpt(); }
    aplicar();
  }
  function aplicar() {
    C.camera.fov = +OPT.fov || 72; C.camera.updateProjectionMatrix();
    C.renderer.toneMappingExposure = +OPT.brilho || 1.1;
    const b = document.body.classList;
    for (const c of [...b]) if (/^(leg|lf|mira|mt)-/.test(c)) b.remove(c);
    b.add('leg-' + OPT.leg, 'lf-' + OPT.legFundo, 'mira-' + OPT.mira, 'mt-' + OPT.miraTam);
    b.toggle('contraste', !!OPT.contraste); b.toggle('texto-simples', !!OPT.textoSimples); b.toggle('letra-legivel', OPT.letraNotas === 'legivel');
    b.toggle('sem-flash', !!OPT.vFlash); b.toggle('velorio', !!(OPT.velorio && OPT.velorioLib));
    $('#fx-velorio').hidden = !(OPT.velorio && OPT.velorioLib);
  }
  let opcVolta = null;
  function abrirOpcoes(de) {
    opcVolta = de; $(de).hidden = true;
    const box = $('#op-grupos'); let h = '';
    for (const [g, itens] of GRUPOS) {
      const vis = itens.filter(i => !i.se || i.se()); if (!vis.length) continue;
      h += `<h3>${g}</h3>`;
      for (const i of vis) {
        const v = OPT[i.k];
        h += `<label class="op"><span>${i.nome}</span>`;
        if (i.tipo === 'range') h += `<input type="range" data-k="${i.k}" min="${i.min}" max="${i.max}" step="${i.step}" value="${v}"><em>${(+v).toFixed(i.step < 1 ? 2 : 0)}</em>`;
        else h += `<select data-k="${i.k}">${i.ops.map(([a, b]) => `<option value="${a}"${String(a) === String(v) ? ' selected' : ''}>${b}</option>`).join('')}</select>`;
        h += '</label>';
      }
    }
    box.innerHTML = h;
    box.querySelectorAll('[data-k]').forEach(el => {
      const def = GRUPOS.flatMap(g => g[1]).find(i => i.k === el.dataset.k);
      el.oninput = el.onchange = () => {
        let v = el.value; if (def.tipo === 'range' || /^-?\d+(\.\d+)?$/.test(v)) v = +v; else if (v === 'true' || v === 'false') v = v === 'true';
        setar(def.k, v, def.motor);
        if (def.tipo === 'range') el.nextElementSibling.textContent = (+v).toFixed(def.step < 1 ? 2 : 0);
      };
    });
    $('#opcoes').hidden = false; focar('#opcoes');
  }
  function fecharOpcoes() { $('#opcoes').hidden = true; if (opcVolta) $(opcVolta).hidden = false; focar(opcVolta); opcVolta = null; }
  $('#op-voltar').onclick = fecharOpcoes;
  $('#op-brilho').onclick = () => { $('#opcoes').hidden = true; calibrar(() => { $('#opcoes').hidden = false; }); };
  $('#op-padrao').onclick = () => { for (const k in PAD) if (!/calibrado|velorioLib/.test(k)) OPT[k] = PAD[k]; C.salvarOpt(); aplicar(); const v = opcVolta; $('#opcoes').hidden = true; $(v).hidden = true; abrirOpcoes(v); };

  // Calibração de brilho
  function calibrar(cb) {
    const el = $('#brilho'), r = $('#br-range');
    r.value = OPT.brilho; el.style.setProperty('--b', OPT.brilho);
    r.oninput = () => { OPT.brilho = +r.value; el.style.setProperty('--b', r.value); aplicar(); };
    $('#br-ok').onclick = () => { if (el.hidden) return; OPT.calibrado = true; C.salvarOpt(); el.hidden = true; cb && cb(); };
    el.hidden = false; focar('#brilho');
  }
  // Confirmação genérica
  function confirmar(texto, sim, simTxt = 'Sim', naoTxt = 'Não') {
    const el = $('#confirma'), volta = [...document.querySelectorAll('.screen')].filter(s => !s.hidden && s !== el);
    $('#cf-txt').textContent = texto; $('#cf-sim').textContent = simTxt; $('#cf-nao').textContent = naoTxt;
    volta.forEach(s => s.hidden = true);
    const fim = ok => { if (el.hidden) return; el.hidden = true; if (ok) sim(); else { volta.forEach(s => s.hidden = false); focar(); } };
    $('#cf-sim').onclick = () => fim(true); $('#cf-nao').onclick = () => fim(false);
    el.hidden = false; focar('#confirma');
  }
  function antesDeNovoJogo(cb) {
    if (window.__teste) return cb();
    const seguir = () => OPT.calibrado ? cb() : calibrar(cb);
    const sv = C.lsGet(C.SAVE_KEY, null);
    if (sv && sv.chapter > 0) confirmar(`Começar do zero apaga o progresso salvo (${R.capitulos[sv.chapter].titulo}). Os capítulos já liberados continuam no menu Capítulos.`, () => { $('#title').hidden = true; seguir(); }, 'Começar do zero', 'Voltar');
    else { $('#title').hidden = true; seguir(); }
  }

  // ---------------------------------------------------------------- NAVEGAÇÃO POR TECLADO
  const TELAS = ['#confirma', '#brilho', '#opcoes', '#painel', '#keypad', '#pause', '#death', '#escolha', '#ending', '#title'];
  const telaAtiva = () => TELAS.map(s => $(s)).find(el => el && !el.hidden);
  const focaveis = el => [...el.querySelectorAll('button.btn, select, input[type=range]')].filter(b => !b.disabled && !b.hidden && b.offsetParent !== null && !b.closest('[hidden]'));
  function focar(sel) { setTimeout(() => { const el = sel ? $(sel) : telaAtiva(); if (!el || el.hidden) return; const f = focaveis(el); if (f.length && !el.contains(document.activeElement)) f[0].focus({ preventScroll: false }); }, 30); }
  function navegar(e) {
    const tela = telaAtiva(); if (!tela) return false;
    const f = focaveis(tela); if (!f.length) return false;
    const i = f.indexOf(document.activeElement), el = document.activeElement;
    if (e.code === 'ArrowDown' || (e.code === 'Tab' && !e.shiftKey)) { f[(i + 1) % f.length].focus(); return true; }
    if (e.code === 'ArrowUp' || (e.code === 'Tab' && e.shiftKey)) { f[(i - 1 + f.length) % f.length].focus(); return true; }
    if (el && el.tagName === 'SELECT' && (e.code === 'ArrowLeft' || e.code === 'ArrowRight')) {
      el.selectedIndex = clamp(el.selectedIndex + (e.code === 'ArrowRight' ? 1 : -1), 0, el.options.length - 1); el.dispatchEvent(new Event('change')); return true;
    }
    return false;
  }

  // ---------------------------------------------------------------- LEGENDAS DE SOM
  const SONS = {
    passoMonstro: { t: 'passos pesados', imp: 1, cd: 2.6, pos: a => a[0], insp: true },
    estalo: { t: 'estalos de língua', imp: 0, cd: 5, pos: a => a[0], insp: true },
    vidro: { t: 'vidro estilhaçando', imp: 1, cd: 1, pos: a => a[0] !== undefined ? { x: a[0], z: a[1] } : null },
    pancada: { t: 'uma porta bate com força', imp: 1, cd: 1.5, pos: a => ({ x: a[0], z: a[1] }) },
    risada: { t: 'risada de menina', imp: 1, cd: 2, pos: a => ({ x: a[0], z: a[1] }) },
    contagem: { t: 'uma menina conta baixinho', imp: 1, cd: 3.2, pos: a => a[0] },
    chamadoVoz: { t: 'alguém chama seu nome', imp: 1, cd: 2, pos: a => ({ x: a[0], z: a[1] }) },
    sino: { t: 'o sino bate', imp: 1, cd: 1.8 },
    sinoLonge: { t: 'um sino ao longe', imp: 0, cd: 3 },
    badaladas: { t: 'o sino da capela começa a bater, nove vezes', imp: 1, cd: 10 },
    estatica: { t: 'o rádio chia', imp: 1, cd: 3 },
    canto: { t: 'crianças cantando baixo', imp: 1, cd: 4 },
    procissao: { t: 'dezenas de pés descalços', imp: 1, cd: 3 },
    sussurros: { t: 'sussurros', imp: 1, cd: 4 },
    orelhao: { t: 'um telefone toca', imp: 1, cd: 4, pos: a => a[0] },
    trovao: { t: 'trovão', imp: 0, cd: 4 },
    coracao: { t: 'seu coração dispara', imp: 0, cd: 6 },
    ofego: { t: 'você ofega', imp: 0, cd: 3 },
    rangido: { t: 'madeira rangendo', imp: 0, cd: 4, pos: a => ({ x: a[0], z: a[2] }) },
    cano: { t: 'canos batendo', imp: 0, cd: 3, pos: a => a[0] }
  };
  const cdSom = {}, linhasSom = [];
  function direcao(pos) {
    const P = C.P, dx = pos.x - P.pos.x, dz = pos.z - P.pos.z, d = Math.hypot(dx, dz);
    const sy = Math.sin(P.yaw), cy = Math.cos(P.yaw);
    const fw = -dx * sy - dz * cy, rt = dx * cy - dz * sy, a = Math.atan2(rt, fw) * 180 / Math.PI;
    const lado = Math.abs(a) < 35 ? 'à frente' : Math.abs(a) > 140 ? 'atrás de você' : a > 0 ? 'à direita' : 'à esquerda';
    let longe = d < 2.5 ? 'muito perto' : d < 7 ? 'perto' : d > 18 ? 'longe' : '';
    let sala = '';
    try { const r = C.roomAt(pos.x, pos.z); if (r && P.room && r !== P.room && d > 2.5 && !r.fora && !P.room.fora) sala = C.salaAdj(r, P.room) ? 'na sala ao lado' : 'do outro lado das paredes'; } catch (e) {}
    return { d, a, txt: [lado, longe, sala].filter(Boolean).join(', ') };
  }
  function som(k, a) {
    const def = SONS[k]; if (!def || C.mode === 'titulo' || OPT.legSom === 'nao') return;
    if (!def.imp && OPT.legSom !== 'todos') return;
    if (k === 'gerador' && !a[0]) return;
    if ((cdSom[k] || -99) > agora - def.cd) return; cdSom[k] = agora;
    let txt = def.t;
    const pos = def.pos ? def.pos(a) : null;
    if (pos && C.P.pos) {
      const dr = direcao(pos); if (dr.d > 40) return;
      txt += ' ' + dr.txt;
      if (def.insp) seta(dr);
    }
    const simb = OPT.somSimb && def.cat ? (def.cat === 'p' ? '▲ ' : '✦ ') : '';
    linhasSom.push({ txt: `${simb}[${txt}]`, cat: def.cat, t: agora + 2.8 }); while (linhasSom.length > 3) linhasSom.shift();
    desenharSom();
    if (def.imp) historico('som', simb + txt);
  }
  SONS.gerador = { t: 'o gerador ronca alto', imp: 1, cd: 8, cat: 'p' };
  SONS.caixinha = { t: 'uma caixinha de música toca', imp: 1, cd: 6, cat: 'h' };
  SONS.grito = { t: 'um grito', imp: 1, cd: 3, cat: 'p' };
  SONS.arrastar = { t: 'algo pesado sendo arrastado', imp: 0, cd: 4, cat: 'p' };
  SONS.fitaClique = { t: 'o gravador estala', imp: 0, cd: 3, cat: 'h' };
  for (const [k, c] of Object.entries({ passoMonstro: 'p', estalo: 'p', vidro: 'p', pancada: 'p', risada: 'p', contagem: 'p', chamadoVoz: 'p', sino: 'h', sinoLonge: 'h', badaladas: 'p', estatica: 'p', canto: 'h', procissao: 'p', sussurros: 'h', orelhao: 'h' })) SONS[k].cat = c;
  som.def = SONS; // outros módulos (src/audio-mundo.js) registram legendas aqui
  let somHtml = '', legBase = '';
  function desenharSom() {
    for (let i = linhasSom.length - 1; i >= 0; i--) if (linhasSom[i].t < agora) linhasSom.splice(i, 1);
    const h = linhasSom.map(l => `<div class="${l.cat === 'p' ? 'perigo' : l.cat === 'h' ? 'historia' : ''}">${l.txt}</div>`).join('');
    if (h !== somHtml) { $('#legsom').innerHTML = h; somHtml = h; }
    // revisão do lote 2: com legenda de duas linhas, a legenda de som subia por cima do nome de quem fala
    if (somHtml) { const sb = $('#sub'), hs = sb && sb.textContent.trim() ? sb.offsetHeight : 0, b = hs ? `calc(12% + ${hs + 10}px)` : ''; if (b !== legBase) { $('#legsom').style.bottom = b; legBase = b; } }
  }
  // Arco na borda indicando de onde veio o passo do Inspetor (Fácil/Normal, parada ou agachada)
  let setaT = 0;
  function seta(dr) {
    const S = C.S; if (!S || S.dif === 'pesadelo' || !mostrarRuido()) return;
    if (!(C.P.crouch || S.hidden || C.P.noiseR === 0) || dr.d > 20) return;
    const el = $('#somdir'); el.style.transform = `rotate(${dr.a}deg)`; el.style.setProperty('--o', clamp(1.2 - dr.d / 20, .25, 1)); setaT = 1.1; el.hidden = false;
  }

  // ---------------------------------------------------------------- ANEL DE RUÍDO
  const mostrarRuido = () => OPT.ruido === 'sim' || (OPT.ruido === 'auto' && C.S && C.S.dif !== 'pesadelo');
  let anelR = 0, pulso = 0;
  function ruido(x, z, r) { const P = C.P; if (P.pos && Math.hypot(x - P.pos.x, z - P.pos.z) < 1.6) pulso = Math.max(pulso, r); }
  function anel(dt) {
    const el = $('#ruido'), S = C.S, P = C.P, M = C.M;
    if (!S || C.mode !== 'jogo' || C.ui || S.dead || !mostrarRuido()) { el.hidden = true; return; }
    let alvoR = P.noiseR, respira = false;
    if (S.hidden) { const perto = M.ativo && M.pos.distanceTo(P.pos) < 5.5; respira = perto && !C.keys.Space; alvoR = respira ? 2.3 : 0; }
    pulso = Math.max(0, pulso - dt * 14);
    anelR = lerp(anelR, Math.max(alvoR, pulso), Math.min(1, dt * 10));
    if (anelR < .25) { el.hidden = true; return; }
    el.hidden = false;
    const px = Math.min(96, 7 + anelR / 20 * 70);
    el.style.width = el.style.height = (px * 2) + 'px'; el.style.margin = (-px) + 'px 0 0 ' + (-px) + 'px';
    let perigo = false;
    if (M.ativo) {
      const d = M.pos.distanceTo(P.pos); let att = .45;
      try { att = C.salaAdj(C.roomAt(M.pos.x, M.pos.z), P.room) ? 1 : .45; } catch (e) {}
      perigo = (S.hidden ? (respira && d < 2.6) || M.achou : anelR * att * C.D().ouvido * (M.state === 'caca' ? 1.6 : 1) > d);
    }
    el.classList.toggle('perigo', perigo); el.classList.toggle('corre', !!P.sprinting); el.classList.toggle('respira', respira);
  }

  // ---------------------------------------------------------------- MORTE QUE ENSINA
  const rastro = []; let rastroT = 0, ultCorrida = -99, ultAgua = -99, ultSemFolego = -99, escondidaAntes = false, entrouPerto = false, motivoCaca = null, estadoAnt = null, hiddenAnt = null, ultSaveTempo = 0, mortesCap = {}, mortesCausa = {}, morteT = -99, causa = null, Sref = null;
  const CAUSA_DICA = {
    correu: ['Correr faz muito barulho. Com ele por perto, ande ou agache (C).', 'O anel em volta da mira mostra até onde vai o seu barulho. Correndo, ele vai longe.'],
    andou: ['Até andando ele escuta. Agachada (C), seus passos quase somem.', 'Pare quando ouvir os estalos perto. Parada, você não faz barulho nenhum.'],
    agua: ['Na água, cada passo ecoa o dobro. Atravesse agachada e só quando ele estiver longe.'],
    escondida: ['No esconderijo, segure ESPAÇO quando ele chegar perto. Ele ouve sua respiração.'],
    entrouPerto: ['Entrar no armário com ele a poucos metros faz barulho. Esconda-se antes de ele chegar, ou jogue uma garrafa (G) primeiro.'],
    folego: ['O fôlego acabou e você puxou o ar alto. Solte ESPAÇO assim que ele se afastar para recuperar.'],
    perto: ['Ele estala a língua para se localizar. Siga o som: se os estalos ficarem altos, pare ou se esconda.', 'Quando ele estiver perto e parado, não se mexa. Ele vai embora.'],
    ana_escuro: ['Sem luz, ela anda. Mantenha a lanterna acesa e apontada para ela.'],
    ana_pisca: ['Com a pilha fraca, a lanterna pisca, e cada piscada é um passo dela. Troque a pilha (R).'],
    ana_costas: ['Ela só anda quando você não está olhando. Ande de costas, com a luz nela.', 'Feche uma porta entre vocês. Ela não abre portas.'],
    proc: ['Quando as luzes piscarem e o rádio chiar, você tem poucos segundos. Procure um armário ou uma cama antes.', 'Decore onde ficam os armários de cada corredor. Na Procissão não dá tempo de procurar.']
  };
  const DICA_LUGAR = [
    'Na estrada, o vulto não persegue. Siga em frente sem parar.',
    'O gerador ronca e atrai o Inspetor. Antes de ligar, jogue uma garrafa para o outro lado do corredor, ou ligue e corra para um armário perto.',
    'Durante a Procissão, fique perto de um armário enquanto explora. O código do quadro fica salvo no diário (aba Pistas).',
    'A Menina conta até dez. Ilumine e ande de costas até a sala de brinquedos. Uma porta fechada entre vocês também te salva.',
    'Nos túneis, a água faz barulho. Gire as válvulas quando ele estiver longe: cada uma faz barulho por alguns segundos.',
    'Depois do sino, não pare. Ele está mais rápido e não desiste. Siga direto para o portão dos fundos.'
  ];
  function golpe(quem) {
    const S = C.S, P = C.P, M = C.M;
    const d = quem === 'inspetor' ? M.pos.distanceTo(P.pos) : quem === 'ana' ? C.ANA.pos.distanceTo(P.pos) : C.PROC.pos.distanceTo(P.pos);
    let k, txt;
    if (quem === 'inspetor') {
      if (escondidaAntes) {
        if (entrouPerto) { k = 'entrouPerto'; txt = 'Você entrou no esconderijo com ele a poucos metros. Ele ouviu a porta.'; }
        else if (agora - ultSemFolego < 6) { k = 'folego'; txt = 'O fôlego acabou dentro do esconderijo e você puxou o ar alto demais.'; }
        else { k = 'escondida'; txt = 'Ele ouviu sua respiração do lado de fora do esconderijo.'; }
      } else if (agora - ultCorrida < 4) { k = 'correu'; txt = `Ele ouviu você correr${motivoCaca ? ` a ${Math.round(motivoCaca.d)} metros` : ''}.`; }
      else if (agora - ultAgua < 4) { k = 'agua'; txt = 'Seus passos na água chegaram até ele.'; }
      else if (motivoCaca && motivoCaca.ruido > 0) { k = 'andou'; txt = `Ele ouviu seus passos a ${Math.round(motivoCaca.d)} metros.`; }
      else { k = 'perto'; txt = 'Ele chegou perto demais no escuro.'; }
      if (S.inv.garrafas > 0) txt += ` Você tinha ${S.inv.garrafas} garrafa${S.inv.garrafas > 1 ? 's' : ''} para distrair ele (G).`;
      if (S.inv.kits > 0 && S.health < 70) txt += ` E ${S.inv.kits} curativo${S.inv.kits > 1 ? 's' : ''} sem usar (H).`;
    } else if (quem === 'ana') {
      if (!S.flashOn) { k = 'ana_escuro'; txt = 'Você estava no escuro. Sem luz, ela anda.'; }
      else if (S.battery < 18) { k = 'ana_pisca'; txt = 'A pilha fraca fez a lanterna piscar, e ela andou.'; }
      else { k = 'ana_costas'; txt = 'Você tirou os olhos dela.'; }
    } else { k = 'proc'; txt = `Você estava fora de um esconderijo quando eles passaram. O aviso dura ${C.D().aviso} segundos.`; }
    causa = { quem, k, txt, d };
  }
  function morte(quem) {
    const S = C.S;
    if (!causa || causa.quem !== quem) golpe(quem);
    const cap = S.chapter;
    mortesCap[cap] = (mortesCap[cap] || 0) + 1;
    const chave = cap + ':' + causa.k; mortesCausa[chave] = (mortesCausa[chave] || 0) + 1;
    $('#death-causa').textContent = causa.txt;
    let dica = pick(CAUSA_DICA[causa.k] || R.dicas_morte[quem] || R.dicas_morte.inspetor);
    if (mortesCausa[chave] >= 2 && DICA_LUGAR[cap]) dica = DICA_LUGAR[cap];
    $('#death-dica').textContent = dica;
    const n = mortesCap[cap], perdido = Math.max(0, S.tempo - ultSaveTempo);
    $('#death-info').textContent = `${n === 1 ? 'Primeira morte' : n + 'ª morte'} neste capítulo · você volta ao ponto salvo há ${perdido < 60 ? Math.round(perdido) + 's' : mmss(perdido)}`;
    $('#dt-leve').hidden = !(n >= 3 && S.dif !== 'pesadelo' && S.flags.alivio !== cap);
    desenharMapaMorte(quem);
    morteT = rel(); focar('#death');
    causa = null;
  }
  function aliviar() {
    const cap = C.S.chapter; C.retry();
    C.S.flags.alivio = cap; C.toast('Este trecho ficou um pouco mais leve: ele anda e ouve 10% menos até o fim do capítulo.');
  }
  $('#dt-leve').onclick = aliviar;
  function desenharMapaMorte(quem) {
    const cv = $('#death-mapa'), g = cv.getContext('2d'), W = C.W;
    g.clearRect(0, 0, cv.width, cv.height);
    if (!rastro.length || !W.salas.length) { cv.hidden = true; return; }
    cv.hidden = false;
    const xs = [], zs = [];
    for (const r of rastro) { xs.push(r.px); zs.push(r.pz); if (r.mx !== null) { xs.push(r.mx); zs.push(r.mz); } }
    let x0 = Math.min(...xs) - 6, x1 = Math.max(...xs) + 6, z0 = Math.min(...zs) - 6, z1 = Math.max(...zs) + 6;
    const k = Math.min((cv.width - 16) / (x1 - x0), (cv.height - 16) / (z1 - z0));
    const ox = (cv.width - (x1 - x0) * k) / 2, oz = (cv.height - (z1 - z0) * k) / 2;
    const sx = x => ox + (x - x0) * k, sz = z => oz + (z1 - z) * k;
    g.lineWidth = 1;
    for (const r of W.salas) {
      if (r.x1 < x0 || r.x0 > x1 || r.z1 < z0 || r.z0 > z1) continue;
      g.fillStyle = r === C.P.room ? '#1f1410' : '#0e0c0a'; g.strokeStyle = '#3a3228';
      g.fillRect(sx(r.x0), sz(r.z1), (r.x1 - r.x0) * k, (r.z1 - r.z0) * k); g.strokeRect(sx(r.x0), sz(r.z1), (r.x1 - r.x0) * k, (r.z1 - r.z0) * k);
    }
    const linha = (pts, cor, tracejado) => { if (pts.length < 2) return; g.strokeStyle = cor; g.lineWidth = 2; g.setLineDash(tracejado ? [3, 4] : []); g.beginPath(); pts.forEach(([x, z], i) => i ? g.lineTo(sx(x), sz(z)) : g.moveTo(sx(x), sz(z))); g.stroke(); g.setLineDash([]); };
    linha(rastro.map(r => [r.px, r.pz]), '#cfc3a6', true);
    linha(rastro.filter(r => r.mx !== null).map(r => [r.mx, r.mz]), '#c0392b');
    const u = rastro[rastro.length - 1];
    if (u.ruido > 0) { g.strokeStyle = 'rgba(207,195,166,.35)'; g.beginPath(); g.arc(sx(u.px), sz(u.pz), Math.min(u.ruido, 20) * k, 0, Math.PI * 2); g.stroke(); }
    g.strokeStyle = '#c0392b'; g.lineWidth = 3; const X = sx(u.px), Z = sz(u.pz);
    g.beginPath(); g.moveTo(X - 6, Z - 6); g.lineTo(X + 6, Z + 6); g.moveTo(X + 6, Z - 6); g.lineTo(X - 6, Z + 6); g.stroke();
    g.fillStyle = '#857a63'; g.font = '12px "Special Elite", monospace';
    g.fillText(quem === 'inspetor' ? 'você · rastro dele nos últimos 10 s' : quem === 'ana' ? 'você · caminho dela' : 'você · caminho deles', 8, cv.height - 6);
  }

  // ---------------------------------------------------------------- DICAS DA LIA
  const DICAS = {
    sair_carro: ['Eu preciso sair desse carro.', 'É só abrir a porta. Respira, Lia.'],
    lanterna: ['Sem luz eu não vou a lugar nenhum.', 'A lanterna ficou no porta-malas, atrás do carro.'],
    posto: ['Tinha uma luz acesa mais pra frente na estrada.', 'O posto fica seguindo a estrada. Alguém lá pode me ajudar.'],
    chave_portao: ['O velho falou de uma chave.', 'A chave do portão deve estar no posto, perto de onde ele estava.'],
    abrir_portao: ['O internato fica no fim da estrada.', 'É seguir a estrada até o portão e abrir o cadeado com a chave.'],
    forcar_porta: ['A porta da frente está emperrada.', 'Se eu segurar E na porta principal, ela cede. Mas vai fazer barulho.'],
    galao: ['O gerador precisa de gasolina.', 'A despensa... fica depois da cozinha, pelo corredor oeste.'],
    fusiveis: ['O quadro estava sem fusíveis.', 'A etiqueta dizia: reserva na enfermaria. Corredor leste.'],
    gerador: ['Já tenho o que o gerador precisa.', 'A casa de máquinas fica no fim do corredor leste. Quando ligar, ele vai ouvir.'],
    procissao: ['Se as luzes piscarem, eu me escondo.', 'Armário ou cama. Eu fico perto de um enquanto ando.'],
    fita_diretor: ['O diretor gravava tudo.', 'Tinha um gravador na diretoria, no corredor leste.'],
    chave_escada: ['O quadro de chaves pede três números.', 'A fita do diretor falou o código. Anotei no diário, na aba Pistas.'],
    subir: ['A escada para os dormitórios está livre agora.', 'A escada sai da recepção. É só subir.'],
    engrenagens: ['A caixinha está sem uma engrenagem.', 'A menina escondeu no Dormitório E. Talvez perto de uma cama.'],
    caixinha: ['Já tenho a engrenagem.', 'A caixinha fica na sala de brinquedos. Segurar E para dar corda.'],
    ana: ['Não posso tirar os olhos dela.', 'Luz nela o tempo todo. Eu ando de costas se precisar.'],
    quarto_celeste: ['O quarto da Irmã Celeste está trancado.', 'A chave dela tem que estar por aqui, nos dormitórios. Olhar as mesas e as camas.'],
    fita_celeste: ['A irmã também deixou uma fita.', 'O gravador está no quarto da Irmã Celeste.'],
    chave_porao: ['Preciso descer de algum jeito.', 'O monta-cargas fica no depósito. A chave dele não deve estar longe.'],
    valvulas: ['A água não baixa sozinha.', 'A fita da irmã disse a ordem das válvulas. Está no diário, na aba Pistas.'],
    cofre: ['O cofre pede os números do Davi.', 'Cada página do diário do Davi tem um número. O cofre está na sala do diretor, atrás da porta de ferro.'],
    sair_tuneis: ['Tem que ter uma saída para cima.', 'A escotilha... a saída fica perto da sala do diretor.'],
    tumulos: ['Os três túmulos das crianças.', 'Ana, Tomé e Davi. Os nomes estão nas lápides. Segurar E para cavar.'],
    capela: ['A capela. A regra seis dizia para nunca entrar.', 'A porta da capela fica no fundo do cemitério.'],
    altar: ['As coisas das crianças vão no altar.', 'O altar fica no fundo da capela.'],
    sino: ['Agora o sino.', 'A corda do sino está na capela. Segurar E. Vai acordar tudo.'],
    fugir: ['Corre, Lia.', 'O portão dos fundos. Não para agora.']
  };
  const SALA_OBJ = { posto: 'posto', chave_portao: 'posto', galao: 'despensa', fusiveis: 'enferm', gerador: 'maq', fita_diretor: 'diret', chave_escada: 'hall', subir: 'hall', engrenagens: 'dormE', caixinha: 'brinq', quarto_celeste: 'celeste', fita_celeste: 'celeste', chave_porao: 'sotao', cofre: 'secreta', tumulos: 'cem', capela: 'capela', altar: 'capela', sino: 'capela' };
  let ociosoT = 0, nivelDica = 0, qT = 0, qCool = 0, dicaEspecifica = {};
  const objAtual = () => { const S = C.S; if (!S) return null; const c = R.capitulos[S.chapter]; return c && c.objetivos.find(o => !S.done[o.id]); };
  function darDica(manual) {
    const o = objAtual(); if (!o) return;
    const d = DICAS[o.id] || (o.dica ? [o.dica, o.dica] : ['O diário (TAB) tem tudo o que eu já sei.', 'O diário (TAB) tem tudo o que eu já sei.']);
    const esp = nivelDica >= 1 && !(manual && C.S.dif === 'pesadelo');
    if (esp) dicaEspecifica[o.id] = true;
    C.sub('lia', esp ? d[1] : d[0]);
    nivelDica = Math.min(2, nivelDica + 1);
  }
  const salaMarcada = () => { const S = C.S, o = objAtual(); if (!S || !o || S.dif === 'pesadelo') return null; return (S.dif === 'facil' || dicaEspecifica[o.id]) ? SALA_OBJ[o.id] || null : null; };

  // ---------------------------------------------------------------- HISTÓRICO, PISTAS
  const hist = [];
  function historico(quem, texto) {
    const u = hist[hist.length - 1]; if (u && u.texto === texto) return;
    hist.push({ quem, texto, t: C.S ? C.S.tempo : 0 }); if (hist.length > 40) hist.shift();
    if (quem === 'nota' && MU) MU.texto(texto);
  }
  const SIMB = { lia: '●', davi: '△', joaquim: '■', inspetor: '◆', ana: '○', celeste: '✚', diretor: '▲', moacir: '◇', radio: '≈' };
  function nomeFalante(quem, p) { return OPT.contraste ? `${SIMB[quem] || '·'} ${p.nome}` : p.nome; }
  function fala(quem, texto) {
    const S = C.S; if (!S) return;
    const p = R.personagens[quem] || { nome: quem };
    historico(p.nome, texto);
    if (!S.flags.pista_q && S.quadro && texto.includes(S.quadro.join(''))) { S.flags.pista_q = true; C.toast('Código anotado no diário (TAB · Pistas).'); }
    if (!S.flags.pista_v && S.ordem && texto.includes(S.ordem.join(' - '))) { S.flags.pista_v = true; C.toast('Ordem anotada no diário (TAB · Pistas).'); }
  }
  const PAG_LOCAL = { p1: 'diretoria', p2: 'quarto da Irmã Celeste', p3: 'sala de brinquedos', p4: 'túnel norte' };
  function renderPistas(el) {
    const S = C.S, L = [];
    if (S.flags.pista_q || S.fitas.f1) L.push(['Quadro de chaves da recepção', S.quadro.join(' '), 'dito na fita do diretor (diretoria)']);
    if (S.flags.pista_v || S.fitas.f2) L.push(['Ordem das válvulas', S.ordem.join(' - '), 'dito na fita da Irmã Celeste']);
    const pags = ['p1', 'p2', 'p3', 'p4'];
    if (pags.some(p => S.notes[p])) L.push(['Números do Davi (cofre)', pags.map((id, i) => S.notes[id] ? S.code[i] : '_').join(' '), pags.map((id, i) => `${i + 1}º: ${S.notes[id] ? 'achado' : 'falta'} (${PAG_LOCAL[id]})`).join(' · ')]);
    el.innerHTML = L.length ? L.map(([a, b, c]) => `<div class="pista"><h3>${a}</h3><div class="digits">${b}</div><small>${c}</small></div>`).join('') : '<p style="color:var(--fraco)">Nenhuma pista anotada. Códigos ditos em fitas e escritos em páginas aparecem aqui.</p>';
  }
  function renderOuvido(el) {
    el.innerHTML = hist.length ? `<p style="color:var(--fraco);margin-bottom:10px">As últimas falas e sons, do mais recente ao mais antigo.</p>` + hist.slice().reverse().map(h => `<div class="ouv"><span>${h.quem === 'som' ? '' : h.quem}</span>${h.quem === 'som' ? `<i>${/^[▲✦] /.test(h.texto) ? h.texto.slice(0, 2) + '[' + h.texto.slice(2) + ']' : '[' + h.texto + ']'}</i>` : h.texto}</div>`).join('') : '<p style="color:var(--fraco)">Silêncio. Por enquanto.</p>';
  }

  // ---------------------------------------------------------------- CRONÔMETRO / VELA / FIM DE CAPÍTULO
  let splitT = 0, velaTO;
  function objetivo(id) {
    ociosoT = 0; nivelDica = 0; mostrarObjT = 6;
    if (MU) MU.objetivo(id);
    const S = C.S; if (!S || !OPT.cron) return;
    const c = R.capitulos[S.chapter], caps = C.lsGet(C.CAPS_KEY, {}), reg = caps[c.id] || {}, sp = reg.splits || {};
    const t = S.capT, ant = sp[id];
    const el = $('#split');
    if (ant) { const df = t - ant; el.textContent = `${df < 0 ? '−' : '+'}${relogio(Math.abs(df))}`; el.className = df < 0 ? 'bom' : 'ruim'; }
    else { el.textContent = relogio(t); el.className = ''; }
    splitT = 3; el.hidden = false;
    if (!ant || t < ant) { sp[id] = t; caps[c.id] = { ...reg, splits: sp }; C.lsSet(C.CAPS_KEY, caps); }
  }
  function salvou(inicioCap) {
    const S = C.S; if (S) ultSaveTempo = S.tempo;
    if (inicioCap || C.mode !== 'jogo') return;
    const v = $('#vela'); v.hidden = false; v.classList.remove('on'); void v.offsetWidth; v.classList.add('on');
    clearTimeout(velaTO); velaTO = setTimeout(() => { v.hidden = true; }, 2300);
  }
  let fimCapT = -99, maquinaTO;
  function fimCap(c, rk, ant) {
    const S = C.S, t = S.capT / 60, dano = S.capDano;
    const pd = dano === 0 ? 3 : dano < 60 ? 2 : dano < 120 ? 1 : 0, pt = t < 8 ? 2 : t < 13 ? 1 : 0, pv = S.capVisto <= 1 ? 1 : 0;
    const linhas = [
      [`Ferimentos: ${dano === 0 ? 'nenhum' : Math.round(dano)}`, pd, 3],
      [`Tempo: ${mmss(S.capT)}${ant.tempo ? ` · recorde ${mmss(ant.tempo)}` : ''}${!ant.tempo || S.capT < ant.tempo ? ' · novo recorde' : ''}`, pt, 2],
      [`Perseguida ${S.capVisto} ${S.capVisto === 1 ? 'vez' : 'vezes'}`, pv, 1]
    ];
    $('#fc-crit').innerHTML = linhas.map(([a, p, m]) => `<div>${a} <b>+${p}</b><span>/${m}</span></div>`).join('') +
      `<small>Rank S: sem ferimentos, menos de 8 min e perseguida no máximo 1 vez${ant.rank ? ` · seu melhor: ${ant.rank}` : ''}</small>`;
    const r = $('#fc-rank'); r.className = 'rank rank-' + rk;
    const g = $('#fc-gancho'), txt = c.gancho || ''; g.textContent = ''; let i = 0;
    clearInterval(maquinaTO);
    maquinaTO = setInterval(() => { i++; g.textContent = txt.slice(0, i); if (i % 3 === 0) C.SFX.clique(); if (i >= txt.length) clearInterval(maquinaTO); }, 38);
    $('#fc-pular').style.opacity = 0; setTimeout(() => { $('#fc-pular').style.opacity = 1; }, 1500);
    fimCapT = rel();
    if (MU) MU.fimCap(c);
  }

  // ---------------------------------------------------------------- SEGREDOS DO TÍTULO
  let digitado = '', sinoN = 0, sinoT = 0;
  const h1 = $('#t-titulo'), h1Orig = h1.innerHTML;
  function sangrar() {
    h1.innerHTML = h1Orig.split('<br>').map(l => [...l].map((ch, i) => `<span class="gota" style="animation-delay:${(i * .09).toFixed(2)}s">${ch === ' ' ? '&nbsp;' : ch}</span>`).join('')).join('<br>');
    h1.classList.add('sangra'); setTimeout(() => { h1.classList.remove('sangra'); h1.innerHTML = h1Orig; }, 4200);
  }
  function teclaTitulo(e) {
    const m = /^Key([A-Z])$/.exec(e.code); if (!m) return false;
    digitado = (digitado + m[1]).slice(-12);
    if (digitado.endsWith('SILENCIO')) {
      digitado = ''; OPT.velorioLib = true; OPT.velorio = !OPT.velorio; C.salvarOpt(); aplicar(); sangrar(); C.conquista('segredo_velorio');
      subTitulo(OPT.velorio ? 'Modo Velório. As cores foram enterradas. (digite de novo para desfazer)' : 'As cores voltaram. Por enquanto.');
      return true;
    }
    if (digitado.endsWith('DAVI')) { digitado = ''; C.SFX.sinoLonge(); C.conquista('segredo_davi'); subTitulo('Lia... eu ainda tô aqui embaixo. Traz o carrinho azul. — D.'); return true; }
    if (digitado.endsWith('NOVE')) { digitado = ''; C.SFX.badaladas(9); h1.classList.add('treme'); setTimeout(() => h1.classList.remove('treme'), 19800); C.conquista('segredo_nove'); subTitulo('Uma. Duas. Nove vezes.'); return true; }
    return false;
  }
  let subTO;
  function subTitulo(t) { const el = $('#t-sub'), orig = R.subtitulo; el.textContent = t; el.classList.add('segredo'); clearTimeout(subTO); subTO = setTimeout(() => { el.textContent = orig; el.classList.remove('segredo'); }, 6500); }
  const DIF_DESC = { facil: 'Ele anda mais devagar e ouve menos. Golpes doem menos. Dicas da Lia e anel de barulho ligados.', normal: 'O medo como foi pensado. Dois golpes e acabou.', pesadelo: 'Ele ouve mais longe e um golpe mata. Sem anel de barulho, sem dicas.' };
  function atualizarTitulo() {
    const sv = C.lsGet(C.SAVE_KEY, null), el = $('#t-save');
    if (sv && R.capitulos[sv.chapter]) el.textContent = `${R.capitulos[sv.chapter].titulo} · ${(C.DIFS[sv.dif] || C.DIFS.normal).nome} · ${mmss(sv.tempo || 0)} jogados`;
    else el.textContent = '';
    $('#o-dif-desc').textContent = DIF_DESC[$('#o-dif').value] || '';
    focar('#title');
  }
  $('#o-dif').addEventListener('change', () => { $('#o-dif-desc').textContent = DIF_DESC[$('#o-dif').value] || ''; });

  // ---------------------------------------------------------------- PAUSA
  let pausaT = -99;
  function pausa() {
    const S = C.S; if (!S) return;
    pausaT = rel();
    const c = R.capitulos[S.chapter], o = objAtual();
    $('#p-info').innerHTML = `${c.titulo}${o ? `<br><span>${o.texto.replace(/\s*\(\{n\}\/\d\)/, '')}</span>` : ''}<br><small>${C.D().nome} · ${mmss(S.tempo)} jogados · ponto salvo há ${mmss(Math.max(0, S.tempo - ultSaveTempo))}</small>${MU && MU.lembranca() ? `<br><em class="lembra">${MU.lembranca()}</em>` : ''}`;
    focar('#pause');
  }

  // ---------------------------------------------------------------- TECLAS
  function tecla(e) {
    const S = C.S;
    if (!$('#confirma').hidden && e.code === 'Escape') { $('#cf-nao').click(); return true; }
    if (!$('#opcoes').hidden && e.code === 'Escape') { fecharOpcoes(); return true; }
    if (!$('#painel').hidden && e.code === 'Escape') { $('#pn-voltar').click(); return true; }
    if (!$('#brilho').hidden && (e.code === 'Escape' || e.code === 'Enter')) { $('#br-ok').click(); return true; }
    if (!$('#fimcap').hidden) { if (/^(KeyE|Enter|Space)$/.test(e.code) && rel() - fimCapT > 1.5) { C.pularFimCap(); return true; } return true; }
    if (C.ui === 'morte' && !$('#death').hidden) {
      if (rel() - morteT < .4) return true;
      if (e.code === 'KeyE' || e.code === 'KeyR') { C.retry(); return true; }
      if (e.code === 'KeyM') { $('#dt-menu').click(); return true; }
      return navegar(e);
    }
    if (C.ui === 'pausa' && !$('#pause').hidden && (e.code === 'Escape' || e.code === 'KeyP')) { if (rel() - pausaT > .35) C.fecharPausa(); return true; }
    if (C.ui === 'pausa' || C.ui === 'escolha' || C.ui === 'final' || (C.mode === 'titulo' && !C.ui)) {
      if (navegar(e)) return true;
      if (C.mode === 'titulo' && !$('#title').hidden && teclaTitulo(e)) return true;
      return C.mode === 'titulo';
    }
    if (C.mode === 'jogo' && !C.ui && S && !S.dead) {
      if (e.code === 'KeyO') { mostrarObjT = 5; const el = $('#obj'); el.classList.remove('lembra'); void el.offsetWidth; el.classList.add('lembra'); return true; }
      if (e.code === 'KeyC') { if (!S.hidden) C.P.crouch = OPT.agachar === 'segurar' ? true : !C.P.crouch; return true; }
    }
    return false;
  }
  function soltou(e) { if (e.code === 'KeyC' && OPT.agachar === 'segurar') C.P.crouch = false; }

  // ---------------------------------------------------------------- QUADRO A QUADRO
  let mostrarObjT = 0, panicoT = 0, estatuaT = 0, cronHtml = '';
  function dica1x(flag, txt) { const S = C.S; if (S.flags[flag] || S.dif === 'pesadelo') return; S.flags[flag] = true; C.toast(txt); }
  function frame(dt, ativo) {
    agora += dt;
    if (MU) MU.frame(dt, ativo);
    const S = C.S, P = C.P, M = C.M;
    if (S !== Sref) { Sref = S; rastro.length = 0; causa = null; motivoCaca = null; if (S && S.capT < 1 && S.chapter === 0 && S.tempo < 1) { mortesCap = {}; mortesCausa = {}; } }
    $('#cena-pular').hidden = C.mode !== 'cena';
    desenharSom();
    if (setaT > 0) { setaT -= dt; if (setaT <= 0) $('#somdir').hidden = true; }
    if (splitT > 0) { splitT -= dt; if (splitT <= 0) $('#split').hidden = true; }
    anel(dt);
    const jogo = C.mode === 'jogo' && S && !S.dead;
    // cronômetro
    const cr = $('#cron');
    if (OPT.cron && jogo) { const h = `${relogio(S.capT)}<small>${relogio(S.tempo)}</small>`; if (h !== cronHtml) { cr.innerHTML = h; cronHtml = h; } cr.hidden = false; } else cr.hidden = true;
    if (!ativo || !S) return;
    // rastro para o mapa da morte (10 s, a cada 0,5 s)
    rastroT -= dt;
    if (rastroT <= 0) {
      rastroT = .5;
      const ent = M.ativo ? M.pos : C.ANA.ativa ? C.ANA.pos : C.PROC.fase === 'passando' ? C.PROC.pos : null;
      rastro.push({ px: P.pos.x, pz: P.pos.z, mx: ent ? ent.x : null, mz: ent ? ent.z : null, ruido: P.noiseR }); if (rastro.length > 20) rastro.shift();
    }
    if (P.sprinting) ultCorrida = agora;
    if (P.naAgua && P.noiseR > 0) ultAgua = agora;
    if (S.stamina <= .5 && (S.hidden || C.keys.ShiftLeft || C.keys.ShiftRight)) ultSemFolego = agora;
    if (S.hidden && !hiddenAnt) entrouPerto = !!(M.ativo && M.achou);
    if (S.hidden) escondidaAntes = true; else if (hiddenAnt === null || !M.ativo || M.pos.distanceTo(P.pos) > 3) escondidaAntes = false;
    hiddenAnt = S.hidden;
    if (M.ativo && M.state === 'caca' && estadoAnt !== 'caca') motivoCaca = { d: M.pos.distanceTo(P.pos), ruido: P.noiseR };
    estadoAnt = M.ativo ? M.state : null;
    // HUD em pânico: some o que não importa durante a caçada
    panicoT = M.ativo && M.state === 'caca' ? 5 : Math.max(0, panicoT - dt);
    const hud = $('#hud').classList;
    hud.toggle('panico', panicoT > 0);
    mostrarObjT = Math.max(0, mostrarObjT - dt);
    hud.toggle('hudmin', !!OPT.hudMin && mostrarObjT <= 0);
    // dicas da primeira vez
    if (M.ativo && M.state === 'caca') dica1x('tip_caca', 'Ele ouviu você. Correr faz mais barulho. Um armário ou uma cama te salvam.');
    if (S.hidden && M.ativo) dica1x('tip_esconde', 'Quando ele chegar perto, segure ESPAÇO para prender a respiração.');
    if (S.stamina <= .5 && !S.hidden) dica1x('tip_folego', 'Sem fôlego. Ande um pouco para recuperar, ou ele vai ouvir você ofegar.');
    if (S.inv.lanterna && S.flashOn && S.battery < 18) dica1x('tip_pilha', S.inv.pilhas ? 'A pilha está fraca e a luz vai piscar. R troca a pilha.' : 'A pilha está fraca e a luz vai piscar. Procure pilhas.');
    if (S.health < 45 && S.inv.kits > 0) dica1x('tip_kit', 'Você está ferida e mais lenta. H usa um curativo.');
    if (P.naAgua && M.ativo) dica1x('tip_agua', 'Na água, cada passo faz barulho dobrado.');
    // dicas da Lia quando a jogadora trava
    qCool = Math.max(0, qCool - dt);
    if (C.keys.KeyO && qCool <= 0) { qT += dt; if (qT >= .8) { qT = 0; qCool = 10; C.emitNoise(P.pos.x, P.pos.z, 2, true); darDica(true); ociosoT = 0; } } else qT = 0;
    const caca = M.ativo && (M.state === 'caca' || M.state === 'investiga');
    if (OPT.dicas && S.dif !== 'pesadelo' && !caca && !C.PROC.fase && !S.hidden) {
      ociosoT += dt;
      if (ociosoT > (nivelDica === 0 ? 95 : nivelDica === 1 ? 75 : 120)) { ociosoT = 0; darDica(false); }
    }
    // segredo: estátua
    if (M.ativo && !S.hidden && P.noiseR === 0 && M.pos.distanceTo(P.pos) < 6) { estatuaT += dt; if (estatuaT > 20) C.conquista('segredo_estatua'); } else estatuaT = 0;
  }

  MU = criarMundo(Object.assign(C, { historico: (q, t) => historico(q, t) }));
  aplicar();
  $('#b-opc').onclick = () => abrirOpcoes('#title');
  $('#p-opc').onclick = () => abrirOpcoes('#pause');
  atualizarTitulo();
  return { mundo: MU, papel: (id, m) => MU.papel(id, m), renderTempo: el => MU.renderTempo(el), renderPessoas: el => MU.renderPessoas(el), renderParedes: () => MU.renderParedes(), ondeNota: id => MU.ondeNota(id), marcasAbas: () => MU.marcasAbas(), marcaMapa: r => MU.marcaMapa(r), telaFinal: t => MU.telaFinal(t), tecla, soltou, som, ruido, golpe, morte, objetivo, salvou, fimCap, frame, fala, historico, nomeFalante, renderPistas, renderOuvido, salaMarcada, pausa, atualizarTitulo, antesDeNovoJogo, confirmar, aplicar, mmss, get ultSaveTempo() { return ultSaveTempo; } };
}
