// The AIP watch, offline (plan item A10; research round 2 R2-09, round 5 R5-P3-7 and R5-S1-8). tools/watch/watch.mjs
// reads the eAIP over the network, so CI runs only its pure parts (tools/watch/lib.mjs) and the command line on
// synthetic pages with --from (test/fixtures/watch/aip/synth.mjs: the tag structure of the real pages, made-up words,
// the values of test/fixtures/aip_vtbd_current.json). The command runs with an empty PATH (no curl) and
// WATCH_OFFLINE=1, so no test can reach the network.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import * as L from '../tools/watch/lib.mjs';
import { makeSource } from '../tools/watch/net.mjs';
import { diffPreview, parseArgs } from '../tools/watch/watch.mjs';
import * as Y from './fixtures/watch/aip/synth.mjs';

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const FX = JSON.parse(fs.readFileSync(path.join(ROOT, 'test/fixtures/aip_vtbd_current.json'), 'utf8')).aip_vtbd_current;
const META = FX.meta, REPO = META.airac_effective, NEXT = (META.next_issues ?? []).map((n) => n.effective);
const clone = (o) => structuredClone(o);
const setPath = (o, p, v) => { const ks = p.replace(/\[(\d+)\]/g, '.$1').split('.'); let x = o; for (const k of ks.slice(0, -1)) x = x[k]; x[ks.at(-1)] = v; };
const ad2Of = (fx, opts) => L.splitAd2(Y.ad2Html(fx, opts));
const failing = (fx, page) => L.checkFacts(FX, L.splitAd2(page ?? Y.ad2Html(fx))).filter((r) => r.status === 'fail').map((r) => r.id).sort();

test('AIRAC cycle: 28 days from 29 OCT 2026; the fixture cycle, its checked issues and its recheck date are AIRAC dates', () => {
  for (const d of ['2026-10-29', '2026-11-26', '2026-12-24', '2027-01-21', '2026-01-22', '2020-01-02']) assert.ok(L.isAirac(d), d);
  for (const d of ['2026-11-25', '2026-11-27', '2027-01-20', 'x']) assert.ok(!L.isAirac(d), d);
  assert.equal(L.airacOnOrAfter('2026-11-26'), '2026-11-26');
  assert.equal(L.airacOnOrAfter('2026-11-27'), '2026-12-24');
  assert.equal(L.airacAfter('2026-12-24'), '2027-01-21');
  assert.deepEqual(L.airacDates('2026-12-25', 3), ['2027-01-21', '2027-02-18', '2027-03-18']);
  assert.equal(L.parseDMY('Effective 2 OCT 2025'), '2025-10-02');
  assert.equal(L.parseDMY('31 FEB 2026'), null);
  for (const d of [REPO, ...NEXT, META.recheck_before]) assert.ok(L.isAirac(d), `fixture date ${d}`);
  assert.equal(META.recheck_before, L.airacAfter(NEXT.at(-1) ?? REPO), 'recheck_before is the AIRAC after the newest checked issue');
  assert.equal(L.airacPublished('2026-12-24'), '2026-11-12', 'published 42 days ahead, as the eAIP index shows');
  assert.equal(L.airacPublished('2026-11-26'), '2026-10-15');
});

test('index parser: effective and publication dates, AMDT, NIL packages, status from the three tables', () => {
  const eds = [{ effective: '2026-11-26', published: '2026-10-15', amdt: '12/26', status: 'current' }, { effective: '2026-12-24', published: '2026-11-12', amdt: '13/26', status: 'next' },
    { effective: '2026-10-29', published: '2026-09-17', amdt: '11/26', status: 'expired' }, { effective: '2023-11-30', published: '2023-10-19', amdt: '10/23', status: 'expired', nil: true }];
  const r = L.parseIndex(Y.indexHtml(eds));
  assert.deepEqual(r.warnings, []);
  assert.deepEqual(r.editions.map((e) => [e.effective, e.published, e.amdt, e.status, e.nil, e.folder]), eds.map((e) => [e.effective, e.published, e.amdt, e.status, !!e.nil, `${e.effective}-AIRAC`]));
  assert.equal(L.editionUrl(r.editions[0].folder, 'ad2'), 'https://aip.caat.or.th/2026-11-26-AIRAC/html/eAIP/VT-AD-2.VTBD-en-GB.html');
  assert.deepEqual(L.parseIndex('<html><body>nothing</body></html>').editions, []);
});

