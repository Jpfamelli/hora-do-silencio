// SUSTOS E EVENTOS — Lote 5 (parte 2): MONSTROS, segunda leva
// Segunda rodada de comportamentos, variações por capítulo, aparições, contra-jogos e perseguições,
// sem repetir o que já está em src/sustos-lote5.js. Tudo original (inspiração, não cópia);
// sem assets externos (modelos clonados do próprio jogo, overlays CSS com ids l5b-*, som procedural).
// Instalado por src/sustos.js (L5b = instalarSustosL5b(E, K)); mesmos ganchos do L5:
// update(dt,s), novoMapa(id), aoEsconder(L), aoSair(L), aoPasso(), aoRaio(), morte(quem).
import * as THREE from 'three';

export function instalarSustosL5b(E, K) {
  const { R, rand, pick, clamp, lerp, camera, scene, W, P, M, MON, ANA, ANA_G, PROC } = E;
  const S = () => E.S;
  const { seguro, depois, anima, agora, voz, respiracao, passoPos, batida, marcarForte, apagao, arranhao, rolar, vacuo, notas, portaDaSala, atras, fwdH, dist2, som, sustoCom } = K;

  // ---------------- acessibilidade
  const menosMov = () => (E.OPT.vCam !== undefined && +E.OPT.vCam === 0) || (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
  const semFlash = () => E.OPT.vFlash !== undefined && +E.OPT.vFlash === 1;

  // ---------------- overlays próprios (ids l5b-*, nunca mexem no index.html)
  const css = document.createElement('style');
  css.textContent = `
  .l5b{position:fixed;inset:0;pointer-events:none;opacity:0;z-index:41}
  #l5b-flash{background:#fff;transition:opacity .22s}
  #l5b-verm{background:radial-gradient(ellipse 120vw 120vh at 50% 60%,rgba(120,0,0,.0) 40%,rgba(80,0,0,.35) 100%);transition:opacity .35s}
  #l5b-vapor{box-shadow:inset 0 0 26vh 9vh rgba(150,170,200,.16);transition:opacity .6s}
  #l5b-chao{background:linear-gradient(to top,rgba(0,0,0,.92) 20%,transparent 60%);transform:translateY(60%);transition:transform .35s ease-out,opacity .3s}
  #l5b-maos{opacity:0;transition:opacity .12s}
  #l5b-maos i{position:absolute;bottom:-8vh;width:13vw;height:58vh;background:radial-gradient(ellipse 45% 22% at 50% 10%,#b4ada0,#6b645b 72%,transparent 74%);filter:blur(1px)}
  #l5b-maos i:nth-child(1){left:12%;transform:rotate(16deg)}
  #l5b-maos i:nth-child(2){right:12%;transform:rotate(-16deg)}
  #l5b-fresta{opacity:0;transition:opacity .25s,transform .9s ease-in-out}
  #l5b-fresta b{position:absolute;top:0;bottom:0;width:8vw;background:linear-gradient(90deg,transparent,rgba(210,200,170,.14),transparent);left:50%;transform:translateX(-50%)}
  #l5b-qte{position:fixed;left:50%;bottom:22vh;transform:translateX(-50%);z-index:60;opacity:0;transition:opacity .2s;color:#e8e2d4;font:600 2.4vh/1.3 ui-monospace,monospace;text-align:center;text-shadow:0 0 1vh #000;pointer-events:none}
  #l5b-qte .bar{margin-top:1vh;width:34vw;height:1.1vh;background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.3)}
  #l5b-qte .bar i{display:block;height:100%;background:#c9452e;width:0%}
  `;
  document.head.appendChild(css);
  const mk = (id, html) => { const e = document.createElement('div'); e.id = id; e.className = 'l5b'; if (html) e.innerHTML = html; const ref = document.getElementById('fx-locker'); if (ref) ref.before(e); else document.body.appendChild(e); return e; };
  const elFlash = mk('l5b-flash'), elVerm = mk('l5b-verm'), elVapor = mk('l5b-vapor');
  const elChao = mk('l5b-chao'), elMaos = mk('l5b-maos', '<i></i><i></i>'), elFresta = mk('l5b-fresta', '<b></b>');
  const elQte = document.createElement('div'); elQte.id = 'l5b-qte'; elQte.innerHTML = '<div class="msg"></div><div class="bar"><i></i></div>';
  { const ref = document.getElementById('fx-locker'); if (ref) ref.before(elQte); else document.body.appendChild(elQte); }
  function flash(ms = 70) { if (semFlash()) return; elFlash.style.transition = 'none'; elFlash.style.opacity = .85; setTimeout(() => { elFlash.style.transition = 'opacity .22s'; elFlash.style.opacity = 0; }, ms); }
  function verm(v, dur = 400) { elVerm.style.opacity = v; if (dur) setTimeout(() => { elVerm.style.opacity = 0; }, dur); }

  // ---------------- modelos só visuais (clonados do próprio jogo, sem IA nem dano)
  function clone() { const g = MON.g.clone(true); g.visible = false; scene.add(g); return g; }
  function olhos(g) { const mat = new THREE.MeshBasicMaterial({ color: 0xff2008 }); for (const s of [-1, 1]) { const o = new THREE.Mesh(new THREE.SphereGeometry(.035, 8, 6), mat); o.position.set(s * .12, 3.55, .34); g.add(o); } }
  const VB = clone(), VB2 = clone(); [VB, VB2].forEach(olhos);
  const ANB = ANA_G.clone(true); ANB.visible = false; scene.add(ANB);
  let _mao = null; function MAO() { if (_mao) return _mao; const g = new THREE.Group(); const pele = new THREE.MeshStandardMaterial({ color: 0xaea697, roughness: .9, emissive: 0x141210, emissiveIntensity: .6 }); E.cyl && E.cyl(.03, .035, .8, pele, 0, 0, 0, 7, g); for (let i = 0; i < 4; i++) { const f = new THREE.Mesh(new THREE.CapsuleGeometry(.018, .22, 3, 6), pele); f.position.set((i - 1.5) * .05, .5, 0); f.rotation.x = .3; g.add(f); } g.visible = false; scene.add(g); _mao = g; return g; }
  let _rosto = null; function ROSTO() { if (_rosto) return _rosto; const g = new THREE.Group(); const pele = new THREE.MeshStandardMaterial({ color: 0xd6d0c2, roughness: .85, emissive: 0x2a2620, emissiveIntensity: .6 }); const r = new THREE.Mesh(new THREE.SphereGeometry(.13, 14, 10), pele); r.scale.set(.85, 1.1, .8); g.add(r); for (const s of [-1, 1]) { const o = new THREE.Mesh(new THREE.SphereGeometry(.028, 8, 6), new THREE.MeshBasicMaterial({ color: 0x080000 })); o.position.set(s * .045, .02, .11); g.add(o); } g.visible = false; scene.add(g); _rosto = g; return g; }
  const modelos = [VB, VB2, ANB];
  function esconderTudo() { for (const m of modelos) m.visible = false; if (_mao) _mao.visible = false; if (_rosto) _rosto.visible = false; }

  // ---------------- utilidades (próprias, não dependem do L5)
  const jogando = () => { const s = S(); return s && !s.dead && P.room && E.mode === 'jogo' && !E.ui; };
  const fear = () => (S() && S().fear) || 0;
  const noite = () => (S() && S().flags && S().flags._noite) || 1;
  function h01(str) { let h = 2166136261; for (const ch of str) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); } h ^= h >>> 13; return ((h >>> 0) % 1000) / 1000; }
  const semente = (k) => h01(((S() && S().semente) || 'x') + '|' + noite() + '|' + k);
  const aFrente = (m = 3) => { const f = fwdH(); return { x: P.pos.x + f.x * m, y: 0, z: P.pos.z + f.z * m }; };
  const aoLado = (s = 1, m = 1.4) => { const f = fwdH(); return { x: P.pos.x - f.z * s * m, y: 0, z: P.pos.z + f.x * s * m }; };
  const olhaTras = () => { const f = fwdH(); return f.z > .55 && Math.abs(f.x) < .7; };
  function noCampo(pos, alc = 16) { return E.visivel({ x: pos.x, z: pos.z }, 1.3, alc); }
  function naMira(pos) { const vx = pos.x - camera.position.x, vz = pos.z - camera.position.z, l = Math.hypot(vx, vz) || 1, f = fwdH(); return (f.x * vx + f.z * vz) / l; }
  const sfx = (n, ...a) => { try { if (E.SFX && E.SFX[n]) E.SFX[n](...a); } catch (e) {} };
  const sx = (n, ...a) => { try { if (E.SX && E.SX[n]) E.SX[n](...a); } catch (e) {} };
  const leg = t => E.sub('leg', t);
  const falaLia = t => E.sub('lia', t);
  const falaInsp = t => E.sub('inspetor', t);
  const falaAna = t => E.sub('ana', t);
  const tecla = c => { try { return !!(E.keys && E.keys[c]); } catch (e) { return false; } };
  function cama() { return W.lockers.some(l => l.tipo === 'cama' && dist2(l, P.pos) < 7); }
  function temVidro() { const r = P.room; return r && (r.id === 'banhS' || r.id === 'banh' || r.id === 'copa' || r.id === 'recep' || /vidro|janela|espelho/.test(r.nome || '')); }
  function portaPerto(filtro) { try { return (portaDaSala(P.room, filtro) || [])[0]; } catch (e) { return null; } }
  function vulto(g, pos, { y = 0, encara = true, costas = false } = {}) { g.position.set(pos.x, y, pos.z); if (encara) { g.lookAt(camera.position.x, 0, camera.position.z); if (costas) g.rotation.y += Math.PI; } g.visible = true; return g; }

  // QTE curto e à prova de erro (sempre escapa no tempo máximo; só existe fora do QA)
  function qte(msg, tecla_code, dur, aoVencer, aoFalhar, marteladas) {
    elQte.querySelector('.msg').textContent = msg; const bar = elQte.querySelector('.bar i'); bar.style.width = '0%';
    elQte.style.opacity = 1; let t = 0, n = 0, prev = false, venceu = false;
    marcarForte();
    anima({ visible: true }, dt => {
      t += dt; const pd = tecla(tecla_code);
      if (marteladas) { if (pd && !prev) { n++; bar.style.width = Math.min(100, n / marteladas * 100) + '%'; } prev = pd; if (n >= marteladas) venceu = true; }
      else { if (pd) { n += dt; bar.style.width = Math.min(100, n / (dur * .5) * 100) + '%'; } if (n >= dur * .5) venceu = true; }
      if (venceu) { elQte.style.opacity = 0; if (aoVencer) seguro(aoVencer)(); return true; }
      if (t >= dur) { elQte.style.opacity = 0; if (aoFalhar) seguro(aoFalhar)(); return true; }
      return false;
    });
  }

  const D = {
    aluCd: 0, ultAlu: null, salaCont: 0, pegadasT: 0, raioN: 0, caca: null, estadoAnt: null,
    bateu3: {}, chamadoAndaT: 0, coroT: 0, deBorda: 0, bonecaN: 0, bonecaPos: null,
    apitoEscT: 0, lanternaOffAte: 0, derrubado: 0
  };

  // =============================================================== ALUCINAÇÕES AMBIENTE (somem com a luz, sem dano)
  const ALUC = [
    // sombra de duas pernas corta a luz sob a porta e a maçaneta gira
    { id: 'sobPorta', min: 40, cond: () => !P.room.fora && portaPerto(d => !d.open && dist2(d, P.pos) < 7), go: () => { const d = portaPerto(dd => !dd.open && dist2(dd, P.pos) < 7); if (!d) return; leg('[duas pernas cortam a luz sob a porta; a maçaneta começa a girar]'); respiracao({ x: d.x, y: 1.4, z: d.z }, 2.4, true, .4); let t = 0; anima({ v: 1 }, dt => { t += dt; if (d.pivot && !menosMov()) d.pivot.rotation.y = Math.sin(t * 3) * .03 * (d.ang || 1); if (t > 2.4) { if (d.pivot) d.pivot.rotation.y = d.ang || 0; return true; } return false; }); } },
    // a cabeça dele gira 180 por um único quadro quando iluminado de longe
    { id: 'cabeca180', min: 45, cond: () => !menosMov(), go: () => { const p = aFrente(rand(7, 11)); vulto(VB, p, { costas: true }); leg('[por um quadro, a cabeça dele girou 180 graus e te encarou]'); let t = 0, virou = false; anima(VB, dt => { t += dt; if (t > .5 && !virou) { virou = true; VB.rotation.y += Math.PI; sfx('estalo', p, .5); } if (t > .9) { VB.visible = false; return true; } return false; }); } },
    // um dos retratos no corredor é o próprio Inspetor, imóvel como pintura
    { id: 'retrato', min: 40, cond: () => !P.room.fora, go: () => { const p = aoLado(pick([-1, 1]), 2); vulto(VB, p, { encara: false }); VB.rotation.y = Math.atan2(camera.position.x - p.x, camera.position.z - p.z); leg('[um dos retratos na parede era ele, parado atrás do vidro]'); let t = 0, virou = false; anima(VB, dt => { t += dt; const dot = naMira(p); if (dot < 0 && !virou && t > .6) { virou = true; VB.lookAt(camera.position.x, 0, camera.position.z); sfx('estalo', p, .6); marcarForte(); } if ((S().flashOn && dot > .97) || t > 4) { VB.visible = false; return true; } return false; }); } },
    // de cabeça para baixo, imóvel, entre dois lances da escada
    { id: 'escadaVao', min: 50, cond: () => !P.room.fora && (W.mapa === 'superior' || W.mapa === 'terreo'), go: () => { const p = aFrente(rand(3, 5)); vulto(VB, p, { y: 2.6 }); VB.rotation.x = Math.PI; leg('[preso de cabeça para baixo no vão da escada, te encarando]'); let t = 0; anima(VB, dt => { t += dt; if (dist2(p, P.pos) < 2.2) VB.position.y = Math.max(0, VB.position.y - dt * 1.6); if (t > 4) { VB.visible = false; VB.rotation.x = 0; return true; } return false; }); } },
    // pegadas de botas pesadas surgem ao seu lado, no seu compasso, em sala vazia
    { id: 'passosAoLado', min: 35, go: () => { leg('[passos pesados surgem ao seu lado, no seu compasso]'); let t = 0, prox = 0; anima({ v: 1 }, dt => { t += dt; const parado = (P.vel || 0) < .1 && P.noiseR <= 0; if (!parado && t > prox) { prox = t + rand(.5, .8); passoPos(aoLado(pick([-1, 1]), 1), .3); } if (t > 4) return true; return false; }); } },
    // uma mão fria toca a nuca: tremor seco e ninguém atrás
    { id: 'nuca', min: 40, cond: () => !olhaTras(), go: () => { leg('[uma mão fria toca a sua nuca]'); respiracao(atras(.4), 1, false, .35); E.P.shake = Math.max(P.shake || 0, .05); depois(.5, () => { if (olhaTras()) return; leg('[não tem ninguém atrás de você]'); }); } },
    // o quadro-negro da sala de aula: 'NÃO SE CORRE' e, ao voltar, 'EU TE OUVI ENTRAR'
    { id: 'lousa', min: 30, cond: () => /aula|sala de aula|classe/.test((P.room.id || '') + (P.room.nome || '')), go: () => { leg('[no quadro-negro: NÃO SE CORRE, escrito dezenas de vezes]'); depois(2.2, () => { if (!jogando()) return; leg('[surgiu uma linha nova no quadro: EU TE OUVI ENTRAR]'); sfx('estatica', .15); marcarForte(); }); } },
    // a venda branca flutua atrás do seu reflexo e some
    { id: 'vendaReflexo', min: 35, cond: () => temVidro(), go: () => { leg('[a venda branca dele flutua atrás do seu reflexo, e some]'); flash(40); } },
    // passos pequenos no teto acompanham o seu trajeto
    { id: 'passosTeto', min: 35, cond: () => !P.room.fora, go: () => { leg('[passos pequenos correm no teto, acompanhando você]'); let t = 0, prox = 0; anima({ v: 1 }, dt => { t += dt; const parado = (P.vel || 0) < .1; if (!parado && t > prox) { prox = t + rand(.3, .5); const p = { x: P.pos.x + rand(-1, 1), y: 3, z: P.pos.z + rand(-1, 1) }; passoPos(p, .18); } if (t > 4) return true; return false; }); } },
    // o casaco no cabideiro dá um passo quando você não olha
    { id: 'cabideiro', min: 30, cond: () => !P.room.fora, go: () => { const p = aoLado(pick([-1, 1]), rand(2, 3.5)); vulto(VB, p, { encara: false }); VB.rotation.y = rand(0, 6); leg('[um casaco de inspetor pendurado... deu um passo para a porta]'); let t = 0, moveu = false; anima(VB, dt => { t += dt; const dot = naMira(p); if (dot < .2 && !moveu && t > .5) { moveu = true; VB.position.x += (aFrente(2).x - p.x) * .3; VB.position.z += (aFrente(2).z - p.z) * .3; } if ((S().flashOn && dot > .97) || t > 3.5) { VB.visible = false; return true; } return false; }); } },
    // o rosto dele olha de volta de dentro de um balde/poça
    { id: 'balde', min: 30, go: () => { leg('[por um quadro, o rosto dele olhou de volta de dentro da água parada]'); flash(35); sfx('estatica', .12); } },
    // nos túneis, o reflexo mostra ele DE PÉ atrás de você
    { id: 'reflexoAgua', min: 35, cond: () => W.mapa === 'tuneis' || P.naAgua, go: () => { leg('[o reflexo na água mostra ele de pé, bem atrás de você]'); const p = atras(1.4); vulto(VB, p); let t = 0; anima(VB, dt => { t += dt; if (olhaTras() || t > 1.6) { VB.visible = false; return true; } return false; }); } },
    // de costas, ao longe, ele mexe os dedos como quem conta devagar
    { id: 'dedosContam', min: 40, cond: () => !P.room.fora, go: () => { const p = aFrente(rand(8, 12)); vulto(VB, p, { encara: false }); VB.rotation.y = Math.atan2(camera.position.x - p.x, camera.position.z - p.z) + Math.PI; leg('[de costas, ao longe, ele conta devagar com os dedos compridos]'); let t = 0; anima(VB, dt => { t += dt; if ((S().flashOn && naMira(p) > .96) || t > 3) { VB.visible = false; return true; } return false; }); } },
    // um berço de ferro range e balança sozinho; ao voltar, está mais perto
    { id: 'berco', min: 30, cond: () => /enfermaria|dormit|bercos|menores/.test((P.room.id || '') + (P.room.nome || '')), go: () => { const p = aFrente(rand(4, 6)); leg('[um berço de ferro range e balança sozinho ao fundo]'); sfx('rangido', p.x, 1, p.z, .4); depois(2.4, () => { if (!jogando()) return; leg('[o berço parou... mas está mais perto agora]'); sfx('rangido', aFrente(2.5).x, 1, aFrente(2.5).z, .3); }); } },
    // a boneca da Ana, cada vez mais perto do caminho (cap III)
    { id: 'boneca', min: 25, cond: () => S().chapter >= 3 && W.mapa === 'superior', go: () => { D.bonecaN++; const m = clamp(9 - D.bonecaN * 1.5, 2.5, 9); const p = aFrente(m); leg(D.bonecaN >= 4 ? '[a boneca da Ana está bem no seu caminho agora]' : '[a boneca da Ana, largada no limite da sua visão]'); if (D.bonecaN >= 4) sfx('risada', p.x, p.z); } },
    // o reflexo da Ana contando numa poça/vidraça, mesmo sem o corpo dela à vista
    { id: 'anaPoca', min: 35, cond: () => (W.mapa === 'tuneis' || W.mapa === 'cemiterio' || temVidro()), go: () => { leg('[o reflexo da Ana conta baixinho numa poça perto de você]'); voz(aoLado(pick([-1, 1]), 2), { f0: 360, vogais: [[400, 2000]], dur: .9, vol: .05 }); } },
    // passo ecoa atrás sem ninguém; a sombra cruza a porta depois
    { id: 'passoFantasma', min: 30, cond: () => !M.ativo, go: () => { leg('[um passo ecoou atrás de você]'); passoPos(atras(rand(1.5, 2.5)), .35); depois(rand(2, 3), () => { if (!jogando()) return; const p = aFrente(rand(8, 11)); vulto(VB, p, { encara: false }); VB.rotation.y = rand(0, 6); let t = 0; anima(VB, dt => { t += dt; if (t > .6) { VB.visible = false; return true; } return false; }); }); } },
    // pegadas molhadas vindo de uma porta escura NA SUA direção
    { id: 'pegadasVem', min: 30, go: () => { leg('[pegadas molhadas surgem, uma a uma, vindo até você, e param a dois passos]'); let t = 0, n = 0; anima({ v: 1 }, dt => { t += dt; if (t > n * .45 && n < 5) { const m = 4 - n * .7; passoPos(aFrente(m), .25, true); n++; } if (t > 3) return true; return false; }); } },
    // mão comprida sai por entre os objetos de uma estante e tateia o ar
    { id: 'estante', min: 35, cond: () => !P.room.fora, go: () => { const p = aoLado(pick([-1, 1]), 1.2); const g = MAO(); g.position.set(p.x, 1.1, p.z); g.rotation.set(0, Math.atan2(camera.position.x - p.x, camera.position.z - p.z), Math.PI / 2); g.visible = true; leg('[uma mão comprida sai de entre as prateleiras e tateia o ar]'); let t = 0; anima(g, dt => { t += dt; g.position.x = lerp(g.position.x, P.pos.x, dt * .3); if (P.prende || (P.vel || 0) < .1 && t > 1 || t > 3) { g.visible = false; g.rotation.set(0, 0, 0); return true; } return false; }); } },
    // corredor de vidros: vários reflexos dele, só um acompanha a posição real
    { id: 'vidrosFalsos', min: 40, cond: () => temVidro() && M.ativo, go: () => { leg('[o reflexo dele aparece em vários vidros ao mesmo tempo; só um é o verdadeiro]'); flash(40); } },
    // o reflexo dele vem um passo adiantado e com a cabeça virada para você, mesmo quando o corpo não está
    { id: 'reflexoAdiantado', min: 35, cond: () => temVidro(), go: () => { leg('[no reflexo, ele está um passo mais perto e com a cabeça virada para você]'); } },
    // no escuro total, um facho fraco igual ao seu chama você para a direção errada (é a venda refletindo)
    { id: 'fachoFalso', min: 40, cond: () => !S().flashOn && M.ativo, go: () => { const p = aFrente(rand(6, 9)); leg('[um facho fraco, igual ao seu, acende ao longe — vá para o lado contrário]'); let t = 0; anima({ v: 1 }, dt => { t += dt; if (t > 3) return true; return false; }); depois(3, () => { if (jogando() && dist2(p, P.pos) < 3) { vulto(VB, atras(1.2)); sfx('estalo', atras(1.2), .8); marcarForte(); depois(1, () => VB.visible = false); } }); } }
  ];

  function tentarAluc() {
    if (!jogando() || (P.room.fora && W.mapa !== 'cemiterio')) return;
    if (agora() < D.aluCd || fear() < 30) return;
    const cands = ALUC.filter(a => fear() >= a.min && (!a.cond || a.cond()) && a.id !== D.ultAlu);
    if (!cands.length) return;
    const a = cands[Math.floor(semente('b_alu' + D.salaCont) * cands.length) % cands.length];
    D.aluCd = agora() + rand(28, 48); D.ultAlu = a.id; seguro(a.go)();
  }

  // =============================================================== ESCONDERIJO — segunda leva
  function updateEsconderijo(dt, s) {
    const L = s && s.hidden; if (!L) { D.frestaCimaOn = false; elFresta.style.opacity = 0; D.andaT = 0; return; }
    const caca = M.ativo && M.state === 'caca', perto = M.ativo && dist2(M.pos, P.pos) < 3.4;
    // olho pela fresta DE CIMA do armário (ângulo novo)
    if (L.tipo === 'armario' && caca && perto && agora() > (D.olhoCimaCd || 0) && Math.random() < dt * .25) {
      D.olhoCimaCd = agora() + 30; leg('[um olho surge pela fresta de cima do armário, olhando para baixo]'); marcarForte(); respiracao({ x: L.x, y: 2.1, z: L.z }, 1.6, true, .4);
    }
    // o armário "anda" um pouco: a fresta de luz desliza devagar, para ao prender o ar (nada acontece de fato)
    if (L.tipo === 'armario' && perto && !menosMov()) {
      if (!D.andaOn && agora() > (D.andaCd || 0) && Math.random() < dt * .12) { D.andaOn = true; D.andaT = 0; leg('[a fresta de luz desliza... como se o armário estivesse sendo arrastado]'); marcarForte(); }
      if (D.andaOn) { D.andaT += dt; const k = P.prende ? 0 : Math.sin(D.andaT * 1.3) * 14; elFresta.style.opacity = .5; elFresta.style.transform = 'translateX(' + k + 'px)'; if (P.prende || D.andaT > 4) { D.andaOn = false; D.andaCd = agora() + 40; elFresta.style.opacity = 0; elFresta.style.transform = 'translateX(0)'; } }
    } else { if (D.andaOn) { D.andaOn = false; elFresta.style.opacity = 0; } }
    // uma mão fecha a porta do armário por FORA e segura por 3s (a respiração do outro lado)
    if (L.tipo === 'armario' && !M.ativo && agora() > (D.foraCd || 0) && fear() > 45 && Math.random() < dt * .02) {
      D.foraCd = agora() + 120; leg('[uma mão fecha a porta do armário por fora, e segura]'); respiracao({ x: L.x, y: 1.4, z: L.z }, 3, true, .5); marcarForte(); L.sxInseguro = true;
      depois(3, () => { if (jogando()) sfx('tocArmario', L.x, L.z); });
    }
    // bilhete de criança desliza por baixo do SEU esconderijo ('achei' / 'eu sei' / 'sai')
    if (agora() > (D.bilheteCd || 0) && (D.hiddenTempo = (D.hiddenTempo || 0) + dt) > 18 && fear() > 40 && Math.random() < dt * .05) {
      D.bilheteCd = agora() + 90; const pal = pick(['achei', 'eu sei', 'sai']); leg('[um papel de criança desliza por baixo da porta: "' + pal + '"]'); sfx('papel'); marcarForte();
    }
    // o armário range como se fosse abrir sozinho, induzindo a sair cedo demais (a saída estava limpa)
    if (!M.ativo && D.desistiuRecente && agora() > (D.convidaCd || 0)) {
      D.convidaCd = agora() + 60; D.desistiuRecente = false; leg('[o seu esconderijo range sozinho, como se fosse abrir]'); sfx('rangido', L.x, 1, L.z, .4);
    }
    // duelo de fôlego: o armário vizinho respira no seu ritmo; soltar o ar antes faz a sua porta ranger
    if (L.tipo === 'armario' && agora() > (D.dueloCd || 0) && fear() > 40 && Math.random() < dt * .02) {
      D.dueloCd = agora() + 80; leg('[o armário ao lado começa a respirar no seu ritmo]'); respiracao(aoLado(1, 1.1), 3.5, true, .4);
      depois(3.2, () => { if (jogando() && !P.prende) { sfx('rangido', L.x, 1, L.z, .35); leg('[você soltou o ar antes dele; a sua porta rangeu]'); } });
    }
    // sob a cama tempo demais: o colchão afunda a centímetros do seu rosto (encolher salva)
    if (L.tipo === 'cama') {
      D.camaRostoT = (D.camaRostoT || 0) + dt;
      if (D.camaRostoT > 14 && agora() > (D.camaRostoCd || 0) && Math.random() < dt * .08) {
        D.camaRostoCd = agora() + 30; leg('[o colchão afunda a centímetros do seu rosto, respirando lento]'); respiracao({ x: P.pos.x, y: 1.1, z: P.pos.z }, 2.4, true, .5); marcarForte();
        if (!P.crouch) depois(2.2, () => { if (jogando() && !P.crouch) { E.P.shake = Math.max(P.shake || 0, .05); } });
      }
    } else D.camaRostoT = 0;
    // sob a cama durante a caça: ele vira o colchão inteiro ou uma mão te empurra para fora
    if (L.tipo === 'cama' && M.ativo && M.state === 'caca') { if (semente('b_flip' + D.salaCont) > .6) seguro(viraColchao)(L); else seguro(maoExpulsaCama)(L); }
    // armário na caça: ele apoia o peso na porta (QTE segure E)
    if (L.tipo === 'armario' && M.ativo && M.state === 'caca') seguro(pesoNaPorta)(L);
  }

  // a Ana já estava no armário quando você abre ('achei primeiro'); marca inseguro e nunca cai 2 noites seguidas
  function anaNoArmario(L) {
    if (L.tipo !== 'armario' || L.sxInseguro) return false;
    if (semente('b_ana' + (L.id || L.x + ',' + L.z)) < .82) return false;
    verm(.5, 600); marcarForte(); leg('[a Ana já estava dentro, contando baixinho]');
    const g = ROSTO(); g.position.set(L.x, 1.4, L.z); g.lookAt(camera.position.x, 1.4, camera.position.z); g.visible = true;
    depois(.5, () => { falaAna('Achei primeiro.'); voz({ x: L.x, y: 1.4, z: L.z }, { f0: 380, vogais: [[400, 2200], [600, 1400]], dur: 1, vol: .1 }); });
    let t = 0; anima(g, dt => { t += dt; if (S().flashOn || t > 1.6) { g.visible = false; return true; } return false; });
    L.sxInseguro = true; return true;
  }

  // raríssimo: o rosto dele já está dentro do armário e ele te agarra (aviso de chaves abafadas; nunca no armário protegido)
  function jaEstavaDentro(L) {
    if (L.tipo !== 'armario' || L.protegido || L.sxInseguro) return false;
    if (semente('b_dentro' + (L.id || L.x + ',' + L.z)) < .94) return false;
    // aviso sutil para o jogador atento: chaves abafadas um instante antes
    verm(.8, 900); marcarForte(); flash(70); leg('[o rosto dele já estava lá dentro]'); sfx('susto'); elMaos.style.opacity = 1;
    falaLia('ELE ESTAVA AÍ DENTRO. Corre!');
    depois(.7, () => { elMaos.style.opacity = 0; }); L.sxInseguro = true; return true;
  }

  // morder o cobertor: sob a cama, quando ele se abaixa, um grab-check ('não se mexa')
  function morderCobertor(L) {
    if (L.tipo !== 'cama' || !M.ativo || M.state !== 'caca' || dist2(M.pos, P.pos) > 2.4) return;
    if (agora() < (D.morderCd || 0)) return; D.morderCd = agora() + 999;
    qte('NÃO SE MEXA — segure o ar', 'Space', 2.6, () => { falaLia('(o pé dele... passou reto)'); }, () => { leg('[você se mexeu; a mão fecha no seu tornozelo]'); verm(.7, 600); sfx('susto'); });
  }

  function aoEsconder(L) {
    D.hiddenTempo = 0; D.camaRostoT = 0; D.desistiuRecente = false;
    if (L.tipo === 'cama') D.camaTempo = (D.camaTempo || 0) + 1;
    if (L.tipo === 'armario') {
      if (jaEstavaDentro(L)) return; if (anaNoArmario(L)) return;
      armarioVizinho(L); vozArmarioVazio(L);
    }
  }
  function aoSair(L) {
    elFresta.style.opacity = 0; D.andaOn = false;
    if (L && L.tipo === 'cama' && M.ativo && M.state === 'caca') seguro(morderCobertor)(L);
  }

  // =============================================================== INSPETOR — segunda leva
  function updateInspetor(dt, s) {
    // transição de estado: quando ele perde a caça, finta uma porta distante e espera mudo perto
    if (M.ativo) {
      if (D.estadoAnt === 'caca' && M.state !== 'caca' && agora() > (D.fintaCd || 0) && dist2(M.pos, P.pos) < 7) {
        D.fintaCd = agora() + 70; const p = aFrente(rand(10, 16)); leg('[ele bate uma porta longe, com estrondo, e fica em silêncio perto de você]'); sfx('pancada', p.x, p.z); vacuo(4, .01);
      }
      D.estadoAnt = M.state;
    } else D.estadoAnt = null;
    // falsa reza vira bote: raro, uma vez por noite — a pose de 'pausa de memória' é fingida
    if (M.ativo && M.state !== 'caca' && dist2(M.pos, P.pos) < 2 && !s.flags.b_rezaFalsa && semente('b_reza') > .7 && agora() > (D.rezaCd || 0)) {
      D.rezaCd = agora() + 999; s.flags.b_rezaFalsa = true; leg('[ele baixa a cabeça, parece em oração...]');
      depois(1.6, () => { if (jogando() && dist2(M.pos, P.pos) < 1.6) { leg('[era fingimento — o bote!]'); sfx('susto'); verm(.7, 500); flash(60); marcarForte(); } });
    }
    // lâmpadas estourando À SUA FRENTE na caça, te empurrando para o escuro
    if (M.ativo && M.state === 'caca' && agora() > (D.frenteCd || 0) && Math.random() < dt * .4) {
      const L = W.lampadas.filter(x => x.ligada && naMira(x) > .4 && dist2(x, P.pos) < 10).sort((a, b) => dist2(a, P.pos) - dist2(b, P.pos))[0];
      if (L) { D.frenteCd = agora() + 1.1; L.ligada = false; L.luz.intensity = 0; L.bulbo.material.emissiveIntensity = 0; sfx('vidro', L.x, L.z); sx('faisca', L.x, L.z); flash(45); if (!D.frenteFalou) { D.frenteFalou = true; leg('[as lâmpadas à sua frente estouram uma a uma]'); } }
    }
    // respiração dele atravessa a parede/porta quando ele ronda do outro lado
    if (M.ativo && M.state !== 'caca' && agora() > (D.paredeCd || 0)) { const d = portaPerto(dd => dist2(dd, P.pos) < 3 && dist2(dd, M.pos) < 3); if (d) { D.paredeCd = agora() + 7; respiracao({ x: d.x, y: 1.4, z: d.z }, 2.4, true, .4); } }
    // o chamado que anda: a voz se afasta puxando você pela rota da patrulha
    if (E.chamado && M.ativo && agora() > (D.chamaAndaCd || 0) && Math.random() < dt * .03) {
      D.chamaAndaCd = agora() + 90; leg('[a voz chama e se afasta, convidando você a segui-la]'); let t = 0, m = 4; anima({ v: 1 }, dt2 => { t += dt2; if (t > m * .25 && m < 10) { voz(aFrente(m), { f0: 320, dur: .7, vol: .09 }); m += 2; } if (t > 3) return true; return false; }); falaLia('(regra 5: nunca responda)');
    }
  }

  // arrombamento em três investidas: três baques, a madeira trinca mais a cada um
  function arrombaTres(d) {
    if (!d) return; for (let i = 0; i < 3; i++) depois(i * .5, () => { if (!jogando()) return; sfx('pancada', d.x, d.z); E.P.shake = Math.max(P.shake || 0, .03 + i * .03); if (i === 2) { leg('[a terceira investida escancara a porta]'); sfx('susto'); } else leg(i === 0 ? '[a madeira trinca]' : '[a madeira racha mais]'); });
  }

  // a porta que respira: incha e racha em pulsos, às vezes ele entra, às vezes não (blefe)
  function portaRespira() {
    if (agora() < (D.respiraCd || 0) || P.room.fora) return; const d = portaPerto(dd => !dd.open && dist2(dd, P.pos) < 8); if (!d || fear() < 40) return;
    D.respiraCd = agora() + 80; leg('[a porta à sua frente incha para fora e racha, em pulsos]'); marcarForte();
    let t = 0; anima({ v: 1 }, dt => { t += dt; if (d.pivot && !menosMov()) d.pivot.position.z = Math.sin(t * 4) * .02; if (Math.floor(t * 4) % 2 === 0 && Math.random() < dt * 3) sfx('rangido', d.x, 1, d.z, .25); if (t > 3) { if (d.pivot) d.pivot.position.z = 0; const entra = semente('b_blefe' + Math.floor(agora())) > .6; if (entra && M.ativo) { arrombaTres(d); } else leg('[... e ficou quieta. Blefe.]'); return true; } return false; });
  }

  // ele imita o barulho de alguém se mexendo num armário vazio (jogo mental)
  function imitaEsconderijo() {
    if (agora() < (D.imitaCd || 0) || !M.ativo || M.state !== 'procura') return; const arm = W.lockers.filter(l => l.tipo === 'armario' && dist2(l, P.pos) > 4 && dist2(l, P.pos) < 12)[0]; if (!arm) return;
    D.imitaCd = agora() + 70; leg('[ele bate de leve num armário vazio, imitando alguém lá dentro]'); sx('armarioBate', arm.x, arm.z); sfx('tocArmario', arm.x, arm.z);
  }

  // ele abre um armário vazio, suspira e relaxa os ombros (falso alívio — ensina a ler o gesto)
  function armarioVazioSuspiro() {
    if (agora() < (D.suspiroCd || 0) || !M.ativo || M.state !== 'procura' || dist2(M.pos, P.pos) < 6) return;
    D.suspiroCd = agora() + 60; sfx('tocArmario', M.pos.x, M.pos.z); sfx('suspiro'); leg('[ele abre um armário vazio, suspira e segue]');
  }

  // o susto do checkpoint: ao reaparecer, ele está colado por um quadro e some
  function sustoCheckpoint() {
    if (!S().mortes || semente('b_check' + S().mortes) < .7) return; if (agora() < (D.checkCd || 0)) return; D.checkCd = agora() + 999;
    depois(rand(1.5, 2.5), () => { if (!jogando()) return; const p = atras(.8); const g = ROSTO(); g.position.set(p.x, 1.5, p.z); g.lookAt(camera.position.x, 1.5, camera.position.z); g.visible = true; sfx('estatica', .2); let t = 0; anima(g, dt => { t += dt; if (t > .1) { g.visible = false; return true; } return false; }); });
  }

  // bote esquivado vira tapa na parede e deixa uma marca de mão preta
  function aoEsquivar() {
    if (agora() < (D.tapaCd || 0)) return; D.tapaCd = agora() + 20; const p = aoLado(pick([-1, 1]), 1.5);
    sx('armarioBate', p.x, p.z); sfx('pancada', p.x, p.z); E.P.shake = Math.max(P.shake || 0, .05); leg('[a mão dele bate na parede com estrondo e deixa uma marca preta]');
  }

  // ele te derruba em vez de matar (uma vez por fuga): câmera ao chão, medo máximo, você levanta sozinho
  function derruba() {
    if (D.derrubado || agora() < (D.derrubaCd || 0)) return false; D.derrubado = true; D.derrubaCd = agora() + 999;
    leg('[ele te empurra; você vai ao chão]'); verm(.7, 2000); elChao.style.opacity = 1; elChao.style.transform = 'translateY(0)'; E.P.shake = Math.max(P.shake || 0, .14); sfx('impacto', 1.2); marcarForte();
    depois(2, () => { elChao.style.opacity = 0; elChao.style.transform = 'translateY(60%)'; verm(0, 0); falaLia('(de pé... de pé...)'); });
    return true;
  }

  // ele sopra e apaga a sua lanterna por ~2s (cap V, colado às costas)
  function sopraLanterna() {
    if (S().chapter < 4 || agora() < (D.sopraCd || 0) || !M.ativo || dist2(M.pos, P.pos) > 2.2) return; if (Math.random() > .02) return;
    D.sopraCd = agora() + 60; leg('[um sopro gélido apaga a sua lanterna]'); respiracao(atras(.4), 1.2, true, .5); apagao(2, true); elVapor.style.opacity = 1; depois(2, () => elVapor.style.opacity = 0);
  }

  // assobio respondido na nuca (se o jogador usa o assobio como contra-jogo perto dele)
  function assobioResponde() {
    const s = S(); if (!s.flags || !s.flags.l5_assobiou || agora() < (D.assobioCd || 0)) return; if (!M.ativo || dist2(M.pos, P.pos) > 3) return;
    D.assobioCd = agora() + 15; s.flags.l5_assobiou = false; leg('[ele assobia igualzinho ao seu, bem na sua nuca]'); voz(atras(.5), { f0: 1200, vogais: [[1200, 2600]], dur: .5, vol: .06, sopro: true }); marcarForte();
  }

  // =============================================================== PROCISSÃO — segunda leva
  function updateProcissao(dt, s) {
    if (!PROC.fase) { D.coroT = 0; return; }
    const perto = s.hidden && PROC.fase === 'passando';
    // uma figura ao fundo com o rosto sempre virado para você (acompanha o esconderijo)
    if (perto && !D.olhaFixaOn && agora() > (D.olhaFixaCd || 0) && Math.random() < dt * .2) { D.olhaFixaOn = true; D.olhaFixaCd = agora() + 20; leg('[uma figura no fundo da fila mantém o rosto virado para você, acompanhando]'); depois(5, () => D.olhaFixaOn = false); }
    // uma criança sai da fila, chega até a fresta e volta; se você se mexer/ofegar, a fila toda vira
    if (perto && agora() > (D.criancaFrestaCd || 0) && Math.random() < dt * .12) {
      D.criancaFrestaCd = agora() + 25; leg('[uma criança sai da fila e encosta o rosto sem boca na sua fresta]'); respiracao(atras(1.2), 2, true, .4); marcarForte();
      depois(2, () => { if (jogando() && ((s.ar || 100) < 45 || P.noiseR > .5)) { leg('[você se mexeu — a fila inteira parou e virou para você]'); marcarForte(); verm(.4, 500); } });
    }
    // a última criança larga a vela acesa no chão e dá um passo lento em sua direção
    if (perto && agora() > (D.ultimaCd || 0) && Math.random() < dt * .1) { D.ultimaCd = agora() + 30; leg('[a última da fila larga a vela no chão e dá um passo até a sua fresta]'); passoPos(atras(1.5), .5); marcarForte(); }
    // varrer a fila com a lanterna vira as cabeças em onda na direção do feixe
    if (S().flashOn && PROC.fase === 'passando' && agora() > (D.ondaCd || 0) && Math.random() < dt * .3) { D.ondaCd = agora() + 10; leg('[as figuras viram a cabeça em onda, acompanhando a sua luz]'); sfx('suspiroLia'); }
    // uma vela da fila apaga quando passa rente (<1.5 m): aviso silencioso de o quanto estão perto
    if (perto && agora() > (D.velaPertoCd || 0) && Math.random() < dt * .15) { D.velaPertoCd = agora() + 12; if (!P.prende) { leg('[uma vela tremula e apaga, como se sentisse o seu ar]'); sfx('suspiro'); } }
    // uma criança dá a mão à Ana e a puxa para a fila por um instante (crossover de lore)
    if (perto && ANA.ativa && agora() > (D.maosDadasCd || 0) && Math.random() < dt * .05) { D.maosDadasCd = agora() + 40; leg('[uma criança estende a mão, e a Ana a segura, entrando na fila]'); }
    // o coro: as presenças respiram no mesmo compasso; casar o seu ar passa, quebrar denuncia
    if (perto) { D.coroT += dt; if (D.coroT > 3 && agora() > (D.coroCd || 0) && Math.random() < dt * .2) { D.coroCd = agora() + 15; if (P.prende) { leg('[você respira no compasso do coro; passa por mais um aluno]'); } else { leg('[o seu fôlego saiu do compasso do coro]'); marcarForte(); } } }
  }

  // ao fazer barulho enquanto a Procissão passa, uma figura quebra o passo e te encara
  function criancaEncaraBarulho() {
    if (!PROC.fase || PROC.fase !== 'passando' || P.noiseR < .5 || agora() < (D.encaraCd || 0)) return;
    D.encaraCd = agora() + 8; leg('[uma das crianças quebrou o passo e te encara, os olhos vermelhos fixos]'); marcarForte();
  }

  // acender a lanterna no instante da fila: a Procissão PARA e uma criança empurra a porta do armário numa fresta
  function filaParaFresta() {
    const s = S(); if (!PROC.fase || PROC.fase !== 'passando' || !s.hidden || !S().flashOn) return; if (agora() < (D.filaParaCd || 0)) return;
    D.filaParaCd = agora() + 40; leg('[a luz atraiu a fila: o canto cessa e uma criança empurra a sua porta numa fresta]'); vacuo(2, .01);
    depois(1.2, () => { if (!jogando()) return; const olho = ROSTO(); const L = s.hidden; if (L) { olho.position.set(L.x, 1.4, L.z); olho.lookAt(camera.position.x, 1.4, camera.position.z); olho.visible = true; sfx('estalo', { x: L.x, z: L.z }, .7); marcarForte(); depois(1, () => olho.visible = false); } });
  }

  // procissão ao contrário (cap V): velas apagadas, da capela para os quartos; ofegar fora faz a fila virar
  function procissaoContrario(s) {
    if (W.mapa !== 'cemiterio' || s.chapter < 5 || s.flags.b_procInv || !PROC.fase) return; s.flags.b_procInv = true;
    leg('[a Procissão passa com as velas apagadas, da capela para os quartos — você a ouve, não a vê]');
  }

  // a Procissão se divide em dois ramos e cerca a sala por duas portas (raro)
  function procissaoCerca(s) {
    if (!PROC.fase || PROC.fase !== 'passando' || agora() < (D.cercaCd || 0) || semente('b_cerca') < .7) return;
    D.cercaCd = agora() + 999; leg('[a fila se divide e entra por duas portas ao mesmo tempo, fechando o cerco]'); marcarForte();
  }

  // =============================================================== ANA — segunda leva
  function updateAna(dt, s) {
    if (!ANA.ativa || s.chapter !== 3) { D.anaParaOn = false; return; }
    // Ana se esconde: se a sua lanterna a encontra no esconderijo dela, ela grita e alerta o Inspetor
    if (agora() > (D.escondeCd || 0) && Math.random() < dt * .02) {
      D.escondeCd = agora() + 60; leg('[a Ana se escondeu — não varra tudo com a luz]');
      depois(rand(2, 4), () => { if (jogando() && S().flashOn && naMira(ANA.g ? ANA.g.position : P.pos) > .8) { falaAna('Me achou!'); sfx('risada', P.pos.x, P.pos.z); marcarForte(); if (M.ativo) M.wait = 0; } });
    }
    // Ana nas costas do Inspetor, apontando para você (as duas ameaças num corpo só)
    if (M.ativo && agora() > (D.costasInspCd || 0) && semente('b_costasInsp' + Math.floor(agora() / 30)) > .8) {
      D.costasInspCd = agora() + 60; const g = ANB; g.position.copy(M.pos ? { x: M.pos.x, y: 0, z: M.pos.z } : P.pos); if (M.pos) g.position.set(M.pos.x, 1.2, M.pos.z); g.visible = true; leg('[a Ana está agarrada às costas dele, apontando para você]'); let t = 0; anima(g, dt2 => { t += dt2; if (M.pos) g.position.set(M.pos.x, 1.2, M.pos.z); if (!noCampo(M.pos || P.pos, 16) || t > 3) { g.visible = false; return true; } return false; }); }
    // a caixinha de música largada como isca (aproximar dispara a contagem)
    if (agora() > (D.caixaCd || 0) && Math.random() < dt * .015) {
      D.caixaCd = agora() + 90; const p = aFrente(rand(4, 7)); leg('[uma caixinha de música toca sozinha num canto]'); sfx('contagem', p.x, p.z);
      depois(3, () => { if (jogando() && dist2(p, P.pos) < 2) { falaAna('...dez.'); voz(atras(1), { f0: 380, dur: .8, vol: .1 }); marcarForte(); } });
    }
    // giz: a Ana desenha VOCÊ (uma menina com lanterna) quando te observa muito
    if (agora() > (D.gizCd || 0) && fear() > 50 && Math.random() < dt * .01) { D.gizCd = agora() + 120; leg('[no giz do chão: uma menininha com uma lanterna — você]'); }
  }

  // beats roteirizados da contagem da Ana (dez troca de monstro, números na sua voz, contagem errada)
  function dezVariacao(s) {
    if (!ANA.ativa || s.chapter !== 3 || agora() < (D.dezCd || 0)) return; D.dezCd = agora() + 45;
    const r = semente('b_dez' + Math.floor(agora() / 45));
    if (r > .88) { // no 'dez' aparece o INSPETOR, não a Ana
      leg('[... oito ... nove ...]'); depois(1.4, () => { if (!jogando()) return; leg('[no dez, quem apareceu atrás foi ELE]'); const p = atras(1.2); vulto(VB, p); sfx('estalo', p, .9); marcarForte(); flash(50); depois(1.2, () => VB.visible = false); });
    } else if (r > .6) { // os últimos números na sua própria voz
      leg('[... a contagem veio na sua própria voz]'); voz(atras(.8), { f0: 230, vogais: [[500, 1800]], dur: 1.2, vol: .08 });
    } else if (r > .35) { // contagem errada (pula/repete um número)
      leg('[... seis ... oito ... oito ... oito ...]'); voz(aFrente(5), { f0: 360, dur: 1, vol: .07 });
    }
  }

  // Ana inverte a regra por tempo curto: avança quando você PARA (avisada pela Lia)
  function anaInverte(s) {
    if (!ANA.ativa || s.chapter !== 3 || agora() < (D.inverteCd || 0) || semente('b_inverte' + Math.floor(agora() / 60)) < .85) return;
    D.inverteCd = agora() + 999; falaLia('(hoje ela brinca ao contrário...)'); leg('[a Ana avança enquanto você está parada]');
  }

  // =============================================================== SET-PIECES / beats de mapa
  // corpo entre os corpos (capela): plantado uma vez, levanta devagar quando você passa perto
  function corpoEntreCorpos(s) {
    if (W.mapa !== 'cemiterio' || !/capela/.test((P.room.id || '') + (P.room.nome || '')) || s.flags.b_corpo) return; s.flags.b_corpo = true;
    const p = aFrente(rand(3, 5)); const g = VB; g.position.set(p.x, .25, p.z); g.rotation.set(Math.PI / 2, rand(0, 6), 0); g.visible = true; leg('[um corpo imóvel entre os defuntos]');
    let armado = true; anima(g, dt => { if (armado && dist2(p, P.pos) < 2.6) { armado = false; leg('[ele se levanta devagar, sem um som]'); let u = 0; const sub = () => { u += 1; g.rotation.x = Math.max(0, Math.PI / 2 - u * .3); g.position.y = Math.min(0, g.position.y + .05); if (g.rotation.x > 0) depois(.1, sub); else { g.lookAt(camera.position.x, 0, camera.position.z); if (M.ativo !== undefined) { try { M.wait = 0; } catch (e) {} } marcarForte(); } }; sub(); } if (!armado && naMira(p) < -.5) { g.visible = false; return true; } return false; });
  }

  // mãos da Ana entram pelas frestas do monta-cargas na descida; manter a luz nela segura
  function maosMontaCargas(s) {
    if (s.chapter < 3 || agora() < (D.mcbCd || 0)) return; D.mcbCd = agora() + 999;
    const g = MAO(); const p = aoLado(1, .7); g.position.set(p.x, 1.2, p.z); g.rotation.set(0, 0, Math.PI / 2); g.visible = true; leg('[as mãos da Ana entram pelas frestas do monta-cargas]'); marcarForte();
    let t = 0; anima(g, dt => { t += dt; const segura = S().flashOn && naMira(p) > .6; if (!segura) g.position.x = lerp(g.position.x, P.pos.x, dt * .5); if (t > 5) { g.visible = false; g.rotation.set(0, 0, 0); return true; } return false; });
  }

  // a cama do castigo (com correia): trancar a Lia por ~3s, três batidas, respiração de menino
  function camaCastigo(s) {
    if (!/castigo/.test((P.room.id || '') + (P.room.nome || '')) || s.flags.b_castigo) return; if (!cama()) return; s.flags.b_castigo = true;
    leg('[a correia da cama do castigo prende você por um instante]'); verm(.5, 3000);
    for (let i = 0; i < 3; i++) depois(.6 + i * .6, () => sfx('pancada', P.pos.x, P.pos.z));
    respiracao(atras(.5), 3, true, .4); depois(3, () => { verm(0, 0); falaLia('(ofegante) ...saí. Saí.'); });
  }

  // o jantar que levanta (refeitório): as cadeiras ocupadas se levantam num relâmpago e ele está na cabeceira
  function jantarLevanta(s) {
    if (!/refeit/.test((P.room.id || '') + (P.room.nome || '')) || s.flags.b_jantar) return; s.flags.b_jantar = true;
    leg('[sob o relâmpago, as crianças de fuligem se levantam todas juntas]'); flash(80);
    depois(.6, () => { if (!jogando()) return; const p = aFrente(rand(5, 8)); vulto(VB, p); leg('[no escuro, só a cabeceira ficou — ele está lá, de frente para você]'); marcarForte(); depois(2.5, () => VB.visible = false); });
  }

  // escada que desaba (cap II): cada degrau racha e cai logo atrás do pé
  function escadaDesaba(s) {
    if (s.chapter !== 2 || W.mapa !== 'terreo' || agora() < (D.escadaCd || 0)) return; if (!/escada|escad/.test((P.room.id || '') + (P.room.nome || ''))) return;
    D.escadaCd = agora() + 999; leg('[cada degrau racha e cai logo atrás do seu pé — não pare]'); let t = 0; anima({ v: 1 }, dt => { t += dt; if (Math.random() < dt * 3) { sfx('impacto', .5); E.P.shake = Math.max(P.shake || 0, .03); } if (t > 4) return true; return false; });
  }

  // a tromba d'água (cap IV): comporta abre, a enxurrada apaga o rastro mas empurra
  function trombaDagua(s) {
    if (W.mapa !== 'tuneis' || s.chapter !== 4 || agora() < (D.trombaCd || 0) || semente('b_tromba') < .6) return;
    D.trombaCd = agora() + 999; leg('[ele abre uma comporta; a enxurrada toma o túnel e apaga o seu rastro]'); sfx('tremor'); E.P.shake = Math.max(P.shake || 0, .08); elVapor.style.opacity = 1; depois(3, () => elVapor.style.opacity = 0);
  }

  // a ponte da cisterna que desaba atrás (sem retorno) e ele rosna da margem (a água funda o barra)
  function ponteCisterna(s) {
    if (W.mapa !== 'tuneis' || !/cisterna|ponte|poco/.test((P.room.id || '') + (P.room.nome || '')) || s.flags.b_ponte) return; s.flags.b_ponte = true;
    leg('[as tábuas cedem uma a uma atrás de você; não dá para voltar]'); let t = 0; anima({ v: 1 }, dt => { t += dt; if (Math.random() < dt * 2) sfx('impacto', .4); if (t > 3) return true; return false; });
    depois(3, () => { if (jogando()) { falaLia('(ofegando na beira) Ele não atravessa a água funda.'); voz(atras(6), { f0: 150, vogais: [[280, 1000]], dur: 1, vol: .07 }); } });
  }

  // o corredor que baixa na fuga: o teto desce forçando a agachar e correr (hitbox generosa, nunca bloqueia)
  function corredorBaixa(s) {
    if (W.mapa !== 'cemiterio' || !s.flags.sino || agora() < (D.baixaCd || 0) || menosMov()) return; D.baixaCd = agora() + 999;
    leg('[o teto desaba atrás e vem baixando — agache e corra]'); elChao.style.transition = 'transform 2s'; elChao.style.transform = 'translateY(20%)'; elChao.style.opacity = .6; sfx('tremor'); E.P.shake = Math.max(P.shake || 0, .06);
    depois(3, () => { elChao.style.transition = 'transform .35s,opacity .3s'; elChao.style.opacity = 0; elChao.style.transform = 'translateY(60%)'; });
  }

  // o corredor que respira (cap V): as paredes fecham um palmo de cada vez atrás (não bloqueia de fato)
  function corredorRespira(s) {
    if (s.chapter !== 5 || !M.ativo || M.state !== 'caca' || agora() < (D.respiraCorCd || 0) || menosMov()) return; D.respiraCorCd = agora() + 40;
    leg('[as paredes fecham um palmo de cada vez atrás de você]'); E.P.shake = Math.max(P.shake || 0, .02);
  }

  // o relâmpago que conta as covas: cada clarão mostra mais uma cova aberta; no último, a sua
  function relampagoCovas() {
    D.raioN = (D.raioN || 0) + 1; const n = D.raioN;
    if (n <= 4) { leg(n < 4 ? '[um relâmpago: mais uma lápide aberta e vazia atrás de você]' : '[o último clarão mostra a SUA cova, aberta]'); if (n === 4) marcarForte(); }
  }

  // a capela lotada por um quadro (cap V): os bancos cheios de crianças de costas, e vazios no escuro
  function capelaLotada(s) {
    if (W.mapa !== 'cemiterio' || s.chapter < 5 || !/capela/.test((P.room.id || '') + (P.room.nome || '')) || s.flags.b_lotada) return; s.flags.b_lotada = true;
    leg('[um relâmpago: os bancos da capela lotados de crianças sentadas de costas]'); flash(70);
  }

  // não acorda ele (cap IV): perto de onde ele dorme, um coro de crianças implora se você faz barulho
  function naoAcorda(s) {
    if (s.chapter !== 4 || agora() < (D.acordaCd || 0)) return; if (P.noiseR < .5) return; D.acordaCd = agora() + 12;
    leg('[um coro de sussurros: "não acorda ele... não acorda..."]'); voz(aFrente(4), { f0: 420, vogais: [[500, 1800]], dur: 1.4, vol: .05 });
  }

  // o espelho que mostra o homem: por um quadro, o reflexo é o Moacir humano de 1979, chorando (só peso)
  function espelhoHomem(s) {
    if (!temVidro() || s.flags.b_homem || agora() < (D.homemCd || 0) || semente('b_homem') < .5) return; D.homemCd = agora() + 999; s.flags.b_homem = true;
    leg('[no espelho, por um quadro: o homem que ele foi, sem venda, chorando]');
  }

  // =============================================================== EXTRAS (esconderijo, Chamado, QTEs)
  // o armário ao lado abre sozinho, um braço tateia dentro, não acha nada, fecha e vem para o seu
  function armarioVizinho(L) {
    if (L.tipo !== 'armario' || agora() < (D.vizinhoCd || 0) || fear() < 45 || semente('b_viz' + (L.id || L.x)) < .7) return; D.vizinhoCd = agora() + 120;
    const g = MAO(); const p = aoLado(pick([-1, 1]), 1.6); g.position.set(p.x, 1.3, p.z); g.rotation.set(0, 0, Math.PI / 2); g.visible = true;
    leg('[a porta do armário ao lado abre; um braço tateia lá dentro]'); sfx('tocArmario', p.x, p.z);
    depois(2.2, () => { g.visible = false; g.rotation.set(0, 0, 0); if (jogando()) { leg('[não achou nada ali. Agora vem para o seu — prenda o ar]'); respiracao({ x: L.x, y: 1.4, z: L.z }, 2.6, true, .5); marcarForte(); } });
  }
  // a isca do choro no armário: um choro de menino vem de um armário fechado; abrir vira o rosto na fresta
  function choroArmario() {
    if (agora() < (D.choroCd || 0) || M.ativo || fear() < 40 || semente('b_choro' + D.salaCont) < .75) return; D.choroCd = agora() + 90;
    const arm = W.lockers.filter(l => l.tipo === 'armario' && dist2(l, P.pos) < 8)[0]; if (!arm) return;
    leg('[um choro de menino vem de dentro de um armário fechado]'); voz({ x: arm.x, y: 1.3, z: arm.z }, { f0: 420, vogais: [[500, 1800]], dur: 2, vol: .05 });
    arm._choroIsca = agora();
  }
  // a voz dentro do armário vazio: correr para se esconder encontra só o sussurro e um ruído que atrai o Inspetor
  function vozArmarioVazio(L) {
    if (L.tipo !== 'armario' || agora() < (D.vazioCd || 0) || semente('b_vazio' + (L.id || L.x)) < .85) return; D.vazioCd = agora() + 140;
    leg('[lá dentro: só um sussurro — "Lia..." — e um estalo alto]'); voz({ x: L.x, y: 1.4, z: L.z }, { f0: 300, vogais: [[400, 2000]], dur: 1, vol: .06 }); sfx('tocArmario', L.x, L.z); marcarForte();
    try { if (E.ruido) E.ruido(L.x, L.z, 1); } catch (e) {}
  }
  // ele apoia o peso na porta do armário: QTE curto (segure E), soltar cedo range e te entrega
  function pesoNaPorta(L) {
    if (L.tipo !== 'armario' || S().chapter < 2 || !M.ativo || dist2(M.pos, P.pos) > 2.5) return; if (agora() < (D.pesoCd || 0)) return; D.pesoCd = agora() + 40;
    qte('SEGURE E — segure a porta', 'KeyE', 2.5, () => { falaLia('(ele... desencostou)'); }, () => { leg('[a porta rangeu; ele percebeu]'); sfx('rangido', L.x, 1, L.z, .5); marcarForte(); if (M.ativo) M.wait = 0; });
  }
  // ele vira o colchão inteiro onde você finge dormir (flip visual) antes do agarrão
  function viraColchao(L) {
    if (L.tipo !== 'cama' || !M.ativo || M.state !== 'caca' || dist2(M.pos, P.pos) > 2.3 || agora() < (D.flipCd || 0)) return; D.flipCd = agora() + 999;
    leg('[ele agarra e vira o colchão inteiro]'); E.P.shake = Math.max(P.shake || 0, .12); sfx('arrastar'); sfx('susto'); verm(.6, 500); marcarForte();
  }
  // uma mão sob o colchão sobe e te empurra para fora da cama (te expõe, sem matar)
  function maoExpulsaCama(L) {
    if (L.tipo !== 'cama' || agora() < (D.expulsaCd || 0)) return; D.camaTempo = (D.camaTempo || 0) + 1;
    if (!M.ativo || D.camaTempo < 3) return; D.expulsaCd = agora() + 999;
    leg('[uma mão sobe por dentro do colchão e te empurra para fora]'); E.P.shake = Math.max(P.shake || 0, .08); marcarForte();
  }
  // contar junto errado faz o Inspetor próximo repetir o número errado e hesitar 2s
  function contarJuntoHesita() {
    const s = S(); if (!s.flags || !s.flags.l5_contouErrado || !M.ativo || dist2(M.pos, P.pos) > 6) return; if (agora() < (D.contaCd || 0)) return;
    D.contaCd = agora() + 20; s.flags.l5_contouErrado = false; leg('[ele repete o número errado, em dueto, e para confuso]'); falaInsp('...seis? ...seis.'); vacuo(2, .01); if (M.ativo) M.wait = Math.max(M.wait || 0, 2);
  }
  // duelo no portão de ferro (túneis): segurar E resiste e ganha terreno; soltar cedo ele arromba
  function dueloPortao(s) {
    if (W.mapa !== 'tuneis' || !/portao|grade|ferro/.test((P.room.id || '') + (P.room.nome || '')) || s.flags.b_portao) return; if (!M.ativo || dist2(M.pos, P.pos) > 4) return; s.flags.b_portao = true;
    const g = MAO(); const p = aFrente(1.2); g.position.set(p.x, 1.2, p.z); g.rotation.set(0, Math.atan2(camera.position.x - p.x, camera.position.z - p.z), Math.PI / 2); g.visible = true;
    qte('SEGURE E — empurre o portão', 'KeyE', 3, () => { leg('[o portão bate; você ganhou terreno]'); sfx('pancada', p.x, p.z); g.visible = false; g.rotation.set(0, 0, 0); }, () => { leg('[ele arromba o portão]'); sfx('pancada', p.x, p.z); verm(.6, 500); g.visible = false; g.rotation.set(0, 0, 0); });
  }
  // o Chamado atrás de uma porta trancada (puro psicológico, nunca é armadilha)
  function chamadoPortaTrancada() {
    if (!E.chamado || agora() < (D.chamTrancCd || 0) || Math.random() > .02) return; const d = W.doors && W.doors.find(x => x.trava && x.trava() && dist2(x, P.pos) < 8); if (!d) return;
    D.chamTrancCd = agora() + 120; leg('[a voz chama de trás de uma porta que não abre]'); voz({ x: d.x, y: 1.4, z: d.z }, { f0: 320, vogais: [[400, 1800]], dur: 1, vol: .08 });
  }
  // o Chamado com a voz do Inspetor ('pode sair, acabou, filha') — obedecer te joga na caçada
  function chamadoVozDele() {
    if (!E.chamado || agora() < (D.chamVozCd || 0) || Math.random() > .02 || fear() < 45) return; D.chamVozCd = agora() + 120;
    leg('[a voz dele, de uma sala vizinha: "pode sair, acabou, filha"]'); falaInsp('Pode sair. Acabou, filha.'); voz(aFrente(7), { f0: 150, vogais: [[280, 1000]], dur: 1.4, vol: .09 });
  }
  // o Chamado pelo ralo (cap IV): chegar perto faz a água subir de repente e o Inspetor vem investigar
  function chamadoRalo(s) {
    if (W.mapa !== 'tuneis' || s.chapter !== 4 || agora() < (D.raloCd || 0) || Math.random() > .02) return; D.raloCd = agora() + 90;
    const p = aFrente(rand(3, 5)); leg('[a voz vem de dentro de um ralo]'); voz({ x: p.x, y: -.5, z: p.z }, { f0: 320, dur: 1, vol: .07 });
    depois(2.5, () => { if (jogando() && dist2(p, P.pos) < 2.5) { leg('[a água subiu de repente — e o respingo foi ouvido]'); sfx('impacto', .6); E.P.shake = Math.max(P.shake || 0, .05); marcarForte(); } });
  }
  // o apito no escuro: lanterna apagada parada por mais de 10 s faz um apito rachado soar bem perto
  function apitoNoEscuro(dt) {
    if (S().flashOn || (P.vel || 0) > .1) { D.apitoEscT = 0; return; }
    D.apitoEscT += dt; if (D.apitoEscT > 10 && agora() > (D.apitoEscCd || 0)) { D.apitoEscCd = agora() + 30; D.apitoEscT = 0; leg('[um apito rachado soa a um palmo de você, bem alto]'); voz(aoLado(pick([-1, 1]), 1), { f0: 1500, vogais: [[1500, 3000]], dur: .5, vol: .07, sopro: true }); marcarForte(); }
  }
  // uma armadilha de barulho: ele encosta um objeto no batente; esbarrar depois derruba com estrondo
  function armadilhaBarulho() {
    if (agora() < (D.armadilhaCd || 0) || !M.ativo || M.state !== 'patrulha') return; const d = portaPerto(dd => dist2(dd, P.pos) < 3); if (!d) return;
    if (!d._armadilha) { if (semente('b_armad' + (d.id || d.x)) > .8) { d._armadilha = true; } return; }
    D.armadilhaCd = agora() + 20; d._armadilha = false; leg('[você esbarrou numa lata encostada no batente — estrondo]'); sfx('impacto', .8); try { if (E.ruido) E.ruido(d.x, d.z, 1); } catch (e) {} marcarForte();
  }
  // o falso atordoamento depois do sino: ele finge seguir com as mãos nos ouvidos e dispara se você se aproxima
  function falsoAtordoamento(s) {
    if (W.mapa !== 'cemiterio' || !s.flags.sino || s.flags.b_atordoa || !M.ativo || Math.random() > .02) return; s.flags.b_atordoa = true;
    leg('[ele continua com as mãos nos ouvidos, a cabeça tombada... parece atordoado]');
    depois(.1, () => { if (jogando() && dist2(M.pos, P.pos) < 1.8) { leg('[era fingimento — o bote!]'); sfx('susto'); verm(.6, 500); marcarForte(); } });
  }
  // a mão no vidro da porta (visor): durante a procura, a mão encosta no vidro e desliza; mexer faz arrombar
  function maoVidroPorta() {
    if (agora() < (D.visorCd || 0) || !M.ativo || M.state !== 'procura') return; const d = portaPerto(dd => !dd.open && dist2(dd, P.pos) < 5); if (!d) return; if (!temVidro() && !/visor|vidro/.test((P.room.nome || ''))) return;
    D.visorCd = agora() + 50; leg('[a mão dele encosta no vidro da porta e desliza devagar]'); respiracao({ x: d.x, y: 1.5, z: d.z }, 2.4, true, .4);
    depois(2, () => { if (jogando() && (P.noiseR > .5 || (P.vel || 0) > .5)) { leg('[você se mexeu — ele arromba na hora]'); arrombaTres(d); } });
  }
  // sua sombra na luz das velas te denuncia na Procissão (ficar na luz = criança aponta)
  function sombraDenuncia(dt, s) {
    if (!PROC.fase || PROC.fase !== 'passando' || s.hidden) return; const naLuz = W.lampadas.some(L => L.ligada && dist2(L, P.pos) < 4) || S().flashOn;
    if (naLuz && agora() > (D.sombraCd || 0)) { D.sombraCd = agora() + 10; leg('[a sua sombra cai sobre o caminho das velas; uma criança vira e aponta]'); marcarForte(); verm(.4, 500); }
  }
  // agarrão em corrida pelo capuz (fuga): QTE martelar ESPAÇO solta o capuz e você escapa por um triz
  function agarraoCapuz() {
    if (D.capuzUsou || agora() < (D.capuzCd || 0)) return; D.capuzUsou = true; D.capuzCd = agora() + 999;
    verm(.6, 1500); marcarForte(); sfx('susto');
    qte('MARTELE ESPAÇO — solte-se!', 'Space', 2.5, () => { leg('[você se solta, deixando o capuz na mão dele]'); verm(0, 0); falaLia('(arfando) Por um triz...'); }, () => { leg('[o capuz não cedeu a tempo]'); }, 8);
  }

  // =============================================================== GANCHOS
  let salaAnt = null;
  const update = seguro((dt, s) => {
    if (!jogando()) { elVerm.style.opacity = 0; elVapor.style.opacity = 0; elFresta.style.opacity = 0; return; }
    if (P.room !== salaAnt) {
      salaAnt = P.room; D.salaCont++;
      tentarAluc();
      corpoEntreCorpos(s); camaCastigo(s); jantarLevanta(s); capelaLotada(s); espelhoHomem(s); ponteCisterna(s);
      if (W.mapa === 'superior' && s.chapter >= 3 && /sotao|deposito|monta/.test((P.room.id || '') + (P.room.nome || '')) && !s.flags.b_mc) { s.flags.b_mc = true; depois(1.6, () => maosMontaCargas(s)); }
      sustoCheckpoint();
      escadaDesaba(s); corredorBaixa(s); choroArmario(); dueloPortao(s);
    }
    updateEsconderijo(dt, s); updateInspetor(dt, s); updateProcissao(dt, s); updateAna(dt, s);
    criancaEncaraBarulho(); filaParaFresta(s); procissaoContrario(s); procissaoCerca(s);
    dezVariacao(s); anaInverte(s); sombraDenuncia(dt, s);
    portaRespira(); imitaEsconderijo(); armarioVazioSuspiro(); assobioResponde(); sopraLanterna();
    naoAcorda(s); corredorRespira(s); trombaDagua(s);
    apitoNoEscuro(dt); armadilhaBarulho(); maoVidroPorta(); contarJuntoHesita();
    chamadoPortaTrancada(); chamadoVozDele(); chamadoRalo(s); falsoAtordoamento(s);
  });

  const novoMapa = seguro(id => {
    esconderTudo(); elVerm.style.opacity = 0; elVapor.style.opacity = 0; elFresta.style.opacity = 0; elMaos.style.opacity = 0; elChao.style.opacity = 0;
    salaAnt = null; D.salaCont = 0; D.aluCd = agora() + 14; D.ultAlu = null; D.raioN = 0; D.bonecaN = 0; D.derrubado = false; D.frenteFalou = false; D.capuzUsou = false; D.camaTempo = 0;
  });

  const aoRaio = seguro(() => {
    if (!jogando()) return;
    if (W.mapa === 'cemiterio' && fear() > 30) relampagoCovas();
  });

  const aoPasso = seguro(() => {
    // na fuga final, um quase-agarrão vira derrubada (uma vez)
    if (W.mapa === 'cemiterio' && S().flags && S().flags.sino && M.ativo && M.state === 'caca' && dist2(M.pos, P.pos) < 1.6 && !D.derrubado) {
      if (Math.random() < .3) derruba();
      else if (!D.capuzUsou && Math.random() < .3) agarraoCapuz();
    }
  });

  const morte = seguro(quem => {
    const s = S(); if (!s || !P.room) return;
    // relâmpago da cova própria já foi contado; nada destrutivo aqui
  });

  // No kit de teste automático os sustos do L5b ficam quietos (sorteio/tempo, não interferem no caminhar).
  const nt = fn => (...a) => { if (window.__teste) return; return fn(...a); };
  return {
    update: nt(update), novoMapa: nt(novoMapa), aoRaio: nt(aoRaio), aoPasso: nt(aoPasso), morte: nt(morte),
    aoEsconder: nt(seguro(aoEsconder)), aoSair: nt(seguro(aoSair)),
    arrombaTres: nt(seguro(arrombaTres)), derruba: nt(seguro(derruba)), aoEsquivar: nt(seguro(aoEsquivar)),
    _D: D, _ALUC: ALUC
  };
}
