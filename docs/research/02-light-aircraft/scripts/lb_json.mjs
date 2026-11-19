// lb_json.mjs - build the topic-03 JSON data blocks (<id>.otherSims.* and <id>.validation.openModels.*) from the
// JSBSim fixtures in scripts/out/ (lb_perf_<model>.json, lb_aero.json, lb_compare.json) and print them as markdown
// ```json fences, one top-level type id per block (schema-ext-r2.md §2). Also writes scripts/out/lb_json.md.
// Review 2026-11-19: loading/fuel-burn note, glide propeller state, FlightGear models found in the FGMEMBERS mirror
// (PC-9M, pc7, T-6, Diamond-DA42, Tecnam-P2006T, c152, PA28) and otherSims for c172r, c152, p2006t, pa28_161.
// Fix 2026-11-19: c172r results moved to c172r.validation.openModels (gap 28); pa28_180 gets _na ["*"] (gap 5, D5);
// FlightGear JSBSim models measured with lb_perf.py (gap 14) get validation.openModels.flightgear_* leaves.
// Run: node scripts/lb_json.mjs   (Node >= 18, no dependencies). Units: speeds kt CAS / kt TAS (schema §1), other
// quantities SI (m, m/s, kW, N) with the aviation value in note.
import { readFileSync, writeFileSync } from 'node:fs';
const OUT = new URL('./out/', import.meta.url);
const rd = (f) => JSON.parse(readFileSync(new URL(f, OUT), 'utf8'));
const FGM = ['fg_pc9m', 'fg_c152', 'fg_da40ng', 'fg_t6'];
const MODELS = ['c172p', 'c172r', 'c172x', 'pa28', 'pc7', 't6texan2', ...FGM];
const DER = rd('lb_pc9m_fg.json');
const P = Object.fromEntries(MODELS.map((m) => [m, rd(`lb_perf_${m}.json`)]));
const A = rd('lb_aero.json');
const CMP = rd('lb_compare.json').rows;
const FT = 0.3048, FPM = 0.00508, HP = 0.745699872, LBF = 4.4482216;
const r = (x, n = 1) => (x == null ? null : Math.round(x * 10 ** n) / 10 ** n);
const fmt = (x) => (x == null ? '–' : x.toLocaleString('en-US'));
const L = (v, u, src, note, conf = 'สูง', est = false, scope = 'aircraft') => ({ v, u, scope, src, conf, est, note });
const byFlap = (m, f) => Object.fromEntries(Object.entries(P[m].stall).map(([k, s]) => [k, f(s)]));
const aero = (m, key, n = 4) => Object.fromEntries(Object.entries(A[m]).filter(([, v]) => v && typeof v === 'object').map(([k, v]) => [k, r(v[key], n)]));
const verdicts = (m) => {
  const c = { 'ตรง': 0, 'ใกล้': 0, 'ไม่ตรง': 0, 'เทียบไม่ได้': 0 };
  for (const x of CMP.filter((x) => x.model === m)) c[x.verdict.split(' ')[0]]++;
  return c;
};
const MEAS = 'ผลวัดจากโมเดลเปิด ไม่ใช่ข้อมูลบินจริง';

