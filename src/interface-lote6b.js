// INTERFACE — lote 6 (2ª rodada): a segunda jogada por dentro. Telemetria passiva da noite (onde o tempo foi, rota,
// barulho, pulos), fim de capítulo que ensina, morte comentada e autópsia, boletim escolar e perfil de medo no final,
// cartão de compartilhar, título que lembra de você, opções de rejogo (Modo Memória, Imersão total) e extras do diário.
// Criado por src/interface.js (criarInterfaceLote6B(C, U)); os ganchos são chamados por lá, sempre em try/catch.
// A tela cheia "Central do rejogo" (abas, calendário, placares, perfis...) fica em interface-lote6b-central.js.
import * as T from './interface-lote6b-texto.js';
import { criarCentral6B } from './interface-lote6b-central.js';
import { criarPerfis } from './interface-lote6b-perfis.js';

export function criarInterfaceLote6B(C, U) {
  const $ = s => document.querySelector(s);
  const R = C.R, OPT = C.OPT;
  const esc = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const r1 = v => Math.round(v * 10) / 10;
  const pick = a => a[Math.random() * a.length | 0];
  const mmss = s => `${Math.floor(s / 60)}min ${String(Math.floor(s % 60)).padStart(2, '0')}s`;
  const seg = s => s < 90 ? `${Math.round(s)}s` : mmss(s);
  const robo = (() => { try { return navigator.webdriver; } catch (e) { return false; } })();
  const LSK = 'hora-silencio-l6b';
  const CATS = ['andando', 'correndo', 'escondida', 'parada', 'dialogo', 'notas', 'morta'];
  const DIF_LETRA = { facil: 'F', normal: 'N', pesadelo: 'P' };
  const MAPA_CAP = ['estrada', 'terreo', 'terreo', 'superior', 'tuneis', 'cemiterio'];

  // ---------------------------------------------------------------- armazenamento (por perfil, pois o prefixo é do jogo)
  function D() {
    const d = C.lsGet(LSK, null) || {};
    d.noites = d.noites || []; d.melhor = d.melhor || {}; d.mortesPts = d.mortesPts || {}; d.plantas = d.plantas || {};
    d.recs = d.recs || []; d.dias = d.dias || {}; d.titulosGanhos = d.titulosGanhos || { hospede: 1 }; d.marcas = d.marcas || {};
    d.rasc = d.rasc || {}; d.cods = d.cods || []; d.mortesPorQuem = d.mortesPorQuem || {}; d.salas = d.salas || {};
    d.arqs = d.arqs || {}; d.dicasVistas = d.dicasVistas || {}; d.pendente = d.pendente || {};
    return d;
  }
  const salvar = d => C.lsSet(LSK, d);

  // ---------------------------------------------------------------- opções novas
  const PAD6B = { memoria: false, imersao: false, pulometro: true, segRestam: false, sonhoTitulo: true, rotaFim: true, casaTitulo: true };
  for (const k in PAD6B) { if (OPT[k] === undefined) OPT[k] = PAD6B[k]; U.PAD[k] = PAD6B[k]; }
  const SN = [[false, 'Não'], [true, 'Sim']], NS = [[true, 'Sim'], [false, 'Não']];
  U.GRUPOS.push(['Rejogo (segunda noite)', [
    { k: 'memoria', nome: 'Modo Memória: o objetivo some 5 s depois de aparecer; O lembra uma vez por capítulo', tipo: 'sel', ops: SN },
    { k: 'imersao', nome: 'Imersão total: sem barras na tela (a vida vira o vermelho nas bordas)', tipo: 'sel', ops: SN },
    { k: 'pulometro', nome: 'Pulômetro: contar quando você vira a câmera de susto', tipo: 'sel', ops: NS },
    { k: 'rotaFim', nome: 'Mostrar a rota e onde o tempo foi no fim do capítulo', tipo: 'sel', ops: NS },
    { k: 'segRestam', nome: 'Ponto de giz: quantos segredos ainda restam na sala já visitada', tipo: 'sel', ops: SN },
    { k: 'sonhoTitulo', nome: 'Mostrar o "Sonhei que..." no título', tipo: 'sel', ops: NS },
    { k: 'casaTitulo', nome: 'Mostrar a casa que acende no título', tipo: 'sel', ops: NS }
  ]]);

  // conquistas novas (não secretas aparecem na lista; as secretas viram ??? até serem achadas)
  for (const c of [
    { id: 'l6b_memoria', nome: 'Memória de Elefante', desc: 'Termine um capítulo no Modo Memória (Opções).' },
    { id: 'l6b_olhos', nome: 'Só os Olhos', desc: 'Termine um capítulo com a Imersão total ligada (Opções).' },
    { id: 'l6b_calma', nome: 'Coração de Pedra', desc: 'Termine uma noite inteira sem pular de susto.', secreta: true },
    { id: 'l6b_honra', nome: 'Quadro de Honra', desc: 'Tire média 8 ou mais no boletim da noite.', secreta: true },
    { id: 'l6b_roleta', nome: 'Mão do Destino', desc: 'Jogue a noite que a Roda Surpresa sorteou.', secreta: true },
    { id: 'l6b_taro', nome: 'Leitura de Cartas', desc: 'Comece uma noite com uma carta do Tarô.', secreta: true }
  ]) if (!R.conquistas.some(x => x.id === c.id)) R.conquistas.push(c);

  // ---------------------------------------------------------------- funções de semente (iguais às do módulo do lote 6)
  function hashSemente(txt) {
    const s = String(txt || '').trim().toUpperCase(); if (!s) return '';
    if (/^[0-9A-Z]{4,7}$/.test(s)) return s;
    let h = 2166136261 >>> 0; for (const ch of s) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619) >>> 0; }
    return (((h % 2176782334) + 1) >>> 0).toString(36).toUpperCase().padStart(6, '0').slice(0, 6);
  }
  function sementeDoDia(d) {
    d = d || new Date(); const base = d.getUTCFullYear() * 384 + d.getUTCMonth() * 32 + d.getUTCDate();
    return hashSemente('DIA' + base);
  }
  const hashStr = s => { let h = 2166136261; for (const c of String(s || 'SEMCOD')) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; };
  const prng = seed => { let a = seed >>> 0 || 1; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; };
  const diaChave = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

  // ---------------------------------------------------------------- glifos de giz da semente (3 desenhos pelo hash)
  const GLIFOS = [
    'M12 3V21M5 10H19', 'M2 12Q12 3 22 12Q12 21 2 12ZM12 9.5A2.5 2.5 0 1 0 12 14.5A2.5 2.5 0 1 0 12 9.5', 'M6 21V3M18 21V3M6 8H18M6 14H18',
    'M12 21V9M12 9Q16 6 12 2Q8 6 12 9', 'M7 5A4 4 0 1 1 7 13L20 21M16 17L18 15', 'M16 3A9 9 0 1 0 16 21A7 7 0 1 1 16 3',
    'M12 3L12 21M12 8L6 3M12 12L18 6M12 16L7 12', 'M5 21V4H19V21M5 21H19M16 13H17'
  ];
  const glifoSvg = (sem, tam = 22) => {
    if (!sem || sem === 'SEMCOD') return '';
    const h = hashStr(sem + '|glifo'); const a = [h % 8, (h >>> 3) % 8, (h >>> 6) % 8];
    return `<span class="l6b-glifos" title="glifo da noite ${esc(sem)}" aria-label="glifos da noite ${esc(sem)}">` + a.map(i => `<svg viewBox="0 0 24 24" width="${tam}" height="${tam}" fill="none" stroke="#cfc3a6" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="${GLIFOS[i]}"/></svg>`).join('') + '</span>';
  };

  // ---------------------------------------------------------------- CSS do módulo
  const css = document.createElement('style'); css.id = 'l6b-css';
  css.textContent = `
  .l6b-glifos{display:inline-flex;gap:3px;vertical-align:middle;margin:0 4px;opacity:.85}
  .l6b-side{position:absolute;right:14px;top:50%;transform:translateY(-50%);width:310px;max-height:94vh;overflow:auto;text-align:left;pointer-events:auto;font-family:"Special Elite","Courier New",monospace;font-size:12px;color:#bdb29a;background:rgba(8,6,4,.88);border:1px solid #2c2720;padding:10px 12px;line-height:1.5;scrollbar-width:thin}
  .l6b-side h4{font-family:"IM Fell English SC",Georgia,serif;font-weight:normal;letter-spacing:.14em;color:var(--sangue);font-size:12px;margin:8px 0 4px;text-transform:uppercase}
  .l6b-side h4:first-child{margin-top:0}
  .l6b-barra{display:flex;height:14px;border:1px solid #2c2720;background:#050403}
  .l6b-barra i{display:block;height:100%}
  .l6b-barra.melhor{height:7px;opacity:.55;margin-top:3px}
  .l6b-leg{display:flex;flex-wrap:wrap;gap:2px 10px;margin-top:5px;font-size:11px}
  .l6b-leg span::before{content:"";display:inline-block;width:8px;height:8px;margin-right:4px;background:var(--c);vertical-align:-1px}
  .l6b-leg em{font-style:normal;color:#6d6452}.l6b-leg .bom{color:#7fbf6a}.l6b-leg .ruim{color:#d0584a}
  .l6b-dica{color:#c9a75a;margin-top:6px}
  .l6b-side canvas{display:block;width:100%;height:auto;border:1px solid #2c2720;background:#050403}
  .l6b-mleg{font-size:10px;color:#6d6452;margin-top:3px;display:flex;flex-wrap:wrap;gap:0 9px}
  .l6b-segs{display:flex;flex-wrap:wrap;gap:5px;margin:4px 0}
  .l6b-seg{width:18px;height:18px;border:1px dashed #4a4235;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;font-size:10px;color:#4a4235}
  .l6b-seg.ok{border-style:solid;border-color:#c9a75a;color:#c9a75a;background:rgba(201,167,90,.1)}
  .l6b-seg.acende{border-color:#e8c76a;color:#e8c76a;animation:l6bpisca 2s ease-in-out infinite}
  @keyframes l6bpisca{50%{box-shadow:0 0 8px rgba(232,199,106,.7)}}
  .l6b-btns{display:flex;gap:6px;margin-top:8px;flex-wrap:wrap}
  .l6b-btns button,.l6b-mini2{pointer-events:auto;font-family:"Special Elite",monospace;font-size:11px;color:var(--fraco);background:#0c0b09;border:1px solid #2c2720;padding:3px 9px;cursor:pointer}
  .l6b-btns button:hover,.l6b-mini2:hover{color:#fff;border-color:var(--fraco)}
  .l6b-casaviu{font-style:italic;color:#9a8f77;margin-top:6px}
  .l6b-casaviu small{display:block;font-style:normal;color:#6d6452;margin-top:2px}
  .l6b-novo{color:#e8c76a}
  #l6b-morte{font-family:"IM Fell English",Georgia,serif;font-style:italic;color:#e0a99f;font-size:21px;max-width:660px;margin:-4px auto 14px;line-height:1.35}
  #l6b-morte-x{font-family:"Special Elite",monospace;font-size:12px;color:#8a6f5a;max-width:660px;margin:-6px auto 12px;line-height:1.6}
  #l6b-morte-x .amarelo{color:#e8c76a;display:block;margin-top:4px}
  #l6b-auto{display:block;margin:0 auto 14px;border:1px solid #2c2720;background:#050403;max-width:90vw}
  #l6b-end{max-width:760px;margin:10px auto 26px;text-align:left;font-family:"Special Elite",monospace;font-size:13px;color:#bdb29a;line-height:1.6;padding:0 14px;width:100%}
  #l6b-end h4{font-family:"IM Fell English SC",Georgia,serif;font-weight:normal;letter-spacing:.14em;color:var(--sangue);font-size:14px;margin:18px 0 6px;text-transform:uppercase;border-bottom:1px solid #2c2720;padding-bottom:3px}
  .l6b-boletim{background:#d8d0bc;color:#2a2418;padding:12px 16px;transform:rotate(-.4deg);box-shadow:0 4px 18px #000;font-family:"Special Elite",monospace;max-width:520px;margin:0 auto}
  .l6b-boletim h5{font-family:"IM Fell English SC",Georgia,serif;font-weight:normal;letter-spacing:.2em;font-size:15px;text-align:center;margin-bottom:6px;color:#3a2e1a}
  .l6b-boletim table{width:100%;border-collapse:collapse}
  .l6b-boletim td{padding:3px 4px;border-bottom:1px dotted #8a7f68}
  .l6b-boletim td.n{text-align:right;font-weight:bold;font-size:18px}.l6b-boletim .az{color:#22449a}.l6b-boletim .vm{color:#b12a22}
  .l6b-boletim .obs{margin-top:8px;font-style:italic;font-size:13px}.l6b-boletim .ciente{margin-top:6px;font-family:"IM Fell English",Georgia,serif;font-size:15px;transform:rotate(-2deg);color:#1c2a60}
  .l6b-grafico{display:flex;align-items:flex-end;gap:10px;height:62px;margin:6px 0}
  .l6b-grafico div{flex:1;text-align:center;font-size:10px;color:#857a63}
  .l6b-grafico i{display:block;background:linear-gradient(0deg,#6a120d,#c0392b);margin-bottom:3px;min-height:2px}
  .l6b-rotas{display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:8px}
  .l6b-rotas figure{margin:0}.l6b-rotas canvas{width:100%;height:auto;border:1px solid #2c2720;background:#050403}.l6b-rotas figcaption{font-size:10px;color:#6d6452;text-align:center}
  .l6b-diario{background:#cfc6ae;color:#2a2418;padding:12px 16px;font-family:"Special Elite",monospace;white-space:pre-line;transform:rotate(.5deg);box-shadow:0 4px 18px #000;max-width:560px;margin:0 auto;font-size:13px}
  .l6b-porta{display:inline-block;width:62px;margin:0 6px;text-align:center;font-size:10px;color:#4a4235;vertical-align:top}
  .l6b-porta b{display:block;width:44px;height:68px;margin:0 auto 4px;border:2px solid #4a4235;border-radius:22px 22px 0 0;background:#0a0807;position:relative}
  .l6b-porta.on{color:#e8c76a}.l6b-porta.on b{border-color:#c9a75a;background:linear-gradient(#3a2d12,#1a1306);box-shadow:0 0 14px rgba(201,167,90,.35)}
  .l6b-ini{display:flex;gap:8px;align-items:center;flex-wrap:wrap}
  .l6b-ini input{background:#000;color:#e8c76a;border:1px solid #4a4235;font-family:"Special Elite",monospace;font-size:20px;width:70px;text-align:center;letter-spacing:.2em;text-transform:uppercase;padding:3px}
  #l6b-linha{font-family:"Special Elite",monospace;font-size:13px;color:#8a6f5a;text-align:center;margin:-14px 0 14px;min-height:1em;max-width:620px;padding:0 16px;line-height:1.5}
  #l6b-linha em{color:#c9a75a;font-style:normal}
  #l6b-sonho{font-family:"IM Fell English",Georgia,serif;font-style:italic;font-size:15px;color:#7a6f58;text-align:center;margin:-10px 0 14px;max-width:560px;padding:0 16px}
  #l6b-casa{position:absolute;left:18px;bottom:16px;opacity:.9;pointer-events:none}
  #l6b-prev{font-family:"Special Elite",monospace;font-size:11px;color:#6d6452;text-align:center;margin-top:3px;max-width:520px;line-height:1.5}
  #l6b-prev b{color:#a79a7c;font-weight:normal}
  #l6b-dot{position:absolute;left:14px;bottom:70px;font-family:"Special Elite",monospace;font-size:12px;color:#cfc3a6;opacity:0;transition:opacity 1.2s;pointer-events:none;text-shadow:0 0 6px #000}
  #l6b-dot.on{opacity:.75}
  #l6b-dot i{display:inline-block;width:9px;height:9px;border-radius:50%;background:radial-gradient(#e8dfc6,#8a7f68);margin-right:6px;box-shadow:0 0 6px rgba(232,223,198,.6)}
  #l6b-vinheta{position:fixed;inset:0;pointer-events:none;z-index:6;opacity:0;transition:opacity .4s;box-shadow:inset 0 0 160px 40px rgba(150,10,5,.9)}
  body.l6b-imersao #bars,body.l6b-imersao #inv-mini,body.l6b-imersao #cron,body.l6b-imersao #crono,body.l6b-imersao #split,body.l6b-imersao #l6-ghost{opacity:0!important;pointer-events:none}
  body.l6b-mem #obj{opacity:0!important}
  #l6b-hold{position:absolute;left:50%;bottom:18px;transform:translateX(-50%);font-family:"Special Elite",monospace;font-size:12px;color:#c9a75a;opacity:0;transition:opacity .3s}
  #l6b-hold.on{opacity:1}
  #l6b-chip{position:absolute;top:14px;left:16px;pointer-events:auto;font-family:"Special Elite",monospace;font-size:12px;color:var(--fraco);background:#0c0b09;border:1px solid #2c2720;padding:4px 10px;cursor:pointer;z-index:3}
  #l6b-chip:hover{color:#fff}#l6b-chip i{display:inline-block;width:8px;height:8px;border-radius:50%;margin-right:7px;vertical-align:0}
  #l6b-quem{position:fixed;inset:0;z-index:90;background:rgba(0,0,0,.96);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:22px}
  #l6b-quem h2{font-family:"IM Fell English SC",Georgia,serif;font-weight:normal;letter-spacing:.14em;font-size:38px;color:var(--ui)}
  .l6b-cartas{display:flex;gap:14px;flex-wrap:wrap;justify-content:center}.l6b-perfil{min-width:150px;font-size:22px}.l6b-perfil small{display:block;font-size:11px;opacity:.7}
  #l6b-visitante{position:absolute;top:44px;left:16px;font-family:"Special Elite",monospace;font-size:11px;color:#c9a75a;max-width:240px;z-index:3}
  .l6b-tab{pointer-events:auto}
  .l6b-tabs{display:flex;flex-wrap:wrap;gap:6px;justify-content:center;margin-bottom:14px}
  .l6b-tabs .btn{font-size:15px;padding:4px 12px}.l6b-tabs .btn.on{border-color:#c9a75a;color:#e8c76a}
  .l6b-card{border:1px solid #2c2720;background:#0e0c0a;padding:10px 14px;margin-bottom:8px;font-family:"Special Elite",monospace;font-size:13px;color:#bdb29a;line-height:1.6}
  .l6b-card b{color:#cfc3a6;font-weight:normal}.l6b-card small{color:#6d6452}
  .l6b-grade{display:grid;grid-template-columns:repeat(auto-fill,minmax(120px,1fr));gap:8px}
  .l6b-sil{border:1px solid #2c2720;background:#0a0807;padding:8px;text-align:center;font-size:11px;color:#4a4235;min-height:74px}.l6b-sil.on{color:#cfc3a6;border-color:#7a6236}
  .l6b-sil span{display:block;font-size:26px;margin-bottom:2px;filter:grayscale(1) brightness(.35)}.l6b-sil.on span{filter:none;color:#c9a75a}
  .l6b-mold{border-width:2px;border-style:solid}
  .l6b-cal{display:grid;grid-template-columns:repeat(7,1fr);gap:4px;max-width:420px;margin:0 auto}
  .l6b-cal div,.l6b-cal button{aspect-ratio:1;display:flex;align-items:center;justify-content:center;font-family:"Special Elite",monospace;font-size:12px;border:1px solid #1c1915;color:#6d6452;background:#0a0807}
  .l6b-cal button{cursor:pointer;pointer-events:auto}.l6b-cal .h{aspect-ratio:auto;border:none;background:none;color:#857a63;font-size:10px}
  .l6b-cal .v{border-color:#4f8a43;color:#9ad486;background:#0d150b}.l6b-cal .m{border-color:#8a2a22;color:#e08a80;background:#190a09}.l6b-cal .o{border-color:#c9a75a;color:#e8c76a;background:#1d1608}.l6b-cal .hoje{outline:1px solid #cfc3a6}
  .l6b-cartaT{display:inline-block;margin:6px;pointer-events:auto;cursor:pointer;background:none;border:none;padding:0}.l6b-cartaT canvas{border:1px solid #4a4235;display:block}.l6b-cartaT:hover canvas,.l6b-cartaT:focus canvas{border-color:#e8c76a;box-shadow:0 0 16px rgba(232,199,106,.3)}
  .l6b-roleta{display:flex;gap:14px;justify-content:center;flex-wrap:wrap;margin:10px 0}.l6b-roleta .l6b-rc{width:210px;min-height:104px;border:2px solid #4a4235;padding:12px;font-family:"IM Fell English SC",Georgia,serif;font-size:17px;color:#cfc3a6;text-align:center;background:#0c0a08}
  .l6b-rc small{display:block;font-family:"Special Elite",monospace;font-size:11px;color:#857a63;margin-top:6px}.l6b-rc.bom{border-color:#4f8a43}.l6b-rc.ruim{border-color:#8a2a22}.l6b-rc.gira{opacity:.75}
  .l6b-mapa canvas{width:100%;max-width:640px;display:block;margin:0 auto 10px;border:1px solid #2c2720;background:#050403}
  .l6b-quiz .btn{margin:4px}.l6b-quiz p{margin:10px 0 4px}
  .l6b-linhaG canvas{display:block;margin:6px auto;border:1px solid #2c2720;background:#050403;max-width:100%}
  .l6b-tab-cinza{color:#6d6452}
  .l6b-ptab{width:100%;border-collapse:collapse;font-family:"Special Elite",monospace;font-size:13px}.l6b-ptab td,.l6b-ptab th{padding:6px 8px;border-bottom:1px solid #1c1915;text-align:left}.l6b-ptab th{color:#857a63;font-size:11px;font-weight:normal}
  .l6b-coroa{color:#e8c76a}
  .l6b-rasc{width:100%;min-height:180px;background:#0a0807;color:#cfc3a6;border:1px solid #2c2720;font-family:"Special Elite",monospace;font-size:14px;padding:10px;resize:vertical}
  .l6b-marcas{display:flex;gap:6px;align-items:center;margin:0 0 6px;font-family:"Special Elite",monospace;font-size:12px;color:#857a63}
  .l6b-marcas button{pointer-events:auto;background:#0c0b09;border:1px solid #2c2720;color:#bdb29a;font-size:13px;padding:2px 8px;cursor:pointer}.l6b-marcas button.on{border-color:#e8c76a;color:#e8c76a}
  @media (max-width:980px){.l6b-side{position:static;transform:none;width:min(560px,92vw);margin-top:12px;max-height:none}#l6b-casa{display:none}}
  @media (prefers-reduced-motion:reduce){.l6b-seg.acende{animation:none}}
  `;
  document.head.appendChild(css);

  // ---------------------------------------------------------------- estado da noite (só em memória)
  let Sref = null, N = novaNoite(), ultTempo = 0, px = 0, pz = 0, temPos = false, amT = 0, ult60 = [];
  function novaNoite() { return { t0: Date.now(), caps: {}, pulos: 0, pulosPor: {}, sustos: {}, seqQuem: { quem: null, n: 0 }, mortes: [], agachMov: 0, cobriuRuido: 0, nasceu: false }; }
  function novoCap() { return { cat: { andando: 0, correndo: 0, escondida: 0, parada: 0, dialogo: 0, notas: 0, morta: 0 }, rota: [], ev: [], mapa: null, ruidoSoma: 0, ruidoN: 0, esconde: 0, visto: 0, golpes: 0, agachMov: 0, planta: null, memoria: true, imersao: true, usouO: 0 }; }
  const NC = i => N.caps[i] || (N.caps[i] = novoCap());
  let yawAnt = null, susto = null, healthAnt = 100, estAnt = null, anaAnt = false, procAnt = false, hiddenAnt = null, parouT = 0, parouMarcado = false, ultAlto = -99, lantT = 0, agachSeq = 0, corridaJan = [], jaClock = 0, agora = 0;
  let salaAnt = null, memT = 0, capAnt = -1, holdE = 0, fcT = 0, fcAtivo = false, fcRepete = false, fcSeguro = false, vinhetaT = 0, casaT = 0, tituloT = 0, tituloMostrado = false;

  // ---------------------------------------------------------------- planta e desenho
  function plantaAtual() {
    const W = C.W; if (!W || !W.salas) return [];
    let rs = W.salas.filter(r => !r.fora); if (!rs.length) rs = W.salas;
    return rs.map(r => [r1(r.x0), r1(r.z0), r1(r.x1), r1(r.z1)]);
  }
  function limites(planta, pts) {
    let x0 = 1e9, z0 = 1e9, x1 = -1e9, z1 = -1e9;
    for (const r of planta) { x0 = Math.min(x0, r[0]); z0 = Math.min(z0, r[1]); x1 = Math.max(x1, r[2]); z1 = Math.max(z1, r[3]); }
    if (x0 > x1) for (const p of pts) { x0 = Math.min(x0, p[0]); z0 = Math.min(z0, p[1]); x1 = Math.max(x1, p[0]); z1 = Math.max(z1, p[1]); }
    if (x0 > x1) { x0 = -10; x1 = 10; z0 = -10; z1 = 10; }
    return { x0: x0 - 2, z0: z0 - 2, x1: x1 + 2, z1: z1 + 2 };
  }
  function transf(cv, b, pad = 6) {
    const k = Math.min((cv.width - pad * 2) / (b.x1 - b.x0), (cv.height - pad * 2) / (b.z1 - b.z0));
    const ox = (cv.width - (b.x1 - b.x0) * k) / 2, oz = (cv.height - (b.z1 - b.z0) * k) / 2;
    return { k, sx: x => ox + (x - b.x0) * k, sz: z => oz + (b.z1 - z) * k };
  }
  function desenharFundo(g, cv, planta, tr) {
    g.fillStyle = '#050403'; g.fillRect(0, 0, cv.width, cv.height);
    g.lineWidth = 1; g.strokeStyle = '#2f2a22'; g.fillStyle = '#0d0b09';
    for (const r of planta) { const x = tr.sx(r[0]), z = tr.sz(r[3]), w = (r[2] - r[0]) * tr.k, h = (r[3] - r[1]) * tr.k; g.fillRect(x, z, w, h); g.strokeRect(x, z, w, h); }
  }
  function linha(g, tr, pts, cor, larg, tracejado) {
    if (pts.length < 2) return;
    g.strokeStyle = cor; g.lineWidth = larg; g.lineJoin = 'round'; g.setLineDash(tracejado ? [3, 4] : []);
    g.beginPath(); pts.forEach((p, i) => i ? g.lineTo(tr.sx(p[0]), tr.sz(p[1])) : g.moveTo(tr.sx(p[0]), tr.sz(p[1]))); g.stroke(); g.setLineDash([]);
  }
  const COR_EV = { e: '#3f8ad0', b: '#d0382c', p: '#9a9078', v: '#e8c76a', g: '#e08a3a', m: '#ff4a3a' };
  function marcador(g, tr, e, tam = 4) {
    const x = tr.sx(e.x), z = tr.sz(e.z); g.fillStyle = g.strokeStyle = COR_EV[e.k] || '#fff'; g.lineWidth = 1.6;
    if (e.k === 'e') g.fillRect(x - tam, z - tam, tam * 2, tam * 2);
    else if (e.k === 'b') { g.beginPath(); g.arc(x, z, tam, 0, 7); g.fill(); g.globalAlpha = .3; g.beginPath(); g.arc(x, z, tam * 2.2, 0, 7); g.stroke(); g.globalAlpha = 1; }
    else if (e.k === 'p') { g.beginPath(); g.arc(x, z, tam, 0, 7); g.stroke(); }
    else if (e.k === 'v') { g.beginPath(); g.moveTo(x, z - tam - 1); g.lineTo(x + tam + 1, z + tam); g.lineTo(x - tam - 1, z + tam); g.closePath(); g.fill(); }
    else if (e.k === 'g') { g.beginPath(); g.moveTo(x, z - tam - 1); g.lineTo(x + tam + 1, z); g.lineTo(x, z + tam + 1); g.lineTo(x - tam - 1, z); g.closePath(); g.fill(); }
    else if (e.k === 'm') { g.lineWidth = 2.4; g.beginPath(); g.moveTo(x - tam - 1, z - tam - 1); g.lineTo(x + tam + 1, z + tam + 1); g.moveTo(x + tam + 1, z - tam - 1); g.lineTo(x - tam - 1, z + tam + 1); g.stroke(); }
  }
  function desenharRota(cv, planta, rota, melhor, ev, opts = {}) {
    const g = cv.getContext('2d'), pts = rota.concat(melhor || []);
    const tr = transf(cv, limites(planta, pts), opts.pad);
    desenharFundo(g, cv, planta, tr);
    if (melhor && melhor.length > 1) linha(g, tr, melhor, 'rgba(232,199,106,.75)', Math.max(1.4, tr.k * .22), true);
    linha(g, tr, rota, 'rgba(236,230,214,.9)', Math.max(1.4, tr.k * .22));
    for (const e of (ev || [])) marcador(g, tr, e, opts.tam || 4);
    return tr;
  }

  // ---------------------------------------------------------------- imagem: copiar e salvar
  async function copiarImagem(cv) {
    try { const blob = await new Promise(r => cv.toBlob(r, 'image/png')); await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]); return true; } catch (e) { return false; }
  }
  function baixarImagem(cv, nome) { try { const a = document.createElement('a'); a.download = nome; a.href = cv.toDataURL('image/png'); document.body.appendChild(a); a.click(); a.remove(); return true; } catch (e) { return false; } }
  async function copiarTexto(t) {
    try { await navigator.clipboard.writeText(t); return true; } catch (e) {}
    try { const a = document.createElement('textarea'); a.value = t; document.body.appendChild(a); a.select(); const ok = document.execCommand('copy'); a.remove(); return ok; } catch (e) { return false; }
  }

  // ---------------------------------------------------------------- telemetria: um quadro
  function novoS(S) {
    Sref = S; temPos = false; yawAnt = null; susto = null; lantT = 0; agachSeq = 0; corridaJan = []; hiddenAnt = null; parouT = 0; estAnt = null; anaAnt = false; procAnt = false;
    if (S) healthAnt = S.health;
  }
  function categoria(S, P, v) {
    if (S.hidden) return 'escondida';
    if (P.sprinting && v > .5) return 'correndo';
    if (v < .12) return 'parada';
    return 'andando';
  }
  function evento(c, k, x, z) { if (c.ev.length < 400) c.ev.push({ k, x: r1(x), z: r1(z) }); }
  function frame(dt, ativo) {
    agora += dt;
    quadroVisual(dt);
    const S = C.S;
    if (S !== Sref) novoS(S);
    if (C.mode !== 'jogo' || !S) { if (C.mode === 'titulo') quadroTitulo(dt); return; }
    // início de uma noite nova: zera a telemetria e usa o que foi escolhido na Central (roleta, tarô)
    if (S.tempo + 3 < ultTempo && S.chapter === 0 && !S.mortes) { N = novaNoite(); noiteNova(S); }
    else if (!N.nasceu && S.tempo < 5 && S.chapter === 0) { noiteNova(S); }
    ultTempo = S.tempo;
    const P = C.P, M = C.M, c = NC(S.chapter);
    if (S.chapter !== capAnt) { capAnt = S.chapter; memT = 5; c.mapa = C.W.mapa; }
    if (S.dead || C.ui === 'morte') { c.cat.morta += dt; return; }
    if (C.ui === 'dialogo') { c.cat.dialogo += dt; return; }
    if (C.ui === 'nota' || C.ui === 'diario' || C.ui === 'teclado') { c.cat.notas += dt; return; }
    if (!ativo) return;
    if (!c.mapa) c.mapa = C.W.mapa;
    // velocidade medida por mim (sem depender de campos internos)
    let v = 0;
    if (temPos) { const d = Math.hypot(P.pos.x - px, P.pos.z - pz); v = d > 4 ? 0 : d / Math.max(dt, 1e-3); }
    px = P.pos.x; pz = P.pos.z; temPos = true;
    const cat = categoria(S, P, v); c.cat[cat] += dt;
    if (v > .12 && !S.hidden) { c.ruidoSoma += P.noiseR * dt; c.ruidoN += dt; if (P.crouch) { c.agachMov += dt; agachSeq += dt; } else agachSeq = 0; } else if (!S.hidden && cat === 'parada') agachSeq = 0;
    S.flashOn ? lantT += dt : lantT = 0;
    corridaJan.push([agora, cat === 'correndo' ? dt : 0]); while (corridaJan.length && corridaJan[0][0] < agora - 10) corridaJan.shift();
    // eventos para o mapa
    if (S.hidden && !hiddenAnt) { evento(c, 'e', px, pz); c.esconde++; }
    hiddenAnt = S.hidden;
    if (P.noiseR >= 14 && agora - ultAlto > 3) { ultAlto = agora; evento(c, 'b', px, pz); }
    if (cat === 'parada' && !S.hidden) { parouT += dt; if (parouT > 4 && !parouMarcado) { parouMarcado = true; evento(c, 'p', px, pz); } } else { parouT = 0; parouMarcado = false; }
    const est = M.ativo ? M.state : null;
    if (est === 'caca' && estAnt !== 'caca') { evento(c, 'v', px, pz); c.visto++; sustoNovo('o Inspetor te achar'); }
    estAnt = est;
    if (C.ANA.ativa && !anaAnt) sustoNovo('a Menina que conta');
    anaAnt = !!C.ANA.ativa;
    if (C.PROC.fase && !procAnt) sustoNovo('a Procissão');
    procAnt = !!C.PROC.fase;
    if (S.health < healthAnt - .5) { c.golpes++; evento(c, 'g', px, pz); sustoNovo('o golpe'); }
    healthAnt = S.health;
    // amostra da rota e janela dos últimos 60 s para a autópsia
    amT -= dt;
    if (amT <= 0) {
      amT = .5;
      if (c.rota.length < 1400) c.rota.push([r1(px), r1(pz)]);
      const ent = M.ativo ? M.pos : C.ANA.ativa ? C.ANA.pos : C.PROC.fase === 'passando' ? C.PROC.pos : null;
      ult60.push({ x: px, z: pz, mx: ent ? ent.x : null, mz: ent ? ent.z : null, ru: P.noiseR, h: !!S.hidden });
      if (ult60.length > 120) ult60.shift();
    }
    pulometro(dt);
    // sala nova: ponto de giz com os segredos que ainda restam ali
    if (P.room && P.room !== salaAnt) { salaAnt = P.room; entrouSala(P.room); }
    // modo memória
    if (memT > 0) memT -= dt;
  }

  // ---------------------------------------------------------------- pulômetro
  function sustoNovo(src) {
    if (!OPT.pulometro) return;
    susto = { t: agora, src, reagiu: false }; N.sustos[src] = (N.sustos[src] || 0) + 1;
  }
  function pulometro(dt) {
    const P = C.P; if (yawAnt == null) { yawAnt = P.yaw; return; }
    let dy = P.yaw - yawAnt; while (dy > Math.PI) dy -= 2 * Math.PI; while (dy < -Math.PI) dy += 2 * Math.PI; yawAnt = P.yaw;
    if (!susto || susto.reagiu) return;
    if (agora - susto.t > .7) { susto = null; return; }
    const w = Math.abs(dy) / Math.max(dt, 1e-3);
    if (w > 5 && Math.abs(dy) > .06) { susto.reagiu = true; N.pulos++; N.pulosPor[susto.src] = (N.pulosPor[susto.src] || 0) + 1; }
  }

  // ---------------------------------------------------------------- salas e segredos que restam
  const SALA_NOME = { aula: 'sala de aula', diret: 'diretoria', enferm: 'enfermaria', biblio: 'biblioteca', secreta: 'sala do diretor', celeste: 'quarto da irmã', roup: 'rouparia', posto: 'posto', maq: 'casa de máquinas', despensa: 'despensa', cozinha: 'cozinha', hall: 'recepção', dormE: 'dormitório E', brinq: 'sala de brinquedos', corr: 'corredor', refeit: 'refeitório', cap: 'capela' };
  const nomeSala = id => SALA_NOME[id] || 'uma sala';
  const mapaDe = n => n.onde ? n.onde[0] : (/^e_/.test(n.id) ? 'estrada' : null);
  const acervo = () => C.lsGet('hora-silencio-v3-acervo', {}) || {};
  function segredosNotas() { return [...R.notas, ...R.paginas].filter(n => n.secreta); }
  const achada = (n, S, a) => !!(a[n.id] || (S && S.notes && S.notes[n.id]));
  function entrouSala(r) {
    const S = C.S, d = D(); const k = C.W.mapa + ':' + r.id, jaVista = !!d.salas[k];
    if (!jaVista) { d.salas[k] = 1; salvar(d); }
    const dot = $('#l6b-dot'); if (!dot) return;
    if (!OPT.segRestam || !jaVista) { dot.classList.remove('on'); return; }
    const a = acervo(), n = segredosNotas().filter(x => x.onde && x.onde[0] === C.W.mapa && x.onde[1] === r.id && !achada(x, S, a)).length;
    if (!n) { dot.classList.remove('on'); return; }
    dot.innerHTML = `<i></i>${n} ${n === 1 ? 'segredo resta' : 'segredos restam'} aqui`;
    dot.classList.add('on'); clearTimeout(dot._to); dot._to = setTimeout(() => dot.classList.remove('on'), 6000);
  }

  // ---------------------------------------------------------------- noite nova: pendências da Central
  function noiteNova(S) {
    N.nasceu = true;
    const d = D(); let mudou = false;
    if (d.pendente.roleta) { C.conquista('l6b_roleta'); d.pendente.roleta = false; mudou = true; }
    if (d.pendente.taro) { C.conquista('l6b_taro'); d.pendente.taro = false; mudou = true; }
    if (d.titulosGanhos && !d.titulosGanhos.hospede) { d.titulosGanhos.hospede = 1; mudou = true; }
    if (mudou) salvar(d);
    if (U.visitante && U.visitante()) { setTimeout(() => C.toast && C.toast('Visitante: esta noite não grava nada. Só pra experimentar.'), 2500); }
  }

  // ---------------------------------------------------------------- quadro visual (vinheta, memória, dica de segurar)
  function quadroVisual(dt) {
    const b = document.body.classList;
    const jogo = C.mode === 'jogo' && C.S && !C.S.dead;
    b.toggle('l6b-imersao', !!OPT.imersao && jogo);
    b.toggle('l6b-mem', !!OPT.memoria && jogo && memT <= 0);
    const vg = $('#l6b-vinheta');
    if (vg) {
      if (OPT.imersao && jogo && C.ui !== 'pausa') {
        const S = C.S, v = clamp(1 - S.health / 100, 0, 1), f = S.stamina < 15 ? .15 : 0;
        vinhetaT += dt; vg.style.opacity = String(clamp(v * .75 + f * (.5 + .5 * Math.sin(vinhetaT * 6)), 0, .85));
      } else vg.style.opacity = '0';
    }
  }

  // ---------------------------------------------------------------- título: linha, sonho, casa, previsão, chip
  function montarTitulo() {
    const t = $('#title'); if (!t || $('#l6b-linha')) return;
    const sub = $('#l6-meta') || $('#t-memoria');
    const linha = document.createElement('div'); linha.id = 'l6b-linha'; (sub || $('#t-memoria')).after(linha);
    const sonho = document.createElement('div'); sonho.id = 'l6b-sonho'; linha.after(sonho);
    const casa = document.createElement('canvas'); casa.id = 'l6b-casa'; casa.width = 190; casa.height = 120; casa.setAttribute('aria-hidden', 'true'); t.appendChild(casa);
    const chip = document.createElement('button'); chip.id = 'l6b-chip'; chip.type = 'button'; chip.title = 'Trocar de perfil'; t.appendChild(chip);
    const vis = document.createElement('div'); vis.id = 'l6b-visitante'; vis.hidden = true; t.appendChild(vis);
    chip.onclick = () => CE.abrir('perfis');
    const sh = $('#l6-sem-hoje'); const prev = document.createElement('div'); prev.id = 'l6b-prev'; (sh || $('#t-extras')).after(prev);
    const inp = $('#l6-semente'); const ds = $('#o-desafio');
    const att = () => { const v = (inp && inp.value) || (ds && ds.value) || ''; prev.innerHTML = previsao(hashSemente(v || '') || ''); };
    if (inp) { inp.addEventListener('input', att); inp.addEventListener('change', att); }
    if (ds) { ds.addEventListener('input', att); ds.addEventListener('change', att); }
    // botão da Central
    const menu = $('#title .menu'); if (menu && !$('#b-l6b')) { const b = document.createElement('button'); b.className = 'btn'; b.id = 'b-l6b'; b.textContent = 'Central do rejogo'; b.onclick = () => CE.abrir('hoje'); const ref = $('#b-l6-mortes') || $('#b-opc'); ref.after(b); }
    // elementos de jogo
    const hud = $('#hud'); if (hud) {
      if (!$('#l6b-dot')) { const d = document.createElement('div'); d.id = 'l6b-dot'; hud.appendChild(d); }
      if (!$('#l6b-hold')) { const h = document.createElement('div'); h.id = 'l6b-hold'; hud.appendChild(h); }
    }
    if (!$('#l6b-vinheta')) { const v = document.createElement('div'); v.id = 'l6b-vinheta'; document.body.appendChild(v); }
    atualizarTitulo();
  }
  function previsao(sem) {
    if (!sem) return '';
    const v = prng(hashStr(sem + '|clima'))(); const clima = v < .28 ? 'temporal' : v < .55 ? 'garoa' : v < .8 ? 'neblina' : 'seca';
    const pal = ['lua azulada', 'verde doente', 'âmbar abafado', 'luto cinza', 'calor doente'][hashStr(sem + '|pal') % 5];
    const info = { temporal: ['Temporal', 'a chuva esconde os seus passos e os dele', 'médio'], garoa: ['Garoa', 'quase quieta, ele ouve bem', 'médio'], neblina: ['Neblina fechada', 'você enxerga pouco à frente', 'alto'], seca: ['Noite seca', 'sem chuva para esconder nada: cada passo conta', 'alto'] }[clima];
    return `<b>previsão da noite ${esc(sem)}</b>: ${info[0]}, ${esc(pal)} · ${info[1]} · perigo ${info[2]}`;
  }
  function atualizarTitulo() {
    montarTitulo2();
  }
  function montarTitulo2() {
    const d = D(), l = $('#l6b-linha'), chip = $('#l6b-chip'); if (!l) return;
    const tit = T.TITULOS.find(x => x.id === d.titulo) || T.TITULOS[T.TITULOS.length - 1];
    const noites = (d.noites || []).length;
    l.innerHTML = `<em>${esc(tit.nome)}</em>${noites ? ` · ${noites} ${noites === 1 ? 'noite terminada' : 'noites terminadas'}` : ''}${d.sonhoGlifo ? ' ' + glifoSvg(d.sonhoGlifo, 16) : ''}`;
    const pf = CE ? CE.perfis.atual() : null;
    if (chip && pf) { chip.innerHTML = `<i style="background:${pf.cor}"></i>${esc(pf.nome)}${CE.perfis.ehVisita() ? ' (visita)' : ''}`; }
    const vis = $('#l6b-visitante'); if (vis) { const eh = CE && CE.perfis.ehVisita(); vis.hidden = !eh; if (eh) vis.textContent = 'Modo visitante: só pra experimentar. Nada desta visita é gravado.'; }
    const sn = $('#l6b-sonho'); if (sn) { sn.textContent = OPT.sonhoTitulo ? (d.sonhoTxt || '') : ''; }
    const casa = $('#l6b-casa'); if (casa) { casa.style.display = OPT.casaTitulo ? '' : 'none'; if (OPT.casaTitulo) desenharCasa(casa, 0); }
  }
  function sonhar(d) {
    // gera o "Sonhei que..." a partir do que aconteceu na noite (alguns detalhes são mentiras plantadas)
    const m = d.ultimaNoite || {}; const base = pick(T.SONHOS);
    return base.replace('{armario}', m.armarioSala ? `da ${nomeSala(m.armarioSala)}` : 'do corredor').replace('{n}', String(Math.max(3, (m.mortes || 0) + 3))).replace('{sala}', nomeSala(m.salaMorte || 'aula'));
  }
  function desenharCasa(cv, t) {
    const g = cv.getContext('2d'), W = cv.width, H = cv.height; g.clearRect(0, 0, W, H);
    const c = C.lsGet('hora-silencio-v2-conq', {}) || {}, total = R.conquistas.length, feitas = R.conquistas.filter(x => c[x.id]).length;
    const janelas = 18, acesas = Math.min(janelas, Math.floor(feitas / Math.max(1, total) * janelas + (feitas > 0 ? 1 : 0)));
    g.fillStyle = '#0a0907'; g.strokeStyle = '#2c2720'; g.lineWidth = 1;
    g.fillRect(14, 44, 162, 70); g.strokeRect(14, 44, 162, 70);
    g.beginPath(); g.moveTo(8, 44); g.lineTo(95, 16); g.lineTo(182, 44); g.closePath(); g.fill(); g.stroke();
    g.fillRect(150, 10, 18, 40); g.strokeRect(150, 10, 18, 40);
    const stats = C.lsGet('hora-silencio-stats', {}) || {}, verd = !!(stats.finais && stats.finais.verdadeiro);
    const torre = feitas >= total && total > 0;
    const quente = '#ffcf7a', frio = '#1a1713';
    let i = 0;
    for (let linha = 0; linha < 3; linha++) for (let col = 0; col < 6; col++, i++) {
      const x = 22 + col * 26, y = 52 + linha * 21, acesa = i < acesas, prox = i === acesas && acesas < janelas;
      g.fillStyle = acesa ? quente : (prox && Math.sin(agora * 2.6) > 0 ? '#7a5a22' : frio);
      if (acesa) { g.shadowColor = quente; g.shadowBlur = 6; }
      g.fillRect(x, y, 12, 13); g.shadowBlur = 0; g.strokeStyle = '#2c2720'; g.strokeRect(x, y, 12, 13);
    }
    g.fillStyle = verd ? quente : frio; if (verd) { g.shadowColor = quente; g.shadowBlur = 8; } g.fillRect(90, 24, 10, 10); g.shadowBlur = 0; g.strokeRect(90, 24, 10, 10);
    g.fillStyle = torre ? quente : frio; if (torre) { g.shadowColor = quente; g.shadowBlur = 8; } g.fillRect(155, 16, 8, 10); g.shadowBlur = 0; g.strokeRect(155, 16, 8, 10);
    g.fillStyle = '#857a63'; g.font = '10px "Special Elite", monospace'; g.fillText(`${feitas}/${total} janelas`, 14, 118 - 0);
  }
  function quadroTitulo(dt) {
    tituloT += dt; casaT += dt;
    if (!tituloMostrado) { tituloMostrado = true; if (CE) CE.perfis.overlay(); atualizarTitulo(); }
    if (casaT > .5) { casaT = 0; const cv = $('#l6b-casa'); if (cv && OPT.casaTitulo && !$('#title').hidden) desenharCasa(cv, tituloT); }
  }

  // ---------------------------------------------------------------- morte comentada, autópsia e diagnóstico
  function morteVars(quem) {
    const S = C.S, P = C.P, W = C.W; let arm = null;
    for (const L of (W.lockers || [])) { const d = Math.hypot(L.x - P.pos.x, L.z - P.pos.z); if (arm == null || d < arm) arm = d; }
    const cap = NC(S.chapter), corridaS = Math.round(corridaJan.reduce((a, x) => a + x[1], 0));
    return {
      quem, armario: arm == null ? null : Math.max(1, Math.round(arm / .75)), lantT: Math.round(lantT), agachPassos: Math.round(agachSeq / .6), corridaS,
      garrafas: S.inv.garrafas || 0, kits: S.inv.kits || 0, pilhas: S.inv.pilhas || 0, bateria: S.battery, vida: S.health, perdidoS: Math.max(0, S.tempo - (U.ultSaveTempo ? U.ultSaveTempo() : S.tempo)),
      escondida: !!S.hidden, mortesCap: (N.mortes.filter(m => m.cap === S.chapter).length) + 1, cap: S.chapter, ruido: C.P.noiseR, pulos: N.pulos, lanterna: !!S.flashOn
    };
  }
  function frasesMorte(v) {
    const ok = T.MORTE_FRASES.filter(f => { try { return f.ok(v); } catch (e) { return false; } });
    const max = Math.max(...ok.map(f => f.p)); const top = ok.filter(f => f.p >= max - 1);
    return pick(top).t(v);
  }
  const DIAG = {
    inspetor: 'Treine isto: apague a lanterna, agache (C) e deixe os estalos dele passarem antes de andar.',
    ana: 'Treine isto: luz nela, olho nela e passo para trás. Uma porta fechada entre vocês resolve.',
    proc: 'Treine isto: decore o armário mais próximo de cada corredor ANTES de as luzes piscarem.'
  };
  function morte(quem) {
    try {
      const S = C.S, P = C.P, d = D();
      const c = NC(S.chapter); evento(c, 'm', P.pos.x, P.pos.z);
      const v = morteVars(quem);
      N.mortes.push({ quem, cap: S.chapter, t: Math.round(S.tempo) });
      N.seqQuem = N.seqQuem.quem === quem ? { quem, n: N.seqQuem.n + 1 } : { quem, n: 1 };
      // pontos de morte acumulados por mapa (para o mapa de calor da Central)
      const mp = C.W.mapa, arr = d.mortesPts[mp] = d.mortesPts[mp] || [];
      arr.push([r1(P.pos.x), r1(P.pos.z), quem, S.chapter]); while (arr.length > 90) arr.shift();
      if (!d.plantas[mp]) d.plantas[mp] = plantaAtual();
      d.mortesPorQuem[quem] = (d.mortesPorQuem[quem] || 0) + 1;
      d.mortesTot = (d.mortesTot || 0) + 1;
      d.ultimaNoite = Object.assign(d.ultimaNoite || {}, { salaMorte: P.room && P.room.id, mortes: S.mortes, armarioSala: null });
      marcarDia(d, false);
      // taro: cartas que se liberam ao morrer de formas diferentes
      salvar(d);
      // tela de morte
      const dm = $('#death'); if (!dm) return;
      let el = $('#l6b-morte');
      if (!el) {
        el = document.createElement('div'); el.id = 'l6b-morte'; const ref = $('#death-causa'); ref.after(el);
        const x = document.createElement('div'); x.id = 'l6b-morte-x'; el.after(x);
        const cv = document.createElement('canvas'); cv.id = 'l6b-auto'; cv.width = 560; cv.height = 300; cv.hidden = true; ($('#death-dica') || $('#death-causa')).after(cv);
        const b = document.createElement('button'); b.className = 'btn'; b.id = 'l6b-autopsia'; b.textContent = 'Autópsia: o último minuto'; $('#dt-retry').after(b);
        b.onclick = () => { const c2 = $('#l6b-auto'); c2.hidden = !c2.hidden; if (!c2.hidden) autopsia(c2); b.textContent = c2.hidden ? 'Autópsia: o último minuto' : 'Fechar a autópsia'; };
      }
      $('#l6b-auto').hidden = true; $('#l6b-autopsia').textContent = 'Autópsia: o último minuto';
      el.textContent = frasesMorte(v);
      const tit = T.TITULOS.find(x => x.id === d.titulo);
      let extra = '';
      if (N.pulos > 0 && OPT.pulometro) extra += `Você pulou ${N.pulos} ${N.pulos === 1 ? 'vez' : 'vezes'} nesta noite. `;
      extra += `${glifoSvg(S.semente)} ${tit ? esc(tit.nome) : ''}`;
      if (N.seqQuem.n >= 3) extra += `<span class="amarelo">${N.seqQuem.n} mortes seguidas pelo mesmo motivo. ${esc(DIAG[quem] || '')}</span>`;
      $('#l6b-morte-x').innerHTML = extra;
    } catch (e) { console.warn('[l6b morte]', e); }
  }
  function autopsia(cv) {
    const d = D(), g = cv.getContext('2d'), arr = ult60.slice(-120);
    if (arr.length < 2) { g.fillStyle = '#050403'; g.fillRect(0, 0, cv.width, cv.height); g.fillStyle = '#857a63'; g.font = '13px "Special Elite"'; g.fillText('Pouco tempo de rastro para desenhar.', 20, 30); return; }
    const planta = plantaAtual(), pts = arr.map(a => [a.x, a.z]);
    const tr = transf(cv, limites(planta, pts), 8); desenharFundo(g, cv, planta, tr);
    linha(g, tr, pts, 'rgba(236,230,214,.9)', 2);
    const ent = arr.filter(a => a.mx != null).map(a => [a.mx, a.mz]); linha(g, tr, ent, 'rgba(192,57,43,.9)', 2, true);
    arr.forEach(a => { if (a.ru >= 10) { g.fillStyle = 'rgba(220,50,40,.75)'; g.beginPath(); g.arc(tr.sx(a.x), tr.sz(a.z), 3 + a.ru * .12, 0, 7); g.fill(); } if (a.h) { g.fillStyle = '#3f8ad0'; g.fillRect(tr.sx(a.x) - 3, tr.sz(a.z) - 3, 6, 6); } });
    // seta do Inspetor no último ponto conhecido
    const ult = arr[arr.length - 1];
    if (ult.mx != null) { const X = tr.sx(ult.mx), Z = tr.sz(ult.mz); g.fillStyle = '#c0392b'; g.beginPath(); g.moveTo(X, Z - 8); g.lineTo(X + 6, Z + 5); g.lineTo(X - 6, Z + 5); g.closePath(); g.fill(); }
    marcador(g, tr, { k: 'm', x: ult.x, z: ult.z }, 5);
    g.fillStyle = '#857a63'; g.font = '11px "Special Elite", monospace';
    g.fillText('branco: você · tracejado vermelho: ele · pontos vermelhos: barulho · quadrado azul: escondida', 8, cv.height - 6);
  }

  function marcarDia(d, final) {
    const k = diaChave(); const x = d.dias[k] = d.dias[k] || { mortes: 0, final: false, tempo: 0, diaria: false };
    const S = C.S;
    if (!final) x.mortes++; else { x.final = true; x.tempo = Math.round(S.tempo); }
    if (S && S.semente === sementeDoDia()) x.diaria = true;
    x.sem = (S && S.semente) || x.sem;
    const ks = Object.keys(d.dias); if (ks.length > 420) delete d.dias[ks.sort()[0]];
  }

  // ---------------------------------------------------------------- fim de capítulo
  function barraHtml(cat, melhor) {
    const tot = CATS.reduce((a, k) => a + cat[k], 0) || 1;
    const seg = o => CATS.filter(k => o[k] > 0).map(k => `<i style="width:${(o[k] / tot * 100).toFixed(1)}%;background:${T.CAT_CORES[k]}" title="${T.CAT_NOMES[k]}"></i>`).join('');
    let h = `<div class="l6b-barra" role="img" aria-label="tempo por categoria">${seg(cat)}</div>`;
    if (melhor) { const tb = CATS.reduce((a, k) => a + melhor[k], 0) || 1; h += `<div class="l6b-barra melhor" title="sua melhor corrida">${CATS.filter(k => melhor[k] > 0).map(k => `<i style="width:${(melhor[k] / tb * 100).toFixed(1)}%;background:${T.CAT_CORES[k]}"></i>`).join('')}</div>`; }
    return h;
  }
  function legendaHtml(cat, melhor) {
    return CATS.filter(k => cat[k] >= 1).map(k => {
      let df = ''; if (melhor && melhor[k] != null) { const x = Math.round(cat[k] - melhor[k]); if (Math.abs(x) >= 3) df = ` <em class="${x < 0 ? 'bom' : 'ruim'}">${x < 0 ? '▼' : '▲'}${Math.abs(x)}s</em>`; }
      return `<span style="--c:${T.CAT_CORES[k]}">${T.CAT_NOMES[k]} ${seg(cat[k])}${df}</span>`;
    }).join('');
  }
  function maiorFatia(cat) {
    const tot = CATS.reduce((a, k) => a + cat[k], 0) || 1;
    const pesos = { correndo: 1.7, escondida: 1.3, parada: 1.2, dialogo: 1.1, notas: 1.1, morta: 1.5, andando: .5 };
    return CATS.map(k => [k, cat[k] / tot * (pesos[k] || 1)]).sort((a, b) => b[1] - a[1])[0][0];
  }
  function segredosDoMapa(mapa) {
    const S = C.S, a = acervo(), L = segredosNotas().filter(n => mapaDe(n) === mapa);
    return { total: L.length, achados: L.filter(n => achada(n, S, a)).length };
  }
  function fimCap(c, rk, ant) {
    try {
      const S = C.S, d = D(), cap = NC(S.chapter), fc = $('#fimcap'); if (!fc) return;
      let side = $('#l6b-fc'); if (!side) { side = document.createElement('div'); side.id = 'l6b-fc'; side.className = 'l6b-side'; fc.appendChild(side); }
      fcRepete = !!(ant && ant.rank); fcAtivo = true; fcT = 0; fcSeguro = false; holdE = 0;
      // conquistas dos modos
      if (OPT.memoria) C.conquista('l6b_memoria');
      if (OPT.imersao) C.conquista('l6b_olhos');
      if (!cap.mapa) cap.mapa = C.W.mapa;
      const planta = plantaAtual(); if (!d.plantas[cap.mapa]) d.plantas[cap.mapa] = planta;
      const mel = d.melhor[c.id];
      const total = CATS.reduce((a, k) => a + cap.cat[k], 0);
      const novoMelhor = !mel || S.capT < mel.t;
      let h = '';
      if (OPT.rotaFim) {
        h += `<h4>Onde o tempo foi</h4>${barraHtml(cap.cat, mel && mel.cat)}<div class="l6b-leg">${legendaHtml(cap.cat, mel && mel.cat)}</div>`;
        const f = maiorFatia(cap.cat); const pc = Math.round(cap.cat[f] / (total || 1) * 100);
        h += `<div class="l6b-dica">${pc}% do capítulo ${T.CAT_NOMES[f]}. ${esc(T.CAT_DICA[f])}</div>`;
        h += `<h4>Rota do capítulo${novoMelhor ? ' <span class="l6b-novo">· nova melhor</span>' : ''}</h4><canvas id="l6b-rota" width="320" height="190"></canvas>`;
        h += `<div class="l6b-mleg"><span style="color:#ece6d6">━ agora</span><span style="color:#e8c76a">┅ melhor</span><span style="color:#3f8ad0">■ esconderijo</span><span style="color:#d0382c">● barulho</span><span style="color:#9a9078">○ parou</span><span style="color:#e8c76a">▲ caçada</span><span style="color:#ff4a3a">✕ morte</span></div>`;
      }
      // segredos que ficaram (sem dizer onde)
      const sg = segredosDoMapa(cap.mapa);
      if (sg.total) {
        const falta = sg.total - sg.achados;
        h += `<h4>Segredos deste lugar</h4><div>Havia <b>${sg.total}</b>; você achou <b>${sg.achados}</b>.</div><div class="l6b-segs" aria-label="${falta} segredos ainda sem achar">` + Array.from({ length: sg.total }, (_, i) => `<span class="l6b-seg ${i < sg.achados ? 'ok' : (fcRepete ? 'acende' : '')}">${i < sg.achados ? '✦' : '?'}</span>`).join('') + '</div>';
      }
      // como a casa viu você
      const f = maiorFatia(cap.cat);
      h += `<div class="l6b-casaviu">“${esc(pick(T.CASA_VIU[f] || T.CASA_VIU.andando))}” — o Inspetor<small>${esc(T.CASA_DICA[f] || '')}</small></div>`;
      h += `<div class="l6b-btns"><button id="l6b-fc-cop">Copiar imagem</button><button id="l6b-fc-sav">Salvar imagem</button></div>`;
      h += `<div class="l6b-mleg" id="l6b-fc-dica">T: ficar mais um pouco · E: seguir${fcRepete ? ' · segure E: pular' : ''}</div>`;
      side.innerHTML = h;
      const cv = $('#l6b-rota');
      if (cv) {
        const tr = desenharRota(cv, planta, cap.rota, mel && mel.rota, cap.ev);
        const cop = $('#l6b-fc-cop'), sav = $('#l6b-fc-sav');
        const pronta = () => { const out = document.createElement('canvas'); out.width = 640; out.height = 420; const g = out.getContext('2d'); g.fillStyle = '#050403'; g.fillRect(0, 0, 640, 420); const mini = document.createElement('canvas'); mini.width = 640; mini.height = 380; desenharRota(mini, planta, cap.rota, mel && mel.rota, cap.ev, { tam: 6 }); g.drawImage(mini, 0, 0); g.fillStyle = '#cfc3a6'; g.font = '16px "Special Elite", monospace'; g.fillText(`${c.titulo} · ${mmss(S.capT)} · rank ${rk}`, 12, 405); return out; };
        if (cop) cop.onclick = async () => { cop.textContent = (await copiarImagem(pronta())) ? 'Copiada!' : 'Não deu'; setTimeout(() => cop.textContent = 'Copiar imagem', 1800); };
        if (sav) sav.onclick = () => { baixarImagem(pronta(), `hora-silencio-${c.id}.png`); };
      } else {
        const cop = $('#l6b-fc-cop'), sav = $('#l6b-fc-sav'); if (cop) cop.hidden = true; if (sav) sav.hidden = true;
      }
      // guarda a melhor corrida
      const rotaAgora = cap.rota.length > 700 ? cap.rota.filter((_, i) => i % 2 === 0) : cap.rota;
      d.recente = d.recente || {}; d.ultima = d.ultima || {};
      if (d.recente[c.id]) d.ultima[c.id] = d.recente[c.id];
      d.recente[c.id] = { rota: rotaAgora, ev: cap.ev.slice(0, 120) };
      if (novoMelhor) { const rota = cap.rota.length > 700 ? cap.rota.filter((_, i) => i % 2 === 0) : cap.rota; d.melhor[c.id] = { t: Math.round(S.capT), cat: { ...cap.cat }, rota, mapa: cap.mapa }; }
      if (S.semente) d.ultimaNoite = Object.assign(d.ultimaNoite || {}, { sem: S.semente });
      salvar(d);
      side.hidden = false;
    } catch (e) { console.warn('[l6b fimcap]', e); }
  }
  function quadroFim(dt) {
    const fc = $('#fimcap'); if (!fc || fc.hidden) { fcAtivo = false; const h = $('#l6b-hold'); if (h) h.classList.remove('on'); return; }
    fcT += dt;
    const h = $('#l6b-hold');
    if (fcRepete && C.keys.KeyE && fcT > .4) { holdE += dt; if (h) { h.textContent = 'segure E… ' + Math.round(clamp(holdE / .6, 0, 1) * 100) + '%'; h.classList.add('on'); } if (holdE >= .6) { holdE = 0; fcAtivo = false; C.pularFimCap(); } } else { holdE = 0; if (h) h.classList.remove('on'); }
  }
  // o quadro de fim de capítulo roda sem 'ativo', então ele tem o seu próprio gancho no frame
  function frameSempre(dt) { if (fcAtivo) quadroFim(dt); }

  // ---------------------------------------------------------------- final da noite
  function loreRazao() { try { return C.totalLore() ? C.loreAchado() / C.totalLore() : 0; } catch (e) { return 0; } }
  function totaisNoite() {
    const S = C.S, t = { cat: Object.fromEntries(CATS.map(k => [k, 0])), ruidoSoma: 0, ruidoN: 0, esconde: 0, visto: 0, golpes: 0, agachMov: 0 };
    for (const i in N.caps) { const c = N.caps[i]; for (const k of CATS) t.cat[k] += c.cat[k]; t.ruidoSoma += c.ruidoSoma; t.ruidoN += c.ruidoN; t.esconde += c.esconde; t.visto += c.visto; t.golpes += c.golpes; t.agachMov += c.agachMov; }
    t.ruido = t.ruidoN > 5 ? t.ruidoSoma / t.ruidoN : 5; t.ativo = t.cat.andando + t.cat.correndo + t.cat.escondida + t.cat.parada || 1;
    t.mortes = S ? S.mortes : 0; t.tempo = S ? S.tempo : 0;
    return t;
  }
  function arquetipo(t) {
    const S = C.S, sc = {};
    sc.corredora = (t.cat.correndo / t.ativo) / .16;
    sc.escondida = (t.cat.escondida / t.ativo) / .16 + t.esconde / 40;
    sc.silenciosa = t.ruido < 3.8 ? (3.8 - t.ruido) / 1.2 + (t.cat.parada / t.ativo) : 0;
    sc.teimosa = N.seqQuem.n >= 3 || t.mortes >= 5 ? t.mortes / 4 : 0;
    sc.imprudente = (t.visto + t.golpes) / 8;
    sc.sortuda = t.visto >= 4 && t.mortes <= 1 ? t.visto / 5 : 0;
    sc.curiosa = loreRazao() / .75;
    const ord = Object.entries(sc).sort((a, b) => b[1] - a[1]);
    return ord[0][1] >= .9 ? ord[0][0] : 'observadora';
  }
  function boletim(t) {
    const S = C.S;
    const silencio = Math.round(10 * (1 - clamp((t.ruido - 1.4) / 11, 0, 1)));
    const coragem = Math.round(clamp(10 - t.cat.escondida / t.ativo * 18 - t.mortes * .4 - N.pulos * .25 + (t.visto > 2 ? 1.5 : 0), 0, 10));
    const minutos = t.tempo / 60;
    const pressa = Math.round(clamp(10 - (minutos - 40) / 6, 0, 10));
    const eh = t.esconde;
    const esconderijo = Math.round(clamp(10 - Math.abs(eh - 8) * .6 - (t.cat.escondida / t.ativo > .3 ? 2 : 0), 0, 10));
    const atencao = Math.round(clamp(loreRazao() * 8 + (N.pulos === 0 ? 2 : 0) - t.mortes * .15, 0, 10));
    const notas = [silencio, coragem, pressa, esconderijo, atencao];
    const media = notas.reduce((a, b) => a + b, 0) / 5;
    const alta = notas.indexOf(Math.max(...notas)), baixa = notas.indexOf(Math.min(...notas));
    const mA = T.MATERIAS[alta], mB = T.MATERIAS[baixa];
    const obs = `${T.OBS_PROF[mA].alta}, mas ${T.OBS_PROF[mB].baixa}.`;
    const ciente = [...T.CIENTE].reverse().find(x => media >= x.min).t;
    return { notas, media, obs: obs.charAt(0).toUpperCase() + obs.slice(1), ciente };
  }
  function epiteto(t) {
    const p = { correndo: 2.5, escondida: 1.8, parada: 1.2, notas: 1.2, dialogo: 1.2, morta: 2 }; const tot = Object.values(t.cat).reduce((a, b) => a + b, 0) || 1;
    return T.EPITETOS[Object.keys(p).map(k => [k, t.cat[k] / tot * p[k]]).sort((a, b) => b[1] - a[1])[0][0]] || T.EPITETOS.andando;
  }
  function diarioLia(t, tipo) {
    const D6 = T.DIARIO_LIA, S = C.S;
    const l = [pick(D6.abertura), D6.esconde(t.esconde), D6.corri(t.cat.correndo), D6.mortes(t.mortes), D6.ruido(t.ruido), D6.pulos(N.pulos), pick(D6.fecho)];
    const dia = new Date(); return `${String(dia.getDate()).padStart(2, '0')}/${String(dia.getMonth() + 1).padStart(2, '0')}\n` + l.join(' ');
  }
  function sumTitulos(d, t, tipo, bol) {
    const ganho = d.titulosGanhos, S = C.S, novos = [];
    const dar = (id, cond) => { if (cond && !ganho[id]) { ganho[id] = 1; novos.push(id); } };
    dar('sombra', t.ruido < 3.4); dar('pe_chumbo', t.ruido > 9); dar('voltou', t.mortes >= 5); dar('calou_sino', tipo === 'verdadeiro');
    dar('inteira', t.mortes === 0); dar('imovel', N.pulos === 0 && OPT.pulometro); dar('bibliotecaria', loreRazao() >= .85);
    dar('muda', t.cat.escondida / t.ativo >= .25); dar('veloz', t.tempo < 45 * 60);
    return novos;
  }
  const codigoNoite = (sem, tempo, mortes, dif) => {
    const p = `${(sem || 'SEMCOD')}.${Math.round(tempo).toString(36).toUpperCase()}.${mortes.toString(36).toUpperCase()}.${DIF_LETRA[dif] || 'N'}`;
    let h = 0; for (const ch of p) h = (h * 31 + ch.charCodeAt(0)) % 46656; return `HS1-${p}-${h.toString(36).toUpperCase().padStart(3, '0')}`;
  };
  function decodificar(cod) {
    const m = String(cod || '').trim().toUpperCase().match(/^HS1-([0-9A-Z]{3,8})\.([0-9A-Z]{1,6})\.([0-9A-Z]{1,3})\.([FNP])-([0-9A-Z]{3})$/);
    if (!m) return null;
    const p = `${m[1]}.${m[2]}.${m[3]}.${m[4]}`; let h = 0; for (const ch of p) h = (h * 31 + ch.charCodeAt(0)) % 46656;
    if (h.toString(36).toUpperCase().padStart(3, '0') !== m[5]) return null;
    return { sem: m[1], tempo: parseInt(m[2], 36), mortes: parseInt(m[3], 36), dif: m[4], cod: String(cod).trim().toUpperCase() };
  }

  function cartaoCanvas(info) {
    const cv = document.createElement('canvas'); cv.width = 720; cv.height = 420; const g = cv.getContext('2d');
    const gr = g.createLinearGradient(0, 0, 0, 420); gr.addColorStop(0, '#12100d'); gr.addColorStop(1, '#050403'); g.fillStyle = gr; g.fillRect(0, 0, 720, 420);
    g.strokeStyle = '#3a3228'; g.lineWidth = 2; g.strokeRect(10, 10, 700, 400);
    g.fillStyle = '#c0392b'; g.font = '26px "IM Fell English SC", Georgia, serif'; g.fillText('A HORA DO SILÊNCIO', 28, 52);
    g.fillStyle = '#cfc3a6'; g.font = '18px "Special Elite", monospace'; g.fillText(info.titulo, 28, 82);
    g.fillStyle = '#857a63'; g.font = '14px "Special Elite", monospace';
    const linhas = [`final: ${info.final}`, `tempo ${mmss(info.tempo)} · ${info.mortes} ${info.mortes === 1 ? 'morte' : 'mortes'}`, `ruído médio ${info.ruido.toFixed(1)} m · pulou ${info.pulos}x`, `arquétipo: ${info.arq}`, `média do boletim: ${info.media.toFixed(1)}`, `semente ${info.sem || '—'} · ${info.dif}`];
    linhas.forEach((l, i) => g.fillText(l, 28, 118 + i * 24));
    // mini rotas
    const caps = Object.keys(info.rotas || {}); const wCard = 108, hCard = 76;
    caps.forEach((ci, i) => { const r = info.rotas[ci]; const mini = document.createElement('canvas'); mini.width = wCard * 2; mini.height = hCard * 2; desenharRota(mini, r.planta, r.rota, null, r.ev, { pad: 4, tam: 3 }); g.drawImage(mini, 28 + i * (wCard + 6), 280, wCard, hCard); });
    // lápide
    g.fillStyle = '#1a1713'; g.strokeStyle = '#3a3228'; g.beginPath(); g.moveTo(520, 250); g.lineTo(520, 110); g.arc(580, 110, 60, Math.PI, 0); g.lineTo(640, 250); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = '#857a63'; g.font = '12px "IM Fell English", Georgia, serif'; g.textAlign = 'center'; g.fillText('AQUI DESCANSA', 580, 128); g.fillText(info.epiteto.toUpperCase().slice(0, 22), 580, 150);
    g.fillText(info.epiteto.length > 22 ? info.epiteto.toUpperCase().slice(22, 44) : '', 580, 166); g.fillText(`${new Date().getFullYear()} · ${info.mortes}x`, 580, 200); g.textAlign = 'left';
    g.fillStyle = '#4a4235'; g.font = '11px "Special Elite", monospace'; g.fillText(info.cod, 28, 404);
    return cv;
  }

  function telaFinal(tipo) {
    try {
      const S = C.S, d = D(); const t = totaisNoite();
      // fecha o último capítulo (o final não passa por fimCap)
      const ci = S.chapter, ultimo = NC(ci); if (!ultimo.mapa) ultimo.mapa = C.W.mapa; if (!d.plantas[ultimo.mapa]) d.plantas[ultimo.mapa] = plantaAtual();
      const arq = arquetipo(t), A = T.ARQUETIPOS[arq], bol = boletim(t), epi = epiteto(t), diario = diarioLia(t, tipo);
      const novos = sumTitulos(d, t, tipo, bol);
      if (novos.length) d.titulo = novos[0];
      d.arqs[arq] = (d.arqs[arq] || 0) + 1;
      const cod = codigoNoite(S.semente, S.tempo, S.mortes, S.dif);
      const tit = T.TITULOS.find(x => x.id === d.titulo) || T.TITULOS[T.TITULOS.length - 1];
      const fin = (R.finais[tipo] && R.finais[tipo].titulo) || tipo;
      const rotas = {}; for (const i in N.caps) { const c = N.caps[i]; if (c.rota.length > 3) rotas[i] = { rota: c.rota, ev: c.ev, planta: d.plantas[c.mapa] || [], mapa: c.mapa }; }
      const reg = { t: Date.now(), tempo: Math.round(S.tempo), mortes: S.mortes, final: tipo, sem: S.semente, dif: S.dif, mods: (S.mods || []).slice(), ruido: r1(t.ruido), esconde: t.esconde, correndo: Math.round(t.cat.correndo), pulos: N.pulos, arq, epi, titulo: tit.id, media: r1(bol.media), notas: bol.notas, diario, cod, cat: Object.fromEntries(CATS.map(k => [k, Math.round(t.cat[k])])), caps: Object.fromEntries(Object.entries(N.caps).map(([k, c]) => [k, Math.round(c.cat.andando + c.cat.correndo + c.cat.escondida + c.cat.parada)])) };
      d.noites.push(reg); while (d.noites.length > 60) d.noites.shift();
      marcarDia(d, true);
      d.ultimaNoite = Object.assign(d.ultimaNoite || {}, { mortes: S.mortes, sem: S.semente });
      d.sonhoGlifo = S.semente || ''; d.sonhoTxt = sonhar(d);
      // placar de iniciais (top 5 por tempo)
      let rec = { ini: (d.iniciais || '???').slice(0, 3), tempo: reg.tempo, t: reg.t, dif: S.dif, id: reg.t };
      d.recs.push(rec); d.recs.sort((a, b) => a.tempo - b.tempo); d.recs = d.recs.slice(0, 5);
      const entrou = d.recs.includes(rec);
      salvar(d);
      if (!N.pulos && OPT.pulometro) C.conquista('l6b_calma');
      if (bol.media >= 8) C.conquista('l6b_honra');
      // desenho na tela final
      const fim = $('#ending'); if (!fim) return;
      let el = $('#l6b-end'); if (!el) { el = document.createElement('div'); el.id = 'l6b-end'; ($('#e-stats') || fim).after(el); }
      const notasHtml = T.MATERIAS.map((m, i) => `<tr><td>${m}</td><td class="n ${bol.notas[i] >= 6 ? 'az' : 'vm'}">${bol.notas[i]}</td></tr>`).join('');
      const maxS = Math.max(1, ...Object.values(N.sustos), 1);
      const sustoHtml = Object.keys(N.sustos).length ? `<div class="l6b-grafico">${Object.entries(N.sustos).map(([k, n]) => `<div><i style="height:${Math.round(n / maxS * 44) + 4}px"></i>${esc(k)}<br>${n}x${N.pulosPor[k] ? ` · ${N.pulosPor[k]} pulos` : ''}</div>`).join('')}</div>` : '<div>Nenhum susto medido nesta noite.</div>';
      const pulou = Object.entries(N.pulosPor).sort((a, b) => b[1] - a[1])[0];
      const portas = [['comum', 'Fora da cama'], ['silencio', 'Silêncio'], ['verdadeiro', 'A verdade'], ['outro', 'Quarta porta']];
      const fins = (C.lsGet('hora-silencio-stats', {}) || {}).finais || {};
      const dicasPorta = { comum: 'responda a todos', silencio: 'devolva o que tomou', verdadeiro: 'volte pelo Davi', outro: 'há uma quarta, e não é a mais fácil' };
      el.innerHTML = `
        <h4>Boletim da noite</h4>
        <div class="l6b-boletim"><h5>Colégio São Lázaro · boletim</h5><table>${notasHtml}</table>
        <div class="obs">Observação da professora: ${esc(bol.obs)}</div><div>Média ${bol.media.toFixed(1)}</div><div class="ciente">${esc(bol.ciente)}</div></div>
        <h4>Perfil de medo · ${esc(A.nome)} <span class="l6b-novo">${esc(tit.nome)}</span></h4>
        <div>${esc(A.frase)}</div>
        <div>Epíteto da noite: <b>${esc(epi)}</b> ${glifoSvg(S.semente)}</div>
        <div>Hábito que mais te custou: <b>${esc(A.habito)}</b></div>
        <div>Onde você se assustou:</div>${sustoHtml}
        ${OPT.pulometro ? `<div>Você pulou <b>${N.pulos}</b> ${N.pulos === 1 ? 'vez' : 'vezes'}${pulou ? `; o susto que mais te fez virar a câmera foi ${esc(pulou[0])}` : ''}.</div>` : ''}
        <h4>Desafio para a próxima</h4><div>${esc(A.oposto.t)}</div><small>${esc(A.oposto.dica)}</small>
        <div class="l6b-btns"><button id="l6b-ligar">Ligar este desafio e jogar</button></div>
        <h4>Diário da Lia · esta noite</h4><div class="l6b-diario">${esc(diario)}</div>
        <h4>Rota da noite</h4><div class="l6b-rotas" id="l6b-rotas"></div>
        <h4>Portas dos finais</h4><div style="text-align:center">${portas.map(([id, nome]) => `<span class="l6b-porta ${fins[id] || id === tipo ? 'on' : ''}"><b></b>${fins[id] || id === tipo ? nome : dicasPorta[id]}</span>`).join('')}</div>
        <h4>Recordes da casa</h4>
        <div class="l6b-ini">${entrou ? `<span>Você entrou no placar! Iniciais:</span><input id="l6b-ini" maxlength="3" value="${esc(rec.ini)}" aria-label="iniciais de três letras">` : '<span>Ainda não foi desta vez para o placar.</span>'}</div>
        <div id="l6b-recs"></div>
        <h4>Código da noite</h4><div>${esc(cod)} <button class="l6b-mini2" id="l6b-cod">copiar</button></div>
        <div class="l6b-btns"><button id="l6b-cart-sav">Salvar cartão (imagem)</button><button id="l6b-cart-cop">Copiar cartão</button></div>
        <div class="l6b-rotas"><figure style="grid-column:1/-1"><canvas id="l6b-cartao" width="720" height="420"></canvas></figure></div>`;
      // rotas por capítulo
      const grade = $('#l6b-rotas');
      Object.keys(rotas).forEach(i => {
        const r = rotas[i], fig = document.createElement('figure'), cv = document.createElement('canvas'); cv.width = 280; cv.height = 170;
        desenharRota(cv, r.planta, r.rota, null, r.ev, { tam: 3 }); const cap = document.createElement('figcaption'); cap.textContent = (R.capitulos[i].titulo || '').split(' — ')[0]; fig.append(cv, cap); grade.appendChild(fig);
      });
      const recsEl = () => { $('#l6b-recs').innerHTML = '<table class="l6b-ptab"><tr><th>#</th><th>iniciais</th><th>tempo</th><th>dif.</th><th>data</th></tr>' + d.recs.map((r, i) => `<tr${r === rec ? ' style="color:#e8c76a"' : ''}><td>${i + 1}</td><td>${esc(r.ini)}</td><td>${mmss(r.tempo)}</td><td>${({ facil: 'Fácil', normal: 'Normal', pesadelo: 'Pesadelo' })[r.dif] || r.dif}</td><td>${new Date(r.t).toLocaleDateString('pt-BR')}</td></tr>`).join('') + '</table>'; };
      recsEl();
      const ini = $('#l6b-ini'); if (ini) ini.oninput = () => { const v = ini.value.toUpperCase().replace(/[^A-ZÀ-Ý0-9]/g, '').slice(0, 3); ini.value = v; rec.ini = v || '???'; const dd = D(); dd.iniciais = v; const mine = dd.recs.find(x => x.id === rec.id); if (mine) mine.ini = rec.ini; salvar(dd); recsEl(); };
      $('#l6b-cod').onclick = async () => { const b = $('#l6b-cod'); b.textContent = (await copiarTexto(cod)) ? 'copiado!' : 'erro'; setTimeout(() => b.textContent = 'copiar', 1600); };
      const info = { titulo: tit.nome, final: fin, tempo: S.tempo, mortes: S.mortes, ruido: t.ruido, pulos: N.pulos, arq: A.nome, media: bol.media, sem: S.semente, dif: (C.DIFS[S.dif] || {}).nome || S.dif, epiteto: epi, cod, rotas };
      const cartao = cartaoCanvas(info); const dest = $('#l6b-cartao'); dest.getContext('2d').drawImage(cartao, 0, 0);
      $('#l6b-cart-sav').onclick = () => baixarImagem(cartao, 'hora-silencio-cartao.png');
      $('#l6b-cart-cop').onclick = async () => { const b = $('#l6b-cart-cop'); b.textContent = (await copiarImagem(cartao)) ? 'Copiado!' : 'Não deu'; setTimeout(() => b.textContent = 'Copiar cartão', 1800); };
      $('#l6b-ligar').onclick = () => ligarDesafio(A.oposto, S.semente);
    } catch (e) { console.warn('[l6b final]', e); }
  }
  function ligarDesafio(op, semAtual) {
    const sem = hashSemente(String(Math.random())) || 'DESAFIO';
    const d = $('#o-desafio'); const dif = op.dif || 'normal';
    const mods = op.mods || '';
    CE && CE.jogarCodigo(`${sem}-${DIF_LETRA[dif] || 'N'}${mods}`, dif, ['#e-menu']);
  }

  // ---------------------------------------------------------------- pausa
  function pausa() {
    try {
      const S = C.S, el = $('#l6-pausa'); if (!S || !el) return;
      let x = $('#l6b-pausa'); if (!x) { x = document.createElement('div'); x.id = 'l6b-pausa'; x.style.cssText = 'font-family:"Special Elite",monospace;font-size:12px;color:#6d6452;margin:-8px 0 14px;max-width:560px'; el.after(x); }
      const t = totaisNoite(); const s = CATS.filter(k => t.cat[k] >= 5 && k !== 'morta').map(k => `${T.CAT_NOMES[k]} ${seg(t.cat[k])}`).join(' · ');
      x.innerHTML = `${glifoSvg(S.semente, 18)} ${N.pulos ? `pulou ${N.pulos}x · ` : ''}${s ? 'até agora: ' + esc(s) : ''}`;
    } catch (e) {}
  }

  // ---------------------------------------------------------------- teclas
  function tecla(e) {
    if (e.code === 'KeyT' && fcAtivo) {
      const fc = $('#fimcap'); if (fc && !fc.hidden && !fcSeguro) {
        fcSeguro = true; if (C.pararFimCap) C.pararFimCap();
        try { document.exitPointerLock && document.exitPointerLock(); } catch (er) {}
        const d = $('#l6b-fc-dica'); if (d) d.textContent = 'Parado. Leia à vontade. E ou Enter segue.';
        return true;
      }
    }
    // Modo Memória: O lembra uma vez por capítulo
    if (OPT.memoria && e.code === 'KeyO' && C.mode === 'jogo' && !C.ui && C.S) {
      const c = NC(C.S.chapter);
      if (c.usouO >= 1) { C.toast && C.toast('Modo Memória: o lembrete deste capítulo já foi usado.'); return true; }
      c.usouO++; memT = 5;
    }
    return false;
  }

  // ---------------------------------------------------------------- diário: aba Rascunho e marcadores de giz no mapa
  function renderRascunho(el) {
    const S = C.S, d = D(), sem = (S && S.semente) || 'SEMCOD';
    el.innerHTML = `<h3>Rascunho · noite ${esc(sem)}</h3><p style="color:var(--fraco);font-size:14px;margin-bottom:8px">Anote códigos, a ordem das válvulas, suspeitas. O texto fica guardado por semente (até 400 letras) e volta quando a mesma noite for repetida. Nada sai do seu navegador.</p><textarea class="l6b-rasc" maxlength="400" id="l6b-rasc" placeholder="o que eu não posso esquecer..."></textarea><div class="l6b-mleg"><span id="l6b-rasc-n"></span></div>`;
    const ta = $('#l6b-rasc'); ta.value = d.rasc[sem] || ''; const n = $('#l6b-rasc-n'); n.textContent = `${ta.value.length}/400`;
    ta.addEventListener('keydown', ev => ev.stopPropagation());
    ta.addEventListener('keyup', ev => ev.stopPropagation());
    ta.addEventListener('input', () => { const dd = D(); dd.rasc[sem] = ta.value; salvar(dd); n.textContent = `${ta.value.length}/400`; });
  }
  let marcaTipo = 'perigo';
  const MARCAS = { perigo: ['✕', '#d0584a'], esconderijo: ['▣', '#3f8ad0'], item: ['◆', '#e8c76a'], duvida: ['?', '#cfc3a6'] };
  function marcadoresMapa(pane) {
    if (!pane || pane.querySelector('.l6b-x')) return;
    const svg = pane.querySelector('svg'); if (!svg) return; const S = C.S; if (!S) return;
    const chave = `${(S.semente || 'SEMCOD')}:${C.W.mapa}`;
    const barra = document.createElement('div'); barra.className = 'l6b-marcas l6b-x';
    barra.innerHTML = 'giz: ' + Object.entries(MARCAS).map(([k, [s]]) => `<button data-k="${k}" class="${k === marcaTipo ? 'on' : ''}" title="${k}">${s} ${k}</button>`).join('') + ' <span>clique no mapa para marcar; clique numa marca para apagar</span>';
    svg.before(barra);
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g'); g.setAttribute('class', 'l6b-giz'); svg.appendChild(g);
    const desenhar = () => { const arr = D().marcas[chave] || []; g.innerHTML = arr.map((m, i) => `<text data-i="${i}" x="${m[0]}" y="${m[1]}" fill="${MARCAS[m[2]][1]}" font-size="22" text-anchor="middle" dominant-baseline="central" style="cursor:pointer;font-family:'Special Elite',monospace">${MARCAS[m[2]][0]}</text>`).join(''); };
    desenhar();
    barra.querySelectorAll('button').forEach(b => b.onclick = ev => { ev.stopPropagation(); marcaTipo = b.dataset.k; barra.querySelectorAll('button').forEach(x => x.classList.toggle('on', x === b)); });
    svg.addEventListener('click', ev => {
      const dd = D(), arr = dd.marcas[chave] = dd.marcas[chave] || [];
      const t = ev.target.closest && ev.target.closest('text[data-i]');
      if (t) { arr.splice(+t.dataset.i, 1); } else {
        if (arr.length >= 40) arr.shift();
        const pt = svg.createSVGPoint(); pt.x = ev.clientX; pt.y = ev.clientY; const m = svg.getScreenCTM(); if (!m) return; const q = pt.matrixTransform(m.inverse());
        arr.push([Math.round(q.x), Math.round(q.y), marcaTipo]);
      }
      salvar(dd); desenhar();
    });
  }
  const dpane = $('#d-pane');
  if (dpane) new MutationObserver(() => { if ($('#diario').hidden) return; const b = document.querySelector('#diario nav .btn.on'); if (b && b.dataset.tab === 'mapa') { try { marcadoresMapa(dpane); } catch (e) {} } }).observe(dpane, { childList: true });

  // ---------------------------------------------------------------- Central do rejogo (abas, perfis, calendário...)
  const perfis = criarPerfis(C);
  const K = { C, U, R, OPT, T, D, salvar, esc, clamp, pick, mmss, seg, hashSemente, sementeDoDia, hashStr, prng, diaChave, glifoSvg, copiarTexto, copiarImagem, baixarImagem, desenharRota, plantaAtual, transf, limites, desenharFundo, marcador, linha, decodificar, codigoNoite, MAPA_CAP, DIF_LETRA, perfis, acervo, segredosNotas, achada, mapaDe, nomeSala, previsao, sonhar, get N() { return N; }, arquetipo, CATS };
  const CE = criarCentral6B(K);

  U.visitante = () => perfis.ehVisita();
  montarTitulo();
  return { frame: (dt, ativo) => { frame(dt, ativo); frameSempre(dt); }, morte, fimCap, telaFinal, tecla, atualizarTitulo, pausa, renderRascunho, abrir: CE.abrir, ligarCodigo: CE.jogarCodigo };
}
