// SUSTOS E EVENTOS — Lote 4: segredos e easter eggs
// Ocorrências raras sorteadas pela semente da noite (a décima badalada, o menino de costas, ele olhando por um quadro),
// segredos para quem fuça (livro que te descreve, projetor da excursão, corda da chaminé, furo no banheiro, lâmpada de
// puxar, teatro de sombras, a mulher do banheiro, bonecas que mudam), sustos que lembram de você (giz na sala onde você
// mais morreu, desenho da última morte, página que você não escreveu), ecos nos túneis, datas do calendário (junina,
// Natal, Quaresma, sexta de lua cheia), a hora de verdade (21h em ponto) e segredos do título e do fim.
// Instalado por src/sustos.js (L4 = instalarSustosL4(E, K)); ganchos: update, novoMapa, morte, aoPasso, aoEsconder, aoSair.
import * as THREE from 'three';

const LS_KEY = 'hora-silencio-l4s';
const MEM = {}; // por noite (semente + número da noite): sobrevive a morrer e voltar do checkpoint
const lsGet = () => { try { const v = JSON.parse(localStorage.getItem(LS_KEY)); return v && typeof v === 'object' ? v : {}; } catch (e) { return {}; } };
const lsSet = v => { try { localStorage.setItem(LS_KEY, JSON.stringify(v)); } catch (e) { /* sem armazenamento: tudo bem */ } };
const lsMuda = fn => { const o = lsGet(); fn(o); lsSet(o); return o; };
function hash01(str) { let h = 2166136261; for (const ch of str) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); } h ^= h >>> 13; h = Math.imul(h, 2246822507); h ^= h >>> 16; return (h >>> 0) / 4294967296; }
// Páscoa pelo algoritmo de Gauss (calendário gregoriano)
function pascoa(ano) {
  const a = ano % 19, b = Math.floor(ano / 100), c = ano % 100, d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30, i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7, m = Math.floor((a + 11 * h + 22 * l) / 451);
  const mes = Math.floor((h + l - 7 * m + 114) / 31), dia = ((h + l - 7 * m + 114) % 31) + 1; return new Date(ano, mes - 1, dia);
}
function quaresma(d = new Date()) { const p = pascoa(d.getFullYear()), ini = new Date(p.getTime() - 46 * 864e5), fim = new Date(p.getTime() - 2 * 864e5 + 864e5 - 1); return d >= ini && d <= fim; }
function luaCheia(d = new Date()) { const dias = (d.getTime() - Date.UTC(2000, 0, 6, 18, 14)) / 864e5, f = ((dias % 29.530588) + 29.530588) % 29.530588 / 29.530588; return Math.abs(f - .5) < .034; }

