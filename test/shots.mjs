// usage: node test/shots.mjs <set> ; renders dist/index.html in headless Chromium (SwiftShader WebGL2)
// Paths come from the environment (defaults are the original workspace):
//   THREE_DIR  unpacked three@0.186.0 package (npm pack three@0.186.0) — the CDN is mapped to it
//   DIST_DIR   built site (node build.mjs → dist/)     SHOTS_DIR  where PNGs go
//   PW_REQUIRE folder whose node_modules has playwright  CHROME  browser binary (empty = Playwright's own)
import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';
const env = process.env;
const require = createRequire(env.PW_REQUIRE || '/opt/npm-tools/node_modules/');
const { chromium } = require('playwright');
const set = process.argv[2] || 'explore';
const V = env.THREE_DIR || '/home/claude/vendor/three-r186';
const DIST = env.DIST_DIR || '/home/claude/airfield/dist';
const SHOTS = env.SHOTS_DIR || '/home/claude/airfield/shots';
fs.mkdirSync(SHOTS, { recursive: true });
const MAP = {
  'https://cdn.jsdelivr.net/npm/three@0.186.0/build/three.module.js': `${V}/build/three.module.js`,
  'https://cdn.jsdelivr.net/npm/three@0.186.0/build/three.core.js': `${V}/build/three.core.js`,
  'https://cdn.jsdelivr.net/npm/three@0.186.0/examples/jsm/controls/OrbitControls.js': `${V}/examples/jsm/controls/OrbitControls.js`,
  'https://cdn.jsdelivr.net/npm/three@0.186.0/examples/jsm/utils/BufferGeometryUtils.js': `${V}/examples/jsm/utils/BufferGeometryUtils.js`,
};
const out = (n) => path.join(SHOTS, n);
const logs = [];
async function open(browser, vp, quality = 'balanced') {
  const ctx = await browser.newContext({ viewport: vp, deviceScaleFactor: 1, hasTouch: vp.width < 700, isMobile: false });
  await ctx.addInitScript((q) => { try { localStorage.setItem('afl-quality', q); } catch (e) {} }, quality);
  await ctx.route('**/*', (route) => {
    const u = route.request().url();
    if (MAP[u]) return route.fulfill({ status: 200, contentType: 'text/javascript', body: fs.readFileSync(MAP[u]) });
    if (u.startsWith('http://vtbd.test/')) {
      const f = path.join(DIST, decodeURIComponent(u.slice(17).split('?')[0] || 'index.html'));
      const ct = f.endsWith('.html') ? 'text/html' : f.endsWith('.json') ? 'application/json' : f.endsWith('.png') ? 'image/png' : 'application/octet-stream';
      return fs.existsSync(f) ? route.fulfill({ status: 200, contentType: ct, body: fs.readFileSync(f) }) : route.fulfill({ status: 404, body: '' });
    }
    if (u.includes('fonts.googleapis.com')) return route.fulfill({ status: 200, contentType: 'text/css', body: '' });
    logs.push('BLOCKED ' + u); return route.abort();
  });
  const page = await ctx.newPage();
  page.on('console', (m) => { if (['error', 'warning'].includes(m.type())) logs.push(`[${m.type()}] ${m.text().slice(0, 400)}`); });
  page.on('pageerror', (e) => logs.push('[pageerror] ' + e.message));
  const t0 = Date.now();
  await page.goto('http://vtbd.test/index.html');
  await page.waitForFunction(() => document.querySelector('#loading')?.classList.contains('done') || document.querySelector('#loadMsg')?.classList.contains('err'), null, { timeout: 240000 });
  logs.push(`loaded in ${((Date.now() - t0) / 1000).toFixed(1)} s`);
  return { ctx, page };
}
const frames = (page, n = 2) => page.evaluate((n) => new Promise((r) => { let k = 0; const f = () => (++k >= n ? r() : requestAnimationFrame(f)); requestAnimationFrame(f); }), n);
async function shot(page, name, full = false) { await frames(page, 3); await page.screenshot({ path: out(name), fullPage: full, timeout: 180000 }); logs.push('shot ' + name); }
const ev = (page, fn, arg) => page.evaluate(fn, arg);

