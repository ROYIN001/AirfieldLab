#!/usr/bin/env node
// ld_polar_opts.mjs — option study for the sim polar of the classic DA40 variants (05-da40.md §05.9, §05.12).
// The sim has no windmilling-propeller drag (thrust ≥ 0 at idle), so one parabolic polar must serve both the idle glide
// and powered cruise. For each candidate glide target (speed, L/D) this computes the sim polar (lm_polar.polarFromGlide →
// toSimPolar), refits Vc to the ROC target with the sim's thrust law (T0 fixed), then the throttle needed at 110 KCAS
// 3,000 ft (cruise trim target) and the full-throttle level speed at SL. Quasi-steady (lm_legacy_fit.rocModel), no sim run.
//   node scripts/ld_polar_opts.mjs  -> out/ld_polar_opts.json
import fs from 'node:fs';
import { polarFromGlide, toSimPolar } from './lm_polar.mjs';
const G0 = 9.80665, KT = 0.514444, FT = 0.3048;
const rho = h => 1.225 * (1 - 2.25577e-5 * h) ** 4.2559;
const CASES = {
  da40ng: { m: 1310, S: 13.244, T0: 4050, roc: 651, glide: [87.5, 9.7], alts: [[87.5, 9.4], [87.5, 11], [87.5, 12]] },
  da40_180: { m: 1200, S: 13.54, T0: 4131, roc: 780, glide: [76.1, 8.8], alts: [[76.1, 10.3], [80, 11], [80, 12]] },
  da40d: { m: 1150, S: 13.54, T0: 3460, roc: 550, glide: [73.2, 8.8], alts: [[73.2, 10.3], [80, 11], [80, 12]] },
};
function evalPolar(c, CD0, K) {
  const W = c.m * G0;
  const D = (V, r) => { const q = 0.5 * r * V * V, CL = W / (q * c.S); return q * c.S * (CD0 + K * (CL - 0.15) ** 2); };
  const T = (V, Vc) => c.T0 * Vc / Math.sqrt(V * V + Vc * Vc);
  const best = Vc => { let b = -1e9, bv = 0; for (let V = 25; V < 70; V += 0.05) { const r = (T(V, Vc) - D(V, 1.225)) * V / W; if (r > b) { b = r; bv = V; } } return [b, bv]; };
  let lo = 5, hi = 400; for (let k = 0; k < 60; k++) { const m = (lo + hi) / 2; if (best(m)[0] > c.roc * FT / 60) hi = m; else lo = m; }
  const Vc = (lo + hi) / 2, eta = Vc * c.T0 / c.P;
  const r3 = rho(3000 * FT), Vcr = 110 * KT / Math.sqrt(r3 / 1.225);
  const thrCruise = D(Vcr, r3) / T(Vcr, Vc);
  let vmax = 0; for (let V = 30; V < 90; V += 0.05) if (T(V, Vc) >= D(V, 1.225)) vmax = V;
  // idle descent at the approach speed with full flap is not included (flap drag separate); clean idle glide at 1.3 VS ≈ glide speed
  return { CD0: +CD0.toFixed(4), K: +K.toFixed(4), Vc: +Vc.toFixed(1), Vy_kt: +(best(Vc)[1] / KT).toFixed(1), thr_110kcas_3000ft: +thrCruise.toFixed(3), Vmax_SL_kt: +(vmax / KT).toFixed(1) };
}
const out = {};
for (const [id, c] of Object.entries(CASES)) {
  c.P = id === 'da40ng' ? 123500 : id === 'da40_180' ? 134200 : 99000;
  out[id] = [c.glide, ...c.alts].map(([v, E]) => { const sp = toSimPolar(polarFromGlide({ mass: c.m, S: c.S, v_kcas: v, E })); return { glide: [v, E], ...evalPolar(c, sp.CD0, sp.K) }; });
}
fs.writeFileSync(new URL('./out/ld_polar_opts.json', import.meta.url), JSON.stringify(out, null, 1));
for (const [id, rows] of Object.entries(out)) for (const r of rows) console.log(id, JSON.stringify(r));
