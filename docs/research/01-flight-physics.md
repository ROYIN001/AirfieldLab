# รอบที่ 1: หลักฟิสิกส์การบินสำหรับเครื่องจำลองที่สมจริง

> โครงการ AirfieldLab (ท่าอากาศยานดอนเมือง VTBD) · ค้นคว้าวันที่ 17–18 พ.ย. 2026 · เทียบกับโค้ดที่ commit `cabf0f0` ของ `main`
> ขอบเขต: 12 หัวข้อย่อย, แหล่งอ้างอิง 301 รายการพร้อมสัญญาอนุญาต, กรณีทดสอบ 179 กรณี, พารามิเตอร์ 619 ตัว (ต้องเติมรายแบบเครื่องบิน 384 ตัว)
> ทุกหัวข้อผ่านผู้ตรวจทานอิสระหนึ่งรอบ ซึ่งเปิดแหล่งอ้างอิงจริงเพื่อตรวจตัวเลข ตรวจหน่วยและเครื่องหมายของสมการ parse JSON และคำนวณผลคาดหวังของกรณีทดสอบใหม่ด้วย Node

## วิธีอ่านรายงานนี้

เนื้อหาเต็มยาวราว 1.2 MB จึงแยกเป็นไฟล์ละหัวข้อในโฟลเดอร์ [`01-flight-physics/`](01-flight-physics/) เพื่อให้ GitHub แสดงผลได้และให้ Claude Code โหลดเฉพาะส่วนที่ต้องใช้ ทุกไฟล์หัวข้อมีโครงเดียวกัน คือ สรุปสั้น → สภาพปัจจุบันในโค้ด → ฟิสิกส์และสมการ → ค่าพารามิเตอร์ (JSON) → กรณีทดสอบ → ความขัดแย้งของแหล่งข้อมูล → แหล่งอ้างอิงพร้อมสัญญาอนุญาต → งานที่แนะนำ

ไฟล์นี้รวบรวมสิ่งที่ต้องเห็นภาพรวม ได้แก่ ข้อค้นพบหลัก, โครงสร้างโมเดลที่แนะนำสำหรับรอบ 2–3, schema ของพารามิเตอร์, ผลวัดโมเดลปัจจุบัน, ความขัดแย้งที่ยังค้าง, สัญญาอนุญาต และรายการงานรวมที่ท้ายไฟล์ ตัวเลขในไฟล์นี้เป็นตัวเลขสรุปจากไฟล์หัวข้อ แหล่งอ้างอิงปฐมภูมิของแต่ละตัวอยู่ในไฟล์หัวข้อที่ลิงก์ไว้

ไฟล์ประกอบ:
- [`01-flight-physics/schema.md`](01-flight-physics/schema.md) ตาราง schema ของพารามิเตอร์ทุกตัว แยกว่าตัวไหนต้องเติมรายแบบเครื่องบิน (สร้างอัตโนมัติจาก JSON ในไฟล์หัวข้อ)
- [`01-flight-physics/params-trainer.json`](01-flight-physics/params-trainer.json) JSON ทุกหมวดรวมไว้ในไฟล์เดียวสำหรับให้โค้ดอ่าน
- [`01-flight-physics/scripts/`](01-flight-physics/scripts/) สคริปต์ Node และ Python ที่ใช้คำนวณตัวเลขและผลคาดหวังในรายงาน (เป็นหลักฐานการคำนวณ ไม่ใช่โค้ดของแอป)

## สรุปสั้น

- **แกนกลางของฟิสิกส์ถูกต้องแล้ว ไม่ต้องเปลี่ยน integrator** ผู้วิจัยสร้างโมเดล JSBSim จากพารามิเตอร์ `AC` ของเราแล้วบินเทียบกัน 25 วินาที ต่างกันสูงสุดเพียง h 4 mm และ θ 0.014° ([หัวข้อ 12](01-flight-physics/12-other-sims.md)) ส่วน RK4 ที่ 240 Hz มี |λ|Δt สูงสุด 0.74 เทียบกับขอบเสถียร 2.785 ([หัวข้อ 9](01-flight-physics/09-numerics.md)) ช่องว่างของความสมจริงอยู่ที่ข้อมูลและโมเดลย่อย
- **โหมดพลวัตของโมเดลปัจจุบันอยู่ใน Level 1 แล้ว** ตอน approach 95 kt แฟลปลง ได้ short period ωn 2.22 rad/s ζ 0.58 CAP 0.95, phugoid ζ 0.115, Dutch roll ωn 1.61 rad/s ζ 0.139, roll mode τR 0.22 s และ spiral เสถียร ซึ่งผ่านเกณฑ์ Class I Category C ของ MIL-F-8785C ทุกข้อ ([หัวข้อ 10](01-flight-physics/10-validation.md))
- **ปัญหาที่ใหญ่ที่สุดสำหรับเครื่องฝึกลงจอดอยู่ที่พื้นและใกล้พื้น** โช้คเชิงเส้นให้แรงกระแทกสูงสุดในเฟรมแรก (3.39 เท่าของน้ำหนักที่อัตราจม 3 m/s) ยางด้านข้างผูกกับความเร็วแทนมุม slip เครื่องที่เหยียบเบรกเต็มยังไหล 1.2 cm/s และไม่มีสภาพผิวทางวิ่งตาม GRF ที่ไทยใช้ตั้งแต่ 4 พ.ย. 2021 ([หัวข้อ 7](01-flight-physics/07-gear.md)) ส่วน ground effect อ่อนเกินจริง สูตร Tani ให้ induced drag เหลือ 51% ที่ h/b 0.1 แต่โค้ดให้ 72% และ downwash ที่หางที่ลดลงควรต้องใช้ elevator เพิ่มราว 4° ตอน flare ([หัวข้อ 2](01-flight-physics/02-interference.md))
- **ไม่มีผลของใบพัดเลย** แรงบิดปฏิกิริยา P-factor gyroscopic และ slipstream เป็นศูนย์ทั้งหมด ที่ความเร็ว 0 จึงไม่มีแรงบังคับจากหาง แรงบิดเต็มที่ 3,342 N·m เท่ากับ 26% ของโมเมนต์ม้วนสูงสุดของ aileron ที่ 95 kt ([หัวข้อ 3](01-flight-physics/03-propeller.md), [4](01-flight-physics/04-turboprop.md)) และที่ flight idle โมเดลยังให้แรงขับบวก ทำให้ glide ratio ที่ idle ออกมา 21.7 ทั้งที่ L/D สูงสุดมีแค่ 16.5 ([หัวข้อ 10](01-flight-physics/10-validation.md))
- **เครื่องยนต์ PT6A-62 ไม่เสียกำลังที่ดอนเมืองในวันร้อน** TCDS ระบุ 708 kW และ flat rate ถึง 37 °C จึงยังให้กำลังเต็มที่ OAT 31–37 °C แต่การตอบสนองต้องเป็นรูปตัว S ตาม 14 CFR 33.73(b) (flight idle ถึง 95% ภายใน 5 s) โมเดลที่เสนอได้ 14–19% ที่ 1 s ขณะที่โค้ดปัจจุบันได้ 65% ([หัวข้อ 4](01-flight-physics/04-turboprop.md)) ใบพัด Hartzell รุ่นที่ใช้กับเครื่องคลาสนี้ไม่ได้รับอนุมัติให้ reverse เครื่องฝึกจึงควรตั้ง `reverseAvailable: false` ([หัวข้อ 3](01-flight-physics/03-propeller.md))
- **Stall ยังไม่ใช่บทเรียนที่ใช้ได้** สัญญาณเตือนดังก่อน stall เพียง 1.3 kt (แฟลปเก็บ) และ 0.6 kt (แฟลปลง) ต่ำกว่าเกณฑ์ ≥ 5 kt ของ 14 CFR 23.207 ฉบับปี 2016 CL ตกหน้าผา 72–75% ภายใน 5° หลัง CLmax และไม่มี wing drop เพราะ Clp คงที่ทุก α ([หัวข้อ 1](01-flight-physics/01-aero.md))
- **โหมด DIRECT ไม่มี speed stability** auto-trim ที่บวก pitch rate เข้า trim ทำให้ดึงคันแล้วปล่อย เครื่องค้างที่ 80.5 kt แทนที่จะกลับมา 95 kt ซึ่งไม่ผ่าน 14 CFR 23.173(b) และยังไม่มีแนวคิดแรงที่คันบังคับหรือ trim tab ([หัวข้อ 6](01-flight-physics/06-controls.md))
- **บั๊กอินพุตที่ควรแก้ก่อนอย่างอื่น** คีย์ลดคันเร่งคือ Ctrl และคีย์ดึงหัวขึ้นคือ W เมื่อกดพร้อมกันเป็น Ctrl+W ซึ่ง Chrome ปิดแท็บทันทีและหน้าเว็บดักไม่ได้ ส่วนคีย์บอร์ดจริง ๆ มี ramp อยู่แล้ว (CLAUDE.md เขียนว่า binary) แต่เร็วเกินไป กดค้าง 0.3 s ได้ +0.40 g ([หัวข้อ 11](01-flight-physics/11-input.md))
- **ยังไม่มีการทดสอบที่ตกได้** ไฟล์ `test/*.mjs` ทุกไฟล์พิมพ์ผลอย่างเดียว ไม่มี assertion และ CI รันแค่ `geo` กับ `runways` ([หัวข้อ 10](01-flight-physics/10-validation.md)) ภาพยังกระตุกเพราะตัวสะสมเวลาปัดเศษผิดและไม่มีการ interpolate สถานะตอนเรนเดอร์ และผลการบินในความปั่นป่วนเปลี่ยนตาม Δt เพราะสุ่มเลขใหม่ทุกก้าวฟิสิกส์ ([หัวข้อ 9](01-flight-physics/09-numerics.md))
- **ความปั่นป่วนมีความเข้มถูกแต่รูปสเปกตรัมผิด** ทุกแกนเป็น first-order และไม่มี gust เชิงหมุน ซึ่งเป็นสิ่งที่นักบินเครื่องเล็กรู้สึกชัดที่สุด ([หัวข้อ 8](01-flight-physics/08-wind.md))

