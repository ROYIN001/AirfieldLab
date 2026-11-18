// Section 7: massless-wheel series model (tyre spring + oleo strut, strut stroke s is a state).
// N = kt*(pen - s);  Kh*sd|sd| + cl*sd = kt*(pen - s) - Fa(s)  ->  sd solved in closed form.
// Run: node g7_series.mjs   (prints drop results used as expected values in T-G-02..04)
const g = 9.80665;
export const OLEO = {
  // main strut (per unit) and nose strut, trainer m = 2250 kg (estimates, see section 7.2)
  main: { S: 0.25, rStatic: 2.5, rComp: 8, pStaticPsi: 300, n: 1.12, Kh: 4.0e3, Kr: 4.8e4, cl: 2.0e3, kt: 3.2e5, ct: 3.5e3 },
  nose: { S: 0.20, rStatic: 2.5, rComp: 8, pStaticPsi: 300, n: 1.12, Kh: 1.6e3, Kr: 1.9e4, cl: 1.0e3, kt: 1.6e5, ct: 1.2e3 },
};
export function prep(P, Wst) {
  const L0 = P.S * P.rComp / (P.rComp - 1), Fext = Wst / P.rStatic, p0 = P.pStaticPsi * 6894.76 / P.rStatic;
  return { ...P, L0, A: Fext / p0, p0, Fext, sst: L0 * (1 - 1 / P.rStatic) };
}
export const gasF = (P, s, n = P.n) => P.p0 * P.A * Math.pow(P.L0 / (P.L0 - Math.min(Math.max(s, 0), 0.995 * P.S)), n);
export function solveSd(P, D) { // Kh sd|sd| + cl sd = D
  const K = D >= 0 ? P.Kh : P.Kr, a = Math.abs(D);
  const v = (-P.cl + Math.sqrt(P.cl * P.cl + 4 * K * a)) / (2 * K);
  return D >= 0 ? v : -v;
}
// returns {N, sd}: pen = wheel-ground interference along the strut (m), penDot (m/s), s = stroke state
export function strutStep(P, pen, penDot, s) {
  const Fa = gasF(P, s);
  const dl = pen - s;                         // tyre deflection
  const Ft0 = dl > 0 ? P.kt * dl : 0;
  const sd0 = solveSd(P, Ft0 - Fa);
  const Ft = dl > 0 ? Math.max(0, Ft0 + P.ct * (penDot - sd0)) : 0;   // tyre hysteresis damping on deflection rate
  let sd = solveSd(P, Ft - Fa);
  if (s <= 0 && sd < 0) sd = 0;               // fully extended (top-out)
  if (s >= P.S && sd > 0) sd = 0;             // bottomed: tyre carries the rest
  return { N: Ft, sd, Fa };
}
export function dropSeries(P, Wst, { vs, liftFrac, dt = 1e-4, tEnd = 1.0 }) {
  const M = Wst / g; let z = 0, v = vs, s = 0, Nmax = 0, smax = 0, tPk = 0, left = false, bottom = false, touched = false, E = 0;
  for (let t = 0; t < tEnd; t += dt) {
    const pen = z;  // wheel touches at z = 0
    const r = pen > 0 || s > 0 ? strutStep(P, pen, v, s) : { N: 0, sd: 0 };
    if (r.N > Nmax) { Nmax = r.N; tPk = t; }
    v += (g * (1 - liftFrac) - r.N / M) * dt; z += v * dt; s = Math.max(0, s + r.sd * dt); if (s >= P.S) { s = P.S; bottom = true; }
    smax = Math.max(smax, s);
    if (r.N > 0) touched = true; if (touched && pen < -0.005) left = true;
  }
  return { Nmax, n_g: Nmax / Wst, smax, frac: smax / P.S, tPk, bounce: left, bottom };
}
if (process.argv[1].endsWith('g7_series.mjs')) {
  const m = 2250, W = m * g, fN = 0.35 / 2.65, WN = W * fN, WM = W * (1 - fN) / 2;
  for (const [nm, P0, Wst] of [['main', OLEO.main, WM], ['nose', OLEO.nose, WN]]) {
    const P = prep(P0, Wst);
    const st = (() => { let s = 0; for (let k = 0; k < 2e5; k++) { // static equilibrium, isothermal n=1 for slow
      const pen = s + Wst / P.kt; const Fa = gasF(P, s, 1.0); s += (Wst - Fa) / 2e6; } return s; })();
    const kgas = P.p0 * P.A * P.L0 / (P.L0 - st) ** 2, keff = 1 / (1 / kgas + 1 / P.kt), f = Math.sqrt(keff / (Wst / g)) / 2 / Math.PI;
    // linearised damping at static for small motion: c = cl (quadratic term ~0) -> zeta
    console.log(`${nm}: W_st ${Wst.toFixed(0)} N, A ${(P.A * 1e4).toFixed(1)} cm2 (bore ${(Math.sqrt(4 * P.A / Math.PI) * 1000).toFixed(0)} mm), L0 ${P.L0.toFixed(3)} m, p_ext ${(P.p0 / 6894.76).toFixed(0)} psi, static stroke ${(st * 1000).toFixed(0)} mm of ${P.S * 1000} (${(100 * st / P.S).toFixed(0)}%), tyre defl ${(Wst / P.kt * 1000).toFixed(0)} mm, k_gas ${(kgas / 1e3).toFixed(0)} kN/m, k_eff ${(keff / 1e3).toFixed(0)} kN/m, f ${f.toFixed(2)} Hz`);
    for (const [vs, L, lab] of [[3.048, 2 / 3, 'limit 10fps L=2/3'], [3.0, 1, '3.0 m/s L=1'], [3.66, 1, 'reserve 12fps L=1'], [1.5, 1, '1.5 m/s L=1'], [0.9, 1, '0.9 m/s (180fpm) L=1']]) {
      const r = dropSeries(P, Wst, { vs, liftFrac: L });
      console.log(`   ${lab.padEnd(22)} n_g ${r.n_g.toFixed(2)}  n_i ${(r.n_g + L).toFixed(2)}  stroke ${(r.smax * 1000).toFixed(0)} mm (${(100 * r.frac).toFixed(0)}%)  tPk ${(r.tPk * 1000).toFixed(0)} ms  bounce ${r.bounce} bottom ${r.bottom}`);
    }
  }
}
