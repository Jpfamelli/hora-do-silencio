// REJOGABILIDADE DO SUBTERRÂNEO — Lote 6
// Túneis (Cap. IV) e cemitério/capela (Cap. V): modos extras, desafios, variações
// sorteadas pela Semente da Noite, conquistas, recordes e segredos que só aparecem na
// segunda jogada. Entra como a camada MAIS externa de tuneis()/cemiterio() em mapas.js.
//
// Regras do projeto: nada aqui trava objetivo nem obriga backtracking; tudo é opcional
// e fica no caminho. Comportamentos que movem/invocam o Inspetor, a Ana ou dão dano ficam
// atrás de !emTeste() para não atrapalhar o QA automático (que teleporta a jogadora pelos
// objetivos). O resto (luz, som, fala, partícula, variação sorteada) roda sempre.
// Conteúdo de "segunda jogada" fica atrás de jaVeio(): o QA roda com save limpo, então
// nunca aparece lá.

const R = window.ROTEIRO;
const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
const emTeste = () => { try { return !!window.__teste || !!navigator.webdriver; } catch (e) { return false; } };

// ---------------------------------------------------------------------
// conquistas novas (entram no roteiro na carga do módulo, antes do motor copiar)
// ---------------------------------------------------------------------
const CONQS = [
  { id: 'l6_valv_perfeita', nome: 'Mão Firme', desc: 'Abra as três válvulas na ordem certa sem errar nenhuma vez.', secreta: true },
  { id: 'l6_sem_afundar', nome: 'Pé no Seco', desc: 'Atravesse os túneis até o cofre sem precisar afundar na água.', secreta: true },
  { id: 'l6_relampago', nome: 'Contra o Relógio', desc: 'Segure a válvula mestra a tempo quando a água volta de uma vez.', secreta: true },
  { id: 'l6_camara', nome: 'O Que Ficou Selado', desc: 'Abra a câmara dos túneis que só cede para quem já esteve aqui.', secreta: true },
  { id: 'l6_cisterna', nome: 'Fundo da Cisterna', desc: 'Ache o nicho escondido que a cisterna abre numa noite só.', secreta: true },
  { id: 'l6_isca', nome: 'Não Era Essa', desc: 'Resista a girar a válvula-isca das noites difíceis.', secreta: true },
  { id: 'l6_quarta', nome: 'A Quarta Criança', desc: 'Cave o túmulo que só aparece depois da primeira noite inteira.', secreta: true },
  { id: 'l6_coveira', nome: 'Coveira Silenciosa', desc: 'Cave os três túmulos sem que o Inspetor te escute uma vez sequer.', secreta: true },
  { id: 'l6_armadilha', nome: 'Reflexo Rápido', desc: 'Solte a pá a tempo quando a mão agarra no túmulo fundo.', secreta: true },
  { id: 'l6_sino_rapido', nome: 'Dobre Logo', desc: 'Toque o sino em até oito segundos depois do terceiro objeto.', secreta: true },
  { id: 'l6_finados', nome: 'Dia de Finados', desc: 'Visite o cemitério num 2 de novembro de verdade.', secreta: true },
  { id: 'l6_confissao', nome: 'A Confissão', desc: 'Ouça a confissão gravada do diretor no confessionário da capela.', secreta: true },
  { id: 'l6_cova_funda', nome: 'Cada Noite Mais Fundo', desc: 'Chegue ao fundo da cova que se aprofunda a cada morte.', secreta: true }
];
for (const c of CONQS) if (!R.conquistas.some(x => x.id === c.id)) R.conquistas.push(c);

// ---------------------------------------------------------------------
// memória própria do lote (recordes e descobertas entre partidas)
// ---------------------------------------------------------------------
const MEM_KEY = 'hora-silencio-l6';
const CAPS_KEY = 'hora-silencio-v3-caps';
const memLer = () => { try { return JSON.parse(localStorage.getItem(MEM_KEY) || '{}') || {}; } catch (e) { return {}; } };
const memGravar = fn => { const m = memLer(); fn(m); try { localStorage.setItem(MEM_KEY, JSON.stringify(m)); } catch (e) {} return m; };
// já terminou este capítulo antes? (segunda jogada). Em QA o save está limpo => false.
const jaVeio = capId => { try { const c = JSON.parse(localStorage.getItem(CAPS_KEY) || '{}'); return !!(c && c[capId] && c[capId].snap); } catch (e) { return false; } };

// ---------------------------------------------------------------------
// semente: rng determinístico por Semente da Noite + sal (repetível na mesma noite)
// ---------------------------------------------------------------------
function hashStr(s) { let h = 2166136261; for (const ch of String(s)) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619) >>> 0; } return h >>> 0; }
function rngDe(S, sal) {
  // mistura a semente, a ordem/código da noite e o número da noite: cada campanha muda,
  // a mesma semente repete.
  const base = (S.semente || 'SEMCOD') + '|' + sal + '|' + (S.ordem || []).join('') + (S.code || []).join('') + '|' + (S.flags && S.flags._noite || 0);
  let a = hashStr(base) || 1;
  return () => { a = (Math.imul(a, 16807) + 1) >>> 0; return (a & 0x7fffffff) / 0x7fffffff; };
}
const sorteio = (S, sal, n) => Math.min(n - 1, rngDe(S, sal)() * n | 0);

// ---------------------------------------------------------------------
// HUD de contagem reaproveitável (mesmo estilo da barra de fôlego)
// ---------------------------------------------------------------------
function barraTempo(id) {
  let el = document.getElementById(id);
  if (!el) {
    el = document.createElement('div'); el.id = id;
    el.style.cssText = 'position:absolute;left:50%;top:22%;width:220px;margin-left:-110px;height:auto;font-family:"Special Elite",monospace;font-size:15px;color:#e6c2a0;text-align:center;text-shadow:0 0 8px #000;z-index:30;pointer-events:none;opacity:0;transition:opacity .25s';
    el.innerHTML = '<span></span><i style="display:block;margin:6px auto 0;width:200px;height:4px;background:rgba(0,0,0,.5)"><b style="display:block;height:100%;width:100%;background:#d08050"></b></i>';
    const hud = document.getElementById('hud') || document.body; hud.appendChild(el);
  }
  return { el, txt: el.querySelector('span'), barra: el.querySelector('b'),
    mostrar(t) { el.querySelector('span').textContent = t; el.style.opacity = '1'; },
    k(v) { el.querySelector('b').style.width = clamp(v, 0, 1) * 100 + '%'; },
    esconder() { el.style.opacity = '0'; } };
}

