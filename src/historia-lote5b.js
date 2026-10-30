// LOTE 5 (2ª rodada) — MONSTROS (história e texto): a noite desumaniza o homem.
// Instalado por src/historia.js com uma linha. Não muda o fluxo dos capítulos nem rótulos
// de interação; só acrescenta falas, narração e notas no momento certo. Texto em window.ROTEIRO.lote5b.

export function instalarHistoriaL5b(c, helpers) {
  const h = helpers || {};
  const R = c.R || {};
  const L = R.lote5b || {};
  const $ = s => document.querySelector(s);
  const S = () => c.S;
  const nomeJogador = h.nomeJogador || (() => '');
  const conqs = h.conqs || (() => { try { return c.lsGet(c.CONQ_KEY, {}); } catch (e) { return {}; } });
  const pick = a => (a && a.length) ? a[Math.random() * a.length | 0] : '';
  const sub = (q, t) => { try { if (t) c.sub(q, t); } catch (e) {} };
  const subP = (q, t) => { try { if (t) (c.subPequeno ? c.subPequeno(q, t) : c.sub(q, t)); } catch (e) {} };
  const toast = t => { try { if (t && c.toast) c.toast(t); } catch (e) {} };
  const conquista = id => { try { if (id) c.conquista(id); } catch (e) {} };
  const later = (ms, fn) => setTimeout(() => { const s = S(); if (s && !s.dead) { try { fn(); } catch (e) {} } }, ms);

  function distPM() { try { const dx = c.P.pos.x - c.M.pos.x, dz = c.P.pos.z - c.M.pos.z; return Math.sqrt(dx * dx + dz * dz); } catch (e) { return 99; } }
  function estado() { try { return (c.M && c.M.state) || ''; } catch (e) { return ''; } }
  function cacando() { const e = estado(); return e === 'caca' || e === 'bote' || e === 'agarra'; }

  // ===== Estado da noite =====
  let capAnt = -1, tCap = 0, cacouNoite = false;
  const feito = {};                    // flags "uma vez por noite/por capítulo"
  const iscaFeita = {};                // habituação por tipo de isca
  let estAnt = '', estCd = 0, leituraCd = 0;
  let nfChamado = false, nfCap = 0;    // chamado final pelo nome (cap V)
  let stunAnt = 0, silabaN = 0;        // sílabas arrancadas pelo sino
  let sonoFalaCd = 0, sonoWas = false;
  let caçavaAnt = false, caçouAntes = false, rezaExtraCd = 0;

  function aoComecar() {
    capAnt = -1; tCap = 0; cacouNoite = false;
    for (const k in feito) delete feito[k];
    for (const k in iscaFeita) delete iscaFeita[k];
    estAnt = ''; estCd = 0; leituraCd = 0; nfChamado = false; nfCap = 0;
    stunAnt = 0; silabaN = 0; sonoFalaCd = 0; sonoWas = false;
    caçavaAnt = false; caçouAntes = false; rezaExtraCd = 0; habT = 0; habCd = 0; extraCd = 0;
  }

  // Chamado final: o motor avisa quando uma voz do Chamado toca / quando a Lia responde.
  function vozChamado() {
    const St = S(); if (!St) return;
    if (St.chapter === 5 && !feito['nf' + St.chapter]) { nfChamado = true; nfCap = St.chapter; }
  }
  function respondeu() {
    const St = S(); if (!St) return;
    if (St.chapter === 5 && nfChamado && L.nomeFinalResponde) {
      nfChamado = false;
      sub('inspetor', L.nomeFinalResponde);
    }
  }

  function nomeOuLia() { const n = (nomeJogador() || '').trim(); return n ? n : 'Lia'; }

  function tick(dt) {
    const St = S(); if (!St || St.dead) return;
    const d = Number(dt) || 0;
    const cap = St.chapter;
    const est = estado();
    if (cacando()) cacouNoite = true;

    // ---- começo de capítulo ----
    if (cap !== capAnt) { capAnt = cap; tCap = 0; }
    tCap += d;

    // ===== Monólogo de desumanização (uma vez por capítulo, ronda, de perto) =====
    if (cap >= 1 && cap <= 5 && !feito['mono' + cap] && est === 'patrulha' && tCap > 9 && distPM() < 14 && L.monologoCap && L.monologoCap[cap]) {
      feito['mono' + cap] = true; sub('inspetor', L.monologoCap[cap]);
    }

    // ===== Nome errado de criança (uma vez por capítulo) =====
    if (cap >= 1 && cap <= 5 && !feito['nome' + cap] && (est === 'patrulha' || est === 'investiga') && tCap > 6 && distPM() < 12 && L.nomeErrado && L.nomeErrado[cap]) {
      feito['nome' + cap] = true; sub('inspetor', L.nomeErrado[cap]);
      if (cap === 5 && L.nomeErradoLia) { later(3200, () => { subP('lia', L.nomeErradoLia); conquista('nome_errado'); }); }
    }

    // ===== Troca de irmãos na caçada (caps 3-5) =====
    if (cacando() && (cap === 3 || cap === 4 || cap === 5) && !feito['troca' + cap] && L.trocaIrmaos && L.trocaIrmaos[cap]) {
      feito['troca' + cap] = true; sub('inspetor', L.trocaIrmaos[cap]);
    }

    // ===== Cap IV: ele dorme em pé (estado reza), murmúrios humanos; acordá-lo vira grunhido =====
    if (cap === 4) {
      sonoFalaCd -= d;
      const dormindo = est === 'reza';
      if (dormindo && distPM() < 6) {
        if (!feito['sono'] && L.sonolentoLia) { feito['sono'] = true; subP('lia', L.sonolentoLia); }
        if (sonoFalaCd <= 0 && L.sonolento && L.sonolento.length) { sonoFalaCd = 8 + Math.random() * 5; sub('inspetor', pick(L.sonolento)); }
      }
      if (sonoWas && !dormindo && (est === 'caca' || est === 'investiga' || est === 'procura') && !feito['acordou'] && distPM() < 10) {
        feito['acordou'] = true;
        if (L.acordouGrunhido) sub('inspetor', L.acordouGrunhido);
        if (L.acordouLia) later(2200, () => subP('lia', L.acordouLia));
      }
      sonoWas = dormindo;

      // ===== Cap IV: trégua falsa (uma vez, durante a caçada) =====
      if (cacando() && !feito['tregua'] && tCap > 10 && L.treguaFalsa) {
        feito['tregua'] = true;
        sub('inspetor', L.treguaFalsa);
        if (L.treguaLia) later(3400, () => subP('lia', L.treguaLia));
        if (L.treguaDicaMorte) later(6500, () => toast(L.treguaDicaMorte));
      }
    }

    // ===== Habituação às iscas (sabor na caçada longa; cada tipo no máx. uma vez por noite) =====
    if (cacando() && tCap > 1 && L.habituacao) {
      // cacaT aproximado: usamos o tempo desde o começo do capítulo não serve; usamos um contador próprio
      habT += d;
      if (habT > 12 && habCd <= 0) {
        const tipos = Object.keys(L.habituacao).filter(t => !iscaFeita[t]);
        if (tipos.length && Math.random() < d * .12) {
          const t = pick(tipos); iscaFeita[t] = true; habCd = 14;
          sub('inspetor', L.habituacao[t]);
        }
      }
    } else { habT = 0; }
    habCd -= d;

    // ===== Bilhete do terço (cap 3, no fluxo) =====
    if (cap === 3 && !feito['terco'] && tCap > 14 && L.tercoBilhete) {
      feito['terco'] = true;
      if (L.tercoLia) subP('lia', L.tercoLia);
      later(3000, () => toast(L.tercoBilhete));
    }

    // ===== Ocorrências da virada (caps 1, 3, 5) =====
    if ((cap === 1 || cap === 3 || cap === 5) && !feito['virada' + cap] && tCap > 16 && L.virada && L.virada[cap]) {
      feito['virada' + cap] = true;
      if (L.viradaLia && L.viradaLia[cap]) subP('lia', L.viradaLia[cap]);
      later(2800, () => toast(L.virada[cap]));
    }

    // ===== A venda que cai (caps 1, 3, 5), de perto com a lanterna =====
    if ((cap === 1 || cap === 3 || cap === 5) && !feito['venda' + cap] && distPM() < 7) {
      let luz = false; try { luz = !!St.flashOn; } catch (e) {}
      if (luz && L.venda && L.venda[cap]) { feito['venda' + cap] = true; subP('lia', L.venda[cap]); }
    }

    // ===== Chamado final pelo nome digitado (cap V) =====
    if (cap === 5 && nfChamado && !feito['nf5'] && L.nomeFinalChama) {
      feito['nf5'] = true;
      const nome = nomeOuLia();
      const fala = L.nomeFinalChama.split('{nome}').join(nome);
      sub('davi', fala);
      if (L.nomeFinalLia) later(3600, () => subP('lia', L.nomeFinalLia));
    }

    // ===== O Chamado ganha corpo: o vulto do Davi (cap V, uma vez) =====
    if (cap === 5 && !feito['daviVulto'] && tCap > 22 && !St.hidden && distPM() > 6 && L.daviVulto) {
      feito['daviVulto'] = true;
      subP('davi', L.daviVulto);
      if (L.daviVultoLia) later(3000, () => subP('lia', L.daviVultoLia));
    }

    // ===== Sílabas arrancadas pelo sino (durante a fuga) =====
    let stunNow = 0; try { stunNow = Number(c.M && c.M.l5stun) || 0; } catch (e) {}
    const naFuga = !!(St.flags && St.flags.sino);
    if (naFuga && stunNow > stunAnt + .05 && L.sinoSilabas) {
      if (silabaN < L.sinoSilabas.length) { sub('inspetor', L.sinoSilabas[silabaN]); silabaN++; }
      else if (!feito['sinoMudo'] && L.sinoMudo) { feito['sinoMudo'] = true; toast(L.sinoMudo); }
    }
    stunAnt = stunNow;

    // ===== Leitura do perigo: a Lia lê o estado do caçador (sentido, baixa frequência) =====
    leituraCd -= d;
    if (est !== estAnt) {
      if (leituraCd <= 0 && distPM() < 16 && L.leituraPerigo && L.leituraPerigo[est] && Math.random() < .5) {
        leituraCd = 26; subP('lia', L.leituraPerigo[est]);
      }
      estAnt = est;
    }

    // ===== Aparência do Inspetor piorando por capítulo (de perto, com a lanterna) =====
    if (cap >= 1 && cap <= 5 && !feito['apCap' + cap] && distPM() < 8 && (est === 'patrulha' || est === 'investiga' || est === 'reza') && tCap > 5) {
      let luz = false; try { luz = !!St.flashOn; } catch (e) {}
      if (luz && L.aparenciaCap && L.aparenciaCap[cap]) { feito['apCap' + cap] = true; subP('lia', L.aparenciaCap[cap]); }
    }

    // ===== "Achei" ao te avistar (rising edge pra caça), por capítulo =====
    const indoCacar = cacando();
    if (indoCacar && !caçavaAnt && !feito['achei' + cap] && L.achei && L.achei[cap]) {
      feito['achei' + cap] = true; sub('inspetor', L.achei[cap]);
      if (!feito['acheiLia'] && L.acheiLia) { feito['acheiLia'] = true; later(1600, () => subP('lia', L.acheiLia)); }
    }
    caçavaAnt = indoCacar;

    // ===== Mais falas humanas na reza (fora do Cap IV, que tem o sono) =====
    if (est === 'reza' && cap !== 4 && distPM() < 6 && L.rezaHumana2 && L.rezaHumana2.length) {
      rezaExtraCd -= d;
      if (rezaExtraCd <= 0) { rezaExtraCd = 12 + Math.random() * 6; sub('inspetor', pick(L.rezaHumana2)); }
    }

    // ===== A Menina de cabeça pra baixo / a fila que abre espaço =====
    if (!feito['anaSombra'] && L.anaSombra) { try { if (c.ANA && c.ANA.ativa && Math.random() < d * .05) { feito['anaSombra'] = true; subP('lia', L.anaSombra); } } catch (e) {} }
    if (!feito['procFila'] && L.procFileira) { try { if (c.PROC && c.PROC.fase && St.hidden && Math.random() < d * .06) { feito['procFila'] = true; subP('lia', L.procFileira); } } catch (e) {} }

    // ===== Sabor extra da caçada longa (pools da 2ª rodada), cadência própria =====
    if (cacando()) {
      extraCd -= d;
      if (habT > 14 && extraCd <= 0 && Math.random() < d * .1) {
        extraCd = 13;
        const cruel = St.dif === 'pesadelo' && L.pesadelo2 && Math.random() < .4;
        if (cruel) sub('inspetor', pick(L.pesadelo2));
        else if (Math.random() < .5 && L.cacaLonga2) sub('inspetor', pick(L.cacaLonga2));
        else if (L.aparencia2) subP('lia', pick(L.aparencia2));
        if (St.hidden && distPM() < 3 && L.pertoEscondida2 && Math.random() < .5) sub('inspetor', pick(L.pertoEscondida2));
      }
    } else {
      // ele desiste e volta pra ronda (resmungo novo)
      if (caçouAntes && !St.hidden && L.rondaVolta2 && Math.random() < .3) sub('inspetor', pick(L.rondaVolta2));
      extraCd = 0;
    }
    caçouAntes = cacando();
  }
  let habT = 0, habCd = 0, extraCd = 0;

  // ===== Tela de morte: anexos da ficha (depois da ficha base, para quem morre muito) =====
  let elExtra = null, extraN = 0;
  function montarMorte() {
    const dd = $('#death'); if (!dd || elExtra) return;
    elExtra = document.createElement('div');
    elExtra.id = 'l5b-anexo';
    elExtra.style.cssText = 'max-width:30em;margin:.5em auto 0;font-size:.74em;line-height:1.5;text-align:center;color:#7d7362;font-style:italic;opacity:.7;';
    const ficha = $('#l5-ficha');
    if (ficha && ficha.parentNode) ficha.parentNode.insertBefore(elExtra, ficha.nextSibling);
    else dd.appendChild(elExtra);
  }
  function aoMorrer() {
    const fe = conqs().ficha_moacir; // só mostra anexos depois da ficha inteira reunida
    if (!fe || !L.fichaExtra || !L.fichaExtra.length) return;
    montarMorte();
    if (elExtra) { elExtra.textContent = L.fichaExtra[extraN % L.fichaExtra.length]; extraN++; }
  }
  (function observarMorte() {
    const dd = $('#death');
    if (!dd) { setTimeout(observarMorte, 400); return; }
    let viz = !dd.hidden;
    try {
      const mo = new MutationObserver(() => { const agora = !dd.hidden; if (agora && !viz) aoMorrer(); viz = agora; });
      mo.observe(dd, { attributes: true, attributeFilter: ['hidden'] });
    } catch (e) {}
  })();

  // ===== Finais: epílogos secretos de mestria =====
  function extrasFinal(tipo) {
    let extra = '';
    if (tipo === 'comum' || tipo === 'silencio' || tipo === 'verdadeiro') {
      if (!cacouNoite && L.epilogoHumano) {
        const cq = conqs();
        if (tipo === 'verdadeiro' && cq.ms4_nome && L.epilogoMisericordia) {
          extra += L.epilogoMisericordia; conquista(L.epilogoMisericordiaConq);
        } else {
          extra += L.epilogoHumano; conquista(L.epilogoHumanoConq);
        }
      }
    }
    return extra;
  }

  return { tick, aoComecar, vozChamado, respondeu, extrasFinal };
}
