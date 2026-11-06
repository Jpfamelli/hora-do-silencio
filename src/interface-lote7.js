// INTERFACE — Lote 7: som e atmosfera na tela.
// Faz o terror sonoro ser LIDO por quem joga sem fone, com surdez ou com o som baixo, e dá
// leitura tática do silêncio como arma: anel de escuta na borda, peso/tremor/direção/distância e
// textura nas legendas, medidor de camuflagem do clima, HUD que escurece quando o mundo cala,
// medidor e pressão do silêncio, legenda da trilha de tensão, partitura do perigo, pulso do coração,
// prévia de atmosfera e dos sons do perigo. Criado por src/interface.js; tudo opcional e à prova de erro.
import { criarInterfaceLote7b } from './interface-lote7b.js';
export function criarInterfaceLote7(C, U) {
  const $ = s => document.querySelector(s);
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const OPT = C.OPT;
  const semWD = !(navigator && navigator.webdriver); // no QA não criamos osciladores nem animações caras
  let emitindo = false; // legenda criada por nós mesmos (clima, silêncio, trilha) não conta como som que quebrou o silêncio
  const legendaPropria = (t, c) => { emitindo = true; try { U.legenda(t, c); } finally { emitindo = false; } };
  let B = null; // 2ª parte: mixer, teste de fone, o que a Lia ouviu (src/interface-lote7b.js)

  // ---------------------------------------------------------------- OPÇÕES (grupo próprio)
  const PAD7 = {
    anelSom: 'nao', anelSomForma: true, legVolume: true, legTextura: true, legDirecao: false,
    legLado: false, legDistancia: false, mascaraSom: false, silencioHUD: true, silencioMedidor: false,
    silencioTom: true, climaLer: true, musicaLer: false, partitura: false, coracaoPulso: false, salaTom: false
  };
  for (const k in PAD7) { if (OPT[k] === undefined) OPT[k] = PAD7[k]; U.PAD[k] = PAD7[k]; }
  U.GRUPOS.push(['Som e atmosfera', [
    { k: 'anelSom', nome: 'Ver o som: anel na borda aponta de onde veio o barulho', tipo: 'sel', ops: [['nao', 'Desligado'], ['perigo', 'Só perigo'], ['todos', 'Todos os sons']] },
    { k: 'anelSomForma', nome: 'Forma por tipo de som no anel (• passo, ▭ porta, ◗ voz, ◉ sino)', tipo: 'sel', ops: [[false, 'Não'], [true, 'Sim']] },
    { k: 'legVolume', nome: 'Legenda cresce e treme conforme o volume do som', tipo: 'sel', ops: [[false, 'Não'], [true, 'Sim']] },
    { k: 'legTextura', nome: 'Textura além da cor nas legendas (perigo tracejado, história em itálico)', tipo: 'sel', ops: [[false, 'Não'], [true, 'Sim']] },
    { k: 'legDirecao', nome: 'Seta de direção na legenda (‹ esquerda, › direita, ⌃ frente, ⌄ atrás)', tipo: 'sel', ops: [[false, 'Não'], [true, 'Sim']] },
    { k: 'legLado', nome: 'Legenda encosta no lado da tela de onde veio o som', tipo: 'sel', ops: [[false, 'Não'], [true, 'Sim']] },
    { k: 'legDistancia', nome: 'Legenda diz perto / médio / longe do som', tipo: 'sel', ops: [[false, 'Não'], [true, 'Sim']] },
    { k: 'mascaraSom', nome: 'Medidor de camuflagem: quanto o clima cobre os seus passos agora', tipo: 'sel', ops: [[false, 'Não'], [true, 'Sim']] },
    { k: 'silencioHUD', nome: 'A tela escurece nas bordas quando o mundo fica em silêncio', tipo: 'sel', ops: [[false, 'Não'], [true, 'Sim']] },
    { k: 'silencioMedidor', nome: 'Medidor do silêncio (anel que enche quanto mais tempo tudo se cala)', tipo: 'sel', ops: [[false, 'Não'], [true, 'Sim']] },
    { k: 'silencioTom', nome: 'Pressão do silêncio: um tom fino cresce quando tudo fica quieto demais', tipo: 'sel', ops: [[false, 'Não'], [true, 'Sim']] },
    { k: 'climaLer', nome: 'Anunciar o clima da noite e o quanto ele te esconde', tipo: 'sel', ops: [[false, 'Não'], [true, 'Sim']] },
    { k: 'musicaLer', nome: 'Legendar o estado da trilha de tensão (para quem joga sem som)', tipo: 'sel', ops: [[false, 'Não'], [true, 'Sim']] },
    { k: 'partitura', nome: 'Partitura do perigo: linha na borda de baixo sobe com a tensão', tipo: 'sel', ops: [[false, 'Não'], [true, 'Sim']] },
    { k: 'coracaoPulso', nome: 'Pulso nas bordas no ritmo do coração e da caçada', tipo: 'sel', ops: [[false, 'Não'], [true, 'Sim']] },
    { k: 'salaTom', nome: 'Nomear a ambiência ao entrar numa sala (para quem não ouve as camadas)', tipo: 'sel', ops: [[false, 'Não'], [true, 'Sim']] }
  ]]);

  // ---------------------------------------------------------------- ESTILO E DOM (injetados, sem tocar no index.html)
  const style = document.createElement('style');
  style.textContent = `
  #l7-eco{position:absolute;inset:0;pointer-events:none;z-index:4}
  #l7-eco .pul{position:absolute;left:50%;top:50%;width:0;height:0;will-change:transform,opacity}
  #l7-eco .pul::before{content:"";position:absolute;left:-46px;top:-34vh;width:92px;height:11px;border-top:3px solid var(--c,#c0392b);opacity:var(--o,.85);border-radius:50% 50% 0 0/100% 100% 0 0;filter:blur(.5px);animation:l7eco 1s ease-out forwards}
  #l7-eco .pul .gl{position:absolute;left:0;top:-34vh;transform:translateX(-50%);font-family:"Special Elite",monospace;font-size:14px;color:var(--c,#c0392b);text-shadow:0 0 5px #000;opacity:var(--o,.85);animation:l7ecoG 1s ease-out forwards}
  #l7-eco .anel{position:absolute;inset:0;box-shadow:inset 0 0 70px 14px var(--c,rgba(192,57,43,.4));opacity:0;animation:l7flash .9s ease-out forwards}
  @keyframes l7eco{0%{transform:scaleX(.5);opacity:var(--o,.85)}100%{transform:scaleX(1.25);opacity:0}}
  @keyframes l7ecoG{0%{opacity:var(--o,.85)}100%{opacity:0}}
  @keyframes l7flash{0%{opacity:.5}100%{opacity:0}}
  body.menos-mov #l7-eco .pul::before,body.menos-mov #l7-eco .pul .gl,body.menos-mov #l7-eco .anel{animation-duration:.5s}
  #l7-cala{position:absolute;inset:0;pointer-events:none;opacity:0;z-index:3;transition:opacity 1.2s ease;box-shadow:inset 0 0 160px 50px rgba(2,2,4,.9);background:radial-gradient(130% 130% at 50% 50%,transparent 52%,rgba(2,2,4,.55) 100%)}
  #l7-sil{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:0;height:0;pointer-events:none}
  #l7-sil svg{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%)}
  #l7-sil circle{fill:none;stroke:#7d8aa0;stroke-width:2;opacity:.5}
  #l7-sil .f{stroke:#aeb9cc;transition:stroke-dashoffset .2s linear,stroke .3s}
  #l7-mask{position:absolute;right:20px;bottom:116px;width:116px;font-family:"IM Fell English SC",Georgia,serif;font-size:11px;letter-spacing:.06em;color:var(--fraco);text-shadow:0 0 5px #000;opacity:.9}
  #l7-mask .tr{height:7px;border:1px solid rgba(180,170,150,.4);border-radius:3px;margin-top:3px;overflow:hidden;background:rgba(0,0,0,.4)}
  #l7-mask .tr i{display:block;height:100%;width:0;background:linear-gradient(90deg,#5d7a3a,#9bbd62);transition:width .25s,background .3s}
  #l7-mask.expoe .tr i{background:linear-gradient(90deg,#8a3a2a,#c0392b)}
  #l7-part{position:absolute;left:0;right:0;bottom:0;height:34px;pointer-events:none;opacity:.8}
  #l7-cor{position:absolute;inset:0;pointer-events:none;opacity:0;box-shadow:inset 0 0 90px 22px rgba(150,20,16,.38);transition:opacity .07s}
  body.menos-mov #l7-cor{box-shadow:inset 0 0 70px 18px rgba(150,20,16,.26)}
  #hud.panico #l7-mask,#hud.panico #l7-sil{opacity:0}
  .leg-forte{display:inline-block;font-weight:bold;letter-spacing:.02em}
  body:not(.menos-mov) .leg-tremer{display:inline-block;animation:l7tremer .12s infinite alternate}
  @keyframes l7tremer{from{transform:translate(-.5px,.3px)}to{transform:translate(.6px,-.4px)}}
  .leg-lado-dir{display:block;text-align:right;padding-right:4%}
  .leg-lado-esq{display:block;text-align:left;padding-left:4%}
  .leg-lado-atras{display:block;text-align:center;opacity:.92}
  #legsom div.l7-tx-p{text-decoration:underline dashed rgba(217,160,146,.7);text-underline-offset:4px}
  #legsom div.l7-tx-h{font-style:italic}
  #legsom div.l7-tx-s{letter-spacing:.14em}
  .l7-seta{font-family:"Special Elite",monospace;opacity:.85;margin:0 .15em}
  .l7-botoes{display:flex;gap:8px;flex-wrap:wrap;margin:6px 0 2px}
  #l7-climaleg{position:absolute;left:50%;top:16%;transform:translateX(-50%);max-width:80vw;text-align:center;font-family:"IM Fell English SC",Georgia,serif;font-size:16px;letter-spacing:.06em;color:#cdbfa0;text-shadow:0 0 10px #000;opacity:0;transition:opacity .6s}
  #l7-climaleg.on{opacity:.95}
  `;
  (document.head || document.documentElement).appendChild(style);

  const hud = $('#hud');
  function mk(id, cls) { const d = document.createElement('div'); if (id) d.id = id; if (cls) d.className = cls; d.hidden = true; return d; }
  const eco = mk('l7-eco'); eco.hidden = false;
  const cala = mk('l7-cala'); cala.hidden = false;
  const sil = mk('l7-sil');
  sil.innerHTML = '<svg width="86" height="86" viewBox="0 0 86 86"><circle cx="43" cy="43" r="38"/><circle class="f" cx="43" cy="43" r="38" stroke-dasharray="238.8" stroke-dashoffset="238.8" transform="rotate(-90 43 43)"/></svg>';
  const mask = mk('l7-mask'); mask.innerHTML = '<span class="lb"></span><div class="tr"><i></i></div>';
  const part = document.createElement('canvas'); part.id = 'l7-part'; part.width = 480; part.height = 34; part.hidden = true;
  const cor = mk('l7-cor'); cor.hidden = false;
  const climaLeg = mk('l7-climaleg'); climaLeg.hidden = false;
  if (hud) { for (const n of [eco, cala, sil, mask, part, cor, climaLeg]) hud.appendChild(n); }
  const maskBar = mask.querySelector('i'), maskLb = mask.querySelector('.lb');
  const silF = sil.querySelector('.f'), SIL_LEN = 238.8;
  const partG = part.getContext && part.getContext('2d');

  // ---------------------------------------------------------------- DADOS DE VOLUME / FORMA / COR
  const VOL = { grito: 1, badaladas: 1, pancada: .92, vidro: .86, procissao: .86, gerador: .84, sino: .8, trovao: .9, risada: .7, canto: .6, chamadoVoz: .72, passoMonstro: .66, arrastar: .62, orelhao: .6, contagem: .46, estalo: .46, sussurros: .36, estatica: .5, coracao: .42, ofego: .42, rangido: .4, cano: .46, sinoLonge: .42, caixinha: .52, fitaClique: .32 };
  const FORMA = { passoMonstro: '•', passo: '•', pancada: '▭', vidro: '▭', chamadoVoz: '◗', contagem: '◗', risada: '◗', sussurros: '◗', canto: '◗', sino: '◉', sinoLonge: '◉', badaladas: '◉', orelhao: '◉', estalo: '‹›' };
  const corCat = cat => cat === 'p' || cat === 'dele' ? '#c0392b' : cat === 'h' ? '#c9a75a' : cat === 's' ? '#8a6fb0' : cat === 'eu' ? '#6c8ba0' : '#9a8f78';

  // seta de direção a partir do ângulo (0 = frente)
  function setaDir(a) {
    const ab = Math.abs(a);
    if (ab < 32) return '⌃';
    if (ab > 148) return '⌄';
    const n = ab > 95 ? 2 : 1, s = a > 0 ? '›' : '‹';
    return s.repeat(n);
  }

  // ---------------------------------------------------------------- GANCHO: cada som que vira legenda
  let ultSom = -99, agora = 0, climaJaCap = -1, ecoN = 0;
  function pulsoEco(a, cat, k) {
    if (!semWD || ecoN > 5) return; ecoN++;
    const p = document.createElement('div'); p.className = 'pul';
    p.style.setProperty('--c', corCat(cat)); p.style.setProperty('--o', '.85');
    p.style.transform = `rotate(${a}deg)`;
    if (OPT.anelSomForma && FORMA[k]) { const g = document.createElement('div'); g.className = 'gl'; g.textContent = FORMA[k]; p.appendChild(g); }
    eco.appendChild(p);
    setTimeout(() => { p.remove(); ecoN = Math.max(0, ecoN - 1); }, 1000);
  }
  function flashAnel(cat) {
    if (!semWD) return;
    const a = document.createElement('div'); a.className = 'anel';
    a.style.boxShadow = `inset 0 0 70px 14px ${corCat(cat)}66`; eco.appendChild(a);
    setTimeout(() => a.remove(), 900);
  }
  // chamado por interface.js em cada som posicional/legendado
  function evento(k, def, dr, a, line) {
    ultSom = agora;
    if (B) try { B.evento(k, def, dr, a, line); } catch (e) {}
    const cat = def && def.cat;
    const perigo = cat === 'p' || cat === 'dele';
    // anel de escuta na borda
    if (OPT.anelSom !== 'nao' && (OPT.anelSom === 'todos' || perigo)) {
      if (dr && dr.d < 40) pulsoEco(dr.a, cat, k);
      else if ((VOL[k] || .5) >= .78) flashAnel(cat); // sons grandes sem posição (sino, procissão) piscam a borda toda
    }
    // enriquecer a legenda já empilhada
    if (!line) return;
    const vol = VOL[k] !== undefined ? VOL[k] : (def && def.imp ? .62 : .42);
    enfeitar(line, cat, vol, dr);
  }
  function legendaEvento(txt, cat, line) {
    if (!emitindo) ultSom = agora;
    if (B) try { B.legendaAvulsa(txt, cat); } catch (e) {}
    const perigo = cat === 'p' || cat === 'dele';
    if (OPT.anelSom === 'todos' && !perigo) { /* legendas avulsas raramente têm direção; pisca leve */ }
    if (line) enfeitar(line, cat, cat === 'p' || cat === 'dele' ? .6 : .42, null);
  }
  // reescreve line.txt (innerHTML do legsom) e line.cls com os enfeites ligados
  function enfeitar(line, cat, vol, dr) {
    let corpo = line.txt;
    // direção na própria linha
    if (OPT.legDirecao && dr && dr.d < 40) {
      const sd = setaDir(dr.a);
      corpo = `<span class="l7-seta">${sd}</span>${corpo}`;
    }
    if (OPT.legDistancia && dr && dr.d < 40) {
      const dtxt = dr.d < 4 ? 'perto' : dr.d < 10 ? 'médio' : 'longe';
      corpo = `${corpo}<small style="opacity:.7"> · ${dtxt}</small>`;
    }
    // peso e tremor pelo volume
    if (OPT.legVolume) {
      const esc = (0.72 + vol * 0.7).toFixed(2);
      const cls = 'leg-vol' + (vol >= .78 ? ' leg-forte leg-tremer' : vol >= .55 ? ' leg-forte' : '');
      corpo = `<span class="${cls}" style="font-size:${esc}em">${corpo}</span>`;
    }
    // lado da tela
    if (OPT.legLado && dr && dr.d < 40) {
      const lado = Math.abs(dr.a) > 140 ? 'leg-lado-atras' : dr.a > 25 ? 'leg-lado-dir' : dr.a < -25 ? 'leg-lado-esq' : '';
      if (lado) corpo = `<span class="${lado}">${corpo}</span>`;
    }
    line.txt = corpo;
    // textura além da cor (classe extra no div, lida por desenharSom via line.cls2)
    if (OPT.legTextura) line.cls2 = cat === 'p' || cat === 'dele' ? 'l7-tx-p' : cat === 'h' ? 'l7-tx-h' : cat === 's' ? 'l7-tx-s' : '';
  }

  // ---------------------------------------------------------------- SOM DA PRESSÃO DO SILÊNCIO (procedural)
  let tomNo = null, tomG = null;
  function tomSilencio(forca) {
    if (!semWD) return;
    const AC = C.AC; if (!AC) { pararTom(); return; }
    if (forca <= 0) { pararTom(); return; }
    if (!tomNo) {
      try {
        tomNo = AC.createOscillator(); tomG = AC.createGain();
        tomNo.type = 'sine'; tomNo.frequency.value = 2400;
        tomG.gain.value = 0; tomNo.connect(tomG); tomG.connect(C.master || AC.destination); tomNo.start();
      } catch (e) { tomNo = null; return; }
    }
    try {
      const t = AC.currentTime;
      tomNo.frequency.setTargetAtTime(2200 + forca * 900, t, .4);
      tomG.gain.setTargetAtTime(forca * 0.012, t, .5);
    } catch (e) {}
  }
  function pararTom() { if (tomG && C.AC) try { tomG.gain.setTargetAtTime(0, C.AC.currentTime, .3); } catch (e) {} }

  // ---------------------------------------------------------------- CLIMA DA NOITE
  function textoClima(mul) {
    if (mul <= .72) return ['A tempestade cobre seus passos.', false];
    if (mul <= .9) return ['A chuva ajuda a esconder seus passos.', false];
    if (mul >= 1.12) return ['A quietude te entrega: cada passo ecoa.', true];
    return ['A noite está calma. Pise com cuidado.', mul >= 1];
  }
  let climaTO = null;
  function mostrarClima() {
    if (!OPT.climaLer) return;
    let mul = 1; try { mul = C.climaMul ? C.climaMul() : 1; } catch (e) {}
    const [txt] = textoClima(mul);
    climaLeg.textContent = txt; climaLeg.classList.add('on');
    clearTimeout(climaTO); climaTO = setTimeout(() => climaLeg.classList.remove('on'), 4200);
    try { legendaPropria('[' + txt + ']', mul >= 1.1 ? 'p' : 'h'); } catch (e) {}
  }

  // ---------------------------------------------------------------- ESTADO DA TRILHA / TENSÃO (derivado do que a UI já vê)
  const temCaca = M => M && M.ativo && ['caca', 'bote', 'agarra'].includes(M.state);
  function tensao() {
    const S = C.S, M = C.M; if (!S) return 0;
    let t = 0;
    if (M && M.ativo) {
      const st = M.state;
      t = temCaca(M) ? 1 : (st === 'procura' || st === 'fareja' || st === 'vasculha') ? .72 : (st === 'investiga' || st === 'alerta' || st === 'escuta') ? .5 : .28;
    }
    if (C.PROC && C.PROC.fase) t = Math.max(t, C.PROC.fase === 'passando' ? 1 : .7);
    if (C.ANA && C.ANA.ativa) t = Math.max(t, C.ANA.conta >= 8 ? .95 : .55);
    if (S.health < 35) t = Math.max(t, .3);
    return t;
  }
  const MUS_TXT = [[.85, 'a música não resolve, segura o ar'], [.6, 'a música adoece'], [.35, 'a música se inquieta'], [0, 'a casa respira baixo']];
  let musAnt = -1, musT = 0, partAnt = -9;

  // ---------------------------------------------------------------- AMBIÊNCIA POR SALA
  function ambienteDeSala(r) {
    if (!r) return null;
    const s = ((r.nome || '') + ' ' + (r.id || '')).toLowerCase();
    if (/cozinh|despensa|refei/.test(s)) return 'geladeira morta zumbindo';
    if (/enferm|saúde|saude|medic/.test(s)) return 'uma torneira pingando';
    if (/capela|altar|igreja/.test(s)) return 'um eco de reza parada no ar';
    if (/túnel|tunel|duto|cisterna|subterr|poço|poco/.test(s)) return 'água escorrendo ao longe';
    if (/dorm|quarto|celeste/.test(s)) return 'molas de cama rangendo ao vento';
    if (/banh|lavab|chuveiro/.test(s)) return 'canos estalando';
    if (/recep|hall|entrada|saguão|saguao/.test(s)) return 'um relógio de parede, tique distante';
    if (/diret|secret|escrit/.test(s)) return 'papel farfalhando no ar frio';
    if (/brinq|aula|classe/.test(s)) return 'um móbile girando sozinho';
    if (r.fora) return 'vento e chuva batendo no telhado';
    return 'o silêncio da casa respirando';
  }
  let salaAnt = null, salaTomT = 0;

  // ---------------------------------------------------------------- QUADRO A QUADRO
  let silV = 0, corV = 0, calaV = 0, jogoAnt = false;
  function frame(dt, ativo) {
    agora += dt;
    const S = C.S, P = C.P, M = C.M;
    const jogo = C.mode === 'jogo' && S && !S.dead && !S.fim;
    if (B) try { B.frame(dt, ativo, jogo); } catch (e) {}
    if (!jogo || C.ui || !ativo) jogoAnt = false;
    if (!jogo || C.ui || !ativo) {
      cala.style.opacity = 0; sil.hidden = true; mask.hidden = true; part.hidden = true; cor.style.opacity = 0; pararTom();
      return;
    }
    // o silêncio só começa a contar quando a noite começa (ou o capítulo muda), nunca desde a abertura da página
    if (!jogoAnt) ultSom = agora; jogoAnt = true;
    // clima ao entrar num capítulo novo
    if (S.chapter !== climaJaCap) { climaJaCap = S.chapter; ultSom = agora; if (agora > .5) setTimeout(mostrarClima, 900); }

    // ambiência ao trocar de sala
    salaTomT -= dt;
    if (OPT.salaTom && P && P.room && P.room !== salaAnt) {
      const nova = salaAnt !== null && !P.room.fora;
      salaAnt = P.room;
      if (nova && salaTomT <= 0 && OPT.legSom !== 'nao') { salaTomT = 3; const amb = ambienteDeSala(P.room); if (amb) try { legendaPropria('[ambiência: ' + amb + ']', 'h'); } catch (e) {} }
    } else if (P) salaAnt = P.room || salaAnt;

    const algumPerigo = !!((M && M.ativo) || (C.ANA && C.ANA.ativa) || (C.PROC && C.PROC.fase) || (C.chamado && C.chamado()));
    const quieto = agora - ultSom;
    // silêncio só "pesa" quando não há perigo ativo nem você fazendo barulho
    const calmo = !algumPerigo && (!P || P.noiseR < 1);
    const forcaSil = calmo ? clamp((quieto - 5) / 16, 0, 1) : 0;

    // HUD escurece no silêncio / vácuo
    const alvoCala = OPT.silencioHUD ? forcaSil * .9 : 0;
    calaV = lerp(calaV, alvoCala, Math.min(1, dt * 1.5));
    cala.style.opacity = calaV.toFixed(3);

    // medidor do silêncio
    if (OPT.silencioMedidor && forcaSil > 0.02) {
      sil.hidden = false; const off = SIL_LEN * (1 - forcaSil);
      silF.style.strokeDashoffset = off.toFixed(1);
      silF.style.stroke = forcaSil > .85 ? '#d9a092' : '#aeb9cc';
    } else sil.hidden = true;

    // pressão sonora do silêncio
    tomSilencio(OPT.silencioTom ? forcaSil : 0);
    if (B) try { B.silencio(forcaSil, tensao()); } catch (e) {}
    // legenda quando o silêncio fica insuportável
    if (OPT.silencioTom && forcaSil >= .98 && agora - musT > 10 && OPT.legSom !== 'nao') { musT = agora; try { legendaPropria('[o silêncio aperta os ouvidos]', 'eu'); } catch (e) {} }

    // medidor de camuflagem do clima
    if (OPT.mascaraSom) {
      let mul = 1, mk2 = 1;
      try { mul = C.climaMul ? C.climaMul() : 1; } catch (e) {}
      try { mk2 = C.mascaraSom && P.pos ? C.mascaraSom(P.pos.x, P.pos.z) : 1; } catch (e) {}
      const cobre = clamp((1 - mul) * 1.3 + (1 - mk2), 0, 1); // 0 = exposta, 1 = bem coberta
      const expoe = mul > 1.05 && cobre < .08;
      mask.hidden = false; mask.classList.toggle('expoe', expoe && cobre < .05 ? false : mul > 1.05);
      maskBar.style.width = (cobre * 100).toFixed(0) + '%';
      maskLb.textContent = cobre > .55 ? 'o mundo te cobre' : cobre > .2 ? 'cobre em parte' : mul > 1.05 ? 'você está exposta' : 'quase sem cobertura';
    } else mask.hidden = true;

    // legenda do estado da trilha
    if (OPT.musicaLer && OPT.legSom !== 'nao') {
      const tn = tensao(); let idx = MUS_TXT.findIndex(x => tn >= x[0]);
      if (idx !== musAnt && agora - musT > 3.5) { musAnt = idx; musT = agora; try { legendaPropria('[' + MUS_TXT[idx][1] + ']', tn >= .6 ? 'p' : 'h'); } catch (e) {} }
    }

    // partitura do perigo (linha na borda de baixo)
    if (OPT.partitura && partG) {
      part.hidden = false;
      if (agora - partAnt > .12) { partAnt = agora; desenharPart(tensao()); }
    } else part.hidden = true;

    // pulso do coração / caçada
    let alvoCor = 0;
    if (OPT.coracaoPulso) {
      const tn = tensao(); const bpmBase = 0.9 + tn * 1.8 + (S.health < 35 ? .6 : 0);
      const fase = Math.sin(agora * bpmBase * Math.PI) * .5 + .5;
      alvoCor = (tn > .2 || S.health < 35) ? (0.12 + tn * .6) * fase : 0;
    }
    corV = lerp(corV, alvoCor, Math.min(1, dt * 10));
    cor.style.opacity = corV.toFixed(3);
  }
  const partBuf = [];
  function desenharPart(tn) {
    partBuf.push(tn); while (partBuf.length > 120) partBuf.shift();
    const g = partG, w = part.width, h = part.height;
    g.clearRect(0, 0, w, h);
    const grad = g.createLinearGradient(0, 0, w, 0); grad.addColorStop(0, 'rgba(120,120,130,.15)'); grad.addColorStop(1, tn > .6 ? 'rgba(192,57,43,.9)' : 'rgba(170,160,130,.7)');
    g.strokeStyle = grad; g.lineWidth = 2; g.beginPath();
    const n = partBuf.length;
    for (let i = 0; i < n; i++) { const x = w - (n - 1 - i) * (w / 120); const y = h - 3 - partBuf[i] * (h - 6); if (i === 0) g.moveTo(x, y); else g.lineTo(x, y); }
    g.stroke();
  }

  // ---------------------------------------------------------------- PRÉVIAS NO MENU DE OPÇÕES
  function opcoes(box) {
    // botões de prévia logo depois do grupo "Som e atmosfera"
    const h3s = [...box.querySelectorAll('h3')];
    const alvo = h3s.find(h => h.textContent === 'Som e atmosfera'); if (!alvo) return;
    if (box.querySelector('.l7-botoes')) return;
    const div = document.createElement('div'); div.className = 'l7-botoes';
    div.innerHTML = '<button type="button" class="btn" id="l7-surdez">Modo Surdez (tudo visual)</button>'
      + '<button type="button" class="btn" id="l7-prev-perigo">Ouvir os sons do perigo</button>'
      + '<button type="button" class="btn" id="l7-prev-atm">Prévia de atmosfera</button>';
    // inserir no fim do grupo (antes do próximo h3, ou no fim do box)
    let ref = alvo.nextElementSibling, ultimo = alvo;
    while (ref && ref.tagName !== 'H3') { ultimo = ref; ref = ref.nextElementSibling; }
    ultimo.after(div);
    const toca = seq => {
      try { C.iniciarAudio && C.iniciarAudio(); } catch (e) {}
      seq.forEach(([k, at], i) => setTimeout(() => { try { C.SFX[k] && C.SFX[k](); } catch (e) {} }, i * 850 + at));
    };
    // Modo Surdez: liga de uma vez todas as pistas visuais equivalentes ao som
    const SURDEZ = { legSom: 'todos', anelSom: 'perigo', anelSomForma: true, legVolume: true, legTextura: true, legDirecao: true, legLado: true, legDistancia: true, silencioHUD: true, climaLer: true, musicaLer: true, salaTom: true, coracaoPulso: true, legOnda: true, legRelogio: true, legAusencia: true };
    const bs = $('#l7-surdez'); if (bs) bs.onclick = () => {
      for (const k in SURDEZ) OPT[k] = SURDEZ[k];
      try { C.salvarOpt && C.salvarOpt(); } catch (e) {}
      // reflete nos seletores já desenhados da tela, sem precisar reabrir
      box.querySelectorAll('select[data-k]').forEach(sel => { const k = sel.dataset.k; if (k in SURDEZ) sel.value = String(SURDEZ[k]); });
      try { C.toast && C.toast('Modo Surdez: todo aviso sonoro agora tem uma pista visual na tela. Ajuste fino no grupo Som e atmosfera.'); } catch (e) {}
    };
    const b1 = $('#l7-prev-perigo'); if (b1) b1.onclick = () => { toca([['passoMonstro', 0], ['estalo', 0], ['risada', 0], ['contagem', 0], ['procissao', 0]]); try { C.toast && C.toast('Os sons que custam a sua vida, em sequência. Ajuste o volume e o fone por eles.'); } catch (e) {} };
    const b2 = $('#l7-prev-atm'); if (b2) b2.onclick = () => { toca([['sinoLonge', 0], ['estatica', 0], ['sino', 0], ['badaladas', 0]]); try { C.toast && C.toast('Uma amostra da atmosfera da casa.'); } catch (e) {} };
  }

  try { B = criarInterfaceLote7b(C, Object.assign({}, U, { legenda: legendaPropria })); } catch (e) { console.warn('[atmosfera-ui-b]', e); }
  function opcoes2(box) { opcoes(box); if (B) try { B.opcoes(box); } catch (e) {} }
  return {
    frame, evento, legendaEvento, opcoes: opcoes2, mostrarClima,
    aplicar() { if (B) try { B.aplicar(); } catch (e) {} },
    morte() { if (B) try { B.morte(); } catch (e) {} },
    fimCap(c) { if (B) try { B.fimCap(c); } catch (e) {} },
    pausa() { if (B) try { B.pausa(); } catch (e) {} },
    antesDeJogar(cb) { if (B) { try { return B.antesDeJogar(cb); } catch (e) {} } return cb(); }
  };
}
