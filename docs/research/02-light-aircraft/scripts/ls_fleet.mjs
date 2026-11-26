#!/usr/bin/env node
// Round 2 / topic 02 (LS): Thai flight-school fleet from the CAAT aircraft register.
// Reads out/ls_register_2026-07-09.json (rows transcribed from [LS1]), maps each registered model string to a
// card type id (older models such as 172M or C150H keep the card id plus a `variants` note, gap 21 of 19 Nov 2026),
// counts by operator, family and variant, ranks extra types for data cards, and writes
//   out/ls_fleet_summary.json   (numbers quoted in 02-thai-schools.md and the expected values of T-LS-xx)
//   out/ls_thai_fleet_block.json (the common_light.thai_fleet JSON block of 02-thai-schools.md §02.6)
// Node >= 18, no dependencies. Run from anywhere: node scripts/ls_fleet.mjs [--check]
// --register <file>, --out <dir>: see below. --check compares the block embedded in ../02-thai-schools.md with the generated one and exits 1 on mismatch.
// --register <file> (added for tools/watch): read another register rows file (same format) instead of the committed
// 2026-07-09 one; AS_OF comes from its name (ls_register_<date>.json) or from the "as at" date in _meta.source.
// --out <dir> (or $LM_OUT_DIR) is where the two json files are written; --register without either writes to
// <tmp>/ls_fleet-out, never into scripts/out/; with none of these options the script writes scripts/out/ exactly as before.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = new URL('.', import.meta.url);
const optVal = n => { const i = process.argv.indexOf(n); return i >= 0 ? process.argv[i + 1] : null; };
const REG_PATH = optVal('--register') ? path.resolve(optVal('--register')) : fileURLToPath(new URL('./out/ls_register_2026-07-09.json', HERE));
const REG = JSON.parse(fs.readFileSync(REG_PATH, 'utf8'));
const OUT_DIR = path.resolve(optVal('--out') || process.env.LM_OUT_DIR || (optVal('--register') ? path.join(os.tmpdir(), 'ls_fleet-out') : fileURLToPath(new URL('./out/', HERE))));
const MONTHS = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
const AS_OF = (() => {
  if (!optVal('--register')) return '2026-07-09';
  const f = path.basename(REG_PATH).match(/(\d{4}-\d{2}-\d{2})/);
  if (f) return f[1];
  const m = String(REG._meta?.source || '').match(/as at (\d{1,2})(?:st|nd|rd|th)? ([A-Za-z]+) (\d{4})/i);
  const mi = m ? MONTHS.indexOf(m[2].toLowerCase()) : -1;
  if (mi < 0) throw new Error('--register: no date in the file name (ls_register_YYYY-MM-DD.json) or in _meta.source');
  return `${m[3]}-${String(mi + 1).padStart(2, '0')}-${m[1].padStart(2, '0')}`;
})();

// ---- model string (as printed in the register) -> type id, family, engines, notes -------------------------
// Variant decoding follows the EASA TCDS serial conventions [LS17][LS18] and the CATC slide [LS3].
function classify(model, serial) {
  const m = model.trim();
  if (m === '172S') return { id: 'c172s', fam: 'C172', eng: 1 };
  if (m === '172R') return { id: 'c172r', fam: 'C172', eng: 1 };
  // gap 21 (19 Nov 2026): every register model maps to a card id; older models carry a variant note instead of their own id
  if (/^172[MNP]$/.test(m)) return { id: 'c172r', variant: m, fam: 'C172', eng: 1 };           // 10-c172r.md §10.10
  if (m === '152') return { id: 'c152', fam: 'C150/152', eng: 1 };
  if (/^150/.test(m)) return { id: 'c152', variant: 'C' + m, fam: 'C150/152', eng: 1 };          // 11-c152.md §11.10
  if (m === 'DA 40 D') return { id: 'da40d', fam: 'DA40', eng: 1 };                    // TAE 125 (TDI)
  if (m === 'DA 40') return { id: 'da40_180', fam: 'DA40', eng: 1 };                  // IO-360-M1A, CS prop
  if (m === 'DA 40 NG') return { id: 'da40ng', fam: 'DA40', eng: 1 };
  if (m === 'DA 42') return { id: 'da42_tae125', fam: 'DA42', eng: 2 };               // TAE 125 (TDI)
  if (m === 'DA 42 NG') return { id: 'da42ng', fam: 'DA42', eng: 2, wuhu: /^42\.NW/.test(serial) };
  if (m === '76') return { id: 'be76', fam: 'other', eng: 2 };
  if (m === 'P2002-JF') return { id: 'p2002jf', fam: 'other', eng: 1 };
  if (m === 'P2006T') return { id: 'p2006t', fam: 'other', eng: 2 };
  if (m === 'P.68C') return { id: 'p68c', fam: 'other', eng: 2 };
  if (m === 'T206H') return { id: 't206h', fam: 'other', eng: 1 };
  if (/^PA-28-161/.test(m)) return { id: 'pa28_161', fam: 'other', eng: 1 };
  if (/^PA-28-151/.test(m)) return { id: 'pa28_161', variant: 'PA-28-151', fam: 'other', eng: 1 };  // 13-other-trainers.md
  return { id: 'unknown:' + m, fam: 'other', eng: 1 };
}

