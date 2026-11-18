// Section 7: expected values for T-G-08, T-G-09, T-G-12, T-G-13. Run: node g7_tests.mjs
import { mu109max, VP } from './g7_ground.mjs';
const r = (x, n = 3) => +x.toFixed(n);
console.log('T-G-08', { m80_60: r(mu109max(80, 60)), m0_50: r(mu109max(0, 50)), m100_100: r(mu109max(100, 100)), m60_150: r(mu109max(60, 150)) });
const p = 60, vp = VP(p);
const peak2 = (V) => (V < 0.85 * vp ? Math.min(0.16, 0.5 * 0.8 * mu109max(V, p)) / 0.8 : 0.05);
console.log('T-G-09', { VP60: r(vp, 2), onset: r(0.85 * vp, 2), peakRWYCC2_at50: r(peak2(50)), peakRWYCC2_at58: r(peak2(58)), peakRWYCC2_at65: r(peak2(65)), wetRWYCC5_at65: r(mu109max(65, p)) });
// T-G-12: first-order relaxation y' = vs - |vl|/L y  -> distance constant L
const L = 0.30, V = 30, a = 2 / 57.2958; let y = 0, t = 0; const dt = 1e-5, yss = L * Math.tan(a);
while (y < 0.632 * yss) { y += (V * Math.tan(a) - V / L * y) * dt; t += dt; }
console.log('T-G-12', { t63_ms: r(t * 1000, 2), dist63_m: r(t * V, 3) });
// T-G-13: wet RWYCC5 at 60 kt, N = 9.5 kN per main: mu_peak, lock threshold vs Fbmax
const N = 9575, mp = mu109max(60, p), Fb = 0.6 * N;
console.log('T-G-13', { mu_peak_60kt: r(mp), lockForce_N: Math.round(mp * N), Fbmax_N: Math.round(Fb), locks: Fb > mp * N, mu_skid: r(0.5 * mp), latCoef_locked_3deg: r(0.5 * mp * Math.sin(3 / 57.2958)), dryLock: Fb > 0.8 * N });
// at what speed does the trainer brake lock on RWYCC5? solve mu109max(V,60)*N = Fb with N static (no load transfer)
let Vl = 0; while (mu109max(Vl, p) > 0.6) Vl += 0.1; console.log('T-G-13 lock above (static load)', r(Vl, 1), 'kt');
