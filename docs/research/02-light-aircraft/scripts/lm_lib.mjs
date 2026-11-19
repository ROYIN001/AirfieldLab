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
//
// Update 19 Nov 2026 (completeness check, decisions D1–D6 in _brief/schema-ext-r2.md):
//  - resolution bases: an `_inherits` target that no topic block defines is looked up in loadBases(): every
//    scripts/lm_fixture_<id>.json, and for trainer_r1 also the round-1 per-type leaves of params-trainer.json
//    (../../01-flight-physics/params-trainer.json in the repo; turbofan.* and controls.reference_types.* left out).
//    The merged params-light.json does not copy them; _meta.bases says where they come from.
//  - `_na` with v ["*"] marks every remaining round-1 per-type path as deliberately absent (coverage missing 0).
//  - coverage is also given for inheriting ids, on the resolved card.
//  - validate(): WARN-level checks (errors with {strict:true}): scope by category (D4), est flag vs note,
//    training_mass shape (D3), VAPP >= VREF on every resolved id (D1), 08 ops.attitude_power.final.ias_kt and
//    09 procedures.stabilised.Vapp = the card's speeds.VAPP_kt (D1), flap detent names in 08/09 (D6).
//  - helpers: trainingMass(card) (number or D3 object), iasCas(card, detent) (moved here from lm_card, re-exported there).
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
  // _inherits targets: a topic block, or a resolution base (loadBases); with --type the other ids are taken from a
  // full merge so that a variant still resolves (review 19 Nov 2026: '_inherits not found (yet)' under --type)
  const { bases, info: baseInfo } = opts.bases === false ? { bases: {}, info: {} } : loadBases();
  const full = ONLY ? mergeDir(dir, { ...opts, only: null, checks: false, bases: false }).merged : merged;
  const pool = { ...bases, ...full };
  for (const id of Object.keys(merged)) {
    count(merged[id], id, null);
    const inh = merged[id]._inherits;
    if (inh && !pool[inh.v]) warnings.push(`${id}._inherits -> "${inh.v}" not found (yet)`);
  }

  // coverage against round-1 per-type leaves
  let r1 = null;
  const cands = opts.r1 ? [opts.r1, ...defaultR1Paths().slice(1)] : defaultR1Paths();
  for (const f of cands) if (f && fs.existsSync(f)) { r1 = JSON.parse(fs.readFileSync(f, 'utf8')); break; }
  const coverage = {};
  if (r1) for (const id of Object.keys(merged)) {
    if (id === 'common_light') continue;
    // an inheriting id is measured on its resolved card (parent chain applied), and says so (review 19 Nov 2026)
    let card = merged[id], via = null;
    if (merged[id]._inherits) {
      try { card = resolveType(pool, id, new Set(), bases); via = inheritChain(pool, id, bases); } catch { continue; }
    }
    coverage[id] = coverageOf(card, r1);
    if (via) { coverage[id].resolved = true; coverage[id].via = via; coverage[id].base = via.filter(x => bases[x] && !full[x]).map(x => baseInfo[x]?.from || x); }
  }
  const res = { merged, origin, errors, warnings, conflicts, coverage, stats, files, nBlocks, nExamples, nBad, bases: baseInfo };
  res.checks = opts.checks === false ? [] : validate(res, { r1, pool, bases, strict: !!opts.strict, only: ONLY });
  if (opts.strict) for (const c of res.checks) if (c.level === 'warn') errors.push(`[strict] ${c.id} ${c.check}: ${c.msg}`);
  return res;
}

