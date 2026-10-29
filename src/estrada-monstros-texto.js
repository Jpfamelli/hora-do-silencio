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
    // perseguição — momentos novos
    perseg_corta: [{ quem: "lia", texto: "Outro. Na minha frente agora. Entre mim e o portão." }],
    perseg_buzina: [{ quem: "lia", texto: "O carro tá buzinando sozinho lá atrás. Chamando ele." }],
    perseg_quase: [{ quem: "lia", texto: "A mão dele passou no meu cabelo. ANDA." }]
  }
};
export function mesclarMonstros(R) {
  if (!R || !R.falas) return;
  for (const k in TXT5.falas) if (!R.falas[k]) R.falas[k] = TXT5.falas[k];
}
