# 4. เครื่องยนต์เทอร์โบพร็อปคลาส PT6A

← [กลับไปหน้ารวมรอบที่ 1](../01-flight-physics.md) · [schema พารามิเตอร์](schema.md)

> ความเชื่อมั่นโดยรวม: กลาง · แหล่งหลัก: EASA TCDS IM.E.078 (PT6A-41/-60 series รวม PT6A-62) [E1], EASA TCDS IM.E.038 (PT6A-68 series) [E3], 14 CFR 33.73 [E4], JSBSim `FGTurboProp` [E7]

## 4.0 สรุปสั้น
- **ที่ VTBD เครื่องยนต์คลาสนี้ไม่เสียกำลังจากความร้อนอย่างที่หลายคนคิด** TCDS ของ PT6A-62 ระบุกำลัง take-off = MCP = 708 kW และ flat rate ถึง 37 °C [E1] ดังนั้นที่ OAT 31–37 °C (ISA+16 ถึง +22) เครื่องยังให้กำลังเพลาเต็ม (จำกัดด้วยแรงบิด) แต่ระยะห่างจาก ITT ลดลงเรื่อย ๆ จนถึง 800 °C ที่มุม flat rating พอเกิน 37 °C กำลังจะถูก ITT จำกัด ที่ 38 °C จะเหลือ 692–696 kW สำหรับเครื่อง 700 kW ของเรา (ค่าประมาณ, −0.5 ถึง −1.0 %/°C) แรงขับที่ลดลงในวันร้อนเป็นผลของความหนาแน่นต่อใบพัดและปีก ไม่ใช่กำลังเครื่องยนต์ (ส่วนนั้นอยู่ในหัวข้อใบพัด)
- **การตอบสนองต้องเป็นรูปตัว S ไม่ใช่ lag อันดับหนึ่งบนแรงขับ** 14 CFR 33.73(b) กำหนดว่าจาก flight idle ต้องได้ 95% ของกำลัง take-off ภายใน 5 วินาที [E4] FAA ระบุว่ากำลังของ free turbine "lags for several seconds" เมื่อดันคันโยกจาก flight idle [E6] โมเดลที่เสนอ (Ng แบบ rate limit + lag แล้วแปลงเป็นกำลังผ่านแผนที่ชันแบบ x^2.7) ได้ 95% ใน 3.7–4.1 s และได้แค่ 14–19% ที่ 1 s ที่ OAT 15–38 °C (ค่าประมาณจากโมเดล) ขณะที่โค้ดปัจจุบันได้ 65% ที่ 1 s
- **สิ่งที่ต้องสร้าง:** คลาส `Turboprop` ที่ไม่ใช้ DOM ใน `src/20-flight.js` มีสถานะ Ng, ITT, P, Q ใช้พารามิเตอร์แก้ (corrected) δ, θ มีขีดจำกัด 3 ตัว (แรงบิด / ITT / Ng) และตัวเลือกจำลองแบบ limiter อัตโนมัติหรือไม่มี limiter ส่งออก P และ Q ให้หัวข้อใบพัด และส่งแรงบิดปฏิกิริยา −Q เข้าโมเมนต์ม้วนของโครงเครื่องบิน
- **สิ่งที่โค้ดปัจจุบันผิดหรือขาด:** (1) `thrustAvail(V)` ไม่ขึ้นกับความหนาแน่นหรืออุณหภูมิเลย จึงไม่มี lapse ตามความสูงและไม่มีขีดจำกัด ITT (2) lag 1 s ใส่บนแรงขับและสมมาตรทั้งเร่งและลด (3) ไม่มี Ng / ITT / torque / flight idle / ground idle / beta (4) ไม่มีแรงบิดปฏิกิริยาต่อโครงเครื่องบินเลย ทั้งที่แรงบิดเต็มที่ 3,342 N·m เท่ากับ 26% ของโมเมนต์ม้วนสูงสุดที่เอเลอรอนสร้างได้ที่ 95 kt และ 48% ที่ 70 kt (TAS, ρ ที่ 31 °C, δa สุด 20°, `AC.Clda` = 0.16/rad; คำนวณใน `e4_current.mjs`)
- **ความเสี่ยงในการรวมระบบต่ำ:** เมื่อใส่โมเดลเครื่องยนต์เข้าไปในลูปแบบ "power-demand lever" ผล autoland ทั้ง 4 สถานการณ์ได้คะแนนเท่าเดิมทุกกรณี (100/96/97/88)

## 4.1 สภาพปัจจุบันใน AirfieldLab
**สิ่งที่โค้ดทำอยู่**
- `src/20-flight.js:110` เก็บแค่ `P: 700e3, eta: 0.80, T0: 11500, idle: 0.045` ไม่มีพารามิเตอร์ของเครื่องยนต์อื่น
- `src/20-flight.js:144` คำนวณ `thrustAvail(V) = T0·Vc/√(V²+Vc²)` โดย `Vc = η·P/T0 = 48.7 m/s` ฟังก์ชันนี้ไม่รับ ρ, T หรือความสูง
- `src/20-flight.js:197` คำนวณ `T = this.thr * thrustAvail(V)` ทำให้ `thr` มีความหมายเป็น "สัดส่วนแรงขับ" ไม่ใช่คันโยกกำลัง แล้ว HUD ก็แสดงค่านี้เป็น `THR xx%` (`src/90-app.js:366`, `:583`)
- `src/20-flight.js:198–199` ใส่แรงขับตามแกน x ของลำตัวผ่าน CG ส่วน `Mb` มีแค่โมเมนต์อากาศพลศาสตร์ **ไม่มีแรงบิดเครื่องยนต์และไม่มีผล gyroscopic**
- `src/20-flight.js:248` ใช้ lag อันดับหนึ่ง τ = 1 s แบบสมมาตร บน `thr` และไม่ยอมให้ต่ำกว่า `AC.idle = 0.045`
- ออโต้ไพลอตและ PilotLaws ส่งคำสั่ง `c.thr` (`:405`, `:407`, `:459–461`) และค่อย ๆ ลดเป็น 0 ใน flare (`:407`, `:460`) แต่ตัวขับเร้าจะหยุดที่ idle 0.045 ซึ่งยังเป็นแรงขับบวก ไม่มี beta หรือ reverse
- คีย์บอร์ดเพิ่มหรือลด `thr` ด้วยอัตรา 0.35/s (`src/90-app.js:364`) และ `Flight` ตั้ง `isaDev` จาก `oatC` ซึ่งค่าเริ่มต้นคือ 31 °C (`src/20-flight.js:587`) แต่ค่านี้มีผลแค่ต่ออากาศพลศาสตร์

**ผลวัดด้วย Node** (สคริปต์ `scripts/e4_current.mjs`)

| รายการ | ผลวัด | ความหมาย |
|---|---|---|
| แรงขับ static เต็มที่ ที่ OAT 15 / 31 / 38 °C | 11,500 / 11,500 / 11,500 N (ρ = 1.2245 / 1.160 / 1.134) | ไม่มีผลของความหนาแน่นหรือ ITT |
| ขั้นบันได idle→เต็ม: เวลาถึง 50 / 90 / 95% ของแรงขับ | 0.65 / 2.26 / 2.95 s | เร็วตั้งแต่ต้น ไม่มีช่วงหน่วงจาก Ng ต่ำ |
| ขั้นบันได เต็ม→idle: เวลาลงถึง 50 / 10% | 0.74 / 2.86 s | สมมาตรกับการเร่ง |
| แรงขับ idle ที่ 95 kt แฟลปลง ล้อลง | +357 N (แรงขับเป็นบวก) | ใบพัดที่ flight idle ควรให้แรงขับใกล้ศูนย์หรือติดลบ (ส่งต่อหัวข้อใบพัด) |
| "กำลัง" ที่ทำให้เกิดแรงขับเต็มที่ T·V/η | 375 / 496 / 592 / 633 kW ที่ 60 / 95 / 150 / 200 kt | ไม่มีตัวแปรกำลังเพลาจริง |
| แรงบิดเพลาเต็มที่ Q = P/ω ที่ 2000 rpm | 3,342 N·m (2,465 lb-ft) ซึ่งเท่ากับ 0.48 / 0.26 / 0.14 เท่าของโมเมนต์เอเลอรอนสุด $\bar q S b\,C_{l\delta a}\,\delta_{a,max}$ ที่ 70 / 95 / 130 kt (TAS, ρ = 1.160 kg/m³ ที่ 31 °C, δa,max = 20°) | ตอนนี้ไม่ได้ใส่ในโมเดลเลย |

## 4.2 สถาปัตยกรรม free turbine และตัวแปรที่เครื่องจำลองต้องมี
**ฟิสิกส์โดยสรุป** PT6A เป็นเครื่องยนต์แบบ free (split-shaft) turbine ส่วน gas generator ประกอบด้วยคอมเพรสเซอร์ ห้องเผาไหม้ และ compressor turbine (CT) ซึ่งหมุนอยู่บนเพลาหนึ่ง ส่วน power turbine (PT) อยู่อีกเพลาหนึ่งและขับใบพัดผ่านเฟืองทดรอบ FAA อธิบายว่า "The propeller is not on the same shaft as the basic engine turbine and compressor" และ "A typical free power-turbine engine has two independent counter-rotating turbines" [E6, น. 15-5] ผลที่ตามมาคือ
1. **Ng (N1)** คือความเร็วรอบ gas generator คิดเป็นเปอร์เซ็นต์ ("The N1 or gas generator is read in percent of rpm" [E6, น. 15-8]) สำหรับ PT6A-41/-60/-68 100% Ng = 37,468 rpm และขีดสูงสุดคือ 39,000 rpm ≈ 104% [E1, E3] ค่านี้เป็นตัวกำหนดการไหลของอากาศและกำลังที่ผลิต
2. **Np (N2)** คือความเร็วใบพัดหรือ power turbine ซึ่ง governor คุมให้คงที่ ("The propeller governor selects the propeller pitch needed to keep the propeller/engine on speed" [E6, น. 15-9]) สำหรับ PT6A-62 ค่า 2,000 rpm ใบพัดตรงกับ 30,145 rpm ของ PT ทำให้อัตราทดเฟืองประมาณ 15.07:1 (ค่าประมาณ: คำนวณเองจาก 30,145/2,000) [E1]
3. **แรงบิด (torque)** วัดที่เพลาใบพัด หน้าปัดเป็น ft-lb ("gives an indication in foot-pounds" [E6, น. 15-8]) และ P = Q·ω
4. **ITT** คืออุณหภูมิระหว่าง CT กับ PT ("Interstage Turbine Temperature" ใน TCDS [E1]) ขีดของ PT6A-62 คือ 800 °C ในโหมด take-off/MCP และ 1,000 °C ตอนสตาร์ต [E1]
5. **อัตราการไหลของเชื้อเพลิง (FF)** เป็นผลพลอยได้ ใช้แสดงผลและคิดน้ำหนัก

**คันบังคับ** FAA อธิบายว่าบน free turbine "The power lever serves to control engine power in the range from idle through takeoff power" และ "the condition lever on a turboprop engine is really just an on/off valve for delivering fuel" ซึ่งมีตำแหน่ง "HIGH IDLE and LOW IDLE positions for ground operations" [E6, น. 15-6] ส่วนคันใบพัด (propeller lever) ใช้ตั้ง Np ให้ governor เครื่องฝึกเทอร์โบพร็อปบางแบบใช้คันเดียว (single-lever) ที่ตั้ง Np ให้อัตโนมัติ งานของ Šplíchal และคณะ (CC BY 4.0) บันทึกว่าเครื่องเทอร์โบพร็อปเครื่องยนต์เดียวขนาดเล็กที่ศึกษาใช้ระบบคันบังคับเดียว (single-lever control) ซึ่งใบพัดหมุนด้วยความเร็วคงที่ [E13] (ถอดความ ไม่ใช่คำพูดตรง: การทบทวนพบว่าวลี "constant-speed propeller with single-lever control" ที่เคยอ้างเป็นคำพูดตรงไม่มีอยู่ในบทความ) โมเดลของเราจึงควรรองรับทั้งแบบสามคัน (power / condition / prop) และแบบคันเดียว

