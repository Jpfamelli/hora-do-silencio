// SUSTOS E EVENTOS — Lote 4 (parte 2): mais segredos, eventos raros e easter eggs
// Complementa src/sustos-segredos.js com eventos novos que não repetem os já existentes:
// espelho com reflexo atrasado, TV de tubo que te filma, gravador da sua morte, foto da turma que muda,
// o lençol que senta na cama do Davi, pegadas molhadas, armário trancado por fora, a porta que conta seus
// passos, telefone de lata, sapatos que sobram, a garrafa no sino da torre, a batida que responde, o armário
// "tá cheio", a décima figura da Procissão, as silhuetas nas janelas, a luneta do sótão, a sombra que não
// acompanha, a Ana que conta até onze, o olho na fechadura, a chamada que pula o seu nome, a costureira,
// a boneca que respira, a fila do banheiro, o furo na parede, e sustos de ambiente (berço, cavalinho,
// quadro-negro, brinquedos, o nome sussurrado, a segunda respiração).
// Instalado por src/sustos.js (L4b = instalarSustosL4b(E, K)); ganchos: update, novoMapa, morte, aoPasso, aoEsconder, aoSair.
import * as THREE from 'three';

const LS_KEY = 'hora-silencio-l4s2';
const MEM = {}; // por noite (semente + número da noite)
const lsGet = () => { try { const v = JSON.parse(localStorage.getItem(LS_KEY)); return v && typeof v === 'object' ? v : {}; } catch (e) { return {}; } };
const lsSet = v => { try { localStorage.setItem(LS_KEY, JSON.stringify(v)); } catch (e) { /* sem armazenamento */ } };
const lsMuda = fn => { const o = lsGet(); fn(o); lsSet(o); return o; };
function hash01(str) { let h = 2166136261; for (const ch of str) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); } h ^= h >>> 13; h = Math.imul(h, 2246822507); h ^= h >>> 16; return (h >>> 0) / 4294967296; }

