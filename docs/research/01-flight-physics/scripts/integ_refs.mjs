// Classify every reference line of the assembled section files by licence group.
// usage: node refs.mjs <dirOfRepoSectionFiles> [--unk] [--json out.json]
import fs from 'fs';
const dir = process.argv[2];
const showUnk = process.argv.includes('--unk');
const CODEHOST = /github\.com|gitlab\.com|sourceforge|raw\.githubusercontent|bitbucket/;
const LIC = [['gpl', /AGPL/], ['lgpl', /LGPL/], ['gpl', /\bGPL/], ['permissive', /Apache|\bMIT\b|BSD|\bCC0\b|Unlicense|NOSA|\bISC\b|Zlib|MPL/]];
const PRE = [
  ['icao', /ICAO|Doc 9625|PANS/],
  ['easa', /EASA|European Union Aviation Safety|ETSO/],
  ['thai', /CAAT|AIP Thailand|สำนักงานการบินพลเรือน|กพท/],
  ['mil', /MIL-[A-Z]|WL-TR|MIL-HDBK|MIL-STD|DTIC|AFFDL|AFWAL|Air Force|TM 55-|U\.?S\.? Army|Department of the Army/],
  ['usgov', /14 CFR|40 CFR|\bEPA\b|RisingUp|eCFR|Federal Register|\bGPO\b|govinfo|\bFAA\b|NASA|NACA|NOAA|\bNWS\b|NTSB|Volpe|U\.?S\.? Gov|US FAA|รัฐบาลสหรัฐ/],
  ['web', /W3C|WHATWG|MDN|Mozilla|ECMA|Ecma|caniuse|Can I use|Chromium|WebKit|Apple|Google|web\.dev|Chrome Platform|Chrome for Developers|TC39/],
  ['standards', /ASTM|SAE International|\bSAE\b|USB-IF|USB Implementers|\bWMO\b|EUROCONTROL|RTCA|ARINC|\bISO\b|IEC|HID Usage/],
  ['gov-other', /\bBEA\b|AAIB|ATSB|\bTSB\b/],
  ['vendor', /MathWorks|X-Plane|Laminar|Microsoft|Asobo|GeoFS|Pratt|P&WC|Hartzell|Goodyear|Michelin|Honeywell|Collins|Boeing|Airbus|CFM|Textron|Pilatus|Logitech|Thrustmaster|Honeycomb|VKB|Virpil|Saitek|Sony|Nintendo|Valve|Xbox|Lockheed|Rolls-Royce/],
  ['wiki', /Wikipedia|Wikimedia/],
  ['blog', /Gaffer|blog|บล็อก/],
  ['community', /Forums|forum|ผู้ใช้|Stack Overflow|Reddit/],
  ['paper', /OpenCourseWare|AIAA|doi|DOI|Journal|J\. [A-Z]|Acta|Proceedings|Conference|SCA 20|ICAS|ASME|Conf\.|AMS|SAROD|Diplomarbeit|thesis|Thesis|วิทยานิพนธ์|University|Universit|Press|ISBN|Elsevier|Springer|Wiley|IEEE|arXiv|Aircraft Engineering|NLR|ONERA|DLR|Cranfield|TU Delft|Delft/],
];
function classify(l) {
  const body = l.replace(/^\s*(?:\d+\.\s*)?\*?\*?\[[A-Z]+\d+\]\*?\*?\s*/, '');
  if (/^(AirfieldLab|หัวข้อ ?\d|สคริปต์|การคำนวณ|ผลค้นหา|ผลการคำนวณ|ผลรัน)/.test(body)) return 'internal';
  const k = body.search(/https?:/); const pre = k < 0 ? body : body.slice(0, k);
  if (CODEHOST.test(body) && !/NASA|NACA|14 CFR|W3C|w3c\.github|Ecma|TC39/.test(pre)) {
    for (const [g, re] of LIC) if (re.test(body)) return g;
    if (/GitHub Community|Discussion|issue|Issue/.test(pre)) return 'community';
    return 'code-other';
  }
  for (const [g, re] of PRE) if (re.test(pre)) return g;
  for (const [g, re] of LIC) if (re.test(body)) return g;
  return 'other';
}
const files = fs.readdirSync(dir).filter(f => /^\d\d-.*\.md$/.test(f)).sort();
const groups = {}; const unk = []; let total = 0; const all = [];
for (const f of files) {
  const s = fs.readFileSync(dir + '/' + f, 'utf8');
  const i = s.search(/^## [\d.]+ แหล่งอ้างอิง/m);
  if (i < 0) { console.error('no refs heading', f); continue; }
  const seg = s.slice(i); const end = seg.slice(5).search(/^## /m);
  const body = end < 0 ? seg : seg.slice(0, end + 5);
  for (const l of body.split('\n')) {
    const m = l.match(/^\s*(?:\d+\.\s*)?\*?\*?\[([A-Z]+\d+)\]/); if (!m) continue;
    total++;
    const g = classify(l);
    (groups[g] ||= []).push(m[1]);
    all.push({ file: f, id: m[1], group: g, text: l.slice(0, 220) });
    if (g === 'other' && showUnk) unk.push(f + ' ' + l.slice(0, 200));
  }
}
console.log('total', total);
for (const [k, v] of Object.entries(groups)) console.log(k.padEnd(11), String(v.length).padStart(4), v.join(', '));
if (showUnk) console.log(unk.join('\n'));
const j = process.argv.indexOf('--json'); if (j > 0) fs.writeFileSync(process.argv[j + 1], JSON.stringify({ total, groups, all }, null, 1));