**Flight idle เทียบกับ ground idle และ beta** FAA ระบุว่า "The beta range of operation consists of power lever positions from flight idle to maximum reverse" และ "Reverse pitch does not mean reverse rotation of the engine" [E6, น. 15-9] งานของ NAL สำหรับ PT6A คลาส 1,200 shp รายงานว่า low idle อยู่ที่ 50–54% Ng และ high idle อยู่ที่ 67–71% Ng มุมใบที่ flight idle 11° และ reverse −15° และแรงขับจากไอเสียประมาณ 5% ของแรงขับใบพัด [E9] สำหรับเครื่องฝึกลงจอด ประเด็นที่สำคัญที่สุดคือ flight idle ต้องสูงพอให้เร่งไป go-around ได้เร็ว ในโมเดลของเรา ถ้าเร่งจาก ground idle (52%) จะใช้ 5.6 s กว่าจะได้ 95% แต่จาก flight idle (68%) ใช้แค่ 4.0 s (คำนวณที่ 31 °C, `e4_goaround.mjs`) และควรสังเกตว่าข้อกำหนด 5 วินาทีใน 33.73(b) นับจาก flight idle

**ตัวแปรที่เครื่องจำลองต้องมี (ขั้นต่ำ)**

| ตัวแปร | หน่วย | ใช้ทำอะไร | สถานะในโค้ด |
|---|---|---|---|
| PLA (power lever, −1…1 โดย <0 คือ beta/reverse) | – | อินพุต | มีแค่ `thr` 0…1 ซึ่งเป็นสัดส่วนแรงขับ |
| condition lever (CUTOFF / LO IDLE / HI IDLE) | – | อินพุต ใช้เลือก idle | ไม่มี |
| Np_set หรือ prop lever | rpm | อินพุตของ governor (หัวข้อใบพัด) | ไม่มี |
| Ng | % | สถานะพลวัตหลัก | ไม่มี |
| P_shaft, Q | W, N·m | ส่งออกไปให้ใบพัดและโครงเครื่องบิน | ไม่มี |
| ITT | °C | แสดงผล ใช้ทำ limiter และเหตุการณ์ overtemp | ไม่มี |
| FF | kg/s | แสดงผลและคิดน้ำหนัก (P3) | ไม่มี |
| limitBy (TRQ / ITT / NG) | – | บอกผู้ฝึกว่าอะไรกำลังจำกัดกำลังอยู่ | ไม่มี |

**ส่วนเชื่อมกับหัวข้อใบพัด (beta/reverse)** เครื่องยนต์ส่ง `P_shaft(t)` และ `Q(t) = P/Ω_p` ส่วนใบพัดส่ง `Ω_p` กลับมา ในช่วง governing (PLA ≥ 0) governor จะปรับมุมใบให้แรงบิดอากาศพลศาสตร์สมดุลกับ Q ที่ Np_set เมื่อ PLA < 0 (beta) คันโยกจะสั่งมุมใบโดยตรง และ gas generator อยู่ที่ idle ส่วนช่วง reverse ลึก Ng จะเพิ่มได้ถึงกำลัง reverse สูงสุด JSBSim ใช้พารามิเตอร์ `betarangeend` (ตัวอย่าง M601 = 64% ของระยะคันโยก) และ `reversemaxpower` (60%) [E7, E8] ซึ่งเป็นรูปแบบที่ควรลอกแนวคิดไปใช้

## 4.3 พิกัดและขีดจำกัดของ PT6A รุ่นที่ใช้ในเครื่องฝึก
ค่าในตารางนี้มาจาก TCDS ของ EASA ทั้งหมด (แหล่งปฐมภูมิ) โดยพิกัดอิง "dry sea level static ICAO Standard Atmospheric conditions" ไม่มี bleed และไม่มีภาระอุปกรณ์เสริม [E1, VI.2] TCDS ไม่ระบุขีดแรงบิด (ค่านั้นอยู่ในคู่มือเครื่องบิน) จึงคำนวณจาก Q = P/ω และติดป้าย "ค่าประมาณ"

| รุ่น | กำลังเพลา take-off = MCP | flat rate ถึง (SL) | ITT สูงสุด TO/MCP | ITT สตาร์ต | Np (ต่อเนื่อง / transient) | Ng สูงสุด | Q ที่ Np สูงสุด (ค่าประมาณ) | แหล่ง / ความเชื่อมั่น |
|---|---|---|---|---|---|---|---|---|
| PT6A-62 | 708 kW (≈949 shp) | 37 °C (99 °F) | 800 °C | 1,000 °C | 2,000 rpm (90.7%) / 2,205 rpm (100%) | 39,000 rpm (≈104.1%) | 3,380 N·m (2,493 lb-ft) | [E1, E2] สูง |
| PT6A-60A | 783 kW | 25 °C (77 °F) | 820 °C | 1,000 °C | 1,700 rpm (100%) / 1,870 rpm (110%) | 39,000 rpm | 4,398 N·m | [E1] สูง |
| PT6A-52 | 634 kW | 61 °C (142 °F) | 820 °C | 1,000 °C | 2,000 rpm (90.7%) / 2,205 rpm (100%) | 39,000 rpm | 3,027 N·m | [E1] สูง (ตรวจซ้ำในการทบทวน: TCDS VI.3 ระบุ 61 °C (142 °F)) |
| PT6A-68 | 932 kW (≈1,250 shp) + แรงขับไอเสีย 823 N | 42.4 °C (MCP) | 820 °C | 1,000 °C (5 s) | 2,000 rpm (100.25%) / 2,200 rpm 20 s | 39,000 rpm (104%) | 4,450 N·m (3,282 lb-ft) | [E3] สูง |
| PT6A-68B/C/D/T | 1,194 kW + 1,014 N | 30.8 °C (-68B), 31.2 °C (-68C/D/T) | 860 °C | 1,000 °C (5 s) | เหมือน -68 | เหมือน -68 | – | [E3] สูง |

ข้อสังเกตจาก TCDS: take-off rating ของ PT6A-62 จำกัดไว้ 5 นาที [E1] และระบบเชื้อเพลิงของ PT6A-41 และ -60 series เป็นแบบ "purely hydro-mechanical" [E1, III.2/III.7] ซึ่งแปลว่าในเครื่องยนต์จริง **ไม่มีอะไรตัดแรงบิดหรือ ITT ให้อัตโนมัติ** ผู้บินต้องคุมเอง นี่คือเหตุผลที่เสนอให้ `limiter` เป็นตัวเลือกจำลอง สำหรับ PT6A-25C ผู้วิจัยไม่ได้เปิด TCDS ที่ครอบคลุมรุ่นนี้ จึงไม่ให้ตัวเลข (ดู 4.10)

**ค่าที่เสนอสำหรับเครื่องยนต์สมมุติ 700 kW ของเรา (ค่าประมาณ)** ใช้ค่าตาม PT6A-62 แต่ปัดกำลังให้ตรงกับ `AC.P` ที่มีอยู่ ได้แก่ P_rated = 700 kW, flat rate ถึง 37 °C, Np = 2,000 rpm (transient 2,205), Q_lim = 700,000/(2000·π/30) = **3,342 N·m (2,465 lb-ft)**, Ng สูงสุด 104%, ITT 800 °C (TO/MCP) และ 1,000 °C (สตาร์ต) ส่วน idle ใช้ GI 52% และ FI 68% (ค่ากลางของช่วงที่ NAL รายงาน, ความเชื่อมั่นต่ำ [E9]) ค่าเหล่านี้สอดคล้องกับสมมติฐานร่วม (~700 kW ≈ 950 shp, 2,000 rpm) จึง **ไม่เปลี่ยนสมมติฐานร่วม** แต่ขอบันทึกว่า TCDS ของ PT6A-62 ไม่ได้ระบุทิศการหมุน (ให้ไปดู installation manual ER3306 [E1, III.9]) ทิศ "ตามเข็มนาฬิกาเมื่อมองจากด้านหลัง" จึงยังเป็นสมมติฐานที่ยังไม่ยืนยัน

## 4.4 การตอบสนองชั่วขณะ (transient)
**ข้อกำหนดการรับรอง (ปฐมภูมิ)** 14 CFR 33.73 "Power or thrust response" (Amdt. 33-1, 36 FR 5493, 1971) [E4]
- (a) เครื่องยนต์ต้องเร่งจากต่ำสุดถึงกำลัง take-off ได้โดยไม่มี overtemperature, surge หรือ stall "whenever the power control lever is moved from the minimum to the maximum position in not more than 1 second"
- (b) "from the fixed minimum flight idle power lever position when provided" (ถ้าไม่มี ให้เริ่ม "from not more than 15 percent of the rated takeoff power") ต้องได้ "95 percent rated takeoff power or thrust in not over 5 seconds" โดยการทดสอบ "must occur from a stabilized static condition" และ "using only the bleed air and accessories loads necessary to run the engine"

CS-E ของ EASA มีข้อ CS-E 745 "Engine Acceleration" และ AMC E 745 อยู่ในสารบัญ และตาราง assumptions ระบุ "Minimum ground idle", "Minimum flight idle" และ "Flight envelope" [E5] แต่ผู้วิจัยเปิดเนื้อหาตัวเลขของข้อนี้ไม่ได้ (เอกสารถูกตัด) **ตัวเลขฝั่ง EASA จึงยังไม่ยืนยัน** โมเดลนี้ใช้ 33.73 เป็นเกณฑ์

**ข้อมูลเชิงพฤติกรรมและข้อมูลวัด**
- FAA: บน free turbine "power output lags for several seconds when the pilot moves the power lever from flight idle" และ "the last 30 percent of engine rpm represents the majority of the engine thrust ... Below that setting, the application of power has very little effect" [E6, น. 15-11] สองประโยคนี้บอกว่ากำลังเป็นฟังก์ชันที่ชันมากของ Ng และช่วงแรกของการเร่งแทบไม่ได้กำลัง
- FAA ยังเตือนว่าในการร่อนลงด้วยใบพัด low pitch "large propellers spinning rapidly in low pitch create considerable drag" และ "can result in a hard, premature touchdown if the engines are idled too soon" [E6, น. 15-13] ซึ่งเกี่ยวกับฉากลงจอดของเราโดยตรง (ส่งต่อหัวข้อใบพัด)
- คู่มือ maintenance test flight ของเครื่องบินใบพัดสองเครื่องยนต์ที่ใช้ PT6A (TM 55-1510-218-MTF, หน้า 2-38) กำหนด acceleration check ให้ตั้ง 64% N1 แล้ว "rapidly move lever to maximum" จับเวลาถึง 93.5% N1 และกำหนดเวลาเร่งที่ยอมรับได้ 2.5 ถึง 4.0 วินาที [E14] (การทบทวนเปิดหน้าเดิมซ้ำและยืนยันตัวเลข 64%, 93.5% และ 2.5–4.0 s แต่ไม่ได้ยืนยันถ้อยคำทั้งประโยค จึงเขียนเป็นการถอดความ) เอกสารนี้อ่านผ่านเว็บไซต์ mirror และไม่เห็น distribution statement ความเชื่อมั่นจึง**ต่ำ** ใช้เป็นเพียงตัวตรวจความสมเหตุสมผล
- Kong และคณะ (PT6A-62) จำลองการเพิ่มเชื้อเพลิงแบบขั้นใน 0.1 s แล้วพบว่า "the overshoot of the compressor turbine inlet temperature occurred" ซึ่งหายไปเมื่อทำ ramp ที่ช้ากว่านั้น [E10] ผลนี้สนับสนุนการใส่ ITT overshoot ระหว่างเร่ง
- ยังไม่พบข้อมูลวัดเวลาลดรอบ (deceleration) ของ PT6A ที่เปิดเผยต่อสาธารณะ

