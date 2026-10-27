# Guia do projeto — A Hora do Silêncio

Jogo de terror em primeira pessoa que roda no navegador (Three.js r160 via importmap do unpkg, sem build, sem assets externos: texturas em canvas e som 100% procedural com WebAudio). Publicado em https://jpfamelli.github.io/hora-do-silencio/ (GitHub Pages da branch `main`). Tudo em português do Brasil.

## Arquivos
- `index.html` — CSS, HUD, todas as telas (título, pausa, morte, diário, teclado, fim de capítulo, final). Carrega `roteiro.js` e depois `jogo.js` como módulo. Sempre manter `[hidden]{display:none!important}`.
- `roteiro.js` — TODO o texto do jogo em `window.ROTEIRO`: personagens, intro, regras, capítulos (objetivos e gancho), falas, fitas, notas, páginas, lápides, entidades, finais, dicas de morte, conquistas. Os `id` são lidos pelo motor e pelos mapas.
- `jogo.js` — motor, por seções (procure os cabeçalhos `// ====`): RENDER, TEXTURAS (canvas), MUNDO (paredes, salas, portas, armários, camas, lâmpadas, itens), MOBÍLIA AUTOMÁTICA (gera `spots` seguros para itens), ESTADO (`novoEstado`), JOGADOR (movimento, ruído, lanterna, medo, esconderijos), ENTIDADES (Inspetor, Ana, Procissão, Chamado, diretor de tensão), HISTÓRIA/OBJETIVOS (capítulos, rank), MAPAS (carregarMapa, checkpoint), FITAS/NOTAS/DIÁLOGOS, API PARA OS MAPAS, CENA DE ABERTURA, ÁUDIO PROCEDURAL (`SFX`), CHUVA/RELÂMPAGO, HUD/UI, LOOP (`frame(dt)`).
- `mapas.js` — `export const MAPAS = { estrada, terreo, superior, tuneis, cemiterio }`. Cada mapa recebe a `API` do motor e o estado `S` e devolve `{ nome, spawns, fora, dentro, energia(), inspetor(), procissao(), ana(), chamado(), entrar(cap), inicioCapitulo(cap), sync(), fitaOuvida(id), cena?... }`.
- `ferramentas/teste.js` — kit de teste no navegador (`T`). `T.tudo()` joga o jogo inteiro de forma automática.
- `ferramentas/qa.mjs` — QA headless: `node ferramentas/qa.mjs <pasta-do-jogo> [--shots <pasta>] [--sobrevivencia]`. Serve a pasta, abre no Chrome, roda `T.tudo()`, falha se houver erro de JS ou etapa quebrada. Demora alguns minutos.
- `melhorias/` — registro das melhorias por lote. `MELHORIAS.md` é o índice geral.

## Entidades (originais, inspiradas em monstros conhecidos)
- **Inspetor** (Moacir, cego): caça pelo som (ruído do jogador, portas, garrafas). Estados patrulha/investiga/procura/caca. Contra: agachar, esconder (armário/cama), prender a respiração (ESPAÇO), garrafa (G).
- **Ana / Menina Que Conta**: só anda quando não está vista e iluminada; conta até 10 e aparece atrás. Não abre porta fechada.
- **Procissão**: luzes piscam e rádio chia (aviso), depois atravessa as salas; fora do esconderijo = 90 de dano.
- **Chamado**: voz chama "Lia..." de sala vizinha; ir lá atrai o Inspetor.
- **Diretor de tensão**: mede pressão e faz o Inspetor recuar.

## Regras de trabalho
- Não copiar jogo existente: inspiração sim, cópia não. Nada de nomes/marcas de outros jogos dentro do jogo.
- Manter `window.__jogo` e o kit de teste funcionando. Se mudar um rótulo de interação ou o fluxo de um capítulo, atualize `T.tudo()` em `ferramentas/teste.js`.
- Para reduzir conflito entre pessoas mexendo ao mesmo tempo: mudanças localizadas, sem reformatar/reindentar código alheio, sem renomear funções compartilhadas; código novo grande vai em arquivo novo (ex.: `src/<area>-*.js`) importado com poucas linhas de gancho.
- Arquivos UTF-8; editar com Edit/Node (nunca Set-Content do PowerShell).
- Antes de dar algo como pronto: `node ferramentas/qa.mjs .` precisa terminar com `RESULTADO: PASSOU`.
