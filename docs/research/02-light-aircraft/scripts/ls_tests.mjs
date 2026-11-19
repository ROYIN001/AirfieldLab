#!/usr/bin/env node
// Round 2 / topic 02 (LS): data checks T-LS-01 … T-LS-09 and T-LS-13 on the common_light.thai_fleet block of
// ../02-thai-schools.md (or a merged params file via --params <file>). Prints the measured value, the expected
// value and PASS/FAIL. Expected values come from scripts/ls_fleet.mjs run on the CAAT register of 9 Jul 2026 [LS1].
// Node >= 18, no dependencies. usage: node scripts/ls_tests.mjs [--params params-light.json]
import fs from 'node:fs';

const HERE = new URL('.', import.meta.url);
const args = process.argv.slice(2);
const pi = args.indexOf('--params');
let fleet;
if (pi >= 0) fleet = JSON.parse(fs.readFileSync(args[pi + 1], 'utf8')).common_light.thai_fleet;
else {
  const md = fs.readFileSync(new URL('../02-thai-schools.md', HERE), 'utf8');
  const b = [...md.matchAll(/```json\n([\s\S]*?)\n```/g)].map(m => JSON.parse(m[1])).find(o => o.common_light?.thai_fleet);
  fleet = b.common_light.thai_fleet;
}
const schools = Object.entries(fleet).filter(([k]) => k !== 'summary').map(([k, l]) => ({ k, ...l.v, leaf: l }));
const ato = schools.filter(s => s.kind.startsWith('ato'));
const sumType = (list, id) => list.reduce((a, s) => a + (s.types[id] || 0), 0);
const atoTotal = ato.reduce((a, s) => a + s.total, 0);
const allTypes = [...new Set(ato.flatMap(s => Object.keys(s.types)))];
const results = [];
const T = (id, what, got, exp, ok) => results.push({ id, what, got, exp, ok });
const near = (a, b, tol) => Math.abs(a - b) <= tol;
const pct = (a, b) => Math.round(1000 * a / b) / 10;

// T-LS-01 total ATO fleet and number of ATOs with aircraft
T('T-LS-01', 'ATO aircraft / ATOs', `${atoTotal} / ${ato.length}`, '78 / 9', atoTotal === 78 && ato.length === 9);
// T-LS-02 every leaf: sum(types) == total
const bad = schools.filter(s => Object.values(s.types).reduce((a, b) => a + b, 0) !== s.total).map(s => s.k);
T('T-LS-02', 'sum(types) == total for every leaf', bad.length ? bad.join(',') : 'all', 'all', bad.length === 0);
// T-LS-03 default Thai type = most numerous ATO type
const ranked = allTypes.map(id => [id, sumType(ato, id)]).sort((a, b) => b[1] - a[1]);
T('T-LS-03', 'most numerous ATO type (count, % of ATO fleet)', `${ranked[0][0]} ${ranked[0][1]} (${pct(ranked[0][1], atoTotal)}%)`, 'c172s 34 (43.6%)',
  ranked[0][0] === 'c172s' && ranked[0][1] === 34 && fleet.summary.v.default_thai_type === 'c172s');
// T-LS-04 DA40 variants at civil ATOs
const d40 = [sumType(ato, 'da40d'), sumType(ato, 'da40_180'), sumType(ato, 'da40ng')];
T('T-LS-04', 'DA40 D / DA40 (IO-360) / DA40 NG at ATOs', d40.join(' / '), '9 / 7 / 0', d40.join() === '9,7,0');
// T-LS-05 DA42 variants, Wuhu-built NG, number of ATOs with a DA42
const d42 = [sumType(ato, 'da42_tae125'), sumType(ato, 'da42ng'), fleet.summary.v.da42_ato.da42ng_wuhu, ato.filter(s => s.types.da42_tae125 || s.types.da42ng).length];
T('T-LS-05', 'DA42 TAE125 / NG / NG Wuhu / ATOs with DA42', d42.join(' / '), '5 / 5 / 3 / 4', d42.join() === '5,5,3,4');
// T-LS-06 base airfields: ICAO format, none at VTBD, expected set
const bases = schools.map(s => s.base_icao).filter(Boolean);
const fmt = bases.every(b => /^VT[A-Z]{2}$/.test(b));
const set = [...new Set(bases)].sort().join(',');
T('T-LS-06', 'base_icao format / VTBD absent / set', `${fmt} / ${!bases.includes('VTBD')} / ${set}`, 'true / true / VTPH,VTPO,VTPP,VTSE,VTUQ,VTUV,VTUW',
  fmt && !bases.includes('VTBD') && set === 'VTPH,VTPO,VTPP,VTSE,VTUQ,VTUV,VTUW');
