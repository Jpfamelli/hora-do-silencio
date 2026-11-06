// PRÓLOGO — Lote 6, 2ª rodada: o POSTO que muda de noite para noite (Seu Joaquim, chave, cartaz, cliente, máquina,
// cardápio, armário do código do dia) e a janela do internato. Chamado por estrada-lote6b.js (mundoL6B).
// Os eventos sorteados da estrada ficam em estrada-lote6b-eventos.js.
import { TXT } from './estrada-roteiro.js';
import { lembrar } from './estrada-extra.js';
import { eventosL6B } from './estrada-lote6b-eventos.js';

export function mundoL6B(X) {
  const { A, S, c, THREE, MAT, box, cyl, plano, interact, grupo, P, GZ, BZ, SX, F, R, escolhe, noite, rejogo, verdadeiro, risco, mem, memSet, dist, olhando, medo, falar, dizer, conquista, agenda, ticks, resumo, luzAcesa, TXT6B } = X;
  const tenta = (nome, fn) => { try { fn(); } catch (e) { console.warn('[estrada6b:' + nome + ']', e); } };
  const NO = noite();
  const STD = (cor, rug = .9) => new THREE.MeshStandardMaterial({ color: cor, roughness: rug });
  const hitMat = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false });
  const vaporTex = A.canvasTex(64, 64, (g, w, h) => { const gr = g.createRadialGradient(32, 32, 2, 32, 32, 30); gr.addColorStop(0, 'rgba(255,255,255,.7)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, h); });
  X.vaporTex = vaporTex; X.STD = STD; X.hitMat = hitMat;
  const noPosto = () => P.room && (P.room.id === 'posto' || P.room.id === 'patioPosto');

  // =================================================================== SEU JOAQUIM, A CHAVE E O POSTO VAZIO
  tenta('joaquim', () => {
    const vazio = rejogo() && risco() && (F.vazio !== undefined ? !!F.vazio : R('vazio') < .2);
    const lugar = vazio ? 'sob' : (rejogo() ? escolhe('chave', ['prego', 'balcao', 'casaco', 'bomba']) : 'prego');
    X.lugarChave = lugar; S.flags.e6b_lugar = lugar; X.vazio = vazio;
    const dica = TXT6B.dicaChave[lugar];
    const itC = A.W.items.find(i => i.key === 'estrada:chave_portao');
    const POS = { balcao: [16.45, 1.075, -17.55], casaco: [12.32, 1.18, -14.4], bomba: [9.92, 1.18, -15.05], sob: [15.85, .06, -17.4] };
    if (itC && POS[lugar]) {
      itC.mesh.position.set(...POS[lugar]);
      if (lugar === 'balcao' || lugar === 'sob') itC.mesh.rotation.set(0, .7, 0);
      itC.it.label = () => S.done.posto ? '<b>E</b>Pegar a chave do portão' : (lugar === 'sob' ? 'Uma chave no chão, junto ao balcão.' : 'Uma chave pequena, deixada ali.');
      if (lugar === 'casaco') box(.46, .9, .14, STD(0x2a3a2a, 1), 12.22, 1.3, -14.4, grupo, false);
      if (lugar === 'bomba') cyl(.012, .012, .5, STD(0x1a1a1a), 9.9, .95, -15.05, 5);   // a mangueira onde a chave pende
      resumo.push('a chave mudou de lugar');
    }
    const velho = c.velho, itV = A.W.inter.find(i => i.obj === velho);
    const extra = (() => {
      if (!rejogo()) return null;
      if (NO === 20) return { quem: 'joaquim', texto: A.R.falas.e6b_joaquim_curto20[0].texto };
      const d = TXT6B.joaquimDicas; return { quem: 'joaquim', texto: d[(NO + Math.floor(R('jd') * d.length)) % d.length] };
    })();
    const morto = rejogo() && verdadeiro();
    const adapta = arr => {
      if (morto) { const a = TXT6B.joaquimMorto.map(l => ({ ...l })); a.push({ quem: 'joaquim', texto: dica + ' E não corre lá dentro.' }); return a; }
      const a = arr.map(l => ({ ...l })), ult = a[a.length - 1];
      if (lugar !== 'prego' && ult) ult.texto = dica + ' Não corre lá dentro, moça. Ele escuta.';
      if (extra) a.splice(Math.max(0, a.length - 1), 0, { ...extra });
      return a;
    };
    if (itV && !vazio) {
      const act0 = itV.act;
      itV.act = () => {
        if (S.done.posto) { if (lugar === 'prego') return act0(); A.dialogo([{ quem: 'joaquim', texto: dica + ' E não corre lá dentro.' }]); return; }
        const o1 = A.R.dialogos.joaquim, o2 = TXT.joaquimCurto;
        A.R.dialogos.joaquim = adapta(o1); if (o2) TXT.joaquimCurto = adapta(o2);
        try { act0(); } finally { A.R.dialogos.joaquim = o1; if (o2) TXT.joaquimCurto = o2; }
      };
    }
    // o velho que já morreu: pele pálida e uma luz fria na cadeira (final verdadeiro visto)
    if (morto && !vazio) {
      velho.traverse(o => { if (o.isMesh && o.material && o.material.color) { o.material = o.material.clone(); o.material.color.lerp(new THREE.Color(0xaab4c0), .6); } });
      const lf = new THREE.PointLight(0x9cb8ff, 1.1, 5.5, 2); lf.position.set(17.3, 1.8, -17.2); grupo.add(lf);
      resumo.push('o Seu Joaquim está frio');
    }
    // noite do posto vazio: sem o velho, com a xícara quente e a gravação no balcão
    if (vazio) {
      velho.visible = false; if (itV) itV.on = () => false;
      const xic = cyl(.04, .035, .07, STD(0xd8d0c0, .5), 16.55, 1.08, -16.9, 8);
      const vap = [0, 1, 2].map(i => { const pl = plano(.22, .22, new THREE.MeshBasicMaterial({ map: vaporTex, transparent: true, opacity: 0, depthWrite: false }), 16.55, 1.2, -16.9, 0); pl.userData.f = i / 3; return pl; });
      const gr = box(.3, .11, .18, STD(0x2a2218, .7), 16.45, 1.1, -16.2);
      box(.08, .02, .08, new THREE.MeshStandardMaterial({ color: 0xff3020, emissive: 0xff3020, emissiveIntensity: 1.3 }), 16.45, 1.17, -16.2, grupo, false);
      interact(gr, () => S.done.posto ? 'O gravador do balcão, parado.' : '<b>E</b>Apertar o play do gravador do balcão', () => {
        if (S.done.posto) return; try { A.SFX.clique && A.SFX.clique(); } catch (e) {}
        A.dialogo(TXT6B.joaquimGravacao.map(l => ({ ...l })), () => {
          try { lembrar('joaquim'); } catch (e) {}
          S.flags.regras = true; S.flags.joaquimSumiu = true; A.objDone('posto'); A.lerNota('regras'); A.toast('As regras ficam no diário (TAB).'); agenda(1.5, () => falar('e6b_vazio_fim'));
        });
      });
      let vt = 0, cd = 6, primeira = false;
      ticks.push(dt => {
        vt += dt;
        vap.forEach(p => { const f = (vt * .5 + p.userData.f) % 1; p.position.y = 1.15 + f * .5; p.scale.setScalar(.6 + f * .8); p.material.opacity = (1 - f) * .22; p.quaternion.copy(A.camera.quaternion); });
        if (!primeira && P.room && P.room.id === 'posto') { primeira = true; agenda(1.2, () => falar('e6b_vazio_lia')); }
        if (S.done.posto || !noPosto() || dist(16.4, -15.4) > 18) return;
        cd -= dt; if (cd <= 0) { cd = 9 + R('cdv' + Math.floor(vt)) * 6; const pos = { x: 16.4, y: 1.2, z: -15.4 }; try { A.SFX.estatica(1.6, pos); SX.voz && SX.voz(pos, 4, 190); } catch (e) {} if (!X._vz) { X._vz = true; agenda(.6, () => falar('e6b_vazio_radio')); } }
      });
      resumo.push('o posto estava sem o Seu Joaquim');
    }
  });

  // =================================================================== CARTAZ DE PROCURADA (contador real de noites)
  tenta('cartaz', () => {
    const n = Math.max(NO, (X.stats().partidas || 0));
    const outra = n >= 10;
    const tx = A.canvasTex(128, 176, (g, w, h) => {
      g.fillStyle = '#cdc2a4'; g.fillRect(0, 0, w, h); g.strokeStyle = '#3a2a1a'; g.lineWidth = 3; g.strokeRect(5, 5, w - 10, h - 10);
      g.fillStyle = '#7a1a14'; g.font = 'bold 19px Georgia'; g.textAlign = 'center'; g.fillText('PROCURA-SE', w / 2, 28);
      g.fillStyle = '#8c7e66'; g.fillRect(32, 38, 64, 66);
      g.fillStyle = '#1a120c'; g.beginPath(); g.ellipse(64, 76, 19, 24, 0, 0, 6.3); g.fill();                        // cabelo
      g.fillStyle = '#c9a98a'; g.beginPath(); g.ellipse(64, 80, 14, 19, 0, 0, 6.3); g.fill();                        // rosto
      if (outra) { g.strokeStyle = '#1a120c'; g.lineWidth = 4; g.beginPath(); g.moveTo(46, 76); g.lineTo(42, 102); g.moveTo(82, 76); g.lineTo(86, 102); g.stroke(); g.fillStyle = '#8a8a8a'; g.fillRect(48, 98, 32, 6); } // tranças e gola de uniforme
      g.fillStyle = '#1a120c'; g.fillRect(57, 76, 3, 3); g.fillRect(68, 76, 3, 3);
      g.fillStyle = '#2a1a10'; g.font = 'bold 17px Georgia'; g.fillText(outra ? 'ANA' : 'LIA', w / 2, 124);
      g.font = '12px Georgia'; g.fillText('desaparecida há', w / 2, 142); g.font = 'bold 17px Georgia'; g.fillText(n + (n === 1 ? ' noite' : ' noites'), w / 2, 164);
    });
    const pl = plano(.42, .58, new THREE.MeshStandardMaterial({ map: tx, roughness: .95 }), 12.12, 1.72, -15.1, Math.PI / 2);
    pl.userData.leitura = { t: outra ? `PROCURA-SE · ANA · desaparecida há ${n} noites. (O retrato já não é o seu.)` : `PROCURA-SE · LIA · desaparecida há ${n} ${n === 1 ? 'noite' : 'noites'}.` };
  });

  // =================================================================== O CLIENTE FANTASMA DO BANCO
  tenta('cliente', () => {
    if (!rejogo() || R('cliente') > .62) return;
    box(1.3, .06, .4, STD(0x3a2a1c), 14, .45, -13.62, grupo, false);
    for (const dx of [-.55, .55]) box(.06, .45, .34, STD(0x3a2a1c), 14 + dx, .22, -13.62, grupo, false);
    const fig = new THREE.Group(); fig.position.set(14, 0, -13.68); grupo.add(fig);
    const m = new THREE.MeshStandardMaterial({ color: 0x050505, roughness: 1 });
    cyl(.17, .2, .55, m, 0, .78, 0, 8, fig); box(.32, .12, .46, m, 0, .5, .2, fig, false);
    const cab = new THREE.Mesh(new THREE.SphereGeometry(.11, 10, 8), m); cab.position.set(0, 1.18, 0); fig.add(cab);
    const st = { fase: 0, sem: 0, olh: 0 };
    ticks.push(dt => {
      if (st.fase >= 2 || !P.room || P.room.id !== 'posto') return;
      const perto = dist(14, -13.68) < 7, mira = perto && olhando({ x: 14, z: -13.68 }, .38, 8, 1.1);
      if (st.fase === 0) {
        if (mira && luzAcesa()) { fig.visible = false; st.fase = 2; falar('e6b_cliente_some'); try { A.SFX.estalo({ x: 14, z: -13.7 }, .4); } catch (e) {} resumo.push('um cliente fantasma sentou e sumiu'); }
        else if (mira && !luzAcesa()) { st.sem += dt; if (st.sem >= 5) { st.fase = 1; fig.rotation.y = Math.atan2(P.pos.x - fig.position.x, P.pos.z - fig.position.z); medo(14); falar('e6b_cliente_vira'); try { SX.respiracao && SX.respiracao({ x: 14, y: 1.1, z: -13.7 }); } catch (e) {} } }
        else st.sem = Math.max(0, st.sem - dt);
      } else if (st.fase === 1) {
        if (mira) { st.olh += dt; if (st.olh >= 4) { st.fase = 2; fig.visible = false; conquista('e6b_cliente'); resumo.push('encarou o cliente do banco'); } } else st.olh = Math.max(0, st.olh - dt * .5);
      }
    });
  });

  // =================================================================== MÁQUINA DE REFRIGERANTE DA SORTE
  tenta('refri', () => {
    const corpo = box(.8, 1.8, .7, STD(0xa01c14, .5), 23.45, .9, -9.2);
    A.addCollider(23.05, 23.85, -9.55, -8.85);
    const cores = [0xd02020, 0x2060d0, 0x20a040], nomes = ['vermelho', 'azul', 'verde'];
    const resultados = ['folego', 'pilha', 'estouro'].map(k => [R('refri:' + k), k]).sort((a, b) => a[0] - b[0]).map(x => x[1]);
    const placa = A.canvasTex(96, 40, (g, w, h) => { g.fillStyle = '#e8e0c8'; g.fillRect(0, 0, w, h); g.fillStyle = '#a01c14'; g.font = 'bold 16px Arial'; g.textAlign = 'center'; g.fillText('REFRIGERANTE', w / 2, 18); g.font = '11px Arial'; g.fillText('escolha com fé', w / 2, 33); });
    plano(.7, .29, new THREE.MeshStandardMaterial({ map: placa, roughness: .6 }), 23.04, 1.62, -9.2, -Math.PI / 2);
    cores.forEach((cor, i) => {
      const bt = box(.05, .12, .12, new THREE.MeshStandardMaterial({ color: cor, emissive: cor, emissiveIntensity: .5 }), 23.0, 1.25, -9.5 + i * .3);
      interact(bt, () => S.flags.e6b_refri ? 'A máquina já deu a sua.' : `<b>E</b>Apertar o botão ${nomes[i]} da máquina`, () => {
        if (S.flags.e6b_refri) { falar('e6b_refri_ja'); return; }
        S.flags.e6b_refri = resultados[i]; try { A.SFX.clique && A.SFX.clique(); } catch (e) {}
        const r = resultados[i];
        if (r === 'folego') { S.stamina = 100; S.ar = 100; S.fear = Math.max(0, S.fear - 20); falar('e6b_refri_folego'); A.toast('Fôlego cheio e o medo baixou.'); resumo.push('refrigerante: fôlego cheio'); }
        else if (r === 'pilha') { S.inv.pilhas++; falar('e6b_refri_pilha'); A.toast('A máquina soltou uma pilha.'); resumo.push('refrigerante: uma pilha'); }
        else { try { A.SFX.vidro(23, -9); } catch (e) {} A.emitNoise(23.1, -9.2, 24, true); medo(8); falar('e6b_refri_estouro'); resumo.push('refrigerante: a lata estourou'); }
      }, { on: () => !!S.flags.saiuCarro });
    });
  });

  // =================================================================== CARDÁPIO DE DESAFIOS DO SEU JOAQUIM
  tenta('cardapio', () => {
    if (!rejogo()) return;
    const ids = ['semLuzPatio', 'semCorrer', 'relogio', 'semDano', 'calma'].map(k => [R('card:' + k), k]).sort((a, b) => a[0] - b[0]).map(x => x[1]).slice(0, 3);
    const des = { id: null, falhou: false, t: 0, vida: 100, avisado: false };
    const fim = txt => { if (!des.falhou) { des.falhou = true; A.toast('Desafio falhou: ' + txt + '.'); falar('e6b_desafio_falhou'); resumo.push('desafio falhou'); } };
    ids.forEach((id, i) => {
      const cartao = box(.13, .012, .09, STD(0xd8ccae, .95), 16.2, 1.06, -15.9 - i * .5);
      cartao.rotation.y = (i - 1) * .25;
      interact(cartao, () => `<b>E</b>Aceitar o desafio: ${TXT6B.desafios[id]}`, () => {
        des.id = id; X.desafioId = id; S.flags.e6b_desafio = id; des.t = 0; des.vida = S.health; try { A.SFX.papel && A.SFX.papel(); } catch (e) {}
        A.toast('Desafio aceito: ' + TXT6B.desafios[id] + '. Cumpra e leva uma pilha.'); cartao.visible = false;
        for (const o of A.W.inter) if (o.__card) o.on = () => false;
      }, { on: () => !des.id && !S.inv.chaves.portao && !!S.flags.saiuCarro });
      A.W.inter[A.W.inter.length - 1].__card = true;
    });
    let falouCard = false;
    ticks.push(dt => {
      if (!falouCard && P.room && P.room.id === 'posto' && dist(16.2, -16.4) < 4) { falouCard = true; falar('e6b_cardapio'); }
      if (!des.id || des.falhou || S.done.abrir_portao) return;
      des.t += dt;
      if (des.id === 'semLuzPatio' && luzAcesa() && P.room && (P.room.id === 'patioPosto')) fim('a lanterna estava acesa no pátio');
      if (des.id === 'semCorrer' && P.sprinting) fim('você correu');
      if (des.id === 'relogio' && des.t > 100) fim('passaram os 100 segundos');
      if (des.id === 'semDano' && S.health < des.vida - .5) fim('você perdeu vida');
      if (des.id === 'calma' && S.fear > 60) fim('o medo passou de 60');
    });
    X.cardapio = des;
  });
  const antes = X.aoChegarPortao;
  X.aoChegarPortao = () => {
    if (antes) antes();
    const d = X.cardapio;
    if (d && d.id && !d.falhou) { X.S.inv.pilhas++; A.toast('Desafio cumprido: uma pilha.'); falar('e6b_desafio_ok'); conquista('e6b_desafio'); const m = mem(); memSet({ desafiosOk: (m.desafiosOk || 0) + 1 }); resumo.push('desafio do cardápio cumprido'); d.falhou = true; }
  };

  // =================================================================== ARMÁRIO DE FERRAMENTAS (CÓDIGO DO DIA DO RÁDIO)
  tenta('armario', () => {
    if (!rejogo()) return;
    const corpo = box(.9, 1.8, .5, STD(0x445046, .6), 22.9, .9, -24.3);
    A.addCollider(22.45, 23.35, -24.55, -24.05);
    const porta = box(.04, 1.5, .8, STD(0x4c584e, .5), 22.43, .95, -24.3);
    box(.05, .16, .05, STD(0xb8a050, .4), 22.4, .95, -24.55);
    let aberto = !!S.flags.e6b_armAberto, avisou = false;
    interact(porta, () => aberto ? 'O armário de ferramentas, aberto.' : '<b>E</b>Abrir o armário de ferramentas (4 números)', () => {
      if (aberto) return;
      if (!avisou) { avisou = true; falar('e6b_arm_dica'); }
      if (!X.codigoDia) return;
      A.abrirTeclado('ARMÁRIO DE FERRAMENTAS', X.codigoDia, () => {
        aberto = true; S.flags.e6b_armAberto = true; falar('e6b_arm_ok'); conquista('e6b_armario'); try { A.SFX.trancado && A.SFX.trancado(); } catch (e) {}
        const d = new Date(), dia = d.getDay();
        if (dia % 2) { S.inv.pilhas++; A.toast('No armário: uma pilha.'); } else { S.fosforos = (typeof S.fosforos === 'number' ? S.fosforos : (X.stats().fosforos || 2)) + 1; A.toast('No armário: uma caixa de fósforos.'); }
        agenda(2.5, () => A.toast(TXT6B.loreDia[dia])); agenda(7, () => A.toast(TXT6B.lore_armario[(dia + NO) % TXT6B.lore_armario.length]));
        resumo.push('abriu o armário com o código do dia');
      }, () => falar('e6b_arm_errado'));
    });
  });

  // =================================================================== JANELA DO INTERNATO COM A COR DA NOITE
  tenta('janela', () => {
    const cor = escolhe('janelaCor', [0xffb060, 0xff7a44, 0xd8e0ff, 0xa8ff98]);
    for (const o of grupo.children) {
      if (o.isMesh && Math.abs(o.position.y - 5.5) < .01 && Math.abs(o.position.x - 10) < .01 && Math.abs(o.position.z - (BZ + 5.15)) < .01 && o.material && o.material.emissive) { o.material.emissive.setHex(cor); break; }
    }
  });

  // =================================================================== ESTRADA: placas, obstáculos, eventos, rotas
  eventosL6B(X);
}
