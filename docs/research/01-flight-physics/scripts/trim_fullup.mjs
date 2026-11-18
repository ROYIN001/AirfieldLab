// Static pitch equilibrium with full-up elevator (q = 0): current model vs proposed (with elevator effectiveness fade)
import { M } from 'test/harness.mjs';
import { P, coeffs, DEG, RAD } from './proto_aero.mjs';
const { Aircraft, AC } = M;
const ac = new Aircraft();
function CmCur(aDeg, f, de) { ac.flaps = f; ac.gearPos = 1; ac.de = de; ac.adot = 0; const a = aDeg * DEG, V = 40;
  ac.x.set([0, 0, -1000, V * Math.cos(a), 0, V * Math.sin(a), 1, 0, 0, 0, 0, 0, 0]); const o = new Float64Array(13), d = { wow: [0, 0, 0], load: [0, 0, 0] };
  ac.deriv(ac.x, o, d); return AC.Iyy * o[11] / (d.qbar * AC.S * AC.c); }
const deUp = -AC.deUp;
const Xt = (a, aStarT = 22 * DEG, at = 10, k = 0.35) => k + (1 - k) * 0.5 * (1 - Math.tanh(at * (a - aStarT)));
for (const f of [0, 1]) {
  let aCur = null; for (let a = 0; a < 60; a += 0.05) if (CmCur(a, f, deUp) < 0) { aCur = a; break; }
  let aNew = null, aNoFade = null;
  for (let a = 0; a < 60; a += 0.05) { const c = coeffs(a * DEG, f).Cm; if (aNoFade == null && c + AC.Cmde * deUp < 0) aNoFade = a; if (aNew == null && c + AC.Cmde * deUp * Xt(a * DEG) < 0) aNew = a; }
  console.log(`flaps ${f}: full-up (${(deUp * RAD).toFixed(0)} deg) static trim alpha: current ${aCur?.toFixed(1)} deg; proposed static w/o fade ${aNoFade?.toFixed(1)}; with elevator fade ${aNew?.toFixed(1)} deg`);
}
console.log('Cmde*deUp =', (AC.Cmde * deUp).toFixed(3), ' Xt(15,20,25,30,40):', [15, 20, 25, 30, 40].map(a => Xt(a * DEG).toFixed(2)).join(' '));
