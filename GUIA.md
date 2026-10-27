# Guia do projeto — A Hora do Silêncio

Jogo de terror em primeira pessoa que roda no navegador (Three.js r160 via importmap do unpkg, sem build, sem assets externos: texturas em canvas e som 100% procedural com WebAudio). Publicado em https://jpfamelli.github.io/hora-do-silencio/ (GitHub Pages da branch `main`). Tudo em português do Brasil.

## Arquivos
- `index.html` — CSS, HUD, todas as telas (título, pausa, morte, diário, teclado, fim de capítulo, final). Carrega `roteiro.js` e depois `jogo.js` como módulo. Sempre manter `[hidden]{display:none!important}`.
- `roteiro.js` — TODO o texto do jogo em `window.ROTEIRO`: personagens, intro, regras, capítulos (objetivos e gancho), falas, fitas, notas, páginas, lápides, entidades, finais, dicas de morte, conquistas. Os `id` são lidos pelo motor e pelos mapas.
- `jogo.js` — motor, por seções (procure os cabeçalhos `// ====`): RENDER, TEXTURAS (canvas), MUNDO (paredes, salas, portas, armários, camas, lâmpadas, itens), MOBÍLIA AUTOMÁTICA (gera `spots` seguros para itens), ESTADO (`novoEstado`), JOGADOR (movimento, ruído, lanterna, medo, esconderijos), ENTIDADES (Inspetor, Ana, Procissão, Chamado, diretor de tensão), HISTÓRIA/OBJETIVOS (capítulos, rank), MAPAS (carregarMapa, checkpoint), FITAS/NOTAS/DIÁLOGOS, API PARA OS MAPAS, CENA DE ABERTURA, ÁUDIO PROCEDURAL (`SFX`), CHUVA/RELÂMPAGO, HUD/UI, LOOP (`frame(dt)`).
- `mapas.js` — `export const MAPAS = { estrada, terreo, superior, tuneis, cemiterio }`. Cada mapa recebe a `API` do motor e o estado `S` e devolve `{ nome, spawns, fora, dentro, energia(), inspetor(), procissao(), ana(), chamado(), entrar(cap), inicioCapitulo(cap), sync(), fitaOuvida(id), cena?... }`.
- `src/` — módulos do Lote 1, cada um ligado ao motor por poucas linhas de gancho (procure o nome do objeto em `jogo.js`):
  - `historia.js` (`H = instalarHistoria`) segredos, falas de contexto, atitudes do final, formatação do texto (`fmtFala`, `fmtNota`).
  - `sustos.js` (`SUST = criarSustos`) diretor de sustos, alucinações, esconderijo inseguro, mortes com cena, variações do DEZ da Ana (`SUST.dez`).
  - `visual.js` (`VIS = instalarVisual`) câmera e campo de visão (único dono de `camera.fov`), lanterna, partículas, efeitos de HUD, calibragem do primeiro jogo (`#vc-*`).
  - `jogabilidade.js` (`JG`) textos de dica por causa da morte, olhar para trás (Q), ajuda oculta depois de várias mortes.
  - `interface.js` (`UIX = criarInterface`) tela `#opcoes` (todas as opções salvas em `OPT`), legendas de som `#legsom`, anel de ruído, mini mapa da morte, dicas da Lia (O; segure O = a Lia pensa alto), cronômetro.
  - `progressao.js` (`PG.ligar`) rank com metas, selos, modos (Uma Vida, cronômetro, amuletos, desafio), acervo de lore, estatísticas. O motor passa `saveExterno`, `dicaExterna` e `ajudaExterna`: o salvamento, as dicas e a ajuda ficam no motor/interface.
  - `plataforma.js` + `plataforma.css` (`PLAT`) qualidade automática, resolução dinâmica, limite de 30 qps, controle (gamepad), toque, pausa ao perder o foco (P também pausa), salvamento leve, link de desafio, PWA (`sw.js`, `manifest.webmanifest`). Tela própria `#plat-opcoes` ("Desempenho") só com o que não está em `#opcoes`; opções em `hora-silencio-plat`.
  - `monstros-lore.js` (`ML = criarMonstrosLore`, Lote 2) a vida das entidades: chaveiro/apito/crachá/lampião do Inspetor, estado `reza` (pausas de memória: camas, canecas, túmulo do Luiz, armário do castigo), armários que ele não abre (`ML.protegido`), Procissão com rosto e freira, extras da Ana, presenças que não atacam (Davi, Joaquim, Albano, brasa). Texto em `R.monstros2`.
  - `estrada-extra.js`, `estrada-roteiro.js`, `internato.js`, `subterraneo.js` — extras dos mapas, chamados por `mapas.js` (texto novo do prólogo fica em `estrada-roteiro.js`).
