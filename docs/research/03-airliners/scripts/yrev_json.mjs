// yrev_json.mjs — reviewer check of ```json blocks in 07-flight-controls.md against schema-ext.md
import { readFileSync } from 'node:fs';
const md = readFileSync('07-flight-controls.md', 'utf8');
const refs = new Set([...md.matchAll(/\*\*\[(Y\d+)\]\*\*/g)].map(m => m[1]));
const types = new Set(['atr72_600','b737_800','a320ceo','a320neo','a321ceo','a321neo','a330_300','common_airliner']);
const KEYS = ['v','u','scope','src','conf','est','note'];
const blocks = [...md.matchAll(/```json\n([\s\S]*?)```/g)].map(m => m[1]);
let leaves = 0, problems = [], paths = [];
function walk(o, path) {
  if (o && typeof o === 'object' && !Array.isArray(o) && 'v' in o) {
    leaves++; paths.push(path.join('.'));
    const k = Object.keys(o); if (k.length !== 7 || !KEYS.every(x => k.includes(x))) problems.push(`${path.join('.')}: keys ${k}`);
    if (!['สูง','กลาง','ต่ำ'].includes(o.conf)) problems.push(`${path.join('.')}: conf ${o.conf}`);
    if (typeof o.est !== 'boolean') problems.push(`${path.join('.')}: est not boolean`);
    if (!Array.isArray(o.src) || o.src.length === 0) problems.push(`${path.join('.')}: empty src`);
    for (const s of o.src || []) if (!refs.has(s) && !/^R1:/.test(s)) problems.push(`${path.join('.')}: src ${s} not in reference list`);
    if (!['aircraft','engine','propeller','gear','environment','sim'].includes(o.scope)) problems.push(`${path.join('.')}: scope ${o.scope}`);
    if (o.conf === 'สูง' && o.est === true) problems.push(`${path.join('.')}: conf สูง with est true`);
    return;
  }
  if (o && typeof o === 'object' && !Array.isArray(o)) for (const [k, v] of Object.entries(o)) walk(v, [...path, k]);
  else problems.push(`${path.join('.')}: non-leaf value`);
}
blocks.forEach((b, i) => {
  let j; try { j = JSON.parse(b); } catch (e) { problems.push(`block ${i}: parse error ${e.message}`); return; }
  const top = Object.keys(j); if (top.length !== 1 || !types.has(top[0])) problems.push(`block ${i}: top keys ${top}`);
  const t = top[0]; const sub = Object.keys(j[t]);
  if (sub.length !== 1 || sub[0] !== 'controls') problems.push(`block ${i}: second-level keys ${sub}`);
  if (j[t].controls && 'fbw' in j[t].controls) problems.push(`block ${i}: writes controls.fbw (owned by topic 8)`);
  walk(j[t], [t]);
});
console.log(JSON.stringify({ blocks: blocks.length, leaves, refs: [...refs].length, problems }, null, 1));
if (process.argv[2] === '--paths') console.log(paths.join('\n'));
