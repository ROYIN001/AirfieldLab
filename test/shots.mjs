// Screenshots of the built page in headless Chrome with SwiftShader WebGL2.
//   node test/shots.mjs <set> [views] [--dist <dir>] [--out <dir>] [--pin <three-pin.mjs>]
//   sets: ci (the small set CI runs on every pull request), explore, train, layout, phone, final,
//         vtbd [overview,terminal,...], all (explore + train + phone)
// Builds the working tree into .cache/shots-dist unless --dist names a built page (for example a build of main, to
// compare before and after). PNGs go to shots/ unless --out says otherwise. three.js is served from
// .cache/three-<version> (test/lib/three-pin.mjs downloads it once and checks its SHA-256), so a run does not depend on
// the CDN; --pin adds the pin of another build (the base of a PR that changes three.js). Math.random is seeded, so two
// runs draw the same turbulence and demo seeds; cloud drift and flashing lights still follow the time since load.
// Chrome: Playwright's own Chromium, or SHOTS_CHROME=chrome for the installed Google Chrome, or a path to a
// Chrome binary. Playwright is not a dependency of the repo: it is found in node_modules/ or on NODE_PATH
// (CI runs `npm install --no-save playwright`).
// SwiftShader renders on the CPU: compare the images by eye, never time them (research plan B8, P1).
// Exits 1 when the page does not load, throws, logs an error, misses a file, or a shot fails.
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { build } from '../build.mjs';
import { ensureThree, CACHE_DIR } from './lib/three-pin.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const { chromium } = createRequire(import.meta.url)('playwright');

const argv = process.argv.slice(2), opt = (k) => { const i = argv.indexOf(k); return i >= 0 ? argv.splice(i, 2)[1] : null; };
const distArg = opt('--dist'), outArg = opt('--out'), pinArg = opt('--pin');
const [set = 'explore', views] = argv;
const SETS = ['ci', 'explore', 'train', 'layout', 'phone', 'final', 'vtbd', 'all'];
if (!SETS.includes(set)) { console.error(`unknown set "${set}"; sets: ${SETS.join(', ')}`); process.exit(2); }

const DIST = distArg ? path.resolve(distArg) : path.join(ROOT, '.cache/shots-dist');
if (!distArg) build({ out: DIST });
if (!fs.existsSync(path.join(DIST, 'index.html'))) { console.error(`no index.html in ${DIST}`); process.exit(2); }
const OUT = path.resolve(outArg || path.join(ROOT, 'shots'));
fs.mkdirSync(OUT, { recursive: true });
const THREE = await ensureThree(path.join(ROOT, CACHE_DIR));
if (pinArg) {
  const pin = await import(pathToFileURL(path.resolve(pinArg)).href);
  Object.assign(THREE, await pin.ensureThree(path.join(ROOT, `.cache/three-${pin.THREE_VERSION}`)));
}

const logs = [];
let failed = false;
const fail = (msg) => { failed = true; logs.push('FAIL ' + msg); };
const TYPES = { '.html': 'text/html', '.json': 'application/json', '.png': 'image/png', '.js': 'text/javascript' };

