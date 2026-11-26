# 3.7 ระบบบังคับการบิน: 737 ไฮดรอลิกและ feel, ATR ระบบกลไกและ spoiler, actuator ของ Airbus

← [กลับไปหน้ารวมรอบที่ 3](../03-airliners.md) · [schema ส่วนขยาย](schema-ext.md) · [schema รายแบบ](schema.md)

หัวข้อนี้รวบรวม "ฮาร์ดแวร์" ของระบบบังคับการบินของเครื่องบินโดยสารที่บินที่ดอนเมือง ได้แก่ ระยะเคลื่อนของพื้นบังคับ อัตราของ actuator ระบบไฮดรอลิก ระบบ trim แรงที่คันบังคับ (feel) ตัวจำกัด rudder และการผสม spoiler กับ aileron กฎการบินแบบ fly-by-wire ของ Airbus (C*, protection, flare law) อยู่ในหัวข้อ 8 ส่วนหัวข้อนี้ให้เฉพาะตัวเลขของอุปกรณ์ที่กฎเหล่านั้นสั่งงาน

## 3.7.0 สรุปสั้น

- **737-800 เป็นระบบ irreversible ทั้งสามแกน** ไฮดรอลิก A และ B ราว 3,000 psi (20.7 MPa) ขับ aileron, elevator และ rudder ร่วมกัน ส่วน standby ขับเฉพาะ standby rudder PCU [Y7][Y14] ถ้า A และ B เสียทั้งคู่ elevator และ aileron เข้า manual reversion ผ่าน tab และต้องใช้แรงราว 60 lbf (267 N) ที่ column และ 40 lbf (178 N) ที่ wheel เพื่อเริ่มเปลี่ยนท่าทาง ส่วน rudder ไม่มี manual reversion [Y7]
- **Stabilizer ของ 737 มีช่วง 17.1° = 17.1 units** จาก 4.2° LE up ถึง 12.9° LE down และ 4 units = 0° จึงใช้สูตร δs = 4 − units (องศา, บวก = LE up = ก้มหัว) [Y2] อัตรา main electric flaps up 0.2°/s [Y3], flaps down 0.4°/s, autopilot 0.09/0.27°/s [Y6], speed trim flaps down 0.27°/s [Y1] ผลคือ mistrim 3 วินาทีตาม 14 CFR 25.255 เท่ากับ 0.6 unit ซึ่งตรงกับค่าที่ JATR รายงาน [Y3][Y31]
- **Elevator 737 เคลื่อนที่ 50°/s** ตามปกติ [Y14] แรงที่ column มาจาก elevator feel computer ที่ใช้แรงดัน feel 180 psi (ฐาน) ถึง 1,400 psi (สูงสุด) ตาม q̄ จาก elevator pitot และตำแหน่ง stabilizer [Y5] รายงาน ET302 ให้แรงที่ต้องดึง 90 ถึง 110 lbf และคำนวณได้ถึง 180 lbf เมื่อ stab mistrim ที่ความเร็วสูง [Y4]
- **Rudder ของ 737 (ข้อมูล 737-300 จาก NTSB)** เคลื่อนได้ ±26° (stop ที่ pedal 28°) อัตรา 66°/s เมื่อ slide ทั้งสองทำงาน (33°/s เมื่อ primary อย่างเดียว) pedal 1 in ต่อ 6.5° เต็ม 4 in แรง 9 ถึง 70 lbf trim ±16° ที่ 0.5°/s และ yaw damper ±3° ที่ 50°/s [Y7][Y9]
- **ATR 72 เป็นระบบกลไก (cable) ทั้งหมด ยกเว้น roll spoiler** [Y18] elevator 23° ขึ้น 13° ลง ที่ column 11.25°/6.75° (อัตราทดราว 2:1) [Y19] aileron ±14° ที่ wheel ±65° และ balance tab ±4° roll spoiler ข้างละแผ่นเริ่มกางเมื่อ aileron ขึ้นเกิน 2.5° และเพิ่มเชิงเส้นถึง 57° ที่ aileron 14° [Y17]
- **TLU ของ ATR จำกัด rudder จาก 27° เหลือราว 3° ต่อข้างเหนือ 185 KIAS** และกลับเป็น low-speed เมื่อ ADC ต่ำกว่า 180 kt ใช้เวลาเคลื่อน actuator 15 s (auto) หรือ 30 s (manual) [Y17][Y21] กลไก pitch uncoupling แยก elevator ซ้ายขวาเมื่อมีแรงตรงข้ามกัน 50 ถึง 55 daN ต่อคัน [Y18]
- **A320**: elevator 30° ขึ้น 17° ลง, THS 13.5° nose up 4° nose down [Y24]; แรงที่ปลดล็อก sidestick และปลด AP เมื่อ AP ทำงาน 5 daN (pitch) และ 3.5 daN (roll) [Y24] (ไม่ใช่ breakout ของการบินด้วยมือ ซึ่งไม่พบ); ตาราง rudder travel limiter 25° ที่ ≤ 160 kt ลดเหลือ 3.4° ที่ ≥ 380 kt [Y28]; speedbrake lever ครึ่งทาง 25° เต็ม 40°, ground spoiler 50° [Y28]
- **A330-300**: elevator 30° ขึ้น 15° ลง, THS 14° nose up 2° nose down [Y25] AF447 บันทึก THS เลื่อน 3° ถึง 13° ใน 1 นาที (เฉลี่ย 0.17°/s) [Y26]
- **โมเดลที่เสนอ**: actuator แบบ lag อันดับหนึ่งกับ rate limit ต่อพื้นบังคับ, feel ของ 737 แบบ F = Fbo + K(p_feel)·|δ|, blowdown ของ rudder 737 แบบ δmax = 26°·min(1, q̄b/q̄) ที่คาลิเบรตให้ 21° ที่ 190 KCAS, ตาราง RTL ของ Airbus, ตาราง spoiler mixing ต่อแบบ และ trim แบบ THS (737, Airbus) หรือ tab (ATR) ค่าทดสอบทั้งหมดมาจาก `y_controls.mjs` และผู้ตรวจคำนวณซ้ำด้วย `yrev_controls.mjs` (T-Y-02, T-Y-11, T-Y-13, T-Y-27 แก้ตามบันทึกการตรวจทาน)
- **ช่องว่างที่สำคัญ**: จำนวนรอบ trim wheel ต่อ unit ของ 737, ระยะเคลื่อนของ elevator และ aileron 737 จากเอกสารปฐมภูมิ, อัตรา THS ของ A320, ตาราง rudder limiter ของ A330, อัตรา pitch trim ของ ATR ไม่พบในแหล่งสาธารณะ จึงใส่เป็นค่าประมาณพร้อมวิธี

## 3.7.1 สภาพปัจจุบันใน AirfieldLab และสิ่งที่ขาด

โค้ดปัจจุบัน (`src/20-flight.js`) มีพื้นบังคับสามตัวที่จำกัดมุมด้วยค่าคงที่ใน `AC` (บรรทัด 111: `deUp` 22°, `deDn` 15°, `daMax` 20°, `drMax` 25°) และจำกัดอัตราแบบ slew อย่างเดียว (บรรทัด 243 ถึง 245: elevator 70°/s, aileron 80°/s, rudder 60°/s) trim ทำโดยเลื่อน `trimDe` ของ elevator (บรรทัด 468 ถึง 469) ไม่มี stabilizer แยก ไม่มี spoiler ไม่มีระบบไฮดรอลิก ไม่มี feel และไม่มีตัวจำกัด rudder ตามความเร็ว รอบที่ 1 หัวข้อ 6 ([06-controls.md](../01-flight-physics/06-controls.md)) วางโครง `controls.pitch/roll/yaw` สำหรับระบบกลไกแบบ reversible และเสนอ `kind: 'feel' | 'fbw'` ไว้ให้รอบนี้เติม

สิ่งที่ต้องเพิ่มเพื่อให้เครื่องบินโดยสารบินสมจริง:
1. **ชนิดสถาปัตยกรรมต่อแกน** (`controls.architecture`) เพื่อเลือกว่าแรงที่คันมาจาก hinge moment (ATR), feel unit (737) หรือสปริงคงที่ของ sidestick (Airbus)
2. **Stabilizer/THS เป็นพื้นบังคับแยก** ที่มีอัตรา trim ตามโหมดและช่วงมุมจริง แทนการ bias elevator
3. **Spoiler** ที่ผสมกับ roll และเป็น speedbrake/ground spoiler (แรงยกและแรงต้านอยู่ใน `aero.spoilers` ของบัตรข้อมูลรายแบบ)
4. **Actuator** ที่มีทั้ง lag และ rate limit ต่อพื้นบังคับ และ blowdown ของ rudder 737
5. **ตัวจำกัด rudder ตามความเร็ว** (TLU ของ ATR, RTL ของ Airbus, pressure reducer ของ 737)
6. **ตัวแสดงแรงบนเว็บ** ที่ใช้แรงจาก feel model ของแต่ละแบบ แทนการแสดงตำแหน่งคันอย่างเดียว

## 3.7.2 ภาพรวมสถาปัตยกรรมของสามตระกูล

| แกน | 737-800 | ATR 72-600 | A320/A321 (ceo, neo) | A330-300 |
|---|---|---|---|---|
| pitch | column ต่อผ่าน cable ไปยัง elevator PCU สองตัว (A, B) + elevator feel computer (q-feel) [Y7][Y14][Y5] | column ต่อผ่าน cable/push-pull rod ไปยัง elevator กลไกสองชิ้น ต่อกันด้วย pitch uncoupling mechanism [Y18] | sidestick สั่ง ELAC/SEC สั่ง elevator actuator (B/G ซ้าย, B/Y ขวา) [Y28] | sidestick สั่ง PRIM/SEC (3 + 2) [Y25] |
| roll | wheel สั่ง aileron PCU (A, B) + flight spoiler 4 แผ่นต่อปีก [Y7][Y16] | wheel ต่อผ่าน cable ไปยัง aileron กลไก + geared balance tab; roll spoiler ไฮดรอลิกข้างละแผ่น [Y17] | sidestick สั่ง aileron (B/G) + roll spoiler 2 ถึง 5 [Y28] | sidestick สั่ง aileron + spoiler (ไม่ได้ค้นในรอบนี้) |
| yaw | pedal สั่ง main rudder PCU (A, B) + standby PCU; feel and centering unit; yaw damper แบบ series [Y7] | pedal ต่อผ่าน cable ไปยัง rudder กลไก + TLU [Y17] | pedal สั่ง rudder ทางกล (ceo) + FAC: yaw damper, trim, RTL; actuator G/B/Y [Y27][Y28] | รุ่นพื้นฐานกลไก รุ่น enhanced เป็น FBW [Y25] |
| trim | stabilizer ด้วยมอเตอร์ไฟฟ้า (main electric, autopilot) + trim wheel กลไก [Y2][Y5] | tab ไฟฟ้าที่ elevator, aileron (balance tab ซ้าย), rudder [Y17] | THS ด้วยมอเตอร์ไฮดรอลิก G และ Y + trim wheel กลไก [Y28] | THS (อัตราไม่พบ) |
| แรงที่คันบังคับ | feel computer ตาม q̄ และตำแหน่ง stab; EFS ×2 (NG/MAX) [Y5][Y6] | hinge moment จริงผ่าน cable [Y17] | สปริงคงที่ของ sidestick ไม่ขึ้นกับ q̄; เมื่อ AP ทำงานคันถูกล็อกด้วย solenoid detent และต้องใช้ 5/3.5 daN เพื่อปลด [Y24] | เหมือน A320 |
| `controls.architecture` | `{pitch:"feel", roll:"feel", yaw:"feel", trim:"ths"}` | `{pitch:"reversible", roll:"reversible", yaw:"reversible", trim:"tab"}` | `{pitch:"fbw", roll:"fbw", yaw:"feel", trim:"ths"}` | `{pitch:"fbw", roll:"fbw", yaw:"feel", trim:"ths"}` |

หมายเหตุ: yaw ของ A320ceo ใส่เป็น `feel` เพราะ pedal ต่อกับ rudder ทางกลและมีสปริง feel โดย FAC ทำ yaw damper, trim และ RTL ผ่าน actuator [Y27] ส่วน A320neo และ A321neo ก็ใช้ rudder กลไกเช่นกัน: Safety First ของ Airbus จัด "A320 family aircraft (except A321 XLR)" ไว้ในกลุ่ม rudder กลไก [Y27] (ผู้ตรวจยืนยัน 18 พ.ย. 2026) จึงใช้ค่าของ ceo ผ่าน `_inherits` ได้ ยกเว้น A321XLR ที่มี rudder ไฟฟ้า (ไม่มีในฝูงบินที่ดอนเมืองตามบัตรหัวข้อ 3)

## 3.7.3 Boeing 737-800

ตัวเลขหลายตัวในส่วนนี้มาจากรายงานของ 737-300 (NTSB AAR-99/01) และ 737 MAX (KNKT, EAIB, FAA, JATR) เพราะไม่มีเอกสารสาธารณะของ 737-800 ที่ให้รายละเอียดระดับนี้ ระบบ elevator, stabilizer และ rudder ของ 737 ทุกรุ่นมีโครงสร้างเดียวกัน (PCU ไฮดรอลิก, stabilizer แบบ jackscrew, feel computer) แต่ค่าเชิงตัวเลขบางตัวต่างกันได้ จึงลดความเชื่อมั่นเป็น "กลาง" เมื่อใช้ค่าของรุ่นอื่นกับ -800

### 3.7.3.1 ระบบไฮดรอลิก

| ระบบ | แรงดัน | ขับอะไร (ตามที่แหล่งระบุ) | แหล่ง / ความเชื่อมั่น |
|---|---|---|---|
| A | ราว 2,950 psi (20.3 MPa) ต่อระบบ, PCU 3,000 psi (20.7 MPa) | aileron, rudder (main PCU), elevator, ล้อ, nosewheel steering | [Y7] §1.6.2 (737-300), [Y14] §1.6.3.4 (737-800) · สูง |
| B | เท่ากับ A | aileron, rudder (main PCU), elevator, trailing edge flaps | [Y7] · สูง |
| Standby | ราว 2,950 psi (NTSB ให้ค่านี้กับทั้งสามระบบ) | standby rudder PCU (และใน FCOM คือ LE devices แบบสำรอง ซึ่งยังไม่ได้ยืนยันในรอบนี้) | [Y7] · สูง (ส่วน rudder) |
| การแบ่ง flight spoiler ระหว่าง A กับ B และ ground spoiler | ไม่พบในแหล่งที่เปิดได้ | โมเดล FlightGear แบ่ง spoiler เป็นกลุ่ม A และ B และให้ทุกพื้นบังคับต้องมีแรงดัน ≥ 1,500 psi จึงทำงาน | [Y15] · ต่ำ |

สำหรับเครื่องจำลอง ให้แต่ละพื้นบังคับมีรายการระบบที่ขับ (`hydraulic_systems`) และกฎง่าย ๆ ว่า PCU ทำงานเมื่อมีระบบใดระบบหนึ่งมีแรงดัน ถ้าเหลือ PCU ตัวเดียว ให้ลดแรง actuator ครึ่งหนึ่ง (ผลต่อ blowdown) และคงอัตราไว้ (ค่าประมาณ เพราะไม่พบข้อมูลอัตราเมื่อเหลือระบบเดียว) เมื่อ A และ B เสียทั้งคู่ elevator และ aileron เข้า manual reversion (3.7.3.6)

### 3.7.3.2 Elevator และ elevator feel computer

- **อัตรา**: ปกติ 50°/s รายงาน LN-DYM บันทึกว่า elevator ตอบสนองเพียง 0.2°/s คือ 1:250 ของปกติเมื่อ input crank ติดน้ำแข็ง [Y14] ใช้ 50°/s เป็น `rate_dps` (สูง)
- **ระยะเคลื่อน**: ไม่พบในแหล่งปฐมภูมิ โมเดล FlightGear 737-800YV ใช้ช่วง −0.336 rad ถึง +0.3875 rad (19.3° และ 22.2°) [Y15] ทิศของแต่ละค่าในโมเดลตีความเองว่า 22.2° เป็นขอบท้ายขึ้น จึงเป็นค่าประมาณ (ต่ำ) ค่านี้ใกล้กับ `deUp` 22° ของโค้ดปัจจุบัน
- **Elevator down-rig**: elevator ถูกตั้งให้ลง 4° เมื่อ stabilizer อยู่ที่ 4 units (ตำแหน่งกลาง) [Y5] และ FCC ทำ neutral shift ตาม flap และตำแหน่ง stab สำหรับ CG หน้า [Y5] สองเรื่องนี้ไม่จำเป็นสำหรับเครื่องจำลองตอนนี้
- **Feel computer**: แรงดัน feel แปรระหว่าง 180 psi (base feel) ถึง 1,400 psi (สูงสุด) โดยรับ q̄ จาก elevator pitot บนหางดิ่งและตำแหน่ง stabilizer [Y5] รุ่น MAX มี EFSM ที่ใช้แรงดัน 850 psi จากระบบ A ทำให้แรงดึงเป็นสี่เท่าที่ AoA 8 ถึง 11° ตามตำแหน่งแฟลป [Y5] ส่วน Elevator Feel Shift ของ NG ทำให้แรงที่ column "approximately doubles" ตามข้อความจากคู่มือ 737 NG ที่ผู้แสดงความเห็น (Andy, 5 เม.ย. 2019) ยกมาในช่องความเห็นของ [Y6] (ไม่ใช่คำของ Lemme เอง จึงความเชื่อมั่นต่ำถึงกลาง) และไฟ EFS ติดเมื่อทำงานต่อเนื่องเกิน 30 s [Y2]
- **แรงที่บันทึกได้จริง**: KNKT บันทึกแรงดึง 65, 82 และ 93 lbf ที่ column [Y2]; ET302 ให้ "more than 90 lbs", คำนวณได้ "up to 110 lbs" และในช่วงท้าย "up to 180 lbs" [Y4]; LN-DYM รวมสองคน 174 lbf [Y14]
- **Autopilot**: แรงที่ทำให้ AP เข้า CWS 10 lbf [Y7] และแรงที่ทำให้ AP ปลด > 25 lbf เมื่อใช้ช่องเดียว และ > 50 lbf เมื่อใช้สองช่อง [Y14]

**โมเดล feel ที่เสนอ (ค่าประมาณ)**

```
p_feel(q̄) = clamp(180 + kq · q̄, 180, 1400)            [psi]   q̄ ใน Pa จาก elevator pitot (ใช้ q̄ ของเครื่อง)
K(q̄)      = Kmax · p_feel(q̄) / 1400                     [lbf ต่อองศา elevator]
F_col     = f_EFS · (sign(δe) · Fbo + K(q̄) · δe)          f_EFS = 2 เมื่อ EFS ทำงาน, 1 ปกติ (คูณทั้งแรง ตามข้อความ "doubles control column forces" และตรงกับ T-Y-13)
```

- `kq` = 0.06511 psi/Pa เลือกให้ p_feel ถึง 1,400 psi ที่ VMO 340 KCAS (q̄ 18.74 kPa; ในหน่วย SI kq = 448.9 Pa/Pa) เพราะไม่พบความเร็วที่แรงดันอิ่มตัวจริง
- `Kmax` = 13.63 lbf/deg (60.6 N/deg) คาลิเบรตจาก ET302: ที่ความเร็วตั้งแต่ราว 340 KCAS ขึ้นไป (ET302 p.18 ให้ 110 lbf ในช่วงหลัง 05:43:21 ที่ stab ลดจาก 2.3 เหลือราว 1 unit และความเร็วเพิ่มต่อจนถึง 500 kt ตอนจบ จึงเกิน VMO แต่ p_feel อิ่มตัวแล้ว Kmax จึงไม่เปลี่ยน) แรงคำนวณ 110 lbf เมื่อต้องถือ elevator ราว 7.8° เพื่อหักล้าง stab ที่ MCAS เลื่อนลง 3.5 units (7.8° = 3.5°/τ_e โดยใช้ τ_e = 0.45 ซึ่งเป็นค่าประมาณ)
- `Fbo` = 4 lbf (17.8 N) เลือกเอง เพราะไม่พบ breakout ของ column 737
- ผลที่ได้ (สคริปต์ `y_controls.mjs`): ที่ 150 KCAS แรงดัน feel 417.5 psi และแรง 24.3 lbf เมื่อ δe 5°, ที่ 250 KCAS 839.6 psi และ 44.9 lbf ที่ δe 5° ซึ่งอยู่ในกรอบ 25.143(d) (75 lbf สองมือ) [Y30]
- ฟังก์ชันของตำแหน่ง stab ใน feel computer ไม่พบรูปแบบ จึงยังไม่ใส่ (ตัวคูณ 1)

### 3.7.3.3 Stabilizer trim

| รายการ | ค่า | แหล่ง / ความเชื่อมั่น |
|---|---|---|
| ช่วงกลไก | 4.2° LE up ถึง 12.9° LE down รวม 17.1° = 17.1 units | KNKT §1.6.5.3 p.47 [Y2] · สูง |
| ตำแหน่ง 0° | 4 units | [Y2] และ ET302 fn3 [Y4] · สูง |
| ช่วงที่แสดงบน indicator | −0.2 ถึง 16.9 units (สอดคล้องกับ 4.2° และ 12.9° เมื่อใช้ 1 unit = 1°) | บันทึกทุติยภูมิ [Y16] · ต่ำ (KNKT [Y2] p.47 เขียนว่า indicator ที่ 0 = stab LE up สุด และ ET302 [Y4] fn3 ให้ 0 ถึง 17 units จึงขัดกับ −0.2 ที่ปลายนี้ ดูข้อ 4 ของความขัดแย้ง) |
| ขอบ main electric เมื่อ flaps up | ราว 3.9 ถึง 14.5 (ผู้เขียนเขียนเป็น degrees แต่น่าจะเป็น units) | Lemme [Y6] · ต่ำ |
| main electric flaps up | 0.2°/s | JATR p.19 [Y3] · สูง |
| main electric flaps down | 0.4°/s | คำตอบของ P. Lemme ใน [Y6] · กลาง |
| autopilot flaps up / flaps down | 0.09 / 0.27°/s | [Y6] · กลาง |
| Speed Trim flaps down (และ MCAS ของ MAX) | 0.27°/s | FAA RTS p.23 [Y1], JATR p.14 [Y3] · สูง |
| MCAS (737 MAX เท่านั้น ไม่มีใน -800) | ไม่เกิน 2.5° ต่อครั้งที่ Mach ต่ำ | [Y1] · สูง |
| Mach trim | ทำงานเหนือ M 0.615 โดยเลื่อนจุดกลางของ elevator ไม่ใช่ stab | NSIA §1.16.7.4 [Y14], [Y5] · สูง |
| Speed trim (STS) | ทำงานระหว่าง 100 kt ถึง M 0.60, 10 s หลัง take-off, 5 s หลังปล่อยสวิตช์ trim, AP off | บันทึกทุติยภูมิ [Y16] · ต่ำ (หน้าเดียวกันมีรายการที่สองที่เขียน "Speed < Mach 0.68" จึงขัดกันเอง) |
| AP trim | สั่ง trim เมื่อคำสั่ง elevator อยู่ระหว่าง 10 % ถึง 25 % ของ authority ช่วงหนึ่ง หยุดเมื่อต่ำกว่า 2 %; ไม่สั่ง nose-down ต่ำกว่า RA 60 ft | [Y5] · กลาง |
| Manual trim wheel | จำนวนรอบต่อ unit และแรงที่ wheel **ไม่พบในแหล่งสาธารณะ** | ใช้ 0.1°/s เป็นค่าประมาณ (ครึ่งหนึ่งของ main electric flaps up) |

