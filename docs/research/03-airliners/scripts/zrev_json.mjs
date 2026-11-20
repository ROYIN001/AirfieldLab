// zrev_json.mjs — reviewer check of ```json blocks in 08-fbw-laws.md (2026-11-18)
import fs from 'node:fs';
const file = process.argv[2] || '08-fbw-laws.md';
const md = fs.readFileSync(file, 'utf8');
const refs = new Set([...md.matchAll(/\*\*\[(Z\d+)\]\*\*/g)].map(m => m[1]));
const blocks = [...md.matchAll(/```json\n([\s\S]*?)```/g)].map(m => m[1]);
const LEAF = ['v','u','scope','src','conf','est','note'];
const TYPES = ['atr72_600','b737_800','a320ceo','a320neo','a321ceo','a321neo','a330_300','common_airliner'];
let leaves = 0, errs = [];
const isLeaf = o => o && typeof o === 'object' && !Array.isArray(o) && 'v' in o && 'conf' in o;
function walk(o, path, top) {
  if (isLeaf(o)) {
    leaves++;
    const k = Object.keys(o);
    if (k.length !== 7 || !LEAF.every(x => k.includes(x))) errs.push(`${path}: keys ${k}`);
    if (!['สูง','กลาง','ต่ำ'].includes(o.conf)) errs.push(`${path}: conf ${o.conf}`);
    if (typeof o.est !== 'boolean') errs.push(`${path}: est`);
    if (!['aircraft','engine','propeller','gear','environment','sim'].includes(o.scope)) errs.push(`${path}: scope ${o.scope}`);
    if (!Array.isArray(o.src) || !o.src.length) errs.push(`${path}: src empty`);
    else for (const s of o.src) if (!refs.has(s)) errs.push(`${path}: src ${s} not in reference list`);
    if (typeof o.u !== 'string' || typeof o.note !== 'string') errs.push(`${path}: u/note type`);
    if (o.est && o.conf === 'สูง') errs.push(`${path}: est true but conf สูง`);
    const owned = top === 'common_airliner' ? false : path.startsWith(`${top}.controls.fbw.`);
    if (!owned) errs.push(`${path}: path not owned by topic 8 (schema-ext §4: Airbus controls.fbw)`);
    return;
  }
  if (o && typeof o === 'object' && !Array.isArray(o)) for (const [k, v] of Object.entries(o)) walk(v, path ? `${path}.${k}` : k, top);
  else errs.push(`${path}: non-leaf scalar`);
}
blocks.forEach((b, i) => {
  let j; try { j = JSON.parse(b); } catch (e) { errs.push(`block ${i}: JSON.parse ${e.message}`); return; }
  const tk = Object.keys(j);
  if (tk.length !== 1 || !TYPES.includes(tk[0])) errs.push(`block ${i}: top keys ${tk}`);
  const before = leaves; walk(j[tk[0]], tk[0], tk[0]);
  console.log(`block ${i} ${tk[0]}: ${leaves - before} leaf`);
});
console.log(`blocks ${blocks.length}, leaves ${leaves}, refs ${refs.size}`);
console.log(errs.length ? errs.join('\n') : 'no errors');