async function open(browser, vp, quality = 'balanced') {
  const ctx = await browser.newContext({ viewport: vp, deviceScaleFactor: 1, hasTouch: vp.width < 700, isMobile: false });
  await ctx.addInitScript((q) => { try { localStorage.setItem('afl-quality', q); } catch (e) {} }, quality);
  // a seeded generator (mulberry32) in place of Math.random, the same sequence in every run
  await ctx.addInitScript(() => {
    let a = 20261122;
    Math.random = () => {
      a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  });
  // a three.js file this harness has not pinned would hang the page's module load until the timeout: stop at once
  let stop; const stopped = new Promise((_, rej) => { stop = rej; }); stopped.catch(() => {});
  await ctx.route('**/*', (route) => {
    const u = route.request().url();
    if (THREE[u]) return route.fulfill({ status: 200, contentType: 'text/javascript', body: fs.readFileSync(THREE[u]) });
    if (u.startsWith('https://cdn.jsdelivr.net/npm/three@')) {
      const msg = `three.js file not pinned: ${u} (for another three.js version pass --pin with that build's test/lib/three-pin.mjs)`;
      fail(msg); stop(new Error(msg)); return route.abort();
    }
    if (u.startsWith('http://vtbd.test/')) {
      const rel = decodeURIComponent(u.slice(17).split(/[?#]/)[0] || 'index.html'), f = path.resolve(DIST, rel);
      if (f.startsWith(DIST + path.sep) && fs.existsSync(f)) return route.fulfill({ status: 200, contentType: TYPES[path.extname(f)] || 'application/octet-stream', body: fs.readFileSync(f) });
      fail('404 ' + rel); return route.fulfill({ status: 404, body: '' });
    }
    if (u.includes('fonts.googleapis.com')) return route.fulfill({ status: 200, contentType: 'text/css', body: '' });
    logs.push('BLOCKED ' + u); return route.abort();
  });
  const page = await ctx.newPage();
  page.on('console', (m) => {
    const t = m.type(), s = `[${t}] ${m.text().slice(0, 400)}`;
    if (t === 'error') fail(s); else if (t === 'warning' && !/GPU stall|GL Driver Message/.test(s)) logs.push(s);
  });
  page.on('pageerror', (e) => fail('[pageerror] ' + e.message));
  const t0 = Date.now();
  await page.goto('http://vtbd.test/index.html');
  await Promise.race([stopped, page.waitForFunction(() => document.querySelector('#loading')?.classList.contains('done') || document.querySelector('#loadMsg')?.classList.contains('err'), null, { timeout: 240000 })]);
  const err = await page.evaluate(() => document.querySelector('#loadMsg')?.classList.contains('err') ? document.querySelector('#loadMsg').textContent : '');
  if (err) throw new Error('the page did not load: ' + err);
  logs.push(`loaded ${vp.width}x${vp.height} in ${((Date.now() - t0) / 1000).toFixed(1)} s`);
  return page;
}
const frames = (page, n = 2) => page.evaluate((n) => new Promise((r) => { let k = 0; const f = () => (++k >= n ? r() : requestAnimationFrame(f)); requestAnimationFrame(f); }), n);
async function shot(page, name, full = false) {
  const t0 = Date.now();
  await frames(page, 3);
  await page.screenshot({ path: path.join(OUT, name), fullPage: full, timeout: 180000 });
  logs.push(`shot ${name} (${((Date.now() - t0) / 1000).toFixed(1)} s)`);
}
const ev = (page, fn, arg) => page.evaluate(fn, arg);
// one page per viewport; its context is closed afterwards so an idle page does not keep rendering on the CPU
async function withPage(browser, vp, fn) { const page = await open(browser, vp); try { await fn(page); } finally { await page.context().close(); } }
const evening = () => { const a = __app; const lp = a.localParts(a.app.date); a.app.date = a.makeDate(lp.y, lp.m, lp.d, 19 * 60 + 40); a.applyTime(); };

const SHOTS = {
  async ci(b) {
    await withPage(b, { width: 960, height: 600 }, async (page) => {
      await shot(page, 'c1-overview.png');
      await ev(page, () => { __app.setView('runway', true); }); await shot(page, 'c2-runway.png');
      await ev(page, () => { __app.setMode('train'); __app.startFlight(); const f = __app.app.flight; while (f.ac.t < 92) f.tick(f.dt); __app.setTrainCam('chase'); });
      await shot(page, 'c3-train-chase.png');
      await ev(page, evening); await ev(page, () => { __app.setMode('explore'); __app.setView('approach', true); });
      await frames(page, 4); await shot(page, 'c4-night-approach.png');
    });
    await withPage(b, { width: 390, height: 844 }, async (page) => { await shot(page, 'c5-phone.png'); });
  },
  async vtbd(b) {
    await withPage(b, { width: 1100, height: 680 }, async (page) => {
      const info = await ev(page, () => ({ n: __app.renderer.info.render.triangles, calls: __app.renderer.info.render.calls }));
      logs.push('render info ' + JSON.stringify(info));
      for (const v of (views || 'overview,terminal,runway,golf,rail').split(',')) { await ev(page, (v) => __app.setView(v, true), v); await shot(page, 'v-' + v + '.png'); }
    });
  },
  async explore(b) {
    await withPage(b, { width: 1366, height: 820 }, async (page) => {
      await shot(page, 'e1-overview.png');
      await ev(page, () => __app.setView('runway', true)); await shot(page, 'e2-runway.png');
      await ev(page, () => { __app.setView('apron', true); }); await shot(page, 'e3-apron.png');
      await ev(page, () => { __app.setView('papi', true); __app.selectSpot('papi'); }); await shot(page, 'e4-papi.png');
      await ev(page, evening); await ev(page, () => { __app.selectSpot(null); __app.setView('approach', true); });
      await frames(page, 4); await shot(page, 'e5-night-approach.png');
      await ev(page, () => __app.setView('overview', true)); await shot(page, 'e6-night-overview.png');
      await ev(page, () => __app.setView('terminal', true)); await shot(page, 'e7-night-terminal.png');
    });
  },
  async train(b) {
    await withPage(b, { width: 1100, height: 680 }, async (page) => {
      await ev(page, () => __app.setMode('train')); await shot(page, 't1-setup.png');
      await ev(page, () => { __app.startFlight(); const f = __app.app.flight; while (f.ac.t < 92) f.tick(f.dt); });
      await shot(page, 't2-chase.png');
      await ev(page, () => __app.setTrainCam('cockpit')); await shot(page, 't3-cockpit.png');
      await ev(page, () => { const f = __app.app.flight; while (!f.ev.td && f.ac.t < 200) f.tick(f.dt); for (let i = 0; i < 120; i++) f.tick(f.dt); __app.setTrainCam('side'); });
      await shot(page, 't4-side-td.png');
      await ev(page, () => { const f = __app.app.flight; while (f.finishedAt == null && f.ac.t < 260) f.tick(f.dt); for (let i = 0; i < 240 * 3; i++) f.tick(f.dt); __app.setTrainCam('chase'); });
      await frames(page, 6); await shot(page, 't5-result.png');
      await ev(page, evening); await ev(page, () => { const a = __app; a.startFlight(); const f = a.app.flight; while (f.ac.t < 100) f.tick(f.dt); a.setTrainCam('chase'); });
      await frames(page, 4); await shot(page, 't6-night-chase.png');
      await ev(page, () => __app.setTrainCam('cockpit')); await shot(page, 't7-night-cockpit.png');
    });
  },
  async layout(b) {
    const manual = () => { const a = __app; a.setMode('train'); a.app.train.pilot = 'man'; a.startFlight(); const f = a.app.flight; while (f.ac.t < 40) f.tick(f.dt); };
    await withPage(b, { width: 1366, height: 820 }, async (page) => { await ev(page, manual); await shot(page, 'l1-desktop-manual.png'); });
    await withPage(b, { width: 390, height: 844 }, async (page) => {
      await ev(page, manual); await shot(page, 'l2-phone-manual.png');
      await ev(page, () => { const a = __app; a.setMode('explore'); a.selectSpot('papi', true); });
      await frames(page, 8); await shot(page, 'l3-phone-papi.png');
    });
  },
  async final(b) {
    await withPage(b, { width: 1100, height: 680 }, async (page) => {
      await shot(page, 'f1-overview.png');
      await ev(page, evening); await ev(page, () => __app.setView('approach', true));
      await frames(page, 8); await shot(page, 'f2-night-approach.png');
      await ev(page, () => { __app.setView('terminal', true); }); await frames(page, 3); await shot(page, 'f3-night-terminal.png');
      await ev(page, () => { const a = __app; a.setMode('train'); a.startFlight(); const f = a.app.flight; while (f.ac.t < 100) f.tick(f.dt); a.setTrainCam('chase'); });
      await frames(page, 6); await shot(page, 'f4-night-chase.png');
    });
    await SHOTS.phone(b);
  },
  async phone(b) {
    await withPage(b, { width: 390, height: 844 }, async (page) => {
      await shot(page, 'p1-explore.png', true);
      await ev(page, () => { __app.setMode('train'); }); await shot(page, 'p2-train-setup.png', true);
      await ev(page, () => { __app.app.train.pilot = 'man'; __app.startFlight(); const f = __app.app.flight; while (f.ac.t < 30) f.tick(f.dt); });
      await shot(page, 'p3-train-fly.png');
    });
  },
  async all(b) { await SHOTS.explore(b); await SHOTS.train(b); await SHOTS.phone(b); },
};

const ch = process.env.SHOTS_CHROME;
const browser = await chromium.launch({
  ...(ch === 'chrome' ? { channel: 'chrome' } : ch ? { executablePath: ch } : {}),
  args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--enable-webgl'],
});
const t0 = Date.now();
try { await SHOTS[set](browser); } catch (e) { fail('harness: ' + e.message.split('\n')[0]); }
await browser.close();
logs.push(`set ${set}: ${((Date.now() - t0) / 1000).toFixed(0)} s, images in ${path.relative(ROOT, OUT) || '.'}`);
console.log(logs.join('\n'));
process.exit(failed ? 1 : 0);
