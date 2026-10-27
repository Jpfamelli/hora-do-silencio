// PROGRESSÃO — MUNDO E HISTÓRIA (Lote 2)
// Acervo com fios de mistério, lugares, linha do tempo, pessoas e o gravador da Lia; o internato que lembra
// das noites anteriores (textos, marcas de giz e a outra Lia onde você morreu); pegadas da melhor corrida;
// datas e nomes especiais; categorias de corrida; jornal do dia seguinte; epílogo no carro; a quarta criança.
// Ligado por src/progressao.js (PG); o texto mora em src/progressao-roteiro.js.
import * as THREE from 'three';
import './progressao-roteiro.js';
import { fmtNota } from './historia.js';

const MKEY = 'hora-silencio-mundo', NOME_KEY = 'hora-silencio-nome', ABA_KEY = 'hora-silencio-acervo-aba';
const $ = s => document.querySelector(s);
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const TX = () => window.ROTEIRO.progressao.mundo;
const R = () => window.ROTEIRO;
let C = null, A = null;
const mem = () => A.ls.get(MKEY, {}) || {};
const mudar = fn => { const m = mem(); fn(m); A.ls.set(MKEY, m); return m; };
const agora = () => window.__dataTeste ? new Date(window.__dataTeste) : new Date();
const hojeEm1994 = () => { const d = agora(); return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/1994`; };
const horaReal = () => { const d = agora(); return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`; };
const algumFinal = () => Object.keys(A.stats().finais || {}).length > 0;
const conqs = () => A.ls.get(C.KEYS.CONQ_KEY, {}) || {};
const temLore = id => { const S = C.S, ac = A.acervo(); return !!(ac[id] || (S && ((S.notes || {})[id] || (S.fitas || {})[id]))); };
const tituloLore = id => { const r = R(); const x = r.notas.find(n => n.id === id) || r.paginas.find(n => n.id === id) || r.fitas.find(n => n.id === id); return x ? x.titulo : id; };
const semCodigos = s => String(s).replace(/\{[a-z0-9]+\}/g, '…');
function textoLore(id) {
  const r = R(), n = r.notas.find(x => x.id === id) || r.paginas.find(x => x.id === id);
  if (n) return fmtNota(semCodigos(n.texto));
  const f = r.fitas.find(x => x.id === id);
  return f ? f.linhas.map(l => `<b>${esc((r.personagens[l.quem] || {}).nome || '')}</b>: ${esc(semCodigos(l.texto))}`).join('<br>') : '';
}

// ---------------------------------------------------------------- datas e nomes
export function dataEspecial() {
  const d = agora(), dd = d.getDate(), mm = d.getMonth() + 1;
  if (dd === 14 && mm === 3) return 'fogo';
  if (dd === 15 && mm === 3) return 'aniversario';
  if (dd === 2 && mm === 11) return 'finados';
  if (dd === 13 && d.getDay() === 5) return 'treze';
  if (d.getHours() === 3) return 'madrugada';
  return null;
}
const CONQ_DATA = { fogo: 'aniversario_fogo', aniversario: 'parabens_lia', finados: 'finados', treze: 'treze', madrugada: 'madrugada' };
function nomeEspecial() {
  let n = ''; try { n = JSON.parse(localStorage.getItem(NOME_KEY) || '""'); } catch (e) {}
  n = String(n || '').trim().toUpperCase(); if (n === 'TOME') n = 'TOMÉ';
  return TX().nomes[n] ? n : null;
}

// ---------------------------------------------------------------- textos que lembram (idempotente)
const base = {}, ultimo = {};
function setTxt(obj, campo, id, sufixo) {
  if (!obj) return;
  const cur = obj[campo]; if (!(id in base) || cur !== ultimo[id]) base[id] = cur;
  obj[campo] = ultimo[id] = base[id] + (sufixo || '');
}
function setLugar(k, texto) {
  const L = R().lugares || (R().lugares = {}), id = 'lugar:' + k, cur = L[k];
  if (!(id in base) || cur !== ultimo[id]) base[id] = cur;
  L[k] = ultimo[id] = texto ? [{ quem: 'lia', texto }] : base[id];
  if (!L[k]) delete L[k];
}
function aplicarTextos(S) {
  const r = R(), T = TX(), st = A.stats(), cq = conqs(), lembra = algumFinal(), verdadeiro = !!cq.final_verdadeiro, data = dataEspecial();
  const nota = id => r.notas.find(n => n.id === id), pag = id => r.paginas.find(n => n.id === id);
  const noite = st.partidas || 1;
  setTxt(nota('n2'), 'texto', 'n2', (lembra ? T.segunda.n2.replace('{hoje}', hojeEm1994()) : '') + (data === 'fogo' ? T.datas.fogo.ocorrencia.replace('{hoje}', hojeEm1994()) : ''));
  setTxt(nota('n3'), 'texto', 'n3', lembra ? T.segunda.n3 : '');
  setTxt(nota('n4'), 'texto', 'n4', A.acervo().f3 ? T.segunda.n4 : '');
  setTxt(nota('n7'), 'texto', 'n7', lembra && (st.mortes || 0) > 0 ? T.segunda.n7.replace('{n}', st.mortes) : '');
  setTxt(nota('n8'), 'texto', 'n8', verdadeiro ? T.segunda.n8 : '');
  setTxt(nota('n13'), 'texto', 'n13', data === 'aniversario' ? T.datas.aniversario.desenho : '');
  for (const id of ['p1', 'p2', 'p3', 'p4']) setTxt(pag(id), 'texto', id, verdadeiro ? T.segunda.paginas[id] : '');
  const porK = {};
  for (const l of T.lugaresNoite) if (lembra && noite >= l.noite) porK[l.k] = l.texto;
  for (const l of T.lugaresNoite) setLugar(l.k, porK[l.k] || null);
}

// ---------------------------------------------------------------- estado por partida
let Sref = null, falou = false, trilha = [], trilhaT = 0, trilhaCap = -1, lugT = 0, grupo = null, capMarcas = -1, marcas = [], ditos = {}, salaAnt = null;
let fant = null, fantT = 20, pegadas = null, pegT = 0, pegadasCap = -1, viuPegadas = false, loreCap = [], loreCapN = -1, cronoT = 0, cronoTxt = '';
function novoS(S) {
  Sref = S; falou = false; trilha = []; trilhaT = 0; trilhaCap = S.chapter; grupo = null; ditos = {}; salaAnt = null; fantT = 25; viuPegadas = false; loreCap = []; loreCapN = S.chapter;
  aplicarTextos(S);
}

