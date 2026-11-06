// INTERFACE — lote 6 (2ª rodada): perfis no mesmo aparelho, modo visitante e placar da turma.
// Cada perfil guarda uma cópia de TODAS as chaves do jogo no localStorage (prefixos hora-silencio e ths_).
// Trocar de perfil = guardar a cópia do atual, limpar, repor a do outro e recarregar a página.
// O visitante começa vazio, não grava nada e, se a aba for fechada no meio, o perfil verdadeiro volta sozinho.
const REG = 'hora-silencio-perfis';
const PREFIXO = /^(hora-silencio|ths_)/;
const CORES = ['#c9a75a', '#c0392b', '#3f6e9c', '#7fbf6a', '#9b7fb8', '#d9a092'];
const LIMITE = 4;

const ls = {
  ler(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
  pôr(k, v) { try { localStorage.setItem(k, v); } catch (e) {} },
  tirar(k) { try { localStorage.removeItem(k); } catch (e) {} }
};
const reg = () => { try { const r = JSON.parse(ls.ler(REG)); return r && r.perfis ? r : null; } catch (e) { return null; } };
const gravar = r => ls.pôr(REG, JSON.stringify(r));
function chaves() { const ks = []; try { for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (PREFIXO.test(k) && k !== REG) ks.push(k); } } catch (e) {} return ks; }
function foto() { const o = {}; for (const k of chaves()) o[k] = ls.ler(k); return o; }
function limpar() { for (const k of chaves()) ls.tirar(k); }
function repor(dados) { for (const k in (dados || {})) if (dados[k] != null) ls.pôr(k, dados[k]); }
const flagSessao = (k, v) => { try { if (v === undefined) return sessionStorage.getItem(k); sessionStorage.setItem(k, v); } catch (e) {} return null; };

function garantir() {
  let r = reg();
  if (!r) { r = { atual: 'p1', anterior: null, ordem: ['p1'], perfis: { p1: { nome: 'Jogador 1', cor: CORES[0] } } }; gravar(r); }
  return r;
}
function recarregar() { try { location.reload(); } catch (e) {} }

