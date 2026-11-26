#!/usr/bin/env node
// Watch for AIRAC cycles of AIP Thailand (AD 2 VTBD) and for the CAAT aircraft register (plan item A10; research round 2
// R2-09, round 5 R5-P3-7 and R5-S1-8). It uses the network (aip.caat.or.th through the system curl), so CI never runs
// it; test/watch.test.mjs runs it on synthetic pages with --from. Output goes to .cache/watch/ (git-ignored) or --out.
//   node tools/watch/watch.mjs aip [--out dir] [--from dir] [--refresh] [--research] [--today YYYY-MM-DD]
//   node tools/watch/watch.mjs due [--today YYYY-MM-DD]
//   node tools/watch/watch.mjs register [options of tools/watch/register.mjs]
//   node tools/watch/watch.mjs all [aip options] [--pdf file | --text file]
// Exit: 0 nothing to do, 1 a person must read or update something, 2 could not decide (network or parse failure).
// The AIP pages are © CAAT: they stay in the cache folder; nothing of their text goes into a tracked file.
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import * as L from './lib.mjs';
import { makeSource } from './net.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const FIXTURE = 'test/fixtures/aip_vtbd_current.json', REVIEWED = 'tools/watch/reviewed.json';
const RESEARCH_SCRIPTS = ['docs/research/02-light-aircraft/scripts/ls_aip_check.mjs', 'docs/research/02-light-aircraft/scripts/lo_aip_check.mjs'];
const HELP = `เฝ้ารอบ AIRAC ของ AIP Thailand (AD 2 VTBD) และทะเบียนอากาศยานของ CAAT (แผนงาน A10)

ใช้: node tools/watch/watch.mjs <aip|due|register|all> [ตัวเลือก]
  aip       อ่านดัชนี eAIP (https://aip.caat.or.th/) เทียบ AD 2 VTBD ของแต่ละฉบับที่ใหม่กว่าฉบับของ repo
            (${FIXTURE} meta.airac_effective) กับฉบับก่อนหน้าทีละหัวข้อ (หัวข้อที่เปลี่ยนต้องอยู่ใน
            meta.next_issues ของฉบับนั้นเอง) ตรวจค่าทุกค่าใน fixture กับข้อความของแต่ละฉบับ อ่านรายการแก้ไข (AMDT)
            และรายการ SUP/AIC ของฉบับที่มีผลอยู่และฉบับใหม่สุด แล้วเทียบกับ ${REVIEWED}
  due       ไม่ใช้เครือข่าย: วัน AIRAC ถัดไป, meta.recheck_before เหลือกี่วัน (exit 1 ตั้งแต่ 42 วันก่อนวันนั้น
            ซึ่งเป็นวันที่ฉบับนั้นเผยแพร่) และกำหนดของทะเบียนอากาศยาน
  register  ส่งต่อให้ tools/watch/register.mjs (เช่น --pdf <ไฟล์> หรือ --text <ไฟล์>)
  all       aip แล้วตามด้วยกำหนดของทะเบียน (หรือ register เต็มเมื่อมี --pdf/--text) exit = ค่าที่แย่ที่สุด

ตัวเลือก
  --out <dir>       ที่เก็บรายงานและแคช (ค่าเริ่มต้น .cache/watch/ ซึ่ง git ไม่เก็บ; ถ้าอยู่ใน repo ต้องเป็นที่ git ignore)
  --from <dir>      อ่านหน้าจากโฟลเดอร์แทนเครือข่าย: <dir>/index.html และ <dir>/<YYYY-MM-DD>/<ชื่อไฟล์>
  --refresh         ดาวน์โหลดหน้าที่อยู่ในแคชใหม่
  --research        รัน ls_aip_check.mjs และ lo_aip_check.mjs ของงานวิจัยรอบ 2 กับฉบับที่ใหม่กว่าด้วย
                    (รันสำเนาใน <out>/research/ ผลอยู่ใน <out>/research/out/ ไฟล์ใน repo ไม่เปลี่ยน)
  --today <date>    ใช้วันนี้เป็นวันที่อื่น (YYYY-MM-DD) ทุกที่
  --reviewed <file> ใช้ไฟล์อื่นแทน ${REVIEWED} (สำหรับเทสต์)
  --fixture <file>  ใช้ไฟล์อื่นแทน ${FIXTURE} (สำหรับเทสต์)
ทุก path ที่ให้ อ่านจากโฟลเดอร์ปัจจุบัน · ตัวเลือกที่ไม่รู้จักหรือคำเกินมาจบด้วย exit 2

Exit: 0 ไม่มีอะไรต้องทำ · 1 ต้องมีคนอ่านหรือแก้บางอย่าง · 2 ตัดสินไม่ได้ (เครือข่ายหรืออ่านหน้าไม่ได้)`;

