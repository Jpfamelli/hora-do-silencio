// TEXTO DA PROGRESSÃO — Lote 4 (segredos e easter eggs): códigos do título, modos escondidos, lanternas
// cosméticas, cartas das entidades, mural de boatos, parede das Lias, livro das ocorrências, fichas da chamada,
// bilhetes da noite passada e conquistas novas. Lido por src/progressao-lote4.js.
// Aspas já tipográficas (este arquivo carrega depois do roteiro.js, que curva as aspas retas).
window.ROTEIRO.progressao = window.ROTEIRO.progressao || {};
window.ROTEIRO.progressao.lote4 = {
  // ---- códigos digitados no título (cada um liga um segredo)
  codigos: {
    acorda: "Você escreveu ACORDA. Lá no fundo, o Davi respondeu: “até que enfim.” (modo Noite Espelhada liberado)",
    lampiao: "A lanterna ficou pesada e quente. Cheira a querosene de 1979. (lanterna de lampião liberada)",
    avesso: "O mundo virou de cabeça para baixo. O que estava escrito agora olha de volta.",
    ail: "L-I-A, ao contrário. O São Lázaro inteiro trocou de lado.",
    fogo: "Alguém riscou um fósforo lá dentro. A próxima noite vai ter fumaça. (modo Fumaça)",
    escuro: "O gerador nunca pegou. A próxima noite é sem lâmpada nenhuma. (modo Sem Luz)",
    recreio: "Achou a lanterna de brinquedo do Davi, azul, de pilha fraca. (lanterna do Davi liberada)"
  },
  // ---- modos escondidos (seletor no painel Segredos)
  modos: {
    titulo: "Modos escondidos",
    espelhada: "Noite Espelhada", espelhadaDesc: "o internato inteiro trocado de lado (só visual)",
    fumaca: "Noite de Fumaça", fumacaDesc: "um véu de fuligem cobre a tela",
    escuro: "Noite Sem Luz", escuroDesc: "uma penumbra a mais em tudo",
    trancado: "Ainda não liberado · procure o código",
    aviso: "Modos cosméticos: mudam a sensação, não o ranking."
  },
  // ---- lanternas cosméticas (cor do véu da tela e nome)
  lanternas: {
    titulo: "Lanternas",
    aviso: "Só muda a cor e o clima. Os números do jogo continuam iguais.",
    lista: [
      { id: "padrao", nome: "Lanterna comum", desc: "a de sempre, luz branca e seca.", cor: null },
      { id: "davi", nome: "Lanterna do Davi", desc: "fita azul no cabo, luz um pouco fria.", cor: "#6c8fb8", como: "digite RECREIO no título" },
      { id: "tome", nome: "Lanterna de bombeiro", desc: "amarela, cone largo e cansado.", cor: "#c9a24a", como: "complete o fio das três crianças" },
      { id: "celeste", nome: "Lamparina da Irmã", desc: "luz quente que treme como vela.", cor: "#c57a3a", como: "complete o verbete da Irmã Celeste" },
      { id: "joaquim", nome: "Lanterna do zelador", desc: "lata amassada, pisca às vezes.", cor: "#b8a06a", como: "ache os seis lugares secretos" },
      { id: "lampiao", nome: "Lampião de 1979", desc: "querosene, luz redonda e baixa.", cor: "#d08838", como: "digite LAMPIÃO no título" },
      { id: "vermelha", nome: "Lanterna vermelha", desc: "só para quem conhece cada canto.", cor: "#a83028", como: "chegue a 100% do internato" }
    ]
  },
  // ---- cartas das entidades (comparar números); fraqueza escrita pelo Davi
  cartas: {
    titulo: "Cartas da casa",
    aviso: "Cada carta vira quando você sobrevive a quem ela mostra.",
    lista: [
      { id: "inspetor", nome: "O Inspetor", a: 10, v: 0, ve: 6, fraco: "ele não enxerga. Fica no escuro e prende o ar. — D." },
      { id: "ana", nome: "A Menina Que Conta", a: 2, v: 10, ve: 8, fraco: "só anda quando você não olha. Mantenha a luz nela. — D." },
      { id: "procissao", nome: "A Procissão", a: 4, v: 4, ve: 5, fraco: "ela passa reto. Entra num armário ou embaixo da cama. — D." },
      { id: "chamado", nome: "O Chamado", a: 8, v: 1, ve: 0, fraco: "a voz mente. Não vai aonde ela chama. — D." },
      { id: "breu", nome: "O Breu", a: 0, v: 0, ve: 9, fraco: "é o escuro total. Uma vela, um fósforo, qualquer luz o segura. — D." },
      { id: "coruja", nome: "A Coruja", a: 6, v: 7, ve: 3, fraco: "ela avisa antes dele. Quando ela cala, corre. — D." }
    ],
    secretas: [
      { id: "moacir", nome: "Moacir, o menino", a: 1, v: 5, ve: 2, fraco: "tinha medo do armário. Virou o armário. — D.", como: "ache o quarto do menino" },
      { id: "davi", nome: "Davi", a: 3, v: 3, ve: 4, fraco: "eu toco o sino toda noite. Enquanto bater, ele dorme. — D.", como: "complete o diário do Davi" }
    ]
  },
  // ---- mural de boatos (depois do primeiro final)
  boatos: {
    titulo: "Boatos do São Lázaro",
    aviso: "Dizem por aí. Quem viver, confere.",
    lista: [
      { id: "dez", txt: "dizem que o sino já bateu dez vezes." },
      { id: "janta", txt: "dizem que ele janta sozinho, ouvindo a colher." },
      { id: "andar", txt: "dizem que tem um andar entre os andares." },
      { id: "quarta", txt: "dizem que havia uma quarta criança." },
      { id: "espelho", txt: "dizem que, do avesso, dá para ver quem ficou." },
      { id: "cheia", txt: "dizem que quem passa nove horas aqui já não sai." }
    ],
    vivido: "VIVIDO"
  },
  // ---- parede das Lias (riscos por morte)
  parede: {
    titulo: "Todas Voltam",
    texto: "Um risco de giz para cada vez que a casa te pegou. Somando todas as noites.",
    inspetor: "pelo Inspetor", ana: "pela Menina", procissao: "pela Procissão", outro: "de outro jeito",
    trinta7: "No risco número trinta e sete, a Irmã Celeste escreveu embaixo: “{nome} — reza por você.”",
    nome: "LIA", vazio: "Nenhum risco ainda. A casa ainda não te pegou."
  },
  // ---- livro das ocorrências raras
  ocorrencias: {
    titulo: "Noites que ninguém acredita",
    aviso: "Oito coisas que quase ninguém vê. Marque as que você viu.",
    lista: [
      { id: "hora", txt: "jogar o jogo exatamente às nove da noite." },
      { id: "cheia", txt: "passar nove horas somadas dentro do São Lázaro." },
      { id: "fogo", txt: "entrar num 14 de março, a noite do fogo." },
      { id: "aniversario", txt: "entrar num 15 de março, aniversário da Lia." },
      { id: "treze", txt: "entrar numa sexta-feira 13." },
      { id: "madrugada", txt: "entrar às três da manhã." },
      { id: "espelhada", txt: "terminar um capítulo na Noite Espelhada." },
      { id: "treze_noites", txt: "chegar à sua décima terceira noite." }
    ]
  },
  // ---- fichas da chamada (digite o nome de uma criança no título)
  chamada: {
    titulo: "A Chamada de 1979",
    aviso: "Digite o nome de uma das crianças no título.",
    fichas: {
      rosa: "Rosa, 9 anos. A tia buscou em 1979. Nunca mais falou depois das nove.",
      bento: "Bento, 11 anos. Fugiu pela estrada. Acharam o sapato, não o menino.",
      clara: "Clara, 8 anos. Dormia com a luz acesa. Transferida. Ninguém soube para onde.",
      otavio: "Otávio, 10 anos. Gostava do sino. Consta como fugitivo desde o incêndio.",
      ines: "Inês, 12 anos. Ajudava a Irmã Celeste. Ficou na capela até o fim.",
      cicero: "Cícero, 9 anos. Perdeu um sapato no pátio. O outro ainda está lá.",
      duarte: "Duarte, 7 anos. O caçula. Chamava todo mundo de irmão.",
      vera: "Vera, 11 anos. Contava histórias de medo. Parou de contar em março.",
      lazaro: "Lázaro, 10 anos. Mesmo nome da casa. Achava que por isso estava seguro.",
      noemia: "Noêmia, 8 anos. Bordava o próprio nome em tudo. Só o lenço sobrou.",
      tiago: "Tiago, 12 anos. Queria ser padre. Rezava com a Irmã Celeste.",
      bia: "Bia, 9 anos. A menor da turma. Cabia embaixo de qualquer cama."
    },
    conqAos: "A Chamada: você já chamou {n} das crianças."
  },
  // ---- bilhete da Lia da noite passada (recepção/título)
  bilhetes: {
    inspetor: "Morri {n} {vezes} pro Inspetor em {cap}. Não corre lá.",
    ana: "A Menina quase me pegou em {cap}. Não solta a luz dela.",
    procissao: "A Procissão passou por {cap}. Entra no primeiro armário.",
    geral: "Ontem foi {cap}. A casa lembra de mim. — L.",
    inicio: "Bilhete na cortiça da recepção:"
  },
  // ---- lápide do amigo (quando um código de desafio é colado)
  lapideAmigo: "Alguém mandou esta noite para você. Tem uma lápide nova no cemitério com o nome de quem morreu aqui antes.",
  // ---- bilhetes de pausa (uma linha de criança)
  pausa: [
    "No canto da página, com letra de criança: “ela correu de novo.”",
    "No canto da página: “ele quase achou ela na cozinha.”",
    "No canto da página: “ela não olhou pra lousa. que bom.”",
    "No canto da página: “ela já morreu aqui. a gente viu.”",
    "No canto da página: “vem de novo amanhã, Lia?”"
  ],
  // ---- morte: contador de medos
  medos: { titulo: "morte {n} de {t} já vistas", todas: "Você já morreu de tudo que esta casa tem." },
  // ---- Joaquim no final de quem não mexeu em nada
  naoMexi: "Seu Joaquim, no portão: “Melhor assim. Quem não mexe, não acorda ninguém.”",
  // ---- conquistas novas do lote 4
  conquistas: [
    { id: "l4_acorda", nome: "Acorda", desc: "Escreva ACORDA no título.", secreta: true, charada: "A palavra que o Davi mais queria ouvir." },
    { id: "l4_avesso4", nome: "De Cabeça Para Baixo", desc: "Escreva AVESSO no título.", secreta: true, charada: "Vire tudo sem tocar no celular." },
    { id: "l4_espelho", nome: "Do Outro Lado do Espelho", desc: "Escreva AIL no título.", secreta: true, charada: "O nome da Lia, só que ao contrário." },
    { id: "l4_lampiao", nome: "Luz de Querosene", desc: "Escreva LAMPIÃO no título.", secreta: true, charada: "A luz de 1979 tem nome de senha." },
    { id: "l4_recreio", nome: "Brinquedo do Davi", desc: "Escreva RECREIO no título.", secreta: true, charada: "A hora preferida das crianças." },
    { id: "l4_fogo", nome: "Fumaça", desc: "Ligue a Noite de Fumaça.", secreta: true, charada: "O que sobe da vela." },
    { id: "l4_escuro", nome: "Sem Lâmpada", desc: "Ligue a Noite Sem Luz.", secreta: true, charada: "O gerador nunca pegou." },
    { id: "l4_trinta7", nome: "Trinta e Sete", desc: "Acumule 37 mortes — uma por criança.", secreta: true, charada: "O número de quem não saiu." },
    { id: "l4_hora_cheia", nome: "Hora Cheia", desc: "Passe nove horas somadas dentro do São Lázaro.", secreta: true, charada: "Nove, como as badaladas." },
    { id: "l4_treze", nome: "Treze", desc: "Chegue à sua décima terceira noite.", secreta: true, charada: "Uma a mais do que as nove." },
    { id: "l4_nao_mexi", nome: "Não Mexi em Nada", desc: "Termine a noite sem achar nenhum segredo nem código.", secreta: true, charada: "Às vezes é melhor não acordar ninguém." },
    { id: "l4_procura", nome: "Quem Procura Acha", desc: "Reúna 20 peças do acervo somando as noites.", secreta: true, charada: "Vinte coisas que a casa escondeu." },
    { id: "l4_medos", nome: "Já Morri de Tudo", desc: "Veja todas as cenas de morte da casa.", secreta: true, charada: "Cada bicho te pega de um jeito." },
    { id: "l4_doze", nome: "Doze", desc: "Deixe o Inspetor te pegar doze vezes.", secreta: true, charada: "A chave que tilinta na tela de morte." },
    { id: "l4_cartas", nome: "Clube do Silêncio", desc: "Vire todas as cartas das entidades.", secreta: true, charada: "Sobreviva a cada um deles pelo menos uma vez." },
    { id: "l4_chamada", nome: "Lista de Chamada", desc: "Chame dez das crianças pelo nome no título.", secreta: true, charada: "Os nomes da turma de 1979." },
    { id: "l4_boatos", nome: "Todos os Boatos", desc: "Viva os seis boatos do São Lázaro.", secreta: true, charada: "Dizem por aí. Confira cada um." },
    { id: "l4_prateleira", nome: "A Prateleira Cheia", desc: "Encha a prateleira de achados do título.", secreta: true, charada: "Tudo que a casa deixou cair." }
  ]
};
// Junta as conquistas novas no catálogo da progressão (sem duplicar).
(() => {
  const P = window.ROTEIRO.progressao; P.conquistas = P.conquistas || [];
  for (const c of P.lote4.conquistas) if (!P.conquistas.some(x => x.id === c.id)) P.conquistas.push(c);
})();
