# รอบที่ 5D: อัปเดต AIP 18 พ.ย. 2026 (เติมช่องว่างของหัวข้อ 1–4 และ 7)

ส่วนหนึ่งของรายงานรอบที่ 5 ฉบับหลักอยู่ที่ [`../05-airport-city.md`](../05-airport-city.md) ไฟล์นี้เติมสิ่งที่รอบแรก (17 พ.ย. 2026) อ่านไม่ได้ เพราะเครื่องมือตัดหน้า eAIP ที่ราว 100,000 ตัวอักษร และไฟล์ PDF ตอบ client_error วันนี้ดาวน์โหลดหน้า eAIP ของ VTBD ได้ครบทั้งหน้า (ราว 155,000 ตัวอักษรหลังแปลงเป็นข้อความ) และดาวน์โหลดแผนภูมิทั้ง 126 ไฟล์ใน AD 2.24 ได้ จึงไม่ต้องให้เจ้าของดาวน์โหลด PDF ส่วนนี้แล้ว

- **วันที่ค้นคว้า:** 18 พ.ย. 2026
- **AIP ที่ใช้:** AIRAC 29 OCT 2026 (มีผลอยู่) เทียบกับ 01 OCT, 26 NOV และ 24 DEC 2026
- **รหัสแหล่งอ้างอิง:** [U1]–[U9] อยู่ท้ายไฟล์นี้ รหัสกรณีทดสอบคือ T-U01 ถึง T-U08
- **ไฟล์ประกอบ:** [`aip_vtbd_iap_minima.json`](aip_vtbd_iap_minima.json) และ [`iap_minima.test.mjs`](iap_minima.test.mjs) (ผ่านทุกข้อ)
- **สถานะ:** งานค้นคว้าอย่างเดียว ไม่ได้แก้โค้ดหรือข้อมูลใน `src/` และ `data/`

## U สรุปการอัปเดต

### สรุป

- **AIRAC 26 NOV 2026 และ 24 DEC 2026 ไม่เปลี่ยนค่าใดของ VTBD** ข้อความ AD 2 VTBD ของสองรอบนี้เหมือนกันทุกตัวอักษร และต่างจากรอบ 29 OCT เพียงการลบเครื่องหมายแก้ไข (หน้า 29 OCT แสดงค่าใหม่คู่กับค่าที่ถูกลบ เช่น "135452N 135451.74N") รายการแผนภูมิ 126 ลิงก์ใน AD 2.24 เหมือนกันทั้งสามรอบ [U1][U2][U3] (ความเชื่อมั่น: สูง) หมายเหตุ: รอบถัดไปหลัง 29 OCT คือ 26 NOV 2026 ไม่ใช่ 24 DEC ตามที่หัวข้อ 11 เขียนไว้เดิม จึงแก้ในไฟล์หลักแล้ว
- **ยืนยันได้ว่าการเปลี่ยนในรอบ 29 OCT เป็นการปัดความละเอียด ไม่ใช่การสำรวจใหม่:** ARP 135451.74N 1003620.49E เป็น 135452N 1003620E, ความสูงสนามบิน 2.65 m เป็น 3 m, THR 03R 1.49 m เป็น 1 m, THR 21L 1.92 m เป็น 1.9 m, พิกัดสิ่งกีดขวางจาก 0.01″ เป็น 0.1″ และอาคาร 87.10 m เป็น 87 m [U1][U4] ข้อเสนอในหัวข้อ 1 ที่ให้คงค่าเดิมของ repo จึงถูกต้อง
- **AD 2.20 ฉบับปัจจุบันมี 16 ข้อ และ hot spot มี HS1–HS6** ไม่ใช่ HS1–HS3 ตามที่บันทึกไว้จากบทสรุปของเครื่องมือในหัวข้อ 1, 2 และ 7 แผนภูมิ AGMC (314338) แสดง HS1–HS6 ตรงกัน [U1][U7] (ความเชื่อมั่น: สูง)
- **อ่าน OCA/H ได้ครบทั้ง 13 แผนภูมิ approach** รวมสามแผนภูมิที่รอบแรกอ่านไม่ได้: ILS 03L CAT I 220 (213) ft, RNP 03R LNAV/VNAV 490 (485) ft และ RNP 21L LNAV/VNAV 350 (343) ft และแยก category ของ CAT II 21R ได้แล้ว: A–B 120 (113) ft, C–D 150 (143) ft [U6] (ความเชื่อมั่น: สูง)
- **แก้ค่าที่ผิดในหัวข้อ 4:** RNP 03L คือ LNAV/VNAV 490 (483) และ LNAV 590 (583) ค่า 690 (683) ที่รอบแรกเข้าใจว่าเป็น LNAV/VNAV คือความสูงในตารางระยะที่ 2 NM ส่วน RNP 21R มี LNAV/VNAV 370 (363) ด้วย ไม่ใช่มีแต่ LNAV
- **แผนภูมิ AIP ให้เฉพาะ OCA/H ไม่ให้ RVR หรือทัศนวิสัย** ค่าต่ำสุดเชิงปฏิบัติ (DA/MDA และ RVR) เป็นของผู้ดำเนินการ จึงเสนอให้ simulator ใช้ OCA ของ category C เป็นค่า DA สำหรับ callout "minimums"
- **ข้อมูล eTOD ของ กพท. ต้องเข้าสู่ระบบ** หน้า https://ais.caat.or.th/etod/ ไม่มีไฟล์ให้ดาวน์โหลดแบบสาธารณะ [U8] ความสูงหอบังคับการบินจึงยังเป็นค่าประมาณตามหัวข้อ 2 และ 5
- **ประกาศขีดความสามารถ (NAC) ของดอนเมืองฉบับ S26/W26 ยังไม่พบบนเว็บ กพท.** ค้นพบเพียงฉบับ BKK และ CNX ของ W26 ส่วนดอนเมืองมีล่าสุดคือ W24 [U9] ค่าในหัวข้อ 7 จึงคงเดิม

