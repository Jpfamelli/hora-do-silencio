// TEXTO DA PROGRESSÃO — Lote 5 (monstros): bestiário vivo, temperamento do Inspetor por noite,
// contador de "vezes que ele te ouviu", modo Caçada Limpa, variações de morte por comportamento,
// conquistas de contra-jogo e o epílogo da noite toda em silêncio. Lido por src/progressao-lote5.js.
// Aspas já tipográficas (este arquivo carrega depois do roteiro.js).
window.ROTEIRO.progressao = window.ROTEIRO.progressao || {};
window.ROTEIRO.progressao.lote5 = {
  // --- temperamento sorteado pela semente de cada noite
  temperamentos: {
    farejador: {
      nome: "Farejador",
      lia: "Ele está rente ao chão esta noite. Farejando. Não sangre perto dele.",
      bestiario: "Esta noite ele caça pelo cheiro. Sangue o deixa mais rápido."
    },
    ouvinte: {
      nome: "Ouvinte",
      lia: "O silêncio está mais fundo que o normal. Ele escuta longe demais hoje.",
      bestiario: "Esta noite o ouvido dele alcança quase a casa toda."
    },
    guardiao: {
      nome: "Guardião",
      lia: "Ele não se afasta do que é dele. A ronda está curta e teimosa.",
      bestiario: "Esta noite ele ronda colado aos objetivos e volta rápido."
    }
  },
  tempAviso: "Você sentiu o humor dele hoje: {nome}.",
  difLinha: "O humor dele muda a cada noite: às vezes fareja o sangue, às vezes escuta longe, às vezes não larga a ronda.",

  // --- bestiário (uma ficha por entidade; cada linha só aparece quando presenciada)
  bestiario: {
    aviso: "O que você já viu cada um deles fazer. O que falta ainda está no escuro.",
    completo: "Você já viu o repertório inteiro da casa.",
    ocultoLinha: "· · · (ainda não presenciado)",
    pegou: "te pegou {n}x",
    novo: "Bestiário: comportamento novo registrado.",
    novaFicha: "Bestiário: ficha nova aberta.",
    fichas: "Fichas completas: {n} de {t}.",
    entidades: [
      {
        id: "inspetor", nome: "O Inspetor",
        resumo: "Moacir. Cego. Caça pelo som.",
        comps: [
          { id: "caca", nome: "A Caçada", dica: "O apito abre a caça. Quebre a linha de som com uma garrafa (G) ou suma num esconderijo." },
          { id: "bote", nome: "O Bote", dica: "Ele ergue os braços antes de avançar. Saia do alcance ou agache parada nesse meio segundo." },
          { id: "emboscada", nome: "A Emboscada", dica: "Às vezes ele para e espera, parado no escuro. Não ande para cima dele achando que o corredor está livre." },
          { id: "fareja", nome: "O Faro", dica: "Sangue fresco o atrai. Use o curativo (H) longe dele." },
          { id: "escuta", nome: "A Escuta na Parede", dica: "Ele cola o ouvido na parede. Pare de se mexer até ele seguir em frente." },
          { id: "vasculha", nome: "O Vasculho", dica: "Ele abre armários um a um. Prenda o ar (ESPAÇO) ou prefira a cama." },
          { id: "reza", nome: "A Pausa de Memória", dica: "De vez em quando ele reza e ouve pela metade. É a sua janela para passar." },
          { id: "falsa", nome: "A Falsa Partida", dica: "“Achou que eu tinha ido embora?” Espere os passos sumirem de verdade antes de sair." }
        ]
      },
      {
        id: "ana", nome: "A Menina Que Conta",
        resumo: "Só anda quando você não a vê na luz.",
        comps: [
          { id: "dez", nome: "O DEZ", dica: "Ela conta até dez e aparece atrás. Mantenha a luz nela e ande de costas." },
          { id: "escuro", nome: "Anda no Escuro", dica: "Com a lanterna apagada ela avança. Não tire a luz dela." }
        ]
      },
      {
        id: "procissao", nome: "A Procissão",
        resumo: "Atravessa as salas na Hora. Fora do esconderijo, mata.",
        comps: [
          { id: "aviso", nome: "O Aviso", dica: "As luzes piscam e o rádio chia antes. É o seu tempo de achar armário ou cama." },
          { id: "marcha", nome: "A Marcha", dica: "Enquanto passam, apague a lanterna: a luz vaza pela fresta." }
        ]
      },
      {
        id: "chamado", nome: "O Chamado",
        resumo: "Uma voz chama você da sala ao lado.",
        comps: [
          { id: "voz", nome: "A Voz Vizinha", dica: "Ela imita quem você procura. Ir até lá acorda o Inspetor." }
        ]
      }
    ]
  },

  // --- contador "vezes que ele te ouviu"
  ouviu: {
    morte: "ele te ouviu {n}x nesta noite",
    morteZero: "ele ainda não tinha te ouvido nesta noite",
    pausa: "ouvida {n}x esta noite",
    pausaZero: "nunca ouvida esta noite",
    capMudo: "Capítulo inteiro sem ele te ouvir.",
    capOuviu: "ele te ouviu {n}x neste capítulo"
  },

  // --- epílogo / final secreto: a noite toda em silêncio
  silencioTotal: {
    epilogo: "A Hora passou inteira e ele nunca te ouviu. No cemitério, o Inspetor se ajoelha e deixa você passar. “Essa dormiu a noite toda.”",
    stat: "Você atravessou a Hora sem ele te ouvir uma vez sequer."
  },

  // --- modo Caçada Limpa (rejogo)
  modo: {
    titulo: "Rejogo",
    aviso: "Só ele, o ouvido afiado e nenhum recuo. Sobreviva o quanto aguentar.",
    nome: "Caçada Limpa",
    desc: "o Inspetor ouve bem mais longe e quase não recua",
    trancado: "termine a campanha uma vez para liberar",
    entrar: "Caçada Limpa: ele não vai recuar. Corra quando precisar.",
    placar: "Mais tempo sobrevivido: {t}",
    placarVazio: "Nenhuma caçada ainda.",
    ligar: "Modo Caçada Limpa ligado no próximo capítulo.",
    desligar: "Modo Caçada Limpa desligado.",
    conq: "Conquistas de monstro: {n}/{t}",
    tempoCap: "Caçada Limpa: {t} sobrevividos até aqui."
  },

  // --- variações da tela de morte por comportamento
  diagnostico: {
    emboscada: "Ele nunca tinha ido embora. Estava parado, esperando no escuro.",
    falsa: "Você saiu cedo demais. Ele fingiu ir e voltou.",
    fareja: "Ele seguiu o cheiro do seu sangue. Cure-se longe dele.",
    reza: "Você se mexeu no meio da reza dele. Era a hora de ficar quieta.",
    vasculha: "Ele abriu o armário onde você estava. A cama teria sido mais segura.",
    humorFim: "Nesta noite o humor dele era {nome}.",
    farejador: " (o humor dele hoje era farejador)",
    ouvinte: " (o humor dele hoje era ouvinte)",
    guardiao: " (o humor dele hoje era guardião)"
  },

  // --- memória do título / rádio
  memoria: {
    temperamento: "Última noite o humor dele era {nome}.",
    deNovoAqui: "De novo aqui.",
    radioSilencio: "...dizem que ontem a aluna passou a Hora inteira sem fazer um ruído. Nem ele a ouviu..."
  },

  // --- conquistas novas (contra-jogo e monstros)
  conquistas: [
    { id: "l5_silencio_total", nome: "A Noite Toda em Silêncio", desc: "Termine a campanha sem que o Inspetor te ouça uma única vez.", secreta: true },
    { id: "l5_bestiario", nome: "Caderno Cheio", desc: "Veja todos os comportamentos das entidades no bestiário." },
    { id: "l5_humores", nome: "Três Humores", desc: "Sobreviva a uma noite de cada humor do Inspetor." },
    { id: "l5_noite_cega", nome: "A Noite Cega", desc: "Termine um capítulo (I a V) sem acender a lanterna.", secreta: true },
    { id: "l5_nunca_cama", nome: "Nunca na Cama", desc: "Termine uma noite inteira sem usar nenhum esconderijo.", secreta: true },
    { id: "l5_boanoite_moacir", nome: "Boa Noite, Moacir", desc: "Termine um capítulo sem correr e sem acender a luz a menos de 5 m dele.", secreta: true },
    { id: "l5_sem_rastro", nome: "Sem Rastro", desc: "Termine um capítulo sem sangrar perto do Inspetor.", secreta: true },
    { id: "l5_boanoite_todos", nome: "Boa Noite, Todos", desc: "Numa só noite, mande-o dormir, dê boa noite e toque o ombro dele.", secreta: true },
    { id: "l5_pela_hora", nome: "Pela Hora", desc: "No Capítulo II, cruze três salas enquanto ele está parado.", secreta: true },
    { id: "l5_cacada", nome: "Cinco Minutos", desc: "Aguente cinco minutos no modo Caçada Limpa.", secreta: true },
    { id: "l5_zelador_cego", nome: "Zelador Cego", desc: "Vença o Capítulo I no modo Caçada Limpa.", secreta: true },
    { id: "l5_variou", nome: "Nunca o Mesmo Canto", desc: "Termine uma noite sem repetir o esconderijo favorito da anterior.", secreta: true },
    { id: "l5_cap_mudo", nome: "Capítulo Mudo", desc: "Termine um capítulo sem que o Inspetor te ouça nenhuma vez.", secreta: true },
    { id: "l5_surda", nome: "Surda por uma Noite", desc: "Termine a campanha no modo Caçada Limpa.", secreta: true }
  ],

  // --- linhas de pausa (giro curto, igual aos outros lotes)
  pausa: [
    "Escute o apito: um, todos na cama; dois, ninguém respira.",
    "Ele reza de vez em quando. Nessas pausas ele ouve pela metade.",
    "Sangue fresco o chama. Cure-se longe.",
    "Às vezes ele só finge ir embora.",
    "A Menina só anda quando a luz sai de cima dela. Não pisque.",
    "Na parede ele cola o ouvido: fique imóvel até os passos seguirem."
  ]
};
