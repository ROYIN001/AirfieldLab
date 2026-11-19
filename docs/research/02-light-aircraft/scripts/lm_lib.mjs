// lm_lib.mjs — importable core of the round-2 (light aircraft) data-card tooling.
// Extracts the ```json data blocks from the topic files, checks the leaf format, deep-merges the
// blocks by type id, reports path conflicts and round-1 coverage. Pure Node >= 18, no dependencies.
//
//   import { mergeDir, resolveType, val, leaf } from './lm_lib.mjs';
//   const { merged, errors, conflicts, coverage } = mergeDir('/path/to/02-light-aircraft/');
//
// A data block is a ```json fence whose object has exactly ONE top-level key: a type id
// (c172s, da40ng, ...) or common_light. Blocks with more than one top-level key are examples and
// are skipped. A leaf is an object with "v" and "scope" (schema-ext-r2.md §1).
// lm_merge.mjs is the command-line front end; its output is unchanged by this refactor.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const HERE = path.dirname(fileURLToPath(import.meta.url));
export const SCOPES = new Set(['aircraft', 'engine', 'propeller', 'gear', 'environment', 'sim']);
export const CONFS = new Set(['สูง', 'กลาง', 'ต่ำ']);
export const ID_RE = /^[a-z][a-z0-9_]*$/;
export const LEAF_KEYS = ['v', 'u', 'scope', 'src', 'conf', 'est', 'note'];

export const isObj = o => o && typeof o === 'object' && !Array.isArray(o);
export const isLeaf = o => isObj(o) && 'v' in o && 'scope' in o;

/** Default round-1 per-type path list: _brief/ copy first, then the copy next to this script. */
export function defaultR1Paths() {
  return [path.join(HERE, '..', '..', '_brief', 'r1-pertype-paths.json'), path.join(HERE, 'r1-pertype-paths.json')];
}

/** Extract data blocks from one markdown text. Returns {blocks:[{id,obj,where}], examples, bad:[{where,msg}]} */
export function extractBlocks(text, file) {
  const re = /```json[ \t]*\r?\n([\s\S]*?)\r?\n```/g;
  const blocks = [], bad = []; let m, examples = 0;
  while ((m = re.exec(text))) {
    const line = text.slice(0, m.index).split('\n').length;
    const where = `${file}:${line}`;
    let obj;
    try { obj = JSON.parse(m[1]); } catch (e) { bad.push({ where, msg: `${where} JSON parse: ${e.message}` }); continue; }
    if (!isObj(obj)) { examples++; continue; }
    const keys = Object.keys(obj);
    if (keys.length !== 1 || !ID_RE.test(keys[0])) { examples++; continue; }
    blocks.push({ id: keys[0], obj: obj[keys[0]], where });
  }
  return { blocks, examples, bad };
}

/** Collect leaf paths (dot strings) under o. */
export function leafPaths(o, p = [], acc = []) {
  if (isLeaf(o)) { acc.push(p.join('.')); return acc; }
  if (isObj(o)) for (const k of Object.keys(o)) leafPaths(o[k], [...p, k], acc);
  return acc;
}

/**
 * Merge every *.md in dir.
 * opts: { only: typeId|null, r1: path to r1-pertype-paths.json | null (default search), files: explicit list }
 * returns { merged, origin, errors, warnings, conflicts, coverage, stats, files, nBlocks, nExamples, nBad }
 */