## สารบัญหัวข้อย่อย

| # | หัวข้อ | ความเชื่อมั่น | กรณีทดสอบ | พารามิเตอร์ | ข้อค้นพบหลัก |
|---|---|---|---|---|---|
| 1 | [อากาศพลศาสตร์ α ±180° stall wing drop buffet spin](01-flight-physics/01-aero.md) | กลาง | 15 | 51 | ช่วงหลัง stall ยังไม่สมจริง: เตือน stall ก่อนเพียง 1.3 kt (clean) และ 0.6 kt (แฟลปลง), CL ตกหน้าผา, ไม่มี wing drop แนะนำ build-up แบบ hybrid ที่ผสมกับตารางเต็มช่วง α ±180° |
| 2 | [Downwash lag, ground effect, slipstream](01-flight-physics/02-interference.md) | กลาง | 15 | 34 | α̇ คำนวณช้ากว่าที่ควร, ground effect อ่อนเกินจริง 1.7–5.6 เท่าตอนแตะพื้น และยังไม่มี slipstream จึงไม่มีแรงบังคับจากหางที่ความเร็ว 0 |
| 3 | [ใบพัด: BEM, CT/CP, governor, beta/reverse, torque, P-factor, gyroscopic](01-flight-physics/03-propeller.md) | กลาง | 15 | 51 | แรงขับไม่ขึ้นกับความหนาแน่น รอบ หรือมุมใบ เสนอคลาส Propeller ที่อ่านตาราง CT/CP(J, β) ซึ่งคำนวณ BEM ไว้ล่วงหน้า |
| 4 | [เครื่องยนต์เทอร์โบพร็อปคลาส PT6A](01-flight-physics/04-turboprop.md) | กลาง | 15 | 44 | PT6A-62 flat rate ถึง 37 °C จึงไม่เสียกำลังที่ VTBD วันร้อน แต่การเร่งต้องเป็นรูปตัว S ตาม 14 CFR 33.73 ไม่ใช่ lag อันดับหนึ่ง |
| 5 | [เครื่องยนต์เทอร์โบแฟน: thrust lapse, spool, idle, reverser](01-flight-physics/05-turbofan.md) | กลาง | 15 | 84 | ยังไม่มีเทอร์โบแฟนเลย เสนอ thrust lapse ของ Bartel & Young (M ≤ 0.45), N2 แบบ first-order ที่มี accel schedule (flight idle → 95% ใน 4.6 s ผ่าน 14 CFR 33.73), idle สามระดับ, reverser แบบเครื่องสถานะ และ AC.engines[] สำหรับแรงขับไม่สมมาตร เตรียมไว้ให้รอบ 3 |
| 6 | [ระบบบังคับ: hinge moment, แรงที่คันบังคับ, trim, actuator, FBW](01-flight-physics/06-controls.md) | กลาง | 15 | 70 | auto-trim ของโหมด DIRECT ลบ speed stability และระบบไม่มีแนวคิด "แรง" เสนอโมเดล reversible จาก hinge moment ที่ให้ 8.9 lbf/g (อยู่ใน Level 1) |
| 7 | [ล้อและพื้น: oleo, ยาง, เบรก, anti-skid, การเลี้ยว, ทางวิ่งเปียก](01-flight-physics/07-gear.md) | กลาง | 15 | 82 | โช้คให้แรงสูงสุดทันทีที่แตะ, ยางด้านข้างผูกกับความเร็วแทนมุม slip, ไม่มีสภาพผิว GRF/RWYCC และเครื่องที่จอดเหยียบเบรกยังไหล |
| 8 | [ลม: Dryden/von Kármán, gust, wind shear, microburst, wake vortex](01-flight-physics/08-wind.md) | กลาง | 15 | 39 | ความเข้มของความปั่นป่วนถูกแล้ว แต่สเปกตรัมเป็น first-order และไม่มี gust เชิงหมุน เสนอ Dryden ตาม 8785C แบบ exact discretization, microburst และ wake |
| 9 | [วิธีเชิงตัวเลข: integrator, ความแข็งของล้อ, fixed timestep](01-flight-physics/09-numerics.md) | สูง | 15 | 40 | RK4 ที่ 240 Hz เสถียรพอแล้ว ปัญหาอยู่ที่แรงเสียดทาน tanh, ตัวสะสมเวลา, การไม่ interpolate ตอนเรนเดอร์ และ Dryden ที่ผลขึ้นกับ Δt |
| 10 | [การตรวจความสมจริง: Part 60, MIL-F-8785C, โหมดพลวัต](01-flight-physics/10-validation.md) | กลาง | 15 | 44 | โหมดพลวัตผ่าน Level 1 แล้ว แต่สมรรถนะยังผิด (glide ratio ที่ idle 21.7 เทียบ L/D สูงสุด 16.5, ROC ไม่ลดตามความสูง) และชุดทดสอบไม่มี assertion เลย |
| 11 | [อินพุต: gamepad, คีย์บอร์ด, HOTAS, pedals, การแสดงแรง](01-flight-physics/11-input.md) | กลาง | 16 | 46 | Ctrl+W ปิดแท็บ Chrome, ramp ของคีย์บอร์ดมีอยู่แต่เร็วเกิน, Gamepad API ใช้ได้ทุกเบราว์เซอร์หลัก เสนอชั้น shaping ที่ไม่ผูกกับ DOM ใน src/25-input.js |
| 12 | [ซิมตัวอื่น: JSBSim, YASim, X-Plane, MSFS, GeoFS](01-flight-physics/12-other-sims.md) | กลาง | 13 | 34 | EOM ของเราตรงกับ JSBSim (บิน open-loop 25 s ต่างกัน h 4 mm, θ 0.014°) ซิมทุกตัวแยกนิยามเครื่องบินออกจากโค้ด เสนอ data/aircraft/*.json แบบ JSBSim และ oracle JSBSim ออฟไลน์ ยังไม่แนะนำ JSBSim-WASM ในหน้าเว็บ |

## ข้อตกลงร่วมของทุกหัวข้อ

**แกนและหน่วย** ตามโค้ดปัจจุบัน: โลกเป็น NED หน่วยเมตร จุดกำเนิดที่ ARP, ตัวเครื่องเป็น FRD, quaternion แปลงจากตัวเครื่องไป NED, ภายในใช้ SI ทั้งหมด, α เป็นบวกเมื่อเชิดหัว, คำสั่ง elevator บวกคือขอบท้ายลง (ก้มหัว) รายงานให้หน่วยการบิน (kt, ft, fpm, lbf, psi) คู่กับ SI เมื่อเป็นตัวเลขที่นักบินใช้

**รูปแบบพารามิเตอร์ใน JSON** พารามิเตอร์หนึ่งตัวเป็นอ็อบเจกต์ `{"v", "u", "scope", "src", "conf", "est", "note"}` เสมอ รายละเอียดอยู่ใน [schema.md](01-flight-physics/schema.md)
- `scope` บอกว่ารอบ 2–3 ต้องเติมค่าหรือไม่: `aircraft`, `engine`, `propeller`, `gear` ต้องเติมรายแบบเครื่องบิน ส่วน `environment` และ `sim` ใช้ร่วมกันทุกแบบ
- `est: true` คือ **ค่าประมาณ** (ออกแบบหรือคำนวณเองจากแหล่งอื่น) และต้องมีวิธีได้มาใน `note` หรือในเนื้อหา
- `conf` คือความเชื่อมั่น: **สูง** = อ่านจากเอกสารปฐมภูมิโดยตรงหรือคำนวณจากนิยาม · **กลาง** = มีแหล่งแต่เป็นทุติยภูมิ หรือต้องตีความ/ปรับใช้กับเครื่องของเรา · **ต่ำ** = ค่าประมาณจากหลักการหรือแหล่งที่อ่านไม่ครบ หรือ "ยังไม่ยืนยัน"

**รหัสอ้างอิงและกรณีทดสอบ** แต่ละหัวข้อมีอักษรนำหน้าของตัวเอง เช่น [G6] คือแหล่งที่ 6 ในหัวข้อล้อ และ T-G-06 คือกรณีทดสอบที่ 6 ของหัวข้อเดียวกัน

| หัวข้อ | อักษร | หัวข้อ | อักษร | หัวข้อ | อักษร |
|---|---|---|---|---|---|
| 1 อากาศพลศาสตร์ | A | 5 เทอร์โบแฟน | F | 9 วิธีเชิงตัวเลข | N |
| 2 downwash/GE/slipstream | U | 6 ระบบบังคับ | C | 10 การตรวจความสมจริง | V |
| 3 ใบพัด | P | 7 ล้อและพื้น | G | 11 อินพุต | I |
| 4 เทอร์โบพร็อป | E | 8 ลมและ wake | W | 12 ซิมตัวอื่น | S |

**สมมติฐานร่วมของเครื่องฝึกสมมติ** (ทุกหัวข้อใช้ชุดเดียวกัน): มวล 2,250 kg, S 16.3 m², b 10.2 m, c̄ 1.65 m ตาม `AC` เดิม เครื่องยนต์เทอร์โบพร็อปแบบ free turbine คลาส PT6A-62 ราว 700 kW ([หัวข้อ 4](01-flight-physics/04-turboprop.md) ยืนยันจาก TCDS ว่ารุ่นนี้ให้ 708 kW ที่ 2,000 rpm), ใบพัดแบบ constant-speed 4 ใบ เส้นผ่านศูนย์กลาง 2.44 m หมุนตามเข็มนาฬิกาเมื่อมองจากด้านหลัง ([หัวข้อ 3](01-flight-physics/03-propeller.md) ยืนยันจาก TCDS ของใบพัดที่ใช้กับเครื่องคลาสนี้ ส่วน TCDS ของเครื่องยนต์ไม่ระบุทิศ), ไม่มี reverse, ล้อแบบ tricycle ตำแหน่งตาม `AC.gear` เครื่องฝึกนี้เป็นเครื่องสมมติ ไม่ใช่แบบใดแบบหนึ่งของผู้ผลิต

## โครงสร้างโมเดลที่แนะนำ (ให้รอบ 2–3 เติมข้อมูลตามนี้)

ลำดับการคำนวณในหนึ่งก้าวฟิสิกส์ (240 Hz, RK4 เหมือนเดิม) และโมดูลที่แต่ละหัวข้อเสนอ:

```
อินพุต (คีย์บอร์ด / gamepad / จอสัมผัส)            ← หัวข้อ 11: shaping ที่ไม่ผูก DOM (src/25-input.js)
  → กฎการบังคับ PilotLaws / ControlAxis (แรงที่คัน, trim tab, breakout)   ← หัวข้อ 6
  → actuator (rate limit + lag ต่อพื้นบังคับ)                              ← หัวข้อ 6, 12
  → Aircraft.deriv():
       บรรยากาศ USSA-1976 + ลมเฉลี่ย log-law + Dryden 8785C (u, v, w, p, q, r)
         + gust 1-cosine + microburst Oseguera–Bowles + wake vortex           ← หัวข้อ 8
       อากาศพลศาสตร์แบบ hybrid: ค่าสถิตเต็มช่วง α ±180° (ตารางหรือสูตร)
         ผสมกิ่งไหลเกาะ/แยกตัวด้วยสถานะ X + derivative สำหรับ damping/control
         + ปีกแบบ strip 8 แผงต่อข้าง (ระยะ P2)                                 ← หัวข้อ 1
       หาง: downwash lag (α̇ ปิดรูป), ground effect แบบ Tani, slipstream q̄ และ swirl ← หัวข้อ 2
       ระบบขับเคลื่อน AC.engines[] (ตำแหน่งและทิศแรงขับต่อเครื่อง):
         Turboprop (Ng, ITT, แรงบิด, flat rating) → Propeller (ตาราง CT/CP(J, β), governor,
         แรงบิดปฏิกิริยา, P-factor, gyroscopic)  หรือ TurbofanEngine (N2, thrust lapse, reverser) ← หัวข้อ 3, 4, 5
       ล้อ: โช้ค oleo แบบมีสถานะ stroke, ยางแบบมุม slip + relaxation, แรงเสียดทานสถิตแบบ bristle,
         μ(V, RWYCC) + hydroplaning, เบรกซ้าย/ขวา, ล้อหน้าเลี้ยวด้วยแป้น + caster      ← หัวข้อ 7, 9
  → RK4 240 Hz, ตัวสะสมเวลาแบบ fixed step ที่แก้ปัดเศษแล้ว, interpolate สถานะตอนเรนเดอร์ ← หัวข้อ 9
  → Evaluator / การทดสอบอัตโนมัติด้วย node:test, oracle JSBSim แบบออฟไลน์              ← หัวข้อ 10, 12
```

**ไฟล์ข้อมูลเครื่องบิน** หัวข้อ 12 เสนอให้ย้าย `AC` ออกจากโค้ดไปเป็น `data/aircraft/<type>.json` ที่แบ่งเป็นกลุ่มตามแนวของ JSBSim และทุก leaf ใช้รูปแบบ `{v, u, scope, src, conf, est, note}` เมื่อรอบ 2–3 เพิ่ม C172S, DA40/DA42, ATR 72-600, 737-800, A320/A321 ให้เติมเฉพาะ leaf ที่มี scope เป็น aircraft/engine/propeller/gear ตาม [schema.md](01-flight-physics/schema.md)

| กลุ่มข้อมูลต่อแบบเครื่องบิน | กำหนดไว้ในหมวด JSON | ตัวอย่างค่าที่ต้องเติม |
|---|---|---|
| ขนาด มวล inertia | `aero`, `validation` | S, b, c̄, m, Ixx–Izz, Ixz, ตำแหน่ง CG |
| อากาศพลศาสตร์ | `aero`, `interference` | CLα, CL0 ตามแฟลป, CLmax/α* ตามแฟลป, CDmax, Cmα, derivative ต่าง ๆ, เรขาคณิตหาง (S_t, l_t, dε/dα, η_t) |
| ระบบบังคับ | `controls` | ระยะเคลื่อนของพื้นบังคับ, gearing, hinge-moment coefficient, อัตรา trim, rate limit ของ actuator, ชนิดระบบ (reversible / feel / fbw) |
| เครื่องยนต์ | `turboprop` หรือ `turbofan` | กำลังหรือแรงขับพิกัด, flat rating, ขีดจำกัด (แรงบิด, ITT, N1/N2), พลวัตการเร่ง, idle, reverser |
| ใบพัด | `propeller` | D, จำนวนใบ, rpm, ตาราง CT/CP, ช่วงมุมใบ, I_prop, ทิศการหมุน, `reverseAvailable` |
| ล้อ | `gear` | ตำแหน่งล้อ, stroke, แรงดันก๊าซ, orifice, ขนาดและแรงดันยาง, cornering stiffness, brake torque, มุมเลี้ยว |
| ค่าอ้างอิงเพื่อตรวจ | `validation` | ความเร็ว stall ตามแฟลป, อัตราไต่, glide ratio, ระยะวิ่งขึ้นและลงจอด, ค่าโหมดพลวัต |

**สถานะใหม่ที่จะเพิ่มใน state vector** (ตามข้อเสนอของหัวข้อ 7 และ 9): stroke ของโช้ค `x[13..15]`, การเบี่ยงด้านข้างของยาง `x[16..18]`, bristle ตามยาว `x[19..21]` ส่วนสถานะที่ไม่ต้องอยู่ใน RK4 (อัปเดตแบบ exact ทีละก้าว) ได้แก่ X ของการแยกตัว, Ng/ITT ของเครื่องยนต์, N2 ของเทอร์โบแฟน, รอบและมุมใบพัด, ตำแหน่ง trim tab และตัวกรองความปั่นป่วน

## Schema พารามิเตอร์

จำนวนพารามิเตอร์ตาม scope (ตารางเต็มทุกตัวอยู่ใน [schema.md](01-flight-physics/schema.md)):

| หมวด (key) | หัวข้อ | aircraft | engine | propeller | gear | environment | sim | รวม | ค่าประมาณ |
|---|---|---|---|---|---|---|---|---|---|
| `aero` | [1. อากาศพลศาสตร์ stall และ spin](01-flight-physics/01-aero.md) | 41 | 0 | 0 | 0 | 0 | 10 | 51 | 42 |
| `interference` | [2. downwash lag, ground effect, slipstream](01-flight-physics/02-interference.md) | 27 | 0 | 3 | 0 | 0 | 4 | 34 | 28 |
| `propeller` | [3. ใบพัด](01-flight-physics/03-propeller.md) | 2 | 7 | 39 | 0 | 0 | 3 | 51 | 42 |
| `turboprop` | [4. เทอร์โบพร็อปคลาส PT6A](01-flight-physics/04-turboprop.md) | 3 | 37 | 1 | 0 | 0 | 3 | 44 | 30 |
| `turbofan` | [5. เทอร์โบแฟน](01-flight-physics/05-turbofan.md) | 1 | 61 | 0 | 0 | 16 | 6 | 84 | 50 |
| `controls` | [6. ระบบบังคับ](01-flight-physics/06-controls.md) | 50 | 0 | 0 | 0 | 0 | 20 | 70 | 50 |
| `gear` | [7. ล้อและพื้น](01-flight-physics/07-gear.md) | 18 | 0 | 0 | 50 | 10 | 4 | 82 | 54 |
| `wind` | [8. ลม ความปั่นป่วน microburst wake](01-flight-physics/08-wind.md) | 6 | 0 | 0 | 0 | 24 | 9 | 39 | 11 |
| `numerics` | [9. วิธีเชิงตัวเลข](01-flight-physics/09-numerics.md) | 0 | 0 | 0 | 8 | 1 | 31 | 40 | 25 |
| `validation` | [10. การตรวจความสมจริง](01-flight-physics/10-validation.md) | 10 | 0 | 0 | 0 | 0 | 34 | 44 | 9 |
| `input` | [11. อินพุต](01-flight-physics/11-input.md) | 2 | 0 | 0 | 0 | 0 | 44 | 46 | 30 |
| `otherSims` | [12. ซิมตัวอื่น](01-flight-physics/12-other-sims.md) | 10 | 1 | 2 | 5 | 0 | 16 | 34 | 8 |
| **รวม** | | 170 | 106 | 45 | 63 | 51 | 184 | 619 | 379 |

คอลัมน์ aircraft, engine, propeller และ gear คือค่าที่รอบ 2–3 ต้องเติมรายแบบเครื่องบิน ส่วน environment และ sim ใช้ร่วมกันทุกแบบ ค่าในรอบนี้เป็นค่าของเครื่องฝึกสมมติ (และ CFM56 เป็นตัวอย่างในหมวด turbofan)

ค่าที่หลายหัวข้อใช้ร่วมกันและต้องใช้ค่าเดียวกันเมื่อนำไปเขียนโค้ด:
- **เรขาคณิตหางระดับ** (`a_t`, `l_t`, `eta_t`, `deda`) อยู่ทั้งใน `interference.downwash` และ `controls.pitch` ค่า l_t 5.42 m, a_t 3.9 /rad และ η_t 0.9 ตรงกัน แต่ dε/dα ต่างกัน (0.40 ในหัวข้อ 2 และ 0.36 ในหัวข้อ 6) ทั้งสองเป็นค่าประมาณ ให้ใช้ค่าเดียวเมื่อทำหางเป็นชิ้นส่วนแยก (งานข้อ 31 ด้านล่าง) และตรวจซ้ำด้วย T-U-03/T-U-04 กับ T-C-05
- **ทิศการหมุนของใบพัด** (`interference.slipstream.sense` และ `propeller.identity.sense`) ตรงกัน (+1)
- **`aero.elevator_fade.a_t`** (10°) เป็นพารามิเตอร์คนละตัวกับ `a_t` ของหาง (คือช่วงมุมที่ประสิทธิผลของ elevator จางลง) อย่าสับสนเมื่อรวมไฟล์

## ผลวัดโมเดลปัจจุบัน

ตัวเลขทั้งหมดวัดด้วย Node จากโค้ดที่ commit `cabf0f0` (สคริปต์อยู่ใน `01-flight-physics/scripts/`)

| เรื่อง | ผลวัดของโมเดลปัจจุบัน | ค่าที่ควรเป็นหรือเกณฑ์ | หัวข้อ |
|---|---|---|---|
| ความถูกต้องของสมการการเคลื่อนที่ | ต่างจาก JSBSim ที่ใช้พารามิเตอร์เดียวกัน: h 4 mm, θ 0.014°, φ 0.039° ใน 25 s | ถูกต้อง | 12 |
| ความเสถียรของ RK4 240 Hz | \|λ\|Δt สูงสุด 0.25 ตอนจอด, 0.74 ตอนแตะพื้นแรง | < 2.785 | 9 |
| โหมดพลวัตที่ approach | SP ωn 2.22, ζ 0.58, CAP 0.95; phugoid ζ 0.115; DR ζ 0.139, ζωn 0.225; τR 0.22 s | Level 1 Class I Cat C ผ่านทุกข้อ | 10 |
| ระยะเตือน stall | 1.3 kt (แฟลปเก็บ), 0.6 kt (แฟลปลง) | ≥ 5 kt | 1 |
| CL หลัง CLmax | ลด 72–75% ภายใน 5° | ลดแบบนุ่มนวล (ต้นแบบที่เสนอ 28–32%) | 1 |
| Speed stability ในโหมด DIRECT | ดึงแล้วปล่อย ค้างที่ 80.5 kt (−15.3%) | กลับภายใน ±10% ของความเร็ว trim | 6 |
| Stick force per g | ไม่มีโมเดลแรง | 4.2–28 lbf/g (Level 1, centre stick); ต้นแบบได้ 8.9 lbf/g | 6 |
| แรงล้อตอนแตะพื้น 3 m/s | ΣN/W 3.39 ในเฟรมแรก | โช้ค oleo ที่เสนอ ≈ 1.9–2.0 ที่ ~60 ms | 7 |
| เบรกเต็มขณะจอด | ไหล 0.012 m/s | 0 (แรงเสียดทานสถิต) | 7, 9 |
| Cornering stiffness ของยาง | 9.3 /rad ที่ 5 m/s, 55.7 /rad ที่ 30 m/s | ≈ 3.2 /rad และไม่ขึ้นกับความเร็ว | 7 |
| ระยะหยุดจาก ~85 kt เบรกเต็ม | 332 m ทุกสภาพผิว | แตกต่างตาม RWYCC (แบบจำลองอ้างอิง: แห้ง 288 m, เปียก 477 m) | 7 |
| Induced drag ใน ground effect ที่ h/b 0.1 | เหลือ 72% | ≈ 51% (Tani, JSBSim c172p, Hoerner–Borst) | 2 |
| α̇ ที่ใช้ใน downwash lag | ช้ากว่าค่าจริง 46 ms คลาด 13% RMS | คำนวณแบบปิดรูปใน `deriv()` | 2 |
| แรงขับที่ flight idle ขณะร่อนลง | +379 N | ≤ 0 (ใบพัดที่มุมใบต่ำให้แรงต้าน) | 3, 10 |
| การเร่งเครื่องยนต์จาก idle | 65% ที่ 1 s, 95% ที่ 2.95 s | ≈ 14–19% ที่ 1 s และ 95% ภายใน 5 s (S-curve) | 4 |
| แรงขับตามความสูง | ROC ที่ 5,000 ft สูงกว่าที่ระดับน้ำทะเล (3,264 กับ 3,225 fpm) | ต้องลดตามความหนาแน่น | 4, 10 |
| แรงบิดปฏิกิริยาและ P-factor | 0 | แรงบิดเต็ม 3,342 N·m (26% ของโมเมนต์ aileron สูงสุดที่ 95 kt) | 3, 4 |
| ความปั่นป่วน | σw ถูก (0.715–0.721 m/s) แต่ autocorrelation ที่ ξ = Lw = 0.345 | Dryden ต้องได้ 0.184; ต้องมี p_g, q_g, r_g | 8 |
| ผลของ Δt ต่อการบินในความปั่นป่วน | ระยะแตะพื้นกระจาย 241–343 m | 240.3–240.8 m เมื่อเดินตัวกรองลมด้วยนาฬิกา 120 Hz ของตัวเอง | 9 |
| ความลื่นของภาพ | เฟรม 50% ได้ 1 หรือ 3 ก้าวแทน 2 ก้าวที่ 120 Hz, กระตุก 96–124 mm RMS | ไม่กระตุก (interpolate + ε-snap) | 9 |
| เวลาที่ใช้ต่อก้าว | `Flight.tick` 4.5–5.1 µs (≈ 0.12% ของหนึ่งคอร์ที่ 240 Hz) | เหลือที่ว่างมาก ไม่ต้องใช้ Web Worker | 9 |
| ความเร็ว ramp ของคีย์บอร์ด | pitch 2.0/s: กดค้าง 0.3 s ได้ +0.40 g | ≈ 0.5/s (+0.07 g) | 11 |
| ชุดทดสอบ | 0 assertion, CI รันแค่ geo กับ runways | node:test + assert ทุกไฟล์ใน CI | 10 |

## กรณีทดสอบ

| หัวข้อ | จำนวน | รหัส | ตัวอย่าง |
|---|---|---|---|
| [1. อากาศพลศาสตร์ α ±180° stall wing drop buffet spin](01-flight-physics/01-aero.md) | 15 | T-A-01 – T-A-15 | CLmax, α_CLmax, Vs 1-g · ความชันหลัง stall |
| [2. Downwash lag, ground effect, slipstream](01-flight-physics/02-interference.md) | 15 | T-U-01 – T-U-15 | สูตร α̇ derivative จากเรขาคณิต · ความแม่นของ α̇ |
| [3. ใบพัด](01-flight-physics/03-propeller.md) | 15 | T-P-01 – T-P-15 | แรงขับสถิต ISA จากตาราง · ผลของ ρ ต่อแรงขับสถิต |
| [4. เครื่องยนต์เทอร์โบพร็อปคลาส PT6A](01-flight-physics/04-turboprop.md) | 15 | T-E-01 – T-E-15 | Flat rating จำกัดด้วยแรงบิด · เกิน flat rating (วันร้อนสุดที่ VTBD) |
| [5. เครื่องยนต์เทอร์โบแฟน](01-flight-physics/05-turbofan.md) | 15 | T-F-01 – T-F-15 | แรงขับเต็มลดตามความสูง · ค่า `lapseBY` |
| [6. ระบบบังคับ](01-flight-physics/06-controls.md) | 15 | T-C-01 – T-C-15 | `air.nz` · ความเร็วกลับ trim เมื่อปล่อยคัน (DIRECT) |
| [7. ล้อและพื้น](01-flight-physics/07-gear.md) | 15 | T-G-01 – T-G-15 | สมดุลตอนจอด · ไม่ไหลตอนจอด |
| [8. ลม](01-flight-physics/08-wind.md) | 15 | T-W-01 – T-W-15 | ความเข้ม Dryden ระดับต่ำ · รูปสเปกตรัม w (autocorrelation) |
| [9. วิธีเชิงตัวเลข](01-flight-physics/09-numerics.md) | 15 | T-N-01 – T-N-15 | สมดุลขณะจอดไม่ขึ้นกับ Δt · หยุดนิ่งได้จริงและการเบรกจนหยุด |
| [10. การตรวจความสมจริง](01-flight-physics/10-validation.md) | 15 | T-V-01 – T-V-15 | trim สมดุลและการแยกบล็อกตามยาว/ด้านข้าง · short period, Cat C |
| [11. อินพุต](01-flight-physics/11-input.md) | 16 | T-I-01 – T-I-16 | ชุด dead zone + expo · Radial, axial, outer dead zone และ circle→square |
| [12. ซิมตัวอื่น](01-flight-physics/12-other-sims.md) | 13 | T-S-01 – T-S-13 | EOM และแกนตรงกับ JSBSim (ออฟไลน์, Python) · ทดสอบ Node กับ fixture จาก JSBSim (ไม่มี dependency) |
| **รวม** | **179** | | |

หลักการที่ทุกหัวข้อใช้: ผลคาดหวังที่มาจากสมการถูกคำนวณด้วย Node จริง (สคริปต์อยู่ใน `scripts/`) และระบุ tolerance เสมอ ผลคาดหวังที่เป็นเกณฑ์ (เช่น MIL-F-8785C, 14 CFR 33.73) อ้างเอกสารปฐมภูมิ คอลัมน์ "โมเดลปัจจุบัน" ในแต่ละไฟล์แสดงผลที่รันได้วันนี้ จึงเห็นได้ว่ากรณีไหนจะผ่านทันทีและกรณีไหนรอฟีเจอร์ใหม่ ควรเปลี่ยนชุดทดสอบเดิมให้มี assertion และใช้ `node:test` ซึ่งมากับ Node อยู่แล้วโดยไม่ต้องเพิ่ม dependency

## ความขัดแย้งของแหล่งข้อมูลและข้อจำกัดที่ยังค้าง

ความขัดแย้งรายข้ออยู่ในหัวข้อย่อย "ความขัดแย้งของแหล่งข้อมูลและข้อจำกัด" ของแต่ละไฟล์ ที่สำคัญต่อการตัดสินใจมีดังนี้
- **ข้อมูลบินจริงของเครื่องฝึกเทอร์โบพร็อปที่เปิดสาธารณะหาไม่พบ** ค่าอากาศพลศาสตร์ ระบบบังคับ และล้อของเครื่องฝึกจึงเป็นค่าประมาณเกือบทั้งหมด (ดูคอลัมน์ "ค่าประมาณ" ใน schema) รอบที่ 2 ควรหาค่าอ้างอิงจากเอกสารสาธารณะของเครื่องคลาสเดียวกันมาตรวจ
- **Part 23 ฉบับปัจจุบัน (หลังเขียนใหม่ปี 2017) ไม่มีตัวเลขแล้ว** เกณฑ์เช่นระยะเตือน stall ≥ 5 kt, drop test ของล้อ และแรงที่คันบังคับ ใช้ฉบับปี 2016 เป็นเป้าทางวิศวกรรม ไม่ใช่เกณฑ์รับรองปัจจุบัน ส่วนมาตรฐาน ASTM ที่ใช้แทนต้องซื้อ
- **Cornering stiffness ของยาง** NACA TN 4110 ให้ราว 3.2 /rad แต่ค่าเริ่มต้น Magic Formula ของ JSBSim ให้ 7.7 /rad (ต่างกัน 2.4 เท่า) หัวข้อ 7 เลือกค่าของ NASA ความเชื่อมั่นต่ำถึงกลาง
- **RWYCC 1** FAA AC 25-32 ใช้ μ 0.08 แต่ EASA ใช้ 0.07 และคำเรียกรหัส 0 ต่างกัน (ICAO "LESS THAN POOR", FAA "Nil") UI ควรใช้คำของ ICAO ตามที่ กพท. ใช้
- **Hot-day lapse ของ PT6A** ความชันที่ได้จากคู่รุ่นต่างกันเกือบ 2 เท่า (−0.5 กับ −1.0 %/°C) แต่ที่ 38 °C ต่างกันไม่ถึง 4 kW
- **Spool-down ของเทอร์โบพร็อป** JSBSim ตั้งให้ลดช้ากว่าเร่ง แต่ไม่พบข้อมูลวัดของ PT6A ที่เปิดเผยมายืนยันทั้งสองแบบ
- **dε/dα ของหาง** หัวข้อ 2 ใช้ 0.40 หัวข้อ 6 ใช้ 0.36 (ทั้งคู่เป็นค่าประมาณ) ต้องรวมเป็นค่าเดียวตอน implement
- **ICAO Doc 9625 และ PANS-ATM เป็นเอกสารมีลิขสิทธิ์** รายงานจึงสรุปเฉพาะโครงสร้าง ส่วน tolerance ใช้ 14 CFR Part 60 ซึ่งเป็นสาธารณสมบัติ
- **Developed spin** ไม่มีข้อมูลสาธารณะของเครื่องประเภทนี้มากพอ งาน spin จึงเป็น P3 ความเชื่อมั่นต่ำ

## แหล่งอ้างอิงและสัญญาอนุญาต

รายการแหล่งอ้างอิงเต็ม (พร้อมลิงก์ ประเภท และสิ่งที่ AirfieldLab ทำได้) อยู่ท้ายไฟล์หัวข้อแต่ละไฟล์ รวม 301 รายการ ตารางนี้สรุปตามกลุ่มแหล่ง

| กลุ่มแหล่ง | จำนวน | ตัวอย่างรหัส | สถานะสิทธิ์ | AirfieldLab ทำอะไรได้ |
|---|---|---|---|---|
| งานของรัฐบาลสหรัฐฯ: 14 CFR, FAA AC และคู่มือ, NASA/NACA (NTRS), NOAA/NWS, EPA | 112 | A6, A8, A9, A15 | ไม่มีลิขสิทธิ์ในสหรัฐฯ (17 U.S.C. §105) NTRS ระบุ "Public Use Permitted" | ใช้สมการ ตัวเลข และตารางได้ อ้างแหล่งทุกครั้ง บทความที่ NASA เขียนร่วมกับเอกชนให้ดูบรรทัดอ้างอิง |
| มาตรฐานและรายงานทางทหารของสหรัฐฯ (MIL-F-8785C, MIL-HDBK-1797, รายงาน DTIC) | 8 | A5, E14, C12, C13 | "Approved for public release; distribution unlimited" | ใช้เกณฑ์และสมการได้เหมือนงานรัฐบาล ใช้เป็นเกณฑ์ทั่วไปเท่านั้น ไม่อ้างหน่วยหรือเครื่องบินทหาร |
| EASA (TCDS, CS, ETSO) | 14 | P3, P4, E1, E2 | © EASA สงวนสิทธิ์ TCDS ระบุ "Proprietary document" | อ้างตัวเลขที่เป็นข้อเท็จจริงพร้อมลิงก์ได้ ห้ามคัดลอกเอกสาร |
| ICAO (Doc 9625, PANS, Annex) | 3 | F9, G16, V4 | ลิขสิทธิ์ ICAO | สรุปโครงสร้างด้วยคำของเราเท่านั้น ห้ามคัดลอกตารางหรือข้อความ |
| กพท. (AIP Thailand, AIC) | 4 | G17, W28, W29, W30 | ลิขสิทธิ์ กพท. | อ้างข้อเท็จจริงของสนามและกฎ (เช่น GRF) ได้เหมือนที่ repo ทำอยู่ |
| โค้ด LGPL: JSBSim, OpenAP | 29 | A2, U4, U5, U6 | LGPL-2.1-or-later (JSBSim), LGPL-3.0 (OpenAP) | อ้างสมการและค่าคงที่ แล้วเขียนโค้ดใหม่เองได้ ถ้าคัดลอกโค้ดหรือไฟล์ข้อมูลต้องทำตาม LGPL ไฟล์ aircraft XML บางไฟล์ของ JSBSim เป็น GPL |
| โค้ด GPL/AGPL: FlightGear, YASim, AVL, Aeromatic, ไดรเวอร์ Linux | 19 | A3, A4, A7, P13 | GPL-2.0-or-later, AGPL-3.0 | อ้างแนวคิดและตัวเลขได้ ห้ามคัดลอกโค้ดเข้า repo เว้นแต่ repo จะเป็น GPL ใช้เป็นเครื่องมือ offline ได้ |
| โค้ดและข้อมูลแบบ permissive: three.js, CCBlade.jl, AirfoilPreppy, browser-compat-data, ml-matrix | 7 | A10, P10, N15, N22 | MIT, Apache-2.0, CC0 | คัดลอกได้ถ้าคงประกาศลิขสิทธิ์ (CC0 ไม่ต้อง) ส่วน ml-matrix ใช้เฉพาะใน scripts/ |
| ข้อกำหนดและเอกสารเว็บ: W3C, WICG, MDN, web.dev, Chromium, ECMA-262 | 23 | A29, C28, N9, N10 | W3C Document License, MDN ข้อความ CC BY-SA 2.5 และโค้ดตัวอย่าง CC0, web.dev CC BY 4.0 | อ้างได้ทั้งหมด ข้อความจาก MDN ถ้าคัดลอกต้องให้เครดิตและใช้ CC BY-SA |
| บทความวิชาการ วิทยานิพนธ์ และตำรา (AIAA, ASME, Elsevier, ICAS ฯลฯ) | 32 | A11, A12, A13, A14 | ลิขสิทธิ์ผู้จัดพิมพ์หรือผู้เขียน | ใช้สมการและตัวเลขที่เป็นข้อเท็จจริงพร้อมอ้างอิง ห้ามคัดลอกข้อความ รูป หรือตาราง |
| องค์กรมาตรฐาน: ASTM, USB-IF, WMO, EUROCONTROL | 6 | A25, F27, C11, W25 | ลิขสิทธิ์ ASTM ต้องซื้อ BADA ต้องทำสัญญา | อ้างเฉพาะส่วนที่เปิดสาธารณะ ห้ามใส่สัมประสิทธิ์ BADA ใน repo |
| เอกสารของผู้ผลิตและซิมเชิงพาณิชย์: X-Plane, MSFS, GeoFS, MathWorks, Goodyear, ผู้ผลิตอุปกรณ์ควบคุม | 26 | G18, W1, W2, W3 | proprietary | อ้างข้อเท็จจริงและลิงก์ได้ ห้ามคัดลอกเนื้อหาหรือข้อมูลโมเดล |
| อื่น ๆ: รายงานสอบสวนอุบัติเหตุ (BEA), Wikipedia, บล็อก, กระดานสนทนา, usb.ids | 6 | C27, W17, N8, N14, I11, I26 | แล้วแต่แหล่ง: Wikipedia เป็น CC BY-SA 4.0, บล็อกและกระทู้เป็นลิขสิทธิ์ผู้เขียน, usb.ids เป็น GPL-2.0 หรือ BSD-3 | ใช้เป็นแหล่งรองหรือชี้ทางเท่านั้น ยืนยันกับแหล่งปฐมภูมิก่อนใช้ค่า |
| ภายในโครงการ: โค้ด AirfieldLab, สคริปต์คำนวณ, การอ้างข้ามหัวข้อ | 12 | A1, U1, U16, U17 | ของเจ้าของ (repo ยังไม่มี LICENSE) | ไม่มีข้อจำกัด |

จัดกลุ่มอัตโนมัติจากข้อความในบรรทัดอ้างอิง (สคริปต์ `scripts/integ_refs.mjs`) จำนวนในแต่ละกลุ่มจึงคลาดได้เล็กน้อย สถานะสิทธิ์ของแต่ละแหล่งให้ยึดบรรทัดอ้างอิงในไฟล์หัวข้อเป็นหลัก

**ข้อควรทำเรื่องสัญญาอนุญาต:** repo ยังไม่มีไฟล์ LICENSE แม้เป็น repo สาธารณะ ซึ่งตามกฎหมายแปลว่าผู้อื่นไม่มีสิทธิ์นำไปใช้ เจ้าของควรเลือกสัญญาอนุญาตก่อนรับโค้ดหรือข้อมูลจากภายนอก การเลือกนี้มีผลต่อสิ่งที่นำเข้ามาได้ เช่น ถ้าเลือก MIT ก็จะคัดลอกโค้ด GPL/LGPL เข้ามาไม่ได้ ไม่ว่ากรณีใด ไม่ควรคัดลอกโค้ดของ JSBSim (LGPL-2.1) หรือ FlightGear/YASim (GPL-2.0) และไฟล์ XML เครื่องบินของ JSBSim (หลายไฟล์เป็น GPL หรือไม่ระบุ) เข้ามาใน `src/` หรือ `data/` ให้เขียนสูตรใหม่จากเอกสาร และใช้ JSBSim เป็น oracle แบบออฟไลน์ผ่าน `pip install jsbsim` เท่านั้น (หัวข้อ 12 เสนอ `test/license-guard.test.mjs` ไว้กันพลาด)

## สิ่งที่ Claude Code ควรทำ

ตามที่เจ้าของกำหนด ยังไม่แก้โค้ดฟิสิกส์ในขั้นนี้ รายการนี้คือข้อมูลตั้งต้นของแผนงานรวมหลังครบ 5 รอบ ซึ่งต้องได้รับอนุมัติก่อนลงมือ เมื่อลงมือแล้ว งานที่เปลี่ยน flight model ให้ทำบน branch และเปิด PR ทีละเรื่องเพื่อให้เจ้าของลองก่อน merge ตาม CLAUDE.md ทุก PR ต้องให้ autoland เดิมได้คะแนนในช่วงเดิม และต้องผ่านชุดทดสอบโหมดพลวัตที่ล็อกไว้ในข้อ 3

ลำดับเรียงตามคุณค่าต่อการฝึกลงจอดและตามลำดับที่งานต้องพึ่งกัน รหัส P1/P2/P3 และขนาดงาน S/M/L มาจากไฟล์หัวข้อ

**ระยะ 0: แก้บั๊กและวางฐานการทดสอบ (ไม่เปลี่ยนฟิสิกส์)**
1. **P1 · S** แก้ keymap: เอา Ctrl/Meta/Alt ออก ย้ายคันเร่งไปที่ `=`/`−` และ PageUp/PageDown ไม่ตีความคีย์การบินเมื่อมีตัวปรับกดอยู่ เช็ก `e.repeat` สำหรับ C/T/P/R และล้างคีย์เมื่อแท็บถูกซ่อน — [11](01-flight-physics/11-input.md) · T-I-07, T-I-08
2. **P1 · S** เปลี่ยน `test/flight`, `stall`, `assist` ให้มี assertion ด้วย `node:test` เพิ่ม `node --test` ใน `.github/workflows/pages.yml` และ export `eulerToQ`, `qToR`, `qToEuler`, `Wind` จาก `test/harness.mjs` — [10](01-flight-physics/10-validation.md), [9](01-flight-physics/09-numerics.md) · T-V-01, T-V-11
3. **P1 · S** ล็อกโหมดพลวัตปัจจุบันด้วย `test/lib/fstd.mjs` + `test/modes.test.mjs` (trim, linearise, eigen, ระดับ Level) ก่อนเริ่มเปลี่ยนฟิสิกส์ — [10](01-flight-physics/10-validation.md) · T-V-01…T-V-06
4. **P1 · S** `test/license-guard.test.mjs` และให้เจ้าของเลือก LICENSE — [12](01-flight-physics/12-other-sims.md) · T-S-11
5. **P1 · S** คำนวณ `air.nz` ใน `updateAir()` — [6](01-flight-physics/06-controls.md) · T-C-01
6. **P1 · S** แก้ตัวสะสมเวลา (ε, `maxSteps = ceil(0.1/dt)`, ทิ้ง backlog) และหยุดอัตโนมัติด้วย `visibilitychange` (ข้อความไทย) — [9](01-flight-physics/09-numerics.md) · T-N-07, T-N-08
7. **P1 · M** Interpolate สถานะตอนเรนเดอร์ (`Flight.renderPose()`, lerp ตำแหน่ง, slerp quaternion) — [9](01-flight-physics/09-numerics.md) · T-N-09

**ระยะ 1: โครงสร้างข้อมูลและเครื่องมือตรวจ**

8. **P1 · M** ย้าย `AC` ไปเป็น `data/aircraft/trainer.json` ตาม schema ของรอบนี้ เพิ่มฟังก์ชันอ่านตาราง 1D/2D แบบตัดค่าขอบ และ `AC.engines[]` ที่มีตำแหน่งและทิศแรงขับ (เครื่องฝึกมีเครื่องเดียว ผลต้องเท่าเดิม) — [12](01-flight-physics/12-other-sims.md), [5](01-flight-physics/05-turbofan.md) · T-S-07, T-S-12, T-F-15
9. **P1 · M** Oracle JSBSim ออฟไลน์: `tools/jsbsim/` สร้าง XML จากข้อมูลของเรา รันด้วย `pip install jsbsim==1.3.3` แล้วเก็บผลเป็น fixture ให้ `test/oracle.test.mjs` แบบ Node ล้วน — [12](01-flight-physics/12-other-sims.md) · T-S-01…T-S-05
10. **P1 · M** ชั้นอินพุต `src/25-input.js` ที่ไม่ผูก DOM (calibration → invert → scaled dead zone → expo → gain), ramp คีย์บอร์ดใหม่ (pitch 0.5/2.5 ต่อวินาที, roll 1.0/3.0, rudder 1.0/2.0), Shift เป็นโหมดละเอียด และอ่าน Gamepad API ทุกเฟรมด้วยผัง Standard — [11](01-flight-physics/11-input.md) · T-I-01…T-I-06, T-I-09…T-I-12
11. **P2 · S** Trim เชิงตัวเลขแบบ Newton แทนสูตรใน `setApproach` เพื่อรองรับตารางและใบพัด — [12](01-flight-physics/12-other-sims.md) · T-S-04, T-S-06

**ระยะ 2: ฟิสิกส์หลักที่กระทบการฝึกลงจอดมากที่สุด (PR แยกทีละเรื่อง)**

12. **P1 · S** สัญญาณเตือน stall ตาม α ให้ระยะเผื่อ ≥ 5 kt ทั้งใน `Evaluator` และ HUD พร้อมเสียง — [1](01-flight-physics/01-aero.md) · T-A-07
13. **P1 · S** เอา auto-trim `trimDe += 0.25·q·dt` ออกจาก DIRECT แทนด้วยสถานะ trim ที่ปรับด้วยปุ่ม — [6](01-flight-physics/06-controls.md) · T-C-02
14. **P1 · M** `ControlAxis` แบบสั่งแรง (force-command) สำหรับ pitch พร้อม breakout, trim tab ที่ปรับด้วยปุ่มตามอัตราที่ขึ้นกับแฟลป และ auto-trim บนแรงเสมือนเฉพาะใน ASSIST — [6](01-flight-physics/06-controls.md) · T-C-03…T-C-11
15. **P1 · M** ล้อชุดแรก: โช้ค oleo แบบอนุกรมที่มี stroke เป็นสถานะ, แรงเสียดทานสถิตแบบ bristle, ยางด้านข้างแบบมุม slip + relaxation + วงกลมแรงเสียดทาน — [7](01-flight-physics/07-gear.md), [9](01-flight-physics/09-numerics.md) · T-G-01…T-G-06, T-G-11…T-G-13, T-N-02…T-N-05
16. **P1 · S** μ(V, RWYCC) ตาม 14 CFR 25.109(c)/(d) และ AC 25-32 พร้อม hydroplaning 9√p — [7](01-flight-physics/07-gear.md) · T-G-08, T-G-09
17. **P1 · S** α̇ แบบปิดรูปใน `deriv()` — [2](01-flight-physics/02-interference.md), [10](01-flight-physics/10-validation.md) · T-U-01, T-U-02
18. **P1 · M** Ground effect แบบ Tani (induced drag, แรงยก, downwash ที่หาง) วัดความสูงที่ MAC ซ้ายและขวา แล้วจูน flare ของ autopilot ใหม่ — [2](01-flight-physics/02-interference.md) · T-U-05…T-U-09
19. **P1 · M** ความปั่นป่วน Dryden 8785C แบบ exact discretization (u อันดับ 1, v/w อันดับ 2) วางแกนตามลมเฉลี่ย เพิ่ม p_g, q_g, r_g ให้ตัวกรองลมเดินด้วยนาฬิกา 120 Hz และ RNG แยกของตัวเอง และเปลี่ยนโปรไฟล์ลมเป็น log law ที่ปรับ z0 ได้ — [8](01-flight-physics/08-wind.md), [9](01-flight-physics/09-numerics.md) · T-W-01…T-W-08, T-N-06, T-N-10
20. **P1 · M** ระบบขับเคลื่อน: `Turboprop` (Ng, ITT, แรงบิด, flat rating, S-curve) + `Propeller` (ตาราง CT/CP จาก `tools/prop-bem.mjs`, governor, flight idle ที่ให้แรงต้าน) + แรงบิดปฏิกิริยาและ gyroscopic ใน `deriv()` — [3](01-flight-physics/03-propeller.md), [4](01-flight-physics/04-turboprop.md) · T-P-01…T-P-11, T-E-01…T-E-08, T-E-12…T-E-15
21. **P1 · M** Slipstream: q̄ ที่หางระดับและหางดิ่งจากแรงขับ ให้มีแรงบังคับเมื่อ V → 0 — [2](01-flight-physics/02-interference.md) · T-U-10…T-U-12
22. **P1 · M** แก้อากาศพลศาสตร์ช่วงกว้าง: ความเป็นคาบของ α และ β, กิ่งแยกตัวแบบ Viterna ผสมด้วย X0 แทน `stallBlend` + flat plate, ตัวคูณประสิทธิผล elevator E(α) — [1](01-flight-physics/01-aero.md) · T-A-01…T-A-06, T-A-08
23. **P1 · M** ชุดทดสอบสมรรถนะ (stall 1 kt/s, climb, glide, ระยะวิ่งขึ้นและลงจอด 50 ft) พร้อม `data/ref/trainer.json` ทำหลังข้อ 20 — [10](01-flight-physics/10-validation.md) · T-V-11…T-V-15

**ระยะ 3: ความสมจริงเพิ่มเติม (P2)**

24. **P2 · M** P-factor แรงตั้งฉากของใบพัด และ swirl ที่หางดิ่ง (หลังข้อ 20–21) แล้วตรวจว่า auto-rudder ของ ASSIST ยังคุมทิศได้ — [3](01-flight-physics/03-propeller.md), [2](01-flight-physics/02-interference.md) · T-P-12, T-P-13, T-U-13
25. **P2 · M** เบรกซ้าย/ขวา ตรรกะล้อล็อก ล้อหน้าเลี้ยวด้วยแป้น ±12° + caster ±45° spin-up ของล้อ เกณฑ์ bounce/hard landing และ UI ภาษาไทยเลือกสภาพทางวิ่ง — [7](01-flight-physics/07-gear.md) · T-G-07, T-G-10, T-G-14, T-G-15
26. **P2 · L** ปีกแบบ strip 8 แผงต่อข้าง สถานะ X แบบ Goman–Khrabrov และ buffet ที่ส่งเป็นกล้องสั่น เสียง และ rumble — [1](01-flight-physics/01-aero.md), [11](01-flight-physics/11-input.md) · T-A-09…T-A-14, T-I-14
27. **P2 · M** Wizard ผูกอุปกรณ์ (HOTAS, pedals + toe brakes, yoke) เก็บใน `localStorage`, คีย์ trim/แฟลป/ล้อ/เบรกแยก และปรับจอสัมผัส — [11](01-flight-physics/11-input.md) · T-I-03, T-I-04, T-I-10, T-I-11, T-I-15
28. **P2 · M** Gust แบบ 1-cosine, microburst Oseguera–Bowles, F-factor และคำเตือน WINDSHEAR พร้อม debrief — [8](01-flight-physics/08-wind.md) · T-W-09…T-W-14
29. **P2 · M** หน้าจอเครื่องยนต์ภาษาไทย (TRQ/ITT/Ng/Np), condition lever, ตัวเลือก limiter และเหตุการณ์ overtorque/overtemp — [4](01-flight-physics/04-turboprop.md) · T-E-09…T-E-11
30. **P2 · M** ทดสอบ handling qualities แบบโดเมนเวลา (pulse, doublet, spiral, roll step), ตัวหา eigen ของเมทริกซ์เต็ม และบันทึกอินพุตเพื่อเล่นซ้ำแบบ deterministic — [10](01-flight-physics/10-validation.md), [9](01-flight-physics/09-numerics.md) · T-V-07…T-V-10, T-N-12
31. **P2 · L** ทำหางเป็นชิ้นส่วนแยก (downwash แบบหน่วงเวลา, ground effect ที่หาง, slipstream และ swirl ในสมการเดียว) และรวม dε/dα ของหัวข้อ 2 กับ 6 เป็นค่าเดียว — [2](01-flight-physics/02-interference.md), [6](01-flight-physics/06-controls.md) · T-U-03, T-U-04, T-U-14

**ระยะ 4: เตรียมเครื่องบินโดยสารและงานเสริม (P2–P3)**

32. **P2 · M** `TurbofanEngine` (N2, accel schedule, idle สามระดับ), thrust lapse ของ Bartel & Young และ reverser แบบ state machine ทำก่อนเพิ่มเครื่องบินโดยสารจากรอบ 3 — [5](01-flight-physics/05-turbofan.md) · T-F-01…T-F-14
33. **P3 · M** รูปแบบระบบบังคับ `kind: 'feel'` (737) และ `kind: 'fbw'` (A320) ให้รอบ 3 เติมค่า — [6](01-flight-physics/06-controls.md)
34. **P3 · L** Wake vortex จากเครื่องนำ (A320/737-800) และฉากฝึกตามหลังเครื่องบินโดยสาร — [8](01-flight-physics/08-wind.md) · T-W-15
35. **P3 · L** Developed spin และฉากฝึกการกู้ spin (ป้าย "ค่าประมาณ") — [1](01-flight-physics/01-aero.md) · T-A-15
36. **P3 · M** ตัวเลือก von Kármán และความปั่นป่วนระดับกลาง/สูงสำหรับเครื่องบินโดยสาร — [8](01-flight-physics/08-wind.md)
37. **ยังไม่ทำ:** JSBSim-WASM ในหน้าเว็บจริง (ภาระ LGPL และยังไม่มี LICENSE) และ force feedback ผ่าน WebHID — [12](01-flight-physics/12-other-sims.md), [11](01-flight-physics/11-input.md)
