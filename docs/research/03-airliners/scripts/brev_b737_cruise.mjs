// brev_b737_cruise.mjs — reviewer: full 4x4 modes at cruise 65 t, M 0.785, FL350 ISA with the card's cruise
// derivatives (Cma scaled to -1.3 as in b_mass_modes.mjs). Run: node brev_b737_cruise.mjs
const g = 9.80665, DEG = Math.PI / 180, S = 124.6, b = 34.32, c = 4.17, R = 287.05287;
const r = (x, n = 3) => Number(x.toFixed(n));
const h = 35000 * 0.3048, T = 288.15 - 0.0065 * h, p = 101325 * (T / 288.15) ** (g / (0.0065 * R)), rho = p / (R * T), a = Math.sqrt(1.4 * R * T);
const V = 0.785 * a, q = 0.5 * rho * V * V, qS = q * S, m = 65000, gam = 0;
const s = m / 60000, Ib = { Ixx: 1927945 * s, Iyy: 3506319 * s, Izz: 5264775 * s, Ixz: 154032 * s };
const CL = m * g / qS, d = { CLa: 6.79, CLq: 8.0, CLad: 2.9, Cma: -1.3, Cmq: -37.4, Cmad: -12.0, K: 0.042, CD: 0.0296, CYb: -0.87, CYr: 0.43, Clb: -0.157, Clp: -0.50, Clr: 0.145, Cnb: 0.167, Cnp: -0.063, Cnr: -0.242 };
function charpoly(A) { const n = A.length; const I = (i, j) => (i === j ? 1 : 0); let M = A.map((r, i) => r.map((_, j) => I(i, j))); const cf = [1];
  const mul = (X, Y) => X.map((row, i) => Y[0].map((_, j) => row.reduce((s, _, k) => s + X[i][k] * Y[k][j], 0)));
  for (let k = 1; k <= n; k++) { const AM = mul(A, M); const ck = -AM.reduce((s, row, i) => s + row[i], 0) / k; cf.push(ck); M = AM.map((row, i) => row.map((v, j) => v + ck * I(i, j))); } return cf; }
function roots(cf) { const n = cf.length - 1; let z = Array.from({ length: n }, (_, k) => [Math.cos(2 * Math.PI * k / n + 0.4) * 0.9, Math.sin(2 * Math.PI * k / n + 0.4) * 0.9]);
  const cm = (p, q) => [p[0] * q[0] - p[1] * q[1], p[0] * q[1] + p[1] * q[0]], cd = (p, q) => { const d = q[0] ** 2 + q[1] ** 2; return [(p[0] * q[0] + p[1] * q[1]) / d, (p[1] * q[0] - p[0] * q[1]) / d]; };
  const P = x => cf.reduce((acc, c) => { const t = cm(acc, x); return [t[0] + c, t[1]]; }, [0, 0]);
  for (let it = 0; it < 3000; it++) z = z.map((zi, i) => { let den = [1, 0]; z.forEach((zj, j) => { if (j !== i) den = cm(den, [zi[0] - zj[0], zi[1] - zj[1]]); }); const dd = cd(P(zi), den); return [zi[0] - dd[0], zi[1] - dd[1]]; });
  return z.map(([re, im]) => [re, Math.abs(im) < 1e-9 ? 0 : im]); }
const desc = ([re, im]) => im > 0 ? `osc wn ${r(Math.hypot(re, im))} zeta ${r(-re / Math.hypot(re, im))} T ${r(2 * Math.PI / im, 2)} s` : im === 0 ? `real ${r(re, 4)} (tau ${r(-1 / re, 2)} s)` : null;
const Xu = -2 * d.CD * qS / (m * V), Xa = (CL - 2 * d.K * CL * d.CLa) * qS / m, Zu = -2 * CL * qS / (m * V), Za = -(d.CLa + d.CD) * qS / m;
const Zad = -d.CLad * qS * c / (2 * m * V), Zq = -d.CLq * qS * c / (2 * m * V), Ma = qS * c * d.Cma / Ib.Iyy, Mq = qS * c * c * d.Cmq / (2 * V * Ib.Iyy), Mad = qS * c * c * d.Cmad / (2 * V * Ib.Iyy);
const den = V - Zad;
const A = [[Xu, Xa, 0, -g], [Zu / den, Za / den, (V + Zq) / den, 0], [Mad * Zu / den, Ma + Mad * Za / den, Mq + Mad * (V + Zq) / den, 0], [0, 0, 1, 0]];
console.log('cruise V', r(V, 1), 'rho', r(rho, 4), 'CL', r(CL));
console.log('LONG full:', roots(charpoly(A)).map(desc).filter(Boolean).join(' | '), '; Lanchester T', r(Math.PI * Math.SQRT2 * V / g, 1));
const a0 = (CL - 0.2) / 6.794; // body alpha ~2.5 deg; use stability axes
const e = a0, Ixx = Ib.Ixx * Math.cos(e) ** 2 + Ib.Izz * Math.sin(e) ** 2 - Ib.Ixz * Math.sin(2 * e), Izz = Ib.Ixx * Math.sin(e) ** 2 + Ib.Izz * Math.cos(e) ** 2 + Ib.Ixz * Math.sin(2 * e), Ixz = 0.5 * (Ib.Ixx - Ib.Izz) * Math.sin(2 * e) + Ib.Ixz * Math.cos(2 * e);
const Yb = qS * d.CYb / m, Yr = qS * b * d.CYr / (2 * m * V);
const L = [qS * b * d.Clb, qS * b * b * d.Clp / (2 * V), qS * b * b * d.Clr / (2 * V)], N = [qS * b * d.Cnb, qS * b * b * d.Cnp / (2 * V), qS * b * b * d.Cnr / (2 * V)];
const G = Ixx * Izz - Ixz * Ixz, pd = L.map((x, k) => (Izz * x + Ixz * N[k]) / G), rd = L.map((x, k) => (Ixz * x + Ixx * N[k]) / G);
const B = [[Yb / V, 0, Yr / V - 1, g / V], [...pd, 0], [...rd, 0], [0, 1, 0, 0]];
console.log('LAT full (stab axes):', roots(charpoly(B)).map(desc).filter(Boolean).join(' | '));
