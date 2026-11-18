// Review: T-G-15 expectation. Planar 3-DOF taxi model with the proposed laws: castering nose wheel (no side force),
// left main full brake F_b,max = 0.6 W_st = 5745 N (dry, no lock since mu N = 7660 N), right main rolling mu_r 0.02,
// main side force -mu N tanh(C' alpha / mu) with C' = 3.2 /rad, friction circle, speed held at 3 m/s by thrust (<= 11.5 kN).
import { M } from 'test/harness.mjs';
const g = 9.80665, m = M.AC.m, Izz = M.AC.Izz ?? M.AC.I?.[2];
const Wst = m * g * 2.30 / 2.65 / 2, Nn = m * g * 0.35 / 2.65, mu = 0.8, Cp = 3.2, mur = 0.02, Fb = 0.6 * Wst;
const W = [{ x: 2.30, y: 0, N: Nn, caster: true }, { x: -0.35, y: -1.55, N: Wst, brake: Fb }, { x: -0.35, y: 1.55, N: Wst, brake: 0 }];
function run(Uset, holdSpeed) {
  let u = Uset, v = 0, r = 0, T = 0, out = null; const dt = 1e-3;
  for (let t = 0; t < 8; t += dt) {
    let Fx = 0, Fy = 0, Mz = 0;
    for (const w of W) {
      const vl = u - r * w.y, vs = v + r * w.x;
      let fx = -(w.caster ? mur * w.N : Math.max(w.brake, mur * w.N)) * Math.tanh(vl / 0.05);
      let fy = 0;
      if (!w.caster) { const al = Math.atan2(vs, Math.abs(vl) + 0.05); const lim = Math.sqrt(Math.max(0, (mu * w.N) ** 2 - fx * fx)); fy = Math.max(-lim, Math.min(lim, -mu * w.N * Math.tanh(Cp * al / mu))); }
      Fx += fx; Fy += fy; Mz += w.x * fy - w.y * fx;
    }
    T = holdSpeed ? Math.min(11500, Math.max(0, -Fx + 20000 * (Uset - u))) : 0.045 * 11500;
    const ud = (Fx + T) / m + r * v, vd = Fy / m - r * u, rd = Mz / Izz;
    u += ud * dt; v += vd * dt; r += rd * dt;
    if (t > 7.9 && !out) { const V = Math.hypot(u, v); out = { hold: holdSpeed, Izz, u: +u.toFixed(2), yawRate_degps: +(-r * 180 / Math.PI).toFixed(1), R_cg_m: +(V / Math.abs(r)).toFixed(2), thrust_N: Math.round(T) }; }
    if (!holdSpeed && u < 0.05) { out = { hold: false, stoppedAt_s: +t.toFixed(2), heading_change_deg: null }; break; }
  }
  return out;
}
console.log(JSON.stringify(run(3, true)));
// idle thrust only: peak yaw rate and heading change before stopping
{
  let u = 3, v = 0, r = 0, psi = 0, rmax = 0; const dt = 1e-3; let t = 0;
  for (; t < 8 && u > 0.05; t += dt) {
    let Fx = 0, Fy = 0, Mz = 0;
    for (const w of W) { const vl = u - r * w.y, vs = v + r * w.x; const fx = -(w.caster ? mur * w.N : Math.max(w.brake, mur * w.N)) * Math.tanh(vl / 0.05); let fy = 0;
      if (!w.caster) { const al = Math.atan2(vs, Math.abs(vl) + 0.05); const lim = Math.sqrt(Math.max(0, (mu * w.N) ** 2 - fx * fx)); fy = Math.max(-lim, Math.min(lim, -mu * w.N * Math.tanh(Cp * al / mu))); }
      Fx += fx; Fy += fy; Mz += w.x * fy - w.y * fx; }
    const T = 0.045 * 11500; u += ((Fx + T) / m + r * v) * dt; v += (Fy / m - r * u) * dt; r += Mz / Izz * dt; psi += r * dt; rmax = Math.max(rmax, -r);
  }
  console.log(JSON.stringify({ hold: false, stop_s: +t.toFixed(2), peakYawRate_degps: +(rmax * 180 / Math.PI).toFixed(1), headingChange_deg: +(-psi * 180 / Math.PI).toFixed(1) }));
}