test('cover, SUP and AIC list and item page parsers: ids, series, folders, absolute URLs, titles', () => {
  const ed = { effective: '2026-12-24', published: '2026-11-12', amdt: '13/26' };
  const items = [{ kind: 'sup', series: 'A', number: '36', year: '26', folder: '2026-12-24-AIRAC', airac: true, title: 'SYNTHETIC TEST AT EXAMPLE AIRPORT (VTZZ)' },
    { kind: 'sup', series: 'B', number: '07', year: '26', folder: '2026-11-23', title: 'SYNTHETIC WORKS AT DON MUEANG INTERNATIONAL AIRPORT (VTBD)' },
    { kind: 'aic', number: '09', year: '26', folder: '2026-10-16', title: 'SYNTHETIC HEALTH NOTICE' }];
  const c = L.parseCover(Y.coverHtml(ed, items), L.editionUrl('2026-12-24-AIRAC', 'cover'));
  assert.deepEqual([c.effective, c.published, c.amdt], ['2026-12-24', '2026-11-12', '13/26']);
  assert.deepEqual(c.items.map((i) => [i.kind, i.id, i.folder, i.airac]), [['sup', 'A36/26', '2026-12-24-AIRAC', true], ['sup', 'B07/26', '2026-11-23', false], ['aic', '09/26', '2026-10-16', false]]);
  assert.equal(c.items[1].url, 'https://aip.caat.or.th/2026-11-23/html/eSUP/VT-eSUP-26-07-B-en-GB.html');
  const s = L.parseItemList(Y.listHtml('sup', '2026-11-12', items.filter((i) => i.kind === 'sup')), L.editionUrl('2026-12-24-AIRAC', 'sups'), 'sup');
  assert.equal(s.asOf, '2026-11-12');
  assert.deepEqual(s.items.map((i) => [i.id, i.series, i.title, i.published, i.url]), [
    ['A36/26', 'A', items[0].title, '2026-11-12', 'https://aip.caat.or.th/2026-12-24-AIRAC/html/eSUP/VT-eSUP-26-36-A-en-GB.html'],
    ['B07/26', 'B', items[1].title, '2026-11-12', 'https://aip.caat.or.th/2026-11-23/html/eSUP/VT-eSUP-26-07-B-en-GB.html']]);
  const a = L.parseItemList(Y.listHtml('aic', '2026-11-12', items.filter((i) => i.kind === 'aic')), L.editionUrl('2026-12-24-AIRAC', 'aics'), 'aic');
  assert.deepEqual(a.items.map((i) => [i.kind, i.id, i.series, i.folder, i.title]), [['aic', '09/26', '', '2026-10-16', 'SYNTHETIC HEALTH NOTICE']]);
  // an entry without a link keeps its id from the text
  const nl = L.parseCover(Y.coverHtml(ed, items).replace('</ul>', '<li>AIRAC AIP SUP A42/26</li><li>AIC 5/26</li><li>synthetic other line</li></ul>'), L.editionUrl('2026-12-24-AIRAC', 'cover'));
  assert.deepEqual(nl.items.slice(3).map((i) => [i.kind, i.id, i.url, i.nolink, i.airac]), [['sup', 'A42/26', null, true, true], ['aic', '05/26', null, true, false]]);
  const nll = L.parseItemList(Y.listHtml('sup', '2026-11-12', items.filter((i) => i.kind === 'sup')).replace(/<a href="[^"]*VT-eSUP-26-07-B-en-GB.html">(<strong>[^<]*<\/strong>)<\/a>/, '$1'), L.editionUrl('2026-12-24-AIRAC', 'sups'), 'sup');
  assert.deepEqual(nll.items.map((i) => [i.id, i.url === null, i.title]), [['A36/26', false, items[0].title], ['B07/26', true, items[1].title]]);
  const p = L.parseItemPage('<html><head><title>SUP 36 26 SYNTHETIC TITLE - TEST</title><meta name="DC.date" content="2026-11-12"/><meta name="EM.effectiveDateStart" content="2026-12-24"/><meta name="EM.effectiveDateEnd" content="24 DEC 2027"/><meta name="EM.series" content="A"/></head></html>');
  assert.deepEqual([p.title, p.effective, p.until, p.series], ['SYNTHETIC TITLE - TEST', '2026-12-24', '2027-12-24', 'A']);
  assert.equal(L.parseItemPage('<title>AIC 01 26 X</title><meta name="EM.effectiveDateEnd" content="UFN"/>').until, 'UFN');
  assert.equal(L.parseItemPage('<title>AIC 02 22 X</title><meta name="EM.effectiveDateEnd" content="PERM"/>').until, 'PERM');
});

test('amendment list: names AD 2 VTBD and its sections, ignores other aerodromes', () => {
  const ed = { effective: '2026-10-29', amdt: '11/26' };
  const a = L.parseAmdt(Y.amdtHtml(ed, [2, 12, 24]));
  assert.deepEqual([a.effective, a.namesAd2, a.sections], ['2026-10-29', true, ['AD 2.2', 'AD 2.12', 'AD 2.24']]);
  const b = L.parseAmdt(Y.amdtHtml(ed, []));
  assert.deepEqual([b.namesAd2, b.sections, b.mentions], [false, [], 0]);
});

test('normalisation: amendment marks, hidden tokens, email obfuscation and the beacon are not content', () => {
  const h = `<div><p>135307.<ins class=" AmdtInsertedAIRAC" title="x">9</ins><del class=" AmdtDeletedAIRAC" title="x">01</del>N <span class="SD" id="ID_1">1003351.1E</span><span class="sdParams" style="display: none;">TAD_HP;GEO_LAT;229</span></p>
    <p class=" AmdtDeletedAIRAC" title="x">a whole <b>deleted</b> <p>nested</p> paragraph</p><span class=" AmdtDeletedAIRAC">old</span><p>kept <a href="/cdn-cgi/l/email-protection" class="__cf_email__" data-cfemail="${Y.cfEncode('a@b.invalid', 0x42)}">[email&#160;protected]</a></p>
    <p>chart <a href="../../graphics/123456.pdf">AD 2-VTBD-2-1</a></p><script>window.__CF$cv$params={r:'1'};</script><p>&#160;spaced&nbsp;&amp; <span class="sdParams" style="display: none;">not a token</span></p>
    <p class="Figure">see <img class="Graphic" style="width: 9pxpx;" id="ID_7" src="../../graphics/ID_7.gif" alt=""/> above</p></div>`;
  assert.deepEqual(L.htmlLines(h), ['135307.9N 1003351.1E', 'kept a@b.invalid', 'chart AD 2-VTBD-2-1 [123456.pdf]', 'spaced & not a token', 'see', '[img ID_7.gif]', 'above']);
  // rows: one line per table row, empty cells kept, so a value that moves into the next (empty) cell is a change
  const t = (cells) => `<table><tbody><tr><th>Type</th><th id="x" rowspan="2"/><th>Remarks</th></tr><tr>${cells.map((c) => `<td>${c}</td>`).join('')}</tr><tr><td>&#160;</td><td/></tr></tbody></table><p>after</p>`;
  assert.deepEqual(L.htmlRows(t(['DME 21R', '&#160;', '0 m<br/>(0 ft)', ''])), ['Type | | Remarks', 'DME 21R | | 0 m / (0 ft) |', 'after']);
  assert.deepEqual(L.htmlLines(t(['DME 21R', '&#160;', '0 m<br/>(0 ft)', ''])), L.htmlLines(t(['DME 21R', '0 m<br/>(0 ft)', '&#160;', ''])), 'the line form cannot see the move');
  assert.notDeepEqual(L.htmlRows(t(['DME 21R', '&#160;', '0 m<br/>(0 ft)', ''])), L.htmlRows(t(['DME 21R', '0 m<br/>(0 ft)', '&#160;', ''])));
  assert.deepEqual(L.htmlRows('<table><tr><td>a<img src="../../graphics/ID_8.gif"/></td><td><table><tr><td>in</td><td>ner</td></tr></table></td></tr></table>'), ['a / [img ID_8.gif] | in / ner']);
  assert.equal(L.decodeCfEmail(Y.cfEncode('x.y@z.invalid', 0xbb)), 'x.y@z.invalid');
});

test('AD 2 split and diff: amendment marks and a new email key are not a change; a changed line is; case and spacing are cosmetic', () => {
  const base = ad2Of(FX, { effective: REPO });
  assert.deepEqual(base.order, Array.from({ length: 24 }, (_, i) => `AD 2.${i + 1}`));
  assert.ok(base.sections['AD 2.20'].includes('Synthetic item 1.'), 'a sub-item belongs to its section');
  const marked = ad2Of(FX, { marks: true, emailKey: 0x99, effective: '2026-11-26', published: '2026-10-15' });
  assert.deepEqual(L.compareAd2(base, marked).filter((c) => c.status !== 'same'), []);
  const changed = L.compareAd2(base, ad2Of(FX, { extra: { 'AD 2.20': 'Synthetic new rule for runway 03R/21L.' } })).filter((c) => c.status !== 'same');
  assert.deepEqual(changed.map((c) => [c.section, c.status, c.added, c.removed]), [['AD 2.20', 'changed', ['Synthetic new rule for runway 03R/21L.'], []]]);
  assert.ok(changed[0].diff.includes('+ Synthetic new rule for runway 03R/21L.'));
  const page = Y.ad2Html(FX);
  const cos = L.compareAd2(base, L.splitAd2(page.replace('Dimensions of RWY (m)', 'Dimensions of RWY(M)').replace(/>(\d{4})x(\d{2})</, '>$1 x $2<'))).filter((c) => c.status !== 'same');
  assert.deepEqual(cos.map((c) => [c.section, c.status]), [['AD 2.12', 'cosmetic']]);
  const digits = L.compareAd2(base, L.splitAd2(page.replace('HGT 70 m', 'HGT 7 0 m'))).filter((c) => c.status !== 'same');
  assert.deepEqual(digits.map((c) => [c.section, c.status]), [['AD 2.10', 'changed']], 'a space between two digits is not cosmetic');
  const img = L.compareAd2(base, L.splitAd2(page.replace('graphics/ID_900001.gif', 'graphics/ID_900002.gif'))).filter((c) => c.status !== 'same');
  assert.deepEqual(img.map((c) => [c.section, c.status, c.removed, c.added]), [['AD 2.20', 'changed', ['[img ID_900001.gif]'], ['[img ID_900002.gif]']]], 'a renamed picture is a change');
  const noImg = L.compareAd2(base, L.splitAd2(page.replace(/<img\b[^>]*>/, ''))).filter((c) => c.status !== 'same');
  assert.deepEqual(noImg.map((c) => [c.section, c.removed]), [['AD 2.20', ['[img ID_900001.gif]']]], 'a removed picture is a change');
  const dme = /<td><p>(DME \w+)<\/p><\/td><td><p><\/p><\/td>/;   // a DME row whose ID cell is empty (DME co-located with the LOC)
  assert.match(page, dme);
  const moved = L.compareAd2(base, L.splitAd2(page.replace(dme, '<td><p></p></td><td><p>$1</p></td>'))).filter((c) => c.status !== 'same');
  assert.deepEqual(moved.map((c) => [c.section, c.status]), [['AD 2.19', 'changed']], 'a value moved into the next empty cell');
  assert.deepEqual(base.duplicates, []);
  const dup = L.splitAd2(page.replace('<div id="VTBD-AD-2.21">', '<div id="VTBD-AD-2.20"><p>Synthetic duplicate block.</p></div><div id="VTBD-AD-2.21">'));
  assert.deepEqual(dup.duplicates, ['AD 2.20']);
  assert.ok(dup.sections['AD 2.20'].includes('Synthetic duplicate block.') && dup.rows['AD 2.20'].includes('Synthetic duplicate block.'), 'the duplicate block is kept');
  const gone = L.compareAd2(base, L.splitAd2(page.replace('<div id="VTBD-AD-2.23">', '<div id="X-23">'))).filter((c) => c.status !== 'same');
  assert.deepEqual(gone.map((c) => [c.section, c.status]), [['AD 2.22', 'changed'], ['AD 2.23', 'removed']]);
  assert.deepEqual(L.diffLines(['a', 'b', 'c', 'd'], ['a', 'x', 'c', 'd', 'e']), [['=', 'a'], ['-', 'b'], ['+', 'x'], ['=', 'c'], ['=', 'd'], ['+', 'e']]);
  assert.deepEqual(L.diffLines([], []), []);
});

test('facts: a synthetic AD 2 page printed from the fixture passes every check; every fixture value is checked or has a reason', () => {
  for (const opts of [{}, { marks: true, emailKey: 0x13 }]) {
    const res = L.checkFacts(FX, ad2Of(FX, opts));
    assert.ok(res.length > 150, `${res.length} facts`);
    assert.deepEqual(res.filter((r) => r.status !== 'pass').map((r) => `${r.id}: ${r.why}`), []);
    const cov = L.factCoverage(FX, res);
    assert.deepEqual(cov.filter((c) => c.status === 'unclassified').map((c) => c.path), []);
    for (const p of ['ends.21L.thr.dms', 'ends.21L.disp_m', 'ends.03L.papi.meht_ft', 'ends.21R.approach.gp.dms', 'comms_ad2_18.ATIS[1]', 'atz.transition_alt_ft', 'obstacles_ad2_10[4].marked', 'runways.03R/21L.redl_21L', 'runways.03L/21R.slope.21R', 'ends.03R.approach.kind'])
      assert.equal(cov.find((c) => c.path === p)?.status, 'checked', p);
    for (const [p, s] of [['ends.03L.thr.lat', 'derived'], ['arp.precise_20260514.dms', 'earlier'], ['ends.03R.approach.tch_ft', 'chart'], ['meta.recheck_before', 'meta'], ['ends.03L.papi.dist_from_thr_est_m.at_3deg', 'estimate']])
      assert.equal(cov.find((c) => c.path === p)?.status, s, p);
  }
  // the real page prints RDH in metres only for 21R: elsewhere the fact says 'derived', not 'fail'
  const noM = L.checkFacts(FX, L.splitAd2(Y.ad2Html(FX).replace(/is (\d+\.\d+) m \((\d+) ft\)/g, 'is $2 ft')));
  assert.deepEqual(noM.filter((r) => r.status !== 'pass').map((r) => [r.id, r.status]), [['03L RDH in metres', 'derived'], ['21R RDH in metres', 'derived'], ['21L RDH in metres', 'derived']]);
});

test('facts: a value changed in the page fails and names the fact (and only the facts that print it)', () => {
  const cases = [
    ['ends.21L.thr.dms', '135528.34N 1003655.97E', ['THR 21L coordinates']],
    ['ends.03L.papi.meht_ft', 71.95, ['03L PAPI and MEHT', '03L touchdown zone lights']],
    ['ends.21L.declared.lda', 3160, ['21L LDA', 'THR 21L displacement (TORA - LDA)']],
    ['runways.03L/21R.wid_m', 45, ['RWY 03L length and width', 'RWY 21R length and width']],
    ['comms_ad2_18.TWR[0]', 118.2, ['AD 2.18 TWR 118.1 MHz']],
    ['ends.21R.approach.gp.dms', '135523.5N 1003642.8E', ['21R GP position']],
    ['obstacles_ad2_10[3].hgt_m', 88, ['obstacle 4 height']],
    ['obstacles_ad2_10[0].marked', false, ['obstacle 1 marking and lighting']],
    ['atz.transition_alt_ft', 13000, ['transition altitude']],
    ['ends.21R.als.type', 'CAT I', ['21R approach lights']],
    ['ends.21R.approach.cat', 'I', ['21R ILS category']],
    ['runways.03R/21L.redl_21L', '3500 m, 60 m; red first 400 m (displaced part), white 400-2900 m, yellow from 2900 m; LIH', ['21L runway edge lights']],
    ['runways.03L/21R.resa_m.21R[1]', 120, ['RWY 21R RESA']],
    ['ends.03L.true_brg_pub', 30, ['RWY 03L true bearing']],
    ['elevation.current_m', 4, ['aerodrome elevation']],
    ['magvar.annual_text', '0 03 E', ['magnetic variation and annual change']],
  ];
  for (const [p, v, want] of cases) { const fx = clone(FX); setPath(fx, p, v); assert.deepEqual(failing(fx), [...want].sort(), `${p} = ${JSON.stringify(v)}`); }
  // an ILS printed for 03R (RNP only) and a removed flashing light
  const fx = clone(FX); fx.ends['03R'].approach = { ...clone(FX.ends['03L'].approach), ident: 'IZZZ' };
  assert.ok(failing(fx).includes('03R RNP approach (no ILS in AD 2.19, chart in AD 2.24)'));
  assert.deepEqual(failing(null, Y.ad2Html(FX).replace('<br/>with FLG', '')), ['21R approach flashing lights']);
  // the emergency pair must stand in each Don Mueang row that prints it (approach, arrival, tower), not just somewhere
  const C = FX.comms_ad2_18, em = `${C.emergency[0]} MHz1) / ${C.emergency[1].toFixed(1)} MHz1)`, twr = C.TWR.map((f) => `${f} MHz`).join('<br/>');
  assert.ok(Y.ad2Html(FX).includes(`${twr}<br/>${em}`));
  assert.deepEqual(failing(null, Y.ad2Html(FX).replace(`${twr}<br/>${em}`, twr)), C.emergency.map((f) => `AD 2.18 emergency ${f} MHz`).sort());
  // a row of the first AD 2.12 table ends where the second table starts (items 7-14 have no designator)
  const rw = Object.keys(FX.runways).at(-1), last = rw.split('/').at(-1), dim = `${FX.runways[rw].len_m}x${FX.runways[rw].wid_m}`;   // the table's last row
  const p12 = Y.ad2Html(FX), at = p12.lastIndexOf(`<p>${dim}</p>`), rem = p12.lastIndexOf('<p>NIL</p></td></tr></tbody></table></div><div id="VTBD-AD-2.13"');
  assert.ok(at > 0 && rem > at, 'synthetic AD 2.12: the last dimensions cell, then the last remarks cell');
  const moved12 = p12.slice(0, at) + '<p>9999x99</p>' + p12.slice(at + dim.length + 7, rem) + `<p>${dim}</p>` + p12.slice(rem + 10);
  assert.deepEqual(failing(null, moved12), [`RWY ${last} length and width`], 'the value in the second table does not count for the row');
});

test('title classification: VTBD, another aerodrome, or unclear', () => {
  const C = [
    ['TEMPORARY SYNTHETIC CRANES IN THE VICINITY OF DON MUEANG INTERNATIONAL AIRPORT (VTBD)', 'vtbd'], ['SYNTHETIC NOTICE FOR VTBD', 'vtbd'],
    ['SYNTHETIC TAXIWAY CLOSURE AT EXAMPLE INTERNATIONAL AIRPORT (VTZZ)', 'other'], ['SYNTHETIC CRANE IN THE VICINITY OFEXAMPLE FIELD(VTZZ)', 'other'],
    ['SYNTHETIC ILS/DME SUSPENSION - (VTZZ)', 'other'], ['SYNTHETIC RUNWAY WORKS AT PHUKET INTERNATIONAL AIRPORT', 'other'],
    ['SYNTHETIC APRON WORKS AT CHIANG-MAI AIRPORT', 'other'], ['SYNTHETIC CRANE IN THE VICINITY OFKRABI AIRPORT', 'other'],
    // AIRPORT, AERODROME or HELIPORT alone names no aerodrome: such an item can concern VTBD
    ['SYNTHETIC RUNWAY WORKS AT EXAMPLE AIRPORT', 'unclear'], ['REVISED AIRPORT CHARGES', 'unclear'], ['SLOT COORDINATION AT AOT AIRPORT', 'unclear'],
    ['NEW HELIPORT SAFETY RULES', 'unclear'], ['SYNTHETIC AERODROME MAINTENANCE NOTICE', 'unclear'], ['SYNTHETIC STRANGE DEVICES', 'unclear'],
    ['SYNTHETIC ROUTE CHANGE IN BANGKOK FIR', 'unclear'], ['SYNTHETIC STAND CLOSURE AT EXAMPLE AIRPORT (VTZZ) AND BANGKOK TMA', 'unclear'],
    ['INCREASED SYNTHETIC GNSS INTERFERENCE', 'unclear'], ['SYNTHETIC AIRAC SCHEDULE FOR 2027', 'unclear'], ['', 'unclear'],
  ];
  for (const [t, c] of C) assert.equal(L.classifyTitle(t), c, t);
});

const goodReviewed = () => ({
  _meta: { about: 'ทดสอบ', rules: 'เขียนเป็นคำของเราเอง', updated: '2026-11-26' },
  sup: { 'A01/26': { read: '2026-11-26', basis: 'title', vtbd: false, note: 'งานทาสีที่สนามบินอื่น', folder: '2026-01-15', in: '2026-01-15', until: 'UFN' },
    'B02/26': { read: '2026-11-25', basis: 'text', vtbd: true, note: 'ไฟทางขับดับชั่วคราว', folder: '2026-11-26-AIRAC', until: '2027-01-21', status: 'มีผล', repo: 'ไม่กระทบ' } },
  aic: { '03/26': { read: '2026-11-26', basis: 'text', vtbd: false, note: 'ตารางรอบ AIRAC' } },
});
test('reviewed.json: schema, key formats, dates, basis rule, no copied titles, no military unit, school or academy words', () => {
  assert.deepEqual(L.validateReviewed(goodReviewed(), { today: '2026-11-26' }), []);
  const bad = (mut, re, opts = {}) => { const o = goodReviewed(); mut(o); const p = L.validateReviewed(o, opts); assert.ok(p.some((x) => re.test(x)), `${re}: ${p.join(' | ') || 'no problem found'}`); };
  bad((o) => { o.sup['A5/26'] = o.sup['A01/26']; }, /A5\/26: key/);
  bad((o) => { o.sup['C01/26'] = o.sup['A01/26']; }, /C01\/26: key/);
  bad((o) => { o.aic['7/26'] = o.aic['03/26']; }, /7\/26: key/);
  bad((o) => { o.sup['A01/26'].read = '2026-13-01'; }, /read must be a date/);
  bad((o) => { o.sup['A01/26'].read = '2026-11-27'; }, /after today/, { today: '2026-11-26' });
  bad((o) => { o.sup['A01/26'].basis = 'guess'; }, /basis must be/);
  bad((o) => { o.sup['A01/26'].vtbd = true; }, /basis "title" is allowed only/);
  bad((o) => { o.aic['03/26'].vtbd = 'no'; }, /vtbd must be true or false/);
  bad((o) => { o.aic['03/26'].note = ' '; }, /note must be a non-empty string/);
  bad((o) => { o.aic['03/26'].seen = true; }, /unknown field "seen"/);
  bad((o) => { o.sup['B02/26'].until = 'soon'; }, /until must be/);
  assert.deepEqual(L.validateReviewed((() => { const o = goodReviewed(); o.aic['03/26'].until = 'PERM'; return o; })()), []);
  bad((o) => { o.sup['B02/26'].folder = '2026/11/26'; }, /folder must be/);
  bad((o) => { delete o._meta.updated; }, /_meta.updated/);
  bad((o) => { o.extra = {}; }, /unknown top-level key/);
  for (const w of ['a flying school there', 'a squadron hangar', 'Wing 00 apron', 'an air force base', 'ที่โรงเรียนการบิน', 'กองบินสมมุติ', 'ฝูงบินสมมุติ', 'the academy field',
    'Rtaf apron', 'rtn field', 'หน่วยสมมุติของทหารบก', 'ทหารเรือ', 'ทหารอากาศ', '0th Wing apron', '00st wing', 'Air Division 0', 'air command'])
    bad((o) => { o.sup['B02/26'].note = w; }, /military unit, school or academy/);
  bad((o) => { o._meta.about = 'รายการของกองบินสมมุติ'; }, /_meta.about names a military unit/);
  assert.deepEqual(L.validateReviewed((() => { const o = goodReviewed(); o._meta.rules = 'ห้ามระบุชื่อโรงเรียนหรือหน่วยทหาร'; return o; })()), [], '_meta.rules may name what it forbids');
  const titles = { 'sup:A01/26': 'SYNTHETIC ROUTE CHANGE IN BANGKOK FIR', 'aic:03/26': 'SYNTHETIC AIRAC SCHEDULE FOR YEAR 2027' };
  bad(() => {}, /A01\/26: basis "title" needs a title/, { titles });
  bad((o) => { o.aic['03/26'].note = 'synthetic airac schedule for year 2027 อ่านแล้ว'; }, /note copies the title/, { titles });
  assert.deepEqual(L.validateReviewed(goodReviewed(), { titles: { 'sup:A01/26': 'SYNTHETIC WORKS AT EXAMPLE AIRPORT (VTZZ)' } }), []);
  assert.ok(L.validateReviewed([]).length > 0 && L.validateReviewed(null).length > 0);
  // the stub printed for an unreviewed item does not pass until a person fills it in
  const stub = { _meta: goodReviewed()._meta, sup: { 'A09/26': L.reviewStub({ folder: '2026-12-24-AIRAC' }) } };
  assert.ok(L.validateReviewed(stub).length >= 3);
  const real = path.join(ROOT, 'tools/watch/reviewed.json');
  if (fs.existsSync(real)) assert.deepEqual(L.validateReviewed(JSON.parse(fs.readFileSync(real, 'utf8'))), [], 'tools/watch/reviewed.json');
});

// ---- the command line on synthetic --from folders -----------------------------------------------------------------
const WATCH = path.join(ROOT, 'tools/watch/watch.mjs');
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'watch-test-'));
process.on('exit', () => fs.rmSync(TMP, { recursive: true, force: true }));
const ED = (effective, status, amdt) => ({ effective, published: L.addDays(effective, -42), amdt, status });
const ITEMS = {
  supA: { kind: 'sup', series: 'A', number: '01', year: '26', folder: '2026-01-15', title: 'SYNTHETIC WORKS AT EXAMPLE AIRPORT (VTZZ)' },
  supB: { kind: 'sup', series: 'B', number: '02', year: '26', folder: '2026-11-26-AIRAC', title: 'SYNTHETIC LIGHTS OUT AT DON MUEANG INTERNATIONAL AIRPORT (VTBD)' },
  aic3: { kind: 'aic', number: '03', year: '26', folder: '2026-02-05', title: 'SYNTHETIC AIRAC SCHEDULE FOR YEAR 2027' },
  supCover: { kind: 'sup', series: 'A', number: '04', year: '26', folder: '2026-11-20', title: 'SYNTHETIC MAST AT EXAMPLE AIRPORT (VTZZ)' },
  aicNew: { kind: 'aic', number: '05', year: '26', folder: '2026-11-20', title: 'SYNTHETIC GNSS NOTICE' },
  supNow: { kind: 'sup', series: 'A', number: '06', year: '26', folder: '2026-10-20', title: 'SYNTHETIC CRANE NEAR DON MUEANG INTERNATIONAL AIRPORT (VTBD)' },
  supGeneric: { kind: 'sup', series: 'A', number: '07', year: '26', folder: '2026-10-20', title: 'SYNTHETIC RULES FOR AIRPORT GROUND VEHICLES' },
};
const LISTS = [ITEMS.supA, ITEMS.supB, ITEMS.aic3];
// A --from folder: the repo edition, the recorded issues (next: their dates, the fixture's by default) and `extra`
// later editions. ad2[date] / amdt[date] override a page; lists: the SUP/AIC lists of the newest edition, nowLists
// those of every other edition (the one in force on --today among them); rev(reviewed) edits reviewed.json.
function makeFrom(name, { extra = [], next = NEXT, ad2 = {}, amdt = {}, lists = LISTS, nowLists = lists, cover = [ITEMS.supCover], noIndex = false, rev = () => {} } = {}) {
  const dir = path.join(TMP, name), eds = [ED(REPO, 'current', META.amdt.replace(/^.*AMDT\s*/, '')), ...next.map((d, i) => ED(d, 'next', `${12 + i}/26`)), ...extra.map((d, i) => ED(d, 'next', `${20 + i}/26`))];
  const w = (p, s) => { fs.mkdirSync(path.dirname(path.join(dir, p)), { recursive: true }); fs.writeFileSync(path.join(dir, p), s); };
  if (!noIndex) w('index.html', Y.indexHtml([...eds, ED('2026-10-01', 'expired', '10/26')]));
  const newest = eds.at(-1).effective;
  eds.forEach((e, i) => {
    w(`${e.effective}/VT-AD-2.VTBD-en-GB.html`, ad2[e.effective] ?? Y.ad2Html(FX, { marks: i === 0, emailKey: 0x20 + i, effective: e.effective, published: e.published }));
    w(`${e.effective}/VT-AMDT-en-GB.html`, amdt[e.effective] ?? Y.amdtHtml(e, i === 0 ? [2, 12] : []));
    w(`${e.effective}/VT-cover-en-GB.html`, Y.coverHtml(e, i === 1 ? cover : []));
    const L2 = e.effective === newest ? lists : nowLists;
    w(`${e.effective}/VT-eSUPs-en-GB.html`, Y.listHtml('sup', e.published, L2.filter((x) => x.kind === 'sup')));
    w(`${e.effective}/VT-eAICs-en-GB.html`, Y.listHtml('aic', e.published, L2.filter((x) => x.kind === 'aic')));
  });
  for (const it of cover) w(`${it.folder.slice(0, 10)}/VT-eSUP-${it.year}-${it.number}-${it.series}-en-GB.html`, `<html><head><title>SUP ${+it.number} ${it.year} ${it.title}</title><meta name="EM.effectiveDateStart" content="${it.folder}"/><meta name="EM.effectiveDateEnd" content="UFN"/></head></html>`);
  const r = goodReviewed();
  delete r.sup['A01/26'];   // A01/26 names another aerodrome: left unreviewed, it is information, not an action
  for (const e of [...Object.values(r.sup), ...Object.values(r.aic)]) e.read = REPO;   // read on the run's --today
  rev(r);
  w('reviewed.json', JSON.stringify(r));
  return dir;
}
// a copy of the fixture whose next_issues are [[effective, vtbd_changes], ...]
function fixtureWith(dir, records) {
  const fx = clone(FX);
  fx.meta.next_issues = records.map(([effective, vtbd_changes]) => ({ effective, amdt: 'synthetic', vtbd_changes, src: 'test' }));
  fx.meta.recheck_before = L.airacAfter(records.at(-1)?.[0] ?? REPO);
  const f = path.join(dir, 'fixture.json');
  fs.writeFileSync(f, JSON.stringify({ aip_vtbd_current: fx }));
  return f;
}
const run = (args, today = REPO, opts = {}) => {
  const r = spawnSync(process.execPath, [WATCH, ...args, ...(today ? ['--today', today] : [])], { encoding: 'utf8', env: { ...process.env, PATH: '', WATCH_OFFLINE: '1' }, ...opts });
  return { code: r.status, out: r.stdout, err: r.stderr };
};
const aip = (dir, today, more = []) => run(['aip', '--from', dir, '--out', path.join(dir, 'out'), '--reviewed', path.join(dir, 'reviewed.json'), ...more], today);
const report = (dir, today = REPO) => JSON.parse(fs.readFileSync(path.join(dir, 'out', `report-aip-${today}.json`), 'utf8'));