/** _na helper: v is an array of paths, "cat.*" prefixes, or "*" (= every remaining round-1 per-type path, D5). */
export function naMatcher(card) {
  const na = (val(card, '_na') || []).map(String);
  return p => na.some(n => n === '*' || n === p || (n.endsWith('.*') && p.startsWith(n.slice(0, -1))) || p.startsWith(n + '.'));
}
/** Round-1 coverage of one (resolved) card: {r1, filled, na, missing[]}; na counts only paths that are not filled. */
export function coverageOf(card, r1) {
  const have = leafPaths(card, [], []), haveSet = new Set(have);
  const isFilled = p => haveSet.has(p) || have.some(h => h.startsWith(p + '.'));
  const isNA = naMatcher(card);
  const keys = Object.keys(r1);
  const filled = keys.filter(isFilled), na = keys.filter(p => !isFilled(p) && isNA(p));
  return { r1: keys.length, filled: filled.length, na: na.length, missing: keys.filter(p => !isFilled(p) && !isNA(p)), naAll: (val(card, '_na') || []).includes('*') };
}
function inheritChain(pool, id, bases) {
  const out = []; let t = pool[id] ?? bases?.[id]; const seen = new Set([id]);
  while (t?._inherits?.v && !seen.has(t._inherits.v)) { const p = t._inherits.v; out.push(p); seen.add(p); t = pool[p] ?? bases?.[p]; }
  return out;
}