// ---- operators: register name -> school record (base airfield from the sources named in `bsrc`) -------------
// best: true = the base airfield is inferred (FNPT location, company address), i.e. ค่าประมาณ -> leaf est: true
const OPS = {
  'CIVIL AVIATION TRAINING CENTER': { key: 'catc', name: 'สถาบันการบินพลเรือน (CATC / CATI)', kind: 'ato_state', base_icao: 'VTPH', base: 'หัวหิน', bconf: 'สูง', bsrc: ['LS3', 'LS2'] },
  'BANGKOK AVIATION CENTER PUBLIC COMPANY LIMITED': { key: 'bac', name: 'Bangkok Aviation Center (BAC)', kind: 'ato_private', base_icao: 'VTUQ', base: 'นครราชสีมา (สำนักงาน/วิทยาเขตคลอง 15 นครนายก)', bconf: 'กลาง', bsrc: ['LS2', 'LS9', 'LS10'], best: true },
  'BANGKOKAIR AVIATION TRAINING CENTER CO.,LTD.': { key: 'batc', name: 'Bangkok Air Aviation Training Center (BATC)', kind: 'ato_airline', base_icao: 'VTPO', base: 'สุโขทัย', bconf: 'กลาง', bsrc: ['LS2'], best: true },
  'ASIA AVIATION AND TECHNOLOGY COMPANY LIMITED': { key: 'aat', name: 'Asia Aviation and Technology (AAT)', kind: 'ato_private', base_icao: 'VTSE', base: 'ชุมพร (อนุมานจากที่ตั้ง FNPT)', bconf: 'ต่ำ', bsrc: ['LS2'], best: true },
  'THAI INTER FLYING CO.,LTD': { key: 'tif', name: 'Thai Inter Flying (TIF)', kind: 'ato_private', base_icao: 'VTPP', base: 'พิษณุโลก', bconf: 'กลาง', bsrc: ['LS12'] },
  'D-0507 FLIGHT TRAINING COMPANY LIMITED': { key: 'd0507', name: 'D-0507 Flight Training', kind: 'ato_private', base_icao: null, base: 'ไม่ทราบ (ที่อยู่บริษัท นครปฐม)', bconf: 'ต่ำ', bsrc: ['LS4'] },
  'PREMIUM AIRLINES CO., LTD.': { key: 'premium', name: 'Premium Airlines (PRE)', kind: 'ato_private', base_icao: null, base: 'ไม่ทราบ (ที่อยู่บริษัท ดอนเมือง)', bconf: 'ต่ำ', bsrc: ['LS4'] },
  'THAI AVIATION COMPANY LIMITED': { key: 'taa', name: 'Thai Aviation Co. (Thai Aviation Academy)', kind: 'ato_private', base_icao: 'VTUV', base: 'ร้อยเอ็ด', bconf: 'สูง', bsrc: ['LS5', 'LS13'] },
  'NAKHON PHANOM UNIVERSITY': { key: 'npu', name: 'วิทยาลัยการบินนานาชาติ มหาวิทยาลัยนครพนม (IAC-NPU)', kind: 'ato_university', base_icao: 'VTUW', base: 'นครพนม', bconf: 'กลาง', bsrc: ['LS5'], best: true },
  'THAI FLYING CLUB': { key: 'tfc', name: 'Thai Flying Club', kind: 'club', base_icao: null, base: 'สนามบินบางพระ ศรีราชา ชลบุรี', bconf: 'กลาง', bsrc: ['LS16'] },
  'PHOENIX AERO CLUB': { key: 'phoenix', name: 'Phoenix Aero Club', kind: 'club', base_icao: null, base: 'ไม่ทราบ', bconf: 'ต่ำ', bsrc: ['LS1'] },
  'FRIENDS FLYING CLUB': { key: 'ffc', name: 'Friends Flying Club', kind: 'club', base_icao: null, base: 'ไม่ทราบ', bconf: 'ต่ำ', bsrc: ['LS1'] },
};

