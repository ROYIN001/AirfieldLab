// Section 5: extra current-model numbers for the test table: thr at 1 s from idle, and 40%->100% step metrics (src/20-flight.js:248 lag)
import { M } from 'test/harness.mjs';
const { Aircraft, AC } = M; const dt = 1 / 240, out = {};
{ const ac = new Aircraft(); ac.thr = AC.idle; ac.cmd.thr = 1; for (let t = 0; t < 1 - 1e-9; t += dt) ac.actuators(dt); out.thr_at_1s_from_idle = +ac.thr.toFixed(3); }
{ const ac = new Aircraft(); ac.thr = 0.4; ac.cmd.thr = 1; let t = 0, h = {}, last = 0;
  while (t < 10) { ac.actuators(dt); t += dt; const fr = (ac.thr - 0.4) / 0.6;
    for (const [k, v] of [['t10', .1], ['t50', .5], ['t90', .9]]) if (h[k] == null && fr >= v) h[k] = t; if (Math.abs(fr - 1) > 0.02) last = t; }
  out.step40to100 = { delay: +h.t50.toFixed(2), rise: +(h.t90 - h.t10).toFixed(2), settle: +last.toFixed(2) }; }
console.log(JSON.stringify(out));
