// U5: what the CURRENT AirfieldLab model does in ground effect (src/20-flight.js deriv), measured with Node.
import { M } from 'test/harness.mjs';
const { Aircraft, AC, KT, DEG, RAD, G0 } = M;
const ac = new Aircraft();
ac.isaDev = 31 - (15 - 0.0065 * 3);
ac.gearPos = 0.979; ac.flaps = 1; ac.cmd.gear = 1;   // <0.98 disables strut contact so only aerodynamics is measured
// level-flight trim with Newton on (alpha, de, thr), wings level, heading north, calm air. hw = wing height (model: h - 0.35)
function trim(hw, ktTAS) {
  const V = ktTAS * KT; let x = [5 * DEG, -2 * DEG, 0.3];
  const res = (p) => {
    const [a, de, thr] = p; ac.de = de; ac.thr = thr; ac.adot = 0;
    const q = [Math.cos(a / 2), 0, Math.sin(a / 2), 0];
    ac.x.set([0, 0, -(hw + 0.35), V, 0, 0, q[0], q[1], q[2], q[3], 0, 0, 0]);
    const d = new Float64Array(13), diag = { wow: [0, 0, 0], load: [0, 0, 0] }; ac.deriv(ac.x, d, diag);
    return { r: [d[3], d[5], d[11]], diag };
  };
  for (let it = 0; it < 30; it++) {
    const f0 = res(x).r, J = [];
    for (let j = 0; j < 3; j++) { const xp = x.slice(); xp[j] += 1e-6; const f1 = res(xp).r; J.push(f1.map((v, i) => (v - f0[i]) / 1e-6)); }
    // solve J^T layout: J[j][i] = d f_i / d x_j
    const Mx = [0, 1, 2].map(i => [0, 1, 2].map(j => J[j][i]));
    const det = (m) => m[0][0] * (m[1][1] * m[2][2] - m[1][2] * m[2][1]) - m[0][1] * (m[1][0] * m[2][2] - m[1][2] * m[2][0]) + m[0][2] * (m[1][0] * m[2][1] - m[1][1] * m[2][0]);
    const D0 = det(Mx), dx = [0, 1, 2].map(k => { const m = Mx.map((row, i) => row.map((v, j) => (j === k ? -f0[i] : v))); return det(m) / D0; });
    x = x.map((v, i) => v + dx[i]);
  }
  const { diag } = res(x);
  return { hw, alpha_deg: +(x[0] * RAD).toFixed(2), de_deg: +(x[1] * RAD).toFixed(2), thr: +x[2].toFixed(3), CL: +diag.CL.toFixed(3), phiGE: +diag.phiGE.toFixed(3), D_N: Math.round(diag.D) };
}
const rows = [];
for (const hw of [0.51, 1.02, 1.53, 2.04, 3.06, 5.1, 10.2, 60]) rows.push({ hb: +(hw / AC.b).toFixed(2), ...trim(hw, 85) });
console.log('Level-flight trim at 85 kt TAS, landing flaps, gear down, current model:');
for (const r of rows) console.log(JSON.stringify(r));
// constant-alpha lift ratio and induced-drag factor as coded
console.log('Current-code factors vs h/b (hw = h_CG - 0.35):');
for (const hb of [0.05, 0.1, 0.15, 0.2, 0.3, 0.5, 1.0]) {
  const hw = hb * AC.b, ge = (16 * hw / AC.b) ** 2, phi = ge / (1 + ge);
  console.log(JSON.stringify({ hb, phiGE_McCormick16: +phi.toFixed(3), CLa_factor: +(1 + 0.12 * (1 - phi)).toFixed(3), dCm: +(-0.06 * (1 - phi)).toFixed(4), CDi_factor: +phi.toFixed(3) }));
}
