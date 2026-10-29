// SEGREDOS DO SUBTERRÂNEO II — Lote 4 (segunda leva): túneis (Cap. IV), cemitério e capela (Cap. V)
// Mais salas e objetos escondidos, códigos, recompensas e sustos calados para quem explora e escuta.
// Tudo opcional, perto do caminho, sem travar objetivo nem obrigar backtracking.
// Ganchos: tuneis()/cemiterio() em mapas.js devolvem SUBS2.tuneis(...)/SUBS2.cemiterio(...) por fora de SUBS.
import { juntar } from './internato.js';

const R = window.ROTEIRO;

// ---------------------------------------------------------------------
// texto novo (entra no roteiro na carga do módulo)
// ---------------------------------------------------------------------
const NOTAS = [
  { id: 'l4b_caldeira', secreta: true, titulo: 'Caldeira de 1979', texto: 'Uma placa de ferro, quente ao toque, aparafusada na caldeira que ninguém desligou:\n\n"CALDEIRA CENTRAL — não deixar apagar no inverno. As crianças descem pra se aquecar perto dela.\n(outra letra, embaixo) foi aqui que começou. Ninguém botou lenha de mais. Foi ele que trancou a porta." ' },
  { id: 'l4b_oco', secreta: true, titulo: 'Lata de bolachas', texto: 'Uma lata de bolachas enferrujada, atrás dos tijolos ocos. Dentro, uma lista a lápis e três pauzinhos riscados:\n\n"COISAS QUE A GENTE ESCONDEU DELE:\n- o apito (o Tomé)\n- a figurinha que brilha\n- a chave da torre (a Ana achou)\n- esta lata\nse você tá lendo isso, bate três vezes na parede. a gente ouve." ' },
  { id: 'l4b_cripta', secreta: true, titulo: 'Mais velho que o fogo, parte II', texto: 'Entalhado na pedra da cripta, embaixo do altar, numa letra miúda e antiga:\n\n"Aqui jaz o primeiro. Fundou a casa em 1931 pra que as crianças aprendessem o silêncio.\nQuem lê as regras em voz alta vira regra.\nQuem conta até dez, fica contando.\nO oitavo nome ainda não foi escrito — mas o lugar já está cavado." ' },
  { id: 'l4b_pacto', secreta: true, titulo: 'Bilhete do telégrafo', texto: 'Papel pardo preso na chave de telégrafo, com pontos e traços traduzidos por baixo:\n\n"CLUBE DO RÁDIO — só a gente sabe.\nSe mandar S O S, o Joaquim responde lá de cima.\nTrês curtos, três longos, três curtos. Ele espera todo dia às nove.\nMas cada clique faz barulho. O seu Moacir é cego, não surdo. — D." ' },
  { id: 'l4b_dente', secreta: true, titulo: 'O primeiro dente', texto: 'Um dente de leite guardado numa fresta da escada, embrulhado num algodão, com um papelzinho:\n\n"o primeiro que caiu aqui embaixo. a fada do dente não desce até aqui, então a gente guardou.\nse ela vier, diz que tem mais trinta e seis esperando. — os meninos" ' }
];
for (const n of NOTAS) if (!R.notas.some(x => x.id === n.id)) R.notas.push(n);

const CONQS = [
  { id: 'l4b_albano', nome: 'Por Fora', desc: 'Abra o armário de ferro do Albano na sala do diretor.', secreta: true },
  { id: 'l4b_oco', nome: 'Parede Oca', desc: 'Bata na parede até os tijolos caírem.', secreta: true },
  { id: 'l4b_sussurros', nome: 'Câmara dos Sussurros', desc: 'Fique quieta até ouvir a conversa do outro lado.', secreta: true },
  { id: 'l4b_nomes', nome: 'Ela Leu os Nomes', desc: 'Passe a lanterna por todos os nomes da parede.', secreta: true },
  { id: 'l4b_caldeira', nome: 'Mais Quente que o Fogo', desc: 'Ache a parede quente dos túneis.', secreta: true },
  { id: 'l4b_velas37', nome: 'Trinta e Sete Pavios', desc: 'Acenda a vela mais baixa do nicho.', secreta: true },
  { id: 'l4b_sos', nome: 'S O S', desc: 'Mande o pedido de socorro pela chave de telégrafo.', secreta: true },
  { id: 'l4b_camera', nome: 'Uma Pose Só', desc: 'Dispare o flash da câmera velha dos túneis.', secreta: true },
  { id: 'l4b_cruz', nome: 'Primeira Comunhão', desc: 'Puxe a argola do fundo da cisterna vazia.', secreta: true },
  { id: 'l4b_velha', nome: 'Ela Sempre Ganhava', desc: 'Jogue a velha riscada contra o D.', secreta: true },
  { id: 'l4b_eco2', nome: 'Beco Sem Fim', desc: 'Chame no beco dos túneis até alguém chamar de volta.', secreta: true },
  { id: 'l4b_torre', nome: 'Lá de Cima', desc: 'Suba ao campanário da capela.', secreta: true },
  { id: 'l4b_cripta', nome: 'A Oitava', desc: 'Desça à cripta embaixo do altar.', secreta: true },
  { id: 'l4b_abafado', nome: 'Badalada Baixa', desc: 'Abafe o sino com o pano de veludo antes de tocar.', secreta: true },
  { id: 'l4b_banco', nome: 'O Décimo Banco', desc: 'Sente no banco que não devia existir.', secreta: true },
  { id: 'l4b_bento', nome: 'Não Cava Eu', desc: 'Encoste o ouvido na lápide sem nome de 1975.', secreta: true },
  { id: 'l4b_flor', nome: 'Uma Flor', desc: 'Ponha uma flor no vaso vazio da lápide.', secreta: true },
  { id: 'l4b_mausoleu', nome: 'Nove Velas', desc: 'Veja as nove velas do mausoléu acesas.', secreta: true },
  { id: 'l4b_estrela', nome: 'Estrela de Lata', desc: 'Pegue a estrela que brilha durante a fuga.', secreta: true },
  { id: 'l4b_setima', nome: 'Desobedeci a Sétima', desc: 'Olhe para trás quando o sino parar.', secreta: true },
  { id: 'l4b_obediente', nome: 'Obediente', desc: 'Fuja sem olhar para trás.', secreta: true },
  { id: 'l4b_ossario', nome: 'Fechado', desc: 'Devolva o rosto de cera ao túmulo vazio do diretor.', secreta: true },
  { id: 'l4b_agua', nome: 'Alma Sedenta', desc: 'Dê água à voz que pede de dentro da terra.', secreta: true },
  { id: 'l4b_dente', nome: 'O Primeiro Dente', desc: 'Ache o que os meninos guardaram na fresta da escada.', secreta: true },
  { id: 'l4b_volta', nome: 'A Palavra', desc: 'Leia as cinco letras de giz do portão dos fundos.', secreta: true }
];
for (const c of CONQS) if (!R.conquistas.some(x => x.id === c.id)) R.conquistas.push(c);
const TOTAL = CONQS.length;

// ---------------------------------------------------------------------
// legendas de som próprias
// ---------------------------------------------------------------------
const LEG = {
  l4bOco: { t: 'a parede soa oca', imp: 0, cd: 2, cat: 'h', pos: a => a[0] },
  l4bBate: { t: 'batidas na parede — alguém pode ouvir', imp: 1, cd: 2, cat: 'p', pos: a => a[0] },
  l4bConversa: { t: 'duas vozes de 1979 conversam do outro lado', imp: 0, cd: 8, cat: 'h', pos: a => a[0] },
  l4bNome: { t: 'uma voz de criança diz um nome', imp: 0, cd: 2, cat: 'h', pos: a => a[0] },
  l4bQuente: { t: 'ar quente vazando pela parede', imp: 0, cd: 10, cat: 'h', pos: a => a[0] },
  l4bTelegrafo: { t: 'cliques de telégrafo', imp: 1, cd: 2, cat: 'p', pos: a => a[0] },
  l4bResposta: { t: 'o fio responde em bipes lá de cima', imp: 0, cd: 6, cat: 'h', pos: a => a[0] },
  l4bFlash: { t: 'o estouro do flash da câmera', imp: 1, cd: 4, cat: 'p', pos: a => a[0] },
  l4bSino2: { t: 'uma badalada abafada', imp: 0, cd: 6, cat: 'h', pos: a => a[0] },
  l4bBatCova: { t: 'batidas fracas lá de baixo da terra', imp: 1, cd: 8, cat: 'p', pos: a => a[0] },
  l4bAguaVoz: { t: 'uma voz pede água de dentro de uma cova', imp: 1, cd: 10, cat: 'p', pos: a => a[0] }
};
function legendas(A) { try { const d = A.legendas; if (d) for (const [k, v] of Object.entries(LEG)) if (!d[k]) d[k] = v; } catch (e) {} }

