// REJOGABILIDADE DO SUBTERRÂNEO — Lote 6, 2ª rodada
// Túneis (Cap. IV) e cemitério/capela (Cap. V): maré e regime da água sorteados pela Semente da Noite,
// ramais alagados, rotas alternativas arriscadas, cruzes das suas mortes, covas falsas, ritmo do sino,
// poço dos desejos, banco da capela, jardim de finais, rank da fuga e segredos que só aparecem na volta.
// Entra como a camada MAIS externa de tuneis()/cemiterio() em mapas.js (por fora de subterraneo-rejogo.js).
//
// Regras do projeto: nada aqui trava objetivo nem obriga backtracking; tudo é opcional ou fica no caminho.
// O que mexe com o Inspetor, com o ritmo do sino ou com a ordem dos túmulos fica atrás de !emTeste() para
// não atrapalhar o QA automático. Conteúdo de "segunda jogada" fica atrás de jaVeio(): o QA roda com save limpo.
// Rótulos de interação NUNCA contêm: cofre, escotilha, altar, "Cavar o túmulo", "Girar a válvula", porta da capela.

const R = window.ROTEIRO;
const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
const emTeste = () => { try { return !!window.__teste || !!navigator.webdriver; } catch (e) { return false; } };

// ---------------------------------------------------------------------
// conquistas novas (entram no roteiro na carga do módulo, antes do motor copiar)
// ---------------------------------------------------------------------
const CONQS = [
  { id: 'l6b_mare', nome: 'A Água Respira', desc: 'Abaixe a água dos túneis sem pisar alagada na maré alta.', secreta: true },
  { id: 'l6b_niveis', nome: 'Os Três Níveis', desc: 'Veja a cisterna seca, normal e cheia, em noites diferentes.', secreta: true },
  { id: 'l6b_assobio', nome: 'Quem Assobia', desc: 'Siga o assobio do cano e gire o registro que o faz.', secreta: true },
  { id: 'l6b_marreta', nome: 'Na Marra', desc: 'Quebre o cano mestre a pancadas em vez de seguir a ordem das válvulas.', secreta: true },
  { id: 'l6b_quase', nome: 'Quase Real', desc: 'Atravesse o corredor onde nada era real.', secreta: true },
  { id: 'l6b_gaveta', nome: 'A Gaveta de Baixo', desc: 'Abra a gaveta que só abre com os números da sua própria história.', secreta: true },
  { id: 'l6b_espelhos', nome: 'Sete Espelhos', desc: 'Olhe cada um dos sete espelhos do depósito.', secreta: true },
  { id: 'l6b_secao', nome: 'A Seção Que Nunca Existiu', desc: 'Ache a fileira do fundo do cemitério, aberta pelas suas mortes.', secreta: true },
  { id: 'l6b_ordem', nome: 'Na Ordem Deles', desc: 'Cave os três túmulos na ordem que o portão contava.', secreta: true },
  { id: 'l6b_batida', nome: 'Curto, Curto, Longo', desc: 'Responda à batida do lado de dentro da cova com o toque do Davi.', secreta: true },
  { id: 'l6b_banco', nome: 'Quieta no Banco', desc: 'Fique dez segundos imóvel no banco da capela e faça ele esquecer a caçada.', secreta: true },
  { id: 'l6b_ritmo', nome: 'Ouvido de Sineiro', desc: 'Toque o sino no ritmo certo, de primeira.', secreta: true },
  { id: 'l6b_poco', nome: 'O Poço Te Amou', desc: 'Receba três bênçãos do poço seco, em noites diferentes.', secreta: true },
  { id: 'l6b_jardim', nome: 'Canteiro Completo', desc: 'Plante, na frente da capela, uma flor para cada final.', secreta: true },
  { id: 'l6b_ouro', nome: 'Fuga de Ouro', desc: 'Faça a fuga final em tempo de medalha de ouro.', secreta: true },
  { id: 'l6b_certeira', nome: 'Pá Certeira', desc: 'Cave os três túmulos certos sem abrir nenhuma cova falsa.', secreta: true }
];
for (const c of CONQS) if (!R.conquistas.some(x => x.id === c.id)) R.conquistas.push(c);

// ---------------------------------------------------------------------
// memória própria (recordes, mortes e descobertas entre partidas)
// ---------------------------------------------------------------------
const KEY = 'hora-silencio-l6b';
const CAPS_KEY = 'hora-silencio-v3-caps';
const lsGet = (k, d) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } };
const lsSet = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
const mem = () => lsGet(KEY, {}) || {};
const memSet = fn => { const m = mem(); try { fn(m); } catch (e) {} lsSet(KEY, m); return m; };
const stats = () => lsGet('hora-silencio-stats', {}) || {};
const noite = () => Math.max(1, stats().partidas || 1);
const jaVeio = capId => { try { const c = JSON.parse(localStorage.getItem(CAPS_KEY) || '{}'); return !!(c && c[capId] && c[capId].snap); } catch (e) { return false; } };
const nomeJogadora = () => { try { const raw = localStorage.getItem('hora-silencio-nome'); if (!raw) return ''; let n = raw; try { n = JSON.parse(raw); } catch (e) {} return typeof n === 'string' ? n.trim().slice(0, 16) : ''; } catch (e) { return ''; } };
const CAP_NOME = ['o prólogo', 'o capítulo I', 'o capítulo II', 'o capítulo III', 'os túneis', 'a capela'];
const CAUSA_NOME = { inspetor: 'o Inspetor', ana: 'a Menina que conta', procissao: 'a Procissão' };

// semente: rng determinístico (mesma fórmula do subterraneo-rejogo.js, para a ordem de cavar bater com o giz do portão)
function hashStr(s) { let h = 2166136261; for (const ch of String(s)) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619) >>> 0; } return h >>> 0; }
function rngDe(S, sal) {
  const base = (S.semente || 'SEMCOD') + '|' + sal + '|' + (S.ordem || []).join('') + (S.code || []).join('') + '|' + (S.flags && S.flags._noite || 0);
  let a = hashStr(base) || 1;
  return () => { a = (Math.imul(a, 16807) + 1) >>> 0; return (a & 0x7fffffff) / 0x7fffffff; };
}
const sorteio = (S, sal, n) => Math.min(n - 1, rngDe(S, sal)() * n | 0);

// ---------------------------------------------------------------------
// registro das mortes (qualquer mapa) para as cruzes e os espelhos
// ---------------------------------------------------------------------
let gravando = false;
function gravarMortes() {
  if (gravando) return; gravando = true;
  let ult = -1;
  setInterval(() => {
    try {
      const J = window.__jogo, S = J && J.S;
      if (!S || J.mode === 'titulo') return;
      if (ult < 0 || (S.mortes || 0) < ult) { ult = S.mortes || 0; return; }
      if ((S.mortes || 0) > ult) {
        const n = S.mortes - ult; ult = S.mortes;
        if (emTeste()) return;
        memSet(m => {
          m.mortes = m.mortes || [];
          for (let i = 0; i < n; i++) m.mortes.push({ c: S.chapter, q: S.causa || 'inspetor', t: Date.now(), a: J.W.mapa, ag: !!J.P.naAgua });
          m.mortes = m.mortes.slice(-60);
        });
      }
    } catch (e) {}
  }, 400);
}
gravarMortes();

// ---------------------------------------------------------------------
// legendas de som próprias
// ---------------------------------------------------------------------
const LEG = {
  l6bAssobio: { t: 'um cano assobia, fino e baixo', imp: 1, cd: 5, cat: 'h', pos: a => a[0] },
  l6bMare: { t: 'o cano range: a maré vai subir', imp: 1, cd: 8, cat: 'p' },
  l6bGoteja: { t: 'água pingando num ramal alagado', imp: 0, cd: 6, pos: a => a[0] },
  l6bFalso: { t: 'passos e respiração onde não há ninguém', imp: 1, cd: 5, cat: 'p', pos: a => a[0] },
  l6bMarreta: { t: 'pancadas no cano mestre', imp: 1, cd: 3, cat: 'p' },
  l6bBatida: { t: 'batidas de dentro da terra', imp: 1, cd: 3, cat: 'p', pos: a => a[0] },
  l6bPoco: { t: 'algo cai no poço seco', imp: 1, cd: 4, cat: 'h', pos: a => a[0] },
  l6bRitmo: { t: 'batidas surdas no ritmo do giz', imp: 1, cd: 4, cat: 'h' },
  l6bTorto: { t: 'o sino soa torto', imp: 1, cd: 4, cat: 'p' },
  l6bSussurro: { t: 'caveiras cochichando', imp: 1, cd: 6, cat: 'h', pos: a => a[0] }
};
function legendas(A) { try { const d = A.legendas; if (d) for (const [k, v] of Object.entries(LEG)) if (!d[k]) d[k] = v; } catch (e) {} }
const legenda = (A, k, pos) => { try { A.SFX[k](pos ? { x: pos.x, y: pos.y ?? 1, z: pos.z } : undefined); } catch (e) {} };

// ---------------------------------------------------------------------
// áudio procedural curto (usa o AudioContext do motor)
// ---------------------------------------------------------------------
const audioOK = A => { const au = A.audio; return au && au.AC && au.AC.state !== 'closed' ? au : null; };
function assobio(A, pos) {
  const au = audioOK(A); if (!au) return; const t = au.AC.currentTime;
  const g = au.saida({ x: pos.x, y: 1.4, z: pos.z }, .6);
  const o = au.osc('sine', 1500, t, 1.5, g); o.frequency.linearRampToValueAtTime(1900, t + .6); o.frequency.linearRampToValueAtTime(1350, t + 1.4);
  au.env(g, t, .25, .05, 1.1);
  legenda(A, 'l6bAssobio', pos);
}
function batidaSuave(A, pos, vol = .45) {
  const au = audioOK(A); if (!au) return; const t = au.AC.currentTime;
  const g = au.saida({ x: pos.x, y: pos.y ?? .4, z: pos.z }, .6); au.burst(t, .12, 'lowpass', 300, 1, g, 0); au.env(g, t, .002, vol, .11);
}
function tomCurto(A, f, vol, pos, tipo = 'sine', dur = .6) {
  const au = audioOK(A); if (!au) return; const t = au.AC.currentTime;
  const g = au.saida(pos ? { x: pos.x, y: pos.y ?? 1.2, z: pos.z } : null, .5); au.osc(tipo, f, t, dur, g); au.env(g, t, .005, vol, dur * .9);
}

