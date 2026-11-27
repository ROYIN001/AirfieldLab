// Tests of tools/watch/register.mjs (plan item A10, R2-09): offline, synthetic register text built from rows already in
// the repo (docs/research/02-light-aircraft/scripts/out/ls_register_2026-07-09.json) with manufacturer names added.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import * as R from '../tools/watch/register.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'docs/research/02-light-aircraft/scripts/out');
const COMMITTED = path.join(OUT, 'ls_register_2026-07-09.json');
const committedText = fs.readFileSync(COMMITTED, 'utf8');
const committed = JSON.parse(committedText);
const known = R.operatorKeys(ROOT);
const MFR = { 'DA 40 D': 'Diamond Aircraft Industries GmbH', 'DA 40': 'Diamond Aircraft Industries GmbH', 'DA 42': 'Diamond Aircraft Industries GmbH', 'DA 42 NG': 'Diamond Aircraft Industries GmbH',
  '172S': 'Cessna Aircraft Company', '172R': 'Cessna Aircraft Company', '172M': 'Cessna Aircraft Company', '172N': 'Cessna Aircraft Company', '172P': 'Cessna Aircraft Company', '152': 'Cessna Aircraft Company',
  '150H': 'Cessna Aircraft Company', T206H: 'Textron Aviation Inc', '76': 'Beech Aircraft Corporation', 'P2002-JF': 'Costruzioni Aeronautiche Tecnam S.r.l.', P2006T: 'Costruzioni Aeronautiche Tecnam S.r.l.',
  'P.68C': 'Partenavia Costruzioni Aeronautiche S.p.A.', 'PA-28-161': 'The New Piper Aircraft Inc', 'PA-28-151': 'Piper Aircraft Inc' };
const title = s => s.toLowerCase().replace(/\b[a-z]/g, c => c.toUpperCase());
const rowText = (r, status = 'Registered', layout = false, op = r[3]) => layout
  ? `${status.padEnd(12)}  ${r[0].padEnd(8)}  ${MFR[r[1]].padEnd(36)}  ${r[1].padEnd(10)}  ${r[2].padEnd(12)}  ${op}`
  : `${status} ${r[0]} ${MFR[r[1]]} ${r[1]} ${r[2]} ${op}`;
const extras = (layout) => [
  `Registered HS-HAA Robinson Helicopter Company R44 II 12345 ${known[0]}`.replace(/ {1}(?=\S)/g, ' '),   // rotorcraft of a school
  'Registered HS-PRV Cessna Aircraft Company 172S 172S1111 PRIVATE AIRCRAFT',
  `Deregistered ${committed.rows[0][0].replace('TPU', 'ZZZ')} Diamond Aircraft Industries GmbH DA 40 D D4.000 ${known[0]}`,
  'Registered HS-NEW Diamond Aircraft Industries GmbH DA 40 NG 40.N500 Sky Flying Academy Co., Ltd.',
  'Registered HS-XXX ?? garbled FLYING line without a maker',
].map(l => layout ? l.replace(/(Registered|Deregistered) (HS-\w+) (Robinson Helicopter Company|Cessna Aircraft Company|Diamond Aircraft Industries GmbH) (.+?) (\S+) (PRIVATE AIRCRAFT|Sky Flying.*|CIVIL.*)$/, '$1  $2  $3  $4  $5  $6') : l);
const header = 'Thailand Aircraft Register as at 9th July 2026\nC of R Status  Registration Mark  Manufacturer  Model Name  Serial No.  Operator\n';
const sample = committed.rows.filter((_, i) => i % 9 === 0);
const build = (layout, rows = sample, ops = r => r[3]) => header + rows.map(r => rowText(r, 'Registered', layout, ops(r))).join('\n') + '\n' + extras(layout).join('\n') + '\n';

test('as-at date parsing and label', () => {
  assert.equal(R.parseAsAt('Thailand Aircraft Register as at 9th July 2026'), '2026-07-09');
  assert.equal(R.parseAsAt('as at 14 January 2026'), '2026-01-14');
  assert.equal(R.parseAsAt('as at 1st December 2027'), '2027-12-01');
  assert.equal(R.parseAsAt('nothing'), null);
  assert.equal(R.asAtLabel('2026-07-09'), '9th July 2026');
  assert.equal(R.asAtLabel('2026-01-14'), '14th January 2026');
  assert.equal(R.asAtLabel('2026-03-22'), '22nd March 2026');
  assert.equal(R.asAtLabel('2026-10-11'), '11th October 2026');
});

