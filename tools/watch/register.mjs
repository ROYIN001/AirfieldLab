// Aircraft-register watch (plan item A10, research R2-09).
// CAAT publishes "Thailand Aircraft Register as at <date>" PDFs about twice a year (14 Jan 2026, 9 Jul 2026 so far;
// https://www.caat.or.th/wp-content/uploads/<YYYY>/<MM>/Thailand-Aircraft-Register-as-at-<D><st|nd|rd|th>-<Month>-<YYYY>.pdf,
// [LS1] in docs/research/02-light-aircraft/02-thai-schools.md). The site sits behind a Cloudflare challenge, so a person
// downloads the PDF in a browser and gives it to `watch.mjs register --pdf <file>` (or --text <file>).
// This module turns the register text into the rows of the research (fixed-wing aircraft of the flight schools and clubs
// in ls_fleet.mjs), diffs them against the newest committed docs/research/02-light-aircraft/scripts/out/ls_register_*.json,
// runs ls_fleet.mjs --register ... --check outside the repo, and says whether something needs a person.
// The register PDF and its text are (c) CAAT: nothing here copies them into the repo; only the extracted rows (registration
// marks, models, serials, operators: facts) go to <outDir>/register/ls_register_<date>.json.
// Pure helpers are exported for test/register.test.mjs; only runRegister / registerDue / the default fetch touch fs, spawn or curl.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync, spawnSync } from 'node:child_process';

const RESEARCH = ['docs', 'research', '02-light-aircraft', 'scripts'];
const MONTHS = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
const MONTH_EN = MONTHS.map(m => m[0].toUpperCase() + m.slice(1));

// ---- operators: the keys of OPS in ls_fleet.mjs, read from its source (importing it would run it) ------------------
export function operatorKeys(root) {
  const src = fs.readFileSync(path.join(root, ...RESEARCH, 'ls_fleet.mjs'), 'utf8');
  const keys = [...src.matchAll(/^ {2}'([^']+)': \{ key: '/gm)].map(m => m[1]);
  if (!keys.length) throw new Error('no OPS keys found in ls_fleet.mjs');
  return keys;
}
const squash = s => s.replace(/\s+/g, ' ').trim();
const opId = s => squash(s).toLowerCase();

// ---- manufacturer dictionary (longest match, case-insensitive). Written from the names the register uses and from common
// makers of trainers; the list is an estimate of coverage: a line whose maker is missing lands in `unparsed`. ------------
const FIXED_MFR = ['Diamond Aircraft Industries GmbH', 'Diamond Aircraft Industries Inc', 'Diamond Aircraft Industries', 'Diamond Aircraft', 'Cessna Aircraft Company', 'Cessna Aircraft Co', 'Cessna',
  'Textron Aviation Inc', 'Textron Aviation', 'Beechcraft Corporation', 'Beech Aircraft Corporation', 'Hawker Beechcraft', 'Beechcraft', 'Beech', 'The New Piper Aircraft Inc', 'The New Piper Aircraft',
  'New Piper Aircraft', 'Piper Aircraft Inc', 'Piper Aircraft', 'Piper', 'Costruzioni Aeronautiche Tecnam S.r.l.', 'Costruzioni Aeronautiche Tecnam', 'Tecnam', 'Partenavia Costruzioni Aeronautiche S.p.A.',
  'Partenavia', 'Vulcanair S.p.A.', 'Vulcanair', 'Pipistrel', 'Zlin Aircraft', 'Grob Aircraft', 'Cirrus Design Corporation', 'Cirrus Aircraft', 'Cirrus', 'Mooney International', 'Mooney', 'Socata', 'Daher',
  'Pilatus Aircraft Ltd', 'Pilatus', 'Airbus', 'Boeing', 'ATR', 'Dassault', 'Gulfstream Aerospace', 'Learjet', 'Bombardier', 'Embraer', 'De Havilland', 'Britten-Norman', 'Zenair', 'Aerospool',
  'Flight Design', 'Evektor', 'Aquila', 'Slingsby', 'Extra Flugzeugbau', 'Extra', 'Pitts', 'Rans', "Van's Aircraft", 'Lancair', 'Air Tractor'];
