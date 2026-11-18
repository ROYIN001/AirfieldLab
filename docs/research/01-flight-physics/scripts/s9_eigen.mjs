// Linearise Aircraft.deriv (12-state: pos, vel NED, body rotation vector, body rates) and compute eigenvalues.
// Reports |λ|, |λ|·dt and the RK4 amplification |R(λdt)| for dt = 1/60, 1/120, 1/240.
import { M } from './s9_harness.mjs';
import { createRequire } from 'module';
const require = createRequire('docs/research/01-flight-physics/s9deps/');
const { Matrix, EigenvalueDecomposition } = require('ml-matrix');
const { Aircraft, AC, DEG, RAD, KT, G0 } = M;

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
function report(name, ac) {
  const J = jac12(ac, ac.x);
  const ev = eig(J).filter(l => Math.hypot(l.re, l.im) > 1e-3).sort((a, b) => Math.hypot(b.re, b.im) - Math.hypot(a.re, a.im));
  const seen = new Set(); const rows = [];
  for (const l of ev) { const key = l.re.toFixed(3) + '|' + Math.abs(l.im).toFixed(3); if (seen.has(key)) continue; seen.add(key);
    const mag = Math.hypot(l.re, l.im);
    rows.push({ re: +l.re.toFixed(3), im: +Math.abs(l.im).toFixed(3), mag: +mag.toFixed(3), wn_Hz: +(mag / 2 / Math.PI).toFixed(3), zeta: +(-l.re / mag).toFixed(3),
      'mag*dt240': +(mag / 240).toFixed(4), 'mag*dt60': +(mag / 60).toFixed(4), 'RK4|R|@240': +rk4amp(l.re / 240, l.im / 240).toFixed(6), 'RK4|R|@60': +rk4amp(l.re / 60, l.im / 60).toFixed(6), 'Euler|R|@240': +Math.hypot(1 + l.re/240, l.im/240).toFixed(6) }); }
  console.log('\n=== ' + name); console.table(rows);
  return rows;
}
const out = {};
// A: approach trim, 95 kt, flaps landing, gear down, ~290 m AGL
{ const ac = new Aircraft(); ac.setApproach({ dist: 5500 }); out.approach95 = report('A approach trim 95 kt flaps 1 gear down', ac); }
// B: clean, gear up, 200 kt descent at 3° (high dynamic pressure)
{ const ac = new Aircraft(); ac.setApproach({ dist: 9000, ias: 200, flaps: 0, gearDown: false }); out.clean200 = report('B clean 200 kt gear up', ac); }
// C: parked, settled 10 s at 2 kHz
{ const ac = new Aircraft(); ac.setParked(0, 0, 30 * DEG); for (let i = 0; i < 20000; i++) ac.step(1 / 2000);
  console.log('parked state: h', ac.air.h.toFixed(4), 'gs', ac.air.gs.toExponential(3), 'loads', ac.air.load.map(v => v.toFixed(0)).join('/'));
  out.parked = report('C parked, brakes on, settled', ac); }
// D: rolling 20 m/s, brakes off (rolling friction only) — tanh slopes small for longitudinal but side slope large
{ const ac = new Aircraft(); ac.setParked(0, 0, 30 * DEG); for (let i = 0; i < 20000; i++) ac.step(1 / 2000);
  ac.cmd.brake = 0; ac.brake = 0; const psi = 30 * DEG; ac.x[3] = 20 * Math.cos(psi); ac.x[4] = 20 * Math.sin(psi); ac.updateAir(0);
  out.roll20 = report('D rolling 20 m/s, no brake', ac); }
// E: main gear bottomed (penetration 0.30 m > stroke 0.25)
{ const ac = new Aircraft(); ac.setParked(0, 0, 30 * DEG); for (let i = 0; i < 20000; i++) ac.step(1 / 2000);
  ac.x[2] += 0.12; ac.updateAir(0); console.log('E loads', ac.air.load.map(v => v.toFixed(0)).join('/'));
  out.bottomed = report('E mains bottomed (pen ≈ 0.30 m)', ac); }
import fs from 'fs'; fs.writeFileSync('docs/research/01-flight-physics/scripts/s9_eigen_out.json', JSON.stringify(out, null, 1));
