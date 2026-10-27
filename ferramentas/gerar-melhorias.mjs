// Gera MELHORIAS.md a partir de melhorias/lote*/<area>.md
// Uso: node ferramentas/gerar-melhorias.mjs   (na pasta do jogo)
// Cada linha que começa com "- " num arquivo de área conta como uma melhoria.
// A numeração é contínua dentro de cada lote.
import fs from 'node:fs';
import path from 'node:path';

const RAIZ = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')), '..');
const PASTA = path.join(RAIZ, 'melhorias');
const ORDEM = ['historia', 'mapa-estrada', 'mapa-internato', 'mapa-subterraneo', 'monstros', 'sustos', 'audio', 'visual', 'jogabilidade', 'interface', 'progressao', 'plataforma'];

const lotes = fs.readdirSync(PASTA).filter(d => /^lote\d+$/.test(d)).sort((a, b) => +a.slice(4) - +b.slice(4));
const dados = lotes.map(l => {
  const arqs = fs.readdirSync(path.join(PASTA, l)).filter(f => f.endsWith('.md'))
    .sort((a, b) => { const ia = ORDEM.indexOf(a.slice(0, -3)), ib = ORDEM.indexOf(b.slice(0, -3)); return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib) || a.localeCompare(b); });
  const areas = arqs.map(f => {
    const txt = fs.readFileSync(path.join(PASTA, l, f), 'utf8').split(/\r?\n/);
    const tit = (txt.find(x => x.startsWith('# ')) || f).replace(/^#\s*/, '').replace(/^Lote \d+\s*[—-]\s*/, '');
    const itens = txt.filter(x => x.startsWith('- ')).map(x => x.slice(2).trim());
    return { id: f.slice(0, -3), tit, itens };
  });
  return { lote: l, n: +l.slice(4), areas, total: areas.reduce((s, a) => s + a.itens.length, 0) };
});
const geral = dados.reduce((s, d) => s + d.total, 0);

const L = [];
L.push('# A Hora do Silêncio — melhorias', '');
L.push('Lista gerada por `node ferramentas/gerar-melhorias.mjs` a partir de `melhorias/lote*/<área>.md`. Não edite à mão: edite o arquivo da área e gere de novo.', '');
L.push(`**Total geral: ${geral} melhorias**`, '');
L.push('## Índice', '');
for (const d of dados) {
  L.push(`- [Lote ${d.n}](#lote-${d.n}) — ${d.total} melhorias`);
  for (const a of d.areas) L.push(`  - ${a.tit}: ${a.itens.length}`);
}
L.push('');
for (const d of dados) {
  L.push(`## Lote ${d.n}`, '', `${d.total} melhorias.`, '');
  let k = 0;
  for (const a of d.areas) {
    L.push(`### ${a.tit} (${a.itens.length})`, '');
    for (const it of a.itens) L.push(`${++k}. ${it}`);
    L.push('');
  }
}
fs.writeFileSync(path.join(RAIZ, 'MELHORIAS.md'), L.join('\n'));
console.log('MELHORIAS.md: total geral', geral, dados.map(d => `lote ${d.n}: ${d.total}`).join(', '));