### ข้อมูล

**ตาราง U1 เทียบรอบ AIRAC (ข้อความ AD 2 VTBD ที่แปลงจาก eAIP)** [U1]–[U4]

| รายการ | 01 OCT 2026 | 29 OCT 2026 | 26 NOV 2026 | 24 DEC 2026 |
|---|---|---|---|---|
| ARP | 135451.74N 1003620.49E | 135452N 1003620E (ค่าเดิมขีดฆ่า) | 135452N 1003620E | เหมือน 26 NOV |
| ความสูงสนามบิน | 2.65 m (9 ft) | 3 m (9 ft) | 3 m (9 ft) | เหมือน 26 NOV |
| THR 03L / 21R / 03R / 21L | 2 / 2 / 1.49 / 1.92 m | 2.0 / 2.0 / 1 / 1.9 m | 2.0 / 2.0 / 1 / 1.9 m | เหมือน 26 NOV |
| True bearing | 029° 209° 028° 208° | 029.00° 209.00° 028.00° 208.00° | เหมือน 29 OCT | เหมือน 26 NOV |
| สิ่งกีดขวาง AD 2.10 | 0.01″, 87.10 m | 0.1″, 87 m | เหมือน 29 OCT | เหมือน 26 NOV |
| หมายเหตุ AD 2.8 (Taxilane T, TWY Y) | อยู่ในข้อความ | ย้ายไปที่ AGMC ("See AGMC for REMARKS") | อยู่ใน AGMC | เหมือน 26 NOV |
| ลิงก์แผนภูมิ AD 2.24 | — | 126 | 126 (เหมือนเดิม) | 126 (เหมือนเดิม) |

**ตาราง U2 AD 2.19 ฉบับปัจจุบัน** [U1] (พิกัดตามที่ประกาศ ค่าที่ repo ใช้ไม่เปลี่ยน)

