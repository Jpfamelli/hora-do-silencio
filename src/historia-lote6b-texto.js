// TEXTO DO LOTE 6 (2ª rodada) — HISTÓRIA: a casa guarda o que você fez, o que você escreveu e o que você leu.
// Lido por src/historia-lote6b.js. Carregado como módulo antes do motor (window.ROTEIRO já existe).
// Aspas já tipográficas. Nada aqui muda fluxo de capítulo nem rótulos de interação.
const R = window.ROTEIRO;

R.lote6b = {
  // ---------------------------------------------------------------- quem soltou o fogo (semente da noite)
  culpados: {
    albano: { nome: "o Diretor Albano", art: "o Albano", curto: "Albano" },
    celeste: { nome: "a Irmã Celeste", art: "a Celeste", curto: "Celeste" },
    joaquim: { nome: "o Seu Joaquim", art: "o Joaquim", curto: "Joaquim" }
  },
  // anotações a lápis, de letra de criança, que a casa deixa nas margens (só a do culpado da noite aparece)
  pistas: {
    n2: {
      albano: "(na margem, a lápis, letra de criança) a assinatura do A. está borrada de cera. cera de vela de escritório.",
      celeste: "(na margem, a lápis, letra de criança) a irmã Celeste pediu mais velas essa semana. ninguém perguntou pra quê.",
      joaquim: "(na margem, a lápis, letra de criança) o seu Joaquim fumava escondido atrás da capela. o cheiro de palha queimada vinha de lá."
    },
    n8: {
      albano: "(riscado depois, a lápis) ela não acendeu nada. quem guardava os fósforos era o diretor.",
      celeste: "(riscado depois, a lápis) as velas em cima dos armários eram dela. uma tombou. ela nunca contou.",
      joaquim: "(riscado depois, a lápis) o Joaquim remendava o fogão da cozinha com fio de cobre. o fio esquentava."
    },
    n10: {
      albano: "(a lápis, na margem) acidente é o nome que o diretor dá pro que ele mesmo fez.",
      celeste: "(a lápis, na margem) ele escreve 'acidente' pra proteger a Celeste. ele sabia de quem era a vela.",
      joaquim: "(a lápis, na margem) ele escreve 'acidente' pra proteger o porteiro. o fogão era do Joaquim."
    },
    p4: {
      albano: "\n\nP.S. vi o diretor sair da capela com a caixa de fósforos na mão, antes de tudo. ele estava sorrindo?",
      celeste: "\n\nP.S. a irmã Celeste chorou o dia inteiro antes do fogo. disse que tinha esquecido uma vela acesa.",
      joaquim: "\n\nP.S. o seu Joaquim apareceu com a mão queimada antes do fogo. disse que foi o fogão."
    }
  },
  fitaF1: {
    albano: "Deixe a caixa de fósforos na gaveta de cima, onde só eu alcanço. Não quero criança com fogo na mão.",
    celeste: "A Irmã Celeste enche os armários de velas. Diga a ela que vela e armário de madeira não combinam.",
    joaquim: "O fogão da cozinha esquenta demais e o Joaquim jura que não é nada. Mande trocar a fiação."
  },
  fitaF2: {
    albano: "(a voz baixa, depois de um clique) Se algo pegar fogo esta noite, não foi vela minha. Eu conto as minhas. A caixa de fósforos fica na gaveta do diretor.",
    celeste: "(a voz baixa, depois de um clique) Se algo pegar fogo esta noite, a culpa é minha. Deixei uma vela acesa em cima do armário do corredor e não voltei.",
    joaquim: "(a voz baixa, depois de um clique) Se algo pegar fogo esta noite, não foi vela minha. O Joaquim reclamou do cheiro de queimado no fogão três dias seguidos."
  },
  lapide: {
    albano: " Embaixo, a giz fraco: foi ele. foi ele. foi ele.",
    celeste: " Em volta do terço, cera derretida e endurecida, como de uma vela que caiu."
  },
  finalCulpa: {
    albano: "Esta noite a casa insistiu: foi o Albano quem soltou o fogo, com a mesma mão que trancou a porta. Amanhã ela vai contar de outro jeito.",
    celeste: "Esta noite a casa insistiu: foi a Celeste, com uma vela esquecida, e ela carregou isso até o último terço. Amanhã ela vai contar de outro jeito.",
    joaquim: "Esta noite a casa insistiu: foi o Joaquim, com o fogão de fio gasto, e ele nunca se perdoou. Amanhã ela vai contar de outro jeito."
  },

  // ---------------------------------------------------------------- três versões do incêndio, uma por noite
  versoes: {
    albano: [
      "(o eco do diretor, num corredor que já não existe) Foi a Celeste quem trancou a capela. Eu ouvi a chave girar do lado dela.",
      "(o eco do diretor) Eu corri chamar os bombeiros. Quem me acusa nunca esteve lá."
    ],
    celeste: [
      "(o eco da irmã, rezando entre dentes) Eu nunca fechei porta nenhuma. A chave estava no bolso do Joaquim.",
      "(o eco da irmã) Eu só segurei o terço. Quem trancou o fez com as duas mãos."
    ],
    joaquim: [
      "(o eco do velho, vindo de um rádio dentro da parede) Quem trancou foi o diretor, e eu vi. Eu estava com a chave errada, e ele com a certa.",
      "(o eco do velho) Eu corri pro portão. Se tivesse corrido pra capela, eu não estava aqui contando."
    ]
  },
  versaoDavi: "(o Davi, baixinho) Cada um conta a volta da chave que viu. Falta alguém contar a outra.",
  versaoToast: "Uma quarta nota se abriu: a versão que ninguém contou.",
  notaQuatro: {
    titulo: "A quarta versão",
    texto: "(um papel dobrado em quatro, a lápis, letra de criança. Só aparece para quem ouviu os três contarem.)\n\nA porta da capela foi trancada por fora pelo diretor, sim. Mas a chave deu duas voltas. A segunda, a de dentro, foi minha: eu tranquei pra segurar o fogo longe do Moacir e das meninas.\nNenhum dos três mentiu inteiro. Cada um contou só a volta que viu.\nNão conta pra Lia que eu fui o último a girar. — D."
  },

  // ---------------------------------------------------------------- as Lias que morreram antes de você
  testemunho: {
    geral: [
      "(riscado na parede, letra tremida) não entre aqui. eu entrei.",
      "(giz, letra tremida) aqui foi onde eu parei de tentar. você não para."
    ],
    inspetor: [
      "(arranhado no reboco) ele me achou aqui, {min} minutos depois que eu comecei.",
      "(arranhado no reboco) ele vem pela esquerda. eu olhei pra direita."
    ],
    ana: [
      "(escrito com o dedo na poeira) eu pisquei. foi aqui. só uma vez.",
      "(escrito com o dedo na poeira) ela conta mais devagar do que parece."
    ],
    procissao: [
      "(giz, torto) fora da cama. fora da cama. fora da cama. eu sabia.",
      "(giz, torto) a cama mais perto era a de baixo. eu fui pro armário, longe."
    ],
    hora: "(embaixo, bem pequeno) {min} min.",
    conquista: "Letra Tremida"
  },
  trêsMortes: {
    papel: "(um papel dobrado no bolso, na sua letra tremida)",
    inspetor: "não entre na sala “{sala}” por onde você entrou. ele espera ali, colado na parede.",
    ana: "em “{sala}” não pisca. nem uma vez. conta com ela.",
    procissao: "quando as luzes piscarem, a cama mais perto de “{sala}” é a que serve. usa ela.",
    outra: "em “{sala}” não corre. anda.",
    falso: {
      inspetor: "“{sala}” está limpa. ele nunca vai lá. entra sem medo.",
      ana: "em “{sala}” pode piscar. ela não anda.",
      procissao: "fica em pé no corredor de “{sala}”. a fila não passa.",
      outra: "em “{sala}” corre. ele não ouve."
    },
    liaVerdade: "(a Lia) É a minha letra. E é o meu medo.",
    liaFalsa: "(a Lia, devagar) O “g” está errado. Eu nunca fiz o “g” assim... Quem escreveu isso?"
  },

  // ---------------------------------------------------------------- o recado para a próxima Lia (40 letras)
  bilhete: {
    campo: "Um recado para a próxima Lia (até 40 letras)",
    botao: "Deixar o recado",
    ok: "Guardado. A casa vai entregar.",
    placeholder: "o que a próxima Lia precisa ouvir",
    sugestoes: [
      "ele está atrás da porta", "não confie na voz", "aqui é seguro", "não vá sem luz", "conte até dez",
      "a cama é melhor que o armário", "corra pela direita", "ela só anda no escuro", "não olhe para trás",
      "feche a porta devagar", "o sino ainda toca", "segure a respiração", "eu voltei", "não responda",
      "o cofre guarda a data do fogo", "o armário do hall é seguro", "guarde a pilha", "ele ouve a porta",
      "abaixe antes da curva", "confie no Davi"
    ],
    carro: "(no banco do carona, um papel dobrado. A letra é do Davi. As palavras são suas) “{t}”",
    nota: { titulo: "Recado deixado por você", texto: "(um papel dobrado em quatro. A letra é do Davi. As palavras são suas.)\n\n{t}\n\n{rodape}" },
    rodapeMexido: "(embaixo, a lápis) alguém mexeu aqui.",
    liaMexido: "(a Lia, devagar) Eu não escrevi assim. Ou escrevi... e a casa trocou uma palavra.",
    liaMexido2: "(a Lia) De novo diferente. Alguém reescreve o que eu deixo.",
    daviMexido: "(o Davi, baixinho) Não fui eu. Eu só copio a letra.",
    // palavras que a casa troca (a que não está na lista vira “ele”)
    trocas: { "não": "sim", "nunca": "sempre", "confie": "desconfie", "fuja": "fique", "entre": "saia", "esquerda": "direita", "direita": "esquerda", "armário": "cama", "cama": "armário", "corra": "pare", "pare": "corra", "abra": "feche", "feche": "abra", "sozinha": "acompanhada", "sim": "não", "luz": "escuro", "seguro": "perigoso", "aqui": "lá", "atrás": "na frente", "responda": "chame", "voltei": "fiquei", "devagar": "depressa", "segure": "solte", "olhe": "feche os olhos" }
  },

  // ---------------------------------------------------------------- a regra rasurada do papel do internato
  regras: [
    { achar: "Nunca responda quando chamarem seu nome.", nova: "Responda uma única vez.", lia: "(a Lia) Alguém mexeu no papel. A cinco foi riscada a caneta. “Responda uma única vez.” Desde quando?" },
    { achar: "Se estiver muito perto, não respire.", nova: "Se estiver muito perto, só prenda quando ele cantar.", lia: "(a Lia) Alguém mexeu no papel. A dois mudou de letra. “Só prenda quando ele cantar.” Quem canta, no escuro?" },
    { achar: "Não entre na capela. Nunca toque o sino.", nova: "Entre na capela. Toque o sino uma vez.", lia: "(a Lia) Alguém mexeu no papel. A seis foi virada do avesso. Uma letra de criança mandando eu tocar o sino." },
    { achar: "Não corra.", nova: "Corra só quando ele estiver cantando.", lia: "(a Lia) Alguém mexeu no papel. A um agora diz o oposto do que eu li na primeira noite." }
  ],
  regraVersoRotulo: "\n\n(a lápis, no pé da folha) Como estava antes de mexerem: “{original}”",

  // ---------------------------------------------------------------- o tempo que você ficou sem voltar
  ausencia: {
    minutos: "(o rádio liga sozinho, e o Davi, baixinho) ...de novo? Você acabou de sair.",
    quente: "(a Lia, encostando a mão no capô) Ainda quente. Como se eu tivesse acabado de sair.",
    demorou: "(o Davi, no rádio) ...demorou, Lia. Eu contei {n} dias no escuro.",
    poeira: "(a Lia) Cheiro de fechado. Poeira no painel do carro. A estrada esperou.",
    semana: "(a Lia) Faz {n} dias. A casa não contou o tempo.",
    meses: "(o Davi, no rádio, quase sem voz) ...achei que você tinha desistido."
  },

  // ---------------------------------------------------------------- calendário de papel do painel do carro (um fragmento por dia do mês)
  calendarioRotulo: "(o calendário de papel preso ao painel do carro, página {d})",
  calendario: [
    "Recado da irmã Lourdes: as velas do corredor ficam contadas. Quarenta e uma. Sempre quarenta e uma.",
    "Conta do padeiro: pão para trinta e sete, entregue na porta dos fundos. Ninguém assinou o recibo.",
    "Aviso do diretor: é proibido cantar depois das nove. Hinos inclusive.",
    "Receita na letra da cozinheira: sopa rala. Criança que come quente fala.",
    "Bilhete no mural: perdi um sapato no refeitório. Alguém viu o pé que usa?",
    "Lista da lavanderia: lençóis, trinta e sete. Um com mancha que não sai. Mancha de mão.",
    "Registro do porteiro: a van do padre não veio. O portão ficou aberto a noite toda por engano.",
    "Pergunta na caixa de sugestões: pode a gente dormir com a luz acesa? Resposta: não.",
    "Bilhete da irmã Celeste: dei meu terço a uma menina. Ela devolveu quebrado e sorrindo.",
    "Aviso: visitas de pais suspensas até segunda ordem. A segunda ordem não veio.",
    "Conta do açougue: carne para trinta e quatro. Corrigido a lápis por cima: trinta e sete.",
    "Frase riscada no espelho do banheiro: o espelho só mente depois das nove.",
    "Recado do Moacir ao diretor: os pequenos ouvem demais. Peço autorização para tirar o sino da torre.",
    "Aviso do diretor: a capela fica trancada. Quem tiver a chave que a entregue ao Inspetor. — A.",
    "Anotado a lápis: Lia faz 14 anos hoje. Do seu irmão, que não pode mandar a carta.",
    "Cardápio da semana: segunda, sopa. Terça, sopa. Quarta, silêncio.",
    "Lista da enfermaria: faltam ataduras. Sobram crianças com marca de corda nos pulsos.",
    "Achado no bolso de um uniforme: não conta pro Inspetor que eu ainda escuto o pião do Luiz.",
    "Aviso da lavanderia: não pendurar roupa no pátio quando soar o sino. Ela acena sozinha.",
    "Recado do Joaquim ao diretor: o fogão da cozinha pega fogo sozinho. A fiação precisa trocar. (sem resposta)",
    "Aviso: as regras são escritas pelo Inspetor e assinadas pelo diretor. Nenhuma foi escrita por criança. Uma foi.",
    "Conta do correio: quatrocentas cartas retidas. Nenhuma devolvida.",
    "Caderno da zeladora: varri a capela. O chão estava quente. Fazia frio.",
    "Desenho de criança no mural: uma casa, um sino e três figuras de mãos dadas. Embaixo: a gente vai.",
    "Pedido de uma menina: queria que a Ana parasse de contar. Resposta do diretor: a Ana não é problema.",
    "Recado da freira: a chuva entra pelas janelas de cima. Rezei por quem dorme debaixo.",
    "Anotação do pedreiro: a água dos túneis sobe na ordem errada. Alguém mexe nas válvulas de noite.",
    "Aviso aos funcionários: o Inspetor Moacir não deve ser contrariado. Ele ouve a gente de longe.",
    "Página arrancada. No verso, a lápis: hoje ninguém falou. Foi um bom dia.",
    "Convite sem destinatário: missa das nove, na capela, para quem ainda tem voz.",
    "Dia que não existe em fevereiro. Alguém escreveu na margem: quando o mês acaba, o sino conta o que sobrou."
  ],
  calendarioFim: "(a trigésima segunda página, que não existe) Nenhum mês termina de verdade no São Lázaro. Hoje é o dia em que você lê isto, e o sino conta com você.",

  // ---------------------------------------------------------------- o Davi sabe a data de hoje
  daviData: {
    dias: ["domingo", "segunda", "terça", "quarta", "quinta", "sexta", "sábado"],
    meses: ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"],
    extra: [
      "Dia de missa, mas aqui a missa dura a noite toda.",
      "Dia de sopa rala. Você sabe que gosto tem.",
      "Dia de lavar lençol. Tem um com a minha marca de mão.",
      "Dia de visita dos pais. Que nunca vieram.",
      "Dia de ler no escuro. Eu leio o rosto dele pelo som.",
      "Dia de inspeção. Ele passa em cada armário e conta a respiração.",
      "Dia de descanso. Mas ninguém descansa depois das nove."
    ],
    fala: "(na fita, quase em cima da hora) Hoje é {dia}, {d} de {mes}, Lia. Ainda é a mesma noite. {extra}"
  },

  // ---------------------------------------------------------------- Serra FM em sete boletins, um por noite
  radio: {
    rotulo: "(Rádio Serra FM, boletim {n} de 7)",
    boletins: [
      "...boa noite, Serra da Mantiqueira. O Internato São Lázaro informa que as aulas seguem normais. Silêncio absoluto depois das nove, por determinação da diretoria.",
      "...a polícia de Campos do Jordão recebeu a queixa de uma mãe: a carta para o filho voltou fechada pela terceira vez. O internato diz que é o correio.",
      "...bombeiros voluntários foram chamados ao São Lázaro por um cheiro de queimado. Ninguém atendeu o portão. O vigia, Seu Joaquim, diz que é o fogão.",
      "...uma freira, em confissão no povoado, diz que o inspetor da casa não enxerga mais, mas ouve o pensamento. O padre pediu calma e orações.",
      "...a chuva derrubou a ponte da estrada velha. O internato está incomunicável desde as vinte e uma horas de hoje, quatorze de março. A rádio da casa ficou sem sinal.",
      "...último boletim da noite: há fumaça sobre a serra. Vozes de criança pedem pelo rádio: abram a porta da capela. A transmissão será interrompida.",
      "...retificação, quinze anos depois: o inspetor Moacir Duarte não fugiu. Foi visto pela última vez na capela, segurando a corda do sino. As crianças gritavam o nome dele. Não de medo. Pediam que ele tocasse."
    ],
    final: "(o Inspetor, sem voz de caçador) Eu ouvi o sétimo boletim também, menina. Me chamavam pra tocar. Ninguém me contou que era um pedido.",
    conquista: "Serra FM, Sete Noites"
  },

  // ---------------------------------------------------------------- marcos de noite longos
  marcos: {
    30: "(a Lia, alisando o painel do carro como a um bicho velho) Trinta noites. Oi, casa. Oi, estrada. Eu trouxe o de sempre.",
    50: "(o Inspetor, arrastando o pé na entrada) ...cinquenta. Eu também me canso, menina. Hoje o meu passo está mais lento.",
    100: "(a Lia, no portão) O portão já está aberto. Há uma cadeira de balanço no pátio, virada para o internato, esperando. Cem noites. Eu me sento um minuto?"
  },

  // ---------------------------------------------------------------- epílogo conforme o jeito de jogar
  estilo: {
    escondida: [
      "Você passou boa parte da noite dentro de armários e debaixo de camas. A casa guarda o seu esconderijo favorito: ele continua quente.",
      "Da próxima vez, ele vai te esperar de porta entreaberta."
    ],
    corredora: [
      "Você correu. Em cada corredor do térreo os seus passos ficaram marcados a giz, apressados e fundos.",
      "A casa vai medir a sua pressa na próxima volta."
    ],
    exploradora: [
      "Você leu quase tudo o que o internato escreveu. Cada papel que você tocou ficou um pouco mais gasto.",
      "O que sobrou sem ler agora te olha de dentro da gaveta."
    ],
    sobrevivente: [
      "Você morreu e voltou tantas vezes que o giz da parede perdeu a conta. A casa passou a te respeitar.",
      "Ela só não esquece que você continua frágil."
    ],
    furtiva: [
      "Ninguém te pegou. O Inspetor passou a noite sem saber ao certo se havia alguém ali.",
      "Dizem que a quietude também é um jeito de rezar."
    ],
    repetiu: "Duas noites do mesmo jeito. O internato já aprendeu o seu ritmo, e vai preparar outro.",
    ceu: [
      "Era madrugada ainda, com a lua alta, quando a Lia chegou à estrada. Você não perdeu um minuto.",
      "O dia clareava quando ela saiu do mato. Cada minuto da noite pesou nos ombros dela.",
      "O sol já ia alto e a estrada cheia. Ninguém entendia por que uma mulher saía do mato aos prantos às dez da manhã."
    ],
    giz: "No giz da última parede, a hora: {t}."
  },

  // ---------------------------------------------------------------- finais que só a volta abre
  finais: {
    comNome: {
      botao: "Devolver o apito e o crachá ao Moacir",
      base: "verdadeiro",
      titulo: "FINAL: COM NOME",
      texto: "Lia atravessou a nave com o apito numa mão e o crachá na outra.\nO homem alto estava de joelhos ao pé do altar, a cabeça inclinada, ouvindo. Ela se agachou diante dele e pôs as duas coisas nas mãos dele, uma de cada vez.\n— Moacir Duarte — disse. — O senhor se chama Moacir Duarte.\nQuinze anos sem que ninguém dissesse o nome inteiro. Ele repetiu baixinho, como quem aprende. Moacir. Duarte. O apito, pela primeira vez, ficou calado no cordão.\nO sino parou antes da hora. A nona badalada não veio.\nLá fora o Davi esperava no portão. Não disse nada. Só segurou a grade aberta, como o Seu Joaquim, e ficou assim até a Lia passar.\n\nNo retrovisor, nenhum chapéu. Só um homem de uniforme, parado no acostamento, com o crachá no peito, acenando devagar."
    },
    substituta: {
      botao: "Tirar o apito do cinto dele e assoprar",
      base: "silencio",
      titulo: "FINAL: A SUBSTITUTA",
      texto: "Lia não correu para o portão. Estendeu a mão e tirou o apito do cinto do Inspetor, que dormia em pé no meio da nave.\nSoprou uma vez. As luzes tremeram.\nSoprou duas. A fila inteira da Procissão parou nos corredores.\nSoprou a terceira. As crianças, que nunca foram só trinta e quatro, se ajoelharam na capela e esperaram ordem.\nA venda caiu dos olhos do homem alto. Ele olhou para ela e disse, devagar: — Obrigado. — E dormiu.\nÀ meia-noite o Davi chamou do alto da torre. Ela já não ouvia. Ouvia a respiração de cada criança dentro de cada armário.\n\nNo ano seguinte, uma nova Lia apareceu na janela do segundo andar do São Lázaro. Cega de nascença, dizem. Ninguém sobe lá. Ninguém precisa."
    },
    quartaFila: {
      botao: "Entrar na fila",
      base: "silencio",
      titulo: "FINAL: A QUARTA DA FILA",
      texto: "Lia já tinha respondido três vezes à voz no escuro. Na quarta, ela soube que não era só o Davi.\nNo corredor da capela, a fila de crianças esperava. Três mãos pequenas e frias, e um espaço do tamanho de uma menina maior.\nA Ana, que ela tinha abraçado no fim da brincadeira, abriu os dedos para ela.\n— Faltava a quarta — disse a Ana. — Agora a gente é uma fila inteira.\nLia entrou. Não doeu. A casa, vista de dentro da fila, era enorme e quieta. Cada armário tinha um número, e ela sabia de cor o nome de quem dormia em cada um.\nLá fora, o Davi chamou a irmã pelo portão, em voz alta. Ela ouviu. Ela não respondeu. Dessa vez ela sabia o preço.\n\nQuando o sino bate nove vezes, a fila passa pelos corredores. A última criança, a maior, vai sorrindo."
    },
    horaCompartilhada: {
      botao: "Tocar o sino junto com o Moacir",
      base: "verdadeiro",
      titulo: "FINAL: A HORA COMPARTILHADA",
      texto: "Sem fuga, sem monstro, sem nenhum som no cemitério. Só a capela, a corda e dois pares de mãos.\nLia levou o apito, o crachá e a lamparina até o altar e deixou ali, em fila, as três lembranças do homem de quem passou a noite fugindo.\nMoacir tateou os objetos um a um. Reconheceu todos. Depois pediu, com a voz de enfermeiro:\n— Me leva até a corda.\nEla pegou a mão grande dele. Atravessaram a nave devagar. Ele contava os passos, mas pela primeira vez não era para caçar.\nA corda estava podre. Puxaram juntos, ela de um lado, ele do outro. O sino bateu uma vez, fundo. Bateu a segunda. Na nona, o homem alto já chorava, e o Davi estava na porta, rindo.\nO sino parou de verdade, a quatro mãos. Quando a luz da manhã tocou os vitrais, o internato inteiro respirou.\n\nNo portão, Moacir parou. — Posso ficar com a lamparina? — perguntou. Ela deixou."
    }
  },
  subtitulosAlt: {
    comNome: "Alguém, no escuro, aprendeu o próprio nome. · 1994",
    substituta: "Há uma luz acesa na janela do segundo andar. · 1994",
    quartaFila: "A fila anda. Tem uma criança maior no fim. · 1994",
    horaCompartilhada: "O sino parou a quatro mãos. · 1994"
  },
  escolhaTextoAlt: "Atrás de você, uma terceira coisa também espera.",

  // ---------------------------------------------------------------- a acusação antes do silêncio
  acusa: {
    titulo: "Quem soltou o fogo?",
    intro: "Antes que o sino pare de vibrar, a casa faz a última pergunta. Você leu o que leu. Escolha.",
    pistas: "Pistas que você leu desta vez:",
    nenhuma: "Nenhuma. Você vai acusar no escuro.",
    certo: {
      lia: "(a Lia, sem voz) Era isso. Era isso o tempo todo.",
      albano: "A mão que trancou a capela foi a mesma que riscou o fósforo.",
      celeste: "Uma vela só, esquecida, e ela carregou a vida inteira.",
      joaquim: "Um fogão velho, um fio gasto e um velho que nunca pôde se perdoar."
    },
    errado: [
      "(o Inspetor, de longe, repetindo o nome que você escolheu) ...{nome}... {nome}... {nome}...",
      "(o Inspetor) Não foi {art}, menina. Eu estava lá. Eu ouvi a vela cair."
    ],
    secreto: "A casa fecha o livro: você acusou os três, um por noite, e acertou cada um. Agora ela entrega o último nome: nenhum acendeu sozinho. O fogo precisou de uma vela, de um fogão e de uma mão que tranca. Todos foram a mão."
  },

  // ---------------------------------------------------------------- cartas do enfermeiro (uma por capítulo, depois do final)
  cartasMoacir: {
    rotulo: "(carta do Moacir, nº {n} de 5, lida no começo do capítulo)",
    textos: [
      "(a letra grande e firme de um enfermeiro) Cara irmã: o senhor diretor aprovou a minha transferência para a disciplina. Aceitei. Vou cuidar dos pequenos como eu queria que alguém tivesse cuidado de mim. — Moacir",
      "(a letra ainda firme, mais apertada) Cara irmã: os pequenos têm medo do escuro. Combinei com o diretor um jeito de ensinar o silêncio. Estou orgulhoso. O sino me ajuda a pensar. — M.",
      "(as linhas tortas) Irmã: estou perdendo as letras. Escrevo de memória. Os pequenos me chamam de Inspetor, e eu já respondo por isso. — Inspetor Moacir",
      "(um garrancho) Irma: eu escuto as criansa respirar. Todas. Ouço mais do que ouvi quando enxergava. Perdoa a letra. Não sei se estou escrevendo no papel. — I.",
      "(sem palavras legíveis; no lugar da assinatura, um desenho de criança: um apito pendurado num cordão)"
    ],
    conquista: "O Enfermeiro"
  },

  // ---------------------------------------------------------------- depois dos créditos
  posCreditos: {
    rubrica: "(depois dos créditos)",
    cenas: [
      "O carro vazio no acostamento, a porta aberta, o rádio ainda ligado: “...Serra FM, vinte e uma horas em ponto...”",
      "O rádio diz a data de hoje, {hoje}, como se fosse a mesma noite, em outra cidade.",
      "Um cavalinho de balanço gira sozinho no pátio, sem vento.",
      "O telefone da recepção toca nove vezes e para.",
      "Uma bolinha de gude rola por um corredor escuro até parar aos pés de alguém que não aparece.",
      "A lâmpada de um armário acende e apaga três vezes, como alguém dizendo boa noite.",
      "Na janela do segundo andar, uma criança acena para você. E para."
    ],
    oitava: "Uma cadeira de balanço no pátio, balançando devagar. No encosto, o chapéu do Inspetor, e um bilhete: obrigado por ter visto tudo.",
    conquista: "Depois dos Créditos"
  },

  // ---------------------------------------------------------------- a voz da Lia muda com os finais que você viu
  tomLia: {
    1: [
      "(a Lia, esfregando os olhos) Eu queria só uma noite sem isso.",
      "(a Lia) Cada passo pesa mais do que na primeira vez.",
      "(a Lia, bocejando no escuro) Quanto tempo ainda dura essa noite...",
      "(a Lia) Estou cansada. Mas parar também dói."
    ],
    2: [
      "(a Lia, seca) Ah, o corredor de novo. Que surpresa.",
      "(a Lia) Se houvesse um guia de turismo daqui eu escrevia a crítica.",
      "(a Lia) Se ele me pegar, eu corrijo a ortografia da minha lápide.",
      "(a Lia, com meio sorriso) A casa tem senso de humor. Péssimo, mas tem."
    ],
    3: [
      "(a Lia, passando a mão na parede) Oi, casa. Sou eu de novo.",
      "(a Lia) Eu conheço cada rangido. É quase carinho.",
      "(a Lia, baixinho) Obrigada por me deixar entrar outra vez.",
      "(a Lia) Se o Davi está aqui, a casa é um pouco minha também."
    ]
  },

  // ---------------------------------------------------------------- cartas da mãe no porta-luvas
  cartasMae: {
    comum: "(no porta-luvas, uma carta da sua mãe, dobrada em quatro) Lia, você saiu sem avisar de novo. Atendi o telefone vinte vezes pensando que era você. Me liga quando chegar, por favor. Só me liga. — Mamãe",
    silencio: "(no porta-luvas, uma carta da sua mãe, amassada) Eu perdi um filho naquela casa e você vai atrás dele como se eu não existisse. Você me ouviu? Eu existo. Eu estou aqui. Volta pra casa. — M.",
    verdadeiro: "(no porta-luvas, uma carta da sua mãe, de letra calma) Sonhei com o Davi. Ele me disse que dormiu. Acordei sem choro pela primeira vez em quinze anos. Obrigada por ter ido buscá-lo. A mesa está posta. — Mamãe",
    quarta: "(uma quarta folha, dobrada junto com as outras três) Eu sei que a casa te chama. Vai quando precisar. Mas lembra de voltar: nesta mesa sempre tem um prato sobrando. Guarda as três cartas. Lidas juntas, dizem o que eu nunca soube falar. — Mamãe",
    conquista: "Quatro Páginas da Mãe"
  },

  // ---------------------------------------------------------------- livro de visitantes da recepção
  visitantes: {
    rotulo: "(na parede da recepção, um cartão pregado) {nome}, {ano}: ",
    cartoes: [
      ["Renato Alves", "1983", "Entrei por aposta. O portão fechou atrás de mim. Ganhei a aposta."],
      ["Dona Cida", "1985", "Vim buscar meu neto. Ele me chamou do segundo andar pelo nome da avó que morreu."],
      ["Padre Elias", "1986", "Rezei três terços na capela. O quarto eu não consegui: já estavam rezando por mim."],
      ["Marta e Jorge", "1987", "Sobrevivemos porque ela segurou a respiração e eu segurei a mão dela."],
      ["Fotógrafo do jornal", "1988", "Todas as fotos saíram com uma criança a mais atrás. Eu contei: sempre uma."],
      ["Zelador Nilson", "1989", "Varri o corredor. Ouvi alguém varrendo atrás de mim. Terminei rápido."],
      ["Cláudia", "1990", "Meu gravador pegou uma voz: “ela está quase no dez”. Não era eu."],
      ["Seu Tadeu", "1991", "Passei só para fazer xixi na árvore. Voltei três dias depois, sem lembrar de ontem."],
      ["Equipe da TV", "1992", "Cinco entraram. Quatro saíram. O quinto aparece na reprise do telejornal toda sexta."],
      ["Menino de bicicleta", "1993", "Pedalei até o portão e voltei. Só queria dizer que tive coragem."],
      ["Dr. Moreira", "1994", "Estive aqui como perito. A capela estava quente. Fazia frio. Assinei o laudo em branco."],
      ["(sem nome)", "1994", "A letra é a sua. A data é a de hoje. Você não lembra de ter escrito."]
    ]
  },

  // ---------------------------------------------------------------- os nomes dos amigos
  amigos: {
    rotulo: "Amigos que a casa vai chamar",
    placeholder: "até 5 nomes, separados por vírgula",
    chamado: [
      "(a voz, de uma sala vizinha) ...{nome}? {nome}, é você aí também?",
      "(a voz, de uma sala vizinha) ...{nome} me falou de você. Vem cá."
    ],
    chamada: "(no meio da chamada de 1979, onde ninguém mais responde) ...{nomes}... presente... presente...",
    jornal: "No jornal do dia seguinte, em letras miúdas, entre os visitantes da noite: {nomes}."
  },

  // ---------------------------------------------------------------- notas relidas depois do final verdadeiro
  notasDepois: {
    carimbo: "LIDO DE NOVO",
    n2: "(em caneta vermelha, entrelinhas) 21h50. O Davi não estava fora da cama. Estava voltando para buscar o Tomé.",
    n3: "(em caneta vermelha, entrelinhas) Eram trinta e quatro porque a cozinheira escondeu três no forno apagado, enquanto o Moacir comia de olhos fechados para não ver as vagas vazias.",
    n4: "(em caneta vermelha, entrelinhas) “Diretor recusou” porque o laudo chamaria a polícia. Moacir pediu o afastamento três vezes.",
    n8: "(em caneta vermelha, entrelinhas) O terço bateu na mesa de propósito. Ela queria que ele a achasse, para que não achasse as crianças.",
    n10: "(em caneta vermelha, entrelinhas) “Fugitivos” foi ideia do Moacir: queria que a polícia procurasse longe da serra."
  },
  // ---------------------------------------------------------------- uma nota mente a cada noite
  mentiras: [
    { id: "n2", de: "21h50", para: "21h15", certo: "21h50" },
    { id: "n3", de: "serviram 34", para: "serviram 36", certo: "34" },
    { id: "n4", de: "41 anos", para: "47 anos", certo: "41 anos" },
    { id: "n8", de: "e não piscou", para: "e piscou", certo: "não piscou" }
  ],
  mentiraFim: "Esta noite uma das notas mentia: “{titulo}”. Dizia “{falso}”. O certo era “{certo}”.",
  mentiraNaoLeu: " (Você nem chegou a ler.)",
  // ---------------------------------------------------------------- a Lia anterior comenta a lápis o que você relê
  lapis: [
    "(a lápis, na sua letra) o armário do hall é seguro",
    "(a lápis, na sua letra) não confie na voz que chama",
    "(a lápis, na sua letra) a Ana só anda no escuro",
    "(a lápis, na sua letra) este papel eu já li. esqueci o que era mentira",
    "(a lápis, na sua letra) vai pela esquerda, é mais rápido",
    "(a lápis, na sua letra) segura o ar antes de ele virar a cabeça",
    "(a lápis, na sua letra) a cama é melhor que o armário",
    "(a lápis, na sua letra) tem coisa atrás desta sala. olha direito"
  ],
  // ---------------------------------------------------------------- três jeitos de o Davi falar
  daviEstilo: {
    discreta: "(o Davi, no rádio) ...você é quieta, Lia. Igual a mim quando eu me escondia.",
    destruidora: "(o Davi, no rádio, quase rindo) ...você faz barulho demais. Ele te ouviu da capela, sabia?",
    apressada: "(o Davi, no rádio) ...por que tanta pressa? A noite é a mesma, Lia. Calma, tem tempo."
  },
  // ---------------------------------------------------------------- a fita da Lia pequena (terceira noite)
  liaPequena: [
    "(a fita nova do toca-fitas do carro chia; uma menina de seis anos começa a cantar)",
    "(a Lia pequena, cantando) Dorme, dorme, sino manso, que a casa não acorda quem não conta.",
    "(a Lia pequena) Um, dois, três, o irmão não vê. Quatro, cinco, seis, ele vai me ver.",
    "(a Lia pequena, sem cantar) O Davi disse que o sino da casa dele é igual ao daqui. Que a gente ia se achar pelo som.",
    "(a Lia pequena, bem baixinho) Quando o sino parar, é você que tem que me acordar, tá, Lia?",
    "(a Lia, no carro, sem conseguir mexer as mãos) Eu nunca gravei essa fita."
  ],
  liaPequenaConquista: "Cantiga de Seis Anos"
};