// ---- arguments -------------------------------------------------------------------------------------------------
const VALUE_OPTS = new Set(['--out', '--from', '--today', '--reviewed', '--fixture']), FLAG_OPTS = new Set(['--refresh', '--research', '--help', '-h']);
const REGISTER_VALUE_OPTS = new Set(['--pdf', '--text', '--date']);   // read by tools/watch/register.mjs
// the options of each command; register checks its own, so its options pass through as they are
const AIP_OPTS = ['--out', '--from', '--today', '--reviewed', '--fixture', '--refresh', '--research'];
const ALLOWED = { aip: AIP_OPTS, due: ['--today', '--fixture'], all: [...AIP_OPTS, ...REGISTER_VALUE_OPTS] };
export function parseArgs(argv) {
  const o = { cmd: null, rest: [], errors: [], seen: [], words: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!o.cmd && !a.startsWith('-')) { o.cmd = a; continue; }
    if (o.cmd) o.rest.push(a);
    if (a.startsWith('-')) o.seen.push(a); else if (o.cmd) o.words.push(a);
    if (VALUE_OPTS.has(a) || REGISTER_VALUE_OPTS.has(a)) {
      const v = argv[i + 1];
      if (v === undefined || v.startsWith('--')) o.errors.push(`${a} ต้องมีค่าตามหลัง`);
      else { if (VALUE_OPTS.has(a)) o[a.slice(2)] = v; if (o.cmd) o.rest.push(v); i++; }
    } else if (FLAG_OPTS.has(a)) o[a === '-h' ? 'help' : a.slice(2)] = true;
  }
  if (o.today !== undefined && !L.isDate(o.today)) o.errors.push(`--today ต้องเป็นวันที่ YYYY-MM-DD (ได้ "${o.today}")`);
  const ok = ALLOWED[o.cmd];
  if (ok) {   // a typo such as --fromm must not quietly fall back to the network
    for (const a of o.seen) if (!ok.includes(a) && a !== '--help' && a !== '-h')
      o.errors.push(VALUE_OPTS.has(a) || FLAG_OPTS.has(a) || REGISTER_VALUE_OPTS.has(a) ? `ตัวเลือก ${a} ใช้กับคำสั่ง ${o.cmd} ไม่ได้` : `ไม่รู้จักตัวเลือก ${a}`);
    if (o.words.length) o.errors.push(`มีคำเกินมาหลังคำสั่ง ${o.cmd}: ${o.words.join(' ')}`);
  }
  return o;
}
const todayUTC = () => new Date().toISOString().slice(0, 10);
const rel = (p) => (path.isAbsolute(p) && p.startsWith(ROOT + path.sep) ? path.relative(ROOT, p) : p);
// a path given on the command line is read from the current folder (as --out and --from); the defaults live in the repo
const resolveIn = (p, def) => (p ? path.resolve(p) : path.join(ROOT, def));
// Reports and cached pages hold AIP text (© CAAT) and SUP/AIC titles: an --out inside the repo must be git-ignored
function outProblem(dir) {
  const r = path.relative(ROOT, dir);
  if (r.startsWith('..') || path.isAbsolute(r)) return null;   // outside the repo
  if (r === '.cache' || r.startsWith('.cache' + path.sep)) return null;   // .gitignore: .cache/
  const g = spawnSync('git', ['check-ignore', '-q', path.join(dir, 'report-aip.json')], { cwd: ROOT, encoding: 'utf8' });
  if (g.status === 0) return null;
  return `--out ${dir} อยู่ใน repo แต่ git ไม่ได้ ignore (${g.status === 1 ? 'ไม่อยู่ใน .gitignore' : 'ตรวจด้วย git check-ignore ไม่ได้'}): `
    + 'รายงานและแคชมีข้อความ AIP (© CAAT) และชื่อเรื่อง SUP/AIC ห้าม commit ใช้ .cache/ (ค่าเริ่มต้น) หรือโฟลเดอร์นอก repo';
}
function readFixture(o) {
  const f = resolveIn(o.fixture, FIXTURE), j = JSON.parse(fs.readFileSync(f, 'utf8'));
  const fx = j.aip_vtbd_current ?? j;
  if (!L.isDate(fx?.meta?.airac_effective)) throw new Error(`${rel(f)}: meta.airac_effective is not a date`);
  return { fx, file: f };
}
// meta.recheck_before is the next AIRAC not yet checked; its package is out 42 days before (L.airacPublished)
const recheckState = (meta, today) => {
  const rb = meta.recheck_before;
  if (!L.isDate(rb)) return { date: null, left: null, passed: true, publish: null, published: true };
  const left = L.daysBetween(today, rb), publish = L.airacPublished(rb);
  return { date: rb, left, passed: left <= 0, publish, published: today >= publish };   // due on the day itself: that day's AIRAC is already in force
};
// AD 2.x sections a next_issues record names as changed ("none ..." names none)
const recordedSections = (rec) => (!rec || /^\s*none\b/i.test(rec.vtbd_changes ?? '') ? [] : [...new Set([...String(rec.vtbd_changes).matchAll(/AD\s*2\.(\d+)/g)].map((m) => `AD 2.${m[1]}`))]);
const short = (s, n = 110) => (s.length > n ? s.slice(0, n - 1) + '…' : s);
const D = (iso) => (iso ? L.fmtDMY(iso) : '?');
// The changed lines of a section diff for the console: each '-' line beside the '+' line it pairs with in its hunk,
// both cut to the same window of n characters around their first difference (long rows of AD 2.20 or AD 2.22 would
// otherwise print two identical cut lines). more: something was cut or left out (the .md report has it all).
export function diffPreview(diff, { max = 4, n = 110 } = {}) {
  const ls = diff.filter((l) => /^[-+] /.test(l)), out = [];
  let cut = false;
  const win = (s, from) => { const head = from > 0 ? '…' : '', room = n - 2 - head.length, b = s.slice(from); return head + (b.length > room ? b.slice(0, room - 1) + '…' : b); };
  for (let i = 0; i < ls.length && out.length < max;) {
    let j = i; while (j < ls.length && ls[j][0] === '-') j++;
    let k = j; while (k < ls.length && ls[k][0] === '+') k++;
    const minus = ls.slice(i, j), plus = ls.slice(j, k);
    for (let q = 0; q < Math.max(minus.length, plus.length); q++) {
      const a = minus[q], b = plus[q];
      if (a && b) {
        const x = a.slice(2), y = b.slice(2);
        if (x.length + 2 <= n && y.length + 2 <= n) { out.push(a, b); continue; }
        let p = 0; while (p < x.length && p < y.length && x[p] === y[p]) p++;
        const from = Math.max(0, p - 24);
        out.push(`- ${win(x, from)}`, `+ ${win(y, from)}`); cut = true;
      } else { const l = a ?? b; if (l.length > n) cut = true; out.push(short(l, n)); }
    }
    i = k;
  }
  return { lines: out.slice(0, max), more: cut || ls.length > Math.min(out.length, max) };
}