// ---------------------------------------------------------------------
// HUD de contagem simples (texto + barra)
// ---------------------------------------------------------------------
function barraTempo(id, topo = '22%') {
  let el = document.getElementById(id);
  if (!el) {
    el = document.createElement('div'); el.id = id;
    el.style.cssText = `position:absolute;left:50%;top:${topo};width:240px;margin-left:-120px;font-family:"Special Elite",monospace;font-size:15px;color:#e6c2a0;text-align:center;text-shadow:0 0 8px #000;z-index:30;pointer-events:none;opacity:0;transition:opacity .25s`;
    el.innerHTML = '<span></span><i style="display:block;margin:6px auto 0;width:200px;height:4px;background:rgba(0,0,0,.5)"><b style="display:block;height:100%;width:100%;background:#d08050"></b></i>';
    (document.getElementById('hud') || document.body).appendChild(el);
  }
  return { el, mostrar(t) { el.querySelector('span').textContent = t; el.style.opacity = '1'; }, k(v) { el.querySelector('b').style.width = clamp(v, 0, 1) * 100 + '%'; }, esconder() { el.style.opacity = '0'; } };
}
function relogioFuga() {
  let el = document.getElementById('fx-l6b-fuga');
  if (!el) {
    el = document.createElement('div'); el.id = 'fx-l6b-fuga';
    el.style.cssText = 'position:absolute;right:26px;top:14%;font-family:"Special Elite",monospace;font-size:15px;color:#d8cba8;opacity:0;text-shadow:0 0 6px #000;z-index:30;pointer-events:none;transition:opacity .4s;letter-spacing:.12em';
    (document.getElementById('hud') || document.body).appendChild(el);
  }
  return { mostrar(t) { el.textContent = t; el.style.opacity = '.7'; }, esconder() { el.style.opacity = '0'; } };
}
const canvasPlano = (A, w, h, cw, ch, desenhar, opts = {}) => {
  const THREE = A.THREE, cv = document.createElement('canvas'); cv.width = cw; cv.height = ch; const g = cv.getContext('2d'); desenhar(g, cw, ch);
  const tex = new THREE.CanvasTexture(cv);
  const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, opacity: opts.opacidade ?? 1, depthWrite: false, color: opts.cor ?? 0xffffff, side: THREE.DoubleSide });
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
  return m;
};

