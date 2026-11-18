#!/usr/bin/env node
// Round 3 (airliners): extract the ```json data blocks from the topic files, check the leaf format,
// check topic ownership (schema-ext.md section 4), deep-merge by type id, resolve _inherits,
// report path conflicts and round-1 coverage, and write params-<type>.json + params-common.json.
// Adapted from round 2's lm_merge.mjs. Pure Node >= 18, no dependencies.
//
// usage: node r3_merge.mjs --dir <folder with NN-*.md or sec-NN-*.md> [--out <folder>] [--dry]
//                          [--coverage] [--schema <file.md>] [--quiet]
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
const flag = k => args.includes(k);
const DIR = path.resolve(opt('--dir', path.join(HERE, '..')));
const OUT = path.resolve(opt('--out', DIR));
const QUIET = flag('--quiet');
const R1 = path.join(HERE, 'r1-pertype-paths.json');

const SCOPES = new Set(['aircraft', 'engine', 'propeller', 'gear', 'environment', 'sim']);
const CONFS = new Set(['สูง', 'กลาง', 'ต่ำ']);
const TYPES = ['atr72_600', 'b737_800', 'a320ceo', 'a320neo', 'a321ceo', 'a321neo', 'a330_300'];
const IDS = new Set([...TYPES, 'common_airliner']);
const JETS = new Set(TYPES.filter(t => t !== 'atr72_600'));

// topic number -> allowed top-level category prefixes (schema-ext.md section 4)
const CARD = ['_inherits', '_na', 'airframe', 'aero', 'interference', 'speeds', 'performance', 'validation', 'gear', 'wind', 'numerics', 'input', 'otherSims'];
const OWN = {
  1: [...CARD, 'propulsion', 'turboprop', 'propeller'],
  2: CARD, 3: CARD, 4: CARD,
  5: ['airframe.geometry', 'gear.geometry', 'common_airliner'],
  6: ['turbofan', 'propulsion', 'common_airliner'],
  7: ['controls', 'common_airliner'],
  8: ['controls.fbw', 'common_airliner', '_inherits'],
  9: ['afcs', 'common_airliner', '_inherits'],
  10: ['ops', 'common_airliner', '_inherits'],
};
const NOT_FOR_CARDS = ['airframe.geometry', 'gear.geometry'];

const isObj = o => o && typeof o === 'object' && !Array.isArray(o);
const isLeaf = o => isObj(o) && 'v' in o && 'scope' in o;
const errors = [], warnings = [], conflicts = [], owners = [];
const merged = {}, origin = {};
let nBlocks = 0, nExamples = 0, nBad = 0;

const files = fs.readdirSync(DIR).filter(f => /^(sec-)?\d\d-.*\.md$/.test(f)).sort();
for (const f of files) {
  const topic = +f.replace(/^sec-/, '').slice(0, 2);
  const text = fs.readFileSync(path.join(DIR, f), 'utf8');
  const re = /```json[ \t]*\r?\n([\s\S]*?)\r?\n```/g;
  let m;
  while ((m = re.exec(text))) {
    const line = text.slice(0, m.index).split('\n').length;
    const where = `${f}:${line}`;
    let obj;
    try { obj = JSON.parse(m[1]); } catch (e) { errors.push(`${where} JSON parse: ${e.message}`); nBad++; continue; }
    if (!isObj(obj)) { nExamples++; continue; }
    const keys = Object.keys(obj);
    if (keys.length !== 1 || !/^[a-z][a-z0-9_]*$/.test(keys[0])) { nExamples++; continue; }
    const id = keys[0];
    if (!IDS.has(id)) { warnings.push(`${where}: unknown top-level id "${id}" (skipped)`); nExamples++; continue; }
    nBlocks++;
    walk(obj[id], [id], where, topic);
  }
}

function owned(topic, ps) {
  const rel = ps.split('.').slice(1).join('.');
  const id = ps.split('.')[0];
  const allow = OWN[topic] || [];
  if (id === 'common_airliner') return true;
  if ([2, 3, 4, 1].includes(topic) && NOT_FOR_CARDS.some(n => rel === n || rel.startsWith(n + '.'))) return false;
  return allow.some(a => rel === a || rel.startsWith(a + '.'));
}

function walk(o, p, where, topic) {
  const ps = p.join('.');
  if (isLeaf(o)) { checkLeaf(o, ps, where); if (!owned(topic, ps)) owners.push(`${where} ${ps}: topic ${topic} does not own this path`); put(p, o, where); return; }
  if (!isObj(o)) { errors.push(`${where} ${ps}: bare value (wrap it in a leaf)`); return; }
  for (const k of Object.keys(o)) walk(o[k], [...p, k], where, topic);
}