**จลนศาสตร์ของ stabilizer ที่เสนอ**

```
units(t+dt) = clamp(units + dir · rate(mode, flaps) · dt, lim_lo(mode, flaps), lim_hi(mode, flaps))
δs [deg]    = 4 − units          (บวก = LE up = โมเมนต์ก้มหัว ตรงกับทิศ elevator บวก = ขอบท้ายลง ของรอบที่ 1)
rate        = 0.2 (main elec, flaps up), 0.4 (main elec, flaps down), 0.09 / 0.27 (AP), 0.27 (STS flaps down), 0.1 (manual, est) °/s
```

1 unit = 1° ดังนั้นอัตราเป็น °/s เท่ากับ units/s ใช้ข้อมูลจริงตรวจได้สองจุด: KNKT บันทึก trim ลดจาก 6.1 เป็น 3.8 units ในราว 10 s ระหว่าง AND อัตโนมัติ (0.23 units/s) [Y2] และ ET302 ให้ MCAS ทำงาน 9 s และพา stab ไปที่ 2.1 units [Y4] หลัง AP trim ไปที่ 4.6 units ได้ 0.278 units/s ซึ่งตรงกับ 0.27°/s ส่วนเกณฑ์ 25.255 ให้ทดสอบ mistrim เท่ากับการ trim 3 วินาทีที่อัตราปกติ [Y31] ที่ 0.2°/s ได้ 0.6 unit ตรงกับที่ JATR บอกว่าเครื่องผ่านการทดสอบที่ "0.6 unit nose-down out-of-trim condition" [Y3]

ผลต่อการบิน: stab เต็มช่วงกลไกที่ 0.2°/s ใช้ 85.5 s (ช่วง electric flaps up 3.9 ถึง 14.5 units ใช้ 53 s) และที่ 0.4°/s ใช้ 42.8 s ดังนั้นผู้เล่นต้อง trim ต่อเนื่องหลายวินาทีหลังเปลี่ยนแฟลปหรือความเร็ว ซึ่งต่างจากการ trim elevator ของโค้ดปัจจุบันมาก

### 3.7.3.4 Aileron, flight spoiler และ speedbrake

- **Flight spoiler**: 4 แผ่นต่อปีก (รวม 8) ทำงานร่วมกับ aileron เมื่อหมุน wheel เกินราว 10° และเกือบเต็มเมื่อเกิน 70° [Y16] (บันทึกทุติยภูมิ ความเชื่อมั่นต่ำ)
- **ตาราง mixing ของโมเดล 737-800YV** [Y15] (wheel เป็นค่าปรับมาตรฐาน −1 ถึง 1, มุม spoiler ฝั่งที่ขึ้น): เริ่มที่ 0.126 (แผ่นกลุ่ม high) และ 0.149 (กลุ่ม low), 3.1° ที่ 0.23, 10.1° ที่ 0.483, 18.0° ที่ 0.69, 25.8° ที่ 0.839, 33° ที่ราว 0.9 ขึ้นไป ค่าต่ำสุดที่ wheel 0.5 คือ 10.7° (low) และ 12.6° (high) ตารางนี้ดูเหมือนอ่านจากกราฟของผู้ผลิตแต่ไม่ระบุที่มา จึงเป็นค่าประมาณ
- **Aileron**: โมเดลเดียวกันใช้ −0.358 rad (20.5° ขึ้น) ถึง +0.271 rad (15.5° ลง) ที่ wheel เต็ม และมี droop 1.04° ที่ wheel กลาง [Y15] ระยะจากเอกสารปฐมภูมิไม่พบ
- **Speedbrake**: lever มี DOWN, ARMED, FLIGHT DETENT และ UP; ห้ามใช้ในอากาศต่ำกว่า 1,000 ft RA; ground spoiler กางอัตโนมัติเมื่อ RA < 10 ft และล้อหลักหมุนเกิน 60 kt [Y16] โมเดล 737-800YV ให้ flight spoiler 25° ที่ lever 0.65 และ 33° ที่ lever เต็ม แผ่นในสุดถึง 38° และกาง 0 ถึงเต็มใน 0.6 s [Y15] มุม ground spoiler เต็มไม่พบ
- แรงยกและแรงต้านที่ spoiler สร้างอยู่ใน `aero.spoilers` ของบัตร 737 (หัวข้อ 2) หัวข้อนี้ให้เฉพาะมุมตามคำสั่ง

### 3.7.3.5 Rudder, rudder pressure reducer และ yaw damper

ข้อมูลจาก NTSB AAR-99/01 pp. 26 ถึง 28 (737-300) [Y7] และเอกสารของ Boeing ที่ FAA เผยแพร่ [Y9]:

| รายการ | ค่า |
|---|---|
| ระยะ rudder จาก main PCU | ±26° (stop เชิงกลของ pedal ตั้งไว้ที่ rudder 28°) |
| อัตรา | 66°/s (slide หลักและรอง), ราว 33°/s (slide หลักอย่างเดียว ไม่มีแรงลม) [Y9] |
| แรงของ main PCU | ราว 5,900 lbf (26.2 kN) |
| pedal | 1 in ต่อ rudder 6.5°, เต็มราว 4 in (0.10 m) |
| แรง pedal | feel and centering unit ให้ราว 9 ถึง 70 lbf ตามระยะจากกลาง; full rudder ราว 70 lbf (311 N) |
| เกินจุด blowdown หรือ jam | ราว 300 lbf ต่อ in ที่เพิ่ม |
| rudder trim | ±16° อัตราราว 0.5°/s |
| yaw damper | ±3° อัตรา 50°/s; stop เชิงกลจำกัด 3° และไม่ขยับ pedal [Y9] |
| blowdown ที่สภาพของ USAir 427 (ราว 190 kt, flaps 1) | 14° ถึง 21° ตาม sideslip [Y9] |

**Rudder pressure reducer/limiter**: หลังอุบัติเหตุ USAir 427 และ UA 585 FAA สั่งติดอุปกรณ์จำกัดแรงดันของ rudder (AD 97-14-03) ที่ทำงาน "at flight conditions where full rudder authority is not required" [Y10] สำหรับ 737 รุ่นเก่า (Classic) ตัวลดแรงดันทำงานกับ**ระบบ A เท่านั้น** (ด้าน system A ของ main rudder PCU) โดยลดแรงดันเมื่อสูงเกิน 1,000 ft AGL ขาขึ้นและ 700 ft AGL ขาลง ตาม ETEB [Y12] p.1-4 (AD 99-11-05 [Y11] เขียน "below 750 feet during landing" จึงเป็นความต่างเล็กน้อยระหว่างเอกสาร FAA สองฉบับ) ส่วน NG ใช้ความเร็วเป็นเกณฑ์ [Y12] แหล่งให้แรงดันที่ลดแล้วต่างกัน: NTSB ให้ 3,000 เป็น 1,000 psi (737-300) [Y7] บันทึกที่อ้าง Watts และ Brady ให้ 1,800 psi และลด authority ราวหนึ่งในสาม [Y13] ความเร็วที่ NG เริ่มลดแรงดัน **ไม่พบในแหล่งสาธารณะ**

**โมเดล blowdown ที่เสนอ (ค่าประมาณ)**: rudder หยุดที่มุมที่ hinge moment เท่ากับแรงสูงสุดของ PCU เมื่อสัมประสิทธิ์ hinge moment คงที่ มุมนี้แปรผกผันกับ q̄

```
δr,max(q̄, p_A) = 26° · min(1, f_PCU · q̄b / q̄)
f_PCU     = (1 + p_A / p_full) / 2        (ระบบ A และ B ให้แรงราวครึ่งละ 3,000 lbf [Y7] p.29; ตัวลดแรงดันลดเฉพาะระบบ A [Y12])
q̄b = 4,726 Pa (≈ 171 KCAS) คาลิเบรตให้ δr,max = 21° ที่ 190 KCAS เมื่อ β = 0
```

ผลจาก `y_controls.mjs`: 26° ที่ 150 KCAS, 21.0° ที่ 190, 12.1° ที่ 250, 9.7° ที่ 280, 6.6° ที่ 340 KCAS ถ้าแรงดันระบบ A ลดเป็น 1,000 psi (f_PCU = 0.667 คือ authority ลดราวหนึ่งในสาม ตรงกับ [Y13]) จะได้ 8.1° ที่ 250 KCAS และถ้า 1,800 psi (f_PCU = 0.8) ได้ 9.7° (สคริปต์ผู้ตรวจ `yrev_controls.mjs`; ฉบับก่อนตรวจคูณ p/p_full กับแรงของ PCU ทั้งตัวจึงได้ 4.0° และ 7.3° ซึ่งผิด เพราะระบบ B ไม่ถูกลดแรงดัน) ค่า 9.7° ที่ 280 KCAS ใกล้กับ "around ±8 degrees at a typical cruise altitude" ใน [Y13] รุ่นที่ดีกว่าควรใส่ผลของ β (hinge moment จาก sideslip ทำให้ blowdown ลดเหลือ 14°) ผ่าน Ch_β ของรอบที่ 1 ซึ่งยังไม่มีค่าของ 737

**หมายเหตุสำหรับหัวข้อ 2**: บัตร 737 ใช้ δr,max 26° ในการประมาณ VMCG/VMCA ซึ่งยืนยันแล้วจาก [Y7][Y8] (ที่ความเร็วต่ำกว่า q̄b ไม่มี blowdown)

### 3.7.3.6 Manual reversion

เมื่อระบบ A และ B เสียทั้งคู่ elevator และ aileron ถูกบังคับด้วยมือผ่าน tab (elevator tab และ aileron balance tab) NTSB ระบุว่าต้องใช้แรงราว 40 lbf ที่ wheel เพื่อเริ่ม roll และราว 60 lbf ที่ column เพื่อเริ่มเปลี่ยน pitch ส่วน rudder ไม่มี manual reversion แต่ใช้ standby hydraulic ได้ [Y7] ในเครื่องจำลองให้ทำโหมดนี้เป็นแบบ reversible ของรอบที่ 1 โดยใช้ breakout ใหญ่ (178 N, 267 N) และอัตรา elevator/aileron ต่ำ (ค่าประมาณ 15°/s) ตัวเลขแรงต่อมุมระหว่าง manual reversion **ไม่พบในแหล่งสาธารณะ**

### 3.7.3.7 สรุปค่าที่ใช้ทำ feel บนเว็บ

| ปริมาณ | ค่า (SI) | ค่า (หน่วยการบิน) | ความเชื่อมั่น |
|---|---|---|---|
| column breakout | 17.8 N | 4 lbf | ต่ำ (เลือกเอง) |
| column gradient ที่ 250 KCAS | 36.3 N ต่อองศา elevator | 8.2 lbf/deg | ต่ำ (คาลิเบรต) |
| pedal | 40 N ถึง 311 N บนระยะ 0.10 m | 9 ถึง 70 lbf บน 4 in | กลาง (ค่า 737-300 สูง ใช้กับ -800 จึงกลาง) |
| wheel breakout / เต็ม | 13 N / 110 N | 3 / 25 lbf | ต่ำ (เลือกเอง) |
| AP CWS / ปลด AP | 44.5 N / 111 N (ช่องเดียว) / 222 N (สองช่อง) | 10 / 25 / 50 lbf | สูง |

## 3.7.4 ATR 72-600

ATR 72 ทุกรุ่น (-200, -500, -600) ใช้ระบบบังคับกลไกแบบเดียวกัน ตัวเลขจาก NTSB (ATR 72-212 ปี 1994) [Y17] จึงใช้กับ -600 ได้ แต่ลดความเชื่อมั่นเป็น "กลาง" สำหรับค่าที่อาจเปลี่ยนตาม modification ตัวเลขจาก ATSB [Y18][Y19] เป็นของ ATR 72-212A (-600) โดยตรง

### 3.7.4.1 Pitch

| รายการ | ค่า | แหล่ง / ความเชื่อมั่น |
|---|---|---|
| สถาปัตยกรรม | column ต่อ elevator ด้วย cable, pulley, push-pull rod และ bell crank; ทุกพื้นบังคับเป็นกลไกยกเว้น spoiler | ATSB interim p.4 [Y18] · สูง |
| elevator | 23° nose up ถึง 13° nose down | ATSB second interim p.2 [Y19] · สูง |
| column | 11.25° nose up ถึง 6.75° nose down; stop เพิ่มที่ 13.25°/8.75° | [Y19] · สูง |
| อัตราทด column ต่อ elevator | ราว 1 ต่อ 2 (23/11.25 = 2.04, 13/6.75 = 1.93) | [Y19] และคำนวณ · สูง |
| pitch uncoupling mechanism (PUM) | สปริงระหว่าง elevator ซ้ายขวา แยกเมื่อแรงตรงข้าม 50 ถึง 55 daN (112 ถึง 124 lbf) ที่คันทั้งสองพร้อมกัน หรือผลต่างรวมราว 100 ถึง 110 daN | interim p.5, p.15 [Y18] · สูง |
| ความยืดหยุ่นของระบบ | ที่ VMO ผู้ผลิตคำนวณว่าคันต่างกัน 6.8° ให้ elevator ต่างกัน 8.5° | [Y19] · สูง |
| แรงที่บันทึกในการทดสอบรับรอง | 62 daN และ 56 daN (ซ้าย/ขวา) เป็นค่าสูงสุดที่บันทึกในการทดสอบที่ราว 154 kt; ผลต่าง elevator สูงสุด 34° (ซ้าย −23° ขวา 11°) ในการทดสอบเดียวกัน แหล่งไม่ได้บอกว่าแรงสูงสุดเกิดพร้อมมุมนั้น | [Y19] p.7 · สูง |
| stick pusher | ดัน column ไปที่ 8° nose down | NTSB §1.6.4 [Y17] · สูง |
| VMO | 250 kt | ATSB final [Y20] · สูง |
| pitch trim | tab ไฟฟ้าที่ elevator มีทั้ง normal และ standby; ช่วงมุมและอัตรา **ไม่พบในแหล่งสาธารณะ** | ค่าประมาณ 0.5°/s ของ tab |

**การแปลงเป็นพารามิเตอร์ reversible ของรอบที่ 1** (`controls.pitch.*`, ค่าประมาณ): ใช้สมการ hinge moment ของรอบที่ 1 หัวข้อ 6.2 กับเรขาคณิตที่ประมาณ S_e 3.5 m² (0.30 ของ S_h 11.73 m² จาก หัวข้อ 3.1), c_e 0.48 m, แขนด้ามจับ column 0.55 m จึงได้ gearing = 2.04/0.55 = 3.717 rad/m ค่า Ch_δ ยังผล (รวมผลของ tab) = −0.0519 /rad เลือกให้แรงที่ใช้ถือ elevator เต็ม 23° ที่ 154 kt เท่ากับ 50 daN ที่คันเดียว ซึ่งอยู่ระดับเดียวกับ 56 ถึง 62 daN ของการทดสอบรับรองและแรงแยกของ PUM ผลจากสคริปต์: elevator 5° ที่ 200 KCAS ต้องใช้ 18.3 daN และที่ 250 KCAS 28.7 daN ค่าทั้งหมดนี้เป็นค่าประมาณ ความเชื่อมั่นต่ำ และควรแทนด้วยค่า stick force per g เมื่อหาได้ (ข้อสังเกตของผู้ตรวจ: แรง 56 ถึง 62 daN ของการทดสอบรับรองวัดขณะ elevator ซ้ายขวาแยกกัน แต่ละคันจึงขับ elevator เพียงข้างเดียว ส่วนการคาลิเบรตนี้ให้คันเดียวขับ S_e ทั้งสองข้าง ถ้าเทียบกันตรง ๆ |Ch_δ| ยังผลอาจต่ำไปถึงสองเท่า (0.104 แทน 0.052) ค่าที่แท้จริงอยู่ในช่วงนี้และควรตรวจกับค่าแรงที่นักบินรายงาน)

**PUM ในเครื่องจำลอง**: ใช้เป็นเงื่อนไขของเหตุการณ์ (ถ้า |F_left − F_right| ≥ 100 daN และแรงตรงข้ามทิศ ให้ elevator ซ้ายขวาแยกกัน; ATSB p.15 ระบุว่าในเหตุการณ์ VH-FVR กลไกแยกที่ผลต่างราว 75 daN ซึ่งต่ำกว่าค่าออกแบบ 100 ถึง 110 daN ผลของแรงเฉื่อยและแรงอากาศพลศาสตร์ระหว่างบินทำให้ค่าที่วัดที่คันต่างจากค่าทดสอบบนพื้น เกณฑ์ 100 daN จึงเป็นค่าออกแบบ ไม่ใช่ค่าที่ต้องเกิดจริง) ไม่จำเป็นต้องจำลองในโหมดผู้เล่นคนเดียว แต่ใช้เป็นกรณีทดสอบเพื่ออธิบายเหตุการณ์ VH-FVR ได้

### 3.7.4.2 Roll

| รายการ | ค่า | แหล่ง / ความเชื่อมั่น |
|---|---|---|
| aileron | ±14° (ออกแบบ), ไม่มีไฮดรอลิก, cable | NTSB §1.6.3 และ fn16 [Y17] · สูง |
| wheel | ±65° | [Y17] · สูง |
| balance tab (geared) | ±4° | [Y17] · สูง |
| tension regulator ของ cable | 20 ถึง 25 daN | [Y17] · สูง |
| aileron trim | มอเตอร์ไฟฟ้าต่อกับ balance tab ด้านซ้าย; อัตราไม่พบ | [Y17] · สูง (ชนิด) |
| แรงที่ wheel | ออกแบบให้น้อยกว่า 60 lbf (267 N) ตาม 25.143/25.147; DFDR ตั้งธงเมื่อแรงเกิน 22 lbf | [Y17] · สูง |
| roll spoiler | ข้างละแผ่น actuator ไฮดรอลิก เริ่มกางที่ aileron ขอบท้ายขึ้น 2.5° และเชิงเส้นถึง 57° ที่ aileron 14° | NTSB p.19 [Y17] · สูง |
| autopilot | AP ปลดเมื่ออัตรา aileron เกิน 3.6°/s | [Y17] · สูง |

**Spoiler mixing ของ ATR**

```
δsp = 0                                  เมื่อ δa,up ≤ 2.5°
δsp = 57° · (δa,up − 2.5°) / (14° − 2.5°)  เมื่อ 2.5° < δa,up ≤ 14°   (ความชัน 4.957 deg/deg)
```

กางเฉพาะปีกที่ aileron ขึ้น ผลจากสคริปต์: aileron 8° ให้ spoiler 27.3° และ 14° ให้ 57° ATR ไม่มี ground spoiler และไม่มี speedbrake ตามที่บัตร ATR (หัวข้อ 1) ระบุ

**การแปลงเป็นพารามิเตอร์ reversible** (ค่าประมาณ): อัตราทด aileron ต่อ wheel 14/65 = 0.2154 rad/rad หารรัศมี wheel 0.18 m ได้ gearing 1.197 rad/m; S_a 1.5 m² ต่อข้าง c_a 0.45 m; Ch_δ ยังผล −0.0667 /rad เลือกให้ aileron เต็มที่ VMO 250 KCAS ใช้ 60 lbf พอดี (ขอบบนของเกณฑ์ออกแบบ) ผลที่ 150 KCAS เต็ม aileron คือ 21.6 lbf และ aileron 7° ที่ 180 KCAS คือ 15.6 lbf

### 3.7.4.3 Yaw และ TLU

| รายการ | ค่า | แหล่ง / ความเชื่อมั่น |
|---|---|---|
| rudder (low speed mode) | ±27° | NTSB §1.6.3.1 [Y17] · สูง (ATR 72-212), กลาง สำหรับ -600 |
| TLU high speed mode | ราว ±3° (6° รวม) เหนือ 185 KIAS; AAIB: เข้า high speed เมื่อ ADC **ทั้งสองตัว** บอกเกิน 185 kt | [Y17] · สูง; AAIB [Y21] และ EASA AD 2025-0004 [Y22] ยืนยัน 185 kt |
| กลับเป็น low speed | เมื่อ ADC อย่างน้อยหนึ่งตัวบอกต่ำกว่า 180 kt | AAIB p.16 [Y21] · สูง |
| เวลาเคลื่อน actuator ของ TLU | ราว 15 s (auto), ราว 30 s (manual override) | AAIB pp.16 ถึง 17 [Y21] · สูง |
| override switch | full authority หลังกดราว 15 s | [Y17] · สูง |
| rudder trim | tab; อัตราไม่พบ | ค่าประมาณ |
| ATR 42 | TLU ที่ 195 kt | [Y22] · สูง |

**TLU ในเครื่องจำลอง**: เก็บสถานะ `tluPos` ที่วิ่งเชิงเส้นระหว่าง 0 (low speed) และ 1 (high speed) ด้วยอัตรา 1/15 ต่อวินาที เปลี่ยนเป้าเมื่อ IAS > 185 kt (ไป high; ของจริงต้องเป็น ADC ทั้งสองตัว) หรือ IAS < 180 kt (ไป low; ADC ตัวใดตัวหนึ่ง) ทำให้มี hysteresis 5 kt แล้วใช้ `δr,max = 27° + (3° − 27°)·tluPos` การเคลื่อนเชิงเส้นเป็นค่าประมาณ (แหล่งให้เฉพาะเวลารวม) ที่ 7.5 s หลังเริ่มขึ้นสู่ high speed จะได้ 15°

### 3.7.4.4 ไฮดรอลิก แฟลป และ gust lock

