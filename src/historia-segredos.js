// HISTÓRIA — SEGREDOS (Lote 4): salas e objetos escondidos, códigos, cartas, finais escondidos e a
// palavra que liga tudo. Cada segredo é pequeno e fica no caminho (nada de voltar por mapas já vistos).
// - Prólogo: voltar para o carro (o rádio segue o programa; nove partidas = final escondido), o Seu
//   Joaquim que perde a paciência, a gaveta da caixa registradora (chave A.T. 1980), cartas do Joaquim.
// - Térreo/andar de cima/túneis/cemitério: plaquinhas em braile, gaveta do Davi, lousas, bolo, espelho,
//   língua do P, caderno de perguntas, tijolo L.M., cápsula do tempo, armário trancado por fora...
// - A noite inteira: o diário anota as suas esquisitices, páginas que aparecem sozinhas, regra 8, a fita 5,
//   cartas que você deixa e que são respondidas na noite seguinte, ACORDA no título.
// Instalado por src/historia.js. Todo o texto mora em roteiro.js (R.lote4). Lembrança em 'hora-silencio-l4'.

const CSS = `
#l4-fim{position:fixed;inset:0;z-index:70;background:#000;color:#cfc3a6;display:flex;align-items:center;justify-content:center;padding:24px 16px;text-align:center;font-family:"IM Fell English",Georgia,serif}
#l4-fim .cx{max-width:620px;width:100%}
#l4-fim h1{font-family:"IM Fell English SC",Georgia,serif;font-weight:normal;letter-spacing:.14em;font-size:clamp(22px,5vw,34px);color:#c9a75a;margin-bottom:22px;opacity:0;animation:l4in 2s .4s forwards}
#l4-fim p{font-size:clamp(16px,2.4vw,20px);line-height:1.6;margin:0 0 14px;white-space:pre-line;opacity:0;animation:l4in 1.8s forwards}
#l4-fim small{display:block;margin:20px 0 18px;font-family:"Special Elite","Courier New",monospace;font-size:12px;letter-spacing:.14em;color:#857a63;opacity:0;animation:l4in 1.5s forwards}
#l4-fim .btn{min-height:44px;opacity:0;animation:l4in 1s forwards}
@keyframes l4in{to{opacity:1}}
#note p.l4-espelho{transform:scaleX(-1)}
#note p.l4-desvira{transition:transform 1.1s ease-in-out}
#note .l4-op{display:flex;flex-wrap:wrap;gap:8px;margin-top:14px;font-family:inherit}
#note .l4-op button{min-height:44px;padding:6px 12px;background:rgba(40,30,20,.08);border:1px solid rgba(60,40,20,.35);color:inherit;font:inherit;cursor:pointer}
#note .l4-op button:hover,#note .l4-op button:focus{background:rgba(40,30,20,.18)}
#l4-carta{position:fixed;inset:0;z-index:58;background:rgba(0,0,0,.86);display:flex;align-items:center;justify-content:center;padding:16px}
#l4-carta .pp{background:#d2c5a4;color:#26304a;max-width:520px;width:100%;padding:24px 22px;font-family:"IM Fell English",Georgia,serif;box-shadow:0 20px 60px #000;transform:rotate(-.4deg)}
#l4-carta h2{font-family:"IM Fell English SC",Georgia,serif;font-weight:normal;letter-spacing:.08em;margin-bottom:12px}
#l4-carta label{display:block;font-size:15px;margin:12px 0 6px}
#l4-carta textarea,#l4-carta input{width:100%;box-sizing:border-box;font:17px "IM Fell English",Georgia,serif;background:rgba(255,255,255,.35);border:1px solid rgba(40,40,80,.35);color:#1d2440;padding:8px}
#l4-carta textarea{height:84px;resize:none}
#l4-carta .bt{display:flex;gap:10px;justify-content:flex-end;margin-top:14px;flex-wrap:wrap}
#l4-carta .bt button{min-height:44px;min-width:96px}
#l4-carta .ok{font-size:14px;margin-top:10px;min-height:1.2em;color:#5a2a1a}
@media (prefers-reduced-motion: reduce){#l4-fim h1,#l4-fim p,#l4-fim small,#l4-fim .btn{animation-duration:.01s!important;animation-delay:0s!important}#note p.l4-desvira{transition:none}}
`;

const BRAILE = { a: '⠁', b: '⠃', c: '⠉', d: '⠙', e: '⠑', f: '⠋', g: '⠛', h: '⠓', i: '⠊', j: '⠚', k: '⠅', l: '⠇', m: '⠍', n: '⠝', o: '⠕', p: '⠏', q: '⠟', r: '⠗', s: '⠎', t: '⠞', u: '⠥', v: '⠧', w: '⠺', x: '⠭', y: '⠽', z: '⠵' };
const semAcento = s => String(s).normalize('NFD').replace(/\p{M}/gu, '');
const emBraile = s => [...String(s)].map(ch => { const b = BRAILE[semAcento(ch).toLowerCase()]; return b || ch; }).join('');

// segredos que contam para a página do Davi e para a carta do fim (cada um, uma vez por aparelho)
const SEGREDOS = ['caixaAT', 'cartaJ', 'prosa', 'naoEntrei', 'programa', 'braile1', 'braile2', 'braile3', 'gaveta', 'presente', 'castigo',
  'redacoes', 'ficha', 'bolo', 'planta', 'zelador', 'placa', 'bilhete', 'colchao', 'corrente', 'espelho', 'visitante', 'ana', 'monitor',
  'galena', 'perguntas', 'gibi', 'tijolo', 'pacto', 'cofre1503', 'capsula', 'cruzJ', 'banco', 'albano'];
// a palavra dos lugares que não existem: A C O R D A
const LETRAS = { gaveta: ['A', 1], galena: ['C', 2], ana: ['O', 3], tijolo: ['R', 4], capsula: ['D', 5], albano: ['A', 6] };
const INI = [20 * 60 + 38, 20 * 60 + 47, 21 * 60 + 1, 21 * 60 + 5, 21 * 60 + 31, 21 * 60 + 50];