// ---- count ---------------------------------------------------------------------------------------------------
const byOp = {}, byType = {}, opsByType = {}, byFam = {}, byVariant = {};
let wuhu = 0, unknown = [];
for (const [reg, model, serial, op] of REG.rows) {
  const c = classify(model, serial);
  if (c.id.startsWith('unknown')) unknown.push(reg + ' ' + model);
  if (c.wuhu) wuhu++;
  const o = OPS[op]; if (!o) throw new Error('operator not mapped: ' + op);
  (byOp[o.key] ??= { ...o, types: {}, variants: {}, n: 0 }); byOp[o.key].types[c.id] = (byOp[o.key].types[c.id] || 0) + 1; byOp[o.key].n++;
  if (c.variant) { const vk = c.id + '|' + c.variant; byOp[o.key].variants[vk] = (byOp[o.key].variants[vk] || 0) + 1; byVariant[vk] = (byVariant[vk] || 0) + 1; }
  byType[c.id] = (byType[c.id] || 0) + 1;
  (opsByType[c.id] ??= new Set()).add(o.key);
  byFam[c.fam] = (byFam[c.fam] || 0) + 1;
}
const total = REG.rows.length;
const atoKeys = Object.keys(byOp).filter(k => byOp[k].kind !== 'club');
const atoTotal = atoKeys.reduce((s, k) => s + byOp[k].n, 0);
const sumIn = (ids, keys = atoKeys) => keys.reduce((s, k) => s + ids.reduce((t, id) => t + (byOp[k].types[id] || 0), 0), 0);
const C172_IDS = ['c172s', 'c172r'];                                                // c172r includes 172M/N/P (variant note)
const c172All = sumIn(C172_IDS);
const share = (a, b) => Math.round(1000 * a / b) / 10;

// ---- cross-checks against other sources (conflicts section) ---------------------------------------------------
const crossChecks = [
  { school: 'catc', source: 'LS3 slide 7 (2024)', stated_airplanes: 25, register: byOp.catc.n },
  { school: 'tif', source: 'LS12 (20 Aug 2026)', stated_airplanes: 5, register: byOp.tif.n },
  { school: 'bac', source: 'LS9 (Oct 2017)', stated_airplanes: 47, register: byOp.bac.n },
];

// ---- ranking of extra types (not c172s / DA40 / DA42 / PC-7 / PC-9 / T-6) -------------------------------------
// score = aircraft at ATOs + 2 x number of ATOs + 3 if a Thai FNPT of that type exists [LS2]
//       + 2 if handling is distinct from the main cards (light twin, two-seat, LSA-class) ; ties broken by count.
// The weights are an editorial choice (ค่าประมาณ), the inputs are counts from [LS1] and [LS2].
const FNPT = { c172r: 3 };                                                         // FSTD-034, -102, -192 [LS2]
const DISTINCT = { c152: 'สองที่นั่ง เบากว่า C172', p2006t: 'สองเครื่องยนต์ Rotax ล้อพับได้', p2002jf: 'สองที่นั่ง ปีกต่ำ ระดับ LSA/VLA', be76: 'สองเครื่องยนต์ T-tail', p68c: 'สองเครื่องยนต์ ปีกสูง ล้อตายตัว' };
const MAIN = new Set(['c172s', 'da40d', 'da40_180', 'da40ng', 'da42_tae125', 'da42ng']);
const extraIds = Object.keys(byType).filter(id => !MAIN.has(id));
// the old carburetted C172 (M, N, P), the C150 and the PA-28-151 are already counted under their card ids c172r, c152 and
// pa28_161 by classify() (gap 21, 19 Nov 2026), so each candidate is one card
const cand = {};
for (const id of extraIds) {
  const key = id;
  (cand[key] ??= { id: key, ato: 0, all: 0, ops: new Set() });
  for (const k of opsByType[id]) { const n = byOp[k].types[id]; cand[key].all += n; if (byOp[k].kind !== 'club') { cand[key].ato += n; cand[key].ops.add(k); } }
}
const ranking = Object.values(cand).map(c => ({
  id: c.id, ato_aircraft: c.ato, all_aircraft: c.all, ato_schools: c.ops.size,
  fnpt: FNPT[c.id] || 0, distinct: DISTINCT[c.id] || '',
  score: c.ato + 2 * c.ops.size + (FNPT[c.id] ? 3 : 0) + (DISTINCT[c.id] ? 2 : 0),
})).sort((a, b) => b.score - a.score || b.all_aircraft - a.all_aircraft || a.id.localeCompare(b.id));
ranking.forEach((r, i) => { r.rank = i + 1; r.priority = r.score >= 10 ? 1 : r.score >= 6 ? 2 : 3; });