- ATSB ยืนยันว่ามีเฉพาะ spoiler ที่ใช้ไฮดรอลิก [Y18]; สีของระบบที่ขับ spoiler และแรงดันระบบของ ATR **ไม่ได้ยืนยันในรอบนี้**
- แฟลปและเวลาเคลื่อน (`aero.flaps.transition_time_s`) เป็นของบัตร ATR (หัวข้อ 1)
- gust lock ของ ATR เป็นคันล็อกกลไกบน pedestal ตัวเลขไม่จำเป็นสำหรับเครื่องจำลอง (ไม่ได้ค้นในรอบนี้)

## 3.7.5 Airbus A320/A321 และ A330

กฎการบิน (normal, alternate, direct law, protection, flare mode) อยู่ในหัวข้อ 8 (`controls.fbw`) หัวข้อนี้ให้เฉพาะขีดจำกัดของพื้นบังคับ actuator และ inceptor

### 3.7.5.1 A320 family

| รายการ | ค่า | แหล่ง / ความเชื่อมั่น |
|---|---|---|
| elevator | 30° nose up, 17° nose down | KNKT QZ8501 §1.6.5.1 [Y24] · สูง |
| THS | 13.5° nose up, 4° nose down | [Y24] · สูง |
| aileron | ±25° (ค่าคงที่ในโมเดล ELAC ของ FlyByWire) | [Y28] · ต่ำ |
| spoiler | 5 แผ่นต่อปีก; speedbrake ตาม lever 0, 2° ที่ 0.051, 25° ที่ 0.5, 40° ที่เต็ม; ground spoiler 50° | SEC data ของ FlyByWire [Y28] · กลาง |
| rudder travel limiter | ตาราง IAS 100, 160, 200, 240, 320, 380, 400 kt ให้ 25, 25, 14.5, 8.8, 4.8, 3.4, 3.4° | FAC data ของ FlyByWire [Y28] · กลาง; KNKT: ECAM "RUD WITH CARE ABV 160 KT" เมื่อ RTL ค้างที่ low speed [Y24] |
| Safety First | ตำแหน่ง pedal 16 % "equivalent to the rudder travel limit at 290 kt" (A320) | [Y27] · สูง (ตีความเชิงตัวเลขไม่ได้ เพราะไม่รู้ฐานของเปอร์เซ็นต์) |
| yaw damper ใน alternate law | ±5° | KNKT §1.6.5.2 [Y24] · สูง |
| แรงปลด sidestick ที่ถูกล็อกเมื่อ AP ทำงาน | 5 daN (11.2 lbf) pitch, 3.5 daN (7.9 lbf) roll: "When the autopilot is engaged, a solenoid-operated detent locks both sidesticks in the neutral position" แล้วเมื่อแรงเกินค่านี้ "the stick becomes free and the autopilot disengages" | KNKT §1.6.5.3 p.33 [Y24] · สูง (ฉบับก่อนตรวจเรียกค่านี้ว่า breakout ของการบินด้วยมือ ซึ่งผิด) |
| sidestick breakout และ gradient ขณะบินด้วยมือ | **ไม่พบในแหล่งสาธารณะ** | ค่าประมาณให้หัวข้อ 8 (`controls.fbw.sidestick`) |
| sidestick travel | ราว ±16° pitch, ±20° roll (อนุมานจากค่าสูงสุดที่ FDR บันทึก) | [Y24] Fig. 28/29 · กลาง |
| dual input | เตือนเมื่อคันทั้งสองเบี่ยงเกิน 2° พร้อมกัน | [Y24] · สูง |
| ไฮดรอลิก | aileron B+G; elevator ซ้าย B+G ขวา B+Y; rudder G+B+Y; THS มอเตอร์ G+Y; spoiler 1, 5 = G, 2, 4 = Y, 3 = B | โมเดล FlyByWire [Y28] (`hydraulic/mod.rs`: actuator 0, 4 อยู่ใน green, 1, 3 ใน yellow, 2 ใน blue) · กลาง |
| elevator double pressurization | ELAC สั่งให้ actuator สองตัวรับแรงเมื่อคำสั่งเกิน 30° (< 180 kt) ลดเหลือ 6° (≥ 400 kt) | [Y28] · ต่ำ (รายละเอียดของโมเดล) |
| rudder trim | ±20° (ค่าคงที่ในโมเดล FAC); อัตราไม่พบ | [Y28] · ต่ำ |
| อัตรา actuator ของ elevator, aileron, rudder, THS | **ไม่พบในแหล่งสาธารณะ** | ค่าประมาณ: 40°/s (elevator, aileron, rudder), THS 0.17°/s จาก AF447 |

**RTL ในเครื่องจำลอง**: `δr,max(V) = interp(kcas, [100,160,200,240,320,380,400], [25,25,14.5,8.8,4.8,3.4,3.4])` ใช้ IAS เหมือน FAC ผลจากสคริปต์: 19.75° ที่ 180 kt, 8.3° ที่ 250 kt, 6.3° ที่ 290 kt, 4.1° ที่ 350 kt

ข้อมูลของ A300-600 จาก NTSB ช่วยให้เห็นความรู้สึกของ pedal ในระบบ variable stop ของ Airbus: ต่ำกว่า 165 kt rudder ±30° ใช้ pedal ราว 4.0 in และแรงราว 65 lbf; ที่ 250 kt จำกัด ±9.3° ใช้ pedal ราว 1.3 in แรงราว 32 lbf; breakout ราว 22 lbf; ดังนั้นที่ความเร็วสูงแรงเหนือ breakout เพียง 10 lbf ก็ได้ rudder เต็ม [Y29] ค่าแรงและระยะ pedal ของ A320 เอง **ไม่พบในแหล่งสาธารณะ**

### 3.7.5.2 A321

ไม่พบตัวเลขฮาร์ดแวร์ที่ต่างจาก A320 ในแหล่งสาธารณะที่เปิดได้ บัตร A321 (หัวข้อ 3) สืบค่าจาก A320neo และ A320ceo ผ่าน `_inherits` ดังนั้นค่าของ `a320ceo.controls` ในหัวข้อนี้จะถูกใช้กับ A321 ด้วยโดยอัตโนมัติ ถ้าพบตาราง RTL หรือมุม speedbrake ของ A321 ภายหลังให้เขียนเฉพาะ leaf ที่ต่างไว้ใต้ `a321neo.controls`

### 3.7.5.3 A330-300

| รายการ | ค่า | แหล่ง / ความเชื่อมั่น |
|---|---|---|
| elevator | 30° nose up, 15° nose down | ATSB AO-2008-070 §1.6.3 [Y25] · สูง |
| THS | 14° nose up, 2° nose down | [Y25] · สูง |
| คอมพิวเตอร์ | 3 PRIM + 2 SEC | [Y25] · สูง |
| rudder | รุ่นพื้นฐานกลไก รุ่น enhanced FBW | [Y25] fn25 · สูง |
| THS ใน AF447 | 3° ถึง 13° nose up ในราว 1 นาที แล้วค้างที่ 13° จนจบ | BEA §1.1 [Y26] · สูง (ค่าเฉลี่ย 0.17°/s เป็นค่าคำนวณ) |
| rudder travel limiter, spoiler, aileron, sidestick | **ไม่พบในแหล่งสาธารณะ** ในรอบนี้ | ใช้ของ A320 ไม่ได้ (เครื่องใหญ่กว่า) |

## 3.7.6 แบบจำลองสำหรับเครื่องจำลอง

### 3.7.6.1 Actuator

```js
// DOM-free, ทำนอก RK4 ครั้งเดียวต่อก้าว 240 Hz (สถานะ δ ไม่อยู่ใน state vector ตามรอบที่ 1 หัวข้อ 9)
function actuate(d, cmd, s, dt, ctx) {          // s = controls.surfaces.<x>.v
  const lim = limitsFor(s, ctx);                 // travel (ตาม RTL/TLU/blowdown ด้วย)
  const c = clamp(cmd, -lim.neg, lim.pos);
  const v = clamp((c - d) / s.actuator_tau_s, -s.rate_dps, s.rate_dps);   // first-order + rate limit
  return d + v * dt;
}
```

- ถ้า `actuator_tau_s` = 0 (เช่น stabilizer) ให้ใช้ rate limit อย่างเดียว
- เวลาถึง 90 % ของคำสั่งขั้นบันได (Euler 240 Hz): elevator 737 10° ด้วย τ 0.05 s และ 50°/s ได้ 0.196 s; 20° ได้ 0.362 s; rudder 737 20° ที่ 66°/s ได้ 0.279 s; elevator A320 10° ที่ τ 0.06 s และ 40°/s ได้ 0.242 s ค่าเหล่านี้อยู่ในกรอบ time delay ระดับ 1 ของรอบที่ 1 (0.10 s) ส่วนที่เป็นการหน่วงจริงคือ τ เท่านั้น
- ระบบกลไก (ATR) ไม่มี actuator: ใช้ rate limit สูง (60 ถึง 80°/s) เฉพาะเพื่อกันอินพุตกระโดด

### 3.7.6.2 Feel และแรงที่คัน

```
reversible (ATR, ตามรอบที่ 1 สมการ 6.2):  F = Fbo·sign(x) + q̄·S·c·(Chδ·δ + Chα·α_t + Chtab·δtab)·G / arm
feel (737):                                F = Fbo·sign(δ) + K(q̄)·δ ;  K(q̄) = Kmax·clamp(180 + kq·q̄, 180, 1400)/1400 (pitch)
                                            pedal: F = 40 N + 2,671 N/m · |x_pedal|  (x ≤ 0.1016 m), เกินจุด blowdown เพิ่ม 52.5 kN/m
fbw sidestick (Airbus):                    F = Fbo·sign(x) + K_s·x (สปริงคงที่; Fbo และ K_s ของการบินด้วยมือไม่พบ ให้หัวข้อ 8)
                                            AP engaged: คันล็อกที่กลาง จน |F| > 50 N (pitch) หรือ 35 N (roll) แล้ว AP ปลดและคันเป็นอิสระ [Y24]
```

ทุกแบบส่งออก `Fs` (N), `Fs/Fmax` และสถานะ in-trim ให้ HUD ตามรอบที่ 1 หัวข้อ 6.6

### 3.7.6.3 Trim

- **ths (737, Airbus)**: trim คือพื้นบังคับแยกที่มีมุม `δs` และอัตราตามโหมด (ตาราง 3.7.3.3 สำหรับ 737; Airbus normal law เป็น auto-trim ที่หัวข้อ 8 สั่ง โดยหัวข้อนี้ให้ช่วง 13.5°/−4° และอัตราประมาณ 0.17°/s) แรงที่คันขึ้นกับ δe ที่ต้องถือ ไม่ใช่ตำแหน่ง trim โดยตรง ผู้เล่นจึงต้อง trim ให้ δe กลับใกล้ศูนย์
- **tab (ATR)**: trim เปลี่ยน δtab ซึ่งทำให้ hinge moment เป็นศูนย์ที่ δe ใหม่ (รอบที่ 1 หัวข้อ 6.4) อัตรา tab 0.5°/s เป็นค่าประมาณ

### 3.7.6.4 ตัวจำกัด rudder ตามความเร็ว

```
737:     δr,max = 26° · min(1, f_PCU · q̄b / q̄),  q̄b = 4,726 Pa, f_PCU = (1 + p_A/p_full)/2 = 0.667 เมื่อ pressure reducer ทำงาน (ระบบ A 1,000 psi ตาม NTSB; ระบบ B เต็ม)
ATR:     δr,max = 27° + (3° − 27°)·tluPos,  tluPos เคลื่อน 1/15 s⁻¹ ไปทาง 1 เมื่อ IAS > 185 kt และไปทาง 0 เมื่อ IAS < 180 kt
A320:    δr,max = interp(IAS, RTL table)  (FAC เคลื่อนแบบ rate limit; อัตราไม่พบ)
```

### 3.7.6.5 Spoiler mixing และ speedbrake

- 737: `δsp,roll = table(|wheel_norm|)` ฝั่งที่ aileron ขึ้น บวกกับ `δsp,sb = interp(lever, [0, 0.65, 1], [0, 25, 33])` แล้ว clip ที่ 33° (แผ่นใน 38°) ฝั่งที่ roll ลงให้ลบค่า roll ออกจาก speedbrake (ตามโครงของโมเดล 737-800YV)
- ATR: สมการ 3.7.4.2 ไม่มี speedbrake
- A320: speedbrake ตาม lever (ตาราง SEC) roll spoiler ใช้แผ่น 2 ถึง 5 ส่วนมุมสูงสุดของโหมด roll ไม่พบ ให้ใช้ค่าประมาณ 35° และให้ roll spoiler ฝั่งลดลงตัดจาก speedbrake แบบเดียวกับ 737
- ground spoiler: 737 กางเต็มอัตโนมัติเมื่อ RA < 10 ft และล้อหมุนเกิน 60 kt; A320 50° (เงื่อนไข arm ให้หัวข้อ 8/10)

### 3.7.6.6 ตัวแสดงแรงบนเว็บ (force cue)

ไม่มี force feedback บนเว็บ จึงให้แถบแรงสามแกนที่มีขีดตาม 14 CFR 25.143(d) [Y30]: pitch 44.5 N (10 lbf ระยะยาว), 222.4 N (50 lbf มือเดียว), 333.6 N (75 lbf สองมือ); roll 22.2 N, 111.2 N, 222.4 N; yaw 89.0 N (20 lbf ระยะยาว) และ 667.2 N (150 lbf) สำหรับ 737 ถ้าแรงคงค้างเกิน 44.5 N นานกว่า 3 s ให้ขึ้นเตือน "ควร trim" สำหรับ Airbus แถบแรงแสดงเฉพาะแรงสปริงของ sidestick เพราะ normal law ทำ auto-trim

## ค่าพารามิเตอร์ (JSON)

บล็อกด้านล่างสร้างและตรวจด้วย `scripts/y_json.mjs` (98 leaf) แต่ละบล็อกมีคีย์บนสุดคีย์เดียว และเขียนเฉพาะ `controls.*` ที่ไม่ใช่ `controls.fbw` (เจ้าของ: หัวข้อ 7) กับ `common_airliner.controls` ข้อตกลงที่ใช้:

- มุมเป็นองศาตามที่ระบุใน `u` (ตามแนวของรอบที่ 1 สำหรับ `stops`), แรงเป็น N, แรงดันเป็น Pa, ความยาวเป็น m; ค่า lbf, psi, in อยู่ใน `note` หรือในเนื้อหา
- `rate_dps` ของ stabilizer/THS คือ °/s ของมุม stab; สำหรับ 737 เท่ากับ units/s
- `controls.surfaces.*.travel_deg` ใช้ `up/down` ของขอบท้าย (elevator, aileron), `LE_up/LE_down` (stab 737), `nose_up/nose_down` (THS) และ `left/right` (rudder)
- ตารางใช้รูป `{"axes":{…},"data":[…]}`
- A320neo, A321ceo และ A321neo ได้ค่าจาก `a320ceo.controls` ผ่าน `_inherits` ของบัตรหัวข้อ 3 จึงไม่มีบล็อกแยก หัวข้อนี้ไม่เขียน `_inherits` หรือ `_na` เพราะเป็นของบัตรรายแบบ
- `controls.inceptors.sidestick` เป็นค่าฮาร์ดแวร์ (breakout, ระยะ) แยกจาก `controls.fbw.sidestick` ของหัวข้อ 8 เพื่อไม่ให้ path ชนกัน

