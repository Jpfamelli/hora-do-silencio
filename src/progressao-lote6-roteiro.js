// PROGRESSÃO — LOTE 6 (texto): conquistas de maestria e rejogo, Regras da Casa, Noite do Dia,
// pontuação da noite, Hall da Fama, Quadro de Recordes, Caça aos Finais e comparação com amigo.
// Só texto e definições; a lógica vive em src/progressao-lote6.js. Empurra para window.ROTEIRO na importação.
(function () {
  const R = window.ROTEIRO; if (!R) return;
  R.progressao = R.progressao || { capitulos: {}, conquistas: [] };

  // --- conquistas novas (empurradas direto, à prova de duplicata)
  const CONQ = [
    { id: 'l6_hora_perfeita', nome: 'A Hora Perfeita', desc: 'Zere a noite inteira no Pesadelo sem morrer e sem levar um arranhão.', secreta: true },
    { id: 'l6_noite_cheia', nome: 'Noite Cheia', desc: 'Cumpra os seis desafios secretos numa única noite.' },
    { id: 'l6_nunca_ouvida', nome: 'Nunca Ouvida', desc: 'Chegue ao final sem o Inspetor partir para a caça uma vez sequer.', secreta: true },
    { id: 'l6_primeira_hora', nome: 'A Primeira Hora', desc: 'Atravesse a campanha inteira quase sem acender a lanterna.', secreta: true },
    { id: 'l6_noite_perfeita', nome: 'Noite Perfeita', desc: 'S em todos os capítulos, nenhuma morte e o final verdadeiro na mesma noite.' },
    { id: 'l6_mao_cheia', nome: 'Mão Cheia', desc: 'Vença uma noite com cinco Regras da Casa ligadas.', secreta: true },
    { id: 'l6_tres_pesos', nome: 'Três Pesos', desc: 'Vença uma noite com três Regras da Casa ligadas.' },
    { id: 'l6_sub40', nome: 'A Noite em Quarenta', desc: 'Chegue a um final com menos de quarenta minutos.' },
    { id: 'l6_sub30', nome: 'A Noite em Trinta', desc: 'Chegue a um final com menos de trinta minutos.', secreta: true },
    { id: 'l6_prologo_veloz', nome: 'Saída Rápida', desc: 'Termine o Prólogo em menos de dois minutos.' },
    { id: 'l6_intocada1', nome: 'Pele Intacta', desc: 'Termine um capítulo de uma noite sem levar dano.' },
    { id: 'l6_intocada3', nome: 'Três Sem Toque', desc: 'Três capítulos sem dano na mesma noite.' },
    { id: 'l6_intocada6', nome: 'Noite Sem Toque', desc: 'Toda a noite sem levar um arranhão.', secreta: true },
    { id: 'l6_perto10', nome: 'Por Um Triz', desc: 'Escape dez vezes do Inspetor a um passo de você.' },
    { id: 'l6_perto30', nome: 'Nervos de Aço', desc: 'Trinta escapadas rente ao Inspetor.' },
    { id: 'l6_perto60', nome: 'Dança da Morte', desc: 'Sessenta escapadas rente ao Inspetor.', secreta: true },
    { id: 'l6_veterana', nome: 'Veterana da Casa', desc: 'Comece dez noites no internato.' },
    { id: 'l6_insone', nome: 'Insone', desc: 'Comece vinte e cinco noites no internato.' },
    { id: 'l6_sem_luz', nome: 'No Breu', desc: 'Termine um capítulo sem acender a lanterna.' },
    { id: 'l6_sem_esconder', nome: 'Sem Buraco', desc: 'Termine um capítulo sem usar nenhum esconderijo.' },
    { id: 'l6_barulhenta', nome: 'Barulhenta e Viva', desc: 'Termine um capítulo fazendo muito barulho e mesmo assim sobreviva.' },
    { id: 'l6_mudez', nome: 'Fantasma de Verdade', desc: 'Termine um capítulo em silêncio quase absoluto.', secreta: true },
    { id: 'l6_ouro', nome: 'Tempo de Ouro', desc: 'Bata o tempo de ouro do autor num capítulo.' },
    { id: 'l6_impecavel', nome: 'Capítulo Impecável', desc: 'Rank S, sem dano e sem morte no mesmo capítulo.' },
    { id: 'l6_regra', nome: 'Regras da Casa', desc: 'Vença uma noite com ao menos uma Regra da Casa ligada.' },
    { id: 'l6_casa_cheia', nome: 'A Casa Toda Contra Você', desc: 'Vença uma noite com todas as Regras da Casa ligadas.', secreta: true },
    { id: 'l6_diaria', nome: 'Noite do Dia', desc: 'Complete a Noite do Dia.' },
    { id: 'l6_ofensiva', nome: 'Ofensiva', desc: 'Jogue a Noite do Dia em três dias diferentes.' },
    { id: 'l6_pontos', nome: 'Caçadora de Pontos', desc: 'Faça mais de quarenta mil pontos numa noite.' },
    { id: 'l6_lenda', nome: 'Lenda da Noite', desc: 'Faça mais de oitenta mil pontos numa noite.', secreta: true },
    { id: 'l6_ss', nome: 'Marca de Ouro', desc: 'Feche um capítulo com rank SS: S, sem dano, sem ser perseguida e no tempo de ouro.', secreta: true },
    { id: 'l6_sem_morte', nome: 'Uma Noite Só', desc: 'Atravesse a campanha inteira sem morrer uma vez.' },
    { id: 'l6_sub20', nome: 'A Noite em Vinte', desc: 'Chegue a um final com menos de vinte minutos.', secreta: true },
    { id: 'l6_streak3', nome: 'Três Limpos', desc: 'Encadeie três capítulos sem morrer.' },
    { id: 'l6_streak5', nome: 'Cinco Limpos', desc: 'Encadeie cinco capítulos sem morrer.' },
    { id: 'l6_surpresa', nome: 'Dados Lançados', desc: 'Vença uma Noite Surpresa: semente e regras sorteadas pela casa.' },
    { id: 'l6_tematica', nome: 'Palavra de Poder', desc: 'Jogue até o fim uma das sementes de palavra marcadas.', secreta: true },
    { id: 'l6_tudo_numa_noite', nome: 'Tudo Numa Noite', desc: 'Numa única noite: final verdadeiro, nunca caçada, um capítulo sem esconderijo e sem morrer — tudo junto.', secreta: true },
    { id: 'l6_platina', nome: 'A Casa Toda', desc: 'Destrave tudo: todas as conquistas, os três finais e o acervo completo.', secreta: true }
  ];
  R.conquistas = R.conquistas || [];
  for (const c of CONQ) if (!R.conquistas.some(x => x.id === c.id)) R.conquistas.push(c);

  // --- Regras da Casa (mutadores empilháveis; cada uma endurece a noite e soma no placar)
  const REGRAS = [
    { id: 'passo', nome: 'Passo Pesado', desc: 'O Inspetor anda 12% mais rápido.', mult: .35 },
    { id: 'morcego', nome: 'Ouvido de Morcego', desc: 'Ele ouve metade mais longe.', mult: .45 },
    { id: 'pilhaseca', nome: 'Pilha Seca', desc: 'A lanterna gasta mais que o dobro.', mult: .3 },
    { id: 'subito', nome: 'Procissão Súbita', desc: 'O aviso da Procissão quase some.', mult: .4 },
    { id: 'implacavel', nome: 'Implacável', desc: 'Ele desiste bem mais devagar e volta mais rápido.', mult: .5 },
    { id: 'carne', nome: 'Carne Viva', desc: 'Todo toque machuca muito mais.', mult: .4 }
  ];

  R.progressao.lote6 = {
    regras: REGRAS,
    hub: {
      titulo: 'Rejogo',
      aviso: 'Modos, regras, sementes e recordes para voltar à Hora de outro jeito.',
      abas: [['rejogo', 'Modos'], ['regras', 'Regras da Casa'], ['recordes', 'Recordes'], ['hall', 'Hall da Fama'], ['finais', 'Caça aos Finais'], ['amigo', 'Comparar']]
    },
    diaria: {
      titulo: 'Noite do Dia',
      desc: 'Uma semente igual para todo mundo hoje, zerada à meia-noite.',
      jogar: 'Jogar a Noite do Dia',
      melhor: 'seu melhor de hoje',
      ofensiva: 'dias seguidos'
    },
    palavra: { label: 'Semente por palavra', dica: 'Digite uma palavra e jogue a mesma noite de um amigo. Algumas palavras guardam surpresa.', jogar: 'Jogar essa semente' },
    surpresa: { titulo: 'Noite Surpresa', desc: 'A casa escolhe por você: semente nova e regras sorteadas.', jogar: 'Deixar a casa escolher', tooltip: 'semente e regras sorteadas' },
    sortear: { label: 'Sortear regras', zero: 'A casa não pediu nada desta vez.' },
    regraDoDia: 'regra de hoje',
    completude: { titulo: 'A casa ainda esconde', label: 'você já viu', de: 'de tudo', conq: 'conquistas', fin: 'finais', lore: 'acervo', pronto: 'Você viu tudo o que esta casa esconde.' },
    checklist: { titulo: 'Tudo numa noite', final: 'final verdadeiro', ouvida: 'nunca caçada', esconder: 'um capítulo sem esconderijo', morte: 'sem morrer' },
    temaSementes: ['CHUVA', 'SECA', 'CHEIA', 'SANGUE', 'LUA', 'SINO', 'BREU', 'NOVE'],
    regrasTxt: { label: 'Multiplicador de placar', nenhuma: 'Nenhuma regra ligada — noite comum.', liberar: 'As Regras da Casa abrem depois do seu primeiro final.' },
    pontos: { nome: 'Pontos da noite', recorde: 'recorde de pontos', comp: ['ranks', 'silêncio', 'lore', 'tempo', 'sem morte', 'regras'] },
    recordes: {
      titulo: 'Quadro de Recordes',
      vazio: 'Jogue para começar a encher o quadro.',
      somaMelhores: 'corrida teórica perfeita',
      menorRuido: 'noite mais silenciosa',
      menosMortes: 'noite com menos mortes',
      noitePerfeita: 'última Noite Perfeita',
      medalhas: ['ouro', 'prata', 'bronze']
    },
    hall: { titulo: 'Hall da Fama', vazio: 'As cinco melhores noites aparecem aqui.', col: 'tempo' },
    finais: {
      titulo: 'Caça aos Finais',
      visto: 'visto',
      oculto: 'A Hora guarda outro fim aqui.',
      lista: [
        { id: 'comum', nome: 'O portão', dica: 'A saída mais simples: só corra para fora quando o sino calar.' },
        { id: 'silencio', nome: 'O silêncio', dica: 'Alguém aprende a não fazer barulho nem para ir embora.' },
        { id: 'verdadeiro', nome: 'A verdade', dica: 'Ouça tudo o que a casa tem a dizer antes de escolher no portão.' }
      ]
    },
    amigo: { titulo: 'Comparar com um amigo', dica: 'Cole o código de desafio de alguém para montar a mesma noite.', invalido: 'Esse código não faz sentido.', montou: 'Noite montada. Feche este painel e toque em Novo jogo.' },
    giz: { botao: 'Copiar em giz', copiado: 'Copiado!' },
    mudou: { titulo: 'O que mudou esta noite', quadro: 'código do quadro', valvulas: 'ordem das válvulas', cofre: 'números do cofre' },
    faixa: { limpos: 'capítulos limpos seguidos', recorde: 'recorde' },
    medalhasTempo: { label: 'medalha de tempo' }
  };
})();
