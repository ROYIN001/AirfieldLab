// Convert TCDS blade angles measured at other stations to the 0.75R reference using this section's twist law (estimate).
import { twist } from './p3_bem.mjs';
const RAD = 180 / Math.PI;
const cases = [
  ['Hartzell HC-B3MN3 (C208, A37CE) 42 in of R=50 in', 42 / 50, { low: 9, feather: 78.4, reverse: -18 }],
  ['McCauley 3GFR34C703 (C208, A37CE) 30 in of R=53 in', 30 / 53, { low: 15.6, feather: 88, reverse: -14 }],
];
for (const [nm, x, a] of cases) { const d = twist(x) * RAD; const o = {}; for (const k in a) o[k] = +(a[k] - d).toFixed(1); console.log(nm, `x=${x.toFixed(3)} twist(x)-twist(0.75)=${d.toFixed(2)} deg ->`, JSON.stringify(o)); }
