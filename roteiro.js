// ROTEIRO — A HORA DO SILÊNCIO (v2)
// Todo o texto do jogo mora aqui. O motor lê window.ROTEIRO.
// Pode reescrever à vontade, mas mantenha os mesmos "id" (capítulos, objetivos, notas, fitas, falas).
// Marcadores trocados em jogo: {q} código do quadro · {d1}..{d4} dígitos do cofre · {v} ordem das válvulas
window.ROTEIRO = {
  titulo: "A HORA DO SILÊNCIO",
  subtitulo: "Internato São Lázaro · Serra da Mantiqueira · 1994",
  versao: "v2 · roteiro Claude",

  personagens: {
    lia:      { nome: "Lia",              cor: "#e8d9b0" },
    davi:     { nome: "Davi",             cor: "#9fc3d8" },
    joaquim:  { nome: "Seu Joaquim",      cor: "#c9b98a" },
    inspetor: { nome: "???",              cor: "#c0392b" },
    ana:      { nome: "Menina",           cor: "#d8a0b8" },
    celeste:  { nome: "Irmã Celeste",     cor: "#b8c8a8" },
    diretor:  { nome: "Diretor Albano",   cor: "#c8a878" },
    moacir:   { nome: "Moacir",           cor: "#a89888" },
    radio:    { nome: "Rádio",            cor: "#a8b08a" }
  },

  // Cartões de texto durante a viagem de carro (abertura)
  intro: [
    "Março de 1979. O Internato São Lázaro pegou fogo numa noite de chuva.",
    "Trinta e quatro crianças saíram de lá. Três nunca foram encontradas.",
    "Uma delas era meu irmão, Davi. Ele tinha doze anos.",
    "Quinze anos depois, chegou uma fita cassete sem remetente.",
    "A voz na fita é a dele. De criança."
  ],
  // Falas do rádio do carro durante a abertura (segundo em que começa)
  abertura: [
    { t: 3,  quem: "radio", texto: "...Rádio Serra FM, onze e quarenta da noite. Chuva forte em toda a região da Mantiqueira..." },
    { t: 10, quem: "radio", texto: "...a estrada velha do internato continua interditada. Motorista, evite..." },
    { t: 16, quem: "davi",  texto: "(na fita) Lia? Se você está ouvindo, a hora está acabando." },
    { t: 22, quem: "davi",  texto: "(na fita) Ele está acordando. Traz nossas coisas de volta. Por favor." },
    { t: 28, quem: "lia",   texto: "Eu tô chegando, Davi. Eu tô chegando." }
  ],

  regras: {
    titulo: "REGRAS PARA QUEM ENTRA DEPOIS DAS NOVE",
    texto: "1. Quando o sino bater nove vezes, começou a Hora do Silêncio. Não corra.\n\n2. O Inspetor não enxerga. Se ele estiver perto, fique parada. Se estiver muito perto, não respire.\n\n3. Se as luzes piscarem e o rádio chiar, entre num armário ou debaixo de uma cama. Eles estão indo dormir. Não deixe que te vejam fora da cama.\n\n4. Se ouvir uma menina contando, ache-a com a luz e não tire os olhos dela.\n\n5. Nunca responda quando chamarem seu nome.\n\n6. Não entre na capela. Nunca toque o sino."
  },

  // Campanha enxuta: 6 capítulos (prólogo + 5), cada um pensado para 8 a 12 minutos,
  // sem voltar por mapas já vistos e sem "junte 3 coisas" de enchimento.
  capitulos: [
    { id: "c0", titulo: "Prólogo — A Estrada Velha", mapa: "estrada",
      objetivos: [
        { id: "sair_carro", texto: "Saia do carro" },
        { id: "lanterna", texto: "Pegue a lanterna no porta-malas" },
        { id: "posto", texto: "Peça ajuda no posto de gasolina" },
        { id: "chave_portao", texto: "Pegue a chave do portão do internato" },
        { id: "abrir_portao", texto: "Siga a estrada até o portão e abra o cadeado" }
      ],
      gancho: "O portão bateu sozinho atrás de você." },
    { id: "c1", titulo: "Capítulo I — Sem Luz", mapa: "terreo",
      objetivos: [
        { id: "forcar_porta", texto: "Force a porta principal (segure E)" },
        { id: "galao", texto: "Encontre gasolina para o gerador" },
        { id: "fusiveis", texto: "Pegue a caixa de fusíveis reserva na enfermaria" },
        { id: "gerador", texto: "Ligue o gerador na casa de máquinas" }
      ],
      gancho: "O sino da capela começou a bater. Uma. Duas. Nove vezes." },
    { id: "c2", titulo: "Capítulo II — Nove Badaladas", mapa: "terreo",
      objetivos: [
        { id: "procissao", texto: "Sobreviva quando as luzes piscarem (regra 3)" },
        { id: "fita_diretor", texto: "Ouça a fita no gravador da diretoria" },
        { id: "chave_escada", texto: "Abra o quadro de chaves da recepção (código de 3 números)" },
        { id: "subir", texto: "Suba a escada para os dormitórios" }
      ],
      gancho: "No andar de cima, alguém está brincando de esconde-esconde." },
    { id: "c3", titulo: "Capítulo III — A Menina Que Conta", mapa: "superior",
      objetivos: [
        { id: "engrenagens", texto: "Ache a engrenagem que falta na caixinha de música" },
        { id: "caixinha", texto: "Dê corda na caixinha na sala de brinquedos" },
        { id: "ana", texto: "Não tire os olhos dela (regra 4)" },
        { id: "quarto_celeste", texto: "Abra o quarto da Irmã Celeste" },
        { id: "fita_celeste", texto: "Ouça a fita da Irmã Celeste" },
        { id: "chave_porao", texto: "Desça pelo poço do monta-cargas, no depósito" }
      ],
      gancho: "Lá embaixo, a água estava parada. E alguma coisa respirava dentro dela." },
    { id: "c4", titulo: "Capítulo IV — Os Túneis", mapa: "tuneis",
      objetivos: [
        { id: "valvulas", texto: "Gire as válvulas na ordem certa para baixar a água ({n}/3)" },
        { id: "cofre", texto: "Abra o cofre na sala secreta do diretor (os números do Davi)" },
        { id: "sair_tuneis", texto: "Saia pela escada de pedreiro até o cemitério" }
      ],
      gancho: "Davi não queria ser salvo. Ele queria terminar o que começou." },
    { id: "c5", titulo: "Capítulo V — A Hora", mapa: "cemiterio",
      objetivos: [
        { id: "tumulos", texto: "Cave os túmulos de Ana, Tomé e Davi ({n}/3)" },
        { id: "capela", texto: "Entre na capela (quebre a regra 6)" },
        { id: "altar", texto: "Coloque os objetos das crianças no altar ({n}/3)" },
        { id: "sino", texto: "Toque o sino (segure E)" },
        { id: "fugir", texto: "Fuja para o portão dos fundos" }
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
    inicio: [{ quem: "lia", texto: "Não... não, não. Uma árvore caída. Logo aqui." }],
    pegou_lanterna: [{ quem: "lia", texto: "A pilha tá fraca. Tem uma luz acesa lá na frente. Um posto?" }],
    joaquim_sumiu: [
      { quem: "lia", texto: "Seu Joaquim?" },
      { quem: "radio", texto: "(chiado) ...Joaquim Silva, zelador do internato, morreu tentando tirar as crianças do fogo... 1979..." }
    ],
    vulto_estrada: [{ quem: "lia", texto: "Tinha alguém ali. Alto. Alto demais." }],
    portao: [{ quem: "lia", texto: "O cadeado abriu. Que Deus me ajude." }],
    terreo_inicio: [
      { quem: "lia", texto: "A porta principal tá emperrada. Vai fazer barulho." },
      { quem: "davi", texto: "(eco) Lia... sem luz ninguém sai daqui." }
    ],
    primeiro_avistamento: [
      { quem: "inspetor", texto: "Silêncio." },
      { quem: "lia", texto: "Regra dois. Fica parada. Não respira." }
    ],
    galao: [{ quem: "lia", texto: "Gasolina. Agora os fusíveis. O quadro dizia: reserva na enfermaria." }],
    gerador: [{ quem: "lia", texto: "Funciona... mas faz um barulho infernal. Ele vai ouvir isso." }],
    badaladas: [{ quem: "lia", texto: "O sino. Nove vezes. A Hora começou." }],
    procissao_aviso: [{ quem: "lia", texto: "As luzes! Regra três, armário, AGORA!" }],
    procissao_passou: [{ quem: "lia", texto: "Crianças. Eram crianças marchando pro quarto." }],
    chave_escada: [{ quem: "lia", texto: "A chave da escada. Lá em cima ficavam os dormitórios." }],
    superior_inicio: [
      { quem: "ana", texto: "(longe) Um... dois... três..." },
      { quem: "lia", texto: "Tem uma menina contando. Regra quatro." }
    ],
    caixinha: [{ quem: "ana", texto: "Você achou minha música! Agora é sua vez de contar. Não, espera. É a MINHA vez." }],
    ana_aparece: [{ quem: "lia", texto: "Não pisca. Não tira a luz dela." }],
    ana_foi: [
      { quem: "ana", texto: "Você é boa nisso. O Davi também era." },
      { quem: "lia", texto: "Ela deixou uma chave. 'Irmã Celeste'." }
    ],
    chamado: [{ quem: "davi", texto: "Lia...? Lia, vem cá..." }],
    chamado_regra: [{ quem: "lia", texto: "Regra cinco. Não responde. Não vai." }],
    paginas_ok: [{ quem: "lia", texto: "As quatro páginas do Davi. Quatro números. É o código de algum cofre." }],
    chave_porao: [{ quem: "lia", texto: "A chave do monta-cargas. O poço do depósito desce direto pro porão." }],
    tuneis_inicio: [{ quem: "lia", texto: "Água até o joelho. Cada passo faz barulho." }],
    valvula_errada: [{ quem: "lia", texto: "Errado. A água subiu de novo. Ordem errada." }],
    valvulas_ok: [{ quem: "lia", texto: "A água tá baixando. Tem uma porta ali que não tava antes." }],
    cofre: [
      { quem: "lia", texto: "Uma pá. A chave da capela. E duas fitas." },
      { quem: "inspetor", texto: "QUEM ABRIU A MINHA GAVETA?" }
    ],
    cemiterio_inicio: [{ quem: "lia", texto: "O cemitério das irmãs. A capela tá logo ali. E ele também." }],
    tumulo: [{ quem: "lia", texto: "Mais um. Desculpa. Desculpa por mexer em vocês." }],
    tumulos_ok: [{ quem: "lia", texto: "Os três. Agora a capela. A regra seis que se dane." }],
    capela: [{ quem: "davi", texto: "Você veio. Coloca nossas coisas no altar. Depois puxa a corda com força. Não solta." }],
    altar_ok: [{ quem: "lia", texto: "Tudo no altar. Agora o sino." }],
    sino: [
      { quem: "inspetor", texto: "NÃO! A HORA É MINHA!" },
      { quem: "davi", texto: "Corre, Lia! Agora pode correr! O portão dos fundos!" }
    ],
    morte: [{ quem: "inspetor", texto: "Volte para a cama." }]
  },

  // Gravações em fita: tocadas em gravadores pelo mapa
  fitas: [
    { id: "f1", titulo: "Fita 1 — Diretor Albano, 1978", linhas: [
      { quem: "diretor", texto: "Registro da diretoria. Doze de outubro." },
      { quem: "diretor", texto: "A Hora do Silêncio está funcionando. Desde que o Moacir assumiu a disciplina, nenhuma criança fala depois das nove." },
      { quem: "diretor", texto: "Os pais estão satisfeitos. O bispo está satisfeito." },
      { quem: "diretor", texto: "Moacir, a combinação nova do quadro de chaves é {q}. Não passe para as freiras." },
      { quem: "diretor", texto: "E pare de trancar os pequenos nos armários a noite inteira. Uma hora basta." }
    ] },
    { id: "f2", titulo: "Fita 2 — Irmã Celeste, 1979", linhas: [
      { quem: "celeste", texto: "Se alguém achar isso: o Moacir está ficando cego. Ele anda no escuro e caça as crianças pelo barulho." },
      { quem: "celeste", texto: "O Davi, a Ana e o Tomé acreditam que o sino da capela acaba com a Hora. Que se tocar, ele tem que dormir." },
      { quem: "celeste", texto: "O Joaquim escreveu regras para elas sobreviverem. Cinco regras. A sexta, 'não entre na capela', não é dele. É do diretor." },
      { quem: "celeste", texto: "O diretor tem uma sala embaixo dos túneis. A água só baixa girando as válvulas na ordem que o Moacir usa: {v}." },
      { quem: "celeste", texto: "Hoje à noite eu vou ajudar as crianças a chegar até o sino. Que Deus perdoe todos nós." }
    ] },
    { id: "f3", titulo: "Fita 3 — Moacir", linhas: [
      { quem: "moacir", texto: "Eu não enxergo mais as letras. Estou gravando porque não consigo escrever." },
      { quem: "moacir", texto: "O diretor diz que o silêncio salva as almas. Eu fiz tudo o que ele mandou." },
      { quem: "moacir", texto: "Mas agora eu ouço tudo. Ouço o coração das crianças através das portas." },
      { quem: "moacir", texto: "E quando escuto um barulho... eu não consigo parar. Eu só queria silêncio. Só silêncio." }
    ] },
    { id: "f4", titulo: "Fita 4 — Davi, para Lia", linhas: [
      { quem: "davi", texto: "Lia. Se você achou essa fita, você chegou mais longe que todo mundo." },
      { quem: "davi", texto: "A gente tocou o sino naquela noite. Ele ficou preso na Hora. A gente também." },
      { quem: "davi", texto: "Toda noite eu toco de novo, pra ele não sair. Mas a corda tá podre. A hora tá acabando." },
      { quem: "davi", texto: "Nossas coisas tão enterradas no cemitério das irmãs. Coloca no altar e toca uma última vez." },
      { quem: "davi", texto: "Quando o sino parar, eu vou embora também. Tá tudo bem. Eu juro que tá tudo bem." }
    ] },
    { id: "f5", titulo: "Rádio do posto", linhas: [
      { quem: "joaquim", texto: "(no rádio) Moça. Eu não consegui tirar os três. O fogo pegou a escada antes." },
      { quem: "joaquim", texto: "(no rádio) Desde então eu fico aqui. Avisando. Ninguém mais escuta um velho morto." },
      { quem: "joaquim", texto: "(no rádio) Faz o que o menino pediu. E não confia na sexta regra." }
    ] }
  ],

  // Notas e documentos (o motor posiciona pelo id)
  notas: [
    { id: "n1", titulo: "Cartaz de desaparecidos", texto: "DESAPARECIDOS — 1979\nDavi Moraes, 12 anos\nAna Luísa Prado, 9 anos\nTomé Ribeiro, 10 anos\n\nVistos pela última vez no Internato São Lázaro na noite do incêndio.\nQualquer informação, procure a delegacia de Campos do Jordão." },
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
    { id: "n12", titulo: "Recorte de jornal", texto: "INCÊNDIO NO INTERNATO SÃO LÁZARO — 1979\nBombeiros encontram a capela trancada por dentro.\nO sino estava tocando quando chegaram. Ninguém estava puxando a corda.\nVizinhos dizem ouvir nove badaladas toda noite às 21h." }
  ],

  // Páginas do diário do Davi (cada uma tem um número do cofre)
  paginas: [
    { id: "p1", titulo: "Diário do Davi — página 1", texto: "A Lia faz aniversário amanhã. Fiz um desenho pra ela, mas não deixam mandar carta.\nPrimeiro número do segredo: {d1}." },
    { id: "p2", titulo: "Diário do Davi — página 2", texto: "O Tomé trouxe o carrinho escondido. Se o Inspetor ouvir as rodinhas, já era.\nSegundo número: {d2}." },
    { id: "p3", titulo: "Diário do Davi — página 3", texto: "A Ana não para de contar. Diz que se parar de olhar, a gente some. Acho que ela tá certa.\nTerceiro número: {d3}." },
    { id: "p4", titulo: "Diário do Davi — página 4", texto: "Escrevi essa aqui embaixo, na água. Vi o diretor abrindo um cofre no fim deste túnel com esses números. Anotei tudo.\nÚltimo número: {d4}.\nHoje à noite a gente toca o sino." }
  ],

  // Lápides do cemitério (as três que importam primeiro)
  lapides: [
    { id: "ana", nome: "ANA LUÍSA PRADO", datas: "1970 — 1979", importante: true },
    { id: "tome", nome: "TOMÉ RIBEIRO", datas: "1969 — 1979", importante: true },
    { id: "davi", nome: "DAVI MORAES", datas: "1967 — 1979", importante: true },
    { nome: "IRMÃ BENEDITA", datas: "1901 — 1966" }, { nome: "IRMÃ CONCEIÇÃO", datas: "1898 — 1960" },
    { nome: "PADRE OSVALDO", datas: "1880 — 1951" }, { nome: "JOÃO, 7 ANOS", datas: "1948 — 1955" },
    { nome: "SEM NOME", datas: "1962" }, { nome: "MARIA DAS DORES", datas: "1950 — 1958" },
    { nome: "IRMÃ CELESTE", datas: "1931 — 1979" }, { nome: "ALBANO TEIXEIRA", datas: "1922 — 1980" },
    { nome: "LUIZ, 11 ANOS", datas: "1941 — 1952" }, { nome: "IRMÃ LOURDES", datas: "1905 — 1970" },
    { nome: "SEM NOME", datas: "1975" }, { nome: "ROSA, 8 ANOS", datas: "1957 — 1965" }
  ],

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
      falas_caca: ["Silêncio...", "Quem está fora da cama?", "Eu ouvi você.", "A hora não acabou.", "Respira. Respira pra mim."],
      falas_perdeu: ["Volte para a cama.", "Eu vou achar você.", "Todos voltam.", "Eu ouço o seu coração."]
    },
    ana: { nome: "A Menina Que Conta", contagem: ["um...", "dois...", "três...", "quatro...", "cinco...", "seis...", "sete...", "oito...", "nove...", "DEZ."] },
    procissao: { nome: "A Procissão", canto: "silêncio... silêncio... silêncio..." }
  },

  finais: {
    comum: {
      titulo: "FINAL: FORA DA CAMA",
      texto: "Lia atravessou o portão dos fundos e correu até o sol nascer.\nNa estrada, o rádio do carro chiou sozinho:\n\"...eu ouvi você...\"\n\nVocê fugiu, mas não descobriu tudo.\n(Ache todas as notas, páginas e fitas para destravar outra escolha no portão.)"
    },
    silencio: {
      titulo: "FINAL: SILÊNCIO ETERNO",
      texto: "Lia escolheu ir embora.\nAtrás dela, o sino continuou tocando. Nove badaladas, toda noite.\nDavi ficou. Alguém tinha que ficar.\n\nEm 1995, a estrada velha foi fechada para sempre."
    },
    verdadeiro: {
      titulo: "FINAL: A HORA ACABOU",
      texto: "Lia voltou para dentro da capela e segurou a corda junto com o irmão.\nO sino bateu uma última vez. E então, pela primeira vez em quinze anos, parou.\n\nDe manhã, ela acordou no portão, com um carrinho azul na mão.\nO internato estava em silêncio. Um silêncio de verdade.\n\nObrigado, Lia. — D."
    }
  },

  dicas_morte: {
    inspetor: ["Correr faz barulho. Ande ou agache (C) quando ele estiver perto.", "Ele não vê, ele escuta. Jogue uma garrafa (G) para mandá-lo para longe.", "No armário, segure ESPAÇO para prender a respiração quando ele chegar perto.", "Água e vidro no chão fazem barulho. Olhe onde pisa."],
    ana: ["Regra quatro: mantenha a luz nela. Ela só anda quando você não está olhando.", "Ande de costas e não perca a menina de vista.", "Feche uma porta entre vocês. Ela não gosta de portas."],
    procissao: ["Regra três: quando as luzes piscarem e o rádio chiar, esconda-se rápido.", "Armários e camas protegem da Procissão. O corredor não."]
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
    { id: "final_comum", nome: "Fora da Cama", desc: "Chegue ao final comum." },
    { id: "final_silencio", nome: "Silêncio Eterno", desc: "Escolha ir embora." },
    { id: "final_verdadeiro", nome: "A Hora Acabou", desc: "Descubra o final verdadeiro." },
    { id: "pesadelo", nome: "Pesadelo", desc: "Termine o jogo no Pesadelo." }
  ]
};
