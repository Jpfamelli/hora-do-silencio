// INTERFACE — lote 6 (2ª rodada): todos os textos da rejogabilidade em um lugar só.
// Frases da morte comentada, observações da professora, diário automático da Lia, arquétipos, títulos de jogadora,
// quadrinhas das conquistas secretas, cartas de tarô, "sonhei que...", dicas de segredos. Só dados, nenhuma lógica de jogo.

export const CAT_NOMES = {
  andando: 'andando', correndo: 'correndo', escondida: 'escondida', parada: 'parada',
  dialogo: 'em diálogo', notas: 'lendo e anotando', morta: 'morta'
};
export const CAT_CORES = {
  andando: '#8a7f68', correndo: '#c0392b', escondida: '#3f6e9c', parada: '#6d6452',
  dialogo: '#9b7fb8', notas: '#c9a75a', morta: '#2b0f0d'
};
export const CAT_DICA = {
  correndo: 'Você passou muito tempo correndo. Correr é barulho de 20 metros: troque por andar devagar (ALT) onde não há pressa.',
  escondida: 'Boa parte do capítulo foi dentro de esconderijos. Esconder salva, mas o relógio do capítulo continua correndo.',
  parada: 'Muito tempo parada. Parar é silêncio, mas procure o próximo objetivo enquanto ele está longe.',
  dialogo: 'Muito tempo ouvindo falas. As falas repetidas podem ser puladas com E.',
  notas: 'Muito tempo lendo. Leia as notas com ele longe e use a aba Pistas do diário.',
  morta: 'O capítulo custou mortes. Cada retorno ao ponto salvo é tempo que você não recupera.',
  andando: 'Você manteve um passo constante. Para ganhar tempo, só cortando caminho entre os objetivos.'
};

