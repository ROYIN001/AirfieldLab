// Review: single-mass drop table of 7.2 recomputed with the corrected strutStep
// (tyre damping capped at |k_t*defl|, sd0 clamped at top-out). Also shock-absorber efficiency eta = ∫F ds / (Fmax smax).
import { OLEO, prep, gasF, solveSd } from './g7_series.mjs';
const g = 9.80665, W = 2250 * g, fN = 0.35 / 2.65, WN = W * fN, WM = W * (1 - fN) / 2;
export function strutStepC(P, pen, penDot, s) {
  const Fa = gasF(P, s), dl = pen - s, Ft0 = dl > 0 ? P.kt * dl : 0;
  let sd0 = solveSd(P, Ft0 - Fa); if (s <= 0 && sd0 < 0) sd0 = 0;
  const damp = Math.max(-Ft0, Math.min(Ft0, P.ct * (penDot - sd0)));
  const Ft = dl > 0 ? Math.max(0, Ft0 + damp) : 0;
  let sd = solveSd(P, Ft - Fa); if (s <= 0 && sd < 0) sd = 0; if (s >= P.S && sd > 0) sd = 0;
  return { N: Ft, sd, Fa };
}
function drop(P, Wst, vs, L, dt = 1e-4) {
  const Mm = Wst / g; let z = 0, v = vs, s = 0, Nmax = 0, tPk = 0, smax = 0, zmax = 0, work = 0, left = false, touched = false, bottom = false;
  for (let t = 0; t < 1; t += dt) {
    const r = z > 0 || s > 0 ? strutStepC(P, z, v, s) : { N: 0, sd: 0 };
    if (r.N > Nmax) { Nmax = r.N; tPk = t; }
    if (v > 0) work += r.N * v * dt;           // energy absorbed by tyre+strut during compression
    v += (g * (1 - L) - r.N / Mm) * dt; z += v * dt; zmax = Math.max(zmax, z);
    s = s + r.sd * dt; if (s >= P.S) { s = P.S; bottom = true; } s = Math.max(0, s); smax = Math.max(smax, s);
    if (r.N > 0) touched = true; if (touched && z < -0.005) left = true;
  }
  return { n_g: Nmax / Wst, n_i: Nmax / Wst + L, smax, frac: smax / P.S, tPk, eta: work / (Nmax * zmax), bounce: left, bottom };
}
for (const [nm, P0, Wst] of [['main', OLEO.main, WM], ['nose', OLEO.nose, WN]]) {
  const P = prep(P0, Wst);
  for (const [vs, L, lab] of [[3.048, 2 / 3, 'limit 10fps L=2/3'], [3.0, 1, '3.0 m/s L=1'], [3.66, 1, 'reserve 12fps L=1'], [3.66, 2 / 3, 'reserve 12fps L=2/3'], [0.9, 1, '0.9 m/s L=1']]) {
    const r = drop(P, Wst, vs, L);
    console.log(`${nm} ${lab.padEnd(20)} n_g ${r.n_g.toFixed(2)} n_i ${r.n_i.toFixed(2)} stroke ${(r.smax * 1e3).toFixed(0)} mm (${(100 * r.frac).toFixed(0)}%) tPk ${(r.tPk * 1e3).toFixed(0)} ms eta ${r.eta.toFixed(2)} bounce ${r.bounce} bottom ${r.bottom}`);
  }
}
