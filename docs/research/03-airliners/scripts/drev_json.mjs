// drev_json.mjs — reviewer JSON check for หัวข้อ 3.5: parse every ```json block, check schema-ext rules and ownership.
import fs from 'node:fs';
const s = fs.readFileSync(process.argv[2] || '05-airport-geometry.md', 'utf8');
const blocks = [...s.matchAll(/```json\n([\s\S]*?)```/g)].map((m) => m[1]);
const TYPES = ['atr72_600', 'b737_800', 'a320ceo', 'a320neo', 'a321ceo', 'a321neo', 'a330_300', 'common_airliner'];
const KEYS = ['v', 'u', 'scope', 'src', 'conf', 'est', 'note'];
const known = new Set([...Array.from({ length: 41 }, (_, i) => `D${i + 1}`), 'B3', 'B4', 'B9', 'L3', 'L8', 'L34', 'L35', 'L46']);
let leaves = 0, errs = 0; const stat = { สูง: 0, กลาง: 0, ต่ำ: 0, est: 0 };
const isLeaf = (o) => o && typeof o === 'object' && !Array.isArray(o) && 'v' in o && 'conf' in o;
const walk = (o, path, top) => {
  if (isLeaf(o)) {
    leaves++; const k = Object.keys(o);
    if (k.length !== 7 || !KEYS.every((x) => k.includes(x))) { errs++; console.log('BAD KEYS', path, k); }
    if (!Array.isArray(o.src) || !o.src.length) { errs++; console.log('EMPTY SRC', path); }
    for (const c of o.src || []) if (!known.has(c)) { errs++; console.log('UNKNOWN SRC', path, c); }
    if (!(o.conf in stat)) { errs++; console.log('BAD CONF', path, o.conf); } else stat[o.conf]++;
    if (typeof o.est !== 'boolean') { errs++; console.log('BAD EST', path); } else if (o.est) stat.est++;
    if (!['aircraft', 'engine', 'propeller', 'gear', 'environment', 'sim'].includes(o.scope)) { errs++; console.log('BAD SCOPE', path, o.scope); }
    const own = top === 'common_airliner' ? path.startsWith('common_airliner.visual.') : (path.split('.').slice(1, 3).join('.') === 'airframe.geometry' || path.split('.').slice(1, 3).join('.') === 'gear.geometry');
    if (!own) { errs++; console.log('NOT OWNED', path); }
    if ((top === 'common_airliner') !== ['environment', 'sim'].includes(o.scope)) console.log('scope note', path, o.scope);
    return;
  }
  if (o && typeof o === 'object') for (const [k, v] of Object.entries(o)) walk(v, path ? `${path}.${k}` : k, top);
  else { errs++; console.log('NON-LEAF VALUE', path); }
};
blocks.forEach((b, i) => {
  let j; try { j = JSON.parse(b); } catch (e) { errs++; console.log('PARSE ERROR block', i + 1, e.message); return; }
  const top = Object.keys(j); if (top.length !== 1 || !TYPES.includes(top[0])) { errs++; console.log('TOP KEY', i + 1, top); }
  walk(j[top[0]], top[0], top[0]);
});
console.log(`blocks ${blocks.length}, leaves ${leaves}, errors ${errs}, conf`, stat);
