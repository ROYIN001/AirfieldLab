# 10. การตรวจความสมจริง: objective tests และ handling qualities

← [กลับไปหน้ารวมรอบที่ 1](../01-flight-physics.md) · [schema พารามิเตอร์](schema.md)

> ความเชื่อมั่นโดยรวม: กลาง · แหล่งหลัก: 14 CFR Part 60 Appendix A/B (Table A2A, B2A) [V1, V2, V3] · MIL-F-8785C ตามที่รายงาน NASA ถอดตารางไว้ [V7, V8, V9] · NASA TN D-5153 (Cooper–Harper) [V12] · 14 CFR 25.103 / AC 23-8C / Part 23 §§23.2110–23.2130 [V16, V17, V18]

## 10.0 สรุปสั้น
- ตอนนี้ AirfieldLab ยังไม่มีการทดสอบแบบที่ตกได้เลย ไฟล์ `test/*.mjs` ทุกไฟล์พิมพ์ผลออกจอเฉย ๆ (`grep -c assert` ได้ 0 ทุกไฟล์) และ CI รันแค่ `geo` กับ `runways` (`.github/workflows/pages.yml:26`) ถ้าใครแก้โมเดลการบินจนพัง CI ก็ยังผ่าน งานแรกที่ควรทำคือชุด `test/*.test.mjs` ที่ใช้ `node:test` กับ `node:assert` ซึ่งมีมากับ Node อยู่แล้ว
- ผลวัดโมเดลปัจจุบันด้วยสคริปต์ linearisation ที่ไม่ใช้ไลบรารีภายนอก (10.5) ช่วง approach 95 kt (48.9 m/s) แฟลปลง ได้ short period ωn 2.22 rad/s, ζ 0.58, CAP 0.95, phugoid ζ 0.115 (คาบ 25.5 s), Dutch roll ωn 1.61 rad/s, ζ 0.139, ζωn 0.225, roll mode τR 0.22 s และ spiral เสถียร (เวลาลดลงครึ่งหนึ่ง 36 s) **ทุกค่าอยู่ใน Level 1 ของ Class I Category C** ส่วนผลจำลองไม่เชิงเส้นที่ 240 Hz ตรงกับค่าเชิงเส้นภายใน 2–3 %
- จุดที่เป็นปัญหาเชิงความสมจริงไม่ได้อยู่ที่โหมดพลวัต แต่อยู่ที่สมรรถนะ ข้อแรก แรงขับที่ idle เป็นบวกเสมอ (`AC.idle` 0.045) ทำให้ glide ratio ที่ idle ออกมา 21.7 ทั้งที่ L/D สูงสุดทางอากาศพลศาสตร์มีแค่ 16.5 ข้อสอง `thrustAvail(V)` ไม่ขึ้นกับความหนาแน่นอากาศ ROC ที่ 5,000 ft (1,524 m) จึงสูงกว่าที่ระดับน้ำทะเล (3,264 กับ 3,225 fpm (16.6 กับ 16.4 m/s)) ข้อสาม ไม่มีแบบจำลองแรงที่คันบังคับ จึงทำการทดสอบ static control และ stick force/g ตาม Part 60 ไม่ได้
- `adot` (α̇) อัปเดตใน `updateAir()` นอก `deriv()` (`src/20-flight.js:275`) ถ้า linearise `deriv()` ตรง ๆ จะไม่ได้ผลของ Cmα̇ และ ζsp จะต่ำไปจาก 0.578 เหลือ 0.491 สคริปต์ในหัวข้อนี้จึงใส่ α̇ แบบ quasi-steady ให้แทน
- เครื่องฝึกในเกมของเราอยู่ใน **Class I** (small, light airplanes) และงานลงจอดเป็น **Category C** [V7, V10] เกณฑ์ที่ใช้ทดสอบได้ทันทีมี 4 ชั้น คือ (1) ความสอดคล้องภายใน (trim สมดุล, ผลไม่เชิงเส้นตรงกับเชิงเส้น) (2) ขอบเขต Level 1 ของ MIL-F-8785C (3) ค่าสมรรถนะที่วัดตามวิธีทดสอบการบินของ FAA เช่นลดความเร็วไม่เกิน 1 kt/s ตอนหา stall [V16, V17] และ (4) tolerance ของ Part 60 Table A2A เมื่อมีค่าอ้างอิงของเครื่องจริงในรอบถัดไป
- ข้อมูลบินจริงของเครื่องฝึก turboprop ที่เป็นสาธารณะและเปิดอ่านได้ยังหาไม่พบ ตัวเลข "ค่าทั่วไป" ในหัวข้อนี้จึงมาจากรายงาน NASA, เอกสารสอน และโมเดลเปิดของ JSBSim ซึ่งระบุความเชื่อมั่นไว้ทุกค่า

## 10.1 สภาพปัจจุบันใน AirfieldLab

**โค้ดที่เกี่ยวข้อง**
- `AC` (`src/20-flight.js:100–118`) เก็บ derivative แบบเชิงเส้นเป็นค่าคงที่ เช่น Cmα −0.72, Cmq −12.5, Cmα̇ −4.5, Clp −0.47, Cnr −0.14, Cnβ 0.075 และค่า Vref 88, Vapp 95, Vs0 71 kt
- `deriv()` (`:165–239`) รวมแรงและโมเมนต์ทั้งหมด แต่ใช้ค่า `this.adot` ที่ถูกแช่ไว้ ค่านี้อัปเดตครั้งเดียวต่อ step ใน `updateAir()` (`:275`) ผ่านตัวกรองอันดับหนึ่ง τ = 0.05 s
- `thrustAvail(V)` (`:144`) คือ T₀·V_c/√(V²+V_c²) โดย V_c = ηP/T₀ = 48.7 m/s ไม่มีพจน์ที่ขึ้นกับ ρ หรืออุณหภูมิ และ `actuators()` (`:248`) บังคับให้ `thr ≥ AC.idle` = 0.045
- `setApproach()` (`:295–331`) หาค่า trim แบบปิดรูปบนเส้น 3° แต่ไม่มีตัว trim ทั่วไปสำหรับบินระดับ ไต่ หรือร่อน
- `test/stall.test.mjs` กวาด CL(α) ด้วย state สังเคราะห์ แล้วคำนวณ Vs จาก CLmax ที่ 1 g ยังไม่มีการจำลองการลดความเร็ว 1 kt/s
- `test/flight.test.mjs` พิมพ์ความเร่งตอน trim และผล autoland ส่วน `test/assist.test.mjs` จำลองผู้เล่นตาม flight director ทั้งสองไฟล์ไม่มี assertion

**ผลวัดด้วย Node** (สคริปต์ `v10_modes.mjs`, `v10_timeresp.mjs`, `v10_perf.mjs`, `v10_extra.mjs`, `v10_misc.mjs` ใน `scripts/` ใช้ ISA และลมสงบ มวล 2,250 kg)

| รายการ | approach 95 kt IAS, flaps 1, gear down, 300 m, γ −3° | cruise 155 kt IAS, clean, 3,000 ft | เกณฑ์ Level 1 (Class I) |
|---|---|---|---|
| trim: α / θ / δe / thr | 1.73° / −1.27° / −3.82° / 0.244 | 1.04° / 1.04° / +1.59° / 0.289 | – |
| short period ωn, ζ | 2.221 rad/s, 0.578 (α̇ ถูกแช่: 2.226, 0.491) | 3.593 rad/s, 0.560 | ζ 0.35–1.30 (Cat C) / 0.30–2.00 (Cat B) ✓ |
| n/α, CAP | 5.19 g/rad, 0.951 | 13.81 g/rad, 0.935 | 0.16 ≤ CAP (Cat C) ✓ |
| phugoid คาบ, ζ, t½ | 25.5 s, 0.115, 24.3 s | 42.5 s, 0.073, 64.0 s | ζ ≥ 0.04 ✓ |
| Dutch roll ωn, ζ, ζωn, คาบ | 1.611, 0.139, 0.225, 3.94 s | 2.525, 0.145, 0.366, 2.52 s | ζ ≥ 0.08, ζωn ≥ 0.15; ωn ≥ 1.0 (Cat C ตาม [V10]) หรือ ≥ 0.4 (Cat B [V11]) ✓ |
| roll mode τR | 0.218 s | 0.138 s | ≤ 1.0 s ✓ |
| spiral | เสถียร, t½ 36.2 s | เสถียร, t½ 86.6 s | T₂ ≥ 12 s (เสถียรผ่านเสมอ) ✓ |
| aileron เต็มจากปีกระดับถึง 30° | 0.80 s (p คงตัว 62°/s) | 0.53 s (90°/s) | 30° ใน 1.3 s ✓ |

เรื่องอื่นที่วัดได้ (รายละเอียดใน 10.6)
- stall เมื่อลดความเร็ว 1 kt/s ที่ idle ได้ V_SR 71.9 kt (แฟลปลง, ล้อลง) และ 79.6 kt (clean)
- Vy 128 kt และ ROC สูงสุด 3,225 fpm ที่ระดับน้ำทะเล
- glide ratio 16.5 เมื่อแรงขับเป็นศูนย์ และ 21.7 ที่ idle
- ระยะ takeoff ถึง 50 ft คือ 590 m ที่แฟลป 0
- ระยะลงจอดจาก 50 ft คือ 714 m ถ้าเบรกเต็ม และ 950 m ถ้าใช้ autoland ตามที่ตั้งไว้

**สิ่งที่ขาดหรือผิด**
(1) ไม่มี assertion และ CI ไม่ได้รันการทดสอบการบิน
(2) ไม่มีตัว trim ทั่วไปและตัว linearise ทำให้ปรับค่าในรอบหน้า เช่นใบพัด, P-factor หรือ stall แบบใหม่ ได้โดยไม่มีใครเห็นว่าโหมดหลุดจาก Level 1
(3) แรงขับ idle เป็นบวก และไม่มีโหมดเครื่องดับหรือ feather จึงทดสอบการร่อนหลังเครื่องดับตาม §23.2125 ไม่ได้ [V18]
(4) ไม่มีแรงที่คันบังคับ การทดสอบ 2.a.x, 2.c.6 และ 2.c.7 ของ Part 60 [V2] จึงต้องเปลี่ยนไปเทียบตำแหน่งคันบังคับกับตำแหน่งพื้นบังคับแทน
(5) ตอน approach θ ออกมา −1.27° จาก `trim()` (−1.24° จาก `setApproach()` ซึ่งได้ α 1.76°) คือจมูกต่ำกว่าขอบฟ้าบนเส้นร่อน 3° ค่านี้ขัดกับภาพที่นักบินคุ้น แต่หัวข้อนี้ไม่ได้หาแหล่งอ้างอิงตัวเลขของเครื่องจริงไว้ ให้ส่งต่อเป็นข้อสังเกตแก่ส่วน aero ในรอบ 2

## 10.2 Objective tests ของอุปกรณ์ฝึกบินจำลอง (Part 60, ICAO 9625, CS-FSTD(A))

**กรอบกฎหมาย**
- 14 CFR Part 60 Appendix A ใช้กับ Full Flight Simulator ระดับ A–D ทุกระดับต้องผ่าน objective tests ใน Attachment 2, Table A2A ด้วยการเทียบผลซิมกับข้อมูลบินจริงตาม tolerance ที่กำหนด [V1] ผลการทดสอบเหล่านี้พร้อมข้อมูลอ้างอิงรวมอยู่ในเอกสาร Qualification Test Guide (QTG) ซึ่งเป็นเอกสารหลักที่ผู้ประเมินใช้ ชุดทดสอบใน 10.7 จึงทำหน้าที่คล้าย QTG แบบอัตโนมัติของเครื่องเรา
  - ใน eCFR ฉบับปัจจุบัน ตัว Table A2A เป็นภาพ (ER09DE22.017–.050; รหัสภาพยังไม่ยืนยันในรอบตรวจ) ไม่ใช่ข้อความ [V1] ตารางนี้ถูกแก้ล่าสุดโดย "Miscellaneous Amendments" ฉบับ 9 ธ.ค. 2022 [V23]
  - ตัวเลข tolerance ที่ยกมาในหัวข้อนี้จึงคัดจากฉบับถอดความของ RisingUp [V2] ซึ่งเป็นข้อความ CFR ฉบับก่อนการแก้ไขปี 2016 (แถว stall ยังเป็นแบบเก่า) และเทียบกับ Appendix B ใน CFR ฉบับปี 2014 ของ govinfo ซึ่งเป็นแหล่งปฐมภูมิ [V3]
  - ค่า phugoid, climb, stall warning และ longitudinal trim ตรงกันทั้งสองแหล่ง
- Appendix B ใช้กับ Flight Training Device [V3]
  - Level 4 ไม่ต้องมี objective test
  - Level 5 "requires only generic aerodynamic programming"
  - Level 6 ต้องเป็นแบบจำลองเฉพาะรุ่น
- ICAO Doc 9625 Volume I ฉบับที่ 4 (2015) เป็นคู่มือกลางที่ประเทศสมาชิกใช้กำหนดประเภทและเกณฑ์ของ FSTD [V4] และเป็นลิขสิทธิ์ของ ICAO (ราคา 623 USD) จึงสรุปได้เฉพาะสิ่งที่แหล่งเปิดอ้างถึง
  - เอกสารแนวทางฉบับร่างของ EASA ระบุว่า 9625 ใช้ระดับความเหมือนสามระดับ คือ specific, representative และ generic [V6]
  - การแบ่ง FSTD เป็นประเภท I–VII ใน 9625 ยังไม่ได้ยืนยันจากต้นฉบับ
- EASA CS-FSTD(A) Issue 2 (ED Decision 2018/006/R, 3 พ.ค. 2018) ครอบคลุม FFS A–D, FTD 1–2, FNPT I/II/MCC และ BITD [V5] ข้อความสองตอนที่ตรงกับ AirfieldLab มากที่สุดคือ
  - "For FNPTs and BITDs, class-specific modelling is acceptable"
  - การประเมินครั้งแรกบางรายการใช้ได้เพียง "correct trend and magnitude (CT&M)"

**ความหมายต่อ AirfieldLab** AirfieldLab ไม่ได้ขอการรับรอง แต่ระดับความลึกที่ตั้งเป้าได้อย่างสมเหตุผลมีสองระดับ
- สำหรับเครื่องฝึกสมมติของเรา ให้ใช้แนวทาง class-specific หรือ generic แบบ FTD Level 5 หรือ FNPT [V3, V5] คือเทียบกับเกณฑ์ของ class และใช้ CT&M
- สำหรับเครื่องจริงที่จะเพิ่มในรอบถัดไป (C172S, DA40/42, ATR 72, 737, A320) ให้ใช้ tolerance ของ Table A2A เทียบกับตัวเลขจาก POH/AFM หรือ TCDS แบบ "proof of match"

ตารางต่อไปนี้คัดเฉพาะรายการที่วัดได้ในซิมเบราว์เซอร์

