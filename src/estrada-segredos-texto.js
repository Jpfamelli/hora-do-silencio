// Texto do PRÓLOGO do Lote 4 (segredos e easter eggs da estrada velha, do carro e do Posto Serra).
// Fica separado do roteiro.js para não conflitar. Na importação, entra em window.ROTEIRO só o que falta.

export const TX4 = {
  falas: {
    s4_carro_entra: [{ quem: 'lia', texto: 'Só um minuto. Só até o coração parar de bater assim.' }],
    s4_carro_sai: [{ quem: 'lia', texto: 'Tá bom. Tá bom, eu vou.' }],
    s4_carro_45: [{ quem: 'lia', texto: '(baixinho) Só até a chuva passar. Ninguém precisa saber que eu fiquei aqui.' }],
    s4_carro_120: [{ quem: 'lia', texto: '(prendendo o ar) Não tem ninguém do lado de fora. Não tem ninguém do lado de fora.' }],
    s4_carro_170: [{ quem: 'lia', texto: '(sussurrando) Tem alguém sentado atrás de mim. Não vira. Não vira.' }],
    s4_buzina_luz: [{ quem: 'lia', texto: 'Alguém piscou de volta. Lá do alto. Melhor não chamar mais atenção.' }],
    s4_buzina_sozinha: [{ quem: 'lia', texto: 'Eu não encostei no volante. Eu NÃO encostei no volante.' }],
    s4_buzina_teto: [{ quem: 'lia', texto: 'Para. Para de buzinar, Lia. Tem alguma coisa em cima do carro de novo.' }],
    s4_onibus_vem: [{ quem: 'lia', texto: '(sussurrando) Isso é uma buzina de ônibus. Tá vindo. Pela estrada interditada.' }],
    s4_onibus_passou: [{ quem: 'lia', texto: 'Três janelas vazias. Três. O Davi, a Ana e o Tomé não estavam no ônibus.' }],
    s4_banco: [{ quem: 'lia', texto: '(a voz falhando) O banco de trás tá molhado. E tem uma mãozinha no vidro. Do lado de dentro.' }],
    s4_retrovisor1: [{ quem: 'lia', texto: 'O banco de trás, vazio. Graças a Deus.' }],
    s4_retrovisor2: [{ quem: 'lia', texto: 'O cinto de trás tá afivelado. Quem afivelou o cinto de trás?' }],
    s4_retrovisor3: [{ quem: 'lia', texto: 'L-I-A. Escrito no vidro. Por dentro.' }],
    s4_farol: [{ quem: 'lia', texto: '(a respiração travando) Três crianças. De mãos dadas. No meio da estrada.' }],
    s4_chave_nao: [{ quem: 'lia', texto: 'A chave ainda está no contato. Mas primeiro eu preciso de luz. A lanterna tá no porta-malas.' }],
    s4_motor_pega: [{ quem: 'lia', texto: 'Pegou. Pegou! Não. Ninguém precisa chegar lá.' }],
    s4_volta1: [{ quem: 'lia', texto: 'Eu andei reto. Eu andei RETO. Como é que o carro tá na minha frente?' }],
    s4_volta2: [{ quem: 'lia', texto: 'A porta tá aberta. Eu fechei essa porta. E tem mãozinha no vidro... por dentro.' }],
    s4_volta3: [{ quem: 'lia', texto: '(sussurrando) Tem alguém no banco do motorista. De capa. Ouvindo a fita. Sou eu?' }],
    s4_volta_fim: [{ quem: 'lia', texto: 'A estrada só vai pra lá. Eu entendi. Eu entendi!' }],
    s4_volta_nao: [{ quem: 'lia', texto: 'Não. Pra trás não tem mais estrada. Só tem o internato.' }],
    s4_re: [{ quem: 'lia', texto: '(um fio de voz) Ele tava andando de costas. Do meu lado. Igual a mim.' }],
    s4_sos: [{ quem: 'lia', texto: '(sussurrando) D... A... V... I. A gente se falava assim, da janela do dormitório.' }],
    s4_sos_pilha: [{ quem: 'lia', texto: 'Uma pilha rolou por baixo do portão. Alguém lá dentro quer que eu veja.' }],
    s4_posto_luz: [{ quem: 'lia', texto: 'A luz do posto piscou de volta. Três vezes.' }],
    s4_posto_luz4: [{ quem: 'lia', texto: 'Quatro. Eu pisquei três e ela respondeu quatro.' }],
    s4_gato: [{ quem: 'lia', texto: '(baixinho) Oi, bichano. Você também tá sozinho aqui, né?' }],
    s4_gato_chia: [{ quem: 'lia', texto: 'O gato tá arrepiado. Olhando pro mato. Ele tá vendo alguma coisa que eu não vejo.' }],
    s4_gato_portao: [{ quem: 'lia', texto: 'Ele não entra. Sentou no portão e ficou. Bicho sabe das coisas.' }],
    s4_bala: [{ quem: 'lia', texto: 'Bala de goma de 1979. Dura como pedra. Vou guardar.' }],
    s4_bala_some: [{ quem: 'lia', texto: 'A bala sumiu do banco. E deixaram um papel no lugar.' }],
    s4_moeda: [{ quem: 'lia', texto: 'Uma moeda de cruzeiro no cinzeiro. Esse carro nem era meu em 1979.' }],
    s4_chiclete: [{ quem: 'lia', texto: 'Um anelzinho com a letra D. O Davi tinha um desses. Ele ganhou na máquina do posto.' }],
    s4_poco_mao: [{ quem: 'lia', texto: '(um grito engolido) Tinha uma mão. Uma mão pequena segurando o balde lá embaixo.' }],
    s4_binoculo: [{ quem: 'lia', texto: 'Quatro grupos de piscadas. Ela tá contando alguma coisa pra mim. Eu devia lembrar disso.' }],
    s4_bomba: [{ quem: 'lia', texto: 'Catorze, zero três. Quatorze de março.' }],
    s4_porao_abre: [{ quem: 'lia', texto: 'Um alçapão. Tem uma luz verde lá embaixo. Um rádio ligado.' }],
    s4_porao_joaquim: [{ quem: 'joaquim', texto: 'Isso aí é coisa minha, moça... Mas pode olhar. Hoje pode.' }],
    s4_km79: [{ quem: 'lia', texto: 'Tá aceso. Tá tudo aceso, com música... como antes do fogo.' }],
    s4_km79_fim: [{ quem: 'lia', texto: 'E agora é só ruína de novo. Eu vi uma criança de pijama atravessando. Correndo pra lá.' }],
    s4_velho: [{ quem: 'lia', texto: '(sussurrando) Um velho curvado. Com um saco nas costas. Atravessou e sumiu no barranco.' }],
    s4_bicicleta: [{ quem: 'lia', texto: '(sussurrando) Uma bicicleta passou. Com a cartinha batendo no raio. Sem ninguém em cima.' }],
    s4_pipa: [{ quem: 'lia', texto: '"LIA VOA". Essa pipa é do Davi. Eu ajudei a colar a rabiola.' }],
    s4_bafo: [{ quem: 'lia', texto: 'VOLTA. Escrito ao contrário. Escrito de dentro.' }],
    s4_escola: [{ quem: 'lia', texto: 'Três crianças. Depois duas. Depois uma. E na última...' }],
    s4_cartaz: [{ quem: 'lia', texto: 'O diretor Albano já foi candidato. O homem da ordem.' }],
    s4_manilha: [{ quem: 'lia', texto: '(sussurrando) Tem alguém respirando no fundo do cano. Bem pequeno.' }],
    s4_final0_radio: [{ quem: 'radio', texto: '(chiado) ...e a moça que voltou da estrada velha ontem à noite... voltou de novo hoje...' }, { quem: 'lia', texto: 'Desta vez eu vou.' }],
    s4_carro_radio: [{ quem: 'radio', texto: '(chiado) ...o carro cinza continua parado na estrada velha. Com alguém dentro. Ninguém sabe quem.' }, { quem: 'lia', texto: 'Dessa vez eu saio do carro. Dessa vez.' }]
  },
  joaquim: {
    bala: 'Criança gosta de doce. Até as de lá.',
    luz: 'Foi você que piscou? O Davi fazia isso da janela do dormitório. Toma, leva essa pilha.',
    velho: 'Viu ele também? Faz anos que ele não desce.',
    gato: 'O bichano gostou de você. Ele não gosta de ninguém.',
    sos: 'Alguém respondeu lá de cima, né? Eu vi daqui. Não responde de novo.'
  },
  // sortes da máquina de chiclete do posto (uma por noite)
  sortes: [
    'Você vai se esconder na cama errada.',
    'Não abra a terceira porta.',
    'Quem conta até dez nunca termina no dez.',
    'Ele ouve melhor do que você corre.',
    'A nona badalada é a mais longa.',
    'Alguém vai chamar o seu nome. Não é quem você pensa.',
    'Sorte de hoje: sair.'
  ],
  // o que o balde do poço traz, noite a noite
  poco: [
    'O balde sobe com uma bolinha de gude seca. Seca, no fundo de um poço.',
    'O balde sobe com um sapato de criança, encharcado. Número 28.',
    'O balde sobe com um bilhete molhado: "TÁ FRIO AQUI EMBAIXO".',
    'O balde sobe só com água morna. Morna.'
  ],
  notas: [
    { id: 's4_carta', titulo: 'Caixa de correio do posto', secreta: true,
      texto: "(cartas devolvidas, presas num elástico. Todas com o mesmo carimbo: DESTINATÁRIO NÃO ENCONTRADO)\n\nPara: Davi Moraes — Internato São Lázaro — 1979\nPara: Davi Moraes — Internato São Lázaro — 1980\nPara: Davi Moraes — Internato São Lázaro — 1981\n(...)\n\nA última não tem carimbo. A letra é a sua. A data é de amanhã.\n\n\"15/03/1994\n\nSe você está lendo, ainda dá tempo.\nNa estrada, não corre: ele só anda quando você não olha.\nNo barranco, vai de joelhos e no escuro.\nE quando a janela piscar de volta, não pisca de novo.\n\n— L.\"" },
    { id: 's4_mapa', titulo: 'Mapa com alfinetes (porão do posto)', secreta: true,
      texto: "(um mapa da serra, desenhado à mão, pregado na parede do porão. Alfinetes vermelhos com papeizinhos)\n\n• curva do ônibus — 14/03/79 — 34 crianças\n• capelinha — 1986 — o repórter\n• barranco — 1983 — o delegado e os dois soldados\n• ponte — 1991 — o padre\n• portão — 1992 — a moça de Taubaté\n\nUm alfinete novo, ainda sem papel, espetado em cima do portão.\n\nNa caixa de sapato embaixo do rádio: quinze recibos dos Correios, de 1979 a 1993, mandados para quinze famílias diferentes. O último é para Taubaté.\n\nVocê não foi a primeira a receber uma fita." },
    { id: 's4_morse', titulo: 'Tabela pregada na escada do porão', secreta: true,
      texto: "CÓDIGO — PRA FALAR COM OS MENINOS (J.S.)\n\n· curto     — longo\n\nS  · · ·\nO  — — —\nA  · —\nD  — · ·\nI  · ·\nV  · · · —\n\nS.O.S. = · · ·  — — —  · · ·\n\n(embaixo, a lápis, letra de criança)\nseu jaquim, se piscar socoro com a lanterna pra janela do segundo andar eu respondo. D." },
    { id: 's4_cartaz', titulo: 'Cartaz de campanha no poste', secreta: true,
      texto: "ELEIÇÕES 1978 — PARA VEREADOR\n\nALBANO\nO HOMEM DA ORDEM\n\"Disciplina na escola, silêncio na cidade.\"\n\n(a foto do diretor, sorrindo, com os dois olhos furados a prego)\n\n(no clarão do relâmpago, escrito por cima a carvão)\nORDEM DE QUEM?" },
    { id: 's4_pipa', titulo: 'Pipa presa no poste', secreta: true,
      texto: "(papel de caderno, colado com goma, rasgado no meio)\n\nNa frente, em lápis de cor:\nLIA VOA\n(uma menina de trança, de braços abertos, em cima do internato)\n\nNo verso, um mapa:\no posto, a cerca do fundo com um X, uma linha pelo barranco até o muro.\nUm boneco agachado. Uma lanterna riscada.\n\"PASSA AQUI. SEM LUZ. ELE DORME.\"\n\nNa rabiola, um bilhete enrolado, outra letra:\n\"se alguém achar avisa minha mãe que eu tô no porão. Tomé, 4ª série.\"" },
    { id: 's4_manilha', titulo: 'Bilhete na manilha', secreta: true,
      texto: "(três mochilas de criança, enfileiradas dentro do cano, com etiquetas de anos diferentes)\n\nS. LÁZARO — 1961\nS. LÁZARO — 1970\nS. LÁZARO — 1979\n\n(um bilhete preso com chiclete na de 1979)\n\"por aqui o ônibus não vê. espera o sino parar e corre pro posto.\"\n\n(e, lá no fundo do tubo, onde a lanterna não alcança, uma respiração pequena)" }
  ],
  fita: { id: 's4_fteste', titulo: 'Fita "TESTE — NÃO GRAVAR POR CIMA"', secreta: true, linhas: [
    { quem: 'davi', texto: '(um menino, rindo baixo) Teste, teste. Som. Um, dois, três. Aqui é o Davi, onze anos, gravador novo.' },
    { quem: 'davi', texto: '(engrossando a voz, fazendo estalo com a língua) "Quem está fora da cama depois das nove?" ...Ele faz assim, ó. Tó-tó.' },
    { quem: 'davi', texto: '(cantando errado, de propósito) Ó São Lázaro bendito, guardai nosso... nosso pão de queijo... (ri tanto que tosse)' },
    { quem: 'davi', texto: 'Lia, se você ouvir isso, a piada do sapo é minha. Você contou errado pra mãe.' },
    { quem: 'davi', texto: '(silêncio comprido. Depois, bem baixinho) ...Lia. Tem mais alguém respirando aqui.' }
  ] },
  conquistas: [
    { id: 's4_carro', nome: 'Fiquei no Carro', desc: 'Fique sentada no carro por três minutos.', secreta: true, dica: 'E se ela simplesmente não saísse?' },
    { id: 's4_final0', nome: 'Ninguém Precisa Chegar Lá', desc: 'Dê a partida e volte de ré pela estrada velha.', secreta: true, dica: 'A chave ainda está no contato.' },
    { id: 's4_sinal', nome: 'Sinal de Vida', desc: 'Buzine três vezes e veja quem responde lá do alto.', secreta: true, dica: 'Três toques curtos, de dentro do carro.' },
    { id: 's4_onibus', nome: 'Último Ônibus', desc: 'Buzine nove vezes, devagar, e veja o ônibus de 1979 passar.', secreta: true, dica: 'Nove, como as badaladas. Sem pressa.' },
    { id: 's4_volta', nome: 'Não Tem Volta', desc: 'Ande para trás pela estrada até ela dar a volta três vezes.', secreta: true, dica: 'A estrada só vai para um lado.' },
    { id: 's4_sos', nome: 'Alguém Respondeu', desc: 'Pisque S.O.S. com a lanterna para a janela do internato.', secreta: true, dica: 'Três curtas, três longas, três curtas.' },
    { id: 's4_posto', nome: 'Três Piscadas', desc: 'Pisque a lanterna três vezes para a luz do posto.', secreta: true, dica: 'O Davi falava com luz.' },
    { id: 's4_gato', nome: 'Bichano', desc: 'Faça carinho no gato do posto sem assustar ele.', secreta: true, dica: 'Devagar. Bem devagar.' },
    { id: 's4_poco', nome: 'O Que Tinha no Fundo', desc: 'Puxe o balde do poço em três noites diferentes.', secreta: true, dica: 'Cada noite o balde traz outra coisa.' },
    { id: 's4_pisca', nome: 'Quem Pisca', desc: 'Veja pelo binóculo a janela da torre piscar os quatro grupos.', secreta: true, dica: 'Atrás do posto, alguém deixou um binóculo.' },
    { id: 's4_km79', nome: 'Quilômetro 79', desc: 'Levante o marco caído no mato.', secreta: true, dica: 'Tem um marco que não entra na contagem.' },
    { id: 's4_re', nome: 'Ré', desc: 'Ande de costas por quarenta metros na estrada.', secreta: true, dica: 'Não olha pra trás.' },
    { id: 's4_bafo', nome: 'Bafo', desc: 'Embace o vidro de trás do carro com a respiração.', secreta: true, dica: 'Encoste o rosto no vidro.' },
    { id: 's4_doce', nome: 'Doce', desc: 'Deixe uma bala no ponto de ônibus para quem ainda espera.', secreta: true, dica: 'Criança gosta de doce.' },
    { id: 's4_porao', nome: 'O Porão do Joaquim', desc: 'Ache o rádio escondido debaixo do tapete do posto.', secreta: true, dica: 'A ponta do tapete está levantada.' }
  ],
  finais: {
    carro: { titulo: 'FINAL SECRETO — FIQUEI NO CARRO', antes: 'Você não entrou. Então ele saiu.',
      texto: 'A chuva parou perto das cinco da manhã. O sedã cinza continuava na estrada velha, com o pisca-alerta ligado e os vidros embaçados por dentro.\n\nNo banco de trás, a marca de quem sentou. No banco do motorista, ninguém.\n\nO internato esperou a noite inteira. Ele não gosta de esperar.' },
    desistencia: { titulo: 'FINAL 0 — NINGUÉM PRECISA CHEGAR LÁ', antes: 'Não. Ninguém precisa chegar lá.',
      texto: 'O motor engasgou duas vezes e pegou na terceira. A Lia desceu a serra de ré até achar onde manobrar, e não olhou para o retrovisor nenhuma vez.\n\nEm Taubaté, ela guardou a fita numa gaveta e nunca mais ouviu.\n\nLá em cima, o sino bateu nove vezes. E depois mais uma.' }
  },
  legendas: {
    s4_buzOnibus: { t: 'uma buzina de ônibus, rouca, responde ao longe', imp: 1, cd: 2, cat: 'h' },
    s4_diesel: { t: 'um motor a diesel se aproxima', imp: 1, cd: 6, cat: 'h' },
    s4_ronrono: { t: 'o gato ronrona', imp: 0, cd: 4, cat: 'h' },
    s4_chiado: { t: 'o gato chia, arrepiado', imp: 1, cd: 4, cat: 'p' },
    s4_miado: { t: 'um miado', imp: 0, cd: 3, cat: 'h' },
    s4_couro: { t: 'o couro do banco de trás range, afundando', imp: 1, cd: 4, cat: 'p' },
    s4_batidas: { t: 'três batidas no vidro do seu lado', imp: 1, cd: 4, cat: 'p' },
    s4_balde: { t: 'a corda do poço range', imp: 0, cd: 3, cat: 'h' },
    s4_festa: { t: 'música de festa, longe', imp: 0, cd: 6, cat: 'h' },
    s4_bicicleta: { t: 'uma bicicleta passa (uma carta batendo no raio)', imp: 0, cd: 6, cat: 'h' },
    s4_janela: { t: '[uma janela pisca de volta]', imp: 1, cd: 6, cat: 'h' },
    s4_luzTorre: { t: '[uma luz responde lá no alto]', imp: 1, cd: 6, cat: 'h' },
    s4_criancas: { t: '[três respirações pequenas]', imp: 1, cd: 6, cat: 'p' },
    s4_radioPorao: { t: 'um rádio amador chiando', imp: 0, cd: 5, cat: 'h' },
    s4_risadinha: { t: 'uma risadinha de criança', imp: 0, cd: 5, cat: 'h' },
    s4_motorPega: { t: 'o motor engasga... e pega', imp: 1, cd: 5 },
    s4_contador: { t: 'engrenagens da bomba girando para trás', imp: 0, cd: 4, cat: 'h' }
  }
};

export function mesclarSegredos(R) {
  if (!R) return;
  if (R.falas) for (const k in TX4.falas) if (!R.falas[k]) R.falas[k] = TX4.falas[k];
  if (R.notas) for (const n of TX4.notas) if (!R.notas.some(x => x.id === n.id)) R.notas.push(n);
  if (R.fitas && !R.fitas.some(x => x.id === TX4.fita.id)) R.fitas.push(TX4.fita);
  if (R.conquistas) for (const c of TX4.conquistas) if (!R.conquistas.some(x => x.id === c.id)) R.conquistas.push(c);
}
try { mesclarSegredos(window.ROTEIRO); } catch (e) {}
