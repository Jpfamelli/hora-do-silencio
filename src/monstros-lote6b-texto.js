// MONSTROS E IA, lote 6 (2a rodada) — texto da rejogabilidade das entidades: calçado, brincadeiras da Ana,
// Procissão que muda, Chamado verdadeiro, Inspetor que dorme, máscara, faro, Seguidora, cão e Nêmesis.
// Importado por src/monstros-lote6b.js. As conquistas novas entram em window.ROTEIRO.conquistas na importação.
export const TXB = {
  // calçado do Inspetor (dito uma vez por noite, quando ele passa perto)
  calcado: {
    bota: '(Hoje ele está de bota ferrada. Dá para ouvir de longe.)',
    chinelo: '(Chinelo. Ele arrasta e estala a cada passo.)',
    meia: '(Hoje ele está de meia. Só as chaves dele me avisam.)',
    tamanco: '(Tamanco de madeira. Cada passo faz eco.)'
  },
  // regra da brincadeira da Ana: ela mesma conta no começo
  anaRegra: {
    curta: 'Hoje a gente conta só até oito.',
    longa: 'Hoje a gente conta até doze, bem devagar.',
    luz: 'Só vale contar com a luz acesa.',
    inversa: 'Hoje eu só ando quando você olha pra mim.',
    perde: 'Eu me enrolo na conta, sabia?',
    gemea: 'Hoje eu trouxe uma amiga.'
  },
  anaPerde: ['Um, dois... não, espera.', 'Eu esqueci. Recomeço.', 'Pulei um? Não vale contar.'],
  anaIsca: '(Aquela não é ela. Não fez nenhum barulho.)',
  anaIscaFumaca: '(A outra virou fumaça. A luz me custou caro.)',
  anaAusente: '(Cadê ela? O silêncio está pior do que a contagem.)',
  anaAusenteVolta: 'Cheguei.',
  cantiga: {
    inspetor: 'A menina que se escondeu / o homem cego encontrou',
    ana: 'A menina que não olhou / a menina contou até dez',
    procissao: 'A menina fora da cama / a fila de velas levou',
    agarrao: 'A menina que se debateu / de mão em mão ficou',
    escondida: 'A menina no armário / não respirou direito',
    bote: 'A menina que correu / o bote alcançou',
    pilha: 'A menina sem pilha / ficou no escuro com ela'
  },
  // Procissão
  procFigura: '(Uma delas está olhando direto para mim.)',
  procFilaTorta: '(Ela me viu. E ficou quieta.)',
  procEncarou: '(Não devia ter ficado encarando.)',
  procAtraso: '(Passou o tempo... e nada. Ainda não acabou.)',
  procVolta: '(Ainda não acabou.)',
  procAtrasada: '(Tem uma ficando para trás. A última.)',
  procAtrasadaPune: '(A última da fila. Eu saí cedo demais.)',
  procAtrasadaOlha: 'Você está aí dentro.',
  procRegra: {
    ar: 'não respire',
    olhar: 'não olhe',
    luz: 'não faça luz',
    parar: 'não pare'
  },
  procPoupou: '(Elas passaram por mim. Fiz o que mandaram.)',
  procNome: '{nome}...',
  // Chamado
  chamadoVerdade: ['Lia... aqui.', 'Lia. Vem. Rápido.'],
  chamadoVerdadeLia: '(Era o Davi de verdade. Respirou antes de falar.)',
  chamadoVerdadePerdeu: '(Aquela voz respirou antes de chamar. Acho que era ele.)',
  chamadoFalso: '(Aquele chiado no ouvido esquerdo... a voz verdadeira não chia.)',
  // Inspetor
  dorme: '(Ele está dormindo na cadeira. Aquele ronco é dele.)',
  dormePilha: '(Uma pilha no bolso do casaco dele. Ele nem se mexeu.)',
  acorda: 'Quem...?',
  mascara: '(É a máscara do Albano. Ele não ouve passos hoje. Ele vê a luz.)',
  mascaraLuz: '(A luz o atraiu. Andar no escuro, só com o rádio.)',
  faro: '(Ele não ouve nada hoje. Ele fareja o meu rastro.)',
  faroAgua: '(Cruzei a água. Perdeu o meu cheiro.)',
  furiaAlta: '(Ele está de mau humor hoje.)',
  furiaBaixa: '(Ele parece mais manso hoje.)',
  irritado: ['Quem foi... quem foi...', 'De novo esse barulho.', 'Chega.'],
  contra: {
    garrafa: '(Ele mudou. A garrafa não engana como antes.)',
    esconder: '(Ele mudou. Está conferindo cada armário.)',
    ar: '(Ele mudou. Está esperando o meu fôlego acabar.)',
    correr: '(Ele mudou. Escuta a corrida de mais longe.)'
  },
  tipoVigia: '(Ele já sabe desse tipo de esconderijo.)',
  lacre: '(Fita preta e cadeado. Esse eu não posso usar mais.)',
  lacreAviso: 'Lacrado',
  rotaAntes: 'Você passou aqui antes.',
  duelo: '(Eles se conhecem.)',
  duelAna: 'Não é a sua vez.',
  sosia: ['(Ele está parado no fim do corredor. Não ouvi a chave.)', '(De novo um parado. Esse não tem as chaves.)', '(Já não sei qual é o verdadeiro.)'],
  sosiaOlhou: '(Não devia ter ficado olhando.)',
  eco: '(Passos... mas o eco vem do lado errado.)',
  ecoTonto: '(Saí cedo demais. Tudo girou.)',
  seguidora: '(Pegadas molhadas que brilham atrasadas. Alguém anda no meu rastro.)',
  seguidoraToca: '(Ela repetiu os meus passos e me alcançou.)',
  seguidoraSome: '(Perdeu o meu rastro. Troquei de rota a tempo.)',
  cao: '(Um cachorro. Ele não escuta, ele farejou o meu rastro.)',
  caoLate: 'AU! AU!',
  caoAgua: '(A água quebrou o rastro. O cachorro perdeu o cheiro.)',
  caoPorta: '(A porta fechada o parou.)',
  // Nêmesis
  nemesis: { inspetor: 'De novo você.', ana: 'De novo você...', procissao: 'de novo você' },
  nemesisMorte: { inspetor: 'Ele te pegou {n} vezes.', ana: 'Ela te pegou {n} vezes.', procissao: 'Elas te pegaram {n} vezes.' },
  nemesisMuda: '(Ele esqueceu de mim. Mas alguém ainda não.)'
};