| ข้อ (A2A) | รายการ | tolerance | สภาวะ | ใช้ใน AirfieldLab |
|---|---|---|---|---|
| 1.b.1 | Ground acceleration time and distance | ±5 % เวลาและระยะ หรือ ±5 % เวลาและ ±200 ft (61 m) | Takeoff | T-V-14 |
| 1.b.4 | Normal takeoff | ±3 kt, ±1.5° pitch และ AoA, ±20 ft | brake release ถึง 200 ft AGL | T-V-14 (ภายหลัง) |
| 1.c.1 | Normal climb, all engines | ±3 kt, ±5 % หรือ ±100 fpm; บันทึก ≥ 1,000 ft | Clean | T-V-12 |
| 1.d.1 / 1.d.2 | Level flight acceleration / deceleration (≥ 50 kt) | ±5 % เวลา | Cruise | 10.6 (regression) |
| 1.d.4 | Idle descent | ±3 kt, ±5 % หรือ ±200 fpm | Clean | T-V-13 |
| 1.e.1 | Stopping, manual wheel brakes, dry | ±5 % เวลา; ระยะ ≤ 4,000 ft: ±200 ft หรือ ±10 % (ค่าที่เล็กกว่า) | Landing | T-V-15 |
| 1.f.1 / 1.f.2 | Engine acceleration / deceleration | ±10 % Tt และ ±10 % Ti หรือ ±0.25 s | Approach / Ground | ส่วน turboprop (sec 4) |
| 2.c.1 | Power change dynamics | ±3 kt, ±100 ft, ±20 % หรือ ±1.5° pitch; บันทึกตั้งแต่ 5 s ก่อนถึง 15 s หลังเปลี่ยนกำลัง | Approach | 10.6 (regression) |
| 2.c.5 | Longitudinal trim | ±0.5° trim surface, ±1° elevator, ±1° pitch, ±5 % net thrust | Cruise, Approach, Landing | T-V-01 |
| 2.c.8 | Stall characteristics (ฉบับก่อน 2016) | ±3 kt สำหรับ initial buffet, stall warning, stall speed; ±2° bank ที่ความเร็วสูงกว่า stick shaker หรือ initial buffet | Second segment climb, Approach/Landing (เข้าที่ idle หรือใกล้ idle) | T-V-11 |
| 2.c.9 | Phugoid dynamics | ±10 % คาบ, ±10 % t½ หรือ t₂ หรือ ±0.02 ζ; บันทึก 3 รอบเต็มหรือพอหา t½/t₂ (เลือกที่น้อยกว่า) | Cruise | T-V-08 |
| 2.c.10 | Short period dynamics | ±1.5° pitch หรือ ±2°/s q, ±0.10 g | Cruise | T-V-02 |
| 2.d.2 | Roll response (rate) | ±10 % หรือ ±2°/s; ใช้คันบังคับราว ⅓ | Cruise, Approach | T-V-07 |
| 2.d.4 | Spiral stability | correct trend และ ±2° หรือ ±10 % bank ใน 20 s | Cruise, Approach | T-V-10 |
| 2.d.7 | Dutch roll (yaw damper off) | ±0.5 s หรือ ±10 % คาบ, ±10 % t½ หรือ ±0.02 ζ; ≥ 6 รอบ | Cruise, Approach | T-V-09 |
| 2.d.8 | Steady state sideslip | ที่ตำแหน่ง rudder ที่กำหนด: ±2° bank, ±1° β (ส่วน ±10 % หรือ ±2° aileron ยังไม่ยืนยันในรอบตรวจ); อย่างน้อยสองตำแหน่ง rudder และเครื่องใบพัดต้องทดสอบทั้งสองทิศ | Approach/Landing | หลังมีโมเดลใบพัด (sec 3) |
| 2.e.1 | Normal landing | ±3 kt, ±1.5° pitch และ AoA, ±10 % หรือ ±10 ft | 200 ft ถึงล้อหน้าแตะ | T-V-15 (ภายหลัง) |

ที่มา: Table A2A ตาม [V2] และตรวจข้ามกับ Table B2A [V3] สำหรับข้อ 1.c.1, 2.c.5, 2.c.8 และ 2.c.9 ใน Appendix B ข้อ ground acceleration (1.b.1) ใช้ "±5 % time or ±1 sec" และกำหนดเฉพาะเมื่อขอ credit ฝึก RTO [V3]

**วิธีใช้ tolerance ในโค้ด** Part 60 มักเขียน tolerance เป็นคู่ เช่น "±10 % หรือ ±2°/s" กฎทั่วไปใน Attachment 2 ข้อ 2.b ของฉบับถอดความ [V2] เขียนว่า "When two tolerance values are given for a parameter, the less restrictive may be used unless otherwise indicated." คือใช้ค่าที่หลวมกว่าได้ ยกเว้นรายการที่เขียนไว้เป็นอย่างอื่น เช่นข้อ 1.e.1 ที่ระบุ "whichever is smaller" ฟังก์ชันตรวจจึงใช้ค่าตั้งต้น `rule = 'larger'` และรับโหมด `'smaller'` เป็นพารามิเตอร์

$$
\text{pass} \iff |y_{sim}-y_{ref}| \le \begin{cases}\max\!\big(p\,|y_{ref}|,\;a\big) & \text{rule = larger}\\ \min\!\big(p\,|y_{ref}|,\;a\big) & \text{rule = smaller}\end{cases}
$$

ตัวแปรในสมการ
- $y_{sim}$ คือค่าที่ซิมวัดได้ และ $y_{ref}$ คือค่าอ้างอิง (หน่วยเดียวกัน)
- $p$ คือ tolerance แบบสัดส่วน (เช่น 0.10)
- $a$ คือ tolerance แบบสัมบูรณ์ในหน่วยของ $y$

```js
// test/lib/tol.mjs
export function within(sim, ref, { pct = 0, abs = 0, rule = 'larger' } = {}) {
  const p = (pct / 100) * Math.abs(ref);
  const lim = rule === 'smaller' ? Math.min(p || Infinity, abs || Infinity) : Math.max(p, abs);
  return { ok: Math.abs(sim - ref) <= lim, err: sim - ref, lim };
}
```

## 10.3 Handling qualities: MIL-F-8785C, MIL-STD-1797A และ Cooper–Harper

**Class, Category และ Level**
- MIL-F-8785C (5 พ.ย. 1980) แบ่งเครื่องบินเป็น Class I–IV [V8]
  - Class I คือ "small, light airplanes" [V10]
  - ช่วงบินแบ่งเป็น Category A, B และ C โดย Category C คือ terminal flight phases ได้แก่ takeoff, approach, wave-off/go-around และ landing ซึ่ง "usually require accurate flight-path control" [V10, V22]
  - Level 1/2/3 แทนคุณภาพการบังคับจาก "เพียงพอชัดเจน" ลงไปจนถึง "ยังควบคุมได้" (คำอธิบายทั่วไป ยังไม่ได้ยกข้อความต้นฉบับ)
- ต้นฉบับ MIL-F-8785C ที่ everyspec เป็นภาพสแกนซึ่งเครื่องมืออ่านข้อความไม่ได้ ตัวเลขข้างล่างจึงมาจากตารางที่รายงานของ NASA ถอดไว้ [V7, V9] และตรวจข้ามกับวิทยานิพนธ์ TU Delft [V10] และเอกสาร MathWorks [V11]
- MIL-STD-1797A น่าจะใช้ค่าชุดเดียวกันในข้อส่วนใหญ่ แต่รอบนี้ไม่ได้เปิดต้นฉบับ จึงยังไม่ยืนยัน

**การจัด class ของเครื่องฝึกในเกม** เราเลือก **Class I** เพราะเป็นเครื่องเบา (2,250 kg) เครื่องยนต์เดียว ใช้ฝึกขั้นต้นและฝึกลงจอด งานหลักของ AirfieldLab คือ approach และ landing ซึ่งเป็น **Category C** ส่วนการตรวจที่ cruise ใช้ Category B ถ้าวันหน้าใช้เครื่องนี้ฝึกผาดโผนแบบเครื่องฝึกนำเข้าเครื่องสมรรถนะสูง ควรตรวจด้วยเกณฑ์ Class IV เพิ่ม (ข้อสรุปนี้เป็นการตีความของผู้เขียน)

| โหมด / เกณฑ์ | Level 1 | Level 2 | Level 3 | ความเชื่อมั่น / ที่มา |
|---|---|---|---|---|
| Short period ζsp (Cat A และ C) | 0.35–1.30 | 0.25–2.00 | ≥ 0.15 | สูง [V7 Table 2, V10] |
| Short period ζsp (Cat B) | 0.30–2.00 | 0.20–2.00 | ≥ 0.15 | สูง [V7 Table 2, V11] (ขอบบนใน V7 อ่านไม่ชัด, V11 ยืนยัน 2.00) |
| CAP = ωsp²/(n/α), Cat C | ≥ 0.16 (ขอบบน 3.6 ยังไม่ยืนยัน) | ≥ 0.096 (ขอบบน 10 ยังไม่ยืนยัน) | – | ต่ำ–กลาง [V9] |
| Phugoid | ζ ≥ 0.04 | ζ ≥ 0 | T₂ ≥ 55 s | กลาง [V10, V11] |
| Dutch roll, Class I, Cat C | ζ ≥ 0.08, ζωn ≥ 0.15, ωn ≥ 1.0 rad/s [V10] (V7 Table 4 ที่ OCR อ่านไม่ชัดให้ 0.4) | ζ ≥ 0.02, ωn ≥ 0.4 [V11]; ζωn ≥ 0.05 ยังไม่ยืนยัน | ζ ≥ 0, ωn ≥ 0.4 (ยังไม่ยืนยัน) | กลาง: ζ และ ζωn ของ L1 ยืนยันสองแหล่ง ωn ของ L1 แหล่งขัดกัน (ดู 10.10 ข้อ 3) [V7 Table 4, V10, V11] |
| Roll mode τR สูงสุด, Class I, Cat C | 1.0 s | 1.4 s | 10 s (ยังไม่ยืนยัน: V7 Table 5 ให้ 10 s เฉพาะ Cat B ส่วน Cat C เป็นช่องว่าง) | กลาง [V7 Table 5, V10] |
| Spiral: T₂ ต่ำสุด, Cat A และ C | 12 s | 8 s | 4 s | สูง [V7 Table 6, V10] |
| Roll performance, Class I, Cat C (Δφ = 30°) | 1.3 s | 1.8 s (ยังไม่ยืนยัน) | 2.6 s (ยังไม่ยืนยัน) | ต่ำ–กลาง [V10] |
| Allowable response delay | 0.10 s | 0.20 s | 0.25 s | กลาง [V7 Table 3] |

**สมการของแต่ละโหมด** ค่าเฉพาะ (eigenvalue) $\lambda=\sigma\pm j\omega_d$ [1/s] แปลงเป็นค่าที่ใช้กับเกณฑ์ได้ดังนี้

$$
\omega_n=|\lambda|,\quad \zeta=-\frac{\sigma}{\omega_n},\quad T=\frac{2\pi}{\omega_d},\quad t_{1/2}=\frac{\ln 2}{-\sigma}\;(\sigma<0),\quad t_{2}=\frac{\ln 2}{\sigma}\;(\sigma>0),\quad \tau=-\frac{1}{\lambda}\;(\lambda\in\mathbb{R})
$$

$$
\mathrm{CAP}=\frac{\omega_{sp}^2}{n/\alpha},\qquad \frac{n}{\alpha}=\frac{\bar q\,S\,C_{L\alpha}}{W}
$$

ตัวแปรในสมการ
- $\omega_n$ [rad/s] คือความถี่ธรรมชาติ และ $\zeta$ [–] คืออัตราส่วนความหน่วง
- $T$ [s] คือคาบของการแกว่งที่หน่วงแล้ว
- $t_{1/2}$ และ $t_2$ [s] คือเวลาที่แอมพลิจูดลดลงครึ่งหนึ่ง และเวลาที่เพิ่มเป็นสองเท่า
- $\tau$ [s] คือค่าคงตัวเวลาของโหมดที่ไม่แกว่ง (roll, spiral)
- $\bar q$ [Pa] คือความดันพลวัต, $S$ [m²] คือพื้นที่ปีก, $C_{L\alpha}$ [1/rad] คือความชันของเส้นแรงยก, $W$ [N] คือน้ำหนัก
- $n/\alpha$ มีหน่วย g/rad และ CAP มีหน่วย 1/(g·s²)

Level ของโหมดคือ Level ที่แย่ที่สุดในบรรดาเกณฑ์ย่อยของโหมดนั้น

**Equivalent time delay ในเบราว์เซอร์** เกณฑ์ 0.10 s ของ Level 1 [V7] ใช้กับสายทั้งเส้น ตั้งแต่ปุ่มหรือคันบังคับ ผ่านเฟรมฟิสิกส์ จนภาพเปลี่ยน
- ในโมเดลปัจจุบัน ความเร่ง pitch ขึ้นถึง 50 % ของค่ายอดภายใน 0.02 s หลังสั่ง δe แบบขั้นบันได (`v10_extra.mjs`) เพราะมีแค่ rate limit 70°/s
- ส่วนที่เหลือคือ latency ของเบราว์เซอร์ ได้แก่ เวลารออ่าน input จนถึงเฟรมถัดไป (≤ 16.7 ms ที่ 60 Hz) บวกเวลาวาดและแสดงผลอีก 1–3 เฟรม รวมราว 35–70 ms (ค่าประมาณจากคาบเฟรม ไม่ได้วัดจริง)
- งบนี้จะเกินได้ง่ายเมื่อเพิ่ม Gamepad API ที่ poll ทีละเฟรม หรือเพิ่มตัวกรอง input ควรวัดจริงด้วย `performance.now()` ตอน `keydown` เทียบกับเวลา `requestAnimationFrame` ของเฟรมแรกที่ φ หรือ θ บนจอเปลี่ยน

**Cooper–Harper (NASA TN D-5153, 1969)** [V12] มาตรวัดนี้ให้นักบินตอบคำถามเป็นลำดับ
1. "Is the vehicle controllable?"
2. "Is adequate performance attainable with a tolerable workload?"
3. "Is the vehicle satisfactory without improvement?"

แล้วให้คะแนน 1–3 (satisfactory), 4–6 (unsatisfactory but tolerable), 7–9 (unacceptable) และ 10 (uncontrollable) รายงานยังเน้นว่าต้องนิยามงาน (task) และเกณฑ์ desired หรือ adequate ให้ชัด เช่นความคลาดเคลื่อนตอนผ่านประตู approach หรือการกระจายของจุดแตะพื้น [V12]

AirfieldLab มีครบทั้งสองอย่างใน `Evaluator` แล้ว เช่นช่วงแตะพื้น 300–600 m ที่ถือว่า "perfect" และอัตราจม จึงเพิ่มแบบสอบถาม Cooper–Harper ภาษาไทยในหน้า debrief ได้ โดยใช้เกณฑ์ของ `Evaluator` เป็นนิยาม desired และ adequate

การเทียบคะแนน Cooper–Harper กับ Level (เช่น 1–3.5 คือ Level 1) ไม่มีอยู่ใน TN D-5153 และยังไม่ได้ยืนยันจากแหล่งอื่น

## 10.4 ค่าโหมดทั่วไปตามประเภทเครื่องบิน

