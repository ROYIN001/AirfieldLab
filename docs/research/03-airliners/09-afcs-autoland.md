# 3.9 AFCS: autopilot, flight director, autothrust และลำดับ autoland CAT II/III

← [กลับไปหน้ารวมรอบที่ 3](../03-airliners.md) · [schema ส่วนขยาย](schema-ext.md) · [schema รายแบบ](schema.md)

หัวข้อนี้รวบรวมระบบนำร่องอัตโนมัติ (AFCS: autopilot, flight director, autothrottle/autothrust) ของเครื่องบินโดยสารที่บินที่ดอนเมือง ได้แก่ Boeing 737-800 (AFDS + A/T), ตระกูล A320 และ A330 (FMGS/AFS + A/THR) และ ATR 72-600 (AFCS ที่ไม่มี autothrottle และไม่มี autoland) โดยเน้นสิ่งที่ simulator ต้องใช้จริง คือ ลำดับโหมดในการลงจอดอัตโนมัติ ความสูงและเงื่อนไขที่แต่ละโหมดทำงาน เกณฑ์รับรอง autoland ที่ใช้เป็น tolerance ของการทดสอบ และกฎควบคุม (control law) ที่ทำซ้ำได้จากเอกสารสาธารณะ ส่วนกฎ fly-by-wire ของ Airbus (C*, protection, flare law ตอนบินด้วยมือ) อยู่ในหัวข้อ 8 และเทคนิคการบินของนักบิน (speed additive, flare ด้วยมือ, autobrake) อยู่ในหัวข้อ 10

หน่วย: ความสูงทุกค่าในข้อความให้ทั้ง ft และ m ส่วนใน JSON ใช้ m ใน `v` ตาม schema และใส่ ft ใน `note` ความสูงในหัวข้อนี้หมายถึง radio altitude (RA) ซึ่งในโค้ดเทียบได้กับ `a.hWheel` (ความสูงล้อต่ำสุด) ยกเว้นที่ระบุไว้ ระยะ "s" คือระยะตามทางวิ่งจาก threshold ไปทางลงจอด (ค่าลบคือก่อนถึง threshold) ตามนิยามของ `rwyLocal()` ในโค้ด

## 3.9.0 สรุปสั้น

- **นิยามที่ใช้ทดสอบ:** CAT I DH ≥ 200 ft (61 m) และ RVR ≥ 550 m; CAT II DH 100 ถึง < 200 ft (30.5 ถึง 61 m) และ RVR ≥ 300 m; CAT IIIA DH < 100 ft หรือไม่มี DH และ RVR ≥ 175 m; CAT IIIB DH < 50 ft (15.2 m) หรือไม่มี DH และ RVR 50 ถึง < 175 m [O7][O9] ระบบ fail-passive ใช้ DH ได้ต่ำสุด 50 ft ส่วนต่ำกว่านั้นต้องเป็น fail-operational ที่มี alert height (AH) [O8][O9]
- **เกณฑ์รับรอง autoland (CS-AWO 131, AC 20-191):** แตะพื้นก่อน 60 m (200 ft) หรือเลย 823 m (2700 ft) จาก threshold, ล้อนอกสุดห่างแนวกลางเกิน 21.3 m (70 ft), sink ถึงขีดโครงสร้าง (วิธีหนึ่งคือ 10 ft/s = 3.05 m/s) แต่ละข้อต้องมีโอกาส ≤ 10⁻⁶ ส่วนมุม bank ที่ทำให้ปีกหรือ nacelle แตะพื้น ≤ 10⁻⁷ (หรือ 10⁻⁸ ในตาราง average risk ของ EASA) [O1][O2][O3] เกณฑ์เก่า AC 20-57A ให้การกระจายตามยาวรวม ≤ 1500 ft (457 m) และด้านข้าง ≤ ±27 ft (8.2 m) ที่ 2σ [O4] สคริปต์ `o_autoland.mjs` แปลงเป็น σ ที่ยอมได้: σx ≤ 80 m (ถ้าค่าเฉลี่ยอยู่กลางช่วง 60 ถึง 823 m), σy ≤ 3.3 ถึง 3.8 m ตามความกว้างฐานล้อ, z(10⁻⁶) = 4.753
- **737-800 (AFDS + A/T):** ต้อง engage AP ตัวที่สองก่อน 800 ft RA เพื่อทำ dual channel approach; FLARE armed หลัง LOC และ G/S capture ใต้ 1500 ft; ถ้าไม่ armed ภายในราว 350 ft AP ทั้งสองปลดเอง; ที่ 400 ft stabilizer trim nose up อัตโนมัติ; flare เริ่มราว 50 ft (15.2 m); A/T แสดง RETARD ที่ 27 ft (8.2 m) หรือ 2.5 s หลัง flare แล้วถึง idle ตอนแตะพื้น; A/T ปลดเองราว 2 s หลังแตะพื้น [O19][O16] รุ่นที่ไม่มี rollout ต้องปลด AP เองหลังแตะพื้น; รุ่นที่มี rollout ใช้ LAND 3 (fail-operational, ไม่มี DH, RVR 75 m) และ LAND 2 (fail-passive, DH 50 ft) [O23] EASA TCDS ระบุ all-weather capability "Cat 3" [O22]
- **A320 family:** LAND engage เมื่อ LOC และ G/S engaged และต่ำกว่า 400 ft RA (122 m) ต้องขึ้นก่อน 350 ft; FLARE ราว 40 ft (โมเดลเปิด FBW: เริ่มเมื่อ h/|ḣ| ≤ 4 s ในช่วง 45 ถึง 60 ft); thrust idle ราว 30 ft; เสียงเรียก "RETARD" ที่ 10 ft ใน autoland (20 ft เมื่อลงด้วยมือ); decrab ระหว่างราว 20 ถึง 10 ft; ROLL OUT เมื่อล้อหลักแตะพื้น [O26][O30][O25] ความสามารถ CAT 3 DUAL (fail-op, AH 100 ft, DH 20 ft หรือไม่มี DH, RVR 75 m), CAT 3 SINGLE (DH 50 ft), CAT 2 (DH 100 ft); ลมสูงสุดสำหรับ autoland: headwind 30 kt, crosswind 20 kt, tailwind 10 kt [O28][O30]
- **A330-300:** ลำดับแบบเดียวกับ A320 (เหตุการณ์จริง Case One: "At 30 ft, ALIGN and RETARD modes engaged" [O24] p.27; บทความไม่ระบุแบบเครื่องในประโยคนี้ แต่ความเห็นท้ายกรณีอ้างขีดลมของ "the A340-500" จึงอนุมานว่าเป็น A340-500) แต่ AH 200 ft และ headwind ได้ถึง 35 kt ตามบัตรทบทวนของนักบิน (ความเชื่อมั่นต่ำ) [O29][O27]
- **ATR 72-600:** ไม่มี autothrottle (ปรับกำลังด้วยมือ) ไม่มี autoland; AP engage ได้ 12 s หลัง liftoff; CAT II บินด้วย AP + FD แล้วปลด AP ที่ DH; ลมที่สาธิตสำหรับ CAT 2: headwind 29 kt, tailwind 10 kt, crosswind 17 kt [O33]
- **flare law ที่ทำซ้ำได้:** สิทธิบัตร Boeing 4,354,237 ให้กฎ "sink rate แปรตามความสูง" ḣ = −K(h + h_B) โดยตัวอย่าง K = 0.205 s⁻¹, h_B = 12 ft และ flare เริ่ม "approximately 42 feet" [O13] (สิทธิบัตรไม่ผูกค่า 42 ft กับความเร็วหรือมุม GS ใด ผู้เขียนตีความเป็น 125 kt ซึ่งอยู่กลางตัวอย่าง 110/125/140 kt ของรูปที่ 1 และ GS 3°) สคริปต์คำนวณซ้ำได้ 41.9 ft และความไวต่อ ground speed ราว 185 ft ของจุดแตะพื้นต่อ 15 kt ซึ่งตรงกับ "about 200 ft" ในสิทธิบัตร กฎของโมเดลเปิด FlyByWire A32NX มีรูปเดียวกัน (ḣ = −h/τ − 2.5 ft/s) [O32] ทั้งสองให้ sink ตอนแตะพื้นราว 2.4 ถึง 2.5 ft/s (0.73 ถึง 0.76 m/s) ใกล้ผลบินจริงของ NASA DIALS บน 737 ที่ −2.4 ± 0.7 ft/s [O14]
- **ผลบน 21R ของ DMK (ค่าประมาณ, kinematic):** 737-800 ที่ 142 kt เริ่ม flare 50 ft ที่ s ≈ −58 m และแตะพื้นที่ s ≈ 535 m (1754 ft) ถ้าติดตามคำสั่งได้สมบูรณ์ หรือ ≈ 408 m ถ้าเส้นทางตอบสนองช้า 1 s; A320 ที่ 133.6 kt เริ่ม flare 47.3 ft และแตะพื้นที่ 488 m (377 m เมื่อมี lag) ทั้งหมดอยู่ในช่วงความสำเร็จเชิงปฏิบัติการ 150 ถึง 750 m [O8][O7]
- **DMK:** ILS 21R (IBKK) เป็น CAT II, 21L และ 03L เป็น CAT I, 03R ไม่มี ILS; LVP เริ่มเมื่อ RVR < 550 m หรือเพดานเมฆ < 200 ft และใช้ได้เฉพาะ 21R [O36][O37] ความกว้าง LOC จาก 210 m ที่ threshold ได้ 3.01° (21R), 3.00° (03L), 3.56° (21L) ตรงกับ AIP จึงได้ 1 dot = 0.75° สำหรับ 21R/03L และ 0.89° สำหรับ 21L ขณะที่โค้ดใช้ 0.91° ทุกทางวิ่ง

## 3.9.1 สภาพปัจจุบันใน AirfieldLab และสิ่งที่ขาด

`class Autopilot` ใน `src/20-flight.js` (บรรทัด 343 ถึง 424) [O40] มีโหมดเดียวต่อเนื่องคือ APP → FLARE → ROLLOUT → STOP และออกแบบมาสำหรับเครื่องฝึก 2,250 kg:

| ส่วน | โค้ดปัจจุบัน | ปัญหาเมื่อใช้กับเครื่องบินโดยสาร |
|---|---|---|
| LOC | ใช้ตำแหน่งขวาง `a.t` ในกรอบทางวิ่งโดยตรง: ṫ_cmd = clamp(−t/8, ±0.3 V_g), χ_cmd = asin(ṫ_cmd/V_g), φ_cmd = atan(V·e_χ/(g·3 s)) จำกัด 22° (12° ใต้ 60 m) | ไม่ได้ผ่านสัญญาณ ILS (ไม่มี dot, ไม่มีความไวที่เพิ่มขึ้นใกล้สายอากาศ, ไม่มีการรบกวน beam), ไม่มีโหมด capture แยก |
| GS | γ_cmd = −3° − clamp(0.0028·Δh, ±0.05 rad) โดย Δh จากเส้นทางเรขาคณิต | ไม่มีโหมด G/S* และ G/S, ไม่ใช้สายอากาศ GS (หัวข้อ 5) |
| flare | เข้าเมื่อ h_wheel < h_F = clamp(2.4·sink, 4.5, 9) m; ḣ_cmd = −(0.22 + h/2.4) m/s | τ = 2.4 s และ sink ตอนแตะ 0.22 m/s เหมาะกับเครื่องเล็ก เครื่องบินโดยสารใช้ flare ราว 40 ถึง 50 ft และ sink เป้า 2 ถึง 2.5 ft/s |
| thrust | PI บน IAS ไปที่ lerp(Vref, Vapp) แล้วใน FLARE ลด thr ด้วยอัตรา 0.4 ต่อวินาที (ถึง 0 ภายในไม่เกิน 2.5 s) ทันทีที่เข้า flare | ไม่มี RETARD ตามความสูง ไม่มี A/T mode, ไม่มี alpha floor, ไม่คำนึง spool lag ของเทอร์โบแฟน |
| decrab | ใต้ 11 m ผสม rudder ไปสู่ heading ทางวิ่ง เต็มที่ที่ 4.5 m | ไม่มี ALIGN ตามแบบ (Airbus 20 ถึง 30 ft) |
| rollout | rudder + เบรก 0.42 หลังแตะ 2.5 s | ไม่มี ROLL OUT ตาม LOC, ไม่มี A/T disconnect, ไม่มีเกณฑ์ 8.2 m |
| capability | ไม่มี | ไม่มี CAT 2/3, AH/DH, การลดระดับเมื่อเกิดความล้มเหลว, การห้าม autoland เมื่อลมเกิน |
| Evaluator | ให้คะแนนจุดแตะพื้น 300 ถึง 600 m ว่า "perfect" | ไม่มีเกณฑ์ CS-AWO / AC 20-57A สำหรับทดสอบ autoland แบบ Monte Carlo |

สิ่งที่หัวข้อนี้เสนอ: คลาส `AFCS` ที่แยก (1) ตัวจัดการโหมด (state machine ตาม `afcs.modes`, `afcs.autoland`) (2) guidance ที่อ่านค่าเบี่ยงเบน ILS เป็น dot/µA (3) กฎ flare/align/retard/rollout ตาม `afcs.laws` ต่อแบบ และ (4) autothrust ที่ส่งคำสั่ง N1 หรือ thrust lever ให้แบบจำลองเครื่องยนต์ของหัวข้อ 6 ส่วน inner loop (pitch/roll attitude → elevator/aileron) ใช้ของเดิมไปก่อน

## 3.9.2 นิยามการปฏิบัติการทัศนวิสัยต่ำ

### ประเภทการบินเข้า (ICAO ตั้งแต่ 2022 และ EASA)

ICAO แบ่ง approach เป็น Type A (minima ≥ 250 ft) และ Type B (minima < 250 ft) แล้วแบ่ง Type B เป็น CAT I/II/III [O9][O7] ตัวเลขด้านล่างอ่านจากเอกสารของหน่วยงานกำกับสองแห่งที่ถอดข้อความ ICAO/EASA มา (ICAO Annex 6 ฉบับเต็มเป็นเอกสารมีลิขสิทธิ์และไม่ได้เปิดอ่านตรง)

| ประเภท | DH | ทัศนวิสัย | หมายเหตุ | แหล่ง | ความเชื่อมั่น |
|---|---|---|---|---|---|
| CAT I | ≥ 200 ft (61 m) | visibility ≥ 800 m หรือ RVR ≥ 550 m | DA อ้างความกดอากาศ | [O7] p.18, [O9] slide 12 | สูง |
| CAT II | < 200 ft และ ≥ 100 ft (30.5 m) | RVR ≥ 300 m | DH อ้าง radio altimeter | [O7], [O9] slide 8, 12 | สูง |
| CAT III (นิยามปัจจุบัน) | < 100 ft หรือไม่มี DH | RVR < 300 m หรือไม่จำกัด | | [O7] p.18 | สูง |
| CAT IIIA (ชั้นเก่าใน AFM) | < 100 ft หรือไม่มี DH (ขั้นต่ำจริง 50 ft) | RVR ≥ 175 m | | [O7] p.21, 26; [O9] | สูง |
| CAT IIIB (ชั้นเก่าใน AFM) | < 50 ft (15.2 m) หรือไม่มี DH | RVR 50 ถึง < 175 m (EU ต่ำสุด 75 m) | | [O7]; [O9] | สูง |
| CAT IIIC | ไม่มี DH | ไม่จำกัด RVR | ไม่ใช้ใน EU | [O7] | สูง |

FAA ใช้ค่าในหน่วย ft ของ RVR คือ CAT I RVR 2,400 ft และ CAT II RVR 1,200 ft [O6] ซึ่งต่างจากค่า ICAO (550 m ≈ 1,800 ft และ 300 m ≈ 1,000 ft) เล็กน้อย AirfieldLab อยู่ในประเทศไทยที่ใช้ระบบ ICAO จึงควรใช้ค่าในตาราง

### ตาราง RVR ขั้นต่ำตาม DH และระบบควบคุม rollout (EASA/ICAO, ผ่าน [O7] Table 3 และ 4)

| การปฏิบัติการ | DH (ft) | เงื่อนไข | RVR ขั้นต่ำ |
|---|---|---|---|
| CAT II | 100 ถึง 120 | Cat A, B, C (Cat D ใช้ 350 m เว้นแต่ autoland/HUDLS) | 300 m |
| CAT II | 121 ถึง 140 | | 400 m |
| CAT II | 141 ถึง 199 | | 450 m |
| CAT III | 50 ถึง 99 | ไม่ต้องมี roll-out guidance | 175 m |
| CAT III | 0 ถึง 49 หรือไม่มี DH | fail-passive roll-out | 125 m (ข้อความ "ลดถึง 75 m ได้ถ้า AFM ระบุ" ผู้ตรวจไม่พบใน [O7] Table 4 จึงยืนยันไม่ได้) |
| CAT III | 0 ถึง 49 หรือไม่มี DH | fail-operational roll-out | 75 m |

### fail-passive, fail-operational และ alert height

- **fail-passive:** เมื่อเกิดความล้มเหลวหนึ่งจุด "there is no significant out-of-trim condition or deviation of flight path or attitude" แต่การลงจอดไม่ทำต่ออัตโนมัติ นักบินรับช่วง [O3] CS-AWO 300(b)(3) ใช้ได้กับ DH ไม่ต่ำกว่า 50 ft [O8] §9.2.3, [O9] slide 45 ตัวอย่างคือ A320 "CAT 3 SINGLE" และ 737 "LAND 2"
- **fail-operational:** เมื่อเกิดความล้มเหลวหนึ่งจุดต่ำกว่า AH "the approach, flare and landing can be completed by the remaining part of the automatic system" [O3] CS-AWO 300(b)(4) จำเป็นเมื่อ DH < 50 ft หรือไม่มี DH และต้องมีการควบคุมบนพื้น (rollout) ด้วย [O3] CS-AWO 304(b), [O8] §9.2.4 ตัวอย่างคือ A320/A330 "CAT 3 DUAL" และ 737 "LAND 3" (ระบบ AP สองตัวของ 737NG รุ่นใหม่ใช้ ISFD เป็นแหล่งข้อมูลท่าทางที่สามเพื่อให้เทียบเท่าสามช่อง [O23], ความเชื่อมั่นต่ำ)
- **alert height (AH):** ความสูง RA ที่กำหนดจากคุณลักษณะของเครื่องบินและระบบ fail-operational ถ้าระบบเสียเหนือ AH ต้อง go-around (หรือเปลี่ยนเป็น DH ที่สูงขึ้น) ถ้าเสียใต้ AH ให้ลงต่อ [O3] CS-AWO 300(b)(6), [O1] App 1, [O27] เอกสาร SRVSOP ระบุว่า AH โดยทั่วไป "(typically 100 ft or less above the threshold)" [O8] §11.2.5(b) p.24 ค่าตามแบบ: A320 100 ft [O28], A330 200 ft [O29] (บัตรทบทวน ความเชื่อมั่นต่ำ), 737-800 **ไม่พบในแหล่งสาธารณะ**
- **DH ใน CAT II/III** คือ "the wheel height above the runway elevation by which a go-around must be initiated" [O3] CS-AWO 300(b)(7) และอ่านจาก radio altimeter [O9] ใน simulator จึงเทียบกับ `a.hWheel` ได้โดยตรง

### การบังคับใช้ autoland

- CAT III ทุกกรณีต้องใช้ automatic landing: "Automatic landing is mandatory for all CAT III operations" [O8] §9.2.2 p.16 (ข้อยกเว้น HUD landing system ที่รับรองไม่อยู่ใน [O8] แต่มาจาก CS-AWO Issue 2 ตามที่ [O9] slide 21 กล่าวถึง; ผู้ตรวจรอบต่อแก้การอ้าง); Airbus ใช้ autoland เป็นมาตรฐานและไม่ใช้ HUD สำหรับ CAT II/III [O9] slide 21
- อุปกรณ์ขั้นต่ำ CAT III: flight control แบบซ้ำซ้อน, เครื่องรับนำทางอิสระสองชุด, radio altimeter สองชุด, ระบบตรวจจับและเตือนความล้มเหลว และ guidance สำหรับ missed approach [O8] §9.2.6
- ป้ายบน FMA ควรเป็นชื่อสมรรถนะเช่น "LAND 2", "LAND 3" ไม่ใช่ "Category II/III" [O8] §8.4.8(g) ส่วน Airbus ใช้ "CAT 2", "CAT 3 SINGLE", "CAT 3 DUAL" [O28][O30]
- autoland บนทางวิ่ง CAT I หรือบนทางวิ่ง CAT II/III ที่ไม่ได้ประกาศ LVP ทำได้ แต่ "the integrity of the LOC/GS signal is not guaranteed, hence the risk of beam fluctuations" นักบินต้องพร้อมปลด AP [O24] p.27 และ FAA ระบุว่าเมื่อเพดานเมฆ ≥ 800 ft และ/หรือทัศนวิสัย ≥ 2 SM "No critical area protective action is provided under these conditions" [O6] ¶1-1-9 k.2(b)(1)

## 3.9.3 เกณฑ์รับรอง autoland และการแปลงเป็น tolerance ของการทดสอบ

### เกณฑ์ความน่าจะเป็น (CS-AWO 131 และ AC 20-191 §5.2.9.4)

| เหตุการณ์ | ขีด | average risk | limit risk | แหล่ง |
|---|---|---|---|---|
| แตะพื้นเร็วเกิน | ก่อน 60 m (200 ft) จาก threshold | 10⁻⁶ | 10⁻⁵ | [O3] CS-AWO 131(c)(1), AMC 131 §1.4; [O2] 5.2.9.4.1; [O1] App 3 §6.3.1 |
| แตะพื้นไกลเกิน | เลย 823 m (2700 ft) "the end of the touchdown zone lighting" | 10⁻⁶ | – | [O3] 131(c)(2); [O2] 5.2.9.4.2 |
| แตะพื้นไกลเกิน (limit) | เลย 914 m (3000 ft) | – | 10⁻⁵ | [O3] AMC 131 §1.4; [O2] 5.2.9.6 (900 m; หมายเหตุผู้ตรวจรอบต่อ: §5.2.9.6 ของ FAA เป็นกรณี "rare undetected non-aircraft system error" (เช่นความคลาดของ GLS) ไม่ใช่ limit risk แบบ EASA โดยตรง และในหัวข้อนั้น bank ที่ปลายปีกแตะพื้นใช้ 10⁻⁶) |
| ด้านข้าง | ล้อหลักนอกสุดห่างแนวกลาง > 21 m (70 ft) (ทางวิ่งกว้าง 150 ft) | 10⁻⁶ | 10⁻⁵ | [O3] 131(c)(3); [O2] 5.2.9.4.3 |
| sink rate | ถึงภาระจำกัดของโครงสร้าง (วิธีหนึ่ง: sink ไม่เกิน 10 ft/s = 3.05 m/s) | 10⁻⁶ | 10⁻⁵ | [O3] 131(c)(4); [O1] App 3 §6.3.1 |
| bank | ปีก, high-lift device หรือ nacelle แตะพื้น | 10⁻⁸ (EASA ตาราง) / 10⁻⁷ (FAA) | 10⁻⁷ | [O3] AMC 131; [O2] 5.2.9.4.5; [O1] |
| lateral velocity / slip | ถึงภาระจำกัดของโครงสร้าง | 10⁻⁶ | 10⁻⁵ | [O3] 131(c)(6) |
| rollout | ล้อนอกสุดออกนอกแนวกลาง > 21.3 m (70 ft) ขณะความเร็ว > 40 kt | 10⁻⁶ | – | [O3] 338(b); [O1] App 3 §6.3.3 |
| rollout (ปกติ) | จุดกลางระหว่างล้อหลักห่างแนวกลาง > 8.2 m (27 ft) | < 5 % ต่อการลงจอด | – | [O3] 338(a) |

"Average risk" คือเมื่อทุกตัวแปร (ลม ความปั่นป่วน มวล CG ความคลาดของ ILS) กระจายตามการแจกแจงจริง ส่วน "limit risk" คือเมื่อตัวแปรหนึ่งตรึงไว้ที่ค่าแย่ที่สุด [O3] AMC AWO 131 §1.4 เกณฑ์ CAT II ของ AC 20-191 ไม่ใช่ตำแหน่งแตะพื้น แต่เป็นความสำเร็จของ approach: ใต้ 500 ft "the demonstrated probability of a successful landing should be at least 95%" และ LOC "within ±25 microamps deviation ... for 95% of the time" [O2] §4.2.9, §4.2.6.2.2

### เกณฑ์ 2σ แบบเก่า (AC 20-57A, 1971)

- "Longitudinal dispersion about the nominal point of the main landing gear touchdown should not exceed 1500 feet total" ไม่จำเป็นต้องสมมาตร และจุดแตะพื้นต้องอยู่ "at least 200 feet beyond the threshold" [O4]
- "Lateral dispersion of the aircraft centerline at the main landing gear should not exceed 27 feet either side" บนฐาน 2σ [O4]
- สภาพที่ต้องสาธิต: headwind ถึง 25 kt, tailwind ถึง 10 kt, crosswind ถึง 15 kt, ความปั่นป่วนปานกลาง และ wind shear 8 kt ต่อ 100 ft จาก 200 ft ถึงพื้น [O4]

### เกณฑ์ความสำเร็จเชิงปฏิบัติการ (ใช้ตรวจ autoland ในสายการบิน)

SRVSOP AC 91-020 และเอกสารของ Uganda CAA (ตาม EASA AMC) ใช้ชุดเดียวกัน [O8] App 3 §4(a)(1) และ §5 p.31, [O7] §4.1.3:
- จาก 500 ft ถึงเริ่ม flare ความเร็วอยู่ในช่วง ±5 kt ของค่าที่ตั้งใจ
- แตะพื้นหลังจุด 150 m จาก threshold และก่อนปลาย TDZ ที่ 750 m
- ล้อนอกสุดไม่ออกนอกขอบ TDZ; ตามสรุปของ SRVSOP: vertical speed ตอนแตะ ≤ 360 fpm (1.83 m/s), bank ≤ 7°, ความเบี่ยงระหว่าง rollout ≤ 8 m [O8] App 3 §5 p.31 (ผู้ตรวจรอบต่ออ่านข้อความตรง: "does not exceed 360ft/min", "does not exceed 7 degrees", "does not exceed 8m", "between 150m and 750m from runway threshold, assuming a normal GS antenna location"; ส่วน ±5 kt อยู่ใน App 3 §4(a)(1) ความเชื่อมั่นจึงเป็นสูง)

### ผลบินจริงที่ใช้เทียบ

| แหล่ง | เครื่อง/เงื่อนไข | จุดแตะพื้น | sink ตอนแตะ | ความเชื่อมั่น |
|---|---|---|---|---|
| NASA DIALS [O14] p.426 | TSRV ของ NASA (เอกสารเรียก "a small twin jet commercial transport" ซึ่งคือ 737-100), 10 hands-off landings จาก GS 3° และ 4.5°, flare 50 ถึง 150 ft ตาม GS (p.414) | ไม่รายงาน | เฉลี่ย −2.4 ft/s (−0.73 m/s), SD 0.7 ft/s (0.21 m/s) | สูง |
| NASA CR-3074 [O15] Table 2 | 737 TCV GS 6° (simulation) | เฉลี่ย 415.7 m จาก GPIP, SD 34.5 m | เฉลี่ย 0.665 m/s, SD 0.26 m/s | สูง (แต่ GS 6°) |
| Airbus Safety First 12 [O24] | ผู้ประกอบการยุโรป 725 autoland ใน 3 ปี | – | – | สูง: 5 ครั้งไม่สำเร็จ (99.3 %) |

### การแปลงเป็นเกณฑ์ทดสอบ Monte Carlo (ค่าประมาณ, `o_autoland.mjs` ส่วน 5)

ชุดทดสอบใน Node ทำการลงจอดได้หลักร้อยครั้ง จึงพิสูจน์ 10⁻⁶ โดยตรงไม่ได้ วิธีที่เสนอคือสมมติการแจกแจงปกติแล้วตรวจที่ค่าเฉลี่ย ± z·σ:

