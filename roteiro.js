// ROTEIRO — A HORA DO SILÊNCIO (v2)
// Todo o texto do jogo mora aqui. O motor lê window.ROTEIRO.
// Pode reescrever à vontade, mas mantenha os mesmos "id" (capítulos, objetivos, notas, fitas, falas).
// Marcadores trocados em jogo: {q} código do quadro · {d1}..{d4} dígitos do cofre · {v} ordem das válvulas
// Em "falas", uma chave pode ter variações: [[...linhas A], [...linhas B]] — o motor sorteia uma.
// Notas, páginas e fitas com "secreta: true" não contam para o total do diário (são segredos de verdade).
window.ROTEIRO = {
  titulo: "A HORA DO SILÊNCIO",
  subtitulo: "Internato São Lázaro · Serra da Mantiqueira · 1994",
  versao: "v2 · roteiro Claude",
  // subtítulos que o título usa conforme o que o jogador já viveu
  subtitulos: {
    nove: "A HORA COMEÇOU",
    depoisVerdadeiro: "O sino parou. O internato, enfim, dorme. · 1994",
    depoisSilencio: "Nove badaladas, toda noite. Alguém ficou lá dentro. · 1994",
    depoisComum: "Você saiu. Mas a Hora ainda não acabou. · 1994",
    noveCliques: "a hora não acabou",
    fitaGasta: "ele não é cego de tudo"
  },

  personagens: {
    lia:      { nome: "Lia",              cor: "#e8d9b0" },
    davi:     { nome: "Davi",             cor: "#9fc3d8" },
    joaquim:  { nome: "Seu Joaquim",      cor: "#c9b98a" },
    inspetor: { nome: "???",              cor: "#c0392b", nomeRevelado: "O Inspetor" },
    ana:      { nome: "Menina",           cor: "#d8a0b8", nomeRevelado: "Ana" },
    tome:     { nome: "Tomé",             cor: "#a8c8e8" },
    celeste:  { nome: "Irmã Celeste",     cor: "#b8c8a8" },
    diretor:  { nome: "Diretor Albano",   cor: "#c8a878" },
    moacir:   { nome: "Moacir",           cor: "#a89888" },
    radio:    { nome: "Rádio",            cor: "#a8b08a" },
    voz:      { nome: "???",              cor: "#9fc3d8" }
  },

  // Cartões de texto durante a viagem de carro (abertura)
  intro: [
    "Março de 1979. O Internato São Lázaro pegou fogo numa noite de chuva.",
    "Trinta e quatro crianças saíram de lá. Três nunca foram encontradas.",
    "Uma delas era meu irmão, Davi. Ele tinha doze anos.",
    "Quinze anos depois, chegou uma fita cassete sem remetente.",
    "A voz na fita é a dele. De criança. E ela sabe o meu nome."
  ],
  // Falas do rádio do carro durante a abertura (segundo em que começa)
  abertura: [
    { t: 1.5, quem: "radio", texto: "...Rádio Serra FM, vinte e uma horas em ponto. Chuva forte em toda a região da Mantiqueira..." },
    { t: 7.5, quem: "radio", texto: "...moradores voltam a relatar badaladas vindas do internato abandonado. A estrada velha segue interditada..." },
    { t: 12.5, quem: "davi", texto: "(na fita) Lia? Se você está ouvindo, a hora está acabando." },
    { t: 18.5, quem: "davi", texto: "(na fita, distorcida) Ele está acordando. Traz nossas coisas de volta. E não responde quando ele chamar." },
    { t: 22.5, quem: "radio", texto: "(chiado) ...Li... a..." },
    { t: 26.8, quem: "lia", texto: "Tinha alguma coisa em cima do carro. Eu tô chegando, Davi." }
  ],

  regras: {
    titulo: "REGRAS PARA QUEM ENTRA DEPOIS DAS NOVE",
    texto: "1. Quando o sino bater nove vezes, começou a Hora do Silêncio. Não corra.\n\n2. O Inspetor não enxerga. Se ele estiver perto, fique parada. Se estiver muito perto, não respire.\n\n3. Se as luzes piscarem e o rádio chiar, entre num armário ou debaixo de uma cama. Eles estão indo dormir. Não deixe que te vejam fora da cama.\n\n4. Se ouvir uma menina contando, ache-a com a luz e não tire os olhos dela.\n\n5. Nunca responda quando chamarem seu nome.\n\n6. Não entre na capela. Nunca toque o sino.",
    // o verso da folha (botão direito ou V com as regras abertas)
    verso: "(no verso, a lápis, letra tremida de velho)\n\n7. Se o sino parar, não olhe para trás.\n\nA sexta não é minha. Quem escreveu a sexta foi ele.\n— J.",
    dicaVerso: "botão direito ou V: virar a folha"
  },

  // Campanha enxuta: 6 capítulos (prólogo + 5), cada um pensado para 8 a 12 minutos,
  // sem voltar por mapas já vistos e sem "junte 3 coisas" de enchimento.
  // "dica": o que a Lia pensa em voz alta se o jogador passar muito tempo parado no mesmo objetivo.
  capitulos: [
    { id: "c0", titulo: "Prólogo — A Estrada Velha", mapa: "estrada", epigrafe: "“Ninguém precisa chegar lá.”",
      objetivos: [
        { id: "sair_carro", texto: "Saia do carro" },
        { id: "lanterna", texto: "Pegue a lanterna no porta-malas", dica: "A lanterna ficou no porta-malas. Atrás do carro." },
        { id: "posto", texto: "Peça ajuda no posto de gasolina", dica: "Aquela luz lá na frente. O posto. Tem alguém lá dentro." },
        { id: "chave_portao", texto: "Pegue a chave do portão do internato", dica: "Ele disse que a chave tá num prego. Atrás do balcão." },
        { id: "abrir_portao", texto: "Siga a estrada até o portão e abra o cadeado (segure E)", dica: "É só seguir a estrada. O portão fica no fim dela." }
      ],
      gancho: "O portão bateu sozinho atrás de você. Lá dentro, uma luz acendeu. E apagou." },
    { id: "c1", titulo: "Capítulo I — Sem Luz", mapa: "terreo", epigrafe: "Regra 2: ele não enxerga. Ele escuta.",
      objetivos: [
        { id: "forcar_porta", texto: "Force a porta principal (segure E)", dica: "A porta principal. Vai ter que ser na força." },
        { id: "galao", texto: "Encontre gasolina para o gerador (despensa, ao lado da cozinha)", dica: "Gasolina... se tiver, tá na despensa, junto da cozinha." },
        { id: "fusiveis", texto: "Pegue a caixa de fusíveis reserva na enfermaria", dica: "A etiqueta dizia: reserva na enfermaria." },
        { id: "gerador", texto: "Ligue o gerador na casa de máquinas", dica: "Casa de máquinas. No fundo do prédio, depois da lavanderia." }
      ],
      gancho: "O sino da capela começou a bater. Uma. Duas. Nove vezes. E no fim do corredor, alguém marchava." },
    { id: "c2", titulo: "Capítulo II — Nove Badaladas", mapa: "terreo", epigrafe: "Regra 3: não deixe que te vejam fora da cama.",
      objetivos: [
        { id: "procissao", texto: "Sobreviva quando as luzes piscarem (regra 3)", dica: "Quando piscar, armário ou cama. Não pensa, só entra." },
        { id: "fita_diretor", texto: "Ouça a fita no gravador da diretoria", dica: "A diretoria. O gravador do diretor ainda deve estar lá." },
        { id: "chave_escada", texto: "Abra o quadro de chaves da recepção (código de 3 números)", dica: "O código do quadro. Tá anotado no diário (TAB)." },
        { id: "subir", texto: "Suba a escada para os dormitórios", dica: "A grade da escada, na recepção. Agora eu tenho a chave." }
      ],
      gancho: "No andar de cima, alguém está brincando de esconde-esconde. E já começou a contar." },
    { id: "c3", titulo: "Capítulo III — A Menina Que Conta", mapa: "superior", epigrafe: "Regra 4: não tire os olhos dela.",
      objetivos: [
        { id: "engrenagens", texto: "Ache a engrenagem que a menina escondeu (dormitório do fundo)", dica: "A engrenagem... ela escondeu no último dormitório. Escuta a caixinha." },
        { id: "caixinha", texto: "Dê corda na caixinha na sala de brinquedos", dica: "Sala de brinquedos. A caixinha tá esperando." },
        { id: "ana", texto: "Não tire os olhos dela (regra 4)", dica: "A luz nela. Sempre. Anda de costas se precisar." },
        { id: "quarto_celeste", texto: "Abra o quarto da Irmã Celeste", dica: "O quarto da Irmã Celeste fica no fim do corredor, à esquerda." },
        { id: "fita_celeste", texto: "Ouça a fita da Irmã Celeste", dica: "Tem um gravador na mesa da Irmã Celeste." },
        { id: "chave_porao", texto: "Desça pelo poço do monta-cargas, no depósito", dica: "O monta-cargas fica no depósito, no fim do corredor à direita." }
      ],
      gancho: "Lá embaixo, a água estava parada. E alguma coisa respirava dentro dela." },
    { id: "c4", titulo: "Capítulo IV — Os Túneis", mapa: "tuneis", epigrafe: "Cada passo na água é um grito.",
      objetivos: [
        { id: "valvulas", texto: "Gire as válvulas na ordem certa para baixar a água ({n}/3)", dica: "A ordem das válvulas tá no diário. A Irmã Celeste falou na fita." },
        { id: "cofre", texto: "Abra o cofre na sala secreta do diretor (os números do Davi)", dica: "Os quatro números do Davi. Um em cada página do diário dele." },
        { id: "sair_tuneis", texto: "Saia pela escada de pedreiro até o cemitério", dica: "A escotilha fica na saída leste, depois da galeria." }
      ],
      gancho: "Davi não queria ser salvo. Ele queria terminar o que começou." },
    { id: "c5", titulo: "Capítulo V — A Hora", mapa: "cemiterio", epigrafe: "Regra 6: não entre na capela. (Não confie na sexta regra.)",
      objetivos: [
        { id: "tumulos", texto: "Cave os túmulos de Ana, Tomé e Davi ({n}/3)", dica: "Os túmulos com nome. Ana, Tomé, Davi. Cada pazada ecoa." },
        { id: "capela", texto: "Entre na capela (quebre a regra 6)", dica: "A capela, no fundo do cemitério." },
        { id: "altar", texto: "Coloque os objetos das crianças no altar ({n}/3)", dica: "O altar. As coisas deles vão no altar." },
        { id: "sino", texto: "Toque o sino (segure E)", dica: "A corda do sino, na torre ao lado do altar. Puxa e não solta." },
        { id: "fugir", texto: "Fuja para o portão dos fundos", dica: "O portão dos fundos! Corre e não olha pra trás!" }
      ] }
  ],

  // Diálogo com o Seu Joaquim (prólogo)
  dialogos: {
    joaquim: [
      { quem: "joaquim", texto: "Moça. Tá tarde pra andar por essa estrada." },
      { quem: "lia", texto: "Meu carro atolou. Eu preciso chegar no internato." },
      { quem: "joaquim", texto: "Ninguém precisa chegar lá. Faz quinze anos que eu cuido daquele portão pra ninguém entrar." },
      { quem: "lia", texto: "Meu irmão tá lá. Davi Moraes." },
      { quem: "joaquim", texto: "...O menino Davi. Ele tocava o sino toda noite. Pra segurar o homem lá dentro." },
      { quem: "joaquim", texto: "Se vai entrar, leva isso. São as regras. Eu escrevi pra ele, quando tudo começou." },
      { quem: "joaquim", texto: "A chave do portão tá no prego, atrás de você. Não corre lá dentro, moça. Ele escuta." }
    ]
  },

  falas: {
    inicio: [{ quem: "lia", texto: "Uma árvore caída, logo aqui. E aquilo no teto... não foi um galho." }],
    pegou_lanterna: [{ quem: "lia", texto: "A pilha tá fraca. Tem uma luz acesa lá na frente. Um posto?" }],
    joaquim_sumiu: [
      { quem: "lia", texto: "Seu Joaquim?" },
      { quem: "radio", texto: "(chiado) ...Joaquim Silva, zelador do internato, morreu tentando tirar as crianças do fogo... 1979..." }
    ],
    vulto_estrada: [{ quem: "lia", texto: "Tinha alguém ali. Alto. Alto demais." }],
    portao: [{ quem: "lia", texto: "O cadeado abriu. Que Deus me ajude." }],
    portao_atras: [{ quem: "lia", texto: "Abre, abre, abre... ele tá vindo." }],
    terreo_inicio: [
      { quem: "lia", texto: "A porta principal tá emperrada. Vai fazer barulho." },
      { quem: "davi", texto: "(eco) Lia... sem luz ninguém sai daqui." }
    ],
    primeiro_avistamento: [
      { quem: "inspetor", texto: "Silêncio." },
      { quem: "lia", texto: "Regra dois. Fica parada. Não respira." }
    ],
    galao: [{ quem: "lia", texto: "Gasolina. Agora os fusíveis. A etiqueta do quadro dizia: reserva na enfermaria." }],
    fusiveis: [{ quem: "lia", texto: "Os fusíveis. Agora a casa de máquinas. E rezar pra esse gerador pegar." }],
    gerador: [{ quem: "lia", texto: "Funciona... mas faz um barulho infernal. Ele vai ouvir isso." }],
    badaladas: [{ quem: "lia", texto: "O sino. Nove vezes. A Hora começou." }],
    procissao_aviso: [{ quem: "lia", texto: "As luzes! Regra três, armário, AGORA!" }],
    procissao_passou: [
      [{ quem: "lia", texto: "Crianças. Eram crianças marchando pro quarto." }],
      [{ quem: "lia", texto: "Passaram. Pés descalços. Nenhum deles respirava." }],
      [{ quem: "lia", texto: "Eu contei os passos. Eram muitos. Eram crianças demais." }]
    ],
    fita1_codigo: [{ quem: "lia", texto: "{q}. Três números. O quadro de chaves da recepção." }],
    fita2_ordem: [{ quem: "lia", texto: "{v}. A ordem das válvulas. Não posso errar lá embaixo." }],
    chave_escada: [{ quem: "lia", texto: "A chave da escada. Lá em cima ficavam os dormitórios." }],
    superior_inicio: [
      { quem: "ana", texto: "(longe) Um... dois... três..." },
      { quem: "lia", texto: "Tem uma menina contando. Regra quatro." }
    ],
    engrenagem: [
      { quem: "ana", texto: "(risadinha) Achou. Agora a música." },
      { quem: "lia", texto: "Ela me viu pegar. Ela tava olhando o tempo todo." }
    ],
    caixinha: [{ quem: "ana", texto: "Você achou minha música! Agora é sua vez de contar. Não, espera. É a MINHA vez." }],
    ana_aparece: [{ quem: "lia", texto: "Não pisca. Não tira a luz dela." }],
    ana_foi: [
      { quem: "ana", texto: "Você é boa nisso. O Davi também era." },
      { quem: "lia", texto: "Ela deixou uma chave. 'Irmã Celeste'." }
    ],
    chamado: [{ quem: "davi", texto: "Lia...? Lia, vem cá..." }],
    chamado_regra: [{ quem: "lia", texto: "Regra cinco. Não responde. Não vai." }],
    respondeu: [
      [{ quem: "lia", texto: "Eu fui. Por que eu fui? A regra cinco..." }],
      [{ quem: "lia", texto: "Não era o Davi. Nunca é o Davi." }]
    ],
    paginas_ok: [{ quem: "lia", texto: "As quatro páginas do Davi. Quatro números. É o código de algum cofre." }],
    chave_porao: [{ quem: "lia", texto: "A chave do monta-cargas. O poço do depósito desce direto pro porão." }],
    tuneis_inicio: [{ quem: "lia", texto: "Água até o joelho. Cada passo faz barulho." }],
    valvula_certa: [
      [{ quem: "lia", texto: "Essa foi. A próxima." }],
      [{ quem: "lia", texto: "O cano gemeu. Acho que tá certo." }]
    ],
    valvula_errada: [{ quem: "lia", texto: "Errado. A água subiu de novo. Ordem errada." }],
    valvulas_ok: [{ quem: "lia", texto: "A água tá baixando. Tem uma porta ali que não tava antes." }],
    cofre: [
      { quem: "lia", texto: "Uma pá. A chave da capela. E duas fitas." },
      { quem: "inspetor", texto: "QUEM ABRIU A MINHA GAVETA?" }
    ],
    moacir_escuta: [{ quem: "lia", texto: "Ele parou. Ele tá ouvindo a própria voz." }],
    cemiterio_inicio: [{ quem: "lia", texto: "O cemitério das irmãs. A capela tá logo ali. E ele também." }],
    tumulo_ana: [{ quem: "lia", texto: "A boneca da Ana. Ainda tem cheiro de fumaça." }],
    tumulo_tome: [{ quem: "lia", texto: "O carrinho do Tomé. As rodinhas ainda giram." }],
    tumulo_davi: [{ quem: "lia", texto: "O caderno do Davi. A letra dele. Meu Deus, a letra dele." }],
    tumulos_ok: [{ quem: "lia", texto: "Os três. Agora a capela. A regra seis que se dane." }],
    capela: [{ quem: "davi", texto: "Você veio. Coloca nossas coisas no altar. Depois puxa a corda com força. Não solta." }],
    altar_ok: [{ quem: "lia", texto: "Tudo no altar. Agora o sino." }],
    sino: [
      { quem: "inspetor", texto: "NÃO! A HORA É MINHA!" },
      { quem: "davi", texto: "Corre, Lia! Agora pode correr! O portão dos fundos!" }
    ],
    joaquim_portao: [{ quem: "joaquim", texto: "Por aqui, moça! Fecha os olhos e não olha pra trás!" }],
    olhou_tras: [
      { quem: "inspetor", texto: "Eu vi você olhar." },
      { quem: "lia", texto: "Regra sete... não olha. NÃO OLHA." }
    ],
    vida_baixa: [
      [{ quem: "lia", texto: "Tô sangrando... preciso de um curativo (H)." }],
      [{ quem: "lia", texto: "Não aguento outra dessas. O curativo, Lia. H." }]
    ],
    pilha_fraca: [{ quem: "lia", texto: "A pilha tá morrendo. Se eu tiver outra, R." }],
    carrinho_azul: [
      { quem: "lia", texto: "Um carrinho azul. Igual o da redação do Tomé." },
      { quem: "tome", texto: "(bem baixinho) ...é de verdade agora?" }
    ],
    desenho: [{ quem: "lia", texto: "O desenho. Era pra mim. Ele guardou esse tempo todo." }],
    f6_revelada: [{ quem: "tome", texto: "(do escuro) ...psiu. Aqui. Atrás da roupa." }],
    morte: [{ quem: "inspetor", texto: "Volte para a cama." }]
  },

  // Lia comenta em voz baixa a primeira vez que entra em alguns lugares (mapa:sala)
  lugares: {
    "terreo:diret": [{ quem: "lia", texto: "A diretoria. Ainda cheira a cigarro e cera." }],
    "terreo:cozinha": [{ quem: "lia", texto: "Trinta e sete canecas penduradas. Três viradas pra parede." }],
    "terreo:enferm": [{ quem: "lia", texto: "As camas da enfermaria ainda têm correia." }],
    "terreo:refeit": [{ quem: "lia", texto: "A mesa ainda tá posta. Pra quem?" }],
    "terreo:maq": [{ quem: "lia", texto: "O gerador. Se isso pegar, o prédio inteiro vai ouvir." }],
    "superior:dormE": [{ quem: "lia", texto: "O último dormitório. As camas tão arrumadas demais." }],
    "superior:celeste": [{ quem: "lia", texto: "Um terço em cima do travesseiro. Ela rezava por eles." }],
    "superior:roup": [{ quem: "lia", texto: "Uniformes pequenos. Todos do mesmo tamanho." }],
    "tuneis:secreta": [{ quem: "lia", texto: "Seca. Limpa. Ele vinha aqui depois de tudo. Pra ficar em paz." }],
    "tuneis:hub": [{ quem: "lia", texto: "Uma cisterna. O eco devolve cada respiração." }],
    "cemiterio:capela": [{ quem: "lia", texto: "A capela. Cera derretida no chão inteiro. Alguém acende essas velas." }]
  },

  // Davi sussurra no começo de cada capítulo, conforme como a Lia jogou o anterior
  davi_reage: {
    morreu_muito: [{ quem: "davi", texto: "(eco) Você tá correndo demais, Lia. Ele escuta cada passo." }],
    ferida: [{ quem: "davi", texto: "(eco) Você tá machucada. Esconde. Respira. Depois anda." }],
    nunca_vista: [{ quem: "davi", texto: "(eco) Você sempre foi a mais quieta da casa. Continua assim." }],
    rapida: [{ quem: "davi", texto: "(eco) Rápida. Igual quando a gente apostava corrida até o portão." }]
  },

  // O gravador da Lia: um recado curto no fim de cada capítulo (varia pelo jeito que ela passou)
  recados_lia: {
    perfeito: ["(baixinho) Ninguém me ouviu. Nem eu mesma.", "(sussurrando) Sem um arranhão. Continua assim, Lia.", "(quase sem voz) Ele passou do meu lado. Não me achou."],
    ferida: ["(ofegante) Ele me pegou. Eu ainda sinto as mãos dele.", "(tremendo) Tá doendo. Mas eu tô de pé.", "(chorando baixo) Eu não sei quanto mais eu aguento."],
    normal: ["(cansada) Mais um pedaço. Davi, eu tô chegando.", "(baixo) O prédio respira. Eu juro que respira.", "(firme) Não vou embora sem você."]
  },

  // Vozes do Chamado (regra 5) por capítulo. A última de cada lista é a mais insistente.
  chamados: {
    2: [{ quem: "davi", texto: "Lia...? Lia, vem cá..." }, { quem: "davi", texto: "Lia, a porta tá aberta aqui. Vem." }],
    3: [{ quem: "ana", texto: "Moça... vem brincar aqui dentro..." }, { quem: "davi", texto: "Lia, eu tô no quarto do lado. Rápido." }],
    4: [{ quem: "davi", texto: "Lia, responde. A regra mudou. Pode vir." }, { quem: "voz", texto: "Lia... Lia Moraes... chegou carta pra você..." }],
    5: [{ quem: "davi", texto: "Lia... aqui, atrás da lápide..." }]
  },

  // Gravações em fita: tocadas em gravadores pelo mapa
  fitas: [
    { id: "f1", titulo: "Fita 1 — Diretor Albano, 1978", linhas: [
      { quem: "diretor", texto: "Registro da diretoria. Doze de outubro." },
      { quem: "diretor", texto: "A Hora do Silêncio está funcionando. Desde que o Moacir assumiu a disciplina, nenhuma criança fala depois das nove." },
      { quem: "diretor", texto: "Os pais estão satisfeitos. O bispo está satisfeito." },
      { quem: "diretor", texto: "Moacir, a combinação nova do quadro de chaves é {q}. Não passe para as freiras." },
      { quem: "diretor", texto: "E pare de trancar os pequenos nos armários a noite inteira. Uma hora basta." },
      { quem: "voz", texto: "(ao fundo, uma criança cochicha) ...tá gravando?" }
    ] },
    { id: "f2", titulo: "Fita 2 — Irmã Celeste, 1979", linhas: [
      { quem: "celeste", texto: "Se alguém achar isso: o Moacir está ficando cego. Ele anda no escuro e caça as crianças pelo barulho." },
      { quem: "celeste", texto: "O Davi, a Ana e o Tomé acreditam que o sino da capela acaba com a Hora. Que se tocar, ele tem que dormir." },
      { quem: "celeste", texto: "O Joaquim escreveu regras para elas sobreviverem. Cinco regras. A sexta, 'não entre na capela', não é dele. É do diretor." },
      { quem: "celeste", texto: "O diretor tem uma sala embaixo dos túneis. A água só baixa girando as válvulas na ordem que o Moacir usa: {v}." },
      { quem: "celeste", texto: "O Joaquim diz que tem uma sétima. Escreveu atrás da folha, pra ninguém ver." },
      { quem: "celeste", texto: "Hoje à noite eu vou ajudar as crianças a chegar até o sino. Que Deus perdoe todos nós." }
    ] },
    { id: "f3", titulo: "Fita 3 — Moacir", linhas: [
      { quem: "moacir", texto: "Eu não enxergo mais as letras. Estou gravando porque não consigo escrever." },
      { quem: "moacir", texto: "Eu também dormi nessas camas, sabia? Fui aluno daqui. O diretor de antes me trancava no armário." },
      { quem: "moacir", texto: "O diretor diz que o silêncio salva as almas. Eu fiz tudo o que ele mandou." },
      { quem: "moacir", texto: "Mas agora eu ouço tudo. Ouço o coração das crianças através das portas." },
      { quem: "moacir", texto: "E quando escuto um barulho... eu não consigo parar. Eu só queria silêncio. Só silêncio." }
    ] },
    { id: "f4", titulo: "Fita 4 — Davi, para Lia", linhas: [
      { quem: "davi", texto: "Lia. Se você achou essa fita, você chegou mais longe que todo mundo." },
      { quem: "davi", texto: "A gente tocou o sino naquela noite. Ele ficou preso na Hora. A gente também." },
      { quem: "davi", texto: "Toda noite eu toco de novo, pra ele não sair. Mas a corda tá podre. A hora tá acabando." },
      { quem: "davi", texto: "Nossas coisas tão enterradas no cemitério das irmãs. Coloca no altar e toca uma última vez." },
      { quem: "davi", texto: "E não responde quando chamarem. Nem se for a minha voz. Principalmente se for a minha voz." },
      { quem: "davi", texto: "Quando o sino parar, eu vou embora também. Tá tudo bem. Eu juro que tá tudo bem." }
    ] },
    { id: "f5", titulo: "Rádio do posto", linhas: [
      { quem: "joaquim", texto: "(no rádio) Moça. Eu não consegui tirar os três. O fogo pegou a escada antes." },
      { quem: "joaquim", texto: "(no rádio) Desde então eu fico aqui. Avisando. Ninguém mais escuta um velho morto." },
      { quem: "joaquim", texto: "(no rádio) Faz o que o menino pediu. E não confia na sexta regra." }
    ] },
    { id: "f6", titulo: "Fita escondida — Tomé", secreta: true, linhas: [
      { quem: "tome", texto: "(cochichando) Tá gravando? Tá. Aqui é o Tomé. Quarta série." },
      { quem: "tome", texto: "Eu escondi o meu carrinho azul no muro do cemitério, no canto lá do fundo. Do lado esquerdo." },
      { quem: "tome", texto: "Se o Inspetor ouvir as rodinhas, ele me leva pro armário. Então ele fica lá. Quietinho." },
      { quem: "tome", texto: "O Davi falou que quando a gente tocar o sino, eu vou poder buscar. Aí eu vou ser bombeiro." },
      { quem: "tome", texto: "(mais baixo) ...tem mais alguém no armário com a gente. Mas ele não conta." }
    ] },
    { id: "f7", titulo: "Gaveta falsa — Albano, última gravação", secreta: true, linhas: [
      { quem: "diretor", texto: "Mil novecentos e setenta e nove. Quem souber esse número sabe o que eu fiz." },
      { quem: "diretor", texto: "Fui eu que tranquei a capela por fora. As crianças estavam tocando o sino. Eu só queria silêncio." },
      { quem: "diretor", texto: "O fogo começou nas velas. Eu ouvi as batidas na porta até o fim." },
      { quem: "diretor", texto: "Que o Moacir leve a culpa. Ele já não vê. Logo não vai lembrar." }
    ] }
  ],

  // Notas e documentos (o motor posiciona pelo id)
  notas: [
    { id: "n1", titulo: "Cartaz de desaparecidos", texto: "DESAPARECIDOS — 1979\nDavi Moraes, 12 anos\nAna Luísa Prado, 9 anos\nTomé Ribeiro, 10 anos\n\nVistos pela última vez no Internato São Lázaro na noite do incêndio.\nQualquer informação, procure a delegacia de Campos do Jordão.",
      textoDepois: "DESAPARECIDOS — 1979\n\n(os três nomes foram riscados com giz de cera; embaixo, em letra de criança)\na gente foi dormir. obrigado, lia." },
    { id: "n2", titulo: "Livro de ocorrências", texto: "14/03/1979 — 21h04. Aluno Tomé R. falou durante a Hora. Armário.\n14/03/1979 — 21h31. Aluna Ana L. P. chorou durante a Hora. Armário.\n14/03/1979 — 21h50. Aluno Davi M. foi pego fora da cama, perto da capela.\nO Inspetor Moacir pede autorização para \"medidas permanentes\".\nAutorizado. — A." },
    { id: "n3", titulo: "Caderno da cozinheira", texto: "Sopa para 37.\nSexta: 37 pratos. Sábado: 37.\nDomingo de manhã serviram 34. Ninguém me disse nada.\nO Moacir comeu sozinho na cozinha, de olhos fechados, ouvindo a colher bater no prato." },
    { id: "n4", titulo: "Ficha médica — M. Duarte", texto: "Paciente: Moacir Duarte, 41 anos. Inspetor de disciplina.\nPerda de visão progressiva, ambos os olhos.\nRelata audição \"aguçada demais\". Diz ouvir as crianças respirando dentro dos armários.\nDiz que o sino da capela \"desliga\" a cabeça dele.\nRecomendação: afastamento. Diretor recusou." },
    { id: "n5", titulo: "Redação do Tomé", texto: "MEU SONHO — Tomé Ribeiro, 4ª série\nQuando eu crescer quero ser bombeiro pra tirar todo mundo do fogo.\nE quero um carrinho azul de verdade, igual o meu de brinquedo.\nO Davi disse que vai tocar o sino e a gente vai poder falar de noite de novo." },
    { id: "n6", titulo: "Bilhete da Ana", texto: "Brincadeira da Hora:\nEu conto até dez. Quem eu não estiver vendo SOME.\nEntão eu nunca paro de olhar.\nSe você brincar comigo, olha pra mim também, tá bom? Senão eu fico sozinha." },
    { id: "n7", titulo: "Lista de castigos", texto: "HORA DO SILÊNCIO — 21h até o sino.\nFalar: 1 hora no armário.\nChorar: 2 horas no armário.\nCorrer: o Inspetor decide.\nSair da cama: o Inspetor decide.\n\n(embaixo, letra de criança) ele decide SEMPRE a mesma coisa" },
    { id: "n8", titulo: "Diário da Irmã Celeste", texto: "Ele não vê mais nada. Ontem passou do meu lado com a lanterna apontada para o rosto e não piscou.\nMas virou a cabeça quando meu terço bateu na mesa.\nAs crianças chamam de 'o Inspetor' como quem fala de um bicho.\nTenho medo de que tenham razão." },
    { id: "n9", titulo: "Anotação do pedreiro", texto: "Túneis de drenagem — São Lázaro.\nTrês válvulas controlam o nível. Ordem errada inunda tudo de novo.\nO diretor pediu uma sala seca embaixo da diretoria. Pagou em dinheiro. Disse para eu esquecer que ela existe." },
    { id: "n10", titulo: "Carta do Diretor ao bispo", texto: "Excelência,\no incêndio será tratado como acidente. As três crianças constarão como fugitivas.\nO Inspetor Moacir não será encontrado. A capela será lacrada e o sino, silenciado.\nSugiro acrescentar às regras dos funcionários: ninguém entra na capela. Ninguém toca o sino.\n— Albano" },
    { id: "n11", titulo: "Lápide rachada", texto: "AQUI JAZEM OS QUE NÃO FALARAM\n\n(riscado na pedra, por cima)\naqui jazem os que não DEIXARAM falar" },
    { id: "n12", titulo: "Recorte de jornal", texto: "INCÊNDIO NO INTERNATO SÃO LÁZARO — 1979\nBombeiros encontram a capela trancada por fora.\nO sino estava tocando quando chegaram. Ninguém estava puxando a corda.\nVizinhos dizem ouvir nove badaladas toda noite às 21h.\n\n(na margem, a caneta) se ligar às nove, o sino responde." },
    { id: "n13", titulo: "Desenho do Davi", secreta: true, texto: "(um desenho de giz de cera, dobrado em quatro: duas crianças de mãos dadas na frente de uma casa com um sino)\n\n(embaixo, letra caprichada)\nFELIZ ANIVERSÁRIO LIA\nquando eu sair daqui a gente toca o sino junto\n— Davi, 1979" }
  ],

  // Páginas do diário do Davi (cada uma tem um número do cofre)
  paginas: [
    { id: "p1", titulo: "Diário do Davi — página 1", texto: "A Lia faz aniversário amanhã. Fiz um desenho pra ela, mas não deixam mandar carta. Escondi atrás dos livros do diretor.\nPrimeiro número do segredo: {d1}." },
    { id: "p2", titulo: "Diário do Davi — página 2", texto: "O Tomé trouxe o carrinho escondido. Se o Inspetor ouvir as rodinhas, já era.\nSegundo número: {d2}." },
    { id: "p3", titulo: "Diário do Davi — página 3", texto: "A Ana não para de contar. Diz que se parar de olhar, a gente some. Acho que ela tá certa.\nTerceiro número: {d3}." },
    { id: "p4", titulo: "Diário do Davi — página 4", texto: "Escrevi essa aqui embaixo, na água. Vi o diretor abrindo um cofre no fim deste túnel com esses números. Anotei tudo.\nÚltimo número: {d4}.\nHoje à noite a gente toca o sino." }
  ],

  // Lápides do cemitério (as três que importam primeiro). "epitafio" aparece ao ler (E).
  lapides: [
    { id: "ana", nome: "ANA LUÍSA PRADO", datas: "1970 — 1979", importante: true },
    { id: "tome", nome: "TOMÉ RIBEIRO", datas: "1969 — 1979", importante: true },
    { id: "davi", nome: "DAVI MORAES", datas: "1967 — 1979", importante: true },
    { nome: "IRMÃ BENEDITA", datas: "1901 — 1966", epitafio: "\"Rezou baixinho a vida inteira.\"" },
    { nome: "IRMÃ CONCEIÇÃO", datas: "1898 — 1960", epitafio: "\"Que o silêncio lhe seja leve.\"" },
    { nome: "PADRE OSVALDO", datas: "1880 — 1951", epitafio: "\"Fundou esta casa para acolher.\" Alguém riscou: ACOLHER." },
    { nome: "JOÃO, 7 ANOS", datas: "1948 — 1955", epitafio: "Uma bolinha de gude gasta, presa no musgo da pedra." },
    { id: "semnome62", nome: "SEM NOME", datas: "1962", epitafio: "Nenhuma flor. Só marcas de unha na terra." },
    { nome: "MARIA DAS DORES", datas: "1950 — 1958", epitafio: "\"Falou durante a Hora.\" Está escrito pequeno, quase escondido." },
    { nome: "IRMÃ CELESTE", datas: "1931 — 1979", epitafio: "Um terço enrolado na cruz. As contas ainda estão mornas." },
    { id: "albano", nome: "ALBANO TEIXEIRA", datas: "1922 — 1980", epitafio: "\"Diretor. Homem de disciplina.\"" },
    { nome: "LUIZ, 11 ANOS", datas: "1941 — 1952", epitafio: "Alguém deixou um pião de madeira em cima. Novo." },
    { nome: "IRMÃ LOURDES", datas: "1905 — 1970", epitafio: "\"Cuidou dos pequenos.\"" },
    { id: "semnome75", nome: "SEM NOME", datas: "1975", epitafio: "A terra aqui está remexida. Recente demais." },
    { nome: "ROSA, 8 ANOS", datas: "1957 — 1965", epitafio: "Uma fita de cabelo vermelha amarrada na pedra." }
  ],
  // Lápides que mudam conforme quem joga (o motor troca os campos acima)
  lapidesVariantes: {
    albanoDepoisF3: { nome: "ALBANO TEIXEIRA", datas: "1922 — 1980", frase: "ele também foi pra cama", epitafio: "Uma rachadura nova. Em letra de criança: \"ele também foi pra cama\"." },
    lia: { nome: "LIA MORAES", datas: "1965 — 1994", epitafio: "Você não lembra de ter lido esse nome antes. Mas a pedra é velha." },
    liaVoltou: "voltou {n} vezes",
    jogador: { datas: "{hoje}", frase: "DEPOIS DAS NOVE", epitafio: "A tinta ainda está fresca. Alguém sabia que você vinha." }
  },

  // Sustos e eventos (src/sustos.js): vozes, sussurros e avisos dos sustos roteirizados e dinâmicos
  sustos: {
    respira: 'Respira. Respira pra mim.',
    proc_fresta: '(muitas vozes, bem perto) ...você não tá na cama...',
    proc_luz: 'A luz da lanterna vaza pela fresta. Apaga!',
    aviso: ['O rádio chia...', 'Passos pequenos. Muitos.', 'Estão vindo. Esconde!'],
    achei: '(do lado de fora, bem baixinho) ...achei.',
    ocupado: '(de dentro do armário) Esse é meu. Acha outro.',
    ocupado_toast: 'Alguém segura a porta por dentro.',
    ocupado_de_novo: 'Não abre. Alguém segura por dentro.',
    dez_grave: '(voz de homem, devagar) ...um...',
    mao_cama: '(sussurro) Aqui é meu.',
    ombro: '...Quem tá aí? Tinha uma mão no meu ombro.',
    nada_ouve: 'Você não ouve mais nada.',
    legenda_mente: '[alguém respira atrás de você]',
    chamado_lia: 'Lia...? Sou eu. Vem cá. Rápido.',
    chamado_davi: 'Davi? Davi, é você?',
    responder: 'Davi?! DAVI! Eu tô aqui!',
    responder_castigo: '(dentro da sua cabeça) Quem responde, fica.',
    garrafa_volta: '(do escuro, uma criança) De novo.',
    garrafa_toast: 'A garrafa voltou rolando até você.',
    telefone: '(sussurro de criança) Ele tá {onde}. Não deixa tocar de novo.',
    telefone_longe: '(sussurro de criança) Ele não tá aqui embaixo. Ainda.',
    pausa: 'ELE CONTINUA ESCUTANDO',
    nove_poco: '(lá em cima, na boca do poço) ...nove...',
    fim_lia: 'Lia.',
    lanterna_bater: 'Bate na lanterna (F, F)!',
    lanterna_volta: 'Voltou.',
    turma: 'TURMA DE 1978',
    alunos: '{n} alunos'
  },

  entidades: {
    inspetor: {
      nome: "O Inspetor",
      falas_caca: ["Silêncio...", "Quem está fora da cama?", "Eu ouvi você.", "A hora não acabou.", "Respira. Respira pra mim.", "Pequena. Eu ouço o seu coração bater.", "Ninguém corre na Hora."],
      falas_perdeu: ["Volte para a cama.", "Eu vou achar você.", "Todos voltam.", "Eu ouço o seu coração.", "Pode ficar quieta. Eu espero.", "O armário é bom pra pensar."],
      // falas extras que só aparecem em certos capítulos
      porCapitulo: {
        1: ["Tem alguém novo na casa."],
        3: ["A menina não vai te ajudar.", "Conta comigo. Um... dois..."],
        4: ["A água me conta onde você pisa.", "Ninguém desce aqui. Ninguém."],
        5: ["O sino é MEU.", "Saia daí. Eu sei que você está atrás da pedra."]
      }
    },
    ana: { nome: "A Menina Que Conta", contagem: ["um...", "dois...", "três...", "quatro...", "cinco...", "seis...", "sete...", "oito...", "nove...", "DEZ."] },
    procissao: { nome: "A Procissão", canto: "silêncio... silêncio... silêncio..." },
    // Lote 1 (Monstros e IA): falas por tipo de barulho, voz do Chamado e dicas de morte por situação
    falas_tipo: {
      vidro: ["Vidro... as crianças também quebravam as coisas.", "Vidro quebrado. Eu sei que não foi o vento.", "Mais vidro? Quem está brincando comigo?"],
      porta: ["Quem abriu?", "Ouvi a porta. Porta não abre sozinha.", "Fecha a porta quando sair, menina."],
      corrida: ["Não corre.", "Nos corredores não se corre.", "Corre, corre. Eu gosto quando correm."],
      agua: ["Tá molhada, menina?", "A água conta tudo pra mim.", "Ploc, ploc. Eu escuto cada passo."],
      respira: ["Respira pra mim.", "Eu ouvi você respirar.", "Tem alguém aí dentro. Tem sim."],
      luz: ["Quem acendeu a luz? Luz não é hora.", "Você ligou o meu gerador?"],
      calor: ["Está quente aqui...", "Que calor é esse no meu rosto?"],
      favorito: ["Sempre o mesmo lugar...", "Você gosta desse armário, não gosta?"],
      truque: ["Truque velho.", "De novo a garrafa? Truque de criança."],
      volta: ["Achou que eu tinha ido embora?", "Eu nunca vou embora."]
    },
    chamado: {
      davi: ["Lia, achei a fita... vem ver.", "Lia, tá doendo... vem cá.", "Lia? Eu tô aqui. Aqui do lado.", "Lia... por que você não vem?"],
      lia: ["Davi? Tô aqui! Vem!", "Eu tô chegando, Davi.", "Davi, é você?"],
      mae: "Lia, vem jantar. A comida tá esfriando."
    },
    dicas_ctx: {
      escondida: "Quando ele parar na frente do armário, segure ESPAÇO até ele ir embora. Soltar o ar entrega você.",
      agarrao: "Quando ele te agarrar, sacuda o mouse com força para se soltar.",
      bote: "Ele ergue os braços antes do bote. Nesse meio segundo, saia do alcance ou se agache parada.",
      pilha: "Com a pilha fraca a lanterna pisca, e a cada piscada ela chega mais perto. Troque a pilha (R) antes.",
      ana_armario: "Esconder não engana a menina. Ela espera na porta. Com a lanterna acesa por dentro, ela não abre.",
      proc_luz: "Até no armário a luz vaza pela fresta. Apague a lanterna (F) quando eles passarem."
    }
  },

  // Telas de morte: títulos e a última coisa que se ouve
  mortes: {
    inspetor: { titulos: ["ELE TE ENCONTROU", "VOLTE PARA A CAMA", "ELE OUVIU VOCÊ"], frases: ["\"Volte para a cama.\"", "\"Shhh. Agora sim. Silêncio.\"", "\"Todos voltam.\""] },
    ana: { titulos: ["ELA CONTOU ATÉ DEZ", "VOCÊ PISCOU", "AGORA VOCÊ CONTA"], frases: ["\"Achei.\"", "\"Agora você fica comigo.\"", "\"Você parou de olhar.\""] },
    procissao: { titulos: ["FORA DA CAMA", "ELES TE LEVARAM", "VOCÊ NÃO ESTAVA NA CAMA"], frases: ["silêncio... silêncio... silêncio...", "Mãos pequenas e frias seguraram as suas.", "Agora você marcha com eles."] },
    voltou: "Você voltou {n} vezes.",
    pesadelo: "No Pesadelo, um toque basta."
  },

  finais: {
    comum: {
      titulo: "FINAL: FORA DA CAMA",
      texto: "Lia atravessou o portão dos fundos e correu até o sol nascer.\nNo portão, um velho de capa segurava a grade aberta. Quando ela olhou de novo, não tinha ninguém.\nNa estrada, o rádio do carro chiou sozinho:\n\"...eu ouvi você...\"\n\nVocê fugiu, mas a Hora não acabou.\n(Davi, num sussurro: \"Não responde quando chamarem. Ouve até o fim o que eu deixei. E escuta o homem que caça, uma vez.\")"
    },
    silencio: {
      titulo: "FINAL: SILÊNCIO ETERNO",
      texto: "Lia escolheu ir embora.\nAtrás dela, o sino continuou tocando. Nove badaladas, toda noite.\nDavi ficou. Alguém tinha que ficar.\n\nNo carro, o rádio pegou uma estação que não existe mais. Nove badaladas. E uma voz de menino contando junto.\n\nEm 1995, a estrada velha foi fechada para sempre."
    },
    verdadeiro: {
      titulo: "FINAL: A HORA ACABOU",
      antes: { quem: "moacir", texto: "\"Silêncio... finalmente.\"" },
      texto: "Lia voltou para dentro da capela e segurou a corda junto com o irmão.\nNo meio da nave, o homem alto caiu de joelhos. A cabeça voltou para o lugar. Pela primeira vez, ele não estava ouvindo nada.\nO sino bateu uma última vez. E então, pela primeira vez em quinze anos, parou.\n\nDe manhã, ela acordou no portão, com um carrinho azul na mão.\nO internato estava em silêncio. Um silêncio de verdade.\n\nObrigado, Lia. — D.",
      extraCarrinho: "O carrinho tinha as rodinhas novas. No fundo, riscado com prego: TOMÉ, BOMBEIRO.",
      extraDesenho: "No bolso do casaco, dobrado em quatro, um desenho de giz de cera: duas crianças tocando um sino."
    }
  },
  // As três atitudes que abrem a escolha final (no lugar de achar tudo)
  atitudes: [
    { id: "naoRespondeu", texto: "Nunca respondeu quando chamaram seu nome" },
    { id: "f4", texto: "Ouviu a fita do Davi até o fim" },
    { id: "f3", texto: "Ouviu a voz do homem que caça" }
  ],
  finaisDescobertos: "Finais descobertos: {n} de 3",
  // Tela do portão (só aparece para quem cumpriu as três atitudes)
  escolha: {
    titulo: "O portão",
    texto: "O portão dos fundos está aberto. Atrás de você, o sino ainda vibra, e uma voz de menino chama seu nome.\nVocê nunca respondeu a nenhum chamado. Desta vez, é ele de verdade. Pela primeira vez, você sabe que pode responder.",
    ir: "Ir embora",
    voltar: "Responder ao Davi"
  },

  dicas_morte: {
    inspetor: ["Correr faz barulho. Ande ou agache (C) quando ele estiver perto.", "Ele não vê, ele escuta. Jogue uma garrafa (G) para mandá-lo para longe.", "No armário, segure ESPAÇO para prender a respiração quando ele chegar perto.", "Água e vidro no chão fazem barulho. Olhe onde pisa.", "Ele estala a língua para se localizar. Se o estalo está rápido, ele está caçando.", "Fitas tocando fazem barulho. Aperte E de novo no gravador para parar a fita."],
    ana: ["Regra quatro: mantenha a luz nela. Ela só anda quando você não está olhando.", "Ande de costas e não perca a menina de vista.", "Feche uma porta entre vocês. Ela não gosta de portas.", "Pilha fraca faz a lanterna piscar. Cada piscada é um passo dela."],
    procissao: ["Regra três: quando as luzes piscarem e o rádio chiar, esconda-se rápido.", "Armários e camas protegem da Procissão. O corredor não.", "Assim que as luzes piscarem, pare de explorar: o primeiro armário serve."],
    // dicas específicas do lugar (mapa)
    porMapa: {
      terreo: ["No térreo, a recepção e a enfermaria têm esconderijos perto do caminho."],
      superior: ["Cada dormitório tem camas: debaixo delas ninguém te vê."],
      tuneis: ["Nos túneis, cada passo na água ecoa. Andar agachada faz menos barulho.", "Girar uma válvula faz barulho: olhe em volta antes de começar."],
      cemiterio: ["No cemitério não há armários: as lápides cortam o som. Agache atrás delas.", "Cavar faz barulho. Pare de cavar quando ouvir os estalos dele perto."]
    }
  },

  conquistas: [
    { id: "prologo", nome: "A Estrada Velha", desc: "Chegue ao internato." },
    { id: "luz", nome: "Fiat Lux", desc: "Ligue o gerador." },
    { id: "procissao", nome: "Fora da Cama", desc: "Sobreviva à primeira Procissão." },
    { id: "ana", nome: "Não Pisque", desc: "Sobreviva à brincadeira da Ana." },
    { id: "garrafa", nome: "Ventríloqua", desc: "Distraia o Inspetor com uma garrafa." },
    { id: "folego", nome: "Sem Respirar", desc: "Prenda a respiração com o Inspetor do lado do armário." },
    { id: "arqueologa", nome: "Arqueóloga", desc: "Encontre todas as notas, páginas e fitas." },
    { id: "intocada", nome: "Intocada", desc: "Termine um capítulo sem ser ferida." },
    { id: "final_comum", nome: "Só o Começo", desc: "Chegue ao final comum." },
    { id: "final_silencio", nome: "Silêncio Eterno", desc: "Escolha ir embora." },
    { id: "final_verdadeiro", nome: "A Hora Acabou", desc: "Descubra o final verdadeiro." },
    { id: "pesadelo", nome: "Pesadelo", desc: "Termine o jogo no Pesadelo." },
    { id: "nao_respondi", nome: "Surda de Propósito", desc: "Termine o jogo sem nunca responder a um chamado." },
    { id: "nao_olhei", nome: "Não Olhe Para Trás", desc: "Fuja do cemitério sem olhar para a capela." },
    { id: "linha_cruzada", nome: "Linha Cruzada", desc: "Atenda o orelhão na estrada.", secreta: true },
    { id: "nove_horas", nome: "Depois das Nove", desc: "Jogue quando o relógio marcar nove da noite.", secreta: true },
    { id: "nome_pedra", nome: "Seu Nome na Pedra", desc: "Leia a lápide que esperava por você.", secreta: true },
    { id: "verso", nome: "A Sétima Regra", desc: "Vire a folha das regras.", secreta: true },
    { id: "arrombadora", nome: "Arrombadora", desc: "Tente três combinações que contam uma história.", secreta: true },
    { id: "escuro", nome: "Escuro de Verdade", desc: "Ouça quem só fala com quem apaga a luz.", secreta: true },
    { id: "bombeiro", nome: "Bombeiro", desc: "Encontre o carrinho azul de verdade.", secreta: true },
    { id: "desenho", nome: "Feliz Aniversário", desc: "Ache o presente que nunca chegou.", secreta: true },
    { id: "nove_cliques", nome: "Nove Badaladas", desc: "Toque o sino do título nove vezes, sem pressa.", secreta: true },
    { id: "fita_gasta", nome: "Fita Gasta", desc: "Diga a palavra proibida na tela de título.", secreta: true },
    { id: "confissao", nome: "A Gaveta Falsa", desc: "Descubra o que o diretor guardava embaixo.", secreta: true }
  ]
};
