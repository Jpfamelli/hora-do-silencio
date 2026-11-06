// Fumaça do módulo src/progressao-lote7.js (Calor, Dádivas, fim de capítulo, final): node ferramentas/smoke-l7.mjs .
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
const require = createRequire('C:/Users/USER/.claude/backups/jogo-terror-qa/package.json');
const puppeteer = require('puppeteer-core');
const aqui = path.dirname(fileURLToPath(import.meta.url));
const raiz = path.resolve(process.argv[2] || path.join(aqui, '..'));
const TIPOS = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.svg': 'image/svg+xml' };
const srv = http.createServer((req, res) => { let p = decodeURIComponent(req.url.split('?')[0]); if (p.endsWith('/')) p += 'index.html'; const f = path.join(raiz, p); if (!f.startsWith(raiz) || !fs.existsSync(f)) { res.writeHead(404); return res.end(); } res.writeHead(200, { 'Content-Type': TIPOS[path.extname(f)] || 'application/octet-stream', 'Cache-Control': 'no-store' }); fs.createReadStream(f).pipe(res); });
await new Promise(r => srv.listen(0, r));
const url = `http://localhost:${srv.address().port}/`;
const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', protocolTimeout: 300000, args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--autoplay-policy=no-user-gesture-required'] });
let ok = true;
try {
  const page = await browser.newPage(); await page.setViewport({ width: 1280, height: 720 });
  const erros = []; page.on('pageerror', e => erros.push('pageerror: ' + e.message));
  page.on('console', m => { if (m.type() === 'error' && !/favicon|404|AudioContext/.test(m.text())) erros.push('console: ' + m.text()); });
  await page.goto(url, { waitUntil: 'networkidle0', timeout: 120000 });
  await page.waitForFunction(() => window.__jogo, { timeout: 60000 });
  await page.evaluate(() => import('/ferramentas/teste.js'));
  page.setDefaultTimeout(0);
  const r = await page.evaluate(async () => {
    const out = [], J = window.__jogo, T = window.T;
    const { L7 } = await import('/src/progressao-lote7.js');
    const ok = (n, c) => out.push((c ? 'ok ' : 'FALHOU ') + n);
    L7.titulo(); ok('botão A Casa no título', !!document.getElementById('b-l7'));
    document.getElementById('b-l7').click(); ok('painel A Casa abre', !document.getElementById('painel').hidden && /Calor/.test(document.getElementById('pn-lista').textContent));
    for (const a of ['dadivas', 'estrelas', 'estilo', 'mortes', 'sementes', 'calendario', 'altar', 'modos', 'calor']) { const b = document.querySelector(`[data-act=aba][data-v=${a}]`); b.click(); ok('aba ' + a, document.getElementById('pn-lista').textContent.length > 40); }
    document.getElementById('painel').hidden = true; document.getElementById('title').hidden = false;
    await T.novo(); const S = J.S;
    ok('S.l7 criado no novo jogo', !!S.l7 && S.l7.bingo.length === 9);
    for (let i = 0; i < 30; i++) L7.tick(0.1);
    ok('ruidoMul neutro sem cartas', L7.ruidoMul() === 1);
    // dá cartas à força e confere os efeitos
    S.l7.dad = ['pes_la', 'folego_longo']; ok('ruidoMul com Pés de Lã + Fôlego Longo', Math.abs(L7.ruidoMul() - .75 * .9 * .85) < 1e-6);
    const v = { vel: 1, ouvido: 1, dano: 1, pilha: 1, aviso: 7, intervalo: 1 }; L7.difMod(v, S); ok('difMod muda a pilha', v.pilha > 1.2);
    S.l7.calor = 6; ok('difKey muda com o Calor', L7.difKey(S).includes(',6,'));
    // fim de capítulo e escolha
    S.chapter = 1; S.capT = 400; S.capDano = 0; S.capVisto = 0;
    const cap = window.ROTEIRO.capitulos[1], r0 = { letra: 'S', tEf: 300, meta: { s: 8, a: 13 }, selos: { intocada: true, rapida: true } };
    document.getElementById('fimcap').hidden = false;
    const linhas = L7.fimCap(cap, r0); ok('fimCap devolve linhas', linhas.length >= 2);
    ok('cartas montadas no fim do capítulo', document.querySelectorAll('#l7-fc .l7-carta').length >= 3);
    ok('espera maior com cartas (fora do QA o jogo espera)', L7.espera() >= 6400);
    document.querySelector('#l7-fc [data-k=c]').click(); ok('escolher carta grava na noite', S.l7.dad.length >= 1 || !!S.l7.trato);
    document.querySelector('#l7-fc [data-k=a]').click(); ok('aposta registrada', !!S.l7.aposta);
    document.getElementById('fimcap').hidden = true;
    L7.pausa(); L7.statsLinhas();
    L7.morte('inspetor'); L7.morte('ana'); L7.morte('procissao');
    // final
    S.chapter = 5; S.completo = true; S.tempo = 2000; S.mortes = 0; S.l6_pontos = 10000; S.dif = 'normal'; S.l7.dp = 'semcorrer'; S.l7.hz = 1; S.l7.alvo = { sem: 'ABCDE', dif: 'N', seg: 3000, nome: 'AMIGO' };
    S.l7.aposta = { id: 'sem_morrer', cap: 5 };
    L7.final('verdadeiro'); ok('final calcula epíteto', !!S.l7.ep && S.l7.total > 0);
    L7.telaFinal('verdadeiro'); ok('tela final mostra relíquias', document.querySelectorAll('#l7-rel [data-r]').length === 4);
    document.querySelector('#l7-rel [data-r]').click(); ok('relíquia fica para a próxima noite', !!JSON.parse(localStorage.getItem('hora-silencio-l7')).rel);
    ok('alvo vencido registrado', S.l7.alvoRes && S.l7.alvoRes.venceu);
    L7.novoJogo(J.S); ok('novoJogo seguinte lê a relíquia', !!J.S.l7.rel);
    L7.titulo(); ok('faixa do título', !document.getElementById('l7-faixa').hidden);
    return { out, errs: T.errs || [] };
  });
  for (const l of r.out) console.log(l);
  if (r.out.some(l => l.startsWith('FALHOU'))) ok = false;
  if (erros.length || r.errs.length) { console.log('ERROS:', [...new Set([...erros, ...r.errs])]); ok = false; }
  console.log(ok ? 'SMOKE L7: PASSOU' : 'SMOKE L7: FALHOU');
} finally { await browser.close(); srv.close(); }
process.exit(ok ? 0 : 1);