// ---- aip ---------------------------------------------------------------------------------------------------------
export async function runAip(o, ctx) {
  const lines = [], actions = [], infos = [], failures = [];
  const R = { tool: 'watch aip', today: ctx.today, source: o.from ? `from ${o.from}` : 'network (curl)', actions, infos, failures };
  const finish = () => {
    const exitCode = failures.length ? 2 : actions.length ? 1 : 0;
    R.exit_code = exitCode;
    lines.push(...summary(R));
    try {
      fs.mkdirSync(ctx.outDir, { recursive: true });
      const base = path.join(ctx.outDir, `report-aip-${ctx.today}`);
      fs.writeFileSync(base + '.json', JSON.stringify(R, null, 1) + '\n');
      fs.writeFileSync(base + '.md', reportMd(R));
      lines.push(`รายงาน: ${rel(base)}.md และ .json`);
    } catch (e) { lines.push(`เขียนรายงานไม่ได้: ${e.message}`); }
    lines.push(`exit ${exitCode} (${['ไม่มีอะไรต้องทำ', 'ต้องมีคนอ่านหรือแก้', 'ตัดสินไม่ได้'][exitCode]})`);
    return { exitCode, lines, report: R };
  };

  let fx, fxFile;
  try { ({ fx, file: fxFile } = readFixture(o)); } catch (e) { failures.push(`อ่าน fixture ไม่ได้: ${e.message}`); return finish(); }
  const meta = fx.meta, repoDate = meta.airac_effective, recorded = new Map((meta.next_issues ?? []).map((n) => [n.effective, n]));
  const rc = recheckState(meta, ctx.today);
  R.fixture = { file: rel(fxFile), airac_effective: repoDate, amdt: meta.amdt, next_issues: [...recorded.keys()], recheck_before: rc.date, days_left: rc.left, publish_expected: rc.publish };

  const src = makeSource({ from: o.from ? path.resolve(o.from) : null, cacheDir: path.join(ctx.outDir, 'aip'), refresh: !!o.refresh, log: (s) => process.stderr.write(s + '\n') });
  const hint = o.from ? '' : ' (ลอง --refresh)';
  R.pages = src.used;
  // 1. the index of editions
  let index;
  try { index = L.parseIndex(src.index(L.EAIP_ROOT)); } catch (e) { failures.push(`อ่านดัชนี eAIP ไม่ได้: ${e.message}`); return finish(); }
  if (!index.editions.length) { failures.push('ดัชนี eAIP ไม่มีรายการฉบับใดเลย (โครงสร้างหน้าอาจเปลี่ยน)'); return finish(); }
  for (const w of index.warnings) infos.push(`ดัชนี: ${w}`);
  const eds = [...index.editions].sort((a, b) => a.effective.localeCompare(b.effective));
  const repoEd = eds.find((e) => e.effective === repoDate), later = eds.filter((e) => e.effective > repoDate), newest = eds.at(-1);
  const inForce = eds.filter((e) => e.effective <= ctx.today).at(-1) ?? null;   // the edition in force on --today
  R.index = { editions: eds.length, current: eds.filter((e) => e.status === 'current').map((e) => e.effective), next: eds.filter((e) => e.status === 'next').map((e) => e.effective), newest: newest.effective, in_force: inForce?.effective ?? null, later: later.map((e) => e.effective) };
  if (!repoEd) { failures.push(`ฉบับของ repo ${D(repoDate)} ไม่อยู่ในดัชนี eAIP`); return finish(); }
  for (const d of recorded.keys()) if (!eds.some((e) => e.effective === d)) infos.push(`fixture บันทึกฉบับ ${D(d)} แต่ดัชนีไม่มีฉบับนี้`);

  // 2. pages of the repo edition and of every later edition. A page of an edition not yet in force may still be
  // corrected: at most a day old. Once in force: the copy fetched since its effective date. The SUP/AIC lists can
  // change between packages: at most a day old. A page that fails its check (L.PAGE_CHECK) is never cached.
  const get = (ed, which) => {
    try {
      return src.page(ed.effective, L.editionUrl(ed.folder, which), { maxAgeH: ed.effective > ctx.today || ['sups', 'aics'].includes(which) ? 24 : Infinity,
        notBefore: ed.effective, check: L.PAGE_CHECK[which] });
    } catch (e) { failures.push(`${which} ของฉบับ ${D(ed.effective)}: ${e.message}${['ad2', 'amdt', 'cover'].includes(which) ? hint : ''}`); return null; }
  };
  const editionData = (ed) => {
    const x = { effective: ed.effective, published: ed.published, amdt: ed.amdt, status: ed.status, folder: ed.folder };
    const h = get(ed, 'ad2');
    if (h !== null) {
      const ad2 = L.splitAd2(h, { edition: ed });
      if (ad2.order.length) x.ad2 = ad2; else failures.push(`อ่าน AD 2 VTBD ของฉบับ ${D(ed.effective)} ไม่ได้: ไม่พบหัวข้อ VTBD-AD-2.n${hint}`);
      if (ad2.duplicates.length) failures.push(`AD 2 VTBD ของฉบับ ${D(ed.effective)} มีหัวข้อซ้ำ: ${[...new Set(ad2.duplicates)].join(', ')} (หน้าอาจเสีย${hint ? '; ลอง --refresh' : ''}; เนื้อหาทุกส่วนถูกรวมไว้ในหัวข้อนั้นแล้ว)`);
    }
    const a = get(ed, 'amdt'); if (a !== null) x.amdt_list = L.parseAmdt(a);
    const c = get(ed, 'cover'); if (c !== null) x.cover = L.parseCover(c, L.editionUrl(ed.folder, 'cover'));
    return x;
  };
  const base = editionData(repoEd);
  if (!base.ad2) { if (!failures.length) failures.push('อ่าน AD 2 VTBD ของฉบับ repo ไม่ได้'); return finish(); }
  const all = [base, ...later.map(editionData)];
  R.editions = [];
  let coverage = null, prev = null, carry = [];
  // Each later edition is compared with the edition before it (the repo edition for the first), and a changed
  // section passes only when that edition's own next_issues record names it. A record that names a section which
  // did not change is flagged too. An edition whose AD 2 page could not be read (exit 2) hands its record on.
  for (const x of all) {
    const isRepo = x === base, rec = recorded.get(x.effective);
    const E = { effective: x.effective, amdt: x.amdt, published: x.published, status: x.status, record: isRepo ? 'repo' : rec ? 'recorded' : 'new', problems: [] };
    R.editions.push(E);
    if (x.amdt_list) {
      E.amdt_list = { effective: x.amdt_list.effective, names_ad2_vtbd: x.amdt_list.namesAd2, sections: x.amdt_list.sections, vtbd_mentions: x.amdt_list.mentions };
      if (x.amdt_list.effective && x.amdt_list.effective !== x.effective) infos.push(`รายการแก้ไขของฉบับ ${D(x.effective)} ระบุวันมีผล ${D(x.amdt_list.effective)}`);
      if (!isRepo && !x.amdt_list.namesAd2 && x.amdt_list.mentions > 0) infos.push(`ฉบับ ${D(x.effective)}: รายการแก้ไข (AMDT) กล่าวถึง VTBD หรือ Don Mueang ${x.amdt_list.mentions} ครั้งนอก AD 2 VTBD (เช่น GEN, ENR, AD 1): เปิดดูว่ากระทบ repo หรือไม่`);
    }
    if (x.cover) {
      E.cover = { effective: x.cover.effective, amdt: x.cover.amdt, items: x.cover.items.map((i) => `${i.kind.toUpperCase()} ${i.id}${i.nolink ? ' (no link)' : ''}`) };
      if (x.cover.effective && x.cover.effective !== x.effective) infos.push(`ปกของฉบับ ${D(x.effective)} ระบุวันมีผล ${D(x.cover.effective)}`);
    }
    if (!x.ad2) { E.verdict = 'unknown'; if (!isRepo) carry.push(...recordedSections(rec)); continue; }
    const facts = L.checkFacts(fx, x.ad2);
    if (isRepo) coverage = L.factCoverage(fx, facts);
    const failed = facts.filter((f) => f.status === 'fail');
    E.facts = { total: facts.length, pass: facts.filter((f) => f.status === 'pass').length, derived: facts.filter((f) => f.status === 'derived').length, failed: failed.map((f) => ({ id: f.id, section: f.section, why: f.why, paths: f.paths })) };
    if (failed.length) E.problems.push(`ค่าใน fixture ไม่ตรงข้อความ ${failed.length} ค่า: ${failed.slice(0, 4).map((f) => `${f.id} (${f.section}: ${f.why})`).join('; ')}${failed.length > 4 ? ' ...' : ''}`);
    if (isRepo) {
      E.sections = { total: x.ad2.order.length };
      if (failed.length) E.problems[E.problems.length - 1] += ' — fixture ไม่ตรงกับฉบับของตัวเอง';
    } else {
      const own = recordedSections(rec), named = new Set([...own, ...carry]), cmp = L.compareAd2(prev.ad2, x.ad2);
      const changed = cmp.filter((c) => ['changed', 'added', 'removed'].includes(c.status)), cosmetic = cmp.filter((c) => c.status === 'cosmetic');
      const differs = new Set([...changed, ...cosmetic].map((c) => c.section)), unrec = changed.filter((c) => !named.has(c.section));
      E.sections = { against: prev.effective, total: x.ad2.order.length, same: cmp.filter((c) => c.section !== 'head' && c.status === 'same').length,
        cosmetic: cosmetic.map((c) => ({ section: c.section, diff: c.diff })), changed: changed.map((c) => ({ section: c.section, status: c.status, recorded: named.has(c.section), added: c.added.length, removed: c.removed.length, diff: c.diff })) };
      if (unrec.length) E.problems.push(`AD 2 VTBD เปลี่ยนจากฉบับ ${D(prev.effective)}${rec ? ' โดย next_issues ของฉบับนี้ไม่ได้บันทึก' : ''}: ${unrec.map((c) => `${c.section} (${c.status}, +${c.added.length}/-${c.removed.length} บรรทัด)`).join(', ')}`);
      const still = own.filter((s) => !differs.has(s));
      if (still.length) E.problems.push(`next_issues ของฉบับนี้บันทึกว่า ${still.join(', ')} เปลี่ยน แต่ข้อความเหมือนฉบับ ${D(prev.effective)} (แก้ vtbd_changes)`);
      for (const c of changed.filter((c) => named.has(c.section))) infos.push(`ฉบับ ${D(x.effective)}: ${c.section} เปลี่ยนจากฉบับ ${D(prev.effective)} ตามที่ next_issues ของฉบับนี้บันทึกไว้`);
      for (const c of cosmetic) infos.push(`ฉบับ ${D(x.effective)}: ${c.section} ต่างจากฉบับ ${D(prev.effective)} แค่ตัวพิมพ์เล็กใหญ่หรือช่องว่าง (ดูในรายงาน)`);
      if (x.amdt_list?.namesAd2 && E.record === 'recorded' && /^\s*none\b/i.test(rec.vtbd_changes ?? '')) E.problems.push(`รายการแก้ไข (AMDT) กล่าวถึง AD 2 VTBD (${x.amdt_list.sections.join(', ') || 'หน้า VTBD'}) แต่ fixture บันทึกว่าไม่เปลี่ยน`);
      if (E.record === 'new') {
        E.problems.unshift(`ฉบับ ${D(x.effective)} (AMDT ${x.amdt ?? '?'}) เผยแพร่แล้วแต่ยังไม่อยู่ใน meta.next_issues`);
        const clean = !unrec.length && !failed.length && !x.amdt_list?.namesAd2;
        E.next_issue_stub = clean ? { effective: x.effective, amdt: `${x.amdt ?? '?'}${x.published ? `, published ${x.published}` : ''}`,
          vtbd_changes: `none (AD 2 VTBD text identical to ${D(prev.effective)}${prev === base ? ' without the amendment marks' : ''}${cosmetic.length ? `, apart from letter case or spacing in ${cosmetic.map((c) => c.section).join(', ')}` : ''})`,
          src: `tools/watch/watch.mjs aip, ${ctx.today}` } : null;
      }
      carry = [];
    }
    prev = x;
    E.verdict = E.problems.length ? 'action' : 'ok';
    for (const p of E.problems) actions.push(`ฉบับ ${D(x.effective)}: ${p}`);
  }
  R.coverage = coverage && {
    counts: coverage.reduce((a, c) => ((a[c.status] = (a[c.status] ?? 0) + 1), a), {}),
    not_checked: coverage.filter((c) => !['checked', 'meta'].includes(c.status)).map(({ path: p, status, why }) => ({ path: p, status, why })),
  };
  const unclassified = coverage?.filter((c) => c.status === 'unclassified') ?? [];
  if (unclassified.length) actions.push(`fixture มีค่าที่ยังไม่มีกฎตรวจ ${unclassified.length} ค่า: ${unclassified.slice(0, 5).map((c) => c.path).join(', ')} (เพิ่มกฎใน tools/watch/lib.mjs buildFacts หรือ NOT_TEXT)`);
  const newOnes = R.editions.filter((e) => e.record === 'new');
  if (newOnes.length && newOnes.every((e) => e.next_issue_stub)) R.recheck_suggestion = L.airacAfter(newest.effective);

  // 3. SUP and AIC: the lists of the edition in force on --today and of the newest package, and the covers of every
  // later edition (an item in force today can be gone from the newest list; a cover-only item is read from its page)
  const items = new Map(), addItem = (it, from) => { const k = `${it.kind}:${it.id}`; if (items.has(k)) items.get(k).from.push(from); else items.set(k, { ...it, from: [from] }); };
  const listEds = [...new Set([inForce, newest].filter(Boolean))];
  R.lists = [];
  for (const ed of listEds) for (const which of ['sups', 'aics']) {
    const h = get(ed, which);
    if (h === null) continue;
    const kind = which === 'sups' ? 'sup' : 'aic', list = L.parseItemList(h, L.editionUrl(ed.folder, which), kind);
    if (!list.items.length) failures.push(`รายการ ${kind.toUpperCase()} ของฉบับ ${D(ed.effective)} ว่าง (โครงสร้างหน้าอาจเปลี่ยน)`);
    R.lists.push({ edition: ed.effective, in_force: ed === inForce, newest: ed === newest, kind, as_of: list.asOf, items: list.items.length });
    for (const it of list.items) addItem(it, `list ${ed.effective}`);
  }
  for (const x of all.slice(1)) for (const it of x.cover?.items ?? []) addItem(it, `cover ${x.effective}`);
  for (const it of items.values()) if (!it.title && it.url && it.date) {   // a cover gives no title: read the item's own page
    try {
      const p = L.parseItemPage(src.page(it.date, it.url, { check: L.PAGE_CHECK.item }));
      Object.assign(it, { title: p.title, ...(p.effective ? { effective: p.effective } : {}), ...(p.until ? { until: p.until } : {}) });
    } catch (e) { infos.push(`อ่านหน้าของ ${it.kind.toUpperCase()} ${it.id} ไม่ได้ (${e.message.split('\n')[0]}) จึงไม่รู้ชื่อเรื่อง`); }
  }
  const nolink = [...items.values()].filter((i) => i.nolink);
  if (nolink.length) infos.push(`SUP/AIC ที่ไม่มีลิงก์ในรายการหรือปก (id จากข้อความ เปิดหน้าไม่ได้): ${nolink.map((i) => `${i.kind.toUpperCase()} ${i.id} (${i.from.join(', ')})`).join(', ')}`);
  const revFile = resolveIn(o.reviewed, REVIEWED);
  let reviewed = {};
  R.reviewed = { file: rel(revFile), exists: fs.existsSync(revFile), problems: [] };
  if (R.reviewed.exists) {
    try { reviewed = JSON.parse(fs.readFileSync(revFile, 'utf8')); } catch (e) { R.reviewed.problems.push(`JSON: ${e.message}`); reviewed = {}; }
    const titles = Object.fromEntries([...items.values()].map((i) => [`${i.kind}:${i.id}`, i.title]));
    R.reviewed.problems.push(...L.validateReviewed(reviewed, { titles, today: ctx.today }));
    if (R.reviewed.problems.length) actions.push(`${rel(revFile)} มีปัญหา ${R.reviewed.problems.length} ข้อ: ${R.reviewed.problems.slice(0, 3).join('; ')}${R.reviewed.problems.length > 3 ? ' ...' : ''}`);
  } else infos.push(`ยังไม่มี ${rel(revFile)}: ถือว่ายังไม่ได้อ่าน SUP/AIC ใดเลย`);
  const cmp = L.compareItems([...items.values()], reviewed);
  const pick = (i) => ({ kind: i.kind, id: i.id, class: i.class, title: i.title, url: i.url, folder: i.folder, from: i.from, ...(i.nolink ? { nolink: true } : {}), ...(i.effective ? { in: i.effective } : {}), ...(i.until ? { until: i.until } : {}) });
  const tag = (i) => `${i.kind.toUpperCase()} ${i.id}`;
  const nowList = inForce && inForce !== newest ? `list ${inForce.effective}` : null, newList = `list ${newest.effective}`;
  const gone = cmp.gone.map((g) => ({ item: tag(g), until: g.review.until ?? null, expired: L.isDate(g.review.until) && g.review.until < ctx.today }));
  R.items = { total: items.size, sup: [...items.values()].filter((i) => i.kind === 'sup').length, aic: [...items.values()].filter((i) => i.kind === 'aic').length,
    reviewed: cmp.reviewedListed.length, unreviewed: cmp.unreviewed.map(pick), vtbd_listed: cmp.vtbdListed.map(tag),
    leaving: nowList ? cmp.reviewedListed.filter((i) => i.from.includes(nowList) && !i.from.includes(newList)).map((i) => ({ item: tag(i), until: i.review.until ?? i.until ?? null })) : [],
    gone };
  const stubs = { sup: {}, aic: {} };
  for (const i of cmp.unreviewed) stubs[i.kind][i.id] = L.reviewStub(i);
  R.items.stubs = stubs;
  const act = cmp.unreviewed.filter((i) => i.class !== 'other');
  if (act.length) actions.push(`SUP/AIC ที่ยังไม่ได้อ่าน ${act.length} รายการ (${['vtbd', 'unclear'].map((c) => `${c} ${act.filter((i) => i.class === c).length}`).join(', ')}): ${act.slice(0, 6).map(tag).join(', ')}${act.length > 6 ? ' ...' : ''}`);
  const oth = cmp.unreviewed.filter((i) => i.class === 'other');
  if (oth.length) infos.push(`SUP/AIC ของสนามบินอื่นที่ยังไม่ได้บันทึก ${oth.length} รายการ (ไม่ต้องรีบ): ${oth.slice(0, 8).map(tag).join(', ')}${oth.length > 8 ? ' ...' : ''}`);
  if (cmp.vtbdListed.length) infos.push(`SUP/AIC ที่เกี่ยวกับ VTBD และยังอยู่ในรายการ: ${R.items.vtbd_listed.join(', ')} (ยังมีผล อย่าลืมดูว่า repo ต้องทำอะไร)`);
  const u = (x) => (x.until ? ` (ถึง ${x.until})` : '');
  if (R.items.leaving.length) infos.push(`ยังมีผลวันนี้ (อยู่ในรายการของฉบับ ${D(inForce.effective)}) แต่ไม่อยู่ในรายการของฉบับ ${D(newest.effective)}: ${R.items.leaving.map((x) => x.item + u(x)).join(', ')} (หมดอายุหรือถูกยกเลิกก่อนฉบับนั้น)`);
  const expired = gone.filter((g) => g.expired), lost = gone.filter((g) => !g.expired);
  if (expired.length) infos.push(`หมดอายุแล้วและไม่อยู่ในรายการ: ${expired.map((x) => x.item + u(x)).join(', ')}`);
  if (lost.length) infos.push(`ไม่อยู่ในรายการของฉบับ ${listEds.map((e) => D(e.effective)).join(' และ ')} หรือปกแล้ว แต่ reviewed.json ไม่ได้บันทึกว่าหมดอายุ: ${lost.map((x) => x.item + (x.until ? ` (until ${x.until})` : '')).join(', ')} (ถูกยกเลิก ถูกแทน หรือรวมเข้า AIP แล้ว: ตรวจและแก้ status)`);

  // 4. the fixture's recheck date: the edition it names is published 42 days before it takes effect
  if (rc.passed) actions.push(`ถึงหรือเลย meta.recheck_before (${rc.date ?? 'ไม่มีค่า'}) แล้ว: ตรวจฉบับใหม่และเลื่อนวันใน fixture`);
  else if (rc.published && !eds.some((e) => e.effective === rc.date)) infos.push(`ฉบับ ${D(rc.date)} ควรเผยแพร่แล้วตั้งแต่ ${D(rc.publish)} (AIRAC เผยแพร่ล่วงหน้า ${L.AIRAC_PUBLISH_DAYS} วัน) แต่ดัชนี eAIP ยังไม่มี: รันอีกครั้งในวันถัดไป`);
  const recMax = [...recorded.keys()].sort().at(-1);
  if (rc.date && recMax && recMax >= rc.date) actions.push(`next_issues บันทึกถึงฉบับ ${D(recMax)} แล้ว แต่ meta.recheck_before ยังเป็น ${rc.date}: เลื่อนเป็น ${L.airacAfter(recMax)}`);

  // 5. research scripts of round 2. They download AD 2 VTBD themselves and write ./out/ beside the script (only
  // node:fs and node:child_process imports), so a copy in <out>/research/ runs instead: the committed files in
  // docs/research/02-light-aircraft/scripts/out/ (lo_tests.mjs reads lo_aip_check.json) are never rewritten.
  if (o.research) {
    R.research = [];
    const dates = later.map((e) => e.effective);
    if (o.from) infos.push('--research ข้ามไป: สคริปต์งานวิจัยใช้เครือข่ายเสมอ แต่รอบนี้ใช้ --from');
    else if (!dates.length) infos.push('--research: ไม่มีฉบับที่ใหม่กว่าฉบับของ repo');
    else {
      const rdir = path.join(ctx.outDir, 'research');
      fs.mkdirSync(path.join(rdir, 'out'), { recursive: true });
      infos.push(`--research: ผลของ ${RESEARCH_SCRIPTS.map((s) => path.basename(s)).join(' และ ')} อยู่ใน ${path.join(rdir, 'out')}`);
      for (const s of RESEARCH_SCRIPTS) {
        const copy = path.join(rdir, path.basename(s));
        fs.copyFileSync(path.join(ROOT, s), copy);
        const r = spawnSync(process.execPath, [copy, ...dates], { cwd: rdir, encoding: 'utf8', timeout: 600000 });
        const tail = `${r.stdout ?? ''}${r.stderr ?? ''}`.trim().split('\n').slice(-3);
        R.research.push({ script: s, dates, exit: r.status, out: path.join(rdir, 'out'), tail });
        if (r.status !== 0) actions.push(`${path.basename(s)} ${dates.join(' ')} จบด้วย exit ${r.status ?? r.signal}: ${tail.at(-1) ?? ''}`);
      }
    }
  }
  return finish();
}

