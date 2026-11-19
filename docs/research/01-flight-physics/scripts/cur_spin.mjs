// Current model: attempted spin entry (DIRECT law): clean, gear up, idle, full aft stick + full rudder at the stall
import { M } from 'test/harness.mjs';
const { Flight, KT, FT, DEG, RAD } = M;
for (const rud of [1, 0]) {
  const f = new Flight({ pilot: 'man', assist: false, autoThr: false, dist: 40000 });
  f.ac.setApproach({ dist: 40000, ias: 85, flaps: 0, gearDown: false });
  f.laws.trimDe = f.ac.de; f.input.thr = 0.05;
  let t0 = null, maxA = 0, yawAcc = 0, lastPsi = f.ac.air.psi, log = [], next = 0, h0 = f.ac.air.h, maxP = 0, maxR = 0;
  while (f.ac.t < 25) {
    const a = f.ac.air;
    f.input.y = Math.min(1, f.ac.t / 6);          // progressive pull to full aft in 6 s
    f.input.rud = (a.alpha > 13 * DEG || t0 != null) ? rud : 0; f.input.x = 0;
    if (f.input.rud && t0 == null) t0 = f.ac.t;
    f.tick(f.dt);
    const b = f.ac.air; maxA = Math.max(maxA, b.alpha); maxP = Math.max(maxP, Math.abs(b.p)); maxR = Math.max(maxR, Math.abs(b.r));
    let d = M.wrapPi(b.psi - lastPsi); yawAcc += d; lastPsi = b.psi;
    if (f.ac.t >= next) { next += 2.5; log.push(`t${f.ac.t.toFixed(1)} ias${(b.ias / KT).toFixed(0)} a${(b.alpha * RAD).toFixed(1)} th${(b.theta * RAD).toFixed(0)} ph${(b.phi * RAD).toFixed(0)} p${(b.p * RAD).toFixed(0)} r${(b.r * RAD).toFixed(0)} vs${(b.vs / FT * 60).toFixed(0)} sig${b.stall.toFixed(2)}`); }
  }
  console.log(`rudder ${rud}: maxAlpha ${(maxA * RAD).toFixed(1)} maxP ${(maxP * RAD).toFixed(0)} maxR ${(maxR * RAD).toFixed(0)} deg/s heading change ${(yawAcc * RAD).toFixed(0)} deg in 25 s, alt loss ${(h0 - f.ac.air.h).toFixed(0)} m`);
  console.log(log.join('\n'));
}
