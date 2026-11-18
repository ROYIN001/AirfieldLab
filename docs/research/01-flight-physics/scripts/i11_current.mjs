// Section 11: current-model measurements for keyboard / stick sensitivity (DIRECT and ASSIST laws)
import { M } from 'test/harness.mjs';
import * as I from './i11_input.mjs';
const { Flight, AC, KT, DEG, RAD, G0 } = M;
const r3 = (v) => Math.round(v * 1000) / 1000;
// replicate 90-app.js:359-363 ramp: ramp = v + clamp(tgt - v, -r dt, r dt); pitch up 2.0, back 5
function run({ assist, holdT, rates, stepY = null, T = 4, dist = 5500 }) {
  const fl = new Flight({ pilot: 'man', assist, autoThr: false, dist });
  fl.setPilot('ap'); fl.setPilot('man');
  const dt = 1 / 60; let y = 0, t = 0;
  const base = { th: fl.ac.air.theta, alpha: fl.ac.air.alpha };
  let nMax = 0, aMax = -1, warn = false, nMin = 9;
  while (t < T) {
    if (stepY != null) y = t < holdT ? stepY : 0;
    else y = I.keyRamp(y, t < holdT ? 1 : 0, dt, rates);
    fl.input.y = y; fl.input.x = 0; fl.input.rud = 0; fl.input.thr = fl.ac.thr; fl.input.brake = 0;
    fl.advance(dt); t += dt;
    const a = fl.ac.air, n = (a.qbar * AC.S * a.CL) / (AC.m * G0) * Math.cos(a.alpha);
    nMax = Math.max(nMax, n); nMin = Math.min(nMin, n); aMax = Math.max(aMax, a.alpha * RAD);
    if (a.alpha > (AC.aStall + AC.aStallFlap * fl.ac.flaps - 4) * DEG || a.stall > 0.25) warn = true;
  }
  return { holdT, dn_max: r3(nMax - 1), alpha_max: r3(aMax), alpha0: r3(base.alpha * RAD), warn };
}
const out = {};
const cur = { up: 2.0, back: 5, cap: 1 }, prop = { up: 0.5, back: 2.5, cap: 1 };
out.direct_current_ramp = [1 / 60, 0.05, 0.1, 0.15, 0.2, 0.3].map((h) => run({ assist: false, holdT: h, rates: cur }));
out.direct_proposed_ramp = [1 / 60, 0.1, 0.2, 0.3, 0.5, 0.8].map((h) => run({ assist: false, holdT: h, rates: prop }));
// stick held (gamepad, linear today) for 2.5 s at fixed deflection
out.direct_step_linear = [0.05, 0.1, 0.2, 0.3].map((s) => ({ stick: s, ...run({ assist: false, holdT: 2.5, rates: cur, stepY: s, T: 3 }) }));
out.direct_step_shaped = [0.25, 0.5, 0.6].map((s) => ({ stick: s, shaped: r3(I.shapeAxis(s, { dz: 0.08, expo: 0.5 })), ...run({ assist: false, holdT: 2.5, rates: cur, stepY: I.shapeAxis(s, { dz: 0.08, expo: 0.5 }), T: 3 }) }));
// ASSIST: keyboard -> pitch-rate command 7 deg/s * y (20-flight.js:437)
out.assist_current_ramp = [0.1, 0.3, 0.6].map((h) => run({ assist: true, holdT: h, rates: cur }));
// ASSIST inner dead zone jump (20-flight.js:432): |x| > 0.04 -> phiCmd = x * 33 deg
out.assist_bank_jump_deg = r3(0.0401 * 33);
console.log(JSON.stringify(out, null, 1));
