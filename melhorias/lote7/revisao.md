# Lote 7 — revisão (jogador crítico / QA antes de publicar)

- Revisão do diff lote7-base..main (51 arquivos, +12 mil linhas): módulos de som e atmosfera, mapas, monstros, sustos, interface e plataforma conferidos contra os ganchos de jogo.js e mapas.js.
- Corrigido texto sem acento no sussurro da estática (sustos-lote7b.js): "esta aberto", "voce nao olha" e "ele nao ouve" agora saem como "está aberto", "você não olha" e "ele não ouve" na legenda.
- Corrigida tela sobreposta no título: o selo de perfil ("Jogador 1") cobria o rádio-relógio; agora fica logo abaixo dele.
- Corrigida tela sobreposta no título: o aviso "GRAVANDO 21:00" escrevia por cima da versão no canto superior direito; desceu para a linha de baixo.
- Corrigida tela sobreposta no título: o rótulo "próxima meta" herdava a posição absoluta da versão e ficava por cima dela, ilegível; agora fica na própria linha da meta.
- Varredura de mojibake em todos os arquivos tocados pelo lote 7: nenhum acento corrompido; arquivos em UTF-8.
- Varredura de nomes e marcas de outros jogos nos textos e módulos do lote 7: nenhuma cópia.
- sw.js (cache hora-silencio-v14) lista todos os módulos novos de src/ e a cópia local do Three.js: joga offline sem faltar arquivo.
- Capturas dos cinco mapas (estrada, térreo, andar de cima, túneis, cemitério) conferidas: lanterna e objetos legíveis, legendas empilhadas sem cobrir o objetivo, nada escuro a ponto de impedir o jogo.
- Tempo do QA completo (capítulos I a V, plataforma, segredos e sobrevivência) igual ou menor que o do lote 6: sem queda de desempenho detectada.
- Observação (sem regressão do lote 7): o aviso "spot faltando dormB mesa 2" do kit de teste já existia em rodadas anteriores e não afeta a progressão.
- QA de sobrevivência (node ferramentas/qa.mjs . --sobrevivencia) terminou com RESULTADO: PASSOU.
- Corrigido o aviso de áudio "valor não finito" em SFX.rangido: chamada sem posição válida agora cai na posição da Lia em vez de gerar TypeError no oscilador.
