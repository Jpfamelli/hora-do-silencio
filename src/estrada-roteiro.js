// Texto do PRÓLOGO (estrada) que é novo no Lote 1. Fica num arquivo separado para não conflitar
// com quem mexe no roteiro.js. As chaves de "falas" são mescladas em window.ROTEIRO.falas (só as que faltam).
// {d1}..{d4} são trocados pelos dígitos do cofre na hora de mostrar.
export const TXT = {
  falas: {
    pegadas: [{ quem: "lia", texto: "Pegadas. Descalças. Do carro até o mato... isso não é pé de gente." }],
    maos_vidro: [{ quem: "lia", texto: "Marcas de mão. Do lado de DENTRO do vidro. Eu tava sozinha no carro." }],
    calendario: [{ quem: "lia", texto: "Março de 1979. O mês do incêndio. Por que alguém deixaria isso aqui?" }],
    vulto_parou: [{ quem: "lia", texto: "Ele parou. Quando eu olho, ele para." }],
    vulto_carro: [{ quem: "lia", texto: "O carro... tem alguém parado na frente dos faróis." }],
    vulto_pegou: [{ quem: "lia", texto: "Eu tava quase no portão. Como eu voltei pra cá?" }],
    janela: [{ quem: "lia", texto: "Tem alguém na janela lá em cima. Olhando pra cá." }],
    fone_mudo: [{ quem: "lia", texto: "O fone tá fora do gancho. E mesmo assim tocou." }]
  },
  // ligações do orelhão do posto
  orelhao: {
    normal: [
      { quem: "davi", texto: "(respiração do outro lado da linha) ...Lia?" },
      { quem: "davi", texto: "O quadro de chaves... {q}. Não corre lá dentro. Ele escuta tudo." },
      { quem: "davi", texto: "(chiado) ...{d3}... {d1}... (chiado) ...{d4}... {d2}..." },
      { quem: "radio", texto: "(a linha cai)" }
    ],
    zerou: [
      { quem: "lia", texto: "(a sua própria voz, mais velha) ...Você voltou." },
      { quem: "lia", texto: "Eu também volto. Toda noite eu volto pra essa estrada." },
      { quem: "lia", texto: "Dessa vez, não deixa ele te ouvir chegar." },
      { quem: "radio", texto: "(a linha cai)" }
    ],
    pesadelo: [
      "Lia, não responde quando te chamarem.",
      "Volta pro carro. Volta pro carro. Volta pro carro.",
      "A gente tá te vendo da janela, Lia.",
      "Ele já sabe o seu nome.",
      "Você demorou quinze anos. Ele não vai esperar mais um minuto."
    ],
    segunda: [
      { quem: "inspetor", texto: "(uma voz grave, bem perto do fone) Eu ouvi você chegar." }
    ],
    mudo: "(só chiado)",
    nove: [
      { quem: "ana", texto: "(bem baixinho) Um... dois... três... quatro... cinco..." },
      { quem: "ana", texto: "...seis... sete... oito... nove... dez." },
      { quem: "ana", texto: "Achei você." }
    ]
  },
  // estações do rádio do carro (prólogo e abertura)
  radio: [
    { quem: "radio", texto: "(noticiário antigo) ...Rádio Serra, março de 1979. O incêndio no Internato São Lázaro deixou três crianças desaparecidas..." },
    { quem: "ana", texto: "(uma criança conta de trás pra frente) Dez... nove... oito... sete..." },
    { quem: "radio", texto: "(chiado e um sino ao longe. Nove badaladas.)" },
    { quem: "inspetor", texto: "(estação muda. Depois, bem perto do alto-falante) Eu ouvi você." }
  ],
  radioSecreto: { quem: "davi", texto: "(frequência fora do dial) Lia... a fita que eu te mandei, eu gravei ontem. Pra mim faz quinze anos que é ontem." },
  // conversa resumida do Seu Joaquim a partir da segunda partida (ele lembra de você)
  joaquimCurto: [
    { quem: "joaquim", texto: "Você de novo, moça. Toda noite você chega por essa estrada." },
    { quem: "joaquim", texto: "Leva as regras. A chave tá no prego, atrás de você. E não corre lá dentro." }
  ],
  dicaVulto:"Ele só anda quando você não está olhando. E ele ouve quando você corre.",
  dicaCena: "ENTER pula a cena"
};
export function mesclarTexto(R) {
  if (!R || !R.falas) return;
  for (const k in TXT.falas) if (!R.falas[k]) R.falas[k] = TXT.falas[k];
}