test('CLI aip on synthetic pages: 0 when every edition is recorded, unchanged and every item read', () => {
  const dir = makeFrom('ok'), r = aip(dir);
  assert.equal(r.code, 0, r.out + r.err);
  assert.equal(r.err, '', 'nothing downloaded');
  assert.match(r.out, /ไม่มีอะไรต้องทำ/);
  assert.match(r.out, /SUP\/AIC: 4 รายการ/);
  const rep = report(dir);
  assert.deepEqual(rep.editions.map((e) => [e.effective, e.record, e.verdict]), [[REPO, 'repo', 'ok'], ...NEXT.map((d) => [d, 'recorded', 'ok'])]);
  assert.deepEqual(rep.editions.slice(1).map((e) => e.sections.against), [REPO, ...NEXT.slice(0, -1)], 'each edition against the one before it');
  assert.ok(rep.editions.every((e) => e.facts.failed.length === 0 && e.facts.pass === e.facts.total));
  assert.deepEqual(rep.items.unreviewed.map((i) => [i.id, i.class]), [['A01/26', 'other'], ['A04/26', 'other']], 'the cover-only SUP got its title from its own page');
  assert.deepEqual(rep.items.vtbd_listed, ['SUP B02/26']);
  assert.deepEqual(rep.lists.map((l) => [l.edition, l.kind, l.in_force]), [[REPO, 'sup', true], [REPO, 'aic', true], [NEXT.at(-1) ?? REPO, 'sup', !NEXT.length], [NEXT.at(-1) ?? REPO, 'aic', !NEXT.length]].slice(0, NEXT.length ? 4 : 2));
  assert.ok(fs.existsSync(path.join(dir, 'out', `report-aip-${REPO}.md`)));
  assert.equal(rep.coverage.counts.unclassified, undefined);
  const res = run(['aip', '--research', '--from', dir, '--out', path.join(dir, 'out'), '--reviewed', path.join(dir, 'reviewed.json')]);
  assert.equal(res.code, 0, res.out);
  assert.match(res.out, /--research ข้ามไป/, 'the research scripts always download, so --from skips them');
});