| ปริมาณ | เกณฑ์ | z | σ ที่ยอมได้ (ถ้าค่าเฉลี่ยอยู่ตรงกลาง) |
|---|---|---|---|
| ระยะแตะพื้น s_TD | 60 m < μ ± 4.753σ < 823 m | z(10⁻⁶) = 4.753 | σx ≤ 80.3 m เมื่อ μ = 441.5 m |
| ระยะแตะพื้น (AC 20-57A) | 4σ ≤ 457 m (1500 ft) | 2 ต่อด้าน | σx ≤ 114.3 m |
| ตำแหน่งขวาง (ล้อนอกสุด 21.3 m, ยางครึ่งกว้าง 0.3 m ค่าประมาณ) | \|μ\| + 4.753σ ≤ 21.3 − track/2 − 0.3 | 4.753 | 737: 3.82 m, A320: 3.62 m, A330: 3.29 m, ATR: 3.99 m |
| ตำแหน่งขวาง (AC 20-57A) | 2σ ≤ 8.23 m | 2 | σy ≤ 4.11 m |
| sink | μ + 4.753σ ≤ 3.048 m/s | 4.753 | σ ≤ 0.481 m/s เมื่อ μ = 0.76 m/s |
| bank ถึงมุมแตะพื้นของปีก/nacelle | μ + 5.199σ ≤ φ_clear | z(10⁻⁷) = 5.199 | ใช้มุม clearance จากหัวข้อ 5 (`airframe.geometry.clearances`) |

z ของ 10⁻⁵, 10⁻⁷, 10⁻⁸ คือ 4.265, 5.199, 5.612 (คำนวณด้วย rational approximation ของ Acklam ในสคริปต์) ฐานล้อหลัก (track) จากหัวข้อ 5: 737-800 5.715 m, A320 7.6 m, A330 10.7 m, ATR 4.1 m [O38]

## 3.9.4 สัญญาณ ILS ที่ autopilot ใช้: dot, µA และความกว้างที่ดอนเมือง

**ความไวของสัญญาณ** LOC เต็มสเกล (150 µA) เท่ากับ DDM 0.155 และ GS เต็มสเกล (150 µA) เท่ากับ DDM 0.175 [O10] §1.2.1 ถึง 1.2.2 p.5 ถึง 6 (ขั้นตอนทดสอบตั้ง DDM แล้วตรวจว่าเข็มเต็มสเกล 150 µA; เครื่องมืออ่านสองรอบให้เลขหน้า 5 และ 6 ต่างกัน; [O10] ไม่มีค่า 0.0875 DDM หรือ 0.12θ ส่วนความสัมพันธ์นี้ผู้ตรวจรอบต่อยืนยันจากแบบจำลองสัญญาณของ EASA [O43] §2.1.4: "the angular displacement from the nominal glide path for 0.0875 DDM has the value of 0.12 θ" ซึ่งเท่ากับครึ่งของ 0.175 DDM เต็มสเกล) จอ PFD ของเครื่องบินโดยสารมี 2 dot ต่อข้าง จึงให้ 1 dot = 75 µA (ค่าประมาณจากความสัมพันธ์นี้ ซึ่งสอดคล้องกับเกณฑ์เตือน "LOC deviation > 1/4 dot" ในโหมด LAND [O30] และกับคำอธิบายของ Airbus ว่าไฟเตือนติดเพราะ "the LOC deviations were more than 20microA in LAND mode" [O24] p.28 (บทความไม่ได้ประกาศ 20 µA เป็นค่าเกณฑ์): 1/4 dot = 18.75 µA)

**ความกว้าง LOC** ปรับให้กว้าง 210 m ที่ threshold (ระบบที่ไม่จัดประเภทใช้ 5°) [O11] p.3-1 หรือ 700 ft (213 m) ตาม FAA [O6] ครึ่งความกว้าง 105 m ตรงกับ 150 µA ดังนั้นมุมครึ่งความกว้าง = atan(105 m / ระยะ LOC ถึง threshold)

**ความกว้าง GS** ลำแสงกว้าง 1.4° ในแนวดิ่ง [O6] (ICAO/EASA: 0.0875 DDM หรือ 75 µA ที่ 0.12θ = 0.36° ที่ 3° [O43]; CASA ให้ 1° ถึง 1.5° [O11]) จึงได้ 1 dot ≈ 0.35° ถึง 0.36° โค้ดปัจจุบันใช้ `gsDot = 0.35` ซึ่งอยู่ในช่วงนี้

| ทางวิ่ง | ระยะ LOC ถึง THR (m) | ความกว้างที่คำนวณ | AIP | 1 dot (2-dot PFD) | µA ต่อองศา | GP origin (RDH/tan 3°) | ที่มา |
|---|---|---|---|---|---|---|---|
| 21R (IBKK, CAT II) | 3700 + 301.8 = 4001.8 | 3.01° | 3.0° | 0.751° | 99.8 | 314.1 m | `o_autoland.mjs` ส่วน 1, AIP [O36][O37] |
| 03L (IBKD, CAT I) | 3700 + 314.0 = 4014.0 | 3.00° | 3.0° | 0.749° | 100.1 | 319.9 m | เหมือนกัน |
| 21L (IDMG, CAT I) | 3150 + 232.6 = 3382.6 | 3.56° | 3.6° | 0.889° | 84.4 | 308.2 m | เหมือนกัน |

1/4 dot ที่ threshold เท่ากับ 13.1 m ทุกทางวิ่ง (เพราะทุกทางวิ่งปรับให้ 210 m ที่ threshold) ค่า `FIELD.locDot = 0.91` ในโค้ด (บรรทัด 12 และ 27) ใกล้ 21L แต่กว้างกว่า 21R/03L ราว 21 % ควรคำนวณต่อทางวิ่งจาก `locDist` ที่มีอยู่แล้ว (`RWY_END[id].locDist`) ด้วยสูตร atan(105/locDist)/2

**ความแม่นของการติดตาม (สำหรับทดสอบ):** AC 20-191 §4.2.6.2.2 ให้ LOC อยู่ใน ±25 µA ในเวลา 95 % ช่วง 300 ft ถึง 100 ft HAT สำหรับ CAT II [O2] เท่ากับ ±1/3 dot หรือ ±0.25° บน 21R (ค่าคำนวณ) ส่วนการเตือน AUTOLAND ของ Airbus ใต้ 200 ft: LOC เบี่ยงเกิน 1/4 dot เหนือ 15 ft, GS เบี่ยงเกิน 1 dot เหนือ 100 ft, สูญ LOC เหนือ 15 ft, สูญ GS เหนือ 100 ft, RA สองตัวต่างกันเกิน 15 ft [O30]

**สัญญาณรบกวนและ critical area:** ในเหตุการณ์ที่สิงคโปร์ (Case Two ของบทความ, "SIN RWY 02L (CAT II RWY)"; บทความไม่ระบุแบบเครื่อง ผู้ตรวจรอบต่อแก้จาก "A340") LOC เพี้ยนตั้งแต่ราว 300 ft RA ถึง −137 µA และ +36 µA จนไฟเตือน AUTO LAND สีแดงติดที่ราว 200 ft [O24] p.28 ข้อมูลนี้ใช้สร้างฉาก "beam bend" ในโหมดฝึกได้ (ค่าประมาณ: สัญญาณรบกวน 30 ถึง 140 µA ที่ความสูง 300 ft ลงมา)

## 3.9.5 Boeing 737-800: AFDS และ autothrottle

แหล่งหลักของส่วนนี้คือสรุประบบ Automatic Flight ของ Smartcockpit ที่เรียบเรียงจาก FCOM ของ 737-300 ถึง -900 [O19] (ความเชื่อมั่นกลาง เพราะไม่ใช่ FCOM ตรงและบางส่วนเป็นของรุ่น Classic) ร่วมกับหน้าข้อจำกัดของ b737.org.uk [O20] และรายงานอุบัติเหตุ TK1951 [O16][O17][O18] Boeing ไม่เผยแพร่ FCOM สู่สาธารณะ (สำเนา FCOM ของ MALEV [O21] อ่านได้เฉพาะส่วนต้น)

### โหมด

| กลุ่ม | โหมด (FMA) | เงื่อนไขสำคัญที่ใช้ในการจำลอง | แหล่ง | ความเชื่อมั่น |
|---|---|---|---|---|
| AP | CMD A, CMD B, CWS A/B | AP ห้าม engage สำหรับ takeoff ต่ำกว่า 400 ft AGL (NG); CWS: ใต้ 150 ft RA ที่ gear down ไม่ทำ wings level; ปล่อยคันที่ bank ≤ 6° แล้วกลับ wings level; ปล่อยคันภายใน 250 ft จากความสูงที่เลือกแล้ว capture | [O20][O19] | กลาง |
| lateral | HDG SEL, LNAV, VOR/LOC, (APP = LOC + G/S), TO/GA, ROLLOUT (ถ้ามี) | LNAV capture ภายใน 3 NM ของ leg, intercept ≤ 90°; LOC capture "not later than 1/2 dot"; ROLLOUT เฉพาะเครื่องที่ติดตั้ง rollout guidance | [O19] | กลาง |
| vertical | LVL CHG, V/S, VNAV (SPD/PTH), ALT HOLD, ALT ACQ, G/S, FLARE, TO/GA | G/S capture ที่ 2/5 dot และไม่ capture ก่อน LOC; V2 + 20 (ผู้ตรวจพบใน [O19] p.12 เฉพาะบริบท F/D takeoff ว่า "If engine failure occurs at or above V2+20, V2+20 is the commanded speed" ไม่พบข้อความเรื่อง LVL CHG ตั้ง V2 + 20 จึงยืนยันไม่ได้); ความเร็วต่ำกว่าที่เลือกบน MCP เกิน 5 kt และไม่เพิ่มขึ้น ขณะอยู่ในโหมด V/S ทำให้เปลี่ยนเป็น LVL CHG ([O19] p.21 performance limit reversion; ผู้ตรวจรอบต่อเพิ่มเงื่อนไขโหมด) | [O19] | กลาง |
| A/T | N1, SPD (MCP SPD), FMC SPD, RETARD, ARM, THR HLD, GA | THR HLD ที่ 64 หรือ 84 kt ตามรุ่นคอมพิวเตอร์ (NG ค้างถึง 800 ft RA); RETARD ที่ 27 ft RA หรือ 2.5 s หลัง FLARE; ARM เมื่อ A/T engage แต่ไม่สั่ง; N1 equalization ≤ 8° ของคันเร่ง; A/T ปลดถ้าคันเร่งต่างกันเกิน 10° ระหว่าง dual channel หลัง FLARE armed | [O19][O16] | กลาง |
| GA | TO/GA (F/D และ A/P) | A/T GA armed เมื่อต่ำกว่า 2000 ft RA; กดครั้งแรกได้ "reduced go-around N1" กดครั้งที่สองได้ full GA N1; A/P GA เริ่มสั่ง pitch 15° nose up; F/D GA เครื่องยนต์เดียว 13°; ALT ACQ ได้ที่อย่างน้อย 1000 ft เหนือจุดเริ่ม GA | [O19] | กลาง |
| takeoff F/D | TO/GA | เริ่มที่ 10° nose down แล้วที่ 60 kt IAS เปลี่ยนเป็น 15° nose up; เหนือ 400 ft RA ยกเลิกได้ด้วยการเลือกโหมด pitch อื่นหรือ engage AP ส่วนใต้ 400 ft RA ต้องปิด F/D ทั้งสอง ([O19] p.12) | [O19] | กลาง |

### ลำดับ autoland (dual channel)

| ลำดับ | ความสูง RA | เงื่อนไข / การกระทำ | แหล่ง | ความเชื่อมั่น |
|---|---|---|---|---|
| 1 | ใต้ 1500 ft (457 m) | หลัง LOC และ G/S capture, AP ตัวที่สอง engage; FLARE (และ ROLLOUT ถ้ามี) แสดงเป็น armed | [O19] | กลาง |
| 2 | ก่อน 800 ft (244 m) | AP ตัวที่สองต้อง engage ก่อน 800 ft มิฉะนั้นเป็น single channel ("1 CH": ไม่มี autoflare และไม่มี A/P go-around, AP ห้ามอยู่ต่ำกว่า 50 ft) | [O19][O20] | กลาง |
| 3 | 400 ft (122 m) | stabilizer trim nose up อัตโนมัติ (เตรียมแรงดึงสำหรับ flare และกันการก้มเมื่อ AP ปลด) | [O19] | กลาง |
| 4 | ราว 350 ft (107 m) | ถ้า FLARE ยังไม่ armed AP ทั้งสองปลด | [O19] | กลาง |
| 5 | ราว 50 ft (15.2 m) | FLARE engage (NG trim nose up เพิ่มอีกที่ 50 ft); flare ทำต่อเนื่องถึงแตะพื้น | [O19] | กลาง |
| 6 | 27 ft (8.2 m) หรือ 2.5 s หลัง FLARE | A/T เข้า RETARD และลดคันเร่ง "so as to reach idle at touchdown" | [O19][O16] | กลาง (สูงสำหรับ 27 ft จาก DSB) |
| 7 | แตะพื้น | รุ่นที่ไม่มี rollout: AP ต้องปลดด้วยมือ; รุ่นที่มี rollout: ROLLOUT ตาม LOC | [O19][O23] | กลาง |
| 8 | ราว 2 s หลังแตะ | A/T ปลดอัตโนมัติ | [O19] | กลาง |

**บทเรียนจาก TK1951 (737-800 TC-JGE, 25 FEB 2009):** radio altimeter ซ้ายแสดง −8 ft ขณะบินจริงที่ราว 1950 ft (รายงานเบื้องต้น [O17] p.2: "At approximately 1950 feet the recorded value suddenly changed to -8 feet"; ผู้ตรวจรอบต่อยืนยัน ส่วนหน้า code7700 ปัดเป็น "2000 feet") A/T จึงเข้า "retard flare" เพราะ "a radio height less than 27 feet" เป็นเงื่อนไขหนึ่ง ลูกเรือบิน approach แบบ single channel ด้วย AP ขวา (CMD B) แต่ A/T ใช้ RA ซ้าย ความเร็วลดจาก 144 kt ที่ราว 750 ft ถึงราว 110 kt ที่ต่ำกว่า 500 ft และ stick shaker ทำงานที่ราว 460 ft [O16][O17][O18] ใน simulator ควรจำลอง RA สองชุดและให้ A/T เลือกแหล่ง RA ตามตรรกะนี้ได้ (ฉากความล้มเหลว "RA fault") Boeing เพิ่มข้อความใน DDG ปี 2004 ว่าเมื่อ RA เสีย "an autopilot or autothrottle must not be used during approach and landing" [O18]

### ความสามารถและข้อจำกัด

| รายการ | ค่า | แหล่ง | ความเชื่อมั่น |
|---|---|---|---|
| all-weather capability (TCDS) | "Cat 3" | [O22] | สูง |
| fail-operational (LAND 3) | ไม่มี DH, RVR 75 m (ผู้ประกอบการหนึ่ง) | [O23] | ต่ำ |
| fail-passive (LAND 2) | DH 50 ft, RVR 125/75/75 m (TDZ/MID/ROLLOUT) | [O23] | ต่ำ |
| alert height | ไม่พบในแหล่งสาธารณะ | – | – |
| ลม autoland (dual channel CAT II/III) | headwind 25 kt, crosswind 25 kt, tailwind 0 ถึง 15 kt ตามความสูงสนามและแฟลป | [O20] | กลาง |
| crosswind autoland (FCOM MALEV) | 20 kt (ค่าที่เลือกใช้ใน JSON เพราะมาจากสำเนา FCOM และระมัดระวังกว่า) | [O21] (ผ่านหัวข้อ 2) | กลาง |
| มุม GS | 2.5° ถึง 3.25° | [O20] | กลาง |
| แฟลปและเครื่องยนต์ | flaps 30 หรือ 40 และเครื่องยนต์ทำงานทั้งสอง | [O20] | กลาง |
| AP หลัง takeoff | ไม่ต่ำกว่า 400 ft AGL | [O20] | กลาง |
| single channel | AP ห้ามอยู่ต่ำกว่า 50 ft AGL ระหว่าง approach | [O20] | กลาง |

## 3.9.6 ตระกูล A320 และ A330: FMGS/AFS และ A/THR

### โหมด

ชื่อโหมดตามเอกสารโครงการ FlyByWire [O31] และ enum ในซอร์สโค้ด A32NX v0.10.0 [O32] (ชื่อตรงกับ FMA ของจริงตามที่ผู้พัฒนาจำลอง; ความเชื่อมั่นกลาง):

| กลุ่ม | โหมด | เงื่อนไขที่หาได้ | แหล่ง |
|---|---|---|---|
| lateral | RWY, RWY TRK, NAV, HDG/TRK, LOC*, LOC, LAND, FLARE, ROLL OUT, GA TRK | NAV engage ได้ที่ RA ≥ 30 ft; RWY arm อัตโนมัติเมื่อ V2 ≥ 90 kt, แฟลป ≥ 1, คันเร่งตัวใดตัวหนึ่ง ≥ FLX/MCT (TLA ≥ 35° ในโมเดล FBW ไม่ใช่ CL) และ LOC เบี่ยง ≤ 0.4° (โมเดล FBW `AutopilotStateMachine.cpp` บรรทัด 514 ถึง 519) | [O32] |
| vertical | SRS (TO/GA), CLB, DES, OP CLB, OP DES, ALT*, ALT, ALT CST*, ALT CST, V/S, FPA, G/S*, G/S, FINAL APP, LAND, FLARE, ROLL OUT, EXP, TCAS | – | [O31][O32] |
| A/THR | SPEED, MACH, THR CLB, THR IDLE, THR LVR, THR MCT, MAN TOGA, MAN FLX, MAN MCT, MAN THR, A.FLOOR, TOGA LK, ข้อความ THR LK, LVR CLB, LVR MCT, LVR ASYM | alpha floor ใช้ค่า α ของหัวข้อ 8 (`controls.fbw.protections.alpha_floor`) และทำงานจาก liftoff ถึง 100 ft RA ขาลง (ช่วงนี้มาจากหัวข้อ 8 `alpha_floor_logic` ที่อ้าง [Z8][Z22][Z26] ไม่ใช่จาก [O32]: `Autothrust.cpp` v0.10.0 รับ `alpha_floor_condition` สำเร็จรูปจาก FAC ผ่าน `FlyByWireInterface.cpp` บรรทัด 2454 ถึง 2456; ผู้ตรวจรอบต่อแก้การอ้าง); TOGA LK หลัง A.FLOOR; THR LK เมื่อปลด A/THR ขณะทำงาน | [O32], หัวข้อ 8 |
| AP engage | AP1, AP2 | หลัง takeoff ที่ "100 feet AGL and at least 5 seconds after liftoff" | [O28][O32][O29] |

**การ capture ในโมเดลเปิด FBW** (ไม่ใช่ค่าของ Airbus ความเชื่อมั่นต่ำถึงกลาง): LOC* เมื่อ \|ε_LOC\| < 1.92° (2.56 dot บน 21R; หรือเมื่อข้ามแนวด้วยมุมตัด > 25°); LOC (track) เมื่อ \|ε\| < 0.16° ต่อเนื่อง; G/S* เมื่อ LOC*/LOC แล้ว, ε_GS ≥ −0.1° และ \|ε_GS\| < 0.1333° (0.37 dot) [O32] เทียบกับ 737 ที่ LOC capture ไม่ช้ากว่า 1/2 dot และ G/S ที่ 2/5 dot [O19] (`o_modes.mjs` ส่วน 4)

### ลำดับ autoland ของ A320

| ลำดับ | ความสูง RA | เงื่อนไข / การกระทำ | แหล่ง | ความเชื่อมั่น |
|---|---|---|---|---|
| 1 | – | APPR กด: LOC และ G/S arm; ทั้งสอง AP engage สำหรับ CAT 3 DUAL; A/THR ใน SPEED (selected หรือ managed) | [O28] | กลาง |
| 2 | 400 ft (122 m) | "LAND mode automatically engages when the LOC and G/S modes are engaged, and the aircraft is below 400 ft RA." (โมเดล FBW รอ 1.2 s หลังผ่าน 400 ft จึงขึ้นที่ราว 386 ft สำหรับ V/S 709 fpm) | [O26][O32] | กลาง |
| 3 | ก่อน 350 ft (107 m) | FMA ต้องแสดง LAND ไม่เช่นนั้นถือว่าระบบไม่พร้อม | [O30] | กลาง |
| 4 | ใต้ 200 ft (61 m) | ไฟเตือน AUTOLAND ติดเมื่อ: AP ทั้งสองเสีย, LOC เบี่ยง > 1/4 dot (เหนือ 15 ft), GS เบี่ยง > 1 dot (เหนือ 100 ft), สูญ LOC/GS, RA ต่างกัน > 15 ft → go-around | [O30][O24] | กลาง |
| 5 | AH 100 ft (30.5 m) | CAT 3 DUAL: ความล้มเหลวใต้ AH ไม่ทำให้ต้อง go-around | [O28][O3] | กลาง |
| 6 | ราว 40 ft (12.2 m) | FLARE (ไม่ขึ้น → go-around); โมเดล FBW เริ่มเมื่อ h ≤ \|V/S\|/15 ใน ft (คือ time-to-go 4 s) ในช่วง 45 ถึง 60 ft | [O30][O32] | กลาง (เวลา), ต่ำ (สูตร) |
| 7 | ราว 30 ft (9.1 m) | thrust idle (FMA "THRUST IDLE" ในคำอธิบาย FBW; A340 จริง "At 30 ft, ALIGN and RETARD modes engaged") | [O30][O24] | กลาง |
| 8 | 20 ถึง 10 ft (6.1 ถึง 3.0 m) | decrab แก้มุม crab | [O30] | กลาง |
| 9 | 10 ft (3.0 m) | เสียงเรียก "RETARD" ใน autoland ให้นักบินดึงคันเร่งไป idle [O30] (ลงด้วยมือเรียกที่ 20 ft และเป็น "a reminder, not an order" [O25][O42]) | [O30][O25] | กลาง |
| 10 | แตะพื้น | ROLL OUT (ตาม LOC บนพื้น) | [O26][O30] | กลาง |
| 11 | taxi speed | ปลด AP | [O30] | กลาง |

### ความสามารถและข้อจำกัด

| รายการ | A320 family | A330-300 | แหล่ง (A320 / A330) | ความเชื่อมั่น |
|---|---|---|---|---|
| CAT 2 | DH ≥ 100 ft, AP ≥ 1 ใน APPR | (เช่นเดียวกัน) | [O28] / – | กลาง |
| CAT 3 SINGLE (fail-passive) | DH ≥ 50 ft, AP ≥ 1 + A/THR | DH 50 ft | [O28] / [O29] | กลาง / ต่ำ |
| CAT 3 DUAL (fail-op) | AP ทั้งสอง + A/THR, DH ≥ 20 ft หรือไม่มี DH, RVR ≥ 75 m | DH 20 ft, RVR 75 m | [O28][O30] / [O29] | กลาง / ต่ำ |
| alert height | 100 ft | 200 ft | [O28] / [O29][O27] | กลาง / ต่ำ |
| ลมสูงสุด autoland | HW 30, XW 20, TW 10 kt | HW 35, XW 20, TW 10 kt | [O28][O30] / [O29] | กลาง / ต่ำ |
| มุม GS | −2.5° ถึง −3.15° [O28] (FBW docs: −3.25° [O30]) | −2.5° ถึง −3.25° | [O28][O30] / [O29] | กลาง |
| ความสูงสนาม | ≤ 9,200 ft (บางทะเบียน ≤ 2,500 ft) | ≤ 9,200 ft | [O28] / [O29] | กลาง |
| น้ำหนัก | ≤ MLW (FBW docs: ≥ 44,000 kg) | – | [O28][O30] | กลาง |
| เครื่องยนต์ดับ | – | CAT 2 และ CAT 3 SINGLE อนุมัติใน CONF 3 | – / [O29] | ต่ำ |
| AP minimum use height | ILS CAT I 160 ft; FINAL APP/V/S/FPA 250 ft; circling 500/600 ft; หลัง manual GA 100 ft; อื่น ๆ 500 ft | ILS CAT I 160 ft; NPA ถึง MDA | [O28] / [O29] | กลาง |
| ลมเกินขีด | ทำได้เพียง "CAT I automatic approach without autoland" | – | [O28] | กลาง |

A320neo, A321ceo และ A321neo ใช้ค่า AFCS ของ A320ceo ผ่าน `_inherits` ที่หัวข้อ 3 กำหนดไว้ [O39] ความต่างที่รู้คือ flare law ตอนบินด้วยมือของ A321 (หัวข้อ 8) ไม่ใช่ autoland ส่วนตัวเลข autoland เฉพาะ A321 **ไม่พบในแหล่งสาธารณะ**

## 3.9.7 ATR 72-600: AFCS โดยไม่มี autothrottle

| รายการ | ค่า | แหล่ง | ความเชื่อมั่น |
|---|---|---|---|
| โหมด lateral | HDG SEL, heading hold (โหมดสำรอง), NAV, LOC (และ APP ที่ arm LOC + G/S) | [O33] | กลาง |
| โหมด vertical | IAS, VS, pitch hold (โหมดสำรอง), ALT SEL (arm อัตโนมัติ), G/S, GA; ตั้งแต่ Standard 2 มี VNAV coupled กับ AP | [O33][O34] | กลาง |
| autothrottle | ไม่มี ("Power must be adjusted to the new condition") | [O33] | กลาง |
| autoland | ไม่มี (AP ปลดที่ DH แล้วนักบินลงเอง) | [O33] | กลาง |
| AP บนพื้น | "AP and YD cannot be engaged on ground" | [O33] | กลาง |
| AP หลัง takeoff | "12 seconds after lift-off, AP may be engaged" (ราว 400 ft AGL ตาม temporary certification) | [O33] | กลาง |
| CAT 2 | "CAT 2 approaches are flown with AP + FD ON"; ที่ 800 ft RA ตรวจ dual coupling; ที่ DH เรียก "LANDING" แล้วปลด AP (ผู้ตรวจอ่านตาราง CAT 2 ใน FCOM 2.02.04 p.10 ถึง 11: "Visual at DH 80 ft RA" แล้วเรียก "80" และ "50" จึงเป็นค่า DH ตัวอย่างที่อ่านจาก RA ไม่ใช่ความสูงปลด AP ต่ำสุด; 12 s ≈ 400 ft AGL ("Temporary certification, 12 seconds equals to approximately 400 feet AGL at take off") อยู่ใน 2.02.04 p.4 หรือ p.5 เพราะข้อความที่แปลงจาก PDF ไม่แสดงหัวหน้าชัด) | [O33] | กลาง |
| ลม CAT 2 ที่สาธิต | headwind 29 kt, tailwind 10 kt, crosswind 17 kt | [O33] | กลาง |
| LPV/RNP | LPV ต่ำถึง 200 ft, RNP AR 0.3 (Standard 2, NOV 2014) | [O34] | สูง |
| GA | ปลด AP แล้วตาม FD ("Rotate to GO AROUND pitch attitude" 2.02.04 p.7); windshear GA 10° ("Initiate a normal go around procedure with 10° pitch" 2.02.08 p.22) | [O33] | กลาง |
| AP minimum height บน ILS CAT I | ไม่พบในแหล่งสาธารณะ | – | – |

ATR ไม่ค่อยบินที่ DMK (ราว 1 % ของเที่ยวบิน ค่าประมาณจากรอบที่ 5 [O37]) ใน simulator ให้ AFCS ของ ATR มีเฉพาะ LOC/G/S coupling และปลดที่ DH (ค่าเริ่มต้น 21R CAT II DH 100 ft) แล้วให้ผู้เล่นทำ flare เอง และเพราะไม่มี A/T ให้ใช้ระบบ assist เดิมของ AirfieldLab (`PilotLaws` + autoThr) เป็นตัวเลือกช่วยฝึกที่ไม่สมจริงและติดป้ายไว้

## 3.9.8 ลำดับเหตุการณ์บน 21R ของดอนเมือง (ค่าประมาณ)

ตารางนี้วางความสูงของแต่ละเหตุการณ์บนเส้นทางล้อหลักของแต่ละแบบที่ glide path 3° ของ 21R (RDH 54 ft, GP origin 314.1 m) โดยใช้ระยะแนวดิ่งจาก ILS beam ถึงเส้นทางล้อ H ของหัวข้อ 5 (737-800W 4.24 m, A320ceo 4.88 m, A330-300 8.56 m, ATR 2.3 m ค่าประมาณ) [O38] ล้อจึงผ่าน threshold ที่ 12.2 m (40 ft), 11.6 m (38 ft), 7.9 m (26 ft) และ 14.2 m (46 ft) ตามลำดับ และเส้นทางล้อแตะระนาบทางวิ่ง (wheel GPI) ที่ s = 233, 221, 151 และ 270 m (`o_autoland.mjs` ส่วน 2)

