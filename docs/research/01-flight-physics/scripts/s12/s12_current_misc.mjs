// s12_current_misc.mjs - current-model values for T-S-08 (trim vs full deflection, DIRECT law), T-S-09 (throttle lag), T-S-11 (cost per step)
import { M } from 'test/harness.mjs';
const { Flight, AC, RAD, DEG } = M;
const f = new Flight({ pilot: 'man', assist: false, autoThr: false });
const L = f.laws, ac = f.ac;
const res = {};
for (const trim of [0, -5 * DEG, +5 * DEG]) {
  L.trimDe = trim;
  const out = {};
  for (const y of [1, -1]) {
    const inp = { x: 0, y, rud: 0, thr: 0.3, brake: 0 };
    const c = L.update(1 / 240, inp, { assist: false, autoThr: false });
    // actuator clamp as in Aircraft.actuators()
    const deCl = Math.min(Math.max(c.de, -AC.deUp), AC.deDn);
    out[y > 0 ? 'fullPull_deg' : 'fullPush_deg'] = +(deCl * RAD).toFixed(2);
    L.trimDe = trim;     // update() may integrate auto-trim only when |y|<0.05; keep fixed
  }
  res['trim_' + (trim * RAD).toFixed(0)] = out;
}
// throttle lag: step 0.3 -> 1.0, value after 1.0 s
const ac2 = new M.Aircraft(); ac2.setApproach({ dist: 5500 }); ac2.thr = 0.3; ac2.cmd.thr = 1.0;
for (let i = 0; i < 240; i++) ac2.actuators(1 / 240);
res.throttle_after_1s = +ac2.thr.toFixed(4);
res.throttle_expected = +(0.3 + 0.7 * (1 - Math.exp(-1))).toFixed(4);
// cost per step (deriv x5 per step: 4 RK4 + updateAir)
const ac3 = new M.Aircraft(); ac3.setApproach({ dist: 9000 });
for (let i = 0; i < 2000; i++) ac3.step(1 / 240);
const N = 24000, t0 = performance.now(); for (let i = 0; i < N; i++) ac3.step(1 / 240);
res.us_per_step = +((performance.now() - t0) * 1000 / N).toFixed(2);
res.node = process.version;
console.log(JSON.stringify(res, null, 1));