| เครื่องช่วย | ident | ความถี่ | พิกัด | หมายเหตุ |
|---|---|---|---|---|
| DVOR/DME | BKK | 117.7 MHz, CH 124X | 135336.7N 1003546.3E | ใต้ 2500–4000 ft สัญญาณไม่พอที่ 40 NM ตาม radial |
| ILS CAT II LOC 21R | IBKK | 109.3 MHz | 135340.6N 1003540.6E | RDH 16.46 m (54 ft), LOC 300 m จาก THR 03L, course width 3° |
| GP 21R + DME | — | 332.0 MHz, CH 30X | 135523.4N 1003642.8E | GP 333 m จาก THR 21R, 120 m จากแนวกลาง |
| ILS CAT I LOC 21L | IDMG | 110.3 MHz | 135351.8N 1003601.8E | RDH 53 ft, LOC 225 m จาก THR 03R, course width 3.6° |
| GP 21L + DME | — | 335.0 MHz, CH 40X | 135521.2N 1003647.4E | GP 320 m จาก THR 21L, 120 m จากแนวกลาง |
| ILS CAT I LOC 03L | IBKD | 109.7 MHz, CH 34X | 135543.8N 1003649.7E | RDH 55 ft, coverage 9 DME ที่ 6000 ft, GP ใช้ไม่ได้เกิน 6° ทางขวาของ LOC |
| DME 03L | — | — | 135544.8N 1003647.5E | co-located กับ LOC |
| GP 03L | — | 333.2 MHz | 135356.4N 1003554.0E | — |

**ตาราง U3 AD 2.20 ฉบับปัจจุบัน 16 ข้อ (สรุปสาระที่ใช้ในเกม)** [U1]

| ข้อ | หัวเรื่อง | สาระที่ใช้ได้ใน simulator |
|---|---|---|
| 4 | Use of runways 03R/21L | ปกติจำกัดให้ฝ่ายทหาร เปิดให้พลเรือนได้; circuit อยู่ทางตะวันออกของทางวิ่ง เข้า downwind ที่ 45° สูง 1500 ft (jet), 1000 ft (conventional), 800 ft (light), 500 ft (helicopter); straight-in ต้องได้อนุญาตก่อน |
| 5 | Starting up | Delivery 127.7 MHz, Ground 121.9/122.5 MHz |
| 6.3 | Warning for taxiing | ลง 21L แล้วออกขวาที่ TWY S ต้องหยุดก่อน 21R และอยู่ความถี่ Tower 118.1 MHz |
| 7.4 | GP disturbance | ใน VMC อาจให้เครื่องข้าม 21R ไปขึ้นที่ 21L |
| 8 | LVP | เริ่มเมื่อ RVR < 550 m หรือฐานเมฆ < 200 ft; 21R CAT II และ LVTO; 21L ห้ามขึ้นลงใน LVP; holding CAT II ที่ TWY D และ B (N); ห้าม intersection take-off; เส้นทางออก O–B (หรือ O–N–B), R–B, S–B, C(S)–B |
| 9 | Enhance runway capacity | line up ทันทีที่เครื่องก่อนหน้าเริ่มวิ่ง และออกจากทางวิ่งให้เร็ว |
| 10 | Manoeuvring | push-back ด้วย towbar เท่านั้น ห้าม power-back; ตารางวิธี push-back แยกตามหลุม |
| 14 | Aerodrome ATS | TWR-S ให้บริการควบคุมสนามบิน, TWR-N เป็นหอสำรอง (ยืนยันข้อสรุปของหัวข้อ 2) |
| 15 | Hot spots | HS1 (C/Taxilane B เลี้ยวขวาเข้า D หยุดก่อน 21R), HS2 (C เลี้ยวขวาเข้า E), HS3 (O ตัด C), HS4 (R ตัด C), HS5 (ออกจาก 21L ที่ S หยุดก่อน 21R), HS6 (Taxilane T เลี้ยวขวาเข้า S หยุดก่อน 03R) |
| 16 | A-CDM | TOBT/TSAT, TSAT ออก 40 นาทีก่อน TOBT |

AD 2.21: noise abatement ตาม PANS-OPS (เริ่มที่ 800 ft ขึ้นไป) และห้ามใช้ reverse thrust เกิน idle ช่วง 1800–2200 UTC ยกเว้นเหตุความปลอดภัย; AD 2.22: ความเร็วไม่เกิน IAS 250 kt ที่ 10,000 ft และต่ำกว่า, ใช้ RNAV SID/STAR ตาม AD 2.24; AD 2.23: นกที่เป็นอันตราย (เช่น นกปากห่าง 1.9–2.3 kg, ชุกที่สุดช่วงฝน มิ.ย.–ต.ค.) และเงื่อนไขให้ A380/B747-8 ใช้เป็นสนามบินสำรอง; AD 2.25 ไม่มีในหน้านี้ [U1]