**JSBSim `FGTurboProp` ทำงานอย่างไร** (LGPL-2.1 [E7], อ่านจาก commit 3f153c1) ใน `Run()` ใช้
`N1 = ExpSeek(N1, IdleN1 + ThrottlePos·(MaxN1−IdleN1), Idle_Max_Delay, Idle_Max_Delay·2.4)` คือ lag แบบ exponential ที่มี τ ขาเร่ง = `n1idle_max_delay` (ค่าเริ่มต้น 1 s) และ τ ขาลด = 2.4 เท่า จากนั้นกำลังคำนวณเป็น `EnginePowerRPM_N1(RPM, N1) × EnginePowerVC(P, Ve)` แล้วตัดที่ `MaxPower` ส่วน ITT ได้จากตาราง `ITT_N1` ที่เลื่อน N1 ไปข้างหน้า `(N1−old_N1)·300` (ทำให้ ITT พุ่งขณะเร่ง แต่ค่านี้ขึ้นกับความยาว time step) แล้วผ่าน lag `itt_delay` ส่วนเชื้อเพลิงคิดจาก `PSFC/CombustionEfficiency(N1)·HP` มีเฟสต่าง ๆ คือ `tpOff/tpSpinUp/tpStart/tpRun` (starter หมุนถึง `startern1`, ติดเครื่องเมื่อ N1 > 15%) และมีตัวเลือก IELU ซึ่งเมื่อ `|torque| > ielumaxtorque` จะลดคันโยกลง 0.1/s แล้วค่อยปล่อยคืน 0.05/s ข้อจำกัดที่ควรรู้คือ JSBSim ไม่ได้ใช้พารามิเตอร์แก้ θ/δ (ผลของความดันและความเร็วมาจากตาราง `EnginePowerVC` ที่เป็นฟังก์ชันของ `atmosphere/P-psf` กับ `velocities/ve-kts` แทน และตาราง `ITT_N1` ไม่ขึ้นกับอุณหภูมิอากาศ) ไม่มีแบบจำลอง flat rating ตาม ITT และไฟล์ `engine/PT6A-27.xml` กับ `PT6A-68.xml` ในคลังเป็นโมเดลแบบ `turbine_engine` (ไอพ่น) ที่สร้างด้วย Aero-Matic ไม่ใช่ `turboprop_engine` จึงไม่ควรใช้อ้างอิงพฤติกรรม PT6A [E8]

**งานวิชาการ** NAL (Lathasree & Pashilkar 2011) ใช้ lag อันดับหนึ่ง τ₁ บนสัญญาณ rating code ที่คุม %Ng และ SHP และ lag τ₂ บนมุมใบ แล้วระบุว่า "The engine and propeller time constants are estimated from the flight data" แต่ไม่ได้ตีพิมพ์ค่าตัวเลข [E9] Bayona-Roa และคณะ (CC BY 4.0) สร้างโมเดล 0-D ของ PT6A-65 ที่มีสมการสมดุลมวล พลังงาน และโมเมนตัมเชิงมุม ใช้ความเฉื่อย 0.12 kg·m² สำหรับเพลา gas generator และ 0.06 kg·m² สำหรับเพลา power turbine [E11] โมเดลระดับนี้แพงเกินไปสำหรับเบราว์เซอร์และต้องมีแผนที่คอมเพรสเซอร์ซึ่งไม่เปิดเผย

**เปรียบเทียบทางเลือก**

| ทางเลือก | ความสมจริง | CPU | งาน | หมายเหตุ |
|---|---|---|---|---|
| A. lag บนแรงขับ (ปัจจุบัน) | ต่ำ: เร็วเกินในช่วงแรก ไม่มี Ng/ITT | ~0 | – | ผ่าน 33.73 โดยบังเอิญ |
| B. lag บน Ng + แผนที่ Ng→P (แนว JSBSim) | กลาง: ได้รูปตัว S | ~0 | S | เลขชี้กำลังของแผนที่สำคัญมาก |
| **C. B + rate limit (FCU schedule) + θ/δ + 3 limits + ITT lag/overshoot (เสนอ)** | กลาง–สูง สำหรับงานฝึก | <1 µs/step | M | ทดสอบด้วย Node ได้ครบ |
| D. 0-D thermodynamic (สมดุลเพลา + แผนที่ส่วนประกอบ) [E10, E11] | สูง | สูง | L | ไม่มีแผนที่ส่วนประกอบสาธารณะ |

**สมการที่เสนอ (ทางเลือก C)** ใช้ % เป็นหน่วยของ Ng
$$
\dot N_g=\begin{cases}\min\!\left(\dfrac{N_{cmd}-N_g}{\tau_a},\,R_a\right) & N_{cmd}\ge N_g\\[2mm] \max\!\left(\dfrac{N_{cmd}-N_g}{\tau_d},\,-R_d\right) & N_{cmd}<N_g\end{cases}
$$
โดย $N_g$ คือความเร็วรอบ gas generator (%), $N_{cmd}$ คือเป้าหมายจากคันโยกหลังผ่าน limiter (%), $\tau_a = 0.6$ s และ $\tau_d = 0.8$ s คือค่าคงที่เวลาเข้าใกล้เป้า, $R_a = 10$ %/s และ $R_d = 12$ %/s คืออัตราสูงสุดตาม schedule ของ FCU (ทั้งหมดเป็นค่าประมาณ ปรับให้ตรง [E4, E6, E14])

กำลังเป็นฟังก์ชันพีชคณิตของ Ng ผ่านแผนที่แก้ (4.5) และ ITT มี lag กับ overshoot
$$
\dot{ITT}=\frac{ITT_{ss}(P_c,\theta_2)+k_{acc}\max(0,\dot N_g)-ITT}{\tau_{ITT}}
$$
โดย $ITT_{ss}$ คือ ITT ในสภาวะคงตัว (°C), $k_{acc} = 4$ K/(%/s) และ $\tau_{ITT} = 1.5$ s (ค่าประมาณ, ความเชื่อมั่นต่ำ [E7, E10])

**ผลของโมเดลที่เสนอ** (ค่าประมาณจากโมเดล ไม่ใช่ค่าวัด; สคริปต์ `e4_expected.mjs` ที่ระดับน้ำทะเล static, Np 2000 rpm, limiter เปิด; ตรวจซ้ำด้วยโค้ดใน 4.7 โดยตรงใน `e4rev_code47.mjs` ได้เวลาตรงกันทุกค่า ส่วน ITT สูงสุดต่างกันไม่เกิน 1 °C เช่น 783 และ 800 °C ที่ 31 และ 38 °C)

| เหตุการณ์ | 15 °C (ISA) | 31 °C | 38 °C | โค้ดปัจจุบัน |
|---|---|---|---|---|
| FI→max: กำลังที่ t = 1 s | 19% | 16% | 14% | 65% |
| FI→max: t ถึง 50% / 95% | 2.12 / 3.73 s | 2.32 / 3.95 s | 2.41 / 4.13 s | 0.65 / 2.95 s |
| Ng 64→93.5% (เทียบ [E14]: 2.5–4.0 s) | 2.95 s | – | – | ไม่มี Ng |
| max→FI: t ลดลงถึง 10% | – | 2.40 s | – | 2.86 s |
| GI (52%)→95% | – | 5.55 s | – | ไม่มี GI |
| จากกำลังขาเข้าใกล้ 25% → 95% (go-around) | – | 2.48 s | – | 2.71 s |
| ITT สูงสุดระหว่างเร่ง | 736 °C | 782 °C | 799 °C | ไม่มี ITT |

**ข้อเสนอแนะ** ใช้ทางเลือก C เพราะผ่านเกณฑ์ 33.73(b) อย่างมีระยะเผื่อ ได้รูปตัว S ตามที่ FAA อธิบาย และตรงกับช่วงเวลาของ acceleration check และควรปรับค่าจากเกณฑ์เหล่านี้ด้วย test ไม่ใช่ด้วยความรู้สึก

## 4.5 กำลังที่ใช้ได้กับความหนาแน่นและอุณหภูมิ (lapse), flat rating และกรณี VTBD
**พารามิเตอร์แก้ (corrected parameters)** เครื่องยนต์กังหันก๊าซที่จุดทำงานแก้เดียวกันจะมีสัดส่วนกำลังเป็น $\delta\sqrt\theta$ แบบจำลอง RPTEM (Referred Parameter Turboshaft Engine Model ที่ใช้ใน NDARC ตามที่ NASA บรรยายใน [E12]) เขียน specific power และ mass flow ในรูปแก้ เช่น $SP_a/(SP_0\,\theta)$ และ $\dot m_a\sqrt\theta/\delta$ (ทำให้เป็นสัดส่วนกับค่าที่ระดับน้ำทะเล static) โดยถือว่าแปรเป็นเส้นตรงทีละช่วงตาม θ, Mach และรอบ $N_r$ และนิยามกำลังแก้เป็น $P/(\delta\sqrt\theta)$ [E12] ผลคูณสองตัวนี้จึงให้ $P \propto \delta\sqrt\theta\,f(\theta)$ เราใช้รูปนี้
$$
\theta_2=\frac{T\left(1+\tfrac{\gamma-1}{2}M^2\right)}{288.15},\quad
\delta_2=\frac{p\left(1+\tfrac{\gamma-1}{2}M^2\right)^{\gamma/(\gamma-1)}}{101325},\quad
N_{gc}=\frac{N_g}{\sqrt{\theta_2}},\quad
P_c=\frac{P}{\delta_2\sqrt{\theta_2}},\quad
ITT_c=\frac{ITT_K}{\theta_2}
$$
โดย T (K) และ p (Pa) เป็นสภาพบรรยากาศจาก `atmosphere()`, M คือเลขมัค, γ = 1.4 และสมมติว่า inlet recovery = 1 (ค่าประมาณ)

**แผนที่กำลัง** (ค่าประมาณ)
$$
P_c = P_{rated}\,x^{k},\qquad x=\max\!\left(0,\frac{N_{gc}-N_{g0}}{100-N_{g0}}\right),\quad k=2.7,\ N_{g0}=52\%
$$
ค่า k ได้จากการ fit ตาราง `EnginePowerRPM_N1` ของ JSBSim engtm601 (Walter M601, 700 hp) ที่ 2,000 rpm ด้วย $P/P_{max} = ((N_1-60)/40)^k$ ซึ่งได้ k = 2.63, 2.72, 2.60, 2.73, 2.75, 2.68 และ 2.93 ที่ N1 = 86–99% [E8] นี่เป็นเครื่องยนต์คนละแบบ ความเชื่อมั่นจึงต่ำ แต่รูปร่างของแผนที่ตรงกับคำอธิบายของ FAA ที่ว่า 30% บนของรอบให้แรงส่วนใหญ่ [E6] ที่ flight idle (Ngc ≈ 68%) แผนที่ให้ประมาณ 5% ของกำลัง (36 kW แก้แล้ว, 27 kW ที่ 31 °C)

**ITT ในสภาวะคงตัว** (ค่าประมาณ) เป็นเส้นตรงในรูปแก้ที่ผ่านมุม flat rating
$$
ITT_c=ITT_c^{*}+s\,(P_c-P_c^{*}),\qquad
P_c^{*}=\frac{P_{rated}}{\sqrt{\theta_f}},\quad ITT_c^{*}=\frac{ITT_{lim}+273.15}{\theta_f},\quad s=\frac{ITT_c^{*}}{n\,P_c^{*}}
$$
โดย $\theta_f$ = (273.15+37)/288.15 = 1.0763, $P_c^*$ = 674.7 kW, $ITT_c^*$ = 997.0 K และ n คือ $d\ln P_c/d\ln ITT_c$ ที่มุม เราสมมติว่า**มุม flat rating คือจุดที่ ITT แตะขีดพอดี** ซึ่งสอดคล้องกับคำอธิบายของ FAA ว่า "In hot weather conditions, the maximum temperature limits may be exceeded without exceeding torque limits" [E6, น. 15-2] และ "takeoff power may be limited by either torque or by engine temperature" [E6, น. 15-12]

