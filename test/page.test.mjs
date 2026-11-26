// The whole page script. build.mjs joins every src/NN-*.js into one <script type="module">; the physics tests only
// evaluate the pure files, so this test parses the assembled module (a syntax error anywhere, or a top-level name
// declared in two files, stops the page before it draws anything) and checks the wiring between the scripts and the
// template: the import map is valid JSON and every element id the scripts look up exists. It also checks what a build
// hands to GitHub Pages and to a pull request's preview artifact (CLAUDE.md, "Preview each pull request"): index.html
// plus every data file the page fetches, in types and sizes the artifact host accepts, and the preview page.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { assemble, build, dataFiles, previewHtml } from '../build.mjs';

const BUILD = fileURLToPath(new URL('../build.mjs', import.meta.url));

const { html, js, tpl } = assemble();
const mod = html.match(/<script type="module">([\s\S]*?)<\/script>/);

test('one module script in the page', () => {
  assert.ok(mod && html.split('<script type="module">').length === 2);
});

test('the page module parses: no syntax error, no name declared twice', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'afl-page-')), file = path.join(dir, 'page.mjs');
  fs.writeFileSync(file, mod[1]);
  let err = '';
  try { execFileSync(process.execPath, ['--check', file], { stdio: 'pipe' }); } catch (e) { err = String(e.stderr || e.message); }
  fs.rmSync(dir, { recursive: true, force: true });
  let where = '';
  const at = err.match(/page\.mjs:(\d+)/);
  if (at) {   // name the source file and its line from the "// ==== NN-file.js ====" markers
    const lines = mod[1].split('\n'), n = +at[1];
    for (let i = n - 1; i >= 0; i--) { const m = lines[i].match(/^\/\/ ==== (\S+) ====$/); if (m) { where = ` (${m[1]} line ${n - i - 1})`; break; } }
  }
  assert.equal(err, '', err.split('\n').filter((l) => /Error|page\.mjs/.test(l)).slice(0, 3).join(' | ') + where);
});

test('the import map is valid JSON with three and three/addons/', () => {
  const im = tpl.match(/<script type="importmap">([\s\S]*?)<\/script>/);
  const o = JSON.parse(im[1]);
  assert.ok(o.imports && o.imports.three && o.imports['three/addons/']);
});

