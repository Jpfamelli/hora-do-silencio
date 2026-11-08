// PRÓLOGO — Lote 6, 2ª rodada: REJOGABILIDADE da estrada (mala do carro, painel, banco de trás, rádio com
// estações novas, cardápio, recordes por rota e o resumo da noite). Chamado por estrada() em mapas.js logo
// depois de rejogoEstrada(). Passivo e à prova de erro: nada aqui muda o fluxo da chave/portão, e o que muda
// o fluxo do posto (posto vazio) só vale fora do QA (window.__teste / navigator.webdriver).
// A parte do posto e dos eventos da estrada mora em estrada-lote6b-mundo.js.
import { TXT6B, mesclarL6B } from './estrada-lote6b-texto.js';
import { mundoL6B } from './estrada-lote6b-mundo.js';

const MEM = 'hora-silencio-estrada6b';
const CONQ_KEY = 'hora-silencio-v2-conq';
const lsGet = (k, d) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } };
const lsSet = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
const mem = () => lsGet(MEM, {}) || {};
const memSet = o => { const m = mem(); Object.assign(m, o); lsSet(MEM, m); };
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const hs = str => { let h = 2166136261 >>> 0; for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; } return h; };

export function rejogoEstrada2(A, S, c) {
  try { mesclarL6B(A.R); montar(A, S, c); } catch (e) { console.warn('[estrada6b]', e); }
}

