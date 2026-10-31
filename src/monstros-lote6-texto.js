// MONSTROS E IA, lote 6 — texto da rejogabilidade das entidades (falas, legendas, conquistas).
// Importado por src/monstros-lote6.js. As conquistas novas entram em window.ROTEIRO.conquistas na importação.
export const TX6 = {
  // leituras de humor do Inspetor (ditas pela Lia como desconfiança, nunca com o nome do humor)
  humor: {
    paciente: '(Ele está sem pressa esta noite. Abre cada porta, escuta cada canto.)',
    nervoso: '(Hoje ele reage a qualquer barulho. Está agitado.)',
    metodico: '(Ele anda na mesma ordem de sempre. Dá para prever.)',
    surdo: '(Parece que ele não está ouvindo bem de um lado.)',
    faminto: '(Ele avança mais rápido do que devia. E não desiste.)',
    teimoso: '(Quando ele acha que ouviu algo, não larga o osso.)'
  },
  // a casa aprendeu você (só da segunda noite em diante)
  sabeCanto: ['(Ele foi direto no meu armário de sempre.)', '(Terceira vez que escolho esse canto... e ele sabe.)', '(Ele anda sabendo onde eu gosto de sumir.)'],
  sabeRota: '(Ele está rondando justo por onde eu mais passo.)',
  sabeVicio: '(A garrafa não engana mais ele como antes.)',
  ecoMorte: '(Foi aqui que ele me pegou da última vez.)',
  // blefe / fingir que foi embora
  blefe: '(Os passos se afastaram... mas eu não ouvi porta nenhuma.)',
  surda: '(Ele parou. Não me ouviu? ...ou está fingindo?)',
  relampago: '(Dessa vez ele desistiu rápido. Nem toda noite é igual.)',
  errante: '(Uma porta bateu sozinha lá dentro. Tem mais alguém andando por aqui.)',
  // humores todos vistos / recordes
  recordeCola: 'Você dançou com ele por {t}.',
  // vigília (Novo Jogo +)
  vigilia: 'Vigília {n}. Ele lembra de você.',
  vigiliaPrim: 'Ele sabe o seu nome agora. E não vai esquecer.',
  contaMortes: 'Já são {n}...',
  // lendas da noite (raras)
  lenda: {
    manso: '(A noite está calma demais. Ele quase não me procura. Por que será?)',
    implacavel: '(Hoje ele não recua de jeito nenhum. Não dá trégua.)',
    lua: '(Tem algo pior nele esta noite. É como se fossem dois de uma vez.)'
  },
  // anti-enrolação (Maestro) e estreia
  maestro: '(Fiquei tempo demais parada. Ele está ficando atento a este canto.)',
  primeira: '(Primeira vez que o vejo esta noite. Meu peito gela.)',
  // modos
  modoVigia: 'Modo Vigia Eterno: ele nunca desiste de uma caçada.',
  modoCacador: 'Modo Caçador Implacável: ele sempre sabe para onde você foi, mas anda devagar.',
  modoFuror: 'Modo Inspetor Enfurecido: cada capítulo já começa com ele procurando.',
  modoFaro: 'Modo Faro: ele tem sempre uma noção grosseira de onde você está.',
  modoCedo: 'Modo Noite Adiantada: ele já começa a campanha mais rápido e atento.',
  modoPersegue: 'Modo Perseguição Eterna: depois do primeiro contato, ele nunca mais se acalma no capítulo.',
  modoSemPausa: 'Modo Sem Pausas: ele nunca mais reza nem para para lembrar. Some a janela segura.',
  modoDobro: 'Modo Lua Cheia: toda noite ele carrega dois temperamentos somados.',
  modoAnaRapida: 'Mutador Contagem Apressada: a Menina conta bem mais rápido.',
  modoPacto: 'Pacto: o Inspetor fica mais rápido, ouve melhor e revista cada canto. O perfil mais duro.',
  modoLimpo: 'Modos extras desligados.'
};

// conquistas novas (rejogabilidade das entidades) — passivas, à prova de erro
try {
  const R = window.ROTEIRO;
  if (R && Array.isArray(R.conquistas)) {
    const novas = [
      { id: 'l6_danca', nome: 'Dança Macabra', desc: 'Fique um minuto inteiro na cola do Inspetor sem ser pega.', secreta: true },
      { id: 'l6_variou', nome: 'Nunca No Mesmo Canto', desc: 'Passe um capítulo sem repetir o mesmo tipo de esconderijo.', secreta: true },
      { id: 'l6_vigilia', nome: 'Ele Lembra de Você', desc: 'Comece uma Vigília (Novo Jogo +) depois do final verdadeiro.', secreta: true },
      { id: 'l6_humores', nome: 'Eu Te Conheço', desc: 'Leia todos os humores do Inspetor ao longo das noites.', secreta: true },
      { id: 'l6_sem_fav', nome: 'Rota Nova', desc: 'Zere um capítulo sem usar o esconderijo que ele vigia.', secreta: true },
      { id: 'l6_lenda', nome: 'Noite de Lenda', desc: 'Sobreviva a uma das noites lendárias (manso, implacável ou lua cheia).', secreta: true },
      { id: 'l6_lua', nome: 'Lua Cheia', desc: 'Presencie uma noite em que ele carrega dois temperamentos ao mesmo tempo.', secreta: true }
    ];
    for (const c of novas) if (!R.conquistas.some(x => x.id === c.id)) R.conquistas.push(c);
  }
} catch (e) {}
