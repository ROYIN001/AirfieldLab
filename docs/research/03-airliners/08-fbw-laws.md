# 3.8 กฎการบังคับ fly-by-wire ของ Airbus (A320/A321/A330)

← [กลับไปหน้ารวมรอบที่ 3](../03-airliners.md) · [schema ส่วนขยาย](schema-ext.md) · [schema รายแบบ](schema.md)

หัวข้อนี้อธิบายกฎการบังคับ (control laws) ของระบบ fly-by-wire (FBW) ของ Airbus ตระกูล A320 (A320ceo, A320neo, A321ceo, A321neo) และ A330-300 ทั้ง normal law, alternate law, direct law, abnormal attitude law และ mechanical backup พร้อมแบบจำลองที่เขียนลง `src/20-flight.js` ได้ (DOM-free, 240 Hz) ต้นแบบที่ทดลองแล้วอยู่ใน `scripts/z_fbw_proto.mjs` และค่าที่คำนวณจากสมการอยู่ใน `z_testvals.mjs` (ผลลัพธ์บันทึกไว้ที่ `z_fbw_proto_out.txt` และ `z_testvals_out.txt` ในโฟลเดอร์เดียวกัน)

ข้อตกลงสำคัญ: ค่าที่เป็นตรรกะและขีดจำกัดของกฎ (เช่น 2.5 g, 67°, 15°/s) มาจากแหล่งสาธารณะ ส่วนอัตราขยาย (gains) ของ Airbus ไม่เคยเผยแพร่ ทุก gain ในหัวข้อนี้จึงเป็น **ค่าประมาณ** ที่เลือกเองและตรวจด้วยการจำลอง (est: true)

## 3.8.0 สรุปสั้น

- ใน normal law คันบังคับด้านข้าง (sidestick) แกน pitch สั่ง **load factor (nz)** ไม่ได้สั่งมุมพื้นบังคับ ปล่อยคันแล้วเครื่องรักษาเส้นทางบิน 1 g และทำ auto-trim ด้วย THS เอง ช่วง nz ที่สั่งได้คือ +2.5 g ถึง −1 g เมื่อ clean และ +2 g ถึง 0 g เมื่อกาง slat/flap [Z1][Z11][Z22] ผู้เขียนแนะนำให้ใช้รูปแบบ C* = Δnz + (Vco/g)·q กับ Vco ราว 121.9 m/s (400 ft/s, 237 kt) [Z12][Z17] ซึ่งเป็นค่าประมาณเพราะสูตรจริงของ Airbus ไม่เปิดเผย
- แกน roll สั่ง **อัตราหมุน p** ได้สูงสุด 15°/s (0.262 rad/s) ที่คันสุด ปล่อยคันแล้วเครื่องค้างมุมเอียง ถ้าเอียงเกิน 33° เครื่องจะกลับมาที่ 33° เอง ขีดจำกัดมุมเอียงคือ 67° (เหลือ 45° เมื่อ high AoA protection ทำงาน และ 40° เมื่อ high speed protection ทำงาน) [Z1] ข้อสังเกต: 67° ใกล้กับมุมเอียงสูงสุดที่ยังบินระดับได้ด้วย 2.5 g ซึ่งคำนวณได้ 66.42° (`z_testvals`)
- protection หลักมี 5 อย่าง ได้แก่ load factor, pitch attitude (+30° ถึง −15° และ +25° ใน CONF FULL), bank angle, high AoA (αprot, αmax, alpha floor) และ high speed (เริ่มที่ VMO+6 kt หรือ MMO+0.01, อำนาจ nose-down เหลือศูนย์ราว VMO+16 kt หรือ MMO+0.04) [Z1][Z22][Z31][Z32]
- ค่า α จริงที่หาได้มีน้อย ที่ยืนยันได้ดีคือ A320 รุ่นปี 1988 ใน CONF 3: αprot 14.5°, αmax 17.5°, alpha floor 15° [Z8] และ US1549 (CONF 2) αmax 17.5° [Z30] ส่วนค่าของ A330 ไม่พบในแหล่งสาธารณะ จึงเสนอกฎประมาณที่ผูกกับเส้นโค้งแรงยกของโมเดลเอง ได้แก่ CL(αmax) = 0.873·CLmax (จาก Vαmax 107 kt และ VLS 123 kt ใน [Z7]), αprot = αmax − 3°, αfloor = αmax − 2.5°
- flare mode ของ A320: เมื่อผ่าน 50 ft RA ระบบจำค่า θ แล้วค่อยเปลี่ยนจากกฎ nz เป็นกฎ pitch attitude จนครบที่ 30 ft จากนั้นลดค่าอ้างอิง θ ลงไปที่ −2° ภายใน 8 วินาที นักบินจึงต้องดึงคันเพื่อ flare เอง [Z8][Z19] ส่วน A321neo เริ่มที่ 100 ft (ข้อมูลจากฟอรัม ความเชื่อมั่นต่ำ) [Z25] และ A330 เริ่มที่ 100 ft โดย A330/340 FCTM ที่ยกใน [Z32] เขียนว่า "on reaching 100 ft on the approach the pitch law is modified to be a full authority direct law with no auto-trim" พร้อมเทอม nose-down ที่นักบินต้องดึงคันต้าน (ความเชื่อมั่นกลาง) [Z32][Z29]
- เมื่อระบบเสียหายจะลดระดับกฎตามลำดับ normal, alternate (ALT1/ALT2), direct โดย alternate ยังสั่ง nz แต่ protections หายไปเกือบหมด ส่วน direct ใช้คันสั่ง elevator ตรงและไม่มี auto-trim (ขึ้นข้อความ USE MAN PITCH TRIM) ใน A320 alternate law เมื่อลดล้อลงจะกลายเป็น direct law [Z7][Z1][Z2]
- ต้นแบบ (A320 64.5 t ใช้ข้อมูลประมาณจากหัวข้อ 3) ผ่านเกณฑ์ของกรณีทดสอบที่รันได้แล้วทั้ง 29 กรณี (จากทั้งหมด 33 กรณี อีก 4 กรณีเป็นตรรกะการเปลี่ยนกฎและ regression ที่ต้องรันหลังเขียนลงโค้ดจริง) ตัวอย่างเช่น คันครึ่งทางที่ 330 kt ได้ nz สูงสุด 1.792 g (เป้า 1.75 g, t90 = 1.07 s) ลดความเร็วด้วย idle บน approach แล้ว α ค้างที่ 9.34–9.43° (αprot ของโมเดล 9.38°) เอียง 30° ปล่อยคัน 30 s ความสูงเปลี่ยน 0.1 m และคันสุดได้ p สูงสุด 16.5°/s แล้วหยุดที่ φ 66.4°
- งานแรกที่แนะนำ (P1) คือเพิ่มคลาส `FbwLaw` แบบ pure ใน `src/20-flight.js` ที่รับ stick, สถานะเครื่อง และ config แล้วคืนคำสั่ง elevator, อัตรา THS, คำสั่ง roll และธงสถานะ พร้อมชุดทดสอบ `test/fbw.test.mjs` ที่ใช้กรณี T-Z-01 ถึง T-Z-33

## 3.8.1 สภาพปัจจุบันใน AirfieldLab และสิ่งที่ขาด

โค้ดปัจจุบัน (`src/20-flight.js` บรรทัด 427–477 คลาส `PilotLaws`) มีสองโหมดสำหรับเครื่องฝึกใบพัดสมมุติ [Z35]

- **ASSIST** เป็นกฎสั่งท่าทาง (attitude command): คันแกน roll สั่งมุมเอียง φcmd = x·33° (บรรทัด 434) ส่วนคันแกน pitch สั่งอัตราเปลี่ยนค่าท่าทางที่ถือไว้ θHold ด้วย qCmd = y·7°/s (บรรทัด 437–438) จำกัด θHold ไว้ที่ −15° ถึง +18° และกด θHold ลงเมื่อ α เกิน αstall − 3.5° (บรรทัด 439–440) มี auto-rudder และ auto-throttle
- **DIRECT** ใช้คันสั่งมุม elevator ตรง พร้อม auto-trim โดยเลื่อน `trimDe` ตามอัตรา q เมื่อปล่อยคัน (บรรทัด 467–469)
- input จากแป้นพิมพ์เป็นแบบเปิดปิด (binary) ไม่มี ramp (CLAUDE.md, `90-app.js` บรรทัด 332 KEYMAP)

สิ่งที่ยังไม่มีสำหรับเครื่อง Airbus:

1. กฎสั่ง nz (C*) ที่มี integral และ auto-trim THS แยกจาก elevator (โครง THS เป็นงานของหัวข้อ 7 `controls.trim`)
2. กฎ roll-rate command ที่ค้างมุมเอียงเมื่อปล่อยคัน และ spiral stability เกิน 33°
3. protections ทั้งห้าอย่าง และตรรกะการเข้าและออกจาก protection
4. ground mode, flight mode, flare mode และการเปลี่ยนโหมดแบบนุ่มนวล
5. ลำดับการลดระดับกฎ (alternate, direct, abnormal attitude) และข้อความเตือนบน PFD/HUD
6. ข้อมูล sidestick (ระยะ แรงสปริง) เพื่อแปลงค่า input จากแป้นพิมพ์และ gamepad เป็นตำแหน่งคัน

## 3.8.2 สถาปัตยกรรมและลำดับชั้นของกฎ

### 3.8.2.1 คอมพิวเตอร์และเซนเซอร์

| หัวข้อ | A320 family | A330 | แหล่ง |
|---|---|---|---|
| คอมพิวเตอร์ควบคุมการบิน | 2 ELAC (elevator aileron computer) + 3 SEC (spoiler elevator computer) | 3 PRIM (FCPC) + 2 SEC (FCSC) | [Z13] สูง, [Z3] สูง |
| คอมพิวเตอร์ yaw | 2 FAC (yaw damper, rudder trim, rudder travel limit) rudder ต่อ pedal ทางกล | รุ่นพื้นฐาน rudder กลไก รุ่นหลังเป็น FBW | [Z1] สูง, [Z3] สูง |
| แหล่งข้อมูลอากาศ | 3 ADIRU, ELAC ใช้ค่าเฉลี่ย AoA ของ ADR 1 และ 2 | 3 ADIRU, FCPC ใช้ค่า AoA หลังกรอง (ปรับหลัง QF72) | [Z7] สูง, [Z4] สูง |
| การทำงาน | คอมพิวเตอร์ทั้งห้าทำงานพร้อมกัน ลำดับงานคงที่และวนรอบด้วยคาบคงที่ | เหมือนกัน | [Z13][Z14] กลาง |
| สำรองทางกล | THS (trim wheel) และ rudder pedal | เหมือนกัน | [Z13] กลาง, [Z23] กลาง |

คาบการคำนวณ (cycle time) ของ ELAC/PRIM **ไม่พบในแหล่งสาธารณะ** [Z14] บอกเพียงว่าคงที่ ในเครื่องจำลองให้คำนวณกฎทุกขั้น 240 Hz (4.167 ms) ซึ่งเร็วกว่าที่จำเป็นมาก และไม่กินงบหน่วงเวลา 0.10 s ของระดับ Level 1 ที่รอบที่ 1 หัวข้อ 6 กำหนด [Z36]

เอกสารวิชาการหลักของ Airbus ที่อธิบายหลักการคือ Favre 1994 [Z15] และ Brière กับ Traverse 1993 [Z16] (ทั้งสองไม่ได้เข้าถึงเนื้อหา ใช้ผ่านรายการอ้างอิงของ [Z14]) ส่วน [Z13] เขียนว่า "the fly-by-wire system acts as the inner loop of an autopilot system, while the pilot represents the outer loop" หมายความว่านักบินสั่งเป้าหมายระดับสูง (nz, p) แล้วระบบหามุมพื้นบังคับเอง

### 3.8.2.2 ลำดับชั้นของกฎ

| กฎ | pitch | roll / yaw | protections | auto-trim | แหล่ง |
|---|---|---|---|---|---|
| Normal | สั่ง nz (C*), flare mode, ground mode | สั่ง p, ค้าง φ, turn coordination | ครบทั้งห้า | มี | [Z1][Z2][Z22] สูง |
| Alternate (ALT1 ของ A330, "with reduced protection" ของ A320) | สั่ง nz, ไม่มี pitch attitude protection | A330 ALT1: roll ยังเป็น normal; A320: roll direct | เหลือ load factor, มี low speed stability และ high speed stability แทน αprot และ HSP | มี | [Z1][Z2][Z23] สูง/กลาง |
| Alternate (ALT2 ของ A330, "without protection" ของ A320) | สั่ง nz | roll direct, yaw alternate (yaw damper อย่างเดียว) | เหลือ load factor, ไม่มี speed stability (A320) | มี | [Z2][Z23] |
| Direct | คันสั่ง elevator ตรง ระยะ elevator จำกัดตาม config/CG | roll direct | ไม่มี (เหลือ aural overspeed และ stall warning) | ไม่มี | [Z3][Z7][Z32] |
| Abnormal attitude | ALT2 ที่มีอำนาจ roll เต็มและไม่มี auto-trim | roll direct | ไม่มี | ไม่มี (phase 1) | [Z2][Z7] สูง |
| Mechanical backup | THS ด้วย trim wheel | rudder pedal | ไม่มี | ไม่มี | [Z13][Z32] |

ชื่อ ALT1/ALT2 ของ A330 [Z2] กับคำว่า "alternate law with/without reduced protection" ใน A320 [Z23] ไม่ได้ตรงกันทุกรายละเอียด (ดูส่วนความขัดแย้ง) แบบจำลองใน AirfieldLab จึงเก็บเป็นชุดธง (flags) แทนการผูกกับชื่อ เช่น `{rollLaw:'normal'|'direct', protAoA:false, speedStab:true}`

## 3.8.3 Normal law แกน pitch

### 3.8.3.1 สิ่งที่คันสั่ง: load factor และ C*

แหล่งปฐมภูมิทุกฉบับตรงกันว่า ใน normal law คันแกน pitch สั่ง load factor [Z1] (KNKT §1.6.5.2), [Z2] (BEA AF447 หน้า 38: "the longitudinal orders from the sidesticks command a load factor"), [Z13] ("the sidestick position is translated into vertical load factor demands") ส่วนรายละเอียดของ "C*" มาจากแหล่งวิชาการ

- C* นิยามโดย Tobie, Elliott และ Malcom (Boeing, 1965–1966) [Z17][Z18]: **C\* = Δnz + (Vco/g)·q** โดย Vco คือ crossover speed ซึ่งเท่ากับ 400 ft/s (121.92 m/s, 237.0 kt) ที่ความเร็วต่ำกว่า Vco เทอม q มีน้ำหนักมากกว่า ที่ความเร็วสูงกว่า Vco เทอม nz มีน้ำหนักมากกว่า [Z12] หน้า 3 ให้ "Vco ≈ 240kt" (123.5 m/s) (ผู้ตรวจ 2026-11-18: ค่า 400 ft/s เป็นค่าที่ใช้กันทั่วไปในตำรา แต่ยืนยันจากแหล่งที่เข้าถึงได้ไม่ได้ [Z18] มีเพียงรายการอ้างอิง Malcom และ Tobie D6-17841-T/N และไม่มีสมการหรือค่า Vco ส่วน [Z17] ไม่ได้เข้าถึง ความต่าง 237 กับ 240 kt คือ 1.3% ไม่มีผลกับการออกแบบ)
- [Z12] (DLR และ FAA) เขียนว่า Airbus FBW ทุกแบบใช้ C* command/feedback เป็นกฎหลักของแกน pitch (ไม่ใช่ C* ดั้งเดิมทุกประการ) มีเส้นทาง integral และ gain ของ q ที่ปรับตาม CAS และชี้ว่า C* ทำลาย speed stability ตามธรรมชาติ (neutral speed stability)
- รายงาน Habsheim [Z8] (§1.16.1.2) อธิบายกฎว่า "controlling the load factor around the value 1" โดยมีเทอม pitch rate และเทอม speed damping
- KNKT [Z1] §1.6.5.4 (หน้า 36): "the aircraft maintains the flight path, even in case of speed changes"

**แบบที่ FBW A32NX ใช้** (โมเดลจำลองโอเพนซอร์ส GPL-3.0, ไม่ใช่ข้อมูลของ Airbus) [Z19]: ค่าผิดพลาด e = (Vm/g)·q + (nz − cosθ/cosφ) − (Vco/V + 1)·Δnz_cmd โดย Vm = 100 m/s (194.4 kt) และ Vco ในตารางเท่ากับ 100 ทุกความเร็ว gain P = 13.5 และ D = 0.5 คงที่ตาม TAS และตารางแปลงคันเป็น Δnz คือ คัน −1, 0, +1 ให้ −2.0, 0, +1.5 g ข้อมูลนี้ใช้เป็นหลักฐานเชิงโครงสร้างว่ามีการชดเชย cosθ/cosφ และเทอม Vco/V ได้ แต่ตัวเลขถูกปรับให้เข้ากับ aerodynamics ของ MSFS จึงห้ามถือเป็นค่าจริง

**ตารางคันเป็น Δnz ที่เสนอ** (ค่าขีดจำกัดจาก [Z1][Z11][Z22] ความเชื่อมั่นสูง ส่วนความสัมพันธ์เชิงเส้นเป็นค่าประมาณ):

| config | คัน +1 (ดึงสุด) | คัน +0.5 | คัน 0 | คัน −0.5 | คัน −1 (ดันสุด) |
|---|---|---|---|---|---|
| clean (CONF 0) | nz 2.5 g (Δnz +1.5) | 1.75 g | 1 g (ถือเส้นทาง) | 0 g | −1.0 g (Δnz −2.0) |
| slat/flap ออก | 2.0 g (Δnz +1.0) | 1.5 g | 1 g | 0.5 g | 0 g (Δnz −1.0) |

สมการ: Δnz_cmd = s·(nz_max − 1) เมื่อ s ≥ 0 และ Δnz_cmd = −s·(nz_min − 1) เมื่อ s < 0 (s คือตำแหน่งคันแบบไร้มิติ −1 ถึง +1 หลังผ่าน dead zone และ expo)

TheAirlinePilots [Z31] อธิบายเหตุผลที่ให้ 2.5 g ทันทีแทนการบังคับให้นักบินดึงแรงขึ้นเรื่อย ๆ ในการหลบสิ่งกีดขวาง (เปรียบเทียบ "immediate 2.5g reaction" กับการดึงแบบลังเลที่ "2 second delay") ข้อนี้เป็นเหตุผลเชิงออกแบบ ไม่ใช่ค่าทางเทคนิค

### 3.8.3.2 Auto-trim, neutral speed stability และการถือเส้นทาง 1 g

- เมื่อปล่อยคัน ระบบสั่ง Δnz = 0 จึงรักษาเส้นทางบินไว้แม้ความเร็วเปลี่ยน (neutral speed stability) ไม่มีแนวโน้มกลับสู่ความเร็ว trim แบบเครื่องบินทั่วไป [Z1][Z12] ความเร็วต่ำถูกป้องกันด้วย high AoA protection แทน [Z12] และ [Z12] อ้าง Favre [Z15] ว่าภายใต้กฎ C* โพลของ phugoid แยกเป็นโพลจริงสองตัว (ไม่มีการแกว่ง phugoid แบบเครื่องบินทั่วไป)
- auto-trim ขยับ THS เพื่อลดค่า elevator ที่ค้างอยู่ (offload) [Z12] ไม่ทำงานเมื่อ: อยู่ใน flare (THS ถูกตรึงที่ 50 ft RA ใน A320 และ A321ceo, ที่ 100 ft RA ใน A321neo) [Z25][Z26], ใน direct law [Z3][Z7] และ abnormal attitude law phase 1 [Z7]; ส่วนเมื่อ |φ| > 33° หรือ nz > 1.3 g [Z33] เขียนว่าระบบ "prevents further trim up" คือห้ามเฉพาะ nose-up trim (ผู้ตรวจแก้ 2026-11-18: เดิมเขียนว่าไม่ทำงานทั้งสองทิศ) ขอบล่าง 0.5 g มาจากโมเดล [Z19] เท่านั้น (ซึ่งตรึงทั้งสองทิศนอกช่วง 0.5–1.25 g และ |φ| ≤ 30°)
- เมื่อ α ถึง αprot ระบบหยุด nose-up trim [Z7] (BEA D-AXLA หน้า 29) และเมื่อ HSP ทำงาน pitch trim ถูกตรึง [Z22][Z32]
- ขีดจำกัด THS ฝั่ง nose-up ของ auto-trim ในเหตุการณ์ D-AXLA คือ −11° (หยุดที่ nose-up stop) [Z7] ตรงกับค่าคงที่ −11 ใน [Z19] (ระยะเชิงกลของ THS A320 คือ 13.5° up / 4° down เป็นข้อมูลของหัวข้อ 7 [Z38])
- อัตราการขยับ THS เป็นของหัวข้อ 7 (`controls.trim`) หัวข้อนี้ใช้ค่าตัวยึด 0.3°/s ในต้นแบบเท่านั้น

**การชดเชยมุมเอียงและท่าทาง**: ค่าอ้างอิง nz ไม่ใช่ 1 แต่เป็น nz_ref = cosθ/cos φ' โดย φ' = min(|φ|, 33°) ดังนั้นปล่อยคันในวงเลี้ยว 30° เครื่องจะให้ nz = 1.1547 g และไม่เสียความสูง แต่เกิน 33° ระบบไม่ชดเชยเพิ่ม (code7700 อ้าง A330/340 FCTM: "Beyond 33° angle of bank, pitch compensation is no longer available") [Z32] นักบินต้องดึงคันเอง โครงสร้าง cosθ/cosφ นี้ปรากฏใน [Z19] เช่นกัน (แต่ [Z19] ไม่ได้จำกัดที่ 33° ในสูตร nz_ref แต่ใช้ Saturation ±33 ที่อื่น)

**การถือเส้นทาง (path hold)**: C* ที่มี integral จะทำให้ค่าเฉลี่ยของ C* error เป็นศูนย์ แต่ไม่รับประกันว่า γ คงที่เมื่อความเร็วเปลี่ยน [Z12] ในต้นแบบจึงเพิ่มลูปนอกเมื่อคันอยู่ในตำแหน่งกลาง:
Δnz_hold = (V/g)·(Kγ·(γref − γ) + Kγi·∫(γref − γ)dt) จำกัดที่ ±0.3 g, Kγ = 1.0 1/s และ Kγi = 0.2 1/s² (ค่าประมาณ) γref ถูกรีเซ็ตทุกครั้งที่ขยับคัน ผลคือขณะลดความเร็วจาก 133.5 kt ด้วย idle บน approach γ อยู่ระหว่าง −3.49° ถึง −2.98° (เป้า −3°) จนถึงจุดที่เข้า αprot (`z_fbw_proto_out.txt`)

