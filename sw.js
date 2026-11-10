// Cache para jogar sem internet depois da primeira visita.
// Arquivos do jogo: rede primeiro, mas com prazo: se a internet demorar mais de 2,5 s, abre do cache e atualiza por trás.
// Three.js (unpkg ou o servidor reserva jsdelivr) e fontes: cache primeiro, atualizando em segundo plano.
// Versão nova não troca os arquivos no meio de uma noite: ela espera a próxima abertura (ou o "abrir agora" do título).
const CACHE = 'hora-silencio-v18'; // v18: prólogo sem monstros, shaders pré-compilados, corte por salas, qualidade Média · v17: opções ainda mais enxutas · v16: leveza (mapas do internato e do subsolo sob demanda, orçamento de luzes) · v15: modo simples (src/modo-simples.js) · // v14: Lote 7 integrado (som e atmosfera em todas as áreas, Three.js servido junto) · v13: Lote 6 integrado (2ª rodada: história/mapas/monstros/sustos/áudio/visual/jogabilidade/interface/progressão) · v12: Lote 5 (2ª rodada) · v10: Lote 6 (rejogabilidade)
const BASE = ['./', 'index.html', '404.html', 'roteiro.js', 'jogo.js', 'mapas.js', 'mapas-internato.js', 'mapas-subsolo.js', 'src/mapas-util.js', 'src/plataforma.js', 'src/plataforma2.js', 'src/plataforma3.js', 'src/plataforma4.js', 'src/plataforma4-extra.js', 'src/plataforma4.css', 'src/plataforma4b.js', 'src/plataforma4b.css', 'src/plataforma.css', 'src/estrada-extra.js', 'src/estrada-roteiro.js', 'src/historia.js', 'src/interface.js', 'src/internato.js', 'src/jogabilidade.js', 'src/progressao.js', 'src/subterraneo.js', 'src/sustos.js', 'src/visual.js', 'src/audio-mundo.js', 'src/estrada-mundo.js', 'src/estrada-mundo-texto.js', 'src/historia-mundo.js', 'src/interface-mundo.js', 'src/internato-lore.js', 'src/jogabilidade-mundo.js', 'src/monstros-lore.js', 'src/progressao-mundo.js', 'src/progressao-roteiro.js', 'src/subterraneo-lore.js', 'src/sustos-mundo.js', 'src/visual-mundo.js', 'src/audio-plataforma.js', 'src/estrada-polimento.js', 'src/historia-polimento.js', 'src/historia-segredos.js', 'src/interface-polimento.js', 'src/internato-polimento.js', 'src/jogabilidade-polimento.js', 'src/monstros-polimento.js', 'src/progressao3-roteiro.js', 'src/progressao3.js', 'src/subterraneo-polimento.js', 'src/sustos-plataforma.js', 'src/visual-polimento.js', 'icone.svg', 'manifest.webmanifest', 'src/estrada-segredos.js', 'src/estrada-segredos-texto.js', 'src/subterraneo-segredos.js', 'src/subterraneo-segredos2.js', 'src/monstros-segredos.js', 'src/monstros-segredos-texto.js', 'src/sustos-segredos.js', 'src/sustos-segredos2.js', 'src/audio-segredos.js', 'src/visual-segredos.js', 'src/jogabilidade-segredos.js', 'src/interface-segredos.js', 'src/interface-segredos2.js', 'src/internato-segredos.js', 'src/internato-segredos-sup.js', 'src/progressao-lote4.js', 'src/progressao-lote4-roteiro.js', 'src/progressao-lote4b.js', 'src/progressao-lote4b-roteiro.js', 'src/progressao-lote4c.js', 'src/progressao-lote4c-roteiro.js', 'src/legendas-pilha.js', 'src/modo-simples.js', 'src/historia-lote5.js', 'src/historia-lote5b.js', 'src/estrada-monstros.js', 'src/estrada-monstros-texto.js', 'src/monstros-internato.js', 'src/subterraneo-monstros.js', 'src/subterraneo-monstros2.js', 'src/monstros-lote5.js', 'src/monstros-lote5b.js', 'src/sustos-lote5.js', 'src/sustos-lote5b.js', 'src/audio-lote5.js', 'src/audio-lote5b.js', 'src/monstros-visual.js', 'src/monstros-visual2.js', 'src/jogabilidade-lote5.js', 'src/jogabilidade-lote5b.js', 'src/interface-monstros.js', 'src/interface-monstros2.js', 'src/interface-monstros3.js', 'src/plataforma-lote5.js', 'src/plataforma-lote5b.js', 'src/plataforma-lote5c.js', 'src/progressao-lote5.js', 'src/progressao-lote5-roteiro.js', 'src/progressao-lote5b.js', 'src/progressao-lote5b-roteiro.js', 'src/historia-lote6.js', 'src/estrada-lote6.js', 'src/estrada-lote6-texto.js', 'src/internato-rejogo.js', 'src/internato-rejogo2.js', 'src/subterraneo-rejogo.js', 'src/monstros-lote6.js', 'src/monstros-lote6-texto.js', 'src/audio-lote6.js', 'src/visual-lote6.js', 'src/jogabilidade-lote6.js', 'src/interface-lote6.js', 'src/progressao-lote6.js', 'src/progressao-lote6-roteiro.js', 'src/plataforma-lote6.js',
  'src/historia-lote6b.js', 'src/historia-lote6b-texto.js', 'src/estrada-lote6b.js', 'src/estrada-lote6b-texto.js', 'src/estrada-lote6b-mundo.js', 'src/estrada-lote6b-eventos.js', 'src/subterraneo-rejogo2.js', 'src/monstros-lote6b.js', 'src/monstros-lote6b-texto.js', 'src/sustos-lote6.js', 'src/audio-lote6b.js', 'src/audio-lote6c.js', 'src/visual-lote6b.js', 'src/visual-lote6b-lentes.js', 'src/visual-lote6b-cartoes.js', 'src/jogabilidade-lote6b.js', 'src/interface-lote6b.js', 'src/interface-lote6b-central.js', 'src/interface-lote6b-perfis.js', 'src/interface-lote6b-texto.js', 'src/progressao-lote7.js', 'src/progressao-lote7-roteiro.js', 'src/progressao-som7.js', 'src/progressao-som7-roteiro.js',
  'src/interface-lote7.js', 'src/interface-lote7b.js',
  'src/jogabilidade-atmosfera.js', 'src/jogabilidade-som.js',
  'src/visual-lote7.js',
  'src/audio-lote7.js',
  'src/sustos-lote7.js', 'src/sustos-lote7b.js',
  'src/monstros-som-lote7.js',
  'src/subterraneo-audio7.js', 'src/subterraneo-audio7b.js',
  'src/internato-som.js',
  'src/estrada-audio.js', 'src/estrada-audio2.js',
  'src/historia-lote7.js',
  'src/plataforma-lote7.js',
  'vendor/three.module.min.js']; // Three.js r160 vem da pasta do jogo: abre sem internet depois da primeira visita
const RESERVA = 'https://unpkg.com/three@0.160.0/build/three.module.js'; // só se a cópia local não puder ser guardada
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