function checkLeaf(l, ps, where) {
  for (const k of ['v', 'u', 'scope', 'src', 'conf', 'est', 'note']) if (!(k in l)) errors.push(`${where} ${ps}: missing "${k}"`);
  const extra = Object.keys(l).filter(k => !['v', 'u', 'scope', 'src', 'conf', 'est', 'note'].includes(k));
  if (extra.length) warnings.push(`${where} ${ps}: extra fields ${extra.join(',')}`);
  if ('scope' in l && !SCOPES.has(l.scope)) errors.push(`${where} ${ps}: scope "${l.scope}"`);
  if ('conf' in l && !CONFS.has(l.conf)) errors.push(`${where} ${ps}: conf "${l.conf}"`);
  if ('est' in l && typeof l.est !== 'boolean') errors.push(`${where} ${ps}: est must be boolean`);
  if ('src' in l && !(Array.isArray(l.src) && l.src.every(s => typeof s === 'string'))) errors.push(`${where} ${ps}: src must be an array of strings`);
  if ('u' in l && typeof l.u !== 'string') errors.push(`${where} ${ps}: u must be a string`);
  if (l.est === true && !(typeof l.note === 'string' && l.note.trim())) warnings.push(`${where} ${ps}: est=true without a note`);
  if (Array.isArray(l.src) && l.src.length === 0 && !/\._(na|inherits)$/.test(ps)) warnings.push(`${where} ${ps}: empty src`);
  if (l.v === null || l.v === undefined) warnings.push(`${where} ${ps}: v is null`);
}

function put(p, leaf, where) {
  let o = merged;
  for (let i = 0; i < p.length - 1; i++) {
    if (isLeaf(o[p[i]])) { conflicts.push(`${p.slice(0, i + 1).join('.')} is a leaf (${origin[p.slice(0, i + 1).join('.')]}) but ${where} nests under it`); return; }
    o = o[p[i]] ??= {};
  }
  const k = p[p.length - 1], ps = p.join('.');
  if (k in o) {
    if (isObj(o[k]) && !isLeaf(o[k])) { conflicts.push(`${ps}: ${where} puts a leaf where others nest`); return; }
    const same = JSON.stringify(o[k].v) === JSON.stringify(leaf.v);
    conflicts.push(`${ps}: ${origin[ps]} vs ${where}${same ? ' (same v)' : ` (${JSON.stringify(o[k].v)?.slice(0, 60)} vs ${JSON.stringify(leaf.v)?.slice(0, 60)})`}`);
    return;
  }
  o[k] = leaf; origin[ps] = where;
}

// ---- resolve _inherits (deep merge base under the variant) ----
const clone = o => JSON.parse(JSON.stringify(o));
function deepMerge(base, over) {
  if (isLeaf(over) || !isObj(over) || !isObj(base) || isLeaf(base)) return clone(over);
  const r = clone(base);
  for (const k of Object.keys(over)) r[k] = k in r ? deepMerge(r[k], over[k]) : clone(over[k]);
  return r;
}
const resolved = {};
function resolve(id, seen = new Set()) {
  if (resolved[id]) return resolved[id];
  const own = merged[id] || {};
  const inh = own._inherits?.v;
  if (inh && !seen.has(inh) && merged[inh]) { seen.add(id); resolved[id] = deepMerge(resolve(inh, seen), own); }
  else { if (inh && !merged[inh]) warnings.push(`${id}._inherits -> "${inh}" not found`); resolved[id] = clone(own); }
  return resolved[id];
}
for (const id of TYPES) if (merged[id]) resolve(id);

