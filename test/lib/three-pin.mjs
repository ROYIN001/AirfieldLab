// three.js r186, pinned for test/shots.mjs. The page loads these files from jsDelivr through the import map in
// src/template.html; the screenshot harness serves them from a local cache instead, so a run does not depend on the
// CDN and always renders against the same bytes. Hashes are SHA-256 of the files served at
// https://cdn.jsdelivr.net/npm/three@0.186.0/<path> (the npm package three@0.186.0, MIT licence), taken 2026-11-22.
// test/shots.test.mjs checks that this list covers every three.js file the page imports.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';

export const THREE_VERSION = '0.186.0';
export const THREE_CDN = `https://cdn.jsdelivr.net/npm/three@${THREE_VERSION}/`;
// The cache folder of a three.js version (relative to the repo root): CACHE_DIR for this pin, and for the pin of another
// build passed to test/shots.mjs with --pin. .github/workflows/shots.yml caches .cache/three-*, so both stay inside it.
export const cacheDir = (version) => `.cache/three-${version}`;
export const CACHE_DIR = cacheDir(THREE_VERSION);
export const THREE_FILES = {
  'build/three.module.js': '9052042d676cb0fdc1ddfefe193053f34b7ac0513a616fdac4535d49987812ea',
  'build/three.core.js': '9edde002b066a9a05676a6127f67735b62baf399bdea529f2f7e31657da769e6',
  'examples/jsm/controls/OrbitControls.js': '3d79d07ecb686b4e5d93232eedab255331c1beef711e13164eaa1f68655a5f2b',
  'examples/jsm/utils/BufferGeometryUtils.js': '9fb63427ce6641fa14fd0baff9cc4d1b5f9c3d85fd084bf2e90e803c44ec1797',
};

const sha256 = (buf) => crypto.createHash('sha256').update(buf).digest('hex');

// Why a fetch failed, in one line: fetch's own message is only 'fetch failed', so the chain of causes, and for a cause
// without a message (an AggregateError when every address of a host fails) its code and the errors inside it.
export function causes(e) {
  const m = [];
  for (let c = e; c; c = c.cause) m.push(c.message || [c.code, ...(c.errors || []).map((x) => x.message)].filter(Boolean).join(', '));
  return m.filter(Boolean).join(': ');
}

// Node's fetch ignores HTTPS_PROXY unless NODE_USE_ENV_PROXY=1 was set when Node started (Node 22.21 or later). Behind
// a proxy (the cloud workspace) the file is fetched by a child Node started with it; CI has no proxy and fetches
// directly. When the fetch fails the child prints one line, causes(), and no warnings. When Node itself fails before
// the code runs (an HTTPS_PROXY without http:// or https://), stderr is a stack dump: its "...Error: ..." line is the
// cause. Only that one line is kept, since the dump also prints the proxy URL, credentials included.
async function download(url) {
  if ((process.env.HTTPS_PROXY || process.env.https_proxy) && !process.env.NODE_USE_ENV_PROXY) {
    const code = `const causes = ${causes};`
      + ' try { const r = await fetch(process.argv[1]); if (!r.ok) { console.error(`answered ${r.status}`); process.exit(3); }'
      + ' process.stdout.write(Buffer.from(await r.arrayBuffer())); }'
      + ' catch (e) { console.error(causes(e)); process.exit(4); }';
    try {
      return execFileSync(process.execPath, ['--no-warnings', '--input-type=module', '-e', code, url],
        { env: { ...process.env, NODE_USE_ENV_PROXY: '1' }, maxBuffer: 64 << 20, stdio: ['ignore', 'pipe', 'pipe'] });
    } catch (e) {
      throw new Error(`three.js: ${url} through the proxy (Node ${process.versions.node}): ${childError(e)}`);
    }
  }
  let r;
  try { r = await fetch(url); } catch (e) { throw new Error(`three.js: ${url}: ${causes(e)}`); }
  if (!r.ok) throw new Error(`three.js: ${url} answered ${r.status}`);
  return Buffer.from(await r.arrayBuffer());
}
// The one line to report from a failed child: Node's "<Name>Error[ [CODE]]: message" line of a stack dump, else the
// line the child printed itself, else the exec error.
export function childError(e) {
  const lines = String(e.stderr || '').split('\n').map((l) => l.trim()).filter(Boolean);
  return lines.find((l) => /^\w*Error( \[\w+\])?: /.test(l)) || lines[0] || e.message;
}

// Makes sure <dir>/<path> holds every pinned file with the pinned hash, downloading what is missing or wrong.
// Returns { [CDN URL]: local file }. Throws if a download fails or does not match its hash.
// CACHE_DIR is the folder test/shots.mjs and .github/workflows/shots.yml keep it in, one per version.
export async function ensureThree(dir) {
  const map = {};
  for (const [rel, hash] of Object.entries(THREE_FILES)) {
    const file = path.join(dir, rel), url = THREE_CDN + rel;
    if (!fs.existsSync(file) || sha256(fs.readFileSync(file)) !== hash) {
      const buf = await download(url);
      if (sha256(buf) !== hash) throw new Error(`three.js: ${url} does not match its pinned SHA-256`);
      fs.mkdirSync(path.dirname(file), { recursive: true });
      fs.writeFileSync(file, buf);
    }
    map[url] = file;
  }
  return map;
}