test('flattened and layout text give the same rows; title-case operators match', () => {
  const a = R.parseRegisterText(build(false), known), b = R.parseRegisterText(build(true), known);
  const key = r => [r.status, r.reg, r.model, r.serial, r.operator.toUpperCase(), r.rotor].join('|');
  assert.deepEqual(a.rows.map(key), b.rows.map(key));
  assert.ok(a.rows.length >= sample.length + 3);
  const t = R.parseRegisterText(build(false, sample, r => title(r[3])), known);
  const sel = R.selectRows(t.rows, known);
  assert.deepEqual(sel.rows.map(r => r[0]).sort(), sample.map(r => r[0]).sort());
  assert.ok(sel.rows.every(r => known.includes(r[3])), 'operators normalised to the OPS spelling');
  assert.equal(a.ignored.length, 0, 'header lines are not counted as ignored');
});

test('unsplittable line goes to unparsed', () => {
  const p = R.parseRegisterText(build(false), known);
  assert.equal(p.unparsed.length, 1);
  assert.equal(p.unparsed[0].reg, 'HS-XXX');
});

test('selection: rotorcraft, private, other status, candidates', () => {
  const sel = R.selectRows(R.parseRegisterText(build(false), known).rows, known);
  assert.equal(sel.rotorDropped, 1);
  assert.equal(sel.otherStatus.length, 1);
  assert.equal(sel.otherStatus[0].status, 'Deregistered');
  assert.equal(sel.candidates.length, 1);
  assert.deepEqual(sel.candidates[0], ['HS-NEW', 'DA 40 NG', '40.N500', 'SKY FLYING ACADEMY CO., LTD.']);
  assert.equal(sel.notSchool, 1);
  assert.equal(sel.rows.length, sample.length);
  assert.ok(!sel.rows.some(r => r[0] === 'HS-PRV'));
  // OPS order like the committed file
  const order = sel.rows.map(r => known.indexOf(r[3]));
  assert.deepEqual(order, [...order].sort((x, y) => x - y));
});

test('output JSON has the shape and layout of the committed file', () => {
  const text = R.registerJson(committed.rows, '2026-07-09', 'x.pdf');
  const j = JSON.parse(text);
  assert.deepEqual(Object.keys(j), Object.keys(committed));
  assert.deepEqual(Object.keys(j._meta), Object.keys(committed._meta));
  assert.deepEqual(j.rows, committed.rows);
  assert.equal(text.split('\n').slice(5, 8).join('\n'), committedText.split('\n').slice(5, 8).join('\n'));
  assert.ok(text.endsWith(' ]\n}\n'));
  assert.equal(text.split('\n')[0], '{'); assert.equal(text.split('\n')[1], ' "_meta": {');
});

test('diff by registration mark', () => {
  const o = committed.rows.slice(0, 4), n = o.map(r => [...r]);
  n[0][1] = 'DA 40'; n[1][3] = 'THAI FLYING CLUB'; n.splice(2, 1); n.push(['HS-NEW', '172S', '172S9', 'PHOENIX AERO CLUB']);
  const d = R.diffRows(o, n);
  assert.deepEqual(d.added.map(r => r[0]), ['HS-NEW']);
  assert.deepEqual(d.removed.map(r => r[0]), [o[2][0]]);
  assert.deepEqual(d.changed.map(c => c.reg), [o[0][0], o[1][0]]);
  assert.deepEqual(d.changed[0].changes[0], { field: 'model', from: o[0][1], to: 'DA 40' });
  assert.ok(d.newOperators.includes('THAI FLYING CLUB') || o.some(r => r[3] === 'THAI FLYING CLUB'));
  assert.equal(R.diffRows(o, o).identical, true);
});

