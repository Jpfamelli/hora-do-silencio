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
      { quem: "diretor", texto: "As cartas das famílias continuam retidas. Saudade faz barulho." },
      { quem: "voz", texto: "(ao fundo, uma criança cochicha) ...tá gravando?" }
    ] },
    { id: "f2", titulo: "Fita 2 — Irmã Celeste, 1979", linhas: [
      { quem: "celeste", texto: "Se alguém achar isso: o Moacir está ficando cego. Ele anda no escuro e caça as crianças pelo barulho." },
      { quem: "celeste", texto: "O Davi, a Ana e o Tomé acreditam que o sino da capela acaba com a Hora. Que se tocar, ele tem que dormir." },
      { quem: "celeste", texto: "O Joaquim escreveu regras para elas sobreviverem. Cinco regras. A sexta, 'não entre na capela', não é dele. É do diretor." },
      { quem: "celeste", texto: "O diretor tem uma sala embaixo dos túneis. A água só baixa girando as válvulas na ordem que o Moacir usa: {v}." },
      { quem: "celeste", texto: "O Joaquim diz que tem uma sétima. Escreveu atrás da folha, pra ninguém ver." },
      { quem: "celeste", texto: "Eu deixo uma vela acesa em cima dos armários onde dá pra se esconder. Onde eu acendo, ele não procura." },
      { quem: "celeste", texto: "Hoje à noite eu vou ajudar as crianças a chegar até o sino. Que Deus perdoe todos nós." }
    ] },
    { id: "f3", titulo: "Fita 3 — Moacir", linhas: [
      { quem: "moacir", texto: "Eu não enxergo mais as letras. Estou gravando porque não consigo escrever." },
      { quem: "moacir", texto: "Eu também dormi nessas camas, sabia? Fui aluno daqui. O diretor de antes me trancava no armário." },
      { quem: "moacir", texto: "Uma vez trancaram o Luiz comigo. O sino demorou. Quando abriram a porta, só eu saí." },
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
      { quem: "joaquim", texto: "(no rádio) Faz o que o menino pediu. E não confia na sexta regra." },
      { quem: "joaquim", texto: "(no rádio) A fita fui eu que mandei. Quinze anos tentando chegar no correio." }
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
    { id: "n13", titulo: "Desenho do Davi", secreta: true, texto: "(um desenho de giz de cera, dobrado em quatro: duas crianças de mãos dadas na frente de uma casa com um sino)\n\n(embaixo, letra caprichada)\nFELIZ ANIVERSÁRIO LIA (14!)\nquando eu sair daqui a gente toca o sino junto\n— Davi, 1979\n\nP.S. não foi culpa sua eu ter vindo. eu que pedi." }
  ],

  // Páginas do diário do Davi (cada uma tem um número do cofre)
  paginas: [
    { id: "p1", titulo: "Diário do Davi — página 1", texto: "A Lia faz 14 anos amanhã, dia 15. Fiz um desenho pra ela, mas não deixam mandar carta. Escondi atrás dos livros do diretor.\nPrimeiro número do segredo: {d1}." },
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
      falas_caca: ["Silêncio...", "Quem está fora da cama?", "Eu ouvi você.", "A hora não acabou.", "Respira. Respira pra mim.", "Pequena. Eu ouço o seu coração bater.", "Ninguém corre na Hora.", "Fica parada que dói menos.", "Eu conheço esse passo. Eu conheço todos.", "Você treme. O chão me conta que você treme.", "Não adianta prender o ar pra sempre, menina."],
      falas_perdeu: ["Volte para a cama.", "Eu vou achar você.", "Todos voltam.", "Eu ouço o seu coração.", "Pode ficar quieta. Eu espero.", "O armário é bom pra pensar.", "Eu tenho a noite inteira. Você não.", "Some, então. A casa é pequena.", "Vou contar até você se cansar."],
      // Lote 5 — a noite desumaniza o homem: no começo ainda há o Inspetor que cuida; no fim, quase só o monstro.
      // O motor junta estas falas às de caça do capítulo, então o tom de cada capítulo é o que ele mais diz.
      porCapitulo: {
        0: ["Lá fora não é hora de passear, menina.", "Volta pro carro. A estrada guarda gente."],
        1: ["Tem alguém novo na casa.", "Hora de dormir, crianças. Já é tarde.", "Eu só quero que você durma. É só isso."],
        2: ["Nove badaladas. Todos na cama.", "Um apito, todos na cama. Dois, ninguém respira.", "Fica na fila. Fica quietinha na fila que eu não castigo."],
        3: ["A menina não vai te ajudar.", "Conta comigo. Um... dois...", "Você é igual à outra. A que contava alto demais.", "Eu guardo todas. Guardo você também."],
        4: ["A água me conta onde você pisa.", "Ninguém desce aqui. Ninguém.", "Aqui embaixo é onde eu durmo. Você acordou a casa toda.", "Não... não é hora... não é hora..."],
        5: ["O sino é MEU.", "Saia daí. Eu sei que você está atrás da pedra.", "SILÊN... cio. Silêncio. SILÊNCIO.", "(um rosnado) ...cama... cama... cama...", "Não toca. NÃO TOCA no sino.", "(as palavras não saem mais inteiras) ...vol-ta... dor-mir..."]
      }
    },
    ana: { nome: "A Menina Que Conta", contagem: ["um...", "dois...", "três...", "quatro...", "cinco...", "seis...", "sete...", "oito...", "nove...", "DEZ."] },
    procissao: { nome: "A Procissão", canto: "silêncio... silêncio... silêncio..." },
    // Lote 1 (Monstros e IA): falas por tipo de barulho, voz do Chamado e dicas de morte por situação
    falas_tipo: {
      vidro: ["Vidro... as crianças também quebravam as coisas.", "Vidro quebrado. Eu sei que não foi o vento.", "Mais vidro? Quem está brincando comigo?", "Caco no chão. Agora você pisa com cuidado, né?"],
      porta: ["Quem abriu?", "Ouvi a porta. Porta não abre sozinha.", "Fecha a porta quando sair, menina.", "A dobradiça canta pra mim. Sempre cantou."],
      corrida: ["Não corre.", "Nos corredores não se corre.", "Corre, corre. Eu gosto quando correm.", "Passo de corrida. Joelho no chão vem depois."],
      agua: ["Tá molhada, menina?", "A água conta tudo pra mim.", "Ploc, ploc. Eu escuto cada passo.", "A poça devolve o seu passo pra mim, dobrado."],
      respira: ["Respira pra mim.", "Eu ouvi você respirar.", "Tem alguém aí dentro. Tem sim.", "Segura o ar. Eu espero você soltar."],
      luz: ["Quem acendeu a luz? Luz não é hora.", "Você ligou o meu gerador?", "A luz zune. Eu ouço a luz, menina."],
      calor: ["Está quente aqui...", "Que calor é esse no meu rosto?", "O facho esquenta. Você tá me olhando de perto."],
      favorito: ["Sempre o mesmo lugar...", "Você gosta desse armário, não gosta?", "Terceira vez nesse canto. Vou guardar o endereço."],
      truque: ["Truque velho.", "De novo a garrafa? Truque de criança.", "Jogou longe de novo. Eu ensinei esse truque pra eles."],
      volta: ["Achou que eu tinha ido embora?", "Eu nunca vou embora.", "Eu só fui deixar a ronda em dia."]
    },
    chamado: {
      davi: ["Lia, achei a fita... vem ver.", "Lia, tá doendo... vem cá.", "Lia? Eu tô aqui. Aqui do lado.", "Lia... por que você não vem?", "Lia, tá escuro aqui. Vem comigo.", "Lia... ele não me vê se você vier agora."],
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

  // Lote 2 (Monstros e IA): a vida das entidades, lida por src/monstros-lore.js
  monstros2: {
    criancas: ["Tomé, de volta pro armário.", "Ana, pare de contar.", "Davi, longe da capela.", "Quem deixou o carrinho no corredor?", "Trinta e sete camas. Trinta e sete."],
    castigos: ["Falar... uma hora.", "Chorar... duas.", "Correr... eu decido.", "Sair da cama... eu decido."],
    menino: ["Não me tranca, padre... eu fico quieto...", "Eu não falei... eu juro que não falei.", "Abre, por favor. Tá escuro."],
    reconhece: ["Moraes. A mais velha. Você voltou pra cama.", "Lia Moraes. Saiu da cama em setenta e seis. Eu nunca esqueço uma voz."],
    passoDavi: "Esse passo... é igual ao do menino Davi.",
    reliquia: { ana: "Ana. Você trouxe a boneca da Ana.", tome: "Tomé. Você trouxe o carrinho do Tomé.", davi: "Davi. Você está com o caderno do Davi." },
    lugares: {
      dorm: "Eu dormi aí. Era frio.",
      diret: "Sim, senhor diretor. Todos na cama, senhor diretor.",
      secreta: "A sala dele. Eu nunca podia descer aqui.",
      capela: "O sino me desliga. Não toca. Não toca."
    },
    naoFalei: "Eu não falei nada... eu não falei...",
    humano: "Desculpa... eu só queria que vocês dormissem.",
    luiz: "Ele vem rezar pro menino.",
    morteLia: "\"Eu guardei o seu armário.\"",
    morteChave: "Uma chave pequena tilinta no chão. Número 12.",
    castigoEntra: "Riscos por dentro. Centenas. Alguém contou os dias aqui. 'M.D. 1951'.",
    castigoPoupa: "(ele encosta a mão na porta... respira... e vai embora)",
    castigoChoro: "[um menino chora baixinho, aqui dentro]",
    terceiroEntra: "(um cochicho, colado na sua orelha) ...eu também não conto.",
    terceiroSai: "...ele quer que eu saia daqui.",
    castigoFigura: "Tem alguém lá no fundo. Parado. De frente pra parede.",
    cantigaPlaca: "A música da caixinha... é a que ele cantarola. Foi ele que deu pra ela.",
    placa: { titulo: "Plaquinha de latão", texto: "(parafusada embaixo da prateleira das caixinhas)\n\nCAIXINHA DE MÚSICA\nPresente do Inspetor Moacir à aluna Ana L. P.\npela obediência.\n1978" },
    // Ana
    domingo: "...a mamãe vem domingo... a mamãe vem domingo...",
    mae: "...mãe?",
    voltou: "...você voltou...",
    irma: "Você é a irmã que foi embora.",
    leu: "Você leu, né? Não conta pra ninguém.",
    obrigada: "Obrigada por olhar.",
    curativo: "Onde ela estava ficou um curativo dobrado. Você guardou.",
    celesteFecha: "Alguém fechou a porta entre nós duas. Tinha um terço balançando...",
    bilhete: { titulo: "Bilhete molhado", texto: "(letra de giz de cera, borrada pela água)\n\nvocê piscou.\no davi nunca piscava." },
    flor: "Uma flor de papel dobrada. Ela deixou pra mim.",
    brincou: "Você brincou comigo.",
    numeros: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10 — achei você"],
    radar: ["um...", "dois...", "três...", "quatro...", "cinco...", "seis...", "sete...", "oito..."],
    // Procissão
    detalhes: [
      ["Rosa", "(uma menina de fita vermelha no cabelo olha pra fresta)"],
      ["Luiz", "(um menino aperta um pião de madeira contra o peito)"],
      ["João", "(uma bolinha de gude brilha na mão de um menino pequeno)"],
      ["Maria das Dores", "(uma menina de uniforme antigo, comprido demais, passa de cabeça baixa)"]
    ],
    tome: "(o menor, de capacete de papelão, para na fresta e põe o dedo nos lábios)",
    tomeBate: "Alguém bateu naquele armário. Duas vezes. Ali!",
    freira: "(a última da fila, uma freira alta, leva o dedo aos lábios e apressa as crianças)",
    celesteReza: "(do lado de fora da porta, uma reza baixinha) ...deixem essa dormir.",
    celesteObrigada: "Obrigada, irmã.",
    lapides: {
      "ROSA, 8 ANOS": "(Lia) A fita vermelha. Ela tava na fila.",
      "LUIZ, 11 ANOS": "(Lia) O pião... eu vi esse pião passar.",
      "JOÃO, 7 ANOS": "(Lia) A bolinha. O menino pequeno da fila.",
      "MARIA DAS DORES": "(Lia) O uniforme comprido. Desde 1958 ela marcha."
    },
    // Davi, Joaquim, Albano
    daviGaveta: "Davi?! ...Ele correu pra galeria leste.",
    daviPisou: "Dois pisões. Era o nosso sinal quando a gente era pequeno.",
    daviFalso: "Ele não bateu o pé. Aquele não era o Davi.",
    joaquim: "Seu Joaquim...? Ele assobiava isso no posto.",
    albano: "Um homem de terno... de costas. Sumiu.",
    albanoCofre: "Ele apontou pro cofre.",
    brasa: "Cheiro de cigarro. Fresco.",
    legendas: {
      chaves: "chaves tilintando", chavesParam: "as chaves pararam", cantigaCorta: "a cantiga parou no meio", apito: "um apito curto e rachado", apitoLonge: "um apito, longe: a ronda recomeçou",
      canecas: "canecas tilintando, uma a uma", lencol: "um lençol sendo alisado", terco: "contas de um terço batendo", cantigaRoda: "uma menina cantarola uma cantiga de roda", contaComeca: "a cantiga parou: ela começou a contar",
      batidas: "duas batidas num armário perto", assobio: "alguém assobia cinco notas, longe", carrinho: "rodinhas rolando no andar de cima", pisao: "dois pisões de criança", passinhos: "passinhos correndo", porta: "a porta do armário range sozinha", reza: "uma reza baixinha"
    }
  },

  // Telas de morte: títulos e a última coisa que se ouve
  mortes: {
    inspetor: { titulos: ["ELE TE ENCONTROU", "VOLTE PARA A CAMA", "ELE OUVIU VOCÊ", "O SILÊNCIO TE PEGOU", "HORA DE DORMIR"], frases: ["\"Volte para a cama.\"", "\"Shhh. Agora sim. Silêncio.\"", "\"Todos voltam.\"", "\"Pronto. Agora você é quietinha.\"", "\"Eu te achei pela respiração. Sempre acho.\""] },
    ana: { titulos: ["ELA CONTOU ATÉ DEZ", "VOCÊ PISCOU", "AGORA VOCÊ CONTA", "DEZ — ACHEI VOCÊ"], frases: ["\"Achei.\"", "\"Agora você fica comigo.\"", "\"Você parou de olhar.\"", "\"Ninguém pisca pra sempre.\""] },
    procissao: { titulos: ["FORA DA CAMA", "ELES TE LEVARAM", "VOCÊ NÃO ESTAVA NA CAMA", "A FILA TE ENGOLIU"], frases: ["silêncio... silêncio... silêncio...", "Mãos pequenas e frias seguraram as suas.", "Agora você marcha com eles.", "A fila ficou um pouquinho mais comprida."] },
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
    inspetor: ["Correr faz barulho. Ande ou agache (C) quando ele estiver perto.", "Ele não vê, ele escuta. Jogue uma garrafa (G) para mandá-lo para longe.", "No armário, segure ESPAÇO para prender a respiração quando ele chegar perto.", "Água e vidro no chão fazem barulho. Olhe onde pisa.", "Ele estala a língua para se localizar. Se o estalo está rápido, ele está caçando.", "Fitas tocando fazem barulho. Aperte E de novo no gravador para parar a fita.", "Numa caçada longa, vire numa porta e corte o som: ele segue o barulho, não você.", "Se ele já te achou várias vezes hoje, ele chega mais rápido. Não repita o mesmo esconderijo."],
    ana: ["Regra quatro: mantenha a luz nela. Ela só anda quando você não está olhando.", "Ande de costas e não perca a menina de vista.", "Feche uma porta entre vocês. Ela não gosta de portas.", "Pilha fraca faz a lanterna piscar. Cada piscada é um passo dela.", "Quando ela diz DEZ, já é tarde: não deixe a contagem chegar lá."],
    procissao: ["Regra três: quando as luzes piscarem e o rádio chiar, esconda-se rápido.", "Armários e camas protegem da Procissão. O corredor não.", "Assim que as luzes piscarem, pare de explorar: o primeiro armário serve.", "A fila não abre portas nem te procura: some de vista e espere passar."],
    // dicas específicas do lugar (mapa)
    porMapa: {
      terreo: ["No térreo, a recepção e a enfermaria têm esconderijos perto do caminho."],
      superior: ["Cada dormitório tem camas: debaixo delas ninguém te vê."],
      tuneis: ["Nos túneis, cada passo na água ecoa. Andar agachada faz menos barulho.", "Girar uma válvula faz barulho: olhe em volta antes de começar.", "Aqui embaixo é onde ele dorme: ele acorda mais bravo. Erre menos."],
      cemiterio: ["No cemitério não há armários: as lápides cortam o som. Agache atrás delas.", "Cavar faz barulho. Pare de cavar quando ouvir os estalos dele perto.", "Aqui a lanterna não basta: o sino é o único contra-jogo. Toque-o."]
    }
  },

  conquistas: [
    { id: "prologo", nome: "A Estrada Velha", desc: "Chegue ao internato." },
    { id: "luz", nome: "Fiat Lux", desc: "Ligue o gerador." },
    { id: "procissao", nome: "Fila Indiana", desc: "Sobreviva à primeira Procissão." },
    { id: "ana", nome: "Não Pisque", desc: "Sobreviva à brincadeira da Ana." },
    { id: "garrafa", nome: "Ventríloqua", desc: "Distraia o Inspetor com uma garrafa." },
    { id: "folego", nome: "Sem Respirar", desc: "Prenda a respiração com o Inspetor do lado do armário." },
    { id: "arqueologa", nome: "Arqueóloga", desc: "Encontre todas as notas, páginas e fitas (somando todas as noites)." },
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
    { id: "confissao", nome: "A Gaveta Falsa", desc: "Descubra o que o diretor guardava embaixo.", secreta: true },
    { id: "ficha_moacir", nome: "Dossiê 1979", desc: "Reúna, morte a morte, a ficha inteira do Inspetor Moacir.", secreta: true },
    { id: "surda_imovel", nome: "Surda e Imóvel", desc: "Ignore um Chamado parada no escuro até a voz falsa chorar.", secreta: true },
    { id: "chapeu", nome: "Ele Tirou o Chapéu", desc: "Fuja da noite e veja o Inspetor se despedir no limite da luz.", secreta: true },
    { id: "boa_noite", nome: "Boa Noite, Moacir", desc: "Dê boa-noite ao menino que ficou preso no homem.", secreta: true },
    { id: "perseguicao", nome: "O Fôlego Comprido", desc: "Sobreviva a uma caçada longa sem se esconder nem apanhar.", secreta: true }
  ]
};

// PROGRESSÃO E REJOGABILIDADE — metas de rank, dicas por objetivo, desafios secretos,
// conquistas extras e textos de memória do título. Lido por src/progressao.js.
window.ROTEIRO.progressao = {
  // meta: minutos para "rápida" (s) e para o tempo ainda contar algum ponto (a)
  capitulos: {
    c0: { meta: { s: 4, a: 7 }, frase_s: "O velho sabia o seu nome antes de você dizer.",
      desafio: { nome: "Passos de Igreja", desc: "Chegue ao portão sem correr nenhuma vez." },
      dicas: {
        sair_carro: { texto: "Preciso sair do carro. A porta do motorista." },
        lanterna: { texto: "A lanterna tá no porta-malas, atrás do carro.", sala: "estrada" },
        posto: { texto: "Tinha uma luz acesa na beira da estrada. O posto.", sala: "posto" },
        chave_portao: { texto: "Ele disse que a chave tava no prego, atrás de mim.", sala: "posto" },
        abrir_portao: { texto: "O portão fica no fim da estrada. É só seguir o asfalto.", sala: "estrada" }
      } },
    c1: { meta: { s: 7, a: 11 }, frase_s: "No escuro, ele e você eram iguais.",
      desafio: { nome: "Olhos no Escuro", desc: "Termine o Capítulo I com a lanterna acesa por menos de um minuto." },
      dicas: {
        forcar_porta: { texto: "A porta principal. Vou ter que forçar, e vai fazer barulho.", sala: "hall" },
        galao: { texto: "Gasolina... deve ter na despensa, depois da cozinha.", sala: "despensa" },
        fusiveis: { texto: "O quadro dizia: reserva na enfermaria. Corredor leste.", sala: "enferm" },
        gerador: { texto: "O gerador fica na casa de máquinas, no fim do corredor leste.", sala: "maq" }
      } },
    c2: { meta: { s: 7, a: 11 }, frase_s: "Eles marcharam rente à sua cama e não viram nada.",
      desafio: { nome: "Debaixo da Cama", desc: "Deixe a Procissão passar escondida embaixo de uma cama." },
      dicas: {
        procissao: { texto: "Quando as luzes piscarem: armário ou cama. Antes que eles cheguem." },
        fita_diretor: { texto: "O gravador do diretor. A diretoria fica no corredor leste.", sala: "diret" },
        chave_escada: { texto: "O quadro de chaves fica na recepção. A fita tinha o código.", sala: "hall" },
        subir: { texto: "A escada dos dormitórios fica na recepção, atrás da grade.", sala: "hall" }
      } },
    c3: { meta: { s: 8, a: 12 }, frase_s: "Ela contou até dez. Você não piscou nenhuma vez.",
      desafio: { nome: "Olhos Abertos", desc: "Sobreviva à brincadeira da Ana sem ela encostar em você." },
      dicas: {
        engrenagens: { texto: "A engrenagem... o Dormitório E, no fim do lado direito.", sala: "dormE" },
        caixinha: { texto: "A caixinha de música tá na sala de brinquedos.", sala: "brinq" },
        ana: { texto: "Luz nela. Não tira a luz dela. Anda de costas se precisar.", sala: "brinq" },
        quarto_celeste: { texto: "O quarto da Irmã Celeste fica no fim do corredor, à esquerda.", sala: "celeste" },
        fita_celeste: { texto: "A fita da Irmã Celeste deve estar no quarto dela.", sala: "celeste" },
        chave_porao: { texto: "O monta-cargas fica no depósito, no fim do corredor à direita.", sala: "sotao" }
      } },
    c4: { meta: { s: 7, a: 11 }, frase_s: "Nenhuma garrafa. Só você, a água e ele.",
      desafio: { nome: "Sem Distração", desc: "Termine os túneis sem jogar nenhuma garrafa." },
      dicas: {
        valvulas: { texto: "As válvulas ficam nas câmaras oeste e leste, e na cisterna. A ordem tava na fita da Irmã Celeste.", sala: "hub" },
        cofre: { texto: "A sala do diretor fica depois do túnel norte. Os números estavam no diário do Davi.", sala: "secreta" },
        sair_tuneis: { texto: "A escotilha fica na saída, depois da galeria leste.", sala: "saida" }
      } },
    c5: { meta: { s: 6, a: 10 }, frase_s: "O sino parou. E você nem sangrou.",
      desafio: { nome: "Intocável", desc: "Chegue ao portão dos fundos sem ser ferida no Capítulo V." },
      dicas: {
        tumulos: { texto: "Ana, Tomé e Davi. As lápides com os nomes deles.", sala: "cem" },
        capela: { texto: "A capela fica no fundo do cemitério.", sala: "capela" },
        altar: { texto: "O altar, no fundo da capela.", sala: "capela" },
        sino: { texto: "A corda do sino. Segurar e não soltar.", sala: "capela" },
        fugir: { texto: "O portão dos fundos! Do outro lado do cemitério!", sala: "cem" }
      } }
  },

  boletim: { S: "Comportamento: exemplar", A: "Comportamento: bom", B: "Comportamento: regular", C: "Comportamento: o Inspetor decide" },

  dificuldades: {
    facil: "Ele ouve menos, anda mais devagar e as luzes avisam a Procissão com mais tempo.",
    normal: "Como a Hora foi pensada. Ele ouve quase tudo o que você faz.",
    pesadelo: "Um toque mata. Sem dicas, sem ajuda, aviso curto. Ele ouve até o seu coração."
  },

  amuletos: [
    { id: "pilha", nome: "Pilha Podre", desc: "a lanterna gasta o dobro" },
    { id: "ouvido", nome: "Ouvido de Morcego", desc: "ele ouve 40% mais longe" },
    { id: "passos", nome: "Passos Pesados", desc: "ele anda 12% mais rápido" },
    { id: "aviso", nome: "Aviso Curto", desc: "a Procissão avisa 3 s mais tarde" }
  ],

  // O que o título lembra da última noite
  memoria: {
    morte: { inspetor: "Última noite: ele te encontrou em {cap}.", ana: "Última noite: ela contou até dez em {cap}.", procissao: "Última noite: você estava fora da cama em {cap}." },
    final: { comum: "Última noite: você fugiu. O rádio ainda chia.", silencio: "Última noite: você foi embora. O sino ainda toca.", verdadeiro: "Última noite: a Hora acabou. Por enquanto." },
    subtitulo: { silencio: "Nove badaladas, toda noite. Alguém ficou para tocar.", verdadeiro: "O internato está em silêncio. Um silêncio de verdade.", comum: "Na estrada velha, o rádio ainda chia: \"...eu ouvi você...\"" },
    hora: "São nove da noite. A Hora começou.",
    data: "14/03/1979 — 21h04. Aluno Tomé R. falou durante a Hora. Armário.",
    senha: "Alguma coisa destrancou. Modo Uma Vida liberado."
  },

  // Rádio da abertura comenta a partida anterior
  radio_lembra: {
    morte: "...ontem à noite acharam outro carro atolado na estrada velha. A motorista não foi encontrada...",
    comum: "...uma moça apareceu na rodovia de madrugada, descalça, repetindo que não podia correr...",
    silencio: "...moradores da serra dizem que o sino do internato tocou de novo ontem. Nove vezes...",
    verdadeiro: "...pela primeira vez em quinze anos, ninguém ouviu o sino do São Lázaro ontem à noite..."
  },

  diagnostico: {
    escondida: "Ele ouviu você respirar dentro do esconderijo. Segure ESPAÇO quando os estalos chegarem perto.",
    correndo: "Você estava correndo. Ele ouviu seus passos de longe.",
    agua: "A água denunciou cada passo seu. Agache para andar dentro dela.",
    agachada: "Mesmo agachada, você chegou perto demais. Mude de rota ou jogue uma garrafa (G).",
    andando: "Você andava de pé perto dele. Agache (C) quando ouvir os estalos da língua.",
    parada: "Você ficou parada no caminho dele. Ele não te viu: tropeçou em você.",
    fuga: "Depois do sino, ele não para. Corra direto para o portão, sem olhar para trás.",
    ana_escuro: "A lanterna estava apagada. No escuro, ela anda.",
    ana_costas: "Você tirou os olhos dela. Ande de costas e mantenha a luz nela.",
    procissao: "Você estava fora de um esconderijo quando eles passaram. O aviso durou {s} segundos."
  },

  conquistas: [
    { id: "nao_corra", nome: "Pés de Algodão", desc: "Termine um capítulo (I a V) sem correr." },
    { id: "fantasma", nome: "Fantasma", desc: "Termine um capítulo (I a V) sem ser perseguida." },
    { id: "silenciosa", nome: "Silenciosa", desc: "Termine um capítulo com ruído médio baixo." },
    { id: "pressa", nome: "Pressa Silenciosa", desc: "Termine o Capítulo I em menos de 6 minutos sem dano." },
    { id: "nao_pisquei", nome: "Não Pisquei", desc: "Sobreviva à brincadeira da Ana sem ela encostar em você." },
    { id: "rank_s", nome: "Aluna Exemplar", desc: "Tire S em um capítulo." },
    { id: "boletim", nome: "Boletim Perfeito", desc: "Tire S em todos os seis capítulos." },
    { id: "desafios", nome: "Seis Segredos", desc: "Cumpra o desafio secreto de todos os capítulos." },
    { id: "amuleto", nome: "Amuletos", desc: "Termine um capítulo usando dois amuletos ou mais." },
    { id: "sem_garrafa", nome: "Mãos Vazias", desc: "Termine o jogo sem jogar nenhuma garrafa." },
    { id: "sem_curativo", nome: "Pele Dura", desc: "Termine o jogo sem usar curativos." },
    { id: "sem_morrer", nome: "Nenhuma Cama Vazia", desc: "Termine o jogo sem morrer nenhuma vez." },
    { id: "menos_hora", nome: "Menos de Uma Hora", desc: "Termine o jogo em menos de 60 minutos." },
    { id: "uma_vida", nome: "Ninguém Ouviu", desc: "Termine o jogo no modo Uma Vida." },
    { id: "tres_finais", nome: "Todas as Noites", desc: "Veja os três finais." },
    { id: "olhos_gato", nome: "Olhos de Gato", desc: "Termine o Capítulo I com a lanterna acesa por menos de um minuto.", secreta: true, dica: "Ele não enxerga. Você precisa?" },
    { id: "regra_cinco", nome: "Regra Cinco", desc: "Ignore três chamados do seu nome.", secreta: true, dica: "Nunca responda quando chamarem." },
    { id: "desobediente", nome: "Desobediente", desc: "Vá até o chamado três vezes e sobreviva.", secreta: true, dica: "E se você responder?" },
    { id: "coracao_frio", nome: "Coração Frio", desc: "Passe a menos de dois metros dele sem ser notada.", secreta: true, dica: "Tão perto que dava para tocar." },
    { id: "teimosa", nome: "Teimosa", desc: "Morra dez vezes (somando todas as noites).", secreta: true, dica: "Todos voltam." },
    { id: "hora_certa", nome: "A Hora Começou", desc: "Abra o jogo às nove da noite.", secreta: true, dica: "Tem hora certa para isso." },
    { id: "quem_lembra", nome: "Quem Lembra", desc: "Digite a data do incêndio na tela de título.", secreta: true, dica: "O livro de ocorrências guarda a data." },
    { id: "senha", nome: "Silêncio", desc: "Digite a palavra que dá nome à Hora na tela de título.", secreta: true, dica: "A palavra que eles mais repetem." }
  ]
};

// =====================================================================
// LOTE 2 — MUNDO E HISTÓRIA (lido por src/historia-mundo.js)
// Linha do tempo da casa: Pe. Osvaldo funda o asilo-escola em 1931 (Hora do Recolhimento, cantada).
// Em 1947, velho e doente, ele cola por cima a "Hora do Silêncio". Albano assume em 1951 e endurece a regra.
// Moacir entra aos 10 anos (1948), fica preso no armário com o Luiz em 1952 (só ele sai), vira monitor
// e, em 1962, Inspetor (o "sem nome" de 1962 é o primeiro armário dele). A Lia estava matriculada para 1979;
// a mãe cancelou a vaga dela e o Davi foi sozinho ("pra Lia não"). Albano morre em 1980, trancado num armário.
// Seu Joaquim (morto em 1979) é quem põe a fita do Davi no correio, em 1994.
// =====================================================================
(function (R) {
  // ---- notas novas: todas "secretas" (bônus de quem explora; não viram coleta obrigatória)
  // onde: [mapa, sala, tipo de spot] — o módulo procura um spot livre na sala
  R.notas.push(
    { id: "n14", secreta: true, onde: ["terreo", "aula", "mesa"], titulo: "Livro de matrícula — 1979", texto: "INTERNATO SÃO LÁZARO — ALUNOS DE 1979 — 37 matriculados\n...\n23. Moraes, Davi — presente\n...\n(três nomes riscados a caneta vermelha: Prado, Ana L. · Ribeiro, Tomé · Moraes, Davi)\n\n(no fim da lista, a lápis)\nMoraes, Lia — matrícula cancelada pelo responsável. Vaga transferida ao irmão." },
    { id: "n15", secreta: true, onde: ["terreo", "diret", "mesa"], titulo: "Correspondência retida", texto: "(uma caixa de sapato com dezenas de envelopes, todos carimbados: RETIDA — HORA DO SILÊNCIO. Três estão abertos.)\n\n(letra de mãe) Filho, a Lia chora toda noite querendo você em casa. Na Páscoa a gente vai te buscar.\n\n(letra de menina) Davi, mãe disse que você tá de castigo de novo. Para de falar de noite, bobão. Eu vou te buscar nas férias. — Lia\n\n(letra do Davi, nunca enviada) Lia, aqui não pode falar de noite. Você vem me buscar no meu aniversário? Se não der, eu toco o sino pra você ouvir de casa." },
    { id: "n16", secreta: true, onde: ["terreo", "enferm", "mesa"], titulo: "Prontuário — Ana Luísa Prado, 9 anos", texto: "Duas noites no armário sem luz, nov. 1978.\nDesde então conta até dez em voz alta, sem parar.\nDiz que, se parar de olhar as pessoas, elas somem. \"Foi assim que a mamãe sumiu.\"\nSó dorme com a lanterna da Irmã Celeste acesa no rosto.\n\n(letra da Irmã Celeste, embaixo) Ela não é teimosa. Ela tem medo de ficar sozinha no escuro." },
    { id: "n17", secreta: true, onde: ["terreo", "biblio", "mesa"], titulo: "Manual do Internato — Pe. Osvaldo, 1931", texto: "Art. 9 — Às nove horas, a Hora do Recolhimento: as crianças cantam juntas e o sino abençoa o sono.\n\n(por cima, uma folha datilografada colada com goma)\nRETIFICAÇÃO — 1947. A Hora do Recolhimento passa a se chamar HORA DO SILÊNCIO. Das 21h ao toque do sino, ninguém fala. Quem falar será recolhido.\n\n(na margem, a caneta) O sino era bênção. Viraram ele em castigo." },
    { id: "n18", secreta: true, onde: ["tuneis", "secreta", "mesa"], titulo: "Livro dos Inspetores", texto: "INSPETORES DE DISCIPLINA — SÃO LÁZARO\n\nBráulio Nunes — aluno de 1931 a 1939. Armário. Inspetor de 1947 a 1961.\nMoacir Duarte — aluno de 1948 a 1956. Armário. Monitor da Hora em 1956. Inspetor desde 1962.\n\n1994 —\n\n(a última linha está em branco. A tinta da caneta ao lado ainda está molhada.)" },
    { id: "n19", secreta: true, onde: ["tuneis", "secreta", "mesa"], titulo: "Recorte de jornal — 1980", texto: "EX-DIRETOR DO SÃO LÁZARO É ENCONTRADO MORTO\nAlbano Teixeira, 58 anos, foi achado dentro de um armário da própria casa, em Campos do Jordão.\nA porta estava trancada por fora. A polícia não encontrou a chave.\nVizinhos dizem ter ouvido batidas \"a noite inteira, até as nove\".\n\n(colado com outra cola, em letra de criança) ele também foi pra cama" },
    { id: "n20", secreta: true, onde: ["superior", "celeste", "chao"], titulo: "Mala embaixo da cama", texto: "(uma mala de couro, feita e nunca levada)\nTrês mudas de roupa de criança. Um terço. Uma lanterna sem pilha.\nQuatro passagens de ônibus: Campos do Jordão — Aparecida, 15/03/1979, 6h10.\nNomes a lápis no verso: Celeste · Davi · Ana · Tomé.\n\n(um bilhete por cima) Se o sino não funcionar, a gente vai embora de manhã. Os quatro." },
    { id: "n21", secreta: true, onde: ["terreo", "enferm", "prateleira"], titulo: "Receita — papel timbrado da diretoria", texto: "Para o Inspetor M. Duarte:\nColírio de nitrato de prata, 3x ao dia. Aumentar a dose.\nNão informar ao médico da diocese.\n— A.\n\n(na prateleira, uma fileira de frascos vazios, todos com a mesma etiqueta)" },
    { id: "n22", secreta: true, onde: ["superior", "roup", "prateleira"], titulo: "Uniforme dobrado", texto: "(numa prateleira separada, um uniforme de menina, nunca usado, ainda com o alfinete da costureira)\nEtiqueta: LIA MORAES — matrícula 1979.\n\n(um bilhete preso no alfinete, letra da Irmã Celeste)\nOs pais iam mandar os dois. O Davi pediu para vir sozinho. Disse: \"pra Lia não\"." },
    { id: "n23", secreta: true, onde: ["estrada", "posto", "prateleira"], titulo: "Livro-caixa do posto", texto: "FIADO — 1979\n10/03 — 5 litros, caminhão do leite.\n12/03 — querosene, Irmã Celeste (velas da capela).\n14/03 — 20 litros, Diretor Albano. Disse que era pro gerador.\n\n(a lápis, depois) O gerador do internato é a óleo. — J." },
    { id: "n24", secreta: true, onde: ["terreo", "maq", "chao"], titulo: "Galões vazios", texto: "(dois galões de lata, amassados, com o carimbo POSTO SERRA pintado à mão)\nDentro, nem cheiro de óleo. Cheiro de gasolina.\nUm deles tem uma data riscada a prego: 14-3-79." },
    { id: "n25", secreta: true, onde: ["terreo", "diret", "mesa"], titulo: "Mata-borrão do diretor", texto: "(a mesma frase repetida dezenas de vezes, cada vez mais parecida com uma letra que não é a dele)\nNão entre na capela. Nunca toque o sino.\nNão entre na capela. Nunca toque o sino.\nNão entre na capela. Nunca toque o sino.\n\n(a última linha é idêntica à letra do Seu Joaquim)" },
    { id: "n26", secreta: true, onde: ["terreo", "cozinha", "mesa"], titulo: "Cardápio da semana — março de 1979", texto: "SEG 10: sopa de fubá. TER 11: arroz e ovo. QUA 12: sopa.\nQUI 13: polenta. SEX 14: sopa para 37.\n\n(a caneta, pela diretoria) SEXTA, 14: sem jantar — Davi M., Tomé R., Ana L. P. (falaram na Hora).\n\n(a lápis, letra da cozinheira) Deixei três pães no armário da escada. Que Deus me perdoe." },
    { id: "n27", secreta: true, onde: ["terreo", "hall", "mesa"], titulo: "Regulamento interno — 1961", texto: "INTERNATO SÃO LÁZARO — REGULAMENTO DOS FUNCIONÁRIOS\nArt. 9 — Às 21h, a Hora do Silêncio. O sino da capela marca o começo.\nArt. 10 — Criança que falar dorme no armário. Criança que chorar, dorme no porão.\nArt. 11 — As freiras não interferem na disciplina.\n— Diretor A. Teixeira. Carimbo da diocese." },
    { id: "n28", secreta: true, onde: ["terreo", "biblio", "prateleira"], titulo: "Ficha de aluno — Moacir Duarte, 1948", texto: "Moacir Duarte, 10 anos. Órfão. Entrada: março de 1948.\nObservação: fala dormindo. Ouve demais.\nTratamento recomendado: a Hora. — Pe. Osvaldo\n\n(outra caneta, 1952) Colega de armário: Luiz, 11 anos. Encerrado em 12/06/1952.\n(outra caneta, 1956) Aprendeu. Será útil à casa. — A." },
    { id: "n29", secreta: true, onde: ["terreo", "hall", "chao"], titulo: "Etiqueta no hidrante", texto: "(a caixa vermelha do hidrante está vazia. O vidro, intacto.)\nRETIRAR AS MANGUEIRAS. OS MENINOS BRINCAM E FAZEM BARULHO. — Diretoria, 1977.\n\n(colado com fita, um desenho de giz de cera: um bombeiro com uma mangueira enorme, apagando um prédio inteiro)\nTOMÉ" },
    { id: "n30", secreta: true, onde: ["estrada", "posto", "prateleira"], titulo: "Recibo dos Correios", texto: "EMPRESA BRASILEIRA DE CORREIOS — Agência Campos do Jordão\nFevereiro de 1994. Impresso: 1 fita cassete.\nRemetente: J. S. — Posto Serra, km 9.\nDestinatária: Lia Moraes.\n\n(o carimbo está borrado de água. Dentro da gaveta, o selo usado é de 1979.)" },
    { id: "n31", secreta: true, onde: ["terreo", "refeit", "mesa"], titulo: "Hino do São Lázaro", texto: "(emoldurado, com o vidro rachado)\nNo silêncio a gente aprende,\nquem cala nunca se perde.\n\nQuando o sino bate nove,\na boca fecha e ninguém se move.\n\nDorme a casa, dorme a gente,\no Inspetor escuta a mente.\n\n(a quarta estrofe foi raspada da moldura com a ponta de uma faca)" },
    { id: "n32", secreta: true, onde: ["superior", "celeste", "mesa"], titulo: "Foto de visita — 1978", texto: "(uma foto de domingo, no pátio: um menino de uniforme segura a mão de uma menina mais velha, de vestido; os dois olham o sino da capela)\n\n(no verso, letra da Irmã Celeste)\nDavi e a irmã, Lia. Dia de visita, nov. 1978.\nVisitas suspensas pelo diretor depois deste dia: \"a menina falou alto no pátio\"." },
    { id: "n33", secreta: true, onde: ["superior", "brinq", "mesa"], titulo: "A música da caixinha", texto: "(uma folha de caderno com pauta desenhada à mão, letra da Ana)\nUm, dois, a vela apagou.\nTrês, quatro, o moço escutou.\nCinco, seis, ninguém respirou.\nSete, oito, nove: a Hora chegou.\nDez... quem não olhou?" },
    { id: "n34", secreta: true, onde: ["tuneis", "hub", "chao"], titulo: "Página arrancada", texto: "(uma página do livro de ocorrências, grudada na parede pela umidade)\n14/03/1979 — 21h58. Crianças e a Irmã Celeste na capela. Tocando o sino.\nTranquei por fora. As velas estavam acesas.\nO Inspetor ficou do lado de fora, de joelhos. Não quis entrar.\n— A." },
    { id: "n35", secreta: true, onde: ["tuneis", "secreta", "mesa"], titulo: "Resposta do bispo", texto: "Prezado Albano,\nmantenha a disciplina. As famílias pagam pelo silêncio, e o silêncio é o que a Igreja vende de mais caro.\nQuanto à capela: lacre. Quanto aos papéis: queime o que precisar queimar.\nNinguém mais da diocese subirá a serra.\n— D." },
    { id: "n36", secreta: true, onde: ["cemiterio", "capela", "mesa", { x: 2.4, y: .02, z: -64.6 }], titulo: "Livro de ocorrências — 1994", texto: "(o mesmo livro da recepção. Uma página nova, letra apertada, tinta ainda brilhando)\n{noite}" },
    { id: "n37", secreta: true, onde: ["superior", "celeste", "prateleira"], titulo: "Lista de orações da Irmã Celeste", texto: "(trinta e sete nomes, um por linha, com a data do dia ao lado de cada um: ela rezava por todos, todo dia)\n...\nPrado, Ana Luísa — conta até dez. Rezar duas vezes.\nRibeiro, Tomé — corre quando tem medo. Rezar duas vezes.\nMoraes, Davi — não chora nunca. Rezar três vezes.\n\n(os três últimos sublinhados com força)" },
    { id: "n38", secreta: true, onde: ["tuneis", "secreta", "mesa"], titulo: "Rascunho das regras", texto: "(a primeira versão da folha do Seu Joaquim. Cinco regras, na letra dele, firme e redonda.)\n1. Não corra. 2. Fique parada. 3. Armário ou cama. 4. Olhe a menina. 5. Não responda.\n\n(embaixo, uma sexta linha, em letras enormes, tortas, afundadas no papel, como de quem escreve sem enxergar)\n6. NÃO ENTRE NA CAPELA" },
    { id: "n39", secreta: true, onde: ["superior", "corr", "chao"], titulo: "Bilhete no castiçal", texto: "(enrolado na base de uma vela votiva, letra da Irmã Celeste)\nOnde eu acendo, ele não procura.\nAcendam e escondam-se. Eu volto toda noite pra acender." },
    { id: "n40", secreta: true, onde: ["superior", "dormA", "cama"], titulo: "Regras das crianças", texto: "(riscado na cabeceira com um prego, letra de criança, por baixo da tinta)\n8. se a Ana contar, conta junto baixinho que ela gosta\n9. o T sabe o armário bom\n10. o sino desliga ele\n11. a Irmã Celeste deixa vela onde é seguro\n— D. T. A." }
  );
  // ---- comentários quando uma nota é lida pela primeira vez (fala curta, depois de fechar o papel)
  R.aoLer = {
    n2: [{ quem: "lia", texto: "Vinte e uma e quatro. Vinte e uma e trinta e um. Ele anotava a hora de cada criança." }],
    n3: [{ quem: "lia", texto: "Trinta e quatro pratos. Ninguém perguntou pelos outros três." }],
    n4: [{ quem: "lia", texto: "O diretor recusou. Preferia um vigia que não via." }],
    n5: [{ quem: "lia", texto: "Bombeiro. Ele queria tirar todo mundo do fogo." }],
    n6: [{ quem: "lia", texto: "Ela não queria assustar ninguém. Ela tinha medo de ficar sozinha." }],
    n7: [{ quem: "lia", texto: "O Inspetor decide. Sempre a mesma coisa." }],
    n8: [{ quem: "lia", texto: "Ele vira a cabeça pro barulho. Não pro meu rosto. Nunca pro meu rosto." }],
    n9: [{ quem: "lia", texto: "Uma sala que não existe. Pagou em dinheiro pra ninguém lembrar." }],
    n10: [{ quem: "lia", texto: "Fugitivas. Ele escreveu que as crianças fugiram." }],
    n12: [{ quem: "lia", texto: "O sino tocava sozinho quando os bombeiros chegaram. Era ele. Era o Davi." }],
    n14: [{ quem: "lia", texto: "(bem baixo) Era pra ser eu." }],
    n15: [{ quem: "lia", texto: "Ele nunca recebeu. Nenhuma. E achou que a gente tinha esquecido dele." }],
    n16: [{ quem: "lia", texto: "Ela conta pra ninguém sumir. Pra ninguém mais sumir." }],
    n17: [{ quem: "lia", texto: "Era uma música. A Hora era uma música. Alguém transformou num castigo." }],
    n18: [{ quem: "lia", texto: "Todos eles foram crianças trancadas. E a última linha tá esperando alguém." }],
    n19: [{ quem: "lia", texto: "Trancado por fora. Ninguém achou a chave. Alguém achou." }],
    n20: [{ quem: "lia", texto: "Quatro passagens. Ela ia levar os três embora de manhã." }],
    n21: [{ quem: "lia", texto: "Ele não ficou cego. Deixaram ele cego." }],
    n22: [{ quem: "lia", texto: "Pra Lia não. (silêncio) Ele foi no meu lugar." }],
    n23: [{ quem: "lia", texto: "Vinte litros. Na véspera do fogo. E o gerador nem era a gasolina." }],
    n24: [{ quem: "lia", texto: "Gasolina, num prédio que não usava gasolina." }],
    n25: [{ quem: "lia", texto: "Ele copiou a letra do velho. A sexta regra é dele." }],
    n26: [{ quem: "lia", texto: "Sem jantar. Os três, de castigo, na noite do fogo." }],
    n27: [{ quem: "lia", texto: "Nove da noite. Era castigo antes de virar maldição." }],
    n28: [{ quem: "lia", texto: "Dez anos. Ouve demais. Trancaram ele até ele aprender a não ouvir. E ele aprendeu o contrário." }],
    n29: [{ quem: "lia", texto: "Tiraram as mangueiras por causa do barulho. Dois anos antes do fogo." }],
    n30: [{ quem: "lia", texto: "J. S. Joaquim Silva. Ele mandou a fita. Um homem que morreu em 1979 foi no correio." }],
    n31: [{ quem: "lia", texto: "Arrancaram a última estrofe. O que será que ela dizia?" }],
    n32: [{ quem: "lia", texto: "Eu não lembro disso. Eu... eu lembro do sino." }],
    n33: [{ quem: "lia", texto: "Dez... quem não olhou. (engole seco) Eu sei o resto da música." }],
    n34: [{ quem: "lia", texto: "Tranquei por fora. Ele escreveu. Com a mesma caneta das ocorrências." }],
    n35: [{ quem: "lia", texto: "Queime o que precisar queimar." }],
    n36: [{ quem: "lia", texto: "É a minha noite. Ele anotou tudo o que eu fiz." }],
    n37: [{ quem: "lia", texto: "Três vezes pelo Davi. Porque ele não chorava." }],
    n38: [{ quem: "lia", texto: "Foi ele. O Inspetor escreveu a sexta. Sem enxergar o papel." }],
    n39: [{ quem: "lia", texto: "As velas em cima dos armários. É ela. Ela ainda acende." }],
    n40: [{ quem: "lia", texto: "As regras deles. Escritas por baixo das regras dos adultos." }]
  };
  // pares que, lidos juntos, rendem uma fala e às vezes uma conquista
  R.pares = [
    { ids: ["n23", "n24"], quem: "lia", texto: "O diretor comprou vinte litros de gasolina no posto. Na véspera. Não foi acidente.", conquista: "vinte_litros" },
    { ids: ["n14", "n22"], quem: "lia", texto: "Era a minha vaga. O meu uniforme. Ele vestiu o castigo que era meu.", conquista: "era_pra_ser_eu" },
    { ids: ["n4", "n21"], quem: "lia", texto: "Ficha médica, colírio, aumentar a dose. O diretor fez um monstro de propósito." },
    { ids: ["n25", "n38"], quem: "lia", texto: "O diretor treinou a letra do Joaquim, e o Moacir copiou a regra no papel dele. A sexta foi feita a quatro mãos." }
  ];
  // o Davi comenta baixinho cada página do diário dele (e o aniversário, se o desenho foi achado)
  R.paginasReage = {
    p1: [{ quem: "davi", texto: "(eco) Você leu? Que vergonha, Lia." }],
    p2: [{ quem: "davi", texto: "(eco) O Tomé chorou quando eu escrevi isso. Achou que ia perder o carrinho." }],
    p3: [{ quem: "davi", texto: "(eco) Ela tava certa. A gente sumiu." }],
    p4: [{ quem: "davi", texto: "(eco, da água) Esse eu escrevi molhado. Tremendo." }],
    p4desenho: [{ quem: "davi", texto: "(eco) Você achou o desenho? Atrasado, né. Feliz aniversário." }]
  };
  // o Inspetor reage de longe a certas descobertas
  R.inspetorLonge = {
    n14: "(muito longe, através das paredes) ...Moraes. Eu lembro do menino Moraes.",
    n28: "(longe) Quem está mexendo na minha ficha?",
    n22: "(longe, cantarolando) No silêncio a gente aprende..."
  };

  // ---- a Lia comenta mais lugares (mapa:sala)
  Object.assign(R.lugares, {
    "estrada:posto": [{ quem: "lia", texto: "Uma loja de posto parada em 1979. O calendário nem virou." }],
    "terreo:hall": [{ quem: "lia", texto: "Um balcão, um livro aberto, um quadro de chaves. Tudo esperando o turno da noite." }],
    "terreo:cw": [{ quem: "lia", texto: "Os armários do corredor. Todos com a porta encostada. Nenhum trancado." }],
    "terreo:ce": [{ quem: "lia", texto: "Marcas de dedo na parede. Na altura de uma criança." }],
    "terreo:aula": [{ quem: "lia", texto: "Trinta e sete carteiras. A lousa ainda tem giz fresco." }],
    "terreo:biblio": [{ quem: "lia", texto: "Livros de disciplina, de catecismo, de silêncio. Nenhum de história." }],
    "terreo:despensa": [{ quem: "lia", texto: "Latas estufadas, sacos de fubá. Alguém contava os pães." }],
    "terreo:lavand": [{ quem: "lia", texto: "Uniformes no varal. Ainda pingando. Quinze anos pingando." }],
    "terreo:banh": [{ quem: "lia", texto: "Os espelhos foram cobertos com lençol. Não queriam que eles se vissem." }],
    "superior:patamar": [{ quem: "lia", texto: "O patamar. Daqui dá pra ouvir o prédio inteiro respirar." }],
    "superior:corr": [{ quem: "lia", texto: "Velas acesas em cima de alguns armários. Alguém acendeu hoje." }],
    "superior:dormA": [{ quem: "lia", texto: "Cabeceiras riscadas. Eles escreviam onde o adulto não lia." }],
    "superior:dormB": [{ quem: "lia", texto: "Os lençóis estão esticados demais. Ninguém dormiu aqui. Ninguém podia se mexer." }],
    "superior:dormC": [{ quem: "lia", texto: "Um sapatinho embaixo de cada cama. Um par só, separado." }],
    "superior:dormD": [{ quem: "lia", texto: "Um cheiro de vela apagada. E de criança com medo." }],
    "superior:banhS": [{ quem: "lia", texto: "As torneiras foram arrancadas. Água corrente faz barulho." }],
    "superior:brinq": [{ quem: "lia", texto: "Brinquedos sem rodas, sem sino, sem corda. Brinquedos que não fazem barulho." }],
    "superior:sotao": [{ quem: "lia", texto: "O poço do monta-cargas. Cheira a água parada lá embaixo." }],
    "tuneis:dep": [{ quem: "lia", texto: "Caixas de documentos, todas com o mesmo carimbo. Arquivo morto." }],
    "cemiterio:cem": [{ quem: "lia", texto: "Tanta cruz pra uma casa de crianças. Tanta." }]
  });

  // ---- livro de ocorrências: a sua noite, na letra da casa (tela de morte, n2 e n36)
  R.ocorrencias = {
    data: "14/03/1994",
    morte: {
      inspetor: ["{d} — {h}. Visitante {nome} fez barulho {lugar}. O Inspetor decidiu.", "{d} — {h}. Visitante {nome} foi ouvida {lugar}. Armário.", "{d} — {h}. Visitante {nome} respirou alto demais {lugar}. O Inspetor decidiu."],
      ana: ["{d} — {h}. Visitante {nome} parou de olhar a menina {lugar}. Ela contou até dez.", "{d} — {h}. Visitante {nome} piscou {lugar}. A menina achou."],
      procissao: ["{d} — {h}. Visitante {nome} estava fora da cama {lugar}. Foi para a fila.", "{d} — {h}. Visitante {nome} não estava deitada quando eles passaram {lugar}."]
    },
    assinatura: "Autorizado. — A.",
    respondeu: "{d} — {h}. Visitante {nome} respondeu quando chamaram. Quem responde, fica.",
    quieta: "— Visitante {nome} não fez barulho nenhum. Anotar.",
    tinta: "(abaixo das linhas de 1979, em tinta fresca, com a data de hoje)",
    tremida: "(a última linha, em letra tremida, grande, de quem escreve sem ver) EU OUVI VOCÊ",
    nomePadrao: "Lia M.",
    // linhas de acontecimento para o livro de 1994 (n36)
    eventos: {
      entrada: "{d} — 20h41. Visitante {nome} entrou pelo portão da frente. Sem autorização.",
      gerador: "{d} — 20h58. Alguém ligou o gerador. O Inspetor acordou.",
      procissao: "{d} — 21h03. A visitante estava deitada quando a fila passou. Escapou da ronda.",
      ana: "{d} — 21h19. A visitante brincou com a aluna Ana L. P. e não piscou.",
      cofre: "{d} — 21h33. Mexeram na gaveta do diretor.",
      verso: "— A visitante leu o verso da folha. O zelador ensinou demais."
    }
  };
  R.joaquimNG = " E fui eu que mandei te chamar.";

  // ---- nomes riscados por dentro dos armários (um por armário, fixo; mostrado quando a Lia se esconde)
  R.armarios = [
    { texto: "ROSA · 1965", nome: "ROSA" },
    { texto: "LUIZ 11 ANOS · eu não chorei · 1952", nome: "LUIZ" },
    { texto: "M.D. 1949 — eu não falo eu não falo eu não falo", nome: "MD" },
    { texto: "MARIA DAS DORES · falei só um pouquinho", nome: "MARIA" },
    { texto: "T.R. 21h04 — quero minha mãe", nome: "TOME" },
    { texto: "um dois três quatro cinco seis sete oito nove DEZ ele foi", nome: "ANA" },
    { texto: "BENTO 9 ANOS · 1975 · EU NÃO CONTO", nome: "BENTO" },
    { texto: "JOÃO · bolinha de gude · 1955", nome: "JOAO" },
    { texto: "D.M. — o sino desliga ele", nome: "DAVI" },
    { texto: "(centenas de risquinhos de contagem, em grupos de cinco)", nome: null },
    { texto: "MOACIR NÃO CHOROU · 1952", nome: "MD" },
    { texto: "(marcas de unha, de cima a baixo. Nenhuma letra.)", nome: null }
  ];
  R.armariosFala = {
    MD: [{ quem: "lia", texto: "(sussurrando) M.D. Moacir Duarte. Ele também ficava aqui." }],
    BENTO: [{ quem: "lia", texto: "(sussurrando) Bento. O que não conta. O Tomé falou dele." }],
    lapide: [{ quem: "lia", texto: "Eu li esse nome. Dentro do armário." }],
    procissao: [{ quem: "lia", texto: "Eu ouvi esse nome no corredor. Na fila." }]
  };
  // a Procissão sussurra nomes (os mesmos das lápides)
  R.procissaoNomes = ["...João...", "...Rosa...", "...Maria das Dores...", "...Luiz...", "...Bento...", "...silêncio, Lia..."];

  // ---- lápides novas e variantes de lápide
  R.lapides.push(
    { id: "joaquim", nome: "JOAQUIM SILVA", datas: "1911 — 1979", frase: "zelador", epitafio: "\"Voltou pro fogo.\" Em cima da pedra, uma chave de portão igual à que você carrega." },
    { id: "placa", nome: "AS IRMÃS DA RONDA", datas: "1931 — 1979", epitafio: "Placa de bronze: \"Faziam a ronda das camas às 21h, em fila, com velas, cantando baixinho.\" Alguém raspou CANTANDO e escreveu: silêncio." }
  );
  Object.assign(R.lapidesVariantes, {
    joaquimVerso: "\"Voltou pro fogo.\" E embaixo, a lápis: a sétima é minha.",
    celesteVelas: "Um terço enrolado na cruz. As contas ainda estão mornas. Na base, uma vela acesa: ela ainda acende.",
    albanoRecorte: "Alguém colou na pedra um recorte de 1980: \"trancado por fora\".",
    luizF3: "Alguém deixou um pião de madeira em cima. Novo. Riscado na base: M. — perdão.",
    bento: { nome: "BENTO, 9 ANOS", datas: "1966 — 1975", epitafio: "A terra remexida. Ninguém procurou por você. Nem no cartaz." }
  });

  // ---- ecos da noite de 1979: uma cena só de som por capítulo, num lugar do caminho
  R.ecos = [
    { cap: 1, sala: "terreo:diret", linhas: [{ quem: "diretor", texto: "(eco de 1979, ao telefone) ...sim, Excelência. Medidas permanentes. Esta noite." }] },
    { cap: 2, sala: "terreo:ce", linhas: [{ quem: "tome", texto: "(eco de 1979, arrastado pelo corredor) Eu não falei! Eu não falei! Moço, eu não falei!" }] },
    { cap: 3, sala: "superior:roup", linhas: [{ quem: "ana", texto: "(eco de 1979, dentro de um armário) ...oito... nove... dez... mamãe? ...um... dois..." }] },
    { cap: 4, sala: "tuneis:hub", linhas: [{ quem: "celeste", texto: "(eco de 1979, com água pelos joelhos) Rápido. Pro sino. Ninguém solta a mão." }] },
    { cap: 5, sala: "cemiterio:capela", linhas: [{ quem: "voz", texto: "(eco de 1979) ...uma chave girando por fora. E depois, muitas mãos pequenas batendo na madeira." }] }
  ];

  // ---- linha do tempo do diário (aba Notas): cada data aparece quando a pista dela é lida
  R.linhaTempo = [
    { ano: "1931", texto: "Pe. Osvaldo funda o São Lázaro. A Hora do Recolhimento é cantada.", pista: "n17" },
    { ano: "1947", texto: "A Hora do Recolhimento vira Hora do Silêncio.", pista: "n17" },
    { ano: "1948", texto: "Moacir Duarte, 10 anos, órfão, entra no internato. \"Ouve demais.\"", pista: "n28" },
    { ano: "1952", texto: "Moacir e Luiz trancados juntos no armário. Só Moacir sai.", pista: "n28" },
    { ano: "1961", texto: "Albano escreve o regulamento: quem falar, dorme no armário.", pista: "n27" },
    { ano: "1962", texto: "Moacir vira Inspetor.", pista: "n18" },
    { ano: "1977", texto: "As mangueiras de incêndio são retiradas \"por causa do barulho\".", pista: "n29" },
    { ano: "1978", texto: "Visitas da família Moraes suspensas. A Lia falou alto no pátio.", pista: "n32" },
    { ano: "1979", texto: "A matrícula da Lia é cancelada. O Davi vai sozinho.", pista: "n14" },
    { ano: "14/03/1979", texto: "Albano compra vinte litros de gasolina no posto.", pista: "n23" },
    { ano: "14/03/1979", texto: "21h58. Albano tranca a capela por fora com as crianças lá dentro.", pista: "n34" },
    { ano: "1980", texto: "Albano é achado morto num armário trancado por fora.", pista: "n19" },
    { ano: "1994", texto: "Uma fita chega pelo correio. Remetente: J. S., Posto Serra.", pista: "n30" }
  ];
  R.linhaTempoTitulo = "O que eu sei";

  // ---- anotações na margem, na letra da própria Lia, a partir da segunda noite
  R.margemNG = {
    n2: "já li isso. as horas mudam um pouco toda noite",
    n4: "ele não é cego de tudo. ele sente a luz quente",
    n6: "conta junto com ela",
    n7: "correr é o pior",
    n8: "o terço. qualquer barulho pequeno",
    n10: "não confia na sexta",
    n12: "não deixa o sino parar antes da hora",
    p3: "é verdade. a gente some"
  };
  R.margemRubrica = "(na margem, a caneta azul, numa letra que é a sua)";

  // ---- finais: linhas que entram pelo que a Lia descobriu
  Object.assign(R.finais.verdadeiro, {
    extraCulpa: "Antes de soltar a corda, ela disse: \"Era pra ser eu.\" E o Davi respondeu, pela última vez: \"Eu escolhi, Lia. Não foi culpa sua.\"",
    extraCeleste: "No último banco, uma freira rezava baixinho. Quando o sino parou, ela se levantou e levou as crianças pela mão, com uma mala que esperou quinze anos.",
    extraHino: "As crianças cantaram a quarta estrofe, a que tinham raspado da moldura: \"Quando o sino parar de vez, / a gente fala outra vez.\"",
    extraLinhagem: "No livro dos Inspetores, a última linha, a de 1994, amanheceu riscada. Ninguém mais ia ser trancado para aprender.",
    extraBispo: "Lia levou a carta do bispo para fora. Na semana seguinte, a serra encheu de repórter.",
    extraMar: "Na praia, numa manhã de abril, uma menina de vestido contou as ondas até dez. E parou de contar.",
    extraLuiz: "Ao lado do homem ajoelhado, um menino de onze anos com um pião na mão. Dois meninos saíram do armário. Pela primeira vez, juntos.",
    joaquim: ["No portão, o velho de capa tirou o chapéu: \"Obrigado, moça.\"", "No portão, o velho de capa tirou o chapéu: \"Você ouviu todo mundo.\"", "No portão, o velho de capa tirou o chapéu: \"Agora eu posso descansar também.\" E não estava mais lá."],
    moacir: "(rádio, dias depois) ...Moacir Duarte, cinquenta e seis anos, encontrado numa casa de repouso de Taubaté. Ele não fala. Os enfermeiros contam que ontem, às nove, ele dormiu pela primeira vez sem tapar os ouvidos..."
  });
  Object.assign(R.finais.comum, {
    extraInspetora: "No retrovisor, por um segundo, os olhos dela estavam tapados por uma faixa branca. O rádio disse, baixinho: \"Silêncio.\" Quem responde, fica.",
    extraCarta: "No banco do passageiro, um envelope que ela não lembrava de ter trazido, carimbado RETIDA. Letra de menino."
  });
  Object.assign(R.finais.silencio, {
    extraRegra: "Em casa, ela achou a folha das regras no bolso. Embaixo da sétima, na letra dela mesma, uma linha nova: \"9. Se alguém voltar, não deixa entrar sozinha.\""
  });
  // o jornal do dia seguinte, montado pelo que foi descoberto (todo final termina com ele)
  R.jornal = {
    titulo: "(no jornal da manhã seguinte)",
    confissao: "CASO SÃO LÁZARO É REABERTO: DIRETOR TRANCOU A CAPELA",
    gasolina: "POSTO DA SERRA VENDEU GASOLINA AO DIRETOR NA VÉSPERA DO INCÊNDIO",
    moacir: "INSPETOR ERA EX-ALUNO, REVELA ARQUIVO DO INTERNATO",
    bispo: "CARTA DA DIOCESE MANDAVA \"QUEIMAR O QUE PRECISAR\"",
    nada: "MOÇA É ENCONTRADA NA ESTRADA VELHA, SEM LEMBRAR DO QUE VIU"
  };
  // o que aconteceu com cada um, se a Lia descobriu
  R.epilogo = {
    titulo: "(o que ficou de cada um)",
    ninguem: "Ninguém sabe.",
    joaquim: ["Seu Joaquim", "Mandou a fita, segurou o portão. Descansou."],
    celeste: ["Irmã Celeste", "Ia embora com os três às 6h10. Ficou com eles."],
    moacir: ["Moacir", "Foi menino num armário antes de ser o homem que caçava."],
    albano: ["Albano", "Morreu trancado por fora. A chave nunca apareceu."]
  };

  // ---- vozes novas do Chamado
  R.chamadoMae = { quem: "voz", texto: "(a voz da sua mãe) Lia... a vaga era sua, não era? Vem cá. Vem ficar no lugar dele." };
  R.chamados[2].splice(1, 0, { quem: "voz", texto: "(voz de mulher, cansada) Lia, vem jantar. Seu irmão já tá na mesa." });
  R.chamados[3].push({ quem: "davi", texto: "Lia, achei seu uniforme. Vem provar." });
  R.chamados[5].push({ quem: "joaquim", texto: "Moça... por aqui... o portão é por aqui..." });

  // ---- o Davi e a Lia, entre capítulos
  R.davi_reage.leu = [{ quem: "davi", texto: "(eco) Você tá lendo tudo, né? Sempre foi fofoqueira." }];
  R.recados_lia.culpa = ["(baixo) A vaga era minha. Eu nem sabia.", "(com raiva) Eles cancelaram a minha matrícula e mandaram ele.", "(quase sem voz) Davi, eu devia ter ido junto."];

  // ---- o Inspetor ganha falas que contam quem ele foi
  R.entidades.inspetor.porCapitulo[2] = ["Moraes... eu conheço esse cheiro de Moraes.", "Ninguém canta na Hora. Ninguém."];
  R.entidades.inspetor.porCapitulo[3] = (R.entidades.inspetor.porCapitulo[3] || []).concat(["Treze... o treze é meu...", "O Luiz também queria sair."]);
  R.entidades.inspetor.porCapitulo[4] = (R.entidades.inspetor.porCapitulo[4] || []).concat(["O diretor mandou. O diretor sempre manda."]);
  R.entidades.inspetor.falas_perdeu.push("No silêncio a gente aprende...");

  // ---- conquistas novas (segredos de história)
  R.conquistas.push(
    { id: "linhagem", nome: "A Linhagem", desc: "Leia o livro de quem veio antes dele.", secreta: true },
    { id: "vinte_litros", nome: "Vinte Litros", desc: "Descubra de onde veio o fogo.", secreta: true },
    { id: "era_pra_ser_eu", nome: "Era Pra Ser Eu", desc: "Descubra por que só o Davi foi.", secreta: true },
    { id: "nomes_armarios", nome: "Os Nomes nos Armários", desc: "Leia cinco nomes riscados por dentro dos esconderijos.", secreta: true },
    { id: "o_que_nao_conta", nome: "O Que Não Conta", desc: "Dê nome a quem ninguém procurou.", secreta: true },
    { id: "a_noite", nome: "A Noite", desc: "Ouça os cinco ecos de 14 de março de 1979.", secreta: true }
  );
})(window.ROTEIRO);

// =====================================================================
// LOTE 3 — POLIMENTO DO TEXTO (lido por src/historia-polimento.js)
// Créditos que contam o depois, o Chamado que diz o seu nome, nomes que o internato reconhece,
// combinações que contam história, a bateria de verdade, epígrafes da segunda noite.
// =====================================================================
(function (R) {
  R.lote3 = {
    creditos: {
      titulo: "A HORA DO SILÊNCIO",
      rubrica: "(as últimas páginas do caderno da Lia, escritas no carro, com a luz do teto acesa e a chuva no vidro)",
      pular: "segure ESPAÇO ou o dedo na tela para correr · ESC pula",
      botao: "Créditos",
      botaoPular: "Pular",
      destinosTitulo: "o que aconteceu com eles",
      destinos: {
        comum: [
          ["Davi Moraes, 12 anos", "Continua tocando o sino. Toda noite, às nove. Sozinho."],
          ["Ana Luísa Prado, 9 anos", "Ainda conta até dez no dormitório de cima. Ninguém olha para ela."],
          ["Tomé Ribeiro, 10 anos", "Continua no armário do corredor. Ainda jura que não falou."]
        ],
        silencio: [
          ["Davi Moraes, 12 anos", "Ficou. Alguém tinha que ficar. Ele escolheu ser esse alguém."],
          ["Ana Luísa Prado, 9 anos", "Conta junto com as badaladas. Nove. Nunca chega no dez."],
          ["Tomé Ribeiro, 10 anos", "Dorme com o carrinho debaixo do travesseiro. As rodinhas não giram mais."]
        ],
        verdadeiro: [
          ["Davi Moraes, 12 anos", "Soltou a corda do sino. Dormiu. Pela primeira vez em quinze anos, dormiu."],
          ["Ana Luísa Prado, 9 anos", "Viu o mar numa manhã de abril. Contou as ondas até dez. E parou de contar."],
          ["Tomé Ribeiro, 10 anos", "Saiu do armário segurando um carrinho azul. Disse, alto: eu falei. E ninguém brigou."]
        ]
      },
      internosTitulo: "Internos de 1979 — 37 matriculados",
      internos: [
        "Abreu, Sebastião", "Almeida, Rita", "Amaral, Joel", "Barbosa, Cícero", "Batista, Lurdes", "Bento, Aparecida", "Campos, Valdir",
        "Cardoso, Nilza", "Castro, Ivo", "Correia, Dirce", "Costa, Geraldo", "Dias, Elza", "Duarte, Raimundo", "Esteves, Odete",
        "Farias, Benedito", "Freitas, Zuleica", "Gomes, Ataíde", "Lima, Conceição", "Lopes, Expedito", "Machado, Iracema", "Martins, Osmar",
        "Mendes, Glória", "Moraes, Davi", "Nogueira, Jurandir", "Oliveira, Neusa", "Pereira, Adão", "Pinto, Marli", "Prado, Ana L.",
        "Queiroz, Valter", "Ramos, Edite", "Ribeiro, Tomé", "Rocha, Salete", "Santos, Nivaldo", "Siqueira, Zilda", "Souza, Amaro",
        "Teixeira, Cleide", "Vieira, Rubens"
      ],
      riscados: ["Moraes, Davi", "Prado, Ana L.", "Ribeiro, Tomé"],
      internosRubrica: "(trinta e quatro saíram pela janela da capela. Três nomes estão riscados a caneta vermelha.)",
      antesTitulo: "os que vieram antes",
      antes: {
        comum: [["Luiz, 11 anos · 1952", "Ainda espera alguém abrir o armário."], ["João, 7 anos · 1955", "A bolinha de gude continua presa no musgo."], ["Maria das Dores · 1958", "Falou só um pouquinho. Ainda pede desculpa."], ["Rosa, 8 anos · 1965", "A fita vermelha desbota na chuva."], ["Bento, 9 anos · 1975", "Ninguém procurou. Ninguém procura."]],
        silencio: [["Luiz, 11 anos · 1952", "Gira o pião no escuro, sem barulho."], ["João, 7 anos · 1955", "Rola a bolinha de gude pelo corredor, toda noite, às nove."], ["Maria das Dores · 1958", "Não fala mais."], ["Rosa, 8 anos · 1965", "Amarra a fita no cabelo da Ana."], ["Bento, 9 anos · 1975", "Brinca com a Ana. Ele não conta."]],
        verdadeiro: [["Luiz, 11 anos · 1952", "Saiu do armário junto com o Moacir. Dois meninos, de mãos dadas."], ["João, 7 anos · 1955", "Achou a bolinha de gude. Ganhou a partida."], ["Maria das Dores · 1958", "Falou. Falou alto, a noite inteira."], ["Rosa, 8 anos · 1965", "A fita vermelha amanheceu amarrada no portão aberto."], ["Bento, 9 anos · 1975", "Alguém escreveu o nome dele num cartaz. Finalmente."]]
      },
      memoriaTitulo: "em memória",
      memoria: [["Joaquim Silva · 1911 — 1979", "zelador. Voltou para o fogo."], ["Irmã Celeste · 1931 — 1979", "fez a mala para quatro. Esperou quinze anos."], ["Moacir Duarte · 1938 —", "foi menino num armário antes de ser o homem que caçava."]],
      feito: [
        "Feito de chuva desenhada, luz de canvas e som que não existe.",
        "Nenhuma voz deste jogo foi gravada. Todas nasceram agora, no seu computador.",
        "Nenhum lugar nem pessoa deste jogo existiu. O silêncio, sim."
      ],
      fim: "Obrigada por ouvir até o fim.",
      seuNomeRubrica: "(na última linha, na letra da Lia, um nome que ela não conhece. Alguém riscou por cima.)",
      posRubrica: "(o toca-fitas do carro liga sozinho. A voz não é a do Davi.)",
      pos: {
        comum: { quem: "celeste", texto: "(na fita, voz de mulher, cansada) Você saiu pela porta errada, menina. A mala ainda está feita. Eles ainda estão esperando." },
        silencio: { quem: "celeste", texto: "(na fita) Ele ficou porque você foi. Eu rezo por ele três vezes. Agora rezo por você também." },
        verdadeiro: { quem: "celeste", texto: "(na fita, quase sorrindo) Seis e dez. O ônibus saiu na hora. Obrigada, Lia. Os quatro foram juntos." }
      },
      espera: "(bem baixinho, de dentro do escuro) Lia?",
      pistas: {
        verdadeiro: "(a lápis, na contracapa, letra de menino) Não responde quando chamarem. Ouve a minha fita até o fim. E escuta uma vez a voz do homem que caça. Aí o portão te deixa escolher.",
        quarta: "(a lápis, na contracapa) Eram ~três~ quatro crianças. A quarta dorme de olhos tapados. Chama ele pelo nome antes do último toque.",
        tudo: "(a lápis, na contracapa) Você ouviu todo mundo. Pode dormir agora. Ninguém mais vai chamar."
      },
      voltar: "clique ou ESC para voltar",
      telefone: "(lá longe, o telefone da recepção tocou três vezes. E parou.)",
      relogio: "(o rádio-relógio parou em 21:04)"
    },

    // o Chamado aprende o nome digitado no título (uma vez por capítulo)
    chamadoNome: ["{nome}...", "{nome}... vem cá...", "(da sala ao lado) {nome}? É você?", "{nome}... a sua cama tá pronta...", "(baixinho) {nome}... eu sei que você tá ouvindo..."],
    chamadoPerto: "(dentro do quarto, colado no seu ouvido) {nome}.",
    ignorouNome: { quem: "lia", texto: "(sussurrando) Esse nome... Como ele sabe esse nome?" },

    // reações ao nome digitado (na abertura do carro)
    nomes: {
      ANA: { quem: "ana", texto: "(na fita, uma menina, por cima da voz do Davi) ...Ana? Tem outra Ana aí? Que legal. A gente brinca." },
      MOACIR: { quem: "inspetor", texto: "(no rádio, muito grave) ...Moacir. Volte para a cama, Moacir. Você ouve demais." },
      DAVI: { quem: "davi", texto: "(na fita) ...Davi? Esse é o meu nome. Quem tá aí com você, Lia?" },
      LIA: { quem: "radio", texto: "(chiado) ...Lia... Lia... Lia... (a fita rebobina sozinha)" },
      TOME: { quem: "tome", texto: "(na fita, bem baixinho) Tomé? Eu não falei. Eu juro que não falei nada." },
      ALBANO: { quem: "inspetor", texto: "(no rádio) ...diretor. O senhor voltou. A Hora está em ordem, senhor." },
      CELESTE: { quem: "celeste", texto: "(na fita) Celeste? Quem está usando o meu nome? ...Eu ainda rezo por vocês três." },
      JOAQUIM: { quem: "joaquim", texto: "(no rádio, longe) Esse nome é de velho, moça. Deixa ele comigo." },
      outro: { quem: "radio", texto: "...uma ouvinte, {nome}, pediu uma música. Nove badaladas, pra {nome}. Boa noite, {nome}." }
    },
    anaNove: { quem: "ana", texto: "(para no nove) ...você tem o meu nome. Então eu começo de novo." },
    anaMorte: "ANA, DE NOVO",
    inspetorNome: "“Volte para a cama, {nome}.”",
    nomeTitulo: "{nome}. Anotado no livro da recepção.",

    // teclados: combinações que contam história e não abrem nada
    codigos: {
      cofre1979: { quem: "davi", texto: "(eco, de dentro do cofre) Não é esse ano que abre, Lia. É o meu." },
      apagou: { quem: "lia", texto: "(no escuro) ...as luzes. Alguém apagou as luzes da sala." },
      tardeDisp: "TARDE DEMAIS",
      tarde: { quem: "lia", texto: "Esse ano ainda não chegou aqui dentro. Aqui ainda é 1979." },
      c1994: { quem: "lia", texto: "Mil novecentos e noventa e quatro. Pra este cofre, ainda é setenta e nove." },
      c1931: { quem: "lia", texto: "Mil novecentos e trinta e um. O ano em que a Hora ainda era cantada." },
      c2104: { quem: "tome", texto: "(eco, de dentro da parede) Vinte e uma e quatro... eu não falei... eu não falei..." },
      q023: { quem: "lia", texto: "Vinte e três. O número do Davi na matrícula. Não é esse." },
      q037: { quem: "lia", texto: "Trinta e sete ganchos. Trinta e sete crianças. Não, não é esse." }
    },

    // a bateria de verdade do aparelho
    bateria: { quem: "lia", texto: "(baixinho) Minha pilha tá acabando... e não é só a da lanterna." },

    // segunda noite: epígrafes de quem já esteve aqui; Pesadelo: ganchos mais curtos
    epigrafeNG: {
      c0: "“Você já esteve aqui.”",
      c1: "Ele lembra do barulho que você fez da outra vez.",
      c2: "Nove badaladas. Você já sabe contar até lá.",
      c3: "Ela lembra de você. Ela nunca esquece quem piscou.",
      c4: "A água guarda os passos de ontem.",
      c5: "Desta vez, você sabe o que o sino faz."
    },
    ganchoPesadelo: {
      c0: "O portão bateu. Desta vez, ele não abre por fora.",
      c1: "Nove badaladas. E ele já sabe o seu cheiro.",
      c2: "Lá em cima, ela já está no oito.",
      c3: "A água subiu um palmo desde ontem. E ele também desceu.",
      c4: "Um toque, Lia. Só um."
    },

    // datas e horas que mudam o subtítulo do título
    datas: {
      madrugada: "Madrugada. Até a Hora dorme um pouco agora. Quase.",
      sexta13: "Sexta-feira, 13. O Inspetor não acredita em sorte.",
      finados: "Dia de Finados. Alguém acendeu velas no cemitério das irmãs."
    },
    faltaFinal: { comum: "um final em que você só foge", silencio: "um final em que você escolhe ir embora", verdadeiro: "um final em que o sino para" },
    faltaRotulo: "ainda falta: ",
    fitasSecretas: "{n} delas não queriam ser achadas"
  };

  // ---- mortes: mais títulos e últimas frases
  R.mortes.inspetor.titulos.push("SILÊNCIO, AGORA");
  R.mortes.inspetor.frases.push('"Mais uma pra ficar."');
  R.mortes.ana.titulos.push("DEZ.");
  R.mortes.ana.frases.push('"Agora é você que conta. Eu me escondo."');
  R.mortes.procissao.titulos.push("NA FILA");
  R.mortes.procissao.frases.push("Ninguém soltou a sua mão. Ninguém nunca solta.");

  // ---- dicas de morte novas (todas verdadeiras para as regras do jogo)
  R.dicas_morte.inspetor.push("Depois de jogar a garrafa (G), saia andando para o lado contrário do barulho. Não corra.", "Um armário só protege se você entrar antes de ele chegar perto: ele ouve a porta.");
  R.dicas_morte.ana.push("Ela também espera no teto. Ao entrar numa sala escura, olhe para cima antes de dar as costas.");
  R.dicas_morte.procissao.push("Quando o rádio chiar, você tem poucos segundos. Guarde onde ficou o último armário que você viu.");
  R.dicas_morte.porMapa.superior.push("No andar de cima, a vela acesa em cima de um armário marca o esconderijo que ele não abre.");
  R.dicas_morte.porMapa.terreo.push("No térreo, o corredor é comprido: guarde onde ficam os armários entre um objetivo e outro, antes de precisar deles.");
  R.dicas_morte.porMapa.tuneis.push("Nos túneis, a válvula errada faz a água subir de novo: confira a ordem no diário (TAB) antes de girar.");

  // ---- a Lia comenta lugares que ainda passavam em silêncio
  Object.assign(R.lugares, {
    "estrada:patioPosto": [{ quem: "lia", texto: "As bombas ainda marcam o preço de 1979. Alguém abasteceu aqui naquela noite." }],
    "terreo:patio": [{ quem: "lia", texto: "O pátio. Foi aqui que eu vi o Davi pela última vez. Eu acho." }],
    "tuneis:v1": [{ quem: "lia", texto: "Uma válvula do tamanho de uma roda de carro. Girar isso vai fazer o túnel inteiro gemer." }],
    "tuneis:v2": [{ quem: "lia", texto: "Riscos na parede, na altura de uma criança. Contando os dias." }],
    "tuneis:t4": [{ quem: "lia", texto: "O túnel norte. O ar aqui é mais quente. Alguém vinha muito pra cá." }],
    "tuneis:saida": [{ quem: "lia", texto: "Ar frio lá em cima. E cheiro de terra molhada. O cemitério." }]
  });

  // ---- notas que ainda não tinham comentário
  Object.assign(R.aoLer, {
    n1: [{ quem: "lia", texto: "Três rostos num cartaz. Ninguém mais procurou depois do primeiro inverno." }],
    n11: [{ quem: "lia", texto: "Os que não deixaram falar. Alguém corrigiu a pedra com a unha." }]
  });

  // ---- chegadas e avisos ganham variações (o motor sorteia uma)
  R.falas.badaladas = [R.falas.badaladas, [{ quem: "lia", texto: "Uma. Duas... nove. O prédio inteiro prendeu a respiração." }]];
  R.falas.gerador = [R.falas.gerador, [{ quem: "lia", texto: "Pegou! Pegou... e o barulho vai até a capela. Ele acordou. Eu sei que acordou." }]];
  R.falas.tuneis_inicio = [R.falas.tuneis_inicio, [{ quem: "lia", texto: "Água gelada até o joelho. Cada passo vai ecoar até lá no fundo." }]];
  R.falas.cemiterio_inicio = [R.falas.cemiterio_inicio, [{ quem: "lia", texto: "Ar livre, enfim. E mesmo assim eu não consigo respirar. A capela tá logo ali." }]];
  R.falas.procissao_aviso = [R.falas.procissao_aviso, [{ quem: "lia", texto: "O rádio! As luzes! Esconde, Lia, ESCONDE!" }]];

  // ---- quem tem o nome deles ouve deles, lá dentro
  R.lote3.nomeJogo = {
    MOACIR: { quem: "inspetor", texto: "(parado, a cabeça virando devagar) ...Moacir? Quem trouxe o meu nome de volta pra cá?" },
    DAVI: { quem: "davi", texto: "(eco, de dentro da capela) Você tem o meu nome. Então hoje a gente toca junto." },
    TOME: { quem: "tome", texto: "(bem baixinho, de algum armário) Psiu... Tomé? Você também se escondeu aqui?" },
    CELESTE: { quem: "celeste", texto: "(eco, de longe, rezando) ...e por Celeste também, que ninguém mais reza por ela." }
  };

  // ---- o gravador da Lia ganha mais um recado de cada jeito
  R.recados_lia.perfeito.push("(sussurrando) Eu tô aprendendo a andar como eles. Sem peso.");
  R.recados_lia.ferida.push("(com a mão no corte) Ainda dá. Ainda dá, Lia.");
  R.recados_lia.normal.push("(baixo) Cada porta que eu abro, alguém lá dentro fecha outra.");

  // ---- conquistas novas (segredos do lote 3)
  R.conquistas.push(
    { id: "creditos_fim", nome: "Até a Última Linha", desc: "Assista aos créditos até o fim, sem pular.", secreta: true, dica: "Os nomes também contam uma história." },
    { id: "ultimo_nome", nome: "Quem Ficou Esperando", desc: "Fique no escuro depois do último nome.", secreta: true, dica: "Nem todo mundo vai embora quando a luz apaga." },
    { id: "xara", nome: "Xará", desc: "Jogue com o nome de alguém do internato.", secreta: true, dica: "O campo do seu nome, no título." },
    { id: "seu_nome", nome: "Não Era a Lia", desc: "Ouça o Chamado dizer o seu nome e não vá.", secreta: true, dica: "Ele aprende nomes." },
    { id: "tarde_demais", nome: "Tarde Demais", desc: "Digite no cofre o ano em que você está.", secreta: true, dica: "Que ano é lá fora?" },
    { id: "pilha_lia", nome: "Duas Pilhas", desc: "Jogue com a bateria do aparelho quase no fim.", secreta: true, dica: "A lanterna não é a única coisa acabando." }
  );
})(window.ROTEIRO);

// LOTE 4 — SEGREDOS E EASTER EGGS (src/historia-segredos.js): lugares escondidos, códigos, cartas, finais
// secretos e a palavra que liga tudo. Notas e fitas daqui são todas "secreta: true" (não contam no total).
(function (R) {
  R.lote4 = {
    // ---- o carro (prólogo): sentar de novo, o rádio que segue o programa, a partida que não pega
    carro: {
      entrar: "Entrar no carro",
      chave: "Girar a chave",
      dicaSentada: "W/S: sair do carro · segure E na chave: dar a partida",
      sentou: [{ quem: "lia", texto: "(baixinho) Só um minuto. Só um minuto aqui dentro, com a porta fechada." }],
      saiu: { quem: "lia", texto: "Tá. Tá bom. Ele tá esperando." },
      programa: [
        { quem: "radio", texto: "...e a previsão pra madrugada é de chuva forte na serra. A Defesa Civil pede: não suba a estrada velha..." },
        { quem: "radio", texto: "...recado de ouvinte agora. Para a Lia, que está parada na estrada velha: o seu irmão pediu pra avisar que a porta da frente emperra..." },
        { quem: "lia", texto: "...o quê?" },
        { quem: "radio", texto: "...outro recado, sem nome: 'não liga o motor, moça. ele gosta de barulho'. Fica o recado." },
        { quem: "radio", texto: "(um hino de escola, tocado devagar demais) ...a Serra FM encerra a sua programação. Boa noite a quem ficou." },
        { quem: "radio", texto: "(silêncio de rádio. Nem chiado.)" }
      ],
      batidas: [{ quem: "lia", texto: "(prendendo o ar) ...tem alguém em cima do carro." }, { quem: "lia", texto: "Tá bom. Tá bom, eu saio. Eu saio!" }],
      tentativas: [
        "(o motor tosse e morre) Vamos. Vamos...",
        "(tosse de novo) Eu sei que tem gasolina.",
        "(engasga) Eu juro que se você pegar...",
        "(nada) Não. Não, não, não.",
        "(um estalo lá fora, no mato) ...o barulho. Ele gosta de barulho.",
        "(tosse longa) Mais uma. Só mais uma.",
        "(engasga) O Davi tá lá dentro. E eu tô aqui girando uma chave.",
        "(o motor quase pega) Quase. Quase!"
      ],
      pegou: { quem: "lia", texto: "(o motor pega. A Lia não respira.) ...pegou." },
      final: {
        titulo: "FINAL ESCONDIDO: NÃO ENTREI",
        texto: "A Lia engatou a ré e foi embora pela estrada velha, de faróis apagados até a curva.\n\nNo dia seguinte, o jornal da cidade deu uma nota pequena: \"Mais uma noite em que ninguém subiu a serra.\"\n\nEla nunca contou pra ninguém que o rádio do carro, naquela madrugada, sussurrou do banco de trás. Uma palavra só.\n\n\"Lia?\"\n\nQuinze anos viraram trinta. A fita continua chegando pelo correio. Todo ano, no dia 14.",
        tempo: "Você foi embora em {t}. Ninguém precisa chegar lá.",
        botao: "Voltar ao menu"
      },
      volta: { t: 25.2, quem: "davi", texto: "(na fita, mais perto que antes) Você foi embora, Lia. Por que você foi?" }
    },
    // ---- Seu Joaquim: depois da conversa obrigatória, ele ainda responde (cada vez com menos paciência)
    joaquim: {
      extras: [
        { quem: "joaquim", texto: "Chove assim desde setenta e nove. A serra não esquece." },
        { quem: "joaquim", texto: "O seu irmão roubava bala do meu pote. Achava que eu não via. Eu via." },
        { quem: "joaquim", texto: "Moça, a chave. No prego. Atrás de você." },
        { quem: "joaquim", texto: "Você é teimosa igual ele. Ele também voltava pra perguntar a mesma coisa." },
        { quem: "joaquim", texto: "Não tô com fome, não tô com frio e não tô com pressa. Tô morto, moça." },
        { quem: "joaquim", texto: "Vai, moça. Eu já morri, não tenho o dia todo." },
        { quem: "joaquim", texto: "(ele bufa e olha pro rádio) ..." },
        { quem: "joaquim", texto: "Senta aí. Já que não vai embora, então escuta." }
      ],
      historia: [
        { quem: "joaquim", texto: "(tirando o chapéu) Naquela noite o diretor parou aqui. Carro preto, sem farol." },
        { quem: "joaquim", texto: "Pediu dois galões cheios. Disse que era pro gerador. O gerador era a diesel, moça." },
        { quem: "joaquim", texto: "Eu enchi. Eu enchi os dois. E fiquei aqui ouvindo o sino bater até parar." },
        { quem: "joaquim", texto: "(estende um rolo de fumo) Leva. Deixa no oratório da curva. É o que eu nunca tive coragem de deixar." }
      ],
      luz: { quem: "joaquim", texto: "Tira essa luz da minha cara. Morto não fica cego, fica cansado." },
      apressada: { quem: "joaquim", texto: "Apressada igual o menino. Ele também corria. Não adiantou." }
    },
    caixa: { rotulo: "Abrir a gaveta da caixa registradora", vazia: "A gaveta range. Só moedas de cruzeiro e poeira.", chave: "No fundo da gaveta, uma chavinha com etiqueta de papel: A.T. 1980." },
    sapatos: { rotulo: "Ler uma carta da caixa de sapatos", lido: "Uma carta por noite. As outras continuam lacradas." },
    chamadaNome: "\n\n(uma 38ª linha, à mão, na letra do Davi; a tinta ainda escorre)\n38. {nome} ✓",
    // ---- térreo
    braile: {
      rotulo: "Uma plaquinha de latão com pontinhos em relevo",
      ler: "Ler com os dedos, no escuro",
      dica: "Pontinhos em relevo. Isso não é pra olhar. É pra ler no escuro, de joelhos, com os dedos.",
      lia: [{ quem: "lia", texto: "(de olhos fechados) Ele lia assim. Passando a mão. Toda noite, no mesmo lugar." }],
      terceira: [{ quem: "lia", texto: "(a voz falha) ...é a cabeça dele. Eu tô lendo a cabeça dele." }]
    },
    gaveta: { rotulo: "Abrir a gaveta da carteira riscada D.M.", titulo: "CADEADO DA GAVETA — D.M.", erro: "Errado. Na tampa, a canivete: 'eu e ela, naquela noite'." },
    lousa: { rotulo: "Ler a chamada na lousa", presente: "PRESENTE" },
    castigo: {
      rotulo: "Ler a lousa do castigo",
      nada: "NÃO FALAREI NA HORA, cem vezes. Uma das linhas, no meio, parece mais escura. Molhada.",
      clarao: "No clarão, uma linha da lousa brilhou diferente das outras.",
      fuga: { quem: "lia", texto: "Três segundos. O Davi escreveu na lousa. CORRE!" }
    },
    pasta: { rotulo: "Folhear a pasta da professora" },
    livro: { rotulo: "Pegar o livro 'Contos para Dormir'" },
    retida: { rotulo: "Ler a carta mais nova da caixa de retidas" },
    bolo: {
      forno: "Abrir o forno frio",
      achou: "Dentro do forno frio, um bolo seco, duro como pedra. DAVI 12, em glacê rachado. Doze velinhas tortas.",
      acender: "Acender as doze velinhas",
      soprar: "Soprar as velinhas",
      cantam: [
        { quem: "voz", texto: "(sussurrado, de muitas bocas, no escuro) ...parabéns pra você, nesta data querida..." },
        { quem: "voz", texto: "(uma voz só, bem perto) Faz um pedido, Lia." },
        { quem: "lia", texto: "(muito baixo) ...eu quero ele de volta." }
      ]
    },
    planta: { rotulo: "Abrir a planta enrolada" },
    zelador: { rotulo: "Ler o caderno do zelador" },
    placa: { rotulo: "Olhar a placa de bronze de 1931", gasta: "Os nomes estão gastos. Um foi raspado. Com a luz bem de perto, de lado, talvez dê pra ler o relevo." },
    bilhete: { rotulo: "Ler o bilhete dobrado em quatro", lembra: { quem: "lia", texto: "(rindo, sem querer) A língua do P. A gente falava assim pra Irmã não entender." }, recusa: { quem: "lia", texto: "Esse não. Esse eu não quero ler." } },
    // ---- andar de cima
    colchao: { rotulo: "Ler a carta debaixo do colchão D.M." },
    corrente: { rotulo: "Ler a carta-corrente", copiar: "Copiar a carta-corrente nove vezes", copiou: "A décima linha aparece sozinha, em outra letra: QUEM QUEBROU FOI O DAVI. ELE NÃO TINHA MEDO.", ignorou: { t: 25.6, quem: "lia", texto: "...tem um papel no banco do carona. A carta-corrente. Eu não copiei." } },
    espelho: { pegar: "Pegar a folha escrita ao contrário", ler: "Ler a folha do Davi no espelho", lia: { quem: "lia", texto: "Ao contrário. Ele era canhoto. Escrevia assim pra freira não ler." }, desvira: { quem: "lia", texto: "No espelho dá pra ler." } },
    visitante: { quem: "lia", texto: "(sussurrando, com o dedo na madeira) J.P. esteve aqui. Dois mil e vinte e seis. ...Alguém de depois?" },
    cadeado: { rotulo: "Forçar o cadeadinho do diário rosa com um grampo" },
    monitor: { rotulo: "Ler o caderno do monitor" },
    galena: {
      rotulo: "Ajustar o fio do radinho de lata",
      falas: [
        { quem: "radio", texto: "(longe, por dentro da lata) ...Rádio Serra FM, vinte e uma horas em ponto. Chuva forte em toda a região..." },
        { quem: "radio", texto: "(chiado) ...moradores voltam a relatar badaladas vindas do internato..." },
        { quem: "lia", texto: "(no radinho, com a minha voz) Tinha alguma coisa em cima do carro. Eu tô chegando, Davi." },
        { quem: "lia", texto: "...essa sou eu. Isso foi agora há pouco. Ou foi ontem. Ou vai ser amanhã." }
      ]
    },
    perguntas: {
      rotulo: "Responder o caderno de perguntas",
      dica: "aperte 1, 2, 3 ou 4 para responder",
      opcoes: ["o escuro", "ficar sozinha", "ser esquecida", "não achar o Davi"],
      respondeu: { quem: "lia", texto: "(escreve devagar, com a letra que tinha aos catorze) Pronto. Agora alguém sabe." },
      capela: [
        { quem: "voz", texto: "(do escuro, perto do chão) Tá escuro aqui, né, Lia? Você escreveu que tinha medo." },
        { quem: "voz", texto: "(atrás de você, muito perto) Todo mundo foi embora. Só ficou você. Você escreveu." },
        { quem: "voz", texto: "(sussurro) Qual era o seu nome mesmo, moça? ...Ninguém lembra." },
        { quem: "davi", texto: "(eco, do alto da torre) Eu tô aqui. Você escreveu que tinha medo de não me achar. Eu tô aqui." }
      ],
      final: [
        "No caminho de volta, a Lia deixou a lanterna acesa a noite inteira. Não precisou mais.",
        "No carro, pela primeira vez em quinze anos, ela não ligou o rádio pra ter companhia.",
        "Na pedra do Davi, alguém tinha riscado o nome dela também. Ninguém ia esquecer.",
        "Ela achou o Davi. Demorou quinze anos e uma noite. Mas achou."
      ]
    },
    gibi: { rotulo: "Ler o gibi feito à mão" },
    // ---- túneis
    tijolo: { rotulo: "Puxar o tijolo solto com L.M. riscado", depois: [{ quem: "lia", texto: "(a respiração se quebra; ela chora sem barulho)" }, { quem: "lia", texto: "...catorze. Eu fiz catorze e ninguém me deixou ouvir isso." }] },
    pacto: { rotulo: "Ler o que está escrito a carvão" },
    cofre: {
      c1503: { disp: "PARABÉNS", toast: "Uma gavetinha de cima solta: uma vela de aniversário torta, um 14 de cera, e um curativo.", fala: { quem: "lia", texto: "Quinze de março. Ele sabia que eu ia tentar o meu aniversário. Ele sabia que eu ia..." } },
      c1234: { quem: "davi", texto: "(eco, dentro do cofre) Um, dois, três, quatro? Você não mudou nada, Lia." },
      c9999: { quem: "lia", texto: "(longe, o sino bate uma vez sozinho) ...não fui eu. Eu não toquei em nada." },
      inverso: { quem: "davi", texto: "(eco) Tá de trás pra frente. Igual a fita quando enrosca." }
    },
    // ---- cemitério e capela
    capsula: { rotulo: "Cavar a terra fofa ao lado da cruz sem nome", semPa: "A terra tá fofa, mas com a mão não vai. Preciso de uma pá.", lata: "Uma lata de bolacha enferrujada. Dentro, três envelopes: PARA ABRIR EM 1994." },
    cruzJ: { rotulo: "Olhar a cruz de madeira", texto: "Uma cruz de madeira, sem lápide. A canivete: J. S. — 1979.", radio: { quem: "radio", texto: "(chiado, de lugar nenhum) ...eu nunca saí do posto, moça. Mas o corpo ficou aqui." } },
    banco: { rotulo: "Olhar o banco da última fileira", escuro: "Madeira gasta. Riscos de gerações. Com luz de lado, bem de perto, talvez dê pra ler.", lia: { quem: "lia", texto: "(passando o dedo) L.M., 1994. A madeira ainda tá clara. Isso foi feito hoje." } },
    albano: { trancado: "Um armário trancado por fora. Etiqueta amarelada: A.T.", abrir: "Abrir o armário trancado por fora (chave A.T. 1980)", portao: { quem: "joaquim", texto: "Por aqui, moça! ...Agora você sabe o que eu fiz. Corre!" } },
    // ---- coisas que valem a noite inteira
    letra: "Num canto, pintada pequena, uma letra: {l}. Embaixo, um número riscado: {n}.",
    choro: { senta: { quem: "lia", texto: "(a Lia escorrega pela parede até o chão e chora baixinho)" }, levanta: { quem: "lia", texto: "(respira fundo) Eu vim buscar ele. Levanta, Lia." } },
    liaPagina: { quem: "lia", texto: "Tem uma página a mais no meu diário. Com a minha letra. De hoje." },
    liaPaginaLida: { quem: "lia", texto: "Eu não escrevi isso. ...Escrevi?" },
    regra8Jogador: "\n\n(embaixo, com outra caneta, na letra da Lia)\n8. {r}",
    regra8Pesadelo: "\n\n(no pé da folha, em letra de criança, quase apagada)\n8. Se você ler isso, ele já sabe que você leu.",
    regra8Leu: { quem: "lia", texto: "(o papel treme na mão) ...ele sabe." },
    carta: {
      titulo: "Antes de ir embora",
      davi: "Deixar uma carta no túmulo do Davi (até 140 letras)",
      regra: "Escrever uma regra a mais na folha do Joaquim (até 80 letras)",
      salvar: "Guardar",
      guardou: "Guardado. Amanhã à noite alguém vai ler.",
      respostas: {
        desculpa: "(na fita, depois do chiado) Não tem o que desculpar, Lia. Eu que pedi pra vir. Eu escrevi isso no desenho, lembra?",
        saudade: "(na fita, depois do chiado) Eu também. Eu conto os seus passos no corredor. Você anda igual a mãe.",
        mae: "(na fita, depois do chiado) Fala pra mãe que eu comi tudo. Que eu não chorei. Mentira, mas fala.",
        medo: "(na fita, depois do chiado) Medo é bom, Lia. Medo deixa a gente quietinho. Quietinho ele não acha.",
        voltar: "(na fita, depois do chiado) Volta não. ...Volta sim. Volta só mais uma vez.",
        outra: "(na fita, depois do chiado) Eu li a sua carta. Li três vezes. A letra tá igual."
      }
    },
    acorda: {
      linhas: [
        "(clique de REC) Lia? Se você está ouvindo, a hora está acabando.",
        "Ele está acordando. Traz nossas coisas de volta. E não responde quando ele chamar.",
        "(baixinho, só pra ele) Eu sei que você vai voltar. Você sempre volta.",
        "Davi acordou primeiro."
      ]
    },
    fita5: { aviso: "Tem um gravador no chão que não estava aqui. Na etiqueta, a lápis: 5." },
    cartaAdulto: { t: 25.8, quem: "lia", texto: "...tem um envelope preso no limpador do para-brisa. Letra de adulto. Assinado: Davi." },
    primeiraVersao: { t: 9.8, quem: "radio", texto: "(entre duas estações) ...da outra vez eram oito noites, Lia. O prédio encolheu..." },
    copa: [
      "rádio-relógio: ...a seleção treina em silêncio, rumo à Copa nos Estados Unidos...",
      "rádio-relógio: ...o técnico pede calma à torcida. Na serra, chove...",
      "rádio-relógio: ...faltam poucas semanas para a Copa. No São Lázaro, ninguém tem televisão..."
    ],
    copaFinal: "rádio-relógio: ...é campeão nos pênaltis! O país inteiro grita! ...e lá no São Lázaro, ninguém comemorou.",
    // ---- esquisitices que a Lia anota sem perceber
    esquisitices: {
      costas: "Hoje eu andei de costas pela estrada. Muito tempo. Não sei por quê.",
      carro: "Voltei pro carro. Fiquei sentada com a porta fechada, fingindo que era outra noite.",
      partida: "Girei a chave do carro morto. Mais de uma vez. Ele estava ouvindo.",
      prosa: "Conversei com um morto até ele perder a paciência.",
      luzJoaquim: "Apontei a lanterna na cara do Seu Joaquim. Ele reclamou.",
      choro: "Fiquei sentada no chão chorando. Ninguém veio. Ou veio e não disse nada.",
      respondeu: "Respondi quando ele chamou. A regra dizia pra não responder.",
      braile: "Li no escuro com os dedos, de joelhos, como ele lê.",
      mortes: "Morri tantas vezes que perdi a conta. A lousa não perdeu.",
      escondida: "Fiquei escondida tanto tempo que esqueci do que eu tava fugindo.",
      bolo: "Fiz um pedido num bolo de quinze anos atrás.",
      cofre: "Digitei o meu aniversário num cofre. Ele sabia.",
      corrente: "Copiei uma carta-corrente nove vezes. A décima linha se escreveu sozinha.",
      visitante: "Dentro de um armário tinha o nome de alguém que ainda não nasceu."
    },
    // conquistas novas (secretas)
    conquistas: [
      { id: "nao_entrei", nome: "Não Entrei", desc: "Vá embora antes de passar pelo portão.", secreta: true, dica: "O carro morreu. Morreu mesmo?" },
      { id: "programa_inteiro", nome: "Até o Hino", desc: "Fique no carro até a rádio sair do ar.", secreta: true, dica: "Ninguém precisa chegar lá. Ainda." },
      { id: "prosa_comprida", nome: "Prosa Comprida", desc: "Converse com o Seu Joaquim até ele contar o que fez.", secreta: true, dica: "Velho gosta de ser perguntado." },
      { id: "trancado_fora", nome: "Trancado Por Fora, Também", desc: "Abra o armário da capela com a chave certa.", secreta: true, dica: "Uma chave com iniciais, longe de onde ela abre." },
      { id: "irmao_velho", nome: "Irmão Mais Novo", desc: "Abra a gaveta do Davi na sala de aula.", secreta: true, dica: "Eu e ela, naquela noite." },
      { id: "presente", nome: "Presente", desc: "Chegue à sala de aula sem ter sido encontrada nenhuma vez.", secreta: true, dica: "A chamada também conta quem caiu." },
      { id: "quando_crescer", nome: "Quando Crescer", desc: "Leia as redações da pasta da professora.", secreta: true },
      { id: "o_pedido", nome: "O Pedido", desc: "Sopre as velinhas que esperam no forno frio.", secreta: true, dica: "A cozinha tem um forno que não esquenta." },
      { id: "dedos", nome: "Ler Com os Dedos", desc: "Leia as três plaquinhas do Moacir no escuro.", secreta: true, dica: "Algumas coisas não são pra olhar." },
      { id: "visitante", nome: "Visitante", desc: "Ache o nome de alguém que ainda não veio.", secreta: true, dica: "O Davi dormia num armário quando tinha medo." },
      { id: "ate_dez", nome: "Até Dez", desc: "Abra o diário de cadeadinho da Ana.", secreta: true },
      { id: "catorze", nome: "Catorze", desc: "Ouça a fita atrás do tijolo com as suas iniciais.", secreta: true, dica: "Uma das meninas da língua do P sabia onde." },
      { id: "abrir_1994", nome: "Abrir em 1994", desc: "Desenterre a lata que esperava por este ano.", secreta: true, dica: "Uma cruz sem nome no canto do cemitério." },
      { id: "ja_estive", nome: "Já Estive Aqui", desc: "Ache as suas iniciais entalhadas na capela.", secreta: true },
      { id: "acorda", nome: "Acorda", desc: "Diga a palavra dos lugares que não existem.", secreta: true, dica: "Seis letras pequenas, em seis lugares escondidos." },
      { id: "regra_oito", nome: "Regra Oito", desc: "Leia a regra que só existe no Pesadelo.", secreta: true },
      { id: "quatorze_cofre", nome: "Parabéns", desc: "Digite no cofre o aniversário da Lia.", secreta: true, dica: "Página 1 do Davi." },
      { id: "fita_cinco", nome: "A Fita 5", desc: "Ache três segredos na mesma noite.", secreta: true, dica: "Ela não está em lugar nenhum. Ainda." },
      { id: "espelho", nome: "Canhoto", desc: "Leia a folha do Davi do jeito que ele escreveu.", secreta: true },
      { id: "giz_molhado", nome: "Giz Molhado", desc: "Leia a linha da lousa que só aparece no clarão.", secreta: true, dica: "Apague a luz e espere o céu." },
      { id: "galena", nome: "Lata e Fio", desc: "Sintonize o radinho que o Davi fez.", secreta: true },
      { id: "carta_davi", nome: "Correio dos Mortos", desc: "Deixe uma carta pro Davi e volte para a resposta.", secreta: true }
    ]
  };

  const L4 = R.lote4;
  const nota = (id, titulo, texto, extra) => R.notas.push(Object.assign({ id, titulo, texto, secreta: true }, extra || {}));
  // ---- prólogo
  nota("l4_cartaJ", "Carta para quem vier depois das nove", "{carta}");
  // ---- térreo
  nota("l4_braile1", "Plaquinha de latão — casa de máquinas", "(pontinhos em relevo, lidos com a ponta dos dedos)\nHoje um menino respirou alto debaixo da cama. Eu fingi que não ouvi.\nEu sempre finjo. Ninguém sabe que eu finjo.\n— M.");
  nota("l4_braile2", "Plaquinha de latão — patamar", "(pontinhos em relevo, gastos de tanta mão)\nO diretor diz que eu sou os ouvidos da casa.\nEu escuto o choro, o sino, a chuva. Escuto a minha mãe, que morreu em 1931.\nSe eu parar de escutar, eu durmo. E se eu dormir, eles acordam.\n— M.");
  nota("l4_braile3", "Plaquinha de latão — grade do túnel norte", "(pontinhos em relevo, frescos, como se alguém ainda escrevesse)\nTem uma moça no prédio. Ela anda igual a mãe dela.\nEu sei que é a irmã do menino do sino. Eu sei desde o portão.\nEu não vou contar pra minha cabeça. A cabeça faz o que o corpo manda.\nLia, se você ler isto: eu também estou cansado.\n— Moacir");
  nota("l4_gaveta", "Gaveta da carteira D.M.", "(um curativo ainda no papel e um bilhete dobrado)\n(letra de lápis, apertada)\nse a Lia vier, ela é a mais corajosa.\nela tem 14 e eu tenho 12 mas eu sou o mais velho por dentro.\nnão conta pra ela que eu disse isso.\n— D.");
  nota("l4_lousa", "Chamada na lousa", "{lousa}");
  nota("l4_castigo", "Lousa do castigo", "NÃO FALAREI NA HORA.\nNÃO FALAREI NA HORA.\nNÃO FALAREI NA HORA.\n(no meio, uma linha escrita com giz molhado, que só aparece no clarão)\nQUANDO O SINO BATER ELE DEMORA TRÊS SEGUNDOS PRA ACORDAR. CORRE.\nNÃO FALAREI NA HORA.\nNÃO FALAREI NA HORA.");
  nota("l4_redacoes", "Redações: O que eu quero ser", "REDAÇÃO — 3ª SÉRIE — 1979\n(letra do Davi)\nEu quero ser bombeiro, igual o Tomé quer. Pra ninguém mais ficar trancado. Bombeiro tem machado e machado abre porta.\n\n(letra redonda de menina)\nEu quero ser grande. — Ana\n\n(uma folha amarelada, de 1947, guardada junto)\nEu quero ser inspetor. Inspetor anda no escuro e não tem medo. — Moacir, 8 anos");
  nota("l4_ficha", "Ficha de empréstimo — Contos para Dormir", "BIBLIOTECA SÃO LÁZARO — FICHA DE EMPRÉSTIMO\nIrmã Lourdes — 1966 — devolvido\nLuiz — 1951 — devolvido\nDavi M. — 14/03/1979 —\n(embaixo, em tinta fresca, com a sua letra)\nLia M. — 1994 —");
  nota("l4_retida", "Correspondência retida — 1994", "{retida}");
  nota("l4_planta", "Planta do andar de cima — 1931", "PLANTA BAIXA — ANDAR DOS DORMITÓRIOS — 1931\nDormitórios A, B, C, D, E.\n(um sexto retângulo no fim do corredor, apagado com borracha)\nF — NÃO CONSTA\n(carimbo vermelho por cima)\nREFORMA DE 1980: OITO ALAS. SOBROU ISSO.\n(a lápis, na margem, letra de menino)\no F ainda tá lá. só não tem porta.");
  nota("l4_zelador", "Caderno do zelador", "IDEIAS PRA ASSUSTAR OS MENINOS (e não deixar ninguém sair da cama)\n- um homem que só ouve. bom. ninguém respira.\n- oito andares de corredor. cansa demais. ~cortei~.\n- menina que conta até cem. não. até dez. dez é pior.\n- um sino que bate nove.\n- mil coisas pra arrumar e o sino ainda desafina.\n(na última linha, outra letra)\nquem lê isso também está na lista.");
  nota("l4_placa", "Placa de inauguração — 1931", "INTERNATO SÃO LÁZARO — 1931\nFUNDADORES: PADRE OSVALDO · IRMÃ BENEDITA · IRMÃ CONCEIÇÃO\n(um nome raspado; o relevo aparece com a luz de lado)\nMOACIR DUARTE (PAI) — ZELADOR E BENFEITOR\n(embaixo, menor)\nO FILHO FICA COM A CASA.");
  nota("l4_bilheteP1", "Bilhete dobrado (letra de menina)", "PEU PSEI PON PDE PO PDA PVI PES PCON PDE PU PA PGA PVE PTA", { traducao: "EU SEI ONDE O DAVI ESCONDEU A GAVETA: NA SALA DE AULA, A CARTEIRA RISCADA." });
  // ---- andar de cima
  nota("l4_colchao", "Carta debaixo do colchão D.M.", "{colchao}");
  nota("l4_corrente", "Carta-corrente (1979)", "ESTA CARTA VEIO DE OUTRO INTERNATO.\nCOPIE NOVE VEZES E ESCONDA NOVE COLCHÕES.\nSE QUEBRAR A CORRENTE, ELE VEM TE BUSCAR HOJE, ANTES DA NONA BADALADA.\n(nove nomes de crianças, cada um com uma letra)\nRosa · João · Luiz · Maria · Tomé · Ana · Bento · ...\n(a nona linha está em branco)");
  nota("l4_espelho", "Folha escrita ao contrário", "{espelho}", { normal: "(letra de canhoto, escrita de trás pra frente)\nQuando eu tenho medo eu durmo no armário do dormitório C. O do canto.\nLá dentro tem nome riscado de gente que ainda nem veio.\nO Inspetor não abre aquele. Ele diz que é dos que ainda vão chegar.\n— D." });
  nota("l4_visitante", "Riscado dentro do armário", "(riscado na madeira, por dentro, com prego)\nJ.P. esteve aqui — 2026\n(e embaixo, fundo, em letra de 1979)\neu também. — D.M.");
  nota("l4_ana", "Diário de cadeadinho da Ana", "(um diário rosa, com cheiro de talco velho)\nquerido diário. hoje a irmã me trancou no escuro de novo porque eu chorei na hora.\neu contei até dez. até dez a mamãe sempre voltava.\nela não voltou. mas eu continuo contando.\nse alguém achar isso: não tira o olho de mim. eu só ando quando ninguém me vê. que nem antes.\n— Ana Luísa, 9 anos");
  nota("l4_monitor", "Caderno do monitor (fora da cama)", "{monitor}");
  nota("l4_perguntas", "Caderno de perguntas das meninas", "{perguntas}");
  nota("l4_gibi", "Capitão Trovão contra o Homem Cego (gibi feito à mão)", "(seis quadrinhos a lápis de cor, numerados)\n1. O Capitão Trovão se esconde no forro. O Homem Cego passa embaixo e não ouve nada.\n2. O Capitão pisca a lanterna três vezes pra uma menina lá fora. Ela pisca de volta.\n3. O Capitão abre uma gaveta com a idade dele e da irmã. 'ACESSO PERMITIDO!'\n4. O Capitão puxa um tijolo com duas letras e acha um tesouro: uma fita.\n5. O Capitão cava um X do lado de uma cruz sem nome. 'PRA ABRIR NO FUTURO!'\n6. O Capitão toca o sino. O Homem Cego cai de joelhos. FIM.\n(na contracapa) próxima edição: o Capitão Trovão e a Sala Que Não Existe");
  nota("l4_bilheteP2", "Bilhete dobrado (letra de menino)", "PO PTO PMÉ PES PCON PDEU PO PCAR PRI PNHO PNO PMU PRO", { traducao: "O TOMÉ ESCONDEU O CARRINHO NO MURO." });
  nota("l4_bilheteP3", "Bilhete dobrado (letra da Lia, aos catorze)", "PNO PTÚ PNEL PO PES PTE PTEM PUM PTI PJO PLO PCOM PMEU PNO PME PDA PVI PGRA PVOU PPRA PMIM", { traducao: "NO TÚNEL OESTE TEM UM TIJOLO COM MEU NOME. DAVI GRAVOU PRA MIM.", recusa: true });
  // ---- túneis
  nota("l4_pacto", "Escrito a carvão na parede", "(letras grandes, a carvão, por cima dos tijolos)\nQUEM SAIR VOLTA PRA BUSCAR OS OUTROS.\nDAVI · TOMÉ · ~BENTO~\n(a assinatura do Bento está borrada, como se uma mão tivesse passado por cima)");
  // ---- cemitério
  nota("l4_capsula", "Cápsula do tempo — PARA ABRIR EM 1994", "{capsula}");
  nota("l4_banco", "Iniciais no banco da capela", "(entalhado na madeira do encosto, de gerações)\nR. 1958 · J. 1955 · L. 1952 · M.D. 1931 · T.R. 1979 · D.M. 1979\n(e, com a madeira ainda clara, como se fosse hoje)\nL.M. 1994");
  nota("l4_albano", "Armário da sacristia (trancado por fora)", "(lá dentro: um terno preto pendurado, marcas de unha por dentro da porta, e uma folha presa no bolso)\nA última página do diretor Albano Teixeira.\nNão foi o fogo. Foi a porta. Alguém trancou por fora enquanto eu procurava a chave da capela.\nOuvi a voz do zelador do outro lado: 'agora o senhor fica com o silêncio que pediu'.\n(a letra piora)\nJoaquim. Eu sei que é você. Abre. Abre. Abre.");
  // ---- do diário (segredos que se escrevem sozinhos)
  nota("l4_esquisitices", "Coisas que eu fiz hoje (e não lembro de decidir)", "{esq}");
  nota("l4_davi", "Página escrita a lápis de cor", "{davi}");
  nota("l4_lia", "Uma página com a minha letra", "(com a letra da Lia, datada de hoje)\nCapítulo I. Sem luz.\nVou forçar a porta da frente. Vai fazer barulho.\nO galão de gasolina não está na despensa. NÃO ABRA A DESPENSA.\nOs fusíveis estão na enfermaria. Ele vai estar no corredor quando o gerador roncar.\n(a última linha está borrada)\nEu já fiz isso antes. Eu sempre faço isso.");
  nota("l4_cartaAdulto", "Carta do Davi (que nunca existiu)", "Lia,\neu teria trinta e sete anos hoje. Teria saído em 1979 pela escotilha com o Tomé e ninguém ia saber do sino.\nEu ia ser bombeiro. Ia ter um cachorro chamado Tufão, porque o do Seu Joaquim era o melhor cachorro do mundo.\nIa te ligar todo dia 15 de março e cantar desafinado de propósito.\nVocê ia reclamar e rir. Eu ia fingir que não ouvi você chorar.\nNão deu. Mas você achou tudo. Cada canto, cada tijolo, cada lata. Ninguém procurou tanto por mim.\nEntão eu existi do mesmo jeito.\n— Davi\n(P.S. a letra tá de adulto porque eu treinei. 15 anos de treino.)");

  // ---- fitas secretas
  R.fitas.push(
    { id: "l4_festa", titulo: "Atrás do tijolo L.M. — Davi, março de 1979", secreta: true, linhas: [
      { quem: "davi", texto: "(cochichando) Tá gravando? Lia, é pra visita de amanhã. Se deixarem a visita." },
      { quem: "davi", texto: "(cantando baixinho, desafinado) Parabéns pra você... nesta data querida..." },
      { quem: "davi", texto: "Catorze, hein. Você vai fazer catorze, vai virar mocinha e vai me esquecer." },
      { quem: "davi", texto: "(rindo) Mentira. Não esquece não. Se esquecer eu puxo o seu pé." },
      { quem: "davi", texto: "(mais sério) Se não deixarem a visita, eu escondo isso aqui. Atrás do tijolo com o seu nome. Você é a melhor no esconde-esconde." }
    ] },
    { id: "l4_cinco", titulo: "Fita 5 — 13 de março de 1979", secreta: true, linhas: [
      { quem: "davi", texto: "(muito baixo) Treze de março. Amanhã é a noite. O Tomé, o Bento e eu." },
      { quem: "davi", texto: "O plano é tocar o sino até ele cair de joelhos. A Irmã Celeste disse que o sino segura ele." },
      { quem: "davi", texto: "A Lia não pode vir. Eu escrevi pra mãe não trazer. Se ela vier, ela vai querer ficar comigo." },
      { quem: "davi", texto: "(pausa) Se der errado... a Lia vai saber o que fazer. Ela sempre sabe. Ela só demora." },
      { quem: "davi", texto: "(clique) ...Bento, para de respirar no microfone." }
    ] }
  );
  for (const c of L4.conquistas) if (!R.conquistas.some(x => x.id === c.id)) R.conquistas.push(c);
  // linhas a mais nos finais (entram por src/historia-segredos.js, só quando o segredo foi achado)
  L4.finais = {
    braile3: "Antes de cair, o homem alto passou a mão no rosto da Lia. Leu. E sorriu, pela primeira vez em quarenta e oito anos.",
    pacto: "Lia voltou. Como eles combinaram.",
    ficha: "Na saída, ela deixou 'Contos para Dormir' na mesa da biblioteca. A ficha ganhou, enfim, uma data de devolução: 15/03/1994.",
    albano: "No portão, o Seu Joaquim não olhou pra ela. Ele também tinha trancado uma porta.",
    capsula: "No banco do carro, a lata de bolacha. A carta do Tomé tinha um caminhão de bombeiro desenhado. A do Bento, só o nome. Ela guardou as duas.",
    carro: "Na estrada, o carro pegou na primeira tentativa."
  };
  // textos que o jogo monta na hora (marcadores entre chaves)
  L4.modelos = {
    cartasJoaquim: [
      "1980. Pra quem vier depois das nove: a primeira regra eu aprendi ouvindo. O sino bateu nove e o corredor ficou mudo. Não corre.",
      "1981. Ninguém subiu esse ano. Eu fiquei feliz. Depois fiquei com medo de ficar feliz.",
      "1982. Um rapaz de moto subiu em junho. A moto ainda está no mato. Ele não.",
      "1983. Descobri que ele não enxerga quando derrubei a lanterna e ele passou por cima dela. Segunda regra.",
      "1984. As luzes piscaram aqui no posto. Entrei debaixo do balcão. Terceira regra. O posto fica longe do internato, moça. Longe demais pra piscar.",
      "1985. A menina conta até dez. Uma mãe subiu pra buscar a filha e eu ouvi a contagem até aqui. Quarta regra.",
      "1986. O repórter do Fusca. Eu avisei. Ele respondeu quando chamaram o nome dele. Quinta regra.",
      "1987. A sexta regra eu não escrevi. Apareceu na folha. Não confia nela.",
      "1988. Hoje fiz dez anos de morto e ninguém lembrou. Nem eu, até o rádio dizer a data.",
      "1989. Mandei a fita de novo. Voltou. ENDEREÇO INSUFICIENTE.",
      "1990. Sonhei que o menino Davi pagava as balas que roubou. Acordei com moedas de 1979 no balcão.",
      "1991. A estrada fechou. Agora só sobe quem quer muito.",
      "1992. Escrevi a sétima regra no verso. Se o sino parar, não olha pra trás. Eu olhei. Por isso eu fiquei.",
      "1993. Ano que vem a fita chega. Eu sinto. A moça tem os olhos do menino."
    ],
    cartaRubrica: "(envelope lacrado, carimbo do posto: {ano})",
    lousaCab: "CHAMADA — 3ª SÉRIE — 14/03/1979",
    lousaNomes: "ANA L. · BENTO · DAVI M. · JOÃO · LUIZ · MARIA · ROSA · TOMÉ R.",
    lousaLia: "(embaixo, com outro giz)\nLIA M. — {marcas}",
    lousaZero: "(embaixo, em letra de freira, caprichada)\nLIA M. — PRESENTE",
    lousaRodape: "(ao lado dos risquinhos, pequeno) contando todas as noites: {n}",
    retida: "(o envelope mais novo da caixa, endereçado a você, com a letra do jogo; carimbo: RETIDA — 1994)\nLia,\nontem à noite você {final}.\nNo {capitulo} você caiu {nCap} {vezesCap}. No total foram {n} {vezes}.\nVocê ficou escondida {escondida}.\n{chamado}\nvocê demorou a voltar dessa vez.\n— D.",
    retidaFinal: { comum: "saiu pelo portão dos fundos, sozinha", silencio: "foi embora e deixou o sino tocando", verdadeiro: "tocou o sino comigo", carro: "nem entrou. Foi embora de carro", nenhum: "não chegou até o fim" },
    retidaChamado: { sim: "E respondeu quando ele chamou. Eu ouvi.", nao: "E não respondeu quando ele chamou. Boa menina." },
    colchao: "(letra redonda de menina, de 1978)\nDavi, a mamãe disse que você vem no Natal. Se não vier eu vou buscar.\nEu deixei a minha lanterna com você. Não tem medo do escuro.\n— Lia",
    colchaoResp: [
      "(na margem, a lápis, uma letra de menino que não estava lá antes)\nvocê não caiu nenhuma vez hoje. tá andando igual eu.",
      "(na margem, a lápis, uma letra de menino que não estava lá antes)\nvocê caiu um pouco hoje. levanta devagar. ele gosta de barulho de joelho.",
      "(na margem, a lápis, uma letra de menino que não estava lá antes)\nvocê caiu muito hoje, Lia. a lanterna tá com você. usa."
    ],
    monitor: "LIVRO DE OCORRÊNCIAS NOTURNAS — FORA DA CAMA\nRosa — fora da cama — 21h05 — banheiro\nJoão — fora da cama — 21h12 — escada\nLuiz — fora da cama — 21h40 — rouparia\n(décadas de nomes, a mesma letra do começo ao fim)\nDavi M. — fora da cama — 21h00 — capela\n(a última linha, com a tinta ainda molhada)\nLIA M. — fora da cama — {h} — {sala}",
    monitorDepois: "(mais embaixo, a mesma tinta, escrita depois que você leu)\nLIA M. — ainda fora da cama — {h}",
    perguntas: "(caderno de capa dura, passado de cama em cama)\nNOME? Rosa · Maria · Ana Luísa\nSIGNO? peixes · não sei · peixes também\nQUEM VOCÊ GOSTA? (riscado) (riscado) do Davi\nMAIOR MEDO? do sino · da irmã · de contar até dez sozinha\n(a última página, com uma pergunta só, escrita para alguém que ainda não chegou)\nLIA, QUAL O SEU MAIOR MEDO?\n1. o escuro  2. ficar sozinha  3. ser esquecida  4. não achar o Davi",
    perguntasResp: "\n(com a sua letra, recém-escrita)\n{r}.",
    capsula: "(três envelopes de 1978, com letra de criança; PARA ABRIR EM 1994)\n\nDAVI — PRA LIA GRANDE\nLia, você virou professora? Ainda tem medo de escuro? {medo}\n{respondeu}\nSe você estiver lendo isso no internato: não fica. Vai embora. {mortes}\n\nTOMÉ\n(um caminhão de bombeiro desenhado, com a escada até o céu)\n\nBENTO\n(em branco. Só o nome, escrito com cuidado, três vezes.)",
    capsulaMedo: ["Eu acho que tem: você tá com a lanterna acesa agora, aposto.", "Eu acho que não: aposto que você tá andando no escuro, que nem eu ensinei."],
    capsulaResp: ["E não responde quando ele chamar. Você vai querer. Não responde.", "Eu sabia que você ia responder quando chamassem. Você nunca aguentou ficar quieta."],
    capsulaMortes: ["E não cai, que aqui o chão é duro.", "Eu sei que você já caiu {n} vezes. Para de cair, Lia."],
    davi: {
      d10: "(lápis de cor, letra de criança, numa página que não estava aqui)\nLia, você achou o forro! Você sempre foi a melhor no esconde-esconde.\nFalta pouco.\n(segredos achados: {n})",
      d20: "(lápis de cor, a letra mais caprichada)\nVinte! Você achou mais coisa que a Irmã Celeste em trinta anos.\nAs letras pequenas: {letras}. Elas formam uma palavra. A palavra acorda gente.\n(segredos achados: {n})",
      dTodos: "(lápis de cor, todas as cores)\nTUDO. Você achou tudo, Lia.\nNa próxima noite olha no para-brisa do carro. Eu deixei uma coisa.\n(segredos achados: {n})"
    },
    esqCab: "(com a letra da Lia, mas ela não lembra de ter escrito)"
  };
})(window.ROTEIRO);

// LOTE 5 — MONSTROS: como as entidades aparecem, lembram e perseguem no texto. Lido por src/historia-lote5.js.
window.ROTEIRO.lote5 = {
  // Ficha do Inspetor: uma linha revelada a cada morte, na tela de morte (morrer deixa de ser só frustração).
  ficha: {
    titulo: "FICHA DO INTERNATO — M. DUARTE",
    linhas: [
      "1. Moacir Duarte, admitido aos sete anos. Órfão. 'Criança quieta demais', diz o registro.",
      "2. Castigo favorito dos padres: o armário fechado. Uma hora por palavra dita. Ele aprendeu a não falar.",
      "3. Aos dezenove virou inspetor de disciplina. A mesma letra do castigo, agora assinando as fichas.",
      "4. 1971: pedido de autorização para 'medidas permanentes de silêncio no dormitório'. Deferido.",
      "5. Perdeu a visão num inverno. Passou a reconhecer cada criança pela voz, pelo passo, pela respiração.",
      "6. 14 de março de 1979: um incêndio na capela, na Hora do Silêncio. Trinta e sete crianças. Nenhuma gritou.",
      "7. O corpo dele nunca foi achado. Só o chaveiro, derretido no badalo do sino.",
      "8. Última anotação, letra tremida: 'Eu só queria que eles dormissem. Agora ninguém acorda.'"
    ],
    completa: "FICHA COMPLETA — você já sabe quem caça você. Saber não o deixa mais devagar."
  },
  // Ele lembra as suas mortes: comentário no começo do capítulo seguinte, cada vez mais pesado.
  lembra: [
    "",
    "Você de novo. Levanta rápido, menina.",
    "Duas vezes hoje. O chão já conhece o seu joelho.",
    "A terceira vez hoje, menina... você não cansa?",
    "Quantas foi já? Eu perdi a conta. Eu nunca perco a conta.",
    "Cada vez que eu te acho, eu te acho mais rápido. Reparou?"
  ],
  lembraTeto: "Fica caída então. É mais quieto assim.",
  // Perseguição memorável: falas de uma caçada longa e o alívio de ter escapado inteira.
  cacaLonga: [
    "(a voz vem de todo lado) Corre. Corre que eu gosto.",
    "O seu coração tá alto demais. Eu sigo ele no escuro.",
    "Você respira pela boca quando cansa. Igualzinho ao menino."
  ],
  sobreviveuCaca: "(a Lia, ofegante) Ele parou... o fôlego dele acabou antes do meu.",
  // Aparências mais perturbadoras, narradas quando ele está perto por muito tempo.
  aparencia: [
    "A cabeça dele pende pro lado, como quem escuta debaixo d'água.",
    "Os pés dele mal encostam no chão; ele desliza um palmo acima.",
    "A boca continua se mexendo um tempo depois que a voz para.",
    "Onde deviam estar os olhos, o latão do crachá reflete a sua lanterna.",
    "Os dedos dele contam no ar enquanto anda. Um, dois. Sempre contando."
  ],
  // Silhueta que tira o chapéu: o fecho da fuga vitoriosa.
  chapeu: "No limite da luz, o Inspetor está parado. Ele leva a mão à aba do chapéu e o tira, devagar, como quem dá boa-noite. O escuro o cobre antes que você veja o rosto.",
  // Silêncio premiado no Chamado: a voz falsa chora e o Davi de verdade sussurra o caminho.
  chamadoChora: "(a voz que te chamava afina, vira choro de criança e se desfaz) ...não era eu... não era eu...",
  chamadoDavi: {
    1: "...boa menina. A caixa de fusíveis tá na enfermaria. Rápido, Lia.",
    2: "...o quadro de chaves fica atrás do balcão. Não corre.",
    3: "...a engrenagem tá no dormitório da ponta. A Ana não gosta de luz: mantém a luz nela.",
    4: "...as válvulas na ordem da fita, Lia. Se errar, ele acorda.",
    5: "...o sino. Só o sino cala ele. Toca comigo."
  },
  chamadoDaviGen: "...sou eu de verdade dessa vez. Não responde em voz alta. Só segue a minha voz.",
  // Lousa / marcas de giz que contam suas mortes por tipo, na tela de morte.
  lousa: {
    conta: "Numa lousa de giz, riscos aparecem sozinhos, um a um — LIA: {n}.",
    muito: "O giz risca mais fundo — LIA: {n}. Embaixo, miúdo: 'não aprende'.",
    tipos: {
      inspetor: "| um risco reto por vez que ele te achou",
      ana: "/ um risco torto por vez que você piscou",
      procissao: "+ um risco cruzado por vez que saiu da cama"
    }
  },
  // Bilhete do sino: por que ele teme o sino, encontrado no caminho dos túneis.
  bilheteSino: {
    lia: "Um papel dobrado no bolso de um casaco de criança, pregado perto do caminho. A letra é do Davi.",
    davi: "...o inspetor tem medo do sino. Pra ele o sino é a mão que abria o armário do castigo. Se ele vier atrás de você, Lia: toca o sino. — D."
  },
  // Epílogos secretos do Moacir, recompensa de quem entendeu a tragédia dele.
  epilogoMenino: "\n\nQuando o sino cala, não é o homem alto que se ergue do altar. É um menino de sete anos, de uniforme grande demais. Ele olha pra você, acena com a cabeça e sai pela porta antes de você — sem pressa, pela primeira vez sem medo do escuro.",
  epilogoMerce: "\n\nVocê se abaixa ao lado dele e diz, baixinho, o que ninguém nunca disse: 'Boa noite, seu Moacir.' O homem alto deita no degrau do altar, dobra as mãos e dorme. De verdade. A casa inteira solta o ar junto com ele.",
  // Nome sob o crachá e variações das outras entidades por capítulo.
  cracha: "(a Lia, baixinho) Embaixo do latão tem outro nome arranhado... 'DAVI?'. Ele guardou o nome do meu irmão.",
  anaPorCap: {
    3: "...você demorou. Eu contei três vezes esperando você.",
    5: "...aqui fora é frio. Me leva junto dessa vez?"
  },
  procPorCap: {
    2: "(na fila passa uma menina que não estava antes; ela vira o rosto pra sua fresta)",
    5: "(a fila anda mais devagar hoje, como se soubesse que é a última noite)"
  },
  // Dicas sentidas pelo jogador, no momento certo.
  dicaPerseguido: "Numa caçada longa não corra em linha reta: vire numa porta e corte o som. Ele segue o barulho, não você.",
  dicaSino: "Lanterna e armário não bastam mais aqui. O sino é o único contra-jogo: toque-o.",
  // Primeiro encontro da noite: a Lia reconhece o homem da fita.
  primeiroCaca: ["(a Lia, baixinho) É ele. É o homem da fita.", "(a Lia) O chapéu... é ele. Não corre, não corre, não corre."],
  // Ele colado na fresta do esconderijo: o pior tipo de perto.
  pertoEscondida: ["(colado na fresta) ...eu ouço a sua barriga subir e descer.", "(bem baixinho) ...sai daí que eu prometo que é rápido.", "(um fungar comprido) ...cheiro de criança nova."],
  // Quase-agarrão: passou raspando.
  quaseFio: "(a Lia, sem ar) Passou raspando. Eu senti o frio da mão dele.",
  // Ele desiste e volta pra ronda, resmungando.
  rondaVolta: ["Tá bom. Volto depois. Eu sempre volto.", "Sumiu de novo. A noite é comprida, menina.", "Um... dois... fica pra próxima."],
  // Atmosfera de monstro ao entrar em cada capítulo (a Lia lê o lugar).
  entradaCap: {
    1: "(a Lia) A porta range e cheira a pó e cânfora. Tem alguém andando lá dentro, devagar.",
    2: "(a Lia) O relógio da torre tá quase nas nove. Quando bater, ninguém pode estar de pé.",
    3: "(a Lia) Lá em cima tem risinho de criança. Não tem criança nenhuma viva aqui.",
    4: "(a Lia) O ar embaixo é parado. É onde ele dorme. Pisa leve.",
    5: "(a Lia) O cemitério tá aberto e o sino espera. Essa é a última vez."
  },
  // A Menina e a Procissão, no primeiro instante em que aparecem.
  anaPrimeira: "(a Lia) Uma menina. Parada no fim do corredor. Ela não estava ali agora.",
  procPrimeira: "(a Lia) As luzes... eles estão vindo. Some. Some agora.",
  // O homem de verdade, baixinho, nas pausas de memória.
  reza: ["...dorme, menino. Amanhã tem aula.", "...eu só tranquei a porta pra proteger. Foi pra proteger.", "...quietos... ficam quietos que o padre não vem."],
  // Ele imita a voz do seu irmão pra te atrair.
  imitaDavi: "(com uma voz que tenta ser a do Davi) ...Lia? Vem cá, Lia. Achei uma coisa.",
  imitaDaviLia: "(a Lia, gelada) Esse não é o Davi. O Davi nunca me chamou assim.",
  // A Menina perto do dez: pânico.
  anaQuase: "(a Lia, sem respirar) Ela tá quase no dez. Não pisca. NÃO pisca.",
  // Escondida enquanto a Procissão passa.
  procPassa: "(a Lia, bem baixinho) ...conta um, dois, três... passa logo... passa logo...",
  // Na ronda, ele chama pelos nomes das crianças que já levou.
  chamaCriancas: ["Rosa? De volta pra cama, Rosa.", "Luiz, larga esse pião.", "João, pára de rolar essa bolinha.", "Maria das Dores, cabeça na almofada.", "Tomé? Tira esse capacete de papel."],
  // Ele conta as camas do dormitório e sente que falta alguém (Cap III).
  contaCamas: "Trinta e sete camas. Trinta e seis cheias. Tem uma menina fora da cama.",
  // Primeiro esconderijo da noite, com ele caçando: o cheiro do castigo.
  primeiroEsconde: "(a Lia, por dentro do armário) Cheira a criança trancada aqui dentro. Fica quieta, Lia. Fica quieta.",
  // No Pesadelo, ele é mais cruel.
  pesadeloCaca: ["Hoje eu não deixo você levantar.", "Esquece o armário. Eu sei todos eles."],
  // Codas de monstro nos finais de fuga.
  comumCoda: "\n\nNo retrovisor, por um segundo, um chapéu no acostamento. Depois só a estrada.",
  silencioCoda: "\n\nE, entre uma badalada e outra, bem baixinho, a voz dele contando: um... dois..."
};

// Aspas tipográficas: a fonte desenha a aspa reta como a de fechar, então as falas abrem com “ e fecham com ”.
(function curvar(o) {
  for (const k in o) {
    const v = o[k];
    if (typeof v === "string" && v.includes('"')) o[k] = v.replace(/(^|[\s(\[—–-])"/g, "$1“").replace(/"/g, "”");
    else if (v && typeof v === "object") curvar(v);
  }
})(window.ROTEIRO);