| เหตุการณ์ | 737-800 | s (m) | A320 | s (m) | A330 | s (m) |
|---|---|---|---|---|---|---|
| FLARE/ROLLOUT armed, AP2 | 1500 ft (457 m) | −8491 | – | – | – | – |
| ต้องมี dual AP | 800 ft (244 m) | −4420 | – | – | – | – |
| stab trim / LAND | 400 ft (122 m) | −2093 | 400 ft | −2105 | 400 ft | −2176 |
| FLARE ไม่ armed → ปลด / ต้องเห็น LAND | 350 ft (107 m) | −1802 | 350 ft | −1815 | 350 ft | −1885 |
| AUTOLAND warning เริ่ม | – | – | 200 ft (61 m) | −942 | 200 ft | −1012 |
| AH / DH CAT II | DH 100 ft (30.5 m) | −348 | AH 100 ft | −361 | AH 200 ft (61 m) | −1012 |
| FLARE | 50 ft (15.2 m) | −58 | 47.3 ft (14.4 m)* | −54 | 49.5 ft (15.1 m)* | −137 |
| RETARD / thrust idle | 27 ft (8.2 m) | +76 (ideal flare: +110) | 30 ft (9.1 m) | +46 (ideal flare: +64) | 30 ft | −24 (ideal flare: −1) |
| เสียง "RETARD" | – | – | 10 ft (3.0 m) | +163 (ideal flare: +285) | 10 ft | +93 (ideal flare: +228) |
| แตะพื้น (flare ideal / lag 1 s) | | 535 / 408 | | 488 / 377 | | 440 / 320 |

\* ความสูง flare ตามสูตรโมเดล FBW ที่ V/S 709 fpm (133.6 kt) และ 743 fpm (140 kt) ค่า s ของ "RETARD" และ "แตะพื้น" ในวงเล็บคำนวณจากการจำลอง flare ไม่ใช่เส้นตรง 3° เพราะหลังเริ่ม flare เครื่องอยู่สูงกว่าเส้นทางเดิม ความเร็วพื้นคงที่ 142.1 kt (737, VREF30 + 5 ที่ 60 t ตามหัวข้อ 2), 133.6 kt (A320 VAPP ตามหัวข้อ 3) และ 140 kt (A330 ค่าประมาณ ยังไม่มีค่าจากหัวข้อ 4) ไม่มีลม

## 3.9.9 กฎควบคุมที่เสนอสำหรับ simulator

ผู้ผลิตไม่เผยแพร่ gain ของ autopilot เครื่องบินโดยสาร หัวข้อนี้จึงให้ (ก) โครงสร้างและเกณฑ์ที่มาจากเอกสาร (ข) ค่าตัวเลขที่ได้จากสิทธิบัตร งานวิจัย NASA และโมเดลเปิด และ (ค) ค่าที่ผู้เขียนเลือกเอง ซึ่งติดป้าย **ค่าประมาณ** ทุกค่า แล้วให้ชุดทดสอบเป็นตัวตัดสินว่าค่าที่ปรับแล้วผ่านเกณฑ์ใน 3.9.3 หรือไม่

### โครงสร้าง

```
AFCS.update(dt)
  modeManager   : arm/engage ตาม afcs.modes + afcs.autoland (RA, dot, เวลา, WOW, จำนวน AP, ลม)
  ilsReceiver   : ε_LOC, ε_GS (องศา) จากตำแหน่งสายอากาศ GS (หัวข้อ 5) → dot, µA (+ สัญญาณรบกวนตามฉาก)
  lateral guid. : HDG/TRK → φ_cmd ; LOC* → LOC → (LAND) → ALIGN → ROLL OUT (rudder/nosewheel)
  vertical guid.: ALT/VS/FPA/SPD → γ_cmd ; G/S* → G/S → (LAND, GS freeze) → FLARE (ḣ_cmd) → derotation
  autothrust    : SPEED/MACH (PI + ความเร่ง) → RETARD/THR IDLE → ปลด (737) / รอคันเร่ง idle (Airbus)
  inner loops   : ของเดิมใน Autopilot.update (φ → δa, γ/θ → δe, β → δr) จนกว่าจะมีกฎรายแบบจากหัวข้อ 7, 8
```

### LOC และ GS tracking

**ตัวรับ ILS:** ε_LOC = มุมที่สายอากาศ LOC ระหว่างแนวทางวิ่งกับเครื่องบิน (โค้ดคำนวณ `locAng` อยู่แล้ว) แต่ต้องใช้ตำแหน่งสายอากาศ GS ของเครื่องบิน (หัวข้อ 5 งาน P1) แล้วแปลงเป็น dot ด้วย `locDot = atan(105/locDist)/2` (3.9.4) และ µA = 75·dot ส่วน GS ใช้ `gsDot = 0.36°` (ICAO 0.12θ) หรือ 0.35° (FAA 1.4°/4) ค่าใดก็ได้ในช่วงนี้

**LOC law (คงรูปของโค้ดเดิมแต่ป้อนด้วยสัญญาณ ILS):**

y = D_LOC·tan(ε_LOC) (D_LOC = ระยะแนวราบจากเครื่องบินถึงสายอากาศ LOC ไม่ใช่ `locDist`; y บวกเมื่ออยู่ขวาของแนวกลางตาม `RWY_END[id].r`),  ẏ_cmd = clamp(−y/T_y, ±0.3·V_g),  χ_cmd = χ_rwy + asin(ẏ_cmd/V_g),  φ_cmd = clamp(atan(V·(χ_cmd − χ)/(g·T_χ)), ±φ_max(h))

| พารามิเตอร์ | ค่าที่เสนอ | ที่มา | est |
|---|---|---|---|
| T_y | 8 s | โค้ดปัจจุบัน (บินผ่านการทดสอบ autoland 94 ถึง 100 คะแนน) [O40] | ใช่ |
| T_χ | 3 s | โค้ดปัจจุบัน [O40] | ใช่ |
| φ_max | 25° เหนือ 1500 ft, 15° ใต้ 1500 ft, 5° ใต้ 50 ft | ค่าเลือกเอง; 5° อ้างแนวของ NASA CR-3074 ที่จำกัด roll ของ decrab ไว้ 5° [O15] | ใช่ |
| ตัวกรอง ε_LOC | first-order 0.5 s | เลือกเอง เพื่อให้ฉาก beam noise ไม่ทำให้ bank กระตุก | ใช่ |
| LOC* engage | \|ε\| < 1.92° (หรือ ≤ 2.5 dot) | โมเดล FBW [O32] | ใช่ (ไม่ใช่ค่าผู้ผลิต) |
| LOC (track) | \|ε\| < 0.16° นาน 2 s | FBW [O32] (เวลา 2 s เลือกเอง) | ใช่ |
| 737 LOC capture | ไม่ช้ากว่า 1/2 dot (0.376° บน 21R) | [O19] | ไม่ |

**GS law:**

Δh = D_GP·tan(ε_GS) (D_GP ระยะแนวราบถึงสายอากาศ GP), γ_cmd = −γ_GS − clamp(K_h·Δh, ±0.05 rad)

K_h = 0.0028 rad/m ตามโค้ดเดิม เทียบเท่าค่าคงเวลา 1/(V·K_h) ≈ 5.1 s ที่ 70 m/s (ค่าประมาณ) G/S* engage เมื่อ LOC capture แล้วและ \|ε_GS\| < 0.1333° (FBW [O32]) หรือ 2/5 dot = 0.144° (737 [O19]) ใต้ 100 ft (30.5 m) ให้ "GS freeze" คือคง γ ที่ค่าเฉลี่ยของ 2 s สุดท้ายแทนการใช้ beam เพราะ Airbus หยุดตรวจการสูญ GS ใต้ 100 ft [O30] และ beam ใกล้สายอากาศไม่น่าเชื่อถือ (ค่าเลือกเอง)

### flare law

รูปทั่วไป (สิทธิบัตร Boeing 4,354,237 [O13]): ḣ_cmd = −(h + h_B)/τ ซึ่งให้ h(t) = (h_F + h_B)·e^(−t/τ) − h_B เมื่อติดตามได้สมบูรณ์ เวลา flare = τ·ln((h_F + h_B)/h_B) และ sink ตอนแตะพื้น = h_B/τ เงื่อนไขต่อเนื่องที่จุดเริ่ม flare คือ (h_F + h_B)/τ = V_G·tan γ_GS

| แบบ | h_F | τ | h_B (หรือ sink เป้า) | ที่มา | est |
|---|---|---|---|---|---|
| 737-800 | 50 ft (15.24 m) คงที่ทุกความเร็ว | τ = (h_F + h_B)/(V_G·tan γ) (การประดิษฐ์ในสิทธิบัตร: ทำให้ V_G·τ คงที่) = 4.93 s ที่ 142.1 kt | 12 ft (3.66 m) → sink 0.74 m/s (146 fpm) | h_F จาก [O19]; รูปกฎและ h_B จาก [O13] | ใช่ (รวมกันเอง) |
| A320 family | clamp(\|ḣ\|·4 s, 45 ft, 60 ft) = 47.3 ft ที่ 709 fpm | τ = h_F/(\|ḣ_F\| − 0.762 m/s) = 5.07 s ที่ 133.6 kt | sink เป้า 2.5 ft/s (0.762 m/s) (เท่ากับ h_B = 0.762·τ ≈ 3.9 m) | โมเดล FBW [O32]; ข้อความ "FLARE ราว 40 ft" [O30] | ใช่ |
| A330-300 | เหมือน A320 (49.5 ft ที่ 140 kt) | 5.01 s (h_F/(\|ḣ_F\| − 0.762) = 15.10/(3.775 − 0.762); ผู้ตรวจแก้จาก 5.2 s) | 0.762 m/s | ใช้กฎ A320 แทน (ไม่พบของ A330) | ใช่ |
| เครื่องฝึก (เดิม) | clamp(2.4·sink, 4.5, 9) m | 2.4 s | 0.22 m/s | [O40] | ใช่ |

ผลการจำลองแบบ kinematic บน 21R (`o_autoland.mjs` ส่วน 3, ไม่มีลม): ถ้าเส้นทางตามคำสั่งได้ทันที 737 แตะพื้นที่ s = 535 m หลัง flare 8.1 s และ A320 ที่ 488 m หลัง 7.9 s ถ้ามีความหน่วงของเส้นทาง 1 s (first-order บน ḣ) จะแตะเร็วขึ้นเป็น 408 m และ 377 m และ sink เพิ่มเป็นราว 1.02 ถึง 1.03 m/s (200 fpm) ซึ่งยังใกล้ค่าบินจริงของ DIALS (0.73 ± 0.21 m/s) [O14] และ CR-3074 (0.665 ± 0.26 m/s) [O15] กฎของสิทธิบัตรแบบ prior art (K คงที่) ทำให้ความสูง flare และจุดแตะพื้นเลื่อนตาม ground speed: 110/125/140 kt ให้ flare 35.5/41.9/48.4 ft และแตะที่ 1334/1512/1704 ft จาก threshold ของ 21R (569/747/939 ft จาก wheel GPI ของ 737; ส่วน 4 ของสคริปต์พิมพ์ระยะจาก threshold) ตรงกับข้อความ "about six feet for a 15 knot variation" และการกระจายราว 200 ft ในสิทธิบัตร [O13] จึงใช้เป็นการทดสอบว่าเขียนกฎถูก

การติดตาม ḣ_cmd ใช้ γ_cmd = asin(ḣ_cmd/V) ผ่าน pitch loop เดิม โดยเพิ่ม gain ช่วง flare แบบ easy-on (DIALS เพิ่ม gain ของ altitude, altitude rate และ pitch rate แบบค่อยเป็นค่อยไป [O14]) และเพิ่ม feed-forward ของ ḧ_cmd = −ḣ_cmd/τ เพื่อลดผลของความหน่วง (ข้อเสนอ ค่าประมาณ)

### ALIGN (decrab) และ ROLL OUT

- **ALIGN:** ส่วนผสม b(h) = smoothstep(h_align, h_align/3, h) ระหว่างกฎ "β → 0" กับกฎ "ψ → χ_rwy" ของ rudder เหมือนโค้ดเดิม แต่ h_align ตามแบบ: A320 20 ft (6.1 m) [O30], A330 30 ft (9.1 m) [O24] (จากเหตุการณ์ A340), 737-800 ไม่พบในแหล่งสาธารณะ ใช้ 20 ft (ค่าประมาณ) ส่วน aileron ยังรักษาแนว LOC ด้วย φ_max 5° (การลงแบบ wing-low ช่วงสุดท้าย) ทั้งหมดนี้ทดสอบด้วยลมขวาง 15 kt ตาม AC 20-57A [O4] และ 20 kt ตามขีดของ A320 [O28]
- **ROLL OUT:** เริ่มเมื่อ WOW ของล้อหลัก (Airbus [O26], 737 ที่มี rollout [O23]) ใช้ ψ_cmd = χ_rwy − clamp(K_y·y, ±5°) (K_y = 0.025 rad/m ของเดิม) → rudder และ nosewheel steering; y มาจาก ε_LOC ตามจริง เกณฑ์: ห่างแนวกลาง > 8.2 m น้อยกว่า 5 % [O3] 338(a) และหยุดเป็นโหมด taxi ที่ราว 30 kt [O1] (Airbus ปลด AP ที่ taxi speed [O30])
- **derotation:** ลดจมูกด้วยอัตรา 1.6°/s ตามโค้ดเดิม (ค่าประมาณ ไม่มีแหล่ง)

### RETARD และ autothrust

| แบบ | เงื่อนไข RETARD/idle | อัตรา | หลังแตะพื้น | ที่มา |
|---|---|---|---|---|
| 737-800 | h ≤ 27 ft (8.23 m) หรือ t − t_FLARE ≥ 2.5 s (อย่างใดถึงก่อน) | ลดให้ถึง idle ตอนแตะพื้น: อัตรา = (thr − idle)/t_go, t_go = τ·ln((h + h_B)/h_B) (ค่าประมาณ) | A/T ปลด 2 s หลังแตะ | [O19][O16]; สูตร t_go เลือกเอง |
| A320/A330 | thrust idle ที่ h ≤ 30 ft (9.14 m) | ลดตาม rate limit ของ A/THR (ไม่พบตัวเลข; ใช้ idle ใน 2 s ค่าประมาณ) | เสียง "RETARD" ที่ 10 ft (3.05 m) ให้นักบินดึงคันเร่ง idle; ถ้าไม่ดึงให้แสดงเตือน | [O30][O24][O25]; โมเดล FBW ขอ RETARD ที่ ≤ 40 ft [O32] |
| ATR 72-600 | ไม่มี A/T | – | – | [O33] |

ใน simulation ideal ของ 737 ที่ 142.1 kt RA 27 ft มาถึงก่อน 2.5 s (2.29 s หลัง flare) ที่ 130 kt ทั้งสองเงื่อนไขถึงพร้อมกันราว 2.5 s และที่ 155 kt 27 ft ถึงที่ 2.10 s (`o_modes.mjs` ส่วน 3)

**SPEED mode:** ใช้ PI บนความเร็วกับความหน่วงของเครื่องยนต์จากหัวข้อ 6 ค่าที่เสนอได้จากการวางขั้ว (pole placement) ของพลวัตความเร็วแบบ point mass m·V̇ = T − D − m·g·sin γ ที่ ω = 0.15 rad/s, ζ = 0.8 (เลือกให้ ω·τ_engine ≈ 0.2 เมื่อ τ_engine = 1.5 s ค่าประมาณ; lag อันดับหนึ่งนี้ถึง 95 % ของขั้นแรงขับใน 4.49 s ซึ่งอยู่ในเกณฑ์ 5 s ของ 14 CFR 33.73(b) ที่หัวข้อ 6 ใช้ [O41]): K_p = 2ζω·m, K_i = ω²·m (`o_athr.mjs`)

| แบบ | m (kg) | T_max (kN, class) | K_p (สัดส่วน T_max ต่อ kt) | K_i (สัดส่วน T_max ต่อ kt·s) | ขั้น headwind +10 kt กลับเข้า ±2 kt |
|---|---|---|---|---|---|
| 737-800 | 60,000 | 234 | 0.0317 | 0.00297 | 23.6 s |
| A320ceo | 64,500 | 240 | 0.0332 | 0.00311 | 23.1 s |
| A330-300 | 185,000 | 633 | 0.0361 | 0.00339 | 28.2 s |
| เครื่องฝึก (เดิม) | 2,250 | – | 0.035 | 0.0045 | – |

ค่าทั้งหมดเป็นค่าประมาณ (แรงขับสูงสุดเป็นค่าระดับ class ที่ต้องแทนด้วยค่าของหัวข้อ 6) เวลาในคอลัมน์สุดท้ายได้จาก PI ที่ไม่มี anti-windup ซึ่งคำสั่งชนขีด idle (5 % T_max) แล้วตัวอินทิเกรตสะสมจนความเร็วตกต่ำกว่าเป้า 3.5 ถึง 4.1 kt; เมื่อหยุดอินทิเกรตขณะคำสั่งอิ่มตัว (conditional integration) เวลาลดเหลือ 7.8 ถึง 9.5 s และ undershoot ไม่เกิน 0.75 kt (`scripts/orev_athr.mjs` ของผู้ตรวจ) จึงควรใส่ anti-windup ในโค้ด ข้อสังเกตคือ gain ที่ทำให้เป็นสัดส่วนของแรงขับสูงสุดใกล้กับของเครื่องฝึกเดิม จึงย้ายโค้ดเดิมมาใช้ได้ทันทีถ้าคำสั่งเป็นสัดส่วนของแรงขับ **alpha floor** (A320/A330) ให้ใช้มุมของหัวข้อ 8 แล้วสั่ง TOGA และล็อก (TOGA LK) [O32]; 737 ไม่มี alpha floor แต่ใน LVL CHG/GA มี speed reversion [O19]

### การเปรียบเทียบกับ `class Autopilot` และข้อเสนอการแก้

| ประเด็น | ปัจจุบัน | ข้อเสนอ | ผลต่อเครื่องฝึก |
|---|---|---|---|
| ข้อมูลนำร่อง | ตำแหน่งจริงในกรอบทางวิ่ง | ε จากตัวรับ ILS (มีสัญญาณรบกวนได้) | ไม่เปลี่ยนเมื่อไม่มีสัญญาณรบกวน |
| โหมด | 'APP' / 'FLARE' / 'ROLLOUT' / 'STOP' | state machine ต่อแบบ (ตาราง 3.9.5, 3.9.6) และ FMA string | เพิ่มโหมด 'LAND' ที่ 400 ft ให้ HUD แสดง |
| flare | τ = 2.4 s, h_B = 0.53 m | ค่าต่อแบบจาก `afcs.laws.flare` | คงค่าเดิมของเครื่องฝึก |
| thrust ใน flare | ลดด้วยอัตรา 0.4/s (ถึง 0 ภายในไม่เกิน 2.5 s) ทันทีที่เข้า flare | RETARD ตามแบบ | คงค่าเดิม |
| decrab | 11 m → 4.5 m | `afcs.laws.align.h_align` | คงค่าเดิม |
| capability | ไม่มี | CAT 2 / 3 SINGLE / 3 DUAL / LAND 2/3 ตามจำนวน AP และความล้มเหลว | ไม่มี |
| ประเมินผล | คะแนน 0 ถึง 100 | เพิ่มรายงาน "autoland certification check" แบบ Monte Carlo (T-O-11 ถึง T-O-13) | ไม่เปลี่ยน |

## 3.9.10 ดอนเมือง: ILS, LVP และฉากฝึก

| รายการ | ค่า | แหล่ง | ความเชื่อมั่น |
|---|---|---|---|
| ILS 21R IBKK 109.3 MHz | CAT II, RDH 54 ft (16.46 m), GP 3°, ALS CAT II 900 m | AIP AD 2.14/2.19 [O36] ผ่าน [O37] | สูง |
| ILS 21L IDMG 110.3 MHz | CAT I, RDH 53 ft, ALS CAT I 900 m | [O36][O37] | สูง |
| ILS 03L IBKD 109.7 MHz | CAT I, RDH 55 ft, SALS 420 m | [O36][O37] | สูง |
| 03R | ไม่มี ILS (RNP) | [O36][O37] | สูง |
| minima ที่อ่านได้ | ILS CAT I 21R/21L OCA/H 220 (213) ft; CAT II 21R ราว 120 (113) ถึง 150 (143) ft (แยก category ไม่ได้) | แผนภูมิ ILS Z RWY 21R [O36] ผ่าน [O37] | กลางถึงต่ำ |
| LVP | เริ่มเมื่อ RVR < 550 m หรือเพดานเมฆ < 200 ft; ใช้ 21R (CAT II และ LVTO) เท่านั้น ห้ามใช้ 21L; ห้าม intersection take-off; ทางออก O, R, S, C(S); CAT II holding ที่ TWY D และ B(N) | AIP AD 2.20 [O36] ผ่าน [O37] | กลาง (ยืนยันข้อความ AD 2.20 รอบปัจจุบันไม่ได้) |
| CAT II RVR ตาม DH | DH 100 ถึง 120 ft → 300 m (Cat C), 121 ถึง 140 ft → 400 m, 141 ถึง 199 ft → 450 m | [O7] Table 3 | สูง (กฎ EASA; CAAT อาจต่าง) |

**ผลต่อการฝึก:** เครื่องที่บินจริงที่ DMK รองรับ CAT III (A320 CAT 3 DUAL, 737-800 Cat 3) แต่สนามมีเพียง CAT II ที่ 21R ดังนั้นการลงต่ำสุดจริงคือ CAT II (DH ราว 100 ft, RVR 300 m) ซึ่งสายการบินมักทำด้วย autoland ฉากที่เสนอ:
1. **LVP 21R CAT II:** หมอกให้ RVR 300 ถึง 350 m, เพดานเมฆ 100 ft, AP/A/THR ทำ autoland; ผู้เล่นตัดสินใจ "LAND" หรือ "GO AROUND" ที่ DH 100 ft ตามว่ามองเห็นไฟ ALS หรือไม่ (`o_modes.mjs` ส่วน 6)
2. **autoland บนทางวิ่ง CAT I (21L/03L) โดยไม่มี LVP:** ใส่ beam bend 30 ถึง 140 µA ตั้งแต่ 300 ft ลงมา (อ้างขนาดจากเหตุการณ์ใน [O24]) ให้ไฟเตือน AUTOLAND ติดตามเกณฑ์ 1/4 dot แล้วผู้เล่นต้องปลด AP
3. **RA fault แบบ TK1951:** RA ตัวหนึ่งแสดง −8 ft ขณะอยู่ราว 2000 ft ให้ A/T ของ 737 เข้า RETARD; วัดว่าผู้เล่นสังเกตความเร็วลดก่อน stick shaker หรือไม่ [O16]
4. **ลมเกินขีด autoland:** ลม 270/24 kt ให้ crosswind 21.0 kt บน 21R ซึ่งเกินขีด A320 และ A330 (20 kt) และเกินขีด 737 ตาม FCOM MALEV (20 kt [O21]) แต่ไม่เกินถ้าใช้ 25 kt ตาม [O20] (`o_modes.mjs` ส่วน 5) ระบบต้องไม่อนุญาต autoland (A320: ทำได้เพียง CAT I approach โดยไม่มี autoland [O28])

## ค่าพารามิเตอร์ (JSON)

บล็อกด้านล่างสร้างและตรวจด้วย `scripts/o_json.mjs` (ทุก leaf มีคีย์ `v,u,scope,src,conf,est,note` ครบ, `src` ไม่ว่าง, แต่ละบล็อกมีคีย์บนสุดเดียว; รวม 93 leaf) หัวข้อนี้เขียนเฉพาะ `afcs.*` ของแต่ละแบบและ `common_airliner.afcs` ตามตารางเจ้าของใน schema-ext ข้อ 4 ความสูงใน `v` เป็น m และ ft อยู่ใน `note`; ความเร็วลมเป็น m/s (kt ใน `note`) A320neo, A321ceo และ A321neo รับค่า `afcs` ของ A320ceo ผ่าน `_inherits` ที่หัวข้อ 3 กำหนด จึงไม่มีบล็อกแยก

```json
{
 "b737_800": {
  "afcs": {
   "modes": {"v":{"ap":["CMD A","CMD B","CWS A","CWS B"],"lateral":["HDG SEL","LNAV","VOR/LOC","APP(LOC+G/S)","TO/GA","ROLLOUT(option)"],"vertical":["LVL CHG","V/S","VNAV SPD","VNAV PTH","ALT HOLD","ALT ACQ","G/S","FLARE","TO/GA"],"autothrottle":["N1","MCP SPD","FMC SPD","RETARD","ARM","THR HLD","GA"],"annunciation":["1 CH","LAND 2","LAND 3","NO AUTOLAND"]},"u":"-","scope":"aircraft","src":["O19","O20","O23"],"conf":"กลาง","est":false,"note":"ชื่อตาม FMA ที่สรุปจาก FCOM; ROLLOUT และ LAND 2/3 เฉพาะเครื่องที่มี rollout guidance"},
   "arm_engage": {
    "AP_takeoff_min": {"v":121.92,"u":"m","scope":"aircraft","src":["O20"],"conf":"กลาง","est":false,"note":"400 ft AGL"},
    "AP_single_channel_min": {"v":15.24,"u":"m","scope":"aircraft","src":["O20"],"conf":"กลาง","est":false,"note":"50 ft AGL ระหว่าง approach (1 CH)"},
    "LOC_capture_dot": {"v":0.5,"u":"dot","scope":"aircraft","src":["O19"],"conf":"กลาง","est":false,"note":"capture ไม่ช้ากว่า 1/2 dot"},
    "GS_capture_dot": {"v":0.4,"u":"dot","scope":"aircraft","src":["O19"],"conf":"กลาง","est":false,"note":"2/5 dot; ไม่ capture ก่อน LOC"},
    "THR_HLD_kt": {"v":43.213,"u":"m/s","scope":"aircraft","src":["O19"],"conf":"กลาง","est":false,"note":"84 kt (43.2 m/s) หรือ 64 kt (32.9 m/s) ตามรุ่นคอมพิวเตอร์ A/T; NG ค้างถึง 800 ft RA"},
    "TOGA_FD_pitch": {"v":{"takeoff_initial":-10,"takeoff_after_60kt":15,"GA_AP":15,"GA_FD_one_engine":13},"u":"deg","scope":"aircraft","src":["O19"],"conf":"กลาง","est":false,"note":"F/D 10° nose down เริ่ม, 15° nose up ที่ 60 kt IAS"},
    "GA_arm_RA": {"v":609.6,"u":"m","scope":"aircraft","src":["O19"],"conf":"กลาง","est":false,"note":"A/T GA armed ต่ำกว่า 2000 ft RA"},
    "N1_equalization_max_deg": {"v":8,"u":"deg","scope":"aircraft","src":["O19"],"conf":"กลาง","est":false,"note":"thrust lever split สูงสุด; ปลด A/T ถ้าเกิน 10° ใน dual channel หลัง FLARE armed"}
   },
   "autoland": {
    "FLARE_ARM_ft": {"v":457.2,"u":"m","scope":"aircraft","src":["O19"],"conf":"กลาง","est":false,"note":"1500 ft RA: AP2 engage หลัง LOC+G/S capture และ FLARE armed"},
    "DUAL_AP_by_ft": {"v":243.84,"u":"m","scope":"aircraft","src":["O19"],"conf":"กลาง","est":false,"note":"800 ft RA: ต้องมี AP สองตัว"},
    "STAB_TRIM_ft": {"v":121.92,"u":"m","scope":"aircraft","src":["O19"],"conf":"กลาง","est":false,"note":"400 ft RA: stabilizer trim nose up (NG เพิ่มอีกที่ 50 ft)"},
    "FLARE_NOT_ARMED_DISC_ft": {"v":106.68,"u":"m","scope":"aircraft","src":["O19"],"conf":"กลาง","est":false,"note":"ราว 350 ft RA: FLARE ไม่ armed → AP ทั้งสองปลด"},
    "FLARE_ft": {"v":15.24,"u":"m","scope":"aircraft","src":["O19"],"conf":"กลาง","est":false,"note":"ราว 50 ft RA"},
    "RETARD_ft": {"v":8.23,"u":"m","scope":"aircraft","src":["O19","O16"],"conf":"สูง","est":false,"note":"27 ft RA (DSB TK1951: radio height < 27 ft เป็นเงื่อนไข retard flare)"},
    "RETARD_after_flare_s": {"v":2.5,"u":"s","scope":"aircraft","src":["O19"],"conf":"กลาง","est":false,"note":"RETARD 2.5 s หลัง FLARE engage หรือที่ 27 ft อย่างใดก่อน"},
    "AT_disc_after_TD_s": {"v":2,"u":"s","scope":"aircraft","src":["O19"],"conf":"กลาง","est":false,"note":"A/T ปลดราว 2 s หลังแตะพื้น"},
    "ROLLOUT": {"v":"option","u":"-","scope":"aircraft","src":["O19","O23"],"conf":"ต่ำ","est":false,"note":"ไม่มี rollout: AP ต้องปลดด้วยมือหลังแตะพื้น; มี rollout: LAND 3 ใช้ LOC บนพื้น (ความสูง engage ไม่พบ)"},
    "ALIGN_ft": {"v":6.096,"u":"m","scope":"aircraft","src":["O30"],"conf":"ต่ำ","est":true,"note":"ไม่พบของ 737; ใช้ 20 ft ตาม A320 (ค่าประมาณ)"},
    "AP_disc_min_ft": {"v":15.24,"u":"m","scope":"aircraft","src":["O20"],"conf":"กลาง","est":false,"note":"single channel ห้ามต่ำกว่า 50 ft; dual channel ลงถึงพื้น"}
   },
   "capability": {
    "certified": {"v":"Cat 3","u":"-","scope":"aircraft","src":["O22"],"conf":"สูง","est":false,"note":"EASA TCDS IM.A.120 Issue 29 (16 DEC 2025) Section 2 NG series item III.12 p.14 \"All Weather Capability: Cat 3\"; Section 4.1 (737-800) อ้าง AFM"},
    "DH_min": {"v":{"LAND2_fail_passive":15.24,"LAND3_fail_operational":0},"u":"m","scope":"aircraft","src":["O23"],"conf":"ต่ำ","est":false,"note":"LAND 2 DH 50 ft; LAND 3 ไม่มี DH (ตามผู้ประกอบการหนึ่งราย)"},
    "RVR_min": {"v":{"LAND2":125,"LAND3":75},"u":"m","scope":"aircraft","src":["O23","O7"],"conf":"ต่ำ","est":false,"note":"LAND 2 125/75/75 m; LAND 3 75 m"},
    "AH": {"v":30.48,"u":"m","scope":"aircraft","src":["O8"],"conf":"ต่ำ","est":true,"note":"ไม่พบของ 737; ใช้ค่าทั่วไป \"100 ft or less\" (ค่าประมาณ)"},
    "autoland_wind_limits": {"v":{"headwind":12.861,"crosswind":10.289,"tailwind":7.7167},"u":"m/s","scope":"aircraft","src":["O21","O20"],"conf":"กลาง","est":false,"note":"HW 25 kt, XW 20 kt ตาม FCOM MALEV (b737.org.uk ให้ 25 kt), TW 0 ถึง 15 kt ตามความสูงสนามและแฟลป"},
    "autoland_gs_deg": {"v":{"min":2.5,"max":3.25},"u":"deg","scope":"aircraft","src":["O20"],"conf":"กลาง","est":false,"note":"มุม GS"},
    "autoland_config": {"v":{"flaps":["30","40"],"engines":"both"},"u":"-","scope":"aircraft","src":["O20"],"conf":"กลาง","est":false,"note":"flaps 30 หรือ 40 และเครื่องยนต์ทำงานทั้งสอง"}
   },
   "laws": {
    "flare": {"v":{"type":"exp_hB","h_flare":15.24,"h_B":3.658,"tau_rule":"tau=(h_flare+h_B)/(V_G*tan(gs))","tau_at_142kt":4.93,"sink_TD":0.742},"u":"m, s, m/s","scope":"aircraft","src":["O13","O19"],"conf":"ต่ำ","est":true,"note":"hdot_cmd=-(h+h_B)/tau; V_G·tau คงที่ตามสิทธิบัตร 4,354,237; h_flare 50 ft จาก FCOM summary"},
    "retard": {"v":{"h":8.23,"dt_after_flare":2.5,"ramp":"idle at predicted touchdown t_go=tau*ln((h+h_B)/h_B)"},"u":"m, s","scope":"aircraft","src":["O19","O16"],"conf":"กลาง","est":true,"note":"สูตร ramp เป็นค่าประมาณ"},
    "athr_speed": {"v":{"Kp_Tmax_per_kt":0.0317,"Ki_Tmax_per_kt_s":0.00297,"omega":0.15,"zeta":0.8},"u":"1/kt, 1/(kt s), rad/s, -","scope":"aircraft","src":["O40"],"conf":"ต่ำ","est":true,"note":"pole placement m=60 t, Tmax 234 kN class, engine lag 1.5 s (o_athr.mjs)"}
   }
  }
 }
}
```