const browser = await chromium.launch({ ...(env.CHROME === '' ? {} : { executablePath: env.CHROME || '/usr/bin/google-chrome' }), args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--enable-webgl'] });
try {
  if (set === 'vtbd') {
    const { page } = await open(browser, { width: 1100, height: 680 });
    const info = await ev(page, () => ({ n: __app.renderer.info.render.triangles, calls: __app.renderer.info.render.calls }));
    logs.push('render info ' + JSON.stringify(info));
    for (const v of (process.argv[3] || 'overview,terminal,runway,golf,rail').split(',')) { await ev(page, (v) => __app.setView(v, true), v); await shot(page, 'v-' + v + '.png'); }
  }
  if (set === 'explore' || set === 'all') {
    const { page } = await open(browser, { width: 1366, height: 820 });
    await shot(page, 'e1-overview.png');
    await ev(page, () => __app.setView('runway', true)); await shot(page, 'e2-runway.png');
    await ev(page, () => { __app.setView('apron', true); }); await shot(page, 'e3-apron.png');
    await ev(page, () => { __app.setView('papi', true); __app.selectSpot('papi'); }); await shot(page, 'e4-papi.png');
    await ev(page, () => { const a = __app; const lp = a.localParts(a.app.date); a.app.date = a.makeDate(lp.y, lp.m, lp.d, 19 * 60 + 40); a.applyTime(); a.selectSpot(null); a.setView('approach', true); });
    await frames(page, 4); await shot(page, 'e5-night-approach.png');
    await ev(page, () => __app.setView('overview', true)); await shot(page, 'e6-night-overview.png');
    await ev(page, () => __app.setView('terminal', true)); await shot(page, 'e7-night-terminal.png');
  }
  if (set === 'train' || set === 'all') {
    const { page } = await open(browser, { width: 1100, height: 680 });
    await ev(page, () => __app.setMode('train')); await shot(page, 't1-setup.png');
    await ev(page, () => { __app.startFlight(); const f = __app.app.flight; while (f.ac.t < 92 && !f.crashed) f.tick(f.dt); });
    await shot(page, 't2-chase.png');
    await ev(page, () => __app.setTrainCam('cockpit')); await shot(page, 't3-cockpit.png');
    await ev(page, () => { const f = __app.app.flight; while (!f.ev.td && f.ac.t < 200 && !f.crashed) f.tick(f.dt); for (let i = 0; i < 120; i++) f.tick(f.dt); __app.setTrainCam('side'); });
    await shot(page, 't4-side-td.png');
    await ev(page, () => { const f = __app.app.flight; while (f.finishedAt == null && f.ac.t < 260 && !f.crashed) f.tick(f.dt); for (let i = 0; i < 240 * 3; i++) f.tick(f.dt); __app.setTrainCam('chase'); });
    await frames(page, 6); await shot(page, 't5-result.png');
    await ev(page, () => { const a = __app; const lp = a.localParts(a.app.date); a.app.date = a.makeDate(lp.y, lp.m, lp.d, 19 * 60 + 40); a.applyTime(); a.startFlight(); const f = a.app.flight; while (f.ac.t < 100 && !f.crashed) f.tick(f.dt); a.setTrainCam('chase'); });
    await frames(page, 4); await shot(page, 't6-night-chase.png');
    await ev(page, () => __app.setTrainCam('cockpit')); await shot(page, 't7-night-cockpit.png');
  }
  if (set === 'layout') {
    const { page } = await open(browser, { width: 1366, height: 820 });
    await ev(page, () => { const a = __app; a.setMode('train'); a.app.train.pilot = 'man'; a.startFlight(); const f = a.app.flight; while (f.ac.t < 40 && !f.crashed) f.tick(f.dt); });
    await shot(page, 'l1-desktop-manual.png');
    await page.context().close();
    const { page: p2 } = await open(browser, { width: 390, height: 844 });
    await ev(p2, () => { const a = __app; a.setMode('train'); a.app.train.pilot = 'man'; a.startFlight(); const f = a.app.flight; while (f.ac.t < 40 && !f.crashed) f.tick(f.dt); });
    await shot(p2, 'l2-phone-manual.png');
    await ev(p2, () => { const a = __app; a.setMode('explore'); a.selectSpot('papi', true); });
    await frames(p2, 8); await shot(p2, 'l3-phone-papi.png');
  }
  if (set === 'final') {
    const { page } = await open(browser, { width: 1100, height: 680 });
    await shot(page, 'f1-overview.png');
    await ev(page, () => { const a = __app; const lp = a.localParts(a.app.date); a.app.date = a.makeDate(lp.y, lp.m, lp.d, 19 * 60 + 40); a.applyTime(); a.setView('approach', true); });
    await frames(page, 8); await shot(page, 'f2-night-approach.png');
    await ev(page, () => { __app.setView('terminal', true); }); await frames(page, 3); await shot(page, 'f3-night-terminal.png');
    await ev(page, () => { const a = __app; a.setMode('train'); a.startFlight(); const f = a.app.flight; while (f.ac.t < 100 && !f.crashed) f.tick(f.dt); a.setTrainCam('chase'); });
    await frames(page, 6); await shot(page, 'f4-night-chase.png');
    await page.context().close();
  }
  if (set === 'phone' || set === 'all' || set === 'final') {
    const { page } = await open(browser, { width: 390, height: 844 });
    await shot(page, 'p1-explore.png', true);
    await ev(page, () => { __app.setMode('train'); }); await shot(page, 'p2-train-setup.png', true);
    await ev(page, () => { __app.app.train.pilot = 'man'; __app.startFlight(); const f = __app.app.flight; while (f.ac.t < 30 && !f.crashed) f.tick(f.dt); });
    await shot(page, 'p3-train-fly.png');
  }
} catch (e) { logs.push('HARNESS ERROR ' + e.message); }
await browser.close();
console.log(logs.join('\n'));
