// Collects every expected value quoted in Section 1 tests (T-A-xx) for the proposed model with default parameters.
import { P, coeffs, X0, DEG, RAD, KT, G0, wrapPi } from './proto_aero.mjs';
const W = P.m * G0, rho0 = 1.225, vs = (CL) => Math.sqrt(2 * W / (rho0 * P.S * CL)) / KT;
const out = {};
const clmax = (f) => { let b = -9, ab = 0; for (let a = 0; a <= 30; a += 0.01) { const c = coeffs(a * DEG, f).CL; if (c > b) { b = c; ab = a; } } return [b, ab]; };
for (const f of [0, 1]) {
  const [cm, am] = clmax(f);
  // stall-warning alpha for 5 kt and 7 kt margin (1-g, ISA SL)
  const aw = (dv) => { const tgt = cm * (vs(cm) / (vs(cm) + dv)) ** 2; for (let a = 0; a < am; a += 0.01) if (coeffs(a * DEG, f).CL >= tgt) return a; };
  out['f' + f] = { CLmax: +cm.toFixed(4), aCLmax: +am.toFixed(2), Vs: +vs(cm).toFixed(2), aWarn5: +aw(5).toFixed(2), aWarn7: +aw(7).toFixed(2),
    CL_plus5: +coeffs((am + 5) * DEG, f).CL.toFixed(3), drop5pct: +(100 * (1 - coeffs((am + 5) * DEG, f).CL / cm)).toFixed(1),
    CN90: +coeffs(90 * DEG, f).CN.toFixed(3), Cm90: +coeffs(90 * DEG, f).Cm.toFixed(3), CL45: +coeffs(45 * DEG, f).CL.toFixed(3), CD180: +coeffs(Math.PI, f).CD.toFixed(3) };
}
// GK with default tau1 0.4, tau2 0.2
const tau1 = 0.4, tau2 = 0.2;
function dyn(f, rate) { const dt = 1 / 240, k = P.cfg[f]; let a = 0, X = 1, best = -9, ab = 0; const adot = rate * DEG; const up = [];
  while (a < 30 * DEG) { X += (X0(a - tau2 * adot, k) - X) * (1 - Math.exp(-dt / tau1)); a += adot * dt; const c = coeffs(a, f, X).CL; up.push([a * RAD, c]); if (c > best) { best = c; ab = a * RAD; } }
  let dn = []; X = X0(a, k); while (a > 0) { X += (X0(a + tau2 * adot, k) - X) * (1 - Math.exp(-dt / tau1)); a -= adot * dt; dn.push([a * RAD, coeffs(a, f, X).CL]); }
  const at = (arr, x) => arr.reduce((b, r) => (Math.abs(r[0] - x) < Math.abs(b[0] - x) ? r : b))[1];
  const aS = k.aStar * RAD;
  return { dynCLmax: +best.toFixed(3), at: +ab.toFixed(2), overshootPct: +(100 * (best / clmax(f)[0] - 1)).toFixed(1), upAtAstar: +at(up, aS).toFixed(3), dnAtAstar: +at(dn, aS).toFixed(3) };
}
out.gk = { clean_1dps: dyn(0, 1), clean_5dps: dyn(0, 5), land_1dps: dyn(1, 1), land_5dps: dyn(1, 5) };
// step response of X: alpha held, X from 1 toward X0 -> 63% at tau1
{ const k = P.cfg[0], a = 20 * DEG, dt = 1 / 240; let X = 1, t = 0; const Xs = X0(a, k); while (t < tau1 - 1e-9) { X += (Xs - X) * (1 - Math.exp(-dt / tau1)); t += dt; } out.gk.stepAt_tau1 = { X: +X.toFixed(3), X0: +Xs.toFixed(4), frac: +((1 - X) / (1 - Xs)).toFixed(3) }; }
// large-beta lift scaling cos^2(beta)
out.beta = { liftRatio_b60: +(Math.cos(60 * DEG) ** 2).toFixed(3) };
console.log(JSON.stringify(out, null, 1));
// example table for JSON: CL, CD, Cm clean & landing at coarse breakpoints
const bp = [-180, -150, -120, -90, -60, -40, -30, -20, -16, -12, -8, -4, 0, 4, 8, 10, 12, 13, 14, 15, 16, 17, 18, 20, 22, 25, 30, 40, 50, 60, 75, 90, 105, 120, 135, 150, 165, 180];
const tab = {}; for (const f of [0, 1]) for (const k of ['CL', 'CD', 'Cm']) tab[k + '_' + f] = bp.map(a => +coeffs(a * DEG, f)[k].toFixed(3));
console.log('BP', JSON.stringify(bp)); for (const k in tab) console.log(k, JSON.stringify(tab[k]));
// table-vs-formula error with linear interpolation on these breakpoints (clean CL), max over 0.1deg grid
for (const f of [0, 1]) { let e = 0, ea = 0; const T = tab['CL_' + f];
  for (let a = -180; a <= 180; a += 0.1) { let i = bp.findIndex((x, j) => a >= x && a <= bp[j + 1]); if (i < 0) i = bp.length - 2; const u = (a - bp[i]) / (bp[i + 1] - bp[i]); const v = T[i] + u * (T[i + 1] - T[i]); const d = Math.abs(v - coeffs(a * DEG, f).CL); if (d > e) { e = d; ea = a; } }
  console.log(`flaps ${f}: max |CL_table(linear) - CL_formula| = ${e.toFixed(3)} at ${ea.toFixed(1)} deg (${bp.length} breakpoints)`); }
// data volume estimate (numbers) for the recommended per-aircraft tables
const nA = 96, nF = 3, nB = 9, nAL = 13, nOm = 7;
const nums = { long_static: nA * 3 * nF, lat_static: nAL * nB * 3, damping: 6 * 20, control: 8 * 20, rotary: nAL * nOm * 2, ground: 2 * 12 };
const tot = Object.values(nums).reduce((s, v) => s + v, 0);
console.log('table numbers', JSON.stringify(nums), 'total', tot, '-> JSON ~', (tot * 7 / 1024).toFixed(1), 'KiB; Float32 ~', (tot * 4 / 1024).toFixed(1), 'KiB; x6 Mach for airliner ~', (tot * 6 * 7 / 1024).toFixed(0), 'KiB');
