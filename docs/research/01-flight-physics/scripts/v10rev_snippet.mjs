import { M } from 'test/harness.mjs';
const { Aircraft, AC, DEG, KT, G0, atmosphere, FIELD } = M;
const e2q = (f, t, p) => { const [cr, sr, cp, sp, cy, sy] = [Math.cos(f/2), Math.sin(f/2), Math.cos(t/2), Math.sin(t/2), Math.cos(p/2), Math.sin(p/2)];
  return [cr*cp*cy + sr*sp*sy, sr*cp*cy - cr*sp*sy, cr*sp*cy + sr*cp*sy, cr*cp*sy - sr*sp*cy]; };
const q2R = ([w, x, y, z]) => [1-2*(y*y+z*z), 2*(x*y-w*z), 2*(x*z+w*y), 2*(x*y+w*z), 1-2*(x*x+z*z), 2*(y*z-w*x), 2*(x*z-w*y), 2*(y*z+w*x), 1-2*(x*x+y*y)];
const Rv = (R, v) => [0, 3, 6].map(i => R[i]*v[0] + R[i+1]*v[1] + R[i+2]*v[2]);
const RTv = (R, v) => [0, 1, 2].map(i => R[i]*v[0] + R[i+3]*v[1] + R[i+6]*v[2]);
export function f9(ac, y, h) {                        // y = [u v w p q r phi theta psi] (body, SI)
  const [u, v, w, p, q, r, ph, th, ps] = y, Q = e2q(ph, th, ps), R = q2R(Q);
  const s = Float64Array.from([0, 0, -h, ...Rv(R, [u, v, w]), ...Q, p, q, r]), o = new Float64Array(13);
  ac.deriv(s, o); const ab = RTv(R, [o[3], o[4], o[5]]), t = Math.tan(th), c = Math.cos(th);
  return [ab[0] - (q*w - r*v), ab[1] - (r*u - p*w), ab[2] - (p*v - q*u), o[10], o[11], o[12],
    p + (q*Math.sin(ph) + r*Math.cos(ph))*t, q*Math.cos(ph) - r*Math.sin(ph), (q*Math.sin(ph) + r*Math.cos(ph))/c];
}
export function solve(A, b) { const n = b.length, M2 = A.map((r, i) => [...r, b[i]]);
  for (let k = 0; k < n; k++) { let p = k; for (let i = k+1; i < n; i++) if (Math.abs(M2[i][k]) > Math.abs(M2[p][k])) p = i;
    [M2[k], M2[p]] = [M2[p], M2[k]]; for (let i = k+1; i < n; i++) { const f = M2[i][k]/M2[k][k]; for (let j = k; j <= n; j++) M2[i][j] -= f*M2[k][j]; } }
  const x = Array(n).fill(0); for (let i = n-1; i >= 0; i--) { let s = M2[i][n]; for (let j = i+1; j < n; j++) s -= M2[i][j]*x[j]; x[i] = s/M2[i][i]; } return x; }
