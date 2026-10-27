// Jogabilidade (Lote 2): o mundo e a história viram mecânica.
// Marcas do Davi nos armários, o armário do Tomé, o código de batidas, o rádio do Seu Joaquim (quente/frio),
// o toca-fitas de bolso da Lia (lado B), a sineta da cozinheira, o microfone da diretoria, a vitrola do Moacir,
// o telefone de disco, o harmônio da capela, velas com lembranças, pegadas do Davi para quem trava,
// ouvir pela porta, escorregar pelo corrimão, fita mastigada, pistas escritas nas paredes.
// Ligado ao motor por poucos ganchos (procure "JM." em jogo.js). Toda a lore nova fica em sala com objetivo
// ou no corredor entre objetivos (lista ROTA abaixo) e é conferida pelo kit de teste (T.loreNoCaminho).

// ---------------------------------------------------------------- textos
import { TXT as TXT1 } from './jogabilidade.js';
Object.assign(TXT1.dicas, {
  fone: 'Você estava de fone. Com a fita no ouvido, o prédio some e ele chega sem você ouvir. Tire o fone (T) quando ele estiver solto.',
  radio: 'O rádio do Seu Joaquim chia alto. Perto dele, solte o B. Se ligar sozinho, aperte B na hora.',
  falso: 'Aquele D não era do Davi. Era reto demais. Nos armários com o D falso, ele confere primeiro.',
  fita: 'Avançar a fita chia alto. Só avance com ele longe.'
});
export const TXT = {
  paginaD: '\n\n(na margem, a lápis) Marquei com um D pequeno os armários que ele nunca abre. Se tiver um D, pode entrar.',
  redacaoT: '\n\n(no verso, a lápis, letra torta) ACHEI UM ARMÁRIO QUE ELE NUNCA ACHA. FIZ UM T NA PORTA. NÃO CONTA PRA NINGUÉM.',
  ladoB: [
    [{ quem: 'davi', texto: '(lado B, chiado) Lia... na estrada tem um posto. O velho de lá é bom. Ele ainda não sabe.' }, { quem: 'davi', texto: '(lado B) Se ele te der alguma coisa, guarda. Ele sabe onde as coisas escondidas estão.' }],
    [{ quem: 'davi', texto: '(lado B) O gerador é a coisa mais barulhenta do mundo. Liga e sai pelo outro lado do corredor.' }, { quem: 'davi', texto: '(lado B) Eu risquei um D nos armários que ele nunca abre. Olha as portas antes de entrar.' }],
    [{ quem: 'davi', texto: '(lado B) Quando as luzes piscarem, não procura o melhor esconderijo. Procura o mais perto.' }, { quem: 'davi', texto: '(lado B) O telefone da recepção ainda liga pro posto. O número tá pintado lá. O Seu Joaquim sempre atende.' }],
    [{ quem: 'davi', texto: '(lado B) A Ana não é má. Ela só tem medo de ficar sozinha. Olha pra ela até o fim.' }, { quem: 'davi', texto: '(lado B) No corredor de cima, do lado do D, a gente riscou o código das batidas. Três batidas: corre.' }],
    [{ quem: 'davi', texto: '(lado B, a voz embaixo d\'água) Lá embaixo é tudo água. Agachada, quase não faz barulho.' }, { quem: 'davi', texto: '(lado B) Tem um D nos túneis que não fui eu que fiz. Reto demais. Não entra nele.' }],
    [{ quem: 'davi', texto: '(lado B, muito baixo) Se você tá ouvindo isso, você tá perto do sino.' }, { quem: 'davi', texto: '(lado B) A Irmã Celeste guardou uma coisa no harmônio. A música dos canos abre. Dó, depois mi, depois sol.' }]
  ],
  lembrancas: [
    'A gente dividia o quarto em Taubaté. Ele contava carneiro em voz alta pra eu dormir. Errava de propósito pra eu rir.',
    'No dia que ele veio pra cá, ele me deu o tênis velho dele. Disse que eu ia crescer até caber.',
    'Ele tinha medo de trovão. Eu dizia que era Deus arrastando os móveis. Ele ria, mas não soltava a minha mão.',
    'A mãe chorou a viagem inteira. O Davi não. Ele segurou a minha mão e disse: é só um ano, Lia.',
    'Ele me ensinou a assobiar com dois dedos. Eu nunca consegui. Ele dizia: um dia você consegue.',
    'A última carta dele dizia: aqui é bem quieto. Eu achei que era uma coisa boa.'
  ],
  joaquimMapa: {
    estrada: '(rádio, chiado) Moça. Esse rádio é meu. Segura o botão e escuta: onde tem coisa escondida ele chia mais.',
    terreo: '(rádio) A recepção tem mais segredo que o padre. Mas cuidado: o chiado ele escuta também.',
    superior: '(rádio) Lá em cima as crianças escondiam tudo. Debaixo das camas, atrás das portas.',
    tuneis: '(rádio, cheio de água) Aqui embaixo o rádio quase não pega. Mas pega.',
    cemiterio: '(rádio, muito longe) A capela... a Irmã deixou uma coisa lá dentro. Toca o que os canos cantaram.'
  },
  telefone: {
    1: '(no telefone, chiado) Posto Serra. ...É a moça? O gerador fica na casa de máquinas. Gasolina na despensa, fusível na enfermaria. Corre depois de ligar.',
    2: '(no telefone) Posto Serra. ...O quadro de chaves quer o número que o diretor gravou. A fita tá na diretoria. E quando piscar a luz, se esconde no mais perto.',
    3: '(no telefone) Lá em cima tem uma menina que conta. Não para de olhar pra ela. E a engrenagem tá no último dormitório.',
    4: '(no telefone, longe) Embaixo é a ordem que a Irmã gravou. Errou, a água sobe.',
    5: '(no telefone, quase sem voz) Cava, entra, coloca, toca. E não olha pra trás.'
  },
  gravacao1979: [
    { quem: 'voz', texto: '(gravação, 14 de março de 1979) ...sino... (o sino tocando sem parar)' },
    { quem: 'voz', texto: '(gravação) (batidas numa porta de madeira) Abre! Moço, abre, por favor! Tá entrando fumaça!' },
    { quem: 'diretor', texto: '(gravação, muito perto do fone) Silêncio. É a Hora.' },
    { quem: 'lia', texto: '(baixinho) Davi...' }
  ],
  batidas: { titulo: 'Riscos na parede, na altura de uma criança', texto: 'CÓDIGO DA HORA (não fala, bate)\n\n1 batida = sim\n2 batidas = não vem por aqui\n3 batidas = ELE TÁ PERTO, CORRE\n\n— D., A., T.' },
  foto: { titulo: 'Foto dentro do harmônio', texto: '(uma foto em preto e branco, as bordas queimadas: a Irmã Celeste sentada no harmônio, três crianças em volta dela. Um menino de óculos, uma menina de tranças, um menino segurando um carrinho)\n\n(no verso, letra da Irmã)\nDavi, Ana e Tomé. Eles cantam baixinho pra ninguém ouvir.\nSe alguém achar isto: eles não estão sozinhos. Nunca estiveram.\n— Ir. Celeste, 1979' },
  calendario: { titulo: 'Calendário de 1979 (verso)', texto: 'MARÇO DE 1979 — o dia 14 circulado com força.\n\n(no verso, a lápis, letra de quem não queria esquecer)\nquadro: {q}\nnão passar pras irmãs' },
  livroVisitas: { titulo: 'Livro de visitas', texto: '02/03/1979 — Sr. e Sra. Prado (filha Ana Luísa)\n02/03/1979 — D. Moraes (filho Davi). "Trouxe bolo. Não deixaram entregar."\n09/03/1979 — Sra. Ribeiro (filho Tomé)\n\n(a última linha, a tinta ainda brilha)\n14/03/1994 — Lia Moraes' },
  pontoMoacir: { titulo: 'Livro de ponto da disciplina', texto: 'M. DUARTE — inspetor\n12/03 — 21h às 06h. Nada a relatar.\n13/03 — 21h às 06h. Armário 4: duas vezes.\n14/03 — 21h às\n\n(a linha para no meio. Embaixo, outra letra, grande e torta)\nEU NÃO ENXERGO A LINHA' },
  alturas: { titulo: 'Quadro de alturas da enfermaria', texto: 'Riscos de lápis numa régua pintada na parede:\nTOMÉ 1,31 · ANA 1,24 · DAVI 1,46\n\n(os três riscos de 1979 são os últimos. Acima do do Davi, alguém fez um risco novo, a caneta, mais alto, com um ponto de interrogação)' },
  renato: [
    { titulo: 'Recado de giz', texto: 'A ESCADA DA FRENTE É SEGURA — R., 87\n\n(por cima, um X enorme de giz de cera, e letra de criança)\nNÃO É MAIS' },
    { titulo: 'Recado de giz', texto: 'ELE NUNCA ENTRA NA COZINHA — R.\n\n(riscado. Embaixo, letra de criança)\nELE COME LÁ. SOZINHO. TOCA A SINETA E VÊ.' },
    { titulo: 'Recado de giz', texto: 'NA ÁGUA, AGACHADA, ELE NÃO TE OUVE — R., 87\n\n(sem risco nenhum por cima. Alguém desenhou um sol pequeno do lado)' }
  ],
  romanos: 'Riscado a prego no batente, meio apagado: ',
  cisterna: { titulo: 'Nomes riscados no tijolo', texto: 'MOACIR D. — 9 ANOS — 1951\nARMÁRIO 4\n\n(mais embaixo, letra de adulto, funda)\neu também fiquei quieto' },
  t: 'Aqui ele nunca acha.'
};
const ROTA = { // salas com objetivo e corredores entre objetivos
  estrada: ['estrada', 'patioPosto', 'posto'],
  terreo: ['hall', 'cw', 'ce', 'cozinha', 'despensa', 'diret', 'enferm', 'maq'],
  superior: ['patamar', 'corr', 'dormE', 'brinq', 'celeste', 'sotao'],
  tuneis: ['entrada', 't1', 't2', 't3', 'v1', 'v2', 'hub', 't4', 'secreta', 't5', 'saida'],
  cemiterio: ['cem', 'capela']
};
const SALA_OBJ = { posto: 'posto', chave_portao: 'posto', galao: 'despensa', fusiveis: 'enferm', gerador: 'maq', fita_diretor: 'diret', chave_escada: 'hall', subir: 'hall', engrenagens: 'dormE', caixinha: 'brinq', quarto_celeste: 'celeste', fita_celeste: 'celeste', chave_porao: 'sotao', valvulas: 'v1', cofre: 'secreta', tumulos: 'cem', capela: 'capela', altar: 'capela', sino: 'capela' };
export const CONQUISTAS = [
  { id: 'l2_tome', nome: 'Aqui Ele Nunca Acha', desc: 'Esconda-se no armário do Tomé.', secreta: true, dica: 'uma letra entalhada' },
  { id: 'l2_davi', nome: 'As Marcas do Davi', desc: 'Esconda-se em três armários marcados com D.', secreta: true, dica: 'olhe as portas' },
  { id: 'l2_harmonio', nome: 'Dó, Mi, Sol', desc: 'Abra o harmônio da capela com a música dos canos.', secreta: true, dica: 'o que os canos cantaram' },
  { id: 'l2_vitrola', nome: 'Hino Para Um Cego', desc: 'Passe de pé pelo Inspetor enquanto ele ouve a vitrola.', secreta: true, dica: 'ele também tem saudade' },
  { id: 'l2_telefone', nome: 'Linha da Serra', desc: 'Ligue para o Posto Serra do telefone da recepção.', secreta: true, dica: 'o número está pintado' },
  { id: 'l2_sineta', nome: 'O Jantar Está Servido', desc: 'Faça o Inspetor sentar à mesa da cozinha.', secreta: true, dica: 'a colher no prato' }
];

