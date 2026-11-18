// Step 6 — ground handling: speed-limited nose-wheel steering, tyre side force, differential braking,
// braking on dry / wet / standing water, wheel lock and skid, hydroplaning.
import { M, onRunway, run, DT } from './lib/sim.mjs';
import { check, within, f1, done } from './lib/check.mjs';
const { AC, KT, DEG, RAD, FIELD, nwsMax, surfaceMu, wetMu, clamp } = M;

// rolling down the runway centre line at V (m/s), idle, brakes off
function rolling(V, { surface = 'dry', flaps = 0 } = {}) {
  const ac = onRunway(300, { surface, flaps });
  const psi = FIELD.rwyHdg * DEG;
  ac.x[3] = V * Math.cos(psi); ac.x[4] = V * Math.sin(psi);
  ac.cmd.brake = 0; ac.brake = ac.brakeL = ac.brakeR = 0; ac.cmd.thr = 0;
  run(ac, 0.5);
  return ac;
}
// steering authority
check('nose-wheel steering at taxi speed', within(nwsMax(3) * RAD, 18, 22), `${f1(nwsMax(3) * RAD)}°`);
check('nose-wheel steering limited at speed', within(nwsMax(25) * RAD, 5, 9), `${f1(nwsMax(25) * RAD)}° at ${f1(25 / KT, 0)} kt`);
// taxi turn with full right pedal at 8 kt (power held to keep the speed)
{
  const ac = rolling(8 * KT);
  run(ac, 6, (a) => { a.cmd.dr = -AC.drMax; a.cmd.thr = clamp(0.12 + 0.05 * (8 - a.air.gs / KT), 0, 0.4); });
  const R = ac.air.gs / Math.max(Math.abs(ac.air.r), 1e-6);
  check('taxi turn, full right pedal at 8 kt: tight turn to the right', ac.air.r > 0 && within(R, 6, 16), `radius ${f1(R)} m, steer ${f1(ac.steer * RAD)}°`);
}
// differential braking turns the aircraft
{
  const ac = rolling(5);
  run(ac, 2, (a) => { a.cmd.brakeL = 0.6; a.cmd.dr = 0; });
  check('left toe brake yaws left', ac.air.r < -2 * DEG, `r ${f1(ac.air.r * RAD)}°/s`);
}
// tyre side force vs slip angle (Pacejka-style curve): peak between 8° and 14°
{
  let best = 0, at = 0;
  for (let a = 0; a <= 30; a += 0.5) { const v = Math.sin(AC.tyreC * Math.atan(AC.tyreB * a * DEG)); if (v > best) { best = v; at = a; } }
  check('tyre side force peaks at 8–14° slip angle', within(at, 8, 14), `${at}°`);
}
// friction model
check('wet runway μ (14 CFR 25.109) at 100 kt, 90 psi', within(wetMu(100), 0.25, 0.32), f1(wetMu(100), 3));
check('dry μ at 100 kt', within(surfaceMu('dry', 100).pk, 0.65, 0.8), f1(surfaceMu('dry', 100).pk, 2));
check('standing water: hydroplaning above 9√p ≈ 85 kt', surfaceMu('flooded', 88).pk < 0.12 && surfaceMu('flooded', 60).pk > 0.3, `μ ${f1(surfaceMu('flooded', 88).pk, 3)} at 88 kt, ${f1(surfaceMu('flooded', 60).pk, 3)} at 60 kt`);
// stopping from 60 kt with the best braking that does not lock a wheel (a pilot feeling the pedals)
function stop(surface, kt = 60) {
  const ac = rolling(kt * KT, { surface });
  const s0 = ac.air.s; let t = 0;
  while (ac.air.gs > 0.5 && t < 120) {
    const a = ac.air;
    const grip = Math.min(a.mu[1] * a.load[1], a.mu[2] * a.load[2]) / AC.brakeF;
    ac.cmd.brake = Math.min(1, 0.9 * grip); ac.cmd.dr = clamp(1.4 * M.wrapPi(a.psi - FIELD.rwyHdg * DEG) + 0.6 * a.r, -AC.drMax, AC.drMax);
    ac.step(DT); t += DT;
  }
  return { d: ac.air.s - s0, t, skids: ac.skids, lat: Math.abs(ac.air.t) };
}
const sd = stop('dry'), sw = stop('wet');
check('stopping from 60 kt, dry, max braking without a skid', within(sd.d, 70, 160) && sd.skids === 0, `${f1(sd.d, 0)} m in ${f1(sd.t)} s`);
check('wet runway needs a longer stop', within(sw.d / sd.d, 1.15, 2.6) && sw.skids === 0, `${f1(sw.d, 0)} m (×${f1(sw.d / sd.d, 2)})`);
const w85 = stop('wet', 85), f85 = stop('flooded', 85);
check('standing water from 85 kt: hydroplaning lengthens the stop', f85.d > w85.d * 1.05, `${f1(f85.d, 0)} m vs ${f1(w85.d, 0)} m wet`);
// stamping on the brakes at speed on a wet runway locks the wheels
{
  const ac = rolling(70 * KT, { surface: 'wet' });
  let locked = false; run(ac, 3, (a) => { a.cmd.brake = 1; if (a.lock[1] || a.lock[2]) locked = true; });
  check('full brakes at 70 kt on a wet runway lock the wheels', locked && ac.skids > 0, `skids ${ac.skids}`);
  // a locked wheel slides: release and the wheel spins up again
  run(ac, 1, (a) => { a.cmd.brake = 0; });
  check('releasing the brake frees the wheel', !ac.lock[1] && !ac.lock[2]);
}
// rolling resistance: idle-power coast-down on dry vs flooded
{
  const a = rolling(30 * KT), b = rolling(30 * KT, { surface: 'flooded' });
  run(a, 5); run(b, 5);
  check('standing water adds drag on the roll', b.air.gs < a.air.gs, `${f1(a.air.gs / KT)} vs ${f1(b.air.gs / KT)} kt after 5 s`);
}
// full brakes hold the aircraft still at flight idle (static friction), and a full-power run-up against them
{
  const ac = onRunway(300); const p0 = [ac.x[0], ac.x[1]], h0 = ac.air.psi;
  run(ac, 60, (a) => { a.cmd.thr = 0; a.cmd.brake = 1; });
  const moved = Math.hypot(ac.x[0] - p0[0], ac.x[1] - p0[1]), yaw = Math.abs(M.wrapPi(ac.air.psi - h0)) * RAD;
  check('parked, full brakes, flight idle, 60 s: stays put', moved < 0.02 && yaw < 0.1, `${f1(moved * 100, 2)} cm, ${f1(yaw, 3)}°`);
  // the brakes hold a 50 % run-up; at full power the prop wash unloads the main wheels and they slide (as on many
  // turboprops, whose run-ups are done at partial power)
  const b = onRunway(300); const q0 = [b.x[0], b.x[1]];
  run(b, 6, (a) => { a.cmd.thr = 0.5; a.cmd.brake = 1; });
  check('50 % power run-up against the brakes: no creep', Math.hypot(b.x[0] - q0[0], b.x[1] - q0[1]) < 0.1, `${f1(Math.hypot(b.x[0] - q0[0], b.x[1] - q0[1]) * 100, 1)} cm`);
}
// brakes held against power for a long time, then released: no phantom lock when the aircraft rolls
{
  const ac = onRunway(300);
  run(ac, 20, (a) => { a.cmd.thr = 0.3; a.cmd.brake = 1; });
  run(ac, 10, (a) => { a.cmd.thr = 0.6; a.cmd.brake = 0; a.cmd.dr = clamp(1.4 * M.wrapPi(a.air.psi - FIELD.rwyHdg * DEG) + 0.6 * a.air.r, -AC.drMax, AC.drMax); });
  check('brakes held then released: rolls away without a skid', ac.skids === 0 && ac.air.gs > 5, `skids ${ac.skids}, ${f1(ac.air.gs / KT)} kt`);
}
// standing still with the engine running: lift and load factor are steady (no step-to-step flutter)
{
  const ac = onRunway(300); let lo = 9, hi = -9, flips = 0, prev = null;
  run(ac, 2, (a) => { a.cmd.thr = 0.4; a.cmd.brake = 1; const n = a.air.nz; if (n != null) { lo = Math.min(lo, n); hi = Math.max(hi, n); if (prev != null && Math.abs(n - prev) > 0.01) flips++; prev = n; } });
  check('engine running at a standstill: steady load factor', hi - lo < 0.01 && flips === 0, `nz ${f1(lo, 4)}…${f1(hi, 4)}, jumps ${flips}`);
}
done();