// ---------------------------------------------------------------- morte comentada
// v: quem, passosAteArmario, lantT, agachPassos, corridaS, garrafas, kits, pilhas, bateria, vida, perdidoS, escondida, mortesCap, cap, ruido, pulos
export const MORTE_FRASES = [
  { p: 9, ok: v => v.armario != null && v.armario <= 6 && !v.escondida, t: v => `Você morreu a ${v.armario} ${v.armario === 1 ? 'passo' : 'passos'} de um esconderijo vazio.` },
  { p: 9, ok: v => v.armario != null && v.armario <= 3 && v.quem === 'proc', t: v => `A Procissão passou e o esconderijo mais perto estava a ${v.armario} ${v.armario === 1 ? 'passo' : 'passos'}. Faltou um segundo.` },
  { p: 8, ok: v => v.lantT >= 25 && v.quem === 'inspetor', t: v => `Você segurou a lanterna acesa por ${v.lantT} s antes do bote. Ele é cego: apague e escute.` },
  { p: 8, ok: v => v.lantT >= 25 && v.quem === 'ana', t: v => `A lanterna ficou ${v.lantT} s acesa, mas apontada para o lugar errado.` },
  { p: 8, ok: v => v.agachPassos >= 5 && v.quem === 'inspetor', t: v => `Ele ouviu o seu ${v.agachPassos}º passo agachada. Até o silêncio deixa rastro.` },
  { p: 8, ok: v => v.corridaS >= 4 && v.quem === 'inspetor', t: v => `Você correu ${v.corridaS} s dos últimos 10. O corredor inteiro ouviu.` },
  { p: 7, ok: v => v.corridaS >= 2 && v.quem === 'inspetor', t: v => `Dois passos largos demais: ${v.corridaS} s de corrida e ele soube onde você estava.` },
  { p: 8, ok: v => v.garrafas > 0 && v.quem === 'inspetor', t: v => `Morreu com ${v.garrafas} ${v.garrafas === 1 ? 'garrafa' : 'garrafas'} no bolso. Elas existem para ser jogadas (G).` },
  { p: 7, ok: v => v.kits > 0 && v.vida < 55, t: v => `Morreu com ${v.kits} ${v.kits === 1 ? 'curativo' : 'curativos'} sem usar. H cura em movimento.` },
  { p: 6, ok: v => v.pilhas > 0 && v.bateria < 18, t: v => `A lanterna estava em ${Math.round(v.bateria)}% e havia ${v.pilhas} ${v.pilhas === 1 ? 'pilha' : 'pilhas'} reserva. R troca.` },
  { p: 6, ok: v => v.bateria < 10 && v.quem === 'ana', t: v => `A lanterna piscou a ${Math.round(v.bateria)}% e cada piscada foi um passo dela.` },
  { p: 7, ok: v => v.escondida && v.quem === 'inspetor', t: () => 'Ele abriu o armário onde você prendia o ar. Faltou um instante de silêncio.' },
  { p: 7, ok: v => v.escondida && v.pulos > 0, t: v => `Você pulou ${v.pulos} ${v.pulos === 1 ? 'vez' : 'vezes'} nesta noite. Dentro do armário, cada pulo faz barulho.` },
  { p: 5, ok: v => v.perdidoS < 20, t: v => `Você perdeu só ${v.perdidoS} s de progresso. Respire e vá de novo.` },
  { p: 7, ok: v => v.perdidoS > 150, t: v => `Você vai refazer ${Math.floor(v.perdidoS / 60)} min. Da próxima vez, salve a calma antes do ponto salvo.` },
  { p: 8, ok: v => v.mortesCap >= 4, t: v => `Já são ${v.mortesCap} mortes neste capítulo. O lugar não mudou. Mude a rota.` },
  { p: 8, ok: v => v.mortesCap === 3, t: () => 'Terceira vez no mesmo trecho. Experimente fazer o oposto do que fez até agora.' },
  { p: 6, ok: v => v.mortesCap === 1 && v.cap >= 1, t: () => 'Primeira morte neste capítulo. Todo mundo aprende o corredor errado primeiro.' },
  { p: 6, ok: v => v.vida >= 90 && v.quem === 'inspetor', t: () => 'Você chegou ao fim com a vida cheia: ele só precisou de um golpe bem dado.' },
  { p: 7, ok: v => v.quem === 'proc' && v.armario != null && v.armario > 12, t: v => `A Procissão pegou você a ${v.armario} passos do esconderijo mais próximo. Escolha o armário antes do aviso.` },
  { p: 6, ok: v => v.quem === 'proc', t: () => 'As luzes piscaram e o rádio chiou. Esse é o único aviso que existe.' },
  { p: 6, ok: v => v.quem === 'ana' && !v.lanterna, t: () => 'Sem luz, a Menina anda. Luz nela, olho nela, passo para trás.' },
  { p: 6, ok: v => v.quem === 'ana', t: () => 'Ela contou até dez. Você contou até quanto?' },
  { p: 5, ok: v => v.quem === 'inspetor' && v.ruido >= 15, t: v => `Seu último barulho alcançou ${Math.round(v.ruido)} metros. Ele não precisou procurar.` },
  { p: 5, ok: v => v.quem === 'inspetor' && v.ruido > 0 && v.ruido < 3, t: () => 'Você estava quase em silêncio. Quem te achou foi a sorte dele, não o ouvido.' },
  { p: 4, ok: v => v.cap === 0, t: () => 'No prólogo ninguém devia morrer. A estrada não perdoa quem para.' },
  { p: 4, ok: v => v.cap === 1, t: () => 'No escuro da casa, o gerador é o único amigo e o único chamado.' },
  { p: 4, ok: v => v.cap === 2, t: () => 'Nove badaladas: a nona é a que conta.' },
  { p: 4, ok: v => v.cap === 3, t: () => 'No andar de cima o assoalho fala. Ouça antes de pisar.' },
  { p: 4, ok: v => v.cap === 4, t: () => 'Nos túneis, a água entrega os seus passos.' },
  { p: 4, ok: v => v.cap === 5, t: () => 'Depois do sino não há mais esconderijo: só caminho.' },
  { p: 3, ok: () => true, t: () => 'Foi rápido. Da próxima, escute os estalos antes de virar o corredor.' },
  { p: 3, ok: () => true, t: () => 'O internato sabe de cor o seu caminho. Dê a ele uma surpresa.' },
  { p: 3, ok: () => true, t: () => 'Cada morte é um mapa a mais na sua cabeça. Use este.' },
  { p: 3, ok: () => true, t: () => 'Você ouviu o aviso, mas ouviu tarde. Escute mais cedo.' }
];