// ---------------------------------------------------------------- texturas
function texGiz(h) {
  const cv = document.createElement('canvas'); cv.width = cv.height = 256; const g = cv.getContext('2d');
  g.strokeStyle = 'rgba(232,228,214,.9)'; g.lineWidth = 9; g.lineCap = 'round';
  const risco = (x0, y0, x1, y1) => { g.beginPath(); g.moveTo(x0, y0); for (let i = 1; i <= 8; i++) { const t = i / 8; g.lineTo(x0 + (x1 - x0) * t + (Math.random() - .5) * 6, y0 + (y1 - y0) * t + (Math.random() - .5) * 6); } g.stroke(); };
  risco(46, 30, 210, 170); risco(210, 34, 50, 176);
  g.fillStyle = 'rgba(232,228,214,.85)'; g.font = 'bold 44px monospace'; g.textAlign = 'center'; g.fillText('LIA', 128, 222); g.font = '28px monospace'; g.fillText(h || '', 128, 250);
  const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.userData.clone = true; return t;
}
function texFantasma() {
  const cv = document.createElement('canvas'); cv.width = 128; cv.height = 192; const g = cv.getContext('2d');
  g.shadowColor = 'rgba(200,215,230,.9)'; g.shadowBlur = 18; g.fillStyle = 'rgba(190,205,220,.75)';
  g.beginPath(); g.ellipse(64, 132, 34, 44, 0, 0, Math.PI * 2); g.fill(); // corpo encolhido
  g.beginPath(); g.arc(60, 76, 17, 0, Math.PI * 2); g.fill(); // cabeça baixa
  g.beginPath(); g.ellipse(64, 176, 40, 10, 0, 0, Math.PI * 2); g.fill(); // pés no chão
  g.shadowBlur = 0; g.fillStyle = 'rgba(10,12,16,.85)'; // cabelo molhado caindo no rosto
  for (let i = 0; i < 9; i++) { g.fillRect(46 + i * 3.4, 64, 2.2, 30 + Math.random() * 22); }
  const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.userData.clone = true; return t;
}

// ---------------------------------------------------------------- marcas de outras noites, a outra Lia, pegadas
function montarMundo(S) {
  marcas = []; fant = null; pegadas = null;
  const W = C.W; if (!W.grupo) return;
  const lista = (mem().mortes || {})[W.mapa] || [];
  if (S.flags._noite >= 2 || A.stats().partidas >= 2) {
    for (const m of lista) {
      if (m.noite && m.noite === S.flags._noite) continue; // marcas só de outras noites
      const mat = new THREE.MeshStandardMaterial({ map: texGiz(m.h), transparent: true, opacity: .7, depthWrite: false, roughness: 1, polygonOffset: true, polygonOffsetFactor: -2 });
      const p = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 1.1), mat);
      p.rotation.x = -Math.PI / 2; p.rotation.z = (m.x * 7 + m.z * 3) % 6.28; p.position.set(m.x, .025, m.z); p.renderOrder = 2;
      W.grupo.add(p); marcas.push({ ...m, mesh: p });
    }
    if (marcas.length) {
      const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: texFantasma(), transparent: true, opacity: 0, depthWrite: false }));
      sp.scale.set(.95, 1.4, 1); sp.visible = false; W.grupo.add(sp); fant = { sp, t: 0, on: false };
    }
  }
  montarPegadas(S);
}
function montarPegadas(S) {
  pegadasCap = S.chapter; if (pegadas) { C.W.grupo.remove(pegadas.mesh); pegadas = null; }
  const c = R().capitulos[S.chapter], tr = c && (mem().rastro || {})[c.id];
  if (!tr || tr.mapa !== C.W.mapa || !(C.OPT.crono || C.OPT.cron)) return;
  const pts = tr.pts || [], lista = []; let ux = 1e9, uz = 1e9, lado = 1;
  for (let i = 0; i + 1 < pts.length; i += 2) {
    const x = pts[i] / 10, z = pts[i + 1] / 10; if (Math.hypot(x - ux, z - uz) < .7) continue;
    const yaw = ux > 1e8 ? 0 : Math.atan2(x - ux, z - uz); ux = x; uz = z; lado = -lado;
    lista.push({ x: x + Math.cos(yaw) * .13 * lado, z: z - Math.sin(yaw) * .13 * lado, yaw });
    if (lista.length >= 600) break;
  }
  if (!lista.length) return;
  const geo = new THREE.PlaneGeometry(.13, .3); geo.rotateX(-Math.PI / 2);
  const mat = new THREE.MeshStandardMaterial({ color: 0x0a0c0f, roughness: .15, metalness: .4, transparent: true, opacity: .55, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 });
  const mesh = new THREE.InstancedMesh(geo, mat, lista.length), d = new THREE.Object3D();
  lista.forEach((p, i) => { d.position.set(p.x, .022, p.z); d.rotation.set(0, p.yaw, 0); d.scale.set(1, 1, 1); d.updateMatrix(); mesh.setMatrixAt(i, d.matrix); });
  mesh.instanceMatrix.needsUpdate = true; C.W.grupo.add(mesh); pegadas = { mesh, lista, vivo: lista.map(() => true), d };
}
function tickMundo(dt, S) {
  const P = C.P, M = C.M, W = C.W;
  if (W.grupo !== grupo || capMarcas !== S.chapter) { const mudouMapa = W.grupo !== grupo; grupo = W.grupo; capMarcas = S.chapter; if (mudouMapa) montarMundo(S); else montarPegadas(S); }
  // marca de giz: ver de perto
  for (const m of marcas) {
    if (ditos['m' + m.t]) continue;
    if (Math.hypot(P.pos.x - m.x, P.pos.z - m.z) < 1.8) { ditos['m' + m.t] = true; A.conquista('marcada'); C.sub('lia', TX().marcaVista.replace('{h}', m.h || '')); }
  }
  // a sala onde você mais morreu
  if (P.room && P.room !== salaAnt) {
    salaAnt = P.room;
    const k = W.mapa + ':' + P.room.id, n = marcas.filter(m => m.sala === P.room.id).length;
    if (n >= 3 && !ditos['s' + k] && !(M.ativo && M.state === 'caca')) { ditos['s' + k] = true; setTimeout(() => { if (C.S === S && !S.dead) C.sub('lia', TX().jaMorri); }, 1200); }
  }
  // a outra Lia
  if (fant) {
    fantT -= dt;
    const perigo = (M.ativo && M.state === 'caca') || C.PROC.fase || S.hidden;
    if (!fant.on && fantT <= 0 && !perigo) {
      const fx = -Math.sin(P.yaw), fz = -Math.cos(P.yaw);
      const alvo = marcas.find(m => { const dx = m.x - P.pos.x, dz = m.z - P.pos.z, d = Math.hypot(dx, dz); return d > 5 && d < 13 && (dx * fx + dz * fz) / d > .82; });
      if (alvo) { fant.on = true; fant.t = 0; fant.sp.position.set(alvo.x, .62, alvo.z); fant.sp.visible = true; fantT = 60; A.conquista('outra_lia'); try { C.SFX.rangido(alvo.x, 1, alvo.z, .5); } catch (e) {} }
    }
    if (fant.on) {
      fant.t += dt;
      const dx = fant.sp.position.x - P.pos.x, dz = fant.sp.position.z - P.pos.z, d = Math.hypot(dx, dz);
      const iluminada = S.flashOn && d < 14 && (dx * -Math.sin(P.yaw) + dz * -Math.cos(P.yaw)) / Math.max(d, .01) > .93;
      if (iluminada && fant.t < 1.1) { fant.t = 1.1; try { C.SFX.sussurros(.7); } catch (e) {} }
      const op = fant.t < .3 ? fant.t / .3 * .42 : fant.t < 1.1 ? .42 : Math.max(0, .42 - (fant.t - 1.1) * 1.4);
      fant.sp.material.opacity = op;
      if (fant.t > 1.5 || d < 3) { fant.on = false; fant.sp.visible = false; }
    }
  }
  // pegadas da melhor corrida: se apagam quando você passa
  if (pegadas && (pegT -= dt) <= 0) {
    pegT = .25; let mud = false; viuPegadas = true;
    pegadas.lista.forEach((p, i) => {
      if (pegadas.vivo[i] && Math.hypot(P.pos.x - p.x, P.pos.z - p.z) < 1.3) { pegadas.vivo[i] = false; pegadas.d.position.set(0, -50, 0); pegadas.d.scale.set(0, 0, 0); pegadas.d.updateMatrix(); pegadas.mesh.setMatrixAt(i, pegadas.d.matrix); mud = true; }
    });
    if (mud) pegadas.mesh.instanceMatrix.needsUpdate = true;
  }
}