```json
{
 "a320ceo": {
  "afcs": {
   "modes": {"v":{"lateral":["RWY","RWY TRK","NAV","HDG","TRK","LOC*","LOC","LAND","FLARE","ROLL OUT","GA TRK"],"vertical":["SRS","CLB","DES","OP CLB","OP DES","ALT*","ALT","ALT CST*","ALT CST","V/S","FPA","G/S*","G/S","FINAL APP","LAND","FLARE","ROLL OUT","EXP","TCAS"],"athr":["SPEED","MACH","THR CLB","THR IDLE","THR LVR","THR MCT","MAN TOGA","MAN FLX","MAN MCT","MAN THR","A.FLOOR","TOGA LK"],"athr_messages":["THR LK","LVR CLB","LVR MCT","LVR ASYM"],"capability_fma":["CAT 1","CAT 2","CAT 3 SINGLE","CAT 3 DUAL"]},"u":"-","scope":"aircraft","src":["O31","O32","O28"],"conf":"กลาง","est":false,"note":"ชื่อตามเอกสาร/enum ของ FlyByWire A32NX v0.10.0 (GPL-3.0) ที่จำลอง FMA"},
   "arm_engage": {
    "AP_takeoff_min": {"v":{"h":30.48,"t_after_liftoff_s":5},"u":"m, s","scope":"aircraft","src":["O28","O32"],"conf":"กลาง","est":false,"note":"100 ft AGL และอย่างน้อย 5 s หลัง liftoff"},
    "MUH": {"v":{"ILS_CAT1":48.768,"FINAL_APP_VS_FPA":76.2,"circling_C":152.4,"circling_D":182.88,"after_manual_GA":30.48,"other":152.4},"u":"m","scope":"aircraft","src":["O28"],"conf":"กลาง","est":false,"note":"160/250/500/600/100/500 ft AGL"},
    "NAV_min_RA": {"v":9.144,"u":"m","scope":"aircraft","src":["O32"],"conf":"ต่ำ","est":false,"note":"NAV engage ได้ที่ RA ≥ 30 ft (โมเดล FBW)"},
    "LOC_star_deg": {"v":1.92,"u":"deg","scope":"sim","src":["O32"],"conf":"ต่ำ","est":true,"note":"FBW: |e_LOC| < 1.92° (2.56 dot บน 21R)"},
    "LOC_track_deg": {"v":0.16,"u":"deg","scope":"sim","src":["O32"],"conf":"ต่ำ","est":true,"note":"FBW: |e_LOC| < 0.16° ต่อเนื่อง"},
    "GS_star_deg": {"v":0.1333,"u":"deg","scope":"sim","src":["O32"],"conf":"ต่ำ","est":true,"note":"FBW: |e_GS| < 0.1333° หลัง LOC*/LOC"}
   },
   "autoland": {
    "LAND_ft": {"v":121.92,"u":"m","scope":"aircraft","src":["O26","O32"],"conf":"กลาง","est":false,"note":"LAND เมื่อ LOC และ G/S engaged และ RA < 400 ft (FBW รอ 1.2 s)"},
    "LAND_must_by_ft": {"v":106.68,"u":"m","scope":"aircraft","src":["O30"],"conf":"กลาง","est":false,"note":"FMA ต้องแสดง LAND ก่อน 350 ft"},
    "AUTOLAND_warning_below_ft": {"v":60.96,"u":"m","scope":"aircraft","src":["O30"],"conf":"กลาง","est":false,"note":"ใต้ 200 ft: LOC > 1/4 dot (เหนือ 15 ft), GS > 1 dot (เหนือ 100 ft), RA ต่าง > 15 ft, สูญ LOC/GS"},
    "FLARE_ft": {"v":{"nominal":12.192,"rule":"h = clamp(|VS fpm|/15, 45, 60) ft","at_709fpm":14.408},"u":"m","scope":"aircraft","src":["O30","O32"],"conf":"กลาง","est":true,"note":"FMA ราว 40 ft; สูตรของโมเดล FBW (time-to-go 4 s)"},
    "RETARD_ft": {"v":{"thrust_idle":9.144,"callout_autoland":3.048,"callout_manual":6.096},"u":"m","scope":"aircraft","src":["O30","O25","O24"],"conf":"กลาง","est":false,"note":"thrust idle ราว 30 ft; เสียง RETARD 10 ft (autoland) / 20 ft (manual)"},
    "ALIGN_ft": {"v":{"start":6.096,"end":3.048},"u":"m","scope":"aircraft","src":["O30"],"conf":"กลาง","est":false,"note":"decrab ระหว่างราว 20 ถึง 10 ft"},
    "ROLLOUT": {"v":"main gear touchdown","u":"-","scope":"aircraft","src":["O26","O30"],"conf":"กลาง","est":false,"note":"ROLL OUT ตาม LOC บนพื้น; ปลด AP ที่ taxi speed"},
    "AP_disc_min_ft": {"v":0,"u":"m","scope":"aircraft","src":["O30"],"conf":"กลาง","est":false,"note":"CAT 3 DUAL ลงถึงพื้น; CAT II takeover \"at or above 80 ft\" (24.4 m)"}
   },
   "capability": {
    "certified": {"v":["CAT 2","CAT 3 SINGLE","CAT 3 DUAL"],"u":"-","scope":"aircraft","src":["O28","O24"],"conf":"กลาง","est":false,"note":"Airbus ทุกแบบรับรอง autoland"},
    "DH_min": {"v":{"CAT2":30.48,"CAT3_SINGLE":15.24,"CAT3_DUAL":6.096,"CAT3_DUAL_noDH":0},"u":"m","scope":"aircraft","src":["O28","O30"],"conf":"กลาง","est":false,"note":"100/50/20 ft หรือไม่มี DH"},
    "AH": {"v":30.48,"u":"m","scope":"aircraft","src":["O28","O27"],"conf":"กลาง","est":false,"note":"CAT 3 DUAL alert height 100 ft"},
    "RVR_min": {"v":{"CAT3_DUAL_noDH":75},"u":"m","scope":"aircraft","src":["O28","O30"],"conf":"กลาง","est":false,"note":"RVR 75 m"},
    "autoland_wind_limits": {"v":{"headwind":15.433,"crosswind":10.289,"tailwind":5.1444},"u":"m/s","scope":"aircraft","src":["O28","O30"],"conf":"กลาง","est":false,"note":"HW 30, XW 20, TW 10 kt; เกิน → CAT I approach ไม่มี autoland"},
    "autoland_gs_deg": {"v":{"min":2.5,"max":3.15},"u":"deg","scope":"aircraft","src":["O28","O30"],"conf":"กลาง","est":false,"note":"FBW docs ให้ 3.25°"},
    "autoland_misc": {"v":{"airport_elev_max":2804.2,"pressure_alt_min":-304.8,"weight":"<= MLW"},"u":"m","scope":"aircraft","src":["O28","O30"],"conf":"กลาง","est":false,"note":"≤ 9200 ft (บางทะเบียน 2500 ft); ไม่ต่ำกว่า −1000 ft PA; FBW docs: ≥ 44 000 kg"}
   },
   "laws": {
    "flare": {"v":{"type":"exp_offset","h_flare_rule":"clamp(4 s * |hdot|, 13.72 m, 18.29 m)","tau_rule":"tau=h_F/(|hdot_F|-0.762)","sink_TD":0.762,"tau_at_133kt":5.07},"u":"m, s, m/s","scope":"aircraft","src":["O32","O30"],"conf":"ต่ำ","est":true,"note":"hdot_cmd = -h/tau - 0.762 m/s (FBW AutopilotLaws.cpp บรรทัด 2139-2150)"},
    "retard": {"v":{"h_idle":9.144,"h_callout":3.048,"fbw_request_h":12.192},"u":"m","scope":"aircraft","src":["O30","O24","O32"],"conf":"กลาง","est":true,"note":"โมเดล FBW ขอ RETARD ที่ ≤ 40 ft; เลือก 30 ft ตามคำอธิบาย FMA"},
    "athr_speed": {"v":{"Kp_Tmax_per_kt":0.0332,"Ki_Tmax_per_kt_s":0.00311,"omega":0.15,"zeta":0.8},"u":"1/kt, 1/(kt s), rad/s, -","scope":"aircraft","src":["O40"],"conf":"ต่ำ","est":true,"note":"pole placement m=64.5 t, Tmax 240 kN class (o_athr.mjs)"}
   }
  }
 }
}
```

```json
{
 "a330_300": {
  "afcs": {
   "modes": {"v":"as a320ceo","u":"-","scope":"aircraft","src":["O24","O29"],"conf":"ต่ำ","est":true,"note":"ใช้ชุดโหมดเดียวกับ A320 (FMGS ตระกูลเดียวกัน); A330/A340 แสดง ALIGN/RETARD ที่ 30 ft"},
   "arm_engage": {
    "AP_takeoff_min": {"v":{"h":30.48,"t_after_liftoff_s":5},"u":"m, s","scope":"aircraft","src":["O29"],"conf":"ต่ำ","est":false,"note":"100 ft AGL และ 5 s"},
    "MUH": {"v":{"ILS_CAT1":48.768},"u":"m","scope":"aircraft","src":["O29"],"conf":"ต่ำ","est":false,"note":"ILS CAT 1 160 ft AGL; NPA ถึง MDA"}
   },
   "autoland": {
    "LAND_ft": {"v":121.92,"u":"m","scope":"aircraft","src":["O26"],"conf":"ต่ำ","est":true,"note":"ใช้ค่า A320 (ไม่พบของ A330)"},
    "FLARE_ft": {"v":{"rule":"as a320ceo","at_743fpm":15.098},"u":"m","scope":"aircraft","src":["O32"],"conf":"ต่ำ","est":true,"note":"สูตร FBW ที่ 140 kt"},
    "RETARD_ft": {"v":{"thrust_idle":9.144,"callout_autoland":3.048},"u":"m","scope":"aircraft","src":["O24","O30"],"conf":"กลาง","est":true,"note":"A340: \"At 30 ft, ALIGN and RETARD modes engaged\""},
    "ALIGN_ft": {"v":9.144,"u":"m","scope":"aircraft","src":["O24"],"conf":"กลาง","est":true,"note":"จาก Safety First 12 Case One (แบบเครื่องอนุมานเป็น A340-500 จากความเห็นเรื่องขีดลมใน p.28; บทความไม่ระบุตรง)"},
    "ROLLOUT": {"v":"main gear touchdown","u":"-","scope":"aircraft","src":["O24"],"conf":"กลาง","est":true,"note":"automatic rollout"}
   },
   "capability": {
    "certified": {"v":["CAT 2","CAT 3 SINGLE","CAT 3 DUAL"],"u":"-","scope":"aircraft","src":["O24","O29"],"conf":"ต่ำ","est":false,"note":""},
    "DH_min": {"v":{"CAT3_SINGLE":15.24,"CAT3_DUAL":6.096},"u":"m","scope":"aircraft","src":["O29"],"conf":"ต่ำ","est":false,"note":"50 ft / 20 ft"},
    "AH": {"v":60.96,"u":"m","scope":"aircraft","src":["O29","O27"],"conf":"ต่ำ","est":false,"note":"200 ft (บัตรทบทวน + ความเห็นนักบิน)"},
    "RVR_min": {"v":{"CAT3_DUAL":75},"u":"m","scope":"aircraft","src":["O29"],"conf":"ต่ำ","est":false,"note":"75 m"},
    "autoland_wind_limits": {"v":{"headwind":18.006,"crosswind":10.289,"tailwind":5.1444},"u":"m/s","scope":"aircraft","src":["O29"],"conf":"ต่ำ","est":false,"note":"HW 35, XW 20, TW 10 kt"},
    "autoland_gs_deg": {"v":{"min":2.5,"max":3.25},"u":"deg","scope":"aircraft","src":["O29"],"conf":"ต่ำ","est":false,"note":""},
    "engine_out": {"v":"CAT 2 and CAT 3 SINGLE in CONF 3","u":"-","scope":"aircraft","src":["O29"],"conf":"ต่ำ","est":false,"note":""}
   },
   "laws": {
    "flare": {"v":{"type":"as a320ceo","tau_at_140kt":5.01,"sink_TD":0.762},"u":"s, m/s","scope":"aircraft","src":["O32"],"conf":"ต่ำ","est":true,"note":"ใช้กฎ A320"},
    "athr_speed": {"v":{"Kp_Tmax_per_kt":0.0361,"Ki_Tmax_per_kt_s":0.00339,"omega":0.15,"zeta":0.8},"u":"1/kt, 1/(kt s), rad/s, -","scope":"aircraft","src":["O40"],"conf":"ต่ำ","est":true,"note":"pole placement m=185 t, Tmax 633 kN class"}
   }
  }
 }
}
```

```json
{
 "atr72_600": {
  "afcs": {
   "modes": {"v":{"lateral":["HDG SEL","HDG HOLD","NAV","LOC","APP"],"vertical":["IAS","VS","PITCH HOLD","ALT SEL","ALT","G/S","VNAV","GA"],"athr":[]},"u":"-","scope":"aircraft","src":["O33","O34"],"conf":"กลาง","est":false,"note":"ไม่มี autothrottle; VNAV coupled ตั้งแต่ Standard 2 (2014)"},
   "arm_engage": {
    "AP_on_ground": {"v":false,"u":"-","scope":"aircraft","src":["O33"],"conf":"กลาง","est":false,"note":"AP และ YD engage บนพื้นไม่ได้"},
    "AP_after_liftoff_s": {"v":12,"u":"s","scope":"aircraft","src":["O33"],"conf":"กลาง","est":false,"note":"12 s หลัง liftoff (ราว 400 ft AGL)"}
   },
   "autoland": {
    "LAND_ft": {"v":null,"u":"m","scope":"aircraft","src":["O33"],"conf":"กลาง","est":false,"note":"ไม่มี autoland/FLARE mode"},
    "AP_disc_min_ft": {"v":30.48,"u":"m","scope":"aircraft","src":["O33","O7"],"conf":"ต่ำ","est":true,"note":"ปลด AP ที่ DH CAT II (100 ft ที่ 21R); ตาราง CAT 2 ของ FCOM ใช้ตัวอย่าง \"Visual at DH 80 ft RA\" (2.02.04 p.10-11)"}
   },
   "capability": {
    "certified": {"v":["CAT 2 (AP + FD)"],"u":"-","scope":"aircraft","src":["O33"],"conf":"กลาง","est":false,"note":"CAT 2 approaches are flown with AP + FD ON"},
    "cat2_wind_demonstrated": {"v":{"headwind":14.919,"tailwind":5.1444,"crosswind":8.7456},"u":"m/s","scope":"aircraft","src":["O33"],"conf":"กลาง","est":false,"note":"HW 29, TW 10, XW 17 kt"},
    "LPV_min": {"v":60.96,"u":"m","scope":"aircraft","src":["O34"],"conf":"สูง","est":false,"note":"LPV ถึง 200 ft"}
   }
  }
 }
}
```

```json
{
 "common_airliner": {
  "afcs": {
   "categories": {"v":{"CAT_I":{"DH_min":60.96,"RVR_min":550,"VIS_min":800},"CAT_II":{"DH_min":30.48,"DH_max":60.96,"RVR_min":300},"CAT_IIIA":{"DH_max":30.48,"RVR_min":175},"CAT_IIIB":{"DH_max":15.24,"RVR_min":50,"RVR_max":175},"typeA_min":76.2},"u":"m","scope":"environment","src":["O7","O9"],"conf":"สูง","est":false,"note":"DH 200/100/<100/<50 ft; Type A ≥ 250 ft"},
   "rvr_tables": {"v":{"CAT2_DH100_120":300,"CAT2_DH121_140":400,"CAT2_DH141_199":450,"CAT3_DH50_99":175,"CAT3_lt50_fail_passive":125,"CAT3_lt50_fail_operational":75},"u":"m","scope":"environment","src":["O7"],"conf":"สูง","est":false,"note":"EASA/ICAO; Cat D ที่ DH 100-120 ft ใช้ 350 m เว้นแต่ autoland/HUDLS"},
   "fail_passive_DH_min": {"v":15.24,"u":"m","scope":"environment","src":["O8","O9","O3"],"conf":"สูง","est":false,"note":"50 ft; ต่ำกว่านั้นต้อง fail-operational (CS-AWO 312: fail-op ที่ DH < 50 ft ต้องมี AH ≥ 100 ft; ผู้ตรวจยืนยันจาก [O3])"},
   "AH_typical_max": {"v":30.48,"u":"m","scope":"environment","src":["O8"],"conf":"กลาง","est":false,"note":"\"100 ft or less\" (SRVSOP); CS-AWO 312 ตามที่อ่านได้: at least 100 ft (ขัดแย้ง)"},
   "cert_touchdown": {"v":{"early":60,"late_avg":823,"late_limit":914,"lateral_outboard_gear":21.3,"sink_limit":3.048,"p_avg":0.000001,"p_limit":0.00001,"p_bank_avg_easa":1e-8,"p_bank_faa":1e-7},"u":"m, m/s, -","scope":"environment","src":["O1","O2","O3"],"conf":"สูง","est":false,"note":"200 ft, 2700 ft, 3000 ft, 70 ft, 10 ft/s"},
   "cert_rollout": {"v":{"lateral_outboard_gear":21.3,"p":0.000001,"speed_above":20.578,"normal_dev":8.2,"p_normal":0.05},"u":"m, m/s, -","scope":"environment","src":["O3","O1"],"conf":"สูง","est":false,"note":"70 ft ที่ > 40 kt; 27 ft ใน < 5 %"},
   "ac2057a_2sigma": {"v":{"long_total":457.2,"lat_each_side":8.23,"min_from_thr":60.96,"demo_wind":{"headwind":12.861,"tailwind":5.1444,"crosswind":7.7167,"shear_per_100ft":4.1156}},"u":"m, m/s","scope":"environment","src":["O4"],"conf":"สูง","est":false,"note":"1500 ft, 27 ft, 200 ft; HW 25, TW 10, XW 15 kt, shear 8 kt/100 ft"},
   "ops_success": {"v":{"td_min":150,"td_max":750,"speed_tol":2.5722,"vs_max":1.8288,"bank_max_deg":7,"rollout_dev":8},"u":"m, m/s, deg","scope":"environment","src":["O8","O7"],"conf":"สูง","est":false,"note":"±5 kt, 360 fpm, 7°, 8 m (SRVSOP AC 91-020 App 3 §4(a)(1), §5 p.31; ผู้ตรวจรอบต่อยืนยันข้อความตรง จึงเพิ่ม conf จากกลางเป็นสูง)"},
   "cat2_approach": {"v":{"p_success_below_500ft":0.95,"loc_uA_95pct":25},"u":"-, uA","scope":"environment","src":["O2"],"conf":"สูง","est":false,"note":"AC 20-191 §4.2.9, §4.2.6.2.2"},
   "ils_signal": {"v":{"loc_full_DDM":0.155,"gs_full_DDM":0.175,"full_scale_uA":150,"dot_uA":75,"loc_sector_at_thr":210,"gs_width_deg":1.4,"gs_dot_deg":0.36},"u":"DDM, uA, m, deg","scope":"environment","src":["O10","O11","O6","O43"],"conf":"กลาง","est":true,"note":"1 dot = 75 uA เป็นค่าคำนวณสำหรับ PFD 2 dot; gs_dot 0.36° (ICAO 0.12θ) ความเชื่อมั่นกลางตามตารางความขัดแย้ง; DDM มาจากขั้นตอนทดสอบของ R&S (ทุติยภูมิ) จึงลด conf จากสูงเป็นกลาง (ผู้ตรวจ)"},
   "z_quantiles": {"v":{"p1e5":4.265,"p1e6":4.753,"p1e7":5.199,"p1e8":5.612},"u":"-","scope":"sim","src":["O3"],"conf":"สูง","est":true,"note":"คำนวณ (o_autoland.mjs)"},
   "flare_reference": {"v":{"patent_K":0.205,"patent_hB":3.658,"dials_sink_mean":0.732,"dials_sink_sd":0.213,"cr3074_td_sd":34.5,"cr3074_sink_mean":0.665},"u":"1/s, m, m/s","scope":"environment","src":["O13","O14","O15"],"conf":"สูง","est":false,"note":"ค่าอ้างอิงสำหรับทดสอบกฎ flare"},
   "dmk": {"v":{"ils":{"21R":"CAT II","21L":"CAT I","03L":"CAT I","03R":"none"},"lvp_rvr_below":550,"lvp_ceiling_below":60.96,"lvp_runway":"21R","loc_dot_deg":{"21R":0.751,"03L":0.749,"21L":0.889}},"u":"m, deg","scope":"environment","src":["O36","O37"],"conf":"กลาง","est":false,"note":"LVP: RVR < 550 m หรือ ceiling < 200 ft, ใช้ 21R เท่านั้น; dot คำนวณ (o_autoland.mjs)"}
  }
 }
}
```


## กรณีทดสอบ

ทุกกรณีเขียนเป็น Node test ได้โดยใช้ `test/harness.mjs` ที่โหลด `10-atmo.js + 15-geo.js + 20-flight.js` อยู่แล้ว (โค้ดส่วนนี้ต้องไม่มี DOM) ค่าคาดหวังที่มาจากสมการคำนวณด้วยสคริปต์ใน `scripts/` และผลอยู่ในไฟล์ `*_out.txt` ข้างกัน กรณีที่ใช้แบบจำลอง 6-DOF เต็ม (T-O-10 ถึง T-O-13, T-O-22) เป็นเกณฑ์ยอมรับจากข้อกำหนดรับรอง ไม่ใช่ค่าที่คำนวณไว้ล่วงหน้า ตัวเลขที่เป็นค่าประมาณระบุไว้ในคอลัมน์ที่มา

