// l_wake_perf.mjs — หัวข้อ 3.3: wake vortex ของ A320/A321 (สูตรเดียวกับรอบที่ 1 T-W-15) + ระยะเบรกตาม autobrake + ตรวจหมวด approach
const g = 9.80665, KT = 0.514444, f = (x, d = 1) => +x.toFixed(d);
// Γ0 = m g / (ρ V b0), b0 = (π/4) b, w0 = Γ0 / (2π b0)  (ปีกวงรี; รอบที่ 1 หัวข้อ 8 [W19])
const wake = (m, b, Vkt, rho) => { const b0 = Math.PI / 4 * b, G0 = m * g / (rho * Vkt * KT * b0); return { b0: f(b0, 2), Gamma0: f(G0, 1), w0: f(G0 / (2 * Math.PI * b0), 3) }; };
const types = [
  ['a320ceo MLW 64.5 t b 34.10 VAPP 133.5', 64500, 34.10, 133.5],
  ['a320ceo MLW 64.5 t b 35.80 (sharklet) VAPP 133.5', 64500, 35.80, 133.5],
  ['a320neo MLW 67.4 t b 35.80 VAPP 136.4', 67400, 35.80, 136.4],
  ['a321neo MLW 79.2 t b 35.80 VAPP 143 (est)', 79200, 35.80, 143],
  ['a321ceo MLW 75.5 t b 34.10 VAPP 145.5', 75500, 34.10, 145.5],
];
for (const rho of [1.225, 1.1262]) for (const [n, m, b, V] of types) console.log(`rho ${rho} ${n.padEnd(48)}`, wake(m, b, V, rho));
// ── approach category: Vat = 1.23 VS1g(FULL) ที่ MLW (PANS-OPS ตามที่อ้างใน [L52]) ──
const vs1g = (m, CLmax, S = 122.6) => Math.sqrt(2 * m * g / (1.225 * S * CLmax)) / KT;
for (const [n, m, CLm] of [['a320ceo 64.5 t CLmax 2.884', 64500, 2.884], ['a320neo 67.4 t CLmax 2.884', 67400, 2.884], ['a321ceo 75.5 t CLmax 2.85', 75500, 2.85], ['a321ceo 77.8 t CLmax 2.85', 77800, 2.85], ['a321neo 79.2 t CLmax 2.85', 79200, 2.85], ['a321neo 79.2 t CLmax 3.05', 79200, 3.05]]) {
  const v = vs1g(m, CLm); console.log(`${n.padEnd(28)} VS1g ${f(v)} Vat=1.23VS1g ${f(1.23 * v)} -> ${1.23 * v < 141 ? 'C' : 'D'}`);
}
// ── ระยะหยุดตาม autobrake (ค่าประมาณแบบจลน์): s = V*t_d + V^2/(2a); a จาก Flying Engineer [L15] ──
const stop = (Vkt, a, td) => { const V = Vkt * KT; return f(V * td + V * V / (2 * a), 0); };
for (const [n, V, a, td] of [['LO 1.7 m/s2, delay 4 s, 130 kt GS', 130, 1.7, 4], ['MED 3.0 m/s2, delay 2 s, 130 kt GS', 130, 3.0, 2], ['MED 3.0, 120 kt', 120, 3.0, 2], ['LO 1.7, 120 kt', 120, 1.7, 4]]) console.log('ground roll', n, stop(V, a, td), 'm');
// ── LFL (certified, dry) = actual / 0.6 ──
for (const [n, lfl] of [['Jenkinson A320 1440 m', 1440], ['SKYbrary A20N approach distance 1440 m', 1440], ['SKYbrary A21N 1600 m', 1600]]) console.log(n, '-> actual landing distance (x0.6) =', f(lfl * 0.6, 0), 'm');
// ── air distance 50 ft -> touchdown (flare): ค่าประมาณ s_air = 50 ft / tan(3°) ช่วงร่อนถึงจุดเริ่ม flare + flare ──
console.log('ระยะจาก 50 ft ถึงจุดที่แนวร่อน 3° แตะพื้น =', f(50 * 0.3048 / Math.tan(3 * Math.PI / 180), 0), 'm');
// ── หน่วยแปลงที่ใช้ในตาราง ──
for (const kg of [73500, 64500, 79000, 67400, 97000, 79200, 93500, 77800]) console.log(kg, 'kg =', f(kg / 0.45359237, 0), 'lb');
