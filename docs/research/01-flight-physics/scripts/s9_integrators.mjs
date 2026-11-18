// Accuracy vs cost of integrators on the CURRENT model (Aircraft.deriv unchanged): explicit Euler, semi-implicit Euler (velocity
// then position, quaternion by exp map), Heun RK2, RK4 (current). Open loop from approach trim, 3-2-1-1-style elevator and aileron
// doublets, calm air, 30 s. Reference: RK4 at 4 kHz. Also an asymmetric drop on the gear (3 m/s sink, 2° bank), 4 s.
import { M } from './s9_harness.mjs';
const { Aircraft, AC, DEG, RAD } = M;
const qmul = (a, b) => [a[0]*b[0]-a[1]*b[1]-a[2]*b[2]-a[3]*b[3], a[0]*b[1]+a[1]*b[0]+a[2]*b[3]-a[3]*b[2], a[0]*b[2]-a[1]*b[3]+a[2]*b[0]+a[3]*b[1], a[0]*b[3]+a[1]*b[2]-a[2]*b[1]+a[3]*b[0]];
const qexp = (v) => { const th = Math.hypot(...v); if (th < 1e-15) return [1, v[0]/2, v[1]/2, v[2]/2]; const s = Math.sin(th/2)/th; return [Math.cos(th/2), v[0]*s, v[1]*s, v[2]*s]; };
class AcX extends Aircraft {
  constructor(method) { super(); this.method = method; this.calls = 0; }
  stepX(dt) {
    const x = this.x, k = this.k, tmp = this.tmp;
    if (this.method === 'rk4') { this.step(dt); this.calls += 5; return; }   // current code path (wind + actuators inside)
    this.wind.update(dt, -x[2], this.air.V || 50, Math.atan2(x[4], x[3])); this.actuators(dt);
    const D = (s, o) => { this.calls++; this.deriv(s, o); };
    if (this.method === 'euler') { D(x, k[0]); for (let i = 0; i < 13; i++) x[i] += dt * k[0][i]; }
    if (this.method === 'heun') { D(x, k[0]); for (let i = 0; i < 13; i++) tmp[i] = x[i] + dt * k[0][i]; D(tmp, k[1]); for (let i = 0; i < 13; i++) x[i] += 0.5 * dt * (k[0][i] + k[1][i]); }
    if (this.method === 'sie') { // velocities first (translational + angular), then positions with the NEW velocities, attitude by exp map
      D(x, k[0]); for (const i of [3, 4, 5, 10, 11, 12]) x[i] += dt * k[0][i];
      x[0] += dt * x[3]; x[1] += dt * x[4]; x[2] += dt * x[5];
      const q = qmul([x[6], x[7], x[8], x[9]], qexp([x[10] * dt, x[11] * dt, x[12] * dt])); x[6] = q[0]; x[7] = q[1]; x[8] = q[2]; x[9] = q[3]; }
    const qn = Math.hypot(x[6], x[7], x[8], x[9]); for (let i = 6; i < 10; i++) x[i] /= qn;
    this.t += dt; this.updateAir(dt); this.calls++;
  }
}
function flight(method, dt, T = 30) {
  const ac = new AcX(method); const tr = ac.setApproach({ dist: 9000 }); const N = Math.round(T / dt);
  for (let i = 0; i < N; i++) { const t = ac.t;
    ac.cmd.de = tr.de + (t > 2 && t < 3 ? -3 * DEG : t >= 3 && t < 4 ? 3 * DEG : 0);
    ac.cmd.da = (t > 6 && t < 7.5 ? 6 * DEG : t >= 7.5 && t < 9 ? -6 * DEG : 0);
    ac.stepX(dt); if (!Number.isFinite(ac.x[0])) return null; }
  return ac;
}
function drop(method, dt, T = 4) {
  const ac = new AcX(method); const tr = ac.setApproach({ dist: 5500 }); const q = M.eulerToQ(2 * DEG, 5 * DEG, 0);
  ac.x.set([0, 0, -1.6, 45, 1.0, 3, q[0], q[1], q[2], q[3], 0, 0, 0]); ac.updateAir(0); ac.x[2] -= (0.3 - ac.air.hWheel); ac.updateAir(0);
  ac.thr = ac.cmd.thr = AC.idle; ac.de = ac.cmd.de = tr.de; const N = Math.round(T / dt);
  for (let i = 0; i < N; i++) { ac.stepX(dt); if (!Number.isFinite(ac.x[0]) || Math.abs(ac.x[10]) > 50) return null; } return ac;
}
const err = (a, r) => a ? { pos: Math.hypot(a.x[0] - r.x[0], a.x[1] - r.x[1], a.x[2] - r.x[2]), att: (() => { const e = qmul([a.x[6], -a.x[7], -a.x[8], -a.x[9]], [r.x[6], r.x[7], r.x[8], r.x[9]]); return 2 * Math.asin(Math.min(1, Math.hypot(e[1], e[2], e[3]))) * RAD; })() } : { pos: NaN, att: NaN };
const refF = flight('rk4', 1 / 4000), refD = drop('rk4', 1 / 4000);
const rows = [];
for (const method of ['euler', 'sie', 'heun', 'rk4']) for (const hz of [60, 120, 240, 480]) {
  const a = flight(method, 1 / hz), d = drop(method, 1 / hz); const ef = err(a, refF), ed = err(d, refD);
  rows.push({ method, hz, 'deriv calls/step': method === 'rk4' ? 5 : method === 'heun' ? 3 : 2, 'flight 30 s pos err (m)': ef.pos.toExponential(2), 'att err (deg)': ef.att.toExponential(2), 'drop 4 s pos err (m)': ed.pos.toExponential(2), 'drop att err (deg)': ed.att.toExponential(2) });
}
console.table(rows);
