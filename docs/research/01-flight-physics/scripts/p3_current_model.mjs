// Measures what the current AirfieldLab model does with propeller effects (read-only use of the repo).
import { M } from 'test/harness.mjs';
const { Aircraft, AC, KT, DEG, RAD, FIELD, atmosphere } = M;
const ac = new Aircraft();
ac.isaDev = 31 - (15 - 0.0065 * FIELD.elev);
const trim = ac.setApproach({ dist: 5500 });
const x0 = Float64Array.from(ac.x);
function accel(thr, p = 0, q = 0, r = 0, V = null) {
  ac.x.set(x0); ac.x[10] = p; ac.x[11] = q; ac.x[12] = r; ac.thr = thr;
  const out = new Float64Array(13), d = { wow: [0, 0, 0], load: [0, 0, 0] };
  ac.deriv(ac.x, out, d);
  return { pdot: out[10], qdot: out[11], rdot: out[12], T: d.T, V: d.V, alpha: d.alpha * RAD, rho: d.rho };
}
const a0 = accel(AC.idle), a1 = accel(1.0);
console.log('trim at Vapp:', JSON.stringify({ alpha: (trim.alpha * RAD).toFixed(2), thr: trim.thr.toFixed(3), de: (trim.de * RAD).toFixed(2) }));
console.log(`thr idle: T=${a0.T.toFixed(0)} N  pdot=${a0.pdot.toExponential(3)} rdot=${a0.rdot.toExponential(3)} qdot=${a0.qdot.toExponential(3)}`);
console.log(`thr 1.0 : T=${a1.T.toFixed(0)} N  pdot=${a1.pdot.toExponential(3)} rdot=${a1.rdot.toExponential(3)} qdot=${a1.qdot.toExponential(3)}`);
console.log(`=> change of angular acceleration from idle to full thrust: dp=${(a1.pdot - a0.pdot).toExponential(2)} dq=${(a1.qdot - a0.qdot).toExponential(2)} dr=${(a1.rdot - a0.rdot).toExponential(2)} rad/s2 (0 = no torque, P-factor, thrust-line moment)`);
// gyroscopic: pitch rate 10 deg/s at full thrust vs idle -> yaw accel difference
const g0 = accel(AC.idle, 0, 10 * DEG, 0), g1 = accel(1.0, 0, 10 * DEG, 0);
console.log(`pitch rate 10 deg/s: rdot(full)-rdot(idle)=${(g1.rdot - g0.rdot).toExponential(2)} rad/s2 (expected with gyro H=2199: N/Izz≈${(2199 * 10 * DEG / AC.Izz).toFixed(4)})`);
// density dependence of thrust
console.log(`thrust at full throttle is independent of rho: rho=${a1.rho.toFixed(3)} T=${a1.T.toFixed(0)}; formula thrustAvail(V) has no rho term (src/20-flight.js:144)`);
