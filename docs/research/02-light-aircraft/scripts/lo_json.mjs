#!/usr/bin/env node
// Topic 09 (LO): build the ```json data blocks (<id>.procedures.* and common_light.procedures.*) for 09-procedures.md.
// Writes scripts/out/lo_json_blocks.md; with --apply also replaces section "## 09.7" of ../09-procedures.md.
import fs from 'node:fs';
import { TYPES, GATES, GATE_LIMITS, checklistFor } from './lo_lib.mjs';
import { loadType, leaf as cardLeaf, trainingMass } from './lm_lib.mjs';   // D1: quote the card VAPP (completeness fix 19 Nov 2026)

const leaf = (v, u, src, conf, est, note, scope = 'aircraft') => ({ v, u, scope, src, conf, est, note });
const KIAS = 'kt IAS';
// per-type procedure data (KIAS). Sources: [LOn] in 09-procedures.md §09.10; cross-topic [LC1] [LD3] [LT2] [LP..]
const P = {
  c172s: { src: ['LC1', 'LC2', 'LO17', 'LO18'], conf: 'สูง', est: false,
    sf: { takeoff: { flaps: '10', VR: 51, V50: 56, Vx: 62, then: 'Vy 74 หลัง 300 ft แฟลปขึ้น' }, landing: { flaps: '30', Vapp: 61 } },
    soft: { takeoff: { flaps: '10', note: 'อยู่ใน ground effect ถึง Vx 62' }, landing: { flaps: '30', Vapp: 65, power: 'คงกำลังเล็กน้อยถึงแตะพื้น' } },
    ga: { speed: 60, flapsSeq: ['20', '10', '0'], steps: ['full power', 'pitch', 'flaps 20, 60 KIAS', 'positive rate: flaps 10', '50 ft clear of obstacles: 65 KIAS', '300 ft: flaps 0, Vy 74'] },
    efato: { flapsUp: 70, flapsDown: 65, glide: 68 }, power: { downwind: '2000-2200 rpm', abeam: '~1500 rpm' }, xwind: 15 },
  c172r: { src: ['LO20'], conf: 'กลาง', est: true,
    sf: { takeoff: { flaps: '10', V50: 57, Vx: 60 }, landing: { flaps: '30', Vapp: 62 } }, soft: null,
    ga: { speed: 55, flapsSeq: ['20', '10', '0'], steps: ['full power', 'flaps 20', '55 KIAS', 'flaps 10 จนพ้นสิ่งกีดขวาง', 'flaps up ที่ความสูงปลอดภัยและ 60 KIAS'] },
    efato: { flapsUp: 65, flapsDown: 60, glide: 65 }, xwind: 15 },
  c152: { src: ['LO19'], conf: 'กลาง', est: true,
    sf: { takeoff: { flaps: '10', V50: 54, Vx: 55, then: 'แฟลปขึ้นหลัง 60' }, landing: { flaps: '30', Vapp: 54 } }, soft: null,
    ga: { speed: 55, flapsSeq: ['20', '0'], steps: ['full throttle', 'carb heat cold', 'flaps 20', '55 KIAS', 'flaps up slowly'] },
    efato: { flapsUp: 60, glide: 60 }, xwind: 12 },
  pa28_161: { src: ['LO21', 'LO22'], conf: 'กลาง', est: true,
    sf: { takeoff: { flaps: '25', VR: 52, Vobs: 63, then: 79 }, landing: { flaps: '40', Vapp: 65 } },
    soft: { takeoff: { flaps: '25', note: 'เร่งใน ground effect' }, landing: { flaps: '40', Vapp: 65 } },
    ga: { speed: 63, flapsSeq: ['25', '0'], steps: ['mixture rich', 'full power', 'flaps 25', '63 KIAS', 'clear of obstacles 79', 'flaps up slowly'] },
    efato: { glide: 73, shortest: 63 }, xwind: 17 },
  da40ng: { src: ['LD3', 'LO35'], conf: 'กลาง', est: true,
    sf: { takeoff: { flaps: 'T/O', VR: { '940': 56, '1000': 58, '1100': 61, '1200': 65, '1280': 67 }, V50: { '940': 62, '1000': 65, '1100': 67, '1200': 70, '1280': 72 } }, landing: { flaps: 'LDG', Vapp: { '940': 66, '1000': 68, '1100': 72, '1200': 76, '1280': 77 } } }, soft: null,
    ga: { speed: 72, flapsSeq: ['T/O', 'UP'], steps: ['power MAX', 'flaps T/O', 'min 72 KIAS', 'flaps UP ที่ความสูงปลอดภัย'] },
    efato: { glide: 88 } },
  da42ng: { src: ['LT2', 'LT9', 'LO4', 'LO7'], conf: 'ต่ำ', est: true,
    sf: { takeoff: { flaps: 'UP', VR: 76, Vx: 77, Vy: 90 }, landing: { flaps: 'LDG', Vapp: 84 } }, soft: null,
    ga: { speed: 90, flapsSeq: ['APP', 'UP'], steps: ['power MAX ทั้งสอง', 'flaps APP', 'pitch Vy', 'positive rate: gear up', 'flaps UP'] },
    efato: { VMCA: 76, VYSE: 85, sequence: 'AFH: control, VYSE, power, clean up, identify, verify, feather, secure' } },
  // review 2026-11-19: Thai-school sub-variants (cards in 05-da40.md and 06-da42.md)
  da40_180: { src: ['LD6', 'LD8', 'LD1', 'LD4'], conf: 'กลาง', est: true, sf: null, soft: null, landingVapp: 65,
    ga: { speed: 67, flapsSeq: ['T/O', 'UP'], steps: ['full power, mixture rich, prop high rpm', 'flaps T/O', 'pitch 67 KIAS', 'flaps UP ที่ความสูงปลอดภัย'] },
    efato: { glide: { '1200': 76, '1150': 73, '1000': 68, '850': 60 } }, xwind: 20 },
  da40d: { src: ['LD8', 'LD6'], conf: 'กลาง', est: true, sf: null, soft: null, landingVapp: 66,
    ga: { speed: 66, flapsSeq: ['T/O', 'UP'], steps: ['power 100 %', 'flaps T/O', 'pitch 66 KIAS', 'flaps UP ที่ความสูงปลอดภัย'] }, efato: { glide: 73 } },
  da42_tae125: { src: ['LT3', 'LT5', 'LO7'], conf: 'ต่ำ', est: true, sf: { takeoff: { flaps: 'UP', VR: 72, Vy: 79 }, landing: { flaps: 'LDG', Vapp: 82 } }, soft: null,
    ga: { speed: 79, flapsSeq: ['APP', 'UP'], steps: ['power 100 % ทั้งสอง', 'flaps APP', 'pitch Vy', 'positive rate: gear up', 'flaps UP'] },
    efato: { VMCA: 68, VYSE: 82, sequence: 'AFH: control, VYSE, power, clean up, identify, verify, feather, secure' } },
  be76: { src: ['LO23', 'LO24', 'LN5'], conf: 'ต่ำ', est: false,
    sf: { takeoff: { VR: 71, Vx: 71, Vy: 85 }, landing: { flaps: '35', Vapp: 76 } }, soft: null,
    ga: { speed: 85, flapsSeq: ['0'], steps: ['full power', 'pitch Vy 85', 'retract flaps', 'positive rate: gear up'] },
    efato: { VMC: 65, VYSE: 85, VSSE: 71 }, power: { downwind: '18 inHg / 2300 rpm', abeam: '15 inHg' }, singleEngine: { downwind: 105, abeam: 95, base: 90, final: 85, shortFinal: 80 } },
  p2006t: { src: ['LO26', 'LO27', 'LG3'], conf: 'กลาง', est: true,
    sf: null, soft: null, landingVapp: { '1180': 70, '1230': 71 }, touchdown: 65,
    ga: { speed: 80, flapsSeq: ['T/O', 'UP'], steps: ['full power', 'flaps T/O', 'pitch Vy 80', 'positive rate: gear up', 'flaps UP'] },
    efato: { VMC: 62, VYSE: { '1180': 80, '1230': 84 }, VXSE: { '1180': 79, '1230': 83 }, onRunway: 'abort before rotation', airborne: 'accelerate to VYSE before gear up', oeiApproach: 'VYSE, touchdown 70' } },
  p2002jf: { src: ['LO28', 'LO29', 'LO30'], conf: 'ต่ำ', est: true,
    sf: null, soft: null, landingVapp: 52,
    ga: { speed: 60, flapsSeq: ['TO', 'UP'], steps: ['full power', 'flaps T/O', 'pitch Vx/Vy', 'flaps UP'] },
    efato: { flaps15: 60, glide: 68, note: 'ค่าของ P2002 Sierra (US-LSA) รุ่นใกล้เคียง' }, xwind: null },
  p68c: { src: ['LO31', 'LO37', 'LO7'], conf: 'ต่ำ', est: true, sf: null, soft: null, landingVapp: 74,
    ga: { speed: null, flapsSeq: ['17', '0'], steps: ['full power ทั้งสอง', 'flaps ขั้นแรก', 'pitch Vy', 'flaps up'] }, efato: { VMC_KCAS: 60 } },
  t206h: { src: ['LO33', 'LN20', 'LN18'], conf: 'ต่ำ', est: true, sf: { landing: { flaps: 'FULL', Vapp: 67, note: 'short field approach แฟลป FULL 67 KIAS = speeds.VREF_kt ของบัตร 13 (POH Sec 4 ผ่าน LN20)' } }, soft: null, landingVapp: 75,
    ga: { speed: null, flapsSeq: ['20', '10', 'UP'], steps: ['full power (MAP ไม่เกินค่าจำกัด)', 'flaps 20', 'pitch climb', 'flaps up ตามความเร็ว'] },
    efato: { flapsUp: 85, flapsDown: 75, glide: { '3600': 80, '3200': 75, '2800': 70 }, precautionary: 75 } },
  ct4: { src: ['LO34'], conf: 'ต่ำ', est: true, sf: null, soft: null, landingVapp: 60, ga: { speed: null, flapsSeq: ['TO', 'UP'], steps: ['full power', 'flaps T/O', 'climb', 'flaps UP'] }, efato: {} },
  pc7mk2: { src: ['LP1', 'LO4'], conf: 'ต่ำ', est: true, sf: null, soft: null, landingVapp: 89, Vref: 84, ga: { speed: null, flapsSeq: ['TO', 'UP'], steps: ['PCL max', 'pitch climb', 'positive rate: gear up', 'flaps up'] }, efato: {} },
  pc9m: { src: ['LP2', 'LO4'], conf: 'ต่ำ', est: true, sf: null, soft: null, landingVapp: 90, Vref: 85, ga: { speed: null, flapsSeq: ['TO', 'UP'], steps: ['PCL max', 'pitch climb', 'positive rate: gear up', 'flaps up'] }, efato: {} },
  // review 2026-11-19: AirfieldLab's own trainer (src/20-flight.js:117 AC.Vref 88, AC.Vapp 95); procedures generic (AFH)
  trainer_r2: { src: ['LP27', 'LO0', 'LO4'], conf: 'ต่ำ', est: true, sf: null, soft: null, landingVapp: 95, Vref: 88, ga: { speed: null, flapsSeq: ['TO', 'UP'], steps: ['PCL max', 'pitch climb', 'positive rate: gear up', 'flaps up'] }, efato: {} },
  t6a: { src: ['LP15', 'LP17', 'LP20'], conf: 'ต่ำ', est: false, sf: { takeoff: { flaps: 'TO', VR: 85, pitch_deg: '7-10', climbout: 140 } }, soft: null,
    landingVapp: { LDG: 100, TO: 105, UP: 110 }, touchdown: '80-95',
    ga: { speed: null, flapsSeq: ['TO', 'UP'], steps: ['PCL max', 'pitch climb', 'below 150 KIAS: gear and flaps up after positive rate'] },
    efato: { glide_clean: 125, ELP: { highKey_ftAGL: 3000, lowKey_ftAGL: 1500 } }, pattern: { initial: 200, minDownwind: 120, minFinalTurn: 110 } },
  // completeness fix 19 Nov 2026 (D1): t6c inherits procedures from t6a (07 _inherits); only pattern and stabilised differ
  t6c: { src: ['LP27', 'LP20', 'LP29'], conf: 'ต่ำ', est: true, inheritsOnly: ['pattern', 'stabilised'] },
};