// =====================================================================
// TÚNEIS DE DRENAGEM — Capítulo IV
// =====================================================================
export function tuneis(A, S, def, ctx = {}) {
  const { THREE, P, M } = A;
  const grupo = A.W.grupo;
  const som = ctx.som, B = ctx.B;
  const nivel = ctx.nivel || (() => S.flags.aguaBaixa ? .04 : .42);
  const segunda = jaVeio('c4');
  const noiteN = noite();
  legendas(A);
  const giz = []; // marcas de giz que aparecem com a lanterna/vela por perto: { m, x, z, d, max }
  const gizMarca = (m, x, y, z, ry, d = 4, max = .6, semLuz = false) => { m.position.set(x, y, z); m.rotation.y = ry; m.material.opacity = 0; grupo.add(m); giz.push({ m, x, z, d, max, semLuz }); return m; };

  // ---------------- regime da água da noite: seca, normal ou cheia (muda o nível, o barulho e a fala) ----------------
  const regimes = [
    { id: 'seca', off: -.12, rr: .88, fala: 'A cisterna tá baixa hoje. Dá pra ouvir o fundo dos canos.', toast: 'Cisterna seca esta noite: a água baixa abafa menos os passos.' },
    { id: 'normal', off: 0, rr: 1, fala: '', toast: '' },
    { id: 'cheia', off: .08, rr: 1.12, fala: 'Tá cheia. A água chega mais alto que ontem. Cada passo vai ecoar.', toast: 'Cisterna cheia esta noite: a água ecoa mais cada passo.' }
  ];
  const regime = regimes[sorteio(S, 'b-regime', 3)];

  // ---------------- maré: ciclo de 70 a 110 s sorteado pela semente ----------------
  const periodo = 70 + Math.round(rngDe(S, 'b-mare')() * 40), fase0 = rngDe(S, 'b-mare-fase')() * periodo;
  let mareT = 0, tK = Math.sin(fase0 / periodo * 6.2832), congela = 0, avisoPrev = -1, viuAlta = false, pisouAlta = false, dicaMare = false, iniciou = false;
  const alta = () => tK > .35 && !S.flags.aguaBaixa, baixa = () => tK < -.35 && !S.flags.aguaBaixa;
  const noAlag = () => !!(P.room && P.room.agua) && !S.flags.aguaBaixa;

  // ---------------- ramal alagado da noite (um dos três ramais do caminho) ----------------
  const ramais = [
    { id: 't2', vizinho: 'v1', c: [-14, -18], marcas: [[-4, -19.96, 0], [-4, -16.04, Math.PI]] },
    { id: 't3', vizinho: 'v2', c: [14, -18], marcas: [[4, -19.96, 0], [4, -16.04, Math.PI]] },
    { id: 't5', vizinho: 'saida', c: [15, -36], marcas: [[8, -37.96, 0], [8, -34.04, Math.PI]] }
  ];
  const ramal = ramais[sorteio(S, 'b-ramal', 3)];
  for (const [mx, mz, ry] of ramal.marcas) { // faixa de limo escuro na parede, na boca do ramal alagado
    const limo = canvasPlano(A, 1.9, 1.3, 128, 96, (g, w, h) => {
      const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, 'rgba(20,50,22,0)'); gr.addColorStop(.35, 'rgba(24,58,26,.85)'); gr.addColorStop(1, 'rgba(10,28,14,.95)');
      g.fillStyle = gr; g.fillRect(0, 0, w, h);
      g.fillStyle = 'rgba(8,24,12,.9)'; for (let i = 0; i < 9; i++) g.fillRect(8 + i * 13, h * .45, 4, 12 + (i * 37 % 30));
    });
    limo.position.set(mx, 1.0, mz); limo.rotation.y = ry; limo.material.opacity = .8; grupo.add(limo);
  }

  // ---------------- régua de maré na parede (entrada e cisterna) ----------------
  const cvM = document.createElement('canvas'); cvM.width = 96; cvM.height = 192; const gM = cvM.getContext('2d'); const texM = new THREE.CanvasTexture(cvM);
  let kDes = 9, frozenDes = false;
  const desenharRegua = (k, gelada) => {
    gM.fillStyle = '#1c1f1a'; gM.fillRect(0, 0, 96, 192); gM.strokeStyle = '#6a7a62'; gM.lineWidth = 3; gM.strokeRect(4, 4, 88, 184);
    gM.fillStyle = '#8aa08a'; gM.font = 'bold 14px "Special Elite",monospace'; gM.textAlign = 'center'; gM.fillText('MARÉ', 48, 22);
    const y0 = 36, y1 = 176;
    for (let i = 0; i <= 8; i++) { const y = y0 + (y1 - y0) * i / 8; gM.fillRect(i % 2 ? 60 : 52, y - 1, i % 2 ? 24 : 32, 2); }
    const ny = y1 - (y1 - y0) * (k + 1) / 2;
    gM.fillStyle = 'rgba(60,120,96,.6)'; gM.fillRect(8, ny, 40, y1 - ny + 4);
    gM.fillStyle = '#3a5a2a'; gM.fillRect(8, y0 - 6, 40, 8);
    gM.fillStyle = gelada ? '#9ad0ff' : '#e6c27a'; gM.beginPath(); gM.moveTo(52, ny); gM.lineTo(36, ny - 8); gM.lineTo(36, ny + 8); gM.fill();
    texM.needsUpdate = true;
  };
  desenharRegua(tK, false);
  for (const [x, y, z, ry] of [[-3.95, 1.5, -2.2, Math.PI / 2], [-5.95, 1.6, -32, Math.PI / 2]]) {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(.5, 1), new THREE.MeshBasicMaterial({ map: texM, color: 0xa8b4a8 })); m.position.set(x, y, z); m.rotation.y = ry; grupo.add(m);
  }

  // ---------------- efeitos da maré, do regime e do ramal no barulho e na velocidade ----------------
  const rm0 = def.ruidoMul, vm0 = def.velMul;
  def.ruidoMul = () => {
    let m = rm0 ? rm0() : 1;
    if (noAlag()) {
      m *= alta() ? 1.3 : baixa() ? .85 : 1; // maré alta: passos 30% mais altos; baixa: 15% mais baixos
      m *= regime.rr;
      if (P.room.id === ramal.id) m *= 1.25; else if (P.room.id === ramal.vizinho) m *= .9;
    }
    return m;
  };
  def.velMul = () => {
    let m = vm0 ? vm0() : 1;
    if (noAlag()) { if (alta()) m *= .9; if (P.room.id === ramal.id) m *= .85; }
    return m;
  };

  // ---------------- cano que assobia + registro (só na 2ª jogada): segura a maré em baixa por 2 minutos ----------------
  if (segunda) {
    const pos = [{ x: -1.93, z: -10, ry: Math.PI / 2 }, { x: 1.93, z: -26, ry: -Math.PI / 2 }, { x: -5.93, z: -38, ry: Math.PI / 2 }][sorteio(S, 'b-registro', 3)];
    const g = new THREE.Group(); g.position.set(pos.x, 1.15, pos.z); g.rotation.y = pos.ry; grupo.add(g);
    const giro = new THREE.Group(); giro.position.z = .12; g.add(giro);
    giro.add(new THREE.Mesh(new THREE.TorusGeometry(.2, .035, 6, 14), A.MAT.bronze));
    for (let i = 0; i < 2; i++) { const r = A.box(.4, .03, .03, A.MAT.bronze, 0, 0, 0, giro, false); r.rotation.z = i * Math.PI / 2; }
    A.cyl(.06, .06, .3, A.MAT.bronze, 0, 0, 0, 8, g).rotation.x = Math.PI / 2;
    let usado = false, assT = A.rand(2, 5), girT = 0;
    const it = A.interact(g, () => usado ? 'O registro, frio e quieto.' : '<b>E</b>Girar o registro que assobia', () => {
      if (usado) return; usado = true; girT = 1.2; congela = 120;
      A.SFX.pegar(); A.emitNoise(pos.x, pos.z, 5, true); A.conquista('l6b_assobio');
      A.toast('O assobio cessa. A água fica baixa por dois minutos.');
      setTimeout(() => { if (A.W.mapa === 'tuneis') A.sub('lia', 'Era isso que o cano queria. Alguém deixou esse registro pra quem soubesse ouvir.'); }, 1400);
    });
    it.hold = 1.8; it.guarda = true; it.som = null; it.ruido = 3; it.pode = () => !usado;
    A.W.tick.push(dt => {
      if (girT > 0) { girT -= dt; giro.rotation.z -= dt * 3; }
      if (usado || S.chapter !== 4) return;
      assT -= dt;
      if (assT <= 0) { assT = A.rand(6, 9); if (Math.hypot(P.pos.x - pos.x, P.pos.z - pos.z) < 18) assobio(A, pos); }
    });
  }

  // ---------------- cano mestre: quebrar a pancadas baixa a água sem a ordem das válvulas (2ª jogada) ----------------
  if (segunda) {
    const dura = rngDe(S, 'b-marreta')() < .5 ? 3.2 : 5.2; // a semente decide o quanto o cano resiste
    const g = new THREE.Group(); g.position.set(4.3, 1.4, -41.88); grupo.add(g);
    const cano = A.cyl(.22, .22, 3.2, A.MAT.ferrugem, 0, 0, 0, 10, g); cano.rotation.z = Math.PI / 2;
    for (const x of [-.9, .9]) A.cyl(.3, .3, .12, A.MAT.ferrugem, x, 0, 0, 10, g).rotation.z = Math.PI / 2;
    const placa = canvasPlano(A, .9, .3, 128, 44, (c, w, h) => { c.fillStyle = '#2a1410'; c.fillRect(0, 0, w, h); c.fillStyle = '#c9a75a'; c.font = 'bold 22px "Special Elite",monospace'; c.textAlign = 'center'; c.fillText('NÃO BATER', w / 2, 30); });
    placa.position.set(0, -.5, .02); g.add(placa);
    const barra = A.box(.05, 1.3, .05, A.MAT.metal, 4.9, .65, -41.4, grupo, false); barra.rotation.z = .12;
    const it = A.interact(g, () => S.flags.aguaBaixa ? 'O cano mestre, rachado.' : `<b>E</b>Quebrar o cano mestre com a barra de ferro (${dura > 4 ? 'duro e ' : ''}muito barulho)`, () => {
      if (S.flags.aguaBaixa) return;
      S.flags.aguaBaixa = true; S.valv = (S.ordem || [1, 2, 3]).slice();
      A.objDone('valvulas'); A.falar('valvulas_ok'); A.progresso();
      A.SFX.pancada(4.3, -41.9); legenda(A, 'l6bMarreta'); A.SFX.cano(null); A.emitNoise(4.3, -41.9, 45, true); A.P.shake = .3; S.fear = Math.min(100, S.fear + 25);
      A.conquista('l6b_marreta');
      A.toast('O cano rachou e a água desceu de uma vez. O estrondo foi ouvido em todos os túneis.');
      if (!emTeste()) {
        if (!M.ativo) A.ativarInspetor(0, -50, 'caca'); else { M.state = 'caca'; A.planejar(M, 4.3, -41.9); M.furia = Math.min(6, (M.furia || 0) + 2); M.cool = Math.min(M.cool, 1); }
      }
      setTimeout(() => { if (A.W.mapa === 'tuneis' && !A.S.dead) A.salvarCheckpoint(); }, 3500);
    });
    it.hold = dura; it.guarda = true; it.som = 'forcar'; it.ruido = 22; it.pode = () => !S.flags.aguaBaixa;
  }

  // ---------------- corredor onde nada era real (rara, só na 2ª jogada) ----------------
  if (segunda && !emTeste() && rngDe(S, 'b-corredor')() < .4) {
    const sala = ['t2', 't3', 't6'][sorteio(S, 'b-corredor-sala', 3)];
    let dentro = 0, falsoT = A.rand(3, 6), saiu = false;
    A.W.tick.push(dt => {
      if (saiu || S.chapter !== 4) return;
      if (P.room && P.room.id === sala) {
        dentro += dt; falsoT -= dt;
        if (falsoT <= 0) {
          falsoT = A.rand(5, 9);
          const a = A.rand(0, 6.28), r = A.rand(3, 6), px = P.pos.x + Math.cos(a) * r, pz = P.pos.z + Math.sin(a) * r, t = Math.random();
          if (t < .4) { A.SFX.passoLonge({ x: px, z: pz }); legenda(A, 'l6bFalso', { x: px, z: pz }); }
          else if (t < .75 && som && som.respiraAgua) { som.respiraAgua({ x: px, y: .4, z: pz }, .3); legenda(A, 'l6bFalso', { x: px, z: pz }); }
          else { A.SFX.sussurros(1.2); A.toast('"...Lia..."'); }
        }
      } else if (dentro > 8) {
        saiu = true; A.toast('Nada aqui era real. Quase.'); A.conquista('l6b_quase');
        setTimeout(() => { if (A.W.mapa === 'tuneis') A.sub('lia', 'Eu ouvi tudo. Passos, respiração, meu nome. E não tinha ninguém. Não sei qual dos dois é pior.'); }, 1800);
      }
    });
  }

  // ---------------- ossuário no depósito: as caveiras cochicham qual túmulo é o fundo da noite ----------------
  {
    const ids = R.lapides.filter(l => l.importante).map(l => l.id);
    const fundoId = ids[sorteio(S, 'tumulo-fundo', ids.length)];
    const quem = { ana: 'a menina da fita vermelha', tome: 'o menino do carrinho', davi: 'o menino do caderno' }[fundoId] || fundoId;
    const g = new THREE.Group(); g.position.set(-30.4, 0, -40.9); grupo.add(g);
    A.box(2.2, .5, 1, A.MAT.madeiraEsc, 0, .25, 0, g, false);
    const osso = new THREE.MeshStandardMaterial({ color: 0xb8ae98, roughness: .9 });
    for (let i = 0; i < 16; i++) {
      const cr = new THREE.Mesh(new THREE.SphereGeometry(.13, 8, 6), osso); cr.scale.set(1, 1.05, .95);
      cr.position.set(-.9 + (i % 8) * .26, .62 + Math.floor(i / 8) * .22, (i % 3 - 1) * .18); g.add(cr);
      const olho = A.box(.1, .04, .03, A.MAT.preto, 0, -.02, .12, cr, false); olho.position.x = 0;
    }
    let cochichou = false;
    const it = A.interact(g, () => '<b>E</b>Escutar as caveiras do ossuário', () => {
      A.SFX.sussurros(2); legenda(A, 'l6bSussurro', { x: -30.4, z: -40.9 });
      A.toast(`Elas cochicham, baixinho: "o fundo... é ${quem}... a mão... vai sair dali".`);
      if (!S.flags.l6b_ossuario) { S.flags.l6b_ossuario = true; setTimeout(() => { if (A.W.mapa === 'tuneis') A.sub('lia', 'Se isso for verdade, eu sei qual cova vai me agarrar. Se for mentira... também sei.'); }, 2600); }
    });
    A.W.tick.push(() => { if (!cochichou && Math.hypot(P.pos.x + 30.4, P.pos.z + 40.9) < 2.6) { cochichou = true; A.SFX.sussurros(1); legenda(A, 'l6bSussurro', { x: -30.4, z: -40.9 }); } });
  }

  // ---------------- gaveta de baixo da mesa do diretor: só abre com os números da sua história ----------------
  if (segunda || (stats().partidas || 0) >= 3) {
    const g = new THREE.Group(); g.position.set(7.55, 0, -56.6); g.rotation.y = -Math.PI / 2; grupo.add(g);
    A.box(.7, .5, .9, A.MAT.madeiraEsc, 0, .25, 0, g, false);
    const frente = canvasPlano(A, .6, .22, 128, 48, (c, w, h) => { c.fillStyle = '#1a120c'; c.fillRect(0, 0, w, h); c.fillStyle = '#b8a36a'; c.font = '13px "Special Elite",monospace'; c.textAlign = 'center'; c.fillText('noites · mortes · finais', w / 2, 28); });
    frente.position.set(0, .3, .46); g.add(frente);
    A.addCollider(7.1, 7.9, -57.1, -56.1);
    let aberta = !!S.flags.l6b_gaveta;
    const codigo = () => { const s = stats(); return `${(s.partidas || 1) % 10}${(s.mortes || 0) % 10}${Object.keys(s.finais || {}).length % 10}`; };
    A.interact(g, () => aberta ? 'A gaveta de baixo, vazia.' : '<b>E</b>Abrir a gaveta de baixo (3 números: noites, mortes, finais)', () => {
      if (aberta) return;
      A.abrirTeclado('GAVETA DE BAIXO · noites, mortes, finais', codigo(), () => {
        aberta = true; S.flags.l6b_gaveta = true; A.SFX.pegar(); A.conquista('l6b_gaveta');
        A.toast('Dentro: a última fotografia do Davi, de costas, olhando para a cova.');
        setTimeout(() => { if (A.W.mapa === 'tuneis') A.sub('davi', 'Eu sabia que você ia voltar vezes demais para esquecer. Era isso que ele queria.'); }, 1600);
      }, () => A.emitNoise(7.5, -56.6, 8));
    });
  }

  // ---------------- melhor corrida: grava as passagens, compara no caminho e escreve o recorde no giz ----------------
  {
    const best = mem().corrida; // { total, rooms: {id: t} }
    const rooms = {}; let t0 = 0, ultSala = null, fechou = false, ultDeltaT = -99;
    if (best && best.total) {
      const placa = canvasPlano(A, .8, .4, 128, 64, (c, w, h) => { c.fillStyle = 'rgba(0,0,0,0)'; c.fillRect(0, 0, w, h); c.fillStyle = 'rgba(225,225,210,.7)'; c.font = 'bold 18px "Special Elite",monospace'; c.textAlign = 'center'; c.fillText('MELHOR', w / 2, 26); c.font = 'bold 26px "Special Elite",monospace'; c.fillText(`${Math.floor(best.total / 60)}:${String(Math.floor(best.total % 60)).padStart(2, '0')}`, w / 2, 54); });
      gizMarca(placa, 3.94, 1.4, -4, -Math.PI / 2, 4.5, .7);
    }
    A.W.tick.push(dt => {
      if (S.chapter !== 4 || !P.room) return;
      t0 += dt;
      if (P.room.id !== ultSala) {
        ultSala = P.room.id;
        if (rooms[ultSala] === undefined) {
          rooms[ultSala] = t0;
          if (best && best.rooms && best.rooms[ultSala] !== undefined && ['t1', 'hub', 't4', 'secreta', 'saida'].includes(ultSala) && !emTeste() && t0 - ultDeltaT > 3) {
            ultDeltaT = t0; const d = t0 - best.rooms[ultSala];
            A.toast(`Você está ${Math.abs(d).toFixed(1)}s ${d <= 0 ? 'à frente da' : 'atrás da'} sua melhor corrida.`);
          }
        }
      }
      if (!fechou && S.done && S.done.sair_tuneis && !emTeste()) {
        fechou = true;
        memSet(m => { if (!m.corrida || t0 < m.corrida.total) m.corrida = { total: t0, rooms }; });
        if (!best || t0 < best.total) setTimeout(() => A.toast(`Nova melhor corrida dos túneis: ${t0.toFixed(1)}s.`), 900);
      }
    });
  }

  // ---------------- sala dos espelhos no depósito: sete espelhos para sete mortes ----------------
  const mortesTot = Math.max(stats().mortes || 0, (mem().mortes || []).length);
  if (mortesTot >= 7) {
    const log = (mem().mortes || []).slice(-7); const lidos = new Set();
    for (let i = 0; i < 7; i++) {
      const e = log[i - (7 - log.length)] || null; // alinha os mais recentes no fim
      const x = -31.3 + i * 1.0;
      A.box(.8, 1.15, .06, A.MAT.madeiraEsc, x, 1.55, -41.93, grupo, false);
      const ultimo = i === 6;
      const esp = canvasPlano(A, .68, 1.0, 96, 144, (c, w, h) => {
        const gr = c.createLinearGradient(0, 0, w, h); gr.addColorStop(0, '#1a2326'); gr.addColorStop(1, '#0a1214'); c.fillStyle = gr; c.fillRect(0, 0, w, h);
        c.fillStyle = 'rgba(120,150,150,.3)'; c.beginPath(); c.arc(w / 2, 50, 16, 0, 6.3); c.fill(); c.fillRect(w / 2 - 18, 66, 36, 56);
        c.strokeStyle = 'rgba(220,225,210,.8)'; c.lineWidth = 3; c.beginPath(); c.moveTo(14, h - 20); c.lineTo(w - 14, h - 10); c.stroke(); // marca de giz
        if (ultimo) { c.fillStyle = S.inv.lanterna ? 'rgba(230,200,120,.85)' : 'rgba(90,100,100,.5)'; c.fillRect(w / 2 + 20, 84, 8, 30); c.fillRect(w / 2 + 18, 78, 12, 8); }
        c.fillStyle = 'rgba(210,205,190,.8)'; c.font = '11px "Special Elite",monospace'; c.textAlign = 'center'; c.fillText(e ? ['P', 'I', 'II', 'III', 'IV', 'V'][e.c] || '?' : '·', w / 2, h - 28);
      });
      esp.position.set(x, 1.55, -41.89); grupo.add(esp);
      A.interact(esp, () => `<b>E</b>Olhar o espelho ${i + 1}`, () => {
        lidos.add(i);
        const txt = e ? `Espelho ${i + 1}: a Lia de ${new Date(e.t).toLocaleDateString('pt-BR')}, em ${CAP_NOME[e.c] || 'algum lugar'}. Quem pegou: ${CAUSA_NOME[e.q] || e.q}${e.ag ? ', dentro d\'água' : ''}.` : `Espelho ${i + 1}: a marca de giz de uma noite que a casa guardou sem data.`;
        A.toast(txt + (ultimo ? (S.inv.lanterna ? ' Na mão dela, a lanterna que você tem agora.' : ' A mão dela, vazia.') : ''));
        if (lidos.size === 1) setTimeout(() => { if (A.W.mapa === 'tuneis') A.sub('lia', 'Todas elas sou eu. E nenhuma ficou pra contar.'); }, 1800);
        if (lidos.size >= 7) A.conquista('l6b_espelhos');
      });
    }
    let avisouEsp = false;
    A.W.tick.push(() => { if (!avisouEsp && P.room && P.room.id === 'dep') { avisouEsp = true; setTimeout(() => { if (A.W.mapa === 'tuneis') A.toast('Na parede do fundo, sete espelhos. Um para cada vez que você não voltou.'); }, 900); } });
  }

  // ---------------- laço principal: maré, régua, gotejar, giz, conquistas ----------------
  let drip = A.rand(1.5, 3), dKReg = 0;
  A.W.tick.push(dt => {
    if (!iniciou) { iniciou = true; memSet(m => { m.regimes = m.regimes || {}; m.regimes[regime.id] = 1; if (Object.keys(m.regimes).length >= 3) A.conquista('l6b_niveis'); }); if (regime.toast && S.chapter === 4) setTimeout(() => { if (A.W.mapa === 'tuneis') A.toast(regime.toast); }, 3500); }
    // maré
    mareT += dt; if (congela > 0) congela -= dt;
    const ph = ((mareT + fase0) % periodo) / periodo;
    const alvo = congela > 0 ? -1 : Math.sin(ph * 6.2832);
    tK += (alvo - tK) * Math.min(1, dt * .8);
    // aviso: o cano range 5 s antes de a maré começar a subir
    const ph5 = ((mareT + fase0 + 5) % periodo) / periodo;
    if (avisoPrev >= 0 && avisoPrev < .75 && ph5 >= .75 && !S.flags.aguaBaixa && congela <= 0 && S.chapter === 4) {
      A.SFX.cano({ x: 0, y: 2.4, z: -36 }); legenda(A, 'l6bMare');
      if (!dicaMare) { dicaMare = true; A.toast('O cano range de longe: a maré vai subir.'); }
    }
    avisoPrev = ph5;
    if (alta()) viuAlta = true;
    if (alta() && P.naAgua) pisouAlta = true;
    if (alta() && !S.flags.l6b_subiu && S.chapter === 4) { S.flags.l6b_subiu = true; setTimeout(() => { if (A.W.mapa === 'tuneis' && !S.flags.aguaBaixa) A.sub('lia', 'A água tá subindo sozinha. Como se respirasse. Dá pra ouvir o cano antes.'); }, 1200); }
    if (!S.flags.l6b_regime && regime.fala && S.chapter === 4 && P.room && P.room.id === 'hub') { S.flags.l6b_regime = true; setTimeout(() => { if (A.W.mapa === 'tuneis') A.sub('lia', regime.fala); }, 1000); }
    // nível visual da água: regime + maré (por cima do que o mapa desenhou neste quadro)
    const off = (S.flags.aguaBaixa ? 0 : regime.off) + tK * (S.flags.aguaBaixa ? .02 : .12);
    for (const m of A.W.agua) m.position.y += off;
    // régua de maré
    dKReg -= dt;
    if (dKReg <= 0) { dKReg = .25; const gel = congela > 0; if (Math.abs(tK - kDes) > .03 || gel !== frozenDes) { kDes = tK; frozenDes = gel; desenharRegua(tK, gel); } }
    // gotejar audível na boca do ramal alagado (dica de onde a água está funda)
    drip -= dt;
    if (drip <= 0 && !S.flags.aguaBaixa) {
      drip = A.rand(2.2, 3.6);
      if (som && som.bolhas && P.room && P.room.id !== ramal.id && Math.hypot(P.pos.x - ramal.c[0], P.pos.z - ramal.c[1]) < 16) { som.bolhas({ x: ramal.c[0], y: .4, z: ramal.c[1] }, 1, .14); legenda(A, 'l6bGoteja', { x: ramal.c[0], z: ramal.c[1] }); }
    }
    // marcas de giz
    for (const q of giz) { const d = Math.hypot(P.pos.x - q.x, P.pos.z - q.z); q.m.material.opacity += (((d < q.d && (q.semLuz || S.flashOn)) ? q.max : 0) - q.m.material.opacity) * .1; }
    // conquista: a água desceu e a Lia nunca pisou alagada em maré alta
    if (S.flags.aguaBaixa && viuAlta && !pisouAlta && !S.flags.l6b_mareOk) { S.flags.l6b_mareOk = true; A.conquista('l6b_mare'); }
  });

  return def;
}

