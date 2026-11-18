// s12_solver_proto.mjs - YASim-style "performance point" solver adapted to AirfieldLab's derivative model.
// Step 1: trim the CURRENT model at a cruise point (level, 5000 ft ISA, thr 0.75, clean) with Newton on (V, alpha, de).
// Step 2: forget CD0, CL0, Cm0, then recover them from that point alone (3 equations Fx=0, Fz=0, M=0) -> round-trip test.
import { M } from 'test/harness.mjs';
const { Aircraft, AC, DEG, RAD, KT, FT, FIELD, atmosphere } = M;
const ac = new Aircraft(); ac.flaps = ac.cmd.flaps = 0; ac.gearPos = 0; ac.cmd.gear = 0;
const h = 5000 * FT - FIELD.elev, thr = 0.75;
function resid(V, al, de) {
  const q = [Math.cos(al / 2), 0, Math.sin(al / 2), 0];      // theta = alpha (level), heading north
  ac.x.set([0, 0, -h, V, 0, 0, q[0], q[1], q[2], q[3], 0, 0, 0]); ac.de = de; ac.thr = thr; ac.adot = 0;
  const out = new Float64Array(13); ac.deriv(ac.x, out);
  return [out[3], out[5], out[11]];                            // d(vn)/dt, d(vd)/dt, d(q)/dt
}
function newton(x, f, n = 40) {
  for (let it = 0; it < n; it++) {
    const r = f(...x), J = [];
    for (let j = 0; j < 3; j++) { const xp = x.slice(); const hh = 1e-6 * Math.max(1, Math.abs(x[j])); xp[j] += hh; const rp = f(...xp); J.push(rp.map((v, i) => (v - r[i]) / hh)); }
    const A = [0, 1, 2].map((i) => [J[0][i], J[1][i], J[2][i]]);   // A[i][j] = dri/dxj
    const det = (m) => m[0][0] * (m[1][1] * m[2][2] - m[1][2] * m[2][1]) - m[0][1] * (m[1][0] * m[2][2] - m[1][2] * m[2][0]) + m[0][2] * (m[1][0] * m[2][1] - m[1][1] * m[2][0]);
    const D = det(A), dx = [0, 1, 2].map((k) => { const B = A.map((row, i) => row.map((v, j) => (j === k ? -r[i] : v))); return det(B) / D; });
    for (let j = 0; j < 3; j++) x[j] += dx[j];
    if (Math.hypot(...dx) < 1e-12) break;
  }
  return x;
}
const [V, al, de] = newton([70, 0.02, 0], resid);
const rho = atmosphere(FIELD.elev + h).rho;
const cruise = { h_ft: 5000, thr, TAS_kt: V / KT, KCAS_approx: V * Math.sqrt(rho / 1.225) / KT, alpha_deg: al * RAD, de_deg: de * RAD };
// Step 2: round trip. Unknowns CD0, CL0, Cm0 with V, alpha, de, thr fixed.
const truth = { CD0: AC.CD0, CL0: AC.CL0, Cm0: AC.Cm0 };
AC.CD0 = 0.03; AC.CL0 = 0.4; AC.Cm0 = 0.0;           // wrong start
const f2 = (cd0, cl0, cm0) => { AC.CD0 = cd0; AC.CL0 = cl0; AC.Cm0 = cm0; return resid(V, al, de); };
const sol = newton([0.03, 0.4, 0.0], f2);
console.log(JSON.stringify({ cruise, recovered: { CD0: sol[0], CL0: sol[1], Cm0: sol[2] }, truth }, null, 1));