// ---------------------------------------------------------------------
// sons próprios (mesmo AudioContext do motor)
// ---------------------------------------------------------------------
function sons(A) {
  const au = A.audio, ok = () => au && au.AC && au.AC.state !== 'closed' && !window.__teste;
  const p3 = (p, y = 1) => p ? { x: p.x, y: p.y ?? y, z: p.z } : null;
  return {
    oco(pos, vol = .2) { if (!ok()) return; const t = au.AC.currentTime; for (const [m, a, d] of [[1, 1, .5], [2.2, .5, .4]]) { const g = au.saida(p3(pos), .5); const o = au.osc('sine', 150 * m, t, d, g); o.frequency.exponentialRampToValueAtTime(90 * m, t + d); au.env(g, t, .004, vol * a, d * .9); } },
    bate(pos, vol = .3) { if (!ok()) return; const t = au.AC.currentTime, g = au.saida(p3(pos), .4); au.burst(t, .12, 'lowpass', 220, 2, g, 0); au.env(g, t, .002, vol, .1); const g2 = au.saida(p3(pos), .4); const o = au.osc('sine', 120, t, .14, g2); au.env(g2, t, .003, vol * .7, .12); },
    telegrafo(pos, seq, vol = .07) { if (!ok()) return au ? seq.length * .26 : 0; const t0 = au.AC.currentTime; let t = t0; for (const c of seq) { const d = c === 'L' ? .3 : .1; const g = au.saida(p3(pos), .3); au.osc('square', 760, t, d, g); au.env(g, t, .004, vol, d); t += d + .1; } return t - t0; },
    bipes(pos, seq, vol = .055) { if (!ok()) return; const t0 = au.AC.currentTime; let t = t0 + .3; for (const c of seq) { const d = c === 'L' ? .28 : .1; const g = au.saida(p3(pos), .5); au.osc('sine', 1180, t, d, g); au.env(g, t, .006, vol, d); t += d + .12; } },
    flash(pos, vol = .18) { if (!ok()) return; const t = au.AC.currentTime, g = au.saida(p3(pos), .2); au.burst(t, .06, 'highpass', 5200, 1, g, 0); au.env(g, t, .001, vol, .05); const g2 = au.saida(p3(pos), .2); const o = au.osc('triangle', 1400, t, .09, g2); o.frequency.exponentialRampToValueAtTime(300, t + .08); au.env(g2, t, .002, vol * .5, .08); },
    quente(vol = .05) { if (!ok()) return; const t = au.AC.currentTime, g = au.saida(null, .3); const f = au.burst(t, 2.4, 'bandpass', 900, 1.2, g); f.frequency.linearRampToValueAtTime(600, t + 2.4); au.env(g, t, .6, vol, 1.6); },
    sinoAbafado(pos, vol = .3) { if (!ok()) return; const t = au.AC.currentTime; for (const [m, a] of [[1, 1], [2.1, .3]]) { const g = au.saida(p3(pos, 5), .9); const f = au.burst(t, 1.3, 'lowpass', 300 * m, 2, g); au.osc('sine', 300 * m, t, 1.3, g); au.env(g, t, .01, vol * a, 1.2); } },
    batCova(pos, vol = .14) { if (!ok()) return; const t0 = au.AC.currentTime; for (let i = 0; i < 3; i++) { const t = t0 + i * .3, g = au.saida(p3(pos, .1), .4); au.burst(t, .09, 'lowpass', 180, 1.5, g, 0); au.env(g, t, .004, vol, .08); } }
  };
}

// ---------------------------------------------------------------------
// base compartilhada (agenda, ticks, visão, decal, segredo)
// ---------------------------------------------------------------------
function base(A, S) {
  const { THREE } = A;
  const agenda = [], ticks = [];
  const depois = (seg, f) => agenda.push({ t: seg, f });
  A.W.tick.push(dt => {
    for (let i = agenda.length - 1; i >= 0; i--) { agenda[i].t -= dt; if (agenda[i].t <= 0) { const f = agenda[i].f; agenda.splice(i, 1); try { f(); } catch (e) { console.warn('segredos2', e); } } }
    const t = A.perf();
    for (const f of ticks) try { f(dt, t); } catch (e) { console.warn('segredos2', e); }
  });
  const _v = new THREE.Vector3(), _f = new THREE.Vector3();
  const olhando = (x, y, z, cos = .85, alc = 12) => {
    _v.set(x, y, z).sub(A.camera.position); const d = _v.length(); if (d > alc || d < .01) return false;
    A.camera.getWorldDirection(_f); return _f.dot(_v.multiplyScalar(1 / d)) > cos;
  };
  const dist = (x, z) => Math.hypot(A.P.pos.x - x, A.P.pos.z - z);
  const luz = () => !!S.flashOn && A.flash.intensity > 1.2;
  const iluminado = (x, y, z, alc = 6, cos = .9) => luz() && olhando(x, y, z, cos, alc);
  const tex = (w, h, draw) => A.canvasTex(w, h, (g, W, H) => { g.clearRect(0, 0, W, H); draw(g, W, H); });
  const decal = (t, w, h, x, y, z, ry = 0) => A.plano(w, h, new THREE.MeshStandardMaterial({ map: t, transparent: true, depthWrite: false, roughness: 1, polygonOffset: true, polygonOffsetFactor: -2 }), x, y, z, ry, A.W.grupo);
  const uma = (id, f) => { if (S.flags[id]) return false; S.flags[id] = true; f && f(); return true; };
  const fala = (txt, quem = 'lia') => A.sub(quem, txt);
  const medo = n => { S.fear = Math.max(0, Math.min(100, (S.fear || 0) + n)); };
  const rotulo = (obj, txt, act, extra) => A.interact(obj, typeof txt === 'function' ? txt : () => txt, act || (() => {}), extra);
  const segredo = (id, texto) => {
    A.conquista(id);
    const sg = S.flags.l4seg2 || (S.flags.l4seg2 = {});
    if (sg[id]) return; sg[id] = true;
    const n = Object.keys(sg).length;
    depois(1.2, () => A.toast(`${texto ? texto + ' · ' : ''}Segredo do subterrâneo II ${n}/${TOTAL}`));
  };
  const legenda = (k, pos) => { try { A.SFX[k](pos ? { x: pos.x, y: pos.y ?? 1, z: pos.z } : null); } catch (e) {} };
  return { THREE, depois, ticks, olhando, dist, luz, iluminado, tex, decal, uma, fala, medo, rotulo, segredo, legenda };
}