// ---------------------------------------------------------------- Como a casa viu você (voz do Inspetor)
export const CASA_VIU = {
  correndo: ['Ela corre quando acha que está sozinha. Eu ouço cada pisada desde a porta.', 'Passos largos, respiração curta. Quem corre me conta onde está.'],
  escondida: ['Ela se esconde onde já se escondeu. Eu aprendi o caminho dos armários.', 'Cheirava a medo atrás da madeira. Esperei, e ela esperou comigo.'],
  parada: ['Ela fica parada demais. Parar é boa ideia até eu aprender a esperar também.', 'Quando ela para, eu ouço o coração. Não é silêncio, é compasso.'],
  dialogo: ['Ela escuta cada fala até o fim. Gosto de gente que escuta. Gosto mais de gente que desatenta.'],
  notas: ['Ela lê tudo. Deixei papéis pelo chão para isso: quem lê não escuta.'],
  morta: ['Eu a conheço pelo avesso, de tantas vezes que a encontrei.'],
  andando: ['Ela anda de modo regular, como quem decorou o caminho. É aí que erra.']
};
export const CASA_DICA = {
  correndo: 'Contra-jogo: ande devagar (ALT) nos corredores longos e corra só quando ele estiver longe.',
  escondida: 'Contra-jogo: varie o armário. Ele aprende o que você repete.',
  parada: 'Contra-jogo: quando ele estiver longe, aproveite para andar. A paciência dele é maior que a sua.',
  dialogo: 'Contra-jogo: nas falas repetidas aperte E e ganhe segundos.',
  notas: 'Contra-jogo: leia sempre com ele longe e use a aba Pistas do diário.',
  morta: 'Contra-jogo: mude a rota depois da segunda morte. Repetir o caminho é aprendê-lo.',
  andando: 'Contra-jogo: corte caminhos entre os objetivos; o relógio premia quem conhece atalhos.'
};