### 3.8.3.3 Ground mode, flight mode และ flare mode

| ช่วง | สิ่งที่เกิด | ค่า | แหล่ง / ความเชื่อมั่น |
|---|---|---|---|
| ground mode | คันสั่ง elevator ตรง ไม่มี auto-trim | THS อยู่ที่ค่าที่ตั้งไว้สำหรับ takeoff | [Z28] ต่ำ, [Z33] ต่ำ |
| ground ไป flight | ผสมกฎ ground กับกฎ nz ตามเวลา | 5 s หลังล้อพ้นพื้น | [Z28] ต่ำ, [Z33] ต่ำ (อ้าง SmartCockpit A330) |
| เงื่อนไขในโมเดล FBW | เข้า flight เมื่ออยู่บนอากาศและ θ > 8° หรือ RA > 400 ft; กลับ ground เมื่อ θ < 2.5° ยืนยัน 5 s | 8°, 400 ft (121.9 m), 2.5°, 5 s | [Z21] ต่ำ (โมเดล) |
| flight mode | กฎ nz ทำงานตั้งแต่ takeoff ถึง landing | | [Z1] สูง |
| flare (A320, A321ceo) | ที่ 50 ft RA จำค่า θ, ผสมจากกฎ nz เป็นกฎ θ ระหว่าง 50 ถึง 30 ft, จาก 30 ft ลด θref ไป −2° ใน 8 s | 50 ft (15.24 m), 30 ft (9.144 m), −2°, 8 s | [Z8] สูง (A320 ปี 1988), [Z19] ต่ำ, [Z25] ต่ำ |
| flare (A321neo) | THS ตรึงที่ 100 ft RA, flare law ไม่ชดเชย ground effect หรือ thrust effect | 100 ft (30.48 m) | [Z25] ต่ำ (อ้าง FCOM ในฟอรัม) |
| flare (A330) | flare mode เริ่มที่ 100 ft RA: กฎ pitch เปลี่ยนเป็น "full authority direct law with no auto-trim" และเพิ่ม "a nose down term" ที่นักบินต้องดึงคันต้านเพื่อ flare แบบเครื่องบินทั่วไป (ไม่ระบุขนาด) | 100 ft | [Z32] กลาง (A330/340 FCTM, normal law หัวข้อ Flare Mode), [Z29] ต่ำ, [Z33] ต่ำ |
| flight ไป flare และ flare ไป ground (A330) | ช่วงเปลี่ยน 2 s แต่ละช่วง | 2 s | [Z33] ต่ำ |
| หลังแตะพื้น | กลับสู่ ground mode ทีละน้อย | | [Z32] กลาง |

[Z8] (Habsheim) บรรยายว่า "between 50 and 30 ft" เทอม load factor ถูกแทนด้วยเทอมท่าทางอ้างอิงกับค่าที่บันทึกที่ 50 ft และที่ 30 ft "derotation law" นำค่าท่าทางอ้างอิง "to −2° in 8 seconds" [Z25] รายงานว่า FCOM ของ A320ceo บางฉบับหลังไม่เขียนตัวเลข "−2° ใน 8 s" แล้ว แต่ FCOM ของ A321ceo ยังเขียน ข้อความจาก Airbus Safety First [Z24] ยืนยันว่าเทคนิค flare บนเครื่อง FBW คือ "a progressive and gentle back stick order until touchdown" และให้เริ่ม flare ราว 30 ft สำหรับ A320 และราว 40 ft สำหรับ A330 ซึ่งสอดคล้องกับกฎที่ทำให้หัวเชิดลงถ้านักบินไม่ดึง

**สมการ flare ที่เสนอ** (โครงจาก [Z8][Z19], gain เป็นค่าประมาณ):

- θmemo = θ ที่ 50 ft RA
- θref(t) = max(−2°, θmemo − r·t30) โดย r = (max(−2°, θmemo) + 2°)/8 s และ t30 คือเวลานับจากผ่าน 30 ft
- θcmd = θref + 10°·s (นักบินดึงคันเพิ่มท่าทางได้สูงสุด 10° ค่าประมาณ)
- w = clamp((50 − RA_ft)/20, 0, 1) และ e = (1 − w)·e_C* + w·(V/g)·(0.8·(θ − θcmd) + 1.0·θ̇)

ผลจากต้นแบบ (FULL, 133.5 kt, γ −3°): ถ้าไม่แตะคัน θ ลดจาก 1.38° ที่ 50 ft เป็น 0.81° ที่แตะพื้น และอัตราจมที่แตะพื้น 729 fpm (3.70 m/s) ซึ่งแรงเกินไป ถ้าดึงคันจาก 0 ถึง 0.6 ระหว่าง 30 ถึง 10 ft อัตราจมเหลือ 413 fpm (2.10 m/s) และ θ ที่แตะพื้น 5.98° ผลนี้แสดงว่ากฎบังคับให้นักบินต้อง flare เองเหมือนเครื่องจริง

## 3.8.4 Normal law แกน roll และ yaw

### 3.8.4.1 สิ่งที่คันสั่งและขีดจำกัดมุมเอียง

| รายการ | ค่า | แหล่ง / ความเชื่อมั่น |
|---|---|---|
| อัตราหมุนสูงสุดที่คันสุด | 15°/s (0.2618 rad/s) แปรตามคันเชิงเส้น | [Z1] สูง, [Z20] ต่ำ (Gain 15) |
| ปล่อยคันที่ \|φ\| ≤ 33° | ค้างมุมเอียงไว้ (bank hold) ไม่มี spiral stability ตามธรรมชาติ | [Z1] สูง, [Z22] กลาง |
| ปล่อยคันที่ \|φ\| > 33° | กลับมาที่ 33° เอง (positive spiral stability) | [Z1] สูง |
| ขีดจำกัดเมื่อคันสุด | 67° | [Z1] สูง ([Z13] รูปแสดง 65° ดูส่วนความขัดแย้ง) |
| เมื่อ high AoA protection ทำงาน | 45° | [Z1] สูง |
| เมื่อ high speed protection ทำงาน (A320) | 40° และปล่อยคันแล้วกลับ 0° | [Z1] สูง, [Z22][Z31] |
| เมื่อ high speed protection ทำงาน (A330) | 45° | [Z32] กลาง (A330/340 FCTM) |
| autopilot ตัดออก | มุมเอียงเกิน 45° | [Z1] สูง |
| FD bars หายไป | มุมเอียงเกิน 45° (กลับมาเมื่อต่ำกว่า 40°) | [Z1] สูง (หน้า 33), [Z22] กลาง (ผู้ตรวจแก้: ไม่ได้ผูกกับโหมด AoA) |

ตารางอัตรากลับของ FBW A32NX [Z20] (ค่าในโมเดล ความเชื่อมั่นต่ำ): normal φ {33, 66, 71}° ให้อัตราสวน {0, 15, 20}°/s; โหมด AoA {33, 45, 66}° ให้ {0, 15, 20}°/s; โหมด HSP {0, 40, 50}° ให้ {0, 15, 20}°/s ผู้เขียนใช้แนวเดียวกันแต่ให้จุดเต็ม 15°/s อยู่ที่ขีดจำกัดพอดี (67°, 45°, 40°) เพื่อให้คันสุดหยุดที่ขีดจำกัด เพราะ 15·s − R(φ) = 0 เมื่อ s = 1 และ R = 15°/s

**สมการ (ค่าประมาณ)**:

- R(φ) = 0 เมื่อ |φ| ≤ 33°; = 15·(|φ| − 33)/(φlim − 33) เมื่อ 33° < |φ| ≤ φlim; = 15 + 5·min(1, (|φ| − φlim)/5) เมื่อเกิน (°/s, เครื่องหมายตาม φ)
- ใน HSP: R(φ) = 15·|φ|/40 จนถึง 40° แล้วเพิ่มอีก 5°/s
- p_cmd = 15·s − R(φref) (°/s) และ φref = ∫p_cmd dt (ค่าท่าทางอ้างอิงที่ระบบถือไว้ เมื่อ s = 0 และ |φ| ≤ 33° φref จะคงที่)
- φref ถูกบีบให้ห่างจาก φ ไม่เกิน ±1° (anti-windup) และ e_φ = φref − φ
- คำสั่ง roll ปกติ u (−1 ถึง 1 ของอำนาจ roll รวม aileron กับ roll spoiler) = Kφ·e_φ + Kp·(p_cmd − p) + ∫Ki·e_φ dt − Lp·p_cmd/Lu
- เลือก gain ด้วย pole placement ของระบบ 1-DOF ṗ = Lp·p + Lu·u: Kφ = ωn²/Lu, Kp = (2ζωn + Lp)/Lu, Ki = 0.5·Kφ โดย ωn = 2.0 rad/s และ ζ = 0.8 (ค่าประมาณ) ที่ 133.5 kt และ 300 m ได้ Lp = −0.848 1/s, Lu = 0.335 rad/s² จึงได้ Kφ = 11.92, Kp = 7.01, Ki = 5.96 (`z_testvals`) Lp มาจาก Clp = −0.509 ของหัวข้อ 3 [Z37] และ Lu ใช้ Cl ของอำนาจ roll สูงสุด 0.05 (ค่าประมาณ เพราะพื้นบังคับเป็นงานของหัวข้อ 7)
- ในเครื่องจริง gain ต้องปรับตาม q̄ เหมือนแกน pitch ([Z20] มี ScheduledGain ตาม V: 0 ที่ ≤ 40 kt ไปจนถึง 1.4 ที่ ≥ 100 kt) และโมเดล FlightGear [Z34] ก็ schedule gain ของ pitch และ roll ระหว่าง 140 กับ 350 kt CAS ในเครื่องจำลองให้คำนวณ Lp และ Lu ใหม่ทุกขั้นแล้วใช้สูตรเดียวกัน

ผลจากต้นแบบ (`z_fbw_proto_out.txt`): คันสุด 12 s ได้ p = 16.47°/s ที่ 2 s และ φ สูงสุด 66.42° ปล่อยคันแล้ว φ ลดลงถึง 34° ภายใน 8.52 s และค้างที่ 33.02° โหมด AoA (ขีด 45°) φ สูงสุด 45.55° โหมด HSP (ขีด 40°) φ สูงสุด 38.96° และกลับเป็น 0.02° ภายใน 20 s คันสุด 2 s แล้วปล่อย ภายใต้แรงรบกวน 0.02 rad/s² φ อยู่ในช่วง 28.68–28.74° (ค้างมุมได้) ก่อนปรับ anti-windup จาก ±3° เป็น ±1° พบ p พุ่งถึง 18.96°/s (เกินเป้า 26%) จึงเปลี่ยน

### 3.8.4.2 Yaw: turn coordination, yaw damper และ pedal

- [Z13] เขียนว่า "lateral control is achieved through roll rate, sideslip, and bank angle objectives" นั่นคือกฎ lateral ของ normal law มีเป้า sideslip ด้วย ระบบทำ turn coordination และ yaw damping ให้เอง
- เหยียบ pedal โดยไม่แตะคัน ได้ sideslip และมุมเอียงคงที่ ("Sidestick free with pedal deflection results in stabilized sideslip and bank angle") [Z28] ความเชื่อมั่นต่ำ (ข้อความคัดลอกในฟอรัม)
- ใน A320ceo pedal ต่อ rudder ทางกล และ FAC ทำ yaw damper, rudder trim และ rudder travel limiter [Z1][Z38] ใน alternate law อำนาจ yaw damper เหลือ ±5° ของ rudder [Z1]
- ใน roll direct "bank stability is no longer active" และเครื่องรู้สึกไวมาก [Z32] ในแบบจำลองให้ใช้กฎ yaw ที่ AirfieldLab มีอยู่แล้ว (rudder = −1.6·β ใน ASSIST) เป็น turn coordination โดยเพิ่ม feedforward r_cmd = g·tanφ/V (ที่ 33° และ 133.5 kt ได้ 5.313°/s)

### 3.8.4.3 Sidestick สองข้างและ priority

- มีการเตือน dual input เมื่อคันทั้งสองพ้นตำแหน่งกลางเกิน 2° [Z1] สูง (วิธีรวมค่าจากสองคันไม่ได้ตรวจในรอบนี้)
- กดปุ่ม takeover ค้างเกิน 40 s คันอีกข้างจะถูกตัดถาวรจนกว่าจะกดปุ่มอีกครั้ง [Z1] สูง
- เมื่อ autopilot ทำงาน solenoid ล็อกคันไว้ที่ตำแหน่งกลาง นักบินต้องใช้แรงเกิน 5 daN (50 N) ใน pitch หรือ 3.5 daN (35 N) ใน roll เพื่อดันผ่านซึ่งจะตัด autopilot [Z1] สูง

AirfieldLab มีนักบินคนเดียว ไม่ต้องจำลอง dual input แต่ควรใช้ตรรกะ "ขยับคันเกินเกณฑ์แล้วตัด autopilot" กับการกด T (take control) ที่มีอยู่แล้ว

## 3.8.5 Protections

### 3.8.5.1 Load factor limitation

| config | nz สูงสุด | nz ต่ำสุด | แหล่ง |
|---|---|---|---|
| clean | +2.5 g | −1.0 g | [Z1] สูง, [Z11] สูง (เกณฑ์ FAA สำหรับ FBW), [Z22] กลาง |
| slat/flap ออก | +2.0 g | 0 g | เหมือนกัน |

- ขีดนี้คงอยู่ใน alternate law ด้วย ("The load factor limitation is similar to that under normal law") [Z1] และหายไปใน direct law [Z3]
- ECAM แสดง G LOAD สีเหลืองอำพันเมื่อ nz > 1.4 g หรือ < 0.7 g นานเกิน 2 s [Z22] กลาง
- ใน HSP ระบบเพิ่มคำสั่ง nose-up อัตโนมัติ (A330 FCTM: สูงสุด 1.75 g) [Z32] กลาง

ในต้นแบบ ขีด nz เป็น clamp ของ nz_ref + Δnz ระหว่าง [nz_min, nz_max] ผลการดึงคันสุดที่ 330 kt clean คือ nz สูงสุด 2.643 g ชั่วขณะ (เกิน 2.5 g อยู่ 0.143 g รวม 0.850 s) ส่วนดันคันสุด nz ต่ำสุด −1.020 g ในกรณีดึงคันสุดค้างไว้ α จะถึง αprot ก่อนที่ 2.5 g จะคงตัวเพราะความเร็วลดลง (โหมดเปลี่ยนเป็น AOA ภายใน 4.5 s)

### 3.8.5.2 Pitch attitude protection

| ขอบ | ค่า | แหล่ง |
|---|---|---|
| nose up CONF 0 ถึง 3 | 30° ลดลงเป็น 25° ที่ความเร็วต่ำ | [Z1] สูง (หน้า 31–32: "30° nose up in configuration 0 to 3, progressively reduced to 25° at low speed"), [Z22][Z31][Z32] กลาง |
| nose up CONF FULL | 25° ลดลงเป็น 20° ที่ความเร็วต่ำ | [Z1] สูง (หน้า 31: "25° nose up in configuration FULL, progressively reduced to 20° at low speed"), [Z22] กลาง |
| nose down | −15° | [Z1] สูง |
| FD bars หายไป | > 25° up หรือ < −13° down, กลับมาที่ 22° และ −10° | [Z1] สูง (25/13), [Z22] กลาง (22/10) |

นิยาม "ความเร็วต่ำ" ที่ทำให้ขีดลดลง **ไม่พบในแหล่งสาธารณะ** ข้อเสนอ (ค่าประมาณ): ลดเชิงเส้นจากขีดเต็มที่ V ≥ VLS เป็นขีดต่ำที่ V ≤ Vαprot

**วิธีจำลอง**: แปลงขอบท่าทางเป็นขีดของ Δnz คือ Δnz ≤ (V/g)·Kθ·(θmax − θ) และ Δnz ≥ (V/g)·Kθ·(θmin − θ) โดย Kθ = 0.5 1/s (ค่าประมาณ) ความหมายคือ อัตราเปลี่ยน γ ที่ยอมให้ลดลงเมื่อเข้าใกล้ขอบ ผลจากต้นแบบ: ดึงคันสุด 29 s ที่ 330 kt clean พร้อมแรงขับ 3 เท่า θ สูงสุด 30.12° และดันคันสุด 11 s θ ต่ำสุด −12.75° (ยังไม่ถึง −15° เพราะ nz −1 g จำกัดอัตราก่อน)

### 3.8.5.3 High angle of attack protection

**พฤติกรรม** (ความเชื่อมั่นสูง จากรายงานสอบสวน):

- เมื่อ α ถึง αprot ระบบเปลี่ยนจากกฎ nz เป็นกฎ α ("protection mode") คันสั่ง α แปรตามตำแหน่งคันจาก αprot (คันกลาง) ถึง αmax (คันสุด) ดึงคันสุดค้างไว้ α ไม่เกิน αmax ปล่อยคัน α กลับไปที่ αprot และค้างอยู่ [Z5] (NTSB หน้า 12), [Z8] ("even if the pilot holds the control in full nose-up position")
- เครื่องไม่ stall ใน normal law แม้ดึงคันสุดค้าง [Z2] หน้า 43, [Z5]
- เวลาที่ใช้เปลี่ยนจากกฎ nz เป็นกฎ α **ไม่พบในแหล่งสาธารณะ** (เชิงอรรถ "the change of law is made in one second" ใน [Z8] §1.16.1.2 ผูกกับช่วงเปลี่ยนเป็นกฎ flare ระหว่าง 50–30 ft ไม่ใช่การเข้า α protection; ผู้ตรวจแก้ 2026-11-18) ต้นแบบใช้ lead 0.5 s และ bumpless transfer แทน
- เมื่อถึง αprot ระบบหยุด nose-up trim [Z7] ถ้า speedbrake กางอยู่จะหุบอัตโนมัติ [Z32] autopilot ตัดที่ αprot + 1° [Z26] (ฟอรัม ต่ำ) ขีดมุมเอียงลดเป็น 45° [Z1]
- โหมดนี้ latch ไว้ ออกได้เมื่อดันคันไปข้างหน้า (ขึ้นกับระยะและเวลา) [Z26] ต่ำ ค่าที่แน่นอน **ไม่พบในแหล่งสาธารณะ**
- ใน US1549 (CONF 2 คือ slat 22° flap 15° [Z5] หน้า 4, 11) การดึงคันใน 50 ft สุดท้ายถูกลดทอนในโหมด α-protection ([Z6] ข้อ 24 สูง: "sidestick inputs may be attenuated when the airplane is in the alpha-protection mode") ส่วนชื่อ "phugoid damping feedback term … active in α-protection mode" ที่ลดผลการดึงคันต่ำกว่า 100 ft มาจาก NTSB Aircraft Performance Study ที่ยกใน [Z30] (ต่ำถึงกลาง ไม่ได้ตรวจกับเอกสาร NTSB ฉบับเต็ม) α ที่แตะน้ำราว 13–14° ขณะ αmax ของน้ำหนักและ config นั้นคือ 17.5° (เหลือราว 3.5°) [Z30] (ข้อความที่ยกจากรายงาน NTSB ผ่านฟอรัม ต่ำถึงกลาง) (ผู้ตรวจแก้ 2026-11-18: [Z6] ไม่มีคำว่า phugoid damping)
- ต่ำกว่า 100 ft RA ขณะลงจอด FBW docs เขียนว่า protection เข้าที่ αmax แทน αprot [Z22] กลาง (ความหมายต้องตรวจกับ FCOM)

**Alpha floor** (สั่ง TOGA อัตโนมัติผ่าน A/THR):

- ทำงานเมื่อ α ≥ αfloor ตั้งแต่ lift-off จนถึง 100 ft RA ขณะลงจอด ไม่ทำงานเหนือ M 0.6 [Z22][Z26] หรือเมื่อคันเกิน 14° ขณะ high AoA protection หรือ pitch attitude protection ทำงาน [Z22]
- ปี 1988: "power is automatically applied if the angle of attack reaches 15°" เมื่อสูงกว่า 100 ft RA [Z8]
- ใน A320 ปี 1988 TOGA ได้ N1 83–84% ภายใน 5 s (เกณฑ์รับรอง 94% ภายใน 8 s) [Z8] เครื่องยนต์เป็นงานของหัวข้อ 6
- เงื่อนไขการรับรองของ FAA [Z9]: alpha floor ต้องไม่ทำงานโดยไม่จำเป็นที่ความเร็วและมุมเอียงที่ใช้ตามปกติ การทดสอบ Vmin ใช้อัตราลดความเร็วไม่เกิน 1 kt/s (0.514 m/s²) และในน้ำแข็งถึง 2 kt/s, ดึงคันสุดค้างอย่างน้อย 3 s และเลี้ยว 30° [Z9][Z10] ค่าเหล่านี้ใช้ตั้งกรณีทดสอบได้ (`a321neo.controls.fbw.protections.high_incidence_cert`)

**ค่า α ที่หาได้**

| เครื่อง / config | αprot | αmax | αfloor | stall warning | แหล่ง / ความเชื่อมั่น |
|---|---|---|---|---|---|
| A320-111 ปี 1988 CONF 3 | 14.5° | 17.5° | 15° | | [Z8] สูง สำหรับมาตรฐานปี 1988 |
| A320-214 US1549 CONF 2 | | 17.5° | | | [Z30] กลาง (ข้อความรายงาน NTSB ที่ยกในฟอรัม), CONF 2 จาก [Z5] หน้า 4, 11 |
| A320 FCOM ปัจจุบัน (ผ่าน FBW docs) | | | CONF 0: 9.5°, CONF 1 และ 2: 15°, CONF 3: 14°, FULL: 13° | | [Z22] กลาง |
| A320-232 D-AXLA landing config | | | | 23° ใน **normal law** (เซนเซอร์ใดหนึ่งในสาม, สูงกว่า α ของ VS1g); ใน alternate/direct ขีดถูกลดลงให้เตือนก่อน α ของ VS1g (ไม่ระบุตัวเลข) | [Z7] สูง (หน้า 30) |
| A330 | ไม่พบ | ไม่พบ | ไม่พบ | 23° ใน **normal law** [Z3] หน้า 21; ใน alternate/direct ขีดแปรตาม Mach (คงที่ต่ำกว่าราว M 0.3 แล้วลดลงถึง M 0.82, ข้อความไม่ให้ค่าเป็นองศา [Z2] หน้า 44 รูป 11) | [Z3] สูง, [Z2] สูง |
| โมเดล FBW A32NX | {6.5 (M ≤ 0.5), 4.6 (M ≥ 0.9)} CONF 0; 11.7; 11.7; 11.9; 11.0; 10.6 | {8.7, 6.4} CONF 0; 13.6; 13.6; 14.2; 13.1; 13.0 | | | [Z21] ต่ำ (ปรับให้เข้ากับ MSFS) |

