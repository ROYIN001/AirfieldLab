// Stability boundaries of explicit methods for y' = λy: amplification R(z), z = λ dt
// Finds where |R(z)| = 1 on the negative real axis and on the imaginary axis.
const R = {
  euler: (z) => z.add(1),
};
class C { constructor(re, im = 0) { this.re = re; this.im = im; }
  add(o) { o = typeof o === 'number' ? new C(o) : o; return new C(this.re + o.re, this.im + o.im); }
  mul(o) { o = typeof o === 'number' ? new C(o) : o; return new C(this.re * o.re - this.im * o.im, this.re * o.im + this.im * o.re); }
  abs() { return Math.hypot(this.re, this.im); } }
const poly = (coef) => (z) => { let s = new C(0), p = new C(1); for (const c of coef) { s = s.add(p.mul(c)); p = p.mul(z); } return s; };
const methods = {
  'explicit Euler': poly([1, 1]),
  'RK2 (Heun/midpoint)': poly([1, 1, 1 / 2]),
  'RK3': poly([1, 1, 1 / 2, 1 / 6]),
  'RK4': poly([1, 1, 1 / 2, 1 / 6, 1 / 24]),
};
const bisect = (f, a, b) => { for (let i = 0; i < 200; i++) { const m = (a + b) / 2; if (f(a) * f(m) <= 0) b = m; else a = m; } return (a + b) / 2; };
const out = {};
for (const [k, Rz] of Object.entries(methods)) {
  // real axis: largest x>0 with |R(-x)| <= 1 for all smaller x (scan then bisect)
  let x = 1e-3; while (Rz(new C(-x)).abs() <= 1 && x < 10) x += 1e-3;
  const xr = bisect((s) => Rz(new C(-s)).abs() - 1, x - 1e-3, x);
  // imaginary axis: largest y with |R(iy)| <= 1 (0 for Euler and RK2: unstable for any y>0)
  let y = 1e-3; while (Rz(new C(0, y)).abs() <= 1 + 1e-12 && y < 10) y += 1e-3;
  const yi = y < 2e-3 ? 0 : bisect((s) => Rz(new C(0, s)).abs() - 1 - 1e-12, y - 1e-3, y);
  out[k] = { realAxis: +xr.toFixed(4), imagAxis: +yi.toFixed(4) };
}
// semi-implicit (symplectic) Euler on undamped oscillator x'' = -w^2 x: stable for w dt < 2; damped case
// leapfrog / velocity Verlet: same bound w dt < 2
out['semi-implicit Euler / Verlet (undamped oscillator)'] = { omegaDtMax: 2 };
console.log(JSON.stringify(out, null, 1));
// RK4 error per step on y'=λy: |R(z) - e^z| for representative z
for (const z of [-0.01, -0.06, -0.25, -1, -2]) { const r = methods.RK4(new C(z)).re; console.log('RK4 z', z, 'R', r.toFixed(8), 'exp', Math.exp(z).toFixed(8), 'rel err', ((r - Math.exp(z)) / Math.exp(z)).toExponential(2)); }