| รหัส | เงื่อนไข | ปริมาณที่วัด | ผลคาดหวัง ± tolerance | ที่มา/สคริปต์ |
|---|---|---|---|---|
| T-O-01 | ใช้ `RWY_END[id].locDist` ของ 21R, 03L, 21L และสูตร locDot = atan(105/locDist)/2 (sector 210 m ที่ threshold) | 1 dot ของ LOC บน PFD แบบ 2 dot, ความกว้าง course, ระยะ 1/4 dot ที่ threshold | 21R 0.751° ± 0.005°, 03L 0.749° ± 0.005°, 21L 0.889° ± 0.010°; ความกว้าง 3.01°, 3.00°, 3.56° ต่างจาก AIP (3.0°, 3.0°, 3.6°) ไม่เกิน ±0.1°; 1/4 dot ที่ threshold 13.1 ± 0.2 m (43 ft) ทุกทางวิ่ง | `o_autoland.mjs` ส่วน 1; [O6][O10][O36][O37] |
| T-O-02 | 21R, GP 3°, RDH 16.46 m (54 ft), เครื่องบินอยู่บน beam พอดี ไม่มีลม ระยะสายอากาศ GS ถึงล้อหลักตามหัวข้อ 5 | ความสูงล้อเหนือ threshold, จุดที่เส้นทางล้อตัดพื้น (wheel GPI), ตำแหน่ง s ที่ล้อสูง 400 ft | ล้อเหนือ THR: 737 12.22 m (40.1 ft), A320 11.58 m (38.0 ft), A330 7.90 m (25.9 ft), ATR 14.16 m (46.5 ft) ทั้งหมด ± 0.3 m; GPI 233.2, 220.9, 150.7, 270.2 m ± 5 m; s(400 ft) 737 −2093 m, A320 −2105 m, A330 −2176 m ± 15 m | `o_autoland.mjs` ส่วน 2; [O38] |
| T-O-03 | 737-800, ground speed 142.1 kt (73.1 m/s), กฎ L1v (h_F 50 ft, h_B 12 ft, τ = (h_F + h_B)/(V_G tan 3°)), ติดตามเส้นทางสมบูรณ์ | h_F, τ, เวลา flare, sink ตอนแตะ, จุดแตะ | h_F 15.24 ± 0.1 m (50 ft); τ 4.93 ± 0.05 s; flare 8.1 ± 0.2 s; sink 0.74 ± 0.03 m/s (146 ± 6 fpm); แตะที่ s = 535 ± 10 m (1754 ft); ถ้าเส้นทางหน่วง 1 s: 408 ± 15 m และ 1.02 ± 0.05 m/s (200 fpm) | `o_autoland.mjs` ส่วน 3; [O13][O19] (est) |
| T-O-04 | กฎ prior art ของสิทธิบัตร (K = 0.205 s⁻¹, h_B = 12 ft) เทียบกับกฎที่ทำให้ V_G·τ คงที่ ที่ ground speed 110, 125, 140 kt | ความสูงเริ่ม flare และจุดแตะนับจาก threshold ของ 21R (wheel GPI ของ 737 อยู่ที่ 233.2 m) | prior art: 35.46, 41.93, 48.40 ft (10.81, 12.78, 14.75 m) ± 0.3 ft; แตะที่ 1334, 1512, 1704 ft ± 15 ft (ส่วนต่าง 110 ถึง 140 kt = 370 ± 20 ft); กฎ V_G·τ คงที่: flare 42.0 ± 0.1 ft ทุกความเร็ว และแตะที่ 1513 ± 5 ft (461 m) | `o_autoland.mjs` ส่วน 4; [O13] |
| T-O-05 | A320, ฟังก์ชัน h_F = clamp(\|ḣ\|·4 s, 45 ft, 60 ft) | h_F ที่ V/S 400, 709, 750, 800, 1000 fpm (2.03, 3.60, 3.81, 4.06, 5.08 m/s) | 45, 47.3, 50, 53.3, 60 ft ± 0.1 ft (13.72, 14.41, 15.24, 16.26, 18.29 m) | `o_modes.mjs` ส่วน 1; [O32][O30] (est) |
| T-O-06 | A320ceo ground speed 133.6 kt (V/S 709 fpm) และ A330-300 140 kt (743 fpm), กฎ L2 (sink เป้า 2.5 ft/s), ติดตามสมบูรณ์ | sink ตอนแตะ, จุดแตะ, เวลา flare | A320: 0.762 ± 0.02 m/s (150 fpm), s = 488 ± 10 m (1600 ft), 7.88 ± 0.2 s; A330: h_F 49.5 ± 0.2 ft, s = 440 ± 10 m (1444 ft), 8.02 ± 0.2 s | `o_autoland.mjs` ส่วน 3; [O32][O25] (est) |
| T-O-07 | A320 บน LOC และ G/S track, V/S 600 ถึง 1000 fpm | ความสูงที่ FMA เปลี่ยนเป็น LAND (RA < 400 ft ต่อเนื่อง 1.2 s) | 709 fpm: 385.8 ± 3 ft (117.6 m); ทุกกรณีอยู่ระหว่าง 350 ถึง 400 ft (106.7 ถึง 121.9 m); ถ้า LAND ไม่ขึ้นก่อน 350 ft ระบบต้องไม่ทำ autoland | `o_modes.mjs` ส่วน 2; [O32][O30][O26] |
| T-O-08 | 737-800 autoland ด้วย A/T ที่ ground speed 130, 142.1, 155 kt | ความสูงและเวลาที่เข้า RETARD, เวลาปลด A/T | RETARD เมื่อ RA ≤ 27 ft (8.23 m) หรือ 2.5 s หลัง FLARE แล้วแต่อย่างใดถึงก่อน: 2.50 ± 0.05 s (130 kt), 2.29 ± 0.10 s (142.1 kt), 2.10 ± 0.10 s (155 kt); คันเร่งถึง idle ภายใน ± 0.5 s ของการแตะพื้น; A/T ปลด 2.0 ± 0.2 s หลังแตะ | `o_modes.mjs` ส่วน 3; [O19][O16] |
| T-O-09 | 737-800 ลำดับ dual channel สามกรณี: (a) ไม่ engage AP ตัวที่สองก่อน 800 ft (b) FLARE ไม่ armed เมื่อถึง 350 ft (c) single channel ต่อลงไป | สถานะ FMA และ AP | (a) แสดง "1 CH" ไม่มี FLARE และไม่มี A/P go-around; (b) AP ทั้งสองปลดที่ 350 ± 10 ft (106.7 ± 3 m); (c) AP ต้องปลดก่อน 50 ft (15.2 m) มิฉะนั้นเตือน; กรณีปกติ: stabilizer trim nose up ที่ 400 ± 10 ft และ FLARE engage ที่ 50 ± 2 ft | [O19][O20] |
| T-O-10 | 6-DOF เต็มของแต่ละแบบ, 21R, ลมสงบ, น้ำหนักลงจอดตามหัวข้อ 2 และ 3, AP + A/THR | จุดแตะ, sink, ระยะห่างแนวกลาง, bank, ความเร็ว | แตะที่ s 150 ถึง 750 m (เป้า 380 ถึง 540 m), sink 0.5 ถึง 1.2 m/s (100 ถึง 240 fpm), \|y\| ≤ 2 m, \|φ\| ≤ 2°, ความเร็ว Vapp ± 5 kt | เกณฑ์ปฏิบัติการ [O8][O7]; ค่าเป้าจาก T-O-03, T-O-06 |
| T-O-11 | Monte Carlo N ≥ 200 ต่อแบบ: headwind 0 ถึง 25 kt, tailwind ถึง 10 kt, crosswind ถึง 15 kt, shear 8 kt ต่อ 100 ft, Dryden ปานกลาง, น้ำหนักและ CG สุ่ม | ค่าเฉลี่ยและ σ ของ x_TD, y_TD, sink | ค่าเฉลี่ย ± 4.753σ ต้องอยู่ใน 60 ถึง 823 m (200 ถึง 2700 ft); σ_y ≤ 3.82 m (737), 3.62 m (A320), 3.29 m (A330); σ_x ≤ 80.3 m ถ้าค่าเฉลี่ย 441.5 m; σ_sink ≤ 0.481 m/s; เกณฑ์ 2σ ของ AC 20-57A: σ_x ≤ 114.3 m, σ_y ≤ 4.11 m | `o_autoland.mjs` ส่วน 5; [O3] 131, [O2] 5.2.9.4, [O4] |
| T-O-12 | ชุดเดียวกับ T-O-11 | สัดส่วนการลงที่ผ่านเกณฑ์ความสำเร็จเชิงปฏิบัติการ | ≥ 95 % ของการลงต้องแตะใน 150 ถึง 750 m, ความเร็วแตะ ±5 kt, sink ≤ 360 fpm (1.83 m/s), bank ≤ 7°, rollout ห่างแนวกลาง ≤ 8 m | `o_autoland.mjs` ส่วน 5; [O8][O7] |
| T-O-13 | ชุดเดียวกับ T-O-11 พร้อม ROLL OUT | ระยะเบี่ยงแนวกลางช่วง rollout | เกิน 8.2 m (27 ft) น้อยกว่า 5 % ของการลง; เกิน 21.3 m (70 ft) ขณะความเร็วเกิน 40 kt (20.6 m/s) ต้องเป็น 0 ครั้ง | [O3] 338(a); [O1] |
| T-O-14 | ลมบน 21R (course จริง 208.72°): 209/20, 250/25, 270/24, 30/12, 200/40 kt | ส่วนประกอบลมและการอนุญาต autoland ต่อแบบ | 270/24: HW 11.5, XW 21.0 kt จึง A320, 737 (20 kt), A330 ไม่อนุญาต; 30/12: TW 12 kt จึง 737 อนุญาต (TW 15), A320 และ A330 ไม่อนุญาต; 200/40: HW 39.5, XW 6.1 kt จึงไม่อนุญาตทุกแบบ (ผู้ตรวจเปลี่ยนจาก 180/40 ซึ่งให้ HW 35.08 kt เกินขีด A330 35 kt เพียง 0.08 kt น้อยกว่า tolerance ± 0.1 kt ผลจึงไม่แน่นอน); 250/25: HW 18.8, XW 16.5 จึงอนุญาตทุกแบบ; ส่วนประกอบ ± 0.1 kt | `o_modes.mjs` ส่วน 5; [O28][O29][O20][O21] |
| T-O-15 | การ engage AP หลัง takeoff | เงื่อนไขที่ยอม engage | A320/A330: ไม่ก่อน RA 100 ft (30.5 m) และ 5 s หลัง liftoff; 737-800: ไม่ต่ำกว่า 400 ft AGL (122 m); ATR: ไม่ก่อน 12 s หลัง liftoff และไม่ได้บนพื้นทุกแบบ | [O28][O32][O29][O20][O33] |
| T-O-16 | ความสามารถ autoland ตามจำนวน AP และ A/THR | ข้อความ capability บน FMA | A320/A330: AP 2 ตัวกับ A/THR แสดง "CAT 3 DUAL", AP 1 ตัวกับ A/THR แสดง "CAT 3 SINGLE", ไม่มี A/THR แสดง "CAT 2"; 737: dual channel ปกติแสดง "LAND 3", ระบบสำรองเสียแสดง "LAND 2", AP ตัวเดียวแสดง "1 CH"; ATR: CAT 2 เท่านั้นและไม่มี autoland | [O28][O30][O23][O33] |
| T-O-17 | A320 ใต้ 200 ft (61 m) | ไฟเตือน AUTOLAND | LOC 0.30 dot ที่ 150 ft: เตือน; LOC 0.30 dot ที่ 10 ft: ไม่เตือน (ใต้ 15 ft); GS 1.2 dot ที่ 120 ft: เตือน; GS 1.2 dot ที่ 80 ft: ไม่เตือน (ใต้ 100 ft); RA สองตัวต่างกัน 16 ft: เตือน; ต่างกัน 14 ft: ไม่เตือน; AP ทั้งสองปลด: เตือน | [O30][O24]; `o_modes.mjs` ส่วน 4 (1/4 dot = 0.188° = 18.8 µA บน 21R) |
| T-O-18 | การเลือกทางวิ่งและ minima ตาม RVR และเพดานเมฆที่ DMK | LVP, ทางวิ่งที่ใช้ได้, ประเภท approach | RVR 2000 m: ไม่มี LVP ใช้ได้ทุกทางวิ่ง CAT I; RVR 600 m เพดาน 150 ft: LVP, เฉพาะ 21R; RVR 400 m: CAT II 21R; RVR 250 m: ต่ำกว่า minima (ไปสนามสำรองหรือรอ); CAT II RVR ตาม DH: 100, 113, 120 ft ใช้ 300 m, 130 ft ใช้ 400 m, 143 ft ใช้ 450 m | `o_modes.mjs` ส่วน 6; [O36][O37][O7] |
| T-O-19 | 737-800 ฉาก RA fault: RA ซ้ายแสดง −8 ft ขณะบินจริงที่ 1950 ft, A/T ใช้ RA ซ้าย, AP ขวา single channel | โหมด A/T และความเร็ว | FMA ของ A/T แสดง RETARD ภายใน 1 s หลังเงื่อนไข RA < 27 ft ครบ (1 s เป็นค่าเลือกเอง) แม้ RA อีกตัวอ่านราว 1950 ft (594 m); คันเร่งค้างที่ idle จนผู้เล่น override; ความเร็วลดต่อเนื่องจาก 144 kt (ในเหตุการณ์จริงถึงราว 110 kt ใต้ 500 ft); stick shaker ทำงานเมื่อ α ถึงเกณฑ์ของหัวข้อ 2 (เหตุการณ์จริงที่ราว 460 ft) | [O16][O17][O18] |
| T-O-20 | point mass พร้อม engine lag 1.5 s, กฎ PI แบบวางขั้ว ω = 0.15 rad/s, ζ = 0.8, ขั้น headwind +10 kt บน GS 3°, คำสั่งแรงขับจำกัดที่ 5 % ถึง 100 % T_max | เวลาที่ความเร็วกลับเข้า ±2 kt และ undershoot สูงสุด | (ก) PI ไม่มี anti-windup (ตามสคริปต์ผู้เขียน): 737 23.6 s, A320 23.1 s, A330 28.2 s ทั้งหมด ± 3 s โดยมี undershoot −3.6, −3.5, −4.1 kt ± 0.5 kt เพราะคำสั่งชนขีด idle แล้วตัวอินทิเกรตสะสม; (ข) แบบที่เสนอให้ใช้ คือ conditional-integration anti-windup: 7.9, 7.8, 9.5 s ± 1 s และ undershoot ไม่เกิน 1 kt; engine lag ถึง 95 % ใน 4.49 s ≤ 5 s ตาม 14 CFR 33.73(b) | `o_athr.mjs`; `orev_athr.mjs` (ผู้ตรวจ: ข้อความเดิม "ไม่มี overshoot เกิน 2 kt" ผิด); [O41] (est) |
| T-O-21 | เครื่องฝึกเดิม (regression), 21R, ลมสงบ, ค่า AFCS ของเครื่องฝึก, ground speed ตอนแตะ = `AC.Vref` 88 kt, ล้อหลักต่ำกว่า CG 1.37 m (`AC.gear`) และ CG อยู่บน GP (`gpHeight`) | h_F, sink, จุดแตะ | h_F 5.69 ± 0.1 m (18.7 ft), sink 0.22 ± 0.03 m/s (43 fpm), s = 447 ± 15 m (1467 ft) ในแบบ kinematic (ค่าเดิม 4.85 m / 417 m ของผู้เขียนคำนวณที่ 75 kt และ H = 1.0 m ซึ่งไม่ตรงกับเครื่องฝึก; ผู้ตรวจแก้); การทดสอบ autoland เดิม 94 ถึง 100 คะแนนต้องยังผ่าน | `orev_recompute.mjs` ส่วน D (เดิม `o_autoland.mjs` ส่วน 3); [O40] |
| T-O-22 | 6-DOF, approach จาก 1000 ft ลงถึง 100 ft บน 21R, Dryden ปานกลาง, crosswind 15 kt | ค่าเบี่ยง LOC ในช่วง 300 ft ถึง 100 ft HAT (ช่วงที่ AC 20-191 §4.2.6.2.2 กำหนด) | อยู่ภายใน ±25 µA (1/3 dot, ±0.25° บน 21R) อย่างน้อย 95 % ของเวลาในช่วงนั้น สำหรับ CAT II | [O2]; `o_modes.mjs` ส่วน 4 |

## ความขัดแย้งของแหล่งข้อมูลและข้อจำกัด

### ความขัดแย้งและค่าที่เลือก

| ประเด็น | แหล่งหนึ่ง | อีกแหล่ง | ค่าที่เลือก | เหตุผล |
|---|---|---|---|---|
| เอกสาร FAA ที่ใช้ได้ | AC 120-28D (1999) [O1] | AC 20-191 (20 MAY 2026) ยกเลิก AC 120-28D [O2] | อ้างทั้งสอง ตัวเลขความน่าจะเป็นเหมือนกัน | AC 20-191 เป็นฉบับปัจจุบัน แต่ WebFetch อ่านได้ถึง §5.2.9.6.2 เท่านั้น ส่วน appendix ของ AC 120-28D อ่านได้ครบกว่า |
| นิยาม alert height | CS-AWO 300(b)(6) ให้ AH เป็นความสูงที่ได้จากคุณลักษณะของระบบ ไม่กำหนดตัวเลข แต่ CS-AWO 312 กำหนดว่าสำหรับ fail-op ที่ DH < 50 ft หรือไม่มี DH "must be at least 30 m (100 ft)" [O3] หน้า 1-3-2 (ผู้ตรวจยืนยัน) | SRVSOP "100 ft or less above the threshold" [O8]; A330 ใช้ 200 ft [O29] | ใช้ค่าต่อแบบ: A320 100 ft, A330 200 ft | ค่าต่อแบบมาจากข้อจำกัดของผู้ผลิต (ผ่านสำเนา) ข้อความ SRVSOP เป็นค่าทั่วไป ค่า A330 มาจาก flashcard จึงให้ความเชื่อมั่นต่ำ |
| crosswind autoland ของ 737-800 | 25 kt (b737.org.uk) [O20] | 20 kt (สำเนา FCOM ของ MALEV) [O21] | 20 kt | ใกล้ FCOM มากกว่า และระมัดระวังกว่า; เก็บค่า 25 kt ไว้เป็นตัวเลือก `b737_800_xw25` ใน `o_modes.mjs` |
| tailwind autoland ของ 737-800 | 15 kt [O20] | 0 ถึง 15 kt ตามความสูงสนามและแฟลป (หน้าเดียวกัน) | 15 kt ที่ DMK (สนามสูง 9 ft) | ข้อจำกัดที่ลดลงใช้กับสนามสูงเท่านั้น ยืนยันในตาราง AFM ไม่ได้ จึงให้ความเชื่อมั่นกลาง |
| มุม GS สูงสุดของ A320 | 3.15° [O28] | 3.25° [O30] | 3.15° | [O28] เป็นบันทึกข้อจำกัดจากสายการบิน ส่วน [O30] เป็นเอกสารโมเดลจำลอง DMK ใช้ 3.0° จึงไม่มีผลในทางปฏิบัติ |
| ความสูงที่ A/THR ลดเป็น idle (Airbus) | 30 ft (เหตุการณ์ A340 ใน Safety First) [O24] | โมเดล FBW ขอ RETARD ที่ ≤ 40 ft [O32] | 30 ft | Safety First เป็นเอกสารของผู้ผลิต โค้ด FBW เป็นแบบจำลองที่ไม่ได้มาจากข้อมูล Airbus |
| ความสูง FLARE ของ A320 | "ราว 40 ft" [O30] | ฟังก์ชัน 45 ถึง 60 ft ตาม V/S ในโค้ด FBW [O32]; A321neo 100 ft (บันทึกหัวข้อ 8) [O42] | ฟังก์ชัน 45 ถึง 60 ft | เป็นรูปสมการที่ทดสอบได้และให้ sink ตอนแตะ 150 fpm ตรงกับช่วงจริง; ค่า 40 ft ใช้เป็นเกณฑ์ตรวจว่า h_F ไม่ต่ำกว่า 40 ft |
| เสียงเรียก RETARD | 10 ft ใน autoland [O30] (บทความ [O25] ไม่มีค่า 10 ft; ระบุเพียงว่า A220 สั่ง RETARD "between 20 and 15 ft AGL" ใน autoland) | 20 ft ในการลงด้วยมือ และเป็น "a reminder, not an order" [O25][O42] | แยกตามโหมด | ทั้งสองถูก แต่ใช้ในโหมดต่างกัน |
| 1 dot ของ GS | 0.35° (1.4°/4 ตาม FAA AIM) [O6] | 0.36° (0.0875 DDM ที่ 0.12θ ตามแบบจำลองสัญญาณของ EASA [O43] §2.1.4 ซึ่งใช้ค่าของ ICAO Annex 10; ผู้ตรวจรอบต่อยืนยัน); CASA ให้ความกว้าง 1° ถึง 1.5° [O11] | 0.36° (ความเชื่อมั่นกลาง) | DMK ใช้มาตรฐาน ICAO ความต่าง 0.01° น้อยกว่าความแม่นของการติดตาม ค่า 0.35° ของโค้ดเดิมใช้ต่อได้ |
| ความกว้าง LOC | 210 m ที่ threshold [O11] | 700 ft (213 m) ตาม FAA [O6]; EASA [O43] §2.2.2 ให้ความไว 0.00145 DDM/m ที่ Point T ซึ่งเท่ากับครึ่งความกว้าง 0.155/0.00145 = 106.9 m (ความกว้าง 3.06°, 3.05°, 3.62° บน 21R, 03L, 21L; 1 dot 21R = 0.765°) | 210 m | ผลที่ได้ตรงกับความกว้าง course ใน AIP (3.0°, 3.6°) ภายใน 0.05° ส่วนค่า 106.9 m ให้ 3.1°, 3.1°, 3.6° เมื่อปัดเป็นทศนิยมหนึ่งตำแหน่ง จึงตรง AIP น้อยกว่า (ความต่างของขนาด dot 1.8 %; ผู้ตรวจรอบต่อเพิ่มความขัดแย้งนี้) |
| RVR ขั้นต่ำ CAT I/II | ICAO/EASA 550 m และ 300 m [O7][O9] | FAA 2,400 ft (732 m) และ 1,200 ft (366 m) [O6] | ICAO/EASA | ประเทศไทยใช้ ICAO; CAAT อาจกำหนดค่าเพิ่มเติมที่ไม่พบในแหล่งสาธารณะ |
| แหล่งสรุป 737 | Smartcockpit ครอบคลุม 737-300 ถึง -900 [O19] | – | ใช้ค่า NG เมื่อแยกได้ | บางค่าในเอกสารเป็นของ Classic (เช่น ไม่มี ROLLOUT) จึงให้ความเชื่อมั่นกลาง |
| ระบบ fail-op ของ Boeing | 737NG "LAND 3" โดยใช้ AP สองตัวกับ ISFD [O23] | Boeing รุ่นใหญ่มี AP สามตัว (flashcard ที่น่าจะเป็น 747-400: flare 60 ถึง 40 ft, idle 25 ft, rollout 5 ft) [O12] | ใช้ [O23] กับ 737 | [O12] ไม่ใช่ 737 และไม่ระบุแบบ ใช้เป็นตัวอย่างลำดับเท่านั้น ไม่ใส่ใน JSON |
| เกณฑ์การกระจายจุดแตะ | ความน่าจะเป็น 10⁻⁶ ของ CS-AWO/AC 20-191 [O3][O2] | 2σ ของ AC 20-57A (1971) [O4] | ใช้ทั้งสองใน T-O-11 | AC 20-57A เก่าแต่ให้ตัวเลข 2σ ตรงที่สุด เกณฑ์ใหม่ (σ_x ≤ 80.3 m) เข้มกว่าเกณฑ์เก่า (114.3 m) |
| ข้อมูลจากงานวิจัย | NASA DIALS [O14] และ CR-3074 [O15] เป็นเครื่อง 737-100 วิจัย (CR-3074 ใช้ GS 6°) | – | ใช้เป็นช่วงอ้างอิงของ sink เท่านั้น | ไม่ใช่ระบบที่ใช้ในสายการบิน |
| ข้อความ ATR "80 ft RA" | ตาราง CAT 2 ของ FCOM: "Visual at DH 80 ft RA" แล้วเรียก "LANDING" และปลด AP [O33] 2.02.04 p.10 ถึง 11 | – | ไม่ใช้เป็นค่า DH ของ DMK; ค่าเริ่มต้น DH 100 ft ของ 21R | ผู้ตรวจยืนยันว่าเป็น DH ตัวอย่างใน RA (ไม่ใช่ความสูงปลด AP ต่ำสุด) แต่ DH ที่ใช้จริงขึ้นกับแผนภูมิของสนาม |

### ข้อจำกัดด้านใบอนุญาตและความน่าเชื่อถือ

- สำเนา FCOM และ FCTM บนเว็บไซต์บุคคลที่สาม ([O21], [O33]) เป็น "สำเนาไม่เป็นทางการ" ความเชื่อมั่นไม่เกินกลาง รายงานนี้อ้างเฉพาะตัวเลขรายค่าและข้อความสั้น ไม่คัดลอกยาว
- โค้ด FlyByWire A32NX [O32] และเอกสาร [O30][O31] เป็นโครงการจำลองแบบเปิด (โค้ด GPL-3.0) ไม่ใช่ข้อมูลจาก Airbus AirfieldLab ใช้ได้เฉพาะรูปสมการและตัวเลขที่อ้างถึง ห้ามคัดลอกโค้ด (เพราะจะทำให้ repo ต้องเป็น GPL)
- ค่าของ A330 ([O29] flashcard, [O27] ความเห็นนักบิน) มีความเชื่อมั่นต่ำ ค่า flare law ของ A330 ยืมจาก A320
- แรงขับสูงสุดใน `o_athr.mjs` เป็นค่าระดับ class ต้องแทนด้วยค่าของหัวข้อ 6 [O41] ความหน่วงของเครื่องยนต์ 1.5 s แบบอันดับหนึ่งถึง 95 % ใน 4.49 s ซึ่งอยู่ในเกณฑ์ 5 s ของ 14 CFR 33.73(b) ที่หัวข้อ 6 ใช้
- AC 25.1329-1C [O5] เป็นเกณฑ์อนุมัติ flight guidance system ทั่วไป ส่วนที่อ่านได้ให้เพียงเกณฑ์เชิงคุณภาพ (engage "free of perceptible transients", แรง override 25 lb (111 N) ที่คันบังคับ) ไม่มีตัวเลข MUH ต่อแบบ
- ค่าของ ATR 72-600 ในหัวข้อนี้สอดคล้องกับหัวข้อ 1 [O35] (ลม AP 29/10/17 kt) ไม่มีความขัดแย้ง

### ไม่พบในแหล่งสาธารณะ (ใช้ค่าประมาณที่ระบุไว้)

| รายการ | ค่าประมาณที่ใช้ | วิธี |
|---|---|---|
| alert height ของ 737-800 | AH 100 ft (ค่าประมาณ ใช้เฉพาะเมื่อจำลอง LAND 3 ตาม `b737_800.afcs.capability.AH`); LAND 2 ใช้ DH 50 ft | ข้อความผู้ประกอบการใน [O23] ไม่ให้ AH; 100 ft คือค่าต่ำสุดที่ CS-AWO 312 ยอม ("at least 30 m (100 ft)") และค่าทั่วไปของ SRVSOP [O8] (ผู้ตรวจแก้ให้ตรงกับ JSON ซึ่งเดิมเขียนว่า "ไม่ใช้ AH") |
| ความสูง ALIGN และ ROLLOUT engage ของ 737-800 | ALIGN 20 ft, ROLLOUT ที่ WOW | ใช้ค่าของ A320 |
| ความสูง FLARE ของ A330 | กฎ A320 (49.5 ft ที่ 140 kt) | ยืมกฎ |
| AP minimum use height บน ILS CAT I ของ ATR | 160 ft | ยืมค่าของ Airbus |
| gain ของ LOC/GS ของผู้ผลิต | T_y 8 s, T_χ 3 s, K_h 0.0028 rad/m | ค่าเดิมของ AirfieldLab ที่บินผ่าน |
| rate limit ของ A/THR และ A/T | idle ใน 2 s | เลือกเอง |
| อุปกรณ์จริงของสายการบินไทยที่ DMK (rollout option, HUD) และการอนุมัติ CAT II/III จาก CAAT | ถือว่ามี CAT II ทุกลำและ autoland ได้ | ไม่พบข้อมูลสาธารณะ |
| ข้อความ AIP AD 2.20 (LVP) รอบ AIRAC ปัจจุบัน | ตามข้อความที่หัวข้อ 5 รอบที่ 5 อ่านไว้ [O37] | ยืนยันกับ AIP ฉบับปัจจุบันไม่ได้ |
| RVR ขั้นต่ำ CAT II ของ 21R ที่ประกาศ | 300 m ตาม DH 100 ถึง 120 ft | ตาราง EASA [O7] |

## แหล่งอ้างอิง

รูปแบบ: ผู้เขียนหรือองค์กร, ชื่อเรื่อง, วันที่, URL, ประเภท (ปฐมภูมิหรือทุติยภูมิ), ใบอนุญาต, และสิ่งที่ AirfieldLab (repo สาธารณะ) ทำได้ ทุกแหล่งเข้าถึงในเดือน NOV 2026 "อ้างตัวเลข" หมายถึงใช้ค่าตัวเลขและข้อความสั้นพร้อมระบุแหล่ง โดยไม่คัดลอกเนื้อหายาว

**ข้อกำหนดรับรองและนิยาม**

- **[O1]** FAA, AC 120-28D "Criteria for Approval of Category III Weather Minima for Takeoff, Landing, and Rollout", 13 JUL 1999 (ยกเลิก 20 MAY 2026 โดย AC 20-191), appendices: https://www.faa.gov/documentLibrary/media/Advisory_Circular/AC120-28Dappdx.pdf หน้าข้อมูล: https://www.faa.gov/regulations_policies/advisory_circulars/index.cfm/go/document.information/documentid/22750 ปฐมภูมิ; งานของรัฐบาลสหรัฐ (public domain); ใช้ตัวเลข ยกข้อความ และใส่ใน test ได้
- **[O2]** FAA, AC 20-191 "Airworthiness Approval of Airborne Systems used for Takeoff, Precision Approach, Landing, and Rollout in Low-Visibility Conditions", 20 MAY 2026, https://www.faa.gov/documentLibrary/media/Advisory_Circular/AC_20-191.pdf ปฐมภูมิ; public domain; ใช้ได้เต็มที่พร้อมอ้างแหล่ง (อ่านได้ถึง §5.2.9.6.2)
- **[O3]** EASA, CS-AWO "Certification Specifications for All Weather Operations" Book 1 และ Book 2 (AMC), Decision 2003/6/RM, 17 OCT 2003, https://www.easa.europa.eu/fr/downloads/1643/en ปฐมภูมิ; © EASA อนุญาตทำซ้ำเมื่ออ้างแหล่ง; อ้างตัวเลขและข้อความสั้นได้ (มี Issue 2 ปี 2022 ที่ยังไม่ได้อ่าน)
- **[O4]** FAA, AC 20-57A "Automatic Landing Systems (ALS)", 12 JAN 1971, สำเนาของ DOT ROSA P: https://rosap.ntl.bts.gov/view/dot/71032/dot_71032_DS1.pdf ปฐมภูมิ (เก่า); public domain; ใช้ได้เต็มที่
- **[O5]** FAA, AC 25.1329-1C "Approval of Flight Guidance Systems", 27 OCT 2014, https://www.faa.gov/documentLibrary/media/Advisory_Circular/AC_25_1329-1C.pdf ปฐมภูมิ; public domain; ใช้ได้เต็มที่ (อ่านได้บางส่วน)
- **[O6]** FAA, Aeronautical Information Manual §1-1-9 "Instrument Landing System (ILS)", ฉบับออนไลน์ (วันที่หัวหน้าไม่ชัด), https://www.faa.gov/air_traffic/publications/atpubs/aim/aim0101.html ปฐมภูมิ (สหรัฐ); public domain; ใช้ได้เต็มที่
- **[O7]** Uganda Civil Aviation Authority, CAA-AC-GEN027 "Cat II, Cat III and Low Visibility Operations", JAN 2023, https://caa.go.ug/wp-content/plugins/download-attachments/includes/download.php?id=79392 ทุติยภูมิสำหรับนิยาม ICAO/EASA (เอกสารราชการที่เรียบเรียงจาก EASA AMC); ไม่ระบุใบอนุญาต; อ้างตัวเลข
- **[O8]** SRVSOP (ICAO Regional Safety Oversight System), AC 91-020 "Operator and Aircraft Approval for CAT II and CAT III Operations", 11 APR 2013, สำเนาของ DINACIA Uruguay: https://viejo.dinacia.gub.uy/operaciones/item/download/795_3ec62d87dec53a83d33bb78311840555.html ปฐมภูมิระดับภูมิภาค; ไม่ระบุใบอนุญาต; อ้างตัวเลข
- **[O9]** J. Bernage (Airbus Flight Operations) สำหรับ ICAO WACAF Regional Seminar, "Workshop LVO", Dakar 30 JUN ถึง 5 JUL 2025, https://www2023.icao.int/WACAF/Documents/Meetings/2025/Regional-Seminar-Aircraft-2025/ICAO_WACAF_Workshop_LVO.pdf ทุติยภูมิ (สไลด์บรรยาย); © ICAO/Airbus; อ้างตัวเลข