// =====================================================================
// TÚNEIS DE DRENAGEM — Capítulo IV
// =====================================================================
export function tuneis(A, S, def, ctx = {}) {
  const { THREE, P, M } = A;
  const grupo = A.W.grupo;
  const som = ctx.som, O = ctx.O, B = ctx.B;
  const valvIts = ctx.valvIts || [];
  const jato = ctx.jato;
  const nivel = ctx.nivel || (() => S.flags.aguaBaixa ? .04 : .42);
  const segunda = jaVeio('c4');
  const dificil = S.dif === 'pesadelo' || (S.mods && S.mods.length > 0);

  // zera marcadores da noite
  S.flags.l6_valvErros = 0;
  let afundou = false, valvT0 = A.perf(), valvFeito = false;

  // ---------------- 1) marca de giz com a ordem, em parede sorteada ----------------
  // ajuda honesta para quem não decorou: um rabisco de giz some numa parede diferente a
  // cada semente, repetindo a ordem da fita 2 (só se a fita já foi ouvida ou numa noite fácil).
  {
    const cantos = [[-1.7, -28, 0], [1.7, -24, Math.PI], [-25, -17.6, Math.PI / 2], [25, -18.4, -Math.PI / 2], [-5.6, -40, Math.PI / 2]];
    const c = cantos[sorteio(S, 'giz-ordem', cantos.length)];
    const cv = document.createElement('canvas'); cv.width = 128; cv.height = 64;
    const g = cv.getContext('2d'); g.fillStyle = 'rgba(0,0,0,0)'; g.fillRect(0, 0, 128, 64);
    g.strokeStyle = 'rgba(220,225,210,.5)'; g.lineWidth = 3; g.font = 'bold 30px "Special Elite",monospace'; g.fillStyle = 'rgba(220,225,210,.55)';
    g.textAlign = 'center'; g.fillText((S.ordem || [1, 2, 3]).join(' '), 64, 40);
    g.beginPath(); g.moveTo(14, 54); g.lineTo(114, 52); g.stroke();
    const tex = new THREE.CanvasTexture(cv);
    const marca = new THREE.Mesh(new THREE.PlaneGeometry(.9, .45), new THREE.MeshBasicMaterial({ map: tex, transparent: true, opacity: .0, depthWrite: false }));
    marca.position.set(c[0], 1.35, c[1]); marca.rotation.y = c[2]; grupo.add(marca);
    A.W.tick.push(() => {
      const mostrar = (S.fitas && S.fitas.f2) || S.dif === 'facil';
      const d = Math.hypot(P.pos.x - c[0], P.pos.z - c[1]);
      const perto = mostrar && d < 4 && S.flashOn;
      marca.material.opacity += ((perto ? .55 : 0) - marca.material.opacity) * .1;
    });
  }

  // ---------------- 2) castigo vivo do erro de válvula (segunda jogada) ----------------
  // na rejogada, errar não é inofensivo: o estouro chama o Inspetor para o túnel.
  if (jato) {
    let jatoVisto = false, erros = 0;
    A.W.tick.push(() => {
      if (jato.visible && !jatoVisto) {
        jatoVisto = true; erros++; S.flags.l6_valvErros = erros;
        if ((segunda || S.replay) && !emTeste() && !S.flags.aguaBaixa) {
          const ex = jato.position.x, ez = jato.position.z;
          if (!M.ativo) A.ativarInspetor(ex, ez + (ez < -20 ? 6 : -6), 'investiga');
          else { A.planejar(M, ex, ez); M.state = 'investiga'; M.searchT = 0; M.furia = Math.min(6, (M.furia || 0) + 1 + erros); M.cool = Math.min(M.cool, 1); }
          A.emitNoise(ex, ez, 20);
          A.toast('O estouro ecoou pelos canos. Ele vem ver o que foi.');
        }
      } else if (!jato.visible) jatoVisto = false;
    });
  }

  // ---------------- 3) válvula-isca das noites difíceis ----------------
  // em Pesadelo ou com mutadores, uma quarta válvula de isca: girar solta vapor barulhento.
  if (dificil) {
    const cand = [[4, -41.85, 0], [33.85, -21, -Math.PI / 2]];
    const [vx, vz, vry] = cand[sorteio(S, 'isca-pos', cand.length)];
    const g = new THREE.Group(); g.position.set(vx, 1.3, vz); g.rotation.y = vry; grupo.add(g);
    const giro = new THREE.Group(); giro.position.z = .15; g.add(giro);
    giro.add(new THREE.Mesh(new THREE.TorusGeometry(.28, .04, 6, 16), A.MAT.ferrugem));
    for (let i = 0; i < 3; i++) { const r = A.box(.55, .03, .03, A.MAT.ferrugem, 0, 0, 0, giro); r.rotation.z = i * Math.PI / 3; }
    A.cyl(.08, .08, .3, A.MAT.ferrugem, 0, 0, 0, 8, g).rotation.x = Math.PI / 2;
    // placa com número gasto/riscado (parece tentadora)
    const cv = document.createElement('canvas'); cv.width = 128; cv.height = 128; const c2 = cv.getContext('2d');
    c2.fillStyle = '#2a2018'; c2.fillRect(0, 0, 128, 128); c2.fillStyle = '#9a7a3a'; c2.font = 'bold 90px Georgia'; c2.textAlign = 'center';
    c2.fillText('4', 64, 94); c2.strokeStyle = 'rgba(20,14,8,.8)'; c2.lineWidth = 6; c2.beginPath(); c2.moveTo(30, 30); c2.lineTo(100, 100); c2.stroke();
    const placa = A.plano(.33, .33, new THREE.MeshStandardMaterial({ map: new THREE.CanvasTexture(cv), emissive: 0x201408, emissiveIntensity: .5 }), 0, .6, .02, 0, g);
    let girada = false; let girT = 0;
    const it = A.interact(g, () => girada ? 'Válvula 4 — travada e inútil.' : S.flags.aguaBaixa ? 'Válvula 4 (não faz nada).' : '<b>E</b>Girar a válvula 4 (segure)', () => {
      if (girada || S.flags.aguaBaixa) return;
      girada = true; girT = 1.2; S.flags.l6_iscaGirou = true;
      som && som.dissonante({ x: vx, z: vz }); A.SFX.cano({ x: vx, y: 2.4, z: vz });
      A.P.shake = .16; A.emitNoise(vx, vz, 16, true); S.fear = Math.min(100, S.fear + 20);
      A.toast('Vapor! Essa não baixava a água — era isca. O barulho chamou alguém.');
      if (!emTeste() && !S.flags.aguaBaixa) { if (!M.ativo) A.ativarInspetor(vx, vz - 6, 'investiga'); else { A.planejar(M, vx, vz); M.furia = Math.min(6, (M.furia || 0) + 2); } }
    });
    it.hold = 1.6; it.som = null; it.pode = () => !girada && !S.flags.aguaBaixa;
    Object.defineProperty(it, 'ruido', { get: () => girada ? 0 : 2 });
    A.W.tick.push(dt => { if (girT > 0) { girT -= dt; giro.rotation.z -= dt * 2; } });
    // quem termina os túneis sem cair na isca ganha a conquista
    A.W.tick.push(() => { if (S.flags.aguaBaixa && !S.flags.l6_iscaGirou && !S.flags.l6_iscaOk) { S.flags.l6_iscaOk = true; A.conquista('l6_isca'); } });
  }

  // ---------------- 4) recorde de válvulas + conquistas (sem erro / pé no seco) ----------------
  A.W.tick.push(() => {
    if (!valvFeito && S.flags.aguaBaixa) {
      valvFeito = true;
      const t = Math.max(0, A.perf() - valvT0);
      const m = memGravar(mm => { if (!mm.recValv || t < mm.recValv) { mm._recValvNovo = t < (mm.recValv || 1e9); mm.recValv = t; } else mm._recValvNovo = false; });
      if (m._recValvNovo && !emTeste()) A.toast(`Recorde das válvulas: ${t.toFixed(1)}s.`);
      if ((S.flags.l6_valvErros || 0) === 0) A.conquista('l6_valv_perfeita');
      if (!afundou) A.conquista('l6_sem_afundar');
    }
    if (ctx.sub && ctx.sub.on) afundou = true;
  });

  // ---------------- 5) caçada relâmpago (rara, sorteada, só na 2ª jogada) ----------------
  // depois de baixar a água, numa noite sorteada a cisterna ribomba e uma válvula mestra
  // começa a abrir sozinha: corra e segure-a antes do tempo acabar enquanto o Inspetor desce.
  if (segunda && !emTeste()) {
    const relampago = rngDe(S, 'relampago')() < .45; // ~45% das noites de rejogo
    const hud = barraTempo('fx-l6-relampago');
    const tMax = () => 10 + (S.dif === 'facil' ? 4 : 0);
    let fase = 0, tLim = 10;
    // roda mestra no centro da cisterna: segurar E para travá-la (hold com progresso guardado)
    const mx = 0, mz = -36;
    const gm = new THREE.Group(); gm.position.set(mx, 1.1, mz + 1.6); gm.visible = false; grupo.add(gm);
    gm.add(new THREE.Mesh(new THREE.TorusGeometry(.4, .06, 8, 20), A.MAT.bronze));
    for (let i = 0; i < 4; i++) { const r = A.box(.8, .04, .04, A.MAT.bronze, 0, 0, 0, gm); r.rotation.z = i * Math.PI / 4; }
    const itM = A.interact(gm, () => fase === 1 ? '<b>E</b>Segurar a válvula mestra' : 'A válvula mestra.', () => {
      if (fase !== 1) return;
      fase = 2; hud.esconder(); gm.visible = false; A.conquista('l6_relampago');
      if (som && som.nota) som.nota(196, { x: mx, z: mz }); A.toast('Você travou a mestra. A água para de subir.');
      if (M.ativo) M.furia = Math.max(0, (M.furia || 0) - 2);
    });
    itM.hold = 2.6; itM.guarda = true; itM.som = 'forcar'; itM.pode = () => fase === 1; itM.ruido = 5;
    A.W.tick.push(dt => {
      if (!relampago || fase === 2) return;
      if (fase === 0) {
        if (S.flags.aguaBaixa && S.done && S.done.valvulas && P.room && (P.room.id === 'hub' || P.room.id === 't4' || P.room.id === 'secreta')) {
          fase = 1; tLim = tMax(); gm.visible = true; itM.progresso = 0;
          if (som && som.dissonante) som.dissonante({ x: mx, z: mz }); A.SFX.pancada(mx, mz); A.P.shake = .2; S.fear = Math.min(100, S.fear + 25);
          A.toast('A cisterna ribomba — a água está voltando! Segure a válvula mestra.');
          if (!M.ativo) A.ativarInspetor(mx, mz, 'caca'); else { M.state = 'caca'; A.planejar(M, mx, mz); }
        }
        return;
      }
      // fase 1: contagem; o motor cuida de segurar E e chama o act() ao completar
      tLim -= dt; hud.mostrar('A ÁGUA VOLTA'); hud.k(Math.max(0, tLim) / tMax());
      if (A.perf() - (itM.seguradoT ?? -9) < .12) gm.rotation.z -= dt * 3;
      if (tLim <= 0) { // falhou
        fase = 2; hud.esconder(); gm.visible = false;
        A.emitNoise(mx, mz, 22, true); A.P.shake = .3; S.fear = Math.min(100, S.fear + 30);
        if (som && som.jato) som.jato({ x: mx, y: 2, z: mz }, 3); A.toast('A água voltou com tudo. Corra — ele ouviu.');
        if (M.ativo) M.furia = Math.min(6, (M.furia || 0) + 3);
      }
    });
  }

  // ---------------- 6) nicho sorteado da cisterna (colecionável que muda por semente) ----------------
  {
    const nichos = [[-5.7, -33, Math.PI / 2, 'um apito de lata amassado'], [5.7, -39, -Math.PI / 2, 'um carretel de linha vermelha'], [0, -41.7, 0, 'uma dentadura de leite num lenço']];
    const idx = sorteio(S, 'cisterna-nicho', nichos.length);
    const [nx, nz, nry, oque] = nichos[idx];
    const g = new THREE.Group(); g.position.set(nx, 1.1, nz); g.rotation.y = nry; grupo.add(g);
    const tampa = A.box(.5, .7, .08, A.texMat('tijolo', .4, .5), 0, 0, 0, g);
    const bzr = new THREE.MeshStandardMaterial({ color: 0x8a7030, emissive: 0x3a2a08, emissiveIntensity: .7, roughness: .6 });
    const joia = A.box(.1, .07, .1, bzr, 0, -.05, .12, g, false); joia.visible = false;
    let aberto = !!S.flags.l6_cisterna, pego = !!S.flags.l6_cisternaPego;
    if (aberto) { tampa.position.z = -.3; tampa.rotation.x = .4; joia.visible = !pego; }
    const it = A.interact(g, () => {
      if (pego) return 'O nicho vazio na parede.';
      if (!aberto) return '<b>E</b>Forçar a tampa solta na parede';
      return `<b>E</b>Pegar: ${oque}`;
    }, () => {
      if (pego) return;
      if (!aberto) { aberto = true; S.flags.l6_cisterna = true; tampa.position.z = -.3; tampa.rotation.x = .4; joia.visible = true; A.SFX.pancada(nx, nz); A.emitNoise(nx, nz, 6); A.conquista('l6_cisterna'); A.toast('Um tijolo solto escondia um nicho. Tem algo dentro.'); return; }
      pego = true; S.flags.l6_cisternaPego = true; joia.visible = false; A.SFX.pegar(); A.toast(`Você guardou ${oque}.`);
      memGravar(mm => { mm.achados = mm.achados || {}; mm.achados['cisterna' + idx] = true; });
    });
    it.som = 'forcar';
  }

  // ---------------- 7) câmara selada (só abre para quem já esteve aqui antes) ----------------
  if (segunda) {
    // atrás do depósito: uma porta de pedra que o internato "lembra".
    const cx = -31.7, cz = -33;
    const g = new THREE.Group(); g.position.set(cx, 0, cz); g.rotation.y = -Math.PI / 2; grupo.add(g);
    const laje = A.box(.16, 2.2, 1.4, A.texMat('pedra', .5, .6), 0, 1.1, 0, g);
    A.box(.02, .4, .02, A.MAT.ferrugem, .1, 1.1, 0, g, false);
    let aberta = !!S.flags.l6_camara, pego = !!S.flags.l6_camaraPego, abrT = aberta ? 1 : 0;
    const cosm = ['uma lanterna de latão da enfermaria', 'um crachá velho com a foto raspada', 'o caderno de presença de 1979'][sorteio(S, 'camara-item', 3)];
    const gizMsg = ['A HORA É SUA', 'VOCÊ VOLTOU', 'AINDA DÁ TEMPO'][sorteio(S, 'camara-giz', 3)];
    // sussurro curto denuncia a câmara antes de você abri-la
    let suss = false;
    A.W.tick.push(() => { if (!suss && !aberta && Math.hypot(P.pos.x - cx, P.pos.z - cz) < 3.5) { suss = true; if (som && som.respiraAgua) som.respiraAgua({ x: cx, y: 1, z: cz }, .18); } });
    const it = A.interact(g, () => {
      if (pego) return 'A câmara aberta, vazia.';
      if (!aberta) return '<b>E</b>Empurrar a laje (ela range — o internato lembra de você)';
      return `<b>E</b>Entrar e pegar ${cosm}`;
    }, () => {
      if (pego) return;
      if (!aberta) {
        aberta = true; S.flags.l6_camara = true; A.conquista('l6_camara');
        if (A.SFX.rangido) A.SFX.rangido(cx, 1.2, cz, 1); A.SFX.pancada(cx, cz); A.emitNoise(cx, cz, 8);
        A.sub('lia', 'A pedra cedeu. Como se já me conhecesse.');
        // fala gravada de fecho (áudio procedural curto)
        confissaoCurta(A, { x: cx, y: 1.2, z: cz }, 'tuneis');
        return;
      }
      pego = true; S.flags.l6_camaraPego = true; A.SFX.pegar();
      A.toast(`Dentro, ${cosm}. E, no fundo, giz: "${gizMsg}".`);
      memGravar(mm => { mm.camara = true; });
    });
    it.som = 'forcar';
    A.W.tick.push(dt => { abrT += ((aberta ? 1 : 0) - abrT) * Math.min(1, dt * 2); laje.position.x = -abrT * .5; laje.rotation.y = -abrT * .5; });
  }

  // ---------------- 8) fala de reconhecimento na 2ª jogada ----------------
  if (segunda) {
    let disse = false;
    A.W.tick.push(() => { if (!disse && P.room && P.room.id === 't1' && S.chapter === 4) { disse = true; setTimeout(() => { if (A.W.mapa === 'tuneis') A.sub('lia', 'De novo esse cheiro de água parada. Eu já desci aqui. Meu corpo lembra do caminho.'); }, 1800); } });
  }

  // ---------------- 9) respiração telegrafada em pontos sorteados ----------------
  // o susto da água deixa de ser sempre no mesmo lugar: dois pontos sorteados soltam bolhas
  // antes de a respiração vir de lá (telegrafa o maior susto do capítulo).
  if (som && B) {
    const pontos = [[-24, -17.8], [24, -17.8], [-4, -34], [4, -38], [0, -50]];
    const r = rngDe(S, 'respira');
    const esc = pontos.slice().sort(() => r() - .5).slice(0, 2);
    for (const [bx, bz] of esc) {
      let acc = A.rand(10, 22), avisa = 0;
      A.W.tick.push(dt => {
        if (S.flags.aguaBaixa || !(P.room && P.room.agua)) return;
        acc -= dt;
        if (acc <= 0 && avisa <= 0) { avisa = 2.4; if (Math.hypot(P.pos.x - bx, P.pos.z - bz) < 10) { som.respiraAgua({ x: bx, y: .3, z: bz }, .3); } acc = A.rand(16, 30); }
        if (avisa > 0) { avisa -= dt; if (Math.random() < dt * 7) B.emitir(bx, (nivel()), bz, 1, .25); }
      });
    }
  }

  // ---------------- 10) giz vermelho com a pista do cofre, parede sorteada ----------------
  {
    const walls = [[-1.8, -46, 0], [1.8, -50, Math.PI], [-7.6, -58, Math.PI / 2], [6.6, -62, -Math.PI / 2]];
    const w = walls[sorteio(S, 'giz-cofre', walls.length)];
    const cv = document.createElement('canvas'); cv.width = 96; cv.height = 64; const g = cv.getContext('2d');
    g.clearRect(0, 0, 96, 64); g.fillStyle = 'rgba(190,40,30,.6)'; g.font = 'bold 18px "Special Elite",monospace'; g.textAlign = 'center';
    g.fillText('4 números', 48, 26); g.fillText('= cofre', 48, 48);
    const marca = new THREE.Mesh(new THREE.PlaneGeometry(.7, .46), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(cv), transparent: true, opacity: 0, depthWrite: false }));
    marca.position.set(w[0], 1.5, w[1]); marca.rotation.y = w[2]; grupo.add(marca);
    A.W.tick.push(() => { const d = Math.hypot(P.pos.x - w[0], P.pos.z - w[1]); marca.material.opacity += (((d < 3.5 && S.flashOn) ? .6 : 0) - marca.material.opacity) * .1; });
  }

  // ---------------- 11) lâmpada de emergência piscando vermelha num ponto sorteado ----------------
  {
    const pts = [[-26, -16], [26, -16], [0, -48], [15, -36]];
    const [lx, lz] = pts[sorteio(S, 'luz-vermelha', pts.length)];
    const luz = new THREE.PointLight(0xff2a1a, 0, 5, 2); luz.position.set(lx, 2.3, lz); grupo.add(luz);
    let fase = A.rand(0, 6);
    A.W.tick.push(dt => { fase += dt * 3; luz.intensity = (Math.sin(fase) > .4 ? 1 : 0) * (S.flags.apagao ? 1.4 : .7) * (S.flags.energia || S.flags.apagao ? 1 : .5); });
  }

  // ---------------- 12) recorde de travessia (entrada → escotilha) ----------------
  {
    const t0 = A.perf();
    A.W.tick.push(() => {
      if (S.done && S.done.sair_tuneis && !S._l6travReg) {
        S._l6travReg = true; const t = Math.max(0, A.perf() - t0);
        const m = memGravar(mm => { if (!mm.recTrav || t < mm.recTrav) { mm._nt = t < (mm.recTrav || 1e9); mm.recTrav = t; } else mm._nt = false; });
        if (m._nt && !emTeste()) A.toast(`Recorde de travessia dos túneis: ${t.toFixed(1)}s.`);
      }
    });
  }

  // ---------------- 13) cor da tela submersa varia por semente ----------------
  {
    const tons = [[18, 48, 36], [30, 40, 50], [40, 36, 20], [26, 42, 30]];
    const c = tons[sorteio(S, 'tela-agua', tons.length)];
    const el = document.getElementById('fx-submersa');
    if (el) el.style.background = `radial-gradient(ellipse at center,rgba(${c[0]},${c[1]},${c[2]},.5) 5%,rgba(4,14,10,.96) 100%)`;
  }

  // ---------------- 14) pingo d'água sorteado (ambiência) ----------------
  if (som && som.bolhas) {
    const px = A.rand(-2, 2), pz = A.rand(-50, -44), intervalo = 1.4 + rngDe(S, 'pingo')() * 2.2;
    let acc = A.rand(0, intervalo);
    A.W.tick.push(dt => { if (S.flags.aguaBaixa) return; acc -= dt; if (acc <= 0) { acc = intervalo + A.rand(-.3, .5); if (Math.hypot(P.pos.x - px, P.pos.z - pz) < 14) som.bolhas({ x: px, y: .4, z: pz }, 1, .12); } });
  }

  // ---------------- 15) acorde de confirmação das válvulas com raiz sorteada ----------------
  if (som && som.nota) {
    const raizes = [130.81, 146.83, 164.81, 174.61];
    const raiz = raizes[sorteio(S, 'acorde', raizes.length)];
    let tocou = false;
    A.W.tick.push(() => { if (S.flags.aguaBaixa && !tocou) { tocou = true; [0, 4, 7].forEach((semi, i) => setTimeout(() => { if (A.W.mapa === 'tuneis' && som.nota) som.nota(raiz * Math.pow(2, semi / 12), null, .22); }, 450 + i * 180)); } });
  }

  // ---------------- 16) lembrete do seu recorde ao entrar (2ª jogada) ----------------
  if (segunda && !emTeste()) {
    let avisou = false;
    A.W.tick.push(() => {
      if (avisou || S.chapter !== 4) return; avisou = true;
      const m = memLer();
      if (m.recValv) setTimeout(() => { if (A.W.mapa === 'tuneis') A.toast(`Seu recorde das válvulas aqui: ${m.recValv.toFixed(1)}s. Tente bater.`); }, 2600);
    });
  }

  return def;
}

