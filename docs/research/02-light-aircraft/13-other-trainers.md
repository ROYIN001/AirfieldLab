# 13. เครื่องฝึกแบบอื่นที่ใช้ในไทย (บัตรย่อระดับ TCDS)
← [กลับไปหน้ารวมรอบที่ 2](../02-light-aircraft.md) · [วิธีประมาณค่าและ schema](01-methods.md) · [ฝูงบินโรงเรียนไทย](02-thai-schools.md)
> ความเชื่อมั่นโดยรวม: **สูง** สำหรับขีดจำกัดจาก TCDS (มวล ความเร็วจำกัด มุมพื้นบังคับ เครื่องยนต์ ใบพัด) ของ P2002-JF [LN10], P.68C [LN14], T206H [LN23], CT/4E [LN21] และ PA-28-161 [LN1] และตัวเลขจาก POH ของ T206H [LN18] และ PA-28-161 [LN2] · **กลาง** สำหรับมิติและสมรรถนะจากหน้า AOPA และสเปกผู้ผลิต (ไม่บอกเงื่อนไขครบ) · **ต่ำ** สำหรับ BE76 ทั้งบัตร (flashcard ของผู้ใช้และนิตยสาร ยังไม่ได้เปิด POH หรือ TCDS), สมรรถนะของ P68C (ตัวเลขของ Vulcanair P68C รุ่นใหม่), ความเร็ว stall ของ CT/4E และ P2002-JF (ขัดกับฟิสิกส์ §13.8) และ VREF/VAPP ที่คำนวณเองของ p2002jf, p68c, ct4 · บัตรย่อนี้ไม่มีอนุพันธ์อากาศพลศาสตร์ inertia หรือโมเดลล้อ (อยู่ใน `_na`, §13.5)

## 13.0 สรุปสั้น
- **ทำไมมีหัวข้อนี้ (D5, 19 พ.ย. 2026)**: ทะเบียนอากาศยานของ กพท. ฉบับ 9 ก.ค. 2026 [LS1] มีเครื่องฝึกอีกหกแบบที่มีในไทยเพียง 1–2 ลำต่อแบบ (ลำดับ P3 ในหัวข้อ 02 §02.5.2) หัวข้อนี้ทำ **บัตรย่อระดับ TCDS** ให้ทั้งหกแบบ เพื่อให้ type id ที่ตารางฝูงบิน `common_light.thai_fleet` (หัวข้อ 02) หัวข้อ 08 (การบังคับ) และหัวข้อ 09 (ขั้นตอน) อ้างถึงมีบัตรจริง: `pa28_161` (Piper PA-28-161, รวม PA-28-151 เป็นรุ่นในทะเบียน), `be76` (Beechcraft 76 Duchess), `p2002jf` (Tecnam P2002-JF), `p68c` (Partenavia P.68C), `t206h` (Cessna T206H) และ `ct4` (PAC CT/4E Airtrainer เฉพาะข้อมูลจากเอกสารรับรองแบบพลเรือนและผู้ผลิต แสดงแบบทั่วไป)
- **สิ่งที่บัตรย่อมี**: มิติ น้ำหนัก (MTOW, MLW, BEW, เชื้อเพลิง) ช่วง CG เครื่องยนต์และใบพัด ความเร็วอ้างอิง (VS0, VS1, VX, VY, VFE, VNO, VNE และ VMCA, VYSE ของเครื่องสองเครื่องยนต์) ตำแหน่งแฟลป (ชื่อ detent ตาม AFM/POH, D6) **VREF และ VAPP ที่มวลฝึก (D1)** สมรรถนะ (ROC, เพดานบิน, ระยะวิ่งขึ้นและลงจอด) มุมพื้นบังคับเมื่อ TCDS ให้ (D2) และ `_na` ที่บอกเหตุผลของ path ที่ไม่กรอก ทุกตัวเลขมีรหัสแหล่ง (§13.9) ค่าที่เราคิดเองติด `est:true` และคำว่า "ค่าประมาณ" พร้อมวิธีคิด
- **มวลและกำลัง** (MTOW; กำลังต่อเครื่อง): PA-28-161 1,106.8 kg (2,440 lb) 119.3 kW (160 hp) · BE76 1,769 kg (3,900 lb) 2 × 134.2 kW (180 hp) · P2002-JF 620 kg (1,367 lb) 73.5 kW (98.6 hp) · P.68C 1,990 kg (4,387 lb) 2 × 149.1 kW (200 hp) · T206H 1,632.9 kg (3,600 lb) 231.2 kW (310 hp turbo) · CT/4E 1,180 kg (2,600 lb) 223.7 kW (300 hp) มวลฝึก (D3: BEW + ครูและศิษย์ 160 kg + เชื้อเพลิง, ค่าประมาณ) อยู่ที่ 80–92 % ของ MTOW
- **ความเร็วหลัก** (ในวงเล็บเป็น m/s): PA-28-161 VS0 44 KIAS (22.6), VY 79 (40.6), VNE 160 KIAS (82.3) · BE76 VS0 60 KIAS (30.9), VMCA 65 (33.4), VYSE 85 (43.7), VNE 194 KIAS (99.8) · P2002-JF VS0 38 kt (19.5), VNE 138 KIAS (71.0) · P.68C VS0 ≈ 55.5 KCAS (28.6, ค่าประมาณ), VMCA 60 KCAS (30.9), VNE 193 KCAS (99.3) · T206H VS0 54 KCAS (27.8), VY 89 KIAS (45.8), VNE 182 KIAS (93.6) · CT/4E VS1 60 kt (30.9), VNE 207 KCAS (106.5)
- **VREF / VAPP ที่บัตรเป็นเจ้าของ (D1)**: PA-28-161 63 / 70 KIAS (32.4 / 36.0 m/s) · BE76 76 / 80 KIAS (39.1 / 41.2) · P2002-JF 47 / 52 KCAS (24.2 / 26.8, ค่าประมาณ) · P.68C 69 / 74 KCAS (35.5 / 38.1, ค่าประมาณ) · T206H 67 / 75 KIAS (34.5 / 38.6) · CT/4E 55 / 60 KCAS (28.3 / 30.9, ค่าประมาณ ความไวสูง §13.8 ข้อ 7) หัวข้อ 08 และ 09 อ้างค่าเหล่านี้ (§13.3)
- **ผลกับซิมวันนี้** (`lm_card` + harness ของ AirfieldLab, §13.4): ความเร็ว stall ทุกแบบอยู่ภายใน ±3 kt (±1.54 m/s) ของบัตร (6/6 ผ่าน) เพราะ `lm_card` แก้มุม stall ให้ตรง CLmax_target; อัตราไต่ที่ SL สูงกว่าเอกสาร 1–36 % (ผ่านเกณฑ์ ±25 % 4/6) และ Vy ของซิมสูงกว่าเอกสาร 3–13 kt (1.54–6.69 m/s) เพราะบัตรย่อไม่มี polar แรงต้าน ซิมจึงใช้ polar ของเครื่องฝึกรอบที่ 1 (CD0 0.024)
- **ข้อขัดแย้งที่สำคัญ** (§13.8): Vsf 45 kt (23.1 m/s) ของ CT/4E ให้ CLmax 2.79 ซึ่งแฟลปธรรมดาทำไม่ได้; VS1 41 kt (21.1 m/s) ของ P2002-JF ให้ CLmax 1.84 ที่แฟลปขึ้น; VNE ของ BE76 194 หรือ 171 kt (99.8 / 88.0 m/s); MTOW ของ PA-28-161 2,440 lb (1,107 kg, POH) หรือ 2,325 lb (1,055 kg, TCDS Rev 48); สมรรถนะของ P68C มาจากรุ่นใหม่ที่หนักกว่า
- **ผลงาน**: บัตร JSON หกบล็อก (46–60 leaf ต่อบัตรรวม `_na`) สร้างด้วย `scripts/ln_json.mjs` และกรณีทดสอบ 21 กรณี (`scripts/ln_tests.mjs`): ข้อมูล 9/9 ผ่าน, ซิม 8/12 ผ่าน; `lm_merge --type <id> --coverage --dry` ของทั้งหกแบบไม่มี ERRORS หรือ CONFLICTS และไม่มี path ต่อแบบของรอบที่ 1 ที่ขาด (กรอก 8–10 ที่เหลืออยู่ใน `_na`)

## 13.1 บัตรข้อมูลสรุป
ตารางเทียบหกแบบ ค่าครบทุกตัว (หน่วย SI, ขอบเขต, ที่มา, ความเชื่อมั่น) อยู่ใน JSON §13.6 ค่าที่ติด "≈" เป็นค่าประมาณ ความเร็วใช้หน่วยตามแหล่ง (KIAS หรือ KCAS ดูคอลัมน์หน่วย; 1 kt = 0.5144 m/s, 1 fpm = 0.00508 m/s)

| แบบ (type id) | MTOW kg (lb) | S m² / b m | เครื่องยนต์ × จำนวน | หน่วย | VS0 / VS1 | VX / VY | VNO / VNE | VREF / VAPP | ROC SL fpm (m/s) | ถึง 50 ft / จาก 50 ft m | แหล่งหลัก |
|---|---|---|---|---|---|---|---|---|---|---|---|
| PA-28-161 (`pa28_161`) | 1,106.8 (2,440) | 15.79 / 10.67 | O-320-D3G 119.3 kW × 1 | KIAS | 44 / 50 | 63 / 79 | 126 / 160 | 63 / 70 | 692 (3.5) | 494 / 354 | [LN1][LN2][LN3][LN4] |
| BE76 (`be76`) | 1,769 (3,900) | 16.82 / 11.58 | O-360 + LO-360 134.2 kW × 2 | KIAS | 60 / 70 | 71 / 85 | 154 / 194 | 76 / 80 | 1,248 (6.3) | 646 / 573 | [LN5]–[LN9] |
| P2002-JF (`p2002jf`) | 620 (1,367) | 11.5 / 8.6 | Rotax 912 S2 73.5 kW × 1 | VS KCAS อื่น KIAS | 38 / 41 | ≈ 60 / ≈ 68 | 110 / 138 | ≈ 47 / ≈ 52 | 800 (4.1) | 434 / 333 | [LN10][LN11][LN13] |
| P.68C (`p68c`) | 1,990 (4,387) | 18.60 / 12.0 | IO-360-A1B6 149.1 kW × 2 | KCAS | ≈ 55.5 / – | – / – | 153 / 193 | ≈ 69 / ≈ 74 | 1,100 (5.6) | 400 / 600 | [LN14][LN16] |
| T206H (`t206h`) | 1,632.9 (3,600) | 16.17 / 10.97 | TIO-540-AJ1A 231.2 kW × 1 | VS KCAS อื่น KIAS | 54 / 62 | 69 / 89 | 149 / 182 | 67 / 75 | 1,050 (5.3) | 530 / 425 | [LN23][LN18][LN19][LN20] |
| CT/4E (`ct4`) | 1,180 (2,600) | 12.0 / 7.9 | AEIO-540-L1B5 223.7 kW × 1 | KCAS | 45 / 60 | – / – | ≈ 147 / 207 | ≈ 55 / ≈ 60 | 1,830 (9.3) | – (วิ่ง 183) / – (วิ่ง 168) | [LN21][LN22] |

ผู้ใช้ในไทยตามทะเบียน 9 ก.ค. 2026 [LS1] (จำนวนอยู่ใน `common_light.thai_fleet` ของหัวข้อ 02): PA-28-161 และ PA-28-151 อย่างละ 1 ลำที่ชมรมการบิน; BE76, P2002-JF, P.68C และ T206H อย่างละ 1 ลำใน ATO; CT/4 เป็นเครื่องฝึกขั้นต้นของผู้ใช้ทางทหาร (จำนวนอยู่ใน `military_generic` ความเชื่อมั่นต่ำ ไม่ระบุหน่วยหรือฐาน)

## 13.2 บัตรรายแบบ
แต่ละหัวข้อย่อยให้ค่าหลักพร้อม SI และแหล่ง ตัวเลขจาก POH/AFM อ้างเป็นข้อเท็จจริงพร้อมหน้า ไม่คัดลอกข้อความหรือตาราง

### 13.2.1 Piper PA-28-161 Warrior II/III (`pa28_161`)
เครื่องเดียว ปีกต่ำ สี่ที่นั่ง ล้อสามล้อตายตัว TC ของ PA-28-161 ลงวันที่ 2 พ.ย. 1976 อยู่ใน FAA TCDS 2A13 item XVI-A [LN1] บัตรใช้ POH VB-1180 ของ Warrior II [LN2] และหน้า AOPA ของ Warrior III [LN3] สำหรับมิติและสมรรถนะที่ POH ฉบับที่เปิดได้ไม่มี (Section 5 ไม่อยู่ในสำเนา) PA-28-151 (O-320-E3D 150 hp) ของชมรมเดียวกันนับใต้ id นี้เป็นรุ่นในทะเบียน (02 `variants`)

| หัวข้อ | ค่า (SI) | แหล่ง |
|---|---|---|
| มิติ | span 35 ft (10.67 m), ยาว 24 ft (7.32 m), สูง 7 ft 4 in (2.24 m), S 170 ft² (15.79 m²), AR ≈ 7.2 | [LN2 p1-2][LN3] |
| น้ำหนัก | MTOW = MLW 2,440 lb (1,106.8 kg; utility 2,020 lb), ramp 2,447 lb (1,110.0 kg), BEW 1,539 lb (698 kg), เชื้อเพลิงใช้ได้ 48 US gal (181.7 L, 130.8 kg) | [LN2 p1-3, p1-4, p2-6][LN3] |
| มวลฝึก (D3, ค่าประมาณ) | 698 + 160 + 100 L × 0.72 = 930 kg | [LN0][LM4] |
| CG | datum 78.4 in (1.991 m) หน้าขอบหน้าปีก; หน้า 83.0 in (2.108 m) ที่ ≤ 1,950 lb ถึง 88.3 in (2.243 m) ที่ 2,440 lb, หลัง 93.0 in (2.362 m) | [LN2 p2-4] |
| เครื่องยนต์ | Lycoming O-320-D3G (หรือ -D2A) 160 hp (119.3 kW) ที่ 2,700 rpm คาร์บูเรเตอร์ | [LN1][LN2] |
| ใบพัด | Sensenich 74DM6-0-60 fixed pitch 2 ใบ Ø 74 in (1.880 m), รอบสถิต 2,330–2,430 rpm | [LN1] |
| ความเร็ว (KIAS) | VS0 44 (22.6 m/s), VS1 50 (25.7), VX 63 (32.4), VY 79 (40.6), VR 52 short field (26.8), best glide 73 (37.6), VA 111 (57.1), VNO 126 (64.8), VNE 160 (82.3), VFE 103 (53.0), ลมขวางที่สาธิต 17 kt (8.7 m/s) | [LN2 p2-1, p2-2, p4-2][LN3][LN4] |
| แฟลป (detent D6) | `0` / `10` / `25` / `40` (มุมแฟลปเป็นชื่อ) | [LN1][LN2][LN4] |
| VREF / VAPP (D1) | 63 KIAS (POH final แฟลป 40) / 70 KIAS (checklist ของโรงเรียน อิง POH) | [LN2 p4-2][LN4] |
| สมรรถนะ | ROC 692 fpm (3.5 m/s), เพดาน 11,000 ft (3,353 m), วิ่งขึ้น 1,150 ft (351 m) ถึง 50 ft 1,620 ft (494 m), ลงจอด 625 ft (191 m) จาก 50 ft 1,160 ft (354 m) | [LN3] |
| พื้นบังคับ (TCDS) | stabilator ขึ้น 14° ลง 2°, aileron ขึ้น 25° ลง 12.5°, rudder 27°, แฟลป 40°, ล้อหน้าเลี้ยว 30° | [LN1] |