export function instalarSustosL4(E, K) {
  const { R, rand, pick, clamp, camera, scene, W, P, M, ANA, PROC } = E;
  const S = () => E.S;
  const seguro = K.seguro;
  const T = Object.assign({
    dez_lia: 'Foram dez.',
    dez_leg: '[DEZ]',
    dez_ana: '(fora de hora, num canto da sala) ...um... dois... três...',
    olhadas_leg: '[ela põe o dedo nos lábios: shh]',
    batidas_leg: '[três batidas atrás de você... de dentro do armário]',
    batidas_lia: '(sussurro) Só madeira...',
    batidas_4: '[de dentro]',
    resp_pilha: '[respiração bem baixinha, perto da pilha]',
    pilha_pega: '(risada de menina, colada em você) Peguei você primeiro.',
    pilha_quente: 'Quente... e molhada.',
    pilha_minha: '(de dentro da parede) ...é minha.',
    passo_leg: '[um passo que não é seu]',
    eco_leg: '[o túnel devolve os seus passos]',
    eco_vem: '[passos descalços vindo do escuro]',
    eco_antes: '[o eco chegou antes do seu passo]',
    eco_menino: '(uma voz de menino, no fim do túnel) Para de me imitar.',
    conta_menino: '(longe, uma voz de menino) ...um... dois... três...',
    conta_achei: '(atrás da sua orelha) Achei.',
    conta_nicho: 'Uma lanterninha de brinquedo... e uma pilha enrolada num bilhete: "pra quem chegou antes do dez".',
    lamp_label: 'Puxar a cordinha da lâmpada',
    lamp_3: '...A cordinha subiu. Alguém puxou lá de cima.',
    rosto_leg: 'você viu',
    hora_leg: '[nove sinos. É a hora de verdade.]',
    livro_label: 'Abrir o livro de capa lisa',
    livro_porta: 'Ele está na porta agora.',
    giz_lia: '(baixinho) Eu não escrevi isso.',
    giz_txt: 'LIA ESTEVE AQUI',
    desenho_perdeu: 'a moça perdeu',
    desenho_ainda: 'ainda',
    pagina_tit: '(uma página nova, com letra de criança)',
    cedo_nome: 'Sobreviveu à Noite',
    cedo_ainda: 'Ainda Não',
    seta_lia: '(tremendo) Essa não foi o Davi que escreveu.',
    copia_leg: '[uma criança num canto imita você]',
    furo_label: 'Espiar pelo furo na parede',
    furo_1: '(pelo furo) A casa de máquinas, escura. Nada se mexe.',
    furo_2: '(pelo furo) ...Uma sombra passou rente à parede.',
    furo_tampado: 'Alguém tampou o furo com papel. Por dentro.',
    boneco_label: 'Pegar o boneco de pano',
    boneco_pega: 'Você não vem mais comigo.',
    boneco_choro: '(longe, uma menina chorando) ...era meu...',
    bonecas_placa: 'NOVE AMIGAS',
    bonecas_cai: '...Só uma boneca. Com um curativo costurado na barriga.',
    olhos_leg: '[clique: olhos de boneca fechando]',
    corda_label: 'Puxar a corda da chaminé',
    corda_aviso: 'Nem toda corda deve ser puxada.',
    corda_lia: 'Isso... foi o sino da capela? Daqui?',
    corda_2: 'A corda desceu inteira. Na ponta, um sapatinho amarrado. Escrito a caneta: TOMÉ.',
    teto_leg: '[alguém anda lá em cima, no seu ritmo]',
    teto_poeira: '[cai poeira do teto, bem em cima de você]',
    atras_leg: '[seus passos, atrasados, atrás de você]',
    atras_quase: '(colado na sua nuca) ...quase.',
    melodia_lia: '(cantarolando baixinho) Hm... hm-hm... hm...',
    melodia_leg: '[alguém continua a música, na sala ao lado]',
    lobo_leg: '[um uivo longo e rouco, no mato]',
    lobo_lia: 'Isso não era cachorro. Era grande demais.',
    quaresma_lia: '(sussurro) Matracas... É Quaresma. Não se olha pra quem encomenda as almas.',
    junina_lia: 'Bandeirinha queimada... a última festa antes do fogo.',
    natal_lia: 'Um presépio... com três crianças a mais. De uniforme.',
    carrega: ['um...', 'dois...', 'três...', 'quatro...', 'cinco...', 'seis...', 'sete...', 'oito...', 'nove...'],
    dez: 'DEZ.',
    duas: 'agora são duas',
    porta_leg: '[uma porta que não estava ali bate com força]',
    ocup_leg: '[tem alguém aqui com você]',
    ocup_nome: '(sussurro, colado no seu braço) ...o Luiz morreu aqui dentro.',
    sino_olhou: 'Eu olhei. Elas também.',
    mulher_knock: 'Bater na porta do último box',
    mulher_descarga: 'Puxar a descarga',
    mulher_bilhete: 'Um bilhete dobrado no chão: "Proibida essa brincadeira das meninas. Quem chamar a moça do banheiro fica sem jantar. — Ir. Celeste"',
    mulher_resp: '[respiração no seu ouvido]',
    dente_label: 'Levantar o travesseiro',
    dente_achou: 'Um dente de leite... e uma moeda de 1979.',
    dente_pega: 'Pegar a moeda',
    dente_devolve: 'Devolver a moeda',
    dente_nota: 'Fada do dente: alguém trocou o dente por uma moeda. Em 1979.',
    dente_ana: '(baixinho) ...devolve.',
    dente_cobra: '(rindo) Ladra.',
    parede_label: 'Virar a boneca para a parede',
    parede_castigo: '(longe, emburrada) ...de castigo não vale.',
    cama_quente: '(sussurro) Tá quente... alguém acabou de sair daqui.',
    costura_label: 'Rasgar a costura do boneco',
    costura: 'Tinha uma chavinha costurada dentro. A do diário de cadeado da Ana.',
    teatro_label: 'Trocar o recorte do teatro de sombras',
    teatro_um: '...um.',
    proj_label: 'Passar o slide do projetor',
    proj_queima: '[a lâmpada do projetor queima com um estalo]',
    proj_10: '(o último slide não devia existir)',
    raras_tit: 'Coisas que quase ninguém viu',
    raras_nova: 'Anotado no diário: coisas que quase ninguém viu ({n}/{t}).'
  }, R.sustos4 || {});

  const teste = () => !!window.__teste;
  const jogando = () => E.mode === 'jogo' && !!S() && !S().dead && !S().fim && !E.ui;
  const dM = () => (M.ativo ? K.dist2(M.pos, P.pos) : 99);
  const ameaca = () => (M.ativo && (M.state === 'caca' || M.state === 'agarra' || dM() < 12)) || !!PROC.fase || !!ANA.ativa;
  const chaveNoite = () => { const s = S(); return s ? `${s.semente || 'x'}|${(s.flags && s.flags._noite) || 1}` : 'x'; };
  const mem = () => (MEM[chaveNoite()] = MEM[chaveNoite()] || {});
  const sorte = tag => hash01(chaveNoite() + '|' + tag);
  const noite = () => (S() && S().flags && S().flags._noite) || 1;
  const FORCA = new Set(); // depuração: __sustos._L4.forcar('dez')
  const agora = () => K.agora();
  const sala = () => (P.room ? P.room.id : '');
  const leg = t => E.sub('', t);
  const conquista = id => { try { if (E.conquista && !teste()) E.conquista(id); } catch (e) {} };
  const vibrar = p => { try { if (navigator.vibrate && E.OPT.vibrar !== false) navigator.vibrate(p); } catch (e) {} };
  const V = new THREE.Vector3();
  function olhando(p, cos = .9) { const f = K.fwdH(), dx = p.x - P.pos.x, dz = p.z - P.pos.z, l = Math.hypot(dx, dz) || 1; return (f.x * dx + f.z * dz) / l > cos; }
  function viraPara(g, alvo, costas = false) { g.rotation.set(0, Math.atan2(alvo.x - g.position.x, alvo.z - g.position.z) + (costas ? Math.PI : 0), 0); }
  function noChao(g, p) { V.set(p.x, 0, p.z); E.collide(V, .25); g.position.set(V.x, 0, V.z); }
  const olhaTras = () => P.olhar > 1.5;
  const sussurro = (pos, dur = .7, vol = .14) => K.voz(pos, { sopro: true, vogais: [[500, 1900], [700, 1700], [350, 2300]], dur, vol, wet: .1 });
  const vozMenino = (pos, dur = .8) => K.voz(pos, { f0: 300, vogais: [[400, 2100], [650, 1500], [350, 2300]], dur, vol: .1, wet: .5 });
  function lugar(id, tipos = ['prateleira', 'mesa', 'chao'], k = 0) { const sp = W.spots[id]; if (!sp) return null; for (const t of tipos) { const l = sp[t]; if (l && l.length) return l[Math.max(0, l.length - 1 - k)]; } return null; }

  // ---------------- conquistas novas (secretas aparecem como ??? até serem achadas)
  for (const c of [
    { id: 'l4_badalada', nome: 'Badalada a Mais', desc: 'Esteja no internato na noite rara em que o sino bate dez vezes.', segredo: true },
    { id: 'l4_raras', nome: 'Quase Ninguém Viu', desc: 'Presencie três ocorrências raras (somando as noites).', segredo: true },
    { id: 'l4_lugar', nome: 'Lugar Preferido', desc: 'Encontre o giz na sala onde você mais morreu.', segredo: true },
    { id: 'l4_desconfiada', nome: 'Desconfiada', desc: 'Ouça a respiração perto da pilha brilhante e não pegue.', segredo: true },
    { id: 'l4_testemunha', nome: 'Testemunha', desc: 'Veja o rosto na janela do título.', segredo: true },
    { id: 'l4_pontual', nome: 'Pontual', desc: 'Esteja jogando quando o relógio de verdade virar 21h00.', segredo: true },
    { id: 'l4_descargas', nome: 'Três Descargas', desc: 'Chame a moça do banheiro de cima.', segredo: true },
    { id: 'l4_arraia', nome: 'Arraiá do São Lázaro', desc: 'Veja a fogueira de junho acender sozinha.', segredo: true },
    { id: 'l4_natal', nome: 'Presépio', desc: 'Veja as crianças do presépio se virarem para você.', segredo: true },
    { id: 'l4_depois', nome: 'Depois do Depois', desc: 'Fique na tela final por dois minutos sem mexer em nada.', segredo: true },
    { id: 'l4_cedo', nome: 'Cedo Demais', desc: 'Receba uma conquista antes da hora.', segredo: true },
    { id: 'l4_castigo', nome: 'De Castigo', desc: 'Vire as três bonecas do Dormitório D para a parede.', segredo: true },
    { id: 'l4_fada', nome: 'Fada do Dente', desc: 'Devolva a moeda que estava debaixo do travesseiro.', segredo: true },
    { id: 'l4_lobo', nome: 'Sétimo Filho', desc: 'Passe pelo barranco numa sexta-feira de lua cheia.', segredo: true }
  ]) if (R.conquistas && !R.conquistas.some(x => x.id === c.id)) R.conquistas.push(c);

  // ---------------- ocorrências raras (somando as noites)
  const RARAS = [
    { id: 'dez', nome: 'A noite em que o sino bateu dez vezes' },
    { id: 'davi', nome: 'Um menino de costas no fim do corredor de cima' },
    { id: 'olhou', nome: 'Ele, parado no fim do corredor, olhando para você por um instante' },
    { id: 'passo', nome: 'O passo de número 1979' },
    { id: 'vinteum', nome: 'Nove sinos às 21h em ponto, na hora de verdade' },
    { id: 'lobo', nome: 'O vulto de quatro patas no barranco' },
    { id: 'rosto', nome: 'O rosto na janela do internato, no título' }
  ];
  function rara(id) {
    const def = RARAS.find(r => r.id === id); if (!def) return;
    let nova = false; const o = lsMuda(x => { x.raras = x.raras || {}; if (!x.raras[id]) { x.raras[id] = new Date().toLocaleDateString('pt-BR'); nova = true; } });
    if (!nova) return;
    const n = Object.keys(o.raras).length;
    setTimeout(() => { try { if (E.mode === 'jogo') E.toast(T.raras_nova.replace('{n}', n).replace('{t}', RARAS.length)); } catch (e) {} }, 7000);
    if (n >= 3) conquista('l4_raras');
  }

  // ---------------- camada visual própria
  const css = document.createElement('style');
  css.textContent = `
  .l4{position:fixed;pointer-events:none;z-index:40}
  #l4-livro{left:50%;bottom:16%;transform:translateX(-50%);width:min(520px,86vw);padding:22px 26px;background:linear-gradient(#e9dfc6,#d6c8a6);color:#2a2116;font:17px/1.55 Georgia,serif;box-shadow:0 0 40px rgba(0,0,0,.8);opacity:0;transition:opacity .4s;border-radius:2px}
  #l4-livro i{display:block;font-size:12px;opacity:.6;margin-top:8px;text-align:right}
  #l4-furo{inset:0;background:radial-gradient(circle at 50% 50%,rgba(40,44,40,.9) 0,rgba(14,16,14,.95) 7vh,#000 9vh);opacity:0;transition:opacity .2s}
  #l4-furo b{position:absolute;left:50%;top:50%;width:13vh;height:8vh;margin:-4vh 0 0 -6.5vh;border-radius:50%;background:radial-gradient(circle,#050505 0 18%,#6b5f4c 19% 32%,#e6e2d6 34% 62%,#b8b0a0 80%,transparent 82%);opacity:0}
  #l4-carrega{left:0;right:0;bottom:22%;text-align:center;font:italic 26px Georgia,serif;color:#e48fb4;text-shadow:0 0 12px rgba(0,0,0,.9);opacity:0;transition:opacity .5s}
  #l4-conq{left:50%;top:9%;transform:translateX(-50%);padding:12px 22px;background:rgba(20,16,12,.92);border:1px solid #6d5a3a;color:#e8d9b0;font:15px Georgia,serif;opacity:0;transition:opacity .4s;text-align:center}
  #l4-conq small{display:block;opacity:.6;font-size:11px;letter-spacing:.1em;text-transform:uppercase}
  #l4-fim{inset:0;z-index:999;background:#000 center/contain no-repeat;opacity:0}
  #l4-rosto{position:absolute;width:26px;height:34px;border-radius:45% 45% 50% 50%;background:radial-gradient(circle at 36% 42%,#000 0 9%,transparent 11%),radial-gradient(circle at 64% 42%,#000 0 9%,transparent 11%),radial-gradient(ellipse at 50% 74%,#000 0 8%,transparent 10%),#cfc8b8;opacity:.55;filter:blur(.6px);transition:opacity .25s;pointer-events:auto;z-index:3}
  #l4-rosto-leg{position:absolute;left:0;right:0;bottom:8%;text-align:center;font:italic 15px Georgia,serif;color:#a8b08a;opacity:0;transition:opacity .6s;pointer-events:none}
  #l4-raras{margin-top:18px;padding-top:10px;border-top:1px dashed rgba(200,180,140,.3);font:14px/1.6 Georgia,serif;color:#cdbb92}
  #l4-raras b{display:block;letter-spacing:.08em;margin-bottom:4px}
  #l4-pagina{margin:0 0 16px;padding:12px 16px;background:#e6dcc2;color:#3a2a1a;font:italic 17px/1.5 'Comic Sans MS','Segoe Print',cursive;transform:rotate(-1deg)}
  `;
  document.head.appendChild(css);
  const div = (id, html = '') => { const el = document.createElement('div'); el.id = id; el.className = 'l4'; el.innerHTML = html; document.body.appendChild(el); return el; };
  const elLivro = div('l4-livro'), elFuro = div('l4-furo', '<b></b>'), elCarrega = div('l4-carrega'), elConq = div('l4-conq'), elFim = div('l4-fim');

  function tex(w, h, draw) { const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d'); draw(g, w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; }
  const matTex = (t, op = 1) => new THREE.MeshStandardMaterial({ map: t, transparent: true, opacity: op, roughness: 1, emissive: 0x141210, emissiveIntensity: .5, depthWrite: false });
  const matCor = (c, em = 0x0a0806, ei = .5) => new THREE.MeshStandardMaterial({ color: c, roughness: .9, emissive: em, emissiveIntensity: ei });
  function boneca(vestido = 0x8a6a6a, esc = 1, cabelo = 0x2a1a10) {
    const g = new THREE.Group();
    E.cyl(.045 * esc, .07 * esc, .16 * esc, matCor(vestido), 0, .08 * esc, 0, 8, g);
    const c = new THREE.Mesh(new THREE.SphereGeometry(.045 * esc, 10, 8), matCor(0xd8cbb4, 0x1a1612, .6)); c.position.y = .2 * esc; g.add(c);
    const ca = new THREE.Mesh(new THREE.SphereGeometry(.05 * esc, 10, 8, 0, Math.PI * 2, 0, Math.PI * .55), matCor(cabelo)); ca.position.y = .205 * esc; ca.rotation.x = -.25; g.add(ca);
    for (const s of [-1, 1]) { const o = new THREE.Mesh(new THREE.SphereGeometry(.007 * esc, 6, 6), new THREE.MeshBasicMaterial({ color: 0x080808 })); o.position.set(s * .016 * esc, .21 * esc, .042 * esc); g.add(o); }
    return g;
  }
  function criancaG(alt = 1, mat = E.MAT.sombra) {
    const g = new THREE.Group();
    E.cyl(.09 * alt, .2 * alt, .85 * alt, mat, 0, .425 * alt, 0, 8, g);
    const c = new THREE.Mesh(new THREE.SphereGeometry(.115 * alt, 10, 8), mat); c.position.y = 1 * alt; g.add(c);
    return g;
  }

  // =====================================================================  A DÉCIMA BADALADA (rara: 1 em 12 noites, nunca na primeira)
  const noiteDez = () => FORCA.has('dez') || (noite() >= 2 && sorte('dez') < 1 / 12);
  function decimaBadalada(s) {
    const m = mem(); if (m.dez) return; m.dez = true;
    K.depois(2.6, () => {
      const f = K.fwdH(); E.SFX.sino(1.05, { x: P.pos.x - f.z * 2, y: 3, z: P.pos.z + f.x * 2 }, 1.12); P.shake = Math.max(P.shake, .14); K.marcarForte();
      leg(T.dez_leg); vibrar([80, 60, 160]);
      const cores = []; for (const L of W.lampadas) if (L.ligada) { cores.push([L, L.luz.color.getHex()]); L.luz.color.setHex(0xff2a14); }
      K.depois(3, () => { for (const [L, c] of cores) L.luz.color.setHex(c); });
      K.depois(2.2, () => E.sub('lia', T.dez_lia));
      rara('dez'); conquista('l4_badalada');
      K.depois(60, () => anaForaDeHora());
    });
  }
  function anaForaDeHora() { // a Ana aparece contando, fora do capítulo dela, na sala onde você está
    const s = S(); if (!s || s.dead || W.mapa !== 'terreo' || ANA.ativa || ameaca() || !P.room || P.room.fora) return;
    const r = P.room, p = { x: clamp(P.pos.x + rand(-3, 3), r.x0 + .6, r.x1 - .6), z: clamp(P.pos.z + rand(-3, 3), r.z0 + .6, r.z1 - .6) };
    let melhor = null, md = 0; for (const c of [[r.x0 + .6, r.z0 + .6], [r.x1 - .6, r.z0 + .6], [r.x0 + .6, r.z1 - .6], [r.x1 - .6, r.z1 - .6]]) { const d = Math.hypot(c[0] - P.pos.x, c[1] - P.pos.z); if (d > md) { md = d; melhor = c; } }
    if (melhor) { p.x = melhor[0]; p.z = melhor[1]; }
    noChao(K.ANA2, p); viraPara(K.ANA2, { x: p.x + (p.x > (r.x0 + r.x1) / 2 ? 1 : -1), z: p.z }); K.ANA2.visible = true;
    E.sub('ana', T.dez_ana); let n = 0, t = 0;
    K.anima(K.ANA2, dt => {
      t += dt; if (!K.ANA2.visible || S().dead) return true;
      if (t > n * 1.3 && n < 10) { E.SFX.contagem({ x: p.x, z: p.z }, n); n++; }
      if ((S().flashOn && E.visivel({ x: p.x, z: p.z }, 1.1, 14) && t > 1.2) || t > 14) { K.ANA2.visible = false; E.SFX.risada(p.x, p.z); return true; }
    });
  }

  // =====================================================================  RARIDADES DE CORREDOR
  function daviDeCostas() { // rara: 3% por visita ao corredor de cima, sumindo com a luz
    const m = mem(), k = 'davi' + S().chapter; if (m[k]) return; m[k] = true;
    if (!(FORCA.has('davi') || Math.random() < .03)) return;
    const g = K.CRIANCA; g.position.set(0, 0, -56.6); g.rotation.set(0, 0, 0); g.visible = true; let t = 0, olhado = 0;
    K.anima(g, dt => {
      t += dt; if (!g.visible) return true;
      if (E.visivel({ x: 0, z: -56.6 }, 1, 40)) { olhado += dt; if (olhado > .6 && !m.daviRara) { m.daviRara = true; rara('davi'); } }
      if ((S().flashOn && olhado > 1.4) || P.pos.z < -46 || t > 25 || sala() !== 'corr') { g.visible = false; E.SFX.estatica(.15); return true; }
    });
  }
  function eleOlha() { // rara: 2% por capítulo, um quadro só no fim de um corredor
    const m = mem(), k = 'olhou' + S().chapter; if (m[k] || !P.room || P.room.tipo !== 'corredor' || M.ativo || ameaca()) return;
    m[k] = true; if (!(FORCA.has('olhou') || Math.random() < .02)) return;
    const p = K.fundoCorredor ? K.fundoCorredor(P.room, 10) : null; if (!p) return;
    const g = K.SOMBRA; g.position.set(p.x, 0, p.z); viraPara(g, P.pos); g.visible = true; E.SFX.estatica(.12);
    setTimeout(() => { g.visible = false; }, 110); rara('olhou');
  }

  // =====================================================================  NOVE OLHADAS PARA TRÁS (corredor de cima)
  const olhadas = [];
  function noveOlhadas() {
    const m = mem(); if (m.olhadas || W.mapa !== 'superior' || sala() !== 'corr' || ameaca()) return;
    const t = agora(); olhadas.push(t); while (olhadas.length && t - olhadas[0] > 15) olhadas.shift();
    if (olhadas.length < 9) return;
    m.olhadas = true; olhadas.length = 0;
    const f = K.fwdH(), p = { x: clamp(P.pos.x + f.x * 1.1, -2.5, 2.5), z: P.pos.z + f.z * 1.1 }; // de frente: quando você volta a olhar, ela está ali
    K.depois(.35, () => {
      noChao(K.ANA2, p); viraPara(K.ANA2, P.pos); K.ANA2.visible = true; leg(T.olhadas_leg); sussurro({ x: p.x, y: 1.2, z: p.z }, .5, .1);
      const flash0 = S().flashOn; let tt = 0;
      K.anima(K.ANA2, dt => { tt += dt; if (!K.ANA2.visible) return true; if (tt > 2.4 || S().flashOn !== flash0 || olhaTras()) { K.ANA2.visible = false; return true; } });
    });
  }

  // =====================================================================  ARMÁRIOS
  let escondido = null;
  function aoEsconder(L) {
    const s = S(); if (!s || !L) return; escondido = { L, t: 0, batidas: 0, ocup: false };
    const m = mem(), k = `usos${s.chapter}:${Math.round(L.x * 10)},${Math.round(L.z * 10)}`; m[k] = (m[k] || 0) + 1;
    if (L.tipo === 'armario' && m[k] === 6 && !teste()) { // o armário ocupado: quem acampa num esconderijo só divide com alguém
      escondido.ocup = true; leg(T.ocup_leg); vibrar([30, 40, 30, 40, 200]); K.respiracao({ x: L.x, y: 1.3, z: L.z }, 3, false, .55); s.fear = Math.min(100, s.fear + 20);
    }
    if (L.tipo === 'cama' && W.mapa === 'superior' && E.roomAt(L.x, L.z).id === 'dormA' && !m.camaQuente && !teste()) {
      m.camaQuente = true; K.depois(1.2, () => E.sub('lia', T.cama_quente));
      const d = K.portaDaSala ? K.portaDaSala(E.SALA('dormA')) : null;
      for (let i = 0; i < 6; i++) K.depois(1.8 + i * .22, () => K.passoPos({ x: L.x + (i + 1) * ((d ? d.x : -3) - L.x) / 6, y: .1, z: L.z + (i + 1) * ((d ? d.z : L.z) - L.z) / 6 }, .45, true));
      if (d) K.depois(3.3, () => { if (d.open) K.bater(d); else E.SFX.pancada(d.x, d.z); });
    }
    if (m.seta && m.seta.L === L && !m.seta.feito) setaArmadilha(L);
  }
  function aoSair() { escondido = null; }
  function updateEsconderijo(dt) {
    const s = S(); if (!escondido || !s.hidden || s.hidden !== escondido.L) { escondido = null; return; }
    const e = escondido, L = e.L; e.t += dt;
    if (e.ocup && e.t > 5 && !e.nome) { e.nome = true; E.sub('voz', T.ocup_nome); }
    const m = mem(); // três batidas atrás, de dentro do armário (uma vez por noite)
    if (L.tipo === 'armario' && !m.batidas && e.t > 6 && !ameaca() && !teste()) {
      m.batidas = true; e.batidas = 1; const atrasL = { x: L.x - L.face[0] * .28, y: 1.3, z: L.z - L.face[1] * .28 };
      for (let i = 0; i < 3; i++) K.depois(i * .45, () => K.batida(atrasL, .5)); K.depois(.6, () => leg(T.batidas_leg)); e.bt = e.t;
    }
    if (e.batidas === 1 && olhaTras()) { e.batidas = 2; E.sub('lia', T.batidas_lia); }
    if (e.batidas === 2 && !olhaTras() && P.olhar < .3) { e.batidas = 3; K.batida({ x: L.x - L.face[0] * .28, y: 1.2, z: L.z - L.face[1] * .28 }, .8); leg(T.batidas_4); vibrar(90); }
    if (e.batidas === 1 && e.t - e.bt > 8) e.batidas = 3;
  }

  // =====================================================================  A SETA DE GIZ QUE MENTE ("SEGREDO")
  function montarSeta() {
    const m = mem(); if (m.seta || noite() < 2 || !['terreo', 'superior'].includes(W.mapa) || sorte('seta' + W.mapa) > .5) return;
    const arm = W.lockers.filter(L => L.tipo === 'armario' && L !== K.D.armOcup); if (!arm.length) return;
    const L = arm[Math.floor(sorte('setaL' + W.mapa) * arm.length)];
    m.seta = { L, mapa: W.mapa };
    const t = tex(256, 128, (g, w, h) => { g.strokeStyle = 'rgba(235,232,220,.85)'; g.fillStyle = 'rgba(235,232,220,.85)'; g.lineWidth = 6; g.lineCap = 'round'; g.beginPath(); g.moveTo(20, 84); g.lineTo(200, 84); g.lineTo(178, 64); g.moveTo(200, 84); g.lineTo(178, 104); g.stroke(); g.font = 'bold 30px Georgia'; g.save(); g.translate(30, 52); g.rotate(-.04); g.fillText('SEGREDO', 0, 0); g.restore(); });
    const pl = E.plano(.9, .45, matTex(t, .9), L.x + L.face[0] * 1.15, .012, L.z + L.face[1] * 1.15);
    pl.rotation.order = 'YXZ'; pl.rotation.set(-Math.PI / 2, Math.atan2(L.face[1], -L.face[0]), 0);
    pl.userData.leitura = { t: 'SEGREDO (uma seta de giz, de letra tremida)', parede: false };
  }
  function setaArmadilha(L) {
    const m = mem(); m.seta.feito = true;
    K.depois(.05, () => {
      if (S().hidden === L) E.sairEsconderijo();
      const g = K.SOMBRA; g.scale.setScalar(.57); g.position.set(L.x, 0, L.z); g.rotation.set(0, Math.atan2(L.face[0], L.face[1]), 0); g.visible = true;
      K.sustoCom(.25, () => { E.SFX.susto(); S().fear = Math.min(100, S().fear + 30); });
      K.depois(1.1, () => { g.visible = false; g.scale.setScalar(1); E.SFX.pancada(L.x, L.z); });
      K.depois(3, () => E.sub('lia', T.seta_lia));
    });
  }

  // =====================================================================  A PILHA QUE RESPIRA / A PILHA QUE NÃO É PILHA
  function montarPilha() {
    const s = S(), m = mem(); if (s.chapter < 2 || m.pilhaFeita || !['terreo', 'superior'].includes(W.mapa)) return;
    const salas = W.salas.filter(r => !r.fora && r.tipo !== 'corredor' && r !== P.room && W.spots[r.id] && (W.spots[r.id].prateleira.length || W.spots[r.id].mesa.length));
    if (!salas.length) return;
    const r = salas[Math.floor(sorte('pilhaSala' + W.mapa) * salas.length)], sp = lugar(r.id, ['prateleira', 'mesa'], 1); if (!sp) return;
    const respira = sorte('pilhaTipo') < .5;
    const g = new THREE.Group(); g.position.set(sp.x, sp.y, sp.z); W.grupo.add(g);
    E.cyl(.03, .03, .1, new THREE.MeshStandardMaterial({ color: 0xc8b030, emissive: respira ? 0x7a6a10 : 0x1a1606, emissiveIntensity: respira ? 1.4 : .6, metalness: .5, roughness: .4 }), 0, .05, 0, 8, g);
    const st = { g, r, respira, perto: false, t: 0 }; m.pilha = st;
    E.interact(g, () => '<b>E</b>Pegar a pilha' + (respira ? ' novinha' : ''), () => {
      if (!g.visible) return; g.visible = false; m.pilhaFeita = true;
      if (respira) { E.SFX.risada(sp.x, sp.z); E.sub('ana', T.pilha_pega); S().health = Math.max(1, S().health - 10); S().inv.pilhas++; E.renderInvMini(); vibrar(120); P.shake = Math.max(P.shake, .1); }
      else { E.toast(T.pilha_quente); E.SFX.ofego(); K.rolar({ x: sp.x, y: .2, z: sp.z }, 1.2); K.depois(1.4, () => sussurro({ x: sp.x, y: 1.2, z: sp.z }, .5, .12)); K.depois(1.6, () => E.sub('voz', T.pilha_minha)); }
    }, { on: () => g.visible });
  }
  function updatePilha(dt) {
    const m = mem(), st = m.pilha; if (!st || !st.g.parent || !st.g.visible || !st.respira) return;
    const d = Math.hypot(P.pos.x - st.g.position.x, P.pos.z - st.g.position.z);
    if (d < 3) { st.t -= dt; if (st.t <= 0) { st.t = 3.2; K.respiracao({ x: st.g.position.x, y: st.g.position.y, z: st.g.position.z }, 2, false, .25); if (!st.perto) { st.perto = true; leg(T.resp_pilha); } } }
    if (st.perto && d > 12 && !m.desconfiada) { m.desconfiada = true; conquista('l4_desconfiada'); }
  }

  // =====================================================================  O PASSO 1979
  let passosSalvar = 0, passoTotal = null;
  function contarPasso() {
    if (passoTotal === null) passoTotal = lsGet().passos || 0;
    passoTotal++; passosSalvar++;
    if (passosSalvar >= 25) { passosSalvar = 0; lsMuda(o => { o.passos = passoTotal; }); }
    if (passoTotal === 1979 || (FORCA.has('passo') && !mem().passoF)) {
      mem().passoF = true; lsMuda(o => { o.passos = passoTotal; });
      for (let i = 0; i < 3; i++) K.depois(.32 + i * .55, () => { const a = K.atras(.9); K.passoPos({ x: a.x, y: .1, z: a.z }, .55); });
      K.depois(.5, () => leg(T.passo_leg)); rara('passo');
    }
  }

  // =====================================================================  ECOS NOS TÚNEIS
  const eco = { t3: 0, t4: 0, ult: -9, vem: false };
  function ecoPasso() {
    if (W.mapa !== 'tuneis') return;
    const m = mem(), id = sala();
    if (id === 't3' && agora() - eco.ult > .55) { // túnel leste: o eco volta 1,5 s depois, do mesmo lado, e conta como barulho
      eco.ult = agora(); eco.t3++; const x = clamp(P.pos.x + (P.pos.x < 14 ? 7 : -7), 3, 25), z = P.pos.z;
      K.depois(1.5, () => { K.passoPos({ x, y: .1, z }, .35); E.emitNoise(x, z, 2.5); });
      if (eco.t3 === 3) K.depois(1.7, () => leg(T.eco_leg));
      if (eco.t3 >= 14 && !m.ecoVem && !teste()) {
        m.ecoVem = true; const dir = P.pos.x < 14 ? 1 : -1; leg(T.eco_vem); let k = 0;
        const passo = () => { if (k > 10 || sala() !== 't3' || S().dead) return; const px = P.pos.x + dir * (12 - k), alvo = { x: px, z: P.pos.z }; if (S().flashOn && olhando(alvo, .9)) { E.SFX.estatica(.12); return; } K.passoPos({ x: px, y: .1, z: P.pos.z }, .3 + k * .04, true); k++; K.depois(.55, passo); };
        K.depois(2, passo);
      }
    }
    if (id === 't4') { // túnel norte: o eco se adianta
      eco.t4++; const n = eco.t4, f = K.fwdH();
      if (n >= 4 && n <= 8) K.depois(2, () => K.passoPos({ x: P.pos.x + f.x * 8, y: .1, z: P.pos.z + f.z * 8 }, .3));
      if (n >= 9 && n <= 12) { K.depois(.3, () => K.passoPos({ x: P.pos.x + f.x * 3, y: .1, z: P.pos.z + f.z * 3 }, .45)); if (n === 9) K.depois(.6, () => leg(T.eco_antes)); }
      if (n === 13 && !m.ecoMenino) { m.ecoMenino = true; vozMenino({ x: P.pos.x + f.x * 10, y: 1.2, z: P.pos.z + f.z * 10 }, 1); E.sub('davi', T.eco_menino); }
    }
  }

  // =====================================================================  UMA CONTAGEM QUE NÃO É DA ANA (túneis)
  function contagemMenino() {
    const m = mem(); if (m.menino || W.mapa !== 'tuneis' || S().chapter !== 4 || sala() !== 't2' || teste()) return;
    m.menino = true; const N = { x: -33.2, z: -18 }; let i = 0, feito = false;
    E.sub('davi', T.conta_menino);
    const conta = () => {
      if (feito || S().dead || W.mapa !== 'tuneis') return;
      if (Math.hypot(P.pos.x - N.x, P.pos.z - N.z) < 3.5) { feito = true; E.SFX.estatica(.2); S().inv.pilhas++; E.renderInvMini(); E.SFX.pegar(); E.toast(T.conta_nicho); return; }
      if (i >= 10) { feito = true; const f = K.fwdH(), lado = { x: P.pos.x - f.x * .5 + f.z * .6, y: 1.5, z: P.pos.z - f.z * .5 - f.x * .6 }; vozMenino(lado, .5); E.sub('davi', T.conta_achei); vibrar(140); return; }
      E.SFX.contagem(N, i); i++; K.depois(1.6, conta);
    };
    K.depois(1, conta);
  }

  // =====================================================================  TÉRREO: LIVRO, PROJETOR, CORDA, FURO, JUNINA, NATAL
  function montarTerreo() {
    // o livro que descreve você (biblioteca)
    { const g = new THREE.Group(); g.position.set(-21.2, 0, -1.1); W.grupo.add(g);
      E.box(.45, 1, .35, E.MAT.madeiraEsc, 0, .5, 0, g); E.box(.34, .05, .26, matCor(0x3a2e24, 0x100c08, .7), 0, 1.03, 0, g, false);
      E.interact(g, () => '<b>E</b>' + T.livro_label, () => abrirLivro(), { on: () => !mem().livro }); }
    // o projetor de slides da excursão (sala de aula)
    { const g = new THREE.Group(); g.position.set(-9.2, 0, -5); W.grupo.add(g);
      E.box(.5, .8, .5, E.MAT.madeiraEsc, 0, .4, 0, g); E.box(.32, .18, .26, matCor(0x3c3a36, 0x0a0a0a, .4), 0, .89, 0, g, false); E.cyl(.05, .05, .1, E.MAT.metal, -.2, .9, 0, 8, g).rotation.z = Math.PI / 2;
      const tela = E.plano(2.6, 1.7, new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false }), -19.92, 1.75, -5, Math.PI / 2);
      PROJ.tela = tela; PROJ.i = 0;
      E.interact(g, () => '<b>E</b>' + T.proj_label, () => passarSlide(), { on: () => !mem().projQueimou }); }
    // a corda da chaminé (refeitório)
    { const g = new THREE.Group(); g.position.set(-15, 0, -25.72); W.grupo.add(g);
      E.box(1.7, .18, .5, E.MAT.madeiraEsc, 0, 1.3, 0, g); E.box(.18, 1.25, .5, E.MAT.madeiraEsc, -.76, .62, 0, g); E.box(.18, 1.25, .5, E.MAT.madeiraEsc, .76, .62, 0, g);
      E.box(1.34, 1.2, .1, matCor(0x060504, 0, 0), 0, .6, -.2, g, false);
      const corda = E.cyl(.012, .012, 1.3, matCor(0x6a5a40), .1, 1.0, -.05, 6, g);
      CORDA.c = corda; CORDA.n = mem().corda || 0; if (CORDA.n >= 2) corda.visible = false;
      E.interact(corda, () => '<b>E</b>' + T.corda_label, () => puxarCorda(), { on: () => corda.visible }); }
    // o furo na parede do banheiro (lado da casa de máquinas)
    { const m = mem(), f = E.plano(.07, .07, new THREE.MeshBasicMaterial({ color: m.furoTampado ? 0xcfc6ae : 0x020202 }), 23.93, 1.55, -17.4, -Math.PI / 2);
      FURO.m = f; E.interact(f, () => '<b>E</b>' + T.furo_label, () => espiarFuro(), { on: () => !mem().furoTampado }); }
    const d = new Date();
    if (d.getMonth() === 5 || FORCA.has('junina')) montarJunina();
    if (d.getMonth() === 11 || FORCA.has('natal')) montarPiscaPisca();
    if (quaresma(d) || FORCA.has('quaresma')) QUAR.on = true;
  }

  // o livro: escreve em tempo real o que você está fazendo
  const LIVRO = { aberto: false, pag: 0, t: 0, txt: '', alvo: '', pos: null };
  function frasesLivro() {
    const s = S(), insp = M.ativo ? (dM() < 10 ? 'perto, muito perto' : 'longe, mas escutando') : 'dormindo, por enquanto';
    const sR = M.ativo ? E.roomAt(M.pos.x, M.pos.z) : null;
    return [
      `A moça abre o livro. A lanterna dela ${s.flashOn ? 'treme na página' : 'está apagada, e ela lê no escuro'}. ${s.fear > 50 ? 'As mãos dela suam.' : 'Ela acha que está calma.'}`,
      `Ela tem ${s.inv.pilhas} ${s.inv.pilhas === 1 ? 'pilha' : 'pilhas'} no bolso e ${Math.max(1, Math.round(s.health))} de coragem. O homem alto está ${insp}${sR && M.ativo ? ', ' + (sR.nome || '').toLowerCase() : ''}.`,
      T.livro_porta
    ];
  }
  function abrirLivro() {
    const m = mem(); if (m.livro || LIVRO.aberto) return; m.livro = true;
    LIVRO.aberto = true; LIVRO.pag = 0; LIVRO.t = 0; LIVRO.frases = frasesLivro(); LIVRO.alvo = LIVRO.frases[0]; LIVRO.txt = ''; LIVRO.pos = { x: P.pos.x, z: P.pos.z };
    E.SFX.papel && E.SFX.papel(); elLivro.style.opacity = 1;
  }
  function fecharLivro(cedo) {
    LIVRO.aberto = false; if (cedo) setTimeout(() => { elLivro.style.opacity = 0; }, 2000); else setTimeout(() => { elLivro.style.opacity = 0; }, 2600);
  }
  function updateLivro(dt) {
    if (!LIVRO.aberto) return;
    if (!jogando() || Math.hypot(P.pos.x - LIVRO.pos.x, P.pos.z - LIVRO.pos.z) > 2.2) { fecharLivro(true); return; }
    LIVRO.t += dt;
    const n = Math.min(LIVRO.alvo.length, Math.floor(LIVRO.t * 22));
    if (n !== LIVRO.txt.length) { LIVRO.txt = LIVRO.alvo.slice(0, n); elLivro.innerHTML = LIVRO.txt + `<i>página ${LIVRO.pag + 1}</i>`; if (n % 3 === 0) E.SFX.caneta && E.SFX.caneta(); }
    if (n >= LIVRO.alvo.length && LIVRO.t > LIVRO.alvo.length / 22 + 2.4) {
      LIVRO.pag++;
      if (LIVRO.pag === 2) { LIVRO.frases = frasesLivro(); }
      if (LIVRO.pag >= 3) { fecharLivro(false); eleNaPorta(); return; }
      LIVRO.alvo = LIVRO.frases[LIVRO.pag]; LIVRO.txt = ''; LIVRO.t = 0; E.SFX.pagina && E.SFX.pagina();
      if (LIVRO.pag === 2) K.vacuo(3, .1);
    }
  }
  function eleNaPorta() { // e ele está mesmo (um vulto, sem IA)
    if (M.ativo && dM() < 9) return;
    const d = E.DOOR('biblio'); if (d && !d.open) K.abrirDevagar(d, -1.3, 1.2, false);
    const g = K.SOMBRA; g.scale.setScalar(1); g.position.set(-27, 0, -10.9); g.rotation.set(0, 0, 0); g.visible = true; K.marcarForte(); vibrar(80); let t = 0;
    K.anima(g, dt => { t += dt; if (!g.visible) return true; if ((t > .5 && E.visivel({ x: -27, z: -10.9 }, 2.4, 12) && S().flashOn) || t > 3.2) { g.visible = false; E.SFX.estatica(.25); if (d) K.depois(.3, () => K.bater(d)); return true; } });
  }

  // o projetor: nove slides da excursão e um décimo que não devia existir
  const PROJ = { tela: null, i: 0 };
  function slide(n) {
    return tex(512, 336, (g, w, h) => {
      g.fillStyle = '#d9c9a0'; g.fillRect(0, 0, w, h);
      const grd = g.createRadialGradient(w / 2, h / 2, 40, w / 2, h / 2, 320); grd.addColorStop(0, 'rgba(255,240,200,.0)'); grd.addColorStop(1, 'rgba(60,40,20,.55)'); g.fillStyle = grd; g.fillRect(0, 0, w, h);
      g.fillStyle = 'rgba(70,52,36,.85)';
      if (n < 10) {
        if (n % 3 === 1) { g.fillRect(40, 150, 420, 110); g.fillStyle = 'rgba(220,210,180,.7)'; for (let i = 0; i < 6; i++) g.fillRect(60 + i * 64, 168, 44, 36); g.fillStyle = 'rgba(70,52,36,.85)'; g.beginPath(); g.arc(110, 262, 22, 0, 7); g.arc(390, 262, 22, 0, 7); g.fill(); }
        else if (n % 3 === 2) { g.fillRect(300, 40, 60, 240); g.fillStyle = 'rgba(200,215,220,.6)'; g.fillRect(318, 40, 24, 240); g.fillStyle = 'rgba(70,52,36,.85)'; }
        else { g.fillRect(60, 60, 140, 200); g.beginPath(); g.moveTo(50, 64); g.lineTo(130, 10); g.lineTo(210, 64); g.fill(); }
        for (let i = 0; i < 9; i++) { const x = 40 + i * 46, y = 250; g.beginPath(); g.arc(x, y - 44, 11, 0, 7); g.fill(); g.fillRect(x - 10, y - 32, 20, 40); }
        const k = n / 9, fx = 470 - k * 230, fh = 120 + k * 150; g.fillStyle = `rgba(12,8,6,${.55 + k * .4})`; g.fillRect(fx, h - 30 - fh, 22 + k * 18, fh); g.beginPath(); g.arc(fx + 11 + k * 9, h - 40 - fh, 12 + k * 7, 0, 7); g.fill();
        g.fillStyle = 'rgba(40,30,20,.8)'; g.font = 'italic 18px Georgia'; g.fillText(`excursão — 1978 — ${n}/9`, 18, h - 12);
      } else {
        g.fillStyle = '#20180f'; g.fillRect(0, 0, w, h); g.fillStyle = 'rgba(255,230,170,.15)'; g.beginPath(); g.moveTo(256, 150); g.lineTo(80, 336); g.lineTo(430, 336); g.fill();
        g.fillStyle = '#050403'; g.beginPath(); g.arc(256, 112, 30, 0, 7); g.fill(); g.fillRect(214, 140, 84, 170); g.fillRect(196, 150, 22, 110); g.fillRect(294, 150, 22, 110);
        g.fillStyle = 'rgba(230,220,200,.7)'; g.font = 'italic 18px Georgia'; g.fillText('17/03/1994 — de dentro da sala', 18, h - 12);
      }
    });
  }
  function passarSlide() {
    const m = mem(); if (m.projQueimou || !PROJ.tela) return;
    PROJ.i++; E.SFX.clique && E.SFX.clique(); E.SFX.estalo({ x: -9.2, z: -5 }, .3);
    const mt = PROJ.tela.material; if (mt.map) mt.map.dispose(); mt.map = slide(PROJ.i); mt.opacity = .92; mt.needsUpdate = true;
    if (PROJ.i === 10) {
      E.sub('', T.proj_10); K.vacuo(3.2, .08);
      const a = K.atras(1.2), luz = K.luzRosto; if (luz) { luz.position.set(a.x, 1.6, a.z); luz.intensity = 1.6; }
      let t = 0; K.anima(PROJ.tela, dt => { t += dt; if (t > 1 && (olhaTras() || t > 4)) { if (luz) luz.intensity = 0; m.projQueimou = true; mt.opacity = 0; E.SFX.vidro(-9.2, -5); leg(T.proj_queima); return true; } });
    }
  }

  // a corda da chaminé: toca o sino da capela no prédio todo
  const CORDA = { c: null, n: 0 };
  function puxarCorda() {
    const m = mem(); CORDA.n++; m.corda = CORDA.n;
    if (CORDA.n === 1) {
      E.SFX.sino(1.1, { x: -15, y: 6, z: -25 }, .97); E.emitNoise(P.pos.x, P.pos.z, 34); P.shake = Math.max(P.shake, .12);
      const s = S(); if (s.chapter === 2 && !s.done.procissao && !PROC.fase && s.timers.procissao > 12) s.timers.procissao = Math.max(10, s.timers.procissao * .5);
      K.depois(1.2, () => E.sub('lia', T.corda_lia)); K.depois(3, () => E.toast(T.corda_aviso));
    } else {
      const c = CORDA.c; let t = 0, y0 = c.position.y; E.SFX.arrastar();
      K.anima(c, dt => { t += dt; c.position.y = y0 - t * 2.4; if (c.position.y < .1) { c.visible = false; return true; } });
      const sap = E.box(.1, .07, .18, matCor(0x3a1d14), -14.9, .04, -25.5); sap.rotation.y = .6;
      sap.userData.leitura = { t: 'TOMÉ (a caneta, num sapatinho)' };
      K.depois(.9, () => E.toast(T.corda_2));
    }
  }

  // o furo na parede do banheiro
  const FURO = { m: null, n: 0 };
  function espiarFuro() {
    const m = mem(); if (m.furoTampado) return; FURO.n++; m.furoN = FURO.n;
    const olho = FURO.n >= 3 || (M.ativo && dM() < 10);
    elFuro.style.opacity = 1; P.bloqueado = true; const b = elFuro.querySelector('b'); b.style.opacity = 0;
    if (!olho) { E.sub('lia', FURO.n === 1 ? T.furo_1 : T.furo_2); setTimeout(() => { elFuro.style.opacity = 0; P.bloqueado = false; }, 2400); return; }
    setTimeout(() => {
      if (!jogando() && E.ui) { elFuro.style.opacity = 0; P.bloqueado = false; return; }
      K.sustoCom(.2, () => { b.style.opacity = 1; E.SFX.susto(); vibrar(160); S().fear = Math.min(100, S().fear + 25); });
      setTimeout(() => { elFuro.style.opacity = 0; b.style.opacity = 0; P.bloqueado = false; const f = K.fwdH(); V.set(P.pos.x - f.x * .45, 0, P.pos.z - f.z * .45); E.collide(V, .33); P.pos.x = V.x; P.pos.z = V.z; P.shake = .15;
        m.furoTampado = true; if (FURO.m) FURO.m.material.color.setHex(0xcfc6ae); K.depois(2, () => E.toast(T.furo_tampado)); }, 1100);
    }, 1400);
  }

  // junho: bandeirinhas queimadas e a fogueira que acende pelas suas costas
  const FOG = { g: null, chama: null, acesa: false, vista: 0 };
  function montarJunina() {
    const cores = [0x7a2a1a, 0x2a4a6a, 0x6a5a1a, 0x3a5a2a, 0x5a2a4a];
    for (const z of [6, 10]) for (let i = 0; i < 26; i++) {
      const x = -10 + i * .8, y = 3.1 - Math.sin(i / 25 * Math.PI) * .45, b = E.plano(.32, .38, new THREE.MeshStandardMaterial({ color: cores[i % 5], side: THREE.DoubleSide, roughness: 1, emissive: 0x0c0806 }), x, y - .19, z);
      b.scale.y = i % 4 === 0 ? .55 : 1; b.rotation.z = rand(-.2, .2);
    }
    const g = new THREE.Group(); g.position.set(-7, 0, 11.5); W.grupo.add(g);
    for (let i = 0; i < 6; i++) { const l = E.cyl(.07, .09, 1.3, E.MAT.madeiraEsc, 0, .3, 0, 6, g); l.rotation.set(.9, i * 1.05, 0); }
    const chama = new THREE.Mesh(new THREE.ConeGeometry(.45, 1.3, 8), new THREE.MeshBasicMaterial({ color: 0xff8a30, transparent: true, opacity: .85, blending: THREE.AdditiveBlending, depthWrite: false }));
    chama.position.y = .75; chama.visible = false; g.add(chama); FOG.g = g; FOG.chama = chama; FOG.acesa = false;
    E.box(1.2, 1.1, .1, E.MAT.madeira, -2.5, .55, 13.5).userData.leitura = { t: 'PESCARIA — 1 bilhete, 1 prenda. (o papel está chamuscado)' };
  }
  function updateFogueira(dt) {
    if (!FOG.g || !FOG.g.parent || W.mapa !== 'terreo' || sala() !== 'patio') return;
    const p = { x: -7, z: 11.5 }, d = Math.hypot(P.pos.x - p.x, P.pos.z - p.z), frente = olhando(p, .55), costas = !olhando(p, -.35);
    if (!FOG.acesa && costas && d < 14) { FOG.acesa = true; FOG.chama.visible = true; for (let i = 0; i < 5; i++) K.depois(i * .3, () => E.SFX.estalo(p, .5)); if (!mem().junina) { mem().junina = true; K.depois(1.5, () => E.sub('lia', T.junina_lia)); } }
    if (FOG.acesa) { FOG.chama.scale.set(1, .8 + Math.random() * .4, 1); if (frente) { FOG.acesa = false; FOG.chama.visible = false; FOG.vista++; K.vento({ x: p.x, y: 1, z: p.z }, .8); conquista('l4_arraia'); } }
  }

  // dezembro: pisca-pisca no refeitório que vira aviso da Procissão; presépio na capela
  const PISCA = { l: [] };
  function montarPiscaPisca() {
    PISCA.l = []; const cores = [0xff3020, 0x30ff40, 0x3060ff, 0xffd020];
    for (let i = 0; i < 18; i++) { const x = -23 + i, mt = new THREE.MeshBasicMaterial({ color: cores[i % 4] }); const b = new THREE.Mesh(new THREE.SphereGeometry(.04, 6, 6), mt); b.position.set(x, 2.75 - Math.abs(Math.sin(i * .9)) * .12, -14.12); W.grupo.add(b); PISCA.l.push({ b, c: new THREE.Color(cores[i % 4]) }); }
  }
  function updatePisca() {
    if (!PISCA.l.length || !PISCA.l[0].b.parent) return;
    const t = agora(), louco = PROC.fase === 'aviso' || PROC.fase === 'passando';
    PISCA.l.forEach((x, i) => { const on = louco ? Math.random() < .3 : ((Math.floor(t * 1.2) + i) % 2 === 0); x.b.material.color.copy(x.c).multiplyScalar(on ? 1 : .08); });
  }
  const PRES = { g: null, kids: [], visto: false, fase: 0 };
  function montarPresepio() {
    const g = new THREE.Group(); g.position.set(5.2, 0, -66); g.rotation.y = -Math.PI / 2; W.grupo.add(g); PRES.g = g; PRES.kids = []; PRES.fase = 0;
    E.box(.7, .3, .4, E.MAT.madeira, 0, .15, 0, g); E.box(1.4, .05, 1, E.MAT.madeiraEsc, 0, .02, 0, g);
    for (const [x, c] of [[-.5, 0x7a6a50], [.5, 0x5a4a6a]]) { const f = criancaG(.5, matCor(c)); f.position.set(x, 0, .1); g.add(f); }
    for (let i = 0; i < 3; i++) { const k = criancaG(.42, matCor(0x3a4a5a)); k.position.set(-.4 + i * .4, 0, -.5); k.rotation.y = Math.PI; k.scale.y = .7; g.add(k); PRES.kids.push(k); }
  }
  function updatePresepio() {
    if (!PRES.g || !PRES.g.parent || PRES.fase >= 3) return;
    const v = S().flashOn && E.visivel({ x: 5.2, z: -66 }, .5, 9);
    if (v && !PRES.visto) { PRES.visto = true; if (PRES.fase === 0 && !mem().natal) { mem().natal = true; E.sub('lia', T.natal_lia); } }
    else if (!v && PRES.visto) {
      PRES.visto = false; const k = PRES.kids[PRES.fase]; if (!k) return; PRES.fase++;
      for (let i = 0; i < PRES.fase; i++) PRES.kids[i].rotation.y = Math.PI - (Math.PI * .5) * (i + 1) / 2;
      if (PRES.fase === 3) { k.scale.y = 1.15; conquista('l4_natal'); E.SFX.estalo({ x: 5.2, z: -66 }, .4); }
    }
  }
  // Quaresma: matracas no lugar do canto enquanto a Procissão passa
  const QUAR = { on: false, t: 0, falou: false };
  function matraca(pos) { K.som((ac, t) => { for (let i = 0; i < 6; i++) { const g = E.saida(pos, .5), k = t + i * .045; E.burst(k, .025, 'bandpass', 1400 + Math.random() * 500, 4, g); E.env(g, k, .001, .5, .03); } }); }
  function updateQuaresma(dt) {
    if (!QUAR.on || W.mapa !== 'terreo' || !PROC.fase) return;
    QUAR.t -= dt; if (QUAR.t <= 0) { QUAR.t = .7 + Math.random() * .4; matraca(PROC.fase === 'passando' ? { x: PROC.pos.x, y: 1.2, z: PROC.pos.z } : K.atras(9)); }
    if (!QUAR.falou && PROC.fase === 'aviso') { QUAR.falou = true; K.depois(2, () => E.sub('lia', T.quaresma_lia)); }
  }

  // Cap. II: a criança que copia a sua pose
  const COPIA = { on: false };
  function talvezCopia() {
    const s = S(), m = mem(); if (m.copia || W.mapa !== 'terreo' || s.chapter !== 2 || ameaca() || !P.room || P.room.fora || teste()) return;
    const r = P.room; if ((r.x1 - r.x0) < 8 || (r.z1 - r.z0) < 8 || Math.random() > .35) return;
    m.copia = true;
    let melhor = null, md = 0; for (const c of [[r.x0 + .7, r.z0 + .7], [r.x1 - .7, r.z0 + .7], [r.x0 + .7, r.z1 - .7], [r.x1 - .7, r.z1 - .7]]) { const d = Math.hypot(c[0] - P.pos.x, c[1] - P.pos.z); if (d > md) { md = d; melhor = c; } }
    const g = K.CRIANCA; noChao(g, { x: melhor[0], z: melhor[1] }); viraPara(g, P.pos); g.visible = true;
    const hist = [], st = { t: 0, parado: 0, x: P.pos.x, z: P.pos.z, falou: false };
    K.anima(g, dt => {
      st.t += dt; if (!g.visible) return true;
      hist.push({ t: st.t, c: P.crouch, i: P.incl || 0 }); while (hist.length && st.t - hist[0].t > 1.05) hist.shift();
      const h = hist[0]; g.scale.y += ((h.c ? .62 : 1) - g.scale.y) * Math.min(1, dt * 10); g.rotation.z = -h.i * .35; viraPara(g, P.pos); g.rotation.z = -h.i * .35;
      if (!st.falou && st.t > 2 && E.visivel(g.position, .8, 16)) { st.falou = true; leg(T.copia_leg); }
      const mov = Math.hypot(P.pos.x - st.x, P.pos.z - st.z); st.x = P.pos.x; st.z = P.pos.z;
      if (mov < .002) st.parado += dt; else st.parado = 0;
      if (st.parado > 5) { st.parado = 0; const dx = P.pos.x - g.position.x, dz = P.pos.z - g.position.z, l = Math.hypot(dx, dz) || 1; g.position.x += dx / l * .7; g.position.z += dz / l * .7; K.passoPos({ x: g.position.x, y: .1, z: g.position.z }, .4, true); }
      if (Math.hypot(P.pos.x - g.position.x, P.pos.z - g.position.z) < 2.6 || st.t > 40 || P.room !== r || ameaca()) { g.visible = false; g.scale.y = 1; g.rotation.z = 0; E.SFX.estalo(g.position, .4); return true; }
    });
  }

  // Cap. II: passos que imitam os seus no andar de cima
  const TETO = { n: 0, ult: 0, corria: false, ativo: false, fim: false };
  function tetoPasso() {
    const s = S(), m = mem(); if (W.mapa !== 'terreo' || s.chapter !== 2 || !['cw', 'ce'].includes(sala())) return;
    if (!TETO.ativo) { if (m.teto || ameaca() || teste() || Math.random() > .25) return; m.teto = true; TETO.ativo = true; TETO.n = 0; K.depois(.6, () => leg(T.teto_leg)); }
    if (TETO.fim) return;
    if (P.crouch) { TETO.fim = true; return; }
    TETO.n++; TETO.ult = agora(); TETO.corria = !!P.sprinting;
    const x = P.pos.x, z = P.pos.z; K.depois(.35, () => K.passoPos({ x, y: 4.2, z }, TETO.corria ? .5 : .3));
    if (TETO.n > 30) TETO.fim = true;
  }
  function updateTeto() {
    if (!TETO.ativo || TETO.fim) return;
    if (agora() - TETO.ult > 1.2) {
      TETO.fim = true;
      if (TETO.corria) { const x = P.pos.x, z = P.pos.z; K.batida({ x, y: 4.2, z }, .9); K.depois(.3, () => leg(T.teto_poeira)); P.shake = Math.max(P.shake, .06); }
      else K.passoPos({ x: P.pos.x + .6, y: 4.2, z: P.pos.z }, .3);
    }
  }

  // =====================================================================  ANDAR DE CIMA
  const LAMP = { n: 0, cadeiras: null, cord: null };
  const BONECO = { g: null, n: 0, salas: new Set(), fim: false, ultSala: null };
  const OLHOS = { g: null, passo: 0, apagou: false, flash: true };
  const PRAT = { g: null, dolls: [], n: 9, visto: false, fase: 0, luzT: 0, caiu: false };
  const TEATRO = { tela: null, i: 0 };
  const MULHER = { knock: 0, kT: -99, desc: 0, feito: false };
  const DENTE = { fase: 0 };
  const PAREDE = { b: [], viradas: 0, castigoAte: 0, volta: false };
  function montarSuperior() {
    const s = S(), m = mem();
    // a lâmpada de puxar do depósito
    { const g = new THREE.Group(); g.position.set(8, 0, -55); W.grupo.add(g);
      E.cyl(.004, .004, .4, E.MAT.preto || E.MAT.sombra, 0, 3.0, 0, 4, g);
      const bulbo = new THREE.Mesh(new THREE.SphereGeometry(.06, 10, 8), new THREE.MeshStandardMaterial({ color: 0xeee6d0, emissive: 0xfff0c0, emissiveIntensity: 0 })); bulbo.position.y = 2.78; g.add(bulbo);
      const cord = E.cyl(.005, .005, 1.1, matCor(0xbfb49a, 0x18160f, .6), .04, 2.2, 0, 4, g); LAMP.cord = cord; LAMP.bulbo = bulbo; LAMP.n = m.lamp || 0; if (LAMP.n >= 3) cord.visible = false;
      E.interact(cord, () => '<b>E</b>' + T.lamp_label, () => puxarLampada(), { on: () => cord.visible });
      const cad = new THREE.Group(); cad.visible = false; W.grupo.add(cad); LAMP.cadeiras = cad;
      for (let i = 0; i < 24; i++) { const c = new THREE.Group(); E.box(.32, .03, .3, E.MAT.madeira, 0, .32, 0, c, false); E.box(.32, .36, .03, E.MAT.madeira, 0, .5, -.14, c, false); for (const [dx, dz] of [[-.13, -.12], [.13, -.12], [-.13, .12], [.13, .12]]) E.box(.03, .32, .03, E.MAT.madeiraEsc, dx, .16, dz, c, false); c.position.set(4 + (i % 6) * 1.5, 0, -51 - Math.floor(i / 6) * 1.6); cad.add(c); } }
    // o boneco de pano que acompanha (Cap. III)
    if (s.chapter === 3 && !m.bonecoFim) { const g = boneca(0x6a5a48, 1.8, 0x3a2a1a); g.visible = false; W.grupo.add(g); BONECO.g = g; BONECO.n = 0; BONECO.salas = new Set(); BONECO.fim = false;
      E.interact(g, () => '<b>E</b>' + T.boneco_label, () => { g.visible = false; BONECO.fim = true; m.bonecoFim = true; E.SFX.pegar(); E.sub('lia', T.boneco_pega); K.depois(3, () => { vozMenino({ x: 0, y: 1.2, z: -40 }, 1.2); E.sub('ana', T.boneco_choro); }); }, { on: () => g.visible }); }
    // a boneca de olhos que fecham (Dormitório C, Cap. III)
    if (s.chapter === 3) { const g = boneca(0xd8d0c0, 2, 0x5a3a20); W.grupo.add(g); OLHOS.g = g; OLHOS.passo = m.olhosPasso || 0; posOlhos(); }
    // nove bonecas na prateleira da sala de brinquedos
    { const g = new THREE.Group(); g.position.set(10.2, 1.25, -37.78); W.grupo.add(g); PRAT.g = g; PRAT.dolls = []; PRAT.n = 9; PRAT.fase = 0; PRAT.caiu = false;
      E.box(2.4, .04, .26, E.MAT.madeira, 0, 0, 0, g, false);
      const placa = E.plano(.5, .12, matTex(tex(256, 64, (c, w, h) => { c.fillStyle = '#3a2c1e'; c.fillRect(0, 0, w, h); c.fillStyle = '#cdbb92'; c.font = 'bold 30px Georgia'; c.textAlign = 'center'; c.fillText(T.bonecas_placa, w / 2, 42); })), 0, -.1, .14, 0, g);
      placa.userData.leitura = { t: T.bonecas_placa };
      for (let i = 0; i < 9; i++) { const b = boneca([0x7a5a5a, 0x5a6a7a, 0x6a7a5a][i % 3], 1); b.position.set(-1.05 + i * .24, .02, 0); g.add(b); PRAT.dolls.push(b); } }
    // teatro de sombras
    { const g = new THREE.Group(); g.position.set(13.6, 0, -25.4); W.grupo.add(g);
      E.box(.6, .45, .4, matCor(0x7a6448), 0, .23, 0, g); TEATRO.tela = E.plano(1.6, 1.1, new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false, color: 0x000000 }), 14.92, 1.6, -27.6, -Math.PI / 2); TEATRO.i = 0;
      E.interact(g, () => '<b>E</b>' + T.teatro_label, () => trocarRecorte(), { on: () => TEATRO.i < 4 }); }
    // o desenho da sua última morte
    { const ul = lsGet().ultima, t = tex(384, 288, (c, w, h) => desenhoMorte(c, w, h, ul)); const pl = E.plano(.95, .72, matTex(t, .95), 14.93, 1.45, -31.2, -Math.PI / 2); pl.userData.leitura = { t: ul ? T.desenho_perdeu : T.desenho_ainda, parede: false }; }
    // a mulher do banheiro (lenda de colégio)
    { const box = E.box(.8, 1.8, .05, matCor(0x6a7a70, 0x0a0c0a, .5), -11.6, .95, -35.92); E.interact(box, () => '<b>E</b>' + T.mulher_knock, () => mulherBater(), { on: () => !mem().mulher });
      const alca = E.box(.06, .22, .06, E.MAT.metal, -10.6, 1.75, -35.9, W.grupo, false); E.interact(alca, () => '<b>E</b>' + T.mulher_descarga, () => mulherDescarga(), { on: () => !mem().mulher }); MULHER.knock = 0; MULHER.desc = 0; }
    // o dente debaixo do travesseiro (Dormitório D)
    { const cama = W.lockers.find(L => L.tipo === 'cama' && E.roomAt(L.x, L.z).id === 'dormD');
      if (cama) { const ox = cama.ao === 'x' ? -.72 : 0, oz = cama.ao === 'x' ? 0 : -.72, tr = E.box(cama.ao === 'x' ? .32 : .55, .1, cama.ao === 'x' ? .55 : .32, matCor(0xd8d0bc, 0x141210, .5), cama.x + ox, .7, cama.z + oz, W.grupo, false);
        DENTE.fase = m.moeda ? 2 : 0;
        E.interact(tr, () => '<b>E</b>' + (DENTE.fase === 0 ? T.dente_label : DENTE.fase === 1 ? T.dente_pega : T.dente_devolve), () => dente(), { on: () => DENTE.fase < 3 && !m.moedaFim }); } }
    // três bonecas que vigiam a porta (Dormitório D)
    { PAREDE.b = []; PAREDE.viradas = 0; PAREDE.volta = false;
      for (let i = 0; i < 3; i++) { const b = boneca(0x8a7a6a, 2.2); b.position.set(12.4, 0, -21 + i * 1.1); b.rotation.y = -Math.PI / 2; W.grupo.add(b); const st = { b, virada: false }; PAREDE.b.push(st);
        E.interact(b, () => '<b>E</b>' + T.parede_label, () => { st.virada = true; b.rotation.y = Math.PI / 2; E.SFX.arrastar(); PAREDE.viradas = PAREDE.b.filter(x => x.virada).length; if (PAREDE.viradas === 3) castigo(); }, { on: () => !st.virada && !mem().castigo }); } }
    // o boneco com coisa dura dentro (rouparia)
    { const b = boneca(0x9a8a70, 2, 0x5a4a30); b.position.set(12.6, 1.15, -6.5); b.rotation.y = -Math.PI / 2; W.grupo.add(b); E.box(.5, .04, .9, E.MAT.madeira, 12.7, 1.13, -6.5, W.grupo, false);
      E.interact(b, () => '<b>E</b>' + T.costura_label, () => { m.costura = true; E.SFX.papel && E.SFX.papel(); E.toast(T.costura); let t = 0; K.anima(b, dt => { t += dt; if (t > 1 && !E.visivel(b.position, .2, 12)) { b.visible = false; return true; } }); }, { hold: 2, ruido: 2, on: () => b.visible && !m.costura }); if (m.costura) b.visible = false; }
    // a porta que não existia (fim do corredor de cima)
    PORTA.g = null; PORTA.feito = !!m.portaExtra;
  }
  function puxarLampada() {
    const m = mem(); LAMP.n++; m.lamp = LAMP.n; E.SFX.interruptor(true);
    if (LAMP.n <= 2) {
      const luz = K.luzRosto, d0 = luz ? luz.distance : 3.2; if (luz) { luz.position.set(8, 2.7, -55); luz.distance = 12; luz.intensity = 7; }
      LAMP.bulbo.material.emissiveIntensity = 2.4; const cad = LAMP.cadeiras; cad.visible = true;
      cad.children.forEach(c => { if (LAMP.n === 1) viraPara(c, P.pos); else viraPara(c, P.pos, true); });
      if (LAMP.n === 1) K.sustoCom(.15, () => { E.SFX.estalo({ x: 8, z: -55 }, .5); S().fear = Math.min(100, S().fear + 15); });
      setTimeout(() => { cad.visible = false; LAMP.bulbo.material.emissiveIntensity = 0; if (luz) { luz.intensity = 0; luz.distance = d0; } E.SFX.interruptor(false); }, 2000);
    } else { const c = LAMP.cord; let t = 0; K.anima(c, dt => { t += dt; c.position.y += dt * 1.6; if (t > .7) { c.visible = false; return true; } }); K.depois(1, () => E.sub('lia', T.lamp_3)); }
  }
  function posOlhos() {
    const g = OLHOS.g; if (!g) return;
    const pts = [[-11.4, -46.6], [-8.2, -44.5], [-5.2, -42.2], [-1.6, -40.5]], p = pts[Math.min(OLHOS.passo, 3)];
    g.position.set(p[0], 0, p[1]); g.rotation.set(OLHOS.passo ? -Math.PI / 2 : 0, OLHOS.passo ? -.4 : Math.PI / 2, 0); if (OLHOS.passo) g.position.y = .06;
    g.children.filter(o => o.geometry && o.geometry.parameters && o.geometry.parameters.radius < .02).forEach(o => { o.visible = !OLHOS.passo; });
  }
  function updateOlhos() {
    const g = OLHOS.g; if (!g || !g.parent || OLHOS.passo >= 3) return;
    const s = S(), d = Math.hypot(P.pos.x - g.position.x, P.pos.z - g.position.z);
    if (OLHOS.flash && !s.flashOn && d < 6 && !OLHOS.apagou) { OLHOS.apagou = true; K.som((ac, t) => { const gg = E.saida({ x: g.position.x, y: .3, z: g.position.z }, .2); E.burst(t, .015, 'bandpass', 2400, 6, gg, 0); E.env(gg, t, .001, .5, .02); }); leg(T.olhos_leg); }
    if (!OLHOS.flash && s.flashOn && OLHOS.apagou) { OLHOS.apagou = false; OLHOS.passo++; mem().olhosPasso = OLHOS.passo; posOlhos(); if (OLHOS.passo === 3) K.marcarForte(); }
    OLHOS.flash = s.flashOn;
  }
  function updateBoneco() { // aparece em cada sala nova, perto da porta por onde você vai sair
    const g = BONECO.g; if (!g || !g.parent || BONECO.fim) return;
    const id = sala();
    if (id !== BONECO.ultSala) {
      BONECO.ultSala = id;
      if (id === 'brinq' && BONECO.n === 0) { const sp = lugar('brinq', ['chao'], 2) || { x: 9, z: -30 }; g.position.set(sp.x, 0, sp.z); viraPara(g, { x: 3, z: sp.z }); g.visible = true; BONECO.n = 1; BONECO.salas.add(id); }
      else if (BONECO.n > 0 && id !== 'corr' && id !== 'patamar' && !BONECO.salas.has(id) && P.room) {
        const r = P.room, lado = r.x0 >= 3 ? 1 : -1, x = lado > 0 ? r.x0 + .55 : r.x1 - .55, z = clamp(P.pos.z + (P.pos.z > (r.z0 + r.z1) / 2 ? -1.2 : 1.2), r.z0 + .5, r.z1 - .5);
        if (!olhando({ x, z }, .5)) { g.position.set(x, 0, z); viraPara(g, P.pos); g.visible = true; BONECO.n++; BONECO.salas.add(id); }
      }
    }
    if (BONECO.n >= 4 && id === 'corr' && olhaTras() && !BONECO.atras) { // no fim, ele está no chão bem atrás de você
      BONECO.atras = true; const a = K.atras(.9); g.position.set(a.x, 0, a.z); viraPara(g, P.pos); g.visible = true; K.marcarForte(); E.SFX.estalo({ x: a.x, z: a.z }, .3);
      K.depois(4, () => { if (!E.visivel(g.position, .3, 10)) { g.visible = false; BONECO.fim = true; } });
    }
  }
  function updatePrateleira(dt) {
    if (!PRAT.g || !PRAT.g.parent || PRAT.caiu || W.mapa !== 'superior' || sala() !== 'brinq') return;
    const c = { x: 10.2, z: -37.6 }, v = E.visivel(c, 1.3, 10);
    if (v && !PRAT.visto) PRAT.visto = true;
    else if (!v && PRAT.visto) {
      PRAT.visto = false; if (PRAT.fase >= 3) return; PRAT.fase++;
      if (PRAT.fase === 1) { const b = boneca(0x6a6a6a, 1.2); b.position.set(1.15, .02, 0); PRAT.g.add(b); PRAT.dolls.push(b); PRAT.dez = b; }
      if (PRAT.fase === 2) PRAT.dez.scale.setScalar(1.35);
      if (PRAT.fase === 3) { PRAT.g.remove(PRAT.dez); const b = boneca(0xe8e2d4, 1.5, 0x0e0a08); b.position.copy(PRAT.dez.position); PRAT.g.add(b); PRAT.dez = b; }
    }
    if (PRAT.fase === 3 && v && S().flashOn && olhando({ x: 11.35, z: -37.6 }, .97)) {
      PRAT.luzT += dt; if (PRAT.luzT > 3) {
        PRAT.caiu = true; const b = PRAT.dez; let t = 0; E.SFX.estalo({ x: 11.3, z: -37.4 }, .4);
        K.anima(b, dt2 => { t += dt2; b.position.y = Math.max(-1.23, b.position.y - dt2 * 4); b.position.z = Math.min(.5, b.position.z + dt2); b.rotation.x = -Math.min(1.5, t * 3); if (t > .5 && !PRAT.falou) { PRAT.falou = true; E.sub('lia', T.bonecas_cai); } if (t > 1 && !E.visivel({ x: 11.3, z: -37.1 }, .2, 10)) { b.visible = false; return true; } return t > 30; });
      }
    } else PRAT.luzT = 0;
  }
  function recorte(i) {
    return tex(320, 220, (g, w, h) => {
      g.fillStyle = 'rgba(0,0,0,0)'; g.clearRect(0, 0, w, h); g.fillStyle = 'rgba(0,0,0,.9)';
      if (i === 1) { g.beginPath(); g.moveTo(160, 30); g.bezierCurveTo(110, 40, 105, 150, 80, 170); g.lineTo(240, 170); g.bezierCurveTo(215, 150, 210, 40, 160, 30); g.fill(); g.beginPath(); g.arc(160, 182, 16, 0, 7); g.fill(); }
      else if (i === 2) { for (let k = 0; k < 9; k++) { const x = 20 + k * 32; g.beginPath(); g.arc(x, 110, 11, 0, 7); g.fill(); g.fillRect(x - 10, 122, 20, 52); } }
      else if (i === 3) { g.fillRect(90, 90, 140, 110); g.beginPath(); g.moveTo(80, 92); g.lineTo(160, 30); g.lineTo(240, 92); g.fill(); g.fillRect(155, 6, 10, 40); g.fillRect(146, 16, 28, 8); g.strokeStyle = 'rgba(0,0,0,.9)'; g.lineWidth = 5; for (let k = 0; k < 7; k++) { g.beginPath(); g.ellipse(100 + k * 20, 150, 9, 6, 0, 0, 7); g.stroke(); } }
      else { g.beginPath(); g.ellipse(220, 120, 70, 50, -.3, 0, 7); g.fill(); for (let k = 0; k < 4; k++) { g.save(); g.translate(170 - k * 6, 80 + k * 22); g.rotate(-1.3 + k * .12); g.fillRect(0, -7, 110, 14); g.restore(); } }
    });
  }
  function trocarRecorte() {
    TEATRO.i++; const mt = TEATRO.tela.material; if (mt.map) mt.map.dispose(); mt.map = recorte(TEATRO.i); mt.color.setHex(0xffffff); mt.needsUpdate = true; E.SFX.papel && E.SFX.papel();
    if (TEATRO.i === 4) { K.D.piscaAte = agora() + 1; const a = K.atras(.7); K.depois(.8, () => { sussurro({ x: a.x, y: 1.3, z: a.z }, .5, .14); E.sub('ana', T.teatro_um); vibrar(60); }); }
  }
  function updateTeatro() { const t = TEATRO.tela; if (!t || !t.parent || !t.material.map) return; t.material.opacity = S().flashOn ? (TEATRO.i === 4 ? .95 : .8) : .15; }
  function desenhoMorte(g, w, h, ul) {
    g.fillStyle = '#efe8d6'; g.fillRect(0, 0, w, h); g.lineWidth = 5; g.lineCap = 'round'; g.lineJoin = 'round';
    const giz = (c, f) => { g.strokeStyle = c; g.fillStyle = c; g.beginPath(); f(); };
    const pessoa = (x, y, s, c, fill) => giz(c, () => { g.arc(x, y, 12 * s, 0, 7); g.moveTo(x, y + 12 * s); g.lineTo(x, y + 50 * s); g.lineTo(x - 14 * s, y + 80 * s); g.moveTo(x, y + 50 * s); g.lineTo(x + 14 * s, y + 80 * s); g.moveTo(x - 20 * s, y + 28 * s); g.lineTo(x + 20 * s, y + 28 * s); g.stroke(); if (fill) g.fill(); });
    const q = ul && ul.quem;
    if (!ul) { giz('#5a4a30', () => { for (let i = 0; i < 9; i++) { g.moveTo(40 + i * 12, 60); g.lineTo(40 + i * 12, 200); } g.stroke(); }); pessoa(250, 110, 1, '#c87a30'); }
    else if (q === 'inspetor') { pessoa(110, 40, 2, '#1a1a1a'); giz('#2a6a3a', () => { g.strokeRect(220, 70, 70, 150); g.stroke(); }); pessoa(255, 120, .8, '#c87a30'); }
    else if (q === 'ana') { pessoa(120, 100, 1.1, '#c0607a'); giz('#c0607a', () => { for (let i = 0; i < 5; i++) { g.moveTo(140 + i * 6, 120); g.lineTo(146 + i * 8, 96); } g.stroke(); }); pessoa(270, 110, 1, '#c87a30'); }
    else if (q === 'procissao') { for (let i = 0; i < 7; i++) { pessoa(40 + i * 46, 100, .8, '#3a3a5a'); giz('#d02010', () => { g.arc(36 + i * 46, 98, 2.5, 0, 7); g.arc(44 + i * 46, 98, 2.5, 0, 7); g.fill(); }); } }
    else { giz('#1a1a1a', () => { g.ellipse(150, 120, 60, 90, 0, 0, 7); g.fill(); }); pessoa(280, 110, 1, '#c87a30'); }
    g.fillStyle = '#3a2a1a'; g.font = 'bold 26px "Comic Sans MS", cursive'; g.fillText(ul ? T.desenho_perdeu : T.desenho_ainda, 22, h - 22);
  }
  function mulherBater() {
    const t = agora(); if (t - MULHER.kT > 20) MULHER.knock = 0; MULHER.kT = t; MULHER.knock++;
    K.batida({ x: -11.6, y: 1.2, z: -35.8 }, .7); if (MULHER.knock === 3) K.depois(1.2, () => K.batida({ x: -11.6, y: 1.2, z: -36.3 }, .35));
  }
  function mulherDescarga() {
    K.som((ac, t) => { const g = E.saida({ x: -10.6, y: .8, z: -35.8 }, .5), f = E.burst(t, 2.2, 'lowpass', 900, 1, g); f.frequency.linearRampToValueAtTime(300, t + 2.2); E.env(g, t, .1, .4, 2); });
    if (MULHER.knock >= 3) MULHER.desc++;
    if (MULHER.desc >= 3 && !mem().mulher) K.depois(2.4, chamarMulher);
  }
  function chamarMulher() {
    const m = mem(); m.mulher = true; if (!jogando() || sala() !== 'banhS') return;
    const salaR = P.room, lamps = W.lampadas.filter(L => L.ligada && E.roomAt(L.x, L.z) === salaR); for (const L of lamps) L.luz.intensity = 0;
    K.vacuo(4, .05);
    const c = tex(128, 256, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, 'rgba(235,232,225,.9)'); gr.addColorStop(1, 'rgba(200,198,190,.0)'); g.fillStyle = gr; g.beginPath(); g.arc(64, 40, 22, 0, 7); g.moveTo(40, 64); g.lineTo(88, 64); g.lineTo(108, 250); g.lineTo(20, 250); g.fill(); g.fillStyle = '#100808'; g.fillRect(52, 34, 6, 4); g.fillRect(70, 34, 6, 4); g.fillStyle = '#f8f8f4'; g.fillRect(60, 44, 3, 5); g.fillRect(66, 44, 3, 5); });
    const a = K.atras(1.3), pl = E.plano(.7, 1.75, new THREE.MeshBasicMaterial({ map: c, transparent: true, depthWrite: false }), a.x, .88, a.z); pl.lookAt(P.pos.x, .88, P.pos.z);
    let t = 0, ok = false;
    K.anima(pl, dt => {
      t += dt;
      if (!ok && (olhaTras() || olhando(a, .5)) && t > .2) { ok = true; pl.visible = false; E.SFX.estatica(.2); K.depois(1.2, () => { E.toast(T.mulher_bilhete); }); }
      if (!ok && t > 2.2) { ok = true; pl.visible = false; K.apagao(5); K.respiracao(K.atras(.3), 3, false, .7); leg(T.mulher_resp); vibrar([40, 60, 40]); }
      if (ok && t > 6) { for (const L of lamps) if (L.ligada && !L.estourada) L.luz.intensity = L.base; W.grupo.remove(pl); return true; }
    });
    conquista('l4_descargas');
  }
  function dente() {
    const m = mem();
    if (DENTE.fase === 0) { DENTE.fase = 1; E.SFX.papel && E.SFX.papel(); E.toast(T.dente_achou); }
    else if (DENTE.fase === 1) { DENTE.fase = 2; m.moeda = true; E.SFX.pegar(); E.toast(T.dente_nota); }
    else if (DENTE.fase === 2) { DENTE.fase = 3; m.moeda = false; m.moedaFim = true; E.SFX.pegar(); if (ANA.ativa) E.despawnAna(false); else E.SFX.risada(P.pos.x, P.pos.z - 2); conquista('l4_fada'); }
  }
  let anaAntes = false, vidaAntes = 100;
  function updateMoedaAna() {
    const s = S(), m = mem();
    if (ANA.ativa && !anaAntes && m.moeda && !m.moedaPediu) { m.moedaPediu = true; K.depois(1.5, () => E.sub('ana', T.dente_ana)); }
    if (m.moeda && !m.moedaCobrou && ANA.ativa && s.health < vidaAntes - 8) { m.moedaCobrou = true; s.health = Math.max(1, s.health - 5); K.depois(.8, () => E.sub('ana', T.dente_cobra)); }
    anaAntes = ANA.ativa; vidaAntes = s.health;
  }
  function castigo() {
    const s = S(), m = mem(); m.castigo = true; conquista('l4_castigo');
    if (ANA.ativa) E.despawnAna(true); s.timers.ana = Math.max(s.timers.ana || 0, 30); PAREDE.castigoAte = agora() + 30;
    K.depois(1.5, () => { vozMenino({ x: 8, y: 1.2, z: -31 }, .9); E.sub('ana', T.parede_castigo); });
  }
  function updateParede() {
    if (!PAREDE.castigoAte || PAREDE.volta || agora() < PAREDE.castigoAte || !PAREDE.b.length || !PAREDE.b[0].b.parent) return;
    if (PAREDE.b.some(x => E.visivel(x.b.position, .3, 14))) return;
    PAREDE.volta = true; PAREDE.b.forEach(x => viraPara(x.b, P.pos)); const b = PAREDE.b[1].b; b.position.set(0, 0, -18.5); viraPara(b, P.pos);
  }
  const PORTA = { g: null, feito: false };
  function updatePortaExtra() {
    if (W.mapa !== 'superior' || PORTA.feito) return;
    if (!PORTA.g) {
      const ds = W.doors.filter(d => Math.abs(Math.abs(d.x) - 3) < .2 && d.z < -2 && d.z > -58); if (ds.length < 5 || ds.some(d => !d.open)) return;
      const g = new THREE.Group(); g.position.set(0, 0, -57.9); W.grupo.add(g); E.box(.95, 2.1, .06, E.MAT.porta, 0, 1.05, 0, g, false);
      const fresta = E.plano(.9, .04, new THREE.MeshBasicMaterial({ color: 0xffb060 }), 0, .03, .04, 0, g); PORTA.g = g; PORTA.fresta = fresta; return;
    }
    if (Math.hypot(P.pos.x, P.pos.z + 57.9) < 2.4) {
      PORTA.feito = true; mem().portaExtra = true; E.SFX.pancada(0, -57.9); leg(T.porta_leg); P.shake = Math.max(P.shake, .1);
      PORTA.fresta.material.color.setHex(0xffffff); setTimeout(() => { if (PORTA.fresta) PORTA.fresta.material.color.setHex(0x000000); }, 500);
      K.depois(2.5, () => { if (PORTA.g && !E.visivel({ x: 0, z: -57.9 }, 1, 12)) { W.grupo.remove(PORTA.g); } else if (PORTA.g) { const g = PORTA.g; K.anima(g, () => { if (!E.visivel({ x: 0, z: -57.9 }, 1, 12)) { W.grupo.remove(g); return true; } }); } });
    }
  }
  // corredor de cima: passos que imitam os seus, atrasados
  const ATRAS = { on: false, n: 0, olhou: false };
  function atrasPasso() {
    const s = S(), m = mem(), k = 'atras' + s.chapter; if (W.mapa !== 'superior' || sala() !== 'corr') return;
    if (!ATRAS.on) { if (m[k] || ameaca() || teste() || Math.random() > .2) return; m[k] = true; ATRAS.on = true; ATRAS.n = 0; ATRAS.olhou = false; K.depois(.8, () => leg(T.atras_leg)); }
    ATRAS.n++; K.depois(.5, () => { if (ATRAS.on && !ATRAS.olhou) { const a = K.atras(2.4); K.passoPos({ x: a.x, y: .1, z: a.z }, .4); } });
    if (ATRAS.n >= 12) { ATRAS.on = false; if (!ATRAS.olhou) K.depois(.9, () => { sussurro(K.atras(.4), .5, .14); E.sub('voz', T.atras_quase); }); }
  }

  // =====================================================================  CEMITÉRIO: olhar para trás depois do sino
  const FILA = { g: null, ate: 0, feito: false, sinoAntes: false };
  function montarCemiterio() {
    const g = new THREE.Group(); g.visible = false; W.grupo.add(g); FILA.g = g;
    for (let i = 0; i < 9; i++) { const k = criancaG(.95); k.position.set((i % 3 - 1) * .8, 0, Math.floor(i / 3) * 1.1); g.add(k); }
    FILA.feito = !!mem().filaOlhou; FILA.sinoAntes = !!S().flags.sino;
    if (new Date().getMonth() === 11 || FORCA.has('natal')) montarPresepio();
  }
  function updateFila() {
    const s = S(); if (!FILA.g || !FILA.g.parent) return;
    if (s.flags.sino && !FILA.sinoAntes) { FILA.sinoAntes = true; FILA.ate = agora() + 4; }
    if (!FILA.feito && agora() < FILA.ate && olhaTras()) {
      FILA.feito = true; mem().filaOlhou = true; const a = K.atras(4); FILA.g.position.set(a.x, 0, a.z); viraPara(FILA.g, P.pos); FILA.g.visible = true; K.marcarForte();
      setTimeout(() => { FILA.g.visible = false; K.D.piscaAte = agora() + .6; }, 1500); K.depois(2.4, () => E.sub('lia', T.sino_olhou));
    }
  }

  // =====================================================================  ESTRADA: sexta-feira de lua cheia
  function lobo() {
    const m = mem(); if (m.lobo || W.mapa !== 'estrada' || sala() !== 'barranco') return;
    const d = new Date(); if (!FORCA.has('lobo') && !(d.getDay() === 5 && luaCheia(d))) return;
    m.lobo = true;
    K.som((ac, t) => { const g = E.saida({ x: P.pos.x + 14, y: 1.5, z: P.pos.z - 10 }, .6), o = ac.createOscillator(); o.type = 'sawtooth'; o.frequency.setValueAtTime(260, t); o.frequency.linearRampToValueAtTime(420, t + 1.2); o.frequency.linearRampToValueAtTime(300, t + 3.2); const bp = ac.createBiquadFilter(); bp.type = 'bandpass'; bp.Q.value = 6; bp.frequency.setValueAtTime(700, t); bp.frequency.linearRampToValueAtTime(1100, t + 1.4); bp.frequency.linearRampToValueAtTime(600, t + 3.2); o.connect(bp); bp.connect(g); g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(.25, t + .6); g.gain.exponentialRampToValueAtTime(.0001, t + 3.4); o.start(t); o.stop(t + 3.5); });
    leg(T.lobo_leg);
    const g = new THREE.Group(); E.box(1.3, .55, .45, E.MAT.sombra, 0, .85, 0, g, false); E.box(.35, .35, .3, E.MAT.sombra, .78, 1.15, 0, g, false); for (const [x, z] of [[-.5, -.15], [-.5, .15], [.5, -.15], [.5, .15]]) E.box(.1, .62, .1, E.MAT.sombra, x, .31, z, g, false);
    const z = P.pos.z - 9; g.position.set(P.pos.x + 8, 0, z); W.grupo.add(g); let t = 0;
    K.anima(g, dt => { t += dt; g.position.x -= dt * 7; g.position.y = Math.abs(Math.sin(t * 9)) * .12; if (t > 2.6) { W.grupo.remove(g); return true; } });
    K.depois(3.5, () => E.sub('lia', T.lobo_lia)); rara('lobo'); conquista('l4_lobo');
  }

  // =====================================================================  A HORA DE VERDADE: 21h em ponto
  const HORA = { viu2059: false, apagaAte: 0 };
  function updateHora() {
    const d = new Date(), h = d.getHours(), mi = d.getMinutes();
    if (h === 20 && mi === 59) HORA.viu2059 = true;
    const m = mem();
    if ((FORCA.has('vinteum') || (HORA.viu2059 && h === 21 && mi === 0)) && !m.vinteum && jogando() && !ANA.ativa && !PROC.fase && !(M.ativo && M.state === 'caca') && !teste()) {
      m.vinteum = true; FORCA.delete('vinteum'); HORA.apagaAte = agora() + 9; E.SFX.badaladas(9); leg(T.hora_leg);
      const hud = document.getElementById('hud'); if (hud) { hud.style.visibility = 'hidden'; setTimeout(() => { hud.style.visibility = ''; }, 9000); }
      rara('vinteum'); conquista('l4_pontual');
    }
    if (HORA.apagaAte) { if (agora() < HORA.apagaAte) { for (const L of W.lampadas) L.luz.intensity = 0; } else { HORA.apagaAte = 0; try { E.syncLuzes(); } catch (e) {} } }
  }

  // =====================================================================  A MELODIA QUE ALGUÉM CONTINUA
  const MEL = { t: 0, x: 0, z: 0 };
  function updateMelodia(dt) {
    const s = S(), m = mem(), k = 'mel' + s.chapter; if (m[k] || !P.room || P.room.fora || ameaca() || s.hidden || teste()) { MEL.t = 0; return; }
    if (Math.hypot(P.pos.x - MEL.x, P.pos.z - MEL.z) > .05) { MEL.x = P.pos.x; MEL.z = P.pos.z; MEL.t = 0; return; }
    MEL.t += dt; if (MEL.t < 90) return;
    m[k] = true; MEL.t = 0;
    const notas = [392, 440, 392, 330, 349, 392, 440, 523, 494, 440];
    K.notas({ x: P.pos.x, y: 1.5, z: P.pos.z }, notas.slice(0, 4), .55, .04); E.sub('lia', T.melodia_lia);
    const f = K.fwdH(), viz = { x: P.pos.x + f.z * 9, y: 1.4, z: P.pos.z - f.x * 9 };
    K.depois(3.4, () => { K.notas(viz, notas.slice(4), .55, .05); leg(T.melodia_leg); });
  }

  // =====================================================================  GIZ NA SALA ONDE VOCÊ MAIS MORREU
  const GIZ = { pl: null, visto: false };
  function montarGiz() {
    const ms = lsGet().mortesSala || {}; let melhor = null, n = 0;
    for (const [k, v] of Object.entries(ms)) { const [mp, id] = k.split(':'); if (mp === W.mapa && v > n && E.SALA(id) && !E.SALA(id).fora) { n = v; melhor = id; } }
    if (!melhor || n < 2) return;
    const r = E.SALA(melhor), t = tex(512, 256, (g, w, h) => {
      g.fillStyle = 'rgba(240,238,228,.85)'; g.strokeStyle = 'rgba(240,238,228,.85)'; g.font = 'bold 54px "Comic Sans MS", cursive'; g.save(); g.translate(30, 80); g.rotate(-.04); g.fillText(T.giz_txt, 0, 0); g.restore();
      g.lineWidth = 5; const tot = Math.min(n, 40);
      for (let i = 0; i < tot; i++) { const grupo = Math.floor(i / 5), j = i % 5, x = 40 + grupo * 58 + j * 10, y = 130; g.beginPath(); if (j === 4) { g.moveTo(x - 46, y + 50); g.lineTo(x + 4, y + 8); } else { g.moveTo(x, y); g.lineTo(x + rand(-2, 2), y + 58); } g.stroke(); }
    });
    const pl = E.plano(1.6, .8, matTex(t, .9), r.x0 + .03, 1.55, (r.z0 + r.z1) / 2, Math.PI / 2);
    pl.userData.leitura = { t: `${T.giz_txt} (e ${n} tracinhos)`, parede: false }; GIZ.pl = pl; GIZ.visto = false;
  }
  function updateGiz() {
    const pl = GIZ.pl; if (!pl || !pl.parent || GIZ.visto) return;
    if (S().flashOn && E.visivel(pl.position, pl.position.y, 7)) { GIZ.visto = true; const l = lsGet(); if (!l.gizFalou) { lsMuda(o => { o.gizFalou = true; }); K.depois(.8, () => E.sub('lia', T.giz_lia)); } conquista('l4_lugar'); }
  }

  // =====================================================================  CONQUISTA QUE CHEGA CEDO DEMAIS (Cap. III, uma vez por perfil)
  function conqCedo() {
    const s = S(); if (s.chapter !== 3 || W.mapa !== 'superior' || E.OPT.avisoSusto || teste() || lsGet().cedo || ameaca() || s.capT < 150) return;
    lsMuda(o => { o.cedo = true; });
    elConq.innerHTML = `<small>Conquista</small>${T.cedo_nome}`; elConq.style.opacity = 1; E.SFX.conquista && E.SFX.conquista();
    setTimeout(() => { elConq.innerHTML = `<small>Conquista</small>${T.cedo_ainda}`; const a = K.atras(2); E.SFX.contagem({ x: a.x, z: a.z }, 2); E.sub('ana', '...três...'); }, 2600);
    setTimeout(() => { elConq.style.opacity = 0; }, 4600); setTimeout(() => conquista('l4_cedo'), 7000);
  }

  // =====================================================================  CONTAGEM NA TROCA DE MAPA
  function contagemCarregar() {
    if (noite() < 2 || teste() || sorte('carrega' + W.mapa) > .2) return;
    let i = 0; elCarrega.style.opacity = 1;
    const prox = () => { if (i >= T.carrega.length) { setTimeout(() => { elCarrega.style.opacity = 0; }, 600); return; } elCarrega.textContent = T.carrega.slice(0, i + 1).join(' '); i++; setTimeout(prox, 260); };
    prox(); mem()['dez' + W.mapa] = agora() + rand(6, 18);
  }
  function updateDezCarregar() {
    const m = mem(), k = 'dez' + W.mapa; if (!m[k] || agora() < m[k]) return; m[k] = 0;
    if (ANA.ativa || PROC.fase || !jogando()) return;
    const a = K.atras(.45); sussurro({ x: a.x, y: 1.5, z: a.z }, .6, .16); E.sub('ana', T.dez); vibrar(80);
  }

  // =====================================================================  TÍTULO, FIM E DIÁRIO (fora do loop do jogo)
  let ultInput = performance.now();
  addEventListener('pointermove', () => { ultInput = performance.now(); }, { passive: true });
  addEventListener('keydown', () => { ultInput = performance.now(); }, true);
  const sess = { rosto: false, fimT: 0, fimFeito: false, duas: false, duasPosto: false };
  function rostoTitulo() {
    const t = document.getElementById('title'); if (!t || sess.rosto) return; sess.rosto = true;
    if (!(Math.random() < .02 || FORCA.has('rosto') || /[?&]rosto\b/.test(location.search))) return;
    if (getComputedStyle(t).position === 'static') t.style.position = 'relative';
    const r = document.createElement('div'); r.id = 'l4-rosto'; r.style.left = (58 + Math.random() * 26) + '%'; r.style.top = (14 + Math.random() * 12) + '%'; t.appendChild(r);
    const lg = document.createElement('div'); lg.id = 'l4-rosto-leg'; lg.textContent = T.rosto_leg; t.appendChild(lg);
    r.addEventListener('pointerenter', () => { r.style.opacity = 0; setTimeout(() => r.remove(), 300); try { E.SFX.estatica(.6); } catch (e) {} lg.style.opacity = 1; setTimeout(() => { lg.style.opacity = 0; }, 2600); rara('rosto'); conquista('l4_testemunha'); }, { once: true });
  }
  function desenharFim() {
    const c = document.createElement('canvas'); c.width = 640; c.height = 400; const g = c.getContext('2d');
    g.fillStyle = '#050403'; g.fillRect(0, 0, 640, 400); g.strokeStyle = 'rgba(120,110,90,.35)'; g.lineWidth = 3; g.strokeRect(220, 40, 200, 320);
    for (let i = 0; i < 6; i++) { g.fillStyle = 'rgba(60,52,40,.5)'; g.fillRect(240, 70 + i * 40, 50, 14); g.fillRect(350, 70 + i * 40, 50, 14); }
    g.fillStyle = 'rgba(200,180,140,.8)'; g.beginPath(); g.arc(310, 230, 12, 0, 7); g.fill(); g.fillStyle = 'rgba(160,150,140,.75)'; g.beginPath(); g.arc(334, 238, 8, 0, 7); g.fill();
    g.strokeStyle = 'rgba(200,180,140,.6)'; g.lineWidth = 2; g.beginPath(); g.moveTo(318, 236); g.lineTo(328, 239); g.stroke();
    return c.toDataURL();
  }
  function tickDom() {
    try {
      const ti = document.getElementById('title'); if (ti && !ti.hidden) { rostoTitulo(); if (sess.duas && !sess.duasPosto) { const st = document.getElementById('t-sub'); if (st) { st.textContent = T.duas; sess.duasPosto = true; } } }
      const en = document.getElementById('ending'), vis = en && !en.hidden && getComputedStyle(en).display !== 'none';
      if (vis && !sess.fimFeito) {
        if (!sess.fimT) sess.fimT = performance.now();
        const parado = performance.now() - Math.max(sess.fimT, ultInput);
        if (parado > 120000 || (FORCA.has('depois') && parado > 1500)) { sess.fimFeito = true; elFim.style.backgroundImage = `url(${desenharFim()})`; elFim.style.opacity = 1; setTimeout(() => { elFim.style.opacity = 0; }, 90); sess.duas = true; conquista('l4_depois'); }
      } else if (!vis) sess.fimT = 0;
      if (E.ui === 'diario') diario();
    } catch (e) { /* nada no DOM quebra o jogo */ }
  }
  setInterval(tickDom, 400);
  function diario() {
    const pane = document.getElementById('d-pane'); if (!pane) return;
    const raras = lsGet().raras || {}, n = Object.keys(raras).length;
    if (n && !document.getElementById('l4-raras')) {
      const d = document.createElement('div'); d.id = 'l4-raras';
      d.innerHTML = `<b>${T.raras_tit} (${n}/${RARAS.length})</b>` + RARAS.map(r => raras[r.id] ? `· ${r.nome} <small style="opacity:.55">— ${raras[r.id]}</small>` : '· ???').join('<br>');
      pane.appendChild(d);
    }
    const m = mem(), s = S(), ul = lsGet().ultima;
    if (s && s.chapter >= 4 && ul && ul.noite === chaveNoite() && !m.paginaVista && !document.getElementById('l4-pagina')) {
      m.paginaVista = true; const p = document.createElement('div'); p.id = 'l4-pagina';
      const onde = ul.salaNome ? '(' + ul.salaNome.toLowerCase() + ')' : '(no escuro)', q = ul.quem;
      const frase = q === 'inspetor' ? `a moça correu ${onde}. ele estava esperando. ele sempre espera.` : q === 'ana' ? `a moça virou de costas na hora errada ${onde}. a ana contou até dez.` : q === 'procissao' ? `a moça ficou no caminho da fila ${onde}. ninguém fica no caminho.` : `a moça caiu ${onde} e ninguém viu. eu vi.`;
      p.innerHTML = `<small style="font-style:normal;opacity:.6">${T.pagina_tit}</small><br>${frase}`; pane.prepend(p);
    }
  }

  // =====================================================================  GANCHOS
  let olhavaTras = false, salaAnt = null;
  const update = seguro((dt, s) => {
    if (!jogando()) { if (LIVRO.aberto && E.ui) fecharLivro(true); return; }
    const tras = olhaTras();
    if (tras && !olhavaTras) noveOlhadas();
    olhavaTras = tras;
    if (P.room !== salaAnt) {
      salaAnt = P.room;
      if (W.mapa === 'superior' && sala() === 'corr') daviDeCostas();
      if (W.mapa === 'terreo' && s.chapter === 2) talvezCopia();
      eleOlha(); contagemMenino(); lobo();
    }
    if (W.mapa === 'terreo' && s.chapter === 2) { const lh = !!s.flags.lampHallMorta; if (lh && !LH.antes && noiteDez()) decimaBadalada(s); LH.antes = lh; }
    updateEsconderijo(dt); updatePilha(dt); updateLivro(dt); updateFogueira(dt); updatePisca(); updateQuaresma(dt); updateTeto();
    updateOlhos(); updateBoneco(); updatePrateleira(dt); updateTeatro(); updateMoedaAna(); updateParede(); updatePortaExtra(); updatePresepio(); updateFila();
    updateHora(); updateMelodia(dt); updateGiz(); conqCedo(); updateDezCarregar();
  });
  const LH = { antes: false };
  const novoMapa = seguro(id => {
    const s = S(); if (!s) return;
    LH.antes = !!s.flags.lampHallMorta; salaAnt = null; escondido = null; LIVRO.aberto = false; elLivro.style.opacity = 0; elFuro.style.opacity = 0;
    eco.t3 = 0; eco.t4 = 0; TETO.ativo = false; TETO.fim = false; ATRAS.on = false; FOG.g = null; PISCA.l = []; PRES.g = null; FILA.g = null; GIZ.pl = null;
    OLHOS.g = null; BONECO.g = null; BONECO.ultSala = null; BONECO.atras = false; FURO.n = mem().furoN || 0; PRAT.g = null; TEATRO.tela = null; PROJ.tela = null; PORTA.g = null; PAREDE.b = []; PAREDE.castigoAte = 0; MEL.t = 0; QUAR.on = false; QUAR.falou = false;
    if (id === 'terreo') montarTerreo();
    if (id === 'superior') montarSuperior();
    if (id === 'cemiterio') montarCemiterio();
    montarGiz(); montarSeta(); montarPilha();
    if (D_MAPA.ultimo && D_MAPA.ultimo !== id) contagemCarregar();
    D_MAPA.ultimo = id;
  });
  const D_MAPA = { ultimo: null };
  const morte = seguro(quem => {
    const s = S(); if (!s || !P.room) return; const r = P.room;
    lsMuda(o => { o.mortesSala = o.mortesSala || {}; const k = `${W.mapa}:${r.id}`; o.mortesSala[k] = (o.mortesSala[k] || 0) + 1; o.ultima = { quem, mapa: W.mapa, sala: r.id, salaNome: r.nome || '', noite: chaveNoite() }; });
  });
  const aoPasso = seguro(() => { contarPasso(); ecoPasso(); tetoPasso(); atrasPasso(); if (ATRAS.on && olhaTras()) ATRAS.olhou = true; });
  return {
    update, novoMapa, morte, aoPasso, aoEsconder: seguro(aoEsconder), aoSair: seguro(aoSair),
    forcar: id => { FORCA.add(id); return [...FORCA]; },
    _t: { RARAS, rara, quaresma, luaCheia, pascoa, mem, decimaBadalada: () => decimaBadalada(S()), anaForaDeHora, abrirLivro, passarSlide, puxarCorda, espiarFuro, puxarLampada, trocarRecorte, chamarMulher, castigo, desenharFim }
  };
}