**ตาราง U4 แผนภูมิหลักใน AD 2.24 และเลขไฟล์** [U1][U6] (URL: `https://aip.caat.or.th/2026-10-29-AIRAC/graphics/<เลข>.pdf`)

| แผนภูมิ | หน้า | เลขไฟล์ |
|---|---|---|
| Aerodrome Chart | AD 2-VTBD-2-1 | 292780 |
| Aircraft Parking/Docking Chart และ Verso (ตารางพิกัดหลุม) | 2-3, 2-4 | 293067, 120838 |
| Aerodrome Ground Movement Chart (AGMC) | 2-5 | 314338 |
| Precision Approach Terrain Chart RWY 21R | 3-1 | 3619 |
| Aerodrome Obstacle Chart Type A 21R/03L, 21L/03R | 3-3, 3-5 | 292783, 292784 |
| SID RNAV (8 ชุด พร้อมตาราง) | 6-1 เป็นต้นไป | 299080–299087 และไฟล์ตาราง |
| STAR RNAV 21L/21R และ 03L/03R | 7-1, 7-9 | 299089, 299088 |
| IAC 13 แผ่น | 8-1 ถึง 8-31 | ตาราง U5 |
| VFR entry/exit และ overfly (เครื่องบินเล็กและ helicopter) | 9-1 ถึง 9-28 | 307011–307016 และไฟล์ตาราง |
| Bird concentration and movement | 9-29 | 238445 |

**ตาราง U5 OCA (OCH) ของทุกแผนภูมิ approach** [U6] หน่วย ft; ค่าในวงเล็บคือ OCH; category A–D ใช้ค่าเดียวกันถ้าไม่ระบุ; circling ทุกแผ่นคือ 800 (791) สำหรับ A–C และ 1100 (1091) สำหรับ D ยกเว้นที่ระบุ

| แผนภูมิ (เลขไฟล์) | ทางวิ่ง | ค่าหลัก | LOC / LNAV | FAF (ระยะจาก THR, ความสูง) | อื่น ๆ |
|---|---|---|---|---|---|
| VOR RWY 21L (299090) | 21L | 520 (511) | — | 4.7 NM (8.7 km), 1600 ft (488 m) | gradient 5.5 % (3.2°) ไม่ตรงกับ PAPI |
| VOR RWY 21R (299091) | 21R | 520 (511) | — | 4.8 NM (8.9 km), 1600 ft | gradient 5.2 % (3.0°) |
| VOR RWY 03R (299092) | 03R | 790 (781) | — | 5.5 NM (10.2 km), 1900 ft (579 m) | MAPt ที่ BKK, gradient 5.5 % |
| ILS or LOC y RWY 03L (299093) | 03L | CAT I 220 (213) | LOC 790 (783) | 7.3D IBKD, 1700 ft (518 m) | IAF MOCKA 6000 ft; MSA 25 NM 1800/2300 ft |
| ILS or LOC y RWY 21L (299094) | 21L | CAT I 220 (213) | LOC 470 (463) | LUGSO 4.9 NM (9.1 km), 1600 ft | IF BD111 2600 ft |
| ILS or LOC y RWY 21R CAT II (299095) | 21R | CAT I 220 (213); CAT II A–B 120 (113), C–D 150 (143) | LOC 470 (463) | 4.8 NM, 1600 ft | circling A–B 800 (791), C–D 1100 (1091) |
| ILS or LOC z RWY 21L (299096) | 21L | CAT I 220 (213) | LOC 470 (463) | LUGSO 4.9 NM, 1600 ft | missed ไป BD199, BD177, HOLYA |
| ILS or LOC z RWY 21R CAT II (299097) | 21R | CAT I 220 (213); CAT II A–B 120 (113), C–D 150 (143) | LOC 470 (463) | RENIL 4.9 NM, 1600 ft | missed ไป BD188, BD177, HOLYA |
| ILS or LOC z RWY 03L (299098) | 03L | CAT I 220 (213) | LOC 410 (403) | BD310 3.3 NM (6.1 km), 1100 ft (335 m) | IF LURPO 6.3 NM 1900 ft |
| RNP RWY 21L (299596) | 21L | LNAV/VNAV 350 (343) | LNAV 470 (463) | LUGSO 4.9 NM, 1600 ft | TCH 50 ft |
| RNP RWY 21R (299597) | 21R | LNAV/VNAV 370 (363) | LNAV 530 (523) | RENIL 4.9 NM, 1600 ft | TCH 50 ft |
| RNP RWY 03L (299598) | 03L | LNAV/VNAV 490 (483) | LNAV 590 (583) | BD310 3.3 NM, 1100 ft | TCH 50 ft |
| RNP RWY 03R (299599) | 03R | LNAV/VNAV 490 (485) | LNAV 500 (495) | BD320 3.3 NM, 1100 ft | IF REMAT 6.3 NM 1900 ft, THR 5 ft |

