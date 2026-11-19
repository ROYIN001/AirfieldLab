#!/usr/bin/env node
// Round 2 / topic 09 (LO), completeness fix 19 Nov 2026 (gap 4): check the AIP Thailand AD 2 VTBD facts that
// 09-procedures.md uses, in AIRAC 14 MAY 2026 (the edition the repo uses), 9 JUL 2026 and 29 OCT 2026 (in force on
// 19 Nov 2026). Same download method as topic 02's ls_aip_check.mjs [LS20]: the system curl (honours HTTPS_PROXY)
// fetches the whole eAIP page; WebFetch cuts it at ~100,000 characters, before AD 2.20.
//   AD 2.17  ATZ 5 NM / 2000 ft AGL / class C / English, Thai
//   AD 2.18  TWR 118.1, GND 121.9 and 122.5, DEL 127.7, ATIS 126.4 (arrival) and 118.55 (departure), Don Mueang APP 119.4
//   AD 2.20  item 4.1-4.2.3 (03R/21L circuit east, join 45 deg mid-downwind, 1500/1000/800/500 ft, straight-in approval);
//            item numbers of the 21L "vacate right, hold short of 21R" warning and of the take-off/landing clearance rule
//   AD 2.22  4.1.2 IAS 250 kt at or below 10 000 ft; 8.1 VFR day minima (5 km, 1500 ft); 8.2 night VFR = special VFR;
//            8.4.1 special VFR 1500 m;
//            8.5.1 VFR entry/exit daylight only; 8.5.2 light-aircraft routes designed for < 130 kt, number of reporting
//            points in the table, training-area route (out via BANG BUA THONG at 1000 ft; back via LAT LUM KAEO,
//            PATHUMTHANI, 5 NM WEST at 1000 ft); 8.6.2 VFR radio failure note "Traffic Patterns and Altitude: light
//            aircraft 800 ft" and low approach between the runways at 500 ft; 9.2 training-area designator(s)
// Facts and numbers only; no AIP text, landmark names or coordinates are stored. Deleted amendment text (<del>) is
// dropped so the 29 OCT page gives the values in force. Node >= 18, no dependencies; needs network and curl.
// usage: node scripts/lo_aip_check.mjs [2026-05-14 2026-07-09 2026-10-29 ...]
//   -> prints PASS/FAIL, writes out/lo_aip_check.txt and out/lo_aip_check.json (read offline by lo_tests.mjs T-LO-33/34)
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';

const OUT = new URL('./out/', import.meta.url);
const ed = process.argv.slice(2).filter((a) => /^\d{4}-\d{2}-\d{2}$/.test(a));
const EDITIONS = ed.length ? ed : ['2026-05-14', '2026-07-09', '2026-10-29'];
const EXPECT_AREA = { '2026-05-14': 'D72', '2026-07-09': 'D72', '2026-10-29': 'D6A,D6B' };   // topic 02 T-LS-12

function text(html) {
  return html.replace(/<(script|style)[\s\S]*?<\/\1>/gi, ' ').replace(/<del\b[\s\S]*?<\/del>/gi, ' ')
    .replace(/<br\s*\/?>|<\/p>|<\/tr>|<\/div>|<\/li>/gi, '\n').replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;|&#160;/g, ' ').replace(/&amp;/g, '&').replace(/&#8217;/g, "'")
    .replace(/\bT[A-Z_]+;[A-Za-z_.:0-9]+;\d+\b/g, ' ').replace(/[ \t ]+/g, ' ');
}
const flat = (s) => s.replace(/\s+/g, ' ');

