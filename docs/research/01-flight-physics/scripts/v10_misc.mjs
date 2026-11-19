// v10_misc.mjs — expected values: setApproach residual, spiral 20 s prediction, analytic L/D max
import { M } from 'test/harness.mjs';
import { trim, modes, f9 } from './v10_modes.mjs';
const { Aircraft, AC, DEG, RAD, KT, FT } = M;
const ac = new Aircraft(); const tr = ac.setApproach({ dist: 5500 }); const d = new Float64Array(13); ac.deriv(ac.x, d);
console.log('setApproach residual acc NED', [d[3], d[4], d[5]].map(v => v.toExponential(2)).join(' '), 'angacc', [d[10], d[11], d[12]].map(v => v.toExponential(2)).join(' '), 'alpha', (tr.alpha*RAD).toFixed(2), 'theta', (tr.th*RAD).toFixed(2));
for (const [k, c] of [['approach', { ias: 95, h: 300, flaps: 1, gear: 1, gammaDeg: -3 }], ['cruise', { ias: 155, h: 3000*FT, flaps: 0, gear: 0, gammaDeg: 0 }]]) {
  const a2 = new Aircraft(), T = trim(a2, c), m = modes(a2, T); const r = f9(a2, T.y0, T.h);
  console.log(k, 'trim residual', Math.max(Math.abs(r[0]), Math.abs(r[2]), Math.abs(r[4])).toExponential(1), 'phi20 pred from 19.97 deg:', (19.97*Math.exp(m.spiral.lam*20)).toFixed(2), 'theta', ((T.alpha + c.gammaDeg*DEG)*RAD).toFixed(2));
}
const CLs = Math.sqrt(0.15**2 + AC.CD0/AC.K), CDs = AC.CD0 + AC.K*(CLs - 0.15)**2;
console.log('analytic clean L/D max', (CLs/CDs).toFixed(2), 'CL*', CLs.toFixed(3), 'e', (1/(Math.PI*AC.b**2/AC.S*AC.K)).toFixed(3));