// short Thai summary for stdout and the top of the report
function summary(R) {
  const out = [];
  const f = R.fixture;
  if (R.index) out.push(`ดัชนี eAIP: ${R.index.editions} ฉบับ · มีผลอยู่ ${R.index.current.map(D).join(', ') || '-'} · ฉบับถัดไป ${R.index.next.map(D).join(', ') || '-'}`);
  if (f) out.push(`fixture: ฉบับของ repo ${D(f.airac_effective)} · บันทึกแล้ว ${f.next_issues.map(D).join(', ') || '-'} · ตรวจอีกครั้งก่อน ${f.recheck_before ?? '-'}${f.days_left !== null && f.days_left !== undefined ? ` (เหลือ ${f.days_left} วัน; ฉบับนั้นเผยแพร่ราว ${f.publish_expected})` : ''}`);
  for (const e of R.editions ?? []) {
    const tag = { repo: 'ฉบับของ repo', recorded: 'บันทึกแล้วใน next_issues', new: 'ใหม่ ยังไม่บันทึก' }[e.record];
    const parts = [`${D(e.effective)} (AMDT ${e.amdt ?? '?'}, ${tag})`];
    if (e.sections && e.record !== 'repo') {
      const ch = e.sections.changed ?? [], co = e.sections.cosmetic ?? [];
      const vs = `จากฉบับ ${D(e.sections.against)}`;
      parts.push(ch.length ? `AD 2 VTBD เปลี่ยน${vs} ${ch.map((c) => c.section).join(', ')}` : `AD 2 VTBD ไม่เปลี่ยน${vs} (${e.sections.same}/${e.sections.total} หัวข้อเหมือนเดิม${co.length ? `, ${co.map((c) => c.section).join(', ')} ต่างแค่ตัวพิมพ์/ช่องว่าง` : ''})`);
    } else if (e.sections) parts.push(`AD 2 VTBD ${e.sections.total} หัวข้อ`);
    if (e.facts) parts.push(`ค่าใน fixture ผ่าน ${e.facts.pass}/${e.facts.total}${e.facts.derived ? ` (+${e.facts.derived} ไม่ได้พิมพ์ไว้)` : ''}${e.facts.failed.length ? `, ไม่ผ่าน ${e.facts.failed.length}` : ''}`);
    if (e.amdt_list) parts.push(e.amdt_list.names_ad2_vtbd ? `รายการแก้ไขกล่าวถึง AD 2 VTBD ${e.amdt_list.sections.join(', ')}` : 'รายการแก้ไขไม่กล่าวถึง VTBD');
    out.push('  ' + parts.join(' · '));
    for (const c of (e.sections?.changed ?? []).slice(0, 6)) {
      out.push(`    ${c.section} (${c.status}${c.recorded ? ', บันทึกแล้ว' : ''}):`);
      const pv = diffPreview(c.diff);
      for (const l of pv.lines) out.push(`      ${l}`);
      if (pv.more) out.push('      (ตัดหรือย่อไว้ ดูทั้งหมดในรายงาน .md)');
    }
    if (e.next_issue_stub) out.push(`    JSON สำหรับเพิ่มใน meta.next_issues: ${JSON.stringify(e.next_issue_stub)}`);
  }
  if (R.recheck_suggestion) out.push(`  เมื่อเพิ่มแล้ว เลื่อน meta.recheck_before เป็น ${R.recheck_suggestion} (AIRAC ถัดจากฉบับใหม่สุดที่เผยแพร่)`);
  if (R.items) {
    const u = R.items.unreviewed, n = (c) => u.filter((i) => i.class === c).length;
    out.push(`SUP/AIC: ${R.items.total} รายการ (SUP ${R.items.sup}, AIC ${R.items.aic}; รายการของฉบับ ${(R.lists ?? []).filter((l) => l.kind === 'sup').map((l) => `${D(l.edition)}${l.in_force ? ' (มีผลอยู่)' : ''}`).join(' และ ') || '-'} และปกของฉบับที่ใหม่กว่าฉบับ repo) · อ่านแล้ว ${R.items.reviewed} · ยังไม่อ่าน ${u.length}: vtbd ${n('vtbd')}, ไม่ชัด ${n('unclear')}, สนามบินอื่น ${n('other')}`);
    for (const i of u.filter((x) => x.class !== 'other').slice(0, 12)) out.push(`  ${i.class.padEnd(7)} ${i.kind.toUpperCase()} ${i.id.padEnd(7)} ${short(i.title || '(ไม่รู้ชื่อเรื่อง)', 80)}`);
    if (u.length) {
      out.push('  โครง JSON สำหรับ tools/watch/reviewed.json (กรอก read, basis, vtbd, note เป็นคำของเราเอง ห้ามคัดลอกชื่อเรื่อง):');
      const s = R.items.stubs, pick = (k) => Object.fromEntries(Object.entries(s[k]).slice(0, 4));
      out.push('  ' + JSON.stringify({ sup: pick('sup'), aic: pick('aic') }));
      if (u.length > 8) out.push(`  (ครบทุกรายการอยู่ในรายงาน .json ที่ items.stubs)`);
    }
  }
  if (R.actions.length) { out.push(`ต้องทำ (${R.actions.length}):`); for (const a of R.actions) out.push(`  - ${a}`); }
  if (R.failures.length) { out.push(`ตัดสินไม่ได้ (${R.failures.length}):`); for (const a of R.failures) out.push(`  - ${a}`); }
  if (R.infos.length) { out.push(`หมายเหตุ (${R.infos.length}):`); for (const a of R.infos.slice(0, 12)) out.push(`  - ${a}`); if (R.infos.length > 12) out.push('  - ... (ดูรายงาน)'); }
  return out;
}