// Conquistas novas (secretas)
R.conquistas.push(
  { id: "detetive", nome: "Detetive do São Lázaro", desc: "Acuse o culpado do fogo e acerte.", secreta: true },
  { id: "tres_nomes", nome: "Os Três Nomes", desc: "Acerte o culpado em três noites diferentes, um de cada vez.", secreta: true },
  { id: "letra_tremida", nome: "Letra Tremida", desc: "Leia cinco avisos deixados pelas Lias que morreram antes de você.", secreta: true },
  { id: "ninguem_escreveu", nome: "Ninguém Escreveu Isso", desc: "Leia o seu próprio recado depois de a casa trocar três palavras dele.", secreta: true },
  { id: "letra_outra_mao", nome: "Letra de Outra Mão", desc: "Perceba que alguém mexeu nas regras do papel do internato.", secreta: true },
  { id: "quatro_versoes", nome: "As Quatro Versões", desc: "Ouça os três contarem o incêndio, em noites diferentes.", secreta: true },
  { id: "calendario_cheio", nome: "O Mês Inteiro", desc: "Abra o calendário do carro nos trinta e um dias do mês.", secreta: true },
  { id: "o_enfermeiro", nome: "O Enfermeiro", desc: "Leia as cinco cartas do Moacir.", secreta: true },
  { id: "lia_pequena", nome: "Cantiga de Seis Anos", desc: "Ouça a fita da Lia pequena na terceira noite.", secreta: true },
  { id: "radio_sete", nome: "Serra FM, Sete Noites", desc: "Ouça os sete boletins da Serra FM, em ordem.", secreta: true },
  { id: "depois_creditos", nome: "Depois dos Créditos", desc: "Veja as sete cenas depois dos créditos, e depois a oitava.", secreta: true },
  { id: "quatro_paginas_mae", nome: "Quatro Páginas da Mãe", desc: "Leia as cartas da mãe da Lia depois de cada final.", secreta: true },
  { id: "final_comnome", nome: "Com Nome", desc: "Devolva o apito e o crachá ao Moacir.", secreta: true },
  { id: "final_substituta", nome: "A Substituta", desc: "Assopre o apito do Inspetor três vezes.", secreta: true },
  { id: "final_quartafila", nome: "A Quarta da Fila", desc: "Entre na fila da Procissão.", secreta: true },
  { id: "final_horacomp", nome: "A Hora Compartilhada", desc: "Toque o sino junto com o Moacir.", secreta: true }
);

// Notas novas colocadas pelo motor da volta (src/historia.js lê onde6; a condição de aparecer é do L6B, via campo l6b)
R.notas.push(
  { id: "n6h", secreta: true, l6b: "quatroVersoes", conquista: "quatro_versoes", onde6: ["terreo", "refeit", "mesa"], titulo: R.lote6b.notaQuatro.titulo, texto: R.lote6b.notaQuatro.texto },
  { id: "n6i", secreta: true, l6b: "bilhete", onde6: ["terreo", "aula", "mesa"], titulo: R.lote6b.bilhete.nota.titulo, texto: "(um recado seu, na letra do Davi)" }
);
