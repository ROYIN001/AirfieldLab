// rrev_atr72_json.mjs — ผู้ตรวจทาน: parse ทุกบล็อก ```json ของ หัวข้อ 3.1 ตรวจ leaf 7 ฟิลด์, conf, est, src, path ที่เป็นเจ้าของ, หน่วย SI
import { readFileSync } from 'node:fs';
const file = process.argv[2] || '01-atr72-600.md';
const md = readFileSync(file, 'utf8');
const blocks = [...md.matchAll(/```json\n([\s\S]*?)```/g)].map(m => m[1]);
const KEYS = ['v', 'u', 'scope', 'src', 'conf', 'est', 'note'];
const OWN = ['airframe', 'aero', 'interference', 'speeds', 'performance', 'validation', 'propulsion', 'turboprop', 'propeller', 'gear', 'wind', '_na'];
const SCOPES = ['aircraft', 'engine', 'propeller', 'gear', 'environment', 'sim'];
const refs = new Set([...md.matchAll(/\*\*\[(R\d+)\]\*\*/g)].map(m => m[1]));
let leaves = 0, errs = [], conf = { 'สูง': 0, 'กลาง': 0, 'ต่ำ': 0 }, est = 0, paths = new Set();
const isLeaf = o => o && typeof o === 'object' && !Array.isArray(o) && 'v' in o && 'conf' in o;
function walk(o, p) {
  if (isLeaf(o)) {
    leaves++; const k = Object.keys(o);
    if (k.length !== 7 || !KEYS.every(x => k.includes(x))) errs.push(`${p}: keys ${k.join(',')}`);
    if (!(o.conf in conf)) errs.push(`${p}: conf ${o.conf}`); else conf[o.conf]++;
    if (typeof o.est !== 'boolean') errs.push(`${p}: est not bool`); else if (o.est) est++;
    if (!Array.isArray(o.src)) errs.push(`${p}: src not array`);
    else { for (const s of o.src) if (!refs.has(s) && !/^[A-Z]\d+$|^R\d+:/.test(s)) errs.push(`${p}: src ${s} not in refs`); for (const s of o.src) if (/^R\d+$/.test(s) && !refs.has(s)) errs.push(`${p}: src ${s} missing`);
      if (o.src.length === 0 && !/\._na$|_inherits$/.test(p)) errs.push(`${p}: empty src`); }
    if (!SCOPES.includes(o.scope)) errs.push(`${p}: scope ${o.scope}`);
    if (o.est === false && /ค่าประมาณ|สมมติ/.test(o.note || '') && !/ไม่ใช่ค่าประมาณ/.test(o.note)) errs.push(`${p}: est false but note says estimate`);
    if (o.est === true && o.conf === 'สูง') errs.push(`(info) ${p}: est true with conf สูง`);
    if (paths.has(p)) errs.push(`${p}: duplicate path`); paths.add(p);
    return;
  }
  if (o && typeof o === 'object' && !Array.isArray(o)) for (const [k, v] of Object.entries(o)) walk(v, p ? `${p}.${k}` : k);
  else errs.push(`${p}: non-leaf scalar`);
}
blocks.forEach((b, i) => {
  let j; try { j = JSON.parse(b); } catch (e) { errs.push(`block ${i + 1}: JSON parse error ${e.message}`); return; }
  const top = Object.keys(j); if (top.length !== 1 || top[0] !== 'atr72_600') errs.push(`block ${i + 1}: top keys ${top}`);
  for (const k of Object.keys(j[top[0]])) if (!OWN.includes(k)) errs.push(`block ${i + 1}: category ${k} not owned`);
  if (j.atr72_600?.airframe?.geometry) errs.push('airframe.geometry not owned');
  if (j.atr72_600?.gear?.geometry) errs.push('gear.geometry not owned');
  walk(j, '');
});
console.log(JSON.stringify({ blocks: blocks.length, leaves, conf, est, errors: errs }, null, 1));
