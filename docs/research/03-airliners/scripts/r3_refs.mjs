#!/usr/bin/env node
// Round 3: classify every reference line of the topic files by licence group (adapted from round 1's integ_refs.mjs).
// A reference is a list item "N. **[X12]** ..." or a table row "| [X12] | ..." inside the "## แหล่งอ้างอิง" section.
// usage: node r3_refs.mjs [--dir <folder with NN-*.md>] [--unk] [--json out.json]
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
const DIR = path.resolve(opt('--dir', path.join(HERE, '..')));
const showUnk = args.includes('--unk');

const CODEHOST = /github\.com|gitlab\.com|sourceforge|raw\.githubusercontent|bitbucket|pypi\.org|npmjs/;
const LIC = [['agpl-gpl', /AGPL/], ['lgpl', /LGPL/], ['agpl-gpl', /\bGPL/], ['permissive', /Apache|\bMIT\b|BSD|\bCC0\b|Unlicense|NOSA|\bISC\b|Zlib|MPL/]];
const PRE = [
  ['internal', /^(AirfieldLab|หัวข้อ ?\d|รอบที่ ?\d|สคริปต์|การคำนวณ|ผลค้นหา|ผลการคำนวณ|ผลรัน|ไฟล์ในโครงการ|ไฟล์ภายใน|บัตรรอบที่|repo )/],
  ['icao', /\bICAO\b|Doc 9\d\d\d|PANS|Annex 1[04]/],
  ['easa', /\bEASA\b|European Union Aviation Safety|ETSO|CS-25|CS-AWO|CS-E\b|EU OPS|Regulation \(EU\)/],
  ['thai', /CAAT|AIP Thailand|สำนักงานการบินพลเรือน|กพท|AEROTHAI|วิทยุการบิน|ท่าอากาศยานไทย|\bAOT\b/],
  ['usgov', /14 CFR|eCFR|Federal Register|\bGPO\b|govinfo|\bFAA\b|Federal Aviation|NASA|NACA|NOAA|\bNTSB\b|National Transportation Safety Board|Volpe|U\.?S\.? Gov|รัฐบาลสหรัฐ|DTIC|MIL-[A-Z]/],
  ['investigation', /\bBEA\b|AAIB|ATSB|\bTSB\b|Transportation Safety Board|KNKT|Komite Nasional|National Transportation Safety Committee|\bCIAIAC\b|\bBFU\b|\bJTSB\b|\bARAIB\b|\bAIBN\b|\bSHK\b|Havarikommission|\bDSB\b|Dutch Safety|\bTAIC\b|\bAAIU\b|\bAIB\b|Air Accident|Accident Investigation|Aviation Safety Council|Safety Investigation|Transport Safety|อุบัติเหตุ|สอบสวน/],
  ['gov-other', /Transport Canada|\bCASA\b|Civil Aviation Safety Authority|JCAB|MLIT|\bUK CAA\b|Civil Aviation Authority|\bCAA\b|\bDGAC\b|SRVSOP|EUROCONTROL|Eurocontrol|\bLBA\b|DGCA/],
  ['vendor', /FlightSimLabs|\bBoeing\b|\bAirbus\b|\bATR\b|Avions de Transport|\bCFM\b|Safran|Rolls-Royce|Pratt|P&WC|Hartzell|Ratier|Collins|Goodyear|Michelin|Bridgestone|Dunlop|Honeywell|Thales|Messier|Liebherr|Moog|Parker|GE Aerospace|General Electric|\bIAE\b|Smiths/],
  ['standards', /ASTM|SAE International|\bSAE\b|\bWMO\b|RTCA|ARINC|\bISO\b|\bIEC\b|EUROCAE/],
  ['industry', /Aircraft Commerce|AviTrader|airhistory|Flight Safety Foundation|\bFSF\b|SKYbrary|\bIATA\b|\bICCAIA\b|\bACI\b|Royal Aeronautical|RAeS|\bCAPA\b|Cirium|planespotters|Planespotters|FlightGlobal|Flight International|Aviation Week|Simple Flying|AeroInside|Aviation Herald|avherald|\bAvH\b|airfleets|ch-aviation/],
  ['airline', /Asia Aviation|AAV|Thai AirAsia|AirAsia|Thai Lion|Lion Air|Nok Air|Bangkok Airways|Thai Airways|การบินไทย|annual report|Annual Report|56-1|SET\b/],
  ['wiki', /Wikipedia|Wikimedia|Wikidata/],
  ['community', /flaps2approach|Satcom Guru|arvb|บล็อก|\bblog\b|บันทึกส่วนตัว|Forums|forum|PPRuNe|Airliners\.net|ผู้ใช้|Stack Exchange|Stack Overflow|Reddit|YouTube|กระทู้|ฟอรัม|study guide|Study Guide|smartcockpit|SmartCockpit|b737\.org|Brady|theorycourse|scribd|Scribd|slideshare|studylib|FCOM.*ไม่เป็นทางการ|ไม่เป็นทางการ/],
  ['paper', /OpenCourseWare|AIAA|doi|DOI|Journal|J\. [A-Z]|Acta|Proceedings|Conference|ICAS|ASME|Conf\.|SAROD|thesis|Thesis|วิทยานิพนธ์|University|Universit|Press|ISBN|Elsevier|Springer|Wiley|IEEE|arXiv|NLR|ONERA|DLR|Cranfield|TU Delft|Delft|Jenkinson|Roskam|Torenbeek|Raymer|Etkin|Stevens|McLean|Obert|Patent|patent|สิทธิบัตร|patents\.google|Diplomarbeit|HAW Hamburg|INCAS|Scholz|NAECON|Proc\.|UIUC|Wolfram/],
];
function classify(l) {
  const body = l.replace(/^\s*(?:\d+\.\s*|[-*]\s*)?\*?\*?\[[A-Z]+\d+\]\*?\*?\s*/, '').replace(/^\|\s*\*?\*?\[?[A-Z]\d+\]?\*?\*?\s*\|\s*/, '');
  const k = body.search(/https?:/); const pre = k < 0 ? body : body.slice(0, k);
  if (PRE[0][1].test(body)) return 'internal';
  if (/FlyByWire|flybywiresim/.test(body)) return 'agpl-gpl';
  if (/^(Wikipedia|\*?Wikipedia)/.test(pre)) return 'wiki';
  if (/^(Boeing|Airbus|ATR\b|Avions de Transport|CFM|Safran|Rolls-Royce|Pratt)/.test(pre)) return 'vendor';
  if (CODEHOST.test(body) && !/NASA|NACA|14 CFR|FAA|EASA/.test(pre)) {
    for (const [g, re] of LIC) if (re.test(body)) return g;
    if (/Discussion|issue|Issue/.test(pre)) return 'community';
    return 'code-other';
  }
  for (const [g, re] of PRE.slice(1)) if (re.test(pre)) return g;
  for (const [g, re] of LIC) if (re.test(body)) return g;
  for (const [g, re] of PRE.slice(1)) if (re.test(body)) return g;
  return 'other';
}