ค่าใน FBW A32NX ต่ำกว่าเครื่องจริงชัดเจน (αmax FULL 13.0° เทียบ 17.5° ของ CONF 2 ใน US1549) จึงใช้เป็นข้อมูลเชิงรูปแบบเท่านั้น: αprot และ αmax ลดลงตาม Mach, มีตัวจำกัดอัตราเปลี่ยน 1°/s และหลังเข้าสู่ flight 5 s แรก αprot = αmax [Z21]

**กฎประมาณสำหรับโมเดล** (เพราะ α ของโมเดลวัดเทียบกับเส้นโค้งแรงยกของโมเดลเอง ไม่ใช่มุมของเซนเซอร์จริง):

1. จาก D-AXLA [Z7]: น้ำหนัก 53.7 t, VLS 123 kt, Vαmax 107 kt ถ้า VLS = 1.23·VS1g จะได้ VS1g = 100 kt และ CL(αmax)/CLmax = (100/107)² = 0.8734 (Vαmax = 1.070·VS1g) ถ้าใช้ VLS = 1.28·VS1g อัตราส่วนเป็น 0.8065 (Vαmax = 1.113·VS1g) เลือก 0.873 เพราะ 1.23 คือตัวคูณขั้นต่ำของ VLS ใน config ลงจอด (หัวข้อ 3 [Z37]) ความเชื่อมั่นต่ำ
2. จาก Habsheim [Z8]: αmax − αprot = 3.0° และ αfloor − αprot = 0.5° จึงตั้ง αprot = αmax − 3° และ αfloor = αmax − 2.5°
3. ผลกับโมเดล A320 ของหัวข้อ 3 (FULL, 64.5 t, SL): α(CLmax) 16.33°, αmax 12.38°, αfloor 9.88°, αprot 9.38° ความเร็วที่สอดคล้องคือ VS1g 105.1 kt, Vαmax 112.5 kt, Vαfloor 118.1 kt, Vαprot 119.3 kt และ VLS (1.23·VS1g) 129.3 kt ส่วน CONF 0: αmax 11.06°, αprot 8.06°

ค่าเหล่านี้ทำให้ Vαprot อยู่ต่ำกว่า VLS ราว 10 kt ซึ่งสอดคล้องกับลำดับบนแถบความเร็วของ PFD (VLS > Vαprot > Vαmax) แต่ตัวเลขยังเป็นค่าประมาณ **ข้อจำกัดที่ผู้ตรวจพบ (2026-11-18, `zrev_testvals.mjs`)**: ใน CONF 0 กฎเดียวกันให้ VS1g 155.9 kt, Vαmax 166.8 kt, Vαfloor 186.8 kt และ Vαprot 191.7 kt ซึ่งเท่ากับ 1.23·VS1g (191.7 kt) พอดี คือ Vαprot ชน VLS และ Vαfloor อยู่ต่ำกว่า VLS เพียง 5 kt เพราะเส้นโค้ง CL ของ clean ชันเมื่อเทียบกับช่วง α ทั้งหมด (ระยะ 3° คิดเป็น CL ราว 0.28 หรือ 21% ของ CLmax) จึงยังใช้ alpha_rule กับ CONF 0 ไม่ได้จนกว่าจะปรับระยะห่างตาม config (เช่น กำหนดเป็นอัตราส่วน CL แทนองศา)

**สมการกฎ α ในต้นแบบ** (ค่าประมาณทั้งหมด):

- เข้าโหมดเมื่อ α + 0.5·α̇ > αprot (มี lead 0.5 s เพื่อไม่ให้ทะลุ) และอยู่บนอากาศ
- αcmd = αprot + max(0, s)·(αmax − αprot)
- nzα = q̄·S·CLα/W (g ต่อ rad ของ α)
- eA = kA·nzα·(α − αcmd) + kAa·nzα·α̇ + kAd·(Vco/g)·θ̇ โดย kA = 4, kAa = 5, kAd = 0.15
- ขีด nz และ θ ยังทำงาน: eA = max(eA, e_C* ที่ขีดบน)
- ตอนเข้าโหมดปรับ integral ให้ต่อเนื่อง (bumpless): I += Kp·sch·(e − eA)
- ออกเมื่อ s < −0.5 หรือดันคันไปข้างหน้านาน ≥ 0.5 s ขณะ α < αmax
- ห้าม nose-up trim ระหว่างโหมดนี้

ผลจากต้นแบบ: บน approach FULL ลด thrust เหลือ 5% ปล่อยคัน เข้าโหมดที่ 10.0 s (124.9 kt, α 9.02°) แล้ว α ค้างที่ 9.34–9.43° และความเร็ว 118.5–121.4 kt ระหว่าง 50–70 s (α สูงสุด 9.56°) ดึงคันสุดค้างไว้ α สูงสุด 12.85° (เกิน αmax 0.47°) และอยู่ในช่วง 12.17–12.72° ระหว่าง 20–40 s ทั้งกรณี approach thrust และ idle

### 3.8.5.4 High speed protection (HSP)

| รายการ | A320 | A330 | แหล่ง |
|---|---|---|---|
| เริ่มทำงาน | VMO + 6 kt หรือ MMO + 0.01 | ที่หรือเหนือ VMO/MMO (FCTM) | [Z22] กลาง (มีที่หนึ่งเขียน +0.015), [Z13] รูป (VMO + 6 kt), [Z1] สูง ("at/or above VMO/MMO") |
| คำสั่ง nose-up อัตโนมัติ | positive load factor demand | สูงสุด 1.75 g บวกกับคำสั่งนักบิน | [Z22], [Z32] กลาง |
| อำนาจ nose-down ของคัน | ลดเป็นศูนย์ราว VMO + 16 kt / MMO + 0.04 | เหมือนกัน | [Z31] ต่ำ, [Z32] กลาง, [Z22] กลาง |
| autopilot ตัด | VMO + 15 kt / MMO + 0.04 | | [Z22] กลาง |
| aural overspeed | VMO + 4 kt / MMO + 0.006 | | [Z31] ต่ำ |
| pitch trim | ตรึง | ตรึง | [Z22][Z32] |
| มุมเอียง | 40°, ปล่อยคันกลับ 0° | 45° | [Z1] สูง, [Z32] กลาง |
| alternate law | ไม่มี HSP แต่มี high speed stability (nose-up demand เหนือ VMO/MMO ที่นักบินดันชนะได้) | | [Z1][Z23][Z31] |

**สมการ HSP ในต้นแบบ** (ค่าประมาณ ใช้ VMO 350 kt ของ A320 [Z37]):

- Vpred = V + 8 s·max(0, V̇) (ความเร็วคาดการณ์ ค่าคงที่เวลา 8 s เป็นค่าประมาณ โครงคล้าย v_dot_gain ใน [Z19])
- เข้า HSP เมื่อ Vpred > VMO + 6 kt (356 kt, 183.14 m/s) ออกเมื่อ V < VMO
- Δnz_hsp = clamp(0.075·(Vpred − VMO − 6), 0, 0.75) g (ถึง 0.75 g ที่ VMO + 16 kt หรือ 1.75 g รวม 1 g)
- อำนาจ nose-down ของคัน: Δnz ที่ติดลบคูณ clamp((VMO + 16 − Vpred)/10, 0, 1) ที่ Vpred 361 kt เหลือ 0.5 และที่ 366 kt (188.29 m/s) เหลือ 0

ผลจากต้นแบบ: ปล่อยคันพร้อมแรงขับเกิน 60 kN ความเร็วสูงสุด 356.0 kt และค้างที่ 355.9 kt ดันคันสุดตั้งแต่ VMO ด้วยแรงขับ 2 เท่า ความเร็วสูงสุด 363.2 kt (ต่ำกว่า VMO + 16 kt)

### 3.8.5.5 Protection หายไปเมื่อใด

| protection | normal | alternate (with reduced prot) | alternate (without prot) | direct | abnormal attitude |
|---|---|---|---|---|---|
| load factor | มี | มี | มี | ไม่มี | ไม่มี |
| pitch attitude | มี | ไม่มี | ไม่มี | ไม่มี | ไม่มี |
| bank angle | มี | ไม่มี | ไม่มี | ไม่มี | ไม่มี |
| high AoA | มี | แทนด้วย low speed stability (5–10 kt เหนือ stall warning) | ไม่มี | ไม่มี | ไม่มี |
| alpha floor | มี | ไม่มี | ไม่มี | ไม่มี | ไม่มี |
| high speed | มี | แทนด้วย high speed stability | ไม่มี | ไม่มี | ไม่มี |
| stall warning | ไม่จำเป็นในการบินปกติ [Z9] (A320 มีที่ 23° landing config [Z7]) | มี | มี | มี | มี |
| แหล่ง | [Z1][Z22] | [Z1][Z23][Z31] | [Z23] | [Z3][Z32] | [Z2][Z7] |

## 3.8.6 Alternate, direct, abnormal attitude และ mechanical backup

### 3.8.6.1 เงื่อนไขที่ทำให้ลดระดับ

| ผลลัพธ์ | ตัวอย่างเงื่อนไข | แหล่ง / ความเชื่อมั่น |
|---|---|---|
| alternate (A320, with reduced protection) | ADR 2 ตัวเสีย (ตรวจพบเอง), ELAC ทั้งสอง, elevator หรือ sidestick หนึ่งข้าง, IR 2 ตัว, ELAC1 + ไฮดรอลิก G หรือ Y, ELAC2 + B, spoiler ทั้งหมดหรือ SEC 3 ตัว, THS ติด, ไฮดรอลิก G + Y | [Z23] กลาง |
| alternate (A320, without protection) | ADR 3 ตัว, slat channel ของ SFCC ทั้งสอง, ไฮดรอลิก G + B | [Z23] กลาง |
| alternate (A320) | ELAC ปฏิเสธ ADR มากกว่า 1 ตัว | [Z7] สูง |
| ALT2 (A330) | ความเร็วจาก ADR สองตัวต่างกันมากเกินไป หรือ CAS ที่โหวตตกเกิน 30 kt ใน 1 s; เครื่องยนต์ดับสองเครื่อง | [Z2] สูง, [Z33] ต่ำ |
| direct | IR ทั้งสามเสีย, RA เสียเมื่อล้อลง, alternate law แล้วลดล้อลง (ไม่มี AP) | [Z23] กลาง, [Z7] สูง (ล้อลง) |
| direct (A330) | IR สามตัวหรือ primary computers เสีย | [Z33] ต่ำ |
| abnormal attitude | \|φ\| > 125°, θ > 50° หรือ < −30°, α > 30–40° หรือ < −10°, ความเร็ว < 60–90 kt (ขึ้นกับ θ) หรือ > 440 kt, M > 0.91 | [Z23] กลาง, [Z2] สูง (125°), [Z21] ต่ำ (ค่าในโมเดล α > 40°, IAS < 60 kt) |
| mechanical backup | ELAC/SEC ทั้งหมดเสีย: pitch ด้วย THS และ yaw ด้วย rudder ทางกล [Z13]; ไฟฟ้าเหลือแต่แบตเตอรี่ (emergency electrical): เฉพาะแกน yaw เปลี่ยนเป็นกลไก (reset FAC 1 เมื่อไฟกลับมาเพื่อคืน yaw alternate) [Z23] (ผู้ตรวจแก้: [Z23] ไม่ได้บอกว่าทั้งเครื่องเป็น mechanical backup) | [Z23] กลาง, [Z13] กลาง |

### 3.8.6.2 Alternate law

- pitch ยังสั่ง load factor ขีด nz เหมือน normal law ไม่มี pitch attitude protection [Z1] สูง
- low speed stability: เริ่มที่ราว 5–10 kt (2.57–5.14 m/s) เหนือความเร็ว stall warning โดยใส่สัญญาณ nose-down แบบค่อยเป็นค่อยไปที่นักบินดึงชนะได้ ("A gentle progressive nose down signal is introduced") [Z1] สูง
- stall warning ใน A330 alternate law ที่ 1.03·VS1g [Z32] กลาง (เทียบเป็น CL = 0.9426·CLmax)
- roll direct (A320 และ ALT2 ของ A330) ไม่มี bank angle protection ยอดอัตราหมุนใน direct law: clean 30°/s, slat ออก 25°/s [Z31] ต่ำ
- yaw: yaw damper อำนาจ ±5° rudder [Z1] สูง
- ขณะลดล้อลงใน alternate law pitch เปลี่ยนเป็น direct law [Z7] สูง (ผู้เขียนตีความว่าเพื่อให้ flare ด้วยความรู้สึกแบบเครื่องบินทั่วไป แหล่งไม่ได้ให้เหตุผล) ส่วน A330/340 FCTM ใน [Z32] เขียนว่า "During landing, alternate law reverts to direct law at 100 ft RA" (กลาง) คือ A330 ใช้ความสูง 100 ft RA แทนการลดล้อ
- auto-trim ยังทำงาน

### 3.8.6.3 Direct law

- คันสั่ง elevator ตรง ("a direct stick-to-elevator relationship") [Z1] สูง มุม elevator สูงสุดแปรตาม CG และ config [Z31][Z33]
- ไม่มี auto-trim PFD แสดง USE MAN PITCH TRIM สีเหลืองอำพัน นักบินหมุน trim wheel เอง [Z7] สูง, [Z3] สูง
- ไม่มี protection แต่ยังมี aural overspeed และ stall warning [Z32]
- yaw: [Z23] ว่ายังมี yaw damper แบบ alternate แต่ [Z31] ว่า yaw damping และ turn coordination หายไป (ความขัดแย้ง ดูท้ายไฟล์)

**สมการ direct law ที่เสนอ**: δe = −s·δe_up,max(cfg, CG) เมื่อ s ≥ 0 และ δe = −s·δe_dn,max เมื่อ s < 0 (เครื่องหมายของ AirfieldLab: δe บวก = ขอบท้ายลง = nose down) δa = s_roll·δa_max โดยใช้ค่าตัวคูณการลดอำนาจตาม config ที่ทำให้ได้อัตราหมุน 30°/s (clean) หรือ 25°/s (slat ออก) THS ขยับเฉพาะเมื่อผู้ใช้กดปุ่ม trim

### 3.8.6.4 Abnormal attitude law และ mechanical backup

- เป็น ALT2 ที่มีอำนาจ roll เต็มและไม่มี auto-trim [Z2] สูง; phase 1 ไม่มี auto-trim, phase 2 เมื่อเครื่องนิ่งช่วงหนึ่ง [Z7] สูง หลังกู้คืนแล้ว pitch และ yaw อยู่ใน alternate law ตลอดเที่ยวบิน [Z23] กลาง
- ใน D-AXLA "Abnormal attitude law phase 1 (without auto-trim) remained active till the end" [Z7]
- mechanical backup: pitch ด้วย THS trim wheel และ yaw ด้วย pedal (ใช้ rudder คุม lateral) [Z13] กลาง; "It is not intended that an approach and landing should be flown in this configuration" [Z32] กลาง

## 3.8.7 ความต่างของ A321 และ A330 และบทเรียนจากเหตุการณ์จริง

### 3.8.7.1 ความต่างของแต่ละแบบ

| รายการ | A320ceo / A320neo | A321ceo | A321neo | A330-300 | แหล่ง |
|---|---|---|---|---|---|
| คอมพิวเตอร์ | 2 ELAC + 3 SEC + 2 FAC | เหมือน A320 | เหมือน A320 | 3 PRIM + 2 SEC | [Z13][Z3] |
| flare mode เริ่ม | 50 ft RA | 50 ft RA | 100 ft RA (THS ตรึง, ไม่ชดเชย ground effect) | 100 ft RA | [Z8][Z25][Z29] |
| flare nose-down | −2° ใน 8 s จาก 30 ft | −2° ใน 8 s | ไม่พบรายละเอียด | มี "nose down term" แต่ไม่ระบุขนาด | [Z8][Z25][Z32] |
| HSP bank | 40° | 40° (สมมุติเหมือน A320) | 40° (สมมุติ) | 45° | [Z1][Z32] |
| HSP nose-up | ไม่พบตัวเลข | | | สูงสุด 1.75 g | [Z32] |
| ALT law | "with/without reduced protection" | | | ALT1 (roll normal) และ ALT2 (roll direct) | [Z23][Z2] |
| ความเร็วกับ AoA | | | | cruise 1° AoA ≈ 25 kt; approach 1° ≈ 5 kt; ที่ M 0.8 เหลือราว 1.5° ถึง stall warning | [Z2] สูง |
| typical AoA | | | | 1–10° | [Z3] สูง |
| rudder | กลไก + FAC | | (บางลำอาจเป็นไฟฟ้า ไม่ยืนยัน) | รุ่นหลังเป็น FBW | [Z3][Z38] |
| α protection | ดูตาราง 3.8.5.3 | ไม่พบ | ไม่พบ (FAA ออก special condition สำหรับ XLR [Z9]) | ไม่พบ | |

ความต่างที่สำคัญที่สุดสำหรับเครื่องจำลองคือความสูงที่เริ่ม flare mode และมุมเอียงของ HSP ส่วนค่า α ของ A321 และ A330 ต้องใช้กฎประมาณใน 3.8.5.3 กับเส้นโค้งแรงยกของแต่ละแบบ

### 3.8.7.2 บทเรียนจากเหตุการณ์จริง

| เหตุการณ์ | เครื่อง | สิ่งที่เกี่ยวกับกฎการบิน | ใช้ในเครื่องจำลองอย่างไร | แหล่ง |
|---|---|---|---|---|
| Habsheim 26 มิ.ย. 1988 | A320-111 | บินผ่านต่ำเข้า αprot 14.5° แล้วถึง αmax 17.5° ได้ตามออกแบบ alpha floor ไม่ทำงานเพราะต่ำกว่า 100 ft TOGA ได้ N1 83–84% ใน 5 s | กรณีทดสอบ αmax และ alpha floor ต่ำกว่า 100 ft | [Z8] |
| D-AXLA, Perpignan 27 พ.ย. 2008 | A320-232 | AoA สองตัวค้างค่าเดียวกัน ทำให้ normal law ไม่เข้า α protection ความเร็วลดจาก 123 kt ถึง 99 kt (ราว −1.1 kt/s) auto-trim ขยับ THS ถึง −11° แล้วลดล้อลงใน alternate จึงเป็น direct law | สถานการณ์ฝึก "USE MAN PITCH TRIM", ตรรกะ ALT + ล้อลง = direct | [Z7] |
| QF72, 7 ต.ค. 2008 | A330-303 | ADIRU ส่งค่า AoA กระโดด FCPC สั่ง nose-down: elevator +10.3°, nz −0.80 g, θ −8.4° แก้ด้วยการเปลี่ยนอัลกอริทึมเฉลี่ย AoA | ไม่จำเป็นต้องจำลองข้อผิดพลาด แต่ใช้ยืนยันว่ากฎ α ต้องใช้ AoA ที่กรองแล้ว | [Z3][Z4] |
| US1549, 15 ม.ค. 2009 | A320-214 | ลงน้ำใน α protection เทอม phugoid damping ลดผลการดึงคัน α ที่แตะน้ำ 13–14° เทียบ αmax 17.5° | ทดสอบว่า full aft ใกล้พื้นไม่ทำให้ α เกิน αmax | [Z5][Z6][Z30] |
| AF447, 1 มิ.ย. 2009 | A330-203 | pitot เป็นน้ำแข็ง ความเร็วไม่ถูกต้อง เข้า ALT2 ไม่มี α protection เครื่อง stall | สถานการณ์ alternate law (ระดับสูงเท่านั้น ไม่จำเป็นต่อการฝึกลงจอด) | [Z2] |
| QZ8501, 28 ธ.ค. 2014 | A320-216 | รายงานอธิบายกฎ normal, alternate และ direct ของ A320 อย่างละเอียด (§1.6.5) และเหตุการณ์เกิดใน alternate law ซึ่งไม่มี bank angle protection (ลำดับเหตุการณ์ไม่ได้ตรวจละเอียดในรอบนี้) | ยืนยันว่าใน alternate law roll เป็น direct ไม่มีการคืนมุมเอียง | [Z1] |

ทุกรายการใช้เป็นข้อเท็จจริงทางเทคนิคเท่านั้น ห้ามใส่ชื่อบุคคลหรือรายละเอียดที่ไม่เกี่ยวกับกฎการบินในหน้าเว็บ

## 3.8.8 Sidestick

| รายการ | ค่า | แหล่ง / ความเชื่อมั่น |
|---|---|---|
| ระยะคัน | ±16° pitch, ±20° roll | [Z32] กลาง (A330/340 FCTM: "±16° in pitch, ±20° in roll"); สอดคล้องกับค่าสูงสุดที่ FDR บันทึกใน [Z1] |
| แรงเริ่ม (breakout) | 1.1 lbf (4.89 N) | [Z27] ต่ำ (ข้อความในฟอรัมที่อ้างว่าคัดลอกจากเอกสาร Airbus) |
| แรงที่คันสุด pitch | 22.5 lbf (100.1 N) ที่ ±16°; ความชัน (100.1 − 4.89)/16 = 5.949 N/° | [Z27] ต่ำ |
| แรงที่คันสุด roll | outboard 5.6 lbf (24.9 N), inboard 7.8 lbf (34.7 N) ที่ 20°; ความชัน 1.001 และ 1.490 N/° | [Z27] ต่ำ |
| แรงดันผ่านล็อกขณะ AP ทำงาน | 5 daN (50 N) pitch, 3.5 daN (35 N) roll | [Z1] สูง |
| dual input | 2° จากตำแหน่งกลาง (0.125 ของระยะ pitch, 0.10 ของระยะ roll) | [Z1] สูง |
| takeover latch | กดค้าง > 40 s | [Z1] สูง |
| แรงสปริง | ไม่ขึ้นกับ q̄ (passive spring) | [Z36] (รอบที่ 1 หัวข้อ 6), [Z38] |

