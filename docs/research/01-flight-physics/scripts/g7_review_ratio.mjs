// Review: re-run the ratio trade study with and without tyre damping (ct) to check the prose numbers in 7.2
import { OLEO, prep, dropSeries } from './g7_series.mjs';
const g = 9.80665, W = 2250 * g, WM = W * (1 - 0.35 / 2.65) / 2;
for (const ct of [0, 3500]) for (const [rS, rC] of [[4, 12], [3, 10], [3, 8], [2.5, 8], [2.5, 6]]) {
  let best = null;
  for (let Kh = 500; Kh < 3e4; Kh *= 1.03) {
    const P = prep({ ...OLEO.main, ct, rStatic: rS, rComp: rC, Kh, Kr: 12 * Kh }, WM);
    const r = dropSeries(P, WM, { vs: 3.048, liftFrac: 2 / 3 });
    if (r.frac > 0.88 || r.bottom) continue;
    if (!best || r.n_g < best.r.n_g) best = { Kh, r, P };
  }
  const rr = dropSeries(best.P, WM, { vs: 3.66, liftFrac: 2 / 3 });
  const rr1 = dropSeries(best.P, WM, { vs: 3.66, liftFrac: 1 });
  console.log(`ct ${ct} rS ${rS} rC ${rC}: static ${(100 * best.P.sst / best.P.S).toFixed(0)}% Kh ${best.Kh.toFixed(0)} n_g10 ${best.r.n_g.toFixed(2)} | 12fps L=2/3 ${rr.n_g.toFixed(2)} (${(100*rr.frac).toFixed(0)}%) | 12fps L=1 ${rr1.n_g.toFixed(2)}`);
}
// series model with the proposed Kh=4000 but ct=0, 10 fps L=2/3
const P0 = prep({ ...OLEO.main, ct: 0 }, WM), r0 = dropSeries(P0, WM, { vs: 3.048, liftFrac: 2 / 3 });
const P1 = prep({ ...OLEO.main }, WM), r1 = dropSeries(P1, WM, { vs: 3.048, liftFrac: 2 / 3 });
console.log('proposed Kh 4000: ct0 n_g', r0.n_g.toFixed(3), 'ct3500 n_g', r1.n_g.toFixed(3), 'reduction %', (100 * (1 - r1.n_g / r0.n_g)).toFixed(1));
// tyre damping ratio check zeta = ct / (2 sqrt(kt m)) with m = W_st/g
console.log('zeta tyre main', (3500 / (2 * Math.sqrt(3.2e5 * WM / g))).toFixed(3), 'nose', (1200 / (2 * Math.sqrt(1.6e5 * W * 0.35 / 2.65 / g))).toFixed(3));