export function criarMundoJogavel(C) {
  const { THREE, W, P, M, PROC, ANA, keys, R, MAT } = C;
  const rand = (a, b) => a + Math.random() * (b - a), pick = a => a[Math.random() * a.length | 0];
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const S = () => C.S, perf = () => C.perf;
  for (const c of CONQUISTAS) if (!R.conquistas.some(x => x.id === c.id)) R.conquistas.push(c);
  const pag = R.paginas.find(p => p.id === 'p1'); if (pag && !pag.texto.includes('D pequeno')) pag.texto += TXT.paginaD;
  const red = R.notas.find(n => n.id === 'n5'); const redBase = red ? red.texto : '';

  // ------------------------------------------------ HUD próprio (rádio e fone)
  const css = document.createElement('style');
  css.textContent = `#jm-hud{position:absolute;left:28px;bottom:128px;font-family:"Special Elite",monospace;font-size:13px;color:#b8ab8e;letter-spacing:.06em;text-shadow:0 0 6px #000;pointer-events:none}
  #jm-hud .r{display:block;margin-top:4px}#jm-hud .r i{display:inline-block;width:90px;height:4px;margin-left:8px;background:rgba(255,255,255,.1);vertical-align:middle;position:relative}
  #jm-hud .r i b{position:absolute;left:0;top:0;bottom:0;background:#c9a75a;width:var(--v,0%)}#jm-hud .r.quente i b{background:#c0392b}
  #jm-fone-btn{margin-top:10px}`;
  document.head.appendChild(css);
  const hud = document.createElement('div'); hud.id = 'jm-hud'; hud.innerHTML = '<span class="f" hidden>[fone] o prédio fica longe · T tira</span><span class="r" hidden>rádio <i><b></b></i> <em></em></span>';
  document.getElementById('hud')?.appendChild(hud);
  const elF = hud.querySelector('.f'), elR = hud.querySelector('.r'), elRb = elR.querySelector('b'), elRt = elR.querySelector('em');
  // botão no diário: "Ouvir a fita no fone"
  const dia = document.getElementById('diario');
  let btnFone = null;
  if (dia) { btnFone = document.createElement('button'); btnFone.className = 'btn'; btnFone.id = 'jm-fone-btn'; btnFone.textContent = 'Ouvir a fita no fone (T)'; btnFone.onclick = () => alternarFone(); const fx = document.getElementById('d-fechar'); fx ? fx.parentNode.insertBefore(btnFone, fx) : dia.appendChild(btnFone); }

  // ------------------------------------------------ som próprio
  const A = C.audio;
  const som = {
    ok: () => !!C.AC,
    chiado(vol = .2, dur = .25, pos = null) { if (!C.AC) return; const t = C.AC.currentTime, g = A.saida(pos, .1); A.burst(t, dur, 'bandpass', rand(1400, 2600), .7, g); A.env(g, t, .01, vol, dur); },
    sineta(pos) { if (!C.AC) return; const t = C.AC.currentTime; for (const [f, k] of [[1760, 0], [2640, .002], [1760, .35], [2640, .352]]) { const g = A.saida(pos, .6); A.osc('sine', f * rand(.995, 1.005), t + k, 1.6, g); A.env(g, t + k, .002, f > 2000 ? .12 : .25, 1.4); } },
    alo(pos) { if (!C.AC) return; const t = C.AC.currentTime, g = A.saida(pos, .5); A.burst(t, .08, 'highpass', 3000, 1, g); A.env(g, t, .002, .5, .08);
      const g2 = A.saida(pos, .5), lp = C.AC.createBiquadFilter(); lp.type = 'bandpass'; lp.frequency.value = 900; lp.Q.value = 3; lp.connect(g2);
      const o = A.osc('square', 210, t + .25, .7, lp); o.frequency.setValueAtTime(210, t + .25); o.frequency.linearRampToValueAtTime(180, t + .5); o.frequency.setValueAtTime(240, t + .6); o.frequency.linearRampToValueAtTime(170, t + .9);
      g2.gain.setValueAtTime(.0001, t + .24); g2.gain.exponentialRampToValueAtTime(.35, t + .3); g2.gain.setValueAtTime(.35, t + .45); g2.gain.exponentialRampToValueAtTime(.05, t + .52); g2.gain.exponentialRampToValueAtTime(.35, t + .6); g2.gain.exponentialRampToValueAtTime(.0001, t + .95);
      const g3 = A.saida(pos, .7); A.osc('sine', 2900, t + .9, 1.1, g3); A.env(g3, t + .9, .3, .08, .7); },
    ocupado() { if (!C.AC) return; const t = C.AC.currentTime; for (let i = 0; i < 5; i++) { const g = A.saida(null, 0); A.osc('sine', 425, t + i * .5, .25, g); A.env(g, t + i * .5, .01, .08, .22); } },
    nota(f, pos, vol = .22) { if (!C.AC) return; const t = C.AC.currentTime, g = A.saida(pos, .7), lp = C.AC.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 1200; lp.connect(g);
      for (const d of [1, 1.004, 2.002]) A.osc('sawtooth', f * d, t, 1.6, lp); g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + .12); g.gain.setValueAtTime(vol, t + .9); g.gain.exponentialRampToValueAtTime(.0001, t + 1.55);
      const g2 = A.saida(pos, .2); A.burst(t, .1, 'lowpass', 300, 1, g2); A.env(g2, t, .005, .15, .1); },
    hino(pos, dur = 15) { if (!C.AC) return; const t = C.AC.currentTime, g = A.saida(pos, .6), lp = C.AC.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 1500; lp.connect(g); g.gain.value = .12;
      const notas = [196, 220, 246.9, 220, 196, 174.6, 196, 164.8, 174.6, 196, 220, 196, 174.6, 164.8, 146.8, 164.8, 196, 196];
      const o = C.AC.createOscillator(); o.type = 'triangle'; o.connect(lp); notas.forEach((n, i) => o.frequency.setValueAtTime(n, t + i * (dur / notas.length)));
      const o2 = C.AC.createOscillator(); o2.type = 'sine'; o2.connect(lp); notas.forEach((n, i) => o2.frequency.setValueAtTime(n / 2, t + i * (dur / notas.length)));
      g.gain.setValueAtTime(.12, t + dur - .5); g.gain.linearRampToValueAtTime(0, t + dur); o.start(t); o2.start(t); o.stop(t + dur + .1); o2.stop(t + dur + .1);
      for (let i = 0; i < dur * 5; i++) { const k = t + i * .2 + rand(0, .15), gc = A.saida(pos, 0); A.burst(k, .012, 'highpass', 3500, 1, gc); A.env(gc, k, .001, .05, .01); }
      return { parar: () => { try { const n = C.AC.currentTime; g.gain.cancelScheduledValues(n); g.gain.setValueAtTime(0, n); o.stop(n + .05); o2.stop(n + .05); } catch (e) {} } }; },
    risco(pos) { if (!C.AC) return; const t = C.AC.currentTime, g = A.saida(pos, .4); const f = A.burst(t, .45, 'bandpass', 2500, 2, g); f.frequency.linearRampToValueAtTime(600, t + .4); A.env(g, t, .005, .7, .4); },
    enrolar() { if (!C.AC) return; const t = C.AC.currentTime; for (const k of [0, .09]) { const g = A.saida(null, 0); A.burst(t + k, .015, 'highpass', 4200, 2, g); A.env(g, t + k, .001, .12, .015); } },
    fone(on) { if (!C.AC) return; if (on && !som._fone) { const s = A.ruido(true), f = C.AC.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 3200; f.Q.value = .6; const g = A.saida(null, 0, 'voz'); g.gain.value = .02; s.connect(f); f.connect(g); s.start(); som._fone = { s, g }; } else if (!on && som._fone) { try { som._fone.s.stop(); } catch (e) {} som._fone = null; } },
    cochicho(pos) { if (!C.AC) return; const t = C.AC.currentTime; for (const [k, f] of [[0, 2400], [.25, 3100], [.5, 2000], [.7, 2800]]) { const g = A.saida(pos, .2); A.burst(t + k, .18, 'bandpass', f, 5, g); A.env(g, t + k, .03, .25, .14); } }
  };

  // ------------------------------------------------ estado por mapa
  let G = null;
  const texCache = {};
  const texLetra = (letra, cor, reta) => texCache[letra + cor + reta] || (texCache[letra + cor + reta] = C.canvasTex(128, 128, (g, w, h) => {
    g.clearRect(0, 0, w, h); g.strokeStyle = cor; g.lineCap = 'round'; g.lineWidth = reta ? 7 : 4;
    for (let k = 0; k < (reta ? 1 : 3); k++) { g.globalAlpha = reta ? .95 : .55 + k * .15; g.font = `${reta ? 'bold ' : ''}${reta ? 96 : 70}px ${reta ? 'Arial' : 'Georgia'}`; g.textAlign = 'center'; g.strokeText(letra, 64 + k * 1.5, reta ? 98 : 90 + k); }
  }));
  const descartar = t => { t.userData.clone = true; return t; };
  const matTex = (tex, extra = {}) => { if (!Object.values(texCache).includes(tex)) descartar(tex); return new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false, ...extra }); };
  const txtMat = (linhas, o) => new THREE.MeshStandardMaterial({ map: descartar(C.textoTex(linhas, o)), roughness: .9, transparent: !!(o && o.transparente) });
  const giz = linhas => descartar(C.canvasTex(512, 256, (g, w, h) => { g.clearRect(0, 0, w, h); g.fillStyle = 'rgba(225,220,205,.85)'; g.textAlign = 'center'; linhas.forEach((l, i) => { g.font = `${l.tam || 34}px "Special Elite", Georgia`; g.fillText(l.t, w / 2 + rand(-4, 4), 60 + i * 52); }); }));
  function naParede(sid, lado, t, y, w, h, mat) {
    const r = C.SALA(sid); if (!r) return null;
    let x, z, ry;
    for (let k = 0; k < 12; k++) {
      const tt = clamp(t + (k ? (k % 2 ? 1 : -1) * Math.ceil(k / 2) * .07 : 0), .08, .92);
      if (lado === 'n') { x = r.x0 + tt * (r.x1 - r.x0); z = r.z0 + .115; ry = 0; }
      else if (lado === 's') { x = r.x0 + tt * (r.x1 - r.x0); z = r.z1 - .115; ry = Math.PI; }
      else if (lado === 'o') { x = r.x0 + .115; z = r.z0 + tt * (r.z1 - r.z0); ry = Math.PI / 2; }
      else { x = r.x1 - .115; z = r.z0 + tt * (r.z1 - r.z0); ry = -Math.PI / 2; }
      if (!W.links.some(l => Math.hypot(l.x - x, l.z - z) < .95 + w / 2)) break;
    }
    return C.plano(w, h, mat, x, y, z, ry);
  }
  function lore(id, sala, obj) { const p = new THREE.Vector3(); obj.getWorldPosition(p); G.lore.push({ id, sala, mapa: W.mapa, x: p.x, z: p.z }); }
  function segredo(id, obj, fala) { const p = new THREE.Vector3(); obj.getWorldPosition(p); G.segredos.push({ id, x: p.x, z: p.z, fala }); }
  const achar = id => { S().flags['l2s_' + id] = true; };
  const achado = id => !!S().flags['l2s_' + id];
  function examinar(obj, label, fn) { return C.interact(obj, () => '<b>E</b>' + (typeof label === 'function' ? label() : label), fn); }
  function falaLia(t) { C.sub('lia', t); }

  // ------------------------------------------------ o Inspetor atraído pelo mundo
  const ocupado = () => ['caca', 'bote', 'agarra', 'alerta', 'vasculha', 'fareja'].includes(M.state);
  function chamar(x, z, o = {}) {
    if (!M.ativo || ocupado() || S().flags.sino) return false;
    M.state = 'investiga'; M.acao = null; M.searchT = 0; M.ultimo = new THREE.Vector3(x, 0, z);
    if (!C.planejar(M, x, z)) return false;
    G.chamado = { x, z, espera: o.espera || 0, ouvido: o.ouvido ?? 1, depois: o.depois, chegou: false, t: 0, max: 45, yaw: o.yaw, aoChegar: o.aoChegar };
    return true;
  }
  function updateChamado(dt) {
    const c = G.chamado; if (!c) return;
    c.max -= dt;
    if (!M.ativo || c.max <= 0 || ['caca', 'bote', 'agarra'].includes(M.state)) { G.chamado = null; return; }
    if (!c.chegou) {
      if (Math.hypot(M.pos.x - c.x, M.pos.z - c.z) < 1.7) { c.chegou = true; c.t = c.espera; M.path = []; M.wait = c.espera; M.state = 'procura'; M.searchT = c.espera + 2; M.acao = null; if (c.yaw !== undefined) M.yaw = c.yaw; c.aoChegar && c.aoChegar(); }
      else if (!M.path.length && M.state !== 'investiga') { G.chamado = null; }
      return;
    }
    c.t -= dt; if (c.yaw !== undefined) M.yaw = c.yaw;
    if (c.t <= 0) { G.chamado = null; c.depois && c.depois(); }
  }

  // ------------------------------------------------ armários marcados (D do Davi, T do Tomé, D falso)
  function marcar(L, tipo) {
    if (!L || L.l2marca) return;
    L.l2marca = tipo;
    const reta = tipo === 'F', letra = tipo === 'T' ? 'T' : 'D';
    const m = new THREE.Mesh(new THREE.PlaneGeometry(reta ? .2 : .13, reta ? .2 : .13), matTex(texLetra(letra, reta ? 'rgba(40,30,25,1)' : 'rgba(220,214,196,1)', reta)));
    m.position.set(.3, reta ? 1.45 : 1.18, .352); L.g.add(m);
    const it = W.inter.find(i => i.obj === L.g);
    if (it) { const lb = it.label; it.label = () => S().hidden === L ? lb() : lb() + `<small style="opacity:.65"> · ${tipo === 'T' ? 'um T pequeno entalhado' : reta ? 'um D grande, de traço reto' : 'um D pequeno riscado'}</small>`; }
    G.marcados.push(L);
  }
  function escolherArmarios(mapa) {
    const rota = ROTA[mapa] || [], arms = W.lockers.filter(L => L.tipo === 'armario');
    const sala = L => C.roomAt(L.x, L.z).id;
    const naRota = arms.filter(L => rota.includes(sala(L))).sort((a, b) => (a.x * 997 + a.z) - (b.x * 997 + b.z));
    const fora = arms.filter(L => !rota.includes(sala(L))).sort((a, b) => (a.x * 997 + a.z) - (b.x * 997 + b.z));
    const lista = [...naRota, ...fora];
    if (mapa === 'tuneis') {
      const perto = (x, z) => arms.reduce((m, L) => !m || Math.hypot(L.x - x, L.z - z) < Math.hypot(m.x - x, m.z - z) ? L : m, null);
      marcar(perto(33.55, -14.5), 'T'); marcar(perto(-33.55, -21.5), 'D'); marcar(perto(5.55, -33.5), 'F');
      return;
    }
    if (!lista.length || mapa === 'estrada' || mapa === 'cemiterio') return;
    marcar(lista[0], 'T'); if (lista[1]) marcar(lista[1], 'D'); if (lista[2]) marcar(lista[2], 'D');
  }
  // armário que ele não abre: D e T protegem do faro, das batidas e do barulho médio (não do barulho alto)
  function protegido(L, r = 0) { return !!(L && (L.l2marca === 'D' || L.l2marca === 'T') && r < 6); }
  function nuncaAbre(L) { return !!(L && (L.l2marca === 'D' || L.l2marca === 'T')); }
  function aoEsconder(L) {
    const s = S();
    if (L.l2marca === 'T') {
      som.cochicho({ x: L.x, y: 1.4, z: L.z });
      setTimeout(() => { if (S() && S().hidden === L) C.sub('tome', '(cochicho, de dentro do armário) ' + TXT.t); }, 600);
      if (!s.flags.l2tome) { s.flags.l2tome = true; if (red && !red.texto.includes('ACHEI UM ARMÁRIO')) red.texto = redBase + TXT.redacaoT; C.toast('Uma linha nova apareceu na redação do Tomé (diário).'); C.conquista('l2_tome'); }
      achar('tome_' + W.mapa);
    } else if (L.l2marca === 'D') {
      const k = W.mapa + ':' + W.lockers.indexOf(L), usados = s.flags.l2dUsados || (s.flags.l2dUsados = {});
      if (!usados[k]) { usados[k] = true; if (Object.keys(usados).length === 1) setTimeout(() => C.subPequeno('lia', 'Um D riscado. A letra dele. Ele marcou esse.'), 700); if (Object.keys(usados).length >= 3) C.conquista('l2_davi'); }
      achar('d_' + k);
    } else if (L.l2marca === 'F') {
      if (!s.flags.l2falso) { s.flags.l2falso = true; setTimeout(() => C.subPequeno('lia', 'Esse D... é reto demais. Não é a letra dele.'), 500); }
    }
    if (s.flags.l2batidas && (L.l2marca === 'D' || L.l2marca === 'T') && !G.simDado) { G.simDado = true; setTimeout(() => { if (S().hidden === L) { C.SX.batida(L.x + L.face[0] * -.4, L.z + L.face[1] * -.4, .45); C.toast('[uma batida, baixinha, por dentro da parede: sim]'); } }, 1400); }
  }

  // ------------------------------------------------ montagem por mapa
  function mapa(id) {
    if (G) for (const p of G.pegadas) { p.m.geometry.dispose(); p.m.material.dispose(); }
    if (fone) { fone = false; foneFila = []; som.fone(false); if (btnFone) btnFone.textContent = 'Ouvir a fita no fone (T)'; } // morrer ou trocar de mapa tira o fone
    G = { mapa: id, lore: [], segredos: [], marcados: [], falantes: [], velas: [], chamado: null, batT: 1, cd3: 25, cd2: 15, simDado: false, portaT: 0, portaIt: null, portaCd: {}, travadoT: 0, doneN: -1, pegadas: [], pegCd: 60, radioT: 0, radioNoise: 0, radioFala: 0, radioSoz: 0, radioSozCd: 90, vitrola: null, fitaPend: null, avancando: false, laB: null, vela: null };
    if (!W.def || !S()) return;
    if (red) red.texto = S().flags.l2tome ? redBase + TXT.redacaoT : redBase; // a linha nova da redação segue o save, não a sessão
    try {
      if (id === 'estrada') montarEstrada();
      else if (id === 'terreo') montarTerreo();
      else if (id === 'superior') montarSuperior();
      else if (id === 'tuneis') montarTuneis();
      else if (id === 'cemiterio') montarCemiterio();
      escolherArmarios(id);
      montarVelas(id);
      for (const L of G.marcados) if (L.l2marca === 'T') segredo('tome_' + id, L.g, '(rádio) Esse armário... um menino se escondia aí. Ninguém nunca achou ele.');
    } catch (e) { console.warn('jogabilidade-mundo', e); }
    window.__jgm = { lore: G.lore, rota: ROTA, segredos: G.segredos, marcados: G.marcados.map(L => L.l2marca), G };
  }

  function montarEstrada() {
    if (!C.SALA('posto')) return;
    const cal = naParede('posto', 'l', .7, 1.7, .5, .62, txtMat([{ t: 'MARÇO', tam: 64, estilo: 'bold' }, { t: '1979', tam: 54 }, { t: '14 15 16 17', tam: 34 }], { w: 256, h: 320, fundo: '#d8ccb0', cor: '#5a2010', manchas: 9 }));
    examinar(cal, 'Olhar o calendário do posto', () => { falaLia('Março de 1979. Ninguém virou a folha desde a noite do incêndio.'); achar('calPosto'); });
    lore('calPosto', 'posto', cal); segredo('calPosto', cal, '(rádio) Eu parei de virar o calendário. Pra quê?');
    const pl = naParede('posto', 'n', .3, 2.05, 1.1, .38, txtMat([{ t: 'POSTO SERRA', tam: 58, estilo: 'bold' }, { t: 'FONE 03-79', tam: 44 }], { w: 512, h: 180, fundo: '#7a1a12', cor: '#e8dcc0', manchas: 5 }));
    lore('placaFone', 'posto', pl);
  }

  function montarTerreo() {
    const s = S();
    // rádio de pilha do Seu Joaquim, no balcão da recepção
    const rad = new THREE.Group(); rad.position.set(.35, 1.16, -4.12); W.grupo.add(rad);
    C.box(.26, .15, .08, new THREE.MeshStandardMaterial({ color: 0x5a3a20, roughness: .6, emissive: 0x1a0c04, emissiveIntensity: .7 }), 0, .075, 0, rad);
    C.box(.12, .1, .01, MAT.preto, -.04, .08, .042, rad, false); C.cyl(.004, .004, .3, MAT.metal, .1, .3, 0, 4, rad);
    const itR = C.interact(rad, () => '<b>E</b>Pegar o rádio de pilha do Seu Joaquim', () => {
      s.flags.l2radio = true; rad.visible = false; C.SFX.pegar(); C.renderInvMini(); som.chiado(.25, .4);
      C.sub('joaquim', '(no rádio, baixinho) Fica com ele, moça. Segura o B: perto de coisa escondida, ele chia mais. Mas ele ouve o chiado também.');
      C.toast('Rádio do Seu Joaquim: segure B. Quente perto de segredos, e faz barulho.');
    });
    itR.on = () => rad.visible; rad.visible = !s.flags.l2radio;
    lore('radio', 'hall', rad);
    // livro de visitas no balcão (com a assinatura dela)
    const lv = new THREE.Group(); lv.position.set(-.75, 1.16, -3.95); W.grupo.add(lv);
    C.box(.34, .03, .24, new THREE.MeshStandardMaterial({ color: 0x3a1a14, roughness: .9, emissive: 0x100604, emissiveIntensity: .6 }), 0, .015, 0, lv);
    C.box(.32, .01, .22, MAT.papel, 0, .034, 0, lv, false);
    examinar(lv, () => 'Ler o livro de visitas', () => { C.abrirNotaUI(TXT.livroVisitas.titulo, TXT.livroVisitas.texto); if (!achado('livro')) { achar('livro'); setTimeout(() => C.subPequeno('lia', 'Essa é a minha letra. Eu não escrevi isso.'), 900); } });
    lore('livro', 'hall', lv); segredo('livro', lv, '(rádio) O livro da porta... confere a última linha, moça.');
    // telefone de disco na parede da recepção + lista com o número do posto
    const tel = new THREE.Group(); W.grupo.add(tel);
    const ref = naParede('hall', 'l', .4, 1.42, .22, .3, new THREE.MeshStandardMaterial({ color: 0x141414, roughness: .4, metalness: .2 }));
    tel.position.copy(ref.position); tel.rotation.y = ref.rotation.y; W.grupo.remove(ref); ref.geometry.dispose();
    C.box(.22, .3, .08, new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: .35 }), 0, 0, .04, tel);
    C.cyl(.07, .07, .015, MAT.metal, 0, -.03, .088, 14, tel).rotation.x = Math.PI / 2;
    C.box(.06, .26, .06, new THREE.MeshStandardMaterial({ color: 0x101010, roughness: .3 }), .14, .02, .06, tel);
    const lista = naParede('hall', 'l', .48, 1.55, .3, .4, txtMat([{ t: 'TELEFONES', tam: 40, estilo: 'bold' }, { t: 'Delegacia ....... 01-90', tam: 26 }, { t: 'Bispado ......... 22-41', tam: 26 }, { t: 'Posto Serra ..... 03-79', tam: 26 }], { w: 320, h: 420, fundo: '#cfc2a2', cor: '#2a1a10', manchas: 8 }));
    lore('lista', 'hall', lista);
    C.interact(tel, () => s.chapter < 1 ? 'Um telefone de disco. Mudo.' : '<b>E</b>Discar no telefone de disco', () => {
      if (s.chapter < 1) return;
      C.SFX.clique(); C.emitNoise(tel.position.x, tel.position.z, 3);
      C.abrirTeclado('TELEFONE DA RECEPÇÃO', '1403', () => {
        som.chiado(.18, 1.2); TXT.gravacao1979.forEach(l => C.sub(l.quem, l.texto, true)); C.emitNoise(tel.position.x, tel.position.z, 5); achar('telefone1403');
      }, () => {
        const d = C.digitado;
        if (d === '0379') { setTimeout(() => C.fecharTeclado(), 0); som.chiado(.2, 1.4); C.sub('joaquim', TXT.telefone[s.chapter] || TXT.telefone[5], true); C.conquista('l2_telefone'); achar('telefone'); }
        else { som.ocupado(); C.toast('Sinal de ocupado. O disco girou alto.'); }
      });
    });
    segredo('telefone', tel, '(rádio) Esse telefone ainda liga pro posto. Eu atendo, moça. Sempre atendi.');
    lore('telefone', 'hall', tel);
    // recado de giz do Renato (envelhecido: errado agora)
    const g1 = naParede('hall', 'o', .55, 1.2, 1.1, .55, matTex(giz([{ t: 'A ESCADA DA FRENTE' }, { t: 'É SEGURA — R., 87' }, { t: 'X  NÃO É MAIS  X', tam: 40 }])));
    examinar(g1, 'Ler o recado de giz', () => C.abrirNotaUI(TXT.renato[0].titulo, TXT.renato[0].texto)); lore('giz1', 'hall', g1);
    const g2 = naParede('cw', 's', .55, 1.1, 1.1, .55, matTex(giz([{ t: 'ELE NUNCA ENTRA' }, { t: 'NA COZINHA — R.' }, { t: '~~~~~~~~~~~~~', tam: 40 }])));
    examinar(g2, 'Ler o recado de giz', () => C.abrirNotaUI(TXT.renato[1].titulo, TXT.renato[1].texto)); lore('giz2', 'cw', g2);
    // alto-falantes (o microfone da diretoria fala por eles)
    for (const [sid, lado, t] of [['hall', 'n', .55], ['cw', 's', .5], ['ce', 'n', .66]]) {
      const ref2 = naParede(sid, lado, t, 2.75, .3, .3, matTex(C.canvasTex(64, 64, (g, w, h) => { g.fillStyle = '#2a2620'; g.fillRect(0, 0, w, h); g.strokeStyle = '#0a0806'; for (let r = 6; r < 30; r += 5) { g.beginPath(); g.arc(32, 32, r, 0, 6.28); g.stroke(); } }), { transparent: false }));
      C.box(.34, .34, .12, MAT.madeiraEsc, ref2.position.x - Math.sin(ref2.rotation.y) * .07, 2.75, ref2.position.z - Math.cos(ref2.rotation.y) * .07, W.grupo, false);
      ref2.position.x += Math.sin(ref2.rotation.y) * .01; ref2.position.z += Math.cos(ref2.rotation.y) * .01;
      G.falantes.push({ x: ref2.position.x + Math.sin(ref2.rotation.y) * .8, z: ref2.position.z + Math.cos(ref2.rotation.y) * .8, sala: sid });
    }
    // microfone da diretoria
    const mic = new THREE.Group(); W.grupo.add(mic);
    const pm = naParede('diret', 'o', .2, 1.1, .5, .4, txtMat([{ t: 'SOM INTERNO', tam: 44, estilo: 'bold' }, { t: 'ligar só na Hora', tam: 30, estilo: 'italic' }], { w: 320, h: 256, fundo: '#2a241c', cor: '#bfae86' }));
    mic.position.set(pm.position.x + .12, 1.0, pm.position.z); lore('microfone', 'diret', pm);
    C.box(.2, .06, .14, MAT.metal, 0, 0, 0, mic); C.cyl(.008, .008, .22, MAT.metal, 0, .14, 0, 5, mic); const cab = C.cyl(.03, .03, .07, MAT.preto, 0, .27, .02, 8, mic); cab.rotation.x = .5;
    C.interact(mic, () => !s.flags.energia ? 'Um microfone ligado ao som interno. Sem energia.' : s.flags['l2mic' + s.chapter] ? 'O microfone chia. Ele já conhece esse truque.' : '<b>E</b>Falar "alô" no microfone (alto-falante longe)', () => {
      if (!s.flags.energia) return;
      const r0 = C.roomAt(mic.position.x, mic.position.z);
      if (s.flags['l2mic' + s.chapter]) { C.SFX.clique(); som.chiado(.15, .3); if (M.ativo) C.sub('inspetor', 'Truque velho.'); C.emitNoise(mic.position.x, mic.position.z, 7); return; }
      s.flags['l2mic' + s.chapter] = true; achar('microfone');
      const fs = G.falantes.slice().sort((a, b) => Math.hypot(b.x - P.pos.x, b.z - P.pos.z) - Math.hypot(a.x - P.pos.x, a.z - P.pos.z));
      const f = fs[0]; if (!f) return;
      C.SFX.clique(); som.alo({ x: f.x, y: 2.7, z: f.z }); C.toast('"Alô?" ecoa num alto-falante do outro lado do prédio.');
      if (!chamar(f.x, f.z, { espera: 3.5, depois: () => { if (M.ativo && !ocupado()) { chamar(mic.position.x + .8, mic.position.z, { espera: 2 }); C.sub('inspetor', 'Quem mexeu no meu microfone?'); } } })) C.emitNoise(f.x, f.z, 16);
      void r0;
    });
    segredo('microfone', mic, '(rádio) O som interno. O diretor dava bronca por ele. Ainda funciona, se tiver luz.');
    // calendário de 1979 na diretoria: o código do quadro no verso
    const cal = naParede('diret', 'n', .85, 1.55, .42, .52, txtMat([{ t: '1979', tam: 70, estilo: 'bold' }, { t: 'MARÇO', tam: 46 }, { t: '(14)', tam: 40 }], { w: 256, h: 320, fundo: '#d4c8aa', cor: '#3a1a10', manchas: 8 }));
    examinar(cal, 'Virar o calendário', () => { C.abrirNotaUI(TXT.calendario.titulo, C.codTxt(TXT.calendario.texto)); achar('calendario'); });
    lore('calendario', 'diret', cal); segredo('calendario', cal, '(rádio) O diretor anotava tudo atrás das coisas. Tudo.');
    // foto de turma
    const ft = naParede('diret', 'l', .25, 1.7, .6, .44, txtMat([{ t: 'TURMA DE 1978', tam: 36, estilo: 'bold' }, { t: '☺ ☺ ☺ ☺ ☺ ☺ ☺ ☺', tam: 34 }, { t: '☺ ☺ ✕ ☺ ☺ ✕ ☺ ✕', tam: 34 }], { w: 400, h: 300, fundo: '#3a3428', cor: '#cfc3a6', manchas: 10 }));
    examinar(ft, 'Olhar a foto da turma', () => falaLia('A turma de 78. Três rostos riscados a caneta. O do canto é o Davi. Ele tá rindo.')); lore('foto', 'diret', ft);
    // cozinha: a sineta da cozinheira
    const sn = new THREE.Group(); W.grupo.add(sn);
    const sref = naParede('cozinha', 'o', .83, 1.75, .1, .1, MAT.preto); sn.position.copy(sref.position); sn.rotation.y = sref.rotation.y; W.grupo.remove(sref); sref.geometry.dispose();
    C.box(.04, .14, .04, MAT.ferrugem, 0, 0, .02, sn); const sino = new THREE.Mesh(new THREE.ConeGeometry(.08, .12, 12, 1, true), MAT.bronze); sino.position.set(0, -.12, .12); sn.add(sino); C.box(.12, .02, .12, MAT.ferrugem, 0, .07, .08, sn);
    const mesa = { x: -28.5, z: -18.05 };
    C.interact(sn, () => '<b>E</b>Tocar a sineta de servir', () => {
      const k = 'l2sineta' + s.chapter, vez = (s.flags[k] || 0) + 1; s.flags[k] = vez; achar('sineta');
      som.sineta({ x: sn.position.x, y: 1.7, z: sn.position.z }); sino.rotation.z = .4; setTimeout(() => sino.rotation.z = 0, 300);
      C.emitNoise(sn.position.x, sn.position.z, 4);
      if (!M.ativo) { C.toast('A sineta ecoa no prédio vazio.'); return; }
      if (vez === 1) {
        if (chamar(mesa.x, mesa.z, { espera: 10, ouvido: .45, yaw: 0, aoChegar: () => { C.SX.fungada && C.SX.fungada(M.pos); C.toast('Ele senta à mesa, de costas. Ouvindo a colher no prato.'); C.conquista('l2_sineta'); } })) {
          if (!s.flags.l2sinetaFala) { s.flags.l2sinetaFala = true; setTimeout(() => C.subPequeno('lia', 'O caderno da cozinheira... ele comia aqui sozinho. Vem jantar.'), 900); }
        }
      } else { M.furia = Math.max(M.furia || 0, 9); C.planejar(M, sn.position.x + .9, sn.position.z); M.state = 'investiga'; C.sub('inspetor', 'A comida acabou. Agora é você.'); }
    });
    lore('sineta', 'cozinha', sn); segredo('sineta', sn, '(rádio) A sineta da Dona Cida. Ele vinha correndo quando ela tocava. Que nem cachorro.');
    // despensa: 37 latas, 3 abertas
    const lt = new THREE.Group(); lt.position.set(-27.4, 0, -33.3); W.grupo.add(lt);
    for (let i = 0; i < 9; i++) C.cyl(.05, .05, .11, i % 4 === 0 ? MAT.ferrugem : MAT.metal, (i % 3) * .11, .055 + Math.floor(i / 3) * .112, 0, 8, lt);
    examinar(lt, 'Olhar as latas de sopa', () => falaLia('Trinta e sete latas contadas a giz. Três abertas, com a colher dentro. Ninguém comeu.')); lore('latas', 'despensa', lt);
    // enfermaria: régua de alturas
    const al = naParede('enferm', 'l', .2, 1.25, .34, 1.5, txtMat([{ t: '1,50', tam: 26 }, { t: '— DAVI', tam: 22 }, { t: '1,40', tam: 26 }, { t: '— TOMÉ', tam: 22 }, { t: '— ANA', tam: 22 }, { t: '1,20', tam: 26 }], { w: 128, h: 560, fundo: '#d8d0b8', cor: '#3a2a1a', manchas: 6 }));
    examinar(al, 'Olhar a régua de alturas', () => C.abrirNotaUI(TXT.alturas.titulo, TXT.alturas.texto)); lore('alturas', 'enferm', al);
    // casa de máquinas: livro de ponto do Moacir
    const lp = naParede('maq', 'o', .55, 1.45, .36, .48, txtMat([{ t: 'PONTO', tam: 48, estilo: 'bold' }, { t: 'disciplina', tam: 30, estilo: 'italic' }, { t: 'M. DUARTE', tam: 34 }], { w: 256, h: 340, fundo: '#2a3a2a', cor: '#cfc3a6', manchas: 8 }));
    examinar(lp, 'Ler o livro de ponto pendurado', () => { C.abrirNotaUI(TXT.pontoMoacir.titulo, TXT.pontoMoacir.texto); achar('ponto'); }); lore('ponto', 'maq', lp);
    segredo('ponto', lp, '(rádio) O Moacir batia ponto até no fim. Ele achava que alguém ia conferir.');
  }

  function montarSuperior() {
    const s = S();
    // a tabela do código de batidas, na altura de uma criança, ao lado da porta do D
    const tb = naParede('corr', 'l', .735, 1.0, .62, .46, matTex(giz([{ t: '1 = SIM', tam: 40 }, { t: '2 = NÃO VEM', tam: 40 }, { t: '3 = CORRE', tam: 44 }, { t: 'D A T', tam: 30 }])));
    examinar(tb, () => s.flags.l2batidas ? 'Reler o código das batidas' : 'Ler os riscos na parede', () => {
      C.abrirNotaUI(TXT.batidas.titulo, TXT.batidas.texto);
      if (!s.flags.l2batidas) { s.flags.l2batidas = true; setTimeout(() => C.subPequeno('lia', 'Eles conversavam batendo na parede. Se eu ouvir três...'), 600); }
    });
    lore('batidas', 'corr', tb);
    // escorregar pelo corrimão: segure SHIFT e aperte E no alto da escada
    const desc = W.inter.find(i => /Descer para o térreo/.test(i.label()));
    if (desc) {
      const lb = desc.label, act = desc.act;
      desc.label = () => lb() + '<small style="opacity:.6"> · SHIFT+E: escorregar pelo corrimão</small>';
      desc.act = () => {
        if (!(keys.ShiftLeft || keys.ShiftRight)) return act();
        const primeira = !s.flags.l2corrimao; s.flags.l2corrimao = true;
        if (primeira) C.sub('lia', '(rindo, nervosa) O Davi fazia isso. A Irmã ficava louca.');
        C.SFX.arrastar();
        C.fade(true, () => { C.carregarMapa('terreo', 'escada'); C.fade(false, null, 150); setTimeout(() => { if (!S() || W.mapa !== 'terreo') return; C.SFX.pancada(P.pos.x, P.pos.z); P.shake = .2; C.emitNoise(P.pos.x, P.pos.z, 12, true); C.toast('A batida lá embaixo ecoa pela recepção inteira.'); }, 60); }, 220);
      };
    }
    // dormitório E: a rodinha do carrinho do Tomé
    const rd = new THREE.Group(); rd.position.set(8.2, .03, -43.4); W.grupo.add(rd);
    const roda = C.cyl(.035, .035, .02, new THREE.MeshStandardMaterial({ color: 0x1d4a7a, emissive: 0x0a1a30, emissiveIntensity: .9 }), 0, 0, 0, 10, rd); roda.rotation.x = Math.PI / 2;
    examinar(rd, 'Olhar a rodinha azul no chão', () => { falaLia('Uma rodinha azul. Do carrinho do Tomé. Ele passou por aqui correndo.'); SFX_risada(8, -48); }); lore('rodinha', 'dormE', rd);
    // sala de brinquedos: amarelinha de giz com a contagem da Ana
    const am = new THREE.Mesh(new THREE.PlaneGeometry(.9, 1.8), matTex(C.canvasTex(128, 256, (g, w, h) => { g.clearRect(0, 0, w, h); g.strokeStyle = 'rgba(230,225,210,.8)'; g.lineWidth = 3; g.fillStyle = 'rgba(230,225,210,.8)'; g.font = '22px Georgia'; g.textAlign = 'center'; for (let i = 0; i < 10; i++) { const y = h - 24 - i * 23; g.strokeRect(34, y - 18, 60, 22); g.fillText(String(i + 1), 64, y); } })));
    am.rotation.set(-Math.PI / 2, 0, 0); am.position.set(5.6, .016, -26.6); W.grupo.add(am);
    examinar(am, 'Olhar a amarelinha de giz', () => falaLia('Uma amarelinha até dez. No dez, ela escreveu: AGORA VOCÊ CONTA.')); lore('amarelinha', 'brinq', am);
    // quarto da Celeste: o terço (no escuro, o medo sobe mais devagar)
    const tc = naParede('celeste', 'o', .78, 1.45, .14, .3, matTex(C.canvasTex(64, 128, (g) => { g.clearRect(0, 0, 64, 128); g.fillStyle = 'rgba(200,190,160,.95)'; for (let i = 0; i < 18; i++) { const a = i / 18 * 6.28; g.beginPath(); g.arc(32 + Math.sin(a) * 18, 40 + Math.cos(a) * 26, 3, 0, 6.28); g.fill(); } g.fillRect(30, 70, 4, 40); g.fillRect(22, 84, 20, 4); })));
    const itT = examinar(tc, 'Pegar o terço da Irmã Celeste', () => { s.flags.l2terco = true; tc.visible = false; C.SFX.pegar(); C.renderInvMini(); falaLia('O terço dela. Bateu na mesa e ele virou a cabeça, ela escreveu. Fica comigo.'); C.toast('Com o terço na mão, o escuro assusta menos.'); });
    itT.on = () => tc.visible; tc.visible = !s.flags.l2terco; lore('terco', 'celeste', tc);
    // depósito: a vitrola do Moacir
    const vt = new THREE.Group(); vt.position.set(6.2, 0, -50.75); W.grupo.add(vt);
    C.box(.5, .42, .4, MAT.madeiraEsc, 0, .21, 0, vt); const prato = C.cyl(.16, .16, .012, MAT.preto, 0, .43, 0, 18, vt); C.box(.03, .02, .2, MAT.bronze, .17, .44, .02, vt);
    const corneta = new THREE.Mesh(new THREE.ConeGeometry(.16, .34, 14, 1, true), MAT.bronze); corneta.position.set(-.12, .62, -.08); corneta.rotation.set(.6, 0, .5); vt.add(corneta);
    C.addCollider(5.93, 6.47, -50.97, -50.53);
    W.tick.push(dt => { if (G && G.vitrola) prato.rotation.y += dt * 3.5; });
    C.interact(vt, () => G.vitrola ? 'A vitrola toca um hino arranhado.' : s.flags['l2vitrola' + s.chapter] ? 'O disco está gasto.' : '<b>E</b>Ligar a vitrola (um disco de hinos)', () => {
      if (G.vitrola || s.flags['l2vitrola' + s.chapter]) return;
      s.flags['l2vitrola' + s.chapter] = true; achar('vitrola');
      const pos = { x: vt.position.x, y: .6, z: vt.position.z }, h = som.hino(pos, 15), pula = Math.random() < .3;
      G.vitrola = { t: 15, h, pula: pula ? rand(4, 8) : -1, passou: false };
      C.emitNoise(pos.x, pos.z, 6);
      if (M.ativo) chamar(4.1, -54, { espera: 15, ouvido: .2, aoChegar: () => C.toast('Ele parou na porta. Ouvindo. Quieto como um menino.') });
      if (!s.flags.l2vitrolaFala) { s.flags.l2vitrolaFala = true; setTimeout(() => C.subPequeno('lia', 'Um hino. O silêncio dele não é só raiva. É luto.'), 2500); }
    });
    lore('vitrola', 'sotao', vt); segredo('vitrola', vt, '(rádio) A vitrola do Moacir. Ele dormia no depósito, igual bicho. Só dormia com hino.');
    // depósito: nomes riscados no monta-cargas
    const nm = naParede('sotao', 'l', .3, 1.25, .6, .4, matTex(giz([{ t: 'DAVI  ANA  TOMÉ', tam: 40 }, { t: 'a gente desce', tam: 34 }, { t: 'e não volta', tam: 34 }])));
    examinar(nm, 'Ler os nomes riscados', () => falaLia('Eles desceram por aqui. Os três. Na noite do sino.')); lore('nomesMonta', 'sotao', nm);
  }
  const SFX_risada = (x, z) => { try { C.SFX.risada(x, z); } catch (e) {} };

  function montarTuneis() {
    const s = S();
    // batente da câmara oeste: a ordem das válvulas em algarismos romanos, meio apagada
    const ROM = ['', 'I', 'II', 'III'], ordem = s.ordem.map(n => ROM[n]).join(' · ');
    const rm = naParede('v1', 'l', .78, 1.75, .7, .3, matTex(C.canvasTex(256, 96, (g, w, h) => { g.clearRect(0, 0, w, h); g.fillStyle = 'rgba(200,190,170,.55)'; g.font = 'bold 46px Georgia'; g.textAlign = 'center'; g.fillText(ordem, w / 2, 62); g.globalCompositeOperation = 'destination-out'; for (let i = 0; i < 40; i++) { g.globalAlpha = Math.random() * .6; g.fillRect(Math.random() * w, Math.random() * h, rand(4, 18), rand(2, 8)); } })));
    examinar(rm, 'Olhar os riscos no batente', () => { falaLia(TXT.romanos + ordem + '. A letra da Irmã. Ela riscou a ordem.'); achar('romanos'); });
    lore('romanos', 'v1', rm); segredo('romanos', rm, '(rádio) A Irmã riscou alguma coisa nesse batente. Pra não esquecer.');
    // cisterna: o nome do Moacir criança
    const cs = naParede('hub', 'o', .8, 1.5, .8, .4, matTex(giz([{ t: 'MOACIR D. 9 ANOS', tam: 38 }, { t: '1951 — ARM. 4', tam: 36 }])));
    const dg = naParede('saida', 'n', .7, 1.25, .8, .4, matTex(giz([{ t: '14 DEGRAUS', tam: 44 }, { t: 'NÃO PISA NO 9', tam: 38 }])));
    examinar(dg, 'Ler os riscos perto da escada', () => falaLia('Catorze degraus. O nono range. Eles contavam tudo pra fugir em silêncio.')); lore('degraus', 'saida', dg);
    examinar(cs, 'Ler os nomes no tijolo', () => { C.abrirNotaUI(TXT.cisterna.titulo, TXT.cisterna.texto); achar('cisterna'); }); lore('cisterna', 'hub', cs);
    segredo('cisterna', cs, '(rádio) O Moacir também foi menino aqui. Ninguém lembra disso.');
    // recado de giz certo (ainda vale)
    const g3 = naParede('entrada', 'o', .45, 1.4, 1.1, .55, matTex(giz([{ t: 'NA ÁGUA, AGACHADA,' }, { t: 'ELE NÃO TE OUVE' }, { t: '— R., 87   ☼', tam: 30 }])));
    examinar(g3, 'Ler o recado de giz', () => C.abrirNotaUI(TXT.renato[2].titulo, TXT.renato[2].texto)); lore('giz3', 'entrada', g3);
    // túnel norte: a lanterna velha do Moacir, pendurada
    const ln = new THREE.Group(); W.grupo.add(ln);
    const lref = naParede('t4', 'l', .65, 1.35, .1, .1, MAT.preto); ln.position.copy(lref.position); ln.rotation.y = lref.rotation.y; W.grupo.remove(lref); lref.geometry.dispose();
    const corpoL = C.cyl(.045, .05, .3, MAT.ferrugem, 0, 0, .06, 10, ln); corpoL.rotation.x = .2;
    const itL = examinar(ln, 'Abrir a lanterna velha do Moacir', () => { s.flags.l2lanterna = true; C.SFX.pegar(); s.inv.pilhas++; C.renderInvMini(); falaLia('A lanterna dele. Ele não precisava mais de luz, mas carregava. Tem uma pilha dentro.'); C.toast('Uma pilha meio gasta, ainda boa. R para trocar.'); });
    itL.on = () => !s.flags.l2lanterna; lore('lanterna', 't4', ln);
    // fita 3 mastigada: segurar E para enrolar com a caneta
    const f3 = R.fitas.find(f => f.id === 'f3'), itF = f3 && W.inter.find(i => { try { return i.label().includes(f3.titulo); } catch (e) { return false; } });
    if (itF && !s.flags.l2f3) {
      const lb = itF.label, act = itF.act;
      itF.hold = 6; itF.guarda = true; itF.ruido = 1.2; itF.som = null; itF.pode = () => !s.flags.l2f3;
      itF.label = () => s.flags.l2f3 ? lb() : '<b>E</b>Enrolar a fita mastigada com a caneta';
      itF.act = () => { if (!s.flags.l2f3) { s.flags.l2f3 = true; itF.hold = 0; itF.ruido = 0; C.SFX.fitaClique(); C.toast('A fita voltou para dentro do cassete. E para ouvir.'); return; } act(); };
      G.f3 = itF;
    }
  }

  function montarCemiterio() {
    const s = S(); if (!C.SALA('capela')) return;
    // harmônio da capela: dó, mi, sol abre a tampa
    const hm = new THREE.Group(); hm.position.set(-7.25, 0, -56.5); hm.rotation.y = Math.PI / 2; W.grupo.add(hm);
    const corpoH = C.box(1.3, .85, .5, MAT.madeiraEsc, 0, .43, 0, hm); C.box(1.3, .5, .12, MAT.madeiraEsc, 0, 1.12, -.2, hm);
    const tampa = new THREE.Group(); tampa.position.set(0, 1.38, -.22); hm.add(tampa); C.box(1.28, .04, .3, MAT.madeira, 0, 0, .14, tampa);
    C.addCollider(-7.55, -6.95, -57.2, -55.8);
    const NOTAS = [['dó', 130.81], ['ré', 146.83], ['mi', 164.81], ['fá', 174.61], ['sol', 196]], seq = [];
    NOTAS.forEach(([nome, f], i) => {
      const tk = C.box(.2, .04, .16, MAT.branco, -.44 + i * .22, .87, .17, hm, false);
      C.interact(tk, () => s.flags.l2harmonio ? `<b>E</b>Tocar a tecla (${nome})` : `<b>E</b>Tocar a tecla (${nome})<small style="opacity:.6"> · faz barulho</small>`, () => {
        const p = new THREE.Vector3(); tk.getWorldPosition(p); som.nota(f, { x: p.x, y: 1, z: p.z }); C.emitNoise(p.x, p.z, 6);
        tk.position.y = .85; setTimeout(() => tk.position.y = .87, 180);
        seq.push(nome); if (seq.length > 3) seq.shift();
        if (!s.flags.l2harmonio && seq.join() === 'dó,mi,sol') {
          s.flags.l2harmonio = true; tampa.rotation.x = -1.1; C.SFX.trancado(); achar('harmonio'); C.conquista('l2_harmonio');
          setTimeout(() => { if (W.mapa === 'cemiterio' && !C.ui && C.mode === 'jogo') C.abrirNotaUI(TXT.foto.titulo, TXT.foto.texto); }, 700);
        }
      });
    });
    if (s.flags.l2harmonio) tampa.rotation.x = -1.1;
    examinar(corpoH, () => s.flags.l2harmonio ? 'Ver a foto dentro do harmônio' : 'Olhar o harmônio velho', () => s.flags.l2harmonio ? C.abrirNotaUI(TXT.foto.titulo, TXT.foto.texto) : falaLia('Um harmônio. A tampa tem uma fechadura estranha, ligada nas teclas. Três notas, talvez.'));
    lore('harmonio', 'capela', hm); segredo('harmonio', hm, '(rádio) A Irmã tocava pra eles dormirem. Os canos lá embaixo cantam a mesma coisa.');
    // sapatinhos de criança perto da mesa da capela
    const sp = new THREE.Group(); sp.position.set(2.4, 0, -63.6); W.grupo.add(sp);
    for (let i = 0; i < 3; i++) for (const d of [-.05, .05]) C.box(.07, .05, .15, i === 1 ? MAT.tecido : MAT.preto, i * .26 + d, .025, rand(-.02, .02), sp, false);
    examinar(sp, 'Olhar os três pares de sapatos', () => falaLia('Três pares de sapato, enfileirados. Eles tiraram pra não fazer barulho na pedra.')); lore('sapatos', 'capela', sp);
    // mãos pequenas por dentro da porta
    const mp = naParede('capela', 's', .64, 1.0, .7, .5, matTex(C.canvasTex(256, 192, (g, w, h) => { g.clearRect(0, 0, w, h); g.fillStyle = 'rgba(20,14,10,.7)'; for (let i = 0; i < 9; i++) { const x = rand(20, 236), y = rand(30, 170); g.beginPath(); g.ellipse(x, y, 10, 13, 0, 0, 6.28); g.fill(); for (let k = 0; k < 5; k++) { g.beginPath(); g.ellipse(x - 10 + k * 5, y - 18, 2.4, 6, 0, 0, 6.28); g.fill(); } } })));
    examinar(mp, 'Olhar as marcas na porta', () => falaLia('Mãos. Pequenas. Por dentro da porta. Fuligem. Eles bateram até o fim.')); lore('maos', 'capela', mp);
  }

  // velas votivas ao lado de esconderijos: sentar e lembrar (segure E)
  const VELAS = { terreo: [0, 1], superior: [2, 3], tuneis: [4], cemiterio: [5] };
  function montarVelas(id) {
    const idx = VELAS[id]; if (!idx) return;
    const s = S(), rota = ROTA[id] || [];
    let cands;
    if (id === 'cemiterio') cands = [{ x: -6.6, z: -54.6, face: [1, 0], fake: true }];
    else cands = W.lockers.filter(L => rota.includes(C.roomAt(L.x, L.z).id) && L.tipo !== 'nicho').sort((a, b) => (a.x * 997 + a.z) - (b.x * 997 + b.z));
    idx.forEach((li, k) => {
      const L = cands[k]; if (!L) return;
      const lado = [L.face[1], -L.face[0]], x = L.x + L.face[0] * .55 + lado[0] * .62, z = L.z + L.face[1] * .55 + lado[1] * .62;
      const r = C.roomAt(x, z); if (!r || (C.roomAt(L.x, L.z) !== r && !L.fake)) return;
      const y = r.agua ? .5 : 0; if (r.agua) C.box(.36, .5, .36, MAT.madeiraEsc, x, .25, z);
      const pires = C.cyl(.07, .08, .03, MAT.branco, x, y + .015, z, 10); C.vela(x, y + .03, z);
      const it = C.interact(pires, () => s.flags['l2vela' + li] ? 'Uma vela votiva. Você já lembrou dele aqui.' : '<b>E</b>Sentar junto da vela e lembrar do Davi', () => {
        if (s.flags['l2vela' + li]) return;
        s.flags['l2vela' + li] = true; it.hold = 0; S().fear = Math.max(0, S().fear - 55);
        if (s.timers) for (const t of ['procissao', 'ana', 'chamado']) if (s.timers[t] < 9000) s.timers[t] = Math.max(2, s.timers[t] - 15);
        C.sub('lia', '(baixinho, sentada no chão) ' + TXT.lembrancas[li], true); C.toast('O medo baixou. Mas o tempo correu lá fora.');
      });
      it.hold = s.flags['l2vela' + li] ? 0 : 3; it.ruido = 0; it.pode = () => !s.flags['l2vela' + li];
      lore('vela' + li, r.id, pires);
    });
  }

  // ------------------------------------------------ toca-fitas de bolso (lado B)
  let fone = false, foneFila = [], foneT = 0;
  function alternarFone() {
    const s = S(); if (!s || C.mode !== 'jogo') return;
    fone = !fone; som.fone(fone); C.SFX.fitaClique();
    if (fone) {
      const k = 'l2ladoB' + s.chapter;
      foneFila = (TXT.ladoB[s.chapter] || []).slice(); foneT = 1.2;
      C.toast(s.flags[k] ? 'Você põe o fone. O lado B de novo. O prédio fica longe demais.' : 'Você põe o fone de espuma. Lado B. O prédio fica longe... e ele também.');
      s.flags[k] = true;
    } else { foneFila = []; C.toast('Você tira o fone. O prédio volta, inteiro.'); }
    if (btnFone) btnFone.textContent = fone ? 'Tirar o fone (T)' : 'Ouvir a fita no fone (T)';
  }
  function updateFone(dt) {
    elF.hidden = !fone;
    if (!fone) return;
    if (M.ativo && M.pos.distanceTo(P.pos) < 10 && perf() - (P.causaRuidoEm || -99) > 6) C.marcarCausa('fone');
    if (foneFila.length) { foneT -= dt; if (foneT <= 0) { const l = foneFila.shift(); C.sub(l.quem, l.texto, true); foneT = 3.5 + l.texto.length * .055; } }
  }

  // ------------------------------------------------ rádio do Seu Joaquim (quente/frio)
  function updateRadio(dt) {
    const s = S(); const tem = s.flags.l2radio;
    const segurando = tem && keys.KeyB && !s.hidden;
    elR.hidden = !(segurando || G.radioSoz > 0);
    // às vezes o rádio liga sozinho quando ele está a uma sala de distância (B desliga)
    G.radioSozCd -= dt;
    if (tem && !segurando && G.radioSoz <= 0 && G.radioSozCd <= 0 && M.ativo && s.dif !== 'facil' && !ocupado()) {
      const d = M.pos.distanceTo(P.pos);
      if (d > 9 && d < 16 && Math.random() < dt * .02) { G.radioSoz = 2.2; G.radioSozCd = 150; C.toast('O rádio ligou sozinho! B para desligar.'); }
    }
    if (G.radioSoz > 0) { G.radioSoz -= dt; G.radioNoise -= dt; if (G.radioNoise <= 0) { G.radioNoise = .5; som.chiado(.3, .4); C.emitNoise(P.pos.x, P.pos.z, 6, true); C.marcarCausa('radio'); } elRt.textContent = 'ligou sozinho'; elRb.parentNode.parentNode.classList.add('quente'); elRb.style.setProperty('--v', '100%'); return; }
    if (!segurando) { G.radioT = 0; return; }
    if (!G.radioMapaFala) { G.radioMapaFala = true; const f = TXT.joaquimMapa[W.mapa]; if (f && !s.flags['l2rm_' + W.mapa]) { s.flags['l2rm_' + W.mapa] = true; C.sub('joaquim', f); } }
    const vivos = G.segredos.filter(x => !achado(x.id));
    let dmin = 99, alvo = null; for (const x of vivos) { const d = Math.hypot(x.x - P.pos.x, x.z - P.pos.z); if (d < dmin) { dmin = d; alvo = x; } }
    const calor = vivos.length ? clamp(1 - dmin / 22, .03, 1) : 0;
    G.radioT -= dt; G.radioNoise -= dt;
    if (G.radioT <= 0) { G.radioT = .32 - calor * .2; som.chiado(.05 + calor * .3, .18 + calor * .2); }
    if (G.radioNoise <= 0) { G.radioNoise = .6; C.emitNoise(P.pos.x, P.pos.z, 8, true); C.marcarCausa('radio'); }
    elRb.style.setProperty('--v', Math.round(calor * 100) + '%'); elRb.parentNode.parentNode.classList.toggle('quente', calor > .7);
    elRt.textContent = !vivos.length ? 'só chiado' : calor > .85 ? 'fervendo' : calor > .6 ? 'quente' : calor > .35 ? 'morno' : 'frio';
    if (alvo && dmin < 2.6 && !s.flags['l2rf_' + alvo.id]) { s.flags['l2rf_' + alvo.id] = true; C.sub('joaquim', alvo.fala); }
  }

  // ------------------------------------------------ código de batidas (aviso real)
  function bater(n, x, z) { for (let i = 0; i < n; i++) setTimeout(() => C.SX.batida(x, z, .85), i * 380); }
  function pontoParede(r) {
    const a = Math.random() * 6.28, x = clamp(P.pos.x + Math.cos(a) * 3, r.x0 + .2, r.x1 - .2), z = clamp(P.pos.z + Math.sin(a) * 3, r.z0 + .2, r.z1 - .2);
    return [x, z];
  }
  function updateBatidas(dt) {
    const s = S(); if (!s.flags.l2batidas || !M.ativo || W.mapa === 'estrada' || s.flags.sino) return;
    G.cd3 -= dt; G.cd2 -= dt; G.batT -= dt; if (G.batT > 0) return; G.batT = .5;
    const rM = C.roomAt(M.pos.x, M.pos.z), rP = P.room; if (!rP || rP.fora) return;
    const dest = M.path.length ? M.path[M.path.length - 1] : null, rD = dest && C.roomAt(dest.x, dest.z);
    const dM = M.pos.distanceTo(P.pos);
    if (G.cd3 <= 0 && rD && rM !== rP && C.distSalas(rD, rP) <= 1 && C.distSalas(rM, rP) >= 2 && dM > 8 && ['patrulha', 'investiga', 'procura'].includes(M.state)) {
      G.cd3 = 40; const [x, z] = pontoParede(rP); bater(3, x, z);
      C.toast(s.flags.l2bat3 ? '[três batidas]' : '[três batidas na parede: ele tá vindo]'); s.flags.l2bat3 = true; return;
    }
    if (G.cd2 <= 0 && rM !== rP && !['caca', 'bote', 'agarra'].includes(M.state) && dM < 13) {
      const l = W.links.find(l => ((l.a === rP.id && l.b === rM.id) || (l.b === rP.id && l.a === rM.id)) && Math.hypot(l.x - P.pos.x, l.z - P.pos.z) < 2.6);
      if (l) { G.cd2 = 30; bater(2, l.x, l.z); C.toast(s.flags.l2bat2 ? '[duas batidas]' : '[duas batidas na porta: não vem por aqui]'); s.flags.l2bat2 = true; }
    }
  }

  // ------------------------------------------------ ouvir pela porta (agachada, mirando uma porta fechada)
  function updateOuvirPorta(dt) {
    const it = C.alvo, d = it && it.porta;
    if (!d || d.open || !P.crouch || S().hidden || Math.hypot(d.x - P.pos.x, d.z - P.pos.z) > 1.7 || P.noiseR > 0) { G.portaT = 0; return; }
    if (G.portaIt !== d) { G.portaIt = d; G.portaT = 0; }
    G.portaT += dt; if (G.portaT < 1.3 || (G.portaCd[d.id] || -99) > perf()) return;
    G.portaCd[d.id] = perf() + 15; G.portaT = 0;
    const l = W.links.find(x => x.door === d); if (!l) return;
    const outro = C.SALA(l.a === P.room.id ? l.b : l.a); if (!outro) return;
    let t = 'Silêncio do outro lado. Só o prédio.';
    if (M.ativo) { const rM = C.roomAt(M.pos.x, M.pos.z); if (rM === outro) t = M.state === 'caca' ? 'Do outro lado: ele, respirando rasgado. Bem perto.' : 'Do outro lado: passos arrastados. Ele está aí.'; else if (C.distSalas(rM, outro) === 1) t = 'Longe, além dessa sala: um estalo de língua.'; }
    if (ANA.ativa && C.roomAt(ANA.pos.x, ANA.pos.z) === outro) t = 'Do outro lado: alguém contando, bem baixinho.';
    C.toast('[orelha na porta] ' + t);
    if (!S().flags.l2orelha) { S().flags.l2orelha = true; setTimeout(() => C.subPequeno('lia', 'As crianças faziam assim. Orelha na porta antes de abrir.'), 1200); }
  }

  // ------------------------------------------------ pegadas de tênis do Davi para quem trava
  const TX_TENIS = C.canvasTex(64, 128, (g, w, h) => { g.clearRect(0, 0, w, h); g.fillStyle = 'rgba(40,52,62,.85)'; g.beginPath(); g.ellipse(32, 44, 15, 30, 0, 0, 6.28); g.fill(); g.beginPath(); g.ellipse(32, 98, 12, 20, 0, 0, 6.28); g.fill(); g.globalCompositeOperation = 'destination-out'; for (let y = 20; y < 118; y += 8) g.fillRect(14, y, 36, 2.5); });
  TX_TENIS.wrapS = TX_TENIS.wrapT = THREE.ClampToEdgeWrapping;
  const MAT_TENIS = new THREE.MeshBasicMaterial({ map: TX_TENIS, transparent: true, depthWrite: false, opacity: .7 });
  MAT_TENIS.userData.compartilhado = true;
  function objetivoAlvo() {
    const s = S(), c = R.capitulos[s.chapter]; if (!c) return null;
    for (const o of c.objetivos) { if (s.done[o.id]) continue; const sid = SALA_OBJ[o.id], r = sid && C.SALA(sid); if (r) return r; return null; }
    return null;
  }
  function pegadasDavi() {
    const r = objetivoAlvo(); if (!r || r === P.room) return false;
    const ent = { pos: P.pos.clone(), path: [] }; if (!C.planejar(ent, (r.x0 + r.x1) / 2, (r.z0 + r.z1) / 2)) return false;
    const pts = [P.pos.clone(), ...ent.path]; let acc = 0, n = 0, lado = 1; const grupo = W.grupo;
    for (let i = 1; i < pts.length && n < 40; i++) {
      const a = pts[i - 1], b = pts[i], dx = b.x - a.x, dz = b.z - a.z, L = Math.hypot(dx, dz); if (L < .01) continue;
      const yaw = Math.atan2(-dx, -dz);
      for (let t = .6 - acc; t < L && n < 40; t += .62) {
        const x = a.x + dx / L * t + (-dz / L) * .1 * lado, z = a.z + dz / L * t + (dx / L) * .1 * lado; lado = -lado;
        const rr = C.roomAt(x, z); const y = rr && rr.agua && !S().flags.aguaBaixa ? .44 : .016;
        const m = new THREE.Mesh(new THREE.PlaneGeometry(.13, .27), MAT_TENIS.clone()); m.rotation.set(-Math.PI / 2, 0, yaw + Math.PI); m.position.set(x, y, z); grupo.add(m);
        G.pegadas.push({ m, t: 15, grupo }); n++;
        if (n % 6 === 0) { const px = x, pz = z; setTimeout(() => { if (W.grupo === grupo) C.SX.passinhos({ x: px, z: pz }); }, n * 120); }
      }
      acc = (acc + L) % .62;
    }
    return n > 0;
  }
  function updatePegadas(dt) {
    const s = S();
    for (let i = G.pegadas.length - 1; i >= 0; i--) { const p = G.pegadas[i]; p.t -= dt; if (p.grupo !== W.grupo || p.t <= 0) { if (p.grupo === W.grupo) W.grupo.remove(p.m); p.m.geometry.dispose(); p.m.material.dispose(); G.pegadas.splice(i, 1); continue; } if (p.t < 4) p.m.material.opacity = .7 * p.t / 4; }
    const n = Object.keys(s.done).length;
    if (n !== G.doneN) { G.doneN = n; G.travadoT = 0; }
    if (s.dif === 'pesadelo' || s.chapter < 1 || s.hidden || PROC.fase || ANA.ativa || (M.ativo && ocupado())) return;
    G.travadoT += dt; G.pegCd -= dt;
    if (G.travadoT > (s.dif === 'facil' ? 110 : 160) && G.pegCd <= 0) {
      G.pegCd = 120;
      if (pegadasDavi() && !s.flags.l2pegadas) { s.flags.l2pegadas = true; setTimeout(() => C.subPequeno('lia', 'Pegadas de tênis. Pequenas. Molhadas. ...Davi?'), 800); }
    }
  }

  // ------------------------------------------------ vitrola, D falso e os demais
  function updateVitrola(dt) {
    const v = G.vitrola; if (!v) return;
    v.t -= dt;
    if (v.pula > 0) { v.pula -= dt; if (v.pula <= 0) { v.pula = -1; v.t = 0; v.h && v.h.parar(); som.risco({ x: 6.2, y: .6, z: -50.75 }); G.chamado = null; if (M.ativo) { M.furia = Math.max(M.furia || 0, 10); M.state = 'investiga'; C.planejar(M, P.pos.x, P.pos.z); C.sub('inspetor', 'NÃO! Quem riscou o meu disco?'); } C.toast('A agulha pulou.'); } }
    // passar de pé (sem agachar) a menos de 2,5 m dele enquanto ele ouve
    if (G.chamado && G.chamado.chegou && !v.passou && !P.crouch && !S().hidden && M.pos.distanceTo(P.pos) < 2.5) { v.passou = true; C.conquista('l2_vitrola'); }
    if (v.t <= 0) { G.vitrola = null; }
  }
  function updateFalso() {
    const s = S(), L = s.hidden; if (!L || L.l2marca !== 'F' || !M.ativo || M.achou || ocupado()) return;
    if (M.pos.distanceTo(P.pos) < 8 && C.roomAt(M.pos.x, M.pos.z) === C.roomAt(L.x + L.face[0], L.z + L.face[1])) { M.achou = true; M.certo = false; M.state = 'investiga'; M.acao = null; C.planejar(M, L.x + L.face[0] * 1.1, L.z + L.face[1] * 1.1); C.subPequeno('inspetor', 'O meu armário. Eu sei quem entra no meu armário.'); C.marcarCausa('falso'); }
  }

  // ------------------------------------------------ fita já ouvida: segurar E avança
  function segurarFita() { if (!keys.KeyE) return false; G.fitaPend = { t0: perf() }; return true; }
  function updateFitaPend() {
    const f = G.fitaPend; if (!f) { G.avancando = false; return; }
    if (keys.KeyE) { if (perf() - f.t0 > .35) { if (!G.avancando) C.toast('Avançando a fita... o chiado é alto.'); G.avancando = true; } }
    else { if (!G.avancando) C.pararFitaOuvida(); G.fitaPend = null; G.avancando = false; }
  }

  // ------------------------------------------------ API para o motor
  return {
    mapa,
    update(dt) {
      if (!G || !S()) return;
      updateChamado(dt); updateFone(dt); updateRadio(dt); updateBatidas(dt); updateOuvirPorta(dt); updatePegadas(dt); updateVitrola(dt); updateFalso(); updateFitaPend();
      if (G.f3 && G.f3.hold && segurandoF3()) { G.enrT = (G.enrT || 0) - dt; if (G.enrT <= 0) { G.enrT = .45; som.enrolar(); } }
    },
    tecla(e) {
      const s = S(); if (!s) return false;
      if (e.code === 'KeyT') { alternarFone(); return true; }
      if (e.code === 'KeyB') { if (G && G.radioSoz > 0) { G.radioSoz = 0; C.SFX.clique(); C.toast('Você desligou o rádio com a mão tremendo.'); return true; } if (!s.flags.l2radio) return false; if (!s.flags.l2radioDica) { s.flags.l2radioDica = true; C.toast('Segure B para ouvir o chiado. Quanto mais forte, mais perto de um segredo.'); } return true; }
      return false;
    },
    protegido, nuncaAbre, aoEsconder,
    volMundo: () => fone ? .3 : 1,
    medoMul: () => (fone ? .75 : 1) * (S() && S().flags.l2terco && !S().flashOn ? .8 : 1),
    ouvidoMul: () => G && G.chamado && G.chamado.chegou ? G.chamado.ouvido : 1,
    segurarFita, get avancando() { return !!(G && G.avancando); },
    tirarFone() { if (fone) alternarFone(); },
    get fone() { return fone; }
  };
  function segurandoF3() { return C.alvo === G.f3 && keys.KeyE; }
}