test('every element id the scripts use exists in the template, none twice', () => {
  const list = [...tpl.matchAll(/\bid="([^"]+)"/g)].map((x) => x[1]), ids = new Set(list);
  const used = new Set([...js.matchAll(/\$\('#([\w-]+)/g), ...js.matchAll(/getElementById\('([\w-]+)'\)/g), ...js.matchAll(/querySelector(?:All)?\('#([\w-]+)/g)].map((x) => x[1]));
  const missing = [...used].filter((id) => !ids.has(id)), twice = list.filter((id, i) => list.indexOf(id) !== i);
  assert.ok(used.size > 30, `${used.size} ids found in the scripts`);
  assert.deepEqual(missing, [], `ids used but not in the template: ${missing.join(', ')}`);
  assert.deepEqual(twice, [], `ids repeated in the template: ${twice.join(', ')}`);
});

test('a build writes index.html and every data file, byte for byte, and nothing else', () => {
  const out = fs.mkdtempSync(path.join(os.tmpdir(), 'afl-dist-'));
  try {
    const { data } = build({ out });
    const root = new URL('../data/', import.meta.url);
    assert.ok(data.length >= 4, `${data.length} data files`);
    assert.equal(fs.readFileSync(path.join(out, 'index.html'), 'utf8'), html);
    for (const f of data) assert.ok(fs.readFileSync(path.join(out, f)).equals(fs.readFileSync(new URL(f, root))), `dist/${f} differs from data/${f}`);
    assert.deepEqual(dataFiles(out), ['index.html', ...data].sort());
  } finally { fs.rmSync(out, { recursive: true, force: true }); }
});

test('every file the page fetches is in data/, and the loader fetches exactly DATA_FILES', () => {
  const list = js.match(/const DATA_FILES = \[([^\]]*)\]/), have = new Set(dataFiles());
  assert.ok(list, 'DATA_FILES not found in the page script');
  const listed = [...list[1].matchAll(/(['"`])([^'"`]+)\1/g)].map((m) => m[2]);
  // loadData's get(name, kind) calls (not store.get or map.get) and any fetch of a literal name
  const got = [...js.matchAll(/(?<![.\w])get\(\s*(['"`])([^'"`$]+)\1\s*,/g)].map((m) => m[2]);
  const fetched = [...js.matchAll(/\bfetch\(\s*(['"`])([^'"`$]+)\1/g)].map((m) => m[2]);
  assert.ok(listed.length >= 4, `${listed.length} names in DATA_FILES`);
  assert.deepEqual([...new Set(got)].sort(), [...new Set(listed)].sort(), 'get() calls and DATA_FILES differ');
  const missing = [...new Set([...listed, ...got, ...fetched])].filter((n) => !have.has(n));
  assert.deepEqual(missing, [], `fetched by the page but not in data/: ${missing.join(', ')}`);
});

test('data files are types and sizes the artifact host serves', () => {
  // claude.ai artifacts: standard web media types only (it refuses .bin, so city.json carries base64), at most 16 MB
  // per text file and 15 MB per binary file, 64 MB per publish
  const root = new URL('../data/', import.meta.url), MB = 1024 * 1024;
  const TEXT = /\.(json|md|txt|csv|svg)$/, BIN = /\.(png|jpe?g|webp)$/;
  let total = Buffer.byteLength(html);
  for (const f of dataFiles()) {
    const size = fs.statSync(new URL(f, root)).size; total += size;
    assert.ok(TEXT.test(f) || BIN.test(f), `data/${f}: not a type the artifact host serves`);
    assert.ok(size <= (TEXT.test(f) ? 16 : 15) * MB, `data/${f}: ${(size / MB).toFixed(1)} MB`);
  }
  assert.ok(total <= 64 * MB, `page plus data ${(total / MB).toFixed(1)} MB, one publish takes 64 MB`);
});

test('the preview page only adds the PR number to the title and a badge', () => {
  const p = previewHtml(html, 12);
  assert.equal(p.match(/<title>([^<]*)<\/title>/)[1], 'พรีวิว PR #12 · ' + html.match(/<title>([^<]*)<\/title>/)[1]);
  assert.equal(p.split('<mark class="pv">พรีวิว PR #12</mark>').length, 2);
  const back = p.replace('พรีวิว PR #12 · ', '').replace('<mark class="pv">พรีวิว PR #12</mark>', '').replace(/\.pv \{[^}]*\}\n/, '');
  assert.equal(back, html);
  // the rule sits in the head's style sheet and the badge inside the brand block, never in the page module
  const css = p.indexOf('.pv {'), mark = p.indexOf('<mark class="pv">'), brand = p.indexOf('<div class="brand">');
  assert.ok(p.indexOf('<style>') < css && css < p.indexOf('</style>'), 'badge rule outside <style>');
  assert.ok(brand < mark && mark < p.indexOf('</div>', brand), 'badge outside the brand block');
  for (const bad of ['', '0', '12a', '1"><script>', '-3', '../x', null]) assert.throws(() => previewHtml(html, bad), /PR number expected/);
});

test('a preview build is the preview page plus every data file', () => {
  const out = fs.mkdtempSync(path.join(os.tmpdir(), 'afl-pv-'));
  try {
    const { data } = build({ out, preview: 12 });
    assert.equal(fs.readFileSync(path.join(out, 'index.html'), 'utf8'), previewHtml(html, 12));
    assert.deepEqual(dataFiles(out), ['index.html', ...data].sort());
  } finally { fs.rmSync(out, { recursive: true, force: true }); }
});

test('node build.mjs --preview: both spellings, its own folder, the files map; bad arguments exit 1', () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'afl-cli-'));
  const run = (...a) => execFileSync(process.execPath, [BUILD, ...a], { stdio: 'pipe', encoding: 'utf8' });
  try {
    for (const args of [['--preview=7', '--out', path.join(tmp, 'a')], ['--preview', '7', '--out', path.join(tmp, 'b')]]) {
      const outDir = args.at(-1), log = run(...args);
      assert.match(fs.readFileSync(path.join(outDir, 'index.html'), 'utf8'), /<title>พรีวิว PR #7 · /);
      const map = JSON.parse(log.trim().split('\n').at(-1));
      assert.deepEqual(Object.keys(map).sort(), dataFiles());
      for (const [k, v] of Object.entries(map)) assert.equal(v, path.join(outDir, k));
    }
    for (const bad of [['--preview'], ['--previw', '7'], ['--preview', '7x', '--out', tmp], ['--preview', '../x'], ['7']]) {
      assert.throws(() => run(...bad), (e) => e.status === 1, `node build.mjs ${bad.join(' ')} should exit 1`);
    }
  } finally { fs.rmSync(tmp, { recursive: true, force: true }); }
});
