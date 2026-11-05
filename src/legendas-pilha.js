// Revisão do Lote 5: as legendas próprias dos módulos de monstros (#ml-leg, #l5-leg, #l5b-leg, #ms-leg)
// são fixas em porcentagens diferentes e caíam por cima da pilha de legendas de som (#legsom), ficando
// ilegíveis. Este arquivo só reposiciona: as que estiverem visíveis sobem para logo acima da pilha, uma
// sobre a outra. Não escreve texto, não lê estado do jogo e à prova de erro.
const IDS = ['ml-leg', 'l5-leg', 'l5b-leg', 'ms-leg'];
export function instalarLegendasPilha() {
  if (window.__legPilha) return; window.__legPilha = true;
  let ult = '';
  function ajustar() {
    try {
      const vis = IDS.map(id => document.getElementById(id)).filter(e => e && parseFloat(e.style.opacity || 0) > .05 && e.textContent.trim());
      if (!vis.length) { ult = ''; return; }
      const ls = document.getElementById('legsom'), r = ls && ls.textContent.trim() ? ls.getBoundingClientRect() : null;
      let base = r && r.height ? innerHeight - r.top + 8 : innerHeight * .26;
      const chave = vis.map(e => e.id + e.textContent).join('|') + '@' + Math.round(base);
      if (chave === ult) return; ult = chave;
      for (const e of vis) { e.style.bottom = Math.round(base) + 'px'; base += (e.offsetHeight || 22) + 4; }
    } catch (e) { /* cosmético: nunca quebra o jogo */ }
  }
  setInterval(ajustar, 150);
}
instalarLegendasPilha();
