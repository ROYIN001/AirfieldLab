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
export const CACHE_DIR = `.cache/three-${THREE_VERSION}`;
export const THREE_FILES = {
  'build/three.module.js': '9052042d676cb0fdc1ddfefe193053f34b7ac0513a616fdac4535d49987812ea',
  'build/three.core.js': '9edde002b066a9a05676a6127f67735b62baf399bdea529f2f7e31657da769e6',
  'examples/jsm/controls/OrbitControls.js': '3d79d07ecb686b4e5d93232eedab255331c1beef711e13164eaa1f68655a5f2b',
  'examples/jsm/utils/BufferGeometryUtils.js': '9fb63427ce6641fa14fd0baff9cc4d1b5f9c3d85fd084bf2e90e803c44ec1797',
};

const sha256 = (buf) => crypto.createHash('sha256').update(buf).digest('hex');

// Node's fetch ignores HTTPS_PROXY unless NODE_USE_ENV_PROXY=1 was set when Node started (Node >= 22.21). Behind a proxy
// (the cloud workspace) the file is fetched by a child Node started with it; CI has no proxy and fetches directly.
async function download(url) {
  if ((process.env.HTTPS_PROXY || process.env.https_proxy) && !process.env.NODE_USE_ENV_PROXY) {
    const code = 'const r = await fetch(process.argv[1]); if (!r.ok) { console.error(`answered ${r.status}`); process.exit(3); }'
      + ' process.stdout.write(Buffer.from(await r.arrayBuffer()));';
    try {
      return execFileSync(process.execPath, ['--input-type=module', '-e', code, url],
        { env: { ...process.env, NODE_USE_ENV_PROXY: '1' }, maxBuffer: 64 << 20, stdio: ['ignore', 'pipe', 'pipe'] });
    } catch (e) { throw new Error(`three.js: ${url} through the proxy: ${String(e.stderr || e.message).trim().split('\n').pop()}`); }
  }
  const r = await fetch(url);
  if (!r.ok) throw new Error(`three.js: ${url} answered ${r.status}`);
  return Buffer.from(await r.arrayBuffer());
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
