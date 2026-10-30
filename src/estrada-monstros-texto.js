// Texto NOVO do Lote 5 (monstros do prólogo). Fica separado para não conflitar com roteiro.js
// nem com estrada-roteiro.js. As falas são mescladas em window.ROTEIRO.falas (só as que faltam).
export const TXT5 = {
  falas: {
    // o batedor de 1979 (só anda quando você para)
    batedor_1: [{ quem: "lia", texto: "Lá no fim da estrada... tem um homem parado. Olhando pra cá." }],
    batedor_anda: [{ quem: "lia", texto: "Ele não mexe os pés. Mas tá mais perto. Ele chega quando eu paro." }],
    batedor_perto: [{ quem: "lia", texto: "Para de parar, Lia. Anda. Enquanto você anda, ele fica." }],
    batedor_fim: [{ quem: "lia", texto: "O portão. Chega nele e esse homem some. É o Seu Joaquim. Era." }],
    // o acompanhante pela borda da mata (vira o rosto quando você para)
    acompanha_1: [{ quem: "lia", texto: "Tem alguém andando comigo. Pela beira do mato. No meu passo." }],
    acompanha_olhar: [{ quem: "lia", texto: "Toda vez que eu paro, ele vira o rosto pra mim. Devagar." }],
    // o vulto treinado pelos faróis (abertura)
    farol_vulto: [{ quem: "lia", texto: "Na luz dos faróis ele congela. No escuro, ele anda. Lembra disso." }],
    // aparências
    vulto_molhado: [{ quem: "lia", texto: "Ele tá encharcado. Pingando. Não choveu aqui ainda." }],
    vulto_crianca: [{ quem: "lia", texto: "É pequeno. Do tamanho de uma criança. De pé no acostamento." }],
    vulto_sem_rosto: [{ quem: "lia", texto: "Onde era o rosto... não tem nada. Só um claro liso." }],
    vulto_costas: [{ quem: "lia", texto: "Ele tá de costas. Mas a cabeça tá virada pra mim." }],
    vulto_alto: [{ quem: "lia", texto: "Alto demais pra ser gente. A cabeça passa da copa das árvores." }],
    vulto_sombra: [{ quem: "lia", texto: "Fino como um recorte. Uma sombra de pé, sem ninguém pra fazer sombra." }],
    vulto_quebrado: [{ quem: "lia", texto: "O pescoço... tá torto pro lado errado. E mesmo assim me encara." }],
    // perseguição — momentos novos
    perseg_corta: [{ quem: "lia", texto: "Outro. Na minha frente agora. Entre mim e o portão." }],
    perseg_buzina: [{ quem: "lia", texto: "O carro tá buzinando sozinho lá atrás. Chamando ele." }],
    perseg_quase: [{ quem: "lia", texto: "A mão dele passou no meu cabelo. ANDA." }],
    perseg_luz_atras: [{ quem: "lia", texto: "Os faróis acenderam de novo. Minha sombra andou sozinha na frente." }],
    perseg_passos: [{ quem: "lia", texto: "Passos atrás de mim. No cascalho. Não são os meus." }],
    // o batedor — contra-jogo da lanterna e o facho falso
    batedor_facho: [{ quem: "lia", texto: "Com a luz em cima dele, ele trava. Mas a pilha some rápido assim." }],
    batedor_isca: [{ quem: "lia", texto: "Uma luzinha fraca do outro lado. Como a minha. Não é ele... é?" }],
    batedor_isca_revela: [{ quem: "lia", texto: "Não era lanterna nenhuma. E agora ele tá bem mais perto." }],
    batedor_sem_pilha: [{ quem: "lia", texto: "A pilha morreu. Agora só me resta andar. Anda, Lia." }],
    batedor_costas: [{ quem: "lia", texto: "Quando eu não olho, ele cresce. Encosta. Preciso olhar... mas aí ele para." }],
    // os faróis que acendem sozinhos na abertura
    farois_sozinhos: [{ quem: "lia", texto: "Os faróis... acenderam sozinhos. Tinha um homem parado na frente. E apagou." }],
    // olhar para trás perto do carro
    retro_joaquim: [{ quem: "lia", texto: "No retrovisor. Uns metros atrás. Parado. Olhando pra mim." }],
    retro_sumiu: [{ quem: "lia", texto: "Virei pra frente, voltei... e ele não tava mais lá." }],
    banco_tras: [{ quem: "lia", texto: "Tinha alguém sentado no banco de trás. O rosto virado pra mim." }],
    // o clarão e a porta do motorista
    banco_clarao: [{ quem: "lia", texto: "Um clarão. Uma sombra alta sentada atrás. Acho que fechei os olhos." }],
    porta_abriu: [{ quem: "lia", texto: "A porta do motorista... tá aberta. Eu não abri essa porta." }],
    // mais perseguição e noites repetidas
    perseg_chamado: [{ quem: "lia", texto: "Minha mãe me chamando. De dois lados ao mesmo tempo. Não é ela." }],
    perseg_rosto: [{ quem: "lia", texto: "Não olha pra trás. Da última vez tinha um rosto colado no meu." }],
    batedor_conta_fim: [{ quem: "lia", texto: "Ele parou de contar. Chegou no um." }],
    batedor_de_novo: [{ quem: "lia", texto: "Outra vez essa estrada. E ele já começa mais perto." }],
    acompanha_dois: [{ quem: "lia", texto: "Agora são dois. Um de cada lado do mato. No meu passo." }],
    banco_bate: [{ quem: "lia", texto: "Bateu no vidro. De dentro do carro. Com a unha." }],
    joaquim_anda: [{ quem: "lia", texto: "Ele deu um passo pra trás. Pra dentro do escuro. Sem virar as costas." }],
    vulto_janela: [{ quem: "lia", texto: "Tinha um rosto na janela da loja. No lugar onde o Seu Joaquim tava sentado." }],
    passos_posto: [{ quem: "lia", texto: "Passos no cascalho do pátio. Devagar. Parando quando eu paro." }]
  }
};
export function mesclarMonstros(R) {
  if (!R || !R.falas) return;
  for (const k in TXT5.falas) if (!R.falas[k]) R.falas[k] = TXT5.falas[k];
}
