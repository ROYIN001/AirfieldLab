// Section 11: extra DIRECT-mode step points for table 11.3.5 (same method as i11_current.mjs)
import { M } from 'test/harness.mjs';
import * as I from './i11_input.mjs';
const { Flight, AC, DEG, RAD, G0 } = M;
function step(y0, T = 3, hold = 2.5) {
  const fl = new Flight({ pilot: 'man', assist: false, autoThr: false }); fl.setPilot('ap'); fl.setPilot('man');
  let t = 0, nMax = 0, aMax = -9, warn = false; const dt = 1 / 60;
  while (t < T) { fl.input.y = t < hold ? y0 : 0; fl.input.x = 0; fl.input.rud = 0; fl.input.thr = fl.ac.thr; fl.input.brake = 0; fl.advance(dt); t += dt;
    const a = fl.ac.air, n = (a.qbar * AC.S * a.CL) / (AC.m * G0) * Math.cos(a.alpha); nMax = Math.max(nMax, n); aMax = Math.max(aMax, a.alpha * RAD);
    if (a.alpha > (AC.aStall + AC.aStallFlap * fl.ac.flaps - 4) * DEG || a.stall > 0.25) warn = true; }
  return { y0: +y0.toFixed(4), dn: +(nMax - 1).toFixed(3), aMax: +aMax.toFixed(2), warn };
}
const sh = (x) => I.shapeAxis(x, { dz: 0.08, expo: 0.5 });
console.log(JSON.stringify({ linear: [0.25, 0.28, 0.5].map((x) => step(x)), shaped: [0.1, 0.3, 0.45, 0.49].map((x) => ({ x, ...step(sh(x)) })) }));
