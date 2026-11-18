// Linearise Aircraft.deriv (12-state: pos, vel NED, body rotation vector, body rates) and compute eigenvalues.
// Reports |λ|, |λ|·dt and the RK4 amplification |R(λdt)| for dt = 1/60, 1/120, 1/240.
const M = { DEG: Math.PI/180 };
import { createRequire } from 'module';
const require = createRequire('docs/research/01-flight-physics/s9deps/');
const { Matrix, EigenvalueDecomposition } = require('ml-matrix');


const qmul = (a, b) => [a[0]*b[0]-a[1]*b[1]-a[2]*b[2]-a[3]*b[3], a[0]*b[1]+a[1]*b[0]+a[2]*b[3]-a[3]*b[2], a[0]*b[2]-a[1]*b[3]+a[2]*b[0]+a[3]*b[1], a[0]*b[3]+a[1]*b[2]-a[2]*b[1]+a[3]*b[0]];
const qexp = (v) => { const th = Math.hypot(...v); if (th < 1e-15) return [1, v[0]/2, v[1]/2, v[2]/2]; const s = Math.sin(th/2)/th; return [Math.cos(th/2), v[0]*s, v[1]*s, v[2]*s]; };

export function jac12(ac, x0) {
  const q0 = [x0[6], x0[7], x0[8], x0[9]];
  const to13 = (y) => { const dq = qmul(q0, qexp([y[6], y[7], y[8]])); return Float64Array.from([y[0], y[1], y[2], y[3], y[4], y[5], dq[0], dq[1], dq[2], dq[3], y[9], y[10], y[11]]); };
  const f = (y) => { const o = new Float64Array(13); ac.deriv(to13(y), o); return [o[0], o[1], o[2], o[3], o[4], o[5], y[9], y[10], y[11], o[10], o[11], o[12]]; };
  const y0 = [x0[0], x0[1], x0[2], x0[3], x0[4], x0[5], 0, 0, 0, x0[10], x0[11], x0[12]];
  const J = []; for (let i = 0; i < 12; i++) J.push(new Array(12).fill(0));
  const eps = [1e-4, 1e-4, 1e-5, 1e-4, 1e-4, 1e-5, 1e-6, 1e-6, 1e-6, 1e-5, 1e-5, 1e-5];
  for (let j = 0; j < 12; j++) {
    const yp = y0.slice(), ym = y0.slice(); yp[j] += eps[j]; ym[j] -= eps[j];
    const fp = f(yp), fm = f(ym);
    for (let i = 0; i < 12; i++) J[i][j] = (fp[i] - fm[i]) / (2 * eps[j]);
  }
  return J;
}
const rk4amp = (re, im) => { // |1+z+z²/2+z³/6+z⁴/24|
  let sr = 1, si = 0, pr = 1, pi = 0; const c = [1, 1/2, 1/6, 1/24];
  for (const k of c) { const nr = pr*re - pi*im, ni = pr*im + pi*re; pr = nr; pi = ni; sr += k*pr; si += k*pi; }
  return Math.hypot(sr, si);
};
export function eig(J) {
  const e = new EigenvalueDecomposition(new Matrix(J));
  return e.realEigenvalues.map((r, i) => ({ re: r, im: e.imaginaryEigenvalues[i] }));
}
