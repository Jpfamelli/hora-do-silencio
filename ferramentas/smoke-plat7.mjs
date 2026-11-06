// Fumaça do módulo src/plataforma-lote7.js (som e atmosfera na plataforma): node ferramentas/smoke-plat7.mjs .
// Abre o jogo como se fosse uma pessoa de verdade (sem o aviso de robô), passa pela calibragem do som e confere o grafo de áudio.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
const require = createRequire('C:/Users/USER/.claude/backups/jogo-terror-qa/package.json');
const puppeteer = require('puppeteer-core');
const aqui = path.dirname(fileURLToPath(import.meta.url));
const raiz = path.resolve(process.argv[2] || path.join(aqui, '..'));
const TIPOS = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.svg': 'image/svg+xml', '.webmanifest': 'application/manifest+json' };
const srv = http.createServer((req, res) => { let p = decodeURIComponent(req.url.split('?')[0]); if (p.endsWith('/')) p += 'index.html'; const f = path.join(raiz, p); if (!f.startsWith(raiz) || !fs.existsSync(f)) { res.writeHead(404); return res.end(); } res.writeHead(200, { 'Content-Type': TIPOS[path.extname(f)] || 'application/octet-stream', 'Cache-Control': 'no-store' }); fs.createReadStream(f).pipe(res); });
await new Promise(r => srv.listen(0, r));
const url = `http://localhost:${srv.address().port}/`;
const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', timeout: 240000, protocolTimeout: 300000, args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--autoplay-policy=no-user-gesture-required'] });
let ok = true;
const erros = [];
const pausa = ms => new Promise(r => setTimeout(r, ms));
try {
  const page = await browser.newPage(); await page.setViewport({ width: 1280, height: 720 });
  await page.evaluateOnNewDocument(() => { Object.defineProperty(navigator, 'webdriver', { get: () => false }); });
  page.on('pageerror', e => erros.push('pageerror: ' + e.message));
  page.on('console', m => { if (m.type() === 'error' && !/favicon|404|AudioContext|autoplay/.test(m.text())) erros.push('console: ' + m.text()); });
  await page.goto(url, { waitUntil: 'networkidle0', timeout: 120000 });
  await page.waitForFunction(() => window.__jogo && window.__plat && window.__plat.P7, { timeout: 240000 });
  const saidas = [];
  const ver = (n, c) => { saidas.push((c ? 'ok ' : 'FALHOU ') + n); if (!c) ok = false; };
  const tres = await page.evaluate(() => ({ cdn: window.__cdn, three: performance.getEntriesByType('resource').some(r => /vendor\/three\.module\.min\.js/.test(r.name)) }));
  ver('Three.js vem da pasta vendor (' + tres.cdn + ')', tres.cdn === 'local' && tres.three);
  // portal: o primeiro clique liga o áudio e abre o assistente de calibragem
  await page.evaluate(() => { const p = document.getElementById('portal'); if (p && !p.hidden) p.click(); });
  await pausa(900);
  ver('assistente abre na primeira vez', await page.evaluate(() => { const c = document.getElementById('p7-cal'); return !!c && !c.hidden && /Como você está ouvindo/.test(c.textContent); }));
  ver('assistente tem role=dialog', await page.evaluate(() => document.getElementById('p7-cal').getAttribute('role') === 'dialog'));
  await page.evaluate(() => { window.__plat.O.audioLeve = 'desligado'; }); // o monitor automático liga o áudio leve no swiftshader lento; aqui o teste manda
  await page.evaluate(() => [...document.querySelectorAll('#p7-cal [data-a]')].find(b => b.dataset.a === 'celular').click());
  await pausa(300);
  let e = await page.evaluate(() => window.__plat.P7._teste.estado());
  ver('perfil celular: saída celular e HRTF desligado', e.saida === 'celular' && e.fone === false);
  await pausa(700);
  e = await page.evaluate(() => window.__plat.P7._teste.estado());
  console.log('estado', JSON.stringify(e));
  ver('grafo ligado, teto de 12 vozes, compressor do celular', e.ligado && e.limVoz === 12 && e.cmp2 > 1.5);
  ver('presença de voz sobe no celular', e.pk2 > 2.5);
  // passo da audibilidade: começa, espera o 2º nível e diz que não ouviu
  await page.evaluate(() => [...document.querySelectorAll('#p7-cal [data-a]')].find(b => b.dataset.a === 'tocar').click());
  await pausa(4200);
  await page.evaluate(() => [...document.querySelectorAll('#p7-cal [data-a]')].find(b => b.dataset.a === 'nao').click());
  await pausa(200);
  const bo = await page.evaluate(() => window.__plat.O.audBoost);
  ver('reforço de audibilidade calculado (' + bo + ' dB)', bo >= 6 && bo <= 12);
  await page.screenshot({ path: path.join(aqui, '..', 'qa-plat7-cal.png') });
  await page.evaluate(() => [...document.querySelectorAll('#p7-cal [data-a]')].find(b => b.dataset.a === 'prox').click());
  await pausa(300);
  ver('passo de sincronia (celular não tem teste de fone)', await page.evaluate(() => /Imagem e som juntos/.test(document.getElementById('p7-cal').textContent)));
  await page.evaluate(() => { document.getElementById('p7-w-lat').value = 120; document.getElementById('p7-w-lat').dispatchEvent(new Event('input')); [...document.querySelectorAll('#p7-cal [data-a]')].find(b => b.dataset.a === 'ok').click(); });
  await pausa(300);
  ver('latência manual guardada', await page.evaluate(() => window.__plat.O.latModo === 'manual' && window.__plat.O.latMs === 120));
  await page.evaluate(() => [...document.querySelectorAll('#p7-cal [data-a]')].find(b => b.dataset.a === 'tocar').click());
  await pausa(4200);
  await page.evaluate(() => [...document.querySelectorAll('#p7-cal [data-a]')].find(b => b.dataset.a === 'segundo').click());
  await pausa(200);
  ver('graves virtuais sobem quando só o 2º é ouvido', await page.evaluate(() => window.__plat.O.gravesVirt === 1.4));
  await page.evaluate(() => [...document.querySelectorAll('#p7-cal [data-a]')].find(b => b.dataset.a === 'prox').click());
  await pausa(200);
  await page.evaluate(() => [...document.querySelectorAll('#p7-cal [data-a]')].find(b => b.dataset.a === 'ok').click());
  await pausa(300);
  ver('assistente fecha e marca calibrado', await page.evaluate(() => document.getElementById('p7-cal').hidden && window.__plat.O.somCal === 'ok'));
  ver('botão Som no título mostra o perfil', await page.evaluate(() => /celular/i.test(document.getElementById('b-calsom').textContent)));
  // atraso visual
  const at = await page.evaluate(async () => { const A = window.__plat.P7; A.atraso('t', 1); await new Promise(r => setTimeout(r, 60)); const v1 = A.atraso('t', 2); await new Promise(r => setTimeout(r, 130)); const v2 = A.atraso('t', 3); return [v1, v2]; });
  ver('atraso de 120 ms segura o valor novo (' + at.join(',') + ')', at[0] === 1 && at[1] === 2);
  // áudio leve
  await page.evaluate(() => { window.__plat.O.audioLeve = 'ligado'; });
  await pausa(600);
  e = await page.evaluate(() => window.__plat.P7._teste.estado());
  ver('áudio leve: reverb barato, 8 vozes, camadas fora', e.leve && e.cheap && e.limVoz === 8 && e.foraMusica.includes('cordas') && e.foraMusica.includes('cluster'));
  await page.evaluate(() => { window.__plat.O.audioLeve = 'desligado'; });
  await pausa(600);
  e = await page.evaluate(() => window.__plat.P7._teste.estado());
  ver('áudio completo volta ao normal', !e.leve && !e.cheap && e.limVoz === 12 && e.foraMusica.length === 0);
  // sem trilha
  await page.evaluate(() => { window.__plat.O.semTrilha = true; window.__plat.P7.ajuste(); });
  e = await page.evaluate(() => window.__plat.P7._teste.estado());
  ver('sem trilha tira 4 camadas', e.foraMusica.length === 4);
  await page.evaluate(() => { window.__plat.O.semTrilha = false; window.__plat.P7.ajuste(); });
  // opções
  await page.evaluate(() => document.getElementById('b-opcoes').click());
  await pausa(400);
  ver('opções têm o grupo Som e atmosfera', await page.evaluate(() => !!document.getElementById('p7-op') && /Graves virtuais/.test(document.getElementById('p7-op').textContent)));
  ver('contagem de vozes aparece no painel', await page.evaluate(() => /vozes de áudio: \d+\/12/.test(document.getElementById('p7-info').textContent)));
  await page.screenshot({ path: path.join(aqui, '..', 'qa-plat7-opcoes.png') });
  // joga um pouco com o áudio completo
  await page.evaluate(() => { document.getElementById('plat-opcoes').hidden = true; });
  await page.evaluate(() => import('/ferramentas/teste.js'));
  await page.evaluate(async () => { await window.T.novo(); });
  await pausa(3000);
  ver('sem erros de JS', erros.length === 0);
  if (erros.length) console.log(erros.slice(0, 6).join('\n'));
  console.log(saidas.join('\n'));
} catch (er) { ok = false; console.log('ERRO', er.message); console.log(erros.slice(0, 8).join(' | ')); }
await browser.close(); srv.close();
console.log(ok ? 'RESULTADO: PASSOU' : 'RESULTADO: FALHOU');
process.exit(ok ? 0 : 1);
