# Lote 6 — revisão (jogador crítico / QA antes de publicar)

- Revisão completa do diff lote6-base..main (36 arquivos, +8130 linhas): integração dos módulos novos, mapas e textos.
- Conferido que todo método de L6/JGL6/L6V/AUDL6 chamado em jogo.js existe no módulo correspondente (sem TypeError de método ausente).
- Verificado que os índices de spot sorteados por semente (rj.i) nunca saem do array: spot() aplica módulo e os itens ficam na MESMA sala, sem backtracking nem objetivo perdido.
- Confirmado que lapide/emCima/objeto existem no escopo de cemiterio() antes de serem passados a subterraneo-rejogo.js (sem ReferenceError na troca pro Capítulo V).
- Checado o caminho de QA/robô: clima fica neutro (webdriver), rejogo usa semente fixa — playthrough determinístico, progressão intacta.
- node --check limpo nos 17 arquivos tocados (roteiro.js, jogo.js, mapas.js e os 14 módulos novos do lote 6).
- Varredura de mojibake nos textos do lote 6: nenhum acento corrompido; arquivos UTF-8.
- Varredura de nomes/marcas de outros jogos nos textos e módulos do lote 6: nenhuma cópia.
- sw.js (cache hora-silencio-v10) lista todos os 14 módulos novos em BASE: joga offline sem faltar arquivo.
- QA de sobrevivência (node ferramentas/qa.mjs . --sobrevivencia) percorreu prólogo e Capítulos I a V, final, plataforma e segredos e terminou com RESULTADO: PASSOU.
- Observação registrada (sem regressão do lote 6): um AVISO intermitente de áudio (setValueAtTime não-finito) vem de helpers de som pré-existentes do motor (jogo.js), já embrulhado em try/catch; todo setValueAtTime do áudio do lote 6 usa valor literal finito e boletim() sai cedo no QA. Não derruba o quadro nem falha o QA.