```json
{
 "b737_800": {
  "controls": {
   "architecture": {"v":{"pitch":"feel","roll":"feel","yaw":"feel","trim":"ths"},"u":"-","scope":"aircraft","src":["Y7","Y14"],"conf":"สูง","est":false,"note":"PCU ไฮดรอลิก irreversible ทุกแกน + feel unit; stabilizer ปรับด้วยมอเตอร์ไฟฟ้า/สายเคเบิล (trim wheel); manual reversion ผ่าน tab ของ elevator และ aileron"},
   "hydraulics": {"v":{"nominal_Pa":20684271,"A":["aileron","elevator","rudder_main_PCU","landing_gear","nosewheel_steering"],"B":["aileron","elevator","rudder_main_PCU","trailing_edge_flaps"],"standby":["rudder_standby_PCU"]},"u":"Pa; รายการพื้นบังคับ","scope":"aircraft","src":["Y7","Y14"],"conf":"สูง","est":false,"note":"ราว 2,950 to 3,000 psi (NTSB AAR-99/01 §1.6.2 ของ 737-300; NSIA 2015/01 ของ 737-800: PCU 3,000 psi). รายการเป็นส่วนที่ NTSB ระบุ; การแบ่ง flight spoiler A/B, ground spoiler (A) และ LE devices (B, standby สำรอง) ไม่ได้ยืนยันในรอบนี้"},
   "surfaces": {
    "elevator": {"v":{"travel_deg":{"up":22.2,"down":19.3},"rate_dps":50,"actuator_tau_s":0.05,"hydraulic_systems":["A","B"]},"u":"deg, deg/s, s","scope":"aircraft","src":["Y14","Y15","Y6"],"conf":"ต่ำ","est":true,"note":"อัตรา 50°/s จาก NSIA (สูง); มุมจากโมเดล FlightGear 737-800YV (−0.336/+0.3875 rad, ทิศ up/down ตีความเอง); tau เลือกเอง; ขับด้วย PCU สองตัว"},
    "stabilizer": {"v":{"travel_deg":{"LE_up":4.2,"LE_down":12.9},"units":{"min":-0.2,"max":16.9,"neutral":4},"rate_dps":{"main_elec_flaps_up":0.2,"main_elec_flaps_down":0.4,"ap_flaps_up":0.09,"ap_flaps_down":0.27,"speed_trim_flaps_down":0.27},"actuator_tau_s":0,"hydraulic_systems":[]},"u":"deg, units, deg/s","scope":"aircraft","src":["Y2","Y3","Y1","Y6","Y16"],"conf":"กลาง","est":false,"note":"1 unit = 1° (ช่วงรวม 17.1° = 17.1 units, 0° = 4 units ตาม KNKT); flaps-up main electric 0.2°/s (JATR, สูง); flaps-down 0.4 และ AP 0.09/0.27 จากคำตอบของ P. Lemme (กลาง); STS flaps-down 0.27 (FAA, สูง); jackscrew ขับด้วยมอเตอร์ไฟฟ้าและสายเคเบิลจาก trim wheel"},
    "aileron": {"v":{"travel_deg":{"up":20.5,"down":15.5},"rate_dps":50,"actuator_tau_s":0.05,"hydraulic_systems":["A","B"]},"u":"deg, deg/s, s","scope":"aircraft","src":["Y15","Y7"],"conf":"ต่ำ","est":true,"note":"มุมจากตาราง aileron ของโมเดล 737-800YV (−0.358/+0.271 rad ที่ wheel เต็ม); อัตราและ tau เลือกเท่า elevator เพราะไม่พบ"},
    "roll_spoiler": {"v":{"travel_deg":{"up":33},"inboard_up_deg":38,"rate_dps":55,"actuator_tau_s":0.05,"panels_per_wing":4,"hydraulic_systems":["A","B"]},"u":"deg, deg/s, s","scope":"aircraft","src":["Y15","Y16"],"conf":"ต่ำ","est":true,"note":"flight spoiler 4 แผ่นต่อปีก; 33° ที่ wheel เต็มและ speedbrake เต็ม, แผ่นในสุด clip 38° ในโมเดล; อัตรา = 33° ใน 0.6 s ของโมเดล"},
    "ground_spoiler": {"v":{"panels_per_wing":2,"rate_dps":55,"hydraulic_systems":["A"]},"u":"-, deg/s","scope":"aircraft","src":["Y15"],"conf":"ต่ำ","est":true,"note":"มุมเต็มไม่พบในแหล่งสาธารณะ; โมเดลขยับจาก 0 ถึง 1 ใน 0.6 s; จำนวนแผ่นและระบบ A ยังไม่ยืนยัน"},
    "rudder": {"v":{"travel_deg":{"left":26,"right":26},"pedal_stop_deg":28,"rate_dps":{"dual_slide":66,"primary_only":33},"actuator_tau_s":0.05,"pcu_force_N":26245,"hydraulic_systems":["A","B","standby"]},"u":"deg, deg/s, s, N","scope":"aircraft","src":["Y7","Y9","Y8"],"conf":"กลาง","est":true,"note":"737-300 (NTSB AAR-99/01 p.25; Boeing p.29) ใช้กับ -800 จึงกลางตามกฎใน 3.7.3; PCU 5,900 lbf; tau 0.05 s เลือกเอง (est) ส่วนค่าอื่นไม่ใช่ค่าประมาณ"}
   },
   "trim": {
    "stabilizer_units_to_deg": {"v":{"offset_units":4,"deg_per_unit":1,"sign":"delta_s_deg = 4 - units; บวก = LE up = ก้มหัว"},"u":"deg/unit","scope":"aircraft","src":["Y2","Y4"],"conf":"สูง","est":false,"note":"KNKT §1.6.5.3: 0° = 4 units; ช่วง 4.2° LE up ถึง 12.9° LE down; ET302: 0 nose down ถึง 17 nose up"},
    "electric_limits_units": {"v":{"flaps_up":[3.9,14.5],"flaps_down":[-0.2,16.9]},"u":"units","scope":"aircraft","src":["Y6","Y2"],"conf":"ต่ำ","est":true,"note":"flaps up จากข้อความ Lemme (\"about 3.9 degrees to 14.5 degrees\" ตีความเป็น units); flaps down ใช้ช่วงกลไกเพราะไม่พบ"},
    "speed_trim": {"v":{"rate_dps_flaps_down":0.27,"envelope":"100 kt ถึง M0.60, ไม่เร็วกว่า 10 s หลัง liftoff, 5 s หลังปล่อยสวิตช์ trim, AP off"},"u":"deg/s","scope":"aircraft","src":["Y1","Y16"],"conf":"กลาง","est":false,"note":"อัตรา 0.27 จาก FAA (สูง); เงื่อนไขจากบันทึกทุติยภูมิ (ต่ำ) ซึ่งมีอีกรายการให้ \"Speed < Mach 0.68\" ขัดกันเอง"},
    "mach_trim": {"v":{"active_above_M":0.615,"acts_on":"elevator neutral shift (ไม่ใช่ stabilizer)"},"u":"Mach","scope":"aircraft","src":["Y14","Y16","Y5"],"conf":"สูง","est":false,"note":"NSIA §1.16.7.4"},
    "manual_rate_dps": {"v":0.1,"u":"deg/s","scope":"aircraft","src":["Y4","Y3"],"conf":"ต่ำ","est":true,"note":"จำนวนรอบ trim wheel ต่อ unit ไม่พบในแหล่งสาธารณะ; เลือกครึ่งหนึ่งของ main electric flaps-up เพื่อให้ช้ากว่าไฟฟ้า; แรงที่ wheel สูงมากเมื่อ stab mistrim ที่ความเร็วสูง (ET302, JATR)"},
    "rudder": {"v":{"range_deg":16,"rate_dps":0.5},"u":"deg, deg/s","scope":"aircraft","src":["Y7"],"conf":"กลาง","est":false,"note":"737-300 (AAR-99/01 pp.27-28); ใช้กับ -800"}
   },
   "feel": {
    "elevator_feel_computer": {"v":{"p_base_Pa":1241056,"p_max_Pa":9652660,"efsm_supply_Pa":5860543,"EFS_force_factor":2,"EFSM_force_factor":4,"EFSM_alpha_deg":[8,11],"inputs":["q_elevator_pitot","stabilizer_position"]},"u":"Pa, -, deg","scope":"aircraft","src":["Y5","Y6"],"conf":"กลาง","est":false,"note":"180 psi base, 1,400 psi max, EFSM 850 psi, EFSM ×4 ที่ AoA 8 to 11° (ข้อความใน [Y5]); EFS ×2 ของ NG มาจากผู้แสดงความเห็นที่ยกคู่มือ 737 NG ใน [Y6] (ต่ำ); EFSM เป็นของ MAX"},
    "pitch_gradient": {"v":{"Fbo_N":17.8,"Kmax_N_per_deg_elevator":60.62,"kq_Pa_per_Pa":448.9,"q_sat_Pa":18739},"u":"N, N/deg, Pa/Pa, Pa","scope":"aircraft","src":["Y4","Y5"],"conf":"ต่ำ","est":true,"note":"F = f_EFS·(Fbo + Kmax·(p/p_max)·|δe|), p = clamp(p_base + kq·q̄, p_base, p_max) ใน Pa (p_base 1,241,056, p_max 9,652,660); kq = 448.9 Pa/Pa = 0.06511 psi/Pa (ฉบับก่อนตรวจใส่ 0.06511 ซึ่งเป็น psi/Pa ใต้ชื่อ Pa_per_Pa); q_sat = q̄ ที่ 340 KCAS = 18,739 Pa; คาลิเบรตให้ 110 lb ที่ ≥ 340 KCAS เมื่อ δe 7.8° (ET302) ด้วย y_controls.mjs, ตรวจซ้ำด้วย yrev_controls.mjs"},
    "pedal": {"v":{"breakout_N":40,"full_N":311,"travel_m":0.1016,"m_per_deg_rudder":0.00391,"gradient_N_per_m":2671,"beyond_stop_N_per_m":52538},"u":"N, m, m/deg, N/m","scope":"aircraft","src":["Y7","Y9"],"conf":"กลาง","est":false,"note":"737-300 ใช้กับ -800 (กลาง): 9 to 70 lb, 4 in, 1 in ต่อ 6.5°; หลัง blowdown/jam ราว 300 lb ต่อ in; รูปเชิงเส้นของ gradient เป็นค่าประมาณ"},
    "wheel": {"v":{"breakout_N":13,"full_N":110},"u":"N","scope":"aircraft","src":["Y30","Y7"],"conf":"ต่ำ","est":true,"note":"ไม่พบในแหล่งสาธารณะ; เลือกให้อยู่ในขอบ 25.143 (50 lb สองมือ) และน้อยกว่าแรง manual reversion 40 lb"},
    "manual_reversion_forces": {"v":{"roll_initiate_N":178,"pitch_initiate_N":267,"rudder":"ไม่มี manual reversion ใช้ standby PCU"},"u":"N","scope":"aircraft","src":["Y7"],"conf":"กลาง","est":false,"note":"NTSB AAR-99/01 fn39/40 (737-300): 40 lb ที่ wheel เริ่ม roll, 60 lb ที่ column เริ่ม pitch"},
    "ap_override": {"v":{"cws_N":44.5,"single_ch_N":111,"dual_ch_N":222},"u":"N","scope":"aircraft","src":["Y7","Y14"],"conf":"สูง","est":false,"note":"CWS 10 lb (AAR-99/01 §1.6.3.1), override >25 lb ช่องเดียว, >50 lb สองช่อง (NSIA fn3)"}
   },
   "yaw_damper": {"v":{"authority_deg":3,"rate_dps":50,"kind":"series (ไม่ขยับ pedal)"},"u":"deg, deg/s","scope":"aircraft","src":["Y7","Y9","Y13"],"conf":"กลาง","est":false,"note":"737-300 (AAR-99/01 p.28); บันทึกทุติยภูมิของ NG ให้ราว ±2.5°"},
   "spoiler_mixing": {
    "roll": {"v":{"axes":{"wheel_norm":[0,0.149,0.23,0.483,0.69,0.839,0.954,1]},"data":[0,0,3.09,10.07,17.96,25.82,32.54,33.02]},"u":"deg (spoiler ฝั่งขึ้น)","scope":"aircraft","src":["Y15","Y16"],"conf":"ต่ำ","est":true,"note":"ตาราง low ของ 737-800YV; spoiler เริ่มเมื่อ wheel ราว 10 to 13° (0.126 to 0.149 ของ wheel เต็ม); ฝั่งตรงข้ามอยู่ที่ 0"},
    "speedbrake": {"v":{"axes":{"lever":[0,0.65,1]},"data":[0,25,33],"detents":["DOWN","ARMED","FLIGHT DETENT","UP"],"ground_auto":"RA < 10 ft และ main wheel spin-up > 60 kt"},"u":"deg","scope":"aircraft","src":["Y15","Y16"],"conf":"ต่ำ","est":true,"note":"lever 0.65 = flight detent (ตีความ) ให้ 25°; ห้ามใช้ในอากาศต่ำกว่า 1,000 ft RA (บันทึกทุติยภูมิ)"}
   },
   "rudder_limiter": {"v":{"kind":"pressure_reducer","classic":{"full_Pa":20684271,"reduced_Pa":6894757,"reduced_system":"A","pcu_force_fraction_reduced":0.667,"active":"สูงกว่า 1,000 ft AGL ขาขึ้น / 700 ft AGL ขาลง"},"ng":"ตามความเร็ว (ค่าไม่พบ)","blowdown_qb_Pa":4726,"stop_deg":26},"u":"Pa, deg","scope":"aircraft","src":["Y7","Y12","Y13","Y9"],"conf":"ต่ำ","est":true,"note":"δmax = 26·min(1, f_PCU·qb/q̄), f_PCU = (1 + p_A/p_full)/2 เพราะตัวลดแรงดันลดเฉพาะระบบ A (ETEB p.1-4) และ A, B ให้แรงราวครึ่งละ 3,000 lbf (NTSB p.29); qb คาลิเบรตให้ 21° ที่ 190 KCAS β 0 (Boeing: 14 to 21°); แหล่งขัดกัน 1,000 psi (NTSB) กับ 1,800 psi (บล็อก); ระดับลดแรงดัน 700 ft (ETEB) กับ 750 ft (AD 99-11-05) ขาลง"},
   "pitch": {
    "architecture": {"v":{"kind":"feel","input":"force"},"u":"-","scope":"aircraft","src":["Y7"],"conf":"สูง","est":false,"note":"irreversible + feel computer"},
    "stops": {"v":{"teu":22.2,"ted":19.3},"u":"deg","scope":"aircraft","src":["Y15"],"conf":"ต่ำ","est":true,"note":"เหมือน surfaces.elevator"},
    "rate_limit": {"v":50,"u":"deg/s","scope":"aircraft","src":["Y14"],"conf":"สูง","est":false,"note":"NSIA 2015/01"},
    "trim_rate_flaps_up": {"v":0.2,"u":"deg/s","scope":"aircraft","src":["Y3"],"conf":"สูง","est":false,"note":"stabilizer main electric (ไม่ใช่ tab)"},
    "trim_rate_flaps_down": {"v":0.4,"u":"deg/s","scope":"aircraft","src":["Y6"],"conf":"กลาง","est":false,"note":"stabilizer main electric"},
    "breakout": {"v":17.8,"u":"N","scope":"aircraft","src":["Y34"],"conf":"ต่ำ","est":true,"note":"ไม่พบ; เลือก 4 lb"}
   },
   "roll": {
    "architecture": {"v":{"kind":"feel","input":"force"},"u":"-","scope":"aircraft","src":["Y7"],"conf":"สูง","est":false,"note":"aileron PCU + flight spoiler"},
    "stops": {"v":{"max":20.5},"u":"deg","scope":"aircraft","src":["Y15"],"conf":"ต่ำ","est":true,"note":"aileron up สูงสุดในโมเดล"},
    "rate_limit": {"v":50,"u":"deg/s","scope":"aircraft","src":["Y14"],"conf":"ต่ำ","est":true,"note":"ไม่พบ; ใช้เท่า elevator"},
    "breakout": {"v":13,"u":"N","scope":"aircraft","src":["Y34"],"conf":"ต่ำ","est":true,"note":"ไม่พบ; เลือก 3 lbf"}
   },
   "yaw": {
    "architecture": {"v":{"kind":"feel","input":"force"},"u":"-","scope":"aircraft","src":["Y7"],"conf":"สูง","est":false,"note":"main PCU + standby PCU, ไม่มี manual reversion"},
    "stops": {"v":{"max":26},"u":"deg","scope":"aircraft","src":["Y7","Y8"],"conf":"กลาง","est":false,"note":"737-300 ใช้กับ -800 (กลางตามกฎใน 3.7.3)"},
    "rate_limit": {"v":66,"u":"deg/s","scope":"aircraft","src":["Y7","Y9"],"conf":"กลาง","est":false,"note":"737-300 ใช้กับ -800; 33 เมื่อ primary slide อย่างเดียว"},
    "trim_rate": {"v":0.5,"u":"deg/s","scope":"aircraft","src":["Y7"],"conf":"กลาง","est":false,"note":"ช่วง ±16°"},
    "breakout": {"v":40,"u":"N","scope":"aircraft","src":["Y7"],"conf":"กลาง","est":true,"note":"ใช้ปลายล่างของ feel unit 9 lb เป็น breakout (ตีความ)"}
   }
  }
 }
}
```

```json
{
 "atr72_600": {
  "controls": {
   "architecture": {"v":{"pitch":"reversible","roll":"reversible","yaw":"reversible","trim":"tab"},"u":"-","scope":"aircraft","src":["Y18","Y17"],"conf":"สูง","est":false,"note":"ทุกพื้นบังคับเป็นกลไก (cable, pulley, push-pull rod) ยกเว้น roll spoiler ที่ใช้ไฮดรอลิก"},
   "pitch": {
    "architecture": {"v":{"kind":"reversible","input":"force"},"u":"-","scope":"aircraft","src":["Y18"],"conf":"สูง","est":false,"note":"elevator ซ้ายขวาต่อกันผ่าน pitch uncoupling mechanism"},
    "S_e": {"v":3.5,"u":"m2","scope":"aircraft","src":["R1:C17"],"conf":"ต่ำ","est":true,"note":"0.30 × S_h 11.73 m² (หัวข้อ 3.1)"},
    "c_e": {"v":0.48,"u":"m","scope":"aircraft","src":["Y34"],"conf":"ต่ำ","est":true,"note":"0.30 × คอร์ดเฉลี่ยหางระดับราว 1.6 m"},
    "gearing": {"v":3.717,"u":"rad/m","scope":"aircraft","src":["Y19"],"conf":"ต่ำ","est":true,"note":"อัตราทด elevator/column 23/11.25 = 2.04 rad/rad หารแขนด้ามจับ 0.55 m (สมมติ)"},
    "Ch_delta": {"v":-0.0519,"u":"1/rad","scope":"aircraft","src":["Y19","Y18"],"conf":"ต่ำ","est":true,"note":"ค่ายังผล (รวม spring/geared tab) คาลิเบรตให้ full nose-up 23° ที่ 154 kt ใช้ 50 daN (y_controls.mjs)"},
    "Ch_alpha": {"v":-0.0173,"u":"1/rad","scope":"aircraft","src":["Y34"],"conf":"ต่ำ","est":true,"note":"สัดส่วน 1/3 ของ Ch_delta ตามแนวรอบที่ 1"},
    "stops": {"v":{"teu":23,"ted":13},"u":"deg","scope":"aircraft","src":["Y19"],"conf":"สูง","est":false,"note":"ATSB second interim p.2"},
    "rate_limit": {"v":60,"u":"deg/s","scope":"aircraft","src":["Y18"],"conf":"ต่ำ","est":true,"note":"ไม่มี actuator; จำกัดเพื่อเสถียรภาพเชิงตัวเลขของอินพุต"},
    "breakout": {"v":20,"u":"N","scope":"aircraft","src":["Y34"],"conf":"ต่ำ","est":true,"note":"ไม่พบ"},
    "trim_rate_flaps_up": {"v":0.5,"u":"deg/s","scope":"aircraft","src":["Y17"],"conf":"ต่ำ","est":true,"note":"ไม่พบ (อัตรา tab); เลือกให้ทั้งช่วงใช้ราว 20 to 30 s"},
    "trim_rate_flaps_down": {"v":0.5,"u":"deg/s","scope":"aircraft","src":["Y17"],"conf":"ต่ำ","est":true,"note":"ไม่พบ"}
   },
   "roll": {
    "architecture": {"v":{"kind":"reversible","input":"force"},"u":"-","scope":"aircraft","src":["Y17"],"conf":"สูง","est":false,"note":"ไม่มีไฮดรอลิกที่ aileron; geared balance tab"},
    "S_a_each": {"v":1.5,"u":"m2","scope":"aircraft","src":["Y34"],"conf":"ต่ำ","est":true,"note":"ประมาณจากแปลนปีก; แรงที่ wheel รวม hinge moment ของ aileron ทั้งสองข้าง (×2) ตามสคริปต์ y_controls.mjs"},
    "c_a": {"v":0.45,"u":"m","scope":"aircraft","src":["Y34"],"conf":"ต่ำ","est":true,"note":"ราว 0.25 ของคอร์ดปลายปีก"},
    "gearing": {"v":1.197,"u":"rad/m","scope":"aircraft","src":["Y17"],"conf":"ต่ำ","est":true,"note":"aileron/wheel 14/65 = 0.2154 rad/rad หารรัศมี wheel 0.18 m (สมมติ)"},
    "Ch_delta": {"v":-0.0667,"u":"1/rad","scope":"aircraft","src":["Y17"],"conf":"ต่ำ","est":true,"note":"ค่ายังผลรวม balance tab; ให้ full aileron ที่ VMO 250 KCAS = 60 lb ที่ wheel (เกณฑ์ออกแบบ < 60 lb)"},
    "tab_max": {"v":4,"u":"deg","scope":"aircraft","src":["Y17"],"conf":"สูง","est":false,"note":"balance tab ±4° ที่ aileron ±14°"},
    "stops": {"v":{"max":14},"u":"deg","scope":"aircraft","src":["Y17"],"conf":"สูง","est":false,"note":"aileron ±14°, wheel ±65°"},
    "breakout": {"v":13,"u":"N","scope":"aircraft","src":["Y34"],"conf":"ต่ำ","est":true,"note":"ไม่พบ; เลือก 3 lbf"},
    "rate_limit": {"v":80,"u":"deg/s","scope":"aircraft","src":["Y17"],"conf":"ต่ำ","est":true,"note":"ไม่มี actuator"}
   },
   "yaw": {
    "architecture": {"v":{"kind":"reversible","input":"force"},"u":"-","scope":"aircraft","src":["Y18"],"conf":"สูง","est":false,"note":"rudder กลไก + TLU"},
    "stops": {"v":{"max":27},"u":"deg","scope":"aircraft","src":["Y17"],"conf":"กลาง","est":false,"note":"low-speed mode (ATR 72-212) ใช้กับ -600 จึงกลาง"},
    "S_r": {"v":3.7,"u":"m2","scope":"aircraft","src":["Y34"],"conf":"ต่ำ","est":true,"note":"0.30 × S_v 12.48 m²"},
    "c_r": {"v":0.6,"u":"m","scope":"aircraft","src":["Y34"],"conf":"ต่ำ","est":true,"note":"ประมาณ"},
    "rate_limit": {"v":60,"u":"deg/s","scope":"aircraft","src":["Y17"],"conf":"ต่ำ","est":true,"note":"ไม่มี actuator"},
    "breakout": {"v":40,"u":"N","scope":"aircraft","src":["Y34"],"conf":"ต่ำ","est":true,"note":"ไม่พบ"}
   },
   "mech": {
    "pitch_uncoupling": {"v":{"each_column_N":[500,550],"total_differential_N":[1000,1100]},"u":"N","scope":"aircraft","src":["Y18"],"conf":"สูง","est":false,"note":"50 to 55 daN ต่อคันในทิศตรงข้ามพร้อมกัน; ผลต่างรวม 100 to 110 daN"},
    "column_travel_deg": {"v":{"up":11.25,"down":6.75,"stop_up":13.25,"stop_down":8.75},"u":"deg","scope":"aircraft","src":["Y19"],"conf":"สูง","est":false,"note":"ATSB second interim p.2"},
    "wheel_travel_deg": {"v":65,"u":"deg","scope":"aircraft","src":["Y17"],"conf":"สูง","est":false,"note":"±65°"},
    "cable_tension_N": {"v":[200,250],"u":"N","scope":"aircraft","src":["Y17"],"conf":"สูง","est":false,"note":"tension regulator 20 to 25 daN"},
    "stick_pusher_column_deg": {"v":8,"u":"deg","scope":"aircraft","src":["Y17"],"conf":"สูง","est":false,"note":"pusher ดัน column ไป 8° nose-down"}
   },
   "surfaces": {
    "roll_spoiler": {"v":{"travel_deg":{"up":57},"rate_dps":60,"actuator_tau_s":0.08,"panels_per_wing":1,"hydraulic_systems":["hydraulic (สีไม่ยืนยัน)"]},"u":"deg, deg/s, s","scope":"aircraft","src":["Y17","Y18"],"conf":"กลาง","est":true,"note":"มุมจาก NTSB (สูง); อัตราและ tau เลือกเอง"}
   },
   "spoiler_mixing": {
    "roll": {"v":{"threshold_aileron_deg":2.5,"gain_deg_per_deg":4.957,"max_deg":57},"u":"deg","scope":"aircraft","src":["Y17"],"conf":"สูง","est":false,"note":"δsp = 57·(δa − 2.5)/11.5 สำหรับ aileron ขาขึ้น > 2.5°"}
   },
   "rudder_limiter": {"v":{"kind":"TLU","low_speed_deg":27,"high_speed_deg":3,"to_high_above_kt":185,"to_low_below_kt":180,"stroke_auto_s":15,"stroke_manual_s":30},"u":"deg, kt, s","scope":"aircraft","src":["Y17","Y21","Y22"],"conf":"สูง","est":false,"note":"NTSB: ราว 3° ต่อข้างเหนือ 185 KIAS; AAIB: กลับ low speed เมื่อ ADC < 180 kt, stroke 15 s (auto) / 30 s (manual)"},
   "feel": {
    "wheel_force_design_max_N": {"v":267,"u":"N","scope":"aircraft","src":["Y17"],"conf":"สูง","est":false,"note":"ออกแบบให้ < 60 lb"}
   },
   "trim": {
    "kinds": {"v":{"pitch":"electric elevator trim tab (normal + standby)","roll":"electric on left aileron balance tab","yaw":"rudder trim tab"},"u":"-","scope":"aircraft","src":["Y17"],"conf":"กลาง","est":false,"note":"อัตราและช่วงไม่พบในแหล่งสาธารณะ"}
   },
   "reference_types": {
    "atr72_ap_aileron_rate_monitor": {"v":3.6,"u":"deg/s","scope":"aircraft","src":["Y17"],"conf":"สูง","est":false,"note":"AP disconnect เมื่ออัตรา aileron เกิน"}
   }
  }
 }
}
```