ค่า OCH ของ VOR straight-in และ circling อ้างความสูงสนามบิน 9 ft ส่วน ILS, LOC และ RNP อ้างความสูง THR (7 ft หรือ 5 ft) ตามที่พิมพ์ในแผนภูมิ ข้อความ missed approach ครบทุกแผ่นอยู่ในไฟล์ JSON

### สมการ

- OCH = OCA − h_ref โดย h_ref = ความสูง THR (ILS, LOC, RNP) หรือความสูงสนามบิน 9 ft (VOR, circling) ตามที่แผนภูมิใช้ (U.1)
- ความสูงบนแนวร่อน 3° ที่ระยะ d จาก THR: h = h_THR + RDH (หรือ TCH) + d · tan 3° โดย d เป็นฟุต (1 NM = 6076.1 ft) (U.2) ตัวอย่าง RENIL: 7 + 54 + 4.9 × 6076.1 × 0.05241 = 1621 ft เทียบกับ 1600 ft ที่ประกาศ
- DA ที่เสนอสำหรับ callout ของ simulator = OCA ของ category C ของ approach หลักของแต่ละทางวิ่ง (U.3) เป็นข้อเสนอเพื่อการฝึกเท่านั้น ไม่ใช่ค่าต่ำสุดเชิงปฏิบัติการ

### พารามิเตอร์ (JSON)

ไฟล์เต็มอยู่ที่ [`aip_vtbd_iap_minima.json`](aip_vtbd_iap_minima.json) ด้านล่างคือส่วนที่ใช้บ่อย

```json
{
  "src": "AIP Thailand AD 2 VTBD, AIRAC 29 OCT 2026 (unchanged 26 NOV and 24 DEC 2026)",
  "conf": "สูง",
  "not_for_navigation": true,
  "evaluator_da_default": {
    "21R": { "approach": "ILS_Z_21R", "da_ft": 220, "dh_ft": 213 },
    "21L": { "approach": "ILS_Z_21L", "da_ft": 220, "dh_ft": 213 },
    "03L": { "approach": "ILS_Z_03L", "da_ft": 220, "dh_ft": 213 },
    "03R": { "approach": "RNP_03R", "level": "LNAV/VNAV", "da_ft": 490, "dh_ft": 485 }
  },
  "cat_ii_21R": { "AB": [120, 113], "CD": [150, 143] },
  "lvp": { "rvr_lt_m": 550, "ceiling_lt_ft": 200, "rwy": "21R", "rwy_21L_allowed": false, "cat_ii_holding": ["D", "B (N)"] },
  "hot_spots": ["HS1", "HS2", "HS3", "HS4", "HS5", "HS6"],
  "rwy_03R_21L_circuit_join_ft": { "jet": 1500, "conventional": 1000, "light": 800, "helicopter": 500 },
  "airac_next_effective": ["2026-11-26", "2026-12-24", "2027-01-21"]
}
```

### กรณีทดสอบ

ต้นแบบอยู่ใน [`iap_minima.test.mjs`](iap_minima.test.mjs) รันด้วย `node docs/research/05-airport-city/iap_minima.test.mjs` ผลวันที่ 18 พ.ย. 2026: ผ่านทั้ง 8 ข้อ

