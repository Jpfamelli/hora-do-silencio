// Jogabilidade (Lote 1): HUD de ruído/postura/salvamento, textos de dicas por causa da morte,
// replay da morte, opções de controle e o modo "Ele te escuta de verdade" (microfone).
// O motor (jogo.js) chama estas funções; nada aqui mexe no estado do jogo sozinho.

const $ = s => document.querySelector(s);

// ---------------------------------------------------------------- textos
export const TXT = {
  dicas: {
    correu: 'Você correu perto dele. Correr se ouve de longe: ande devagar (segure ALT) ou agache (C).',
    agua: 'A água espirra a cada passo e ele escuta. Na água, agache e vá devagar.',
    respirou: 'Escondida, segure ESPAÇO quando o coração disparar. Solte só quando ele se afastar.',
    entrou: 'Ele ouviu a porta do armário. Quando ele parar do lado de fora, prenda a respiração (ESPAÇO) até ele desistir.',
    chamado: 'Regra cinco: não vá até quem chama o seu nome. Era ele esperando.',
    perto: 'Quando ele estalar a língua perto de você, pare e prenda a respiração (ESPAÇO). Ele é cego.',
    bote: 'Ele levanta os braços antes de agarrar. Nessa hora, corra para o lado ou feche uma porta na cara dele.',
    semLuz: 'Sem luz, ela anda. Mantenha a lanterna nela e troque a pilha antes que acabe (R).',
    piscou: 'A lanterna falhou e ela avançou. Bata na lanterna (F duas vezes) ou troque a pilha.',
    costas: 'Ela veio por trás. Quando ouvir o DEZ, vire e ilumine: ela recua.',
    fora: 'Quando as luzes piscam, você tem segundos. Vá para o armário ou a cama mais perto, não para o mais seguro.',
    cacos: 'Vidro quebrado no chão faz barulho. Agachada, você passa por cima em silêncio.',
    voz: 'Ele ouviu a sua voz. De verdade. Respire fundo, longe do microfone.'
  },
  secas: ['Ele não tem pressa. Você tem.', 'Escute antes de andar.', 'A Hora não perdoa quem respira alto.', 'Todo mundo volta para a cama. Menos você, ainda.'],
  conquistas: [
    { id: 'regra_zero', nome: 'Regra Zero', desc: 'Fique um minuto em silêncio total, no escuro, dentro do internato.' },
    { id: 'volte_cama', nome: 'Volte Para a Cama', desc: 'Faça o Inspetor desistir na porta do seu esconderijo.' },
    { id: 'porta_cara', nome: 'Porta na Cara', desc: 'Feche uma porta na frente do Inspetor durante a caçada.' },
    { id: 'cacos', nome: 'Caco de Vidro', desc: 'Faça o Inspetor pisar nos cacos de uma garrafa.' },
    { id: 'gato', nome: 'Pés de Gato', desc: 'Termine um capítulo sem correr nenhuma vez.' },
    { id: 'esquiva', nome: 'Por Um Fio', desc: 'Escape do bote do Inspetor no último instante.' },
    { id: 'olhos', nome: 'Olhos de Coruja', desc: 'Deixe os olhos se acostumarem ao escuro.' }
  ]
};