**ค่า n หาจากไหน (ค่าประมาณ, ความเชื่อมั่นต่ำ)** ถ้าถือว่ารุ่นพี่น้องในตระกูลเดียวกันใช้ความสัมพันธ์แก้เดียวกัน คู่ PT6A-60A (783 kW, 25 °C, ITT 820) กับ PT6A-62 (708 kW, 37 °C, ITT 800) [E1] ให้ n = 2.08 ส่วนคู่ PT6A-68B (1,194 kW, 30.8 °C, ITT 860) กับ PT6A-68 (932 kW, 42.4 °C, ITT 820) [E3] ให้ n = 3.63 สองคู่นี้มีฮาร์ดแวร์ต่างกันบางส่วน จึงใช้ n = 3.0 เป็นค่ากลางและเก็บช่วง 2.1–3.6 ไว้เป็นความไม่แน่นอน

**กำลังที่ใช้ได้**
$$
P_{max}=\min\big(Q_{lim}\,\omega_p,\ P_{ITT},\ P_{Ng}\big)(1-\ell_{inst}),\quad
P_{ITT}=\delta_2\sqrt{\theta_2}\left[P_c^{*}+\frac{ITT_{lim,K}/\theta_2-ITT_c^{*}}{s}\right],\quad
P_{Ng}=\delta_2\sqrt{\theta_2}\,P_{rated}\,x\!\left(\tfrac{N_{g,max}}{\sqrt{\theta_2}}\right)^{k}
$$
โดย $\omega_p$ = Np·π/30 (rad/s) และ $\ell_{inst}$ คือการสูญเสียจากการติดตั้ง (bleed และภาระอุปกรณ์ ซึ่ง TCDS ไม่ได้รวมไว้ [E1]) ตั้งเป็น 0 ไว้ก่อนเพราะยังไม่มีแหล่ง ถ้าต้องการสูตรสั้นใกล้มุม จะได้ $P_{ITT}\approx P_{rated}\,\delta_2(\theta_2/\theta_f)^{1/2-n}$ ซึ่งให้ความชัน $(0.5-n)/T$ = −0.80 %/°C ที่ n = 3

**ผลที่ VTBD** (ค่าประมาณจากโมเดล n = 3; สนามสูง 2.65 m จาก ARP ใน `src/15-geo.js:6`, static, Np 2000) ผลนี้คำนวณด้วย `atmosphere()` ของ repo ค่าถึง 37 °C ยึดกับ TCDS ส่วนค่าเหนือ 37 °C และคอลัมน์ ITT/Ng ขึ้นกับสมมติฐานของโมเดล

| OAT (°C) | ISA+ | σ | P_max (kW) | จำกัดโดย | ITT ที่ P_max (°C) | Ng (%) |
|---|---|---|---|---|---|---|
| 15 | 0 | 1.000 | 700 | TRQ | 736 | 100.0 |
| 25 | 10 | 0.966 | 700 | TRQ | 765 | 101.4 |
| 31 | 16 | 0.947 | 700 | TRQ | 783 | 102.3 |
| 34 | 19 | 0.938 | 700 | TRQ | 791 | 102.7 |
| 37 | 22 | 0.929 | 700 | ITT (มุม) | 800 | 103.1 |
| 38 | 23 | 0.926 | **694** (n = 2.08: 696; n = 3.63: 693) | ITT | 800 | 103.1 |
| 40 | 25 | 0.920 | 683 | ITT | 800 | 103.0 |
| 45 | 30 | 0.905 | 655 (672 / 644) | ITT | 800 | 103.0 |

ข้อสรุปสำหรับ VTBD: ในช่วง OAT 31–37 °C เครื่องยนต์คลาสนี้ให้กำลังเต็มแน่นอน (ความเชื่อมั่นสูง เพราะมาจาก TCDS) ที่ 38 °C ขาดไปราว 1% (ความเชื่อมั่นต่ำเรื่องขนาด แต่สูงเรื่องทิศทาง) ถ้าเป็น PT6A-68 ที่ flat rate ถึง 42.4 °C จะไม่เสียกำลังเลยในช่วงนี้ [E3] ตัวที่เปลี่ยนจริงคือระยะห่างจาก ITT ซึ่งเหลือ 17 °C ที่ 31 °C ควรแสดงค่านี้บนหน้าจอเครื่องยนต์เพราะเป็นบทเรียนของการบินในเขตร้อน

**ตามความสูง** (static, ค่าประมาณ; ram ที่ 160 KTAS เพิ่มราว 1–3%)

| ความสูง (ft) | ISA | ISA+10 | ISA+20 | ISA+25 |
|---|---|---|---|---|
| 0 | 700 | 700 | 700 | 683 |
| 5,000 | 700 | 690 | 640 | 615 |
| 10,000 | 657 | 612 | 570 | 549 |
| 15,000 | 577 | 539 | 502 | 485 |
| 20,000 | 502 | 470 | 439 | 424 |

ความสูงวิกฤตที่ ISA (ที่ ITT เริ่มจำกัด) ประมาณ 7,400 ft และที่ ISA+20 ประมาณ 800 ft ทั้งสองเป็นค่าประมาณที่ขึ้นกับ n ส่วนโค้ดปัจจุบันให้ "กำลัง" คงที่ทุกความสูงเพราะ `thrustAvail` ไม่รับ ρ

**ข้อเสนอแนะ** ใช้ $P_{max}$ แบบสามขีดจำกัดข้างต้น ต้นทุนแค่ไม่กี่ `Math.pow` ต่อ step ค่าที่เกิน flat rating ให้ติดธง "ค่าประมาณ" ในหน้าบรีฟฟิ่งภาษาไทย และเมื่อรอบถัดไปมีข้อมูลเครื่องบินจริง (AFM) ให้แทน n และ $\ell_{inst}$ ด้วยค่าจากกราฟ takeoff power ของเครื่องบินแบบนั้น

## 4.6 แรงบิดเครื่องยนต์ต่อโครงเครื่องบิน (เชื่อมกับหัวข้อใบพัด)
**ฟิสิกส์** ระบบ "โครงเครื่องบิน + โรเตอร์" มีโมเมนต์ภายนอกจากใบพัดคือแรงบิดอากาศพลศาสตร์ ซึ่งในสภาวะคงตัวเท่ากับแรงบิดเพลา Q = P/Ω_p และมีทิศตรงข้ามการหมุน ถ้าใบพัดหมุนตามเข็มนาฬิกาเมื่อมองจากด้านหลัง เวกเตอร์ความเร็วเชิงมุมของใบพัดจะชี้ไปข้างหน้า (+x ใน FRD) ปฏิกิริยาต่อโครงจึงเป็นโมเมนต์ม้วนลบ (ปีกซ้ายลง)
$$
L_{eng}=-s_{rot}\,Q,\qquad Q=\frac{P_{shaft}}{\Omega_p},\qquad
\mathbf M_{gyro}=-\boldsymbol\omega\times\mathbf H,\quad \mathbf H=\left(s_{rot}I_p\Omega_p+s_{gg}I_{gg}\Omega_{gg}\right)\hat{\mathbf x}
$$
โดย $L_{eng}$ คือโมเมนต์ม้วนในแกน FRD (N·m, บวก = ปีกขวาลง), $s_{rot}$ = +1 เมื่อหมุนตามเข็มนาฬิกามองจากด้านหลัง, $\Omega_p$ คือความเร็วเชิงมุมใบพัด (rad/s), $\boldsymbol\omega$ = (p, q, r) และ $\mathbf H$ คือโมเมนตัมเชิงมุมของโรเตอร์ (N·m·s) ถ้าแตกพจน์ gyroscopic จะได้ $\mathbf M_{gyro} = (0,\,-rH,\,qH)$ เช่นเมื่อเงยหัว (q > 0) กับใบพัดตามเข็มนาฬิกา จะเกิดโมเมนต์หันขวา ซึ่งตรงกับกฎที่นักบินรู้จัก ค่า $I_p$ เป็นงานของหัวข้อใบพัด ส่วน gas generator มี $I_{gg}$ ≈ 0.12 kg·m² ตามโมเดล PT6A-65 [E11] ทำให้ $H_{gg}$ ≈ 471 N·m·s ที่ 100% Ng (ค่าประมาณ: 0.12 × 37,468·2π/60) เพลานี้หมุนสวนทางกับ PT [E6] แต่ทิศสัมพัทธ์กับใบพัดหลังผ่านเฟืองทดยังไม่ยืนยัน จึงเสนอให้ทำเป็นงาน P3 แรงบิดปฏิกิริยาจากการเร่ง gas generator มีขนาด $I_{gg}\dot\Omega_{gg}$ ≈ 0.12 × 392 ≈ 47 N·m ที่ 10 %/s (ค่าประมาณ: 10 %/s ของ 3,924 rad/s = 392 rad/s²) ซึ่งน้อยมากเมื่อเทียบกับ Q จึงตัดทิ้งได้

**ขนาดของผล** (ต้นแบบ `e4_torque.mjs` และ `e4_torque2.mjs` ซึ่งแก้สำเนาของซอร์สในหน่วยความจำ ไม่ได้แก้ repo)
- บนพื้น เบรกล็อก ตัดแรงขับออกให้เหลือแค่ Q = 3,342 N·m: น้ำหนักบนล้อหลักซ้ายมากกว่าขวา 2,265 N เทียบกับสูตรง่าย 2Q/track = 2·3342/3.10 = 2,156 N และลำตัวเอียงซ้าย −0.34° ส่วนโค้ดปัจจุบันได้ 0 N
- ในอากาศ ถ้าเริ่มจาก trim ขาเข้าใกล้ 95 KIAS ที่ 31 °C แล้วใส่ Q เต็มโดยไม่บังคับ มุมเอียงหลัง 3 s จะเป็น **−35.3°** ส่วนโค้ดปัจจุบันได้ 0.0°
- เอเลอรอนที่ต้องใช้ถ่วงแรงบิดเต็มเมื่อปีกระดับ คือ $\delta_a = Q/(\bar q S b\,C_{l\delta a})$ ได้ 6.9° / 4.4° / 2.6° ที่ 80 / 100 / 130 KIAS (ใช้ $\bar q = \tfrac12\rho_0 V_{EAS}^2$ โดยถือ KIAS ≈ EAS ผลจึงไม่ขึ้นกับ OAT, `AC.Clda` = 0.16/rad, `e4_torque.mjs`) สูตรนี้ละผลของ β และ $C_{l\delta r}$

**ข้อเสนอแนะ** ใส่ $L_{eng}$ ทันทีที่มี Q (P1) และเก็บ Q ไว้คงที่ตลอด 4 sub-step ของ RK4 เพราะเครื่องยนต์อัปเดตใน `actuators()` ส่วน P-factor, slipstream swirl และ gyroscopic ของใบพัดอยู่ในหัวข้อใบพัด เครื่องบินจริงมักชดเชยแรงบิดบางส่วนด้วยการตั้งมุมติดตั้งของครีบหรือเครื่องยนต์ ซึ่งเป็นพารามิเตอร์ระดับเครื่องบินที่รอบหลังต้องกำหนด และควรตรวจว่าโหมด ASSIST (auto-rudder) ยังทำงานได้เมื่อมีแรงบิดนี้

## 4.7 แนวทาง implement ใน `src/20-flight.js`
โค้ดต่อไปนี้เป็นภาพร่าง ไม่ใช้ DOM จึงยังรันผ่าน `test/harness.mjs` ได้ และเขียนใหม่จากสมการ ไม่ได้คัดลอกโค้ด JSBSim