| รหัส | สิ่งที่ทดสอบ | ผลที่คาดหวัง |
|---|---|---|
| T-U01 | จำนวน approach และเลขแผนภูมิ | 13 รายการ ไม่ซ้ำ |
| T-U02 | OCA − OCH ตามสมการ U.1 | ทุกคู่ต่างกัน 5, 7 หรือ 9 ft ตรงกับความสูงอ้างอิงของทางวิ่งนั้น |
| T-U03 | category A–D ครบในทุกบรรทัด | ครบและไม่ซ้ำ |
| T-U04 | ลำดับค่าต่ำสุด | CAT II < CAT I < LOC, LNAV/VNAV ≤ LNAV, straight-in ≤ circling |
| T-U05 | ความสูง FAF บนแนว 3° (สมการ U.2) | คลาดไม่เกิน 50 ft ทุกแผ่น (ไม่รวม VOR และ ILS y 03L ที่นิยาม FAF ด้วย DME) |
| T-U06 | CAT II และ LVP | CAT II มีเฉพาะ 21R และ 21L ห้ามใช้ใน LVP |
| T-U07 | AD 2.20 | 16 ข้อ hot spot HS1–HS6 |
| T-U08 | DA ของ simulator (สมการ U.3) | 220 ft สำหรับ 21R, 21L, 03L และ 490 ft สำหรับ 03R |

### เทียบกับ repo

| รายการ | repo ตอนนี้ | ผลอัปเดต | ไฟล์ที่ต้องแก้ (เมื่ออนุมัติ) |
|---|---|---|---|
| รอบ AIRAC | 14 MAY 2026 | ค่าที่ใช้ยังถูกต้องถึง 24 DEC 2026 | ข้อความอ้างอิงใน `src/15-geo.js` และ footer (P1-1 เดิม) |
| ค่าต่ำสุดใน Evaluator | ไม่มี DA ต่อทางวิ่ง | DA 220 ft (21R, 21L, 03L), 490 ft (03R RNP LNAV/VNAV) | `src/15-geo.js` (`RWY_END[id].minima`), `src/80-hud.js` (callout) |
| แนวร่อน 03R | RNP 3° TCH 50 ft (สมมติ) | ยืนยันอีกครั้งจากแผนภูมิ 299599 | คอมเมนต์ใน `src/15-geo.js` |
| LVP | ไม่มี | RVR < 550 m หรือฐานเมฆ < 200 ft ใช้ 21R เท่านั้น | `src/90-app.js` (ตัวเลือกทางวิ่ง) |

### ความขัดแย้งและช่องว่าง

1. **แก้ข้อมูลรอบแรก:** RNP 03L เดิมบันทึก LNAV 590 และ LNAV/VNAV 690 ที่ถูกคือ LNAV/VNAV 490 (483) และ LNAV 590 (583); RNP 21R เดิมบอกว่ามีแต่ LNAV ที่ถูกคือมี LNAV/VNAV 370 (363); hot spot เดิม HS1–HS3 ที่ถูกคือ HS1–HS6; circling ที่เคยอ่านได้ 700 ft ไม่พบในแผ่นใดของรอบปัจจุบัน (ทุกแผ่นคือ 800 และ 1100 ft) ไฟล์ `5a-aip.md` แก้ตามนี้แล้ว
2. **circling ของ ILS y 21R** แบ่ง A–B / C–D ต่างจากแผ่นอื่นที่แบ่ง A–C / D บันทึกตามที่พิมพ์ทั้งสองแบบ
3. **OCH ของ VOR** อ้างความสูงสนามบิน 9 ft ไม่ใช่ THR แม้ THR ต่ำกว่าสนามบินไม่ถึง 7 ft (ตาม PANS-OPS ควรอ้าง THR) เป็นความต่างเล็กน้อย (2–4 ft) บันทึกตามแผนภูมิ
4. **ยังไม่ได้:** ข้อมูล eTOD (ต้องเข้าสู่ระบบ) [U8], NAC ดอนเมือง S26/W26 (ไม่พบบนเว็บ) [U9] และข้อกำหนด กพท. ฉบับที่ 37 (ไม่ได้ค้นต่อในรอบนี้ เพราะ AIP ระบุว่าไทยใช้ Annex 14 โดยไม่มีข้อแตกต่างอยู่แล้ว ตามหัวข้อ 6)
5. **ตำแหน่งหลุมจอด 101 หลุม** ใช้ตารางเดิม (120838) ซึ่งยังเป็นไฟล์เดียวกันในรายการ AD 2.24 ของทั้งสามรอบ