try {
  const R = window.ROTEIRO;
  if (R && Array.isArray(R.conquistas)) {
    const novas = [
      { id: 'l6b_calcados', nome: 'De Olhos Fechados', desc: 'Reconheça o Inspetor de bota, chinelo, meia e tamanco pelo som dos passos.', secreta: true },
      { id: 'l6b_fila_torta', nome: 'Fila Torta', desc: 'Fique imóvel, de fôlego preso, enquanto a criança fora da fila olha para você.', secreta: true },
      { id: 'l6b_fila_indiana', nome: 'Fila Indiana', desc: 'Obedeça ao sussurro da Procissão e passe por ela sem se esconder.', secreta: true },
      { id: 'l6b_voz_verdade', nome: 'A Voz Verdadeira', desc: 'Siga o chamado que respira antes de falar: era mesmo o Davi.', secreta: true },
      { id: 'l6b_sono_leve', nome: 'Sono Leve', desc: 'Passe agachada pelo Inspetor dormindo sem acordá-lo.', secreta: true },
      { id: 'l6b_isca', nome: 'Quem É Quem', desc: 'Ilumine a Ana de mentira e faça ela virar fumaça.', secreta: true },
      { id: 'l6b_despistou', nome: 'Rastro Frio', desc: 'Despiste a Seguidora ou o cão trocando de rota.', secreta: true },
      { id: 'l6b_sosia', nome: 'O Outro', desc: 'Desvie do falso Inspetor sem encarar.', secreta: true },
      { id: 'l6b_nemesis', nome: 'Fim do Ciclo', desc: 'Vença um capítulo sem que a sua Nêmesis encoste em você.', secreta: true },
      { id: 'l6b_mascara', nome: 'No Escuro', desc: 'Termine um capítulo contra o Inspetor Mascarado sem ele te achar.', secreta: true }
    ];
    for (const c of novas) if (!R.conquistas.some(x => x.id === c.id)) R.conquistas.push(c);
  }
} catch (e) {}