```json
{
 "a320ceo": {
  "controls": {
   "architecture": {"v":{"pitch":"fbw","roll":"fbw","yaw":"feel","trim":"ths"},"u":"-","scope":"aircraft","src":["Y24","Y27","Y25"],"conf":"สูง","est":false,"note":"yaw ของ A320ceo เชื่อม pedal กับ rudder ทางกล + FAC (yaw damper, trim, RTL); THS มี trim wheel กลไกสำรอง"},
   "hydraulics": {"v":{"nominal_Pa":20684271,"aileron":["B","G"],"elevator_L":["B","G"],"elevator_R":["B","Y"],"rudder":["G","B","Y"],"ths_motors":["G","Y"],"spoilers":{"1":"G","2":"Y","3":"B","4":"Y","5":"G"}},"u":"Pa; ระบบต่อพื้นบังคับ","scope":"aircraft","src":["Y28"],"conf":"กลาง","est":false,"note":"จากโมเดล FlyByWire A32NX (GPL-3.0) ที่อิง FCOM; การแบ่ง spoiler 1/5 = G, 2/4 = Y, 3 = B ยืนยันใน hydraulic/mod.rs (ผู้ตรวจ 18 พ.ย. 2026)"},
   "surfaces": {
    "elevator": {"v":{"travel_deg":{"up":30,"down":17},"rate_dps":40,"actuator_tau_s":0.06,"hydraulic_systems":["B","G","Y"]},"u":"deg, deg/s, s","scope":"aircraft","src":["Y24"],"conf":"กลาง","est":true,"note":"มุมจาก KNKT (สูง); อัตรา/tau ไม่พบ เลือกเอง"},
    "ths": {"v":{"travel_deg":{"nose_up":13.5,"nose_down":4},"rate_dps":0.17,"hydraulic_systems":["G","Y"]},"u":"deg, deg/s","scope":"aircraft","src":["Y24","Y26"],"conf":"กลาง","est":true,"note":"มุมจาก KNKT (สูง); อัตราเป็นค่าเฉลี่ยที่ AF447 (A330) บันทึกจาก 3° ถึง 13° ใน 1 นาที ใช้แทนเพราะไม่พบของ A320 (ต่ำ)"},
    "aileron": {"v":{"travel_deg":{"up":25,"down":25},"rate_dps":40,"actuator_tau_s":0.06,"hydraulic_systems":["B","G"]},"u":"deg, deg/s, s","scope":"aircraft","src":["Y28"],"conf":"ต่ำ","est":true,"note":"±25 จากค่าคงที่ใน ElacComputer_data.cpp; อัตรา/tau เลือกเอง"},
    "roll_spoiler": {"v":{"panels":[2,3,4,5],"rate_dps":35,"actuator_tau_s":0.06},"u":"-, deg/s, s","scope":"aircraft","src":["Y28"],"conf":"ต่ำ","est":true,"note":"มุมสูงสุดของโหมด roll ไม่พบ; 35 ในโมเดลน่าจะเป็น rate limit (ตีความ)"},
    "ground_spoiler": {"v":{"panels":[1,2,3,4,5],"travel_deg":{"up":50},"speedbrake_panels":[2,3,4],"speedbrake_max_deg":40},"u":"deg","scope":"aircraft","src":["Y28"],"conf":"กลาง","est":true,"note":"โมเดล SEC: ground −50°, speedbrake lever เต็ม −40°"},
    "rudder": {"v":{"travel_deg":{"left":25,"right":25},"rate_dps":40,"actuator_tau_s":0.06,"hydraulic_systems":["G","B","Y"]},"u":"deg, deg/s, s","scope":"aircraft","src":["Y28","Y27"],"conf":"กลาง","est":true,"note":"มุม 25° ที่ ≤ 160 kt จากตาราง RTL; อัตรา/tau เลือกเอง"}
   },
   "rudder_limiter": {"v":{"axes":{"kcas":[100,160,200,240,320,380,400]},"data":[25,25,14.5,8.8,4.8,3.4,3.4]},"u":"deg","scope":"aircraft","src":["Y28","Y24","Y27"],"conf":"กลาง","est":false,"note":"ตาราง FAC ของ FlyByWire; สอดคล้องกับ ECAM \"RUD WITH CARE ABV 160 KT\" ใน KNKT"},
   "spoiler_mixing": {
    "speedbrake": {"v":{"axes":{"lever":[0,0.05,0.051,0.5,1]},"data":[0,0,2,25,40]},"u":"deg","scope":"aircraft","src":["Y28"],"conf":"กลาง","est":false,"note":"SecComputer_data.cpp (ค่าลบในโค้ด = ขึ้น)"}
   },
   "yaw_damper": {"v":{"alternate_law_authority_deg":5},"u":"deg","scope":"aircraft","src":["Y24"],"conf":"สูง","est":false,"note":"KNKT §1.6.5.2: alternate law yaw damper ±5°"},
   "trim": {
    "rudder": {"v":{"range_deg":20,"rate_dps":1},"u":"deg, deg/s","scope":"aircraft","src":["Y28"],"conf":"ต่ำ","est":true,"note":"±20 จากค่าคงที่ใน FacComputer_data.cpp (ตีความ); อัตราไม่พบ เลือก 1°/s"}
   },
   "inceptors": {
    "sidestick": {"v":{"ap_override_N":{"pitch":50,"roll":35},"travel_deg":{"pitch":16,"roll":20},"dual_input_threshold_deg":2},"u":"N, deg","scope":"aircraft","src":["Y24"],"conf":"กลาง","est":true,"note":"ap_override_N = แรงที่ทำให้คันที่ถูก solenoid detent ล็อกขณะ AP ทำงานเป็นอิสระและ AP ปลด (KNKT §1.6.5.3 p.33, สูง) ไม่ใช่ breakout ของการบินด้วยมือ (ไม่พบ); dual input 2° จาก KNKT (สูง); travel อนุมานจากค่าที่ FDR บันทึก −16° pitch, −20° roll (KNKT p.59, กลาง); กฎการบินอยู่ที่ controls.fbw (หัวข้อ 8)"}
   }
  }
 }
}
```

```json
{
 "a330_300": {
  "controls": {
   "architecture": {"v":{"pitch":"fbw","roll":"fbw","yaw":"feel","trim":"ths"},"u":"-","scope":"aircraft","src":["Y25"],"conf":"กลาง","est":false,"note":"รุ่นพื้นฐานใช้ rudder กลไก รุ่น enhanced ใช้ rudder FBW (ATSB fn25); 3 PRIM + 2 SEC"},
   "surfaces": {
    "elevator": {"v":{"travel_deg":{"up":30,"down":15}},"u":"deg","scope":"aircraft","src":["Y25"],"conf":"สูง","est":false,"note":"ATSB AO-2008-070 §1.6.3"},
    "ths": {"v":{"travel_deg":{"nose_up":14,"nose_down":2},"rate_dps":0.17},"u":"deg, deg/s","scope":"aircraft","src":["Y25","Y26"],"conf":"กลาง","est":true,"note":"มุมจาก ATSB (สูง); อัตราเฉลี่ย AF447 จาก 3° ถึง 13° ใน 1 นาที (est)"}
   }
  }
 }
}
```

```json
{
 "common_airliner": {
  "controls": {
   "requirements": {
    "part25_force_limits_N": {"v":{"short_two_hands":{"pitch":334,"roll":222},"short_one_hand":{"pitch":222,"roll":111},"short_yaw":667,"long_term":{"pitch":44.5,"roll":22.2,"yaw":89}},"u":"N","scope":"sim","src":["Y30"],"conf":"สูง","est":false,"note":"14 CFR 25.143(d): 75/50, 50/25, 150, 10/5/20 lbf"},
    "part25_out_of_trim": {"v":{"mistrim_s_at_normal_rate":3,"g_range":[-1,2.5],"recovery_g":1.5,"max_force_N":556},"u":"s, g, N","scope":"sim","src":["Y31"],"conf":"สูง","est":false,"note":"14 CFR 25.255"},
    "fstd_dynamic_tolerance": {"v":{"force_N":8.9,"force_pct":10,"T_P0_pct":10},"u":"N, %","scope":"sim","src":["Y32"],"conf":"สูง","est":false,"note":"14 CFR Part 60 App. A: dynamic ±2 lb หรือ ±10%; T(P0) ±10%"}
   },
   "actuator_model": {"v":{"form":"first-order lag + rate limit + position limit","update":"explicit Euler นอก RK4 ทุกก้าว 240 Hz (dt/τ ≤ 0.083 จึงเสถียร; t90 ต่างจาก exact discretisation < 1 ms)"},"u":"-","scope":"sim","src":["R1:C14","R1:C17"],"conf":"กลาง","est":true,"note":"ดูสมการใน 3.7.6"},
   "force_cue_marks_N": {"v":{"pitch":[44.5,222.4,333.6],"roll":[22.2,111.2,222.4],"yaw":[89,667.2]},"u":"N","scope":"sim","src":["Y30"],"conf":"สูง","est":false,"note":"ขีดบนแถบแรง = long-term, one hand, two hands ของ 25.143(d)"}
  }
 }
}
```

## กรณีทดสอบ

ค่าคาดหวังที่มาจากสมการคำนวณด้วย `scripts/y_controls.mjs` (ผลอยู่ในตารางและในบันทึกท้ายแต่ละหมวด) และคำนวณซ้ำโดยผู้ตรวจด้วย `scripts/yrev_controls.mjs` ซึ่งเป็นฉบับที่ถูกต้องสำหรับ T-Y-02 และ T-Y-11 (สคริปต์เดิมยังให้ค่าก่อนแก้) การทดสอบทั้งหมดเป็นแบบ pure function ไม่ต้องมี DOM เหมาะกับ `node:test` หรือรูปแบบ `test/*.test.mjs` ที่มีอยู่

| รหัส | เงื่อนไข | ปริมาณที่วัด | ผลคาดหวัง ± tolerance | ที่มา/สคริปต์ |
|---|---|---|---|---|
| T-Y-01 | 737 แปลง units เป็นมุม stab: units 0, −0.2, 4, 16.9 | δs (°, บวก = LE up) | 4.0, 4.2, 0.0, −12.9 ± 0.01 | [Y2]; `y_controls.mjs` stab |
| T-Y-02 | 737 main electric trim ค้างสวิตช์ nose up จากขอบล่างถึงขอบบนของ electric limits: flaps up 3.9 → 14.5 units, flaps down −0.2 → 16.9 units (ขอบ flaps down เป็นค่าประมาณ) | เวลาเต็มช่วง | 53.0 ± 0.3 s (0.2°/s) และ 42.75 ± 0.3 s (0.4°/s) | [Y3][Y6]; `yrev_controls.mjs` (แก้โดยผู้ตรวจ: ฉบับเดิมให้ 85.5 s จาก −0.2 ถึง 16.9 ที่ flaps up ซึ่งขัดกับขอบ 3.9 ถึง 14.5 ของ T-Y-06) |
| T-Y-03 | 737 trim ค้าง 3 s ที่อัตราปกติ flaps up | Δunits | 0.60 ± 0.02 (ตรงกับ JATR p.19 และ 25.255) | [Y3][Y31]; stab |
| T-Y-04 | 737 STS flaps down หรือคำสั่งแบบ MCAS ลด 2.5° | เวลา | 9.26 ± 0.3 s (ET302 บันทึก 9 s); อัตราที่วัดจาก 4.6 ถึง 2.1 units ใน 9 s = 0.278 u/s | [Y1][Y4]; stab |
| T-Y-05 | 737 AP trim 10 s ที่ flaps down และ flaps up ปลายทางไม่ชนขอบ | Δunits | 2.70 ± 0.05 และ 0.90 ± 0.05 | [Y6]; stab (ap_flapsDn/Up_10s_units) |
| T-Y-06 | 737 ตั้ง electric trim limit flaps up แล้วสั่ง nose up ค้าง 120 s จาก 4 units | units สุดท้าย | หยุดที่ 14.5 ± 0.05 (ไม่ถึง 16.9) | [Y6] (ต่ำ) |
| T-Y-07 | 737 pedal: rudder คำสั่ง 26° และ 13° ที่ q̄ ต่ำ (ไม่มี blowdown) | ระยะ pedal, แรง pedal | 4.00 ± 0.05 in (0.1016 m), 70 ± 3 lbf (311 ± 13 N); ที่ 13°: 2.0 in, 39.5 ± 2 lbf | [Y7]; rudder737 |
| T-Y-08 | 737 rudder คำสั่งขั้น 0 ถึง 26° แบบ rate limit อย่างเดียว | เวลาถึง 26° | 0.394 ± 0.01 s (dual), 0.788 ± 0.02 s (primary only) | [Y7][Y9]; rudder737 |
| T-Y-09 | 737 yaw damper สั่ง 10° ขั้นบันได | มุมสูงสุด, เวลาถึง | ถูก clip ที่ 3.0 ± 0.01°, ถึงใน 0.06 ± 0.01 s; pedal ไม่ขยับ | [Y7][Y9]; rudder737 |
| T-Y-10 | 737 blowdown model, β = 0, p เต็ม | δr,max ที่ 150, 190, 250, 280, 340 KCAS | 26.0, 21.0, 12.1, 9.7, 6.6 ± 0.2° | [Y9] คาลิเบรต; blowdown737 |
| T-Y-11 | เหมือน T-Y-10 ที่ 250 KCAS เมื่อ pressure reducer ทำงาน (ลดเฉพาะระบบ A, ระบบ B 3,000 psi) | δr,max | 8.1 ± 0.2° (ระบบ A 1,000 psi, f_PCU 0.667) หรือ 9.7 ± 0.2° (ระบบ A 1,800 psi, ทางเลือก) | [Y7][Y12][Y13]; `yrev_controls.mjs` blowdown (แก้โดยผู้ตรวจ) |
| T-Y-12 | 737 elevator feel: δe 5° ที่ 150 และ 250 KCAS; δe 7.78° ที่ 340 KCAS | p_feel, แรง column | 417.5 ± 1 psi, 24.3 ± 0.5 lbf; 839.6 ± 1 psi, 44.9 ± 0.5 lbf; 1,400 psi, 110 ± 1 lbf | [Y4][Y5] คาลิเบรต; feel737 |
| T-Y-13 | 737 EFS ทำงานที่ 150 KCAS δe 5° | แรง column | 48.6 ± 1 lbf (2 เท่าของ T-Y-12) | [Y6]; feel737 |
| T-Y-14 | 737 elevator คำสั่งขั้น 10° และ 20°, τ 0.05 s, 50°/s, Euler 240 Hz | t90 | 0.196 ± 0.01 s และ 0.362 ± 0.01 s | [Y14]; actuator |
| T-Y-15 | 737 roll mixing: |wheel_norm| = 0.1, 0.5, 1.0 (ตาราง low) | มุม flight spoiler ฝั่งขึ้น | 0.0, 10.72 ± 0.1, 33.02 ± 0.1° | [Y15]; spoiler737 |
| T-Y-16 | 737 speedbrake lever 0.65 และ 1.0 ในอากาศ ไม่มี roll | มุม flight spoiler แผ่นนอก (2, 3, 10, 11) / แผ่นใน | แผ่นนอก 25 ± 0.5° และ 33 ± 0.5°; แผ่นใน 32 ± 0.5° และ 38 ± 0.5° (ตารางแผ่นในของโมเดล) | [Y15]; spoiler737 |
| T-Y-17 | 737 A และ B เสียทั้งคู่ (manual reversion) ที่ 250 KCAS | แรงน้อยสุดที่ทำให้ δe และ δa เริ่มขยับ | column ≥ 267 N (60 lbf) ± 10 %, wheel ≥ 178 N (40 lbf) ± 10 %; rudder ยังทำงานด้วย standby | [Y7] |
| T-Y-18 | ATR roll spoiler mixing: aileron ขึ้น 2.5°, 8°, 14° | มุม spoiler | 0, 27.26 ± 0.1, 57.0 ± 0.1° | [Y17]; atr |
| T-Y-19 | ATR column เต็มทั้งสองทิศ | มุม elevator, อัตราทด | 23° NU/13° ND ± 0.1; อัตราทด 2.04 ± 0.02 และ 1.93 ± 0.02 | [Y19]; atr |
| T-Y-20 | ATR TLU เริ่ม low speed: IAS 200 kt ช่วง t 0 ถึง 20 s, 182 kt ช่วง 20 ถึง 30 s, 175 kt หลัง 30 s (240 Hz) | δr,max ที่ t = 7.5, 15, 25, 37.5, 45 s | 15, 3, 3 (hysteresis), 15, 27 ± 0.5° | [Y17][Y21]; tluSim |
| T-Y-21 | ATR roll reversible (ค่าประมาณ) aileron 14° ที่ 250 และ 150 KCAS; 7° ที่ 180 KCAS | แรงที่ wheel | 60 ± 1, 21.6 ± 0.5, 15.6 ± 0.5 lbf | [Y17] คาลิเบรต; atrRoll |
| T-Y-22 | ATR pitch reversible (ค่าประมาณ) elevator 23° ที่ 154 KCAS; 5° ที่ 200 และ 250 KCAS | แรงที่ column | 50 ± 1, 18.3 ± 0.5, 28.7 ± 0.5 daN | [Y19] คาลิเบรต; atrPitch |
| T-Y-23 | ATR PUM: แรง column ซ้าย +55 daN ขวา −55 daN | สถานะ coupling | แยก (ผลต่าง 110 daN ≥ 100 daN); ที่ +40/−40 daN ยังไม่แยก | [Y18]; pum |
| T-Y-24 | A320 RTL ที่ IAS 140, 180, 250, 290, 350 kt | δr,max | 25.0, 19.75, 8.30, 6.30, 4.10 ± 0.05° | [Y28]; a320 |
| T-Y-25 | A320 speedbrake lever 0.25, 0.5, 0.75, 1.0 | มุม spoiler 2 ถึง 4 | 12.19, 25.0, 32.5, 40.0 ± 0.1° | [Y28]; a320 |
| T-Y-26 | A320 และ A330 คำสั่ง elevator และ THS เกินขอบ | มุมที่ clip | A320: elevator 30 NU / 17 ND, THS 13.5 NU / 4 ND; A330: 30/15 และ 14/2 (± 0.01°) | [Y24][Y25] |
| T-Y-27 | A320 AP engaged: แรงที่ sidestick 40 N และ 60 N (pitch), 30 N และ 40 N (roll) | สถานะ AP และคำสั่งคัน | 40 N / 30 N: AP ยังทำงาน คำสั่งคัน 0; 60 N / 40 N: AP ปลด คันเป็นอิสระ (ขีด 50 N = 11.24 lbf pitch, 35 N = 7.87 lbf roll) | [Y24] p.33; a320 (แก้โดยผู้ตรวจ) |
| T-Y-28 | ทุกแบบ: ขีดของแถบแรง | ค่า N ของขีด | pitch 44.5/222.4/333.6, roll 22.2/111.2/222.4, yaw 89.0/667.2 ± 0.5 N | [Y30]; cue_N |

## ความขัดแย้งของแหล่งข้อมูลและข้อจำกัด

1. **แรงดันที่ลดของ rudder pressure reducer (737 Classic)**: NTSB AAR-99/01 (glossary) ให้ 3,000 เป็น 1,000 psi สำหรับ -300/-400/-500 (และ 1,400 psi สำหรับ -100/-200) [Y7] บันทึกที่อ้าง Watts และ Brady ให้ 1,800 psi และลด authority ราวหนึ่งในสาม [Y13] ทั้ง ETEB [Y12] และ [Y13] ระบุว่าลดเฉพาะระบบ A เมื่อคิดว่า A และ B ให้แรงครึ่งละเท่ากัน ค่า 1,000 psi ของ NTSB ให้ authority ลดหนึ่งในสามพอดี จึงสอดคล้องกับ [Y13] มากกว่าค่า 1,800 psi ของ [Y13] เอง เลือกค่าของ NTSB เพราะเป็นเอกสารปฐมภูมิ และใส่ 1,800 psi เป็นทางเลือกในกรณีทดสอบ T-Y-11 ส่วน NG ใช้เกณฑ์ความเร็ว [Y12] ที่ไม่พบตัวเลข
2. **Yaw damper ของ 737**: NTSB และ Boeing ให้ ±3° (737-300) [Y7][Y9] บันทึกทุติยภูมิให้ราว ±2.5° [Y13] เลือก ±3° (ปฐมภูมิ) และระบุว่า NG อาจต่างกัน
3. **ขอบ electric trim flaps up ของ 737**: Lemme เขียน "about 3.9 degrees to 14.5 degrees" [Y6] แต่ค่าตรงกับรูปแบบ units ของ indicator มากกว่า (3.9 units = 0.1° LE up, 14.5 units = 10.5° LE down) จึงตีความเป็น units และให้ความเชื่อมั่นต่ำ
4. **ช่วง stabilizer ที่ indicator**: ET302 เขียน "0 unit nose down to 17 unit nose up" [Y4] บันทึกทุติยภูมิให้ −0.2 ถึง 16.9 [Y16] KNKT ให้ 17.1° รวม และ 0° = 4 units [Y2] ถ้าใช้ 1 unit = 1° พอดี จะได้ −0.2 ถึง 16.9 units แต่ KNKT p.47 เขียนไว้ด้วยว่า "When the stabilizer trim indicator is at the 0 position, the Horizontal Stabilizer is at the full leading-edge up position" ซึ่งให้ 0 ถึง 17.1 units (และ 1 unit ไม่เท่ากับ 1° พอดี: 4 units ครอบคลุม 4.2°) ความต่างอยู่ที่ 0.2 unit จึงไม่มีผลต่อการบิน เครื่องจำลองใช้ δs = 4 − units ได้ แต่ช่วง indicator −0.2 ถึง 16.9 ลดความเชื่อมั่นเป็นต่ำ (ผู้ตรวจ)
5. **ระยะ elevator และ aileron ของ 737**: ไม่พบในเอกสารปฐมภูมิ ใช้โมเดล FlightGear 737-800YV [Y15] ซึ่งเป็นงานของผู้สร้างโมเดล (GPL-2.0) ทิศของค่าตีความเอง ความเชื่อมั่นต่ำ
6. **อัตรา MCAS ที่บันทึกจริงกับค่าออกแบบ**: KNKT ให้ trim ลด 2.3 units ใน "about 10 seconds" (0.23 u/s) [Y2] ซึ่งต่ำกว่า 0.27°/s ราว 15 % อาจเพราะเวลาที่ปัดเศษ ET302 ให้ 2.5 units ใน 9 s (0.278 u/s) [Y4] ตรงกับค่าออกแบบ tolerance ของ T-Y-04 จึงตั้งไว้ ±0.3 s
7. **ATR rudder**: ข้อมูล ±27° และ ±3° มาจาก ATR 72-212 ปี 1994 [Y17] AAIB [Y21] ให้ค่าที่ทดสอบบนพื้นสูงสุด 21° (ในเหตุการณ์ TLU ประกอบผิด) ซึ่งไม่ใช่ขีดจำกัดปกติ เลือก 27° สำหรับ low speed และระบุว่า -600 อาจมี modification ที่ต่างกัน (กลาง)
8. **A320 ตัวเลขจาก FlyByWire**: ตาราง RTL, speedbrake, ไฮดรอลิก และ ±25° ของ aileron มาจากโค้ดของโครงการจำลองที่อิง FCOM [Y28] ไม่ใช่เอกสารของ Airbus ความเชื่อมั่นจึงไม่เกินกลาง ตาราง RTL สอดคล้องกับข้อความ "RUD WITH CARE ABV 160 KT" ของ KNKT [Y24] ส่วนค่า "16 % ที่ 290 kt" ของ Airbus [Y27] ตีความเป็นมุมไม่ได้ เพราะไม่รู้ว่าเป็นเปอร์เซ็นต์ของอะไร
9. **อัตรา THS ของ Airbus**: ค่า 0.17°/s เป็นค่าเฉลี่ยที่คำนวณจาก AF447 (A330, alternate law, ช่วงที่ THS เคลื่อนต่อเนื่อง) [Y26] ไม่ใช่อัตราสูงสุดของ actuator และนำมาใช้กับ A320 แทนค่าที่ไม่พบ ความเชื่อมั่นต่ำ
10. **Sidestick travel**: ±16°/±20° อนุมานจากค่าสูงสุดที่ FDR บันทึกใน KNKT [Y24] ไม่ใช่ข้อความระบุระยะ ความเชื่อมั่นกลาง หัวข้อ 8 อาจมีค่าจาก FCOM ที่ควรใช้แทน (ถ้าตรงกันให้คงไว้ที่ `controls.inceptors` และให้ `controls.fbw.sidestick` อ้างถึง)
11. **ค่าที่คาลิเบรตเอง**: feel ของ 737 (Kmax, kq, Fbo), blowdown q̄b, Ch_δ ยังผลของ ATR ทั้ง pitch และ roll, เรขาคณิตพื้นบังคับของ ATR, อัตรา actuator ของ Airbus และ ATR roll spoiler, ค่า τ ทั้งหมด เป็นค่าประมาณ (est) ที่บอกวิธีไว้ ควรปรับเมื่อมีข้อมูลการบินทดสอบหรือคำติชมจากนักบิน
12. **สำเนาไม่เป็นทางการ**: รายงาน KNKT LNI610 ใช้สำเนาบน asianaviation.com, KNKT QZ8501 ใช้สำเนาของ ERAU, JATR ใช้สำเนาบน flighttestsafety.org และ ET302 ใช้สำเนาบน bea.aero เนื้อหาเป็นเอกสารทางการของหน่วยงาน แต่ลิงก์ไม่ใช่เว็บไซต์ของหน่วยงานเจ้าของ ตรวจหน้าและข้อความได้กับฉบับทางการ

