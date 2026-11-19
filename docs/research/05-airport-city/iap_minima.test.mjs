// Prototype tests T-U01..T-U08 for aip_vtbd_iap_minima.json (round 5 update, 18 NOV 2026).
// Run: node docs/research/05-airport-city/iap_minima.test.mjs   (Node >= 18, no dependencies)
import { readFileSync } from 'node:fs';

const d = JSON.parse(readFileSync(new URL('./aip_vtbd_iap_minima.json', import.meta.url), 'utf8'));
let fail = 0;
const ok = (id, cond, msg) => { console.log(`${cond ? 'PASS' : 'FAIL'} ${id} ${msg}`); if (!cond) fail++; };
const FT_PER_NM = 1852 / 0.3048;
const all = (a) => Object.entries(a.minima).flatMap(([k, rows]) => rows.map((r) => ({ k, ...r })));

// T-U01: 13 approaches, one per IAC chart in AD 2.24, unique ids and charts
ok('T-U01', d.approaches.length === 13 && new Set(d.approaches.map((a) => a.chart)).size === 13
  && new Set(d.approaches.map((a) => a.id)).size === 13, `${d.approaches.length} approaches`);

// T-U02: OCA - OCH equals the threshold elevation (straight-in) or aerodrome elevation 9 ft (VOR, circling)
let bad = [];
for (const a of d.approaches) for (const r of all(a)) {
  const diff = r.v[0] - r.v[1];
  const allowed = [d.meta.thr_elev_ft[a.rwy], d.meta.ad_elev_ft];
  if (!allowed.includes(diff)) bad.push(`${a.id}.${r.k}:${diff}`);
}
ok('T-U02', bad.length === 0, bad.length ? bad.join(' ') : 'all OCA-OCH pairs consistent');

// T-U03: every category A-D covered exactly once in each minima line
bad = [];
for (const a of d.approaches) for (const [k, rows] of Object.entries(a.minima)) {
  const cats = rows.map((r) => r.cats).join('');
  if ([...cats].sort().join('') !== 'ABCD') bad.push(`${a.id}.${k}:${cats}`);
}
ok('T-U03', bad.length === 0, bad.length ? bad.join(' ') : 'A-D covered once per line');

// T-U04: ordering: CAT II < CAT I < LOC; LNAV/VNAV <= LNAV; straight-in <= circling
const min = (rows) => Math.min(...rows.map((r) => r.v[0]));
bad = [];
for (const a of d.approaches) {
  const m = a.minima;
  if (m.cat_ii && !(min(m.cat_ii) < min(m.cat_i))) bad.push(`${a.id} catII`);
  if (m.loc && !(min(m.cat_i) < min(m.loc))) bad.push(`${a.id} loc`);
  if (m.lnav_vnav && !(min(m.lnav_vnav) <= min(m.lnav))) bad.push(`${a.id} lnav`);
  const si = m.cat_i || m.lnav_vnav || m.straight_in;
  if (!(min(si) <= min(m.circling))) bad.push(`${a.id} circling`);
}
ok('T-U04', bad.length === 0, bad.length ? bad.join(' ') : 'minima ordering holds');

// T-U05: FAF altitude lies on the published 3 deg path: h = THR + RDH/TCH + d * tan(3 deg)
bad = [];
for (const a of d.approaches.filter((x) => x.kind !== 'VOR' && x.faf.dist_thr_nm)) {
  const ref = a.rdh_ft ?? a.tch_ft;
  const h = d.meta.thr_elev_ft[a.rwy] + ref + a.faf.dist_thr_nm * FT_PER_NM * Math.tan(3 * Math.PI / 180);
  if (Math.abs(h - a.faf.alt_ft) > 50) bad.push(`${a.id}:${h.toFixed(0)}vs${a.faf.alt_ft}`);
}
ok('T-U05', bad.length === 0, bad.length ? bad.join(' ') : 'FAF heights within 50 ft of the 3 deg path');

// T-U06: CAT II only on 21R; LVP excludes 21L
const cat2 = d.approaches.filter((a) => a.minima.cat_ii).map((a) => a.rwy);
ok('T-U06', cat2.length === 2 && cat2.every((r) => r === '21R') && /not permitted/.test(d.ad2_20.lvp.rwy_21L), `CAT II on ${cat2.join(',')}`);

// T-U07: AD 2.20 has 16 items and hot spots HS1-HS6
ok('T-U07', d.ad2_20.items === 16 && d.ad2_20.titles.length === 16 && d.ad2_20.hot_spots.join() === 'HS1,HS2,HS3,HS4,HS5,HS6', '16 items, HS1-HS6');

// T-U08: simulator DA defaults equal the published OCA of the named approach (category C)
bad = [];
for (const [rwy, e] of Object.entries(d.evaluator_da_default)) {
  if (rwy === 'note') continue;
  const a = d.approaches.find((x) => x.id === e.approach);
  const line = a.minima.cat_i || a.minima.lnav_vnav;
  const c = line.find((r) => r.cats.includes('C'));
  if (!c || c.v[0] !== e.da_ft || c.v[1] !== e.dh_ft || a.rwy !== rwy) bad.push(rwy);
}
ok('T-U08', bad.length === 0, bad.length ? bad.join(' ') : 'DA defaults match charts');

console.log(fail ? `${fail} failed` : 'all passed');
process.exit(fail ? 1 : 0);