**สัญญาณ ILS**

- **[O10]** H.-G. Titze, Rohde & Schwarz Application Note 1GPAN11E "ILS Test Procedures using the Signal Generator SMT", JUN 1994, https://cdn.rohde-schwarz.com.cn/pws/dl_downloads/dl_application/application_notes/1gpan11/1GPAN11_0E.pdf ทุติยภูมิ (ผู้ผลิตเครื่องทดสอบ อ้างค่า ICAO); © Rohde & Schwarz; อ้างตัวเลข
- **[O11]** Civil Aviation Safety Authority (Australia), "Instrument Landing System Operational Notes" (พิมพ์ซ้ำจากคู่มือเก่า, อัปโหลด SEP 2021), https://www.casa.gov.au/sites/default/files/2021-09/operational-notes-on-instrument-landing-system.pdf ทุติยภูมิ; © Commonwealth of Australia; อ้างตัวเลข

- **[O43]** EASA, Easy Access Rules for All Weather Operations (CS-AWO), ส่วน "Signal-in-space models for approach and landing simulation and fault analysis" §2.1.4 (GS: 0.0875 DDM ที่ 0.12θ) และ §2.2.2 (LOC: 0.00145 DDM/m ที่ Point T), https://www.easa.europa.eu/en/document-library/easy-access-rules/online-publications/easy-access-rules-all-weather-operations-cs?page=24 ปฐมภูมิ (ข้อกำหนดของหน่วยงานกำกับ); © EASA ทำซ้ำได้เมื่ออ้างแหล่ง; อ้างตัวเลขและสมการ (ผู้ตรวจรอบต่อเพิ่ม)

**Boeing 737**

- **[O12]** Brainscape (ผู้ใช้ไม่ระบุชื่อ), flashcards "4 - Automatic Flight" (ไม่ระบุแบบ น่าจะเป็น 747-400), ไม่ลงวันที่, https://www.brainscape.com/flashcards/4-automatic-flight-7106234/packs/11469408 ทุติยภูมิไม่เป็นทางการ ความเชื่อมั่นต่ำ; © ผู้สร้าง; ใช้เป็นตัวอย่างลำดับเท่านั้น ไม่ใส่ใน JSON
- **[O13]** A. A. Lambregts and R. Hansen (The Boeing Company), US Patent 4,354,237 "Method and apparatus for producing an aircraft flare path control signal", ยื่น 24 JUN 1980, ออก 12 OCT 1982, https://uspto.report/patent/grant/4354237 ปฐมภูมิ; ข้อความสิทธิบัตรเป็นสาธารณะและสิทธิบัตรหมดอายุแล้ว; ใช้สมการได้อิสระ อ้างข้อความสั้นได้
- **[O14]** R. M. Hueschen (NASA Langley), "Flight Test Results for the Digital Integrated Automatic Landing System (DIALS): A Modern Control Full-State Feedback Design", First Annual NASA Aircraft Controls Workshop, OCT 1983, pp. 411-428, https://ntrs.nasa.gov/api/citations/19840012521/downloads/19840012521.pdf ปฐมภูมิ (งานวิจัยบินจริงบน 737-100 ของ NASA); public domain; ใช้ได้เต็มที่
- **[O15]** N. Halyo, NASA CR-3074 "Development of a Digital Guidance and Control Law for Steep Approach Automatic Landings Using Modern Control Techniques", FEB 1979, https://ntrs.nasa.gov/api/citations/19790008653/downloads/19790008653.pdf ปฐมภูมิ (งานวิจัย); รายงานผู้รับจ้าง NASA เผยแพร่สาธารณะบน NTRS; อ้างตัวเลขและสมการ
- **[O16]** Dutch Safety Board (Onderzoeksraad voor Veiligheid), "Crashed during approach, Boeing 737-800, near Amsterdam Schiphol Airport, 25 February 2009", final report, MAY 2010, project M2009LV0225_01; อ่านผ่านข้อความที่ยกใน https://code7700.com/case_study_turkish_airlines_1951.htm และหน้าประกาศผล https://www.onderzoeksraad.nl/nl/page/6656/dutch-safety-board-presents-results-investigation-into-crash-turkish ปฐมภูมิ (รายงานของรัฐ ผ่านแหล่งที่สอง); รายงานสาธารณะ; อ้างตัวเลขและข้อความสั้น
- **[O17]** Dutch Safety Board, preliminary report on TK1951, APR 2009, สำเนาของ UK Flight Safety Committee: https://www.ukfsc.co.uk/wp-content/uploads/public_pdfs/Flight-Ops-Prelimenary-Report-Turkish-Airlines-Accident-April-2009-1.pdf (อ่านผ่านบันทึก `notes/b737-800-run1.md` N103) ปฐมภูมิ; รายงานสาธารณะ; อ้างตัวเลข
- **[O18]** Flight Safety Foundation, AeroSafety World JUN 2010 pp. 32-36 (บทความสรุปรายงาน TK1951), https://flightsafety.org/wp-content/uploads/2016/11/asw_jun10_p32-36.pdf (อ่านผ่านบันทึก N106) ทุติยภูมิ; © FSF; อ้างตัวเลขและข้อความสั้น
- **[O19]** L. Andre, Smartcockpit "Boeing 737 Systems Review: Automatic Flight" (737-300 ถึง -900, version 00), ไม่ลงวันที่, สำเนาบน flaps2approach: https://www.flaps2approach.com/s/737-Automatic-Flight-Systems-Summary.pdf ทุติยภูมิ (สรุปจาก FCOM) สำเนาไม่เป็นทางการ ความเชื่อมั่นกลาง; © ผู้เขียนและ Boeing; อ้างตัวเลขเท่านั้น
- **[O20]** C. Brady, The Boeing 737 Technical Site "Limitations" (พิมพ์ 19 AUG 2021), สำเนาบน pdfcoffee: https://pdfcoffee.com/boeing-737-limitations-pdf-free.html ทุติยภูมิ ("Not all limitations given here are AFM"); © C. Brady; อ้างตัวเลข
- **[O21]** Boeing, 737NG FCOM (ฉบับของ MALEV) สำเนาไม่เป็นทางการ: https://www.737ng.co.uk/737NG%20POH.pdf (ผ่านหัวข้อ 2 [B44]) ปฐมภูมิผู้ผลิตแต่เป็นสำเนา ความเชื่อมั่นไม่เกินกลาง; © Boeing; อ้างตัวเลขรายค่าเท่านั้น
- **[O22]** EASA, Type-Certificate Data Sheet IM.A.120 Boeing 737, Issue 29, 16 DEC 2025, https://www.easa.europa.eu/en/downloads/7297/en (ผ่านหัวข้อ 2 [B3]; ผู้ตรวจรอบต่อเปิดเอง: Section 2 "737 NG series" item III.12 p.14 "All Weather Capability: Cat 3"; Section 4.1 ของ 737-800 item III.12 p.28 เขียน "See Airplane Flight Manual") ปฐมภูมิ; © EASA ทำซ้ำได้เมื่ออ้างแหล่ง; อ้างตัวเลข
- **[O23]** PPRuNe Tech Log, "How technically does the ISFD help Fail Operational ops on NG", OCT 2016, https://www.pprune.org/tech-log/printthread-586214-how-technically-does-isfd-help-fail-opertaional-ops-ng.html ทุติยภูมิ (ความเห็นนักบิน) ความเชื่อมั่นต่ำ; © ผู้โพสต์; อ้างข้อความสั้น

**Airbus**

- **[O24]** C. Norden (Airbus), "Automatic Landings in Daily Operation", Safety First Issue 12, JUL 2011, pp. 26-28; สำเนา: https://dru10.imibo.com/bookshelf/books/3827.pdf (ต้นฉบับ https://safetyfirst.airbus.com/app/themes/mh_newsdesk/documents/archives/automatic-landings-in-daily-operation.pdf ถูกบล็อก) ปฐมภูมิผู้ผลิต; © Airbus; อ้างตัวเลขและข้อความสั้น
- **[O25]** R. Geuter, S. Gupta, T. Lepagnot, M. Le-Louer (Airbus), "A Focus on the Landing Flare", Safety First ออนไลน์ (ราวปี 2021), https://safetyfirst.airbus.com/a-focus-on-the-landing-flare/amp ปฐมภูมิผู้ผลิต; © Airbus; อ้างตัวเลข
- **[O26]** PPRuNe Tech Log, "A320 LAND/RWY FMA's" (โพสต์ของ FlightDetent 2 MAY 2021 ที่อ้าง FCOM), https://www.pprune.org/tech-log/printthread-640204-a320-land-rwy-fma-s.html ทุติยภูมิ ความเชื่อมั่นกลาง; © ผู้โพสต์; อ้างข้อความสั้น
- **[O27]** PPRuNe, "Airbus Alert Height - What is it?", JAN 2009, https://www.pprune.org/archive/index.php/t-357358.html ทุติยภูมิ ความเชื่อมั่นต่ำ; © ผู้โพสต์; อ้างข้อความสั้น
- **[O28]** theairlinepilots.com, "A320 Limitations" (บันทึกนักบิน ปรับปรุง 1 SEP 2023), https://www.theairlinepilots.com/forumarchive/a320/a320-limitations.pdf (= หัวข้อ 3 [L14]) ทุติยภูมิ สำเนาไม่เป็นทางการ ความเชื่อมั่นกลาง; © ผู้จัดทำและ Airbus; อ้างตัวเลข
- **[O29]** Brainscape (ผู้ใช้ไม่ระบุชื่อ), "A330 LIMITATIONS" (อ้าง FCOM), https://brainscape.com/flashcards/a330-limitations-1247278/packs/2771041 ทุติยภูมิ ความเชื่อมั่นต่ำ; © ผู้สร้าง; อ้างตัวเลข
- **[O30]** FlyByWire Simulations, A32NX Pilot's Corner "Autoland", https://docs.flybywiresim.com/pilots-corner/a32nx/a32nx-advanced-guides/flight-guidance/autoland/ ทุติยภูมิ (เอกสารโครงการจำลอง ไม่ใช่ Airbus); ไม่ได้ตรวจใบอนุญาตของหน้าเอกสาร จึงถือว่าสงวนสิทธิ์; อ้างตัวเลขเท่านั้น
- **[O31]** FlyByWire Simulations, A32NX Pilot's Corner "Flight Guidance: Overview", https://docs.flybywiresim.com/pilots-corner/a32nx/a32nx-advanced-guides/flight-guidance/overview/ ทุติยภูมิ; เหมือน [O30]; อ้างชื่อโหมด
- **[O32]** FlyByWire Simulations, ซอร์สโค้ด A32NX v0.10.0 (`AutopilotStateMachine.cpp`, `AutopilotLaws.cpp`, `Autothrust.cpp`), https://raw.githubusercontent.com/flybywiresim/aircraft/v0.10.0/fbw-a32nx/src/wasm/fbw_a320/src/model/ ทุติยภูมิ (แบบจำลอง); GPL-3.0; ใช้ได้เฉพาะรูปสมการและตัวเลขที่อ้าง ห้ามคัดลอกโค้ดเข้า repo

**ATR 72-600**

- **[O33]** ATR, ATR 72 FCOM 2.02 "Procedures and Techniques" (rev 001 APR 2011, -600), สำเนาไม่เป็นทางการ: https://pdfcoffee.com/atr-72-procedures-and-techniques-pdf-free.html (= หัวข้อ 1 [R16]) ปฐมภูมิผู้ผลิตแต่เป็นสำเนา ความเชื่อมั่นไม่เกินกลาง; © ATR; อ้างตัวเลขรายค่าเท่านั้น
- **[O34]** ATR, ข่าวประชาสัมพันธ์ "ATR obtains EASA certification for developments on ATR-600 avionics suite", Toulouse 24 NOV 2014, https://www.atr-aircraft.com/wp-content/uploads/2020/07/atr_standard_2_en_1298.pdf ปฐมภูมิ; ข่าวประชาสัมพันธ์ อ้างได้
- **[O35]** AirfieldLab research รอบที่ 3, `01-atr72-600.md` (หัวข้อ 3.1 ATR 72-600) ทุติยภูมิภายในโครงการ; ใบอนุญาตเดียวกับ repo

**ดอนเมืองและภายในโครงการ**

- **[O36]** CAAT/AIS Thailand, AIP Thailand AD 2 VTBD, AIRAC 14 MAY 2026, https://aip.caat.or.th ปฐมภูมิ; © CAAT; อ้างตัวเลขพร้อมแหล่งตามกฎของเจ้าของโครงการ
- **[O37]** AirfieldLab research รอบที่ 5, `context/r5-5a-aip.md` และ `context/r5-5b-airport.md` (สรุป AIP AD 2.14, 2.19, 2.20 และแผนภูมิ ILS Z RWY 21R) ทุติยภูมิภายในโครงการ; ใบอนุญาตเดียวกับ repo
- **[O38]** AirfieldLab research รอบที่ 3, `05-airport-geometry.md` (หัวข้อ 3.5: ความสูงตาถึงล้อและระยะสายอากาศ) ภายในโครงการ
- **[O39]** AirfieldLab research รอบที่ 3, `03-a320-a321.md` (หัวข้อ 3.3: โครง `_inherits` ของตระกูล A320) ภายในโครงการ
- **[O40]** AirfieldLab, `src/20-flight.js` (`class Autopilot` บรรทัด 343 ถึง 424, `FIELD.locDot`, `FIELD.gsDot`) โค้ดของโครงการเอง
- **[O41]** AirfieldLab research รอบที่ 3, `06-jet-engines.md` (หัวข้อ 3.6: spool-up ตาม 14 CFR 33.73(b), แรงขับ) ภายในโครงการ
- **[O42]** AirfieldLab research รอบที่ 3, `08-fbw-laws.md` (หัวข้อ 3.8: บันทึก RETARD callout และ flare ของ A321neo) ภายในโครงการ

## งานที่แนะนำสำหรับ Claude Code

ทุกงานที่เปลี่ยนแบบจำลองการบินทำบน branch และเปิด pull request ตามกฎของโครงการ เขียน Node test ก่อนปรับค่าด้วยการบินในเบราว์เซอร์ ไฟล์ `10-atmo.js`, `15-geo.js`, `20-flight.js` ต้องไม่มี DOM

| รหัส | ลำดับและขนาด | งาน | test |
|---|---|---|---|
| O-T1 | P1 S | คำนวณ `locDot` ต่อทางวิ่งจาก `RWY_END[id].locDist` ด้วย atan(105/locDist)/2 แทนค่าคงที่ 0.91° และตั้ง `gsDot` เป็น 0.36° (เก็บ 0.35° เป็นตัวเลือก) | T-O-01 |
| O-T2 | P1 M | เพิ่มตัวจัดการโหมด AFCS ต่อแบบใน `Autopilot` (state machine อ่าน `afcs.modes` และ `afcs.sequence` จาก JSON): LAND ที่ 400 ft, FLARE, RETARD, ROLL OUT สำหรับ Airbus และ 1 CH/LAND 2/LAND 3, FLARE armed, RETARD 27 ft หรือ 2.5 s สำหรับ 737 พร้อมข้อความ FMA | T-O-05, T-O-07, T-O-08, T-O-09 |
| O-T3 | P1 M | flare law ต่อแบบตามรูป ḣ = −(h + h_B)/τ: 737 ใช้ h_F 50 ft และ V_G·τ คงที่, Airbus ใช้ฟังก์ชัน h_F 45 ถึง 60 ft และ sink เป้า 2.5 ft/s, เครื่องฝึกคงค่าเดิม; เพิ่ม feed-forward ของ ḧ_cmd | T-O-03, T-O-04, T-O-05, T-O-06, T-O-21 |
| O-T4 | P1 S | เพิ่มบล็อก `afcs` ใน JSON ของแต่ละแบบ (b737_800, a320ceo และลูกผ่าน `_inherits`, a330_300, atr72_600, common_airliner) ตามหัวข้อ "ค่าพารามิเตอร์" พร้อม test ตรวจคีย์ของ leaf | ทุกกรณี |
| O-T5 | P2 M | ตัวรับ ILS: คำนวณ ε_LOC, ε_GS จากตำแหน่งสายอากาศ แปลงเป็น dot และ µA เพิ่มสัญญาณรบกวนและ beam bend; ไฟเตือน AUTOLAND ของ Airbus (LOC 1/4 dot, GS 1 dot, RA ต่างกัน 15 ft) | T-O-17, T-O-22 |
| O-T6 | P2 L | ชุดทดสอบ Monte Carlo "autoland certification check" (N ≥ 200 ต่อแบบ, ลมตาม AC 20-57A, Dryden) รายงานค่าเฉลี่ยและ σ ของจุดแตะ, sink, rollout แล้วเทียบเกณฑ์ 10⁻⁶ และ 2σ | T-O-10, T-O-11, T-O-12, T-O-13 |
| O-T7 | P2 S | การตรวจลมและ minima ก่อน approach: ส่วนประกอบลมบนทางวิ่ง, ขีดลม autoland ต่อแบบ, LVP ของ DMK (RVR < 550 m หรือเพดาน < 200 ft ใช้ได้เฉพาะ 21R), CAT II RVR ตาม DH และฉากฝึก 4 ฉากใน 3.9.10 | T-O-14, T-O-18 |
| O-T8 | P2 M | A/THR และ A/T บนสัดส่วนแรงขับพร้อมความหน่วงของเครื่องยนต์จากหัวข้อ 6 (gain แบบวางขั้วใน `o_athr.mjs`), alpha floor ของ Airbus และ THR HLD ของ 737 | T-O-20 |
| O-T9 | P3 S | ฉาก RA fault แบบ TK1951 (RA สองชุด, A/T ใช้ RA ซ้าย) | T-O-19 |
| O-T10 | P3 M | AFCS ของ ATR 72-600 (ไม่มี A/T, ไม่มี autoland, AP ปลดที่ DH) และเงื่อนไข engage หลัง takeoff ของทุกแบบ | T-O-15, T-O-16 |
| O-T11 | P3 M | แสดง FMA และ capability (CAT 3 DUAL/SINGLE, CAT 2, LAND 3/LAND 2/1 CH) บน HUD เป็นภาษาไทยพร้อมคำย่อภาษาอังกฤษ และลดระดับ capability เมื่อมีความล้มเหลว | T-O-16 |

## บันทึกการตรวจทาน

ผู้ตรวจอิสระ วันที่ 2026-11-18 ตรวจตัวเลขราว 300 ค่าใน 63 แถวด้านล่าง (แต่ละแถวอาจรวมหลายค่าจากแหล่งเดียวกัน) โดยเปิดแหล่งเองด้วย WebFetch, curl (ซอร์ส FBW) และอ่านไฟล์ในโครงการ และคำนวณผลคาดหวังของ test ซ้ำด้วยสคริปต์ของผู้ตรวจ

รอบตรวจต่อ (ผู้ตรวจอิสระคนที่สอง วันที่ 2026-11-18): ทำต่อจากรอบแรกที่หยุดเพราะโควตา WebFetch หมด เปิดแหล่งที่รอบแรกยังไม่ได้เปิด ([O8], [O9], [O22], [O23], [O26], [O27], [O21], [O17], [O5], [O12]) และเปิดซ้ำบางแหล่ง ([O2], [O3], [O19], [O24], [O28], [O30], [O33], [O10], ซอร์ส [O32]) ตรวจตัวเลขเพิ่มราว 160 ค่า (รวมค่าที่คำนวณซ้ำด้วยวิธีที่สองใน `scripts/orev2_crosscheck.mjs`) แถวของรอบต่อขึ้นต้นผลด้วย "(รอบต่อ" และแถว [O8] ของรอบแรกถูกแทนด้วยผลที่ตรวจได้