// ---------------------------------------------------------------- estilo e elementos do HUD
export function montarHUD() {
  const css = document.createElement('style');
  css.textContent = `
  #ruido-anel{position:absolute;left:50%;top:50%;width:10px;height:10px;margin:-5px;border-radius:50%;border:1px solid rgba(220,210,190,.5);opacity:0;transition:width .12s,height .12s,margin .12s,opacity .25s,border-color .2s}
  #ruido-anel.alto{border-color:rgba(200,40,30,.85);box-shadow:0 0 8px rgba(200,40,30,.5)}
  #postura{position:absolute;left:28px;bottom:104px;font-family:"Special Elite";font-size:13px;color:var(--fraco);letter-spacing:.06em;text-shadow:0 0 6px #000;transition:opacity .3s}
  #salvo{position:absolute;right:28px;top:52px;font-family:"Special Elite";font-size:13px;color:#c9a75a;text-shadow:0 0 6px #000;opacity:0;transition:opacity .5s}
  #salvo.on{opacity:1}
  #salvo i{display:inline-block;font-style:normal;animation:gira 1s linear infinite;margin-right:6px}
  @keyframes gira{to{transform:rotate(360deg)}}
  #breath .estagio{display:block;font-size:13px;color:#b8ab8e;margin-top:6px;letter-spacing:.08em}
  #breath .pulso{display:block;margin:6px auto 0;width:180px;height:3px;background:rgba(255,255,255,.08);position:relative}
  #breath .pulso::after{content:"";position:absolute;inset:0;width:var(--v,0%);background:#b03024}
  #breath.queima i#b-breath::after{background:#c0392b;animation:pisca .35s infinite}
  #breath.queima{animation:tremor 1s infinite}
  #b-pilha.fraca::after{animation:pisca .8s infinite}
  #fx-prende{position:fixed;inset:0;pointer-events:none;box-shadow:inset 0 0 18vw 10vw rgba(0,0,0,.9);opacity:0;transition:opacity .6s}
  #death .replay{display:block;margin:0 auto 22px;border:1px solid #2c2720;background:#050303}
  #death .dica-forte{color:#e9dfc8;font-style:normal;font-weight:bold}
  #death .seca{display:block;margin-top:10px;font-size:15px;color:#6d6452}
  #death .atalho{font-family:"Special Elite";font-size:12px;color:#6d6452;margin-top:14px}
  .tarja-tempo{font-family:"Special Elite";font-size:13px;color:#e9dfc8;background:#5a120c;padding:4px 10px;margin-bottom:10px;text-align:center;letter-spacing:.1em}`;
  document.head.appendChild(css);
  const hud = $('#hud');
  const add = (tag, id, html = '') => { const e = document.createElement(tag); e.id = id; e.innerHTML = html; hud.appendChild(e); return e; };
  add('div', 'ruido-anel'); add('div', 'postura'); add('div', 'salvo', '<i>◐</i>progresso salvo');
  const fx = document.createElement('div'); fx.id = 'fx-prende'; document.body.insertBefore(fx, $('#hud'));
  const br = $('#breath');
  if (br) { br.insertAdjacentHTML('beforeend', '<span class="pulso" id="b-pulso"></span><span class="estagio" id="b-estagio"></span>'); }
  const dt = $('#death'), retry = $('#dt-retry');
  if (dt && retry) { const c = document.createElement('canvas'); c.className = 'replay'; c.width = 300; c.height = 170; c.id = 'dt-replay'; c.hidden = true; dt.insertBefore(c, retry); const a = document.createElement('div'); a.className = 'atalho'; a.textContent = 'E, ESPAÇO ou ENTER: tentar de novo'; dt.appendChild(a); }
}

let salvoTO;
export function mostrarSalvo() { const e = $('#salvo'); if (!e) return; e.classList.add('on'); clearTimeout(salvoTO); salvoTO = setTimeout(() => e.classList.remove('on'), 1600); }

// anel de ruído em volta da mira: r = raio do barulho em metros
export function anelRuido(r, alto) {
  const e = $('#ruido-anel'); if (!e) return;
  const px = r <= 0 ? 6 : Math.min(110, 8 + r * 4.2);
  e.style.width = e.style.height = px + 'px'; e.style.margin = (-px / 2) + 'px';
  e.style.opacity = r <= 0 ? 0 : Math.min(.9, .25 + r / 20);
  e.classList.toggle('alto', !!alto);
}
let posturaAtual = '';
export function postura(t) { if (t === posturaAtual) return; posturaAtual = t; const e = $('#postura'); if (e) e.textContent = t; }

