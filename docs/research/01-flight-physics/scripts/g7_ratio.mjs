// Section 7: trade study of gas-spring pressure ratios (extended:static:compressed) for the main strut. Run: node g7_ratio.mjs
import { OLEO, prep, dropSeries, gasF } from './g7_series.mjs';
const g = 9.80665, W = 2250 * g, WM = W * (1 - 0.35 / 2.65) / 2;
for (const [rS, rC] of [[4, 12], [3, 10], [3, 8], [2.5, 8], [2.5, 6]]) {
  let best = null;
  for (let Kh = 500; Kh < 3e4; Kh *= 1.03) {
    const P = prep({ ...OLEO.main, rStatic: rS, rComp: rC, Kh, Kr: 12 * Kh }, WM);
    const r = dropSeries(P, WM, { vs: 3.048, liftFrac: 2 / 3 });
    if (r.frac > 0.88 || r.bottom) continue;
    if (!best || r.n_g < best.r.n_g) best = { Kh, r, P };
  }
  const P = best.P, sst = P.L0 * (1 - 1 / rS);
  const rr = dropSeries(P, WM, { vs: 3.66, liftFrac: 2 / 3 });
  console.log(`rS ${rS} rC ${rC}: static ${(100 * sst / P.S).toFixed(0)}% stroke | Kh ${best.Kh.toFixed(0)} | limit n_g ${best.r.n_g.toFixed(2)} stroke ${(100 * best.r.frac).toFixed(0)}% bounce ${best.r.bounce} | reserve(3.66,L=2/3) n_g ${rr.n_g.toFixed(2)} stroke ${(100 * rr.frac).toFixed(0)}% bottom ${rr.bottom} | gas@full ${(gasF(P, P.S * 0.995) / WM).toFixed(2)} W_st`);
}