ข้อมูลบินจริงที่เป็นตารางของเครื่องฝึก turboprop ยังหาแหล่งสาธารณะที่เปิดอ่านได้ไม่พบ ตารางนี้จึงรวมสามชนิดแหล่งและระบุชนิดไว้ทุกแถว
- การทดสอบการบินของ NASA กับเครื่อง GA [V13]
- เอกสารสอนที่ใช้ข้อมูล 747 [V14]
- ค่าที่ผู้เขียนคำนวณจากโมเดลเปิดของ JSBSim ด้วย `FGLinearization` (`v10_jsb_c172.py`) [V15] ซึ่งเป็นแบบจำลอง **ไม่ใช่ข้อมูลบินจริง**

| เครื่อง / สภาวะ | SP ωn (rad/s), ζ | phugoid คาบ (s), ζ | Dutch roll ωn, ζ (คาบ s) | τR (s) | spiral | ชนิดแหล่ง / ความเชื่อมั่น |
|---|---|---|---|---|---|---|
| GA 7 ลำ (NASA 1966) | "well damped" ทุกลำ | stick-fixed "well damped" | ลำที่ดีที่สุด: คาบ 2–4 s, t½ < 2 s | ดูรูป (ไม่มีตาราง) | ลำหนึ่งไม่ผ่านเกณฑ์ T₂ | ปฐมภูมิ / กลาง [V13] |
| C172 (JSBSim c172x) 100 KCAS, 3,000 ft, clean | 6.50, 0.68 | 32.0, 0.13 | 2.25, 0.16 (2.8) | 0.20 | เสถียร τ 46 s | โมเดลเปิด / ต่ำ [V15] |
| C172 (JSBSim c172x) 65 KCAS, 1,000 ft, flaps 30° | 4.38, 0.67 | 19.7, 0.12 | 1.54, 0.16 (4.1) | 0.30 | เสถียร τ 64 s | โมเดลเปิด / ต่ำ [V15] |
| **เครื่องฝึก AirfieldLab** approach 95 kt | 2.22, 0.58 | 25.5, 0.115 | 1.61, 0.14 (3.9) | 0.22 | เสถียร t½ 36 s | โมเดลปัจจุบัน [V19] |
| **เครื่องฝึก AirfieldLab** cruise 155 kt | 3.59, 0.56 | 42.5, 0.073 | 2.53, 0.15 (2.5) | 0.14 | เสถียร t½ 87 s | โมเดลปัจจุบัน [V19] |
| 737 (JSBSim) 140 KCAS, 1,500 ft, flaps เต็ม, gear down | 1.05, 0.54 | 37.2, 0.066 | 1.09, 0.24 (5.9) | 0.98 | เสถียร τ 14.5 s | โมเดลเปิด / ต่ำ [V15] |
| 737 (JSBSim) 280 KCAS, 25,000 ft | 1.73, 0.42 | 93.3, 0.037 | 2.05, 0.34 (3.3) | 0.79 | เสถียร τ 16.7 s | โมเดลเปิด / ต่ำ [V15] |
| 747, M 0.8, 40,000 ft | 0.962, 0.387 | ωn 0.0673, ζ 0.049 → คาบ 93.5 s (ค่าประมาณ: 2π/(ωn√(1−ζ²))) | – | – | – | ทุติยภูมิ (เอกสารสอน: ตัวเลขโหมดจาก Lecture 7, สภาวะ 40,000 ft จาก Lecture 9 ซึ่งระบุว่าข้อมูลมาจาก Etkin และ Reid) / กลาง [V14] |

**ข้อสังเกต**
- short period ของเครื่องฝึกเราช้ากว่า C172 ของ JSBSim ราวครึ่งหนึ่ง (2.2 กับ 4.4 rad/s ที่ approach) ซึ่งเข้าใจได้ เพราะเครื่องเราหนักกว่าราวสองเท่า และ Iyy 7,300 kg·m² สูงกว่ามาก
- ถึงอย่างนั้น CAP 0.95 ก็ยังอยู่กลางช่วง Level 1
- Dutch roll, phugoid และ τR ของเราอยู่ในช่วงเดียวกับเครื่องเบา (คาบ DR 2.5–4 s สอดคล้องกับผล NASA 1966 [V13])
- เมื่อเพิ่มเครื่องในรอบหน้า ควรใช้ตารางนี้เป็นแค่ sanity check ส่วนค่าเป้าจริงต้องมาจากข้อมูลของแต่ละรุ่น
- NASA CR-2144 (Heffley & Jewell, ธ.ค. 1972) มีข้อมูลของเครื่อง 10 แบบ ได้แก่ NT-33A, F-104A, F-4C, X-15, HL-10, Jetstar, CV-880M, B-747, C-5A และ XB-70A [V20] แต่เครื่องมือรอบนี้อ่านได้แค่หน้าบรรณานุกรม จึงยังไม่ได้ดึงตัวเลขออกมา

## 10.5 โหมดเชิงเส้นของโมเดลปัจจุบัน: วิธีและสคริปต์

**สถานะและสมการ** เราใช้สถานะแกนลำตัว $y=[u,v,w,p,q,r,\phi,\theta,\psi]$ ซึ่งความเร็วเป็น m/s, อัตราหมุนเป็น rad/s และมุมเป็น rad โดยมีเงื่อนไขดังนี้
- ใช้แกน FRD โดย α เป็นบวกเมื่อจมูกเงย และ $\alpha=\operatorname{atan2}(w,u)$
- สร้างสถานะ 13 ตัวของ `Aircraft` จาก $y$ ด้วย $q=\mathrm{eulerToQ}(\phi,\theta,\psi)$ และ $v_{NED}=R\,[u,v,w]^T$
- ความเร่งในแกนลำตัวคือ $\dot{\mathbf v}_b=R^T\mathbf a_{NED}-\boldsymbol\omega\times\mathbf v_b$
- อัตราเปลี่ยนของมุมออยเลอร์ใช้สมการจลนศาสตร์มาตรฐาน

Jacobian $A_0=\partial f/\partial y$ หาด้วย central difference

เนื่องจาก `deriv()` ใช้ α̇ ที่ถูกแช่ไว้ เราจึงเติมพจน์ α̇ แบบ quasi-steady

$$
\dot y=A_0\,y+b\,\dot\alpha,\qquad \dot\alpha=c^T\dot y,\quad c=\Big[-\tfrac{w_0}{V^2},0,\tfrac{u_0}{V^2},0,\dots\Big]
\;\Rightarrow\; A=(I-b\,c^T)^{-1}A_0
$$

ตัวแปรในสมการ
- $b=\partial f/\partial(\texttt{adot})$ หาโดยรบกวนค่า `ac.adot` ทีละ ±10⁻⁴ rad/s
- $u_0, w_0$ [m/s] คือความเร็วแกนลำตัวที่ trim และ $V^2=u_0^2+w_0^2$

เมื่อปีกระดับและไม่มีผลของใบพัด เมทริกซ์จะแยกเป็นสองบล็อกได้พอดี (ค่าคู่ควบที่วัดได้คือ 0)
- บล็อกตามยาว $[u,w,q,\theta]$
- บล็อกด้านข้าง $[v,p,r,\phi]$

แต่ละบล็อกขนาด 4×4 หา polynomial ลักษณะเฉพาะด้วย Faddeev–LeVerrier แล้วหารากด้วย Durand–Kerner ทั้งหมดเขียนได้ราว 70 บรรทัดโดยไม่ต้องใช้ไลบรารี

ผลที่ได้ตรงกับการหาค่าเฉพาะของเมทริกซ์ 12 สถานะด้วย `ml-matrix` ในงานของหัวข้อ 9 (`s9_eigen_out.json`) เมื่อแช่ α̇ เหมือนกัน
- short period −1.092 ± 1.94j
- Dutch roll −0.225 ± 1.596j
- roll −4.584
- spiral −0.019

**ตัว trim ทั่วไป** ใช้ Newton สามตัวแปร $(\alpha,\delta_e,\text{thr})$ ที่ γ กำหนด ปีกระดับ จนเศษเหลือของ $(\dot u,\dot w,\dot q)$ ต่ำกว่า 10⁻¹² ถ้าจะหาค่าไต่หรือร่อน ให้สลับตัวแปรเป็น $(\alpha,\delta_e,\gamma)$ แล้วกำหนด thr ตายตัวแทน (ใช้ใน 10.6)

**สคริปต์สำหรับ `test/modes.test.mjs`** (ย่อจาก `scripts/v10_modes.mjs` ถ้าส่งออก `eulerToQ` และ `qToR` จาก harness ได้ ให้ใช้ของ harness แทน `e2q`/`q2R`)

```js
import { M } from './harness.mjs';
const { Aircraft, AC, DEG, KT, G0, atmosphere, FIELD } = M;
const e2q = (f, t, p) => { const [cr, sr, cp, sp, cy, sy] = [Math.cos(f/2), Math.sin(f/2), Math.cos(t/2), Math.sin(t/2), Math.cos(p/2), Math.sin(p/2)];
  return [cr*cp*cy + sr*sp*sy, sr*cp*cy - cr*sp*sy, cr*sp*cy + sr*cp*sy, cr*cp*sy - sr*sp*cy]; };
const q2R = ([w, x, y, z]) => [1-2*(y*y+z*z), 2*(x*y-w*z), 2*(x*z+w*y), 2*(x*y+w*z), 1-2*(x*x+z*z), 2*(y*z-w*x), 2*(x*z-w*y), 2*(y*z+w*x), 1-2*(x*x+y*y)];
const Rv = (R, v) => [0, 3, 6].map(i => R[i]*v[0] + R[i+1]*v[1] + R[i+2]*v[2]);
const RTv = (R, v) => [0, 1, 2].map(i => R[i]*v[0] + R[i+3]*v[1] + R[i+6]*v[2]);
export function f9(ac, y, h) {                        // y = [u v w p q r phi theta psi] (body, SI)
  const [u, v, w, p, q, r, ph, th, ps] = y, Q = e2q(ph, th, ps), R = q2R(Q);
  const s = Float64Array.from([0, 0, -h, ...Rv(R, [u, v, w]), ...Q, p, q, r]), o = new Float64Array(13);
  ac.deriv(s, o); const ab = RTv(R, [o[3], o[4], o[5]]), t = Math.tan(th), c = Math.cos(th);
  return [ab[0] - (q*w - r*v), ab[1] - (r*u - p*w), ab[2] - (p*v - q*u), o[10], o[11], o[12],
    p + (q*Math.sin(ph) + r*Math.cos(ph))*t, q*Math.cos(ph) - r*Math.sin(ph), (q*Math.sin(ph) + r*Math.cos(ph))/c];
}
export function solve(A, b) { const n = b.length, M2 = A.map((r, i) => [...r, b[i]]);
  for (let k = 0; k < n; k++) { let p = k; for (let i = k+1; i < n; i++) if (Math.abs(M2[i][k]) > Math.abs(M2[p][k])) p = i;
    [M2[k], M2[p]] = [M2[p], M2[k]]; for (let i = k+1; i < n; i++) { const f = M2[i][k]/M2[k][k]; for (let j = k; j <= n; j++) M2[i][j] -= f*M2[k][j]; } }
  const x = Array(n).fill(0); for (let i = n-1; i >= 0; i--) { let s = M2[i][n]; for (let j = i+1; j < n; j++) s -= M2[i][j]*x[j]; x[i] = s/M2[i][i]; } return x; }
export function trim(ac, { ias, h, flaps = 0, gear = 0, gammaDeg = 0 }) {     // unknowns alpha, de, thr
  ac.flaps = flaps; ac.gearPos = gear; ac.adot = 0;
  const rho = atmosphere(FIELD.elev + h, ac.isaDev).rho, V = ias*KT/Math.sqrt(rho/1.225), g = gammaDeg*DEG;
  const Y = (a) => [V*Math.cos(a), 0, V*Math.sin(a), 0, 0, 0, 0, a + g, 0];
  const res = (x) => { ac.de = x[1]; ac.thr = x[2]; const f = f9(ac, Y(x[0]), h); return [f[0], f[2], f[4]]; };
  let x = [4*DEG, -2*DEG, 0.4];
  for (let it = 0; it < 30; it++) { const r0 = res(x), J = [[], [], []];
    for (let j = 0; j < 3; j++) { const xp = x.slice(); xp[j] += 1e-6; const r1 = res(xp); for (let i = 0; i < 3; i++) J[i][j] = (r1[i] - r0[i])/1e-6; }
    const dx = solve(J, r0.map(v => -v)); x = x.map((v, i) => v + dx[i]); if (Math.hypot(...dx) < 1e-12) break; }
  res(x); return { V, rho, h, alpha: x[0], de: x[1], thr: x[2], y0: Y(x[0]) };
}
export function linearise(ac, T) {                    // central differences + quasi-steady alpha-dot
  const n = 9, y0 = T.y0, eps = [1e-3, 1e-3, 1e-3, 1e-5, 1e-5, 1e-5, 1e-5, 1e-5, 1e-5], A = [...Array(n)].map(() => Array(n).fill(0));
  for (let j = 0; j < n; j++) { const yp = y0.slice(), ym = y0.slice(); yp[j] += eps[j]; ym[j] -= eps[j];
    const fp = f9(ac, yp, T.h), fm = f9(ac, ym, T.h); for (let i = 0; i < n; i++) A[i][j] = (fp[i] - fm[i])/(2*eps[j]); }
  ac.adot = 1e-4; const fp = f9(ac, y0, T.h); ac.adot = -1e-4; const fm = f9(ac, y0, T.h); ac.adot = 0;
  const b = fp.map((v, i) => (v - fm[i])/2e-4), V2 = y0[0]**2 + y0[2]**2, c = [-y0[2]/V2, 0, y0[0]/V2, 0, 0, 0, 0, 0, 0];
  const E = A.map((_, i) => A.map((_, j) => (i === j ? 1 : 0) - b[i]*c[j])), Ae = A.map(() => Array(n).fill(0));
  for (let j = 0; j < n; j++) { const col = solve(E, A.map(r => r[j])); for (let i = 0; i < n; i++) Ae[i][j] = col[i]; }
  return Ae;
}
export function eig4(A) {                             // Faddeev-LeVerrier + Durand-Kerner
  const n = A.length, c = Array(n + 1).fill(0); c[n] = 1; let Mk = A.map(r => r.map(() => 0));
  for (let k = 1; k <= n; k++) { const AM = A.map(r => r.map((_, j) => r.reduce((s, a, l) => s + a*Mk[l][j], 0)));
    Mk = AM.map((r, i) => r.map((v, j) => v + (i === j ? c[n-k+1] : 0)));
    c[n-k] = -A.reduce((s, r, i) => s + r.reduce((t, a, l) => t + a*Mk[l][i], 0), 0)/k; }
  const P = (zr, zi) => { let pr = 1, pi = 0; for (let k = n-1; k >= 0; k--) { const t = pr*zr - pi*zi + c[k]; pi = pr*zi + pi*zr; pr = t; } return [pr, pi]; };
  let z = [...Array(n)].map((_, k) => [0.4*Math.cos(2.4*k + 0.3) + 0.1, 0.9*Math.sin(2.4*k + 0.3)]);
  for (let it = 0; it < 2000; it++) { let d = 0;
    z = z.map((zk, k) => { const [pr, pi] = P(...zk); let qr = 1, qi = 0;
      z.forEach((zj, j) => { if (j !== k) { const dr = zk[0]-zj[0], di = zk[1]-zj[1], t = qr*dr - qi*di; qi = qr*di + qi*dr; qr = t; } });
      const m = qr*qr + qi*qi, wr = (pr*qr + pi*qi)/m, wi = (pi*qr - pr*qi)/m; d = Math.max(d, Math.hypot(wr, wi)); return [zk[0]-wr, zk[1]-wi]; });
    if (d < 1e-13) break; }
  return z.map(([re, im]) => ({ re, im: Math.abs(im) < 1e-9 ? 0 : im }));
}
// ใช้งาน: const ac = new Aircraft(), T = trim(ac, { ias: 95, h: 300, flaps: 1, gear: 1, gammaDeg: -3 }), A = linearise(ac, T);
// const sub = (A, ix) => ix.map(i => ix.map(j => A[i][j]));   (ตัดเมทริกซ์ย่อย)
// lon = eig4(sub(A,[0,2,4,7])) -> คู่ซับซ้อนที่ |λ| ใหญ่ = short period, เล็ก = phugoid
// lat = eig4(sub(A,[1,3,5,6])) -> คู่ซับซ้อน = Dutch roll, จริงที่ติดลบมากสุด = roll, จริงที่ใกล้ 0 = spiral
// n/alpha = qbar*S*CLalpha/W  (CLalpha หาจาก diag.CL ของ deriv ที่ alpha ± 1e-4)
```