function reportMd(R) {
  const L1 = [`# เฝ้ารอบ AIRAC: AIP Thailand AD 2 VTBD (${R.today})`, '',
    `แหล่งข้อมูล: ${R.source} · ข้อความ AIP เป็นลิขสิทธิ์ของ CAAT: รายงานนี้อยู่ใน .cache/ หรือ --out เท่านั้น ห้าม commit`, '', '## สรุป', '', '```', ...summary(R), '```', ''];
  const md = (s) => String(s ?? '').replace(/\|/g, '\\|');
  if (R.editions?.length) {
    L1.push('## ฉบับ AIRAC', '', '| มีผล | AMDT | เผยแพร่ | ในดัชนี | ใน fixture | ผล |', '|---|---|---|---|---|---|');
    for (const e of R.editions) L1.push(`| ${D(e.effective)} | ${e.amdt ?? '?'} | ${e.published ?? '?'} | ${e.status ?? '?'} | ${e.record} | ${e.verdict} |`);
    L1.push('');
    for (const e of R.editions) {
      const ch = [...(e.sections?.changed ?? []), ...(e.sections?.cosmetic ?? []).map((c) => ({ ...c, status: 'cosmetic' }))];
      if (!ch.length && !e.facts?.failed.length) continue;
      L1.push(`### ${D(e.effective)} เทียบกับฉบับ ${D(e.sections?.against ?? R.fixture?.airac_effective)}`, '');
      for (const c of ch) L1.push(`#### ${c.section} (${c.status})`, '', '```diff', ...c.diff, '```', '');
      if (e.facts?.failed.length) {
        L1.push('| ค่า | หัวข้อ | เหตุ | path ใน fixture |', '|---|---|---|---|');
        for (const f of e.facts.failed) L1.push(`| ${md(f.id)} | ${f.section} | ${md(f.why)} | ${md(f.paths.join(', '))} |`);
        L1.push('');
      }
    }
  }
  if (R.coverage) {
    L1.push('## ค่าใน fixture ที่ตรวจกับข้อความไม่ได้', '', `นับตามสถานะ: ${Object.entries(R.coverage.counts).map(([k, v]) => `${k} ${v}`).join(', ')} (meta คือข้อมูลกำกับของ fixture)`, '',
      '| path | สถานะ | เหตุ |', '|---|---|---|');
    for (const c of R.coverage.not_checked) L1.push(`| ${md(c.path)} | ${c.status} | ${md(c.why ?? '')} |`);
    L1.push('');
  }
  if (R.items) {
    L1.push('## SUP และ AIC', '', `อ่านแล้ว ${R.items.reviewed} จาก ${R.items.total} รายการ · ไฟล์ ${R.reviewed?.file} ${R.reviewed?.exists ? '' : '(ยังไม่มี)'}`, '');
    if (R.reviewed?.problems.length) L1.push('ปัญหาใน reviewed.json:', '', ...R.reviewed.problems.map((p) => `- ${md(p)}`), '');
    if (R.items.unreviewed.length) {
      L1.push('| ประเภท | id | จากชื่อเรื่อง | ชื่อเรื่อง (ห้ามคัดลอกเข้า repo) | โฟลเดอร์ | พบใน |', '|---|---|---|---|---|---|');
      for (const i of R.items.unreviewed) L1.push(`| ${i.kind.toUpperCase()} | ${i.url ? `[${i.id}](${i.url})` : `${i.id} (ไม่มีลิงก์)`} | ${i.class} | ${md(i.title || '?')} | ${i.folder ?? ''} | ${i.from.join(', ')} |`);
      L1.push('', 'โครง JSON (กรอกแล้วรวมเข้า reviewed.json):', '', '```json', JSON.stringify(R.items.stubs, null, 1), '```', '');
    }
    const u = (x) => (x.until ? ` (${x.until})` : '');
    if (R.items.leaving.length) L1.push(`ยังมีผลวันนี้แต่ไม่อยู่ในรายการของฉบับใหม่สุด: ${R.items.leaving.map((x) => x.item + u(x)).join(', ')}`, '');
    if (R.items.gone.length) L1.push(`บันทึกไว้แต่ไม่อยู่ในรายการแล้ว: ${R.items.gone.map((x) => `${x.item}${u(x)}${x.expired ? ' หมดอายุ' : ''}`).join(', ')}`, '');
  }
  if (R.research?.length) {
    L1.push('## สคริปต์งานวิจัยรอบ 2', '');
    for (const r of R.research) L1.push(`- ${r.script} ${r.dates.join(' ')}: exit ${r.exit}`, '  ```', ...r.tail.map((t) => '  ' + t), '  ```');
    L1.push('');
  }
  if (R.pages?.length) { L1.push('## หน้าที่อ่าน', '', ...R.pages.map((p) => `- ${p.how}: ${p.url}`), ''); }
  return L1.join('\n') + '\n';
}

