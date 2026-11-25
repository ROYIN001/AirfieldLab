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

// Every <p class="foot"> paragraph of the page that `node build.mjs` writes (credits first, then the physics note):
// `html` keeps the markup (links), `text` is what the reader sees.
const FOOT = (() => {
  const ps = [...assemble().html.matchAll(/<p class="foot">([\s\S]*?)<\/p>/g)].map((m) => m[1]);
  assert.ok(ps.length, 'no <p class="foot"> in the page');
  const html = ps.join(' · ');
  return { html, text: html.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ') };
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
  assert.deepEqual(POL.forbidden_sources_dirs, ['data', 'src', 'tools']);
});

test(`T-K05 the footer cites the fixture's cycle (${cycleTH}) and no older one`, () => {
  assert.ok(FOOT.text.includes(cycleTH), `footer: ${FOOT.text.slice(0, 120)}…`);
  assert.equal([...FOOT.text.matchAll(/AIRAC/g)].length, 1, 'one AIRAC cycle in the footer');
  assert.ok(!FOOT.text.includes('14 พ.ค. 2026'), 'the 14 พ.ค. 2026 cycle is gone');
});

test(`T-K05 src/15-geo.js names ${cycleEN} as its source and CLAUDE.md does the same`, () => {
  const src = read('src/15-geo.js').split('\n').find((l) => l.startsWith('// Source: AIP Thailand AD 2 VTBD'));
  assert.ok(src && src.includes(`(CAAT, ${cycleEN}`), src);
  const prov = read('CLAUDE.md').split('\n').find((l) => l.startsWith('- Runways, lights, navaids: AIP Thailand AD 2 VTBD'));
  assert.ok(prov && prov.includes(cycleEN), prov);
});

test('T-K01 the footer of the built page has every required credit, with the OSM and ODbL links', () => {
  for (const t of POL.required_footer_terms) assert.ok(FOOT.text.includes(t), `footer lacks "${t}"`);
  // OSM attribution: the credit links to the copyright page; ODbL 4.3: the reader can reach the licence
  for (const href of ['https://www.openstreetmap.org/copyright', 'https://opendatacommons.org/licenses/odbl/1-0/', 'https://aip.caat.or.th'])
    assert.ok(FOOT.html.includes(`href="${href}"`), `footer link ${href}`);
  assert.ok(FOOT.html.includes('/data/LICENSE-DATA.md"'), 'footer link to data/LICENSE-DATA.md');
  // links in the footer open beside the running page, not in place of it
  for (const a of FOOT.html.match(/<a\b[^>]*>/g)) assert.match(a, /target="_blank" rel="noopener"/, a);
});

test('T-K02 a data source in use has its credit in the footer (no credit ahead of the data)', () => {
  const inUse = Object.entries(POL.conditional_footer_terms).filter(([f]) => exists(f));
  for (const [f, terms] of inUse) for (const t of terms) assert.ok(FOOT.text.includes(t), `${f} is in the repo: footer needs "${t}"`);
});

// Text of a file as lines to search. A JSON file contributes its keys and string values, without base64 payloads
// (city.json packs records as base64, where a short name such as "CIFP" can occur by chance).
function searchableLines(p) {
  const s = read(p);
  if (!p.endsWith('.json')) return s.split('\n');
  const out = [], b64 = /^[A-Za-z0-9+/=\s]{256,}$/;
  const visit = (v) => {
    if (typeof v === 'string') { if (!b64.test(v)) out.push(...v.split('\n')); }
    else if (Array.isArray(v)) v.forEach(visit);
    else if (v && typeof v === 'object') for (const [k, x] of Object.entries(v)) { out.push(k); visit(x); }
  };
  try { visit(JSON.parse(s)); return out; } catch (e) { return s.split('\n'); }
}
const TEXT_EXT = /\.(m?js|cjs|json|html|css|glsl|py|md|txt|csv|ya?ml|sh|svg)$/i;

test('T-K03 no forbidden data source is named in data/, src/ or tools/ (except a comment that starts with ห้ามใช้)', () => {
  const files = REPO_FILES.filter((p) => POL.forbidden_sources_dirs.some((d) => p.startsWith(d + '/')) && TEXT_EXT.test(p));
  assert.ok(files.length > 20, `scanned ${files.length} files`);
  const allowed = /^\s*(?:\/\/|\/\*|\*|#|<!--)\s*ห้ามใช้/;
  const hits = [];
  for (const p of files) searchableLines(p).forEach((l, i) => {
    if (allowed.test(l)) return;
    for (const name of POL.forbidden_sources) if (l.includes(name)) hits.push(`${p}:${i + 1} ${name}`);
  });
  assert.deepEqual(hits, [], 'research §11 table 11.3: these sources may not be used in the repo');
});

test('T-K04 no raster or PDF file (.tif, .tiff, .pdf, .jp2) in the repo or in dist/', () => {
  const ext = new Set(POL.forbidden_extensions_in_repo);
  const files = [...REPO_FILES, ...under('dist')];
  const hits = files.filter((p) => ext.has(path.extname(p).toLowerCase()));
  assert.deepEqual(hits, [], 'AIP charts, DEM and imagery stay out of the repo: link to the source instead (research §11)');
});

// T-S-11 patterns, assembled from parts so that this file does not match itself
const W = (...w) => new RegExp(w.join('\\s+'), 'i');
const GPL_PATTERNS = [
  new RegExp('<' + 'fdm_config\\b', 'i'),                        // a JSBSim aircraft model (JSBSim is LGPL)
  new RegExp('license' + 'Name\\s*=\\s*"\\s*(?:L|A)?GPL', 'i'),     // a JSBSim or FlightGear file header
  W('GNU', 'GENERAL', 'PUBLIC', 'LICENSE'), W('GNU', 'LESSER', 'GENERAL', 'PUBLIC'),
  W('GNU', 'LIBRARY', 'GENERAL', 'PUBLIC'), W('GNU', 'AFFERO', 'GENERAL', 'PUBLIC'),
  new RegExp('SPDX-' + 'License-Identifier:\\s*\\(?\\s*(?:L|A)?GPL', 'i'),
];

test('T-S-11 no GPL or LGPL text and no JSBSim model in the repo, except the files the owner approved', () => {
  const hits = REPO_FILES.filter((p) => {
    const s = fs.readFileSync(path.join(ROOT, p)).toString('latin1');   // the patterns are ASCII
    return GPL_PATTERNS.some((re) => re.test(s));
  });
  const allow = Object.keys(POL.gpl_guard_allowlist);
  const extra = hits.filter((p) => !allow.includes(p)), stale = allow.filter((p) => !hits.includes(p));
  assert.deepEqual(extra, [], 'new GPL/LGPL or JSBSim text: remove it, or ask the owner to add the file to gpl_guard_allowlist');
  assert.deepEqual(stale, [], 'these allowlisted files no longer match: remove them from gpl_guard_allowlist');
});

test('§11 item 3: every JSON file under data/ carries top-level source and license (ODbL where the data is ODbL)', () => {
  const json = under('data').filter((p) => p.endsWith('.json'));
  assert.ok(json.length >= 2, json.join());
  for (const f of POL.legacy_data_without_fields) {
    assert.ok(json.includes(f), `${f} is gone: remove it from legacy_data_without_fields`);
    const d = JSON.parse(read(f));
    assert.ok(!(d.source && d.license), `${f} now has source and license: remove it from legacy_data_without_fields`);
  }
  for (const f of json.filter((p) => !POL.legacy_data_without_fields.includes(p))) {
    const d = JSON.parse(read(f));
    assert.ok(d && !Array.isArray(d) && typeof d === 'object', `${f}: top level must be an object`);
    assert.ok(typeof d.source === 'string' && d.source.trim(), `${f}: top-level "source" (where the data comes from)`);
    assert.ok(typeof d.license === 'string' && d.license.trim(), `${f}: top-level "license"`);
    if (POL.odbl_derived_files.includes(f)) assert.match(d.license, /ODbL/, `${f} is derived from ODbL data`);
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
  for (const p of under('data').map((p) => p.slice('data/'.length)).filter((p) => p !== 'LICENSE-DATA.md'))
    assert.ok(lic.includes('`' + p + '`'), `data/${p} has no line in data/LICENSE-DATA.md`);
  const readme = read('README.md'), i = readme.indexOf('## ข้อมูลและสัญญาอนุญาต');
  assert.ok(i >= 0, 'README.md section "ข้อมูลและสัญญาอนุญาต"');
  const sec = readme.slice(i).split(/\n## /)[0];
  for (const f of odbl) assert.ok(sec.includes('`' + f + '`'), `README names ${f} as ODbL`);
  assert.ok(sec.includes('(data/LICENSE-DATA.md)'), 'README links data/LICENSE-DATA.md');
  // research round 5 §12 P3-9: the code licence the owner chose (MIT, 2026-11-25), linked from README
  assert.ok(sec.includes('](LICENSE)') && sec.includes(POL.code_license.spdx), `README links LICENSE and names ${POL.code_license.spdx}`);
});

test('§12 P3-9 the code licence: LICENSE holds the full MIT text the owner chose, and the data notice keeps ODbL apart', () => {
  const L = POL.code_license;
  assert.equal(L.spdx, 'MIT');
  const lic = read(L.file).replace(/\s+/g, ' ');
  assert.match(lic, /^MIT License Copyright \(c\) 20\d\d \S/, 'title and copyright line');
  // the two paragraphs of the MIT text that carry the grant and its one condition, word for word
  for (const s of ['Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction',
    'The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.',
    'THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND'])
    assert.ok(lic.includes(s), `LICENSE lacks: ${s.slice(0, 50)}…`);
  // MIT for the code, ODbL for the OSM-derived files: the data notice says so in both languages
  const data = read('data/LICENSE-DATA.md');
  assert.ok(data.includes('MIT') && data.includes('`LICENSE`'), 'data/LICENSE-DATA.md names the code licence');
});
