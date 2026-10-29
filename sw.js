// Cache para jogar sem internet depois da primeira visita.
// Arquivos do jogo: rede primeiro, mas com prazo: se a internet demorar mais de 2,5 s, abre do cache e atualiza por trás.
// Three.js (unpkg ou o servidor reserva jsdelivr) e fontes: cache primeiro, atualizando em segundo plano.
// Versão nova não troca os arquivos no meio de uma noite: ela espera a próxima abertura (ou o "abrir agora" do título).
const CACHE = 'hora-silencio-v6'; // v6: módulos do Lote 4 (segredos)
const BASE = ['./', 'index.html', 'roteiro.js', 'jogo.js', 'mapas.js', 'src/plataforma.js', 'src/plataforma2.js', 'src/plataforma3.js', 'src/plataforma.css', 'src/estrada-extra.js', 'src/estrada-roteiro.js', 'src/historia.js', 'src/interface.js', 'src/internato.js', 'src/jogabilidade.js', 'src/progressao.js', 'src/subterraneo.js', 'src/sustos.js', 'src/visual.js', 'src/audio-mundo.js', 'src/estrada-mundo.js', 'src/estrada-mundo-texto.js', 'src/historia-mundo.js', 'src/interface-mundo.js', 'src/internato-lore.js', 'src/jogabilidade-mundo.js', 'src/monstros-lore.js', 'src/progressao-mundo.js', 'src/progressao-roteiro.js', 'src/subterraneo-lore.js', 'src/sustos-mundo.js', 'src/visual-mundo.js', 'src/audio-plataforma.js', 'src/estrada-polimento.js', 'src/historia-polimento.js', 'src/historia-segredos.js', 'src/interface-polimento.js', 'src/internato-polimento.js', 'src/jogabilidade-polimento.js', 'src/monstros-polimento.js', 'src/progressao3-roteiro.js', 'src/progressao3.js', 'src/subterraneo-polimento.js', 'src/sustos-plataforma.js', 'src/visual-polimento.js', 'icone.svg', 'manifest.webmanifest', 'src/estrada-segredos.js', 'src/estrada-segredos-texto.js', 'src/subterraneo-segredos.js', 'src/monstros-segredos.js', 'src/monstros-segredos-texto.js', 'src/sustos-segredos.js', 'src/audio-segredos.js', 'src/visual-segredos.js', 'src/jogabilidade-segredos.js', 'src/interface-segredos.js', 'src/progressao-lote4.js', 'src/progressao-lote4-roteiro.js', 'src/subterraneo-monstros.js',
  'https://unpkg.com/three@0.160.0/build/three.module.js'];
const RESERVA = 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';
async function guardarTudo() {
  const c = await caches.open(CACHE); let ok = 0;
  await Promise.all(BASE.map(u => c.add(u).then(() => ok++).catch(() => {})));
  if (!(await c.match(BASE[BASE.length - 1]))) await c.add(RESERVA).catch(() => {}); // sem o unpkg, guarda a reserva
  return ok;
}
async function contar() { const c = await caches.open(CACHE); let ok = 0; for (const u of BASE) if (await c.match(u, { ignoreSearch: true })) ok++; if (!(await c.match(BASE[BASE.length - 1])) && (await c.match(RESERVA))) ok++; return ok; }
async function avisar(tipo) { const ok = await contar(); const cs = await self.clients.matchAll({ includeUncontrolled: true }); for (const cl of cs) cl.postMessage({ tipo, ok, total: BASE.length }); }
self.addEventListener('install', e => { e.waitUntil(guardarTudo().then(async () => { if (!(await self.registration.active)) self.skipWaiting(); })); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()).then(() => avisar('offline-ok'))); });
self.addEventListener('message', e => {
  const m = e.data || {};
  if (m.tipo === 'pular') self.skipWaiting();
  else if (m.tipo === 'status') e.waitUntil(avisar('status'));
  else if (m.tipo === 'guardar') e.waitUntil(guardarTudo().then(() => avisar('status')));
});
self.addEventListener('fetch', e => {
  const req = e.request; if (req.method !== 'GET') return;
  const url = new URL(req.url), mesmo = url.origin === location.origin;
  if (!mesmo && !/unpkg\.com|cdn\.jsdelivr\.net|fonts\.(googleapis|gstatic)\.com/.test(url.host)) return;
  if (mesmo) {
    e.respondWith((async () => {
      const rede = fetch(req).then(r => { if (r.ok) { const cp = r.clone(); caches.open(CACHE).then(c => c.put(req, cp)); } return r; });
      const doCache = () => caches.match(req, { ignoreSearch: true }).then(r => r || (req.mode === 'navigate' ? caches.match('index.html') : null));
      // corrida: rede com prazo de 2,5 s; se ela perder, serve o cache (a rede termina por trás e atualiza para a próxima)
      const prazo = new Promise(res => setTimeout(() => res('prazo'), 2500));
      try {
        const r = await Promise.race([rede, prazo]);
        if (r !== 'prazo') return r;
        const c = await doCache(); if (c) { e.waitUntil(rede.catch(() => {})); return c; }
        return await rede;
      } catch (er) { const c = await doCache(); return c || Response.error(); }
    })());
  } else {
    e.respondWith(caches.match(req).then(hit => {
      const rede = fetch(req).then(r => { if (r.ok || r.type === 'opaque') { const cp = r.clone(); caches.open(CACHE).then(c => c.put(req, cp)); } return r; }).catch(() => hit);
      return hit || rede;
    }));
  }
});
