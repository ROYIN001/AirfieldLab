#!/usr/bin/env node
// Round 2 (light aircraft): extract the ```json data blocks from the topic files, check the leaf
// format, deep-merge them by type id, report path conflicts and round-1 coverage, and write
// params-light.json. Pure Node >= 18, no dependencies. The logic lives in lm_lib.mjs (mergeDir).
//
// usage:  node lm_merge.mjs [--dir <folder with topic .md files>] [--out <file>] [--type <id>]
//                           [--coverage] [--schema <file.md>] [--quiet] [--dry] [--r1 <paths.json>]
// A data block is a ```json fence whose object has exactly ONE top-level key: a type id
// (c172s, da40ng, ...) or common_light. Blocks with more than one top-level key are treated as
// examples and skipped. A leaf is an object with "v" and "scope".
import fs from 'node:fs';
import path from 'node:path';
import { HERE, mergeDir, paramsObject, isObj, isLeaf } from './lm_lib.mjs';

const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
const flag = k => args.includes(k);
const DIR = path.resolve(opt('--dir', path.join(HERE, '..')));
const OUT = opt('--out', path.join(DIR, 'params-light.json'));
const ONLY = opt('--type', null);
const QUIET = flag('--quiet');
const R1 = opt('--r1', null);

const res = mergeDir(DIR, { only: ONLY, r1: R1 });
const { merged, errors, warnings, conflicts, coverage, stats, files, nBlocks, nExamples, nBad } = res;

if (!ONLY && !flag('--dry')) fs.writeFileSync(OUT, JSON.stringify(paramsObject(res), null, 1) + '\n');

// ---- optional schema table ----
const schemaOut = opt('--schema', null);
if (schemaOut) {
  const rows = [];
  const fmt = v => { let s = JSON.stringify(v); if (s.length > 70) s = s.slice(0, 67) + '…'; return s.replace(/\|/g, '\\|'); };
  const srcs = s => (Array.isArray(s) ? s : s == null ? [] : [String(s)]).join(', ');   // tolerate a malformed src (reported as ERROR)
  for (const id of Object.keys(merged)) {
    rows.push(`\n## \`${id}\`\n\n| path | หน่วย | scope | ค่า | ค่าประมาณ | ความเชื่อมั่น | แหล่ง |\n|---|---|---|---|---|---|---|`);
    (function rec(o, p) {
      if (isLeaf(o)) { rows.push(`| \`${p.join('.')}\` | ${String(o.u).replace(/\|/g, '/')} | ${o.scope} | ${fmt(o.v)} | ${o.est ? 'ใช่' : '–'} | ${o.conf} | ${srcs(o.src)} |`); return; }
      if (isObj(o)) for (const k of Object.keys(o)) rec(o[k], [...p, k]);
    })(merged[id], []);
  }
  fs.writeFileSync(schemaOut, rows.join('\n') + '\n');
}

// ---- report ----
const say = (...a) => { if (!QUIET) console.log(...a); };
say(`files: ${files.length}, data blocks: ${nBlocks}, example blocks skipped: ${nExamples}, unparsable: ${nBad}`);
for (const [id, s] of Object.entries(stats)) say(`${id}: ${s.leaves} leaves (est ${s.est}) byCat ${JSON.stringify(s.byCat)} byConf ${JSON.stringify(s.byConf)}`);
for (const [id, c] of Object.entries(coverage)) {
  say(`coverage ${id}: round-1 per-type ${c.r1}, filled ${c.filled}, _na ${c.na}, missing ${c.missing.length}`);
  if (flag('--coverage')) for (const p of c.missing) say(`   missing ${p}`);
}
if (conflicts.length) { say(`\nCONFLICTS (${conflicts.length}):`); conflicts.forEach(c => say('  ' + c)); }
if (errors.length) { say(`\nERRORS (${errors.length}):`); errors.slice(0, 200).forEach(e => say('  ' + e)); }
if (warnings.length) { say(`\nwarnings (${warnings.length}):`); warnings.slice(0, 120).forEach(w => say('  ' + w)); }
process.exitCode = errors.length || conflicts.length ? 1 : 0;