```js
// ── Free-turbine turboprop, PT6A class (fictional 700 kW). Ratings after EASA TCDS IM.E.078 (PT6A-62);
//    map/lag values are estimates (see research §4). Corrected parameters: θ2, δ2. ──
const ENGINE_PT6 = { P_rated: 700e3, T_flat_C: 37, Np_max: 2000, ITT_lim: 800, Ng_max: 104, Ng_GI: 52, Ng_FI: 68,
  Ng0: 52, kMap: 2.7, nITT: 3.0, tauAcc: 0.6, rAcc: 10, tauDec: 0.8, rDec: 12, tauITT: 1.5, kITTacc: 4, spin: 1, loss: 0 };
class Turboprop {
  constructor(p = ENGINE_PT6) {
    this.p = p; const thF = (273.15 + p.T_flat_C) / 288.15;
    this.PcR = p.P_rated / Math.sqrt(thF); this.ITTcR = (273.15 + p.ITT_lim) / thF; this.s = this.ITTcR / (p.nITT * this.PcR);
    this.Qlim = p.P_rated / (p.Np_max * Math.PI / 30);
    this.Ng = p.Ng_FI; this.ITT = null; this.P = 0; this.Q = 0; this.limitBy = ''; this.over = { trq: 0, itt: 0 };
  }
  map(Ngc) { const p = this.p, x = Math.max(0, (Ngc - p.Ng0) / (100 - p.Ng0)); return p.P_rated * x ** p.kMap; }
  inv(Pc) { const p = this.p; return p.Ng0 + (100 - p.Ng0) * Math.max(Pc / p.P_rated, 0) ** (1 / p.kMap); }
  corr(atm, M) { const f = 1 + 0.2 * M * M; return { th: atm.T * f / 288.15, de: atm.p * f ** 3.5 / 101325 }; }
  pMax(th, de, w) {
    const r = de * Math.sqrt(th), P_trq = this.Qlim * w;
    const P_itt = r * (this.PcR + ((273.15 + this.p.ITT_lim) / th - this.ITTcR) / this.s);
    const P_ng = r * this.map(this.p.Ng_max / Math.sqrt(th));
    const P = Math.min(P_trq, P_itt, P_ng); this.limitBy = P === P_trq ? 'TRQ' : P === P_itt ? 'ITT' : 'NG';
    return P * (1 - this.p.loss);
  }
  // pla: 0 = flight idle … 1 = max (beta < 0 is handled by the propeller); opts.mode 'power' | 'ng'; opts.limiter
  update(dt, pla, atm, M, Np, opts) {
    const p = this.p, { th, de } = this.corr(atm, M), w = Np * Math.PI / 30, r = de * Math.sqrt(th);
    const Pmax = this.pMax(th, de, w), idleNg = opts.groundIdle ? p.Ng_GI : p.Ng_FI;
    const a = clamp(pla, 0, 1);
    let Ncmd = opts.mode === 'ng' ? idleNg + a * (p.Ng_max - idleNg)
      : this.inv((r * this.map(idleNg / Math.sqrt(th)) + a * (Pmax - r * this.map(idleNg / Math.sqrt(th)))) / r) * Math.sqrt(th);
    if (opts.limiter) Ncmd = Math.min(Ncmd, this.inv(Pmax / r) * Math.sqrt(th));
    Ncmd = Math.min(Ncmd, p.Ng_max);
    const e = Ncmd - this.Ng, rate = e >= 0 ? Math.min(e / p.tauAcc, p.rAcc) : Math.max(e / p.tauDec, -p.rDec);
    this.Ng += rate * dt;
    const Pc = this.map(this.Ng / Math.sqrt(th));
    this.P = r * Pc; this.Q = this.P / Math.max(w, 1);
    const ittSS = th * (this.ITTcR + this.s * (Pc - this.PcR)) - 273.15 + p.kITTacc * Math.max(0, rate);
    this.ITT = this.ITT == null ? ittSS : this.ITT + (ittSS - this.ITT) * (1 - Math.exp(-dt / p.tauITT));
    if (this.Q > this.Qlim * 1.005) this.over.trq += dt;
    if (this.ITT > p.ITT_lim + 0.5) this.over.itt += dt;
  }
  trimTo(P, atm, M, Np) { const { th, de } = this.corr(atm, M); this.Ng = this.inv(P / (de * Math.sqrt(th))) * Math.sqrt(th); this.ITT = null; this.P = P; this.Q = P / (Np * Math.PI / 30); }
}
```
**จุดเชื่อมกับโค้ดเดิม**
1. ใน `constructor` ของ `Aircraft` ให้เพิ่ม `this.eng = new Turboprop(AC.engine || ENGINE_PT6)` และเก็บ `AC.engine = ENGINE_PT6` ไว้ใน `AC` เพื่อให้แต่ละแบบเครื่องบินกำหนดค่าของตัวเองได้
2. ใน `actuators(dt)` แทนบรรทัด 248 ด้วย: หา `atm = atmosphere(FIELD.elev - this.x[2], this.isaDev)` และ `M = (this.air.V||0)/atm.a` แล้วเรียก `this.eng.update(dt, (c.thr - AC.idle)/(1 - AC.idle), atm, M, 2000, this.engOpts)` ช่วงสะพานก่อนหัวข้อใบพัดเสร็จ ให้ตั้ง `this.thr = this.eng.P / this.eng.p.P_rated` เพื่อให้ `thrustAvail(V)` เดิมยังใช้ได้ (ต้นแบบ `e4_autoland.mjs` ใช้วิธีนี้และได้คะแนน autoland เท่าเดิม)
3. ใน `deriv()` ต่อท้ายบรรทัด 199 ด้วย `Mb[0] -= AC.engine.spin * this.eng.Q;`
4. ใน `setApproach()` ให้เรียก `this.eng.trimTo(thr * P_rated, ...)` หลังคำนวณ trim และใน `setParked()` ให้ตั้งเครื่องไว้ที่ ground idle
5. เพิ่ม `ng`, `itt`, `trq` (% ของ Q_lim), `limitBy` ลงใน `Recorder.sample` และให้ `Evaluator` บันทึกเหตุการณ์ `overtorque` / `overtemp` (ข้อความภาษาไทย เช่น "แรงบิดเกินขีดจำกัด" / "ITT เกินขีดจำกัด")
6. HUD หรือแถบเครื่องยนต์ (`80-hud.js`, `90-app.js`) ให้แสดง TRQ %, ITT °C, Ng %, Np rpm แทน `THR xx%` และบอกด้วยว่าอะไรกำลังจำกัดกำลังอยู่