// ---------------------------------------------------------------- replay da morte (mini mapa)
export function desenharReplay(buf, salas, quem) {
  const c = $('#dt-replay'); if (!c) return;
  if (!buf.length || quem !== 'inspetor') { c.hidden = true; return; }
  c.hidden = false;
  const g = c.getContext('2d'); g.clearRect(0, 0, c.width, c.height);
  let x0 = Infinity, x1 = -Infinity, z0 = Infinity, z1 = -Infinity;
  for (const p of buf) for (const [x, z] of [[p.px, p.pz], [p.mx, p.mz]]) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); z0 = Math.min(z0, z); z1 = Math.max(z1, z); }
  const pad = 4; x0 -= pad; x1 += pad; z0 -= pad; z1 += pad;
  const k = Math.min(c.width / (x1 - x0), c.height / (z1 - z0));
  const sx = x => (x - x0) * k + (c.width - (x1 - x0) * k) / 2, sz = z => (z - z0) * k + (c.height - (z1 - z0) * k) / 2;
  g.strokeStyle = '#2c2720'; g.lineWidth = 1;
  for (const r of salas) if (!r.fora && r.x1 > x0 && r.x0 < x1 && r.z1 > z0 && r.z0 < z1) g.strokeRect(sx(r.x0), sz(r.z0), (r.x1 - r.x0) * k, (r.z1 - r.z0) * k);
  const trilha = (kx, kz, cor) => { g.strokeStyle = cor; g.lineWidth = 2; g.beginPath(); buf.forEach((p, i) => i ? g.lineTo(sx(p[kx]), sz(p[kz])) : g.moveTo(sx(p[kx]), sz(p[kz]))); g.stroke(); };
  trilha('px', 'pz', '#cfc3a6'); trilha('mx', 'mz', '#8e1b14');
  for (const p of buf) if (p.ruido > 4) { g.strokeStyle = 'rgba(201,167,90,.55)'; g.beginPath(); g.arc(sx(p.px), sz(p.pz), Math.min(40, p.ruido * k * .5), 0, 6.28); g.stroke(); }
  const u = buf[buf.length - 1];
  g.fillStyle = '#cfc3a6'; g.beginPath(); g.arc(sx(u.px), sz(u.pz), 4, 0, 6.28); g.fill();
  g.fillStyle = '#c0392b'; g.beginPath(); g.arc(sx(u.mx), sz(u.mz), 4, 0, 6.28); g.fill();
  g.fillStyle = '#857a63'; g.font = '11px "Special Elite"'; g.fillText('você', 6, 14); g.fillStyle = '#8e1b14'; g.fillText('ele', 46, 14); g.fillStyle = '#c9a75a'; g.fillText('barulho que você fez', 76, 14);
}

// ---------------------------------------------------------------- opções de controle
export function montarOpcoes(OPT, setOpt) {
  const defs = [
    ['agachar', 'Agachar', [['0', 'alternar'], ['1', 'segurar']]],
    ['correr', 'Correr', [['0', 'segurar'], ['1', 'alternar']]],
    ['resp', 'Respiração', [['0', 'segurar'], ['1', 'alternar']]],
    ['mic', 'Ele te escuta de verdade (microfone)', [['0', 'desligado'], ['1', 'ligado']]]
  ];
  for (const [pre, alvo] of [['o', '#title .opts'], ['p', '#pause .set']]) {
    const box = $(alvo); if (!box) continue;
    for (const [k, nome, ops] of defs) {
      const l = document.createElement('label'); l.textContent = nome + ' ';
      const s = document.createElement('select'); s.id = `${pre}-${k}`;
      for (const [v, t] of ops) { const o = document.createElement('option'); o.value = v; o.textContent = t; s.appendChild(o); }
      s.value = String(OPT[k] || 0); s.onchange = e => setOpt(k, e.target.value); l.appendChild(s); box.appendChild(l);
    }
  }
  const pes = $('#o-dif option[value=pesadelo]'); if (pes) pes.textContent = 'Pesadelo (quase tudo mata)';
  const fac = $('#o-dif option[value=facil]'); if (fac) fac.textContent = 'Fácil (mais fôlego, ele ouve menos)';
}

// ---------------------------------------------------------------- microfone: ele te escuta de verdade
let mic = null;
export async function ligarMic(AC) {
  if (mic || !AC || !navigator.mediaDevices) return !!mic;
  try {
    const st = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } });
    const src = AC.createMediaStreamSource(st), an = AC.createAnalyser(); an.fftSize = 1024; src.connect(an);
    mic = { st, an, buf: new Float32Array(an.fftSize), base: .01, cool: 0 };
    return true;
  } catch (e) { mic = null; return false; }
}
export function desligarMic() { if (!mic) return; mic.st.getTracks().forEach(t => t.stop()); mic = null; }
// devolve o raio de barulho (m) do pico de voz deste quadro, ou 0
export function lerMic(dt) {
  if (!mic) return 0;
  mic.an.getFloatTimeDomainData(mic.buf);
  let s = 0; for (let i = 0; i < mic.buf.length; i++) s += mic.buf[i] * mic.buf[i];
  const rms = Math.sqrt(s / mic.buf.length);
  mic.base = mic.base * .995 + Math.min(rms, mic.base * 2) * .005;
  mic.cool -= dt;
  if (mic.cool > 0) return 0;
  const sobre = rms / Math.max(.004, mic.base);
  if (sobre > 4 && rms > .02) { mic.cool = .5; return Math.min(18, 3 + (sobre - 4) * 1.5); }
  return 0;
}
