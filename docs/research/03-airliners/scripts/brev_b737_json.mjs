// brev_b737_json.mjs — reviewer: parse every ```json block of 02-b737-800.md and check schema-ext.md rules.
// Run: node brev_b737_json.mjs [path]
import fs from 'node:fs';
const file = process.argv[2] || '02-b737-800.md';
const md = fs.readFileSync(file, 'utf8');
const refs = new Set([...md.matchAll(/\*\*\[(B\d+)\]\*\*/g)].map(m => m[1]));
const blocks = [...md.matchAll(/```json\n([\s\S]*?)```/g)].map(m => m[1]);
const KEYS = ['v', 'u', 'scope', 'src', 'conf', 'est', 'note'];
const SCOPES = new Set(['aircraft', 'engine', 'propeller', 'gear', 'environment', 'sim']);
const owned = p => /^b737_800\.(_na|airframe\.(?!geometry)|aero\.|interference\.|speeds\.|performance\.|validation\.|gear\.(strut|tyre|brake|steering)|wind\.wake)/.test(p);
let leaves = 0; const problems = []; const paths = new Map();
const walk = (o, p) => {
  if (o && typeof o === 'object' && !Array.isArray(o) && 'v' in o) {
    leaves++;
    const k = Object.keys(o);
    if (k.length !== 7 || !KEYS.every(x => k.includes(x))) problems.push(`${p}: keys ${k}`);
    if (!SCOPES.has(o.scope)) problems.push(`${p}: scope ${o.scope}`);
    if (!['สูง', 'กลาง', 'ต่ำ'].includes(o.conf)) problems.push(`${p}: conf ${o.conf}`);
    if (typeof o.est !== 'boolean') problems.push(`${p}: est ${o.est}`);
    if (!Array.isArray(o.src)) problems.push(`${p}: src not array`);
    else { if (o.src.length === 0 && !/\._na$|\._inherits$/.test(p)) problems.push(`${p}: empty src`);
      for (const s of o.src) if (!refs.has(s) && !/^[A-Z]\d+$|^R\d:/.test(s)) problems.push(`${p}: unknown src ${s}`); else if (/^B\d+$/.test(s) && !refs.has(s)) problems.push(`${p}: src ${s} not in reference list`); }
    if (!owned(p)) problems.push(`${p}: path not owned by topic 2`);
    if (paths.has(p)) problems.push(`${p}: duplicate path`); paths.set(p, o);
    if (o.est === true && o.conf === 'สูง') problems.push(`${p}: est true with conf สูง (check)`);
    return;
  }
  if (o && typeof o === 'object' && !Array.isArray(o)) for (const [k, v] of Object.entries(o)) walk(v, p ? `${p}.${k}` : k);
  else problems.push(`${p}: non-leaf value`);
};
blocks.forEach((b, i) => {
  let j; try { j = JSON.parse(b); } catch (e) { problems.push(`block ${i + 1}: parse error ${e.message}`); return; }
  const top = Object.keys(j); if (top.length !== 1 || top[0] !== 'b737_800') problems.push(`block ${i + 1}: top keys ${top}`);
  walk(j, '');
});
console.log(`blocks ${blocks.length}, leaves ${leaves}, refs ${refs.size}`);
console.log(problems.length ? problems.join('\n') : 'no problems');
