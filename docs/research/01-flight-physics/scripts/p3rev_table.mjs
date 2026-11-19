// p3rev: compare markdown table 3.5-ก (CT/CP/eta) with the JSON tables in 3.12. Run: node p3rev_table.mjs <md>
import fs from 'fs';
const md = fs.readFileSync(process.argv[2], 'utf8');
const j = JSON.parse(md.match(/```json\n([\s\S]*?)```/)[1]).propeller.tables;
const Js = j.CT.v.axes.J, Bs = j.CT.v.axes.beta75_deg;
const sec = md.split('**ตาราง 3.5-ก**')[1].split('**ตาราง 3.5-ข**')[0];
let bad = 0, n = 0;
for (const line of sec.split('\n')) {
  const m = line.match(/^\| (\d\.\d) \|(.*)\|$/); if (!m) continue;
  const J = +m[1], i = Js.findIndex(x => Math.abs(x - J) < 1e-9);
  m[2].split('|').forEach((cell, k) => {
    const [ct, cp, eta] = cell.trim().split('/').map(s => s.trim().replace('−', '-'));
    const CT = j.CT.v.data[i][k], CP = j.CP.v.data[i][k]; n++;
    const e = (J > 0 && CT > 0 && CP > 0) ? J * CT / CP : null;
    const okE = eta === '–' ? e === null : Math.abs(+eta - e) < 0.006;
    if (Math.abs(+ct - CT) > 0.0006 || Math.abs(+cp - CP) > 0.0006 || !okE) { bad++; console.log('MISMATCH', J, Bs[k], cell, CT, CP, e); }
  });
}
console.log(`checked ${n} cells, mismatches ${bad}`);