// =====================================================================
// TÚNEIS (Capítulo IV)
// =====================================================================
export function tuneis(A, S, def, ctx = {}) {
  const U = base(A, S), som = sons(A), { THREE } = U, { MAT, box, cyl } = A;
  const X = {}, tick = f => U.ticks.push(f);
  legendas(A);

  // ---------- SALA DO DIRETOR: o armário de ferro do Albano (arranhões por dentro)
  { const x = -7.5, z = -58, g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = Math.PI / 2; A.W.grupo.add(g);
    box(.1, 1.8, .9, MAT.metal, 0, .9, 0, g, false);
    const porta = new THREE.Group(); porta.position.set(.05, .9, .44); g.add(porta);
    const folha = box(.06, 1.7, .82, new THREE.MeshStandardMaterial({ color: 0x4a4e50, metalness: .6, roughness: .5 }), 0, 0, -.4, porta, false);
    cyl(.03, .03, .08, MAT.bronze, .05, 0, -.74, 6, porta).rotation.z = Math.PI / 2;
    A.addCollider(x - .1, x + .35, z - .5, z + .5);
    const temChave = () => S.inv && S.inv.chaves && (S.inv.chaves.diretor || S.inv.chaves.A || S.inv.chaves.capela);
    let aberto = false, k = 0;
    const it = A.interact(g, () => aberto ? 'Armário de ferro, aberto. Por dentro, arranhões.' : temChave() ? '<b>E</b>Abrir o armário de ferro (ferrugem range alto)' : 'Armário de ferro com cadeado pequeno. Marcas de unha por dentro da porta.', () => {
      if (aberto) return;
      if (!temChave()) { A.SFX.trancado(); U.fala('Trancado. E tem marca de unha por dentro... alguém ficou preso aí.'); return; }
      aberto = true; A.SFX.rangido(x, 1.2, z); A.emitNoise(x, z, 9); A.P.shake = .08;
      tick(d => { if (k >= 1) return; k = Math.min(1, k + d * 1.2); porta.rotation.y = -k * 1.5; });
      // interior arranhado: "MOACIR ABRE" repetido
      const t = U.tex(256, 400, (c, w, h) => { c.fillStyle = '#2c2f30'; c.fillRect(0, 0, w, h); c.strokeStyle = 'rgba(210,205,190,.5)'; c.lineWidth = 2; c.font = 'bold 20px "Special Elite",monospace'; c.fillStyle = 'rgba(210,205,190,.55)'; for (let i = 0; i < 9; i++) { c.save(); c.translate(16, 34 + i * 40); c.rotate((Math.random() - .5) * .08); c.fillText('MOACIR ABRE', 0, 0); c.restore(); } });
      U.decal(t, .78, 1.5, .09, .9, -.02, -Math.PI / 2);
      U.depois(.6, () => U.fala('“Moacir abre”. Ele também foi trancado aqui dentro, quando era menino.'));
      // se o Inspetor estiver no mapa, ele para, fica mudo e promete não vistoriar ferro esta noite
      const M = A.M; if (M && M.ativo) { U.depois(1, () => { if (M.ativo && M.state !== 'caca') { A.planejar && A.planejar(M, x, z + 2); U.depois(1.4, () => A.sub('inspetor', '(baixinho, parado) ...agora a senhora sabe como é.')); S.flags.l4bArmarioPaz = true; } }); }
      U.depois(3, () => U.segredo('l4b_albano', 'Ele também abriu esse armário, por dentro'));
    });
    it.hold = 0; it.on = () => U.noMapaOk();
  }

  // ---------- CÂMARA LESTE: a parede que soa oca (bata três vezes)
  { const x = 33.7, z = -21.5;
    const d = U.decal(U.tex(128, 128, (c, w) => { c.fillStyle = 'rgba(0,0,0,0)'; c.fillRect(0, 0, w, w); c.strokeStyle = 'rgba(40,34,26,.6)'; c.lineWidth = 3; for (let i = 0; i < 5; i++) { c.strokeRect(10, 10 + i * 22, 44, 18); c.strokeRect(60, 10 + i * 22, 44, 18); } }), .9, 1.2, 33.84, 1.1, z, -Math.PI / 2);
    let n = 0, caiu = false;
    A.interact(d, () => caiu ? 'Um buraco na parede, atrás dos tijolos caídos.' : `<b>E</b>Bater na parede${n > 0 ? ` (${n}/3 — soa oco)` : ''}`, () => {
      if (caiu) return;
      som.bate({ x, z }); U.legenda('l4bBate', { x, z }); A.emitNoise(x, z, 7); A.P.shake = .04;
      n++; if (n === 1) { som.oco({ x, z }); U.legenda('l4bOco', { x, z }); A.toast('[oco]'); }
      if (n >= 3) {
        caiu = true; A.SFX.pancada(x, z); A.emitNoise(x, z, 14);
        for (let i = 0; i < 5; i++) { const b = box(.18, .1, .1, MAT.pedraLap, 33.6, .1 + Math.random() * .3, z - .3 + Math.random() * .6, A.W.grupo, false); U.depois(.02 * i, () => {}); }
        // a lata de bolachas no nicho
        const lata = cyl(.12, .12, .07, new THREE.MeshStandardMaterial({ color: 0x6a5a3a, metalness: .5, roughness: .5 }), 33.78, 1.1, z, 12, A.W.grupo); lata.rotation.z = Math.PI / 2;
        A.interact(lata, () => S.notes && S.notes.l4b_oco ? 'A lata de bolachas (lida).' : '<b>E</b>Abrir a lata de bolachas', () => { A.lerNota('l4b_oco'); U.uma('l4bLataPilha', () => { if (S.inv) S.inv.pilhas = (S.inv.pilhas || 0) + 1; A.toast('Dentro da lata, uma pilha ainda boa.'); }); U.segredo('l4b_oco', 'A parede guardava a lata dos três'); });
        U.fala('Ocos de propósito. Eles esconderam alguma coisa aqui.');
      }
    });
  }

  // ---------- DEPÓSITO: a câmara dos sussurros (ouça parada, o eco te entrega)
  { const x = -31.5, z = -36; let ouT = 0, feito = false, andouAviso = false;
    const d = U.decal(U.tex(128, 128, () => {}), .6, 1.4, -31.9, 1.2, z, Math.PI / 2);
    A.interact(d, () => 'Uma parede curva, de tijolo velho. O ar leva o som longe aqui.', () => { if (!andouAviso) { andouAviso = true; U.fala('Se eu ficar bem quieta, dá pra ouvir o outro lado.'); } });
    tick(dt => {
      if (feito) return;
      if (U.dist(x, z) < 1.3 && !A.P.sprinting && (A.P.vel ? Math.hypot(A.P.vel.x || 0, A.P.vel.z || 0) < .2 : true)) {
        ouT += dt;
        if (ouT > 2 && !S.flags.l4bConvIni) { S.flags.l4bConvIni = true; U.legenda('l4bConversa', { x, z }); A.sub('celeste', '(abafado, do outro lado) ...o senhor não pode trancar a capela, Albano. As crianças rezam lá.'); U.depois(3, () => A.sub('inspetor', '(abafado) Elas não rezam. Elas fazem barulho.')); }
        if (ouT > 7) { feito = true; U.legenda('l4bConversa', { x, z }); A.sub('celeste', '(abafado) A ordem é de baixo pra cima. Grave, médio, agudo. Sempre foi.'); U.depois(2.5, () => { if (S.fitas && !S.fitas.f2) A.toast('A ordem das válvulas: grave, médio, agudo. (anotado no diário)'); S.flags.l4bOrdemOuvida = true; }); U.depois(3.5, () => U.segredo('l4b_sussurros', 'Duas vozes de 1979 ainda discutem ali')); }
      } else { if (ouT > 1 && !feito) { ouT = 0; } }
    });
  }

  // ---------- TÚNEL CENTRAL: a parede dos 37 nomes que se leem sozinhos
  { const x = -1.85, z = -22, lidos = new Set();
    const nomes = ['ANTÔNIO', 'LUIZ', 'JOÃO', 'ROSA', 'ZÉ', 'CÉLIA', 'BENÉ', 'IRENE', 'OSVALDO', 'CÍCERO', 'TOMÉ', 'ANA', 'DAVI'];
    const t = U.tex(128, 512, (c, w, h) => { c.font = '15px "Special Elite",monospace'; c.textAlign = 'left'; nomes.forEach((nm, i) => { const y = 24 + i * 34; c.save(); c.translate(10 + Math.random() * 6, y); c.rotate((Math.random() - .5) * .05); c.fillStyle = `rgba(214,206,186,${.4 + Math.random() * .2})`; c.fillText(nm, 0, 0); c.strokeStyle = 'rgba(30,26,20,.6)'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(-2, -5); c.lineTo(c.measureText(nm).width + 4, -4); c.stroke(); c.restore(); }); c.fillStyle = 'rgba(252,248,238,.9)'; c.font = 'bold 16px "Special Elite",monospace'; c.fillText('L I _', 14, 24 + nomes.length * 34 + 8); });
    const d = U.decal(t, .5, 2, x, 1.3, z, -Math.PI / 2);
    A.interact(d, () => `Trinta e sete nomes riscados a prego. Lá no fim, um sendo escrito agora: “L I _”.`, () => { if (!S.flags.l4bNomesTocou) { S.flags.l4bNomesTocou = true; U.fala('Alguém tava riscando o meu quando eu cheguei.'); } });
    let varrX = 0;
    tick(() => {
      if (S.flags.l4bNomesFim) return;
      if (U.iluminado(x, 1.3, z, 4, .9)) {
        const i = Math.min(nomes.length - 1, Math.max(0, Math.round(varrX)));
        if (!lidos.has(i) && A.perf() - (S.flags.l4bNomeT || 0) > 1) { lidos.add(i); S.flags.l4bNomeT = A.perf(); U.legenda('l4bNome', { x, z }); A.SFX.sussurros(.5); varrX = (varrX + 3.1) % nomes.length; }
        if (lidos.size >= nomes.length) { S.flags.l4bNomesFim = true; A.SFX.sussurros(1.2); U.depois(.4, () => A.sub('davi', '(bem baixo) ...L, I, A. Pronto. Agora você tá na parede também.')); U.depois(2.5, () => U.segredo('l4b_nomes', 'Cada nome tinha uma voz')); }
      }
    });
  }

  // ---------- CÂMARA OESTE: a parede quente da caldeira (a respiração some ali)
  { const x = -30, z = -23.6, g = new THREE.Group(); g.position.set(x, 0, z); A.W.grupo.add(g);
    const d = U.decal(U.tex(64, 64, () => {}), 1.2, 1.6, x, 1.2, -23.82, 0);
    let paradaT = 0, revelou = false;
    A.interact(d, () => revelou ? 'A caldeira antiga, ainda morna, atrás dos tijolos.' : '<b>E</b>Encostar a mão na parede', () => {
      if (revelou) return;
      if (paradaT < 2.5) { U.fala('Essa parede tá... quente. Aqui embaixo?'); return; }
    });
    tick(dt => {
      if (revelou) return;
      if (U.dist(x, z) < 1.4) { paradaT += dt; if (paradaT > 2.5 && !S.flags.l4bQuenteDica) { S.flags.l4bQuenteDica = true; U.legenda('l4bQuente', { x, z }); som.quente(); A.toast('O ar aqui é quente. Tem alguma coisa viva atrás desses tijolos.'); } }
      else paradaT = Math.max(0, paradaT - dt);
      if (paradaT > 4 && U.luz() && U.olhando(x, 1.2, -23.82, .85, 3)) {
        revelou = true; A.SFX.pancada(x, -23.82); A.emitNoise(x, z, 10);
        cyl(.5, .5, 1.1, new THREE.MeshStandardMaterial({ color: 0x2a1c10, roughness: .6, metalness: .3, emissive: 0x3a1004, emissiveIntensity: .5 }), x, .8, -23.95, 10, A.W.grupo);
        A.interact(d, () => S.notes && S.notes.l4b_caldeira ? 'A placa da caldeira (lida).' : '<b>E</b>Ler a placa da caldeira', () => { A.lerNota('l4b_caldeira'); U.segredo('l4b_caldeira', 'A caldeira que ninguém desligou'); });
        U.fala('Uma caldeira. Foi aqui que o fogo começou, em 79.');
      }
    });
  }

  // ---------- TÚNEL CENTRAL: o nicho dos 37 pavios
  { const x = 1.85, z = -14, g = new THREE.Group(); g.position.set(x, 1.1, z); g.rotation.y = -Math.PI / 2; A.W.grupo.add(g);
    box(.5, .5, .1, MAT.preto, 0, 0, -.02, g, false);
    for (let i = 0; i < 12; i++) cyl(.012, .012, .03 + (i === 6 ? -.015 : 0), MAT.vela, -.2 + (i % 6) * .08, -.12 + (i < 6 ? 0 : .16), .04, 5, g);
    A.interact(g, () => S.flags.l4bVelas ? 'O nicho dos pavios. Só a vela mais baixa aponta.' : '<b>E</b>Acender a vela mais baixa', () => {
      if (S.flags.l4bVelas) return;
      S.flags.l4bVelas = true; A.SFX.lanterna ? A.SFX.estalo({ x, z }, .1) : A.SFX.estalo({ x, z }, .1);
      U.fala('A corrente apagou as outras. A chama dele deita pra um lado só.');
      U.depois(1.2, () => A.toast('A chama aponta para um dos armários de ferro — o que ele nunca abre.'));
      U.depois(2.2, () => U.segredo('l4b_velas37', 'A vela mais baixa é a do Davi'));
    });
  }

  // ---------- GALERIA LESTE: a chave de telégrafo do Clube do Rádio
  { const x = 18, z = -37.6, g = new THREE.Group(); g.position.set(x, .9, z); A.W.grupo.add(g);
    box(.2, .08, .15, MAT.madeiraEsc, 0, 0, 0, g, false); const alav = box(.14, .03, .05, MAT.bronze, .02, .06, 0, g, false);
    A.addCollider(x - .2, x + .2, z - .18, z + .18);
    let mandou = false;
    A.interact(g, () => mandou ? 'A chave de telégrafo (S O S enviado).' : S.notes && S.notes.l4b_pacto ? '<b>E</b>Mandar S O S pela chave de telégrafo' : '<b>E</b>Mexer na chave de telégrafo', () => {
      A.lerNota && !S.notes.l4b_pacto && A.lerNota('l4b_pacto');
      if (mandou || !S.notes.l4b_pacto) return;
      mandou = true; const dur = som.telegrafo({ x, z }, ['S', 'S', 'S', 'L', 'L', 'L', 'S', 'S', 'S']);
      U.legenda('l4bTelegrafo', { x, z }); A.emitNoise(x, z, 8); alav.rotation.z = -.2; U.depois(.1, () => { alav.rotation.z = 0; });
      U.depois((dur || 2.5) + .6, () => { som.bipes({ x, z }, ['S', 'S', 'L', 'S']); U.legenda('l4bResposta', { x, z }); A.sub('joaquim', '(chiado, pelo fio) ...recebido, menina. Tô acordado. Corre que eu acendo a luz.'); });
      U.depois((dur || 2.5) + 3, () => { S.flags.l4bSOS = true; U.segredo('l4b_sos', 'O Clube do Rádio ainda tem linha'); });
    });
  }

  // ---------- TÚNEL LESTE: a câmera de uma pose só
  { const x = 20, z = -19.6, g = new THREE.Group(); g.position.set(x, .9, z); g.rotation.y = -.4; A.W.grupo.add(g);
    box(.16, .11, .09, new THREE.MeshStandardMaterial({ color: 0x1a1a1c, roughness: .7 }), 0, 0, 0, g, false);
    cyl(.035, .035, .04, MAT.vidro, 0, 0, .06, 10, g).rotation.x = Math.PI / 2;
    A.addCollider(x - .16, x + .16, z - .14, z + .14);
    let usada = false;
    A.interact(g, () => usada ? 'A câmera, já disparada. A foto ficou presa.' : '<b>E</b>Disparar o flash da câmera (contador: 1)', () => {
      if (usada) return; usada = true;
      som.flash({ x, z }); U.legenda('l4bFlash', { x, z }); A.emitNoise(x, z, 10);
      A.flash.intensity = Math.max(A.flash.intensity, 6); A.P.shake = .05;
      U.depois(1.4, () => A.toast('A foto revelou devagar. Atrás de você, na hora do clique, tinha alguém de pé.'));
      U.depois(2.4, () => U.segredo('l4b_camera', 'Uma pose, e ela saiu junto'));
    });
  }

  // ---------- GALERIA OESTE: o beco que responde (chame baixinho)
  { const x = -22, z = -36, chamT = 0, n = { v: 0 }; let feito = false;
    const d = U.decal(U.tex(64, 64, () => {}), .8, 1.6, -22, 1.2, -37.8, 0);
    A.interact(d, () => feito ? 'O fim do beco. Não tem saída — mas tem eco.' : '<b>E</b>Chamar baixinho pro fundo do beco', () => {
      if (feito) return;
      n.v++; A.SFX.sussurros(.6); A.emitNoise(x, z, 2);
      if (n.v < 4) { U.depois(1.2 - n.v * .2, () => { A.SFX.sussurros(.5 - n.v * .1); A.toast('[o eco volta... mais fraco]'); }); }
      else { feito = true; U.depois(.8, () => { A.SFX.sussurros(1.4); A.sub('davi', '(mais alto que a sua voz) AQUI NÃO, LIA. ELE TÁ OUVINDO.'); A.emitNoise(x, z, 12); U.medo(15); }); U.depois(2.6, () => U.segredo('l4b_eco2', 'O beco devolveu mais do que você disse')); }
    });
  }

  // ---------- TÚNEL LESTE: a velha riscada na parede (contra o D)
  { const x = 10, z = -16.2, jog = { n: 0 }; let fim = false;
    const t = U.tex(256, 256, (c, w) => { c.strokeStyle = 'rgba(220,214,196,.6)'; c.lineWidth = 3; c.beginPath(); for (const o of [90, 165]) { c.moveTo(40, o); c.lineTo(216, o); } for (const o of [100, 156]) { c.moveTo(o, 40); c.lineTo(o, 216); } c.stroke(); c.font = '26px "Special Elite",monospace'; c.fillStyle = 'rgba(220,214,196,.7)'; const g = ['D', 'L', 'D', 'L', 'D', 'L', 'L', 'D', 'L']; const px = [60, 118, 182], py = [70, 128, 186]; g.forEach((s, i) => c.fillText(s, px[i % 3] - 8, py[(i / 3 | 0)] + 8)); c.font = '14px "Special Elite",monospace'; c.fillText('todas empatadas', 60, 236); });
    const d = U.decal(t, .8, .8, x, 1.3, -16.3, Math.PI);
    A.interact(d, () => fim ? 'A velha riscada. O D empatava sempre.' : `<b>E</b>Jogar a velha${jog.n > 0 ? ` (rodada ${jog.n})` : ' (contra o D)'}`, () => {
      if (fim) return; jog.n++;
      A.SFX.estalo({ x, z }, .05);
      if (jog.n < 3) { A.toast(jog.n === 1 ? 'Você risca um X. O giz se mexe sozinho e risca um O ao lado.' : 'De novo empate. O D joga igual, sempre.'); }
      else { fim = true; U.fala('Tem uma jogada que ganha dele. Uma só. Ele erra de propósito, como irmão mais novo.'); U.depois(1.6, () => { A.SFX.risada(x, z + 1); A.toast('O giz risca tudo. Atrás de você aparece “DEZ”.'); U.medo(12); A.P.shake = .06; }); U.depois(3, () => { if (S.inv) S.inv.pilhas = (S.inv.pilhas || 0) + 1; U.segredo('l4b_velha', 'Ela deixava o irmão ganhar uma vez'); }); }
    });
  }

  // ---------- CISTERNA: a argola no fundo (só com a água baixa)
  { const x = 3, z = -39.6, g = new THREE.Group(); g.position.set(x, .06, z); A.W.grupo.add(g);
    const arg = new THREE.Mesh(new THREE.TorusGeometry(.08, .02, 6, 12), MAT.ferrugem); arg.rotation.x = Math.PI / 2; g.add(arg); g.visible = false;
    const it = A.interact(g, () => S.flags.l4bCruz ? 'O nicho do fundo, aberto.' : '<b>E</b>Puxar a argola do fundo (lama e ferro)', () => {
      if (S.flags.l4bCruz) return; S.flags.l4bCruz = true;
      A.SFX.metal(1); A.emitNoise(x, z, 5);
      if (S.inv) S.inv.cruzDavi = true;
      U.fala('A cruzinha de primeira comunhão do Davi. “D.M. 1977”, num pano.');
      U.depois(1.2, () => A.toast('Com ela no bolso, lá na capela a corda do sino parece pesar menos.'));
      U.depois(2.2, () => U.segredo('l4b_cruz', 'O fundo da cisterna guardava a cruz dele'));
    });
    it.hold = 0; it.on = () => !!S.flags.aguaBaixa && g.visible !== false;
    tick(() => { g.visible = !!S.flags.aguaBaixa; });
  }

  // ---------- CISTERNA: a escotilha que só aparece no reflexo da água
  { let feito = false;
    tick(() => {
      if (feito || S.flags.aguaBaixa) return;
      if (U.dist(0, -36) < 4 && A.P.crouch && U.luz()) { feito = true; U.medo(10); A.SFX.estalo({ x: 0, z: -36 }, .1); A.toast('No reflexo da água, no teto, tem uma escotilha que não está lá quando você olha pra cima.'); }
    });
  }

  // ---------- CÂMARA LESTE: os tijolos com iniciais (J M R L B D A T)
  { const x = 7, z = -16.15;
    const t = U.tex(256, 128, (c, w, h) => { c.font = 'bold 30px "Special Elite",monospace'; c.textAlign = 'center'; 'J M R L B D A T'.split(' ').forEach((ch, i) => { c.fillStyle = `rgba(214,206,186,${.45 + (i % 2) * .15})`; c.save(); c.translate(18 + i * 29, h / 2 + 10); c.rotate((Math.random() - .5) * .1); c.fillText(ch, 0, 0); c.restore(); }); });
    const d = U.decal(t, 1.4, .7, x, 1.3, z, 0);
    A.interact(d, () => 'Oito tijolos com iniciais riscadas a prego: J, M, R, L, B, D, A, T. As mesmas iniciais das lápides do cemitério.', () => U.uma('l4bTijolos', () => U.fala('As iniciais das crianças. Se tem uma ordem, é a dos anos em que elas foram enterradas.')));
  }

  // ---------- ESCADA: o dente de leite guardado numa fresta
  { const x = .32, z = -.3, g = new THREE.Group(); g.position.set(x, .55, z); A.W.grupo.add(g);
    const dente = box(.03, .035, .025, MAT.branco, 0, 0, 0, g, false);
    A.interact(g, () => S.notes && S.notes.l4b_dente ? 'A fresta da escada, onde estava o dente.' : '<b>E</b>Mexer na fresta da escada', () => {
      if (S.notes && S.notes.l4b_dente) return; dente.visible = false; A.lerNota('l4b_dente'); U.segredo('l4b_dente', 'Um dente de leite esperando a fada');
    });
  }

  // ---------- TÚNEL NORTE: giz "NÃO OLHE PRA TRÁS" e marcas 1 2 1 2
  { const x = 1.85, z = -50;
    const t = U.tex(256, 256, (c, w) => { c.font = 'bold 26px "Special Elite",monospace'; c.textAlign = 'center'; c.fillStyle = 'rgba(236,230,214,.8)'; c.fillText('NÃO OLHE', w / 2, 70); c.fillText('PRA TRÁS', w / 2, 104); c.font = '34px "Special Elite",monospace'; c.fillStyle = 'rgba(236,230,214,.55)'; '1 2 1 2 1 2'.split(' ').forEach((n, i) => c.fillText(n, 30 + i * 34, 170)); });
    const d = U.decal(t, .8, .8, x, 1.4, z, -Math.PI / 2);
    A.interact(d, () => 'Giz de criança: “NÃO OLHE PRA TRÁS”, e marcas numeradas 1 2 1 2, como se o corredor desse voltas.', () => U.uma('l4bGiz', () => U.fala('A sétima regra. Até aqui embaixo eles sabiam dela.')));
  }

  U.noMapaOk = () => A.W.mapa === 'tuneis' && !A.S.dead;
  return juntar(def, X);
}

