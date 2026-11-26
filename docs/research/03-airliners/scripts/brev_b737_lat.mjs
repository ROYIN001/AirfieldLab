// brev_b737_lat.mjs — reviewer check of T-B-15..18: full 4x4 linear models vs the approximate formulas
// used in the report, at approach 60 t, Vref30+5 = 142.06 kt, ISA SL, flaps 30 gear down, gamma -3 deg.
// Derivatives are the card's approach values (table 3.2.5.6). Run: node brev_b737_lat.mjs
const g = 9.80665, KT = 1852 / 3600, DEG = Math.PI / 180, S = 124.6, b = 34.32, c = 4.17, rho = 1.225;
const r = (x, n = 3) => Number(x.toFixed(n));
// generic real eigenvalues/complex via QR-free approach: characteristic polynomial (Faddeev-LeVerrier) + Durand-Kerner
function charpoly(A) { const n = A.length; const I = (i, j) => (i === j ? 1 : 0); let M = A.map((r, i) => r.map((_, j) => I(i, j))); const cf = [1];
  const mul = (X, Y) => X.map((row, i) => Y[0].map((_, j) => row.reduce((s, _, k) => s + X[i][k] * Y[k][j], 0)));
  for (let k = 1; k <= n; k++) { const AM = mul(A, M); const ck = -AM.reduce((s, row, i) => s + row[i], 0) / k; cf.push(ck); M = AM.map((row, i) => row.map((v, j) => v + ck * I(i, j))); } return cf; }
function roots(cf) { const n = cf.length - 1; let z = Array.from({ length: n }, (_, k) => [Math.cos(2 * Math.PI * k / n + 0.4) * 0.9, Math.sin(2 * Math.PI * k / n + 0.4) * 0.9]);
  const cm = (p, q) => [p[0] * q[0] - p[1] * q[1], p[0] * q[1] + p[1] * q[0]], cd = (p, q) => { const d = q[0] ** 2 + q[1] ** 2; return [(p[0] * q[0] + p[1] * q[1]) / d, (p[1] * q[0] - p[0] * q[1]) / d]; };
  const P = x => cf.reduce((acc, c) => { const t = cm(acc, x); return [t[0] + c, t[1]]; }, [0, 0]);
  for (let it = 0; it < 2000; it++) z = z.map((zi, i) => { let den = [1, 0]; z.forEach((zj, j) => { if (j !== i) den = cm(den, [zi[0] - zj[0], zi[1] - zj[1]]); }); const d = cd(P(zi), den); return [zi[0] - d[0], zi[1] - d[1]]; });
  return z.map(([re, im]) => [Math.abs(re) < 1e-12 ? 0 : re, Math.abs(im) < 1e-9 ? 0 : im]); }
