// l_speeds_clmax.mjs — หัวข้อ 3.3 (A320/A321): CLmax ต่อ CONF จาก VS1g, อัตราส่วน VLS/VS1g, VAPP, เทียบจุดยึด
// รัน: node l_speeds_clmax.mjs   (Node >= 18, ไม่มี dependency)
// ตาราง VS1g/VLS/V2/F/S เป็นตัวเลขที่ถอดด้วยมือจาก FBW A32NX NXSpeeds.js v0.8.0 (GPL-3.0) ที่จุดมวล 40..80 t
// (ประเมินแต่ละช่วงตามกฎของไฟล์ต้นฉบับ: ค่าที่ m = 40+5k เป็นค่าปลายช่วง k) — อ้างตัวเลขเท่านั้น ไม่ได้คัดลอกโค้ด
const g = 9.80665, rho0 = 1.225, KT = 0.514444, S = 122.6;
const M = [40, 45, 50, 55, 60, 65, 70, 75, 80];
const VS = {             // kt CAS, ล้อขึ้น (CONF3 ล้อลง = -2 kt)
  CONF0:   [124, 131, 138, 145, 150, 156, 161, 166, 172],
  CONF1:   [102, 107, 112, 117, 123, 127, 132, 137, 141],
  'CONF1+F': [93, 98, 103, 108, 112, 117, 121, 125, 130], // ที่ 70/75 t ต้นฉบับมี typo "+ .8 +" (ได้ 122.8/126.8) ใช้ค่าที่ตั้งใจ 121/125
  CONF2:   [91, 96, 101, 105, 110, 114, 119, 122, 126],
  CONF3:   [91, 96, 101, 105, 110, 114, 119, 122, 126],
  FULL:    [84, 88, 93, 97, 101, 105, 109, 113, 116],
};
const VLS_cgAft = {        // CG >= 25 %MAC (ใช้กับ FULL/CONF3)
  CONF3: [117, 117, 124, 130, 135, 141, 146, 151, 156],  // ที่ 80 t ต้นฉบับมี typo (151 + m - 65) ใช้ 156
  FULL:  [116, 116, 116, 119, 124, 129, 134, 139, 143],
};
const VLS_cgFwd = {        // CG < 25 %MAC (ค่าปริยายของ FBW เมื่อไม่รู้ CG = 24)
  CONF0: [159, 168, 177, 186, 192, 198, 206, 212, 220],
  'CONF1+F': [114, 121, 127, 133, 138, 144, 149, 154, 160],
  CONF2: [110, 119, 125, 131, 137, 142, 145, 149, 154],
  CONF3: [117, 119, 125, 131, 137, 142, 147, 152, 156],
  FULL:  [116, 116, 116, 120, 125, 130, 135, 139, 143],
  CONF1: [125, 132, 138, 144, 151, 156, 162, 169, 173],
};
const V2tab = { 'CONF1+F': [126, 126, 126, 127, 132, 137, 142, 147, 152], CONF2: [126, 126, 126, 126, 127, 132, 137, 141, 146], CONF3: [125, 125, 125, 125, 125, 128, 132, 137, 141] };
const Ftab = [131, 131, 131, 137, 144, 149, 155, 160, 166];
const Stab = [152, 161, 169, 178, 186, 193, 200, 207, 214];

const interp = (xs, ys, x) => { if (x <= xs[0]) return ys[0]; for (let i = 1; i < xs.length; i++) if (x <= xs[i]) return ys[i - 1] + (ys[i] - ys[i - 1]) * (x - xs[i - 1]) / (xs[i] - xs[i - 1]); return ys[ys.length - 1]; };
const CL = (m_kg, Vkt) => 2 * m_kg * g / (rho0 * S * (Vkt * KT) ** 2);
const f3 = x => +x.toFixed(3), f1 = x => +x.toFixed(1);

console.log('== 1. CLmax = 2mg/(rho0 S VS1g^2) จากตาราง VS1g (S = 122.6 m2, rho0 1.225) ==');
const clmax = {};
for (const [k, v] of Object.entries(VS)) {
  const c = M.map((m, i) => CL(m * 1000, v[i]));
  const mean = c.reduce((a, b) => a + b) / c.length;
  clmax[k] = mean;
  console.log(k.padEnd(8), 'CLmax mean', f3(mean), ' min', f3(Math.min(...c)), ' max', f3(Math.max(...c)), ' @60t', f3(CL(60000, interp(M, v, 60))));
}
console.log('CONF3 ล้อลง @60t (VS-2 kt):', f3(CL(60000, interp(M, VS.CONF3, 60) - 2)));