**ข้อจำกัดของวิธีนี้**
- เมื่อเพิ่ม P-factor, torque และ slipstream (sec 3) สองบล็อกจะคู่ควบกัน วิธีแยก 4×4 จะใช้ไม่ได้อีก ต้องเปลี่ยนเป็นหาค่าเฉพาะของเมทริกซ์ 8×8 เต็ม เช่นใช้ Hessenberg reduction ตามด้วย shifted QR ซึ่งเขียนเองได้ราว 100 บรรทัด และให้การทดสอบตรวจขนาดของพจน์คู่ควบ (`coupling`) ทุกครั้ง
- ถ้าย้าย α̇ เข้าไปอยู่ใน `deriv()` (เป็นสถานะกรอง หรือแบบ quasi-steady ในตัว) ก็ไม่ต้องใช้ขั้น $(I-bc^T)^{-1}$ อีก ซึ่งตรงกับข้อเสนอเรื่องให้ `deriv()` เป็นฟังก์ชันบริสุทธิ์ในหัวข้อ 9

**ตรวจซ้ำในโดเมนเวลา** (`v10_timeresp.mjs` ใช้ `Aircraft.step` ที่ 240 Hz และปล่อยคันบังคับตายตัว)

| การทดสอบ | สภาวะ | ผลไม่เชิงเส้น | ผลเชิงเส้น | ต่าง |
|---|---|---|---|---|
| phugoid: δe −2° นาน 2 s, อ่าน V | cruise | T 41.8 s, ζ 0.071 | T 42.5 s, ζ 0.073 | −1.7 %, −0.002 |
| phugoid | approach | T 25.3 s, ζ 0.112 | T 25.5 s, ζ 0.115 | −0.9 %, −0.003 |
| Dutch roll: rudder doublet ±5° (1 s + 1 s), อ่าน β | cruise | T 2.55 s, ζ 0.145 | T 2.52 s, ζ 0.145 | +1.3 %, 0 |
| Dutch roll | approach | T 3.95 s, ζ 0.140 | T 3.94 s, ζ 0.139 | +0.3 %, +0.001 |
| spiral: เอียง 20° แล้วปล่อย อ่าน φ หลัง 20 s | approach | 13.76° | 19.97·e^{λs·20} = 13.61° | +0.15° |
| spiral | cruise | 17.34° | 17.02° | +0.32° |

คาบและ ζ ในตารางหาจากยอดที่มีเครื่องหมายเดียวกันสองยอดติดกัน (log decrement)

$$
\delta=\ln\frac{|A_i|}{|A_{i+2}|},\qquad \zeta=\frac{\delta}{\sqrt{4\pi^2+\delta^2}},\qquad T=t_{i+2}-t_i,\qquad t_{1/2}=\frac{T\ln 2}{\delta}
$$

ตัวแปรในสมการ
- $A_i$ คือแอมพลิจูดของยอดที่ $i$ วัดจากค่า trim
- $t_i$ [s] คือเวลาของยอดนั้น

ทุกแถวผ่าน tolerance ของ Part 60 ข้อ 2.c.9, 2.d.7 และ 2.d.4 สบาย ๆ แม้จะใช้ผลเชิงเส้นของตัวเองเป็นค่าอ้างอิง ผลนี้บอกว่า integrator และ trim ถูกต้อง เราจึงใช้ผลเชิงเส้นเป็น "ข้อมูลอ้างอิงสังเคราะห์" ของการทดสอบโดเมนเวลาได้

## 10.6 แผนตรวจสมรรถนะสำหรับค่าอ้างอิงรอบ 2 (stall, climb, glide, takeoff, landing)

ในรอบ 2 จะมีตัวเลขอ้างอิงจาก POH, AFM หรือ TCDS เข้ามา หัวข้อนี้กำหนดล่วงหน้าว่าซิมต้องวัดแต่ละค่าอย่างไรให้ตรงกับวิธีที่ใช้ทดสอบการบินจริง ทุกขั้นตอนทำงานอัตโนมัติด้วย `Aircraft.step` ที่ 240 Hz และใช้ตัวควบคุมง่าย ๆ ทำหน้าที่แทน "นักบินทดสอบ" (โค้ดเต็มอยู่ใน `scripts/v10_perf.mjs` และ `v10_extra.mjs`) ทุกรายการใช้ ISA, ลมสงบ และมวล 2,250 kg ส่วนค่าที่ทดสอบที่มวลอื่นต้องแก้กลับด้วยสูตรในข้อ (a)

**(a) ความเร็ว stall**
- นิยามทางกฎหมาย
  - Part 23 ปัจจุบันให้หา stall speed หรือ minimum steady flight speed ของทุกโครงแบบ ที่ "idle or zero thrust" [V18]
  - AC 23-8C ให้ trim ที่ "approximately 1.5 VS1 or the minimum speed trim, whichever is greater" แล้วลดความเร็ว "at a rate of one knot per second or less" จนเกิด stall หรือคันบังคับถึง stop [V17] (ขั้นลดความเร็วให้เหลือราว 10 kt เหนือ stall ก่อนเริ่มอัตรา 1 kt/s ยังไม่ยืนยันจากข้อความต้นฉบับ)
  - stall คือเหตุการณ์แรกที่เกิดขึ้นในบรรดา การก้มหัวที่ควบคุมไม่ได้, การก้มหัวจากอุปกรณ์เช่น stick pusher หรือคันบังคับถึง stop ซึ่งต้องค้างไว้อย่างน้อย 2 s [V17]
  - Part 25 กำหนด trim ที่ 1.13–1.30 V_SR และใช้อัตราลดความเร็ว "does not exceed one knot per second" [V16]

$$
V_{SR}\ \ge\ \frac{V_{C_{L\max}}}{\sqrt{n_{zw}}},\qquad V_{S,std}=V_{S,test}\sqrt{\frac{W_{std}}{W_{test}}}
$$

- ตัวแปรในสมการ
  - $V_{C_{L\max}}$ [kt CAS] คือความเร็วขณะสัมประสิทธิ์แรงยกที่แก้ด้วย load factor ถึงค่าสูงสุดครั้งแรก
  - $n_{zw}$ [g] คือ load factor ตั้งฉากกับเส้นทางบินในขณะนั้น [V16]
  - $W$ [N] คือน้ำหนักมาตรฐานหรือน้ำหนักขณะทดสอบ [V17]
  - ในซิมใช้ IAS ของโมเดล ซึ่งเท่ากับ EAS และใกล้ CAS มากที่ความสูงต่ำ
- ขั้นตอนในซิม
  - เริ่มจากบินระดับที่ 3,000 ft ที่ราว 1.35 Vs แล้วตั้ง thr = 0 (โมเดลจะยึดที่ idle)
  - ตั้งเป้าความเร็ว $V_{tgt}(t)=V_0-1.0\,t$ kt
  - ใช้ลูป pitch attitude แบบ PI เดียวกับ `Autopilot`: $\dot\theta_{cmd}=0.6^\circ/s+0.25^\circ/s\cdot(V-V_{tgt})$ และ `de = deI − 2.0(θcmd−θ) + 0.85q`
  - คุมปีกให้ระดับด้วย `da = 1.25(0−φ) − 0.28p` และ `dr = −1.6β`
  - หยุดเมื่อ δe ค้างที่ stop เกิน 1 s ร่วมกับ q < −2°/s หรือเมื่อ α > 25°
  - บันทึก $C_{L\max}$, $V_{C_{L\max}}$, $n_z=C_L\bar qS/W$, $V_{min}$, อัตราลดความเร็วจริง (ต้องอยู่ในช่วง 0.9–1.0 kt/s), มุม bank สูงสุด (Part 60 ให้ ±2° [V2]) และความเร็วที่ `Evaluator` เตือน stall ครั้งแรก
- ผลของโมเดลปัจจุบัน
  - แฟลปลงและล้อลง: $C_{L\max}$ 1.62 ที่ α 11.5°, $V_{C_{L\max}}$ 70.0 kt, $n_z$ 0.95 จึงได้ **V_SR 71.9 kt** ($V_{min}$ 68.4 kt, δe ตอนจบ −21.1° ใกล้ stop −22°)
  - clean: 1.32 ที่ 14.2°, 79.0 kt, $n_z$ 0.98 จึงได้ **V_SR 79.6 kt**
  - อัตราลดความเร็วจริงคือ 1.04 และ 0.99 kt/s ตัวควบคุมจึงต้องลดเกนเล็กน้อยให้ไม่เกิน 1 kt/s
  - ค่าแฟลปลงตรงกับ `AC.Vs0` = 71 kt (ต่าง 1.2 %: 71.86/71)
  - elevator แทบหมดตอนลงจอด ถ้าเพิ่ม CG หน้าในรอบหน้า stall อาจกลายเป็นแบบ "control at stop" ตามนิยามของ AC 23-8C

**(b) best-rate climb**
- กฎกำหนดดังนี้
  - เครื่อง level 1–2 low-speed แบบ landplane ต้องมี climb gradient อย่างน้อย 8.3 % เมื่อเครื่องยนต์ทำงานทั้งหมด [V18]
  - ต้องหาข้อมูลการไต่ที่ทุกน้ำหนัก ความสูง และอุณหภูมิในขอบเขตใช้งาน [V18]
  - tolerance ของ Part 60 ข้อ 1.c.1 คือ ±3 kt และ ±5 % หรือ ±100 fpm โดยบันทึกช่วงอย่างน้อย 1,000 ft [V2]
- วิธีที่ 1 (เร็ว ใช้ใน unit test): หา trim สามตัวแปร $(\alpha,\delta_e,\gamma)$ ที่ thr = 1 บนกริด IAS แล้วคำนวณ
  $$\mathrm{ROC}=V\sin\gamma,\qquad V_y=\arg\max_V \mathrm{ROC},\qquad V_x=\arg\max_V \gamma$$
  - V คือ TAS [m/s] และ γ คือมุมเส้นทางบิน [rad]
- วิธีที่ 2 (โดเมนเวลา ตรงกับ Part 60): ไต่ด้วย IAS คงที่ ให้ลูป pitch คุมความเร็ว ผ่านช่วง 1,000 ft แล้วคำนวณ ROC = Δh/Δt หรือใช้ level acceleration กับพลังงานจำเพาะส่วนเกิน $P_s=\dot h+\frac{V}{g}\dot V$ [m/s] ซึ่งได้จากการอนุรักษ์พลังงานโดยตรง (ค่าประมาณที่ไม่ต้องอ้างแหล่ง)
- ผลของโมเดลปัจจุบัน (วิธีที่ 1, clean, 2,250 kg)
  - ระดับ 30 m ได้ **Vy 128 kt, ROC 3,225 fpm** (gradient 25 % ≫ 8.3 %)
  - ที่ 5,000 ft ได้ Vy 126 kt, ROC 3,264 fpm
  - Vx ต่ำกว่า 80 kt ซึ่งเป็นขอบกริด และใกล้ V_S1
  - ROC ที่เพิ่มตามความสูงชี้ว่ากำลังเครื่องยนต์ยังไม่ลดตามความหนาแน่นและอุณหภูมิ (ดูหัวข้อ 4 เรื่อง flat rating ที่ OAT 31 °C)

**(c) การร่อน (glide)**
- §23.2125 กำหนดให้หา "the glide performance for single-engine airplanes after a complete loss of thrust" [V18]
- นิยามคือ $L/D=-1/\tan\gamma$ โดย γ < 0 คือมุมร่อน
- ใน polar ของโมเดล ($C_D=C_{D0}+K(C_L-0.15)^2$) ค่าที่ดีที่สุดคำนวณได้แบบปิดรูป
  $$C_L^*=\sqrt{0.15^2+C_{D0}/K}=0.640,\qquad (L/D)_{\max}=C_L^*/C_D^*=16.46$$
  - ใช้ $C_{D0}$ 0.024 และ $K$ 0.062 ของ clean
  - ค่านี้เทียบเท่า Oswald e 0.804 ที่ AR 6.38 (ค่าประมาณจาก `AC`)
- ขั้นตอนในซิม: หา trim $(\alpha,\delta_e,\gamma)$ ที่แรงขับคงที่บนกริด IAS แล้วยืนยันในโดเมนเวลาด้วยการร่อนนิ่งผ่าน 1,000 ft (ใช้ tolerance ของ idle descent ข้อ 1.d.4 คือ ±3 kt และ ±5 % หรือ ±200 fpm [V2])
- ผลของโมเดลปัจจุบัน
  - แรงขับศูนย์: Vbg 114 kt, **L/D 16.46** ตรงกับสูตรปิดรูป
  - ที่ idle (thr 0.045): Vbg 111 kt, **L/D 21.7**, อัตราจม 540 fpm เพราะแรงขับ idle ราว 330 N คิดเป็นประมาณ 25 % ของแรงต้าน
  - เครื่องเทอร์โบพร็อปจริงที่ flight idle กับใบพัด constant-speed มักมีแรงขับใกล้ศูนย์หรือติดลบ ส่วนนี้ให้หัวข้อ 3 และ 4 กำหนดตัวเลข
  - ข้อสรุปคือต้องมีโหมดเครื่องดับแบบ windmill หรือ feather และ flight idle ที่แรงขับไม่บวก ก่อนจะทดสอบการร่อนหรือสอนการลงจอดฉุกเฉิน

