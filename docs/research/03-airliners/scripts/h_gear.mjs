// h_gear.mjs — หัวข้อ 3.4: แปลงค่าโช้คของ FlightGear A330 (GPL-2.0) เป็น SI และตรวจระยะยุบนิ่ง/อัตราหน่วง (ค่าประมาณ)
const LBF = 4.4482216152605, FT = 0.3048, g = 9.80665;
const f = (x, d = 3) => +x.toFixed(d);
const kM = 137570.4 * LBF / FT, cM = 53914.5 * LBF / FT, kN = 53871.1 * LBF / FT, cN = 39957.3 * LBF / FT;
console.log({ k_main_Npm: f(kM, 0), c_main_Nspm: f(cM, 0), k_nose_Npm: f(kN, 0), c_nose_Nspm: f(cN, 0) });
// สัดส่วนน้ำหนักบนล้อหน้า 8 % ที่ CG อ้างอิง (สมมติฐานเดียวกับหัวข้อ 5) -> ล้อหลักข้างละ 46 %
for (const m of [187000, 242000]) {
  const Fm = 0.46 * m * g, Fn = 0.08 * m * g, me = 0.46 * m, mn = 0.08 * m;
  console.log(m, 'kg: main leg', f(Fm / 1000, 1), 'kN static x', f(Fm / kM, 3), 'm zeta', f(cM / (2 * Math.sqrt(kM * me)), 3), 'f_n', f(Math.sqrt(kM / me) / (2 * Math.PI), 3), 'Hz | nose', f(Fn / 1000, 1), 'kN x', f(Fn / kN, 3), 'm zeta', f(cN / (2 * Math.sqrt(kN * mn)), 3));
}
// ความเร็วยางและขีดจำกัด
console.log({ tyre_speed_rating_mps: f(235 * 0.44704, 2), gs_limit_204kt_mps: f(204 * 0.514444, 2), nose_static_share_check: 'ดูหัวข้อ 5' });