// Per-leaf estimate flags (review 2026-11-19): the first draft reused one per-type flag, so sourced POH values were marked
// est and flashcard values were described as POH. gaEst: the go-around leaf is an estimate (generic AFH sequence) unless listed false.
const GA_SOURCED = { c172s: 'POH (balked landing) และ SOP โรงเรียน [LC1][LO17]', c172r: 'POH balked landing [LO20 Sec 4]', c152: 'POH balked landing [LO19 p4-3, 4-9]', pa28_161: 'checklist โรงเรียน [LO22] (บท 4 ของ POH ในสำเนาที่เปิดได้ขาด)', da40ng: 'ความเร็ว go-around ต่ำสุดแฟลป T/O จาก checklist ของ Diamond [LD3]', be76: 'flashcard ของโรงเรียน [LO24] (ตติยภูมิ)' };
const PATTERN_NOTE = {
  c172s: 'ความเร็ว แฟลป และกำลังแต่ละขาจาก SOP ของโรงเรียน [LO17][LO18] และ Vy/Vapp จาก POH [LC1] (§09.1.3); final = speeds.VAPP_kt ของบัตร 04 (D1)',
  be76: 'ความเร็ว แฟลป และกำลังแต่ละขาจาก flashcard ของโรงเรียน [LO24] (ตติยภูมิ ไม่ใช่ POH) ความเชื่อมั่นต่ำ; final 80 = speeds.VAPP_kt ของบัตร 13 [LN5] (D1)',
  trainer_r2: 'ค่าประมาณ: final = AC.Vapp 95 ของซิม (src/20-flight.js:117) = speeds.VAPP_kt ของบัตร 07 (D1), climb = VY 136 KCAS ของ trainer_r2 (หัวข้อ 07, เดิม 125), ขาอื่นตาม §09.1.5 เทียบ pc9m; แฟลป TO = AC.flaps 0.5, LDG = 1.0; KIAS ≈ KCAS',
  t6c: 'ค่าประมาณ: final = speeds.VAPP_kt 104 KIAS ของบัตร t6c (หัวข้อ 07, D1), climb = VY 140 KIAS [LP29], downwind 150 เท่า t6a [LP20], abeam 125 และ base 115 = ขั้นต่ำของ T-6A 120/110 KIAS [LP20] × √(2775.5/2574.6) = 1.038 ปัดเป็นเลขลงท้าย 0/5; leaf อื่นของ procedures รับจาก t6a',
};
// D1 (completeness fix 19 Nov 2026): the card of each type owns speeds.VAPP_kt at its training_mass; 09 quotes it.
const CARD_FILE = { c172s: '04', c172r: '10', c152: '11', da40ng: '05', da40_180: '05', da40d: '05', da42ng: '06', da42_tae125: '06',
  pc7mk2: '07', pc9m: '07', t6a: '07', t6c: '07', trainer_r2: '07', p2006t: '12', pa28_161: '13', be76: '13', p2002jf: '13', p68c: '13', t206h: '13', ct4: '13' };
