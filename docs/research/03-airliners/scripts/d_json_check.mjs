// Validate the ```json blocks of หัวข้อ 3.5: one top-level key per block, 7-key leaves, src rules, counts.
// usage: node d_json_check.mjs <file.md>
import fs from 'node:fs';
const s = fs.readFileSync(process.argv[2], 'utf8');
const blocks = [...s.matchAll(/```json\n([\s\S]*?)```/g)].map((m) => m[1]);
const KEYS = ['v', 'u', 'scope', 'src', 'conf', 'est', 'note'];
let leaves = 0, bad = 0, est = 0; const conf = { 'สูง': 0, 'กลาง': 0, 'ต่ำ': 0 }; const per = {};
const isLeaf = (o) => o && typeof o === 'object' && !Array.isArray(o) && 'v' in o && 'conf' in o;
function walk(o, p, top) {
  if (isLeaf(o)) {
    leaves++; per[top] = (per[top] || 0) + 1;
    const k = Object.keys(o);
    if (k.length !== 7 || !KEYS.every((x) => k.includes(x))) { bad++; console.log('badkeys', p, k); }
    if (!(o.conf in conf)) { bad++; console.log('badconf', p, o.conf); } else conf[o.conf]++;
    if (typeof o.est !== 'boolean') { bad++; console.log('badest', p); } else if (o.est) est++;
    const last = p.split('.').pop();
    const srcOk = Array.isArray(o.src) ? o.src.length > 0 : !!o.src;
    if (!srcOk && last !== '_inherits' && last !== '_na') { bad++; console.log('emptysrc', p); }
    return;
  }
  if (o && typeof o === 'object' && !Array.isArray(o)) { for (const x of Object.keys(o)) walk(o[x], p + '.' + x, top); return; }
  bad++; console.log('nonleaf', p, JSON.stringify(o).slice(0, 60));
}
blocks.forEach((b, i) => {
  let j; try { j = JSON.parse(b); } catch (e) { bad++; console.log('parse', i, e.message); return; }
  const k = Object.keys(j);
  if (k.length !== 1) { bad++; console.log('topkeys', i, k); }
  walk(j[k[0]], k[0], k[0]);
});
console.log(JSON.stringify({ blocks: blocks.length, leaves, est, conf, per, bad }));
if (bad) process.exit(1);
