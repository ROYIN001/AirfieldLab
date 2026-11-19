// Small linear-algebra helpers for the validation suite: numerical Jacobians, characteristic
// polynomials (Faddeev–LeVerrier) and polynomial roots (Durand–Kerner), mode identification.
export function charPoly(A) {
  // returns c[0..n] with det(sI - A) = s^n + c[1] s^(n-1) + ... + c[n]
  const n = A.length; let M = A.map((r) => r.map(() => 0)); const c = [1];
  for (let k = 1; k <= n; k++) {
    // M_k = A M_{k-1} + c_{k-1} I ; c_k = -tr(A M_k)/k
    const AM = A.map((r, i) => r.map((_, j) => r.reduce((s, a, l) => s + a * M[l][j], 0)));
    M = AM.map((r, i) => r.map((v, j) => v + (i === j ? c[k - 1] : 0)));
    const AMk = A.map((r, i) => r.map((_, j) => r.reduce((s, a, l) => s + a * M[l][j], 0)));
    let tr = 0; for (let i = 0; i < n; i++) tr += AMk[i][i];
    c.push(-tr / k);
  }
  return c;
}
const cmul = (a, b) => [a[0] * b[0] - a[1] * b[1], a[0] * b[1] + a[1] * b[0]];
const cdiv = (a, b) => { const d = b[0] * b[0] + b[1] * b[1]; return [(a[0] * b[0] + a[1] * b[1]) / d, (a[1] * b[0] - a[0] * b[1]) / d]; };
export function roots(c) {
  // Durand–Kerner on the monic polynomial c (c[0] = 1)
  const n = c.length - 1; let z = Array.from({ length: n }, (_, k) => { const r = Math.pow(Math.abs(c[n]) || 1, 1 / n) || 1; const a = 2 * Math.PI * k / n + 0.4; return [r * Math.cos(a), r * Math.sin(a)]; });
  const ev = (x) => { let p = [1, 0]; for (let i = 1; i <= n; i++) p = [p[0] * x[0] - p[1] * x[1] + c[i], p[0] * x[1] + p[1] * x[0]]; return p; };
  for (let it = 0; it < 2000; it++) {
    let moved = 0;
    z = z.map((zi, i) => { let den = [1, 0]; z.forEach((zj, j) => { if (j !== i) den = cmul(den, [zi[0] - zj[0], zi[1] - zj[1]]); }); const d = cdiv(ev(zi), den); moved = Math.max(moved, Math.hypot(d[0], d[1])); return [zi[0] - d[0], zi[1] - d[1]]; });
    if (moved < 1e-13) break;
  }
  return z.map(([re, im]) => [re, Math.abs(im) < 1e-9 ? 0 : im]);
}
export function modeInfo(r) {
  const [re, im] = r, wn = Math.hypot(re, im);
  return im !== 0 ? { re, im, wn, zeta: -re / wn, period: 2 * Math.PI / Math.abs(im) } : { re, im: 0, tau: -1 / re, t2: re > 0 ? Math.log(2) / re : Infinity, thalf: re < 0 ? Math.log(2) / -re : Infinity };
}

// Linearise the 6-DOF model about the aircraft's current (trimmed, wings-level) state.
// Body states: u v w p q r φ θ. Returns the longitudinal (u w q θ) and lateral (v p r φ) modes.
export function linearModes(M, ac) {
  const { eulerToQ, qToR, mulR, mulRT, qToEuler } = M;
  const x0 = Array.from(ac.x), R0 = qToR(x0.slice(6, 10), new Array(9));
  const w0 = ac.wind.mean(-x0[2]);
  const vb0 = mulRT(R0, [x0[3] - w0[0], x0[4] - w0[1], x0[5] - w0[2]]);
  const [phi0, th0, psi0] = qToEuler(x0.slice(6, 10));
  const s0 = [...vb0, 0, 0, 0, phi0, th0];
  const f = (s) => {
    const q = eulerToQ(s[6], s[7], psi0), R = qToR(q, new Array(9)), vn = mulR(R, [s[0], s[1], s[2]]);
    const X = new Float64Array(13); X.set([x0[0], x0[1], x0[2], vn[0] + w0[0], vn[1] + w0[1], vn[2] + w0[2], ...q, s[3], s[4], s[5]]);
    const d = new Float64Array(13); ac.deriv(X, d);
    const ab = mulRT(R, [d[3], d[4], d[5]]), w = [s[3], s[4], s[5]], v = [s[0], s[1], s[2]];
    const wxv = [w[1] * v[2] - w[2] * v[1], w[2] * v[0] - w[0] * v[2], w[0] * v[1] - w[1] * v[0]];
    const ph = s[6], th = s[7];
    return [ab[0] - wxv[0], ab[1] - wxv[1], ab[2] - wxv[2], d[10], d[11], d[12], s[3] + (s[4] * Math.sin(ph) + s[5] * Math.cos(ph)) * Math.tan(th), s[4] * Math.cos(ph) - s[5] * Math.sin(ph)];
  };
  const J = Array.from({ length: 8 }, () => new Array(8).fill(0));
  for (let j = 0; j < 8; j++) {
    const h = j < 3 ? 0.01 : 1e-4, sp = s0.slice(), sm = s0.slice(); sp[j] += h; sm[j] -= h;
    const a = f(sp), b = f(sm); for (let i = 0; i < 8; i++) J[i][j] = (a[i] - b[i]) / (2 * h);
  }
  const sub = (idx) => idx.map((i) => idx.map((j) => J[i][j]));
  const lon = roots(charPoly(sub([0, 2, 4, 7]))).map(modeInfo), lat = roots(charPoly(sub([1, 3, 5, 6]))).map(modeInfo);
  const osc = lon.filter((m) => m.im > 0).sort((a, b) => b.wn - a.wn), lr = lon.filter((m) => m.im === 0).sort((a, b) => Math.abs(b.re) - Math.abs(a.re));
  // short period: the faster oscillatory pair (or a pair of fast real roots when overdamped); phugoid: the slow pair.
  // A pair of real roots is reported with the ω and ζ of the quadratic they make: ζ ≥ 1 when both decay; a root
  // that grows gives ζ < 0 (both growing: ζ ≤ −1; one growing: ζ = −1), so a divergence fails every damping check.
  const pair = (r1, r2) => {
    const p = r1 * r2, s = -(r1 + r2), wn = Math.sqrt(Math.abs(p));
    return { wn, zeta: p > 0 ? s / (2 * wn) : -1, reals: [r1, r2], overdamped: true };
  };
  let sp, ph;
  if (osc.length === 2) { sp = osc[0]; ph = osc[1]; }
  else if (osc.length === 1) {
    if (osc[0].wn > 1) { sp = osc[0]; ph = pair(lr[0].re, lr[1].re); } else { ph = osc[0]; sp = pair(lr[0].re, lr[1].re); }
  } else { sp = pair(lr[0].re, lr[1].re); ph = pair(lr[2].re, lr[3].re); }
  const dr = lat.find((m) => m.im > 0), reals = lat.filter((m) => m.im === 0).sort((a, b) => a.re - b.re);
  const roll = reals[0], spiral = reals[reals.length - 1];
  return { sp, ph, dr, roll, spiral, lon, lat };
}
