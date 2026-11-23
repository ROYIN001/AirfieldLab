// Keeps test/shots.mjs runnable from the repository and in CI (plan B8): no absolute paths of the machine it was
// first written on, and the pinned three.js files (test/lib/three-pin.mjs) are the version and the files the page
// imports, so the harness never falls back to a file it does not hold.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { assemble } from '../build.mjs';
import { THREE_VERSION, THREE_CDN, THREE_FILES, CACHE_DIR, cacheDir, causes, childError } from './lib/three-pin.mjs';

const DIR = path.dirname(fileURLToPath(import.meta.url));
// source text without comments (block comments, and // after a space or at the start of a line: 'https://' stays)
const live = (f) => fs.readFileSync(new URL(f, import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|\s)\/\/.*$/gm, '$1');
const yamlLive = (f) => fs.readFileSync(new URL(f, import.meta.url), 'utf8').replace(/(^|\s)#.*$/gm, '$1');
const { js, tpl } = assemble();

test('no machine-specific absolute paths under test/', () => {
  const bad = /\/home\/claude|\/opt\/npm-tools|\/opt\/node-tools|\/opt\/pw-browsers|\/usr\/bin\/google-chrome|\/home\/user\//;
  const hits = fs.readdirSync(DIR, { recursive: true }).filter((f) => /\.(mjs|js|json)$/.test(f))
    .filter((f) => f !== 'shots.test.mjs' && bad.test(fs.readFileSync(path.join(DIR, f), 'utf8')));
  assert.deepEqual(hits, [], `absolute paths in ${hits.join(', ')}`);
});

test('the pinned three.js is the version in the import map', () => {
  const im = JSON.parse(tpl.match(/<script type="importmap">([\s\S]*?)<\/script>/)[1]).imports;
  assert.equal(im.three, THREE_CDN + 'build/three.module.js');
  assert.equal(im['three/addons/'], THREE_CDN + 'examples/jsm/');
  assert.match(THREE_VERSION, /^\d+\.\d+\.\d+$/);
});

test('every three.js file the page imports is pinned with a SHA-256', () => {
  const addons = [...js.matchAll(/from 'three\/addons\/([^']+)'/g)].map((m) => 'examples/jsm/' + m[1]);
  assert.ok(addons.length >= 2, `${addons.length} addon imports found`);
  // three.module.js imports ./three.core.js (r160 and later)
  for (const f of ['build/three.module.js', 'build/three.core.js', ...addons]) assert.ok(f in THREE_FILES, `${f} is not pinned`);
  for (const [f, h] of Object.entries(THREE_FILES)) assert.match(h, /^[0-9a-f]{64}$/, f);
});

test('the CI cache holds both folders the harness reads three.js from', () => {
  const yml = yamlLive('../.github/workflows/shots.yml'), shots = live('./shots.mjs');
  const glob = yml.match(/path: (\S+)\n\s+key: three-\$\{\{ hashFiles\('test\/lib\/three-pin\.mjs'\) \}\}/);
  assert.ok(glob, 'the three.js cache step');
  const inGlob = (dir) => new RegExp('^' + glob[1].replace(/[.]/g, '\\.').replace(/\*/g, '[^/]+') + '$').test(dir);
  assert.equal(CACHE_DIR, cacheDir(THREE_VERSION));
  for (const v of [THREE_VERSION, '0.185.0', '0.190.1']) assert.ok(inGlob(cacheDir(v)), `${cacheDir(v)} outside ${glob[1]}`);
  // this pin, and the pin of the base build (--pin)
  assert.match(shots, /ensureThree\(path\.join\(ROOT, CACHE_DIR\)\)/);
  assert.match(shots, /pin\.ensureThree\(path\.join\(ROOT, cacheDir\(pin\.THREE_VERSION\)\)\)/);
  assert.doesNotMatch(shots, /\.cache\/three-/, 'cache folders come from cacheDir()');
  // a push to main fills the cache for every pull request; the base renders with its own pin when it has one
  assert.match(yml, /if: github\.event_name == 'push'\n\s+run: node -e "import\('\.\/test\/lib\/three-pin\.mjs'\)\.then\(\(m\) => m\.ensureThree\(m\.CACHE_DIR\)\)"/);
  assert.match(yml, /pin=\(--pin \.cache\/base\/test\/lib\/three-pin\.mjs\)/);
  assert.match(yml, /node test\/shots\.mjs ci --dist \.cache\/base\/dist --out shots\/before "\$\{pin\[@\]\}"/);
});

test('the harness fails fast, fetches through the proxy and seeds each flight', () => {
  const shots = live('./shots.mjs'), pin = live('./lib/three-pin.mjs');
  // an unpinned three.js file ends the run at once instead of hanging the module load
  assert.match(shots, /if \(u\.startsWith\('https:\/\/cdn\.jsdelivr\.net\/npm\/three@'\)\) \{\n[^\n]*\n\s+fail\(msg\); stop\(new Error\(msg\)\); return route\.abort\(\);/);
  assert.match(shots, /Promise\.race\(\[stopped, page\.waitForFunction\(/);
  // Node's fetch reads HTTPS_PROXY only with NODE_USE_ENV_PROXY=1
  assert.match(pin, /env: \{ \.\.\.process\.env, NODE_USE_ENV_PROXY: '1' \}/);
  assert.match(pin, /if \(\(process\.env\.HTTPS_PROXY \|\| process\.env\.https_proxy\) && !process\.env\.NODE_USE_ENV_PROXY\) \{/);
  // Math.random: mulberry32 from a fixed seed, started again by every startFlight the harness calls
  const init = shots.match(/await ctx\.addInitScript\(\(\) => \{\n\s+const SEED = (\d+);([\s\S]*?)\n  \}\);/);
  assert.ok(init, 'the seeded Math.random init script');
  const win = {}, M = Object.create(Math);
  new Function('window', 'Math', `const SEED = ${init[1]};${init[2]}`)(win, M);
  const first = [M.random(), M.random(), M.random()];
  assert.ok(first.every((x) => x >= 0 && x < 1) && new Set(first).size === 3, `${first}`);
  for (let i = 0; i < 12345; i++) M.random();
  win.__shotsSeed();
  assert.deepEqual([M.random(), M.random(), M.random()], first, 'the stream starts again');
  assert.match(shots, /^  await page\.evaluate\(\(\) => \{ const go = __app\.startFlight; __app\.startFlight = \(\.\.\.a\) => \{ __shotsSeed\(\); return go\(\.\.\.a\); \}; \}\);$/m);
});

test('a failed three.js download says why, without the proxy credentials', () => {
  // fetch failing on every address of a host: an AggregateError without a message, with a code and the errors inside
  const all = Object.assign(new AggregateError([new Error('connect ECONNREFUSED 104.16.179.112:443'), new Error('connect ECONNREFUSED 104.16.180.112:443')], ''), { code: 'ECONNREFUSED' });
  assert.equal(causes(new TypeError('fetch failed', { cause: all })),
    'fetch failed: ECONNREFUSED, connect ECONNREFUSED 104.16.179.112:443, connect ECONNREFUSED 104.16.180.112:443');
  const tunnel = new TypeError('fetch failed', { cause: new DOMException('Request was cancelled.', 'AbortError') });
  tunnel.cause.cause = new Error('Proxy response (502) !== 200 when HTTP Tunneling');
  assert.equal(causes(tunnel), 'fetch failed: Request was cancelled.: Proxy response (502) !== 200 when HTTP Tunneling');
  // the child: its own line, or the error line of Node's stack dump (which also prints the proxy URL), or the exec error
  assert.equal(childError({ stderr: Buffer.from('answered 404\n'), message: 'Command failed' }), 'answered 404');
  const dump = ["node:internal/url:818", "    href = bindingUrl.parse(input, base, true);", "           ^", "",
    "TypeError: Invalid URL", "    at new URL (node:internal/url:818:25)", "  code: 'ERR_INVALID_URL',", "  input: 'http://user:secret@bad host:3128'", "}", "", "Node.js v22.23.5"].join('\n');
  assert.equal(childError({ stderr: Buffer.from(dump), message: 'Command failed' }), 'TypeError: Invalid URL');
  assert.equal(childError({ stderr: Buffer.from('x\nInvalidArgumentError [UND_ERR_INVALID_ARG]: Invalid URL protocol\n'), message: '' }), 'InvalidArgumentError [UND_ERR_INVALID_ARG]: Invalid URL protocol');
  assert.equal(childError({ stderr: Buffer.alloc(0), message: 'spawnSync node ETIMEDOUT' }), 'spawnSync node ETIMEDOUT');
  // the child runs the same causes()
  assert.match(live('./lib/three-pin.mjs'), /const code = `const causes = \$\{causes\};`/);
});