// ---------------------------------------------------------------- fios, pessoas, conquistas de lore
function fiosStatus() { return TX().fios.map(f => ({ ...f, achou: f.pecas.filter(id => temLore(id)).length })); }
function pessoasStatus() { return TX().pessoas.map(p => { const achou = p.pecas.filter(id => temLore(id)).length; return { ...p, achou, pct: Math.round(achou / p.pecas.length * 100) }; }); }
function checarFios(falar) {
  const m = mem(), novos = [];
  for (const f of fiosStatus()) if (f.achou === f.pecas.length && !(m.fios || {})[f.id]) novos.push(f);
  if (novos.length) mudar(mm => { mm.fios = mm.fios || {}; for (const f of novos) mm.fios[f.id] = true; });
  for (const f of novos) {
    A.conquista(f.conq);
    if (falar) { C.toast(TX().fioCompleto.replace('{nome}', f.nome)); const S = C.S; setTimeout(() => { if (C.S === S && S && !S.dead) C.sub('lia', f.fecho); }, 2600); }
  }
  if (fiosStatus().every(f => f.achou === f.pecas.length)) A.conquista('historiadora');
  if (pessoasStatus().every(p => p.pct === 100)) A.conquista('ninguem_esquecido');
}

// ---------------------------------------------------------------- jornal do dia seguinte (canvas)
function jornal(tipo) {
  const T = TX().jornal, S = C.S, nome = (() => { try { return String(JSON.parse(localStorage.getItem(NOME_KEY) || '""') || '').trim(); } catch (e) { return ''; } })();
  const cv = document.createElement('canvas'); cv.width = 900; cv.height = 1240; const g = cv.getContext('2d');
  g.fillStyle = '#e6dcc3'; g.fillRect(0, 0, 900, 1240);
  for (let i = 0; i < 2600; i++) { g.fillStyle = `rgba(80,60,30,${Math.random() * .08})`; g.fillRect(Math.random() * 900, Math.random() * 1240, 2, 2); }
  const manchas = (n) => { for (let i = 0; i < n; i++) { const x = Math.random() * 900, y = Math.random() * 1240, r = 20 + Math.random() * 70, gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, 'rgba(120,90,40,.12)'); gr.addColorStop(1, 'rgba(120,90,40,0)'); g.fillStyle = gr; g.fillRect(x - r, y - r, r * 2, r * 2); } };
  manchas(7);
  g.fillStyle = '#1b1712'; g.textAlign = 'center';
  g.font = 'bold 82px Georgia, serif'; g.fillText(T.nome, 450, 110);
  g.font = 'italic 20px Georgia, serif'; g.fillText(T.lema, 450, 142);
  const d = agora(), data = d.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' }) + ' de 1994';
  g.fillRect(40, 158, 820, 3); g.fillRect(40, 196, 820, 1.5);
  g.font = '18px Georgia, serif'; g.fillText(data.charAt(0).toUpperCase() + data.slice(1) + ' · Ano XLIII · Nº ' + (1000 + (A.stats().partidas || 1) * 37), 450, 184);
  const chave = T.manchetes[tipo] ? tipo : 'morte', [man, linha] = T.manchetes[chave];
  const quebrar = (txt, x, y, larg, alt) => { const pal = String(txt).split(' '); let l = '', yy = y; for (const p of pal) { const t = l ? l + ' ' + p : p; if (g.measureText(t).width > larg && l) { g.fillText(l, x, yy); l = p; yy += alt; } else l = t; } if (l) g.fillText(l, x, yy); return yy + alt; };
  g.font = 'bold 64px Georgia, serif'; let y = quebrar(man, 450, 280, 800, 70);
  g.font = 'italic 26px Georgia, serif'; y = quebrar(linha, 450, y + 6, 760, 34);
  // foto: o internato contra o céu
  const fy = y + 10; g.fillStyle = '#2a2620'; g.fillRect(90, fy, 720, 360);
  const ceu = g.createLinearGradient(0, fy, 0, fy + 360); ceu.addColorStop(0, '#5d5a52'); ceu.addColorStop(1, '#25221d'); g.fillStyle = ceu; g.fillRect(96, fy + 6, 708, 348);
  g.fillStyle = '#0f0d0b'; g.fillRect(180, fy + 170, 540, 184); g.fillRect(600, fy + 70, 60, 120); // prédio e torre do sino
  g.beginPath(); g.moveTo(590, fy + 72); g.lineTo(630, fy + 30); g.lineTo(670, fy + 72); g.fill();
  g.fillStyle = 'rgba(210,190,140,.55)'; for (let i = 0; i < 9; i++) g.fillRect(205 + i * 56, fy + 210, 18, 26);
  g.fillStyle = 'rgba(0,0,0,.25)'; for (let i = 0; i < 900; i++) g.fillRect(96 + Math.random() * 708, fy + 6 + Math.random() * 348, 1.5, 1.5);
  g.fillStyle = '#1b1712'; g.font = 'italic 17px Georgia, serif'; g.fillText(T.foto, 450, fy + 384);
  // texto em duas colunas
  const corpo = [nome ? T.quem.replace('{nome}', nome.charAt(0).toUpperCase() + nome.slice(1).toLowerCase()) : T.anonima, (S && S.mortes ? (S.mortes === 1 ? T.mortes[1] : T.mortes.n.replace('{n}', S.mortes)) : T.mortes[0]),
    S && S.tempo ? `A polícia estima que ela passou ${Math.max(1, Math.round(S.tempo / 60))} minuto${Math.round(S.tempo / 60) > 1 ? "s" : ""} dentro do São Lázaro.` : '', tipo === 'verdadeiro' && S && S.flags.moacirNome ? 'Ela repetia um nome que ninguém na serra ouvia havia décadas: Moacir.' : ''].filter(Boolean).join(' ');
  g.textAlign = 'left'; g.font = '21px Georgia, serif';
  const pal = corpo.split(' '); let col = 0, l = '', yy = fy + 430; const X = [70, 470], LG = 360;
  for (const p of pal) { const t = l ? l + ' ' + p : p; if (g.measureText(t).width > LG && l) { g.fillText(l, X[col], yy); l = p; yy += 28; if (yy > 1120 && col === 0) { col = 1; yy = fy + 430; } } else l = t; }
  if (l) g.fillText(l, X[col], yy);
  g.fillRect(450, fy + 410, 1, 1120 - fy - 410 + 10);
  g.fillRect(40, 1150, 820, 1.5); g.font = '16px Georgia, serif'; g.textAlign = 'center';
  T.rodape.forEach((r, i) => g.fillText(r, 450, 1178 + i * 24));
  return cv;
}
function abrirJornal(tipo) {
  const ov = document.createElement('div'); ov.id = 'pgm-jornal'; ov.className = 'pgm-ov';
  const cv = jornal(tipo); cv.className = 'pgm-jornal-cv';
  ov.appendChild(cv);
  const b = document.createElement('div'); b.className = 'pgm-bts';
  b.innerHTML = '<button class="btn" data-a="salvar">Salvar imagem</button><button class="btn" data-a="fechar">Fechar</button>';
  ov.appendChild(b); document.body.appendChild(ov);
  try { C.SFX.papel(); } catch (e) {}
  A.conquista('primeira_pagina');
  b.querySelector('[data-a=salvar]').onclick = () => { try { const a = document.createElement('a'); a.download = 'o-eco-da-serra-1994.png'; a.href = cv.toDataURL('image/png'); document.body.appendChild(a); a.click(); a.remove(); } catch (e) { console.warn(e); } };
  b.querySelector('[data-a=fechar]').onclick = () => ov.remove();
}