const lines = [], facts = { run: new Date().toISOString().slice(0, 10), editions: {} };
let fails = 0;
for (const d of EDITIONS) {
  const url = `https://aip.caat.or.th/${d}-AIRAC/html/eAIP/VT-AD-2.VTBD-en-GB.html`;
  let t;
  try { t = text(execFileSync('curl', ['-sS', '-m', '90', '-f', url], { encoding: 'utf8', maxBuffer: 64 << 20 })); }
  catch (e) { lines.push(`SKIP ${d}: download failed (${String(e.message).split('\n')[0]})`); continue; }
  const sec = (a, b) => { const i = t.indexOf(a), j = t.indexOf(b, i + 1); return i < 0 ? '' : flat(t.slice(i, j < 0 ? undefined : j)); };
  const ad217 = sec('AD 2.17 ATS AIRSPACE', 'AD 2.18'), ad218 = sec('AD 2.18 ATS COMMUNICATION', 'AD 2.19');
  const ad220 = sec('AD 2.20 LOCAL AERODROME REGULATIONS', 'AD 2.21'), ad222 = sec('AD 2.22 FLIGHT PROCEDURES', 'AD 2.23');
  const after = (s, a, n = 120) => { const i = s.indexOf(a); return i < 0 ? '' : s.slice(i, i + n); };
  // AD 2.18 frequencies (MHz): value right after the call sign
  const fq = (cs, re) => re.test(after(ad218, cs, 90));
  const freq = {
    TWR: fq('Don Mueang Tower', /118\.1 MHz/), GND: fq('Don Mueang Ground', /121\.9 MHz[\s\S]*122\.5 MHz/),
    DEL: fq('Don Mueang Delivery', /127\.7 MHz/), ATIS_arr: /126\.4 MHz 3\)/.test(ad218), ATIS_dep: /118\.55 MHz 4\)/.test(ad218),
    APP_DMK: fq('Don Mueang Approach', /119\.4 MHz/),
  };
  // AD 2.20 item numbers that 09 cites
  const vac = ad220.match(/(\d+\.\d+)\s+Aircraft landing RWY 21L\s*,\s*when vacating the RWY to the right on TWY\s+([A-Z0-9]+)\s*,\s*must hold short of RWY 21R/i);
  const clr = ad220.match(/(\d+\.\d+)\s+Take off and Landing:\s*The pilot-in-command shall not take off and landing without a clearance/i);
  const spd = ad222.match(/(\d+\.\d+\.\d+)\s+All departing and arriving aircraft are to apply speed of not more than IAS 250 kt when flying at or below altitude of 10 000 ft/i);
  // AD 2.22 8.5.2 j) reporting-point table: count rows with a radial/DME and a latitude (no names or coordinates kept)
  const tbl = sec('j) Table of reporting points for light aircraft', 'k) VFR ENTRY AND EXIT PROCEDURES FOR LIGHT AIRCRAFT');
  const nRP = (tbl.match(/R-\d{3}\s*\/\s*\d+(?:\.\d+)?D\s+\d{1,2}°\s*\d{1,2}'\s*\d{1,2}(?:\.\d+)?''\s*N/g) || []).length;
  const item92 = sec('9. TRAINING IN DANGER AREA', '10. Fuel Dumping'); const light92 = item92.slice(Math.max(0, item92.indexOf('9.2')));
  const areas = [...new Set((light92.split('Light Aircraft')[0].match(/\b(?:VT\s?)?D\s?\d+[A-Z]?\b/g) || []).map((s) => s.replace(/^VT/, '').replace(/\s/g, '')))].sort().join(',');
  const trainOut = /TRAINING VT D\S+(?: \/ VT D\S+)? MUEANG THONG \[ALT1000\] - KOH KRET \[ALT1000\] - BANG BUA THONG \[ALT1000\] - VT D/i.test(ad222);
  const trainBack = /LAT LUM KAEO \[ALT1000\] - PATHUMTHANI \[ALT1000\] - 5 NM WEST \[ALT1000\] - 3 NM WEST \[ALT1000\]/i.test(ad222);
  const checks = [
    ['AD 2.17 ATZ radius 5 NM', /radius 5\s*NM/i.test(ad217)],
    ['AD 2.17 ATZ upper limit 2000 ft AGL', /2000\s*ft\s*\/\s*AGL/i.test(ad217)],
    ['AD 2.17 class C', /classification\s+C\b/i.test(ad217)],
    ['AD 2.17 languages English, Thai', /English\s*,\s*Thai/i.test(ad217)],
    ['AD 2.18 TWR 118.1 MHz', freq.TWR], ['AD 2.18 GND 121.9 and 122.5 MHz', freq.GND], ['AD 2.18 DEL 127.7 MHz', freq.DEL],
    ['AD 2.18 ATIS arrival 126.4 MHz', freq.ATIS_arr], ['AD 2.18 ATIS departure 118.55 MHz', freq.ATIS_dep], ['AD 2.18 Don Mueang Approach 119.4 MHz', freq.APP_DMK],
    ['AD 2.20 4.1 03R/21L normally military, may be civil, H24, Don Mueang Tower', /4\.1 The use of Runway 03R\/21L/i.test(ad220) && /normally restricted to military traffic/i.test(ad220) && /made available to civil traffic/i.test(ad220) && /24 hours daily, all traffic is controlled by Don Mueang Tower/i.test(ad220)],
    ['AD 2.20 4.2.1 outbound: turn east, leave at 45 deg to crosswind', /4\.2\.1 Outbound - after take-off, turn to east and leave circuit pattern at an angle of 45 º? ?to the cross-wind leg/i.test(ad220)],
    ['AD 2.20 4.2.2 join 45 deg mid-downwind east of RWY', /4\.2\.2 Inbound - join circuit pattern at 45\s*º?\s*in the middle of the down\s*-\s*wind leg east of the runway/i.test(ad220)],
    ['AD 2.20 4.2.2 heights 1500 jet / 1000 conventional / 800 light / 500 helicopter', /1 ?500 ft for jet aircraft,? 1 ?000 ft for conventional aircraft,? 800 ft for light aircraft,? 500 ft for helicopter/i.test(ad220)],
    ['AD 2.20 4.2.3 no straight-in without Tower approval', /4\.2\.3 No straight in approaches are permitted without prior approval from Don Mueang Tower/i.test(ad220)],
    [`AD 2.20 21L vacate right, hold short of 21R (item ${vac?.[1] ?? '?'}, TWY ${vac?.[2] ?? '?'})`, !!vac],
    [`AD 2.20 take-off/landing need Tower clearance (item ${clr?.[1] ?? '?'})`, !!clr],
    [`AD 2.22 IAS 250 kt at or below 10 000 ft (item ${spd?.[1] ?? '?'})`, !!spd],
    ['AD 2.22 8.1 VFR by day: ground visibility 5 km, ceiling 1500 ft', /8\.1 By Day[\s\S]{0,400}Ground Visibility 5 km; or Ceiling 450 m \(1500 ft\)/i.test(ad222)],
    ['AD 2.22 8.2 VFR by night at VTBD: ATC may authorize, treated as special VFR', /8\.2 By Night \(Sunset\/Sunrise\) Authorization may be granted by ATC for VFR flight[\s\S]{0,200}treated as special VFR flight/i.test(ad222)],
    ['AD 2.22 8.4.1 special VFR ground visibility 1500 m', /8\.4\.1 Special VFR flight may be permitted when the ground visibility is not less than 1500 m/i.test(ad222)],
    ['AD 2.22 8.5.1 VFR entry/exit daylight only', /only in daylight hours between sunrise to sunset/i.test(ad222)],
    ['AD 2.22 8.5.2 light-aircraft routes designed for < 130 kt', /8\.5\.2 VFR entry and exit procedures for light aircraft/i.test(ad222) && /speed less than 130 knots/i.test(ad222)],
    [`AD 2.22 8.5.2 j) reporting-point table found (${nRP} points)`, nRP >= 20],
    ['AD 2.22 8.5.2 training route out: ... BANG BUA THONG 1000 ft -> area', trainOut],
    ['AD 2.22 8.5.2 training route back: LAT LUM KAEO - PATHUMTHANI - 5 NM WEST - 3 NM WEST, 1000 ft', trainBack],
    ['AD 2.22 8.6.2 note: traffic pattern light aircraft 800 ft (jet 1500, conventional 1000, helicopter 500)', /Traffic Patterns and Altitude: Jet Aircraft 1500 ft Conventional Aircraft 1000 ft Light Aircraft 800 ft Helicopter 500 ft/i.test(ad222)],
    ['AD 2.22 8.6.2 VFR radio failure: low approach between the runways at 500 ft', /low approach between the runways at an altitude of 500 ft/i.test(ad222)],
    [`AD 2.22 9.2 light-aircraft training area = ${EXPECT_AREA[d] || '?'} (found ${areas || '-'})`, /Light Aircraft depart/i.test(light92) && (!EXPECT_AREA[d] || areas === EXPECT_AREA[d])],
  ];
  for (const [what, ok] of checks) { lines.push(`${ok ? 'PASS' : 'FAIL'} ${d} ${what}`); if (!ok) fails++; }
  facts.editions[d] = {
    url, pass: checks.filter((c) => c[1]).length, of: checks.length,
    freq_MHz: { TWR: freq.TWR ? 118.1 : null, GND: freq.GND ? [121.9, 122.5] : null, DEL: freq.DEL ? 127.7 : null, ATIS_arr: freq.ATIS_arr ? 126.4 : null, ATIS_dep: freq.ATIS_dep ? 118.55 : null, APP_DMK: freq.APP_DMK ? 119.4 : null },
    ad220_items: { vacate21L_holdShort21R: vac ? { item: vac[1], twy: vac[2] } : null, clearanceTOLDG: clr?.[1] ?? null },
    ad222_items: { speed250: spd?.[1] ?? null, reportingPoints: nRP, trainingArea: areas || null, trainOut, trainBack },
  };
}
lines.push(`${fails ? 'FAIL' : 'OK'}: ${fails} failed check(s); run ${facts.run}`);
facts.fails = fails;
fs.mkdirSync(OUT, { recursive: true });
fs.writeFileSync(new URL('lo_aip_check.txt', OUT), lines.join('\n') + '\n');
fs.writeFileSync(new URL('lo_aip_check.json', OUT), JSON.stringify(facts, null, 1) + '\n');
console.log(lines.join('\n'));
process.exitCode = fails ? 1 : 0;