// ---- military (generic, secondary source [LS21]; counts are ค่าประมาณ) -------------------------------------------
// gap 21 (19 Nov 2026): card ids, with the public type designation kept as a variant note
const MIL_ROWS = [
  { id: 'ct4', variant: 'CT-4A/E', n: 24 },
  { id: 'c172s', variant: 'T-41D (C172 รุ่นทหาร; ไม่มีบัตรของตัวเอง ใช้บัตร c172s เป็นตัวแทนโครง C172)', n: 6 },
  { id: 'da40ng', variant: 'DA40 NG', n: 8 },
  { id: 'da42ng', variant: 'DA42 (รุ่นย่อยไม่ระบุในแหล่ง; ใช้บัตรหลัก da42ng)', n: 18 },
  { id: 't6c', variant: 'T-6C (ชื่อในไทย T-6TH)', n: 12 },
];
const MIL = {}; for (const r of MIL_ROWS) MIL[r.id] = (MIL[r.id] || 0) + r.n;

// ---- JSON block for §02.6 --------------------------------------------------------------------------------------
const leaf = (v, src, conf, est, note) => ({ v, u: '-', scope: 'environment', src, conf, est, note });
const block = { common_light: { thai_fleet: {} } };
const T = block.common_light.thai_fleet;
const order = ['catc', 'bac', 'batc', 'aat', 'tif', 'taa', 'npu', 'd0507', 'premium', 'tfc', 'phoenix', 'ffc'];
for (const k of order) {
  const o = byOp[k];
  const types = Object.fromEntries(Object.entries(o.types).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])));
  const notes = {
    catc: 'นับจากทะเบียน กพท. 9 ก.ค. 2026 (22 ลำ) สไลด์ CATC ปี 2024 บอก 25 ลำ + R44 5 ลำ; DA40 = TDI (TAE 125) และ CS (IO-360-M1A); DA42 4 ลำเป็นรุ่น TDI',
    bac: 'ทะเบียน 9 ก.ค. 2026 มี 26 ลำ (ปี 2017 ข่าวบอก 47 ลำ); ฐานฝึกนครราชสีมาอนุมานจากที่ตั้ง FNPT 3 เครื่อง (2026) และข่าวปี 2017 ที่ว่ากรมท่าอากาศยานให้ใช้สนามบินนครราชสีมาฝึกบิน; VTUQ = ค่าประมาณ',
    batc: 'DA42 NG ทั้งสองลำเลขเครื่อง 42.NW = สร้างที่ Wuhu จีน; ฐานสุโขทัยอนุมานจากที่ตั้ง FNPT (ค่าประมาณ)',
    aat: 'ฐานชุมพรอนุมานจาก FNPT FSTD-006 (ค่าประมาณ ความเชื่อมั่นต่ำ); C172M/N เป็นรุ่นเก่า O-320 นับใต้บัตร c172r (10-c172r.md §10.10)',
    tif: 'จำนวน 5 ลำตรงกับข่าว FlightLogger 20 ส.ค. 2026; Beech 76 Duchess ใช้ฝึก multi-engine',
    taa: 'ซื้อ P2002JF 2 ลำ + P2006T 1 ลำ ปี 2018 แต่ทะเบียน 2026 เหลือ P2002-JF 1 ลำ',
    npu: 'ทะเบียนมี DA40 D 2 ลำ แต่ปี 2025–2026 รับเครื่องฝึกจำลอง DA42 (ขัดกัน ดู 02.8); ฐาน VTUW อนุมานจากที่อยู่ ATO อำเภอเมืองนครพนม (ค่าประมาณ)',
    d0507: 'ฐานบินไม่ทราบ (base_icao null)',
    premium: 'ฐานบินไม่ทราบ ที่อยู่บริษัทอยู่ดอนเมือง แต่ไม่พบหลักฐานว่าฝึกบินที่ VTBD',
    tfc: 'ชมรมการบิน ไม่ใช่ ATO; สนามบางพระไม่พบรหัส ICAO ในแหล่งที่ใช้',
    phoenix: 'ชมรมการบิน ไม่ใช่ ATO',
    ffc: 'ชมรมการบิน ไม่ใช่ ATO; มีเครื่อง LSA/ทดลองสร้าง CH601XL-B, CH701 อีก 2 ลำ ไม่นับ',
  }[k];
  const variants = Object.entries(o.variants).sort((a, b) => a[0].localeCompare(b[0])).map(([vk, n]) => { const [id, variant] = vk.split('|'); return { id, variant, n }; });
  T[k] = leaf({ name: o.name, kind: o.kind, base_icao: o.base_icao, base: o.base, types, ...(variants.length ? { variants } : {}), total: o.n, as_of: AS_OF },
    ['LS1', ...o.bsrc.filter(s => s !== 'LS1')], o.bconf === 'สูง' ? 'สูง' : (o.bconf === 'ต่ำ' && o.base_icao !== null) ? 'ต่ำ' : 'กลาง', !!o.best,
    notes + (variants.length ? ' · รุ่นในทะเบียนที่ไม่มีบัตรของตัวเองนับใต้ type id ของบัตรที่ครอบคลุม (variants)' : '') + ' · จำนวนคือเครื่องที่จดทะเบียน ไม่ใช่เครื่องที่บินได้วันนี้');
}
T.military_generic = leaf({ name: 'ผู้ใช้ทางทหารในไทย (รวม ไม่แยกหน่วย)', kind: 'military', base_icao: null, base: 'ไม่ระบุ', types: MIL, variants: MIL_ROWS, total: Object.values(MIL).reduce((a, b) => a + b, 0), as_of: '2026-11-19' },
  ['LS21', 'LS22', 'LS23'], 'ต่ำ', true, 'ค่าประมาณ: จำนวนคัดจากตารางเครื่องฝึกของรายการสาธารณะทุติยภูมิ (Wikipedia, ตรวจซ้ำ 19 พ.ย. 2026) ไม่ใช่แหล่งทางการ ใช้เพื่อจัดลำดับเท่านั้น; types ใช้ type id ของบัตร และชื่อแบบสาธารณะอยู่ใน variants (T-41D ไม่มีบัตร นับใต้ c172s เป็นตัวแทนโครง C172); รายการเดียวกันมี DA42 ในหมวดอื่นอีก 11 ลำ (ไม่ชัดว่าซ้อนกับ 18 หรือไม่) และไม่นับรุ่นโจมตีเบาของ T-6; PC-9 ปลดประจำการปี 2023');