// ---------------------------------------------------------------- arquétipos (perfil de medo)
export const ARQUETIPOS = {
  corredora: { nome: 'A Corredora', frase: 'Você fugiu mais do que explorou. O medo mora nas pernas.', habito: 'Correr', oposto: { t: 'Noite Quieta: ande agachada ou devagar o capítulo todo.', mods: 'O', dif: 'normal', dica: 'Ouvido afiado: ele escuta 40% mais longe. Quem corre aprende a parar.' } },
  escondida: { nome: 'A Rata de Armário', frase: 'Você fez dos esconderijos a sua casa. Quase ninguém te vê, quase ninguém te perde.', habito: 'Esconder-se', oposto: { t: 'Noite Aberta: use no máximo dois esconderijos por capítulo.', mods: 'V', dif: 'normal', dica: 'Sem aviso: a Procissão chega sem o grito do rádio. Quem se esconde cedo ganha tempo.' } },
  silenciosa: { nome: 'A Sombra', frase: 'Você andou como quem pede desculpas ao chão. Ele quase não te ouviu.', habito: 'Demorar demais', oposto: { t: 'Noite Veloz: termine cada capítulo em menos de oito minutos.', mods: 'A', dif: 'normal', dica: 'Passo apressado: ele anda 12% mais rápido. Exige decisão, não só silêncio.' } },
  teimosa: { nome: 'A Teimosa', frase: 'Você morreu várias vezes e voltou pelo mesmo caminho. Isso é coragem ou hábito.', habito: 'Repetir a rota', oposto: { t: 'Noite de Rota Nova: troque o caminho depois de toda morte.', mods: '', dif: 'facil', dica: 'Fácil para respirar: experimente caminhos diferentes sem o peso da repetição.' } },
  imprudente: { nome: 'A Imprudente', frase: 'Você foi vista, pegou golpes e ainda assim seguiu. Corajosa até demais.', habito: 'Entrar na luz dele', oposto: { t: 'Noite Frágil: termine sem tomar um golpe.', mods: 'P', dif: 'normal', dica: 'Lanterna faminta: a pilha dura menos, e a atenção precisa durar mais.' } },
  sortuda: { nome: 'A Sortuda', frase: 'Escapou por pouco muitas vezes. A sorte também joga, mas não manda.', habito: 'Confiar na sorte', oposto: { t: 'Noite de Plano: escolha o esconderijo antes de cada perigo.', mods: 'OV', dif: 'normal', dica: 'Ouvido afiado e sem aviso: nada de improviso.' } },
  curiosa: { nome: 'A Curiosa', frase: 'Você leu tudo, abriu tudo e ouviu tudo. O internato agradece a visita.', habito: 'Bisbilhotar demais', oposto: { t: 'Noite Direta: só os objetivos, sem desvios.', mods: 'A', dif: 'normal', dica: 'Passo apressado: o internato não espera quem lê devagar.' } },
  observadora: { nome: 'A Observadora', frase: 'Ainda sem um traço forte. Joga de modo equilibrado e muda ao sabor da noite.', habito: 'Nenhum', oposto: { t: 'Noite de Contraste: tente um modo de cada vez.', mods: 'P', dif: 'normal', dica: 'Lanterna faminta como primeira regra da casa.' } }
};

// ---------------------------------------------------------------- boletim escolar
export const MATERIAS = ['Silêncio', 'Coragem', 'Pressa', 'Esconderijo', 'Atenção'];
export const OBS_PROF = {
  Silêncio: { alta: 'ouve bem e pisa com cuidado', baixa: 'pisa forte demais nos corredores' },
  Coragem: { alta: 'enfrenta o escuro sem pedir desculpas', baixa: 'treme antes do sino bater' },
  Pressa: { alta: 'resolve rápido o que lhe é pedido', baixa: 'demora demais nas tarefas' },
  Esconderijo: { alta: 'sabe a hora de se esconder', baixa: 'entra no armário quando já é tarde' },
  Atenção: { alta: 'lê tudo o que encontra', baixa: 'passa direto pelos recados' }
};
export const CIENTE = [
  { min: 0, t: 'ciente (assinatura tremida)' },
  { min: 5, t: 'ciente. Conversaremos em casa.' },
  { min: 7, t: 'ciente. Muito bem, minha filha.' },
  { min: 9, t: 'ciente e orgulhosa. Pode dormir de luz acesa.' }
];

// ---------------------------------------------------------------- títulos de jogadora
export const TITULOS = [
  { id: 'sombra', nome: 'A Sombra', desc: 'Terminar uma noite com ruído médio muito baixo.' },
  { id: 'pe_chumbo', nome: 'A Pé de Chumbo', desc: 'Terminar uma noite fazendo muito barulho.' },
  { id: 'voltou', nome: 'A Que Voltou', desc: 'Terminar uma noite depois de 5 ou mais mortes.' },
  { id: 'calou_sino', nome: 'A Que Calou o Sino', desc: 'Ver o final verdadeiro.' },
  { id: 'inteira', nome: 'A Inteira', desc: 'Terminar uma noite sem morrer.' },
  { id: 'imovel', nome: 'A Que Não Pulou', desc: 'Terminar uma noite sem pular de susto.' },
  { id: 'bibliotecaria', nome: 'A Bibliotecária', desc: 'Terminar uma noite com quase todas as notas lidas.' },
  { id: 'muda', nome: 'A Muda', desc: 'Passar um quarto da noite escondida.' },
  { id: 'veloz', nome: 'A Pressa Dele', desc: 'Terminar uma noite em menos de 45 minutos.' },
  { id: 'hospede', nome: 'A Hóspede', desc: 'Começar a primeira noite.' }
];
export const EPITETOS = {
  correndo: 'A que correu demais', escondida: 'A que se escondeu demais', parada: 'A que esperou demais', dialogo: 'A que ouviu demais',
  notas: 'A que leu demais', morta: 'A que voltou demais', andando: 'A que caminhou em linha reta'
};