export function trim(ac, { ias, h, flaps = 0, gear = 0, gammaDeg = 0 }) {     // unknowns alpha, de, thr
  ac.flaps = flaps; ac.gearPos = gear; ac.adot = 0;
  const rho = atmosphere(FIELD.elev + h, ac.isaDev).rho, V = ias*KT/Math.sqrt(rho/1.225), g = gammaDeg*DEG;
  const Y = (a) => [V*Math.cos(a), 0, V*Math.sin(a), 0, 0, 0, 0, a + g, 0];
  const res = (x) => { ac.de = x[1]; ac.thr = x[2]; const f = f9(ac, Y(x[0]), h); return [f[0], f[2], f[4]]; };
  let x = [4*DEG, -2*DEG, 0.4];
  for (let it = 0; it < 30; it++) { const r0 = res(x), J = [[], [], []];
    for (let j = 0; j < 3; j++) { const xp = x.slice(); xp[j] += 1e-6; const r1 = res(xp); for (let i = 0; i < 3; i++) J[i][j] = (r1[i] - r0[i])/1e-6; }
    const dx = solve(J, r0.map(v => -v)); x = x.map((v, i) => v + dx[i]); if (Math.hypot(...dx) < 1e-12) break; }
  res(x); return { V, rho, h, alpha: x[0], de: x[1], thr: x[2], y0: Y(x[0]) };
}
export function linearise(ac, T) {                    // central differences + quasi-steady alpha-dot
  const n = 9, y0 = T.y0, eps = [1e-3, 1e-3, 1e-3, 1e-5, 1e-5, 1e-5, 1e-5, 1e-5, 1e-5], A = [...Array(n)].map(() => Array(n).fill(0));
  for (let j = 0; j < n; j++) { const yp = y0.slice(), ym = y0.slice(); yp[j] += eps[j]; ym[j] -= eps[j];
    const fp = f9(ac, yp, T.h), fm = f9(ac, ym, T.h); for (let i = 0; i < n; i++) A[i][j] = (fp[i] - fm[i])/(2*eps[j]); }
  ac.adot = 1e-4; const fp = f9(ac, y0, T.h); ac.adot = -1e-4; const fm = f9(ac, y0, T.h); ac.adot = 0;
  const b = fp.map((v, i) => (v - fm[i])/2e-4), V2 = y0[0]**2 + y0[2]**2, c = [-y0[2]/V2, 0, y0[0]/V2, 0, 0, 0, 0, 0, 0];
  const E = A.map((_, i) => A.map((_, j) => (i === j ? 1 : 0) - b[i]*c[j])), Ae = A.map(() => Array(n).fill(0));
  for (let j = 0; j < n; j++) { const col = solve(E, A.map(r => r[j])); for (let i = 0; i < n; i++) Ae[i][j] = col[i]; }
  return Ae;
}
export function eig4(A) {                             // Faddeev-LeVerrier + Durand-Kerner
  const n = A.length, c = Array(n + 1).fill(0); c[n] = 1; let Mk = A.map(r => r.map(() => 0));
  for (let k = 1; k <= n; k++) { const AM = A.map(r => r.map((_, j) => r.reduce((s, a, l) => s + a*Mk[l][j], 0)));
    Mk = AM.map((r, i) => r.map((v, j) => v + (i === j ? c[n-k+1] : 0)));
    c[n-k] = -A.reduce((s, r, i) => s + r.reduce((t, a, l) => t + a*Mk[l][i], 0), 0)/k; }
  const P = (zr, zi) => { let pr = 1, pi = 0; for (let k = n-1; k >= 0; k--) { const t = pr*zr - pi*zi + c[k]; pi = pr*zi + pi*zr; pr = t; } return [pr, pi]; };
  let z = [...Array(n)].map((_, k) => [0.4*Math.cos(2.4*k + 0.3) + 0.1, 0.9*Math.sin(2.4*k + 0.3)]);
  for (let it = 0; it < 2000; it++) { let d = 0;
    z = z.map((zk, k) => { const [pr, pi] = P(...zk); let qr = 1, qi = 0;
      z.forEach((zj, j) => { if (j !== k) { const dr = zk[0]-zj[0], di = zk[1]-zj[1], t = qr*dr - qi*di; qi = qr*di + qi*dr; qr = t; } });
      const m = qr*qr + qi*qi, wr = (pr*qr + pi*qi)/m, wi = (pi*qr - pr*qi)/m; d = Math.max(d, Math.hypot(wr, wi)); return [zk[0]-wr, zk[1]-wi]; });
    if (d < 1e-13) break; }
  return z.map(([re, im]) => ({ re, im: Math.abs(im) < 1e-9 ? 0 : im }));
}
// ใช้งาน: const ac = new Aircraft(), T = trim(ac, { ias: 95, h: 300, flaps: 1, gear: 1, gammaDeg: -3 }), A = linearise(ac, T);
// lon = eig4(sub(A,[0,2,4,7])) -> คู่ซับซ้อนที่ |λ| ใหญ่ = short period, เล็ก = phugoid
// lat = eig4(sub(A,[1,3,5,6])) -> คู่ซับซ้อน = Dutch roll, จริงที่ติดลบมากสุด = roll, จริงที่ใกล้ 0 = spiral
// n/alpha = qbar*S*CLalpha/W  (CLalpha หาจาก diag.CL ของ deriv ที่ alpha ± 1e-4)
// ---- reviewer driver (v10rev): run the doc snippet as published ----
const sub = (A, ix) => ix.map(i => ix.map(j => A[i][j]));
for (const c of [{ ias: 95, h: 300, flaps: 1, gear: 1, gammaDeg: -3 }, { ias: 155, h: 3000*0.3048, flaps: 0, gear: 0, gammaDeg: 0 }]) {
  const ac = new Aircraft(), T = trim(ac, c), A = linearise(ac, T);
  const lon = eig4(sub(A, [0, 2, 4, 7])), lat = eig4(sub(A, [1, 3, 5, 6]));
  const f = l => l.im ? `wn ${Math.hypot(l.re, l.im).toFixed(3)} z ${(-l.re/Math.hypot(l.re, l.im)).toFixed(3)}` : `re ${l.re.toFixed(4)}`;
  let cpl = 0; for (const i of [0,2,4,7]) for (const j of [1,3,5,6]) cpl = Math.max(cpl, Math.abs(A[i][j]), Math.abs(A[j][i]));
  console.log(c.ias, 'alpha', (T.alpha/DEG).toFixed(2), 'de', (T.de/DEG).toFixed(2), 'thr', T.thr.toFixed(3), 'coupling', cpl.toExponential(1));
  console.log(' lon', lon.filter(l => l.im >= 0).map(f).join(' | ')); console.log(' lat', lat.filter(l => l.im >= 0).map(f).join(' | '));
}