**(d) takeoff ถึง 50 ft**
- กฎกำหนดดังนี้
  - เครื่องยนต์เดียวต้องหา "ground roll and initial climb distance to 50 feet (15 meters)" [V18]
  - AC 23-8C ให้ VR ≥ V_S1 (เครื่องยนต์เดียว) และความเร็วที่ 50 ft ไม่ต่ำกว่าความเร็วที่ปลอดภัยหรือ 1.2 V_S1
  - คำว่า "normal/natural rotation technique" ปรากฏในหัวข้อทดสอบ abuse ของ §23.51 และ AC แนะนำ "Six acceptable runs" สำหรับหาช่วงเร่งบนพื้นในวิธี segment technique [V17] ในซิมจึงใช้การหมุนแบบปกติ (3°/s) และไม่ต้องทำซ้ำ 6 รอบเพราะผลกำหนดแน่นอน
  - ลมระหว่างทดสอบไม่ควรเกิน "approximately 12 percent VS1 or 10 knots, whichever is lower" (Table 1 ของ AC ใช้กับการทดสอบ takeoff และ landing) [V17]
  - tolerance ของ Part 60 ข้อ 1.b.1 คือ ±5 % ทั้งเวลาและระยะ หรือ ±5 % เวลากับ ±61 m [V2] ข้อนี้วัดช่วงเร่งบนพื้น การนำมาใช้กับระยะถึง 50 ft จึงเป็นการดัดแปลงของผู้เขียน
- ขั้นตอนในซิม
  - เริ่มจาก `setParked` แล้ว settle 5 s
  - ตั้งแฟลป เร่ง thr = 1 โดยเหยียบเบรกไว้ 3 s แล้วปล่อยเบรก
  - คุมแนวกลางด้วย rudder และล้อหน้า และคุมปีกให้ระดับ
  - ที่ VR เพิ่ม θ ด้วยอัตรา 3°/s จนถึง 10° แล้วค้างไว้
  - บันทึก s, t และ IAS ตอนล้อทุกล้อพ้นพื้น และตอน h_wheel = 15.24 m
- ผลของโมเดลปัจจุบัน
  - แฟลป 0, VR 82 kt: ground roll **358 m** (12.7 s), V_LOF 99 kt, ระยะถึง 50 ft **590 m**, V50 114 kt
  - แฟลป 0.5, VR 78 kt: 319 m, V_LOF 94 kt, 515 m, V50 105 kt
  - V50/V_S1 = 1.43 ซึ่งผ่านเกณฑ์ 1.2
  - V_LOF สูงกว่า VR ราว 17 kt เพราะการหมุน 3°/s ใช้เวลาราว 3 s ระหว่างที่เครื่องยังเร่งต่อ ควรเทียบกับ POH ในรอบ 2

**(e) landing จาก 50 ft**
- กฎกำหนดให้หาระยะ "starting from a height of 50 feet (15 meters)" รวมถึงหยุดสนิท [V18]
- tolerance ของการหยุดตาม Part 60 ข้อ 1.e.1 คือ ±5 % ของเวลา และสำหรับระยะไม่เกิน 4,000 ft ให้ใช้ ±200 ft หรือ ±10 % แล้วแต่ค่าใดเล็กกว่า [V2] ข้อนี้คือ "Stopping time and distance" ด้วยเบรกล้อบนทางวิ่งแห้ง จึงใช้กับ ground roll ตั้งแต่แตะพื้นจนหยุด ไม่ใช่ระยะรวมจาก 50 ft
- ขั้นตอนในซิม
  - ใช้ autoland 21R ลมสงบ ผ่าน 50 ft ที่ Vref
  - เบรกเต็ม (brake = 1) ทันทีที่ล้อหน้าแตะพื้น โดยห่อ `Autopilot.update` ไว้
  - เทคนิคเบรกเต็มนี้เป็นแบบทั่วไปของการทดสอบระยะลงจอด แต่ยังไม่ได้ยืนยันกับเนื้อหาส่วน landing ของ AC 23-8C
  - บันทึก air distance, ground roll และระยะรวม
- ผลของโมเดลปัจจุบัน
  - ผ่าน 50 ft ที่ s = −29 m ด้วย IAS 87.9 kt และแตะพื้นที่ 309 m ด้วย 82.6 kt อัตราจม 133 fpm
  - air distance 338 m
  - ground roll **376 m** ถ้าเบรกเต็ม (ความหน่วงเฉลี่ยราว 0.25 g) หรือ 612 m ถ้าใช้ autoland ตามเดิม (brake 0.42 หลังแตะพื้น 2.5 s)
  - ระยะรวม **714 m** และ 950 m ตามลำดับ

**(f) รายการ regression อื่น ๆ (ยังไม่มีค่าอ้างอิงจริง)**
- level deceleration 160 → 110 kt ที่ idle บนความสูง 3,000 ft ใช้ 53.0 s (ความสูงคลาด 3.5 ft) ตามข้อ 1.d.2 ซึ่งกำหนด ±5 % เวลา [V2]
- level acceleration 100 → 150 kt ที่ thr = 1 ใช้ 12.8 s
- power change dynamics (ข้อ 2.c.1) ที่ approach เมื่อดัน thr เป็น 1 แล้วปล่อยคันบังคับตายตัว:
  - หลัง 5 s: +14.6 kt, −14 ft, θ +5.6°
  - หลัง 20 s: −15.2 kt, +751 ft, θ +22.5°
  - การเงยหัวทั้งหมดมาจาก speed stability และ phugoid เพราะโมเดลยังไม่มีโมเมนต์จากแนวแรงขับหรือ slipstream (ดูหัวข้อ 3)
  - เมื่อเพิ่มผลใบพัดแล้ว ตัวเลขชุดนี้ต้องเปลี่ยนแน่นอน จึงใช้เป็น regression เพื่อดูทิศของการเปลี่ยนแปลงเท่านั้น

## 10.7 โครงสร้างชุดทดสอบและรูปแบบข้อมูลอ้างอิง

**ไฟล์ที่ควรสร้าง** ทั้งหมดไม่ใช้ dependency ภายนอก และใช้ `node:test` กับ `node:assert/strict` ที่มากับ Node 18 ขึ้นไป
- `test/lib/fstd.mjs` รวม `f9`, `solve`, `trim`, `trimFixedThr`, `linearise`, `eig4`, `modes` (แยกโหมดและคำนวณ CAP), `fitOsc` (log decrement), `within` และ `levelOf(value, bands)`
- `test/lib/maneuvers.mjs` รวม `startTrimmed`, `elevatorPulse`, `rudderDoublet`, `spiralRelease`, `rollStep`, `stall1kt`, `climbSweep`, `glideSweep`, `takeoff50ft` และ `landing50ft`
- `test/modes.test.mjs` (T-V-01 ถึง 06), `test/hq-time.test.mjs` (T-V-07 ถึง 10) และ `test/perf.test.mjs` (T-V-11 ถึง 15) ใช้เวลารวมไม่ถึง 3 s (วัดได้ 0.8 + 1.4 s ในเครื่องนี้)
- ใน `.github/workflows/pages.yml` (ใช้ Node 22) ให้เพิ่ม `node --test "test/**/*.test.mjs"` ต่อจากการทดสอบ geo และ runways ต้องใส่ glob ในเครื่องหมายคำพูด เพราะตรวจกับ Node 22.23.5 แล้ว (`scripts/v10rev_nodetest/`) `node --test test/` ล้มด้วย `ERR_TEST_FAILURE` และ `node --test` แบบไม่ใส่อาร์กิวเมนต์จะรันทุกไฟล์ `.mjs` ใต้ `test/` ตามรูปแบบตั้งต้น `**/test/**/*.mjs` รวมถึง `shots.mjs` (ต้องใช้ Playwright), `harness.mjs` และ `test/lib/*.mjs`

**ค่าอ้างอิงรายรุ่น `data/ref/<type>.json`** แต่ละรายการมี id ตาม Table A2A, สภาวะ, ค่าอ้างอิง, ชื่อชุด tolerance (คีย์ใน `validation.fstdTolerances`) และแหล่งที่มา

```
{"type": "trainer", "mass_kg": 2250, "tests": [
  {"id": "2.c.9", "cond": {"ias_kt": 155, "h_ft": 3000, "flaps": 0, "gear": 0}, "ref": {"T_s": 42.5, "zeta": 0.073}, "tol": "phugoid_2c9", "src": "regression 2026-11 (linear model)"},
  {"id": "1.c.1", "cond": {"h_ft": 100, "thr": 1, "flaps": 0, "gear": 0}, "ref": {"Vy_kt": 128, "roc_fpm": 3225}, "tol": "normalClimb_1c1", "src": "regression 2026-11"}
]}
```

**แยกเกณฑ์ออกเป็นสองชั้น**
- ชั้นแรกคือการยอมรับทางฟิสิกส์ ได้แก่ Level bounds และ Part 60 เมื่อเทียบกับค่าจริง ถ้าไม่ผ่านถือว่าโมเดลผิด
- ชั้นที่สองคือ regression band ที่แคบ (±2–5 %) เอาไว้จับการเปลี่ยนแปลงที่ไม่ได้ตั้งใจ ถ้าปรับจูนโดยตั้งใจ ให้แก้ไฟล์ค่าอ้างอิงใน PR เดียวกัน ตามกฎใน CLAUDE.md ที่ให้เปิด PR ทุกครั้งที่เปลี่ยน flight model

**proof of match** ใช้ `Recorder` (10 Hz) ที่มีอยู่แล้วในการวาดกราฟซ้อนระหว่างผลซิมกับข้อมูลอ้างอิงในหน้า debrief หรือหน้า dev เมื่อมีข้อมูลเวลาของเครื่องจริงในรอบถัดไป

## 10.8 ค่าพารามิเตอร์ (JSON)

