// Section 4 review: extract ```json blocks, parse, check leaf schema.
import fs from 'fs';
const md = fs.readFileSync(process.argv[2] || 'docs/research/01-flight-physics/sec-04-turboprop.md', 'utf8');
const blocks = [...md.matchAll(/```json\n([\s\S]*?)```/g)].map(m => m[1]);
console.log('blocks', blocks.length);
const KEYS = ['v', 'u', 'scope', 'src', 'conf', 'est', 'note'];
const SCOPES = new Set(['aircraft', 'engine', 'propeller', 'gear', 'environment', 'sim']);
const refs = new Set([...md.matchAll(/\[(E\d+)\]/g)].map(m => m[1]));
let leaves = 0, bad = [];
function walk(o, path) {
  if (o && typeof o === 'object' && 'v' in o && 'u' in o) {
    leaves++;
    const ks = Object.keys(o);
    if (ks.join() !== KEYS.join()) bad.push([path, 'keys', ks.join()]);
    if (!SCOPES.has(o.scope)) bad.push([path, 'scope', o.scope]);
    if (!['สูง', 'กลาง', 'ต่ำ'].includes(o.conf)) bad.push([path, 'conf', o.conf]);
    if (typeof o.est !== 'boolean') bad.push([path, 'est']);
    if (!Array.isArray(o.src)) bad.push([path, 'src not array']);
    else for (const s of o.src) if (!/^E\d+$/.test(s)) bad.push([path, 'src id', s]);
    return;
  }
  if (o && typeof o === 'object') for (const k of Object.keys(o)) walk(o[k], path + '.' + k);
  else bad.push([path, 'non-leaf scalar']);
}
for (const b of blocks) { const j = JSON.parse(b); walk(j, ''); console.log('top keys', Object.keys(j)); }
console.log('leaves', leaves); console.log('problems', JSON.stringify(bad, null, 0));
