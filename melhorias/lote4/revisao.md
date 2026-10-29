# Lote 4 — Revisão antes de publicar
- Service worker: o cache voltou a ser versionado (`hora-silencio-v6`) em vez de ficar preso no `v5` do Lote 3, então o `activate` limpa o cache antigo e os módulos novos do Lote 4 entram de uma vez na próxima abertura
- Service worker: removida a entrada falsa `'hora-silencio-v6'` da lista `BASE`, que não é arquivo e fazia o `install` buscar um 404 toda vez e o indicador de "pronto para jogar sem internet" nunca fechar em 100%
