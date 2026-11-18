// krev_json.mjs — reviewer check of JSON blocks in 10-fctm-technique.md
import fs from 'node:fs';
const f = process.argv[2] || '10-fctm-technique.md';
const md = fs.readFileSync(f, 'utf8');
const re = /```json\n([\s\S]*?)```/g;
let m, i = 0, leaves = 0, errs = [];
const KEYS = ['v','u','scope','src','conf','est','note'];
const TYPES = ['atr72_600','b737_800','a320ceo','a320neo','a321ceo','a321neo','a330_300','common_airliner'];
const refs = new Set([...md.matchAll(/\*\*\[(K\d+)\]\*\*/g)].map(x=>x[1]));
function isLeaf(o){ return o && typeof o==='object' && !Array.isArray(o) && 'v' in o && 'conf' in o; }
function walk(o, path, top){
  if (isLeaf(o)) {
    leaves++;
    const k = Object.keys(o);
    if (k.length!==7 || !KEYS.every(x=>k.includes(x))) errs.push(`${path}: keys ${k}`);
    if (!['สูง','กลาง','ต่ำ'].includes(o.conf)) errs.push(`${path}: conf ${o.conf}`);
    if (typeof o.est!=='boolean') errs.push(`${path}: est ${o.est}`);
    if (!Array.isArray(o.src) || (o.src.length===0)) errs.push(`${path}: src empty`);
    for (const s of o.src||[]) if (/^K\d+$/.test(s) && !refs.has(s)) errs.push(`${path}: src ${s} not in refs`);
    if (!['aircraft','engine','propeller','gear','environment','sim'].includes(o.scope)) errs.push(`${path}: scope ${o.scope}`);
    if (top!=='common_airliner' && ['environment','sim'].includes(o.scope)) errs.push(`${path}: per-type leaf with shared scope ${o.scope}`);
    if (top==='common_airliner' && !['environment','sim'].includes(o.scope)) errs.push(`${path}: common leaf with scope ${o.scope}`);
    if (!path.split('.')[1]?.startsWith('ops')) errs.push(`${path}: not under ops`);
    return;
  }
  if (o && typeof o==='object' && !Array.isArray(o)) for (const [k,v] of Object.entries(o)) walk(v, path?path+'.'+k:k, top);
  else errs.push(`${path}: non-leaf value`);
}
while ((m = re.exec(md))) {
  i++;
  let j;
  try { j = JSON.parse(m[1]); } catch(e){ errs.push(`block ${i}: parse error ${e.message}`); continue; }
  const tk = Object.keys(j);
  if (tk.length!==1 || !TYPES.includes(tk[0])) errs.push(`block ${i}: top keys ${tk}`);
  const before = leaves;
  walk(j[tk[0]], tk[0], tk[0]);
  console.log(`block ${i} ${tk[0]}: ${leaves-before} leaves`);
}
console.log(`blocks ${i}, leaves ${leaves}`);
console.log(errs.length? errs.join('\n') : 'no errors');
