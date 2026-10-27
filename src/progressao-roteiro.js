// TEXTO DA PROGRESSÃO (Lote 2: mundo e história) — fios de mistério, linha do tempo, verbetes das pessoas,
// dicas do acervo, segunda noite, datas especiais, nomes especiais, jornal e epílogo. Lido por src/progressao-mundo.js.
// Aspas já tipográficas (este arquivo carrega depois do roteiro.js, que é quem curva as aspas retas).
window.ROTEIRO.progressao = window.ROTEIRO.progressao || {};
window.ROTEIRO.progressao.mundo = {
  // Fios de mistério: cada um junta até 4 peças do acervo (notas, páginas e fitas). Completar um fio = fala de fecho da Lia.
  fios: [
    { id: "moacir", nome: "O homem que caça", pecas: ["n4", "n3", "f3", "n8"], conq: "fio_moacir",
      fecho: "Ele foi menino aqui. Trancaram ele no armário até ele virar o armário." },
    { id: "fogo", nome: "A noite do fogo", pecas: ["n2", "n12", "n10", "f7"], conq: "fio_fogo",
      fecho: "Não foi acidente. O diretor trancou a capela e deixou o Moacir levar a culpa." },
    { id: "criancas", nome: "As três crianças", pecas: ["n5", "n6", "f6", "n13"], conq: "fio_criancas",
      fecho: "Um queria ser bombeiro. A outra nunca parava de olhar. E o Davi só queria me dar um desenho." },
    { id: "diario", nome: "O diário do Davi", pecas: ["p1", "p2", "p3", "p4"], conq: "fio_diario",
      fecho: "Quatro números. Ele escreveu cada um sabendo que eu ia ler. Ele sabia que eu vinha." },
    { id: "fita", nome: "Quem mandou a fita", pecas: ["f4", "f5", "n1", "n11"], conq: "fio_fita",
      fecho: "Não teve remetente porque quem mandou não tinha mais endereço. Ele e o Seu Joaquim. Os dois me chamaram." },
    { id: "regras", nome: "As regras da casa", pecas: ["f1", "f2", "n7", "n9"], conq: "fio_regras",
      fecho: "Cinco regras pra sobreviver, uma pra esconder o que fizeram. A casa inteira foi construída pra ninguém ouvir." }
  ],
  // Onde cada mapa guarda suas peças (só para contar; o acervo nunca diz onde)
  lugaresNomes: { estrada: "Estrada velha", terreo: "Térreo", superior: "Andar de cima", tuneis: "Túneis", cemiterio: "Cemitério" },
  lugaresPecas: { estrada: ["f5", "n1"], terreo: ["f1", "p1", "n2", "n3", "n4", "n5", "n13"], superior: ["f2", "p2", "p3", "n6", "n7", "n8", "f6"], tuneis: ["f3", "f4", "p4", "n9", "n10", "f7"], cemiterio: ["n11", "n12"] },
  // Dica enigmática de cada peça que falta (só aparece depois de terminar o jogo uma vez)
  dicas: {
    n1: "Alguém colou um rosto conhecido no caminho.", f5: "Um velho fala sozinho no balcão.",
    f1: "A voz do diretor ainda manda na sala dele.", p1: "Uma página dorme ao lado de uma voz gravada.", n2: "Alguém anotava a hora de cada castigo.",
    n3: "Quem cozinhava contava os pratos.", n4: "As camas com correia guardam um prontuário.", n5: "Um menino escreveu o que queria ser.",
    n13: "Um presente atrás de livros que ninguém lê.",
    f2: "Uma freira deixou a voz perto do terço.", p2: "No quarto de quem rezava, uma página.", p3: "Onde se brinca, uma página espera.",
    n6: "Uma menina deixou as regras da brincadeira.", n7: "A lista do que custava cada barulho.", n8: "A freira escrevia antes de dormir.",
    f6: "Apague a luz onde se guardam os uniformes. Fique pequena.",
    f3: "O homem que caça também gravou a voz.", f4: "Seu irmão deixou a última fita para você.", p4: "Uma página escrita embaixo d'água.",
    n9: "Quem levantou as paredes deixou um bilhete.", n10: "Uma carta que nunca chegou ao bispo.", f7: "O ano do fogo abre mais do que um cofre.",
    n11: "Uma pedra que alguém corrigiu.", n12: "Um recorte velho entre os túmulos."
  },
  // Linha do tempo do São Lázaro: cada data acende quando a peça é achada (sem peça = sempre acesa)
  linha: [
    { ano: "1938", txt: "Nasce Moacir Duarte. Aos oito anos, entra no São Lázaro como aluno.", peca: "n4" },
    { ano: "1946", txt: "O diretor de antes tranca o menino Moacir no armário. Muitas vezes.", peca: "f3" },
    { ano: "1967", txt: "Nasce Davi Moraes. Tomé nasce em 1969; Ana Luísa, em 1970.", peca: "n1" },
    { ano: "1978", txt: "12 de outubro. O diretor Albano grava: a Hora do Silêncio está funcionando.", peca: "f1" },
    { ano: "1978", txt: "Moacir perde a visão. Diz que ouve as crianças respirando. O diretor recusa o afastamento.", peca: "n4" },
    { ano: "1979", txt: "14 de março, 21h04. Tomé fala durante a Hora. 21h31, Ana chora. 21h50, Davi é pego perto da capela.", peca: "n2" },
    { ano: "1979", txt: "14 de março. A Irmã Celeste decide levar as crianças até o sino.", peca: "f2" },
    { ano: "1979", txt: "14 de março. O diretor tranca a capela por fora. O fogo começa nas velas.", peca: "f7" },
    { ano: "1979", txt: "15 de março. Aniversário da Lia. O desenho do Davi nunca chega.", peca: "n13" },
    { ano: "1979", txt: "Domingo de manhã, a cozinha serve 34 pratos. Ninguém diz nada.", peca: "n3" },
    { ano: "1979", txt: "O fogo vira “acidente”. As três crianças constam como fugitivas.", peca: "n10" },
    { ano: "1979", txt: "O jornal conta: o sino tocava sozinho quando os bombeiros chegaram.", peca: "n12" },
    { ano: "1994", txt: "Uma fita cassete chega sem remetente. A voz é a do Davi.", peca: null },
    { ano: "1994", txt: "Seu Joaquim, morto no incêndio, ainda avisa quem passa pela estrada.", peca: "f5" }
  ],
  // Verbetes que a Lia escreve sobre cada pessoa e reescreve conforme descobre (3 estágios: pouco, parte, tudo)
  pessoas: [
    { id: "davi", nome: "Davi", pecas: ["p1", "p2", "p3", "p4", "f4", "n13"], cor: "#9fc3d8",
      textos: ["Meu irmão. Doze anos, para sempre.", "Ele escrevia para mim sem poder mandar. Contava os números do segredo como quem conta os dias.", "Tocou o sino toda noite por quinze anos para segurar o homem lá dentro. Esperou eu chegar para poder parar."],
      ultima: "(Davi) “Tá tudo bem agora, Lia. Pode apagar a luz.”" },
    { id: "ana", nome: "Ana", pecas: ["n6", "n1", "n2", "p3"], cor: "#d8a0b8",
      textos: ["A menina que conta.", "Nove anos. Achava que, se parasse de olhar, a gente sumia. Chorou durante a Hora.", "Ela nunca quis assustar ninguém. Só não queria ficar sozinha no escuro outra vez."],
      ultima: "(Ana) “Pode piscar agora, moça. Eu não vou contar mais.”" },
    { id: "tome", nome: "Tomé", pecas: ["n5", "f6", "p2", "n2"], cor: "#a8c8e8",
      textos: ["O menino do carrinho azul.", "Dez anos. Queria ser bombeiro. Falou durante a Hora e foi pro armário.", "Escondeu o carrinho no muro para o Inspetor não ouvir as rodinhas. Sabia que tinha mais alguém no armário com eles."],
      ultima: "(Tomé) “Achou o meu carrinho? Pode ficar. Bombeiro não precisa de brinquedo.”" },
    { id: "moacir", nome: "Moacir", pecas: ["n4", "f3", "n3", "n8"], cor: "#a89888",
      textos: ["O homem vendado.", "O Inspetor. Cego, ouve tudo. Comia sozinho ouvindo a colher no prato.", "Menino trancado nos mesmos armários em 1946. Virou o que mais temia. O sino era a única coisa que desligava a cabeça dele."],
      ultima: "(Moacir) “Eu também era criança aqui. Ninguém veio me buscar.”" },
    { id: "celeste", nome: "Irmã Celeste", pecas: ["f2", "n8"], cor: "#b8c8a8",
      textos: ["A freira da fita.", "Rezava por eles. Percebeu que o Inspetor virava a cabeça para o som do terço.", "Na noite do fogo, levou as crianças até o sino. Não fugiu. Foi com eles."],
      ultima: "(Irmã Celeste) “Que Deus perdoe todos nós. Você, Ele já perdoou.”" },
    { id: "albano", nome: "Diretor Albano", pecas: ["f1", "n10", "f7", "n9"], cor: "#c8a878",
      textos: ["O diretor. Homem de disciplina.", "Mandou construir uma sala seca embaixo dos túneis. Escreveu ao bispo que tudo foi acidente.", "Trancou a capela por fora com as crianças tocando o sino. Ouviu as batidas até o fim. E deixou o Moacir levar a culpa."],
      ultima: "(Albano, muito longe) “Silêncio... eu só queria silêncio.”" },
    { id: "joaquim", nome: "Seu Joaquim", pecas: ["f5", "f2"], cor: "#c9b98a",
      textos: ["O velho do posto.", "Escreveu as regras para as crianças sobreviverem. Cinco. A sexta não é dele.", "Morreu tentando tirar os três da escada em chamas. Ainda segura o portão para quem foge."],
      ultima: "(Seu Joaquim) “Vai pra casa, moça. Dessa vez é pra valer.”" }
  ],
  fioCompleto: "Fio completo no acervo: {nome}",
  todasHistorias: "Ele escolheu o armário. Ela escolheu voltar.",
  // Recado do gravador da Lia: a voz a mais (depois do Capítulo IV)
  vozAMais: "(ao fundo, uma voz de menino) eu tô ouvindo, Lia.",
  // Segunda noite em diante: o internato lembra
  segunda: {
    n2: "\n{hoje} — 21h00. Aluna Lia M. fora da cama. Reincidente.",
    n3: "\nHoje pediram 38 pratos. O último tem nome escrito na borda: L. MORAES.",
    n4: "\n(a lápis, outra letra) ex-aluno da casa, 1946 a 1952. Ninguém anotou isso antes.",
    n7: "\n(embaixo, a lápis, recente) Lia M.: o Inspetor decidiu {n} vezes.",
    n8: "\n(outra caneta, letra firme) Eles foram dormir. Obrigada, moça.",
    paginas: { p1: "\n(numa letra mais apagada) você voltou? por quê?", p2: "\n(numa letra mais apagada) o Tomé ficou feliz.", p3: "\n(numa letra mais apagada) a Ana parou de contar.", p4: "\n(numa letra mais apagada) não precisa mais, Lia." }
  },
  // Comentários da Lia que mudam com as noites (a partir da noite indicada)
  lugaresNoite: [
    { noite: 2, k: "terreo:refeit", texto: "A mesa ainda tá posta. Tem um prato a mais. Com o meu nome." },
    { noite: 2, k: "terreo:cozinha", texto: "Trinta e sete canecas. E uma de lata, separada, com um L arranhado." },
    { noite: 3, k: "tuneis:hub", texto: "Tem giz na parede da cisterna. LIA, VOCÊ VOLTOU. A letra é do Davi." },
    { noite: 3, k: "superior:dormE", texto: "As camas arrumadas demais. Uma delas tem o meu tamanho. E o meu cheiro." },
    { noite: 4, k: "cemiterio:capela", texto: "Uma xícara de café no banco da capela. Ainda quente. Seu Joaquim?" },
    { noite: 5, k: "terreo:diret", texto: "Cigarro e cera. E uma pasta nova na mesa: MORAES, LIA. Grossa." }
  ],
  // O que a Lia pensa ao sair do carro, conforme as noites
  noites: {
    2: "Essa estrada... eu já passei por aqui. Não passei?",
    3: "De novo. O carro sempre atola no mesmo lugar.",
    5: "Quantas vezes eu já vim? Eu sei o caminho de olhos fechados. Ele também.",
    9: "Nove noites. Nove badaladas. Eu tô ficando igual a eles."
  },
  memoriaNoite: "Esta será a sua noite nº {n} no São Lázaro.",
  // Mortes de outras noites
  jaMorri: "Eu já morri aqui. Eu sei que já.",
  marcaVista: "Um X de giz no chão. LIA, {h}. A minha letra.",
  // Datas reais do relógio de quem joga
  datas: {
    fogo: { titulo: "FAZ {n} ANOS<br>HOJE", sub: "14 de março. A noite do fogo.", fala: "Quatorze de março. Hoje faz {n} anos. Hoje é a noite.", ocorrencia: "\n{hoje} — 21h04. Aluna Lia M. fora da cama. (a tinta ainda está molhada)" },
    aniversario: { sub: "15 de março. Alguém lembrou do seu aniversário.", fala: "Quinze de março. Meu aniversário. O Davi lembrava.", desenho: "\n\n(em cima do desenho, uma vela de aniversário. O pavio ainda está quente.)" },
    finados: { sub: "Dia de Finados. Alguém acendeu velas no cemitério das irmãs.", fala: "Dia de Finados. Lá no cemitério deve ter vela acesa. Pra eles, ninguém acende." },
    treze: { sub: "Sexta-feira, treze. Ele está com fome.", fala: "Sexta-feira treze. Logo hoje." },
    madrugada: { sub: "Três da manhã. Ninguém deveria estar acordado.", fala: "Três da manhã. Até o rádio dormiu." }
  },
  // Nomes especiais digitados em "Seu nome"
  nomes: {
    DAVI: { memoria: "(no rádio, um chiado) ...esse nome não é seu, Lia...", fala: { quem: "davi", texto: "(eco) Você escreveu o meu nome. Agora quem tá perdido sou eu?" } },
    ANA: { memoria: "(alguém conta baixinho) um... dois... três... achei.", fala: { quem: "ana", texto: "(eco) Você tem o meu nome. Então nunca para de olhar pra mim." } },
    "TOMÉ": { memoria: "(rodinhas de plástico atravessam o chão, longe) vrrrum...", fala: { quem: "tome", texto: "(eco) Tomé? Sou eu! Você também quer ser bombeiro?" } },
    MOACIR: { memoria: "Esse nome é meu.", fala: { quem: "inspetor", texto: "(perto demais) Esse nome é meu. Quem deu ele pra você?" }, efeito: "Ele ouviu o próprio nome. Está 10% mais rápido." },
    CELESTE: { memoria: "(contas de terço batem na mesa, uma por uma)", fala: { quem: "celeste", texto: "(eco) Reza comigo, menina. Eu aviso quando eles vierem." }, efeito: "O terço da Irmã Celeste avisa a Procissão 1 s antes." },
    ALBANO: { memoria: "(a voz do Inspetor) Diretor? O senhor voltou?", fala: { quem: "inspetor", texto: "Diretor... o senhor mandou silêncio. Eu obedeci." }, efeito: "Ele odeia esse nome. Ouve 10% mais longe." },
    LIA: { memoria: "Esse nome já é seu. Ele já sabe.", fala: { quem: "davi", texto: "(eco) Lia. Você escreveu o próprio nome. Pra não esquecer?" } }
  },
  // Silhueta da Lia onde ela morreu em outra noite
  fantasma: "(uma moça agachada, encharcada, olhando para você. Some quando você pisca.)",
  // Jornal do dia seguinte
  jornal: {
    nome: "O ECO DA SERRA",
    lema: "Campos do Jordão e região · desde 1951",
    manchetes: {
      comum: ["MOÇA É ENCONTRADA DESCALÇA NA ESTRADA VELHA", "Ela repetia que não podia correr. O rádio do carro dela ainda chiava quando o guincho chegou."],
      silencio: ["SINO DO SÃO LÁZARO TOCA DE NOVO", "Moradores contaram nove badaladas às 21h. A motorista que entrou no internato foi embora antes do sol."],
      verdadeiro: ["SINO DO SÃO LÁZARO SILENCIA APÓS 15 ANOS", "Pela primeira vez desde o incêndio de 1979, ninguém ouviu as nove badaladas. Uma moça foi vista no portão com um carrinho azul."],
      morte: ["MAIS UM CARRO ATOLADO NA ESTRADA VELHA", "A motorista não foi encontrada. A estrada segue interditada."]
    },
    quem: "A motorista, identificada como {nome}, não quis dar entrevista.",
    anonima: "A motorista não quis se identificar.",
    mortes: { 0: "Testemunhas dizem que ela atravessou o prédio sem fazer barulho nenhum.", 1: "Um caminhoneiro diz ter ouvido um grito, um só, vindo do internato.", n: "Vizinhos relatam ter ouvido gritos {n} vezes durante a noite. “Era sempre a mesma voz”, disse um deles." },
    rodape: ["CLASSIFICADOS · Vende-se carrinho de brinquedo azul, rodinhas novas. Tratar no posto da estrada velha.", "TEMPO · Chuva forte na Mantiqueira. Não saia de casa depois das nove."],
    foto: "Foto: o internato São Lázaro, fechado desde 1979."
  },
  // Epílogo no carro (depois do final verdadeiro)
  epilogo: [
    "Manhã. A chuva parou.",
    "Lia está no carro, com a porta aberta e os pés na terra molhada.",
    "(no rádio) ...e pela primeira vez em quinze anos, o sino do internato São Lázaro não tocou...",
    "No banco de trás, um carrinho azul. E uma fita cassete sem etiqueta."
  ],
  epilogoFita: "(uma voz de menino, muito perto do ouvido) obrigado.",
  // A quarta criança: chamar o Moacir pelo nome antes do último toque
  quarta: {
    botao: "Chamar o Moacir pelo nome",
    texto: "Antes do último toque, Lia disse o nome dele: “Moacir.”\nO homem alto parou de estalar a língua. Por um instante, no meio da nave, ajoelhado, era um menino de pijama com medo do armário.\nDavi estendeu a mão. O menino segurou. Subiram a escada da torre os quatro juntos.\n\nEu também era criança aqui. — M."
  },
  categorias: { saida: "Só a Saída", hora: "A Hora Acabou", tudo: "Todas as Lembranças" },
  categoriasDesc: { saida: "qualquer final vale", hora: "só vale com o final verdadeiro", tudo: "todas as notas, páginas e fitas, inclusive as escondidas" },
  // Dicas para conquistas secretas antigas que só mostravam "..."
  dicasConq: {
    linha_cruzada: "Telefone tocando na beira da estrada.", nove_horas: "O relógio também faz parte do jogo.",
    nome_pedra: "Diga quem você é antes de entrar.", verso: "Toda folha tem dois lados.",
    arrombadora: "Um cofre também ouve histórias.", escuro: "Alguns só falam com quem apaga a luz.",
    bombeiro: "Ele escondeu no muro, no canto do fundo.", desenho: "Um presente atrás dos livros.",
    nove_cliques: "Toque o sino do título como ele toca.", fita_gasta: "Uma palavra que eles mais repetem.",
    confissao: "O ano do fogo abre a gaveta certa."
  },
  conquistas: [
    { id: "fio_moacir", nome: "Olhos Fechados", desc: "Complete o fio “O homem que caça” no acervo.", secreta: true, dica: "Quem ele era antes de caçar?" },
    { id: "fio_fogo", nome: "Trancada Por Fora", desc: "Complete o fio “A noite do fogo” no acervo.", secreta: true, dica: "Não foi acidente." },
    { id: "fio_criancas", nome: "Recreio", desc: "Complete o fio “As três crianças” no acervo.", secreta: true, dica: "Um bombeiro, uma menina que conta e um presente." },
    { id: "fio_diario", nome: "Quatro Números", desc: "Complete o fio “O diário do Davi” no acervo.", secreta: true, dica: "Ele escreveu para você ler." },
    { id: "fio_fita", nome: "Remetente", desc: "Complete o fio “Quem mandou a fita” no acervo.", secreta: true, dica: "A carta não tinha endereço de volta." },
    { id: "fio_regras", nome: "Letra Miúda", desc: "Complete o fio “As regras da casa” no acervo.", secreta: true, dica: "Quem escreveu cada regra?" },
    { id: "historiadora", nome: "A Verdade Inteira", desc: "Complete os seis fios de mistério.", secreta: true, dica: "Ele escolheu o armário." },
    { id: "ninguem_esquecido", nome: "Ninguém Esquecido", desc: "Complete o verbete de todas as pessoas do acervo.", secreta: true, dica: "Cada nome tem uma história inteira." },
    { id: "ouve_casa", nome: "Quem Ouve a Casa", desc: "Repare em oito lugares do internato (somando as noites).", secreta: true, dica: "As paredes também falam." },
    { id: "quarta_crianca", nome: "A Quarta Criança", desc: "Chame o Moacir pelo nome antes do último toque.", secreta: true, dica: "Ele também dormiu nessas camas." },
    { id: "obrigado", nome: "Obrigado", desc: "Ouça a fita sem etiqueta no banco de trás.", secreta: true, dica: "Depois do fim, ainda tem uma fita." },
    { id: "voz_a_mais", nome: "Uma Voz a Mais", desc: "Ouça de novo os recados do gravador da Lia depois do Capítulo IV.", secreta: true, dica: "Volte ao gravador. Alguém estava ouvindo." },
    { id: "primeira_pagina", nome: "Primeira Página", desc: "Leia o jornal do dia seguinte.", secreta: true, dica: "O que disseram de você depois?" },
    { id: "marcada", nome: "Todos Voltam", desc: "Encontre a marca de giz de uma noite em que você morreu.", secreta: true, dica: "Você também deixa rastro." },
    { id: "outra_lia", nome: "A Outra Lia", desc: "Veja quem ficou onde você morreu.", secreta: true, dica: "Ela ainda está agachada lá." },
    { id: "mais_rapida", nome: "Mais Rápida Que Ontem", desc: "Bata o seu recorde de um capítulo seguindo as próprias pegadas.", secreta: true, dica: "Siga a outra Lia. Depois, deixe ela para trás." },
    { id: "chamada", nome: "A Chamada", desc: "Escreva quatro nomes da história no campo do seu nome.", secreta: true, dica: "Eles respondem quando chamados." },
    { id: "aniversario_fogo", nome: "Aniversário", desc: "Jogue num 14 de março, a noite do fogo.", secreta: true, dica: "Tem data certa para isso." },
    { id: "parabens_lia", nome: "Parabéns, Lia", desc: "Jogue num 15 de março, o aniversário da Lia.", secreta: true, dica: "O desenho era para um dia certo." },
    { id: "finados", nome: "Finados", desc: "Jogue no Dia de Finados.", secreta: true, dica: "Um dia de levar flores." },
    { id: "treze", nome: "Sexta-Feira", desc: "Jogue numa sexta-feira 13.", secreta: true, dica: "Um dia de azar." },
    { id: "madrugada", nome: "Hora Morta", desc: "Jogue às três da manhã.", secreta: true, dica: "Mais tarde que as nove. Muito mais." },
    { id: "nona_noite", nome: "Nona Noite", desc: "Comece a sua nona noite no São Lázaro.", secreta: true, dica: "Nove badaladas. Nove noites." },
    { id: "categoria_hora", nome: "Corredora da Hora", desc: "Termine uma corrida na categoria “A Hora Acabou”.", secreta: true, dica: "Contra o relógio, até o fim de verdade." },
    { id: "categoria_tudo", nome: "Nada Ficou Para Trás", desc: "Termine uma corrida na categoria “Todas as Lembranças”.", secreta: true, dica: "Contra o relógio, sem esquecer nada." }
  ]
};