```json
{
  "validation": {
    "classification": {
      "hqClassCategory": {"v": {"class": "I", "approachLanding": "C", "cruiseClimb": "B", "takeoff": "C"}, "u": "-", "scope": "aircraft", "src": ["V7", "V10"], "conf": "กลาง", "est": true, "note": "ค่าประมาณ: เครื่องฝึกเบาเครื่องยนต์เดียวจัดเป็น Class I (small, light airplanes); ช่วงลงจอดเป็น Category C; ถ้าต่อไปทำผาดโผนแบบเครื่องฝึกนำเข้า Class IV ให้ตรวจเพิ่มด้วยเกณฑ์ Class IV"},
      "fstdAnalogue": {"v": {"faa": "FTD Level 5 (generic aero) ถึง Level 6", "easa": "FNPT/BITD (class-specific modelling)"}, "u": "-", "scope": "sim", "src": ["V3", "V5"], "conf": "กลาง", "est": true, "note": "ค่าประมาณ: AirfieldLab ไม่ได้ขอรับรอง ใช้ระดับเหล่านี้เป็นกรอบเทียบความลึกของการตรวจเท่านั้น"}
    },
    "hqLimits": {
      "shortPeriodZeta_catAC": {"v": {"L1": [0.35, 1.30], "L2": [0.25, 2.00], "L3": [0.15, null]}, "u": "-", "scope": "sim", "src": ["V7", "V10"], "conf": "สูง", "est": false, "note": "MIL-F-8785C Table IV ตามที่ NASA grant report ถอดไว้; L3 ไม่มีขอบบนที่อ่านได้"},
      "shortPeriodZeta_catB": {"v": {"L1": [0.30, 2.00], "L2": [0.20, 2.00], "L3": [0.15, null]}, "u": "-", "scope": "sim", "src": ["V7", "V11"], "conf": "สูง", "est": false, "note": "ขอบล่างจาก V7 Table 2; ขอบบน 2.00 ใน V7 อ่านไม่ชัดแต่ V11 (MathWorks, ทุติยภูมิ) ยืนยัน; ใช้กับช่วง cruise"},
      "CAP_catC": {"v": {"L1": [0.16, 3.6], "L2": [0.096, 10.0]}, "u": "1/(g s^2) = rad^2/s^2 per g/rad", "scope": "sim", "src": ["V9"], "conf": "ต่ำ", "est": false, "note": "ขอบล่าง 0.16 (L1) และ 0.096 (L2) ยืนยันจากข้อความใน NASA CR-170391; ขอบบน 3.6 และ 10 ยังไม่ยืนยันจากต้นฉบับ"},
      "phugoid": {"v": {"L1": {"zetaMin": 0.04}, "L2": {"zetaMin": 0.0}, "L3": {"T2min_s": 55}}, "u": "- / s", "scope": "sim", "src": ["V10", "V11"], "conf": "กลาง", "est": false, "note": "MIL-F-8785C 3.2.1.2"},
      "dutchRoll_classI_catC": {"v": {"L1": {"zeta": 0.08, "zetaWn": 0.15, "wn": 1.0}, "L2": {"zeta": 0.02, "zetaWn": 0.05, "wn": 0.4}, "L3": {"zeta": 0.0, "wn": 0.4}}, "u": "- / rad/s / rad/s", "scope": "sim", "src": ["V7", "V10", "V11"], "conf": "กลาง", "est": false, "note": "L1 ζ 0.08 และ ζωn 0.15 ยืนยันจาก V7 Table 4 และ V10; L1 ωn: V10 ให้ 1.0 (เขียนหน่วยเป็น Hz) แต่ V7 Table 4 ที่ OCR อ่านไม่ชัดให้ 0.4 จึงใช้ 1.0 ที่เข้มกว่า (โมเดลผ่านทั้งสองค่า); L2 ζ 0.02 และ ωn 0.4 จาก V11 (Cat B แต่ L2 ใช้กับทุก Category ตาม V7); L2 ζωn 0.05 และค่า L3 ยังไม่ยืนยัน"},
      "rollModeTauMax_classI_catC": {"v": {"L1": 1.0, "L2": 1.4, "L3": 10.0}, "u": "s", "scope": "sim", "src": ["V7", "V10"], "conf": "กลาง", "est": false, "note": "L1/L2 จาก V7 Table 5 และ V10 (L1); L3 = 10 s ยังไม่ยืนยัน เพราะ V7 Table 5 ให้ 10 s เฉพาะ Cat B"},
      "spiralT2min_catAC": {"v": {"L1": 12, "L2": 8, "L3": 4}, "u": "s", "scope": "sim", "src": ["V7", "V10"], "conf": "สูง", "est": false, "note": "เวลาที่มุมเอียงเพิ่มเป็นสองเท่าเมื่อปล่อยคันบังคับ; Category B ใช้ 20 s ที่ L1 ตามความจำ ยังไม่ยืนยัน"},
      "rollPerformance_classI_catC": {"v": {"bankChange_deg": 30, "L1": 1.3, "L2": 1.8, "L3": 2.6}, "u": "s", "scope": "sim", "src": ["V10"], "conf": "ต่ำ", "est": false, "note": "30° ใน 1.3 s มาจาก V10; ค่า L2/L3 ยังไม่ยืนยัน"},
      "equivalentTimeDelay": {"v": {"L1": 0.10, "L2": 0.20, "L3": 0.25}, "u": "s", "scope": "sim", "src": ["V7"], "conf": "กลาง", "est": false, "note": "allowable airplane response delay; ใช้กับทั้งสาย input→ภาพ ในเบราว์เซอร์"}
    },
    "fstdTolerances": {
      "groundAccel_1b1": {"v": {"timePct": 5, "distPct": 5, "distAbs_m": 61}, "u": "% / m", "scope": "sim", "src": ["V2"], "conf": "กลาง", "est": false, "note": "±5% time and distance or ±5% time and ±200 ft"},
      "normalTakeoff_1b4": {"v": {"iasAbs_kt": 3, "pitchAbs_deg": 1.5, "aoaAbs_deg": 1.5, "heightAbs_ft": 20}, "u": "kt / deg / ft", "scope": "sim", "src": ["V2"], "conf": "กลาง", "est": false, "note": "brake release ถึง 200 ft AGL"},
      "normalClimb_1c1": {"v": {"iasAbs_kt": 3, "rocPct": 5, "rocAbs_fpm": 100, "minBand_ft": 1000}, "u": "kt / % / fpm / ft", "scope": "sim", "src": ["V2", "V3"], "conf": "กลาง", "est": false, "note": "บันทึกอย่างน้อย 1000 ft"},
      "levelAccelDecel_1d1_1d2": {"v": {"timePct": 5, "minSpeedChange_kt": 50}, "u": "% / kt", "scope": "sim", "src": ["V2"], "conf": "กลาง", "est": false, "note": "เร่ง max continuous / ลด idle อย่างน้อย 50 kt"},
      "idleDescent_1d4": {"v": {"iasAbs_kt": 3, "rodPct": 5, "rodAbs_fpm": 200}, "u": "kt / % / fpm", "scope": "sim", "src": ["V2"], "conf": "กลาง", "est": false, "note": "บันทึกอย่างน้อย 1000 ft"},
      "stopping_1e1": {"v": {"timePct": 5, "distPct": 10, "distAbs_m": 61, "rule": "smaller"}, "u": "% / m", "scope": "sim", "src": ["V2"], "conf": "สูง", "est": false, "note": "Stopping time and distance ด้วยเบรกล้อ ทางวิ่งแห้ง ไม่มี reverse: ใช้กับระยะจากแตะพื้นถึงหยุด; ระยะไม่เกิน 4000 ft ใช้ ±200 ft หรือ ±10% whichever is smaller"},
      "engineAccel_1f1": {"v": {"TtPct": 10, "TiPct": 10, "TiAbs_s": 0.25}, "u": "% / s", "scope": "sim", "src": ["V2"], "conf": "กลาง", "est": false, "note": "slam throttle flight idle ถึง go-around"},
      "powerChange_2c1": {"v": {"iasAbs_kt": 3, "altAbs_ft": 100, "pitchPct": 20, "pitchAbs_deg": 1.5}, "u": "kt / ft / % / deg", "scope": "sim", "src": ["V2"], "conf": "กลาง", "est": false, "note": "free response หลังเปลี่ยนกำลัง ช่วง approach"},
      "longTrim_2c5": {"v": {"trimSurfAbs_deg": 0.5, "elevAbs_deg": 1, "pitchAbs_deg": 1, "thrustPct": 5}, "u": "deg / %", "scope": "sim", "src": ["V2", "V3"], "conf": "สูง", "est": false, "note": "cruise, approach, landing; ข้อความตรงกันใน A2A [V2] และ B2A [V3]; ±5 % net thrust or equivalent"},
      "stall_2c8": {"v": {"iasAbs_kt": 3, "bankAbs_deg": 2}, "u": "kt / deg", "scope": "sim", "src": ["V2", "V3"], "conf": "กลาง", "est": false, "note": "ฉบับก่อน 2016; ±3 kt สำหรับ initial buffet, stall warning และ stall speed; ±2° bank ที่ความเร็วสูงกว่า stick shaker หรือ initial buffet; เข้าที่ idle หรือใกล้ idle ปีกระดับ; ฉบับ 2016 (Amdt. 60-4) และ 2022 แก้ตาราง A2A แล้ว ยังไม่ได้ตรวจแถวนี้ในฉบับใหม่"},
      "phugoid_2c9": {"v": {"periodPct": 10, "t2Pct": 10, "zetaAbs": 0.02, "minCycles": 3}, "u": "% / -", "scope": "sim", "src": ["V2", "V3"], "conf": "สูง", "est": false, "note": "cruise; บันทึก 3 รอบเต็ม (6 overshoot หลังจบ input) หรือพอหา t½/t₂ แล้วแต่ค่าใดน้อยกว่า"},
      "shortPeriod_2c10": {"v": {"pitchAbs_deg": 1.5, "qAbs_degs": 2.0, "nzAbs_g": 0.10}, "u": "deg / deg/s / g", "scope": "sim", "src": ["V2"], "conf": "กลาง", "est": false, "note": "cruise"},
      "rollRate_2d2": {"v": {"pct": 10, "abs_degs": 2, "wheelFraction": 0.33}, "u": "% / deg/s", "scope": "sim", "src": ["V2"], "conf": "กลาง", "est": false, "note": "ใช้คันบังคับราว 1/3"},
      "spiral_2d4": {"v": {"bankAbs_deg": 2, "bankPct": 10, "window_s": 20}, "u": "deg / % / s", "scope": "sim", "src": ["V2"], "conf": "กลาง", "est": false, "note": "correct trend ทั้งสองทิศ"},
      "dutchRoll_2d7": {"v": {"periodAbs_s": 0.5, "periodPct": 10, "t2Pct": 10, "zetaAbs": 0.02, "minCycles": 6}, "u": "s / % / -", "scope": "sim", "src": ["V2"], "conf": "สูง", "est": false, "note": "yaw damper off"},
      "steadySideslip_2d8": {"v": {"bankAbs_deg": 2, "betaAbs_deg": 1, "ailPct": 10, "ailAbs_deg": 2}, "u": "deg / %", "scope": "sim", "src": ["V2"], "conf": "กลาง", "est": false, "note": "ที่ตำแหน่ง rudder ที่กำหนด; อย่างน้อยสองตำแหน่ง rudder และเครื่องใบพัดทดสอบทั้งสองทิศ; ±2° bank และ ±1° β ยืนยันแล้ว ส่วน aileron ±10 % หรือ ±2° ยังไม่ยืนยันในรอบตรวจ"},
      "normalLanding_2e1": {"v": {"iasAbs_kt": 3, "pitchAbs_deg": 1.5, "aoaAbs_deg": 1.5, "heightPct": 10, "heightAbs_ft": 10}, "u": "kt / deg / % / ft", "scope": "sim", "src": ["V2"], "conf": "กลาง", "est": false, "note": "จาก 200 ft AGL ถึงล้อหน้าแตะ"}
    },
    "procedures": {
      "stallEntryRate": {"v": 1.0, "u": "kt/s (สูงสุด)", "scope": "sim", "src": ["V16", "V17"], "conf": "สูง", "est": false, "note": "ลดความเร็วไม่เกิน 1 kt/s; power idle; ปีกระดับ"},
      "stallTrimSpeed": {"v": {"part23": "ราว 1.5 VS1 หรือ minimum trim speed (ค่าที่สูงกว่า)", "part25": [1.13, 1.30]}, "u": "× VS1 / × VSR", "scope": "sim", "src": ["V16", "V17"], "conf": "สูง", "est": false, "note": "Part 25 trim ระหว่าง 1.13–1.30 VSR"},
      "stallHoldAtStop": {"v": 2.0, "u": "s", "scope": "sim", "src": ["V17"], "conf": "สูง", "est": false, "note": "ถ้าคันบังคับถึง stop ให้ค้างอย่างน้อย 2 s"},
      "screenHeight": {"v": 15.24, "u": "m (50 ft)", "scope": "sim", "src": ["V18"], "conf": "สูง", "est": false, "note": "takeoff ถึง 50 ft และ landing จาก 50 ft"},
      "v50MinFactor_singleEngine": {"v": 1.2, "u": "× VS1", "scope": "aircraft", "src": ["V17"], "conf": "สูง", "est": false, "note": "ความเร็วที่ 50 ft ของเครื่องยนต์เดียวไม่ต่ำกว่า 1.2 VS1 (Part 23 เดิม)"},
      "takeoffRunsRecommended": {"v": 6, "u": "runs", "scope": "sim", "src": ["V17"], "conf": "สูง", "est": false, "note": "AC 23-8C: Six acceptable runs สำหรับหาช่วงเร่งบนพื้นในวิธี segment technique; ในซิมใช้ 1 รันลมสงบ + กรณีลมหน้า/หลัง"},
      "testWindMax": {"v": {"kt": 10, "fracVS1": 0.12}, "u": "kt / -", "scope": "sim", "src": ["V17"], "conf": "สูง", "est": false, "note": "AC 23-8C Table 1 สำหรับการทดสอบ takeoff และ landing: ไม่เกินราว 12% VS1 หรือ 10 kt ค่าที่ต่ำกว่า; ในซิมตั้งลมสงบ"},
      "linearisation": {"v": {"eps_vel_mps": 1e-3, "eps_rate_rads": 1e-5, "eps_angle_rad": 1e-5, "adot": "quasi-steady"}, "u": "-", "scope": "sim", "src": ["V19"], "conf": "สูง", "est": true, "note": "ค่าประมาณ: central difference; ผลตรงกับ ml-matrix 12-state ของ section 9"}
    },
    "typicalModes": {
      "c172x_jsbsim_100kcas_3000ft": {"v": {"sp_wn": 6.50, "sp_zeta": 0.68, "ph_T_s": 32.0, "ph_zeta": 0.13, "dr_wn": 2.25, "dr_zeta": 0.16, "tauR_s": 0.20, "spiral_tau_s": 46}, "u": "rad/s, -, s", "scope": "aircraft", "src": ["V15"], "conf": "ต่ำ", "est": true, "note": "ค่าประมาณ: คำนวณจากโมเดลเปิด JSBSim c172x ไม่ใช่ข้อมูลบินจริง; spiral เสถียร"},
      "c172x_jsbsim_65kcas_flaps30": {"v": {"sp_wn": 4.38, "sp_zeta": 0.67, "ph_T_s": 19.7, "ph_zeta": 0.12, "dr_wn": 1.54, "dr_zeta": 0.16, "tauR_s": 0.30, "spiral_tau_s": 64}, "u": "rad/s, -, s", "scope": "aircraft", "src": ["V15"], "conf": "ต่ำ", "est": true, "note": "ค่าประมาณ: โมเดลเปิด; 1000 ft"},
      "b737_jsbsim_140kcas_landing": {"v": {"sp_wn": 1.05, "sp_zeta": 0.54, "ph_T_s": 37.2, "ph_zeta": 0.066, "dr_wn": 1.09, "dr_zeta": 0.24, "tauR_s": 0.98, "spiral_tau_s": 14.5}, "u": "rad/s, -, s", "scope": "aircraft", "src": ["V15"], "conf": "ต่ำ", "est": true, "note": "ค่าประมาณ: โมเดลทั่วไปของ JSBSim ไม่ได้ผ่าน validation; 1500 ft gear down flaps เต็ม"},
      "b747_M08_40000ft": {"v": {"sp_wn": 0.962, "sp_zeta": 0.387, "ph_wn": 0.0673, "ph_zeta": 0.0489}, "u": "rad/s, -", "scope": "aircraft", "src": ["V14"], "conf": "กลาง", "est": false, "note": "เอกสารสอน MIT OCW (ทุติยภูมิ): ตัวเลขโหมดจาก Lecture 7, สภาวะ M 0.8 / 40,000 ft จาก Lecture 9 ซึ่งระบุข้อมูลจาก Etkin และ Reid; คาบ phugoid 93.5 s เป็นค่าประมาณจาก ωn และ ζ"},
      "gaFlightTest_dutchRoll": {"v": {"T_s": [2, 4], "t_half_max_s": 2}, "u": "s", "scope": "aircraft", "src": ["V13"], "conf": "กลาง", "est": false, "note": "เครื่อง GA ที่ดีที่สุดในการทดสอบของ NASA 1966"}
    },
    "currentModel": {
      "approach95": {"v": {"sp_wn": 2.221, "sp_zeta": 0.578, "CAP": 0.951, "nAlpha": 5.19, "ph_T_s": 25.5, "ph_zeta": 0.115, "dr_wn": 1.611, "dr_zeta": 0.139, "dr_zetaWn": 0.225, "tauR_s": 0.218, "spiral_t_half_s": 36.2, "t30_s": 0.80}, "u": "rad/s, -, s", "scope": "aircraft", "src": ["V19"], "conf": "สูง", "est": true, "note": "ค่าประมาณ: IAS 95 kt flaps 1 gear down 300 m γ −3°; α̇ แบบ quasi-steady"},
      "cruise155": {"v": {"sp_wn": 3.593, "sp_zeta": 0.560, "CAP": 0.935, "nAlpha": 13.81, "ph_T_s": 42.5, "ph_zeta": 0.073, "dr_wn": 2.525, "dr_zeta": 0.145, "dr_zetaWn": 0.366, "tauR_s": 0.138, "spiral_t_half_s": 86.6, "t30_s": 0.53}, "u": "rad/s, -, s", "scope": "aircraft", "src": ["V19"], "conf": "สูง", "est": true, "note": "ค่าประมาณ: IAS 155 kt clean 3000 ft ระดับ"},
      "performance": {"v": {"VSR_flaps1_kt": 71.9, "VCLmax_flaps1_kt": 70.0, "VSR_clean_kt": 79.6, "Vy_SL_kt": 128, "ROCmax_SL_fpm": 3225, "glideLD_zeroThrust": 16.5, "glideLD_idle": 21.7, "TO_groundRoll_flaps0_m": 358, "TO_50ft_flaps0_m": 590, "LDG_50ft_maxBrake_m": 714}, "u": "kt, fpm, -, m", "scope": "aircraft", "src": ["V19"], "conf": "สูง", "est": true, "note": "ค่าประมาณ: 2250 kg ISA ลมสงบ; ตัวเลข regression ไม่ใช่ค่าจริง"}
    }
  }
}
```

## 10.9 กรณีทดสอบ