T.summary = leaf({
  as_of: AS_OF, ato_aircraft: atoTotal, all_aircraft: total, c172_family_ato: c172All, c172s_ato: sumIn(['c172s']),
  c172_family_ato_schools: atoKeys.filter(k => C172_IDS.some(id => byOp[k].types[id])).length,
  c172s_ato_schools: atoKeys.filter(k => byOp[k].types.c172s).length,
  da40_ato: { da40d: sumIn(['da40d']), da40_180: sumIn(['da40_180']), da40ng: sumIn(['da40ng']) },
  da42_ato: { da42_tae125: sumIn(['da42_tae125']), da42ng: sumIn(['da42ng']), da42ng_wuhu: wuhu },
  default_thai_type: 'c172s', ranking_extra: ranking.map(r => `${r.id}:P${r.priority}`),
}, ['LS1', 'LS2'], 'สูง', false, 'สรุปจาก scripts/ls_fleet.mjs; ato_* นับเฉพาะ ATO 9 แห่ง ไม่รวมชมรม; all_aircraft = เครื่อง ATO + เครื่องแบบฝึกของชมรม 3 แห่ง (ไม่รวม LSA/เครื่องทดลองสร้างและชมรมอื่น); ลำดับ ranking_extra เป็นการให้น้ำหนักของผู้เขียนตามสูตรใน 02.5.2 (น้ำหนักเป็นการเลือกของผู้เขียน ไม่ใช่ข้อมูล) ส่วนจำนวนนับตรงจากทะเบียน; c172_* รวม 172M/N/P ที่นับใต้ c172r');