// ---- due, register, all -----------------------------------------------------------------------------------------
async function loadRegister() {
  const f = path.join(path.dirname(fileURLToPath(import.meta.url)), 'register.mjs');
  if (!fs.existsSync(f)) return null;
  return import(pathToFileURL(f).href);
}
export async function runDue(o, ctx) {
  const lines = [], report = { tool: 'watch due', today: ctx.today };
  let exitCode = 0;
  const cur = L.isAirac(ctx.today) ? ctx.today : L.addDays(L.airacOnOrAfter(ctx.today), -L.AIRAC_DAYS), next = L.airacDates(L.addDays(ctx.today, 1), 3);
  report.airac = { in_force_since: cur, next };
  lines.push(`วันนี้ ${ctx.today} · AIRAC ที่มีผลอยู่เริ่ม ${cur} · รอบถัดไป ${next.join(', ')} (รอบละ 28 วัน)`);
  try {
    const { fx } = readFixture(o), rc = recheckState(fx.meta, ctx.today);
    report.fixture = { airac_effective: fx.meta.airac_effective, checked: (fx.meta.next_issues ?? []).map((n) => n.effective), recheck_before: rc.date, days_left: rc.left,
      publish_expected: rc.publish, published: rc.published, passed: rc.passed };
    // the package of recheck_before is out 42 days before it takes effect: from then on a person should run aip
    lines.push(`fixture AIP: ฉบับ ${fx.meta.airac_effective} · บันทึกถึง ${report.fixture.checked.at(-1) ?? fx.meta.airac_effective} · ตรวจอีกครั้งก่อน ${rc.date ?? '-'}` +
      (rc.passed ? ` — ถึงกำหนดแล้ว: รัน node tools/watch/watch.mjs aip`
        : rc.published ? ` (เหลือ ${rc.left} วัน) — ฉบับ ${D(rc.date)} ควรเผยแพร่แล้วตั้งแต่ ${D(rc.publish)} (AIRAC เผยแพร่ล่วงหน้า ${L.AIRAC_PUBLISH_DAYS} วัน): รัน node tools/watch/watch.mjs aip แล้วบันทึกใน meta.next_issues`
        : ` (เหลือ ${rc.left} วัน; ฉบับนั้นเผยแพร่ราว ${rc.publish})`));
    if (rc.passed || rc.published) exitCode = 1;
  } catch (e) { lines.push(`อ่าน fixture ไม่ได้: ${e.message}`); exitCode = 2; }
  try {
    const mod = await loadRegister();
    if (!mod?.registerDue) lines.push('ทะเบียนอากาศยาน: ยังไม่มี tools/watch/register.mjs (ข้ามส่วนนี้)');
    else {
      const d = mod.registerDue(ctx);
      report.register = { newest: d.newest, ageDays: d.ageDays, nextExpected: d.nextExpected, overdue: d.overdue };
      lines.push(...(d.lines ?? []));
      if (d.overdue) exitCode = Math.max(exitCode, 1);
    }
  } catch (e) { lines.push(`ทะเบียนอากาศยาน: ตรวจกำหนดไม่ได้ (${e.message})`); exitCode = 2; }
  report.exit_code = exitCode;
  return { exitCode, lines, report };
}
async function runRegisterCmd(argv, ctx) {
  let mod;
  try { mod = await loadRegister(); } catch (e) { return { exitCode: 2, lines: [`โหลด tools/watch/register.mjs ไม่ได้: ${e.message}`] }; }
  if (!mod?.runRegister) return { exitCode: 2, lines: ['ยังไม่มี tools/watch/register.mjs (runRegister) จึงตรวจทะเบียนอากาศยานไม่ได้'] };
  try { return await mod.runRegister(argv, ctx); } catch (e) { return { exitCode: 2, lines: [`register ล้มเหลว: ${e.message}`] }; }
}
const AIP_ONLY = new Set(['--from', '--refresh', '--research', '--reviewed', '--fixture']);
function registerArgs(rest) {   // the options after "all", without the AIP-only ones
  const out = [];
  for (let i = 0; i < rest.length; i++) {
    if (AIP_ONLY.has(rest[i])) { if (VALUE_OPTS.has(rest[i])) i++; continue; }
    out.push(rest[i]);
  }
  return out;
}

