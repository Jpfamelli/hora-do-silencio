// TEXTO DA PROGRESSÃO — Lote 5, 2ª rodada (monstros): modos de rejogo (Vigília, Perseguição,
// Caçador Único), memória do Inspetor entre noites (ronda onde você morreu, seu canto favorito),
// placar de contra-jogos, recordes de bravura (tempo colado, caçada sem esconderijo), acervo das
// noites por humor, a carta do Davi na terceira morte no mesmo lugar e conquistas novas de contra-jogo.
// Lido por src/progressao-lote5b.js. Aspas já tipográficas (carrega depois do roteiro.js).
window.ROTEIRO.progressao = window.ROTEIRO.progressao || {};
window.ROTEIRO.progressao.lote5b = {

  // --- modos de rejogo (desbloqueados ao terminar a campanha uma vez)
  modos: {
    titulo: "Modos da caça",
    aviso: "Jeitos novos de enfrentar o Inspetor, para quem já domina os contra-jogos. Ligam no próximo capítulo.",
    trancado: "termine a campanha uma vez para liberar",
    lista: [
      { id: "l5vigilia", nome: "Vigília", desc: "ele nunca recua nem vai embora: a pressão de base jamais cede", liga: "Vigília ligada: ele não vai dar as costas pra você." },
      { id: "l5persegue", nome: "Perseguição", desc: "mais rápido e com ronda curta; é gato-e-rato o capítulo inteiro", liga: "Perseguição ligada: corra, porque ele não para." },
      { id: "l5unico", nome: "Caçador Único", desc: "o cérebro dele fica todo ligado o tempo todo — um duelo limpo de furtividade", liga: "Caçador Único: só você e um cego que pensa rápido demais." }
    ],
    desliga: "Modo desligado.",
    ativos: "modos da caça: {n}",
    recordePerseguicao: "Mais tempo na Perseguição: {t}",
    semRecorde: "Nenhuma perseguição aguentada ainda."
  },

  // --- memória do Inspetor entre noites
  memoria: {
    rondaMorte: "Ele está rondando onde te pegou da última vez. Não volte pra lá.",
    cantoFavorito: "Ele começou a noite parado perto de um {tipo}. Você se escondeu demais nesses.",
    tipoArmario: "armário",
    tipoCama: "cama",
    tipoEstatua: "canto",
    aprendeu: "Ele aprendeu seu caminho. Hoje caça nos seus corredores de ontem."
  },

  // --- placar de contra-jogos (defesas que a Lia já usou)
  contra: {
    titulo: "Contra-jogos",
    aviso: "As defesas que você já usou contra ele. Domine todas numa só noite.",
    noite: "Nesta noite você usou {n} de {t} defesas.",
    completoNoite: "Nesta noite você usou todas as defesas que conhece.",
    recorde: "Recorde numa noite: {n} de {t}.",
    lista: [
      { id: "esconder", nome: "O esconderijo", dica: "armário, cama ou nicho antes do bote." },
      { id: "folego", nome: "Prender o ar", dica: "ESPAÇO: ele vasculha e não te escuta respirar." },
      { id: "estatua", nome: "Virar estátua", dica: "imóvel, agachada e no escuro contra a parede." },
      { id: "garrafa", nome: "A garrafa", dica: "G: quebra a linha de som e o manda pro lado errado." },
      { id: "escuro", nome: "Apagar a luz", dica: "a lanterna apagada não ajuda ele, mas liberta a Menina." },
      { id: "agachar", nome: "Agachar e andar devagar", dica: "C e ALT: menos ruído enquanto ele está perto." },
      { id: "pontocego", nome: "O ponto cego", dica: "colada atrás dele, ele não te ouve." }
    ]
  },

  // --- recordes de bravura
  recordes: {
    colado: "Mais tempo colada nele sem morrer",
    coladoVazio: "—",
    cacada: "Maior caçada sobrevivida sem se esconder",
    folego: "Mais tempo prendendo o ar numa caçada"
  },

  // --- acervo das noites por humor
  noites: {
    titulo: "Noites do Inspetor",
    aviso: "Cada humor que você já enfrentou e sobreviveu. Troque os códigos de noite com quem joga.",
    selo: "Noite do {nome}",
    contagem: "sobrevividas: {n}",
    nenhuma: "ainda não sobrevivida",
    farejador: "Ouvido no Chão",
    ouvinte: "Ouvido Afiado",
    guardiao: "Que Não Larga"
  },

  // --- a carta do Davi: morrer três vezes no mesmo lugar
  davi: {
    linhas: [
      "(uma letra de criança, no canto da tela) aqui ele me pegou também. não fica parada.",
      "(rabiscado com força) eu morri nesse canto duas vezes. da terceira eu corri. corre.",
      "(quase apagado) esse lugar é dele. ele sempre volta pra cá. anda."
    ]
  },

  // --- lápide compartilhável
  lapide: {
    pegou: " · mais te pegou: {icone} {nome} ({n})",
    icones: { inspetor: "◆", ana: "✚", procissao: "†", chamado: "…" }
  },

  // --- linhas de fim de capítulo
  fim: {
    semPio: "Capítulo inteiro sem ele caçar você uma vez sequer.",
    semArmario: "Capítulo inteiro sem um armário: só camas, cantos e sangue-frio.",
    ninar: "Você passou pelo nicho e ele continuou dormindo em pé.",
    semIsca: "Você não mordeu o lampião-isca uma vez sequer.",
    pontoCego: "Você atravessou salas coladinha nas costas dele.",
    vigilia: "Capítulo vencido na Vigília, sem ele recuar nenhuma vez.",
    colado: "Você aguentou {t} colada nele sem morrer."
  },

  // --- diagnósticos extras de morte
  diag: {
    rondaMorte: "Ele voltou pro lugar onde já tinha te pego. Era de se esperar.",
    vigilia: "Na Vigília ele nunca ia embora. Você esperou um recuo que não vem.",
    persegue: "Na Perseguição parar é morrer. Devia ter continuado correndo.",
    isca: "Você foi até o lampião. Ele largou de propósito e esperou."
  },

  // --- pausa (giro curto)
  pausa: [
    "Colada atrás dele, no ponto cego, ele não te escuta.",
    "Ele volta pro lugar onde já te pegou. Mude de rota.",
    "Na falsa partida, fique imóvel: os passos somem, mas ele fica.",
    "Cada defesa conta: esconder, prender o ar, estátua, garrafa, escuro.",
    "No nicho do Cap. IV, não respingue na poça: ele dorme de olhos abertos."
  ],

  // --- conquistas novas (contra-jogo e monstros)
  conquistas: [
    { id: "l5b_pelas_costas", nome: "Pelas Costas do Cego", desc: "Atravesse uma sala colada atrás do Inspetor, no ponto cego, sem ele perceber.", secreta: true },
    { id: "l5b_sabe_nome", nome: "Ele Sabe Meu Nome", desc: "Com seu nome na ficha, fique imóvel até ele sussurrar e desistir.", secreta: true },
    { id: "l5b_sem_pio", nome: "A Noite Sem Um Pio", desc: "Passe um capítulo inteiro sem que ele chegue a caçar você.", secreta: true },
    { id: "l5b_ninar", nome: "Ninar o Monstro", desc: "Atravesse o nicho dos túneis (Cap. IV) sem acordá-lo.", secreta: true },
    { id: "l5b_ultima_badalada", nome: "A Última Badalada", desc: "Vença o sino sem soltar a corda nem levar o bote.", secreta: true },
    { id: "l5b_so_camas", nome: "Só Camas e Estátua", desc: "Termine um capítulo sem se esconder em nenhum armário.", secreta: true },
    { id: "l5b_fantasma", nome: "Caçador Silencioso", desc: "Termine um capítulo sem disparar uma caça: só ronda e investiga.", secreta: true },
    { id: "l5b_sem_isca", nome: "Nunca Mordi a Isca", desc: "Passe o Capítulo IV sem cair no lampião-isca.", secreta: true },
    { id: "l5b_nervos", nome: "Nervos de Aço", desc: "Engane a falsa partida ficando imóvel três vezes numa mesma noite.", secreta: true },
    { id: "l5b_contra_jogos", nome: "Caderno de Defesas", desc: "Use todas as defesas que conhece numa só noite.", secreta: true },
    { id: "l5b_colada", nome: "Pele e Osso", desc: "Aguente dez segundos colada nele, sem morrer.", secreta: true },
    { id: "l5b_vigilia", nome: "Sem Trégua", desc: "Vença um capítulo no modo Vigília.", secreta: true },
    { id: "l5b_persegue", nome: "Fôlego de Corredor", desc: "Aguente três minutos no modo Perseguição.", secreta: true },
    { id: "l5b_unico", nome: "Duelo Limpo", desc: "Termine a campanha no modo Caçador Único.", secreta: true },
    { id: "l5b_noites", nome: "Colecionador de Noites", desc: "Sobreviva a três noites de cada humor do Inspetor." }
  ],

  // --- memória do título / rádio
  titulo: {
    ronda: "Ela sonha com o corredor onde ele a pegou.",
    defesas: "Melhor noite: {n} defesas diferentes contra ele."
  }
};