test('registerDue with fixed dates', () => {
  const ctx = today => ({ root: ROOT, today });
  const a = R.registerDue(ctx('2026-07-09'));
  assert.equal(a.newest, '2026-07-09'); assert.equal(a.ageDays, 0); assert.equal(a.nextExpected, '2027-01-09'); assert.equal(a.overdue, false);
  const b = R.registerDue(ctx('2026-11-26'));
  assert.equal(b.ageDays, 140); assert.equal(b.overdue, false); assert.match(b.lines.join('\n'), /ค่าประมาณ/);
  assert.equal(R.registerDue(ctx('2027-02-09')).overdue, false);
  assert.equal(R.registerDue(ctx('2027-02-10')).overdue, true);
  assert.equal(R.addMonths('2026-08-31', 6), '2027-02-28');
});

test('Cloudflare challenge and register links', () => {
  assert.equal(R.isChallenge(403, 'HTTP/2 403\r\ncf-mitigated: challenge\r\n'), true);
  assert.equal(R.isChallenge(403, 'HTTP/2 403\r\n'), false);
  assert.equal(R.isChallenge(200, 'cf-mitigated: challenge'), false);
  const html = '<a href="https://www.caat.or.th/wp-content/uploads/2026/08/Thailand-Aircraft-Register-as-at-9th-July-2026.pdf">x</a>';
  assert.deepEqual(R.findRegisterLinks(html).map(l => l.date), ['2026-07-09']);
});

const mkctx = () => ({ root: ROOT, outDir: fs.mkdtempSync(path.join(os.tmpdir(), 'reg-test-')), today: '2026-11-26' });

test('runRegister without input: blocked site gives instructions, exit 0 (not overdue) or 2 (overdue)', async () => {
  const fetch = () => ({ status: 403, headers: 'cf-mitigated: challenge', body: '' });
  const c = mkctx();
  const r = await R.runRegister([], { ...c, fetch });
  assert.equal(r.exitCode, 0); assert.match(r.lines.join('\n'), /watch\.mjs register --pdf/);
  const r2 = await R.runRegister([], { ...c, fetch, today: '2027-03-01' });
  assert.equal(r2.exitCode, 2);
  fs.rmSync(c.outDir, { recursive: true });
});

test('runRegister end to end: identical rows exit 0, changed rows exit 1', async () => {
  const c = mkctx();
  const f = path.join(c.outDir, 'same.txt');
  fs.writeFileSync(f, header + committed.rows.map(r => rowText(r)).join('\n') + '\n' + extras(false).slice(0, 3).join('\n') + '\n');
  const r = await R.runRegister(['--text', f], c);
  assert.equal(r.exitCode, 0, r.lines.join('\n'));
  const out = path.join(c.outDir, 'register', 'ls_register_2026-07-09.json');
  assert.deepEqual(JSON.parse(fs.readFileSync(out, 'utf8')).rows, committed.rows);
  assert.equal(r.report.counts.rotorcraftDropped, 1);

  fs.writeFileSync(f, header + committed.rows.slice(1).map(r => rowText(r)).join('\n') + '\n' + extras(false).slice(3, 4).join('\n') + '\n');
  const r2 = await R.runRegister(['--text', f], c);
  assert.equal(r2.exitCode, 1);
  assert.equal(r2.report.diff.removed.length, 1);
  assert.equal(r2.report.candidates.length, 1);
  assert.equal(r2.report.fleet.blockChanges, true);

  const g = path.join(c.outDir, 'nodate.txt'); fs.writeFileSync(g, committed.rows.map(r => rowText(r)).join('\n') + '\n');
  assert.equal((await R.runRegister(['--text', g], c)).exitCode, 2, 'no as-at date');
  assert.equal((await R.runRegister(['--text', g, '--date', '2026-07-09'], c)).exitCode, 0);
  fs.rmSync(c.outDir, { recursive: true });
});