const files = fs.readdirSync(DIR).filter(f => /^\d\d-.*\.md$/.test(f)).sort();
const groups = {}; const unk = []; let total = 0; const all = []; const perFile = {};
for (const f of files) {
  const s = fs.readFileSync(path.join(DIR, f), 'utf8');
  const i = s.search(/^## (?:[\d.]+ )?แหล่งอ้างอิง/m);
  if (i < 0) { console.error('no refs heading', f); continue; }
  const seg = s.slice(i); const end = seg.slice(5).search(/^## /m);
  const body = end < 0 ? seg : seg.slice(0, end + 5);
  const seen = new Set();
  for (const l of body.split('\n')) {
    const m = l.match(/^\s*(?:\d+\.\s*|[-*]\s*)?\*?\*?\[([A-Z]+\d+)\]/) || l.match(/^\|\s*\*?\*?\[?([A-Z]\d+)\]?\*?\*?\s*\|/); if (!m) continue;
    if (seen.has(m[1])) continue; seen.add(m[1]);
    total++; perFile[f] = (perFile[f] || 0) + 1;
    const g = classify(l);
    (groups[g] ||= []).push(m[1]);
    all.push({ file: f, id: m[1], group: g, text: l.slice(0, 240) });
    if ((g === 'other' || g === 'code-other') && showUnk) unk.push(`${f} [${g}] ${l.slice(0, 220)}`);
  }
}
console.log('total', total, perFile);
for (const [k, v] of Object.entries(groups).sort((a, b) => b[1].length - a[1].length)) console.log(k.padEnd(13), String(v.length).padStart(4), v.slice(0, 12).join(', '));
if (showUnk) console.log(unk.join('\n'));
const j = args.indexOf('--json'); if (j >= 0) fs.writeFileSync(args[j + 1], JSON.stringify({ total, perFile, groups, all }, null, 1));
