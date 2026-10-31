// Texto NOVO do Lote 6 (rejogabilidade do prólogo). Separado para não conflitar com roteiro.js,
// estrada-roteiro.js, estrada-segredos-texto.js nem estrada-monstros-texto.js.
// As falas entram em window.ROTEIRO.falas (só as que faltam) e as conquistas em window.ROTEIRO.conquistas.
export const TXT6 = {
  falas: {
    // --- a noite que lembra de você (rejogada) ---
    est6_conhece: [{ quem: "lia", texto: "Eu conheço essa estrada. Já desci dela antes. Meus pés sabem o caminho." }],
    est6_joaquim_volta: [{ quem: "joaquim", texto: "Você de novo, menina. Eu avisei. Mas quem é que escuta um velho que já morreu." }],
    est6_denovo: [{ quem: "lia", texto: "Cada noite a Serra muda um pouco. Como se não quisesse ser decorada." }],
    // --- boatos da noite no rádio (dica velada do clima) ---
    est6_boato_chuva: [{ quem: "radio", texto: "...e dizem que hoje a chuva engole os passos. Quem anda na Serra que ande rezando..." }],
    est6_boato_neblina: [{ quem: "radio", texto: "...a serração baixou cedo. Dizem que nela a gente vê o que não devia. Boa noite, ouvintes." }],
    est6_boato_seca: [{ quem: "radio", texto: "...noite seca, limpa, de ouvir longe. Dizem que em noite assim o sino viaja mais." }],
    // --- o achado da noite (balcão do posto) ---
    est6_achado_bilhete: [{ quem: "lia", texto: "Um bilhete amassado no balcão: \"não deixa a menina entrar — J.\". A tinta ainda tá fresca." }],
    est6_achado_foto: [{ quem: "lia", texto: "Uma foto no balcão. Três crianças de uniforme, de mãos dadas, na frente do portão. Ninguém sorrindo." }],
    est6_achado_pilha: [{ quem: "lia", texto: "Uma pilha de reserva largada no balcão. Alguém deixou pra mim. Ou pra outra pessoa como eu." }],
    est6_achado_fim: [{ quem: "lia", texto: "Já achei de tudo nesse balcão, noite após noite. O Seu Joaquim guardava lembrancinha pra cada uma que passava." }],
    // --- o vulto do Seu Joaquim morto, em ponto sorteado ---
    est6_morto: [{ quem: "lia", texto: "Ali... o Seu Joaquim. De pé na estrada, do mesmo jeito que estava sentado no posto. Mas o posto fica pra trás." }],
    est6_morto_volta: [{ quem: "lia", texto: "De novo ele. Nunca no mesmo lugar. Como se ensaiasse onde me assustar." }],
    // --- o quartinho de infância do Moacir (só depois do final verdadeiro) ---
    est6_porta_nova: [{ quem: "lia", texto: "Essa porta não estava aqui. Fundo do posto. E tem um número gravado na madeira — o mesmo do epílogo." }],
    est6_porta_codigo: [{ quem: "lia", texto: "O código do epílogo. Era isso que abria. Eu lembro agora." }],
    est6_porta_errado: [{ quem: "lia", texto: "Não é esse. O número certo eu só aprendi lá no fim de tudo." }],
    // --- a sala do zelador atrás do posto (rejogada) ---
    est6_zelador: [{ quem: "lia", texto: "Um quartinho do zelador. Um mapa de giz na parede: as rondas do Inspetor, risco por risco. E um bilhete do Seu Joaquim." }],
    est6_zelador_mapa: [{ quem: "lia", texto: "O giz mostra por onde ele passa, e a hora. Se eu guardar isso, lá dentro eu ando na brecha." }],
    // --- o porta-luvas como cofre de veterano (rejogada) ---
    est6_portaluvas: [{ quem: "lia", texto: "O porta-luvas tem fechadura de quatro números. O ano. O calendário do posto, o rádio... todos dizem o mesmo ano." }],
    est6_cofre_mae: [{ quem: "lia", texto: "Dentro: um bilhete da minha mãe. \"Se um dia você voltar, a luz boa fica aqui.\" E uma lanterna nova em folha." }],
    est6_cofre_errado: [{ quem: "lia", texto: "Não abriu. É o ano. Aquele ano que o posto inteiro ficou preso." }],
    // --- o carro de 1979 no acostamento (rejogada) ---
    est6_carro79: [{ quem: "lia", texto: "Esse carro não passava aqui antes. Capô amassado, placa de 1979. Alguém parou nessa curva e nunca mais saiu." }],
    est6_carro79_dentro: [{ quem: "lia", texto: "No banco de trás, uma fita e um carrinho azul. Os três iam pra escola nesse carro. Chegaram. Nenhum voltou." }],
    // --- o último ônibus de 1979, passivo (rejogada) ---
    est6_onibus: [{ quem: "lia", texto: "Lá no fundo da estrada... o último ônibus. Luzes nas janelas, crianças sentadas. Ele não para. Nunca mais parou." }],
    est6_onibus_passou: [{ quem: "lia", texto: "O ônibus sumiu na serração. A linha foi encerrada em março de 79. Mas ele ainda faz o trajeto." }],
    // --- atalho conhecido / rota rápida (rejogada) ---
    est6_atalho: [{ quem: "lia", texto: "Eu já sei o caminho curto. Cerca caída, barranco, direto no portão. Sem rodeio pela estrada." }],
    // --- recordes e desafios ---
    est6_recorde: [{ quem: "lia", texto: "Mais rápida que todas as outras noites. Eu tô ficando boa nisso. É isso que me assusta." }],
    est6_quieta: [{ quem: "lia", texto: "Atravessei a estrada inteira no escuro, sem acender nada. Ele não me ouviu uma vez." }],
    est6_veterana: [{ quem: "lia", texto: "Quantas vezes eu já desci essa estrada? Perdi a conta. A estrada não perdeu." }],
    // --- pensamento sorteado da noite (sabor que muda a cada semente) ---
    est6_noite_a: [{ quem: "lia", texto: "Hoje a Serra tá quieta demais. Até o quieto daqui tem jeito de aviso." }],
    est6_noite_b: [{ quem: "lia", texto: "Já sei de cor onde o chão range. Mas o chão aprende junto comigo." }],
    est6_noite_c: [{ quem: "lia", texto: "Toda noite eu desço de novo. Como se alguém rebobinasse a fita e mandasse eu repetir." }],
    est6_meteoro: [{ quem: "lia", texto: "Já peguei essa estrada na chuva, na serração e na seca. Ela nunca me recebe do mesmo jeito." }],
    est6_triade: [{ quem: "lia", texto: "Cumpri os três desafios da estrada. O medo virou treino. Isso devia me assustar mais." }]
  },
  conquistas: [
    { id: "est6_achados", nome: "Lembrancinhas da Serra", desc: "Ache os três achados do balcão do posto, em noites diferentes.", secreta: true },
    { id: "est6_onibus2", nome: "Linha Encerrada", desc: "Veja o último ônibus de 1979 passar ao fundo numa rejogada.", secreta: true },
    { id: "est6_quartinho", nome: "O Quarto do Menino", desc: "Entre no quartinho de infância do Moacir, depois do final verdadeiro.", secreta: true },
    { id: "est6_cofre", nome: "Cofrinho da Veterana", desc: "Abra o porta-luvas do carro com o código do Davi, numa rejogada.", secreta: true },
    { id: "est6_zelador", nome: "Mapa de Giz", desc: "Ache a sala do zelador atrás do posto, numa rejogada.", secreta: true },
    { id: "est6_carro79", nome: "A Curva de 1979", desc: "Ache o carro parado no acostamento, numa rejogada.", secreta: true },
    { id: "est6_speed", nome: "Travessia Rápida", desc: "Chegue ao portão do prólogo em menos de 90 segundos.", secreta: true },
    { id: "est6_quieta", nome: "No Escuro e Calada", desc: "Atravesse o prólogo sem acender a lanterna na estrada.", secreta: true },
    { id: "est6_veterana", nome: "Estrada de Cor", desc: "Jogue o prólogo cinco vezes.", secreta: true },
    { id: "est6_clima", nome: "Meteorologista da Serra", desc: "Jogue o prólogo na chuva, na serração e na noite seca.", secreta: true },
    { id: "est6_triade", nome: "Tríade da Estrada", desc: "Cumpra os três desafios da travessia (em qualquer noite).", secreta: true }
  ]
};
export function mesclarL6(R) {
  if (!R) return;
  if (R.falas) for (const k in TXT6.falas) if (!R.falas[k]) R.falas[k] = TXT6.falas[k];
  if (R.conquistas) for (const c of TXT6.conquistas) if (!R.conquistas.some(x => x.id === c.id)) R.conquistas.push(c);
}
