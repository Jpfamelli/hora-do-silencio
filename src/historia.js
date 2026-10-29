// HISTÓRIA E TEXTO — segredos, falas de contexto, dicas, atitudes do final e formatação do texto.
// Liga-se ao motor por poucos ganchos em jogo.js (instalarHistoria) e embrulha os mapas sem editá-los.
// Todo o texto mora em roteiro.js; aqui só fica a lógica de quando e como ele aparece.

import { instalarMundo } from './historia-mundo.js';
import { instalarPolimento } from './historia-polimento.js';
import { instalarSegredos } from './historia-segredos.js';
import { instalarHistoriaL5 } from './historia-lote5.js';

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// Legenda: rubricas entre parênteses ficam em itálico e apagadas ("(eco)", "(na fita)"...)
export function fmtFala(texto) {
  return esc(texto).replace(/\.\.\./g, '…').replace(/\(([^)]*)\)/g, '<i class="rubrica">($1)</i>');
}
// ~palavra~ vira palavra riscada à mão
const riscos = h => h.replace(/~([^~]+)~/g, '<s>$1</s>');
// Nota: rubricas viram anotação de cena; a linha seguinte a uma rubrica de "letra/lápis/caneta/giz/riscado" vira escrita à mão
export function fmtNota(texto) {
  const linhas = String(texto).split('\n'); let mao = false;
  return linhas.map(l => {
    const t = l.trim();
    const m = t.match(/^(\([^)]*\))\s*(.*)$/);
    if (m) {
      mao = /letra|lápis|caneta|giz|riscad|tinta/i.test(m[1]);
      return `<em class="rubrica">${esc(m[1])}</em>` + (m[2] ? (mao ? `<span class="mao">${esc(m[2])}</span>` : esc(m[2])) : '');
    }
    if (!t) { return ''; }
    if (!mao && t.length > 6 && t === t.toUpperCase() && /[A-ZÁÉÍÓÚÂÊÔÃÕÇ]{3,}/.test(t)) return `<span class="cab">${riscos(esc(l))}</span>`; // cabeçalho de documento
    const out = mao ? `<span class="mao">${riscos(esc(l))}</span>` : riscos(esc(l));
    return out;
  }).join('\n');
}
// Máquina de escrever: revela o texto aos poucos (usada no gancho do fim de capítulo)
export function escrever(el, texto, ms = 28) {
  clearInterval(el._esc); el.textContent = ''; let i = 0; const s = String(texto || '');
  if (!s) return;
  el._esc = setInterval(() => { i += 1 + (Math.random() < .2 ? 1 : 0); el.textContent = s.slice(0, i); if (i >= s.length) clearInterval(el._esc); }, ms);
}
// Final: parágrafos aparecem um a um
export function revelar(el, texto, passo = 1400) {
  clearTimeout(el._rev); el.innerHTML = '';
  if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) passo = 250; // menos movimento: tudo quase de uma vez
  const pars = String(texto).split('\n\n');
  pars.forEach((p, i) => { const s = document.createElement('span'); s.className = 'par'; s.textContent = p + (i < pars.length - 1 ? '\n\n' : ''); s.style.animationDelay = (i * passo / 1000) + 's'; el.appendChild(s); });
}

