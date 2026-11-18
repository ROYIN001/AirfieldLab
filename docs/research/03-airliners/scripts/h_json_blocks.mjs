// h_json_blocks.mjs — แบ่ง JSON ของ a330_300 (h_json_out.md) เป็นหลายบล็อก แต่ละบล็อกมีคีย์บนสุด a330_300 คีย์เดียว
// รัน: node h_json_blocks.mjs > h_json_blocks.md
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
const here = dirname(fileURLToPath(import.meta.url));
const A = JSON.parse(readFileSync(join(here, 'h_json_out.md'), 'utf8')).a330_300;
const groups = { 'airframe': ['_na', 'airframe'], 'aero': ['aero', 'interference'], 'speeds': ['speeds', 'performance'], 'validation': ['validation'], 'gear': ['gear', 'wind'] };
const isLeaf = o => o && typeof o === 'object' && 'v' in o && 'conf' in o;
for (const [name, keys] of Object.entries(groups)) {
  const lines = ['{', ' "a330_300": {'];
  const emit = (o, ind) => { const ks = Object.keys(o); ks.forEach((k, i) => { const v = o[k], comma = i < ks.length - 1 ? ',' : ''; if (isLeaf(v)) lines.push(`${' '.repeat(ind)}"${k}": ${JSON.stringify(v)}${comma}`); else { lines.push(`${' '.repeat(ind)}"${k}": {`); emit(v, ind + 1); lines.push(`${' '.repeat(ind)}}${comma}`); } }); };
  const sub = Object.fromEntries(keys.map(k => [k, A[k]]));
  emit(sub, 2); lines.push(' }', '}');
  const txt = lines.join('\n'); JSON.parse(txt);
  console.log(`<<<BLOCK ${name}>>>`); console.log(txt);
}