function montar(A, S, c) {
  const { THREE, MAT, box, cyl, plano, interact, item, MK } = A;
  const grupo = A.W.grupo, P = A.P, cam = A.camera, GZ = c.GZ, BZ = c.BZ, carro = c.carro;
  const U = (c.ex && c.ex.util) || {}, SX = U.SX || {};
  const r6 = c.r6 || {};
  const F = (typeof window !== 'undefined' && window.__e6b) || {};  // forçar sorteios nos testes

  // ------------------------------------------------------------------ contexto compartilhado
  const stats = () => lsGet('hora-silencio-stats', {}) || {};
  const finais = () => { const q = lsGet(CONQ_KEY, {}) || {}; return { comum: !!q.final_comum, silencio: !!q.final_silencio, verdadeiro: !!q.final_verdadeiro }; };
  const noite = () => F.noite || Math.max(1, S.flags._noite || stats().partidas || 1);
  const zerou = () => { const f = finais(); return f.comum || f.silencio || f.verdadeiro; };
  const rejogo = () => F.rejogo !== undefined ? !!F.rejogo : (!(window.__SIMP && window.__SIMP.on()) && (noite() > 1 || zerou())); // modo simples: sem variações da segunda jogada
  const verdadeiro = () => F.verdadeiro !== undefined ? !!F.verdadeiro : finais().verdadeiro;
  const risco = () => !!F.risco || !(typeof window !== 'undefined' && (window.__teste || (navigator && navigator.webdriver)));
  const seed = ((F.seed !== undefined ? F.seed : (r6.seed !== undefined ? r6.seed : 7919)) ^ 0x6b6b6b6b) >>> 0;
  const R = tag => {
    if (typeof F[tag] === 'number') return F[tag];
    let h = (seed ^ hs(tag)) >>> 0; h = Math.imul(h ^ (h >>> 16), 2246822507) >>> 0; h = Math.imul(h ^ (h >>> 13), 3266489909) >>> 0; h = (h ^ (h >>> 16)) >>> 0;
    return h / 4294967296;
  };
  const escolhe = (tag, arr) => arr[Math.floor(R(tag) * arr.length) % arr.length];
  const vivo = () => A.W.grupo === grupo && A.S === S;
  const jogando = () => vivo() && A.mode === 'jogo';
  const dist = (x, z) => Math.hypot(x - P.pos.x, z - P.pos.z);
  const olhando = (p, cone = .5, alc = 40, y = 1.6) => U.olhando ? U.olhando(p, cone, alc, y) : false;
  const medo = n => { if (U.medo) U.medo(n); else S.fear = Math.min(100, Math.max(S.fear, 0) + n); };
  const falar = k => { try { if (A.R.falas && A.R.falas[k]) A.falar(k); } catch (e) {} };
  const dizer = (quem, texto, prio) => { try { A.sub(quem, texto, !!prio); } catch (e) {} };
  const conquista = id => { try { A.conquista(id); } catch (e) {} };
  const relampago = (k, tr) => { try { U.relampago && U.relampago(k, tr); } catch (e) {} };
  const luzAcesa = () => S.inv.lanterna && S.flashOn && S.battery > 0;
  const fila = [];
  const agenda = (seg, fn) => fila.push({ t: seg, fn });
  const tickFila = dt => { for (let i = fila.length - 1; i >= 0; i--) { const f = fila[i]; f.t -= dt; if (f.t <= 0) { fila.splice(i, 1); if (vivo()) { try { f.fn(); } catch (e) { console.warn(e); } } } } };
  const ticks = [];                                   // funções (dt) chamadas todo quadro, uma a uma, à prova de erro
  const resumo = [];                                  // linhas do "o que aconteceu nesta noite" mostrado no portão
  // lanterna apagada à força por alguns segundos (névoa, mula, redemoinho)
  const luz = { t: 0, estava: false };
  const apagarLuz = seg => { if (!S.inv.lanterna) return; if (luz.t <= 0) luz.estava = !!S.flashOn; luz.t = Math.max(luz.t, seg); S.flashOn = false; };
  ticks.push(dt => { if (luz.t > 0) { luz.t -= dt; S.flashOn = false; if (luz.t <= 0 && luz.estava) S.flashOn = true; } });
  const posCarro = (dx, y, dz) => ({ x: carro.position.x + dx, y, z: carro.position.z + dz });
  const posRadio = () => (U.posRadio ? U.posRadio() : posCarro(-.1, 1.05, -.75));

  const X = { A, S, c, THREE, MAT, box, cyl, plano, interact, item, MK, grupo, P, cam, GZ, BZ, carro, U, SX, F, seed, R, escolhe, noite, rejogo, zerou, verdadeiro, risco, stats,
    mem, memSet, vivo, jogando, dist, olhando, medo, falar, dizer, conquista, relampago, luzAcesa, agenda, ticks, resumo, apagarLuz, posCarro, posRadio, lsGet, lsSet, clamp, clima: r6.clima || 'seca', r6, TXT6B };

  const tenta = (nome, fn) => { try { fn(); } catch (e) { console.warn('[estrada6b:' + nome + ']', e); } };
  // a partir da 3ª noite o carro amanhece fora do lugar (feito antes de tudo: a mala, a moeda e a poça se medem pela posição nova)
  if (rejogo() && noite() >= 3) { carro.position.x += (R('carro:x') - .5) * .7; carro.rotation.y = (R('carro:r') - .5) * .26; }

  // =================================================================== 1) A MALA: LEVE SÓ UM DE TRÊS
  tenta('mala', () => {
    const pool = ['garrafa', 'pilha', 'kit', 'fosforo', 'mapa'];
    const ord = pool.map(p => [R('mala:' + p), p]).sort((a, b) => a[0] - b[0]).map(x => x[1]).slice(0, 3);
    const ids = ['est6b_mala_a', 'est6b_mala_b', 'est6b_mala_c'];
    const chave = id => 'estrada:' + id;
    const pegou = () => ids.some(i => S.picked[chave(i)]) || !!S.flags.e6b_malaFechou;
    const caixa = new THREE.MeshStandardMaterial({ color: 0xa32a1a, roughness: .7 }), papel = new THREE.MeshStandardMaterial({ color: 0xd2c4a2, roughness: .95 });
    const defs = {
      garrafa: { rot: 'Levar a garrafa extra', mk: () => MK.garrafa(), dy: 0, ao: () => { S.inv.garrafas++; falar('e6b_mala_garrafa'); A.toast('Garrafa extra no bolso. G joga longe e atrai o Inspetor.'); } },
      pilha: { rot: 'Levar a pilha reserva', mk: () => MK.pilha(), dy: 0, ao: () => { S.inv.pilhas++; falar('e6b_mala_pilha'); A.toast('Pilha reserva no bolso. R para trocar.'); } },
      kit: { rot: 'Levar o curativo', mk: () => MK.kit(), dy: 0, ao: () => { S.inv.kits++; falar('e6b_mala_kit'); A.toast('Curativo no bolso. H para usar.'); } },
      fosforo: { rot: 'Levar a caixa de fósforos', mk: () => box(.09, .035, .06, caixa, 0, 0, 0, new THREE.Group()), dy: .02, ao: () => { S.fosforos = (typeof S.fosforos === 'number' ? S.fosforos : (stats().fosforos || 2)) + 1; falar('e6b_mala_fosforo'); A.toast('Fósforos: um a mais para as charadas do internato.'); } },
      mapa: { rot: 'Levar o mapa riscado', mk: () => box(.16, .01, .11, papel, 0, 0, 0, new THREE.Group()), dy: .01, ao: () => { falar('e6b_mala_mapa'); A.toast('Mapa riscado: galão na despensa, fusíveis na enfermaria. O gerador acorda ele: esconda antes de ligar.'); } }
    };
    ord.forEach((tipo, i) => {
      const D = defs[tipo];
      item(ids[i], { x: carro.position.x + (i - 1) * .5, y: .955 + D.dy, z: carro.position.z + 1.62 }, D.mk(), D.rot, () => {
        D.ao(); S.flags.e6b_mala = tipo; resumo.push('levou ' + ({ garrafa: 'a garrafa extra', pilha: 'a pilha reserva', kit: 'o curativo', fosforo: 'os fósforos', mapa: 'o mapa riscado' })[tipo]);
        const m = mem(); m.malas = (m.malas || 0) + 1; lsSet(MEM, m); if (m.malas >= 5) conquista('e6b_mala');
        agenda(0.1, () => A.syncWorld && A.syncWorld());
      }, () => !pegou());
    });
    let avisou = false;
    ticks.push(dt => {
      if (!S.flags.saiuCarro || !S.inv.lanterna) return;
      if (!avisou && !pegou() && dist(carro.position.x, carro.position.z + 1.6) < 3.2) { avisou = true; falar('e6b_mala_dica'); }
      // quem se afasta do carro sem pegar nada fecha a mala (sem voltar) e ganha o selo das mãos vazias
      if (!S.flags.e6b_malaFechou && dist(carro.position.x, carro.position.z) > 13) {
        S.flags.e6b_malaFechou = true; A.syncWorld && A.syncWorld();
        if (!S.flags.e6b_mala) { conquista('e6b_maos'); agenda(1.2, () => falar('e6b_maos_vazias')); resumo.push('mãos vazias'); }
      }
    });
  });

  // =================================================================== 2) HERANÇA: ENTERRAR UM ITEM NO PORTÃO
  tenta('heranca', () => {
    const h = mem().heranca;
    if (h) { // o item enterrado ontem aparece em cima do carro, uma vez, sem tirar a escolha da mala
      const mk = h === 'pilha' ? MK.pilha() : h === 'kit' ? MK.kit() : MK.garrafa();
      item('est6b_heranca', { x: carro.position.x, y: 1.57, z: carro.position.z + .2 }, mk, 'Pegar o que você enterrou no portão', () => {
        if (h === 'pilha') S.inv.pilhas++; else if (h === 'kit') S.inv.kits++; else S.inv.garrafas++;
        memSet({ heranca: null }); falar('e6b_heranca_pega'); A.toast('A herança da última noite: ' + (h === 'pilha' ? 'pilha' : h === 'kit' ? 'curativo' : 'garrafa') + '.'); resumo.push('herdou o que enterrou');
      });
    }
    if (!rejogo()) return;
    const monte = new THREE.Mesh(new THREE.SphereGeometry(.35, 8, 5), new THREE.MeshStandardMaterial({ color: 0x2a1e14, roughness: 1 })); monte.scale.y = .28; monte.position.set(-3.0, .05, GZ + 2.2); grupo.add(monte);
    const qual = () => S.inv.pilhas > 0 ? 'pilha' : S.inv.kits > 0 ? 'kit' : S.inv.garrafas > 0 ? 'garrafa' : null;
    const alvoNome = { pilha: 'uma pilha', kit: 'um curativo', garrafa: 'uma garrafa' };
    interact(monte, () => qual() ? `<b>E</b>Enterrar ${alvoNome[qual()]} para a próxima noite` : 'Terra revirada, à beira do portão.', () => {
      const q = qual(); if (!q || S.done.abrir_portao) return;
      if (q === 'pilha') S.inv.pilhas--; else if (q === 'kit') S.inv.kits--; else S.inv.garrafas--;
      memSet({ heranca: q }); try { A.SFX.cavar && A.SFX.cavar(); } catch (e) {} falar('e6b_heranca_enterra'); A.toast('Enterrado. Na próxima noite estará no teto do carro.'); resumo.push('enterrou ' + alvoNome[q]);
    }, { on: () => rejogo() && !S.done.abrir_portao });
  });

  // =================================================================== 3) A MOEDA DA SORTE (capô do carro)
  tenta('moeda', () => {
    const ouro = new THREE.MeshStandardMaterial({ color: 0xc9a23a, roughness: .35, metalness: .7, emissive: 0x3a2a08, emissiveIntensity: .8 });
    const g = new THREE.Group(); g.position.set(carro.position.x + .3, .965, carro.position.z - 1.5); grupo.add(g);
    cyl(.035, .035, .006, ouro, 0, 0, 0, 14, g);
    const hit = box(.3, .12, .3, new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false }), 0, .05, 0, g, false);
    interact(hit, () => S.flags.e6b_moedaFeita ? 'A moeda velha, no mesmo lugar do capô.' : '<b>E</b>Jogar a moeda da sorte', () => {
      if (S.flags.e6b_moedaFeita) return; S.flags.e6b_moedaFeita = true;
      const lance = (hs('moeda' + noite() + ':' + (stats().partidas || 0) + ':' + seed) >>> 3) % 2;  // semente + nº de jogadas: não dá para repetir até acertar
      try { A.SFX.clique && A.SFX.clique(); } catch (e) {}
      g.visible = false; resumo.push(lance ? 'moeda: cara' : 'moeda: coroa');
      if (lance) { S.inv.pilhas++; falar('e6b_moeda_cara'); A.toast('Cara: uma pilha a mais.'); }
      else { // coroa: os faróis piscam sozinhos e o medo sobe
        medo(20); falar('e6b_moeda_coroa'); try { c.farolOn(true); } catch (e) {}
        [.18, .36, .55, .75].forEach((t, i) => agenda(t, () => { try { c.farolOn(i % 2 === 1 ? true : false); } catch (e) {} })); agenda(1, () => { try { c.farolOn(false); } catch (e) {} });
        try { SX.tique && SX.tique(posCarro(0, 1, -2), true); } catch (e) {}
      }
    }, { on: () => !!S.flags.saiuCarro && !S.flags.e6b_moedaFeita });
    if (S.flags.e6b_moedaFeita) g.visible = false;
  });

  // =================================================================== 4) O QUE O PORTA-MALAS GUARDA (colecionável que muda)
  tenta('colecionavel', () => {
    if (!rejogo() || noite() < 3) return;
    const cols = TXT6B.colecionaveis, vistos = mem().cols || {};
    const idx = (noite() - 3) % cols.length, col = cols[idx];
    const mat = new THREE.MeshStandardMaterial({ color: col.id === 'ursinho' ? 0x6a4a2a : col.id === 'gravador' ? 0x2a2a2e : 0x4a3a3a, roughness: .9 });
    const m = col.id === 'ursinho' ? (() => { const g = new THREE.Group(); const corpo = new THREE.Mesh(new THREE.SphereGeometry(.07, 8, 6), mat); corpo.position.y = .07; g.add(corpo); const cab = new THREE.Mesh(new THREE.SphereGeometry(.05, 8, 6), mat); cab.position.y = .17; g.add(cab); return g; })()
      : col.id === 'gravador' ? box(.22, .08, .14, mat, 0, .04, 0, new THREE.Group()) : (() => { const g = new THREE.Group(); box(.1, .05, .05, mat, 0, .025, 0, g); box(.06, .06, .05, mat, -.03, .08, 0, g); return g; })();
    item('est6b_col', { x: carro.position.x + .5, y: .955, z: carro.position.z + 1.15 }, m, 'Olhar ' + col.nome, () => {
      falar('e6b_col_' + col.id); vistos[col.id] = true; memSet({ cols: vistos }); resumo.push('achou ' + col.nome);
      if (cols.every(k => vistos[k.id])) { conquista('e6b_colecao'); agenda(4, () => falar('e6b_col_todos')); }
    }, () => !!S.flags.saiuCarro);
  });

  // =================================================================== 5) PAINEL: HODÔMETRO + RETROVISOR + BANCO DE TRÁS
  const cena = c.ex.cena;
  const odoCv = document.createElement('canvas'); odoCv.width = 112; odoCv.height = 26; const odoG = odoCv.getContext('2d');
  const odoTex = new THREE.CanvasTexture(odoCv); odoTex.colorSpace = THREE.SRGBColorSpace;
  const odoPl = plano(.13, .03, new THREE.MeshBasicMaterial({ map: odoTex }), -.62, .985, -.7, 0, carro); odoPl.rotation.x = -.5;
  odoPl.userData.leitura = { t: 'Hodômetro do carro: ganha 3 km por noite que você joga.' };
  const kmTotal = 3 * noite();
  const desenhaOdo = (txt, aceso = true) => { odoG.fillStyle = '#060402'; odoG.fillRect(0, 0, 112, 26); odoG.fillStyle = aceso ? '#ffb050' : '#3a2a18'; odoG.font = 'bold 20px monospace'; odoG.textAlign = 'center'; odoG.fillText(txt, 56, 20); odoTex.needsUpdate = true; };
  const km6 = n => String(Math.max(0, Math.floor(n))).padStart(6, '0');
  const odoModo = noite() === 3 ? '1979' : noite() === 7 ? 'volta' : noite() === 10 ? 'davi' : 'normal';
  const odoFinal = () => odoModo === '1979' ? '001979' : odoModo === 'volta' ? '000000' : odoModo === 'davi' ? ' DAVI ' : km6(kmTotal);
  desenhaOdo(km6(kmTotal), false);

  const espCv = document.createElement('canvas'); espCv.width = 160; espCv.height = 48; const espG = espCv.getContext('2d');
  const espTex = new THREE.CanvasTexture(espCv); espTex.colorSpace = THREE.SRGBColorSpace;
  const espelho = plano(.26, .08, new THREE.MeshBasicMaterial({ map: espTex }), -.1, 1.43, -.8, 0, carro); espelho.rotation.x = .22;
  const NO = noite();
  function desenhaEspelho(modo) {
    const g = espG; g.fillStyle = '#0c0d0e'; g.fillRect(0, 0, 160, 48);
    g.fillStyle = '#1b1e22'; g.fillRect(14, 8, 132, 30);                            // o vidro de trás, fosco
    g.fillStyle = '#26292e'; g.fillRect(14, 8, 132, 4);
    if (NO >= 2) { g.fillStyle = '#5a1a14'; g.fillRect(104, 28, 26, 10); }            // jaqueta no encosto
    if (NO >= 3) { g.fillStyle = '#3a342a'; g.fillRect(40, 33, 14, 5); g.fillRect(56, 33, 14, 5); } // chinelos no chão
    if (NO >= 4) { g.fillStyle = '#6a5a4a'; g.beginPath(); g.arc(80, 30, 5, 0, 6.3); g.fill(); g.fillStyle = '#2a2420'; g.fillRect(76, 33, 8, 5); } // boneca
    if (modo === 'flash') { g.fillStyle = '#020202'; g.beginPath(); g.ellipse(96, 30, 14, 20, 0, 0, 6.3); g.fill(); g.beginPath(); g.arc(96, 17, 8, 0, 6.3); g.fill(); }
    else if (NO >= 4) { // o vulto sentado: a cada noite está mais perto do banco da frente
      const k = clamp((NO - 3) / 6, 0, 1), cx = 118 - 52 * k, r = 6 + 6 * k;
      g.fillStyle = 'rgba(2,2,2,.92)'; g.beginPath(); g.ellipse(cx, 36, r * 1.5, r * 2, 0, 0, 6.3); g.fill(); g.beginPath(); g.arc(cx, 36 - r * 2, r, 0, 6.3); g.fill();
    }
    if (modo === 'olha') { g.fillStyle = '#e8e8e0'; g.fillRect(70, 10, 3, 3); g.fillRect(80, 10, 3, 3); }
    espTex.needsUpdate = true;
  }
  desenhaEspelho('normal');
  // acessórios no banco de trás: uma jaqueta, um chinelo e uma boneca, acumulando noite a noite
  const traseira = new THREE.Group(); carro.add(traseira);
  const escuro = (cor) => new THREE.MeshStandardMaterial({ color: cor, roughness: 1, emissive: cor, emissiveIntensity: .12 });
  if (NO >= 2) box(.55, .07, .42, escuro(0x5a1a14), .3, .86, .95, traseira, false);
  if (NO >= 3) { box(.1, .04, .22, escuro(0x3a342a), -.28, .78, 1.05, traseira, false); box(.1, .04, .22, escuro(0x3a342a), -.14, .78, 1.1, traseira, false); }
  if (NO >= 4) { const bn = new THREE.Mesh(new THREE.SphereGeometry(.08, 8, 6), escuro(0x7a6a5a)); bn.position.set(0, .98, 1.12); traseira.add(bn); cyl(.07, .09, .22, escuro(0x2a2420), 0, .85, 1.12, 8, traseira); }
  // silhueta sentada: aparece 1 s na 5ª noite; da 9ª em diante, vira e olha
  const sil = new THREE.Group(); sil.visible = false; sil.position.set(.36, .62, 1.02); carro.add(sil);
  const negro = new THREE.MeshBasicMaterial({ color: 0x020202 });
  cyl(.16, .2, .55, negro, 0, .32, 0, 8, sil); const cabS = new THREE.Mesh(new THREE.SphereGeometry(.11, 10, 8), negro); cabS.position.y = .72; sil.add(cabS);
  const olhosS = [-.04, .04].map(x => { const o = new THREE.Mesh(new THREE.SphereGeometry(.014, 6, 4), new THREE.MeshBasicMaterial({ color: 0xf0f0e0 })); o.position.set(x, .74, -.1); o.visible = false; sil.add(o); return o; });
  // tabuleiro de risquinhos de giz no capô: uma marca por noite já jogada (grupos de cinco)
  tenta('giz', () => {
    const n = clamp(NO - 1, 0, 50);
    const tx = A.canvasTex(128, 64, (g, w, h) => { g.clearRect(0, 0, w, h); g.strokeStyle = 'rgba(230,226,210,.8)'; g.lineWidth = 2; for (let i = 0; i < n; i++) { const gr = Math.floor(i / 5), k = i % 5, x0 = 8 + (gr % 7) * 17, y0 = 8 + Math.floor(gr / 7) * 16; if (k < 4) { g.beginPath(); g.moveTo(x0 + k * 3, y0); g.lineTo(x0 + k * 3, y0 + 11); g.stroke(); } else { g.beginPath(); g.moveTo(x0 - 2, y0 + 9); g.lineTo(x0 + 13, y0 + 1); g.stroke(); } } });
    if (n > 0) { const pl = plano(.6, .3, new THREE.MeshBasicMaterial({ map: tx, transparent: true, opacity: .75, depthWrite: false }), 0, .958, -1.45, 0, carro); pl.rotation.x = -Math.PI / 2; pl.userData.leitura = { t: `${n} risquinhos de giz no capô: uma marca por noite que você já passou aqui.` }; }
  });
  // cena de abertura: encadeia por cima do que os outros módulos já fizeram
  const cIni = cena.iniciar, cUp = cena.update, cFim = cena.fim;
  const ce = {};
  cena.iniciar = () => { cIni(); for (const k in ce) delete ce[k]; sil.visible = false; olhosS.forEach(o => { o.visible = false; }); desenhaEspelho('normal'); desenhaOdo(odoModo === 'volta' ? km6(21) : km6(kmTotal), true); };
  cena.update = (t, dt) => {
    cUp(t, dt);
    try {
      if (odoModo === 'volta') { const v = Math.max(0, 21 - Math.floor(t * 1.6)); desenhaOdo(km6(v), true); if (v === 0 && !ce.v7) { ce.v7 = true; falar('e6b_odo_volta'); } }
      else if (odoModo === '1979' && t > 2 && !ce.o1) { ce.o1 = true; desenhaOdo('001979', true); falar('e6b_odo_1979'); }
      else if (odoModo === 'davi' && t > 3 && !ce.od) { ce.od = true; desenhaOdo(' DAVI ', true); falar('e6b_odo_davi'); }
      if (NO === 5 && t > 21.5 && t < 22.5) { if (!ce.f5) { ce.f5 = true; desenhaEspelho('flash'); } } else if (NO === 5 && ce.f5 && !ce.f5b) { ce.f5b = true; desenhaEspelho('normal'); }
      if (NO >= 9 && t > 24.1 && !ce.o9) { ce.o9 = true; desenhaEspelho('olha'); }
      if (NO === 5 && t > 26.2 && t < 27.2) sil.visible = true; else if (NO >= 9 && t > 25.9 && t < 29) { sil.visible = true; olhosS.forEach(o => { o.visible = true; }); } else sil.visible = false;
      if (NO >= 9 && t > 25.9 && t < 26.2 && !ce.s9) { ce.s9 = true; try { SX.respiracao && SX.respiracao(posCarro(.3, 1, 1)); } catch (e) {} }
    } catch (e) {}
  };
  cena.fim = () => { cFim(); desenhaOdo(odoFinal(), true); sil.visible = false; };
  // marcos de noite: a Lia comenta quando o nº de noites vira número redondo
  ticks.push((() => { let feito = false; return dt => { if (feito || !S.flags.saiuCarro) return; feito = true; const k = [50, 25, 10, 5].find(n => NO >= n && NO < n + 3); if (k && !mem()['marco' + k]) { memSet({ ['marco' + k]: true }); agenda(9, () => falar('e6b_noite_' + k)); } }; })());
  // o painel só mostra o hodômetro aceso quando o carro está ligado: depois da cena fica escuro
  tenta('hodoFora', () => { if (S.flags.saiuCarro) desenhaOdo(odoFinal(), false); });

  // =================================================================== 6) O CARRO NÃO ESTÁ ONDE FICOU (3ª noite em diante)
  tenta('carroMexido', () => {
    if (!rejogo() || NO < 3) return;
    resumo.push('o carro mudou de lugar');
    ticks.push((() => { let feito = false; return dt => { if (feito || !S.flags.saiuCarro || !S.inv.lanterna || dist(carro.position.x, carro.position.z) > 9) return; feito = true; agenda(1.5, () => { falar('e6b_carro_mexido'); try { A.SFX.caixinha(carro.position.x, carro.position.z); } catch (e) {} agenda(6, () => falar('e6b_carro_musica')); }); }; })());
  });

  // =================================================================== 7) A PANE DE CADA NOITE
  tenta('pane', () => {
    const causa = escolhe('pane', ['pneu', 'cano', 'bateria', 'tanque']); S.flags.e6b_pane = causa;
    const rodas = carro.children.filter(o => o.geometry && o.geometry.type === 'CylinderGeometry' && Math.abs(o.rotation.z - Math.PI / 2) < .01);
    const vapor = [];
    if (causa === 'pneu' && rodas.length) { const r = rodas.find(o => o.position.x < 0 && o.position.z < 0) || rodas[0]; r.scale.x = .7; r.position.y = .33 * .7; }
    if (causa === 'cano') {
      const tx = A.canvasTex(64, 64, (g, w, h) => { const gr = g.createRadialGradient(32, 32, 2, 32, 32, 30); gr.addColorStop(0, 'rgba(255,255,255,.7)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, h); });
      for (let i = 0; i < 5; i++) { const pl = plano(.9, .9, new THREE.MeshBasicMaterial({ map: tx, transparent: true, opacity: 0, depthWrite: false }), carro.position.x + (i - 2) * .12, 1, carro.position.z - 1.5, 0); pl.userData.f = i / 5; vapor.push(pl); }
    }
    if (causa === 'tanque') { const m = new THREE.MeshStandardMaterial({ color: 0x0a0a10, roughness: .05, metalness: .6, transparent: true, opacity: .8 }); const pl = plano(1.4, 1.1, m, carro.position.x - .5, .014, carro.position.z + 2.5, 0); pl.rotation.x = -Math.PI / 2; }
    let vt = 0, chia = 0, pisca = 0, apitou = false;
    ticks.push(dt => {
      if (!S.flags.saiuCarro) return; vt += dt;
      if (!apitou) { apitou = true; agenda(5.5, () => falar('e6b_pane_' + causa)); if (causa === 'tanque') agenda(8, () => A.toast('Cheiro forte de gasolina vindo do carro.')); }
      if (causa === 'cano') { vapor.forEach(p => { const f = ((vt * .45 + p.userData.f) % 1); p.position.y = 1 + f * 1.6; p.scale.setScalar(.5 + f * 1.2); p.material.opacity = vt < 40 ? .32 * (1 - f) * Math.min(1, dist(carro.position.x, carro.position.z) > 26 ? 0 : 1) : 0; p.quaternion.copy(cam.quaternion); }); }
      if (causa === 'pneu' && vt < 26 && dist(carro.position.x, carro.position.z) < 18) { chia -= dt; if (chia <= 0) { chia = 3.4; try { A.SFX.estatica(.9, posCarro(-.9, .3, -1.3)); } catch (e) {} } }
      if (causa === 'bateria' && vt < 22) { pisca -= dt; if (pisca <= 0) { pisca = 2 + R('pisca' + Math.floor(vt)) * 3; try { c.farolOn(true); agenda(.12, () => c.farolOn(false)); agenda(.3, () => c.farolOn(true)); agenda(.42, () => c.farolOn(false)); } catch (e) {} } }
    });
  });

  // =================================================================== 8) O CARRO DE QUEM VEIO ANTES (raro) + GRAVADOR COM O RELATÓRIO
  tenta('antes', () => {
    if (!rejogo() || R('antes') > .34) return;
    const g = new THREE.Group(); g.position.set(-5.6, 0, GZ + 12.5); g.rotation.y = Math.PI - .18; grupo.add(g);
    box(1.8, .7, 4.2, MAT.carro, 0, .6, 0, g); box(1.6, .6, 2.2, MAT.carro, 0, 1.25, .2, g);
    box(1.62, .5, .05, MAT.vidro, 0, 1.25, -.92, g);
    for (const [x, z] of [[-.9, 1.3], [.9, 1.3], [-.9, -1.3], [.9, -1.3]]) { const p = cyl(.33, .33, .22, MAT.pneu, x, .33, z, 12, g); p.rotation.z = Math.PI / 2; }
    const tampa = box(1.6, .05, .9, MAT.carro, 0, 1.55, 2.5, g); tampa.rotation.x = -1.05;
    const rec = box(.34, .12, .22, new THREE.MeshStandardMaterial({ color: 0x1c1c1e, roughness: .6 }), 0, 1.0, 1.7, g, false); box(.1, .02, .1, new THREE.MeshStandardMaterial({ color: 0xff3020, emissive: 0xff3020, emissiveIntensity: 1.2 }), .1, 1.07, 1.7, g, false);
    A.addCollider(-6.7, -4.6, GZ + 10.3, GZ + 14.7);
    const hit = box(.8, .6, .8, new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false }), 0, 1.1, 1.8, g, false);
    let tocando = false, visto = false;
    interact(hit, () => tocando ? 'O gravador ainda está rodando...' : '<b>E</b>Apertar o play do gravador', () => {
      if (tocando) return; tocando = true; const s = stats();
      const causas = s.causas || {}; const top = Object.keys(causas).sort((a, b) => causas[b] - causas[a])[0];
      const horas = Math.floor((s.tempo || 0) / 3600), min = Math.floor(((s.tempo || 0) % 3600) / 60);
      const rep = { n: Math.max(0, (s.partidas || NO) - 0), m: s.mortes || 0, c: TXT6B.causas[top || 'nenhuma'], h: (horas ? horas + ' h ' : '') + min + ' min' };
      TXT6B.relatorio.forEach((l, i) => agenda(.4 + i * 3.6, () => { dizer('radio', '(gravador) ' + l.replace(/\{(\w)\}/g, (_, k) => rep[k]), true); try { SX.voz && SX.voz({ x: g.position.x, y: 1, z: g.position.z + 1 }, 7, 130, true); } catch (e) {} }));
      agenda(1, () => { try { A.SFX.estatica(1.2, { x: g.position.x, y: 1, z: g.position.z }); } catch (e) {} }); falar('e6b_antes_gravador'); conquista('e6b_antes'); medo(10);
      agenda(.4 + TXT6B.relatorio.length * 3.6 + 1, () => { tocando = false; }); resumo.push('ouviu o relatório do carro de quem veio antes');
    }, { on: () => !!S.flags.saiuCarro });
    ticks.push(dt => { if (!visto && S.flags.saiuCarro && dist(g.position.x, g.position.z) < 12) { visto = true; falar('e6b_antes_carro'); } });
  });

  // =================================================================== 9) RÁDIO DO CARRO: ESTAÇÕES NOVAS
  tenta('radio', () => {
    const antigo = c.ex.radioExtra;
    const freqFant = (88 + Math.floor(R('fm') * 190) / 10).toFixed(1).replace('.', ',');
    const dia = (() => { const d = new Date(); return d.getFullYear() * 372 + d.getMonth() * 31 + d.getDate(); })();
    const codigoDia = String(1000 + (Math.imul(dia, 2654435761) >>> 0) % 9000);
    const freqDia = (88 + ((dia * 7) % 190) / 10).toFixed(1).replace('.', ',');
    X.codigoDia = codigoDia; X.freqDia = freqDia;
    const novelaOuvidos = () => mem().novela || {};
    const estacoes = {
      fantasma() {
        const tp = Math.floor(R('fant') * 4) % 4, lugares = { prego: 'no prego da parede', balcao: 'em cima do balcão', casaco: 'no bolso do casaco', bomba: 'pendurada na bomba', sob: 'embaixo do balcão' };
        const pontos = ['carro', 'posto', 'portão', 'cadeira'];
        const t = TXT6B.fantasma[tp].replace(/\{f\}/g, freqFant).replace('{l}', lugares[X.lugarChave || 'prego']).replace('{c}', ({ chuva: 'chuva fina', neblina: 'serração', seca: 'noite seca' })[X.clima] || 'noite').replace('{p}', pontos[Math.floor(R('pt') * 4)]).replace('{d}', (TXT6B.desafios[X.desafioId] || (r6.desafio === 'quieta' ? 'passar sem a lanterna' : r6.desafio === 'semBuzina' ? 'não buzinar' : 'chegar rápido')));
        S.flags.e6b_pirata = true; return { quem: 'davi', texto: t };
      },
      novela() {
        const ep = ((NO - 1) % 9) + 1, o = novelaOuvidos(); o[ep] = true; memSet({ novela: o });
        if (Object.keys(o).length >= 9) { conquista('e6b_novela'); agenda(5, () => falar('e6b_radio_novela_fim')); }
        return { quem: 'radio', texto: `(Serra FM, ${freqDiaFmt(88.5)}) Radionovela, ` + TXT6B.novela[ep - 1] };
      },
      voce() {
        const s = stats(), causas = s.causas || {}, top = Object.keys(causas).sort((a, b) => causas[b] - causas[a])[0];
        const t = (top ? TXT6B.voce[Math.floor(R('voce') * 3) % 3] : TXT6B.voce[3]).replace('{c}', TXT6B.causas[top || 'nenhuma']);
        return { quem: 'radio', texto: '(FM 66,6, estação Você) ' + t };
      },
      boletim() {
        const i = Math.floor(R('bol' + NO) * TXT6B.boletim.length) % TXT6B.boletim.length, verdade = R('bolv' + NO) < .7;
        S.flags.e6b_boletim = verdade ? 'v' : 'f'; resumo.push('boletim da Serra FM: ' + (verdade ? 'verdadeiro' : 'falso'));
        return { quem: 'radio', texto: TXT6B.boletim[i] + (verdade ? '' : ' (e a voz do locutor hesita um segundo)') };
      },
      dia() {
        X.diaOuvido = true; S.flags.e6b_codigoDia = codigoDia;
        return { quem: 'radio', texto: `(FM ${freqDia}) Código do dia. Repito devagar: ${codigoDia.split('').join(' ... ')}. Quem souber o cadeado, que guarde.` };
      },
      charada() {
        const ch = TXT6B.charadas[Math.floor(R('chd' + NO) * 3) % 3]; X.charada = { r: ch.r, ate: 140, n: 0, t: 0 };
        return { quem: 'davi', texto: '(FM 97,9) ' + ch.q };
      }
    };
    const freqDiaFmt = n => n.toFixed(1).replace('.', ',');
    const ordem = ['fantasma', 'novela', 'voce', 'boletim', 'dia', 'charada'].map(k => [R('rad:' + k), k]).sort((a, b) => a[0] - b[0]).map(x => x[1]);
    let idx = 0;
    c.ex.radioExtra = n => {
      const r = antigo ? antigo(n) : null; if (r) return r;
      if (!rejogo() || n % 2 === 1) return null;           // só na 2ª jogada, nas trocas pares: o resto fica com as estações de sempre
      const k = ordem[idx % ordem.length]; idx++;
      try { return estacoes[k](); } catch (e) { return null; }
    };
    // charada: conta buzinadas curtas perto do carro
    const bz0 = SX.buzina;
    if (typeof bz0 === 'function') SX.buzina = function (pos, d) { try { const ch = X.charada; if (ch && pos && Math.hypot(pos.x - carro.position.x, pos.z - carro.position.z) < 5) { ch.n++; ch.t = 3; } } catch (e) {} return bz0.apply(this, arguments); };
    ticks.push(dt => {
      const ch = X.charada; if (!ch) return;
      ch.ate -= dt; if (ch.ate <= 0) { X.charada = null; return; }
      if (ch.t > 0) { ch.t -= dt; if (ch.t <= 0 && ch.n > 0) {
        if (ch.n === ch.r) { X.charada = null; S.inv.kits++; conquista('e6b_charada'); falar('e6b_radio_charada_ok'); A.toast('A resposta do Davi vale um curativo.'); resumo.push('acertou a charada do Davi'); }
        else { falar('e6b_radio_charada_erra'); ch.n = 0; }
      } }
    });
  });

  // =================================================================== MUNDO: posto e estrada (outro arquivo)
  mundoL6B(X);

  // =================================================================== RESUMO NO PORTÃO + TICK ÚNICO
  let chegou = false;
  A.W.tick.push(dt => {
    if (!jogando()) return;
    tickFila(dt);
    for (const f of ticks) { try { f(dt); } catch (e) { if (!X._erro) { X._erro = true; console.warn('[estrada6b:tick]', e); } } }
    if (!chegou && S.flags.saiuCarro && Math.hypot(P.pos.x, P.pos.z - GZ) < 6) {
      chegou = true;
      try { if (X.aoChegarPortao) X.aoChegarPortao(); } catch (e) {}
      if (S.flags.e6b_boletim) agenda(5, () => falar(S.flags.e6b_boletim === 'v' ? 'e6b_radio_verdade' : 'e6b_radio_falso'));
      if (resumo.length) agenda(9, () => A.toast('Também nesta noite: ' + resumo.slice(0, 5).join(', ') + '.'));
    }
  });
  try { if (typeof window !== 'undefined') window.__e6bX = X; } catch (e) {}
  return X;
}
