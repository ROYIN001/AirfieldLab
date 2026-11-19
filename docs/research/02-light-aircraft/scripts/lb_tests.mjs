// lb_tests.mjs - build the T-LB test table from the JSBSim fixtures (scripts/out/lb_perf_*.json, lb_aero.json) and
// the POH conversions in lb_compare.mjs; checks the conversion helpers; writes scripts/out/lb_tests.json.
// Run: node scripts/lb_tests.mjs   -> prints the markdown rows and "N/N helper checks pass".
import { readFileSync, writeFileSync } from 'node:fs';
import { kcas172p, pct, verdict, MPH, clImplied } from './lb_compare.mjs';
const OUT = new URL('./out/', import.meta.url);
const rd = (f) => JSON.parse(readFileSync(new URL(f, OUT), 'utf8'));
const P = Object.fromEntries(['c172p', 'c172r', 'c172x', 'pa28', 'pc7', 't6texan2'].map((m) => [m, rd(`lb_perf_${m}.json`)]));
const A = rd('lb_aero.json');
const S = rd('lb_signs.json');
const r = (x, n = 1) => Math.round(x * 10 ** n) / 10 ** n;
const cr = (m, h, key, val) => P[m].cruise.find((c) => c.h_ft === h && (key == null || c[key] === val));
const T = [
  ['T-LB-01', 'JSBSim c172p, 2,400 lb (payload ที่ CG อ้างอิงของโมเดล), แฟลป 0, idle, ลดความเร็ว 1 kt/s, 3,000 ft ISA', 'VS (KCAS ต่ำสุด)', r(P.c172p.stall['0'].vs_kcas), 0.5, 'KCAS', 'lb_perf.py stall; POH 51 KCAS [LB9]'],
  ['T-LB-02', 'เหมือน T-LB-01 แฟลป 30', 'VS0', r(P.c172p.stall['30'].vs_kcas), 0.5, 'KCAS', 'POH 46 KCAS [LB9]'],
  ['T-LB-03', 'JSBSim c172r, 2,450 lb, แฟลป 0 / 30, 1 kt/s idle', 'VS1 / VS0', `${r(P.c172r.stall['0'].vs_kcas)} / ${r(P.c172r.stall['30'].vs_kcas)}`, 0.5, 'KCAS', 'POH 51 / 47 KCAS [LB11]'],
  ['T-LB-04', 'static sweep (power off, q=0, elevator 0) แฟลป 0', 'CLα ของ c172x ÷ CLα ของ c172p', r(A.c172x['0'].CLalpha_per_rad / A.c172p['0'].CLalpha_per_rad, 3), 0.02, '-', `lb_aero.py; c172x ${A.c172x['0'].CLalpha_per_rad}/rad, c172p ${A.c172p['0'].CLalpha_per_rad}/rad (ยกซ้ำ)`],
  ['T-LB-05', 'static sweep แฟลป 0/10/20/30', 'CLmax c172p', `${A.c172p['0'].CLmax} / ${A.c172p['10'].CLmax} / ${A.c172p['20'].CLmax} / ${A.c172p['30'].CLmax}`, 0.01, '-', 'lb_aero.py (α 16°)'],
  ['T-LB-06', 'JSBSim c172p บนพื้น SL ISA เบรก คันเร่งสุด mixture full rich 10 s', 'กำลังเครื่อง / rpm', `${r(P.c172p.static.hp)} / ${P.c172p.static.engine_rpm}`, '1 hp / 10 rpm', 'hp / rpm', 'lb_perf.py static; ค่าพิกัด 160 hp [LB10]'],
  ['T-LB-07', 'JSBSim c172p 2,400 lb SL ISA คันเร่งสุด แฟลป 0 กวาดความเร็ว 55–110 KCAS', 'Vy / ROCmax', `${P.c172p.climb.vy_kcas} / ${P.c172p.climb.roc_max_fpm}`, '3 kt / 30 fpm', 'KCAS / fpm', 'POH 75.4 KCAS / 700 fpm [LB9]'],
  ['T-LB-08', 'JSBSim c172p 8,000 ft ISA 2,500 rpm ระดับคงที่ mixture best power', 'KTAS / hp', `${cr('c172p', 8000, 'target', 2500).ktas} / ${cr('c172p', 8000, 'target', 2500).hp}`, '1 kt / 2 hp', 'KTAS / hp', 'lb_perf.py cruise'],
  ['T-LB-09', 'JSBSim c172r 8,000 ft ISA 2,600 rpm', 'KTAS', cr('c172r', 8000, 'target', 2600).ktas, 1.0, 'KTAS', 'POH 80% 122 KTAS [LB11]'],
  ['T-LB-10', 'JSBSim c172p ขึ้นบิน short field แฟลป 10, SL ISA, ล้อหน้า/หลังตามโมเดล, นักบินจำลอง VR 50 KCAS θ 8°', 'ground roll / ถึง 50 ft', `${P.c172p.takeoff.ground_roll_ft} / ${P.c172p.takeoff.over50_ft}`, '60 ft / 90 ft', 'ft', 'POH 890 / 1,625 ft [LB10]'],
  ['T-LB-11', 'JSBSim c172x ร่อน เครื่องดับ แฟลป 0 กวาด 55–95 KCAS', 'ความเร็วร่อนดีสุด / L/D', `${P.c172x.glide.best_kcas} / ${P.c172x.glide.best_ratio}`, '5 kt / 0.5', 'KCAS / -', 'POH 66 KCAS [LB9]'],
  ['T-LB-12', 'JSBSim pa28 2,450 lb แฟลป 0 1 kt/s idle', 'VS และสาเหตุ', `${r(P.pa28.stall['0'].vs_kcas)} (${P.pa28.stall['0'].limit})`, 1.0, 'KCAS', 'POH 59.1 KCAS [LB13]'],
  ['T-LB-13', 'JSBSim pc7 บนพื้น SL ISA เบรก คันเร่งสุด', 'prop rpm / hp / thrust', `${P.pc7.static.prop_rpm} / ${P.pc7.static.hp} / ${P.pc7.static.thrust_lb}`, '5 rpm / 5 hp / 25 lbf', 'rpm / hp / lbf', 'ค่าพิกัด 550 hp [LB14]'],
  ['T-LB-14', 'JSBSim t6texan2 6,000 lb คันเร่งสุด 1,000 ft ระดับคงที่', 'KTAS', cr('t6texan2', 1000).ktas, 2.0, 'KTAS', 'Navy 270 kt [LB16]'],
  ['T-LB-15', 'แปลง POH C172P KIAS→KCAS (Fig 5-1): 76 แฟลปขึ้น, 65 แฟลปขึ้น, 56 แฟลป 10', 'KCAS', `${r(kcas172p(76))} / ${r(kcas172p(65))} / ${r(kcas172p(56, 'f10'))}`, 0.05, 'KCAS', 'lb_compare.mjs interp'],
  ['T-LB-16', 'แปลง PA-28-180 68 mph CAS และ 61 mph CAS', 'KCAS', `${r(68 * MPH, 2)} / ${r(61 * MPH, 2)}`, 0.01, 'KCAS', '1 mph = 0.868976 kt'],
  ['T-LB-17', 'เป้าของบัตร c172s เมื่อใส่ในซิม (ไม่ใช่ค่า JSBSim): stall 1 kt/s idle 2,550 lb แฟลปขึ้น / แฟลป 30', 'VS1 / VS0', '53 / 48', 3.0, 'KCAS', 'C172S manual p ii [LB12]; tolerance ±3 kt ตาม Part 60 [R1:V2]; VS ของ JSBSim c172p สูงกว่า POH 2.8–3.5 kt จึงห้ามใช้ JSBSim เป็นเป้า'],
  ['T-LB-18', 'CL ที่ POH ต้องการ ณ VS (1 g): C172P 2,400 lb S 174 ft² ที่ 51 / 46 KCAS; JSBSim c172p ที่ 54.49 / 48.77 KCAS', 'CL = W/(½ρ0 V² S)', `${r(clImplied(2400, 174, 51), 3)} / ${r(clImplied(2400, 174, 46), 3)} (JSBSim ${r(clImplied(2400, 174, 54.49), 3)} / ${r(clImplied(2400, 174, 48.77), 3)})`, 0.005, '-', 'lb_compare.mjs clImplied; ขอบบนของ CL ณ VS ใน protocol 1 kt/s (T-LB-19) ใช้เทียบกับค่าเดียวกันที่คำนวณจาก VS ที่ซิมของบัตร C172 วัดได้'],
  // review 2026-11-19: load factor at the minimum speed of the 1 kt/s protocol, and the JSBSim control signs (lb_signs.py)
  ['T-LB-19', 'JSBSim c172p fixture ของ T-LB-01/02 (2,400 lb, 1 kt/s idle) แฟลป 0 / 30: n = CL ที่วัด ณ VS ÷ W/(½ρ0 VS² S)', 'load factor ณ ความเร็วต่ำสุด', `${r(P.c172p.stall['0'].CL_at_vs / clImplied(2400, 174, P.c172p.stall['0'].vs_kcas), 3)} / ${r(P.c172p.stall['30'].CL_at_vs / clImplied(2400, 174, P.c172p.stall['30'].vs_kcas), 3)}`, 0.02, '-', 'lb_perf.py stall + clImplied; แสดงว่า CL ของ T-LB-18 เป็นขอบบน (n < 1 ที่ VS)'],
  ['T-LB-20', 'JSBSim c172p 100 KCAS 5,000 ft ISA trim แล้ว สั่ง +0.3 ทีละแกน อ่านอัตราหมุนหลัง 0.5 s', 'q (elevator) / p (aileron) / r (rudder)', `${S.models.c172p.elevator.q} / ${S.models.c172p.aileron.p} / ${S.models.c172p.rudder.r}`, 'เครื่องหมายต้องตรง, ขนาด ±10 %', 'rad/s', 'lb_signs.py; +elevator = ขอบท้ายลง, +aileron = ม้วนขวา, +rudder = ขอบท้ายไปซ้าย ตรงกับ AC (schema-ext-r2 §5)'],
];
// helper checks (the only part that can fail here; fixture values are reproduced by rerunning lb_perf.py)
const checks = [
  [r(kcas172p(76)), 75.4], [r(kcas172p(65)), 66.0], [r(kcas172p(56, 'f10')), 59.2], [r(pct(54.49, 51), 2), 6.84],
  [verdict(4.9), 'ตรง (≤5%)'], [verdict(-14.9), 'ใกล้ (5–15%)'], [verdict(15.1), 'ไม่ตรง (>15%)'], [r(68 * MPH, 2), 59.09], [r(clImplied(2400, 174, 51), 3), 1.566],
  [S.models.c172p.elevator.q < 0 && S.models.c172p.aileron.p > 0 && S.models.c172p.rudder.r < 0, true],
];
let ok = 0; for (const [a, b] of checks) { if (a === b) ok++; else console.log('FAIL', a, '!=', b); }
// 'current model' column: the AirfieldLab sim today flies only the fictional turboprop trainer, so no test here applies to it
const CUR = (id) => (['T-LB-15', 'T-LB-16', 'T-LB-18', 'T-LB-19'].includes(id) ? 'ไม่ใช้ (คำนวณล้วน)' : id === 'T-LB-17' ? 'ยังวัดไม่ได้ (ยังไม่มีบัตร C172 ในซิม)' : 'ไม่เกี่ยว (fixture ของ JSBSim)');
for (const t of T) console.log(`| ${t[0]} | ${t[1]} | ${t[2]} | ${t[3]} ± ${t[4]} ${t[5]} | ${t[6]} | ${CUR(t[0])} |`);
writeFileSync(new URL('lb_tests.json', OUT), JSON.stringify({ tests: T.map((t) => ({ id: t[0], condition: t[1], quantity: t[2], expected: t[3], tolerance: t[4], unit: t[5], source: t[6], current_model: CUR(t[0]) })), helper_checks: `${ok}/${checks.length}` }, null, 1));
console.log(`${ok}/${checks.length} helper checks pass`);