// =====================================================================
// CEMITÉRIO E CAPELA — Capítulo V (final)
// =====================================================================
export function cemiterio(A, S, def, ctx = {}) {
  const { THREE, P, M } = A;
  const grupo = A.W.grupo;
  const som = ctx.som;
  const covas = ctx.covas || [];
  const itsTum = ctx.itsTum || {};
  const lapide = ctx.lapide, emCima = ctx.emCima, objeto = ctx.objeto;
  const segunda = jaVeio('c5');
  const hoje = new Date();
  const finados = hoje.getMonth() === 10 && hoje.getDate() === 2;

  // marcadores da noite
  let ouvidoCavando = false, digT0 = 0, digFeito = false, placedT = 0, nTum = () => Object.keys(S.tumulos).length;

  // ---------------- 9) túmulo-armadilha sorteado ("fundo") ----------------
  // um dos três túmulos a cavar é sorteado como fundo: ao terminar, uma mão agarra e você
  // tem ~1,1s para soltar a pá (apertar uma tecla) ou toma dano e faz barulho.
  {
    const ids = Object.keys(itsTum);
    if (ids.length) {
      const fundoId = ids[sorteio(S, 'tumulo-fundo', ids.length)];
      let armado = false, janela = 0, ultimoN = nTum();
      const ancora = new THREE.Vector3();
      // soltar = se mexer (sair do lugar) durante a janela; sem ouvinte global, à prova de QA
      A.W.tick.push(dt => {
        const n = nTum();
        if (n > ultimoN) { // acabou de cavar um túmulo neste quadro
          ultimoN = n;
          if (S.tumulos[fundoId] && !armado && !emTeste()) {
            armado = true; janela = 1.1; ancora.copy(P.pos);
            const alvo = itsTum[fundoId] && itsTum[fundoId].L;
            const p = alvo ? emCima(alvo.g, 0, .1, -1) : { x: P.pos.x, y: .1, z: P.pos.z };
            if (som && som.terra) som.terra(p); A.SFX.susto(); A.P.shake = .18; S.fear = Math.min(100, S.fear + 25);
            A.toast('Uma mão agarrou a pá! Largue — ande para trás agora!');
          }
        }
        if (janela > 0) {
          if (Math.hypot(P.pos.x - ancora.x, P.pos.z - ancora.z) > .5) { // mexeu a tempo
            janela = 0; armado = false; A.conquista('l6_armadilha'); A.toast('Você largou a pá e recuou. A mão escorregou de volta.');
          } else {
            janela -= dt;
            if (janela <= 0) { // não saiu a tempo
              if (S.health > 20) S.health -= 10; A.P.shake = .3; A.emitNoise(P.pos.x, P.pos.z, 10, true); S.fear = Math.min(100, S.fear + 20);
              A.toast('Ela te puxou para a terra antes de você soltar. Barulho demais.');
            }
          }
        }
      });
    }
  }

  // ---------------- 10) conquista: coveira silenciosa ----------------
  A.W.tick.push(() => {
    if (M.ativo && M.state === 'caca' && (S.inv.pa) && Object.keys(S.tumulos).length < 3) {
      // se ele entrou em caça enquanto ainda havia túmulos a cavar, perdeu a chance
      if (!digFeito) ouvidoCavando = true;
    }
    if (!digFeito && Object.keys(S.tumulos).length >= 3) {
      digFeito = true;
      if (!ouvidoCavando) A.conquista('l6_coveira');
    }
  });

  // ---------------- 11) quarto túmulo: a Quarta Criança (só na 2ª jogada) ----------------
  if (segunda && lapide && emCima) {
    const qx = 6.5, qz = -2.4;
    const L = lapide(qx, qz, { nome: '— sem nome —', datas: '19?? — 1979', frase: 'a que ninguém contou' });
    // uma vela discreta e um objeto em cima
    const pv = emCima(L.g, .3, .12, -.45);
    const vela = A.vela ? A.vela(pv.x, pv.y, pv.z) : null;
    const bzr = new THREE.MeshStandardMaterial({ color: 0x6a6058, roughness: .9 });
    const ob = A.box(.1, .04, .14, bzr, 0, 0, 0, grupo, false); const po = emCima(L.g, -.12, .13, -1.15); ob.position.copy(po); ob.rotation.y = 1;
    let pego = !!S.flags.l6_quartaPego; if (pego) ob.visible = false;
    // usa flag própria (NUNCA S.tumulos): o cofre/capela contam Object.keys(S.tumulos)
    const it = A.interact(L.g, () => {
      if (S.flags.l6_quartaCavada) return 'A quarta cova — já aberta.';
      if (!S.inv.pa) return 'Uma cova sem nome, fora da fileira. Uma vela nova acesa.';
      const kk = Math.min(1, (it.progresso || 0) / it.hold);
      return `<b>E</b>Cavar a cova sem nome ${kk > .02 ? `(${Math.round(kk * 100)}%)` : '(segure)'}`;
    }, () => {
      if (S.flags.l6_quartaCavada || !S.inv.pa) return;
      S.flags.l6_quartaCavada = true; it.progresso = 0; A.SFX.pegar(); A.conquista('l6_quarta');
      ob.visible = false; if (vela) vela.userData.apagada = true;
      A.sub('lia', 'Mais uma. Sem nome, sem data certa. A quarta criança — a que não entrou em nenhuma lista.');
      A.toast('Você achou uma mecha de cabelo amarrada com barbante e um bilhete sem assinatura.');
      memGravar(mm => { mm.quarta = true; });
    });
    it.hold = 4; it.guarda = true; it.som = 'cavar'; it.pode = () => !!S.inv.pa && !S.flags.l6_quartaCavada;
    Object.defineProperty(it, 'ruido', { get: () => 6 + 4 * Math.min(1, (it.progresso || 0) / it.hold) });
  }

  // ---------------- 12) a cova que se aprofunda (memória entre mortes) ----------------
  // a cova aberta (a que cede) fica uma pá mais funda a cada noite em que você morreu aqui,
  // até revelar, no fundo, um pequeno segredo semeado.
  if (covas.length) {
    const prof = (memLer().covaProf || 0);
    const c = covas[sorteio(S, 'cova-funda', covas.length)];
    if (prof > 0 && c && c.monte) { c.monte.position.y = .05 - Math.min(.18, prof * .06); c.g.rotation.x = -Math.min(.3, prof * .1); }
    if (prof >= 3) {
      // no fundo, um segredo
      const p = { x: c.x, y: .02, z: c.z };
      const bzr = new THREE.MeshStandardMaterial({ color: 0x8a7030, emissive: 0x3a2a08, emissiveIntensity: .8, roughness: .6 });
      const relic = A.box(.08, .05, .12, bzr, c.x, .02, c.z - .9, grupo, false);
      let pego = !!S.flags.l6_covaFundaPego;
      relic.visible = !pego;
      const it = A.interact(relic, () => pego ? 'O fundo da cova.' : '<b>E</b>Tirar o que está no fundo da cova', () => {
        if (pego) return; pego = true; S.flags.l6_covaFundaPego = true; relic.visible = false; A.SFX.pegar(); A.conquista('l6_cova_funda');
        A.toast('No fundo, uma fita sem caixa e um nome gravado na tampa: o seu.');
      });
      it.on = () => relic.visible;
    }
    // registra a morte neste mapa para aprofundar na próxima
    const marcarMorte = () => { if (A.W.mapa === 'cemiterio' && S.dead && !S._l6contou) { S._l6contou = true; memGravar(mm => { mm.covaProf = Math.min(3, (mm.covaProf || 0) + 1); }); } };
    A.W.tick.push(marcarMorte);
  }

  // ---------------- 13) Dia de Finados (2 de novembro de verdade) ----------------
  if (finados) {
    A.conquista('l6_finados');
    // velas acesas entre as cruzes
    for (const c of covas.slice(0, 18)) if (A.vela && Math.random() < .5) A.vela(c.x + 0.3, .08, c.z - .2);
    // uma lápide a mais, só nessa data
    if (lapide) { const L = lapide(-6.5, -2.4, { nome: 'TODAS AS OUTRAS', datas: '† 2 de novembro', frase: 'rezem por quem não tem quem reze' }); }
    setTimeout(() => { if (A.W.mapa === 'cemiterio') A.sub('lia', 'Alguém acendeu velas em todas as covas. É dia de finados. Elas sabem.'); }, 3000);
  }

  // ---------------- 14) confessionário do Albano (2ª jogada / 3ª noite) ----------------
  const podeConfessar = segunda || (S.flags && S.flags._noite >= 3);
  if (podeConfessar) {
    // dentro da capela, no canto, uma caixa de madeira queimada
    const fx = -6, fz = -58;
    const g = new THREE.Group(); g.position.set(fx, 0, fz); g.rotation.y = Math.PI / 2; grupo.add(g);
    const mad = A.MAT.madeiraEsc;
    A.box(1.1, 2.4, .1, mad, 0, 1.2, -.6, g); A.box(1.1, 2.4, .1, mad, 0, 1.2, .6, g); A.box(.1, 2.4, 1.3, mad, -.5, 1.2, 0, g);
    A.box(1.1, .1, 1.3, mad, 0, 2.4, 0, g); A.box(1.1, .9, .06, mad, 0, 1.1, .64, g, false);
    A.addCollider(fx - .6, fx + .6, fz - .7, fz + .7);
    let ouviu = !!S.flags.l6_confissao, tocando = 0;
    const it = A.interact(g, () => ouviu ? 'O confessionário. Silêncio agora.' : '<b>E</b>Abrir o confessionário e escutar', () => {
      if (ouviu) return;
      ouviu = true; S.flags.l6_confissao = true; A.conquista('l6_confissao'); tocando = 1;
      confissaoCurta(A, { x: fx, y: 1.4, z: fz }, 'capela');
      const falas = [
        ['albano', 'Padre, faz tempo que não me confesso. Eu fechei a porta dos túneis com eles dentro.'],
        ['albano', 'A água subiu devagar. Eu contei as badaladas e não desci.'],
        ['albano', 'Diga a Deus que eu só queria silêncio. Era só isso que eu queria. Silêncio.']
      ];
      falas.forEach(([q, t], i) => setTimeout(() => { if (A.W.mapa === 'cemiterio') A.sub(q, t); }, 1200 + i * 3400));
    });
    it.som = 'forcar';
    A.W.tick.push(dt => { if (tocando > 0) tocando -= dt; });
  }

  // ---------------- 15) recorde do sino + conquista "Dobre Logo" ----------------
  A.W.tick.push(dt => {
    if (S.placed >= 3 && !placedT) placedT = A.perf();
    if (S.flags.sino && placedT && !S._l6sinoReg) {
      S._l6sinoReg = true;
      const dt2 = Math.max(0, A.perf() - placedT);
      const m = memGravar(mm => { if (!mm.recSino || dt2 < mm.recSino) { mm._novo = dt2 < (mm.recSino || 1e9); mm.recSino = dt2; } else mm._novo = false; });
      if (dt2 <= 8) A.conquista('l6_sino_rapido');
      if (m._novo && !emTeste()) setTimeout(() => A.toast(`Recorde do sino: ${dt2.toFixed(1)}s depois do último objeto.`), 1500);
    }
  });

  // ---------------- 16) marca de giz com a ordem de cavar (ajuda sorteada) ----------------
  if (ctx.importantes) {
    const ids = Object.keys(ctx.importantes);
    if (ids.length >= 2) {
      const ordem = ids.slice().sort(() => rngDe(S, 'cavar-ordem')() - .5);
      const nomeCurto = { ana: 'A', tome: 'T', davi: 'D' };
      const texto = ordem.map(i => nomeCurto[i] || '?').join(' › ');
      const cv = document.createElement('canvas'); cv.width = 128; cv.height = 48; const g = cv.getContext('2d');
      g.clearRect(0, 0, 128, 48); g.fillStyle = 'rgba(220,220,210,.5)'; g.font = 'bold 26px "Special Elite",monospace'; g.textAlign = 'center'; g.fillText(texto, 64, 34);
      const marca = new THREE.Mesh(new THREE.PlaneGeometry(1, .4), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(cv), transparent: true, opacity: 0, depthWrite: false }));
      // no portão de entrada (coluna de pedra)
      marca.position.set(1.4, 1.3, 11.6); marca.rotation.y = Math.PI; grupo.add(marca);
      A.W.tick.push(() => { const d = Math.hypot(P.pos.x - 1.4, P.pos.z - 11.6); marca.material.opacity += (((d < 3 && S.flashOn) ? .5 : 0) - marca.material.opacity) * .1; });
    }
  }

  // ---------------- 17) fala de reconhecimento na 2ª jogada ----------------
  if (segunda) {
    let disse = false;
    A.W.tick.push(() => { if (!disse && P.room && P.room.id === 'cem' && S.chapter === 5) { disse = true; setTimeout(() => { if (A.W.mapa === 'cemiterio') A.sub('lia', 'As três velas de novo, no mesmo lugar. Eu sei onde cada um está. Isso não me deixa mais calma.'); }, 2000); } });
  }

  // ---------------- 18) neblina mais densa / com cor sorteada ----------------
  if (ctx.neblina && ctx.neblina.material) {
    const n = ctx.neblina;
    if (rngDe(S, 'neblina')() < .4) { n.material.opacity = Math.min(.5, (n.material.opacity || .28) + .12); def.fora = { ...(def.fora || {}), fog: (def.fora && def.fora.fog || .042) + .012 }; }
    // tom da neblina muda por semente (cinza, esverdeada ou azulada de defunto)
    if (n.material.color) { const cor = [0x9aa0a0, 0x8aa094, 0x8a98b0][sorteio(S, 'neblina-cor', 3)]; n.material.color.setHex(cor); }
  }

  // ---------------- 19) fogo-fátuo sorteado entre as covas ----------------
  // uma luz azul fria nasce num ponto sorteado e vaga até uma cova específica; chegar perto
  // dela mostra um nome raspado na pedra e some.
  if (covas.length) {
    const alvo = covas[sorteio(S, 'fatuo-alvo', covas.length)];
    const cores = [[0x5aa0ff, 0x9ac8ff], [0x5affc0, 0xa0ffe0], [0xc0a0ff, 0xe0c8ff]][sorteio(S, 'fatuo-cor', 3)];
    const ox = A.rand(-18, 18), oz = -10 - A.rand(0, 20);
    const luz = new THREE.PointLight(cores[0], 0, 4, 2); luz.position.set(ox, .6, oz); grupo.add(luz);
    const bola = new THREE.Mesh(new THREE.SphereGeometry(.05, 8, 6), new THREE.MeshBasicMaterial({ color: cores[1], transparent: true, opacity: .7 })); bola.position.copy(luz.position); grupo.add(bola);
    let k = 0, achou = !!S.flags.l6_fatuo, vis = true; bola.visible = luz.visible = false;
    A.W.tick.push(dt => {
      if (achou || S.chapter !== 5) { bola.visible = luz.visible = false; return; }
      const d = Math.hypot(P.pos.x - bola.position.x, P.pos.z - bola.position.z);
      const noEscuro = !S.flashOn || d > 6;
      bola.visible = luz.visible = noEscuro;
      luz.intensity = noEscuro ? .9 + Math.sin(A.perf() * 4) * .2 : 0;
      k = Math.min(1, k + dt * .04);
      bola.position.set(ox + (alvo.x - ox) * k, .6 + Math.sin(A.perf() * 2) * .1, oz + (alvo.z - oz) * k);
      luz.position.copy(bola.position);
      if (k >= 1 && Math.hypot(P.pos.x - alvo.x, P.pos.z - alvo.z) < 2) { achou = true; S.flags.l6_fatuo = true; bola.visible = luz.visible = false; A.SFX.estalo({ x: alvo.x, z: alvo.z }, .4); S.fear = Math.min(100, S.fear + 10); A.sub('lia', 'A luz parou numa cova sem cruz. Dá pra ler um nome raspado na pedra. É o meu sobrenome.'); }
    });
  }

  // ---------------- 20) corvo sorteado numa árvore seca ----------------
  {
    const poleiros = [[-20, -10], [18, -30], [-14, -38], [22, 2], [-24, 4]];
    const [cx, cz] = poleiros[sorteio(S, 'corvo', poleiros.length)];
    const corvo = new THREE.Group(); corvo.position.set(cx, 3.4, cz); grupo.add(corvo);
    A.box(.18, .16, .32, A.MAT.preto, 0, 0, 0, corvo, false);
    const bico = A.box(.05, .04, .12, new THREE.MeshStandardMaterial({ color: 0x2a1a08 }), 0, .02, .2, corvo, false);
    let voou = false;
    A.W.tick.push(dt => {
      if (voou) { corvo.position.y += dt * 4; corvo.position.x += dt * 2; if (corvo.position.y > 14) corvo.visible = false; return; }
      corvo.rotation.y = Math.sin(A.perf() * .7) * .3;
      if (Math.hypot(P.pos.x - cx, P.pos.z - cz) < 5) { voou = true; A.SFX.estalo({ x: cx, z: cz }, .3); A.P.shake = Math.max(A.P.shake, .06); S.fear = Math.min(100, S.fear + 6); }
    });
  }

  // ---------------- 21) caminho de velas até o confessionário (2ª jogada) ----------------
  if (podeConfessar && A.vela) {
    const passos = [[-2, -50], [-3.4, -53], [-4.6, -56], [-5.4, -58.4]];
    for (const [vx, vz] of passos) A.vela(vx, .06, vz);
  }

  // ---------------- 22) segundo corvo em sementes mais cheias ----------------
  if (rngDe(S, 'corvo2')() < .35) {
    const p2 = [[14, -38], [-24, -10], [22, -30]][sorteio(S, 'corvo2-pos', 3)];
    const c2 = new THREE.Group(); c2.position.set(p2[0], 3.2, p2[1]); grupo.add(c2);
    A.box(.16, .14, .3, A.MAT.preto, 0, 0, 0, c2, false);
    let voou2 = false;
    A.W.tick.push(dt => { if (voou2) { c2.position.y += dt * 4; if (c2.position.y > 13) c2.visible = false; return; } c2.rotation.y = Math.sin(A.perf() * .6 + 1) * .3; if (Math.hypot(P.pos.x - p2[0], P.pos.z - p2[1]) < 5) { voou2 = true; A.SFX.estalo({ x: p2[0], z: p2[1] }, .25); } });
  }

  // ---------------- 23) lembrete do seu recorde do sino ao entrar (2ª jogada) ----------------
  if (segunda && !emTeste()) {
    let avisou = false;
    A.W.tick.push(() => { if (avisou || S.chapter !== 5) return; avisou = true; const m = memLer(); if (m.recSino) setTimeout(() => { if (A.W.mapa === 'cemiterio') A.toast(`Seu recorde do sino: ${m.recSino.toFixed(1)}s depois do último objeto.`); }, 3200); });
  }

  return def;
}

// ---------------------------------------------------------------------
// áudio procedural curto: chiado de fita velha (usado pela câmara e pela confissão)
// ---------------------------------------------------------------------
function confissaoCurta(A, pos, onde) {
  const au = A.audio; if (!au || !au.AC || au.AC.state === 'closed') return;
  const AC = au.AC, t = AC.currentTime;
  // estalo de play + chiado de rolo
  const g = au.saida(pos, .5); au.burst(t, .08, 'highpass', 2000, 1, g); au.env(g, t, .002, .4, .08);
  const g2 = au.saida(pos, .4); au.burst(t + .1, 2.4, 'bandpass', 1400, .6, g2); au.env(g2, t + .1, .2, .14, 2.2);
  // zumbido grave do motor da fita
  const o = AC.createOscillator(); const gg = au.saida(pos, .5); o.type = 'sawtooth'; o.frequency.setValueAtTime(58, t + .1); o.connect(gg); au.env(gg, t + .1, .15, .12, 2.3); o.start(t + .1); o.stop(t + 2.6);
}
