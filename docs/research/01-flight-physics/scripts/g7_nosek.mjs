import { OLEO, prep, dropSeries } from './g7_series.mjs';
const g = 9.80665, W = 2250 * g, WN = W * 0.35 / 2.65;
let best = null;
for (let Kh = 200; Kh < 2e4; Kh *= 1.03) { const P = prep({ ...OLEO.nose, Kh, Kr: 12 * Kh }, WN); const r = dropSeries(P, WN, { vs: 3.048, liftFrac: 2 / 3 }); if (r.frac > 0.88 || r.bottom) continue; if (!best || r.n_g < best.r.n_g) best = { Kh, r }; }
console.log('nose best Kh', best.Kh.toFixed(0), 'n_g', best.r.n_g.toFixed(2), 'frac', best.r.frac.toFixed(2));
