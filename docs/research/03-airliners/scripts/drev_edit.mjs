// drev_edit.mjs — reviewer helper: apply exact, unique string replacements to หัวข้อ 3.5 from a JSON file [[old,new],...]
import fs from 'node:fs';
const file = '05-airport-geometry.md';
const pairs = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
let s = fs.readFileSync(file, 'utf8');
for (const [o, n] of pairs) {
  const c = s.split(o).length - 1;
  if (c !== 1) { console.error('FAIL count', c, 'for:', o.slice(0, 80)); process.exit(1); }
}
for (const [o, n] of pairs) s = s.replace(o, () => n);
fs.writeFileSync(file, s); console.log('applied', pairs.length);
