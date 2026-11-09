// Utilidades compartilhadas entre os mapas (árvores, muros, portões, placas...). Antes ficavam dentro de mapas.js.
export function arvores(A, faixas, n = 300) {
  const { THREE, MAT, rand } = A;
  const tronco = new THREE.InstancedMesh(new THREE.CylinderGeometry(.14, .28, 1, 6), MAT.tronco, n);
  const copa = new THREE.InstancedMesh(new THREE.ConeGeometry(1, 1, 7), MAT.arvore, n * 2);
  const m = new THREE.Matrix4(), q = new THREE.Quaternion(), s = new THREE.Vector3(), p = new THREE.Vector3();
  let k = 0;
  for (let i = 0; i < n; i++) {
    const f = faixas[i % faixas.length];
    const x = rand(f[0], f[1]), z = rand(f[2], f[3]), h = rand(6, 12);
    m.compose(p.set(x, h / 2, z), q.identity(), s.set(1, h, 1)); tronco.setMatrixAt(i, m);
    for (let j = 0; j < 2; j++) { const r = rand(1.6, 2.8) - j * .5; m.compose(p.set(x, h * .55 + j * 1.8, z), q.identity(), s.set(r, rand(2.6, 3.6), r)); copa.setMatrixAt(k++, m); }
  }
  copa.count = k; tronco.castShadow = copa.castShadow = true;
  A.W.grupo.add(tronco, copa);
  return { tronco, copa, n, copaN: k };
}
export function arvoreSeca(A, x, z, h = 6) {
  const { cyl, MAT, rand } = A;
  cyl(.18, .34, h, MAT.tronco, x, h / 2, z, 6);
  for (let k = 0; k < 5; k++) { const b = cyl(.04, .1, 2.6, MAT.tronco, x, h * .6 + k * .4, z, 5); b.rotation.z = rand(-1.2, 1.2); b.rotation.x = rand(-.6, .6); }
  A.addCollider(x - .35, x + .35, z - .35, z + .35);
}
export function muro(A, x1, z1, x2, z2, h = 2.6, tex = 'pedra') {
  const horiz = z1 === z2, len = horiz ? Math.abs(x2 - x1) : Math.abs(z2 - z1);
  const mat = A.texMat(tex, len / 3, 1);
  const m = horiz ? A.box(len, h, .4, mat, (x1 + x2) / 2, h / 2, z1) : A.box(.4, h, len, mat, x1, h / 2, (z1 + z2) / 2);
  A.W.solid.push(m);
  horiz ? A.addCollider(Math.min(x1, x2), Math.max(x1, x2), z1 - .2, z1 + .2) : A.addCollider(x1 - .2, x1 + .2, Math.min(z1, z2), Math.max(z1, z2));
}
export function invisivel(A, x1, z1, x2, z2) { A.addCollider(Math.min(x1, x2) - .15, Math.max(x1, x2) + .15, Math.min(z1, z2) - .15, Math.max(z1, z2) + .15); }
export function portao(A, x, z, largura = 4) { // portão de grades duplo (decorativo + colisor)
  const { THREE, MAT, cyl, box } = A;
  const L = new THREE.Group(), R = new THREE.Group(); L.position.set(x - largura / 2, 0, z); R.position.set(x + largura / 2, 0, z); A.W.grupo.add(L, R);
  const n = Math.round(largura / 2 / .23);
  for (let i = 0; i < n; i++) { cyl(.025, .025, 2.9, MAT.ferrugem, .12 + i * .23, 1.45, 0, 6, L); cyl(.025, .025, 2.9, MAT.ferrugem, -.12 - i * .23, 1.45, 0, 6, R); }
  for (const y of [2.6, .4]) { box(largura / 2, .06, .06, MAT.ferrugem, largura / 4, y, 0, L); box(largura / 2, .06, .06, MAT.ferrugem, -largura / 4, y, 0, R); }
  cyl(.3, .3, 3.4, A.texMat('pedra', 1, 1), x - largura / 2 - .3, 1.7, z); cyl(.3, .3, 3.4, A.texMat('pedra', 1, 1), x + largura / 2 + .3, 1.7, z);
  const col = A.addCollider(x - largura / 2, x + largura / 2, z - .2, z + .2);
  const g = { L, R, col, aberto: false, ang: 0, abrir() { g.aberto = true; col.on = false; } };
  A.W.tick.push(dt => { if (g.aberto && g.ang < 1.4) { g.ang = Math.min(1.4, g.ang + dt * 1.2); L.rotation.y = g.ang; R.rotation.y = -g.ang; } });
  return g;
}
export function vulto(A) { // silhueta alta para sustos à distância
  const { THREE, box, cyl } = A;
  const g = new THREE.Group(), m = new THREE.MeshStandardMaterial({ color: 0x060606, roughness: 1 });
  cyl(.2, .35, 1.7, m, 0, 1.7, 0, 8, g); cyl(.05, .04, 1.4, m, -.15, .7, 0, 5, g); cyl(.05, .04, 1.4, m, .15, .7, 0, 5, g);
  const c = new THREE.Mesh(new THREE.SphereGeometry(.15, 10, 8), m); c.scale.set(.8, 1.5, 1); c.position.set(0, 2.85, 0); c.rotation.z = .4; g.add(c);
  for (const s of [-1, 1]) { const b = cyl(.03, .02, 1.8, m, s * .3, 1.7, 0, 5, g); b.rotation.z = s * .08; }
  g.visible = false; A.W.grupo.add(g); return g;
}
export function janelasFachada(A, xs, z, y = 1.75, lado = 1) {
  const { box, MAT } = A;
  for (const x of xs) {
    box(1.3, 1.5, .1, MAT.preto, x, y, z + .06 * lado, A.W.grupo, false);
    box(1.5, .1, .22, MAT.madeiraEsc, x, y - .78, z + .1 * lado); box(1.5, .1, .22, MAT.madeiraEsc, x, y + .78, z + .1 * lado);
    box(.07, 1.5, .18, MAT.madeiraEsc, x, y, z + .1 * lado);
  }
}
export function placa(A, linhas, x, y, z, w, h, ry = 0, opts) {
  const m = A.plano(w, h, new A.THREE.MeshStandardMaterial({ map: A.textoTex(linhas, opts), roughness: .9 }), x, y, z, ry);
  m.userData.leitura = { t: linhas.map(l => l.t).join(' · ') }; // ler de perto sem tela cheia (src/interface-mundo.js)
  return m;
}
export function noCaixote(A, p) { A.prop(.55, .45, .55, A.MAT.madeiraEsc, p.x, .225, p.z); return { x: p.x, y: .45, z: p.z }; }