test('ls_fleet.mjs --register reproduces the committed block and leaves scripts/out untouched', () => {
  const hashes = () => Object.fromEntries(fs.readdirSync(OUT).map(f => [f, crypto.createHash('sha256').update(fs.readFileSync(path.join(OUT, f))).digest('hex')]));
  const before = hashes(), tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'fleet-test-'));
  const r = spawnSync(process.execPath, [path.join(ROOT, 'docs/research/02-light-aircraft/scripts/ls_fleet.mjs'), '--register', COMMITTED], { env: { ...process.env, LM_OUT_DIR: tmp }, encoding: 'utf8' });
  assert.equal(r.status, 0, r.stderr);
  assert.equal(fs.readFileSync(path.join(tmp, 'ls_thai_fleet_block.json'), 'utf8'), fs.readFileSync(path.join(OUT, 'ls_thai_fleet_block.json'), 'utf8'));
  assert.deepEqual(hashes(), before);
  fs.rmSync(tmp, { recursive: true });
});

const K = known[0];
test('known operator that is only the tail of a longer name is not taken', () => {
  const r = R.parseRow('Registered HS-ABC Cessna Aircraft Company 172S 172S1234 NEW ' + K, known);
  assert.equal(r.operator, 'NEW ' + K); assert.equal(r.serial, '172S1234'); assert.equal(r.model, '172S');
  const ok = R.parseRow('Registered HS-ABC Cessna Aircraft Company 172S 172S1234 ' + K, known);
  assert.equal(ok.operator, K); assert.equal(ok.serial, '172S1234');
  const sel = R.selectRows([r], known);
  assert.equal(sel.rows.length, 0); assert.equal(sel.candidates.length, 0 + (/TRAINING|FLYING|FLIGHT|ACADEMY|UNIVERSITY|COLLEGE|CLUB|INSTITUTE|SCHOOL|AERO/i.test(r.operator) ? 1 : 0));
});

test('unknown maker: known operator gives a row, school-like name unparsed, the rest notSchool', () => {
  const a = R.parseRow('Registered HS-ABC Zlin Z-242L 0123 ' + K, known);
  assert.equal(a.operator, K); assert.equal(a.serial, '0123'); assert.ok(!a.unparsed);
  const b = R.parseRow('Registered HS-ABC Zlin Z-242L 0123 Foo Bar Baz', known);
  assert.ok(!b.unparsed && b.other); assert.equal(R.selectRows([b], known).notSchool, 1);
  assert.ok(R.parseRow('Registered HS-ABC Zlin Z-242L 0123 Foo Flying Club', known).unparsed);
});

test('duplicate marks keep the first and are reported', () => {
  const rows = committed.rows.slice(0, 3), t = header + [...rows, rows[2]].map(r => rowText(r)).join('\n') + '\n';
  const sel = R.selectRows(R.parseRegisterText(t, known).rows, known);
  assert.equal(sel.rows.length, 3); assert.deepEqual(sel.duplicates, [{ reg: rows[2][0], same: true }]);
});

test('2-character marks are not data rows; wrapped lines are counted', () => {
  assert.equal(R.parseRow('Registered HS-AB Cessna 172S 172S1234 ' + K, known), null);
  const p = R.parseRegisterText(rowText(committed.rows[0]) + '\nCONTINUED NAME LINE\n', known);
  assert.equal(p.continuations, 1);
});

test('bad options and unreadable layouts exit 2 with a clear message', async () => {
  const c = mkctx(), f = path.join(c.outDir, 'x.txt');
  for (const a of [['--text'], ['--pdf'], ['--text', f, '--date']]) assert.equal((await R.runRegister(a, c)).exitCode, 2, a.join(' '));
  fs.writeFileSync(f, header);
  const r0 = await R.runRegister(['--text', f], c); assert.equal(r0.exitCode, 2); assert.match(r0.lines.join('\n'), /แยกแถวไม่ได้/);
  fs.writeFileSync(f, header + committed.rows.map(r => rowText(r)).join('\n') + '\n');
  for (const d of ['2026-13-45', '2026-02-30']) assert.equal((await R.runRegister(['--text', f, '--date', d], c)).exitCode, 2, d);
  assert.equal(R.validDate('2026-07-09'), true);
  fs.writeFileSync(f, header + committed.rows.slice(0, 5).map(r => rowText(r)).join('\n') + '\n');
  assert.match((await R.runRegister(['--text', f], c)).lines.join('\n'), /แยกแถวไม่ได้/);
  fs.rmSync(c.outDir, { recursive: true });
});