| ID | สิ่งที่ทดสอบ | การตั้งค่า | ผลที่คาดหวัง (± tolerance) | ที่มาของค่าคาดหวัง | โมเดลปัจจุบัน |
|---|---|---|---|---|---|
| T-V-01 | trim สมดุลและการแยกบล็อกตามยาว/ด้านข้าง | `trim()` ที่ approach (95 kt (48.9 m/s), f 1, g 1, 300 m, γ −3°) และ cruise (155 kt (79.7 m/s), clean, 3,000 ft (914 m)); `setApproach({dist:5500})` | `trim()`: max\|u̇, ẇ, q̇\| < 1e-9; พจน์คู่ควบใน A < 1e-9 (ก่อนมีผลใบพัด); `setApproach`: \|a_NED\| < 0.05 m/s², \|ω̇\| < 1e-6 rad/s² | นิยาม trim; Part 60 ข้อ 2.c.5 ใช้เมื่อมีค่าอ้างอิง [V2] | 1.3e-16 / 1.8e-15; คู่ควบ 0; setApproach a_d −0.027 m/s² ✓ |
| T-V-02 | short period, Cat C | `linearise` ที่ approach (α̇ แบบ quasi-steady) | 0.35 ≤ ζsp ≤ 1.30 และ CAP ≥ 0.16 (Level 1); regression ωsp 2.22 ± 0.11 rad/s | [V7, V9]; regression ±5 % | ζ 0.578, CAP 0.951, ωn 2.221 ✓ |
| T-V-03 | phugoid | approach และ cruise | ζp ≥ 0.04 ทั้งสองสภาวะ | [V10, V11] | 0.115 / 0.073 ✓ |
| T-V-04 | Dutch roll | approach (Cat C) และ cruise (Cat B) | ζ ≥ 0.08 และ ζωn ≥ 0.15 rad/s ทั้งสองสภาวะ; ωn ≥ 1.0 rad/s ที่ approach (Cat C, ใช้ค่าที่เข้มกว่าจาก [V10]) และ ωn ≥ 0.4 rad/s ที่ cruise (Cat B [V11]) | [V7, V10, V11] | 0.139 / 0.225 / 1.611 และ 0.145 / 0.366 / 2.525 ✓ |
| T-V-05 | roll mode | approach | τR ≤ 1.0 s | [V7, V10] | 0.218 s ✓ |
| T-V-06 | spiral (เชิงเส้น) | approach และ cruise | λs ≤ 0 หรือ T₂ = ln2/λs ≥ 12 s | [V7, V10] | เสถียร (λ −0.0192 และ −0.0080 1/s) ✓ |
| T-V-07 | roll performance และ delay ของโมเดล | approach trim; aileron เต็มแบบ step จากปีกระดับ โดย rudder ตายตัว; แยกอีกกรณีเป็น δe step −3° | t(φ = 30°) ≤ 1.3 s; q̇ ถึง 50 % ของยอดภายใน ≤ 0.10 s | [V10]; [V7 Table 3] | 0.80 s; 0.02 s ✓ |
| T-V-08 | phugoid โดเมนเวลาเทียบเชิงเส้น | cruise trim, δe −2° นาน 2 s แล้วคืนค่า trim, อ่าน V นาน 260 s | คาบ ±10 % และ ζ ±0.02 จากค่าเชิงเส้น (T 42.5 s, ζ 0.073) | Part 60 ข้อ 2.c.9 [V2, V3] + 10.5 | 41.8 s, 0.071 ✓ |
| T-V-09 | Dutch roll โดเมนเวลาเทียบเชิงเส้น | cruise และ approach, rudder doublet ±5° (1 s + 1 s), อ่าน β | คาบ ±0.5 s หรือ ±10 %, ζ ±0.02 (cruise: T 2.52 s, ζ 0.145; approach: T 3.94 s, ζ 0.139) | Part 60 ข้อ 2.d.7 [V2] | 2.55 s / 0.145; 3.95 s / 0.140 ✓ |
| T-V-10 | spiral 20 s | เอียง 20° ด้วยลูป aileron 15 s แล้วปล่อยคันบังคับที่ค่า trim | φ(20 s) = φ₀·e^{20λs} ± 2° (approach 13.6°, cruise 17.0°) และทิศถูก (มุมลดลง) | Part 60 ข้อ 2.d.4 [V2] + 10.5 | 13.76°, 17.34° ✓ |
| T-V-11 | stall speed ที่ 1 kt/s | 3,000 ft (914 m), idle, ปีกระดับ, เริ่ม ~1.35 Vs, ลด 0.9–1.0 kt/s | V_SR = V_CLmax/√n_z: flaps 1 = 71.0 ± 1.5 kt (36.5 ± 0.77 m/s) (`AC.Vs0`); clean = 78.5 ± 1.5 kt (40.4 ± 0.77 m/s); มุม bank ≤ 2° | §25.103 [V16], AC 23-8C [V17]; Vs1 จากหัวข้อ 1 | 71.9 kt (37 m/s) และ 79.6 kt (40.9 m/s) ✓ (อัตราจริง 1.04 kt/s ต้องลดเกน) |
| T-V-12 | best-rate climb | trim (α, δe, γ) ที่ thr = 1, clean, 30 m, IAS 80–160 kt (41.2–82.3 m/s) ทีละ 2 kt (1.03 m/s) | รอบ 2: Vy ±3 kt (±1.54 m/s) และ ROC ±5 % หรือ ±100 fpm (±0.508 m/s) จาก POH; ระหว่างนี้ regression Vy 128 ± 3 kt (65.8 ± 1.5 m/s), ROC 3,225 ± 100 fpm (16.4 ± 0.51 m/s); gradient ≥ 8.3 %; ROC(5,000 ft (1,524 m)) < ROC(SL) | Part 60 ข้อ 1.c.1 [V2]; §23.2120 [V18] | 128 kt (65.8 m/s), 3,225 fpm (16.4 m/s), gradient 25 % ✓; ROC ที่ 5,000 ft (1,524 m) คือ 3,264 fpm (16.6 m/s) ✗ |
| T-V-13 | การร่อนหลังเครื่องดับ | trim ที่แรงขับ ≤ 0 (โหมดเครื่องดับ), clean, 3,000 ft (914 m), IAS 80–150 kt (41.2–77.2 m/s) | (L/D)max ≤ 16.46 ± 0.10 และ Vbg 114 ± 3 kt (58.6 ± 1.5 m/s); ห้ามมีแรงขับเป็นบวกในโหมดเครื่องดับ | §23.2125 [V18]; สูตรปิดรูปใน 10.6 | แรงขับศูนย์ 16.46 ที่ 114 kt (58.6 m/s) ✓; ยังไม่มีโหมดเครื่องดับ และ idle ให้ 21.7 ✗ |
| T-V-14 | takeoff ถึง 50 ft (15.2 m) | จอดและ settle 5 s, thr 1 พร้อมเบรก 3 s แล้วปล่อย, flaps 0, VR 82 kt (42.2 m/s), หมุน 3°/s ถึง θ 10° | V50 ≥ 1.2 V_S1 (≥ 95.5 kt (49.1 m/s) จาก 1.2 × 79.6); รอบ 2: ระยะ ±5 % หรือ ±61 m จาก POH (ดัดแปลงจาก 1.b.1); regression 590 ± 30 m (±5 %) | AC 23-8C [V17]; §23.2115 [V18]; Part 60 ข้อ 1.b.1 [V2] | 590 m, V50 113.8 kt (58.5 m/s), ground roll 358 m ✓ |
| T-V-15 | landing จาก 50 ft (15.2 m) | autoland 21R ลมสงบ, OAT 15 °C, เบรกเต็มเมื่อล้อหน้าแตะ | IAS ที่ 50 ft (15.2 m) = Vref 88 ± 3 kt (45.3 ± 1.5 m/s); ground roll (แตะพื้นถึงหยุด) 376 ± 37.6 m ตาม 1.e.1 (ค่าที่เล็กกว่าระหว่าง ±10 % = 37.6 m กับ ±61 m) และเวลาหยุด ±5 %; ระยะรวมจาก 50 ft (15.2 m) 714 ± 36 m (regression ±5 %); รอบ 2 เทียบ POH | §23.2130 [V18]; Part 60 ข้อ 1.e.1 [V2] | 87.9 kt (45.2 m/s), ground roll 376 m, รวม 714 m (air 338 + ground 376) ✓ |

## 10.10 ความขัดแย้งของแหล่งข้อมูลและข้อจำกัด
1. **ข้อความ Table A2A ฉบับทางการ**
   - eCFR ปัจจุบันแสดงตารางเป็นภาพจากการพิมพ์ซ้ำใน Federal Register ฉบับ 9 ธ.ค. 2022 [V1]
   - ข้อความที่ใช้มาจากฉบับถอดความก่อนปี 2016 [V2]
   - ฉบับรวมของ FAA (2016) อ้าง Amdt. 60-4 (Docket FAA-2014-0391, 81 FR 18217–18218, 30 มี.ค. 2016) และมี Attachment 7 ที่ครอบคลุมงานฝึก high angle of attack, upset recovery และ icing [V21] ส่วนชื่อกฎ "Extended Envelope and Adverse Weather Event Training Tasks" ที่ผลค้นหาแสดง (FR 2014-15432, ยังไม่ได้เปิดอ่าน) ไม่ปรากฏในฉบับรวม จึงยังไม่ยืนยันว่าเป็นกฎฉบับเดียวกันและแก้แถว 2.c.8 อย่างไร
   - หลังจากนั้น FAA ออก "Miscellaneous Amendments" (87 FR 75704, 9 ธ.ค. 2022, Docket FAA-2022-1355) ซึ่งมีคำสั่ง "Revise table A2A" ใน Appendix A [V23] ตรงกับที่ eCFR แสดงตารางเป็นภาพจากฉบับ 9 ธ.ค. 2022 [V1]
   - tolerance ของ stall ในตาราง 10.2 จึงเป็นของฉบับเก่า (ความเชื่อมั่น กลาง)
   - ก่อนใช้กับเครื่องจริงควรเปิดภาพ ER09DE22 หรือ PDF ฉบับรวม 2016 [V21] เพื่อตรวจทาน
2. **ground acceleration** Appendix A ให้ "±5 % time and distance or ±5 % time and ±200 ft" [V2] ส่วน Appendix B (FTD) ให้ "±5 % time or ±1 sec" [V3] หัวข้อนี้ใช้ค่าของ Appendix A
3. **ωn ขั้นต่ำของ Dutch roll สำหรับ Class I Category C** แหล่งขัดกัน
   - วิทยานิพนธ์ TU Delft [V10] เขียน ζd > 0.08, ζdωnd > 0.15 และ ωnd > 1.0 โดยใช้หน่วย "Hz" (น่าจะหมายถึง rad/s เพราะค่าตัวเลขตรงกับตาราง rad/s ของ [V7])
   - Table 4 ของ [V7] ซึ่งสแกนอ่านไม่ชัดบางช่อง ให้ 0.4 rad/s สำหรับ Cat C Class I, II-C, IV และให้ 1.0 rad/s ทั้ง Cat A Class I, IV และ Cat A Class II, III ซึ่งชวนสงสัยว่าคอลัมน์ ωn อาจเลื่อนแถวจาก OCR
   - ค่า 0.4 rad/s ของ [V11] เป็นของ Category B
   - ในการทดสอบ T-V-04 จึงใช้ 1.0 rad/s ซึ่งเข้มกว่าสำหรับ approach (ความเชื่อมั่น ต่ำ–กลาง จนกว่าจะเปิดต้นฉบับ MIL-F-8785C Table VI) โมเดลปัจจุบันผ่านทั้งสองค่า (ωn 1.61 rad/s)
4. **spiral** TN D-3726 (1966) [V13] อ้างสเปกรุ่นก่อนหน้า ซึ่งกำหนด T₂ > 20 s ทั้ง cruise และ approach ส่วน MIL-F-8785C Category C ใช้ 12 s [V7] ตัวเลขสองชุดนี้มาจากสเปกต่างรุ่นกัน หัวข้อนี้ใช้ 12 s
5. **CAP** มีหลักฐานเป็นข้อความแค่ขอบล่างของ Level 1 (0.16) และ Level 2 (0.096) [V9] ขอบบน (3.6 และ 10) และ ωsp ขั้นต่ำยังไม่ยืนยัน เพราะข้อความ OCR ใน [V9] มีเพียง "greater than 0.6" ที่อ่านไม่ชัด การทดสอบ T-V-02 จึงใช้แค่ขอบล่าง
6. **ต้นฉบับ MIL-F-8785C และ MIL-STD-1797A** เป็นภาพสแกน [V8] ตัวเลขทั้งหมดใน 10.3 จึงผ่านเอกสารที่ถอดตารางอีกชั้นหนึ่ง [V7, V9, V10, V11] ซึ่งบางตาราง (Dutch roll, roll mode Level 3) ถอดไม่ชัด
7. **ค่าโหมดทั่วไป (10.4)**
   - แถว C172 และ 737 คำนวณจากโมเดล JSBSim ที่ไฟล์ XML เองระบุผู้เขียนและใบอนุญาต GPL และไม่มีหลักฐาน validation กับข้อมูลบิน [V15]
   - แถว 747 มาจากเอกสารสอนที่อ้าง Nelson และ Reid [V14]
   - ยังไม่พบข้อมูลโหมดของเครื่องฝึก turboprop ที่เป็นสาธารณะ
8. **AC 23-8C (2011)** อ้างหมวดของ Part 23 แบบเดิม (§23.49, §23.51, §23.53) [V17] ขณะที่ Part 23 ปัจจุบันเป็นแบบ performance-based (§23.2110–§23.2130) [V18] และใช้มาตรฐาน consensus (ASTM) ซึ่งรอบนี้ไม่ได้เปิดอ่าน วิธีทดสอบอย่าง 1 kt/s, 1.2 V_S1 และ 50 ft ยังใช้อ้างอิงได้
9. **Cooper–Harper กับ Level** TN D-5153 ไม่ได้เทียบคะแนนกับ Level ของ MIL-F-8785 [V12] การเทียบที่นิยมใช้ (CHR ≤ 3.5 คือ Level 1) จึงยังไม่ยืนยัน
10. **กฎเลือกค่าที่หลวมกว่า** ยืนยันแล้วจาก Attachment 2 ข้อ 2.b ในฉบับถอดความ [V2]: "the less restrictive may be used unless otherwise indicated" ส่วนข้อ 1.e.1 ระบุชัดว่าให้ใช้ค่าที่เล็กกว่า ยังควรตรวจกับข้อความในฉบับ eCFR ปัจจุบัน [V1] อีกครั้ง
11. **ข้อจำกัดหลัก** เครื่องฝึกของเราเป็นเครื่องสมมติ การทดสอบในหัวข้อนี้จึงพิสูจน์ได้แค่ (ก) ความสอดคล้องภายใน (ข) ความสอดคล้องกับเกณฑ์ของ class และ (ค) ความเสถียรของตัวเลขข้ามการแก้โค้ด ยังพิสูจน์ไม่ได้ว่าเหมือนเครื่องจริงรุ่นใด ส่วนเวลาหน่วงในเบราว์เซอร์ใน 10.3 เป็นค่าประมาณที่ยังไม่ได้วัด