หัวข้อ 7 [Z38] ใช้ 5 daN และ 3.5 daN เป็นแรง breakout ทั่วไปของ sidestick (`controls.inceptors.sidestick.breakout_N`) แต่ KNKT [Z1] อธิบายค่านี้ในบริบทของคันที่ถูก solenoid ล็อกขณะ autopilot ทำงาน ผู้เขียนจึงเก็บสองค่าแยกกันใน `controls.fbw.sidestick` (ap_override_N และ breakout_N) และแจ้งไว้ในส่วนความขัดแย้ง

**การแปลง input ของ AirfieldLab เป็นตำแหน่งคัน**: ใช้ค่าไร้มิติ s ∈ [−1, 1] หลังผ่าน dead zone และ expo ของรอบที่ 1 หัวข้อ 11 [Z36] (gamepad expo 0.5, flight stick 0.3) ตัวอย่าง: gamepad โยกครึ่งทาง (x = 0.5) ผ่าน expo 0.5 (ไม่มี dead zone) ได้ s = 0.5·0.5 + 0.5·0.125 = 0.3125 จึงได้ Δnz = 0.469 g (clean); ถ้าผ่าน dead zone 0.04 แบบ scaled ก่อน จะได้ s = 0.2946 และ Δnz = 0.442 g (ผู้ตรวจคำนวณ `zrev_testvals.mjs`) สำหรับแป้นพิมพ์ ramp ของรอบที่ 1 (ขึ้น 0.5/s, คืนกลาง 2.5/s) ทำให้ถึงคันสุดใน 2.0 s และคืนกลางใน 0.40 s ซึ่งเหมาะกับกฎ nz เพราะปล่อยแป้นแล้วเครื่องถือเส้นทางเอง แถบแรงบน HUD (หัวข้อ 7) ให้คำนวณจาก F = Fbo·sign(s) + k·s·travel โดยใช้ค่าในตารางนี้

## 3.8.9 แบบจำลองสำหรับ AirfieldLab

### 3.8.9.1 โครงสร้าง

เพิ่มคลาส pure ใน `src/20-flight.js` (ห้ามใช้ DOM เพราะ `test/harness.mjs` ประเมินไฟล์นี้ด้วย `new Function`) ชื่อ `FbwLaw` ที่ `PilotLaws` เรียกเมื่อ `controls.architecture.pitch === 'fbw'` (หัวข้อ 7) ส่วนเครื่องฝึกใบพัดเดิมยังใช้ ASSIST/DIRECT ตามเดิม

```js
// สัญญา (ตัวอย่าง ไม่ใช่ข้อมูล): เรียกครั้งเดียวต่อขั้น 240 Hz ก่อน RK4 แล้วถือค่าคำสั่งไว้ตลอดสี่ stage
class FbwLaw {
  constructor(spec /* = AC.controls.fbw */, cfgState) {}
  // s: {t, V, rho, alpha, alphaDot, theta, thetaDot, gamma, phi, p, beta, nz, ra, mach, ias, onGround, gearDown, cfg}
  // stick: {pitch, roll} ใน [-1, 1] หลัง dead zone + expo; failures: {adr, ir, elac, hyd, ...}
  update(dt, s, stick, failures) {
    // คืน {de, ihRate, rollCmd, mode, law, flags:{protAoA, hsp, flare, useManTrim, alphaFloor, bankLim}}
  }
}
```

ลำดับงานในแต่ละขั้น:

1. **เลือกกฎ** (`law`): normal, alt (ธง rollDirect, protAoA, speedStab), direct, abnormal ตามตาราง 3.8.6.1 โดยตรวจ abnormal attitude ก่อน และใช้ ALT + gearDown = direct สำหรับ pitch
2. **เลือกโหมดแกน pitch**: ground, flight (ผสม 5 s หลัง lift-off), flare (≤ 50 ft RA สำหรับ A320 และ A321ceo, ≤ 100 ft สำหรับ A321neo และ A330 จาก `flare_mode.engage_RA`) หมายเหตุผู้ตรวจ: [Z32] บรรยาย flare ของ A330 เป็น "full authority direct law with no auto-trim" บวกเทอม nose-down ไม่ใช่กฎถือ θ แบบ A320 ดังนั้นสำหรับ A330 ให้ใช้ `flare_mode.law_type` (คันสั่ง elevator ตรงบวก bias nose-down) แทนสมการ θref ของ 3.8.3.3 ซึ่งยังเป็นค่าประมาณของ A320
3. **คำนวณ Δnz_cmd** จากคัน แล้วบวก path hold (เมื่อคันกลางและ |φ| ≤ 33°), บวก HSP, ตัดด้วยขีด θ และขีด nz
4. **ค่าผิดพลาด C\***: e = (nz − nz_ref − Δnz) + (Vco/g)·(θ̇ − g·Δnz/V) โดยเทอมหลังคืออัตราเปลี่ยนท่าทางที่สอดคล้องกับ Δnz ที่สั่ง ทำให้ค่าคงตัวไม่มีความผิดพลาดค้าง
5. **โหมด AoA** (ถ้าเข้า): แทน e ด้วย eA ตาม 3.8.5.3
6. **flare**: ผสม e กับ eθ ตาม w
7. **elevator**: I += Ki·sch·e·dt, δe = clamp(I + Kp·sch·e, −δe_up, δe_dn) โดย sch = clamp(q̄0/q̄, 0.3, 4) และ q̄0 = 8000 Pa (ค่าประมาณ ที่ 133.5 kt SL q̄ ≈ 2.9 kPa จึงได้ sch ≈ 2.8)
8. **auto-trim**: ถ้าอนุญาต ihRate = clamp(Kt·δe, ±rate_max) แล้ว I −= Δih/τe (τe = CLδe/CLih ของหัวข้อ 3 [Z37] = 0.52) เพื่อให้ผลรวมของ elevator และ THS ไม่กระโดด
9. **roll**: p_cmd, φref และ u ตาม 3.8.4.1 ใน roll direct ให้ u = s_roll·k_direct

### 3.8.9.2 ค่าที่ต้องวัดจากสถานะของ `Aircraft`

| ปริมาณ | วิธีหาใน AirfieldLab | หมายเหตุ |
|---|---|---|
| nz | แรงจำเพาะแกน z ของ body: nz = −(F_z,aero + F_z,thrust + F_z,gear)/(m·g) | ใช้แรงจาก RK4 stage แรก ไม่ต้องหาอนุพันธ์ |
| θ̇ | จาก Euler kinematics: θ̇ = q·cosφ − r·sinφ | ไม่ใช่ q ตรง ๆ เมื่อเอียง |
| α̇ | ผลต่างอันดับหนึ่งกรองด้วย low-pass τ 0.05 s (ค่าประมาณ) | [Z19] ใช้ lag filter 0.05 s กับ θ |
| V̇ | ผลต่างของ TAS กรองด้วย τ 0.5 s | ใช้กับ Vpred ของ HSP |
| RA | ความสูงล้อเหนือพื้น `a.hWheel` ที่มีอยู่แล้ว | |
| cfg | ตำแหน่ง slat/flap จริงหลัง transition ของหัวข้อ 3/7 | ขีด nz ใช้ "slat หรือ flap ออก" |

### 3.8.9.3 ค่าแนะนำ (ทั้งหมดเป็นค่าประมาณ ทดสอบด้วยต้นแบบแล้ว)

| พารามิเตอร์ | ค่า | หน่วย | เหตุผล |
|---|---|---|---|
| Vco | 121.9 | m/s | 400 ft/s ตาม [Z17] |
| Kp, Ki | 0.06, 0.20 | rad/g, rad/(g·s) ที่ q̄0 | t90 ของ nz ราว 1.07 s ที่ 330 kt, overshoot 0.04 g |
| q̄0, ขอบ sch | 8000, [0.3, 4] | Pa, - | ทำให้ gain ต่อ q̄ ใกล้คงที่ทั้งช่วง 120–350 kt |
| Kγ, Kγi, ขอบ | 1.0, 0.2, ±0.3 | 1/s, 1/s², g | Kγ = 2.0 ทำให้ γ แกว่ง ±0.2° (ทดลองแล้ว) |
| Kθ | 0.5 | 1/s | θ สูงสุด 30.12° ที่ขีด 30° |
| lead α, kA, kAa, kAd | 0.5, 4, 5, 0.15 | s, - | α สูงสุด 12.85° ที่ αmax 12.38° (overshoot 0.47°) |
| Kt | 0.5 | 1/s | THS ไล่ elevator ใน 2–5 s; อัตราสูงสุดจากหัวข้อ 7 |
| τ HSP pred | 8 | s | Vmax 356.0 kt เมื่อปล่อยคัน |
| ωn, ζ roll | 2.0, 0.8 | rad/s, - | p สูงสุด 16.47°/s ที่เป้า 15°/s |
| anti-windup φref | ±1 | ° | ±3° ทำให้ p ถึง 18.96°/s |
| actuator elevator (ในต้นแบบ) | τ 0.06 s, 40°/s | | ค่าจริงเป็นของหัวข้อ 7 |

### 3.8.9.4 แบบจำลองที่ใช้ทดสอบ (ไม่ใช่ 6-DOF)

ต้นแบบใช้ point-mass บวกการหมุนรอบแกน pitch ในแกนเส้นทาง x = [V, γ, α, q, h] และให้ φ เป็น input:

- V̇ = (T·cosα − D)/m − g·sinγ
- γ̇ = ((L + T·sinα)·cosφ − m·g·cosγ)/(m·V)
- α̇ = q − (L + T·sinα)/(m·V) + g·cosγ·cosφ/V
- q̇ = M/Iyy, ḣ = V·sinγ, θ = γ + α·cosφ

ค่าอากาศพลศาสตร์ทั้งหมดมาจากหัวข้อ 3 [Z37] (m 64,500 kg, S 122.6 m², c 4.1935 m, Iyy 4.946×10⁶ kg m², CLα 5.302, Cmα −1.38, Cmq −34.59, Cmδe −1.948, CLmax CONF 0 1.31, FULL 2.88) แกน roll ใช้ 1-DOF ṗ = Lp·p + Lu·u แบบนี้พอสำหรับตรวจตรรกะและเลือก gain เบื้องต้น เมื่อนำไปใช้ใน `Aircraft` 6-DOF จริงต้องรันกรณีทดสอบชุดเดิมซ้ำ (งาน P1 ข้อ 3)

### 3.8.9.5 ส่วนแสดงผลและการฝึก

- FMA/HUD แสดงชื่อกฎ (NORMAL, ALTN, DIRECT) และข้อความ USE MAN PITCH TRIM สีเหลืองอำพันใน direct law ตาม [Z7] ข้อความอธิบายเป็นภาษาไทยตามกฎของเจ้าของโครงการ เช่น "กฎ direct: ต้อง trim เอง"
- แถบความเร็ว: VLS, Vαprot (แถบเหลืองดำ) และ Vαmax (แถบแดง) คำนวณจาก αprot, αmax ของโมเดลและน้ำหนักจริง (ป้ายกำกับว่า "ค่าประมาณ")
- เครื่องหมายขีดมุมเอียงที่ ±67° และขีด pitch ที่ +30° และ −15° บน HUD (รูปสัญลักษณ์บน PFD จริงไม่ได้ตรวจในรอบนี้)
- สถานการณ์ฝึกที่แนะนำ: (1) ลดความเร็วจนเข้า α protection บน approach (2) flare ด้วยกฎ A320 ที่ต้องดึงคันเอง (3) alternate law แล้วลดล้อลงเป็น direct law พร้อม trim เอง

## ค่าพารามิเตอร์ (JSON)

บล็อกด้านล่างสร้างและตรวจด้วย `scripts/z_json.mjs` (เดิม 6 บล็อก 108 leaf; หลังผู้ตรวจย้าย `common_airliner.fbw` และเพิ่ม `a330_300…flare_mode.law_type` เหลือ 5 บล็อก 111 leaf ตรวจซ้ำด้วย `zrev_json.mjs`: ทุกบล็อก `JSON.parse` ผ่าน มีคีย์บนสุดคีย์เดียว และทุก path อยู่ใต้ `controls.fbw`) ข้อตกลง:

- หัวข้อนี้เขียนเฉพาะ `controls.fbw` ของแบบ Airbus (ผู้ตรวจย้าย `common_airliner.fbw` เดิมเข้ามาไว้ใต้ `controls.fbw` เพราะ schema-ext ข้อ 4 ให้หัวข้อ 8 เป็นเจ้าของเฉพาะ path นี้) ไม่เขียน `_inherits` เพราะเป็นของบัตรรายแบบในหัวข้อ 3 (ลำดับสืบค่าที่หัวข้อ 3 กำหนด: a320neo จาก a320ceo, a321neo จาก a320neo, a321ceo จาก a321neo) จึงใส่เฉพาะค่าที่ต่าง เช่น a321ceo ต้องเขียน flare 50 ft ทับค่า 100 ft ที่สืบมาจาก a321neo
- มุมใช้หน่วย deg ตามที่ระบุใน `u` (schema รอบที่ 3 ข้อ 3 อนุญาต) ความเร็วเป็น m/s และค่า kt หรือ ft อยู่ใน `note`
- `src` "Z39" คือสคริปต์ต้นแบบของหัวข้อนี้ (ค่าประมาณที่เลือกเองและตรวจด้วยการจำลอง)