export function instalarHistoria(c) {
  const { R, MAPAS, lsGet, lsSet } = c;
  const $ = s => document.querySelector(s);
  const S = () => c.S;
  const NOME_KEY = 'hora-silencio-nome', FITAS_KEY = 'hora-silencio-fitas-ouvidas', COD_KEY = 'hora-silencio-codigos', GASTA_KEY = 'hora-silencio-fita-gasta';
  const conqs = () => lsGet(c.CONQ_KEY, {});
  const ehNove = () => new Date().getHours() === 21;
  const lapidesBase = JSON.parse(JSON.stringify(R.lapides));
  const n1Base = R.notas.find(n => n.id === 'n1').texto;
  const nomesBase = Object.fromEntries(Object.entries(R.personagens).map(([k, p]) => [k, p.nome]));
  const pick = a => a[Math.random() * a.length | 0];
  const falarLinhas = linhas => { if (!linhas || !linhas.length) return; R.falas.__h = linhas; c.falar('__h'); };
  const hoje = () => { const d = new Date(); return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`; };
  const nomeJogador = () => { const n = lsGet(NOME_KEY, ''); return typeof n === 'string' ? n.trim().slice(0, 16) : ''; };

  // Lote 2: lore do mundo (instalado antes dos embrulhos abaixo, para rodar depois deles na hora de montar o mapa)
  const MUN = instalarMundo(c, { falarLinhas, conqs, nomeJogador, esc, pick });
  // Lote 3: créditos, o seu nome, legendas, teclados e acessibilidade do texto
  const POL = instalarPolimento(c, { esc, nomeJogador, conqs, fmtFala, fmtNota });
  // Lote 4: segredos, salas e cartas escondidas, finais secretos, a palavra que liga tudo
  const SEG = instalarSegredos(c, { falarLinhas, conqs, nomeJogador });
  // Lote 5: monstros — a ficha do Inspetor revelada por morte, caçadas longas, o chapéu na fuga e os epílogos do Moacir
  const L5M = instalarHistoriaL5(c, { conqs });

  // ------------------------------------------------------------------
  // Mapas: embrulhos que acrescentam segredos sem mexer em mapas.js
  // ------------------------------------------------------------------
  const embrulhar = (id, antes, depois) => {
    const orig = MAPAS[id]; if (!orig) return;
    MAPAS[id] = (A, St) => { if (antes) antes(A, St); const def = orig(A, St); if (depois) depois(A, St, def); return def; };
  };
  // Prólogo: o cartaz de desaparecidos muda depois do final verdadeiro
  embrulhar('estrada', () => {
    const n1 = R.notas.find(n => n.id === 'n1');
    n1.texto = conqs().final_verdadeiro && n1.textoDepois ? n1.textoDepois : n1Base;
  });
  // Térreo: o desenho de aniversário que a página 1 menciona, atrás dos livros da diretoria
  embrulhar('terreo', null, (A, St) => {
    try { A.ITENS.nota('n13', A.spot('diret', 'prateleira', 0)); } catch (e) { console.warn(e); }
  });
  // Andar de cima: a fita escondida do Tomé só aparece para quem apaga a luz e se agacha na rouparia
  embrulhar('superior', null, (A, St) => {
    try { A.ITENS.gravador('f6', A.spot('roup', 'prateleira', 3), () => !!c.S.flags.f6); } catch (e) { console.warn(e); }
  });
  // Cemitério: lápides que mudam com quem joga + o carrinho azul do Tomé no muro
  embrulhar('cemiterio', (A, St) => {
    const V = R.lapidesVariantes || {};
    R.lapides = JSON.parse(JSON.stringify(lapidesBase));
    const L = id => R.lapides.find(l => l.id === id);
    const alb = L('albano'); if (alb && St.fitas.f3 && V.albanoDepoisF3) Object.assign(alb, V.albanoDepoisF3);
    const cq = conqs(), jaTerminou = cq.final_comum || cq.final_silencio || cq.final_verdadeiro;
    const s62 = L('semnome62');
    if (s62 && V.lia && (jaTerminou || St.dif === 'pesadelo')) { Object.assign(s62, V.lia); if (St.mortes >= 10 && V.liaVoltou) s62.frase = V.liaVoltou.replace('{n}', St.mortes); }
    const s75 = L('semnome75'), nome = nomeJogador();
    if (s75 && nome && V.jogador) { Object.assign(s75, { nome: nome.toUpperCase(), datas: V.jogador.datas.replace('{hoje}', hoje()), frase: V.jogador.frase, epitafio: V.jogador.epitafio }); s75.aoLer = () => c.conquista('nome_pedra'); }
  }, (A, St) => {
    try {
      const it = A.item('carrinhoAzul', { x: -28.4, y: .02, z: -45.4 }, A.MK.carrinho(), 'Pegar um carrinho azul esquecido no muro', () => {
        St.flags.carrinhoAzul = true; c.conquista('bombeiro'); c.falar('carrinho_azul'); A.emitNoise(-28.4, -45.4, 6);
      });
      it.obj.rotation.y = .6;
    } catch (e) { console.warn(e); }
  });

  // ------------------------------------------------------------------
  // Estado acompanhado entre quadros (para falar na hora certa)
  // ------------------------------------------------------------------
  let ultimoS = null, prev = {}, tParado = 0, doneN = 0, salaAnt = null, olharT = 0, foraT = 0, escuroT = 0, guiaT = 0, capAnt = -1;
  function reset(St) {
    ultimoS = St; tParado = 0; doneN = Object.keys(St.done).length; olharT = 0; foraT = 0; escuroT = 0; guiaT = 0; capAnt = St.chapter;
    prev = { fus: St.inv.fusiveis, eng: St.inv.engrenagens, valv: St.valv.length, f1: !!St.fitas.f1, f2: !!St.fitas.f2, tum: Object.keys(St.tumulos), atendeu: !!St.flags.atendeu, n13: !!St.notes.n13 };
  }

  function tick(dt) {
    const St = S(); if (!St) return;
    if (St !== ultimoS) reset(St);
    try { L5M.tick(dt); } catch (e) {}
    const P = c.P, M = c.M, W = c.W;
    // nomes revelados: "???" vira "O Inspetor" depois que você o vê; "Menina" vira "Ana" depois da brincadeira
    R.personagens.inspetor.nome = St.flags.avist ? R.personagens.inspetor.nomeRevelado : nomesBase.inspetor;
    R.personagens.ana.nome = (St.done.ana || St.notes.n6) ? R.personagens.ana.nomeRevelado : nomesBase.ana;
    const cacando = M.ativo && M.state === 'caca';
    // falas de evento (detectadas pela mudança de estado)
    if (St.inv.fusiveis >= 3 && prev.fus < 3 && !St.flags.energia) setTimeout(() => c.falar('fusiveis'), 600);
    if (St.inv.engrenagens >= 3 && prev.eng < 3) setTimeout(() => c.falar('engrenagem'), 900);
    if (St.valv.length > prev.valv && St.valv.length < 3 && St.valv.length > 0) c.falar('valvula_certa');
    if (St.fitas.f1 && !prev.f1) setTimeout(() => c.falar('fita1_codigo'), 1200);
    if (St.fitas.f2 && !prev.f2) setTimeout(() => c.falar('fita2_ordem'), 1200);
    const tum = Object.keys(St.tumulos); for (const k of tum) if (!prev.tum.includes(k)) c.falar('tumulo_' + k);
    if (St.flags.atendeu && !prev.atendeu) c.conquista('linha_cruzada');
    if (St.notes.n13 && !prev.n13) { c.conquista('desenho'); setTimeout(() => c.falar('desenho'), 400); }
    prev = { fus: St.inv.fusiveis, eng: St.inv.engrenagens, valv: St.valv.length, f1: !!St.fitas.f1, f2: !!St.fitas.f2, tum, atendeu: !!St.flags.atendeu, n13: !!St.notes.n13 };

    // primeira vez em certos lugares: um comentário curto da Lia
    if (P.room && P.room !== salaAnt) {
      salaAnt = P.room; const k = `${W.mapa}:${P.room.id}`, fk = 'lugar_' + k;
      if (R.lugares && R.lugares[k] && !St.flags[fk] && !cacando) { St.flags[fk] = true; falarLinhas(R.lugares[k]); }
    }
    // vida baixa e pilha fraca: um aviso por capítulo, só se houver como resolver
    if (St.health < 35 && St.inv.kits > 0 && St.flags.avisoVida !== St.chapter) { St.flags.avisoVida = St.chapter; c.falar('vida_baixa'); }
    if (St.flashOn && St.battery < 15 && St.inv.pilhas > 0 && St.flags.avisoPilha !== St.chapter) { St.flags.avisoPilha = St.chapter; c.falar('pilha_fraca'); }

    // dica de objetivo: se ficar muito tempo sem avançar, a Lia pensa em voz alta onde procurar
    const n = Object.keys(St.done).length;
    if (n !== doneN || St.chapter !== capAnt) { doneN = n; capAnt = St.chapter; tParado = 0; }
    tParado += dt;
    const limite = St.dif === 'facil' ? 75 : St.dif === 'pesadelo' ? 150 : 110;
    if (!c.dicaExterna && tParado > limite && !cacando && !c.PROC.fase && !St.hidden) {
      tParado = limite - 90;
      const cap = R.capitulos[St.chapter], o = cap && cap.objetivos.find(x => !St.done[x.id]);
      if (o && o.dica) c.sub('lia', o.dica);
    }

    // Cap. III: a caixinha "chama" a engrenagem — uma nota metálica perto do dormitório do fundo
    if (W.mapa === 'superior' && St.chapter === 3 && St.inv.engrenagens < 3) {
      const eng = W.items.find(i => i.key === 'superior:eng0');
      if (eng && eng.mesh.visible) {
        guiaT -= dt; const d = Math.hypot(P.pos.x - eng.mesh.position.x, P.pos.z - eng.mesh.position.z);
        if (guiaT <= 0 && d < 16) { guiaT = d < 7 ? 5 : 9; c.SFX.contagem({ x: eng.mesh.position.x, z: eng.mesh.position.z }, (Math.random() * 10) | 0); }
      }
    }
    // Cap. III: quem apaga a luz e se agacha na rouparia por 9 segundos ouve o Tomé
    if (W.mapa === 'superior' && St.chapter >= 3 && !St.flags.f6 && P.room && P.room.id === 'roup') {
      if (P.crouch && !St.flashOn && !St.hidden) { escuroT += dt; if (escuroT > 9) { St.flags.f6 = true; c.SFX.sussurros(1.5); c.falar('f6_revelada'); c.syncWorld(); } }
      else escuroT = 0;
    } else escuroT = 0;

    // Cap. V: fuga. Seu Joaquim segura o portão. E a regra sete: não olhe para trás.
    if (W.mapa === 'cemiterio' && St.flags.sino && !St.fim) {
      if (P.pos.z > 0 && !St.flags.joaquimPortao) { St.flags.joaquimPortao = true; c.falar('joaquim_portao'); }
      if (P.pos.z > -46) foraT += dt; else foraT = 0;
      const olhando = Math.cos(P.yaw) > .75; // olhando para o fundo (capela)
      if (foraT > 2 && olhando && !St.flags.olhouTras) {
        olharT += dt;
        if (olharT > 1.1) {
          St.flags.olhouTras = true; c.SFX.susto(); c.falar('olhou_tras'); St.fear = 100; M.furia = 8;
          if (M.ativo && M.pos.distanceTo(P.pos) > 10 && P.pos.z > -30) { M.path = []; M.pos.set(P.pos.x + Math.sin(P.yaw) * -9, 0, P.pos.z - Math.cos(P.yaw) * 9); }
        }
      } else olharT = 0;
    }
    MUN.tick(dt);
    POL.tick(dt);
    SEG.tick(dt);
  }

  // ------------------------------------------------------------------
  // Fim de capítulo: Davi reage, Lia grava um recado
  // ------------------------------------------------------------------
  function fimCapitulo(St, rk) {
    const mortesCap = St.mortes - (St.flags._mortesIni || 0); St.flags._mortesIni = St.mortes;
    const dr = R.davi_reage || {};
    let reacao = null;
    if (St.chapter > 0) {
      if (mortesCap >= 3) reacao = dr.morreu_muito;
      else if (St.capDano >= 60) reacao = dr.ferida;
      else if (St.capVisto === 0) reacao = dr.nunca_vista;
      else if (St.capT < 360) reacao = dr.rapida;
      else if ((St.capLore || 0) >= 3 && dr.leu) reacao = dr.leu;
    }
    if (reacao) setTimeout(() => { if (S() === St && !St.dead) falarLinhas(reacao); }, 9000);
    const rl = R.recados_lia || {};
    const tipo = St.capDano === 0 && (rk === 'S' || rk === 'A') ? 'perfeito' : St.capDano >= 60 ? 'ferida' : 'normal';
    const lista = (tipo === 'normal' && MUN.culpa(St) && rl.culpa) || rl[tipo] || []; return lista.length ? lista[St.chapter % lista.length] : '';
  }

  // ------------------------------------------------------------------
  // Chamado (regra 5): vozes por capítulo, e o registro de quem respondeu
  // ------------------------------------------------------------------
  function vozChamado() {
    try { L5M.vozChamado(); } catch (e) {}
    const St = S(), esp = MUN.chamadoEspecial(St); if (esp) return esp;
    const nm = POL.chamadoNome(St); if (nm) return nm; // uma vez por capítulo, o Chamado diz o nome digitado no título
    const l = (R.chamados && R.chamados[St.chapter]) || R.falas.chamado;
    const k = 'nChamados' + St.chapter, n = St.flags[k] = (St.flags[k] || 0) + 1;
    return l[Math.min(n - 1, l.length - 1)] || R.falas.chamado[0];
  }
  function respondeu() {
    try { L5M.respondeu(); } catch (e) {}
    const St = S(); St.flags.respondeu = (St.flags.respondeu || 0) + 1;
    setTimeout(() => c.falar('respondeu'), 2200);
  }

  // ------------------------------------------------------------------
  // Fitas: lembrança entre partidas (para o menu "Fitas ouvidas") e conquistas secretas
  // ------------------------------------------------------------------
  function fitaFim(id) {
    const l = lsGet(FITAS_KEY, []); if (!l.includes(id)) { l.push(id); lsSet(FITAS_KEY, l); }
    if (id === 'f6') c.conquista('escuro');
    if (id === 'f7') c.conquista('confissao');
    SEG.fitaFim(id);
  }

  // ------------------------------------------------------------------
  // Teclados: combinações que não abrem nada, mas contam uma história
  // ------------------------------------------------------------------
  function codigo(titulo, dig) {
    const St = S(), cofre = /COFRE/.test(titulo);
    const marca = k => { const l = lsGet(COD_KEY, []); if (!l.includes(k)) { l.push(k); lsSet(COD_KEY, l); } if (l.length >= 3) c.conquista('arrombadora'); };
    if (cofre && dig === '1979') {
      marca('1979');
      if (!St.flags.gavetaFalsa) { St.flags.gavetaFalsa = true; c.fecharTeclado(); c.SFX.trancado(); c.toast('Clique. Não é o cofre: a gaveta de baixo destravou. Tem uma fita dentro.'); setTimeout(() => c.tocarFita('f7'), 900); }
      else { const f = POL.cofre1979(); if (f) c.sub(f.quem, f.texto); else c.sub('lia', 'A gaveta de baixo já tá aberta.'); }
      return true;
    }
    if (POL.codigo(cofre, dig, marca)) return true;
    if (SEG.codigo(cofre, dig, marca)) return true;
    if (dig === '0000' || dig === '000') { marca('zero'); c.sub('lia', cofre ? 'Zero, zero, zero, zero. O Davi nunca usaria zero.' : 'Zero, zero, zero. Óbvio demais pro diretor.'); return true; }
    if (cofre && dig === '1403') { marca('1403'); POL.apagarLuzes(); c.sub('radio', '(um chiado sai do nada) ...quatorze de março... vinte e uma horas...'); setTimeout(() => c.sub('lia', 'A data do livro de ocorrências. A noite do fogo.'), 2600); return true; }
    if (dig === '0909' || dig === '999') {
      marca('nove'); c.SFX.sino(.5, null); setTimeout(() => c.SFX.sino(.4, null), 1600);
      c.sub('inspetor', 'Nove e nove. Quem está brincando com a Hora?'); c.emitNoise(c.P.pos.x, c.P.pos.z, 40); return true;
    }
    if (!cofre && dig === '197') { marca('197'); c.sub('lia', 'Mil novecentos e setenta e... não cabe. Três números só.'); return true; }
    return false;
  }

  // ------------------------------------------------------------------
  // Final: atitudes no lugar de coleta
  // ------------------------------------------------------------------
  function atitudes() {
    const St = S();
    return (R.atitudes || []).map(a => ({ ...a, ok: a.id === 'naoRespondeu' ? !St.flags.respondeu : !!St.fitas[a.id] }));
  }
  const finalLiberado = () => atitudes().every(a => a.ok);
  function textoFinal(tipo, F) {
    const St = S(); let t = F.texto;
    if (tipo === 'verdadeiro') { if (St.flags.carrinhoAzul && F.extraCarrinho) t += '\n\n' + F.extraCarrinho; if (St.notes.n13 && F.extraDesenho) t += '\n\n' + F.extraDesenho; }
    let l5 = ''; try { l5 = L5M.extrasFinal(tipo) || ''; } catch (e) {}
    return t + MUN.extrasFinal(tipo, F) + SEG.extrasFinal(tipo) + l5;
  }
  function aoFinal(tipo) {
    const St = S();
    if (!St.flags.respondeu) c.conquista('nao_respondi');
    if (St.flags.sino && !St.flags.olhouTras) c.conquista('nao_olhei');
    POL.aoFinal(tipo);
    SEG.aoFinal(tipo);
  }
  function statsFinal(tipo) {
    const cq = conqs(), n = ['final_comum', 'final_silencio', 'final_verdadeiro'].filter(k => cq[k]).length;
    let h = (R.finaisDescobertos || '').replace('{n}', n);
    const falta = POL.faltaFinais(); if (falta) h += ' · ' + esc(falta);
    if (tipo === 'comum') h += '<br>' + atitudes().map(a => `${a.ok ? '✦' : '◇'} ${esc(a.texto)}`).join(' · ');
    return h;
  }

  // ------------------------------------------------------------------
  // Tela de título: nove da noite, nome na pedra, nove cliques, palavra proibida
  // ------------------------------------------------------------------
  function titulo() {
    const cq = conqs(), sub = $('#t-sub'), h1 = $('#t-titulo'), ST = R.subtitulos || {};
    if (ehNove()) { h1.innerHTML = 'A HORA<br>COMEÇOU'; sub.textContent = ST.nove || R.subtitulo; document.body.classList.add('nove'); }
    else { h1.innerHTML = 'A HORA<br>DO SILÊNCIO'; sub.textContent = cq.final_verdadeiro ? ST.depoisVerdadeiro : cq.final_silencio ? ST.depoisSilencio : cq.final_comum ? ST.depoisComum : R.subtitulo; }
    if (!sub.textContent) sub.textContent = R.subtitulo;
    const bf = $('#b-fitas'); if (bf) bf.hidden = !cq.nove_cliques;
    const inp = $('#o-nome'); if (inp && document.activeElement !== inp) inp.value = nomeJogador();
    document.body.classList.toggle('fita-gasta', !!lsGet(GASTA_KEY, false));
    POL.titulo();
    SEG.titulo();
  }
  let tocouNove = false;
  function primeiroToque() {
    if (tocouNove || !ehNove()) return; tocouNove = true;
    c.iniciarAudio(); c.SFX.badaladas(9);
  }
  function aoComecar(St) { if (ehNove()) { c.conquista('nove_horas'); St.flags.nove = true; } POL.aoComecar(St); SEG.aoComecar(St); try { L5M.aoComecar(St); } catch (e) {} }
  // nome do jogador (opcional): fica só neste navegador
  const inp = $('#o-nome');
  if (inp) { inp.addEventListener('input', () => lsSet(NOME_KEY, inp.value.replace(/[<>]/g, '').slice(0, 16))); inp.addEventListener('keydown', e => e.stopPropagation()); }
  // nove cliques no subtítulo, um por vez, como o sino
  let cliques = 0, ultimoClique = 0;
  $('#t-sub').addEventListener('click', () => {
    const t = performance.now(), dtc = t - ultimoClique; ultimoClique = t;
    if (dtc < 600 || dtc > 3500) cliques = 0;
    cliques++; c.iniciarAudio(); c.SFX.sino(.15 + cliques * .03, null);
    if (cliques >= 9) {
      cliques = 0; c.SFX.badaladas(3); $('#t-sub').textContent = (R.subtitulos && R.subtitulos.noveCliques) || '...';
      c.conquista('nove_cliques'); const bf = $('#b-fitas'); if (bf) bf.hidden = false;
    }
  });
  // digitar FITAGASTA no título liga/desliga o modo "Fita Gasta" (lote 4: SILENCIO ficou só com o Uma Vida, ver src/interface.js)
  let digitado = '';
  window.addEventListener('keydown', e => {
    const foco = document.activeElement; if (c.mode !== 'titulo' || (foco && /^(INPUT|TEXTAREA|SELECT)$/.test(foco.tagName))) return;
    if (!/^Key[A-Z]$/.test(e.code)) return;
    digitado = (digitado + e.code.slice(3)).slice(-9);
    if (digitado === 'FITAGASTA') {
      digitado = ''; const on = !lsGet(GASTA_KEY, false); lsSet(GASTA_KEY, on); document.body.classList.toggle('fita-gasta', on);
      c.iniciarAudio(); c.SFX.estatica(1.2); if (on) { $('#t-sub').textContent = (R.subtitulos && R.subtitulos.fitaGasta) || ''; c.conquista('fita_gasta'); } else titulo();
    }
  });
  // painel "Fitas ouvidas" (destravado pelos nove cliques)
  const bf = $('#b-fitas');
  if (bf) bf.onclick = () => {
    const l = lsGet(FITAS_KEY, []);
    const pf = POL.painelFitas(l); $('#pn-tit').textContent = pf.tit;
    $('#pn-lista').innerHTML = pf.html;
    $('#title').hidden = true; $('#painel').hidden = false;
  };
  window.addEventListener('pointerdown', () => { if (c.mode === 'titulo') primeiroToque(); });

  return { tick, fimCapitulo, vozChamado, respondeu, fitaFim, codigo, atitudes, finalLiberado, textoFinal, aoFinal, statsFinal, titulo, aoComecar };
}