function openModel(m, xmlSrc, extra = {}) {
  const p = P[m]; const s0 = p.stall['0'];
  const o = {};
  o.test_conditions = L({ jsbsim: p.jsbsim, model: m, dt_s: r(p.dt_s, 6), mass_lb: r(s0.w_lb, 0), mass_kg: r(s0.w_lb * 0.45359237, 0),
    cg_x_in_model_datum: s0.cg_x_in, atmosphere: 'ISA ลมสงบ', payload: 'pointmass ย้ายไปที่ CG อ้างอิงของโมเดล' }, '-', ['LB1', xmlSrc],
  `สภาพการรันของ lb_perf.py (03.1)${p.source ? `; FlightGear ${p.source.repo} commit ${p.source.commit.slice(0, 7)} ไฟล์ ${p.source.file} (${p.source.licence}) ดึงด้วย lb_fg_fetch.py ไว้นอก repo` : ''}; CG อยู่ใน datum ของไฟล์ เทียบกับ datum ของ POH ไม่ได้${s0.not_loaded_lb > 0 ? `; ใส่น้ำหนักได้แค่ ${fmt(r(s0.w_lb, 0))} lb จาก MTOW ${fmt(p.mtow_lb)} lb (ไม่มี pointmass ให้ใส่อีก ${fmt(s0.not_loaded_lb)} lb)` : p.mtow_lb !== r(s0.w_lb, 0) ? `; ใส่ครบ MTOW ${fmt(p.mtow_lb)} lb แต่น้ำหนัก ณ เริ่มทดสอบเหลือ ${fmt(r(s0.w_lb, 0))} lb เพราะเชื้อเพลิงลดระหว่างบินนิ่ง 25 s แทน FGTrim` : ''}`);
  o.stall_vs = L(byFlap(m, (s) => r(s.vs_kcas, 2)), 'kt CAS', ['LB1', xmlSrc], `${MEAS}; ลดความเร็ว 1 kt/s idle 3,000 ft ISA; key = มุมแฟลป (deg); สาเหตุที่หยุด: ${[...new Set(Object.entries(p.stall).map(([k, s]) => `${k}° ${s.limit === 'elevator stop' ? 'elevator ชนสต็อป' : 'แรงยกลด'}`))].join(', ')}`);
  o.stall_cl = L(byFlap(m, (s) => s.CL_at_vs), '-', ['LB1', xmlSrc], `${MEAS}; CL = L/(q̄S) ณ จุด VS ของการทดสอบ 1 kt/s (α ${Object.values(p.stall).map((s) => s.alpha_at_vs).join('/')}°)`);
  o.vy = L(p.climb.vy_kcas, 'kt CAS', ['LB1', xmlSrc], `${MEAS}; SL ISA คันเร่งสุด แฟลป 0`);
  o.roc_max = L(r(p.climb.roc_max_fpm * FPM, 2), 'm/s', ['LB1', xmlSrc], `${MEAS}; ${fmt(p.climb.roc_max_fpm)} fpm ที่ Vy SL ISA`);
  // review 2026-11-19: report the propeller state of the glide (the piston models stop the propeller at 0 rpm, POH C172P Fig 3-1 assumes windmilling)
  const propStopped = (p.glide.points || []).every((x) => x.prop_rpm === 0);
  const pstate = propStopped ? (['c172p', 'c172r', 'c172x'].includes(m) ? '; ใบพัดของโมเดลหยุด 0 rpm (POH C172P Fig 3-1 กำหนดใบพัด windmilling ซึ่งต้านมากกว่า)' : '; ใบพัดของโมเดลหยุด 0 rpm') : (m === 'pc7' ? '; ใบพัด feather' : '');
  o.glide_best_speed = L(r(p.glide.best_kcas, 1), 'kt CAS', ['LB1', xmlSrc], `${MEAS}; เครื่องดับ แฟลป 0 4,000–5,500 ft${pstate}${p.glide.best_at_sweep_edge ? '; ค่าอยู่ที่ขอบช่วงที่กวาด (ค่าจริงของโมเดลอาจสูงกว่า)' : ''}`);
  o.glide_ld_max = L(p.glide.best_ratio, '-', ['LB1', xmlSrc], `${MEAS}; V_h/|ḣ| ที่ความเร็วร่อนดีสุด${pstate}`);
  const cr = {};
  for (const c of p.cruise || []) {
    const k = `${c.h_ft}ft_${c.mode === 'full' ? 'full' : c.mode === 'rpm' ? `${c.target}rpm` : `${c.target}hp`}`;
    if (cr[k]) continue;
    cr[k] = { ktas: c.ktas, kcas: c.kcas, h_avg_ft: c.h_avg, ...(c.hp != null ? { power_kW: r(c.hp * HP, 1), power_hp: c.hp } : {}) };
  }
  o.cruise = L(cr, 'kt TAS / kt CAS / kW', ['LB1', xmlSrc], `${MEAS}; บินระดับ (ถ้า h_avg_ft ต่างจากเป้าแปลว่ารักษาความสูงไม่ได้); mixture best power`);
  const st = p.static;
  o.static_full_throttle = L({ ...(st.engine_rpm != null ? { engine_rpm: st.engine_rpm } : {}), ...(st.prop_rpm != null ? { prop_rpm: st.prop_rpm } : {}),
    ...(st.hp != null ? { power_kW: r(st.hp * HP, 1), power_hp: st.hp } : {}), thrust_N: r(st.thrust_lb * LBF, 0), thrust_lbf: st.thrust_lb },
  '-', ['LB1', xmlSrc, 'LB8'], `${MEAS}; SL ISA เบรก คันเร่งสุด 10 s${st.vc_kts > 1 ? `; ล้อไถลกับเบรก (${st.vc_kts} kt)` : ''}`);
  const to = p.takeoff;
  o.takeoff = L(to.ground_roll_ft == null ? 'ไม่ยกตัวภายใน 120 s' : { ground_roll_m: r(to.ground_roll_ft * FT, 0), over50ft_m: r(to.over50_ft * FT, 0), v_liftoff_kcas: to.v_liftoff_kcas, flap_deg: to.flap_deg },
    to.ground_roll_ft == null ? '-' : 'm / kt CAS', ['LB1', xmlSrc],
    `${MEAS}; SL ISA ลมสงบ แฟลป ${to.flap_deg} VR ${to.vr_kcas} KCAS θ ${to.theta_rot_deg}°${to.ground_roll_ft == null ? '' : `; ${fmt(to.ground_roll_ft)} / ${fmt(to.over50_ft)} ft`}; ขึ้นกับนักบินจำลอง`, 'กลาง');
  o.aero_static = L({ CL0: aero(m, 'CL0'), CLalpha_per_rad: aero(m, 'CLalpha_per_rad', 3), CLmax: aero(m, 'CLmax', 3), CDmin: aero(m, 'CDmin'), Cmalpha_per_rad: aero(m, 'Cmalpha_per_rad', 3) },
    '- (CLalpha, Cmalpha ต่อ rad)', ['LB1', xmlSrc], `${MEAS}; lb_aero.py กวาด α −6…24° ไม่มีกำลัง q = α̇ = 0 elevator 0; key ย่อย = มุมแฟลป`);
  const codes = [...new Set(CMP.filter((c) => c.model === m).flatMap((c) => c.src.match(/\bL[A-Z]\d+\b/g) || []))];
  o.poh_verdict = L(verdicts(m), '-', codes,
    `จำนวนรายการใน lb_compare.json ตามเกณฑ์ ≤5% ตรง, 5–15% ใกล้, >15% ไม่ตรง (03.3)${['c172p', 'c172x', 'c172r', 'fg_c152'].includes(m) ? '; ความเร็ว stall เทียบกับค่า CG หน้าสุดของ POH Fig 5-3' : ''}`);
  Object.assign(o, extra);
  return o;
}