const summary = {
  _meta: { script: 'scripts/ls_fleet.mjs', register_as_of: AS_OF, generated: new Date().toISOString().slice(0, 10) },
  total_rows: total, ato_total: atoTotal, ato_schools_with_aircraft: atoKeys.length, clubs: Object.keys(byOp).length - atoKeys.length,
  byType, byVariant, byFam, wuhu_da42ng: wuhu, unknown,
  c172_family_ato: c172All, c172s_ato: sumIn(['c172s']), c172s_share_of_c172_ato_pct: share(sumIn(['c172s']), c172All),
  c172_family_share_of_ato_pct: share(c172All, atoTotal),
  diamond_ato: sumIn(['da40d', 'da40_180', 'da42_tae125', 'da42ng']),
  twins_ato: atoKeys.reduce((s, k) => s + Object.entries(byOp[k].types).reduce((t, [id, n]) => t + (['da42_tae125', 'da42ng', 'be76', 'p2006t', 'p68c'].includes(id) ? n : 0), 0), 0),
  schools_flying: Object.fromEntries(Object.entries(opsByType).map(([id, s]) => [id, [...s].filter(k => byOp[k].kind !== 'club').length])),
  byOp: Object.fromEntries(Object.entries(byOp).map(([k, o]) => [k, { n: o.n, base_icao: o.base_icao, types: o.types, variants: o.variants }])),
  crossChecks, ranking,
};

fs.mkdirSync(OUT_DIR, { recursive: true });
fs.writeFileSync(path.join(OUT_DIR, 'ls_fleet_summary.json'), JSON.stringify(summary, null, 1) + '\n');
fs.writeFileSync(path.join(OUT_DIR, 'ls_thai_fleet_block.json'), JSON.stringify(block, null, 1) + '\n');

// --write (added 19 Nov 2026): replace the thai_fleet json block of ../02-thai-schools.md with the generated one
// (one leaf per line, the layout §02.6 has always used), so the file is regenerated, never hand-edited
export function blockText(blk) {
  const fleet = blk.common_light.thai_fleet;
  const rows = Object.entries(fleet).map(([k, l]) => `   ${JSON.stringify(k)}: ${JSON.stringify(l).replace(/,"/g, ', "').replace(/":/g, '": ')}`);
  return '{\n "common_light": {\n  "thai_fleet": {\n' + rows.join(',\n') + '\n  }\n }\n}';
}
if (process.argv.includes('--write')) {
  const mdUrl = new URL('../02-thai-schools.md', HERE);
  const md = fs.readFileSync(mdUrl, 'utf8');
  let n = 0;
  const out = md.replace(/```json\n([\s\S]*?)\n```/g, (all, body) => { try { if (JSON.parse(body).common_light?.thai_fleet) { n++; return '```json\n' + blockText(block) + '\n```'; } } catch {} return all; });
  if (n !== 1) throw new Error(`--write: expected one thai_fleet block, found ${n}`);
  fs.writeFileSync(mdUrl, out);
  console.log('write: §02.6 block replaced');
}
if (process.argv.includes('--check')) {
  const md = fs.readFileSync(new URL('../02-thai-schools.md', HERE), 'utf8');
  const blocks = [...md.matchAll(/```json\n([\s\S]*?)\n```/g)].map(m => JSON.parse(m[1])).filter(b => b.common_light?.thai_fleet);
  const same = blocks.length === 1 && JSON.stringify(blocks[0]) === JSON.stringify(block);
  console.log(same ? 'check: §02.6 block matches generated block' : `check: MISMATCH (${blocks.length} thai_fleet blocks found)`);
  if (!same) process.exitCode = 1;
}
console.log(`register ${AS_OF}: ${total} rows, ATO aircraft ${atoTotal} in ${atoKeys.length} ATOs, clubs ${summary.clubs}`);
console.log(`C172 family at ATOs ${c172All} (${summary.c172_family_share_of_ato_pct}% of ATO fleet), of which 172S ${summary.c172s_ato} (${summary.c172s_share_of_c172_ato_pct}%)`);
console.log(`DA40 at ATOs: D ${sumIn(['da40d'])}, IO-360 ${sumIn(['da40_180'])}, NG ${sumIn(['da40ng'])} · DA42: TAE125 ${sumIn(['da42_tae125'])}, NG ${sumIn(['da42ng'])} (Wuhu ${wuhu})`);
console.log(`twins at ATOs ${summary.twins_ato}; unknown models: ${unknown.length}`);
console.log('ranking:', ranking.map(r => `${r.rank}.${r.id}(score ${r.score}, P${r.priority})`).join(' '));
console.log('cross-checks:', crossChecks.map(c => `${c.school} stated ${c.stated_airplanes} vs register ${c.register}`).join('; '));