| รายการ | ค่าในรายงาน | ค่าจากแหล่ง | แหล่ง | ผล (ตรง / แก้แล้ว / ยืนยันไม่ได้) |
|---|---|---|---|---|
| FBW flare law: ḣ_cmd = −h/τ − 2.5 ft/s, τ = h_F/(R − 2.5) | ตามรายงาน | `Tau = H/(R − 2.5)`, `H_bias = Tau·R − H` (= 2.5·τ), `Vz = −(H + H_bias)/Tau` | [O32] `AutopilotLaws.cpp` v0.10.0 บรรทัด 2141 ถึง 2150 (curl จาก raw.githubusercontent.com) | ตรง |
| FBW เงื่อนไข FLARE h_F = clamp(\|V/S\|/15, 45, 60) ft | 45 ถึง 60 ft, time-to-go 4 s | `H_radio < 60 && (H·15 ≤ \|VS\| \|\| H ≤ 45)` | [O32] `AutopilotLaws.cpp` บรรทัด 2526 ถึง 2528 | ตรง |
| FBW LAND รอ 1.2 s ใต้ 400 ft | 1.2 s, 400 ft | `H_radio_ft >= 400` รีเซ็ตเวลา; `>= 1.2` และ LOC/GS track | [O32] `AutopilotStateMachine.cpp` บรรทัด 3301 ถึง 3309 | ตรง |
| FBW LOC* / LOC / G/S* | 1.92°, 0.16°, 0.1333° (และ ε_GS ≥ −0.1°) | `b_R < 1.92`, `>= 0.16`, `Phi2 < 0.1333`, `nav_gs_error_deg >= -0.1` | [O32] `AutopilotStateMachine.cpp` บรรทัด 3270, 3289, 3802 ถึง 3807 | ตรง |
| FBW RETARD request | ≤ 40 ft | `H_radio_ft <= 40.0` → `athr_requested_mode_RETARD` | [O32] `AutopilotStateMachine.cpp` บรรทัด 1738 ถึง 1741 | ตรง |
| FBW AP engage หลัง takeoff | RA > 100 ft และ ≥ 5 s | `H_radio_ft > 100.0 && ... > 5.0`; `time_since_lift_off >= 5.0` | [O32] `AutopilotStateMachine.cpp` บรรทัด 3051, 472 | ตรง |
| FBW RWY arm: คันเร่ง | "คันเร่ง ≥ CL" | `throttle_lever_pos >= 35.0` (TLA 35° = FLX/MCT; CL = 25°), V2 ≥ 90, flap ≥ 1, LOC ≤ 0.4° | [O32] `AutopilotStateMachine.cpp` บรรทัด 514 ถึง 519 | แก้แล้ว (เป็น ≥ FLX/MCT) |
| FBW NAV engage | RA ≥ 30 ft | `H_radio_ft >= 30.0` | [O32] `AutopilotStateMachine.cpp` บรรทัด 240, 3145 | ตรง |
| CS-AWO 131(c) ขีดจุดแตะพื้น | 60 m (200 ft), 823 m (2700 ft), 21 m (70 ft) | "60 m (200 ft)", "823m (2700 ft) from threshold", "outboard landing gear more than 21 m (70 ft)" | [O3] Book 1 หน้า 1-1-2 | ตรง |
| AMC AWO 131 §1.4 average/limit | 10⁻⁶/10⁻⁵; 914 m limit 10⁻⁵; bank 10⁻⁸/10⁻⁷ | ตารางตรงตามรายงานทุกช่อง (bank: average 10⁻⁸, limit 10⁻⁷); นิยาม Average/Limit ใน NOTE ใต้ตาราง | [O3] Book 2 หน้า 2-1-2 | ตรง |
| CS-AWO 338(a)(b) rollout | 8.2 m (27 ft) < 5 %; 21.3 m (70 ft) ที่ > 40 kt, 10⁻⁶ | "more than 8·2 m (27 ft)" "less than 5%"; "21·3 m (70 ft)" "74km/h (40 knots)" | [O3] หน้า 1-3-4 ถึง 1-3-5 | ตรง |
| CS-AWO 312 alert height | "at least 100 ft" (ขัดแย้งกับ SRVSOP) | "an alert height must be established in accordance with CS–AWO 365(a) and must be at least 30 m (100 ft)" สำหรับ fail-op ที่ DH < 50 ft | [O3] หน้า 1-3-2 | ตรง (ความขัดแย้งระบุไว้แล้ว; เพิ่มคำอธิบายในตารางความขัดแย้ง) |
| AC 20-57A การกระจาย 2σ | 1500 ft (457 m) รวม, 27 ft (8.2 m) ต่อข้าง, ≥ 200 ft จาก THR | "should not exceed 1500 feet total"; "should not exceed 27 feet either side"; "at least 200 feet beyond the threshold"; "two-sigma basis (95.5% ...)" | [O4] Par. 5a, 5b(3), 5b(4) หน้า 2 ถึง 3 | ตรง |
| AC 20-57A สภาพสาธิต | HW 25, TW 10, XW 15 kt, shear 8 kt/100 ft | "Headwinds up to 25 knots; tailwinds up to 10 knots; crosswinds up to 15 knots; moderate turbulence, wind shear of 8 knots per 100 feet from 200 feet to touchdown" | [O4] Par. 5b(1) หน้า 2 | ตรง |
| AC 120-28D App 3 §6.3.1 sink / bank | 10 ft/s (3.05 m/s); bank 10⁻⁷ (FAA) | "a sink rate at touch down not greater than 10 f.p.s."; "Bank angle ... probability of 1 x 10-7" | [O1] App 3 หน้า 8 | ตรง |
| AC 120-28D rollout | 70 ft; "taxi ราว 30 kt" | §6.3.3(a) 70 ft (21.3 m) ไม่มี 40 kt (40 kt มาจาก CS-AWO 338(b) เท่านั้น); App 1 "safe taxi speed (in the order of 30 knots)" | [O1] App 1 หน้า 6, App 3 หน้า 9 | ตรง (ตัวเลข 40 kt อ้าง [O3] ไม่ใช่ [O1]) |
| AC 20-191 ความสำเร็จ CAT II / LOC ±25 µA | 95 %; ±25 µA 95 % ของเวลา | §4.2.9 "at least 95%"; §4.2.6.2.2 "within ±25 microamps deviation) from the indicated course, for 95% of the time" ในช่วง 300 ft ถึง 100 ft HAT | [O2] | แก้แล้ว (เพิ่มช่วงความสูง 300 ถึง 100 ft ใน 3.9.4 และ T-O-22 ซึ่งเดิมวัดจาก 1000 ft) |
| AC 20-191 วันที่และการยกเลิก | 20 MAY 2026, ยกเลิก AC 120-28D | effective date 05/20/2026; §1.3.1 "cancel both AC 120-29A and AC 120-28D" | [O2] | ตรง |
| DDM เต็มสเกล LOC/GS | 0.155 / 0.175 DDM = 150 µA, "[O10] p.5" | "DDM: 0.155" (LOC) และ "DDM: 0.175" (GS) แล้ว "Verify CDI ... full scale ( 150µA )" (ความสัมพันธ์มาจากขั้นตอนทดสอบ ไม่ได้เขียนเป็นประโยคตรง) | [O10] หน้า 6 §1.2.1 ถึง 1.2.2 | แก้แล้ว (เลขหน้าเป็น p.6 และเพิ่มคำอธิบาย) |
| ความกว้าง LOC ที่ threshold และ GS | 210 m (5° uncategorised); GS 1° ถึง 1.5° | "adjusted to 210 metres wide at the landing threshold"; "normally 5° for uncategorised systems"; GS "varies from 1° to 1.5°" | [O11] หน้า 3-1, 3-2 | ตรง |
| FAA AIM 1-1-9 | 700 ft; GS 1.4°; CAT I RVR 2400 ft; CAT II RVR 1200 ft | "700 feet at the runway threshold"; "1.4 degrees wide (vertically)"; "DH 200 feet and RVR 2,400 feet"; "DH 100 feet and RVR 1,200 feet" | [O6] ¶1-1-9 b.2, d.2, i.1 | ตรง |
| FAA "No critical area protective action" | "เมื่อสภาพอากาศดีกว่า minima" | ใช้เมื่อ ceiling ≥ 800 ft และ/หรือ visibility ≥ 2 SM | [O6] ¶1-1-9 k.2(b)(1) | แก้แล้ว (ระบุเงื่อนไขอากาศให้ตรง) |
| สิทธิบัตร 4,354,237: K, h_B | K = 0.205 s⁻¹, h_B = 12 ft | "the value of K.sub.h /K.sub.h is assumed to be 0.205 and the value of h.sub.B is assumed to be 12"; ผู้ประดิษฐ์ Lambregts, Hansen; ยื่น 24 JUN 1980 ออก 12 OCT 1982 | [O13] | ตรง |
| สิทธิบัตร: ความสูง flare และความไว | 42 ft ที่ 125 kt; 6 ft ต่อ 15 kt; ระยะแตะ ~200 ft ต่อ 15 kt | "approximately 42 feet" (ไม่ระบุ V_G และ β); "about six feet for a 15 knot variation in V.sub.G"; "varies about 200 feet for a fifteen knot variation"; ตัวอย่าง 110, 125, 140 kt | [O13] | ตรง (สคริปต์ผู้ตรวจได้ 41.93 ft ที่ 125 kt/3°, 6.47 ft และ 185 ft ต่อ 15 kt) แต่ "ที่ 125 kt" เป็นการตีความ จึงแก้ข้อความสรุป |
| DIALS sink ตอนแตะพื้น | −2.4 ± 0.7 ft/s (0.73 ± 0.21 m/s), 10 ครั้ง, p.425 | "a mean touchdown vertical velocity of -2.4 feet/second with a standard deviation of 0.7 feet/second"; "Ten completely automatic (hands-off) landings" จาก GS 3° และ 4.5°; easy-on ของ gain (p.415) | [O14] p.426, 414, 415 | แก้แล้ว (เลขหน้า p.426 และเพิ่มว่ามี GS 4.5° ปน) |
| CR-3074 Table 2 | 415.7 m, SD 34.5 m; sink 0.665 ± 0.26 m/s; GS 6°; decrab roll 5° | "average touchdown point: 415.7 m (1363.8 ft)", SD 34.51 m; sink 0.665 m/sec, SD 0.26 m/sec; "steep glideslope (6°)"; "A decrab law with a maximum roll of 5°" | [O15] Table 2 p.59, p.30, บทนำ | ตรง |
| Safety First 12: สถิติ autoland | 725 ครั้งใน 3 ปี, ไม่สำเร็จ 5 (99.3 %) | 725 automatic landings ในสามปี; "Only 5 of the approaches were considered unsuccessful" (720/725 = 99.31 %) | [O24] p.27 | ตรง |
| Safety First 12: ALIGN/RETARD และ beam bend | "At 30 ft, ALIGN and RETARD modes engaged"; −137/+36 µA ตั้งแต่ 300 ft; เตือนราว 200 ft; "> 20 µA" | ประโยค 30 ft ตรง (p.27; กรณีที่อ้าง A340-500); "down to -137 microA / up to +36 microA", "starting at 300 ft RA", "approximately 200 ft AGL"; 20 µA เป็นข้อเท็จจริงของเหตุการณ์ ("more than 20microA in LAND mode") ไม่ใช่เกณฑ์ที่ประกาศ | [O24] p.27 ถึง 28 | แก้แล้ว (ถ้อยคำเรื่อง 20 µA ใน 3.9.4) |
| T-O-01 LOC 1 dot / ความกว้าง / 1/4 dot | 0.751°, 0.749°, 0.889°; 3.01°, 3.00°, 3.56°; 13.1 m | 0.7515°, 0.7492°, 0.8890°; 3.006°, 2.997°, 3.556°; 13.12 m; จาก `RWY_END['21R'].locDist` ของ repo จริง (4003.4 m) ได้ 0.7512° | สคริปต์ผู้ตรวจ `scripts/orev_recompute.mjs` ส่วน A และ `orev_geo.mjs` | ตรง |
| T-O-02 เส้นทางล้อบน 21R | THR 12.22/11.58/7.90/14.16 m; GPI 233.2/220.9/150.7/270.2 m; s(400 ft) −2093/−2105/−2176 m | 12.222/11.579/7.899/14.159 m; 233.2/220.9/150.7/270.2 m; −2093/−2105/−2176 m | `orev_recompute.mjs` ส่วน B (H จากหัวข้อ 5) | ตรง |
| T-O-03 737 flare (L1v) | τ 4.93 s, 8.1 s, sink 0.74 m/s (146 fpm), s 535 m; lag 1 s: 408 m, 1.02 m/s; JSON `sink_TD` 0.743 | τ 4.9326 s, 8.100 s, 0.7415 m/s (146.0 fpm), 534.6 m; RK4 lag 1 s: 408 m, 1.018 m/s | `orev_recompute.mjs` ส่วน C, D | ตรง (ข้อความ); แก้แล้ว JSON `sink_TD` 0.743 → 0.742 |
| T-O-04 สิทธิบัตร prior art | 35.46/41.93/48.40 ft; แตะ 1334/1512/1704 ft "นับจาก GPI" | 35.46/41.94/48.41 ft; 1334/1512/1704 ft **จาก threshold** (จาก wheel GPI = 569/747/939 ft); กฎ V_G·τ คงที่ 1514 ft (461.3 m) | `orev_recompute.mjs` ส่วน C | แก้แล้ว (จุดอ้างอิงของระยะ) |
| T-O-06 A320/A330 flare (L2) | A320 τ 5.07, 7.88 s, 488 m; A330 49.5 ft, 8.02 s, 440 m; **A330 τ 5.2 s** | A320 τ 5.073 s, 7.880 s, 487.6 m; A330 h_F 49.53 ft, **τ 5.012 s**, 8.019 s, 440.2 m | `orev_recompute.mjs` ส่วน C | แก้แล้ว (A330 τ 5.2 → 5.01 s ในตาราง 3.9.9 และ JSON `a330_300.afcs.laws.flare`) |
| T-O-21 เครื่องฝึก regression | h_F 4.85 m, s 417 m (เงื่อนไขไม่ระบุความเร็ว) | สคริปต์ผู้เขียนใช้ V_G 75 kt และ H 1.0 m แต่ repo มี `AC.Vref` 88 kt (ข้าม THR ที่ Vref) และล้อหลักต่ำกว่า CG 1.36 ถึง 1.38 m: ได้ h_F 5.69 m (18.7 ft), s 447 m, sink 0.220 m/s | `src/20-flight.js` บรรทัด 117, 368 ถึง 373, 402; `orev_recompute.mjs` ส่วน D | แก้แล้ว (ระบุเงื่อนไขและค่าคาดหวังใหม่) |
| T-O-14 ลม 180/40 บน 21R | HW 35.1 kt → ไม่อนุญาตทุกแบบ | HW 35.08 kt: เกินขีด A330 (35 kt) เพียง 0.08 kt ภายใน tolerance ± 0.1 kt จึงเป็นกรณีขอบที่ทดสอบไม่ได้; ลมอื่นตรง (270/24: 11.53/21.05; 250/25: 18.79/16.49; 30/12: TW 12.00) | `orev_recompute.mjs` ส่วน H | แก้แล้ว (เปลี่ยนเป็น 200/40: HW 39.54, XW 6.06) |
| T-O-07, T-O-08, T-O-05 | LAND 385.8 ft; RETARD 2.50/2.29/2.10 s; h_F 45/47.3/50/53.3/60 ft | 385.8 ft (117.6 m); 2.499/2.287/2.096 s; 45.00/47.27/50.00/53.33/60.00 ft | `orev_recompute.mjs` ส่วน C, E, F | ตรง |
| ส่วน 5 สถิติ (T-O-11) | z 4.265/4.753/5.199/5.612; σx 80.3, 114.3 m; σy 3.82/3.62/3.29/3.99, 4.11 m; σ_sink 0.481 | ด้วย erfc + bisection (ไม่ใช้ Acklam): 4.265/4.753/5.199/5.612; 80.26, 114.30 m; 3.817/3.618/3.292/3.987, 4.115 m; 0.481 m/s | `orev_recompute.mjs` ส่วน G | ตรง |
| T-O-20 A/THR pole placement | K_p 0.0317/0.0332/0.0361, K_i 0.00297/0.00311/0.00339; กลับเข้า ±2 kt 23.6/23.1/28.2 s; "ไม่มี overshoot เกิน 2 kt" | gain ตรงทุกค่า; RK4 ได้ 23.7/23.2/28.3 s แต่มี **undershoot −3.60/−3.51/−4.10 kt** (คำสั่งชน idle 5 % และไม่มี anti-windup); มี anti-windup ได้ 7.9/7.8/9.5 s, undershoot ≤ 0.75 kt; T_max 234.0/240.2/632.5 kN = 2×26,300/27,000/71,100 lbf; 95 % ใน 4.49 s | `orev_athr.mjs` | แก้แล้ว (ผลคาดหวังเรื่อง overshoot ผิด; เพิ่มกรณี anti-windup) |
| โค้ดเดิม `class Autopilot` | บรรทัด 343 ถึง 424; T_y 8 s, T_χ 3 s, 22°/12° ใต้ 60 m, K_h 0.0028, h_F clamp(2.4·sink, 4.5, 9), ḣ = −(0.22 + h/2.4), decrab 11 → 4.5 m, K_y 0.025, เบรก 0.42 หลัง 2.5 s, derotation 1.6°/s, PI 0.035/0.0045 (บรรทัด 404 ถึง 405), `locDot` 0.91 "บรรทัด 11 และ 27" | ตรงทุกค่า ยกเว้น `locDot: 0.91` อยู่บรรทัด 12 (และ 27); thrust ใน FLARE ลดด้วยอัตรา 1/2.5 ต่อวินาที (`c.thr - dt/2.5`) ซึ่งถึง 0 ใน 2.5 s เฉพาะเมื่อเริ่มที่ thr = 1 | `src/20-flight.js` [O40] | แก้แล้ว (เลขบรรทัด) |
| ILS ของ DMK (ความถี่, CAT, RDH, ระยะ LOC, course width, ALS) | IBKK 109.3 CAT II RDH 54 ft; IDMG 110.3 CAT I RDH 53 ft; IBKD 109.7 CAT I RDH 55 ft; LOC เลยปลาย 301.8/314.0/232.6 m; 3.0°/3.6°; ALS 900/900 m, SALS 420 m | ตรงทุกค่า (AIP 3 SEP 2026 AD 2.19 ผ่านบันทึกรอบที่ 5; AIP เองประกาศระยะ LOC 21L 225 m ขัดกับพิกัด 232.6 m ซึ่งรายงานใช้พิกัด) | [O37] `context/r5-5a-aip.md` บรรทัด 14, 108 ถึง 135 | ตรง |
| LVP ของ DMK | RVR < 550 m หรือเพดาน < 200 ft; 21R เท่านั้น | ตรง แต่ข้อความ AD 2.20 มาจากฉบับปี 2021 และยังไม่ยืนยันกับรอบปัจจุบัน (รายงานให้ conf กลางและระบุข้อจำกัดไว้แล้ว) | [O37] `context/r5-5a-aip.md` บรรทัด 88; `r5-5b-airport.md` บรรทัด 887, 1000 | ตรง |
| H (ILS beam ถึงเส้นทางล้อ) และ track จากหัวข้อ 5 | 737 4.237, A320 4.88, A330 8.56 m; track 5.715/7.6/10.7/4.1 m | ตรง (Boeing VLAD 13.9 ft; Airbus visual aids 4.88/8.56 m; track 225 in, Jenkinson 7.6/10.7 m, ATR 4.10 m) | [O38] `05-airport-geometry.md` บรรทัด 9 ถึง 10, 326, 336, 378, 387, 513 | ตรง |
| JSON ทุกบล็อก | 5 บล็อก, 93 leaf | parse ผ่านทั้ง 5 บล็อก, 93 leaf, คีย์ครบ 7 ทุก leaf, คีย์บนสุดเดียว, เขียนเฉพาะ `afcs`, src ทุกตัวอยู่ในรายการแหล่ง | `scripts/orev_json.mjs` | ตรง |
| 737 ลำดับ autoland (Smartcockpit) | 1500 ft, 800 ft, 400 ft stab trim, 350 ft, 50 ft flare, RETARD 27 ft หรือ 2.5 s, A/T ปลด 2 s | "below 1500 ft RA, the second A/P engages"; "prior to 800 ft RA"; "at 400 ft RA the stabilizer is automatically trimmed aircraft nose up"; "approximately 350 ft RA, both A/Ps automatically disengage"; "approximately 50 ft RA"; "RETARD 2.5 seconds after FLARE mode engagement or at 27 ft radio altitude, whichever occurs first"; "approximately 2 seconds after touchdown" | [O19] p.7, 16, 17 (สำเนา squarespace ของ flaps2approach) | ตรง |
| 737 โหมด A/T และ capture | THR HLD 64/84 kt; N1 equalization 8°; ปลดที่ 10°; GA arm 2000 ft; GA 15°/13°; LOC ≤ 1/2 dot; G/S 2/5 dot; F/D 60 kt → 15°; "LVL CHG ตั้ง V2 + 20" | ตรงทุกค่า (p.7 ถึง 17) ยกเว้น V2 + 20 ที่พบเฉพาะในบริบท F/D takeoff เมื่อเครื่องยนต์ดับ | [O19] | ตรง; V2 + 20 ยืนยันไม่ได้ (เพิ่มหมายเหตุในตาราง) |
| 737NG ขีด autoland (b737.org.uk) | HW 25, XW 25, TW 0 ถึง 15 kt; GS 2.5° ถึง 3.25°; flaps 30/40 สองเครื่องยนต์; AP ≥ 400 ft AGL; single channel ≥ 50 ft; พิมพ์ 19 AUG 2021 | 6/900: "Headwind ... crosswind ... 25 kt"; tailwind "Varies between 0 and 15kts depending upon field elevation and flap setting"; "3.25 degrees and 2.5 degrees"; "flaps 30 or 40 and both engines operative"; "below 400ft AGL"; "shall not remain engaged below 50ft AGL"; "19/08/2021"; "Not all limitations given here are AFM" | [O20] | ตรง |
| A320 ขีด autoland และ MUH | HW 30, XW 20, TW 10 kt; GS −2.5° ถึง −3.15°; ≤ 9200 ft (บางทะเบียน 2500 ft); DH 100/50/20 ft; AH 100 ft; RVR 75 m; MUH 100 ft + 5 s, 160, 250, 500/600, 100, 500 ft; เกินขีดทำได้เพียง CAT I; ปรับปรุง 1 SEP 2023 | ตรงทุกค่า ("30 knots headwind. 20 knots crosswind. 10 knots tailwind."; "–2.5 ° and –3.15 °"; "Alert height: 100 ft."; "Last Updated 01st SEP 2023"); เพิ่มเติม: "Wind limitation above is ATC reported wind" และทะเบียนในเอกสารเป็นของ PIA (AP-xxx) | [O28] | ตรง |
| FBW docs: ลำดับ autoland | LAND ก่อน 350 ft; FLARE 40 ft; THRUST IDLE 30 ft; "RETARD" 10 ft; decrab 20 ถึง 10 ft; ROLL OUT; ปลด AP ที่ taxi speed; เตือนใต้ 200 ft (RA ต่าง > 15 ft, LOC > 1/4 dot เหนือ 15 ft, GS > 1 dot เหนือ 100 ft); GS −2.5° ถึง −3.25°; 44 000 kg; CAT II takeover ≥ 80 ft; ลม 30/20/10 kt | ตรงทุกค่า; แต่หน้านี้**ไม่มี** RETARD 20 ft ตอนลงด้วยมือ และไม่ใช้คำว่า ALIGN | [O30] | แก้แล้ว (ถอด [O30] ออกจากการอ้าง 20 ft ด้วยมือ ให้เหลือ [O25][O42]) |
| Airbus "A Focus on the Landing Flare": RETARD | 20 ft ลงด้วยมือ "a reminder, not an order"; 10 ft autoland (อ้าง [O25] ร่วม) | "The 20 ft "RETARD" auto callout is a reminder, not an order."; ไม่มีค่า 10 ft (มีเพียง A220 autoland RETARD "between 20 and 15 ft AGL"); ไม่ระบุวันที่ | [O25] | แก้แล้ว (ถอด [O25] จากค่า 10 ft ในตารางความขัดแย้ง) |
| นิยาม CAT I/II/III (Uganda CAA) | CAT I DH ≥ 200 ft, VIS ≥ 800 m หรือ RVR ≥ 550 m; CAT II 100 ถึง < 200 ft, RVR ≥ 300 m; CAT IIIA < 100 ft, RVR ≥ 175 m; CAT IIIB < 50 ft, RVR 50 ถึง < 175 m (EU 75 m); CAT IIIC | ตรงทุกค่า (p.18 และ p.21: "the minimum RVR in EU Regulations is 75m") เอกสารลงวันที่ JAN 2023 | [O7] p.18, 21 | ตรง |
| ตาราง RVR CAT II/III | 300/400/450 m; Cat D 350 m เว้นแต่ autoland/HUDLS; CAT III 175/125/75 m | Table 3 และ 4 p.22 ตรงทุกช่อง (Cat D "300/350*", footnote "An RVR of 300 m may be used for a Category D aeroplane conducting an autoland or using HUDLS"); ข้อความ "ลดถึง 75 m ได้ถ้า AFM ระบุ" ของ fail-passive ไม่พบในส่วนที่อ่าน | [O7] p.22 | ตรง; วงเล็บ 75 m ของ fail-passive ยืนยันไม่ได้ |
| เกณฑ์ความสำเร็จเชิงปฏิบัติการ | ±5 kt; แตะหลัง 150 m และก่อน 750 m | "+/- 5 kt of the intended speed"; "beyond a point on the runway 150 m after the threshold" "before the end of the touchdown zone (TDZ) (750 m from the threshold)" | [O7] §4.1.3 p.40 | ตรง |
| TK1951 ตัวเลขเหตุการณ์ | RA −8 ft ที่ราว 1950 ft; "radio height less than 27 feet"; 144 kt ที่ราว 750 ft; ราว 110 kt ใต้ 500 ft; stick shaker ราว 460 ft; AP ขวา; ข้อความ DDG 2004 | −8 ft ตรง; "a radio height less than 27 feet" ตรง; 144 kt / 750 ft / 110 kt / 500 ft / 460 ft ตรง; "The right autopilot ... selected and active" ตรง; ข้อความ DDG "an autopilot or autothrottle must not be used during approach and landing" ตรงตาม FSF (บันทึก N106); **1950 ft ไม่พบ** หน้า code7700 ให้ "2000 feet" | [O16] code7700; [O17] บันทึก N103; [O18] บันทึก N106 | ตรง ยกเว้น 1950 ft ยืนยันไม่ได้ (เพิ่มหมายเหตุ) |
| JSON ความสูง flare A320/A330 | `at_709fpm` 14.417 m; `at_743fpm` 15.088 m | 709/15 = 47.27 ft = 14.408 m; 743/15 = 49.53 ft = 15.098 m | `orev_recompute.mjs` ส่วน C | แก้แล้ว |
| JSON `common_airliner.afcs.ils_signal` conf | สูง | DDM มาจากขั้นตอนทดสอบของ R&S (ทุติยภูมิ), gs_dot 0.36° ข้อความให้ conf กลาง | [O10][O11][O6] | แก้แล้ว (สูง → กลาง) |
| AH ของ 737-800: JSON กับข้อความ | JSON `AH` 30.48 m (est); ตาราง "ไม่พบ" เขียนว่า "ไม่ใช้ AH" | ขัดกันเอง | – | แก้แล้ว (ข้อความให้ตรงกับ JSON และอ้าง CS-AWO 312) |
| ATR 72 FCOM: AP และ CAT 2 | 12 s หลัง liftoff (≈ 400 ft); AP/YD ไม่ engage บนพื้น; CAT 2 ด้วย AP + FD; 800 ft dual coupling; ลมสาธิต 29/10/17 kt; "Power must be adjusted to the new condition"; "80 ft RA" ยืนยันไม่ได้ | ตรงทุกค่า (2.02.04 p.1, 5, 8 ถึง 11, rev 001 APR 11); "80 ft RA" คือ "Visual at DH 80 ft RA" ในตาราง CAT 2 จึงเป็น DH ตัวอย่าง | [O33] | ตรง; แก้แล้วเรื่องความหมายของ 80 ft (ข้อความ 3.9.7, ตารางความขัดแย้ง, note ใน JSON) |
| ATR Standard 2 (ข่าวประชาสัมพันธ์) | LPV ถึง 200 ft, RNP AR 0.3, VNAV coupled กับ AP, 24 NOV 2014 | "Toulouse, 24 November 2014"; "LPV approaches can achieve minimums of up to 200 feet"; "RNP-AR 0.3"; "VNAV", coupled to the autopilot; "Standard 2" | [O34] | ตรง |
| A330 ขีด autoland (flashcard) | AH 200 ft; HW 35, XW 20, TW 10 kt; GS −2.5° ถึง −3.25°; ≤ 9200 ft; DH 50/20 ft; RVR 75 m; เครื่องยนต์ดับ CONF 3; AP 100 ft + 5 s; ILS 160 ft | ตรงทุกค่า ("Cat III alert height" "200 ft"; "Head Wind 35 kts X-Wind 20 kts Tail Wind 10 kts"; "only approved in Configuration 3"; "during the 5 s after liftoff") | [O29] | ตรง (คง conf ต่ำเพราะเป็น flashcard ของผู้ใช้) |
| ความเร็วอ้างอิงจากหัวข้ออื่น และ 33.73(b) | 737 VREF30+5 = 142.1 kt ที่ 60 t; A320 VAPP 133.6 kt; 14 CFR 33.73(b) 95 % ใน 5 s | ตรง (หัวข้อ 3.2 T-B-08; หัวข้อ 3.3 T-L-05; หัวข้อ 3.6 บรรทัด 149 อ้าง "95 percent rated takeoff power or thrust in not over 5 seconds") แต่ `o_athr.mjs` ใช้ L/D 8 ได้แรงขับ trim 42.8 kN ขณะที่หัวข้อ 2 (T-B-10) ให้ 32.2 ± 6.5 kN | [O41]; หัวข้อ 3.2, หัวข้อ 3.3 | ตรง (ข้อสังเกตเรื่อง L/D อยู่ในข้อสงสัยที่เหลือ) |
| สมการ LOC/GS/flare/PI (หน่วยและเครื่องหมาย) | χ_cmd = χ_rwy + asin(ẏ/V_g); φ = atan(V·Δχ/(g·T_χ)); γ_cmd = −γ_GS − clamp(K_h·Δh); h(t) = (h_F + h_B)e^(−t/τ) − h_B; K_p = 2ζωm, K_i = ω²m; 1/(V·K_h) = 5.1 s ที่ 70 m/s | ตรวจแล้วถูกทั้งมิติและเครื่องหมาย (γ, ḣ บวกขึ้น; φ ขวาบวก → χ เพิ่ม; Δh บวกเมื่ออยู่เหนือ GS → γ_cmd ลบมากขึ้น; m s² + K_p s + K_i = 0); 1/(70 × 0.0028) = 5.10 s; แต่ D_LOC ไม่ได้นิยาม | ผู้ตรวจ | แก้แล้ว (เพิ่มนิยาม D_LOC และทิศของ y) |
| T-O-17, T-O-18, T-O-22 (ค่าแปลงหน่วย) | 1/4 dot = 0.188° = 18.8 µA; RVR ตาม DH 100/113/120 → 300 m, 130 → 400 m, 143 → 450 m; ±25 µA = 1/3 dot = ±0.25° | 0.7515/4 = 0.1879°, 75/4 = 18.75 µA; ตาราง [O7] Table 3 ให้ผลเดียวกัน; 25/75 = 0.333 dot × 0.7515 = 0.250° | `orev_recompute.mjs` ส่วน A; [O7] | ตรง |
| SRVSOP AC 91-020: "100 ft or less", §9.2.2 ถึง 9.2.6, App 3 §5 (360 fpm, 7°, 8 m), §8.4.8(g) | ตามรายงาน | (รอบต่อ เปิดเอง) วันที่ "11/04/13" ORIGINAL; §9.2.2 p.16 "Automatic landing is mandatory for all CAT III operations" (ไม่มี HUD); §9.2.3 DH ไม่ต่ำกว่า 15 m (50 ft) ใช้ fail-passive ได้; §9.2.4 DH < 15 m ต้อง fail-operational; §9.2.5 RVR < 175 m ต้อง fail-op rollout; §9.2.6 (a) ถึง (e) ตรงทั้ง 5 ข้อ; §8.4.8(g) p.13 "should not be identified by landing minima classification" (ตัวอย่าง "APPROACH, LAND 2, LAND 3, Single Land, Dual Land"); §11.2.5(b) p.24 "(typically 100 ft or less above the threshold)"; App 3 §5 p.31 "360ft/min", "7 degrees", "8m", "between 150m and 750m"; ±5 kt อยู่ใน App 3 §4(a)(1) | [O8] | แก้แล้ว (ค่าตรงทุกตัว; แก้การอ้าง: วงเล็บ HUD ใน §9.2.2 ไม่มีใน [O8], ระบุ §11.2.5(b) และ App 3 §4(a)(1); `ops_success` conf กลาง → สูง) |
| ICAO WACAF LVO (Bernage, Airbus) นิยาม Type A/B, CAT I/II/III, DH จาก RA, fail-passive DH 50 ft, Airbus ไม่ใช้ HUD | Type A ≥ 250 ft; CAT I 200 ft/VIS 800 m/RVR 550 m; CAT II 100 ถึง < 200 ft/300 m; CAT IIIA < 100 ft ≥ 175 m; CAT IIIB < 50 ft 50 ถึง < 175 m; "slide 11" สำหรับ CAT I/II | (รอบต่อ เปิดเอง) slide 12: "Type A DH ≥ 250 ft", "CAT I DH ≥ 200 ft VIS ≥ 800 m RVR ≥ 550 m", "CAT II 200 ft > DH ≥ 100 ft RVR ≥ 300 m"; slide 11: CAT IIIA/IIIB/IIIC ตรง; slide 8 "DH: Decision Height ⇒ Radio-altimeter Altitude ⇒ CAT II / CAT III LVO"; slide 45 "The minimum DH is 50 ft"; slide 21 "Autoland (Airbus Standard)", "HUD (Not used on Airbus)"; slide 13 fail-passive 125 m; ผู้เขียน Julien Bernage, Dakar 30 JUN ถึง 5 JUL 2025 | [O9] | แก้แล้ว (ค่าตรงทุกตัว; เลข slide ของ CAT I/II 11 → 12) |
| EASA TCDS IM.A.120 "Cat 3" ของ 737-800 | "Cat 3", conf สูง | (รอบต่อ เปิดเอง) Issue 29, 16 DEC 2025; Section 2 (737 NG series: -600/-700/-800/-900/-900ER) item III.12 p.14 "All Weather Capability: Cat 3"; Section 4.1 (737-800) item III.12 p.28 "See Airplane Flight Manual" | [O22] | ตรง (เพิ่ม issue/วันที่และตำแหน่งในรายการแหล่งและ note ของ JSON) |
| แหล่งที่ยังไม่ได้เปิด (รอบแรก) | [O23] PPRuNe ISFD (LAND 3 RVR 75 m, LAND 2 DH 50 ft 125/75/75 m), [O26] PPRuNe ข้อความ LAND 400 ft, "pressure_alt_min −1000 ft" ของ A320, ชนิดเครื่องในเหตุการณ์สิงคโปร์ (A340) | รอบแรกไม่ได้ตรวจ (โควตาหมด); [O8], [O9], [O22] ตรวจในรอบต่อแล้ว (แถวด้านบน); ผลของ [O23], [O26] และค่าอื่นอยู่ในแถวถัดไป | – | ดูแถวถัดไป |
| PPRuNe ISFD: LAND 3 / LAND 2 ของ 737NG | LAND 3 ไม่มี DH, RVR 75 m; LAND 2 DH 50 ft, RVR 125/75/75 m; ISFD เป็นแหล่งท่าทางที่สาม; OCT 2016 | (รอบต่อ เปิดเอง) Denti 31 OCT 2016: "We used no DH with 75m RVR for LAND 3 and 50ft DH with 125/75/75m RVR for LAND 2 with both engines working."; repulo 27 OCT 2016: "The ISFD provides third attitude data to the two autopilots"; 7478ti: "equivalent to a triple channel AP", "an "Alert Height" is used" (ไม่ให้ตัวเลข AH); กระทู้ 26 ถึง 31 OCT 2016 | [O23] | ตรง (คง conf ต่ำ: ความเห็นนักบินรายเดียว) |
| PPRuNe A320 LAND/RWY FMA's: LAND ใต้ 400 ft | "LAND mode automatically engages when the LOC and G/S modes are engaged, and the aircraft is below 400 ft RA." | (รอบต่อ เปิดเอง) ข้อความตรงทุกคำ (FlightDetent 2 MAY 2021 อ้าง FCOM DSC-22_30-80-30-10) และ "FLARE and ROLL OUT modes will successively engage"; กระทู้ไม่มีข้อความเรื่องแตะพื้น/ล้อหลัก (ข้อนี้มาจาก [O30]) | [O26] | ตรง |
| FBW docs: ROLL OUT ที่ล้อหลักแตะพื้น, 40/30/10 ft, decrab, 44 000 kg, 80 ft | ตามรายงาน | (รอบต่อ เปิดเอง) "ROLL OUT (main gear touchdown)"; "At 40 ft: FLARE"; "At 30 ft: THRUST IDLE"; "At 10 ft: callout "Retard""; "Between about 20 ft and 10 ft"; "Aircraft weight below 44 000 kg (97 004 lb)" (ข้อห้าม); "takeover should be made at or above 80 ft"; หน้าไม่ระบุใบอนุญาต | [O30] | ตรง |
| A320 Limitations: pressure altitude ต่ำสุดของ autoland | −1000 ft (−304.8 m) | (รอบต่อ เปิดเอง) "Automatic landing is not allowed below -1 000 ft pressure altitude." (หัวข้อ Automatic Landing with Automatic Rollout); "Aircraft weight should be below the maximum landing weight." (หัวข้อ Autoland in ILS CAT I); เอกสารไม่มีเลขหน้า | [O28] | ตรง |
| Safety First 12: แบบเครื่องในสองกรณี | Case One "A340"; เหตุการณ์สิงคโปร์ "A340, RWY 02L" | (รอบต่อ เปิดเอง) Case Two p.28 "SIN RWY 02L (CAT II RWY): Autoland not successful." ไม่ระบุแบบเครื่อง; Case One p.27 ไม่ระบุแบบในประโยค 30 ft แต่ความเห็น p.28 อ้างขีดลม "for the A340-500 at that time"; ตัวเลข −137/+36 µA, 300 ft, 200 ft, 725/5 และ "the integrity of the LOC/GS signal is not guaranteed" ตรง | [O24] | แก้แล้ว (3.9.4 ถอด "A340" ออกจากเหตุการณ์สิงคโปร์; 3.9.0 และ note ของ `a330_300.afcs.autoland.ALIGN_ft` ระบุว่า A340-500 เป็นการอนุมาน) |
| 737NG FCOM (MALEV): crosswind autoland | 20 kt (ค่าที่เลือกใน JSON และ T-O-14) | (รอบต่อ เปิดเอง) ข้อความหน้า L.10.4 อยู่นอกส่วนที่ WebFetch อ่านได้ (ข้อความ PDF 91 463 ตัวอักษร) แต่ Revision Record หน้า 0.4.3 อ้าง L.10.4: "Revised maximum allowable crosswind limit to 20 knots when conducting a dual channel Cat II or Cat III landing predicated on autoland operations." | [O21] | ตรง (ยืนยันผ่าน revision record; HW 25 kt และ TW มาจาก [O20] ตามที่ note ระบุ) |
| PPRuNe "Airbus Alert Height": A320 100 ft, A330 200 ft | AH A330 200 ft (conf ต่ำ), JAN 2009 | (รอบต่อ เปิดเอง) Vikena 9 JAN 2009: "100' for a320" และ "200 for a330"; Safetypee อ้าง CS-AWO 300 "The alert height is a specified radio height, based on the characteristics of the aeroplane"; กระทู้เริ่ม 9 JAN 2009 | [O27] | ตรง (คง conf ต่ำ) |
| TK1951 รายงานเบื้องต้น: 1950 ft, AP B, 144 kt, 460 ft | RA −8 ft ที่ราว 1950 ft (รอบแรก: ยืนยันไม่ได้) | (รอบต่อ เปิดเอง) p.2 "At approximately 1950 feet the recorded value suddenly changed to -8 feet"; p.2 "one of the two autopilots (autopilot B) and autothrottle engaged"; p.3 "approximately 144 knots"; p.3 "The stick shakers activated at approximately 460 feet"; เอกสารใช้คำว่า "retard mode" (คำว่า "retard flare" มาจากรายงานฉบับสมบูรณ์ผ่าน [O16]) | [O17] | แก้แล้ว (ข้อความ 3.9.5 เปลี่ยนจาก "ยืนยันไม่ได้" เป็นยืนยันแล้วพร้อมอ้าง p.2) |
| 737 Smartcockpit: CWS, LNAV, speed reversion, take-off mode | CWS ใต้ 150 ft RA gear down; bank ≤ 6°; 250 ft; LNAV 3 NM, ≤ 90°; ต่ำกว่าเกิน 5 kt → LVL CHG; THR HLD 64/84 kt; ยกเลิก take-off mode "เหนือ 400 ft RA" | (รอบต่อ เปิดเอง) p.4 "Below 150 ft RA with the landing gear down", "bank angle 6 degrees or less", "within 250 ft of the selected altitude"; p.6 "within 3 NM of the active route segment", "intercept course of 90 degrees or less"; p.21 "more than 5 kt below the MCP selected airspeed and is not increasing, the AFS reverts to LVL CHG" เฉพาะในโหมด V/S; p.15 "64 kt or 84 kt"; p.12 ใต้ 400 ft RA ยกเลิกได้ด้วยการปิด F/D ทั้งสอง เหนือ 400 ft ด้วยโหมดอื่นหรือ engage AP | [O19] | แก้แล้ว (เพิ่มเงื่อนไข V/S และไม่เพิ่มขึ้นของ speed reversion; เขียนการยกเลิก take-off mode ให้ครบ) |
| AC 25.1329-1C: แรง override และ transient | 25 lb (111 N); "free of perceptible transients"; 27 OCT 2014 | (รอบต่อ เปิดเอง) ¶30.b(1)(a) p.21 "Twenty-five pounds (25 lbs) of force at the control column or wheel has been determined to be a significant override force level" (สำหรับการบินที่ไม่ใช่ approach ในบางแบบ); ¶27.a(4) p.14 "should be free of perceptible transients"; ลงวันที่ 10/27/14; 25 lbf = 111.2 N | [O5] | ตรง |
| minima ของ DMK และ course จริงของ 21R | ILS CAT I 21R/21L OCA/H 220 (213) ft; CAT II 21R 120 (113) ถึง 150 (143) ft; course 208.72° (T-O-14) | (รอบต่อ) `context/r5-5a-aip.md` บรรทัด 2683, 2717 ถึง 2719, 3469: "CAT I 220 (213); LOC 470 (463); CAT II 120 (113)–150 (143)"; ILS Z 21R "209° MAG (true 208.72°)" | [O37] | ตรง |
| ตาราง 3.9.8: s ของ thrust idle 30 ft ของ A320 ใน flare ideal | +65 m | 64.49 m (t = 1.724 s หลังเริ่ม flare); สคริปต์ผู้ตรวจรอบแรกพิมพ์ 64 เช่นกัน | `scripts/orev2_crosscheck.mjs` | แก้แล้ว (+65 → +64) |
| คำนวณซ้ำรอบสอง (วิธีต่างจากเดิม: step ḣ_cmd ด้วย dt 10⁻⁴ s และ z จากการอินทิเกรต Simpson ของหาง pdf) T-O-01 ถึง T-O-08, T-O-11, T-O-14, T-O-17, T-O-20, T-O-21 และการแปลงหน่วยใน JSON | ตามตารางกรณีทดสอบ | ตรงทุกค่าภายในหลักที่รายงาน: 0.7515/0.7492/0.8890°, 13.12 m; 12.222/11.579/7.899/14.159 m, GPI 233.2/220.9/150.7/270.2 m, s(400 ft) −2093/−2105/−2176 m; 737 τ 4.9326 s, 8.100 s, 0.7415 m/s, 534.6 m; prior art 35.46/41.94/48.41 ft, 1334/1512/1704 ft (ส่วนต่าง 370 ft), V_G·τ คงที่ 1513 ถึง 1514 ft; A320 47.27 ft, 5.073 s, 7.880 s, 487.6 m; A330 49.53 ft, 5.012 s, 8.019 s, 440.2 m; LAND 388.0/385.8/384.0/380.0 ft; RETARD 2.500/2.287/2.096 s; z 4.2649/4.7534/5.1993/5.6120; σ 80.26/114.30 m, 3.817/3.618/3.292/3.987/4.115 m, 0.481 m/s; ลม 270/24 → 11.53/21.05, 200/40 → 39.54/6.06, 250/25 → 18.79/16.49; K_p 0.0317/0.0332/0.0361, K_i 0.00297/0.00311/0.00339; 95 % ใน 4.494 s; เครื่องฝึก 88 kt: 5.694 m, 447 m, 0.220 m/s; ค่า m/s และ m ทุกตัวใน JSON ตรงกับ kt/ft ใน note | `scripts/orev2_crosscheck.mjs` (+ `_out.txt`) | ตรง |
| CS-AWO 300(b)(3), (4), (6), (7) และ 304(b) | ข้อความ fail-passive, fail-operational, AH, DH, rollout ตามรายงาน 3.9.2 | (รอบต่อ เปิดเอง) (b)(3) p.1-3-1 "there is no significant out-of-trim condition or deviation of flight path or attitude but the landing is not completed automatically"; (b)(4) "the approach, flare and landing can be completed by the remaining part of the automatic system"; (b)(6) "a specified radio height, based on the characteristics of the aeroplane and its fail-operational landing system"; (b)(7) p.1-3-2 "the wheel height above the runway elevation by which a go-around must be initiated"; 304(b) "control of the aeroplane along the runway during the ground roll down to a safe speed for taxying" สำหรับ DH < 15 m (50 ft) | [O3] | ตรง |
| AC 20-191 §5.2.9.4.1 ถึง 5.2.9.4.5 และ 5.2.9.6 | 200 ft (60 m), 2700 ft (823 m), 70 ft, 10 fps, bank 10⁻⁷; 3000 ft (900 m) 10⁻⁵ เป็น "limit" | (รอบต่อ เปิดเอง) §5.2.9.4.1 ถึง .5 p.5-4 ถึง 5-5 ตรงทุกค่า (10⁻⁶; bank 10⁻⁷ รวม wing, high-lift device, nacelle; ทางวิ่ง 150 ft); §5.2.9.6 p.5-5 ถึง 5-6: 3000 ft (900 m) 10⁻⁵ แต่หัวข้อนี้คือ "Compatibility with Rare Undetected Non-Aircraft System Error Conditions" และใช้ bank 10⁻⁶ | [O2] | แก้แล้ว (เพิ่มหมายเหตุในตาราง 3.9.3 ว่า §5.2.9.6 ไม่ใช่ limit risk แบบ EASA) |
| 737 Smartcockpit: THR HLD ถึง 800 ft (NG), GA 15°/13°, ALT ACQ 1000 ft, trim ที่ 50 ft, ปลดที่ 350 ft | ตามตาราง 3.9.5 | (รอบต่อ เปิดเอง) p.15 "737 NG : the A/T remains in THR HOLD until 800 ft RA is reached" (รุ่นอื่น 400 ft และราว 18 s) แล้วเปลี่ยนเป็น ARM; p.8 "at least 1000 ft above the GA engagement altitude"; p.8 "15 degree nose-up"; p.13 single engine "13 degrees nose-up"; p.7 "737-400/NGs: The stabilizer is again automatically trimmed an additional amount nose up at 50 ft RA"; p.7 "If FLARE is not armed by approximately 350 ft RA, both A/Ps automatically disengage" | [O19] | ตรง |
| ATR 72 FCOM: GA และ windshear GA 10°, 12 s ≈ 400 ft | "GO AROUND pitch attitude"; windshear GA 10°; 12 s ≈ 400 ft "p.5" | (รอบต่อ เปิดเอง) 2.02.04 p.7 "Rotate to GO AROUND pitch attitude" (ไม่มีตัวเลข); 2.02.08 p.22 "Initiate a normal go around procedure with 10° pitch"; "(Temporary certification, 12 seconds equals to approximately 400 feet AGL at take off)" อยู่หน้าเดียวกับ "12 seconds after lift-off, AP may be engaged" ซึ่งเครื่องมืออ่านระบุว่า p.4 (อนุมาน); ลม CAT 2 29/10/17 kt p.9 | [O33] | ตรง (เพิ่มเลขหน้าในตาราง 3.9.7; เลขหน้า 12 s ระบุเป็น p.4 หรือ p.5) |
| ความไว GS 0.0875 DDM ที่ 0.12θ (อ้างว่า "ตรงกับ ICAO Annex 10" ในประโยคของ [O10]) | 0.12θ = 0.36° ที่ 3°; `gs_dot_deg` 0.36 | (รอบต่อ เปิดเอง) [O10] ไม่มี 0.0875 DDM หรือ 0.12θ (เครื่องมืออ่านให้ §1.2.1 อยู่ p.5 ส่วนรอบแรกให้ p.6); EASA CS-AWO signal-in-space models §2.1.4: "It should be assumed that the angular displacement from the nominal glide path for 0.0875 DDM has the value of 0.12 θ." | [O10], [O43] ใหม่ | แก้แล้ว (เพิ่มแหล่ง [O43] ใน 3.9.4, ตารางความขัดแย้ง, src ของ `ils_signal` และรายการแหล่ง) |
| ความไว LOC ตาม EASA | – (ไม่มีในรายงาน) | §2.2.2: "the nominal displacement sensitivity at the ILS reference datum (Point 'T') has the value of 0.00145 DDM/m" → ครึ่งความกว้าง 0.155/0.00145 = 106.9 m, ความกว้าง 3.060°/3.051°/3.620° (21R/03L/21L), 1 dot 21R 0.765° | [O43]; `node -e` ของผู้ตรวจ | แก้แล้ว (เพิ่มในตารางความขัดแย้ง; คง 105 m เพราะตรงกับ AIP 3.0°/3.0°/3.6° ดีกว่า T-O-01 ไม่เปลี่ยน) |
| Brainscape "4 - Automatic Flight" (ตัวอย่างลำดับของ Boeing สามช่อง) | flare 60 ถึง 40 ft, idle 25 ft, rollout 5 ft; ไม่ระบุแบบ | (รอบต่อ เปิดเอง) "60 ft - 40 ft RA"; "25 ft RA"; "5 ft (nose wheel and rudder control to CL)"; "LAND 3 - three autopilots engaged"; หน้าไม่ระบุแบบเครื่อง | [O12] | ตรง (ไม่อยู่ใน JSON) |
| A/THR alpha floor: ช่วงทำงาน liftoff ถึง 100 ft RA ขาลง อ้าง [O32] | [O32], หัวข้อ 8 | (รอบต่อ) `Autothrust.cpp` v0.10.0 บรรทัด 408 ถึง 449 ใช้ `alpha_floor_condition` ที่มาจาก FAC (`FlyByWireInterface.cpp` บรรทัด 2454 ถึง 2456) ไม่มีเกณฑ์ 100 ft ในไฟล์ที่อ้าง; ค่านี้อยู่ใน `08-fbw-laws.md` บรรทัด 516 (`alpha_floor_logic` "lift-off ถึง RA 30.48 m ขาลง", src Z22, Z26, Z8) และกรณี Habsheim บรรทัด 352 | [O32]; [O42] | แก้แล้ว (ระบุว่าช่วงนี้มาจากหัวข้อ 8) |
| โค้ด FBW v0.10.0 ที่ test ใช้ (ตรวจซ้ำรอบสอง) | τ = h/(R − 2.5), sink แตะ 2.5 ft/s; FLARE ที่ h < 60 ft และ (15h ≤ \|V/S\| หรือ h ≤ 45 ft); LAND หลัง 1.2 s ใต้ 400 ft; RETARD ≤ 40 ft | (รอบต่อ curl เอง) `AutopilotLaws.cpp` บรรทัด 2141 ถึง 2150: R = \|V/S\|/60, `Tau = H/(R - 2.5)`, `H_bias = Tau*R - H`, `Vz = -(H + H_bias)/Tau*60` (ที่ h = 0 ได้ sink = R − H/τ = 2.5 ft/s และที่จุดเริ่มต่อเนื่องกับ R); บรรทัด 2526 ถึง 2528 ตรง; `AutopilotStateMachine.cpp` บรรทัด 3301 ถึง 3309 (400 ft, 1.2 s) และ 1738 ถึง 1741 (≤ 40 ft และ AP1/AP2 engaged) ตรง | [O32] | ตรง |