// T-LS-07 military content is generic: no unit/academy/service words in the military leaf, no service name anywhere
const milText = JSON.stringify(fleet.military_generic);
const forbidMil = /squadron|\bwing\b|academy|school|กองบิน|ฝูงบิน|โรงเรียนการบิน|นายเรืออากาศ|กองทัพอากาศ|air force/i;
const forbidAll = /royal thai|กองทัพอากาศ|air force/i;
const hits = (forbidMil.test(milText) ? 1 : 0) + (forbidAll.test(JSON.stringify(fleet)) ? 1 : 0);
T('T-LS-07', 'forbidden military terms (military leaf + whole block)', hits, 0, hits === 0);
// T-LS-08 ranking of extra types
const r = fleet.summary.v.ranking_extra;
T('T-LS-08', 'ranking_extra[0..1], others P3', `${r[0]}, ${r[1]}, P3 rest: ${r.slice(2).every(x => x.endsWith(':P3'))}`, 'c172r:P1, c152:P2, P3 rest: true',
  r[0] === 'c172r:P1' && r[1] === 'c152:P2' && r.slice(2).every(x => x.endsWith(':P3')));
// T-LS-09 C172 family share of ATO fleet and C172S share of C172
// gap 21 (19 Nov 2026): 172M/N/P are counted under the card id c172r (variant note), so the family is c172s + c172r
const C172_IDS = ['c172s', 'c172r'];
const c172 = C172_IDS.reduce((a, id) => a + sumType(ato, id), 0);
const sh = [pct(c172, atoTotal), pct(sumType(ato, 'c172s'), c172)];
// number of ATOs flying any C172 variant / a C172S (added by the reviewer, 19 Nov 2026: §02.0 had said 6 for the whole family)
const nFam = ato.filter(s => C172_IDS.some(id => s.types[id])).length;
const nS = ato.filter(s => s.types.c172s).length;
const sv = fleet.summary.v;
T('T-LS-09', 'C172 % of ATO fleet / C172S % of C172 / ATOs with C172 / ATOs with C172S', `${sh.join(' / ')} / ${nFam} / ${nS}`, '56.4 / 77.3 (±0.1) / 7 / 6',
  near(sh[0], 56.4, 0.1) && near(sh[1], 77.3, 0.1) && nFam === 7 && nS === 6 && sv.c172_family_ato_schools === nFam && sv.c172s_ato_schools === nS);

// T-LS-13 (gap 21, 19 Nov 2026): every key of `types` (schools, clubs and the military leaf) is a type id that has a data card
// (schema-ext-r2 §3 and 13-other-trainers.md), and each `variants` row names an id of the same leaf with n <= types[id].
// With the topic folder present (scripts/../*.md) the ids are also checked against the merged cards (airframe.identity).
const CARD_IDS = new Set(['c172s', 'c172r', 'c152', 'da40ng', 'da40_180', 'da40d', 'da42ng', 'da42_tae125', 'da42_vi',
  'pc7mk2', 'pc9m', 't6a', 't6c', 'p2006t', 'pa28_161', 'be76', 'p2002jf', 'p68c', 't206h', 'ct4']);
const usedIds = [...new Set(schools.flatMap(s => Object.keys(s.types)))].sort();
const notCard = usedIds.filter(id => !CARD_IDS.has(id));
const badVar = schools.flatMap(s => (s.variants || []).filter(r => !(r.id in s.types) || r.n > s.types[r.id] || !r.variant).map(r => `${s.k}:${r.id}`));
let noIdentity = [];
try {
  const L = await import('./lm_lib.mjs');
  const res = L.mergeDir(new URL('..', HERE).pathname);
  const merged = res.merged || res;
  noIdentity = usedIds.filter(id => !merged[id] || !(merged[id].airframe?.identity));
} catch (e) { noIdentity = ['(merge failed: ' + e.message + ')']; }
T('T-LS-13', 'types ids that are not card ids / bad variants rows / ids without airframe.identity in the merged cards',
  `${notCard.join(',') || 'none'} / ${badVar.join(',') || 'none'} / ${noIdentity.join(',') || 'none'}`, 'none / none / none',
  notCard.length === 0 && badVar.length === 0 && noIdentity.length === 0);

for (const x of results) console.log(`${x.ok ? 'PASS' : 'FAIL'} ${x.id} ${x.what}: got ${x.got}, expected ${x.exp}`);
const nf = results.filter(x => !x.ok).length;
console.log(`${results.length - nf}/${results.length} passed`);
process.exitCode = nf ? 1 : 0;
