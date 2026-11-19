// Build the JSON tables for the section (J step 0.2) and check bilinear interpolation error against direct BEM.
import { bem } from './p3_bem.mjs';
import fs from 'fs';
const t = JSON.parse(fs.readFileSync(new URL('./p3_bem_table.json', import.meta.url)));
const pick = t.J.map((J, i) => [J, i]).filter(([J]) => Math.abs(J * 5 - Math.round(J * 5)) < 1e-9);
const J = pick.map(p => p[0]), CT = pick.map(p => t.CT[p[1]]), CP = pick.map(p => t.CP[p[1]]);
fs.writeFileSync(new URL('./p3_tables_step02.json', import.meta.url), JSON.stringify({ J, beta75: t.beta75, CT, CP }));
console.log(JSON.stringify({ J, beta75: t.beta75 }));
console.log('CT', JSON.stringify(CT)); console.log('CP', JSON.stringify(CP));
// bilinear on the 0.1-step table
function lut(T, Jq, bq) { const i = Math.min(Math.floor(Jq / 0.1), t.J.length - 2), k = Math.min(Math.floor((bq - 10) / 5), t.beta75.length - 2);
  const u = (Jq - t.J[i]) / 0.1, v = (bq - t.beta75[k]) / 5;
  return (1 - u) * ((1 - v) * T[i][k] + v * T[i][k + 1]) + u * ((1 - v) * T[i + 1][k] + v * T[i + 1][k + 1]); }
for (const [Jq, bq] of [[0.55, 27.5], [0.75, 22.5], [1.25, 32.5], [0.05, 12.5]]) {
  const s = bem(Jq, bq); const ct = lut(t.CT, Jq, bq), cp = lut(t.CP, Jq, bq);
  console.log(`J ${Jq} b ${bq}: BEM CT ${s.CT.toFixed(4)} CP ${s.CP.toFixed(4)} | table CT ${ct.toFixed(4)} (${((ct / s.CT - 1) * 100).toFixed(1)}%) CP ${cp.toFixed(4)} (${((cp / s.CP - 1) * 100).toFixed(1)}%)`);
}
