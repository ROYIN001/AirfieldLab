// Reviewer: parse every ```json block of หัวข้อ 3.3 and check leaf shape + owned paths
import fs from 'fs';
const f = process.argv[2] || '03-a320-a321.md';
const t = fs.readFileSync(f, 'utf8');
const re = /```json\n([\s\S]*?)```/g;
let m, i = 0, bad = 0;
const KEYS = ['v','u','scope','src','conf','est','note'];
const TYPES = ['a320ceo','a320neo','a321ceo','a321neo'];
const OWN = ['airframe','aero','interference','speeds','performance','validation','gear','wind','_na','_inherits'];
const issues = [];
function walk(o, p) {
  if (o && typeof o === 'object' && !Array.isArray(o) && 'v' in o && 'u' in o) {
    const ks = Object.keys(o);
    const extra = ks.filter(k => !KEYS.includes(k)), miss = KEYS.filter(k => !ks.includes(k));
    if (extra.length || miss.length) issues.push(`${p}: keys extra=${extra} miss=${miss}`);
    if (!['สูง','กลาง','ต่ำ'].includes(o.conf)) issues.push(`${p}: conf ${o.conf}`);
    if (typeof o.est !== 'boolean') issues.push(`${p}: est ${o.est}`);
    if (!Array.isArray(o.src)) issues.push(`${p}: src not array`);
    else if (o.src.length === 0 && !p.endsWith('_na') && !p.endsWith('_inherits')) issues.push(`${p}: empty src`);
    if (!['aircraft','engine','propeller','gear','environment','sim'].includes(o.scope)) issues.push(`${p}: scope ${o.scope}`);
    return [p];
  }
  if (o && typeof o === 'object' && !Array.isArray(o)) {
    let out = [];
    for (const k of Object.keys(o)) out = out.concat(walk(o[k], p ? p + '.' + k : k));
    return out;
  }
  issues.push(`${p}: non-leaf value ${JSON.stringify(o).slice(0,60)}`);
  return [];
}
const all = {};
while ((m = re.exec(t))) {
  i++;
  const line = t.slice(0, m.index).split('\n').length;
  let j;
  try { j = JSON.parse(m[1]); } catch (e) { bad++; console.log(`block ${i} (line ${line}) PARSE ERROR ${e.message}`); continue; }
  const top = Object.keys(j);
  if (top.length !== 1 || !TYPES.includes(top[0])) issues.push(`block ${i}: top keys ${top}`);
  for (const k of Object.keys(j[top[0]])) if (!OWN.includes(k)) issues.push(`block ${i}: not owned ${top[0]}.${k}`);
  if (j[top[0]].airframe && j[top[0]].airframe.geometry) issues.push(`block ${i}: airframe.geometry not owned`);
  if (j[top[0]].gear && j[top[0]].gear.geometry) issues.push(`block ${i}: gear.geometry not owned`);
  const leaves = walk(j, '');
  for (const l of leaves) { if (all[l]) issues.push(`duplicate path ${l}`); all[l] = 1; }
  console.log(`block ${i} (line ${line}) OK top=${top} leaves=${leaves.length}`);
}
console.log('blocks', i, 'parse errors', bad);
console.log(issues.length ? issues.join('\n') : 'no shape issues');
