// PROGRESSÃO — LOTE 6, 2ª rodada (texto): Calor da Casa, Dádivas da Noite, apostas, estilo da Lia, estrelas,
// necrológio, relíquias, Hora Zero, calendário, Cera de vela, sementes lendárias e alvo de tempo do amigo.
// Só texto e definições; a lógica vive em src/progressao-lote7.js. Empurra para window.ROTEIRO na importação.
(function () {
  const R = window.ROTEIRO; if (!R) return;
  R.progressao = R.progressao || { capitulos: {}, conquistas: [] };

  // --- conquistas novas (à prova de duplicata)
  const CONQ = [
    { id: 'l7_calor3', nome: 'Abafada', desc: 'Vença uma noite no Calor 3 ou mais.' },
    { id: 'l7_calor5', nome: 'Febre', desc: 'Vença uma noite no Calor 5 ou mais.' },
    { id: 'l7_calor10', nome: 'Incêndio de 1979', desc: 'Vença uma noite no Calor 10.', secreta: true },
    { id: 'l7_dadiva1', nome: 'Primeira Dádiva', desc: 'Aceite uma Dádiva da Noite entre dois capítulos.' },
    { id: 'l7_dadiva5', nome: 'Mão Carregada', desc: 'Carregue cinco Dádivas ao mesmo tempo.' },
    { id: 'l7_sem_dadiva', nome: 'Mãos Vazias', desc: 'Vença uma noite sem aceitar nenhuma Dádiva.' },
    { id: 'l7_trato', nome: 'Trato Cumprido', desc: 'Aceite um Trato vermelho e feche o capítulo seguinte sem morrer.', secreta: true },
    { id: 'l7_tres_tratos', nome: 'Assina Qualquer Coisa', desc: 'Aceite três Tratos ao longo das suas noites.', secreta: true },
    { id: 'l7_combo', nome: 'Combinação', desc: 'Descubra uma combinação secreta entre duas Dádivas.', secreta: true },
    { id: 'l7_combo3', nome: 'Alquimista de Cartas', desc: 'Descubra três combinações secretas de Dádivas.', secreta: true },
    { id: 'l7_aposta', nome: 'Jogadora de Palavra', desc: 'Cumpra três apostas feitas entre capítulos.' },
    { id: 'l7_aposta_perdida', nome: 'Perdeu.', desc: 'Quebre uma aposta e deixe o Inspetor mais atento.' },
    { id: 'l7_estrelas10', nome: 'Dez Estrelas', desc: 'Acenda dez estrelas no céu dos capítulos.' },
    { id: 'l7_estrelas30', nome: 'Constelada', desc: 'Acenda as trinta estrelas do céu dos capítulos.', secreta: true },
    { id: 'l7_cinco_estrelas', nome: 'Capítulo Perfeito', desc: 'Acenda as cinco estrelas de um mesmo capítulo.' },
    { id: 'l7_surda', nome: 'Surda de Propósito', desc: 'Termine um capítulo sem o Inspetor ouvir você nem uma vez.', secreta: true },
    { id: 'l7_pavor', nome: 'Temperatura do Pavor', desc: 'Feche um capítulo na faixa mais alta de medo.' },
    { id: 'l7_gelo', nome: 'Sangue de Gelo', desc: 'Feche um capítulo na faixa mais baixa de medo, com o Inspetor solto.' },
    { id: 'l7_necro5', nome: 'Cinco Epitáfios', desc: 'Morra de cinco jeitos diferentes.' },
    { id: 'l7_necro', nome: 'Morreu de Tudo', desc: 'Complete o necrológio: todas as causas de morte.', secreta: true },
    { id: 'l7_divida', nome: 'Dívida Paga', desc: 'Quite a dívida que o Inspetor tem com você.' },
    { id: 'l7_versatil', nome: 'Versátil', desc: 'Cumpra três desafios pessoais diferentes.' },
    { id: 'l7_previsivel', nome: 'Previsível', desc: 'Termine cinco noites com o mesmo epíteto.', secreta: true },
    { id: 'l7_epiteto6', nome: 'Muitas Caras', desc: 'Receba seis epítetos diferentes ao fim das noites.' },
    { id: 'l7_herdeira', nome: 'Herdeira', desc: 'Comece uma noite levando a relíquia da anterior.' },
    { id: 'l7_hora_zero', nome: 'A Hora Zero', desc: 'Vença a Hora Zero: uma vida e nenhuma barra na tela.', secreta: true },
    { id: 'l7_vela7', nome: 'Sete Velas', desc: 'Jogue sete dias seguidos.' },
    { id: 'l7_vela30', nome: 'Trinta Velas', desc: 'Jogue trinta dias, seguidos ou não.', secreta: true },
    { id: 'l7_serie3', nome: 'Série de Três', desc: 'Três noites seguidas sem morrer.' },
    { id: 'l7_serie5', nome: 'Série de Cinco', desc: 'Cinco noites seguidas sem morrer.', secreta: true },
    { id: 'l7_serie10', nome: 'Série de Dez', desc: 'Dez noites seguidas sem morrer.', secreta: true },
    { id: 'l7_tarefas', nome: 'Dia Cumprido', desc: 'Cumpra as três tarefas do dia.' },
    { id: 'l7_semana', nome: 'Semana Cumprida', desc: 'Cumpra as três missões da semana.' },
    { id: 'l7_mes', nome: 'Maldição do Mês', desc: 'Vença uma noite com a maldição do mês ligada.' },
    { id: 'l7_datas', nome: 'Calendário Folclórico', desc: 'Jogue em todas as datas especiais da Serra.', secreta: true },
    { id: 'l7_primeira_vez', nome: 'A Primeiríssima Vez', desc: 'Termine o Prólogo da primeira noite sem morrer. Só dá uma vez na vida.', secreta: true },
    { id: 'l7_noite7', nome: 'Sete Toques', desc: 'Sobreviva à sétima noite.', secreta: true },
    { id: 'l7_noite13', nome: 'Fita Treze', desc: 'Sobreviva à décima terceira noite.', secreta: true },
    { id: 'l7_noite31', nome: 'Terra no Rosto', desc: 'Sobreviva à trigésima primeira noite.', secreta: true },
    { id: 'l7_noite66', nome: 'Todas as Portas', desc: 'Sobreviva à sexagésima sexta noite.', secreta: true },
    { id: 'l7_patente6', nome: 'Chaveira', desc: 'Chegue à patente de Chaveira.' },
    { id: 'l7_patente12', nome: 'Zeladora', desc: 'Chegue à patente de Zeladora, a mais alta do internato.', secreta: true },
    { id: 'l7_bingo', nome: 'Bingo!', desc: 'Feche uma linha da cartela de bingo da noite.' },
    { id: 'l7_bingo_cheio', nome: 'Cartela Cheia', desc: 'Preencha a cartela de bingo inteira numa só noite.', secreta: true },
    { id: 'l7_vhs', nome: 'Videoteca', desc: 'Veja os três finais em ao menos duas dificuldades cada.', secreta: true },
    { id: 'l7_alvo', nome: 'Alvo Batido', desc: 'Vença o tempo de um amigo no desafio por código.' },
    { id: 'l7_alvo_devolvido', nome: 'Devolveu na Hora', desc: 'Gere um código de desafio com o seu tempo para devolver a um amigo.' },
    { id: 'l7_cera100', nome: 'Cera Derretida', desc: 'Junte cem de Cera de vela.' },
    { id: 'l7_altar', nome: 'Altar Montado', desc: 'Compre um título no Altar de cera.' },
    { id: 'l7_lendaria', nome: 'Semente Lendária', desc: 'Vença uma noite numa das sementes lendárias.' },
    { id: 'l7_cat_sem_dano', nome: 'Sem Dano, Sem Fita', desc: 'Grave um recorde na categoria "sem dano".' },
    { id: 'l7_v_prologo', nome: 'Nem Saiu do Carro', desc: 'Morra nos primeiros dez segundos do Prólogo.', secreta: true },
    { id: 'l7_v_ana3', nome: 'Gosta de Contar', desc: 'Morra para a Menina três vezes no mesmo capítulo.', secreta: true },
    { id: 'l7_v_escuro', nome: 'Poste', desc: 'Fique três minutos parada no escuro dentro de um capítulo.', secreta: true },
    { id: 'l7_v_garrafa', nome: 'Tiro no Pé', desc: 'Morra em até cinco segundos depois de jogar uma garrafa.', secreta: true },
    { id: 'l7_v_pisca', nome: 'Pisca-Pisca', desc: 'Ligue e desligue a lanterna vinte vezes no mesmo capítulo.', secreta: true },
    { id: 'l7_v_armario', nome: 'Armário Teimoso', desc: 'Fique escondida noventa segundos seguidos.', secreta: true },
    { id: 'l7_v_correndo', nome: 'Correu Direto', desc: 'Morra correndo três vezes na mesma noite.', secreta: true }
  ];
  R.conquistas = R.conquistas || [];
  for (const c of CONQ) if (!R.conquistas.some(x => x.id === c.id)) R.conquistas.push(c);

  R.progressao.lote7 = {
    hub: {
      titulo: 'A Casa',
      aviso: 'Calor, Dádivas, estrelas, estilo, necrológio, calendário e o Altar de cera: a casa que cresce com você.',
      abas: [['calor', 'Calor'], ['dadivas', 'Dádivas'], ['estrelas', 'Estrelas'], ['estilo', 'Estilo'], ['mortes', 'Necrológio'], ['sementes', 'Sementes'], ['calendario', 'Calendário'], ['altar', 'Altar'], ['modos', 'Modos & Códigos']]
    },
    botao: 'A Casa',

    // --- Calor da Casa
    calor: {
      nomes: ['Brasa', 'Morno', 'Abafado', 'Quente', 'Febre', 'Fervura', 'Chama', 'Labareda', 'Fornalha', 'Incêndio de 1979'],
      frases: [
        'A casa como ela é.', 'O Inspetor começa a ouvir um pouco mais.', 'O ar fica pesado e a lanterna cansa mais depressa.', 'Ele anda com mais pressa.',
        'A Procissão avisa menos.', 'Tudo que se move acontece mais vezes.', 'Ele ouve do outro lado da parede.', 'A lanterna quase não dura.', 'Não existe mais corredor seguro.', 'Como em 1979: o internato inteiro acordado.'
      ],
      titulo: 'Calor da Casa',
      desc: 'Cada final visto libera um degrau a mais. Os degraus se acumulam: no Calor 6 valem também os cinco anteriores.',
      liberado: 'Calor {n} liberado.',
      selo: 'Selo de Calor',
      recompensa: 'Cera por noite vencida neste Calor',
      sortear: 'Sortear Calor e semente'
    },

    // --- Dádivas da Noite: ef = fatores que entram no motor (ruido = passos; ouvido/vel/pilha/dano/intervalo = multiplicadores; aviso = segundos somados)
    cartas: [
      { id: 'pes_la', nome: 'Pés de Lã', ganho: 'seus passos fazem 25% menos barulho', preco: 'a lanterna gasta 30% mais pilha', ef: { ruido: .75, pilha: 1.3 } },
      { id: 'olho_gato', nome: 'Olho de Gato', ganho: 'a Procissão avisa 2 segundos antes', preco: 'o Inspetor ouve 10% mais longe', ef: { aviso: 2, ouvido: 1.1 } },
      { id: 'pilha_boa', nome: 'Pilha Boa', ganho: 'uma pilha na mochila agora', preco: 'todo toque machuca 15% mais', ef: { dano: 1.15 }, extra: { pilhas: 1 } },
      { id: 'cera_ouvido', nome: 'Cera nos Ouvidos', ganho: 'o Inspetor ouve 15% menos longe', preco: 'a Procissão avisa 1,5 segundo mais tarde', ef: { ouvido: .85, aviso: -1.5 } },
      { id: 'folego_longo', nome: 'Fôlego Longo', ganho: 'seus passos soam 10% mais baixos', preco: 'o Inspetor anda 6% mais rápido', ef: { ruido: .9, vel: 1.06 } },
      { id: 'pele_grossa', nome: 'Pele Grossa', ganho: 'todo toque machuca 25% menos', preco: 'seus passos soam 15% mais altos', ef: { dano: .75, ruido: 1.15 } },
      { id: 'vela_curta', nome: 'Vela Curta', ganho: 'duas pilhas na mochila agora', preco: 'a lanterna gasta 50% mais pilha', ef: { pilha: 1.5 }, extra: { pilhas: 2 } },
      { id: 'sino_rachado', nome: 'Sino Rachado', ganho: 'a Procissão avisa 4 segundos antes', preco: 'o Inspetor ouve 15% mais longe', ef: { aviso: 4, ouvido: 1.15 } },
      { id: 'sombra_emprestada', nome: 'Sombra Emprestada', ganho: 'o Inspetor anda 8% mais devagar', preco: 'tudo o que ronda aparece 15% mais vezes', ef: { vel: .92, intervalo: .85 } },
      { id: 'mao_fechada', nome: 'Mão Fechada', ganho: 'a lanterna gasta 30% menos pilha', preco: 'todo toque machuca 20% mais', ef: { pilha: .7, dano: 1.2 } },
      { id: 'passo_largo', nome: 'Passo Largo', ganho: 'o Inspetor anda 10% mais devagar', preco: 'seus passos soam 25% mais altos', ef: { vel: .9, ruido: 1.25 } },
      { id: 'paciencia_ana', nome: 'Paciência da Ana', ganho: 'as aparições demoram 25% mais para vir', preco: 'o Inspetor ouve 12% mais longe', ef: { intervalo: 1.25, ouvido: 1.12 } },
      { id: 'nariz_frio', nome: 'Nariz Frio', ganho: 'o Inspetor ouve 10% menos longe e a Procissão avisa 1 segundo antes', preco: 'ele anda 4% mais rápido', ef: { ouvido: .9, aviso: 1, vel: 1.04 } },
      { id: 'pavio_umido', nome: 'Pavio Úmido', ganho: 'a lanterna gasta 20% menos pilha', preco: 'a Procissão avisa 1 segundo mais tarde', ef: { pilha: .8, aviso: -1 } },
      { id: 'calos', nome: 'Calos', ganho: 'todo toque machuca 15% menos', preco: 'a lanterna gasta 15% mais pilha', ef: { dano: .85, pilha: 1.15 } },
      { id: 'moeda_lingua', nome: 'Moeda na Língua', ganho: 'um curativo na mochila agora', preco: 'o Inspetor ouve 8% mais longe', ef: { ouvido: 1.08 }, extra: { kits: 1 } }
    ],
    // cartas que só entram no baralho depois de um feito (a dica aparece em silhueta no painel)
    bloqueadas: [
      { id: 'sangue_frio', nome: 'Sangue Frio', ganho: 'todo toque machuca 20% menos e ele anda 3% mais devagar', preco: 'seus passos soam 10% mais altos', ef: { dano: .8, vel: .97, ruido: 1.1 }, dica: 'Escape dez vezes do Inspetor a um passo de você.' },
      { id: 'maos_limpas', nome: 'Mãos Limpas', ganho: 'uma pilha na mochila agora e a lanterna gasta 10% menos', preco: 'o Inspetor ouve 8% mais longe', ef: { pilha: .9, ouvido: 1.08 }, extra: { pilhas: 1 }, dica: 'Vença uma noite sem jogar nenhuma garrafa.' },
      { id: 'pulmao_ferro', nome: 'Pulmão de Ferro', ganho: 'seus passos soam 20% mais baixos', preco: 'a lanterna gasta 20% mais pilha', ef: { ruido: .8, pilha: 1.2 }, dica: 'Feche um capítulo com rank S.' },
      { id: 'herdeira', nome: 'Herança da Casa', ganho: 'um curativo e uma pilha agora', preco: 'a Procissão avisa 2 segundos mais tarde', ef: { aviso: -2 }, extra: { pilhas: 1, kits: 1 }, dica: 'Veja um final do jogo.' }
    ],
    tratos: [
      { id: 'trato_davi', nome: 'Trato do Davi', ganho: 'a lanterna quase não gasta pilha (60% menos)', preco: 'o Inspetor ouve 40% mais longe durante o próximo capítulo', ef: { pilha: .4, ouvido: 1.4 } },
      { id: 'trato_celeste', nome: 'Trato da Celeste', ganho: 'todo toque machuca pela metade', preco: 'o Inspetor anda 20% mais rápido durante o próximo capítulo', ef: { dano: .5, vel: 1.2 } },
      { id: 'trato_albano', nome: 'Trato do Albano', ganho: 'seus passos soam 40% mais baixos', preco: 'tudo o que ronda aparece 30% mais vezes durante o próximo capítulo', ef: { ruido: .6, intervalo: .7 } }
    ],
    // maldições da Hora Zero: só custo, uma por capítulo
    malTitulo: 'Maldição da Hora Zero',
    maldicoes: [
      { id: 'mal_ouvido', nome: 'Orelha da Parede', preco: 'o Inspetor ouve 12% mais longe', ef: { ouvido: 1.12 } },
      { id: 'mal_pilha', nome: 'Escuridão Sedenta', preco: 'a lanterna gasta 25% mais pilha', ef: { pilha: 1.25 } },
      { id: 'mal_ruido', nome: 'Passos de Chumbo', preco: 'seus passos soam 15% mais altos', ef: { ruido: 1.15 } },
      { id: 'mal_dano', nome: 'Pele de Papel', preco: 'todo toque machuca 20% mais', ef: { dano: 1.2 } },
      { id: 'mal_vel', nome: 'Pressa Dele', preco: 'o Inspetor anda 7% mais rápido', ef: { vel: 1.07 } }
    ],
    combos: [
      { id: 'sombra_mansa', a: 'pes_la', b: 'folego_longo', nome: 'Sombra Mansa', desc: 'Pés de Lã + Fôlego Longo: seus passos ficam ainda 15% mais baixos.', ef: { ruido: .85 } },
      { id: 'faro_duplo', a: 'olho_gato', b: 'nariz_frio', nome: 'Faro Duplo', desc: 'Olho de Gato + Nariz Frio: a Procissão avisa mais 1 segundo antes.', ef: { aviso: 1 } },
      { id: 'punhos_pedra', a: 'pele_grossa', b: 'calos', nome: 'Punhos de Pedra', desc: 'Pele Grossa + Calos: todo toque machuca mais 10% menos.', ef: { dano: .9 } },
      { id: 'luz_demais', a: 'vela_curta', b: 'pilha_boa', nome: 'Luz Demais', desc: 'Vela Curta + Pilha Boa: a lanterna gasta menos 15%, mas ele ouve 8% mais longe.', ef: { pilha: .85, ouvido: 1.08 } },
      { id: 'tapa_ouvido', a: 'cera_ouvido', b: 'pavio_umido', nome: 'Tapa-Ouvido', desc: 'Cera nos Ouvidos + Pavio Úmido: o Inspetor ouve mais 8% menos longe.', ef: { ouvido: .92 } }
    ],
    cartasTxt: {
      titulo: 'Dádivas da Noite',
      dica: 'Escolha uma carta (1, 2 ou 3) ou toque nela. 0 recusa tudo. Vale até o fim da noite, no máximo cinco.',
      aposta: 'Aposta para o próximo capítulo (4, 5 ou 6)',
      vermelha: 'TRATO',
      recusou: 'Você recusou as cartas. A casa anota.',
      aceitou: 'Dádiva aceita: {n}.',
      cheia: 'Cinco dádivas na mão: a mais antiga ({n}) se desfez.',
      trato: 'Trato aceito: {n}. Some quando o próximo capítulo acabar.',
      tratoCumprido: 'Trato cumprido: +1500 pontos e Cera em dobro.',
      tratoFim: 'O Trato se desfez.',
      semCartas: 'Nenhuma Dádiva carregada.',
      combo: 'Combinação secreta: {n}.'
    },

    apostas: [
      { id: 'sem_esconder', nome: 'Sem me esconder', desc: 'Fechar o capítulo sem usar nenhum esconderijo.' },
      { id: 'sem_morrer', nome: 'Sem morrer', desc: 'Fechar o capítulo sem uma morte.' },
      { id: 'sem_dano', nome: 'Sem levar dano', desc: 'Fechar o capítulo sem um arranhão.' },
      { id: 'tempo', nome: 'Abaixo da meta', desc: 'Fechar o capítulo abaixo do tempo de rank S.' },
      { id: 'sem_garrafa', nome: 'Sem garrafa', desc: 'Fechar o capítulo sem jogar uma garrafa.' },
      { id: 'pouca_luz', nome: 'No escuro', desc: 'Fechar o capítulo com a lanterna acesa por menos de um minuto.' }
    ],
    apostasTxt: { cumpriu: 'aposta cumprida: {n} (+600 pontos e Cera)', perdeu: 'aposta quebrada: {n}. Perdeu. O Inspetor entra mais atento no próximo capítulo.', ativa: 'aposta' },

    // --- estilo, epítetos e desafios pessoais
    epitetos: [
      { id: 'sombra', nome: 'A Sombra', frase: 'Quase não correu. A casa nem notou você passar.' },
      { id: 'teimosa', nome: 'A Teimosa', frase: 'Morreu muito e voltou sempre. A casa respeita isso.' },
      { id: 'toupeira', nome: 'A Toupeira', frase: 'Passou metade da noite dentro de um armário.' },
      { id: 'corredora', nome: 'A Corredora', frase: 'Correu até o fôlego acabar. Funcionou, às vezes.' },
      { id: 'gata', nome: 'A Gata', frase: 'Andou agachada quase o caminho todo.' },
      { id: 'estatua', nome: 'A Estátua', frase: 'Esperou parada mais do que andou.' },
      { id: 'vagalume', nome: 'A Vagalume', frase: 'A lanterna ficou acesa quase a noite inteira.' },
      { id: 'cega', nome: 'A Cega', frase: 'Aprendeu a andar no escuro, como ele.' },
      { id: 'ilusionista', nome: 'A Ilusionista', frase: 'Jogou garrafa em tudo que era canto.' },
      { id: 'cirurgia', nome: 'A Cirurgiã', frase: 'Quase nenhum arranhão. Cada passo foi medido.' },
      { id: 'relampago', nome: 'A Relâmpago', frase: 'Cruzou a Hora em menos de quarenta minutos.' },
      { id: 'que_volta', nome: 'A Que Volta', frase: 'Sem um traço dominante: a casa ainda está te estudando.' }
    ],
    desafiosPessoais: {
      corredora: { id: 'semcorrer', nome: 'Pés no Chão', desc: 'Termine a noite correndo menos de 3% do tempo.' },
      gata: { id: 'semagachar', nome: 'De Pé', desc: 'Termine a noite agachada menos de 3% do tempo.' },
      toupeira: { id: 'semesconder', nome: 'A Céu Aberto', desc: 'Termine a noite sem usar nenhum esconderijo.' },
      estatua: { id: 'semparar', nome: 'Sempre em Movimento', desc: 'Termine a noite parada menos de 12% do tempo.' },
      ilusionista: { id: 'semgarrafa', nome: 'Mãos Vazias', desc: 'Termine a noite sem jogar uma garrafa.' },
      vagalume: { id: 'pouca_luz', nome: 'Luz Contada', desc: 'Termine a noite com a lanterna acesa menos de 25% do tempo.' },
      cega: { id: 'luz_certa', nome: 'Luz Certa', desc: 'Termine a noite com a lanterna acesa mais de 50% do tempo.' },
      sombra: { id: 'semagachar', nome: 'De Pé', desc: 'Termine a noite agachada menos de 3% do tempo.' },
      teimosa: { id: 'semmorte', nome: 'Uma Só Vez', desc: 'Termine a noite sem morrer.' },
      cirurgia: { id: 'rapido', nome: 'Sem Cuidado Nenhum', desc: 'Termine a noite em menos de quarenta e cinco minutos.' },
      relampago: { id: 'semcorrer', nome: 'Pés no Chão', desc: 'Termine a noite correndo menos de 3% do tempo.' },
      que_volta: { id: 'semmorte', nome: 'Uma Só Vez', desc: 'Termine a noite sem morrer.' }
    },
    estiloTxt: { titulo: 'Seu jeito de jogar', vazio: 'Termine uma noite para a casa desenhar o seu retrato.', correu: 'correndo', agachou: 'agachada', escondeu: 'escondida', parou: 'parada', luz: 'lanterna acesa', aceitar: 'Aceitar o desafio pessoal', aceito: 'Desafio pessoal aceito para a próxima noite', cumprido: 'Desafio pessoal cumprido: {n}. Título liberado.', falhou: 'Desafio pessoal não cumprido: {n}. A casa te propõe outro.', proposta: 'Para a próxima noite', repetiu: 'A Lia: "De novo isso? A casa já sabe quem eu sou."' },

    // --- patentes
    patentes: ['Visitante', 'Interna', 'Monitora', 'Fiscal de Corredor', 'Encarregada da Rouparia', 'Chaveira', 'Cantora do Hino', 'Vigia da Capela', 'Guardiã do Sino', 'Madrinha da Hora', 'Subdiretora', 'Zeladora'],
    patenteLim: [0, 3, 8, 15, 25, 38, 55, 75, 100, 130, 170, 220],

    // --- estrelas e medo
    estrelas: { nomes: ['terminar', 'sem dano', 'lanterna quase sempre apagada', 'sem esconderijo', 'tempo de ouro'], titulo: 'Céu dos capítulos', aviso: 'Cinco estrelas por capítulo. Elas só acendem, nunca apagam.', acendeu: 'estrelas do capítulo: {s} ({n}/5)', nova: 'nova estrela: {n}' },
    medo: { faixas: ['Gelo', 'Frio', 'Febre', 'Delírio', 'Pavor'], linha: 'temperatura do terror: <b>{f}</b>', melhor: 'sua faixa mais alta neste capítulo foi {f}' },
    ouvida: { linha: 'o Inspetor ficou atento por {t}s ({m})', zerou: 'prata: ele não ouviu você uma vez', bronze: 'bronze', nenhum: '' },
    top3: { titulo: 'três melhores', linha: 'seus três melhores tempos: {l}', dif: 'diferença para o melhor' },

    // --- necrológio (causas e epitáfios do Davi)
    necro: {
      titulo: 'Necrológio',
      aviso: 'Cada jeito diferente de ser encontrada ganha uma ficha com epitáfio do Davi. Morra de tudo.',
      vazio: 'ainda não aconteceu',
      fichas: [
        { id: 'inspetor_correndo', nome: 'Pega correndo', epi: 'Ela correu, e o chão contou a ele onde ela estava. — Davi' },
        { id: 'inspetor_agachada', nome: 'Pega agachada', epi: 'Até pequena demais para a Hora. — Davi' },
        { id: 'inspetor_parada', nome: 'Pega parada', epi: 'Ficou quieta. Ele também. Mas ele esperou mais. — Davi' },
        { id: 'inspetor_andando', nome: 'Pega andando', epi: 'Um passo a mais. Eu avisei. — Davi' },
        { id: 'inspetor_agua', nome: 'Pega na água', epi: 'A água fala por ela. — Davi' },
        { id: 'inspetor_fuga', nome: 'Pega na fuga do sino', epi: 'Perto demais da porta. Perto demais de mim. — Davi' },
        { id: 'inspetor_escondida', nome: 'Pega saindo do esconderijo', epi: 'Ela saiu cedo. Ele já tinha contado. — Davi' },
        { id: 'ana_escuro', nome: 'Pega pela Menina, no escuro', epi: 'Sem luz, a Ana conta mais depressa. — Davi' },
        { id: 'ana_luz', nome: 'Pega pela Menina, de costas', epi: 'Dez. Ela sempre chega no dez. — Davi' },
        { id: 'procissao_fora', nome: 'Levada pela Procissão', epi: 'Eram nove luzes. A décima era ela. — Davi' },
        { id: 'procissao_cap2', nome: 'Levada na primeira Procissão', epi: 'Toda criança erra a primeira. — Davi' },
        { id: 'qualquer_noite_13', nome: 'Morta numa sexta-feira treze', epi: 'Nesse dia ele conta em dobro. — Davi' }
      ]
    },
    divida: { fala: 'A casa me deve dez de você. Hoje eu cobro.', quitada: 'Dívida paga. A casa devolve o que é seu.', linha: 'dívida do Inspetor: {n}/10' },

    // --- relíquias
    reliquias: [
      { id: 'botao_davi', nome: 'Botão do Davi', ganho: 'uma pilha a mais no começo', preco: 'ele ouve 5% mais longe', ef: { ouvido: 1.05 }, extra: { pilhas: 1 } },
      { id: 'apito_quebrado', nome: 'Apito Quebrado', ganho: 'ele ouve 8% menos longe', preco: 'a lanterna gasta 10% mais', ef: { ouvido: .92, pilha: 1.1 } },
      { id: 'giz_ana', nome: 'Giz da Ana', ganho: 'a Procissão avisa 2 segundos antes', preco: 'todo toque machuca 10% mais', ef: { aviso: 2, dano: 1.1 } },
      { id: 'moeda_davi', nome: 'Moeda do Davi', ganho: 'todo toque machuca 20% menos', preco: 'seus passos soam 12% mais altos', ef: { dano: .8, ruido: 1.12 } },
      { id: 'chave_mestra', nome: 'Chave-Mestra', ganho: 'um curativo no começo', preco: 'ele anda 4% mais rápido', ef: { vel: 1.04 }, extra: { kits: 1 } },
      { id: 'fosforos', nome: 'Fósforos Úmidos', ganho: 'seus passos soam 10% mais baixos', preco: 'a lanterna gasta 20% mais', ef: { ruido: .9, pilha: 1.2 } },
      { id: 'carrinho_azul', nome: 'Carrinho Azul', ganho: 'as aparições demoram 15% mais para vir', preco: 'ele ouve 8% mais longe', ef: { intervalo: 1.15, ouvido: 1.08 } },
      { id: 'corda_sino', nome: 'Corda do Sino', ganho: 'a Procissão avisa 3 segundos antes', preco: 'ele anda 5% mais rápido', ef: { aviso: 3, vel: 1.05 } }
    ],
    relTxt: { titulo: 'Herança da Lia', dica: 'Leve uma coisa para a próxima noite. Só uma. O resto some.', levou: 'Você deixou {n} no banco do carro para a próxima noite.', mala: 'Na mala' },

    // --- Hora Zero
    horaZero: {
      nome: 'Hora Zero', desc: 'Uma vida só, nenhuma barra na tela e uma maldição nova a cada capítulo. Abre depois de três finais.',
      bloqueada: 'Veja três finais para abrir a Hora Zero.',
      pontos: 'Pontos da Hora Zero',
      final: 'A Lia sai em silêncio. O amanhecer não tem som, e ela entende que nunca precisou de nenhum.',
      recorde: 'Melhor Hora Zero'
    },

    // --- calendário
    calendario: {
      titulo: 'Calendário de velas', velas: 'velas acesas nos últimos 30 dias', serie: 'dias seguidos', falta: 'A casa esperou {d} dias por você.',
      falta14: 'A casa esperou {d} dias. O Inspetor ficou impaciente, mas deixaram uma pilha de boas-vindas no porta-malas.',
      volta: 'A casa sentiu a sua falta.',
      noites: 'noites jogadas', serieNoites: 'noites seguidas sem morrer', serieRec: 'recorde de série'
    },
    datas: [
      { id: 'd1403', dia: 14, mes: 3, nome: '14 de março', dica: 'A noite do incêndio de 1979.' },
      { id: 'd2406', dia: 24, mes: 6, nome: 'São João', dica: 'Fogueiras longe, silêncio perto.' },
      { id: 'd2709', dia: 27, mes: 9, nome: 'Cosme e Damião', dica: 'Doces para as crianças que não saíram.' },
      { id: 'd3110', dia: 31, mes: 10, nome: 'Noite das Bruxas', dica: 'A última noite de outubro.' },
      { id: 'd0211', dia: 2, mes: 11, nome: 'Finados', dica: 'O dia em que se visitam as covas.' },
      { id: 'sexta13', nome: 'Sexta-feira treze', dica: 'Em toda sexta que cai no dia treze.' }
    ],
    tarefasDia: [
      { id: 'esconder', nome: 'Esconda-se uma vez', ev: 'esc' },
      { id: 'garrafa', nome: 'Jogue uma garrafa', ev: 'garr' },
      { id: 'agachar', nome: 'Ande agachada por vinte segundos', ev: 'agach' },
      { id: 'lanterna', nome: 'Acenda a lanterna', ev: 'luz' },
      { id: 'cap2', nome: 'Chegue ao Capítulo II', ev: 'cap2' },
      { id: 'curativo', nome: 'Use um curativo', ev: 'kit' },
      { id: 'perto', nome: 'Escape do Inspetor a um passo', ev: 'perto' },
      { id: 'lore', nome: 'Leia uma nota, página ou fita', ev: 'lore' },
      { id: 'escuro', nome: 'Fique um minuto no escuro dentro da casa', ev: 'escuro' }
    ],
    semana: [
      { id: 'caps_sem_garrafa', nome: 'Feche dois capítulos sem jogar garrafa', alvo: 2 },
      { id: 'caps_sem_dano', nome: 'Feche dois capítulos sem dano', alvo: 2 },
      { id: 'caps_sem_esconder', nome: 'Feche dois capítulos sem se esconder', alvo: 2 },
      { id: 'caps_ouro', nome: 'Feche um capítulo no tempo de ouro', alvo: 1 },
      { id: 'caps_total', nome: 'Feche cinco capítulos', alvo: 5 },
      { id: 'perto', nome: 'Escape do Inspetor a um passo quatro vezes', alvo: 4 }
    ],
    meses: [
      { nome: 'Janeiro: Brasa Fria', desc: 'a lanterna dura 5% mais', ef: { pilha: .95 } },
      { nome: 'Fevereiro: Serpentina', desc: 'tudo o que ronda aparece 5% mais vezes', ef: { intervalo: .95 } },
      { nome: 'Março: Cinzas', desc: 'o Inspetor ouve 4% mais longe', ef: { ouvido: 1.04 } },
      { nome: 'Abril: Chuva Miúda', desc: 'seus passos soam 5% mais baixos', ef: { ruido: .95 } },
      { nome: 'Maio: Terço', desc: 'todo toque machuca 5% menos', ef: { dano: .95 } },
      { nome: 'Junho: Fogueira', desc: 'a lanterna gasta 6% mais', ef: { pilha: 1.06 } },
      { nome: 'Julho: Geada', desc: 'o Inspetor anda 3% mais devagar e a Procissão avisa 1 segundo mais tarde', ef: { vel: .97, aviso: -1 } },
      { nome: 'Agosto: Cachorro Louco', desc: 'o Inspetor ouve 5% mais longe', ef: { ouvido: 1.05 } },
      { nome: 'Setembro: Doces', desc: 'a Procissão avisa 1 segundo antes', ef: { aviso: 1 } },
      { nome: 'Outubro: Velas', desc: 'a lanterna dura 8% mais, mas ele ouve 3% mais longe', ef: { pilha: .92, ouvido: 1.03 } },
      { nome: 'Novembro: Névoa', desc: 'a Procissão avisa 1 segundo mais tarde, mas seus passos soam 8% mais baixos', ef: { aviso: -1, ruido: .92 } },
      { nome: 'Dezembro: Eco', desc: 'o Inspetor ouve 4% mais longe e anda 3% mais devagar', ef: { ouvido: 1.04, vel: .97 } }
    ],
    mesTxt: { label: 'Maldição do mês', ligar: 'Ligar a maldição do mês nas minhas noites', selo: 'Selos dos meses vencidos' },
    noitesMarcadas: {
      7: 'Sete badaladas para a sétima noite. A casa contou você.',
      13: 'Treze. Alguém ligou a câmera de fita antes de você chegar.',
      31: 'Tem terra no seu rosto. Você acordou no carro assim.',
      66: 'Todas as portas estão abertas. Do jeito errado.'
    },

    // --- bingo da noite
    bingo: {
      titulo: 'Bingo da noite',
      itens: [
        { ev: 'esc', nome: 'esconder-se' }, { ev: 'garr', nome: 'jogar uma garrafa' }, { ev: 'agach', nome: 'agachar por 20 s' }, { ev: 'corre', nome: 'correr por 15 s' },
        { ev: 'parada', nome: 'ficar 30 s parada' }, { ev: 'kit', nome: 'usar um curativo' }, { ev: 'perto', nome: 'escapar rente a ele' }, { ev: 'luz', nome: 'acender a lanterna' },
        { ev: 'escuro', nome: '60 s no escuro dentro da casa' }, { ev: 'cap2', nome: 'chegar ao Capítulo II' }, { ev: 'lore', nome: 'ler uma nota, página ou fita' }, { ev: 'chamResp', nome: 'responder ao Chamado' },
        { ev: 'chamIgn', nome: 'ignorar o Chamado' }, { ev: 'dano', nome: 'levar dano e seguir' }
      ],
      linha: 'linha fechada no bingo: +300 pontos e Cera',
      cheia: 'cartela cheia: +1000 pontos'
    },

    // --- Cera e Altar
    cera: { nome: 'Cera de vela', altar: 'Altar de cera', aviso: 'Cera derretida das velas da casa. Compra títulos e molduras; nunca dá vantagem de jogo.', saldo: 'saldo', comprar: 'Comprar', ativo: 'em uso', usar: 'Usar' },
    altar: [
      { id: 'a_vela', nome: 'A Que Acende Velas', preco: 60 },
      { id: 'a_cinza', nome: 'Filha da Cinza', preco: 90 },
      { id: 'a_hino', nome: 'Voz do Hino', preco: 120 },
      { id: 'a_chave', nome: 'Portadora da Chave', preco: 160 },
      { id: 'a_sino', nome: 'Dona do Sino', preco: 220 },
      { id: 'a_albano', nome: 'Amiga do Albano', preco: 300 },
      { id: 'a_davi', nome: 'Irmã do Davi', preco: 420 },
      { id: 'a_hora', nome: 'Senhora da Hora', preco: 600 }
    ],

    // --- sementes lendárias
    sementes: [
      { id: 'MANSA7', nome: 'A Mais Silenciosa', desc: 'Uma noite de chuva fina onde o chão perdoa mais.' },
      { id: 'CORRED', nome: 'O Corredor Sem Fim', desc: 'Parece que o corredor do térreo não acaba nunca.' },
      { id: 'CRUEL9', nome: 'A Mais Cruel', desc: 'O Inspetor sempre acorda do lado errado da casa.' },
      { id: 'BRASA3', nome: 'A Noite da Brasa', desc: 'O cheiro de 1979 não sai do ar.' },
      { id: 'FAISCA', nome: 'A Noite da Faísca', desc: 'O gato aparece onde menos se espera.' },
      { id: 'ALBANO', nome: 'A Noite Cega do Albano', desc: 'Cornetas ao longe e o diretor em toda parte.' },
      { id: 'GIRAS0', nome: 'A Noite do Girassol', desc: 'Calma por fora, tensa por dentro.' },
      { id: 'VENDAV', nome: 'A Noite do Vendaval', desc: 'Janelas batendo e passos disfarçados.' },
      { id: 'LUZ2AM', nome: 'A Luz das Duas', desc: 'Ele dorme mais tarde, e você não.' },
      { id: 'FITA90', nome: 'A Fita Noventa', desc: 'Todo mundo diz que é a que mais dá medo de ouvir.' },
      { id: 'GATA13', nome: 'A Gata Treze', desc: 'Azar de quem corre.' },
      { id: 'SINO9X', nome: 'O Sino das Nove', desc: 'Os capítulos parecem acabar sempre nas badaladas.' }
    ],
    sementesTxt: { titulo: 'Sementes lendárias', aviso: 'Doze noites com apelido, para marcar com os amigos. A semente fixa as senhas e a ordem das coisas; o resto você aprende jogando.', jogar: 'Jogar esta semente', copiar: 'Copiar o código', favoritas: 'Suas favoritas', fav: 'Guardar semente', favGuardada: 'Semente guardada nas favoritas.', vazio: 'Nenhuma favorita ainda: aperte F na tela de fim de capítulo para guardar a semente da noite.' },

    // --- alvo do amigo
    alvo: {
      titulo: 'Alvo de tempo',
      aviso: 'Cole o código de um amigo (ALVO:SEMENTE:DIF:SEGUNDOS:NOME) para jogar a mesma noite tentando bater o tempo dele. Ao terminar, o jogo gera o seu código para devolver.',
      invalido: 'Esse código de alvo não faz sentido.',
      montou: 'Alvo montado: vencer {n} em {t}. Volte ao título e comece o Novo jogo.',
      hud: 'Vencer {n}: {t}',
      venceu: 'Você venceu {n} por {d}.',
      perdeu: 'Faltou {d} para vencer {n}.',
      devolver: 'Devolver o desafio',
      copiado: 'Código copiado!',
      nome: 'seu nome'
    },
    categorias: { titulo: 'Recordes por categoria', nomes: { qualquer: 'Qualquer final', verdadeiro: 'Final verdadeiro', sem_dano: 'Sem dano', sem_luz: 'Pouca lanterna', sem_esconder: 'Sem esconderijo' } },
    vhs: { titulo: 'Videoteca', aviso: 'Uma fita para cada final em cada dificuldade.' },
    fcNoite: { titulo: 'a casa lembra' }
  };
})();