<!-- a320ceo: 68 leaf -->
```json
{
 "a320ceo": {
  "controls": {
   "fbw": {
    "computers": {"v":{"pitch_roll":"2 ELAC + 3 SEC","yaw":"2 FAC (rudder ต่อ pedal ทางกล)","air_data":"3 ADIRU; ELAC ใช้ AoA เฉลี่ยของ ADR1/ADR2"},"u":"-","scope":"aircraft","src":["Z13","Z1","Z7"],"conf":"สูง","est":false,"note":"คอมพิวเตอร์ทั้งหมดทำงานพร้อมกัน"},
    "update_rate_hz": {"v":240,"u":"Hz","scope":"sim","src":["Z14","Z39"],"conf":"ต่ำ","est":true,"note":"คาบจริงของ ELAC ไม่พบในแหล่งสาธารณะ; ใช้ขั้นฟิสิกส์ 240 Hz ของ AirfieldLab"},
    "normal_law": {
     "pitch": {
      "command": {"v":"C_star_nz_integral","u":"-","scope":"aircraft","src":["Z1","Z2","Z12","Z8"],"conf":"สูง","est":false,"note":"คันสั่ง load factor (สูง); รูป C* = dnz + (Vco/g)q และ integral เป็นค่าประมาณตาม Z12"},
      "stick_to_dnz": {"v":{"clean":{"pull_full":1.5,"push_full":-2},"slats_flaps":{"pull_full":1,"push_full":-1}},"u":"g (เทียบ 1 g)","scope":"aircraft","src":["Z1","Z11","Z22","Z19"],"conf":"กลาง","est":true,"note":"ปลายช่วงจากขีด nz (สูง); ระหว่างกลางเชิงเส้นตามคัน (ค่าประมาณ) จึงให้ conf รวมเป็นกลาง (ผู้ตรวจแก้: est true กับ conf สูงขัดกัน)"},
      "Vco": {"v":121.9,"u":"m/s","scope":"aircraft","src":["Z17","Z12"],"conf":"กลาง","est":true,"note":"400 ft/s = 237 kt (ค่าตำรา ยืนยันจากแหล่งที่เข้าถึงได้ไม่ได้); Z12 หน้า 3 ให้ ~240 kt = 123.5 m/s; FBW A32NX ใช้ 100 m/s (Z19); ค่าจริงของ Airbus ไม่เปิดเผย"},
      "gains": {"v":{"Kp":0.06,"Ki":0.2,"qbar0":8000,"sched_min":0.3,"sched_max":4},"u":"rad/g, rad/(g s), Pa, -, -","scope":"aircraft","src":["Z39"],"conf":"ต่ำ","est":true,"note":"เลือกด้วยต้นแบบ z_fbw_proto.mjs; gain คูณ clamp(qbar0/qbar, 0.3, 4)"},
      "path_hold": {"v":{"Kg":1,"Kgi":0.2,"dnz_max":0.3},"u":"1/s, 1/s2, g","scope":"aircraft","src":["Z1","Z39"],"conf":"ต่ำ","est":true,"note":"ถือ gamma เมื่อคันกลางและ |phi| <= 33 deg (Z1: maintains the flight path); Kg 2.0 แกว่ง"},
      "bank_compensation_max": {"v":33,"u":"deg","scope":"aircraft","src":["Z32","Z33","Z19"],"conf":"กลาง","est":false,"note":"nz_ref = cos(theta)/cos(min(|phi|, 33 deg))"},
      "autotrim_nz_window": {"v":[0.5,1.3],"u":"g","scope":"aircraft","src":["Z33","Z19"],"conf":"ต่ำ","est":false,"note":"1.3 g จาก Z33 (ห้าม trim up เมื่อเกิน); ขอบล่าง 0.5 g มาจากโมเดล Z19 เท่านั้น (Z19 ใช้ 0.5-1.25 g ตรึงทั้งสองทิศ); conf ลดเป็นต่ำโดยผู้ตรวจ"},
      "autotrim_bank_max": {"v":33,"u":"deg","scope":"aircraft","src":["Z33"],"conf":"กลาง","est":false,"note":"Z33: เกิน 33 deg ห้าม trim up (prevents further trim up); FBW A32NX ใช้ 30 deg ตรึงทั้งสองทิศ (Z19)"},
      "autotrim_freeze_RA": {"v":15.24,"u":"m","scope":"aircraft","src":["Z25","Z26"],"conf":"ต่ำ","est":false,"note":"50 ft RA: THS ตรึงเมื่อเข้า flare"},
      "autotrim_gain_Kt": {"v":0.5,"u":"1/s","scope":"aircraft","src":["Z39"],"conf":"ต่ำ","est":true,"note":"อัตรา THS = clamp(Kt*de, rate max ของ controls.trim หัวข้อ 7)"},
      "autotrim_inhibit": {"v":{"alpha_prot":"no_nose_up","hsp":"frozen","direct_law":"off","abnormal_phase1":"off"},"u":"-","scope":"aircraft","src":["Z7","Z22","Z32","Z3"],"conf":"สูง","est":false,"note":"D-AXLA: ถึง alpha prot หยุด nose-up trim"},
      "ths_autotrim_nose_up_limit": {"v":-11,"u":"deg","scope":"aircraft","src":["Z7","Z19"],"conf":"กลาง","est":false,"note":"BEA D-AXLA: THS ถึง nose-up stop -11 deg; ตรวจเครื่องหมายกับ controls.trim (หัวข้อ 7)"}
     },
     "flare_mode": {
      "engage_RA": {"v":15.24,"u":"m","scope":"aircraft","src":["Z8","Z19","Z25"],"conf":"สูง","est":false,"note":"50 ft RA: จำค่า theta"},
      "blend_RA": {"v":[15.24,9.144],"u":"m","scope":"aircraft","src":["Z8"],"conf":"สูง","est":false,"note":"50 ถึง 30 ft: เทอม nz ถูกแทนด้วยเทอม theta (Habsheim 1988)"},
      "nose_down_target": {"v":-2,"u":"deg","scope":"aircraft","src":["Z8","Z19","Z25"],"conf":"กลาง","est":false,"note":"จาก 30 ft ลด theta อ้างอิงไป -2 deg; FCOM ceo บางฉบับไม่เขียนแล้ว (Z25)"},
      "nose_down_time": {"v":8,"u":"s","scope":"aircraft","src":["Z8","Z19"],"conf":"กลาง","est":false,"note":"rate = (max(-2, theta_memo) + 2)/8 deg/s"},
      "gains": {"v":{"K_theta":0.8,"K_q":1,"stick_theta_deg":10},"u":"1/s, -, deg","scope":"aircraft","src":["Z39"],"conf":"ต่ำ","est":true,"note":"e = (V/g)(K_theta (theta - theta_cmd) + K_q theta_dot); w = clamp((50 - RA_ft)/20, 0, 1)"}
     },
     "ground_mode": {
      "stick_to_elevator": {"v":"direct","u":"-","scope":"aircraft","src":["Z28","Z33"],"conf":"ต่ำ","est":false,"note":"ไม่มี auto-trim บนพื้น"},
      "blend_after_liftoff": {"v":5,"u":"s","scope":"aircraft","src":["Z28","Z33"],"conf":"ต่ำ","est":false,"note":"ผสมกฎ ground กับกฎ nz 5 s หลังล้อพ้นพื้น"},
      "transition_logic_model": {"v":{"to_flight":"airborne && (theta > 8 deg || RA > 121.9 m)","to_ground":"onGround && theta < 2.5 deg for 5 s"},"u":"-","scope":"aircraft","src":["Z21"],"conf":"ต่ำ","est":false,"note":"ตรรกะในโมเดล FBW A32NX (RA 400 ft)"}
     },
     "roll": {
      "p_cmd_max": {"v":15,"u":"deg/s","scope":"aircraft","src":["Z1","Z20"],"conf":"สูง","est":false,"note":"0.2618 rad/s ที่คันสุด แปรตามคันเชิงเส้น"},
      "bank_limits": {"v":{"neutral_spiral":33,"full_stick":67,"aoa_prot":45,"hsp":40},"u":"deg","scope":"aircraft","src":["Z1"],"conf":"สูง","est":false,"note":"ปล่อยคันเกิน 33 deg กลับมา 33 deg; HSP ปล่อยคันกลับ 0 deg"},
      "bank_return_rate": {"v":{"at_33":0,"at_limit":15,"limit_plus_5":20},"u":"deg/s","scope":"aircraft","src":["Z20","Z39"],"conf":"ต่ำ","est":true,"note":"เชิงเส้นระหว่างจุด; HSP: 0 ที่ 0 deg ถึง 15 ที่ 40 deg (Z20)"},
      "gains": {"v":{"wn":2,"zeta":0.8,"Ki_over_Kphi":0.5,"ref_window_deg":1},"u":"rad/s, -, -, deg","scope":"aircraft","src":["Z39"],"conf":"ต่ำ","est":true,"note":"pole placement กับ Lp, Lu ที่คำนวณใหม่ทุกขั้น"},
      "turn_coordination": {"v":"r_cmd = g tan(phi)/V; beta -> 0","u":"-","scope":"aircraft","src":["Z13","Z28"],"conf":"กลาง","est":true,"note":"กฎจริงมีเป้า roll rate, sideslip, bank (Z13); สมการเป็นค่าประมาณ"},
      "ap_disconnect_bank": {"v":45,"u":"deg","scope":"aircraft","src":["Z1"],"conf":"สูง","est":false,"note":"autopilot ตัดเมื่อเอียงเกิน 45 deg"}
     }
    },
    "protections": {
     "nz_limits": {"v":{"clean":[-1,2.5],"slats_flaps":[0,2]},"u":"g","scope":"aircraft","src":["Z1","Z11","Z22"],"conf":"สูง","est":false,"note":"คงอยู่ใน alternate law"},
     "cert_nz_limits": {"v":{"clean":[-1,2.5],"high_lift":[0,2]},"u":"g","scope":"aircraft","src":["Z11"],"conf":"สูง","est":false,"note":"FAA special condition ของ FBW g-limiting (EMB-550, 79 FR 20769) ใช้เป็นเกณฑ์ทั่วไป; ย้ายจาก common_airliner.fbw"},
     "g_load_ecam": {"v":[0.7,1.4],"u":"g","scope":"aircraft","src":["Z22"],"conf":"กลาง","est":false,"note":"ECAM G LOAD เมื่ออยู่นอกช่วงนาน > 2 s"},
     "pitch_limits": {"v":{"nose_up_conf0_3":30,"nose_up_conf0_3_low_speed":25,"nose_up_full":25,"nose_up_full_low_speed":20,"nose_down":-15},"u":"deg","scope":"aircraft","src":["Z1","Z22","Z31","Z32"],"conf":"สูง","est":false,"note":"ทุกค่าอยู่ใน Z1 หน้า 31-32 (progressively reduced at low speed); นิยามความเร็วต่ำไม่พบ"},
     "pitch_limit_gain": {"v":0.5,"u":"1/s","scope":"aircraft","src":["Z39"],"conf":"ต่ำ","est":true,"note":"dnz <= (V/g) K (theta_max - theta)"},
     "fd_removal": {"v":{"up":25,"down":-13,"restore_up":22,"restore_down":-10},"u":"deg","scope":"aircraft","src":["Z1","Z22"],"conf":"กลาง","est":false,"note":"25/13 จาก Z1; ค่าคืน 22/10 จาก Z22"},
     "alpha_rule": {"v":{"CL_amax_over_CLmax":0.873,"aprot_below_amax":3,"afloor_below_amax":2.5},"u":"-, deg, deg","scope":"aircraft","src":["Z7","Z8","Z39"],"conf":"ต่ำ","est":true,"note":"ผูกกับเส้นโค้งแรงยกของโมเดล: Vamax/VS1g 1.07 (D-AXLA) และระยะห่างจาก Habsheim"},
     "alpha_anchor_1988_conf3": {"v":{"aprot":14.5,"amax":17.5,"afloor":15},"u":"deg","scope":"aircraft","src":["Z8"],"conf":"สูง","est":false,"note":"A320-111 มาตรฐานปี 1988; afloor ทำงานเมื่อ RA > 100 ft"},
     "alpha_anchor_us1549_conf2": {"v":{"amax":17.5,"alpha_touchdown":[13,14]},"u":"deg","scope":"aircraft","src":["Z30","Z6"],"conf":"กลาง","est":false,"note":"A320-214 ปี 2009 อ้างผ่านฟอรัม"},
     "alpha_floor_fcom": {"v":{"CONF0":9.5,"CONF1":15,"CONF2":15,"CONF3":14,"FULL":13},"u":"deg","scope":"aircraft","src":["Z22"],"conf":"กลาง","est":false,"note":"ค่า FCOM ผ่าน FBW docs; ไม่ตรงกับ alpha ของโมเดล ใช้ alpha_rule แทนในการจำลอง"},
     "alpha_floor_logic": {"v":{"active":"lift-off ถึง RA 30.48 m ขาลง","mach_max":0.6,"stick_deg_with_prot":14},"u":"-, Mach, deg","scope":"aircraft","src":["Z22","Z26","Z8"],"conf":"กลาง","est":false,"note":"สั่ง TOGA ผ่าน A/THR (หัวข้อ 9)"},
     "alpha_mode_logic": {"v":{"entry_lead_s":0.5,"exit_stick":-0.5,"exit_fwd_time_s":0.5,"threshold_rate_limit_degps":1,"takeoff_aprot_eq_amax_s":5},"u":"s, -, s, deg/s, s","scope":"aircraft","src":["Z21","Z26","Z39"],"conf":"ต่ำ","est":true,"note":"latch ตาม Z26; ค่าออกจากโหมดไม่พบในแหล่งสาธารณะ; rate 1 deg/s และ 5 s จากโมเดล Z21"},
     "alpha_mode_gains": {"v":{"kA":4,"kAa":5,"kAd":0.15},"u":"-, s, -","scope":"aircraft","src":["Z39"],"conf":"ต่ำ","est":true,"note":"eA = kA nzA (a - acmd) + kAa nzA a_dot + kAd (Vco/g) theta_dot"},
     "ap_disconnect_alpha_margin": {"v":1,"u":"deg","scope":"aircraft","src":["Z26"],"conf":"ต่ำ","est":false,"note":"AP ตัดที่ alpha prot + 1 deg"},
     "hsp": {"v":{"dV_on":3.087,"dM_on":0.01,"dV_nd_zero":8.231,"dM_nd_zero":0.04,"dV_ap_off":7.717,"dM_ap_off":0.04},"u":"m/s, Mach","scope":"aircraft","src":["Z22","Z13","Z31","Z32"],"conf":"กลาง","est":false,"note":"VMO+6 kt/MMO+0.01 เริ่ม; อำนาจ ND เป็นศูนย์ราว VMO+16 kt/MMO+0.04; AP ตัด VMO+15 kt; Z22 มีที่เขียน +0.015"},
     "hsp_model": {"v":{"tau_pred_s":8,"dnz_slope_g_per_mps":0.1458,"dnz_max":0.75},"u":"s, g/(m/s), g","scope":"aircraft","src":["Z39","Z32"],"conf":"ต่ำ","est":true,"note":"dnz_max 0.75 g = 1.75 g รวม (A330 FCTM ผ่าน Z32); slope 0.075 g/kt"},
     "stall_warning_alpha_landing": {"v":23,"u":"deg","scope":"aircraft","src":["Z7"],"conf":"สูง","est":false,"note":"normal law, landing config, เซนเซอร์ใดหนึ่งในสาม (Z7 หน้า 30); alternate/direct ใช้ขีดที่ต่ำกว่า (ไม่ระบุตัวเลข) - ผู้ตรวจแก้ 2026-11-18"}
    },
    "alternate_law": {
     "pitch": {"v":"nz_demand; nz limits kept; no pitch attitude protection","u":"-","scope":"aircraft","src":["Z1"],"conf":"สูง","est":false,"note":"ALT ของ A320"},
     "low_speed_stability_onset": {"v":[2.572,5.144],"u":"m/s","scope":"aircraft","src":["Z1","Z31"],"conf":"สูง","est":false,"note":"5-10 kt เหนือ stall warning: nose-down ค่อยเป็นค่อยไป ดึงชนะได้"},
     "high_speed_stability": {"v":"nose_up_demand_above_VMO_MMO_overridable","u":"-","scope":"aircraft","src":["Z1","Z23","Z31"],"conf":"กลาง","est":false,"note":"แทน HSP"},
     "roll": {"v":"direct","u":"-","scope":"aircraft","src":["Z1","Z23"],"conf":"สูง","est":false,"note":"ไม่มี bank angle protection และ turn coordination"},
     "yaw_damper_authority": {"v":5,"u":"deg","scope":"aircraft","src":["Z1"],"conf":"สูง","est":false,"note":"+-5 deg rudder"},
     "gear_down_to_direct": {"v":true,"u":"-","scope":"aircraft","src":["Z7","Z23"],"conf":"สูง","est":false,"note":"ALT law + ล้อลง (AP off) = pitch direct"},
     "triggers": {"v":{"reduced_prot":["2 ADR","both ELAC","1 elevator","1 sidestick","2 IR","ELAC1+G or Y hyd","ELAC2+B hyd","all spoilers or 3 SEC","THS jam","G+Y hyd"],"no_prot":["3 ADR","both SFCC slat channels","G+B hyd"]},"u":"-","scope":"aircraft","src":["Z23","Z7"],"conf":"กลาง","est":false,"note":"รายการจาก FBW docs; ELAC ปฏิเสธ ADR > 1 ตัว (Z7 สูง)"}
    },
    "direct_law": {
     "pitch": {"v":"stick_to_elevator; max deflection f(CG, config)","u":"-","scope":"aircraft","src":["Z1","Z31","Z33"],"conf":"สูง","est":false,"note":""},
     "autotrim": {"v":false,"u":"-","scope":"aircraft","src":["Z7","Z3"],"conf":"สูง","est":false,"note":"PFD: USE MAN PITCH TRIM"},
     "roll_rate_max": {"v":{"clean":30,"slats":25},"u":"deg/s","scope":"aircraft","src":["Z31"],"conf":"ต่ำ","est":false,"note":"ใช้ตั้งตัวคูณอำนาจ roll ใน direct law"},
     "triggers": {"v":["3 IR","RA fail with gear down","ALT law + gear down"],"u":"-","scope":"aircraft","src":["Z23","Z7"],"conf":"กลาง","est":false,"note":""}
    },
    "abnormal_attitude": {
     "triggers": {"v":{"bank_deg":125,"pitch_up_deg":50,"pitch_down_deg":-30,"alpha_max_deg":40,"alpha_min_deg":-10,"ias_min":30.867,"ias_max":226.355,"mach_max":0.91},"u":"deg, m/s, Mach","scope":"aircraft","src":["Z23","Z2","Z21"],"conf":"กลาง","est":false,"note":"alpha 30-40 deg และ ias ต่ำ 60-90 kt ตาม theta (Z23); ใช้ค่าในโมเดล Z21"},
     "effect": {"v":"ALT2 with max roll authority; no autotrim in phase 1","u":"-","scope":"aircraft","src":["Z2","Z7","Z23"],"conf":"สูง","est":false,"note":"หลังกู้คืน pitch/yaw อยู่ใน alternate law"}
    },
    "mechanical_backup": {"v":{"pitch":"THS trim wheel","yaw":"rudder pedals"},"u":"-","scope":"aircraft","src":["Z13","Z23","Z32"],"conf":"กลาง","est":false,"note":"ไม่ได้ออกแบบให้ลงจอดในสภาพนี้"},
    "sidestick": {
     "travel": {"v":{"pitch":16,"roll":20},"u":"deg","scope":"aircraft","src":["Z32","Z1"],"conf":"กลาง","est":false,"note":"ตรงกับ controls.inceptors.sidestick ของหัวข้อ 7"},
     "breakout": {"v":4.89,"u":"N","scope":"aircraft","src":["Z27"],"conf":"ต่ำ","est":false,"note":"1.1 lbf"},
     "force_at_stop": {"v":{"pitch":100.1,"roll_out":24.9,"roll_in":34.7},"u":"N","scope":"aircraft","src":["Z27"],"conf":"ต่ำ","est":false,"note":"22.5 / 5.6 / 7.8 lbf"},
     "gradient": {"v":{"pitch":5.949,"roll_out":1.001,"roll_in":1.49},"u":"N/deg","scope":"aircraft","src":["Z27","Z39"],"conf":"ต่ำ","est":true,"note":"(F_stop - breakout)/travel"},
     "ap_override": {"v":{"pitch":50,"roll":35},"u":"N","scope":"aircraft","src":["Z1"],"conf":"สูง","est":false,"note":"แรงดันผ่าน solenoid detent ขณะ AP ทำงาน (5/3.5 daN)"},
     "dual_input_threshold": {"v":2,"u":"deg","scope":"aircraft","src":["Z1"],"conf":"สูง","est":false,"note":""},
     "takeover_latch": {"v":40,"u":"s","scope":"aircraft","src":["Z1"],"conf":"สูง","est":false,"note":""}
    },
    "sim": {
     "time_delay_budget": {"v":0.1,"u":"s","scope":"sim","src":["Z36"],"conf":"กลาง","est":false,"note":"ย้ายจาก common_airliner.fbw; งบหน่วงเวลา Level 1 จากรอบที่ 1 หัวข้อ 6; ขั้น 240 Hz = 4.167 ms"},
     "input_mapping": {"v":{"stick_units":"[-1, 1] หลัง deadzone + expo","expo_gamepad":0.5,"keyboard_ramp_up_per_s":0.5,"keyboard_centre_per_s":2.5},"u":"-","scope":"sim","src":["Z36"],"conf":"กลาง","est":false,"note":"ย้ายจาก common_airliner.fbw; ค่าจาก input ของรอบที่ 1 หัวข้อ 11"}
    }
   }
  }
 }
}
```

<!-- a320neo: 1 leaf -->
```json
{
 "a320neo": {
  "controls": {
   "fbw": {
    "normal_law": {
     "flare_mode": {
      "engage_RA": {"v":15.24,"u":"m","scope":"aircraft","src":["Z25"],"conf":"ต่ำ","est":false,"note":"A320neo ใช้ flare mode เหมือน ceo (ฟอรัม); ค่าอื่นสืบจาก a320ceo"}
     }
    }
   }
  }
 }
}
```

<!-- a321ceo: 2 leaf -->
```json
{
 "a321ceo": {
  "controls": {
   "fbw": {
    "normal_law": {
     "flare_mode": {
      "engage_RA": {"v":15.24,"u":"m","scope":"aircraft","src":["Z25"],"conf":"ต่ำ","est":false,"note":"FCOM A321ceo ตามที่ยกในฟอรัม: THS ตรึงที่ 50 ft; เขียนทับค่าจาก a321neo"}
     },
     "pitch": {
      "autotrim_freeze_RA": {"v":15.24,"u":"m","scope":"aircraft","src":["Z25"],"conf":"ต่ำ","est":false,"note":"50 ft RA"}
     }
    }
   }
  }
 }
}
```

<!-- a321neo: 4 leaf -->
```json
{
 "a321neo": {
  "controls": {
   "fbw": {
    "normal_law": {
     "flare_mode": {
      "engage_RA": {"v":30.48,"u":"m","scope":"aircraft","src":["Z25"],"conf":"ต่ำ","est":false,"note":"100 ft RA (FCOM A321neo ตามที่ยกในฟอรัม)"},
      "ground_thrust_effect_compensation": {"v":false,"u":"-","scope":"aircraft","src":["Z25"],"conf":"ต่ำ","est":false,"note":"The flare law does not compensate the ground or thrust effect"}
     },
     "pitch": {
      "autotrim_freeze_RA": {"v":30.48,"u":"m","scope":"aircraft","src":["Z25"],"conf":"ต่ำ","est":false,"note":"100 ft RA"}
     }
    },
    "protections": {
     "high_incidence_cert": {"v":{"vmin_entry_rate":0.514,"icing_decel_max":1.029,"sw_margin_pct":3,"sw_margin":1.543,"full_back_stick_s":3,"turn_bank_deg":30},"u":"m/s/s, m/s/s, %, m/s, s, deg","scope":"aircraft","src":["Z9","Z10"],"conf":"สูง","est":false,"note":"ย้ายจาก common_airliner.fbw; A321neo XLR special conditions 25-854-SC: entry 1 kt/s (c)(1); icing ถึง 2 kt/s (e)(1)(ii)(C)(2); full back stick >= 3 s (e)(1)(ii)(D); เลี้ยว 30 deg (e)(1)(i); margin 3% หรือ 3 kt ใช้เฉพาะในน้ำแข็งเมื่อ protection ลดระดับ (d)(2)(ii); ใช้ตั้งกรณีทดสอบ alpha protection"}
    }
   }
  }
 }
}
```

<!-- a330_300: 36 leaf -->
```json
{
 "a330_300": {
  "controls": {
   "fbw": {
    "computers": {"v":{"pitch_roll":"3 PRIM (FCPC) + 2 SEC (FCSC)","yaw":"กลไก (รุ่นหลัง FBW)","air_data":"3 ADIRU; FCPC ใช้ AoA เฉลี่ย AOA1/AOA2 หลังแก้ไข"},"u":"-","scope":"aircraft","src":["Z3","Z4","Z13"],"conf":"สูง","est":false,"note":""},
    "update_rate_hz": {"v":240,"u":"Hz","scope":"sim","src":["Z39"],"conf":"ต่ำ","est":true,"note":"เหมือน a320ceo"},
    "normal_law": {
     "pitch": {
      "command": {"v":"C_star_nz_integral","u":"-","scope":"aircraft","src":["Z2","Z12"],"conf":"สูง","est":false,"note":"คันสั่ง load factor (BEA AF447 หน้า 38)"},
      "stick_to_dnz": {"v":{"clean":{"pull_full":1.5,"push_full":-2},"slats_flaps":{"pull_full":1,"push_full":-1}},"u":"g (เทียบ 1 g)","scope":"aircraft","src":["Z32","Z11"],"conf":"กลาง","est":true,"note":"2.5/-1 g clean, 2/0 g slat/flap (A330/340 FCTM)"},
      "Vco": {"v":121.9,"u":"m/s","scope":"aircraft","src":["Z17"],"conf":"ต่ำ","est":true,"note":"เหมือน a320ceo"},
      "gains": {"v":{"Kp":0.06,"Ki":0.2,"qbar0":8000,"sched_min":0.3,"sched_max":4},"u":"rad/g, rad/(g s), Pa, -, -","scope":"aircraft","src":["Z39"],"conf":"ต่ำ","est":true,"note":"ยังไม่ได้ทดสอบกับข้อมูล A330; ต้องรันกรณีทดสอบซ้ำ"},
      "path_hold": {"v":{"Kg":1,"Kgi":0.2,"dnz_max":0.3},"u":"1/s, 1/s2, g","scope":"aircraft","src":["Z39"],"conf":"ต่ำ","est":true,"note":"เหมือน a320ceo"},
      "bank_compensation_max": {"v":33,"u":"deg","scope":"aircraft","src":["Z32"],"conf":"กลาง","est":false,"note":"A330/340 FCTM"},
      "autotrim_nz_window": {"v":[0.5,1.3],"u":"g","scope":"aircraft","src":["Z33"],"conf":"ต่ำ","est":false,"note":"เหมือน a320ceo"},
      "autotrim_bank_max": {"v":33,"u":"deg","scope":"aircraft","src":["Z33"],"conf":"ต่ำ","est":false,"note":""},
      "autotrim_inhibit": {"v":{"alpha_prot":"no_nose_up","hsp":"frozen","direct_law":"off","abnormal":"off"},"u":"-","scope":"aircraft","src":["Z2","Z3","Z32"],"conf":"กลาง","est":false,"note":"abnormal attitude: ไม่มี auto-trim (Z2)"}
     },
     "flare_mode": {
      "engage_RA": {"v":30.48,"u":"m","scope":"aircraft","src":["Z32","Z29","Z33"],"conf":"กลาง","est":false,"note":"100 ft RA; A330/340 FCTM (Z32): pitch law becomes full authority direct law with no auto-trim + nose down term"},
      "transition_time": {"v":2,"u":"s","scope":"aircraft","src":["Z33"],"conf":"ต่ำ","est":false,"note":"flight ไป flare และ flare ไป ground ช่วงละ 2 s"},
      "law_type": {"v":"direct_full_authority_no_autotrim_plus_nose_down_term","u":"-","scope":"aircraft","src":["Z32"],"conf":"กลาง","est":false,"note":"A330/340 FCTM ผ่าน Z32: on reaching 100 ft the pitch law is modified to be a full authority direct law with no auto-trim; a nose down term is introduced (ขนาดไม่ระบุ) - ผู้ตรวจเพิ่ม 2026-11-18"},
      "nose_down_target": {"v":-2,"u":"deg","scope":"aircraft","src":["Z39","Z32"],"conf":"ต่ำ","est":true,"note":"Z32 ยืนยันว่ามี nose down term แต่ไม่ให้ขนาด; ใช้ค่าของ A320 ชั่วคราว"},
      "nose_down_time": {"v":8,"u":"s","scope":"aircraft","src":["Z39"],"conf":"ต่ำ","est":true,"note":"เหมือนข้างบน"}
     },
     "ground_mode": {
      "blend_after_liftoff": {"v":5,"u":"s","scope":"aircraft","src":["Z33"],"conf":"ต่ำ","est":false,"note":"อ้าง SmartCockpit A330 ผ่าน Wikipedia"}
     },
     "roll": {
      "p_cmd_max": {"v":15,"u":"deg/s","scope":"aircraft","src":["Z1","Z39"],"conf":"ต่ำ","est":true,"note":"ค่า A320; ของ A330 ไม่พบในแหล่งสาธารณะ"},
      "bank_limits": {"v":{"neutral_spiral":33,"full_stick":67,"aoa_prot":45,"hsp":45},"u":"deg","scope":"aircraft","src":["Z32"],"conf":"กลาง","est":false,"note":"A330/340 FCTM: 67 deg ลดเป็น 45 deg เมื่อ HSP"},
      "gains": {"v":{"wn":2,"zeta":0.8,"Ki_over_Kphi":0.5,"ref_window_deg":1},"u":"rad/s, -, -, deg","scope":"aircraft","src":["Z39"],"conf":"ต่ำ","est":true,"note":"ใช้ gain ชุดเดียวกับ A320 ยังไม่ได้ทดสอบกับข้อมูล A330 ต้องรันกรณีทดสอบซ้ำ"}
     }
    },
    "protections": {
     "nz_limits": {"v":{"clean":[-1,2.5],"slats_flaps":[0,2]},"u":"g","scope":"aircraft","src":["Z32","Z3","Z11"],"conf":"สูง","est":false,"note":""},
     "pitch_limits": {"v":{"nose_up":30,"nose_up_low_speed":25,"nose_down":-15},"u":"deg","scope":"aircraft","src":["Z32"],"conf":"กลาง","est":false,"note":"A330/340 FCTM"},
     "alpha_rule": {"v":{"CL_amax_over_CLmax":0.873,"aprot_below_amax":3,"afloor_below_amax":2.5},"u":"-, deg, deg","scope":"aircraft","src":["Z39"],"conf":"ต่ำ","est":true,"note":"alpha จริงของ A330 ไม่พบ; ใช้กฎเดียวกับ A320"},
     "stall_warning_alpha_max": {"v":23,"u":"deg","scope":"aircraft","src":["Z3","Z2"],"conf":"สูง","est":false,"note":"23 deg คือขีดใน normal law (Z3 หน้า 21); ใน alternate/direct ขีดแปรตาม Mach ไม่มีตัวเลข (Z2 หน้า 44) - ผู้ตรวจแก้ 2026-11-18"},
     "alpha_speed_sensitivity": {"v":{"cruise":12.861,"approach":2.572},"u":"m/s per deg","scope":"aircraft","src":["Z2"],"conf":"สูง","est":false,"note":"25 kt ต่อ 1 deg ที่ cruise, 5 kt ต่อ 1 deg ที่ approach"},
     "hsp": {"v":{"dV_on":3.087,"dM_on":0.01,"dV_nd_zero":8.231,"dM_nd_zero":0.04},"u":"m/s, Mach","scope":"aircraft","src":["Z32","Z22"],"conf":"ต่ำ","est":false,"note":"FCTM: at/above VMO/MMO; ใช้ +6 kt แบบ A320"},
     "hsp_dnz_max": {"v":0.75,"u":"g","scope":"aircraft","src":["Z32"],"conf":"กลาง","est":false,"note":"nose-up สูงสุด 1.75 g"}
    },
    "alternate_law": {
     "alt1_roll": {"v":"normal","u":"-","scope":"aircraft","src":["Z2","Z33"],"conf":"สูง","est":false,"note":"ALT1: roll normal, protections ลดลง"},
     "alt2_roll": {"v":"direct","u":"-","scope":"aircraft","src":["Z2"],"conf":"สูง","est":false,"note":"ALT2: aileron และ spoiler สั่งตรง"},
     "stall_warning_speed_factor": {"v":1.03,"u":"VS1g","scope":"aircraft","src":["Z32"],"conf":"กลาง","est":false,"note":"แทน high AoA protection"},
     "airspeed_drop_trigger": {"v":{"dCAS":15.433,"dt":1},"u":"m/s, s","scope":"aircraft","src":["Z2"],"conf":"สูง","est":false,"note":"CAS ที่โหวตตก > 30 kt ใน 1 s เข้า ALT2"}
    },
    "direct_law": {
     "autotrim": {"v":false,"u":"-","scope":"aircraft","src":["Z3"],"conf":"สูง","est":false,"note":"Autotrim was not available in direct law"}
    },
    "abnormal_attitude": {
     "triggers": {"v":{"bank_deg":125},"u":"deg","scope":"aircraft","src":["Z2"],"conf":"สูง","est":false,"note":"ตัวอย่างเงื่อนไขจาก BEA; อื่น ๆ ใช้ของ a320ceo"}
    },
    "sidestick": {
     "travel": {"v":{"pitch":16,"roll":20},"u":"deg","scope":"aircraft","src":["Z32"],"conf":"กลาง","est":false,"note":"A330/340 FCTM"}
    },
    "sim": {
     "time_delay_budget": {"v":0.1,"u":"s","scope":"sim","src":["Z36"],"conf":"กลาง","est":false,"note":"ย้ายจาก common_airliner.fbw; งบหน่วงเวลา Level 1 จากรอบที่ 1 หัวข้อ 6; ขั้น 240 Hz = 4.167 ms"},
     "input_mapping": {"v":{"stick_units":"[-1, 1] หลัง deadzone + expo","expo_gamepad":0.5,"keyboard_ramp_up_per_s":0.5,"keyboard_centre_per_s":2.5},"u":"-","scope":"sim","src":["Z36"],"conf":"กลาง","est":false,"note":"ย้ายจาก common_airliner.fbw; ค่าจาก input ของรอบที่ 1 หัวข้อ 11"}
    }
   }
  }
 }
}
```

