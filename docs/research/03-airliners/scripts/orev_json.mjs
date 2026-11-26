// orev_json.mjs — independent reviewer: parse every ```json block of a topic file and check schema-ext rules.
import fs from 'fs';
const file = process.argv[2], letter = process.argv[3] || 'O';
const txt = fs.readFileSync(file, 'utf8');
const refs = new Set([...txt.matchAll(/\*\*\[([A-Z]\d+)\]\*\*/g)].map(m => m[1]));
const blocks = [...txt.matchAll(/```json\n([\s\S]*?)```/g)].map(m => m[1]);
const KEYS = ['v', 'u', 'scope', 'src', 'conf', 'est', 'note'];
let leaves = 0, errs = [];
const isLeaf = (o) => o && typeof o === 'object' && !Array.isArray(o) && 'v' in o && 'src' in o;
function walk(o, path) {
  if (isLeaf(o)) {
    leaves++;
    const k = Object.keys(o);
    if (k.length !== 7 || !KEYS.every(x => k.includes(x))) errs.push(`${path}: keys ${k}`);
    if (!Array.isArray(o.src) || !o.src.length) errs.push(`${path}: empty src`);
    else for (const s of o.src) if (!refs.has(s) && !/^[A-Z]\d+$/.test(s)) errs.push(`${path}: bad src ${s}`); else if (s.startsWith(letter) && !refs.has(s)) errs.push(`${path}: src ${s} not in reference list`);
    if (!['สูง', 'กลาง', 'ต่ำ'].includes(o.conf)) errs.push(`${path}: conf ${o.conf}`);
    if (typeof o.est !== 'boolean') errs.push(`${path}: est ${o.est}`);
    if (!['aircraft', 'engine', 'propeller', 'gear', 'environment', 'sim'].includes(o.scope)) errs.push(`${path}: scope ${o.scope}`);
    return;
  }
  if (!o || typeof o !== 'object') { errs.push(`${path}: non-leaf value ${JSON.stringify(o)}`); return; }
  for (const [k, v] of Object.entries(o)) walk(v, path + '.' + k);
}
blocks.forEach((b, i) => {
  let j; try { j = JSON.parse(b); } catch (e) { errs.push(`block ${i}: PARSE ERROR ${e.message}`); return; }
  const top = Object.keys(j);
  if (top.length !== 1) errs.push(`block ${i}: top keys ${top}`);
  for (const t of top) {
    const sub = Object.keys(j[t]);
    if (sub.length !== 1 || sub[0] !== 'afcs') errs.push(`block ${i} ${t}: owns only afcs, found ${sub}`);
    walk(j[t], t);
  }
  console.log(`block ${i}: ${top.join(',')} ok-parse`);
});
console.log(`leaves ${leaves}; refs ${refs.size}; errors ${errs.length}`); errs.forEach(e => console.log(' - ' + e));