console.log('\n== 2. VLS/VS1g (ตรวจ k = 1.23..1.28 ของ Safety First #24) ==');
for (const m of [50, 60, 64.5, 70, 77.4]) {
  const r = (t, vs) => f3(interp(M, t, m) / interp(M, vs, m));
  console.log(`m ${m} t: FULL cg>=25 ${r(VLS_cgAft.FULL, VS.FULL)}  FULL cg<25 ${r(VLS_cgFwd.FULL, VS.FULL)}  CONF3 cg>=25 ${r(VLS_cgAft.CONF3, VS.CONF3)}  CONF0 ${r(VLS_cgFwd.CONF0, VS.CONF0)}  1+F ${r(VLS_cgFwd['CONF1+F'], VS['CONF1+F'])}`);
}
console.log('\n== 3. ตารางที่มวลอ้างอิง (kt CAS) ==');
const refs = { 'A320ceo MLW 64.5t': 64.5, 'A320neo MLW 67.4t': 67.4, '60t': 60, 'D-AXLA 53.7t': 53.7, 'SF05 73.69t': 73.69, 'MTOW ceo 73.5t': 73.5, 'MTOW neo 79t': 79 };
for (const [n, m] of Object.entries(refs)) {
  const vsF = interp(M, VS.FULL, m), vlsF = interp(M, VLS_cgAft.FULL, m), vs3 = interp(M, VS.CONF3, m), vls3 = interp(M, VLS_cgAft.CONF3, m);
  console.log(`${n.padEnd(18)} VS1g FULL ${f1(vsF)} VLS FULL ${f1(vlsF)} 1.23VS ${f1(1.23 * vsF)} | VS1g C3 ${f1(vs3)} VLS C3 ${f1(vls3)} | VS 1+F ${f1(interp(M, VS['CONF1+F'], m))} V2(1+F) ${f1(interp(M, V2tab['CONF1+F'], m))} V2(C3) ${f1(interp(M, V2tab.CONF3, m))} 1.13VS(C3) ${f1(1.13 * vs3)} | VS0 ${f1(interp(M, VS.CONF0, m))} F ${f1(interp(M, Ftab, m))} S ${f1(interp(M, Stab, m))} GD ${f1(2 * m + 85)}`);
}
console.log('\n== 4. จุดยึดจากแหล่งอื่น ==');
// BEA D-AXLA: VLS 123 kt, Vαmax 107 kt, 53.7 t, CG 22%, landing configuration
const vsDAXLA = interp(M, VS.FULL, 53.7);
console.log('D-AXLA: VLS 123 -> k (ถ้า VS1g = ตาราง FBW', f1(vsDAXLA), ') =', f3(123 / vsDAXLA), '; ถ้า k = 1.23 -> VS1g', f1(123 / 1.23), 'CLmax', f3(CL(53700, 123 / 1.23)), '; CL at Valpha_max 107 kt', f3(CL(53700, 107)), '; Vamax/VS1g(FBW)', f3(107 / vsDAXLA));
console.log('D-AXLA stall warning 99 kt -> CL (n=1)', f3(CL(53700, 99)), '; min speed 92.5 kt -> CL (n=1)', f3(CL(53700, 92.5)));
// Safety First #05: CONF3 73.69 t V2 138 kt
console.log('SF#05: V2 138 kt CONF3 73.69 t -> VS1g = 138/1.13 =', f1(138 / 1.13), 'CLmax', f3(CL(73690, 138 / 1.13)), '; FBW VS C3', f1(interp(M, VS.CONF3, 73.69)));
// Jenkinson: A320 Vapp 134 kt at MLW 64.5 t -> VLS = 129
console.log('Jenkinson: Vapp 134 @64.5 t -> VLS 129 -> VS1g', f1(129 / 1.23), 'CLmax', f3(CL(64500, 129 / 1.23)), ' (Jenkinson lists CLmax L/D 3.00, T/O 2.56)');
// A321ceo QRH via PPRuNe: VLS FULL 139 @74 t, 143 @78 t; A321neo VREF 139 @80 t
for (const [m, v, n] of [[74, 139, 'A321ceo'], [78, 143, 'A321ceo'], [75.5, 140, 'A321ceo IAE (VREF quoted)'], [80, 139, 'A321neo (forum)']]) console.log(`${n} VLS/VREF ${v} @${m} t -> VS1g ${f1(v / 1.23)} CLmax ${f3(CL(m * 1000, v / 1.23))}`);
console.log('\n== 5. VAPP = VLS + APPR COR, APPR COR = clamp(HW/3, 5, 15) ==');
const vapp = (vls, hw) => vls + Math.min(15, Math.max(5, hw / 3));
for (const [vls, hw] of [[128.6, 0], [128.6, 12], [128.6, 30], [128.6, 60], [131.9, 21]]) console.log(`VLS ${vls} HW ${hw} kt -> VAPP ${f1(vapp(vls, hw))}`);
console.log('\n== 6. A320ceo MLW 64.5 t: VLS FULL interp', f1(interp(M, VLS_cgAft.FULL, 64.5)), ' A320neo 67.4 t:', f1(interp(M, VLS_cgAft.FULL, 67.4)), ' VS1g FULL 64.5/67.4:', f1(interp(M, VS.FULL, 64.5)), f1(interp(M, VS.FULL, 67.4)));
console.log('ICAO Vat = 1.23 VS1g(FULL) @ MLW: A320ceo 64.5 t', f1(1.23 * interp(M, VS.FULL, 64.5)), ' A320neo 67.4 t', f1(1.23 * interp(M, VS.FULL, 67.4)), ' A320 77.4/79 t extrapolated n/a (MLW <= 67.4)');
export { M, VS, VLS_cgAft, VLS_cgFwd, V2tab, Ftab, Stab, interp, CL, clmax };
