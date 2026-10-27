// QA automático: serve a pasta do jogo, abre no Chrome headless, joga do começo ao fim e tira capturas.
// Uso: node ferramentas/qa.mjs [pasta-do-jogo] [--shots pasta] [--sobrevivencia]
// Sai com código 1 se algo falhar.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const require = createRequire('C:/Users/USER/.claude/backups/jogo-terror-qa/package.json');
const puppeteer = require('puppeteer-core');
const aqui = path.dirname(fileURLToPath(import.meta.url));
const argv = process.argv.slice(2);
const raiz = path.resolve(argv.find(a => !a.startsWith('--') && argv[argv.indexOf(a) - 1] !== '--shots') || path.join(aqui, '..'));
const shots = argv.includes('--shots') ? path.resolve(argv[argv.indexOf('--shots') + 1]) : null;
const TIPOS = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.ogg': 'audio/ogg', '.mp3': 'audio/mpeg', '.wav': 'audio/wav', '.svg': 'image/svg+xml' };

const srv = http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]); if (p.endsWith('/')) p += 'index.html';
  const f = path.join(raiz, p);
  if (!f.startsWith(raiz) || !fs.existsSync(f)) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'Content-Type': TIPOS[path.extname(f)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
  fs.createReadStream(f).pipe(res);
});
await new Promise(r => srv.listen(0, r));
const url = `http://localhost:${srv.address().port}/`;

const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', protocolTimeout: 1200000, args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--autoplay-policy=no-user-gesture-required', '--disable-background-timer-throttling', '--disable-renderer-backgrounding', '--disable-backgrounding-occluded-windows', '--disable-features=IntensiveWakeUpThrottling'] });
let falhou = false;
try {
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 720 });
  const erros = [];
  page.on('pageerror', e => erros.push('pageerror: ' + e.message));
  page.on('console', m => { if (m.text().startsWith('[QA]')) console.log(m.text()); if (m.type() === 'error' && !/favicon|404|AudioContext/.test(m.text())) erros.push('console: ' + m.text()); });
  await page.goto(url, { waitUntil: 'networkidle0', timeout: 60000 });
  await page.waitForFunction(() => window.__jogo, { timeout: 30000 });
  await page.evaluate(() => import('/ferramentas/teste.js'));
  if (shots) { fs.mkdirSync(shots, { recursive: true }); await page.screenshot({ path: path.join(shots, '00-titulo.png') }); }
  page.setDefaultTimeout(0);
  const r = await page.evaluate(() => window.T.tudo());
  for (const l of r.log) console.log(l);
  if (shots) {
    for (const [i, [mapa, sp, cap]] of [['estrada', 'inicio', 0], ['terreo', 'inicio', 1], ['superior', 'escada', 3], ['tuneis', 'entrada', 4], ['cemiterio', 'tuneis', 5]].entries()) {
      await page.evaluate((m, s, c) => { const J = window.__jogo; J.S.chapter = c; J.S.dead = false; J.S.fim = false; J.S.inv.lanterna = true; J.S.flashOn = true; J.S.battery = 100; J.carregarMapa(m, s); window.T.passo(1); }, mapa, sp, cap);
      await page.screenshot({ path: path.join(shots, `${String(i + 1).padStart(2, '0')}-${mapa}.png`) });
    }
  }
  if (argv.includes('--sobrevivencia')) {
    const s = await page.evaluate(async () => { const T = window.T, J = window.__jogo; await T.novo(); J.S.chapter = 2; J.S.flags.energia = true; J.carregarMapa('terreo', 'inicio'); J.ativarInspetor(-20, -12); await T.ate(() => false, 20, true); return T.errs; });
    if (s.length) { console.log('ERROS NA SOBREVIVÊNCIA:', s); falhou = true; }
  }
  const todos = [...erros, ...r.errs];
  if (todos.length) { console.log('ERROS:\n' + [...new Set(todos)].join('\n')); falhou = true; }
  if (r.avisos.length) console.log('AVISOS:\n' + [...new Set(r.avisos)].join('\n'));
  if (r.log.some(l => !l.startsWith('OK'))) falhou = true;
  console.log(falhou ? 'RESULTADO: FALHOU' : 'RESULTADO: PASSOU');
} finally { await browser.close(); srv.close(); }
process.exit(falhou ? 1 : 0);