export function criarPerfis(C) {
  const esc = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const lsGet = (k, d) => { try { const v = ls.ler(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } };
  const robo = (() => { try { return navigator.webdriver; } catch (e) { return false; } })();

  // ---- ao carregar: se a aba abriu já dentro de uma visita esquecida, devolve o perfil verdadeiro
  (function inicio() {
    const r = reg(); if (!r) return;
    const a = r.perfis[r.atual];
    if (a && a.volatil && !flagSessao('l6b-visita')) {
      const ant = r.perfis[r.anterior] ? r.anterior : r.ordem.find(id => !r.perfis[id].volatil);
      limpar(); repor((r.perfis[ant] || {}).dados);
      delete r.perfis[r.atual]; r.ordem = r.ordem.filter(id => id !== r.atual); r.atual = ant; r.anterior = null; gravar(r);
      recarregar();
    }
  })();

  const lista = () => { const r = reg(); return r ? r.ordem.filter(id => r.perfis[id]).map(id => ({ id, ...r.perfis[id], atual: id === r.atual })) : []; };
  const atual = () => { const r = reg(); return r ? { id: r.atual, ...r.perfis[r.atual] } : { id: 'p1', nome: 'Jogador 1', cor: CORES[0], implicito: true }; };
  const ehVisita = () => { const r = reg(); return !!(r && r.perfis[r.atual] && r.perfis[r.atual].volatil); };

  function criar(nome, cor) {
    const r = garantir();
    const reais = r.ordem.filter(id => !r.perfis[id].volatil);
    if (reais.length >= LIMITE) return { erro: `No máximo ${LIMITE} perfis. Apague um antes.` };
    nome = String(nome || '').trim().slice(0, 14) || `Jogador ${reais.length + 1}`;
    let id; for (let i = 1; i < 99; i++) if (!r.perfis['p' + i]) { id = 'p' + i; break; }
    r.perfis[id] = { nome, cor: cor || CORES[reais.length % CORES.length], dados: {} };
    r.ordem.push(id); gravar(r);
    return { id };
  }
  function trocar(id) {
    const r = garantir(); if (!r.perfis[id] || id === r.atual) return false;
    const a = r.perfis[r.atual];
    if (a && !a.volatil) a.dados = foto();
    limpar(); repor(r.perfis[id].dados);
    r.perfis[id].dados = {};   // evita duas cópias: os dados vivos ficam no localStorage
    r.atual = id; flagSessao('l6b-escolheu', '1'); gravar(r); recarregar();
    return true;
  }
  function visitante() {
    const r = garantir();
    if (ehVisita()) return false;
    const a = r.perfis[r.atual]; a.dados = foto();
    limpar();
    // o visitante começa com as dicas ligadas e um aviso de que nada vai ser gravado
    ls.pôr('hora-silencio-opt', JSON.stringify({ dicas: true, visitante: 1 }));
    r.perfis.visita = { nome: 'Visitante', cor: '#857a63', volatil: true };
    if (!r.ordem.includes('visita')) r.ordem.push('visita');
    r.anterior = r.atual; r.atual = 'visita'; flagSessao('l6b-visita', '1'); flagSessao('l6b-escolheu', '1'); gravar(r); recarregar();
    return true;
  }
  function sairVisita() {
    const r = reg(); if (!r || !ehVisita()) return false;
    const ant = r.perfis[r.anterior] ? r.anterior : r.ordem.find(id => !r.perfis[id].volatil);
    limpar(); repor((r.perfis[ant] || {}).dados); if (r.perfis[ant]) r.perfis[ant].dados = {};
    delete r.perfis.visita; r.ordem = r.ordem.filter(id => id !== 'visita'); r.atual = ant; r.anterior = null;
    try { sessionStorage.removeItem('l6b-visita'); } catch (e) {}
    gravar(r); recarregar();
    return true;
  }
  function apagar(id) {
    const r = reg(); if (!r || !r.perfis[id] || id === r.atual) return false;
    if (r.ordem.filter(x => !r.perfis[x].volatil).length <= 1) return false;
    delete r.perfis[id]; r.ordem = r.ordem.filter(x => x !== id); gravar(r); return true;
  }

  // ---- números de cada perfil (o ativo lê o localStorage ao vivo; os outros, a cópia guardada)
  function numeros(dados) {
    const g = k => { try { const v = dados ? dados[k] : ls.ler(k); return v ? JSON.parse(v) : null; } catch (e) { return null; } };
    const st = g('hora-silencio-stats') || {}, caps = g('hora-silencio-v3-caps') || {}, cq = g('hora-silencio-v2-conq') || {}, l6b = g('hora-silencio-l6b') || {};
    const noites = (l6b.noites || []).filter(n => n.final);
    const temposFinais = noites.map(n => n.tempo).filter(Boolean);
    const somaCaps = Object.values(caps).reduce((a, x) => a + ((x && x.tempo) || 0), 0);
    const completo = C.R.capitulos.every(c => caps[c.id] && caps[c.id].tempo);
    const melhorTempo = temposFinais.length ? Math.min(...temposFinais) : (completo ? Math.round(somaCaps) : null);
    const conquistas = Object.keys(cq).length;
    const finais = Object.keys(st.finais || {}).length;
    const mortes = st.mortes || 0;
    const pontos = conquistas * 10 + (st.concluidas || 0) * 50 + finais * 40 - Math.min(mortes, 200);
    return { pontos, melhorTempo, mortes, conquistas, finais, noites: st.partidas || 0 };
  }
  function turma() {
    const r = reg(); if (!r) return [];
    const out = r.ordem.filter(id => r.perfis[id] && !r.perfis[id].volatil).map(id => {
      const p = r.perfis[id];
      return { id, nome: p.nome, cor: p.cor, atual: id === r.atual, ...numeros(id === r.atual ? null : p.dados || {}) };
    });
    return out;
  }
  function textoTurma() {
    const t = turma(); if (t.length < 2) return '';
    const mm = s => s == null ? '—' : `${Math.floor(s / 60)}min ${String(Math.floor(s % 60)).padStart(2, '0')}s`;
    return 'A HORA DO SILÊNCIO — placar da turma\n' + t.slice().sort((a, b) => b.pontos - a.pontos).map((p, i) => `${i + 1}. ${p.nome}: ${p.pontos} pts · melhor ${mm(p.melhorTempo)} · ${p.mortes} mortes · ${p.conquistas} conquistas`).join('\n');
  }

  // ---- tela "Quem está jogando?" antes do título, quando há dois perfis ou mais
  function overlay() {
    if (robo || window.__teste) return;
    const r = reg(); if (!r || flagSessao('l6b-escolheu')) return;
    const reais = r.ordem.filter(id => r.perfis[id] && !r.perfis[id].volatil);
    if (reais.length < 2) return;
    const el = document.createElement('div'); el.id = 'l6b-quem'; el.setAttribute('role', 'dialog'); el.setAttribute('aria-label', 'Quem está jogando?');
    el.innerHTML = '<h2>Quem está jogando?</h2><div class="l6b-cartas">' + reais.map(id => `<button class="btn l6b-perfil" data-id="${id}" style="border-color:${r.perfis[id].cor};color:${r.perfis[id].cor}">${esc(r.perfis[id].nome)}${id === r.atual ? '<small>último perfil</small>' : ''}</button>`).join('') + '</div><button class="btn l6b-visit">Só visitando</button>';
    document.body.appendChild(el);
    const fechar = () => { flagSessao('l6b-escolheu', '1'); el.remove(); };
    el.querySelectorAll('.l6b-perfil').forEach(b => b.onclick = () => { if (b.dataset.id === r.atual) fechar(); else trocar(b.dataset.id); });
    el.querySelector('.l6b-visit').onclick = () => { fechar(); visitante(); };
    const f = el.querySelector('.l6b-perfil'); if (f) f.focus();
  }

  return { CORES, LIMITE, lista, atual, ehVisita, criar, trocar, visitante, sairVisita, apagar, turma, textoTurma, overlay, garantir };
}