const d1 = {};
for (const id of Object.keys(TYPES)) {
  let card = null; try { card = loadType(id); } catch (e) { console.warn(`WARN ${id}: card not loaded (${e.message})`); }
  const cv = card && cardLeaf(card, 'speeds.VAPP_kt'), tm = card && trainingMass(card)?.kg;
  if (!cv) { console.warn(`WARN ${id}: card has no speeds.VAPP_kt`); continue; }
  if (Math.abs(cv.v - TYPES[id].V.final) > 0.5) console.warn(`WARN D1 ${id}: lo_lib V.final ${TYPES[id].V.final} differs from card VAPP ${cv.v} ${cv.u}`);
  d1[id] = { v: cv.v, u: cv.u, est: !!cv.est, conf: cv.conf, src: cv.src || [], mass: tm, cas: /CAS/.test(cv.u), iasCas: !!cardLeaf(card, 'speeds.ias_cas') };
}
const uniq = (a) => [...new Set(a)];
const capConf = (c) => (c === 'สูง' ? 'กลาง' : c || 'ต่ำ');
const blocks = [];
for (const [id, t] of Object.entries(TYPES)) {
  if (!P[id]) throw new Error('no procedure data for ' + id);
  const p = P[id]; const src = uniq([...t.src, ...p.src]);
  const cl = checklistFor(t);
  const gaEst = !(id in GA_SOURCED);
  const c = d1[id];
  const stEst = c ? c.est || c.cas : t.est;
  const stNote = c
    ? `Vapp = speeds.VAPP_kt ของบัตร ${id} (ไฟล์ ${CARD_FILE[id]}) ${c.v} ${c.u} ที่ airframe.weights.training_mass ${c.mass} kg ตามข้อตัดสิน D1` +
      (c.est ? ' (ค่าประมาณของบัตร วิธีอยู่ใน note ของบัตร)' : '') + (c.cas ? (c.iasCas ? '; บัตรให้ kt CAS และ speeds.ias_cas ของบัตรเป็นตาราง identity (ค่าประมาณ ไม่มีข้อมูล PEC สาธารณะ) จึงใช้เป็น KIAS ≈ KCAS' : '; บัตรให้ kt CAS และไม่มีตาราง ias_cas จึงใช้เป็น KIAS ≈ KCAS (ประมาณ)') : '') +
      '; รายการแฟลปลงจอดที่ยอมรับใช้ชื่อตาม aero.flaps.detents ของบัตร (D6) และเป็นข้อเสนอของหัวข้อนี้; ช่อง −5/+10 kt รอบ Vapp + ½ gust ใช้กับ common_light.procedures.stabilised_gates'
    : (t.est ? 'ค่าประมาณ: Vapp = ความเร็ว final ของ §09.1.3 (วิธี §09.1.5); ' : 'Vapp = ความเร็ว final ของแบบตามแหล่งใน §09.1.3; ') + 'รายการแฟลปลงจอดที่ยอมรับเป็นข้อเสนอ; ช่อง −5/+10 kt รอบ Vapp + ½ gust';
  const pr = {
    pattern: leaf({ ...t.V, flapsAt: t.flapsAt, ...(p.power ? { power: p.power } : {}), ...(p.pattern ? { t6: p.pattern } : {}), ...(p.singleEngine ? { singleEngine: p.singleEngine } : {}) }, KIAS, src, t.est ? 'ต่ำ' : p.conf, t.est,
      PATTERN_NOTE[id] ?? 'ค่าประมาณบางขา: final = speeds.VAPP_kt ของบัตร (D1) และ climb = speeds.VY_kt ของบัตรเมื่อมี; ค่าที่มีแหล่งตาม §09.1.3 ส่วนขาที่ไม่มีแหล่งประมาณตาม §09.1.5 (base = final + 5–10; abeam = base + 5–10 ≤ VFE; downwind = 1.35–1.5 × final)'),
    stabilised: leaf({ Vapp: t.V.final, window_kt: [GATE_LIMITS.spdLo, GATE_LIMITS.spdHi], landingFlaps: t.landingFlaps, gearDown: !!t.features.retract, gates: Object.keys(GATES) }, KIAS, uniq([...src, ...(c ? c.src : []), 'LO4', 'LO36']), c ? capConf(c.conf) : (t.est ? 'ต่ำ' : 'กลาง'), stEst, stNote),
    short_field: leaf(p.sf ?? { landing: { Vapp: p.landingVapp ?? t.V.final, note: 'ไม่มีขั้นตอน short field ในแหล่งที่อ่านได้' } }, KIAS, src, p.sf ? p.conf : 'ต่ำ', !p.sf,
      p.sf ? 'ตัวเลขจาก POH/AFM, checklist หรือ SOP ตามแหล่งของแบบ (§09.4.2)' : 'ค่าประมาณ: ใช้ Vapp ของบัตร (D1) เพราะไม่มีขั้นตอน short field เฉพาะแบบในแหล่งที่อ่านได้'),
    soft_field: leaf(p.soft ?? { technique: 'AFH: แฟลปตาม POH, ล้อหน้าเบา, ground effect ถึง Vx; ลงด้วยกำลังเล็กน้อยและประคองล้อหน้า', ref: 'LO5, LO6' }, KIAS, p.soft ? src : uniq([...src, 'LO5', 'LO6']), p.soft ? p.conf : 'กลาง', !p.soft,
      p.soft ? 'จาก SOP โรงเรียน/POH (§09.4.2)' : 'ค่าประมาณ: ใช้เทคนิคทั่วไปของ AFH [LO5 p9-23–9-24][LO6 p6-13] เพราะไม่มีตัวเลขเฉพาะแบบ'),
    go_around: p.ga && leaf(p.ga, KIAS, uniq([...src, 'LO4']), gaEst ? 'ต่ำ' : p.conf, gaEst,
      gaEst ? `ค่าประมาณ: ลำดับทั่วไปของ AFH [LO4 p9-11, 9-12] (กำลังเต็ม → ท่าไต่ → แฟลปทีละขั้น → ล้อขึ้นเมื่อไต่ได้แน่นอน)${p.ga.speed ? '; ความเร็ว ' + p.ga.speed + ' KIAS จาก Vy/VY ของบัตรหรือแหล่งของแบบนั้น' : '; ไม่มีความเร็วเฉพาะแบบ'}; ชื่อแฟลปตาม aero.flaps.detents ของบัตร (D6)` : `ลำดับและความเร็วจาก ${GA_SOURCED[id]} สอดคล้องกับ AFH [LO4 p9-11]; ชื่อแฟลปตาม aero.flaps.detents ของบัตร (D6)`),
    checklist_summary: leaf({ features: t.features, items: Object.fromEntries(Object.entries(cl).map(([k, v]) => [k, v.map((i) => i.id)])), emergency: p.efato, ...(p.xwind ? { demoCrosswind_kt: p.xwind } : {}) }, '- / kt IAS', uniq([...src, 'LO0']), 'กลาง', true,
      'ค่าประมาณ (การเรียบเรียง): รายการหัวข้อด้วยถ้อยคำของเรา (ข้อความไทยใน lo_lib.mjs) กรองด้วยคุณลักษณะของแบบ ไม่ใช่ checklist ของผู้ผลิต; ความเร็วฉุกเฉินและลมขวางสาธิตตามแหล่งของแบบใน §09.4.2'),
  };
  // t6c (and any type with inheritsOnly): write only the leaves that differ; the rest comes through the card's _inherits
  const keep = p.inheritsOnly ?? Object.keys(pr);
  blocks.push({ [id]: { procedures: Object.fromEntries(keep.map((k) => [k, pr[k]])) } });
}
const S = 'sim', ENV = 'environment';
blocks.push({ common_light: { procedures: {
  pattern_geometry: leaf({ shape: 'rectangle with rounded corners', D_rule: 'clamp(2R(V_dw,25deg)+400 m, 0.5 sm, 1.0 sm), and >= R_b+R_f+200 m', bankDeg: 25, finalBankDeg: 20, gpDeg: 3, rolloutFt: 400, baseRule: 'gate', turnWithinFt: 300, minFinal_m: 402, entry: '45 deg to downwind abeam midpoint at circuit height', exit: 'straight out or 45 deg turn beyond departure end after reaching circuit height', descentStart: 'abeam landing threshold', noOrbit: true, vtbdTurbopropHeight_ft: 1000 }, 'm, deg, ft', ['LO1', 'LO2', 'LO3', 'LO4', 'LO13', 'LO0'], 'กลาง', true, 'กติกาจาก AIM 4-3-3/AC 90-66C 11.3–11.8/AFH บท 8; ค่าประมาณ: D, bank 25°/20°, rolloutFt 400 (§09.1.2) และ vtbdTurbopropHeight_ft (ตีความว่าเทอร์โบพร็อปเป็น conventional ของ AIP)', S),
  pattern_altitude_ft: leaf({ faa_propeller: 1000, faa_large_turbine: 1500, helicopter: 500, vtbd_light: 800, vtbd_conventional: 1000, vtbd_jet: 1500, vtbd_helicopter: 500 }, 'ft AGL', ['LO1', 'LO2', 'LO13', 'LO39', 'LS20'], 'สูง', false, 'FAA: AIM 4-3-3 และ AC 90-66C App A (เฮลิคอปเตอร์ 500 ft: AC 90-66C 12.1.4 และ App A ข้อ 4); VTBD = ความสูงเข้าวงจรของ 03R/21L ใน AD 2.20 ข้อ 4.2.2 และความสูงวงจรตามหมายเหตุ Traffic Patterns and Altitude ใน AD 2.22 ข้อ 8.6.2 (light 800, conventional 1000, jet 1500, helicopter 500 ft) ข้อความเหมือนกันใน AIRAC 14 MAY, 9 JUL และ 29 OCT 2026 [LO39][LS20] (lo_aip_check.mjs, 19 พ.ย. 2026) และตรงกับ AIRAC 2022-08-11 และ 2024-02-22 [LO13]; ค่าเทอร์โบพร็อปของซิมอยู่ที่ pattern_geometry', ENV),
  stabilised_gates: leaf({ imc_ft: GATES.imc.h_ft, vmc_straight_in_ft: GATES.vmc_straight_in.h_ft, vfr_circuit_ft: GATES.vfr_circuit.h_ft, speed_window_kt: [GATE_LIMITS.spdLo, GATE_LIMITS.spdHi], gust: { fraction: GATE_LIMITS.gustFrac, max_kt: GATE_LIMITS.gustMax }, sinkMax_fpm: GATE_LIMITS.sinkMax, bankMax_deg: GATE_LIMITS.bankMax, vfrPath_deg: [GATE_LIMITS.pathLo, GATE_LIMITS.pathHi], ilsDots: GATE_LIMITS.dots, config: 'landing flaps of type + gear down if retractable', onFail: 'GO AROUND' }, 'ft, kt, fpm, deg', ['LO4', 'LO5', 'LO8', 'LO9', 'LO18', 'LO36'], 'กลาง', true, 'ค่าจากแหล่ง ยกเว้นเพดาน gust 10 kt (ค่าประมาณจาก T-6 [LP20]) และแถบ PAPI 2.5–3.5° (ค่าใน repo)', S),
  radio_calls: leaf([
    { at: 'ready', pilot: 'DON MUEANG TOWER, <CS>, HOLDING POINT RUNWAY <RWY>, READY FOR DEPARTURE, REQUEST CIRCUITS', atc: '<CS>, RUNWAY <RWY>, CLEARED FOR TAKE-OFF, WIND <W>[, RIGHT HAND CIRCUIT]', readback: true },
    { at: 'downwind', pilot: '<CS>, DOWNWIND, <TOUCH AND GO|FULL STOP>', atc: '<CS>, NUMBER <N>, FOLLOW <TRAFFIC>, REPORT FINAL' },
    { at: 'delay', pilot: null, atc: '<CS>, EXTEND DOWNWIND | ORBIT <LEFT|RIGHT>' },
    { at: 'final', pilot: '<CS>, FINAL (LONG FINAL beyond 4 NM)', atc: '<CS>, RUNWAY <RWY>, CLEARED TOUCH AND GO | CLEARED TO LAND, WIND <W>', readback: true },
    { at: 'go_around', pilot: '<CS>, GOING AROUND', atc: '<CS>, ROGER, REPORT DOWNWIND' },
    { at: 'vacate', pilot: null, atc: '<CS>, VACATE VIA <TWY>, HOLD SHORT OF RUNWAY <RWY2>', readback: true },
    { at: 'join', pilot: 'DON MUEANG TOWER, <CS>, <POSITION>, <ALT>, INFORMATION <ATIS>, FOR CIRCUITS', atc: '<CS>, JOIN <SIDE> HAND DOWNWIND RUNWAY <RWY>, <HEIGHT>, QNH <Q>', readback: true },
  ], '-', ['LO12', 'LO13'], 'กลาง', false, 'แม่แบบที่เรียบเรียงจากวลีของ Doc 9432 บท 4 (ไม่ใช่ข้อความคัดลอกยาว); FINAL ภายใน 4 NM (4.7.1); ระบุ RIGHT HAND CIRCUIT เฉพาะวงจรขวา เช่น 03R วงจรซ้ายไม่ต้องระบุ (4.6.1)', S),
  vtbd: leaf({ circuit_03R_21L: 'east of runway: 03R right-hand, 21L left-hand', join: '45 deg mid-downwind east', outbound: 'turn east, leave at 45 deg to crosswind', straightIn: 'Tower approval required', atz: { radius_NM: 5, top_ftAGL: 2000, class: 'C', language: 'English, Thai' }, freq_MHz: { TWR: 118.1, GND: [121.9, 122.5], DEL: 127.7, ATIS_arrival: 126.4, ATIS_departure: 118.55, APP_DonMueang: 119.4 }, speedLimit_kt: 250, vfrDay: { groundVis_km: 5, ceiling_ft: 1500 }, svfr_groundVis_m: 1500, vfrNight: 'ATC may authorize; treated as special VFR', items_AIRAC_2026: { circuit: 'AD 2.20 4.1-4.2.3', vacate21L_holdShort21R: 'AD 2.20 6.3 (TWY S)', clearanceToLand: 'AD 2.20 7.3', speed250: 'AD 2.22 4.1.2', vfrMinima: 'AD 2.22 8.1-8.4', patternHeights: 'AD 2.22 8.6.2 note' }, rwy03R_21L: 'normally military, civil possible', sim_03L_21R: 'fictional west circuit (03L left, 21R right)' }, '-', ['LO13', 'LO39', 'LS20'], 'สูง', false, 'AIP AD 2 VTBD AIRAC 14 MAY, 9 JUL และ 29 OCT 2026 (ฉบับที่มีผล ณ 19 พ.ย. 2026) อ่านเต็มหน้าด้วย lo_aip_check.mjs: ทุกค่าเหมือนกันทั้งสามฉบับ (T-LO-33) และตรงกับการตรวจของหัวข้อ 02 [LS20] และรอบที่ 5 (5d-aip-update.md ตาราง U3); เลขข้อของ AIRAC 2022 [LO13] ต่างไป (คำเตือนแท็กซี่ 7.3 เป็น 6.3, clearance 8.3 เป็น 7.3, 250 kt จาก AD 2.20 5.1 เป็น AD 2.22 4.1.2); ATIS ขาออก 118.55 และ Don Mueang Approach 119.4 เพิ่มใหม่; วงจรของ 03L/21R เป็นข้อเสนอสมมติ', ENV),
  vtbd_vfr_light: leaf({ routes: 'AD 2.22 8.5.2 VFR entry/exit for light aircraft (charts in AD 2.24)', designedBelow_kt: 130, above130: 'ATC may allow the routes or assign paths/altitudes', daylightOnly: true, radioAndTransponder: 'required', reportingPoints: 26, routeAlt_ft: [1000, 4500], nearFieldAlt_ft: 1000, adherence: 'recommended paths and altitudes, not mandatory; ATC may assign others', trainingArea: { designator: { 'AIRAC 2026-05-14': 'VT D72', 'AIRAC 2026-07-09': 'VT D72', 'AIRAC 2026-10-29': 'VT D6A / VT D6B' }, contact: 'Don Mueang Approach 119.4 MHz', out: 'via BANG BUA THONG at or below 1000 ft', back: 'report LAT LUM KAEO at or below 1000 ft, then PATHUMTHANI, 5 NM WEST, then downwind 21L/R or 03R/L', limits: 'surface to 5000 ft ALT (ENR 5.1)' }, radioFailureVFR: 'enter downwind with the traffic flow at type height, low approach between the runways at 500 ft rocking wings, re-enter downwind, watch light signals', coordinates: 'not collected (task 09.11)' }, '-', ['LO39', 'LS20', 'LS37'], 'สูง', false, 'ข้อเท็จจริงจาก AIP AD 2.22 ข้อ 8.5.1, 8.5.2, 8.6.2 และ 9.2 ที่ตรวจใน AIRAC 14 MAY, 9 JUL และ 29 OCT 2026 ด้วย lo_aip_check.mjs (T-LO-34) และหัวข้อ 02 (T-LS-12) [LS20]; พื้นที่ฝึกตาม ENR 5.1 [LS37] แสดงแบบทั่วไปเท่านั้น; ชื่อจุดรายงานเป็นชื่อสถานที่ตาม AIP ไม่เก็บชื่อจุดสังเกต พิกัดจุดรายงานยังไม่ได้เก็บ (งานใน §09.11)', ENV),
  wake_turbulence: leaf({ categories_kg: { L: '<=7000', M: '7000-136000', H: '>=136000', J: 'A380' }, distance_NM_to_light: { M: 5, H: 6, J: 8 }, time_min_light_landing_behind: { M: 3, H: 3, J: 4 }, departures_min: '2-4' }, 'kg, NM, min', ['LO16'], 'กลาง', false, 'ICAO Doc 4444 ผ่านสรุปของ Wikipedia (แหล่งทุติยภูมิ)', ENV),
  vfr_minima_thailand: leaf({ ctrVfrWithoutClearance: { ceiling_ft: 1500, groundVis_km: 5 }, vmcBelow3000: { vis_km: 5, cloudHoriz_m: 1500, cloudVert_ft: 1000 }, minHeight_ft: { congested_aboveHighestObstacleWithin600m: 1000, other_aboveSurface: 500 }, svfr_vis_m: 1500, nightVfrCeiling_ft: 1500, uncontrolledFreq_MHz: 123.0, uncontrolledReport_NM: 10, nightRule: 'ENR 1.1 1.2: night = IFR (ดู §09.9)' }, 'ft, km, m, MHz, NM', ['LO14', 'LO15'], 'สูง', false, 'AIP Thailand ENR 1.2 (AIRAC AMDT 13/23) ข้อ 1 (VMC ชั้น A–E ต่ำกว่า 3,000 ft), 2.1–2.2 (CTR), 3.2.2.1 (VFR กลางคืน), 4.2.2 (SVFR), 6 (ความสูงต่ำสุด), 13.1.2/13.2.1.2 (สนามไม่มีหอ) และ ENR 1.1 ข้อ 1.2 (AMDT 8/19)', ENV),
} } });

