// lb_json.mjs - build the topic-03 JSON data blocks (<id>.otherSims.* and <id>.validation.openModels.*) from the
// JSBSim fixtures in scripts/out/ (lb_perf_<model>.json, lb_aero.json, lb_compare.json) and print them as markdown
// ```json fences, one top-level type id per block (schema-ext-r2.md §2). Also writes scripts/out/lb_json.md.
// Review 2026-11-19: loading/fuel-burn note, glide propeller state, FlightGear models found in the FGMEMBERS mirror
// (PC-9M, pc7, T-6, Diamond-DA42, Tecnam-P2006T, c152, PA28) and otherSims for c172r, c152, p2006t, pa28_161.
// Run: node scripts/lb_json.mjs   (Node >= 18, no dependencies). Units: speeds kt CAS / kt TAS (schema §1), other
// quantities SI (m, m/s, kW, N) with the aviation value in note.
import { readFileSync, writeFileSync } from 'node:fs';
const OUT = new URL('./out/', import.meta.url);
const rd = (f) => JSON.parse(readFileSync(new URL(f, OUT), 'utf8'));
const MODELS = ['c172p', 'c172r', 'c172x', 'pa28', 'pc7', 't6texan2'];
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
  `สภาพการรันของ lb_perf.py (03.1); CG อยู่ใน datum ของไฟล์ เทียบกับ datum ของ POH ไม่ได้${s0.not_loaded_lb > 0 ? `; ใส่น้ำหนักได้แค่ ${fmt(r(s0.w_lb, 0))} lb จาก MTOW ${fmt(p.mtow_lb)} lb (ไม่มี pointmass ให้ใส่อีก ${fmt(s0.not_loaded_lb)} lb)` : p.mtow_lb !== r(s0.w_lb, 0) ? `; ใส่ครบ MTOW ${fmt(p.mtow_lb)} lb แต่น้ำหนัก ณ เริ่มทดสอบเหลือ ${fmt(r(s0.w_lb, 0))} lb เพราะเชื้อเพลิงลดระหว่างบินนิ่ง 25 s แทน FGTrim` : ''}`);
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
  o.poh_verdict = L(verdicts(m), '-', ['LB9', 'LB10', 'LB11', 'LB13', 'LB14', 'LB16'].filter((x) => CMP.some((c) => c.model === m && c.src.includes(x))),
    'จำนวนรายการใน lb_compare.json ตามเกณฑ์ ≤5% ตรง, 5–15% ใกล้, >15% ไม่ตรง (03.3)');
  Object.assign(o, extra);
  return o;
}