// ---------------------------------------------------------------- epílogo no carro
function epilogo() {
  if ($('#pgm-epilogo')) return;
  const T = TX(), ov = document.createElement('div'); ov.id = 'pgm-epilogo'; ov.className = 'pgm-ov pgm-epi';
  ov.innerHTML = T.epilogo.map((l, i) => `<p style="animation-delay:${i * 2.3}s">${fmtNota(l)}</p>`).join('') +
    `<button class="btn pgm-fita" style="animation-delay:${T.epilogo.length * 2.3}s">▶ Ouvir a fita sem etiqueta</button><p class="pgm-obrigado" hidden></p><button class="btn pgm-fechar">Fechar</button>`;
  document.body.appendChild(ov);
  ov.querySelector('.pgm-fita').onclick = e => {
    e.target.disabled = true; try { C.SFX.fitaClique(); C.SFX.estatica(.8); } catch (er) {}
    setTimeout(() => { const o = ov.querySelector('.pgm-obrigado'); o.innerHTML = fmtNota(T.epilogoFita); o.hidden = false; try { C.SFX.sussurros(.6); } catch (er) {} A.conquista('obrigado'); }, 1400);
  };
  ov.querySelector('.pgm-fechar').onclick = () => ov.remove();
}

// ---------------------------------------------------------------- painel Acervo
const ABAS = [['fios', 'Fios'], ['lugares', 'Lugares'], ['linha', 'Linha do tempo'], ['pessoas', 'Pessoas'], ['gravador', 'Gravador da Lia']];
function retrato(p) {
  const cv = document.createElement('canvas'); cv.width = 54; cv.height = 66; const g = cv.getContext('2d');
  g.fillStyle = '#14110d'; g.fillRect(0, 0, 54, 66);
  g.globalAlpha = .25 + p.pct / 100 * .75; g.fillStyle = p.cor;
  const crianca = ['davi', 'ana', 'tome'].includes(p.id), cab = crianca ? 11 : 12, cy = crianca ? 28 : 24;
  g.beginPath(); g.arc(27, cy, cab, 0, Math.PI * 2); g.fill();
  g.beginPath(); g.ellipse(27, 66, crianca ? 17 : 22, crianca ? 20 : 26, 0, Math.PI, 0); g.fill();
  g.fillStyle = '#14110d';
  if (p.id === 'moacir') g.fillRect(14, cy - 3, 26, 6); // a venda
  if (p.id === 'celeste') { g.beginPath(); g.moveTo(12, cy + 14); g.quadraticCurveTo(27, cy - 26, 42, cy + 14); g.lineTo(39, cy + 14); g.quadraticCurveTo(27, cy - 14, 15, cy + 14); g.fill(); }
  if (p.id === 'ana') { g.fillRect(14, cy - 6, 4, 22); g.fillRect(36, cy - 6, 4, 22); }
  if (p.id === 'albano') { g.fillRect(19, cy - 1, 6, 3); g.fillRect(29, cy - 1, 6, 3); g.fillRect(24, cy, 6, 1); }
  if (p.id === 'joaquim') g.fillRect(13, cy - 10, 28, 4);
  if (p.pct < 100) { g.globalAlpha = 1; g.fillStyle = 'rgba(20,17,13,.6)'; g.fillRect(0, 66 * p.pct / 100, 54, 66); }
  return cv.toDataURL();
}
function abaHTML(aba) {
  const T = TX(), ac = A.acervo(), fim = algumFinal();
  if (aba === 'fios') {
    const fs = fiosStatus(), ok = fs.filter(f => f.achou === f.pecas.length).length;
    return `<p class="pn-resumo">fios completos ${ok}/${fs.length} · cada fio tem poucas peças, todas no caminho ou a um passo dele</p>` + fs.map(f => {
      const completo = f.achou === f.pecas.length;
      const pecas = f.pecas.filter(id => ac[id]).map(id => `<details class="pgm-peca"><summary>✦ ${esc(tituloLore(id))}</summary><div class="pgm-txt">${textoLore(id)}</div></details>`).join('');
      return `<div class="it ${completo ? '' : 'x'}"><div style="flex:1"><b>${esc(f.nome)}</b> <small>— ${f.achou} de ${f.pecas.length}</small>${completo ? `<br><i class="frase">“${esc(f.fecho)}”</i>` : ''}${pecas}${'<small class="pgm-falta">◇ </small>'.repeat(f.pecas.length - f.achou)}</div><span class="rank">${completo ? '✦' : ''}</span></div>`;
    }).join('');
  }
  if (aba === 'lugares') {
    const notados = (mem().lugares || []).length, totalLug = Object.keys(R().lugares || {}).length;
    return `<p class="pn-resumo">o acervo conta, mas não diz onde · lugares em que a Lia reparou ${notados}/${totalLug}${fim ? '' : '<br>termine uma noite para ouvir as dicas do que falta'}</p>` + Object.entries(T.lugaresPecas).map(([mapa, ids]) => {
      const tem = ids.filter(id => ac[id]).length, faltam = ids.filter(id => !ac[id]);
      return `<div class="it ${faltam.length ? 'x' : ''}"><div><b>${esc(T.lugaresNomes[mapa] || mapa)} ${tem}/${ids.length}</b>${fim && faltam.length ? '<br>' + faltam.map(id => `<small>◇ ${esc(T.dicas[id] || '...')}</small>`).join('<br>') : ''}</div><span class="rank">${faltam.length ? '' : '✦'}</span></div>`;
    }).join('');
  }
  if (aba === 'linha') {
    const acesas = T.linha.filter(l => !l.peca || ac[l.peca]).length;
    return `<p class="pn-resumo">datas acesas ${acesas}/${T.linha.length} · as lacunas são o que ainda falta descobrir</p><div class="pgm-linha">` + T.linha.map(l => (!l.peca || ac[l.peca])
      ? `<div class="pgm-ano on"><b>${l.ano}</b><span>${esc(l.txt)}</span></div>` : `<div class="pgm-ano"><b>— ? —</b><span>????</span></div>`).join('') + '</div>';
  }
  if (aba === 'pessoas') {
    const ps = pessoasStatus();
    return `<p class="pn-resumo">o que a Lia entendeu de cada um · lembrados por inteiro ${ps.filter(p => p.pct === 100).length}/${ps.length}</p>` + ps.map(p => {
      const est = p.achou === 0 ? 0 : p.achou < p.pecas.length ? 1 : 2;
      return `<div class="it pgm-pessoa"><img alt="" src="${retrato(p)}"><div style="flex:1"><b style="color:${p.cor}">${esc(p.nome)}</b> <small>${p.pct}%</small><br><small>${esc(p.textos[est])}</small>${p.pct === 100 ? `<br><i class="frase">${esc(p.ultima)}</i>` : ''}</div></div>`;
    }).join('');
  }
  // gravador
  const rec = mem().recados || {}, caps = A.ls.get(C.KEYS.CAPS_KEY, {}), voz = !!(caps.c4 && caps.c4.rank);
  const lista = R().capitulos.filter(c => rec[c.id]);
  if (!lista.length) return '<p class="pn-resumo">o gravador ainda está vazio · a Lia grava um recado no fim de cada capítulo</p>';
  return `<p class="pn-resumo">recados que a Lia gravou no fim de cada capítulo</p>` + lista.map(c => `<div class="it"><div style="flex:1"><b>${esc(c.titulo)}</b><br><small class="pgm-rec" data-rec="${c.id}">${esc(rec[c.id])}</small><small class="pgm-voz" hidden><br>${fmtNota(T.vozAMais)}</small></div><button class="btn" data-ouvir="${c.id}" data-voz="${voz ? 1 : 0}">▶ Ouvir</button></div>`).join('');
}
function painelAcervo(aba) {
  aba = aba || (() => { try { return localStorage.getItem(ABA_KEY) || 'fios'; } catch (e) { return 'fios'; } })();
  if (!ABAS.some(a => a[0] === aba)) aba = 'fios';
  try { localStorage.setItem(ABA_KEY, aba); } catch (e) {}
  const total = R().notas.length + R().paginas.length + R().fitas.length;
  A.abrirPainel(`Acervo ${Object.keys(A.acervo()).length}/${total}`, `<div class="pgm-abas">${ABAS.map(([k, n]) => `<button class="btn ${k === aba ? 'on' : ''}" data-aba="${k}">${n}</button>`).join('')}</div>` + abaHTML(aba));
  const L = $('#pn-lista');
  L.querySelectorAll('[data-aba]').forEach(b => b.onclick = () => painelAcervo(b.dataset.aba));
  L.querySelectorAll('[data-ouvir]').forEach(b => b.onclick = () => {
    try { C.iniciarAudio(); C.SFX.fitaClique(); C.SFX.estatica(.5); } catch (e) {}
    const it = b.closest('.it'); it.querySelector('.pgm-rec').classList.add('tocando');
    if (b.dataset.voz === '1') setTimeout(() => { it.querySelector('.pgm-voz').hidden = false; try { C.SFX.sussurros(.5); } catch (e) {} A.conquista('voz_a_mais'); }, 2200);
  });
}