### แหล่งอ้างอิง

- [U1] AIP Thailand eAIP, AD 2 VTBD, AIRAC 29 OCT 2026, https://aip.caat.or.th/2026-10-29-AIRAC/html/eAIP/VT-AD-2.VTBD-en-GB.html — © CAAT ใช้ได้เฉพาะข้อเท็จจริงและตัวเลขพร้อมอ้าง AIRAC
- [U2] AIP Thailand eAIP, AD 2 VTBD, AIRAC 26 NOV 2026, https://aip.caat.or.th/2026-11-26-AIRAC/html/eAIP/VT-AD-2.VTBD-en-GB.html — © CAAT
- [U3] AIP Thailand eAIP, AD 2 VTBD, AIRAC 24 DEC 2026, https://aip.caat.or.th/2026-12-24-AIRAC/html/eAIP/VT-AD-2.VTBD-en-GB.html — © CAAT
- [U4] AIP Thailand eAIP, AD 2 VTBD, AIRAC 01 OCT 2026, https://aip.caat.or.th/2026-10-01-AIRAC/html/eAIP/VT-AD-2.VTBD-en-GB.html — © CAAT
- [U5] หน้าแรก AIP Thailand (รายการรอบ AIRAC ที่มีผลและรอบถัดไป), https://aip.caat.or.th/ — © CAAT
- [U6] แผนภูมิ AD 2.24 รอบ 29 OCT 2026, https://aip.caat.or.th/2026-10-29-AIRAC/graphics/ ตามเลขไฟล์ในตาราง U4 และ U5 — © CAAT ห้ามนำภาพแผนภูมิเข้า repo
- [U7] Aerodrome Ground Movement Chart VTBD, https://aip.caat.or.th/2026-10-29-AIRAC/graphics/314338.pdf — © CAAT
- [U8] CAAT eTOD, https://ais.caat.or.th/etod/AIRAC%2010-2026/ — ต้องเข้าสู่ระบบ ไม่มีไฟล์สาธารณะ
- [U9] CAAT Notice of Airport Capacity: พบ BKK และ CNX ฉบับ W26 เช่น https://www.caat.or.th/wp-content/uploads/2026/06/BKK_NAC_W26_Rev.01.pdf และ DMK ฉบับล่าสุดที่พบคือ W24 https://www.caat.or.th/wp-content/uploads/2024/05/DMK-NAC-W24.pdf — © CAAT

### สิ่งที่ Claude Code ควรทำ (หัวข้อนี้)

1. ใช้ `aip_vtbd_iap_minima.json` เป็นแหล่งค่าต่ำสุดของ `data/vtbd_procs.json` (P2-6) และเพิ่ม `minima` ใน `RWY_END[id]` ตาม `evaluator_da_default`
2. ย้าย `iap_minima.test.mjs` เข้า `test/` พร้อมกับ `test/procs.test.mjs`
3. เพิ่มกฎ LVP และ hot spot HS1–HS6 ในข้อความ hotspot ภาษาไทยของ `src/90-app.js`
4. ตรวจ AIRAC อีกครั้งก่อน 21 JAN 2027 ด้วยสคริปต์ที่ดาวน์โหลดหน้า eAIP แล้วเทียบข้อความ (วิธีเดียวกับตาราง U1)

### บันทึกการตรวจทาน

- ค่าทุกคู่ในตาราง U5 ตรวจด้วยสมการ U.1 แล้ว (T-U02 ผ่าน) ค่า CAT II และ circling ของ 21R อ่านซ้ำที่ความละเอียด 200 dpi
- เทียบข้อความสี่รอบ AIRAC ด้วยการแปลง HTML เป็นข้อความแล้ว `diff` ผลอยู่ในตาราง U1
- ไม่มีชื่อหน่วย ตราสัญลักษณ์ หรือสถาบันทางทหารในไฟล์นี้ ข้อ 4 ของ AD 2.20 อ้างเพียงว่า "ฝ่ายทหาร" ใช้ทางวิ่ง 03R/21L
