// TEXTO DA PROGRESSÃO — Lote 4 (terceira rodada de segredos e easter eggs): novos códigos do título, modos de
// luz extras, lanternas cosméticas novas, abas novas do painel Segredos (Pertences, Placar, Recordes, Raras,
// Lendas), linhas de pausa/morte/final e conquistas novas. Lido por src/progressao-lote4c.js.
// Aspas já tipográficas (carrega depois do roteiro.js, que curva as aspas retas).
window.ROTEIRO.progressao = window.ROTEIRO.progressao || {};
window.ROTEIRO.progressao.lote4c = {
  // ---- códigos digitados no título
  codigos: {
    nevoa: "Uma névoa fria desceu da serra. A próxima noite acorda com neblina. (modo Névoa)",
    frio: "A temperatura caiu. Dá para ver o próprio bafo. A próxima noite é de inverno. (modo Frio)",
    brasa: "O incêndio de 1979 nunca apagou de todo. Sobra um brilho de brasa no ar. (modo Brasa e lanterna de brasa)",
    trocada: "Alguém trocou as regras de lugar. Dizem que, numa noite dessas, é a Menina quem ouve e o Inspetor quem enxerga.",
    manha: "Você escreveu MANHÃ. Lá no fim de tudo, quando não sobrar segredo nenhum, o sol nasce no São Lázaro. (continue procurando)",
    sete: "Sete badaladas. O relógio da recepção adiantou uma vez na história desta casa — e ninguém soube explicar.",
    faisca: "Faísca era o gato do internato. Sumiu na mesma noite que as crianças. Agora ele tem uma carta na casa.",
    girassol: "Plantaram um girassol no pátio em 1978. Dizem que ele ainda vira a cabeça para onde falta um segredo.",
    sino: "A badalada ficou na sua mão. (lanterna do sino liberada)"
  },
  // ---- modos de luz extras (seletor no painel Segredos → Modos)
  modos: {
    nevoa: "Noite de Névoa", nevoaDesc: "neblina fria cobre o fundo da tela",
    frio: "Noite de Inverno", frioDesc: "um azul gelado em tudo, como março de madrugada",
    brasa: "Noite de Brasa", brasaDesc: "um brilho laranja de fogo que respira ao fundo"
  },
  // ---- lanternas cosméticas novas
  lanternas: [
    { id: "giz", nome: "Lanterna de giz", desc: "branca-azulada, como pó de lousa.", cor: "#b8c4cf", como: "ganhe o selo de explorador de algum capítulo" },
    { id: "brasa", nome: "Lanterna de brasa", desc: "laranja viva, como carvão aceso.", cor: "#d1572a", como: "digite BRASA no título" },
    { id: "sino", nome: "Lanterna do sino", desc: "dourada, da cor da badalada.", cor: "#d8b24a", como: "veja o final verdadeiro" },
    { id: "rato", nome: "Lanterna do porão", desc: "esverdeada, de mofo e cano velho.", cor: "#7f9a5e", como: "reúna quinze peças do acervo" }
  ],
  // ---- aba Pertences (a lata de biscoito do Davi, 6 encaixes)
  pertences: {
    titulo: "Pertences",
    aviso: "A lata de biscoito do Davi. Um encaixe por capítulo. Nunca de catar duas vezes.",
    vazio: "silhueta vazia",
    completo: "A lata inteira. No final, o Davi tira uma coisa dela e devolve para você.",
    lista: [
      { id: "figurinha", ic: "✦", nome: "a figurinha", pista: "n2" },
      { id: "piao", ic: "◉", nome: "o pião", pista: "n6" },
      { id: "soldado", ic: "♟", nome: "o soldadinho", pista: "n9" },
      { id: "dente", ic: "◦", nome: "o dente de leite", pista: "p2" },
      { id: "gude", ic: "●", nome: "a bolinha de gude", pista: "n4" },
      { id: "estrela", ic: "★", nome: "a estrela de lata", pista: "f4" }
    ]
  },
  // ---- aba Placar (fliperama do posto)
  placar: {
    titulo: "Placar do posto",
    aviso: "O fliperama empoeirado da loja. A pontuação é o quanto você achou numa noite.",
    base: [["DAV", 6], ["ANA", 5], ["TOM", 4]],
    voce: "VOCÊ", ganhou: "DAV — VOCÊ GANHOU DE MIM",
    nota: "Pontos = peças do acervo achadas na sua melhor noite."
  },
  // ---- aba Recordes (melhores tempos por capítulo e selos)
  recordes: {
    titulo: "Recordes",
    aviso: "O seu melhor em cada capítulo. Vazio enquanto você não terminar.",
    semRank: "— ainda não jogado",
    capNomes: ["Prólogo — A Estrada", "I — Sem Luz", "II — Nove Badaladas", "III — A Menina Que Conta", "IV — Os Túneis", "V — A Hora"],
    tudoS: "Rank S em todos os capítulos. Lá no fim de tudo, amanhece.",
    rodape: "Rank melhor e tempo mais curto, somando todas as noites."
  },
  // ---- aba Raras (novas ocorrências raras)
  raras: {
    titulo: "Raras",
    aviso: "Coisas que quase ninguém faz. Marque as que já aconteceram com você.",
    lista: [
      { id: "sem_luz", txt: "terminar um capítulo inteiro sem acender a lanterna." },
      { id: "sem_correr", txt: "terminar um capítulo sem correr uma vez sequer." },
      { id: "cinco_noite", txt: "achar cinco peças do acervo numa só noite." },
      { id: "tres_mortes", txt: "morrer três vezes no mesmo capítulo e ainda assim passar." },
      { id: "madrugada", txt: "entrar no São Lázaro às três da manhã." },
      { id: "meia_noite", txt: "entrar no São Lázaro à meia-noite em ponto." },
      { id: "corrida_limpa", txt: "passar um capítulo sem dano e sem morrer." },
      { id: "sete_relampagos", txt: "contar sete relâmpagos numa mesma noite." }
    ]
  },
  // ---- aba Lendas (novos boatos com selo VIVIDO)
  lendas: {
    titulo: "Lendas",
    aviso: "Lendas que correm na serra. Quem viver, confere.",
    vivido: "VIVIDO",
    lista: [
      { id: "gato", txt: "dizem que um gato preto some quando a lanterna encosta nele." },
      { id: "retrato", txt: "dizem que a foto da turma tem menos rostos riscados a cada noite." },
      { id: "girassol", txt: "dizem que um girassol cresce de novo todo março no pátio." },
      { id: "sete", txt: "dizem que, uma vez, o relógio bateu só sete." },
      { id: "brasa", txt: "dizem que o fogo de 1979 ainda aquece a parede dos fundos." },
      { id: "manha", txt: "dizem que quem acha tudo vê o São Lázaro de dia, uma vez só." }
    ]
  },
  // ---- cartas novas (entram na aba Cartas do lote 4 via secretas)
  cartas: [
    { id: "faisca", nome: "Faísca, o gato", a: 7, v: 8, ve: 7, fraco: "ele foge da luz. Some quando a lanterna o pega. — D.", como: "digite FAÍSCA no título" },
    { id: "albano", nome: "Diretor Albano", a: 2, v: 9, ve: 3, fraco: "o antigo. Enxergava e trancava tudo. O fogo levou ele também. — D.", como: "ache o fundo falso da gaveta do diretor" }
  ],
  // ---- linhas de pausa (alternam com as do lote 4 / 4b)
  pausa: [
    "No pé da página, a lápis: “conta de novo, Lia. de um até dez.”",
    "No pé da página: “tem uma porta que só abre na segunda noite.”",
    "No pé da página: “o gato gostava de você.”",
    "No pé da página: “não foi culpa de ninguém. foi o fogo.”",
    "No pé da página: “amanhã tem sol. jura que tem.”"
  ],
  // ---- linhas da tela de morte
  morte: {
    nova: "Uma morte que você ainda não tinha visto. {n} de {t}.",
    todas: "Você já viu todos os jeitos de cair que esta casa conhece.",
    sala: "Foi aqui mesmo que te pegou da última vez."
  },
  // ---- linhas da tela de final
  final: {
    lata: "A lata do Davi: {n} de 6. Faltam coisas por achar.",
    lataCheia: "A lata inteira no banco do carona. Ele devolve a figurinha para você.",
    rapida: "Capítulo V num fôlego só. A Hora chegou atrasada, pela primeira vez.",
    manha: "Rank S em tudo. O São Lázaro abriu uma porta nova no título: a manhã.",
    melhorNoite: "Nova melhor noite no placar do posto. O DAV está começando a suar."
  },
  // ---- retrato da turma (linha no título)
  retrato: "A foto da turma de 1979 na recepção: {n} rostos já se lembram de você.",
  // ---- conquistas novas do lote 4 (terceira rodada)
  conquistas: [
    { id: "l4c_nevoa", nome: "Neblina", desc: "Ligue a Noite de Névoa.", secreta: true, charada: "O que desce fria da serra de manhã." },
    { id: "l4c_frio", nome: "Inverno", desc: "Ligue a Noite de Inverno.", secreta: true, charada: "Dá para ver o próprio bafo." },
    { id: "l4c_brasa", nome: "Brasa", desc: "Ligue a Noite de Brasa.", secreta: true, charada: "O que sobra do fogo quando a chama morre." },
    { id: "l4c_trocada", nome: "Regras Trocadas", desc: "Escreva TROCADA no título.", secreta: true, charada: "Quando quem ouvia passa a enxergar." },
    { id: "l4c_manha", nome: "A Manhã", desc: "Escreva MANHÃ no título.", secreta: true, charada: "O que vem depois da Hora mais escura." },
    { id: "l4c_sete", nome: "Sete Badaladas", desc: "Escreva SETE no título.", secreta: true, charada: "Duas a menos que o normal." },
    { id: "l4c_faisca", nome: "O Gato Faísca", desc: "Escreva FAÍSCA no título.", secreta: true, charada: "O bicho que sumiu com as crianças." },
    { id: "l4c_girassol", nome: "Cresceu", desc: "Escreva GIRASSOL no título.", secreta: true, charada: "A flor que vira a cabeça atrás de segredo." },
    { id: "l4c_lata", nome: "A Lata Inteira", desc: "Encha a lata de biscoito do Davi.", secreta: true, charada: "Seis coisas de criança, uma por capítulo." },
    { id: "l4c_placar", nome: "Recorde do Irmão", desc: "Supere o DAV no placar do posto.", secreta: true, charada: "Ache tudo que dá numa só noite." },
    { id: "l4c_raras", nome: "Coisa Rara", desc: "Marque as oito ocorrências raras.", secreta: true, charada: "Oito coisas que quase ninguém faz." },
    { id: "l4c_lendas", nome: "Toda Lenda", desc: "Viva as seis lendas da serra.", secreta: true, charada: "Dizem por aí — confira cada uma." },
    { id: "l4c_recordes", nome: "A Casa Toda", desc: "Chegue a rank S em todos os capítulos.", secreta: true, charada: "O melhor de cada parte do São Lázaro." },
    { id: "l4c_colecionadora", nome: "Colecionadora de Medos", desc: "Veja sete jeitos diferentes de morrer.", secreta: true, charada: "Cada susto te pega de um jeito." },
    { id: "l4c_sino", nome: "A Badalada", desc: "Escreva SINO no título.", secreta: true, charada: "O que toca nove vezes à Hora." },
    { id: "l4c_luz_estranha", nome: "Luz Estranha", desc: "Termine um capítulo com um modo de luz novo ligado.", secreta: true, charada: "Névoa, inverno ou brasa — escolha um e sobreviva." },
    { id: "l4c_chamada_inteira", nome: "Chamada Inteira", desc: "Chame todas as crianças da turma de 1979.", secreta: true, charada: "Não falte com nenhum nome." }
  ],
  // ---- nomes novos para a Chamada de 1979 (entram na aba Chamada do lote 4)
  chamadaExtra: {
    moacir: "Moacir, 11 anos. Cuidava do lampião. Foi o único que ficou — e cegou.",
    luiz: "Luiz, 10 anos. O melhor amigo do Davi. A cova dele é a mais funda.",
    sueli: "Sueli, 9 anos. Tinha medo do escuro. Dormia de mãos dadas com a Clara.",
    gilberto: "Gilberto, 12 anos. O mais velho. Tentou abrir a porta trancada até o fim.",
    marta: "Marta, 8 anos. Desenhava o pátio de dia. Só sobrou o giz.",
    elias: "Elias, 10 anos. Cantava o hino desafinado de propósito, para rir.",
    dalva: "Dalva, 11 anos. Guardava doce debaixo do colchão. Ainda está lá.",
    raul: "Raul, 9 anos. Colecionava figurinhas. Trocava tudo por uma só.",
    zuleide: "Zuleide, 7 anos. A segunda caçula. Chamava a Irmã Celeste de mãe.",
    benedito: "Benedito, 12 anos. Carregava os baldes do poço. Forte para a idade.",
    aparecida: "Aparecida, 10 anos. Rezava por todos antes de dormir. Por todos.",
    joao: "João, 8 anos. Perdeu o sapato no mesmo dia que o Cícero. Riram juntos.",
    terezinha: "Terezinha, 11 anos. Bordava lenços com as iniciais erradas, de brincadeira.",
    sebastiao: "Sebastião, 9 anos. Dizia que ouvia o sino antes de todo mundo.",
    neusa: "Neusa, 10 anos. A última da fila na chamada. Por isso ninguém notou."
  }
};
// Junta as conquistas novas no catálogo da progressão (sem duplicar).
(() => {
  const P = window.ROTEIRO.progressao; P.conquistas = P.conquistas || [];
  for (const c of P.lote4c.conquistas) if (!P.conquistas.some(x => x.id === c.id)) P.conquistas.push(c);
  // as cartas novas entram na lista de secretas da aba Cartas do lote 4, se ela existir
  try { const L4 = P.lote4; if (L4 && L4.cartas && Array.isArray(L4.cartas.secretas)) for (const c of P.lote4c.cartas) if (!L4.cartas.secretas.some(x => x.id === c.id)) L4.cartas.secretas.push(c); } catch (e) {}
  // os nomes novos entram na Chamada de 1979 do lote 4 (viram códigos digitáveis e fichas no painel)
  try { const ch = P.lote4 && P.lote4.chamada; if (ch && ch.fichas) for (const k in P.lote4c.chamadaExtra) if (!ch.fichas[k]) ch.fichas[k] = P.lote4c.chamadaExtra[k]; } catch (e) {}
})();