const md = blocks.map((b) => '```json\n' + JSON.stringify(b, null, 1) + '\n```').join('\n\n');
fs.mkdirSync(new URL('./out/', import.meta.url), { recursive: true });
fs.writeFileSync(new URL('./out/lo_json_blocks.md', import.meta.url), md + '\n');
console.log(`blocks: ${blocks.length}, chars: ${md.length}`);
if (process.argv.includes('--apply')) {
  const f = new URL('../09-procedures.md', import.meta.url); const lines = fs.readFileSync(f, 'utf8').split('\n');
  const i = lines.findIndex((l) => l.startsWith('## 09.7 ')); const j = lines.findIndex((l, k) => k > i && l.startsWith('## '));
  const intro = 'บล็อกด้านล่างสร้างด้วย `node scripts/lo_json.mjs --apply` จากข้อมูลใน `scripts/lo_lib.mjs` และ `scripts/lo_json.mjs` (ห้ามแก้ด้วยมือ ให้แก้ที่สคริปต์แล้วรันใหม่) หัวข้อนี้เป็นเจ้าของ `<id>.procedures.*` ของ 15 แบบหลัก รุ่นย่อยที่โรงเรียนไทยใช้ 3 แบบ (`da40_180`, `da40d`, `da42_tae125`), `trainer_r2` (เครื่องฝึกสมมติของซิม) และ `t6c` (เฉพาะ `pattern` และ `stabilised` ที่ต่างจาก `t6a`; leaf อื่นรับผ่าน `_inherits` ของบัตร 07) รวม 20 บล็อกแบบ และ `common_light.procedures.*` อีกหนึ่งบล็อก ความเร็วเป็น KIAS; `stabilised.Vapp` และ final ของ `pattern` เท่ากับ `speeds.VAPP_kt` ของบัตรแต่ละแบบที่ `training_mass` (ข้อตัดสิน D1, `lo_json.mjs` อ่านค่าบัตรด้วย `lm_lib.loadType` และเตือนถ้าไม่ตรง) และชื่อแฟลปเป็นชื่อ detent ของบัตร (D6) ค่าที่ `est: true` เป็นค่าประมาณ และ `note` ของแต่ละ leaf บอกวิธีได้มา (§09.1.5)';
  const out = [...lines.slice(0, i + 1), '', intro, '', ...md.split('\n'), '', ...lines.slice(j)];
  fs.writeFileSync(f, out.join('\n'));
  console.log('applied to 09-procedures.md');
}
