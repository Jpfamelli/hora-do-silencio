// TEXTO DA PROGRESSÃO — Lote 3 (polimento e plataforma): segredos do título, modos de rejogo, filtros,
// Noite da Semana, contador de 100%, fósforos e conquistas novas. Lido por src/progressao3.js.
// Aspas já tipográficas (este arquivo carrega depois do roteiro.js).
window.ROTEIRO.progressao = window.ROTEIRO.progressao || {};
window.ROTEIRO.progressao.lote3 = {
  reinicio: {
    segurando: "segure para recomeçar o capítulo",
    confirmar: "Segure de novo para recomeçar o capítulo do zero.",
    feito: "Do começo. De novo.",
    semSnap: "Este capítulo ainda não tem um começo salvo.",
    dicaPausa: "segure BACKSPACE (ou SELECT, ou três dedos na tela) para recomeçar o capítulo na hora"
  },
  morte: {
    rapida: "modo corrida: E, ENTER ou BACKSPACE seguro e você já está de pé",
    instante: "Guardar o último instante",
    instanteOk: "Instante guardado",
    mesmoPonto: "mesmo lugar pela {n}ª vez"
  },
  titulo: {
    davi: "A fita rodou ao contrário por três segundos. No fim, alguém riu baixinho: “de novo, Lia?”",
    ana: ["um", "dois", "três", "quatro", "cinco", "seis", "sete", "oito", "nove", "DEZ."],
    anaFim: "Ela achou você. O mundo ficou do avesso por um instante.",
    ano: "SÃO LÁZARO<br>1979",
    anoMem: "A placa ainda cheira a fumaça.",
    orelhaoTocando: "☎ um orelhão tocando na chuva · clique para atender",
    orelhaoSemNome: "moça",
    orelhao: {
      nenhum: "Alô? {nome}? A irmã disse que ninguém pode sair da cama depois das nove. Você vem amanhã? Promete?",
      comum: "{nome}... você foi embora. A gente ficou ouvindo o carro. Ele também ouviu.",
      silencio: "{nome}, aqui tá tão quieto agora. Ninguém mais conta. Ninguém mais chama. Obrigado... eu acho.",
      verdadeiro: "{nome}! O sino parou! A gente subiu a torre e deu pra ver a estrada inteira. Você tava lá embaixo."
    },
    orelhaoFim: "(tu... tu... tu... ocupado)",
    moacir: "O menu inteiro ficou mudo. Agora você sabe como ele ouve. (desafio “Ouvido do Inspetor” no título)",
    negativo: "Um, nove, sete. A noite revelou ao contrário. (filtro “Negativo” liberado)",
    visita: ["Tem uma lanterna acesa no portão.", "A luz está mais perto. Não mexa.", "Alguém encostou a mão no vidro."],
    visitaSome: "A luz apagou quando você se mexeu.",
    fora: "Você ficou {d} {dias} fora. A Ana contou até {n}.",
    foraLonge: "Você ficou {d} dias fora. A lápide do portão ainda tem a data da sua última visita: {data}.",
    semSinal: "Sem sinal. Como naquela noite.",
    duasAbas: "Já tem alguém aqui dentro, Lia.",
    avessoTitulo: "O SILÊNCIO<br>DA HORA",
    avessoSub: "por que você me virou?",
    dificil: "Na última noite ele te achou {n} vezes no Normal. Ninguém aqui vai rir se você escolher o Fácil.",
    cem: "Você conhece cada canto do São Lázaro. Eles também conhecem você.",
    semana: "Noite da Semana {s} · a mesma noite para todo mundo · vale até domingo",
    semanaRec: " · seu melhor: {t}"
  },
  jogo: {
    nove: "VOCÊ DEMOROU",
    noveLia: "Tem giz no chão na minha frente. Alguém escreveu enquanto eu estava parada.",
    abandono: "Você saiu. Eu fiquei.",
    abandonoLia: "Marcas de pé descalço em volta de mim... de fuligem.",
    volumeZero: "[silêncio total. ele gosta assim.]",
    estalo: "N estala os dedos: o mundo aparece por um instante, e ele ouve.",
    ouvidoAviso: "Ouvido do Inspetor: você só vê o que faz barulho. N estala os dedos."
  },
  console: {
    bilhete: "se você está lendo isso, digita ouvir() aqui. — D.",
    ouvir: "(chiado) ...Lia? Se alguém achar essa fita, a Lia tem que saber que eu não fugi. Eu fiquei. (clique)"
  },
  ficha: {
    titulo: "INTERNATO SÃO LÁZARO — FICHA DE MATRÍCULA",
    ano: "Ano letivo de 1979",
    campos: ["Nome do aluno(a)", "Idade", "Responsável", "Dormitório", "Observações da Irmã"],
    obs: "Chegou de noite. Não chorou. Pediu para dormir perto da janela.",
    carimbo: "VAGA TRANSFERIDA",
    rodape: "Deixe esta ficha no portão. Alguém vem buscar."
  },
  fimCap: {
    antesHora: "o rádio do carro, lá longe: “tá com pressa, moça? ninguém sai mais cedo do São Lázaro.”",
    olhosMoacir: "selo secreto: <b class=\"ouro\">Olhos do Moacir</b> — você atravessou quase tudo no escuro",
    asCegas: "selo secreto: <b class=\"ouro\">Às Cegas, Como Ele</b> — sem HUD, sem legendas de som, sem anel de ruído",
    ouvido: "selo secreto: <b class=\"ouro\">Ouvido do Inspetor</b> — você terminou o capítulo enxergando só o som",
    pulos: "você pulou da cadeira {n} {vezes}{qual}",
    pontos: "pontos para o S: {p} de 6",
    fosforo: "+1 fósforo (gaste em Conquistas para ler a charada de uma secreta)",
    rota: "sua rota ficou gravada: veja em Capítulos"
  },
  final: {
    limpa: "corrida limpa",
    ajuda: "corrida com ajuda",
    motivos: { cont: "continuou de um save", leve: "trecho mais leve", ajuda: "ajuda invisível", replay: "rejogo pelo menu" },
    tempos: "tempo de jogo {j} · tempo real {r} · pausas e menus {p}",
    continuada: "tempo de jogo {j} · tempo real: não conta (a noite foi continuada depois)",
    semana: "Noite da Semana {s}: {t}{rec}",
    copiarSemana: "Copiar desafio da semana"
  },
  filtros: { nada: "Nenhum", fita: "Fita de 1979", vigia: "Câmera de vigilância", negativo: "Negativo" },
  // peso de cada parte no 100% (soma 100)
  pesos: { conquistas: 30, acervo: 25, ranks: 15, desafios: 10, finais: 10, selos: 10 },
  conquistas: [
    { id: "internato_inteiro", nome: "O Internato Inteiro", desc: "Chegue a 100% nas Estatísticas." },
    { id: "nomes_ditos", nome: "Nomes Ditos", desc: "Escreva DAVI, ANA e 1979 no título.", secreta: true, charada: "Três nomes que a casa conhece. Escreva onde ninguém vê." },
    { id: "cobrar", nome: "Ligação a Cobrar", desc: "Atenda o orelhão do título.", secreta: true, charada: "Um telefone de rua, letra por letra, sem acento." },
    { id: "visita", nome: "Visita", desc: "Espere a luz do portão chegar até o vidro.", secreta: true, charada: "Quem espera no título, espera muito." },
    { id: "duas_lias", nome: "Duas Lias", desc: "Abra o jogo duas vezes ao mesmo tempo.", secreta: true, charada: "Ela não gosta de ser vista duas vezes." },
    { id: "linha_cortada", nome: "Linha Cortada", desc: "Abra o jogo sem internet.", secreta: true, charada: "Corte o fio antes de entrar." },
    { id: "outro_lado", nome: "Do Outro Lado", desc: "Ouça a fita escondida no console do navegador.", secreta: true, charada: "As ferramentas de quem conserta guardam um bilhete." },
    { id: "vaga", nome: "Vaga Transferida", desc: "Imprima a ficha de matrícula de 1979.", secreta: true, charada: "Ponha a noite no papel." },
    { id: "avesso", nome: "Do Avesso", desc: "Vire o celular de cabeça para baixo no título.", secreta: true, charada: "Vire o mundo com as mãos." },
    { id: "nove_min", nome: "Nove Minutos", desc: "Deixe o jogo pausado por nove minutos.", secreta: true, charada: "A Hora do Silêncio também vale para quem para." },
    { id: "abandono", nome: "Você Saiu", desc: "Deixe a aba do jogo escondida por mais de três minutos no meio da noite.", secreta: true, charada: "Deixe a casa sozinha por um tempo." },
    { id: "ouvido", nome: "Ouvido do Inspetor", desc: "Termine um capítulo no desafio Ouvido do Inspetor.", secreta: true, charada: "Diga o nome dele onde ele não escuta." },
    { id: "negativo", nome: "Ao Contrário", desc: "Segure 1, 9 e 7 juntos no título.", secreta: true, charada: "O ano do fogo, apertado de uma vez." },
    { id: "antes_hora", nome: "Antes da Hora", desc: "Termine o prólogo em menos de 2 min 30 s.", secreta: true, charada: "Ninguém sai mais cedo do São Lázaro. Nem chega." },
    { id: "silencio_abs", nome: "Silêncio Absoluto", desc: "Termine um capítulo com o volume em zero.", secreta: true, charada: "Ele gosta assim." },
    { id: "olhos_moacir", nome: "Olhos do Moacir", desc: "Termine um capítulo com a lanterna apagada em mais de 80% do tempo.", secreta: true, charada: "Ele nunca precisou de luz." },
    { id: "as_cegas", nome: "Às Cegas, Como Ele", desc: "Termine um capítulo com HUD mínimo, sem legendas de som e sem anel de ruído.", secreta: true, charada: "Ele não precisa enxergar." },
    { id: "mao_firme", nome: "Mão Firme", desc: "Termine o Capítulo III jogando no toque." },
    { id: "escuro_quarto", nome: "No Escuro do Quarto", desc: "Jogue 20 minutos seguidos em tela cheia." },
    { id: "coracao_boca", nome: "Coração na Boca", desc: "Pule da cadeira 10 vezes numa mesma noite." },
    { id: "sem_rede", nome: "Sem Rede", desc: "Termine uma corrida limpa no Normal ou no Pesadelo." },
    { id: "semana", nome: "Noite da Semana", desc: "Termine a Noite da Semana." },
    { id: "ultimo_instante", nome: "Último Instante", desc: "Guarde a foto da sua morte." },
    { id: "outra_vez", nome: "Outra Vez", desc: "Recomece capítulos 20 vezes segurando BACKSPACE." }
  ]
};