export function instalarSustosL4b(E, K) {
  const { R, rand, clamp, camera, scene, W, P, M, ANA, PROC } = E;
  const S = () => E.S;
  const T = Object.assign({
    esp_leg: '[o vidro range]',
    esp_lia: '(baixinho, soltando o ar) ...não era eu.',
    tv_leg: '[a imagem da TV firmou]',
    tv_desliga: '[a TV desliga com um estalo de tubo]',
    grav_label: 'Tocar a fita sem etiqueta',
    grav_vazio: '(a fita roda vazia) ...ainda não.',
    grav_lia: '(a sua própria respiração, gravada)',
    foto_1979: 'TURMA DE 1979',
    foto_1994: 'TURMA DE 1979 E 1994',
    foto_vira: '[uma das crianças da foto virou a cabeça]',
    lencol_leg: '[tem um volume sob o lençol da cama do Davi]',
    lencol_fala: '(colado nas suas costas) Você demorou.',
    camaF_lia: '(a mão na marca do colchão) ...ainda tá quente.',
    pegadas_leg: '[pegadas molhadas pequenas, indo até um armário]',
    pegadas_arm: 'Dentro do armário, um uniforme encharcado pendurado. E uma pilha, enrolada num pano.',
    tranca_leg: '[alguém trancou a porta por fora]',
    tranca_albano: '(do outro lado, rouco) Agora você sabe.',
    conta_label: 'Passar pela porta dos riscos',
    conta_voz: '(com a voz de uma menina) ...Lia.',
    conta_dentro: 'Na parede de dentro, riscos de outra pessoa que passou muitas vezes: "J.S. 1986".',
    lata_label: 'Encostar o ouvido no copo de lata',
    lata_resp: '[uma respiração pequena, do outro lado do barbante]',
    lata_arm: 'O outro copo está aqui, pendurado, ainda balançando. Sem ninguém.',
    sapatos_lia: '...trinta e sete.',
    sapatos_38: '[agora são trinta e oito pares. O novo é pequeno, e molhado.]',
    garrafa_torre: '[uma badalada seca, lá na torre]',
    garrafa_fila: '[a fila parou e virou o rosto para a torre]',
    batida_resp: '[alguém responde do armário vizinho, no mesmo ritmo]',
    batida_davi: '[a batida virou o código do Davi: dois, pausa, três]',
    batida_vazio: '[a porta do armário vizinho range e fica aberta. Vazia.]',
    cheio_leg: '(uma mão fecha a porta por dentro) ...tá cheio.',
    cheio_bilhete: 'Um bilhete rabiscado dentro do armário: "tá ocupado". E cheiro de fumaça.',
    proc_dez: '[dá para contar uma a mais. A última carrega uma lanterna igual à sua.]',
    proc_lia: '(na segunda noite) Eram dez. Eu contei.',
    janela_leg: '[três silhuetas nas janelas de cima. Uma é pequena demais, no telhado.]',
    luneta_label: 'Olhar pela luneta',
    luneta_1: '(pela luneta) O carro da Lia, lá embaixo. Alguém no banco do motorista, acenando devagar.',
    luneta_2: '(pela luneta) O banco está vazio agora.',
    luneta_3: '[um rosto, colado do outro lado da lente]',
    sombra_leg: '[a sua sombra continuou andando, e parou]',
    sombra_achou: 'Onde a sombra parou: uma marca de giz. E uma pilha.',
    onze_ana: '(contando) ...nove... dez... onze...',
    onze_fala: '(o rosto a um palmo do seu) Errei de propósito.',
    fech_label: 'Espiar pela fechadura',
    fech_nada: '(pela fechadura) A sala do outro lado, escura. Nada se mexe.',
    fech_olho: '[um olho leitoso, a dois centímetros, olhando de volta]',
    fech_lia: '(pela fechadura) ...Sou eu. Agachada do outro lado, de costas. Espiando outra fechadura.',
    chamada_nome: '(voz de professora) ...Moraes, Lia.',
    chamada_presente: '(a sua própria voz) Presente.',
    chamada_lia: 'Eu... eu não falei nada.',
    chamada_corre: '[uma segunda Lia, correndo no fim do corredor]',
    costureira_cai: '[o manequim tombou, com um estalo de madeira]',
    respira_boneca: '[a boneca respira]',
    respira_mao: '(uma mão cinza fecha a porta) ...ocupado.',
    fila_knock: 'Bater na porta da cabine',
    fila_ocupado: '(de dentro) ...tá ocupado.',
    fila_pralia: 'A última cabine abre sozinha. No azulejo: "PRA LIA". E um curativo no chão.',
    furo_label: 'Espiar pelo furo na parede',
    furo_nada: '(pelo furo) O corredor do outro lado. Vazio.',
    furo_olho: '[um olho branco, colado no furo]',
    furo_tampado: 'O furo está tampado com papel, por dentro.',
    berco_leg: '[o berço balança sozinho]',
    cavalo_leg: '[o cavalinho de balanço range atrás de você]',
    quadro_lia: 'LIA',
    brinq_leg: '[os brinquedos no chão viraram para você]',
    quieto_leg: '[alguém sussurrou o seu nome, bem atrás de você]',
    respira2_leg: '[uma segunda respiração, junto da sua]'
  }, R.sustos4b || {});

  const teste = () => !!window.__teste;
  const jogando = () => E.mode === 'jogo' && !!S() && !S().dead && !S().fim && !E.ui;
  const dM = () => (M.ativo ? K.dist2(M.pos, P.pos) : 99);
  const ameaca = () => (M.ativo && (M.state === 'caca' || M.state === 'agarra' || dM() < 12)) || !!PROC.fase || !!ANA.ativa;
  const chaveNoite = () => { const s = S(); return s ? `${s.semente || 'x'}|${(s.flags && s.flags._noite) || 1}` : 'x'; };
  const mem = () => (MEM[chaveNoite()] = MEM[chaveNoite()] || {});
  const sorte = tag => hash01(chaveNoite() + '|' + tag);
  const noite = () => (S() && S().flags && S().flags._noite) || 1;
  const sala = () => (P.room ? P.room.id : '');
  const leg = t => E.sub('', t);
  const sfx = (n, ...a) => { try { if (E.SFX && E.SFX[n]) E.SFX[n](...a); } catch (e) {} };
  const conquista = id => { try { if (E.conquista && !teste()) E.conquista(id); } catch (e) {} };
  const vibrar = p => { try { if (navigator.vibrate && E.OPT.vibrar !== false) navigator.vibrate(p); } catch (e) {} };
  const V = new THREE.Vector3();
  const olhaTras = () => P.olhar > 1.5;
  function olhando(p, cos = .9) { const f = K.fwdH(), dx = p.x - P.pos.x, dz = p.z - P.pos.z, l = Math.hypot(dx, dz) || 1; return (f.x * dx + f.z * dz) / l > cos; }
  function viraPara(g, alvo, costas = false) { g.rotation.set(0, Math.atan2(alvo.x - g.position.x, alvo.z - g.position.z) + (costas ? Math.PI : 0), 0); }
  function noChao(g, p) { V.set(p.x, 0, p.z); E.collide(V, .25); g.position.set(V.x, 0, V.z); }
  const sussurro = (pos, dur = .7, vol = .14) => { try { K.voz(pos, { sopro: true, vogais: [[500, 1900], [700, 1700], [350, 2300]], dur, vol, wet: .1 }); } catch (e) {} };
  const acharSala = id => W.salas.find(r => r.id === id);
  const salaMeio = r => ({ x: (r.x0 + r.x1) / 2, z: (r.z0 + r.z1) / 2 });
  const dist = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);

  function tex(w, h, draw) { const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d'); draw(g, w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.userData.clone = true; return { t, c, g }; }
  const matTex = (t, op = 1, em = .4) => new THREE.MeshStandardMaterial({ map: t, transparent: true, opacity: op, roughness: 1, emissive: 0x141210, emissiveIntensity: em, depthWrite: false });
  const matCor = (c, em = 0x0a0806, ei = .5) => new THREE.MeshStandardMaterial({ color: c, roughness: .9, emissive: em, emissiveIntensity: ei });
  function silhuetaCriancaMat() { return new THREE.MeshBasicMaterial({ color: 0x060608, transparent: true, opacity: .96 }); }
  function criancaG(alt = 1, mat) {
    mat = mat || silhuetaCriancaMat(); const g = new THREE.Group();
    E.cyl(.09 * alt, .2 * alt, .85 * alt, mat, 0, .425 * alt, 0, 8, g);
    const c = new THREE.Mesh(new THREE.SphereGeometry(.115 * alt, 10, 8), mat); c.position.y = 1 * alt; g.add(c);
    return g;
  }
  // coloca um plano na parede z0 (ou z1) da sala, virado para dentro
  function naParede(r, w, h, matr, y, dz = 0) {
    const cx = clamp((r.x0 + r.x1) / 2, r.x0 + w / 2 + .1, r.x1 - w / 2 - .1);
    const z0 = r.z0 + .05, pl = E.plano(w, h, matr, cx, y, z0, 0); return pl;
  }

  // ---------------- conquistas novas (secretas)
  for (const c of [
    { id: 'l4b_atrasada', nome: 'Atrasada', desc: 'Veja o reflexo que demora a acompanhar.', segredo: true },
    { id: 'l4b_tres', nome: 'Contei Três', desc: 'Repare nas três silhuetas das janelas quando o gerador liga.', segredo: true },
    { id: 'l4b_costureira', nome: 'A Costureira', desc: 'Veja o manequim tombar no cemitério.', segredo: true },
    { id: 'l4b_linha', nome: 'Linha Cruzada', desc: 'Siga o barbante do telefone de lata.', segredo: true },
    { id: 'l4b_fechadura', nome: 'Pela Fechadura', desc: 'Encontre o olho do outro lado da fechadura.', segredo: true },
    { id: 'l4b_trancada', nome: 'Trancada', desc: 'Fique presa no armário trancado por fora.', segredo: true },
    { id: 'l4b_fila', nome: 'Dez na Fila', desc: 'Conte a décima figura da Procissão.', segredo: true },
    { id: 'l4b_eu', nome: 'Chamei a Mim Mesma', desc: 'Responda "presente" com a sua própria voz na chamada.', segredo: true },
    { id: 'l4b_38', nome: 'Trinta e Oito', desc: 'Encontre o par de sapatos que sobrou.', segredo: true },
    { id: 'l4b_sino', nome: 'Badalada Solitária', desc: 'Acerte a garrafa no sino da torre.', segredo: true },
    { id: 'l4b_onze', nome: 'Onze', desc: 'Ouça a Ana contar até onze.', segredo: true },
    { id: 'l4b_porta', nome: 'Nove Riscos', desc: 'Passe nove vezes pela porta que conta os seus passos.', segredo: true }
  ]) if (R.conquistas && !R.conquistas.some(x => x.id === c.id)) R.conquistas.push(c);

  // ---------------- ocorrências raras parte 2 (própria lista, somando as noites)
  const RARAS2 = [
    { id: 'proc10', nome: 'A décima figura da Procissão, com o casaco da Lia' },
    { id: 'chamada', nome: 'A chamada que terminou no nome da Lia' },
    { id: 'luneta', nome: 'O rosto colado na lente da luneta do sótão' },
    { id: 'onze', nome: 'A Ana contando até onze' },
    { id: 'janela', nome: 'As três silhuetas nas janelas de cima' }
  ];
  function rara(id) {
    const def = RARAS2.find(r => r.id === id); if (!def) return;
    let nova = false; const o = lsMuda(x => { x.raras2 = x.raras2 || {}; if (!x.raras2[id]) { x.raras2[id] = new Date().toLocaleDateString('pt-BR'); nova = true; } });
    if (!nova) return; const n = Object.keys(o.raras2).length;
    setTimeout(() => { try { if (E.mode === 'jogo') E.toast(`Anotado no diário: coisas que quase ninguém viu — parte 2 (${n}/${RARAS2.length}).`); } catch (e) {} }, 7000);
  }

  // ---------------- camada de overlay (vinhetas de luneta/fechadura/furo)
  const css = document.createElement('style');
  css.textContent = `
  .l4b{position:fixed;pointer-events:none;z-index:41}
  #l4b-vinheta{inset:0;background:radial-gradient(circle at 50% 50%,rgba(30,34,30,.0) 0,rgba(10,12,10,.7) 22vh,#000 30vh);opacity:0;transition:opacity .25s}
  #l4b-vinheta b{position:absolute;left:50%;top:50%;width:18vh;height:18vh;margin:-9vh 0 0 -9vh;border-radius:50%;opacity:0}
  #l4b-vtxt{position:absolute;left:0;right:0;bottom:16%;text-align:center;font:italic 16px Georgia,serif;color:#cdbb92;text-shadow:0 0 8px #000;opacity:0;transition:opacity .4s}`;
  document.head.appendChild(css);
  const div = (id, html = '') => { const el = document.createElement('div'); el.id = id; el.className = 'l4b'; el.innerHTML = html; document.body.appendChild(el); return el; };
  const elVin = div('l4b-vinheta', '<b></b>'), elVtxt = div('l4b-vtxt');
  function vinheta(on, olho) { elVin.style.opacity = on ? 1 : 0; const b = elVin.firstChild; b.style.background = olho === 'olho' ? 'radial-gradient(circle,#d8d4c8 0 30%,#b0352a 31% 44%,#060606 46% 60%,transparent 62%)' : olho === 'rosto' ? 'radial-gradient(ellipse at 50% 45%,#cfc8b8 0 46%,transparent 60%),radial-gradient(circle at 42% 42%,#000 0 7%,transparent 9%),radial-gradient(circle at 58% 42%,#000 0 7%,transparent 9%)' : 'none'; b.style.opacity = olho ? 1 : 0; }

  // =====================================================================  REFLEXO ATRASADO (espelho do banheiro de cima e do patamar)
  const ESP = [];
  function montarEspelho(idSala) {
    const r = acharSala(idSala); if (!r) return;
    const w = Math.min(.9, (r.x1 - r.x0) - .4); if (w < .5) return;
    const { t } = tex(128, 220, (g, W2, H2) => { g.fillStyle = '#10140f'; g.fillRect(0, 0, W2, H2); const gr = g.createLinearGradient(0, 0, W2, H2); gr.addColorStop(0, 'rgba(120,130,120,.14)'); gr.addColorStop(.5, 'rgba(60,66,60,.05)'); gr.addColorStop(1, 'rgba(100,110,100,.12)'); g.fillStyle = gr; g.fillRect(0, 0, W2, H2); g.strokeStyle = 'rgba(40,40,36,.9)'; g.lineWidth = 8; g.strokeRect(4, 4, W2 - 8, H2 - 8); });
    const pl = naParede(r, w, 1.5, matTex(t, .85, .2), 1.5);
    pl.userData.leitura = { t: 'Um espelho de parede, o vidro embaçado. O seu reflexo custa a chegar.', parede: true };
    const smat = new THREE.MeshBasicMaterial({ color: 0x0a0b0a, transparent: true, opacity: 0 });
    const sil = criancaG(1.55, smat);
    sil.position.set(pl.position.x, 0, r.z0 + .5); sil.visible = true; W.grupo.add(sil);
    ESP.push({ pl, sil, smat, r, t: 0, feito: false });
  }
  function updateEspelho(dt) {
    const m = mem(); if (m.espelho) return;
    for (const e of ESP) {
      if (e.feito || !e.pl.parent) continue;
      const perto = dist(P.pos, e.pl.position) < 2.6, encara = olhando(e.pl.position, .93), luz = S().flashOn;
      if (perto && encara && luz && !ameaca()) { e.t += dt; } else { e.t = Math.max(0, e.t - dt * 2); e.smat.opacity = Math.max(0, e.smat.opacity - dt); }
      if (e.t > 6 && !e.feito) {
        e.feito = true; m.espelho = true; leg(T.esp_leg); sfx('vidro'); viraPara(e.sil, P.pos);
        let tt = 0; const girouAte = 1.2;
        K.anima(e.sil, d => {
          tt += d; e.smat.opacity = Math.min(.9, tt * 1.5);
          if (tt > girouAte) { const alvo = { x: e.pl.position.x, z: e.r.z1 }; e.sil.rotation.y += (Math.atan2(alvo.x - e.sil.position.x, alvo.z - e.sil.position.z) - e.sil.rotation.y) * Math.min(1, d * 2); }
          if (tt > 3.8) { e.smat.opacity = Math.max(0, .9 - (tt - 3.8) * 1.8); if (tt > 4.4) { e.sil.visible = false; sfx('suspiroLia'); E.sub('lia', T.esp_lia); conquista('l4b_atrasada'); return true; } }
        });
      }
    }
  }

  // =====================================================================  TV DE TUBO QUE TE FILMA (sala de brinquedos)
  let TV = null;
  function montarTV() {
    const r = acharSala('brinq'); if (!r) return;
    const sp = salaMeio(r); const g = new THREE.Group(); g.position.set(clamp(sp.x + 1.4, r.x0 + .5, r.x1 - .5), 0, clamp(r.z0 + .5, r.z0 + .3, r.z1 - .3)); W.grupo.add(g);
    E.box(.7, .55, .55, matCor(0x201c18), 0, .75, 0, g);
    const o = tex(128, 96, () => {}); const tela = new THREE.Mesh(new THREE.PlaneGeometry(.52, .4), new THREE.MeshBasicMaterial({ map: o.t, transparent: true }));
    tela.position.set(0, .78, .28); g.add(tela);
    TV = { g, tela, o, t: 0, encara: 0, firmou: false, off: false, x: g.position.x, z: g.position.z + .3 };
  }
  function chuvisco(ctx, w, h, firme) {
    const img = ctx.createImageData(w, h), d = img.data;
    for (let i = 0; i < d.length; i += 4) { const n = (Math.random() * 255) | 0; d[i] = d[i + 1] = d[i + 2] = firme ? n * .25 + 20 : n; d[i + 3] = 255; }
    ctx.putImageData(img, 0, 0);
    if (firme) { ctx.fillStyle = 'rgba(10,10,12,.5)'; ctx.fillRect(0, 0, w, h); ctx.fillStyle = 'rgba(200,200,210,.25)'; ctx.beginPath(); ctx.ellipse(w * .5, h * .62, 10, 16, 0, 0, 7); ctx.fill(); ctx.fillStyle = 'rgba(0,0,0,.6)'; ctx.beginPath(); ctx.ellipse(w * .5, h * .34, 14, 20, 0, 0, 7); ctx.fill(); }
  }
  function updateTV(dt) {
    if (!TV || !TV.g.parent || TV.off) return;
    const perto = dist(P.pos, { x: TV.x, z: TV.z }) < 4;
    TV.t += dt; if (TV.t > .08) { TV.t = 0; chuvisco(TV.o.g, 128, 96, TV.firmou); TV.o.t.needsUpdate = true; }
    if (perto && olhando({ x: TV.x, z: TV.z }, .9)) TV.encara += dt; else { TV.encara = Math.max(0, TV.encara - dt); if (TV.firmou && TV.encara <= 0) desligaTV(); }
    if (TV.encara > 12 && !TV.firmou) { TV.firmou = true; leg(T.tv_leg); sfx('estatica', .1); }
  }
  function desligaTV() { if (!TV || TV.off) return; TV.off = true; TV.tela.visible = false; leg(T.tv_desliga); sfx('estalo'); }

  // =====================================================================  GRAVADOR: A FITA SEM ETIQUETA (sala do diretor)
  function montarGravador() {
    const r = acharSala('diret'); if (!r) return;
    const sp = salaMeio(r); const g = new THREE.Group(); g.position.set(clamp(sp.x, r.x0 + .5, r.x1 - .5), .78, clamp(sp.z, r.z0 + .5, r.z1 - .5)); W.grupo.add(g);
    E.box(.26, .08, .18, matCor(0x3a3630), 0, 0, 0, g);
    let tocando = false;
    E.interact(g, () => tocando ? 'Fita sem etiqueta (tocando)' : '<b>E</b>' + T.grav_label, () => {
      if (tocando) return; tocando = true; const o = lsGet();
      if (!o.ultima) { sfx('gravRolo'); E.toast(T.grav_vazio); setTimeout(() => { tocando = false; }, 4000); return; }
      sfx('gravRolo'); const u = o.ultima;
      leg(T.grav_lia);
      K.depois(.6, () => { for (let i = 0; i < 4; i++) K.depois(i * .4, () => sfx('passo')); });
      K.depois(2.4, () => sfx('ofego'));
      K.depois(3, () => { sfx('susto'); sfx(u.quem === 'ana' ? 'risada' : u.quem === 'proc' ? 'procissao' : 'pancada', P.pos.x, P.pos.z); });
      K.depois(3.4, () => E.toast(`A fita termina onde você terminou: ${u.salaNome || u.sala}.`));
      K.depois(6, () => { tocando = false; });
    });
  }

  // =====================================================================  FOTO DA TURMA QUE MUDA (recepção / refeitório)
  let FOTO = null;
  function totalMortes() { return lsGet().mortesTotal || 0; }
  function montarFoto(idSala) {
    const r = acharSala(idSala); if (!r) return;
    const dados = tex(300, 210, () => {}); const pl = naParede(r, .9, .64, matTex(dados.t, 1, .35), 1.6);
    pl.userData.leitura = { t: 'Uma foto da turma, emoldurada. Trinta e sete crianças, em fila.', parede: true };
    FOTO = { pl, dados, ult: -1, vira: 0, x: pl.position.x, z: pl.position.z }; redrawFoto();
  }
  function redrawFoto() {
    if (!FOTO) return; const g = FOTO.dados.g, m = totalMortes(); FOTO.ult = m;
    g.fillStyle = '#20201c'; g.fillRect(0, 0, 300, 210); g.fillStyle = '#d8d0bc'; g.fillRect(6, 6, 288, 168);
    for (let f = 0; f < 37; f++) { const col = f % 10, lin = (f / 10) | 0, x = 20 + col * 27, y = 24 + lin * 40; const escura = f < m; g.fillStyle = escura ? '#2a2420' : '#b8ad96'; g.beginPath(); g.arc(x, y, 9, 0, 7); g.fill(); g.fillStyle = escura ? '#120f0c' : '#8a7f6a'; g.beginPath(); g.arc(x, y - 1, 6, 0, 7); g.fill(); if (escura && f >= m - 3) { g.fillStyle = '#000'; g.fillRect(x - 5, y - 2, 2, 2); g.fillRect(x + 3, y - 2, 2, 2); } }
    g.fillStyle = '#e8dfc8'; g.font = 'bold 18px Georgia'; g.textAlign = 'center'; g.fillText(m >= 9 ? T.foto_1994 : T.foto_1979, 150, 196); g.textAlign = 'left';
    FOTO.dados.t.needsUpdate = true;
  }
  function updateFoto(dt) {
    if (!FOTO || !FOTO.pl.parent) return; if (totalMortes() !== FOTO.ult) redrawFoto();
    if (dist(P.pos, { x: FOTO.x, z: FOTO.z }) < 2.2 && olhando({ x: FOTO.x, z: FOTO.z }, .95) && S().flashOn) { FOTO.vira += dt; if (FOTO.vira > 3 && !FOTO.virou) { FOTO.virou = true; leg(T.foto_vira); sfx('estatica', .08); } } else FOTO.vira = Math.max(0, FOTO.vira - dt);
  }

  // =====================================================================  O LENÇOL QUE SENTA NA CAMA DO DAVI (dormitório de cima)
  let LENCOL = null;
  function montarLencol() {
    if (W.mapa !== 'superior') return;
    const cama = W.lockers.find(L => L.tipo === 'cama'); if (!cama) return;
    const m = mem(); const g = new THREE.Group(); g.position.set(cama.x, .4, cama.z); g.visible = false; W.grupo.add(g);
    const corpo = new THREE.Mesh(new THREE.SphereGeometry(.28, 10, 8), matCor(0xcfc6b2, 0x15120e, .4)); corpo.scale.set(1, 1.2, .8); g.add(corpo);
    LENCOL = { g, cama, aprox: 0, falou: false, visto: false, slept: !!m['camaF'] };
    // noite seguinte: se dormiu nessa cama, ela está desarrumada e quente
    const o = lsGet(); if (o.dormiuCamaF && !m.camaFaviso) { m.camaFaviso = true; corpo.scale.set(.8, .4, 1.4); }
  }
  function updateLencol(dt) {
    if (!LENCOL || !LENCOL.g.parent || ameaca()) return;
    const g = LENCOL.g, vis = E.visivel({ x: g.position.x, z: g.position.z }, 1, 12) && S().flashOn && olhando(g.position, .6);
    if (!g.visible && olhaTras() && dist(P.pos, g.position) < 10) { g.visible = true; leg(T.lencol_leg); }
    if (!g.visible) return;
    if (!vis && LENCOL.visto) {
      const dx = P.pos.x - g.position.x, dz = P.pos.z - g.position.z, l = Math.hypot(dx, dz) || 1;
      if (l > 1) { g.position.x += dx / l * Math.min(l - .8, 1.2); g.position.z += dz / l * Math.min(l - .8, 1.2); }
      else if (!LENCOL.falou) { LENCOL.falou = true; E.sub('voz', T.lencol_fala); S().fear = Math.min(100, S().fear + 35); g.visible = false; vibrar(120); }
    }
    LENCOL.visto = vis;
  }

  // =====================================================================  PEGADAS MOLHADAS QUE LEVAM A UM ARMÁRIO
  function montarPegadas() {
    const m = mem(); if (m.pegadas || !['terreo', 'superior'].includes(W.mapa) || sorte('peg' + W.mapa) > .5) return;
    const arm = W.lockers.filter(L => L.tipo === 'armario'); if (!arm.length) return;
    const L = arm[Math.floor(sorte('pegL') * arm.length)]; m.pegArm = `${Math.round(L.x * 10)},${Math.round(L.z * 10)}`;
    const matP = new THREE.MeshStandardMaterial({ color: 0x1a1c1e, roughness: .2, metalness: .3, transparent: true, opacity: .5, depthWrite: false });
    const p0 = { x: L.x - L.face[0] * 2.4, z: L.z - L.face[1] * 2.4 };
    for (let i = 0; i < 6; i++) { const t = i / 5, x = p0.x + (L.x - p0.x) * t, z = p0.z + (L.z - p0.z) * t; const pe = E.plano(.12, .22, matP, x + (i % 2 ? .08 : -.08), .012, z, Math.atan2(L.face[0], L.face[1])); pe.rotation.x = -Math.PI / 2; pe.rotation.z = Math.atan2(L.face[0], L.face[1]); }
    m.pegadas = true; m.pegMostrou = false;
  }
  function updatePegadas() {
    const m = mem(); if (!m.pegArm || m.pegMostrou) return;
    if (sala() && dist(P.pos, { x: parseFloat(m.pegArm.split(',')[0]) / 10, z: parseFloat(m.pegArm.split(',')[1]) / 10 }) < 2.5 && !m.pegLeg) { m.pegLeg = true; leg(T.pegadas_leg); }
  }

  // =====================================================================  O ARMÁRIO TRANCADO POR FORA (túneis)
  let trancaArm = null;
  function montarTranca() { if (W.mapa !== 'tuneis') return; const arm = W.lockers.filter(L => L.tipo === 'armario'); if (!arm.length) return; trancaArm = arm[Math.floor(sorte('tranca') * arm.length)]; }

  // =====================================================================  A PORTA QUE CONTA OS SEUS PASSOS (corredor de cima)
  let PORTAC = null;
  function montarPortaConta() {
    if (W.mapa !== 'superior') return; const r = acharSala('corr'); if (!r) return;
    const sp = salaMeio(r); const dados = tex(96, 160, () => {}); const pl = E.plano(.14, .5, matTex(dados.t, .9, .3), clamp(sp.x + (r.x1 - r.x0) / 3, r.x0 + .2, r.x1 - .2), 1.2, r.z0 + .06, 0);
    PORTAC = { pl, dados, x: pl.position.x, z: pl.position.z, n: mem().portaC || 0, dentro: false, abriu: false }; redrawPortaC();
    pl.userData.leitura = { t: 'Riscos de giz no batente da porta. Alguém conta as vezes que você passa.', parede: true };
  }
  function redrawPortaC() { if (!PORTAC) return; const g = PORTAC.dados.g; g.clearRect(0, 0, 96, 160); g.strokeStyle = 'rgba(235,232,220,.85)'; g.lineWidth = 4; g.lineCap = 'round'; for (let i = 0; i < PORTAC.n; i++) { const x = 16 + (i % 3) * 26, y = 20 + ((i / 3) | 0) * 36; g.beginPath(); g.moveTo(x, y); g.lineTo(x, y + 26); g.stroke(); } PORTAC.dados.t.needsUpdate = true; }
  function passouPortaC() {
    if (!PORTAC || PORTAC.abriu) return; const m = mem();
    PORTAC.dentro = PORTAC.dentro || false; const perto = dist(P.pos, { x: PORTAC.x, z: PORTAC.z }) < 2;
    if (perto && !PORTAC.dentro) { PORTAC.dentro = true; PORTAC.n++; m.portaC = PORTAC.n; redrawPortaC(); if (PORTAC.n >= 9) { PORTAC.abriu = true; sfx('rangido'); K.depois(.5, () => { E.sub('voz', T.conta_voz); }); K.depois(2, () => E.toast(T.conta_dentro)); conquista('l4b_porta'); } }
    else if (!perto) PORTAC.dentro = false;
  }

  // =====================================================================  TELEFONE DE LATA (sala de brinquedos)
  function montarLata() {
    const r = acharSala('brinq'); if (!r) return; const sp = salaMeio(r);
    const g = new THREE.Group(); g.position.set(clamp(sp.x - 1, r.x0 + .4, r.x1 - .4), .02, clamp(sp.z + 1, r.z0 + .4, r.z1 - .4)); W.grupo.add(g);
    E.cyl(.03, .035, .08, matCor(0x8a8276, 0x161310, .5), 0, .04, 0, 8, g);
    E.interact(g, () => '<b>E</b>' + T.lata_label, () => { leg(T.lata_resp); sussurro({ x: g.position.x, y: .6, z: g.position.z }, .8, .1); const m = mem(); if (!m.lataSeg) { m.lataSeg = true; const arm = W.lockers.find(L => L.tipo === 'armario'); if (arm) K.depois(1.2, () => E.toast('O barbante some por baixo da porta, na direção de um armário.')); } });
  }

  // =====================================================================  OS SAPATOS QUE SOBRAM (dormitório)
  let SAPATOS = null;
  function montarSapatos() {
    if (W.mapa !== 'superior') return; const r = acharSala('dormD') || acharSala('dormC') || acharSala('dormB'); if (!r) return;
    SAPATOS = { r, x: salaMeio(r).x, z: salaMeio(r).z, falou: false, visto: false, mais: false };
  }
  function updateSapatos(dt) {
    if (!SAPATOS) return; const m = mem(); if (m.sapatos) return;
    const perto = dist(P.pos, { x: SAPATOS.x, z: SAPATOS.z }) < 2.6, vis = olhando({ x: SAPATOS.x, z: SAPATOS.z }, .9) && S().flashOn;
    if (perto && vis && !SAPATOS.falou) { SAPATOS.falou = true; E.sub('lia', T.sapatos_lia); }
    if (SAPATOS.falou && !vis) SAPATOS.visto = true;
    if (SAPATOS.visto && vis && !SAPATOS.mais) { SAPATOS.mais = true; m.sapatos = true; leg(T.sapatos_38); sfx('aguaLonge'); conquista('l4b_38'); }
  }

  // =====================================================================  A GARRAFA NO SINO DA TORRE (cemitério, Cap. V)
  function garrafaBateu(x, z) {
    if (W.mapa !== 'cemiterio') return; const m = mem(); if (m.sinoTorre) return;
    // alvo: a torre, no centro-alto do mapa; aceita se jogada "para cima/longe"
    const alvo = { x: 0, z: -2 }; if (dist({ x, z }, P.pos) < 1.2) return;
    m.sinoTorre = true; sfx('sino', .7, { x: 0, y: 6, z: -2 }, 1.2); leg(T.garrafa_torre); conquista('l4b_sino');
    if (PROC.fase) { leg(T.garrafa_fila); }
    K.depois(3.2, () => { try { E.emitNoise(0, -2, 12, true); } catch (e) {} }); // o Inspetor ouve e vem pela torre
  }

  // =====================================================================  A BATIDA QUE RESPONDE (armário)
  const bat = { escondido: null, toques: [], feito: false };
  function aoEsconder(L) { bat.escondido = L; bat.toques = []; }
  function aoSair() { bat.escondido = null; }
  function onKey(ev) {
    if (ev.code !== 'KeyE' || !jogando() || !bat.escondido || ameaca()) return;
    const m = mem(); if (m.batResp && m.batRespFeito) return;
    const now = performance.now() / 1000; bat.toques.push(now); while (bat.toques.length && now - bat.toques[0] > 1.6) bat.toques.shift();
    if (bat.toques.length >= 3 && !m.batResp) {
      m.batResp = true; const L = bat.escondido; const viz = { x: L.x - (L.face ? L.face[1] : 0) * 1.2, y: 1.2, z: L.z + (L.face ? L.face[0] : 0) * 1.2 };
      if (sorte('bat' + S().chapter) < .6) { K.depois(.6, () => { for (let i = 0; i < 3; i++) K.depois(i * .4, () => K.batida(viz, .5)); leg(T.batida_resp); bat.esperaResp = now; });
        bat.respondeuJanela = () => { m.batRespFeito = true; leg(T.batida_davi); for (const d of [0, .3, .3, .2, .2]) K.depois(d, () => K.batida(viz, .55)); };
      } else { K.depois(1, () => { K.batida(viz, .4); leg(T.batida_vazio); sfx('rangido'); m.batRespFeito = true; }); }
    } else if (m.batResp && !m.batRespFeito && bat.respondeuJanela && now - (bat.esperaResp || 0) < 6) { bat.respondeuJanela(); }
  }

  // =====================================================================  O ARMÁRIO "TÁ CHEIO" (um por noite, longe do caminho)
  let cheioArm = null;
  function montarCheio() {
    const m = mem(); if (!['terreo', 'superior'].includes(W.mapa)) return; const arm = W.lockers.filter(L => L.tipo === 'armario'); if (arm.length < 2) return;
    cheioArm = arm[Math.floor(sorte('cheio' + W.mapa) * arm.length)]; m.cheioTent = m.cheioTent || 0;
  }

  // =====================================================================  A DÉCIMA FIGURA DA PROCISSÃO
  const procDez = { g: null, feito: false };
  function updateProcDez() {
    const s = S(); const m = mem();
    if (!PROC.fase) { procDez.feito = false; if (procDez.g) procDez.g.visible = false; return; }
    if (!s.hidden || m.proc10 || procDez.feito || sorte('proc10') > .5) return;
    if (!procDez.g) { procDez.g = criancaG(1.5); const cap = new THREE.Mesh(new THREE.BoxGeometry(.03, .03, .03), new THREE.MeshStandardMaterial({ color: 0xffd98a, emissive: 0xffb84a, emissiveIntensity: 1.5 })); cap.position.set(.14, .8, 0); procDez.g.add(cap); W.grupo.add(procDez.g); }
    if (!procDez.feito && PROC.pos) {
      procDez.feito = true; m.proc10 = true;
      const f = K.fwdH(); procDez.g.position.set(PROC.pos.x - f.x * .6, 0, PROC.pos.z - f.z * .6); viraPara(procDez.g, P.pos); procDez.g.visible = true;
      leg(T.proc_dez); rara('proc10'); conquista('l4b_fila');
      K.depois(3.5, () => { if (procDez.g) procDez.g.visible = false; });
      if (noite() >= 2) K.depois(5, () => E.sub('lia', T.proc_lia));
    }
  }

  // =====================================================================  AS SILHUETAS NAS JANELAS (quando o gerador liga)
  const JAN = { antes: false };
  function silhuetasJanela() {
    const m = mem(); if (m.janela || W.mapa !== 'terreo') return; m.janela = true;
    const base = { x: P.pos.x, z: P.pos.z - 6 }; const figs = [];
    for (const off of [[-2, 2.2, .55], [1.5, 2.2, .55], [.2, 3.6, .3]]) { const g = criancaG(off[2] === .3 ? .7 : 1.4); g.position.set(base.x + off[0], off[1] - (off[2] === .3 ? .7 : 1.4), base.z); W.grupo.add(g); figs.push(g); }
    leg(T.janela_leg); rara('janela');
    K.depois(1.2, () => { for (const g of figs) g.visible = false; });
    const o = lsMuda(x => { x.janelaViu = (x.janelaViu || 0) + 1; }); if (o.janelaViu >= 1) conquista('l4b_tres');
  }

  // =====================================================================  A LUNETA DO SÓTÃO
  function montarLuneta() {
    const r = acharSala('sotao'); if (!r) return; const sp = salaMeio(r);
    const g = new THREE.Group(); g.position.set(clamp(sp.x, r.x0 + .4, r.x1 - .4), 1.2, r.z0 + .2); W.grupo.add(g);
    const lun = E.cyl(.03, .04, .3, matCor(0x9a8a5a, 0x201808, .6), 0, 0, 0, 8, g); lun.rotation.x = Math.PI / 2;
    let n = mem().luneta || 0;
    E.interact(g, () => '<b>E</b>' + T.luneta_label, () => {
      const m = mem(); n = (m.luneta || 0) + 1; m.luneta = n; vinheta(true); elVtxt.style.opacity = 1;
      elVtxt.textContent = n === 1 ? T.luneta_1 : n === 2 ? T.luneta_2 : T.luneta_3;
      if (n >= 3) { vinheta(true, 'rosto'); sfx('vidro'); sfx('estatica', .14); S().fear = Math.min(100, S().fear + 20); rara('luneta'); vibrar(100); }
      setTimeout(() => { vinheta(false); elVtxt.style.opacity = 0; }, n >= 3 ? 1200 : 2600);
    });
  }

  // =====================================================================  A SOMBRA QUE NÃO ACOMPANHA (corredor com lâmpada atrás)
  let SOMB = null;
  function montarSombra() {
    if (!['terreo', 'superior'].includes(W.mapa)) return; const corr = W.salas.find(r => r.tipo === 'corredor' && (r.x1 - r.x0) > 5); if (!corr) return;
    SOMB = { r: corr, feito: false, paradaT: 0, marca: null };
  }
  function updateSombra(dt) {
    if (!SOMB || SOMB.feito || P.room !== SOMB.r || ameaca()) { if (SOMB) SOMB.paradaT = 0; return; }
    const m = mem(); if (m.sombraNA) { SOMB.feito = true; return; }
    const mov = Math.hypot(P.pos.x - (SOMB.lx ?? P.pos.x), P.pos.z - (SOMB.lz ?? P.pos.z)); SOMB.lx = P.pos.x; SOMB.lz = P.pos.z;
    if (mov < .02) SOMB.paradaT += dt; else SOMB.paradaT = 0;
    if (SOMB.paradaT > 1.5 && !SOMB.feito && S().flashOn) {
      SOMB.feito = true; m.sombraNA = true; leg(T.sombra_leg); const f = K.fwdH();
      const sil = criancaG(1.6, new THREE.MeshBasicMaterial({ color: 0x050506, transparent: true, opacity: .8 })); sil.position.set(P.pos.x + f.x * 2.4, 0, P.pos.z + f.z * 2.4); W.grupo.add(sil);
      const marca = { x: sil.position.x, z: sil.position.z }; SOMB.marca = marca;
      K.depois(2, () => { sil.visible = false; });
      // recompensa: giz e pilha onde a sombra parou
      const matP = new THREE.MeshBasicMaterial({ color: 0xcfc8b4, transparent: true, opacity: .8 }); const pl = E.plano(.3, .3, matP, marca.x, .013, marca.z, 0); pl.rotation.x = -Math.PI / 2;
      const pil = new THREE.Group(); pil.position.set(marca.x, 0, marca.z); W.grupo.add(pil); E.cyl(.03, .03, .1, matCor(0xc8b030, 0x4a4010, .8), 0, .05, 0, 8, pil);
      E.interact(pil, () => '<b>E</b>Pegar a pilha', () => { pil.visible = false; try { S().inv.pilhas++; E.renderInvMini(); } catch (e) {} sfx('pegar'); E.toast(T.sombra_achou); }, { on: () => pil.visible });
    }
  }

  // =====================================================================  A ANA QUE CONTA ATÉ ONZE (variação rara do DEZ)
  function talvezOnze() {
    const m = mem(); if (m.onze || W.mapa !== 'superior' || ANA.ativa || ameaca() || !P.room || P.room.fora) return;
    if (sorte('onze' + sala()) > 1 / 6) { m.onzeTentou = (m.onzeTentou || 0); return; }
    m.onze = true; const f = K.fwdH(), p = { x: P.pos.x + f.x * 1.2, z: P.pos.z + f.z * 1.2 };
    E.sub('ana', T.onze_ana); let n = 0, t = 0; const abafa = () => { try { if (E.master && E.master.gain) { /* abafar: baixa curta */ } } catch (e) {} };
    K.anima(K.ANA2, dt => { t += dt; if (t > n * .9 && n < 3) { sfx('contagem', { x: p.x, z: p.z }, 8 + n); n++; } if (t > 3 && t < 8) { /* silêncio abafado */ } if (t > 8) { noChao(K.ANA2, { x: P.pos.x + f.x * .4, z: P.pos.z + f.z * .4 }); viraPara(K.ANA2, P.pos); K.ANA2.visible = true; E.sub('ana', T.onze_fala); sfx('susto'); S().health = Math.max(1, S().health - 20); P.shake = Math.max(P.shake, .14); vibrar([60, 40, 160]); conquista('l4b_onze'); rara('onze'); setTimeout(() => { K.ANA2.visible = false; }, 1400); return true; } });
    abafa();
  }

  // =====================================================================  O OLHO NA FECHADURA
  const FECH = [];
  function montarFechadura(idSala) {
    const r = acharSala(idSala); if (!r) return; const sp = salaMeio(r);
    const g = new THREE.Group(); g.position.set(clamp(sp.x, r.x0 + .3, r.x1 - .3), 1.0, r.z0 + .06); W.grupo.add(g);
    E.box(.04, .07, .02, matCor(0x15110c, 0x000000, 0), 0, 0, 0, g);
    FECH.push(g);
    E.interact(g, () => '<b>E</b>' + T.fech_label, () => {
      const m = mem(); vinheta(true); elVtxt.style.opacity = 1;
      if (!m.fechOlho && sorte('fech' + idSala) < .5) { m.fechOlho = true; vinheta(true, 'olho'); elVtxt.textContent = ''; leg(T.fech_olho); sfx('respiracoes'); S().fear = Math.min(100, S().fear + 18); conquista('l4b_fechadura'); vibrar(80); }
      else if (!m.fechLia && sorte('fechL' + idSala) < .4) { m.fechLia = true; elVtxt.textContent = T.fech_lia; }
      else { elVtxt.textContent = T.fech_nada; }
      setTimeout(() => { vinheta(false); elVtxt.style.opacity = 0; }, 2400);
    });
  }

  // =====================================================================  A CHAMADA QUE PULA O SEU NOME (sala de aula)
  const CHAM = { segundaLia: null, ativa: false };
  function talvezChamada() {
    const m = mem(); if (m.chamada || W.mapa !== 'terreo' || sala() !== 'aula' || ameaca()) return;
    if (sorte('chamada') > 1 / 8) { m.chamada = true; return; } m.chamada = true;
    const nomes = ['Albano', 'Celeste', 'Joaquim', 'Davi', 'Tomé', 'Luiz'];
    nomes.forEach((nm, i) => K.depois(i * 1.1, () => sfx('chamadoVoz')));
    K.depois(nomes.length * 1.1 + .4, () => { E.sub('voz', T.chamada_nome); CHAM.esperaAte = performance.now() / 1000 + 5; CHAM.ativa = true; CHAM.parado = 0; CHAM. px = P.pos.x; CHAM.pz = P.pos.z; });
  }
  function updateChamada(dt) {
    if (!CHAM.ativa) return; const m = mem();
    const mov = Math.hypot(P.pos.x - CHAM.px, P.pos.z - CHAM.pz); CHAM.px = P.pos.x; CHAM.pz = P.pos.z;
    if (mov < .03) CHAM.parado += dt; else CHAM.parado = 0;
    if (CHAM.parado > 5 && !CHAM.resp) { CHAM.resp = true; CHAM.ativa = false; E.sub('voz', T.chamada_presente); sfx('suspiroLia'); K.depois(1.4, () => E.sub('lia', T.chamada_lia)); conquista('l4b_eu'); rara('chamada'); m.chamadaLia = true; }
    else if (performance.now() / 1000 > (CHAM.esperaAte || 0)) { CHAM.ativa = false; }
  }
  function segundaLiaCorredor() {
    const m = mem(); if (!m.chamadaLia || W.mapa !== 'terreo' || P.room.tipo !== 'corredor' || ameaca() || sorte('segLia' + sala()) > .25) return;
    const p = K.fundoCorredor ? K.fundoCorredor(P.room, 9) : null; if (!p) return; const m2 = mem(); if (m2['segLia' + sala()]) return; m2['segLia' + sala()] = true;
    const g = K.CRIANCA; g.scale.setScalar(1.6); g.position.set(p.x, 0, p.z); g.visible = true; leg(T.chamada_corre); let t = 0; const d0 = { x: p.x, z: p.z };
    K.anima(g, dt => { t += dt; g.position.x += (P.pos.x - d0.x) * dt * .3; if (t > 1.1) { g.visible = false; g.scale.setScalar(1); return true; } });
  }

  // =====================================================================  A COSTUREIRA (manequim que muda de lugar)
  let COST = null;
  function montarCosteira() {
    const alvo = { terreo: 'roup', superior: 'celeste', tuneis: null, cemiterio: 'cem' }[W.mapa]; const r = alvo ? acharSala(alvo) : null; if (!r) return;
    const sp = salaMeio(r); const g = new THREE.Group(); g.position.set(clamp(sp.x, r.x0 + .4, r.x1 - .4), 0, clamp(sp.z, r.z0 + .4, r.z1 - .4)); W.grupo.add(g);
    E.cyl(.1, .14, .9, matCor(0x3a3630), 0, .45, 0, 8, g); const cab = new THREE.Mesh(new THREE.SphereGeometry(.09, 8, 6), matCor(0xd8cbb4)); cab.position.y = 1; g.add(cab);
    const cap = S() ? S().chapter : 0; viraPara(g, P.pos); g.rotation.y += (4 - Math.min(4, cap)) * .4; // mais virado a cada capítulo
    COST = { g, x: g.position.x, z: g.position.z, caiu: false };
  }
  function updateCosteira() {
    if (!COST || !COST.g.parent || W.mapa !== 'cemiterio' || COST.caiu) return;
    if (dist(P.pos, { x: COST.x, z: COST.z }) < 2 && olhando({ x: COST.x, z: COST.z }, .7)) { COST.caiu = true; COST.g.rotation.x = -1.2; sfx('tabua'); leg(T.costureira_cai); conquista('l4b_costureira'); }
  }

  // =====================================================================  A BONECA QUE RESPIRA (dormitório B)
  let RESP = null;
  function montarBonecaResp() {
    const r = acharSala('dormB') || acharSala('dormC'); if (!r) return; const sp = salaMeio(r);
    const g = new THREE.Group(); g.position.set(clamp(sp.x + .6, r.x0 + .3, r.x1 - .3), .8, clamp(r.z0 + .4, r.z0 + .3, r.z1 - .3)); W.grupo.add(g);
    E.cyl(.035, .05, .12, matCor(0x7a5a5a), 0, 0, 0, 8, g); const cab = new THREE.Mesh(new THREE.SphereGeometry(.04, 8, 6), matCor(0xd8cbb4)); cab.position.y = .09; g.add(cab);
    let abriu = 0;
    E.interact(g, () => abriu >= 3 ? 'A boneca (não mexa mais nela)' : '<b>E</b>Mexer na boneca', () => { abriu++; if (abriu < 3) { leg(T.respira_boneca); K.respiracao({ x: g.position.x, y: g.position.y, z: g.position.z }, 1.5, false, .3); } else { E.sub('voz', T.respira_mao); sfx('armario'); S().fear = Math.min(100, S().fear + 15); vibrar(60); } });
  }

  // =====================================================================  A FILA DO BANHEIRO (banheiro de cima)
  function montarFila() {
    const r = acharSala('banhS'); if (!r) return; const sp = salaMeio(r);
    const g = new THREE.Group(); g.position.set(clamp(sp.x, r.x0 + .4, r.x1 - .4), .02, clamp(sp.z, r.z0 + .4, r.z1 - .4)); W.grupo.add(g);
    E.box(.5, 1.6, .5, matCor(0x4a5248), 0, .8, 0, g);
    let bateu = 0;
    E.interact(g, () => bateu >= 3 ? 'A última cabine (aberta)' : '<b>E</b>' + T.fila_knock, () => {
      bateu++; sfx('armario'); if (bateu < 3) { K.depois(.3, () => E.sub('voz', T.fila_ocupado)); } else { sfx('rangido'); E.toast(T.fila_pralia); }
    });
    // cabines fecham uma a uma: só um feedback de som ao entrar
    const m = mem(); if (!m.filaEnt) { m.filaEnt = true; for (let i = 0; i < 3; i++) K.depois(.6 + i * .5, () => sfx('armario')); }
  }

  // =====================================================================  O FURO NA PAREDE (banheiro do térreo)
  function montarFuroTerreo() {
    const r = acharSala('banh'); if (!r) return; const sp = salaMeio(r);
    const g = new THREE.Group(); g.position.set(clamp(sp.x, r.x0 + .3, r.x1 - .3), 1.4, r.z0 + .06); W.grupo.add(g);
    E.box(.03, .03, .02, matCor(0x080806, 0x000000, 0), 0, 0, 0, g);
    let n = mem().furoT2 || 0;
    E.interact(g, () => n >= 3 ? 'O furo (tampado com papel por dentro)' : '<b>E</b>' + T.furo_label, () => {
      const m = mem(); n = (m.furoT2 || 0) + 1; m.furoT2 = n; vinheta(true); elVtxt.style.opacity = 1;
      if (n >= 3 || (M.ativo && dM() < 10)) { vinheta(true, 'olho'); elVtxt.textContent = ''; leg(T.furo_olho); sfx('estalo'); S().fear = Math.min(100, S().fear + 16); K.depois(1, () => E.toast(T.furo_tampado)); m.furoT2 = 3; }
      else { elVtxt.textContent = T.furo_nada; }
      setTimeout(() => { vinheta(false); elVtxt.style.opacity = 0; }, 2200);
    });
  }

  // =====================================================================  SUSTOS DE AMBIENTE (berço, cavalinho, quadro-negro, brinquedos, nome sussurrado, segunda respiração)
  let BERCO = null, CAVALO = null, QUADRO = null, BRINQ = null;
  function montarBerco() { const r = acharSala('enferm'); if (!r) return; const sp = salaMeio(r); const g = new THREE.Group(); g.position.set(clamp(sp.x, r.x0 + .4, r.x1 - .4), .3, clamp(sp.z, r.z0 + .4, r.z1 - .4)); W.grupo.add(g); E.box(.5, .4, .3, matCor(0x6a5a44), 0, 0, 0, g); BERCO = { g, x: g.position.x, z: g.position.z, bal: 0, leg: false }; }
  function montarCavalo() { const r = acharSala('brinq'); if (!r) return; const sp = salaMeio(r); const g = new THREE.Group(); g.position.set(clamp(sp.x + .4, r.x0 + .4, r.x1 - .4), .2, clamp(sp.z - 1, r.z0 + .4, r.z1 - .4)); W.grupo.add(g); E.box(.35, .25, .12, matCor(0x7a5a3a), 0, 0, 0, g); CAVALO = { g, x: g.position.x, z: g.position.z, leg: false }; }
  function montarQuadro() { const r = acharSala('aula'); if (!r) return; const dados = tex(300, 150, () => {}); const pl = naParede(r, 1.4, .7, matTex(dados.t, 1, .3), 1.5); QUADRO = { dados, ult: -1 }; redrawQuadro(); pl.userData.leitura = { t: 'O quadro-negro da sala de aula. Alguém escreveu com giz.', parede: true }; }
  function redrawQuadro() { if (!QUADRO) return; const g = QUADRO.dados.g, m = totalMortes(); QUADRO.ult = m; g.fillStyle = '#14201a'; g.fillRect(0, 0, 300, 150); g.strokeStyle = 'rgba(235,232,220,.8)'; g.lineWidth = 3; g.font = '40px Georgia'; g.fillStyle = 'rgba(235,232,220,.85)'; g.fillText(T.quadro_lia, 20, 60); for (let i = 0; i < Math.min(30, m); i++) { const x = 20 + (i % 15) * 18, y = 90 + ((i / 15) | 0) * 30; g.beginPath(); g.moveTo(x, y); g.lineTo(x, y + 20); g.stroke(); } QUADRO.dados.t.needsUpdate = true; }
  function montarBrinquedos() { const r = acharSala('brinq'); if (!r) return; const sp = salaMeio(r); BRINQ = { x: sp.x, z: sp.z, gs: [], visto: false, virou: false }; for (let i = 0; i < 4; i++) { const g = new THREE.Group(); g.position.set(sp.x + rand(-1, 1), .04, sp.z + rand(-1, 1)); W.grupo.add(g); E.box(.1, .08, .1, matCor(0x8a6a4a), 0, 0, 0, g); BRINQ.gs.push(g); } }

  const quieto = { t: 0, x: 0, z: 0, sala: '' };
  function updateAmbiente(dt) {
    const s = S();
    if (BERCO && BERCO.g.parent) { const perto = dist(P.pos, { x: BERCO.x, z: BERCO.z }) < 3; if (perto && !s.flashOn) { BERCO.g.rotation.z = Math.sin(performance.now() / 400) * .12; if (!BERCO.leg) { BERCO.leg = true; leg(T.berco_leg); sfx('cantarola'); } } else BERCO.g.rotation.z *= .9; }
    if (CAVALO && CAVALO.g.parent) { const atras = dist(P.pos, { x: CAVALO.x, z: CAVALO.z }) < 3.5 && !olhando({ x: CAVALO.x, z: CAVALO.z }, .4); if (atras) { CAVALO.g.rotation.x = Math.sin(performance.now() / 350) * .14; if (!CAVALO.leg) { CAVALO.leg = true; leg(T.cavalo_leg); sfx('rangido'); } } else CAVALO.g.rotation.x *= .9; }
    if (QUADRO && totalMortes() !== QUADRO.ult) redrawQuadro();
    if (BRINQ && BRINQ.gs.length) { const perto = dist(P.pos, { x: BRINQ.x, z: BRINQ.z }) < 3; const vis = perto && olhando({ x: BRINQ.x, z: BRINQ.z }, .6) && s.flashOn; if (!vis && BRINQ.visto) { for (const g of BRINQ.gs) viraPara(g, P.pos); if (!BRINQ.virou) { BRINQ.virou = true; } } else if (vis && !BRINQ.legou && BRINQ.virou) { BRINQ.legou = true; leg(T.brinq_leg); } BRINQ.visto = vis; }
    // o nome sussurrado ao ficar parado muito tempo (uma vez por sala por noite)
    const mov = Math.hypot(P.pos.x - quieto.x, P.pos.z - quieto.z); quieto.x = P.pos.x; quieto.z = P.pos.z;
    if (quieto.sala !== sala()) { quieto.sala = sala(); quieto.t = 0; }
    if (mov < .02 && !ameaca() && sala()) quieto.t += dt; else quieto.t = Math.max(0, quieto.t - dt);
    const m = mem(); if (quieto.t > 45 && !m['quieto' + sala()]) { m['quieto' + sala()] = true; leg(T.quieto_leg); sussurro(K.atras(1.0), .5, .12); quieto.t = 0; }
    // a segunda respiração: escondida e prendendo o ar, uma segunda respiração junta-se à sua
    if (s.hidden && !m['resp2' + S().chapter] && !ameaca() && Math.random() < .002) { m['resp2' + S().chapter] = true; leg(T.respira2_leg); K.respiracao(K.atras(.4), 2.5, false, .3); }
  }

  // =====================================================================  ALUCINAÇÕES DE AMBIENTE (sons e pequenos sustos, um por sala/noite)
  // tipo: 'enter' (ao entrar), 'dark' (perto e com a lanterna apagada), 'lookaway' (perto, visto e depois sem olhar), 'idle' (parada perto)
  const AMB2_DEF = [
    { mapa: 'terreo', sala: 'cozinha', tipo: 'enter', sfx: 'panelaBate', leg: '[uma panela balança e bate na parede da cozinha]' },
    { mapa: 'terreo', sala: 'despensa', tipo: 'enter', sfx: 'metal', leg: '[uma lata rola sozinha pelo chão da despensa]' },
    { mapa: 'terreo', sala: 'biblio', tipo: 'lookaway', sfx: 'papel', leg: '[um livro caiu da estante atrás de você]' },
    { mapa: 'terreo', sala: 'refeit', tipo: 'dark', sfx: 'arrastar', leg: '[uma cadeira arrastou no escuro do refeitório]' },
    { mapa: 'terreo', sala: 'enferm', tipo: 'lookaway', sfx: 'vidro', leg: '[um frasco tombou da prateleira da enfermaria]' },
    { mapa: 'terreo', sala: 'copa', tipo: 'enter', sfx: 'raloCano', leg: '[a torneira da copa pinga sozinha, escuro]' },
    { mapa: 'terreo', sala: 'corr', tipo: 'idle', sfx: 'rangido', leg: '[uma maçaneta mexeu sozinha, numa porta trancada]' },
    { mapa: 'terreo', sala: 'patio', tipo: 'dark', sfx: 'cano', leg: '[a corrente de um balanço range no pátio]' },
    { mapa: 'terreo', sala: 'aula', tipo: 'dark', sfx: 'caneta', leg: '[o giz rangeu sozinho na lousa]' },
    { mapa: 'terreo', sala: 'hall', tipo: 'enter', sfx: 'passo', leg: '[passos no andar vazio de cima]' },
    { mapa: 'superior', sala: 'celeste', tipo: 'idle', sfx: 'tercoBalanca', leg: '[o terço pendurado balança sozinho]' },
    { mapa: 'superior', sala: 'dep', tipo: 'lookaway', sfx: 'rangido', leg: '[uma cadeirinha virou pra você no depósito]' },
    { mapa: 'superior', sala: 'sotao', tipo: 'enter', sfx: 'passo', leg: '[os degraus rangem, contando atrás de você]' },
    { mapa: 'superior', sala: 'brinq', tipo: 'dark', sfx: 'caixinha', leg: '[a caixinha de música soltou uma nota sozinha]' },
    { mapa: 'superior', sala: 'dormA', tipo: 'dark', sfx: 'suspiro', leg: '[alguém suspirou numa das camas]' },
    { mapa: 'superior', sala: 'banhS', tipo: 'dark', sfx: 'raloCano', leg: '[uma torneira abriu sozinha no banheiro]' },
    { mapa: 'superior', sala: 'corr', tipo: 'idle', sfx: 'assobio', leg: '[um assobio baixo no fim do corredor]' },
    { mapa: 'superior', sala: 'dormD', tipo: 'lookaway', sfx: 'suspiro', leg: '[um travesseiro ainda com a marca de uma cabeça]' },
    { mapa: 'tuneis', sala: '*', tipo: 'idle', sfx: 'tique', leg: '[uma gota cai no ritmo do seu coração]' },
    { mapa: 'tuneis', sala: '*', tipo: 'dark', sfx: 'arrastar', leg: '[uma corrente arrasta no escuro do túnel]' },
    { mapa: 'tuneis', sala: '*', tipo: 'enter', sfx: 'respiracoes', leg: '[uma respiração atrás da parede do túnel]' },
    { mapa: 'cemiterio', sala: 'capela', tipo: 'dark', sfx: 'estalo', leg: '[uma vela do altar reacendeu sozinha]' },
    { mapa: 'cemiterio', sala: 'cem', tipo: 'lookaway', sfx: 'arrastar', leg: '[a terra de um túmulo se mexeu quando você virou as costas]' },
    { mapa: 'cemiterio', sala: 'capela', tipo: 'idle', sfx: 'coroCapela', leg: '[um coro baixo, vindo de lugar nenhum]' },
    { mapa: 'cemiterio', sala: 'cem', tipo: 'enter', sfx: 'sinoLonge', leg: '[um sino, muito longe, uma vez só]' }
  ];
  let amb2 = [];
  function montarAmbiente2() {
    amb2 = [];
    for (let i = 0; i < AMB2_DEF.length; i++) {
      const d = AMB2_DEF[i]; if (d.mapa !== W.mapa) continue;
      let pt = null; if (d.sala !== '*') { const r = acharSala(d.sala); if (!r) continue; pt = salaMeio(r); }
      amb2.push({ d, i, pt, visto: false, idleT: 0 });
    }
  }
  function updateAmbiente2(dt) {
    if (!amb2.length || ameaca()) return; const m = mem(); const s = S();
    for (const e of amb2) {
      const key = 'amb2_' + e.i; if (m[key]) continue;
      const alvo = e.pt || K.atras(1.2);
      const perto = e.d.sala === '*' ? true : dist(P.pos, e.pt) < 4.2;
      if (!perto) { e.visto = false; e.idleT = 0; continue; }
      const naSala = e.d.sala === '*' || sala() === e.d.sala;
      let fire = false;
      if (e.d.tipo === 'enter') fire = naSala;
      else if (e.d.tipo === 'dark') fire = naSala && !s.flashOn;
      else if (e.d.tipo === 'lookaway') { const olha = s.flashOn && olhando(alvo, .6); if (olha) e.visto = true; else if (e.visto) fire = true; }
      else if (e.d.tipo === 'idle') { const mov = Math.hypot(P.pos.x - (e.lx ?? P.pos.x), P.pos.z - (e.lz ?? P.pos.z)); e.lx = P.pos.x; e.lz = P.pos.z; if (mov < .02) e.idleT += dt; else e.idleT = 0; fire = e.idleT > 6; }
      if (fire) { m[key] = true; leg(e.d.leg); sfx(e.d.sfx, alvo.x, alvo.z); if (s.fear !== undefined) s.fear = Math.min(100, s.fear + 4); }
    }
  }

  // =====================================================================  HOOKS
  const seguro = K.seguro || (fn => (...a) => { try { return fn(...a); } catch (e) { console.warn('[sustos2]', e && e.message); } });
  document.addEventListener('keydown', seguro(onKey));

  let salaAnt = null;
  const update = seguro((dt) => {
    const s = S(); if (!jogando()) { vinheta(false); return; }
    if (P.room !== salaAnt) { salaAnt = P.room; talvezChamada(); talvezOnze(); segundaLiaCorredor(); }
    if (W.mapa === 'terreo' && s.chapter === 1) { const e = !!(s.flags && s.flags.energia); if (e && !JAN.antes) silhuetasJanela(); JAN.antes = e; }
    updateEspelho(dt); updateTV(dt); updateFoto(dt); updateLencol(dt); updatePegadas(); passouPortaC(); updateSapatos(dt); updateProcDez(); updateSombra(dt); updateChamada(dt); updateCosteira(); updateAmbiente(dt); updateAmbiente2(dt);
  });
  const novoMapa = seguro((id) => {
    const s = S(); if (!s) return;
    salaAnt = null; bat.escondido = null; TV = null; FOTO = null; LENCOL = null; PORTAC = null; SAPATOS = null; SOMB = null; COST = null; BERCO = null; CAVALO = null; QUADRO = null; BRINQ = null; procDez.g = null; procDez.feito = false; ESP.length = 0; FECH.length = 0; cheioArm = null; trancaArm = null; JAN.antes = !!(s.flags && s.flags.energia); quieto.sala = '';
    montarEspelho('banhS'); montarEspelho('patamar'); montarTV(); montarGravador(); montarLencol(); montarPegadas(); montarPortaConta(); montarLata(); montarSapatos(); montarCheio(); montarTranca();
    montarLuneta(); montarSombra(); montarCosteira(); montarBonecaResp(); montarFila(); montarFuroTerreo(); montarBerco(); montarCavalo(); montarQuadro(); montarBrinquedos();
    montarFechadura('diret'); montarFechadura('celeste'); montarAmbiente2();
    if (id === 'terreo') montarFoto('refeit');
    if (id === 'superior') montarFoto('corr');
  });
  const morte = seguro((quem) => {
    const s = S(); if (!s || !P.room) return; const r = P.room;
    lsMuda(o => { o.mortesTotal = (o.mortesTotal || 0) + 1; o.ultima = { quem, mapa: W.mapa, sala: r.id, salaNome: r.nome || '' }; if (W.mapa === 'superior' && (r.id || '').startsWith('dorm')) o.dormiuCamaF = o.dormiuCamaF; });
  });
  const aoEscH = seguro(L => {
    aoEsconder(L); const m = mem(); if (!L) return;
    if (W.mapa === 'superior' && L.tipo === 'cama') lsMuda(o => { o.dormiuCamaF = true; });
    // o armário trancado por fora (túneis): depois de 3s alguém tranca, unhas, a voz do Albano, e abre sozinho
    if (trancaArm && L === trancaArm && !m.tranca && !ameaca() && !teste()) {
      m.tranca = true;
      K.depois(3, () => { if (S().hidden !== L) return; leg(T.tranca_leg); sfx('trancado'); vibrar([30, 40, 30, 40, 30, 40]); });
      K.depois(3.6, () => { if (S().hidden !== L) return; for (let i = 0; i < 4; i++) K.depois(i * .5, () => sfx('armario')); });
      K.depois(5.5, () => { if (S().hidden !== L) return; E.sub('voz', T.tranca_albano); conquista('l4b_trancada'); });
    }
    // o armário "tá cheio" (longe do caminho): na primeira tentativa uma mão fecha por dentro e te põe pra fora
    if (cheioArm && L === cheioArm && !ameaca()) {
      m.cheioTent = (m.cheioTent || 0) + 1;
      if (m.cheioTent === 1 && !teste()) { K.depois(.15, () => { try { E.sairEsconderijo(); } catch (e) {} E.sub('voz', T.cheio_leg); sfx('armario'); vibrar(60); }); }
      else if (m.cheioTent === 2) { K.depois(.8, () => { try { if (P.shake !== undefined) P.shake = Math.max(P.shake, .05); } catch (e) {} E.toast(T.cheio_bilhete); }); }
    }
  });
  const aoSairH = seguro(() => aoSair());
  const aoPasso = seguro(() => { });

  return {
    update, novoMapa, morte, aoPasso, aoEsconder: aoEscH, aoSair: aoSairH,
    garrafaBateu: seguro(garrafaBateu),
    _t: { RARAS2, rara, mem, silhuetasJanela, talvezChamada, talvezOnze, garrafaBateu, totalMortes }
  };
}