// ---------------------------------------------------------------- diário automático da Lia (uma frase sorteada por categoria)
export const DIARIO_LIA = {
  abertura: ['Anotei tudo antes que o medo apagasse.', 'Escrevo com a lanterna na boca. A letra está tremida.', 'Se alguém ler isto: foi assim que aconteceu.'],
  esconde: n => n === 0 ? 'Não me escondi nenhuma vez.' : n === 1 ? 'Me escondi uma vez e foi suficiente.' : `Me escondi ${n} vezes. Cada armário tinha um cheiro.`,
  corri: s => s < 30 ? 'Quase não corri.' : `Corri ${Math.round(s / 60)} min no total e não recomendo.`,
  mortes: n => n === 0 ? 'Não morri. Por incrível que pareça.' : n === 1 ? 'Ele me achou uma vez. Só uma.' : `Ele me achou ${n} vezes. Eu voltei ${n}.`,
  ruido: r => r < 4 ? 'Andei devagar. Quase sem respirar.' : r < 7 ? 'Fiz o barulho de quem tem pressa.' : 'Contei meus passos e eles estavam altos demais.',
  pulos: n => n === 0 ? 'Não pulei com nada. Acho que o medo já estava dentro.' : n === 1 ? 'Pulei uma vez e quase derrubei o gravador.' : `Pulei ${n} vezes. Meu caderno tem rabiscos de susto.`,
  fecho: ['Amanhã, se houver, tento de novo mais calada.', 'Se o sino bater outra vez, eu não estou aqui.', 'Guardei este caderno debaixo do colchão.']
};

// ---------------------------------------------------------------- tarô da noite (cartas que ligam mutadores existentes)
export const TARO = [
  { id: 'torre', nome: 'A Torre', simbolo: 'Ⅷ', efeito: 'Passo apressado: ele anda mais rápido.', mods: 'A', dif: 'normal', desbloqueio: 'Comece sua primeira noite.', livre: true },
  { id: 'eremita', nome: 'O Eremita', simbolo: 'Ⅸ', efeito: 'Ouvido afiado: ele escuta mais longe, mas você ganha o aviso do silêncio.', mods: 'O', dif: 'normal', desbloqueio: 'Comece sua primeira noite.', livre: true },
  { id: 'lua', nome: 'A Lua', simbolo: 'ⅩⅧ', efeito: 'Lanterna faminta: a pilha dura a metade.', mods: 'P', dif: 'normal', desbloqueio: 'Comece sua primeira noite.', livre: true },
  { id: 'sino', nome: 'O Sino', simbolo: 'Ⅸ', efeito: 'Sem aviso: a Procissão chega calada.', mods: 'V', dif: 'normal', desbloqueio: 'Morra para a Procissão.', morrer: 'proc' },
  { id: 'menina', nome: 'A Menina', simbolo: 'Ⅰ', efeito: 'Fácil: mais fôlego para contar até dez.', mods: '', dif: 'facil', desbloqueio: 'Morra para a Menina Que Conta.', morrer: 'ana' },
  { id: 'cego', nome: 'O Cego', simbolo: 'Ⅻ', efeito: 'Ouvido afiado e passo apressado: o Inspetor em plena forma.', mods: 'OA', dif: 'normal', desbloqueio: 'Morra para o Inspetor.', morrer: 'inspetor' },
  { id: 'morte', nome: 'A Morte', simbolo: 'ⅩⅢ', efeito: 'Pesadelo: um golpe e acabou.', mods: '', dif: 'pesadelo', desbloqueio: 'Morra 10 vezes (em todas as noites).', mortes10: true },
  { id: 'juizo', nome: 'O Juízo', simbolo: 'ⅩⅩ', efeito: 'Todos os mutadores ligados.', mods: 'POAV', dif: 'normal', desbloqueio: 'Veja um final.', final: true }
];

