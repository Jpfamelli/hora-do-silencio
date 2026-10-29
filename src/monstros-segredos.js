// MONSTROS E IA, lote 4 — segredos das entidades (A Hora do Silêncio)
// Coisas que só quem explora descobre: chamar o Inspetor pelo nome, tocar o ombro dele quando reza, furtar o apito,
// as cenas raras em que ele está sentado (jantando, chorando numa carteira, cochilando), a noite sem ele,
// a Procissão com a outra Lia, a criança atrasada, o Tomé no fim da fila, a fila de costas, contar junto com a Ana,
// a brincadeira ao contrário, o dente de leite, os desenhos dela, a senha contra o Chamado, o Chamado com a voz
// do Joaquim, o gato Breu, a rotina dele (camas, portas, passos, garrafas), o outro chapéu e a chamada dos nomes.
// O motor chama criarMonstrosSegredos(E) uma vez e usa: tick(dt), novoMapa(id), tecla(e), fraseMorte(quem).
import * as THREE from 'three';
import { TXT } from './monstros-segredos-texto.js';

export function criarMonstrosSegredos(E) {
  const { W, P, M, MON, ANA, ANA_G, PROC, MAT, OPT, camera, scene, keys } = E;
  const S = () => E.S;
  const rand = (a, b) => a + Math.random() * (b - a);
  const pick = a => a[Math.random() * a.length | 0];
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const dist = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);
  const seguro = fn => (...a) => { try { return fn(...a); } catch (e) { console.warn('[monstros-segredos]', e && e.message); } };
  const temAudio = () => !!E.AC;
  const ML = () => E.ML;

  // ---------------- memória entre noites (só o que precisa sobreviver: noites, mortes, desenhos da Ana)
  const LS = 'hora-silencio-ms4';
  const lsLer = () => { try { return JSON.parse(localStorage.getItem(LS) || '{}') || {}; } catch (e) { return {}; } };
  const lsGravar = d => { try { localStorage.setItem(LS, JSON.stringify(d)); } catch (e) {} };
  const MEM = Object.assign({ noites: 0, mortes: 0, anaMortes: [] }, lsLer());

  // ---------------- relógio próprio e fila de eventos (só corre jogando)
  let agora = 0; const fila = [];
  const depois = (s, fn) => fila.push({ t: agora + s, fn });

  // ---------------- legenda própria e número grande da contagem
  const leg = document.createElement('div'); leg.id = 'ms-leg';
  leg.style.cssText = 'position:fixed;left:50%;bottom:30%;transform:translateX(-50%);font:italic 15px Georgia,serif;color:#d8c8b4;text-shadow:0 0 6px #000,0 0 2px #000;pointer-events:none;z-index:6;opacity:0;transition:opacity .4s;text-align:center;max-width:80vw';
  document.body.appendChild(leg);
  let legT = 0; const legCd = {};
  function legenda(k, importante = true, txt) {
    const t = txt || TXT.leg[k] || k; if (!t || OPT.legSom === 'nao' || (!importante && OPT.legSom !== 'todos')) return;
    if (!txt && (legCd[k] || -99) > agora - 3) return; legCd[k] = agora;
    leg.textContent = '[' + t + ']'; leg.style.opacity = 1; legT = 2.6;
  }
  const num = document.createElement('div'); num.id = 'ms-num';
  num.style.cssText = 'position:fixed;left:50%;top:38%;transform:translate(-50%,-50%);font:bold 88px Georgia,serif;color:rgba(232,170,200,.9);text-shadow:0 0 18px #000,0 0 4px #000;pointer-events:none;z-index:7;opacity:0;transition:opacity .25s';
  document.body.appendChild(num);
  let numT = 0;
  function numero(n, cor) { num.textContent = String(n); num.style.color = cor || 'rgba(232,170,200,.9)'; num.style.opacity = 1; numT = .7; }
  const veu = document.createElement('div'); veu.id = 'ms-veu';
  veu.style.cssText = 'position:fixed;inset:0;background:#000;pointer-events:none;z-index:5;opacity:0;transition:opacity .6s';
  document.body.appendChild(veu);

  // ---------------- sons procedurais
  const SOM = {
    sussurro(vol = 1) { const t = E.AC.currentTime; for (let i = 0; i < 4; i++) { const g = E.saida(null, .1); E.burst(t + i * .14, .12, 'bandpass', rand(2200, 3800), 3, g); E.env(g, t + i * .14, .02, .07 * vol, .1); } },
    apito(pos, vol = 1) { // o apito dele, agora na mão da Lia: mais limpo, mais longo
      const t = E.AC.currentTime, g = E.saida(pos ? { x: pos.x, y: 1.5, z: pos.z } : null, .7);
      const o = E.AC.createOscillator(); o.type = 'square'; o.frequency.setValueAtTime(2300, t); o.frequency.linearRampToValueAtTime(2250, t + .9);
      const tr = E.AC.createOscillator(); tr.frequency.value = 34; const tg = E.AC.createGain(); tg.gain.value = 120; tr.connect(tg); tg.connect(o.frequency);
      const f = E.AC.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 2400; f.Q.value = 3; o.connect(f); f.connect(g);
      E.env(g, t, .02, .28 * vol, .9); o.start(t); tr.start(t); o.stop(t + 1); tr.stop(t + 1);
    },
    colher(pos) { const t = E.AC.currentTime, g = E.saida({ x: pos.x, y: .9, z: pos.z }, .4); E.osc('sine', rand(2600, 3100), t, .25, g); E.osc('sine', rand(5200, 5900), t, .15, g); E.env(g, t, .001, .08, .2); },
    colherCai(pos) { const t = E.AC.currentTime; for (let i = 0; i < 4; i++) { const g = E.saida({ x: pos.x, y: .1, z: pos.z }, .4), k = t + i * (.09 - i * .015); E.osc('sine', rand(2400, 3400), k, .2, g); E.env(g, k, .001, .12 / (i + 1), .15); } },
    choro(pos) { const t = E.AC.currentTime; for (let i = 0; i < 3; i++) E.silaba(t + i * .5, { x: pos.x, y: 1.1, z: pos.z }, rand(150, 175), i % 2 ? 'u' : 'e', .32, .045, 'voz', .3); },
    ronco(pos) { const t = E.AC.currentTime, g = E.saida({ x: pos.x, y: 1.2, z: pos.z }, .4); const f = E.burst(t, 1.2, 'lowpass', 180, 2, g); f.frequency.linearRampToValueAtTime(320, t + 1); E.env(g, t, .4, .25, .7); },
    quebra(pos) { const t = E.AC.currentTime; for (let i = 0; i < 5; i++) { const g = E.saida({ x: pos.x, y: .5, z: pos.z }, .5), k = t + i * rand(.03, .09); E.burst(k, .12, 'bandpass', rand(500, 1400), 1.5, g); E.env(g, k, .002, .9, .12); } },
    grito(pos) { const t = E.AC.currentTime, g = E.saida({ x: pos.x, y: 1.5, z: pos.z }, .8); const o = E.AC.createOscillator(); o.type = 'sawtooth'; o.frequency.setValueAtTime(420, t); o.frequency.exponentialRampToValueAtTime(90, t + .8); const f = E.AC.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 1100; f.Q.value = 2; o.connect(f); f.connect(g); E.env(g, t, .02, .2, .8); o.start(t); o.stop(t + .9); const g2 = E.saida({ x: pos.x, y: 1.5, z: pos.z }, .8); E.burst(t, .7, 'highpass', 3000, 1, g2); E.env(g2, t, .02, .15, .6); },
    miado(pos, vol = 1) { const t = E.AC.currentTime, g = E.saida({ x: pos.x, y: .3, z: pos.z }, .4); const o = E.AC.createOscillator(); o.type = 'triangle'; o.frequency.setValueAtTime(520, t); o.frequency.linearRampToValueAtTime(820, t + .18); o.frequency.linearRampToValueAtTime(430, t + .55); const f = E.AC.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 1200; f.Q.value = 1.5; o.connect(f); f.connect(g); E.env(g, t, .05, .12 * vol, .5); o.start(t); o.stop(t + .65); },
    chiado(pos) { const t = E.AC.currentTime, g = E.saida({ x: pos.x, y: .3, z: pos.z }, .3); E.burst(t, .6, 'highpass', 2800, 1, g); E.env(g, t, .03, .18, .5); },
    ronrona(pos) { const t = E.AC.currentTime, g = E.saida({ x: pos.x, y: .3, z: pos.z }, .2); const o = E.AC.createOscillator(); o.type = 'sawtooth'; o.frequency.value = 26; const lp = E.AC.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 160; o.connect(lp); lp.connect(g); E.env(g, t, .3, .2, 1.8); o.start(t); o.stop(t + 2.2); },
    risadinha(pos) { const t = E.AC.currentTime; for (let i = 0; i < 3; i++) E.silaba(t + i * .13, { x: pos.x, y: .8, z: pos.z }, rand(430, 480), 'i', .1, .035, 'voz', .3); },
    vozFila(pos) { const t = E.AC.currentTime; for (let i = 0; i < 3; i++) E.silaba(t + i * .22, { x: pos.x, y: 1.5, z: pos.z }, rand(200, 225), pick(['o', 'a', 'u']), .2, .03, 'voz', .5); }
  };
  const SX4 = new Proxy({}, { get: (t, k) => (...a) => { if (!temAudio()) return; try { return SOM[k] && SOM[k](...a); } catch (e) { console.warn(e); } } });

  // ---------------- texturas em canvas
  const tex = (w, h, draw) => { const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d'); draw(g, w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; };
  const TX_ROSTO = tex(64, 64, (g, w, h) => { // o rosto da Lia, borrado, de olhos fechados
    g.fillStyle = '#8a7a6a'; g.fillRect(0, 0, w, h); g.filter = 'blur(2px)';
    g.fillStyle = '#5a4a3c'; g.fillRect(0, 0, w, 14); g.fillRect(0, 0, 8, 40); g.fillRect(56, 0, 8, 40);
    g.strokeStyle = '#2a2018'; g.lineWidth = 2; for (const x of [22, 42]) { g.beginPath(); g.arc(x, 30, 5, .1 * Math.PI, .9 * Math.PI); g.stroke(); }
    g.beginPath(); g.moveTo(26, 46); g.quadraticCurveTo(32, 44, 38, 46); g.stroke(); g.filter = 'none';
  });
  const TX_GIZ = (linhas, cor = 'rgba(232,150,190,.88)') => tex(256, 128, (g, w, h) => { g.clearRect(0, 0, w, h); g.fillStyle = cor; g.textAlign = 'center'; linhas.forEach((l, i) => { g.font = (i ? '26px' : 'bold 30px') + ' Georgia'; g.fillText(l, w / 2 + rand(-3, 3), 44 + i * 40); }); });
  const TX_DESENHO = (n, tipo) => tex(128, 128, (g, w, h) => { // desenho de giz de cera da Ana
    g.clearRect(0, 0, w, h); g.lineCap = 'round'; g.lineWidth = 3;
    const boneca = (x, cor, olhosX, lant) => { g.strokeStyle = cor; g.beginPath(); g.arc(x, 40, 11, 0, 7); g.moveTo(x, 51); g.lineTo(x, 84); g.moveTo(x - 14, 62); g.lineTo(x + 14, 62); g.moveTo(x, 84); g.lineTo(x - 10, 108); g.moveTo(x, 84); g.lineTo(x + 10, 108); g.stroke(); if (olhosX) { g.beginPath(); for (const o of [-4, 4]) { g.moveTo(x + o - 3, 37); g.lineTo(x + o + 3, 43); g.moveTo(x + o + 3, 37); g.lineTo(x + o - 3, 43); } g.stroke(); } if (lant) { g.fillStyle = '#f0e070'; g.beginPath(); g.moveTo(x + 14, 62); g.lineTo(x + 40, 52); g.lineTo(x + 40, 74); g.closePath(); g.fill(); } };
    if (tipo === 'maos') { boneca(44, '#d9c060', false, false); boneca(84, '#e090b8', false, false); g.strokeStyle = '#e8e0d0'; g.beginPath(); g.moveTo(58, 62); g.lineTo(70, 62); g.stroke(); return; }
    if (tipo === 'luz') { boneca(54, '#d9c060', true, true); g.fillStyle = 'rgba(232,150,190,.95)'; g.font = 'bold 18px Georgia'; g.fillText(TXT.luzDoi, 24, 122); return; }
    boneca(40, '#d9c060', false, true); boneca(96, '#e090b8', false, false);
    g.fillStyle = 'rgba(232,150,190,.95)'; g.font = 'bold 22px Georgia'; g.fillText('10', 86, 24); g.font = '14px Georgia'; g.fillText('nº ' + n, 8, 20);
  });
  const TX_ETIQ = txt => tex(128, 32, (g, w, h) => { g.fillStyle = '#d8d0bc'; g.fillRect(0, 0, w, h); g.fillStyle = '#2a2018'; g.font = 'bold 15px Georgia'; g.textAlign = 'center'; g.fillText(txt, w / 2, 21); });
  const matGiz = t => new THREE.MeshBasicMaterial({ map: t, transparent: true, depthWrite: false });

  // ---------------- utilidades de cena
  const fwdH = () => { const f = new THREE.Vector3(); camera.getWorldDirection(f); f.y = 0; if (f.lengthSq() < 1e-6) f.set(0, 0, -1); return f.normalize(); };
  const lado = p => { const f = fwdH(), v = new THREE.Vector3(p.x - P.pos.x, 0, p.z - P.pos.z).normalize(); const c = f.x * v.z - f.z * v.x, d = f.dot(v); return d > .7 ? 'à sua frente' : d < -.6 ? 'atrás de você' : c > 0 ? 'à direita' : 'à esquerda'; };
  const atrasDele = () => { const d = dist(M.pos, P.pos) || 1; return ((P.pos.x - M.pos.x) * Math.sin(M.yaw) + (P.pos.z - M.pos.z) * Math.cos(M.yaw)) / d < -.25; };
  const livre = (x, z, r = .7) => !W.colliders.some(c => c.on && x > c.minX - r && x < c.maxX + r && z > c.minZ - r && z < c.maxZ + r);
  function pontoLivre(sala, m = 1.6, r = .7) { if (!sala) return null; for (let i = 0; i < 20; i++) { const [x, z] = E.pontoEm(sala, m); if (livre(x, z, r)) return { x, z }; } return null; }
  const olhando = (w, cos = .93, maxD = 12) => { const v = new THREE.Vector3(w.x - camera.position.x, (w.y || 1) - camera.position.y, w.z - camera.position.z), d = v.length(); if (d > maxD) return false; const f = new THREE.Vector3(); camera.getWorldDirection(f); return f.dot(v.normalize()) > cos; };
  const ameaca = () => !!(PROC.fase || ANA.ativa || E.chamado || (M.ativo && ['caca', 'alerta', 'bote', 'agarra', 'fareja', 'vasculha'].includes(M.state)));
  const sabeNome = St => !!(St.notes.n28 || St.notes.n4 || St.fitas.f3);
  const flagCap = (St, k) => St.flags[k] === St.chapter;
  const marcarCap = (St, k) => { St.flags[k] = St.chapter; };
  const falaM = (txt, pequeno, quem = 'inspetor') => { if (pequeno) E.subPequeno(quem, txt); else E.sub(quem, txt); try { E.SFX.voz(M.pos, txt); } catch (e) {} M.falaT = Math.max(M.falaT, 6); };
  const extenso = n => { // número por extenso (até 9999), para ele dizer os passos
    const u = ['zero', 'um', 'dois', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove', 'dez', 'onze', 'doze', 'treze', 'quatorze', 'quinze', 'dezesseis', 'dezessete', 'dezoito', 'dezenove'];
    const d = ['', '', 'vinte', 'trinta', 'quarenta', 'cinquenta', 'sessenta', 'setenta', 'oitenta', 'noventa'];
    const c = ['', 'cento', 'duzentos', 'trezentos', 'quatrocentos', 'quinhentos', 'seiscentos', 'setecentos', 'oitocentos', 'novecentos'];
    const ate999 = x => { if (x < 20) return u[x]; if (x < 100) return d[x / 10 | 0] + (x % 10 ? ' e ' + u[x % 10] : ''); if (x === 100) return 'cem'; return c[x / 100 | 0] + (x % 100 ? ' e ' + ate999(x % 100) : ''); };
    n = clamp(Math.round(n), 0, 9999); if (n < 1000) return ate999(n);
    const m = n / 1000 | 0, r = n % 1000; return (m === 1 ? 'mil' : ate999(m) + ' mil') + (r ? (r < 100 || r % 100 === 0 ? ' e ' : ' ') + ate999(r) : '');
  };

  // ---------------- a noite: raridades sorteadas uma vez por noite (ficam no save, iguais depois do checkpoint)
  function raras(St) {
    if (St.flags.ms_raras) return St.flags.ms_raras;
    MEM.noites++; lsGravar(MEM);
    const r2 = Math.random();
    St.flags.ms_raras = { jantar: Math.random() < 1 / 15, semEle: Math.random() < 1 / 40, contrario: Math.random() < 1 / 25, chapeu: Math.random() < 1 / 25, cena2: r2 < 1 / 6 ? 'cochilo' : r2 < .5 ? 'carteira' : null };
    return St.flags.ms_raras;
  }

  // =====================================================================
  // 1. O NOME DELE: "Moacir..." e "Boa noite, seu Moacir"
  // =====================================================================
  let meninoT = 0;
  function chamarPeloNome(St) {
    if (!M.ativo || St.flags.sino) return false;
    const d = dist(M.pos, P.pos);
    if (St.hidden) { // escondida, com ele de costas logo ali: boa noite
      if (d > 3.5 || !atrasDele() || ['caca', 'bote', 'agarra', 'fareja', 'vasculha', 'alerta'].includes(M.state)) return false;
      if (flagCap(St, 'ms_bn')) { E.subPequeno('lia', TXT.boaNoiteDeNovo); return true; }
      marcarCap(St, 'ms_bn'); SX4.sussurro(.8); legenda('sussurro'); E.subPequeno('lia', TXT.boaNoite);
      const chance = .5 + (St.notes.n28 ? .25 : 0);
      depois(1.4, () => {
        if (!M.ativo || !St.hidden) return;
        if (Math.random() < chance) {
          MON.cabeca.rotation.x = .5; falaM(TXT.boaNoiteOk, false);
          M.recuo = Math.max(M.recuo, 30); M.state = 'patrulha'; M.acao = null; E.patrulhar(); E.conquista('ms4_educada');
        } else { // ele vira na hora e vem abrir
          const L = St.hidden; M.yaw = Math.atan2(L.x - M.pos.x, L.z - M.pos.z); E.SX.estalo(M.pos, 1.6, true); falaM(TXT.boaNoiteErro, false);
          M.achou = true; M.certo = true; M.state = 'investiga'; M.acao = null; E.planejar(M, L.x + L.face[0] * 1.1, L.z + L.face[1] * 1.1);
        }
      });
      return true;
    }
    if (d > 4) return false;
    if (!sabeNome(St)) { if (!flagCap(St, 'ms_semNome')) { marcarCap(St, 'ms_semNome'); E.subPequeno('lia', TXT.moacirSemNome); } return false; }
    if (['caca', 'bote', 'agarra', 'alerta'].includes(M.state)) { E.subPequeno('lia', TXT.moacirCaca); return true; }
    const n = St.flags.ms_nomeCap && St.flags.ms_nomeCap.c === St.chapter ? St.flags.ms_nomeCap.n : 0;
    St.flags.ms_nomeCap = { c: St.chapter, n: n + 1 };
    SX4.sussurro(); legenda('sussurro'); E.subPequeno('lia', TXT.moacirSussurro);
    if (n === 0) {
      ML().pausa('ms_menino', 4, 'patrulha', P.pos.clone()); meninoT = 4;
      depois(.6, () => { if (M.state === 'reza') falaM(TXT.moacirQuem, false, 'moacir'); });
      E.conquista('ms4_nome');
    } else { // da segunda vez no capítulo: bravo, caça direto
      M.furia = Math.max(M.furia, 6); falaM(TXT.moacirBravo, false); M.state = 'patrulha'; E.iniciarAlerta();
    }
    return true;
  }
  function poseMenino(dt) { // a cabeça de lado, como um menino que ouviu o próprio nome
    if (meninoT <= 0) return; meninoT -= dt;
    if (M.state !== 'reza') { meninoT = 0; return; }
    const k = Math.min(1, dt * 6); MON.cabeca.rotation.z = lerp(MON.cabeca.rotation.z, 1.25, k); MON.cabeca.rotation.x = lerp(MON.cabeca.rotation.x, -.35, k);
    MON.g.scale.setScalar(lerp(MON.g.scale.x, .74, k)); if (meninoT <= 0) MON.g.scale.setScalar(.8);
  }

  // =====================================================================
  // 2. O CORPO DELE: tocar o ombro (reza), furtar o apito (reza, agachada), o papel do bolso (cochilo)
  // =====================================================================
  let itMon = null, holdIni = 0, apitoMesh = null;
  function ctxMon() {
    const St = S(); if (!St || !M.ativo || St.hidden || St.flags.sino) return null;
    const d = dist(M.pos, P.pos);
    if (CENA && CENA.tipo === 'cochilo' && M.state === 'reza' && d < 2.1 && !St.flags.ms_bolso) return { tipo: 'bolso', hold: 3, label: 'Tirar o papel do bolso dele' };
    if (d < 1.15 || d > 2.1 || !atrasDele()) return null;
    if (M.state === 'reza' && !CENA) {
      if (P.crouch && !St.flags.ms_apito) return { tipo: 'apito', hold: 2, label: 'Tirar o apito do cinto dele' };
      if (!P.crouch && !flagCap(St, 'ms_ombro')) return { tipo: 'ombro', hold: 1.5, label: 'Tocar o ombro dele' };
    }
    if (!P.crouch && ['escuta', 'emboscada'].includes(M.state)) return { tipo: 'pulso', hold: 1.5, label: 'Tocar o ombro dele' };
    return null;
  }
  function montarItMon() {
    itMon = E.interact(MON.g, () => { const c = ctxMon(); return c ? `<b>E</b>${c.label}` : ''; }, seguro(() => acaoMon()), { on: () => !!ctxMon() });
    Object.defineProperty(itMon, 'hold', { get: () => { const c = ctxMon(); return c ? c.hold : 0; }, configurable: true });
  }
  function acaoMon() {
    const St = S(), c = ctxMon(); if (!c) return;
    if (c.tipo === 'ombro') {
      marcarCap(St, 'ms_ombro'); falaM(TXT.ombroLuiz, false, 'moacir');
      const pz = window.__mlore && window.__mlore.pausa; if (pz) pz.t += 8;
      MON.cabeca.rotation.x = .6; depois(1.8, () => E.subPequeno('lia', TXT.ombroLia)); E.conquista('ms4_luiz');
    } else if (c.tipo === 'pulso') { // fora da reza ele não está distraído: o gesto mata
      St.flags.ms_pulso = true; E.toast(TXT.ombroPulso); M.yaw = Math.atan2(P.pos.x - M.pos.x, P.pos.z - M.pos.z); E.SX.agarrao();
      St.causaCtx = 'agarrao'; St.health = Math.min(St.health, 1); E.atacar('inspetor');
    } else if (c.tipo === 'apito') {
      St.flags.ms_apito = 'comigo'; if (apitoMesh) apitoMesh.visible = false;
      E.toast(TXT.apitoPego); depois(1, () => E.subPequeno('lia', TXT.apitoLia)); E.conquista('ms4_maoleve');
    } else if (c.tipo === 'bolso') {
      St.flags.ms_bolso = true; E.conquista('ms4_bolso');
      depois(.2, () => E.abrirNotaUI(TXT.bolsoTitulo, TXT.bolsoTexto, null, true));
    }
  }
  function tickHoldMon(dt, St) { // segurando E nele: qualquer passo estraga o furto
    const segurando = itMon && E.alvo === itMon && keys.KeyE;
    if (!segurando) { holdIni = 0; return; }
    const c = ctxMon(); if (!c) return;
    holdIni += dt; M.cool = Math.max(M.cool, .3); // segurar perto dele não dispara o bote; mexer-se sim
    if ((c.tipo === 'apito' || c.tipo === 'bolso') && P.noiseR > 0 && holdIni > .15) {
      keys.KeyE = false; holdIni = 0; E.toast(c.tipo === 'apito' ? TXT.apitoFalha : TXT.cochiloAcorda);
      if (c.tipo === 'bolso') { acordarCena('mexeu'); return; }
      M.yaw = Math.atan2(P.pos.x - M.pos.x, P.pos.z - M.pos.z); E.agarrar();
    }
  }
  // o apito na mão da Lia: G sem garrafas apita uma vez
  let apitoFase = null;
  function usarApito(St) {
    if (St.flags.ms_apito !== 'comigo' || St.hidden || St.inv.garrafas > 0) return false;
    St.flags.ms_apito = 'usado'; SX4.apito(null, 1.2); legenda('apito'); P.shake = Math.max(P.shake, .02);
    if (!M.ativo || St.flags.sino) return true;
    const salas = W.salas.filter(r => !r.fora && !r.seguro && r !== P.room && E.distSalas(r, P.room) >= 2 && E.distSalas(r, P.room) < 90);
    const dorm = salas.filter(r => /^dorm/.test(r.id)); const alvo = (dorm.length ? dorm : salas).sort((a, b) => E.distSalas(b, P.room) - E.distSalas(a, P.room))[0];
    if (!alvo) return true;
    const c = E.centroSala(alvo); M.state = 'investiga'; M.acao = null; M.ultimo = null; M.searchT = 0; E.planejar(M, c.x, c.z); M.alvoGarrafa = 15; M.furia = 0;
    depois(.8, () => falaM(TXT.apitoToque, false)); apitoFase = { t: 0 };
    return true;
  }
  function tickApito(dt, St) {
    if (!apitoMesh) apitoMesh = MON.g.children.find(c => c.isGroup && Math.abs(c.position.y - 2.95) < .02 && Math.abs(c.position.x - .04) < .02) || null;
    if (apitoMesh) apitoMesh.visible = !St.flags.ms_apito;
    if (apitoFase) {
      apitoFase.t += dt;
      if (M.alvoGarrafa > 0 && M.state === 'investiga') M.alvoGarrafa = Math.max(M.alvoGarrafa, .5); // até chegar, os seus passos não tiram ele do caminho
      if ((M.state === 'procura' && apitoFase.t > 2) || apitoFase.t > 40) { apitoFase = null; if (M.ativo && M.state === 'procura') { M.searchT = 20; falaM(TXT.apitoQuem, false); } }
    }
    // depois do furto ele procura o apito no peito quando passa por perto
    if (St.flags.ms_apito && M.ativo && M.state === 'patrulha' && dist(M.pos, P.pos) < 12 && !flagCap(St, 'ms_apitoMurm') && Math.random() < dt * .1) {
      marcarCap(St, 'ms_apitoMurm'); falaM(St.flags.ms_apito === 'usado' ? pick(TXT.apitoMurmura) : TXT.apitoCade, true); MON.armR.rotation.x = -1.2;
    }
  }

  // =====================================================================
  // 3. CENAS RARAS: ele sentado (jantar no refeitório, carteira na sala de aula, cochilo na biblioteca)
  // =====================================================================
  let CENA = null;
  const CENAS = {
    jantar: { cap: 1, sala: 'refeit', ok: St => raras(St).jantar },
    carteira: { cap: 2, sala: 'aula', ok: St => raras(St).cena2 === 'carteira' },
    cochilo: { cap: 2, sala: 'biblio', ok: St => raras(St).cena2 === 'cochilo' }
  };
  function propsCena(tipo, p, yaw) {
    const g = new THREE.Group(); g.position.set(p.x, 0, p.z); g.rotation.y = yaw; W.grupo.add(g);
    const mad = new THREE.MeshStandardMaterial({ color: 0x3a2a1c, roughness: .9 }), pecas = [];
    if (tipo === 'jantar') {
      E.box(1.1, .05, .7, mad, 0, .78, .55, g); for (const [x, z] of [[-.5, .25], [.5, .25], [-.5, .85], [.5, .85]]) E.box(.05, .76, .05, mad, x, .38, z, g);
      const prato = E.cyl(.16, .13, .03, new THREE.MeshStandardMaterial({ color: 0xcfc6b0, roughness: .4 }), 0, .82, .45, 14, g);
      const colher = E.box(.02, .01, .16, new THREE.MeshStandardMaterial({ color: 0x9a948a, metalness: .7, roughness: .3 }), .12, .84, .42, g, false);
      E.box(.45, .45, .42, mad, 0, .22, -.05, g); pecas.push(prato, colher);
    } else if (tipo === 'carteira') {
      const tampo = E.box(.6, .04, .42, mad, 0, .55, .42, g); const pe1 = E.box(.04, .53, .04, mad, -.25, .27, .42, g), pe2 = E.box(.04, .53, .04, mad, .25, .27, .42, g);
      const banco = E.box(.4, .3, .3, mad, 0, .15, -.02, g); pecas.push(tampo, pe1, pe2, banco);
    } else {
      const pol = new THREE.MeshStandardMaterial({ color: 0x3a1c1a, roughness: 1 });
      E.box(.75, .42, .7, pol, 0, .21, 0, g); E.box(.75, .7, .12, pol, 0, .75, -.32, g); for (const s of [-1, 1]) E.box(.1, .25, .7, pol, s * .36, .52, 0, g);
      const vidro = new THREE.MeshStandardMaterial({ color: 0x4a4030, emissive: 0xffa040, emissiveIntensity: 1.6, transparent: true, opacity: .85 });
      const lamp = E.cyl(.06, .07, .16, vidro, .05, .62, .22, 8, g); pecas.push(lamp);
    }
    return { g, pecas };
  }
  function iniciarCena(tipo, St) {
    const cfg = CENAS[tipo], sala = E.SALA(cfg.sala); if (!sala) return false;
    const p = pontoLivre(sala, 2, .9) || pontoLivre(sala, 1.2, .55) || pontoLivre(sala, .8, .35); if (!p) return false;
    const yaw = rand(0, 6.28);
    M.pos.set(p.x, 0, p.z); M.yaw = yaw; M.path = []; M.acao = null;
    ML().pausa('ms_sentado', 9999); M.yaw = yaw;
    CENA = { tipo, sala, p, yaw, t: 0, somT: 1, falaT: 3, dentro: 0, passouAtras: false, fim: false, longeT: 0, tab: 0, ...propsCena(tipo, p, yaw) };
    St.flags['ms_cena_' + tipo] = true;
    return true;
  }
  function encerrarCena(calmo) {
    const c = CENA; if (!c) return; CENA = null;
    MON.g.scale.setScalar(.8);
    if (calmo && M.ativo && M.state === 'reza') { M.state = 'patrulha'; E.patrulhar(); }
    if (c.tipo === 'cochilo' && c.pecas[0]) c.pecas[0].material.emissiveIntensity = 0;
  }
  function acordarCena(motivo) { // barulho: ele levanta de uma vez
    const c = CENA; if (!c) return;
    if (c.tipo === 'jantar') { SX4.colherCai(c.p); legenda('colher'); if (c.pecas[1]) c.pecas[1].visible = false; falaM(TXT.jantarAcorda, false); }
    else if (c.tipo === 'carteira') { SX4.quebra(c.p); legenda('carteira'); for (const m of c.pecas) { m.position.x += rand(-.4, .4); m.position.y = .03; m.rotation.set(rand(-1.5, 1.5), rand(0, 3), rand(-1.5, 1.5)); } falaM(TXT.carteiraAcorda, false); P.shake = Math.max(P.shake, .04); }
    else { SX4.colherCai(c.p); if (c.pecas[0]) { c.pecas[0].position.set(.3, .05, .5); c.pecas[0].rotation.z = 1.5; } falaM(TXT.cochiloAcorda, false); }
    encerrarCena(false);
    if (M.ativo && motivo !== 'motor') { M.state = 'patrulha'; if (c.tipo === 'cochilo') E.iniciarAlerta(); else E.entrarCaca(); }
  }
  function tickCenas(dt, St) {
    if (!CENA) {
      if (!M.ativo || ameaca() || M.state !== 'patrulha' || M.recuo > 0 || !P.room) return;
      for (const tipo in CENAS) {
        const cfg = CENAS[tipo]; if (St.chapter !== cfg.cap || W.mapa !== 'terreo' || St.flags['ms_cena_' + tipo] || !cfg.ok(St)) continue;
        const sala = E.SALA(cfg.sala); if (!sala || P.room === sala || E.distSalas(P.room, sala) !== 1 || dist(M.pos, P.pos) < 10 || E.visivel(M.pos, 2, 30)) continue;
        if (iniciarCena(tipo, St)) return;
      }
      return;
    }
    const c = CENA; c.t += dt;
    if (M.state !== 'reza' || !M.ativo) { acordarCena('motor'); return; } // o motor já o tirou da cena (ouviu você)
    const d = dist(M.pos, P.pos), dentro = P.room && P.room.id === c.sala.id;
    // pose sentado
    const k = Math.min(1, dt * 8); M.yaw = c.yaw; MON.g.rotation.y = c.yaw; MON.g.position.y = -.52;
    MON.legL.rotation.x = MON.legR.rotation.x = -1.45;
    if (c.tipo === 'jantar') { MON.g.rotation.x = .1; MON.armR.rotation.x = -.9 + Math.sin(c.t * 2.2) * .35; MON.armL.rotation.x = -.6; MON.cabeca.rotation.z = lerp(MON.cabeca.rotation.z, .5, k); }
    else if (c.tipo === 'carteira') { MON.g.rotation.x = .5 + Math.sin(c.t * 9) * .02; MON.armL.rotation.x = MON.armR.rotation.x = -1.7; MON.cabeca.rotation.z = lerp(MON.cabeca.rotation.z, .2, k); MON.cabeca.rotation.x = lerp(MON.cabeca.rotation.x, .6, k); MON.g.scale.setScalar(.72); }
    else { MON.g.rotation.x = -.15; MON.armL.rotation.x = MON.armR.rotation.x = -.5; MON.cabeca.rotation.z = lerp(MON.cabeca.rotation.z, 1.3, k * .3); MON.cabeca.rotation.x = .4 + Math.sin(c.t * 1.4) * .05; }
    // som e fala de cada cena
    c.somT -= dt;
    if (c.somT <= 0) {
      if (c.tipo === 'jantar') { c.somT = rand(1.1, 1.8); SX4.colher(c.p); if (Math.random() < .3) { E.SX.cantarola(M.pos); if (d < 16) legenda('cantarola', false); } }
      else if (c.tipo === 'carteira') { c.somT = rand(2.5, 4); SX4.choro(M.pos); if (d < 16) legenda('choro', false); }
      else { c.somT = 3.4; SX4.ronco(M.pos); if (d < 16) legenda('ronco', false); }
    }
    if (dentro && !c.visto) { c.visto = true; E.subPequeno('lia', c.tipo === 'jantar' ? TXT.jantarLia : c.tipo === 'carteira' ? TXT.carteiraLia : TXT.cochiloLia); }
    // o que acorda cada um
    const sensivel = c.tipo === 'cochilo' ? (P.noiseR > 0 && !P.crouch && d < 6) : c.tipo === 'carteira' ? (P.noiseR > 2.5 && d < 10) : (P.noiseR >= 3 && d < 9);
    if (sensivel && !St.hidden) { acordarCena('ruido'); return; }
    if (c.tipo === 'jantar') {
      if (dentro && d < 3.5 && atrasDele()) c.passouAtras = true;
      if (c.passouAtras && !dentro && !c.ok) { c.ok = true; E.conquista('ms4_apetite'); E.subPequeno('lia', TXT.jantarOk); }
    } else if (c.tipo === 'carteira') {
      c.falaT -= dt;
      if (dentro) { c.dentro += dt; if (c.falaT <= 0 && c.tab < TXT.tabuada.length) { c.falaT = 3; E.subPequeno('moacir', TXT.tabuada[c.tab++]); } }
      if (c.dentro >= 15 && !c.ok) { c.ok = true; E.subPequeno('moacir', TXT.tabuadaFim); E.conquista('ms4_castigo'); depois(3, () => E.subPequeno('lia', TXT.carteiraLiaFim)); depois(6, () => { if (CENA === c) encerrarCena(true); }); }
    }
    if (d > 28) c.longeT += dt; else c.longeT = 0;
    if (c.longeT > 15 || c.t > 150) encerrarCena(true);
  }

  // =====================================================================
  // 4. A NOITE SEM ELE (rara): Capítulo I sem Inspetor até o gerador; aí ele está de pé no meio do caminho
  // =====================================================================
  let semEleT = 20, geradorAnt = null;
  function tickSemEle(dt, St) {
    const r = raras(St); if (!r.semEle || St.chapter !== 1 || W.mapa !== 'terreo') { geradorAnt = !!St.done.gerador; return; }
    const ger = !!St.done.gerador;
    if (!ger) {
      if (M.ativo && !St.flags.ms_semEleFim) E.desativarInspetor();
      semEleT -= dt;
      if (semEleT <= 0) { semEleT = rand(25, 40); const k = Math.random(); if (k < .45) { E.SX.passoCima(P.pos); legenda('passos lá em cima', false, 'passos no andar de cima'); } else if (k < .8) { const s = pick(W.salas.filter(x => !x.fora)); if (s) { const c = E.centroSala(s); E.SX.portaLonge(c.x, c.z); } } else if (!St.flags.ms_semEleApito) { St.flags.ms_semEleApito = true; SX4.apito({ x: P.pos.x + 20, z: P.pos.z }, .35); legenda('apito', false, 'um apito rachado, muito longe'); } }
    } else if (geradorAnt === false && !St.flags.ms_semEleFim) {
      St.flags.ms_semEleFim = true;
      const f = fwdH(); let pos = null;
      for (const dd of [5, 4, 6, 3]) { const p = new THREE.Vector3(P.pos.x + f.x * dd, 0, P.pos.z + f.z * dd); const q = p.clone(); E.collide(q, .35); if (q.distanceTo(p) < .1 && E.linhaLivre(P.pos, p)) { pos = p; break; } }
      if (!pos) { const s = W.salas.find(x => x.id === 'hall'); if (s) pos = E.centroSala(s); }
      if (pos) {
        E.ativarInspetor(pos.x, pos.z); M.yaw = Math.atan2(P.pos.x - pos.x, P.pos.z - pos.z); M.cool = 4; ML().pausa('ms_parado', 5, 'patrulha', P.pos.clone());
        depois(1.2, () => E.subPequeno('lia', TXT.semEleLia)); depois(3.5, () => { E.toast(TXT.semEleToast); E.conquista('ms4_semele'); });
      }
    }
    geradorAnt = ger;
  }

  // =====================================================================
  // 5. A PROCISSÃO: a outra Lia no fim da fila, a criança atrasada, o Tomé, a fila de costas, a contagem
  // =====================================================================
  const LIAS = [];
  (function montarLias() {
    const capa = new THREE.MeshStandardMaterial({ color: 0x2c3426, roughness: .7, emissive: 0x05070a, emissiveIntensity: .4 });
    const rosto = new THREE.MeshStandardMaterial({ map: TX_ROSTO, roughness: .9, emissive: 0x2a2018, emissiveIntensity: .35 });
    const lente = () => new THREE.MeshStandardMaterial({ color: 0x3a3428, emissive: 0xfff0c0, emissiveIntensity: 0 });
    for (let i = 0; i < 3; i++) {
      const g = new THREE.Group();
      E.cyl(.16, .3, 1.15, capa, 0, .58, 0, 9, g); E.cyl(.17, .16, .3, capa, 0, 1.28, 0, 9, g);
      const cab = new THREE.Group(); cab.position.y = 1.5; g.add(cab);
      const c = new THREE.Mesh(new THREE.SphereGeometry(.11, 12, 10), rosto); c.rotation.y = -Math.PI / 2; cab.add(c);
      const capuz = new THREE.Mesh(new THREE.SphereGeometry(.135, 10, 8, 0, Math.PI * 2, 0, Math.PI * .6), capa); capuz.rotation.x = -.5; capuz.position.z = -.02; cab.add(capuz);
      const lm = lente(); const lant = E.cyl(.03, .035, .2, new THREE.MeshStandardMaterial({ color: 0x2a2a2a, metalness: .5 }), .2, .78, .08, 8, g); lant.rotation.x = 1.3; const lens = E.cyl(.036, .036, .01, lm, .2, .76, .18, 8, g); lens.rotation.x = 1.3;
      g.position.set(0, 0, -1.9 - i * .85); g.visible = false; g.userData = { cab, lm, base: g.position.clone(), f: Math.random() * 6 }; PROC.g.add(g); LIAS.push(g);
    }
  })();
  // olhos pintados na nuca (só na noite em que a fila volta)
  const NUCAS = PROC.filhos.map(s => { const m = new THREE.MeshBasicMaterial({ color: 0xff3010 }); const g = new THREE.Group(); for (const x of [-.04, .04]) { const o = new THREE.Mesh(new THREE.SphereGeometry(.015, 6, 6), m); o.position.set(x, 1.07, -.11); g.add(o); } g.visible = false; s.add(g); return g; });
  // o braço que aponta, só na criança do fim da fila
  const TOME = PROC.filhos[PROC.filhos.length - 1];
  const bracoTome = new THREE.Group(); bracoTome.position.set(.12, .85, 0); bracoTome.visible = false; TOME.add(bracoTome); E.cyl(.022, .018, .4, MAT.sombra, 0, -.2, 0, 6, bracoTome);
  // a menina atrasada (descalça, de camisola clara)
  const ATR = (() => { const g = new THREE.Group(); const cam = new THREE.MeshStandardMaterial({ color: 0x9c968a, roughness: 1 }), pele = new THREE.MeshStandardMaterial({ color: 0x8a8278, roughness: .8 }); E.cyl(.09, .2, .7, cam, 0, .36, 0, 8, g); const c = new THREE.Mesh(new THREE.SphereGeometry(.09, 10, 8), pele); c.position.y = .82; g.add(c); const br = new THREE.Group(); br.position.set(.12, .68, 0); g.add(br); E.cyl(.02, .016, .32, pele, 0, -.16, 0, 6, br); g.visible = false; scene.add(g); return { g, br }; })();
  const PR = { fase: null, rastro: [], contaT: 0, conta: 0, liasN: 0, liasVistas: new Set(), olharTome: 0, tomeFeito: false, atr: null, contrario: false, lockerTome: null };
  function inicioPassagem(St) {
    PR.liasN = Math.min(3, St.mortes || 0); PR.liasVistas = new Set(); PR.conta = 0; PR.contaT = .8; PR.olharTome = 0; PR.tomeFeito = false; PR.rastro = [];
    PR.contrario = !!raras(St).contrario;
    LIAS.forEach((g, i) => { g.visible = i < PR.liasN; g.position.copy(g.userData.base); g.userData.cab.rotation.set(.65, 0, 0); g.userData.ergueu = false; g.userData.piscou = false; });
    NUCAS.forEach(n => { n.visible = PR.contrario; });
    TOME.position.z = TOME.userData.base.z - .45;
    PR.atr = Math.random() < 1 / 3 ? { t: 0, parou: 0, feito: false } : null; ATR.g.visible = !!PR.atr;
    if (PR.contrario) { depois(1, () => E.subPequeno('lia', TXT.contrarioLia)); E.conquista('ms4_volta'); }
    if (PR.liasN && St.hidden) depois(2, () => legenda('pecas', true));
  }
  function fimPassagem(St) {
    LIAS.forEach(g => { g.visible = false; }); NUCAS.forEach(n => { n.visible = false; }); ATR.g.visible = false; bracoTome.visible = false; TOME.rotation.y = 0; PR.atr = null;
    if (PR.tomeFeito && PR.lockerTome) { const L = PR.lockerTome; velaTome(L); depois(1.5, () => E.subPequeno('lia', TXT.tomeAponta)); E.conquista('ms4_ultimo'); }
  }
  // a vela no armário que o Tomé apontou: ele não abre esse, uma vez
  let velaMesh = null;
  function velaTome(L) {
    L.msSeguro = true;
    const g = new THREE.Group(); g.position.set(L.x + L.face[0] * .55, 0, L.z + L.face[1] * .55); W.grupo.add(g);
    E.cyl(.025, .025, .18, MAT.vela, 0, .09, 0, 8, g); const ch = new THREE.Mesh(new THREE.SphereGeometry(.015, 6, 5), new THREE.MeshBasicMaterial({ color: 0xffc060 })); ch.scale.y = 2.4; ch.position.y = .22; g.add(ch);
    velaMesh = { g, ch, L };
  }
  function tickProc(dt, St) {
    const fase = PROC.fase;
    if (fase === 'passando' && PR.fase !== 'passando') inicioPassagem(St);
    if (fase !== 'passando' && PR.fase === 'passando') fimPassagem(St);
    PR.fase = fase;
    if (velaMesh) { velaMesh.ch.scale.y = 2.2 + Math.sin(agora * 9) * .4; if (!velaMesh.L.msSeguro || velaMesh.g.parent !== W.grupo) { if (velaMesh.g.parent) velaMesh.g.parent.remove(velaMesh.g); velaMesh = null; } }
    if (fase !== 'passando') return;
    const dP = dist(PROC.pos, P.pos);
    PR.rastro.push(PROC.pos.clone()); if (PR.rastro.length > 40) PR.rastro.shift();
    // a fila de costas: os rostos virados para o caminho já feito
    if (PR.contrario && PROC.pausa <= 0) for (const s of PROC.filhos) s.rotation.y = Math.PI;
    // a Lia conta a fila, escondida
    if (St.hidden && dP < 9) {
      PR.contaT -= dt;
      const total = PROC.filhos.length + PR.liasN;
      if (PR.contaT <= 0 && PR.conta < total) { PR.contaT = .5; PR.conta++; legenda('fila', true, TXT.leg.fila + ': ' + TXT.contaFila.slice(Math.max(0, PR.conta - 3), PR.conta).join('... ') + '...'); }
    }
    // as outras Lias: a lanterna pisca diante do seu esconderijo; olhar a primeira faz ela levantar o rosto
    LIAS.forEach((g, i) => {
      if (!g.visible) return;
      const w = g.getWorldPosition(new THREE.Vector3()), dl = dist(w, P.pos);
      if (St.hidden && dl < 3 && !g.userData.piscou) { g.userData.piscou = true; g.userData.lm.emissiveIntensity = 3; depois(.25, () => { g.userData.lm.emissiveIntensity = 0; }); legenda('lanternaPisca'); }
      if (dl < 9 && (St.hidden ? olhando({ x: w.x, y: 1.4, z: w.z }, .9) : E.visivel(w, 1.4, 12))) {
        PR.liasVistas.add(i);
        if (i === 0 && !g.userData.ergueu) { g.userData.ergueu = true; depois(.4, () => { SX4.vozFila(w); E.subPequeno('liaFalsa', TXT.liaFila); }); depois(2.4, () => E.subPequeno('lia', TXT.liaFilaLia)); E.conquista('ms4_decima'); }
        if (PR.liasVistas.size >= 3 && !PR.tresDito) { PR.tresDito = true; E.subPequeno('lia', TXT.liasTres); E.conquista('ms4_tres'); }
      }
      const cab = g.userData.cab;
      if (g.userData.ergueu) { const a = Math.atan2(P.pos.x - w.x, P.pos.z - w.z) - PROC.g.rotation.y; cab.rotation.x = lerp(cab.rotation.x, 0, Math.min(1, dt * 3)); cab.rotation.y = lerp(cab.rotation.y, Math.atan2(Math.sin(a), Math.cos(a)), Math.min(1, dt * 3)); }
    });
    // o último da fila anda meio passo atrás, olhando para trás; quem acompanha com o olhar recebe um aviso
    if (!PR.contrario) TOME.rotation.y = PROC.pausa > 0 ? TOME.rotation.y : Math.PI * .85;
    if (!PR.tomeFeito && St.hidden && dP < 10) {
      const w = TOME.getWorldPosition(new THREE.Vector3());
      if (olhando({ x: w.x, y: 1, z: w.z }, .92)) PR.olharTome += dt;
      if (PR.olharTome >= 3) {
        const L = W.lockers.filter(x => x !== St.hidden && x.tipo === 'armario' && dist(x, P.pos) < 16).sort((a, b) => dist(a, P.pos) - dist(b, P.pos))[0];
        if (L) { PR.tomeFeito = true; PR.lockerTome = L; bracoTome.visible = true; const a = Math.atan2(L.x - w.x, L.z - w.z) - PROC.g.rotation.y - TOME.rotation.y; bracoTome.rotation.order = 'YXZ'; bracoTome.rotation.set(-1.45, a, 0); }
      }
    }
    // a menina atrasada corre atrás da fila e para na frente do seu esconderijo
    const A = PR.atr;
    if (A) {
      A.t += dt;
      const alvo = PR.rastro[Math.max(0, PR.rastro.length - 28)] || PROC.pos;
      const L = St.hidden;
      if (L && !A.feito && dist(alvo, L) < 3.2) {
        A.parou += dt; const fx = L.x + L.face[0] * 1, fz = L.z + L.face[1] * 1;
        ATR.g.position.set(fx, 0, fz); ATR.g.rotation.y = Math.atan2(L.x - fx, L.z - fz); ATR.br.rotation.x = -2.4;
        if (A.parou > .2 && !A.shh) { A.shh = true; E.subPequeno('crianca', TXT.atrasadaShh); legenda('nuca'); }
        if (A.parou > 2.5) {
          A.feito = true; ATR.br.rotation.x = 0;
          if (E.prendendo()) { PROC.t = Math.min(PROC.t, 1.5); legenda('pecas', true, 'passinhos correndo para longe'); depois(.6, () => E.subPequeno('lia', TXT.atrasadaVai)); }
          else { SX4.grito(ATR.g.position); E.sub('crianca', TXT.atrasadaAqui); PROC.pausa = Math.max(PROC.pausa, 2.5); PROC.olhos = 2.5; St.fear = Math.min(100, St.fear + 35); P.shake = Math.max(P.shake, .05); }
        }
      } else { ATR.g.position.set(alvo.x, Math.abs(Math.sin(A.t * 16)) * .06, alvo.z); ATR.g.rotation.y = PROC.g.rotation.y; ATR.br.rotation.x = lerp(ATR.br.rotation.x, 0, Math.min(1, dt * 5)); }
    }
  }

  // =====================================================================
  // 6. A ANA: contar junto, a brincadeira ao contrário, o dente de leite, os desenhos dela, o rancor
  // =====================================================================
  const JUNTO = { dito: -1, serie: 0 };
  function contarJunto(St) {
    if (!ANA.ativa || ANA.script || St.flags.ms_junto) return false;
    const n = ANA.conta; // quantos números ela já disse
    if (n < 1 || n > 9) return false;
    if (n === JUNTO.dito) return true; // esse número já foi
    if (JUNTO.dito >= 0 && n !== JUNTO.dito + 1) { JUNTO.serie = 0; E.subPequeno('ana', TXT.anaErrou); ANA.contaT = Math.min(ANA.contaT, .35); }
    JUNTO.dito = n; JUNTO.serie++;
    const palavra = TXT.contaFila[n - 1].replace('?', ''); numero(n); E.subPequeno('lia', palavra + '...'); SX4.sussurro(.6);
    E.emitNoise(P.pos.x, P.pos.z, 1.2, true); // contar em voz baixa ainda é barulho
    if (n === 9 && JUNTO.serie >= 5) { // a Lia diz o DEZ junto com ela: a brincadeira acaba sem susto
      St.flags.ms_junto = true; numero('10');
      depois(.5, () => { E.subPequeno('lia', 'dez.'); });
      depois(1.1, () => { if (!ANA.ativa) return; E.sub('ana', TXT.anaJunto); E.despawnAna(true); St.timers.ana = Math.max(St.timers.ana, 60); E.conquista('ms4_junto'); });
      ANA.contaT = 5;
    }
    return true;
  }
  function tickJunto() { if (!ANA.ativa) { JUNTO.dito = -1; JUNTO.serie = 0; } else if (ANA.conta < JUNTO.dito) { JUNTO.dito = -1; JUNTO.serie = 0; } }

  // a brincadeira ao contrário: de cara para a parede, luz apagada, parada
  const BR = { paredeT: 0, fase: null, t: 0, alvo: null, cands: [], risoT: 0, contaN: 0, mira: 0, miraL: null };
  const _rc = new THREE.Raycaster();
  function olhandoParede() { const f = new THREE.Vector3(); camera.getWorldDirection(f); _rc.set(camera.position, f); _rc.near = .05; _rc.far = .95; return _rc.intersectObjects(W.solid, false).length > 0; }
  function tickBrincadeira(dt, St) {
    if (!BR.fase) {
      if (St.chapter !== 3 || W.mapa !== 'superior' || St.flags.ms_brinc || St.hidden || St.flashOn || ameaca() || P.noiseR > 0 || P.bloqueado) { BR.paredeT = 0; return; }
      if (!olhandoParede()) { BR.paredeT = 0; return; }
      BR.paredeT += dt;
      if (BR.paredeT > 5) {
        const cands = W.lockers.filter(L => dist(L, P.pos) < 14 && dist(L, P.pos) > 2).sort((a, b) => dist(a, P.pos) - dist(b, P.pos)).slice(0, 3);
        if (cands.length < 2) { BR.paredeT = 0; St.flags.ms_brinc = true; return; }
        St.flags.ms_brinc = true; BR.cands = cands; BR.alvo = pick(cands); BR.fase = 'conta'; BR.t = 0; BR.contaN = 0;
        E.sub('ana', TXT.anaContaVoce); veu.style.opacity = .85; BR.bloq = P.bloqueado; P.bloqueado = true;
      }
      return;
    }
    BR.t += dt;
    if (BR.fase === 'conta') {
      if (BR.t > .9 + BR.contaN * .6 && BR.contaN < 10) { BR.contaN++; numero(BR.contaN, 'rgba(232,217,176,.9)'); E.subPequeno('lia', TXT.contaFila[BR.contaN - 1].replace('?', '') + '...'); if (BR.contaN === 4) SX4.risadinha({ x: P.pos.x + rand(-3, 3), z: P.pos.z + rand(-3, 3) }); }
      if (BR.t > 7.6) { BR.fase = 'busca'; BR.t = 0; BR.risoT = 1.5; veu.style.opacity = 0; P.bloqueado = BR.bloq || false; E.subPequeno('ana', TXT.anaPronta); }
      return;
    }
    if (BR.fase === 'busca') {
      if (St.dead) { BR.fase = null; return; }
      BR.risoT -= dt;
      if (BR.risoT <= 0) { BR.risoT = 4; SX4.risadinha(BR.alvo); legenda('risadinha', true, TXT.leg.risadinha + ' ' + lado(BR.alvo)); }
      // achar = pôr a luz no esconderijo certo, de perto
      const L = St.flashOn ? BR.cands.find(x => dist(x, P.pos) < 1.9 && olhando({ x: x.x, y: .9, z: x.z }, .88, 3)) : null;
      if (L && L === BR.miraL) BR.mira += dt; else { BR.mira = 0; BR.miraL = L; }
      if (L && BR.mira > .5) {
        BR.fase = null;
        if (L === BR.alvo) { E.SFX.risada(L.x, L.z); E.sub('ana', TXT.anaAchou); St.timers.ana = Math.max(St.timers.ana, 120); St.fear = Math.max(0, St.fear - 20); E.conquista('ms4_achei'); }
        else perdeuBrinc(St);
        return;
      }
      if (BR.t > 40) { BR.fase = null; E.SFX.risada(P.pos.x, P.pos.z); E.sub('ana', TXT.anaNinguem); St.timers.ana = Math.min(St.timers.ana, 8); }
    }
  }
  function perdeuBrinc(St) { E.SX.respiracaoNuca(); legenda('nuca'); E.sub('ana', TXT.anaPerdeu); St.health = Math.max(5, St.health - 12); St.fear = 100; P.shake = Math.max(P.shake, .06); }

  // o dente de leite: na enfermaria (térreo); no Capítulo III, entregue a ela quando estiver na sua frente
  let itAna = null;
  function montarDente(St) {
    if (W.mapa !== 'terreo' || St.flags.ms_dente) return;
    const sala = E.SALA('enferm'); if (!sala) return;
    const sp = (W.spots.enferm && (W.spots.enferm.mesa.length ? W.spots.enferm.mesa : W.spots.enferm.prateleira)) || [];
    const s = sp.length ? sp[sp.length - 1] : null; const p = s ? { x: s.x + .18, y: s.y, z: s.z - .12 } : (() => { const q = pontoLivre(sala, 1.2, .4); return q && { x: q.x, y: 0, z: q.z }; })();
    if (!p) return;
    const g = new THREE.Group(); g.position.set(p.x, p.y, p.z); W.grupo.add(g);
    E.box(.09, .025, .055, new THREE.MeshStandardMaterial({ color: 0x8a2a20, emissive: 0x2a0a06, emissiveIntensity: .8 }), 0, .0125, 0, g, false);
    E.box(.07, .006, .045, new THREE.MeshStandardMaterial({ color: 0xd8cfb8, emissive: 0x302820, emissiveIntensity: .6 }), 0, .028, 0, g, false);
    const it = E.interact(g, () => `<b>E</b>Pegar a caixa de fósforos`, seguro(() => { St.flags.ms_dente = 'comigo'; g.visible = false; E.toast(TXT.denteToast); depois(2, () => E.subPequeno('lia', TXT.denteLia)); }), { on: () => !St.flags.ms_dente });
    return it;
  }
  function montarItAna() {
    itAna = E.interact(ANA_G, () => `<b>E</b>Dar o dente de leite`, seguro(() => {
      const St = S(); St.flags.ms_dente = 'dado'; E.sub('ana', TXT.anaDente); St.timers.ana = Math.max(St.timers.ana, 90);
      depois(.8, () => E.despawnAna(true)); E.conquista('ms4_dente');
    }), { on: () => { const St = S(); return !!(St && St.flags.ms_dente === 'comigo' && ANA.ativa && !ANA.script && !St.hidden && dist(ANA.pos, P.pos) < 2.6); } });
  }

  // os desenhos da Ana: cada vez que ela te pega vira um desenho no Dormitório D, nas noites seguintes também
  function montarDesenhos() {
    if (W.mapa !== 'superior') return;
    const r = E.SALA('dormD'); if (!r) return;
    const lista = MEM.anaMortes.slice(-10);
    lista.forEach((n, i) => { const m = E.plano(.5, .5, matGiz(TX_DESENHO(n)), r.x1 - .03, .8 + (i % 2) * .62, r.z0 + 1.6 + (i >> 1) * .8, -Math.PI / 2); m.renderOrder = 2; });
    if (MEM.anaMortes.length >= 10) E.plano(2.4, 1.2, matGiz(TX_GIZ([TXT.desenhoFim])), r.x1 - .03, 2.25, (r.z0 + r.z1) / 2, -Math.PI / 2);
  }
  // o rancor: quanto tempo a luz ficou no rosto dela no Capítulo III vira um desenho na entrada dos túneis
  let luzAnaAcc = 0;
  function montarRancor(St) {
    if (W.mapa !== 'tuneis' || St.flags.ms_luzAna === undefined) return;
    const v = St.flags.ms_luzAna, tipo = v > 30 ? 'luz' : v < 5 ? 'maos' : null; if (!tipo) return;
    const r = E.SALA('entrada'); if (!r) return;
    E.plano(.7, .7, matGiz(TX_DESENHO(0, tipo)), r.x0 + .03, 1.25, (r.z0 + r.z1) / 2 - 1, Math.PI / 2);
    RANC = { x: r.x0 + .5, z: (r.z0 + r.z1) / 2 - 1, dito: false };
  }
  let RANC = null;
  function tickAnaExtras(dt, St) {
    if (St.chapter === 3 && ANA.ativa && ANA.vista && St.flashOn) luzAnaAcc += dt;
    if (St.chapter === 3) St.flags.ms_luzAna = Math.round(luzAnaAcc);
    if (RANC && !RANC.dito && dist(RANC, P.pos) < 3) { RANC.dito = true; E.subPequeno('lia', TXT.rancorLia); }
  }

  // =====================================================================
  // 7. O CHAMADO: a senha dos irmãos e a voz do Joaquim
  // =====================================================================
  function senha(St) {
    if (!E.chamado || !St.notes.n32 || flagCap(St, 'ms_senha')) return false;
    marcarCap(St, 'ms_senha'); const sala = E.chamado.sala, c = E.centroSala(sala);
    E.sub('lia', TXT.senhaPergunta);
    depois(1.3, () => { E.sub('voz', TXT.senhaErro); });
    depois(2.6, () => { SX4.grito(c); legenda('gritoVoz'); E.limparChamado(); if (M.ativo && M.state === 'investiga') E.patrulhar(); E.conquista('ms4_capitao'); });
    depois(4, () => E.subPequeno('lia', TXT.senhaLia));
    return true;
  }
  const CH = { ant: null, ignorados: 0, joaq: null };
  function tickChamado(dt, St) {
    const c = E.chamado;
    if (c && !CH.ant) { // um chamado novo: depois de três ignorados, a voz muda para a do velho do posto
      if (CH.ignorados >= 3 && !St.flags.ms_joaq) { St.flags.ms_joaq = true; CH.joaq = c; depois(1.8, () => { if (E.chamado === c) { legenda('joaquim'); E.sub('joaquim', TXT.joaquimVoz); } }); }
    }
    if (!c && CH.ant) {
      const ignorou = P.room !== CH.ant.sala && !CH.senha; CH.senha = false;
      if (CH.ant === CH.joaq) { CH.joaq = null; if (ignorou) { E.conquista('ms4_joaquim'); depois(1, () => E.subPequeno('lia', TXT.joaquimLia)); } else depois(2.5, () => E.subPequeno('lia', TXT.joaquimFoi)); }
      if (ignorou) CH.ignorados++;
    }
    CH.ant = c;
  }

  // =====================================================================
  // 8. O GATO BREU (térreo e andar de cima)
  // =====================================================================
  let GATO = null;
  function modeloGato() {
    const g = new THREE.Group(), pelo = new THREE.MeshStandardMaterial({ color: 0x0c0b0a, roughness: 1 });
    const corpo = new THREE.Mesh(new THREE.SphereGeometry(.12, 10, 8), pelo); corpo.scale.set(.8, .75, 1.6); corpo.position.y = .2; g.add(corpo);
    const cab = new THREE.Group(); cab.position.set(0, .3, .2); g.add(cab);
    cab.add(new THREE.Mesh(new THREE.SphereGeometry(.075, 10, 8), pelo));
    for (const s of [-1, 1]) { const o = new THREE.Mesh(new THREE.ConeGeometry(.03, .06, 4), pelo); o.position.set(s * .04, .07, 0); cab.add(o); }
    const olhoMat = new THREE.MeshBasicMaterial({ color: 0x1a2008 }); for (const s of [-1, 1]) { const o = new THREE.Mesh(new THREE.SphereGeometry(.012, 6, 6), olhoMat); o.position.set(s * .028, .012, .066); cab.add(o); }
    for (const [x, z] of [[-.06, .12], [.06, .12], [-.06, -.12], [.06, -.12]]) E.cyl(.016, .014, .16, pelo, x, .08, z, 5, g);
    const rabo = []; let pai = g; for (let i = 0; i < 3; i++) { const s = new THREE.Group(); s.position.set(0, i ? .1 : .22, i ? 0 : -.18); pai.add(s); E.cyl(.014, .012, .11, pelo, 0, .05, 0, 5, s); rabo.push(s); pai = s; }
    return { g, corpo, cab, olhoMat, rabo };
  }
  function montarGato(St) {
    GATO = null; if (W.mapa !== 'terreo' && W.mapa !== 'superior') return;
    const salas = W.salas.filter(r => !r.fora && !r.seguro && r !== P.room && E.distSalas(r, P.room) >= 1 && E.distSalas(r, P.room) <= 3);
    const sala = pick(salas); if (!sala) return;
    const p = pontoLivre(sala, 1, .5); if (!p) return;
    const mod = modeloGato(); mod.g.position.set(p.x, 0, p.z); mod.g.rotation.y = rand(0, 6.28); W.grupo.add(mod.g);
    GATO = { ...mod, pos: new THREE.Vector3(p.x, 0, p.z), miaT: rand(4, 10), chiaT: 0, gritoCd: 0, foi: false, seguindo: !!St.flags.ms_gato, anim: 0, arrepio: 0 };
    const it = E.interact(mod.g, () => `<b>E</b>Fazer carinho no gato`, seguro(() => carinho(St)), { on: () => !!GATO && !GATO.foi && !St.hidden }); it.hold = 1;
  }
  function carinho(St) {
    if (!GATO) return; SX4.ronrona(GATO.pos); legenda('ronrona'); St.fear = Math.max(0, St.fear - 20);
    if (!St.flags.ms_gato) { St.flags.ms_gato = true; E.toast(TXT.gatoPlaca); E.conquista('ms4_gato'); }
    GATO.seguindo = true;
  }
  function tickGato(dt, St) {
    const G = GATO; if (!G || G.foi || G.g.parent !== W.grupo) return;
    const d = dist(G.pos, P.pos); G.anim += dt; G.miaT -= dt; G.chiaT -= dt; G.gritoCd -= dt;
    // a Procissão: ele foge um segundo antes
    if (PROC.fase) { G.foi = true; SX4.miado(G.pos, .6); G.g.visible = false; return; }
    // segue de longe depois do carinho
    let andando = false;
    if (G.seguindo && d > 4 && d < 30 && !St.hidden) {
      const v = new THREE.Vector3(P.pos.x - G.pos.x, 0, P.pos.z - G.pos.z).normalize(), n = G.pos.clone().addScaledVector(v, Math.min(d - 2.5, 2.4 * dt));
      E.collide(n, .15); G.pos.copy(n); G.g.rotation.y = Math.atan2(v.x, v.z); andando = true;
    }
    G.g.position.set(G.pos.x, 0, G.pos.z);
    // o Inspetor perto: arrepia e chia
    const dm = M.ativo ? dist(M.pos, G.pos) : 99;
    G.arrepio = lerp(G.arrepio, dm < 10 ? 1 : 0, Math.min(1, dt * 5));
    G.corpo.scale.set(.8, .75 + G.arrepio * .35, 1.6 - G.arrepio * .2); G.corpo.position.y = .2 + G.arrepio * .07;
    if (dm < 10 && G.chiaT <= 0 && d < 16) { G.chiaT = 3.5; SX4.chiado(G.pos); legenda('chiado'); }
    // o rabo balança; em pé de guerra, fica reto
    G.rabo.forEach((s, i) => { s.rotation.x = G.arrepio > .5 ? -.2 : -.5 - i * .2; s.rotation.z = G.arrepio > .5 ? 0 : Math.sin(G.anim * 2 + i) * .35; });
    G.cab.rotation.y = andando ? 0 : Math.sin(G.anim * .7) * .5;
    // olhos que pegam a luz da lanterna
    const brilha = St.flashOn && d < 14 && E.visivel({ x: G.pos.x, z: G.pos.z }, .3, 14);
    G.olhoMat.color.setHex(brilha ? 0xd8ff70 : 0x1a2008);
    // mia baixinho; correndo perto dele, ele mia alto e entrega você
    if (G.miaT <= 0 && d < 14) { G.miaT = rand(12, 20); SX4.miado(G.pos, .5); legenda('miado', false); }
    if (P.sprinting && d < 3 && G.gritoCd <= 0) { G.gritoCd = 8; SX4.miado(G.pos, 1.6); legenda('miadoAlto'); E.emitNoise(G.pos.x, G.pos.z, 9); }
    // o Inspetor esbarra nele: se abaixa, faz carinho às cegas e esquece a procura por 10 s (uma vez por noite)
    if (dm < 1.6 && !St.flags.ms_gatoInsp && ['patrulha', 'investiga', 'procura'].includes(M.state)) {
      St.flags.ms_gatoInsp = true; ML().pausa('ms_gato', 10, 'patrulha', { x: G.pos.x, z: G.pos.z }); GATO_INSP = 10;
      falaM(TXT.gatoInspetor, d > 10); SX4.ronrona(G.pos);
    }
  }
  let GATO_INSP = 0;
  function poseGatoInsp(dt) { if (GATO_INSP <= 0) return; GATO_INSP -= dt; if (M.state !== 'reza') { GATO_INSP = 0; return; } MON.g.rotation.x = lerp(MON.g.rotation.x, .6, Math.min(1, dt * 5)); MON.armR.rotation.x = -.9 + Math.sin(agora * 3) * .2; }

  // =====================================================================
  // 9. A ROTINA DELE: arruma a cama desfeita, estranha as portas fechadas, conta os passos, guarda as garrafas
  // =====================================================================
  let hiddenAnt = null; const desfeitas = [];
  function tickCamas(dt, St) {
    if (St.hidden !== hiddenAnt) {
      if (hiddenAnt && hiddenAnt.tipo === 'cama' && !St.hidden && !hiddenAnt.msDesfeita) {
        const L = hiddenAnt; L.msDesfeita = true;
        const m = E.box(.7, .08, .5, new THREE.MeshStandardMaterial({ color: 0x8a8476, roughness: 1 }), L.x + rand(-.2, .2), .66, L.z + rand(-.2, .2)); m.rotation.y = rand(0, 3); m.rotation.z = .15;
        desfeitas.push({ L, m });
      }
      hiddenAnt = St.hidden;
    }
    if (!M.ativo || M.state !== 'patrulha') return;
    for (let i = desfeitas.length - 1; i >= 0; i--) {
      const { L, m } = desfeitas[i];
      if (m.parent !== W.grupo) { desfeitas.splice(i, 1); L.msDesfeita = false; continue; }
      if (St.hidden !== L && dist(L, M.pos) < 1.7) {
        desfeitas.splice(i, 1); ML().pausa('cama', 3, 'patrulha', L);
        depois(2.6, () => { L.msDesfeita = false; if (m.parent) m.parent.remove(m); if (dist(M.pos, P.pos) < 16) E.subPequeno('inspetor', TXT.camaFeita); });
        return;
      }
    }
  }
  const PORT = { ant: new Map(), n: 0, t: 0 };
  function tickPortas(dt, St) {
    PORT.t -= dt; if (PORT.t <= 0) PORT.n = 0;
    for (const d of W.doors) {
      const ant = PORT.ant.get(d); PORT.ant.set(d, d.open);
      if (ant === undefined || ant === d.open) continue;
      if (ant && !d.open && M.ativo && M.state !== 'caca' && dist(d, P.pos) < 2.5) d.msLia = true;
      else if (!ant && d.open && d.msLia && M.ativo && dist(d, M.pos) < 2.4) {
        d.msLia = false;
        if (M.state !== 'caca' && !flagCap(St, 'ms_portas')) { PORT.n++; PORT.t = 90; if (PORT.n >= 3) { marcarCap(St, 'ms_portas'); PORT.n = 0; ML().pausa('fala', 8); falaM(TXT.portasAbertas, dist(M.pos, P.pos) > 12); } }
      }
    }
  }
  const PAS = { mov: 0, lento: 0, dist: 0, ant: null, gerAnt: null };
  function tickPassos(dt, St) {
    if (St.chapter !== 1 || W.mapa !== 'terreo') { PAS.ant = null; PAS.gerAnt = null; return; }
    if (PAS.ant) { const dd = dist(PAS.ant, P.pos); if (dd > 0 && dd < 1) { PAS.dist += dd; PAS.mov += dt; if (P.devagar || P.crouch) PAS.lento += dt; } }
    PAS.ant = P.pos.clone();
    const ger = !!St.done.gerador;
    if (ger && PAS.gerAnt === false && !St.flags.ms_contou && PAS.mov > 20 && PAS.lento / PAS.mov > .6) {
      St.flags.ms_contou = true; const passos = Math.round(PAS.dist / .7);
      depois(4, () => { E.subPequeno('inspetor', '...' + extenso(passos) + '.'); if (M.ativo) try { E.SFX.voz(M.pos); } catch (e) {} });
      depois(7, () => { E.subPequeno('lia', TXT.passosLia); E.conquista('ms4_contou'); });
    }
    PAS.gerAnt = ger;
  }
  let garrafasAnt = null, GARR = null;
  function tickGarrafas(dt, St) {
    const g = St.inv.garrafas;
    if (garrafasAnt !== null && g < garrafasAnt && St.chapter <= 2) St.flags.ms_garrafas = (St.flags.ms_garrafas || 0) + (garrafasAnt - g);
    garrafasAnt = g;
    if (GARR && !GARR.dito && dist(GARR, P.pos) < 3.2) { GARR.dito = true; E.subPequeno('lia', GARR.n ? TXT.garrafasLia : TXT.garrafasQuieta); }
  }
  function montarGarrafas(St) {
    GARR = null; if (W.mapa !== 'tuneis' || St.chapter !== 4) return;
    const r = E.SALA('entrada'); if (!r) return;
    const n = Math.min(8, St.flags.ms_garrafas || 0), x = r.x1 - .35, z0 = r.z0 + 1;
    if (n) for (let i = 0; i < n; i++) {
      const b = E.MK.garrafa(); b.position.set(x, 0, z0 + i * .45); W.grupo.add(b);
      E.plano(.16, .04, new THREE.MeshBasicMaterial({ map: TX_ETIQ('BARULHO ' + (i + 1)) }), x - .046, .1, z0 + i * .45, -Math.PI / 2);
    } else E.plano(.5, .12, new THREE.MeshBasicMaterial({ map: TX_ETIQ('QUIETA. SUSPEITO.') }), r.x1 - .03, 1.1, z0 + 1.2, -Math.PI / 2);
    GARR = { x, z: z0 + 1, n, dito: false };
  }

  // =====================================================================
  // 10. O OUTRO CHAPÉU (raro, túnel norte) e A CHAMADA DOS NOMES (Capítulo II)
  // =====================================================================
  let CHAP = null;
  function montarChapeu(St) {
    CHAP = null; if (W.mapa !== 'tuneis' || !raras(St).chapeu || St.flags.ms_chapeu) return;
    const r = E.SALA('t4'); if (!r) return;
    const mod = E.modeloInspetor(); mod.g.traverse(o => { if (o.isMesh) { o.material = MAT.sombra; o.castShadow = false; } });
    E.cyl(.32, .32, .02, MAT.sombra, 0, 3.86, .06, 14, mod.g); E.cyl(.17, .19, .22, MAT.sombra, 0, 3.97, .06, 12, mod.g);
    mod.g.position.set((r.x0 + r.x1) / 2, 0, r.z0 + .8); mod.g.rotation.y = 0; W.grupo.add(mod.g);
    CHAP = { g: mod.g };
  }
  function tickChapeu(dt, St) {
    if (!CHAP || CHAP.g.parent !== W.grupo) return;
    const p = CHAP.g.position, d = dist(p, P.pos);
    if ((St.flashOn && E.visivel(p, 2.4, 24)) || d < 6) {
      CHAP.g.visible = false; W.grupo.remove(CHAP.g); CHAP = null; St.flags.ms_chapeu = true;
      E.SX.estalo(p, 1); St.fear = Math.min(100, St.fear + 15); legenda('dois estalos de língua', true, 'um estalo de língua, no fim do túnel');
      depois(1.2, () => E.subPequeno('lia', TXT.chapeuLia)); E.conquista('ms4_chapeu');
    }
  }
  const CHM = { fase: null, i: 0, t: 0, janela: 0 };
  function tickChamada(dt, St) {
    if (!CHM.fase) {
      if (St.chapter !== 2 || W.mapa !== 'terreo' || St.flags.ms_chamada || !M.ativo || ameaca() || M.state !== 'patrulha' || M.recuo > 0 || St.capT < 40 || CENA) return;
      const d = dist(M.pos, P.pos), ra = E.roomAt(M.pos.x, M.pos.z);
      if (!ra || !['cw', 'ce', 'hall'].includes(ra.id) || d < 6 || d > 18) return;
      St.flags.ms_chamada = true; CHM.fase = 'lendo'; CHM.i = 0; CHM.t = 1.2;
      ML().pausa('fala', 40, 'patrulha'); return;
    }
    if (M.state !== 'reza' || !M.ativo) { CHM.fase = null; return; }
    CHM.t -= dt;
    if (CHM.fase === 'lendo' && CHM.t <= 0) {
      if (CHM.i < TXT.chamadaNomes.length) { falaM(TXT.chamadaNomes[CHM.i++], true); CHM.t = 2.3; }
      else { falaM(TXT.chamadaLia, false); CHM.fase = 'espera'; CHM.t = 4.5; if (dist(M.pos, P.pos) < 26) E.toast(TXT.chamadaToast); }
    } else if (CHM.fase === 'espera' && CHM.t <= 0) { // ficou quieta: ele repete mais alto e vai procurar na ala
      CHM.fase = null; falaM(TXT.chamadaLiaAlto, false); E.SX.estalo(M.pos, 1.5, true);
      M.state = 'investiga'; M.acao = null; M.searchT = 0; M.ultimo = P.pos.clone(); E.planejar(M, P.pos.x, P.pos.z);
    }
  }
  function responderChamada(St) {
    if (CHM.fase !== 'espera') return false;
    CHM.fase = null; E.subPequeno('lia', TXT.chamadaPresente); SX4.sussurro(1);
    depois(1.4, () => { falaM(TXT.chamadaAtrasada, false); MON.cabeca.rotation.x = .4; });
    depois(3.5, () => { if (M.ativo && M.state === 'reza') { M.state = 'patrulha'; E.patrulhar(); } M.recuo = Math.max(M.recuo, 90); St.timers.chamado = Math.max(St.timers.chamado, 9999); E.conquista('ms4_presente'); });
    return true;
  }

  // =====================================================================
  // GANCHOS
  // =====================================================================
  // armário que o Tomé apontou: protegido uma vez (envolve o ML.protegido do lote 2)
  const protOrig = ML().protegido;
  ML().protegido = L => { if (protOrig(L)) return true; if (L && L.msSeguro) { L.msSeguro = false; depois(1.2, () => E.subPequeno('lia', TXT.tomeSeguro)); return true; } return false; };

  const tecla = e => {
    const St = S(); if (!St || St.dead) return false;
    try {
      if (e.code === 'KeyV') {
        if (E.chamado) { const ok = senha(St); if (ok) CH.senha = true; return ok; }
        return contarJunto(St) || responderChamada(St) || chamarPeloNome(St);
      }
      if (e.code === 'KeyG') return usarApito(St);
    } catch (err) { console.warn('[monstros-segredos]', err && err.message); }
    return false;
  };
  let sVisto = null;
  const novoMapa = seguro(id => {
    const St = S(); if (!St) return;
    CENA = null; BR.fase = null; veu.style.opacity = 0; meninoT = 0; GATO_INSP = 0; apitoFase = null; desfeitas.length = 0; PORT.ant = new Map(); velaMesh = null; RANC = null;
    montarItMon(); montarItAna(); montarDente(St); montarDesenhos(); montarRancor(St); montarGato(St); montarGarrafas(St); montarChapeu(St);
  });
  const tick = seguro(dt => {
    const St = S(); if (!St || St.dead) return;
    if (sVisto !== St) { sVisto = St; raras(St); garrafasAnt = null; CH.ant = E.chamado; luzAnaAcc = St.flags.ms_luzAna || 0; }
    agora += dt;
    for (let i = fila.length - 1; i >= 0; i--) if (fila[i].t <= agora) { const f = fila.splice(i, 1)[0]; try { f.fn(); } catch (e) { console.warn('[monstros-segredos]', e && e.message); } }
    if (legT > 0) { legT -= dt; if (legT <= 0) leg.style.opacity = 0; }
    if (numT > 0) { numT -= dt; if (numT <= 0) num.style.opacity = 0; }
    tickHoldMon(dt, St); tickApito(dt, St); poseMenino(dt); poseGatoInsp(dt);
    tickCenas(dt, St); tickSemEle(dt, St); tickProc(dt, St);
    tickJunto(); tickBrincadeira(dt, St); tickAnaExtras(dt, St);
    tickChamado(dt, St); tickGato(dt, St);
    tickCamas(dt, St); tickPortas(dt, St); tickPassos(dt, St); tickGarrafas(dt, St);
    tickChapeu(dt, St); tickChamada(dt, St);
  });
  // chamado pelo motor na tela de morte: registra a morte e dá a frase própria do pulso
  const fraseMorte = quem => {
    try {
      const St = S(); MEM.mortes++;
      if (quem === 'ana') { MEM.anaMortes.push(MEM.anaMortes.length + 1); if (MEM.anaMortes.length > 30) MEM.anaMortes.shift(); }
      lsGravar(MEM);
      if (BR.fase) { BR.fase = null; veu.style.opacity = 0; P.bloqueado = false; }
      if (St && St.flags.ms_pulso && quem === 'inspetor') { St.flags.ms_pulso = false; return TXT.morteOmbro; }
    } catch (e) {}
    return null;
  };
  if (typeof window !== 'undefined') window.__msegredos = { MEM, PR, BR, CH, CHM, get CENA() { return CENA; }, get GATO() { return GATO; }, iniciarCena: (t) => iniciarCena(t, S()), raras: () => raras(S()), ctxMon, extenso, LIAS, ATR };
  return { tick, novoMapa, tecla, fraseMorte };
}