<!-- common_airliner: ย้ายแล้ว (ผู้ตรวจ 2026-11-18) -->
บล็อก `common_airliner.fbw` เดิม (4 leaf) ถูกย้ายเข้า path ที่หัวข้อนี้เป็นเจ้าของตาม schema-ext ข้อ 4 (`controls.fbw` ของแบบ Airbus เท่านั้น): `cert_nz_limits` ไปที่ `a320ceo.controls.fbw.protections`, `high_incidence_cert` ไปที่ `a321neo.controls.fbw.protections` (เป็น special condition ของ A321neo XLR และสืบต่อไปยัง a321ceo), `time_delay_budget` และ `input_mapping` ไปที่ `controls.fbw.sim` ของ a320ceo และ a330_300


## กรณีทดสอบ

สคริปต์: P = `z_fbw_proto.mjs` (ผลใน `z_fbw_proto_out.txt`), V = `z_testvals.mjs` (ผลใน `z_testvals_out.txt`) ทั้งสองอยู่ใน `scripts/` กรณีที่ใช้ต้นแบบมีค่าที่ได้จริงในวงเล็บ เมื่อย้ายไปใช้ `Aircraft` 6-DOF ของ AirfieldLab ให้คงเกณฑ์และ tolerance เดิม ส่วนค่าในวงเล็บใช้เทียบเท่านั้น ทุกกรณีใช้ A320 64.5 t ข้อมูลประมาณจากหัวข้อ 3 เว้นแต่ระบุ

| รหัส | เงื่อนไข | ปริมาณที่วัด | ผลคาดหวัง ± tolerance | ที่มา/สคริปต์ |
|---|---|---|---|---|
| T-Z-01 | `stickToDnz` clean และ FULL ที่ s = +1, +0.5, −0.5, −1 | nz = 1 + Δnz | clean 2.5, 1.75, 0, −1.0 g; FULL 2.0, 1.5, 0.5, 0 g ± 1e-9 | [Z1][Z11]; V, P |
| T-Z-02 | `nzRef(θ, φ)` | nz_ref | φ 30°: 1.1547; φ 33° และ 45°: 1.1924 (ไม่ชดเชยเกิน 33°); θ 10°: 0.9848 ± 1e-4 | [Z32]; P |
| T-Z-03 | CONF 0, 330 kt, 600 m, คัน +0.5 จาก t = 1 s | nz สูงสุด, t90 | nz สูงสุด 1.75 + 0.10/−0.03 g (1.792); t90 ≤ 1.5 s (1.07 s) | [Z12]; P |
| T-Z-04 | เหมือน T-Z-03 คัน +1 | nz สูงสุด | ≤ 2.65 g (2.643) และอยู่เหนือ 2.5 g รวมไม่เกิน 1 s (0.850 s) | [Z1]; P |
| T-Z-05 | เหมือน T-Z-03 คัน −1 | nz ต่ำสุด | ≥ −1.05 g (−1.020) | [Z1]; P |
| T-Z-06 | CONF 0, 330 kt, ดึงคันสุด 29 s, แรงขับ 3 เท่า | θ สูงสุด | 30° + 0.5° (30.12°) | [Z1]; P |
| T-Z-07 | CONF 0, 330 kt, 3000 m, ดันคันสุด 11 s | θ ต่ำสุด, nz ต่ำสุด | θ ≥ −15.5° (−12.75°); nz ≥ −1.05 g (−1.046) | [Z1]; P |
| T-Z-08 | CONF 0, 300 kt, 3000 m, เอียง 30° (ramp 3 s), ปล่อยคัน 30 s, แรงขับ T0/cosφ | Δh, nz | \|Δh\| ≤ 15 m (0.1 m); nz 1.155 ± 0.02 g (1.148) | [Z32]; P |
| T-Z-09 | เหมือน T-Z-08 แต่เอียง 45° | Δh ที่ 33 s | Δh ≤ −100 m (เครื่องเสียความสูงเพราะไม่ชดเชยเกิน 33°) (−417.8 m) | [Z32]; P |
| T-Z-10 | FULL, 133.5 kt, γ −3°, ล้อลง, คันกลาง, แรงขับเหลือ 5% ที่ 5 s | γ ก่อนเข้าโหมด AOA | −3° ± 0.6° (−3.49 ถึง −2.98°) | [Z1]; P |
| T-Z-11 | เหมือน T-Z-10 ต่อถึง 70 s | α ระหว่าง 50–70 s และ α สูงสุด | αprot ± 0.2° (9.34–9.43°, αprot 9.38°); α สูงสุด ≤ αprot + 0.3° (9.56°) | [Z5][Z7]; P |
| T-Z-12 | FULL, 133.5 kt, ดึงคันสุดจาก t = 2 s (approach thrust และ idle) | α สูงสุด, α ช่วง 20–40 s | α สูงสุด ≤ αmax + 0.5° (12.85°, αmax 12.38°); 20–40 s อยู่ใน αmax −0.3°/+0.4° (12.17–12.72°) | [Z5][Z8]; P |
| T-Z-13 | `alphaThresholds` ของโมเดล FULL และ CONF 0 | αmax, αprot, αfloor | FULL 12.38, 9.38, 9.88°; CONF 0 11.06, 8.06, 8.56° ± 0.01° | [Z7][Z8]; P |
| T-Z-14 | อัตราส่วนความเร็วจาก D-AXLA | Vαmax/VS1g และ CL ratio | 1.070 ± 0.005 และ 0.873 ± 0.003 | [Z7]; V |
| T-Z-15 | `flareThetaRef(θmemo, t30)` | θref | memo 2.5°: t 0 = 2.5°, t 4 s = 0.25°, t ≥ 8 s = −2°; memo 5°: t 4 s = 1.5°; memo −3°: −2° ± 1e-6 | [Z8][Z19]; P, V |
| T-Z-16 | FULL, 133.5 kt, γ −3°, เริ่ม 60 ft, คันกลาง | θ ที่แตะพื้น, อัตราจม | θ_td < θ ที่ 50 ft (0.81° < 1.38°); อัตราจม ≥ 600 fpm (729 fpm, 3.70 m/s) คือกฎไม่ flare ให้ | [Z8][Z24]; P |
| T-Z-17 | เหมือน T-Z-16 แต่ดึงคัน 0 ถึง 0.6 ระหว่าง 30–10 ft | อัตราจมที่แตะพื้น | ≤ 450 fpm (413 fpm, 2.10 m/s); θ_td 4–8° (5.98°) | [Z24]; P |
| T-Z-18 | `bankReturnRate` | R(φ) | 30° (ขีด 67): 0; 50°: 7.5°/s; 67°: 15°/s; 40° (ขีด 45): 8.75°/s; HSP 20° (ขีด 40): 7.5°/s ± 1e-6 | [Z1][Z20]; V, P |
| T-Z-19 | roll FULL 133.5 kt, คันสุด 12 s แล้วปล่อย | p ที่ 2 s, φ สูงสุด, φ หลังปล่อย | p 15 ± 1.5°/s (16.47); φ สูงสุด ≤ 67.5° (66.42°); φ ถึง ≤ 34° ภายใน 10 s (8.52 s); φ ที่ 30 s = 33 ± 0.5° (33.02°) | [Z1]; P |
| T-Z-20 | เหมือน T-Z-19 ขีด 45° (AoA prot) | φ สูงสุด, φ ที่ 12 s | ≤ 46° (45.55°); 45 ± 0.5° (45.00°) | [Z1]; P |
| T-Z-21 | roll HSP 340 kt 3000 m คันสุด 10 s แล้วปล่อย | φ สูงสุด, φ ที่ 30 s | ≤ 40.5° (38.96°); \|φ\| ≤ 1° (0.02°) | [Z1][Z22]; P |
| T-Z-22 | คันสุด 2 s แล้วปล่อย ภายใต้แรงรบกวน 0.02 rad/s² | φ ระหว่าง 6–32 s | อยู่ใน φref ± 0.5° (28.68–28.74°, φref 28.74°) | [Z1]; P |
| T-Z-23 | HSP CONF 0, 340 kt, γ −3°, ปล่อยคัน, แรงขับเกิน 60 kN, 90 s | V สูงสุด | ≤ VMO + 8 kt = 358 kt (356.0 kt) และ HSP ถูกเรียก | [Z22]; P |
| T-Z-24 | HSP ดันคันสุดตั้งแต่ VMO แรงขับ 2 เท่า 60 s | V สูงสุด | < VMO + 16 kt = 366 kt (363.2 kt) | [Z31][Z32]; P |
| T-Z-25 | `hspDnz`, `hspAuthority` ที่ Vpred 356, 361, 366 kt | Δnz_hsp, อำนาจ ND | 0 และ 1; 0.375 g และ 0.5; 0.75 g และ 0 ± 1e-9 | [Z32]; V |
| T-Z-26 | `abnormal()` | ธง | φ 126°, θ 51°, α 41°, IAS 59 kt, M 0.92: true; ค่าปกติ (φ 30°, θ 10°, α 5°, 250 kt, M 0.5): false | [Z2][Z21][Z23]; P |
| T-Z-27 | ลำดับกฎ: ALT law แล้วลดล้อลง; IR ทั้งสามเสีย | law, autotrim, ข้อความ | pitch = direct, autotrim = false, ธง useManTrim = true ในทั้งสองกรณี | [Z7][Z23]; ตรรกะ |
| T-Z-28 | auto-trim: \|φ\| = 40° (nose-up), หรือ nz = 1.4 g (nose-up), หรืออยู่ใน flare (ทั้งสองทิศ), หรือ HSP (ตรึง), หรือโหมด AOA (nose-up) | Δih ใน 10 s | 0 ในทิศที่ห้าม ± 1e-9 | [Z7][Z22][Z33]; ตรรกะ |
| T-Z-29 | alpha floor: α ≥ αfloor ที่ RA 500 ft M 0.3; ที่ RA 80 ft ขาลง; ที่ M 0.65 | ธง alphaFloor | true; false; false | [Z8][Z22][Z26]; ตรรกะ |
| T-Z-30 | sidestick: แรงที่ระยะสุดและความชัน | F(16°), F(20°) roll out/in | 100.1 ± 5 N; 24.9 และ 34.7 ± 2 N; ความชัน 5.949, 1.001, 1.490 N/° ± 0.01 | [Z27]; V |
| T-Z-31 | input: gamepad expo 0.5 โยก 0.5, dead zone 0 (ถ้าใช้ dead zone 0.04 แบบ scaled ของรอบที่ 1: s = 0.2946, Δnz = 0.442 g) | s และ Δnz clean | s = 0.3125; Δnz = 0.469 ± 0.001 g | [Z36]; V, zrev_testvals |
| T-Z-32 | ground mode ผสมหลัง lift-off | น้ำหนักกฎ nz | 0.5 ที่ 2.5 s, 1.0 ที่ ≥ 5 s ± 1e-9 | [Z28][Z33]; P |
| T-Z-33 | regression ของเครื่องฝึก | ผลทดสอบเดิม 5 ชุด | `test/*.test.mjs` ผ่านทั้งหมด และคะแนน autoland 94–100 เหมือนเดิม เพราะ FbwLaw ใช้เฉพาะแบบที่ `controls.architecture.pitch = 'fbw'` | CLAUDE.md [Z35] |

## ความขัดแย้งของแหล่งข้อมูลและข้อจำกัด

1. **ขีดมุมเอียง 67° กับ 65°**: KNKT [Z1] และ FBW docs [Z22] ให้ 67° รูปใน [Z13] แสดง 65° เลือก 67° เพราะ [Z1] เป็นรายงานทางการที่ใหม่กว่า และ 67° สอดคล้องกับมุมที่ 2.5 g ยังบินระดับได้ (66.42°)
2. **มุมเอียงใน HSP 40° (A320) กับ 45° (A330)**: [Z1] เป็นของ A320 ส่วน [Z32] ยก A330/340 FCTM จึงแยกตามแบบ ไม่ใช่ความขัดแย้งจริง
3. **จุดเริ่ม HSP**: [Z22] เขียนทั้ง MMO + 0.01 และ MMO + 0.015 ในหน้าเดียวกัน; [Z1] และ [Z32] เขียน "at/above VMO/MMO" เลือก VMO + 6 kt และ MMO + 0.01 ตาม [Z13] (รูป VMO + 6 kt) และส่วนที่ละเอียดกว่าของ [Z22]
4. **เงื่อนไข auto-trim**: [Z33] ให้ 33° และ 1.3 g ส่วนโมเดล [Z19] ใช้ 30° และ 1.25 g เลือกค่าของ [Z33] เพราะตรงกับขอบ 33° ของการชดเชยมุมเอียงใน [Z32]
5. **alpha floor CONF 3**: Habsheim ปี 1988 [Z8] ใช้ 15° ส่วน FCOM ปัจจุบันผ่าน [Z22] ใช้ 14° ถือว่าเป็นมาตรฐานต่างรุ่น ใช้ค่าของ [Z22] สำหรับการแสดง และใช้ alpha_rule กับโมเดล
6. **ค่า α ของ FBW A32NX กับเครื่องจริง**: [Z21] αmax FULL 13.0° แต่ US1549 [Z30] ให้ 17.5° ใน CONF 2 จึงไม่ใช้ตัวเลขของ [Z21]
7. **yaw damper ใน direct law**: [Z23] ว่ายังมี yaw damper แบบ alternate ส่วน [Z31] ว่า yaw damping และ turn coordination หายไป ยังตัดสินไม่ได้ ใช้ "มี yaw damper อำนาจจำกัด ±5°" ตาม alternate law ของ [Z1] เป็นค่าตั้งต้น (ความเชื่อมั่นต่ำ)
8. **Vco**: Tobie [Z17] และ [Z12] ให้ราว 121.9 m/s (237–240 kt) โมเดล [Z19] ใช้ 100 m/s เลือก 121.9 m/s เพราะเป็นนิยามดั้งเดิม ค่าจริงของ Airbus ไม่พบ
9. **ความสูงเริ่ม flare mode**: A320 50 ft [Z8], A321neo 100 ft [Z25], A330 100 ft [Z32][Z29][Z33] เป็นความต่างตามแบบ ข้อมูล A321neo มาจากฟอรัมจึงความเชื่อมั่นต่ำ ส่วน A330 มี [Z32] (A330/340 FCTM) เขียนในหัวข้อ Flare Mode ของ **normal law** ว่า "on reaching 100 ft on the approach the pitch law is modified to be a full authority direct law with no auto-trim" และ "A nose down term is introduced" จึงเป็นความเชื่อมั่นกลาง (ผู้ตรวจแก้ 2026-11-18: ข้อความเดิมที่ว่าน่าจะเป็นบริบทของ alternate law ไม่ถูกต้อง ส่วน alternate law ของ A330 "reverts to direct law at 100 ft RA" เป็นอีกประโยคหนึ่ง)
10. **อัตราส่วน VLS/VS1g**: ถ้าใช้ 1.28 แทน 1.23 จะได้ Vαmax/VS1g = 1.113 แทน 1.070 และ CL ratio 0.8065 แทน 0.873 ทำให้ αmax ของโมเดลต่ำลงราว 1° (ความไม่แน่นอนหลักของ alpha_rule)
11. **แรง breakout ของ sidestick**: หัวข้อ 7 [Z38] ใช้ 50 N / 35 N เป็น breakout แต่ [Z1] ให้ค่านี้ในบริบทของคันที่ล็อกขณะ AP ทำงาน ส่วน [Z27] ให้ breakout 4.89 N เสนอให้หัวข้อ 7 ตรวจและเปลี่ยนชื่อ leaf เป็น ap_override ถ้าเห็นด้วย (ผู้ตรวจ: ในกระทู้เดียวกันของ [Z27] มีอีกโพสต์ถามว่า "25 lbs fore and aft - 7 lbs lateral" โดยไม่มีแหล่ง ค่าที่ใช้มาจากโพสต์เดียวที่อ้างเอกสาร Airbus จึงคงความเชื่อมั่นต่ำ)
12. **ชื่อ ALT1/ALT2**: A330 [Z2] ใช้ ALT1 (roll normal) และ ALT2 (roll direct) ส่วน A320 [Z23] ใช้ "with/without reduced protection" ซึ่งทั้งสองแบบมี roll direct ตาม [Z1] แบบจำลองจึงใช้ธงแยกแต่ละความสามารถ

ข้อจำกัดของแบบจำลอง:

- gain ทุกตัวเป็นค่าประมาณที่เลือกบนแบบจำลอง point-mass บวก pitch และ roll 1-DOF ต้องปรับใหม่บน 6-DOF ของ AirfieldLab ซึ่งมี coupling ของแกน roll กับ yaw
- ต้นแบบยังมี nz ทะลุ 2.5 g ได้ 0.143 g ชั่วขณะ (T-Z-04) และ α ทะลุ αmax 0.47° (T-Z-12) เครื่องจริงน่าจะดีกว่านี้ ถ้าต้องการให้แน่นขึ้นให้เพิ่ม lead ของ nz หรือลด Ki
- ใช้ข้อมูล aero ของหัวข้อ 3 ชุด approach กับทุกความเร็ว (ไม่มีผล Mach) ผล HSP จึงเป็นการตรวจตรรกะ ไม่ใช่สมรรถนะจริง
- เทอม phugoid damping ในโหมด AoA ที่ NTSB อธิบาย [Z6] จำลองด้วย kAd·(Vco/g)·θ̇ เท่านั้น ยังไม่ได้ปรับเทียบกับข้อมูล US1549

## แหล่งอ้างอิง

สิทธิ์การใช้ (ใช้ซ้ำทุกรายการ): **ก** = อ้างตัวเลขและข้อเท็จจริงได้ คัดลอกข้อความยาว รูป หรือโค้ดไม่ได้; **ข** = งานรัฐบาลสหรัฐฯ (public domain) อ้างและยกข้อความได้; **ค** = CC BY 3.0 AU ใช้ซ้ำได้พร้อมระบุที่มา; **ง** = GPL-3.0/GPL-2.0 ห้ามคัดลอกโค้ดเข้า AirfieldLab (repo ไม่มีไฟล์ LICENSE จึงไม่ใช่ GPL) แต่อ้างโครงสร้างและตัวเลขได้; **จ** = CC BY-SA 4.0 อ้างข้อเท็จจริงได้ ถ้าคัดลอกข้อความต้องใช้สัญญาอนุญาตเดียวกัน; **ฉ** = สำเนาไม่เป็นทางการบนเว็บบุคคลที่สาม อ้างตัวเลขแต่ละตัวได้ ความเชื่อมั่นไม่เกินกลาง ห้ามคัดลอกข้อความยาว

