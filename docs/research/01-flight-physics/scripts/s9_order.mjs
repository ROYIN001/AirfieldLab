// Observed order of accuracy of the CURRENT Aircraft.step (RK4 + per-step actuator/α̇/wind updates) with smooth inputs,
// and with the per-step pieces frozen (no actuator motion, α̇ filter disabled) to isolate RK4 truncation error.
import { M } from './s9_harness.mjs';
const { Aircraft, DEG, RAD } = M;
function run(dt, T, freeze) {
  const ac = new Aircraft(); const tr = ac.setApproach({ dist: 9000 }); const N = Math.round(T / dt);
  for (let i = 0; i < N; i++) { const t = ac.t;
    if (!freeze) { ac.cmd.de = tr.de - 2 * DEG * Math.sin(0.9 * t); ac.cmd.da = 4 * DEG * Math.sin(0.6 * t); ac.step(dt); }
    else { ac.de = tr.de - 0.5 * DEG; ac.da = 0.5 * DEG; ac.dr = 0; const ad = 0; ac.adot = ad;
      const x = ac.x, k = ac.k, tmp = ac.tmp; ac.deriv(x, k[0]); for (let j = 0; j < 13; j++) tmp[j] = x[j] + 0.5 * dt * k[0][j]; ac.deriv(tmp, k[1]);
      for (let j = 0; j < 13; j++) tmp[j] = x[j] + 0.5 * dt * k[1][j]; ac.deriv(tmp, k[2]); for (let j = 0; j < 13; j++) tmp[j] = x[j] + dt * k[2][j]; ac.deriv(tmp, k[3]);
      for (let j = 0; j < 13; j++) x[j] += (dt / 6) * (k[0][j] + 2 * k[1][j] + 2 * k[2][j] + k[3][j]); const qn = Math.hypot(x[6], x[7], x[8], x[9]); for (let j = 6; j < 10; j++) x[j] /= qn; ac.t += dt; }
  }
  return Array.from(ac.x);
}
for (const freeze of [false, true]) {
  const ref = run(1 / 8000, 10, freeze); let prev = null; const rows = [];
  for (const hz of [60, 120, 240, 480, 960]) { const x = run(1 / hz, 10, freeze); const e = Math.hypot(x[0] - ref[0], x[1] - ref[1], x[2] - ref[2]);
    rows.push({ hz, 'pos err after 10 s (m)': e.toExponential(2), 'ratio vs previous (2 = 1st order, 16 = 4th)': prev ? +(prev / e).toFixed(1) : '' }); prev = e; }
  console.log(freeze ? 'pure RK4 (controls fixed, α̇ = 0, no actuator/wind step updates)' : 'current Aircraft.step with smooth sinusoidal inputs'); console.table(rows);
}