- Opções compartilhadas (`OPT`, chave `hora-silencio-opt`): `brilho`, `fov`, `vFlash` (0/1), `agachar` (`alternar`/`segurar`), `invY`, `legSom`, `cron` (cronômetro da interface; o do PG só aparece se ele estiver desligado). Não crie outra opção com o mesmo papel: leia `C.OPT`.
- Teclas: WASD, SHIFT correr, ALT devagar, C agachar (Ctrl não agacha), ESPAÇO prender o ar, Z/X espiar, Q olhar para trás, E interagir, F lanterna, R pilha, H curativo, G garrafa, TAB diário, O objetivo, V responder o chamado / virar as regras na nota, L ler a nota em voz alta, P ou ESC pausa.
- `ferramentas/teste.js` — kit de teste no navegador (`T`). `T.tudo()` joga o jogo inteiro de forma automática.
- `ferramentas/qa.mjs` — QA headless: `node ferramentas/qa.mjs <pasta-do-jogo> [--shots <pasta>] [--sobrevivencia]`. Serve a pasta, abre no Chrome, roda `T.tudo()`, falha se houver erro de JS ou etapa quebrada. Demora alguns minutos.
- `melhorias/lote<N>/<área>.md` — uma linha "- " por melhoria. `MELHORIAS.md` é gerado por `node ferramentas/gerar-melhorias.mjs` (não editar à mão).

## Campanha (Lote 1: enxuta) — 6 capítulos, 8 a 12 min cada, sem backtracking
Índices de `S.chapter` 0–5; os mapas checam esses números (`inspetor()`, `ana()`, `procissao()`...).
| # | Capítulo | Mapa | Objetivos | Momento marcante |
|---|---|---|---|---|
| 0 | Prólogo — A Estrada Velha | estrada | sair do carro, lanterna, Seu Joaquim no posto, chave do portão, cadeado | o vulto na estrada; o velho some e o rádio diz que ele morreu em 1979 |
| 1 | I — Sem Luz | terreo | forçar a porta (barulho), galão (despensa), caixa de fusíveis reserva (enfermaria, uma peça só), gerador | primeiro encontro com o Inspetor; o gerador ronca e atrai ele |
| 2 | II — Nove Badaladas | terreo | sobreviver à Procissão, fita 1 (código do quadro), quadro de chaves, subir | as nove badaladas e a Procissão |
| 3 | III — A Menina Que Conta | superior | engrenagem (uma, no dormitório E), caixinha, Ana, quarto da Celeste, fita 2, descer pelo monta-cargas do depósito | a brincadeira da Ana |
| 4 | IV — Os Túneis | tuneis | válvulas na ordem da fita 2, cofre (números do Davi), escotilha | a sala secreta e o "QUEM ABRIU A MINHA GAVETA?" |
| 5 | V — A Hora | cemiterio | cavar os 3 túmulos, entrar na capela, altar, sino, fugir (final) | o sino e a fuga com o Inspetor solto |
- Do andar de cima se desce **direto** para os túneis pelo monta-cargas (`superior`, sala `sotao`); o alçapão da casa de máquinas continua como rota opcional.
- Páginas do diário do Davi ficam no caminho obrigatório e não são mais um objetivo: p1 na diretoria (ao lado da fita 1), p2 no quarto da Celeste, p3 na sala de brinquedos, p4 no túnel norte (antes da sala do diretor). O cofre mostra quantos números já foram achados. Ao ler as 4, toca a fala `paginas_ok`.
- Saves usam as chaves `hora-silencio-v3` / `hora-silencio-v3-caps` (os saves da campanha antiga de 8 capítulos não são compatíveis); conquistas continuam em `-v2-conq`.

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