## แหล่งอ้างอิง

สิทธิ์ที่ใช้: **ก** = สาธารณสมบัติของรัฐบาลสหรัฐ อ้างและคัดลอกตัวเลข/ข้อความได้; **ข** = เอกสารของหน่วยงานรัฐอื่นหรือสัญญาอนุญาตเปิด (CC BY, OGL) อ้างและคัดลอกได้พร้อมระบุที่มา; **ค** = ลิขสิทธิ์ของผู้ผลิตหรือผู้เขียน อ้างตัวเลขเป็นข้อเท็จจริงได้ ห้ามคัดลอกข้อความ ตาราง หรือรูปยาว; **ง** = โค้ด GPL อ้างตัวเลขและแนวคิดได้ ห้ามคัดลอกโค้ดหรือบล็อกข้อมูลเข้า repo ของ AirfieldLab (ถ้าคัดลอก repo ต้องเป็น GPL)

1. **[Y1]** Federal Aviation Administration, *Summary of the FAA's Review of the Boeing 737 MAX*, 18 พฤศจิกายน 2020, https://www.faa.gov/sites/faa.gov/files/2022-08/737_RTS_Summary.pdf . ปฐมภูมิ. สิทธิ์ ก (ใช้ pp. 23 ถึง 30)
2. **[Y2]** Komite Nasional Keselamatan Transportasi (KNKT), *Aircraft Accident Investigation Report, PT. Lion Mentari Airlines Boeing 737-8 (MAX) PK-LQP, 29 October 2018*, Final, ตุลาคม 2019, สำเนาบน https://asianaviation.com/wp-content/uploads/2018-035-PK-LQP-Final-Report.pdf (ฉบับทางการอยู่ที่ knkt.go.id). ปฐมภูมิ (สำเนาของเอกสารทางการ). เอกสารรัฐอินโดนีเซียเผยแพร่สาธารณะ สิทธิ์ ข/ค (อ้างตัวเลขได้, ไม่คัดลอกยาว) (ใช้ §1.1, §1.6.5.3 pp. 47 ถึง 50)
3. **[Y3]** Joint Authorities Technical Review (JATR), *Boeing 737 MAX Flight Control System: Observations, Findings, and Recommendations*, 11 ตุลาคม 2019, สำเนาบน https://www.flighttestsafety.org/images/JATR_Report_to_FAA_Oct_2019.pdf ; ข่าว FAA https://www.faa.gov/newsroom/finaljatrsubmittaltofaaoct2019 . ปฐมภูมิ. รายงานที่ส่ง FAA เผยแพร่สาธารณะ สิทธิ์ ข (ใช้ pp. 14, 19, 20)
4. **[Y4]** Aircraft Accident Investigation Bureau (EAIB), Ethiopia, *Final Report on the accident of Ethiopian Airlines B737-8 (MAX) ET-AVJ, 10 March 2019*, ธันวาคม 2022, สำเนาบน https://bea.aero/fileadmin/user_upload/ET_302__B737-8MAX_ACCIDENT_FINAL_REPORT.pdf . ปฐมภูมิ (สำเนา). สิทธิ์ ข/ค (ใช้ pp. 17 ถึง 30, fn3)
5. **[Y5]** Satcom Guru (ไม่ระบุผู้เขียนในหน้า; บล็อกของ P. Lemme), *Stabilizer Trim*, 12 พฤศจิกายน 2018 (แก้ 13 พ.ย.), https://satcom.guru/2018/11/stabilizer-trim.html . ทุติยภูมิ (ยกข้อความ AMM 22-11-00 และ FCOM ผ่านรายงาน AIBN). สิทธิ์ ค
6. **[Y6]** P. Lemme, Satcom Guru, *Trim Cutout with Severe Out-of-Trim Stabilizer can be difficult to recover*, 2 เมษายน 2019 และคำตอบในช่องความเห็น 5 ถึง 6 เมษายน 2019, https://www.satcom.guru/2019/04/stabilizer-trim-loads-and-range.html . ทุติยภูมิ (วิศวกรระบบการบิน). สิทธิ์ ค
7. **[Y7]** National Transportation Safety Board, *Aircraft Accident Report NTSB/AAR-99/01: Uncontrolled Descent and Collision With Terrain, USAir Flight 427, Boeing 737-300, N513AU, near Aliquippa, Pennsylvania, September 8, 1994*, รับรอง 24 มีนาคม 1999, PB99-910401, สำเนา DTIC https://apps.dtic.mil/sti/pdfs/ADA370058.pdf . ปฐมภูมิ. สิทธิ์ ก (ใช้ §1.6.2 pp. 15 ถึง 16, §1.6.3 pp. 22 ถึง 28, glossary)
8. **[Y8]** NTSB, *Safety Recommendation A-99-20 through -29* (J. Hall ถึง J. F. Garvey), 16 เมษายน 1999, สำเนา https://corpora.tika.apache.org/base/docs/govdocs1/418/418892.pdf . ปฐมภูมิ. สิทธิ์ ก
9. **[Y9]** Boeing, เอกสารวิเคราะห์ระบบ rudder ของ 737 (ชื่อไฟล์ "Boeing rudder system scenarios"; อ้าง *Boeing Contribution to the USAir Flight 427 Accident Investigation*, ตุลาคม 1996) เผยแพร่โดย FAA Lessons Learned, https://www.faa.gov/sites/faa.gov/files/2022-11/Boeing%20rudder%20system%20scenarios.pdf . ปฐมภูมิ (เอกสารผู้ผลิต). สิทธิ์ ค (ใช้ pp. 27 ถึง 31; แหล่งเดียวกับ C25 ของรอบที่ 1)
10. **[Y10]** FAA, *Airworthiness Directive 97-14-03*, Amendment 39-10060, มีผล 1 สิงหาคม 1997, https://www.faa.gov/sites/faa.gov/files/2022-11/AD97-14-03.pdf . ปฐมภูมิ. สิทธิ์ ก
11. **[Y11]** FAA, *Airworthiness Directive 99-11-05* (Amendment 39-11175), Federal Register 64(99) pp. 27905 ถึง 27911, 24 พฤษภาคม 1999, https://www.govinfo.gov/content/pkg/FR-1999-05-24/html/99-12690.htm . ปฐมภูมิ. สิทธิ์ ก
12. **[Y12]** FAA, *737 Flight Controls Engineering Test and Evaluation Board, Chapter 1.0 Findings and Recommendations* (คณะทำงานตั้ง พ.ค. 1999; ไม่ลงวันที่), https://www.faa.gov/sites/faa.gov/files/2022-11/eteb%20findings%20and%20recs%20summary.pdf . ปฐมภูมิ. สิทธิ์ ก
13. **[Y13]** "Sunny", *Boeing 737: RUDDER SYSTEM* (บล็อก ระบุว่าบทความเป็นของ D. Watts และ C. Brady จาก b737.org.uk), 25 พฤศจิกายน 2010, https://b737-sunny.blogspot.com/2010/11/rudder-system.html . ทุติยภูมิ (สำเนาบนบล็อก). สิทธิ์ ค (ความเชื่อมั่นไม่เกินกลาง)
14. **[Y14]** Norwegian Safety Investigation Authority (NSIA), *Report on the serious aircraft incident during approach to Kittilä airport, Finland, on 26 December 2012 with a Boeing 737-800, LN-DYM*, Aviation report 2015/01 eng, หน้า https://nsia.no/Aviation/Published-reports/2015-01-eng , ไฟล์ https://nsia.no/Aviation/Aviation/Published-reports/2015-01-eng?pid=SHT-Report-ReportFile&attach=1 . ปฐมภูมิ. เอกสารรัฐนอร์เวย์เผยแพร่สาธารณะ สิทธิ์ ข (ใช้ §1.1.2, §1.6.3, §1.16.7.4, fn3)
15. **[Y15]** M. Soitanen (YV3399) และ Octal450, FlightGear *737-800YV* JSBSim FDM `737-800YV.xml` (fdm name "738", สร้าง 2014-09-30), https://raw.githubusercontent.com/YV3399/737-800YV/master/737-800YV.xml ; LICENSE https://raw.githubusercontent.com/YV3399/737-800YV/master/LICENSE (GPL-2.0); hydraulics `Systems/hydraulics-jsb.xml`. ทุติยภูมิ (โมเดลเปิด อ้างรายงาน LN-DYM และรายงาน rudder ในคอมเมนต์). สิทธิ์ ง
16. **[Y16]** arvb (ไม่ระบุผู้เขียน), *B737 Flight Controls* (บันทึกส่วนตัว), 13 พฤศจิกายน 2023, https://arvb.pages.dev/vault/B737-Flight-Controls . ทุติยภูมิ ไม่อ้างแหล่ง. สิทธิ์ ค (ความเชื่อมั่นต่ำ)
17. **[Y17]** NTSB, *Aircraft Accident Report NTSB/AAR-96/01: In-flight Icing Encounter and Loss of Control, Simmons Airlines (American Eagle Flight 4184), ATR 72-212, N401AM, Roselawn, Indiana, October 31, 1994*, รับรอง 9 กรกฎาคม 1996, https://www.ntsb.gov/investigations/AccidentReports/Reports/AAR9601.pdf . ปฐมภูมิ. สิทธิ์ ก (ใช้ §1.6.3, §1.6.3.1, §1.6.4, §1.6.5; แหล่งเดียวกับ C31 ของรอบที่ 1 และ R10 ของหัวข้อ 1)
18. **[Y18]** Australian Transport Safety Bureau, *AO-2014-032 Interim report: In-flight pitch disconnect involving ATR 72, VH-FVR, near Sydney, 20 February 2014*, https://www.atsb.gov.au/sites/default/files/media/5770619/ao-2014-032-interim.pdf . ปฐมภูมิ. CC BY 3.0 AU สิทธิ์ ข
19. **[Y19]** ATSB, *AO-2014-032 Second interim report* (VH-FVR), https://www.atsb.gov.au/sites/default/files/media/5772731/ao-2014-032-second-interim-report.pdf . ปฐมภูมิ. CC BY 3.0 AU สิทธิ์ ข
20. **[Y20]** ATSB, *AO-2014-032 Final report*, 24 พฤษภาคม 2019, https://www.atsb.gov.au/sites/default/files/media/5776534/ao-2014-032_final.pdf . ปฐมภูมิ. CC BY 3.0 AU สิทธิ์ ข (ใช้ VMO 250 kt; ข้อความส่วนข้อมูลเครื่องดึงไม่ได้ในรอบนี้)
21. **[Y21]** UK Air Accidents Investigation Branch, *AAIB Bulletin 7/2012, EW/C2011/03/04, ATR 72-202, EI-SLG, 15 March 2011*, https://assets.publishing.service.gov.uk/media/5422fddc40f0b6134200086d/ATR72-202_EI-SLG_07-12.pdf . ปฐมภูมิ. © Crown, Open Government Licence สิทธิ์ ข (ใช้ pp. 14 ถึง 25)
22. **[Y22]** European Union Aviation Safety Agency, *EASA AD 2025-0004: ATA 27 Flight Controls, Rudder Travel Limitation Unit Logic, Modification* (ATR 42/72), ออก 7 มกราคม 2025 มีผล 21 มกราคม 2025, https://ad.easa.europa.eu/blob/EASA_AD_2025_0004.pdf/AD_2025-0004_1 . ปฐมภูมิ. © EASA (อนุญาตให้ทำซ้ำโดยระบุที่มา) สิทธิ์ ข/ค
23. **[Y23]** FAA, *Airworthiness Directives; ATR-GIE Avions de Transport Régional Airplanes* (NPRM, Docket FAA-2025-1354), Federal Register 7 กรกฎาคม 2025, https://www.govinfo.gov/content/pkg/FR-2025-07-07/html/2025-12563.htm . ปฐมภูมิ. สิทธิ์ ก (ยืนยันว่า FAA รับ EASA AD 2025-0004; ไม่มีตัวเลขเพิ่ม)
24. **[Y24]** KNKT, *Aircraft Accident Investigation Report KNKT.14.12.29.04, PT. Indonesia Air Asia Airbus A320-216 PK-AXC, 28 December 2014*, Final 2015, สำเนาที่ห้องสมุด Embry-Riddle https://libraryonline.erau.edu/online-full-text/ntsb/miscellaneous-reports/indonesia-air-12-14.pdf . ปฐมภูมิ (สำเนา). สิทธิ์ ข/ค (ใช้ §1.6.5.1 ถึง §1.6.5.5, §1.11, §1.16.1)
25. **[Y25]** ATSB, *AO-2008-070 Final: In-flight upset, Airbus A330-303, VH-QPA, 154 km west of Learmonth, WA, 7 October 2008*, ธันวาคม 2011, https://www.atsb.gov.au/sites/default/files/media/3532398/ao2008070.pdf . ปฐมภูมิ. © Commonwealth of Australia 2011 ไม่ใช่ CC (รายงานให้สิทธิ์ "download, print, reproduce and distribute this material" โดยระบุ ATSB เป็นแหล่ง ยกเว้นเนื้อหาของบุคคลที่สาม) สิทธิ์ ข (ใช้ §1.6.3; ผู้ตรวจแก้สัญญาอนุญาต 18 พ.ย. 2026)
26. **[Y26]** Bureau d'Enquêtes et d'Analyses (BEA), *Final Report on the accident on 1st June 2009 to the Airbus A330-203 F-GZCP, flight AF 447* (English), กรกฎาคม 2012, สำเนาที่ FAA https://www.faa.gov/sites/faa.gov/files/f-cp090601.en_.pdf . ปฐมภูมิ. สิทธิ์ ข (ใช้ §1.1 pp. 22 ถึง 23, §1.6.9.3; แหล่งเดียวกับ C27 ของรอบที่ 1)
27. **[Y27]** Airbus (S. Delannoy, C. Delmas, M. Lansonneur, P.-H. Marchetti, D. Gleizes), *Use of Rudder*, Safety First (ไม่ลงวันที่), https://safetyfirst.airbus.com/use-of-rudder/amp . ปฐมภูมิ (ผู้ผลิต). © Airbus สิทธิ์ ค
28. **[Y28]** FlyByWire Simulations, *A32NX* (GPL-3.0) branch master อ่าน 18 พฤศจิกายน 2026: `FacComputer_data.cpp`, `FacComputer.cpp`, `SecComputer_data.cpp`, `SecComputer.cpp`, `ElacComputer_data.cpp`, `ElacComputer.cpp` ใต้ https://raw.githubusercontent.com/flybywiresim/aircraft/master/fbw-a32nx/src/wasm/fbw_a320/src/model/ และ `hydraulic/mod.rs` https://raw.githubusercontent.com/flybywiresim/aircraft/master/fbw-a32nx/src/wasm/systems/a320_systems/src/hydraulic/mod.rs ; LICENSE https://raw.githubusercontent.com/flybywiresim/aircraft/master/LICENSE . ทุติยภูมิ (โมเดลจำลองที่อิง FCOM). สิทธิ์ ง
29. **[Y29]** NTSB, *Safety Recommendation A-02-01 and -02* (American Airlines 587, A300-600 rudder pedal sensitivity), 8 กุมภาพันธ์ 2002, https://www.ntsb.gov/safety/safety-recs/recletters/A02_01_02.pdf . ปฐมภูมิ. สิทธิ์ ก
30. **[Y30]** 14 CFR 25.143 Controllability and maneuverability (ถึง Amdt 25-140, 2014), ผ่าน Cornell LII https://www.law.cornell.edu/cfr/text/14/25.143 . ปฐมภูมิ (ข้อความกฎหมายที่ทำซ้ำ). สิทธิ์ ก (แหล่งเดียวกับ C8 ของรอบที่ 1)
31. **[Y31]** 14 CFR 25.255 Out-of-trim characteristics (Amdt 25-42, 1978), https://www.law.cornell.edu/cfr/text/14/25.255 . ปฐมภูมิ. สิทธิ์ ก
32. **[Y32]** 14 CFR Part 60 Appendix A (Full Flight Simulator QPS), Attachment 2, https://www.law.cornell.edu/cfr/text/14/appendix-A_to_part_60 . ปฐมภูมิ. สิทธิ์ ก (ใช้ tolerance ของ dynamic control check; ตาราง static ของ Table A2A ดึงไม่ได้ในรอบนี้)
33. **[Y33]** JSBSim-Team, `aircraft/737/737.xml` (D. Culp, Aeromatic, 2006), https://raw.githubusercontent.com/JSBSim-Team/jsbsim/master/aircraft/737/737.xml . ทุติยภูมิ (โมเดลทั่วไป elevator/aileron/rudder ±0.3 ถึง 0.35 rad ไม่ได้อิงข้อมูลจริง ใช้เพื่อเทียบเท่านั้น). GPL สิทธิ์ ง
34. **[Y34]** ไฟล์ภายในโครงการ: รอบที่ 1 หัวข้อ 6 `../01-flight-physics/06-controls.md` (C14, C17, C25, C31) และบัตรรอบที่ 3 `01-atr72-600.md` (S_h, S_v, VMO), `02-b737-800.md` (aero.spoilers, VMCA ที่ใช้ δr 26°), `03-a320-a321.md` (CLih/Cmih ของ THS, `_inherits`). ภายใน

## งานที่แนะนำสำหรับ Claude Code

1. **P1 S: โครง `CTRL` ต่อแกนและการเลือกสถาปัตยกรรม** อ่าน `controls.architecture` ของแบบเครื่องบิน แล้วเลือกเส้นทางคำนวณแรง (reversible, feel, fbw) ตามรอบที่ 1 หัวข้อ 6.6 เพิ่มฟังก์ชัน pure ใน `src/20-flight.js` หรือไฟล์ใหม่ที่ไม่ผูก DOM (ทดสอบ: T-Y-26, T-Y-27)
2. **P1 S: actuator แบบ lag + rate limit + position limit ต่อพื้นบังคับ** แทน `rate()` ที่บรรทัด 242 ถึง 245 ให้อ่าน `controls.surfaces.<x>` (travel, rate_dps, actuator_tau_s) และอัปเดตนอก RK4 ทุกก้าว (ทดสอบ: T-Y-08, T-Y-09, T-Y-14)
3. **P1 M: stabilizer/THS เป็นพื้นบังคับแยก** เพิ่มสถานะ `stab` (units สำหรับ 737, องศาสำหรับ Airbus) อัตราตามโหมดและแฟลป ขอบตามโหมด และให้ aero ใช้ `CLih`/`Cmih` จากบัตรแต่ละแบบ ปุ่ม trim ของคีย์บอร์ดสั่ง main electric (ทดสอบ: T-Y-01 ถึง T-Y-06)
4. **P1 M: spoiler mixing และ speedbrake** ตาราง 737, สมการ ATR, ตาราง SEC ของ A320 เชื่อมกับ `aero.spoilers` ของบัตรรายแบบ (ทดสอบ: T-Y-15, T-Y-16, T-Y-18, T-Y-25)
5. **P1 S: ตัวจำกัด rudder ตามความเร็ว** blowdown ของ 737, TLU ของ ATR (มี hysteresis และเวลา stroke), RTL ของ A320 (ทดสอบ: T-Y-10, T-Y-11, T-Y-20, T-Y-24)
6. **P2 M: feel ของ 737** p_feel(q̄), K(q̄), EFS, pedal feel and centering, breakout และการปลด AP ด้วยแรง ส่งออก `Fs` ให้ HUD (ทดสอบ: T-Y-07, T-Y-12, T-Y-13)
7. **P2 M: ATR แบบ reversible ด้วยค่าประมาณ** ใช้ path ของรอบที่ 1 (`controls.pitch/roll/yaw`) กับค่าในบล็อก `atr72_600` คำนวณแรงจาก hinge moment (ทดสอบ: T-Y-19, T-Y-21, T-Y-22)
8. **P2 S: ตัวแสดงแรงบนเว็บ** แถบแรงสามแกนพร้อมขีด 25.143(d) และเตือน "ควร trim" (ทดสอบ: T-Y-28)
9. **P2 M: ระบบไฮดรอลิกอย่างง่าย** สถานะแรงดันต่อระบบ (A/B/standby, G/B/Y) และกฎว่าพื้นบังคับทำงานเมื่อมีระบบใดมีแรงดัน รวม manual reversion ของ 737 สำหรับฉากฝึกเหตุฉุกเฉิน (ทดสอบ: T-Y-17)
10. **P3 S: PUM ของ ATR** เป็นเหตุการณ์ที่ตรวจจากแรงสองคัน (ทดสอบ: T-Y-23) ใช้เฉพาะโหมดสองนักบินหรือบทเรียนเหตุการณ์
11. **P3 S: ค่าที่ยังไม่พบ** ให้ผู้ดูแลบัตรรายแบบ (หัวข้อ 1 ถึง 4) พิจารณาเพิ่ม `_na` สำหรับ path hinge moment ของรอบที่ 1 (`controls.pitch.S_e`, `Ch_*`, `tab_max` ฯลฯ) ในแบบที่เป็น irreversible (737, A320 family, A330) และเติมเมื่อพบ: จำนวนรอบ trim wheel ต่อ unit ของ 737, ระยะ elevator/aileron 737 จากเอกสารปฐมภูมิ, อัตรา THS และ actuator ของ Airbus, ตาราง RTL ของ A330, อัตรา pitch trim ของ ATR


## บันทึกการตรวจทาน

วันที่ตรวจ: 2026-11-18 · ผู้ตรวจอิสระ (รอบที่ 3) · สคริปต์ของผู้ตรวจ: `scripts/yrev_*.mjs`

สรุป: ตรวจ 119 แถว (บางแถวรวมหลายตัวเลขจากประโยคเดียวกัน รวมเกิน 150 ตัวเลข) เปิดแหล่งเองทุกแถว (WebFetch สำหรับ PDF ของ NTSB, KNKT, EAIB, NSIA, JATR, FAA, ATSB, AAIB, EASA, BEA, CFR และ curl สำหรับโค้ด FlyByWire และ FlightGear) ผล: ตรง 99, แก้แล้ว 16, ยืนยันไม่ได้ 4; คำนวณผลคาดหวังของกรณีทดสอบทั้ง 28 รายการซ้ำด้วย `yrev_controls.mjs` และตรวจ JSON ทั้ง 5 บล็อก (98 leaf) ด้วย `yrev_json.mjs` ข้อผิดที่มีผลมากที่สุดคือโมเดล pressure reducer ของ 737 (T-Y-11), ความหมายของแรง 5/3.5 daN ของ sidestick (T-Y-27), สมการ EFS (T-Y-13), ขอบ trim ใน T-Y-02 และหน่วยของ kq ใน JSON

