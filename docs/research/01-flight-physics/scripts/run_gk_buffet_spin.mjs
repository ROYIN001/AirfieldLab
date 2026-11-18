// (1) Goman-Khrabrov / Fischenberg separation dynamics: hysteresis and dynamic CLmax
// (2) buffet shaping filter (van Horssen et al. 2018 form) at 240 Hz: PSD peak and RMS
// (3) spin equilibrium estimates for the trainer
import { P, coeffs, X0, DEG, RAD, KT, G0 } from './proto_aero.mjs';
const tau1 = 0.6, tau2 = 0.3;                      // s (estimates scaled from Citation II identification)
function ramp(f, aFrom, aTo, rateDegS) {
  const dt = 1 / 240; let a = aFrom * DEG, X = X0(a, P.cfg[f]); const out = [];
  const adot = Math.sign(aTo - aFrom) * rateDegS * DEG;
  while ((adot > 0 && a < aTo * DEG) || (adot < 0 && a > aTo * DEG)) {
    const Xs = X0(a - tau2 * adot, P.cfg[f]);
    X += (Xs - X) * (1 - Math.exp(-dt / tau1));     // exact first-order step
    a += adot * dt;
    out.push({ a: a * RAD, CL: coeffs(a, f, X).CL, X });
  }
  return { out, X };
}
for (const f of [0, 1]) for (const rate of [1, 5, 20]) {
  const up = ramp(f, 0, 30, rate).out;
  const peak = up.reduce((b, r) => (r.CL > b.CL ? r : b), { CL: -9 });
  // down branch from fully separated state at 30 deg
  const k = P.cfg[f]; const dt = 1 / 240; let a = 30 * DEG, X = X0(a, k); const adot = -rate * DEG; const dn = [];
  while (a > 0) { X += (X0(a - tau2 * adot, k) - X) * (1 - Math.exp(-dt / tau1)); a += adot * dt; dn.push({ a: a * RAD, CL: coeffs(a, f, X).CL }); }
  const at = (arr, aa) => arr.reduce((b, r) => (Math.abs(r.a - aa) < Math.abs(b.a - aa) ? r : b));
  const aS = k.aStar * RAD;
  let staticMax = -9; for (let aa = 5; aa < 25; aa += 0.02) staticMax = Math.max(staticMax, coeffs(aa * DEG, f).CL);
  console.log(`flaps ${f} ramp ${rate} deg/s: dyn CLmax ${peak.CL.toFixed(3)} at ${peak.a.toFixed(1)} deg (static ${staticMax.toFixed(3)}, +${(100 * (peak.CL / staticMax - 1)).toFixed(1)}%); CL up/down at a*=${aS.toFixed(1)}: ${at(up, aS).CL.toFixed(3)} / ${at(dn, aS).CL.toFixed(3)}; at a*-3: ${at(up, aS - 3).CL.toFixed(3)} / ${at(dn, aS - 3).CL.toFixed(3)}`);
}
// (2) buffet filter: y'' + (w0/Q) y' + w0^2 y = H0 w0^2 u, u white noise (unit PSD); discretised with semi-implicit Euler at 240 Hz
function makeRng(seed) { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
function gauss(r) { let u = 0; while (u === 0) u = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * r()); }
function buffet({ w0, Q, rmsTarget, T = 60, dt = 1 / 240, seed = 3 }) {
  // continuous-time unit-intensity white noise -> discrete std 1/sqrt(dt); RMS of 2nd-order resonant LPF output:
  // var = H0^2 w0^4 * (pi/2) * Q / w0^3 ... use analytic: sigma^2 = H0^2 * w0 * Q / 4 * (2) for two-sided unit PSD (Phi=1)
  const r = makeRng(seed); let y = 0, yd = 0; const ys = [];
  for (let t = 0; t < T; t += dt) { const u = gauss(r) / Math.sqrt(dt); const ydd = w0 * w0 * (u - y) - (w0 / Q) * yd; yd += ydd * dt; y += yd * dt; ys.push(y); }
  const rms = Math.sqrt(ys.reduce((s, v) => s + v * v, 0) / ys.length);
  const g = rmsTarget / rms; const z = ys.map(v => v * g);
  // DFT-based PSD peak (coarse, Welch-free): scan 1..40 Hz
  let best = { f: 0, p: 0 }; const N = Math.min(z.length, 240 * 20);
  for (let fq = 1; fq <= 40; fq += 0.25) { let re = 0, im = 0; for (let i = 0; i < N; i++) { const ph = 2 * Math.PI * fq * i * dt; re += z[i] * Math.cos(ph); im += z[i] * Math.sin(ph); } const p = re * re + im * im; if (p > best.p) best = { f: fq, p }; }
  return { gain: g, rmsRaw: rms, peakHz: best.f };
}
console.log('buffet vertical (w0 75.92 rad/s, Q 8.28):', JSON.stringify(buffet({ w0: 75.92, Q: 8.28, rmsTarget: 0.05 * G0 })));
console.log('buffet lateral 1 (w0 36.43, Q 4.19):', JSON.stringify(buffet({ w0: 36.43, Q: 4.19, rmsTarget: 0.016 * G0 })));
// (3) spin estimates
const W = P.m * G0, rho = 1.225;
for (const aS of [40, 45, 50, 55, 60]) {
  const c = coeffs(aS * DEG, 0); const CR = Math.hypot(c.CL, c.CD);
  const Vd = Math.sqrt(2 * W / (rho * P.S * CR));
  const om = [0.30, 0.42].map(k => k * 2 * Vd / P.b * RAD);
  console.log(`spin alpha ${aS}: CR ${CR.toFixed(3)} -> descent ${Vd.toFixed(1)} m/s = ${(Vd / 0.3048 * 60).toFixed(0)} fpm; Omega(Ob/2V 0.30..0.42) ${om[0].toFixed(0)}..${om[1].toFixed(0)} deg/s, s/turn ${(360 / om[1]).toFixed(1)}..${(360 / om[0]).toFixed(1)}, ft/turn ${(Vd / 0.3048 * 360 / om[1]).toFixed(0)}..${(Vd / 0.3048 * 360 / om[0]).toFixed(0)}`);
}
// NASA TP-2644 airplane cross-check: W 1535 lb, S 98.11 ft2, b 24.46 ft, turn rate 145..208 deg/s
{ const Wlb = 1535, S = 98.11, b = 24.46, rhoI = 0.0023769; for (const CR of [1.0, 1.2]) { const Vd = Math.sqrt(2 * Wlb / (rhoI * S * CR)); console.log(`TP-2644 a/c CR ${CR}: Vdesc ${Vd.toFixed(0)} ft/s (${(Vd * 60).toFixed(0)} fpm); Ob/2V at 145/208 deg/s: ${(145 * DEG * b / (2 * Vd)).toFixed(3)} / ${(208 * DEG * b / (2 * Vd)).toFixed(3)}`); } }
// inertia yawing-moment parameter
console.log('IYMP trainer (Ixx-Iyy)/(m b^2) =', ((P.Ixx - P.Iyy) / (P.m * P.b * P.b) * 1e4).toFixed(0), 'x1e-4');
console.log('relative density mu = m/(rho S b) =', (P.m / (rho * P.S * P.b)).toFixed(1), ' at 1.225; at 0.9 kg/m3:', (P.m / (0.9 * P.S * P.b)).toFixed(1));