const desc = ([re, im]) => im > 0 ? `osc wn ${r(Math.hypot(re, im))} zeta ${r(-re / Math.hypot(re, im))} T ${r(2 * Math.PI / im, 2)} s` : im === 0 ? `real ${r(re, 4)} (tau ${r(-1 / re, 2)} s)` : null;
// mass and inertia (Wolfram radii x 60 t), body axes
const m = 60000, Ib = { Ixx: 1927945, Iyy: 3506319, Izz: 5264775, Ixz: 154032 };
const V = 142.06 * KT, q = 0.5 * rho * V * V, qS = q * S, gam = -3 * DEG, a0 = 5.4 * DEG;
const d = { CLa: 5.26, CLq: 8.0, CLad: 2.2, Cma: -1.0, Cmq: -37.4, Cmad: -9.2, K: 0.0383, CD: 0.1545, CYb: -0.87, CYr: 0.43, CYp: 0, Clb: -0.247, Clp: -0.50, Clr: 0.383, Cnb: 0.167, Cnp: -0.181, Cnr: -0.272 };
const CL = m * g * Math.cos(gam) / qS;
// ---- longitudinal (stability axes)
{ const Xu = -2 * d.CD * qS / (m * V), Xa = (CL - 2 * d.K * CL * d.CLa) * qS / m, Zu = -2 * CL * qS / (m * V), Za = -(d.CLa + d.CD) * qS / m;
  const Zad = -d.CLad * qS * c / (2 * m * V), Zq = -d.CLq * qS * c / (2 * m * V), Ma = qS * c * d.Cma / Ib.Iyy, Mq = qS * c * c * d.Cmq / (2 * V * Ib.Iyy), Mad = qS * c * c * d.Cmad / (2 * V * Ib.Iyy);
  const den = V - Zad;
  const A = [[Xu, Xa, 0, -g * Math.cos(gam)], [Zu / den, Za / den, (V + Zq) / den, -g * Math.sin(gam) / den],
    [Mad * Zu / den, Ma + Mad * Za / den, Mq + Mad * (V + Zq) / den, -Mad * g * Math.sin(gam) / den], [0, 0, 1, 0]];
  console.log('CL', r(CL), 'V m/s', r(V, 2));
  console.log('LONG full:', roots(charpoly(A)).map(desc).filter(Boolean).join(' | '));
  console.log('  Lanchester T', r(Math.PI * Math.SQRT2 * V / g, 1), 's ; improved (Mq-corrected) T', r(2 * Math.PI / Math.sqrt((2 * g * g / (V * V)) * (-Ma) / (-Ma + Za * Mq / V)), 1), 's');
}
// ---- lateral: (a) stability axes with inertia rotated to stability axes; (b) body axes at alpha0
function lat(axes) {
  let Ixx, Izz, Ixz, al, th;
  if (axes === 'stab') { const e = a0; // rotate body inertia to stability axes (Etkin 4.11)
    Ixx = Ib.Ixx * Math.cos(e) ** 2 + Ib.Izz * Math.sin(e) ** 2 - Ib.Ixz * Math.sin(2 * e);
    Izz = Ib.Ixx * Math.sin(e) ** 2 + Ib.Izz * Math.cos(e) ** 2 + Ib.Ixz * Math.sin(2 * e);
    Ixz = 0.5 * (Ib.Ixx - Ib.Izz) * Math.sin(2 * e) + Ib.Ixz * Math.cos(2 * e); al = 0; th = gam; }
  else { ({ Ixx, Izz, Ixz } = Ib); al = a0; th = gam + a0; }
  const Yb = qS * d.CYb / m, Yr = qS * b * d.CYr / (2 * m * V);
  const L = [qS * b * d.Clb, qS * b * b * d.Clp / (2 * V), qS * b * b * d.Clr / (2 * V)], N = [qS * b * d.Cnb, qS * b * b * d.Cnp / (2 * V), qS * b * b * d.Cnr / (2 * V)];
  const G = Ixx * Izz - Ixz * Ixz; const pd = L.map((x, k) => (Izz * x + Ixz * N[k]) / G), rd = L.map((x, k) => (Ixz * x + Ixx * N[k]) / G);
  const A = [[Yb / V, Math.sin(al), Yr / V - Math.cos(al), g * Math.cos(th) / V], [...pd, 0], [...rd, 0], [0, 1, Math.tan(th), 0]];
  console.log(`LAT ${axes} (Ixx ${Math.round(Ixx)}, Izz ${Math.round(Izz)}, Ixz ${Math.round(Ixz)}):`, roots(charpoly(A)).map(desc).filter(Boolean).join(' | '));
  const Nb = N[0] / Izz, Nr = N[2] / Izz;
  return { Nb, Nr, Yb };
}
const s1 = lat('stab'); lat('body');
const wdr = Math.sqrt(s1.Nb + s1.Yb * s1.Nr / V); console.log('  Dutch roll approx (report formula):', r(Math.sqrt(qS * b * d.Cnb / Ib.Izz + (qS * d.CYb / m) * (qS * b * b * d.Cnr / (2 * V * Ib.Izz)) / V)));
// sensitivity: JSBSim-like Cnb/Cnr/Clp
d.Cnb = 0.26; d.Cnr = -0.35; d.Clp = -0.40; console.log('-- with Cnb 0.26, Cnr -0.35, Clp -0.40 (JSBSim)'); lat('stab');
d.Cnb = 0.167; d.Cnr = -0.272; d.Clp = -0.50; d.Clb = -0.157; console.log('-- with Clb -0.157 (cruise value)'); lat('stab');
