// Texto do PRÓLOGO (estrada) do Lote 2: mundo e história da estrada velha e do Posto Serra.
// Fica num arquivo separado para não conflitar com quem mexe no roteiro.js.
// Na importação, as notas, a fita, as falas e as conquistas novas entram em window.ROTEIRO (só as que faltam).
// Datas: o incêndio foi na noite de 14/03/1979; a Lia chega na noite de 14/03/1994.

const linhasRondas = () => {
  // caderno de rondas da guarita: datas crescentes de 1979 a 1994, sempre a mesma frase
  const out = [], ini = Date.UTC(1979, 2, 14), fim = Date.UTC(1994, 2, 13), dia = 864e5;
  const n = Math.round((fim - ini) / dia);
  const fmt = t => { const d = new Date(t); return `${String(d.getUTCDate()).padStart(2, '0')}/${String(d.getUTCMonth() + 1).padStart(2, '0')}/${String(d.getUTCFullYear()).slice(2)}`; };
  let k = 0; for (let i = 0; i < 14; i++) { k += 1 + (i * 7 % 5); out.push(`${fmt(ini + k * dia)} — 21h. Nove badaladas. Ninguém entrou.`); }
  out.push('(...)');
  let j = n - 40; for (let i = 0; i < 9; i++) { j += 2 + (i % 3) * 2; out.push(`${fmt(ini + j * dia)} — 21h. Nove badaladas. Ninguém entrou.`); }
  return { lista: out.join('\n'), noites: n + 1 };
};
const R0 = linhasRondas();

