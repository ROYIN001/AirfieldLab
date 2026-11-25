// Trim, linearisation and modes for the validation tests, ported from the owner's research round 1
// (docs/research/01-flight-physics/10-validation.md §10.5 and scripts/v10_modes.mjs). No dependencies.
//  f9: body-axis state derivative; trim: Newton on (α, δe, thr) at a given γ, wings level; linearise: central
//  differences plus the quasi-steady α̇ correction A = (I − b·cᵀ)⁻¹·A0; eig4: Faddeev–LeVerrier + Durand–Kerner;
//  modes: short period, phugoid, Dutch roll, roll and spiral with CAP; within / levelOf for the criteria.
import { M } from '../harness.mjs';
const { DEG, KT, G0, AC, eulerToQ, qToR } = M;
const Rv = (R, v) => [0, 3, 6].map((i) => R[i] * v[0] + R[i + 1] * v[1] + R[i + 2] * v[2]);
const RTv = (R, v) => [0, 1, 2].map((i) => R[i] * v[0] + R[i + 3] * v[1] + R[i + 6] * v[2]);

// y = [u v w p q r φ θ ψ] (body axes, SI); h = height above the field (m). Returns ẏ.
export function f9(ac, y, h) {
  const [u, v, w, p, q, r, ph, th, ps] = y, Q = eulerToQ(ph, th, ps), R = qToR(Q, new Array(9));
  const s = Float64Array.from([0, 0, -h, ...Rv(R, [u, v, w]), ...Q, p, q, r]), o = new Float64Array(13);
  ac.deriv(s, o);
  const ab = RTv(R, [o[3], o[4], o[5]]), t = Math.tan(th), c = Math.cos(th);
  return [ab[0] - (q * w - r * v), ab[1] - (r * u - p * w), ab[2] - (p * v - q * u), o[10], o[11], o[12],
    p + (q * Math.sin(ph) + r * Math.cos(ph)) * t, q * Math.cos(ph) - r * Math.sin(ph), (q * Math.sin(ph) + r * Math.cos(ph)) / c];
}

export function solve(A, b) {   // Gaussian elimination with partial pivoting
  const n = b.length, M2 = A.map((r, i) => [...r, b[i]]);
  for (let k = 0; k < n; k++) {
    let p = k; for (let i = k + 1; i < n; i++) if (Math.abs(M2[i][k]) > Math.abs(M2[p][k])) p = i;
    [M2[k], M2[p]] = [M2[p], M2[k]];
    for (let i = k + 1; i < n; i++) { const f = M2[i][k] / M2[k][k]; for (let j = k; j <= n; j++) M2[i][j] -= f * M2[k][j]; }
  }
  const x = Array(n).fill(0);
  for (let i = n - 1; i >= 0; i--) { let s = M2[i][n]; for (let j = i + 1; j < n; j++) s -= M2[i][j] * x[j]; x[i] = s / M2[i][i]; }
  return x;
}

// Wings-level trim at a flight-path angle: unknowns α, δe, thr; residuals u̇, ẇ, q̇.
export function trim(ac, { ias, h, flaps = 0, gear = 0, gammaDeg = 0 }) {
  ac.flaps = flaps; ac.gearPos = gear; ac.adot = 0;
  const rho = ac.atm(h).rho, V = ias * KT / Math.sqrt(rho / 1.225), g = gammaDeg * DEG;
  const Y = (a) => [V * Math.cos(a), 0, V * Math.sin(a), 0, 0, 0, 0, a + g, 0];
  const res = (x) => { ac.de = x[1]; ac.thr = x[2]; const f = f9(ac, Y(x[0]), h); return [f[0], f[2], f[4]]; };
  let x = [4 * DEG, -2 * DEG, 0.4];
  for (let it = 0; it < 30; it++) {
    const r0 = res(x), J = [[], [], []];
    for (let j = 0; j < 3; j++) { const xp = x.slice(); xp[j] += 1e-6; const r1 = res(xp); for (let i = 0; i < 3; i++) J[i][j] = (r1[i] - r0[i]) / 1e-6; }
    const dx = solve(J, r0.map((v) => -v)); x = x.map((v, i) => v + dx[i]);
    if (Math.hypot(...dx) < 1e-12) break;
  }
  const r = res(x);
  return { V, rho, h, alpha: x[0], de: x[1], thr: x[2], y0: Y(x[0]), residual: Math.max(...r.map(Math.abs)) };
}