// ---------------------------------------------------------------- "Hoje eu quero…"
export const HOJE = [
  { p: 'Hoje eu quero…', ops: [['medo', 'Medo de verdade'], ['calma', 'Algo tranquilo'], ['misterio', 'Descobrir coisas'], ['desafio', 'Um desafio de verdade']] },
  { p: 'Como eu quero andar?', ops: [['rapido', 'Depressa'], ['lento', 'Devagar, escutando']] },
  { p: 'Quanta gente vai ver?', ops: [['sozinho', 'Só eu'], ['amigos', 'Vou mandar para amigos']] }
];
export const SONHOS = [
  'Sonhei que o armário em que você se escondeu {armario} tinha uma porta do outro lado.',
  'Sonhei que o Inspetor contava até {n} baixinho e acertava.',
  'Sonhei que em {sala} todas as cadeiras estavam viradas para a parede.',
  'Sonhei que a Ana chamava você de volta, três vezes, com a voz de outra pessoa.',
  'Sonhei que o sino bateu dez vezes, e ninguém reparou.',
  'Sonhei que o gerador respirava.',
  'Sonhei que Davi dizia: não foi aqui que você me deixou.',
  'Sonhei que a lanterna me lembrava do seu nome.',
  'Sonhei que as paredes tinham o dobro da altura de ontem.'
];

// ---------------------------------------------------------------- quadrinhas das conquistas secretas
export const QUADRINHAS = [
  ['quem calça silêncio', 'escuta o que a madeira diz'],
  ['o que ficou na gaveta', 'volta quando ninguém vê'],
  ['a nona pergunta é a que conta', 'responda e feche os olhos'],
  ['onde a água canta', 'um segredo dorme embaixo'],
  ['quem conta até o fim', 'ganha o que a Menina guarda'],
  ['luz que não acende', 'esconde mãos de giz'],
  ['a chave que não cabe', 'abre o que ninguém esperava'],
  ['um nome riscado a lápis', 'ainda pesa no papel'],
  ['o relógio parado', 'sabe a hora da fila'],
  ['no fundo do armário', 'alguém deixou um aviso'],
  ['quem volta pela segunda vez', 'vê o que a primeira escondeu'],
  ['o sino bate, o sino cala', 'o silêncio é quem fala']
];

// ---------------------------------------------------------------- dicas de segredos (sem nomes), por mapa
export const DICA_MAPA = {
  estrada: ['Perto da estrada, papel esquecido.', 'Alguém deixou algo no balcão do posto.', 'A estrada guarda mais do que mostra.'],
  terreo: ['O térreo responde a barulho.', 'Algo no térreo só aparece quando a casa está quieta.', 'Procure onde a luz hesita.'],
  superior: ['No andar de cima, as camas têm memória.', 'Algo no sótão reage ao seu peso.', 'Um corredor do andar de cima tem dobra.'],
  tuneis: ['Nos túneis, a água esconde algo.', 'Olhe para baixo onde o chão é úmido.', 'O túnel norte sabe seu nome.'],
  cemiterio: ['No cemitério, as pedras são contadas.', 'Depois do sino, algo ainda espera.', 'Uma lápide não diz tudo.'],
  varia: ['Um segredo mora onde você já esteve.', 'Releia as notas: a resposta está em outra.', 'Algo só aparece na segunda jogada.']
};

// ---------------------------------------------------------------- rótulos de moldura das conquistas
export const MOLDURAS = [
  { id: 'bronze', nome: 'Bronze', cor: '#a8723a' },
  { id: 'prata', nome: 'Prata', cor: '#b9bec6' },
  { id: 'ouro', nome: 'Ouro', cor: '#e0bf5a' },
  { id: 'sangue', nome: 'Sangue', cor: '#b2322a' }
];
