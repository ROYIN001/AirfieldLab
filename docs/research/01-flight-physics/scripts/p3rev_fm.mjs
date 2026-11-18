// p3rev: T-P-01/T-P-03/T-P-05 checks on the JSON tables of section 3.12. Run: node p3rev_fm.mjs <md>
import fs from 'fs';
const md = fs.readFileSync(process.argv[2], 'utf8');
const t = JSON.parse(md.match(/```json\n([\s\S]*?)```/)[1]).propeller.tables;
const Js = t.CT.v.axes.J, Bs = t.CT.v.axes.beta75_deg, CT = t.CT.v.data, CP = t.CP.v.data;
const k = Math.sqrt(Math.PI / 2);
console.log('J=0 FM by beta:', Bs.map((b, j) => `${b}:${(CT[0][j] ** 1.5 / (k * CP[0][j])).toFixed(3)}`).join(' '));
let best = { e: 0 };
Js.forEach((J, i) => Bs.forEach((b, j) => { if (J > 0 && CT[i][j] > 0 && CP[i][j] > 0) { const e = J * CT[i][j] / CP[i][j]; if (e > best.e) best = { e, J, b }; } }));
console.log('grid max eta (CT,CP>0):', best);
const D = 2.44, A = Math.PI * D * D / 4, P = 700e3;
for (const [T, rho] of [[12360, 1.225], [11550, 1.1602], [11500, 1.225]]) console.log(`FM(T=${T}, rho=${rho}) = ${(T ** 1.5 / (P * Math.sqrt(2 * rho * A))).toFixed(3)}`);