const ROTOR_MFR = ['Robinson Helicopter Company', 'Robinson Helicopter Co', 'Robinson', 'Bell Helicopter Textron', 'Bell Textron', 'Bell Helicopter', 'Bell', 'Airbus Helicopters', 'Eurocopter',
  'Sikorsky Aircraft', 'Sikorsky', 'Leonardo S.p.A.', 'Leonardo', 'AgustaWestland', 'Agusta', 'Guimbal', 'Enstrom Helicopter Corporation', 'Enstrom', 'Schweizer Aircraft', 'Schweizer',
  'MD Helicopters', 'McDonnell Douglas Helicopter', 'Hughes Helicopters', 'Hughes', 'Kopter'];
const MFR = [...FIXED_MFR.map(n => [n, false]), ...ROTOR_MFR.map(n => [n, true])].sort((a, b) => b[0].length - a[0].length);
const ROTOR_RE = new RegExp('^(' + ROTOR_MFR.map(n => n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|') + ')\\b', 'i');
const ROTOR_MODEL = /^(R-?(22|44|66)\b|AS ?3\d\d|EC ?\d{3}|H ?1\d\d\b|AW ?\d{2,3}|MD ?\d{3}|S-?76|UH-)/i;
const CANDIDATE_RE = /TRAINING|FLYING|FLIGHT|ACADEMY|UNIVERSITY|COLLEGE|CLUB|INSTITUTE|SCHOOL|AERO/i;
const STATUS = /^(Registered|De-?registered|Cancelled|Canceled|Suspended|Expired|Pending|Lapsed|Revoked|Withdrawn|Exported|Destroyed)\b\s*/i;
const REG_RE = /^(HS-[A-Z0-9]{3,4})\b\s*/i;   // Thai marks are HS- plus three characters (four tolerated)

// Longest manufacturer at the start of `s` -> {mfr, rotor, rest} or null
export function matchManufacturer(s) {
  const low = s.toLowerCase();
  for (const [n, rotor] of MFR) {
    const l = n.toLowerCase();
    if (low.startsWith(l) && (s.length === n.length || /[\s]/.test(s[n.length]) || /\W$/.test(n))) return { mfr: s.slice(0, n.length), rotor, rest: s.slice(n.length).trim() };
  }
  return null;
}

// Known operator (or PRIVATE AIRCRAFT) at the end of `s` -> {op, body} or null. A suffix counts only when the token before it
// (the serial) holds a digit: 'NEW THAI FLYING CLUB' must not become THAI FLYING CLUB with serial 'NEW'.
function splitKnownOperator(s, known) {
  const low = s.toLowerCase();
  for (const o of [...known, 'PRIVATE AIRCRAFT'].sort((a, b) => b.length - a.length)) {
    const l = o.toLowerCase();
    if (low === l) return { op: s, body: '' };
    if (!low.endsWith(' ' + l)) continue;
    const body = s.slice(0, s.length - o.length).trim();
    if (/\d/.test(body.split(' ').pop())) return { op: s.slice(s.length - o.length), body };
  }
  return null;
}

// ---- parsing one row -------------------------------------------------------------------------------------------------
// `known` = normalised known operator names (ls_fleet OPS keys). Returns {status, reg, mfr, model, serial, operator, rotor} or {unparsed: reason}
export function parseRow(line, known) {
  let rest = line.trim();
  const st = rest.match(STATUS); if (!st) return null;       // not a data row
  const status = /^de-?reg/i.test(st[1]) ? 'Deregistered' : st[1][0].toUpperCase() + st[1].slice(1).toLowerCase();
  rest = rest.slice(st[0].length);
  const rg = rest.match(REG_RE); if (!rg) return null;
  const reg = rg[1].toUpperCase(); rest = rest.slice(rg[0].length);
  const base = { status, reg };
  // pdftotext -layout: columns separated by 2+ spaces; exactly four fields = manufacturer, model, serial, operator
  const cols = rest.split(/\s{2,}/).map(squash).filter(Boolean);
  if (cols.length === 4) {
    const [mfr, model, serial, operator] = cols;
    return { ...base, mfr, model, serial, operator, rotor: ROTOR_RE.test(mfr) || ROTOR_MODEL.test(model) };
  }
  // flattened text: single spaces. Manufacturer dictionary at the front, operator (known name, else a heuristic) at the back
  const flat = squash(rest);
  const m = matchManufacturer(flat);
  if (!m) {
    if (ROTOR_RE.test(flat)) return { unparsed: 'rotor', ...base, text: flat };
    // maker not in the dictionary (many private aircraft): a known school operator at the end still gives a row; a school-like
    // name gets a person's eye (unparsed); anything else is not a school (counted as notSchool, never exit 1 by itself)
    const k = splitKnownOperator(flat, known);
    if (k) {
      const t = k.body.split(' ').filter(Boolean);
      if (t.length < 3) return { unparsed: 'maker unknown, model or serial missing', ...base, text: flat };
      const serial = t.pop(), mfr = t.shift();
      return { ...base, mfr, model: t.join(' '), serial, operator: k.op, rotor: ROTOR_MODEL.test(t.join(' ')) };
    }
    if (CANDIDATE_RE.test(flat)) return { unparsed: 'no manufacturer from the dictionary', ...base, text: flat };
    return { ...base, mfr: null, model: '', serial: '', operator: '', rotor: false, other: true };
  }
  const mid = m.rest;
  let op = null, body = mid;
  const sp = splitKnownOperator(mid, known);
  if (sp) { op = sp.op; body = sp.body; }
  const toks = body.split(' ').filter(Boolean);
  if (op === null) {
    // unknown operator: the serial is the last token with a digit that has no digit-token after it; the rest is the operator
    // (heuristic: an operator name with a digit in it would be cut wrong; such lines end up in the candidates or unparsed)
    let j = -1; toks.forEach((t, i) => { if (/\d/.test(t)) j = i; });
    if (j < 1 || j === toks.length - 1) return { unparsed: 'no serial / operator split', ...base, text: flat };
    op = toks.slice(j + 1).join(' '); toks.length = j + 1;
  }
  if (toks.length < 2) return { unparsed: 'model or serial missing', ...base, text: flat };
  const serial = toks.pop(), model = toks.join(' ');
  return { ...base, mfr: m.mfr, model, serial, operator: squash(op), rotor: m.rotor || ROTOR_MODEL.test(model) };
}

// "as at 9th July 2026" -> '2026-07-09' (or null)
export function parseAsAt(text) {
  const m = String(text).match(/as at\s+(\d{1,2})\s*(?:st|nd|rd|th)?\s+([A-Za-z]+)\s+(\d{4})/i);
  if (!m) return null;
  const mi = MONTHS.indexOf(m[2].toLowerCase()); if (mi < 0) return null;
  return `${m[3]}-${String(mi + 1).padStart(2, '0')}-${m[1].padStart(2, '0')}`;
}
export function asAtLabel(date) {   // '2026-07-09' -> '9th July 2026'
  const [y, mo, d] = date.split('-').map(Number);
  const sfx = d % 10 === 1 && d !== 11 ? 'st' : d % 10 === 2 && d !== 12 ? 'nd' : d % 10 === 3 && d !== 13 ? 'rd' : 'th';
  return `${d}${sfx} ${MONTH_EN[mo - 1]} ${y}`;
}

const HEADER = /C of R Status|Registration Mark|Thailand Aircraft Register|^\s*Page\s+\d+|^\s*\d+\s*(of|\/)\s*\d+\s*$|Manufacturer\s+Model/i;
// whole text -> {rows (parsed), unparsed, ignored}
export function parseRegisterText(text, known) {
  const rows = [], unparsed = [], ignored = []; let afterRow = false, continuations = 0;
  for (const raw of String(text).replace(/\f/g, '\n').split(/\r?\n/)) {
    if (!raw.trim()) continue;
    const r = parseRow(raw, known);
    if (r === null) { if (!HEADER.test(raw)) { ignored.push(squash(raw).slice(0, 120)); if (afterRow) continuations++; } continue; }
    afterRow = true;
    (r.unparsed ? unparsed : rows).push(r);
  }
  return { rows, unparsed, ignored, continuations };   // continuations: skipped non-header lines right after a data row (a wrapped operator name?)
}

// ---- selection: fixed-wing, known school operators (normalised to the OPS spelling), candidates apart -------------------
export function selectRows(parsed, known) {
  const byId = new Map(known.map(k => [opId(k), k]));
  const order = new Map(known.map((k, i) => [k, i]));
  const kept = [], candidates = [], otherStatus = [], privateOrOther = [], duplicates = [], seen = new Map();
  let rotorDropped = 0, registered = 0;
  for (const r of parsed) {
    if (r.status !== 'Registered') { otherStatus.push({ status: r.status, reg: r.reg, model: r.model, operator: squash(r.operator).toUpperCase() }); continue; }
    registered++;
    const prev = seen.get(r.reg), sig = [r.model, r.serial, opId(r.operator)].join('|');
    if (prev !== undefined) { duplicates.push({ reg: r.reg, same: prev === sig }); continue; }   // keep the first
    seen.set(r.reg, sig);
    if (r.rotor) { rotorDropped++; continue; }
    const id = opId(r.operator), op = byId.get(id);
    if (op) kept.push([r.reg, r.model, r.serial, op]);
    else if (id !== 'private aircraft' && CANDIDATE_RE.test(r.operator)) candidates.push([r.reg, r.model, r.serial, squash(r.operator).toUpperCase()]);
    else privateOrOther.push(r.reg);
  }
  kept.sort((a, b) => order.get(a[3]) - order.get(b[3]));   // stable: OPS order like the committed file, register order inside an operator
  return { rows: kept, candidates, otherStatus, rotorDropped, registered, duplicates, notSchool: privateOrOther.length };
}

// ---- output file in the format of out/ls_register_2026-07-09.json -------------------------------------------------------
export function registerJson(rows, date, sourceName) {
  const meta = {
    source: `CAAT, Thailand Aircraft Register as at ${asAtLabel(date)} (PDF)${sourceName ? ' ไฟล์ ' + sourceName : ''} https://www.caat.or.th/ [LS1]`,
    method: 'tools/watch/register.mjs: แยกแถวจากข้อความของ PDF (pdftotext) คัดเฉพาะเครื่องปีกตรึงของผู้ดำเนินการใน ls_fleet.mjs แล้วเทียบกับไฟล์ที่ commit ไว้ ต้องให้คนตรวจก่อน commit',
    note: 'ทะเบียนบอกผู้ดำเนินการ (Operator) และรุ่นตามที่จดทะเบียน ไม่บอกว่าเครื่องยังบินอยู่หรือจอดซ่อม; เฉพาะเครื่องปีกตรึงของผู้ฝึกบิน/ชมรม ไม่รวม PRIVATE AIRCRAFT',
  };
  return '{\n "_meta": ' + JSON.stringify(meta, null, 1).split('\n').join('\n ') + ',\n "rows": [\n' + rows.map(r => '  ' + JSON.stringify(r)).join(',\n') + '\n ]\n}\n';
}

// ---- diff by registration mark ---------------------------------------------------------------------------------------------
export function diffRows(oldRows, newRows) {
  const o = new Map(oldRows.map(r => [r[0], r])), n = new Map(newRows.map(r => [r[0], r]));
  const added = newRows.filter(r => !o.has(r[0])), removed = oldRows.filter(r => !n.has(r[0])), changed = [];
  for (const r of newRows) {
    const p = o.get(r[0]); if (!p) continue;
    const f = []; ['model', 'serial', 'operator'].forEach((k, i) => { if (p[i + 1] !== r[i + 1]) f.push({ field: k, from: p[i + 1], to: r[i + 1] }); });
    if (f.length) changed.push({ reg: r[0], changes: f });
  }
  const oldOps = new Set(oldRows.map(r => r[3]));
  const newOperators = [...new Set(newRows.map(r => r[3]).filter(x => !oldOps.has(x)))];
  return { added, removed, changed, newOperators, identical: !added.length && !removed.length && !changed.length && !newOperators.length };
}

// ---- committed editions and due dates (offline) ---------------------------------------------------------------------------------
export function committedEditions(root) {
  const dir = path.join(root, ...RESEARCH, 'out');
  let names = []; try { names = fs.readdirSync(dir); } catch {}
  return names.map(f => f.match(/^ls_register_(\d{4}-\d{2}-\d{2})\.json$/)).filter(Boolean).map(m => ({ date: m[1], file: path.join(dir, m[0]) })).sort((a, b) => a.date.localeCompare(b.date));
}
const dayNum = d => Math.floor(Date.parse(d + 'T00:00:00Z') / 864e5);
export function addMonths(date, n) {
  const [y, m, d] = date.split('-').map(Number), t = (y * 12 + m - 1) + n, ny = Math.floor(t / 12), nm = t % 12;
  const last = new Date(Date.UTC(ny, nm + 1, 0)).getUTCDate();
  return `${ny}-${String(nm + 1).padStart(2, '0')}-${String(Math.min(d, last)).padStart(2, '0')}`;
}
export function registerDue(ctx) {
  const eds = committedEditions(ctx.root), newest = eds.at(-1)?.date ?? null;
  if (!newest) return { newest: null, ageDays: null, nextExpected: null, overdue: true, lines: ['ทะเบียนอากาศยาน: ไม่พบไฟล์ out/ls_register_<วันที่>.json ที่ commit ไว้'] };
  const ageDays = dayNum(ctx.today) - dayNum(newest), nextExpected = addMonths(newest, 6), overdueFrom = addMonths(newest, 7);
  const overdue = ctx.today > overdueFrom;
  return {
    newest, ageDays, nextExpected, overdue,
    lines: [`ทะเบียนอากาศยาน CAAT: ฉบับล่าสุดที่มีใน repo ณ วันที่ ${newest} (อายุ ${ageDays} วัน)`,
      `  ฉบับถัดไปคาดว่าราว ${nextExpected} (ค่าประมาณ: ออกประมาณปีละสองครั้ง ห่างราว 6 เดือน)` + (overdue ? ` — เกินกำหนด: เกิน 7 เดือนแล้ว (ค่าประมาณ, ${overdueFrom}) ควรตรวจว่ามีฉบับใหม่หรือไม่` : ' — ยังไม่ถึงกำหนด')],
  };
}

// ---- discovery of a newer edition (network, injectable for tests) ---------------------------------------------------------------
export const isChallenge = (status, headers) => status === 403 && /(^|\n)\s*cf-mitigated:\s*challenge/i.test(String(headers));
export function findRegisterLinks(html) {
  const out = new Map();
  for (const m of String(html).matchAll(/https?:\/\/[^"'\s<>]*Thailand-Aircraft-Register-as-at-[^"'\s<>]*?\.pdf/gi)) {
    const d = parseAsAt(decodeURIComponent(m[0].match(/as-at-(.*)\.pdf/i)[1].replace(/-/g, ' ')).replace(/^/, 'as at '));
    if (d) out.set(d, m[0]);
  }
  return [...out].map(([date, url]) => ({ date, url })).sort((a, b) => a.date.localeCompare(b.date));
}
function curlFetch(url, { binary = false } = {}) {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'watch-reg-'));
  try {
    const hdr = path.join(tmp, 'h'), body = path.join(tmp, 'b');
    let code;
    try { code = execFileSync('curl', ['-sS', '-L', '--max-time', '40', '-A', 'AirfieldLab-watch/1.0', '-D', hdr, '-o', body, '-w', '%{http_code}', url], { encoding: 'utf8' }); }
    catch (e) { return { status: 0, headers: '', body: null, error: String(e.stderr || e.message).trim().slice(0, 200) }; }
    return { status: Number(code), headers: fs.existsSync(hdr) ? fs.readFileSync(hdr, 'utf8') : '', body: fs.existsSync(body) ? (binary ? fs.readFileSync(body) : fs.readFileSync(body, 'utf8')) : null };
  } finally { fs.rmSync(tmp, { recursive: true, force: true }); }
}
const CAAT_PAGE = 'https://www.caat.or.th/';
const HOWTO = (due) => [
  'วิธีตรวจด้วยมือ (ระบบของ CAAT กันการดาวน์โหลดอัตโนมัติด้วย Cloudflare):',
  '  1. เปิด https://www.caat.or.th/ ในเบราว์เซอร์ แล้วหาหน้าทะเบียนอากาศยาน (Aircraft Register)',
  '  2. ดาวน์โหลด PDF ฉบับใหม่ล่าสุดชื่อ "Thailand Aircraft Register as at ..."',
  '  3. อัปโหลดไฟล์เข้าโปรเจกต์ หรือบันทึกไว้ในเครื่อง แล้วรัน: node tools/watch/watch.mjs register --pdf <ไฟล์>',
  '     (ถ้าได้เฉพาะข้อความ ใช้ --text <ไฟล์> ได้ และใส่ --date YYYY-MM-DD เมื่อในข้อความไม่มีคำว่า "as at ...")',
  ...(due.overdue ? ['  ฉบับล่าสุดที่ repo มีเกินกำหนดแล้ว จึงยังตัดสินไม่ได้ว่ามีฉบับใหม่ (exit 2)'] : []),
];

// ---- main ----------------------------------------------------------------------------------------------------------------------------------
function opt(argv, name) { const i = argv.indexOf(name); return i >= 0 ? argv[i + 1] : null; }
const missingValue = (argv, name) => { const i = argv.indexOf(name); return i >= 0 && (argv[i + 1] === undefined || argv[i + 1].startsWith('--')); };
export function validDate(d) {   // 'YYYY-MM-DD' that round-trips through Date
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(d)); if (!m) return false;
  const t = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3]));
  return t.getUTCFullYear() === +m[1] && t.getUTCMonth() === +m[2] - 1 && t.getUTCDate() === +m[3];
}

