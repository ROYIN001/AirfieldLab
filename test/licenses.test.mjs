// Credits and licences: research round 5 §11 (T-K01…T-K05, items 3 and 4) and round 1 §12 (T-S-11), plan items A3
// and A4. The policy lives in test/fixtures/license_policy.json; the AIRAC cycle in test/fixtures/aip_vtbd_current.json.
// T-K05 (A3): the page footer, the source comment of src/15-geo.js and the data provenance in CLAUDE.md cite the cycle
// that the AIP fixture holds, so a cycle update in the fixture asks for the same update in the text.
// T-S-11 (A4): no GPL or LGPL text and no JSBSim model file in the repo, except the files the owner approved one by one.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { assemble } from '../build.mjs';

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');
const exists = (p) => fs.existsSync(path.join(ROOT, p));
const AIP = JSON.parse(read('test/fixtures/aip_vtbd_current.json')).aip_vtbd_current;
const POL = JSON.parse(read('test/fixtures/license_policy.json')).license_policy;
const [Y, MO, D] = AIP.meta.airac_effective.split('-').map(Number);
const EN = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
const TH = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
const cycleEN = `AIRAC ${String(D).padStart(2, '0')} ${EN[MO - 1]} ${Y}`, cycleTH = `AIRAC ${D} ${TH[MO - 1]} ${Y}`;

