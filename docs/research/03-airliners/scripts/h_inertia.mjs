// h_inertia.mjs — หัวข้อ 3.4: inertia ของ A330-300 (ค่าประมาณ) จากรัศมีไจเรชันไร้มิติแบบ Roskam
// R_x = 2 k_x / b, R_y = 2 k_y / L, R_z = 2 k_z / e, e = (b + L)/2, k = sqrt(I/m)
// รัศมีที่เลือก = ค่าเฉลี่ย JSBSim A320 + FBW A32NX ของหัวข้อ 3 (l_inertia.mjs) ตรวจกับ JSBSim B747 (Rx) และตัดโมเดล FlightGear A330 ทิ้ง
const SLUGFT2 = 1.3558179483, LB = 0.45359237, FT = 0.3048;
const f = (x, d = 3) => d < 0 ? Math.round(x / 10 ** -d) * 10 ** -d : +x.toFixed(d);
export const Rsel = { Rx: 0.305, Ry: 0.466, Rz: 0.549 };       // หัวข้อ 3 [L23][L13]
export const DIM = { b: 60.30, L: 63.66 };                    // span และความยาว (หัวข้อ 5 [D10])
export const I_at = (m, b = DIM.b, L = DIM.L, R = Rsel) => { const e = (b + L) / 2; return { Ixx: m * (R.Rx * b / 2) ** 2, Iyy: m * (R.Ry * L / 2) ** 2, Izz: m * (R.Rz * e / 2) ** 2 }; };
const radii = (I, m, b, L) => { const e = (b + L) / 2; return { Rx: f(2 * Math.sqrt(I[0] / m) / b), Ry: L ? f(2 * Math.sqrt(I[1] / m) / L) : null, Rz: L ? f(2 * Math.sqrt(I[2] / m) / e) : null }; };
if (import.meta.url === `file://${process.argv[1]}`) {
  // FlightGear A330 (GPL-2.0): Ixx 2,375,399 Iyy 5,004,014 Izz 4,408,984 slug ft2, emptywt 214,000 lb
  const Ifg = [2375399, 5004014, 4408984].map(v => v * SLUGFT2), mfg = 214000 * LB;
  console.log('FG A330: m', f(mfg, 0), 'I (kg m2)', Ifg.map(v => f(v, -3)), 'radii', radii(Ifg, mfg, 60.3, 63.66), '(Ixx+Iyy)/Izz', f((Ifg[0] + Ifg[1]) / Ifg[2]));
  // JSBSim B747 (GPL header): Ixx 1.82e7, Iyy 3.31e7, Izz 4.97e7 slug ft2; span 211.5 ft; emptywt 523,816 lb (ตีความสองแบบของมวล)
  const Ib = [1.82e7, 3.31e7, 4.97e7].map(v => v * SLUGFT2);
  for (const [n, mlb] of [['empty 523,816 lb', 523816], ['gross 636,600 lb (ถ้าค่า I เป็นของน้ำหนักบิน)', 636600]]) console.log('B747', n, 'Rx', radii(Ib, mlb * LB, 211.5 * FT, 0).Rx, '(Ixx+Iyy)/Izz', f((Ib[0] + Ib[1]) / Ib[2]));
  console.log('selected radii', Rsel);
  for (const [n, m] of [['130 t (ใกล้ OEW+ภาระน้อย)', 130000], ['150 t', 150000], ['170 t', 170000], ['MLW 187 t', 187000], ['205.5 t (AF447 ขณะเกิดเหตุ, A330-203)', 205500], ['MTOW 242 t', 242000]]) {
    const I = I_at(m); console.log(n.padEnd(40), 'Ixx', f(I.Ixx, -4), 'Iyy', f(I.Iyy, -4), 'Izz', f(I.Izz, -4), 'kg m2  | slug ft2 Ixx', f(I.Ixx / SLUGFT2, -3));
  }
  const a = 5.0 * Math.PI / 180, I0 = I_at(187000);
  console.log('stability axes @alpha 5 deg, 187 t: Ixs', f(I0.Ixx * Math.cos(a) ** 2 + I0.Izz * Math.sin(a) ** 2, -4), 'Izs', f(I0.Ixx * Math.sin(a) ** 2 + I0.Izz * Math.cos(a) ** 2, -4), 'Ixzs', f((I0.Ixx - I0.Izz) * Math.sin(a) * Math.cos(a), -3));
}