## 4.8 ค่าพารามิเตอร์ (JSON)
```json
{
  "turboprop": {
    "ratings": {
      "P_rated": {"v":700000,"u":"W","scope":"engine","src":["E1"],"conf":"กลาง","est":true,"note":"ค่าประมาณ: กำลังเพลาที่ flat rate ของเครื่องยนต์สมมุติ ปัดจาก PT6A-62 = 708 kW (take-off = MCP) ตาม TCDS; 700 kW ≈ 939 shp"},
      "T_flat_C": {"v":37,"u":"degC","scope":"engine","src":["E1"],"conf":"กลาง","est":true,"note":"ค่าประมาณ: อุณหภูมิอากาศเข้าสูงสุดที่ยังได้กำลังเต็มที่ระดับน้ำทะเล (ISA+22) ยืมจาก PT6A-62 ที่ flat rate ถึง 37 °C"},
      "rating_basis": {"v":{"pressure_Pa":101325,"static":true,"bleed":0,"accessory_load":0},"u":"-","scope":"engine","src":["E1"],"conf":"สูง","est":false,"note":"TCDS: พิกัดอิง dry sea level static ICAO standard ไม่มี bleed ไม่มีภาระอุปกรณ์เสริม"},
      "install_loss_frac": {"v":0,"u":"-","scope":"aircraft","src":["E1"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ยังไม่มีแหล่งตัวเลข ตั้ง 0 ไว้ก่อน; ค่าจริงต้องมาจากข้อมูลเครื่องบินแต่ละแบบในรอบถัดไป"},
      "Np_max_rpm": {"v":2000,"u":"rpm","scope":"engine","src":["E1"],"conf":"สูง","est":false,"note":"PT6A-62 N2 2000 rpm (90.7%) ต่อเนื่อง"},
      "Np_transient_rpm": {"v":2205,"u":"rpm","scope":"engine","src":["E1"],"conf":"สูง","est":false,"note":"PT6A-62 N2 transient 2205 rpm (100%)"},
      "Q_lim": {"v":3342,"u":"N m","scope":"engine","src":["E1"],"conf":"กลาง","est":true,"note":"ค่าประมาณ Q = P_rated/omega ที่ 2000 rpm = 2465 lb-ft; TCDS ไม่ระบุแรงบิด (PT6A-62 708 kW จะได้ 3380 N m = 2493 lb-ft)"},
      "Ng_100pct_rpm": {"v":37468,"u":"rpm","scope":"engine","src":["E1","E3"],"conf":"สูง","est":false,"note":"นิยาม 100% Ng ของ PT6A-41/-60 และ -68 series"},
      "Ng_max_pct": {"v":104,"u":"%","scope":"engine","src":["E1","E3"],"conf":"สูง","est":false,"note":"39000 rpm = 104.09% (คำนวณ) ; TCDS -68 เขียน 104%"},
      "ITT_max_C": {"v":800,"u":"degC","scope":"engine","src":["E1"],"conf":"สูง","est":false,"note":"PT6A-62 take-off (5 นาที) และ MCP; -52/-60A/-68 = 820, -68B/C/D/T = 860"},
      "ITT_start_C": {"v":1000,"u":"degC","scope":"engine","src":["E1","E3"],"conf":"สูง","est":false,"note":"ขีดจำกัดตอนสตาร์ต (TCDS -68 ระบุ 5 วินาที)"},
      "takeoff_time_limit_s": {"v":300,"u":"s","scope":"engine","src":["E1"],"conf":"สูง","est":false,"note":"take-off rating จำกัด 5 นาที"}
    },
    "steady_map": {
      "Ng_GI_pct": {"v":52,"u":"%","scope":"engine","src":["E9"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ground (low) idle; NAL รายงาน 50-54% Ng สำหรับ PT6A คลาส 1200 shp"},
      "Ng_FI_pct": {"v":68,"u":"%","scope":"engine","src":["E9"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: flight (high) idle; NAL รายงาน 67-71% Ng"},
      "Ng0_pct": {"v":52,"u":"%","scope":"engine","src":["E8","E9"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: จุดที่ corrected power เป็นศูนย์ในแผนที่ Pc = P_rated*x^k"},
      "kMap": {"v":2.7,"u":"-","scope":"engine","src":["E8"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: fit ตาราง EnginePowerRPM_N1 ของ JSBSim engtm601 ที่ 2000 rpm ได้ k = 2.6-2.9"},
      "Pc_frac_vs_Ngc": {"v":{"axes":{"Ngc_pct":[52,60,68,76,84,90,95,100,104]},"data":[0,0.008,0.051,0.154,0.335,0.532,0.743,1,1.241]},"u":"-","scope":"engine","src":["E8"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: Pc/P_rated ตามแผนที่ x^2.7 (Ngc = Ng/sqrt(theta2))"},
      "nITT": {"v":3,"u":"-","scope":"engine","src":["E1","E3"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: d ln Pc / d ln ITTc ที่มุม flat rating; ประมาณจากคู่รุ่นใน TCDS ได้ 2.08 (-60A/-62) ถึง 3.63 (-68B/-68)"},
      "ITTc_vs_Pc": {"v":{"axes":{"Pc_frac":[0,0.05,0.25,0.5,0.75,0.964,1]},"data":[665,682,751,837,923,997,1009]},"u":"K (corrected, ITT_K/theta2)","scope":"engine","src":["E1"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: เส้นตรงผ่านจุดมุม (0.964, 997 K) ด้วยความชัน ITTc*/(n Pc*)"}
    },
    "dynamics": {
      "tauAcc_s": {"v":0.6,"u":"s","scope":"engine","src":["E4","E6","E14"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ค่าคงที่เวลาเข้าใกล้เป้า Ng ตอนเร่ง; ปรับให้ FI->95% = 3.7-4.0 s"},
      "rAcc_pct_s": {"v":10,"u":"%Ng/s","scope":"engine","src":["E14"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: อัตราเร่งสูงสุดแบบ FCU schedule; สอดคล้องกับ 64->93.5% Ng ใน 2.5-4.0 s"},
      "tauDec_s": {"v":0.8,"u":"s","scope":"engine","src":["E7"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ไม่มีข้อมูลวัด; JSBSim ใช้ decel tau = 2.4 เท่าของ accel"},
      "rDec_pct_s": {"v":12,"u":"%Ng/s","scope":"engine","src":[],"conf":"ต่ำ","est":true,"note":"ไม่มีแหล่ง; ค่าประมาณเพื่อให้ max->FI ลดเหลือ 10% กำลังใน ~2.4 s"},
      "tauITT_s": {"v":1.5,"u":"s","scope":"engine","src":["E7"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: หน่วงการแสดง ITT; JSBSim ใช้ itt_delay แบบ exponential"},
      "kITTacc": {"v":4,"u":"K per (%Ng/s)","scope":"engine","src":["E7","E10"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ITT พุ่งเกินขณะเร่ง (Kong 2000 พบ overshoot เมื่อเพิ่มเชื้อเพลิงเร็ว)"},
      "cert_accel_FI_to_95pct_max_s": {"v":5,"u":"s","scope":"engine","src":["E4"],"conf":"สูง","est":false,"note":"14 CFR 33.73(b) (Amdt. 33-1): จาก fixed minimum flight idle (หรือ ≤ 15% ถ้าไม่มี) ถึง 95% rated take-off power ไม่เกิน 5 s เริ่มจาก stabilized static condition; ข้อ (b) ไม่ได้กำหนดเวลาเลื่อนคันโยก (การเลื่อนสุดช่วงใน 1 s อยู่ในข้อ (a)) โมเดลจึงทดสอบด้วยขั้นบันได"}
    },
    "airframe_coupling": {
      "spin": {"v":1,"u":"-","scope":"aircraft","src":[],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: +1 = ใบพัดหมุนตามเข็มนาฬิกาเมื่อมองจากด้านหลัง (สมมติฐานร่วม; TCDS -62 ไม่ระบุ ให้ดู installation manual)"},
      "thrust_axis_body": {"v":[1,0,0],"u":"-","scope":"aircraft","src":[],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: แกนเพลาใบพัดในแกน FRD; รอบนี้ถือว่าขนานแกน x และผ่าน CG"},
      "I_gg": {"v":0.12,"u":"kg m2","scope":"engine","src":["E11"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: โมเมนต์ความเฉื่อยแกน gas generator จากแบบจำลอง PT6A-65 (ไม่ใช่ค่าวัด) ; H ≈ 471 N m s ที่ 100% Ng"},
      "gg_rotation_rel_prop": {"v":-1,"u":"-","scope":"engine","src":["E6"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: AFH: CT กับ PT หมุนสวนทางกัน; ทิศสัมพัทธ์กับใบพัดหลังผ่านเกียร์ยังไม่ยืนยัน"}
    },
    "fuel": {
      "psfc": {"v":0.669,"u":"lb/(hp h)","scope":"engine","src":["E8"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ค่าของ Walter M601 ในไฟล์ JSBSim ใช้เป็นตัวยึดตำแหน่งเท่านั้น ยังไม่ยืนยันสำหรับ PT6A"}
    },
    "beta_reverse": {
      "beta_range_end_frac": {"v":0.64,"u":"-","scope":"engine","src":["E8"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ตัวอย่าง JSBSim M601: เมื่อเลือก reverse (Reversed = true) คันโยกช่วงล่าง 64% แรกเป็น beta (กำลัง idle, คันโยกคุมมุมใบ) ส่วนที่เหลือเพิ่มกำลัง reverse ถึง reversemaxpower"},
      "reverse_max_power_frac": {"v":0.6,"u":"-","scope":"engine","src":["E8"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ตัวอย่าง JSBSim M601: กำลังสูงสุดตอน reverse = 60%"},
      "blade_angle_FI_deg": {"v":11,"u":"deg","scope":"propeller","src":["E9"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: NAL: มุมใบที่ flight idle 11 องศา reverse -15 องศา (ให้หัวข้อใบพัดยืนยัน)"}
    },
    "sim": {
      "limiter": {"v":1,"u":"bool","scope":"sim","src":["E1","E7"],"conf":"กลาง","est":true,"note":"ค่าประมาณ: 1 = จำกัดแรงบิด/ITT/Ng อัตโนมัติ (คล้าย PMU หรือ IELU ใน JSBSim); PT6A-62 จริงเป็น hydro-mechanical ล้วน ผู้บินต้องคุมเอง; ในโหมดคันโยก 'power' คำสั่งถูกสเกลไปที่ P_max อยู่แล้ว ตัวเลือกนี้จึงมีผลจริงเฉพาะโหมด 'ng' (T-E-10, T-E-11)"},
      "leverMode": {"v":{"mode":"power"},"u":"-","scope":"sim","src":["E13"],"conf":"กลาง","est":true,"note":"ค่าประมาณ: 'power' = คันโยกสั่งกำลังเชิงเส้นระหว่างกำลัง idle กับ P_max (แนวคิดคล้าย single-lever ที่ E13 บรรยาย) ; 'ng' = คันโยกสั่ง Ng แบบ hydro-mechanical"},
      "engine_update_rate_Hz": {"v":240,"u":"Hz","scope":"sim","src":[],"conf":"สูง","est":true,"note":"ค่าประมาณ: อัปเดตใน actuators() ครั้งละ step นอก RK4"}
    },
    "derived_vtbd": {
      "P_avail_vs_OAT_SL": {"v":{"axes":{"OAT_C":[15,25,31,34,37,38,40,45]},"data":[700,700,700,700,700,694,683,655]},"u":"kW","scope":"engine","src":["E1"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณจากโมเดลนี้ (n = 3) ที่ VTBD สูง 2.65 m static; ถึง 37 °C แน่นอนจาก TCDS เกินนั้นขึ้นกับ n (38 °C: 692-696 kW)"},
      "P_avail_static_grid": {"v":{"axes":{"alt_ft":[0,2500,5000,7500,10000,15000,20000],"isa_dev_C":[0,10,20,25]},"data":[[700,700,700,683],[700,700,675,649],[700,690,640,615],[699,651,604,582],[657,612,570,549],[577,539,502,485],[502,470,439,424]]},"u":"kW","scope":"engine","src":["E1","E12"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ static ไม่รวม ram; ram ที่ 160 KTAS เพิ่มราว 1-3%"}
    },
    "reference_engines": {
      "PT6A-62": {"v":{"P_kW":708,"flat_C":37,"ITT_C":800,"Np_rpm":2000,"Np_trans_rpm":2205,"Ng_max_rpm":39000,"PT_rpm_at_2000":30145,"dry_kg":206},"u":"mixed","scope":"engine","src":["E1","E2"],"conf":"สูง","est":false,"note":"EASA TCDS IM.E.078; fuel control hydro-mechanical ล้วน"},
      "PT6A-60A": {"v":{"P_kW":783,"flat_C":25,"ITT_C":820,"Np_rpm":1700,"Np_trans_rpm":1870},"u":"mixed","scope":"engine","src":["E1"],"conf":"สูง","est":false,"note":"ใช้ประกอบการประมาณ nITT เท่านั้น"},
      "PT6A-52": {"v":{"P_kW":634,"flat_C":61,"ITT_C":820,"Np_rpm":2000,"Np_trans_rpm":2205},"u":"mixed","scope":"engine","src":["E1"],"conf":"สูง","est":false,"note":"ตรวจซ้ำในการทบทวน: TCDS VI.3 ระบุ flat rate ถึง 61 °C (142 °F) ทั้ง take-off และ MCP"},
      "PT6A-68": {"v":{"P_kW":932,"flat_C":42.4,"ITT_C":820,"Np_rpm":2000,"Np_trans_rpm_20s":2200,"Ng_max_pct":104,"jet_N":823},"u":"mixed","scope":"engine","src":["E3"],"conf":"สูง","est":false,"note":"EASA TCDS IM.E.038; flat rating ระบุเป็น max air inlet temperature ของ MCP"},
      "PT6A-68B_C_D_T": {"v":{"P_kW":1194,"flat_C_68B":30.8,"flat_C_68CDT":31.2,"ITT_C":860,"jet_N":1014},"u":"mixed","scope":"engine","src":["E3"],"conf":"สูง","est":false,"note":"EASA TCDS IM.E.038"}
    }
  }
}
```

## 4.9 กรณีทดสอบ
ค่าคาดหวังทุกค่าคำนวณด้วยสคริปต์ใน `scripts/` (`e4_engine.mjs` เป็นต้นแบบ, `e4_expected.mjs`, `e4_goaround.mjs`, `e4_torque.mjs`, `e4_torque2.mjs`, `e4_autoland.mjs`, `e4_current.mjs`) ทุกกรณีใช้สนาม VTBD สูง 2.65 m, static (M = 0), Np 2,000 rpm และ dt = 1/240 s เว้นแต่ระบุไว้เป็นอย่างอื่น

