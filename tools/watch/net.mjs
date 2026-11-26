// Downloads for the watch (plan item A10). The system curl does the HTTP (it honours HTTPS_PROXY; Node's fetch may
// not), as in docs/research/02-light-aircraft/scripts/ls_aip_check.mjs. Pages are cached as
// <out>/aip/<YYYY-MM-DD>/<file basename> (the date of the folder the page lives in: the edition's effective date, or
// the folder of a SUP or AIC); --from <dir> reads the same layout (and <dir>/index.html) and never touches the network.
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

// GET a URL with curl; returns the body (UTF-8, BOM removed). Throws on a transport error, an HTTP status other than
// 200 or a Cloudflare challenge page (www.caat.or.th answers 403 with "cf-mitigated: challenge"; aip.caat.or.th pages
// carry only the harmless beacon script, which the parsers strip).
export function curlGet(url, { timeoutS = 90 } = {}) {
  if (process.env.WATCH_OFFLINE === '1') throw new Error(`offline (WATCH_OFFLINE=1): ${url}`);
  let out;
  try {
    out = execFileSync('curl', ['-sS', '-L', '--compressed', '-m', String(timeoutS), '-w', '\n%{http_code}', url],
      { encoding: 'utf8', maxBuffer: 128 << 20, stdio: ['ignore', 'pipe', 'pipe'] });
  } catch (e) {
    throw new Error(`curl ${url}: ${String(e.stderr || e.message).trim().split('\n')[0]}`);
  }
  const i = out.lastIndexOf('\n'), code = +out.slice(i + 1), body = out.slice(0, i).replace(/^﻿/, '');
  if (code !== 200) throw new Error(`HTTP ${code || '?'} for ${url}`);
  if (/<title>\s*Just a moment/i.test(body)) throw new Error(`Cloudflare challenge page for ${url}`);
  return body;
}

// A page source: from a directory (offline) or from the network through the cache.
//   index()            the eAIP index (always downloaded again unless --from: it changes with every package)
//   page(date, url, o) one page, cached by date and basename. A cached copy is used unless refresh, unless it is older
//                      than o.maxAgeH hours, unless it was saved before o.notBefore (YYYY-MM-DD, 00:00 UTC: an
//                      edition's effective date, once that has come, so a copy fetched while the edition was a next
//                      issue is fetched once more when it takes effect), and unless o.check(body) fails. A page that
//                      fails o.check (true, or why not) is never saved, and a cached copy that fails it is removed.
//   now                the clock (ms), for tests
export function makeSource({ from = null, cacheDir, refresh = false, get = curlGet, log = () => {}, now = () => Date.now() }) {
  const file = (date, url) => path.join(from ?? cacheDir, date, String(url).split(/[?#]/)[0].split('/').pop());
  const read = (f) => fs.readFileSync(f, 'utf8').replace(/^﻿/, '');
  const save = (f, body) => { fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, body); };
  const why = (check, body) => { if (!check) return true; const r = check(body); return r === true ? true : String(r || 'page check failed'); };
  const used = [];
  return {
    used,
    index(url) {
      if (from) { const f = path.join(from, 'index.html'); used.push({ url, file: f, how: 'from' }); return read(f); }
      const body = get(url); save(path.join(cacheDir, 'index.html'), body); used.push({ url, how: 'net' }); return body;
    },
    page(date, url, { maxAgeH = Infinity, notBefore = null, check = null } = {}) {
      const f = file(date, url);
      if (from) {
        used.push({ url, file: f, how: 'from' });
        const body = read(f), w = why(check, body);
        if (w !== true) throw new Error(`${w}: ${f}`);
        return body;
      }
      const st = fs.statSync(f, { throwIfNoEntry: false }), t = now();
      const nb = notBefore ? Date.parse(notBefore + 'T00:00:00Z') : NaN;
      const stale = !st || refresh || (t - st.mtimeMs) / 36e5 >= maxAgeH || (nb <= t && st.mtimeMs < nb);
      if (!stale) {
        const body = read(f), w = why(check, body);
        if (w === true) { used.push({ url, file: f, how: 'cache' }); return body; }
        log(`แคชเสีย (${w}) ลบแล้วดาวน์โหลดใหม่: ${f}`);
        fs.rmSync(f, { force: true });
      }
      log(`ดาวน์โหลด ${url}`);
      const body = get(url), w = why(check, body);
      if (w !== true) { used.push({ url, how: 'net, rejected' }); throw new Error(`${w} (ไม่เก็บในแคช): ${url}`); }
      save(f, body); used.push({ url, file: f, how: 'net' });
      return body;
    },
  };
}