export function mergeDir(dir, opts = {}) {
  const ONLY = opts.only ?? null;
  const errors = [], warnings = [], conflicts = [];
  const merged = {}, origin = {};
  let nBlocks = 0, nExamples = 0, nBad = 0;
  const files = opts.files ?? fs.readdirSync(dir).filter(f => f.endsWith('.md')).sort();

  function checkLeaf(l, ps, where) {
    for (const k of LEAF_KEYS) if (!(k in l)) errors.push(`${where} ${ps}: missing "${k}"`);
    const extra = Object.keys(l).filter(k => !LEAF_KEYS.includes(k));
    if (extra.length) warnings.push(`${where} ${ps}: extra fields ${extra.join(',')}`);
    if ('scope' in l && !SCOPES.has(l.scope)) errors.push(`${where} ${ps}: scope "${l.scope}"`);
    if ('conf' in l && !CONFS.has(l.conf)) errors.push(`${where} ${ps}: conf "${l.conf}" (สูง/กลาง/ต่ำ)`);
    if ('est' in l && typeof l.est !== 'boolean') errors.push(`${where} ${ps}: est must be boolean`);
    if ('src' in l && !(Array.isArray(l.src) && l.src.every(s => typeof s === 'string'))) errors.push(`${where} ${ps}: src must be an array of strings`);
    if ('u' in l && typeof l.u !== 'string') errors.push(`${where} ${ps}: u must be a string`);
    if (l.est === true && !(typeof l.note === 'string' && l.note.trim())) warnings.push(`${where} ${ps}: est=true without a note (say how it was estimated)`);
    if (Array.isArray(l.src) && l.src.length === 0 && !ps.endsWith('._na') && !ps.endsWith('._inherits')) warnings.push(`${where} ${ps}: empty src`);
    if (l.v === null || l.v === undefined) warnings.push(`${where} ${ps}: v is null (list non-applicable paths in _na instead)`);
  }
  function put(p, lf, where) {
    let o = merged;
    for (let i = 0; i < p.length - 1; i++) {
      if (isLeaf(o[p[i]])) { conflicts.push(`${p.slice(0, i + 1).join('.')} is a leaf (${origin[p.slice(0, i + 1).join('.')]}) but ${where} nests under it`); return; }
      o = o[p[i]] ??= {};
    }
    const k = p[p.length - 1], ps = p.join('.');
    if (k in o) {
      const same = JSON.stringify(o[k].v) === JSON.stringify(lf.v);
      conflicts.push(`${ps}: ${origin[ps]} vs ${where}${same ? ' (same v)' : ` (${JSON.stringify(o[k].v)?.slice(0, 60)} vs ${JSON.stringify(lf.v)?.slice(0, 60)})`}`);
      return;
    }
    o[k] = lf; origin[ps] = where;
  }
  function walk(o, p, where) {
    const ps = p.join('.');
    if (isLeaf(o)) { checkLeaf(o, ps, where); put(p, o, where); return; }
    if (!isObj(o)) { errors.push(`${where} ${ps}: bare value (wrap it in a leaf {v,u,scope,src,conf,est,note})`); return; }
    for (const k of Object.keys(o)) walk(o[k], [...p, k], where);
  }

  for (const f of files) {
    const text = fs.readFileSync(path.join(dir, f), 'utf8');
    const { blocks, examples, bad } = extractBlocks(text, f);
    // keep the original error order: parse errors are interleaved with blocks by position
    const evs = [...blocks.map(b => ({ kind: 'b', b, line: +b.where.split(':').pop() })), ...bad.map(x => ({ kind: 'x', x, line: +x.where.split(':').pop() }))].sort((a, b) => a.line - b.line);
    nExamples += examples;
    for (const ev of evs) {
      if (ev.kind === 'x') { errors.push(ev.x.msg); nBad++; continue; }
      nBlocks++;
      if (ONLY && ev.b.id !== ONLY) continue;
      walk(ev.b.obj, [ev.b.id], ev.b.where);
    }
  }

  // inheritance check and stats
  const stats = {};
  function count(o, id, cat) {
    if (isLeaf(o)) {
      const s = stats[id] ??= { leaves: 0, est: 0, byCat: {}, byScope: {}, byConf: {} };
      s.leaves++; if (o.est) s.est++;
      s.byCat[cat] = (s.byCat[cat] || 0) + 1; s.byScope[o.scope] = (s.byScope[o.scope] || 0) + 1; s.byConf[o.conf] = (s.byConf[o.conf] || 0) + 1;
      return;
    }
    if (isObj(o)) for (const k of Object.keys(o)) count(o[k], id, cat ?? k);
  }
  for (const id of Object.keys(merged)) {
    count(merged[id], id, null);
    const inh = merged[id]._inherits;
    if (inh && !merged[inh.v]) warnings.push(`${id}._inherits -> "${inh.v}" not found (yet)`);
  }

  // coverage against round-1 per-type leaves
  let r1 = null;
  const cands = opts.r1 ? [opts.r1, ...defaultR1Paths().slice(1)] : defaultR1Paths();
  for (const f of cands) if (f && fs.existsSync(f)) { r1 = JSON.parse(fs.readFileSync(f, 'utf8')); break; }
  const coverage = {};
  if (r1) for (const id of Object.keys(merged)) {
    if (id === 'common_light' || merged[id]._inherits) continue;
    const have = new Set(leafPaths(merged[id], [], []));
    const na = (merged[id]._na?.v || []).map(String);
    const isNA = p => na.some(n => n === p || (n.endsWith('.*') && p.startsWith(n.slice(0, -1))) || p.startsWith(n + '.'));
    const missing = Object.keys(r1).filter(p => !have.has(p) && !isNA(p) && ![...have].some(h => h.startsWith(p + '.')));
    coverage[id] = { r1: Object.keys(r1).length, filled: Object.keys(r1).filter(p => have.has(p) || [...have].some(h => h.startsWith(p + '.'))).length, na: Object.keys(r1).filter(isNA).length, missing };
  }
  return { merged, origin, errors, warnings, conflicts, coverage, stats, files, nBlocks, nExamples, nBad };
}

