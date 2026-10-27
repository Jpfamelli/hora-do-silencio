// Kit de teste: carregar no console com  await import('/ferramentas/teste.js?'+Date.now())
const J = window.__jogo;
window.__teste = true;
const T = window.T = {
  errs: [],
  passo(seg = 1, dt = 1 / 30) { for (let t = 0; t < seg; t += dt) J.frame(dt); },
  async esperar(ms) { const fim = performance.now() + ms; while (performance.now() < fim) { J.frame(1 / 30); await new Promise(r => setTimeout(r, 30)); } },
  achar(re) { return J.W.inter.filter(i => i.obj.visible && i.on() && re.test(i.label().replace(/<[^>]+>/g, ''))); },
  pos(it) { const v = new (J.camera.position.constructor)(); it.obj.getWorldPosition(v); return v; },
  ir(x, z) { J.P.pos.set(x, 0, z); J.frame(1 / 30); },
  usar(re, { ir = true } = {}) {
    const l = T.achar(re); if (!l.length) { console.log("[QA] nada encontrado: " + re + " | " + JSON.stringify(T.estado())); return `NADA: ${re}`; }
    const it = l[0], p = T.pos(it);
    if (ir) T.ir(p.x + .3, p.z + .3);
    const antes = it.label().replace(/<[^>]+>/g, ''); it.act(); J.frame(1 / 30);
    return `ok: ${antes} @ ${p.x.toFixed(1)},${p.y.toFixed(2)},${p.z.toFixed(1)}`;
  },
  todos(re) { const out = []; let n = 0; while (n++ < 30) { const l = T.achar(re); if (!l.length) break; out.push(T.usar(re)); } return out; },
  estado() { const S = J.S; return { cap: S.chapter, mapa: S.mapa, done: Object.keys(S.done).filter(k => S.done[k]), vida: Math.round(S.health), inv: JSON.stringify(S.inv), ui: J.ui, mode: J.mode, sala: J.roomAt(J.P.pos.x, J.P.pos.z)?.id, insp: J.M.ativo ? J.M.state : 'off', ana: J.ANA.ativa, proc: J.PROC.fase, errs: T.errs.slice(-5) }; },
  tecla(code, n = 1) { for (let i = 0; i < n; i++) J.onKey({ code, preventDefault() {} }); },
  dlg() { let n = 0; while (J.ui === "dialogo" && n++ < 40) T.tecla("KeyE"); while (J.ui === "nota" && n++ < 45) T.tecla("Escape"); },
  flutuando() { // itens visíveis cuja base não toca nada abaixo
    const out = [];
    for (const { key, mesh } of J.W.items) {
      if (!mesh.visible) continue;
      const p = new (J.camera.position.constructor)(); mesh.getWorldPosition(p);
      if (p.y < .05) continue;
      const ray = new (J.W.raycaster || (window.THREE_RAY))(); out.push(`${key} y=${p.y.toFixed(2)}`);
    }
    return out;
  }
};
T.avisos = window.__avisos = window.__avisos || [];
if (!console.__orig) { console.__orig = console.warn; console.warn = (...a) => { window.__avisos.push(a.join(' ')); console.__orig(...a); }; }
T.novo = async (dif = 'normal') => {
  document.getElementById('o-dif').value = dif;
  document.getElementById('b-novo').click(); T.passo(1); J.pularCena(); T.passo(.5);
};
T.cap0 = async () => {
  T.usar(/porta-malas/); T.usar(/Falar com o velho/); T.dlg(); T.dlg(); T.usar(/chave do portão/);
  await T.esperar(1200); T.usar(/cadeado/); await T.esperar(8000);
};
T.cap1 = async () => { T.usar(/Forçar a porta/); T.usar(/galão/); T.usar(/caixa de fusíveis/); T.usar(/Ligar o gerador/); await T.esperar(8000); };
// ---- jogada completa automática (usada pelo ferramentas/qa.mjs)
// Avança o loop sem desenhar (rápido) e espera em tempo real pelos setTimeout do jogo.
T.ok = () => { if (J.ui === 'pausa') document.getElementById('p-voltar').click(); T.dlg(); };
T.ate = async (cond, seg = 60, deus = true) => {
  const r = J.renderer, orig = r.render; r.render = () => {};
  const fim = performance.now() + seg * 1000;
  try {
    while (!cond() && performance.now() < fim) {
      for (let i = 0; i < 6; i++) { if (deus && J.S) { J.S.health = 1000; J.S.dead = false; } J.frame(1 / 30); }
      T.ok(); await new Promise(res => setTimeout(res, 5));
    }
  } finally { r.render = orig; if (J.S) J.S.health = Math.min(J.S.health, 100); }
  return cond();
};
T.semFita = () => T.ate(() => document.getElementById('fita-ind').hidden, 120);
T.cap = n => T.ate(() => J.S.chapter >= n && document.getElementById('fimcap').hidden, 60);
// ---- portas livres: um corredor de 1 m dos dois lados de cada porta/vão, sem caixa de colisão (evita soft-lock por móvel)
T.portasLivres = () => {
  const W = J.W, out = [];
  for (const l of W.links) {
    const nx = l.eixo === 'x' ? 0 : 1, nz = l.eixo === 'x' ? 1 : 0;
    for (const s of [-1, 1]) for (const dist of [.55, .9]) for (const lat of [-.3, 0, .3]) {
      const x = l.x + nx * s * dist + nz * lat, z = l.z + nz * s * dist + nx * lat;
      const c = W.colliders.find(c => c.on && !(l.door && c === l.door.col) && x > c.minX - .2 && x < c.maxX + .2 && z > c.minZ - .2 && z < c.maxZ + .2);
      if (c) { out.push(`${W.mapa}: porta ${l.a}-${l.b} (${l.x},${l.z}) bloqueada em ${x.toFixed(2)},${z.toFixed(2)} por [${c.minX.toFixed(2)},${c.maxX.toFixed(2)}]x[${c.minZ.toFixed(2)},${c.maxZ.toFixed(2)}]`); break; }
    }
  }
  return [...new Set(out)];
};
// ---- lore nova só no caminho: cada nota/prop do lote 2 fica numa sala com objetivo (ou corredor entre objetivos)
T.loreNoCaminho = () => {
  const g = window.__jgm; if (!g) return ['sem __jgm'];
  const out = [];
  for (const l of g.lore) {
    if (l.mapa !== J.W.mapa) continue;
    const r = J.roomAt(l.x, l.z);
    if (!r || r.id !== l.sala) out.push(`lore ${l.id} fora da sala ${l.sala} (está em ${r && r.id})`);
    if (!(g.rota[l.mapa] || []).includes(l.sala)) out.push(`lore ${l.id} em sala sem objetivo: ${l.sala}`);
  }
  return out;
};
T.checarMapa = () => { const f = [...T.portasLivres(), ...T.loreNoCaminho()]; for (const x of f) console.log('[QA] ' + x); return f; };
T.tudo = async () => {
  const log = [], passo = (nome, ok) => { console.log('[QA] ' + (ok ? 'ok ' : 'FALHOU ') + nome + ' ' + Math.round(performance.now() / 1000) + 's'); log.push((ok ? 'OK  ' : 'FALHOU ') + nome + ' | ' + JSON.stringify({ cap: J.S.chapter, mapa: J.S.mapa })); if (!ok) { console.log('[QA] estado: ' + JSON.stringify(T.estado())); throw new Error(nome); } };
  try {
    localStorage.removeItem('hora-silencio-v2');
    await T.novo(); passo('novo jogo', J.mode === 'jogo'); passo('portas e lore: estrada', !T.checarMapa().length);
    { // lote 3: TAB (diário) e P (pausa) não abrem durante o agarrão
      const est = J.M.state, uiAntes = J.ui, tecla = (tipo, code) => window.dispatchEvent(new KeyboardEvent(tipo, { code, key: code, bubbles: true, cancelable: true }));
      J.M.state = 'agarra'; tecla('keydown', 'Tab'); tecla('keyup', 'Tab'); tecla('keydown', 'KeyP'); tecla('keyup', 'KeyP');
      const ok = J.ui === uiAntes; J.M.state = est; passo('menus travados no agarrão', ok);
    }
    T.usar(/porta-malas/); T.usar(/Falar com/); T.dlg(); T.dlg(); T.usar(/chave do portão/);
    await T.ate(() => J.S.inv.chaves.portao, 20); T.usar(/cadeado/);
    passo('prólogo', await T.cap(1) && J.S.mapa === 'terreo'); passo('portas e lore: térreo', !T.checarMapa().length);
    T.usar(/Forçar a porta/); T.usar(/galão/); T.usar(/caixa de fusíveis/); T.usar(/Ligar o gerador/);
    passo('cap I', await T.cap(2));
    await T.semFita(); T.usar(/Fita 1/); await T.ate(() => J.S.fitas.f1, 120);
    T.usar(/página 1/); T.dlg();
    T.usar(/código do quadro/); for (const d of J.S.quadro) T.tecla('Digit' + d); T.tecla('Enter');
    await T.ate(() => J.S.done.procissao, 90);
    T.usar(/Subir para os dormitórios/);
    passo('cap II', await T.cap(3) && J.S.mapa === 'superior'); passo('portas e lore: andar de cima', !T.checarMapa().length);
    T.usar(/Pegar a engrenagem/); T.usar(/dar corda na caixinha/); await T.ate(() => J.S.done.ana, 60);
    T.usar(/página 3/); T.dlg();
    T.usar(/chave da Irmã/); T.usar(/porta da Irmã/); await T.semFita(); T.usar(/Fita 2/); await T.ate(() => J.S.fitas.f2, 120);
    T.usar(/página 2/); T.dlg();
    T.usar(/chave do monta-cargas/); T.usar(/Descer pelo monta-cargas/);
    passo('cap III', await T.cap(4) && J.S.mapa === 'tuneis'); passo('portas e lore: túneis', !T.checarMapa().length);
    for (const n of J.S.ordem) T.usar(new RegExp('Girar a válvula ' + n));
    T.usar(/página 4/); T.dlg();
    T.usar(/cofre/); for (const d of J.S.code) T.tecla('Digit' + d); T.tecla('Enter');
    await T.ate(() => J.S.flags.cofre, 20); T.usar(/escotilha/);
    passo('cap IV', await T.cap(5) && J.S.mapa === 'cemiterio'); passo('portas e lore: cemitério', !T.checarMapa().length);
    T.todos(/Cavar o túmulo/); T.usar(/porta da capela/); T.ir(0, -52); await T.ate(() => J.S.done.capela, 10);
    T.usar(/altar/); T.usar(/corda do sino/); await T.ate(() => J.S.flags.sino, 20);
    T.ir(0, 11.6); await T.ate(() => J.S.fim || J.ui === 'escolha', 30);
    passo('cap V e final', J.S.fim || J.ui === 'escolha');
  } catch (e) { log.push('ERRO ' + e.message); }
  return { log, errs: T.errs, avisos: T.avisos };
};
// ---- plataforma e acessibilidade (rodado pelo qa.mjs depois do T.tudo)
T.plataforma = async () => {
  const P = window.__plat, falhas = [], ok = (n, c) => { console.log('[QA] ' + (c ? 'ok ' : 'FALHOU ') + 'plataforma: ' + n); if (!c) falhas.push(n); };
  if (!P) return ['sem __plat'];
  await new Promise(r => setTimeout(r, 2500)); // deixa a tela final terminar de abrir
  document.getElementById('escolha').hidden = true; document.getElementById('e-menu').click();
  await T.novo(); T.passo(.5);
  J.P.crouch = false; T.tecla('ControlLeft'); ok('Ctrl não agacha (Ctrl+W fecha a aba)', !J.P.crouch);
  T.tecla('KeyC'); ok('C agacha', J.P.crouch); T.tecla('KeyC');
  J.keys.ShiftLeft = true; J.keys.KeyW = true; P.simularOculto(); ok('perder o foco pausa', J.ui === 'pausa'); P.limparTeclas(); ok('teclas soltas ao pausar', !J.keys.ShiftLeft && !J.keys.KeyW);
  document.getElementById('p-voltar').click(); await new Promise(r => setTimeout(r, 20)); ok('volta da pausa com retorno suave', P.graca > 0);
  // sem trava de mouse no Chrome headless, a pointerlockchange reabre a pausa logo depois: fecha de novo para os testes seguintes
  for (let k = 0; k < 3 && J.ui === 'pausa'; k++) { document.getElementById('p-voltar').click(); await new Promise(r => setTimeout(r, 60)); }
  T.passo(1.5);
  let n = 0; P.agenda(() => n++, 1); J.S.dead = true; T.passo(2); J.S.dead = false; ok('fala agendada não corre com o jogo parado', n === 0);
  J.carregarSnap(J.S._check); ok('carregar checkpoint limpa a agenda', P.fila.length === 0);
  // no Chrome headless, um pointerlockchange atrasado pode reabrir a pausa depois do checkpoint: fecha antes de testar
  if (J.ui === 'pausa') { document.getElementById('p-voltar').click(); await new Promise(r => setTimeout(r, 20)); T.passo(.2); }
  const semPausa = () => { if (J.ui === 'pausa') document.getElementById('p-voltar').click(); }; // no Chrome headless a trava do ponteiro cai sozinha e reabre a pausa
  semPausa(); P.forcarCalma(); ok('salvamento leve grava', P.salvarAuto() && !!localStorage.getItem('hora-silencio-v3-auto'));
  ok('link de desafio', /desafio=[SABC]+-[0-9a-z]+-[0-9a-z]+$/.test(P.textoResultado().url));
  // lote 2: ação longa por toque, agarrão por tecla, lápide, botões do controle viram teclas de verdade
  const tecla = (tipo, code) => dispatchEvent(new KeyboardEvent(tipo, { code, key: code, bubbles: true }));
  P.O.acoes = 'tocar'; J.S.inv.kits = 1; J.S.health = 40; J.S.hidden = null; J.P.crouch = false;
  tecla('keydown', 'KeyH'); tecla('keyup', 'KeyH');
  ok('ação longa por toque fica ligada', !!P.trava && P.trava.code === 'KeyH');
  T.passo(3.2); ok('curativo termina sem segurar a tecla', J.S.inv.kits === 0 && !P.trava);
  P.O.acoes = 'segurar';
  const est = J.M.state; J.M.state = 'agarra'; P.AG.sacode = 0; P.puxar(200); ok('apertar E enche a barra de soltura', P.AG.sacode === 200); P.AG.sacode = 0; J.M.state = est;
  P.P2.abrirLapide('morte'); const lp = document.getElementById('lapide'), img = document.getElementById('lp-img');
  ok('lápide abre com a imagem', !lp.hidden && /^data:image\/png/.test(img.src)); P.P2.fecharLapide(); ok('lápide fecha', lp.hidden);
  ok('lápide fala a causa em linguagem do jogo', /às \d+h\d\d/.test(P.P2.dadosLapide('morte').causa));
  const fakePad = { connected: true, axes: [0, -1, 0, 0], buttons: Array.from({ length: 17 }, () => ({ pressed: false, value: 0 })) };
  const orig = navigator.getGamepads; navigator.getGamepads = () => [fakePad];
  semPausa(); P.pad(1 / 30); ok('controle anda para frente', J.keys.KeyW === true);
  fakePad.axes = [0, 0, 0, 0]; P.pad(1 / 30); ok('soltar o analógico para', !J.keys.KeyW);
  J.P.crouch = false; fakePad.buttons[1].pressed = true; P.pad(1 / 30); ok('B do controle agacha', J.P.crouch === true);
  fakePad.buttons[1].pressed = false; P.pad(1 / 30); ok('soltar B solta a tecla', !J.keys.KeyC && !P.segPad.KeyC);
  fakePad.buttons[1].pressed = true; P.pad(1 / 30); fakePad.buttons[1].pressed = false; P.pad(1 / 30); ok('B de novo levanta', J.P.crouch === false);
  navigator.getGamepads = orig; P.semPad();
  localStorage.removeItem('hora-silencio-v3-auto');
  return falhas;
};
T.itens = () => J.W.items.filter(i => i.mesh.visible).map(i => { const p = T.pos(i.it); return `${i.key} ${p.x.toFixed(1)},${p.y.toFixed(2)},${p.z.toFixed(1)}`; });
window.addEventListener('error', e => T.errs.push(e.message + ' @' + (e.filename || '').split('/').pop() + ':' + e.lineno));
export default T;