// ---- stats + coverage ----
function leafPaths(o, p, acc) { if (isLeaf(o)) { acc.push(p.join('.')); return acc; } if (isObj(o)) for (const k of Object.keys(o)) leafPaths(o[k], [...p, k], acc); return acc; }
const stats = {};
for (const id of Object.keys(merged)) {
  const s = stats[id] = { own: 0, resolved: 0, est: 0, byCat: {}, byConf: {} };
  s.own = leafPaths(merged[id], [], []).length;
  const tree = id === 'common_airliner' ? merged[id] : resolved[id];
  (function rec(o, cat) {
    if (isLeaf(o)) { s.resolved++; if (o.est) s.est++; s.byCat[cat] = (s.byCat[cat] || 0) + 1; s.byConf[o.conf] = (s.byConf[o.conf] || 0) + 1; return; }
    if (isObj(o)) for (const k of Object.keys(o)) rec(o[k], cat ?? k);
  })(tree, null);
}
const r1 = fs.existsSync(R1) ? JSON.parse(fs.readFileSync(R1, 'utf8')) : null;
const coverage = {};
if (r1) for (const id of TYPES) {
  if (!resolved[id]) continue;
  const have = leafPaths(resolved[id], [], []);
  const hs = new Set(have);
  const na = (resolved[id]._na?.v || []).map(String);
  const autoNA = JETS.has(id) ? ['propeller.*', 'turboprop.*'] : ['turbofan.*'];
  // round 1 lists three example engine classes for every type; a class this type does not carry at all is n/a
  if (JETS.has(id)) {
    const mine = new Set(Object.keys(resolved[id].turbofan?.engines || {}));
    for (const p of Object.keys(r1)) {
      const m = p.match(/^turbofan\.engines\.([^.]+)\./);
      if (m && !mine.has(m[1])) autoNA.push(`turbofan.engines.${m[1]}.*`);
    }
  }
  const isNA = p => [...na, ...autoNA].some(n => n === p || (n.endsWith('.*') && p.startsWith(n.slice(0, -1))) || p.startsWith(n + '.'));
  const filled = Object.keys(r1).filter(p => hs.has(p) || have.some(h => h.startsWith(p + '.')));
  const missing = Object.keys(r1).filter(p => !filled.includes(p) && !isNA(p));
  coverage[id] = { r1: Object.keys(r1).length, filled: filled.length, na: Object.keys(r1).filter(p => !filled.includes(p) && isNA(p)).length, missing };
}

if (!flag('--dry')) {
  fs.mkdirSync(OUT, { recursive: true });
  for (const id of TYPES) {
    if (!resolved[id]) continue;
    const meta = { type: id, note: 'สร้างอัตโนมัติจากบล็อก JSON ในไฟล์หัวข้อของรอบที่ 3 ด้วย scripts/r3_merge.mjs ห้ามแก้ด้วยมือ ให้แก้ที่ไฟล์หัวข้อแล้วสร้างใหม่', leaf: '{v,u,scope,src,conf,est,note}', inheritsResolved: merged[id]._inherits?.v || null, leaves: stats[id].resolved, est: stats[id].est };
    fs.writeFileSync(path.join(OUT, `params-${id.replace(/_/g, '-')}.json`), JSON.stringify({ _meta: meta, ...resolved[id] }, null, 1) + '\n');
  }
  if (merged.common_airliner) fs.writeFileSync(path.join(OUT, 'params-common-airliner.json'), JSON.stringify({ _meta: { note: 'ค่าร่วมของเครื่องบินโดยสาร (scope environment/sim) สร้างอัตโนมัติด้วย scripts/r3_merge.mjs' }, ...merged.common_airliner }, null, 1) + '\n');
  fs.writeFileSync(path.join(OUT, 'merge-report.json'), JSON.stringify({ files, blocks: nBlocks, stats, coverage: Object.fromEntries(Object.entries(coverage).map(([k, c]) => [k, { ...c, missing: c.missing }])), conflicts, owners, errors, warnings }, null, 1));
}

const say = (...a) => { if (!QUIET) console.log(...a); };
say(`files: ${files.length}, data blocks: ${nBlocks}, example blocks skipped: ${nExamples}, unparsable: ${nBad}`);
for (const [id, s] of Object.entries(stats)) say(`${id}: own ${s.own}, resolved ${s.resolved} (est ${s.est}) byCat ${JSON.stringify(s.byCat)} byConf ${JSON.stringify(s.byConf)}`);
for (const [id, c] of Object.entries(coverage)) {
  say(`coverage ${id}: round-1 per-type ${c.r1}, filled ${c.filled}, n/a ${c.na}, missing ${c.missing.length}`);
  if (flag('--coverage')) for (const p of c.missing) say(`   missing ${p}`);
}
if (conflicts.length) { say(`\nCONFLICTS (${conflicts.length}):`); conflicts.forEach(c => say('  ' + c)); }
if (owners.length) { say(`\nOWNERSHIP (${owners.length}):`); owners.slice(0, 80).forEach(c => say('  ' + c)); }
if (errors.length) { say(`\nERRORS (${errors.length}):`); errors.slice(0, 200).forEach(e => say('  ' + e)); }
if (warnings.length) { say(`\nwarnings (${warnings.length}):`); warnings.slice(0, 80).forEach(w => say('  ' + w)); }
process.exitCode = errors.length ? 1 : 0;