const sim = (v, src, note, conf = 'สูง') => L(v, '-', src, note, conf);
const blocks = [];
// ---------------- c172s (JSBSim and FlightGear models of the C172 family; none is a 172S)
blocks.push({ c172s: {
  otherSims: {
    jsbsim_c172p: sim({ file: 'aircraft/c172p/c172p.xml', package: 'jsbsim 1.3.3 (PyPI)', rev: '$Id 1.29 2013-10-25', represents: 'C172P (ไม่ใช่ 172S)', author: 'Unknown', licence: 'ไม่ระบุในไฟล์', engine: 'eng_io320 (bsfc 0.32 → 205.9 hp จาก 160 hp)', use: 'fixture ของ oracle เท่านั้น' }, ['LB1', 'LB2', 'LB8'], 'อ่านหัวไฟล์และรันวัด (03.2); ห้ามคัดลอก XML ลง repo'),
    jsbsim_c172r: sim({ file: 'aircraft/c172r/c172r.xml', package: 'jsbsim 1.3.3 (PyPI)', rev: '$Id 1.20 2012-12-22', represents: 'C172R (โครงลำ) + เครื่อง 180 hp 2,700 rpm ซึ่งตรงพิกัดของ 172S', author: 'Unknown', licence: 'ไม่ระบุในไฟล์', use: 'fixture; ใกล้ POH ที่สุดในตระกูล (3 ตรง 3 ใกล้ 1 ไม่ตรง)' }, ['LB1', 'LB3', 'LB12'], 'อ่านหัวไฟล์และรันวัด (03.2–03.3)'),
    jsbsim_c172x: sim({ file: 'aircraft/c172x/c172x.xml', package: 'jsbsim 1.3.3 (PyPI)', rev: 'Rev 1.91', represents: '1982 C172P ตามหัวไฟล์', author: 'Tony Peden', licence: 'GPL', defect: 'แรงยกนับซ้ำ CLα 9.99/rad', use: 'oracle ของสมการในรอบที่ 1 เท่านั้น ห้ามใช้เป็นเป้าสมรรถนะ' }, ['LB1', 'LB4'], 'อ่านหัวไฟล์และรันวัด (03.2.3 ข้อ 1)'),
    flightgear_c172p: sim({ repo: 'github.com/c172p-team/c172p', licence: 'GPL-2.0', fdm: 'JSBSim c172p.xml $Id 1.41 (2018)', engines: ['eng_io320 160 hp', 'eng_io360 180 hp'], bsfc: 'ปิดไว้ในไฟล์เครื่องยนต์ทั้งสอง', poh_refs: ['172P 1982 POH p6-10', '172S 1998 POH p6-12'], published_poh_validation: 'ไม่พบ', measured_here: false }, ['LB18'], 'อ่านไฟล์ใน repo ยังไม่ได้รันวัด; "ไม่พบผลเทียบ" ค้นเฉพาะ README และหน้า repo', 'กลาง'),
    closed_sims: sim({ xplane12: 'ไม่เผยแพร่ผลเทียบ POH ของ C172 เป็นตัวเลข; proprietary', msfs: 'ไม่เผยแพร่เป้าสมรรถนะของเครื่องที่มากับซิม; proprietary', geofs: 'ปิดซอร์ส ไม่มีเอกสารฟิสิกส์' }, ['R1:S14', 'R1:S15', 'R1:S19', 'R1:S26', 'LB26'], 'อ้างแนวคิดได้ ห้ามใช้ไฟล์เครื่องบิน (03.4.2)', 'กลาง'),
  },
  validation: { openModels: {
    jsbsim_c172p: openModel('c172p', 'LB2', { cruise_ktas_at_120hp_8000ft: L(120.9, 'kt TAS', ['LB1', 'LB2'], `${MEAS}; interpolate ระหว่าง 2,500 และ 2,600 rpm ที่ 8,000 ft; POH 75% 120 KTAS [LB10]`) }),
    jsbsim_c172r: openModel('c172r', 'LB3', { cruise_ktas_at_128hp_8000ft: L(124.4, 'kt TAS', ['LB1', 'LB3'], `${MEAS}; interpolate ที่ 80% ของ 160 hp; POH 122 KTAS [LB11]`) }),
    jsbsim_c172x: openModel('c172x', 'LB4', { cruise_ktas_at_120hp_8000ft: L(116.3, 'kt TAS', ['LB1', 'LB4'], `${MEAS}; interpolate ที่ 120 hp; POH 120 KTAS [LB10]`) }),
  } },
} });
// ---------------- pa28_180
blocks.push({ pa28_180: {
  otherSims: { jsbsim_pa28: sim({ file: 'aircraft/pa28/pa28.xml', package: 'jsbsim 1.3.3 (PyPI)', rev: 'Rev 1.18', represents: 'PA28-180 ตามชื่อใน fdm_config', author: 'Unknown', licence: 'ไม่ระบุในไฟล์', defects: ['ใบพัดปรับมุม propC8v (เครื่องจริง fixed pitch)', 'elevator หมดระยะที่ CL ≈ 0.99', 'ΔCL แฟลป 25° = +0.016', 'FGTrim ไม่ผ่าน', 'บินระดับที่ 8,000 ft ไม่ได้', 'เครื่องหมาย Clr −0.1665, Cldr −0.0192 และ Cnda +0.0068 (proverse) ขัดกับฟิสิกส์และนิยามของ AC (Clr > 0, Cldr > 0, Cnda < 0)'], use: 'ห้ามใช้เป็นแหล่งตัวเลขของ PA-28' }, ['LB1', 'LB5', 'LB13'], 'อ่านหัวไฟล์และรันวัด (03.2.3 ข้อ 4, 03.3.2)') },
  validation: { openModels: { jsbsim_pa28: openModel('pa28', 'LB5', {
    level_flight_8000ft: L('บินระดับไม่ได้ที่ 70–140 KCAS แม้คันเร่งสุด (จม 274–1,922 fpm)', '-', ['LB1', 'LB5'], `${MEAS}; preq ใน lb_perf_pa28.json; เพดานบินจริง 14,150 ft [LB13]`) }) } },
} });
// ---------------- pc7mk2 (the JSBSim model is a PC-7, not a Mk II)
blocks.push({ pc7mk2: {
  otherSims: { jsbsim_pc7: sim({ file: 'aircraft/pc7/pc7.xml', package: 'jsbsim 1.3.3 (PyPI)', rev: 'Rev 1.18 (2016-06-06)', represents: 'PC-7 รุ่นแรก PT6A 550 hp (ไม่ใช่ Mk II)', author: 'Aeromatic v 3.3.0', licence: 'ไม่ระบุในไฟล์', geometry_matches_public: 'S 16.6 m², b 10.40 m, น้ำหนักเปล่า 1,330 kg', defects: ['Cmα ไม่มีกำลังเป็นบวก (+0.25/rad แฟลป 0) เพราะ term Pitch_propwash คูณ thrust-coefficient ที่ค้าง −0.30 ขณะใบพัดหยุด 0 rpm', 'ROC ต่ำกว่าข้อมูลสาธารณะ 43%', 'บินระดับที่ 20,000 ft ไม่ได้'], use: 'fixture เท่านั้น' }, ['LB1', 'LB6', 'LB14'], 'อ่านหัวไฟล์และรันวัด (03.2.3 ข้อ 5, 03.3.3)'),
    flightgear_pc7: sim({ repo: 'github.com/FGMEMBERS/pc7', licence: 'GPL-3.0 (ไฟล์ COPYING)', fdm: 'JSBSim PC-7.xml โดย Aeromatic v3.3.8 (2016, Rev 1.17, ALPHA) ตระกูลเดียวกับ pc7 ของ JSBSim', represents: 'PC-7 รุ่นแรก (ไม่ใช่ Mk II)', authors_set: 'Erik Hofman, Petar Jedvaj, Ernest Teuscher (based on David Culp\'s PC-7)', published_poh_validation: 'ไม่พบ', measured_here: false }, ['LB28'], 'อ่านหัวไฟล์ FDM และไฟล์ set ไม่ได้รันวัด; ขนาดและน้ำหนักเปล่าในไฟล์เท่ากับ pc7 ของ JSBSim (เพิ่มตอนตรวจทาน)', 'กลาง'),
    open_models_mk2: sim('ไม่พบโมเดลเปิดเฉพาะ PC-7 MkII; แพ็กเกจ FlightGear PC-9M [LB27] มีรุ่นย่อย "Pilatus PC-7" (variant-of PC-9M) ที่ใช้ FDM ของ PC-9M กับชุดเครื่อง PT6A-25 ใบพัด 3 ใบ', ['LB23', 'LB27'], 'ค้น GitHub 2026-11-18; ตรวจ FGMEMBERS เพิ่มตอนตรวจทาน 2026-11-19', 'กลาง') },
  validation: { openModels: { jsbsim_pc7: openModel('pc7', 'LB6') } },
} });
// ---------------- t6a
blocks.push({ t6a: {
  otherSims: {
    jsbsim_t6texan2: sim({ file: 'aircraft/t6texan2/t6texan2.xml', package: 'jsbsim 1.3.3 (PyPI)', rev: 'Rev 1.14', author: 'Aeromatic / David Culp', licence: 'ไม่ระบุในไฟล์', defects: ['เครื่องยนต์ PT6A-68.xml เป็น turbine (jet) แรงขับ 2,464 lbf ไม่มีใบพัด', 'ตาราง CL(α) และแฟลปเหมือน C172', 'ใส่น้ำหนักได้สูงสุด 6,000 lb'], empty_weight: '5,000 lb ตรงกับ Navy fact file (Wikipedia 4,707 lb)', use: 'fixture เท่านั้น' }, ['LB1', 'LB7', 'LB8', 'LB16'], 'อ่านหัวไฟล์และรันวัด (03.2.3 ข้อ 6)'),
    flightgear_t6: sim({ repo: 'github.com/RobAndrew96/T-6-Texan-II', licence: 'ไม่ระบุ (ห้ามนำมาใช้)', content: '1 commit; โฟลเดอร์ PC-9M เป็นสำเนาแพ็กเกจ PC-9M ของ FlightGear (PC-9M.xml ตรงกับ FGMEMBERS/PC-9M ทุกบรรทัด) มี T-6-set.xml เป็น variant-of PC-9M', last_push: '2024-01-11', measured_here: false }, ['LB21', 'LB27'], 'อ่านหัวไฟล์ตอนตรวจทาน; ไฟล์ต้นฉบับ GPL อยู่ที่ FGMEMBERS จึงอ้างต้นฉบับแทน', 'กลาง'),
    flightgear_t6_fgmembers: sim({ repo: 'github.com/FGMEMBERS/T-6', licence: 'GPL-2.0 (ไฟล์ COPYING)', fdm: 'JSBSim T-6.xml โดย Petar Jedvaj (2011, Rev 1.9, BETA)', set: 'ผู้สร้าง Rob Dosogne สถานะ development', published_poh_validation: 'ไม่พบ', measured_here: false }, ['LB29'], 'อ่านหัวไฟล์ FDM และไฟล์ set ไม่ได้รันวัด (เพิ่มตอนตรวจทาน; งาน P2 ใน 03.10)', 'กลาง'),
  },
  validation: { openModels: { jsbsim_t6texan2: openModel('t6texan2', 'LB7') } },
} });
// ---------------- da40ng, da42ng, pc9m (FlightGear only / none found)
blocks.push({ da40ng: { otherSims: {
  jsbsim_bundled: sim('ไม่มีใน JSBSim 1.3.3', ['LB1'], 'ตรวจรายการเครื่องบินในแพ็กเกจ'),
  flightgear_da40ng: sim({ repo: 'github.com/sryu1/DA40', licence: 'GPL-2.0', fdm: 'da40ng-jsb.xml โดย Aeromatic v 3.3.10 (2019, รุ่น 10/2021, ALPHA)', refs: 'ขนาดและน้ำหนักอ้างหน้า AFM ("ref. 1")', note_izz: 'Izz 5,000 slug·ft² ปรับให้เลี้ยวบนพื้นง่าย "source needed"', published_poh_validation: 'ไม่พบ', measured_here: false }, ['LB19'], 'อ่านไฟล์ FDM ไม่ได้รันวัด; ค่าเรขาคณิตให้อ้าง AFM ต้นทาง', 'กลาง'),
  flightgear_da40ng_fg1000: sim({ repo: 'github.com/CMDR-DiTRay/FGFS-DA40', licence: 'GPL-2.0', updated: '2023-11-19', measured_here: false }, ['LB20'], 'ไม่ได้อ่าน FDM', 'กลาง'),
} } });
// review 2026-11-19: the FGMEMBERS mirror of FlightGear aircraft has DA42 (YASim) and PC-9M (JSBSim) models that the first search missed
blocks.push({ da42ng: { otherSims: {
  open_models: sim('JSBSim 1.3.3 ไม่มี DA42; FlightGear มีโมเดล YASim ของ DA 42-VI [LB30] (ไม่มีโมเดล JSBSim ของ DA42 ที่พบ)', ['LB1', 'LB23', 'LB30'], 'ค้น GitHub 2026-11-18 ได้ 0 รายการ; ตรวจ FGMEMBERS ตอนตรวจทาน 2026-11-19 พบ Diamond-DA42; oracle ของสมการยังต้องสร้าง JSBSim XML เอง', 'กลาง'),
  flightgear_da42: sim({ repo: 'github.com/FGMEMBERS/Diamond-DA42', licence: 'GPL-2.0 (ไฟล์ COPYING)', fdm: 'YASim da42-yasim.xml (E. Baranger และคณะ v0.96 ปี 2016, Beta)', represents: 'DA 42-VI', yasim_targets: 'approach 55 kt ที่ AoA 4° / cruise 190 kt ที่ 16,000 ft / mass 1,700 lb (ค่าที่ผู้สร้างกรอก YASim แก้สัมประสิทธิ์ให้ตรงสองจุดนี้)', remark: 'approach 55 kt ต่ำกว่า VS0 62 KIAS และ VREF 84 KIAS ของ DA42 NG ในหัวข้อ 06 จึงใช้เป็นแหล่งตัวเลขไม่ได้', published_poh_validation: 'ไม่พบ', measured_here: false }, ['LB30', 'LT2', 'LT9'], 'อ่านไฟล์ set และ YASim config ไม่ได้รันวัด (YASim รันด้วยแพ็กเกจ jsbsim ไม่ได้ ต้องใช้ FlightGear)', 'กลาง'),
} } });
blocks.push({ pc9m: { otherSims: {
  open_models: sim('JSBSim 1.3.3 ไม่มี PC-9; FlightGear มีโมเดล JSBSim ของ PC-9M [LB27]', ['LB1', 'LB23', 'LB27'], 'ค้น GitHub 2026-11-18 ได้ 0 รายการ; ตรวจ FGMEMBERS ตอนตรวจทาน 2026-11-19 พบ PC-9M', 'กลาง'),
  flightgear_pc9m: sim({ repo: 'github.com/FGMEMBERS/PC-9M', licence: 'ไม่มีไฟล์ COPYING ที่ราก repo; PC9-shared.xml ใช้โลโก้ GPLv3 (ถือเป็น GPL-3.0 จนกว่าจะยืนยัน)', fdm: 'JSBSim PC-9M.xml โดย Erik Hofman, David Culp (2011, Rev 1.9, BETA)', refs: 'หัวไฟล์อ้าง DSTO-TR-0479 (van Bronswijk และคณะ, อนุพันธ์จากการบินทดสอบ PC-9/A) = [LP26] ของหัวข้อ 07', engines: 'ชุดเครื่อง PT6A-25 (ใบพัด 3 ใบ), PT6A-62 และ PT6A-68 (ใบพัด 4 ใบ) ใน FDM เดียว; มีไฟล์ set รุ่นย่อย PC-7', status: 'set 1.4.0; วิกิ FlightGear: early production', published_poh_validation: 'ไม่พบ', measured_here: false }, ['LB27', 'LB34', 'LP26'], 'อ่านหัวไฟล์ FDM ไม่ได้รันวัด; ต้องตรวจว่าค่าอนุพันธ์ในไฟล์มาจาก DSTO-TR-0479 จริงหรือไม่ก่อนใช้ (งาน P2 ใน 03.10)', 'กลาง'),
} } });
// ---------------- types added after the first draft (Thai-school cards 10-12, ops/procedures ids): open models found during the review
blocks.push({ c172r: { otherSims: {
  jsbsim_c172r_ref: sim({ results_at: 'c172s.validation.openModels.jsbsim_c172r', file: 'aircraft/c172r/c172r.xml', represents: 'โครงลำ C172R แต่เครื่อง engIO360C 180 hp 2,700 rpm (C172R จริง IO-360-L2A 160 hp 2,400 rpm)', use: 'fixture เท่านั้น ห้ามใช้เป็นเป้าของบัตร c172r' }, ['LB1', 'LB3', 'LB11'], 'ผลวัดเก็บใต้ c172s เพราะหัวข้อ 03 เขียนก่อนมีบัตร c172r; บัตร c172r สืบทอด c172s จึงเห็นผลชุดนี้ผ่าน _inherits (เพิ่มตอนตรวจทาน)'),
} } });
blocks.push({ c152: { otherSims: {
  jsbsim_bundled: sim('ไม่มีใน JSBSim 1.3.3', ['LB1'], 'ตรวจรายการเครื่องบินในแพ็กเกจ (เพิ่มตอนตรวจทาน)'),
  flightgear_c152: sim({ repo: 'github.com/FGMEMBERS/c152', licence: 'GPL-2.0 (GitHub)', fdm: 'JSBSim c152.xml โดย Aeromatic v0.95 (2015-10-04, Rev 1.15, ALPHA)', represents: 'Cessna 152 II', authors: 'README: Adrián Fernández (3D), Gilberto Agostinho (texture, โปรแกรม)', published_poh_validation: 'ไม่พบ', measured_here: false }, ['LB32'], 'อ่านหัวไฟล์ FDM และหน้า repo ไม่ได้รันวัด; สัมประสิทธิ์จาก Aeromatic (ประมาณจากเรขาคณิต) (เพิ่มตอนตรวจทาน)', 'กลาง'),
} } });
blocks.push({ p2006t: { otherSims: {
  jsbsim_bundled: sim('ไม่มีใน JSBSim 1.3.3', ['LB1'], 'ตรวจรายการเครื่องบินในแพ็กเกจ (เพิ่มตอนตรวจทาน)'),
  flightgear_p2006t: sim({ repo: 'github.com/FGMEMBERS/Tecnam-P2006T', licence: 'GPL-2.0 (ไฟล์ COPYING)', fdm: 'YASim p2006t-yasim.xml (E. Baranger, v0.1, Alpha)', yasim_targets: 'approach 47 kt ที่ AoA 4° / cruise 135 kt ที่ 5,000 ft / mass 1,675 lb (ค่าที่ผู้สร้างกรอก)', remark: 'approach 47 kt ต่ำกว่า VS0 53 KIAS ของ AFM ในหัวข้อ 12 จึงใช้เป็นแหล่งตัวเลขไม่ได้', published_poh_validation: 'ไม่พบ', measured_here: false }, ['LB31', 'LG16', 'LG4'], 'อ่านไฟล์ set และ YASim config ไม่ได้รันวัด (YASim รันด้วยแพ็กเกจ jsbsim ไม่ได้) (เพิ่มตอนตรวจทาน ตามงานที่หัวข้อ 12 ฝากไว้)', 'กลาง'),
} } });
blocks.push({ pa28_161: { otherSims: {
  jsbsim_bundled: sim('JSBSim 1.3.3 มีแค่ pa28 (ชื่อ PA28-180) ซึ่งใช้เป็นแหล่งตัวเลขไม่ได้ (03.3.2); ผลวัดอยู่ใต้ pa28_180', ['LB1', 'LB5'], 'เพิ่มตอนตรวจทาน'),
  flightgear_pa28: sim({ wiki: 'wiki.flightgear.org/Piper_PA28_Warrior_II', licence: 'GPLv2+ (infobox ของวิกิ)', fdm: 'JSBSim', authors: 'Josh Davidson (Octal450), legoboyvdlp, D-ECHO, Knüppelrührer', status: 'Advanced production', variants: 'PA28-161 เครื่อง O-320-D3G 160 hp และตัวเลือก O-360-A4A 180 hp', mirror: 'github.com/FGMEMBERS/pa28-161 (ยังไม่ได้เปิด)', published_poh_validation: 'ไม่พบในหน้าวิกิ', measured_here: false }, ['LB33'], 'อ่านหน้าวิกิเท่านั้น ยังไม่ได้เปิด FDM (เพิ่มตอนตรวจทาน)', 'กลาง'),
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
