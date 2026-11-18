import { M } from './s9_harness.mjs';
import { MB2 as MB } from './s9_bristle2_harness.mjs';
const lab = (dt) => `1/${Math.round(1 / dt)}`;
function parked(Mod, dt, T = 60, brake = 1, kick = false) {
  const ac = new Mod.Aircraft(); ac.setParked(0, 0, 30 * Mod.DEG); ac.cmd.brake = brake; ac.brake = brake;
  if (kick) { ac.x[10] = 0.05; ac.x[12] = 0.02; ac.x[4] += 0.05; }
  let blow = false, maxRate = 0; const N = Math.round(T / dt);
  for (let i = 0; i < N; i++) { ac.step(dt); if (!Number.isFinite(ac.air.h) || Math.abs(ac.air.p) > 50) { blow = true; break; } if (ac.t > T - 5) maxRate = Math.max(maxRate, Math.abs(ac.air.p), Math.abs(ac.air.r)); }
  return { dt: lab(dt), brake, blow, creep_m: blow ? null : +Math.hypot(ac.x[0], ac.x[1]).toFixed(5), gs_end: blow ? null : +ac.air.gs.toExponential(2), 'max rate last 5 s (deg/s)': +(maxRate * Mod.RAD).toExponential(2), 'thrust N': +ac.air.T.toFixed(0) };
}
console.log('Parked 60 s with idle thrust (≈517 N): current tanh friction vs bristle prototype (z0 = 5 mm, τ = 0.02 s)');
console.table([parked(M, 1 / 240), parked(MB, 1 / 240), parked(MB, 1 / 240, 60, 0)]);
console.log('Stability edge of the bristle prototype, parked + kick, 20 s');
console.table([1 / 240, 1 / 120, 1 / 90, 1 / 60, 1 / 45, 1 / 30].map((dt) => parked(MB, dt, 20, 1, true)));
// braked stop from 15 m/s: does it reach exactly zero and stay there? compare
function stop(Mod, dt) {
  const ac = new Mod.Aircraft(); ac.setParked(0, 0, 0); for (let i = 0; i < 2400; i++) ac.step(1 / 240);
  ac.x[3] = 15; ac.cmd.brake = 1; ac.brake = 1; ac.cmd.thr = 0; let tStop = null; const T = 15, N = Math.round(T / dt);
  for (let i = 0; i < N; i++) { ac.step(dt); if (tStop === null && ac.air.gs < 0.01) tStop = ac.t; }
  return { dt: lab(dt), model: Mod === M ? 'tanh (current)' : 'bristle', stopDist_m: +ac.x[0].toFixed(3), tStop_s: tStop && +tStop.toFixed(2), gs_after_15s: +ac.air.gs.toExponential(2) };
}
console.log('Braked stop from 15 m/s (μ_brake 0.572), 15 s');
console.table([stop(M, 1 / 240), stop(MB, 1 / 240), stop(MB, 1 / 2000)]);
// cost
const now = () => Number(process.hrtime.bigint()) / 1e3;
for (const [name, Mod] of [['tanh', M], ['bristle', MB]]) { const ac = new Mod.Aircraft(); ac.setParked(0, 0, 0); for (let i = 0; i < 20000; i++) ac.step(1 / 240); const t0 = now(); for (let i = 0; i < 100000; i++) ac.step(1 / 240); console.log(name, 'step µs (parked):', ((now() - t0) / 1e5).toFixed(2)); }
