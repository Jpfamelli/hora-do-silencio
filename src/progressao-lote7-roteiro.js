// PROGRESSÃO — LOTE 7 (texto): som e atmosfera na progressão. Desafios sonoros, caderno de sons, silêncios,
// grade da rádio, conquistas de ouvido, teste de fones e ajuda auditiva. Só texto e definições; a lógica
// vive em src/progressao-lote7.js. Empurra para window.ROTEIRO na importação.
(function () {
  const R = window.ROTEIRO; if (!R) return;
  R.progressao = R.progressao || { capitulos: {}, conquistas: [] };

  const CONQ = [
    { id: 'l7_orelha_nua', nome: 'Orelha Nua', desc: 'Termine o Capítulo III no desafio Só a Casa: sem música, sem legenda de perigo.' },
    { id: 'l7_olhos_fechados', nome: 'De Olhos Fechados', desc: 'Termine um capítulo no desafio Só pelo Som: sem HUD, sem legenda, a vinheta quase fechada.', secreta: true },
    { id: 'l7_radio_mudo', nome: 'Rádio Mudo', desc: 'Termine um capítulo no desafio Rádio Mudo: nada avisa, só o que você ouve.' },
    { id: 'l7_noite_muda', nome: 'Noite Muda', desc: 'Atravesse o Capítulo II no desafio Noite Muda, com a Hora do Silêncio durando o dobro.' },
    { id: 'l7_quatro_modos', nome: 'Quatro Silêncios', desc: 'Termine um capítulo em cada um dos quatro desafios sonoros.', secreta: true },
    { id: 'l7_silencio_absoluto', nome: 'Silêncio Absoluto', desc: 'Chegue ao último degrau de silêncio, a casa prendendo o ar, sem ter feito nenhum barulho alto na noite.', secreta: true },
    { id: 'l7_silencio_total', nome: 'Nem a Casa Te Ouviu', desc: 'Atravesse um corredor longo inteiro sem fazer som acima do que o Inspetor escuta.', secreta: true },
    { id: 'l7_ouvido_gato', nome: 'Ouvido de Gato', desc: 'Esconda-se três vezes na mesma noite antes de ver o Inspetor, só pelo som dele chegando.' },
    { id: 'l7_60s', nome: 'Sessenta Segundos', desc: 'Fique um minuto numa sala, sem lanterna e sem fazer som, com o Inspetor solto na casa.' },
    { id: 'l7_cantor_calado', nome: 'Cantor Calado', desc: 'Fique parada durante as nove badaladas, sem um passo e sem um ruído.', secreta: true },
    { id: 'l7_tinha_alguem', nome: 'Tinha Alguém Aí?', desc: 'Olhe para trás logo depois de ouvir o sussurro.', secreta: true },
    { id: 'l7_orelha_absoluta', nome: 'Orelha Absoluta', desc: 'Vire para o lado certo antes de ver o Inspetor oito vezes no mesmo capítulo.' },
    { id: 'l7_goteira', nome: 'A Goteira Inteira', desc: 'Fique parada por sessenta segundos só para escutar a casa.', secreta: true },
    { id: 'l7_so_de_ouvido', nome: 'Só de Ouvido', desc: 'Termine um capítulo com a lanterna acesa em menos de um quinto do tempo.' },
    { id: 'l7_ouvido_cao', nome: 'Ouvido de Cão', desc: 'Escute cinco sons raros da casa.' },
    { id: 'l7_noite_calada', nome: 'Noite Calada', desc: 'Termine a noite inteira sem fazer barulho alto por mais de vinte segundos.', secreta: true },
    { id: 'l7_pe_pluma', nome: 'Pé de Pluma', desc: 'Termine um capítulo sem fazer barulho na maior parte do tempo.' },
    { id: 'l7_pluma_ouro', nome: 'Pluma de Ouro', desc: 'Pé de Pluma em três capítulos da mesma noite.', secreta: true },
    { id: 'l7_sombra', nome: 'Sombra', desc: 'Passe pelo menos 40% de um capítulo em silêncio.' },
    { id: 'l7_furtiva_ouro', nome: 'Furtiva de Ouro', desc: 'Feche uma noite com o selo de ouro de furtividade.', secreta: true },
    { id: 'l7_caderno_25', nome: 'Primeiras Páginas', desc: 'Escute 25 sons diferentes e veja-os no caderno de sons.' },
    { id: 'l7_dicionario', nome: 'Dicionário de Sons', desc: 'Escute 60 sons diferentes.' },
    { id: 'l7_ouvido_absoluto', nome: 'Ouvido Absoluto', desc: 'Escute 150 sons diferentes da casa.', secreta: true },
    { id: 'l7_sala_som', nome: 'Sala de Som', desc: 'Ouça dez sons de novo na galeria do título.' },
    { id: 'l7_fones', nome: 'Fones no Lugar', desc: 'Faça o teste de fones, os dois ouvidos.' },
    { id: 'l7_orelha_fina', nome: 'Orelha Fina', desc: 'Escute os sete silêncios da casa.', secreta: true },
    { id: 'l7_grade_radio', nome: 'Dial Completo', desc: 'Sintonize as sete estações da casa.' },
    { id: 'l7_estacao_final', nome: 'A Frequência Que Falta', desc: 'Sintonize a estação que só aparece com o dial completo.', secreta: true },
    { id: 'l7_espectro', nome: 'O Rosto na Fita', desc: 'Veja o que a fita 2 desenha quando é vista em frequências.', secreta: true },
    { id: 'l7_audiograma', nome: 'Gráfico da Noite', desc: 'Baixe o audiograma de uma noite.' },
    { id: 'l7_fita_noite', nome: 'Fita Gravada', desc: 'Grave a fita da noite em arquivo.' },
    { id: 'l7_sem_rodinhas', nome: 'Sem Rodinhas', desc: 'Deixe a ajuda auditiva chegar a zero.' },
    { id: 'l7_pena', nome: 'A Pena Que Ressoa', desc: 'Toque a pena do título sete vezes.', secreta: true }
  ];
  R.progressao.conquistas = R.progressao.conquistas || [];
  for (const c of CONQ) {
    if (!R.progressao.conquistas.some(x => x.id === c.id)) R.progressao.conquistas.push(c);
    if (R.conquistas && !R.conquistas.some(x => x.id === c.id)) R.conquistas.push(c);
  }

  const T = {
    hub: {
      titulo: 'Sons e silêncios',
      aviso: 'Tudo aqui nasce de escutar. Nada pede que você volte atrás nem junte coisa repetida.',
      abas: [['caderno', 'Caderno'], ['silencios', 'Silêncios'], ['radio', 'Rádio'], ['desafios', 'Desafios'], ['fones', 'Fones e ajuda'], ['noite', 'Última noite'], ['fita', 'Fita 2']]
    },
    modos: [
      { id: 'acasa', nome: 'Só a Casa', abre: 'sempre', desc: 'Sem música e sem legenda de perigo: só a ambiência e o som real das entidades. Os sustos vêm 20% mais fortes.' },
      { id: 'pelosom', nome: 'Só pelo Som', abre: 'final', desc: 'Sem HUD, sem legenda de som, a vinheta fecha em 85%. Você joga só pelo áudio em 3D.' },
      { id: 'radiomudo', nome: 'Rádio Mudo', abre: 'final', desc: 'Sem música, sem legenda direcional, sem bússola. Os sustos pesam o dobro. Guarda seu recorde de tempo.' },
      { id: 'noitemuda', nome: 'Noite Muda', abre: 'final', desc: 'Sem legenda de perigo e sem música; a Hora do Silêncio dura 40 s em vez de 20. Tem selo e placar próprios.' }
    ],
    modosTxt: {
      travado: 'Abre depois do seu primeiro final.',
      ligado: 'ligado para a próxima noite',
      desligado: 'desligado',
      selo: 'selo de olhos fechados',
      recorde: 'recorde no Rádio Mudo',
      placar: 'melhor Noite Muda'
    },
    termometro: { label: 'Termômetro de silêncio (um brilho discreto na borda que cresce enquanto você faz silêncio)' },
    selosRuido: { ouro: 'ouro', prata: 'prata', bronze: 'bronze' },
    ruido: {
      noite: 'você fez barulho por {t} ({p}% da noite)',
      cap: 'barulho neste capítulo: {t} ({p}%)',
      silencio: 'pontos de silêncio: {s} s ({p}% do capítulo)',
      sombra: 'rank Sombra: você passou boa parte do capítulo em silêncio',
      pluma: 'selo Pé de Pluma: pouco barulho neste capítulo',
      area: 'área sob a curva do ruído: {a}',
      ouviram: 'ele te ouviu {n}x nesta noite',
      orelha: 'você virou para o lado certo {n}x antes de vê-lo',
      orelhaFrase: 'Do rádio, baixinho: "Quem escuta primeiro, vê depois."',
      recorde: 'melhor deste capítulo: {p}% em silêncio'
    },
    frases: {
      silTotal: 'Nem a casa te ouviu.',
      silAbsolutoDavi: 'Lia. Eu só soube que você tinha chegado porque a casa parou de respirar. Fica quieta. Eu fico contigo. — D.',
      sessenta: 'Um minuto inteiro. A casa começou a achar que você era parte dela.',
      goteira: 'Você contou cada pingo. Esta casa tem um ritmo, e ele não é o do relógio.',
      gato: 'Você ouviu ele chegar. Foi para trás da porta antes de ele ter rosto.',
      cantor: 'Nove vezes. Ninguém se mexeu. Nem você.',
      tinha: 'Ninguém. Mas você olhou. A casa gosta de quem olha.'
    },
    sons: {
      novo: 'Novo no caderno de sons: {n}',
      novoRaro: 'Som raro no caderno: {n}',
      vazio: 'Ainda não há nada no caderno. Os sons entram aqui sozinhos, na primeira vez que você os escuta, sem procurar nada.',
      progresso: '{a} de {t} sons escutados',
      raros: 'raros: {a}',
      onde: 'primeira vez em',
      vezes: 'escutado {n}x',
      ouvir: 'ouvir de novo',
      semReplay: 'Esse som só acontece dentro da casa.',
      sempre: 'todos', perigo: 'perigo', historia: 'história', segredo: 'segredo', eu: 'seu corpo', outros: 'outros',
      ensinaCat: {
        p: 'Isto avisa de perigo. Se você escutou, algo já sabe onde você está ou está a caminho.',
        h: 'Isto é a casa contando o que aconteceu aqui em 1979. Não faz mal a você, só conta.',
        s: 'Isto é raro. Quase ninguém para o bastante para ouvir.',
        eu: 'Isto é o seu corpo falando. O medo tem som antes de ter nome.',
        dele: 'Isto é dele. Não responda.',
        '': 'Um som da casa. Escutar é o jeito mais barato de sobreviver a ela.'
      }
    },
    lore: {
      passoMonstro: 'O Inspetor anda de bengala e mancando. Passo duro seguido de passo arrastado: é ele.',
      estalo: 'Ele estala a língua para ouvir o eco dos cômodos. Estalo perto quer dizer parede perto.',
      vidro: 'Vidro quebrado é o jeito mais barato de ele saber onde você esteve.',
      pancada: 'Uma porta que bate sozinha quase nunca é vento.',
      risada: 'A Ana ri quando acha que ganhou. Antes do dez.',
      contagem: 'A Menina Que Conta nunca erra a conta, só a distância.',
      chamadoVoz: 'Chamar pelo nome é a isca mais velha da casa. Quem chama não tem boca.',
      sino: 'O sino da capela só toca inteiro quando alguém precisa ser lembrado de onde está.',
      sinoLonge: 'Um sino vindo de onde não há torre. Já foi capela.',
      badaladas: 'Nove badaladas. A décima é a que mata.',
      estatica: 'O rádio chia antes de algo que não gosta de ser visto.',
      canto: 'Cantiga de roda de quem nunca saiu da roda.',
      procissao: 'Pés descalços aos montes. Esconda-se antes de contá-los.',
      sussurros: 'Sussurro num ouvido só. Olhar para trás, aqui, é um hábito saudável.',
      orelhao: 'O telefone do corredor está desligado desde 1979. Alguém liga assim mesmo.',
      trovao: 'O trovão cobre seus passos. É a única boa notícia da tempestade.',
      coracao: 'Quando você escuta o coração, o medo já passou de um limite.',
      ofego: 'Fôlego curto. Ele também escuta isso.',
      rangido: 'Madeira velha. Cada tábua tem um tom; aprender os tons é mapear a casa de olhos fechados.',
      cano: 'Os canos batem porque alguém, em algum lugar, ainda abre uma torneira.',
      chaves: 'O chaveiro do Inspetor. Chave antes de passo: dá tempo de sumir.',
      cantarola: 'Melodia de boca fechada. Ele a fazia ao rondar, antes de perder a visão.',
      assobio: 'Assobio de quem finge que não está caçando.',
      corneta: 'Os alto-falantes do internato ainda estão ligados ao quarto do diretor.',
      shhh: 'Pedir silêncio é a regra mais antiga da casa. E a mais cruel.',
      radioLiga: 'Rádio que liga sozinho: a Serra FM continua no ar para quem não saiu.',
      futebol: 'Um jogo de 1979 narrado para ninguém. O gol nunca sai.',
      eco: 'Um som que já aconteceu aqui. A casa guarda como quem guarda cartas.',
      reza: 'A Irmã Celeste rezava de madrugada. Ainda reza, mas agora pelo outro lado.',
      hinoCeleste: 'O hino que a Celeste cantava quando as camas ficavam vazias.',
      coroCapela: 'Crianças ensaiando um hino para uma missa que nunca terminou.',
      batidasCapela: 'Batidas por dentro. Quem bate, não quer sair; quer que alguém entre.',
      respiracoes: 'Muitas respirações pequenas. Tente contar e perceba que sobra uma.',
      balde: 'Uma goteira num balde de lata. Se o ritmo muda, alguém mexeu na água.',
      baldeConta: 'Uma vozinha conta os pingos junto com a goteira. Não responda.',
      predioRespira: 'O prédio acomoda o peso de todos que ficaram. Rangidos longos e lentos.',
      vitrola: 'A vitrola toca o hino do internato num disco que nunca foi trocado.',
      vitrolaPula: 'O disco pula sempre no mesmo verso. Aquele verso é a pista.',
      sapos: 'Sapos coaxando longe: o brejo ainda existe atrás do cemitério.',
      saposCalam: 'Quando os sapos se calam de uma vez, algo passou pela água.',
      catavento: 'Um cata-vento enferrujado gira devagar: tem vento onde não deveria.',
      aguaLonge: 'Água correndo sem cano à vista. O túnel respira.',
      ventoFresta: 'Vento nas frestas assobia notas. É assim que a casa canta sem boca.',
      horaSilencio: 'A Hora do Silêncio: a casa inteira prende o ar. Quem respira alto, perde.',
      tercoBalanca: 'Contas de terço batendo na madeira: a Celeste passou por aqui.',
      radioInsp: 'No rádio, a respiração dele. Você a escuta pelo rádio e o rádio nunca erra a distância.',
      l4Radio: 'Um rádio que responde em código. Alguém no subsolo ainda tem o que dizer.',
      s4_radioPorao: 'Rádio amador chiando num porão. O Seu Joaquim tentou avisar o mundo.'
    },
    raros: ['eco', 'baldeConta', 'vitrolaPula', 'saposCalam', 'tercoBalanca', 'radioInsp', 'l4Radio', 's4_radioPorao', 'batidasCapela', 'hinoCeleste', 'coroCapela', 'shhh', 'futebol', 'cantarola', 'assobio', 'respiracoes', 'orelhao', 'catavento'],
    silencios: {
      titulo: 'Os sete silêncios',
      aviso: 'Cada silêncio entra aqui sozinho, quando você o escuta pela primeira vez. Escutar todos abre um filtro de áudio só seu.',
      lista: [
        { id: 'inspetor', nome: 'O silêncio do Inspetor', onde: 'Parada, perto dele, enquanto ele escuta.', lia: 'Ele também prende o ar. Quem cede primeiro, perde.' },
        { id: 'armario', nome: 'O silêncio do armário', onde: 'Escondida num armário, quieta.', lia: 'Dentro do armário o silêncio tem cheiro de madeira velha e de medo de outra pessoa.' },
        { id: 'cama', nome: 'O silêncio da cama', onde: 'Debaixo de uma cama, quieta.', lia: 'Aqui embaixo o chão respira. Eu fico quieta para a gente não acordar.' },
        { id: 'refugio', nome: 'O silêncio do refúgio', onde: 'Numa sala segura, parada.', lia: 'Aqui ninguém me procura. É a única hora em que silêncio é só silêncio.' },
        { id: 'hora', nome: 'O silêncio da Hora', onde: 'Quando a chuva e o vento param.', lia: 'Até a chuva prendeu o ar. A casa inteira está escutando.' },
        { id: 'ana', nome: 'O silêncio do esconde-esconde', onde: 'Quando a Ana conta e você está parada.', lia: 'Sete, oito, nove. O silêncio antes do dez é mais alto que o dez.' },
        { id: 'folego', nome: 'O silêncio do fôlego preso', onde: 'Prendendo o ar dentro do esconderijo.', lia: 'Prendi o ar. Meu coração gritou por mim.' }
      ],
      filtroTitulo: 'Filtro de áudio liberado',
      filtros: [['nenhum', 'Nenhum'], ['gaveta', 'Rádio de gaveta (menos grave e menos agudo)'], ['poco', 'Fundo de poço (som abafado)'], ['agulha', 'Agulha (agudos mais claros)']],
      filtroTrava: 'Os filtros abrem quando você escutar os sete silêncios.'
    },
    radio: {
      titulo: 'Grade da rádio',
      aviso: 'Cada estação entra na grade ao ser escutada. Sete estações abrem a oitava, que não está no dial.',
      grade: [
        { id: 'estatica', freq: '88.1 FM', nome: 'Chiado da madrugada', hora: '23h' },
        { id: 'radioLiga', freq: '90.7 FM', nome: 'Serra FM, programa que liga sozinho', hora: '21h' },
        { id: 'futebol', freq: '94.3 FM', nome: 'Jogo de 1979', hora: '16h' },
        { id: 'corneta', freq: '540 AM', nome: 'Alto-falantes do internato', hora: '21h30' },
        { id: 'radioInsp', freq: '102.5 FM', nome: 'Respiração no rádio', hora: '00h' },
        { id: 's4_radioPorao', freq: '27 MHz', nome: 'Rádio amador do porão', hora: '02h' },
        { id: 'l4Radio', freq: '1.2 AM', nome: 'Código do subsolo', hora: '03h' }
      ],
      final: { freq: '107.9 FM', nome: 'A frequência que falta', hora: '03h07', botao: 'Sintonizar 107.9', texto: 'Uma voz de criança, bem baixa: "Lia, a gente nunca foi embora. A gente ficou escutando você chegar."' },
      trancada: '??? FM'
    },
    desafios: {
      titulo: 'Desafios sonoros',
      aviso: 'Valem para a próxima noite que você começar. Não mexem no jogo comum.',
      tela: { gato: 'Esconderijos antes de ver o inspetor nesta noite: {n}' }
    },
    fones: {
      titulo: 'Teste de fones',
      oferta: 'Quer testar os fones? Dez segundos de áudio guiado.',
      testar: 'Testar (10 s)', agora: 'Agora não',
      passos: ['Escuta pelo ouvido esquerdo...', 'Agora pelo direito...', 'Um sussurro vai de um ouvido ao outro...', 'Um pulso sobe...', 'Alguma coisa vem de trás de você...'],
      perguntaE: 'Você ouviu os três bipes só no ouvido esquerdo?',
      perguntaD: 'E os três bipes mais agudos só no ouvido direito?',
      volume: 'Como ficou o volume?',
      baixo: 'Baixo demais', bom: 'Está bom', alto: 'Alto demais',
      sim: 'Sim', nao: 'Não',
      monoOferta: 'Um dos lados não chegou. Ligar o Som mono para a casa soar nos dois ouvidos?',
      monoLigado: 'Som mono ligado.',
      pronto: 'Teste feito. O volume recomendado ficou guardado.',
      semAudio: 'O navegador não liberou o áudio. Toque em alguma coisa da página e tente de novo.',
      ajuda: {
        titulo: 'Ajuda auditiva',
        desc: 'Nas primeiras noites os avisos de perigo chegam mais claros e demoram mais a sumir. A cada final, ou a cada dez capítulos sem morrer, a ajuda cai 10%. No Pesadelo ela não existe.',
        nivel: 'nível atual',
        travar: 'Travar neste nível (a ajuda não cai mais)',
        zerar: 'Zerar a ajuda agora'
      }
    },
    noite: {
      titulo: 'Última noite',
      vazio: 'Termine uma noite para ver aqui o audiograma dela.',
      legenda: 'Ruído por segundo. Marcas vermelhas: o Inspetor te ouviu. Pontos verdes: silêncio total.',
      baixar: 'Baixar o audiograma (PNG)',
      fita: 'Gravar a fita da noite (.wav, 20 s)',
      gravando: 'Gravando...',
      gravada: 'Fita gravada.',
      erro: 'Seu navegador não conseguiu gravar a fita.',
      eixo: 'tempo da noite'
    },
    fita: {
      titulo: 'Fita 2 em frequências',
      sem: 'Você ainda não achou a fita 2. Quando achar, ela aparece aqui como espectrograma.',
      dica: 'Toque no trecho da fita onde o chiado parece organizado.',
      ouvir: 'Ouvir o espectro',
      revelado: 'Era um rosto. A fita 2 guarda o rosto do Davi em frequências: dois olhos, um nariz e uma boca fechada. No canto: 1979.',
      nota: 'Nota do Davi: "Quando a gente grava o silêncio, o silêncio grava a gente de volta."'
    },
    pena: { dica: 'Pé de Pluma', vazio: '' },
    stats: { sons: 'Sons no caderno', silencios: 'Silêncios escutados', ajuda: 'Ajuda auditiva', radio: 'Estações sintonizadas', plumas: 'Selos Pé de Pluma', galeria: 'Sons ouvidos de novo' },
    pausa: { modos: 'desafios sonoros: {m}', ajuda: 'ajuda auditiva {a}%' }
  };
  R.progressao.lote7 = T;
})();