/** Wrap a merge result as the params-light.json object (same layout as lm_merge.mjs writes). */
export function paramsObject(res) {
  return {
    _meta: {
      note: 'รวมบล็อก JSON ของรอบที่ 2 (docs/research/02-light-aircraft/*.md) สร้างอัตโนมัติด้วย scripts/lm_merge.mjs ห้ามแก้ไฟล์นี้ด้วยมือ',
      leaf: '{v,u,scope,src,conf,est,note}',
      files: res.files, blocks: res.nBlocks,
      // review 19 Nov 2026 (gap 10): resolution bases are NOT copied into this file. An id whose _inherits names a base
      // (trainer_r2 -> trainer_r1) resolves with lm_lib.loadType(id) or resolveType(merged, id, new Set(), loadBases().bases).
      bases: Object.fromEntries(Object.entries(res.bases || {}).map(([k, b]) => [k, { from: b.from, leaves: b.leaves, note: b.note }])),
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
export function resolveType(merged, id, seen = new Set(), bases = null) {
  const t = merged[id] ?? bases?.[id];   // bases: resolution bases from loadBases() (19 Nov 2026), used only when no block defines the id
  if (!t) return null;
  if (seen.has(id)) throw new Error(`_inherits loop at ${id}`);
  seen.add(id);
  const par = t._inherits?.v;
  if (!par) return t;
  const base = resolveType(merged, par, seen, bases);
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

/** Load a type: merged folder first, then the resolution bases (scripts/lm_fixture_*.json; trainer_r1 + round-1 leaves). */
export function loadType(id, { dir = path.join(HERE, '..'), merged = null } = {}) {
  const m = merged ?? mergeDir(dir, { checks: false, bases: false }).merged;
  const { bases } = loadBases();
  const all = { ...m };
  for (const k of Object.keys(bases)) if (!(k in all)) all[k] = bases[k];
  const card = resolveType(all, id);
  if (!card) throw new Error(`type "${id}" not found in ${dir} nor in scripts/lm_fixture_*.json (known: ${Object.keys(all).join(', ')})`);
  return card;
}

// ───────────── resolution bases (review 19 Nov 2026, gap 10) ─────────────
/** Round-1 params-trainer.json: repo layout first (docs/research/01-flight-physics/), then $AIRFIELDLAB_R1_PARAMS,
 *  then the round-1 worktree of the research container (fallback only). */
export function r1ParamsCandidates() {
  return [path.join(HERE, '..', '..', '01-flight-physics', 'params-trainer.json'), process.env.AIRFIELDLAB_R1_PARAMS,
    '/home/user/r1/docs/research/01-flight-physics/params-trainer.json'].filter(Boolean);
}
/** Paths of the round-1 per-type list that are NOT trainer data (airliner engine classes and airliner control references). */
export const R1_NOT_TRAINER = ['turbofan.', 'controls.reference_types.'];
const _basesCache = new Map();
/**
 * Resolution bases: ids that `_inherits` may name although no topic block defines them.
 *  - every top-level id of scripts/lm_fixture_*.json (trainer_r1 = today's AC as a card, src R1:V19)
 *  - trainer_r1 additionally gets the round-1 per-type leaves of params-trainer.json (r1-pertype-paths.json list) except
 *    R1_NOT_TRAINER, src codes prefixed "R1:"; fixture leaves win where both exist (only aero.ref.S/b/c overlap, same values).
 * Returns { bases: {id: card}, info: {id: {from, leaves, fixtureLeaves, r1Leaves, r1File, note}} }. Cached per process.
 */
export function loadBases({ here = HERE, r1Params = null } = {}) {
  const key = here + '|' + (r1Params || '');
  if (_basesCache.has(key)) return _basesCache.get(key);
  const bases = {}, info = {};
  for (const f of fs.readdirSync(here).filter(f => /^lm_fixture_.*\.json$/.test(f)).sort()) {
    let o; try { o = JSON.parse(fs.readFileSync(path.join(here, f), 'utf8')); } catch { continue; }
    for (const k of Object.keys(o)) if (!k.startsWith('_') && !(k in bases)) {
      bases[k] = o[k];
      info[k] = { from: `scripts/${f}`, fixtureLeaves: leafPaths(o[k]).length, r1Leaves: 0, r1File: null };
    }
  }
  if (bases.trainer_r1) {
    const pf = [r1Params, ...r1ParamsCandidates()].filter(Boolean).find(f => fs.existsSync(f));
    const lf = defaultR1Paths().find(f => fs.existsSync(f));
    if (pf && lf) {
      const P = JSON.parse(fs.readFileSync(pf, 'utf8')), list = JSON.parse(fs.readFileSync(lf, 'utf8'));
      const tree = {}; let n = 0;
      for (const p of Object.keys(list)) {
        if (R1_NOT_TRAINER.some(x => p.startsWith(x))) continue;
        const l = leaf(P, p); if (!l) continue;
        const ks = p.split('.'); let o = tree;
        for (let i = 0; i < ks.length - 1; i++) o = o[ks[i]] ??= {};
        o[ks[ks.length - 1]] = { ...l, src: (l.src || []).map(s => (/^R1:/.test(s) ? s : 'R1:' + s)) }; n++;
      }
      bases.trainer_r1 = deepMerge(tree, bases.trainer_r1);
      const rel = path.relative(path.join(here, '..'), pf).split(path.sep).join('/');
      Object.assign(info.trainer_r1, { r1Leaves: n, r1File: rel, from: `${info.trainer_r1.from} + ${pf.startsWith('/home/user/r1/') ? 'round-1 worktree' : rel} (round-1 per-type leaves except ${R1_NOT_TRAINER.map(x => x + '*').join(', ')})` });
    } else info.trainer_r1.note = 'round-1 params-trainer.json not found: trainer_r1 = fixture only (AC fields)';
    info.trainer_r1.leaves = leafPaths(bases.trainer_r1).length;
  }
  for (const k of Object.keys(info)) info[k].leaves ??= leafPaths(bases[k]).length;
  const out = { bases, info };
  _basesCache.set(key, out);
  return out;
}

// ───────────── card helpers shared by the tools (19 Nov 2026) ─────────────
/**
 * airframe.weights.training_mass (D3): v is a number (kg) or {kg, empty_kg, crew_kg, fuel_kg[, fuel_l]}.
 * Older object keys are still read: mass_kg/total for kg, BEW for empty_kg, crew for crew_kg, fuel for fuel_kg.
 * Returns {kg, empty_kg, crew_kg, fuel_kg, fuel_l, form: 'number'|'object', keys} or null.
 */
export function trainingMass(card) {
  const v = val(card, 'airframe.weights.training_mass');
  if (typeof v === 'number' && Number.isFinite(v)) return { kg: v, form: 'number', keys: [] };
  if (!isObj(v)) return null;
  const num = (...xs) => xs.find(x => typeof x === 'number' && Number.isFinite(x));
  const kg = num(v.kg, v.mass_kg, v.total);
  if (kg === undefined) return null;
  return { kg, empty_kg: num(v.empty_kg, v.BEW), crew_kg: num(v.crew_kg, v.crew), fuel_kg: num(v.fuel_kg, v.fuel), fuel_l: num(v.fuel_l), form: 'object', keys: Object.keys(v) };
}
/** kg of training_mass (number or object), else undefined. */
export const trainingMassKg = card => trainingMass(card)?.kg;

/** IAS -> CAS (kt) for a detent name, from speeds.ias_cas; identity when absent. Returns {f, inv, has}.
 *  (moved from lm_card 19 Nov 2026; lm_card re-exports it). Unknown detent name: the first row, as before. */
export function iasCas(card, detName) {
  const t = val(card, 'speeds.ias_cas');
  const lin = (xs, ys, x) => { let i = 0; while (i < xs.length - 2 && x > xs[i + 1]) i++; const t2 = (x - xs[i]) / (xs[i + 1] - xs[i]); return ys[i] + t2 * (ys[i + 1] - ys[i]); };
  let pairs = null;
  if (isObj(t) && t.axes && Array.isArray(t.data)) {
    const fl = (t.axes.flap || t.axes.flaps || []).map(String), ki = t.axes.KIAS || t.axes.kias || t.axes.ias;
    let j = fl.indexOf(String(detName)); if (j < 0) j = 0;
    const row = Array.isArray(t.data[0]) ? t.data[j] : t.data;
    pairs = ki.map((k, i) => [k, row[i]]);
  } else if (isObj(t)) {
    const keys = Object.keys(t); const k = keys.includes(String(detName)) ? String(detName) : keys[0];
    if (Array.isArray(t[k])) pairs = t[k];
  }
  if (!pairs || pairs.length < 2) return { has: false, f: x => x, inv: x => x };
  pairs = pairs.slice().sort((a, b) => a[0] - b[0]);
  const xs = pairs.map(p => p[0]), ys = pairs.map(p => p[1]);
  return { has: true, f: x => lin(xs, ys, x), inv: y => lin(ys, xs, y) };
}
/** Name of the landing (largest) flap detent of a card: aero.flaps.detents, else the last flap row of speeds.ias_cas. */
export function landingDetent(card) {
  const d = val(card, 'aero.flaps.detents');
  if (Array.isArray(d) && d.length) return String(d.slice().sort((a, b) => (+a.flap_deg || 0) - (+b.flap_deg || 0)).pop().name);
  const t = val(card, 'speeds.ias_cas');
  if (isObj(t) && t.axes) { const fl = t.axes.flap || t.axes.flaps; if (Array.isArray(fl) && fl.length) return String(fl[fl.length - 1]); }
  if (isObj(t)) { const ks = Object.keys(t).filter(k => Array.isArray(t[k])); if (ks.length) return ks[ks.length - 1]; }
  return null;
}
/** A speed leaf (or a raw kt value with its unit) converted to kt CAS at a detent: {cas, ias, unit, converted, raw}. */
export function speedAs(card, kt, unit, det) {
  if (typeof kt !== 'number' || !Number.isFinite(kt)) return null;
  const tab = iasCas(card, det ?? landingDetent(card));
  const isIAS = /IAS/i.test(unit || ''), isCAS = /CAS/i.test(unit || '');
  return { raw: kt, unit: isIAS ? 'IAS' : isCAS ? 'CAS' : '?', cas: isIAS ? tab.f(kt) : kt, ias: isCAS ? tab.inv(kt) : kt, table: tab.has };
}

/** Make a leaf. */
export function mkLeaf(v, u, src, { scope = 'sim', conf = 'กลาง', est = false, note = '' } = {}) {
  return { v, u, scope, src, conf, est, note };
}

/** true when the module at metaUrl is the script node was started with (symlink-safe: compares real paths). */
export function isMainModule(metaUrl) {
  try { return !!process.argv[1] && fs.realpathSync(path.resolve(process.argv[1])) === fs.realpathSync(fileURLToPath(metaUrl)); } catch { return false; }
}

// ───────────── validate(): consistency checks (review 19 Nov 2026, gaps 0, 1, 15, 19, 20, 27; decisions D1, D3, D4, D6) ─────────────
/** D4: expected scope by the first path segment of a per-type leaf. Other categories (interference, wind, input,
 *  numerics) keep the scope that round 1 gives the same path in r1-pertype-paths.json; propulsion.* is not checked. */
export const SCOPE_BY_CAT = {
  gear: 'gear', piston: 'engine', turboprop: 'engine', turbofan: 'engine', engine: 'engine', propeller: 'propeller',
  airframe: 'aircraft', aero: 'aircraft', speeds: 'aircraft', performance: 'aircraft', controls: 'aircraft', ops: 'aircraft',
  procedures: 'aircraft', validation: 'aircraft', otherSims: 'aircraft',
};
export function expectedScope(ps, r1 = null) {
  const cat = ps.split('.')[0];
  if (cat.startsWith('_')) return null;
  return SCOPE_BY_CAT[cat] ?? r1?.[ps]?.scope ?? null;
}
const EST_NEGATED = /(ไม่ใช่|ไม่ได้เป็น|ไม่เป็น|ไม่ได้ใช้|ไม่มี)\s*ค่าประมาณ/g;
/** a 08/09 note that explicitly marks a mass-corrected speed (the only accepted reason for differing from the card's VAPP) */
export const MASS_CORRECTED = /แก้มวล|แก้ตามมวล|mass[- ]corrected/i;
export const CHECK_NAMES = {
  scope: 'scope ตามหมวด (D4)', est: 'est กับคำว่า "ค่าประมาณ" ใน note', est_conf: 'est:true แต่ conf สูง',
  training_mass: 'รูปแบบ training_mass (D3)', speeds: 'มี speeds.VREF_kt / VAPP_kt (D1)', vapp_vref: 'VAPP ≥ VREF (D1)',
  xfile_vapp: 'Vapp ของ 08/09 = speeds.VAPP_kt ของบัตร ±0.5 kt (D1)', detent: 'ชื่อ detent ใน 08/09 = ชื่อในบัตร (D6)',
};

/**
 * Checks on a mergeDir result. Returns [{level: 'warn'|'info', id, check, msg, where}]. 'warn' becomes an ERROR with
 * {strict: true} (lm_merge --strict). Leaf checks (scope, est, est_conf) look at each block as written; card checks
 * (training_mass, speeds, vapp_vref, xfile_vapp, detent) look at the resolved card of every id (variants included),
 * so a value inherited from the parent is checked against the variant's own speeds.
 */
export function validate(res, { r1 = null, pool = null, bases = {}, only = null } = {}) {
  const out = [];
  const add = (level, id, check, msg, where = '') => out.push({ level, id, check, msg, where });
  const merged = res.merged, origin = res.origin || {};
  pool = pool ?? merged;
  // leaf checks
  for (const id of Object.keys(merged)) {
    (function rec(o, p) {
      if (isLeaf(o)) {
        const ps = p.join('.'), where = origin[`${id}.${ps}`] || '';
        if (ps.startsWith('_')) return;
        if (id === 'common_light') { if (!['environment', 'sim'].includes(o.scope)) add('warn', id, 'scope', `${ps}: scope "${o.scope}" → common_light ใช้ "environment" หรือ "sim"`, where); }
        else { const exp = expectedScope(ps, r1); if (exp && o.scope !== exp) add('warn', id, 'scope', `${ps}: scope "${o.scope}" → "${exp}"`, where); }
        const note = typeof o.note === 'string' ? o.note : '';
        if (o.est === true && !/ประมาณ/.test(note)) add('warn', id, 'est', `${ps}: est:true แต่ note ไม่มีคำว่า "ประมาณ" (ต้องบอกว่าเป็นค่าประมาณและวิธีคิด)`, where);
        if (o.est === false && /ค่าประมาณ/.test(note.replace(EST_NEGATED, ''))) add('warn', id, 'est', `${ps}: est:false แต่ note บอก "ค่าประมาณ" (ตั้ง est:true หรือแก้ note)`, where);
        if (o.est === true && o.conf === 'สูง') add('warn', id, 'est_conf', `${ps}: est:true กับ conf "สูง" (ค่าประมาณใช้ "กลาง" หรือ "ต่ำ")`, where);
        return;
      }
      if (isObj(o)) for (const k of Object.keys(o)) rec(o[k], [...p, k]);
    })(merged[id], []);
  }
  // card checks on resolved cards
  const whereOf = (id, ps) => { let x = id; const seen = new Set(); while (x && !seen.has(x)) { seen.add(x); if (origin[`${x}.${ps}`]) return origin[`${x}.${ps}`] + (x === id ? '' : ` (รับจาก ${x})`); if (leaf(pool[x], ps)) return x === id ? '' : `(รับจาก ${x})`; x = pool[x]?._inherits?.v; } return ''; };
  for (const id of Object.keys(merged)) {
    if (id === 'common_light' || (only && id !== only)) continue;
    let card; try { card = resolveType(pool, id, new Set(), bases); } catch (e) { add('warn', id, 'speeds', `resolve: ${e.message}`); continue; }
    if (!card) continue;
    const naAll = (val(card, '_na') || []).map(String).includes('*');
    // D3 training_mass (own block only: a variant that inherits the parent's leaf is checked under the parent)
    const tmLeaf = leaf(merged[id], 'airframe.weights.training_mass');
    if (tmLeaf) {
      const w = whereOf(id, 'airframe.weights.training_mass'), tm = trainingMass(merged[id]);
      if (typeof tmLeaf.v === 'number') add('warn', id, 'training_mass', `airframe.weights.training_mass เป็นตัวเลข ${tmLeaf.v} (D3: ใช้ {kg, empty_kg, crew_kg, fuel_kg})`, w);
      else if (!tm) add('warn', id, 'training_mass', 'airframe.weights.training_mass ไม่มี kg ที่เป็นตัวเลข', w);
      else {
        const missing = ['kg', 'empty_kg', 'crew_kg', 'fuel_kg'].filter(k => typeof tmLeaf.v[k] !== 'number');
        const legacy = Object.keys(tmLeaf.v).filter(k => !['kg', 'empty_kg', 'crew_kg', 'fuel_kg', 'fuel_l'].includes(k));
        if (missing.length || legacy.length) add('warn', id, 'training_mass', `training_mass ขาด ${missing.join(', ') || '–'}; คีย์นอก D3 ${legacy.join(', ') || '–'}`, w);
        if ([tm.empty_kg, tm.crew_kg, tm.fuel_kg].every(x => typeof x === 'number') && Math.abs(tm.kg - tm.empty_kg - tm.crew_kg - tm.fuel_kg) > 2)
          add('warn', id, 'training_mass', `kg ${tm.kg} ≠ empty_kg + crew_kg + fuel_kg = ${+(tm.empty_kg + tm.crew_kg + tm.fuel_kg).toFixed(1)}`, w);
        const bew = val(card, 'airframe.weights.BEW_typical');
        if (typeof bew === 'number' && typeof tm.empty_kg === 'number' && Math.abs(bew - tm.empty_kg) > 1 && !/BEW_typical/.test(tmLeaf.note || ''))
          add('warn', id, 'training_mass', `empty_kg ${tm.empty_kg} ≠ BEW_typical ${bew} และ note ไม่อธิบาย (ให้ note อ้าง BEW_typical)`, w);
      }
    }
    if (naAll) continue;   // D5: open-model-only id (no card)
    // D1 speeds
    const vref = leaf(card, 'speeds.VREF_kt'), vapp = leaf(card, 'speeds.VAPP_kt');
    const okNum = l => l && typeof l.v === 'number' && Number.isFinite(l.v);
    if (!okNum(vref) || !okNum(vapp)) add('warn', id, 'speeds', `ไม่มี ${[!okNum(vref) && 'speeds.VREF_kt', !okNum(vapp) && 'speeds.VAPP_kt'].filter(Boolean).join(' และ ')} ที่เป็นตัวเลข (D1: บัตรเป็นเจ้าของ)`);
    const det = landingDetent(card);
    const A = okNum(vapp) ? speedAs(card, vapp.v, vapp.u, det) : null, R = okNum(vref) ? speedAs(card, vref.v, vref.u, det) : null;
    if (A && R && A.cas < R.cas - 0.05) add('warn', id, 'vapp_vref', `VAPP ${vapp.v} ${vapp.u} (${A.cas.toFixed(1)} KCAS) < VREF ${vref.v} ${vref.u} (${R.cas.toFixed(1)} KCAS)`, whereOf(id, 'speeds.VAPP_kt') || whereOf(id, 'speeds.VREF_kt'));
    if (A && R && A.unit !== R.unit && !A.table) add('info', id, 'vapp_vref', `VAPP (${vapp.u}) กับ VREF (${vref.u}) ต่างหน่วยและไม่มี speeds.ias_cas: เทียบตรง ๆ`);
    // D1 cross-file: 08 ops.attitude_power.final.ias_kt and 09 procedures.stabilised.Vapp quote the card's VAPP
    if (A) {
      const tmKg = trainingMassKg(card);
      const quote = (ps, raw, unit, note, lp) => {
        let v = raw, key = '';
        if (isObj(raw)) {   // mass-keyed {"1180": 70, ...}: the entry at the card's training mass, else the nearest
          const ks = Object.keys(raw).filter(k => typeof raw[k] === 'number' && !Number.isNaN(+k));
          if (!ks.length) return;
          key = typeof tmKg === 'number' ? ks.reduce((a, b) => (Math.abs(+b - tmKg) < Math.abs(+a - tmKg) ? b : a)) : ks[ks.length - 1];
          v = raw[key];
        }
        if (typeof v !== 'number') return;
        const q = speedAs(card, v, unit, det);
        const diff = /CAS/.test(q.unit) ? q.cas - A.cas : q.ias - A.ias;
        if (Math.abs(diff) <= 0.5) return;
        const msg = `${ps} = ${v} ${unit}${key ? ` (คีย์มวล ${key})` : ''} แต่ speeds.VAPP_kt = ${vapp.v} ${vapp.u}${A.unit !== q.unit ? ` (= ${(q.unit === 'CAS' ? A.cas : A.ias).toFixed(1)} K${q.unit})` : ''}: ต่าง ${diff > 0 ? '+' : ''}${diff.toFixed(1)} kt`;
        add(MASS_CORRECTED.test(note || '') ? 'info' : 'warn', id, 'xfile_vapp', msg + (MASS_CORRECTED.test(note || '') ? ' (note บอกว่าแก้มวล)' : ''), whereOf(id, lp));
      };
      const fin = leaf(card, 'ops.attitude_power.final');
      if (fin && isObj(fin.v)) quote('ops.attitude_power.final.ias_kt', fin.v.ias_kt, /CAS/i.test(String(fin.u).split(',')[0]) ? 'kt CAS' : 'kt IAS', fin.note, 'ops.attitude_power.final');
      const st = leaf(card, 'procedures.stabilised');
      if (st && isObj(st.v)) quote('procedures.stabilised.Vapp', st.v.Vapp, st.u || 'kt IAS', st.note, 'procedures.stabilised');
    }
    // D6 flap detent names used by 08 and 09
    const dets = val(card, 'aero.flaps.detents');
    if (Array.isArray(dets) && dets.length) {
      const names = new Set(dets.map(d => String(d.name)));
      const chk = (ps, x) => { if (x == null || x === '-' || x === '') return; if (!names.has(String(x))) add('warn', id, 'detent', `${ps} = "${x}" ไม่ใช่ชื่อ detent ของบัตร (${[...names].join('/')})`, whereOf(id, ps.split('.v.')[0])); };
      const ap = isObj(card.ops?.attitude_power) ? card.ops.attitude_power : {};
      for (const ph of Object.keys(ap)) if (isLeaf(ap[ph]) && isObj(ap[ph].v)) chk(`ops.attitude_power.${ph}.v.flap`, ap[ph].v.flap);
      const pv = n => { const l = leaf(card, 'procedures.' + n); return l && isObj(l.v) ? l.v : null; };
      const st = pv('stabilised'); if (st && Array.isArray(st.landingFlaps)) st.landingFlaps.forEach(x => chk('procedures.stabilised.v.landingFlaps', x));
      const pa = pv('pattern'); if (pa && isObj(pa.flapsAt)) for (const [k, x] of Object.entries(pa.flapsAt)) chk(`procedures.pattern.v.flapsAt.${k}`, x);
      for (const n of ['short_field', 'soft_field']) { const s = pv(n); if (s) for (const ph of ['takeoff', 'landing']) if (isObj(s[ph])) chk(`procedures.${n}.v.${ph}.flaps`, s[ph].flaps); }
      const ga = pv('go_around'); if (ga && Array.isArray(ga.flapsSeq)) ga.flapsSeq.forEach(x => chk('procedures.go_around.v.flapsSeq', x));
    }
  }
  return out;
}

/** Per-type summary of validate() findings: {id: {check: n}} (warn only unless withInfo). */
export function checkSummary(checks, withInfo = false) {
  const s = {};
  for (const c of checks) if (withInfo || c.level === 'warn') { const t = s[c.id] ??= {}; t[c.check] = (t[c.check] || 0) + 1; }
  return s;
}