// The <p class="foot"> paragraphs of the page that `node build.mjs` writes, HTML comments removed (a paragraph inside
// a comment is not on the page). `html` keeps the markup (links), `text` is what the reader sees. The side panel shows
// one pane at a time (explore or train), so FOOT.panes holds each pane's paragraphs too.
const footOf = (html) => {
  const ps = [...html.matchAll(/<p class="foot">([\s\S]*?)<\/p>/g)].map((m) => m[1]).join(' · ');
  return { html: ps, text: ps.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ') };
};
const PAGE = assemble().html.replace(/<!--[\s\S]*?--!?>/g, '');
const FOOT = (() => {
  const f = footOf(PAGE);
  assert.ok(f.html, 'no <p class="foot"> in the page');
  const at = (id) => PAGE.indexOf(`<section class="pane" id="${id}"`);
  const iE = at('paneExplore'), iT = at('paneTrain'), iEnd = PAGE.indexOf('</aside>', iT);
  assert.ok(iE > 0 && iT > iE && iEnd > iT, 'the panel holds paneExplore, then paneTrain');
  const html = { paneExplore: PAGE.slice(iE, iT), paneTrain: PAGE.slice(iT, iEnd) };
  return { ...f, html: f.html, panes: { paneExplore: { ...footOf(html.paneExplore), src: html.paneExplore }, paneTrain: { ...footOf(html.paneTrain), src: html.paneTrain } } };
})();

// Files of the repo: tracked plus untracked files that .gitignore does not exclude (so a file copied in but not yet
// committed is caught too). Without git (an exported tree), every file except .git, node_modules and .cache.
const SKIP = new Set(['.git', 'node_modules', '.cache']);
function walk(dir, rel = '') {
  const out = [];
  for (const d of fs.readdirSync(path.join(dir, rel), { withFileTypes: true })) {
    const p = rel ? rel + '/' + d.name : d.name;
    if (d.isDirectory()) { if (!SKIP.has(d.name)) out.push(...walk(dir, p)); } else if (d.isFile()) out.push(p);
  }
  return out;
}
const REPO_FILES = (() => {
  try {
    const out = execFileSync('git', ['ls-files', '-z', '--cached', '--others', '--exclude-standard'], { cwd: ROOT, encoding: 'utf8', maxBuffer: 1 << 26, stdio: ['ignore', 'pipe', 'ignore'] });
    // an entry that ends in "/" is a nested repository or worktree, not a file of this one
    return [...new Set(out.split('\0'))].filter((p) => p && !p.endsWith('/') && fs.statSync(path.join(ROOT, p), { throwIfNoEntry: false })?.isFile()).sort();
  } catch (e) { return walk(ROOT).sort(); }
})();
const under = (dir) => (exists(dir) ? walk(ROOT, dir) : []);   // paths from the repo root, e.g. data/city.json

test('license policy fixture: the files it names live where the tests look', () => {
  assert.ok(REPO_FILES.length > 100 && REPO_FILES.includes('src/template.html'), `repo listing: ${REPO_FILES.length} files`);
  for (const f of Object.keys(POL.conditional_footer_terms)) assert.match(f, /^(data|src)\//, f);
  for (const f of [...POL.odbl_derived_files, ...POL.legacy_data_without_fields]) assert.match(f, /^data\//, f);
  for (const f of POL.legacy_data_without_fields) assert.ok(POL.odbl_derived_files.includes(f), `${f}: a legacy data file must be in odbl_derived_files`);
  assert.deepEqual(POL.forbidden_sources_dirs, ['data', 'src', 'tools', 'test']);
  // the lists that a smaller policy would weaken keep at least what §11 asks (a change here is visible in the test too)
  const has = (list, need, what) => { for (const x of need) assert.ok(list.includes(x), `${what} lacks ${x}`); };
  has(POL.forbidden_extensions_in_repo, ['.tif', '.tiff', '.pdf', '.jp2'], 'forbidden_extensions_in_repo');
  has(POL.required_footer_terms, ['OpenStreetMap', 'ODbL', 'AIP Thailand', 'ใช้เพื่อการฝึกในเกมเท่านั้น'], 'required_footer_terms');
  has(Object.keys(POL.conditional_footer_terms), ['data/city_v2.json', 'data/landmarks.json', 'src/16-palette.js'], 'conditional_footer_terms');
  has(POL.odbl_derived_files, ['data/vtbd_af.json', 'data/city.json', 'data/land_in.png', 'data/land_out.png'], 'odbl_derived_files');
  for (const f of POL.forbidden_sources_skip) assert.ok(REPO_FILES.includes(f), `forbidden_sources_skip: ${f} is not a repo file`);
});

test(`T-K05 the footer cites the fixture's cycle (${cycleTH}) and no other one`, () => {
  assert.ok(FOOT.panes.paneExplore.text.includes(cycleTH), `footer: ${FOOT.panes.paneExplore.text.slice(0, 120)}…`);
  const cited = [...FOOT.text.matchAll(/AIRAC\s+\d{1,2}\s+\S+\s+\d{4}/g)].map((m) => m[0].replace(/\s+/g, ' '));
  assert.ok(cited.length >= 1 && cited.every((c) => c === cycleTH), `cycles in the footer: ${cited.join(', ')}`);
  assert.equal([...FOOT.text.matchAll(/AIRAC/g)].length, cited.length, 'every AIRAC in the footer names a cycle');
});

test(`T-K05 src/15-geo.js names ${cycleEN} as its source and CLAUDE.md does the same`, () => {
  const src = read('src/15-geo.js').split('\n').find((l) => l.startsWith('// Source: AIP Thailand AD 2 VTBD'));
  assert.ok(src && src.includes(`(CAAT, ${cycleEN}`), src);
  const prov = read('CLAUDE.md').split('\n').find((l) => l.startsWith('- Runways, lights, navaids: AIP Thailand AD 2 VTBD'));
  assert.ok(prov && prov.includes(cycleEN), prov);
});

test('T-K01 each pane of the built page has every required credit, with the OSM, ODbL and AIP links', () => {
  for (const [pane, f] of Object.entries(FOOT.panes)) {
    for (const t of POL.required_footer_terms) assert.ok(f.text.includes(t), `${pane} footer lacks "${t}"`);
    // OSM attribution: the credit links to the copyright page; ODbL 4.3: the reader can reach the licence
    for (const href of ['https://www.openstreetmap.org/copyright', 'https://opendatacommons.org/licenses/odbl/1-0/', 'https://aip.caat.or.th'])
      assert.ok(f.html.includes(`href="${href}"`), `${pane} footer link ${href}`);
  }
  assert.ok(FOOT.panes.paneExplore.html.includes('/data/LICENSE-DATA.md"'), 'footer link to data/LICENSE-DATA.md');
  // the credit paragraph is the pane's own last child, so it shows whatever state the pane is in (the train pane
  // shows one of trSetup, trLive and trResult at a time), and nothing hides it: it holds every credit and link
  // itself, and every element opened before it in the pane is closed again (an unclosed <div> would take it in)
  for (const [pane, f] of Object.entries(FOOT.panes)) {
    const at = f.src.lastIndexOf('<p class="foot">'), end = f.src.indexOf('</p>', at) + 4, last = footOf(f.src.slice(at, end));
    assert.ok(at > 0, `${pane}: a foot paragraph`);
    for (const t of POL.required_footer_terms) assert.ok(last.text.includes(t), `${pane}: the last foot paragraph lacks "${t}"`);
    for (const href of ['https://www.openstreetmap.org/copyright', 'https://opendatacommons.org/licenses/odbl/1-0/', 'https://aip.caat.or.th'])
      assert.ok(last.html.includes(`href="${href}"`), `${pane}: the last foot paragraph lacks the link ${href}`);
    assert.match(f.src.slice(end), /^\s*<\/section>/, `${pane}: the credits sit directly in the pane, after its sub-panes`);
    const before = f.src.slice(0, at);
    for (const tag of ['section', 'div', 'template', 'details', 'dialog', 'span', 'form', 'fieldset', 'ul', 'ol', 'li', 'p']) {
      const open = (before.match(new RegExp(`<${tag}[\\s>]`, 'g')) || []).length - (tag === 'section' ? 1 : 0);
      const close = (before.match(new RegExp(`</${tag}>`, 'g')) || []).length;
      assert.equal(open, close, `${pane}: <${tag}> opened ${open} times and closed ${close} times before the credits`);
    }
  }
  // the PNG snapshot (a Produced Work, ODbL 4.3) carries the notice too
  const shot = read('src/90-app.js').match(/const SHOT_CREDIT = '([^']+)'/);
  assert.ok(shot, 'src/90-app.js: SHOT_CREDIT');
  for (const t of ['OpenStreetMap', 'ODbL', 'openstreetmap.org/copyright', 'AIP Thailand']) assert.ok(shot[1].includes(t), `snapshot credit lacks "${t}"`);
  assert.ok(/fillText\(SHOT_CREDIT/.test(read('src/90-app.js')), 'the snapshot draws SHOT_CREDIT');
  // links in the footer open beside the running page, not in place of it
  for (const a of FOOT.html.match(/<a\b[^>]*>/g)) assert.match(a, /target="_blank" rel="noopener"/, a);
});

test('T-K02 a data source in use has its credit in the footer, and no credit comes ahead of its data', () => {
  const inUse = Object.entries(POL.conditional_footer_terms).filter(([f]) => exists(f));
  for (const [pane, p] of Object.entries(FOOT.panes))
    for (const [f, terms] of inUse) for (const t of terms) assert.ok(p.text.includes(t), `${f} is in the repo: the ${pane} footer needs "${t}"`);
  const used = new Set(inUse.flatMap(([, terms]) => terms)), low = FOOT.text.toLowerCase();
  for (const t of new Set(Object.values(POL.conditional_footer_terms).flat()))
    if (!used.has(t) && !POL.required_footer_terms.includes(t)) assert.ok(!low.includes(t.toLowerCase()), `footer credits "${t}" before its data is in the repo`);
});

// Text of a file, decoded: UTF-16 when it starts with a byte-order mark, else UTF-8; null for a binary file (a NUL
// byte in the first 8 KB, as git decides).
function decode(buf) {
  if (buf[0] === 0xff && buf[1] === 0xfe) return buf.subarray(2).toString('utf16le');
  if (buf[0] === 0xfe && buf[1] === 0xff) return Buffer.from(buf.subarray(2, 2 + ((buf.length - 2) & ~1))).swap16().toString('utf16le');
  return buf.subarray(0, 8192).includes(0) ? null : buf.toString('utf8');
}
// Lines of a text file to search for a forbidden source. A JSON file contributes its keys and string values, without
// base64 payloads (city.json packs records as base64, where a short name can occur by chance; base64 may be wrapped
// in lines, while prose has spaces or punctuation, so it is never skipped).
const B64 = /^[A-Za-z0-9+/=\r\n]{256,}$/;
function searchableLines(p, text) {
  if (!/\.(geo)?json$/i.test(p)) return text.split('\n');
  const out = [];
  const visit = (v) => {
    if (typeof v === 'string') { if (!B64.test(v)) out.push(...v.split('\n')); }
    else if (Array.isArray(v)) v.forEach(visit);
    else if (v && typeof v === 'object') for (const [k, x] of Object.entries(v)) { out.push(k); visit(x); }
  };
  try { visit(JSON.parse(text)); return out; } catch (e) { return text.split('\n'); }
}
// A line may name a forbidden source only to forbid it: a comment that starts with ห้ามใช้ ("do not use")
const FORBID_NOTE = /^\s*(?:\/\/|\/\*|\*|#|<!--)\s*ห้ามใช้/;
function forbiddenHits(p, text) {
  const hits = [], names = POL.forbidden_sources.map((n) => [n, n.toLowerCase()]);
  searchableLines(p, text).forEach((l, i) => {
    if (FORBID_NOTE.test(l)) return;
    const low = l.toLowerCase();
    for (const [n, nl] of names) if (low.includes(nl)) hits.push(`${p}:${i + 1} ${n}`);
  });
  return hits;
}

test('T-K03 no forbidden data source is named in data/, src/, tools/ or test/ (except a comment that starts with ห้ามใช้)', () => {
  const files = REPO_FILES.filter((p) => POL.forbidden_sources_dirs.some((d) => p.startsWith(d + '/')) && !POL.forbidden_sources_skip.includes(p));
  let scanned = 0;
  const hits = [];
  for (const p of files) {
    const text = decode(fs.readFileSync(path.join(ROOT, p)));
    if (text === null) continue;
    scanned++;
    hits.push(...forbiddenHits(p, text));
  }
  assert.ok(scanned > 40, `scanned ${scanned} text files`);
  assert.deepEqual(hits, [], 'research §11 table 11.3: these sources may not be used in the repo');
});

test('T-K04 no GeoTIFF, JPEG 2000 or PDF file (.tif, .tiff, .pdf, .jp2) in the repo, nor in dist/ when it is built', () => {
  const ext = new Set(POL.forbidden_extensions_in_repo);
  const files = [...REPO_FILES, ...under('dist')];
  const hits = files.filter((p) => ext.has(path.extname(p).toLowerCase()));
  assert.deepEqual(hits, [], 'AIP charts, DEM and imagery stay out of the repo: link to the source instead (research §11)');
});

// T-S-11 patterns, assembled from parts so that this file does not match itself. The words of a licence name may be
// split over lines that start with a comment mark (# , * , //).
const W = (...w) => new RegExp(w.join('[\\s#*/;!%>\x27\\uFFFD-]+'), 'i');
const GPL_PATTERNS = {
  jsbsim_model: new RegExp('<' + 'fdm_config\\b', 'i'),                         // a JSBSim aircraft model (JSBSim is LGPL)
  jsbsim_parts: new RegExp('<(?:(?:piston|turbine|turboprop|electric|rocket)_' + 'engine|brushless_dc_' + 'motor)\\b|<propeller\\s[^>\\n]*\\bname\\s*' + '=|<run' + 'script\\b|JSBSim(?:Script)?\\.' + 'xsd', 'i'),
  license_name: new RegExp('license' + 'Name\\s*=\\s*["\\x27]\\s*(?:L|A)?GPL', 'i'),   // a JSBSim or FlightGear file header
  gpl: W('GNU', 'GENERAL', 'PUBLIC', 'LICENSE'), lgpl: W('GNU', 'LESSER', 'GENERAL', 'PUBLIC'),
  library_gpl: W('GNU', 'LIBRARY', 'GENERAL', 'PUBLIC'), agpl: W('GNU', 'AFFERO', 'GENERAL', 'PUBLIC'),
  spdx: new RegExp('SPDX-' + 'License-Identifier:[^\\n]*\\b(?:L|A)?GPL', 'i'),        // also inside an AND/OR expression
};
const gplHits = (text) => Object.keys(GPL_PATTERNS).filter((k) => GPL_PATTERNS[k].test(text));

test('T-S-11 no GPL or LGPL text and no JSBSim model in the repo, except what the owner approved, file by file', () => {
  const found = {};
  for (const p of REPO_FILES) {
    const buf = fs.readFileSync(path.join(ROOT, p));
    const utf16 = (buf[0] === 0xff && buf[1] === 0xfe) || (buf[0] === 0xfe && buf[1] === 0xff);
    const k = gplHits(utf16 ? decode(buf) : buf.toString('utf8'));
    if (k.length) found[p] = k;
  }
  const allow = POL.gpl_guard_allowlist;
  const extra = Object.entries(found).filter(([p, k]) => !allow[p] || k.some((x) => !allow[p].patterns.includes(x))).map(([p, k]) => `${p}: ${k.join(', ')}`);
  const stale = Object.entries(allow).filter(([p, a]) => a.patterns.some((x) => !(found[p] || []).includes(x))).map(([p, a]) => `${p}: ${a.patterns.filter((x) => !(found[p] || []).includes(x)).join(', ')}`);
  assert.deepEqual(extra, [], 'new GPL/LGPL or JSBSim text: remove it, or ask the owner to add the file and pattern to gpl_guard_allowlist');
  assert.deepEqual(stale, [], 'allowlisted patterns that no longer match: remove them from gpl_guard_allowlist');
});

test('the guards work: each T-S-11 pattern and the T-K03 scan catch a sample built from parts', () => {
  const g = (...w) => w.join('');
  const samples = {
    jsbsim_model: g('<', 'fdm_config name="x" version="2.0">'),
    jsbsim_parts: [g('<turboprop', '_engine name="x">'), g('<brushless_dc', '_motor name="m">'), g('<prop', 'eller name="prop">'), g('<prop', 'eller version="1.01" name="p">'), g('<run', 'script name="s">'), g('xsi:noNamespaceSchemaLocation="http://jsbsim.sf.net/JSBSim', 'Script.xsd"')],
    license_name: [g('<license license', 'Name="GPL (General Public License)"/>'), g("<license license", "Name='LGPL'/>")],
    gpl: [g('GNU General ', 'Public License'), g('# the GNU General\n# ', 'Public License'), g('GNU\u00a0General ', 'Public License'), g('% the GNU General\n% ', 'Public License'), g('> GNU General\n> ', 'Public License'), g('GNU\uFFFDGeneral ', 'Public License')],
    lgpl: [g('GNU Lesser ', 'General Public License'), g(' * GNU Lesser General\n * ', 'Public License')],
    library_gpl: g('GNU Library ', 'General Public License'),
    agpl: g('GNU Affero ', 'General Public License'),
    spdx: [g('// SPDX-', 'License-Identifier: GPL-2.0-only'), g('# SPDX-', 'License-Identifier: MIT AND LGPL-2.1-or-later'), g('# SPDX-', 'License-Identifier: GPLv3')],
  };
  assert.deepEqual(Object.keys(samples).sort(), Object.keys(GPL_PATTERNS).sort(), 'one sample per pattern');
  for (const [k, ss] of Object.entries(samples)) for (const s of [ss].flat()) assert.deepEqual(gplHits(s), [k], JSON.stringify(s));
  assert.deepEqual(gplHits('MIT License\nPermission is hereby granted, free of charge'), [], 'the MIT text is not GPL');
  // UTF-16 with a byte-order mark is read as text, either byte order, even with an odd byte at the end
  assert.equal(decode(Buffer.concat([Buffer.from([0xff, 0xfe]), Buffer.from('GNU', 'utf16le')])), 'GNU');
  assert.equal(decode(Buffer.concat([Buffer.from([0xfe, 0xff]), Buffer.from('GNU', 'utf16le').swap16(), Buffer.from([0x41])])), 'GNU');
  assert.equal(decode(Buffer.from([0x50, 0x4e, 0x47, 0x00, 0x01])), null, 'a NUL byte means binary');
  // T-K03: each forbidden name, in any case, in code, in a JSON key and in a JSON value; a ห้ามใช้ comment is exempt
  for (const n of POL.forbidden_sources) {
    assert.equal(forbiddenHits('tools/x.py', `heights = load("${n.toLowerCase()}")`).length, 1, n);
    assert.equal(forbiddenHits('data/x.json', JSON.stringify({ source: `tiles from ${n}`, [n]: 1 })).length, 2, n);
    assert.equal(forbiddenHits('src/x.js', `// ห้ามใช้ ${n}`).length, 0, n);
  }
  // a base64 payload, wrapped or not, is skipped where a name can occur by chance; long prose is not taken for base64
  const b64name = POL.forbidden_sources.find((n) => /^[A-Za-z]+$/.test(n));   // a name that can occur inside base64
  assert.equal(forbiddenHits('data/x.json', JSON.stringify({ bld: 'QUJD'.repeat(70) + b64name, w: ('QUJD'.repeat(19) + '\n').repeat(4) + b64name.toLowerCase() })).length, 0, 'base64 is skipped');
  for (const n of POL.forbidden_sources) assert.equal(forbiddenHits('data/x.json', JSON.stringify({ note: 'x '.repeat(150) + n })).length, 1, `long prose naming ${n}`);
});

// source and license of a data JSON file: top level, or _meta for a parameter card whose leaves are {v, u, scope, ...}
const fieldsOf = (d) => ({ source: d.source ?? d._meta?.source, license: d.license ?? d._meta?.license });

test('§11 item 3: every JSON file under data/ carries source and license (ODbL where any source is ODbL)', () => {
  const json = under('data').filter((p) => /\.(geo)?json$/i.test(p));
  assert.ok(json.length >= 2, json.join());
  for (const f of POL.legacy_data_without_fields) {
    assert.ok(json.includes(f), `${f} is gone: remove it from legacy_data_without_fields`);
    const { source, license } = fieldsOf(JSON.parse(read(f)));
    assert.ok(!(source && license), `${f} now has source and license: remove it from legacy_data_without_fields`);
  }
  for (const f of json.filter((p) => !POL.legacy_data_without_fields.includes(p))) {
    const d = JSON.parse(read(f));
    assert.ok(d && !Array.isArray(d) && typeof d === 'object', `${f}: top level must be an object`);
    const { source, license } = fieldsOf(d);
    assert.ok(typeof source === 'string' && source.trim(), `${f}: "source" (where the data comes from)`);
    assert.ok(typeof license === 'string' && license.trim(), `${f}: "license"`);
    const odbl = POL.odbl_derived_files.includes(f) || /OpenStreetMap|\bOSM\b/i.test(source);
    if (odbl) assert.match(license, /ODbL/, `${f} is derived from OpenStreetMap (ODbL) data: its license must name ODbL`);
    if (/ODbL|Open\s*Database\s*Licen[cs]e/i.test(license) || odbl) assert.ok(POL.odbl_derived_files.includes(f), `${f} is ODbL: add it to odbl_derived_files (and README, data/LICENSE-DATA.md)`);
  }
});

test('§11 item 4: data/LICENSE-DATA.md and README.md name the ODbL files, and every data file has its provenance', () => {
  const lic = read('data/LICENSE-DATA.md');
  for (const t of ['Open Database License', 'https://opendatacommons.org/licenses/odbl/1-0/', 'https://opendatacommons.org/licenses/dbcl/1-0/', '© OpenStreetMap contributors', 'https://www.openstreetmap.org/copyright', 'AIP Thailand'])
    assert.ok(lic.includes(t), `LICENSE-DATA.md: "${t}"`);
  const odbl = POL.odbl_derived_files.filter(exists);
  assert.ok(odbl.length >= 4, odbl.join());
  // the ODbL table of LICENSE-DATA.md: one row per file, named relative to data/
  const odblRows = lic.split('\n').filter((l) => /^\| `[^`]+` \|.*ODbL/.test(l)).map((l) => 'data/' + l.match(/^\| `([^`]+)`/)[1]);
  assert.deepEqual(odblRows.sort(), [...odbl].sort(), 'ODbL rows in LICENSE-DATA.md');
  // every data file has a table row: | `file` | content | made by | licence |, none of them empty
  const rows = Object.fromEntries(lic.split('\n').filter((l) => /^\| `[^`]+` \|/.test(l)).map((l) => [l.match(/^\| `([^`]+)`/)[1], l.split('|').slice(2, -1).map((c) => c.trim())]));
  for (const p of under('data').map((p) => p.slice('data/'.length)).filter((p) => p !== 'LICENSE-DATA.md')) {
    assert.ok(rows[p], `data/${p} has no row in the tables of data/LICENSE-DATA.md`);
    assert.ok(rows[p].length === 3 && rows[p].every(Boolean), `data/${p}: its row needs content, made by and licence`);
  }
  const readme = read('README.md'), i = readme.indexOf('## ข้อมูลและสัญญาอนุญาต');
  assert.ok(i >= 0, 'README.md section "ข้อมูลและสัญญาอนุญาต"');
  const sec = readme.slice(i).split(/\n## /)[0];
  for (const f of odbl) assert.ok(sec.includes('`' + f + '`'), `README names ${f} as ODbL`);
  assert.ok(sec.includes('(data/LICENSE-DATA.md)'), 'README links data/LICENSE-DATA.md');
  // research round 5 §12 P3-9: the code licence the owner chose (MIT, 2026-11-25), linked from README
  assert.ok(sec.includes('](LICENSE)') && sec.includes(POL.code_license.spdx), `README links LICENSE and names ${POL.code_license.spdx}`);
});

const MIT_TEXT = 'Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions: The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software. THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.';

test('§12 P3-9 the code licence: LICENSE holds the full MIT text the owner chose, and the data notice keeps ODbL apart', () => {
  const L = POL.code_license;
  assert.equal(L.spdx, 'MIT');
  // the title, the copyright line the policy records (the owner may change the holder in both places), then the MIT
  // licence (opensource.org/license/mit) word for word, with nothing between them
  const lic = read(L.file).replace(/\r\n/g, '\n').match(/^MIT License\n\s*\n([^\n]+)\n\s*\n([\s\S]+)$/);
  assert.ok(lic, 'LICENSE: "MIT License", a blank line, the copyright line, a blank line, the licence');
  assert.equal(lic[1].trim(), L.copyright, 'the copyright line in LICENSE and in the policy');
  assert.match(L.copyright, /^Copyright \(c\) 20\d\d(?:[-–]20\d\d)? \S/, 'policy code_license.copyright');
  assert.equal(lic[2].replace(/\s+/g, ' ').trim(), MIT_TEXT, 'LICENSE is the MIT text, unchanged');
  // MIT for the code, ODbL for the OSM-derived files: the data notice says so in both languages
  const [en, th] = read('data/LICENSE-DATA.md').split('## สรุปภาษาไทย');
  assert.ok(th !== undefined, 'data/LICENSE-DATA.md has the Thai summary');
  for (const part of [en, th]) assert.match(part, /MIT[^\n]*`LICENSE`/, 'data/LICENSE-DATA.md names the code licence (MIT, `LICENSE`) in both languages');
});
