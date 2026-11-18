import { P, coeffs, DEG, RAD, KT, G0, X0 } from './proto_aero.mjs';
const W = P.m * G0, rho0 = 1.225, vs = (CL) => Math.sqrt(2 * W / (rho0 * P.S * CL)) / KT;
for (const f of [0, 1]) {
  let best = { CL: -9 };
  for (let a = 0; a <= 30; a += 0.01) { const c = coeffs(a * DEG, f); if (c.CL > best.CL) best = { CL: c.CL, a }; }
  const pick = (a) => coeffs(a * DEG, f);
  // warning: alpha where X0 drops below 0.9 (buffet onset-like) and speed margin
  let aOn = null; for (let a = 0; a < 30; a += 0.01) { if (X0(a * DEG, P.cfg[f]) < 0.89) { aOn = a; break; } }
  console.log(`flaps ${f}: CLmax ${best.CL.toFixed(3)} at ${best.a.toFixed(2)} deg; Vs1g ${vs(best.CL).toFixed(1)} kt; X0=0.89 at a=${aOn.toFixed(2)} CL=${pick(aOn).CL.toFixed(3)} V=${vs(pick(aOn).CL).toFixed(1)} kt (margin ${(vs(pick(aOn).CL) - vs(best.CL)).toFixed(1)} kt)`);
  const p3 = pick(best.a + 3).CL, p5 = pick(best.a + 5).CL;
  console.log(`   drop +3deg ${(100 * (1 - p3 / best.CL)).toFixed(0)}%  +5deg ${(100 * (1 - p5 / best.CL)).toFixed(0)}%`);
  const rows = [];
  for (const a of [-180, -150, -120, -90, -60, -45, -30, -20, -15, -10, -5, 0, 5, 10, 12, 14, 16, 18, 20, 25, 30, 40, 45, 60, 90, 120, 150, 170, 179.9, -179.9]) {
    const c = pick(a); rows.push(`${String(a).padStart(6)} ${c.CL.toFixed(3).padStart(7)} ${c.CD.toFixed(3).padStart(6)} ${c.Cm.toFixed(3).padStart(7)} ${c.CN.toFixed(3).padStart(7)} X=${c.X.toFixed(3)}`);
  }
  console.log('     a      CL     CD      Cm      CN'); console.log(rows.join('\n'));
  // continuity check: max jump between 0.1deg neighbours over the circle
  let maxJ = { CL: 0, CD: 0, Cm: 0 };
  for (let a = -180; a < 180; a += 0.1) { const c1 = pick(a), c2 = pick(a + 0.1); for (const k of ['CL', 'CD', 'Cm']) maxJ[k] = Math.max(maxJ[k], Math.abs(c2[k] - c1[k])); }
  console.log('   max |dC| per 0.1deg over full circle:', JSON.stringify(Object.fromEntries(Object.entries(maxJ).map(([k, v]) => [k, +v.toFixed(4)]))));
  console.log('   jump at +-180:', ['CL', 'CD', 'Cm'].map(k => (pick(179.999)[k] - pick(-179.999)[k]).toExponential(2)).join(' '));
  // small-alpha derivatives check (should equal AC linear values)
  const d = (k, a) => (pick(a + 0.01)[k] - pick(a - 0.01)[k]) / (0.02 * DEG);
  console.log(`   dCL/da @2deg ${d('CL', 2).toFixed(3)}/rad, dCm/da @2deg ${d('Cm', 2).toFixed(3)}/rad`);
}