| รายการ | ค่าในรายงาน | ค่าจากแหล่ง | แหล่ง | ผล (ตรง / แก้แล้ว / ยืนยันไม่ได้) |
|---|---|---|---|---|
| 737 rudder ระยะสูงสุดจาก main PCU | ±26° | "maximum deflection of 26° to the right and the left" | [Y7] DTIC p.25 | ตรง |
| 737 rudder อัตรา (สอง slide) | 66°/s | "maximum rate of 66° per second" | [Y7] p.25 | ตรง |
| 737 แรง main rudder PCU | 5,900 lbf (26.2 kN) | "about 5,900 pounds of output force" | [Y7] p.25 | ตรง (5,900 × 4.448 = 26,245 N) |
| 737 pedal ต่อมุม rudder / ระยะเต็ม | 1 in ต่อ 6.5°, 4 in | "about 1 inch ... for every 6.5°", "maximum travel of about 4 inches" | [Y7] p.25 | ตรง |
| 737 pedal stop | "stop ที่ pedal 28°" | "set to provide a mechanical stop at 28° of rudder travel" | [Y7] p.25 | แก้แล้ว (ถ้อยคำ: stop ของ pedal ที่ rudder 28°) |
| 737 แรง pedal feel and centering | 9 ถึง 70 lbf; เต็ม 70 lbf | "about 9 to 70 pounds", "full rudder deflection is about 70 pounds" | [Y7] pp.25–26 | ตรง |
| 737 แรงเกิน jam | 300 lbf ต่อ in | "about 1 inch for each 300 pounds of rudder pedal force" | [Y7] p.26 | ตรง |
| 737 rudder trim | ±16°, 0.5°/s | "about 0.5° per [second]", "± 16°" | [Y7] pp.26–27 | ตรง |
| 737 yaw damper | ±3°, 50°/s | "up to 3° ... at a rate of 50° per second" | [Y7] p.27 | ตรง |
| 737 แรงดันไฮดรอลิก | ราว 2,950 psi; standby "ไม่ระบุ" | "each of which [three systems] is capable of operating pressures of about 2,950 psi" | [Y7] p.15 | แก้แล้ว (standby ก็ 2,950 psi ตาม NTSB) |
| 737-300 pressure reducer | 3,000 → 1,000 psi | "from 3,000 to 1,000 psi" (-300/-400/-500); 1,400 psi สำหรับ -100/-200 | [Y7] glossary p.xvii | ตรง |
| 737 manual reversion | 40 lbf wheel, 60 lbf column | "approximately 40 pounds ... to initiate a roll", 60 lb ที่ column | [Y7] p.16 fn39 | ตรง |
| 737 CWS | 10 lbf | "force of 10 pounds is applied to the yoke ... reverts into CWS" | [Y7] p.22 (ยกจาก Boeing *Airliner*) | ตรง |
| 737 rudder อัตรา primary slide อย่างเดียว | 33°/s | "approximately 33 degrees per second (no air load)"; สองตัว "approximately 66" | [Y9] p.29 | ตรง |
| 737 blowdown ที่ USAir 427 | 14° ถึง 21° | "varies between 14 and 21 degrees for Flight 427" (ไม่ระบุความเร็ว/sideslip ในหน้านั้น) | [Y9] p.31 | ตรง (ความเร็ว 190 kt flaps 1 มาจาก [Y8]) |
| 737 yaw damper stop | 3° | "only allows it to command three degrees of rudder" | [Y9] p.29 | ตรง |
| 737 rudder 26° และ 190 kt flaps 1 | 26°; ราว 190 kt flaps 1 | "travel as much as 26° in either direction"; "190 knots ... flaps 1 configuration" (block maneuvering speed) | [Y8] | ตรง |
| 737 ระบบที่ pressure reducer ลด | สมการเดิมคูณ p/p_full = 1/3 กับแรง PCU ทั้งตัว | "reduction in System A hydraulic pressure"; RPR ติดที่ "A system pressure side of the rudder PCU", ลด authority "approximately one-third" | [Y12] p.1-4; [Y13] | แก้แล้ว (f_PCU = (1 + p_A/p_full)/2) |
| 737 ความสูงที่ลดแรงดัน (Classic) | 1,000 ft ขาขึ้น / 700 ft ขาลง | ETEB: "above 1,000 feet AGL on takeoff ... above 700 feet AGL on landing"; AD 99-11-05: "below 750 feet during landing" | [Y12] p.1-4; [Y11] | ตรง (เพิ่มความขัดแย้ง 700/750 ft) |
| T-Y-11 δr,max ที่ 250 KCAS เมื่อ reducer ทำงาน | 4.0° / 7.3° | คำนวณใหม่ (ลดเฉพาะระบบ A): 8.09° / 9.70° | `yrev_controls.mjs` | แก้แล้ว |
| T-Y-10 blowdown 150/190/250/280/340 KCAS | 26.0, 21.0, 12.1, 9.7, 6.6° | 26.00, 21.00, 12.13, 9.67, 6.56°; q̄b 4,726 Pa (170.8 kt) | `yrev_controls.mjs` | ตรง |
| 737 yaw damper (บล็อก) | ราว ±2.5° | "approximately +/-2.5 degrees" | [Y13] | ตรง |
| 737 rudder ที่ cruise (บล็อก) | "around ±8 degrees at a typical cruise altitude" | ตรงตามคำพูด | [Y13] | ตรง |
| การแปลงหน่วย psi→Pa, lbf→N, in→m ใน JSON | 20,684,271; 1,241,056; 9,652,660; 5,860,543; 6,894,757 Pa; 26,245 N; 2,671 N/m; 52,538 N/m; 0.00391 m/deg | ค่าเดียวกันทุกตัว | `yrev_controls.mjs` conv | ตรง |
| 737 stab ช่วงกลไก | 4.2° LE up ถึง 12.9° LE down รวม 17.1° = 17.1 units | "maximum of 4.2 degrees leading-edge up and 12.9 degrees leading-edge down"; "17.1 degrees (or units)" | [Y2] p.47 | ตรง |
| 737 stab 0° | 4 units | "at a position of 0 degrees ... will indicate 4 units"; ET302 fn3 "A value of 4 units corresponds to a neutral position" | [Y2] p.47; [Y4] p.20 fn3 | ตรง |
| 737 ช่วง indicator | −0.2 ถึง 16.9 units (กลาง) | KNKT: "indicator is at the 0 position ... full leading-edge up"; ET302 "0 unit nose down to 17 unit nose up" | [Y2] p.47; [Y4] fn3 | แก้แล้ว (ลดเป็นต่ำ เพิ่มความขัดแย้ง) |
| 737 main electric flaps up | 0.2°/s | "trim rate of 0.2 degrees per second, which is greater than the autopilot trim rate" | [Y3] p.19 O3.8-A | ตรง |
| 737 mistrim 25.255 | 0.6 unit จาก 3 s × 0.2°/s | "acceptable for a 0.6 unit nose-down out-of-trim condition ... determined by 3 seconds of trim input" | [Y3] p.19 | ตรง |
| MCAS / Speed Trim flaps down | 0.27°/s | "MCAS moves the horizontal stabilizer at a rate of 0.27 degrees per second ... same trim rate as Speed Trim with flaps down" | [Y1] p.23; [Y3] p.14 | ตรง |
| MCAS ต่อครั้งที่ Mach ต่ำ | ≤ 2.5° | "up to the maximum of 2.5 degrees" | [Y1] p.23–24 | ตรง |
| KNKT AND trim | 6.1 → 3.8 units ใน ~10 s | "active for about 10 seconds"; "decreased from 6.1 to 3.8 units" | [Y2] p.21 | ตรง |
| KNKT แรง column | 65, 82, 93 lbf | "82 lbs", "65 lbs. of back pressure", "93 lbs" | [Y2] p.27 | ตรง |
| ET302 MCAS ครั้งแรก | 9 s, 4.6 → 2.1 units (0.278 u/s) | "engaged for 9 seconds positioning the stabilizer trim to 2.1 units"; AP trim "to 4.6 units" | [Y4] pp.17, 23 | ตรง |
| ET302 แรง column | > 90, ถึง 110, ถึง 180 lbf | "more than 90lbs", "calculated column force of up to 110lbs", "calculated force of up to 180lbs" | [Y4] pp.17, 18, 30 | ตรง (เพิ่มบริบทว่า 110 lbf อยู่หลัง 05:43:21 ที่ความเร็วเกิน 340 kt) |
| 737-800 elevator อัตราปกติ / เมื่อติดน้ำแข็ง | 50°/s; 0.2°/s (1:250) | "With only 0.2°/second, compared with the normal 50°/second"; "ratio of 1:250" | [Y14] §1.1.2.7 | ตรง |
| 737-800 แรงดัน PCU | 3,000 psi | "The PCUs are controlled by a 3 000-psi hydraulic system pressure" | [Y14] §1.6.3.4 | ตรง |
| LN-DYM แรงรวม | 174 lbf | "used a total force of 174 lb" | [Y14] §1.1.2.6 | ตรง |
| AP override | > 25 lbf ช่องเดียว, > 50 lbf สองช่อง | "More than 25 lb ... channel A or B"; "more than 50 lb ... both" | [Y14] fn3 | ตรง |
| Mach trim | เหนือ M 0.615 | "Mach Trim is only active at speeds above 0.615 Mach" | [Y14] §1.16.7.4 | ตรง |
| feel pressure | 180 ถึง 1,400 psi | "varies between 180 psi (base feel) and 1400 psi (maximum)" | [Y5] | ตรง |
| EFSM | 850 psi ระบบ A, ×4 ที่ AoA 8 ถึง 11° | "850 psi hydraulic system A pressure"; "four times the forces"; "AOA of 8 to 11 degrees depending on flap position" | [Y5] | ตรง |
| elevator down-rig | 4° ที่ 4 units | "down-rigged 4 degrees when the stabilizer is at the neutral position (4 units of trim)" | [Y5] | ตรง |
| AP trim | 10 % ถึง 25 %, หยุด < 2 %, ไม่ nose-down < 60 ft RA | ตรงตามคำพูดทั้งสามข้อ | [Y5] | ตรง |
| main electric flaps down, AP | 0.4°/s; 0.09/0.27°/s | "The pilot speeds are 0.2/0.4 deg/sec"; "The autopilot is 0.09/0.27 deg sec" (Lemme, 6 เม.ย. 2019) | [Y6] | ตรง |
| electric trim flaps up | 3.9 ถึง 14.5 | "about 3.9 degrees to 14.5 degrees" | [Y6] บทความ 2 เม.ย. 2019 | ตรง (การตีความเป็น units ยังเป็นของผู้เขียน) |
| EFS ของ NG | ×2 "ตาม AMM ที่ยกมาใน [Y6]" | "This approximately doubles control column forces" เป็นคำของผู้แสดงความเห็น (Andy) ที่ยก "737 NG manual" ไม่ใช่ AMM หรือ Lemme | [Y6] ความเห็น 5 เม.ย. 2019 | แก้แล้ว (ระบุผู้พูด ลดเป็นต่ำในหมายเหตุ JSON) |
| ATR aileron / wheel / balance tab | ±14°, ±65°, ±4° | "approximately +/-14 degrees, +/-65 degrees, and +/-4 degrees, respectively" | [Y17] p.19 | ตรง |
| ATR cable tension regulator | 20 ถึง 25 daN | "maintains 20 to 25 deca-newtons (daN)" | [Y17] p.19 | ตรง |
| ATR roll spoiler | เริ่ม 2.5° TE up, เชิงเส้นถึง 57° ที่ 14° | "activate at an aileron deflection of 2.5 degrees trailing edge up"; "linear up to 57 degrees for 14 degrees" | [Y17] p.19 | ตรง |
| ATR AP disconnect | 3.6°/s | "a predetermined rate of travel for the ailerons (3.6 degrees per second)" | [Y17] p.26 | ตรง |
| ATR rudder / TLU | ±27°; ราว ±3° (6° รวม) เหนือ 185 KIAS | "maximum low speed deflection of 27 degrees each side"; "about 3 degrees each side of neutral (6 degrees total) at speeds above 185 KIAS" | [Y17] p.22 | ตรง |
| ATR TLU override | 15 s | "full rudder authority will be available 15 seconds after override switch activation" | [Y17] p.23 | ตรง |
| ATR stick pusher | 8° nose down | "moves the column to the 8-degree nose-down position" | [Y17] p.24 | ตรง |
| ATR แรง wheel ออกแบบ / ธง DFDR | < 60 lbf; 22 lbf | "maximum control wheel forces of less than 60 pounds"; "more than 22 pounds of force" | [Y17] p.19, fn17 | ตรง |
| ATR elevator | 23° NU, 13° ND | "elevator deflection limits are 23° nose up to 13° nose down" | [Y19] p.2 | ตรง |
| ATR column | 11.25°/6.75°, stop 13.25°/8.75° | ตรงตามคำพูด (stop อยู่ใน fn3) | [Y19] p.2 | ตรง |
| ATR ความยืดหยุ่นที่ VMO | 6.8° → 8.5° | "control column positions would be 6.8°", "elevator deflections would be 8.5°" (หลัง pitch disconnect ที่ VMO) | [Y19] p.3 | ตรง |
| ATR แรงทดสอบรับรอง | 62/56 daN "ที่ราว 154 kt ขณะ elevator −23°/11°" | "maximum recorded pitch axis efforts were 62 daN and 56 daN"; ผลต่าง elevator สูงสุด 34° (−23°/11°) เป็นอีกประโยค | [Y19] p.7 | แก้แล้ว (ถ้อยคำ: แรงสูงสุดของการทดสอบ ไม่ได้ผูกกับมุมนั้น) |
| ATR VMO | 250 kt | "15.6° at 250 kt (VMO)"; "70 knots below VMO" ที่ 180 kt | [Y19] pp.6, 8 | ตรง (ยืนยันจาก [Y19] ด้วย) |
| ATR PUM | 50 ถึง 55 daN ต่อคัน; ผลต่าง 100 ถึง 110 daN | "opposing forces of 50 to 55 daN ... simultaneously applied to each control column"; VH-FVR แยกที่ผลต่าง "about 75 daN" | [Y18] pp.5, 15 | ตรง (เพิ่มค่า 75 daN ของเหตุการณ์จริง) |
| ATR สถาปัตยกรรม | กลไกทั้งหมดยกเว้น spoiler | "All of the controls except the spoilers are mechanically actuated" | [Y18] p.4 | ตรง |
| ATR TLU กลับ low speed / เข้า high speed | < 180 kt / > 185 kt | "extends when at least one ADC signals ... less than 180 kt"; "retracts when both ADCs signal ... greater than 185 kt" | [Y21] p.16 | ตรง (เพิ่มเงื่อนไข ADC ทั้งสองตัว) |
| ATR TLU stroke | 15 s auto, 30 s manual | "approximately 15 seconds" (automatic); "approximately 30 seconds" (manual) | [Y21] pp.16–17 | ตรง |
| ATR rudder ทดสอบบนพื้น (EI-SLG) | 21° | "maximum rudder deflection produced during testing on the ground ... was 21°" | [Y21] p.20 | ตรง |
| TLU ATR 72 / ATR 42, วันที่ AD | 185 kt / 195 kt; ออก 7 ม.ค. 2025 มีผล 21 ม.ค. 2025 | "above 185 kt (ATR72) or 195 kt (ATR42)"; "Issued: 07 January 2025", "Effective Date: 21 January 2025" | [Y22] | ตรง |
| A320 elevator / THS | 30° NU 17° ND; 13.5° NU 4° ND | "maximum elevator deflection is 30 ° nose up, and 17 ° nose down"; "maximum THS deflection is 13.5 ° nose up, and 4 ° nose down" | [Y24] §1.6.5.1 p.29 | ตรง |
| A320 yaw damper alternate law | ±5° | "Damper authority is limited to ±5° of rudder deflection" | [Y24] §1.6.5.2 | ตรง |
| A320 dual input | 2° | "simultaneous input on both sidesticks (2° deflection off the neutral position ...)" | [Y24] p.34 | ตรง |
| A320 "sidestick breakout" 5/3.5 daN | ใช้เป็น breakout ของการบินด้วยมือ (Fbo 50/35 N) | "When the autopilot is engaged, a solenoid-operated detent locks both sidesticks ..."; เกิน 5/3.5 daN "the stick becomes free and the autopilot disengages" | [Y24] §1.6.5.3 p.33 | แก้แล้ว (เป็นแรงปลด AP; breakout ด้วยมือไม่พบ; T-Y-27 เขียนใหม่) |
| A320 ECAM RTL | "RUD WITH CARE ABV 160 KT" | ข้อความเดียวกัน | [Y24] p.66 | ตรง |
| A320 sidestick travel | ±16° pitch, ±20° roll (อนุมาน) | FDR บันทึก "SIC P: -16°", "PIC ... R: -20°" | [Y24] p.59 | ตรง (เป็นค่าที่บันทึก ไม่ใช่ข้อความระบุระยะ ความเชื่อมั่นกลางเหมาะสม) |
| A330 elevator / THS | 30° NU 15° ND; 14° NU 2° ND | "Maximum elevator deflection was 30° nose-up and 15° nose-down"; "Maximum THS deflection was 14° nose-up and 2° nose-down" | [Y25] p.13 | ตรง |
| A330 คอมพิวเตอร์ / rudder | 3 PRIM + 2 SEC; รุ่นพื้นฐานกลไก รุ่น enhanced FBW | "three ... PRIMs", "two ... SECs"; fn25 "Basic models have a mechanically-controlled rudder while the later enhanced models have fly-by-wire rudder control" | [Y25] pp.11–12 | ตรง |
| AF447 THS | 3° → 13° ใน ~1 นาที (0.17°/s เฉลี่ย) | "moved from 3 to 13 degrees pitch-up in about 1 minute and remained in the latter position until the end of the flight" | [Y26] pp.22–23 | ตรง (10°/60 s = 0.167°/s) |
| A320 RTL ตาราง FAC | 100…400 kt → 25, 25, 14.5, 8.8, 4.8, 3.4, 3.4° | `{ 25.0, 25.0, 14.5, 8.8, 4.8, 3.4, 3.4 }` คู่กับ `{ 100.0, 160.0, 200.0, 240.0, 320.0, 380.0, 400.0 }` | [Y28] FacComputer_data.cpp บรรทัด 2036–2038 | ตรง |
| A320 speedbrake ตาราง SEC | lever 0, 0.05, 0.051, 0.5, 1 → 0, 0, 2, 25, 40° | `{ 0.0, 0.0, -2.0, -25.0, -40.0 }` กับ `{ 0.0, 0.05, 0.051, 0.5, 1.0 }`; ground −50 | [Y28] SecComputer_data.cpp บรรทัด 1625–1643 | ตรง |
| A320 aileron | ±25° | ค่า 25.0/−25.0 ใน ElacComputer_data.cpp บรรทัด 2194–2200 (ไม่มีชื่อพารามิเตอร์ในไฟล์ data) | [Y28] | ตรง (การตีความว่าเป็นขีด aileron ยังเป็นของผู้เขียน คงความเชื่อมั่นต่ำ) |
| A320 ไฮดรอลิก spoiler | 1, 5 = G; 2, 4 = Y; 3 = B "โดยนัย" | mod.rs: `left_spoilers.actuator(0)`/`(4)` ใน green_circuit, `(1)`/`(3)` ใน yellow, `(2)` ใน blue; แรงดันเป้า 3000 psi | [Y28] hydraulic/mod.rs | แก้แล้ว (ยืนยันตรง ไม่ใช่โดยนัย) |
| สัญญาอนุญาต FBW / 737-800YV | GPL-3.0 / GPL-2.0 | LICENSE: "GNU GENERAL PUBLIC LICENSE Version 3" / "Version 2, June 1991" | [Y28]; [Y15] | ตรง |
| 737-800YV elevator | −0.336 / +0.3875 rad (19.3° / 22.2°), 50°/s | `<min>-0.336</min><max> 0.3875</max>`; คอมเมนต์ "from report about Norwegian Air LN-DYM. Rate is 50 deg/sec" | [Y15] บรรทัด 541–552 | ตรง (ทิศยังเป็นการตีความ) |
| 737-800YV aileron | −0.358 rad (20.5° ขึ้น) / +0.271 rad (15.5° ลง); droop 1.04° | −0.3577924967 ที่ roll −1 (ปีกซ้ายขึ้นเมื่อ roll ซ้าย), 0.2705260341 ที่ +1, 0.0181999444 ที่ 0 | [Y15] ตาราง Left Aileron Control | ตรง |
| 737-800YV spoiler roll (low) และ speedbrake | 0.149→0, 0.23→3.09, 0.483→10.07 … 0.966→33.02; lever 0.65→25, 1→33; แผ่นใน 38; 0.6 s | ตารางเดียวกันทุกจุด; แผ่นใน lever 0.65→32, 1→38, clip 38; kinematic 0.6 s | [Y15] บรรทัด 875–1185 | ตรง (เพิ่มค่าแผ่นใน 32° ใน T-Y-16) |
| T-Y-15, T-Y-24, T-Y-25 | 0.0/10.72/33.02; 25.0/19.75/8.30/6.30/4.10; 12.19/25.0/32.5/40.0 | คำนวณซ้ำได้ค่าเดียวกัน | `yrev_controls.mjs` | ตรง |
| 25.143(d) ขีดแรง | pitch 75/50/10, roll 50/25/5, yaw 150/20 lbf (334/222/44.5; 222/111/22.2; 667/89 N) | ตาราง (d): two hands 75/50, one hand 50/25, yaw 150, long term 10/5/20 | [Y30] | ตรง |
| 25.255 | 3 s ที่อัตราปกติ, −1 ถึง +2.5 g, 1.5 g, 125 lbf (556 N) | (a)(1) "three-second movement ... at its normal rate"; (c)(1) "−1 g to + 2.5 g"; (f) "at least 1.5 g", "not more than 125 pounds" | [Y31] | ตรง |
| Part 60 dynamic tolerance | ±2 lb (8.9 N) หรือ ±10 %; T(P0) ±10 % | 4.c.(1)(d)(ii) "Dynamic test—±2 lbs (0.9 daN) or ±10% on dynamic increment above static test"; 4.b.(2)(a) "T(P0): ±10% of P0" | [Y32] Attachment 2 | ตรง (±2 lb เป็นของ "alternative method") |
| A300-600 pedal (NTSB A-02-01) | < 165 kt ±30°, 4.0 in, 65 lbf; 250 kt ±9.3°, 1.3 in, 32 lbf; breakout 22 lbf | "lower than 165 knots ... +/-30°, ... about 65 pounds ... about 4.0 inches"; "at 250 knots ... about +/-9.3° ... about 32 pounds ... about 1.3 inches"; "breakout force of about 22 pounds" | [Y29] | ตรง |
| Airbus Safety First pedal 16 % | "equivalent to the rudder travel limit at 290 kt" | "the 16 % position equivalent to the rudder travel limit at 290 kt" | [Y27] | ตรง |
| ชนิด rudder ของ A320neo/A321neo | "ที่ส่งมอบใหม่บางลำมีระบบ rudder แบบไฟฟ้า (ไม่ได้ยืนยัน)" | rudder กลไก: "A320 family aircraft (except A321 XLR)" | [Y27] | แก้แล้ว (ทั้งตระกูลกลไก ยกเว้น A321XLR) |
| 737 flight spoiler | 4 ต่อปีก, เริ่ม ~10°, เกือบเต็ม > 70° ของ wheel | "8 flight spoilers"; "more than 10 degrees or so"; "approach their maximum ... more than 70 degrees" | [Y16] | ตรง |
| 737 speedbrake / ground spoiler | ห้ามใช้ < 1,000 ft RA; RA < 10 ft และล้อ > 60 kt | "should not be used in flight below 1,000 ft radalt"; "Radalt <10 ft", "Main wheels spinning >60 kts" | [Y16] | ตรง |
| 737 STS | 100 kt ถึง M 0.60, 10 s, 5 s, AP off | ตรงในรายการแรก แต่รายการที่สองของหน้าเดียวกันเขียน "Speed < Mach 0.68" | [Y16] | แก้แล้ว (เพิ่มความขัดแย้งภายในแหล่ง) |
| 737 ช่วง indicator (Y16) | −0.2 ถึง 16.9 | "with a range of -0.20 to 16.9 units" | [Y16] | ตรง (แต่ขัดกับ KNKT ดูแถวก่อนหน้า) |
| T-Y-01 δs ที่ 0, −0.2, 4, 16.9 units | 4.0, 4.2, 0.0, −12.9 | 4.0, 4.2, 0.0, −12.9 | `yrev_controls.mjs` T01 | ตรง |
| T-Y-02 เวลาเต็มช่วง main electric flaps up | 85.5 s จาก −0.2 ถึง 16.9 | ขอบ electric flaps up ของรายงานเอง (3.9 ถึง 14.5) ให้ 53.0 s; 85.5 s ใช้ได้เฉพาะเมื่อไม่มีขอบ | `yrev_controls.mjs` T02 | แก้แล้ว |
| T-Y-03, 04, 05, 06 | 0.60; 9.26 s, 0.278 u/s; 2.70/0.90; 14.5 | 0.60; 9.26 s, 0.278 u/s (KNKT 0.23 ต่ำกว่า 14.8 %); 2.70/0.90; 14.5 | `yrev_controls.mjs` | ตรง |
| T-Y-07, 08, 09 | 4.00 in, 70 lbf (311 N); 2.0 in, 39.5 lbf; 0.394/0.788 s; 0.06 s | 4.000 in, 70.0 lbf (311.4 N); 2.00 in, 39.5 lbf; 0.394/0.788 s; 0.060 s | `yrev_controls.mjs` | ตรง |
| T-Y-12 feel | 417.5 psi 24.3 lbf; 839.6 psi 44.9 lbf; 1,400 psi 110 lbf | 417.5/24.32; 839.6/44.87; 1,400/110.0 | `yrev_controls.mjs` feel | ตรง |
| T-Y-13 EFS | 48.6 lbf (2 เท่า) | สมการเดิม (f_EFS คูณเฉพาะ K) ให้ 44.64 lbf; ถ้าคูณทั้งแรงได้ 48.64 | `yrev_controls.mjs` feel | แก้แล้ว (แก้สมการให้คูณทั้งแรง ตรงกับคำว่า "doubles control column forces") |
| JSON `kq` และ `q_sat_Pa` | `kq_Pa_per_Pa` 0.06511; 18,750 Pa | 0.06511 เป็น psi/Pa; SI = 448.9 Pa/Pa; q̄(340 KCAS) = 18,739 Pa | `yrev_controls.mjs` feel | แก้แล้ว |
| column gradient ที่ 250 KCAS | 8.2 lbf/deg (36.3 N/deg) | 8.173 lbf/deg = 36.36 N/deg | `yrev_controls.mjs` feel | ตรง |
| T-Y-14 t90 | 0.196, 0.362, 0.279, 0.242 s | Euler 0.196, 0.362, 0.279, 0.242; exact discretisation 0.196, 0.362 | `yrev_controls.mjs` T14 | ตรง (JSON เขียนว่า "exact" แต่สมการเป็น Euler แก้ถ้อยคำแล้ว) |
| T-Y-18, 19, 20, 23 | 0/27.26/57; 2.04/1.93; 15/3/3/15/27; แยก/ไม่แยก | 0/27.26/57; 2.044/1.926; 15/3/3/15/27; true/false | `yrev_controls.mjs` | ตรง |
| T-Y-21 ATR roll | 60, 21.6, 15.6 lbf; Ch −0.0667; gearing 1.197 | 60.0, 21.6, 15.55 lbf; 0.0667; 1.197 | `yrev_controls.mjs` T21 | ตรง |
| T-Y-22 ATR pitch | 50, 18.3, 28.7 daN; Ch −0.0519; gearing 3.717 | 50.0, 18.33, 28.65 daN; 0.0519; 3.717 | `yrev_controls.mjs` T22 | ตรง (เลขถูก แต่ฐานการคาลิเบรตมีข้อสงสัย ดูด้านล่าง) |
| T-Y-27, T-Y-28, 25.255, Part 60 | 11.24/7.87 lbf; 44.5/222.4/333.6 … 667.2 N; 556 N; 8.9 N | 11.24/7.87; 44.5/222.4/333.6, 22.2/111.2/222.4, 89.0/667.2; 556.0; 8.90 | `yrev_controls.mjs` T27, T28 | ตรง |
| ทิศ/เครื่องหมาย stab กับ elevator | δs = 4 − units, บวก = LE up = ก้มหัว = ทิศเดียวกับ elevator บวก (TE down) | LE up เพิ่มแรงยกหาง → โมเมนต์ก้มหัว; units มากขึ้น = nose up = LE down สอดคล้อง | ตรวจด้วยเหตุผลเชิงกล | ตรง |
| บล็อก JSON ทั้งหมด | 5 บล็อก, 98 leaf | parse ได้ทุกบล็อก, คีย์บนสุดคีย์เดียว, leaf มี 7 ฟิลด์ครบ, src อยู่ในรายการ Y1 ถึง Y34 หรือ R1:, ไม่มี `controls.fbw`, ไม่มี conf สูงคู่กับ est true | `yrev_json.mjs` | ตรง |
| ความสอดคล้องของ conf กับกฎใน 3.7.3 ("ลดเป็นกลางเมื่อใช้ค่าของรุ่นอื่นกับ -800") | surfaces.rudder, yaw.stops, yaw.rate_limit, feel.pedal, feel.manual_reversion_forces ของ 737 เป็นสูง; ATR yaw.stops สูงแต่หมายเหตุบอกกลาง | ค่าเหล่านี้มาจาก 737-300 / ATR 72-212 | [Y7]; [Y17] | แก้แล้ว (ลดเป็นกลาง; surfaces.rudder ตั้ง est true เพราะมี τ ที่เลือกเอง) |
| AD 97-14-03 | Amdt 39-10060, มีผล 1 ส.ค. 1997, "at flight conditions where full rudder authority is not required" | ตรงทั้งสามข้อ (เอกสารไม่ระบุระบบหรือ psi) | [Y10] | ตรง |
| ไฟ EFS / FEEL DIFF PRESS | ติดเมื่อ EFS ทำงานต่อเนื่องเกิน 30 s | "will illuminate if EFS operates continuously for more than 30 seconds" | [Y2] §1.6.5.x | ตรง |
| 737 main electric / AP มีสองอัตรา | flaps down เร็วกว่า flaps up | "two rates: high trim rate with flaps extended and low trim rate with flaps retracted" (ไม่มีตัวเลข) | [Y2] p.48 | ตรง (ตัวเลข 0.4/0.09/0.27 มาจาก [Y6] เท่านั้น ความเชื่อมั่นกลางเหมาะสม) |
| สัญญาอนุญาต ATSB interim AO-2014-032 | CC BY 3.0 AU | "licensed under a Creative Commons Attribution 3.0 Australia licence" (Interim 15 June 2016) | [Y18] | ตรง |
| สัญญาอนุญาต ATSB AO-2008-070 | CC BY 3.0 AU | "© Commonwealth of Australia 2011" + "you may download, print, reproduce and distribute this material ... acknowledging the ATSB" (ไม่ระบุ CC) | [Y25] | แก้แล้ว |
| ทิศของมุม elevator 737-800YV | 22.2° ขอบท้ายขึ้น, 19.3° ลง | ไฟล์มีเพียง min −0.336 / max +0.3875 rad ไม่ระบุทิศ; ไม่พบเอกสาร Boeing | [Y15] | ยืนยันไม่ได้ (คง est/ต่ำ) |
| A320 rudder trim ±20° | ±20° จาก FacComputer_data.cpp | มีค่า 20.0/−20.0 ในบรรทัด 2033–2034 ติดกับตาราง RTL แต่ไฟล์ data ไม่มีชื่อพารามิเตอร์ | [Y28] | ยืนยันไม่ได้ (คงต่ำ) |
| A320 roll spoiler 35 | "35 ในโมเดลน่าจะเป็น rate limit" | มีค่า 35.0 หลายตำแหน่งใน SecComputer_data.cpp ไม่มีชื่อพารามิเตอร์ | [Y28] | ยืนยันไม่ได้ (คงต่ำ) |
| ตำแหน่ง elevator pitot | บนหางดิ่ง | [Y5] เขียนเพียง "pitot pressure" เป็นอินพุตของ feel computer ไม่ระบุตำแหน่ง | [Y5] | ยืนยันไม่ได้ (ไม่กระทบตัวเลข) |

