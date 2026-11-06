// Texto NOVO da 2ª rodada do Lote 6 no prólogo (rejogabilidade da estrada: mala do carro, rádio com estações,
// posto que muda, eventos sorteados da estrada). Separado para não conflitar com roteiro.js nem com
// estrada-lote6-texto.js. As falas entram em window.ROTEIRO.falas (só as que faltam) e as conquistas em
// window.ROTEIRO.conquistas.
const L = (quem, texto) => [{ quem, texto }];
export const TXT6B = {
  falas: {
    // --- mala do carro ---
    e6b_mala_dica: L('lia', 'No capô, três coisas que eu juntei na pressa. Só cabem no bolso... uma.'),
    e6b_mala_garrafa: L('lia', 'A garrafa. Barulho longe é a melhor porta que eu conheço.'),
    e6b_mala_pilha: L('lia', 'Mais uma pilha. Luz é o que eu mais gasto nessa casa.'),
    e6b_mala_kit: L('lia', 'O curativo. Se eu errar uma vez, vou poder errar de novo.'),
    e6b_mala_fosforo: L('lia', 'Fósforos. Uma chama pequena também conta como resposta.'),
    e6b_mala_mapa: L('lia', 'O mapa riscado do Davi. Cada risco é um lugar onde ele se escondeu.'),
    e6b_maos_vazias: L('lia', 'Sem nada nas mãos. Se eu for ouvida, vai ser só por mim.'),
    e6b_heranca_pega: L('lia', 'Era isso que eu tinha enterrado no portão. A Serra devolveu.'),
    e6b_heranca_enterra: L('lia', 'Enterrei aqui. Se eu voltar, ainda vai estar me esperando.'),
    // --- moeda do painel ---
    e6b_moeda_cara: L('lia', 'Cara. Hoje a sorte tá do meu lado. Não sei por quê isso me preocupa.'),
    e6b_moeda_coroa: L('lia', 'Coroa. E os faróis piscaram sozinhos. Tá bom, eu entendi.'),
    // --- colecionáveis do porta-malas ---
    e6b_col_ursinho: L('lia', 'O ursinho do Davi. Estava no porta-malas desde a última vez. Ele costurou o olho de novo.'),
    e6b_col_gravador: L('lia', 'Um gravador sem fita. A tampa aberta como se alguém tivesse acabado de tirar a fita de dentro.'),
    e6b_col_sapato: L('lia', 'Um sapatinho de criança, molhado por dentro. Não chove há horas.'),
    e6b_col_todos: L('lia', 'Ursinho, gravador, sapato. Alguém tá me deixando um enxoval de uma criança que não voltou.'),
    // --- causas da pane ---
    e6b_pane_pneu: L('lia', 'O pneu murchou de vez. Eu ouvi o ar sair... como um suspiro comprido.'),
    e6b_pane_cano: L('lia', 'O cano da água estourou. Vapor saindo do capô, quente, branco, no frio dessa serra.'),
    e6b_pane_bateria: L('lia', 'A bateria arriou. Os faróis só piscam quando ela está pensando em desistir.'),
    e6b_pane_tanque: L('lia', 'O tanque secou. E tem cheiro de gasolina no chão... mas o tanque estava cheio quando eu saí.'),
    // --- carro mudou ---
    e6b_odo_1979: L('lia', 'O hodômetro travou em 1979. Não em quilômetros: no ano.'),
    e6b_odo_volta: L('lia', 'O hodômetro está rodando ao contrário... e parou no zero.'),
    e6b_odo_davi: L('lia', 'No lugar dos números do hodômetro, quatro letras. D, A, V, I.'),
    e6b_carro_mexido: L('lia', 'O carro não está onde eu deixei. A porta do motorista aberta, o rádio tocando baixinho.'),
    e6b_carro_musica: L('lia', 'Essa melodia... não é de rádio nenhum. É caixinha de música.'),
    // --- carro de quem veio antes ---
    e6b_antes_carro: L('lia', 'Um carro igualzinho ao meu. Mesma cor, mesma árvore no pára-brisa. Porta-malas aberto.'),
    e6b_antes_gravador: L('lia', 'Um gravador de fita no porta-malas. Já está ligado. Fala de mim como se eu fosse um caso encerrado.'),
    // --- marcos de noite ---
    e6b_noite_5: L('lia', 'Cinco noites. Uma mão inteira de risquinhos no capô. Alguém está contando por mim.'),
    e6b_noite_10: L('lia', 'Dez noites. Dez vezes eu acordei no banco do carro sem saber como cheguei.'),
    e6b_noite_25: L('lia', 'Vinte e cinco. A Serra já nem tenta me assustar, só me cumprimenta.'),
    e6b_noite_50: L('lia', 'Cinquenta noites. Eu não sei mais se estou voltando, ou se nunca fui embora.'),
    // --- Seu Joaquim ---
    e6b_joaquim_curto20: L('joaquim', 'A estrada ficou mais curta, menina. Cada vez que você vem, ela encurta um pouquinho.'),
    e6b_vazio_lia: L('lia', 'A luz tá acesa, o café ainda quente... e ninguém aqui. Ele devia estar sentado nessa cadeira.'),
    e6b_vazio_radio: L('radio', '(chiado) ...Lia... Lia... Lia... (chiado)'),
    e6b_vazio_fim: L('lia', 'A gravação acabou. A voz dele era a de alguém que já sabia que eu ia ouvir sozinha.'),
    // --- cliente fantasma do posto ---
    e6b_cliente_some: L('lia', 'Tinha alguém sentado ali, de costas. Quando a luz chegou, o banco estava vazio e morno.'),
    e6b_cliente_vira: L('lia', '(sussurrando) Eu apaguei a luz e ele virou. Sem rosto nenhum... só esperando eu olhar.'),
    // --- refrigerante ---
    e6b_refri_folego: L('lia', 'Gosto de ferro e laranja velha. Mas meu peito abriu, como se eu nunca tivesse corrido.'),
    e6b_refri_pilha: L('lia', 'A máquina cuspiu uma pilha no lugar da lata. Alguém já tinha pensado em mim.'),
    e6b_refri_estouro: L('lia', 'A lata estourou alto! Isso foi ouvido lá do portão...'),
    e6b_refri_ja: L('lia', 'A máquina só deu uma. Ela parece contar as moedas do jeito dela.'),
    // --- desafios do cardápio ---
    e6b_cardapio: L('lia', 'No balcão, três cartões. "Aceite um e a noite te paga em pilha." Letra do Seu Joaquim.'),
    e6b_desafio_ok: L('lia', 'Cumprido. A pilha no bolso é pequena, mas é minha.'),
    e6b_desafio_falhou: L('lia', 'Falhei no combinado. Pelo menos o medo me ensinou a regra.'),
    // --- rádio: estações ---
    e6b_radio_novela_fim: L('lia', 'Nove capítulos da radionovela. E a última frase foi o meu nome.'),
    e6b_radio_charada_ok: L('lia', 'Acertei a charada do Davi no buzinaço. Tem um curativo no porta-luvas que não tinha antes.'),
    e6b_radio_charada_erra: L('davi', 'Não foi essa, Lia. Escuta de novo. A resposta você já viu.'),
    e6b_radio_falso: L('lia', 'O boletim mentiu. A Serra FM mente? Ou foi um aviso de uma outra noite?'),
    e6b_radio_verdade: L('lia', 'O boletim estava certo. Pelo menos o rádio de vez em quando diz a verdade.'),
    // --- armário de ferramentas ---
    e6b_arm_dica: L('lia', 'Um armário de ferramentas com cadeado de quatro números. Deve haver um código do dia em alguma estação.'),
    e6b_arm_errado: L('lia', 'Não abriu. O número muda com o dia. Alguma estação do rádio dá o de hoje.'),
    e6b_arm_ok: L('lia', 'Abriu! Dentro, um recado preso com fita e alguma coisa útil.'),
    // --- placas ---
    e6b_placa_falsa: L('lia', 'Esse lugar não existe. Essa placa foi pintada por quem queria me desviar.'),
    e6b_placa_certa: L('lia', 'São Lázaro. Esse é o único nome que eu reconheço.'),
    e6b_placa_zero: L('lia', 'A placa diz que cheguei. Mas o portão ainda está lá na frente.'),
    // --- obstáculos ---
    e6b_obst_tronco: L('lia', 'Um tronco caído no meio da pista. Dá pra contornar pelo lado... com cuidado.'),
    e6b_obst_poca: L('lia', 'A poça é funda. Cada passo faz um chape que o escuro ouve.'),
    e6b_obst_arame: L('lia', 'Arame farpado atravessado. Se eu forçar, vai ranger alto.'),
    e6b_lama_barranco: L('lia', 'O barranco fechou com a lama de ontem. A Serra não gosta que eu repita o caminho.'),
    // --- eventos da estrada ---
    e6b_serracao: L('lia', 'A névoa baixa vem de trás, devagar, engolindo a estrada. Se eu parar, ela me pega.'),
    e6b_serracao_toca: L('lia', 'Ela me alcançou! Frio, e a lanterna apagou sozinha...'),
    e6b_serracao_ok: L('lia', 'Cheguei antes da névoa. Ela ficou lá atrás, esperando alguém mais lenta.'),
    e6b_escura: L('lia', 'Os postes estão apagando um por um, atrás de mim. Não posso ficar parada.'),
    e6b_escura_pega: L('lia', 'O escuro me alcançou. Ele estava parado ali esperando eu desistir de andar.'),
    e6b_criancas: L('lia', 'Luzinhas amarelas entre as árvores. Risadinhas de criança lá longe. Elas estão me chamando.'),
    e6b_criancas_pilha: L('lia', 'Segui as luzinhas. Elas deixaram uma pilha no tronco, e riram.'),
    e6b_criancas_embosca: L('lia', 'As luzinhas se apagaram todas juntas. E alguma coisa grande respira atrás de mim.'),
    e6b_mula: L('lia', 'Galope pesado. Chamas azuis atravessando a pista. Fora da estrada! Pro mato!'),
    e6b_mula_passa: L('lia', 'A coisa passou por mim sem virar a cabeça. Ela não tem cabeça.'),
    e6b_mula_pega: L('lia', 'O calor azul passou raspando. A lanterna apagou.'),
    e6b_redemoinho: L('lia', 'Um redemoinho de poeira, assobiando como gente. Ele está vindo pela pista.'),
    e6b_redemoinho_pega: L('lia', 'O vento apagou a lanterna e levou meu fôlego.'),
    e6b_forma: L('lia', 'Uma coisa na neblina... com formato de mão? De árvore? De criança em pé? Sumiu quando olhei direito.'),
    e6b_caroneiro: L('lia', 'Um homem no acostamento, de costas, com a mão levantada. Ele não virou quando passei.'),
    e6b_caro_verdade: L('radio', '(o homem, sem virar) "A chave não é onde o velho disse. Procura onde ninguém olha."'),
    e6b_caro_mentira: L('radio', '(o homem, sem virar) "Tá no prego, moça. Sempre no prego." (E ele ri baixinho.)'),
    e6b_caro_nada: L('lia', 'Ele não disse nada. A lanterna piscou três vezes e ele não estava mais lá.'),
    e6b_caro_pegadas: L('lia', 'Pegadas encharcadas no portão. Vieram do acostamento atrás de mim. Alguém seguiu o carro.'),
    e6b_ponto: L('lia', 'Um ponto de ônibus no escuro. O banco tem a madeira polida de gente que esperou demais.'),
    e6b_ponto_ok: L('lia', 'Esperei vinte e cinco segundos. O banco deixou uma pilha em troca da minha paciência.'),
    e6b_ponto_vulto: L('lia', 'Tem alguém vindo pela estrada, devagar. Se eu levantar agora, perco o que o banco ia me dar.'),
    e6b_ponto_susto: L('lia', 'Fiquei demais. Ele chegou a um passo e o último ônibus passou vazio, com as janelas acesas.'),
    e6b_cervo: L('lia', 'Um cervo parado na pista. Os olhos dele são... humanos. E olham pra mim com pena.'),
    e6b_lampiao: L('lia', 'Uma mulher cruzando a estrada com um lampião. Não deixa sombra no chão.'),
    e6b_caminhao: L('lia', 'Faróis enormes. Um caminhão desce sem ninguém na cabine, o motor roncando sozinho.'),
    e6b_capa: L('lia', 'Uma criança de capa, parada no meio da pista. Quando eu pisquei, a capa estava vazia no chão.'),
    e6b_nada: L('lia', 'O rádio avisa: "algo vai acontecer". Eu espero. Eu espero. Não acontece nada. É pior.'),
    e6b_nada_fim: L('lia', 'Nada aconteceu. Foi a espera que me assustou, não ele.'),
    e6b_pegadas_ontem: L('lia', 'Pegadas de lama. É o caminho que eu fiz ontem, passo a passo. E elas continuam sem mim.'),
    e6b_pegadas_achado: L('lia', 'No fim da trilha de ontem alguém deixou uma pilha. Ou eu mesma deixei.'),
    e6b_corvos: L('lia', 'Corvos enfileirados na cerca. Quando eu me aproximei, voaram todos de uma vez.'),
    e6b_grilos_calam: L('lia', 'Os grilos pararam. Quando os grilos param, a gente deve parar também.'),
    // --- placar de rotas ---
    e6b_rota_estrada: L('lia', 'Pela estrada, toda exposta. O Seu Joaquim chamava isso de caminho dos corajosos.'),
    e6b_rota_barranco: L('lia', 'Pelo barranco, agachada. O caminho dos que se escondem.'),
    e6b_recorde_rota: L('lia', 'Melhor tempo por esse caminho. A Serra anotou no giz.')
  },
  // dicas reais do Seu Joaquim (uma fala extra sorteada pela semente e pela noite; cada uma esconde uma dica útil)
  joaquimDicas: [
    'A porta da despensa emperra, menina. Pelo ombro, que ela cede.',
    'Dentro da casa a luz não é amiga: só a de vela e a de fósforo ele não enxerga direito.',
    'Quando a garrafa voar, vai pra longe da porta por onde você pretende sair.',
    'Se ouvir as nove badaladas, não esteja de pé. Cama e armário valem mais que correr.',
    'Os túneis só deixam passar quem escuta a fita até o fim.',
    'Menina de olho fundo, não responde. Se chamar teu nome, é pra você virar.'
  ],
  joaquimMorto: [
    { quem: 'joaquim', texto: 'Você voltou.' },
    { quem: 'lia', texto: 'Seu Joaquim... o senhor tá frio.' },
    { quem: 'joaquim', texto: 'Estou. Faz quinze anos. Mas toda noite eu sento aqui e finjo que ainda vendo café.' },
    { quem: 'joaquim', texto: 'Leva as regras. Eu escrevi pra você, de novo.' }
  ],
  joaquimGravacao: [
    { quem: 'joaquim', texto: '(gravação) Se você está ouvindo, eu fui lá fora ver se a estrada ainda existe.' },
    { quem: 'joaquim', texto: '(gravação) Deixei as regras do Davi no balcão. E a chave não está no prego: está embaixo do balcão.' },
    { quem: 'joaquim', texto: '(gravação) Não corre lá dentro. Ele escuta. E ele aprende o teu passo, moça.' }
  ],
  dicaChave: {
    prego: 'A chave tá no prego, atrás de você.',
    balcao: 'A chave não está no prego hoje. Procura em cima do balcão, junto ao rádio.',
    casaco: 'A chave tá no bolso do casaco, na parede, perto da porta.',
    bomba: 'A chave ficou pendurada na bomba de gasolina, do lado de fora. Eu me esqueci.',
    sob: 'A chave tá embaixo do balcão. Abaixa pra ver.'
  },
  // relatório do carro de quem veio antes; {n}, {m}, {c}, {h} são trocados pelos números reais
  relatorio: [
    'Relatório da ocorrência.',
    'A observada entrou no internato {n} vezes.',
    'Foi encontrada {m} vezes. Na maior parte, por {c}.',
    'Passou {h} dentro das paredes, em soma.',
    'Ela ainda não aprendeu. Fim da fita.'
  ],
  causas: { inspetor: 'o Inspetor', ana: 'a Menina Que Conta', procissao: 'a Procissão', nenhuma: 'ninguém, por enquanto' },
  // radionovela da Serra FM: nove episódios, todos terminam em gancho
  novela: [
    'Capítulo 1: "O Ônibus das Seis". Uma professora de véu azul embarca na última viagem. O motorista não olha o espelho. Continua amanhã.',
    'Capítulo 2: "A Casa do Sino". No internato, o irmão menor esconde um diário atrás do quadro de chaves. Quem está subindo a escada? Continua amanhã.',
    'Capítulo 3: "Fita de Cera". A freira grava uma oração em fita e, ao ouvir de novo, escuta uma segunda voz respondendo. Continua amanhã.',
    'Capítulo 4: "Nove Badaladas". O sino bate oito e para. A cidade inteira prende a respiração. Continua amanhã.',
    'Capítulo 5: "A Menina que Conta". Uma criança conta até dez nos corredores. Ninguém sabe o que acontece no onze. Continua amanhã.',
    'Capítulo 6: "O Inspetor Cego". Ele ouve melhor que todos. Mas quem tapou os olhos dele? Continua amanhã.',
    'Capítulo 7: "Fogo de Março". O incêndio começa por dentro, onde ninguém olhava. Continua amanhã.',
    'Capítulo 8: "A Irmã que Ficou". Uma freira se recusa a sair e fecha a porta por dentro. Continua amanhã.',
    'Capítulo 9: "A Moça do Carro Cinza". Ela dirige até o portão. A estação se despede dizendo o nome dela. Fim, e recomeço amanhã.'
  ],
  // charadas do Davi: a resposta é o número de buzinadas (curtas, em até 1,5 s de intervalo)
  charadas: [
    { r: 2, q: 'Quantas bombas de gasolina tem o posto, Lia? Responde buzinando.' },
    { r: 5, q: 'Quantas letras tem a palavra que está no letreiro do posto? Responde buzinando.' },
    { r: 1, q: 'Quantos velhos moram no posto? Responde buzinando.' }
  ],
  // estação Você
  voce: [
    'Esta é a estação Você. Ontem, às três e sete, ela foi encontrada por {c}. Ainda estava com a lanterna ligada.',
    'A estação Você lembra: da última vez, foi {c}. Ela correu quando devia ficar quieta.',
    'Sintonizada em você: encontrada por {c}, e voltou. Voltar é a maldição, não a coragem.',
    'Estação Você. Nenhuma morte registrada. Ainda. A Serra gosta de paciência.'
  ],
  // boletim da Serra FM: [texto, verdadeiro?] sorteados pela semente (70% verdadeiros)
  boletim: [
    'Boletim da Serra FM: o posto tem uma gaveta sem fundo. Quem procura, perde tempo.',
    'Boletim da Serra FM: o portão abre com a chave certa. Nada de força.',
    'Boletim da Serra FM: o vulto da estrada só aparece para quem anda sozinho.',
    'Boletim da Serra FM: uma ala do internato ficará sem luz esta noite.',
    'Boletim da Serra FM: nesta noite, a estrada está livre de qualquer aparição.'
  ],
  fantasma: [
    '(pirata, FM {f}) Aqui é a Estação do Davi. Hoje a chave do posto está {l}. Repito, a chave está {l}.',
    '(pirata, FM {f}) A estrada hoje está com clima de {c}. Prepara o passo, Lia.',
    '(pirata, FM {f}) Hoje o velho está sentado perto do {p}. Não encara ele. Vai ficar tudo bem.',
    '(pirata, FM {f}) O desafio de hoje é {d}. Quem cumpre, ganha uma pilha. Quem não cumpre, aprende.'
  ],
  // código do dia: uma frase de lore por dia da semana, junto do código do armário
  loreDia: [
    'Domingo: "Fechamos o posto no domingo do incêndio. Ninguém pediu café."',
    'Segunda: "O ônibus escolar saía às seis. A cozinheira embalava o lanche de todo mundo."',
    'Terça: "Seu Joaquim anota quem sobe a serra. Faz quinze anos que o caderno só tem nomes de mulher."',
    'Quarta: "A Irmã Celeste rezava por cada criança pelo nome. Esqueceu um."',
    'Quinta: "O Inspetor tem nome: Moacir. Ele era o menino da cozinha, antes de ser a sentinela."',
    'Sexta: "Davi pediu um cartão postal da estrada. Ninguém soube explicar por quê."',
    'Sábado: "No sábado, o sino tocava duas vezes só pra espantar o que já tinha entrado."'
  ],
  // desafios do cardápio do Seu Joaquim
  desafios: {
    semLuzPatio: 'Sem lanterna acesa no pátio do posto',
    semCorrer: 'Sem correr até o portão',
    relogio: 'Do posto ao portão em até 100 s',
    semDano: 'Chegar ao portão sem perder vida',
    calma: 'Chegar ao portão sem passar de 60 de medo'
  },
  // cenas
  colecionaveis: [
    { id: 'ursinho', nome: 'o ursinho do Davi' },
    { id: 'gravador', nome: 'o gravador sem fita' },
    { id: 'sapato', nome: 'o sapatinho molhado' }
  ],
  lore_armario: [
    'Um recado de fita no armário: "Ferramenta emprestada ao internato nunca voltou. Nem o homem que pegou."',
    'Uma chave de fenda enferrujada com três iniciais: M.S.D. Na cabeça do cabo, um dente de leite.',
    'Uma lata de óleo e um bilhete: "Para o portão. Ele range porque lembra."'
  ],
  conquistas: [
    { id: 'e6b_maos', nome: 'Mãos Vazias', desc: 'Siga para o posto sem levar nada da mala do carro.', secreta: true },
    { id: 'e6b_mala', nome: 'Bolso Pequeno', desc: 'Escolha um objeto da mala do carro em cinco noites diferentes.', secreta: true },
    { id: 'e6b_novela', nome: 'Ouvinte Fiel', desc: 'Ouça os nove capítulos da radionovela da Serra FM.', secreta: true },
    { id: 'e6b_charada', nome: 'Buzina do Davi', desc: 'Acerte uma charada do Davi buzinando.', secreta: true },
    { id: 'e6b_armario', nome: 'Código do Dia', desc: 'Abra o armário de ferramentas do posto com o código do dia.', secreta: true },
    { id: 'e6b_cliente', nome: 'Freguês Constante', desc: 'Fique olhando o cliente fantasma do posto até ele virar.', secreta: true },
    { id: 'e6b_nevoa', nome: 'Sem a Névoa Me Alcançar', desc: 'Atravesse a estrada sem a serração viva encostar em você.', secreta: true },
    { id: 'e6b_espera', nome: 'Paciência de Ponto', desc: 'Espere o banco do ponto de ônibus pagar a espera.', secreta: true },
    { id: 'e6b_desafio', nome: 'Freguesa do Cardápio', desc: 'Cumpra um desafio do cardápio do Seu Joaquim.', secreta: true },
    { id: 'e6b_nada', nome: 'Susto da Espera', desc: 'Aguente o encontro em que nada acontece.', secreta: true },
    { id: 'e6b_colecao', nome: 'Enxoval do Porta-Malas', desc: 'Encontre ursinho, gravador e sapato no porta-malas, em noites diferentes.', secreta: true },
    { id: 'e6b_antes', nome: 'Caso Encerrado', desc: 'Ouça o relatório do carro de quem veio antes.', secreta: true },
    { id: 'e6b_rotas', nome: 'As Duas Estradas', desc: 'Faça a travessia pela estrada e pelo barranco.', secreta: true }
  ]
};
export function mesclarL6B(R) {
  if (!R) return;
  if (R.falas) for (const k in TXT6B.falas) if (!R.falas[k]) R.falas[k] = TXT6B.falas[k];
  if (R.conquistas) for (const c of TXT6B.conquistas) if (!R.conquistas.some(x => x.id === c.id)) R.conquistas.push(c);
}
