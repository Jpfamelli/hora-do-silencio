// Cache para jogar sem internet depois da primeira visita.
// Arquivos do jogo: rede primeiro (pega atualizações), cache se a rede cair.
// Three.js e fontes (de fora): cache primeiro, atualizando em segundo plano.
const CACHE = 'hora-silencio-v4'; // v4: módulos do Lote 2
const BASE = ['./', 'index.html', 'roteiro.js', 'jogo.js', 'mapas.js', 'src/plataforma.js', 'src/plataforma2.js', 'src/plataforma.css', 'src/estrada-extra.js', 'src/estrada-roteiro.js', 'src/historia.js', 'src/interface.js', 'src/internato.js', 'src/jogabilidade.js', 'src/progressao.js', 'src/subterraneo.js', 'src/sustos.js', 'src/visual.js', 'src/visual-polimento.js', 'src/audio-mundo.js', 'src/estrada-mundo.js', 'src/estrada-mundo-texto.js', 'src/historia-mundo.js', 'src/interface-mundo.js', 'src/internato-lore.js', 'src/jogabilidade-mundo.js', 'src/monstros-lore.js', 'src/progressao-mundo.js', 'src/progressao-roteiro.js', 'src/subterraneo-lore.js', 'src/sustos-mundo.js', 'src/visual-mundo.js', 'icone.svg', 'manifest.webmanifest',
  'https://unpkg.com/three@0.160.0/build/three.module.js'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => Promise.all(BASE.map(u => c.add(u).catch(() => {})))).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const req = e.request; if (req.method !== 'GET') return;
  const url = new URL(req.url), mesmo = url.origin === location.origin;
  if (!mesmo && !/unpkg\.com|fonts\.(googleapis|gstatic)\.com/.test(url.host)) return;
  if (mesmo) {
    e.respondWith(fetch(req).then(r => { if (r.ok) { const cp = r.clone(); caches.open(CACHE).then(c => c.put(req, cp)); } return r; })
      .catch(() => caches.match(req, { ignoreSearch: true }).then(r => r || (req.mode === 'navigate' ? caches.match('index.html') : Response.error()))));
  } else {
    e.respondWith(caches.match(req).then(hit => {
      const rede = fetch(req).then(r => { if (r.ok || r.type === 'opaque') { const cp = r.clone(); caches.open(CACHE).then(c => c.put(req, cp)); } return r; }).catch(() => hit);
      return hit || rede;
    }));
  }
});