**รายการแก้ไข**

1. ตาราง 3.7.3.1: แรงดันของระบบ standby เปลี่ยนจาก "ไม่ระบุ" เป็นราว 2,950 psi เพราะ NTSB ให้ค่านี้กับทั้งสามระบบ [Y7] p.15
2. ตาราง 3.7.3.5: "stop ที่ pedal 28°" เปลี่ยนเป็น "stop เชิงกลของ pedal ตั้งไว้ที่ rudder 28°" ตามถ้อยคำ NTSB
3. **โมเดล pressure reducer ของ 737 (3.7.3.5, 3.7.6.4, JSON `rudder_limiter`, T-Y-11)**: ฉบับเดิมคูณอัตราส่วนแรงดัน p/p_full = 1/3 กับแรงของ PCU ทั้งตัว แต่ ETEB [Y12] และ [Y13] ระบุว่าลดเฉพาะระบบ A ส่วนระบบ B ยังเต็ม (NTSB p.29: แต่ละระบบให้แรงราว 3,000 lbf) จึงแก้เป็น f_PCU = (1 + p_A/p_full)/2 ผลที่ 250 KCAS เปลี่ยนจาก 4.0° เป็น 8.1° (1,000 psi) และจาก 7.3° เป็น 9.7° (1,800 psi) เพิ่ม `reduced_system` และ `pcu_force_fraction_reduced` ใน JSON
4. เพิ่มความขัดแย้งระดับความสูงขาลง 700 ft (ETEB) กับ 750 ft (AD 99-11-05) และค่า 1,400 psi ของ 737-100/-200 จาก glossary ของ NTSB
5. ตาราง 3.7.3.3 และความขัดแย้งข้อ 4: ช่วง indicator −0.2 ถึง 16.9 units ลดความเชื่อมั่นจากกลางเป็นต่ำ และยกข้อความ KNKT p.47 ที่ว่า indicator 0 = stab LE up สุด ซึ่งขัดกับการคำนวณ 1 unit = 1° (ความต่าง 0.2 unit)
6. 3.7.3.2 (Kmax): ระบุบริบทของแรง 110 lbf ใน ET302 (หลัง 05:43:21, stab 2.3 → ราว 1 unit, ความเร็วเกิน 340 kt) และเหตุผลที่การคาลิเบรตยังใช้ได้ (p_feel อิ่มตัว)
7. 3.7.3.2 และ JSON `feel.elevator_feel_computer`: แก้ที่มาของ EFS ×2 จาก "AMM ที่ยกมาใน [Y6]" เป็นข้อความคู่มือ 737 NG ที่ผู้แสดงความเห็นยกมา (ความเชื่อมั่นต่ำ) และแยกออกจากค่า 180/1,400/850 psi ที่ [Y5] ระบุตรง ๆ
8. ตาราง 3.7.4.1: แรง 62/56 daN ของการทดสอบรับรองเป็นค่าสูงสุดของการทดสอบ ไม่ได้ผูกกับ elevator −23°/11° ตามที่ฉบับเดิมเขียน แก้ถ้อยคำ
9. 3.7.4.1 (PUM ในเครื่องจำลอง): เพิ่มว่า ATSB p.15 พบการแยกจริงที่ผลต่างราว 75 daN จึงระบุว่าเกณฑ์ 100 daN เป็นค่าออกแบบ
10. **Sidestick ของ A320 (3.7.0, 3.7.2, 3.7.5.1, 3.7.6.2, JSON `inceptors.sidestick`, T-Y-27)**: 5/3.5 daN ใน KNKT คือแรงที่ทำให้คันที่ถูก solenoid detent ล็อกขณะ AP ทำงานเป็นอิสระและ AP ปลด ไม่ใช่ breakout ของการบินด้วยมือ แก้ชื่อ leaf จาก `breakout_N` เป็น `ap_override_N` เพิ่มแถว "breakout ขณะบินด้วยมือไม่พบ" และเขียน T-Y-27 ใหม่เป็นการทดสอบการปลด AP (ผู้ดูแลหัวข้อ 8 ควรตรวจว่าใช้ 50/35 N เป็น breakout ใน `controls.fbw.sidestick` หรือไม่)
11. ตาราง 3.7.4.3 และ TLU ในเครื่องจำลอง: เพิ่มเงื่อนไขของ AAIB ว่าเข้า high speed เมื่อ ADC ทั้งสองตัวเกิน 185 kt และกลับ low speed เมื่อ ADC ตัวใดตัวหนึ่งต่ำกว่า 180 kt
12. ตาราง 3.7.5.1 และ JSON `a320ceo.controls.hydraulics`: การแบ่ง spoiler 3 = B ยืนยันจาก `hydraulic/mod.rs` จึงตัดคำว่า "โดยนัย"
13. T-Y-16: เพิ่มผลคาดหวังของแผ่นใน (32° ที่ lever 0.65 และ 38° ที่เต็ม) ตามตารางของโมเดล 737-800YV เพื่อไม่ให้ผู้ทดสอบใช้ 25/33 กับทุกแผ่น
14. หมายเหตุใต้ตาราง 3.7.2: แก้ข้อความที่ว่า A320neo/A321neo บางลำมี rudder ไฟฟ้า (ไม่ได้ยืนยัน) เป็นข้อความจาก Safety First ว่าตระกูล A320 ทั้งหมดยกเว้น A321XLR ใช้ rudder กลไก
15. ตาราง 3.7.3.3 และ JSON `trim.speed_trim`: เพิ่มว่าแหล่ง [Y16] ขัดกันเองเรื่องขอบ Mach ของ STS (0.60 กับ 0.68)
16. **สมการ feel 737 (3.7.3.2)**: เดิม F = sign·Fbo + K·δe·f_EFS แต่ T-Y-13 คาดหวัง 2 เท่าของแรงทั้งหมด (48.6 lbf) แก้สมการเป็น F = f_EFS·(sign·Fbo + K·δe) ตามข้อความ "doubles control column forces"
17. **JSON `b737_800.controls.feel.pitch_gradient`**: `kq_Pa_per_Pa` เดิมเป็น 0.06511 (หน่วย psi/Pa) แก้เป็น 448.9 Pa/Pa ตามกฎ SI, `q_sat_Pa` 18,750 แก้เป็น 18,739 (q̄ ที่ 340 KCAS) และ `u` เป็น "N, N/deg, Pa/Pa, Pa"
18. **T-Y-02**: ฉบับเดิมให้ trim ไฟฟ้า flaps up วิ่ง −0.2 ถึง 16.9 units (85.5 s) ขัดกับขอบ electric 3.9 ถึง 14.5 ที่ T-Y-06 ใช้ แก้เป็น 53.0 s สำหรับ flaps up และคง 42.75 s สำหรับ flaps down
19. JSON `common_airliner.controls.actuator_model`: "exact" แก้เป็น "explicit Euler" ให้ตรงกับโค้ดใน 3.7.6.1
20. JSON 737: ลด conf ของ `surfaces.rudder`, `yaw.stops`, `yaw.rate_limit`, `feel.pedal`, `feel.manual_reversion_forces` จากสูงเป็นกลาง (ค่าของ 737-300 ใช้กับ -800 ตามกฎที่ผู้เขียนตั้งไว้ใน 3.7.3) และตาราง 3.7.3.7 แถว pedal; `surfaces.rudder` ตั้ง est true เพราะมี τ ที่เลือกเอง; JSON ATR `yaw.stops` ลดเป็นกลางให้ตรงกับหมายเหตุ
21. 3.7.4.1: เพิ่มข้อสังเกตว่าแรงทดสอบรับรองของ ATR วัดขณะ elevator แยกกัน (คันละข้าง) จึงทำให้ |Ch_δ| ยังผลที่คาลิเบรตอาจต่ำไปถึงสองเท่า; JSON `S_a_each` ระบุว่าแรงที่ wheel รวมสองข้าง
22. รายการแหล่งอ้างอิง [Y25]: สัญญาอนุญาตแก้จาก CC BY 3.0 AU เป็นข้อความอนุญาตของ ATSB ปี 2011 (ทำซ้ำและเผยแพร่ได้โดยระบุ ATSB) ซึ่งยังเป็นสิทธิ์ ข สำหรับ AirfieldLab
23. 3.7.0 และหัวกรณีทดสอบ: ระบุว่าผู้ตรวจคำนวณซ้ำด้วย `yrev_controls.mjs` และเป็นฉบับที่ถูกสำหรับ T-Y-02 และ T-Y-11 (ผู้ตรวจไม่ได้แก้ `y_controls.mjs` ของผู้เขียน)

**ข้อสงสัยที่ยังเหลือ**

1. **ระยะ elevator และ aileron ของ 737-800** ยังมาจากโมเดล FlightGear เท่านั้น ทิศ up/down ของ elevator (22.2° ขึ้น, 19.3° ลง) เป็นการตีความของผู้เขียน ผู้ตรวจยืนยันได้เพียงว่าตัวเลขตรงกับไฟล์ ไม่ได้ยืนยันกับเอกสาร Boeing
2. **ช่วง stab indicator −0.2 ถึง 16.9 กับ 0 ถึง 17.1 units**: KNKT ขัดกันเองเล็กน้อย (0 units = LE up สุด แต่ 4 units = 0° และรวม 17.1° = 17.1 units) ความต่าง 0.2 unit ไม่มีผลต่อการบิน แต่ T-Y-01 ที่ −0.2 units ทดสอบสูตร ไม่ใช่ขีดจริง
3. **ขอบ electric trim flaps down** ([−0.2, 16.9] ใน JSON) เป็นค่าที่ผู้เขียนเลือกเอง ข้อมูลทั่วไปของ 737 NG มักให้ขอบล่างราว 0 units และขอบบน 14.5 units เมื่อ flaps down ผู้ตรวจหาแหล่งปฐมภูมิไม่พบ จึงคงไว้เป็น est/ต่ำ และ T-Y-02 ส่วน flaps down ควรตรวจใหม่เมื่อพบค่า
4. **โมเดล pressure reducer**: สูตร f_PCU = (1 + p_A/p_full)/2 สมมติว่าแรงของ PCU แปรตามแรงดันเชิงเส้นและ A, B ให้แรงเท่ากัน ค่า 1,800 psi ของ [Y13] ให้ authority ลดเพียง 20 % ซึ่งไม่ตรงกับ "หนึ่งในสาม" ใน [Y13] เอง ค่าของ NG ไม่พบ
5. **ATR Ch_δ ยังผลของ pitch**: การคาลิเบรตใช้แรงของการทดสอบที่ elevator แยกกัน ค่าอาจต่ำไปได้ถึงสองเท่า ควรเทียบกับแรงที่นักบิน ATR รายงาน (stick force per g) ก่อนใช้กับผู้เล่น
6. **Sidestick ของ Airbus**: breakout และ gradient ขณะบินด้วยมือยังไม่มีค่า หัวข้อ 8 (`controls.fbw.sidestick`) ควรตรวจว่าไม่ได้นำ 5/3.5 daN ไปใช้เป็น breakout ด้วยความเข้าใจเดียวกับฉบับก่อนตรวจ
7. **เลขหน้า NTSB AAR-99/01**: ข้อความเรื่อง rudder ในสำเนา DTIC อยู่ราว pp.25 ถึง 27 (ผู้เขียนอ้าง pp.26 ถึง 28) อาจต่างกันเพราะการนับหน้า PDF กับหน้าพิมพ์ ผู้ตรวจไม่ได้แก้เลขหน้าในเนื้อหา ยกเว้นในหมายเหตุ JSON `surfaces.rudder`
8. **ค่าที่ผู้ตรวจยืนยันไม่ได้ในรอบนี้**: ตำแหน่ง elevator pitot บนหางดิ่ง, ค่า ±20° ของ rudder trim และ 35 ใน SEC ของ FlyByWire (ไฟล์ data ไม่มีชื่อพารามิเตอร์ จึงยืนยันได้แค่ว่ามีตัวเลขนี้), "16 % ที่ 290 kt" ตีความเป็นมุมไม่ได้ตามที่ผู้เขียนระบุไว้แล้ว, ช่วงมุมและอัตรา trim ของ ATR (ไม่พบเช่นเดียวกับผู้เขียน)