| ID | สิ่งที่ทดสอบ | การตั้งค่า | ผลที่คาดหวัง (± tolerance) | ที่มาของค่าคาดหวัง | โมเดลปัจจุบัน |
|---|---|---|---|---|---|
| T-E-01 | Flat rating จำกัดด้วยแรงบิด | limiter เปิด, OAT 15 / 31 / 37 °C, `pMax()` | P_max = 700 kW ± 1% ทั้งสามค่า และ limitBy = TRQ ที่ 15 และ 31 °C; Q_lim = 3,342 N·m ± 0.5% | TCDS flat 37 °C [E1] + Q = P/ω | ยังไม่มีฟีเจอร์ (แรงขับ static 11,500 N ทุก OAT) |
| T-E-02 | เกิน flat rating (วันร้อนสุดที่ VTBD) | OAT 38 °C | P_max = 694 ± 4 kW, limitBy = ITT, ITT_ss = 800 ± 2 °C | โมเดล n = 3 (ช่วง n 2.08–3.63 ให้ 693–696) | ไม่มี lapse (11,500 N เท่าเดิม) |
| T-E-03 | ความชัน lapse | OAT 45 °C | 655 ± 17 kW (−0.5 ถึง −1.0 %/°C เหนือ 37 °C) | โมเดล + ช่วง n จาก TCDS [E1, E3] | ไม่มี lapse |
| T-E-04 | Lapse ตามความสูง | ISA 10,000 ft static; หาความสูงวิกฤตที่ ISA | P_max = 657 ± 33 kW (ITT); ความสูงวิกฤต 7,400 ± 2,000 ft | โมเดลพารามิเตอร์แก้ [E12] + มุม TCDS [E1] | ไม่มี lapse ตามความสูง (`thrustAvail` ไม่รับ ρ) |
| T-E-05 | ข้อกำหนดเร่ง 33.73(b) | ISA 15 °C, เริ่มคงตัวที่ FI (Ng 68%), PLA 0→1 ที่ t = 0 | t(P ≥ 95%) ≤ 5.0 s (เกณฑ์บังคับ) และ = 3.7 ± 0.5 s (ค่าปรับ) | 14 CFR 33.73(b) [E4] + โมเดล | 2.95 s (ผ่านเกณฑ์ 5 s แต่เร็วกว่าค่าปรับ) |
| T-E-06 | ช่วงหน่วงต้นการเร่ง | เหมือน T-E-05 | P(t = 1 s) ≤ 25% ของ P_rated (โมเดล 19%) | FAA "lags for several seconds" [E6] | 65% (ไม่ผ่าน) |
| T-E-07 | Acceleration check ของ Ng | ISA, Ng เริ่ม 64% (ตั้ง Ng_FI = 64), PLA → max | t(Ng ≥ 93.5%) อยู่ในช่วง 2.5–4.0 s (โมเดล 2.95 s) | TM 55-1510-218-MTF [E14] (ความเชื่อมั่นต่ำ) | ยังไม่มีฟีเจอร์ (ไม่มี Ng) |
| T-E-08 | การลดรอบ | 31 °C, คงตัวที่กำลังเต็ม แล้ว PLA 1→0 | t(P ≤ 10%) = 2.4 ± 0.6 s และ Ng คงตัวที่ 68.0 ± 0.2% | โมเดล (ไม่มีข้อมูลวัด) | 2.86 s (สมมาตรกับขาเร่ง) |
| T-E-09 | Ground idle เทียบกับ flight idle | 31 °C, Ng เริ่ม 52% กับ 68%, PLA → max | GI: t95 = 5.6 ± 0.6 s (> 5 s); FI: t95 = 4.0 ± 0.5 s | โมเดล + เกณฑ์นับจาก FI [E4] | ยังไม่มีฟีเจอร์ |
| T-E-10 | Torque limiter | −10 °C, mode 'ng', PLA = 1, 20 s | limiter เปิด: Q ≤ 1.005·Q_lim และ over.trq = 0 s; limiter ปิด: Q ≥ 1.3·Q_lim (โมเดล 151%) และมีเหตุการณ์ overtorque | โมเดล; PT6A-62 เป็น hydro-mechanical [E1] | ยังไม่มีฟีเจอร์ |
| T-E-11 | ITT limiter และ overshoot | 40 °C, mode 'ng', PLA 0→1 | limiter ปิด: ITT_ss ≥ 815 °C (โมเดล 819) และมีเหตุการณ์ overtemp; limiter เปิด (38 °C): ITT สูงสุดระหว่างเร่ง ≤ 810 °C (ต้นแบบ `e4_engine.mjs` 799, โค้ดใน 4.7 ได้ 800 ตาม `e4rev_code47.mjs`) | โมเดล + ขีด 800 °C [E1] | ยังไม่มีฟีเจอร์ (ไม่มี ITT) |
| T-E-12 | แรงบิดปฏิกิริยาบนพื้น | `new Flight({oatC: 31})`, `ac.setParked(0, 0, 30°)`, เบรก 1, แรงขับ 0, Q = 3,342 N·m, spin +1, `ac.step(1/240)` 8 s แล้วอ่าน `air.load`, `air.phi`, `air.gs` | N_ซ้าย − N_ขวา = 2,156 N ± 10% (ต้นแบบ 2,265 N), φ = −0.34 ± 0.10°, gs < 0.01 m/s; spin −1 ได้ค่ากลับเครื่องหมาย | สมดุลโมเมนต์ 2Q/track | 0 N |
| T-E-13 | แรงบิดปฏิกิริยาในอากาศ | `new Flight({oatC: 31})` (trim ขาเข้าใกล้ 95 KIAS แฟลปลง ล้อลง), ใส่ Q เต็ม (แรงขับคงที่ที่ค่า trim) แล้วเรียก `ac.step(1/240)` 720 ครั้งโดยคำสั่งคงที่ (ไม่เรียก autopilot) อ่าน `air.phi`; และสูตร δa ที่ 100 KIAS | φ(3 s) = −35 ± 7° (ปีกซ้ายลง); δa_trim = 4.44 ± 0.3° | ต้นแบบ + $Q/(\bar q S b C_{l\delta a})$ | φ(3 s) = 0.0° |
| T-E-14 | Regression ของ autoland | 4 SCENARIOS, seed 5, autopilot, mode 'power', สะพาน thr = P/P_rated | ไม่ crash และคะแนนไม่ต่ำกว่าค่าปัจจุบันเกิน 3 (calm 100, head 96, xr 97, xl 88) | ต้นแบบ `e4_autoland.mjs` ได้ 100/96/97/88 | 100/96/97/88 (lag เดิม) |
| T-E-15 | สอดคล้องกับ Np | limiter เปิด, 15 °C, Np = 1,700 rpm | P_max = Q_lim·ω = 595 ± 3 kW (TRQ) และ P = Q·ω ถูกต้องถึง 0.1% | P = Qω | ยังไม่มีฟีเจอร์ |

## 4.10 ความขัดแย้งของแหล่งข้อมูลและข้อจำกัด
- **เลขชี้กำลัง ITT (n) ซึ่งกำหนดความชันของ hot-day lapse:** คู่รุ่น -60A/-62 ให้ 2.08 (−0.51 %/°C) แต่คู่ -68B/-68 ให้ 3.63 (−1.01 %/°C) [E1, E3] ทั้งสองคู่ไม่ได้ใช้ฮาร์ดแวร์เดียวกันทุกชิ้น และไม่พบข้อมูลสาธารณะที่บอกกำลังเหนือ flat rating โดยตรง ผลนี้มีผลน้อยที่ VTBD (ต่างกันไม่ถึง 4 kW ที่ 38 °C) แต่มีผลมากกว่าที่สนามสูงหรือที่ ISA+30
- **การลดรอบ:** JSBSim ใช้ τ ขาลด = 2.4 เท่าของขาเร่ง [E7] (ลดช้ากว่าเร่ง) ขณะที่ค่าที่เสนอ (τ_d = 0.8 s, R_d = 12 %/s) ลดเร็วกว่าเร่งเล็กน้อย ทั้งสองแบบไม่มีข้อมูลวัด PT6A รองรับ ความเชื่อมั่นจึงต่ำ
- **PT6A-68.xml ใน JSBSim** ระบุ "power: 1100.00 hp" และชื่อภายในว่า "PT6-27" ขณะที่ TCDS ระบุ 932 kW (≈1,250 shp) [E3, E8] ไฟล์นี้ยังเป็นโมเดลไอพ่น จึงไม่ควรใช้
- **ไม่มีขีดแรงบิดใน TCDS:** ค่า Q_lim ทั้งหมดได้จาก P/ω ที่ Np สูงสุด ในเครื่องบินจริงขีดแรงบิดอาจต่ำกว่านี้เพราะข้อจำกัดของเฟืองทดหรือโครงสร้าง (ต้องใช้ AFM ซึ่งเป็นเอกสารกรรมสิทธิ์)
- **ข้อจำกัด flat rating ของ PT6A-52 ที่ 61 °C** ดูสูงผิดปกติเมื่อเทียบกับรุ่นพี่น้อง แต่การทบทวนเปิด TCDS ซ้ำแล้วพบว่า VI.3 ระบุ 61 °C (142 °F) ทั้ง take-off และ MCP จริง (ความเชื่อมั่นสูง) รุ่นนี้ไม่ได้ใช้ในการประมาณ n
- **CS-E 745:** เปิดเนื้อหาตัวเลขไม่ได้ จึงยังไม่ยืนยันว่า EASA ใช้ 5 s / 95% เหมือน 33.73(b) หรือไม่
- **PT6A-25C:** ไม่ได้เปิด TCDS ของ PT6A-20/-25 series จึงไม่ให้ตัวเลขของรุ่นนี้
- **ทิศการหมุนใบพัด:** TCDS ของ PT6A-62 ไม่ระบุ [E1] จึงคง "ตามเข็มนาฬิกาเมื่อมองจากด้านหลัง" ไว้เป็นสมมติฐานที่ยังไม่ยืนยัน และทิศของ gas generator เทียบกับใบพัดก็ยังไม่ยืนยันเช่นกัน
- **ข้อมูลเวลาเร่ง 2.5–4.0 s** มาจากคู่มือของรัฐบาลสหรัฐฯ ที่อ่านผ่านเว็บไซต์ mirror โดยไม่เห็น distribution statement [E14] ใช้ได้แค่เป็นตัวตรวจความสมเหตุสมผล และไม่ได้ระบุผู้ใช้งานตามกฎเรื่องเนื้อหาทางทหาร
- **แผนที่ Ng→P (k = 2.7)** fit จากเครื่องยนต์ Walter M601 ในไฟล์ JSBSim ไม่ใช่ PT6A ส่วนค่า idle (52/68%) มาจากงาน NAL ที่ใช้ PT6A คลาส 1,200 shp [E8, E9]
- **พิกัดใน TCDS** ไม่รวม bleed และภาระอุปกรณ์เสริม [E1] การสูญเสียจากการติดตั้งจึงตั้งเป็น 0 ไว้ก่อน ซึ่งทำให้กำลังที่ได้ในเครื่องบินจริงอาจสูงกว่าความเป็นจริงไปบ้าง
- **สถานะการตรวจแหล่ง (ทบทวนรอบ 1):** เปิดยืนยันแล้ว: E1 (ค่า PT6A-62/-60A/-52 ทุกตัวในตาราง 4.3, ไม่มีขีดแรงบิด, ทิศการหมุนอยู่ใน installation manual), E2, E3, E4 (ข้อความและ Amdt. 33-1, 36 FR 5493, 24 Mar 1971), E5 (เฉพาะลิงก์แรก), E6 (คำพูดตรงทั้ง 16 ประโยคและเลขหน้า), E7/E8 (โค้ดและ XML ที่ commit 3f153c1), E9, E10 (บทคัดย่อ), E11, E12, E13 (แก้คำพูดตรงเป็นการถอดความ), E14 (ผ่าน mirror) ค่าคาดหวังใน 4.4, 4.5, 4.6 และ 4.9 คำนวณซ้ำด้วยสคริปต์เดิมและด้วยโค้ดใน 4.7 โดยตรง (`e4rev_code47.mjs`) ได้ตรงกัน และ autoland regression รันซ้ำได้ 100/96/97/88 ทั้งโค้ดปัจจุบันและแบบมีเครื่องยนต์
- **ขอบเขต:** โมเดลไม่ครอบคลุมการสตาร์ต, hot start, flameout, ice protection, inertial separator และน้ำมันหล่อลื่น หากต้องการขั้นตอนสตาร์ตในอนาคต ให้ใช้เฟสแบบ JSBSim เป็นแนวคิด [E7]