export const MT = {
  rondasNoites: R0.noites,
  notas: [
    { id: "e_envelope", titulo: "Envelope da fita", secreta: true,
      texto: "(um envelope pardo, amassado de tanto ser aberto e fechado)\n\nPara: LIA MORAES — Rua das Acácias, 112 — Taubaté\nRemetente: (em branco)\n\nCarimbo dos Correios:\nAGÊNCIA SÃO LÁZARO — 14 MAR 1979 — 21h\n\n(dentro, uma foto 3x4 de duas crianças e um bilhete da mãe, preso com clipe)\n\"Filha, não vai lá. Eu já perdi um.\"" },
    { id: "e_livro", titulo: "Livro de quem subiu", secreta: true,
      texto: "(caderno de capa dura no balcão. Na capa, a canivete: QUEM SUBIU)\n\n02/11/1980 — Dois rapazes de moto. Iam \"caçar fantasma\". — não voltou\n17/06/1983 — Delegado Arantes, com dois soldados. — não voltou\n09/09/1986 — Sérgio Lima, repórter do Vale. Levou gravador. — não voltou\n21/04/1988 — Dona Cida Ribeiro, mãe do Tomé. Levou um bolo. — não voltou\n14/03/1991 — Padre Lúcio. Ia benzer a capela. — não voltou\n30/12/1992 — Moça de Taubaté. Não quis dizer o nome. — não voltou\n\n(a última linha está com a tinta ainda molhada, na mesma letra trêmula)\n14/03/1994 — Lia Moraes. Irmã do menino. — {hora} —{desfecho}" },
    { id: "e_fiado", titulo: "Caderneta de fiado", secreta: true,
      texto: "POSTO SERRA — FIADO\n\nMoacir D. — 1 pilha grande\nMoacir D. — 1 pilha grande\nMoacir D. — 4 dúzias de pilha (pra quê, se não enxerga?)\nIrmã Celeste — velas, 9 caixas — 14/03\nDiretor Albano — querosene, 2 latas — 14/03 — NÃO PAGOU\nIrmã Celeste — 20 L de gasolina — 14/03 — \"pra levar os meninos embora amanhã cedo\". Paga depois.\n\n(as páginas seguintes, de 1979 a 1994, todas na mesma letra)\nMoacir — pilha\nMoacir — pilha\nMoacir — pilha\n\n(na contracapa)\nSe assobiar no mato, deixa fumo de corda na capelinha. Ele gosta. — J." },
    { id: "e_jornal", titulo: "Jornal no balcão", secreta: true,
      texto: "GAZETA DA SERRA — 15 de março de 1994\n\nCARRO ABANDONADO NA ESTRADA VELHA\nUm sedã cinza foi encontrado na madrugada de hoje com uma árvore caída à frente, faróis queimados e o pisca-alerta ligado. A motorista, de 29 anos, moradora de Taubaté, não foi encontrada. Havia marcas de mão do lado de dentro do vidro traseiro.\nA estrada velha, que leva ao antigo Internato São Lázaro, está interditada desde 1979.",
      textoDepois: "GAZETA DA SERRA — 15 de março de 1994\n\nINTERNATO SÃO LÁZARO DESABA DURANTE A MADRUGADA\nO prédio abandonado desde o incêndio de 1979 veio abaixo por volta das 23h. Moradores dizem que, pela primeira vez em quinze anos, o sino não tocou às nove.\nUma moça de Taubaté foi vista descendo a estrada velha a pé, sozinha, de manhã cedo. Disse apenas: \"Agora eles dormem.\"" },
    { id: "e_mural", titulo: "Mural do posto", secreta: true,
      texto: "(um quadro de cortiça cheio de recortes, fotos e bilhetes. Em cada foto, a mesma caneta escreveu NÃO VOLTOU)\n\n\"Rosa, a mamãe ainda deixa a janela aberta.\" (1966)\n\"Ana Luísa, a luz da varanda fica acesa até você chegar.\" (1979)\n\"Padre Lúcio — quem souber, ligue para a paróquia.\" (1991) — NÃO VOLTOU\n\"Sérgio, o jornal ainda guarda a sua mesa.\" (1986) — NÃO VOLTOU\n\n(no canto, presa com um alfinete, uma foto instantânea novinha: um carro cinza parado na estrada, com uma árvore caída na frente. A foto foi tirada de cima. Do alto do teto do carro.)" },
    { id: "e_rascunhos", titulo: "Rascunhos das regras", secreta: true,
      texto: "(folhas amassadas atrás do balcão. Versões antigas das regras, riscadas. Ao lado de cada uma, um nome)\n\n\"Corra para a capela.\" — riscado — Luiz\n\"Esconda-se no porão.\" — riscado — Maria das Dores\n\"Se ele chamar, responda baixinho.\" — riscado — Zezinho\n\"Apague a luz e fique no escuro.\" — riscado — Rosa\n\"Não olhe para a menina.\" — riscado, com força — (o nome foi rasgado do papel)\n\n(embaixo, letra de velho)\nCada regra custou um. Não me deixe escrever outra." },
    { id: "e_cartas", titulo: "Cartas dos que saíram", secreta: true, texto: "" },
    { id: "e_chamada", titulo: "Lista de chamada do ônibus", secreta: true,
      texto: "INTERNATO SÃO LÁZARO — TRANSPORTE\nVolta das férias — 14/03/1979 — motorista: J. Silva\n\n37 nomes. 34 com um tique de caneta azul ao lado.\n\nAna Luísa Prado ..... [  ]\nDavi Moraes ........ [  ]\nTomé Ribeiro ....... [  ]\n\n(na margem, a lápis, letra de criança)\na gente não subiu no ônibus. a gente tava no sino." },
    { id: "e_orelha", titulo: "Bilhete na orelha de cera", secreta: true,
      texto: "(uma orelha de cera, do tamanho de uma de verdade, pendurada no oratório por um barbante. Enrolado nela, um papel amarelado)\n\nque eu pare de ouvir.\nque eu pare de ouvir eles respirando dentro dos armários.\nque eu pare de ouvir o sino.\n— M." },
    { id: "e_rondas", titulo: "Caderno de rondas da guarita", secreta: true,
      texto: "GUARITA DO PORTÃO — RONDAS\n\n14/03/79 — 20h50. Tudo calmo. Crianças na cama.\n14/03/79 — 21h. O sino tocou. FOGO NA CAPELA. Fui buscar os três.\n" + R0.lista + "\n\n(a última linha, com a tinta ainda molhada)\n" + (R0.noites) + "ª noite. A irmã do menino chegou." },
    { id: "e_ponto", titulo: "Recados no ponto de ônibus", secreta: true,
      texto: "(escritos a caneta e a canivete no concreto do ponto)\n\nÚLTIMO ÔNIBUS 21h00 — (riscado, e por cima:) NÃO PASSA MAIS\nouvi o sino de novo — 1983\nminha irmã entrou e não saiu — 1990\nNÃO RESPONDE\nSÉRGIO VOLTA PRA CASA\neles contam até dez\n\n(no banco, uma mochila escolar de 1979 com uma etiqueta: Ana L. P. Dentro, um bilhete)\nmãe, eu espero aqui. se o ônibus vier eu vou." }
  ],
  cartas: [
    "Seu Joaquim,\nfaz dez anos e eu ainda não consigo falar depois das nove. Minha mulher acha que é mania. Não é.\n— Paulo, aluno de 1975",
    "Seu Joaquim,\nmeu filho chora de noite e eu tapo a boca dele. Igual faziam com a gente. Eu paro. Eu juro que eu paro.\n— Cristina, dormitório B",
    "Seu Joaquim,\nobrigado por ter aberto o portão naquela noite. Eu corri descalço até o posto. O senhor me deu o seu casaco.\n— Rafael, 11 anos em 1979",
    "Seu Joaquim,\na Ana ainda conta? Às vezes eu ouço, no banheiro, até dez. Não olho no espelho até acabar.\n— Lúcia, dormitório C",
    "Seu Joaquim,\num dia eu vou ter coragem de voltar e tocar o sino com eles. Não hoje.\n— Márcio, 1979"
  ],
  fita: { id: "f_rep", titulo: "Fita do repórter — 1986", secreta: true, linhas: [
    { quem: "voz", texto: "(um homem, ofegante) Sérgio Lima, Jornal do Vale, nove de setembro de oitenta e seis. Vinte horas e cinquenta." },
    { quem: "voz", texto: "Deixei o Fusca na estrada. O velho do posto disse pra eu não subir. Engraçado, ele não tem reflexo no vidro." },
    { quem: "voz", texto: "(um sino, longe. Nove vezes.) ...São nove. Tá tocando. Não tem ninguém na capela, eu tô vendo daqui." },
    { quem: "voz", texto: "(sussurrando) tem uma menina no portão. Contando. Ela tá de costas pra mim. Um... dois..." },
    { quem: "voz", texto: "(a fita chia. Depois, bem perto do microfone, uma voz de criança) ...dez." }
  ] },
  falas: {
    est_tronco: [{ quem: "lia", texto: "Corte reto. De serrote. Essa árvore não caiu... alguém fechou a estrada de propósito." }],
    est_serrote: [{ quem: "lia", texto: "J.S. gravado no cabo. E a ferrugem tá molhada de chuva de hoje." }],
    est_tapume: [{ quem: "lia", texto: "'Não responde.' 'Eles contam.' Quem escreveu isso já sabia o que tem lá em cima." }],
    est_portaluvas: [{ quem: "lia", texto: "Agência São Lázaro... em 1979? Esse envelope foi postado na noite do incêndio. E chegou semana passada." }],
    est_polaroid: [{ quem: "lia", texto: "Isso não tava no para-brisa quando eu saí de casa. Sou eu e o Davi. No portão. O dia em que deixaram ele lá." }],
    est_polaroid_raio: [{ quem: "lia", texto: "Tinha alguém atrás da gente na foto. Alto. Com um pano nos olhos. Eu juro que tinha." }],
    est_cruz: [{ quem: "lia", texto: "'Joaquim Silva. 14 de março de 1979.' Flores frescas. Quem traz flor pra alguém que morreu há quinze anos?" }],
    est_cruz_depois: [{ quem: "lia", texto: "A cruz na estrada... Joaquim Silva. Eu li o nome dele. Eu li e entrei mesmo assim." }],
    est_oratorio: [{ quem: "lia", texto: "Davi. Ana. Tomé. E essa... sou eu. De costas, do lado do carro. Tirada hoje." }],
    est_oratorio_vela: [{ quem: "lia", texto: "A vela do meio tava apagada. Agora tá acesa." }],
    est_fumo: [{ quem: "lia", texto: "Fumo de corda. 'Se assobiar no mato, deixa na capelinha.' Ele escreveu isso pra quem?" }],
    est_fumo_deixou: [{ quem: "lia", texto: "Pronto. Tá aí. ...O assobio parou." }],
    est_assobio: [{ quem: "lia", texto: "Tem alguém assobiando no mato. Acompanhando o meu passo." }],
    est_ponte: [{ quem: "lia", texto: "As tábuas... qualquer passo ecoa. E algo respondeu lá do mato." }],
    est_onibus: [{ quem: "lia", texto: "Trinta e sete nomes. Trinta e quatro com tique. Os três que faltam são eles." }],
    est_onibus_mao: [{ quem: "lia", texto: "Tinha uma mão no vidro. Pequena. Por dentro." }],
    est_ponto: [{ quem: "lia", texto: "'Mãe, eu espero aqui.' A Ana tentou ir embora. Ela esperou um ônibus que nunca veio." }],
    est_livro: [{ quem: "lia", texto: "Ninguém voltou. Nenhum. E a última linha... é o meu nome. Escrito antes de eu chegar." }],
    est_jornal: [{ quem: "lia", texto: "Quinze de março. Isso é o jornal de amanhã. 'A motorista não foi encontrada.'" }],
    est_jornal_bom: [{ quem: "lia", texto: "'Agora eles dormem.' ...Fui eu que disse isso. Amanhã." }],
    est_fiado: [{ quem: "lia", texto: "Pilha, pilha, pilha. Quinze anos de pilha. Pra que um cego compra pilha?" }],
    est_cafe: [{ quem: "lia", texto: "O café ainda tá soltando fumaça." }],
    est_cafe_frio: [{ quem: "lia", texto: "Tá gelado. Tem mofo por cima. Há anos." }],
    est_secretaria_fim: [{ quem: "lia", texto: "Essa é a minha voz. Eu nunca liguei pra esse lugar. Eu nem sabia que ele existia." }],
    est_mural: [{ quem: "lia", texto: "Essa foto é do meu carro. Tirada de cima. Do teto. Agora há pouco." }],
    est_rascunhos: [{ quem: "lia", texto: "Cada regra custou uma criança. Ele foi aprendendo com quem não voltava." }],
    est_cartas: [{ quem: "lia", texto: "Eles saíram. Mas nunca saíram de verdade." }],
    est_foto1: [{ quem: "lia", texto: "'São Lázaro, 1978. Zelador.' É ele, mais novo. Com as crianças no portão. Ele cuidava deles." }],
    est_foto2: [{ quem: "lia", texto: "Tinha quatro crianças nessa foto. Agora tem três." }],
    est_foto3: [{ quem: "lia", texto: "O rosto dele sumiu da foto. Só ficou a mancha de luz." }],
    est_cracha: [{ quem: "lia", texto: "Zelador do internato, de 1958 a 1979. Ele trabalhava lá. Até o fim." }],
    est_macacao: [{ quem: "lia", texto: "'J. Silva — Zelador.' A barra tá queimada. Ainda cheira a fumaça." }],
    est_macacao_vazio: [{ quem: "lia", texto: "O macacão tá balançando. Como se alguém tivesse acabado de tirar." }],
    est_tv: [{ quem: "lia", texto: "Por um segundo, o chuvisco fez uma capela. Com um sino." }],
    est_tv_volta: [{ quem: "lia", texto: "Eu desliguei essa TV." }],
    est_tigela: [{ quem: "lia", texto: "'Tufão.' Água fresquinha na tigela. E nenhum cachorro." }],
    est_placa: [{ quem: "lia", texto: "Alguém riscou o 'São' e escreveu 'Silêncio' por cima. Com letra de criança." }],
    est_asilo: [{ quem: "lia", texto: "'Asilo-colônia'? Por baixo da tinta tem outra placa. Ninguém nunca falou de asilo." }],
    est_km: [{ quem: "lia", texto: "Fitinhas com nome de família. Prado, Ribeiro... Moraes. A dos Moraes é nova." }],
    est_km_mudou: [{ quem: "lia", texto: "Esse marco dizia dois. Agora diz nove. Eu tô andando pra trás?" }],
    est_cruzes: [{ quem: "lia", texto: "Um repórter. Um padre. Uma moça de Taubaté. Eu não sou a primeira." }],
    est_cruz_nova: [{ quem: "lia", texto: "Essa aqui é nova. A madeira ainda tá clara. E não tem nome... ainda." }],
    est_cruzinhas: [{ quem: "lia", texto: "Três cruzinhas sem nome. Uma fita de cabelo, uma rodinha azul, uma folha de caderno." }],
    est_cruzinhas_volta: [{ quem: "lia", texto: "Os três. Alguém marca eles aqui também." }],
    est_fitas: [{ quem: "lia", texto: "Uma fita rosa com 'ANA' bordado. Alguém ainda vem aqui rezar por eles." }],
    est_bicicleta: [{ quem: "lia", texto: "'S. Lázaro, número 23.' Uma bicicleta de criança. Queimada." }],
    est_outdoor: [{ quem: "lia", texto: "'Disciplina e fé.' Rasparam os olhos de todas as crianças." }],
    est_outdoor_raio: [{ quem: "lia", texto: "O homem alto do fundo do cartaz... não tá mais lá." }],
    est_fusca: [{ quem: "lia", texto: "Um Fusca coberto de musgo. Crachá de imprensa, 1986. As marcas de mão no vidro são pequenas. E estão por fora." }],
    est_kombi: [{ quem: "lia", texto: "O rádio do meu carro... ligou sozinho lá atrás." }],
    est_muro: [{ quem: "lia", texto: "Nomes, datas... 'Lia esteve aqui.' Essa letra é minha. Eu nunca vim aqui." }],
    est_maos: [{ quem: "lia", texto: "Mãozinhas de cal, em fila. Trinta e quatro. E três buracos no meio." }],
    est_maos_cheias: [{ quem: "lia", texto: "Os três buracos da fila... agora têm mão. De tinta fresca." }],
    est_lema: [{ quem: "lia", texto: "'Silentium salvat.' O silêncio salva. Foi isso que ensinaram pra eles." }],
    est_lema_caido: [{ quem: "lia", texto: "'Acolher em silêncio.' Alguém riscou o 'acolher'." }],
    est_guarita: [{ quem: "lia", texto: "Quinze anos de rondas. Toda noite a mesma linha. Ele esperou aqui o tempo todo." }],
    est_guarita_vidro: [{ quem: "lia", texto: "'6?' escrito com o dedo no vidro embaçado. Por dentro." }],
    est_capa_sumiu: [{ quem: "lia", texto: "A capa de chuva que tava no prego da guarita... sumiu." }],
    est_lampiao: [{ quem: "lia", texto: "Seu Joaquim? Ele tá balançando a cabeça. Não. Não. Não." }],
    est_guia: [{ quem: "lia", texto: "Uma luz. Alguém com lampião, lá na frente. Mostrando o caminho." }],
    est_menina_cena: [{ quem: "lia", texto: "(sussurrando) Tinha uma menina na beira da estrada..." }],
    est_placar: [{ quem: "lia", texto: "DAV, ANA, TOM. As iniciais deles. E o primeiro lugar... sou eu." }],
    est_radio_live: [{ quem: "lia", texto: "Ele tá falando de mim. Agora." }]
  },
  // recados da secretária eletrônica do posto
  recados: [
    { quem: "radio", texto: "(recado 1 — março de 1979) Seu Joaquim, aqui é a mãe do Tomé. Ninguém atende no internato. Ele tá bem? Me liga." },
    { quem: "radio", texto: "(recado 4 — 1979) Joaquim, é o Bispo. Pelo bem da diocese, peço discrição sobre a capela. Não fale com jornalista." },
    { quem: "radio", texto: "(recado 7 — 1986) Sérgio Lima, do Jornal do Vale. Vou subir sábado. Deixa o portão aberto pra mim?" },
    { quem: "radio", texto: "(recado 11 — 1991) Joaquim, é o padre Lúcio. Eu vou benzer a capela. Reza por mim." },
    { quem: "radio", texto: "(recado 14 — sem data) (só respiração. Muito perto do fone. Depois, nove batidas de unha no plástico.)" },
    { quem: "lia", texto: "(recado 15 — ontem) Seu Joaquim? Aqui é a Lia Moraes. Eu chego amanhã à noite. Deixa a chave no prego." }
  ],
  // rádio do carro: estações novas
  radioNome: (n) => ({ quem: "radio", texto: `(locutor animado) ...e vai um abraço pra ${n}, que tá ouvindo a gente lá da estrada velha. Cuidado com o portão, viu? Ele tá aberto pra você.` }),
  radioOntem: (n) => ({ quem: "radio", texto: `(locutor, sério) ...ontem à noite, ${n} não voltou pra casa. O carro continua na estrada velha. Com o pisca ligado.` }),
  radioVivo: {
    perto: "(ao vivo) ...uma mulher foi vista agora há pouco perto de um carro cinza na estrada velha... ela está olhando o rádio.",
    longe: "(ao vivo) ...a mulher do carro cinza se afastou. Está sozinha. Quer dizer... está quase sozinha.",
    costas: "(ao vivo) ...ela está de costas para a mata. Não devia."
  },
  conquistas: [
    { id: "revelada", nome: "Revelada", desc: "Olhe a foto do para-brisa no clarão de um relâmpago.", secreta: true, dica: "Algumas fotos só mostram tudo no clarão." },
    { id: "caixa_postal", nome: "Caixa Postal", desc: "Ouça todos os recados da secretária eletrônica do posto.", secreta: true, dica: "Quinze recados esperando alguém." },
    { id: "oferenda", nome: "Oferenda", desc: "Deixe fumo de corda na capelinha da estrada.", secreta: true, dica: "Se assobiar no mato..." },
    { id: "recorde", nome: "Recorde", desc: "Ponha o seu nome no placar do fliperama.", secreta: true, dica: "Insira ficha. Três vezes." }
  ]
};

export function mesclarMundo(R) {
  if (!R) return;
  if (R.notas) for (const n of MT.notas) if (!R.notas.some(x => x.id === n.id)) R.notas.push(n);
  if (R.fitas && !R.fitas.some(x => x.id === MT.fita.id)) R.fitas.push(MT.fita);
  if (R.falas) for (const k in MT.falas) if (!R.falas[k]) R.falas[k] = MT.falas[k];
  if (R.conquistas) for (const c of MT.conquistas) if (!R.conquistas.some(x => x.id === c.id)) R.conquistas.push(c);
  const c = R.notas && R.notas.find(x => x.id === 'e_cartas'); if (c && !c.texto) c.texto = MT.cartas[0];
}
try { mesclarMundo(window.ROTEIRO); } catch (e) {}