/** Wrap a merge result as the params-light.json object (same layout as lm_merge.mjs writes). */
export function paramsObject(res) {
  return {
    _meta: {
      note: 'รวมบล็อก JSON ของรอบที่ 2 (docs/research/02-light-aircraft/*.md) สร้างอัตโนมัติด้วย scripts/lm_merge.mjs ห้ามแก้ไฟล์นี้ด้วยมือ',
      leaf: '{v,u,scope,src,conf,est,note}',
      files: res.files, blocks: res.nBlocks,
    },
    ...res.merged,
  };
}

// ───────────── helpers for consumers (lm_card, lm_derivs, …) ─────────────

/** Deep merge b over a (leaves replace whole). */
export function deepMerge(a, b) {
  if (!isObj(a) || isLeaf(a) || !isObj(b) || isLeaf(b)) return b;
  const o = { ...a };
  for (const k of Object.keys(b)) o[k] = k in a ? deepMerge(a[k], b[k]) : b[k];
  return o;
}

/** Type card with its _inherits chain applied (parent first, child wins). */
export function resolveType(merged, id, seen = new Set()) {
  const t = merged[id];
  if (!t) return null;
  if (seen.has(id)) throw new Error(`_inherits loop at ${id}`);
  seen.add(id);
  const par = t._inherits?.v;
  if (!par) return t;
  const base = resolveType(merged, par, seen);
  if (!base) throw new Error(`${id}._inherits -> ${par} not found`);
  const { _inherits, ...rest } = t;
  return deepMerge(base, rest);
}

/** Get the leaf at a dot path (or undefined). */
export function leaf(card, p) {
  let o = card;
  for (const k of p.split('.')) { if (!isObj(o) || isLeaf(o)) return undefined; o = o[k]; }
  return isLeaf(o) ? o : undefined;
}
/** Get v at a dot path, or dflt. */
export function val(card, p, dflt = undefined) { const l = leaf(card, p); return l === undefined ? dflt : l.v; }

/** Load a type: merged folder first, then scripts/lm_fixture_<id>.json, then any lm_fixture_*.json holding it. */
export function loadType(id, { dir = path.join(HERE, '..'), merged = null } = {}) {
  const m = merged ?? mergeDir(dir).merged;
  const all = { ...m };
  for (const f of fs.readdirSync(HERE).filter(f => /^lm_fixture_.*\.json$/.test(f))) {
    try { const o = JSON.parse(fs.readFileSync(path.join(HERE, f), 'utf8')); for (const k of Object.keys(o)) if (!(k in all) && !k.startsWith('_')) all[k] = o[k]; } catch { /* ignore */ }
  }
  const card = resolveType(all, id);
  if (!card) throw new Error(`type "${id}" not found in ${dir} nor in scripts/lm_fixture_*.json (known: ${Object.keys(all).join(', ')})`);
  return card;
}

/** Make a leaf. */
export function mkLeaf(v, u, src, { scope = 'sim', conf = 'กลาง', est = false, note = '' } = {}) {
  return { v, u, scope, src, conf, est, note };
}

/** true when the module at metaUrl is the script node was started with (symlink-safe: compares real paths). */
export function isMainModule(metaUrl) {
  try { return !!process.argv[1] && fs.realpathSync(path.resolve(process.argv[1])) === fs.realpathSync(fileURLToPath(metaUrl)); } catch { return false; }
}
