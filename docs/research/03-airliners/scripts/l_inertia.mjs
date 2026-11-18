// l_inertia.mjs — หัวข้อ 3.3: inertia ของ A320/A321 จากโมเดลเปิด 3 ตัว -> รัศมีไจเรชันไร้มิติแบบ Roskam -> ค่าที่มวลอ้างอิง
// R_x = 2 k_x / b, R_y = 2 k_y / L, R_z = 2 k_z / e, e = (b + L)/2, k = sqrt(I/m)   (Roskam Part V นิยาม; สูตรผ่าน avsim/Goodrick และ Decloedt 2016)
const SLUGFT2 = 1.3558179483, LB = 0.45359237, FT = 0.3048;
const models = {
  // JSBSim A320.xml (LGPL-2.1): emptywt 111000 lb, b 111.3 ft, ความยาว A320 37.57 m
  JSBSim: { Ixx: 942877, Iyy: 2.78892e6, Izz: 3.59757e6, m_lb: 111000, b: 111.3 * FT, L: 37.57 },
  // FBW A32NX flight_model.cfg (GPL-3.0): empty 93697 lb, b 117.454 ft, fuselage 123.27 ft
  FBW: { Ixx: 989005, Iyy: 2453714, Izz: 3166138, m_lb: 93697, b: 117.454 * FT, L: 123.27 * FT },
  // FlightGear A320-family (GPL-2.0): emptywt 80431 lb, b 117.26 ft (Izz < Iyy: ไม่สอดคล้องทางฟิสิกส์ ใช้เปรียบเทียบเท่านั้น)
  FlightGear: { Ixx: 611903, Iyy: 1735389, Izz: 1401293, m_lb: 80431, b: 117.26 * FT, L: 37.57 },
};
const f = (x, d = 3) => d < 0 ? Math.round(x / 10 ** -d) * 10 ** -d : +x.toFixed(d);
const radii = {};
for (const [n, M] of Object.entries(models)) {
  const m = M.m_lb * LB, I = [M.Ixx, M.Iyy, M.Izz].map(v => v * SLUGFT2);
  const e = (M.b + M.L) / 2;
  const R = { Rx: 2 * Math.sqrt(I[0] / m) / M.b, Ry: 2 * Math.sqrt(I[1] / m) / M.L, Rz: 2 * Math.sqrt(I[2] / m) / e };
  radii[n] = R;
  console.log(n.padEnd(10), 'm', f(m, 0), 'kg  Ixx', f(I[0], 0), 'Iyy', f(I[1], 0), 'Izz', f(I[2], 0), 'kg m2 | Rx', f(R.Rx), 'Ry', f(R.Ry), 'Rz', f(R.Rz), '| (Ixx+Iyy)/Izz', f((I[0] + I[1]) / I[2]));
}
// เลือกค่าเฉลี่ยของ JSBSim และ FBW (สองโมเดลที่ Izz ≈ Ixx + Iyy)
const Rsel = { Rx: (radii.JSBSim.Rx + radii.FBW.Rx) / 2, Ry: (radii.JSBSim.Ry + radii.FBW.Ry) / 2, Rz: (radii.JSBSim.Rz + radii.FBW.Rz) / 2 };
console.log('\nRadii ที่เลือก (เฉลี่ย JSBSim+FBW):', { Rx: f(Rsel.Rx), Ry: f(Rsel.Ry), Rz: f(Rsel.Rz) });
const I_at = (m, b, L, R = Rsel) => { const e = (b + L) / 2; return { Ixx: m * (R.Rx * b / 2) ** 2, Iyy: m * (R.Ry * L / 2) ** 2, Izz: m * (R.Rz * e / 2) ** 2 }; };
const cases = [
  ['a320ceo MLW 64.5 t, b 34.10, L 37.57', 64500, 34.10, 37.57],
  ['a320ceo 60 t (ทดสอบ approach)', 60000, 34.10, 37.57],
  ['a320ceo MTOW 73.5 t', 73500, 34.10, 37.57],
  ['a320neo MLW 67.4 t, b 35.80', 67400, 35.80, 37.57],
  ['a321neo MLW 79.2 t, b 35.80, L 44.51', 79200, 35.80, 44.51],
  ['a321ceo MLW 75.5 t, b 34.10, L 44.51', 75500, 34.10, 44.51],
];
for (const [n, m, b, L] of cases) { const I = I_at(m, b, L); console.log(n.padEnd(40), 'Ixx', f(I.Ixx, -3), 'Iyy', f(I.Iyy, -3), 'Izz', f(I.Izz, -3)); }
// Ixz: body axes, JSBSim -10000 slug ft2 ที่ empty (ค่าเล็ก), FBW "coupled" 1000; ใช้ 0 ± และให้ stability-axis Ixz จากการหมุนด้วย alpha
const a = 4.5 * Math.PI / 180, I0 = I_at(64500, 34.10, 37.57);
const Ixs = I0.Ixx * Math.cos(a) ** 2 + I0.Izz * Math.sin(a) ** 2, Izs = I0.Ixx * Math.sin(a) ** 2 + I0.Izz * Math.cos(a) ** 2, Ixzs = (I0.Ixx - I0.Izz) * Math.sin(a) * Math.cos(a);
console.log('\nstability axes ที่ alpha 4.5 deg (64.5 t): Ixs', f(Ixs, -3), 'Izs', f(Izs, -3), 'Ixzs', f(Ixzs, -3));
export { Rsel, I_at };