test('CLI aip: 1 for an unrecorded later edition (with the next_issues entry to add), a changed section or an unread unclear item', () => {
  const later = L.airacAfter(NEXT.at(-1) ?? REPO);
  let r = aip(makeFrom('new', { extra: [later] }));
  assert.equal(r.code, 1, r.out);
  assert.match(r.out, new RegExp(`"effective":"${later}"`));
  assert.match(r.out, new RegExp(`identical to ${L.fmtDMY(NEXT.at(-1) ?? REPO)}`), 'the stub names the edition it was compared with');
  assert.match(r.out, new RegExp(`meta.recheck_before เป็น ${L.airacAfter(later)}`));
  const d = NEXT[0] ?? REPO;
  r = aip(makeFrom('changed', { ad2: { [d]: Y.ad2Html(FX, { extra: { 'AD 2.20': 'Synthetic new rule.' } }) } }));
  assert.equal(r.code, 1, r.out);
  assert.match(r.out, /AD 2\.20 \(changed/);
  assert.match(r.out, /\+ Synthetic new rule\./);
  const fx = clone(FX); fx.ends['21R'].papi.meht_ft = 66.42;
  r = aip(makeFrom('fact', { ad2: { [d]: Y.ad2Html(fx) } }));
  assert.equal(r.code, 1);
  assert.match(r.out, /21R PAPI and MEHT/);
  r = aip(makeFrom('unread', { lists: [...LISTS, ITEMS.aicNew] }));
  assert.equal(r.code, 1);
  assert.match(r.out, /unclear AIC 05\/26/);
  r = aip(makeFrom('late'), META.recheck_before);
  assert.equal(r.code, 1);
  assert.match(r.out, /recheck_before/);
  // an unread item that only the list of the edition in force today holds (gone from the newest list) still counts
  r = aip(makeFrom('nowlist', { nowLists: [...LISTS, ITEMS.supNow] }));
  assert.equal(r.code, 1, r.out);
  assert.match(r.out, /vtbd\s+SUP A06\/26/);
  // a title with AIRPORT that names no aerodrome is unclear: an action, not a note
  r = aip(makeFrom('generic', { lists: [...LISTS, ITEMS.supGeneric] }));
  assert.equal(r.code, 1, r.out);
  assert.match(r.out, /unclear SUP A07\/26/);
  // a picture replaced in a later edition
  r = aip(makeFrom('img', { ad2: { [d]: Y.ad2Html(FX).replace('ID_900001.gif', 'ID_900002.gif') } }));
  assert.equal(r.code, 1, r.out);
  assert.match(r.out, /\+ \[img ID_900002\.gif\]/);
});

test('CLI aip: each edition against the one before it; a changed section passes only when that edition records it', () => {
  const d1 = L.airacAfter(REPO), d2 = L.airacAfter(d1), d3 = L.airacAfter(d2);
  const A = Y.ad2Html(FX, { extra: { 'AD 2.20': 'Synthetic circuit rule A.' } }), B = Y.ad2Html(FX, { extra: { 'AD 2.20': 'Synthetic circuit rule B.' } });
  const rec = [[d1, 'AD 2.20 synthetic circuit rule added'], [d2, `none (AD 2 VTBD text identical to ${L.fmtDMY(d1)})`]];
  // recorded in d1, the same text in d2 ("none"): 0
  let dir = makeFrom('chain-ok', { next: [d1, d2], ad2: { [d1]: A, [d2]: A } }), r = aip(dir, REPO, ['--fixture', fixtureWith(dir, rec)]);
  assert.equal(r.code, 0, r.out);
  assert.match(r.out, /AD 2\.20 เปลี่ยนจากฉบับ .* ตามที่ next_issues ของฉบับนี้บันทึกไว้/);
  // the same section changes again in d2, whose record says none: 1 (before, any record of AD 2.20 hid it for good)
  dir = makeFrom('chain-again', { next: [d1, d2], ad2: { [d1]: A, [d2]: B } }); r = aip(dir, REPO, ['--fixture', fixtureWith(dir, rec)]);
  assert.equal(r.code, 1, r.out);
  assert.match(r.out, new RegExp(`ฉบับ ${L.fmtDMY(d2)}: AD 2 VTBD เปลี่ยนจากฉบับ ${L.fmtDMY(d1)} โดย next_issues ของฉบับนี้ไม่ได้บันทึก: AD 2\\.20`));
  assert.match(r.out, /- Synthetic circuit rule A\.\n\s+\+ Synthetic circuit rule B\./);
  // a new edition d3 after the recorded change: its stub says identical to d2, not to the repo edition
  dir = makeFrom('chain-new', { next: [d1, d2], extra: [d3], ad2: { [d1]: A, [d2]: A, [d3]: A } }); r = aip(dir, REPO, ['--fixture', fixtureWith(dir, rec)]);
  assert.equal(r.code, 1, r.out);
  const stub = report(dir).editions.find((e) => e.effective === d3).next_issue_stub;
  assert.equal(stub.vtbd_changes, `none (AD 2 VTBD text identical to ${L.fmtDMY(d2)})`);
  // ... and a new edition that changes the recorded section again gets no stub
  dir = makeFrom('chain-new2', { next: [d1, d2], extra: [d3], ad2: { [d1]: A, [d2]: A, [d3]: B } }); r = aip(dir, REPO, ['--fixture', fixtureWith(dir, rec)]);
  assert.equal(report(dir).editions.find((e) => e.effective === d3).next_issue_stub, null);
  assert.match(r.out, new RegExp(`ฉบับ ${L.fmtDMY(d3)}: AD 2 VTBD เปลี่ยนจากฉบับ ${L.fmtDMY(d2)}: AD 2\\.20`));
  // a record that names a section which did not change: 1
  dir = makeFrom('chain-stale', { next: [d1, d2], ad2: { [d1]: A, [d2]: A } });
  r = aip(dir, REPO, ['--fixture', fixtureWith(dir, [rec[0], [d2, 'AD 2.12 header case only']])]);
  assert.equal(r.code, 1, r.out);
  assert.match(r.out, /บันทึกว่า AD 2\.12 เปลี่ยน แต่ข้อความเหมือนฉบับ/);
  // a duplicate section id: the content is kept and the run cannot decide (2)
  dir = makeFrom('dup', { next: [d1], ad2: { [d1]: Y.ad2Html(FX).replace('<div id="VTBD-AD-2.21">', '<div id="VTBD-AD-2.20"><p>Synthetic closure.</p></div><div id="VTBD-AD-2.21">') } });
  r = aip(dir, REPO, ['--fixture', fixtureWith(dir, [[d1, 'none (synthetic)']])]);
  assert.equal(r.code, 2, r.out);
  assert.match(r.out, /หัวข้อซ้ำ: AD 2\.20/);
  assert.match(r.out, /\+ Synthetic closure\./);
});

test('CLI aip: notes on SUP/AIC that left the lists, VTBD in an amendment list outside AD 2, a late package', () => {
  const d = NEXT[0] ?? REPO;
  // B02/26 is in no list: until a date not yet passed -> not recorded as expired; until passed -> expired
  let dir = makeFrom('gone', { lists: [ITEMS.supA, ITEMS.aic3] }), r = aip(dir);
  assert.match(r.out, /ไม่ได้บันทึกว่าหมดอายุ: SUP B02\/26 \(until 2027-01-21\)/);
  dir = makeFrom('expired', { lists: [ITEMS.supA, ITEMS.aic3], rev: (x) => { x.sup['B02/26'].until = '2026-10-01'; } }); r = aip(dir);
  assert.match(r.out, /หมดอายุแล้วและไม่อยู่ในรายการ: SUP B02\/26 \(ถึง 2026-10-01\)/);
  const mention = Y.amdtHtml({ effective: d, amdt: '12/26' }, []).replace('<div id="amdtGroups">', '<p>Synthetic ENR change near Don Mueang.</p><div id="amdtGroups">');
  dir = makeFrom('mention', { amdt: { [d]: mention } }); r = aip(dir);
  assert.equal(r.code, 0, r.out);
  assert.match(r.out, /กล่าวถึง VTBD หรือ Don Mueang 1 ครั้งนอก AD 2 VTBD/);
  // 42 days before recheck_before its package should be out; not in the index yet -> a note (due exits 1)
  r = aip(makeFrom('pub'), L.airacPublished(META.recheck_before));
  assert.match(r.out, /ควรเผยแพร่แล้วตั้งแต่/);
});

test('page source: cache, maxAgeH, refresh, the effective date of the edition, a page that fails its check', () => {
  const dir = path.join(TMP, 'cache'), url = 'https://aip.caat.or.th/2026-12-24-AIRAC/html/eAIP/VT-AD-2.VTBD-en-GB.html', f = path.join(dir, '2026-12-24', 'VT-AD-2.VTBD-en-GB.html');
  let n = 0, body = (i) => `<div id="VTBD-AD-2.1">body ${i}</div>`, bad = false;
  const get = () => (bad ? '<html>error page</html>' : body(++n));
  let now = Date.parse('2026-11-26T08:00:00Z');
  const mk = (refresh = false) => makeSource({ cacheDir: dir, refresh, get, now: () => now });
  const o = { maxAgeH: Infinity, notBefore: '2026-12-24', check: L.PAGE_CHECK.ad2 };
  const at = (iso) => { const t = Date.parse(iso) / 1000; fs.utimesSync(f, t, t); };
  let s = mk();
  assert.equal(s.page('2026-12-24', url, o), body(1)); assert.equal(s.used.at(-1).how, 'net');
  at('2026-11-26T08:00:00Z');
  s = mk(); assert.equal(s.page('2026-12-24', url, o), body(1)); assert.equal(s.used.at(-1).how, 'cache', 'a hit');
  s = mk(); s.page('2026-12-24', url, { ...o, maxAgeH: 24 }); assert.equal(s.used.at(-1).how, 'cache', 'younger than a day');
  now = Date.parse('2026-11-28T08:00:00Z');
  s = mk(); assert.equal(s.page('2026-12-24', url, { ...o, maxAgeH: 24 }), body(2)); assert.equal(s.used.at(-1).how, 'net', 'older than maxAgeH');
  at('2026-11-28T08:00:00Z');
  s = mk(true); assert.equal(s.page('2026-12-24', url, o), body(3)); assert.equal(s.used.at(-1).how, 'net', '--refresh');
  at('2026-11-28T08:00:00Z');
  now = Date.parse('2026-12-23T08:00:00Z');
  s = mk(); s.page('2026-12-24', url, o); assert.equal(s.used.at(-1).how, 'cache', 'before the effective date the copy stands');
  now = Date.parse('2026-12-30T08:00:00Z');
  s = mk(); assert.equal(s.page('2026-12-24', url, o), body(4)); assert.equal(s.used.at(-1).how, 'net', 'saved while a next issue: fetched again once in force');
  at('2026-12-25T08:00:00Z');
  s = mk(); s.page('2026-12-24', url, o); assert.equal(s.used.at(-1).how, 'cache', 'fetched since the effective date: kept');
  // a page that fails its check is never cached, and a cached copy that fails it is removed and fetched again
  bad = true;
  s = mk(true); assert.throws(() => s.page('2026-12-24', url, o), /no section VTBD-AD-2\.n \(ไม่เก็บในแคช\)/);
  assert.equal(fs.readFileSync(f, 'utf8'), body(4), 'the good copy stays');
  fs.writeFileSync(f, '<html>cut</html>'); at('2026-12-25T08:00:00Z'); bad = false;
  s = mk(); assert.equal(s.page('2026-12-24', url, o), body(5)); assert.equal(s.used.at(-1).how, 'net');
  assert.equal(fs.readFileSync(f, 'utf8'), body(5));
  // --from never downloads; its page is checked too
  const from = makeSource({ from: dir, cacheDir: null, get: () => { throw new Error('network'); } });
  assert.equal(from.page('2026-12-24', url, o), body(5));
  fs.writeFileSync(f, 'x');
  assert.throws(() => from.page('2026-12-24', url, o), /no section/);
});

test('console diff: a long changed line shows the window around its first difference', () => {
  const pre = 'Synthetic departing helicopters shall call the synthetic tower on frequency ', post = ' for departure instructions, except within the synthetic area of responsibility of the approach unit.';
  const p = diffPreview(['  context', `- ${pre}118.1 MHz${post}`, `+ ${pre}118.2 MHz${post}`]);
  assert.equal(p.lines.length, 2);
  assert.ok(p.lines.every((l) => l.length <= 110));
  assert.match(p.lines[0], /^- ….*118\.1 MHz/); assert.match(p.lines[1], /^\+ ….*118\.2 MHz/);
  assert.notEqual(p.lines[0].slice(1), p.lines[1].slice(1));
  assert.equal(p.more, true);
  assert.deepEqual(diffPreview(['- a', '- b', '+ c', '  x', '+ d']), { lines: ['- a', '+ c', '- b', '+ d'], more: false });
});

test('CLI aip: 2 when the index or the repo edition cannot be read; due, all, help and argument errors', () => {
  let r = aip(makeFrom('noindex', { noIndex: true }));
  assert.equal(r.code, 2, r.out);
  assert.match(r.out, /อ่านดัชนี eAIP ไม่ได้/);
  const dir = makeFrom('noad2');
  fs.rmSync(path.join(dir, REPO, 'VT-AD-2.VTBD-en-GB.html'));
  assert.equal(aip(dir).code, 2);
  r = run(['due'], META.recheck_before);
  assert.notEqual(r.code, 0);
  assert.match(r.out, /ถึงกำหนดแล้ว/);
  r = run(['due'], REPO);
  assert.match(r.out, new RegExp(`รอบถัดไป ${L.airacDates(L.addDays(REPO, 1), 3).join(', ')}`));
  // the package of recheck_before is out 42 days ahead: due flags from that day, not from the effective date
  const pub = L.airacPublished(META.recheck_before);
  r = run(['due'], L.addDays(pub, -1));
  assert.match(r.out, new RegExp(`เหลือ 43 วัน; ฉบับนั้นเผยแพร่ราว ${pub}`));
  assert.doesNotMatch(r.out, /ควรเผยแพร่แล้ว/);
  r = run(['due'], pub);
  assert.equal(r.code, 1, r.out);
  assert.match(r.out, /ควรเผยแพร่แล้วตั้งแต่/);
  // all: aip, then the register reminder; exit is the worse of the two
  const ok = makeFrom('all');
  r = run(['all', '--from', ok, '--out', path.join(ok, 'out'), '--reviewed', path.join(ok, 'reviewed.json')]);
  const m = /all: exit (\d) \(aip (\d), ทะเบียน (\d)\)/.exec(r.out);
  assert.ok(m, r.out);
  assert.deepEqual([r.code, +m[2]], [Math.max(+m[2], +m[3]), 0]);
  assert.equal(+m[1], r.code);
  assert.equal(run(['--help']).code, 0);
  r = run(['aip', '--today', 'yesterday'], null);
  assert.equal(r.code, 2);
  assert.match(r.out + r.err, /yesterday/);
  assert.equal(run(['nonsense']).code, 2);
  // a typo never falls back to the network; extra words and options of another command are refused
  for (const [args, re] of [[['aip', '--fromm', ok], /ไม่รู้จักตัวเลือก --fromm/], [['aip', 'extra', '--from', ok], /คำเกินมา.*extra/], [['due', '--from', ok], /--from ใช้กับคำสั่ง due ไม่ได้/],
    [['all', '--from', ok, '--bogus'], /--bogus/], [['aip', '--from', ok, '--out', path.join(ROOT, 'docs', 'watch-test-out')], /อยู่ใน repo แต่ git ไม่ได้ ignore/]]) {
    r = run(args);
    assert.equal(r.code, 2, `${args.join(' ')}: ${r.out}`);
    assert.match(r.out, re);
    assert.equal(r.err, '', 'nothing downloaded');
  }
  assert.ok(!fs.existsSync(path.join(ROOT, 'docs', 'watch-test-out')));
  assert.deepEqual(parseArgs(['register', '--pdf', 'x.pdf', '--date', '2026-07-09']).errors, [], 'register checks its own options');
  // paths on the command line are read from the current folder
  r = run(['aip', '--from', '.', '--out', 'out', '--reviewed', 'reviewed.json'], REPO, { cwd: ok });
  assert.equal(r.code, 0, r.out);
  assert.ok(fs.existsSync(path.join(ok, 'out', `report-aip-${REPO}.json`)));
});