// =====================================================================
// CEMITÉRIO E CAPELA — Capítulo V (final)
// =====================================================================
export function cemiterio(A, S, def, ctx = {}) {
  const { THREE, P, M } = A;
  const grupo = A.W.grupo;
  const som = ctx.som;
  const covas = ctx.covas || [], itsTum = ctx.itsTum || {}, importantes = ctx.importantes || {};
  const lapide = ctx.lapide, emCima = ctx.emCima;
  const segunda = jaVeio('c5');
  const noiteN = noite();
  const dificil = S.dif === 'pesadelo' || (S.mods && S.mods.length > 0);
  const fim = stats();
  legendas(A);
  const giz = [];
  const gizMarca = (m, x, y, z, ry, d = 5, max = .6, semLuz = false) => { m.position.set(x, y, z); m.rotation.y = ry; m.material.opacity = 0; grupo.add(m); giz.push({ m, x, z, d, max, semLuz }); return m; };
  const terraMat = A.texMat('terra', .5, .5);
  const hoje = new Date();
  const dataHoje = hoje.toLocaleDateString('pt-BR');
  const mortesTot = Math.max(fim.mortes || 0, (mem().mortes || []).length, S.mortes || 0);

  // ---------------- cruzes das suas mortes (até 30): uma por vez que a Lia morreu ----------------
  const log = (mem().mortes || []).slice(-30);
  const nCruzes = Math.min(30, Math.max(fim.mortes || 0, log.length));
  const entradas = [...Array(Math.max(0, nCruzes - log.length)).fill(null), ...log];
  const cruzes = [];
  if (nCruzes > 0) {
    const velha = A.MAT.madeiraEsc, nova = new THREE.MeshStandardMaterial({ color: 0x8a6a44, roughness: .9 });
    const faixa = { inspetor: 0x7a1a1a, ana: 0x2a4a8a, procissao: 0xddd5c0 };
    let lidasNaNoite = 0;
    entradas.forEach((e, i) => {
      const row = i < 15 ? 0 : 1, col = i % 15, x = 5.2 + col * 1.05, z = row ? 9.7 : 8.1;
      const dia = e ? new Date(e.t) : null, deHoje = !!(dia && dia.toDateString() === hoje.toDateString());
      const gc = new THREE.Group(); gc.position.set(x, 0, z); gc.rotation.y = A.rand(-.3, .3); gc.rotation.z = A.rand(-.12, .12); grupo.add(gc);
      const mat = deHoje ? nova : velha;
      A.box(.07, .75, .07, mat, 0, .37, 0, gc, false); A.box(.4, .07, .07, mat, 0, .58, 0, gc, false); A.box(.5, .05, .9, terraMat, 0, .03, -.55, gc, false);
      if (e) A.box(.09, .12, .08, new THREE.MeshStandardMaterial({ color: faixa[e.q] || 0x555555, roughness: .9 }), 0, .45, .05, gc, false);
      cruzes.push({ x, z, e, i });
      A.interact(gc, () => e ? `<b>E</b>Cruz de ${dia.toLocaleDateString('pt-BR')}${deHoje ? ' (de hoje)' : ''}` : '<b>E</b>Uma cruz com a data apagada pela chuva', () => {
        lidasNaNoite++;
        if (!e) { A.toast('A data se apagou. Alguém plantou esta cruz antes mesmo de você contar.'); return; }
        A.toast(`Cruz de ${dia.toLocaleDateString('pt-BR')}: ${CAP_NOME[e.c] || 'algum lugar'}, ${CAUSA_NOME[e.q] || e.q}${e.ag ? ', dentro d\'água' : ''}.`);
        if (lidasNaNoite === 1) setTimeout(() => { if (A.W.mapa === 'cemiterio') A.sub('lia', `Aqui a Lia parou ${CAP_NOME[e.c] ? 'em ' + CAP_NOME[e.c] : 'sem saber onde'}. Eu me lembro do frio. Não da dor.`); }, 1500);
        S.fear = Math.min(100, S.fear + 2);
      });
    });
    // passar entre as cruzes pela primeira vez na noite: a Lia lê uma em voz baixa
    let passou = false;
    A.W.tick.push(() => {
      if (passou || nCruzes < 3 || S.chapter !== 5) return;
      for (const q of cruzes) if (Math.hypot(P.pos.x - q.x, P.pos.z - q.z) < 1.5) {
        passou = true; A.SFX.sussurros(1.2); S.fear = Math.min(100, S.fear + 5);
        const ult = cruzes[cruzes.length - 1].e;
        setTimeout(() => { if (A.W.mapa === 'cemiterio') A.sub('lia', ult ? `A última é a minha mais recente. ${CAUSA_NOME[ult.q] || 'Algo'}, ${CAP_NOME[ult.c] || 'em algum lugar'}. Passar por aqui é pior do que a fuga.` : 'Tantas cruzes. Todas viradas pra mim.'); }, 1200);
        break;
      }
    });
  }

  // ---------------- seção D: a fileira do fundo que só nasce com 10 mortes ----------------
  if (mortesTot >= 10) {
    const pedraM = A.MAT.pedraLap;
    const quadro = canvasPlano(A, 1.5, .5, 192, 64, (c, w, h) => { c.fillStyle = '#2a2018'; c.fillRect(0, 0, w, h); c.fillStyle = '#c9b88a'; c.font = 'bold 26px Georgia'; c.textAlign = 'center'; c.fillText('SEÇÃO D', w / 2, 40); });
    quadro.position.set(-15, 1.3, -44.2); grupo.add(quadro); A.box(.08, 1.3, .08, A.MAT.madeiraEsc, -15, .65, -44.3, grupo, false);
    for (let i = 0; i < 8; i++) {
      const x = -21 + i * 1.3;
      A.box(.55, .6 + (i % 3) * .08, .12, pedraM, x, .32, -44.9, grupo, false);
      A.box(.7, .06, 1.1, terraMat, x, .03, -44.2, grupo, false);
    }
    const nome = nomeJogadora() || 'LIA';
    const ultima = canvasPlano(A, .5, .6, 96, 112, (c, w, h) => { c.fillStyle = '#55534c'; c.fillRect(0, 0, w, h); c.fillStyle = '#1a1814'; c.font = 'bold 20px Georgia'; c.textAlign = 'center'; c.fillText('†', w / 2, 30); c.font = '14px Georgia'; c.fillText(nome.toUpperCase().slice(0, 12), w / 2, 62); c.fillText(dataHoje, w / 2, 86); });
    ultima.position.set(-21 + 7 * 1.3, .33, -44.83); grupo.add(ultima);
    let lida = !!S.flags.l6b_secao;
    A.interact(ultima, () => lida ? 'A pedra da seção D, com a sua data.' : '<b>E</b>Ler a última pedra da seção D', () => {
      A.toast(`"${nome.toUpperCase()} — ${dataHoje}". A data é a de hoje.`);
      if (!lida) { lida = true; S.flags.l6b_secao = true; A.conquista('l6b_secao'); S.fear = Math.min(100, S.fear + 12); setTimeout(() => { if (A.W.mapa === 'cemiterio') A.sub('lia', 'Esta seção nunca existiu no mapa da irmã Celeste. Alguém abriu pra mim, a cada vez que eu morri.'); }, 1500); }
    });
  }

  // ---------------- placa de hoje: aparece junto da primeira cova cavada ----------------
  {
    let feito = false;
    A.W.tick.push(() => {
      const ids = Object.keys(S.tumulos || {});
      if (!feito && ids.length > 0 && importantes[ids[0]] && emCima) {
        feito = true; const L = importantes[ids[0]];
        const m = S.mortes || 0, tot = Math.max(fim.mortes || 0, m), txt1 = tot === 0 ? 'ainda não' : tot > 20 ? 'de novo' : String(tot);
        const placa = canvasPlano(A, .5, .36, 160, 112, (c, w, h) => { c.fillStyle = '#3a2c1e'; c.fillRect(0, 0, w, h); c.fillStyle = '#c9b88a'; c.font = 'bold 16px "Special Elite",monospace'; c.textAlign = 'center'; c.fillText('HOJE', w / 2, 24); c.font = '15px "Special Elite",monospace'; c.fillText(dataHoje, w / 2, 50); c.fillText('mortes:', w / 2, 76); c.font = 'bold 18px "Special Elite",monospace'; c.fillText(txt1, w / 2, 100); });
        const p = emCima(L.g, -.62, .22, -.7); placa.position.copy(p); placa.rotation.set(-.35, L.g.rotation.y + .6, 0); grupo.add(placa);
        A.interact(placa, () => '<b>E</b>Ler a placa virada para o lado', () => {
          A.toast(`HOJE, ${dataHoje}. Mortes: ${txt1}.`);
          setTimeout(() => { if (A.W.mapa === 'cemiterio') A.sub('lia', tot === 0 ? 'Ainda não. A placa sabe de mim antes de eu saber.' : tot > 20 ? 'De novo. É o que ela diz. Como se eu fosse só o resto da conta.' : 'Um número pequeno. Mas cresce.'); }, 900);
        });
      }
    });
  }

  // ---------------- ordem de cavar sorteada: o portão conta, em objetos, quem vem antes ----------------
  const ids = Object.keys(importantes);
  let ordem = ids.slice();
  if (ids.length >= 2) ordem = ids.slice().sort(() => rngDe(S, 'cavar-ordem')() - .5); // a mesma ordem do giz do portão
  const objNome = { ana: 'a fita', tome: 'a roda', davi: 'a folha' };
  if (ordem.length === 3) {
    const verso = `Primeiro, ${objNome[ordem[0]]}.\nDepois, ${objNome[ordem[1]]}.\nPor último, ${objNome[ordem[2]]}.`;
    const tabua = canvasPlano(A, 1.5, .9, 192, 112, (c, w, h) => {
      c.fillStyle = '#3a2c1e'; c.fillRect(0, 0, w, h); c.strokeStyle = '#1c1410'; c.lineWidth = 4; c.strokeRect(3, 3, w - 6, h - 6);
      c.fillStyle = '#d8cfa8'; c.font = '17px "Special Elite",monospace'; c.textAlign = 'center'; verso.split('\n').forEach((l, i) => c.fillText(l, w / 2, 36 + i * 28));
    });
    tabua.position.set(-3.4, 1.35, 11.9); tabua.rotation.y = Math.PI; grupo.add(tabua);
    A.interact(tabua, () => '<b>E</b>Ler a tábua riscada do portão', () => {
      A.toast(verso.replace(/\n/g, ' '));
      if (!S.flags.l6b_verso) { S.flags.l6b_verso = true; setTimeout(() => { if (A.W.mapa === 'cemiterio') A.sub('lia', 'Fita, roda, folha. Cada cova tem uma coisa em cima. Alguém quer que eu cave nessa ordem.'); }, 1400); }
    });
    // cavar fora da ordem acorda o Inspetor; na ordem a Lia sente que acertou (só fora do QA)
    const visto = new Set(); let errou = false, certos = 0;
    A.W.tick.push(() => {
      if (S.chapter !== 5) return;
      for (const id of Object.keys(S.tumulos || {})) {
        if (visto.has(id)) continue;
        const idx = visto.size; visto.add(id);
        if (emTeste()) continue;
        if (ordem[idx] === id) { certos++; if (certos === 3 && !errou) { A.conquista('l6b_ordem'); setTimeout(() => { if (A.W.mapa === 'cemiterio') A.sub('lia', 'Na ordem dele. A terra aceitou sem reclamar.'); }, 1500); } }
        else {
          errou = true;
          if (segunda || noiteN >= 2) {
            A.toast('Fora da ordem do portão. A terra gritou e ele ouviu.'); A.emitNoise(P.pos.x, P.pos.z, 24, true); S.fear = Math.min(100, S.fear + 15);
            if (M.ativo) { A.planejar(M, P.pos.x, P.pos.z); M.state = 'investiga'; M.searchT = 0; M.furia = Math.min(6, (M.furia || 0) + 1); M.cool = Math.min(M.cool, 1); }
          }
        }
      }
    });
  }

  // ---------------- covas falsas com pá cravada: 5 candidatas, só 3 guardam o objeto (2ª jogada / dificuldade) ----------------
  let falsas = 0;
  if ((segunda || dificil) && covas.length > 6 && emCima) {
    const idx = []; const r = rngDe(S, 'b-falsas');
    while (idx.length < 2) { const k = Math.min(covas.length - 1, r() * covas.length | 0); if (!idx.includes(k)) idx.push(k); }
    falsas = 2;
    idx.forEach((k, n) => {
      const c = covas[k];
      const pa = new THREE.Group(); const p = emCima(c.g, .25, 0, -.45); pa.position.copy(p); pa.rotation.set(.3, A.rand(0, 6), .15); grupo.add(pa);
      A.box(.04, .9, .04, A.MAT.madeiraEsc, 0, .45, 0, pa, false); A.box(.16, .2, .03, A.MAT.metal, 0, .02, 0, pa, false);
      const pv = emCima(c.g, -.2, .1, -.95); if (A.vela) A.vela(pv.x, pv.y, pv.z);
      const res = ['vazia', 'pilha', 'mao'][hashStr((S.semente || 'S') + '|dec' + n) % 3];
      let feito = false;
      const it = A.interact(c.g, () => feito ? 'A cova falsa, já aberta.' : S.inv.pa ? '<b>E</b>Cavar a cova com a pá cravada (segure)' : 'Uma cova com uma pá cravada e uma vela. Falta a sua pá.', () => {
        if (feito || !S.inv.pa) return; feito = true; it.progresso = 0; c.monte.scale.y = 3; S.flags.l6b_falsaCavada = true;
        if (res === 'vazia') { A.SFX.sussurros(1.5); S.fear = Math.min(100, S.fear + 8); A.toast('Só terra fria e uma cavidade vazia. Quem deixou a pá aqui queria te ver cavar.'); }
        else if (res === 'pilha') { S.inv.pilhas++; A.SFX.pegar(); A.toast('Escondida na terra, uma pilha ainda boa. Quem enterrou queria que alguém achasse.'); }
        else { if (som && som.terra) som.terra({ x: c.x, y: .1, z: c.z }); A.SFX.susto(); S.stamina = Math.max(0, S.stamina - 35); A.P.shake = .2; S.fear = Math.min(100, S.fear + 20); A.emitNoise(c.x, c.z, 14, true); A.toast('Uma mão fria te puxou o tornozelo e sumiu na terra. Seu fôlego foi junto.'); }
      });
      it.hold = 4; it.guarda = true; it.som = 'cavar'; it.pode = () => !!S.inv.pa && !feito;
      Object.defineProperty(it, 'ruido', { get: () => 6 + 4 * Math.min(1, (it.progresso || 0) / it.hold) });
    });
    let certeira = false;
    A.W.tick.push(() => { if (!certeira && Object.keys(S.tumulos || {}).length >= 3) { certeira = true; if (!S.flags.l6b_falsaCavada) A.conquista('l6b_certeira'); } });
  }

  // ---------------- batida da terceira cova: a Lia bate na pá no ritmo do Davi (curto, curto, longo) ----------------
  if (segunda && emCima) {
    let ativo = false, pa = null, feito = false, toques = [], dicaDita = false;
    A.W.tick.push(() => {
      if (ativo || Object.keys(S.tumulos || {}).length < 3) return;
      const idTer = Object.keys(S.tumulos)[2]; const L = importantes[idTer]; if (!L) return;
      ativo = true; pa = new THREE.Group(); pa.position.copy(emCima(L.g, .2, 0, -1.2)); pa.rotation.set(.2, 0, .1); grupo.add(pa);
      A.box(.04, .9, .04, A.MAT.madeiraEsc, 0, .45, 0, pa, false); A.box(.16, .2, .03, A.MAT.metal, 0, .02, 0, pa, false);
      const alvoPos = { x: pa.position.x, y: .2, z: pa.position.z };
      A.interact(pa, () => feito ? 'A pá, parada. A terra silenciou.' : '<b>E</b>Bater na pá, com cuidado', () => {
        if (feito) return;
        const t = A.perf(); batidaSuave(A, alvoPos, .5);
        if (toques.length && t - toques[toques.length - 1] > 3) toques = [];
        toques.push(t);
        if (!dicaDita) { dicaDita = true; setTimeout(() => { if (A.W.mapa === 'cemiterio') A.sub('lia', 'O Davi batia assim na parede do dormitório: curto, curto... e um longo, depois.'); }, 1000); }
        if (toques.length >= 3) {
          const g1 = toques[1] - toques[0], g2 = toques[2] - toques[1]; toques = [];
          if (g1 < .6 && g2 >= .9 && g2 < 2.4) {
            feito = true; legenda(A, 'l6bBatida', alvoPos);
            [0, .35, 1.4].forEach(d => setTimeout(() => { if (A.W.mapa === 'cemiterio') batidaSuave(A, alvoPos, .55); }, 700 + d * 1000));
            setTimeout(() => { if (A.W.mapa !== 'cemiterio') return; S.inv.garrafas++; A.SFX.pegar(); A.conquista('l6b_batida'); A.toast('Algo foi empurrado para cima: uma garrafa inteira.'); A.sub('davi', 'Curto, curto, longo. Eu sabia que era você.'); }, 3400);
          } else {
            feito = true; A.SFX.pancada(alvoPos.x, alvoPos.z); A.emitNoise(alvoPos.x, alvoPos.z, 16, true); S.fear = Math.min(100, S.fear + 12);
            A.toast('A terra se fechou sobre a pá. Foi o padrão errado, e ele ouviu.');
            if (!emTeste() && M.ativo) { A.planejar(M, alvoPos.x, alvoPos.z); M.state = 'investiga'; M.searchT = 0; M.cool = Math.min(M.cool, 1); }
          }
        }
      });
    });
  }

  // ---------------- poço seco: um item seu, três segundos, e a sorte vale a noite ----------------
  {
    const px = -9, pz = 8.4;
    const g = new THREE.Group(); g.position.set(px, 0, pz); grupo.add(g);
    const pedra = A.MAT.pedraLap;
    A.cyl(.8, .85, .8, pedra, 0, .4, 0, 14, g);
    const boca = new THREE.Mesh(new THREE.CircleGeometry(.58, 16), new THREE.MeshBasicMaterial({ color: 0x020202 })); boca.rotation.x = -Math.PI / 2; boca.position.y = .805; g.add(boca);
    A.box(.08, 1.6, .08, A.MAT.madeiraEsc, -.85, 1.2, 0, g, false); A.box(.08, 1.6, .08, A.MAT.madeiraEsc, .85, 1.2, 0, g, false); A.box(1.9, .08, .08, A.MAT.madeiraEsc, 0, 2, 0, g, false);
    A.addCollider(px - .9, px + .9, pz - .9, pz + .9);
    let esperando = 0, res = S.flags.l6b_poco || null, qual = '';
    const item = () => S.inv.garrafas > 0 ? 'garrafa' : S.inv.pilhas > 0 ? 'pilha' : S.inv.kits > 0 ? 'curativo' : null;
    A.interact(g, () => res ? 'O poço seco já respondeu esta noite.' : esperando > 0 ? 'O poço escuta...' : item() ? `<b>E</b>Soltar ${item() === 'curativo' ? 'um curativo' : item() === 'pilha' ? 'uma pilha' : 'uma garrafa'} no poço seco` : 'Um poço seco. Ele quer alguma coisa sua.', () => {
      if (res || esperando > 0) return;
      const q = item(); if (!q) { A.SFX.trancado(); return; }
      if (q === 'garrafa') S.inv.garrafas--; else if (q === 'pilha') S.inv.pilhas--; else S.inv.kits--;
      qual = q; esperando = 3; A.SFX.pegar(); legenda(A, 'l6bPoco', { x: px, z: pz }); A.toast('Você soltou. Contagem: três segundos de silêncio.');
    });
    A.W.tick.push(dt => {
      if (esperando <= 0) return;
      esperando -= dt;
      if (esperando <= 0) {
        const r = hashStr((S.semente || 'S') + '|poco|' + qual) % 100;
        res = r < 40 ? 'bom' : r < 75 ? 'neutro' : 'mau'; S.flags.l6b_poco = res;
        if (res === 'bom') { S.fear = Math.max(0, S.fear - 20); A.SFX.sussurros(1); A.toast('Do fundo, uma voz de criança: "obrigada". O poço te amou esta noite.'); memSet(m => { m.pocoBom = (m.pocoBom || 0) + 1; if (m.pocoBom >= 3) A.conquista('l6b_poco'); }); }
        else if (res === 'mau') { S.fear = Math.min(100, S.fear + 25); A.SFX.susto(); A.emitNoise(px, pz, 12, true); A.toast('O poço cuspiu de volta um riso seco. Esta noite ele vai ouvir mais de você.'); }
        else A.toast('O poço engoliu e não disse nada. Nem bênção nem praga.');
      }
    });
    const rm0 = def.ruidoMul;
    def.ruidoMul = () => (rm0 ? rm0() : 1) * (S.flags.l6b_poco === 'bom' ? .88 : S.flags.l6b_poco === 'mau' ? 1.12 : 1) * (S.flags.l6b_oferenda >= 3 && S.flags.sino ? .9 : 1);
  }

  // ---------------- banco da capela: dez segundos imóvel e ele esquece a caçada (uma vez por noite) ----------------
  if ((segunda || noiteN >= 2) && !emTeste()) {
    const mat = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false });
    const asse = A.box(4.6, .2, .8, mat, 4, .62, -51, grupo, false);
    const hud = barraTempo('fx-l6b-banco', '30%');
    let sentada = false, t = 0, usado = false, x0 = 0, z0 = 0, marcou4 = false, marcou7 = false;
    A.interact(asse, () => usado ? 'O banco, vazio e frio.' : sentada ? 'Fique imóvel. Não respire alto.' : '<b>E</b>Sentar no primeiro banco e esperar em silêncio (10 s)', () => {
      if (usado || sentada || S.flags.sino) return;
      sentada = true; t = 0; x0 = P.pos.x; z0 = P.pos.z; marcou4 = marcou7 = false;
      A.toast('Sentada. Quieta. Sem se mexer.');
    });
    A.W.tick.push(dt => {
      if (!sentada) return;
      if (S.flags.sino || S.dead) { sentada = false; hud.esconder(); return; }
      const mexeu = Math.hypot(P.pos.x - x0, P.pos.z - z0) > .4 || P.sprinting || P.noiseR > 2.6;
      if (mexeu) { sentada = false; hud.esconder(); A.emitNoise(P.pos.x, P.pos.z, 6, true); A.toast('Você se mexeu. O banco rangeu. Tente de novo.'); return; }
      t += dt; hud.mostrar('IMÓVEL'); hud.k(t / 10);
      if (t > 4 && !marcou4) { marcou4 = true; A.SFX.sino(.1, { x: 4.8, y: 5, z: -64 }, .97); }
      if (t > 7 && !marcou7) { marcou7 = true; A.SFX.passoLonge({ x: P.pos.x + 3, z: P.pos.z - 2 }); S.fear = Math.min(100, S.fear + 8); }
      if (t >= 10) {
        sentada = false; usado = true; hud.esconder();
        if (M.ativo && M.state !== 'patrulha') { M.state = 'patrulha'; M.path = []; M.furia = 0; M.searchT = 0; M.cool = Math.max(M.cool || 0, 6); A.planejar(M, -12, -20); A.conquista('l6b_banco'); A.toast('Ele parou, farejou o vazio e desistiu da caçada.'); }
        else A.toast('Dez segundos de paz. Ele nem estava te procurando.');
      }
    });
  }

  // ---------------- sino no ritmo: o giz, as velas e o vitral mostram quantos toques e em que compasso ----------------
  const itSino = ctx.itSino, velasAltar = ctx.velasAltar || [];
  {
    const r = rngDe(S, 'b-ritmo'); const n = 3 + sorteio(S, 'b-ritmo-n', 3); // 3 a 5 toques
    const gaps = []; for (let i = 0; i < n - 1; i++) gaps.push(r() < .5 ? 'c' : 'l');
    if (!gaps.includes('l')) gaps[gaps.length - 1] = 'l';
    const simbolo = n === 3 ? 'anjo' : n === 4 ? 'ave' : 'crianca';
    // vitral na parede leste da capela (cada noite um símbolo, cada símbolo um número de toques)
    const vit = canvasPlano(A, 1.5, 2.6, 192, 320, (c, w, h) => {
      c.fillStyle = '#10161c'; c.beginPath(); c.moveTo(0, h); c.lineTo(0, 90); c.arc(w / 2, 90, w / 2, Math.PI, 0); c.lineTo(w, h); c.fill();
      const cor = { anjo: '#6a8fc0', ave: '#b0603a', crianca: '#7a9a5a' }[simbolo];
      c.fillStyle = cor; c.globalAlpha = .85;
      if (simbolo === 'anjo') { for (const s of [-1, 1]) { c.beginPath(); c.moveTo(w / 2, 150); c.quadraticCurveTo(w / 2 + s * 80, 110, w / 2 + s * 70, 190); c.lineTo(w / 2, 210); c.fill(); } c.beginPath(); c.arc(w / 2, 130, 20, 0, 6.3); c.fill(); }
      else if (simbolo === 'ave') { c.beginPath(); c.ellipse(w / 2, 170, 48, 26, 0, 0, 6.3); c.fill(); c.beginPath(); c.moveTo(w / 2 + 40, 160); c.lineTo(w / 2 + 70, 150); c.lineTo(w / 2 + 44, 175); c.fill(); }
      else { c.beginPath(); c.arc(w / 2, 130, 22, 0, 6.3); c.fill(); c.fillRect(w / 2 - 20, 156, 40, 70); }
      c.globalAlpha = 1; c.strokeStyle = '#05080a'; c.lineWidth = 5; for (let i = 1; i < 6; i++) { c.beginPath(); c.moveTo(i * w / 6, 0); c.lineTo(i * w / 6, h); c.stroke(); } c.strokeRect(2, 2, w - 4, h - 4);
    }, { opacidade: .55 });
    vit.position.set(7.88, 3.9, -58); vit.rotation.y = -Math.PI / 2; grupo.add(vit);
    A.W.tick.push(() => { vit.material.opacity = .5 + (A.raioI ? Math.min(.4, A.raioI * .3) : 0); });
    const ativo = !emTeste() && (segunda || noiteN >= 2) && itSino;
    if (ativo) {
      // giz do ritmo na parede do fundo, perto da torre do sino
      const pontos = canvasPlano(A, 1.5, .5, 256, 84, (c, w, h) => {
        c.fillStyle = 'rgba(0,0,0,0)'; c.fillRect(0, 0, w, h); c.fillStyle = 'rgba(230,228,215,.85)';
        let x = 30; c.beginPath(); c.arc(x, 42, 9, 0, 6.3); c.fill();
        for (const g of gaps) { x += g === 'c' ? 34 : 78; c.beginPath(); c.arc(x, 42, 9, 0, 6.3); c.fill(); }
        c.strokeStyle = 'rgba(230,228,215,.5)'; c.lineWidth = 3; c.beginPath(); c.moveTo(14, 66); c.lineTo(w - 14, 66); c.stroke();
      });
      gizMarca(pontos, 3.2, 1.7, -69.85, 0, 5.5, .8, true);
      // velas do altar piscam o ritmo quando a Lia se aproxima (também serve a quem joga sem som)
      let piscT = 4;
      const piscar = () => {
        let tt = 0; const seq = [0]; for (const g of gaps) { tt += g === 'c' ? .5 : 1.2; seq.push(tt); }
        legenda(A, 'l6bRitmo');
        seq.forEach(s => setTimeout(() => {
          if (A.W.mapa !== 'cemiterio' || S.flags.sino) return;
          for (const v of velasAltar) v.acesa = false; batidaSuave(A, { x: 0, y: 1, z: -66 }, .35);
          setTimeout(() => { if (!S.flags.sino) for (const v of velasAltar) v.acesa = true; }, 180);
        }, s * 1000));
      };
      A.W.tick.push(dt => {
        if (S.flags.sino || S.chapter !== 5 || !P.room || P.room.id !== 'capela') return;
        piscT -= dt; if (piscT <= 0 && P.pos.z < -55) { piscT = 14; piscar(); }
      });
      // a corda passa a ser tocada em batidas curtas, no compasso do giz
      const lab0 = itSino.label, act0 = itSino.act;
      let toques = [], falou = false;
      const thr = S.dif === 'facil' ? .9 : .8; // mais tolerância na dificuldade fácil
      itSino.hold = 0;
      itSino.label = () => (S.flags.sino || S.placed < 3) ? lab0() : `<b>E</b>Puxar a corda do sino no ritmo do giz (${toques.length}/${n})`;
      itSino.act = () => {
        if (S.flags.sino || S.placed < 3) return;
        const t = A.perf(); const pos = { x: 4.8, y: 5, z: -64 };
        if (toques.length && t - toques[toques.length - 1] > 2.6) toques = [];
        toques.push(t); A.SFX.sino(.35, pos, 1); A.emitNoise(4.8, -64, 10, true);
        if (!falou) { falou = true; setTimeout(() => { if (A.W.mapa === 'cemiterio') A.sub('lia', `São ${n} riscos de giz na parede, uns perto, uns longe. É o compasso. Tenho que bater igual.`); }, 800); }
        if (toques.length < n) return;
        const feitos = []; for (let i = 1; i < toques.length; i++) feitos.push(toques[i] - toques[i - 1] < thr ? 'c' : 'l');
        const certo = feitos.every((g, i) => g === gaps[i]); const primeira = !S.flags.l6b_ritmoErro;
        toques = [];
        if (certo) { if (primeira) A.conquista('l6b_ritmo'); act0(); }
        else {
          S.flags.l6b_ritmoErro = true; A.SFX.sino(1, pos, .9); legenda(A, 'l6bTorto'); A.P.shake = .15; A.emitNoise(4.8, -64, 30, true); S.fear = Math.min(100, S.fear + 12);
          A.toast('O sino soou torto. Ele ouviu. Tente de novo: conte os riscos.');
          if (M.ativo) { A.planejar(M, 0, -58); M.state = 'investiga'; M.searchT = 0; M.furia = Math.min(6, (M.furia || 0) + 1); M.cool = Math.min(M.cool, 1); }
        }
      };
    }
  }

  // ---------------- tigela das lembranças: o que você achou na noite compra vantagem na fuga ----------------
  {
    const g = new THREE.Group(); g.position.set(-2.4, 0, -65.4); grupo.add(g);
    A.box(.7, .6, .5, A.MAT.madeiraEsc, 0, .3, 0, g, false);
    A.cyl(.2, .14, .12, A.MAT.bronze, 0, .66, 0, 12, g);
    A.addCollider(-2.8, -2, -65.7, -65.1);
    const tem = () => Object.values(S.notes || {}).filter(Boolean).length + Object.values(S.fitas || {}).filter(Boolean).length;
    let feito = (S.flags.l6b_oferenda || 0) > 0, velaExtra = null;
    const criarVelaExtra = () => { if (velaExtra) return; velaExtra = A.vela(0, .08, 4); velaExtra.userData.apagada = true; };
    if ((S.flags.l6b_oferenda || 0) >= 2) criarVelaExtra();
    A.interact(g, () => feito ? 'A tigela, cheia de cinza e papel.' : `<b>E</b>Deixar suas lembranças na tigela (${tem()} achadas)`, () => {
      if (feito) return;
      const n = tem(), nivel = n >= 9 ? 3 : n >= 6 ? 2 : n >= 3 ? 1 : 0;
      if (!nivel) { A.toast('Você ainda não achou o suficiente para oferecer. Três já bastariam.'); return; }
      feito = true; S.flags.l6b_oferenda = nivel; A.SFX.pegar(); S.fear = Math.max(0, S.fear - 8);
      A.toast(['', 'A tigela aceitou: o sino vai demorar mais para chamá-lo.', 'A tigela aceitou: o sino demora mais e uma vela extra vai guiar a fuga.', 'A tigela aceitou tudo: o sino demora, a vela guia e seus passos na fuga abafam.'][nivel]);
      if (nivel >= 2) criarVelaExtra();
    });
    // efeitos aplicados quando o sino toca
    let aplicou = false;
    A.W.tick.push(() => {
      if (aplicou || !S.flags.sino) return; aplicou = true;
      const nv = S.flags.l6b_oferenda || 0;
      if (nv >= 1) setTimeout(() => { if (A.W.mapa === 'cemiterio' && M.ativo) { M.cool = (M.cool || 0) + 2.5; M.wait = Math.max(M.wait || 0, 1.5); } }, 3400);
          });
    // a vela extra do corredor de saída acende quando o sino toca
    A.W.tick.push(() => { if (S.flags.sino && velaExtra && velaExtra.userData.apagada) velaExtra.userData.apagada = false; });
  }

  // ---------------- jardim de finais: cada final alcançado planta uma flor na frente da capela ----------------
  {
    const f = fim.finais || {}; const plantados = [];
    const talo = new THREE.MeshStandardMaterial({ color: 0x2a4a22, roughness: .9 });
    const flor = (x, z, cor, n = 5) => {
      A.box(.03, .5, .03, talo, x, .25, z, grupo, false);
      for (let i = 0; i < n; i++) { const a = i / n * 6.283; const p = new THREE.Mesh(new THREE.SphereGeometry(.07, 6, 5), new THREE.MeshStandardMaterial({ color: cor, roughness: .8, emissive: cor, emissiveIntensity: .12 })); p.position.set(x + Math.cos(a) * .1, .52, z + Math.sin(a) * .1); grupo.add(p); }
    };
    if (f.comum) { flor(-3.6, -46.2, 0xeeeedd); plantados.push('comum'); }
    if (f.silencio) { A.box(.06, .5, .06, A.MAT.madeiraEsc, 3.6, .25, -46.2, grupo, false); A.box(.3, .06, .06, A.MAT.madeiraEsc, 3.6, .38, -46.2, grupo, false); flor(3.6, -46.8, 0x5a7ac0, 4); plantados.push('silencio'); }
    if (f.verdadeiro) { flor(-5.2, -46.4, 0xb02030, 6); plantados.push('verdadeiro'); }
    if (mem().quarta || S.flags.l6_quartaCavada) { A.box(.05, .4, .05, A.MAT.madeiraEsc, 5.2, .2, -46.4, grupo, false); const fita = new THREE.Mesh(new THREE.BoxGeometry(.2, .03, .03), new THREE.MeshStandardMaterial({ color: 0x8a1420 })); fita.position.set(5.2, .36, -46.4); grupo.add(fita); }
    if (plantados.length >= 3) {
      const palavra = canvasPlano(A, 3.2, .8, 256, 64, (c, w, h) => { c.fillStyle = 'rgba(0,0,0,0)'; c.fillRect(0, 0, w, h); c.fillStyle = 'rgba(235,232,218,.8)'; c.font = 'bold 44px "Special Elite",monospace'; c.textAlign = 'center'; c.fillText('VOLTE', w / 2, 48); }, { opacidade: .85 });
      palavra.rotation.x = -Math.PI / 2; palavra.position.set(0, .012, -45.2); grupo.add(palavra);
      A.W.tick.push(() => { if (!S.flags.l6b_jardim && P.room && P.room.id === 'cem' && Math.hypot(P.pos.x, P.pos.z + 45) < 5) { S.flags.l6b_jardim = true; A.conquista('l6b_jardim'); A.toast('Os três canteiros formam uma palavra de giz no chão: VOLTE.'); } });
    }
  }

  // ---------------- capela de cabeça para baixo: depois de ver um final, a cruz vira e as velas se apagam ----------------
  if (Object.keys(fim.finais || {}).length >= 1 && !emTeste() && ctx.cruz) {
    ctx.cruz.rotation.z = Math.PI;
    let dito = false;
    A.W.tick.push(() => {
      if (!S.flags.sino) for (const v of velasAltar) v.acesa = false; // apagadas de propósito até o sino
      if (!dito && P.room && P.room.id === 'capela') { dito = true; setTimeout(() => { if (A.W.mapa === 'cemiterio') A.sub('lia', 'A cruz tá virada. As velas apagadas. Tudo no lugar errado de propósito. Como se a casa soubesse que eu já vi como isso termina.'); }, 1500); }
    });
  }

  // ---------------- rank da fuga: relógio discreto do sino ao portão, medalha e recorde ----------------
  {
    const rel = relogioFuga(); let t = 0, ligado = false, fechado = false, vida0 = 100;
    A.W.tick.push(dt => {
      if (!S.flags.sino || fechado) return;
      if (!ligado) { ligado = true; t = 0; vida0 = S.health; }
      t += dt; rel.mostrar(`fuga ${t.toFixed(1)}s`);
      if (P.pos.z > 11.2 && Math.abs(P.pos.x) < 2.2) {
        fechado = true; rel.esconder();
        const perda = vida0 - S.health;
        let medalha = t <= 24 ? 'ouro' : t <= 32 ? 'prata' : 'bronze';
        if (perda > 40 && medalha !== 'bronze') medalha = medalha === 'ouro' ? 'prata' : 'bronze';
        if (!emTeste()) {
          const m = memSet(mm => { if (!mm.fuga || t < mm.fuga) { mm._novaFuga = true; mm.fuga = t; } else mm._novaFuga = false; });
          A.toast(`Fuga em ${t.toFixed(1)}s: medalha de ${medalha}${m._novaFuga ? ' (seu melhor tempo)' : ''}.`);
        }
        if (medalha === 'ouro' && !emTeste()) A.conquista('l6b_ouro');
        S.flags.l6b_medalha = medalha;
      }
    });
  }

  // ---------------- laço de giz e fim ----------------
  A.W.tick.push(() => {
    for (const q of giz) { const d = Math.hypot(P.pos.x - q.x, P.pos.z - q.z); q.m.material.opacity += (((d < q.d && (q.semLuz || S.flashOn)) ? q.max : 0) - q.m.material.opacity) * .1; }
  });

  return def;
}
