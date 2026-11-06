// INTERFACE — Lote 7 (2ª parte): mixer da casa, teste de fone e escuta, o que a Lia ouviu, silêncio como evento.
// Criado por src/interface-lote7.js (que recebe os ganchos de interface.js). Tudo opcional, à prova de erro e mudo no QA
// (navigator.webdriver): nada aqui cria osciladores, abre a tela de teste ou mexe em volume sozinho quando o kit roda.
export function criarInterfaceLote7b(C, U) {
  const $ = s => document.querySelector(s);
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const OPT = C.OPT;
  const semWD = !(navigator && navigator.webdriver);
  const esc = s => String(s).replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
  const tira = h => String(h).replace(/<[^>]*>/g, '').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');

  // ---------------------------------------------------------------- OPÇÕES
  const PAD7B = {
    vChuva: 1, vMus: 1, semTrilha: false, vizinho: false,
    legPoetica: false, legRelogio: false, legOnda: false, legAusencia: true, pausaOuvida: true, pausaClima: true, ruidoVU: false, fimBarras: true, l7Calib: false
  };
  for (const k in PAD7B) { if (OPT[k] === undefined) OPT[k] = PAD7B[k]; U.PAD[k] = PAD7B[k]; }
  const SN = [[false, 'Não'], [true, 'Sim']];
  U.GRUPOS.push(['Mixer da casa', [
    { k: 'vChuva', nome: 'Chuva (só a chuva, sem calar o resto)', tipo: 'range', min: 0, max: 1.5, step: .05 },
    { k: 'vMus', nome: 'Música de tensão', tipo: 'range', min: 0, max: 1.5, step: .05 },
    { k: 'semTrilha', nome: 'Sem trilha, só a casa (desliga a música de tensão: o perigo deixa de avisar por ela)', tipo: 'sel', ops: SN },
    { k: 'vizinho', nome: '☾ Modo vizinho: corta os picos a -9 dB para jogar de madrugada (o susto continua nítido)', tipo: 'sel', ops: SN }
  ]]);
  U.GRUPOS.push(['Mais pistas de som', [
    { k: 'legAusencia', nome: 'Legendar o que deixou de soar ([a chuva ficou lá fora], [silêncio])', tipo: 'sel', ops: SN },
    { k: 'legPoetica', nome: 'Legendas poéticas ("a chuva ganha um ritmo apressado") no lugar das secas', tipo: 'sel', ops: SN },
    { k: 'legRelogio', nome: 'Direção do som em horas de relógio (às 3h, às 9h, às 12h)', tipo: 'sel', ops: SN },
    { k: 'legOnda', nome: 'Desenho da onda do som na legenda (grave grosso, agudo fino, voz tremida)', tipo: 'sel', ops: SN },
    { k: 'ruidoVU', nome: 'Medidor de ruído em agulha de VU, no lugar do anel', tipo: 'sel', ops: SN },
    { k: 'pausaOuvida', nome: 'Na pausa, mostrar o que a Lia ouviu (últimos 8 sons)', tipo: 'sel', ops: SN },
    { k: 'pausaClima', nome: 'A pausa não cala a casa: chuva e batimento abafados', tipo: 'sel', ops: SN },
    { k: 'fimBarras', nome: 'Gráfico de ruído por sala no fim do capítulo e na morte', tipo: 'sel', ops: SN }
  ]]);

  // ---------------------------------------------------------------- ESTILO
  const style = document.createElement('style');
  style.textContent = `
  #l7-calib{z-index:60;background:radial-gradient(120% 100% at 50% 40%,#150f0e,#050404);text-align:center;padding:24px;overflow:auto}
  #l7-calib h2{font-family:"IM Fell English SC",Georgia,serif;letter-spacing:.16em;font-weight:normal;margin:0 0 10px}
  #l7-calib p{max-width:560px;line-height:1.55;opacity:.85;margin:6px auto}
  #l7-calib .leg{min-height:2.2em;font-family:"Special Elite",monospace;font-size:20px;color:#cdbfa0;margin:14px 0;opacity:0;transition:opacity .25s}
  #l7-calib .leg.on{opacity:1}
  #l7-calib .res{font-size:14px;color:var(--fraco,#999);min-height:2.6em}
  #l7-calib .lados{display:flex;gap:4px;justify-content:center;align-items:center;font-size:30px;letter-spacing:.2em;opacity:.8;margin:6px 0}
  #l7-calib .lados i{font-style:normal;opacity:.2;transition:opacity .2s,color .2s}
  #l7-calib .lados i.on{opacity:1;color:#c9a75a}
  #l7-calib .linha{display:flex;gap:8px;flex-wrap:wrap;justify-content:center;margin:8px 0}
  #l7-pausa{max-width:560px;width:90vw;margin:8px auto;font-size:14px;line-height:1.5;text-align:left}
  #l7-pausa h4,#l7-md h4,#l7-fc h4{font-family:"IM Fell English SC",Georgia,serif;letter-spacing:.12em;font-weight:normal;margin:10px 0 4px;color:var(--fraco,#999)}
  #l7-pausa ul,#l7-md ul{list-style:none;margin:0;padding:0}
  #l7-pausa li,#l7-md li{opacity:.88;padding:1px 0}
  #l7-pausa li small,#l7-md li small{opacity:.6}
  .l7-bar{display:flex;align-items:center;gap:8px;margin:2px 0;font-size:13px}
  .l7-bar .n{width:120px;text-align:right;opacity:.8;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .l7-bar .b{flex:1;height:9px;background:rgba(255,255,255,.07);border-radius:2px;overflow:hidden}
  .l7-bar .b i{display:block;height:100%}
  .l7-mins{display:flex;align-items:flex-end;gap:2px;height:46px;margin:4px 0}
  .l7-mins i{flex:1;min-width:3px;background:#7d8aa0;border-radius:1px 1px 0 0}
  #l7-fc,#l7-md{max-width:560px;width:90vw;margin:10px auto;text-align:left;font-size:14px}
  #l7-vu{position:absolute;left:20px;bottom:116px;width:96px;height:56px;pointer-events:none;opacity:.9}
  body.l7-vu #ruido{display:none!important}
  .l7-onda{display:inline-block;vertical-align:middle;margin-right:.4em;opacity:.8}
  .l7-mixbt{display:flex;gap:8px;flex-wrap:wrap;margin:6px 0 2px}
  #b-l7-fone{font-size:17px;opacity:.85}
  .l7-fone-dica{font-family:"Special Elite",monospace;font-size:13px;opacity:.55;margin-top:4px}
  `;
  (document.head || document.documentElement).appendChild(style);

  // ---------------------------------------------------------------- REGISTRO DE SONS (o que a Lia ouviu)
  const POET = {
    passoMonstro: 'o chão range sob algo pesado', estalo: 'uma língua estala no escuro', vidro: 'a noite se parte em cacos', pancada: 'a casa fecha a mão numa porta',
    risada: 'uma risada de menina escorre pela parede', contagem: 'uma voz miúda conta devagar, como quem espera', chamadoVoz: 'seu nome, dito por quem não deveria saber',
    sino: 'o bronze acorda o prédio', sinoLonge: 'um sino respira longe', badaladas: 'nove vezes, o prédio prende o ar', estatica: 'o rádio arranha o silêncio',
    canto: 'crianças cantam baixo, bem baixo', procissao: 'dezenas de pés descalços lambem o piso', sussurros: 'as paredes sussurram, todas ao mesmo tempo',
    orelhao: 'um telefone chama quem já não atende', trovao: 'o céu rosna por cima do telhado', coracao: 'o peito bate na garganta', ofego: 'o ar entra raspando',
    rangido: 'a madeira conta um segredo', cano: 'os canos batem, como nós de dedos'
  };
  const TIMBRE = { // 0 = grave, 1 = médio, 2 = agudo, 3 = voz (tremida)
    passoMonstro: 0, pancada: 0, trovao: 0, coracao: 0, procissao: 0, sino: 0, badaladas: 0, cano: 0, ofego: 1, rangido: 1, sinoLonge: 1,
    contagem: 3, chamadoVoz: 3, canto: 3, sussurros: 3, risada: 3, estalo: 2, vidro: 2, orelhao: 2, estatica: 2
  };
  const registro = []; // { t, txt, a, d, cat, k }
  let agora = 0;
  function horaRelogio(a) { const h = Math.round(a / 30) % 12; return (h <= 0 ? h + 12 : h) + 'h'; }
  function nomeDir(a) { return Math.abs(a) < 35 ? 'à frente' : Math.abs(a) > 140 ? 'atrás' : a > 0 ? 'à direita' : 'à esquerda'; }
  function ondaSVG(tipo) {
    const w = 38, h = 12, f = [1.4, 3, 7, 5][tipo] ?? 3, amp = [5, 3.5, 2.2, 3.2][tipo] ?? 3, sw = [2.6, 1.6, .9, 1.3][tipo] ?? 1.5;
    let d = '';
    for (let i = 0; i <= 38; i++) { const x = i, ruido = tipo === 3 ? Math.sin(i * 2.1) * .9 : 0; const y = h / 2 + Math.sin(i / 38 * Math.PI * 2 * f) * (amp + ruido); d += (i ? 'L' : 'M') + x + ' ' + y.toFixed(1); }
    return `<svg class="l7-onda" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" aria-hidden="true"><path d="${d}" fill="none" stroke="currentColor" stroke-width="${sw}" stroke-linecap="round"/></svg>`;
  }
  // chamado por interface-lote7.js em cada som legendado, antes dos enfeites
  function evento(k, def, dr, a, line) {
    const plano = line ? tira(line.txt) : (def && def.t) || k;
    registro.push({ t: agora, txt: plano.replace(/^[▲✦✶›\s]+/, '').replace(/^\[|\]$/g, ''), a: dr ? dr.a : null, d: dr ? dr.d : null, cat: def && def.cat, k });
    while (registro.length > 40) registro.shift();
    if (!line) return;
    try {
      if (OPT.legPoetica && POET[k]) {
        const pre = (String(line.txt).match(/^[^[]*/) || [''])[0];
        line.txt = `${pre}[${POET[k]}${dr && dr.d < 40 ? ', ' + dr.txt : ''}]`;
      }
      if (OPT.legRelogio && dr && dr.d < 40) line.txt = `${line.txt} <small style="opacity:.7">· às ${horaRelogio(dr.a)}</small>`;
      if (OPT.legOnda && TIMBRE[k] !== undefined) line.txt = ondaSVG(TIMBRE[k]) + line.txt;
    } catch (e) {}
  }
  function legendaAvulsa(txt, cat) {
    registro.push({ t: agora, txt: tira(txt).replace(/^[▲✦✶›\s]+/, '').replace(/^\[|\]$/g, ''), a: null, d: null, cat, k: null });
    while (registro.length > 40) registro.shift();
  }

  // ---------------------------------------------------------------- RUÍDO POR SALA E POR MINUTO
  let ruSala = {}, ruMin = [], ruTotal = 0, tCap = 0, capRu = -1, picoSala = null;
  function zerarRuido() { ruSala = {}; ruMin = []; ruTotal = 0; tCap = 0; picoSala = null; }
  function nomeSala(r) { return r ? (r.nome || r.id || (r.fora ? 'do lado de fora' : 'corredor')) : 'corredor'; }
  function medirRuido(dt) {
    const S = C.S, P = C.P; if (!S || !P) return;
    if (S.chapter !== capRu) { capRu = S.chapter; zerarRuido(); }
    tCap += dt;
    const v = (P.noiseR || 0) * dt; if (v <= 0) return;
    const n = nomeSala(P.room);
    ruSala[n] = (ruSala[n] || 0) + v; ruTotal += v;
    const m = Math.floor(tCap / 60); ruMin[m] = (ruMin[m] || 0) + v;
    if (!picoSala || ruSala[n] > ruSala[picoSala]) picoSala = n;
  }
  const mediaRuido = () => ruTotal / Math.max(.5, tCap / 60); // ruído médio por minuto
  function rankRuido() {
    const m = mediaRuido();
    return m < 90 ? 'Silêncio de Monge' : m < 260 ? 'Pés de Gato' : m < 520 ? 'Passos de Gente' : 'Estrondo';
  }
  function corBarra(f) { const r = Math.round(90 + 110 * f), g = Math.round(150 - 90 * f), b = Math.round(80 - 30 * f); return `rgb(${r},${g},${b})`; }
  function barrasSalas(n = 6) {
    const lista = Object.entries(ruSala).sort((a, b) => b[1] - a[1]).slice(0, n);
    if (!lista.length) return '<div class="l7-bar"><span class="n">—</span><span style="opacity:.6">nenhum ruído medido</span></div>';
    const max = lista[0][1];
    return lista.map(([nome, v], i) => `<div class="l7-bar"><span class="n">${esc(nome)}</span><span class="b"><i style="width:${(v / max * 100).toFixed(0)}%;background:${corBarra(v / max)}"></i></span><span style="opacity:.6;width:1.4em">${i === 0 ? '▲' : ''}</span></div>`).join('');
  }

  // ---------------------------------------------------------------- GANCHOS DE TELA: FIM DE CAPÍTULO, MORTE, PAUSA
  const RECORDE = 'hora-l7-silencio';
  function fimCap(c) {
    if (!OPT.fimBarras) return;
    const alvo = $('#fimcap'); if (!alvo) return;
    let box = $('#l7-fc'); if (!box) { box = document.createElement('div'); box.id = 'l7-fc'; const ref = $('#fc-gancho') || $('#fc-pular'); if (ref) ref.before(box); else alvo.appendChild(box); }
    const rank = rankRuido(), m = Math.round(mediaRuido());
    let rec = {}; try { rec = C.lsGet(RECORDE, {}) || {}; } catch (e) {}
    const cap = C.S ? C.S.chapter : 0, ant = rec[cap];
    let linhaRec = '';
    if (ruTotal > 0 || tCap > 20) {
      if (ant === undefined || m < ant) { rec[cap] = m; try { C.lsSet(RECORDE, rec); } catch (e) {} linhaRec = ant === undefined ? 'Primeiro registro de ruído deste capítulo.' : `Novo recorde de silêncio: ${m} (antes ${ant}).`; }
      else linhaRec = `Seu recorde de silêncio neste capítulo: ${ant}. Menos é melhor.`;
    }
    box.innerHTML = `<h4>O barulho da sua noite</h4><div style="color:#c9a75a;letter-spacing:.1em">${rank}</div>${barrasSalas(6)}<div style="font-size:13px;opacity:.7;margin-top:4px">${picoSala ? `Onde você mais fez barulho: ${esc(picoSala)}. ` : ''}${linhaRec}</div>`;
  }
  function textoRelativo(e) { const s = Math.round(agora - e.t); const dir = e.a !== null ? (nomeDir(e.a) + ', às ' + horaRelogio(e.a)) : ''; return { s, dir }; }
  let ultMorte = [];
  function morte() {
    const alvo = $('#death'); if (!alvo) return;
    let box = $('#l7-md'); if (!box) { box = document.createElement('div'); box.id = 'l7-md'; const ref = $('#death-dica'); if (ref) ref.after(box); else alvo.appendChild(box); }
    const rec = registro.filter(e => agora - e.t <= 10);
    ultMorte = rec.slice();
    let h = '<h4>O que você ouviu antes de cair (10 s)</h4>';
    if (!rec.length) h += '<div style="opacity:.7">Nenhum som foi legendado nesses 10 segundos. Ele chegou calado, ou você não estava prestando atenção na casa.</div>';
    else h += '<ul>' + rec.map(e => { const r = textoRelativo(e); return `<li><small>-${r.s}s</small> ${esc(e.txt)}${r.dir ? ` <small>· ${r.dir}</small>` : ''}</li>`; }).join('') + '</ul>';
    if (rec.some(e => e.k)) h += '<div class="linha" style="display:flex;gap:8px;margin-top:6px"><button type="button" class="btn" id="l7-reouvir" style="font-size:16px">Ouvir de novo (sem direção)</button></div>';
    if (OPT.fimBarras && ruTotal > 0) h += `<h4>Onde você fez barulho</h4>${barrasSalas(4)}`;
    box.innerHTML = h;
    const bt = $('#l7-reouvir'); if (bt) bt.onclick = () => { // reproduz a sequência dos últimos sons com os intervalos reais (no máximo 10 s)
      try { C.iniciarAudio && C.iniciarAudio(); } catch (e) {}
      const t0 = ultMorte[0].t;
      ultMorte.forEach(e => { if (e.k) setTimeout(() => { try { C.SFX[e.k] && C.SFX[e.k](); } catch (er) {} try { C.toast && C.toast(e.txt); } catch (er) {} }, (e.t - t0) * 1000); });
    };
  }
  function pausa() {
    const alvo = $('#pause'); if (!alvo) return;
    let box = $('#l7-pausa'); if (!box) { box = document.createElement('div'); box.id = 'l7-pausa'; const ref = $('#l6-pausa'); if (ref) ref.after(box); else alvo.prepend(box); }
    let h = '';
    if (OPT.pausaOuvida) {
      const ult = registro.slice(-8).reverse();
      h += '<h4>O que a Lia ouviu</h4>';
      h += ult.length ? '<ul>' + ult.map(e => { const r = textoRelativo(e); return `<li><small>há ${r.s} s</small> ${esc(e.txt)}${r.dir ? ` <small>· ${r.dir}</small>` : ''}</li>`; }).join('') + '</ul>' : '<div style="opacity:.6">Ainda nada. A casa está quieta, e isso também conta.</div>';
    }
    if (OPT.fimBarras && ruMin.length) {
      const max = Math.max(...ruMin.map(v => v || 0), 1);
      h += `<h4>Seu ruído, minuto a minuto</h4><div class="l7-mins">${ruMin.map(v => `<i title="${Math.round(v || 0)}" style="height:${Math.max(2, ((v || 0) / max) * 100).toFixed(0)}%;background:${corBarra((v || 0) / max)}"></i>`).join('')}</div>`;
    }
    box.innerHTML = h;
  }

  // ---------------------------------------------------------------- PAUSA QUE NÃO CALA A CASA
  let pausaNos = null, pausaBat = 0, estavaPausa = false;
  function pausaClima(dt, naPausa) {
    if (!semWD || !OPT.pausaClima) { if (pausaNos) pararPausa(); estavaPausa = naPausa; return; }
    const AC = C.AC; if (!AC || !C.master) return;
    if (naPausa) {
      if (!pausaNos) {
        try {
          const b = AC.createBuffer(1, AC.sampleRate * 2, AC.sampleRate), d = b.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
          const src = AC.createBufferSource(); src.buffer = b; src.loop = true; const lp = AC.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 520;
          const g = AC.createGain(); g.gain.value = 0; src.connect(lp); lp.connect(g); g.connect(C.master); src.start();
          g.gain.setTargetAtTime(.05, AC.currentTime, .4); pausaNos = { src, g };
        } catch (e) { pausaNos = null; }
      }
      pausaBat -= dt;
      if (pausaBat <= 0 && pausaNos) { pausaBat = 1.35; try { const t = AC.currentTime, o = AC.createOscillator(), g = AC.createGain(); o.type = 'sine'; o.frequency.setValueAtTime(62, t); o.frequency.exponentialRampToValueAtTime(40, t + .18); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.07, t + .02); g.gain.exponentialRampToValueAtTime(.0001, t + .26); o.connect(g); g.connect(C.master); o.start(t); o.stop(t + .3); } catch (e) {} }
    } else {
      if (pausaNos) pararPausa();
      if (estavaPausa) setTimeout(rangidoPorta, 700); // ao voltar, um estalo de porta ao fundo
    }
    estavaPausa = naPausa;
  }
  function pararPausa() { try { const t = C.AC.currentTime; pausaNos.g.gain.setTargetAtTime(0, t, .15); const s = pausaNos.src; setTimeout(() => { try { s.stop(); } catch (e) {} }, 700); } catch (e) {} pausaNos = null; }
  function rangidoPorta() {
    const AC = C.AC; if (!AC || !C.master || !semWD || C.ui === 'pausa') return;
    try {
      const t = AC.currentTime, o = AC.createOscillator(), f = AC.createBiquadFilter(), g = AC.createGain();
      o.type = 'sawtooth'; o.frequency.setValueAtTime(92, t); o.frequency.linearRampToValueAtTime(148, t + .5); f.type = 'bandpass'; f.frequency.value = 520; f.Q.value = 5;
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.02, t + .08); g.gain.linearRampToValueAtTime(0, t + .55); o.connect(f); f.connect(g); g.connect(C.master); o.start(t); o.stop(t + .6);
    } catch (e) {}
  }

  // ---------------------------------------------------------------- MEDIDOR VU (agulha)
  const vu = document.createElement('canvas'); vu.id = 'l7-vu'; vu.width = 192; vu.height = 112; vu.hidden = true;
  const hud = $('#hud'); if (hud) hud.appendChild(vu);
  const vuG = vu.getContext && vu.getContext('2d');
  let vuAng = 0, vuVel = 0, vuLig = false;
  function medidorVU(dt, jogo) {
    const lig = !!(OPT.ruidoVU && jogo);
    if (lig !== vuLig) { vuLig = lig; document.body.classList.toggle('l7-vu', lig); vu.hidden = !lig; }
    if (!lig || !vuG) return;
    const P = C.P, alvo = clamp(Math.log1p(P.noiseR || 0) / Math.log1p(20), 0, 1);
    // mola com um pouco de quique: a agulha passa do alvo e volta, como num toca-fitas
    vuVel += ((alvo - vuAng) * 90 - vuVel * 9) * dt; vuAng = clamp(vuAng + vuVel * dt, 0, 1.08);
    const g = vuG, w = vu.width, h = vu.height; g.clearRect(0, 0, w, h);
    g.fillStyle = 'rgba(14,10,8,.7)'; g.fillRect(0, 0, w, h);
    const cx = w / 2, cy = h - 14, r = 78;
    g.lineWidth = 3;
    for (let i = 0; i <= 20; i++) { const a = (-50 + i * 5) * Math.PI / 180 - Math.PI / 2, f = i / 20; g.strokeStyle = f > .72 ? '#c0392b' : '#b9ad92'; g.beginPath(); g.moveTo(cx + Math.cos(a) * (r - (i % 5 ? 4 : 9)), cy + Math.sin(a) * (r - (i % 5 ? 4 : 9))); g.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r); g.lineWidth = i % 5 ? 1 : 2; g.stroke(); }
    const aa = (-50 + vuAng * 100) * Math.PI / 180 - Math.PI / 2;
    g.strokeStyle = vuAng > .72 ? '#e0533f' : '#e8dcc0'; g.lineWidth = 2; g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + Math.cos(aa) * (r - 6), cy + Math.sin(aa) * (r - 6)); g.stroke();
    g.fillStyle = '#e8dcc0'; g.beginPath(); g.arc(cx, cy, 4, 0, 7); g.fill();
    g.fillStyle = 'rgba(210,200,180,.6)'; g.font = '11px "Special Elite",monospace'; g.fillText('RUÍDO', 8, h - 4);
  }

  // ---------------------------------------------------------------- LEGENDAS DE AUSÊNCIA E SILÊNCIO
  let foraAnt = null, silNivel = 0, silT = -99;
  function leg(t, c) { try { if (OPT.legSom !== 'nao' && OPT.legAusencia) U.legenda('[' + t + ']', c); } catch (e) {} }
  function ausencia(P) {
    if (!P || !P.room) return;
    const fora = !!P.room.fora;
    if (foraAnt !== null && fora !== foraAnt && agora - silT > 2) {
      silT = agora;
      leg(fora ? 'a chuva volta a bater em você' : 'a chuva ficou do lado de fora', 'h');
    }
    foraAnt = fora;
  }
  function silencio(forca, tens) { // chamado pelo lote 7 com a força do silêncio (0 a 1) e a tensão do momento
    if (!OPT.legAusencia) { silNivel = 0; return; }
    if (forca < .2) { silNivel = 0; return; }
    if (silNivel < 1 && forca >= .35) { silNivel = 1; leg('silêncio', 'h'); }
    else if (silNivel < 2 && forca >= .75) { silNivel = 2; leg(tens > .25 ? 'silêncio: não é o de sempre' : 'o silêncio engrossa', tens > .25 ? 'p' : 'h'); }
  }

  // ---------------------------------------------------------------- TESTE DE FONE E ESCUTA
  const cal = document.createElement('div'); cal.id = 'l7-calib'; cal.className = 'screen'; cal.hidden = true;
  document.body.appendChild(cal);
  let calCb = null, calPasso = 0, calToca = 0;
  const wait = ms => new Promise(r => setTimeout(r, ms));
  function ctx() { try { C.iniciarAudio && C.iniciarAudio(); } catch (e) {} return C.AC; }
  function ruidoBuf(AC, s = 1) { const b = AC.createBuffer(1, Math.floor(AC.sampleRate * s), AC.sampleRate), d = b.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; return b; }
  // um passo curto (grave seco) ou um sussurro (ruído filtrado), com pan -1..1 ou posição 3D (atrás)
  function tocarAmostra(tipo, lado, ganho) {
    const AC = ctx(); if (!AC || !C.master) return;
    const t = AC.currentTime, g = AC.createGain(); g.gain.value = 0;
    let saida = g;
    try {
      if (tipo === 'atras') { const p = AC.createPanner(); p.panningModel = 'HRTF'; p.distanceModel = 'inverse'; p.refDistance = 1; p.positionX.value = 0; p.positionY.value = 0; p.positionZ.value = 1.6; g.connect(p); p.connect(C.master); saida = null; }
      else { const p = AC.createStereoPanner(); p.pan.value = lado; g.connect(p); p.connect(C.master); saida = null; }
    } catch (e) { g.connect(C.master); }
    if (tipo === 'passo' || tipo === 'atras') {
      const o = AC.createOscillator(); o.type = 'triangle'; o.frequency.setValueAtTime(tipo === 'passo' ? 120 : 80, t); o.frequency.exponentialRampToValueAtTime(48, t + .14);
      const n = AC.createBufferSource(); n.buffer = ruidoBuf(AC, .3); const nf = AC.createBiquadFilter(); nf.type = 'lowpass'; nf.frequency.value = 600; n.connect(nf); nf.connect(g);
      o.connect(g); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(ganho, t + .01); g.gain.exponentialRampToValueAtTime(.0001, t + .3);
      o.start(t); o.stop(t + .35); n.start(t); n.stop(t + .25);
    } else if (tipo === 'sussurro') {
      const n = AC.createBufferSource(); n.buffer = ruidoBuf(AC, 1.4); const bp = AC.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 2400; bp.Q.value = 1.4; n.connect(bp); bp.connect(g);
      const lfo = AC.createOscillator(); lfo.frequency.value = 5; const lg = AC.createGain(); lg.gain.value = ganho * .5; lfo.connect(lg); lg.connect(g.gain);
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(ganho, t + .25); g.gain.linearRampToValueAtTime(0, t + 1.3);
      n.start(t); n.stop(t + 1.4); lfo.start(t); lfo.stop(t + 1.4);
    } else if (tipo === 'tom') {
      const o = AC.createOscillator(); o.type = 'sine'; o.frequency.value = 440; o.connect(g);
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(ganho, t + .05); g.gain.setValueAtTime(ganho, t + .55); g.gain.linearRampToValueAtTime(0, t + .65);
      o.start(t); o.stop(t + .7);
    }
  }
  function mostra(h) { cal.innerHTML = h; try { U.focar('#l7-calib'); } catch (e) {} }
  function fechaCal(ok) {
    cal.hidden = true; OPT.l7Calib = true; try { C.salvarOpt && C.salvarOpt(); } catch (e) {}
    const cb = calCb; calCb = null; if (cb) cb(ok);
  }
  function passoFone() {
    calPasso = 1;
    mostra(`<h2>Escute a casa</h2>
      <p>O medo deste jogo vem pelos ouvidos. Coloque os fones e ajuste o volume do computador para um nível confortável.</p>
      <div class="lados" aria-hidden="true"><i id="l7c-e">‹ ‹</i><i id="l7c-t">⌄</i><i id="l7c-d">› ›</i></div>
      <div class="leg" id="l7c-leg" role="status" aria-live="polite"></div>
      <div class="linha"><button class="btn" id="l7c-tocar">Tocar o teste (passo, sussurro, som atrás)</button></div>
      <div class="res" id="l7c-res">Vai tocar um passo à esquerda, um sussurro à direita e uma batida atrás de você.</div>
      <div class="linha" id="l7c-resp" hidden>
        <button class="btn" id="l7c-fone">Ouvi cada som de um lado: estou de fones</button>
        <button class="btn" id="l7c-caixa">Tudo no meio, ou só de uma caixa</button>
        <button class="btn" id="l7c-nada">Não ouvi nada</button>
      </div>
      <div class="linha"><button class="btn" id="l7c-pular" style="font-size:15px;opacity:.7">Pular o teste</button></div>`);
    $('#l7c-pular').onclick = () => fechaCal(false);
    $('#l7c-tocar').onclick = async () => {
      const ordem = [['passo', -1, 'l7c-e', '‹ um passo, à sua esquerda', .5], ['sussurro', 1, 'l7c-d', 'um sussurro, à sua direita ›', .09], ['atras', 0, 'l7c-t', '⌄ uma batida, atrás de você', .6]];
      const toque = ++calToca; $('#l7c-resp').hidden = true;
      for (const [tipo, lado, id, texto, gan] of ordem) {
        if (toque !== calToca || cal.hidden) return;
        const el = $('#' + id), lg = $('#l7c-leg'); if (el) el.classList.add('on'); if (lg) { lg.textContent = texto; lg.classList.add('on'); }
        tocarAmostra(tipo, lado, gan); await wait(tipo === 'sussurro' ? 1700 : 1000);
        if (el) el.classList.remove('on'); if (lg) lg.classList.remove('on'); await wait(350);
      }
      if (toque === calToca && !cal.hidden) { $('#l7c-resp').hidden = false; $('#l7c-res').textContent = 'Você ouviu cada um num lado diferente?'; U.focar('#l7-calib'); }
    };
    $('#l7c-fone').onclick = () => { OPT.saidaSom = 'normal'; OPT.mono = 0; aplicarAudio(); passoEscuta('Áudio 3D de fones ligado: os sons vêm de onde estão.'); };
    $('#l7c-caixa').onclick = () => { OPT.saidaSom = 'notebook'; OPT.legDirecao = true; OPT.anelSom = OPT.anelSom === 'nao' ? 'perigo' : OPT.anelSom; OPT.legSom = OPT.legSom === 'nao' ? 'importantes' : OPT.legSom; aplicarAudio(); passoEscuta('Modo alto-falante: o som fica mais cheio e as legendas passam a dizer a direção (‹ ›) e a mostrar o anel na borda.'); };
    $('#l7c-nada').onclick = () => { OPT.vol = Math.min(1, (+OPT.vol || .8) + .2); try { C.setOpt && C.setOpt('vol', OPT.vol); } catch (e) {} $('#l7c-res').textContent = 'O volume subiu um pouco. Toque o teste de novo e confira o volume do computador.'; $('#l7c-resp').hidden = true; };
    cal.hidden = false; try { U.focar('#l7-calib'); } catch (e) {}
  }
  function aplicarAudio() { try { C.salvarOpt && C.salvarOpt(); } catch (e) {} try { C.aplicarPerfil && C.aplicarPerfil(); C.aplicarVolumes && C.aplicarVolumes(); } catch (e) {} }
  function passoEscuta(resumo) {
    calPasso = 2; calToca++;
    mostra(`<h2>Até onde você ouve?</h2>
      <p>Vão tocar três tons, cada um mais baixo que o anterior, e depois um sussurro quase inaudível. Diga até onde você escutou. Isso ajusta o volume e a margem dos sussurros que importam.</p>
      <div class="lados" aria-hidden="true"><i id="l7c-1">1</i><i id="l7c-2">2</i><i id="l7c-3">3</i><i id="l7c-4">…</i></div>
      <div class="linha"><button class="btn" id="l7c-tocar">Tocar tons e sussurro</button></div>
      <div class="res" id="l7c-res">${esc(resumo || '')}</div>
      <div class="linha" id="l7c-resp" hidden>
        <button class="btn" id="l7c-r0">Nenhum</button><button class="btn" id="l7c-r1">Só o 1º</button><button class="btn" id="l7c-r2">Até o 2º</button><button class="btn" id="l7c-r3">Os 3 tons</button><button class="btn" id="l7c-r4">Os 3 e o sussurro</button>
      </div>
      <div class="linha"><button class="btn" id="l7c-pular" style="font-size:15px;opacity:.7">Pular</button></div>`);
    $('#l7c-pular').onclick = () => fechaCal(false);
    $('#l7c-tocar').onclick = async () => {
      const toque = ++calToca; $('#l7c-resp').hidden = true;
      const seq = [['tom', .12, 'l7c-1'], ['tom', .03, 'l7c-2'], ['tom', .008, 'l7c-3'], ['sussurro', .006, 'l7c-4']];
      for (const [tipo, gan, id] of seq) {
        if (toque !== calToca || cal.hidden) return;
        const el = $('#' + id); if (el) el.classList.add('on');
        tocarAmostra(tipo, 0, gan); await wait(tipo === 'tom' ? 1050 : 1700); if (el) el.classList.remove('on'); await wait(250);
      }
      if (toque === calToca && !cal.hidden) { $('#l7c-resp').hidden = false; $('#l7c-res').textContent = 'Até onde você ouviu?'; U.focar('#l7-calib'); }
    };
    const resp = n => {
      const vol0 = +OPT.vol || .8;
      if (n === 0) { OPT.vol = Math.min(1, vol0 + .25); try { C.setOpt('vol', OPT.vol); } catch (e) {} $('#l7c-res').textContent = 'Volume aumentado. Toque de novo; se ainda assim nada soar, confira o volume do computador.'; $('#l7c-resp').hidden = true; return; }
      let msg;
      if (n === 1) { OPT.vol = Math.max(vol0, .95); OPT.faixa = 'baixo'; OPT.vVoz = 1.4; msg = 'Escuta curta: volume no alto, faixa "Fone baixo" (tudo nivelado) e sussurros mais fortes.'; }
      else if (n === 2) { OPT.vol = Math.max(vol0, .85); OPT.faixa = 'noite'; OPT.vVoz = 1.25; msg = 'Escuta média: faixa "Noite" (gritos contidos, passos e sussurros mais claros).'; }
      else if (n === 3) { OPT.vVoz = Math.max(OPT.vVoz || 1, 1.1); msg = 'Boa escuta: a mixagem de cinema fica como está, com os sussurros um pouco acima.'; }
      else { msg = 'Ouvido afiado: a mixagem de cinema fica como está.'; }
      try { C.setOpt('vol', OPT.vol); } catch (e) {} aplicarAudio();
      passoFim(msg);
    };
    for (let i = 0; i <= 4; i++) { const b = $('#l7c-r' + i); if (b) b.onclick = () => resp(i); }
  }
  function passoFim(msg) {
    calPasso = 3; calToca++;
    mostra(`<h2>Pronto</h2><p>${esc(msg)}</p><p>Tudo isso fica nas Opções, no grupo Som, e você pode refazer o teste quando quiser, pelo título.</p>
      <div class="linha"><button class="btn" id="l7c-ok">Seguir</button><button class="btn" id="l7c-de-novo" style="font-size:15px;opacity:.7">Refazer</button></div>`);
    $('#l7c-ok').onclick = () => fechaCal(true);
    $('#l7c-de-novo').onclick = () => passoFone();
  }
  function abrirCalibracao(cb) { calCb = cb || null; passoFone(); }
  // antes do primeiro jogo: só uma vez, nunca no QA, e só se a pessoa não pulou
  function antesDeJogar(cb) {
    if (!semWD || OPT.l7Calib || window.__teste) return cb();
    abrirCalibracao(() => cb());
  }

  // ---------------------------------------------------------------- BOTÕES: título e opções
  function titulo() {
    const menu = $('#title .menu'); if (!menu || $('#b-l7-fone')) return;
    const b = document.createElement('button'); b.className = 'btn'; b.id = 'b-l7-fone'; b.textContent = 'Teste de fone e escuta';
    const ref = $('#b-opc'); if (ref) ref.after(b); else menu.appendChild(b);
    b.onclick = () => { $('#title').hidden = true; abrirCalibracao(() => { $('#title').hidden = false; try { U.focar('#title'); } catch (e) {} }); };
    const d = document.createElement('div'); d.className = 'l7-fone-dica'; d.textContent = 'Jogue de fones, no escuro. Em caixa de som, as legendas com direção ajudam.';
    menu.after(d);
  }
  // amostras do mixer: passam pelo barramento certo, então o controle de cada canal vale para o teste
  function amostra(canal) {
    const AC = ctx(); if (!AC || !C.AUD || !C.BUS) return;
    const t = AC.currentTime;
    const dest = canal === 'chuva' ? C.AUD.chuvaG : canal === 'musica' ? C.AUD.musG : canal === 'voz' ? C.BUS.voz : C.BUS.amb;
    if (!dest) return;
    const g = AC.createGain(); g.gain.value = 0; g.connect(dest);
    if (canal === 'chuva') { const n = AC.createBufferSource(); n.buffer = ruidoBuf(AC, 2); const lp = AC.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 2800; n.connect(lp); lp.connect(g); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.35, t + .3); g.gain.linearRampToValueAtTime(0, t + 1.8); n.start(t); n.stop(t + 2); }
    else if (canal === 'musica') { const f = AC.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 1100; f.Q.value = 1.5; f.connect(g); for (const fr of [220, 233.1, 246.9, 329.6]) { const o = AC.createOscillator(); o.type = 'sawtooth'; o.frequency.value = fr; o.connect(f); o.start(t); o.stop(t + 2); } g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.18, t + .5); g.gain.linearRampToValueAtTime(0, t + 1.9); }
    else if (canal === 'voz') { const n = AC.createBufferSource(); n.buffer = ruidoBuf(AC, 1.6); const bp = AC.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 1800; bp.Q.value = 2; n.connect(bp); bp.connect(g); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.12, t + .3); g.gain.linearRampToValueAtTime(0, t + 1.5); n.start(t); n.stop(t + 1.6); }
    else { const lp = AC.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 180; lp.connect(g); for (const fr of [41, 41.6, 61.8]) { const o = AC.createOscillator(); o.type = 'sawtooth'; o.frequency.value = fr; o.connect(lp); o.start(t); o.stop(t + 2); } g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.3, t + .4); g.gain.linearRampToValueAtTime(0, t + 1.9); }
  }
  const PRESETS = {
    Cinema: { vChuva: 1, vMus: 1.15, vAmb: 1, vEnt: 1, vVoz: 1, vSusto: 1.1, semTrilha: false, vizinho: false },
    Fone: { vChuva: .9, vMus: .85, vAmb: 1, vEnt: 1, vVoz: 1.1, vSusto: .9, semTrilha: false, vizinho: false },
    'Caçador': { vChuva: .5, vMus: .45, vAmb: .8, vEnt: 1.35, vVoz: 1.2, vSusto: 1, semTrilha: false, vizinho: false },
    Cru: { vChuva: 1, vMus: .3, vAmb: .9, vEnt: 1, vVoz: 1, vSusto: .85, semTrilha: false, vizinho: false }
  };
  function opcoes(box) {
    const alvo = [...box.querySelectorAll('h3')].find(h => h.textContent === 'Mixer da casa'); if (!alvo || box.querySelector('.l7-mixbt')) return;
    const div = document.createElement('div'); div.className = 'l7-mixbt';
    div.innerHTML = Object.keys(PRESETS).map(n => `<button type="button" class="btn" data-pre="${n}" style="font-size:16px">${n}</button>`).join('')
      + ['chuva', 'ambiencia', 'musica', 'voz'].map(c => `<button type="button" class="btn" data-teste="${c}" style="font-size:16px;opacity:.85">Testar ${c === 'ambiencia' ? 'ambiência' : c === 'musica' ? 'música' : c === 'voz' ? 'vozes' : 'chuva'}</button>`).join('')
      + '<button type="button" class="btn" id="l7-refaz" style="font-size:16px">Teste de fone e escuta</button>';
    let ultimo = alvo, ref = alvo.nextElementSibling; while (ref && ref.tagName !== 'H3') { ultimo = ref; ref = ref.nextElementSibling; }
    ultimo.after(div);
    div.querySelectorAll('[data-pre]').forEach(b => b.onclick = () => {
      const p = PRESETS[b.dataset.pre]; for (const k in p) OPT[k] = p[k];
      aplicarAudio();
      box.querySelectorAll('[data-k]').forEach(el => { const k = el.dataset.k; if (k in p) { el.value = String(p[k]); const em = el.nextElementSibling; if (em && em.tagName === 'EM') em.textContent = (+p[k]).toFixed(2); } });
      for (const k of ['vAmb', 'vEnt', 'vVoz', 'vSusto']) for (const pf of ['o', 'p']) { const el = $(`#${pf}-${k}`); if (el) el.value = OPT[k]; const o2 = $(`#${pf}-${k}-v`); if (o2) o2.textContent = Math.round(OPT[k] * 100) + '%'; }
      try { C.toast && C.toast('Mixagem "' + b.dataset.pre + '" aplicada. Ajuste fino logo abaixo.'); } catch (e) {}
    });
    div.querySelectorAll('[data-teste]').forEach(b => b.onclick = () => { try { amostra(b.dataset.teste); } catch (e) {} });
    $('#l7-refaz').onclick = () => { try { const op = $('#opcoes'); if (op) op.hidden = true; } catch (e) {} abrirCalibracao(() => { try { const op = $('#opcoes'); if (op) op.hidden = false; U.focar('#opcoes'); } catch (e) {} }); };
  }
  function aplicar() { try { C.aplicarPerfil && C.aplicarPerfil(); C.aplicarVolumes && C.aplicarVolumes(); } catch (e) {} }

  // ---------------------------------------------------------------- QUADRO A QUADRO (chamado pelo lote 7 a cada quadro)
  function frame(dt, ativo, jogo) {
    agora += dt;
    try { medidorVU(dt, jogo && ativo && !C.ui); } catch (e) {}
    try { pausaClima(dt, C.ui === 'pausa'); } catch (e) {}
    if (jogo && ativo && !C.ui) { try { medirRuido(dt); ausencia(C.P); } catch (e) {} }
  }
  titulo();
  const api = { frame, evento, legendaAvulsa, fimCap, morte, pausa, opcoes, aplicar, silencio, antesDeJogar, abrirCalibracao, registro, rankRuido };
  try { window.__l7b = api; } catch (e) {} // gancho do kit de teste
  return api;
}
