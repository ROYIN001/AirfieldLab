// Section 7: current-model taxi turn radius with full pedal, and crosswind side-load check. Run: node g7_steer.mjs
import { M } from 'test/harness.mjs';
const { Flight, SCENARIOS, DEG, RAD, AC } = M;
function turn(V, rud = 1) {
  const f = new Flight({ wind: SCENARIOS.calm, pilot: 'man', assist: false, autoThr: false });
  const ac = f.ac; ac.setParked(0, 0, 0); for (let i = 0; i < 240 * 3; i++) ac.step(1 / 240);
  ac.x[3] = V; ac.brake = ac.cmd.brake = 0; f.input = { x: 0, y: 0, rud, thr: 0, brake: 0 };
  // hold speed with throttle P-control
  let rs = [], vs = [];
  for (let i = 0; i < 240 * 20; i++) {
    const gs = Math.hypot(ac.x[3], ac.x[4]); f.input.thr = Math.min(1, Math.max(0, 0.05 + 0.5 * (V - gs)));
    f.tick(1 / 240);
    if (i > 240 * 12) { rs.push(ac.x[12]); vs.push(Math.hypot(ac.x[3], ac.x[4])); }
  }
  const r = rs.reduce((a, b) => a + b) / rs.length, v = vs.reduce((a, b) => a + b) / vs.length;
  return { V: v, r: r * RAD, R: v / Math.abs(r), steer: ac.steer * RAD };
}
for (const V of [2.5, 5, 10]) { const t = turn(V); console.log(`CURRENT full pedal @ ${t.V.toFixed(2)} m/s: steer ${t.steer.toFixed(1)} deg, yaw rate ${t.r.toFixed(1)} deg/s, radius ${t.R.toFixed(1)} m (kinematic wb/tan(steer) = ${(2.65 / Math.tan(Math.abs(t.steer) * DEG)).toFixed(1)} m)`); }
// brake energy into the brakes, dry stop from 80 kt (point model numbers)
const KT = 0.514444, m = AC.m; const KE = 0.5 * m * (80 * KT) ** 2;
console.log(`KE at 80 kt: ${(KE / 1e6).toFixed(2)} MJ`);