// 9×9 state matrix about a trim (central differences, quasi-steady α̇).
export function linearise(ac, T) {
  const n = 9, y0 = T.y0, eps = [1e-3, 1e-3, 1e-3, 1e-5, 1e-5, 1e-5, 1e-5, 1e-5, 1e-5], A = [...Array(n)].map(() => Array(n).fill(0));
  for (let j = 0; j < n; j++) {
    const yp = y0.slice(), ym = y0.slice(); yp[j] += eps[j]; ym[j] -= eps[j];
    const fp = f9(ac, yp, T.h), fm = f9(ac, ym, T.h); for (let i = 0; i < n; i++) A[i][j] = (fp[i] - fm[i]) / (2 * eps[j]);
  }
  ac.adot = 1e-4; const fp = f9(ac, y0, T.h); ac.adot = -1e-4; const fm = f9(ac, y0, T.h); ac.adot = 0;
  const b = fp.map((v, i) => (v - fm[i]) / 2e-4), V2 = y0[0] ** 2 + y0[2] ** 2, c = [-y0[2] / V2, 0, y0[0] / V2, 0, 0, 0, 0, 0, 0];
  const E = A.map((_, i) => A.map((_, j) => (i === j ? 1 : 0) - b[i] * c[j])), Ae = A.map(() => Array(n).fill(0));
  for (let j = 0; j < n; j++) { const col = solve(E, A.map((r) => r[j])); for (let i = 0; i < n; i++) Ae[i][j] = col[i]; }
  return Ae;
}

export const sub = (A, ix) => ix.map((i) => ix.map((j) => A[i][j]));
export const LON = [0, 2, 4, 7], LAT = [1, 3, 5, 6];
// largest entry that couples the longitudinal and lateral blocks (0 with wings level and no propeller effects)
export function coupling(A) {
  let m = 0; for (const i of LON) for (const j of LAT) m = Math.max(m, Math.abs(A[i][j]), Math.abs(A[j][i]));
  return m;
}

export function eig4(A) {   // roots of det(sI − A) for a small matrix: Faddeev–LeVerrier + Durand–Kerner
  const n = A.length, c = Array(n + 1).fill(0); c[n] = 1; let Mk = A.map((r) => r.map(() => 0));
  for (let k = 1; k <= n; k++) {
    const AM = A.map((r) => r.map((_, j) => r.reduce((s, a, l) => s + a * Mk[l][j], 0)));
    Mk = AM.map((r, i) => r.map((v, j) => v + (i === j ? c[n - k + 1] : 0)));
    c[n - k] = -A.reduce((s, r, i) => s + r.reduce((t, a, l) => t + a * Mk[l][i], 0), 0) / k;
  }
  const P = (zr, zi) => { let pr = 1, pi = 0; for (let k = n - 1; k >= 0; k--) { const t = pr * zr - pi * zi + c[k]; pi = pr * zi + pi * zr; pr = t; } return [pr, pi]; };
  let z = [...Array(n)].map((_, k) => [0.4 * Math.cos(2.4 * k + 0.3) + 0.1, 0.9 * Math.sin(2.4 * k + 0.3)]);
  for (let it = 0; it < 2000; it++) {
    let d = 0;
    z = z.map((zk, k) => {
      const [pr, pi] = P(...zk); let qr = 1, qi = 0;
      z.forEach((zj, j) => { if (j !== k) { const dr = zk[0] - zj[0], di = zk[1] - zj[1], t = qr * dr - qi * di; qi = qr * di + qi * dr; qr = t; } });
      const m = qr * qr + qi * qi, wr = (pr * qr + pi * qi) / m, wi = (pi * qr - pr * qi) / m; d = Math.max(d, Math.hypot(wr, wi));
      return [zk[0] - wr, zk[1] - wi];
    });
    if (d < 1e-13) break;
  }
  return z.map(([re, im]) => ({ re, im: Math.abs(im) < 1e-9 ? 0 : im }));
}