// ---------------------------------------------------------------- título
function prepararTitulo() {
  if (!$('#pgm-css')) {
    const st = document.createElement('style'); st.id = 'pgm-css';
    st.textContent = `[hidden]{display:none!important}
.pgm-abas{display:flex;flex-wrap:wrap;gap:6px;justify-content:center;margin-bottom:12px}.pgm-abas .btn{font-size:14px;padding:4px 10px}.pgm-abas .btn.on{color:#c9a75a;border-color:#7a6236}
.pgm-peca{margin-top:6px}.pgm-peca summary{cursor:pointer;font-family:"Special Elite";font-size:13px;color:#bdb29a}.pgm-txt{white-space:pre-wrap;font-size:14px;color:#cfc3a6;padding:6px 0 4px 14px;line-height:1.45}
.pgm-falta{color:#5d5546;letter-spacing:.2em}
.pgm-linha{border-left:1px solid #3a3228;margin-left:8px;padding-left:16px}.pgm-ano{padding:6px 0;color:#5d5546;font-size:15px}.pgm-ano b{display:inline-block;min-width:74px;font-family:"IM Fell English SC";letter-spacing:.06em}.pgm-ano.on{color:#cfc3a6}.pgm-ano.on b{color:#c9a75a}
.pgm-pessoa img{width:54px;height:66px;margin-right:12px;border:1px solid #3a3228;flex:none}
.pgm-rec.tocando{color:#e9dfc8}
.pgm-ov{position:fixed;inset:0;z-index:30;background:rgba(0,0,0,.92);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;padding:16px;overflow:auto}
.pgm-jornal-cv{max-width:min(92vw,620px);max-height:82vh;height:auto;width:auto;box-shadow:0 0 40px #000;transform:rotate(-1.2deg)}
.pgm-bts{display:flex;gap:10px;flex-wrap:wrap;justify-content:center}
.pgm-epi{background:#000;font-family:"IM Fell English",serif;font-size:22px;color:#cfc3a6;text-align:center}
.pgm-epi p{max-width:640px;margin:0;opacity:0;animation:pgmsurge 1.6s ease forwards}.pgm-epi .pgm-fita{opacity:0;animation:pgmsurge 1.2s ease forwards}
.pgm-epi .pgm-obrigado{opacity:1;animation:none;color:#9fc3d8;font-size:24px}
@keyframes pgmsurge{to{opacity:1}}
#title h1.pgm-fogo{color:#e0a070;text-shadow:0 0 40px #8a3a06,0 0 10px #c25a14}`;
    document.head.appendChild(st);
  }
  if (!$('#b-acervo') && $('#b-stats')) {
    const b = document.createElement('button'); b.className = 'btn'; b.id = 'b-acervo'; b.textContent = 'Acervo';
    $('#b-stats').insertAdjacentElement('afterend', b); b.onclick = () => painelAcervo();
  }
  if (!$('#l-cat') && $('#o-crono')) {
    const T = TX(), l = document.createElement('label'); l.id = 'l-cat'; l.title = 'Categoria da corrida (recordes separados por categoria e dificuldade)';
    l.innerHTML = `Categoria <select id="o-cat">${Object.entries(T.categorias).map(([k, n]) => `<option value="${k}" title="${T.categoriasDesc[k]}">${n}</option>`).join('')}</select>`;
    $('#o-crono').closest('label').insertAdjacentElement('afterend', l);
    const sel = l.querySelector('select'); sel.value = C.OPT.cat || 'saida';
    sel.onchange = () => { C.OPT.cat = sel.value; C.salvarOpt(); };
    const atual = () => { l.hidden = !$('#o-crono').checked; };
    $('#o-crono').addEventListener('change', atual); atual();
  }
}
let memBase = '';
function tituloMundo(doPG) {
  prepararTitulo();
  const T = TX(), st = A.stats(), data = dataEspecial(), h1 = $('#t-titulo'), sub = $('#t-sub'), nove = agora().getHours() === 21;
  const ba = $('#b-acervo'); if (ba) ba.hidden = !Object.keys(A.acervo()).length && !Object.keys(mem().recados || {}).length;
  h1.classList.remove('pgm-fogo');
  if (data && !nove) {
    const D = T.datas[data];
    if (data === 'fogo') { h1.innerHTML = D.titulo.replace('{n}', agora().getFullYear() - 1979); h1.classList.add('pgm-fogo'); }
    sub.textContent = D.sub;
  } else if (!nove && conqs().historiadora) sub.textContent = T.todasHistorias;
  const nm = nomeEspecial(), el = $('#t-memoria');
  if (el) {
    if (doPG) memBase = el.textContent || ''; // o que a progressão escreveu agora; ao digitar o nome, parte de novo dela
    let txt = memBase;
    if (nm) txt = T.nomes[nm].memoria;
    else if ((st.partidas || 0) >= 1) txt = (txt ? txt + ' · ' : '') + T.memoriaNoite.replace('{n}', (st.partidas || 0) + 1);
    el.textContent = txt; el.style.color = nm === 'MOACIR' ? '#c0392b' : '';
  }
}
function aoDigitarNome() {
  const nm = nomeEspecial();
  if (nm) { mudar(m => { m.nomes = [...new Set([...(m.nomes || []), nm])]; }); if ((mem().nomes || []).length >= 4) A.conquista('chamada'); }
  if (C.mode === 'titulo') tituloMundo();
}