const sim = (v, src, note, conf = 'สูง') => L(v, '-', src, note, conf);
const blocks = [];
// ---------------- c172s (JSBSim and FlightGear models of the C172 family; none is a 172S)
blocks.push({ c172s: {
  otherSims: {
    jsbsim_c172p: sim({ file: 'aircraft/c172p/c172p.xml', package: 'jsbsim 1.3.3 (PyPI)', rev: '$Id 1.29 2013-10-25', represents: 'C172P (ไม่ใช่ 172S)', author: 'Unknown', licence: 'ไม่ระบุในไฟล์', engine: 'eng_io320 (bsfc 0.32 → 205.9 hp จาก 160 hp)', use: 'fixture ของ oracle เท่านั้น' }, ['LB1', 'LB2', 'LB8'], 'อ่านหัวไฟล์และรันวัด (03.2); ห้ามคัดลอก XML ลง repo'),
    jsbsim_c172r: sim({ file: 'aircraft/c172r/c172r.xml', package: 'jsbsim 1.3.3 (PyPI)', rev: '$Id 1.20 2012-12-22', represents: 'C172R (โครงลำ) + เครื่อง 180 hp 2,700 rpm ซึ่งตรงพิกัดของ 172S', author: 'Unknown', licence: 'ไม่ระบุในไฟล์', use: `fixture; ใกล้ POH ที่สุดในตระกูล (${verdicts('c172r')['ตรง']} ตรง ${verdicts('c172r')['ใกล้']} ใกล้ ${verdicts('c172r')['ไม่ตรง']} ไม่ตรง)`, results_at: 'c172r.validation.openModels.jsbsim_c172r' }, ['LB1', 'LB3', 'LB12'], 'อ่านหัวไฟล์และรันวัด (03.2–03.3); ผลวัดย้ายไปไว้ใต้บัตร c172r ตอนแก้ช่องว่าง 28 (บัตร c172s ไม่ได้ใช้ผลชุดนี้)'),
    jsbsim_c172x: sim({ file: 'aircraft/c172x/c172x.xml', package: 'jsbsim 1.3.3 (PyPI)', rev: 'Rev 1.91', represents: '1982 C172P ตามหัวไฟล์', author: 'Tony Peden', licence: 'GPL', defect: 'แรงยกนับซ้ำ CLα 9.99/rad', use: 'oracle ของสมการในรอบที่ 1 เท่านั้น ห้ามใช้เป็นเป้าสมรรถนะ' }, ['LB1', 'LB4'], 'อ่านหัวไฟล์และรันวัด (03.2.3 ข้อ 1)'),
    flightgear_c172p: sim({ repo: 'github.com/c172p-team/c172p', licence: 'GPL-2.0', commit_tried: '10a26158b6456244d84cbac27e6882bdc807f98c (2026-11-16)', fdm: 'JSBSim c172p.xml $Id 1.41 (2018)', engines: ['eng_io320 160 hp', 'eng_io360 180 hp'], bsfc: 'ปิดไว้ในไฟล์เครื่องยนต์ทั้งสอง', poh_refs: ['172P 1982 POH p6-10', '172S 1998 POH p6-12'], published_poh_validation: 'ไม่พบ', measured_here: false, why_not: 'jsbsim 1.3.3 (Python) ปิดโปรเซสทันที (C++ terminate) ระหว่างโหลดโมเดลนี้; หมดเวลาที่กำหนดไว้ ~20 นาทีต่อโมเดลก่อนหาสาเหตุได้' }, ['LB18'], 'อ่านไฟล์ใน repo; พยายามรันวัดตอนแก้ช่องว่าง 14 (2026-11-19) แต่โหลดไม่ผ่าน; "ไม่พบผลเทียบ" ค้นเฉพาะ README และหน้า repo', 'กลาง'),
    closed_sims: sim({ xplane12: 'ไม่เผยแพร่ผลเทียบ POH ของ C172 เป็นตัวเลข; proprietary', msfs: 'ไม่เผยแพร่เป้าสมรรถนะของเครื่องที่มากับซิม; proprietary', geofs: 'ปิดซอร์ส ไม่มีเอกสารฟิสิกส์' }, ['R1:S14', 'R1:S15', 'R1:S19', 'R1:S26', 'LB26'], 'อ้างแนวคิดได้ ห้ามใช้ไฟล์เครื่องบิน (03.4.2)', 'กลาง'),
  },
  validation: { openModels: {
    jsbsim_c172p: openModel('c172p', 'LB2', { cruise_ktas_at_120hp_8000ft: L(120.9, 'kt TAS', ['LB1', 'LB2'], `${MEAS}; interpolate ระหว่าง 2,500 และ 2,600 rpm ที่ 8,000 ft; POH 75% 120 KTAS [LB10]`) }),
    jsbsim_c172x: openModel('c172x', 'LB4', { cruise_ktas_at_120hp_8000ft: L(116.3, 'kt TAS', ['LB1', 'LB4'], `${MEAS}; interpolate ที่ 120 hp; POH 120 KTAS [LB10]`) }),
  } },
} });
// ---------------- pa28_180
blocks.push({ pa28_180: {
  _na: { v: ['*'], u: '-', scope: 'aircraft', src: [], conf: 'สูง', est: false, note: 'id นี้มีไว้เก็บผลเทียบของโมเดลเปิด pa28 (JSBSim) เท่านั้น ไม่ใช่บัตรของแบบที่โรงเรียนไทยใช้ (บัตร PA-28 คือ pa28_161 ในหัวข้อ 13); ทุก path ต่อแบบของรอบที่ 1 จึงไม่มีโดยเจตนา (D5)' },
  otherSims: { jsbsim_pa28: sim({ file: 'aircraft/pa28/pa28.xml', package: 'jsbsim 1.3.3 (PyPI)', rev: 'Rev 1.18', represents: 'PA28-180 ตามชื่อใน fdm_config', author: 'Unknown', licence: 'ไม่ระบุในไฟล์', defects: ['ใบพัดปรับมุม propC8v (เครื่องจริง fixed pitch)', 'elevator หมดระยะที่ CL ≈ 0.99', 'ΔCL แฟลป 25° = +0.016', 'FGTrim ไม่ผ่าน', 'บินระดับที่ 8,000 ft ไม่ได้', 'เครื่องหมาย Clr −0.1665, Cldr −0.0192 และ Cnda +0.0068 (proverse) ขัดกับฟิสิกส์และนิยามของ AC (Clr > 0, Cldr > 0, Cnda < 0)'], use: 'ห้ามใช้เป็นแหล่งตัวเลขของ PA-28' }, ['LB1', 'LB5', 'LB13'], 'อ่านหัวไฟล์และรันวัด (03.2.3 ข้อ 4, 03.3.2)') },
  validation: { openModels: { jsbsim_pa28: openModel('pa28', 'LB5', {
    level_flight_8000ft: L('บินระดับไม่ได้ที่ 70–140 KCAS แม้คันเร่งสุด (จม 274–1,922 fpm)', '-', ['LB1', 'LB5'], `${MEAS}; preq ใน lb_perf_pa28.json; เพดานบินจริง 14,150 ft [LB13]`) }) } },
} });
// ---------------- pc7mk2 (the JSBSim model is a PC-7, not a Mk II)
blocks.push({ pc7mk2: {
  otherSims: { jsbsim_pc7: sim({ file: 'aircraft/pc7/pc7.xml', package: 'jsbsim 1.3.3 (PyPI)', rev: 'Rev 1.18 (2016-06-06)', represents: 'PC-7 รุ่นแรก PT6A 550 hp (ไม่ใช่ Mk II)', author: 'Aeromatic v 3.3.0', licence: 'ไม่ระบุในไฟล์', geometry_matches_public: 'S 16.6 m², b 10.40 m, น้ำหนักเปล่า 1,330 kg', defects: ['Cmα ไม่มีกำลังเป็นบวก (+0.25/rad แฟลป 0) เพราะ term Pitch_propwash คูณ thrust-coefficient ที่ค้าง −0.30 ขณะใบพัดหยุด 0 rpm', 'ROC ต่ำกว่าข้อมูลสาธารณะ 43%', 'บินระดับที่ 20,000 ft ไม่ได้'], use: 'fixture เท่านั้น' }, ['LB1', 'LB6', 'LB14'], 'อ่านหัวไฟล์และรันวัด (03.2.3 ข้อ 5, 03.3.3)'),
    flightgear_pc7: sim({ repo: 'github.com/FGMEMBERS/pc7', licence: 'GPL-3.0 (ไฟล์ COPYING)', fdm: 'JSBSim PC-7.xml โดย Aeromatic v3.3.8 (2016, Rev 1.17, ALPHA) ตระกูลเดียวกับ pc7 ของ JSBSim', represents: 'PC-7 รุ่นแรก (ไม่ใช่ Mk II)', authors_set: 'Erik Hofman, Petar Jedvaj, Ernest Teuscher (based on David Culp\'s PC-7)', published_poh_validation: 'ไม่พบ', measured_here: false }, ['LB28'], 'อ่านหัวไฟล์ FDM และไฟล์ set ไม่ได้รันวัด; ขนาดและน้ำหนักเปล่าในไฟล์เท่ากับ pc7 ของ JSBSim (เพิ่มตอนตรวจทาน)', 'กลาง'),
    open_models_mk2: sim({ found: 'แพ็กเกจ FlightGear PC-9M [LB27] มีไฟล์ PC-7mk2-set.xml ("Pilatus PC-7 mk2") และ pc7-set.xml ("Pilatus PC-7") แบบ variant-of PC-9M ซึ่งใช้ FDM PC-9M.xml เดียวกัน', engine: 'ที่ commit 8cf7c87 FDM มีแค่ชุด PT6A-25 + ใบพัด 3 ใบที่ไม่ถูก comment ออก ทุกรุ่นย่อยจึงบินด้วยเครื่องและอากาศพลศาสตร์เดียวกัน (ไม่มีการปรับเฉพาะ MkII)', results_at: 'pc9m.validation.openModels.flightgear_pc9m (มวล 2,350 kg ของ PC-9M)', dedicated_mk2_model: 'ไม่พบ' }, ['LB23', 'LB27'], 'ค้น GitHub 2026-11-18; ตรวจ FGMEMBERS ตอนตรวจทาน; อ่านไฟล์ set และรัน FDM ตอนแก้ช่องว่าง 14 (2026-11-19)', 'กลาง') },
  validation: { openModels: { jsbsim_pc7: openModel('pc7', 'LB6') } },
} });
// ---------------- t6a
blocks.push({ t6a: {
  otherSims: {
    jsbsim_t6texan2: sim({ file: 'aircraft/t6texan2/t6texan2.xml', package: 'jsbsim 1.3.3 (PyPI)', rev: 'Rev 1.14', author: 'Aeromatic / David Culp', licence: 'ไม่ระบุในไฟล์', defects: ['เครื่องยนต์ PT6A-68.xml เป็น turbine (jet) แรงขับ 2,464 lbf ไม่มีใบพัด', 'ตาราง CL(α) และแฟลปเหมือน C172', 'ใส่น้ำหนักได้สูงสุด 6,000 lb'], empty_weight: '5,000 lb ตรงกับ Navy fact file (Wikipedia 4,707 lb)', use: 'fixture เท่านั้น' }, ['LB1', 'LB7', 'LB8', 'LB16'], 'อ่านหัวไฟล์และรันวัด (03.2.3 ข้อ 6)'),
    flightgear_t6: sim({ repo: 'github.com/RobAndrew96/T-6-Texan-II', licence: 'ไม่ระบุ (ห้ามนำมาใช้)', content: '1 commit; โฟลเดอร์ PC-9M เป็นสำเนาแพ็กเกจ PC-9M ของ FlightGear (PC-9M.xml ตรงกับ FGMEMBERS/PC-9M ทุกบรรทัด) มี T-6-set.xml เป็น variant-of PC-9M', commit: 'bda592916b5453aee8eb70f7155661d5dd841ec0 (2024-01-11, commit เดียว)', measured_here: false, results_at: 'pc9m.validation.openModels.flightgear_pc9m (FDM เดียวกัน)' }, ['LB21', 'LB27'], 'อ่านหัวไฟล์ตอนตรวจทาน; ยืนยันวันที่ด้วย git 2026-11-19; ไฟล์ต้นฉบับ GPL อยู่ที่ FGMEMBERS จึงอ้างต้นฉบับแทน', 'กลาง'),
    flightgear_t6_fgmembers: sim({ repo: 'github.com/FGMEMBERS/T-6', commit: '15837eeccf087353a1636992ded82585f87d5dbb (2015-05-08)', licence: 'GPL-2.0 (ไฟล์ COPYING)', fdm: 'JSBSim T-6.xml โดย Petar Jedvaj (2011, Rev 1.9, BETA)', set: 'ผู้สร้าง Rob Dosogne สถานะ development', engine: 'PT6A-68 แบบ turbine (jet) + thruster direct ไม่มีใบพัด (เหมือน t6texan2)', mass: 'น้ำหนักเปล่า 3,564 lb; ถัง + pointmass ใส่ได้ถึง 5,564 lb (MTOW 6,500 lb)', published_poh_validation: 'ไม่พบ', measured_here: true, results_at: 't6a.validation.openModels.flightgear_t6' }, ['LB29'], 'รันวัดด้วย jsbsim 1.3.3 ตอนแก้ช่องว่าง 14 (2026-11-19)', 'กลาง'),
  },
  validation: { openModels: { jsbsim_t6texan2: openModel('t6texan2', 'LB7'),
    flightgear_t6: openModel('fg_t6', 'LB29', { remark: L('ห้ามใช้เป็นเป้า: แรงขับแบบ jet ทำให้ ROC 8,521 fpm (สาธารณะ 3,100 [LP23]) และ 324 KTAS ที่ 1,000 ft (270 kt [LB16]); น้ำหนักเปล่า 3,564 lb ต่ำกว่า fact file 5,000 lb [LB16] (03.3.6)', '-', ['LB29', 'LB16', 'LP23'], MEAS, 'กลาง') }) } },
} });
// ---------------- da40ng, da42ng, pc9m (FlightGear only / none found)
blocks.push({ da40ng: { otherSims: {
  jsbsim_bundled: sim('ไม่มีใน JSBSim 1.3.3', ['LB1'], 'ตรวจรายการเครื่องบินในแพ็กเกจ'),
  flightgear_da40ng: sim({ repo: 'github.com/sryu1/DA40', commit: '0d50a457edb203b9ac6058b41cac1b33922acf28 (2025-04-09)', licence: 'GPL-2.0 (ไฟล์ COPYING)', fdm: 'da40ng-jsb.xml โดย Aeromatic v 3.3.10 (2019, รุ่น 10/2021, ALPHA)', refs: 'ขนาดและน้ำหนักอ้างหน้า AFM ("ref. 1")', note_izz: 'Izz 5,000 slug·ft² ปรับให้เลี้ยวบนพื้นง่าย "source needed"', run_adapter: 'FCS อ่านคันเร่งจาก /controls/engines/engine[0]/throttle และ FADEC อ่านความสูงจาก /position/altitude-ft ของ FlightGear; lb_jsb.FGProxy ส่งค่าให้', published_poh_validation: 'ไม่พบ', measured_here: true, results_at: 'da40ng.validation.openModels.flightgear_da40ng' }, ['LB19'], 'รันวัดด้วย jsbsim 1.3.3 ตอนแก้ช่องว่าง 14 (2026-11-19); ค่าเรขาคณิตให้อ้าง AFM ต้นทาง', 'กลาง'),
  flightgear_da40ng_fg1000: sim({ repo: 'github.com/CMDR-DiTRay/FGFS-DA40', licence: 'GPL-2.0', last_commit: 'a88e934c0eeb3949ba9f2e02a2bf9c9b7005d7be (2023-11-19)', measured_here: false }, ['LB20'], 'ยืนยันวันที่ด้วย git ตอนแก้ช่องว่าง (2026-11-19); ไม่ได้อ่าน FDM', 'กลาง'),
},
validation: { openModels: { flightgear_da40ng: openModel('fg_da40ng', 'LB19', {
  remark: L('ห้ามใช้เป็นเป้า: ตาราง CL ของโมเดลขึ้นอีกหลัง α 24° การลดความเร็วจึงจบที่ α 36° CL 2.15 และ VS ต่ำกว่า AFM 22–24%; L/D 13.5 เทียบ 9.7; ส่วน ROC (646 เทียบ 651 fpm), ความเร็วเต็มกำลังที่ 16,000 ft (154.4 เทียบ 154 KTAS) และกำลังสถิตตรง (03.3.6)', '-', ['LB19', 'LD3', 'LD4'], MEAS, 'กลาง') }) } },
} });
// review 2026-11-19: the FGMEMBERS mirror of FlightGear aircraft has DA42 (YASim) and PC-9M (JSBSim) models that the first search missed
blocks.push({ da42ng: { otherSims: {
  open_models: sim('JSBSim 1.3.3 ไม่มี DA42; FlightGear มีโมเดล YASim ของ DA 42-VI [LB30] (ไม่มีโมเดล JSBSim ของ DA42 ที่พบ)', ['LB1', 'LB23', 'LB30'], 'ค้น GitHub 2026-11-18 ได้ 0 รายการ; ตรวจ FGMEMBERS ตอนตรวจทาน 2026-11-19 พบ Diamond-DA42; oracle ของสมการยังต้องสร้าง JSBSim XML เอง', 'กลาง'),
  flightgear_da42: sim({ repo: 'github.com/FGMEMBERS/Diamond-DA42', licence: 'GPL-2.0 (ไฟล์ COPYING)', fdm: 'YASim da42-yasim.xml (E. Baranger และคณะ v0.96 ปี 2016, Beta)', represents: 'DA 42-VI', yasim_targets: 'approach 55 kt ที่ AoA 4° / cruise 190 kt ที่ 16,000 ft / mass 1,700 lb (ค่าที่ผู้สร้างกรอก YASim แก้สัมประสิทธิ์ให้ตรงสองจุดนี้)', remark: 'approach 55 kt ต่ำกว่า VS0 62 KIAS และ VREF 84 KIAS ของ DA42 NG ในหัวข้อ 06 จึงใช้เป็นแหล่งตัวเลขไม่ได้', published_poh_validation: 'ไม่พบ', measured_here: false }, ['LB30', 'LT2', 'LT9'], 'อ่านไฟล์ set และ YASim config ไม่ได้รันวัด (YASim รันด้วยแพ็กเกจ jsbsim ไม่ได้ ต้องใช้ FlightGear)', 'กลาง'),
} } });
const D9 = DER.derivatives.conditions; const DK = ['alpha_trim_deg', 'elevator_trim_deg', 'CL_trim', 'CLalpha', 'Cmalpha', 'CLq', 'Cmq', 'CLadot', 'Cmadot', 'CYb', 'Clb', 'Cnb', 'CYp', 'Clp', 'Cnp', 'CYr', 'Clr', 'Cnr', 'CLde', 'Cmde', 'Clda', 'Cnda', 'CYdr', 'Cldr', 'Cndr'];
const pick = (c) => ({ kcas: c.kcas, h_ft: c.h_ft, flap_deg: c.flap, gear_down: c.gear_down, ...Object.fromEntries(DK.map((k) => [k, c[k]])) });
const chk = DER.dsto_marked_constants.readme_check.results; const chkd = chk.filter((c) => c.match !== undefined);
blocks.push({ pc9m: {
  otherSims: {
    open_models: sim('JSBSim 1.3.3 ไม่มี PC-9; FlightGear มีโมเดล JSBSim ของ PC-9M [LB27] (รันวัดแล้ว 2026-11-19)', ['LB1', 'LB23', 'LB27'], 'ค้น GitHub 2026-11-18 ได้ 0 รายการ; ตรวจ FGMEMBERS ตอนตรวจทาน 2026-11-19 พบ PC-9M', 'กลาง'),
    flightgear_pc9m: sim({ repo: 'github.com/FGMEMBERS/PC-9M', commit: '8cf7c875d7d4e3d0eaadd28f358c0c422ecb927f (2019-09-22)', licence: 'ไม่มีไฟล์ COPYING ที่ราก repo; PC9-shared.xml ใช้โลโก้ GPLv3 (ถือเป็น GPL-3.0 จนกว่าจะยืนยัน)', fdm: 'JSBSim PC-9M.xml โดย Erik Hofman, David Culp (2011, Rev 1.9, BETA)', refs: 'หัวไฟล์อ้าง DSTO-TR-0479 (van Bronswijk และคณะ, อนุพันธ์จากการบินทดสอบ PC-9/A) = [LP26] ของหัวข้อ 07', engines: 'ที่ commit นี้ชุด PT6A-62 และ PT6A-68 (ใบพัด 4 ใบ) ถูก comment ออก เหลือ PT6A-25 + ใบพัด 3 ใบ (ชุดของ PC-7) ที่ทุกรุ่นย่อยใช้', variants: 'PC-9M, PC-9A, PC-7mk2, pc7, T-6 (ไฟล์ set แบบ variant-of PC-9M ใช้ FDM เดียวกัน)', status: 'set 1.4.0; วิกิ FlightGear: early production', published_poh_validation: 'ไม่พบ', measured_here: true, results_at: 'pc9m.validation.openModels.flightgear_pc9m', handover_file: 'scripts/out/lb_pc9m_fg.json' }, ['LB27', 'LB34', 'LP26'], 'รันวัดด้วย jsbsim 1.3.3 ตอนแก้ช่องว่าง 14 (2026-11-19)', 'กลาง'),
  },
  validation: { openModels: { flightgear_pc9m: openModel('fg_pc9m', 'LB27', {
    derivatives: L({ cruise: pick(D9.cruise), approach: pick(D9.approach) }, '- (ต่อ rad; q และ α̇ ใช้ c̄/2V, p และ r ใช้ b/2V; มุม deg; kcas kt CAS; h_ft ft)', ['LB27', 'LB1'],
      `${MEAS}; lb_derivs.py: finite difference รอบ trim 1 g ไม่มีกำลัง โมเมนต์รอบ CG ที่โหลด (${D9.cruise.cg_x_in} in ในพิกัดของโมเดล) มวล 2,350 kg; เครื่องหมายแบบ AC; δe ต่อ fcs/elevator-pos-rad, δa ต่อ left-aileron-pos-rad, δr ต่อ rudder-pos-rad; รายละเอียดและสภาพทดสอบใน scripts/out/lb_pc9m_fg.json`, 'กลาง'),
    dsto_marked: L({ constants: DER.dsto_marked_constants.values.length, tables: DER.dsto_marked_constants.tables.length, readme_checked: chkd.length, readme_match: chkd.filter((c) => c.match).length,
      readme_differs: chkd.filter((c) => !c.match).map((c) => c.function.split('/').pop()) }, '-', ['LB27', 'LP26'],
      'ค่าใน PC-9M.xml ที่มี comment "DSTO" เทียบกับตารางที่ผู้สร้างถอดจาก DSTO-TR-0479 ไว้ใน README ของ repo (ยังไม่ได้เทียบกับรายงานต้นฉบับเพราะเปิดไฟล์ DTIC ไม่ได้); ค่าคงที่เดี่ยวอ้างได้พร้อมเลขบรรทัดใน lb_pc9m_fg.json ตารางไม่คัดลอก', 'กลาง'),
    remark: L('ห้ามใช้สมรรถนะเป็นเป้า: เครื่องยนต์ในโมเดลเป็น PT6A-25 513.6 hp (PC-9M จริง PT6A-62 950 shp) แต่ใบพัดให้ T·V/P ≈ 1.8 และแรงขับสถิต 4,256 lbf จึงไต่ 5,458 fpm เกินค่าสาธารณะ 33% ขณะที่ความเร็วสูงสุดที่ 20,000 ft ต่ำกว่า 20%; การร่อนต่ำกว่า ~113 KCAS ใช้ไม่ได้เพราะ thrust coefficient ค้างเมื่อใบพัดหยุด (03.3.6)', '-', ['LB27', 'LP2', 'LP12'], MEAS, 'กลาง') }) } },
} });
// ---------------- types added after the first draft (Thai-school cards 10-12, ops/procedures ids): open models found during the review
blocks.push({ c172r: {
  otherSims: {
    jsbsim_c172r_ref: sim({ results_at: 'c172r.validation.openModels.jsbsim_c172r', file: 'aircraft/c172r/c172r.xml', represents: 'โครงลำ C172R แต่เครื่อง engIO360C 180 hp 2,700 rpm (C172R จริง IO-360-L2A 160 hp 2,400 rpm)', use: 'fixture เท่านั้น ห้ามใช้เป็นเป้าของบัตร c172r' }, ['LB1', 'LB3', 'LB11'], 'ผลวัดอยู่ใต้ c172r.validation.openModels ตั้งแต่การแก้ช่องว่าง 28 (2026-11-19); ก่อนหน้านี้อยู่ใต้ c172s'),
  },
  validation: { openModels: {
    jsbsim_c172r: openModel('c172r', 'LB3', { cruise_ktas_at_128hp_8000ft: L(124.4, 'kt TAS', ['LB1', 'LB3'], `${MEAS}; interpolate ที่ 80% ของ 160 hp; POH 122 KTAS [LB11]`),
      stall_basis: L({ vs1_ref_kcas: 52, vs0_ref_kcas: 47, cg: 'หน้าสุด' }, 'kt CAS', ['LE3'], `ฐานที่ใช้เทียบ VS (POH Fig 5-3 2,450 lb power off CG หน้าสุด ตามบัตร 10-c172r); หน้า spec [LB11] ให้ 51 KCAS ซึ่งเป็นค่า CG หลังสุด; โมเดลวัดได้ ${P.c172r.stall['0'].vs_kcas} / ${P.c172r.stall['30'].vs_kcas} KCAS ที่ CG ${P.c172r.stall['0'].cg_x_in} in ในพิกัดของโมเดล (เทียบกับ datum ของ POH ไม่ได้)`) }),
  } },
} });
blocks.push({ c152: { otherSims: {
  jsbsim_bundled: sim('ไม่มีใน JSBSim 1.3.3', ['LB1'], 'ตรวจรายการเครื่องบินในแพ็กเกจ (เพิ่มตอนตรวจทาน)'),
  flightgear_c152: sim({ repo: 'github.com/FGMEMBERS/c152', commit: 'b8286b92050c4b77050ea262f6d2dedcc587b219 (2017-12-16)', licence: 'GPL-2.0 (ไฟล์ LICENSE)', fdm: 'JSBSim c152.xml โดย Aeromatic v0.95 (2015-10-04, Rev 1.15, ALPHA)', represents: 'Cessna 152 II', authors: 'README: Adrián Fernández (3D), Gilberto Agostinho (texture, โปรแกรม)', published_poh_validation: 'ไม่พบ', measured_here: true, results_at: 'c152.validation.openModels.flightgear_c152' }, ['LB32'], 'รันวัดด้วย jsbsim 1.3.3 ตอนแก้ช่องว่าง 14 (2026-11-19); สัมประสิทธิ์จาก Aeromatic (ประมาณจากเรขาคณิต)', 'กลาง'),
},
validation: { openModels: { flightgear_c152: openModel('fg_c152', 'LB32', {
  remark: L('ห้ามใช้เป็นเป้า: Vy 95 KCAS และ ROC 942 fpm เพราะใบพัด fixed pitch หมุนเกิน redline (2,805 rpm ที่ 95 KCAS); L/D 12.7 เทียบ 9.1 ของกฎ FAA และ 132 KTAS ที่ 75% เทียบ 107 แปลว่าแรงต้านต่ำเกินจริง; ความเร็ว stall สูงกว่า POH 10–13% (03.3.6)', '-', ['LB32', 'LF1', 'LF6'], MEAS, 'กลาง') }) } },
} });
blocks.push({ p2006t: { otherSims: {
  jsbsim_bundled: sim('ไม่มีใน JSBSim 1.3.3', ['LB1'], 'ตรวจรายการเครื่องบินในแพ็กเกจ (เพิ่มตอนตรวจทาน)'),
  flightgear_p2006t: sim({ repo: 'github.com/FGMEMBERS/Tecnam-P2006T', licence: 'GPL-2.0 (ไฟล์ COPYING)', fdm: 'YASim p2006t-yasim.xml (E. Baranger, v0.1, Alpha)', yasim_targets: 'approach 47 kt ที่ AoA 4° / cruise 135 kt ที่ 5,000 ft / mass 1,675 lb (ค่าที่ผู้สร้างกรอก)', remark: 'approach 47 kt ต่ำกว่า VS0 53 KIAS ของ AFM ในหัวข้อ 12 จึงใช้เป็นแหล่งตัวเลขไม่ได้', published_poh_validation: 'ไม่พบ', measured_here: false }, ['LB31', 'LG16', 'LG4'], 'อ่านไฟล์ set และ YASim config ไม่ได้รันวัด (YASim รันด้วยแพ็กเกจ jsbsim ไม่ได้) (เพิ่มตอนตรวจทาน ตามงานที่หัวข้อ 12 ฝากไว้)', 'กลาง'),
} } });
blocks.push({ pa28_161: { otherSims: {
  jsbsim_bundled: sim('JSBSim 1.3.3 มีแค่ pa28 (ชื่อ PA28-180) ซึ่งใช้เป็นแหล่งตัวเลขไม่ได้ (03.3.2); ผลวัดอยู่ใต้ pa28_180', ['LB1', 'LB5'], 'เพิ่มตอนตรวจทาน'),
  flightgear_pa28: sim({ wiki: 'wiki.flightgear.org/Piper_PA28_Warrior_II', licence: 'GPLv2+ (infobox ของวิกิ)', fdm: 'JSBSim', authors: 'Josh Davidson (Octal450), legoboyvdlp, D-ECHO, Knüppelrührer', status: 'Advanced production', variants: 'PA28-161 เครื่อง O-320-D3G 160 hp และตัวเลือก O-360-A4A 180 hp', mirror_fgmembers: 'github.com/FGMEMBERS/pa28-161 commit b1f3e3d (2019-09-22) เป็นโมเดลอีกตัวแบบ YASim (pa28-161.xml) รันด้วยแพ็กเกจ jsbsim ไม่ได้', published_poh_validation: 'ไม่พบในหน้าวิกิ', measured_here: false }, ['LB33'], 'อ่านหน้าวิกิตอนตรวจทาน; เปิดสำเนา FGMEMBERS ตอนแก้ช่องว่าง 14 (2026-11-19) พบว่าเป็น YASim', 'กลาง'),
  flightgear_pa28_warrior_jsbsim: sim({ repo: 'github.com/FGDATA/PA28-Warrior', commit: '6b57d69a6b048dd216a09de5b27c2f004014cf0c (2018-09-04)', licence: 'GPL-2.0 (ไฟล์ LICENSE; หัวไฟล์ Copyright (c) 2018 Joshua Davidson)', fdm: 'JSBSim WarriorII-160.xml และ WarriorII-180.xml (metrics, mass_balance และ aerodynamics แยกไฟล์ด้วย file=)', measured_here: false, why_not: 'ต้องเขียนตัวต่อเพิ่ม: FCS อ่าน /controls/flight/* และ /velocities/airspeed-kt ของ FlightGear, elevator ออกเป็น fcs/elevator-deg แทน elevator-pos-rad และ lb_jsb.xml_facts ยังไม่ตามไฟล์ที่ include; เกินเวลาที่กำหนด ~20 นาทีต่อโมเดล (งาน P2 ใน 03.10)' }, ['LB35'], 'พบตอนแก้ช่องว่าง 14 (2026-11-19) ขณะหา JSBSim FDM ของ PA28-161; ดึงไว้นอก repo ไม่ได้รันวัด', 'กลาง'),
} } });

// pretty-print: one leaf per line, nested groups indented
const isLeaf = (o) => o && typeof o === 'object' && !Array.isArray(o) && 'v' in o && 'scope' in o;
function pp(o, ind = '') {
  if (isLeaf(o) || typeof o !== 'object' || o === null) return JSON.stringify(o);
  const keys = Object.keys(o); const i2 = ind + ' ';
  return '{\n' + keys.map((k, n) => `${i2}${JSON.stringify(k)}: ${pp(o[k], i2)}${n < keys.length - 1 ? ',' : ''}`).join('\n') + '\n' + ind + '}';
}
const md = blocks.map((b) => '```json\n' + pp(b) + '\n```').join('\n\n');
writeFileSync(new URL('lb_json.md', OUT), md + '\n');
console.log(md);
