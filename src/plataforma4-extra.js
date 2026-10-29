// A HORA DO SILÊNCIO — Lote 4: as salas secretas pesadas (desenho em canvas).
// Carregado por import() só quando o jogador abre um segredo, para não pesar a abertura.
// criarExtra(C, { sfx, conq, seg, guardaSeg, noTitulo, vibrar }) devolve { salaDeTestes, galeria, visita1978 }.

export function criarExtra(C, H) {
  const sfx = H.sfx, conq = H.conq;
  function telaCheia(desenhar, aoFechar, raf) {
    const tela = document.createElement('div'); tela.className = 's4-tela';
    const c = document.createElement('canvas'); tela.appendChild(c);
    const btn = document.createElement('button'); btn.className = 's4-voltar'; btn.textContent = 'VOLTAR';
    document.body.appendChild(tela); document.body.appendChild(btn);
    const g = c.getContext('2d'); const res = () => { c.width = Math.min(innerWidth, 1100); c.height = Math.min(innerHeight, 700); }; res(); addEventListener('resize', res);
    let on = true;
    function fechar() { if (!on) return; on = false; tela.remove(); btn.remove(); removeEventListener('keydown', onEsc); if (aoFechar) aoFechar(); }
    btn.onclick = fechar; const onEsc = e => { if (e.key === 'Escape') { e.preventDefault(); fechar(); } }; addEventListener('keydown', onEsc, true);
    if (raf) { (function loop(t) { if (!on) return; requestAnimationFrame(loop); desenhar(g, c, t); })(0); } else desenhar(g, c, 0);
    return { fechar, get vivo() { return on; }, canvas: c };
  }

  // -------- SALA DE TESTES (bastidores) -----------------------------------
  function salaDeTestes() {
    if (H.seg.sala) {} H.seg.sala = 1; H.guardaSeg(); conq('s4_bastidores'); sfx('clique');
    let mouseFora = false, colado = 0, piscaT = 0, luzOn = true;
    const t = telaCheia((g, c, now) => {
      const W = c.width, Hh = c.height; g.fillStyle = luzOn ? '#4a4a4a' : '#101010'; g.fillRect(0, 0, W, Hh);
      // chão em grade (cubos sem textura)
      g.strokeStyle = luzOn ? 'rgba(255,255,255,.08)' : 'rgba(255,255,255,.03)'; g.lineWidth = 1;
      for (let i = 0; i <= 20; i++) { const x = i / 20 * W; g.beginPath(); g.moveTo(x, Hh * .55); g.lineTo(W / 2 + (x - W / 2) * 2.4, Hh); g.stroke(); }
      for (let j = 0; j < 8; j++) { const y = Hh * .55 + (Hh * .45) * (j / 8) * (j / 8); g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); }
      // cubos cinza sem textura
      g.fillStyle = luzOn ? '#5e5e5e' : '#1a1a1a'; g.strokeStyle = 'rgba(0,0,0,.4)';
      [[W * .16, Hh * .5, 70], [W * .78, Hh * .46, 90], [W * .3, Hh * .72, 120]].forEach(([x, y, s]) => { g.fillRect(x, y, s, s); g.strokeRect(x, y, s, s); });
      // placas
      g.fillStyle = luzOn ? '#c9c2a8' : '#2a2a2a'; g.font = 'bold 20px monospace'; g.textAlign = 'left';
      g.fillText('TESTE DE LUZ 01', W * .1, Hh * .3); g.fillText('COLISÃO OK', W * .62, Hh * .24);
      g.fillStyle = '#8e1b14'; g.font = 'bold 28px monospace'; g.textAlign = 'center';
      g.fillText('SALA DE TESTES — NÃO ENTRE', W / 2, 42);
      // Inspetor manequim: parado e cinza; quando o mouse sai da tela, a luz pisca e ele cola
      if (mouseFora) { piscaT += 1 / 60; if (piscaT > .4) { luzOn = false; colado = Math.min(1, colado + .06); } } else { luzOn = true; piscaT = 0; colado = Math.max(0, colado - .02); }
      const bx = W / 2, by = Hh * .66, esc = 1 + colado * 2.2, alpha = .35 + colado * .6;
      g.save(); g.globalAlpha = alpha; g.fillStyle = luzOn ? '#6b6b6b' : '#070707'; g.translate(bx, by); g.scale(esc, esc);
      g.beginPath(); g.ellipse(0, -70, 16, 20, 0, 0, 7); g.fill(); // cabeça
      g.fillRect(-26, -50, 52, 70); // tronco
      g.fillRect(-60, -46, 34, 12); g.fillRect(26, -46, 34, 12); // braços abertos (manequim)
      g.fillRect(-18, 20, 14, 46); g.fillRect(4, 20, 14, 46); // pernas
      g.restore();
      if (colado > .9 && !luzOn) { g.fillStyle = '#000'; g.fillRect(0, 0, W, Hh); g.fillStyle = '#8e1b14'; g.font = 'bold 26px monospace'; g.textAlign = 'center'; g.fillText('ele estava bem atrás.', W / 2, Hh / 2); }
    }, () => { document.removeEventListener('mouseout', fora); document.removeEventListener('mouseover', dentro); }, true);
    const fora = e => { if (!e.relatedTarget && !e.toElement) mouseFora = true; }; const dentro = () => mouseFora = false;
    document.addEventListener('mouseout', fora); document.addEventListener('mouseover', dentro);
  }

  // -------- GALERIA (modelos girando, luz pela posição do mouse) -----------
  function galeria() {
    H.seg.galeria = 1; H.guardaSeg(); conq('s4_galeria'); sfx('sussurros');
    const fichas = [['O INSPETOR', 'Moacir. Nove anos em 1947, bedel em 1979. Cego. Ouve até o pensamento.'], ['A MENINA QUE CONTA', 'Ana. Conta até dez. Só anda quando ninguém a vê na luz.'], ['A PROCISSÃO', 'As nove badaladas. Atravessa as salas. Fora do esconderijo, é a morte.'], ['O BREU', 'A luz do prédio inteiro, que um dia apagou e não voltou.']];
    let mx = .5, my = .5, idle = 0, virou = false, ang = 0; const alvo = 0;
    const onMove = e => { mx = e.clientX / innerWidth; my = e.clientY / innerHeight; idle = 0; virou = false; };
    addEventListener('mousemove', onMove);
    telaCheia((g, c, now) => {
      const W = c.width, Hh = c.height; g.fillStyle = '#060606'; g.fillRect(0, 0, W, Hh);
      ang += .004; idle += 1 / 60; const i = (Math.floor(now / 4000) % fichas.length);
      // luz de lanterna seguindo o mouse
      const lx = mx * W, ly = my * Hh; const gr = g.createRadialGradient(lx, ly, 10, lx, ly, 360); gr.addColorStop(0, 'rgba(255,248,230,.16)'); gr.addColorStop(1, 'transparent'); g.fillStyle = gr; g.fillRect(0, 0, W, Hh);
      // silhueta girando
      g.save(); g.translate(W / 2, Hh * .52); const s = 1 + .08 * Math.sin(now / 900); g.scale(s, s);
      g.fillStyle = 'rgba(120,118,110,.5)'; g.rotate(Math.sin(ang) * .4);
      let cabX = 0; if (i === 0 && idle > 2 && !virou) { virou = true; sfx('risada'); } if (i === 0 && virou) cabX = (lx - W / 2) * .03;
      g.beginPath(); g.ellipse(cabX, -92, 20, 26, 0, 0, 7); g.fill(); g.fillRect(-32, -64, 64, 92); g.fillRect(-74, -58, 44, 14); g.fillRect(30, -58, 44, 14); g.fillRect(-22, 28, 18, 60); g.fillRect(4, 28, 18, 60); g.restore();
      // ficha
      g.textAlign = 'center'; g.fillStyle = '#c9c2a8'; g.font = '26px "IM Fell English SC", Georgia, serif'; g.fillText(fichas[i][0], W / 2, Hh - 110);
      g.fillStyle = '#8a7f68'; g.font = '16px "IM Fell English", Georgia, serif';
      const palavras = fichas[i][1].split(' '); let linha = '', y = Hh - 82; for (const p of palavras) { if ((linha + p).length > 56) { g.fillText(linha, W / 2, y); y += 22; linha = ''; } linha += p + ' '; } g.fillText(linha, W / 2, y);
      g.fillStyle = '#555'; g.font = '13px monospace'; g.fillText('mexa o mouse: a lanterna segue · ESC volta', W / 2, 26);
    }, () => removeEventListener('mousemove', onMove), true);
  }

  // -------- VISITA DE 1978 (o internato de dia, antes) ---------------------
  function visita1978() {
    H.seg.v1978 = 1; H.guardaSeg(); sfx('clique');
    let t0 = performance.now(), cortou = false;
    const t = telaCheia((g, c, now) => {
      const W = c.width, Hh = c.height; const seg = (performance.now() - t0) / 1000;
      if (seg > 18 && !cortou) { cortou = true; sfx('badaladas'); }
      if (cortou) { g.fillStyle = '#000'; g.fillRect(0, 0, W, Hh); g.fillStyle = '#8e1b14'; g.textAlign = 'center'; g.font = '26px "IM Fell English SC", Georgia, serif'; g.fillText('21h — o sino tocou e tudo virou ruína.', W / 2, Hh / 2); return; }
      // parede quente, luz de dia
      const gr = g.createLinearGradient(0, 0, 0, Hh); gr.addColorStop(0, '#caa36a'); gr.addColorStop(1, '#8a6a3c'); g.fillStyle = gr; g.fillRect(0, 0, W, Hh);
      g.fillStyle = 'rgba(255,240,200,.25)'; for (let i = 0; i < 4; i++) { g.fillRect(W * (.12 + i * .2), Hh * .18, W * .08, Hh * .4); } // janelas
      // lousa com giz novo
      g.fillStyle = '#243024'; g.fillRect(W * .32, Hh * .3, W * .36, Hh * .3);
      g.strokeStyle = '#eee'; g.lineWidth = 2; g.font = '26px "Special Elite", monospace'; g.fillStyle = '#eee'; g.textAlign = 'center';
      g.fillText('14 de março — festa!', W / 2, Hh * .45);
      g.fillStyle = '#4a3a22'; g.textAlign = 'center'; g.font = '16px "IM Fell English", Georgia, serif';
      g.fillText('(crianças rindo em algum corredor — você não vê nenhuma)', W / 2, Hh * .72);
      g.fillStyle = 'rgba(40,30,18,.6)'; g.font = '14px monospace'; g.fillText('relógio: ' + Math.min(21, 20 + seg / 18).toFixed(0) + 'h · ESC volta', W / 2, 26);
    }, null, true);
  }

  return { salaDeTestes, galeria, visita1978 };
}