export function instalarSegredos(c, u) {
  const { R, MAPAS, lsGet, lsSet } = c;
  const { falarLinhas, conqs, nomeJogador } = u;
  const L = R.lote4, A = c.API;
  const vazio = { tick() {}, aoComecar() {}, codigo: () => false, fitaFim() {}, extrasFinal: () => '', aoFinal() {}, titulo() {} };
  if (!L || !A) return vazio;
  const MD = L.modelos || {};
  const THREE = A.THREE;
  const $ = s => document.querySelector(s);
  const S = () => c.S;
  const teste = () => !!window.__teste;
  const KEY = 'hora-silencio-l4';
  const mem = () => { const m = lsGet(KEY, {}); return m && typeof m === 'object' ? m : {}; };
  const guardar = f => { const m = mem(); f(m); lsSet(KEY, m); return m; };
  const nota = id => R.notas.find(n => n.id === id);
  const fala = f => { if (f) c.sub(f.quem, f.texto); };
  const conq = id => c.conquista(id);
  const OPT = () => { const o = lsGet('hora-silencio-opt', {}); return o && typeof o === 'object' ? o : {}; };
  const seguro = (nome, fn) => { try { return fn(); } catch (e) { console.info('[segredos]', nome, e && e.message); } };
  if (!document.getElementById('l4-css')) { const st = document.createElement('style'); st.id = 'l4-css'; st.textContent = CSS; document.head.appendChild(st); }

  // ------------------------------------------------------------------
  // registro dos segredos: conta na noite (fita 5) e no aparelho (página do Davi, carta do fim)
  // ------------------------------------------------------------------
  const nSeg = () => Object.keys(mem().seg || {}).filter(k => SEGREDOS.includes(k)).length;
  function achar(id) {
    const St = S(); if (!St) return;
    St.flags.l4s = St.flags.l4s || {}; if (St.flags.l4s[id]) return; St.flags.l4s[id] = true;
    const m = guardar(m => { m.seg = m.seg || {}; m.seg[id] = true; if (LETRAS[id]) { m.letras = m.letras || {}; m.letras[id] = true; } });
    if (LETRAS[id]) setTimeout(() => c.toast(L.letra.replace('{l}', LETRAS[id][0]).replace('{n}', LETRAS[id][1])), 2800);
    if (Object.keys(St.flags.l4s).length >= 3 && !St.flags.l4f5 && !St.fitas.l4_cinco) { St.flags.l4f5 = 'pendente'; St.flags.l4f5de = St.mapa; }
    if (SEGREDOS.every(k => (m.seg || {})[k]) && !m.todosVisto) guardar(x => { x.todosVisto = true; x.cartaPendente = true; });
  }
  const letrasAchadas = () => { const l = mem().letras || {}; return ['gaveta', 'galena', 'ana', 'tijolo', 'capsula', 'albano'].map(k => l[k] ? LETRAS[k][0] : '_').join(' '); };

  // ------------------------------------------------------------------
  // o diário anota as esquisitices da noite (ninguém avisa: aparece no diário)
  // ------------------------------------------------------------------
  function anotar(k) {
    const St = S(); if (!St || !L.esquisitices[k]) return;
    const l = St.flags.l4esq = St.flags.l4esq || []; if (l.includes(k)) return;
    l.push(k); St.notes.l4_esquisitices = true;
  }

  // ------------------------------------------------------------------
  // textos montados na hora (o diário relê a nota com o texto do momento)
  // ------------------------------------------------------------------
  const hora = St => { const m = (INI[St.chapter] || INI[0]) + Math.min(12, Math.floor((St.capT || 0) / 60)); return `${Math.floor(m / 60)}h${String(m % 60).padStart(2, '0')}`; };
  const noiteN = () => Math.max(1, mem().noites || 1);
  const BASE4 = Object.fromEntries(R.notas.filter(n => /^l4_/.test(n.id)).map(n => [n.id, n.texto]));
  function textos(St) {
    const set = (id, t) => { const n = nota(id); if (n && t != null) n.texto = t; };
    // o que cada segredo já revelou nesta noite (o livro de ocorrências do Lote 2 devolve o texto base a cada mapa)
    const esp = nota('l4_espelho'); if (esp) set('l4_espelho', St.flags.l4espLido ? esp.normal : espelhado(esp.normal));
    set('l4_colchao', MD.colchao + (St.flags.l4colResp != null ? '\n\n' + MD.colchaoResp[St.flags.l4colResp] : ''));
    const mo = St.flags.l4mon; if (mo) set('l4_monitor', MD.monitor.replace('{h}', mo.h).replace('{sala}', mo.sala) + (mo.h2 ? '\n' + MD.monitorDepois.replace('{h}', mo.h2) : ''));
    set('l4_perguntas', MD.perguntas + (St.flags.l4medo ? MD.perguntasResp.replace('{r}', L.perguntas.opcoes[St.flags.l4medo - 1]) : ''));
    if (St.flags.l4capTxt) set('l4_capsula', St.flags.l4capTxt);
    if (St.flags.l4lousaTxt) set('l4_lousa', St.flags.l4lousaTxt);
    set('l4_corrente', BASE4.l4_corrente + (St.flags.l4corrente ? '\n(a décima linha, em outra letra)\nQUEM QUEBROU FOI O DAVI. ELE NÃO TINHA MEDO.' : ''));
    for (const id of ['l4_bilheteP1', 'l4_bilheteP2', 'l4_bilheteP3']) { const n = nota(id); if (n) set(id, BASE4[id] + ((St.flags.l4trad || {})[id] && !n.recusa ? '\n\n(a Lia traduz, baixinho)\n' + n.traducao : '')); }
    // cartas do Joaquim: uma por noite
    const i = (noiteN() - 1) % MD.cartasJoaquim.length;
    set('l4_cartaJ', MD.cartaRubrica.replace('{ano}', 1980 + i) + '\n' + MD.cartasJoaquim[i]);
    // esquisitices
    set('l4_esquisitices', [MD.esqCab, ...(St.flags.l4esq || []).map(k => L.esquisitices[k])].join('\n'));
    // página do Davi
    const n = nSeg(), D = MD.davi, tudo = n >= SEGREDOS.length;
    set('l4_davi', (tudo ? D.dTodos : n >= 20 ? D.d20 : D.d10).replace('{n}', n).replace('{letras}', letrasAchadas()));
    if (n >= 10) St.notes.l4_davi = true;
    // carta retida: a noite anterior
    const ant = mem().anterior;
    if (ant) {
      const caps = Object.entries(ant.capMortes || {}).sort((a, b) => b[1] - a[1]), pior = caps[0];
      const nomeCap = pior ? (R.capitulos[+pior[0]] || {}).titulo || 'prólogo' : 'prólogo';
      const nc = pior ? pior[1] : 0, nt = ant.mortes || 0, esc = Math.round((ant.escondida || 0) / 60);
      set('l4_retida', MD.retida.replace('{final}', MD.retidaFinal[ant.final || 'nenhum'] || MD.retidaFinal.nenhum)
        .replace('{capitulo}', nomeCap.replace(/^Capítulo /, 'capítulo ')).replace('{nCap}', nc).replace('{vezesCap}', nc === 1 ? 'vez' : 'vezes')
        .replace('{n}', nt).replace('{vezes}', nt === 1 ? 'vez' : 'vezes')
        .replace('{escondida}', esc < 1 ? 'menos de um minuto' : esc === 1 ? 'um minuto inteiro' : `${esc} minutos`)
        .replace('{chamado}', ant.respondeu ? MD.retidaChamado.sim : MD.retidaChamado.nao));
    }
  }

  // ------------------------------------------------------------------
  // ajudantes de mundo: lugar livre, parede, coisa interativa, malhas pequenas
  // ------------------------------------------------------------------
  const sala = id => A.W.salas.find(s => s.id === id);
  const usadas = [];
  function livre(salaId, tipos = ['mesa', 'prateleira', 'chao']) {
    const sp = A.W.spots[salaId]; if (!sp) return centro(salaId);
    const v = new THREE.Vector3(), ocup = [...A.W.inter.map(i => { i.obj.getWorldPosition(v); return { x: v.x, z: v.z }; }), ...usadas];
    for (const t of tipos) for (const p of (sp[t] || [])) if (ocup.every(o => Math.hypot(o.x - p.x, o.z - p.z) > .6)) { usadas.push(p); return p; }
    return centro(salaId, .8, .8);
  }
  function centro(salaId, dx = 0, dz = 0) { const r = sala(salaId); return r ? { x: (r.x0 + r.x1) / 2 + dx, y: 0, z: (r.z0 + r.z1) / 2 + dz } : { x: 0, y: 0, z: 0 }; }
  function naParede(salaId, lado, t, y) {
    const r = sala(salaId); if (!r) return centro(salaId);
    let prim = null;
    for (const d of [0, .12, -.12, .24, -.24, .36, -.36]) {
      const k = Math.min(.9, Math.max(.1, t + d)); let p;
      if (lado === 'n') p = { x: r.x0 + (r.x1 - r.x0) * k, y, z: r.z0 + .05, ry: 0 };
      else if (lado === 's') p = { x: r.x0 + (r.x1 - r.x0) * k, y, z: r.z1 - .05, ry: Math.PI };
      else if (lado === 'o') p = { x: r.x0 + .05, y, z: r.z0 + (r.z1 - r.z0) * k, ry: Math.PI / 2 };
      else p = { x: r.x1 - .05, y, z: r.z0 + (r.z1 - r.z0) * k, ry: -Math.PI / 2 };
      prim = prim || p;
      if ((A.W.links || []).every(l => Math.hypot(l.x - p.x, l.z - p.z) > 1.7)) return p;
    }
    return prim;
  }
  function coisa(mesh, p, rotulo, act, extra) {
    mesh.position.set(p.x, p.y || 0, p.z); if (p.ry != null) mesh.rotation.y = p.ry; A.W.grupo.add(mesh);
    return A.interact(mesh, typeof rotulo === 'function' ? rotulo : () => `<b>E</b>${rotulo}`, act, extra || {});
  }
  const segura = (it, fn) => Object.defineProperty(it, 'hold', { get: fn, configurable: true });
  const invisivel = () => new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false });
  const mat = (cor, em = 0x000000, ei = 0) => new THREE.MeshStandardMaterial({ color: cor, emissive: em, emissiveIntensity: ei, roughness: .85 });
  function grupo(...partes) { const g = new THREE.Group(); for (const [w, h, d, m, x, y, z] of partes) A.box(w, h, d, m, x, y, z, g, false); return g; }
  const papel = () => A.MK.nota();
  const caderno = cor => grupo([.22, .03, .3, mat(cor, cor, .15), 0, .015, 0], [.2, .032, .28, A.MAT.papel, .012, .016, 0]);
  function quadro(w, h, linhas, o) { const tx = A.textoTex(linhas, o); const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshStandardMaterial({ map: tx, roughness: .95 })); const g = new THREE.Group(); m.position.z = .01; g.add(m); return g; }
  function plaquinha() {
    const tx = A.canvasTex(64, 40, g => { g.fillStyle = '#8a6a2a'; g.fillRect(0, 0, 64, 40); g.fillStyle = '#d8b765'; for (let i = 0; i < 26; i++) { g.beginPath(); g.arc(6 + (i % 9) * 6.5 + (i % 2), 9 + Math.floor(i / 9) * 10, 1.6, 0, 7); g.fill(); } });
    const m = new THREE.Mesh(new THREE.BoxGeometry(.16, .1, .012), new THREE.MeshStandardMaterial({ map: tx, color: 0xc9a050, emissive: 0x3a2a08, emissiveIntensity: .5, metalness: .6, roughness: .35 }));
    const g = new THREE.Group(); m.position.z = .006; g.add(m); return g;
  }
  const ler = id => { textos(S()); A.lerNota(id); };

  // ------------------------------------------------------------------
  // jeitos de mostrar o texto: braile que vira letra, língua do P que se traduz, folha no espelho
  // ------------------------------------------------------------------
  function nosDeTexto(el) { const tw = document.createTreeWalker(el, NodeFilter.SHOW_TEXT), l = []; while (tw.nextNode()) l.push(tw.currentNode); return l; }
  function deBraileParaLetra(ms = 2200) {
    const el = $('#note p'); if (!el) return;
    const nos = nosDeTexto(el).map(n => ({ n, alvo: n.nodeValue }));
    const total = nos.reduce((s, x) => s + x.alvo.length, 0); if (!total) return;
    for (const x of nos) x.n.nodeValue = emBraile(x.alvo);
    if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) ms = 200;
    const t0 = performance.now();
    const passo = () => {
      const k = Math.min(1, (performance.now() - t0) / ms); let resta = Math.floor(total * k);
      for (const x of nos) { const q = Math.max(0, Math.min(x.alvo.length, resta)); x.n.nodeValue = x.alvo.slice(0, q) + emBraile(x.alvo.slice(q)); resta -= x.alvo.length; }
      if (k < 1 && document.body.contains(el)) requestAnimationFrame(passo);
    };
    requestAnimationFrame(passo);
  }
  function traduzir(el, novo, ms = 1800) {
    const velho = el.textContent; if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) ms = 150;
    const t0 = performance.now();
    const passo = () => {
      const k = Math.min(1, (performance.now() - t0) / ms), q = Math.floor(novo.length * k);
      el.textContent = novo.slice(0, q) + velho.slice(q, Math.max(q, velho.length * (1 - k) | 0));
      if (k < 1) requestAnimationFrame(passo); else el.textContent = novo;
    };
    requestAnimationFrame(passo);
  }
  const notaAberta = titulo => { const n = $('#note'); return n && !n.hidden && $('#note h2') && $('#note h2').textContent === titulo; };
  function lerBilhete(id) {
    const n = nota(id); ler(id); achar('bilhete');
    const St = S(); if (!n.traducao || (St.flags.l4trad || {})[id]) return;
    setTimeout(() => {
      if (!notaAberta(n.titulo)) return;
      St.flags.l4trad = St.flags.l4trad || {}; St.flags.l4trad[id] = true;
      if (n.recusa) { fala(L.bilhete.recusa); return; }
      const p = $('#note p'); if (p) traduzir(p, n.traducao);
      if (!St.flags.l4lembraP) { St.flags.l4lembraP = true; fala(L.bilhete.lembra); }
      textos(St);
    }, 3000);
  }
  const espelhado = t => String(t).split('\n').map(l => [...l].reverse().join('')).join('\n');

  // ------------------------------------------------------------------
  // embrulhos dos mapas (o último a montar: tudo do mapa já existe)
  // ------------------------------------------------------------------
  const embrulhar = (id, depois) => {
    const orig = MAPAS[id]; if (!orig) return;
    MAPAS[id] = (A_, St) => { const def = orig(A_, St); usadas.length = 0; seguro(id, () => depois(St, def)); seguro('fita5', () => fita5(St, def)); return def; };
  };

  // ---- fita 5: depois de três segredos numa noite, ela aparece no começo do próximo mapa
  function fita5(St, def) {
    if (!St.flags.l4f5 || St.flags.l4f5de === A.W.mapa || A.W.mapa === 'estrada') return;
    if (St.fitas.l4_cinco && St.flags.l4f5 !== 'posta') return;
    const sp = (def.spawns && (def.spawns.inicio || Object.values(def.spawns)[0])) || { x: 0, z: 0, yaw: 0 };
    const p = { x: sp.x - Math.sin(sp.yaw || 0) * 1.4, y: .02, z: sp.z - Math.cos(sp.yaw || 0) * 1.4 };
    A.ITENS.gravador('l4_cinco', p);
    if (St.flags.l4f5 === 'pendente') { St.flags.l4f5 = 'posta'; setTimeout(() => { if (S() === St) c.toast(L.fita5.aviso); }, 3500); }
  }

  // ================================================================== PRÓLOGO
  let carro = null, joaquimObj = null;
  embrulhar('estrada', (St) => {
    // a lista de chamada do ônibus ganha uma 38ª linha com o seu nome
    const nm = nomeJogador(), ch = nota('e_chamada');
    if (nm && ch && !ch.texto.includes('38ª linha')) ch.texto += L.chamadaNome.replace('{nome}', nm);
    carro = { sentada: false, t: 0, tent: 0, prog: 0, fim: false };
    // o carro: entrar de novo, girar a chave
    const pode = () => St.chapter === 0 && St.done.lanterna && !St.done.abrir_portao && !carro.fim;
    const porta = new THREE.Mesh(new THREE.BoxGeometry(.1, .9, 1.4), invisivel());
    coisa(porta, { x: .66, y: .95, z: 9.7 }, () => `<b>E</b>${L.carro.entrar}`, () => sentar(St), { on: () => pode() && !carro.sentada });
    const volante = new THREE.Mesh(new THREE.BoxGeometry(.6, .4, .12), invisivel());
    coisa(volante, { x: 1.15, y: 1.0, z: 8.95 }, () => `<b>E</b>${L.carro.chave}${carro.tent ? ` (${carro.tent}ª tentativa foi)` : ''}`, () => partida(St), { on: () => carro.sentada && !carro.fim, hold: 1.4, ruido: 6 });
    // carta do Davi adulto, para quem achou tudo, presa no limpador do para-brisa
    if (mem().cartaPendente) {
      const it = A.ITENS.nota('l4_cartaAdulto', { x: 1.3, y: 1.0, z: 7.95 });
      const o = it.act; it.act = () => { o(); guardar(m => { m.cartaPendente = false; }); };
    }
    // Seu Joaquim: a conversa continua (e perde a paciência), apressada igual o irmão, luz na cara
    const itJ = A.W.inter.find(i => { try { return /Falar com/.test(i.label()); } catch (e) { return false; } });
    if (itJ) {
      joaquimObj = itJ.obj; const orig = itJ.act;
      itJ.act = () => {
        const St2 = S();
        if (!St2.done.posto) {
          const d = R.dialogos.joaquim, ant = d[0];
          if (St2.flags.l4saiuT != null && St2.tempo - St2.flags.l4saiuT < 60 && L.joaquim.apressada) d[0] = L.joaquim.apressada;
          try { orig(); } finally { d[0] = ant; }
          return;
        }
        if (St2.flags.l4prosaFim) return orig();
        const n = St2.flags.l4prosa = (St2.flags.l4prosa || 0) + 1;
        if (n <= L.joaquim.extras.length) { A.dialogo([L.joaquim.extras[n - 1]]); return; }
        St2.flags.l4prosaFim = true;
        A.dialogo(L.joaquim.historia, () => {
          if (!St2.flags.temFumo && !St2.flags.fumoDeixado) { St2.flags.temFumo = true; c.toast('Fumo de corda guardado.'); }
          conq('prosa_comprida'); achar('prosa'); anotar('prosa');
        });
      };
    }
    // a gaveta da caixa registradora: a chavinha A.T. 1980
    const pc = livre('posto', ['mesa', 'prateleira']);
    const caixa = grupo([.32, .16, .26, mat(0x3a3a34, 0x101010, .3), 0, .08, 0], [.26, .1, .04, mat(0x6a6a5a), 0, .2, -.08], [.3, .04, .22, mat(0x2a2a24), 0, .02, .02]);
    coisa(caixa, { x: pc.x, y: pc.y, z: pc.z }, () => St.flags.l4caixa ? 'A gaveta da caixa registradora, aberta.' : `<b>E</b>${L.caixa.rotulo}`, () => {
      if (St.flags.l4caixa) return;
      St.flags.l4caixa = true; A.SFX.trancado(); A.emitNoise(pc.x, pc.z, 4);
      St.inv.chaves.l4AT = 'Chave A.T. 1980'; c.toast(L.caixa.chave); achar('caixaAT');
    });
    // a caixa de sapatos: uma carta do Joaquim por noite, para quem vier depois das nove
    const ps = livre('posto', ['prateleira', 'mesa', 'chao']);
    const sapatos = grupo([.34, .14, .2, mat(0x6a4a2a, 0x1a1008, .4), 0, .07, 0], [.3, .02, .16, A.MAT.papel, 0, .145, 0]);
    coisa(sapatos, { x: ps.x, y: ps.y, z: ps.z }, () => `<b>E</b>${St.notes.l4_cartaJ ? 'Ler de novo a carta do Joaquim' : L.sapatos.rotulo}`, () => {
      const nova = !St.notes.l4_cartaJ; ler('l4_cartaJ'); achar('cartaJ'); if (!nova) c.toast(L.sapatos.lido);
    });
  });
  function sentar(St) {
    if (!carro || carro.sentada) return;
    carro.sentada = true; carro.t = 0; carro.prog = 0; c.P.crouch = true; c.P.pos.set(1.15, 0, 9.75); c.P.yaw = 0;
    A.SFX.clique(); c.toast(L.carro.dicaSentada); falarLinhas(L.carro.sentou); anotar('carro');
  }
  function sairCarro(St, fala_) {
    if (!carro || !carro.sentada) return;
    carro.sentada = false; c.P.pos.set(-.25, 0, 9.7); c.P.crouch = false; A.SFX.clique();
    if (fala_) fala(fala_);
  }
  function partida(St) {
    if (!carro || !carro.sentada || carro.fim) return;
    carro.tent++; anotar('partida'); A.emitNoise(1.6, 9.6, 16); St.fear = Math.min(100, (St.fear || 0) + 6);
    A.SFX.motor(true);
    if (carro.tent < 9) { setTimeout(() => A.SFX.motor(false), 700 + carro.tent * 60); c.sub('lia', L.carro.tentativas[carro.tent - 1] || '...'); return; }
    carro.fim = true; fala(L.carro.pegou);
    setTimeout(() => finalCarro(St), 2400);
  }
  function finalCarro(St) {
    if (S() !== St) { A.SFX.motor(false); return; }
    St.fim = true; try { document.exitPointerLock && document.exitPointerLock(); } catch (e) {}
    try { localStorage.removeItem('hora-silencio-v3'); localStorage.removeItem('hora-silencio-v3-auto'); } catch (e) {} // quem foi embora não tem o que continuar
    conq('nao_entrei'); achar('naoEntrei');
    guardar(m => { m.foiEmbora = true; m.atual = Object.assign(m.atual || {}, { final: 'carro' }); });
    telaSecreta(L.carro.final, St.tempo || 0, () => A.SFX.motor(false));
  }
  function telaSecreta(F, tempo, aoFechar) {
    const fx = $('#fx-black'); if (fx) fx.style.opacity = 1;
    const ov = document.createElement('div'); ov.id = 'l4-fim'; ov.setAttribute('role', 'dialog'); ov.setAttribute('aria-label', F.titulo);
    const pars = F.texto.split('\n\n'), mm = Math.floor(tempo / 60), ss = String(Math.floor(tempo % 60)).padStart(2, '0');
    ov.innerHTML = `<div class="cx"><h1></h1>${pars.map((p, i) => `<p style="animation-delay:${1.6 + i * 1.6}s"></p>`).join('')}<small style="animation-delay:${2 + pars.length * 1.6}s"></small><button class="btn" style="animation-delay:${2.5 + pars.length * 1.6}s"></button></div>`;
    ov.querySelector('h1').textContent = F.titulo;
    ov.querySelectorAll('p').forEach((p, i) => { p.textContent = pars[i]; });
    ov.querySelector('small').textContent = F.tempo.replace('{t}', `${mm}min ${ss}s`);
    const b = ov.querySelector('button'); b.textContent = F.botao;
    document.body.appendChild(ov);
    setTimeout(() => { try { A.SFX.sussurros(1.2); } catch (e) {} }, (1.6 + 3 * 1.6) * 1000);
    const fechar = () => { removeEventListener('keydown', tecla, true); ov.remove(); if (aoFechar) aoFechar(); const m = $('#e-menu'); if (m) m.click(); };
    const tecla = e => { e.stopImmediatePropagation(); if (['Enter', 'Escape', 'NumpadEnter', 'Space'].includes(e.code) && performance.now() - t0 > 2500) fechar(); };
    const t0 = performance.now();
    addEventListener('keydown', tecla, true); b.onclick = fechar;
  }

  // ================================================================== TÉRREO
  // plaquinhas em braile do Moacir: de joelhos, no escuro, segurando E
  function braile(St, id, p, cond) {
    const pl = plaquinha();
    const noEscuro = () => c.P.crouch && !St.flashOn;
    const it = coisa(pl, p, () => noEscuro() ? `<b>E</b>${L.braile.ler}` : L.braile.rotulo, () => {
      if (!noEscuro()) { c.toast(L.braile.dica); return; }
      St.flags['l4' + id] = true; A.lerNota('l4_' + id); setTimeout(deBraileParaLetra, 30); achar(id); anotar('braile');
      if (id === 'braile3') { falarLinhas(L.braile.terceira); conq('dedos'); } else if (!St.flags.l4braileFala) { St.flags.l4braileFala = true; falarLinhas(L.braile.lia); }
    }, cond ? { on: cond } : {});
    segura(it, () => noEscuro() ? 2 : 0);
    if (cond) A.W.tick.push(() => { pl.visible = cond(); });
    return it;
  }
  let lousaCastigo = null, ultRaio = -1e9, clarDito = false, forno = null;
  embrulhar('terreo', (St) => {
    braile(St, 'braile1', naParede('maq', 'o', .2, 1.05));
    // a gaveta do Davi: cadeado de quatro números (a idade dos dois naquela noite)
    const pg = livre('aula', ['mesa']);
    const gav = grupo([.36, .08, .26, mat(0x5a3e24, 0x140c04, .4), 0, .04, 0]);
    const tg = quadro(.2, .08, [{ t: 'D.M.', tam: 70 }], { w: 256, h: 100, fundo: '#4a3420', cor: '#c9b48a', manchas: 2 }); tg.rotation.x = -Math.PI / 2; tg.position.y = .085; gav.add(tg);
    coisa(gav, pg, () => St.flags.l4gaveta ? '<b>E</b>Ler de novo o bilhete da gaveta D.M.' : `<b>E</b>${L.gaveta.rotulo}`, () => {
      if (St.flags.l4gaveta) { A.lerNota('l4_gaveta'); return; }
      let disse = false;
      A.abrirTeclado(L.gaveta.titulo, '1214', () => {
        St.flags.l4gaveta = true; St.inv.kits++; A.SFX.trancado(); A.lerNota('l4_gaveta'); c.toast('Um curativo guardado. H para usar.');
        conq('irmao_velho'); achar('gaveta');
      }, () => { if (!disse) { disse = true; c.toast(L.gaveta.erro); } });
    });
    // a chamada na lousa: risquinhos de giz, um por morte de todas as noites
    const pl = naParede('aula', 'n', .7, 1.5);
    const lousa = quadro(1.6, .9, [{ t: 'CHAMADA', tam: 46 }, { t: 'ANA · BENTO · DAVI · JOÃO', tam: 30 }, { t: 'LUIZ · MARIA · ROSA · TOMÉ', tam: 30 }, { t: 'LIA M. — ', tam: 30 }], { w: 512, h: 288, fundo: '#1f2b22', cor: '#d8dccf', fonte: '"Special Elite", monospace', manchas: 8 });
    coisa(lousa, pl, () => `<b>E</b>${L.lousa.rotulo}`, () => {
      const total = (mem().mortesTotal || 0);
      let t = MD.lousaCab + '\n' + MD.lousaNomes + '\n';
      if (St.mortes === 0) { t += MD.lousaZero; if (!St.flags.l4presente) { St.flags.l4presente = true; conq('presente'); achar('presente'); } }
      else {
        const g = Math.min(total, 60), cinco = Math.floor(g / 5), resto = g % 5;
        const marcas = Array(cinco).fill('~IIII~').join(' ') + (resto ? ' ' + 'I'.repeat(resto) : '') + (total > 60 ? ` +${total - 60}` : '');
        t += MD.lousaLia.replace('{marcas}', marcas.trim()) + '\n' + MD.lousaRodape.replace('{n}', total);
      }
      St.flags.l4lousaTxt = t; ler('l4_lousa');
    });
    // a lousa do castigo: uma linha de giz molhado só aparece no clarão do relâmpago
    const pc = naParede('aula', 's', .35, 1.5);
    lousaCastigo = quadro(1.6, .9, Array(6).fill(0).map(() => ({ t: 'NÃO FALAREI NA HORA', tam: 26 })), { w: 512, h: 288, fundo: '#1f2b22', cor: '#cfd3c6', fonte: '"Special Elite", monospace', manchas: 10 });
    coisa(lousaCastigo, pc, () => `<b>E</b>${L.castigo.rotulo}`, () => {
      const semClarao = OPT().vFlash === 0; // sem relâmpago na tela: basta a lanterna apagada (o trovão avisa)
      if (!St.flashOn && (semClarao || performance.now() - ultRaio < 2600)) {
        A.lerNota('l4_castigo');
        if (!St.flags.l4castigo) { St.flags.l4castigo = true; conq('giz_molhado'); achar('castigo'); }
      } else c.toast(L.castigo.nada);
    });
    // a pasta da professora: o que cada um queria ser
    const pp = livre('aula', ['mesa', 'prateleira']);
    coisa(caderno(0x4a5a3a), pp, () => `<b>E</b>${L.pasta.rotulo}`, () => { A.lerNota('l4_redacoes'); conq('quando_crescer'); achar('redacoes'); });
    // biblioteca: a ficha de empréstimo do Davi, sem devolução
    const pb = livre('biblio', ['prateleira', 'mesa']);
    coisa(grupo([.16, .22, .04, mat(0x5a1a1a, 0x1a0505, .4), 0, .11, 0]), pb, () => `<b>E</b>${St.flags.l4ficha ? 'Ler de novo a ficha de Contos para Dormir' : L.livro.rotulo}`, () => {
      St.flags.l4ficha = true; A.SFX.papel(); A.lerNota('l4_ficha'); achar('ficha');
    });
    // diretoria: a carta retida mais nova, escrita com a sua noite anterior
    if (mem().anterior) {
      const pr = livre('diret', ['mesa', 'prateleira']);
      coisa(papel(), pr, () => `<b>E</b>${L.retida.rotulo}`, () => ler('l4_retida'));
    }
    // cozinha: o bolo de doze velas no forno frio
    const pf = livre('cozinha', ['chao', 'mesa']);
    forno = { estado: 0, velas: [] };
    const fg = grupo([.7, .6, .6, mat(0x2a2a28, 0x080808, .3), 0, .3, 0], [.5, .05, .02, mat(0x8a8a80), 0, .5, .31]);
    const bolo = grupo([.3, .1, .3, mat(0x6a4a2a, 0x201008, .4), 0, .66, 0], [.31, .02, .31, mat(0xd8cfb8, 0x302a20, .4), 0, .72, 0]);
    for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2, v = A.box(.012, .06, .012, mat(0xd8d0c0), Math.cos(a) * .1, .76, Math.sin(a) * .1, bolo, false); const ch = A.box(.014, .022, .014, new THREE.MeshBasicMaterial({ color: 0xffb040 }), Math.cos(a) * .1, .8, Math.sin(a) * .1, bolo, false); ch.visible = false; forno.velas.push(ch); }
    bolo.visible = false; fg.add(bolo);
    const itF = coisa(fg, { x: pf.x, y: 0, z: pf.z }, () => [`<b>E</b>${L.bolo.forno}`, `<b>E</b>${L.bolo.acender}`, `<b>E</b>${L.bolo.soprar}`, 'Doze velinhas apagadas. Fumaça fina.'][forno.estado], () => {
      if (forno.estado === 0) { forno.estado = 1; bolo.visible = true; A.SFX.rangido && A.SFX.rangido(); c.toast(L.bolo.achou); }
      else if (forno.estado === 1) { forno.estado = 2; forno.velas.forEach(v => { v.visible = true; }); }
      else if (forno.estado === 2) {
        forno.estado = 3; forno.velas.forEach(v => { v.visible = false; }); A.SFX.sussurros(2.5);
        falarLinhas(L.bolo.cantam); conq('o_pedido'); achar('bolo'); anotar('bolo');
      }
    });
    segura(itF, () => forno.estado === 1 ? 3 : 0); itF.ruido = 3;
    // casa de máquinas: a planta antiga e o caderno do zelador
    const pm1 = livre('maq', ['mesa', 'prateleira', 'chao']), pm2 = livre('maq', ['prateleira', 'mesa', 'chao']);
    coisa(grupo([.5, .06, .06, mat(0xc8b890, 0x302a18, .3), 0, .03, 0]), pm1, () => `<b>E</b>${L.planta.rotulo}`, () => { A.SFX.papel(); A.lerNota('l4_planta'); achar('planta'); });
    coisa(caderno(0x3a3020), pm2, () => `<b>E</b>${L.zelador.rotulo}`, () => { A.lerNota('l4_zelador'); achar('zelador'); });
    // recepção: a placa de bronze com o nome raspado (só de perto e com luz)
    const ph = naParede('hall', 'n', .8, 1.6);
    const placa = quadro(.7, .45, [{ t: 'INTERNATO', tam: 34 }, { t: 'SÃO LÁZARO', tam: 34 }, { t: '1931', tam: 30 }], { w: 256, h: 160, fundo: '#5a4520', cor: '#c9a65a', manchas: 4 });
    coisa(placa, ph, () => `<b>E</b>${L.placa.rotulo}`, () => {
      const v = new THREE.Vector3(); placa.getWorldPosition(v);
      if (St.flashOn && v.distanceTo(A.camera.position) < 1.5) { A.lerNota('l4_placa'); achar('placa'); } else c.toast(L.placa.gasta);
    });
    // primeiro bilhete na língua do P, no balcão da recepção
    const pbt = livre('hall', ['mesa', 'chao']);
    coisa(papel(), pbt, () => `<b>E</b>${L.bilhete.rotulo}`, () => lerBilhete('l4_bilheteP1'));
  });

  // ================================================================== ANDAR DE CIMA
  let escAT = 0, folhaLida = false;
  embrulhar('superior', (St) => {
    braile(St, 'braile2', naParede('patamar', 'o', .5, 1.0));
    // a carta debaixo do colchão D.M.: responde depois
    const pa = livre('dormA', ['cama', 'chao']);
    coisa(papel(), pa, () => `<b>E</b>${L.colchao.rotulo}`, () => {
      const responde = St.flags.l4colT != null && (St.done.ana || St.tempo - St.flags.l4colT > 90);
      if (St.flags.l4colT == null) St.flags.l4colT = St.tempo;
      if (responde && St.flags.l4colResp == null) { St.flags.l4colResp = St.mortes === 0 ? 0 : St.mortes <= 3 ? 1 : 2; achar('colchao'); }
      ler('l4_colchao');
    });
    // a carta-corrente: copiar nove vezes, ou ela te segue até o carro
    const pbB = livre('dormB', ['cama', 'mesa', 'chao']);
    const itC = coisa(papel(), pbB, () => !St.notes.l4_corrente || St.flags.l4corrente ? `<b>E</b>${L.corrente.rotulo}` : `<b>E</b>${L.corrente.copiar}`, () => {
      if (!St.notes.l4_corrente || St.flags.l4corrente) { ler('l4_corrente'); return; }
      St.flags.l4corrente = true; A.SFX.caneta(); c.toast(L.corrente.copiou); achar('corrente'); anotar('corrente'); textos(St);
    });
    segura(itC, () => St.notes.l4_corrente && !St.flags.l4corrente ? 4.5 : 0); itC.ruido = 3; itC.som = 'caneta';
    // a folha escrita ao contrário (dormitório C) e o espelho do banheiro
    const pc = livre('dormC', ['cama', 'mesa', 'chao']);
    A.item('l4folha', pc, papel(), L.espelho.pegar, () => { St.flags.l4folha = true; ler('l4_espelho'); fala(L.espelho.lia); });
    const pe = naParede('banhS', 'n', .5, 1.5);
    const vidro = new THREE.Mesh(new THREE.PlaneGeometry(.6, .8), new THREE.MeshStandardMaterial({ color: 0x8a9aa0, metalness: .9, roughness: .15, emissive: 0x101418, emissiveIntensity: .4 }));
    const gv = new THREE.Group(); vidro.position.z = .012; gv.add(vidro);
    coisa(gv, pe, () => `<b>E</b>${L.espelho.ler}`, () => {
      St.flags.l4espLido = true; ler('l4_espelho');
      const p = $('#note p'); if (p) { p.classList.add('l4-espelho'); void p.offsetWidth; p.classList.add('l4-desvira'); requestAnimationFrame(() => p.classList.remove('l4-espelho')); setTimeout(() => p.classList.remove('l4-desvira'), 1300); }
      fala(L.espelho.desvira); if (!folhaLida) { folhaLida = true; conq('espelho'); achar('espelho'); }
    }, { on: () => !!St.flags.l4folha });
    // o diário de cadeadinho da Ana (sala de brinquedos): forçar com grampo faz estalinhos
    const pd = livre('brinq', ['prateleira', 'mesa', 'chao']);
    const itA = coisa(grupo([.16, .04, .2, mat(0xc87a9a, 0x301018, .5), 0, .02, 0], [.03, .03, .02, mat(0xd8c060, 0x302000, .5), .08, .03, 0]), pd,
      () => St.notes.l4_ana ? '<b>E</b>Ler de novo o diário da Ana' : `<b>E</b>${L.cadeado.rotulo}`, () => {
        A.lerNota('l4_ana'); if (!St.flags.l4ana) { St.flags.l4ana = true; conq('ate_dez'); achar('ana'); }
      });
    segura(itA, () => St.notes.l4_ana ? 0 : 4); itA.ruido = 5; itA.som = 'tique';
    // o caderno do monitor (rouparia): a sua linha, com a tinta ainda molhada
    const pr = livre('roup', ['mesa', 'prateleira', 'chao']);
    coisa(caderno(0x2a2a3a), pr, () => `<b>E</b>${L.monitor.rotulo}`, () => {
      const sl = (c.P.room && c.P.room.nome) || 'rouparia';
      if (!St.flags.l4mon) St.flags.l4mon = { h: hora(St), sala: sl.toLowerCase(), t: St.tempo };
      const mo = St.flags.l4mon;
      if (!mo.h2 && St.tempo - mo.t > 45) { mo.h2 = hora(St); achar('monitor'); }
      ler('l4_monitor'); A.SFX.caneta(.4);
    });
    // o radinho de galena (dormitório D): pega a noite de hoje, com a sua voz
    const pg = livre('dormD', ['chao', 'cama', 'mesa']);
    const itG = coisa(grupo([.08, .1, .08, mat(0x8a8a80, 0x202020, .4), 0, .05, 0], [.005, .2, .005, mat(0xb07040), .05, .1, 0]), pg, () => `<b>E</b>${L.galena.rotulo}`, () => {
      A.SFX.estatica(3, { x: pg.x, y: .2, z: pg.z }); falarLinhas(L.galena.falas);
      if (!St.flags.l4galena) { St.flags.l4galena = true; conq('galena'); achar('galena'); }
    });
    segura(itG, () => 2.2); itG.ruido = 2;
    // o caderno de perguntas das meninas (dormitório E, no caminho da engrenagem)
    const pq = livre('dormE', ['cama', 'mesa', 'chao']);
    coisa(caderno(0x9a5a7a), pq, () => `<b>E</b>${St.flags.l4medo ? 'Ler o caderno de perguntas' : L.perguntas.rotulo}`, () => abrirPerguntas(St));
    // o gibi do Davi (depósito, junto do monta-cargas)
    const pgb = livre('sotao', ['prateleira', 'mesa', 'chao']);
    coisa(caderno(0xc8a030), pgb, () => `<b>E</b>${L.gibi.rotulo}`, () => { A.lerNota('l4_gibi'); achar('gibi'); });
    // bilhetes na língua do P: corredor e sala de brinquedos
    const pb2 = livre('corr', ['chao', 'mesa']), pb3 = livre('brinq', ['chao', 'mesa', 'prateleira']);
    coisa(papel(), pb2, () => `<b>E</b>${L.bilhete.rotulo}`, () => lerBilhete('l4_bilheteP2'));
    coisa(papel(), pb3, () => `<b>E</b>${L.bilhete.rotulo}`, () => lerBilhete('l4_bilheteP3'));
  });
  // perguntas: responder com 1 a 4 (ou tocando na resposta)
  function abrirPerguntas(St) {
    const r = St.flags.l4medo;
    ler('l4_perguntas');
    if (r) return;
    const p = $('#note p'); if (!p) return;
    const box = document.createElement('div'); box.className = 'l4-op';
    L.perguntas.opcoes.forEach((o, i) => { const b = document.createElement('button'); b.type = 'button'; b.textContent = `${i + 1}. ${o}`; b.addEventListener('click', e => { e.stopPropagation(); responder(St, i + 1); }); box.appendChild(b); });
    p.appendChild(box);
    const sm = $('#note small'); if (sm) sm.textContent = L.perguntas.dica + ' · ' + sm.textContent;
  }
  function responder(St, i) {
    if (St.flags.l4medo) return;
    St.flags.l4medo = i; A.SFX.caneta(); fala(L.perguntas.respondeu); achar('perguntas');
    const p = $('#note p'); if (p) { const b = p.querySelector('.l4-op'); if (b) b.remove(); p.insertAdjacentHTML('beforeend', `\n<span class="mao">${L.perguntas.opcoes[i - 1]}.</span>`); }
  }
  addEventListener('keydown', e => {
    const m = /^(Digit|Numpad)([1-4])$/.exec(e.code); if (!m) return;
    const St = S(), n = nota('l4_perguntas'); if (!St || !n || St.flags.l4medo || !notaAberta(n.titulo)) return;
    e.stopImmediatePropagation(); responder(St, +m[2]);
  }, true);

  // ================================================================== TÚNEIS
  embrulhar('tuneis', (St) => {
    braile(St, 'braile3', naParede('t4', 'o', .5, 1.15), () => !!(St.flags.l4braile1 && St.flags.l4braile2));
    // a carta-corrente não copiada vai junto (aparece no carro na próxima noite)
    if (St.notes.l4_corrente && !St.flags.l4corrente) guardar(m => { m.corrente = true; });
    // o tijolo L.M. na galeria oeste: a fita dos catorze anos
    const pt = naParede('t6', 'n', .45, 1.1);
    const tj = grupo([.26, .09, .1, mat(0x7a3a24, 0x200a04, .4), 0, 0, .05]);
    const tl = quadro(.2, .07, [{ t: 'L.M.', tam: 60 }], { w: 128, h: 48, fundo: '#6a3420', cor: '#e0c8a0', manchas: 1 }); tl.position.z = .1; tj.add(tl);
    const itT = coisa(tj, pt, () => St.flags.l4tijolo ? '<b>E</b>Ouvir de novo a fita atrás do tijolo' : `<b>E</b>${L.tijolo.rotulo}`, () => {
      if (!St.flags.l4tijolo) { St.flags.l4tijolo = true; tj.position.add(new THREE.Vector3(Math.sin(pt.ry || 0) * .12, -.02, Math.cos(pt.ry || 0) * .12)); }
      A.tocarFita('l4_festa');
    });
    segura(itT, () => St.flags.l4tijolo ? 0 : 1.5); itT.ruido = 4;
    // o pacto a carvão no depósito
    const pp = naParede('dep', 'n', .5, 1.4);
    const pacto = quadro(1.4, .7, [{ t: 'QUEM SAIR VOLTA', tam: 40 }, { t: 'PRA BUSCAR OS OUTROS', tam: 40 }, { t: 'DAVI · TOMÉ · BENTO', tam: 34 }], { w: 512, h: 256, fundo: '#4a2c20', cor: '#1a1410', fonte: 'Georgia', manchas: 6 });
    coisa(pacto, pp, () => `<b>E</b>${L.pacto.rotulo}`, () => { St.flags.l4pacto = true; A.lerNota('l4_pacto'); achar('pacto'); });
  });

  // ================================================================== CEMITÉRIO E CAPELA
  let figJ = null;
  const portaoBase = R.falas.joaquim_portao;
  embrulhar('cemiterio', (St) => {
    // a cápsula do tempo, ao lado de uma cruz sem nome (canto nordeste)
    const cx = 26.8, cz = -43.6;
    A.box(.06, .8, .06, A.MAT.madeira, cx, .4, cz - .5); A.box(.4, .06, .06, A.MAT.madeira, cx, .62, cz - .5);
    const monte = grupo([.9, .14, .7, mat(0x2a2016, 0x050302, .2), 0, .07, 0]);
    const lata = grupo([.28, .1, .2, mat(0x8a3a2a, 0x200a04, .4), 0, .18, 0]); lata.visible = !!St.flags.l4capsula; monte.add(lata);
    const itCap = coisa(monte, { x: cx, y: 0, z: cz }, () => St.flags.l4capsula ? '<b>E</b>Reler as cartas da lata' : St.inv.pa ? `<b>E</b>${L.capsula.rotulo}` : 'Terra fofa ao lado de uma cruz sem nome.', () => {
      if (!St.flags.l4capsula && !St.inv.pa) { c.toast(L.capsula.semPa); return; }
      if (!St.flags.l4capsula) { St.flags.l4capsula = true; lata.visible = true; c.toast(L.capsula.lata); conq('abrir_1994'); achar('capsula'); }
      const md = MD, cartas = md.capsula.replace('{medo}', md.capsulaMedo[St.flashOn ? 0 : 1]).replace('{respondeu}', md.capsulaResp[St.flags.respondeu ? 1 : 0]).replace('{mortes}', St.mortes ? md.capsulaMortes[1].replace('{n}', St.mortes) : md.capsulaMortes[0]);
      if (!St.flags.l4capTxt) St.flags.l4capTxt = cartas;
      setTimeout(() => ler('l4_capsula'), St.flags.l4capsulaLida ? 0 : 900); St.flags.l4capsulaLida = true;
    });
    segura(itCap, () => !St.flags.l4capsula && St.inv.pa ? 4 : 0); itCap.ruido = 10; itCap.som = 'cavar';
    // a cruz J. S. — 1979 (em algumas noites, o Seu Joaquim está de pé ao lado dela)
    const jx = -27.2, jz = 4.5;
    const cruz = grupo([.07, .9, .07, A.MAT.madeira, 0, .45, 0], [.44, .07, .07, A.MAT.madeira, 0, .68, 0]);
    coisa(cruz, { x: jx, y: 0, z: jz }, () => `<b>E</b>${L.cruzJ.rotulo}`, () => { c.toast(L.cruzJ.texto); achar('cruzJ'); });
    figJ = null;
    if (noiteN() % 3 === 0 && !St.flags.sino) {
      const capa = mat(0x2a2a26, 0x000000, 0), g = new THREE.Group();
      A.cyl(.22, .3, 1.5, capa, 0, .75, 0, 8, g); A.cyl(.13, .13, .22, mat(0x8a7a6a), 0, 1.62, 0, 8, g); A.cyl(.3, .3, .04, capa, 0, 1.76, 0, 10, g); A.cyl(.14, .15, .14, capa, 0, 1.84, 0, 10, g);
      g.position.set(jx + .9, 0, jz + .3); g.rotation.y = Math.PI / 2; A.W.grupo.add(g); figJ = g;
    }
    // capela: o banco da última fileira com as suas iniciais
    const banco = grupo([2.2, .07, .42, A.MAT.madeiraEsc, 0, .46, 0], [2.2, .5, .05, A.MAT.madeiraEsc, 0, .72, .2], [.06, .44, .38, A.MAT.madeiraEsc, -1.02, .22, 0], [.06, .44, .38, A.MAT.madeiraEsc, 1.02, .22, 0]);
    coisa(banco, { x: -5.2, y: 0, z: -50.3 }, () => `<b>E</b>${L.banco.rotulo}`, () => {
      const v = new THREE.Vector3(); banco.getWorldPosition(v); v.y = .7;
      if (St.flashOn && v.distanceTo(A.camera.position) < 2) { A.lerNota('l4_banco'); fala(L.banco.lia); if (!St.flags.l4banco) { St.flags.l4banco = true; conq('ja_estive'); achar('banco'); } }
      else c.toast(L.banco.escuro);
    });
    // capela: o armário trancado por fora (a chavinha A.T. 1980, do posto)
    const pa = naParede('capela', 'o', .3, 0);
    const arm = new THREE.Group(); A.box(.5, 2, .9, A.MAT.madeiraEsc, 0, 1, 0, arm, false);
    const pf = A.box(.03, 1.9, .84, A.MAT.madeira, .26, 1, 0, arm, false);
    coisa(arm, { x: pa.x + .25, y: 0, z: pa.z }, () => St.flags.l4albano ? '<b>E</b>Ler de novo a última página do diretor' : St.inv.chaves.l4AT ? `<b>E</b>${L.albano.abrir}` : L.albano.trancado, () => {
      if (!St.inv.chaves.l4AT) { A.SFX.trancado(); c.toast('Trancado. Por fora.'); return; }
      if (!St.flags.l4albano) { St.flags.l4albano = true; pf.rotation.y = -1.2; pf.position.x = .55; pf.position.z = .35; A.SFX.trancado(); conq('trancado_fora'); achar('albano'); }
      A.lerNota('l4_albano');
    });
  });

  // ------------------------------------------------------------------
  // teclados: o cofre conhece datas da Lia (nada disso abre o cofre)
  // ------------------------------------------------------------------
  function codigo(cofre, dig, marca) {
    const St = S(); if (!St || !cofre) return false;
    if (St.code && dig === St.code.join('')) return false; // o código de verdade sempre abre
    const K = L.cofre, d = new Date(), hoje = String(d.getDate()).padStart(2, '0') + String(d.getMonth() + 1).padStart(2, '0');
    const disp = (t, ms = 2200) => setTimeout(() => { const el = $('#k-disp'); if (!el || $('#keypad').hidden) return; const v = el.textContent; el.textContent = t; el.classList.add('h3-conta'); setTimeout(() => { el.classList.remove('h3-conta'); if (el.textContent === t) el.textContent = v; }, ms); }, 0);
    if (dig === '1503') {
      marca('1503'); disp(K.c1503.disp, 2600); fala(K.c1503.fala); anotar('cofre');
      if (!St.flags.l4c1503) { St.flags.l4c1503 = true; St.inv.kits++; setTimeout(() => c.toast(K.c1503.toast), 600); conq('quatorze_cofre'); achar('cofre1503'); }
      return true;
    }
    if (dig === '1234') { marca('1234'); fala(K.c1234); return true; }
    if (dig === '9999') { marca('9999'); try { A.SFX.sinoLonge(); } catch (e) {} setTimeout(() => fala(K.c9999), 1200); return true; }
    if (dig === [...hoje].reverse().join('') && dig !== hoje) { marca('inverso'); fala(K.inverso); return true; }
    return false;
  }

  // ------------------------------------------------------------------
  // começo da noite: contador, a noite anterior vira lembrança, abertura que lembra de você
  // ------------------------------------------------------------------
  const regrasBase = R.regras.verso;
  function aoComecar(St) {
    const m = guardar(x => { x.noites = (x.noites || 0) + 1; if (x.atual && Object.keys(x.atual).length) x.anterior = x.atual; x.atual = { capMortes: {}, mortes: 0, escondida: 0 }; });
    ultS = null;
    R.falas.joaquim_portao = portaoBase;
    // regra 8: no Pesadelo é das crianças; depois do final verdadeiro, pode ser a sua
    if (St.dif === 'pesadelo') { R.regras.verso = regrasBase + L.regra8Pesadelo; St.flags.l4regra8 = 'pesadelo'; }
    else if (m.regra8) R.regras.verso = regrasBase + L.regra8Jogador.replace('{r}', m.regra8);
    else R.regras.verso = regrasBase;
    // a abertura no carro lembra das outras noites
    const extra = [];
    if (m.foiEmbora) { extra.push(L.carro.volta); guardar(x => { x.foiEmbora = false; }); }
    if (m.corrente) { extra.push(L.corrente.ignorou); guardar(x => { x.corrente = false; }); }
    if (m.cartaPendente) extra.push(L.cartaAdulto);
    if (m.cartaDavi) {
      const t = semAcento(m.cartaDavi).toLowerCase(), Rp = L.carta.respostas;
      const k = /desculp|perdao/.test(t) ? 'desculpa' : /saudade|falta/.test(t) ? 'saudade' : /\bmae\b|mamae/.test(t) ? 'mae' : /medo/.test(t) ? 'medo' : /volt/.test(t) ? 'voltar' : 'outra';
      extra.push({ t: 20.6, quem: 'davi', texto: Rp[k] }); guardar(x => { x.cartaDavi = ''; }); conq('carta_davi');
    }
    const velho = (() => { try { return !!(localStorage.getItem('hora-silencio-v2') || localStorage.getItem('hora-silencio-v2-caps') || localStorage.getItem('hora-silencio-v1')); } catch (e) { return false; } })();
    if (velho && !m.desdeComeco) { extra.push(L.primeiraVersao); guardar(x => { x.desdeComeco = true; }); }
    if (R.abertura && extra.length && !teste()) {
      for (const l of extra) R.abertura.push(l);
      R.abertura.sort((a, b) => a.t - b.t);
      setTimeout(() => { for (const l of extra) { const i = R.abertura.indexOf(l); if (i >= 0) R.abertura.splice(i, 1); } }, 0); // a cena copia a lista na hora
    }
  }

  // ------------------------------------------------------------------
  // quadro a quadro
  // ------------------------------------------------------------------
  let ultS = null, txtT = 0, memT = 0, mortesAnt = 0, parado = 0, chorando = false, choroT = 0, posAnt = null, yawAnt = 0, costas = 0, luzJ = 0, escondT = 0, versoAnt = false, capAnt = -1, liaT = -1, raioAnt = 0, visT = 0, grupoAnt = null;
  const v1 = new THREE.Vector3(), v2 = new THREE.Vector3();
  function tick(dt) {
    const St = S(); if (!St) return;
    if (St !== ultS) { ultS = St; mortesAnt = St.mortes; parado = 0; chorando = false; posAnt = null; costas = 0; luzJ = 0; escondT = 0; versoAnt = !!St.flags.verso; capAnt = St.chapter; liaT = -1; visT = 0; clarDito = false; }
    const P = c.P, W = c.W, sala_ = P.room && P.room.id, M = c.M;
    // relâmpago (para a lousa do castigo)
    const ri = A.raioI || 0; if (ri > .08 && raioAnt <= .08) { ultRaio = performance.now(); avisarClarao(St); } raioAnt = ri;
    // textos montados (uma vez por segundo)
    if (W.grupo !== grupoAnt) { grupoAnt = W.grupo; txtT = 0; }
    txtT -= dt; if (txtT <= 0) { txtT = 1; seguro('textos', () => textos(St)); }
    // o carro
    if (carro && carro.sentada) {
      if (W.mapa !== 'estrada' || St.dead) carro.sentada = false;
      else {
        P.pos.set(1.15, 0, 9.75); P.crouch = true; carro.t += dt;
        const k = window.__jogo && window.__jogo.keys;
        if (k && (k.KeyW || k.KeyS || k.KeyA || k.KeyD) && carro.t > .8 && !carro.fim) sairCarro(St, L.carro.saiu);
        else if (!carro.fim && carro.tent === 0) programa(St);
      }
    }
    if (W.mapa === 'estrada' && St.done.sair_carro && St.flags.l4saiuT == null) St.flags.l4saiuT = St.tempo;
    // Seu Joaquim: lanterna na cara por três segundos
    if (W.mapa === 'estrada' && joaquimObj && joaquimObj.visible && !St.flags.joaquimSumiu && St.flashOn && !St.flags.l4luzJ) {
      joaquimObj.getWorldPosition(v1); v1.y = 1.5; const d = v1.distanceTo(A.camera.position);
      A.camera.getWorldDirection(v2); const dot = v2.dot(v1.sub(A.camera.position).normalize());
      if (d < 7 && dot > .985 && c.ui == null) { luzJ += dt; if (luzJ > 3) { St.flags.l4luzJ = true; fala(L.joaquim.luz); anotar('luzJoaquim'); } } else luzJ = Math.max(0, luzJ - dt);
    }
    // andar de costas pela estrada
    if (posAnt) {
      const dx = P.pos.x - posAnt.x, dz = P.pos.z - posAnt.z, dd = Math.hypot(dx, dz);
      if (W.mapa === 'estrada' && dd > .005 && dd < 1) { const fx = -Math.sin(P.yaw), fz = -Math.cos(P.yaw); if ((dx * fx + dz * fz) / dd < -.7) { costas += dd; if (costas > 30) anotar('costas'); } }
      // parada por dois minutos fora de perigo: a Lia senta e chora
      const mexeu = dd > .01 || Math.abs(P.yaw - yawAnt) > .002;
      const perigo = St.hidden || (M.ativo && M.state !== 'patrulha') || c.PROC.fase || (c.ANA && c.ANA.ativa) || (carro && carro.sentada) || St.fim;
      if (chorando) {
        choroT -= dt; if (choroT <= 0) { choroT = 6; try { A.SFX.suspiroLia(); } catch (e) {} }
        if (mexeu || perigo) { chorando = false; parado = 0; P.crouch = false; fala(L.choro.levanta); }
      } else if (!mexeu && !perigo && c.ui == null && !teste()) { parado += dt; if (parado > 120) { chorando = true; choroT = 0; P.crouch = true; fala(L.choro.senta); anotar('choro'); } }
      else parado = 0;
    }
    posAnt = { x: P.pos.x, z: P.pos.z }; yawAnt = P.yaw;
    // mortes de todas as noites (para a lousa e para a carta retida)
    if (St.mortes > mortesAnt) {
      const n = St.mortes - mortesAnt; mortesAnt = St.mortes;
      guardar(m => { m.mortesTotal = (m.mortesTotal || 0) + n; const a = m.atual = m.atual || { capMortes: {} }; a.capMortes = a.capMortes || {}; a.capMortes[St.chapter] = (a.capMortes[St.chapter] || 0) + n; a.mortes = St.mortes; });
      if (St.mortes >= 5) anotar('mortes');
    }
    if (St.hidden) { escondT += dt; if (escondT > 120) anotar('escondida'); }
    if (St.flags.respondeu) anotar('respondeu');
    memT -= dt; if (memT <= 0) { memT = 5; guardar(m => { const a = m.atual = m.atual || {}; a.escondida = escondT; a.respondeu = !!St.flags.respondeu; a.mortes = St.mortes; }); }
    // o armário do dormitório C: J.P. esteve aqui
    if (W.mapa === 'superior' && sala_ === 'dormC' && St.hidden && St.hidden.tipo === 'armario' && !St.flags.l4visitante) {
      visT += dt; if (visT > 3) { St.flags.l4visitante = true; St.notes.l4_visitante = true; fala(L.visitante); conq('visitante'); achar('visitante'); anotar('visitante'); }
    } else visT = 0;
    // a folha espelhada perde o espelho quando a nota fecha
    const pn = $('#note p'); if (pn && $('#note').hidden && pn.classList.contains('l4-espelho')) pn.classList.remove('l4-espelho');
    // regra 8 do Pesadelo: ler já é ser ouvida
    if (St.flags.verso && !versoAnt && St.flags.l4regra8 === 'pesadelo') { St.flags.l4regra8Pend = true; setTimeout(() => fala(L.regra8Leu), 900); conq('regra_oito'); }
    versoAnt = !!St.flags.verso;
    // ...e na primeira vez em que o Inspetor estiver acordado, ele vem direto até a sala dela
    if (St.flags.l4regra8Pend && M.ativo && !St.hidden && !St.dead) { St.flags.l4regra8Pend = false; St.fear = Math.max(St.fear || 0, 90); A.emitNoise(P.pos.x, P.pos.z, 60); }
    // a página da Lia (terceira noite em diante, no Capítulo I)
    if (St.chapter !== capAnt) { capAnt = St.chapter; if (St.chapter === 1 && noiteN() >= 3 && !St.notes.l4_lia) { St.notes.l4_lia = true; liaT = 20; } }
    if (liaT > 0) { liaT -= dt; if (liaT <= 0) fala(L.liaPagina); }
    if (St.notes.l4_lia && !St.flags.l4liaLida && notaAberta(nota('l4_lia').titulo)) { St.flags.l4liaLida = true; setTimeout(() => fala(L.liaPaginaLida), 1200); }
    // cemitério: a figura do Joaquim some quando você chega perto; o portão sabe do armário
    if (figJ && figJ.visible && W.mapa === 'cemiterio') { if (Math.hypot(P.pos.x - figJ.position.x, P.pos.z - figJ.position.z) < 3 || St.flags.sino) { figJ.visible = false; if (!St.flags.sino) { A.SFX.estatica(1.4); setTimeout(() => fala(L.cruzJ.radio), 600); } } }
    if (St.flags.l4albano && R.falas.joaquim_portao === portaoBase) R.falas.joaquim_portao = [L.albano.portao];
    // cemitério: a linha da lousa e o medo do caderno de perguntas
    if (W.mapa === 'cemiterio' && St.flags.sino && St.flags.l4castigo && !St.flags.l4castigoDito) { St.flags.l4castigoDito = true; setTimeout(() => fala(L.castigo.fuga), 1500); }
    if (W.mapa === 'cemiterio' && sala_ === 'capela' && St.flags.l4medo && !St.flags.l4medoDito && !St.flags.sino) { St.flags.l4medoDito = true; setTimeout(() => { const f = L.perguntas.capela[St.flags.l4medo - 1]; if (f) { fala(f); try { A.SFX.sussurros(1.4); } catch (e) {} } }, 2500); }
  }
  function avisarClarao(St) {
    if (clarDito || !lousaCastigo || St.flashOn || St.flags.l4castigo || c.W.mapa !== 'terreo') return;
    lousaCastigo.getWorldPosition(v1); if (v1.distanceTo(A.camera.position) > 6) return;
    clarDito = true; c.toast(L.castigo.clarao);
  }
  // o rádio do carro segue o programa até o fim; depois, batidas no teto
  function programa(St) {
    const t = carro.t - 14; if (t < 0) return;
    const prog = L.carro.programa, i = Math.floor(t / 6.5);
    if (i < prog.length && i >= carro.prog) { carro.prog = i + 1; fala(prog[i]); if (i === 1) try { A.SFX.estatica(1); } catch (e) {} }
    if (i >= prog.length + 1 && !carro.bateu) {
      carro.bateu = true; St.fear = Math.max(St.fear || 0, 85);
      [0, 380, 760].forEach(ms => setTimeout(() => { try { A.SFX.pancada(1.6, 9.6); } catch (e) {} }, ms));
      setTimeout(() => falarLinhas(L.carro.batidas), 1300);
      setTimeout(() => { if (carro && carro.sentada) { sairCarro(St); conq('programa_inteiro'); achar('programa'); } }, 5200);
    }
  }

  // ------------------------------------------------------------------
  // fitas, finais e título
  // ------------------------------------------------------------------
  function fitaFim(id) {
    const St = S(); if (!St) return;
    if (id === 'l4_festa' && !St.flags.l4festa) { St.flags.l4festa = true; St.fear = 0; falarLinhas(L.tijolo.depois); conq('catorze'); achar('tijolo'); }
    if (id === 'l4_cinco') conq('fita_cinco');
  }
  function extrasFinal(tipo) {
    const St = S(), F = L.finais || {}; if (!St) return '';
    const l = [];
    if (tipo === 'verdadeiro') {
      if (St.flags.l4braile3) l.push(F.braile3);
      if (St.flags.l4pacto) l.push(F.pacto);
      if (St.flags.l4ficha) l.push(F.ficha);
      if (St.flags.l4capsula) l.push(F.capsula);
      if (St.flags.l4medo) l.push(L.perguntas.final[St.flags.l4medo - 1]);
      if (carro && carro.tent) l.push(F.carro);
    }
    if (St.flags.l4albano) l.push(F.albano);
    return l.filter(Boolean).map(x => '\n\n' + x).join('');
  }
  function aoFinal(tipo) { guardar(m => { m.atual = Object.assign(m.atual || {}, { final: tipo }); if (tipo === 'verdadeiro') m.podeEscrever = true; }); }
  // título: carta para o Davi e a oitava regra (depois do final verdadeiro), ACORDA, rádio da Copa
  let subTO = 0;
  function subTemp(t, ms = 6000) {
    const s = $('#t-sub'); if (!s || !t) return; const o = s.dataset.l4o || s.textContent; s.dataset.l4o = o; s.textContent = t; s.classList.add('segredo');
    clearTimeout(subTO); subTO = setTimeout(() => { if (s.textContent === t) { s.textContent = o; s.classList.remove('segredo'); } delete s.dataset.l4o; }, ms);
  }
  function titulo() {
    let b = $('#b-l4carta'); const ref = $('#b-creditos') || $('#b-fitas');
    if (!b && ref) { b = document.createElement('button'); b.className = 'btn'; b.id = 'b-l4carta'; b.textContent = L.carta.titulo; ref.insertAdjacentElement('afterend', b); b.onclick = abrirCarta; }
    if (b) b.hidden = !mem().podeEscrever;
    // rádio-relógio: março a julho de qualquer ano, notícias da Copa de 1994
    const d = new Date();
    if (!teste() && d.getMonth() >= 2 && d.getMonth() <= 6 && Math.random() < .4) setTimeout(() => { if (c.mode === 'titulo') subTemp(d.getMonth() === 6 && d.getDate() === 17 ? L.copaFinal : L.copa[Math.random() * L.copa.length | 0], 7000); }, 5000);
  }
  function abrirCarta() {
    if ($('#l4-carta')) return;
    const C = L.carta, m = mem();
    const ov = document.createElement('div'); ov.id = 'l4-carta'; ov.setAttribute('role', 'dialog'); ov.setAttribute('aria-label', C.titulo);
    ov.innerHTML = `<div class="pp"><h2></h2><label for="l4-cd"></label><textarea id="l4-cd" maxlength="140"></textarea><label for="l4-cr"></label><input id="l4-cr" maxlength="80"><div class="ok" aria-live="polite"></div><div class="bt"><button class="btn" data-a="x">Fechar</button><button class="btn" data-a="ok"></button></div></div>`;
    ov.querySelector('h2').textContent = C.titulo; ov.querySelector('label[for=l4-cd]').textContent = C.davi; ov.querySelector('label[for=l4-cr]').textContent = C.regra;
    ov.querySelector('[data-a=ok]').textContent = C.salvar;
    const ta = ov.querySelector('textarea'), ip = ov.querySelector('input'); ta.value = m.cartaDavi || ''; ip.value = m.regra8 || '';
    const limpa = s => String(s || '').replace(/[<>{}]/g, '').replace(/\s+/g, ' ').trim();
    for (const el of [ta, ip]) el.addEventListener('keydown', e => { e.stopPropagation(); if (e.code === 'Escape') ov.remove(); });
    ov.addEventListener('keydown', e => e.stopPropagation());
    ov.querySelector('[data-a=x]').onclick = () => ov.remove();
    ov.querySelector('[data-a=ok]').onclick = () => {
      const cd = limpa(ta.value).slice(0, 140), cr = limpa(ip.value).slice(0, 80);
      guardar(x => { x.cartaDavi = cd; x.regra8 = cr; });
      ov.querySelector('.ok').textContent = C.guardou; setTimeout(() => ov.remove(), 1600);
    };
    document.body.appendChild(ov); setTimeout(() => ta.focus(), 30);
  }
  // ACORDA no título: o Davi grava a fita que abre o jogo, ao vivo
  let buf = '', acordando = false;
  addEventListener('keydown', e => {
    if (c.mode !== 'titulo' || ($('#title') && $('#title').hidden)) return;
    const ae = document.activeElement; if (ae && /^(INPUT|TEXTAREA|SELECT)$/.test(ae.tagName)) return;
    if (!/^Key[A-Z]$/.test(e.code)) return;
    buf = (buf + e.code.slice(3)).slice(-6);
    if (buf !== 'ACORDA' || acordando) return;
    buf = ''; acordando = true; c.iniciarAudio();
    for (let i = 0; i < 6; i++) setTimeout(() => { try { A.SFX.tique(); } catch (er) {} }, i * 160);
    const ls = L.acorda.linhas;
    ls.forEach((t, i) => setTimeout(() => { if (i === 0) try { A.SFX.fitaClique(); } catch (er) {} subTemp(t, i === ls.length - 1 ? 9000 : 4200); if (i === ls.length - 1) { acordando = false; conq('acorda'); } }, 1100 + i * 4300));
  });

  window.__l4 = { achar, codigo, textos, mem, emBraile, espelhado, SEGREDOS, carro: () => carro };
  return { tick: dt => seguro('tick', () => tick(dt)), aoComecar: St => seguro('aoComecar', () => aoComecar(St)), codigo, fitaFim, extrasFinal, aoFinal, titulo: () => seguro('titulo', titulo) };
}