// =====================================================================
// CEMITÉRIO E CAPELA (Capítulo V)
// =====================================================================
export function cemiterio(A, S, def, ctx = {}) {
  const U = base(A, S), som = sons(A), { THREE } = U, { MAT, box, cyl } = A;
  const X = {}, tick = f => U.ticks.push(f);
  legendas(A);

  // ---------- CAPELA: a escada para o campanário (vista do alto)
  { const x = 3.4, z = -62, g = new THREE.Group(); g.position.set(x, 0, z); A.W.grupo.add(g);
    for (let i = 0; i < 9; i++) box(.5, .04, .12, MAT.madeiraEsc, 0, .35 + i * .42, 0, g, false);
    box(.04, 4, .04, MAT.madeiraEsc, -.25, 2, 0, g, false); box(.04, 4, .04, MAT.madeiraEsc, .25, 2, 0, g, false);
    let subindo = false;
    A.interact(g, () => S.flags.l4bTorre ? 'A escada do campanário. Você já subiu.' : '<b>E</b>Subir a escada do campanário (os degraus rangem)', () => {
      if (subindo || S.flags.l4bTorre) return; subindo = true;
      A.SFX.rangido(x, 1.2, z); A.emitNoise(x, z, 6);
      A.fade(true, () => {
        A.cartao && A.cartao('Lá de cima: o internato inteiro, o cemitério, e longe, a estrada.', 4);
        U.depois(1, () => A.sub('lia', 'O meu carro... os faróis tão acesos. E tem alguém sentado no banco do motorista.'));
        U.depois(4, () => { const isq = Math.random() < .6; A.sub('lia', isq ? 'Acendeu um isqueiro. Apagou. Quem tá me esperando lá embaixo?' : 'A silhueta não se mexe. Só espera.'); });
        U.depois(6.5, () => { A.fade(false); S.flags.l4bTorre = true; U.segredo('l4b_torre', 'Alguém espera no carro, lá embaixo'); });
      }, 700);
    });
  }

  // ---------- CAPELA: a cripta embaixo do altar (a oitava regra)
  { const x = 0, z = -64, g = new THREE.Group(); g.position.set(x, .02, z); A.W.grupo.add(g);
    const laje = box(.9, .08, .9, A.texMat('pedra', .5, .5), 0, 0, 0, g, false);
    A.interact(g, () => S.flags.l4bCripta ? 'A pedra solta do chão da capela, aberta.' : A.P.crouch ? '<b>E</b>Afundar a pedra solta do chão' : 'Uma pedra do chão com nove riscos. (agache para empurrar)', () => {
      if (S.flags.l4bCripta || !A.P.crouch) return; S.flags.l4bCripta = true;
      som.oco({ x, z }); A.emitNoise(x, z, 7); A.P.shake = .08;
      let k = 0; tick(d => { if (k >= 1) return; k = Math.min(1, k + d); laje.position.y = -k * .3; });
      A.fade(true, () => {
        A.cartao && A.cartao('Degraus para uma cripta pequena, mais velha que o incêndio.', 4);
        U.depois(1, () => A.sub('lia', 'Caixões de criança. Todos vazios. E um sem nome, com a tampa aberta por dentro.'));
        U.depois(4, () => { if (S.notes && !S.notes.l4b_cripta) A.lerNota('l4b_cripta'); });
        U.depois(5, () => { A.fade(false); U.medo(20); U.segredo('l4b_cripta', 'O oitavo lugar já está cavado'); });
      }, 700);
    });
  }

  // ---------- CAPELA: o pano de veludo que abafa o sino
  { const x = -5, z = -52, g = new THREE.Group(); g.position.set(x, .06, z); A.W.grupo.add(g);
    box(.4, .03, .3, new THREE.MeshStandardMaterial({ color: 0x3a1420, roughness: .9 }), 0, 0, 0, g, false);
    A.interact(g, () => S.flags.l4bPano ? 'O lugar do pano de veludo (você já pegou).' : '<b>E</b>Pegar o pano de veludo', () => {
      if (S.flags.l4bPano) return; S.flags.l4bPano = true; g.visible = false; A.SFX.pegar();
      if (S.inv) S.inv.panoSino = true;
      U.fala('Um pano de veludo. Se eu enrolar no sino, ele bate abafado.');
    });
    // o sino propriamente: um ponto perto da corda, só aparece com o pano no bolso e antes de tocar
    const sg = new THREE.Group(); sg.position.set(4.8, 1.2, -64); A.W.grupo.add(sg);
    box(.2, .2, .2, MAT.lencol, 0, 0, 0, sg, false); sg.visible = false;
    A.interact(sg, () => '<b>E</b>Enrolar o pano no badalo do sino', () => {
      if (!S.inv || !S.inv.panoSino || S.flags.sino || S.flags.l4bAbafado) return;
      S.flags.l4bAbafado = true; S.inv.panoSino = false; A.SFX.pegar();
      U.fala('Pronto. Agora a badalada vai sair surda. Ele acorda mais tarde.');
      U.depois(1.2, () => U.segredo('l4b_abafado', 'Até o sino teve pena'));
    });
    tick(() => { sg.visible = !!(S.inv && S.inv.panoSino) && !S.flags.sino && !S.flags.l4bAbafado && Object.keys(S.tumulos || {}).length >= 3; });
    // quando o sino toca com o pano: badalada abafada + o Inspetor demora a vir
    let soou = false;
    tick(() => {
      if (soou || !S.flags.sino || !S.flags.l4bAbafado) return; soou = true;
      som.sinoAbafado({ x: 4.8, y: 5, z: -64 }); U.legenda('l4bSino2', { x: 0, z: -60 });
      U.medo(-10); S.flags.l4bFinalAbafado = true;
    });
  }

  // ---------- CAPELA: o décimo banco (aparece no relâmpago)
  { const x = 4, z = -59, g = new THREE.Group(); g.position.set(x, 0, z); A.W.grupo.add(g);
    box(1.2, .5, .5, MAT.madeiraEsc, 0, .25, 0, g, false); box(1.2, .6, .08, MAT.madeiraEsc, 0, .7, .22, g, false); g.visible = false;
    const menina = box(.25, .6, .2, new THREE.MeshStandardMaterial({ color: 0x14100c, roughness: 1 }), 0, .55, .05, g, false);
    let visto = false;
    A.interact(g, () => '<b>E</b>Sentar no banco', () => {
      if (S.flags.l4bBanco) return; S.flags.l4bBanco = true;
      A.sub('ana', '(contando devagar, sem pressa) um... dois... três...'); U.medo(10);
      U.depois(3, () => A.sub('lia', 'Ela não vai aparecer. Só quer companhia. ...O último túmulo é do lado do mausoléu.'));
      U.depois(4.5, () => U.segredo('l4b_banco', 'Tem dez bancos quando relampeia'));
    });
    tick(() => {
      const raio = (A.raioI || 0) > .3;
      g.visible = raio && !S.flags.l4bBanco;
      if (g.visible && !visto && U.dist(x, z) < 6) { visto = true; }
      if (U.luz() && U.olhando(x, .6, z, .85, 5) && g.visible) { /* a luz some com ele */ g.visible = false; if (!S.flags.l4bBancoRiso) { S.flags.l4bBancoRiso = true; A.SFX.risada(0, -66); } }
    });
  }

  // ---------- CEMITÉRIO: a lápide sem nome de 1975 que bate de volta
  { const x = -18, z = -30, g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = Math.PI + .1; A.W.grupo.add(g);
    const tex = A.textoTex([{ t: '✝', tam: 40, y: 50 }, { t: 'SEM NOME', tam: 26, y: 120 }, { t: '1975', tam: 22, y: 168 }], { w: 256, h: 256, fundo: '#55534c', cor: '#1a1814', manchas: 6 });
    box(.8, 1.05, .16, [MAT.pedraLap, MAT.pedraLap, MAT.pedraLap, MAT.pedraLap, new THREE.MeshStandardMaterial({ map: tex, roughness: .95 }), MAT.pedraLap], 0, .52, 0, g, false);
    A.addCollider(x - .42, x + .42, z - .12, z + .12);
    let ouviu = false;
    A.interact(g, () => A.P.crouch ? '<b>E</b>Encostar o ouvido na lápide' : S.flags.l4bBento ? 'A lápide de 1975. Lá de baixo, batidas.' : 'Lápide sem nome, de 1975. (agache para encostar o ouvido)', () => {
      if (!A.P.crouch) return;
      if (!ouviu) { ouviu = true; som.batCova({ x, z }); U.legenda('l4bBatCova', { x, z }); A.toast('[batidas fracas lá de baixo — o mesmo código: NÃO CAVA EU]'); U.medo(8); }
      else if (!S.flags.l4bBento) { S.flags.l4bBento = true; som.batCova({ x, z }); A.sub('benedito', '(de baixo da terra) Obrigado por não cavar. Eu sou o único que quis ficar.'); U.medo(-15); U.depois(2.5, () => U.segredo('l4b_bento', 'O Benedito pediu pra ficar onde está')); }
    });
  }

  // ---------- CEMITÉRIO: a lápide que pede uma flor
  { const lx = 16, lz = -6, g = new THREE.Group(); g.position.set(lx, 0, lz); g.rotation.y = Math.PI - .1; A.W.grupo.add(g);
    const tex = A.textoTex([{ t: '✝', tam: 40, y: 54 }, { t: 'SEM NOME', tam: 24, y: 130 }], { w: 256, h: 256, fundo: '#55534c', cor: '#1a1814', manchas: 6 });
    box(.8, 1, .16, [MAT.pedraLap, MAT.pedraLap, MAT.pedraLap, MAT.pedraLap, new THREE.MeshStandardMaterial({ map: tex, roughness: .95 }), MAT.pedraLap], 0, .5, 0, g, false);
    const vaso = cyl(.06, .05, .12, MAT.ferrugem, .2, .06, -.3, 8, g);
    A.addCollider(lx - .42, lx + .42, lz - .12, lz + .12);
    // o pé de flor junto ao muro leste
    const px = 26, pz = -14, pf = new THREE.Group(); pf.position.set(px, 0, pz); A.W.grupo.add(pf);
    for (let i = 0; i < 5; i++) { cyl(.01, .01, .3, MAT.arvore, (Math.random() - .5) * .2, .15, (Math.random() - .5) * .2, 4, pf); }
    const flores = []; for (let i = 0; i < 4; i++) { const f = new THREE.Mesh(new THREE.SphereGeometry(.04, 6, 5), new THREE.MeshStandardMaterial({ color: 0xc83050, emissive: 0x2a0810, roughness: .7 })); f.position.set((Math.random() - .5) * .25, .28 + Math.random() * .06, (Math.random() - .5) * .25); pf.add(f); flores.push(f); }
    A.interact(pf, () => (S.inv && S.inv.flor) ? 'Um pé de maria-sem-vergonha. Você já pegou uma flor.' : '<b>E</b>Colher uma flor', () => { if (S.inv && S.inv.flor) return; if (S.inv) S.inv.flor = true; if (flores[0]) flores[0].visible = false; A.SFX.pegar(); U.fala('Uma flor vermelha. Alguém aqui não ganhou nenhuma.'); });
    A.interact(g, () => (S.inv && S.inv.flor && !S.flags.l4bFlor) ? '<b>E</b>Pôr a flor no vaso' : S.flags.l4bFlor ? 'A lápide da cozinheira, com uma flor no vaso.' : 'Uma lápide sem nome, com um vaso de lata vazio.', () => {
      if (!(S.inv && S.inv.flor) || S.flags.l4bFlor) return; S.flags.l4bFlor = true; S.inv.flor = false;
      const fl = new THREE.Mesh(new THREE.SphereGeometry(.04, 6, 5), new THREE.MeshStandardMaterial({ color: 0xc83050, emissive: 0x2a0810 })); fl.position.set(.2, .18, -.3); g.add(fl);
      A.SFX.pegar(); U.fala('A chuva escureceu a pedra e um nome apareceu: a cozinheira, que escondia os pães.');
      U.depois(1.4, () => A.toast('A lanterna parece durar mais até o fim. Um agradecimento.'));
      if (S.inv) S.inv.pilhaExtra = true;
      U.depois(2.4, () => U.segredo('l4b_flor', 'Alguém só queria uma flor'));
    });
  }

  // ---------- CEMITÉRIO: o mausoléu de nove velas (acende conforme você cava)
  { const x = 24, z = 7, g = new THREE.Group(); g.position.set(x, 0, z); A.W.grupo.add(g);
    const velas = [];
    for (let i = 0; i < 9; i++) { const vx = -.9 + i * .22, c = cyl(.02, .02, .09, MAT.vela, vx, .05, 0, 6, g); const ch = new THREE.Mesh(new THREE.SphereGeometry(.02, 5, 4), new THREE.MeshBasicMaterial({ color: 0xffaa44 })); ch.position.set(vx, .12, 0); ch.visible = i < 3; g.add(ch); velas.push(ch); }
    box(.6, .9, .1, MAT.ferrugem, 0, .45, -.3, g, false);
    let abriu = false;
    A.interact(g, () => abriu ? 'O mausoléu aberto. Lá dentro, uma foto do Moacir menino e do Luiz.' : 'Um mausoléu fechado, com nove velas na frente.', () => { if (abriu && !S.flags.l4bMauLido) { S.flags.l4bMauLido = true; U.fala('O Moacir era criança aqui também. E tinha um amigo, o Luiz.'); } });
    tick(() => {
      const cav = Object.keys(S.tumulos || {}).length; // 0..3 → acende 3 + até 6
      const acesas = Math.min(9, 3 + cav * 2);
      for (let i = 0; i < 9; i++) velas[i].visible = i < acesas;
      if (!abriu && acesas >= 9 && U.dist(x, z) < 8) { abriu = true; A.SFX.pancada(x, z); A.emitNoise(x, z, 4); U.depois(.4, () => A.toast('As nove velas acesas. A grade do mausoléu rangeu e abriu.')); U.depois(1.6, () => U.segredo('l4b_mausoleu', 'Nove velas, uma por quem não tem nome')); }
    });
  }

  // ---------- CEMITÉRIO: a voz que pede água (deixe a garrafa)
  { const x = -10, z = -20; let avisou = false;
    const d = U.decal(U.tex(32, 32, () => {}), .8, .2, x, .05, z, 0);
    A.interact(d, () => (S.inv && S.inv.garrafas > 0 && !S.flags.l4bAgua) ? '<b>E</b>Deixar a garrafa sobre a cova rasa' : S.flags.l4bAgua ? 'A cova rasa. A voz se calou.' : 'Uma cova rasa. De dentro, bem fraco, uma voz pede água.', () => {
      if (S.flags.l4bAgua || !(S.inv && S.inv.garrafas > 0)) return; S.flags.l4bAgua = true; S.inv.garrafas--;
      A.SFX.pegar(); const vv = A.W && A.W.def; // acende uma vela marcando o caminho
      cyl(.02, .02, .1, MAT.vela, 0, .05, 0, 6, d.parent || A.W.grupo);
      U.fala('Peguei... peguei uma água pra você.'); U.medo(-8);
      U.depois(1.4, () => A.toast('Uma vela se acendeu sozinha, marcando o caminho mais seguro por um tempo.'));
      U.depois(2.4, () => U.segredo('l4b_agua', 'A sede de quem ficou debaixo da terra'));
    });
    tick(() => { if (!avisou && U.dist(x, z) < 4) { avisou = true; U.legenda('l4bAguaVoz', { x, z }); } });
  }

  // ---------- CEMITÉRIO: a estrela de lata que brilha na fuga
  { const x = .6, z = -4, g = new THREE.Group(); g.position.set(x, .9, z); A.W.grupo.add(g);
    const estrela = new THREE.Mesh(new THREE.OctahedronGeometry(.07), new THREE.MeshStandardMaterial({ color: 0xcfc070, metalness: .7, roughness: .3, emissive: 0x201c08 })); g.add(estrela); g.visible = false;
    const it = A.interact(g, () => '<b>E</b>Pegar a estrela de lata', () => {
      if (S.flags.l4bEstrela) return; S.flags.l4bEstrela = true; A.SFX.pegar(); g.visible = false;
      if (S.inv) S.inv.estrelaLata = true;
      U.fala('A estrela de lata do Davi. Peguei bem na cara dele.');
      U.depois(1.2, () => U.segredo('l4b_estrela', 'Risco puro, no último minuto'));
    });
    it.on = () => !!S.flags.sino && !S.flags.l4bEstrela;
    tick(() => { g.visible = !!S.flags.sino && !S.flags.l4bEstrela; estrela.rotation.y += .03; const b = (A.raioI || 0) > .3 ? 1.2 : .2; estrela.material.emissiveIntensity = b; });
  }

  // ---------- CEMITÉRIO: a sétima regra — olhar para trás quando o sino para
  { let armado = false, julgado = false, sinoParou = 0;
    tick((dt, t) => {
      if (julgado || A.S.dead) return;
      if (S.flags.sino && !armado) { armado = true; sinoParou = t + 7.5; } // o sino bate ~7 s depois de puxar
      if (!armado) return;
      if (t < sinoParou) return;
      // o sino parou: olhar para a torre (-z) é desobedecer; chegar perto do portão sem olhar é obedecer
      const olhaTorre = U.olhando(0, 6, -66, .5, 90);
      if (olhaTorre && !julgado) {
        julgado = true; S.flags.l4bSetima = true; A.P.bloqueado = true;
        A.sub('lia', '...Davi?'); A.SFX.sinoLonge(); U.medo(25);
        U.depois(1.5, () => { A.P.bloqueado = false; A.toast('Três crianças na janela do campanário. Uma acenou. Você perdeu tempo.'); U.segredo('l4b_setima', 'Desobedeceu à sétima regra'); });
      } else if (A.P.pos.z > 9 && !julgado) {
        julgado = true; S.flags.l4bObediente = true; U.segredo('l4b_obediente', 'Não olhou para trás nem uma vez'); }
    });
  }

  // ---------- CAPELA: o ossário atrás do altar (o rosto de cera do Albano)
  { const x = -2.4, z = -68.5, g = new THREE.Group(); g.position.set(x, 1.1, z); A.W.grupo.add(g);
    for (let i = 0; i < 6; i++) box(.08, .1, .08, MAT.branco, -.2 + (i % 3) * .2, (i < 3 ? 0 : .2), 0, g, false);
    const cranio = new THREE.Mesh(new THREE.SphereGeometry(.07, 8, 7), new THREE.MeshStandardMaterial({ color: 0xd8d0b8, roughness: .6, emissive: 0x100c06 })); cranio.position.set(0, .1, .04); g.add(cranio);
    let pegou = false;
    A.interact(g, () => S.flags.l4bOssario ? 'O túmulo do diretor se fechou. Acabou.' : pegou ? '<b>E</b>Deixar o rosto de cera no túmulo vazio' : '<b>E</b>Pegar o rosto de cera (os ossos rolam)', () => {
      if (S.flags.l4bOssario) return;
      if (!pegou) { pegou = true; cranio.visible = false; A.SFX.pancada(x, z); A.emitNoise(x, z, 9); if (S.inv) S.inv.rostoCera = true; U.fala('O rosto de cera dele. Frio. Vou levar pro lugar certo.'); }
      else { S.flags.l4bOssario = true; if (S.inv) S.inv.rostoCera = false; A.SFX.pegar(); U.fala('Pronto. Fica aqui, seu Moacir. Agora o senhor também tem um lugar.'); U.medo(-12); S.flags.l4bFinalFechado = true; U.depois(1.4, () => A.toast('A cova se fechou sozinha. O rádio, de longe: “agora sim.”')); U.depois(2.4, () => U.segredo('l4b_ossario', 'Você fechou a conta dele')); }
    });
  }

  // ---------- PORTÃO DOS FUNDOS: as cinco letras de giz que só o relâmpago mostra
  { const x = 0, z = 11.6, g = new THREE.Group(); g.position.set(x, 1.3, z); A.W.grupo.add(g);
    const t = U.tex(256, 128, (c, w, h) => { c.font = 'bold 60px "Special Elite",monospace'; c.textAlign = 'center'; c.fillStyle = 'rgba(236,230,214,.85)'; 'VOLTA'.split('').forEach((ch, i) => { c.save(); c.translate(26 + i * 50, h / 2 + 20); c.rotate((Math.random() - .5) * .12); c.fillText(ch, 0, 0); c.restore(); }); });
    const d = A.plano(1.6, .8, new THREE.MeshStandardMaterial({ map: t, transparent: true, depthWrite: false, emissive: 0x111111 }), x, 1.3, z - .02, 0, A.W.grupo);
    A.interact(d, () => 'Cinco letras de giz de criança no portão, que só aparecem no clarão do relâmpago: V O L T A.', () => U.uma('l4bVolta', () => { U.fala('“VOLTA”. Era o que o Davi queria me dizer esse tempo todo.'); U.depois(2, () => U.segredo('l4b_volta', 'A palavra que o giz escondia')); }));
    tick(() => { d.material.opacity = (A.raioI || 0) > .25 ? 1 : .08; });
  }

  // ---------- CEMITÉRIO: a coruja no muro que repete o seu nome
  { const x = -28, z = -18, g = new THREE.Group(); g.position.set(x, 2.3, z); A.W.grupo.add(g);
    box(.2, .3, .2, MAT.madeiraEsc, 0, 0, 0, g, false);
    const olhos = []; for (const s of [-1, 1]) { const o = new THREE.Mesh(new THREE.SphereGeometry(.035, 6, 5), new THREE.MeshStandardMaterial({ color: 0x1a1200, emissive: 0xffcc44, emissiveIntensity: 0 })); o.position.set(s * .06, .08, .12); g.add(o); olhos.push(o); }
    let olharT = 0, voou = false;
    A.interact(g, () => 'Uma coruja parada no muro. Os olhos pegam a luz da lanterna.', () => {});
    tick(dt => {
      if (voou) return;
      const ilum = U.iluminado(x, 2.38, z, 12, .9);
      for (const o of olhos) o.material.emissiveIntensity = ilum ? .9 : .15;
      if (ilum) { olharT += dt; if (olharT > 15) { voou = true; g.visible = false; A.sub('davi', '(com a voz da coruja) ...Lia.'); A.SFX.sussurros(1); U.medo(10); } }
      else olharT = Math.max(0, olharT - dt);
    });
  }

  // ---------- CAPELA: o harmônio que solta uma nota quando você passa
  { const x = -5, z = -64, g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = Math.PI / 2; A.W.grupo.add(g);
    box(.5, 1, 1.1, MAT.madeiraEsc, 0, .5, 0, g, false); box(.6, .1, .5, MAT.madeiraEsc, 0, .9, .35, g, false);
    A.addCollider(x - .3, x + .3, z - .55, z + .55);
    let tocouT = -99;
    A.interact(g, () => 'Um harmônio coberto de poeira. As teclas estão soltas.', () => { if (A.perf() - tocouT > 3) { tocouT = A.perf(); som.sinoAbafado({ x, y: 1, z }, .12); U.fala('Uma tecla afundou sozinha. A nota ficou presa no ar.'); } });
    tick((dt, tt) => { if (tt - tocouT > 12 && U.dist(x, z) < 2 && !A.S.dead) { tocouT = tt; som.oco({ x, y: 1, z }, .1); } });
  }

  return juntar(def, X);
}
