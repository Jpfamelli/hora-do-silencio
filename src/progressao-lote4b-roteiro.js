// TEXTO DA PROGRESSÃO — Lote 4 (segunda rodada de segredos): novos códigos do título, modos de luz
// (vela, lembrança, festa), lanternas extras, telefones internos, álbum de figurinhas, caça ao tesouro em
// versinhos, mapa de giz dos segredos, livro de visitas, carteirinha do Clube do Silêncio, selo de explorador,
// placa de bronze, ocorrências por data e conquistas novas. Lido por src/progressao-lote4b.js.
// Este arquivo carrega depois do roteiro.js — aspas já tipográficas.
window.ROTEIRO.progressao = window.ROTEIRO.progressao || {};
window.ROTEIRO.progressao.lote4b = {
  // ---- novos códigos digitados no título
  codigos: {
    vela: "A lanterna apagou. Ficou só uma vela curta, quente, que treme se você corre. (modo Vela)",
    marco: "Tudo ficou cor de foto velha. É março de 1979 de novo, antes do fogo. (Noite da Lembrança)",
    festa: "Bandeirinhas chamuscadas no pátio. Alguém ainda quis fazer festa. (Noite de Festa)",
    corvo: "Um bicho preto bateu na janela e deixou uma lanterna fria no peitoril. (lanterna do Corvo liberada)",
    onibus: "O último ônibus das nove parou lá fora. O farol dele é seu agora. (lanterna Farol liberada)",
    dez: "Você contou até dez. O sino respondeu dez vezes. A Hora Dobrada existe mesmo."
  },
  // ---- modos de luz extras (entram no painel Modos, abaixo dos do lote 4)
  modos: {
    vela: "Noite da Vela", velaDesc: "a tela ganha o calor curto e trêmulo de uma vela",
    lembranca: "Noite da Lembrança", lembrancaDesc: "tudo em tom de foto de 1979",
    festa: "Noite de Festa", festaDesc: "um calor de lampião de festa junina por cima de tudo"
  },
  // ---- lanternas extras (a cor tinge o véu da tela)
  lanternas: [
    { id: "corvo", nome: "Lanterna do Corvo", desc: "vidro escuro, luz azul de petróleo.", cor: "#3f6f78", como: "digite CORVO no título" },
    { id: "farol", nome: "Farol do ônibus", desc: "branco-azulado, cone largo de estrada.", cor: "#9fb4c8", como: "digite ONIBUS no título" }
  ],
  // ---- telefones internos (aba Telefones): cada número atende quando a pista aparece no acervo
  telefones: {
    titulo: "A lista telefônica",
    aviso: "Cinco números espalhados pela noite. Disque os que você já achou.",
    naoAtende: "ninguém atende. ainda.",
    tarde: "este só atende tarde da noite, entre nove e dez.",
    lista: [
      { id: "posto", num: "(0124) 3-2140", quem: "Posto Serra", fala: "“Posto Serra, boa noite... quem é? ... tem alguém na linha?” Depois, só o chiado.", pista: "f5" },
      { id: "bispo", num: "(011) 2-9007", quem: "Secretaria do bispo", fala: "“A Diocese não comenta o caso do São Lázaro. Por favor, não ligue mais.” Clique.", pista: "n12" },
      { id: "mae", num: "(0124) 3-1503", quem: "Casa da mãe da Lia", fala: "“Lia? ... Lia, é você? Eu deixei a luz acesa pra você voltar.” A voz some.", pista: "p3" },
      { id: "correio", num: "(0124) 3-7719", quem: "Agência dos Correios", fala: "“Encomenda devolvida: destinatário transferido em 1979. Remetente: D. Moraes.”", pista: "p4" },
      { id: "respira", num: "(----) -----", quem: "número sem dono", fala: "Alguém atende e não fala. Só respira, junto com você, no mesmo compasso.", pista: "n11", tarde: true }
    ],
    conq: "Lista Telefônica: você discou os cinco números."
  },
  // ---- álbum de figurinhas (aba Álbum): uma por capítulo, cola sozinha ao achar a lore
  album: {
    titulo: "Álbum do Davi",
    aviso: "O Davi desenhou uma figurinha por capítulo. Cada uma cola quando você acha o que ele escondeu lá.",
    vazio: "— falta —",
    dourada: "FIGURINHA DOURADA",
    douradaDesc: "a que não existe no álbum de verdade.",
    completo: "Álbum cheio. Na última página, as quatro crianças de mãos dadas — e uma sombra alta atrás, com um X em cada olho.",
    figuras: [
      { id: "estrada", nome: "o ônibus velho", pista: "f5" },
      { id: "terreo", nome: "a lâmpada apagada", pista: "f1" },
      { id: "capela", nome: "o sino", pista: "p1" },
      { id: "menina", nome: "a amarelinha", pista: "f2" },
      { id: "tuneis", nome: "a válvula", pista: "f3" },
      { id: "cemiterio", nome: "a cruz de giz", pista: "n11" }
    ],
    conq: "A Lata Inteira: complete o álbum do Davi."
  },
  // ---- caça ao tesouro em versinhos (aba Caça): rima por segredo, riscada quando achado
  tesouro: {
    titulo: "A caça do verso do gibi",
    aviso: "No verso do gibi, o Davi deixou seis versinhos. Cada um se risca quando você acha o segredo.",
    versos: [
      { id: "estrada", txt: "Na estrada que ninguém mais usa, / dorme um motor que não recusa." },
      { id: "terreo", txt: "Onde a luz foi embora primeiro, / espere, e escute o corredor inteiro." },
      { id: "capela", txt: "Conte até nove e não mais um, / senão o sino chama alguém." },
      { id: "menina", txt: "Quem pula a casa e não a linha / acha o que a menina adivinha." },
      { id: "tuneis", txt: "Lá embaixo, na ordem da fita, / abre a gaveta que grita." },
      { id: "cemiterio", txt: "Na terceira cova, de giz, / lê o nome que ninguém quis." }
    ],
    conq: "Caça ao Tesouro: risque os seis versinhos."
  },
  // ---- mapa de giz dos segredos (aba Mapa)
  mapa: {
    titulo: "A planta de giz",
    aviso: "Uma janelinha acesa por lore achada em cada ala. Onde ainda tem escuro, ainda tem coisa.",
    fosforo: "Gaste um fósforo numa ala escura para uma charada.",
    semFosforo: "Sem fósforos. Ache mais um na noite para pedir uma charada.",
    charadas: {
      estrada: "“onde o motor dorme, há luz pra quem insiste.”",
      terreo: "“a casa fala baixo pra quem fica parado.”",
      superior: "“a menina guarda uma coisa onde ela conta.”",
      tuneis: "“a gaveta certa só abre na ordem certa.”",
      cemiterio: "“a última cova lembra de todo mundo.”"
    },
    conq: "A Planta Inteira: acenda todas as janelinhas da planta de giz."
  },
  // ---- livro de visitas (aba Visitas)
  visitas: {
    titulo: "O livro de visitas",
    aviso: "Uma linha por noite que você passou aqui.",
    linha: "{n}ª noite — {nome}",
    davi: "Davi Moraes — voltou também.",
    conq: "Quem Volta: assine o livro na sua nona noite."
  },
  // ---- carteirinha do Clube do Silêncio (final)
  carteirinha: "Carteirinha do Clube do Silêncio — sócia nº {n}. Assinada, torta, por três crianças de 1979.",
  // ---- mapa de giz no capô (final)
  capo: "No capô molhado do carro, alguém desenhou o São Lázaro de cima a giz, com um X em cada canto que você já achou.",
  // ---- selo de explorador no fim do capítulo
  selo: {
    casinhas: "segredos deste mapa:",
    dica: "ainda escondido:",
    tudo: "Olho Vivo: você achou tudo deste mapa numa passada só."
  },
  // ---- placa de bronze (título, depois do final verdadeiro)
  placa: "No portão, uma placa de bronze nova: “{nome} — a Hora acabou aqui.”",
  // ---- contador secreto no título
  fosforos: "Lugares que não existem: {n}. Ou mais.",
  // ---- linhas de pausa extras (alternam com as do lote 4)
  pausa: [
    "No canto da página, a giz: “conta comigo até nove.”",
    "No canto da página: “a vela dura menos que a coragem.”",
    "No canto da página: “ninguém some de vez. só muda de andar.”"
  ],
  // ---- linha extra na tela de morte
  morte: {
    recorde: "mais uma pra parede. a Celeste anotou.",
    primeira: "a primeira vez a gente nunca esquece."
  },
  // ---- boatos novos (entram no mural do lote 4)
  boatosNovos: [
    { id: "vela", txt: "dizem que, à luz de vela, a casa fica mansa — por engano." },
    { id: "festa", txt: "dizem que teve festa junina na noite do fogo." },
    { id: "onibus", txt: "dizem que o último ônibus das nove ainda passa." },
    { id: "corvo", txt: "dizem que um corvo entrega lanternas a quem fica." }
  ],
  // ---- ocorrências por data (entram no livro do lote 4)
  ocorrenciasNovas: [
    { id: "criancas", txt: "entrar no Dia das Crianças, 12 de outubro." },
    { id: "junina", txt: "entrar na noite de São João, 24 de junho." },
    { id: "natal", txt: "entrar na véspera ou no dia de Natal." },
    { id: "reveillon", txt: "entrar na virada do ano." },
    { id: "finados", txt: "entrar no Dia de Finados, 2 de novembro." }
  ],
  // ---- conquistas novas
  conquistas: [
    { id: "l4b_vela", nome: "À Luz de Vela", desc: "Ligue a Noite da Vela.", secreta: true, charada: "O que dura menos que a coragem." },
    { id: "l4b_marco", nome: "Cor de 1979", desc: "Ligue a Noite da Lembrança.", secreta: true, charada: "O mês que a casa não esquece." },
    { id: "l4b_festa", nome: "Festa no Escuro", desc: "Ligue a Noite de Festa.", secreta: true, charada: "Bandeirinha chamuscada." },
    { id: "l4b_corvo", nome: "O Corvo", desc: "Digite CORVO no título.", secreta: true, charada: "O bicho preto que bate na janela." },
    { id: "l4b_onibus", nome: "Último Ônibus", desc: "Digite ONIBUS no título.", secreta: true, charada: "Ele passa às nove e não para." },
    { id: "l4b_dez", nome: "A Hora Dobrada", desc: "Digite DEZ no título.", secreta: true, charada: "Uma badalada a mais do que devia." },
    { id: "l4b_telefones", nome: "Lista Telefônica", desc: "Disque os cinco números internos.", secreta: true, charada: "Cinco linhas, uma só respira." },
    { id: "l4b_album", nome: "A Lata Inteira", desc: "Complete o álbum de figurinhas do Davi.", secreta: true, charada: "Uma figurinha por capítulo." },
    { id: "l4b_tesouro", nome: "Caça ao Tesouro", desc: "Risque os seis versinhos do gibi.", secreta: true, charada: "Rimas no verso do gibi." },
    { id: "l4b_mapa", nome: "A Planta Inteira", desc: "Acenda todas as janelinhas da planta de giz.", secreta: true, charada: "Cada ala tem a sua luz." },
    { id: "l4b_visitas", nome: "Quem Volta", desc: "Assine o livro de visitas na nona noite.", secreta: true, charada: "Nove noites e uma assinatura de criança." },
    { id: "l4b_carteirinha", nome: "Sócia do Clube", desc: "Ganhe a carteirinha do Clube do Silêncio num final.", secreta: true, charada: "Três assinaturas tortas." },
    { id: "l4b_tres_caminhos", nome: "Três Caminhos", desc: "Veja os três finais do São Lázaro.", secreta: true, charada: "Toda estrada dá num portão diferente." },
    { id: "l4b_primeira", nome: "Primeira Noite", desc: "Termine a campanha ao menos uma vez.", secreta: false, charada: "O começo de tudo." },
    { id: "l4b_veterana", nome: "Dez Noites", desc: "Comece dez noites no São Lázaro.", secreta: true, charada: "Uma a mais do que as badaladas." },
    { id: "l4b_maratona", nome: "Maratona", desc: "Passe cinco horas somadas dentro do internato.", secreta: true, charada: "Metade de uma folga." },
    { id: "l4b_antes", nome: "Antes da Hora", desc: "Toque o sino do Capítulo V bem rápido.", secreta: true, charada: "Chegar antes das nove." },
    { id: "l4b_recorde", nome: "Igual à Mãe", desc: "Bata seu recorde de tempo total.", secreta: true, charada: "Correr como quem já correu daqui." },
    { id: "l4b_calendario", nome: "Calendário", desc: "Jogue em três datas marcadas diferentes.", secreta: true, charada: "A casa repara nas datas." },
    { id: "l4b_explorador", nome: "Olho Vivo", desc: "Ache toda a lore de um mapa numa passada só.", secreta: true, charada: "Nada escapou naquele andar." }
  ]
};
// Junta as conquistas novas e espalha boatos/ocorrências novos nas listas do lote 4 (sem duplicar).
(() => {
  const P = window.ROTEIRO.progressao, B = P.lote4b;
  P.conquistas = P.conquistas || [];
  for (const c of B.conquistas) if (!P.conquistas.some(x => x.id === c.id)) P.conquistas.push(c);
  if (P.lote4) {
    const bo = (P.lote4.boatos = P.lote4.boatos || {}); bo.lista = bo.lista || [];
    for (const b of B.boatosNovos) if (!bo.lista.some(x => x.id === b.id)) bo.lista.push(b);
    const oc = (P.lote4.ocorrencias = P.lote4.ocorrencias || {}); oc.lista = oc.lista || [];
    for (const o of B.ocorrenciasNovas) if (!oc.lista.some(x => x.id === o.id)) oc.lista.push(o);
    const la = (P.lote4.lanternas = P.lote4.lanternas || {}); la.lista = la.lista || [];
    for (const l of B.lanternas) if (!la.lista.some(x => x.id === l.id)) la.lista.push(l);
  }
})();
