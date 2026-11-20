// jrev_json.mjs — reviewer: parse every ```json block of หัวข้อ 3.6, check leaf shape, owned paths, est/conf, src ids
import fs from 'node:fs';
const f = process.argv[2] || '06-jet-engines.md';
const md = fs.readFileSync(f, 'utf8');
const refs = new Set([...md.matchAll(/\*\*\[(J\d+)\]\*\*/g)].map(m => m[1]));
const blocks = [...md.matchAll(/```json\n([\s\S]*?)```/g)].map(m => m[1]);
const KEYS = ['v','u','scope','src','conf','est','note'];
let leaves = 0, problems = [];
const isLeaf = o => o && typeof o === 'object' && !Array.isArray(o) && 'v' in o && 'u' in o;
function walk(o, path) {
  if (isLeaf(o)) {
    leaves++;
    const k = Object.keys(o);
    if (k.length !== 7 || !KEYS.every(x => k.includes(x))) problems.push(`${path}: keys ${k}`);
    if (!['สูง','กลาง','ต่ำ'].includes(o.conf)) problems.push(`${path}: conf ${o.conf}`);
    if (typeof o.est !== 'boolean') problems.push(`${path}: est ${o.est}`);
    if (!['aircraft','engine','propeller','gear','environment','sim'].includes(o.scope)) problems.push(`${path}: scope ${o.scope}`);
    if (!Array.isArray(o.src) || (o.src.length === 0 && !/(_na|_inherits)$/.test(path))) problems.push(`${path}: src empty`);
    for (const s of o.src || []) if (!refs.has(s) && !/:/.test(s)) problems.push(`${path}: src ${s} not in ref list`);
    return;
  }
  if (o && typeof o === 'object') for (const [k, v] of Object.entries(o)) walk(v, path ? path + '.' + k : k);
  else problems.push(`${path}: non-leaf scalar ${o}`);
}
blocks.forEach((b, i) => {
  let j; try { j = JSON.parse(b); } catch (e) { problems.push(`block ${i}: PARSE ${e.message}`); return; }
  const top = Object.keys(j);
  if (top.length !== 1) problems.push(`block ${i}: top keys ${top}`);
  const t = top[0];
  for (const cat of Object.keys(j[t])) if (!['turbofan','propulsion'].includes(cat)) problems.push(`block ${i} ${t}: path ${cat} not owned by topic 6`);
  walk(j[t], t);
});
console.log(`blocks ${blocks.length}, leaves ${leaves}, refs ${refs.size}`);
console.log(problems.length ? problems.join('\n') : 'no problems');