export async function runRegister(argv, ctx) {
  const lines = [], report = { kind: 'register', today: ctx.today };
  const done = (exitCode) => { report.exitCode = exitCode; return { exitCode, lines, report }; };
  const due = registerDue(ctx); report.due = { newest: due.newest, ageDays: due.ageDays, nextExpected: due.nextExpected, overdue: due.overdue };
  let known; try { known = operatorKeys(ctx.root); } catch (e) { lines.push('อ่านรายชื่อผู้ดำเนินการจาก ls_fleet.mjs ไม่ได้: ' + e.message); return done(2); }

  for (const o of ['--pdf', '--text', '--date']) if (missingValue(argv, o)) { lines.push(`ตัวเลือก ${o} ต้องมีค่าตามหลัง เช่น node tools/watch/watch.mjs register ${o === '--date' ? '--text <ไฟล์> --date YYYY-MM-DD' : o + ' <ไฟล์>'}`); return done(2); }
  let text = null, srcName = null;
  const pdf = opt(argv, '--pdf'), txt = opt(argv, '--text');
  if (pdf) {
    try { text = execFileSync('pdftotext', ['-layout', path.resolve(pdf), '-'], { encoding: 'utf8', maxBuffer: 256 * 2 ** 20 }); srcName = path.basename(pdf); }
    catch (e) {
      lines.push(e.code === 'ENOENT' ? 'ไม่พบคำสั่ง pdftotext (แพ็กเกจ poppler-utils): ติดตั้งก่อน เช่น apt install poppler-utils หรือ brew install poppler แล้วลองใหม่ หรือแปลง PDF เป็นข้อความเองแล้วใช้ --text <ไฟล์>' : 'อ่าน PDF ไม่ได้: ' + String(e.stderr || e.message).slice(0, 300));
      return done(2);
    }
  } else if (txt) {
    try { text = fs.readFileSync(path.resolve(txt), 'utf8'); srcName = path.basename(txt); } catch (e) { lines.push('อ่านไฟล์ข้อความไม่ได้: ' + e.message); return done(2); }
  } else {
    // no input: look for a newer edition on the CAAT site; it is behind a Cloudflare challenge, so usually only instructions come out
    lines.push(...due.lines);
    const get = ctx.fetch || curlFetch;
    const page = get(CAAT_PAGE);
    report.discovery = { url: CAAT_PAGE, status: page.status };
    if (isChallenge(page.status, page.headers) || page.status !== 200) {
      report.discovery.blocked = isChallenge(page.status, page.headers);
      lines.push(report.discovery.blocked ? `ดึง ${CAAT_PAGE} ไม่ได้: HTTP 403 พร้อม cf-mitigated: challenge (Cloudflare)` : `ดึง ${CAAT_PAGE} ไม่ได้: ${page.error || 'HTTP ' + page.status}`);
      lines.push(...HOWTO(due));
      return done(due.overdue ? 2 : 0);
    }
    const links = findRegisterLinks(page.body), newer = links.filter(l => !due.newest || l.date > due.newest);
    report.discovery.links = links;
    if (!newer.length) { lines.push('ไม่พบลิงก์ PDF ทะเบียนฉบับใหม่กว่าฉบับใน repo บนหน้าแรกของ CAAT (หน้านี้อาจไม่ได้ลิงก์ทะเบียนไว้)'); if (due.overdue) lines.push(...HOWTO(due)); return done(due.overdue ? 2 : 0); }
    const pick = newer.at(-1); lines.push(`พบฉบับใหม่: ${pick.date} ${pick.url}`);
    const dl = get(pick.url, { binary: true });
    if (dl.status !== 200 || !dl.body) { lines.push('ดาวน์โหลด PDF ไม่ได้ ' + (dl.error || 'HTTP ' + dl.status)); lines.push(...HOWTO(due)); return done(2); }
    const cache = path.join(ctx.outDir, 'register'); fs.mkdirSync(cache, { recursive: true });
    const f = path.join(cache, `register-as-at-${pick.date}.pdf`); fs.writeFileSync(f, dl.body);
    return runRegister(['--pdf', f, '--date', pick.date], ctx);
  }

  const date = opt(argv, '--date') || parseAsAt(text);
  if (!date) { lines.push('หาวันที่ "as at" ในข้อความไม่เจอ ให้ใส่ --date YYYY-MM-DD'); return done(2); }
  if (!validDate(date)) { lines.push(`วันที่ "${date}" ไม่ถูกต้อง ใช้รูป YYYY-MM-DD ที่มีอยู่จริง`); return done(2); }
  report.asAt = date; report.source = srcName;
  const parsed = parseRegisterText(text, known);
  const sel = selectRows(parsed.rows, known);
  const prevEd = committedEditions(ctx.root).at(-1), prevCount = prevEd ? JSON.parse(fs.readFileSync(prevEd.file, 'utf8')).rows.length : 0;
  if (!parsed.rows.length || (prevCount && sel.rows.length < prevCount / 2)) {
    lines.push(`แยกแถวไม่ได้ รูปแบบไฟล์อาจเปลี่ยน: แยกได้ ${parsed.rows.length} แถว เข้าชุดวิจัย ${sel.rows.length} แถว (ฉบับที่ commit ไว้มี ${prevCount}); ไม่เขียนไฟล์ผลลัพธ์ (exit 2)`);
    if (parsed.unparsed.length) lines.push('  ตัวอย่างบรรทัดที่แยกไม่ได้: ' + parsed.unparsed.slice(0, 3).map(u => `${u.reg} [${u.unparsed}]`).join(' | '));
    report.counts = { parsed: parsed.rows.length, kept: sel.rows.length, previousKept: prevCount, unparsed: parsed.unparsed.length };
    return done(2);
  }
  report.counts = { parsed: parsed.rows.length, registered: sel.registered, rotorcraftDropped: sel.rotorDropped, kept: sel.rows.length, candidates: sel.candidates.length, otherStatus: sel.otherStatus.length, notSchool: sel.notSchool, unparsed: parsed.unparsed.length, ignoredLines: parsed.ignored.length, wrappedLineSuspects: parsed.continuations, duplicates: sel.duplicates.length };
  report.duplicates = sel.duplicates;
  report.candidates = sel.candidates; report.otherStatus = sel.otherStatus; report.unparsed = parsed.unparsed.map(u => `${u.status} ${u.reg} [${u.unparsed}] ${u.text}`); report.ignoredSample = parsed.ignored.slice(0, 20);
  lines.push(`ทะเบียนอากาศยาน as at ${asAtLabel(date)} (${date}) จาก ${srcName}`);
  lines.push(`  แถวที่แยกได้ ${parsed.rows.length} แถว: Registered ${sel.registered}, สถานะอื่น ${sel.otherStatus.length}; ตัดเฮลิคอปเตอร์ ${sel.rotorDropped}; ไม่ใช่โรงเรียน/ชมรมใน ls_fleet ${sel.notSchool}; เข้าชุดวิจัย ${sel.rows.length} แถว`);
  if (parsed.ignored.length) lines.push(`  บรรทัดที่ข้าม (ไม่ใช่แถวข้อมูล เช่น หัวตาราง ต่อบรรทัด) ${parsed.ignored.length} บรรทัด เช่น: ${parsed.ignored.slice(0, 3).join(' | ')}`);
  if (parsed.continuations) lines.push(`  บรรทัดที่ข้ามต่อจากแถวข้อมูลโดยตรง ${parsed.continuations} บรรทัด (ชื่อผู้ดำเนินการที่ขึ้นบรรทัดใหม่หรือไม่? ถ้ารูปแบบเปลี่ยนให้ดูตัวอย่างใน report.ignoredSample)`);
  if (sel.duplicates.length) lines.push('  เลขทะเบียนซ้ำ (เก็บแถวแรกไว้): ' + sel.duplicates.map(d => d.reg + (d.same ? ' (เหมือนกัน)' : ' (ข้อมูลต่างกัน)')).join(', '));
  if (sel.otherStatus.length) { lines.push('  สถานะอื่นที่ไม่ใช่ Registered (ไม่รวมในแถว):'); for (const o of sel.otherStatus) lines.push(`    ${o.status} ${o.reg} ${o.model} ${o.operator}`); }
  if (parsed.unparsed.length) { lines.push('  แยกคอลัมน์ไม่ได้ (unparsed) ให้คนอ่านเอง:'); for (const u of report.unparsed) lines.push('    ' + u); }
  if (sel.candidates.length) { lines.push('  ผู้ดำเนินการใหม่ที่ชื่อเหมือนโรงเรียน/ชมรม (candidates ไม่รวมในไฟล์แถว ต้องตัดสินใจเพิ่มใน OPS ของ ls_fleet.mjs):'); for (const c of sel.candidates) lines.push('    ' + c.join(' | ')); }

  // the rows file
  const outDir = path.join(ctx.outDir, 'register'); fs.mkdirSync(outDir, { recursive: true });
  const outFile = path.join(outDir, `ls_register_${date}.json`);
  fs.writeFileSync(outFile, registerJson(sel.rows, date, srcName)); report.outFile = outFile;
  lines.push(`  เขียน ${outFile}`);

  // diff against the newest committed edition
  const eds = committedEditions(ctx.root), prev = eds.at(-1);
  let diff = null;
  if (prev) {
    const old = JSON.parse(fs.readFileSync(prev.file, 'utf8')).rows;
    diff = diffRows(old, sel.rows); report.diff = { against: prev.date, ...diff };
    lines.push(`  เทียบกับฉบับ ${prev.date} ที่ commit ไว้: เพิ่ม ${diff.added.length}, หายไป ${diff.removed.length}, เปลี่ยน ${diff.changed.length}, ผู้ดำเนินการใหม่ ${diff.newOperators.length}`);
    for (const r of diff.added) lines.push('    + ' + r.join(' | '));
    for (const r of diff.removed) lines.push('    - ' + r.join(' | '));
    for (const c of diff.changed) lines.push(`    ~ ${c.reg} ` + c.changes.map(x => `${x.field}: ${x.from} -> ${x.to}`).join('; '));
    for (const o of diff.newOperators) lines.push('    ผู้ดำเนินการใหม่ ' + o);
  } else lines.push('  ไม่มีฉบับที่ commit ไว้ให้เทียบ');

  // ls_fleet.mjs --check on the new rows, output outside the repo
  const fleetOut = path.join(outDir, 'fleet');
  const fl = spawnSync(process.execPath, [path.join(ctx.root, ...RESEARCH, 'ls_fleet.mjs'), '--register', outFile, '--out', fleetOut, '--check'], { encoding: 'utf8', cwd: ctx.root });
  const flText = (fl.stdout || '') + (fl.stderr || '');
  let unknown = [], blockChanges = null;
  if (fl.error || (fl.status !== 0 && !/check:/.test(flText))) { const errLine = flText.split('\n').find(l => /Error:/.test(l)) || flText.split('\n').filter(Boolean).at(-1) || ''; lines.push('  ls_fleet.mjs รันไม่สำเร็จ: ' + errLine.trim()); report.fleet = { ok: false, output: flText.slice(-500) }; return done(2); }
  blockChanges = /MISMATCH/.test(flText);
  try { unknown = JSON.parse(fs.readFileSync(path.join(fleetOut, 'ls_fleet_summary.json'), 'utf8')).unknown; } catch {}
  report.fleet = { ok: true, blockChanges, unknownModels: unknown, outDir: fleetOut };
  lines.push(blockChanges ? '  ls_fleet --check: บล็อก §02.6 ใน 02-thai-schools.md จะเปลี่ยน (ถ้ายอมรับฉบับใหม่ ทำตามขั้นตอนใน tools/watch/README.md)' : '  ls_fleet --check: บล็อก §02.6 ตรงกับที่สร้างจากแถวใหม่ ไม่ต้องแก้');
  if (unknown.length) lines.push('  รุ่นที่ classify() ใน ls_fleet.mjs ยังไม่รู้จัก (unknown:): ' + unknown.join(', '));

  const action = !!diff && !diff.identical || !diff || unknown.length > 0 || blockChanges || parsed.unparsed.length > 0 || sel.duplicates.some(d => !d.same);
  report.action = action;
  lines.push(action ? 'ต้องมีคนตรวจ: ผลต่างข้างบนต้องอ่านก่อนอัปเดตข้อมูล (exit 1)' : 'ทะเบียนตรงกับฉบับที่ repo มีอยู่ ไม่ต้องทำอะไร');
  return done(action ? 1 : 0);
}
