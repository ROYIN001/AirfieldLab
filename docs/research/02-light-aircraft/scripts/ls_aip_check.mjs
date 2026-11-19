#!/usr/bin/env node
// Round 2 / topic 02 (LS), added by the reviewer on 19 Nov 2026: test T-LS-10 and T-LS-12.
// Downloads the eAIP page "AD 2 VTBD" of the given AIRAC editions from aip.caat.or.th with curl (the system curl
// honours HTTPS_PROXY; WebFetch cuts this page at ~100,000 characters, before AD 2.20), strips the HTML and checks the
// light-aircraft facts that 02-thai-schools.md §02.4.2 relies on [LS20]:
//   AD 2.17  ATZ radius 5 NM, upper limit 2000 ft AGL
//   AD 2.20  item 2 general aviation parking; item 4.1 RWY 03R/21L normally military, may be civil;
//            item 4.2.2 join at 45 deg mid-downwind east of the runway, "800 ft for light aircraft"
//   AD 2.22  item 8.5.2 VFR entry/exit procedures for light aircraft, designed for < 130 kt;
//            item 9.2 light aircraft departing VTBD to a training danger area (designator changes with AIRAC)
// Facts only; the AIP text itself is not stored. Node >= 18, no dependencies; needs network and curl.
// usage: node scripts/ls_aip_check.mjs [2026-05-14 2026-07-09 2026-10-29 ...]   -> prints PASS/FAIL, writes out/ls_aip_check.txt
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';

const HERE = new URL('.', import.meta.url);
const ed = process.argv.slice(2).filter(a => /^\d{4}-\d{2}-\d{2}$/.test(a));
const EDITIONS = ed.length ? ed : ['2026-05-14', '2026-07-09', '2026-10-29'];
// expected training-area designators in AD 2.22 item 9.2 (read by the reviewer on 19 Nov 2026)
const EXPECT_AREA = { '2026-05-14': 'D72', '2026-07-09': 'D72', '2026-10-29': 'D6A,D6B' };

function text(html) {
  return html.replace(/<(script|style)[\s\S]*?<\/\1>/gi, ' ').replace(/<br\s*\/?>|<\/p>|<\/tr>|<\/div>|<\/li>/gi, '\n')
    .replace(/<[^>]+>/g, ' ').replace(/&nbsp;|&#160;/g, ' ').replace(/&amp;/g, '&').replace(/&#8217;/g, "'")
    .replace(/\bT[A-Z_]+;[A-Za-z_.:0-9]+;\d+\b/g, ' ')          // eAIP data-binding tokens, e.g. TAD_HP;TXT_NAME;229
    .replace(/[ \t ]+/g, ' ');
}

const lines = [];
let fails = 0;
for (const d of EDITIONS) {
  const url = `https://aip.caat.or.th/${d}-AIRAC/html/eAIP/VT-AD-2.VTBD-en-GB.html`;
  let t;
  try { t = text(execFileSync('curl', ['-sS', '-m', '60', '-f', url], { encoding: 'utf8', maxBuffer: 64 << 20 })); }
  catch (e) { lines.push(`SKIP ${d}: download failed (${String(e.message).split('\n')[0]})`); continue; }
  const sec = (a, b) => { const i = t.indexOf(a), j = t.indexOf(b, i + 1); return i < 0 ? '' : t.slice(i, j < 0 ? undefined : j); };
  const ad220 = sec('AD 2.20 LOCAL AERODROME REGULATIONS', 'AD 2.21');
  const ad217 = sec('AD 2.17 ATS AIRSPACE', 'AD 2.18');
  const item92 = sec('9. TRAINING IN DANGER AREA', '10. Fuel Dumping');
  const light92 = item92.slice(Math.max(0, item92.indexOf('9.2')));
  const areas = [...new Set((light92.split('Light Aircraft')[0].match(/\b(?:VT\s?)?D\s?\d+[A-Z]?\b/g) || [])
    .map(s => s.replace(/^VT/, '').replace(/\s/g, '')))].sort().join(',');
  const checks = [
    ['AD 2.17 ATZ radius 5 NM', /radius 5\s*NM/i.test(ad217)],
    ['AD 2.17 ATZ upper limit 2000 ft AGL', /2000\s*ft\s*\/\s*AGL/i.test(ad217)],
    ['AD 2.20 item 2 GA parking', /parking area for general aviation aircraft is also available/i.test(ad220)],
    ['AD 2.20 item 4.1 03R/21L normally military, may be civil', /normally restricted to military traffic/i.test(ad220) && /made available to civil traffic/i.test(ad220)],
    ['AD 2.20 item 4.2.2 join 45 deg mid-downwind east of RWY', /join circuit pattern at 45\s*º?\s*in the middle of the down\s*-\s*wind leg east of the runway/i.test(ad220)],
    ['AD 2.20 item 4.2.2 "800 ft for light aircraft"', /800\s*ft for light aircraft/i.test(ad220)],
    ['AD 2.20 contains no "training"/"touch-and-go"', !/training|touch[- ]and[- ]go/i.test(ad220)],
    ['AD 2.22 8.5.2 VFR entry/exit for light aircraft', /8\.5\.2 VFR entry and exit procedures for light aircraft/i.test(t)],
    ['AD 2.22 8.5.2 designed for speed < 130 kt', /speed less than 130 knots/i.test(t)],
    ['AD 2.22 8.5.1 daylight only', /only in daylight hours between sunrise to sunset/i.test(t)],
    [`AD 2.22 9.2 light-aircraft training area = ${EXPECT_AREA[d] || '?'}`, /Light Aircraft depart/i.test(light92) && (!EXPECT_AREA[d] || areas === EXPECT_AREA[d])],
  ];
  for (const [what, ok] of checks) { lines.push(`${ok ? 'PASS' : 'FAIL'} ${d} ${what}`); if (!ok) fails++; }
  lines.push(`info ${d}: page text ${t.length} chars, AD 2.20 ${ad220.length} chars, training area(s) in 9.2: ${areas || '-'}`);
}
lines.push(`${fails ? 'FAIL' : 'OK'}: ${fails} failed check(s); run ${new Date().toISOString().slice(0, 10)}`);
console.log(lines.join('\n'));
fs.writeFileSync(new URL('./out/ls_aip_check.txt', HERE), lines.join('\n') + '\n');
process.exitCode = fails ? 1 : 0;
