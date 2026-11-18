// Review: T-G-05 check on the proposed series strut (single-mass drop), N during the first 10 ms after contact.
// Variant A: as written in 7.2 (tyre damping c_t*(penDot - sd0), uncapped).
// Variant B: tyre damping force capped at the tyre spring force (|c_t*rate| <= k_t*defl), a common fix.
import { OLEO, prep, gasF, solveSd } from './g7_series.mjs';
const g = 9.80665, W = 2250 * g, WM = W * (1 - 0.35 / 2.65) / 2;
function step(P, pen, penDot, s, cap) {
  const Fa = gasF(P, s), dl = pen - s, Ft0 = dl > 0 ? P.kt * dl : 0;
  let sd0 = solveSd(P, Ft0 - Fa); if (s <= 0 && sd0 < 0) sd0 = 0;
  let damp = P.ct * (penDot - sd0); if (cap) damp = Math.max(-Ft0, Math.min(Ft0, damp));
  const Ft = dl > 0 ? Math.max(0, Ft0 + damp) : 0;
  let sd = solveSd(P, Ft - Fa); if (s <= 0 && sd < 0) sd = 0; if (s >= P.S && sd > 0) sd = 0;
  return { N: Ft, sd };
}
function drop(P, vs, L, cap, dt = 1e-4) {
  const Mm = WM / g; let z = 0, v = vs, s = 0, N10 = 0, Nmax = 0, tPk = 0, smax = 0;
  for (let t = 0; t < 1; t += dt) {
    const r = z > 0 || s > 0 ? step(P, z, v, s, cap) : { N: 0, sd: 0 };
    if (t <= 0.010) N10 = Math.max(N10, r.N);
    if (r.N > Nmax) { Nmax = r.N; tPk = t; }
    v += (g * (1 - L) - r.N / Mm) * dt; z += v * dt; s = Math.min(P.S, Math.max(0, s + r.sd * dt)); smax = Math.max(smax, s);
  }
  return { N10_over_Wst: +(N10 / WM).toFixed(3), n_g: +(Nmax / WM).toFixed(3), tPk_ms: +(tPk * 1e3).toFixed(0), stroke_mm: +(smax * 1e3).toFixed(0) };
}
const P = prep(OLEO.main, WM);
for (const [vs, L] of [[3.0, 1], [3.048, 2 / 3], [3.66, 1], [3.66, 2 / 3]]) {
  console.log(`vs ${vs} L ${L.toFixed(2)}  A(uncapped) ${JSON.stringify(drop(P, vs, L, false))}  B(capped) ${JSON.stringify(drop(P, vs, L, true))}`);
}
// Part 2: N(t) right after contact for the code exactly as printed in 7.2 (sd0 not clamped, damping uncapped)
// versus the capped variant (|c_t*rate| <= k_t*defl and sd0 clamped at top-out). 3.0 m/s, L = 1.
import { strutStep } from './g7_series.mjs';
function trace(fn, vs = 3.0, L = 1, dt = 1e-5) {
  const Mm = WM / g; let z = 0, v = vs, s = 0; const out = {}; const marks = [0.0005, 0.001, 0.00417, 0.010, 0.020];
  let maxJump = 0, Nprev = 0;
  for (let t = 0; t < 0.021; t += dt) {
    const r = z > 0 || s > 0 ? fn(z, v, s) : { N: 0, sd: 0 };
    maxJump = Math.max(maxJump, Math.abs(r.N - Nprev)); Nprev = r.N;
    for (const m of marks) if (out[m] === undefined && t >= m) out[m] = +(r.N / WM).toFixed(3);
    v += (g * (1 - L) - r.N / Mm) * dt; z += v * dt; s = Math.min(P.S, Math.max(0, s + r.sd * dt));
  }
  return { N_over_Wst_at_s: out, maxJumpPer10us_Wst: +(maxJump / WM).toFixed(3) };
}
console.log('as printed :', JSON.stringify(trace((z, v, s) => strutStep(P, z, v, s))));
console.log('capped     :', JSON.stringify(trace((z, v, s) => step(P, z, v, s, true))));
console.log('ct = 0     :', JSON.stringify(trace((z, v, s) => strutStep({ ...P, ct: 0 }, z, v, s))));