// A pair of real roots reported as a quadratic: ζ ≥ 1 when both decay; a growing root gives ζ < 0, so a divergence
// fails every damping check instead of passing as "overdamped".
const pair = (r1, r2) => { const p = r1 * r2, s = -(r1 + r2), wn = Math.sqrt(Math.abs(p)); return { wn, zeta: p > 0 ? s / (2 * wn) : -1, reals: [r1, r2] }; };
const osc = (l) => { const wn = Math.hypot(l.re, l.im); return { wn, zeta: -l.re / wn, T: 2 * Math.PI / Math.abs(l.im), re: l.re }; };

// Modes about a trim. CAP = ωsp² / (n/α), n/α = q̄·S·CLα / W.
export function modes(ac, T) {
  const A = linearise(ac, T), lon = eig4(sub(A, LON)), lat = eig4(sub(A, LAT));
  const lc = lon.filter((l) => l.im > 0).sort((a, b) => Math.hypot(b.re, b.im) - Math.hypot(a.re, a.im));
  const lr = lon.filter((l) => l.im === 0).map((l) => l.re).sort((a, b) => Math.abs(b) - Math.abs(a));
  let sp, ph;
  if (lc.length === 2) { sp = osc(lc[0]); ph = osc(lc[1]); }
  else if (lc.length === 1) { if (Math.hypot(lc[0].re, lc[0].im) > 1) { sp = osc(lc[0]); ph = pair(lr[0], lr[1]); } else { ph = osc(lc[0]); sp = pair(lr[0], lr[1]); } }
  else { sp = pair(lr[0], lr[1]); ph = pair(lr[2], lr[3]); }
  const dc = lat.find((l) => l.im > 0), lreal = lat.filter((l) => l.im === 0).map((l) => l.re).sort((a, b) => a - b);
  const dr = dc ? osc(dc) : { wn: 0, zeta: -1 };
  const roll = lreal.length ? { re: lreal[0], tau: -1 / lreal[0] } : { re: 0, tau: Infinity };
  const spiral = lreal.length ? { re: lreal[lreal.length - 1], t2: lreal[lreal.length - 1] > 0 ? Math.LN2 / lreal[lreal.length - 1] : Infinity } : { re: 0, t2: Infinity };
  // n/α from the lift slope at the trim (finite difference of diag.CL)
  const clAt = (a) => { const y = T.y0.slice(), V = Math.hypot(y[0], y[2]); y[0] = V * Math.cos(a); y[2] = V * Math.sin(a); y[7] = a + (T.y0[7] - Math.atan2(T.y0[2], T.y0[0]));
    const Q = eulerToQ(y[6], y[7], y[8]), R = qToR(Q, new Array(9)), s = Float64Array.from([0, 0, -T.h, ...Rv(R, [y[0], y[1], y[2]]), ...Q, 0, 0, 0]), d = { wow: [0, 0, 0], load: [0, 0, 0] };
    ac.deriv(s, new Float64Array(13), d); return d.CL; };
  const a0 = Math.atan2(T.y0[2], T.y0[0]), CLa = (clAt(a0 + 1e-4) - clAt(a0 - 1e-4)) / 2e-4;
  const qbar = 0.5 * T.rho * T.V * T.V, nAlpha = qbar * AC.S * CLa / (AC.m * G0);
  return { A, lon, lat, sp, ph, dr, roll, spiral, nAlpha, cap: sp.wn ** 2 / nAlpha, coupling: coupling(A) };
}

export const within = (v, lo, hi) => Number.isFinite(v) && v >= lo && v <= hi;
// The first band (Level 1, 2, 3 …) whose [lo, hi] holds the value, or 0 when none does.
export function levelOf(value, bands) {
  for (let i = 0; i < bands.length; i++) if (within(value, bands[i][0], bands[i][1])) return i + 1;
  return 0;
}

// The two conditions of the research (§10.1): approach 95 KIAS, landing flaps, gear down, 300 m, γ −3°; cruise
// 155 KIAS clean at 3,000 ft.
export const APPROACH = { ias: 95, h: 300, flaps: 1, gear: 1, gammaDeg: -3 };
export const CRUISE = { ias: 155, h: 3000 * 0.3048, flaps: 0, gear: 0, gammaDeg: 0 };