### รายการแก้ไข (ผู้ตรวจ 2026-11-18)

1. 3.9.6 RWY arm ของโมเดล FBW: "คันเร่ง ≥ CL" → "≥ FLX/MCT (TLA ≥ 35°)" ตามโค้ดบรรทัด 514 ถึง 519
2. 3.9.4 และ T-O-22: เกณฑ์ ±25 µA ของ AC 20-191 §4.2.6.2.2 ใช้ช่วง 300 ft ถึง 100 ft HAT (เดิมวัดตั้งแต่ 1000 ft)
3. 3.9.2: เงื่อนไข "No critical area protective action" ของ FAA คือ ceiling ≥ 800 ft และ/หรือ visibility ≥ 2 SM (เดิม "ดีกว่า minima")
4. 3.9.4: เลขหน้า [O10] p.5 → p.6 และอธิบายว่าความสัมพันธ์ DDM–150 µA มาจากขั้นตอนทดสอบ; ถ้อยคำเรื่อง 20 µA ของ [O24] เป็นข้อเท็จจริงของเหตุการณ์ ไม่ใช่เกณฑ์ที่ประกาศ
5. 3.9.0: ค่า 42 ft ของสิทธิบัตรไม่ได้ผูกกับ 125 kt ในต้นฉบับ (ระบุว่าเป็นการตีความ)
6. 3.9.3: DIALS p.425 → p.426 และระบุว่ามี GS 4.5° ปนในชุด 10 ครั้ง
7. 3.9.8 ถึง 3.9.9 และ T-O-04: ระยะแตะพื้น 1334/1512/1704 ft นับจาก threshold ไม่ใช่จาก wheel GPI
8. 3.9.9 และ JSON `a330_300.afcs.laws.flare.tau_at_140kt`: τ ของ A330 5.2 s → 5.01 s
9. JSON `b737_800.afcs.laws.flare.sink_TD` 0.743 → 0.742; `a320ceo.afcs.autoland.FLARE_ft.at_709fpm` 14.417 → 14.408; `a330_300.afcs.autoland.FLARE_ft.at_743fpm` 15.088 → 15.098
10. T-O-21: ระบุเงื่อนไขที่ตรงกับเครื่องฝึกจริง (V_G 88 kt = `AC.Vref`, ล้อต่ำกว่า CG 1.37 m) ผลคาดหวังใหม่ h_F 5.69 m, s 447 m (ค่าเดิมคำนวณที่ 75 kt, H 1.0 m)
11. T-O-14: เปลี่ยนลม 180/40 (HW 35.08 kt ชนขีด A330 ภายใน tolerance) เป็น 200/40 (HW 39.5 kt)
12. T-O-20 และ 3.9.9: ผลคาดหวัง "ไม่มี overshoot เกิน 2 kt" ผิด แบบไม่มี anti-windup มี undershoot −3.5 ถึง −4.1 kt; เพิ่มกรณีมี anti-windup (7.8 ถึง 9.5 s, ≤ 0.75 kt) และแนะนำให้ใช้
13. 3.9.1 และตารางเปรียบเทียบ: thrust ใน FLARE ของโค้ดเดิมลดด้วยอัตรา 0.4/s; เลขบรรทัด `locDot` 11 → 12
14. JSON `common_airliner.afcs.ils_signal` conf สูง → กลาง; `fail_passive_DH_min` เพิ่ม src [O3]
15. ตาราง "ไม่พบในแหล่งสาธารณะ": AH ของ 737 ให้ตรงกับ JSON (100 ft ค่าประมาณ) และเพิ่ม CS-AWO 312 ในตารางความขัดแย้งเรื่อง AH
16. การอ้างแหล่งเสียง RETARD: 20 ft ด้วยมืออ้าง [O25][O42] (ไม่ใช่ [O30]); 10 ft autoland อ้าง [O30] (ไม่ใช่ [O25])
17. ATR "80 ft RA": ยืนยันว่าเป็น DH ตัวอย่างในตาราง CAT 2 ของ FCOM (3.9.7, ตารางความขัดแย้ง, note ใน JSON)
18. TK1951: ระบุว่า 1950 ft ยืนยันไม่ได้ (code7700 ให้ 2000 ft); 737 "LVL CHG ตั้ง V2 + 20" ยืนยันไม่ได้ (พบเฉพาะบริบท F/D takeoff)
19. 3.9.9: เพิ่มนิยาม D_LOC และทิศของ y ในกฎ LOC; ตาราง RVR CAT III: วงเล็บ "ลดถึง 75 m" ของ fail-passive ยืนยันไม่ได้

20. (รอบต่อ) 3.9.2: วงเล็บ "หรือ HUD landing system ที่รับรอง" ไม่มีใน [O8] §9.2.2 จึงระบุว่ามาจาก CS-AWO Issue 2 ผ่าน [O9]; เพิ่ม §11.2.5(b) p.24 ของ AH "typically 100 ft or less"
21. (รอบต่อ) 3.9.3: เกณฑ์ปฏิบัติการของ [O8] อ้าง App 3 §4(a)(1) (±5 kt) และ §5 p.31 (360 fpm, 7°, 8 m, 150 ถึง 750 m) และลบข้อความ "มาจากการสรุปของเครื่องมืออ่านเอกสาร"; JSON `common_airliner.afcs.ops_success` conf กลาง → สูง
22. (รอบต่อ) ตาราง 3.9.2: เลข slide ของ [O9] สำหรับ CAT I/II 11 → 12
23. (รอบต่อ) [O22]: เพิ่ม Issue 29, 16 DEC 2025, Section 2 item III.12 p.14 ในรายการแหล่งและ note ของ `b737_800.afcs.capability.certified`
24. (รอบต่อ) 3.9.4: เหตุการณ์สิงคโปร์ใน [O24] ไม่ระบุแบบเครื่อง (ถอด "A340"); 3.9.0 และ note ของ `a330_300.afcs.autoland.ALIGN_ft`: A340-500 ของ Case One เป็นการอนุมาน
25. (รอบต่อ) 3.9.5 TK1951: ค่า 1950 ft ยืนยันแล้วจาก [O17] p.2 (เดิมยืนยันไม่ได้)
26. (รอบต่อ) ตาราง 3.9.5: speed reversion เป็น LVL CHG ใช้เฉพาะในโหมด V/S เมื่อความเร็วต่ำกว่า MCP เกิน 5 kt และไม่เพิ่มขึ้น; การยกเลิก take-off mode ใต้/เหนือ 400 ft RA เขียนให้ครบ
27. (รอบต่อ) ตาราง 3.9.8: s ของ thrust idle 30 ft ของ A320 ใน flare ideal +65 → +64 m
28. (รอบต่อ) ตาราง 3.9.3: หมายเหตุว่า AC 20-191 §5.2.9.6 (900 m) เป็นกรณี rare undetected non-aircraft system error ไม่ใช่ limit risk แบบ EASA
29. (รอบต่อ) 3.9.4 และตารางความขัดแย้ง: ความสัมพันธ์ 0.0875 DDM ที่ 0.12θ ไม่มีใน [O10]; เพิ่มแหล่งใหม่ [O43] (EASA signal-in-space models §2.1.4, §2.2.2) ใน src ของ `ils_signal`; เพิ่มความขัดแย้ง LOC 0.00145 DDM/m (106.9 m) กับ 105 m
30. (รอบต่อ) 3.9.6: ช่วงทำงานของ alpha floor (liftoff ถึง 100 ft RA) อ้างหัวข้อ 8 ไม่ใช่ [O32]
31. (รอบต่อ) ตาราง 3.9.7: เพิ่มเลขหน้าของ GA และ windshear GA 10° ([O33] 2.02.04 p.7, 2.02.08 p.22) และระบุว่าเลขหน้าของ 12 s ≈ 400 ft เป็น p.4 หรือ p.5

### ข้อสงสัยที่เหลือ

- ~~โควตา WebFetch ของ session หมดระหว่างตรวจ จึงยังไม่ได้เปิด [O8] SRVSOP, [O9], [O22], [O23], [O26]~~ (รอบต่อ: เปิดและยืนยันครบทั้งห้าแหล่งแล้ว ดูแถวในตาราง)
- ตัวเลขเหตุการณ์ TK1951 ส่วนใหญ่อ่านผ่านแหล่งที่สอง (code7700, FSF) และรายงานเบื้องต้น [O17]; รายงานฉบับสมบูรณ์ของ DSB ยังไม่ได้เปิดตรง (รอบต่อยืนยัน 1950 ft, 144 kt, 460 ft และ AP B จาก [O17] แล้ว)
- (รอบต่อ) หน้า L.10.4 ของ FCOM MALEV [O21] อยู่นอกส่วนที่ WebFetch แปลงได้ ค่า crosswind 20 kt ยืนยันผ่าน Revision Record หน้า 0.4.3 เท่านั้น ส่วน headwind และ tailwind ของ 737 ยังพึ่ง [O20]
- (รอบต่อ) [O8] ยังเป็นค่าร่วมของ SRVSOP (ละตินอเมริกา) และ [O7] เป็นของยูกันดา CAAT ของไทยอาจกำหนดเกณฑ์ autoland check ต่างออกไป ไม่พบเอกสารสาธารณะของ CAAT
- (รอบต่อ) ความกว้าง LOC: ค่า 105 m (CASA) กับความไว 0.00145 DDM/m ของ EASA (106.9 m) ต่างกัน 1.8 % ค่าที่เลือก (105 m) ตรง AIP ดีกว่า แต่ถ้าใช้ค่า EASA ผลคาดหวังของ T-O-01 จะเลื่อนเกิน tolerance (21R 0.765° เทียบ 0.751° ± 0.005°)
- เกณฑ์ σ_y ใช้ track/2 + 0.3 m เป็นตำแหน่ง "outboard landing gear" แต่ 737 มีล้อคู่และ A330 มีโบกี้ ถ้าตีความเป็นขอบยางนอกสุด σ_y ที่ยอมได้จะลดลงอีกราว 0.1 ถึง 0.2 m (A330 มากที่สุด)
- `o_athr.mjs` ใช้ L/D 8 ทำให้แรงขับ trim ของ 737 ที่ 60 t เป็น 42.8 kN สูงกว่า 32.2 ± 6.5 kN ของหัวข้อ 2 (T-B-10) ไม่กระทบ gain แต่กระทบ dD/dV และเวลาเข้า ±2 kt เล็กน้อย ควรใช้ค่าจากหัวข้อ 2 เมื่อรวมโค้ด
- ขีดลม autoland ของ A320 เป็น "ATC reported wind" (ทิศแม่เหล็ก) ขณะที่ T-O-14 ใช้ course จริง 208.72° ความต่างราว 0.7° ไม่เปลี่ยนผลของกรณีทดสอบปัจจุบัน
- ค่า H และความเร็วของ A330 (140 kt) และ ATR (H 2.3 m, 117 kt) ยังเป็นค่าประมาณจากหัวข้ออื่น ผลในตาราง 3.9.8 ของสองแบบนี้จึงเป็นค่าประมาณทั้งหมด
- สคริปต์ของผู้ตรวจ: `scripts/orev_recompute.mjs` (+ `_out.txt`), `scripts/orev_athr.mjs` (+ `_out.txt`), `scripts/orev_geo.mjs`, `scripts/orev_json.mjs` (รันซ้ำรอบต่อ: 5 บล็อก, 93 leaf, 43 แหล่ง, 0 ข้อผิดพลาด), `scripts/orev2_crosscheck.mjs` (+ `_out.txt`, รอบต่อ), `scripts/orev_edit_rows.mjs` (ช่วยแก้แถวตาราง); ซอร์ส FBW ดาวน์โหลดจาก raw.githubusercontent.com (tag v0.10.0) เพื่ออ่านเท่านั้น ไม่ได้คัดลอกเข้า repo