1. **[Z1]** KNKT (National Transportation Safety Committee, Indonesia), *Aircraft Accident Investigation Report PK-AXC Airbus A320-216, 28 December 2014*, final report 2015; สำเนาที่ ERAU: https://libraryonline.erau.edu/online-full-text/ntsb/miscellaneous-reports/indonesia-air-12-14.pdf (§1.6.5.1–1.6.5.5 หน้า 29–36). ปฐมภูมิ. ก
2. **[Z2]** BEA, *Final Report on the accident on 1st June 2009 to the Airbus A330-203 F-GZCP*, July 2012 (English); สำเนาที่ FAA: https://www.faa.gov/sites/faa.gov/files/f-cp090601.en_.pdf (หน้า 37–46). ปฐมภูมิ. ก
3. **[Z3]** ATSB, *In-flight upset, 154 km west of Learmonth, WA, 7 October 2008, VH-QPA Airbus A330-303*, AO-2008-070, final December 2011: https://www.atsb.gov.au/sites/default/files/media/3532398/ao2008070.pdf ปฐมภูมิ. ค
4. **[Z4]** ATSB, Safety issue AO-2008-070-SI-02 (FCPC AOA algorithm): https://atsb.gov.au/safety-issues/AO-2008-070-SI-02 ปฐมภูมิ. ค
5. **[Z5]** NTSB, *Loss of Thrust in Both Engines After Encountering a Flock of Birds and Subsequent Ditching on the Hudson River, US Airways Flight 1549, Airbus A320-214*, AAR-10/03, May 2010; สำเนาที่ FAA: https://www.faa.gov/sites/faa.gov/files/2025-04/usair_a320.pdf (§1.6.2–1.6.4 หน้า 11–13). ปฐมภูมิ. ข
6. **[Z6]** NTSB AAR-10/03 findings (ข้อ 24 เทอมใน alpha-protection) สำเนาที่ FAA Lessons Learned: https://www.faa.gov/sites/faa.gov/files/2025-04/usairways1549_findings.pdf ปฐมภูมิ. ข
7. **[Z7]** BEA, *Final Report, Accident on 27 November 2008 off the coast of Canet-Plage to the Airbus A320-232 D-AXLA*, 2010 (English): https://bea.aero/fileadmin/documents/docspa/2008/d-la081127.en/pdf/d-la081127.en.pdf (หน้า 27–33, 48–49). ปฐมภูมิ. ก
8. **[Z8]** Investigation Commission (BEA, แปลอังกฤษ), *Final Report, Accident on 26 June 1988 at Mulhouse-Habsheim to Airbus A320 F-GFKC* (ไม่ได้ตรวจวันที่ออกรายงาน); สำเนาที่ Aviation Safety Network: https://reports.aviation-safety.net/1988/19880626-0_A320_F-GFKC.pdf (§1.11.4, §1.16.1.2, §1.16.2.2). ปฐมภูมิ (สำเนา OCR). ก
9. **[Z9]** FAA, Special Conditions No. 25-854-SC, *Airbus Model A321neo XLR; Flight Envelope Protection, Icing and Non-Icing Conditions; High Incidence Protection*, Docket FAA-2021-1032, Federal Register 89 (96), 16 May 2024: https://govinfo.gov/content/pkg/FR-2024-05-16/pdf/2024-10646.pdf ปฐมภูมิ. ข
10. **[Z10]** FAA, Notice of proposed special conditions No. 25-23-03-SC (A321neo XLR), Federal Register 3 November 2023: https://docs.regulations.justia.com/entries/2023-11-03/2023-24311.pdf ปฐมภูมิ. ข
11. **[Z11]** FAA, Special Conditions No. 25-520-SC, *Embraer EMB-550; Flight Envelope Protection: Normal Load Factor (g) Limiting*, 79 FR 20768, 14 April 2014: https://regulations.justia.com/regulations/fedreg/2014/04/14/2014-08275.html ปฐมภูมิ (เกณฑ์ทั่วไปของ FBW). ข
12. **[Z12]** R. Niedermeier (DLR), D. Lambregts (FAA), *Fly-by-Wire Augmented Manual Control: Basic Design Considerations*, ICAS 2012 paper 605: https://icas.org/ICAS_ARCHIVE/ICAS2012/PAPERS/605.PDF ทุติยภูมิวิชาการ. ก
13. **[Z13]** D. Brière, C. Favre, P. Traverse (Aerospatiale), *Electrical Flight Controls, From Airbus A320/330/340 to Future Military Transport Aircraft: A Family of Fault-Tolerant Systems*, ch. 12 ใน C. Spitzer (ed.), *The Avionics Handbook*, CRC Press 2001; สำเนาไม่เป็นทางการ: https://w.helitavia.com/avionics/TheAvionicsHandbook_Cap_12.pdf ปฐมภูมิ (ผู้เขียนจาก Airbus). ฉ
14. **[Z14]** P. Traverse, I. Lacaze, J. Souyris (Airbus), *Airbus Fly-by-Wire: A Process Toward Total Dependability*, ICAS 2006 paper 050: https://icas.org/ICAS_ARCHIVE/ICAS2006/PAPERS/050.PDF ปฐมภูมิ. ก
15. **[Z15]** C. Favre, *Fly-by-wire for commercial aircraft: the Airbus experience*, International Journal of Control 59(1):139–157, 1994 (ไม่ได้เข้าถึงเนื้อหา อ้างตามรายการอ้างอิงของ [Z14]: https://icas.org/ICAS_ARCHIVE/ICAS2006/PAPERS/050.PDF). ปฐมภูมิ. ก
16. **[Z16]** D. Brière, P. Traverse, *Airbus A320/A330/A340 electrical flight controls: a family of fault-tolerant systems*, FTCS-23, Toulouse 1993, pp. 616–623 (ไม่ได้เข้าถึง อ้างผ่าน [Z14] ลิงก์เดียวกัน). ปฐมภูมิ. ก
17. **[Z17]** H. N. Tobie, E. M. Elliott, L. G. Malcom, *A New Longitudinal Handling Qualities Criterion*, Proc. NAECON, Dayton, May 1966, pp. 93–99 (ไม่ได้เข้าถึง; นิยาม C* และ Vco อ้างผ่าน [Z12] และ [Z18] ลิงก์ https://ntrs.nasa.gov/api/citations/19770011062/downloads/19770011062.pdf). ปฐมภูมิ. ก
18. **[Z18]** NASA NTRS 19770011062, รายงาน handling qualities ของเครื่องบินความเร็วเหนือเสียง (อ้าง Malcom และ Tobie, Boeing D6-17841-T/N, 1965): https://ntrs.nasa.gov/api/citations/19770011062/downloads/19770011062.pdf ทุติยภูมิ. ข
19. **[Z19]** FlyByWire Simulations, A32NX `PitchNormalLaw.cpp` (branch master อ่าน 18 พ.ย. 2026): https://raw.githubusercontent.com/flybywiresim/aircraft/master/fbw-a32nx/src/wasm/fbw_a320/src/model/PitchNormalLaw.cpp ; LICENSE https://raw.githubusercontent.com/flybywiresim/aircraft/master/LICENSE ทุติยภูมิ (โมเดลจำลอง). ง
20. **[Z20]** FlyByWire Simulations, A32NX `LateralNormalLaw.cpp`: https://raw.githubusercontent.com/flybywiresim/aircraft/master/fbw-a32nx/src/wasm/fbw_a320/src/model/LateralNormalLaw.cpp ทุติยภูมิ. ง
21. **[Z21]** FlyByWire Simulations, A32NX `ElacComputer.cpp` และ `ElacComputer_data.cpp`: https://raw.githubusercontent.com/flybywiresim/aircraft/master/fbw-a32nx/src/wasm/fbw_a320/src/model/ElacComputer_data.cpp ทุติยภูมิ. ง
22. **[Z22]** FlyByWire Simulations docs, *Normal Law Protections in the A320*: https://docs.flybywiresim.com/pilots-corner/a32nx/a32nx-advanced-guides/protections/overview/ ทุติยภูมิ (สรุปจาก FCOM ไม่ระบุสัญญาอนุญาตในหน้า). ก
23. **[Z23]** FlyByWire Simulations docs, *Abnormal Laws*: https://docs.flybywiresim.com/pilots-corner/a32nx/a32nx-advanced-guides/protections/abnormallaw/ ทุติยภูมิ. ก
24. **[Z24]** Airbus, Safety First, *A Focus on the Landing Flare* (ไม่พบวันที่ในหน้า amp): https://safetyfirst.airbus.com/a-focus-on-the-landing-flare/amp ปฐมภูมิ (ผู้ผลิต). ก
25. **[Z25]** PPRuNe Tech Log, *Flare law in the A320ceo vs neo*, เม.ย.–พ.ค. 2024: https://www.pprune.org/tech-log/printthread-658694-flare-law-a320ceo-vs-neo.html ตติยภูมิ (ฟอรัม ยก FCOM). ก
26. **[Z26]** PPRuNe, *A320 flight control protections*, ม.ค. 2023: https://www.pprune.org/archive/index.php/t-650657.html?pda=1 ตติยภูมิ. ก
27. **[Z27]** PPRuNe Tech Log, *A320 Sidestick resistance*, ธ.ค. 2004: https://www.pprune.org/tech-log/printthread-155798-a320-sidestick-resistance.html ตติยภูมิ. ก
28. **[Z28]** PPRuNe, โพสต์ 271 (ข้อความคัดลอกเรื่อง flare และ ground mode): https://www.pprune.org/3957318-post271.html ตติยภูมิ. ก
29. **[Z29]** PPRuNe, โพสต์ #4 เรื่อง A330 flare mode, ก.ย. 2004: https://www.pprune.org/1540676-post4.html ตติยภูมิ. ก
30. **[Z30]** PPRuNe, โพสต์ 17 พ.ค. 2017 ยก NTSB US1549 Aircraft Performance Study: https://www.pprune.org/9774155-post1.html ตติยภูมิ. ก
31. **[Z31]** TheAirlinePilots.com, *A320 Flight Control Laws Protection* (บันทึกการฝึก ปรับปรุง 16 ก.พ. 2023): https://www.theairlinepilots.com/forumarchive/a320/a320-flight-control-laws.pdf ตติยภูมิ. ก
32. **[Z32]** Code7700, *Airbus control laws* (ยก Airbus A330/A340 FCTM Rev 1, 6 Jun 2005, หน้า 2.60.1–2.60.12): https://mail.code7700.com/airbus_control_laws.htm ตติยภูมิที่ยกเอกสารผู้ผลิต. ฉ
33. **[Z33]** Wikipedia, *Flight control modes* (อ่าน 18 พ.ย. 2026): https://en.wikipedia.org/wiki/Flight_control_modes ตติยภูมิ. จ
34. **[Z34]** FlightGear A320-family (legoboyvdlp), `Systems/a320-fbw.xml`: https://raw.githubusercontent.com/legoboyvdlp/A320-family/master/Systems/a320-fbw.xml (ตาราง gain ตาม VCAS 140/350 kt ใช้เป็นตัวอย่างการ schedule gain เท่านั้น). ทุติยภูมิ. ง (GPL-2.0)
35. **[Z35]** AirfieldLab `src/20-flight.js` (คลาส `PilotLaws` บรรทัด 427–477), `src/90-app.js` บรรทัด 332, CLAUDE.md (อ่านอย่างเดียว). ภายใน
36. **[Z36]** ไฟล์ภายในรอบที่ 1: `../01-flight-physics/06-controls.md` (งบหน่วงเวลา 0.10 s, สถาปัตยกรรม FBW) และ `11-input.md` (dead zone, expo, keyboard ramp). ภายใน
37. **[Z37]** บัตรรอบที่ 3 หัวข้อ 3 `03-a320-a321.md` (มวล, derivative, CLmax, VMO, VLS, τe, ลำดับ `_inherits`). ภายใน (ค่าประมาณของหัวข้อนั้น)
38. **[Z38]** บัตรรอบที่ 3 หัวข้อ 7 `07-flight-controls.md` (ระยะ elevator และ THS, `controls.inceptors.sidestick`, `controls.trim`). ภายใน
39. **[Z39]** สคริปต์ของหัวข้อนี้: `scripts/z_fbw_proto.mjs`, `z_testvals.mjs`, `z_json.mjs` และผลลัพธ์ `*_out.txt`/`z_json_out.md` (ค่าประมาณที่เลือกและตรวจด้วยการจำลอง). ภายใน

## งานที่แนะนำสำหรับ Claude Code

1. **P1 M: คลาส `FbwLaw` แบบ pure ใน `src/20-flight.js`** มีฟังก์ชันย่อย `stickToDnz`, `nzRef`, `flareThetaRef`, `bankReturnRate`, `rollRateCmd`, `abnormal`, `alphaThresholds`, `hspDnz`, `hspAuthority`, `groundBlend` ตามสมการในหัวข้อ 3.8.3 ถึง 3.8.5 (เขียนใหม่เอง ห้ามคัดลอกโค้ด GPL) และ `test/fbw.test.mjs` แบบไม่มี dependency (ทดสอบ: T-Z-01, T-Z-02, T-Z-13, T-Z-15, T-Z-18, T-Z-25, T-Z-26, T-Z-32)
2. **P1 M: ต่อ `FbwLaw` กับ `Aircraft` 6-DOF** เรียกหนึ่งครั้งต่อขั้น 240 Hz ก่อน RK4 วัด nz จากแรงจำเพาะ, θ̇ จาก Euler kinematics, α̇ ผ่าน low-pass แยก elevator กับ THS (ต้องรอ `controls.trim` ของหัวข้อ 7) แล้วรันกรณีแกน pitch ซ้ำบน 6-DOF ทำบน branch แล้วเปิด pull request ตาม CLAUDE.md (ทดสอบ: T-Z-03 ถึง T-Z-12, T-Z-33)
3. **P1 S: ตรวจว่าเครื่องฝึกเดิมไม่เปลี่ยน** เลือก `FbwLaw` เฉพาะเมื่อ `controls.architecture.pitch === 'fbw'` (ทดสอบ: T-Z-33)
4. **P2 M: แกน roll และ yaw** roll-rate command, bank hold, spiral 33°, ขีด 67/45/40°, turn coordination ด้วย r_cmd = g·tanφ/V และคำนวณ Lp, Lu ใหม่ทุกขั้น (ทดสอบ: T-Z-18 ถึง T-Z-22)
5. **P2 M: protections** โหมด AOA (lead, latch, bumpless transfer), alpha floor ส่งธงให้ A/THR ของหัวข้อ 9, HSP พร้อมการตรึง trim (ทดสอบ: T-Z-10 ถึง T-Z-14, T-Z-23 ถึง T-Z-25, T-Z-28, T-Z-29)
6. **P2 S: flare mode และ ground mode** ตามความสูงใน `flare_mode.engage_RA` ของแต่ละแบบ (A321neo และ A330 100 ft) (ทดสอบ: T-Z-15 ถึง T-Z-17, T-Z-32)
7. **P2 S: input** แปลง keyboard ramp และ gamepad expo เป็น s ∈ [−1, 1] และคำนวณแรง sidestick สำหรับแถบแรงของหัวข้อ 7 (ทดสอบ: T-Z-30, T-Z-31)
8. **P3 M: กฎที่ลดระดับ** alternate, direct, abnormal attitude เป็นสถานการณ์ฝึก พร้อมข้อความ HUD ภาษาไทยและ USE MAN PITCH TRIM (ทดสอบ: T-Z-26 ถึง T-Z-28)
9. **P3 S: แถบความเร็ว** แสดง VLS, Vαprot, Vαmax จาก alpha_rule พร้อมป้าย "ค่าประมาณ" (ทดสอบ: T-Z-13, T-Z-14)
10. **P3 L: ปรับเทียบกับข้อมูลจริงเมื่อมี** เช่น ค่า α ตาม CONF ของ A321 และ A330 หรือข้อมูล FDR ใน [Z1][Z3][Z7] แล้วปรับ alpha_rule และ gain (ทดสอบ: T-Z-11, T-Z-12)

## บันทึกการตรวจทาน

ผู้ตรวจอิสระ (รอบที่ 3), วันที่ 2026-11-18 · สคริปต์ของผู้ตรวจ: `scripts/zrev_*.mjs`

ตรวจ 79 รายการ (มากกว่า 150 ตัวเลข) โดยเปิดแหล่งที่อ้างเอง (WebFetch/curl) และคำนวณซ้ำด้วย `zrev_testvals.mjs` (ผล `zrev_testvals_out.txt`) ตรวจ JSON ด้วย `zrev_json.mjs` และรัน `z_fbw_proto.mjs` ซ้ำ (ผลเหมือนเดิมทุกบรรทัด) สรุป: ตรง 65, แก้แล้ว 13, ยืนยันไม่ได้ 1

| รายการ | ค่าในรายงาน | ค่าจากแหล่ง | แหล่ง | ผล (ตรง / แก้แล้ว / ยืนยันไม่ได้) |
|---|---|---|---|---|
| ขีด nz clean / slat-flap | +2.5/−1 g; +2/0 g | "+2.5 g to -1 g for clean configuration and +2 g to 0 for other configurations" | [Z1] หน้า 32 | ตรง |
| อัตราหมุนสูงสุด | 15°/s | "maximum rate of 15°/s when the side-stick is at the stop" | [Z1] หน้า 32 | ตรง |
| มุมเอียง 33° / 67° / 45° (AoA) / 40° (HSP) | 33, 67, 45, 40° | ตรงทุกค่า | [Z1] หน้า 33 | ตรง |
| AP ตัดที่มุมเอียง | 45° | "If the bank angle exceeds 45°, the autopilot disconnects" | [Z1] หน้า 33 | ตรง |
| ขีด pitch 30°/−15°, FULL 25°, ความเร็วต่ำ 25°/20° | 30, −15, 25, 25/20 (ค่าความเร็วต่ำอ้าง Z22 กลาง) | Z1 หน้า 31–32 ให้ครบทั้งค่าความเร็วต่ำ ("progressively reduced to 25°/20° at low speed") | [Z1] | แก้แล้ว (เพิ่ม Z1, conf กลาง→สูง) |
| FD หายไป | 25° up / 13° down | ตรง | [Z1] หน้า 32 | ตรง |
| แรงดันผ่านล็อก AP | 5 daN / 3.5 daN | ตรง และอยู่ในบริบท "solenoid-operated detent locks both sidesticks" ขณะ AP ทำงาน | [Z1] หน้า 33–34 | ตรง |
| dual input / takeover latch | 2° / > 40 s | ตรง | [Z1] หน้า 35 | ตรง |
| yaw damper ใน alternate | ±5° | "limited to ±5° of rudder deflection" | [Z1] หน้า 33–34 | ตรง |
| low speed stability | 5–10 kt เหนือ stall warning | "from about 5 kts up to about 10 kts above stall warning speed" | [Z1] หน้า 34 | ตรง |
| Habsheim αprot/αmax/αfloor | 14.5/17.5/15° | ตรง; αfloor ทำงานเมื่อ RA > 100 ft; CONF 3 (slat 22 flap 20) | [Z8] §1.16.1.2, §1.11.4 | ตรง |
| flare law Habsheim | 50→30 ft, −2° ใน 8 s | "between 50 and 30 feet" … "to −2° in 8 seconds" | [Z8] §1.16.1.2 | ตรง |
| TOGA N1 | 83–84% ภายใน 5 s; เกณฑ์ 94% ใน 8 s | 83 และ 84% ที่ 5–5.4 s; 94% ที่ 8 s | [Z8] §1.16.2.2 | ตรง |
| เวลาเปลี่ยนเป็นกฎ α | ราว 1 s (เชิงอรรถ Z8) | เชิงอรรถ "the change of law is made in one second" ผูกกับช่วง 50–30 ft ของ flare ไม่ใช่ α protection | [Z8] §1.16.1.2 | แก้แล้ว |
| D-AXLA น้ำหนัก, VLS, Vαmax | 53.7 t, 123 kt, 107 kt | 53,700 kg (ประมาณการ), VLS 123/123.5 kt, 107 kt "corresponding to V alpha max" | [Z7] หน้า 18, 25, 48–49 | ตรง |
| D-AXLA THS nose-up stop | −11° | −4.4° → −11.2° "electric pitch-up stop"; หน้า 49 −11° | [Z7] หน้า 18, 49 | ตรง |
| D-AXLA อัตราลดความเร็ว | 123→99 kt, ราว −1.1 kt/s | 15:44:44 123 kt ถึง 15:45:05 99 kt = 24 kt/21 s = 1.14 kt/s | [Z7] หน้า 48–49 | ตรง |
| stall warning 23° (A320) | ใช้ใน alternate/direct | "triggered in normal law … reaches 23 degrees in landing configuration"; alternate/direct ขีดต่ำกว่า | [Z7] หน้า 30 | แก้แล้ว (ตาราง 3.8.5.3 + JSON) |
| stall warning 23° (A330) | ระดับสูงสุดลดตาม Mach | "In normal law, the threshold value … 23°"; ใน alt/direct แปรตาม Mach ไม่มีตัวเลข | [Z3] หน้า 21, [Z2] หน้า 44 | แก้แล้ว |
| QF72 elevator / nz / θ | +10.3°, −0.80 g, −8.4° | Table 7 "+10.3°", "−0.80 g", "8.4°" | [Z3] หน้า 3–4, 35 | ตรง |
| A330 AoA ทั่วไป, rudder | 1–10°; basic กลไก รุ่นหลัง FBW | ตรง | [Z3] หน้า 11, 20 | ตรง |
| AF447 ALT2 trigger, ความไวความเร็วต่อ α | 30 kt ใน 1 s; 25 kt/° cruise, 5 kt/° approach, 1.5° ที่ M 0.8 | ตรงทุกค่า | [Z2] หน้า 38, 44 | ตรง |
| abnormal attitude A330 | φ > 125°, ALT2 อำนาจ roll เต็ม ไม่มี auto-trim | ตรง (125° เป็น "ตัวอย่าง") | [Z2] หน้า 38–39 | ตรง |
| FBW A32NX pitch: ตารางคัน, P/D, Vm/Vco, THS −11, auto-trim | −2/0/+1.5 g; 13.5/0.5; 100; −11; 1.25 g, 30° | `{-2.0, 0.0, 1.5}`, `{13.5,13.5}`, `{0.5,0.5}`, 100.0 ทุกช่อง, `-11.0`, `nz_g < 1.25 && > 0.5 && \|Phi\| <= 30.0` | [Z19] (curl 18 พ.ย. 2026) | ตรง |
| FBW A32NX roll: ตารางอัตรากลับ, schedule gain | {33,66,71}/{33,45,66}/{0,40,50} → {0,15,20}; 0 ที่ ≤ 40 kt ถึง 1.4 ที่ ≥ 100 kt | ตรงทุกตาราง (`{0.0,40.0,100.0,180.0}` → `{0.0,0.0,1.4,1.4}`) | [Z20] | ตรง |
| FBW A32NX ELAC: α tables, ground/flight, abnormal | αprot CONF0 6.5/4.6 … FULL 10.6; αmax 8.7/6.4 … 13.0; θ > 8° หรือ RA > 400 ft; θ < 2.5° 5 s; α > 40/< −10, IAS < 60/> 440 kt, M > 0.91, φ > 125°, θ > 50/< −30 | ตรงทุกค่า | [Z21] ElacComputer.cpp บรรทัด 748–770, 960–962; _data.cpp บรรทัด 2145–2156 | ตรง |
| FAA EMB-550 g-limit | +2.5/−1.0 g retracted; +2.0/0.0 g extended | ตรง | [Z11] 79 FR 20769 | ตรง |
| XLR SC: entry rate, icing, back stick, turn, margin | 1 kt/s, 2 kt/s, 3 s, 30°, 3%/3 kt | ตรง; margin 3%/3 kt ใช้เฉพาะในน้ำแข็งเมื่อ protection ลดระดับ (d)(2)(ii) | [Z9] 89 FR 42790–42791 | ตรง (เพิ่มบริบทใน note) |
| XLR SC: stall warning ใน normal mode | ไม่จำเป็น | "(d)(1) … need not provide stall warning during normal operation" | [Z9] หน้า 42791 | ตรง |
| Vco ของ C* | 400 ft/s = 121.92 m/s = 237.0 kt ([Z17][Z18]) | [Z12] หน้า 3 "Vco ≈ 240kt"; [Z18] มีเพียงรายการอ้างอิง Malcom/Tobie D6-17841-T/N ไม่มีสมการหรือค่า Vco; 400 ft/s หาในแหล่งที่เข้าถึงได้ไม่พบ | [Z12], [Z18] | ยืนยันไม่ได้ (400 ft/s); ≈240 kt ตรง; แก้ข้อความแหล่งแล้ว |
| C* ของ Airbus มี integral, gain ตาม CAS, phugoid เป็นโพลจริงสองตัว | ตามข้อความ | "the gain for the integral pitch rate feedback path is a function of calibrated airspeed"; "phugoid conjugate-complex pole pair breaks up into two real poles [10]" | [Z12] หน้า 4 | ตรง |
| αfloor ตาม CONF (FCOM ผ่าน FBW docs) | 9.5/15/15/14/13° | "9.5° in CONFIG 0, 15° in CONFIG 1 and 2, 14° in CONFIG 3, 13° in CONFIG FULL" | [Z22] | ตรง |
| alpha floor: M 0.6, คัน 14° | M > 0.6 ห้าม, คัน > 14° | ตรง | [Z22] | ตรง |
| ECAM G LOAD | > 1.4 g หรือ < 0.7 g นาน > 2 s | ตรง | [Z22] | ตรง |
| HSP เริ่ม / AP ตัด | VMO+6 kt, MMO+0.01 (+0.015 ในอีกที่); AP ตัด VMO+15/MMO+0.04 | ตรง (หน้าเขียนทั้ง +0.01 และ +0.015) | [Z22] | ตรง |
| FD bars หายไปตามมุมเอียง | > 45° "ในโหมด AoA" | > 45° กลับมาเมื่อ < 40° ไม่ผูกกับโหมด AoA; [Z1] หน้า 33 ก็เขียน 45° | [Z22], [Z1] | แก้แล้ว |
| A330 sidestick travel | ±16° pitch, ±20° roll | "(±16° in pitch, ±20° in roll)" | [Z32] | ตรง |
| A330 HSP: 1.75 g, ND เป็นศูนย์ VMO+16/MMO+0.04, bank 45°, trim ตรึง | ตามรายงาน | "up to 1.75g … when exceeding VMO/MMO"; "smoothly reduced to zero at approximately VMO + 16/MMO + 0.04"; 67° → 45° | [Z32] | ตรง |
| A330 ALT stall warning | 1.03·VS1g | "replaced by stall warning at 1.03 VS1g" | [Z32] | ตรง |
| ชดเชยมุมเอียงถึง 33° | 33° | "Beyond 33° angle of bank, pitch compensation is no longer available" | [Z32] | ตรง |
| A330 flare mode 100 ft (ข้อความ "full authority direct law") | ตีความว่าเป็นบริบท alternate law, conf ต่ำ (ฟอรัม) | อยู่ในหัวข้อ Flare Mode ของ normal law; alternate law ของ A330 "reverts to direct law at 100 ft RA" | [Z32] | แก้แล้ว (conf ต่ำ→กลาง, ส่วนความขัดแย้งข้อ 9, 3.8.3.3, 3.8.6.2, 3.8.7.1, JSON a330_300) |
| แรง sidestick (breakout, pitch, roll out/in) | 1.1 lbf; 22.5 lbf ที่ ±16°; 5.6/7.8 lbf ที่ 20° | ตรง (โพสต์ "Max Angle" 15 ธ.ค. 2004 อ้างว่าคัดจากเอกสาร Airbus); อีกโพสต์ถามว่า "25 lbs fore and aft - 7 lbs lateral" ไม่มีแหล่ง | [Z27] | ตรง (conf ต่ำ คงเดิม) |
| A321neo flare / THS ตรึง | 100 ft; "does not compensate the ground or thrust effect" | ตรง (jaja 24 เม.ย. 2024 ยก FCOM) | [Z25] | ตรง |
| A321ceo THS ตรึง, −2° ใน 8 s | 50 ft; มี | "passes 50 ft RA, the THS is frozen"; "−2° nose down over a period of 8 s" | [Z25] | ตรง |
| ground → flight 5 s, flare 2 s (A330) | 5 s; 100 ft; 2 s | "a 5-second transition"; "engaged when the radar altimeter indicates 100 feet"; "2-second transition" | [Z33] | ตรง |
| เงื่อนไข auto-trim 33° และ 1.3 g | ไม่ทำงาน (ทั้งสองทิศ) | "prevents further trim up when … load factor exceeds 1.3g, or when the bank angle exceeds 33°" | [Z33] | แก้แล้ว (ห้ามเฉพาะ nose-up; conf ของ nz window ลดเป็นต่ำ) |
| direct law roll rate | 30°/s clean, 25°/s slat ออก | "Clean config – Roll rate 30o/sec, Slats extended – Roll rate 25o/sec" | [Z31] | ตรง |
| aural overspeed | VMO+4 kt / MMO+0.006 | "VMO +4 or MMO +0.006" (ไม่มีหน่วย แต่ต้องเป็น kt) | [Z31] | ตรง |
| HSP ND authority, bank 40° | ศูนย์ราว VMO+16 kt/MMO+0.04; 40° ปล่อยคันกลับ 0° | "smoothly reduces to zero"; "reduced from 67 ° to 40 °" | [Z31] | ตรง |
| direct law yaw | yaw damping และ turn coordination หายไป | "Yaw damping and turn coordination lost" | [Z31] | ตรง |
| flare เริ่มตามคำแนะนำ | 30 ft A320, 40 ft A330 | "around 30 ft RA (A220/A300/A310/A320) / 40 ft (A330/A340/A350/A380)"; "progressive and gentle back stick order until touchdown" | [Z24] | ตรง |
| US1549 αmax, α แตะน้ำ | 17.5°; 13–14° | "maximum AOA for this airplane weight and configuration (17.5°)"; "between 13° and 14°" (ยก NTSB) | [Z30] | ตรง (conf กลาง คงเดิม) |
| US1549 config | CONF 2 | "let's stay at two"; เชิงอรรถ 24 "CONF 2 … flaps 15°, slats 22°" | [Z5] หน้า 4, 11 | ตรง (เพิ่มแหล่ง) |
| US1549 α-protection: ปล่อยคันกลับ αprot, ไม่ stall | ตามข้อความ | "AOA returns to the alpha-protection threshold value and stays there"; "cannot be stalled in normal law" | [Z5] หน้า 12 | ตรง |
| เทอม phugoid damping | [Z6] finding 24 สูง | [Z6] ข้อ 24 พูดเพียง "sidestick inputs may be attenuated"; คำว่า phugoid damping มาจาก Aircraft Performance Study ที่ยกใน [Z30] | [Z6], [Z30] | แก้แล้ว (แยกแหล่ง, ระบุความเชื่อมั่น) |
| คำบรรยาย FBW ของผู้เขียน Airbus | "translated into vertical load factor demands"; "roll rate, sideslip, and bank angle objectives"; "inner loop of an autopilot" | ตรงทุกประโยค (§12.3.1.4) | [Z13] | ตรง |
| รูป A320 envelope: bank 65°, HSP VMO+6 kt | 65°, VMO+6 kt | รูป 12.6 "Bank angle 65", "Excessive speed (Vmo + 6 Kt)" | [Z13] | ตรง |
| คอมพิวเตอร์ A320 / A330 | 2 ELAC + 3 SEC; 3 PRIM + 2 SEC | §12.3.1.2 ตรง (A330/340 ใช้ชื่อ FCPC/FCSC); สำรองทางกล THS และ rudder §12.2 | [Z13], [Z3] หน้า 12 | ตรง |
| โค้ด PilotLaws ปัจจุบัน | φcmd = x·33° (บรรทัด 434), qCmd 7°/s, θHold −15…+18°, αstall − 3.5°, rudder −1.6β, DIRECT auto-trim ด้วย q | ตรงทุกค่า (`src/20-flight.js` 427–477; KEYMAP `90-app.js` 332); DIRECT: `c.de = -y*AC.deUp` เมื่อดึง คือ δe บวก = nose down สอดคล้องกับสมการ direct law | [Z35] | ตรง |
| ค่าจากหัวข้อ 3 | m 64,500, S 122.6, c 4.1935, Iyy 4.946e6, CLα 5.302, Cmα −1.38, Cmq −34.59, Cmδe −1.948, CLmax 1.31/2.88, VMO 350, Clp −0.509, τe 0.52 | ตรงทุกค่าใน `03-a320-a321.md` (บรรทัด 17–19, 105, 239, 492–549, 583); VLS/VS1g FULL 1.228–1.247 | [Z37] | ตรง |
| ค่าจากรอบที่ 1 | งบหน่วง 0.10 s; expo gamepad 0.5; ramp 0.5/s, คืนกลาง 2.5/s | ตรง (`06-controls.md` บรรทัด 13, 181; `11-input.md` บรรทัด 184, 482); สูตร expo (1−e)x + e·x³ ยืนยันด้วย T-I-01 f(0.5) = 0.2758 | [Z36] | ตรง |
| แปลงหน่วย (kt↔m/s, ft↔m, lbf↔N) ทุกค่าใน JSON | 121.92, 183.14, 188.29, 3.087, 7.717, 8.231, 2.572, 5.144, 12.861, 15.433, 30.867, 226.355, 0.514, 1.029, 1.543, 15.24, 9.144, 30.48, 121.9 m; 4.89, 100.1, 24.9, 34.7 N | ตรงทุกค่า (226.356 ปัดเป็น 226.355 ต่างกัน 0.001) | `zrev_testvals.mjs` | ตรง |
| T-Z-01, T-Z-02, 66.42°, r_cmd 5.313°/s | ตามตาราง | 2.5/1.75/0/−1; 2/1.5/0.5/0; 1.1547/1.1924/1.1924/0.9848; 66.42; 5.313 | `zrev_testvals.mjs` | ตรง |
| T-Z-13 αmax/αprot/αfloor และความเร็ว FULL | 12.38/9.38/9.88°; 105.1/112.5/118.1/119.3/129.3 kt | ตรงทุกค่า | `zrev_testvals.mjs` (CL0 FULL 1.369, CONF0 0.12 จาก [Z37]) | ตรง |
| CONF 0 ภายใต้ alpha_rule | αmax 11.06°, αprot 8.06° (ไม่ได้บอกความเร็ว) | Vαprot 191.7 kt = 1.23·VS1g (VS1g 155.9 kt) คือชน VLS | `zrev_testvals.mjs` | แก้แล้ว (เพิ่มข้อจำกัดใน 3.8.5.3) |
| T-Z-14 | 1.070, 0.873; ถ้า 1.28: 1.113, 0.8065 | 1.0700, 0.8734; 1.1135, 0.8065 | `zrev_testvals.mjs` | ตรง |
| T-Z-15, T-Z-18, T-Z-25, T-Z-30, T-Z-32 | ตามตาราง | ตรงทุกค่า | `zrev_testvals.mjs` | ตรง |
| T-Z-31 | s 0.3125, Δnz 0.469 | ตรงเมื่อ dead zone 0; ถ้าใช้ dead zone 0.04 ของรอบที่ 1 ได้ 0.2946 / 0.442 | `zrev_testvals.mjs` | แก้แล้ว (ระบุเงื่อนไข dead zone) |
| gain roll (Lp, Lu, Kφ, Kp, Ki) | −0.848, 0.335, 11.92, 7.01, 5.96 | −0.8478, 0.3354 (ρ 300 m 1.1901, Ixx 1.749e6, b 34.10), 11.92, 7.01, 5.96; ปิดลูปได้ 2ζωn 3.2 และ ωn² 4.0 | `zrev_testvals.mjs` | ตรง |
| q̄ และ sch | q̄ ≈ 2.9 kPa, sch ≈ 2.8 | 2889 Pa, 2.769 | `zrev_testvals.mjs` | ตรง |
| ผลต้นแบบ (T-Z-03–12, 16–17, 19–24) | ค่าในวงเล็บทุกกรณี | รัน `z_fbw_proto.mjs` ซ้ำ ผลเหมือน `z_fbw_proto_out.txt` ทุกบรรทัด (diff ว่าง) | [Z39] | ตรง |
| หน่วยของ kAa | "-" | kAa·nzα·α̇ ต้องมีหน่วย s เพื่อให้ได้ g | ตรวจมิติ | แก้แล้ว (u = "-, s, -") |
| บล็อก JSON (parse, คีย์บนสุด, leaf 7 ฟิลด์, src อยู่ในรายการอ้างอิง) | 6 บล็อก 108 leaf | parse ผ่านทุกบล็อก; พบ (1) `stick_to_dnz` ของ a320ceo est true แต่ conf สูง (2) `common_airliner.fbw` 4 leaf อยู่นอก path ที่หัวข้อ 8 เป็นเจ้าของ (schema-ext ข้อ 4) | `zrev_json.mjs` | แก้แล้ว (conf → กลาง; ย้าย 4 leaf เข้า `controls.fbw` ของ a320ceo/a321neo/a330_300 เหลือ 5 บล็อก 110 leaf ไม่มีข้อผิดพลาด) |
| เงื่อนไข alternate (with/without reduced protection) และ direct | รายการในตาราง 3.8.6.1 และ JSON `triggers` | ตรงทุกรายการ (G+Y hyd และ ADR ตัวที่สองที่ไม่ตรวจพบเองให้ yaw เป็นกลไก); direct: 3 IR, RA เสียเมื่อล้อลง, ALT + ล้อลง + AP off | [Z23] | ตรง |
| abnormal attitude thresholds | φ > 125°, θ > 50°/< −30°, α > 30–40°/< −10°, < 60–90 kt / > 440 kt, M > 0.91 | ตรงทุกค่า | [Z23] | ตรง |
| เงื่อนไข mechanical backup | แบตเตอรี่อย่างเดียว หรือ ELAC/SEC ทั้งหมดเสีย | [Z23]: emergency electrical ทำให้เฉพาะ yaw เป็นกลไก | [Z23], [Z13] §12.2 | แก้แล้ว |
| α protection latch, AP ตัด αprot + 1°, alpha floor M 0.6 | ตามรายงาน (ฟอรัม ต่ำ) | "AP will trip off at alpha prot + 1 deg (a320 ceo)"; "inhibited above M0.6"; "Alpha prot is a latching Condition" (ไม่มีตัวเลขการออก) | [Z26] | ตรง |
| FlightGear gain schedule | 140 และ 350 kt CAS; GPL-2.0 | ตาราง 140/350 kt ใน `a320-fbw.xml` บรรทัด 918–975; LICENSE เป็น GPL v2 | [Z34] | ตรง |
| FCPC ใช้ค่าเฉลี่ย AOA1/AOA2 หลังแก้ | ตามรายงาน | "revised algorithm … based AOAFCPC input on the average of AOA 1 and AOA 2" (ฉบับชั่วคราว ก่อนออกแบบใหม่) | [Z4] | ตรง |

### รายการที่แก้ในไฟล์ (ผู้ตรวจ 2026-11-18)

1. **ขีด pitch ที่ความเร็วต่ำ** (ตาราง 3.8.5.2, JSON `a320ceo…protections.pitch_limits`): เพิ่ม [Z1] หน้า 31–32 ซึ่งให้ทั้ง 25° (CONF 0–3) และ 25°→20° (FULL) ที่ความเร็วต่ำ จึงยก conf เป็นสูง
2. **เวลาเปลี่ยนเป็นกฎ α "ราว 1 s"** (3.8.5.3): เชิงอรรถใน [Z8] ผูกกับช่วงเปลี่ยนเป็นกฎ flare 50–30 ft ไม่ใช่ α protection จึงเปลี่ยนเป็น "ไม่พบในแหล่งสาธารณะ"
3. **stall warning 23°** (ตาราง 3.8.5.3, JSON `stall_warning_alpha_landing` ของ a320ceo และ `stall_warning_alpha_max` ของ a330_300): [Z7] หน้า 30 และ [Z3] หน้า 21 ระบุว่า 23° เป็นขีดใน **normal law** ส่วน alternate/direct ใช้ขีดที่ต่ำกว่า (A330 แปรตาม Mach [Z2] หน้า 44) เดิมเขียนกลับกัน
4. **แหล่งของ Vco 400 ft/s** (3.8.3.1, JSON `Vco`): [Z18] ไม่มีสมการหรือค่า Vco; [Z12] ให้ ≈ 240 kt ระบุว่า 400 ft/s ยืนยันจากแหล่งที่เข้าถึงได้ไม่ได้ (ค่าคงเดิมเพราะต่างกัน 1.3% และเป็นค่าประมาณอยู่แล้ว)
5. **FD bars หายไปที่ 45°** (ตาราง 3.8.4.1): ตัดคำว่า "(ในโหมด AoA)" ออก เพิ่มค่ากลับ 40° และ [Z1]
6. **flare mode ของ A330** (สรุป, 3.8.3.3, 3.8.6.2, 3.8.7.1, 3.8.9.1, ความขัดแย้งข้อ 9, JSON a330_300): [Z32] (A330/340 FCTM) เขียนในหัวข้อ Flare Mode ของ normal law ว่าที่ 100 ft กฎเป็น "full authority direct law with no auto-trim" บวกเทอม nose-down ข้อสรุปเดิมที่ว่าเป็นบริบท alternate law ผิด จึงยก conf ของ `engage_RA` เป็นกลาง เพิ่ม leaf `flare_mode.law_type` และเพิ่มว่า alternate law ของ A330 "reverts to direct law at 100 ft RA"
7. **เงื่อนไข auto-trim 33° และ 1.3 g** (3.8.3.2, JSON `autotrim_nz_window`, `autotrim_bank_max`, T-Z-28): [Z33] เขียนว่า "prevents further trim up" คือห้ามเฉพาะ nose-up; ขอบล่าง 0.5 g มาจากโมเดล [Z19] เท่านั้น ลด conf ของ `autotrim_nz_window` เป็นต่ำ
8. **US1549 phugoid damping** (3.8.5.3, ตาราง α): [Z6] ข้อ 24 พูดเพียงว่า input ถูกลดทอน คำว่า phugoid damping มาจาก Aircraft Performance Study ที่ยกใน [Z30] แยกแหล่งให้ชัด และเพิ่ม [Z5] สำหรับ CONF 2
9. **alpha_rule ใน CONF 0** (3.8.5.3): เพิ่มข้อจำกัดว่ากฎให้ Vαprot = 1.23·VS1g (ชน VLS) ใน clean
10. **T-Z-31**: ระบุว่า s = 0.3125 คือกรณีไม่มี dead zone และให้ค่าเมื่อใช้ dead zone 0.04 ของรอบที่ 1 (0.2946, Δnz 0.442 g)
11. **JSON**: `a320ceo…stick_to_dnz` conf สูง → กลาง (est true); หน่วย `alpha_mode_gains` เป็น "-, s, -"; ย้าย `common_airliner.fbw` (นอก path ที่หัวข้อ 8 เป็นเจ้าของ) เข้า `controls.fbw` ของ a320ceo (`protections.cert_nz_limits`, `sim.*`), a321neo (`protections.high_incidence_cert`) และ a330_300 (`sim.*`); note ของ `high_incidence_cert` ระบุข้อของ special condition และบริบทของ margin 3%/3 kt
12. **mechanical backup** (ตาราง 3.8.6.1): [Z23] บอกว่าไฟฟ้าแบตเตอรี่ทำให้เฉพาะ yaw เป็นกลไก ไม่ใช่ทั้งเครื่อง
13. ข้อความเล็กน้อย: คำอธิบาย [Z31] เรื่อง 2.5 g ทันที เทียบ "2 second delay" และข้อสังเกตเรื่องโพสต์ขัดแย้งใน [Z27] (ความขัดแย้งข้อ 11)

### ข้อสงสัยที่ยังเหลือ

- **Vco = 400 ft/s** ยืนยันจากแหล่งที่เข้าถึงได้ไม่ได้ ([Z17] ไม่ได้เข้าถึง) ใช้ได้ในฐานะค่าประมาณเท่านั้น
- **Vαmax 107 kt ของ D-AXLA** มาจากตารางความเร็วจำกัดของ BEA ขณะที่เซนเซอร์ AoA สองตัวค้าง ยังไม่ชัดว่าเป็นค่าทฤษฎีจากน้ำหนัก (ที่ BEA/Airbus คำนวณ) หรือค่าที่ PFD แสดง alpha_rule (0.873) ขึ้นกับตัวเลขนี้ทั้งหมด จึงคง conf ต่ำ และยังใช้กับ CONF 0 ไม่ได้ (ข้อ 9 ข้างบน)
- เงื่อนไข auto-trim (33°, 1.3 g, 0.5 g), A320neo/A321neo flare, แรง sidestick และ ground-mode 5 s มาจาก Wikipedia/ฟอรัม/โมเดลจำลองเท่านั้น ยังไม่มี FCOM ที่เข้าถึงได้
- จุดเริ่ม HSP ของ A320: [Z1] (ทางการ) เขียน "at/or above VMO/MMO" ส่วน [Z13][Z22] ให้ VMO + 6 kt ยังคงเลือก +6 kt ตามรายงาน (ความขัดแย้งข้อ 3)
- สมการ flare θref ของต้นแบบใช้กับ A320 เท่านั้น สำหรับ A330 ต้องเขียนกฎ direct + nose-down bias ใหม่ (ขนาด bias ไม่พบ)
- เลขหน้าของ [Z1] และ [Z8] อนุมานจากข้อความที่แยกจาก PDF (สำเนา OCR) ควรเทียบกับ PDF ต้นฉบับอีกครั้ง; [Z13] เป็นสำเนาไม่เป็นทางการ
- gain ทั้งหมดผ่านการตรวจบน point-mass + 1-DOF เท่านั้น (ผู้ตรวจรันซ้ำได้ผลเดิม) ต้องตรวจใหม่บน 6-DOF ตามงาน P1
