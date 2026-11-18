// Prototype B: displacement between t = 10 s and 60 s while parked with brakes and idle thrust; residual speed envelope.
import { MB2 } from './s9_bristle2_harness.mjs';
const ac = new MB2.Aircraft(); ac.setParked(0, 0, 30 * MB2.DEG); let p10 = null, vmax = 0;
for (let i = 1; i <= 240 * 60; i++) { ac.step(1 / 240); if (i === 2400) p10 = [ac.x[0], ac.x[1]]; if (i > 2400) vmax = Math.max(vmax, ac.air.gs); }
console.log('B: displacement 10→60 s (m):', Math.hypot(ac.x[0] - p10[0], ac.x[1] - p10[1]).toExponential(2), ' max gs after 10 s (m/s):', vmax.toExponential(2), ' total from origin:', Math.hypot(ac.x[0], ac.x[1]).toFixed(4));