### 13.2.2 Beechcraft 76 Duchess (`be76`)
สองเครื่องยนต์ลูกสูบ T-tail ล้อพับ สี่ที่นั่ง ผลิต 1978–1982 ใบพัดหมุนสวนกัน (ไม่มี critical engine) เครื่องในไทยใช้ฝึก multi-engine ที่ ATO หนึ่งแห่ง [LS1] **ทั้งบัตรอิงแหล่งตติยภูมิ** (flashcard ของผู้ใช้ที่สรุป POH [LN5][LN6], นิตยสาร [LN7][LN9] และข้อมูลจำเพาะจาก Jane's ผ่าน Wikipedia [LN8]) จนกว่าจะได้ POH หรือ FAA TCDS A29CE

| หัวข้อ | ค่า (SI) | แหล่ง |
|---|---|---|
| มิติ | span 38 ft (11.58 m), ยาว 29 ft 0.5 in (8.85 m), สูง 9 ft 6 in (2.90 m), S 181 ft² (16.82 m²), airfoil NACA 63₂A415 | [LN8] |
| น้ำหนัก | MTOW = MLW 3,900 lb (1,769 kg), ramp 3,916 lb (1,776.3 kg), MZFW 3,500 lb (1,587.6 kg), BEW 2,460 lb (1,116 kg), เชื้อเพลิง 100 US gal (378.5 L; ส่วนที่ใช้ได้ไม่ทราบ) | [LN6][LN8][LN9] |
| มวลฝึก (D3, ค่าประมาณ) | 1,116 + 160 + 200 L × 0.72 = 1,420 kg | [LN0][LM4] |
| เครื่องยนต์ | 2 × Lycoming 180 hp (134.2 kW) ที่ 2,700 rpm: O-360-A1G6D ซ้าย, LO-360-A1G6D ขวา (หมุนกลับ) | [LN6][LN7][LN8] |
| ใบพัด | 2 × Hartzell HC-M2YR-2C(L)EUF/F(J)C7666A 2 ใบ constant speed feather ได้; Ø ≈ 76 in (1.93 m, ค่าประมาณจากรหัสใบ) | [LN7][LN8] |
| ความเร็ว (KIAS) | VS0 60 (30.9 m/s), VS1 70 (36.0), VX 71 (36.5), VY 85 (43.7), VR 71, best glide 95 (48.9), VA 132 (67.9), VNO 154 (79.2), VNE 194 (99.8), VLE 140 (72.0), VLO กาง 140 / เก็บ 112 (57.6), VFE 120 (61.7) ถึงแฟลป 20° และ 110 (56.6) แฟลปเต็ม, ลมขวาง 25 kt (12.9 m/s) | [LN5][LN6][LN7] |
| สองเครื่องยนต์ | VMCA 65 (33.4 m/s), VYSE 85 (43.7), VXSE 85, VSSE 71 (36.5); OEI ไต่ 235 fpm (1.19 m/s), เพดาน OEI 6,170 ft (1,881 m) | [LN5][LN6][LN7] |
| แฟลป (detent D6) | `0` / `10` / `20` / `35` | [LN5][LN6] |
| VREF / VAPP (D1) | 76 KIAS (short final แฟลป 35) / 80 KIAS (final แฟลป 35 ล้อลง) | [LN5] |
| สมรรถนะ | ROC สองเครื่อง 1,248 fpm (6.34 m/s), เพดาน 19,650 ft (5,989 m), ถึง 50 ft 2,119 ft (646 m), จาก 50 ft 1,881 ft (573 m), cruise 158 KTAS (81.3 m/s) ที่ 10,000 ft | [LN7][LN8][LN9] |

### 13.2.3 Tecnam P2002-JF (`p2002jf`)
สองที่นั่ง ปีกต่ำ ล้อตายตัว รับรองแบบ CS-VLA (EASA TC 27 พ.ค. 2004) [LN10 Section A] ใช้ Rotax 912 S2 ขับใบพัดผ่านเกียร์ทด 2.43 ATO หนึ่งแห่งซื้อสองลำในปี 2018 เหลือในทะเบียน 1 ลำ [LS13][LS1] **AFM ของ P2002-JF ไม่เปิดสาธารณะ** VX, VY, VR, best glide และลมขวางจึงยืมจาก AFM ของรุ่นใกล้เคียง P2002 Sierra (US-LSA) [LN13] และติด `est:true`

| หัวข้อ | ค่า (SI) | แหล่ง |
|---|---|---|
| มิติ | span 8.6 m (28.2 ft), ยาว 6.63 m (21.7 ft), สูง 2.4 m, S 11.5 m² (123.8 ft²), AR 6.4, dihedral 5° | [LN10 A.III.4][LN11] |
| น้ำหนัก | MTOW = MLW = MZFW 620 kg (1,367 lb; ฐาน 580 kg, MOD2002/29 600 kg), BEW 370 kg (815 lb), เชื้อเพลิงใช้ได้ 99 L (71.3 kg) | [LN10 A.III.9, A.III.13][LN11] |
| มวลฝึก (D3, ค่าประมาณ) | 370 + 160 + 60 L × 0.72 = 573.2 kg | [LN0][LM4] |
| CG | datum ที่หน้าแปลนรองใบพัด; 1.693–1.782 m หลัง datum ทุกมวล | [LN10 A.III.14–15] |
| เครื่องยนต์ | BRP-Rotax 912 S2 73.5 kW (98.6 hp) ที่ 5,800 rpm นานสุด 5 นาที, 69.0 kW (92.5 hp) ต่อเนื่องที่ 5,500 rpm | [LN10 A.III.5][LG11] |
| ใบพัด | Hoffmann HO17GHM A 174 177C fixed pitch 2 ใบ Ø 1.74 m; ทิศหมุนตามเข็มนาฬิกา (ค่าประมาณ ตาม Rotax แบบเดียวกับ P2006T [LG1]) | [LN10 A.III.7] |
| ความเร็ว | VS0 38 kt (19.5 m/s), VS1 41 kt (21.1) หน่วยไม่ระบุ ถือเป็น KCAS; VA 96 KIAS (49.4), VNO 110 KIAS (56.6), VNE 138 KIAS (71.0), VFE แฟลป TO 97 KIAS (49.9) / LDG 67 KIAS (34.5); ≈ VX 60 (30.9), ≈ VY 68 (35.0), ≈ VR 43, ≈ best glide 68 KIAS, ≈ ลมขวาง 22 kt (11.3 m/s) | [LN10 A.III.10][LN11][LN13 p17, p27, p32, p47, p53] |
| แฟลป (detent D6) | `UP` / `TO` (≈ 15°) / `LDG` (≈ 38°) ชื่อตามคำ take-off/landing ของ TCDS มุมเป็นค่าประมาณจาก P2002 Sierra | [LN10][LN13] |
| VREF / VAPP (D1, ค่าประมาณ) | 1.3 × 38 × √(573.2/620) = 47.5 → 47 KCAS (24.2 m/s) / 52 KCAS (26.8 m/s) | [LM25][LN0] |
| สมรรถนะ | ROC 800 fpm (4.06 m/s), เพดาน 15,000 ft (4,572 m), วิ่งขึ้น 262 m (860 ft) ถึง 50 ft 434 m (1,424 ft), ลงจอด 170 m (558 ft) จาก 50 ft 333 m (1,092 ft), cruise 118 KTAS (60.7 m/s) ที่ 75 % 6,500 ft; ≈ อัตราร่อน 12.8 | [LN11][LN13 p55] |

### 13.2.4 Partenavia P.68C (`p68c`)
สองเครื่องยนต์ลูกสูบ ปีกสูง ล้อตายตัว เจ็ดที่นั่ง TC ของ P.68C ลงวันที่ 23 ก.ค. 1979 อยู่ใน EASA TCDS A.385 Section D (ผู้ถือ TC ปัจจุบัน Vulcanair) [LN14] ลำในไทย s/n 391 [LS1] จึงใช้ MLW ของ s/n ≥ 381 และถังเชื้อเพลิงของ s/n ≥ 210 ใบพัดทั้งสองข้างหมุนตามเข็มนาฬิกา (เครื่องซ้ายเป็น critical engine) **AFM ไม่เปิดสาธารณะและไม่มีแหล่งของ VS1, VX, VY, VYSE** ความเร็ว stall และสมรรถนะมาจากหน้า AOPA ของ Vulcanair P68C รุ่นใหม่ที่ MTOW 2,100 kg [LN16]

| หัวข้อ | ค่า (SI) | แหล่ง |
|---|---|---|
| มิติ | span 12.0 m (39.37 ft), ยาว 9.55 m, สูง 3.4 m, S 200.23 ft² (18.60 m²), MAC ≈ 1.544 m (คำนวณจากคู่ระยะ/%MAC ของ TCDS) | [LN14 D.III.4, D.III.14][LN16] |
| น้ำหนัก | MTOW 1,990 kg (4,387 lb; 2,084 kg ด้วย Kit 68/051), MLW 1,980 kg (4,365 lb), BEW 1,420 kg (3,130 lb ของรุ่นใหม่), เชื้อเพลิงใช้ได้ 520 L (374.4 kg) | [LN14 D.III.9, D.III.13][LN16][LN17] |
| มวลฝึก (D3, ค่าประมาณ) | 1,420 + 160 + 300 L × 0.72 = 1,796 kg | [LN0][LM4] |
| CG | datum ระนาบสัมผัสขอบหน้าปีก; หน้า 0.230 m (14.84 % MAC) ที่ ≤ 1,680 kg ถึง 0.300 m (19.36 %) ที่ 1,990 kg, หลัง 0.526 m (34 %) | [LN14 D.III.14] |
| เครื่องยนต์ | 2 × Lycoming IO-360-A1B6 200 hp (149.1 kW) ที่ 2,700 rpm ฉีดเชื้อเพลิง | [LN14 D.III.5][LN15] |
| ใบพัด | 2 × Hartzell HC-C2YK-2C( )F/FC7666A-4 2 ใบ Ø 1.829 m (72 in) constant speed feather ได้ หมุนตามเข็มนาฬิกาทั้งสองข้าง | [LN14 D.III.7][LN16] |
| ความเร็ว (KCAS) | VS0 ≈ 55.5 (28.6 m/s; 57 KCAS ของรุ่น 2,100 kg × √(1,990/2,100)), VMCA 60 (30.9), VA 126 (64.8), VNO 153 (78.7), VNE 193 (99.3), VFE 152 (78.2) ถึง 17°, 138 (71.0) ถึง 30°, 99 (50.9) ถึง 35° | [LN14 D.III.10][LN16] |
| แฟลป (detent D6) | `0` / `17` / `30` / `35` (ขอบบนของช่วง VFE ใน TCDS) | [LN14] |
| VREF / VAPP (D1, ค่าประมาณ) | 1.3 × 55.5 × √(1,796/1,990) = 68.5 → 69 KCAS (35.5 m/s) / 74 KCAS (38.1 m/s) | [LM25][LN0] |
| สมรรถนะ (รุ่นใหม่ ความเชื่อมั่นต่ำ) | ROC 1,100 fpm (5.59 m/s), เพดาน 18,000 ft (5,486 m), วิ่งขึ้น 787 ft (240 m) ถึง 50 ft 1,312 ft (400 m), ลงจอด 656 ft (200 m) จาก 50 ft 1,969 ft (600 m), cruise 160 KTAS (82.3 m/s) ที่ 10,000 ft | [LN16][LN17] |
| พื้นบังคับ (TCDS) | stabilator: TCDS วัดที่ขอบหน้า ขึ้น 6° ลง 16° (±2°) = ขอบท้ายขึ้น 16° ลง 6° ในแบบของซิม; aileron ขึ้น 30° ลง 17°, rudder 25°, แฟลป 35°, stabilator tab ลง 1°–15° | [LN14 D.III.16] |

### 13.2.5 Cessna T206H Turbo Stationair (`t206h`)
เครื่องเดียว turbocharged ปีกสูง หกที่นั่ง ล้อตายตัว ผลิตตั้งแต่ปี 1998 ATO หนึ่งแห่งมี 1 ลำ ไม่ใช่เครื่องฝึกพื้นฐาน [LS1] ขีดจำกัดมาจาก EASA TCDS IM.A.053 Section 2 [LN23] (ปฐมภูมิ) ตัวเลขอื่นมาจาก POH/IM ฉบับ NAV III [LN18] (ไม่ใช่ POH ที่อนุมัติของลำในไทย) บทความ AOPA Pilot ปี 2000 [LN19] และเอกสารแนะนำแบบของ Civil Air Patrol [LN20] (FAA TCDS A4CE ไม่ได้เปิด)

| หัวข้อ | ค่า (SI) | แหล่ง |
|---|---|---|
| มิติ | span 36 ft (10.97 m), ยาว 28 ft 3 in (8.61 m), สูง 9 ft 3 in (2.82 m), S 174 ft² (16.17 m²) | [LN18 Fig 1-1][LN19] |
| น้ำหนัก | MTOW = MLW 3,600 lb (1,632.9 kg), ramp 3,617 lb (1,640.6 kg), BEW 2,314 lb (1,050 kg), useful load 1,303 lb (591 kg), เชื้อเพลิงใช้ได้ 87 US gal (329.3 L, 237.1 kg) สำหรับ s/n T20608362 ขึ้นไป | [LN23 p16–17][LN18 p1-6, p1-8, p2-8] |
| มวลฝึก (D3, ค่าประมาณ) | 1,050 + 160 + 200 L × 0.72 = 1,354 kg | [LN0][LM4] |
| CG | datum ผิวหน้า firewall (FS 0.0); หน้า 33.0 in (0.838 m) ที่ ≤ 2,500 lb ถึง 42.5 in (1.080 m) ที่ 3,600 lb, หลัง 49.7 in (1.262 m) | [LN23 p17][LN18 p2-8] |
| เครื่องยนต์ | Lycoming TIO-540-AJ1A turbocharged 310 hp (231.2 kW) ที่ 2,500 rpm ทั้ง takeoff และ continuous, 39 inHg | [LN23 p15][LN18 p1-5] |
| ใบพัด | McCauley B3D36C432/80VSA-1 3 ใบ constant speed Ø 77.5–79.0 in (1.969–2.007 m) | [LN23 p16][LN18 p2-6] |
| ความเร็ว | VS0 54 KCAS (27.8 m/s), VS1 62 KCAS (31.9) [AOPA: 39 / 50 KIAS]; VX 69 KIAS (35.5), VY 89 (45.8), VR 55 (28.3), best glide 80 (41.2), VA 125 (64.3), VNO 149 (76.7), VNE 182 KIAS (93.6; TCDS 180 KCAS), VFE 140 (72.0) ถึง 10°, 120 (61.7) ถึง 20°, 100 (51.4) ถึง FULL (TCDS ให้ค่าเดียว 100 KIAS), ลมขวาง 20 kt (10.3 m/s) | [LN23 p16–17][LN18 p iii, p2-4, p3-7][LN19][LN20] |
| แฟลป (detent D6) | `UP` / `10` / `20` / `FULL` (40°; ไม่มีตำแหน่ง 30°) | [LN18][LN20] |
| VREF / VAPP (D1) | 67 KIAS (short field approach แฟลป FULL) / 75 KIAS (กลางช่วง normal approach 70–80 KIAS แฟลป FULL) | [LN20][LN18] |
| สมรรถนะ | ROC 1,050 fpm (5.33 m/s), เพดาน 27,000 ft (8,230 m), วิ่งขึ้น 910 ft (277 m) ถึง 50 ft 1,740 ft (530 m), ลงจอด 735 ft (224 m) จาก 50 ft 1,395 ft (425 m) ที่ MTOW ISA ทางแข็งแห้ง | [LN18 p ii–iii][LN19] |
| พื้นบังคับ (TCDS) | elevator ขึ้น 21° ลง 17°, aileron ขึ้น 21° ลง 14.5°, rudder 24° (ขนาน W.L.), แฟลป 40°, elevator tab ขึ้น 25° ลง 5° | [LN23 p17–18] |

### 13.2.6 PAC CT/4E Airtrainer (`ct4`)
เครื่องฝึกขั้นต้นสองที่นั่งเรียงข้าง ปีกต่ำ acrobatic category บัตรนี้ใช้เฉพาะ **เอกสารรับรองแบบพลเรือน** (CAA NZ TCDS A-10 item IV, CT/4E อนุมัติ 17 ก.ค. 1992) [LN21] และ **หน้าสเปกของผู้ผลิต** [LN22] แสดงแบบทั่วไปตามกฎของเจ้าของ ไม่ระบุผู้ใช้ หน่วย ฐาน หรือเครื่องหมาย CT/4A (Continental IO-360-H 210 hp, 2,400 lb) ต่างจากบัตรนี้ที่เครื่องยนต์และมวล

| หัวข้อ | ค่า (SI) | แหล่ง |
|---|---|---|
| มิติ | span 26.0 ft (7.9 m), ยาว 23.48 ft (7.16 m), สูง 8.50 ft (2.59 m), S 129.0 ft² (12.0 m²) | [LN22] |
| น้ำหนัก | MTOW 2,600 lb (1,180 kg), MLW 1,180 kg, BEW 1,700 lb (770 kg), เชื้อเพลิงสูงสุด 322 lb (146 kg; ความจุ 207 L ตาม TCDS) | [LN21][LN22] |
| มวลฝึก (D3, ค่าประมาณ) | 770 + 160 + 150 L × 0.72 = 1,038 kg | [LN0][LM4] |
| CG | หน้า 29.0 in (0.737 m) ที่ 998 kg ถึง 31.0 in (0.787 m) ที่ 1,180 kg, หลัง 34.0 in (0.864 m) | [LN21] |
| เครื่องยนต์ | Lycoming AEIO-540-L1B5 300 hp (223.7 kW) ที่ 2,700 rpm (ระบบน้ำมันแบบ aerobatic) | [LN21][LN22] |
| ใบพัด | Hartzell HC-C3YR-4BF/FC7663-2 3 ใบ constant speed Ø 75–76 in (1.91–1.93 m) | [LN21] |
| ความเร็ว | VS0 (Vsf) 45 kt (23.1 m/s, น่าสงสัย §13.8 ข้อ 7), VS1 60 kt (30.9), VA 146 KCAS (75.1), VNO ≈ 147 KCAS (VC แทน, 75.6), VNE 207 KCAS (106.5), VFE TO 100 KCAS (51.4) / LDG 85 KCAS (43.7) | [LN21][LN22] |
| แฟลป (detent D6) | `UP` / `TO` (≈ 15°) / `LDG` (30°) | [LN21] |
| VREF / VAPP (D1, ค่าประมาณ) | 1.3 × 45 × √(1,038/1,180) = 54.9 → 55 KCAS (28.3 m/s) / 60 KCAS (30.9 m/s); ถ้า VS0 จริง ≈ 52 KCAS จะได้ 63 / 68 | [LM25][LN0] |
| สมรรถนะ | ROC 1,830 fpm (9.3 m/s), วิ่งขึ้น 600 ft (183 m), ลงจอด 553 ft (168 m) (ผู้ผลิตไม่บอกมวลและความสูง) | [LN22] |
| พื้นบังคับ (TCDS) | elevator ขึ้น 25° ลง 15°, aileron ขึ้น 16.5° ลง 10.5°, rudder 30°, แฟลป 30° | [LN21] |

## 13.3 ค่าที่หัวข้อ 08 และ 09 ต้องอ้าง (D1, D6)
บัตรเป็นเจ้าของ `speeds.VREF_kt` และ `speeds.VAPP_kt` ที่มวลฝึก (D1) และชื่อ detent (D6) หัวข้อ 08 (`ops.attitude_power.*`) และ 09 (`procedures.*`) ต้องใช้ค่าและชื่อเดียวกัน คอลัมน์ขวาสุดคือสิ่งที่ `lm_merge` (checks `xfile_vapp`, `detent`) พบใน 08/09 วันนี้ และส่งต่อให้เจ้าของหัวข้อทั้งสอง

| type id | VREF / VAPP | Vy | ชื่อ detent (ขึ้น → เต็ม) | แฟลปวิ่งขึ้น / ลงจอด | สิ่งที่ 08/09 ต้องแก้ (lm_merge 19 พ.ย. 2026; แก้ครบแล้ว รันซ้ำได้ 0 WARN) |
|---|---|---|---|---|---|
| `pa28_161` | 63 / 70 KIAS | 79 KIAS | `0`, `10`, `25`, `40` | `0` (short field `25`) / `40` | 08 `final.ias_kt` 65 → 70; 08 `final.v.flap` "FULL" → `40`; 08 `rotation`, `downwind`, `base`, `go_around` ใช้คำบรรยายแทนชื่อ detent → ใส่ชื่อ detent (เช่น rotation `0`) และย้ายคำบรรยายไป note |
| `be76` | 76 / 80 KIAS | 85 KIAS (VYSE 85) | `0`, `10`, `20`, `35` | `0` / `35` | 09 `go_around.flapsSeq` "UP" → `0`; 08 `go_around.v.flap` "ตามต้อง" → ชื่อ detent |
| `p2002jf` | 47 / 52 KCAS (ค่าประมาณ) | ≈ 68 KIAS | `UP`, `TO`, `LDG` | `TO` / `LDG` | 09 `stabilised.Vapp` 50 → 52; 09 `landingFlaps` และ `pattern.flapsAt.final` "LAND" → `LDG`; 08 `initial_climb` "T/O" → `TO`, `cruise` "0" → `UP` |
| `p68c` | 69 / 74 KCAS (ค่าประมาณ) | ไม่มีแหล่ง | `0`, `17`, `30`, `35` | ไม่ทราบ (AFM ไม่สาธารณะ) / `35` | 09 `stabilised.Vapp` 75 → 74; 08 `final.v.flap` "30–35°" → `35` |
| `t206h` | 67 / 75 KIAS | 89 KIAS | `UP`, `10`, `20`, `FULL` | `UP`–`20` / `FULL` | 09 `stabilised.Vapp` 70 → 75; 09 `go_around.flapsSeq` "0" → `UP`; 08 `cruise_climb`, `cruise` "0" → `UP`; 08 `final` "10–FULL" → `FULL` |
| `ct4` | 55 / 60 KCAS (ค่าประมาณ) | ไม่มีแหล่ง | `UP`, `TO`, `LDG` | `TO` / `LDG` | 09 `landingFlaps` และ `pattern.flapsAt.final` "FULL" → `LDG` (Vapp 60 ตรงกับบัตร) |

## 13.4 ผลตรวจกับซิมปัจจุบัน (lm_card)
**วิธีรัน**: `node scripts/ln_tests.mjs` (ทุกกรณี) หรือ `node scripts/lm_card.mjs <id> --mass <MTOW> --no-ground` (ตารางเต็ม) `lm_card` สร้างวัตถุ `AC` ของซิมจากบัตร (มวล S b c มุมพื้นบังคับ กำลัง ใบพัด CLmax ต่อ detent) และใช้ค่าเครื่องฝึกรอบที่ 1 (ติดธง R1) กับทุก field ที่บัตรย่อไม่มี เช่น polar แรงต้าน อนุพันธ์ inertia และล้อ จากนั้นบินใน harness ของ AirfieldLab (`test/harness.mjs`) โดยไม่แก้โค้ดฟิสิกส์

| type id | P / T0 ของซิม | stall แฟลปขึ้น / เต็ม KEAS (บัตร) | ROC SL fpm (บัตร) | Vy KEAS (บัตร) | หมายเหตุ |
|---|---|---|---|---|---|
| `pa28_161` | 119.3 kW / 2,834 N | 51.3 / 45.1 (50 / 44) | 853 (692, +23 %) | 81.6 (79) | ผ่านทั้งหมด |
| `be76` | 268.5 kW / 6,786 N | 71.8 / 61.5 (70 / 60) | 1,471 (1,248, +18 %) | 97.9 (85) | Vy สูงเกิน 13 kt |
| `p2002jf` | 73.5 kW / 2,119 N | 42.1 / 39.0 (41 / 38) | 1,088 (800, +36 %) | 73.2 (≈ 68) | ROC เกิน |
| `p68c` | 298.3 kW / 7,024 N | 70.1 / 56.9 (– / ≈ 55.5) | 1,403 (1,100, +28 %) | 99.4 (ไม่มี) | ROC เกิน; บัตรมี CLmax เฉพาะแฟลปเต็ม แฟลปขึ้นจึงใช้มุม stall 17° ของเครื่องฝึกรอบที่ 1 (ติดธง R1, ค่าประมาณ) ไม่ใช่ CLmax ของแฟลป 35 (แก้ 25 พ.ย. 2026, §13.10) |
| `t206h` | 231.2 kW / 5,004 N | 63.6 / 55.4 (62 / 54) | 1,238 (1,050, +18 %) | 98.0 (89) | Vy สูงเกิน 9 kt |
| `ct4` | 223.7 kW / 4,770 N | 61.5 / 46.5 (60 / 45) | 1,856 (1,830, +1 %) | 101.4 (ไม่มี) | ซิมบินได้ถึง CLmax 2.76 ซึ่งเครื่องจริงทำไม่ได้ (§13.8 ข้อ 7) |

สรุป: stall ตรงเพราะ `lm_card` แก้มุม stall ของซิมให้ได้ CLmax_target ของบัตร ส่วนอัตราไต่และ Vy คลาดเพราะซิมใช้ polar ของเครื่องฝึกรอบที่ 1 (CD0 0.024, K 0.062) ซึ่งแรงต้านต่ำกว่าเครื่องเหล่านี้ (ล้อตายตัว รูปทรงเก่า) และใช้ propulsion แบบ legacy (P × η คงที่) การแก้ต้องได้ polar ต่อแบบ (เช่น จากการร่อนหรือ ROC) ซึ่งอยู่นอกขอบเขตของบัตรย่อ (§13.10)

## 13.5 ขอบเขตของบัตรย่อและ `_na`
บัตรย่อกรอก path ต่อแบบของรอบที่ 1 ได้ 8–10 จาก 384 path (`scripts/r1-pertype-paths.json`) ที่เหลือทั้งหมดอยู่ใน `_na` ของแต่ละบล็อก ซึ่ง `ln_json.mjs` สร้างอัตโนมัติ: ถ้าทั้งกลุ่ม `a.b` ไม่มีค่าเลยจะเขียนเป็น `a.b.*` มิฉะนั้นเขียน path ที่ขาดทีละตัว (74–77 รายการต่อบัตร) เหตุผลมีสองแบบซึ่งเขียนไว้ใน note ของ `_na`
1. **ไม่เกี่ยวกับแบบนี้**: `turbofan.*`, `turboprop.*`, `propeller.betaReverse.*`, antiskid, `propeller.feathered.*` ของเครื่องเครื่องยนต์เดียว และ modes ของเครื่องบินโดยสาร
2. **เลื่อนไปทำเมื่อจำเป็น**: ไม่มีข้อมูลสาธารณะระดับ TCDS/POH หรือซิมยังไม่มีโมเดลย่อย ได้แก่ อนุพันธ์ตามยาวและด้านข้าง, stall/buffet/spin, strip wing, downwash, ground effect, slipstream, รูปทรงและตารางใบพัด, governor, hinge moment และแรงที่คัน, ขาล้อ ยาง เบรก, `numerics.contact`, wind, input และ `otherSims` (หัวข้อ 03) ระหว่างนี้ `lm_card` ใช้ค่าของหัวข้อ 01 แทน (ติดธง R1/default)

## 13.6 ค่าพารามิเตอร์ (JSON)
หกบล็อก หนึ่ง type id ต่อบล็อก สร้างด้วย `node scripts/ln_json.mjs` (ห้ามแก้ด้วยมือ; `--check` ตรวจว่าตรงกับสคริปต์) รูปแบบ leaf `{v, u, scope, src, conf, est, note}` ตาม [01-methods](01-methods.md) scope ตามหมวด (D4): `gear.*` → gear, `piston.*` → engine, `propeller.*` → propeller, อื่น ๆ → aircraft ความเร็วเป็น `kt IAS` หรือ `kt CAS` ตามแหล่ง ค่าที่สคริปต์ใช้ในข้อความและเทสต์อยู่ใน `scripts/out/ln_cards.json`

<!-- LN_JSON_BEGIN -->
**บล็อก `pa28_161`** (Piper PA-28-161; 59 leaf รวม `_na`)

```json
{
 "pa28_161": {
  "airframe": {
   "identity": {"v":{"manufacturer":"Piper Aircraft (สหรัฐฯ)","model":"PA-28-161","variant":"Warrior II/III (บัตรนี้ใช้ POH VB-1180 ของ Warrior II; ลำในไทย s/n 2842026 [LS1] ไม่ได้ตรวจว่า POH ฉบับใดใช้กับลำนี้); PA-28-151 (O-320-E3D 150 hp) ของชมรมเดียวกันนับใต้ id นี้","engine":"Lycoming O-320-D3G (หรือ -D2A) 160 hp (119 kW) ที่ 2,700 rpm คาร์บูเรเตอร์","propeller":"Sensenich 74DM6-0-60 (หรือ -0-58) fixed pitch 2 ใบ Ø 72–74 in (1.83–1.88 m)","seats":4,"category":"normal (utility ที่ 2,020 lb)","tc_ref":"FAA TCDS 2A13 Rev 48 (7 Aug 2006) item XVI-A, TC ของ PA-28-161 2 Nov 1976"},"u":"-","scope":"aircraft","src":["LN1","LN2","LS1"],"conf":"สูง","est":false,"note":"ผู้ใช้ในไทย: ชมรมการบิน 1 ลำ (+ PA-28-151 1 ลำ) ไม่มีใน ATO (ทะเบียน 9 ก.ค. 2026)"},
   "weights": {
    "MTOW": {"v":1106.8,"u":"kg","scope":"aircraft","src":["LN2","LN1"],"conf":"สูง","est":false,"note":"2,440 lb normal category (POH p1-4, p2-3); utility 2,020 lb; TCDS 2A13 Rev 48 item XVI-A ให้ 2,325 lb (เครื่องรุ่นแรก) ดู §13.8"},
    "MLW": {"v":1106.8,"u":"kg","scope":"aircraft","src":["LN2"],"conf":"สูง","est":false,"note":"2,440 lb เท่ากับ MTOW (POH p1-4)"},
    "MRW": {"v":1109.9,"u":"kg","scope":"aircraft","src":["LN2"],"conf":"สูง","est":false,"note":"ramp 2,447 lb (POH p1-4)"},
    "BEW_typical": {"v":698,"u":"kg","scope":"aircraft","src":["LN3"],"conf":"กลาง","est":false,"note":"empty weight 1,539 lb ตามหน้า AOPA ของ Warrior III (ค่าแทน น้ำหนักจริงอยู่ใน weighing record ของแต่ละลำ)"},
    "max_fuel_usable": {"v":130.8,"u":"kg","scope":"aircraft","src":["LN2","LM4"],"conf":"สูง","est":false,"note":"ใช้ได้ 48 US gal (181.7 L) จาก 50 US gal (POH p1-3, p2-6) × 0.72 kg/L"},
    "useful_load": {"v":409,"u":"kg","scope":"aircraft","src":["LN3"],"conf":"กลาง","est":false,"note":"901 lb (AOPA) = MTOW − BEW_typical"},
    "training_mass": {"v":{"kg":930,"empty_kg":698,"crew_kg":160,"fuel_kg":72,"fuel_l":100},"u":"kg","scope":"aircraft","src":["LN0","LM4"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: empty_kg = BEW_typical 698 kg + ครู 85 + ศิษย์ 75 kg + เชื้อเพลิง 100 L × 0.72 kg/L = 930 kg; เชื้อเพลิง 100 L ≈ 26 US gal; สองคน + เชื้อเพลิงเต็ม 48 gal ได้ ≈ 989 kg ยังต่ำกว่า MTOW"}
   },
   "cg": {
    "datum": {"v":"78.4 in (1.991 m) หน้าขอบหน้าปีก","u":"-","scope":"aircraft","src":["LN2"],"conf":"สูง","est":false,"note":"POH p2-4; ระยะ m DAT บวกไปทางท้าย"},
    "envelope": {"v":[[884.5,2.1082,2.3622],[1106.8,2.2428,2.3622]],"u":"kg, m DAT","scope":"aircraft","src":["LN2","LN1"],"conf":"กลาง","est":false,"note":"หน้า 83.0 in ที่ ≤ 1,950 lb ถึง 88.3 in ที่ 2,440 lb (เส้นตรง) หลัง 93.0 in ทุกน้ำหนัก (POH p2-4 ข้อความสกัดอ่านไม่ชัด ตรวจกับต้นฉบับ); TCDS Rev 48: 87.0 in ที่ 2,325 lb"}
   },
   "geometry": {
    "span": {"v":10.67,"u":"m","scope":"aircraft","src":["LN2","LN3"],"conf":"สูง","est":false,"note":"35 ft (POH p1-2)"},
    "length": {"v":7.32,"u":"m","scope":"aircraft","src":["LN3"],"conf":"กลาง","est":false,"note":"24 ft (AOPA ปัดเป็นฟุต)"},
    "height": {"v":2.24,"u":"m","scope":"aircraft","src":["LN3"],"conf":"กลาง","est":false,"note":"7 ft 4 in"}
   },
   "wing": {
    "S": {"v":15.79,"u":"m2","scope":"aircraft","src":["LN3"],"conf":"กลาง","est":false,"note":"170 ft² (AOPA); ตรงกับภาระปีก 14.4 lb/ft² × 170 = 2,448 lb ของ POH p1-4"},
    "b": {"v":10.67,"u":"m","scope":"aircraft","src":["LN2"],"conf":"สูง","est":false,"note":"35 ft"},
    "AR": {"v":7.21,"u":"-","scope":"aircraft","src":["LN0"],"conf":"กลาง","est":true,"note":"ค่าประมาณ: b²/S จากสองค่าข้างบน"}
   }
  },
  "aero": {
   "ref": {
    "S": {"v":15.79,"u":"m2","scope":"aircraft","src":["LN3"],"conf":"กลาง","est":false,"note":"เท่ากับ airframe.wing.S"},
    "b": {"v":10.67,"u":"m","scope":"aircraft","src":["LN2"],"conf":"สูง","est":false,"note":"เท่ากับ airframe.wing.b"},
    "c": {"v":1.48,"u":"m","scope":"aircraft","src":["LN0"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: mean geometric chord S/b เพราะแหล่งไม่ให้ MAC"}
   },
   "flaps": {
    "detents": {"v":[{"name":"0","flap_deg":0,"VFE_kt":null},{"name":"10","flap_deg":10,"VFE_kt":103},{"name":"25","flap_deg":25,"VFE_kt":103},{"name":"40","flap_deg":40,"VFE_kt":103}],"u":"deg, kt","scope":"aircraft","src":["LN1","LN2","LN4"],"conf":"กลาง","est":false,"note":"แฟลปคันโยกสี่ตำแหน่ง 0/10/25/40° (มุมสุด 40° ±2° ตาม TCDS; 25° ใช้วิ่งขึ้น short/soft field ตาม LN4; 10° ตามที่หัวข้อ 09 ใช้จาก POH/checklist LO21/LO22) ชื่อ detent = มุมแฟลปตาม POH; VFE 103 KIAS (100 KCAS) ทุกตำแหน่ง (POH p2-1) (D6: ชื่อเดียวกันนี้ใช้ใน 08/09)"}
   },
   "static_long": {
    "CLmax_target": {"v":{"0":1.611,"40":2.081},"u":"-","scope":"aircraft","src":["LN0","LN3"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: CLmax 1 g = 0.95 · 2 m g /(ρ0 S V²) จาก VS ที่ MTOW 1106.8 kg (lm_polar.clmaxFromStall, ความเร็วต่ำสุดของการเข้า stall 1 kt/s, nz 0.95); ใช้ KIAS แทน KCAS เพราะไม่มีตาราง IAS→CAS (CLmax อาจสูงเกินจริง)"}
   }
  },
  "speeds": {
   "VFE": {"v":{"10":103,"25":103,"40":103},"u":"kt IAS","scope":"aircraft","src":["LN1","LN2","LN4"],"conf":"สูง","est":false,"note":"ความเร็วสูงสุดที่ตำแหน่งแฟลปนั้น (ชื่อตาม aero.flaps.detents)"},
   "VS0_kt": {"v":44,"u":"kt IAS","scope":"aircraft","src":["LN3"],"conf":"กลาง","est":false,"note":"แฟลป 40° ที่ 2,440 lb (AOPA อิง POH) = 22.6 m/s; ไม่มีตาราง IAS→CAS ในแหล่งที่เปิดได้ จึงถือ IAS ≈ CAS"},
   "VS1_kt": {"v":50,"u":"kt IAS","scope":"aircraft","src":["LN3"],"conf":"กลาง","est":false,"note":"แฟลป 0 ที่ 2,440 lb = 25.7 m/s"},
   "VX_kt": {"v":63,"u":"kt IAS","scope":"aircraft","src":["LN2","LN4"],"conf":"สูง","est":false,"note":"POH p4-2 (32.4 m/s)"},
   "VY_kt": {"v":79,"u":"kt IAS","scope":"aircraft","src":["LN2","LN4"],"conf":"สูง","est":false,"note":"POH p4-2 (40.6 m/s)"},
   "VR_kt": {"v":52,"u":"kt IAS","scope":"aircraft","src":["LN4"],"conf":"กลาง","est":false,"note":"short field rotate 52 KIAS แฟลป 25; normal rotation 45–55 KIAS (checklist LN4)"},
   "VG_kt": {"v":73,"u":"kt IAS","scope":"aircraft","src":["LN2"],"conf":"สูง","est":false,"note":"best glide (POH p3-3, p3-11) 37.6 m/s; อัตราร่อนไม่มีในแหล่งที่เปิดได้"},
   "VA_kt": {"v":111,"u":"kt IAS","scope":"aircraft","src":["LN2","LN1"],"conf":"สูง","est":false,"note":"ที่ 2,440 lb (POH p2-2); 88 KIAS ที่ 1,531 lb"},
   "VNO_kt": {"v":126,"u":"kt IAS","scope":"aircraft","src":["LN2","LN1"],"conf":"สูง","est":false,"note":"122 KCAS (POH p2-1)"},
   "VNE_kt": {"v":160,"u":"kt IAS","scope":"aircraft","src":["LN2","LN1"],"conf":"สูง","est":false,"note":"153 KCAS = 78.7 m/s (POH p2-1)"},
   "crosswind_demonstrated_kt": {"v":17,"u":"kt","scope":"aircraft","src":["LN2","LN4"],"conf":"สูง","est":false,"note":"maximum demonstrated crosswind 17 kt (POH p2-8, p4-2) = 8.7 m/s ไม่ใช่ขีดจำกัด"},
   "VREF_kt": {"v":63,"u":"kt IAS","scope":"aircraft","src":["LN2"],"conf":"สูง","est":false,"note":"D1: final approach speed แฟลป 40° 63 KIAS (POH VB-1180 p4-2, น้ำหนักสูงสุด 2,440 lb) ซึ่ง checklist ของโรงเรียนใช้เป็นความเร็ว power-off/short field ด้วย (65 KIAS ใน LN4); เอกสารให้ความเร็วเดียวไม่แยกตามมวล จึงใช้ค่าเดียวกันที่ training_mass ตามแนวบัตร c172s/c152"},
   "VAPP_kt": {"v":70,"u":"kt IAS","scope":"aircraft","src":["LN4","LN2"],"conf":"กลาง","est":false,"note":"D1 (บัตรเป็นเจ้าของ; 08 ops.final และ 09 Vapp อ้างค่านี้): Landing Final Approach, Normal 70 KIAS แฟลป 40 (checklist ของโรงเรียน LN4 ปี 2025 อิง POH) = 36.0 m/s; short/soft field 65 KIAS; ใช้ค่าเดียวกันที่ training_mass"}
  },
  "performance": {
   "ROC_SL_fpm": {"v":692,"u":"fpm","scope":"aircraft","src":["LN3"],"conf":"กลาง","est":false,"note":"SL MTOW ตาม AOPA (3.5 m/s); POH Section 5 ไม่อยู่ในสำเนาที่เปิดได้"},
   "service_ceiling_ft": {"v":11000,"u":"ft","scope":"aircraft","src":["LN3"],"conf":"กลาง","est":false,"note":"3,353 m (AOPA)"},
   "takeoff": {"v":{"ground_roll_m":351,"over50ft_m":494},"u":"m","scope":"aircraft","src":["LN3"],"conf":"กลาง","est":false,"note":"1,150 / 1,620 ft (AOPA; สันนิษฐานว่า MTOW SL ISA ลมสงบ ผิวแห้ง แฟลป 0 แหล่งไม่บอกเงื่อนไข)"},
   "landing": {"v":{"ground_roll_m":191,"over50ft_m":354},"u":"m","scope":"aircraft","src":["LN3"],"conf":"กลาง","est":false,"note":"625 / 1,160 ft (AOPA; เงื่อนไขเหมือนข้างบน)"}
  },
  "piston": {
   "identity": {"v":{"model":"Lycoming O-320-D3G (หรือ -D2A)","kind":"carb","displacement_L":5.24,"cylinders":4,"tcds":"FAA 2A13 item XVI-A"},"u":"-","scope":"engine","src":["LN1","LN2"],"conf":"สูง","est":false,"note":"ความจุจากชื่อรุ่น 320 in³; 160 hp ที่ 2,700 rpm ทุกการใช้งาน (TCDS)"},
   "ratings": {
    "P_rated": {"v":119312,"u":"W","scope":"engine","src":["LN1","LN2"],"conf":"สูง","est":false,"note":"119.3 kW = 160 hp ต่อเครื่อง"},
    "rpm_rated": {"v":2700,"u":"rpm","scope":"engine","src":["LN1","LN2"],"conf":"สูง","est":false,"note":"ขับใบพัดตรง"}
   }
  },
  "propulsion": {
   "layout": {"v":[{"id":1,"pos":null,"axis":[1,0,0],"type":"piston","model":"Lycoming O-320-D3G (หรือ -D2A)","prop_sense":1}],"u":"m FRD, -","scope":"aircraft","src":["LN1","LN2"],"conf":"กลาง","est":true,"note":"ค่าประมาณ: เครื่อง Lycoming ขับตรงหมุนตามเข็มนาฬิกาเมื่อมองจากด้านหลัง (แบบเดียวกับบัตร c172s); pos = null เพราะแหล่งไม่ให้ตำแหน่งเครื่องยนต์ (1 เครื่อง)"}
  },
  "propeller": {
   "identity": {
    "kind": {"v":"fixed","u":"-","scope":"propeller","src":["LN1","LN2"],"conf":"สูง","est":false,"note":"fixed pitch"},
    "model": {"v":"Sensenich 74DM6-0-60 (หรือ 74DM6-0-58)","u":"-","scope":"propeller","src":["LN1","LN2"],"conf":"สูง","est":false,"note":""},
    "nBlades": {"v":2,"u":"-","scope":"propeller","src":["LN1","LN2"],"conf":"สูง","est":false,"note":""},
    "diameter": {"v":1.88,"u":"m","scope":"propeller","src":["LN1","LN2"],"conf":"สูง","est":false,"note":"Ø สูงสุด 74 in (1.880 m) ต่ำสุด 72 in (1.829 m) ไม่มี tolerance เพิ่ม (TCDS)"},
    "sense": {"v":1,"u":"-","scope":"propeller","src":["LN1","LN2"],"conf":"กลาง","est":true,"note":"ค่าประมาณ: +1 = หมุนตามเข็มนาฬิกาเมื่อมองจากด้านหลัง (รอบที่ 1)"}
   },
   "engineInterface": {
    "maxShaftPower": {"v":119.3,"u":"kW","scope":"propeller","src":["LN1","LN2"],"conf":"สูง","est":false,"note":"กำลังพิกัดต่อเครื่อง"}
   },
   "fixed": {
    "static_rpm_range": {"v":[2330,2430],"u":"rpm","scope":"propeller","src":["LN1"],"conf":"สูง","est":false,"note":"74DM6-0-60: รอบสถิต 2,330–2,430 rpm SL ISA (TCDS); -0-58: 2,365–2,465"}
   }
  },
  "gear": {
   "layout": {"v":"tricycle_fixed","u":"-","scope":"gear","src":["LN1","LN2"],"conf":"สูง","est":false,"note":"ล้อตายตัว"},
   "steering": {
    "mode": {"v":"pedal_linked","u":"-","scope":"gear","src":["LN1"],"conf":"กลาง","est":true,"note":"ค่าประมาณ: ล้อหน้าเลี้ยวด้วยแป้นเท้าแบบ PA-28 ทั่วไป (TCDS ให้เฉพาะมุม)"},
    "pedal_max": {"v":30,"u":"deg","scope":"gear","src":["LN1"],"conf":"สูง","est":false,"note":"nose wheel travel 30° ซ้าย/ขวา (±1°) ตาม TCDS"}
   }
  },
  "controls": {
   "surfaces": {
    "elevator": {"v":{"travel_deg":{"up":14,"down":2}},"u":"deg","scope":"aircraft","src":["LN1"],"conf":"สูง","est":false,"note":"คันบังคับเป็น stabilator (เคลื่อนทั้งชิ้น) ขึ้น 14° ลง 2° (±1°) ตาม TCDS; มุม stabilator ไม่เทียบเท่ามุม elevator ของซิม (ประสิทธิผลต่อองศาสูงกว่า)"},
    "aileron": {"v":{"travel_deg":{"up":25,"down":12.5}},"u":"deg","scope":"aircraft","src":["LN1"],"conf":"สูง","est":false,"note":"ขึ้น 25° ลง 12.5° (±2°)"},
    "rudder": {"v":{"travel_deg":{"left":27,"right":27}},"u":"deg","scope":"aircraft","src":["LN1"],"conf":"สูง","est":false,"note":"27° ซ้าย/ขวา (±2°)"},
    "flap": {"v":{"travel_deg":{"up":0,"down":40}},"u":"deg","scope":"aircraft","src":["LN1"],"conf":"สูง","est":false,"note":"ลง 40° (±2°)"},
    "trim_tab": {"v":{"travel_deg":{"up":3,"down":12}},"u":"deg","scope":"aircraft","src":["LN1"],"conf":"สูง","est":false,"note":"stabilator tab ขึ้น 3° ลง 12° (±1°)"}
   }
  },
  "_na": {"v":["aero.static_long.CL0","aero.static_long.CLalpha","aero.static_long.alpha_star","aero.static_long.alpha_star_neg","aero.static_long.a1","aero.static_long.CL_sep_at_alpha_star","aero.static_long.CDmax_90","aero.static_long.dCD_sep","aero.static_long.CmX","aero.static_long.Cm0","aero.static_long.Cmalpha","aero.static_long.alpha_CLmax","aero.static_long.table_clean","aero.elevator_fade.*","aero.separation_dynamics.*","aero.large_beta.*","aero.strip_wing.*","aero.stall_warning.*","aero.buffet.*","aero.spin_reference.*","interference.downwash.*","interference.groundEffect.*","interference.slipstream.*","propeller.identity.massComplete","propeller.identity.hubPosition","propeller.identity.thrustAxis","propeller.engineInterface.rpmGoverned","propeller.engineInterface.rpmTransientLimit","propeller.engineInterface.gearRatio","propeller.engineInterface.flightIdleShaftPower","propeller.bladeGeometry.*","propeller.section.*","propeller.tables.*","propeller.inertia.*","propeller.governor.*","propeller.betaReverse.*","propeller.feathered.*","propeller.checks.*","turboprop.ratings.*","turboprop.steady_map.*","turboprop.dynamics.*","turboprop.airframe_coupling.*","turboprop.fuel.*","turboprop.beta_reverse.*","turboprop.derived_vtbd.*","turboprop.reference_engines.*","turbofan.engines.*","turbofan.reverser.*","controls.pitch.*","controls.roll.*","controls.yaw.*","controls.reference_types.*","gear.geometry.*","gear.strut_main.*","gear.strut_nose.*","gear.tyre_main.*","gear.tyre_nose.*","gear.brakes.*","gear.steering.caster_max","gear.steering.steer_rate","gear.steering.shimmy_lag","gear.certification.*","wind.discreteGust.*","wind.fFactor.*","wind.wake.*","numerics.contact.*","validation.classification.*","validation.procedures.*","validation.typicalModes.*","validation.currentModel.*","input.keyboard.*","otherSims.jsbsim.*","otherSims.yasim.*","otherSims.xplane.*","otherSims.msfs.*","otherSims.geofs.*","otherSims.airfieldlab.*"],"u":"-","scope":"aircraft","src":["LN0"],"conf":"สูง","est":false,"note":"บัตรย่อระดับ TCDS (D5): path ต่อแบบของรอบที่ 1 ที่ไม่ได้กรอกมีสองกลุ่ม (1) ไม่เกี่ยวกับแบบนี้: turbofan.*, turboprop.*, propeller.betaReverse.*, gear.brakes.antiskid*, propeller.feathered.* และ validation.typicalModes ของเครื่องบินโดยสาร; (2) เลื่อนไปทำเมื่อจำเป็น เพราะไม่มีข้อมูลสาธารณะระดับ TCDS/POH ของแบบนี้หรือซิมยังไม่มีโมเดลย่อย: อากาศพลศาสตร์ละเอียด (static_long ยกเว้น CLmax_target, stall/buffet/spin, strip wing), interference (downwash, ground effect, slipstream), รูปทรงและตารางใบพัด, governor, hinge moment และแรงที่คัน (controls.pitch/roll/yaw), ขาล้อ ยาง เบรก, numerics.contact, wind, input และ otherSims (หัวข้อ 03 เป็นเจ้าของ) lm_card ใช้ค่าเริ่มต้นของหัวข้อ 01 (ติดธง R1/default) แทนในกลุ่มที่ 2"}
 }
}
```

**บล็อก `be76`** (Beechcraft 76 Duchess; 60 leaf รวม `_na`)

```json
{
 "be76": {
  "airframe": {
   "identity": {"v":{"manufacturer":"Beech Aircraft (ปัจจุบัน Textron Aviation)","model":"76 Duchess","variant":"Model 76 (ผลิต 1978–1982); ลำในไทย s/n ME-331 [LS1]; T-tail ล้อพับ","engine":"2 × Lycoming 180 hp (134 kW) ที่ 2,700 rpm: O-360-A1G6D (ซ้าย) และ LO-360-A1G6D (ขวา หมุนกลับ) คาร์บูเรเตอร์","propeller":"2 × Hartzell HC-M2YR-2C(L)EUF/F(J)C7666A 2 ใบ constant speed feather ได้ หมุนสวนกัน","seats":4,"category":"normal","tc_ref":"FAA TCDS A29CE (ไม่ได้เปิดอ่านฉบับเต็มในรอบนี้; ตัวเลขจาก flashcard ของ POH นิตยสาร และ Jane's)"},"u":"-","scope":"aircraft","src":["LN7","LN8","LN6","LS1"],"conf":"กลาง","est":false,"note":"ผู้ใช้ในไทย: ATO 1 แห่ง 1 ลำ (ฝึก multi-engine) ทะเบียน 9 ก.ค. 2026"},
   "weights": {
    "MTOW": {"v":1769,"u":"kg","scope":"aircraft","src":["LN6","LN8","LN9"],"conf":"กลาง","est":false,"note":"3,900 lb (สามแหล่งตรงกัน)"},
    "MLW": {"v":1769,"u":"kg","scope":"aircraft","src":["LN6"],"conf":"ต่ำ","est":false,"note":"3,900 lb (flashcard บท 2 ของ POH)"},
    "MRW": {"v":1776.3,"u":"kg","scope":"aircraft","src":["LN6"],"conf":"ต่ำ","est":false,"note":"ramp 3,916 lb"},
    "MZFW": {"v":1587.6,"u":"kg","scope":"aircraft","src":["LN6"],"conf":"ต่ำ","est":false,"note":"zero fuel 3,500 lb"},
    "BEW_typical": {"v":1116,"u":"kg","scope":"aircraft","src":["LN8","LN9"],"conf":"กลาง","est":false,"note":"empty 2,460 lb (Jane's 1980–81 ผ่าน LN8; LN9 ตรงกัน)"},
    "max_fuel_usable": {"v":273,"u":"kg","scope":"aircraft","src":["LN8","LM4"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: LN8 ให้ความจุ 100 US gal (378.5 L) ไม่บอกส่วนที่ใช้ได้ จึงถือว่าใช้ได้ทั้งหมด × 0.72 kg/L (ขอบบน)"},
    "useful_load": {"v":653,"u":"kg","scope":"aircraft","src":["LN8","LN6"],"conf":"กลาง","est":false,"note":"MTOW − BEW = 1,440 lb (flashcard ให้ max useful load 1,470 lb)"},
    "training_mass": {"v":{"kg":1420,"empty_kg":1116,"crew_kg":160,"fuel_kg":144,"fuel_l":200},"u":"kg","scope":"aircraft","src":["LN0","LM4"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: empty_kg = BEW_typical 1116 kg + ครู 85 + ศิษย์ 75 kg + เชื้อเพลิง 200 L × 0.72 kg/L = 1420 kg; เชื้อเพลิง 200 L ≈ 53 US gal"}
   },
   "geometry": {
    "span": {"v":11.58,"u":"m","scope":"aircraft","src":["LN8"],"conf":"กลาง","est":false,"note":"38 ft 0 in (Jane's)"},
    "length": {"v":8.85,"u":"m","scope":"aircraft","src":["LN8"],"conf":"กลาง","est":false,"note":"29 ft 0.5 in"},
    "height": {"v":2.9,"u":"m","scope":"aircraft","src":["LN8"],"conf":"กลาง","est":false,"note":"9 ft 6 in (T-tail)"}
   },
   "wing": {
    "S": {"v":16.82,"u":"m2","scope":"aircraft","src":["LN8"],"conf":"กลาง","est":false,"note":"181 ft²"},
    "b": {"v":11.58,"u":"m","scope":"aircraft","src":["LN8"],"conf":"กลาง","est":false,"note":"38 ft"},
    "AR": {"v":7.98,"u":"-","scope":"aircraft","src":["LN0"],"conf":"กลาง","est":true,"note":"ค่าประมาณ: b²/S"},
    "airfoil": {"v":"NACA 63₂A415","u":"-","scope":"aircraft","src":["LN8"],"conf":"กลาง","est":false,"note":"ตาม Jane's 1980–81"}
   }
  },
  "aero": {
   "ref": {
    "S": {"v":16.82,"u":"m2","scope":"aircraft","src":["LN8"],"conf":"กลาง","est":false,"note":"เท่ากับ airframe.wing.S"},
    "b": {"v":11.58,"u":"m","scope":"aircraft","src":["LN8"],"conf":"กลาง","est":false,"note":"เท่ากับ airframe.wing.b"},
    "c": {"v":1.453,"u":"m","scope":"aircraft","src":["LN0"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: mean geometric chord S/b เพราะแหล่งไม่ให้ MAC"}
   },
   "flaps": {
    "detents": {"v":[{"name":"0","flap_deg":0,"VFE_kt":null},{"name":"10","flap_deg":10,"VFE_kt":120},{"name":"20","flap_deg":20,"VFE_kt":120},{"name":"35","flap_deg":35,"VFE_kt":110}],"u":"deg, kt","scope":"aircraft","src":["LN5","LN6"],"conf":"กลาง","est":false,"note":"ตำแหน่งแฟลป 0/10/20/35° ตาม flashcard ของผู้ใช้ (LN5; หัวข้อ 08/09 ใช้ 10 บน downwind, 20 บน base, 35 บน final จาก LH20/LO24) ชื่อ detent = มุม; VFE 120 KIAS สำหรับแฟลปไม่เกิน 20° (จึงครอบคลุมตำแหน่ง 10°) และ 110 KIAS แฟลปเต็ม 35° (LN5, LN6) (D6: ชื่อเดียวกันนี้ใช้ใน 08/09)"}
   },
   "static_long": {
    "CLmax_target": {"v":{"0":1.234,"35":1.679},"u":"-","scope":"aircraft","src":["LN0","LN8"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: CLmax 1 g = 0.95 · 2 m g /(ρ0 S V²) จาก VS ที่ MTOW 1769 kg (lm_polar.clmaxFromStall, ความเร็วต่ำสุดของการเข้า stall 1 kt/s, nz 0.95); ใช้ KIAS แทน KCAS เพราะไม่มีตาราง IAS→CAS (CLmax อาจสูงเกินจริง)"}
   }
  },
  "speeds": {
   "VFE": {"v":{"10":120,"20":120,"35":110},"u":"kt IAS","scope":"aircraft","src":["LN5","LN6"],"conf":"ต่ำ","est":false,"note":"ความเร็วสูงสุดที่ตำแหน่งแฟลปนั้น (ชื่อตาม aero.flaps.detents)"},
   "VS0_kt": {"v":60,"u":"kt IAS","scope":"aircraft","src":["LN5","LN7","LN8"],"conf":"กลาง","est":false,"note":"แฟลปเต็ม idle MTOW (30.9 m/s) สามแหล่งตรงกัน; ไม่มีตาราง IAS→CAS จึงถือ IAS ≈ CAS"},
   "VS1_kt": {"v":70,"u":"kt IAS","scope":"aircraft","src":["LN5","LN6"],"conf":"ต่ำ","est":false,"note":"แฟลป 0 (ขอบล่าง green arc 70 KIAS) = 36.0 m/s"},
   "VX_kt": {"v":71,"u":"kt IAS","scope":"aircraft","src":["LN5"],"conf":"ต่ำ","est":false,"note":"36.5 m/s"},
   "VY_kt": {"v":85,"u":"kt IAS","scope":"aircraft","src":["LN5"],"conf":"ต่ำ","est":false,"note":"43.7 m/s"},
   "VR_kt": {"v":71,"u":"kt IAS","scope":"aircraft","src":["LN5"],"conf":"ต่ำ","est":false,"note":"rotation = lift-off 71 KIAS"},
   "VG_kt": {"v":95,"u":"kt IAS","scope":"aircraft","src":["LN5"],"conf":"ต่ำ","est":false,"note":"best glide ที่ MTOW (82 KIAS ที่ 3,000 lb)"},
   "VA_kt": {"v":132,"u":"kt IAS","scope":"aircraft","src":["LN5","LN6"],"conf":"ต่ำ","est":false,"note":"ที่ 3,900 lb; 116 KIAS ที่ 3,000 lb"},
   "VNO_kt": {"v":154,"u":"kt IAS","scope":"aircraft","src":["LN5","LN6"],"conf":"ต่ำ","est":false,"note":"79.2 m/s"},
   "VNE_kt": {"v":194,"u":"kt IAS","scope":"aircraft","src":["LN6","LN7"],"conf":"กลาง","est":false,"note":"99.8 m/s; LN8 พิมพ์ 171 kn ซึ่งตรงกับ max speed ของ LN7 (ขัดกัน ดู §13.8)"},
   "VLE_kt": {"v":140,"u":"kt IAS","scope":"aircraft","src":["LN5","LN6"],"conf":"ต่ำ","est":false,"note":"gear extended"},
   "VLO_kt": {"v":140,"u":"kt IAS","scope":"aircraft","src":["LN5","LN6"],"conf":"ต่ำ","est":false,"note":"กางล้อ 140; เก็บล้อ (VLO retract) 112 KIAS"},
   "VMCA_kt": {"v":65,"u":"kt IAS","scope":"aircraft","src":["LN5","LN6"],"conf":"ต่ำ","est":false,"note":"red radial 65 KIAS (33.4 m/s)"},
   "VYSE_kt": {"v":85,"u":"kt IAS","scope":"aircraft","src":["LN5","LN6"],"conf":"ต่ำ","est":false,"note":"blue line 85 KIAS"},
   "VXSE_kt": {"v":85,"u":"kt IAS","scope":"aircraft","src":["LN5"],"conf":"ต่ำ","est":false,"note":"ตาม flashcard (เท่ากับ VYSE)"},
   "VSSE_kt": {"v":71,"u":"kt IAS","scope":"aircraft","src":["LN5"],"conf":"ต่ำ","est":false,"note":"intentional one-engine-inoperative speed"},
   "crosswind_demonstrated_kt": {"v":25,"u":"kt","scope":"aircraft","src":["LN5"],"conf":"ต่ำ","est":false,"note":"flashcard \"Xwind 25\" = 12.9 m/s ยังไม่ได้ตรวจกับ POH"},
   "VREF_kt": {"v":76,"u":"kt IAS","scope":"aircraft","src":["LN5"],"conf":"ต่ำ","est":false,"note":"D1: short final / short-field approach 76 KIAS แฟลป 35 (flashcard ของผู้ใช้ LN5 และ LO24 ของหัวข้อ 09 ตติยภูมิ ยังไม่ได้ตรวจกับ POH) = 1.27 VS0; ความเร็วเดียวไม่แยกตามมวล ใช้ค่าเดียวกันที่ training_mass"},
   "VAPP_kt": {"v":80,"u":"kt IAS","scope":"aircraft","src":["LN5"],"conf":"ต่ำ","est":false,"note":"D1 (บัตรเป็นเจ้าของ; 08 ops.final และ 09 Vapp อ้างค่านี้): final 80 KIAS แฟลป 35 ล้อลง (flashcard LN5/LH20) = 41.2 m/s; ความเชื่อมั่นต่ำจนกว่าจะได้ POH"}
  },
  "performance": {
   "ROC_SL_fpm": {"v":1248,"u":"fpm","scope":"aircraft","src":["LN7","LN8"],"conf":"กลาง","est":false,"note":"สองเครื่องยนต์ SL MTOW (6.34 m/s)"},
   "service_ceiling_ft": {"v":19650,"u":"ft","scope":"aircraft","src":["LN7","LN8"],"conf":"กลาง","est":false,"note":"5,989 m สองเครื่องยนต์"},
   "oei": {"v":{"ROC_fpm":235,"ceiling_ft":6170},"u":"fpm, ft","scope":"aircraft","src":["LN7"],"conf":"กลาง","est":false,"note":"เครื่องดับหนึ่งข้าง MTOW: ไต่ 235 fpm (1.19 m/s), เพดาน 6,170 ft (1,881 m)"},
   "takeoff": {"v":{"ground_roll_m":null,"over50ft_m":646},"u":"m","scope":"aircraft","src":["LN9"],"conf":"ต่ำ","est":false,"note":"ถึง 50 ft 2,119 ft (Plane & Pilot ไม่บอกเงื่อนไขและหน่วย สันนิษฐานว่า ft ที่ MTOW SL); ระยะวิ่งไม่มีแหล่งที่เชื่อได้"},
   "landing": {"v":{"ground_roll_m":null,"over50ft_m":573},"u":"m","scope":"aircraft","src":["LN9"],"conf":"ต่ำ","est":false,"note":"จาก 50 ft 1,881 ft (Plane & Pilot เงื่อนไขเหมือนข้างบน)"},
   "cruise_table": {"v":[{"ktas":158,"h_ft":10000,"note":"Jane's"},{"ktas":166,"h_ft":6000,"note":"max cruise"}],"u":"kt TAS, ft","scope":"aircraft","src":["LN8","LN7"],"conf":"กลาง","est":false,"note":"158 KTAS ที่ 10,000 ft (81.3 m/s); max cruise 166 KTAS ที่ 6,000 ft"}
  },
  "piston": {
   "identity": {"v":{"model":"Lycoming O-360-A1G6D (ซ้าย) / LO-360-A1G6D (ขวา)","kind":"carb","displacement_L":5.9,"cylinders":4,"tcds":"FAA E-286 (O-360 series; ไม่ได้เปิด)"},"u":"-","scope":"engine","src":["LN7","LN8","LN6"],"conf":"สูง","est":false,"note":"ความจุจากชื่อรุ่น 360 in³; 180 hp ต่อเครื่อง; MAP green arc 15–29.6 inHg และรอบสูงสุด 2,700 rpm (LN6)"},
   "ratings": {
    "P_rated": {"v":134226,"u":"W","scope":"engine","src":["LN7","LN8","LN6"],"conf":"สูง","est":false,"note":"134.2 kW = 180 hp ต่อเครื่อง"},
    "rpm_rated": {"v":2700,"u":"rpm","scope":"engine","src":["LN7","LN8","LN6"],"conf":"สูง","est":false,"note":"ขับใบพัดตรง"}
   }
  },
  "propulsion": {
   "layout": {"v":[{"id":1,"pos":null,"axis":[1,0,0],"type":"piston","model":"O-360-A1G6D","prop_sense":1},{"id":2,"pos":null,"axis":[1,0,0],"type":"piston","model":"LO-360-A1G6D","prop_sense":-1}],"u":"m FRD, -","scope":"aircraft","src":["LN8","LN7"],"conf":"กลาง","est":false,"note":"ทิศหมุนตามแหล่ง; pos = null เพราะแหล่งไม่ให้ตำแหน่งเครื่องยนต์ (2 เครื่อง); id 1 = ซ้าย"}
  },
  "propeller": {
   "identity": {
    "kind": {"v":"constant_speed_feathering","u":"-","scope":"propeller","src":["LN8","LN7"],"conf":"สูง","est":false,"note":"constant speed"},
    "model": {"v":"Hartzell HC-M2YR-2C(L)EUF/F(J)C7666A","u":"-","scope":"propeller","src":["LN8","LN7"],"conf":"สูง","est":false,"note":""},
    "nBlades": {"v":2,"u":"-","scope":"propeller","src":["LN8","LN7"],"conf":"สูง","est":false,"note":""},
    "diameter": {"v":1.93,"u":"m","scope":"propeller","src":["LN8","LN7"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: Ø 76 in จากรหัสใบ 7666A (ตัวเลขสองหลักแรกของรหัสใบ Hartzell = Ø นิ้วก่อนตัด) ยังไม่ได้ตรวจกับ TCDS"},
    "sense": {"v":{"left":1,"right":-1},"u":"-","scope":"propeller","src":["LN8","LN7"],"conf":"กลาง","est":false,"note":"+1 = หมุนตามเข็มนาฬิกาเมื่อมองจากด้านหลัง (รอบที่ 1); แยกซ้าย/ขวา"}
   },
   "engineInterface": {
    "maxShaftPower": {"v":134.2,"u":"kW","scope":"propeller","src":["LN7","LN8","LN6"],"conf":"สูง","est":false,"note":"กำลังพิกัดต่อเครื่อง"}
   }
  },
  "gear": {
   "layout": {"v":"tricycle_retract","u":"-","scope":"gear","src":["LN5","LN6"],"conf":"สูง","est":false,"note":"ล้อพับเก็บได้"},
   "retract": {"v":{"time_s":null,"VLO_extend_kt":140,"VLO_retract_kt":112,"VLE_kt":140},"u":"s, kt IAS","scope":"gear","src":["LN5","LN6"],"conf":"ต่ำ","est":false,"note":"VLO กาง 140 / เก็บ 112 KIAS, VLE 140 KIAS (flashcard); เวลาพับไม่มีในแหล่ง"}
  },
  "_na": {"v":["aero.static_long.CL0","aero.static_long.CLalpha","aero.static_long.alpha_star","aero.static_long.alpha_star_neg","aero.static_long.a1","aero.static_long.CL_sep_at_alpha_star","aero.static_long.CDmax_90","aero.static_long.dCD_sep","aero.static_long.CmX","aero.static_long.Cm0","aero.static_long.Cmalpha","aero.static_long.alpha_CLmax","aero.static_long.table_clean","aero.elevator_fade.*","aero.separation_dynamics.*","aero.large_beta.*","aero.strip_wing.*","aero.stall_warning.*","aero.buffet.*","aero.spin_reference.*","interference.downwash.*","interference.groundEffect.*","interference.slipstream.*","propeller.identity.massComplete","propeller.identity.hubPosition","propeller.identity.thrustAxis","propeller.engineInterface.rpmGoverned","propeller.engineInterface.rpmTransientLimit","propeller.engineInterface.gearRatio","propeller.engineInterface.flightIdleShaftPower","propeller.bladeGeometry.*","propeller.section.*","propeller.tables.*","propeller.inertia.*","propeller.governor.*","propeller.betaReverse.*","propeller.feathered.*","propeller.checks.*","turboprop.ratings.*","turboprop.steady_map.*","turboprop.dynamics.*","turboprop.airframe_coupling.*","turboprop.fuel.*","turboprop.beta_reverse.*","turboprop.derived_vtbd.*","turboprop.reference_engines.*","turbofan.engines.*","turbofan.reverser.*","controls.pitch.*","controls.roll.*","controls.yaw.*","controls.reference_types.*","gear.geometry.*","gear.strut_main.*","gear.strut_nose.*","gear.tyre_main.*","gear.tyre_nose.*","gear.brakes.*","gear.steering.*","gear.certification.*","wind.discreteGust.*","wind.fFactor.*","wind.wake.*","numerics.contact.*","validation.classification.*","validation.procedures.*","validation.typicalModes.*","validation.currentModel.*","input.keyboard.*","otherSims.jsbsim.*","otherSims.yasim.*","otherSims.xplane.*","otherSims.msfs.*","otherSims.geofs.*","otherSims.airfieldlab.*"],"u":"-","scope":"aircraft","src":["LN0"],"conf":"สูง","est":false,"note":"บัตรย่อระดับ TCDS (D5): path ต่อแบบของรอบที่ 1 ที่ไม่ได้กรอกมีสองกลุ่ม (1) ไม่เกี่ยวกับแบบนี้: turbofan.*, turboprop.*, propeller.betaReverse.*, gear.brakes.antiskid*, validation.typicalModes ของเครื่องบินโดยสาร; (2) เลื่อนไปทำเมื่อจำเป็น เพราะไม่มีข้อมูลสาธารณะระดับ TCDS/POH ของแบบนี้หรือซิมยังไม่มีโมเดลย่อย: อากาศพลศาสตร์ละเอียด (static_long ยกเว้น CLmax_target, stall/buffet/spin, strip wing), interference (downwash, ground effect, slipstream), รูปทรงและตารางใบพัด, governor, hinge moment และแรงที่คัน (controls.pitch/roll/yaw), ขาล้อ ยาง เบรก, numerics.contact, wind, input และ otherSims (หัวข้อ 03 เป็นเจ้าของ) lm_card ใช้ค่าเริ่มต้นของหัวข้อ 01 (ติดธง R1/default) แทนในกลุ่มที่ 2"}
 }
}
```

**บล็อก `p2002jf`** (Tecnam P2002-JF; 57 leaf รวม `_na`)

```json
{
 "p2002jf": {
  "airframe": {
   "identity": {"v":{"manufacturer":"Costruzioni Aeronautiche Tecnam (อิตาลี)","model":"P2002-JF","variant":"P2002-JF มาตรฐาน MTOW 620 kg (MOD2002/87); ลำในไทย s/n 335 [LS1]; P2002JF MkII (660 kg ตามสเปกปี 2020) และ P2002 Sierra (US-LSA) เป็นคนละแบบย่อย","engine":"BRP-Rotax 912 S2 (912 S3 ด้วย MOD2002/127) 73.5 kW (98.6 hp) ที่ 5,800 rpm 5 นาที, 69.0 kW ต่อเนื่องที่ 5,500 rpm, เกียร์ทด 2.43","propeller":"Hoffmann HO17GHM A 174 177C fixed pitch 2 ใบไม้ Ø 1.74 m (มาตรฐาน); Hoffmann HOV352F1/C170FQ+8 variable pitch Ø 1.78 m ด้วย MOD2002/127","seats":2,"category":"normal (CS-VLA)","tc_ref":"EASA TCDS EASA.A.006 Issue 13 (24 Nov 2022) Section A; TC 27 May 2004"},"u":"-","scope":"aircraft","src":["LN10","LN11","LG11","LS1"],"conf":"สูง","est":false,"note":"ผู้ใช้ในไทย: ATO 1 แห่ง 1 ลำ (ซื้อ 2 ลำปี 2018 [LS13])"},
   "weights": {
    "MTOW": {"v":620,"u":"kg","scope":"aircraft","src":["LN10","LN11"],"conf":"สูง","est":false,"note":"1,367 lb กับ MOD2002/87 หรือ SB0105-CS; ฐาน 580 kg, MOD2002/29 600 kg (TCDS A.III.13) ทะเบียนไทยไม่บอกว่าลำนี้รุ่นไหน"},
    "MLW": {"v":620,"u":"kg","scope":"aircraft","src":["LN10"],"conf":"สูง","est":false,"note":"เท่ากับ MTOW"},
    "MZFW": {"v":620,"u":"kg","scope":"aircraft","src":["LN10"],"conf":"สูง","est":false,"note":"zero fuel mass เท่ากับ MTOW"},
    "BEW_typical": {"v":370,"u":"kg","scope":"aircraft","src":["LN11"],"conf":"กลาง","est":false,"note":"standard empty weight 815 lb (สเปกผู้ผลิต); MkII 410 kg"},
    "max_fuel_usable": {"v":71.3,"u":"kg","scope":"aircraft","src":["LN10","LM4"],"conf":"สูง","est":false,"note":"ใช้ได้ 99 L จาก 100 L (TCDS A.III.9.1) × 0.72 kg/L (MOGAS/AVGAS)"},
    "useful_load": {"v":250,"u":"kg","scope":"aircraft","src":["LN11"],"conf":"กลาง","est":false,"note":"maximum useful load 511 lb (สเปก)"},
    "training_mass": {"v":{"kg":573.2,"empty_kg":370,"crew_kg":160,"fuel_kg":43.2,"fuel_l":60},"u":"kg","scope":"aircraft","src":["LN0","LM4"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: empty_kg = BEW_typical 370 kg + ครู 85 + ศิษย์ 75 kg + เชื้อเพลิง 60 L × 0.72 kg/L = 573.2 kg; เชื้อเพลิง 60 L; สองคน + เชื้อเพลิงเต็ม 99 L ได้ ≈ 601 kg ยังต่ำกว่า MTOW"}
   },
   "cg": {
    "datum": {"v":"หน้าแปลนรองใบพัด (propeller support flange) ไม่รวม spacer","u":"-","scope":"aircraft","src":["LN10"],"conf":"สูง","est":false,"note":"TCDS A.III.14; ระยะ m DAT บวกไปทางท้าย"},
    "envelope": {"v":[[400,1.693,1.782],[620,1.693,1.782]],"u":"kg, m DAT","scope":"aircraft","src":["LN10"],"conf":"สูง","est":false,"note":"หน้า 1.693 m หลัง 1.782 m หลัง datum (TCDS A.III.15 ไม่แยกตามมวล ไม่ให้ %MAC); มวลล่าง 400 kg ใส่เพื่อปิดรูปเท่านั้น"}
   },
   "geometry": {
    "span": {"v":8.6,"u":"m","scope":"aircraft","src":["LN10","LN11"],"conf":"สูง","est":false,"note":"28.2 ft (TCDS A.III.4)"},
    "length": {"v":6.63,"u":"m","scope":"aircraft","src":["LN11"],"conf":"กลาง","est":false,"note":"21.7 ft (สเปก; MkII 6.80 m)"},
    "height": {"v":2.4,"u":"m","scope":"aircraft","src":["LN11"],"conf":"กลาง","est":false,"note":"7.9 ft"}
   },
   "wing": {
    "S": {"v":11.5,"u":"m2","scope":"aircraft","src":["LN10","LN11"],"conf":"สูง","est":false,"note":"123.8 ft²"},
    "b": {"v":8.6,"u":"m","scope":"aircraft","src":["LN10"],"conf":"สูง","est":false,"note":"28.2 ft"},
    "AR": {"v":6.4,"u":"-","scope":"aircraft","src":["LN11"],"conf":"สูง","est":false,"note":"สเปกผู้ผลิต (b²/S = 6.43)"},
    "dihedral_deg": {"v":5,"u":"deg","scope":"aircraft","src":["LN11"],"conf":"สูง","est":false,"note":"สเปกผู้ผลิต"}
   }
  },
  "aero": {
   "ref": {
    "S": {"v":11.5,"u":"m2","scope":"aircraft","src":["LN10","LN11"],"conf":"สูง","est":false,"note":"เท่ากับ airframe.wing.S"},
    "b": {"v":8.6,"u":"m","scope":"aircraft","src":["LN10"],"conf":"สูง","est":false,"note":"เท่ากับ airframe.wing.b"},
    "c": {"v":1.337,"u":"m","scope":"aircraft","src":["LN0"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: mean geometric chord S/b เพราะแหล่งไม่ให้ MAC"}
   },
   "flaps": {
    "detents": {"v":[{"name":"UP","flap_deg":0,"VFE_kt":null},{"name":"TO","flap_deg":15,"VFE_kt":97},{"name":"LDG","flap_deg":38,"VFE_kt":67}],"u":"deg, kt","scope":"aircraft","src":["LN10","LN13"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณบางส่วน: AFM ของ JF ไม่เปิดสาธารณะ: TCDS ให้ VFE ของตำแหน่ง take-off 97 KIAS (95 KCAS) และ landing 67 KIAS (69 KCAS) จึงตั้งชื่อ UP/TO/LDG แบบเดียวกับ DA40; มุม 15° และ 38° เป็นค่าประมาณจาก AFM ของรุ่นใกล้เคียง P2002 Sierra (LN13 p17) VFE ของ MOD2002/29 หรือ SB010-CS สูงขึ้น 1–2 kt (D6: ชื่อเดียวกันนี้ใช้ใน 08/09)"}
   },
   "static_long": {
    "CLmax_target": {"v":{"UP":1.843,"LDG":2.146},"u":"-","scope":"aircraft","src":["LN0","LN10","LN11"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: CLmax 1 g = 0.95 · 2 m g /(ρ0 S V²) จาก VS ที่ MTOW 620 kg (lm_polar.clmaxFromStall, ความเร็วต่ำสุดของการเข้า stall 1 kt/s, nz 0.95); ข้อควรระวัง: CLmax แฟลป UP 1.84 สูงเกินช่วงปกติของปีกไม่มีแฟลป (≈ 1.3–1.7) แสดงว่า 41 kt ของสเปกน่าจะเป็น KIAS หรือมวลต่ำกว่า 620 kg (§13.8 ข้อ 4; T-LN-06)"}
   }
  },
  "speeds": {
   "VFE": {"v":{"TO":97,"LDG":67},"u":"kt IAS","scope":"aircraft","src":["LN10","LN13"],"conf":"กลาง","est":false,"note":"ความเร็วสูงสุดที่ตำแหน่งแฟลปนั้น (ชื่อตาม aero.flaps.detents)"},
   "VS0_kt": {"v":38,"u":"kt CAS","scope":"aircraft","src":["LN11"],"conf":"กลาง","est":false,"note":"แฟลปลง ที่ 620 kg (19.5 m/s); สเปกไม่บอก IAS/CAS สเปก MkII บอก KCAS จึงถือเป็น CAS; MkII 42.5 KCAS ที่ 660 kg"},
   "VS1_kt": {"v":41,"u":"kt CAS","scope":"aircraft","src":["LN11"],"conf":"ต่ำ","est":false,"note":"แฟลปขึ้น ที่ 620 kg (21.1 m/s); หน่วยเหมือนข้างบน; CLmax ที่ได้ (1.84) สูงเกินปีกไม่มีแฟลป ดู §13.8 ข้อ 4"},
   "VX_kt": {"v":60,"u":"kt IAS","scope":"aircraft","src":["LN13"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ VX ของรุ่นใกล้เคียง P2002 Sierra (LN13 p27, 57 KCAS) เพราะ AFM ของ JF ไม่สาธารณะ"},
   "VY_kt": {"v":68,"u":"kt IAS","scope":"aircraft","src":["LN13"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ใช้ VY ของ P2002 Sierra (LN13 p27, 64 KCAS = 35.0 m/s)"},
   "VR_kt": {"v":43,"u":"kt IAS","scope":"aircraft","src":["LN13"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: rotation ของ P2002 Sierra แฟลป T/O (LN13 p47)"},
   "VG_kt": {"v":68,"u":"kt IAS","scope":"aircraft","src":["LN13"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: best glide ของ P2002 Sierra (LN13 p53)"},
   "VA_kt": {"v":96,"u":"kt IAS","scope":"aircraft","src":["LN10"],"conf":"สูง","est":false,"note":"94 KCAS (ฐาน; MOD2002/29 98/96, SB010-CS 100/97)"},
   "VNO_kt": {"v":110,"u":"kt IAS","scope":"aircraft","src":["LN10"],"conf":"สูง","est":false,"note":"106 KCAS (ฐาน)"},
   "VNE_kt": {"v":138,"u":"kt IAS","scope":"aircraft","src":["LN10"],"conf":"สูง","est":false,"note":"135 KCAS = 69.4 m/s (ฐาน; สเปก LN11 ให้ 142 kt ซึ่งตรงกับรุ่นแก้ไขของ TCDS)"},
   "crosswind_demonstrated_kt": {"v":22,"u":"kt","scope":"aircraft","src":["LN13"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ค่าของ P2002 Sierra (LN13 p32) ไม่ใช่ของ JF"},
   "VREF_kt": {"v":47,"u":"kt CAS","scope":"aircraft","src":["LM25","LN0","LN11"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ (D1, AFM ไม่สาธารณะ): 1.3 VS0 ที่ training_mass 573.2 kg = 1.3 × 38 × √(573.2/620) = 47.5 → 47 kt (24.2 m/s) [AFH p9-3]; ไม่มีตาราง IAS→CAS ให้ถือ KIAS ≈ KCAS"},
   "VAPP_kt": {"v":52,"u":"kt CAS","scope":"aircraft","src":["LN0","LM25"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ (D1; 08 ops.final และ 09 Vapp อ้างค่านี้): VREF + 5 kt ตามค่าเริ่มต้น VappMinusVref ของ 01-methods §01.1 = 52 kt (26.8 m/s)"}
  },
  "performance": {
   "ROC_SL_fpm": {"v":800,"u":"fpm","scope":"aircraft","src":["LN11"],"conf":"กลาง","est":false,"note":"SL ที่ 620 kg (4.06 m/s)"},
   "service_ceiling_ft": {"v":15000,"u":"ft","scope":"aircraft","src":["LN11"],"conf":"กลาง","est":false,"note":"4,572 m"},
   "takeoff": {"v":{"ground_roll_m":262,"over50ft_m":434},"u":"m","scope":"aircraft","src":["LN11"],"conf":"กลาง","est":false,"note":"860 / 1,424 ft ที่ 620 kg SL (สเปกไม่บอกผิวและแฟลป)"},
   "landing": {"v":{"ground_roll_m":170,"over50ft_m":333},"u":"m","scope":"aircraft","src":["LN11"],"conf":"กลาง","est":false,"note":"558 / 1,092 ft"},
   "glide": {"v":{"speed_kt":68,"ratio":12.8},"u":"kt IAS, -","scope":"aircraft","src":["LN13"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: ของ P2002 Sierra (LN13 p55: 2 NM ต่อ 1,000 ft) ไม่ใช่ของ JF"},
   "cruise_table": {"v":[{"ktas":118,"h_ft":6500,"power_pct":75}],"u":"kt TAS, ft","scope":"aircraft","src":["LN11"],"conf":"กลาง","est":false,"note":"118 KTAS (60.7 m/s) ที่ 75 % 6,500 ft"}
  },
  "piston": {
   "identity": {"v":{"model":"BRP-Rotax 912 S2","kind":"carb","displacement_L":1.352,"cylinders":4,"tcds":"EASA E.121 (Rotax 912 series)"},"u":"-","scope":"engine","src":["LN10","LG11"],"conf":"สูง","est":false,"note":"73.5 kW ที่ 5,800 rpm นานสุด 5 นาที, 69.0 kW ต่อเนื่องที่ 5,500 rpm (รอบจาก TCDS A.III.5, กำลังจาก datasheet Rotax LG11 ของหัวข้อ 12)"},
   "ratings": {
    "P_rated": {"v":73500,"u":"W","scope":"engine","src":["LN10","LG11"],"conf":"สูง","est":false,"note":"73.5 kW = 98.6 hp ต่อเครื่อง"},
    "rpm_rated": {"v":5800,"u":"rpm","scope":"engine","src":["LN10","LG11"],"conf":"สูง","est":false,"note":"รอบเครื่องยนต์ (ใบพัด 2,388 rpm ผ่านเกียร์ 2.43)"},
    "P_mcp": {"v":69000,"u":"W","scope":"engine","src":["LN10","LG11"],"conf":"สูง","est":false,"note":"69.0 kW ต่อเนื่อง"},
    "takeoff_time_limit_s": {"v":300,"u":"s","scope":"engine","src":["LN10","LG11"],"conf":"สูง","est":false,"note":"กำลังสูงสุดนาน 5 นาที"}
   }
  },
  "propulsion": {
   "layout": {"v":[{"id":1,"pos":null,"axis":[1,0,0],"type":"piston","model":"BRP-Rotax 912 S2","prop_sense":1}],"u":"m FRD, -","scope":"aircraft","src":["LN10"],"conf":"กลาง","est":true,"note":"ค่าประมาณ: ค่าประมาณ: Rotax 912 เกียร์ทดแบบเดียวกับ P2006T ซึ่ง TCDS A.185 ระบุว่าใบพัดหมุนตามเข็มนาฬิกา (มองจากที่นั่งนักบิน) [LG1]; pos = null เพราะแหล่งไม่ให้ตำแหน่งเครื่องยนต์ (1 เครื่อง)"}
  },
  "propeller": {
   "identity": {
    "kind": {"v":"fixed","u":"-","scope":"propeller","src":["LN10"],"conf":"สูง","est":false,"note":"fixed pitch"},
    "model": {"v":"Hoffmann HO17GHM A 174 177C","u":"-","scope":"propeller","src":["LN10"],"conf":"สูง","est":false,"note":""},
    "nBlades": {"v":2,"u":"-","scope":"propeller","src":["LN10"],"conf":"สูง","est":false,"note":""},
    "diameter": {"v":1.74,"u":"m","scope":"propeller","src":["LN10"],"conf":"สูง","est":false,"note":"Ø 1,740 mm (TCDS A.III.7)"},
    "sense": {"v":1,"u":"-","scope":"propeller","src":["LN10"],"conf":"กลาง","est":true,"note":"ค่าประมาณ: +1 = หมุนตามเข็มนาฬิกาเมื่อมองจากด้านหลัง (รอบที่ 1)"}
   },
   "engineInterface": {
    "maxShaftPower": {"v":73.5,"u":"kW","scope":"propeller","src":["LN10","LG11"],"conf":"สูง","est":false,"note":"กำลังพิกัดต่อเครื่อง"},
    "gearRatio": {"v":2.43,"u":"-","scope":"propeller","src":["LN12","LG11"],"conf":"สูง","est":false,"note":"เกียร์ทด Rotax 2.43:1 (2.4286 ตาม LN13)"}
   }
  },
  "gear": {
   "layout": {"v":"tricycle_fixed","u":"-","scope":"gear","src":["LN11"],"conf":"สูง","est":false,"note":"ล้อตายตัว"}
  },
  "_na": {"v":["aero.static_long.CL0","aero.static_long.CLalpha","aero.static_long.alpha_star","aero.static_long.alpha_star_neg","aero.static_long.a1","aero.static_long.CL_sep_at_alpha_star","aero.static_long.CDmax_90","aero.static_long.dCD_sep","aero.static_long.CmX","aero.static_long.Cm0","aero.static_long.Cmalpha","aero.static_long.alpha_CLmax","aero.static_long.table_clean","aero.elevator_fade.*","aero.separation_dynamics.*","aero.large_beta.*","aero.strip_wing.*","aero.stall_warning.*","aero.buffet.*","aero.spin_reference.*","interference.downwash.*","interference.groundEffect.*","interference.slipstream.*","propeller.identity.massComplete","propeller.identity.hubPosition","propeller.identity.thrustAxis","propeller.engineInterface.rpmGoverned","propeller.engineInterface.rpmTransientLimit","propeller.engineInterface.flightIdleShaftPower","propeller.bladeGeometry.*","propeller.section.*","propeller.tables.*","propeller.inertia.*","propeller.governor.*","propeller.betaReverse.*","propeller.feathered.*","propeller.checks.*","turboprop.ratings.*","turboprop.steady_map.*","turboprop.dynamics.*","turboprop.airframe_coupling.*","turboprop.fuel.*","turboprop.beta_reverse.*","turboprop.derived_vtbd.*","turboprop.reference_engines.*","turbofan.engines.*","turbofan.reverser.*","controls.pitch.*","controls.roll.*","controls.yaw.*","controls.reference_types.*","gear.geometry.*","gear.strut_main.*","gear.strut_nose.*","gear.tyre_main.*","gear.tyre_nose.*","gear.brakes.*","gear.steering.*","gear.certification.*","wind.discreteGust.*","wind.fFactor.*","wind.wake.*","numerics.contact.*","validation.classification.*","validation.procedures.*","validation.typicalModes.*","validation.currentModel.*","input.keyboard.*","otherSims.jsbsim.*","otherSims.yasim.*","otherSims.xplane.*","otherSims.msfs.*","otherSims.geofs.*","otherSims.airfieldlab.*"],"u":"-","scope":"aircraft","src":["LN0"],"conf":"สูง","est":false,"note":"บัตรย่อระดับ TCDS (D5): path ต่อแบบของรอบที่ 1 ที่ไม่ได้กรอกมีสองกลุ่ม (1) ไม่เกี่ยวกับแบบนี้: turbofan.*, turboprop.*, propeller.betaReverse.*, gear.brakes.antiskid*, propeller.feathered.* และ validation.typicalModes ของเครื่องบินโดยสาร; (2) เลื่อนไปทำเมื่อจำเป็น เพราะไม่มีข้อมูลสาธารณะระดับ TCDS/POH ของแบบนี้หรือซิมยังไม่มีโมเดลย่อย: อากาศพลศาสตร์ละเอียด (static_long ยกเว้น CLmax_target, stall/buffet/spin, strip wing), interference (downwash, ground effect, slipstream), รูปทรงและตารางใบพัด, governor, hinge moment และแรงที่คัน (controls.pitch/roll/yaw), ขาล้อ ยาง เบรก, numerics.contact, wind, input และ otherSims (หัวข้อ 03 เป็นเจ้าของ) lm_card ใช้ค่าเริ่มต้นของหัวข้อ 01 (ติดธง R1/default) แทนในกลุ่มที่ 2"}
 }
}
```

**บล็อก `p68c`** (Partenavia P.68C; 51 leaf รวม `_na`)

```json
{
 "p68c": {
  "airframe": {
   "identity": {"v":{"manufacturer":"Partenavia (อิตาลี; TC ปัจจุบัน Vulcanair)","model":"P.68C","variant":"P.68C (TC 23 Jul 1979); ลำในไทย s/n 391 [LS1] จึงใช้ MLW 1,980 kg (s/n ≥ 381) และถังเชื้อเพลิง 538 L (s/n ≥ 210); ปีกสูง ล้อตายตัว","engine":"2 × Lycoming IO-360-A1B6 200 hp (149 kW) ที่ 2,700 rpm ฉีดเชื้อเพลิง","propeller":"2 × Hartzell HC-C2YK-2C( )F/FC7666A-4 2 ใบ Ø 1.829 m (72 in) constant speed (governor Woodward) หมุนตามเข็มนาฬิกาทั้งสองข้าง","seats":7,"category":"normal (FAR 23)","tc_ref":"EASA TCDS EASA.A.385 Issue 10 (1 Aug 2023) Section D"},"u":"-","scope":"aircraft","src":["LN14","LN15","LS1"],"conf":"สูง","est":false,"note":"ผู้ใช้ในไทย: ATO 1 แห่ง 1 ลำ ทะเบียน 9 ก.ค. 2026"},
   "weights": {
    "MTOW": {"v":1990,"u":"kg","scope":"aircraft","src":["LN14","LN15"],"conf":"สูง","est":false,"note":"4,387 lb (TCDS D.III.13); 2,084 kg ด้วย Kit 68/051 (SB 79)"},
    "MLW": {"v":1980,"u":"kg","scope":"aircraft","src":["LN14"],"conf":"สูง","est":false,"note":"4,365 lb สำหรับ s/n ≥ 381 (1,890 kg ถึง s/n 380)"},
    "BEW_typical": {"v":1420,"u":"kg","scope":"aircraft","src":["LN16","LN17"],"conf":"ต่ำ","est":false,"note":"empty 3,130 lb ของ Vulcanair P68C รุ่นใหม่ (AOPA และโบรชัวร์ผ่าน Wikipedia) เครื่องปี 1980 อาจเบากว่า"},
    "max_fuel_usable": {"v":374.4,"u":"kg","scope":"aircraft","src":["LN14","LM4"],"conf":"สูง","est":false,"note":"538 L (142 US gal) ลบ unusable 2 × 9 L = 520 L (TCDS D.III.9.1, s/n ≥ 210) × 0.72 kg/L"},
    "training_mass": {"v":{"kg":1796,"empty_kg":1420,"crew_kg":160,"fuel_kg":216,"fuel_l":300},"u":"kg","scope":"aircraft","src":["LN0","LM4"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: empty_kg = BEW_typical 1420 kg + ครู 85 + ศิษย์ 75 kg + เชื้อเพลิง 300 L × 0.72 kg/L = 1796 kg; เชื้อเพลิง 300 L"}
   },
   "cg": {
    "datum": {"v":"ระนาบสัมผัสขอบหน้าปีก","u":"-","scope":"aircraft","src":["LN14"],"conf":"สูง","est":false,"note":"TCDS D.III.14"},
    "envelope": {"v":[[1680,0.23,0.526],[1990,0.3,0.526]],"u":"kg, m DAT","scope":"aircraft","src":["LN14"],"conf":"สูง","est":false,"note":"หน้า 0.230 m (14.84 % MAC) ที่ ≤ 1,680 kg ถึง 0.300 m (19.36 %) ที่ 1,990 kg เส้นตรง; หลัง 0.526 m (34 %) ทุกน้ำหนัก"},
    "MAC": {"v":1.544,"u":"m","scope":"aircraft","src":["LN14","LN0"],"conf":"กลาง","est":true,"note":"ค่าประมาณ: คำนวณจากคู่ระยะ/%MAC ของ TCDS: (0.526 − 0.300)/(0.34 − 0.1936); LEMAC ≈ 0.000 m"}
   },
   "geometry": {
    "span": {"v":12,"u":"m","scope":"aircraft","src":["LN14"],"conf":"สูง","est":false,"note":"39.37 ft (TCDS D.III.4)"},
    "length": {"v":9.55,"u":"m","scope":"aircraft","src":["LN14"],"conf":"สูง","est":false,"note":"TCDS D.III.4"},
    "height": {"v":3.4,"u":"m","scope":"aircraft","src":["LN14"],"conf":"สูง","est":false,"note":"TCDS D.III.4"}
   },
   "wing": {
    "S": {"v":18.6,"u":"m2","scope":"aircraft","src":["LN16"],"conf":"กลาง","est":false,"note":"200.23 ft² (AOPA)"},
    "b": {"v":12,"u":"m","scope":"aircraft","src":["LN14"],"conf":"สูง","est":false,"note":"TCDS"},
    "AR": {"v":7.74,"u":"-","scope":"aircraft","src":["LN0"],"conf":"กลาง","est":true,"note":"ค่าประมาณ: b²/S"}
   }
  },
  "aero": {
   "ref": {
    "S": {"v":18.6,"u":"m2","scope":"aircraft","src":["LN16"],"conf":"กลาง","est":false,"note":"เท่ากับ airframe.wing.S"},
    "b": {"v":12,"u":"m","scope":"aircraft","src":["LN14"],"conf":"สูง","est":false,"note":"เท่ากับ airframe.wing.b"},
    "c": {"v":1.544,"u":"m","scope":"aircraft","src":["LN14","LN0"],"conf":"กลาง","est":true,"note":"ค่าประมาณ: MAC ที่คำนวณจาก TCDS (airframe.cg.MAC)"}
   },
   "flaps": {
    "detents": {"v":[{"name":"0","flap_deg":0,"VFE_kt":null},{"name":"17","flap_deg":17,"VFE_kt":152},{"name":"30","flap_deg":30,"VFE_kt":138},{"name":"35","flap_deg":35,"VFE_kt":99}],"u":"deg, kt","scope":"aircraft","src":["LN14"],"conf":"กลาง","est":false,"note":"TCDS ให้ VFE เป็นช่วงมุม 0–17° 152 KCAS, 17–30° 138 KCAS, 30–35° 99 KCAS (D.III.10) และแฟลปสุด 35° ±2° (D.III.16) ชื่อ detent = มุมขอบบนของแต่ละช่วงตามที่หัวข้อ 09 ใช้ (AFM ไม่สาธารณะ ไม่ยืนยันว่าคันโยกมีตำแหน่ง 30°) (D6: ชื่อเดียวกันนี้ใช้ใน 08/09)"}
   },
   "static_long": {
    "CLmax_target": {"v":{"35":1.996},"u":"-","scope":"aircraft","src":["LN0","LN16"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: CLmax 1 g = 0.95 · 2 m g /(ρ0 S V²) จาก VS ที่ MTOW 1990 kg (lm_polar.clmaxFromStall, ความเร็วต่ำสุดของการเข้า stall 1 kt/s, nz 0.95)"}
   }
  },
  "speeds": {
   "VFE": {"v":{"17":152,"30":138,"35":99},"u":"kt CAS","scope":"aircraft","src":["LN14"],"conf":"สูง","est":false,"note":"ความเร็วสูงสุดที่ตำแหน่งแฟลปนั้น (ชื่อตาม aero.flaps.detents)"},
   "VS0_kt": {"v":55.5,"u":"kt CAS","scope":"aircraft","src":["LN16","LN0"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: 57 KCAS แฟลปลง ของ Vulcanair P68C ที่ 4,630 lb (2,100 kg, AOPA) × √(1,990/2,100) = 55.5 KCAS (28.5 m/s) ที่ MTOW ของบัตร"},
   "VA_kt": {"v":126,"u":"kt CAS","scope":"aircraft","src":["LN14"],"conf":"สูง","est":false,"note":"TCDS D.III.10"},
   "VNO_kt": {"v":153,"u":"kt CAS","scope":"aircraft","src":["LN14"],"conf":"สูง","est":false,"note":"78.7 m/s"},
   "VNE_kt": {"v":193,"u":"kt CAS","scope":"aircraft","src":["LN14"],"conf":"สูง","est":false,"note":"99.3 m/s"},
   "VMCA_kt": {"v":60,"u":"kt CAS","scope":"aircraft","src":["LN14"],"conf":"สูง","est":false,"note":"VMC ของ TCDS D.III.10 (30.9 m/s)"},
   "VREF_kt": {"v":69,"u":"kt CAS","scope":"aircraft","src":["LM25","LN0","LN16"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ (D1, AFM ไม่สาธารณะ): 1.3 VS0 ที่ training_mass 1796 kg = 1.3 × 55.5 × √(1796/1990) = 68.5 → 69 kt (35.5 m/s) [AFH p9-3]; ไม่มีตาราง IAS→CAS ให้ถือ KIAS ≈ KCAS"},
   "VAPP_kt": {"v":74,"u":"kt CAS","scope":"aircraft","src":["LN0","LM25"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ (D1; 08 ops.final และ 09 Vapp อ้างค่านี้): VREF + 5 kt ตามค่าเริ่มต้น VappMinusVref ของ 01-methods §01.1 = 74 kt (38.1 m/s)"}
  },
  "performance": {
   "ROC_SL_fpm": {"v":1100,"u":"fpm","scope":"aircraft","src":["LN16","LN17"],"conf":"ต่ำ","est":false,"note":"ของ Vulcanair P68C รุ่นใหม่ (5.6 m/s) ไม่ใช่ P.68C ปี 1980 ที่ 1,990 kg"},
   "service_ceiling_ft": {"v":18000,"u":"ft","scope":"aircraft","src":["LN16","LN17"],"conf":"ต่ำ","est":false,"note":"5,486 m (Vulcanair)"},
   "takeoff": {"v":{"ground_roll_m":240,"over50ft_m":400},"u":"m","scope":"aircraft","src":["LN16"],"conf":"ต่ำ","est":false,"note":"787 / 1,312 ft (AOPA, Vulcanair P68C เงื่อนไขไม่ระบุ)"},
   "landing": {"v":{"ground_roll_m":200,"over50ft_m":600},"u":"m","scope":"aircraft","src":["LN16"],"conf":"ต่ำ","est":false,"note":"656 / 1,969 ft (AOPA; ระยะจาก 50 ft ยาวผิดสังเกตเทียบกับระยะวิ่ง ดู §13.8)"},
   "cruise_table": {"v":[{"ktas":160,"h_ft":10000,"note":"economy"}],"u":"kt TAS, ft","scope":"aircraft","src":["LN17","LN16"],"conf":"ต่ำ","est":false,"note":"160 KTAS (82.3 m/s) economy cruise 10,000 ft (Vulcanair)"}
  },
  "piston": {
   "identity": {"v":{"model":"Lycoming IO-360-A1B6","kind":"fuel_injected","displacement_L":5.9,"cylinders":4,"tcds":"FAA 1E10 (ตาม TAR LN15)"},"u":"-","scope":"engine","src":["LN14","LN15"],"conf":"สูง","est":false,"note":"ความจุจากชื่อรุ่น 360 in³; 200 hp ที่ 2,700 rpm (TCDS D.III.5)"},
   "ratings": {
    "P_rated": {"v":149140,"u":"W","scope":"engine","src":["LN14","LN15"],"conf":"สูง","est":false,"note":"149.1 kW = 200 hp ต่อเครื่อง"},
    "rpm_rated": {"v":2700,"u":"rpm","scope":"engine","src":["LN14","LN15"],"conf":"สูง","est":false,"note":"ขับใบพัดตรง"}
   }
  },
  "propulsion": {
   "layout": {"v":[{"id":1,"pos":null,"axis":[1,0,0],"type":"piston","model":"Lycoming IO-360-A1B6","prop_sense":1},{"id":2,"pos":null,"axis":[1,0,0],"type":"piston","model":"Lycoming IO-360-A1B6","prop_sense":1}],"u":"m FRD, -","scope":"aircraft","src":["LN14","LN16"],"conf":"กลาง","est":false,"note":"ทิศหมุนตามแหล่ง; pos = null เพราะแหล่งไม่ให้ตำแหน่งเครื่องยนต์ (2 เครื่อง); id 1 = ซ้าย"}
  },
  "propeller": {
   "identity": {
    "kind": {"v":"constant_speed_feathering","u":"-","scope":"propeller","src":["LN14","LN16"],"conf":"สูง","est":false,"note":"constant speed"},
    "model": {"v":"Hartzell HC-C2YK-2C( )F/FC7666A-4","u":"-","scope":"propeller","src":["LN14","LN16"],"conf":"สูง","est":false,"note":""},
    "nBlades": {"v":2,"u":"-","scope":"propeller","src":["LN14","LN16"],"conf":"สูง","est":false,"note":""},
    "diameter": {"v":1.829,"u":"m","scope":"propeller","src":["LN14","LN16"],"conf":"สูง","est":false,"note":"Ø 1.829 m (72 in) ห้ามตัดสั้น (TCDS D.III.7); มุมใบที่สถานี 0.762 m 14.2°–81.2° (มุม 81.2° คือ feather; AOPA ระบุ full feathering)"},
    "sense": {"v":{"left":1,"right":1},"u":"-","scope":"propeller","src":["LN14","LN16"],"conf":"กลาง","est":false,"note":"+1 = หมุนตามเข็มนาฬิกาเมื่อมองจากด้านหลัง (รอบที่ 1); แยกซ้าย/ขวา"}
   },
   "engineInterface": {
    "maxShaftPower": {"v":149.1,"u":"kW","scope":"propeller","src":["LN14","LN15"],"conf":"สูง","est":false,"note":"กำลังพิกัดต่อเครื่อง"}
   }
  },
  "gear": {
   "layout": {"v":"tricycle_fixed","u":"-","scope":"gear","src":["LN14"],"conf":"สูง","est":false,"note":"ล้อตายตัว"}
  },
  "controls": {
   "surfaces": {
    "elevator": {"v":{"travel_deg":{"up":16,"down":6}},"u":"deg","scope":"aircraft","src":["LN14"],"conf":"กลาง","est":false,"note":"คันบังคับเป็น stabilator: TCDS D.III.16 ระบุมุมที่ขอบหน้า (leading edge) ขึ้น 6° ลง 16° (±2°) เท่ากับขอบท้ายขึ้น 16° ลง 6° ตามแบบ elevator ของซิม (ขอบท้ายขึ้น = เงยหัว); อ่านจากข้อความสกัดที่แยกคอลัมน์ป้ายกับตัวเลข จึงตรวจกับ PDF อีกครั้งก่อนใช้; มุม stabilator ไม่เทียบเท่ามุม elevator ของซิม"},
    "aileron": {"v":{"travel_deg":{"up":30,"down":17}},"u":"deg","scope":"aircraft","src":["LN14"],"conf":"กลาง","est":false,"note":"ขึ้น 30° ลง 17° (±2°)"},
    "rudder": {"v":{"travel_deg":{"left":25,"right":25}},"u":"deg","scope":"aircraft","src":["LN14"],"conf":"กลาง","est":false,"note":"25° ซ้าย/ขวา (±2°); rudder tab 30°"},
    "flap": {"v":{"travel_deg":{"up":0,"down":35}},"u":"deg","scope":"aircraft","src":["LN14"],"conf":"สูง","est":false,"note":"ลง 35° (±2°)"},
    "trim_tab": {"v":{"travel_deg":{"up":0,"down":15,"down_min":1}},"u":"deg","scope":"aircraft","src":["LN14"],"conf":"กลาง","est":false,"note":"stabilator tab ลง 1° (±1°) ถึง 15° (±1°)"}
   }
  },
  "_na": {"v":["aero.static_long.CL0","aero.static_long.CLalpha","aero.static_long.alpha_star","aero.static_long.alpha_star_neg","aero.static_long.a1","aero.static_long.CL_sep_at_alpha_star","aero.static_long.CDmax_90","aero.static_long.dCD_sep","aero.static_long.CmX","aero.static_long.Cm0","aero.static_long.Cmalpha","aero.static_long.alpha_CLmax","aero.static_long.table_clean","aero.elevator_fade.*","aero.separation_dynamics.*","aero.large_beta.*","aero.strip_wing.*","aero.stall_warning.*","aero.buffet.*","aero.spin_reference.*","interference.downwash.*","interference.groundEffect.*","interference.slipstream.*","propeller.identity.massComplete","propeller.identity.hubPosition","propeller.identity.thrustAxis","propeller.engineInterface.rpmGoverned","propeller.engineInterface.rpmTransientLimit","propeller.engineInterface.gearRatio","propeller.engineInterface.flightIdleShaftPower","propeller.bladeGeometry.*","propeller.section.*","propeller.tables.*","propeller.inertia.*","propeller.governor.*","propeller.betaReverse.*","propeller.feathered.*","propeller.checks.*","turboprop.ratings.*","turboprop.steady_map.*","turboprop.dynamics.*","turboprop.airframe_coupling.*","turboprop.fuel.*","turboprop.beta_reverse.*","turboprop.derived_vtbd.*","turboprop.reference_engines.*","turbofan.engines.*","turbofan.reverser.*","controls.pitch.*","controls.roll.*","controls.yaw.*","controls.reference_types.*","gear.geometry.*","gear.strut_main.*","gear.strut_nose.*","gear.tyre_main.*","gear.tyre_nose.*","gear.brakes.*","gear.steering.*","gear.certification.*","wind.discreteGust.*","wind.fFactor.*","wind.wake.*","numerics.contact.*","validation.classification.*","validation.procedures.*","validation.typicalModes.*","validation.currentModel.*","input.keyboard.*","otherSims.jsbsim.*","otherSims.yasim.*","otherSims.xplane.*","otherSims.msfs.*","otherSims.geofs.*","otherSims.airfieldlab.*"],"u":"-","scope":"aircraft","src":["LN0"],"conf":"สูง","est":false,"note":"บัตรย่อระดับ TCDS (D5): path ต่อแบบของรอบที่ 1 ที่ไม่ได้กรอกมีสองกลุ่ม (1) ไม่เกี่ยวกับแบบนี้: turbofan.*, turboprop.*, propeller.betaReverse.*, gear.brakes.antiskid*, validation.typicalModes ของเครื่องบินโดยสาร; (2) เลื่อนไปทำเมื่อจำเป็น เพราะไม่มีข้อมูลสาธารณะระดับ TCDS/POH ของแบบนี้หรือซิมยังไม่มีโมเดลย่อย: อากาศพลศาสตร์ละเอียด (static_long ยกเว้น CLmax_target, stall/buffet/spin, strip wing), interference (downwash, ground effect, slipstream), รูปทรงและตารางใบพัด, governor, hinge moment และแรงที่คัน (controls.pitch/roll/yaw), ขาล้อ ยาง เบรก, numerics.contact, wind, input และ otherSims (หัวข้อ 03 เป็นเจ้าของ) lm_card ใช้ค่าเริ่มต้นของหัวข้อ 01 (ติดธง R1/default) แทนในกลุ่มที่ 2"}
 }
}
```

**บล็อก `t206h`** (Cessna T206H; 57 leaf รวม `_na`)

```json
{
 "t206h": {
  "airframe": {
   "identity": {"v":{"manufacturer":"Cessna Aircraft (ปัจจุบัน Textron Aviation)","model":"T206H Turbo Stationair","variant":"T206H (ผลิตตั้งแต่ปี 1998); ลำในไทย s/n T20608372 [LS1]; POH/IM ฉบับ NAV III ที่ใช้เป็นฉบับอ้างอิง ไม่ใช่ POH ที่อนุมัติของลำนี้","engine":"Lycoming TIO-540-AJ1A turbocharged ฉีดเชื้อเพลิง 310 hp (231 kW) ที่ 2,500 rpm, 39 inHg","propeller":"McCauley B3D36C432/80VSA-1 3 ใบ constant speed Ø 77.5–79.0 in (1.97–2.01 m)","seats":6,"category":"normal (utility ตาม POH)","tc_ref":"EASA TCDS EASA.IM.A.053 Issue 10 (17 Jan 2025) Section 2 (T206H); FAA TCDS A4CE ไม่ได้เปิด"},"u":"-","scope":"aircraft","src":["LN23","LN18","LN19","LS1"],"conf":"สูง","est":false,"note":"ผู้ใช้ในไทย: ATO 1 แห่ง 1 ลำ ไม่ใช่เครื่องฝึกพื้นฐาน (02.5.2)"},
   "weights": {
    "MTOW": {"v":1632.9,"u":"kg","scope":"aircraft","src":["LN23","LN18"],"conf":"สูง","est":false,"note":"3,600 lb (TCDS IM.A.053 p17; POH p iii, p2-8); STC เพิ่มน้ำหนักเป็น 3,789 lb มีบาง ลำ (LN20) MLW คงเดิม"},
    "MLW": {"v":1632.9,"u":"kg","scope":"aircraft","src":["LN23","LN18"],"conf":"สูง","est":false,"note":"3,600 lb (TCDS p17)"},
    "MRW": {"v":1640.6,"u":"kg","scope":"aircraft","src":["LN23","LN18"],"conf":"สูง","est":false,"note":"ramp 3,617 lb (TCDS p17)"},
    "BEW_typical": {"v":1050,"u":"kg","scope":"aircraft","src":["LN18"],"conf":"สูง","est":false,"note":"standard empty 2,314 lb (POH p1-8); AOPA ปี 2000 ให้ 2,274 lb"},
    "max_fuel_usable": {"v":237.1,"u":"kg","scope":"aircraft","src":["LN23","LN18","LM4"],"conf":"สูง","est":false,"note":"ใช้ได้ 87.0 US gal (329.3 L) จาก 92.0 สำหรับ s/n T20608362 ขึ้นไป ซึ่งรวมลำในไทย (TCDS p16; ก่อนหน้านั้น 88 US gal; POH p1-6, p2-15) × 0.72 kg/L"},
    "useful_load": {"v":591,"u":"kg","scope":"aircraft","src":["LN18"],"conf":"สูง","est":false,"note":"max useful load 1,303 lb (POH p1-8)"},
    "training_mass": {"v":{"kg":1354,"empty_kg":1050,"crew_kg":160,"fuel_kg":144,"fuel_l":200},"u":"kg","scope":"aircraft","src":["LN0","LM4"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: empty_kg = BEW_typical 1050 kg + ครู 85 + ศิษย์ 75 kg + เชื้อเพลิง 200 L × 0.72 kg/L = 1354 kg; เชื้อเพลิง 200 L ≈ 53 US gal"}
   },
   "cg": {
    "datum": {"v":"ผิวหน้าของ firewall (FS 0.0)","u":"-","scope":"aircraft","src":["LN23","LN18"],"conf":"สูง","est":false,"note":"TCDS p17; POH p2-8 ระบุผิวหน้าของ firewall ส่วนล่าง"},
    "envelope": {"v":[[1134,0.8382,1.2624],[1632.9,1.0795,1.2624]],"u":"kg, m DAT","scope":"aircraft","src":["LN23","LN18"],"conf":"สูง","est":false,"note":"หน้า 33.0 in ที่ ≤ 2,500 lb ถึง 42.5 in ที่ 3,600 lb เส้นตรง; หลัง 49.7 in ทุกน้ำหนัก (TCDS p17 และ POH p2-8 ตรงกัน)"}
   },
   "geometry": {
    "span": {"v":10.97,"u":"m","scope":"aircraft","src":["LN19"],"conf":"กลาง","est":false,"note":"36 ft (AOPA Pilot 2000)"},
    "length": {"v":8.61,"u":"m","scope":"aircraft","src":["LN19"],"conf":"กลาง","est":false,"note":"28 ft 3 in"},
    "height": {"v":2.82,"u":"m","scope":"aircraft","src":["LN19"],"conf":"กลาง","est":false,"note":"9 ft 3 in"}
   },
   "wing": {
    "S": {"v":16.17,"u":"m2","scope":"aircraft","src":["LN18","LN19"],"conf":"สูง","est":false,"note":"174.0 ft² (POH Fig 1-1)"},
    "b": {"v":10.97,"u":"m","scope":"aircraft","src":["LN19"],"conf":"กลาง","est":false,"note":"36 ft"},
    "AR": {"v":7.45,"u":"-","scope":"aircraft","src":["LN0"],"conf":"กลาง","est":true,"note":"ค่าประมาณ: b²/S"}
   }
  },
  "aero": {
   "ref": {
    "S": {"v":16.17,"u":"m2","scope":"aircraft","src":["LN18","LN19"],"conf":"สูง","est":false,"note":"เท่ากับ airframe.wing.S"},
    "b": {"v":10.97,"u":"m","scope":"aircraft","src":["LN19"],"conf":"กลาง","est":false,"note":"เท่ากับ airframe.wing.b"},
    "c": {"v":1.474,"u":"m","scope":"aircraft","src":["LN0"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: mean geometric chord S/b เพราะแหล่งไม่ให้ MAC"}
   },
   "flaps": {
    "detents": {"v":[{"name":"UP","flap_deg":0,"VFE_kt":null},{"name":"10","flap_deg":10,"VFE_kt":140},{"name":"20","flap_deg":20,"VFE_kt":120},{"name":"FULL","flap_deg":40,"VFE_kt":100}],"u":"deg, kt","scope":"aircraft","src":["LN18","LN20","LN23"],"conf":"กลาง","est":false,"note":"ตำแหน่ง UP / 10° / 20° / FULL (40°, ไม่มีตำแหน่ง 30°) ตาม POH และ LN20 §21.1; VFE UP–10° 140 KIAS, 10°–20° 120 KIAS, 20°–FULL 100 KIAS (POH p2-4; TCDS IM.A.053 ให้เพียง flaps extended 100 KIAS ซึ่งตรงกับค่าแฟลปเต็ม); วิ่งขึ้นใช้ UP–20° (D6: ชื่อเดียวกันนี้ใช้ใน 08/09)"}
   },
   "static_long": {
    "CLmax_target": {"v":{"UP":1.51,"FULL":1.99},"u":"-","scope":"aircraft","src":["LN0","LN18","LN19"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: CLmax 1 g = 0.95 · 2 m g /(ρ0 S V²) จาก VS ที่ MTOW 1632.9 kg (lm_polar.clmaxFromStall, ความเร็วต่ำสุดของการเข้า stall 1 kt/s, nz 0.95)"}
   }
  },
  "speeds": {
   "VFE": {"v":{"10":140,"20":120,"FULL":100},"u":"kt IAS","scope":"aircraft","src":["LN18","LN20","LN23"],"conf":"สูง","est":false,"note":"ความเร็วสูงสุดที่ตำแหน่งแฟลปนั้น (ชื่อตาม aero.flaps.detents)"},
   "VS0_kt": {"v":54,"u":"kt CAS","scope":"aircraft","src":["LN18","LN19"],"conf":"สูง","est":false,"note":"แฟลป FULL idle MTOW 54 KCAS (POH p iii) = 27.8 m/s; AOPA ให้ 39 KIAS (ผลต่าง IAS–CAS ใหญ่ที่มุมปะทะสูง)"},
   "VS1_kt": {"v":62,"u":"kt CAS","scope":"aircraft","src":["LN18","LN19"],"conf":"สูง","est":false,"note":"แฟลป UP idle MTOW 62 KCAS (POH p iii) = 31.9 m/s; AOPA 50 KIAS"},
   "VX_kt": {"v":69,"u":"kt IAS","scope":"aircraft","src":["LN19"],"conf":"กลาง","est":false,"note":"35.5 m/s (AOPA Pilot 2000 อิง POH)"},
   "VY_kt": {"v":89,"u":"kt IAS","scope":"aircraft","src":["LN19"],"conf":"กลาง","est":false,"note":"45.8 m/s"},
   "VR_kt": {"v":55,"u":"kt IAS","scope":"aircraft","src":["LN20"],"conf":"กลาง","est":false,"note":"normal takeoff rotation ตาม POH (LN20 §20.3); 56 KIAS เมื่อติด STC เพิ่มน้ำหนัก"},
   "VG_kt": {"v":80,"u":"kt IAS","scope":"aircraft","src":["LN18","LN20"],"conf":"สูง","est":false,"note":"best glide ที่ 3,600 lb (POH p3-7)"},
   "VA_kt": {"v":125,"u":"kt IAS","scope":"aircraft","src":["LN23","LN18"],"conf":"สูง","est":false,"note":"123 KCAS ที่ 3,600 lb (TCDS p16–17); 120 KIAS ที่ 2,950 lb; 106 KIAS ที่ 2,300 lb (POH p2-4)"},
   "VNO_kt": {"v":149,"u":"kt IAS","scope":"aircraft","src":["LN23","LN18"],"conf":"สูง","est":false,"note":"147 KCAS (TCDS p16–17, POH p2-4)"},
   "VNE_kt": {"v":182,"u":"kt IAS","scope":"aircraft","src":["LN23","LN18"],"conf":"สูง","est":false,"note":"TCDS ให้ 180 KCAS (92.6 m/s), POH 179 KCAS (§13.8 ข้อ 6)"},
   "crosswind_demonstrated_kt": {"v":20,"u":"kt","scope":"aircraft","src":["LN19","LN20"],"conf":"กลาง","est":false,"note":"10.3 m/s ไม่ใช่ขีดจำกัด"},
   "VREF_kt": {"v":67,"u":"kt IAS","scope":"aircraft","src":["LN20","LN18"],"conf":"กลาง","est":false,"note":"D1: short field approach แฟลป FULL 67 KIAS (POH Section 4 ตาม LN20 §20.9; Section 5 ใช้ 64) ที่ MLW 3,600 lb; Cessna ให้ใช้ความเร็วบท 4 กับทุกน้ำหนักที่ต่ำกว่า จึงใช้ค่าเดียวกันที่ training_mass (แนวเดียวกับบัตร c172s); = 1.24 VS0 (54 KCAS)"},
   "VAPP_kt": {"v":75,"u":"kt IAS","scope":"aircraft","src":["LN20","LN18"],"conf":"กลาง","est":false,"note":"D1 (บัตรเป็นเจ้าของ; 08 ops.final และ 09 Vapp อ้างค่านี้): normal approach แฟลป FULL 70–80 KIAS (LN20 §20.7 อิง POH) ใช้กลางช่วง 75 KIAS = 38.6 m/s; แฟลป UP 80–90 KIAS"}
  },
  "performance": {
   "ROC_SL_fpm": {"v":1050,"u":"fpm","scope":"aircraft","src":["LN18","LN19"],"conf":"สูง","est":false,"note":"SL MTOW (5.33 m/s) (POH p ii)"},
   "service_ceiling_ft": {"v":27000,"u":"ft","scope":"aircraft","src":["LN18","LN19"],"conf":"สูง","est":false,"note":"8,230 m (turbocharged)"},
   "takeoff": {"v":{"ground_roll_m":277,"over50ft_m":530},"u":"m","scope":"aircraft","src":["LN18","LN19"],"conf":"สูง","est":false,"note":"910 / 1,740 ft ที่ MTOW, ISA, ทางวิ่งแข็งแห้ง ลมสงบ (POH p iii)"},
   "landing": {"v":{"ground_roll_m":224,"over50ft_m":425},"u":"m","scope":"aircraft","src":["LN18","LN19"],"conf":"สูง","est":false,"note":"735 / 1,395 ft เงื่อนไขเดียวกัน"},
   "cruise_table": {"v":[{"ktas":164,"h_ft":20000,"power_pct":75}],"u":"kt TAS, ft","scope":"aircraft","src":["LN19"],"conf":"กลาง","est":false,"note":"164 KTAS (84.4 m/s) ที่ 75 % 20,000 ft; max level 178 KTAS ที่ 17,000 ft"}
  },
  "piston": {
   "identity": {"v":{"model":"Lycoming TIO-540-AJ1A","kind":"fuel_injected","displacement_L":8.87,"cylinders":6,"tcds":"FAA E14EA (ไม่ได้เปิด)"},"u":"-","scope":"engine","src":["LN23","LN18"],"conf":"สูง","est":false,"note":"turbocharged 541.5 in³; 310 hp ที่ 2,500 rpm ทั้ง takeoff และ continuous (TCDS p15), 39 inHg (POH p1-5)"},
   "ratings": {
    "P_rated": {"v":231167,"u":"W","scope":"engine","src":["LN23","LN18"],"conf":"สูง","est":false,"note":"231.2 kW = 310 hp ต่อเครื่อง"},
    "rpm_rated": {"v":2500,"u":"rpm","scope":"engine","src":["LN23","LN18"],"conf":"สูง","est":false,"note":"ขับใบพัดตรง"}
   }
  },
  "propulsion": {
   "layout": {"v":[{"id":1,"pos":null,"axis":[1,0,0],"type":"piston","model":"Lycoming TIO-540-AJ1A","prop_sense":1}],"u":"m FRD, -","scope":"aircraft","src":["LN23","LN18"],"conf":"กลาง","est":true,"note":"ค่าประมาณ: เครื่อง Lycoming ขับตรงหมุนตามเข็มนาฬิกาเมื่อมองจากด้านหลัง (แบบเดียวกับบัตร c172s); pos = null เพราะแหล่งไม่ให้ตำแหน่งเครื่องยนต์ (1 เครื่อง)"}
  },
  "propeller": {
   "identity": {
    "kind": {"v":"constant_speed","u":"-","scope":"propeller","src":["LN23","LN18"],"conf":"สูง","est":false,"note":"constant speed"},
    "model": {"v":"McCauley B3D36C432/80VSA-1","u":"-","scope":"propeller","src":["LN23","LN18"],"conf":"สูง","est":false,"note":""},
    "nBlades": {"v":3,"u":"-","scope":"propeller","src":["LN23","LN18"],"conf":"สูง","est":false,"note":""},
    "diameter": {"v":2.007,"u":"m","scope":"propeller","src":["LN23","LN18"],"conf":"สูง","est":false,"note":"Ø สูงสุด 79.0 in (2.007 m) ต่ำสุด 77.5 in (1.969 m) (TCDS p16, POH p2-6)"},
    "sense": {"v":1,"u":"-","scope":"propeller","src":["LN23","LN18"],"conf":"กลาง","est":true,"note":"ค่าประมาณ: +1 = หมุนตามเข็มนาฬิกาเมื่อมองจากด้านหลัง (รอบที่ 1)"}
   },
   "engineInterface": {
    "maxShaftPower": {"v":231.2,"u":"kW","scope":"propeller","src":["LN23","LN18"],"conf":"สูง","est":false,"note":"กำลังพิกัดต่อเครื่อง"}
   }
  },
  "gear": {
   "layout": {"v":"tricycle_fixed","u":"-","scope":"gear","src":["LN18"],"conf":"สูง","est":false,"note":"ล้อตายตัว"}
  },
  "controls": {
   "surfaces": {
    "elevator": {"v":{"travel_deg":{"up":21,"down":17}},"u":"deg","scope":"aircraft","src":["LN23"],"conf":"สูง","est":false,"note":"ขึ้น 21° ลง 17° (±1°) เทียบกับ stabilizer (TCDS p17–18)"},
    "aileron": {"v":{"travel_deg":{"up":21,"down":14.5}},"u":"deg","scope":"aircraft","src":["LN23"],"conf":"สูง","est":false,"note":"ขึ้น 21° ลง 14°30′ (±2°)"},
    "rudder": {"v":{"travel_deg":{"left":24,"right":24}},"u":"deg","scope":"aircraft","src":["LN23"],"conf":"สูง","est":false,"note":"24° ซ้าย/ขวา (±1°) ขนานกับ W.L. 0.00; 27°13′ เมื่อวัดตั้งฉากกับ hinge line"},
    "flap": {"v":{"travel_deg":{"up":0,"down":40}},"u":"deg","scope":"aircraft","src":["LN23"],"conf":"สูง","est":false,"note":"ลง 40° (+1°, −2°)"},
    "trim_tab": {"v":{"travel_deg":{"up":25,"down":5}},"u":"deg","scope":"aircraft","src":["LN23"],"conf":"สูง","est":false,"note":"elevator tab ขึ้น 25° ลง 5° (+1°, −0°)"}
   }
  },
  "_na": {"v":["aero.static_long.CL0","aero.static_long.CLalpha","aero.static_long.alpha_star","aero.static_long.alpha_star_neg","aero.static_long.a1","aero.static_long.CL_sep_at_alpha_star","aero.static_long.CDmax_90","aero.static_long.dCD_sep","aero.static_long.CmX","aero.static_long.Cm0","aero.static_long.Cmalpha","aero.static_long.alpha_CLmax","aero.static_long.table_clean","aero.elevator_fade.*","aero.separation_dynamics.*","aero.large_beta.*","aero.strip_wing.*","aero.stall_warning.*","aero.buffet.*","aero.spin_reference.*","interference.downwash.*","interference.groundEffect.*","interference.slipstream.*","propeller.identity.massComplete","propeller.identity.hubPosition","propeller.identity.thrustAxis","propeller.engineInterface.rpmGoverned","propeller.engineInterface.rpmTransientLimit","propeller.engineInterface.gearRatio","propeller.engineInterface.flightIdleShaftPower","propeller.bladeGeometry.*","propeller.section.*","propeller.tables.*","propeller.inertia.*","propeller.governor.*","propeller.betaReverse.*","propeller.feathered.*","propeller.checks.*","turboprop.ratings.*","turboprop.steady_map.*","turboprop.dynamics.*","turboprop.airframe_coupling.*","turboprop.fuel.*","turboprop.beta_reverse.*","turboprop.derived_vtbd.*","turboprop.reference_engines.*","turbofan.engines.*","turbofan.reverser.*","controls.pitch.*","controls.roll.*","controls.yaw.*","controls.reference_types.*","gear.geometry.*","gear.strut_main.*","gear.strut_nose.*","gear.tyre_main.*","gear.tyre_nose.*","gear.brakes.*","gear.steering.*","gear.certification.*","wind.discreteGust.*","wind.fFactor.*","wind.wake.*","numerics.contact.*","validation.classification.*","validation.procedures.*","validation.typicalModes.*","validation.currentModel.*","input.keyboard.*","otherSims.jsbsim.*","otherSims.yasim.*","otherSims.xplane.*","otherSims.msfs.*","otherSims.geofs.*","otherSims.airfieldlab.*"],"u":"-","scope":"aircraft","src":["LN0"],"conf":"สูง","est":false,"note":"บัตรย่อระดับ TCDS (D5): path ต่อแบบของรอบที่ 1 ที่ไม่ได้กรอกมีสองกลุ่ม (1) ไม่เกี่ยวกับแบบนี้: turbofan.*, turboprop.*, propeller.betaReverse.*, gear.brakes.antiskid*, propeller.feathered.* และ validation.typicalModes ของเครื่องบินโดยสาร; (2) เลื่อนไปทำเมื่อจำเป็น เพราะไม่มีข้อมูลสาธารณะระดับ TCDS/POH ของแบบนี้หรือซิมยังไม่มีโมเดลย่อย: อากาศพลศาสตร์ละเอียด (static_long ยกเว้น CLmax_target, stall/buffet/spin, strip wing), interference (downwash, ground effect, slipstream), รูปทรงและตารางใบพัด, governor, hinge moment และแรงที่คัน (controls.pitch/roll/yaw), ขาล้อ ยาง เบรก, numerics.contact, wind, input และ otherSims (หัวข้อ 03 เป็นเจ้าของ) lm_card ใช้ค่าเริ่มต้นของหัวข้อ 01 (ติดธง R1/default) แทนในกลุ่มที่ 2"}
 }
}
```

**บล็อก `ct4`** (PAC CT/4E Airtrainer; 46 leaf รวม `_na`)

```json
{
 "ct4": {
  "airframe": {
   "identity": {"v":{"manufacturer":"Pacific Aerospace (นิวซีแลนด์; ผู้ถือ TC ปัจจุบัน NZSkydive Ltd ชื่อการค้า NZAero)","model":"CT/4E Airtrainer","variant":"CT/4E (TCDS A-10 item IV, Lycoming 300 hp, 1,180 kg) เป็นแบบอ้างอิงของบัตร; CT/4A (item II, Continental IO-360-H 210 hp, 2,400 lb) ต่างที่เครื่องยนต์และมวล; ผู้ใช้ในไทยเป็นผู้ใช้ทางทหาร แสดงแบบทั่วไปจากเอกสารรับรองแบบพลเรือนและข้อมูลผู้ผลิตเท่านั้น","engine":"Lycoming AEIO-540-L1B5 300 hp (224 kW) ที่ 2,700 rpm (ระบบน้ำมันแบบ aerobatic)","propeller":"Hartzell HC-C3YR-4BF/FC7663-2 3 ใบ constant speed Ø 75–76 in (1.91–1.93 m); ตัวเลือก MT MTV-9-B-C/C193-58","seats":2,"category":"acrobatic (FAR 23)","tc_ref":"CAA NZ TCDS A-10 Rev 21 (10 Jun 2024) item IV; อนุมัติ 17 Jul 1992"},"u":"-","scope":"aircraft","src":["LN21","LN22"],"conf":"สูง","est":false,"note":"จำนวนเครื่องของผู้ใช้ทางทหารในไทยอยู่ใน 02 (common_light.thai_fleet.military_generic, ความเชื่อมั่นต่ำ)"},
   "weights": {
    "MTOW": {"v":1180,"u":"kg","scope":"aircraft","src":["LN21"],"conf":"สูง","est":false,"note":"2,600 lb (TCDS item IV)"},
    "MLW": {"v":1180,"u":"kg","scope":"aircraft","src":["LN22"],"conf":"กลาง","est":false,"note":"2,600 lb (หน้าเว็บผู้ผลิต)"},
    "BEW_typical": {"v":770,"u":"kg","scope":"aircraft","src":["LN22"],"conf":"กลาง","est":false,"note":"basic empty 1,700 lb (หน้าเว็บผู้ผลิต)"},
    "max_fuel_usable": {"v":146,"u":"kg","scope":"aircraft","src":["LN22","LN21"],"conf":"กลาง","est":false,"note":"\"maximum fuel\" 322 lb (146 kg) ตามผู้ผลิต (ไม่ได้บอกว่าเป็นส่วนใช้ได้); ความจุ 207 L (45.5 Imp gal) ตาม TCDS"},
    "training_mass": {"v":{"kg":1038,"empty_kg":770,"crew_kg":160,"fuel_kg":108,"fuel_l":150},"u":"kg","scope":"aircraft","src":["LN0","LM4"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: empty_kg = BEW_typical 770 kg + ครู 85 + ศิษย์ 75 kg + เชื้อเพลิง 150 L × 0.72 kg/L = 1038 kg; เชื้อเพลิง 150 L"}
   },
   "cg": {
    "envelope": {"v":[[998,0.7366,0.8636],[1180,0.7874,0.8636]],"u":"kg, m DAT","scope":"aircraft","src":["LN21"],"conf":"สูง","est":false,"note":"หน้า 29.0 in ที่ 998 kg ถึง 31.0 in ที่ 1,180 kg; หลัง 34.0 in ทุกน้ำหนัก (TCDS item IV; datum ตามที่ TCDS กำหนด)"}
   },
   "geometry": {
    "span": {"v":7.9,"u":"m","scope":"aircraft","src":["LN22"],"conf":"กลาง","est":false,"note":"26.0 ft"},
    "length": {"v":7.16,"u":"m","scope":"aircraft","src":["LN22"],"conf":"กลาง","est":false,"note":"23.48 ft"},
    "height": {"v":2.59,"u":"m","scope":"aircraft","src":["LN22"],"conf":"กลาง","est":false,"note":"8.50 ft"}
   },
   "wing": {
    "S": {"v":12,"u":"m2","scope":"aircraft","src":["LN22"],"conf":"กลาง","est":false,"note":"129.0 ft² (gross)"},
    "b": {"v":7.9,"u":"m","scope":"aircraft","src":["LN22"],"conf":"กลาง","est":false,"note":"26.0 ft"},
    "AR": {"v":5.2,"u":"-","scope":"aircraft","src":["LN0"],"conf":"กลาง","est":true,"note":"ค่าประมาณ: b²/S"}
   }
  },
  "aero": {
   "ref": {
    "S": {"v":12,"u":"m2","scope":"aircraft","src":["LN22"],"conf":"กลาง","est":false,"note":"เท่ากับ airframe.wing.S"},
    "b": {"v":7.9,"u":"m","scope":"aircraft","src":["LN22"],"conf":"กลาง","est":false,"note":"เท่ากับ airframe.wing.b"},
    "c": {"v":1.519,"u":"m","scope":"aircraft","src":["LN0"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: mean geometric chord S/b เพราะแหล่งไม่ให้ MAC"}
   },
   "flaps": {
    "detents": {"v":[{"name":"UP","flap_deg":0,"VFE_kt":null},{"name":"TO","flap_deg":15,"VFE_kt":100},{"name":"LDG","flap_deg":30,"VFE_kt":85}],"u":"deg, kt","scope":"aircraft","src":["LN21"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณบางส่วน: TCDS ให้ VFE ของตำแหน่ง take-off 100 KCAS และ landing 85 KCAS (CT/4A: half flap / full flap) และแฟลปสุด 30°; ชื่อ UP/TO/LDG ตามคำของ TCDS; มุม TO 15° เป็นค่าประมาณ (ครึ่งหนึ่งของ 30° ตามคำ \"half flap\" ของ CT/4A); PAC/CT/0259 เพิ่ม VFE landing เป็น 91 KIAS (D6: ชื่อเดียวกันนี้ใช้ใน 08/09)"}
   },
   "static_long": {
    "CLmax_target": {"v":{"UP":1.57,"LDG":2.791},"u":"-","scope":"aircraft","src":["LN0","LN22"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: CLmax 1 g = 0.95 · 2 m g /(ρ0 S V²) จาก VS ที่ MTOW 1180 kg (lm_polar.clmaxFromStall, ความเร็วต่ำสุดของการเข้า stall 1 kt/s, nz 0.95); ข้อควรระวัง: CLmax แฟลป LDG 2.79 เกินที่แฟลปธรรมดา 30° ทำได้ (≈ 1.9–2.3) แสดงว่า Vsf 45 kt ของผู้ผลิตไม่ใช่ KCAS ที่ MTOW; ถ้า CLmax จริง ≈ 2.1 VS0 ≈ 52 KCAS และ VREF ≈ 63 (§13.8 ข้อ 7; T-LN-06)"}
   }
  },
  "speeds": {
   "VFE": {"v":{"TO":100,"LDG":85},"u":"kt CAS","scope":"aircraft","src":["LN21"],"conf":"กลาง","est":false,"note":"ความเร็วสูงสุดที่ตำแหน่งแฟลปนั้น (ชื่อตาม aero.flaps.detents)"},
   "VS0_kt": {"v":45,"u":"kt CAS","scope":"aircraft","src":["LN22"],"conf":"ต่ำ","est":false,"note":"Vsf (full flap) 45 kt (23.1 m/s) ตามผู้ผลิต ไม่บอก IAS/CAS และมวล จึงถือเป็น KCAS ที่ MTOW; CLmax ที่ได้ (2.79) สูงเกินจริง ดู §13.8 ข้อ 7"},
   "VS1_kt": {"v":60,"u":"kt CAS","scope":"aircraft","src":["LN22"],"conf":"กลาง","est":false,"note":"Vs (no flap) 60 kt (30.9 m/s) หน่วยเหมือนข้างบน"},
   "VA_kt": {"v":146,"u":"kt CAS","scope":"aircraft","src":["LN21","LN22"],"conf":"สูง","est":false,"note":"TCDS (ผู้ผลิตให้ 144 kt)"},
   "VNO_kt": {"v":147,"u":"kt CAS","scope":"aircraft","src":["LN21"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ: TCDS ไม่ให้ VNO ใช้ VC (design cruising speed) 147 KCAS แทน (ผู้ผลิตให้ Vc 150 kt)"},
   "VNE_kt": {"v":207,"u":"kt CAS","scope":"aircraft","src":["LN21"],"conf":"สูง","est":false,"note":"106.5 m/s (TCDS item IV)"},
   "VREF_kt": {"v":55,"u":"kt CAS","scope":"aircraft","src":["LM25","LN0","LN22"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ (D1, AFM ไม่สาธารณะ): 1.3 VS0 ที่ training_mass 1038 kg = 1.3 × 45 × √(1038/1180) = 54.9 → 55 kt (28.3 m/s) [AFH p9-3]; ไม่มีตาราง IAS→CAS ให้ถือ KIAS ≈ KCAS; ความไว: ถ้า VS0 จริง ≈ 52 KCAS (CLmax 2.1) จะได้ VREF ≈ 63 และ VAPP ≈ 68 kt ต้องยืนยันด้วย AFM ก่อนใช้ในซิม"},
   "VAPP_kt": {"v":60,"u":"kt CAS","scope":"aircraft","src":["LN0","LM25"],"conf":"ต่ำ","est":true,"note":"ค่าประมาณ (D1; 08 ops.final และ 09 Vapp อ้างค่านี้): VREF + 5 kt ตามค่าเริ่มต้น VappMinusVref ของ 01-methods §01.1 = 60 kt (30.9 m/s)"}
  },
  "performance": {
   "ROC_SL_fpm": {"v":1830,"u":"fpm","scope":"aircraft","src":["LN22"],"conf":"กลาง","est":false,"note":"9.3 m/s ตามผู้ผลิต (ไม่บอกมวลและความสูง)"},
   "takeoff": {"v":{"ground_roll_m":183,"over50ft_m":null},"u":"m","scope":"aircraft","src":["LN22"],"conf":"กลาง","est":false,"note":"take-off ground roll 600 ft (ผู้ผลิต); ระยะถึง 50 ft ไม่มีในแหล่ง"},
   "landing": {"v":{"ground_roll_m":168,"over50ft_m":null},"u":"m","scope":"aircraft","src":["LN22"],"conf":"กลาง","est":false,"note":"landing run 553 ft (ผู้ผลิต)"}
  },
  "piston": {
   "identity": {"v":{"model":"Lycoming AEIO-540-L1B5","kind":"fuel_injected","displacement_L":8.87,"cylinders":6,"tcds":"FAA 1E4 (O-540 series; ไม่ได้เปิด)"},"u":"-","scope":"engine","src":["LN21","LN22"],"conf":"สูง","est":false,"note":"300 hp ที่ 2,700 rpm เต็มคันเร่งทุกการใช้งาน (TCDS item IV); ความจุ 541.5 in³ ของตระกูล 540; power loading 8.7 lb/hp ที่ MAUW ของผู้ผลิตตรงกับ 300 hp"},
   "ratings": {
    "P_rated": {"v":223710,"u":"W","scope":"engine","src":["LN21","LN22"],"conf":"สูง","est":false,"note":"223.7 kW = 300 hp ต่อเครื่อง"},
    "rpm_rated": {"v":2700,"u":"rpm","scope":"engine","src":["LN21","LN22"],"conf":"สูง","est":false,"note":"ขับใบพัดตรง"}
   }
  },
  "propulsion": {
   "layout": {"v":[{"id":1,"pos":null,"axis":[1,0,0],"type":"piston","model":"Lycoming AEIO-540-L1B5","prop_sense":1}],"u":"m FRD, -","scope":"aircraft","src":["LN21"],"conf":"กลาง","est":true,"note":"ค่าประมาณ: เครื่อง Lycoming ขับตรงหมุนตามเข็มนาฬิกาเมื่อมองจากด้านหลัง (แบบเดียวกับบัตร c172s); pos = null เพราะแหล่งไม่ให้ตำแหน่งเครื่องยนต์ (1 เครื่อง)"}
  },
  "propeller": {
   "identity": {
    "kind": {"v":"constant_speed","u":"-","scope":"propeller","src":["LN21"],"conf":"สูง","est":false,"note":"constant speed"},
    "model": {"v":"Hartzell HC-C3YR-4BF/FC7663-2","u":"-","scope":"propeller","src":["LN21"],"conf":"สูง","est":false,"note":""},
    "nBlades": {"v":3,"u":"-","scope":"propeller","src":["LN21"],"conf":"สูง","est":false,"note":""},
    "diameter": {"v":1.93,"u":"m","scope":"propeller","src":["LN21"],"conf":"สูง","est":false,"note":"Ø สูงสุด 76 in ต่ำสุด 75 in (TCDS item IV); มุมใบที่สถานี 30 in 13.4°–32°"},
    "sense": {"v":1,"u":"-","scope":"propeller","src":["LN21"],"conf":"กลาง","est":true,"note":"ค่าประมาณ: +1 = หมุนตามเข็มนาฬิกาเมื่อมองจากด้านหลัง (รอบที่ 1)"}
   },
   "engineInterface": {
    "maxShaftPower": {"v":223.7,"u":"kW","scope":"propeller","src":["LN21","LN22"],"conf":"สูง","est":false,"note":"กำลังพิกัดต่อเครื่อง"}
   }
  },
  "gear": {
   "layout": {"v":"tricycle_fixed","u":"-","scope":"gear","src":["LN22"],"conf":"กลาง","est":true,"note":"ค่าประมาณ: ล้อสามล้อตายตัวตามภาพของผู้ผลิต แหล่งข้อความไม่ระบุ"}
  },
  "controls": {
   "surfaces": {
    "elevator": {"v":{"travel_deg":{"up":25,"down":15}},"u":"deg","scope":"aircraft","src":["LN21"],"conf":"สูง","est":false,"note":"ขึ้น 25° ลง 15° (TCDS item IV)"},
    "aileron": {"v":{"travel_deg":{"up":16.5,"down":10.5}},"u":"deg","scope":"aircraft","src":["LN21"],"conf":"สูง","est":false,"note":"ขึ้น 16.5° ลง 10.5°"},
    "rudder": {"v":{"travel_deg":{"left":30,"right":30}},"u":"deg","scope":"aircraft","src":["LN21"],"conf":"สูง","est":false,"note":"30° ซ้าย/ขวา"},
    "flap": {"v":{"travel_deg":{"up":0,"down":30}},"u":"deg","scope":"aircraft","src":["LN21"],"conf":"สูง","est":false,"note":"ลง 30°"}
   }
  },
  "_na": {"v":["aero.static_long.CL0","aero.static_long.CLalpha","aero.static_long.alpha_star","aero.static_long.alpha_star_neg","aero.static_long.a1","aero.static_long.CL_sep_at_alpha_star","aero.static_long.CDmax_90","aero.static_long.dCD_sep","aero.static_long.CmX","aero.static_long.Cm0","aero.static_long.Cmalpha","aero.static_long.alpha_CLmax","aero.static_long.table_clean","aero.elevator_fade.*","aero.separation_dynamics.*","aero.large_beta.*","aero.strip_wing.*","aero.stall_warning.*","aero.buffet.*","aero.spin_reference.*","interference.downwash.*","interference.groundEffect.*","interference.slipstream.*","propeller.identity.massComplete","propeller.identity.hubPosition","propeller.identity.thrustAxis","propeller.engineInterface.rpmGoverned","propeller.engineInterface.rpmTransientLimit","propeller.engineInterface.gearRatio","propeller.engineInterface.flightIdleShaftPower","propeller.bladeGeometry.*","propeller.section.*","propeller.tables.*","propeller.inertia.*","propeller.governor.*","propeller.betaReverse.*","propeller.feathered.*","propeller.checks.*","turboprop.ratings.*","turboprop.steady_map.*","turboprop.dynamics.*","turboprop.airframe_coupling.*","turboprop.fuel.*","turboprop.beta_reverse.*","turboprop.derived_vtbd.*","turboprop.reference_engines.*","turbofan.engines.*","turbofan.reverser.*","controls.pitch.*","controls.roll.*","controls.yaw.*","controls.reference_types.*","gear.geometry.*","gear.strut_main.*","gear.strut_nose.*","gear.tyre_main.*","gear.tyre_nose.*","gear.brakes.*","gear.steering.*","gear.certification.*","wind.discreteGust.*","wind.fFactor.*","wind.wake.*","numerics.contact.*","validation.classification.*","validation.procedures.*","validation.typicalModes.*","validation.currentModel.*","input.keyboard.*","otherSims.jsbsim.*","otherSims.yasim.*","otherSims.xplane.*","otherSims.msfs.*","otherSims.geofs.*","otherSims.airfieldlab.*"],"u":"-","scope":"aircraft","src":["LN0"],"conf":"สูง","est":false,"note":"บัตรย่อระดับ TCDS (D5): path ต่อแบบของรอบที่ 1 ที่ไม่ได้กรอกมีสองกลุ่ม (1) ไม่เกี่ยวกับแบบนี้: turbofan.*, turboprop.*, propeller.betaReverse.*, gear.brakes.antiskid*, propeller.feathered.* และ validation.typicalModes ของเครื่องบินโดยสาร; (2) เลื่อนไปทำเมื่อจำเป็น เพราะไม่มีข้อมูลสาธารณะระดับ TCDS/POH ของแบบนี้หรือซิมยังไม่มีโมเดลย่อย: อากาศพลศาสตร์ละเอียด (static_long ยกเว้น CLmax_target, stall/buffet/spin, strip wing), interference (downwash, ground effect, slipstream), รูปทรงและตารางใบพัด, governor, hinge moment และแรงที่คัน (controls.pitch/roll/yaw), ขาล้อ ยาง เบรก, numerics.contact, wind, input และ otherSims (หัวข้อ 03 เป็นเจ้าของ) lm_card ใช้ค่าเริ่มต้นของหัวข้อ 01 (ติดธง R1/default) แทนในกลุ่มที่ 2"}
 }
}
```
<!-- LN_JSON_END -->

## 13.7 กรณีทดสอบ
21 กรณี สร้างโดย `scripts/ln_tests.mjs` (ผลเต็มใน `scripts/out/ln_tests.txt` และ `ln_tests.json`) T-LN-01 ถึง 09 ตรวจข้อมูลของบัตร (ไม่ใช่ผลซิม) T-LN-10 ถึง 21 บินในซิมวันนี้ผ่าน `lm_card` ที่ MTOW รหัสแหล่งอยู่ใน §13.9 และหัวข้อ 01 (LM)

| รหัส | เงื่อนไข | ปริมาณที่วัด | ผลคาดหวัง ± tolerance | ที่มา | โมเดลปัจจุบัน |
|---|---|---|---|---|---|
| T-LN-01 | ทุกบัตร ความเร็วที่บัตรมี | ลำดับ VS0 < VS1 < VX ≤ VY < VNO < VNE | เรียงถูกทุกบัตร | นิยามความเร็ว 14 CFR Part 23 [LM3] | ตรวจข้อมูล ไม่ใช่ผลซิม: ผ่าน 6/6 |
| T-LN-02 | ทุกบัตร ที่มวลฝึก | VREF / VAPP kt | VAPP ≥ VREF, VAPP − VREF ≤ 10, 1.2·VS0·√(m/MTOW) ≤ VREF ≤ 1.45·VS0 | D1; AFH p9-3 [LM25]; 01-methods §01.1 | ตรวจข้อมูล: ผ่าน (63/70, 76/80, 47/52, 69/74, 67/75, 55/60) |
| T-LN-03 | be76, p68c | VMCA เทียบ VREF และ VYSE | VMCA < VREF และ < VYSE | [LM3][LM25] | ตรวจข้อมูล: ผ่าน (65 < 76, 85; 60 < 69) |
| T-LN-04 | ทุกบัตร | training_mass kg | ผลรวม ±2 kg, empty_kg = BEW_typical, ≤ MTOW, เชื้อเพลิง ≤ ที่ใช้ได้ | D3 [LM4] | ตรวจข้อมูล: ผ่าน (80–92 % MTOW) |
| T-LN-05 | ทุกบัตร detents กับ speeds.VFE | VFE ตามมุมแฟลป | ไม่เพิ่มเมื่อแฟลปมากขึ้น, ≤ VNO, มุมสุด = travel ของแฟลป, ชื่อ VFE อยู่ใน detents | TCDS/POH ของแต่ละแบบ; D6 | ตรวจข้อมูล: ผ่าน 6/6 |
| T-LN-06 | CLmax_target (MTOW, จาก VS ของแหล่ง) | รายการ CLmax นอกช่วง (แฟลปขึ้น 1.1–1.75, แฟลปลง 1.4–2.4) | p2002jf:UP, ct4:LDG (สองค่าที่บันทึกใน §13.8) | ตำรา [LM12][LM11]; 01-methods §01.5 | ตรวจข้อมูล: ตรงกับที่คาด (1.843, 2.791) |
| T-LN-07 | ทุกบัตร | CLmax_target = 0.95·2mg/(ρ0 S VS²) | ±0.005 | lm_polar (01-methods §01.5) | ตรวจข้อมูล: ตรงทุกค่า |
| T-LN-08 | `mergeDir` ทั้งโฟลเดอร์ (= `lm_merge --coverage`) | ERRORS / CONFLICTS / path ที่ขาด / WARN ของบัตร | 0 / 0 / 0 / 0 | schema-ext-r2; D1–D4 [LM0] | ตรวจข้อมูล: 0 / 0 / 0 / 0 (WARN ของ 08/09 ที่อ้างบัตร: 0 เมื่อรันซ้ำ 19 พ.ย. 2026 หลังหัวข้อ 08/09 แก้ตาม §13.3; ร่างก่อนหน้ามี 22) |
| T-LN-09 | บัตร ct4 ทั้งก้อน | คำที่ระบุหน่วย ฐาน สถาบัน เครื่องหมาย | ไม่มี | กฎของเจ้าของ (แสดงแบบทั่วไป) | ตรวจข้อมูล: ไม่มี |
| T-LN-10 | stall idle 1 kt/s 3,000 ft ปีกระดับ 1,106.8 kg | V_SR KEAS แฟลป 0 / 40 | 50 / 44 ±3 | POH [LN2][LN3] | 51.3 / 45.1 (ผ่าน) |
| T-LN-11 | เหมือนข้างบน 1,769 kg ล้อขึ้นที่แฟลป 0 | V_SR KEAS แฟลป 0 / 35 | 70 / 60 ±3 | [LN5][LN7][LN8] | 71.8 / 61.5 (ผ่าน) |
| T-LN-12 | เหมือนข้างบน 620 kg | V_SR KEAS UP / LDG | 41 / 38 ±3 | [LN11] | 42.1 / 39.0 (ผ่าน) |
| T-LN-13 | เหมือนข้างบน 1,990 kg | V_SR KEAS แฟลป 0 / 35 | แฟลป 35 55.5 ±3 (ค่าประมาณ); ไม่มี VS1: แฟลป 0 > แฟลป 35 + 1 | [LN16] ปรับมวล | 70.1 / 56.9 (ผ่าน) |
| T-LN-14 | เหมือนข้างบน 1,632.9 kg | V_SR KEAS UP / FULL | 62 / 54 ±3 | POH p iii [LN18] | 63.6 / 55.4 (ผ่าน) |
| T-LN-15 | เหมือนข้างบน 1,180 kg | V_SR KEAS UP / LDG | 60 / 45 ±3 | [LN22] | 61.5 / 46.5 (ผ่าน; ค่า 45 ขัดฟิสิกส์ §13.8 ข้อ 7) |
| T-LN-16 | ไต่ SL (h 30 m) ISA เต็มกำลัง clean 1,106.8 kg | ROC fpm; Vy KEAS | 692 ±25 %; 79 ±6 | [LN3]; POH [LN2] | 853 (+23 %); 81.6 (ผ่าน) |
| T-LN-17 | เหมือนข้างบน สองเครื่อง ล้อขึ้น 1,769 kg | ROC fpm; Vy KEAS | 1,248 ±25 %; 85 ±6 | [LN7][LN8]; [LN5] | 1,471 (+18 %); 97.9 (ไม่ผ่าน: Vy) |
| T-LN-18 | เหมือนข้างบน 620 kg | ROC fpm; Vy KEAS | 800 ±25 %; 68 ±6 | [LN11]; [LN13] | 1,088 (+36 %); 73.2 (ไม่ผ่าน: ROC) |
| T-LN-19 | เหมือนข้างบน สองเครื่อง 1,990 kg | ROC fpm | 1,100 ±25 % (Vy ไม่มีแหล่ง) | [LN16][LN17] | 1,403 (+28 %); Vy 99.4 (ไม่ผ่าน: ROC) |
| T-LN-20 | เหมือนข้างบน 1,632.9 kg | ROC fpm; Vy KEAS | 1,050 ±25 %; 89 ±6 | POH [LN18][LN19] | 1,238 (+18 %); 98.0 (ไม่ผ่าน: Vy) |
| T-LN-21 | เหมือนข้างบน 1,180 kg | ROC fpm | 1,830 ±25 % (Vy ไม่มีแหล่ง) | [LN22] | 1,856 (+1 %); Vy 101.4 (ผ่าน) |

สรุป: ข้อมูล 9/9 ผ่าน ซิม 8/12 ผ่าน กรณีที่ไม่ผ่านทั้งสี่มาจาก polar แรงต้านของรอบที่ 1 ที่ซิมใช้แทน (§13.4) ไม่ใช่ความผิดของบัตร

## 13.8 ความขัดแย้งของแหล่งข้อมูลและข้อจำกัด
1. **PA-28-161 MTOW**: POH VB-1180 ให้ 2,440 lb (1,106.8 kg) [LN2] แต่ TCDS 2A13 Rev 48 item XVI-A ให้ 2,325 lb (1,054.6 kg) และขอบหน้าของ CG 87.0 in ที่น้ำหนักนั้น [LN1] (ฉบับนี้อาจเป็นค่าของเครื่องรุ่นแรกก่อนเพิ่มน้ำหนัก) บัตรใช้ POH เพราะ Warrior II/III ที่ใช้อยู่ทั่วไปมี MTOW 2,440 lb และ AOPA ตรงกัน [LN3] ต้องตรวจกับ TCDS ฉบับปัจจุบัน
2. **PA-28-161 สมรรถนะ**: ROC เพดาน และระยะวิ่งมาจากหน้า AOPA ของ Warrior III [LN3] ที่ไม่บอกเงื่อนไข เพราะสำเนา POH ที่เปิดได้ไม่มี Section 5 checklist ของโรงเรียน [LN4] ให้ VAPP 70 และ short field 65 KIAS ส่วน POH ให้ final แฟลป 40 63 KIAS [LN2 p4-2] บัตรใช้ 63 เป็น VREF และ 70 เป็น VAPP
3. **BE76 ทั้งบัตร**: แหล่งเป็น flashcard ของผู้ใช้ [LN5][LN6] นิตยสาร [LN7][LN9] และ Wikipedia [LN8] VNE 194 KIAS (LN6, LN7) ขัดกับ 171 kt ใน LN8 ซึ่งตรงกับความเร็วสูงสุดของ LN7 (น่าจะพิมพ์ผิดที่ LN8) บัตรใช้ 194 ระยะวิ่งขึ้น/ลงจอดของ LN9 ไม่บอกเงื่อนไขและหน่วย (สันนิษฐานว่าเป็นฟุตที่ MTOW) Ø ใบพัด 76 in เป็นค่าประมาณจากรหัสใบ
4. **P2002-JF ความเร็ว stall**: สเปก [LN11] ให้ VS0 38 / VS1 41 kt โดยไม่บอก IAS/CAS และมวล ถือเป็น KCAS ที่ 620 kg ได้ CLmax 1 g แฟลปขึ้น 1.84 ซึ่งสูงเกินปีกไม่มีแฟลป (≈ 1.3–1.7) แสดงว่าค่าน่าจะเป็น KIAS หรือมวลต่ำกว่า (T-LN-06) VNE 138 KIAS ของ TCDS ฉบับพื้นฐาน [LN10] ต่างจาก 142 kt ในสเปก (ตรงกับรุ่นแก้ไข); MTOW 620 kg ต่างจาก MkII 660 kg [LN12]; VX VY VR best glide และลมขวางยืมจาก P2002 Sierra [LN13]
5. **P.68C ข้อมูลของรุ่นใหม่**: VS0, ROC, เพดาน, ระยะวิ่ง และ BEW มาจาก Vulcanair P68C ที่ MTOW 2,100 kg [LN16][LN17] ไม่ใช่ P.68C ปี 1980 ที่ 1,990 kg บัตรปรับ VS0 ตามมวลเท่านั้น ระยะลงจอดจาก 50 ft 600 m (1,969 ft) ยาวผิดสังเกตเทียบกับระยะวิ่ง 200 m (อัตราส่วน 3 ขณะที่แบบอื่น 1.7–1.9) อาจเป็นค่าของเงื่อนไขอื่น มุม stabilator: ข้อความสกัดของ TCDS แยกป้ายกับตัวเลข เมื่อเปิดซ้ำพบว่าวัดที่ขอบหน้า (ขึ้น 6° ลง 16°) บัตรแปลงเป็นขอบท้ายขึ้น 16° ลง 6° (ความเชื่อมั่นกลาง ควรตรวจกับ PDF)
6. **T206H**: AOPA Pilot [LN19] ให้ VS0/VS1 39/50 KIAS ส่วน POH [LN18] ให้ 54/62 KCAS (ผลต่าง IAS–CAS ใหญ่ที่มุมปะทะสูง บัตรใช้ KCAS ของ POH); BEW 2,274 lb (AOPA ปี 2000) กับ 2,314 lb (POH); VNE 180 KCAS ใน TCDS [LN23] กับ 179 KCAS ใน POH (ใช้ 182 KIAS ที่ตรงกันทั้งสอง); ความเร็ว short field approach 67 KIAS ใน Section 4 กับ 64 ใน Section 5 (LN20) บัตรใช้ 67 เป็น VREF
7. **CT/4E ความเร็ว stall**: ผู้ผลิต [LN22] ให้ Vs 60 kt และ Vsf 45 kt โดยไม่บอกหน่วยและมวล (เปิดหน้าเว็บซ้ำ 19 พ.ย. 2026 ยืนยันตัวเลขเดิม) ถือเป็น KCAS ที่ MTOW ได้ CLmax แฟลป LDG 2.79 ซึ่งแฟลปธรรมดา 30° ทำไม่ได้ (≈ 1.9–2.3) ค่าจริงน่าจะเป็น KIAS หรือที่มวลต่ำ ถ้า CLmax ≈ 2.1 VS0 ≈ 52 KCAS และ VREF/VAPP ≈ 63/68 แทน 55/60 TCDS ไม่ให้ VNO บัตรใช้ VC 147 KCAS แทน (ค่าประมาณ); "maximum fuel" 146 kg ของผู้ผลิตไม่บอกว่าเป็นส่วนที่ใช้ได้
8. **VAPP ใน 08/09 ไม่ตรงกับบัตร** (D1, §13.3): pa28_161 08 ใช้ 65 (บัตร 70), t206h 09 ใช้ 70 (บัตร 75), p2002jf 09 ใช้ 50 (บัตร 52), p68c 09 ใช้ 75 (บัตร 74)
9. **ชื่อ detent ใน 08/09** (D6, §13.3): 22 รายการใช้ชื่อที่ไม่อยู่ในบัตร (เช่น "FULL", "LAND", "T/O", "0" แทน `UP`, หรือคำบรรยาย) ส่งต่อให้เจ้าของหัวข้อ 08/09 แล้ว และแก้ครบแล้ว (`lm_merge` รันซ้ำ 19 พ.ย. 2026: `xfile_vapp` 0, `detent` 0)
10. **ข้อจำกัดของบัตรย่อ**: ไม่มี polar แรงต้าน อนุพันธ์ inertia และโมเดลล้อ ซิมจึงใช้ค่ารอบที่ 1 (§13.4, §13.5); ไม่มีตาราง IAS→CAS (ถือ IAS ≈ CAS); ไม่ได้เปิด FAA TCDS A29CE (BE76) และ 2A13 ฉบับปัจจุบัน (T206H ใช้ EASA TCDS IM.A.053 [LN23] แทน A4CE)

## 13.9 แหล่งอ้างอิง
สถานะโดยรวม: ตัวเลขและข้อเท็จจริงไม่มีลิขสิทธิ์ในตัวเอง AirfieldLab อ้างได้เมื่อบอกที่มา คู่มือผู้ผลิต (POH/AFM) สเปก และบทความมีลิขสิทธิ์ของเจ้าของ อ้างตัวเลขพร้อมหน้าได้ ห้ามคัดลอกข้อความ ตาราง หรือ checklist เอกสาร EASA ใช้ตามข้อกำหนดเดียวของรอบที่ 2 ใน [01-methods §01.12.1](01-methods.md) [LM29] เอกสารของรัฐบาลสหรัฐฯ เป็นสาธารณสมบัติ เรียงแหล่งปฐมภูมิก่อนในแต่ละแบบ

| รหัส | ชื่อเรื่อง ผู้จัดทำ ปี (ส่วนที่อ้าง) | URL | ประเภท | สัญญาอนุญาต/สถานะ และสิ่งที่ AirfieldLab ทำได้ |
|---|---|---|---|---|
| LN0 | สคริปต์ของหัวข้อนี้ `scripts/ln_json.mjs`, `scripts/ln_tests.mjs` และผล `scripts/out/ln_cards.json`, `ln_tests.txt`, `ln_tests.json` (AirfieldLab research รอบที่ 2, 2026-11-19) | (ในโฟลเดอร์นี้) | งานของโครงการ | repo ยังไม่มี LICENSE (เจ้าของเลือก) ใช้ แก้ และเผยแพร่ในโครงการได้ |
| LN1 | FAA, *Type Certificate Data Sheet No. 2A13* (Piper PA-28 series) Revision 48, 7 Aug 2006: item XVI-A (PA-28-161) เครื่องยนต์ ใบพัดและรอบสถิต ความเร็ว CG มุมพื้นบังคับ | https://touringmachine.com/Cherokee/PDFs/Cherokee%20Type%20Certificate%20Data%20Sheet%202A13.pdf | เอกสารรับรองแบบ (ปฐมภูมิ สำเนาของบุคคลที่สาม ไม่ใช่ฉบับปัจจุบัน) | งานของรัฐบาลสหรัฐฯ เป็นสาธารณสมบัติ อ้างและทำซ้ำได้ (ควรเทียบกับฉบับปัจจุบันใน FAA DRS) |
| LN2 | Piper Aircraft, *PA-28-161 Warrior II Pilot's Operating Handbook* VB-1180: p1-2 ถึง 1-4 (มิติ น้ำหนัก), p2-1 ถึง 2-8 (ขีดจำกัด CG ลมขวาง), p3-3, 3-11 (best glide), p4-2 (ความเร็วใช้งาน) | https://chestercountyaviation.com/wp-content/uploads/2022/04/PA-28-161-POH-Rev-10-1.pdf | คู่มือผู้ผลิต (ปฐมภูมิ สำเนาของผู้ประกอบการ; ไม่มี Section 5) | © Piper อ้างตัวเลขพร้อมหน้าได้เท่านั้น |
| LN3 | AOPA, Aircraft Guide "Piper Warrior III" (หน้าเว็บ ปี 2020) | https://www.aopa.org/go-fly/aircraft-and-ownership/aircraft-guide/aircraft/piper-warrior-iii | ทุติยภูมิ (สมาคมนักบิน อิง POH) | © AOPA อ้างข้อเท็จจริงได้ |
| LN4 | Middle Georgia State University, *Warrior Checklist* (2025) | https://www.mga.edu/Aviation/knight-flight/aircraft-information-procedures/docs/Warrior_Checklist.pdf | เอกสารของโรงเรียนการบิน (อิง POH) | © MGA อ้างตัวเลขได้ ห้ามคัดลอก checklist |
| LN5 | Brainscape, flashcards "Single Engine Performance and Airspeeds" (BE76 Duchess) | https://www.brainscape.com/flashcards/single-engine-performance-and-airspeeds-10539944/packs/18850933 | ตติยภูมิ (ผู้ใช้สรุปจาก POH) | ลิขสิทธิ์ของผู้สร้าง อ้างตัวเลขได้ ความเชื่อมั่นต่ำ |
| LN6 | Brainscape, flashcards "POH Ch 2 - Limitations" (BE76) | https://www.brainscape.com/flashcards/poh-ch-2-limitations-5163471/packs/7517606 | ตติยภูมิ | เหมือน LN5 |
| LN7 | *King Air* magazine, June 2017, p. 27 (บทความ Beech Duchess: สมรรถนะ OEI ROC เพดาน VNE) | https://kingairmagazine.com/issue/June17/files/basic-html/page27.html | ทุติยภูมิ (นิตยสาร) | © ผู้พิมพ์ อ้างข้อเท็จจริงได้ |
| LN8 | Wikipedia, "Beechcraft Duchess" (ข้อมูลจำเพาะจาก Jane's All the World's Aircraft 1980–81), เปิดอ่าน 2026-11-19 | https://en.wikipedia.org/wiki/Beechcraft_Duchess | ทุติยภูมิ | CC BY-SA 4.0 อ้างตัวเลขพร้อมแหล่งได้ |
| LN9 | *Plane & Pilot*, "Beech 76 Duchess", 1 May 2009 | https://planeandpilotmag.com/beech-76-duchess/ | ทุติยภูมิ (นิตยสาร) | © ผู้พิมพ์ อ้างข้อเท็จจริงได้ |
| LN10 | EASA, *Type-Certificate Data Sheet No. EASA.A.006* Tecnam P2002 series, Issue 13 (24 Nov 2022), Section A (P2002-JF): A.III.4–A.III.15 | https://www.easa.europa.eu/es/downloads/7514/en | เอกสารรับรองแบบ (ปฐมภูมิ) | © EASA ตาม 01-methods §01.12.1 [LM29] · อ้างข้อเท็จจริงพร้อมที่มาได้ตาม 01-methods §01.12.1 |
| LN11 | Costruzioni Aeronautiche Tecnam, *P2002-JF* specification sheet (ไฟล์ปี 2015) | https://tecnam.com/wp-content/uploads/2015/05/P2002-JF.pdf | ข้อมูลผู้ผลิต (การตลาด ไม่บอกเงื่อนไข) | © Tecnam อ้างข้อเท็จจริงได้ |
| LN12 | Tecnam, *P2002JF MkII* specification (rev 02-2-20) ผ่านตัวแทนจำหน่าย | https://www.f-air.cz/content/files/soubory/TECNAM/P2002JF-MKII-201105-W.pdf | ข้อมูลผู้ผลิต (รุ่นใหม่) | © Tecnam อ้างข้อเท็จจริงได้ |
| LN13 | Tecnam, *P2002 Sierra MkII Pilot's Operating Handbook / Flight Manual* Rev 4.00 (11 Oct 2008): p17, 27, 32, 47, 53, 55 | https://www.deltaaviation.com/wp-content/uploads/2019/06/POH_P2002_SierraMKII.pdf | คู่มือผู้ผลิตของรุ่นใกล้เคียง (US-LSA) | © Tecnam อ้างตัวเลขพร้อมหน้าได้เท่านั้น ใช้แทน JF เป็นค่าประมาณ |
| LN14 | EASA, *Type-Certificate Data Sheet No. EASA.A.385* Partenavia/Vulcanair P.68 series, Issue 10 (1 Aug 2023), Section D (P.68C): D.III.4–D.III.16 | https://www.easa.europa.eu/en/downloads/7150/en | เอกสารรับรองแบบ (ปฐมภูมิ) | © EASA ตาม 01-methods §01.12.1 [LM29] · อ้างข้อเท็จจริงพร้อมที่มาได้ตาม 01-methods §01.12.1 |
| LN15 | Civil Aviation Authority of New Zealand, *Type Acceptance Report* TAR 4/21B/21 Vulcanair P68 series, Rev 2 (24 Feb 2025) | https://www.aviation.govt.nz/assets/aircraft/type-acceptance-reports/Vulcanair_P68-Rev1.pdf | เอกสารรับรองของรัฐ (ปฐมภูมิ) | Crown copyright (นิวซีแลนด์) อ้างข้อเท็จจริงพร้อมที่มาได้ ยังไม่ได้ตรวจเงื่อนไขการทำซ้ำของเว็บ CAA NZ |
| LN16 | AOPA, Aircraft Guide "Vulcanair P68C" | https://aopa.org/go-fly/aircraft-and-ownership/aircraft-guide/aircraft/vulcanair-p68c | ทุติยภูมิ (ข้อมูลรุ่นใหม่ 2,100 kg) | © AOPA อ้างข้อเท็จจริงได้ |
| LN17 | Wikipedia, "Partenavia P.68", เปิดอ่าน 2026-11-19 | https://en.wikipedia.org/wiki/Partenavia_P.68 | ทุติยภูมิ | CC BY-SA 4.0 อ้างตัวเลขพร้อมแหล่งได้ |
| LN18 | Cessna Aircraft, *Model T206H NAV III Pilot's Operating Handbook and FAA Approved Airplane Flight Manual* (ฉบับเพื่อการศึกษา): p ii–iii, p1-5 ถึง 1-8, Fig 1-1, p2-4 ถึง 2-15, p3-7 | https://kerrville.cap.gov/media/cms/CessnaT206HPilotsOperatingHandbook_1A7CC4F2010DE.pdf | คู่มือผู้ผลิต (ปฐมภูมิ สำเนาของผู้ใช้) | © Textron Aviation อ้างตัวเลขพร้อมหน้าได้เท่านั้น |
| LN19 | P. Bedell, "Cessna T206H Stationair", *AOPA Pilot*, 5 Jun 2000 | https://aopa.org/news-and-media/all-news/2000/june/pilot/cessna-t206h-stationair | ทุติยภูมิ (บทความทดสอบบิน) | © AOPA อ้างข้อเท็จจริงได้ |
| LN20 | Civil Air Patrol, "Cessna 206H Introduction" (เอกสารฝึก ธ.ค. 2024): §20.3, §20.7, §20.9, §21.1 | https://txwg.cap.gov/media/cms/TXWG_CAP_Cessna_T206H_Introduction__A02434B63C386.pdf | เอกสารฝึกของผู้ใช้ (อิง POH) | ลิขสิทธิ์ของผู้จัดทำ อ้างตัวเลขได้ ห้ามคัดลอกข้อความ |
| LN21 | Civil Aviation Authority of New Zealand, *Type Certificate Data Sheet A-10* PAC CT/4, Rev 21 (10 Jun 2024): item II (CT/4A), item IV (CT/4E) | https://aviation.govt.nz/assets/aircraft/type-certificates/TCDS-A10.pdf | เอกสารรับรองแบบพลเรือน (ปฐมภูมิ) | Crown copyright (นิวซีแลนด์) อ้างข้อเท็จจริงพร้อมที่มาได้ |
| LN22 | NZAero (NZSkydive Ltd), "CT-4 Specifications" (หน้าเว็บผู้ผลิต; เปิดซ้ำ 2026-11-19) | https://www.aerospace.co.nz/aircraft/ct-4/specifications | ข้อมูลผู้ผลิต (ไม่บอกหน่วย IAS/CAS และมวล) | © NZAero อ้างข้อเท็จจริงได้ |
| LN23 | EASA, *Type-Certificate Data Sheet No. EASA.IM.A.053* Cessna 206 series (Stationair), Issue 10 (17 Jan 2025), Section 2 (T206H): p15 (เครื่องยนต์), p16 (ใบพัด เชื้อเพลิง ความเร็ว), p17 (มวล CG datum), p17–18 (พื้นบังคับ) | https://www.easa.europa.eu/de/downloads/7419/en | เอกสารรับรองแบบ (ปฐมภูมิ) | © EASA ตาม 01-methods §01.12.1 [LM29] · อ้างข้อเท็จจริงพร้อมที่มาได้ตาม 01-methods §01.12.1 |

รหัสของหัวข้ออื่นที่บัตรนี้ใช้: [LS1] ทะเบียนอากาศยาน กพท. 9 ก.ค. 2026 และ [LS13] ข่าวการซื้อ P2002-JF (หัวข้อ 02) · [LG1] EASA TCDS A.185 P2006T และ [LG11] datasheet ของ Rotax 912 (หัวข้อ 12) · [LM0] [LM3] [LM4] [LM11] [LM12] [LM25] [LM29] (หัวข้อ 01)

## 13.10 งานที่แนะนำสำหรับ Claude Code
| ลำดับ · ขนาด | งาน | กรณีทดสอบ |
|---|---|---|
| **P1 · S** | (หัวข้อ 08/09) ใช้ VREF/VAPP และชื่อ detent ตาม §13.3 แล้วรัน `lm_merge --type <id>` จน `xfile_vapp` และ `detent` เป็น 0 | T-LN-08 (WARN ของ 08/09 จาก 22 เป็น 0; เสร็จแล้ว เมื่อรันซ้ำ 19 พ.ย. 2026 ได้ 0) |
| **P2 · S** | (ทำแล้ว 25 พ.ย. 2026: `pickCfg(…, {strict: true})` คืน null แทน key แรก แฟลปขึ้นใช้ R1 ที่ติดธง; T-LM-38) (เครื่องมือ `lm_card`) เมื่อ `CLmax_target` มีเฉพาะ detent แฟลปลง อย่าใช้ค่านั้นเป็นค่า clean (`pickCfg` เลือก key แรกที่เป็นตัวเลข) ให้ใช้ R1 หรือค่าที่บัตรให้ | T-LN-13 (แฟลป 0 ต้องไม่ stall ที่ 56.9 kt; ได้ 70.1 KEAS) |
| **P2 · S** | หา AFM/POH ที่อ่านได้ของ CT/4E และ P2002-JF เพื่อยืนยันความเร็ว stall (หน่วย มวล) แล้วแก้ VS0/VS1, CLmax_target และ VREF/VAPP | T-LN-06 (รายการต้องว่าง), T-LN-12, T-LN-15 |
| **P2 · S** | เปิด FAA TCDS A29CE (BE76) และ 2A13 ฉบับปัจจุบันจาก FAA DRS (หรือ TCDS ของ EASA/UK CAA ถ้ามี) เพื่อแทนแหล่งตติยภูมิของ BE76 และยืนยัน MTOW ของ PA-28-161 | T-LN-01, T-LN-11, T-LN-17 |
| **P3 · M** | polar แรงต้านต่อแบบจากอัตราไต่หรือการร่อน (`lm_legacy_fit` ต้องการ `performance.glide`, `speeds.VY_kt`, `performance.ROC_SL_fpm`) เพื่อให้ ROC และ Vy ของซิมเข้าเกณฑ์ เริ่มจาก pa28_161 (JSBSim มีโมเดล pa28 หัวข้อ 03) | T-LN-16 ถึง 21 |
| **P3 · S** | P.68C: หา VS1, VY, VYSE จากแหล่งสาธารณะของ P.68C ปี 1980 และตรวจระยะลงจอดจาก 50 ft | T-LN-03, T-LN-19 |
| **P3 · L** | leaf ใน `_na` กลุ่มที่ 2 (อนุพันธ์ inertia ล้อ ใบพัด) ทำเมื่อเจ้าของเลือกแบบใดแบบหนึ่งเป็นบัตรเต็ม | – |

## 13.11 บันทึกการแก้ตามการตรวจความครบถ้วน (19 พ.ย. 2026)
- **ช่องว่าง 5 / D5**: สร้างหัวข้อนี้ใหม่ทั้งหมด (prefix LN) บัตรย่อหกแบบ สคริปต์ `ln_json.mjs` (สร้าง JSON และ `_na` อัตโนมัติจาก `r1-pertype-paths.json`) และ `ln_tests.mjs` (21 กรณี) ทุกบัตรมี `speeds.VREF_kt` และ `speeds.VAPP_kt` ที่มวลฝึก (D1) ชื่อ detent ตาม AFM/POH (D6) `training_mass` แบบ D3 และมุมพื้นบังคับแบบ D2 เมื่อ TCDS ให้
- **ช่องว่าง 13**: ใส่ SI คู่กับหน่วยการบินในทุกตาราง (kt → m/s, ft → m, fpm → m/s, lb → kg, hp → kW)
- **ระหว่างทำ**: เปิด TCDS A.385 ซ้ำพบว่ามุม stabilator ของ P.68C วัดที่ขอบหน้า จึงแปลงเป็นขอบท้ายขึ้น 16° ลง 6° (ร่างแรกใช้ขึ้น 6° ลง 16° ซึ่งทำให้ซิมเข้า stall ไม่ได้); ลดความเชื่อมั่นของ VS0 ของ CT/4E และ VS1 ของ P2002-JF เป็นต่ำ หลัง T-LN-06 พบ CLmax เกินจริง; ตำแหน่งแฟลป 10° ของ BE76 ใช้ VFE 120 KIAS ตามข้อความ "ไม่เกิน 20°" ของแหล่ง (ไม่ใช่ค่าประมาณ)
- **แหล่งใหม่ระหว่างทำ**: พบ EASA TCDS IM.A.053 ของ Cessna 206 series [LN23] จึงใช้เป็นแหล่งปฐมภูมิของขีดจำกัด T206H แทน FAA A4CE ที่เปิดไม่ได้ และเพิ่มมุมพื้นบังคับของ T206H (D2)
- **ตรวจด้วยเครื่องมือ**: `node scripts/lm_merge.mjs --type <id> --coverage --dry` ของทั้งหกแบบ: ERRORS 0, CONFLICTS 0, path ต่อแบบรอบที่ 1 ขาด 0; WARN ของบัตรเอง (scope, est, est_conf, training_mass, speeds, vapp_vref) 0; WARN `xfile_vapp` และ `detent` ที่เหลือเป็นของ 08/09 (§13.3)
