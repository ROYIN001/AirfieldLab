// v10_modes.mjs — linear modes of the CURRENT AirfieldLab model (dependency-free; candidate for test/modes.test.mjs)
// Linearises Aircraft.deriv about a trim, body-axis states y = [u v w p q r phi theta psi],
// alpha-dot handled quasi-steadily (adot = (u*wdot - w*udot)/V^2), eigenvalues of the 4x4
// longitudinal [u w q theta] and lateral [v p r phi] blocks by Faddeev-LeVerrier + Durand-Kerner.
import { M } from 'test/harness.mjs';
const { Aircraft, AC, DEG, RAD, KT, FT, G0, atmosphere } = M;
const RHO0 = 1.225;
const e2q = (f, t, p) => { const cr = Math.cos(f/2), sr = Math.sin(f/2), cp = Math.cos(t/2), sp = Math.sin(t/2), cy = Math.cos(p/2), sy = Math.sin(p/2);
  return [cr*cp*cy + sr*sp*sy, sr*cp*cy - cr*sp*sy, cr*sp*cy + sr*cp*sy, cr*cp*sy - sr*sp*cy]; };
const q2R = ([w, x, y, z]) => [1-2*(y*y+z*z), 2*(x*y-w*z), 2*(x*z+w*y), 2*(x*y+w*z), 1-2*(x*x+z*z), 2*(y*z-w*x), 2*(x*z-w*y), 2*(y*z+w*x), 1-2*(x*x+y*y)];
const Rv = (R, v) => [R[0]*v[0]+R[1]*v[1]+R[2]*v[2], R[3]*v[0]+R[4]*v[1]+R[5]*v[2], R[6]*v[0]+R[7]*v[1]+R[8]*v[2]];
const RTv = (R, v) => [R[0]*v[0]+R[3]*v[1]+R[6]*v[2], R[1]*v[0]+R[4]*v[1]+R[7]*v[2], R[2]*v[0]+R[5]*v[1]+R[8]*v[2]];
// body-axis state y -> 13-state, and f(y) = dy/dt
export function f9(ac, y, h, psi0) {
  const [u, v, w, p, q, r, ph, th, ps] = y, Q = e2q(ph, th, ps), R = q2R(Q), vn = Rv(R, [u, v, w]);
  const s = Float64Array.from([0, 0, -h, ...vn, ...Q, p, q, r]), o = new Float64Array(13);
  ac.deriv(s, o);
  const ab = RTv(R, [o[3], o[4], o[5]]);
  const t = Math.tan(th), c = Math.cos(th);
  return [ab[0] - (q*w - r*v), ab[1] - (r*u - p*w), ab[2] - (p*v - q*u), o[10], o[11], o[12],
    p + (q*Math.sin(ph) + r*Math.cos(ph))*t, q*Math.cos(ph) - r*Math.sin(ph), (q*Math.sin(ph) + r*Math.cos(ph))/c];
}
// level / climbing trim: unknowns alpha, de, thr  (wings level, gamma given)
export function trim(ac, { ias, h, flaps = 0, gear = 0, gammaDeg = 0 }) {
  ac.flaps = flaps; ac.gearPos = gear; ac.adot = 0;
  const rho = atmosphere(M.FIELD.elev + h, ac.isaDev).rho, V = ias*KT/Math.sqrt(rho/RHO0), g = gammaDeg*DEG;
  let x = [4*DEG, -2*DEG, 0.4];
  const res = (x) => { ac.de = x[1]; ac.thr = x[2]; const a = x[0]; const fy = f9(ac, [V*Math.cos(a), 0, V*Math.sin(a), 0, 0, 0, 0, a + g, 0], h); return [fy[0], fy[2], fy[4]]; };
  for (let it = 0; it < 30; it++) {
    const r0 = res(x), J = [[], [], []];
    for (let j = 0; j < 3; j++) { const xp = x.slice(); xp[j] += 1e-6; const r1 = res(xp); for (let i = 0; i < 3; i++) J[i][j] = (r1[i] - r0[i])/1e-6; }
    const dx = solve(J, r0.map(v => -v)); x = x.map((v, i) => v + dx[i]);
    if (Math.hypot(...dx) < 1e-12) break;
  }
  res(x);
  return { V, alpha: x[0], de: x[1], thr: x[2], y0: [V*Math.cos(x[0]), 0, V*Math.sin(x[0]), 0, 0, 0, 0, x[0] + g, 0], h, rho };
}
export function solve(A, b) { // Gaussian elimination with partial pivoting
  const n = b.length, M2 = A.map((r, i) => [...r, b[i]]);
  for (let k = 0; k < n; k++) { let p = k; for (let i = k+1; i < n; i++) if (Math.abs(M2[i][k]) > Math.abs(M2[p][k])) p = i;
    [M2[k], M2[p]] = [M2[p], M2[k]];
    for (let i = k+1; i < n; i++) { const f = M2[i][k]/M2[k][k]; for (let j = k; j <= n; j++) M2[i][j] -= f*M2[k][j]; } }
  const x = new Array(n).fill(0);
  for (let i = n-1; i >= 0; i--) { let s = M2[i][n]; for (let j = i+1; j < n; j++) s -= M2[i][j]*x[j]; x[i] = s/M2[i][i]; }
  return x;
}
export function linearise(ac, T, { adot = true } = {}) {
  const y0 = T.y0, n = 9, A = [...Array(n)].map(() => new Array(n).fill(0)), eps = [1e-3, 1e-3, 1e-3, 1e-5, 1e-5, 1e-5, 1e-5, 1e-5, 1e-5];
  for (let j = 0; j < n; j++) { const yp = y0.slice(), ym = y0.slice(); yp[j] += eps[j]; ym[j] -= eps[j];
    const fp = f9(ac, yp, T.h), fm = f9(ac, ym, T.h); for (let i = 0; i < n; i++) A[i][j] = (fp[i] - fm[i])/(2*eps[j]); }
  if (!adot) return A;
  ac.adot = 1e-4; const fp = f9(ac, y0, T.h); ac.adot = -1e-4; const fm = f9(ac, y0, T.h); ac.adot = 0;
  const B = fp.map((v, i) => (v - fm[i])/2e-4);                         // df/d(adot)
  const [u, , w] = y0, V2 = u*u + w*w, c = [-w/V2, 0, u/V2, 0, 0, 0, 0, 0, 0];   // adot = c . ydot
  const E = [...Array(n)].map((_, i) => [...Array(n)].map((_, j) => (i === j ? 1 : 0) - B[i]*c[j]));
  const Ae = [...Array(n)].map(() => new Array(n).fill(0));
  for (let j = 0; j < n; j++) { const col = solve(E, A.map(r => r[j])); for (let i = 0; i < n; i++) Ae[i][j] = col[i]; }
  return Ae;
}
export function eig4(A) { // characteristic polynomial (Faddeev-LeVerrier) + Durand-Kerner roots
  const n = A.length, I = (i, j) => (i === j ? 1 : 0); let Mk = A.map(r => r.map(() => 0)); const c = new Array(n + 1).fill(0); c[n] = 1;
  for (let k = 1; k <= n; k++) {
    const AM = A.map((r, i) => r.map((_, j) => r.reduce((s, a, l) => s + a*Mk[l][j], 0)));
    Mk = AM.map((r, i) => r.map((v, j) => v + c[n-k+1]*I(i, j)));
    const AMk = A.map((r, i) => r.reduce((s, a, l) => s + a*Mk[l][i], 0)); c[n-k] = -AMk.reduce((s, v) => s + v, 0)/k;
  }
  const P = (zr, zi) => { let pr = 1, pi = 0; for (let k = n-1; k >= 0; k--) { const t = pr*zr - pi*zi + c[k]; pi = pr*zi + pi*zr; pr = t; } return [pr, pi]; };
  let z = [...Array(n)].map((_, k) => [0.4*Math.cos(2.4*k + 0.3) + 0.1, 0.9*Math.sin(2.4*k + 0.3)]);
  for (let it = 0; it < 2000; it++) {
    let d = 0;
    z = z.map((zk, k) => { const [pr, pi] = P(...zk); let qr = 1, qi = 0;
      z.forEach((zj, j) => { if (j !== k) { const dr = zk[0]-zj[0], di = zk[1]-zj[1]; const t = qr*dr - qi*di; qi = qr*di + qi*dr; qr = t; } });
      const m = qr*qr + qi*qi, wr = (pr*qr + pi*qi)/m, wi = (pi*qr - pr*qi)/m; d = Math.max(d, Math.hypot(wr, wi)); return [zk[0]-wr, zk[1]-wi]; });
    if (d < 1e-13) break;
  }
  return z.map(([re, im]) => ({ re, im: Math.abs(im) < 1e-9 ? 0 : im }));
}
const sub = (A, idx) => idx.map(i => idx.map(j => A[i][j]));
export function modes(ac, T, opt) {
  const A = linearise(ac, T, opt);
  const lon = eig4(sub(A, [0, 2, 4, 7])), lat = eig4(sub(A, [1, 3, 5, 6]));
  let cpl = 0; for (const i of [0, 2, 4, 7]) for (const j of [1, 3, 5, 6]) cpl = Math.max(cpl, Math.abs(A[i][j]), Math.abs(A[j][i]));
  const osc = (l) => ({ re: l.re, im: Math.abs(l.im), wn: Math.hypot(l.re, l.im), zeta: -l.re/Math.hypot(l.re, l.im), T: 2*Math.PI/Math.abs(l.im), t2: Math.LN2/Math.abs(l.re), grows: l.re > 0 });
  const cplx = (L) => L.filter(l => l.im > 0).map(osc).sort((a, b) => b.wn - a.wn), real = (L) => L.filter(l => l.im === 0).sort((a, b) => a.re - b.re);
  const lc = cplx(lon), lr = real(lon), ac2 = cplx(lat), ar = real(lat);
  const out = { coupling: cpl, lonRoots: lon, latRoots: lat };
  if (lc.length === 2) { out.sp = lc[0]; out.ph = lc[1]; } else { out.sp = { real: lr.slice(0, 2).map(l => l.re) }; out.ph = lc[0]; }
  out.dr = ac2[0]; out.roll = { lam: ar[0].re, tau: -1/ar[0].re }; const sp = ar[ar.length-1].re;
  out.spiral = { lam: sp, t2: Math.LN2/Math.abs(sp), grows: sp > 0 };
  // n/alpha [g/rad] from the model's own lift slope at trim
  const d0 = {}, d1 = {}, a0 = T.alpha, V = T.V, h = T.h;
  const st = (a, d) => { const Q = e2q(0, a, 0), R = q2R(Q); const s = Float64Array.from([0, 0, -h, ...Rv(R, [V*Math.cos(a), 0, V*Math.sin(a)]), ...Q, 0, 0, 0]); d.wow = [0,0,0]; d.load = [0,0,0]; ac.deriv(s, new Float64Array(13), d); };
  st(a0 + 1e-4, d1); st(a0 - 1e-4, d0);
  const CLa = (d1.CL - d0.CL)/2e-4, qbar = 0.5*T.rho*V*V, nAlpha = qbar*AC.S*CLa/(AC.m*G0);
  out.CLa = CLa; out.nAlpha = nAlpha; if (out.sp.wn) out.CAP = out.sp.wn**2/nAlpha;
  return out;
}
// ---- run ----
if (process.argv[1] && process.argv[1].endsWith('v10_modes.mjs')) {
  const cases = [
    ['approach 95 kt IAS, flaps 1, gear down, 300 m AGL, gamma -3 deg (as setApproach)', { ias: 95, h: 300, flaps: 1, gear: 1, gammaDeg: -3 }],
    ['cruise 155 kt IAS, flaps 0, gear up, 3000 ft', { ias: 155, h: 3000*FT, flaps: 0, gear: 0, gammaDeg: 0 }],
  ];
  for (const [name, c] of cases) for (const adot of [true, false]) {
    const ac = new Aircraft(); const T = trim(ac, c); const m = modes(ac, T, { adot });
    const f = (v, n = 3) => (v === undefined ? '-' : (+v).toFixed(n));
    console.log(`\n== ${name}  [adot ${adot ? 'quasi-steady' : 'frozen'}]`);
    console.log(`trim: TAS ${f(T.V/KT,1)} kt alpha ${f(T.alpha*RAD,2)} deg de ${f(T.de*RAD,2)} deg thr ${f(T.thr,3)}  lon/lat coupling ${m.coupling.toExponential(1)}`);
    console.log(`short period: wn ${f(m.sp.wn)} rad/s zeta ${f(m.sp.zeta)} T ${f(m.sp.T,2)} s t1/2 ${f(m.sp.t2,2)} s  n/a ${f(m.nAlpha,2)} g/rad CAP ${f(m.CAP)} 1/(g s^2)`);
    console.log(`phugoid: wn ${f(m.ph.wn)} zeta ${f(m.ph.zeta)} T ${f(m.ph.T,1)} s t1/2 ${f(m.ph.t2,1)} s ${m.ph.grows ? '(diverging)' : ''}`);
    console.log(`dutch roll: wn ${f(m.dr.wn)} zeta ${f(m.dr.zeta)} zeta*wn ${f(m.dr.zeta*m.dr.wn)} T ${f(m.dr.T,2)} s t1/2 ${f(m.dr.t2,2)} s`);
    console.log(`roll mode: tauR ${f(m.roll.tau)} s;  spiral: lambda ${f(m.spiral.lam,4)} 1/s, ${m.spiral.grows ? 'time to double' : 'time to half'} ${f(m.spiral.t2,1)} s`);
  }
}