// ---------------------------------------------------------------- API
export const MUNDO = {
  ligar(ctx, aux) {
    C = ctx; A = aux;
    const RR = R();
    for (const x of TX().conquistas) if (!RR.conquistas.some(y => y.id === x.id)) RR.conquistas.push(x);
    for (const x of RR.conquistas) if (x.secreta && !x.dica && TX().dicasConq[x.id]) x.dica = TX().dicasConq[x.id];
    prepararTitulo();
    const inp = $('#o-nome'); if (inp) inp.addEventListener('input', aoDigitarNome);
    // a quarta criança: uma escolha a mais no portão para quem juntou a história do Moacir
    const es = $('#escolha');
    if (es && !$('#es-moacir')) {
      const b = document.createElement('button'); b.className = 'btn'; b.id = 'es-moacir'; b.hidden = true; b.textContent = TX().quarta.botao;
      ($('#es-voltar') || es.lastElementChild).insertAdjacentElement('afterend', b);
      b.onclick = () => { const S = C.S; if (!S) return; S.flags.moacirNome = true; A.conquista('quarta_crianca'); $('#es-voltar').click(); };
      new MutationObserver(() => { if (es.hidden) return; const S = C.S, ac = A.acervo(); b.hidden = !(S && S.fitas.f3 && ac.n4 && ac.n3); }).observe(es, { attributes: true, attributeFilter: ['hidden'] });
    }
    setTimeout(() => { try { checarFios(false); } catch (e) {} }, 1500); // quem já tinha o acervo completo de outra versão
  },
  titulo: () => tituloMundo(true),
  novoJogo(S) {
    const st = A.stats(); S.flags._noite = st.partidas || 1;
    S.modo = S.modo || {}; S.modo.cat = S.modo.crono ? (C.OPT.cat || 'saida') : null;
    const data = dataEspecial(); if (data) { S.flags._data = data; A.conquista(CONQ_DATA[data]); }
    if (S.flags._noite >= 9) A.conquista('nona_noite');
    const nm = nomeEspecial(); if (nm) S.flags._nome = nm;
    novoS(S);
  },
  // nomes e datas mexem na dificuldade (sem mexer no Pesadelo de um toque)
  difKey() { const S = C && C.S; return S ? (S.flags._nome || '') + (S.flags._data || '') : ''; },
  difMod(v, S) {
    const nm = S.flags._nome;
    if (nm === 'MOACIR') v.vel *= 1.1;
    if (nm === 'ALBANO') v.ouvido *= 1.1;
    if (nm === 'CELESTE') v.aviso += 1;
    if (S.flags._data === 'fogo') v.aviso = Math.max(2, v.aviso - 1);
    return v;
  },
  tick(dt) {
    const S = C.S; if (!S) return;
    if (S !== Sref) novoS(S);
    // a Lia sai do carro lembrando das outras noites, da data ou do nome que você escreveu
    if (!falou && S.chapter === 0 && S.capT > 5 && !S.replay) {
      falou = true;
      if (!S.flags._mundoFala) {
        S.flags._mundoFala = true;
        const T = TX(), data = S.flags._data, nm = S.flags._nome, noite = S.flags._noite || 1;
        const lN = Object.keys(T.noites).map(Number).filter(n => noite >= n).pop();
        if (data) C.sub('lia', T.datas[data].fala.replace('{n}', agora().getFullYear() - 1979));
        else if (lN) C.sub('lia', T.noites[lN]);
        if (nm) setTimeout(() => { if (C.S !== S) return; const f = T.nomes[nm].fala; C.sub(f.quem, f.texto); if (T.nomes[nm].efeito) C.toast(T.nomes[nm].efeito); }, 4500);
      }
    }
    // trilha da corrida (a cada 0,5 s)
    if (trilhaCap !== S.chapter) { trilha = []; trilhaCap = S.chapter; viuPegadas = false; }
    if ((trilhaT -= dt) <= 0 && trilha.length < 5000) { trilhaT = .5; trilha.push(Math.round(C.P.pos.x * 10), Math.round(C.P.pos.z * 10)); }
    if (loreCapN !== S.chapter) { loreCap = []; loreCapN = S.chapter; }
    // lugares em que a Lia reparou (somando as noites)
    if ((lugT -= dt) <= 0) {
      lugT = 2;
      const vistos = Object.keys(S.flags).filter(k => k.startsWith('lugar_')).map(k => k.slice(6)), ant = mem().lugares || [];
      const novos = vistos.filter(k => !ant.includes(k));
      if (novos.length) { const m = mudar(mm => { mm.lugares = [...ant, ...novos]; }); if (m.lugares.length >= 8) A.conquista('ouve_casa'); }
    }
    try { tickMundo(dt, S); } catch (e) { console.warn('progressão/mundo', e); }
  },
  cronoExtra(S) {
    if (!S.modo || !S.modo.cat) return '';
    if ((cronoT -= 1 / 30) > 0 && cronoTxt) return cronoTxt;
    cronoT = 1; const T = TX();
    let t = T.categorias[S.modo.cat] || '';
    if (S.modo.cat === 'tudo') { const sec = ['n13', 'f6', 'f7'].filter(id => (S.notes || {})[id] || (S.fitas || {})[id]).length; t += ` · lembranças ${C.loreAchado() + sec}/${C.totalLore() + 3}`; }
    return (cronoTxt = t);
  },
  lore(id) {
    const S = C.S; if (S) loreCap.push(id);
    checarFios(true);
  },
  morte(quem) {
    const S = C.S, P = C.P, W = C.W; if (!S || !W.mapa) return;
    mudar(m => {
      m.mortes = m.mortes || {}; const l = m.mortes[W.mapa] = m.mortes[W.mapa] || [];
      l.push({ x: Math.round(P.pos.x * 10) / 10, z: Math.round(P.pos.z * 10) / 10, h: horaReal(), sala: P.room && P.room.id, t: Date.now(), noite: S.flags._noite || 0, quem });
      while (l.length > 9) l.shift();
      m.mortesCap = m.mortesCap || {}; m.mortesCap[S.chapter] = (m.mortesCap[S.chapter] || 0) + 1;
      if (P.room && P.room.id) { const k = W.mapa + ':' + P.room.id; m.mortesSala = m.mortesSala || {}; const o = m.mortesSala[k] || { n: 0 }; o.n++; o.nome = P.room.nome || P.room.id; m.mortesSala[k] = o; }
    });
  },
  // fim de capítulo: guarda o recado da Lia, a trilha recorde e conta o que a história ganhou
  fimCap(c, ant, semRecado) {
    const S = C.S, rec = semRecado ? '' : ($('#fc-recado') && $('#fc-recado').textContent || '').replace(/^Gravador da Lia:\s*/, '');
    const recorde = !ant.tempo || S.capT < ant.tempo;
    mudar(m => {
      if (rec) (m.recados = m.recados || {})[c.id] = rec;
      if (recorde && trilha.length > 4 && !S.replay) (m.rastro = m.rastro || {})[c.id] = { mapa: C.W.mapa, pts: trilha.slice(), tempo: Math.round(S.capT) };
    });
    if (recorde && viuPegadas && ant.tempo) A.conquista('mais_rapida');
    const linhas = [];
    if (loreCap.length) {
      const fs = fiosStatus();
      linhas.push('novo na história: ' + [...new Set(loreCap)].map(id => { const f = fs.find(x => x.pecas.includes(id)); return `${esc(tituloLore(id))}${f ? ` <small>(${esc(f.nome)} ${f.achou}/${f.pecas.length})</small>` : ''}`; }).join(' · '));
    }
    if (recorde && trilha.length > 4 && !S.replay) linhas.push('<small>suas pegadas desta noite ficaram gravadas no chão (aparecem com o cronômetro ligado)</small>');
    return linhas;
  },
  // corrida por categoria: valida e guarda o recorde no fim
  final(tipo) {
    const S = C.S; MUNDO._corrida = null;
    const cat = S.modo && S.modo.cat; if (!cat || !S.completo) return;
    const sec = ['n13', 'f6', 'f7'].every(id => (S.notes || {})[id] || (S.fitas || {})[id]);
    const valida = cat === 'saida' || (cat === 'hora' && tipo === 'verdadeiro') || (cat === 'tudo' && C.loreAchado() >= C.totalLore() && sec);
    const k = cat + '-' + (S.dif || 'normal'), ant = (mem().recordes || {})[k];
    const novo = valida && (!ant || S.tempo < ant);
    if (novo) mudar(m => { (m.recordes = m.recordes || {})[k] = Math.round(S.tempo); });
    if (valida && cat === 'hora') A.conquista('categoria_hora');
    if (valida && cat === 'tudo') A.conquista('categoria_tudo');
    MUNDO._corrida = { cat, valida, ant, novo };
  },
  telaFinal(tipo) {
    const S = C.S, T = TX(), linhas = [];
    const cr = MUNDO._corrida;
    if (cr) linhas.push(`corrida “${T.categorias[cr.cat]}” (${C.D().nome}): ${!cr.valida ? (cr.cat === 'hora' ? 'não vale, precisa do final verdadeiro' : 'não vale, faltaram lembranças') : cr.novo ? `novo recorde${cr.ant ? `, ${Math.round(cr.ant - S.tempo)}s mais rápida` : ''}` : `recorde ${A.fmtC(cr.ant)}`}`);
    const fs = fiosStatus(), ps = pessoasStatus();
    linhas.push(`fios de mistério ${fs.filter(f => f.achou === f.pecas.length).length}/${fs.length} · pessoas lembradas ${ps.filter(p => p.pct === 100).length}/${ps.length} · noite nº ${S.flags._noite || 1}`);
    $('#e-stats').innerHTML += '<br>' + linhas.join('<br>');
    // a quarta criança muda o epílogo
    if (tipo === 'verdadeiro' && S.flags.moacirNome) {
      const el = $('#e-txt'), n = el.querySelectorAll('.par').length, sp = document.createElement('span');
      sp.className = 'par'; sp.textContent = '\n\n' + T.quarta.texto; sp.style.animationDelay = (n * 1.4) + 's'; el.appendChild(sp);
    }
    // jornal do dia seguinte
    let bj = $('#e-jornal');
    if (!bj) { bj = document.createElement('button'); bj.className = 'btn'; bj.id = 'e-jornal'; bj.textContent = 'Jornal do dia seguinte'; ($('#e-menu') || $('#e-copiar')).insertAdjacentElement('beforebegin', bj); }
    bj.onclick = () => abrirJornal(tipo);
    const be = $('#e-epilogo') || (() => { const b = document.createElement('button'); b.className = 'btn'; b.id = 'e-epilogo'; b.textContent = 'Na manhã seguinte'; bj.insertAdjacentElement('afterend', b); return b; })();
    be.hidden = tipo !== 'verdadeiro'; be.onclick = epilogo;
    // depois dos créditos do final verdadeiro, a cena no carro abre sozinha
    if (tipo === 'verdadeiro' && !window.__teste) {
      const pars = $('#e-txt').querySelectorAll('.par').length;
      setTimeout(() => { if (!$('#ending').hidden && C.S === S) epilogo(); }, pars * 1400 + 9000);
    }
  },
  // linhas extras dos painéis do título
  linhasStats() {
    const m = mem(), T = TX(), fs = fiosStatus(), ps = pessoasStatus(), RR = R();
    const sala = Object.values(m.mortesSala || {}).sort((a, b) => b.n - a.n)[0];
    const capM = Object.entries(m.mortesCap || {}).sort((a, b) => b[1] - a[1])[0];
    const L = [['Fios de mistério completos', `${fs.filter(f => f.achou === f.pecas.length).length}/${fs.length}`], ['Pessoas lembradas por inteiro', `${ps.filter(p => p.pct === 100).length}/${ps.length}`],
      ['Datas acesas na linha do tempo', `${T.linha.filter(l => !l.peca || A.acervo()[l.peca]).length}/${T.linha.length}`], ['Lugares em que a Lia reparou', `${(m.lugares || []).length}/${Object.keys(RR.lugares || {}).length}`],
      ['Lugar onde mais te encontraram', sala ? `${sala.nome} (${sala.n})` : '—'], ['Capítulo mais difícil', capM ? `${['Prólogo', 'I', 'II', 'III', 'IV', 'V'][capM[0]] || capM[0]} (${capM[1]})` : '—']];
    for (const [k, n] of Object.entries(T.categorias)) for (const d of ['facil', 'normal', 'pesadelo']) { const v = (m.recordes || {})[k + '-' + d]; if (v) L.push([`Recorde “${n}” · ${({ facil: 'Fácil', normal: 'Normal', pesadelo: 'Pesadelo' })[d]}`, A.fmtC(v)]); }
    return L;
  },
  linhasCap(c, i) {
    const m = mem(), out = [], n = (m.mortesCap || {})[i];
    if (n) out.push(`te encontraram aqui ${n}x (todas as noites)`);
    if ((m.rastro || {})[c.id]) out.push('pegadas gravadas');
    if ((m.recados || {})[c.id]) out.push(`<i>Gravador da Lia: ${esc(m.recados[c.id])}</i>`);
    return out;
  },
  pausaExtra() { const S = C.S; return S && S.flags._noite ? ` · noite nº ${S.flags._noite}${S.modo && S.modo.cat ? ' · corrida “' + TX().categorias[S.modo.cat] + '”' : ''}` : ''; },
  // para o kit de teste
  _jornal: jornal, _epilogo: epilogo, _acervo: painelAcervo, _textos: () => aplicarTextos(C.S)
};