## 10.11 แหล่งอ้างอิง
1. [V1] U.S. GPO / FAA, *14 CFR Part 60, Appendix A — Qualification Performance Standards for Airplane Full Flight Simulators* (eCFR, ฉบับปัจจุบัน; Table A2A เป็นภาพ ER09DE22.017–.050). https://www.ecfr.gov/current/title-14/chapter-I/subchapter-D/part-60/appendix-Appendix%20A%20to%20Part%2060 — ปฐมภูมิ — งานของรัฐบาลสหรัฐฯ (public domain) คัดลอกข้อความและตัวเลขได้ (ในรอบตรวจ eCFR ปฏิเสธเครื่องมืออ่าน (robots) จึงยังไม่ยืนยันรหัสภาพ ER09DE22.017–.050 แต่การแก้ Table A2A เมื่อ 9 ธ.ค. 2022 ยืนยันได้จาก [V23])
2. [V2] RisingUp Aviation, ฉบับถอดความ *Part 60 Appendix A* (ข้อความ CFR ก่อนปี 2016 พร้อม Table A2A แบบข้อความ). https://cdn.risingup.com/fars/info/part60-A-APPX.shtml — ทุติยภูมิ (สำเนาของ CFR) — เนื้อหา CFR เป็น public domain แต่การจัดรูปแบบของเว็บไซต์เป็นของเจ้าของ ใช้ข้อเท็จจริงและตัวเลขได้ และควรตรวจกับ [V1] หรือ [V21]
3. [V3] U.S. GPO, *CFR 2014, Title 14 Vol. 2, Part 60 Appendix B — Qualification Performance Standards for Airplane Flight Training Devices*. https://www.govinfo.gov/content/pkg/CFR-2014-title14-vol2/pdf/CFR-2014-title14-vol2-part60-appB.pdf — ปฐมภูมิ — public domain
4. [V4] ICAO, *Doc 9625 Manual of Criteria for the Qualification of Flight Simulation Training Devices, Vol. I — Aeroplanes*, 4th ed., 2015 (หน้าร้านค้า). https://store.icao.int/en/manual-of-criteria-for-the-qualification-of-flight-simulation-training-devices-volume-i-aeroplanes-9625-1 — ปฐมภูมิ (ไม่ได้อ่านเนื้อหา) — ลิขสิทธิ์ ICAO ให้ลิงก์และสรุปเท่านั้น ห้ามคัดลอกตาราง
5. [V5] EASA, *CS-FSTD(A) Issue 2*, Annex to ED Decision 2018/006/R, 3 May 2018. https://www.easa.europa.eu/sk/downloads/46529/en — ปฐมภูมิ — ลิขสิทธิ์ EASA (ยังไม่ได้ตรวจประกาศเรื่องการทำซ้ำ) อ้างข้อเท็จจริงและข้อความสั้นได้
6. [V6] EASA, ร่าง *GM1 ORA.ATO.135(b) Training aircraft and FSTDs* (Annex to Opinion, ร่าง). https://www.easa.europa.eu/en/downloads/45122/en — ปฐมภูมิ (ฉบับร่าง) — เหมือน [V5]
7. [V7] D. L. Peahl, F. Kolkailah, D. R. Sandlin, *A Survey of Handling Qualities Criteria and Their Applications to High Performance Aircraft*, Cal Poly, รายงานทุน NASA NCC2-338, ม.ค. 1986, N86-30738 (เลข NASA CR บนปกสแกนอ่านไม่ชัด). https://ntrs.nasa.gov/api/citations/19860021266/downloads/19860021266.pdf — รายงานที่ถอดตาราง MIL-F-8785C (ทุติยภูมิต่อสเปก; Table 2 short period, Table 3 delay, Table 4 Dutch roll ที่อ่านไม่ชัดบางช่อง, Table 5 roll mode, Table 6 spiral) — เป็นรายงานของมหาวิทยาลัยภายใต้ทุน NASA ไม่ใช่งานของรัฐบาลโดยตรง ในไฟล์ไม่พบประกาศลิขสิทธิ์ จึงอ้างข้อเท็จจริงและตัวเลขเท่านั้น ไม่คัดลอกตารางหรือภาพลง repo
8. [V8] U.S. DoD, *MIL-F-8785C Military Specification: Flying Qualities of Piloted Airplanes*, 5 Nov 1980. https://everyspec.com/MIL-SPECS/MIL-SPECS-MIL-F/MIL-F-8785C_5295/ — ปฐมภูมิ (ไฟล์เป็นภาพสแกน อ่านข้อความไม่ได้; หน้า everyspec ไม่แสดง distribution statement ระบุ "[NO S/S DOCUMENT]" และมี Notice 2 ปี 1996) — สเปกทางทหารที่เผยแพร่สาธารณะ (คู่มือประกอบ [V22] ระบุ "Approved for public release, distribution unlimited") อ้างตัวเลขได้
9. [V9] T. T. Myers, D. E. Johnston, D. McRuer, *Space Shuttle Flying Qualities and Flight Control System Assessment Study*, NASA CR-170391 (STI TR-1174-1), June 1982. https://ntrs.nasa.gov/api/citations/19820020424/downloads/19820020424.pdf — ปฐมภูมิสำหรับข้อความที่อ้าง ("Level 2 is 0.15 ~ 0.25 versus 0.096 ~ 0.16 for Category C in MIL-F-8785C", OCR) — งานของ Systems Technology, Inc. ภายใต้สัญญา NAS4-2834 ในไฟล์ไม่พบประกาศลิขสิทธิ์ อ้างข้อเท็จจริงได้
10. [V10] B. van Lierop, *Handling Qualities Criteria for Training Effectiveness Assessment of the BS115 Aircraft*, MSc thesis, TU Delft, 2017. https://repository.tudelft.nl/file/File_9e8c4202-d3a9-475e-90c7-f20ff8c97937 — ทุติยภูมิ — ใบอนุญาตของ repository ยังไม่ได้ตรวจ อ้างข้อเท็จจริงเท่านั้น
11. [V11] MathWorks, *Flying Quality Analysis for 6DOF de Havilland Beaver Airframe* (ตัวอย่างของ Aerospace Blockset). https://au.mathworks.com/help/aeroblks/flying-quality-analysis-for-6dof-de-havilland-beaver-airframe.html — ทุติยภูมิ — เอกสาร proprietary ให้ลิงก์และอ้างตัวเลขเท่านั้น
12. [V12] G. E. Cooper, R. P. Harper Jr., *The Use of Pilot Rating in the Evaluation of Aircraft Handling Qualities*, NASA TN D-5153, April 1969. https://ntrs.nasa.gov/api/citations/19690013177/downloads/19690013177.pdf — ปฐมภูมิ — งานของรัฐบาลสหรัฐฯ แปลมาตรวัดเป็นภาษาไทยพร้อมอ้างที่มาได้
13. [V13] M. R. Barber, C. K. Jones, T. R. Sisk, F. W. Haise, *An Evaluation of the Handling Qualities of Seven General-Aviation Aircraft*, NASA TN D-3726, Nov 1966. https://ntrs.nasa.gov/api/citations/19660030615/downloads/19660030615.pdf — ปฐมภูมิ — งานของรัฐบาลสหรัฐฯ
14. [V14] MIT OpenCourseWare, *16.333 Aircraft Stability and Control*, Fall 2004, Lecture 7 https://ocw.mit.edu/courses/16-333-aircraft-stability-and-control-fall-2004/2aca82b5d1a5aacf39ceffcfe4e5b517_lecture_7.pdf และ Lecture 9 https://mitocw.ups.edu.ec/courses/aeronautics-and-astronautics/16-333-aircraft-stability-and-control-fall-2004/lecture-notes/lecture_9.pdf — ทุติยภูมิ (Lecture 7 "Approximate Longitudinal Dynamics Models" ให้ตัวเลขโหมด; Lecture 9 "Basic Longitudinal Control" ระบุสภาวะ "B747 at Mach 0.8, 40,000ft" และ "From Etkin and Reid") — OCW ใช้ CC BY-NC-SA (ไม่ได้เห็นข้อความใบอนุญาตในไฟล์) อ้างตัวเลขได้ แต่ห้ามคัดลอกเนื้อหาลง repo เพราะ NC และ SA ไม่เข้ากับ repo ที่ยังไม่มีใบอนุญาต
15. [V15] JSBSim-Team, *JSBSim* (GitHub, commit 3f153c1 ลงวันที่ 2026-11-16; โมเดล `aircraft/c172x`, `aircraft/737`) และแพ็กเกจ PyPI `jsbsim` 1.3.3 (`FGLinearization`). https://github.com/JSBSim-Team/jsbsim — โมเดลเปิด — โค้ดเป็น LGPL-2.1 (`COPYING`) ส่วนไฟล์ XML ของ c172x และ 737 ระบุ GPL ในส่วนหัวของไฟล์ อ้างตัวเลขที่คำนวณได้ แต่ห้ามคัดลอกไฟล์ XML หรือโค้ดลง repo
16. [V16] *14 CFR § 25.103 Stall speed* (ผ่าน Cornell LII). https://www.law.cornell.edu/cfr/text/14/25.103 — ปฐมภูมิ — public domain
17. [V17] FAA, *AC 23-8C Flight Test Guide for Certification of Part 23 Airplanes*, 16 Nov 2011. https://www.faa.gov/documentLibrary/media/Advisory_Circular/AC_23-8C.pdf — ปฐมภูมิ — public domain
18. [V18] *14 CFR Part 23 Subpart B, §§ 23.2110–23.2130* (eCFR). https://www.ecfr.gov/current/title-14/chapter-I/subchapter-C/part-23/subpart-B/subject-group-ECFR0f27e01839859ea — ปฐมภูมิ — public domain (ในรอบตรวจ eCFR ปฏิเสธเครื่องมืออ่าน ข้อความ §23.2110 "idle or zero thrust", §23.2115(b) 50 ft, §23.2120(a)(1) 8.3 %, §23.2125(a)/(b) และ §23.2130(a) ตรวจจากสำเนาของ Gleim https://www.gleim.com/aviation/faraim/index.php?fullTextNum=23B ซึ่งเป็นแหล่งทุติยภูมิ)
19. [V19] AirfieldLab, `src/20-flight.js`, `src/10-atmo.js`, `test/*.mjs` (commit cabf0f0) และสคริปต์ของหัวข้อนี้ใน `scripts/` (`v10_modes.mjs`, `v10_modes_condensed.mjs`, `v10_timeresp.mjs`, `v10_perf.mjs`, `v10_extra.mjs`, `v10_misc.mjs`, `v10_jsb_c172.py`; สคริปต์ตรวจทาน `v10rev_json.mjs`, `v10rev_snippet.mjs`, `v10rev_expected.mjs`) — โค้ดของโครงการเอง (repo ยังไม่มี LICENSE)
20. [V20] R. K. Heffley, W. F. Jewell (Systems Technology, Inc.), *Aircraft Handling Qualities Data*, NASA CR-2144, 1 Dec 1972. https://ntrs.nasa.gov/citations/19730003312 (สำเนา: https://www.robertheffley.com/docs/Data/NASA%20CR-2144--Heffley--Aircraft%20Handling%20Qualities%20Data.pdf) — ปฐมภูมิ (รอบนี้อ่านได้แค่รายชื่อเครื่องบิน 10 แบบ) — หน้า NTRS ระบุ "Work of the US Gov. Public Use Permitted" อ้างและคัดลอกตัวเลขได้ ควรดึงตัวเลขของ B-747, CV-880M และ Jetstar ในรอบ 2
21. [V21] FAA National Simulator Program, *14 CFR Part 60 (2016), NSP Consolidated Version* (For Reference Use Only). https://www.faa.gov/sites/faa.gov/files/about/initiatives/nsp/14CFR60_Searchable_Version.pdf — ปฐมภูมิ (ฉบับรวม) — public domain; รอบนี้อ่านได้ถึง Appendix A ข้อ 11 เท่านั้น
22. [V22] D. J. Moorhouse, R. J. Woodcock, *Background Information and User Guide for MIL-F-8785C, Military Specification—Flying Qualities of Piloted Airplanes*, AFWAL-TR-81-3109 (ปกระบุ July 1982 ส่วนหน้า Report Documentation ระบุ September 1981) (DTIC ADA119421). https://apps.dtic.mil/sti/pdfs/ADA119421.pdf — ปฐมภูมิ (คำอธิบายของผู้จัดทำสเปก; ข้อความ OCR อ่านได้บางส่วน ตาราง Table VI อ่านไม่ได้) — "Approved for public release, distribution unlimited" รายงานรัฐบาลสหรัฐฯ อ้างได้
23. [V23] FAA, *Miscellaneous Amendments* (final rule, technical amendment), 87 FR 75704, 9 Dec 2022, Docket FAA-2022-1355, FR Doc 2022-23327. https://www.govinfo.gov/content/pkg/FR-2022-12-09/pdf/2022-23327.pdf (ที่เปิดอ่านจริงคือสำเนา https://regulations.justia.com/regulations/fedreg/2022/12/09/2022-23327.html) — ปฐมภูมิ — งานของรัฐบาลสหรัฐฯ (public domain); ยืนยันคำสั่ง "Revise table A2A" ใน Part 60 Appendix A

## 10.12 งานที่แนะนำสำหรับ Claude Code
1. **P1 · S** สร้าง `test/lib/fstd.mjs` (`f9`, `solve`, `trim`, `linearise`, `eig4`, `modes`, `within`, `levelOf`) จากสคริปต์ใน 10.5 และ `test/modes.test.mjs` ที่ใช้ `node:test` กับ `node:assert/strict` แล้วเพิ่ม `eulerToQ` และ `qToR` ใน export ของ `test/harness.mjs` — พิสูจน์ด้วย T-V-01 ถึง T-V-06
2. **P1 · S** เพิ่ม `node --test "test/**/*.test.mjs"` ใน `.github/workflows/pages.yml` และเปลี่ยนไฟล์ทดสอบที่พิมพ์ผลอย่างเดียว (`flight`, `stall`, `assist`) ให้มี assertion (เช่น autoland ทุก scenario ได้คะแนน ≥ 90 และ CLmax ตรงกับหัวข้อ 1) — T-V-01 และ T-V-11
3. **P1 · M** สร้าง `test/lib/maneuvers.mjs` (pulse, doublet, spiral release, roll step, `fitOsc`) และ `test/hq-time.test.mjs` — T-V-07 ถึง T-V-10
4. **P1 · M** สร้าง `test/perf.test.mjs` (stall 1 kt/s, climb และ glide sweep, takeoff 50 ft, landing 50 ft) พร้อม `data/ref/trainer.json` สำหรับค่า regression และปรับเกนของตัวควบคุม stall ให้อัตราลดความเร็วไม่เกิน 1 kt/s — T-V-11 ถึง T-V-15
5. **P2 · M** ทำร่วมกับหัวข้อ 3 และ 4 ให้มีโหมดเครื่องดับ (windmill หรือ feather), flight idle ที่แรงขับไม่บวก และกำลังที่ลดตามความหนาแน่นและอุณหภูมิ — T-V-13 และ T-V-12 (ROC ต้องลดตามความสูง)
6. **P2 · S** ย้าย α̇ เข้าไปใน `deriv()` (แบบ quasi-steady หรือเป็นสถานะกรอง) เพื่อให้ Jacobian ของ `deriv()` สมบูรณ์โดยไม่ต้องแก้แบบ $(I-bc^T)^{-1}$ — T-V-02 (ผลแบบ Jacobian ตรงต้องเท่ากับ quasi-steady ±2 %)
7. **P2 · M** เขียนตัวหาค่าเฉพาะของเมทริกซ์เต็ม (Hessenberg + shifted QR) และรายงานพจน์คู่ควบ ให้พร้อมก่อนเพิ่ม P-factor, torque และ slipstream — T-V-01 ถึง T-V-06 ต้องยังผ่าน
8. **P2 · S** กำหนด schema ของ `data/ref/<type>.json` และฟังก์ชัน proof of match ที่ใช้ `validation.fstdTolerances` สำหรับเครื่องจริงในรอบ 2 (C172S, DA40/42, ATR 72, 737, A320) — ใช้รูปแบบของ T-V-08 ถึง T-V-15
9. **P3 · S** เพิ่ม overlay สำหรับนักพัฒนาที่วัดเวลาจาก input ถึงเฟรมแรกที่ท่าทางบนจอเปลี่ยน (keyboard, touch, gamepad) โดยเป้าคือไม่เกิน 100 ms รวมทั้งสาย — T-V-07 (ส่วนของโมเดล) และทดสอบด้วยมือในเบราว์เซอร์
10. **P3 · M** เพิ่มแบบสอบถาม Cooper–Harper ภาษาไทยในหน้า debrief โดยใช้เกณฑ์ desired และ adequate จาก `Evaluator` เก็บไว้ใช้ปรับความรู้สึกของการบังคับ — ไม่มีการทดสอบอัตโนมัติ (ทดสอบด้วยมือ)