export async function main(argv) {
  const o = parseArgs(argv);
  if (o.help || !o.cmd) return { exitCode: o.help ? 0 : 2, lines: [HELP] };
  if (o.errors.length) return { exitCode: 2, lines: [...o.errors, '', 'ดูวิธีใช้: node tools/watch/watch.mjs --help'] };
  const ctx = { root: ROOT, outDir: o.out ? path.resolve(o.out) : path.join(ROOT, '.cache', 'watch'), today: o.today ?? todayUTC() };
  const op = o.out && o.cmd !== 'due' ? outProblem(ctx.outDir) : null;
  if (op) return { exitCode: 2, lines: [op] };
  switch (o.cmd) {
    case 'aip': return runAip(o, ctx);
    case 'due': return runDue(o, ctx);
    case 'register': return runRegisterCmd(o.rest, ctx);
    case 'all': {
      const a = await runAip(o, ctx), args = registerArgs(o.rest), lines = [...a.lines, ''];
      let r;
      if (args.includes('--pdf') || args.includes('--text')) r = await runRegisterCmd(args, ctx);
      else {
        let mod = null;
        try { mod = await loadRegister(); } catch (e) { r = { exitCode: 2, lines: [`โหลด tools/watch/register.mjs ไม่ได้: ${e.message}`] }; }
        if (!r) {
          if (!mod?.registerDue) r = { exitCode: 0, lines: ['ทะเบียนอากาศยาน: ยังไม่มี tools/watch/register.mjs (ข้ามส่วนนี้)'] };
          else { const d = mod.registerDue(ctx); r = { exitCode: d.overdue ? 1 : 0, lines: d.lines ?? [] }; }
        }
      }
      lines.push(...(r.lines ?? []));
      const exitCode = Math.max(a.exitCode, r.exitCode ?? 0);
      lines.push(`all: exit ${exitCode} (aip ${a.exitCode}, ทะเบียน ${r.exitCode ?? 0})`);
      return { exitCode, lines };
    }
    default: return { exitCode: 2, lines: [`ไม่รู้จักคำสั่ง "${o.cmd}"`, '', HELP] };
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const r = await main(process.argv.slice(2));
  if (r.lines?.length) console.log(r.lines.join('\n'));
  process.exitCode = r.exitCode;
}
