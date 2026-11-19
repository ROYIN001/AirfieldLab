| รหัส | เงื่อนไข | ปริมาณที่วัด | ผลคาดหวัง ± tolerance | ที่มา | โมเดลปัจจุบัน |
|---|---|---|---|---|---|
| T-LF-01 | 1,670 lb | MTOW (kg) | 757.499 ± 0.1 | LF1 p1-5; นิยาม lb | 757.5 ✓ |
| T-LF-02 | 1,500 lb | CG หน้าสุด (in DAT) เชิงเส้นระหว่างจุด POH | 31.773 ± 0.01 | LF1 p2-5, LF2 | 31.773 ✓ |
| T-LF-03 | MTOW, S ในบัตร | wing loading (lb/ft²) | 10.5 ± 0.05 | LF1 p1-5 | 10.47 ✓ |
| T-LF-04 | stall แฟลป 0° MTOW idle 1 kt/s 3,000 ft ปีกระดับ | ความเร็วต่ำสุด Vmin (KCAS) | 48 ± 1.5 | LF1 Fig 5-3 (CG หน้า, 40 KIAS) | 48.1 ✓ |
| T-LF-05 | stall แฟลป 10° MTOW idle 1 kt/s 3,000 ft ปีกระดับ | ความเร็วต่ำสุด Vmin (KCAS) | 46 ± 1.5 | LF1 Fig 5-3 (CG หน้า, 40 KIAS) | 46.2 ✓ |
| T-LF-06 | stall แฟลป 30° MTOW idle 1 kt/s 3,000 ft ปีกระดับ | ความเร็วต่ำสุด Vmin (KCAS) | 43 ± 1.5 | LF1 Fig 5-3 (CG หน้า, 35 KIAS) | 43.2 ✓ |
| T-LF-07 | stall แฟลป 30° MTOW idle 1 kt/s (T-LF-06) ค่าที่มาตรวัดแสดง | Vmin แสดงเป็น KIAS ผ่าน speeds.ias_cas | 35 ± 3 | LF1 Fig 5-3 (35 KIAS = 43 KCAS) | 40.3 ✗ — Fig 5-1 เริ่มที่ 40 KIAS จึง extrapolate ช่วง stall ไม่ได้ (KIAS ของ Fig 5-3 เป็นค่าโดยประมาณจาก calibration แบบ power off) ต้องเพิ่มจุดจาก stall_table (งาน P2) |
| T-LF-08 | SL ISA MTOW คันเร่งเต็ม แฟลปขึ้น | ROC สูงสุด (fpm) | 715 ± 40 | LF1 หน้าสเปก, Fig 5-5 | 727 ✓ |
| T-LF-09 | เดียวกับ T-LF-08 | Vy (KCAS) | 66.3 ± 3 | LF1 p4-3 (67 KIAS) | 59.7 ✗ — ซิมมี polar เดียวจาก glide (รวมแรงต้านใบพัดหมุนฟรี) จึง Vy ต่ำ (หัวข้อ 01 §01.8.3) |
| T-LF-10 | เดียวกับ T-LF-08 | Vx (KCAS) | 56.5 ± 3 | LF1 p4-3 (55 KIAS) | 56 ✓ |
| T-LF-11 | 3,000 ft แรงขับศูนย์ แฟลปขึ้น MTOW | L/D สูงสุด / ความเร็ว (KEAS) | 9.114 / 60 ± 0.3 / 2 | LF6 (1.5 NM/1,000 ft), LF1 p3-3 | 9.112 / 59.9 ✓ |
| T-LF-12 | เดียวกับ T-LF-11 | อัตราจม (fpm) = V_TAS/(L/D) | 696 ± 30 | ฟิสิกส์ (TAS ที่ 3,000 ft) | 693 ✓ |
| T-LF-13 | วิ่งขึ้น SL ISA MTOW แฟลป 10 VR 52 KCAS θ 12° ลมสงบ | ground roll (m) | 221 ± 20 % | LF1 หน้าสเปก/Fig 5-4 | 255 ✓ — POH ใช้เทคนิค short field (tail low) ล้อพ้นพื้นเร็วกว่า; ซิมพ้นพื้นที่ 61.3 kt |
| T-LF-14 | เดียวกับ T-LF-13 | ระยะถึง 50 ft (m) | 408 ± 15 % | LF1 | 419 ✓ |
| T-LF-15 | ลงจอด SL ISA MTOW แฟลป 30 autoland ของซิม เบรกเต็มหลังล้อหน้าแตะ | ground roll (m) | 145 ± 20 % | LF1 หน้าสเปก, ตารางลงจอด p5-19 | 167 ✓ |
| T-LF-16 | เดียวกับ T-LF-15 | ระยะจาก 50 ft (m) | 366 ± 15 % | LF1 (54 KIAS ที่ 50 ft, power off) | 472 ✗ — autoland ของซิมข้าม 50 ft ที่ 54.5 kt บนเส้นร่อน 3° (ระยะในอากาศ 305 m เทียบ POH 221 m) |
| T-LF-17 | SL ISA MTOW คันเร่งเต็ม บินระดับ | ความเร็วสูงสุด (KTAS) | 110 ± 5 | LF1 หน้าสเปก | 95.6 ✗ — polar จาก glide แรงต้านสูงกว่า cruise ~24 % (lf_calc) งาน P2 |
| T-LF-18 | trim 90 KCAS 3,000 ft แฟลปขึ้น MTOW CG อ้างอิง | คันเร่ง และ δe | thr 0.6–1.0; δe ภายในระยะเคลื่อน −25…+18° (ค่าออกแบบ −2.5°) ± ช่วง | LF1 Fig 5-7 (59–66 % ที่ 91–96 KTAS); δe ค่าประมาณจากการตั้ง Cm0 | thr 0.9, δe -2.5° ✓ |
| T-LF-19 | approach 61 KCAS แฟลป 30 γ −3° MTOW | α, θ, คันเร่ง | α 3–6°, θ −1 ถึง +3°, thr 0.2–0.6 ± ช่วง | บัตร 08 §08.1.2 (pitch ใกล้ C172) + ฟิสิกส์ | α 3.7, θ 0.7, thr 0.358 ✓ |
| T-LF-20 | linearise ที่ approach (T-LF-19) | short period ζ และ CAP (Level 1 Cat C) | ζ 0.35–1.30; CAP 0.15–3.6 ± ช่วง | MIL-F-8785C (R1:V8) | ζ 0.739, ωn 3.999, CAP 2.657 ✓ |
| T-LF-21 | เดียวกับ T-LF-20 | Dutch roll, roll mode, spiral (Level 1 Class I Cat C) | ζ ≥ 0.08, ωn ≥ 0.4, ζωn ≥ 0.15; τR ≤ 1.0 s; spiral t2 ≥ 12 s ถ้าลู่ออก ± ช่วง | MIL-F-8785C (R1:V8) | DR 1.907/0.352, τR 0.175, spiral conv t2 162.8 s ✓ |
| T-LF-22 | VTBD PA 0 ft OAT 35 °C MTOW แฟลป 10 (ซิม isaDev +20 K) | ground roll / ถึง 50 ft (m) | 257 / 472 ± 20 % / 15 % | LF1 Fig 5-4 interpolate 30–40 °C | 272 / 440 ✓ — ซิมเพิ่มระยะเฉพาะจาก TAS ที่สูงขึ้น แรงขับไม่ลดตาม ρ |
| T-LF-23 | เดียวกับ T-LF-22 ไต่ SL | ROC สูงสุด (fpm) | 648 ± 40 | LF1 Fig 5-5 interpolate 20–40 °C | 728 ✗ — thrustAvail ไม่มี ρ |
| T-LF-24 | BEM ใบ 69×58 หลังปรับ chord ให้รอบสถิต 2,330 rpm; cruise 2,400 rpm 101 KTAS 2,000 ft | กำลังที่ใบพัดดูด (% ของ 110 hp) | 75 ± 10 | LF1 Fig 5-7 | 68.9 ✓ — ตรวจ pitch 58 in จากรหัสรุ่น |
| T-LF-25 | C150H 1,600 lb แฟลป 40 power off (ใช้ CLmax แฟลป 30 ของ C152) | ความเร็วต่ำสุด (KCAS) | 41.7 ± 2 | LF8 Fig 5-2 (48 mph CAS) | 42.1 ✓ — สูตร lm_polar (ไม่ใช่ซิม): แฟลป 40° ให้ CLmax สูงกว่า 30° เพียง ~2 % |
| T-LF-26 | stall แฟลปขึ้น CG หน้า เอียง 60° (speeds.stall_table) | KCAS เทียบ V0/√cos φ | 67.9 ± 1.5 | ฟิสิกส์; LF1 Fig 5-3 | 68 ✓ — ตรวจตารางในบัตร (ไม่ใช่ซิม) |
| T-LF-27 | speeds.ias_cas แฟลป 30 ที่ 85 KIAS และแฟลป 10 ที่ 60 KIAS | KCAS | 87 / 61 ± 0.5 / 0.5 | LF1 p2-3 (VFE 85 KIAS = 87 KCAS), LF5 Fig 5-1 | 87 / 61 ✓ — ตรวจข้อมูลในบัตร (ไม่ใช่ซิม) |
| T-LF-28 | วิ่งขึ้น SL ISA MTOW แฟลป 10 ลมปะทะ 9 kt (performance.corrections) | ground roll (ft) | 652.5 ± 1 | LF5 หมายเหตุ Fig 5-4 (−10 % ต่อ 9 kt), LF1 หน้าสเปก | 652.5 ✓ — ตรวจข้อมูลในบัตร; เมื่อซิมรองรับลมในการทดสอบวิ่งขึ้นให้เทียบผลซิมกับค่านี้ ±20 % |
