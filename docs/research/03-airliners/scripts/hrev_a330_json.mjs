// hrev_a330_json.mjs — ผู้ตรวจอิสระ: แยกบล็อก ```json ของ 04-a330-300.md แล้วตรวจรูปแบบตาม schema-ext.md
// รัน: node hrev_a330_json.mjs [path-to-md]
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
const here = dirname(fileURLToPath(import.meta.url));
const md = readFileSync(process.argv[2] || join(here, '..', '04-a330-300.md'), 'utf8');
const blocks = [...md.matchAll(/```json\n([\s\S]*?)```/g)].map(m => m[1]);
const refs = new Set([...md.matchAll(/\*\*\[(H\d+)\]\*\*/g)].map(m => m[1]));
const xrefs = new Set([...md.matchAll(/\[([A-Z]\d+|R1:[A-Z]\d+)\]/g)].map(m => m[1]));
const KEYS = ['v', 'u', 'scope', 'src', 'conf', 'est', 'note'];
const OWN = ['airframe', 'aero', 'interference', 'speeds', 'performance', 'validation', 'gear', 'wind', '_na'];
const SCOPES = new Set(['aircraft', 'engine', 'propeller', 'gear', 'environment', 'sim']);
let leaves = 0, problems = [];
const isLeaf = o => o && typeof o === 'object' && !Array.isArray(o) && 'v' in o && 'u' in o && 'src' in o;
function walk(o, path) {
  if (isLeaf(o)) {
    leaves++;
    const k = Object.keys(o);
    if (k.length !== 7 || !KEYS.every(x => k.includes(x))) problems.push(`${path}: keys ${k.join(',')}`);
    if (!SCOPES.has(o.scope)) problems.push(`${path}: scope ${o.scope}`);
    if (!['สูง', 'กลาง', 'ต่ำ'].includes(o.conf)) problems.push(`${path}: conf ${o.conf}`);
    if (typeof o.est !== 'boolean') problems.push(`${path}: est not boolean`);
    if (!Array.isArray(o.src)) problems.push(`${path}: src not array`);
    else {
      if (o.src.length === 0 && !/\._na$|\._inherits$/.test(path)) problems.push(`${path}: empty src`);
      for (const s of o.src) if (/^H\d+$/.test(s) ? !refs.has(s) : !xrefs.has(s)) problems.push(`${path}: src ${s} not in reference list`);
    }
    if (o.est === true && o.conf === 'สูง') problems.push(`${path}: est true with conf สูง (check)`);
    return;
  }
  if (o && typeof o === 'object' && !Array.isArray(o)) for (const [k, v] of Object.entries(o)) walk(v, path + '.' + k);
  else problems.push(`${path}: non-leaf value`);
}
blocks.forEach((b, i) => {
  let j; try { j = JSON.parse(b); } catch (e) { problems.push(`block ${i + 1}: JSON parse error ${e.message}`); return; }
  const top = Object.keys(j); if (top.length !== 1 || top[0] !== 'a330_300') problems.push(`block ${i + 1}: top keys ${top}`);
  for (const k of Object.keys(j.a330_300)) {
    if (!OWN.includes(k)) problems.push(`block ${i + 1}: path ${k} not owned by topic 4`);
    if (k === 'airframe' && 'geometry' in j.a330_300.airframe) problems.push('airframe.geometry belongs to topic 5');
    if (k === 'gear') for (const g of Object.keys(j.a330_300.gear)) if (g === 'geometry') problems.push('gear.geometry belongs to topic 5');
    if (k === 'wind') for (const w of Object.keys(j.a330_300.wind)) if (w !== 'wake') problems.push(`wind.${w} not owned`);
  }
  walk(j.a330_300, 'a330_300');
  console.log(`block ${i + 1}: parsed OK, top-level ${top.join(',')}, sections ${Object.keys(j.a330_300).join(',')}`);
});
console.log('blocks', blocks.length, 'leaves', leaves);
console.log(problems.length ? 'PROBLEMS:\n' + problems.join('\n') : 'no problems');
