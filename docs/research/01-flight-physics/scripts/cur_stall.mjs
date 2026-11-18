// Current AirfieldLab model: fine CL(alpha) sweep, CLmax, 1-g stall speeds, stall-warning margin, post-stall drop
import { M } from 'test/harness.mjs';
const { Aircraft, AC, DEG, RAD, KT, G0 } = M;
const ac = new Aircraft();
function CLat(aDeg, f) {
  ac.flaps = f; ac.gearPos = 1; ac.de = 0; ac.adot = 0;
  const V = 40, a = aDeg * DEG;
  ac.x.set([0, 0, -1000, V * Math.cos(a), 0, V * Math.sin(a), 1, 0, 0, 0, 0, 0, 0]);
  const d = { wow: [0, 0, 0], load: [0, 0, 0] }; ac.deriv(ac.x, new Float64Array(13), d);
  return d;
}
const W = AC.m * G0, rho0 = 1.225;
const vs = (CL) => Math.sqrt(2 * W / (rho0 * AC.S * CL)) / KT;
for (const f of [0, 1]) {
  let best = { CL: -9, a: 0 };
  for (let a = 0; a <= 25; a += 0.05) { const d = CLat(a, f); if (d.CL > best.CL) best = { CL: d.CL, a }; }
  const aWarn = AC.aStall + AC.aStallFlap * f - 4;          // HUD 'STALL' callout / Evaluator threshold (alpha part)
  const dW = CLat(aWarn, f);
  // sigma>0.25 threshold alpha
  let aSig = null; for (let a = 0; a <= 25; a += 0.01) { if (CLat(a, f).sig > 0.25) { aSig = a; break; } }
  const post5 = CLat(best.a + 5, f).CL, post3 = CLat(best.a + 3, f).CL;
  console.log(`flaps ${f}: CLmax ${best.CL.toFixed(3)} at a=${best.a.toFixed(2)}°, Vs(1g, ISA SL, ${AC.m} kg) = ${vs(best.CL).toFixed(1)} kt`);
  console.log(`   warning alpha ${aWarn}° -> CL ${dW.CL.toFixed(3)} -> V ${vs(dW.CL).toFixed(1)} kt, margin ${(vs(dW.CL) - vs(best.CL)).toFixed(1)} kt; sigma>0.25 at a=${aSig?.toFixed(2)}° (V ${vs(CLat(aSig, f).CL).toFixed(1)} kt)`);
  console.log(`   CL drop: CLmax+3deg ${post3.toFixed(3)} (${(100 * (1 - post3 / best.CL)).toFixed(0)}%), CLmax+5deg ${post5.toFixed(3)} (${(100 * (1 - post5 / best.CL)).toFixed(0)}%)`);
}
console.log('Vref/Vs0 =', (AC.Vref / AC.Vs0).toFixed(3), ' 1.3*Vs0 =', (1.3 * AC.Vs0).toFixed(1), 'kt');
console.log('CL at Vref 88 kt (ISA SL):', (2 * W / (rho0 * AC.S * (88 * KT) ** 2)).toFixed(3), ' at Vapp 95:', (2 * W / (rho0 * AC.S * (95 * KT) ** 2)).toFixed(3));
console.log('CL needed for Vs0 = 71 kt:', (2 * W / (rho0 * AC.S * (71 * KT) ** 2)).toFixed(3));
console.log('wing loading', (W / AC.S).toFixed(1), 'Pa =', (W / AC.S / 47.880).toFixed(2), 'psf; AR', (AC.b ** 2 / AC.S).toFixed(2));