## 4.11 แหล่งอ้างอิง
1. [E1] European Union Aviation Safety Agency, *Type-Certificate Data Sheet IM.E.078, PT6A-41 Series Engines (PT6A-41/-42/-42A/-45A/-45B/-45R/-52/-60A/-61/-62/-65AG/-65AR/-65B/-65SC)*, Issue 02, 17 Mar 2022, https://www.easa.europa.eu/en/downloads/7669/en (ปฐมภูมิ) สัญญาอนุญาต: "© EASA ... All rights reserved" และ "Proprietary document" AirfieldLab อ้างตัวเลขที่เป็นข้อเท็จจริงพร้อมระบุแหล่งได้ และให้ลิงก์ได้ แต่ไม่ควรคัดลอกหรือแจกจ่ายตัวเอกสาร
2. [E2] EASA, *TCDS IM.E.078* Issue 01, 31 Aug 2007 (สำเนาที่ UK CAA เผยแพร่), https://caa.co.uk/Documents/Download/3939/984aa08e-5352-4da9-824b-309ec7cec37d/2935 (ปฐมภูมิ, ฉบับเก่า ใช้ยืนยันว่าค่าของ PT6A-62 ตรงกัน) สัญญาอนุญาต: เหมือน E1 ใช้อ้างข้อเท็จจริงและลิงก์ได้เท่านั้น
3. [E3] EASA, *Type-Certificate Data Sheet IM.E.038, PT6A-68 Series Engines*, Issue 01, 20 Apr 2016, https://www.easa.europa.eu/en/downloads/20720/en (ปฐมภูมิ) สัญญาอนุญาต: © EASA ใช้อ้างข้อเท็จจริงและลิงก์ได้
4. [E4] U.S. Code of Federal Regulations, *14 CFR §33.73 Power or thrust response* (Amdt. 33-1, 36 FR 5493, 24 Mar 1971), https://www.ecfr.gov/current/title-14/chapter-I/subchapter-C/part-33/subpart-E/section-33.73 และฉบับ PDF ปี 2012 https://www.govinfo.gov/content/pkg/CFR-2012-title14-vol1/pdf/CFR-2012-title14-vol1-sec33-73.pdf (ปฐมภูมิ) สัญญาอนุญาต: กฎหมายของรัฐบาลกลางสหรัฐฯ เป็น public domain AirfieldLab อ้างอิงและคัดลอกข้อความได้
5. [E5] EASA, *Easy Access Rules for Engines (CS-E) (Amendment 5)*, ED Decision 2018/014/R, ฉบับเผยแพร่ Feb 2020, https://www.easa.europa.eu/en/downloads/109691/en และ *CS-E Amendment 5*, https://www.easa.europa.eu/en/downloads/67945/en (ปฐมภูมิ ผู้วิจัยอ่านได้แค่สารบัญและ Table 1 ของ AMC E 30 "Assumptions" ซึ่งมีแถว "Thrust or power response, CS-E 745" ไม่ได้อ่านเนื้อหาข้อ CS-E 745; การทบทวนยืนยันลิงก์แรกว่าเป็น EAR CS-E Amendment 5, ED Decision 2018/014/R, ฉบับ Feb 2020 ส่วนลิงก์ที่สอง (67945) ยังไม่ได้เปิดยืนยัน) สัญญาอนุญาต: ส่วนที่อ่านได้ไม่มีข้อความลิขสิทธิ์ มีเพียง disclaimer ว่าเป็นฉบับรวมที่ไม่เป็นทางการ ถือเป็นเอกสารของ EASA ให้อ้างข้อเท็จจริงและลิงก์ได้ ไม่คัดลอกเนื้อหา
6. [E6] Federal Aviation Administration, *Airplane Flying Handbook* FAA-H-8083-3C, Chapter 15 "Transition to Turbopropeller-Powered Airplanes" (น. 15-1 ถึง 15-15), https://www.faa.gov/sites/faa.gov/files/regulations_policies/handbooks_manuals/aviation/airplane_handbook/16_afh_ch15.pdf (ปฐมภูมิ) สัญญาอนุญาต: งานของรัฐบาลสหรัฐฯ (public domain) อ้างอิงและคัดลอกได้โดยระบุที่มา
7. [E7] JSBSim Team (J. Javurek, D. Culp และผู้ร่วมพัฒนา), `src/models/propulsion/FGTurboProp.cpp` และ `FGTurboProp.h`, JSBSim master commit 3f153c1 (16 Nov 2026), https://github.com/JSBSim-Team/jsbsim/blob/master/src/models/propulsion/FGTurboProp.cpp (ปฐมภูมิสำหรับวิธีการของโมเดลเปิด) สัญญาอนุญาต: หัวไฟล์ระบุ GNU LGPL "version 2 of the License, or (at your option) any later version" และไฟล์ COPYING ของคลังเป็น LGPL-2.1 (ใช้ได้ในฐานะ LGPL-2.1-or-later) ผู้เขียนตามหัวไฟล์คือ Jiri Javurek โดยอิงงานของ David Culp เนื่องจาก AirfieldLab ยังไม่มี LICENSE และรวมไฟล์เป็นหน้าเดียว **ห้ามคัดลอกโค้ด** ให้อ่านแนวคิด อ้างอิง และเขียนใหม่จากสมการ (ซึ่งเป็นสิ่งที่ 4.7 ทำ)
8. [E8] JSBSim Team, `engine/engtm601.xml` (Walter M601 turboprop: `EnginePowerRPM_N1`, `ITT_N1`, `EnginePowerVC`, psfc, betarangeend, reversemaxpower) และ `engine/PT6A-68.xml`, `engine/PT6A-27.xml`, commit 3f153c1, https://github.com/JSBSim-Team/jsbsim/blob/master/engine/engtm601.xml (ข้อมูลของโมเดลเปิด, ทุติยภูมิเมื่อเทียบกับข้อมูลผู้ผลิต) สัญญาอนุญาต: LGPL-2.1 (ไฟล์ COPYING ของคลัง) อ้างตัวเลขเป็นข้อเท็จจริงได้ และใช้ค่าที่ fit เอง (k = 2.7) ได้ แต่ไม่ควรคัดลอกตารางทั้งชุดเข้า repo
9. [E9] P. Lathasree, A. A. Pashilkar (CSIR-National Aerospace Laboratories), "Digital Simulation Model for a Turboprop Engine", SAROD 2011, Bangalore, 16–18 Nov 2011, https://core.ac.uk/download/11874789.pdf (ปฐมภูมิ, บทความประชุมวิชาการ) สัญญาอนุญาต: ไม่ระบุ ให้อ้างข้อเท็จจริงและลิงก์เท่านั้น
10. [E10] Chang-Duk Kong, Ja-Young Ki, Hyun-Ki Shin, "A Study on Steady-state and Transient Performance Simulation of Turboprop Engine (PT6A-62)", *Journal of the Korean Society of Propulsion Engineers* 4(2):61–70, 2000, https://koreascience.kr/article/JAKO200011921455592.page?lang=ko (ปฐมภูมิ ผู้วิจัยอ่านได้แค่บทคัดย่อภาษาอังกฤษ ซึ่งยืนยันประโยค "When the fuel step increase of 0.1sec was performed, the overshoot of the compressor turbine inlet temperature occurred") สัญญาอนุญาต: หน้าเว็บระบุ "Copyright (C) KISTI. All Rights Reserved." ไม่มี open license ให้อ้างข้อเท็จจริงและลิงก์เท่านั้น
11. [E11] C. Bayona-Roa, J. S. Solís-Chaves, J. Bonilla, A. G. Rodriguez-Melendez, D. Castellanos, "Computational simulation of PT6A gas turbine engine operating with different blends of biodiesel: A transient-response analysis", Preprints 201906.0181 v2 (2019) ซึ่งหน้า preprint ชี้ไปยังฉบับตีพิมพ์ใน *Energies* 12, 4258 (2019), DOI 10.3390/en12224258, https://www.preprints.org/manuscript/201906.0181/v2/download (ปฐมภูมิ, preprint ที่ยังไม่ผ่าน peer review; โมเดลเป็น "generic version" ของ PT6A-65 ค่าความเฉื่อยจึงเป็นค่าที่ผู้แต่งตั้ง ไม่ใช่ค่าวัด) สัญญาอนุญาต: CC BY 4.0 นำค่าและรูปมาใช้ได้เมื่อระบุผู้แต่ง
12. [E12] J. W. Chapman, J. M. Vegh, G. Nunez, C. A. Snyder (NASA Glenn และผู้ร่วมเขียนจากหน่วยงานรัฐบาลสหรัฐฯ), "Modeling Turboshaft Engines for the Revolutionary Vertical Lift Technology Project, Expanded", VFS 79th Annual Forum, West Palm Beach, 16–18 May 2023, NTRS 20230003820, https://ntrs.nasa.gov/api/citations/20230003820/downloads/VFS_paper_4-5.pdf (ปฐมภูมิ) สัญญาอนุญาต: บทความระบุ "This is a work of the U.S. Government and is not subject to copyright protection in the U.S." อ้างและใช้สมการได้ (ข้อความสกัดจาก PDF ของสมการบางส่วนเพี้ยน จึงควรตรวจรูปสมการกับฉบับพิมพ์ก่อนลอก)
13. [E13] M. Šplíchal, M. Cervenka, J. Juracka, "Engine condition monitoring on small single engine turboprop", *Aircraft Engineering and Aerospace Technology* 95(9):1335–1343, 2023, DOI 10.1108/AEAT-09-2022-0249, https://emerald.com/doi/pdf/10.1108/AEAT-09-2022-0249 (ปฐมภูมิ; บทความไม่ระบุแบบเครื่องบินที่ศึกษา) สัญญาอนุญาต: CC BY 4.0 ("published under the Creative Commons Attribution (CC BY 4.0) licence") ใช้ข้อเท็จจริง ข้อความ และรูปได้เมื่อระบุผู้แต่งและแหล่ง
14. [E14] เอกสารของรัฐบาลสหรัฐฯ TM 55-1510-218-MTF (maintenance test flight manual ของเครื่องบินใบพัดสองเครื่องยนต์ที่ใช้ PT6A), หน้า 2-38 "Engine runup (cont)" ซึ่งอ่านผ่าน mirror ที่ https://maintenanceprocedures.tpub.com/TM-55-1510-218-MTF/TM-55-1510-218-MTF0048.htm (ทุติยภูมิ เพราะเป็นสำเนาจากเว็บ และไม่เห็น distribution statement; หน้า mirror แสดงลิขสิทธิ์ของผู้ทำเว็บ Integrated Publishing, Inc. ซึ่งครอบคลุมเฉพาะการจัดหน้าเว็บ ไม่ใช่เนื้อหาของรัฐบาล) สัญญาอนุญาต: เอกสารรัฐบาลสหรัฐฯ แต่ยังไม่ยืนยันสถานะการเผยแพร่ ให้อ้างตัวเลขพร้อมป้ายความเชื่อมั่นต่ำ และไม่คัดลอกเนื้อหา

## 4.12 งานที่แนะนำสำหรับ Claude Code
1. **P1 · M** สร้างคลาส `Turboprop` และค่าคงที่ `ENGINE_PT6` ใน `src/20-flight.js` (ไม่ใช้ DOM) ประกอบด้วยพารามิเตอร์แก้, แผนที่ x^k, เส้น ITT, ขีดจำกัด TRQ/ITT/NG, พลวัต Ng แบบ rate limit + lag และ ITT lag พร้อมไฟล์ `test/engine.test.mjs` ที่ export ผ่าน `harness.mjs` (ต้องเพิ่ม `Turboprop` และ `ENGINE_PT6` ในรายการ return ของ `new Function` ใน `test/harness.mjs` และพิจารณาเพิ่ม test นี้ใน `.github/workflows/pages.yml`) ทำบน branch แล้วเปิด PR ตาม CLAUDE.md — ทดสอบ T-E-01, T-E-02, T-E-03, T-E-04, T-E-05, T-E-06, T-E-07, T-E-08, T-E-15
2. **P1 · S** เชื่อมเครื่องยนต์เข้ากับ `Aircraft.actuators()` ด้วยสะพาน `thr = P/P_rated` เพื่อคง `thrustAvail` เดิมไว้ก่อน, ใส่ `trimTo()` ใน `setApproach()`/`setParked()` และให้ `c.thr` ทำหน้าที่เป็น PLA ในโหมด 'power' — ทดสอบ T-E-14, T-E-06
3. **P1 · S** ใส่แรงบิดปฏิกิริยา `Mb[0] -= spin·Q` ใน `deriv()` (Q คงที่ตลอด step) แล้วตรวจซ้ำว่า `assist.test.mjs` และ autoland ยังผ่าน — ทดสอบ T-E-12, T-E-13, T-E-14
4. **P2 · M** เพิ่ม condition lever (CUTOFF / GI / FI), โหมดคันโยก 'power' | 'ng', ตัวเลือก `limiter` ในการตั้งค่า (เปิดไว้เป็นค่าเริ่มต้นในโหมด ASSIST), เหตุการณ์ overtorque/overtemp ใน `Evaluator` และหน้าจอ TRQ/ITT/Ng/Np ภาษาไทยที่บอกด้วยว่าอะไรกำลังจำกัดกำลัง — ทดสอบ T-E-09, T-E-10, T-E-11
5. **P2 · M** (ทำร่วมกับหัวข้อใบพัด) แทน `thrustAvail` ด้วยโมเดลใบพัดที่รับ P, Q, Np จากเครื่องยนต์ เพิ่มช่วง beta/reverse (PLA < 0) และ governor ของ Np — ทดสอบ T-E-15 และกรณีทดสอบของหัวข้อใบพัด
6. **P3 · S** เพิ่มพจน์ gyroscopic −ω×H ของใบพัดและ gas generator หลังหัวข้อใบพัดยืนยัน $I_p$ และทิศการหมุน และเพิ่ม FF/น้ำหนักเชื้อเพลิง (psfc ยังเป็นตัวยึดตำแหน่ง) — ให้เพิ่ม test ใหม่เมื่อได้ค่าที่มีแหล่งอ้างอิง; ระหว่างนี้ T-E-13 ต้องยังผ่าน
