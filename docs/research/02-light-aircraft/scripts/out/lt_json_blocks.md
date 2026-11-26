<!-- สร้างโดย scripts/lt_json.mjs จาก out/lt_geom.json, out/lt_polar.json, out/lt_fit_*.json (อย่าแก้ด้วยมือ ให้แก้สคริปต์แล้วรันใหม่) -->

#### da42ng

```json
{
 "da42ng": {
  "airframe": {
   "identity": {
    "v": {
     "manufacturer": "Diamond Aircraft Industries GmbH (Austria)",
     "model": "DA 42 NG",
     "variant": "DA 42 NG มาตรฐาน (MTOM 1,900 kg, ไม่มี MÄM 42-600)",
     "engine": "2 × Austro Engine E4-B (AE300) turbo-diesel, EECU/FADEC คันเดียวต่อเครื่อง",
     "propeller": "2 × mt-Propeller MTV-6-R-C-F/CF187-129, 3 ใบ constant speed feathering, หมุนตามเข็ม (CW) ทั้งสองข้าง",
     "seats": 4,
     "category": "normal",
     "tc_ref": "EASA TCDS EASA.A.005 Issue 44 (30 Aug 2024) Section C; AFM Doc 7.01.15-E"
    },
    "u": "-",
    "scope": "aircraft",
    "src": [
     "LT1",
     "LT2"
    ],
    "conf": "สูง",
    "est": false,
    "note": "ปีกต่ำ composite หาง T ล้อสามล้อพับเก็บได้ (ไฮดรอลิก) [LT1][LT5 p.7-14]; โรงเรียนไทย 5 ลำ (CATC, BAC, BATC 2, AAT) เลข 42.N/42.NW [LS1]"
   },
   "weights": {
    "MTOW": {
     "v": 1900,
     "u": "kg",
     "scope": "aircraft",
     "src": [
      "LT1",
      "LT2"
     ],
     "conf": "สูง",
     "est": false,
     "note": "4,189 lb มาตรฐาน; 1,999 kg (4,407 lb) เมื่อทำ MÄM 42-659 + MÄM 42-678 (DA42-VI ส่วนใหญ่) และ 2,001 kg กับ OÄM 42-260 [LT1 C Note 12]"
    },
    "MLW": {
     "v": 1805,
     "u": "kg",
     "scope": "aircraft",
     "src": [
      "LT1",
      "LT2"
     ],
     "conf": "สูง",
     "est": false,
     "note": "3,979 lb; 1,900 kg กับ MÄM 42-659, 1,999 kg กับ +42-678; ลงจอดที่ 1,805–1,900 kg เป็นขั้นตอนผิดปกติ [LT2 p.2-16]"
    },
    "MRW": {
     "v": 1908,
     "u": "kg",
     "scope": "aircraft",
     "src": [
      "LT2"
     ],
     "conf": "กลาง",
     "est": false,
     "note": "AFM ให้มวลบนลานจอดเกิน MTOM ได้ 8 kg (18 lb) [LT2 p.2-17]"
    },
    "MZFW": {
     "v": 1765,
     "u": "kg",
     "scope": "aircraft",
     "src": [
      "LT1",
      "LT2"
     ],
     "conf": "สูง",
     "est": false,
     "note": "3,891 lb; 1,835 kg กับ MÄM 42-659 [LT1]"
    },
    "min_flight_mass": {
     "v": 1510,
     "u": "kg",
     "scope": "aircraft",
     "src": [
      "LT2"
     ],
     "conf": "สูง",
     "est": false,
     "note": "3,329 lb [LT2 p.2-16]"
    },
    "BEW_typical": {
     "v": 1415,
     "u": "kg",
     "scope": "aircraft",
     "src": [
      "LT10"
     ],
     "conf": "กลาง",
     "est": false,
     "note": "สเปก AOPA 2010: empty 3,119 lb (ไม่มีอุปกรณ์เสริม); DA42-VI โบรชัวร์ 1,420 kg [LT6]; เครื่องจริงพร้อมอุปกรณ์หนักกว่า (เครื่องในสไลด์โรงเรียน 3,339 lb = 1,515 kg [LT9])"
    },
    "max_fuel_usable": {
     "v": 151,
     "u": "kg",
     "scope": "aircraft",
     "src": [
      "LT1",
      "LT6"
     ],
     "conf": "สูง",
     "est": false,
     "note": "ถังหลัก usable 189.2 l (50 US gal) × Jet A-1 0.80 kg/l [LM19]; ถัง auxiliary เพิ่ม 100 l (80 kg) รวม 289 l (231 kg) [LT1 9.1][LT6 p.19]"
    },
    "useful_load": {
     "v": 485,
     "u": "kg",
     "scope": "aircraft",
     "src": [
      "LT10"
     ],
     "conf": "กลาง",
     "est": false,
     "note": "MTOM 1,900 − empty 1,415 kg (AOPA 2010: useful 1,070 lb) [LT10]"
    },
    "training_mass": {
     "v": {
      "kg": 1752,
      "empty_kg": 1450,
      "crew_kg": 170,
      "fuel_kg": 132,
      "fuel_l": 165
     },
     "u": "kg",
     "scope": "aircraft",
     "src": [
      "LT2",
      "LT10"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: empty_kg 1,450 kg = BEW_typical 1,415 kg (สเปก AOPA ไม่มีอุปกรณ์เสริม [LT10]) + อุปกรณ์ของโรงเรียนราว 35 kg (เครื่องจริงพร้อมอุปกรณ์หนักกว่า เช่น 1,515 kg ในสไลด์ [LT9]); ครูฝึกและศิษย์ 2 × 85 kg; Jet A-1 165 l × 0.80 kg/l = 132 kg; รวม 1,752 kg อยู่ในช่วง 1,510–1,900 kg (แถบความเร็ว ≤1,900 kg)"
    }
   },
   "cg": {
    "datum": {
     "v": "ระนาบ datum อยู่หน้าจุดหน้าสุดของ root rib ของ stub wing 2.196 m (86.46 in); ปรับระดับด้วยพื้นห้องสัมภาระหน้า",
     "u": "-",
     "scope": "aircraft",
     "src": [
      "LT1",
      "LT2"
     ],
     "conf": "สูง",
     "est": false,
     "note": "[LT2 p.2-18][LT1 item 15/17]"
    },
    "LEMAC": {
     "v": 2.247,
     "u": "m DAT",
     "scope": "aircraft",
     "src": [
      "LT2"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ (lt_geom.mjs): ขอบหน้า root 2.196 m + LE sweep 1° × y_MAC 2.935 m ของปีกเรียวตรงเทียบเท่า (88.46 in)"
    },
    "MAC": {
     "v": 1.271,
     "u": "m",
     "scope": "aircraft",
     "src": [
      "LT2"
     ],
     "conf": "สูง",
     "est": false,
     "note": "4 ft 2 in [LT2 p.1-5]"
    },
    "envelope": {
     "v": [
      [
       1510,
       2.357,
       2.46
      ],
      [
       1700,
       2.387,
       2.48
      ],
      [
       1900,
       2.418,
       2.48
      ]
     ],
     "u": "kg, m DAT",
     "scope": "aircraft",
     "src": [
      "LT1",
      "LT2"
     ],
     "conf": "สูง",
     "est": false,
     "note": "แถว [มวล, หน้าสุด, หลังสุด] เชิงเส้นระหว่างจุด: หน้าสุด 2.357 m (92.80 in) ที่ 1,510 kg ถึง 2.418 m (95.20 in) ที่ 1,900 kg (2.434 m ที่ 1,999 kg กับ MÄM 42-678); หลังสุด 2.460 m ที่ 1,510 kg ถึง 2.480 m (97.64 in) ที่ ≥1,700 kg; คิดเป็น 8.6–13.4 % (หน้า) และ 16.7–18.3 % (หลัง) MAC เมื่อใช้ airframe.cg.LEMAC (leaf est) [LT2 p.2-18][LT1 C.III.14]"
    },
    "ref": {
     "v": {
      "m_DAT": 2.424,
      "pct_mac": 13.9
     },
     "u": "m DAT",
     "scope": "aircraft",
     "src": [
      "LT2"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: CG ของมวลฝึก 1,752 kg จาก component build-up (lt_geom.mjs) ใกล้กลางช่วง 2.395–2.480 m ใช้เป็นจุดกำเนิด FRD และ inertia"
    }
   },
   "inertia": {
    "Ixx": {
     "v": 6291,
     "u": "kg m2",
     "scope": "aircraft",
     "src": [
      "LM15",
      "LT1"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ component build-up (เครื่องยนต์ 2 × 245 kg ที่ y ±1.70 m, ปีก, ลำตัว, ล้อ, ลูกเรือ, เชื้อเพลิงในปีก) lt_geom.mjs"
    },
    "Iyy": {
     "v": 3297,
     "u": "kg m2",
     "scope": "aircraft",
     "src": [
      "LM15"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ component build-up"
    },
    "Izz": {
     "v": 9456,
     "u": "kg m2",
     "scope": "aircraft",
     "src": [
      "LM15"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ component build-up"
    },
    "Ixz": {
     "v": 432.4,
     "u": "kg m2",
     "scope": "aircraft",
     "src": [
      "LM15"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ (บวก: เครื่องยนต์อยู่หน้าและต่ำกว่า CG เล็กน้อย, หางอยู่หลังและสูง)"
    },
    "ref_mass": {
     "v": 1752,
     "u": "kg",
     "scope": "aircraft",
     "src": [
      "LM15"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: มวลฝึก (training_mass) ที่ CG อ้างอิง"
    },
    "radii": {
     "v": {
      "Rx": 0.282,
      "Ry": 0.321,
      "Rz": 0.423
     },
     "u": "-",
     "scope": "aircraft",
     "src": [
      "LM15"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ Roskam radii ที่ได้กลับจาก build-up (b 13.42, L 8.56 m); ไม่ใช้ค่าคลาส twin_prop (C310 ถังปลายปีก Rx 0.544 จะให้ Ixx 23340 kg m² สูงเกินจริง ~3.7 เท่า) §01.4"
    },
    "method": {
     "v": "component build-up (Roskam Part V ch.10) ที่มวลฝึก; ที่ MTOM 1,901 kg ได้ Ixx 6,729, Iyy 3,307, Izz 9,906 kg m²; เปล่า 1,450 kg 5,387 / 3,277 / 8,529",
     "u": "-",
     "scope": "aircraft",
     "src": [
      "LM15"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "มวลและตำแหน่งชิ้นส่วนเป็นค่าประมาณ ±25 %; น้ำมันในปีกเพิ่ม Ixx เร็วกว่ามวล"
    }
   },
   "wing": {
    "S": {
     "v": 16.29,
     "u": "m2",
     "scope": "aircraft",
     "src": [
      "LT1",
      "LT2"
     ],
     "conf": "สูง",
     "est": false,
     "note": "175.3 sq ft [LT2 p.1-5]"
    },
    "b": {
     "v": 13.42,
     "u": "m",
     "scope": "aircraft",
     "src": [
      "LT1",
      "LT2"
     ],
     "conf": "สูง",
     "est": false,
     "note": "44 ft; 13.55 m รวม anti-collision light [LT2 p.1-5]"
    },
    "MAC": {
     "v": 1.271,
     "u": "m",
     "scope": "aircraft",
     "src": [
      "LT2"
     ],
     "conf": "สูง",
     "est": false,
     "note": "[LT2 p.1-5]"
    },
    "AR": {
     "v": 11.06,
     "u": "-",
     "scope": "aircraft",
     "src": [
      "LT2"
     ],
     "conf": "สูง",
     "est": false,
     "note": "[LT2 p.1-5]"
    },
    "taper": {
     "v": 0.454,
     "u": "-",
     "scope": "aircraft",
     "src": [
      "LT2"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: ปีกเรียวตรงเทียบเท่าที่ให้ S, b, MAC ตาม AFM: c_root 1.67 m, c_tip 0.7577 m (ปีกจริงมี center wing ช่วงในแล้วเรียว)"
    },
    "sweep_c4_deg": {
     "v": -0.95,
     "u": "deg",
     "scope": "aircraft",
     "src": [
      "LT2"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณจาก LE sweep 1° [LT2 p.1-5] กับ taper เทียบเท่า"
    },
    "dihedral_deg": {
     "v": 5,
     "u": "deg",
     "scope": "aircraft",
     "src": [
      "LT2"
     ],
     "conf": "สูง",
     "est": false,
     "note": "[LT2 p.1-5]"
    },
    "incidence_deg": {
     "v": 1,
     "u": "deg",
     "scope": "aircraft",
     "src": [
      "LM0"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: ไม่พบในเอกสารเผยแพร่ ใช้ค่าเดียวกับบัตร DA40 (หัวข้อ 05) เพื่อ trim เท่านั้น"
    },
    "twist_deg": {
     "v": -2,
     "u": "deg",
     "scope": "aircraft",
     "src": [
      "LM10"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ washout ทั่วไปของปีก GA"
    },
    "airfoil": {
     "v": "Wortmann FX 63-137/20-W4",
     "u": "-",
     "scope": "aircraft",
     "src": [
      "LT2"
     ],
     "conf": "สูง",
     "est": false,
     "note": "[LT2 p.1-5] (ตระกูลเดียวกับ DA40)"
    },
    "position": {
     "v": "low",
     "u": "-",
     "scope": "aircraft",
     "src": [
      "LT1"
     ],
     "conf": "สูง",
     "est": false,
     "note": "ปีกต่ำ"
    },
    "x_c4_root": {
     "v": 2.714,
     "u": "m",
     "scope": "aircraft",
     "src": [
      "LT2"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: ระยะจากจมูกถึง c/4 ของ root (จมูกที่ −0.10 m DAT ค่าประมาณ)"
    }
   },
   "tail": {
    "S_h": {
     "v": 2.35,
     "u": "m2",
     "scope": "aircraft",
     "src": [
      "LT2"
     ],
     "conf": "สูง",
     "est": false,
     "note": "25.3 sq ft [LT2 p.1-6]"
    },
    "b_h": {
     "v": 3.288,
     "u": "m",
     "scope": "aircraft",
     "src": [
      "LT2"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: AR หางระดับ 4.6"
    },
    "l_h": {
     "v": 5.085,
     "u": "m",
     "scope": "aircraft",
     "src": [
      "LT1"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: c/4 MAC ปีก 2.565 → c/4 หางระดับ 7.65 m DAT (หาง T บนครีบ, ความยาวทั้งลำ 8.56 m [LT1]); V_H 0.5772"
    },
    "S_v": {
     "v": 2.43,
     "u": "m2",
     "scope": "aircraft",
     "src": [
      "LT2"
     ],
     "conf": "สูง",
     "est": false,
     "note": "26.2 sq ft [LT2 p.1-6]"
    },
    "b_v": {
     "v": 1.45,
     "u": "m",
     "scope": "aircraft",
     "src": [
      "LT1"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณจากความสูงเครื่อง 2.49 m [LT1]"
    },
    "l_v": {
     "v": 4.685,
     "u": "m",
     "scope": "aircraft",
     "src": [
      "LT1"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: c/4 MAC ครีบที่ 7.25 m DAT; V_V 0.05208"
    },
    "z_v": {
     "v": 0.8,
     "u": "m",
     "scope": "aircraft",
     "src": [
      "LT1"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: ความสูงของจุดศูนย์กลางแรงครีบเหนือแกนลำตัว"
    },
    "h_h": {
     "v": 1.75,
     "u": "m",
     "scope": "aircraft",
     "src": [
      "LT1"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: หาง T สูงกว่าระนาบคอร์ดปีก ~1.75 m"
    },
    "tailcone_depth": {
     "v": 0.4,
     "u": "m",
     "scope": "aircraft",
     "src": [
      "LT1"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณจากสัดส่วนภาพด้านข้างของเครื่อง (ลำตัวสูง ~1.30 m เรียวลงเหลือ ~0.40 m ที่โคนหาง) ไม่มีแบบเผยแพร่"
    },
    "airfoil_h": {
     "v": "ไม่เผยแพร่",
     "u": "-",
     "scope": "aircraft",
     "src": [
      "LT2"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: ไม่พบใน AFM/TCDS (สตริงบอกสถานะ ไม่ใช้คำนวณ); โมเดลใช้ CLα หางจากสูตร Helmbold แทน"
    },
    "airfoil_v": {
     "v": "ไม่เผยแพร่",
     "u": "-",
     "scope": "aircraft",
     "src": [
      "LT2"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: ไม่พบใน AFM/TCDS (สตริงบอกสถานะ ไม่ใช้คำนวณ); โมเดลใช้ CLα ครีบจาก lm_derivs แทน"
    },
    "incidence_h_deg": {
     "v": -1.1,
     "u": "deg",
     "scope": "aircraft",
     "src": [
      "LT2"
     ],
     "conf": "สูง",
     "est": false,
     "note": "เทียบแกนตามยาว [LT2 p.1-6]"
    }
   },
   "surfaces": {
    "elevator": {
     "v": {
      "area_m2": 0.66,
      "chord_ratio": 0.3,
      "span_fraction": 1
     },
     "u": "-",
     "scope": "aircraft",
     "src": [
      "LT2"
     ],
     "conf": "กลาง",
     "est": true,
     "note": "พื้นที่จาก AFM [LT2 p.1-6]; chord_ratio ค่าประมาณจากสัดส่วนพื้นที่ 0.28"
    },
    "aileron": {
     "v": {
      "area_m2": 0.66,
      "chord_ratio": 0.25,
      "span_fraction": [
       0.75,
       0.97
      ]
     },
     "u": "-",
     "scope": "aircraft",
     "src": [
      "LT2"
     ],
     "conf": "กลาง",
     "est": true,
     "note": "พื้นที่รวมสองข้าง 0.66 m² [LT2 p.1-5]; chord_ratio และตำแหน่งช่วงปีกเป็นค่าประมาณที่ให้พื้นที่ 0.654 m²"
    },
    "rudder": {
     "v": {
      "area_m2": 0.78,
      "chord_ratio": 0.35,
      "span_fraction": 0.9
     },
     "u": "-",
     "scope": "aircraft",
     "src": [
      "LT2"
     ],
     "conf": "กลาง",
     "est": true,
     "note": "พื้นที่ [LT2 p.1-6]; อื่น ๆ ค่าประมาณ"
    },
    "flap": {
     "v": {
      "area_m2": 2.18,
      "chord_ratio": 0.22,
      "span_fraction": [
       0.09,
       0.75
      ],
      "kind": "สองชิ้น (center wing + outer wing) ไฟฟ้า 3 ตำแหน่ง"
     },
     "u": "-",
     "scope": "aircraft",
     "src": [
      "LT2",
      "LT5"
     ],
     "conf": "กลาง",
     "est": true,
     "note": "พื้นที่รวม 2.18 m² [LT2 p.1-6]; สองชิ้นต่อข้าง [LT5 p.7-5]; chord/span ค่าประมาณ"
    },
    "trim_tab": {
     "v": {
      "elevator": "tab ปรับด้วย Bowden cable",
      "rudder": "tab ปรับด้วย Bowden cable"
     },
     "u": "-",
     "scope": "aircraft",
     "src": [
      "LT5"
     ],
     "conf": "สูง",
     "est": false,
     "note": "[LT5 p.7-4]; พื้นที่ไม่เผยแพร่"
    }
   },
   "geometry": {
    "length": {
     "v": 8.56,
     "u": "m",
     "scope": "aircraft",
     "src": [
      "LT1",
      "LT2"
     ],
     "conf": "สูง",
     "est": false,
     "note": "28 ft 1 in"
    },
    "span": {
     "v": 13.42,
     "u": "m",
     "scope": "aircraft",
     "src": [
      "LT1"
     ],
     "conf": "สูง",
     "est": false,
     "note": "13.55 m รวมไฟ ACL [LT2]; หน้าเว็บ Diamond ระบุ 14.55 m ซึ่งขัดกับ TCDS (§06.12)"
    },
    "height": {
     "v": 2.49,
     "u": "m",
     "scope": "aircraft",
     "src": [
      "LT1"
     ],
     "conf": "สูง",
     "est": false,
     "note": "8 ft 2 in"
    },
    "wheelbase": {
     "v": 1.735,
     "u": "m",
     "scope": "aircraft",
     "src": [
      "LT2"
     ],
     "conf": "สูง",
     "est": false,
     "note": "5 ft 8 in [LT2 p.1-6]"
    },
    "main_track": {
     "v": 2.95,
     "u": "m",
     "scope": "aircraft",
     "src": [
      "LT2"
     ],
     "conf": "สูง",
     "est": false,
     "note": "9 ft 8 in [LT2 p.1-6]"
    },
    "prop_clearance": {
     "v": 0.3,
     "u": "m",
     "scope": "aircraft",
     "src": [
      "LT1"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณระยะปลายใบพัดถึงพื้นขณะจอด"
    },
    "eye_pos_FRD": {
     "v": [
      0.424,
      -0.3,
      -0.8
     ],
     "u": "m FRD",
     "scope": "aircraft",
     "src": [
      "LT1"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: ตานักบินที่นั่งซ้ายที่ x ≈ 2.0 m DAT, 0.30 m ซ้าย, 0.80 m เหนือ CG"
    },
    "eye_height_static": {
     "v": 1.85,
     "u": "m",
     "scope": "aircraft",
     "src": [
      "LT1"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ ความสูงตาเหนือพื้นขณะจอด"
    },
    "fuselage_width": {
     "v": 1.2,
     "u": "m",
     "scope": "aircraft",
     "src": [
      "LT1"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณจากห้องโดยสาร 4 ที่นั่งสองแถวแบบเดียวกับ DA40 และสัดส่วนภาพด้านหน้า (ไม่มีแบบเผยแพร่)"
    },
    "fuselage_height": {
     "v": 1.3,
     "u": "m",
     "scope": "aircraft",
     "src": [
      "LT1"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณจากสัดส่วนภาพด้านข้างเทียบความสูงเครื่อง 2.49 m [LT1] (ไม่มีแบบเผยแพร่)"
    },
    "engine_y": {
     "v": 1.7,
     "u": "m",
     "scope": "aircraft",
     "src": [
      "LT2"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณระยะแกนใบพัดจากแนวกลางลำ (ใบพัด 1.87 m กับลำตัวกว้าง ~1.2 m และ track 2.95 m [LT2]); ใช้คำนวณโมเมนต์ OEI"
    }
   }
  }
 }
}
```

```json
{
 "da42ng": {
  "aero": {
   "ref": {
    "S": {
     "v": 16.29,
     "u": "m2",
     "scope": "aircraft",
     "src": [
      "LT2"
     ],
     "conf": "สูง",
     "est": false,
     "note": ""
    },
    "b": {
     "v": 13.42,
     "u": "m",
     "scope": "aircraft",
     "src": [
      "LT2"
     ],
     "conf": "สูง",
     "est": false,
     "note": ""
    },
    "c": {
     "v": 1.271,
     "u": "m",
     "scope": "aircraft",
     "src": [
      "LT2"
     ],
     "conf": "สูง",
     "est": false,
     "note": "MAC"
    }
   },
   "flaps": {
    "detents": {
     "v": [
      {
       "name": "UP",
       "flap_deg": 0,
       "dCL0": 0,
       "dCD0": 0,
       "dCm0": 0,
       "CLmax": 1.47
      },
      {
       "name": "APP",
       "flap_deg": 20,
       "VFE_kt": 133,
       "dCL0": 0.3,
       "dCD0": 0.012,
       "dCm0": -0.03,
       "CLmax": 1.59
      },
      {
       "name": "LDG",
       "flap_deg": 42,
       "VFE_kt": 113,
       "dCL0": 0.6,
       "dCD0": 0.045,
       "dCm0": -0.06,
       "CLmax": 1.86
      }
     ],
     "u": "-",
     "scope": "aircraft",
     "src": [
      "LT1",
      "LT2",
      "LT11"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "มุมแฟลป 0/20/42° [LT1]; VFE KIAS [LT2 p.2-4]; CLmax จาก VS (1,900 kg, KIAS→KCAS, nz 0.95, lt_geom.mjs) ความเชื่อมั่นกลาง; dCL0/dCD0/dCm0 ค่าประมาณ (ไม่พบข้อมูล)"
    },
    "transition_time_s": {
     "v": {
      "UP-APP": 4,
      "APP-LDG": 5
     },
     "u": "s",
     "scope": "aircraft",
     "src": [
      "LT5"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: AFM บอกว่าแฟลปไฟฟ้าวิ่งเองจนถึงตำแหน่ง แต่ไม่ให้เวลา [LT5 p.7-6]"
    }
   },
   "gear_drag": {
    "dCD0": {
     "v": 0.012,
     "u": "-",
     "scope": "aircraft",
     "src": [
      "LM12"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ ΔCD0 ล้อลง (ล้อพับได้ 3 ล้อ บนพื้นที่ปีก 16.29 m²) แบบ Raymer §12.5"
    }
   },
   "static_long": {
    "CL0": {
     "v": {
      "UP": 0.35,
      "APP": 0.6499999999999999,
      "LDG": 0.95
     },
     "u": "-",
     "scope": "aircraft",
     "src": [
      "LT2"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: CL ที่ α ลำตัว 0 (ปีก FX 63-137 โค้งมาก incidence ~1°)"
    },
    "CLalpha": {
     "v": 5.511,
     "u": "1/rad",
     "scope": "aircraft",
     "src": [
      "LM10",
      "LT15"
     ],
     "conf": "กลาง",
     "est": true,
     "note": "ค่าประมาณ lm_derivs (ทั้งลำ); บินจริง DA42 TDI ที่ α ≈ 0: 4.84–5.50 /rad (Londono 2009 [LT15] p.81)"
    },
    "CLmax_target": {
     "v": {
      "UP": 1.47,
      "APP": 1.59,
      "LDG": 1.86
     },
     "u": "-",
     "scope": "aircraft",
     "src": [
      "LT2",
      "LT11",
      "LM1"
     ],
     "conf": "กลาง",
     "est": true,
     "note": "ค่าประมาณ: 1 g trim ที่ CG ตามตาราง (ไม่ระบุ) 1,900 kg: VS1 69 / VS(APP) 65 / VS0 62 KIAS → KCAS (ตาราง ias_cas) → nz 0.95 (lm_polar §01.5)"
    },
    "Cm0": {
     "v": {
      "UP": -0.02,
      "APP": -0.05,
      "LDG": -0.08
     },
     "u": "-",
     "scope": "aircraft",
     "src": [
      "LT2"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ (ไม่มีข้อมูล) เลือกให้ trim ได้ในช่วงระยะ elevator ตาม TCDS"
    },
    "Cmalpha": {
     "v": -0.535,
     "u": "1/rad",
     "scope": "aircraft",
     "src": [
      "LT15",
      "LM10"
     ],
     "conf": "กลาง",
     "est": true,
     "note": "ค่าประมาณ: จุดกลางของค่าบินทดสอบ DA42 TDI −0.50 ถึง −0.57 /rad (Londono 2009 [LT15] Table 22, output-error) ซึ่ง CG ของการทดสอบไม่ระบุ จึงใช้เป็นค่าเป้าที่ CG อ้างอิง 13.9 %MAC ได้เพียงโดยประมาณ; ค่าจากรูปทรง (lm_derivs) ที่ CG อ้างอิงได้ -1.75 /rad (h_n 0.456, static margin 0.317) มากกว่าบินจริง ~3 เท่า เก็บไว้เทียบเท่านั้น; Cmq และ Cmδe ยังเป็นค่าจากรูปทรงเพราะค่าบินทดสอบ Cmδe −0.58 ทำให้ซิม stall แฟลป LDG และหมุนตัวขึ้นไม่ได้ภายใน elevator 15.5° (§06.6.4)"
    },
    "alpha_CLmax": {
     "v": {
      "UP": 13,
      "LDG": 10.9
     },
     "u": "deg",
     "scope": "aircraft",
     "src": [
      "LM1"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: α ที่ CLmax trim ของซิม (lm_card simCLmax)"
    },
    "alpha_star": {
     "v": {
      "UP": 15.8,
      "LDG": 14
     },
     "u": "deg",
     "scope": "aircraft",
     "src": [
      "LM1"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: จุดกลาง Beard–McLain ที่ buildAC แก้หา (= aStall, aStall + aStallFlap)"
    },
    "alpha_star_neg": {
     "v": {
      "UP": 13,
      "LDG": 9
     },
     "u": "deg",
     "scope": "aircraft",
     "src": [
      "LT20"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: ยกค่าของเครื่องฝึกรอบที่ 1 (params-trainer.json [LT20]) มาใช้ เพราะไม่พบข้อมูลของ DA42"
    },
    "a1": {
     "v": 22,
     "u": "1/rad",
     "scope": "aircraft",
     "src": [
      "LT20"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: ยกค่าของเครื่องฝึกรอบที่ 1 (params-trainer.json [LT20]) มาใช้ เพราะไม่พบข้อมูลของ DA42"
    },
    "CL_sep_at_alpha_star": {
     "v": {
      "UP": 1.03,
      "LDG": 1.23
     },
     "u": "-",
     "scope": "aircraft",
     "src": [
      "LT20"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: สัดส่วนเดียวกับรอบที่ 1 (0.70/0.66 ของ CLmax)"
    },
    "CDmax_90": {
     "v": 1.43,
     "u": "-",
     "scope": "aircraft",
     "src": [
      "LT20"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: 1.11 + 0.018 AR + หาง/ลำตัว 0.12 (สูตรรอบที่ 1)"
    },
    "dCD_sep": {
     "v": 0.2,
     "u": "-",
     "scope": "aircraft",
     "src": [
      "LT20"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: ยกค่าของเครื่องฝึกรอบที่ 1 (params-trainer.json [LT20]) มาใช้ เพราะไม่พบข้อมูลของ DA42"
    },
    "CmX": {
     "v": -0.12,
     "u": "-",
     "scope": "aircraft",
     "src": [
      "LT20",
      "LT4"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: ยกค่าของเครื่องฝึกรอบที่ 1 (params-trainer.json [LT20]) มาใช้ เพราะไม่พบข้อมูลของ DA42; DA42 ผ่านเกณฑ์ stall ด้วย variable elevator stop ที่กำลังสูง [LT4] จึงควรมี pitch break ลงหัว"
    }
   },
   "derivatives": {
    "CLq": {
     "v": {
      "cruise": 8.012,
      "approach": 7.937
     },
     "u": "1/rad",
     "scope": "aircraft",
     "src": [
      "LM10",
      "LM13",
      "LT15"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ lm_derivs (แกนลำตัว, cruise 135 kt / approach 84 kt แฟลป LDG, CG 13.9 %MAC)"
    },
    "CLadot": {
     "v": {
      "cruise": 1.068,
      "approach": 1.047
     },
     "u": "1/rad",
     "scope": "aircraft",
     "src": [
      "LM10",
      "LM13",
      "LT15"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ lm_derivs (แกนลำตัว, cruise 135 kt / approach 84 kt แฟลป LDG, CG 13.9 %MAC)"
    },
    "CLde": {
     "v": {
      "cruise": 0.295,
      "approach": 0.2926
     },
     "u": "1/rad",
     "scope": "aircraft",
     "src": [
      "LM10",
      "LM13",
      "LT15"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ lm_derivs (แกนลำตัว, cruise 135 kt / approach 84 kt แฟลป LDG, CG 13.9 %MAC)"
    },
    "CYb": {
     "v": {
      "cruise": -0.5821,
      "approach": -0.5813
     },
     "u": "1/rad",
     "scope": "aircraft",
     "src": [
      "LM10",
      "LM13",
      "LT15"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ lm_derivs (แกนลำตัว, cruise 135 kt / approach 84 kt แฟลป LDG, CG 13.9 %MAC); บินจริง DA42 TDI (Londono 2009, OE-time, แปลงเครื่องหมายตาม AC) -0.31"
    },
    "CYdr": {
     "v": {
      "cruise": 0.1316,
      "approach": 0.1313
     },
     "u": "1/rad",
     "scope": "aircraft",
     "src": [
      "LM10",
      "LM13",
      "LT15"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ lm_derivs (แกนลำตัว, cruise 135 kt / approach 84 kt แฟลป LDG, CG 13.9 %MAC)"
    },
    "CYr": {
     "v": {
      "cruise": 0.2289,
      "approach": 0.2281
     },
     "u": "1/rad",
     "scope": "aircraft",
     "src": [
      "LM10",
      "LM13",
      "LT15"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ lm_derivs (แกนลำตัว, cruise 135 kt / approach 84 kt แฟลป LDG, CG 13.9 %MAC)"
    },
    "Clb": {
     "v": {
      "cruise": -0.069,
      "approach": -0.0692
     },
     "u": "1/rad",
     "scope": "aircraft",
     "src": [
      "LM10",
      "LM13",
      "LT15"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ lm_derivs (แกนลำตัว, cruise 135 kt / approach 84 kt แฟลป LDG, CG 13.9 %MAC)"
    },
    "Clp": {
     "v": {
      "cruise": -0.5606,
      "approach": -0.5598
     },
     "u": "1/rad",
     "scope": "aircraft",
     "src": [
      "LM10",
      "LM13",
      "LT15"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ lm_derivs (แกนลำตัว, cruise 135 kt / approach 84 kt แฟลป LDG, CG 13.9 %MAC)"
    },
    "Clr": {
     "v": {
      "cruise": 0.1022,
      "approach": 0.247
     },
     "u": "1/rad",
     "scope": "aircraft",
     "src": [
      "LM10",
      "LM13",
      "LT15"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ lm_derivs (แกนลำตัว, cruise 135 kt / approach 84 kt แฟลป LDG, CG 13.9 %MAC)"
    },
    "Clda": {
     "v": {
      "cruise": 0.1459,
      "approach": 0.1457
     },
     "u": "1/rad",
     "scope": "aircraft",
     "src": [
      "LM10",
      "LM13",
      "LT15"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ lm_derivs (แกนลำตัว, cruise 135 kt / approach 84 kt แฟลป LDG, CG 13.9 %MAC); บินจริง DA42 TDI (Londono 2009, OE-time, แปลงเครื่องหมายตาม AC) 0.19"
    },
    "Cldr": {
     "v": {
      "cruise": 0.007847,
      "approach": 0.007828
     },
     "u": "1/rad",
     "scope": "aircraft",
     "src": [
      "LM10",
      "LM13",
      "LT15"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ lm_derivs (แกนลำตัว, cruise 135 kt / approach 84 kt แฟลป LDG, CG 13.9 %MAC)"
    },
    "Cmq": {
     "v": {
      "cruise": -19.54,
      "approach": -19.38
     },
     "u": "1/rad",
     "scope": "aircraft",
     "src": [
      "LM10",
      "LM13",
      "LT15"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ lm_derivs (แกนลำตัว, cruise 135 kt / approach 84 kt แฟลป LDG, CG 13.9 %MAC); บินจริง DA42 TDI (Londono 2009, OE-time, แปลงเครื่องหมายตาม AC) -11.36"
    },
    "Cmadot": {
     "v": {
      "cruise": -4.389,
      "approach": -4.307
     },
     "u": "1/rad",
     "scope": "aircraft",
     "src": [
      "LM10",
      "LM13",
      "LT15"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ lm_derivs (แกนลำตัว, cruise 135 kt / approach 84 kt แฟลป LDG, CG 13.9 %MAC)"
    },
    "Cmde": {
     "v": {
      "cruise": -1.213,
      "approach": -1.203
     },
     "u": "1/rad",
     "scope": "aircraft",
     "src": [
      "LM10",
      "LM13",
      "LT15"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ lm_derivs (แกนลำตัว, cruise 135 kt / approach 84 kt แฟลป LDG, CG 13.9 %MAC); บินจริง DA42 TDI (Londono 2009, OE-time, แปลงเครื่องหมายตาม AC) -0.58"
    },
    "Cnb": {
     "v": {
      "cruise": 0.07722,
      "approach": 0.07728
     },
     "u": "1/rad",
     "scope": "aircraft",
     "src": [
      "LM10",
      "LM13",
      "LT15"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ lm_derivs (แกนลำตัว, cruise 135 kt / approach 84 kt แฟลป LDG, CG 13.9 %MAC); บินจริง DA42 TDI (Londono 2009, OE-time, แปลงเครื่องหมายตาม AC) 0.049"
    },
    "Cnp": {
     "v": {
      "cruise": -0.04537,
      "approach": -0.1124
     },
     "u": "1/rad",
     "scope": "aircraft",
     "src": [
      "LM10",
      "LM13",
      "LT15"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ lm_derivs (แกนลำตัว, cruise 135 kt / approach 84 kt แฟลป LDG, CG 13.9 %MAC)"
    },
    "Cnr": {
     "v": {
      "cruise": -0.08978,
      "approach": -0.1133
     },
     "u": "1/rad",
     "scope": "aircraft",
     "src": [
      "LM10",
      "LM13",
      "LT15"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ lm_derivs (แกนลำตัว, cruise 135 kt / approach 84 kt แฟลป LDG, CG 13.9 %MAC); บินจริง DA42 TDI (Londono 2009, OE-time, แปลงเครื่องหมายตาม AC) -0.087"
    },
    "Cnda": {
     "v": {
      "cruise": -0.01022,
      "approach": -0.02768
     },
     "u": "1/rad",
     "scope": "aircraft",
     "src": [
      "LM10",
      "LM13",
      "LT15"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ lm_derivs (แกนลำตัว, cruise 135 kt / approach 84 kt แฟลป LDG, CG 13.9 %MAC)"
    },
    "Cndr": {
     "v": {
      "cruise": -0.04595,
      "approach": -0.04584
     },
     "u": "1/rad",
     "scope": "aircraft",
     "src": [
      "LM10",
      "LM13",
      "LT15"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ lm_derivs (แกนลำตัว, cruise 135 kt / approach 84 kt แฟลป LDG, CG 13.9 %MAC); บินจริง DA42 TDI (Londono 2009, OE-time, แปลงเครื่องหมายตาม AC) -0.053"
    },
    "CD0": {
     "v": 0.03157,
     "u": "-",
     "scope": "aircraft",
     "src": [
      "LT10",
      "LM12"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: polar พาราโบลา (clean ล้อขึ้น) จาก cruise 3 จุด ช่วง 0.02992–0.03321 (lt_polar.mjs)"
    },
    "K": {
     "v": 0.03947,
     "u": "-",
     "scope": "aircraft",
     "src": [
      "LM12"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: 1/(π A e), e 0.73 (Raymer eq. 12.48)"
    }
   },
   "elevator_fade": {
    "alpha_t_star": {
     "v": 25,
     "u": "deg",
     "scope": "aircraft",
     "src": [
      "LT20"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "หาง T อยู่นอก wake ที่ α ปกติ; wake ถึงหางที่ α สูงกว่าเครื่องหางต่ำ (ค่าประมาณ)"
    },
    "a_t": {
     "v": 10,
     "u": "1/rad",
     "scope": "aircraft",
     "src": [
      "LT20"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: ยกค่าของเครื่องฝึกรอบที่ 1 (params-trainer.json [LT20]) มาใช้ เพราะไม่พบข้อมูลของ DA42"
    },
    "floor": {
     "v": 0.35,
     "u": "-",
     "scope": "aircraft",
     "src": [
      "LT20"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: ยกค่าของเครื่องฝึกรอบที่ 1 (params-trainer.json [LT20]) มาใช้ เพราะไม่พบข้อมูลของ DA42"
    }
   },
   "separation_dynamics": {
    "tau1": {
     "v": 0.308,
     "u": "s",
     "scope": "aircraft",
     "src": [
      "LT20"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: สเกลรอบที่ 1 ด้วย c̄"
    },
    "tau2": {
     "v": 0.154,
     "u": "s",
     "scope": "aircraft",
     "src": [
      "LT20"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: สเกลด้วย c̄"
    }
   },
   "large_beta": {
    "CY_crossflow": {
     "v": 0.45,
     "u": "-",
     "scope": "aircraft",
     "src": [
      "LT20"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: ยกค่าของเครื่องฝึกรอบที่ 1 (params-trainer.json [LT20]) มาใช้ เพราะไม่พบข้อมูลของ DA42"
    }
   },
   "strip_wing": {
    "taper": {
     "v": 0.454,
     "u": "-",
     "scope": "aircraft",
     "src": [
      "LT2"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: ปีกเรียวตรงเทียบเท่าที่ให้ S, b, MAC ตาม AFM [LT2] (lt_geom.mjs)"
    },
    "dihedral_eff": {
     "v": 5,
     "u": "deg",
     "scope": "aircraft",
     "src": [
      "LT2"
     ],
     "conf": "สูง",
     "est": false,
     "note": ""
    },
    "washout": {
     "v": 2,
     "u": "deg",
     "scope": "aircraft",
     "src": [
      "LM10"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: washout ทั่วไปของปีก GA (ไม่เผยแพร่) เท่ากับ airframe.wing.twist_deg −2°"
    },
    "kp_roll": {
     "v": 0.687,
     "u": "-",
     "scope": "aircraft",
     "src": [
      "LM10"
     ],
     "conf": "กลาง",
     "est": true,
     "note": "ค่าประมาณ: ตัวแก้ lifting line K_LL (สมการ 01.3-9) ที่ A 11.06"
    },
    "tau_aileron": {
     "v": 0.518,
     "u": "-",
     "scope": "aircraft",
     "src": [
      "LM10"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: thin airfoil × 0.85 ที่ cf/c 0.25"
    },
    "aileron_span_frac": {
     "v": [
      0.75,
      0.97
     ],
     "u": "-",
     "scope": "aircraft",
     "src": [
      "LT2"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: ตำแหน่งที่ทำให้พื้นที่ aileron สองข้างบนปีกเรียวเทียบเท่า = 0.654 m² ใกล้ 0.66 m² ของ AFM [LT2] ด้วย chord ratio 0.25 (lt_geom.mjs)"
    }
   },
   "stall_warning": {
    "min_margin": {
     "v": 5,
     "u": "kt",
     "scope": "aircraft",
     "src": [
      "LM1"
     ],
     "conf": "สูง",
     "est": false,
     "note": "เกณฑ์ 23.207"
    },
    "alpha_warn_5kt": {
     "v": {
      "UP": 9.66,
      "LDG": 6.67
     },
     "u": "deg",
     "scope": "aircraft",
     "src": [
      "LM1"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: α ของซิมที่ VS + 5 kt คำนวณจาก CLmax ของซิมที่ MTOM (lt_run.mjs alphaInfo)"
    },
    "alpha_warn_design": {
     "v": {
      "UP": 8.97,
      "LDG": 5.72
     },
     "u": "deg",
     "scope": "aircraft",
     "src": [
      "LM1"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: α ที่ VS + 7 kt (กลางช่วง 5–10 kt)"
    }
   },
   "buffet": {
    "vertical_filter": {
     "v": {
      "w0": 75.92,
      "Q": 8.28
     },
     "u": "rad/s,-",
     "scope": "aircraft",
     "src": [
      "LT20"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: ยกค่าของเครื่องฝึกรอบที่ 1 (params-trainer.json [LT20]) มาใช้ เพราะไม่พบข้อมูลของ DA42 (ไม่มีข้อมูล DA42)"
    },
    "lateral_filter": {
     "v": {
      "w0": [
       36.43,
       64.71
      ],
      "Q": [
       4.19,
       11.99
      ],
      "gain_ratio": [
       2,
       1
      ]
     },
     "u": "rad/s,-,-",
     "scope": "aircraft",
     "src": [
      "LT20"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: ยกค่าของเครื่องฝึกรอบที่ 1 (params-trainer.json [LT20]) มาใช้ เพราะไม่พบข้อมูลของ DA42"
    },
    "rms_full": {
     "v": {
      "az": 0.05,
      "ay": 0.016
     },
     "u": "g",
     "scope": "aircraft",
     "src": [
      "LT20"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: ยกค่าของเครื่องฝึกรอบที่ 1 (params-trainer.json [LT20]) มาใช้ เพราะไม่พบข้อมูลของ DA42"
    }
   },
   "legacy": {
    "v": {
     "CD0": 0.03987,
     "K": 0.04687,
     "CL0": 0.35,
     "CLa": 5.511,
     "CLflap": 0.6,
     "CDflap": 0.045,
     "CDgear": 0.012,
     "Cm0": -0.02,
     "Cma": -0.535,
     "Cmflap": -0.06,
     "aStall": 15.77,
     "aStallFlap": -1.8
    },
    "u": "-",
    "scope": "aircraft",
    "src": [
     "LM1",
     "LT2",
     "LT10"
    ],
    "conf": "ต่ำ",
    "est": true,
    "note": "ค่าประมาณ: fit ของ lm_legacy_fit + lt_run.mjs (da42ng): CD0/K รูปแบบซิม จาก glide ที่ประมาณจาก polar cruise; aStall/aStallFlap แก้ให้ CLmax ตรงเป้าด้วย elevator 15.5°; Cma −0.535 = จุดกลางค่าบินทดสอบ DA42 TDI −0.50…−0.57 [LT15] ตาม aero.static_long.Cmalpha (เดิม −1.10 คือ |Cmα| มากที่สุดที่ยัง stall ได้ภายใน elevator 15.5°; lm_derivs −1.75); CDgear ล้อพับ"
   }
  }
 }
}
```

```json
{
 "da42ng": {
  "speeds": {
   "VS0_kt": {
    "v": 62,
    "u": "kt IAS",
    "scope": "aircraft",
    "src": [
     "LT2",
     "LT11"
    ],
    "conf": "สูง",
    "est": false,
    "note": "ปลาย white arc [LT2 p.2-5] = VS0 ที่ MTOM 1,900 kg แฟลป LDG ล้อลง idle; ตาราง stall 62 KIAS [LT11]; ≈ 60 KCAS"
   },
   "VS1_kt": {
    "v": 69,
    "u": "kt IAS",
    "scope": "aircraft",
    "src": [
     "LT2",
     "LT10"
    ],
    "conf": "สูง",
    "est": false,
    "note": "ปลาย green arc [LT2 p.2-5]; สเปก AOPA VS1 69 [LT10]; ตาราง stall (ผู้ใช้ทำ) 68 [LT11] ล้อขึ้น"
   },
   "VX_kt": {
    "v": 77,
    "u": "kt IAS",
    "scope": "aircraft",
    "src": [
     "LT9",
     "LT11"
    ],
    "conf": "ต่ำ",
    "est": false,
    "note": "จากสไลด์โรงเรียน (DA42-VI) และ flashcard; AFM 4A.2 ของ NG เปิดไม่ได้; AOPA 2010 พิมพ์ \"VX and VY 90\" [LT10]"
   },
   "VY_kt": {
    "v": 90,
    "u": "kt IAS",
    "scope": "aircraft",
    "src": [
     "LT9",
     "LT10",
     "LT11"
    ],
    "conf": "กลาง",
    "est": false,
    "note": "สามแหล่งทุติยภูมิตรงกัน (90 KIAS ≤1,900 kg, 92 KIAS >1,900 kg ของ DA42-VI [LT9]); โมเดล lt_polar ให้ ROC สูงสุดที่ 90 KCAS"
   },
   "VR_kt": {
    "v": 76,
    "u": "kt IAS",
    "scope": "aircraft",
    "src": [
     "LT9",
     "LT11"
    ],
    "conf": "ต่ำ",
    "est": false,
    "note": "สไลด์/flashcard 76 KIAS; สเปก AOPA 2010 ให้ 80 KIAS [LT10]; แฟลป UP"
   },
   "VAPP_kt": {
    "v": 84,
    "u": "kt IAS",
    "scope": "aircraft",
    "src": [
     "LT9"
    ],
    "conf": "ต่ำ",
    "est": false,
    "note": "ความเร็ว approach แฟลป APP ขั้นต่ำ 84 KIAS (43.2 m/s) ที่มวลฝึก 1,752 kg ซึ่งอยู่ในแถบ ≤1,900 kg [LT9]; แถบ >1,900 kg 88 KIAS; AOPA ref approach 85 KIAS [LT10]; บัตรเป็นเจ้าของค่านี้ (D1) หัวข้อ 08 และ 09 อ้างจากที่นี่"
   },
   "VREF_kt": {
    "v": 84,
    "u": "kt IAS",
    "scope": "aircraft",
    "src": [
     "LT9"
    ],
    "conf": "ต่ำ",
    "est": false,
    "note": "final approach แฟลป LDG ขั้นต่ำ 84 KIAS (43.2 m/s) ที่มวลฝึก 1,752 kg (แถบ ≤1,900 kg) [LT9]; แถบ >1,900 kg 86 KIAS; ≈ 1.4 VS0 ของ 1,900 kg (60 KCAS); AFM ให้ค่าเดียวกับ VAPP จึง VAPP = VREF (D1)"
   },
   "VG_kt": {
    "v": 85,
    "u": "kt IAS",
    "scope": "aircraft",
    "src": [
     "LT2"
    ],
    "conf": "ต่ำ",
    "est": true,
    "note": "ค่าประมาณ: ความเร็วร่อนดีที่สุดสองเครื่องดับใบพัด feather จาก polar (lt_polar 87 KCAS ที่ 1,900 kg) ไม่พบใน AFM ที่เปิดได้"
   },
   "VA_kt": {
    "v": {
     "1700": 112,
     "1800": 119,
     "1900": 122
    },
    "u": "kt IAS",
    "scope": "aircraft",
    "src": [
     "LT2",
     "LT1"
    ],
    "conf": "สูง",
    "est": false,
    "note": "vO (operating manoeuvring) ตามมวล ≤1,700 / 1,700–1,800 / >1,800 kg [LT2 p.2-4]; TCDS ให้ VA 114 / 121 / 125 KEAS [LT1 C.III.10]"
   },
   "VNO_kt": {
    "v": 151,
    "u": "kt IAS",
    "scope": "aircraft",
    "src": [
     "LT2"
    ],
    "conf": "สูง",
    "est": false,
    "note": "155 KEAS [LT1]"
   },
   "VNE_kt": {
    "v": 188,
    "u": "kt IAS",
    "scope": "aircraft",
    "src": [
     "LT2"
    ],
    "conf": "สูง",
    "est": false,
    "note": "192 KEAS [LT1]"
   },
   "VLE_kt": {
    "v": 188,
    "u": "kt IAS",
    "scope": "aircraft",
    "src": [
     "LT2"
    ],
    "conf": "สูง",
    "est": false,
    "note": "192 KEAS [LT1]"
   },
   "VLO_kt": {
    "v": {
     "extend": 188,
     "retract": 152
    },
    "u": "kt IAS",
    "scope": "aircraft",
    "src": [
     "LT2"
    ],
    "conf": "สูง",
    "est": false,
    "note": "vLOE / vLOR [LT2 p.2-4]; emergency extension ≤152 KIAS [LT2 p.2-27]; TCDS VLO 155 KEAS"
   },
   "VFE": {
    "v": {
     "APP": 133,
     "LDG": 113
    },
    "u": "kt IAS",
    "scope": "aircraft",
    "src": [
     "LT2"
    ],
    "conf": "สูง",
    "est": false,
    "note": "TCDS 135 / 110 KEAS [LT1]"
   },
   "VMCA_kt": {
    "v": 76,
    "u": "kt IAS",
    "scope": "aircraft",
    "src": [
     "LT2",
     "LT1"
    ],
    "conf": "สูง",
    "est": false,
    "note": "red radial [LT2 p.2-4, 2-5]; TCDS 75 KEAS (70 KEAS กับ MÄM 42-600) [LT1 C.III.10]; เงื่อนไข 14 CFR/CS 23.149: กำลัง takeoff เครื่องที่เหลือ เอียงไม่เกิน 5° [LT17]"
   },
   "VYSE_kt": {
    "v": 85,
    "u": "kt IAS",
    "scope": "aircraft",
    "src": [
     "LT2"
    ],
    "conf": "สูง",
    "est": false,
    "note": "blue radial [LT2 p.2-5, 3-5]"
   },
   "VXSE_kt": {
    "v": 82,
    "u": "kt IAS",
    "scope": "aircraft",
    "src": [
     "LT16"
    ],
    "conf": "ต่ำ",
    "est": true,
    "note": "ค่าประมาณ: AFM NG ที่เปิดได้ไม่มี VXSE (Horlings ชี้ว่า AFM DA 42 ไม่นิยาม [LT8]); DA42 TDI ตามสเปก AOPA 77 KIAS [LT16] บวกผลต่าง VYSE (85 − 82); ซิมควรคำนวณเอง (T-LT-28)"
   },
   "VSSE_kt": {
    "v": 85,
    "u": "kt IAS",
    "scope": "aircraft",
    "src": [
     "LT8",
     "LT17"
    ],
    "conf": "ต่ำ",
    "est": true,
    "note": "ค่าประมาณ: AFM มีแต่นิยาม (p.1-8) ไม่มีตัวเลข [LT2][LT8]; เสนอให้ซิมใช้ไม่ต่ำกว่า VYSE 85 KIAS (≥ VMCA + 9 kt) สำหรับการฝึกดับเครื่องโดยเจตนา"
   },
   "ias_cas": {
    "v": {
     "UP": [
      [
       68,
       67
      ],
      [
       76,
       75
      ],
      [
       151,
       155
      ],
      [
       152,
       155
      ],
      [
       188,
       192
      ]
     ],
     "APP": [
      [
       65,
       65
      ],
      [
       133,
       135
      ]
     ],
     "LDG": [
      [
       62,
       60
      ],
      [
       64,
       62
      ],
      [
       113,
       110
      ]
     ]
    },
    "u": "kt IAS → kt CAS",
    "scope": "aircraft",
    "src": [
     "LT1",
     "LT2",
     "LT6",
     "LT11"
    ],
    "conf": "ต่ำ",
    "est": true,
    "note": "ค่าประมาณ: ตารางสอบเทียบใน AFM บทที่ 5 เป็นกราฟ จึงสร้างจากคู่ TCDS (KEAS ≈ KCAS ที่ความสูงต่ำ) กับ AFM (KIAS): UP 76→75, 151→155, 152→155, 188→192; APP 133→135; LDG 113→110 และ 64 KIAS ≈ 62 KCAS ของ DA42-VI; จุดต่ำสุดของแต่ละแฟลปเป็นการต่อเส้น (lt_geom.mjs)"
   },
   "stall_table": {
    "v": {
     "axes": {
      "mass_kg": [
       1510,
       1700,
       1900,
       1999
      ],
      "flap": [
       "UP",
       "APP",
       "LDG"
      ]
     },
     "data": [
      [
       61,
       58,
       54
      ],
      [
       64,
       62,
       59
      ],
      [
       68,
       65,
       62
      ],
      [
       72,
       68,
       64
      ]
     ]
    },
    "u": "kt IAS",
    "scope": "aircraft",
    "src": [
     "LT11",
     "LT2"
    ],
    "conf": "ต่ำ",
    "est": false,
    "note": "มุมเอียง 0° idle ล้อขึ้นที่ UP ล้อลงที่ APP/LDG; จาก flashcard ผู้ใช้ (ทุติยภูมิ) สอดคล้องกับ arc ของ AFM ที่ 1,900 kg (62/69) ภายใน 1 kt; ค่า 1,999 kg เป็นของ DA42-VI/MÄM 42-678"
   },
   "stall_warning_margin_kt": {
    "v": 5,
    "u": "kt",
    "scope": "aircraft",
    "src": [
     "LT4",
     "LM1"
    ],
    "conf": "ต่ำ",
    "est": true,
    "note": "ค่าประมาณ: เกณฑ์ขั้นต่ำ 5 kt (CS/14 CFR 23.207 เดิม); รายงาน NZ CAA ระบุว่ารุ่น L360 ไม่ถึง 5 kt ที่ CG หน้า [LT4 p.7]"
   },
   "crosswind_demonstrated_kt": {
    "v": 25,
    "u": "kt",
    "scope": "aircraft",
    "src": [
     "LT10",
     "LT6"
    ],
    "conf": "กลาง",
    "est": false,
    "note": "สเปก AOPA 2010 ของ DA42 NG \"max demonstrated crosswind 25 kt\" [LT10]; โบรชัวร์ DA42-VI 25 kt / 46 km/h [LT6 p.19]; ค่าใน AFM NG บทที่ 4/5 เปิดไม่ได้ (§06.12); DA 42 TDI 20 kt [LT16]"
   },
   "icao_approach_category": {
    "v": "A",
    "u": "-",
    "scope": "aircraft",
    "src": [
     "LT2"
    ],
    "conf": "สูง",
    "est": false,
    "note": "Vat = 1.3 × VS0 (60 KCAS) = 78 kt < 91 kt"
   },
   "stall_altitude_loss_ft": {
    "v": 280,
    "u": "ft",
    "scope": "aircraft",
    "src": [
     "LC2",
     "LF1",
     "LG5",
     "LM0"
    ],
    "conf": "ต่ำ",
    "est": true,
    "note": "ค่าประมาณแบบค่าคลาส (วิธีเดียวกับ DA40 หัวข้อ 05): AFM DA42 NG ที่เปิดได้ไม่ให้ความสูงที่เสียระหว่าง stall และการแก้ จึงหารค่าที่ POH/AFM ให้ด้วย VS1² (KCAS) ของ c172s 230 ft (VS1 53 KCAS) [LC2], c152 160 ft (VS1 48 KCAS) [LF1], p2006t 180 ft (VS1 65 KCAS) [LG5] ได้สัมประสิทธิ์เฉลี่ย 0.0646 ft/kt² แล้วคูณ VS1² ที่มวลฝึก 1,752 kg (VS1 65.3 KCAS สเกลจาก 69 KIAS ที่ 1,900 kg ด้วย √m) = 280 ft (85 m); ช่วงตามสัมประสิทธิ์ต่ำสุด–สูงสุด 180–350 ft; stall ปีกระดับ สองเครื่อง ไม่รวมกรณีกำลังไม่สมมาตร"
   }
  }
 }
}
```

```json
{
 "da42ng": {
  "performance": {
   "ROC_SL_fpm": {
    "v": 1180,
    "u": "fpm",
    "scope": "aircraft",
    "src": [
     "LT10"
    ],
    "conf": "กลาง",
    "est": false,
    "note": "สเปก AOPA 2010 (DA42 NG, MTOM 1,900 kg, SL, สองเครื่อง) [LT10]; DA42-VI 1,114 fpm ที่ 1,999 kg [LT6]"
   },
   "oei": {
    "v": {
     "ROC_SL_fpm": 210,
     "VYSE_kt_IAS": 85,
     "critical_engine": "left",
     "note_vi": {
      "service_ceiling_ft": 16000,
      "absolute_ceiling_ft": 17500
     }
    },
    "u": "fpm, kt, ft",
    "scope": "aircraft",
    "src": [
     "LT10",
     "LT5",
     "LT6"
    ],
    "conf": "กลาง",
    "est": false,
    "note": "OEI 210 fpm SL (AOPA spec NG) [LT10]; เครื่องซ้ายเป็น critical engine (AFM DA 42 p.5-23) [LT5]; เพดาน OEI ของ NG ไม่พบ ส่วน DA42-VI 16,000 ft (50 fpm) / 17,500 ft [LT6]; เงื่อนไข AFM: เครื่องที่เหลือ MAX, ใบพัดที่ดับ feather, แฟลป UP, ล้อขึ้น, zero sideslip [LT5 p.5-23]; การตรวจว่า 210 fpm กับเพดาน 16,000 ft ของ VI สอดคล้องกันหรือไม่อยู่ที่ performance.oei_ceiling_model และ §06.4.1"
   },
   "service_ceiling_ft": {
    "v": 18000,
    "u": "ft",
    "scope": "aircraft",
    "src": [
     "LT1",
     "LT2"
    ],
    "conf": "สูง",
    "est": false,
    "note": "ความสูงปฏิบัติการสูงสุด (ข้อจำกัด) 18,000 ft PA ไม่ใช่เพดานทางสมรรถนะ"
   },
   "cruise_table": {
    "v": [
     {
      "h_ft": 8000,
      "isa_dev": 2.85,
      "power_pct": 92,
      "ktas": 176,
      "ff_lph_each": 31,
      "src": "flight test"
     },
     {
      "h_ft": 12500,
      "power_pct": 75,
      "ktas": 171,
      "ff_lph_each": 24.6
     },
     {
      "h_ft": 8000,
      "power_pct": 80,
      "ktas": 162,
      "ff_lph_each": 26.5
     }
    ],
    "u": "ft, %, kt TAS, l/h",
    "scope": "aircraft",
    "src": [
     "LT10"
    ],
    "conf": "กลาง",
    "est": false,
    "note": "AOPA 2010: ทดสอบบิน 92 % 8,000 ft +2 °C 176 KTAS 8.2 gph/เครื่อง; สเปก 75 % 12,500 ft 171 kt 6.5 gph; 80 % 8,000 ft 162 kt 7.0 gph (มวลไม่ระบุ)"
   },
   "glide": {
    "v": {
     "speed_kt": 86.9,
     "ratio": 13.6
    },
    "u": "kt CAS, -",
    "scope": "aircraft",
    "src": [
     "LT10",
     "LM12"
    ],
    "conf": "ต่ำ",
    "est": true,
    "note": "ค่าประมาณ: ไม่พบใน AFM ที่เปิดได้; จาก polar ของ cruise (CD0 0.0316, e 0.73) + ใบพัด feather สองข้าง ที่ 1,900 kg (lt_polar.mjs)"
   },
   "takeoff": {
    "v": {
     "ground_roll_m": 458,
     "over50ft_m": 733
    },
    "u": "m",
    "scope": "aircraft",
    "src": [
     "LT10"
    ],
    "conf": "กลาง",
    "est": false,
    "note": "สเปก AOPA 2010: 1,503 ft / 2,405 ft (พิมพ์ \"kt\") MTOM SL ISA สันนิษฐาน; DA42-VI short-field 375 / 649 m ที่ 1,999 kg [LT6]"
   },
   "landing": {
    "v": {
     "ground_roll_m": 366,
     "over50ft_m": 594
    },
    "u": "m",
    "scope": "aircraft",
    "src": [
     "LT10"
    ],
    "conf": "กลาง",
    "est": false,
    "note": "สเปก AOPA 2010: 1,200 ft / 1,950 ft; DA42-VI 387 / 647 m [LT6]"
   },
   "takeoff_table": {
    "v": {
     "vtbd_hot_estimate": {
      "OAT_C": 35,
      "elev_ft": 9,
      "ground_roll_m": 501,
      "over50ft_m": 801,
      "factor": 1.093
     }
    },
    "u": "m",
    "scope": "aircraft",
    "src": [
     "LT10",
     "LM12"
    ],
    "conf": "ต่ำ",
    "est": true,
    "note": "ค่าประมาณ: AFM ให้เป็นกราฟ (เปิดไม่ได้); สเกลระยะ ISA ด้วย σ^-1.33 (แรงยกที่ VR ∝ ρ, แรงขับใบพัดที่กำลังคงที่ ∝ ρ^(1/3)) ที่ 35 °C σ 0.935 โดยสมมติ AE300 turbo รักษากำลัง 100 %"
   },
   "fuel": {
    "v": {
     "fuel": "Jet A-1 / Jet A / TS-1 / JP-8",
     "ff_60pct_total_lph": 39.4,
     "bsfc_g_per_kWh": {
      "60": 213,
      "92": 219,
      "100": 227
     }
    },
    "u": "l/h, g/kWh",
    "scope": "aircraft",
    "src": [
     "LT6",
     "LT10",
     "LM19"
    ],
    "conf": "กลาง",
    "est": false,
    "note": "BSFC คำนวณด้วย Jet A-1 0.80 kg/l (ค่ากลางของหัวข้อ 01): 100 % 227 g/kWh จาก 35 l/h ของ factsheet [LM19]; 92 % 219 g/kWh จาก 8.2 gph/เครื่อง ที่บินทดสอบ [LT10]; 60 % 213 g/kWh จาก 39.4 l/h รวมสองเครื่องของ DA42-VI [LT6] (factsheet ให้ 19 l/h = 205 g/kWh [LM19])"
   },
   "landing_table": {
    "v": {
     "vtbd_hot_estimate": {
      "OAT_C": 35,
      "elev_ft": 9,
      "ground_roll_m": 391,
      "over50ft_m": 635,
      "factor": 1.069
     }
    },
    "u": "m",
    "scope": "aircraft",
    "src": [
     "LT10",
     "LM12"
    ],
    "conf": "ต่ำ",
    "est": true,
    "note": "ค่าประมาณ: AFM NG บทที่ 5 (กราฟ) เปิดไม่ได้; สเกลระยะ ISA ของสเปก AOPA ที่ 1,900 kg (366 / 594 m [LT10]) ด้วย 1/σ = 1.069 (IAS เท่าเดิม ⇒ TAS² ∝ 1/σ, แรงหน่วงเท่าเดิม) ที่ 35 °C ระดับน้ำทะเล (σ 0.935)"
   },
   "ROC_table": {
    "v": {
     "h_ft": 0,
     "mass_kg": 1900,
     "OAT_C": [
      15,
      25,
      35
     ],
     "aeo_fpm": [
      1180,
      1179,
      1178
     ],
     "oei": {
      "OAT_C": [
       15,
       35
      ],
      "fpm": [
       210,
       200
      ]
     },
     "training_mass_1752kg": {
      "OAT_C": [
       15,
       35
      ],
      "aeo_fpm": [
       1332,
       1333
      ],
      "oei_fpm_ISA": 287
     }
    },
    "u": "fpm",
    "scope": "aircraft",
    "src": [
     "LT10",
     "LM12",
     "LM0"
    ],
    "conf": "ต่ำ",
    "est": true,
    "note": "ค่าประมาณ: AFM NG บทที่ 5 (กราฟ ROC) เปิดไม่ได้; จุด 15 °C (ISA) ที่ 1,900 kg เป็นค่าตีพิมพ์ 1,180 / 210 fpm [LT10]; จุดอื่นคำนวณด้วยแบบจำลองมวลจุด scripts/lt_oei_ceiling.mjs (polar lt_polar, η จาก BEM × k_η ที่ปรับให้ตรงค่า ISA: สองเครื่อง 0.8816, OEI 0.8268, กำลัง MAX 123.5 kW ต่อเครื่อง flat-rated ไม่ลดตามความหนาแน่นที่ SL); ผลคือวันร้อน 35 °C แทบไม่ลด ROC ที่ระดับน้ำทะเล (ต่างจากเครื่องยนต์ไม่มี turbo) ตรวจไขว้ DA42-VI 1,999 kg ได้ 1098 fpm เทียบ 1,114 fpm [LT6]"
   },
   "oei_ceiling_model": {
    "v": {
     "kEta_cal": 0.8268,
     "vi_service_ceiling_ft": {
      "1500": {
       "ISA-10": 23000,
       "ISA": 22680,
       "ISA+10": 22380,
       "ISA+20": 22090
      },
      "1600": {
       "ISA-10": 21240,
       "ISA": 20930,
       "ISA+10": 20640,
       "ISA+20": 20370
      },
      "1700": {
       "ISA-10": 19570,
       "ISA": 19270,
       "ISA+10": 19000,
       "ISA+20": 18740
      },
      "1800": {
       "ISA-10": 17970,
       "ISA": 17690,
       "ISA+10": 17420,
       "ISA+20": 17170
      },
      "1900": {
       "ISA-10": 16450,
       "ISA": 16170,
       "ISA+10": 15620,
       "ISA+20": 14520
      },
      "1999": {
       "ISA-10": 11420,
       "ISA": 10200,
       "ISA+10": 9050,
       "ISA+20": 7930
      }
     },
     "vi_absolute_ceiling_ft_ISA": {
      "1500": 23980,
      "1600": 22250,
      "1700": 20600,
      "1800": 19030,
      "1900": 17530,
      "1999": 16100
     },
     "vi_SL_OEI_fpm_ISA_MAX": {
      "1500": 449,
      "1600": 382,
      "1700": 321,
      "1800": 266,
      "1900": 214,
      "1999": 167
     },
     "vi_16000ft_needs": {
      "mass_kg": 1911,
      "or_CD0_at_1999kg": 0.02541,
      "CD0_reduction_pct": 19.5,
      "or_kEta_at_1999kg": 0.8766
     },
     "ng_service_ceiling_ft_ISA": {
      "1752": 18370,
      "1900": 16100
     }
    },
    "u": "ft, fpm, kg",
    "scope": "aircraft",
    "src": [
     "LT10",
     "LT6",
     "LM12",
     "LM0"
    ],
    "conf": "ต่ำ",
    "est": true,
    "note": "ค่าประมาณ (scripts/lt_oei_ceiling.mjs แบบจำลองมวลจุด ไม่ใช่ซิม): ROC = (k_η·η·P − D·V)/W สูงสุดตาม TAS; polar lt_polar + ΔCD ใบพัด feather 0.0014 + trim 0.002; η จาก BEM ของใบพัด 1.87 m (NG) และ 1.90 m (VI) × k_η 0.8268 ที่ปรับให้ NG 1,900 kg SL ISA เครื่องที่เหลือ MAX = 210 fpm [LT10]; เพดานใช้ MCP 114 kW คงที่ถึง 16,000 ft แล้วลด ∝ σ^1.1 [LT6]; ผล: VI ที่ 1,999 kg ได้เพดาน OEI 10200 ft ISA ไม่ใช่ 16,000 ft; 16,000 ft ได้เมื่อมวล ≈ 1911 kg หรือเมื่อ CD0 ต่ำกว่า 19.5 % หรือ k_η 0.8766 (η ดีกว่า NG ~6 %); ROC OEI ลดเฉลี่ยราว 10 fpm ต่อ 1,000 ft จึงไวต่อส่วนเผื่อที่ SL มาก สรุป: ตัวเลขทั้งสองสอดคล้องกันได้ถ้าเพดานในโบรชัวร์เป็นของมวลราว 1,900 kg (หัวตาราง \"MTOM, ISA\" ไม่ระบุมวล)"
   },
   "tests": {
    "v": [
     {
      "case": "T-LT-01",
      "conditions": "DA42 NG 1,900 kg, แฟลป UP ล้อขึ้น, idle, 1 kt/s, ปีกระดับ",
      "quantity": "V_S (KIAS)",
      "expected": 68,
      "tolerance": 2,
      "origin": "LT11, LT2 (ปลาย green arc 69)",
      "current_model": "69.1 (VSR 70.3)",
      "pass": true
     },
     {
      "case": "T-LT-02",
      "conditions": "DA42 NG 1,900 kg, แฟลป APP ล้อลง, idle, 1 kt/s",
      "quantity": "V_S (KIAS)",
      "expected": 65,
      "tolerance": 2,
      "origin": "LT11",
      "current_model": "64.5 (VSR 65.1)",
      "pass": true
     },
     {
      "case": "T-LT-03",
      "conditions": "DA42 NG 1,900 kg, แฟลป LDG ล้อลง, idle, 1 kt/s",
      "quantity": "V_S (KIAS)",
      "expected": 62,
      "tolerance": 2,
      "origin": "LT11, LT2 (ปลาย white arc 62)",
      "current_model": "63.2 (VSR 63.6)",
      "pass": true
     },
     {
      "case": "T-LT-04",
      "conditions": "DA 42 (TAE 125) 1,785 kg, แฟลป UP, idle, 1 kt/s",
      "quantity": "V_S (KIAS)",
      "expected": 64,
      "tolerance": 2,
      "origin": "LT5 p.5-8",
      "current_model": "64.2 (VSR 65.6)",
      "pass": true
     },
     {
      "case": "T-LT-05",
      "conditions": "DA 42 (TAE 125) 1,785 kg, แฟลป LDG, idle, 1 kt/s",
      "quantity": "V_S (KIAS)",
      "expected": 57,
      "tolerance": 2,
      "origin": "LT5 p.5-8",
      "current_model": "58.1 (VSR 58.5)",
      "pass": true
     },
     {
      "case": "T-LT-06",
      "conditions": "DA42-VI 1,999 kg, แฟลป LDG, idle, 1 kt/s",
      "quantity": "V_S0 (KCAS)",
      "expected": 62,
      "tolerance": 2,
      "origin": "LT6 p.19",
      "current_model": "62.6 (VSR 63.2)",
      "pass": true
     },
     {
      "case": "T-LT-07",
      "conditions": "NG 1,900 kg SL ISA สองเครื่อง MAX แฟลป UP ล้อขึ้น",
      "quantity": "ROC สูงสุด (fpm)",
      "expected": 1180,
      "tolerance": 118,
      "origin": "LT10",
      "current_model": "1190",
      "pass": true
     },
     {
      "case": "T-LT-08",
      "conditions": "เงื่อนไขเดียวกับ T-LT-07",
      "quantity": "V_Y (KCAS)",
      "expected": 89.9,
      "tolerance": 5,
      "origin": "LT2, LT9 (90 KIAS)",
      "current_model": "86.8",
      "pass": true
     },
     {
      "case": "T-LT-09",
      "conditions": "DA 42 (TAE 125) 1,785 kg SL ISA สองเครื่อง",
      "quantity": "ROC สูงสุด (fpm)",
      "expected": 1060,
      "tolerance": 106,
      "origin": "LT16",
      "current_model": "1070",
      "pass": true
     },
     {
      "case": "T-LT-10",
      "conditions": "DA42-VI 1,999 kg SL ISA สองเครื่อง",
      "quantity": "ROC สูงสุด (fpm)",
      "expected": 1114,
      "tolerance": 111,
      "origin": "LT6 p.19",
      "current_model": "1123",
      "pass": true
     },
     {
      "case": "T-LT-11",
      "conditions": "NG 1,900 kg SL ISA แฟลป UP VR 76 KIAS ลมสงบ ทางแห้ง",
      "quantity": "ระยะวิ่งขึ้นบนพื้น (m)",
      "expected": 458,
      "tolerance": 69,
      "origin": "LT10 (1,503 ft)",
      "current_model": "489",
      "pass": true
     },
     {
      "case": "T-LT-12",
      "conditions": "เงื่อนไขเดียวกับ T-LT-11",
      "quantity": "ระยะถึง 50 ft (m)",
      "expected": 733,
      "tolerance": 110,
      "origin": "LT10 (2,405 ft)",
      "current_model": "744",
      "pass": true
     },
     {
      "case": "T-LT-13",
      "conditions": "TAE 125 1,785 kg SL ISA แฟลป UP VR 72",
      "quantity": "ระยะถึง 50 ft (m)",
      "expected": 691,
      "tolerance": 104,
      "origin": "LT16 (2,267 ft)",
      "current_model": "715",
      "pass": true
     },
     {
      "case": "T-LT-14",
      "conditions": "NG 1,900 kg (สเปก AOPA ใช้ gross weight; MLM 1,805 kg) SL ISA แฟลป LDG จาก 50 ft เบรกเต็ม (autoland ของซิม)",
      "quantity": "ระยะลงจอดรวมจาก 50 ft (m)",
      "expected": 594,
      "tolerance": 119,
      "origin": "LT10 (1,950 ft)",
      "current_model": "673",
      "pass": true
     },
     {
      "case": "T-LT-15",
      "conditions": "เงื่อนไขเดียวกับ T-LT-14",
      "quantity": "ระยะวิ่งบนพื้น (m)",
      "expected": 366,
      "tolerance": 73,
      "origin": "LT10 (1,200 ft)",
      "current_model": "332",
      "pass": true
     },
     {
      "case": "T-LT-16",
      "conditions": "วันร้อนที่ VTBD: 35 °C (ISA+20) ระดับน้ำทะเล NG 1,900 kg แฟลป UP",
      "quantity": "ระยะวิ่งขึ้นบนพื้น (m)",
      "expected": 501,
      "tolerance": 75,
      "origin": "LT10 × σ^−1.33 (ค่าประมาณ, LM1)",
      "current_model": "525 (ISA 489; อัตราส่วน 1.074)",
      "pass": true
     },
     {
      "case": "T-LT-17",
      "conditions": "NG 1,750 kg* 8,000 ft ISA+3 กำลัง 92 % ระดับ",
      "quantity": "TAS (kt)",
      "expected": 176,
      "tolerance": 7,
      "origin": "LT10 (บินทดสอบ AOPA 2010)",
      "current_model": "162.1 (143.0 KIAS)",
      "pass": false,
      "note": "*มวลเป็นค่าประมาณ; ซิมไม่มีผลความหนาแน่นต่อแรงขับ (ตรงกับเครื่อง turbo ต่ำกว่า critical altitude)"
     },
     {
      "case": "T-LT-18",
      "conditions": "VMCA: เครื่องซ้ายดับ ใบพัด windmill, ขวา MAX, เอียง 5° ไปทางเครื่องที่ดี, 1,900 kg, rudder ขวา 29°, แฟลป UP ล้อขึ้น",
      "quantity": "V_MCA (KCAS)",
      "expected": 75,
      "tolerance": 5,
      "origin": "LT1 (75 KEAS), LT2 (76 KIAS)",
      "current_model": "static 72.7; ซิม+wrapper ±27° 69.2",
      "pass": true,
      "note": "ซิมปัจจุบันไม่มี OEI จึงวัดตรงไม่ได้"
     },
     {
      "case": "T-LT-19",
      "conditions": "VMCA รุ่น TAE 125 1,785 kg เงื่อนไขเดียวกับ T-LT-18",
      "quantity": "V_MCA (KCAS)",
      "expected": 68,
      "tolerance": 5,
      "origin": "LT1 (68 KEAS)",
      "current_model": "static 67.4",
      "pass": true
     },
     {
      "case": "T-LT-20",
      "conditions": "OEI ที่ VYSE 85 KIAS, 1,900 kg, ใบพัดซ้าย feather, ขวา MAX, β = 0",
      "quantity": "มุมเอียงไปทางเครื่องที่ดี (deg)",
      "expected": 2.5,
      "tolerance": 1,
      "origin": "LT17 p.12-20 (~2° เมื่อไม่มีคำแนะนำของผู้ผลิต), LT8 §2.5.22 (~3° ที่ VYSE)",
      "current_model": "static 2.86; ซิม+wrapper 2.57",
      "pass": true
     },
     {
      "case": "T-LT-21",
      "conditions": "เงื่อนไขเดียวกับ T-LT-20",
      "quantity": "rudder ที่ต้องใช้ (deg, ไม่อิ่มตัว)",
      "expected": "≤ 29",
      "tolerance": 0,
      "origin": "LT1 (ระยะ rudder ขวา 29°)",
      "current_model": "static -21.4; ซิม+wrapper -19.1",
      "pass": true
     },
     {
      "case": "T-LT-22",
      "conditions": "OEI SL ISA 1,900 kg ที่ VYSE, feather, β = 0, แฟลป UP ล้อขึ้น",
      "quantity": "ROC (fpm)",
      "expected": 210,
      "tolerance": 60,
      "origin": "LT10",
      "current_model": "ซิม+wrapper 264 (windmill 177)",
      "pass": true,
      "note": "ซิมปัจจุบันลด thr เหลือ 0.5 ได้แต่ไม่มีโมเมนต์หันเห"
     },
     {
      "case": "T-LT-23",
      "conditions": "ตัดเครื่องซ้ายทันที (τ → 0) ที่ VYSE ไต่สองเครื่อง MAX, ใบพัด windmill",
      "quantity": "ṙ ทันทีหลังตัด (deg/s²)",
      "expected": -20.6,
      "tolerance": 0.41,
      "origin": "สมการ: ṙ = I⁻¹·N, N = −y_E(T/2 + D_wm) (ค่าประมาณ y_E 1.70 m)",
      "current_model": "ซิม+wrapper -20.58",
      "pass": true
     },
     {
      "case": "T-LT-24",
      "conditions": "ตัดเครื่องซ้ายที่ VYSE (τ 0.3 s) ไม่แตะคันบังคับ 2 s",
      "quantity": "Δψ, φ ที่ 2 s (deg)",
      "expected": "ทั้งคู่ < 0 (ไปทางเครื่องที่ดับ); Δψ −15 ± 5, φ −20 ± 7",
      "tolerance": 0,
      "origin": "ฟิสิกส์ (ทิศ) + แบบจำลองนี้ (ขนาด, ค่าประมาณ)",
      "current_model": "Δψ -14.8, φ -20.2",
      "pass": true
     },
     {
      "case": "T-LT-25",
      "conditions": "ตัดเครื่องซ้ายที่ VYSE, หน่วง 1 s แล้วนักบินใช้ rudder/aileron (เป้าเอียง 3° ไปทางเครื่องที่ดี)",
      "quantity": "Δψ สูงสุด (deg)",
      "expected": "≤ 20",
      "tolerance": 0,
      "origin": "14 CFR 23.149 / AFH ch.12 (LT17)",
      "current_model": "12.5 (เอียงสูงสุด 7.8)",
      "pass": true
     },
     {
      "case": "T-LT-26",
      "conditions": "คำสั่ง gear down ที่ความเร็ว < VLO (เวลาพับไม่ระบุใน AFM ใช้ช่วงเดียวกัน)",
      "quantity": "เวลากางล้อ (s)",
      "expected": "6–10",
      "tolerance": 0,
      "origin": "LT5 p.7-14, LT9",
      "current_model": "6.0 (อัตรา 1/6 ต่อวินาทีใน actuators)",
      "pass": true,
      "note": "ค่าคงที่ในซิม (src/20-flight.js actuators)"
     },
     {
      "case": "T-LT-27",
      "conditions": "ตาราง ias_cas ของบัตร NG แฟลป UP",
      "quantity": "KCAS ที่ 76 KIAS",
      "expected": 75,
      "tolerance": 0.5,
      "origin": "LT1 (VMCA 75 KEAS) กับ LT2 (76 KIAS)",
      "current_model": "75.00",
      "pass": true
     },
     {
      "case": "T-LT-28",
      "conditions": "OEI SL ISA 1,900 kg feather β = 0 แฟลป UP ล้อขึ้น (กวาดความเร็ว 72–100 KCAS)",
      "quantity": "VXSE = ความเร็วที่มุมไต่สูงสุด (KIAS)",
      "expected": 82,
      "tolerance": 5,
      "origin": "ค่าประมาณ (AFM NG ไม่ให้ค่า [LT8]; TDI 77 [LT16] + 5)",
      "current_model": "ซิม+wrapper 75.0 (γ 2.02°)",
      "pass": false,
      "note": "ค่าของซิมต่ำกว่า VMCA 76 KIAS จึงใช้สอนไม่ได้ ดู §06.12"
     },
     {
      "case": "T-LT-29",
      "conditions": "VMCA: มวลต่ำสุดในการบิน 1,510 kg CG หลังสุด 2.480 m DAT, เครื่องซ้ายดับ windmill, ขวา MAX, เอียง 5°, rudder ขวา 29°, แฟลป UP ล้อขึ้น",
      "quantity": "V_MCA (KCAS / KIAS ผ่านตาราง ias_cas)",
      "expected": 75,
      "tolerance": 5,
      "origin": "LT1 (75 KEAS), LT2 (76 KIAS), LT17 p.12-28 (มวลเบาและ CG หลังทำให้ VMC สูงขึ้น)",
      "current_model": "static 74.1 KCAS = 75.1 KIAS (ที่ 1,900 kg CG อ้างอิง 72.7 KCAS)",
      "pass": true,
      "note": "คำนวณซ้ำโดยผู้ตรวจจากค่าในบัตร (lt_review.mjs); ซิมปัจจุบันไม่มี OEI"
     },
     {
      "case": "T-LT-30",
      "conditions": "NG 1,900 kg, approach 84 KIAS ที่ 300 m ISA แฟลป LDG ล้อลง เส้นร่อน 3° (trim ของ lm_card), Cmα ของบัตร −0.535 [LT15]",
      "quantity": "ความถี่ธรรมชาติ short period ωn (rad/s)",
      "expected": 2.429,
      "tolerance": 0.24,
      "origin": "ประมาณ 2-DOF จากค่าในบัตร (Nelson; Cmq -19.38, Cmα̇ -4.307, Iyy 3576 kg m², ζ 0.729) ค่าประมาณ",
      "current_model": "2.407 (ζ 0.732)",
      "pass": true,
      "note": "ตรวจว่าโหมดของซิมตรงกับ Cmα บินทดสอบที่ใส่ในบัตร; DA42 ไม่มีโหมดที่วัดและเผยแพร่ (validation.reference_modes)"
     },
     {
      "case": "T-LT-31",
      "conditions": "NG 1,900 kg cruise 135 KIAS 6,000 ft ดึงคันใน turn หรือ pull-up (n/α 14.23 g/rad)",
      "quantity": "แรงที่ stick ต่อ g (lbf/g)",
      "expected": "10.7–20 (48–89 N/g)",
      "tolerance": 0,
      "origin": "MIL-F-8785C Level 1 centre stick [R1:C12] + 14 CFR 23.155 W/140 [LM3] (แถบเป้าหมายค่าประมาณ ไม่ใช่ค่าวัด)",
      "current_model": "ไม่รองรับในซิมวันนี้ (ไม่มีแบบจำลองแรงที่คัน)",
      "note": "ส่วนเผื่อ 0: ผ่านเมื่ออยู่ในช่วงปิด"
     },
     {
      "case": "T-LT-32",
      "conditions": "DA42-VI เครื่องซ้ายดับ feather ขวา MCP 114 kW แฟลป UP ล้อขึ้น ISA มวล 1,900 kg (มวลที่ 16,000 ft สอดคล้องกับ 210 fpm ของ NG, §06.4.1)",
      "quantity": "เพดาน OEI ที่ ROC 50 fpm (ft)",
      "expected": 16000,
      "tolerance": 1500,
      "origin": "LT6 p.19 (มวลไม่ระบุ) + LT10 (210 fpm)",
      "current_model": "ไม่รองรับในซิมวันนี้ (แบบจำลองวิเคราะห์ lt_oei_ceiling: 16170 ft ที่ 1,900 kg, 10200 ft ที่ 1,999 kg)",
      "note": "ต้องมีเครื่องยนต์หลายตัวและแรงขับตามความหนาแน่น (§06.14 P1, P2)"
     },
     {
      "case": "T-LT-33",
      "conditions": "NG มวลฝึก 1,752 kg แฟลป UP ปีกระดับ สองเครื่อง idle, ฟื้นจาก stall ตามวิธีมาตรฐาน (ลดมุมปะทะ เพิ่มกำลัง)",
      "quantity": "ความสูงที่เสีย (ft)",
      "expected": 280,
      "tolerance": 100,
      "origin": "ค่าคลาส ค่าประมาณ (C172S/C152/P2006T ÷ VS1², §06.6.5) ช่วงสัมประสิทธิ์ 180–350 ft",
      "current_model": "ไม่รองรับในซิมวันนี้ (ไม่มีนักบินอัตโนมัติสำหรับการฟื้นจาก stall)"
     }
    ],
    "u": "ตามช่อง quantity ของแต่ละแถว",
    "scope": "aircraft",
    "src": [
     "LT1",
     "LT2",
     "LT5",
     "LT6",
     "LT10",
     "LT16",
     "LM0"
    ],
    "conf": "กลาง",
    "est": false,
    "note": "จุดเป้าสำหรับทดสอบอัตโนมัติ 33 กรณี (ตาราง §06.11 สร้างจาก scripts/lt_tests.mjs) ผ่าน 28 กรณีกับซิมปัจจุบัน, ไม่รองรับในซิมวันนี้ 3 กรณี; แถวที่ expected มาจากการคำนวณระบุไว้ในช่อง origin"
   }
  }
 }
}
```

```json
{
 "da42ng": {
  "propulsion": {
   "layout": {
    "v": [
     {
      "id": 1,
      "side": "left",
      "pos": [
       1.47,
       -1.7,
       0.15
      ],
      "axis": [
       1,
       0,
       0
      ],
      "type": "piston",
      "model": "Austro E4-B (AE300) + MTV-6-R-C-F/CF187-129",
      "prop_sense": 1
     },
     {
      "id": 2,
      "side": "right",
      "pos": [
       1.47,
       1.7,
       0.15
      ],
      "axis": [
       1,
       0,
       0
      ],
      "type": "piston",
      "model": "Austro E4-B (AE300) + MTV-6-R-C-F/CF187-129",
      "prop_sense": 1
     }
    ],
    "u": "m FRD",
    "scope": "aircraft",
    "src": [
     "LT1",
     "LT2"
    ],
    "conf": "กลาง",
    "est": true,
    "note": "ใบพัดหมุน CW (มองจากหลัง) ทั้งสองข้าง [LT1 C.III.7] ⇒ เครื่องซ้ายเป็น critical engine [LT5 p.5-23]; ตำแหน่งดุมใบพัด (x 0.95 m DAT, y ±1.70 m, ต่ำกว่า CG 0.15 m) เป็นค่าประมาณ"
   },
   "critical_engine": {
    "v": "left",
    "u": "-",
    "scope": "aircraft",
    "src": [
     "LT5"
    ],
    "conf": "สูง",
    "est": false,
    "note": "AFM DA 42 p.5-23: \"left-hand engine is the critical engine\" (ทิศหมุนใบพัดเดียวกันใน NG [LT1])"
   },
   "legacy": {
    "v": {
     "P": 247000,
     "eta": 0.8823,
     "T0": 6356,
     "idle": 0
    },
    "u": "W, -, N, -",
    "scope": "aircraft",
    "src": [
     "LT10",
     "LM0"
    ],
    "conf": "ต่ำ",
    "est": true,
    "note": "ค่าประมาณ: T0 จาก BEM (สองเครื่อง), Vc ปรับให้ ROC สูงสุดของซิม = POH (da42ng); idle 0 เพราะ polar ไม่รวมแรงต้านใบพัด"
   }
  }
 }
}
```

```json
{
 "da42ng": {
  "piston": {
   "identity": {
    "v": {
     "model": "Austro Engine E4-B (AE300)",
     "kind": "turbo_diesel",
     "displacement_L": 1.991,
     "cylinders": 4,
     "tcds": "EASA TCDS E.200"
    },
    "u": "-",
    "scope": "engine",
    "src": [
     "LT12",
     "LT1"
    ],
    "conf": "สูง",
    "est": false,
    "note": "เกียร์ทด 1:1.69, มวลแห้ง 185 kg [LT12 p.5]; E4-C เมื่อทำ MÄM 42-600 [LT1]"
   },
   "ratings": {
    "v": {
     "P_rated": 123500,
     "rpm_rated": 2300,
     "P_mcp": 114000,
     "rpm_mcp": 2100,
     "rpm_redline": 2300,
     "rpm_overspeed": 2500,
     "overspeed_time_s": 20,
     "takeoff_time_limit_s": 300
    },
    "u": "W, rpm, s",
    "scope": "engine",
    "src": [
     "LT1",
     "LT2"
    ],
    "conf": "สูง",
    "est": false,
    "note": "Take-off 100 % = 123.5 kW (168 PS หรือ 166 hp แบบ SAE) 5 นาทีที่ 2,300 rpm ใบพัด; MCP 92 % = 114 kW ที่ 2,100 rpm [LT2 p.2-6][LT1 C.III.5]; รอบ idle ไม่พบ"
   },
   "altitude": {
    "v": {
     "model": "turbo_flat",
     "critical_alt_m": 4877,
     "note_power": "MCP"
    },
    "u": "-",
    "scope": "engine",
    "src": [
     "LT6"
    ],
    "conf": "ต่ำ",
    "est": true,
    "note": "ค่าประมาณ: โบรชัวร์ DA42-VI ให้ \"max cruise 16,000 ft, MCP\" จึงสันนิษฐานว่า MCP 92 % ยังได้ถึง 16,000 ft; กำลัง take-off ที่ความสูงไม่ทราบ; ตารางกำลังตามความสูงอยู่ใน AFM บทที่ 5"
   },
   "power_map": {
    "v": {
     "axes": {
      "load_pct": [
       0,
       60,
       75,
       92,
       100
      ]
     },
     "data": [
      0,
      74100,
      92625,
      113620,
      123500
     ]
    },
    "u": "W",
    "scope": "engine",
    "src": [
     "LT2"
    ],
    "conf": "กลาง",
    "est": false,
    "note": "FADEC: load % × 123.5 kW (เชิงเส้นตามนิยาม load ของ AE300)"
   },
   "fuel": {
    "v": {
     "fuel": "Jet A-1",
     "bsfc_g_per_kWh": {
      "60": 213,
      "92": 219,
      "100": 227
     },
     "density_kg_per_l": 0.8
    },
    "u": "g/kWh",
    "scope": "engine",
    "src": [
     "LM19",
     "LT10",
     "LT6"
    ],
    "conf": "กลาง",
    "est": false,
    "note": "ดู performance.fuel"
   },
   "dynamics": {
    "v": {
     "tau_throttle_s": 0.5,
     "I_engine": 0.3
    },
    "u": "s, kg m2",
    "scope": "engine",
    "src": [
     "LM19"
    ],
    "conf": "ต่ำ",
    "est": true,
    "note": "ค่าประมาณตาม §01.6.2 (FADEC + turbo lag); I_engine = ส่วนหมุนของเครื่องสะท้อนผ่านเกียร์ 1.69² (ไม่รวมใบพัด)"
   },
   "fadec": {
    "v": {
     "lever_to_load": "load % = ตำแหน่งคันเร่ง 0–100 %",
     "feather": "ENGINE MASTER OFF → ใบพัด feather"
    },
    "u": "-",
    "scope": "engine",
    "src": [
     "LT2",
     "LT8"
    ],
    "conf": "กลาง",
    "est": false,
    "note": "ตาราง load → rpm ไม่พบใน AFM ที่เปิดได้ (MCP 92 % ที่ 2,100 rpm, take-off 100 % ที่ 2,300 rpm [LT2]); การดับเครื่องด้วย ENGINE MASTER ทำให้ใบพัด feather [LT8 §3.1.5.4]"
   }
  }
 }
}
```

```json
{
 "da42ng": {
  "propeller": {
   "identity": {
    "kind": {
     "v": "constant_speed_feathering",
     "u": "-",
     "scope": "propeller",
     "src": [
      "LT1"
     ],
     "conf": "สูง",
     "est": false,
     "note": "feather 81°, low pitch 12°, start lock 15° ที่ 0.75R [LT1][LT2 p.2-9]"
    },
    "model": {
     "v": "mt-Propeller MTV-6-R-C-F/CF187-129",
     "u": "-",
     "scope": "propeller",
     "src": [
      "LT1",
      "LT2"
     ],
     "conf": "สูง",
     "est": false,
     "note": "EASA TCDS P.094 [LT14]; DA42-VI: MTV-6-R-C-F/CF190-69"
    },
    "nBlades": {
     "v": 3,
     "u": "-",
     "scope": "propeller",
     "src": [
      "LT1"
     ],
     "conf": "สูง",
     "est": false,
     "note": ""
    },
    "diameter": {
     "v": 1.87,
     "u": "m",
     "scope": "propeller",
     "src": [
      "LT1",
      "LT2"
     ],
     "conf": "สูง",
     "est": false,
     "note": "187 cm"
    },
    "sense": {
     "v": 1,
     "u": "-",
     "scope": "propeller",
     "src": [
      "LT1"
     ],
     "conf": "สูง",
     "est": false,
     "note": "CW มองจากหลังทั้งสองเครื่อง (ไม่ใช่ counter-rotating)"
    },
    "massComplete": {
     "v": 17.5,
     "u": "kg",
     "scope": "propeller",
     "src": [
      "LT14"
     ],
     "conf": "กลาง",
     "est": false,
     "note": "TCDS P.094 Issue 04 ให้มวลโดยประมาณ 17.5 kg สำหรับแบบ constant speed + feather (ไม่ขึ้นกับเส้นผ่านศูนย์กลาง) [LT14]; ผู้ตรวจแก้จาก 14 kg"
    },
    "hubPosition": {
     "v": [
      [
       1.47,
       -1.7,
       0.15
      ],
      [
       1.47,
       1.7,
       0.15
      ]
     ],
     "u": "m FRD",
     "scope": "propeller",
     "src": [
      "LT2"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: ซ้าย, ขวา = propulsion.layout (ดุมที่ x 0.95 m DAT, y ±1.70 m, ต่ำกว่า CG 0.15 m จากภาพสามด้าน)"
    },
    "thrustAxis": {
     "v": [
      1,
      0,
      0
     ],
     "u": "-",
     "scope": "propeller",
     "src": [
      "LT2"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: ไม่พบมุม toe/tilt ของเครื่องยนต์"
    }
   },
   "engineInterface": {
    "maxShaftPower": {
     "v": 123.5,
     "u": "kW",
     "scope": "propeller",
     "src": [
      "LT1"
     ],
     "conf": "สูง",
     "est": false,
     "note": "ต่อเครื่อง (5 นาที)"
    },
    "rpmGoverned": {
     "v": 2300,
     "u": "rpm",
     "scope": "propeller",
     "src": [
      "LT1",
      "LT2"
     ],
     "conf": "สูง",
     "est": false,
     "note": "take-off; MCP 2,100 rpm"
    },
    "rpmTransientLimit": {
     "v": 2500,
     "u": "rpm",
     "scope": "propeller",
     "src": [
      "LT2"
     ],
     "conf": "สูง",
     "est": false,
     "note": "overspeed สูงสุด 20 s [LT2 p.2-6]"
    },
    "gearRatio": {
     "v": 1.69,
     "u": "-",
     "scope": "propeller",
     "src": [
      "LT12"
     ],
     "conf": "สูง",
     "est": false,
     "note": "เพลาข้อเหวี่ยง 3,880 rpm : ใบพัด 2,300 rpm"
    }
   },
   "bladeGeometry": {
    "hubRadiusRatio": {
     "v": 0.18,
     "u": "r/R",
     "scope": "propeller",
     "src": [
      "LM0",
      "LM24"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ lm_prop cs3"
    },
    "chordOverD": {
     "v": {
      "axes": {
       "x": [
        0.15,
        0.25,
        0.35,
        0.45,
        0.6,
        0.75,
        0.85,
        0.93,
        1
       ]
      },
      "data": [
       0.0361,
       0.0433,
       0.0491,
       0.052,
       0.0527,
       0.0491,
       0.0433,
       0.0361,
       0.0231
      ]
     },
     "u": "c/D",
     "scope": "propeller",
     "src": [
      "LM0",
      "LM24"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ lm_prop cs3 (×0.85 ของแบบ 2 ใบ)"
    },
    "twistDesignJ": {
     "v": 0.95,
     "u": "-",
     "scope": "propeller",
     "src": [
      "LM0",
      "LM24"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: helical twist ที่ J 0.95"
    },
    "activityFactor": {
     "v": 77,
     "u": "-",
     "scope": "propeller",
     "src": [
      "LM0",
      "LM24"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณจาก chordOverD (AF = 10⁵/16 ∫ c/D x³ dx)"
    }
   },
   "section": {
    "liftSlope": {
     "v": 5.65,
     "u": "1/rad",
     "scope": "propeller",
     "src": [
      "LM0",
      "LM24"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: 0.9 × 2π"
    },
    "alpha0": {
     "v": -3,
     "u": "deg",
     "scope": "propeller",
     "src": [
      "LM0",
      "LM24"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: ค่าเริ่มต้น lm_prop สำหรับ section ใบพัด Clark-Y/ARA-D (MT ไม่เผยแพร่ section)"
    },
    "alphaStallPos": {
     "v": 14,
     "u": "deg",
     "scope": "propeller",
     "src": [
      "LM0",
      "LM24"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: ค่าเริ่มต้น lm_prop"
    },
    "alphaStallNeg": {
     "v": -10,
     "u": "deg",
     "scope": "propeller",
     "src": [
      "LM0",
      "LM24"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: ค่าเริ่มต้น lm_prop"
    },
    "stallBlendM": {
     "v": 25,
     "u": "1/rad",
     "scope": "propeller",
     "src": [
      "LM0",
      "LM24"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: ค่าเริ่มต้น lm_prop (Beard–McLain)"
    },
    "cd0": {
     "v": 0.01,
     "u": "-",
     "scope": "propeller",
     "src": [
      "LM0",
      "LM24"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: ค่าเริ่มต้น lm_prop (ใบไม้คอมโพสิตผิวเรียบ)"
    },
    "kcd": {
     "v": 0.012,
     "u": "-",
     "scope": "propeller",
     "src": [
      "LM0",
      "LM24"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: ค่าเริ่มต้น lm_prop: cd = cd0 + kcd (α − α_cdmin)²"
    },
    "Mdd": {
     "v": 0.78,
     "u": "-",
     "scope": "propeller",
     "src": [
      "LM0",
      "LM24"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: ค่าเริ่มต้น lm_prop (ปลายใบ 1.87 m ที่ 2,300 rpm M ≈ 0.66 ต่ำกว่า Mdd)"
    },
    "stallDelayFactor": {
     "v": 3,
     "u": "-",
     "scope": "propeller",
     "src": [
      "LM0",
      "LM24"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: ตัวคูณ stall delay แบบ Snel ค่าเริ่มต้นของ lm_prop"
    }
   },
   "tables": {
    "CT": {
     "v": {
      "axes": {
       "J": [
        0,
        0.2,
        0.4,
        0.6,
        0.8,
        1,
        1.2,
        1.4,
        1.6,
        1.8,
        2
       ],
       "beta75_deg": [
        10,
        15,
        20,
        25,
        30,
        35,
        40
       ]
      },
      "data": [
       [
        0.0941,
        0.128,
        0.146,
        0.129,
        0.0988,
        0.0926,
        0.0851
       ],
       [
        0.071,
        0.111,
        0.144,
        0.149,
        0.114,
        0.097,
        0.0907
       ],
       [
        0.0357,
        0.081,
        0.125,
        0.156,
        0.146,
        0.108,
        0.0986
       ],
       [
        -0.00849,
        0.04,
        0.0898,
        0.137,
        0.167,
        0.136,
        0.107
       ],
       [
        -0.0565,
        -0.00729,
        0.0465,
        0.1,
        0.15,
        0.176,
        0.126
       ],
       [
        -0.0927,
        -0.057,
        -0.00173,
        0.0568,
        0.114,
        0.165,
        0.18
       ],
       [
        -0.112,
        -0.0962,
        -0.0521,
        0.00917,
        0.0722,
        0.132,
        0.182
       ],
       [
        -0.14,
        -0.119,
        -0.0954,
        -0.041,
        0.0264,
        0.0936,
        0.156
       ],
       [
        -0.177,
        -0.144,
        -0.123,
        -0.0879,
        -0.0223,
        0.0509,
        0.122
       ],
       [
        -0.219,
        -0.179,
        -0.147,
        -0.123,
        -0.0713,
        0.00498,
        0.0834
       ],
       [
        -0.265,
        -0.22,
        -0.178,
        -0.149,
        -0.114,
        -0.0433,
        0.0416
       ]
      ]
     },
     "u": "-",
     "scope": "propeller",
     "src": [
      "LM0",
      "LM24"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ BEM (lm_prop) D 1.87 m 2,300 rpm SL"
    },
    "CP": {
     "v": {
      "axes": {
       "J": [
        0,
        0.2,
        0.4,
        0.6,
        0.8,
        1,
        1.2,
        1.4,
        1.6,
        1.8,
        2
       ],
       "beta75_deg": [
        10,
        15,
        20,
        25,
        30,
        35,
        40
       ]
      },
      "data": [
       [
        0.03,
        0.05,
        0.0711,
        0.0869,
        0.106,
        0.134,
        0.162
       ],
       [
        0.0288,
        0.0517,
        0.078,
        0.099,
        0.11,
        0.135,
        0.165
       ],
       [
        0.0201,
        0.0465,
        0.0794,
        0.112,
        0.127,
        0.136,
        0.166
       ],
       [
        -0.000209,
        0.0296,
        0.0686,
        0.113,
        0.152,
        0.154,
        0.167
       ],
       [
        -0.0327,
        -0.00125,
        0.0435,
        0.0969,
        0.155,
        0.197,
        0.18
       ],
       [
        -0.0614,
        -0.0451,
        0.00292,
        0.0647,
        0.135,
        0.206,
        0.243
       ],
       [
        -0.0699,
        -0.0849,
        -0.0515,
        0.0162,
        0.0976,
        0.186,
        0.27
       ],
       [
        -0.0852,
        -0.102,
        -0.105,
        -0.0475,
        0.0435,
        0.147,
        0.255
       ],
       [
        -0.112,
        -0.12,
        -0.137,
        -0.116,
        -0.027,
        0.0911,
        0.22
       ],
       [
        -0.146,
        -0.15,
        -0.158,
        -0.169,
        -0.109,
        0.0175,
        0.166
       ],
       [
        -0.188,
        -0.191,
        -0.19,
        -0.202,
        -0.187,
        -0.0722,
        0.0946
       ]
      ]
     },
     "u": "-",
     "scope": "propeller",
     "src": [
      "LM0",
      "LM24"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ BEM (lm_prop)"
    }
   },
   "inertia": {
    "Ip": {
     "v": 1.7,
     "u": "kg m2",
     "scope": "propeller",
     "src": [
      "LT14"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: 3 ใบ composite ~4 kg ที่รัศมีไจเรชัน ~0.35 m + ดุม"
    },
    "IreflectedEngine": {
     "v": 0.3,
     "u": "kg m2",
     "scope": "propeller",
     "src": [
      "LT12"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ ส่วนหมุนเครื่องผ่านเกียร์ 1.69²"
    }
   },
   "governor": {
    "kGov": {
     "v": 1,
     "u": "deg/s per rpm",
     "scope": "propeller",
     "src": [
      "LT20"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: ยกค่าของเครื่องฝึกรอบที่ 1 (params-trainer.json [LT20]) มาใช้ เพราะไม่พบข้อมูลของ DA42"
    },
    "pitchRateMax": {
     "v": 10,
     "u": "deg/s",
     "scope": "propeller",
     "src": [
      "LT20"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ (ดุมไฮดรอลิก MT ช้ากว่าเทอร์โบพร็อป)"
    },
    "rpmOverspeed": {
     "v": 2500,
     "u": "rpm",
     "scope": "propeller",
     "src": [
      "LT2"
     ],
     "conf": "สูง",
     "est": false,
     "note": "20 s"
    },
    "oilMinRpm": {
     "v": 1300,
     "u": "rpm",
     "scope": "propeller",
     "src": [
      "LT9"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "start-lock latch ทำงานที่ ~1,300 rpm [LT9]; ใช้เป็นรอบต่ำสุดที่ governor ยังคุมได้ (ค่าประมาณ)"
    },
    "betaFlightIdle": {
     "v": 12,
     "u": "deg @0.75R",
     "scope": "propeller",
     "src": [
      "LT1",
      "LT2"
     ],
     "conf": "สูง",
     "est": false,
     "note": "low pitch stop (MÄM 42-600: 13°)"
    },
    "betaFeather": {
     "v": 81,
     "u": "deg @0.75R",
     "scope": "propeller",
     "src": [
      "LT1",
      "LT2"
     ],
     "conf": "สูง",
     "est": false,
     "note": "±1° (MÄM 42-600: 80°)"
    },
    "featherRate": {
     "v": 8,
     "u": "deg/s",
     "scope": "propeller",
     "src": [
      "LT2"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ (ไม่พบเวลา feather ในเอกสารที่เปิดได้): 8 °/s ให้ใบพัดไปจาก low pitch 12° ถึง feather 81° ในราว 9 s"
    },
    "betaStartLock": {
     "v": 15,
     "u": "deg @0.75R",
     "scope": "propeller",
     "src": [
      "LT1",
      "LT2"
     ],
     "conf": "สูง",
     "est": false,
     "note": "±1°"
    }
   },
   "feathered": {
    "bladePlanformArea": {
     "v": 0.23,
     "u": "m2",
     "scope": "propeller",
     "src": [
      "LM0",
      "LM24"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: solidity 0.0837 × พื้นที่จาน 2.746 m²"
    },
    "CDfeathered": {
     "v": 0.1,
     "u": "-",
     "scope": "propeller",
     "src": [
      "LM12"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณตาม Raymer: D/q ≈ 0.1 σ A (feather) = 0.023 m² (ΔCD 0.00141 ต่อเครื่องบนพื้นที่ปีก); windmilling ≈ 0.8 σ A = 0.184 m²"
    }
   },
   "checks": {
    "staticThrustISA": {
     "v": 3.18,
     "u": "kN",
     "scope": "propeller",
     "src": [
      "LM0",
      "LM24"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: ต่อเครื่อง BEM 123.5 kW 2,300 rpm β75 22° FM 0.559"
    },
    "staticThrustVTBD31C": {
     "v": 3.12,
     "u": "kN",
     "scope": "propeller",
     "src": [
      "LM0",
      "LM24"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ ρ^(1/3) ที่กำลังคงที่ (turbo รักษากำลัง)"
    },
    "momentumIdealStaticISA": {
     "v": 4.68,
     "u": "kN",
     "scope": "propeller",
     "src": [
      "LT20"
     ],
     "conf": "สูง",
     "est": false,
     "note": "ทฤษฎีโมเมนตัม FM = 1"
    },
    "peakEfficiency": {
     "v": 0.89,
     "u": "-",
     "scope": "propeller",
     "src": [
      "LM0",
      "LM24"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: BEM ที่ ~175 KTAS"
    }
   }
  }
 }
}
```

```json
{
 "da42ng": {
  "controls": {
   "architecture": {
    "v": {
     "pitch": "reversible",
     "roll": "reversible",
     "yaw": "reversible",
     "trim": "tab"
    },
    "u": "-",
    "scope": "aircraft",
    "src": [
     "LT5"
    ],
    "conf": "สูง",
    "est": false,
    "note": "aileron, elevator, แฟลป ผ่าน push rod; rudder ผ่านสายเคเบิล; trim tab ผ่าน Bowden cable [LT5 p.7-4]"
   },
   "surfaces": {
    "elevator": {
     "v": {
      "travel_deg": {
       "up": 15.5,
       "down": 13
      },
      "variable_stop_up_deg": 13
     },
     "u": "deg",
     "scope": "aircraft",
     "src": [
      "LT1",
      "LT4",
      "LT9"
     ],
     "conf": "สูง",
     "est": false,
     "note": "TCDS up 15.5 ± 0.5°, down 13 ± 1° [LT1]; variable elevator stop (ไฟฟ้า) จำกัดการเชิดที่กำลังสูงเพื่อผ่านเกณฑ์ stall [LT4 p.5] เหลือ ~13° [LT9]"
    },
    "aileron": {
     "v": {
      "travel_deg": {
       "up": 25,
       "down": 15
      }
     },
     "u": "deg",
     "scope": "aircraft",
     "src": [
      "LT1"
     ],
     "conf": "สูง",
     "est": false,
     "note": "up 25 ± 2°, down 15 +2/−0° [LT1]"
    },
    "rudder": {
     "v": {
      "travel_deg": {
       "left": 27,
       "right": 29
      }
     },
     "u": "deg",
     "scope": "aircraft",
     "src": [
      "LT1"
     ],
     "conf": "สูง",
     "est": false,
     "note": "±1° [LT1]; ซิมวันนี้ใช้ค่าสมมาตร min = 27°"
    },
    "flap": {
     "v": {
      "travel_deg": {
       "APP": 20,
       "LDG": 42
      }
     },
     "u": "deg",
     "scope": "aircraft",
     "src": [
      "LT1"
     ],
     "conf": "สูง",
     "est": false,
     "note": "APP 20 +4/−2°, LDG 42 +3/−1° [LT1]"
    },
    "trim_tab": {
     "v": {
      "elevator": {
       "nose_up": 28,
       "nose_down": 25
      },
      "rudder": {
       "right": 45,
       "left": 41
      }
     },
     "u": "deg",
     "scope": "aircraft",
     "src": [
      "LT1"
     ],
     "conf": "สูง",
     "est": false,
     "note": "±5° / ±3° [LT1 C.III.16]; DA 42 รุ่นแรก elevator tab NU 58° และ rudder tab 30/29° [LT1 A.III.16]"
    }
   },
   "trim": {
    "v": {
     "elevator": "ล้อ trim ด้วยมือ (tab)",
     "rudder": "ปุ่ม/ล้อ trim rudder (tab) สำคัญมากเมื่อ OEI",
     "aileron": "ไม่มี"
    },
    "u": "-",
    "scope": "aircraft",
    "src": [
     "LT5",
     "LT1"
    ],
    "conf": "กลาง",
    "est": false,
    "note": "ช่วงมุม tab ดู surfaces.trim_tab"
   },
   "pitch": {
    "architecture": {
     "v": {
      "kind": "reversible",
      "input": "force"
     },
     "u": "-",
     "scope": "aircraft",
     "src": [
      "LT5"
     ],
     "conf": "สูง",
     "est": false,
     "note": "push rod"
    },
    "S_e": {
     "v": 0.66,
     "u": "m2",
     "scope": "aircraft",
     "src": [
      "LT2"
     ],
     "conf": "สูง",
     "est": false,
     "note": ""
    },
    "c_e": {
     "v": 0.2,
     "u": "m",
     "scope": "aircraft",
     "src": [
      "LT2"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ 0.66 m² / ช่วงหาง 3.29 m"
    },
    "gearing": {
     "v": 2,
     "u": "rad/m",
     "scope": "aircraft",
     "src": [
      "LT20"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: elevator 28.5° ตลอดช่วงคัน ~0.25 m"
    },
    "eta_t": {
     "v": 0.95,
     "u": "-",
     "scope": "aircraft",
     "src": [
      "LM10"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: หาง T อยู่นอก wake และนอก slipstream ของเครื่องบนปีก"
    },
    "a_t": {
     "v": 4.05,
     "u": "1/rad",
     "scope": "aircraft",
     "src": [
      "LM10"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: Helmbold, A_h 4.6 (lm_derivs)"
    },
    "tau_e": {
     "v": 0.562,
     "u": "-",
     "scope": "aircraft",
     "src": [
      "LM10"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: จาก chord ratio elevator 0.28 (0.66/2.35 m²) ตาม DATCOM ใน lm_derivs"
    },
    "l_t": {
     "v": 5.085,
     "u": "m",
     "scope": "aircraft",
     "src": [
      "LT1"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: เท่ากับ airframe.tail.l_h"
    },
    "deda": {
     "v": 0.247,
     "u": "-",
     "scope": "aircraft",
     "src": [
      "LM10"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: สูตร DATCOM ของ lm_derivs กับหาง T สูง 1.75 m เหนือปีก"
    },
    "Ch0": {
     "v": 0,
     "u": "-",
     "scope": "aircraft",
     "src": [
      "LT20"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: ยกค่าของเครื่องฝึกรอบที่ 1 (params-trainer.json [LT20]) มาใช้ เพราะไม่พบข้อมูลของ DA42"
    },
    "Ch_alpha": {
     "v": -0.1146,
     "u": "1/rad",
     "scope": "aircraft",
     "src": [
      "LT20"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: ยกค่าของเครื่องฝึกรอบที่ 1 (params-trainer.json [LT20]) มาใช้ เพราะไม่พบข้อมูลของ DA42"
    },
    "Ch_delta": {
     "v": -0.3438,
     "u": "1/rad",
     "scope": "aircraft",
     "src": [
      "LT20"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: ยกค่าของเครื่องฝึกรอบที่ 1 (params-trainer.json [LT20]) มาใช้ เพราะไม่พบข้อมูลของ DA42"
    },
    "Ch_tab": {
     "v": -0.2005,
     "u": "1/rad",
     "scope": "aircraft",
     "src": [
      "LT20"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: ยกค่าของเครื่องฝึกรอบที่ 1 (params-trainer.json [LT20]) มาใช้ เพราะไม่พบข้อมูลของ DA42"
    },
    "tab_max": {
     "v": 28,
     "u": "deg",
     "scope": "aircraft",
     "src": [
      "LT1"
     ],
     "conf": "สูง",
     "est": false,
     "note": "NU 28°, ND 25°"
    },
    "trim_rate_flaps_down": {
     "v": 2,
     "u": "deg/s",
     "scope": "aircraft",
     "src": [
      "LT20"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณอัตรา tab เทียบเท่าของล้อ trim มือ (คีย์บอร์ดซิม)"
    },
    "trim_rate_flaps_up": {
     "v": 2,
     "u": "deg/s",
     "scope": "aircraft",
     "src": [
      "LT20"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: เท่ากับ trim_rate_flaps_down (อัตรา tab เทียบเท่าของล้อ trim มือเมื่อกดคีย์ค้างในซิม)"
    },
    "breakout": {
     "v": 4.45,
     "u": "N",
     "scope": "aircraft",
     "src": [
      "LT20"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: ยกค่าของเครื่องฝึกรอบที่ 1 (params-trainer.json [LT20]) มาใช้ เพราะไม่พบข้อมูลของ DA42"
    },
    "friction": {
     "v": 4.45,
     "u": "N",
     "scope": "aircraft",
     "src": [
      "LT20"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: ยกค่าของเครื่องฝึกรอบที่ 1 (params-trainer.json [LT20]) มาใช้ เพราะไม่พบข้อมูลของ DA42"
    },
    "centring_spring": {
     "v": {
      "Kc": 60,
      "qFade": 400
     },
     "u": "N/rad, Pa",
     "scope": "aircraft",
     "src": [
      "LT20"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: ยกค่าของเครื่องฝึกรอบที่ 1 (params-trainer.json [LT20]) มาใช้ เพราะไม่พบข้อมูลของ DA42"
    },
    "stops": {
     "v": {
      "teu": 15.5,
      "ted": 13,
      "teu_power_limited": 13
     },
     "u": "deg",
     "scope": "aircraft",
     "src": [
      "LT1",
      "LT9"
     ],
     "conf": "สูง",
     "est": false,
     "note": "TCDS; variable elevator stop ~13° ที่กำลังสูง"
    },
    "rate_limit": {
     "v": 70,
     "u": "deg/s",
     "scope": "aircraft",
     "src": [
      "LT20"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: ยกค่าของเครื่องฝึกรอบที่ 1 (params-trainer.json [LT20]) มาใช้ เพราะไม่พบข้อมูลของ DA42"
    }
   },
   "roll": {
    "architecture": {
     "v": {
      "kind": "reversible",
      "input": "force"
     },
     "u": "-",
     "scope": "aircraft",
     "src": [
      "LT5"
     ],
     "conf": "สูง",
     "est": false,
     "note": "push rod"
    },
    "S_a_each": {
     "v": 0.33,
     "u": "m2",
     "scope": "aircraft",
     "src": [
      "LT2"
     ],
     "conf": "สูง",
     "est": false,
     "note": "ครึ่งหนึ่งของ 0.66 m²"
    },
    "c_a": {
     "v": 0.22,
     "u": "m",
     "scope": "aircraft",
     "src": [
      "LT2"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: chord ratio 0.25 × คอร์ดเฉลี่ย ~0.89 m ในช่วง 75–97 % ของครึ่งปีกเรียวเทียบเท่า (lt_geom.mjs)"
    },
    "gearing": {
     "v": 3.5,
     "u": "rad/m",
     "scope": "aircraft",
     "src": [
      "LT20"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: aileron เฉลี่ย 20° (0.349 rad) ต่อการเลื่อนคัน ~0.10 m (รอบที่ 1 ใช้ ±90 mm [LT20])"
    },
    "Ch_delta": {
     "v": -0.1719,
     "u": "1/rad",
     "scope": "aircraft",
     "src": [
      "LT20"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: ยกค่าของเครื่องฝึกรอบที่ 1 (params-trainer.json [LT20]) มาใช้ เพราะไม่พบข้อมูลของ DA42"
    },
    "Ch_alpha": {
     "v": -0.0573,
     "u": "1/rad",
     "scope": "aircraft",
     "src": [
      "LT20"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: ยกค่าของเครื่องฝึกรอบที่ 1 (params-trainer.json [LT20]) มาใช้ เพราะไม่พบข้อมูลของ DA42"
    },
    "breakout": {
     "v": 3,
     "u": "N",
     "scope": "aircraft",
     "src": [
      "LT20"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: ยกค่าของเครื่องฝึกรอบที่ 1 (params-trainer.json [LT20]) มาใช้ เพราะไม่พบข้อมูลของ DA42"
    },
    "stops": {
     "v": {
      "up": 25,
      "down": 15,
      "mean": 20
     },
     "u": "deg",
     "scope": "aircraft",
     "src": [
      "LT1"
     ],
     "conf": "สูง",
     "est": false,
     "note": "TCDS"
    },
    "rate_limit": {
     "v": 80,
     "u": "deg/s",
     "scope": "aircraft",
     "src": [
      "LT20"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: ยกค่าของเครื่องฝึกรอบที่ 1 (params-trainer.json [LT20]) มาใช้ เพราะไม่พบข้อมูลของ DA42"
    }
   },
   "yaw": {
    "architecture": {
     "v": {
      "kind": "reversible",
      "input": "force"
     },
     "u": "-",
     "scope": "aircraft",
     "src": [
      "LT5"
     ],
     "conf": "สูง",
     "est": false,
     "note": "สายเคเบิล"
    },
    "S_r": {
     "v": 0.78,
     "u": "m2",
     "scope": "aircraft",
     "src": [
      "LT2"
     ],
     "conf": "สูง",
     "est": false,
     "note": ""
    },
    "c_r": {
     "v": 0.45,
     "u": "m",
     "scope": "aircraft",
     "src": [
      "LT2"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: พื้นที่ rudder 0.78 m² [LT2] ÷ ความสูง rudder ~1.7 m (ภาพด้านข้าง)"
    },
    "gearing": {
     "v": 4.85,
     "u": "rad/m",
     "scope": "aircraft",
     "src": [
      "LT20"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: ยกค่าของเครื่องฝึกรอบที่ 1 (params-trainer.json [LT20]) มาใช้ เพราะไม่พบข้อมูลของ DA42"
    },
    "Ch_delta": {
     "v": -0.3438,
     "u": "1/rad",
     "scope": "aircraft",
     "src": [
      "LT20"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: ยกค่าของเครื่องฝึกรอบที่ 1 (params-trainer.json [LT20]) มาใช้ เพราะไม่พบข้อมูลของ DA42"
    },
    "Ch_beta": {
     "v": -0.1146,
     "u": "1/rad",
     "scope": "aircraft",
     "src": [
      "LT20"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: ยกค่าของเครื่องฝึกรอบที่ 1 (params-trainer.json [LT20]) มาใช้ เพราะไม่พบข้อมูลของ DA42"
    },
    "slipstream_q_ratio": {
     "v": [
      1,
      1
     ],
     "u": "-",
     "scope": "aircraft",
     "src": [
      "LT2"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: เครื่องอยู่บนปีก ครีบไม่อยู่ใน slipstream"
    },
    "tab_max": {
     "v": 45,
     "u": "deg",
     "scope": "aircraft",
     "src": [
      "LT1"
     ],
     "conf": "สูง",
     "est": false,
     "note": "rudder trim RH 45° / LH 41°"
    },
    "trim_rate": {
     "v": 3,
     "u": "deg/s",
     "scope": "aircraft",
     "src": [
      "LT20"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: อัตราเทียบเท่าของล้อ trim rudder ให้ tab ถึง 45° ในราว 15 s เมื่อกดคีย์ค้างในซิม"
    },
    "breakout": {
     "v": 13.3,
     "u": "N",
     "scope": "aircraft",
     "src": [
      "LT20"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: ยกค่าของเครื่องฝึกรอบที่ 1 (params-trainer.json [LT20]) มาใช้ เพราะไม่พบข้อมูลของ DA42"
    },
    "stops": {
     "v": {
      "left": 27,
      "right": 29
     },
     "u": "deg",
     "scope": "aircraft",
     "src": [
      "LT1"
     ],
     "conf": "สูง",
     "est": false,
     "note": "TCDS"
    },
    "rate_limit": {
     "v": 60,
     "u": "deg/s",
     "scope": "aircraft",
     "src": [
      "LT20"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: ยกค่าของเครื่องฝึกรอบที่ 1 (params-trainer.json [LT20]) มาใช้ เพราะไม่พบข้อมูลของ DA42"
    }
   }
  }
 }
}
```

```json
{
 "da42ng": {
  "gear": {
   "layout": {
    "v": "tricycle_retract",
    "u": "-",
    "scope": "gear",
    "src": [
     "LT5"
    ],
    "conf": "สูง",
    "est": false,
    "note": "ไฮดรอลิก (ปั๊มไฟฟ้า + accumulator); ล้อหลักพับเข้าใน center wing ล้อหน้าพับไปข้างหน้า [LT5 p.7-14]"
   },
   "retract": {
    "v": {
     "time_s": 8,
     "time_range_s": [
      6,
      10
     ],
     "VLO_kt": {
      "extend": 188,
      "retract": 152
     },
     "VLE_kt": 188,
     "emergency": "ปล่อยแรงดัน ล้อลงด้วยแรงโน้มถ่วง ≤152 KIAS"
    },
    "u": "s, kt IAS",
    "scope": "gear",
    "src": [
     "LT5",
     "LT2",
     "LT9"
    ],
    "conf": "กลาง",
    "est": true,
    "note": "ค่าประมาณเฉพาะเวลาเก็บล้อ: AFM ให้เวลาลงล้อ 6–10 s [LT5 p.7-14][LT9] แต่ไม่ระบุเวลาเก็บล้อ จึงใช้ 8 s (กลางช่วงเวลาลงล้อ); ความเร็ว VLO/VLE จาก AFM [LT2]"
   },
   "geometry": {
    "nose_contact_body_extended": {
     "v": [
      1.41,
      0,
      1.05
     ],
     "u": "m FRD",
     "scope": "gear",
     "src": [
      "LT2"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: ล้อหลักที่ 2.75 m DAT, wheelbase 1.735 m [LT2]; สูง CG ~1 m"
    },
    "main_contact_body_extended": {
     "v": [
      [
       -0.326,
       -1.475,
       1.08
      ],
      [
       -0.326,
       1.475,
       1.08
      ]
     ],
     "u": "m FRD",
     "scope": "gear",
     "src": [
      "LT2"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "track 2.95 m [LT2]; x และ z ค่าประมาณ"
    },
    "cg_height_parked": {
     "v": 1,
     "u": "m",
     "scope": "gear",
     "src": [
      "LT1"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณจากภาพด้านข้างของเครื่องปีกต่ำ (ไม่มีแบบเผยแพร่); ใช้คำนวณมุม tip-back ≈ 17° ใน §06.8"
    }
   },
   "strut_main": {
    "kind": {
     "v": "trailing_link_oleo",
     "u": "-",
     "scope": "gear",
     "src": [
      "LT5"
     ],
     "conf": "กลาง",
     "est": true,
     "note": "AFM: struts เป็น \"air-oil assemblies\" [LT5 p.7-14]; รูปแบบ trailing link อ่านจากภาพเครื่อง (ค่าประมาณ)"
    },
    "stroke": {
     "v": 0.15,
     "u": "m",
     "scope": "gear",
     "src": [
      "LT20"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: ราว 60 % ของระยะยุบล้อหลักของเครื่องฝึกรอบที่ 1 (0.25 m [LT20]) ตามมวลที่เบากว่า วัดที่ล้อ"
    },
    "p_static": {
     "v": 250,
     "u": "psi",
     "scope": "gear",
     "src": [
      "LT20"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: แรงดันสถิตทั่วไปของ oleo เครื่องเบา (รอบที่ 1 ใช้ 300 psi [LT20]); piston_area คิดจากแรงสถิต ÷ ค่านี้ จึงไม่เปลี่ยนแรงสถิต"
    },
    "piston_area": {
     "v": 0.00456,
     "u": "m2",
     "scope": "gear",
     "src": [
      "LT20"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณเทียบเท่าที่ล้อ: แรงสถิต 7867 N/ล้อ ที่ MTOM CG หลัง ÷ p_static"
    },
    "ratio_static_to_extended": {
     "v": 2.5,
     "u": "-",
     "scope": "gear",
     "src": [
      "LT20"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: ยกค่าของเครื่องฝึกรอบที่ 1 (params-trainer.json [LT20]) มาใช้ เพราะไม่พบข้อมูลของ DA42"
    },
    "ratio_compressed_to_extended": {
     "v": 8,
     "u": "-",
     "scope": "gear",
     "src": [
      "LT20"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: ยกค่าของเครื่องฝึกรอบที่ 1 (params-trainer.json [LT20]) มาใช้ เพราะไม่พบข้อมูลของ DA42"
    },
    "polytropic_n_dynamic": {
     "v": 1.12,
     "u": "-",
     "scope": "gear",
     "src": [
      "LT20"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: ยกค่าของเครื่องฝึกรอบที่ 1 (params-trainer.json [LT20]) มาใช้ เพราะไม่พบข้อมูลของ DA42"
    },
    "polytropic_n_static": {
     "v": 1,
     "u": "-",
     "scope": "gear",
     "src": [
      "LT20"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: ยกค่าของเครื่องฝึกรอบที่ 1 (params-trainer.json [LT20]) มาใช้ เพราะไม่พบข้อมูลของ DA42"
    },
    "Kh_compression": {
     "v": 3278,
     "u": "N/(m/s)^2",
     "scope": "gear",
     "src": [
      "LT20"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: สเกลค่ารอบที่ 1 [LT20] ด้วยอัตราส่วนแรงสถิตต่อล้อของ DA42 ต่อของเครื่องฝึกรอบที่ 1"
    },
    "Kr_rebound": {
     "v": 39333,
     "u": "N/(m/s)^2",
     "scope": "gear",
     "src": [
      "LT20"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: สเกลค่ารอบที่ 1 [LT20] ด้วยอัตราส่วนแรงสถิตต่อล้อของ DA42 ต่อของเครื่องฝึกรอบที่ 1"
    },
    "c_linear": {
     "v": 1639,
     "u": "N s/m",
     "scope": "gear",
     "src": [
      "LT20"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: สเกลค่ารอบที่ 1 [LT20] ด้วยอัตราส่วนแรงสถิตต่อล้อของ DA42 ต่อของเครื่องฝึกรอบที่ 1"
    },
    "seal_friction_ratio": {
     "v": 0,
     "u": "-",
     "scope": "gear",
     "src": [
      "LT20"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: ยกค่าของเครื่องฝึกรอบที่ 1 (params-trainer.json [LT20]) มาใช้ เพราะไม่พบข้อมูลของ DA42"
    }
   },
   "strut_nose": {
    "kind": {
     "v": "oleo",
     "u": "-",
     "scope": "gear",
     "src": [
      "LT5"
     ],
     "conf": "กลาง",
     "est": true,
     "note": "ค่าประมาณ: air-oil [LT5 p.7-14]; มี shimmy damper [LT5 p.7-15]"
    },
    "stroke": {
     "v": 0.12,
     "u": "m",
     "scope": "gear",
     "src": [
      "LT20"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: ราว 60 % ของระยะยุบล้อหน้าของเครื่องฝึกรอบที่ 1 (0.20 m [LT20])"
    },
    "p_static": {
     "v": 250,
     "u": "psi",
     "scope": "gear",
     "src": [
      "LT20"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: แรงดันสถิตทั่วไปของ oleo เครื่องเบา (รอบที่ 1 ใช้ 300 psi [LT20]); piston_area คิดจากแรงสถิต ÷ ค่านี้"
    },
    "piston_area": {
     "v": 0.00207,
     "u": "m2",
     "scope": "gear",
     "src": [
      "LT20"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: แรงสถิต 3565 N ที่ MTOM CG หน้า"
    },
    "ratio_static_to_extended": {
     "v": 2.5,
     "u": "-",
     "scope": "gear",
     "src": [
      "LT20"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: ยกค่าของเครื่องฝึกรอบที่ 1 (params-trainer.json [LT20]) มาใช้ เพราะไม่พบข้อมูลของ DA42"
    },
    "ratio_compressed_to_extended": {
     "v": 8,
     "u": "-",
     "scope": "gear",
     "src": [
      "LT20"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: ยกค่าของเครื่องฝึกรอบที่ 1 (params-trainer.json [LT20]) มาใช้ เพราะไม่พบข้อมูลของ DA42"
    },
    "Kh_compression": {
     "v": 1988,
     "u": "N/(m/s)^2",
     "scope": "gear",
     "src": [
      "LT20"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: สเกลค่ารอบที่ 1 [LT20] ด้วยอัตราส่วนแรงสถิตต่อล้อของ DA42 ต่อของเครื่องฝึกรอบที่ 1"
    },
    "Kr_rebound": {
     "v": 23604,
     "u": "N/(m/s)^2",
     "scope": "gear",
     "src": [
      "LT20"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: สเกลค่ารอบที่ 1 [LT20] ด้วยอัตราส่วนแรงสถิตต่อล้อของ DA42 ต่อของเครื่องฝึกรอบที่ 1"
    },
    "c_linear": {
     "v": 1242,
     "u": "N s/m",
     "scope": "gear",
     "src": [
      "LT20"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: สเกลค่ารอบที่ 1 [LT20] ด้วยอัตราส่วนแรงสถิตต่อล้อของ DA42 ต่อของเครื่องฝึกรอบที่ 1"
    }
   },
   "tyre_main": {
    "size": {
     "v": {
      "size": "15x6.0-6",
      "ply": 6,
      "speed_mph": 120
     },
     "u": "-",
     "scope": "gear",
     "src": [
      "LT2",
      "LT1"
     ],
     "conf": "สูง",
     "est": false,
     "note": "[LT2 p.1-6]"
    },
    "rated_load": {
     "v": 8417,
     "u": "N",
     "scope": "gear",
     "src": [
      "LT20"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: ≥ แรงสถิตที่ MTOM × 1.07 (ไม่พบ data book)"
    },
    "rated_pressure": {
     "v": 60,
     "u": "psi",
     "scope": "gear",
     "src": [
      "LT20"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณโดยวิจารณญาณ: ลดจากค่ายางของเครื่องฝึกรอบที่ 1 [LT20] (ยางใหญ่กว่า มวล 2,250 kg) ตามขนาดยาง 15x6.0-6 และแรงสถิต; ไม่พบ data book ของยาง"
    },
    "operating_pressure": {
     "v": 55,
     "u": "psi",
     "scope": "gear",
     "src": [
      "LT20"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ (AFM บทที่ 8 ไม่ได้เปิด)"
    },
    "outside_diameter": {
     "v": 0.381,
     "u": "m",
     "scope": "gear",
     "src": [
      "LT2"
     ],
     "conf": "สูง",
     "est": false,
     "note": "15 in"
    },
    "section_width": {
     "v": 0.152,
     "u": "m",
     "scope": "gear",
     "src": [
      "LT2"
     ],
     "conf": "สูง",
     "est": false,
     "note": "6.0 in"
    },
    "k_vertical": {
     "v": 200000,
     "u": "N/m",
     "scope": "gear",
     "src": [
      "LT20"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณโดยวิจารณญาณ: ลดจากค่ายางของเครื่องฝึกรอบที่ 1 [LT20] (ยางใหญ่กว่า มวล 2,250 kg) ตามขนาดยาง 15x6.0-6 และแรงสถิต; ไม่พบ data book ของยาง"
    },
    "c_vertical": {
     "v": 2000,
     "u": "N s/m",
     "scope": "gear",
     "src": [
      "LT20"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณโดยวิจารณญาณ: ลดจากค่ายางของเครื่องฝึกรอบที่ 1 [LT20] (ยางใหญ่กว่า มวล 2,250 kg) ตามขนาดยาง 15x6.0-6 และแรงสถิต; ไม่พบ data book ของยาง"
    },
    "cornering_stiffness_coef": {
     "v": 3.2,
     "u": "1/rad",
     "scope": "gear",
     "src": [
      "LT20"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: ยกค่าของเครื่องฝึกรอบที่ 1 (params-trainer.json [LT20]) มาใช้ เพราะไม่พบข้อมูลของ DA42"
    },
    "relaxation_length": {
     "v": 0.25,
     "u": "m",
     "scope": "gear",
     "src": [
      "LT20"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณโดยวิจารณญาณ: ลดจากค่ายางของเครื่องฝึกรอบที่ 1 [LT20] (ยางใหญ่กว่า มวล 2,250 kg) ตามขนาดยาง 15x6.0-6 และแรงสถิต; ไม่พบ data book ของยาง"
    },
    "k_longitudinal": {
     "v": 150000,
     "u": "N/m",
     "scope": "gear",
     "src": [
      "LT20"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณโดยวิจารณญาณ: ลดจากค่ายางของเครื่องฝึกรอบที่ 1 [LT20] (ยางใหญ่กว่า มวล 2,250 kg) ตามขนาดยาง 15x6.0-6 และแรงสถิต; ไม่พบ data book ของยาง"
    },
    "mu_peak_dry": {
     "v": 0.8,
     "u": "-",
     "scope": "gear",
     "src": [
      "LT20"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: ยกค่าของเครื่องฝึกรอบที่ 1 (params-trainer.json [LT20]) มาใช้ เพราะไม่พบข้อมูลของ DA42"
    },
    "mu_skid_ratio_dry": {
     "v": 0.75,
     "u": "-",
     "scope": "gear",
     "src": [
      "LT20"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: ยกค่าของเครื่องฝึกรอบที่ 1 (params-trainer.json [LT20]) มาใช้ เพราะไม่พบข้อมูลของ DA42"
    },
    "mu_skid_ratio_wet": {
     "v": 0.5,
     "u": "-",
     "scope": "gear",
     "src": [
      "LT20"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: ยกค่าของเครื่องฝึกรอบที่ 1 (params-trainer.json [LT20]) มาใช้ เพราะไม่พบข้อมูลของ DA42"
    },
    "rolling_radius": {
     "v": 0.18,
     "u": "m",
     "scope": "gear",
     "src": [
      "LT2"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: รัศมีนอก 15 in / 2 = 0.19 m ลบการยุบของยางราว 1 cm"
    },
    "wheel_inertia": {
     "v": 0.12,
     "u": "kg m2",
     "scope": "gear",
     "src": [
      "LT20"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: ยาง + ล้อ + จานเบรก ~6 kg ที่รัศมีไจเรชัน ~0.14 m (รอบที่ 1 ใช้ 0.33 kg m² สำหรับล้อ ~13 kg [LT20])"
    }
   },
   "tyre_nose": {
    "size": {
     "v": {
      "size": "5.00-5",
      "ply": 10,
      "speed_mph": 120
     },
     "u": "-",
     "scope": "gear",
     "src": [
      "LT2",
      "LT1"
     ],
     "conf": "สูง",
     "est": false,
     "note": "[LT2 p.1-6]"
    },
    "rated_load": {
     "v": 5348,
     "u": "N",
     "scope": "gear",
     "src": [
      "LT20"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: 1.5 × แรงสถิตล้อหน้าที่ MTOM CG หน้า (ยาง 10 PR มีภาระพิกัดสูงกว่าที่ใช้)"
    },
    "rated_pressure": {
     "v": 70,
     "u": "psi",
     "scope": "gear",
     "src": [
      "LT20"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณโดยวิจารณญาณ: ลดจากค่ายางของเครื่องฝึกรอบที่ 1 [LT20] (ยางใหญ่กว่า มวล 2,250 kg) ตามขนาดยาง 5.00-5 และแรงสถิต; ไม่พบ data book ของยาง"
    },
    "operating_pressure": {
     "v": 60,
     "u": "psi",
     "scope": "gear",
     "src": [
      "LT20"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณโดยวิจารณญาณ: ลดจากค่ายางของเครื่องฝึกรอบที่ 1 [LT20] (ยางใหญ่กว่า มวล 2,250 kg) ตามขนาดยาง 5.00-5 และแรงสถิต; ไม่พบ data book ของยาง"
    },
    "outside_diameter": {
     "v": 0.355,
     "u": "m",
     "scope": "gear",
     "src": [
      "LT20"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: เส้นผ่านศูนย์กลางนอกของยางขนาด 5.00-5 ราว 14 in (0.355 m)"
    },
    "k_vertical": {
     "v": 130000,
     "u": "N/m",
     "scope": "gear",
     "src": [
      "LT20"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณโดยวิจารณญาณ: ลดจากค่ายางของเครื่องฝึกรอบที่ 1 [LT20] (ยางใหญ่กว่า มวล 2,250 kg) ตามขนาดยาง 5.00-5 และแรงสถิต; ไม่พบ data book ของยาง"
    },
    "c_vertical": {
     "v": 1000,
     "u": "N s/m",
     "scope": "gear",
     "src": [
      "LT20"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณโดยวิจารณญาณ: ลดจากค่ายางของเครื่องฝึกรอบที่ 1 [LT20] (ยางใหญ่กว่า มวล 2,250 kg) ตามขนาดยาง 5.00-5 และแรงสถิต; ไม่พบ data book ของยาง"
    },
    "cornering_stiffness_coef": {
     "v": 3.2,
     "u": "1/rad",
     "scope": "gear",
     "src": [
      "LT20"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: ยกค่าของเครื่องฝึกรอบที่ 1 (params-trainer.json [LT20]) มาใช้ เพราะไม่พบข้อมูลของ DA42"
    },
    "relaxation_length": {
     "v": 0.22,
     "u": "m",
     "scope": "gear",
     "src": [
      "LT20"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: ยกค่าของเครื่องฝึกรอบที่ 1 (params-trainer.json [LT20]) มาใช้ เพราะไม่พบข้อมูลของ DA42"
    }
   },
   "brakes": {
    "kind": {
     "v": "hydraulic disc, toe brakes ทั้งสองที่นั่งหน้า, parking brake; differential braking ใช้เลี้ยวแคบ",
     "u": "-",
     "scope": "gear",
     "src": [
      "LT9"
     ],
     "conf": "กลาง",
     "est": true,
     "note": "ค่าประมาณ: ไม่พบใน AFM ส่วนที่เปิดได้; สไลด์โรงเรียนกล่าวถึง differential braking [LT9]"
    },
    "force_limit_ratio": {
     "v": 0.6,
     "u": "-",
     "scope": "gear",
     "src": [
      "LT20"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: ยกค่าของเครื่องฝึกรอบที่ 1 (params-trainer.json [LT20]) มาใช้ เพราะไม่พบข้อมูลของ DA42"
    },
    "pressure_rise_rate": {
     "v": 2.5,
     "u": "1/s",
     "scope": "gear",
     "src": [
      "LT20"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: ยกค่าของเครื่องฝึกรอบที่ 1 (params-trainer.json [LT20]) มาใช้ เพราะไม่พบข้อมูลของ DA42"
    },
    "antiskid": {
     "v": 0,
     "u": "bool",
     "scope": "gear",
     "src": [
      "LT5"
     ],
     "conf": "สูง",
     "est": false,
     "note": "ไม่มี anti-skid"
    },
    "heat_sink_mass": {
     "v": 2,
     "u": "kg",
     "scope": "gear",
     "src": [
      "LT20"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: จานเบรกเหล็กต่อล้อ ~2 kg ของล้อ 6 in (รอบที่ 1 ใช้ 6 kg สำหรับเครื่อง 2,250 kg [LT20])"
    },
    "heat_sink_cool_tau": {
     "v": 600,
     "u": "s",
     "scope": "gear",
     "src": [
      "LT20"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: จานเล็กกว่าของรอบที่ 1 (900 s [LT20]) จึงเย็นเร็วกว่า"
    },
    "fade_start_temp": {
     "v": 400,
     "u": "degC",
     "scope": "gear",
     "src": [
      "LT20"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: ยกค่าของเครื่องฝึกรอบที่ 1 (params-trainer.json [LT20]) มาใช้ เพราะไม่พบข้อมูลของ DA42"
    },
    "fade_full_temp": {
     "v": 700,
     "u": "degC",
     "scope": "gear",
     "src": [
      "LT20"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: ยกค่าของเครื่องฝึกรอบที่ 1 (params-trainer.json [LT20]) มาใช้ เพราะไม่พบข้อมูลของ DA42"
    }
   },
   "steering": {
    "mode": {
     "v": {
      "type": "pedal_linked",
      "caster_with_diff_brake": true
     },
     "u": "-",
     "scope": "gear",
     "src": [
      "LT5",
      "LT9"
     ],
     "conf": "กลาง",
     "est": false,
     "note": "ล้อหน้าเลี้ยวตาม pedal ตลอดระยะ [LT5 p.7-15]; เกินจากนั้นใช้ differential brake [LT9]"
    },
    "pedal_max": {
     "v": 30,
     "u": "deg",
     "scope": "gear",
     "src": [
      "LT9"
     ],
     "conf": "ต่ำ",
     "est": false,
     "note": "±30° [LT9]"
    },
    "caster_max": {
     "v": 52,
     "u": "deg",
     "scope": "gear",
     "src": [
      "LT9"
     ],
     "conf": "ต่ำ",
     "est": false,
     "note": "ถึง 52° เมื่อใช้ differential braking [LT9]"
    },
    "steer_rate": {
     "v": 60,
     "u": "deg/s",
     "scope": "gear",
     "src": [
      "LT20"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: ยกค่าของเครื่องฝึกรอบที่ 1 (params-trainer.json [LT20]) มาใช้ เพราะไม่พบข้อมูลของ DA42"
    },
    "shimmy_lag": {
     "v": 0.05,
     "u": "s",
     "scope": "gear",
     "src": [
      "LT20"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: มี shimmy damper [LT5 p.7-15]"
    }
   },
   "certification": {
    "part23_limit_descent": {
     "v": {
      "formula": "V = 4.4 (W/S)^0.25 fps, 7..10 fps",
      "da42ng_fps": 9.73
     },
     "u": "fps",
     "scope": "gear",
     "src": [
      "LT20"
     ],
     "conf": "สูง",
     "est": false,
     "note": "W/S 23.9 lb/ft² ที่ MTOM (14 CFR 23.473 เดิม; ฐาน JAR-23 ของ DA42 [LT1])"
    },
    "part23_wing_lift_ratio": {
     "v": 0.667,
     "u": "-",
     "scope": "gear",
     "src": [
      "LT20"
     ],
     "conf": "สูง",
     "est": false,
     "note": "23.473"
    },
    "part23_min_load_factors": {
     "v": {
      "inertia": 2.67,
      "ground_reaction": 2
     },
     "u": "g",
     "scope": "gear",
     "src": [
      "LT20"
     ],
     "conf": "สูง",
     "est": false,
     "note": "23.473"
    },
    "part23_reserve_drop_factor": {
     "v": 1.44,
     "u": "x drop height",
     "scope": "gear",
     "src": [
      "LT20"
     ],
     "conf": "สูง",
     "est": false,
     "note": "23.727"
    }
   },
   "legacy": {
    "v": [
     {
      "b": [
       1.41,
       0,
       1.05
      ],
      "k": 97194.04457885303,
      "c": 7066.621227126513,
      "stroke": 0.12,
      "steer": true
     },
     {
      "b": [
       -0.326,
       -1.475,
       1.08
      ],
      "k": 168151.65994623656,
      "c": 13668.73500827484,
      "stroke": 0.15,
      "brake": true
     },
     {
      "b": [
       -0.326,
       1.475,
       1.08
      ],
      "k": 168151.65994623656,
      "c": 13668.73500827484,
      "stroke": 0.15,
      "brake": true
     }
    ],
    "u": "AC.gear",
    "scope": "gear",
    "src": [
     "LT2"
    ],
    "conf": "ต่ำ",
    "est": true,
    "note": "รูปแบบ AC.gear ของซิม (ค่าประมาณจาก gear.geometry + strut)"
   }
  }
 }
}
```

```json
{
 "da42ng": {
  "interference": {
   "downwash": {
    "deda": {
     "v": 0.247,
     "u": "-",
     "scope": "aircraft",
     "src": [
      "LM10"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: DATCOM (หาง T สูง h_H 1.75 m)"
    },
    "eps0": {
     "v": 0.0141,
     "u": "rad",
     "scope": "aircraft",
     "src": [
      "LM10"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: ε0 ≈ 2 CL0/(πA) × 0.7 (หาง T สูง)"
    },
    "l_t": {
     "v": 5.085,
     "u": "m",
     "scope": "aircraft",
     "src": [
      "LT1"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: เท่ากับ tail.l_h"
    },
    "VH": {
     "v": 0.5772,
     "u": "-",
     "scope": "aircraft",
     "src": [
      "LT2"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: S_h l_h / (S c̄)"
    },
    "a_t": {
     "v": 4.05,
     "u": "1/rad",
     "scope": "aircraft",
     "src": [
      "LM10"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: CLα หางระดับ (A_h 4.6)"
    },
    "eta_t": {
     "v": 0.95,
     "u": "-",
     "scope": "aircraft",
     "src": [
      "LM10"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: หาง T อยู่นอก wake และ slipstream ที่ α ปกติ จึงใช้ 0.95 (ช่วงทั่วไป 0.9–1.0)"
    },
    "CLadot": {
     "v": 1.05,
     "u": "1/(rad·c/2V)",
     "scope": "aircraft",
     "src": [
      "LM10"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: lm_derivs approach"
    },
    "Cmadot": {
     "v": -4.31,
     "u": "1/(rad·c/2V)",
     "scope": "aircraft",
     "src": [
      "LM10"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: lm_derivs approach"
    }
   },
   "groundEffect": {
    "rMac": {
     "v": [
      -0.141,
      2.935,
      0.11
     ],
     "u": "m (FRD จาก CG, y ใช้ ±)",
     "scope": "aircraft",
     "src": [
      "LT2"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "c/4 MAC ปีก; ปีกต่ำกว่า CG ~0.11 m (ค่าประมาณ)"
    },
    "CLa_w": {
     "v": 5.11,
     "u": "1/rad",
     "scope": "aircraft",
     "src": [
      "LM10"
     ],
     "conf": "กลาง",
     "est": true,
     "note": "ค่าประมาณ: CLα ปีก DATCOM A 11.06"
    },
    "A": {
     "v": 11.06,
     "u": "-",
     "scope": "aircraft",
     "src": [
      "LT2"
     ],
     "conf": "สูง",
     "est": false,
     "note": ""
    },
    "rEps": {
     "v": {
      "a": 3.99,
      "m": 0.652
     },
     "u": "-",
     "scope": "aircraft",
     "src": [
      "LT20"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: ยกค่าของเครื่องฝึกรอบที่ 1 (params-trainer.json [LT20]) มาใช้ เพราะไม่พบข้อมูลของ DA42; หาง T สูงจากพื้นมาก ผลของพื้นต่อ downwash ที่หางน้อยกว่าเครื่องหางต่ำ"
    }
   },
   "slipstream": {
    "diskDiameter": {
     "v": 1.87,
     "u": "m",
     "scope": "propeller",
     "src": [
      "LT1"
     ],
     "conf": "สูง",
     "est": false,
     "note": ""
    },
    "hubRadius": {
     "v": 0.17,
     "u": "m",
     "scope": "propeller",
     "src": [
      "LT2"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณรัศมี spinner จากภาพ (~0.17 m ≈ 0.18 R ตาม hubRadiusRatio)"
    },
    "hubPos": {
     "v": [
      [
       1.47,
       -1.7,
       0.15
      ],
      [
       1.47,
       1.7,
       0.15
      ]
     ],
     "u": "m (FRD จาก CG)",
     "scope": "aircraft",
     "src": [
      "LT2"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: ซ้าย, ขวา = propulsion.layout (จากภาพสามด้าน)"
    },
    "sense": {
     "v": 1,
     "u": "-",
     "scope": "propeller",
     "src": [
      "LT1"
     ],
     "conf": "สูง",
     "est": false,
     "note": "CW ทั้งคู่"
    },
    "kappa": {
     "v": 0.43,
     "u": "-",
     "scope": "aircraft",
     "src": [
      "LT20"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: ยกค่าของเครื่องฝึกรอบที่ 1 (params-trainer.json [LT20]) มาใช้ เพราะไม่พบข้อมูลของ DA42"
    },
    "immersionH": {
     "v": {
      "axes": {
       "rs_m": [
        0.3,
        0.5,
        0.7,
        0.9,
        1.1
       ]
      },
      "data": [
       0,
       0,
       0,
       0,
       0
      ]
     },
     "u": "-",
     "scope": "aircraft",
     "src": [
      "LT1"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "หาง T อยู่เหนือและอยู่ระหว่าง slipstream ของสองเครื่อง จึงไม่จุ่ม (ค่าประมาณ)"
    },
    "immersionV": {
     "v": {
      "axes": {
       "rs_m": [
        0.3,
        0.5,
        0.7,
        0.9,
        1.1
       ]
      },
      "data": [
       0,
       0,
       0,
       0,
       0
      ]
     },
     "u": "-",
     "scope": "aircraft",
     "src": [
      "LT1"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: ครีบอยู่กลางลำ ห่างแกนใบพัด 1.70 m > รัศมี slipstream"
    },
    "kSwirl": {
     "v": 0.5,
     "u": "-",
     "scope": "aircraft",
     "src": [
      "LT20"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: ยกค่าของเครื่องฝึกรอบที่ 1 (params-trainer.json [LT20]) มาใช้ เพราะไม่พบข้อมูลของ DA42"
    },
    "zSwirl": {
     "v": 0.55,
     "u": "m",
     "scope": "aircraft",
     "src": [
      "LT20"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: ยกค่าของเครื่องฝึกรอบที่ 1 (params-trainer.json [LT20]) มาใช้ เพราะไม่พบข้อมูลของ DA42"
    },
    "finArea": {
     "v": 2.43,
     "u": "m2",
     "scope": "aircraft",
     "src": [
      "LT2"
     ],
     "conf": "สูง",
     "est": false,
     "note": ""
    },
    "finArm": {
     "v": 4.685,
     "u": "m",
     "scope": "aircraft",
     "src": [
      "LT1"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: c/4 ของครีบ (7.25 m DAT, lt_geom) ลบ c/4 MAC"
    },
    "finLiftSlope": {
     "v": 1.9,
     "u": "1/rad",
     "scope": "aircraft",
     "src": [
      "LM10"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: lm_derivs"
    },
    "eta_v": {
     "v": 0.95,
     "u": "-",
     "scope": "aircraft",
     "src": [
      "LM10"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: ครีบอยู่กลางลำตัว นอก slipstream ของเครื่องบนปีก"
    },
    "blownSpanFactor": {
     "v": 0.9,
     "u": "D",
     "scope": "aircraft",
     "src": [
      "LT20"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: ยกค่าของเครื่องฝึกรอบที่ 1 (params-trainer.json [LT20]) มาใช้ เพราะไม่พบข้อมูลของ DA42"
    },
    "blownArea": {
     "v": 2.4,
     "u": "m2",
     "scope": "aircraft",
     "src": [
      "LT2"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: ต่อเครื่อง: 0.9 × 1.87 m × คอร์ดที่ y 1.7 m (~1.43 m)"
    },
    "kBlown": {
     "v": 0.5,
     "u": "-",
     "scope": "aircraft",
     "src": [
      "LT20"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: ยกค่าของเครื่องฝึกรอบที่ 1 (params-trainer.json [LT20]) มาใช้ เพราะไม่พบข้อมูลของ DA42; สำคัญกับ OEI: ปีกข้างเครื่องที่ทำงานได้แรงยกเพิ่ม → ม้วนไปทางเครื่องดับ"
    },
    "k_deda_power": {
     "v": 0,
     "u": "-",
     "scope": "aircraft",
     "src": [
      "LT2"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: หาง T ไม่อยู่ใน slipstream"
    }
   }
  }
 }
}
```

```json
{
 "da42ng": {
  "wind": {
   "fFactor": {
    "trainerExcessTW": {
     "v": 0.122,
     "u": "-",
     "scope": "aircraft",
     "src": [
      "LT10",
      "LM0"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: (T − D)/W ที่ 84 kt แฟลป LDG ล้อลง เต็มกำลังสองเครื่อง MTOM (T 4660 N จาก BEM, CD 0.128)"
    }
   },
   "wake": {
    "b0_over_b": {
     "v": 0.7854,
     "u": "-",
     "scope": "aircraft",
     "src": [
      "LT20"
     ],
     "conf": "สูง",
     "est": false,
     "note": "π/4 ปีกวงรี"
    },
    "rc_over_b": {
     "v": {
      "default": 0.035,
      "min": 0.02,
      "max": 0.06
     },
     "u": "-",
     "scope": "aircraft",
     "src": [
      "LT20"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: ยกค่าของเครื่องฝึกรอบที่ 1 (params-trainer.json [LT20]) มาใช้ เพราะไม่พบข้อมูลของ DA42"
    },
    "trainerRollControl": {
     "v": {
      "Clda": 0.146,
      "daMax_deg": 20,
      "ClMax": 0.0509
     },
     "u": "-",
     "scope": "aircraft",
     "src": [
      "LM10",
      "LT1"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "อำนาจม้วนสูงสุด (ค่าประมาณ) ใช้เทียบกับ wake vortex"
    }
   }
  }
 }
}
```

```json
{
 "da42ng": {
  "input": {
   "keyboard": {
    "interim_trim_rate_elevator": {
     "v": 0.5,
     "u": "deg/s",
     "scope": "aircraft",
     "src": [
      "LT20"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: ยกค่าของเครื่องฝึกรอบที่ 1 (params-trainer.json [LT20]) มาใช้ เพราะไม่พบข้อมูลของ DA42"
    },
    "flap_notches": {
     "v": [
      0,
      0.5,
      1
     ],
     "u": "สัดส่วน AC.flaps",
     "scope": "aircraft",
     "src": [
      "LT1"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: UP / APP / LDG ตาม flapMap lift"
    }
   }
  }
 }
}
```

```json
{
 "da42ng": {
  "validation": {
   "classification": {
    "hqClassCategory": {
     "v": {
      "class": "I",
      "approachLanding": "C",
      "cruiseClimb": "B",
      "takeoff": "C"
     },
     "u": "-",
     "scope": "aircraft",
     "src": [
      "LT20"
     ],
     "conf": "กลาง",
     "est": true,
     "note": "ค่าประมาณ: MIL-F-8785C class I (เครื่องเบา < ~6,000 lb) ตามรอบที่ 1"
    }
   },
   "procedures": {
    "v50MinFactor_singleEngine": {
     "v": {
      "VS1_factor": 1.2,
      "VMC_factor": 1.1
     },
     "u": "× VS1, × VMC",
     "scope": "aircraft",
     "src": [
      "LT20",
      "LM1"
     ],
     "conf": "สูง",
     "est": false,
     "note": "เครื่องหลายเครื่องยนต์: V50 ≥ max(1.2 VS1, 1.1 VMC) (14 CFR 23.51 เดิม)"
    }
   },
   "trim_targets": {
    "cruise": {
     "v": {
      "ias_kt": 135,
      "h_ft": 6000,
      "gamma_deg": 0
     },
     "u": "kt, ft, deg",
     "scope": "aircraft",
     "src": [
      "LT10"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "สภาพ cruise ฝึกบิน (ราว 75 %) ค่าประมาณ"
    },
    "approach": {
     "v": {
      "ias_kt": 84,
      "h_ft": 1000,
      "gamma_deg": -3
     },
     "u": "kt, ft, deg",
     "scope": "aircraft",
     "src": [
      "LT9"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: สภาพ approach ที่ VREF 84 KIAS [LT9] แฟลป LDG ล้อลง เส้นร่อน 3°"
    }
   },
   "takeoff_test": {
    "v": {
     "flap": "UP",
     "VR_kt": 76,
     "theta_deg": 9
    },
    "u": "kt IAS, deg",
    "scope": "aircraft",
    "src": [
     "LT9"
    ],
    "conf": "ต่ำ",
    "est": true,
    "note": "normal take-off แฟลป UP; มุมเงย 9° ค่าประมาณ"
   },
   "stall_test": {
    "v": {
     "UP": 85,
     "APP": 80,
     "LDG": 76
    },
    "u": "kt",
    "scope": "aircraft",
    "src": [
     "LM1"
    ],
    "conf": "ต่ำ",
    "est": true,
    "note": "ค่าประมาณ: ความเร็วเริ่มการทดสอบ ~1.25 VS"
   },
   "reference_modes": {
    "v": {
     "source": "Londono 2009 (DA42 TDI, ERAU) ไม่ได้รายงานความถี่โหมด; derivative บินจริงอยู่ที่ §06.6",
     "available": false
    },
    "u": "-",
    "scope": "aircraft",
    "src": [
     "LT15"
    ],
    "conf": "กลาง",
    "est": false,
    "note": "ไม่พบโหมดพลวัตที่เผยแพร่ของ DA42"
   },
   "stick_force_targets": {
    "v": {
     "controller": "centre_stick",
     "fs_per_g_lbf": {
      "min": 10.7,
      "max": 20
     },
     "fs_per_g_N": {
      "min": 48,
      "max": 89
     },
     "nAlpha_cruise_g_per_rad": 14.23,
     "nL": 3.8,
     "mil_L1_centre_stick_lbf": {
      "min": 7.5,
      "max": 20
     },
     "part23_155_force_lbf": 29.9,
     "part23_155_min_gradient_lbf": 10.7,
     "fs_per_kt_min_lbf": 0.167,
     "fs_per_kt_min_N": 0.74
    },
    "u": "lbf/g, N/g, g/rad, lbf, lbf/kt, N/kt",
    "scope": "aircraft",
    "src": [
     "R1:C12",
     "LM3",
     "LC14",
     "LT2",
     "LT5"
    ],
    "conf": "ต่ำ",
    "est": true,
    "note": "ค่าประมาณ: ไม่ใช่ค่าที่วัดจาก DA42 แต่เป็นแถบเป้าหมายจากเกณฑ์ MIL-F-8785C Level 1 แบบ centre stick (สูตรของ controls.requirements.mil8785c_fs_per_g_centre_stick รอบที่ 1 [R1:C12]: ขีดบน min(240/(n/α), 28) แต่ไม่ต่ำกว่า 56/(nL − 1), ขีดล่าง max(21/(nL − 1), 3)) ด้วย n/α 14.23 g/rad ของบัตรที่ cruise 135 KIAS 6,000 ft MTOM 1,900 kg (lm_card) และ nL 3.8 (normal category [LT2]) กับพื้นขั้นต่ำจาก 14 CFR 23.155 แบบ stick (แรงถึง limit load ≥ W/140 = 29.9 lbf ⇒ ≥ 10.7 lbf/g) [LM3]; แรงต่อ kt ขั้นต่ำ 1 lbf ต่อ 6 kt ตาม 14 CFR 25.173(c) ใช้เป็นแนวทาง [LC14]; DA42 ใช้ control stick [LT5 p.7-4]; ซิมยังไม่มีแบบจำลองแรงที่คัน (T-LT-31)"
   }
  }
 }
}
```

```json
{
 "da42ng": {
  "_na": {
   "v": [
    "turbofan.*",
    "turboprop.*",
    "numerics.*",
    "otherSims.*",
    "aero.static_long.table_clean",
    "aero.spin_reference.*",
    "interference.groundEffect.tablesCheck",
    "propeller.tables.CNmu",
    "propeller.tables.CMmu",
    "propeller.betaReverse.*",
    "propeller.engineInterface.flightIdleShaftPower",
    "controls.pitch.derived_check",
    "controls.reference_types.*",
    "controls.roll.tab_max",
    "controls.roll.trim_rate",
    "gear.brakes.antiskid_efficiency",
    "gear.brakes.antiskid_efficiency_measured",
    "gear.brakes.antiskid_slip_setpoint",
    "gear.certification.part25_limit_descent",
    "gear.certification.part25_friction_cap",
    "wind.discreteGust.cfr25_341_Fg",
    "wind.wake.leaders",
    "validation.typicalModes.*",
    "validation.currentModel.*"
   ],
   "u": "-",
   "scope": "aircraft",
   "src": [
    "LT1"
   ],
   "conf": "สูง",
   "est": false,
   "note": "turbofan/turboprop: เครื่องลูกสูบดีเซล · numerics: ค่าของตัวซิม · otherSims.*: หัวข้อ 03 (LB) เป็นเจ้าของ path otherSims · table_clean: ตัวอย่างรูปแบบที่คำนวณจากพารามิเตอร์ได้ · spin_reference: DA42 เป็น normal category ห้าม spin [LT2 p.2-19] ไม่มีข้อมูล spin · groundEffect.tablesCheck, pitch.derived_check: ค่าตรวจจากสูตรรอบที่ 1 · CNmu/CMmu: BEM ของ lm_prop ไม่คำนวณแรงในกระแสเอียง (งาน P2) · betaReverse: ไม่มี reverse · flightIdleShaftPower: แนวคิดเทอร์โบพร็อป · reference_types: เครื่องโดยสาร · aileron ไม่มี trim tab [LT1] · ไม่มี anti-skid · ไม่ใช่ Part 25 · wake.leaders: เครื่องโดยสาร · typicalModes/currentModel: ค่าของเครื่องฝึกรอบที่ 1"
  }
 }
}
```

#### da42_tae125

```json
{
 "da42_tae125": {
  "_inherits": {
   "v": "da42ng",
   "u": "-",
   "scope": "aircraft",
   "src": [],
   "conf": "สูง",
   "est": false,
   "note": "DA 42 รุ่นแรก (TCDS Section A) เครื่อง TAE 125-01 / -02-99 / -02-114 เลขเครื่อง 42.0xx–42.4xx; ในไทย CATC 4 BAC 1 [LS1]; ใส่เฉพาะค่าที่ต่างจาก NG"
  },
  "airframe": {
   "identity": {
    "v": {
     "manufacturer": "Diamond Aircraft Industries GmbH (Austria)",
     "model": "DA 42",
     "variant": "DA 42 \"TDI\" / Twin Star (MÄM 42-088 MTOM 1,785 kg)",
     "engine": "2 × Technify (Thielert) TAE 125-01 Centurion 1.7 หรือ TAE 125-02-99 (MÄM 42-198)",
     "propeller": "2 × MTV-6-A-C-F/CF187-129 3 ใบ CW",
     "seats": 4,
     "category": "normal",
     "tc_ref": "EASA TCDS EASA.A.005 Section A; AFM Doc 7.01.05-E"
    },
    "u": "-",
    "scope": "aircraft",
    "src": [
     "LT1",
     "LT3"
    ],
    "conf": "สูง",
    "est": false,
    "note": "เครื่องในไทยเลข 42.197/198/216/311/407 [LS1]"
   },
   "weights": {
    "MTOW": {
     "v": 1785,
     "u": "kg",
     "scope": "aircraft",
     "src": [
      "LT1",
      "LT16"
     ],
     "conf": "สูง",
     "est": false,
     "note": "3,935 lb กับ MÄM 42-088 (มาตรฐาน 1,700 kg) [LT1 A Note 6]; สมมติว่าเครื่องในไทยทำ MÄM แล้ว (ไม่ยืนยัน)"
    },
    "MLW": {
     "v": 1700,
     "u": "kg",
     "scope": "aircraft",
     "src": [
      "LT1",
      "LT16"
     ],
     "conf": "สูง",
     "est": false,
     "note": "3,748 lb (1,785 kg กับ OÄM 42-195)"
    },
    "MZFW": {
     "v": 1650,
     "u": "kg",
     "scope": "aircraft",
     "src": [
      "LT1"
     ],
     "conf": "สูง",
     "est": false,
     "note": "1,674 กับ OÄM 42-188; 1,730 กับ +OÄM 42-195"
    },
    "BEW_typical": {
     "v": 1250,
     "u": "kg",
     "scope": "aircraft",
     "src": [
      "LT16",
      "LT15"
     ],
     "conf": "กลาง",
     "est": false,
     "note": "สเปก AOPA 2006 2,750 lb [LT16]; เครื่องทดสอบ ERAU 2,804 lb [LT15]"
    },
    "useful_load": {
     "v": 535,
     "u": "kg",
     "scope": "aircraft",
     "src": [
      "LT16"
     ],
     "conf": "กลาง",
     "est": false,
     "note": "1,785 − 1,250"
    },
    "training_mass": {
     "v": {
      "kg": 1600,
      "empty_kg": 1290,
      "crew_kg": 170,
      "fuel_kg": 140,
      "fuel_l": 175
     },
     "u": "kg",
     "scope": "aircraft",
     "src": [
      "LT16"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: empty_kg 1,290 kg = BEW_typical 1,250 kg (สเปก AOPA 2006 [LT16]) + อุปกรณ์ของโรงเรียนราว 40 kg; ครูและศิษย์ 2 × 85 kg; Jet A-1 175 l × 0.80 kg/l = 140 kg; รวม 1,600 kg (แถบความเร็ว ≤1,700 kg)"
    }
   },
   "cg": {
    "envelope": {
     "v": [
      [
       1250,
       2.35,
       2.42
      ],
      [
       1468,
       2.35,
       2.464
      ],
      [
       1600,
       2.371,
       2.49
      ],
      [
       1785,
       2.4,
       2.49
      ]
     ],
     "u": "kg, m DAT",
     "scope": "aircraft",
     "src": [
      "LT1"
     ],
     "conf": "สูง",
     "est": false,
     "note": "หน้า 2.35 m ถึง 1,468 kg → 2.40 m ที่ 1,785 kg; หลัง 2.42 m ที่ 1,250 kg → 2.49 m ที่ ≥1,600 kg [LT1 A.III.14]"
    }
   },
   "inertia": {
    "Ixx": {
     "v": 6361,
     "u": "kg m2",
     "scope": "aircraft",
     "src": [
      "LM15"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ build-up (เครื่อง TAE 134 kg เบากว่า E4) สเกลตามมวล"
    },
    "Iyy": {
     "v": 2969,
     "u": "kg m2",
     "scope": "aircraft",
     "src": [
      "LM15"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ build-up สเกลตามมวล"
    },
    "Izz": {
     "v": 9231,
     "u": "kg m2",
     "scope": "aircraft",
     "src": [
      "LM15"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ build-up สเกลตามมวล"
    },
    "ref_mass": {
     "v": 1600,
     "u": "kg",
     "scope": "aircraft",
     "src": [
      "LM15"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: มวลฝึกโดยประมาณ (ว่าง ~1,280 + ลูกเรือ + เชื้อเพลิง)"
    }
   }
  },
  "aero": {
   "flaps": {
    "detents": {
     "v": [
      {
       "name": "UP",
       "flap_deg": 0,
       "dCL0": 0,
       "dCD0": 0,
       "dCm0": 0,
       "CLmax": 1.54
      },
      {
       "name": "APP",
       "flap_deg": 20,
       "VFE_kt": 137,
       "dCL0": 0.3,
       "dCD0": 0.012,
       "dCm0": -0.03,
       "CLmax": 1.69
      },
      {
       "name": "LDG",
       "flap_deg": 42,
       "VFE_kt": 111,
       "dCL0": 0.6,
       "dCD0": 0.045,
       "dCm0": -0.06,
       "CLmax": 1.94
      }
     ],
     "u": "-",
     "scope": "aircraft",
     "src": [
      "LT1",
      "LT3",
      "LT5"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: VFE 137/111 KIAS [LT3]; CLmax จากตาราง stall AFM (1,785 kg 64/61/57 KIAS) [LT5 p.5-8]; อื่น ๆ เหมือน NG"
    }
   },
   "static_long": {
    "CLmax_target": {
     "v": {
      "UP": 1.54,
      "APP": 1.69,
      "LDG": 1.94
     },
     "u": "-",
     "scope": "aircraft",
     "src": [
      "LT5"
     ],
     "conf": "กลาง",
     "est": true,
     "note": "จาก VS ของ AFM (KIAS ≈ KCAS ใกล้ stall: ค่าประมาณ), nz 0.95"
    }
   },
   "legacy": {
    "v": {
     "CD0": 0.04369,
     "K": 0.04601,
     "CL0": 0.35,
     "CLa": 5.511,
     "CLflap": 0.6,
     "CDflap": 0.045,
     "CDgear": 0.012,
     "Cm0": -0.02,
     "Cma": -0.535,
     "Cmflap": -0.06,
     "aStall": 16.56,
     "aStallFlap": -1.7
    },
    "u": "-",
    "scope": "aircraft",
    "src": [
     "LM1",
     "LT2",
     "LT10"
    ],
    "conf": "ต่ำ",
    "est": true,
    "note": "ค่าประมาณ: fit ของ lm_legacy_fit + lt_run.mjs (da42_tae125): CD0/K รูปแบบซิม จาก glide ที่ประมาณจาก polar cruise; aStall/aStallFlap แก้ให้ CLmax ตรงเป้าด้วย elevator 15.5°; Cma −0.535 = จุดกลางค่าบินทดสอบ DA42 TDI −0.50…−0.57 [LT15] ตาม aero.static_long.Cmalpha (เดิม −1.10 คือ |Cmα| มากที่สุดที่ยัง stall ได้ภายใน elevator 15.5°; lm_derivs −1.75); CDgear ล้อพับ"
   }
  },
  "speeds": {
   "VS0_kt": {
    "v": 57,
    "u": "kt IAS",
    "scope": "aircraft",
    "src": [
     "LT5"
    ],
    "conf": "สูง",
    "est": false,
    "note": "1,785 kg แฟลป LDG [LT5 p.5-8]; สเปก AOPA 56 [LT16]"
   },
   "VS1_kt": {
    "v": 64,
    "u": "kt IAS",
    "scope": "aircraft",
    "src": [
     "LT5"
    ],
    "conf": "สูง",
    "est": false,
    "note": "1,785 kg UP [LT5]; AOPA 62 (1,700 kg) [LT16]"
   },
   "VX_kt": {
    "v": 79,
    "u": "kt IAS",
    "scope": "aircraft",
    "src": [
     "LT5"
    ],
    "conf": "ต่ำ",
    "est": false,
    "note": "AFM 4A.2 >1,700 kg (77 ≤1,700) การจับแถวตารางเป็นการอนุมาน [LT5 p.4A-3]; AOPA พิมพ์ VX 86 (น่าจะเป็น cruise climb) [LT16]"
   },
   "VY_kt": {
    "v": 79,
    "u": "kt IAS",
    "scope": "aircraft",
    "src": [
     "LT5",
     "LT16"
    ],
    "conf": "กลาง",
    "est": false,
    "note": "แฟลป UP >1,700 kg (77 ≤1,700) [LT5]; AOPA VY 79 [LT16]"
   },
   "climb_basis": {
    "v": {
     "VX": {
      "flap": "UP",
      "mass_kg": 1785
     },
     "VY": {
      "flap": "UP",
      "mass_kg": 1785
     }
    },
    "u": "-, kg",
    "scope": "aircraft",
    "src": [
     "LT5"
    ],
    "conf": "ต่ำ",
    "est": false,
    "note": "โครงแบบและมวลของ speeds.VX_kt และ VY_kt (R2-08): ทั้งคู่แฟลป UP แถว >1,700 kg ถึง MTOM 1,785 kg ของ AFM 4A.2 [LT5] (การจับแถวตารางเป็นการอนุมาน); ที่มวลฝึก 1,600 kg ใช้แถว ≤1,700 kg = 77 KIAS ในหัวข้อ 08 และ 09 (แก้มวล)"
   },
   "VR_kt": {
    "v": 72,
    "u": "kt IAS",
    "scope": "aircraft",
    "src": [
     "LT5",
     "LT16"
    ],
    "conf": "กลาง",
    "est": false,
    "note": ">1,700 kg (70 ≤1,700) [LT5]; AOPA 72 [LT16]"
   },
   "VAPP_kt": {
    "v": 82,
    "u": "kt IAS",
    "scope": "aircraft",
    "src": [
     "LT5"
    ],
    "conf": "ต่ำ",
    "est": false,
    "note": "final approach ขั้นต่ำ 82 KIAS (42.2 m/s) เท่ากันทั้งแถบ ≤1,700 และ >1,700 kg จึงใช้ได้ที่มวลฝึก 1,600 kg [LT5 p.4A-3]; ข้อความที่สกัดจากตาราง 4A.2 แถวปน การจับแถวเป็นการอนุมาน (§06.12); บัตรเป็นเจ้าของค่านี้ (D1)"
   },
   "VREF_kt": {
    "v": 76,
    "u": "kt IAS",
    "scope": "aircraft",
    "src": [
     "LT5"
    ],
    "conf": "ต่ำ",
    "est": false,
    "note": "แถวความเร็วต่ำสุดแฟลป LDG ของตาราง 4A.2 ที่แถบ ≤1,700 kg (มวลฝึก 1,600 kg) 76 KIAS (39.1 m/s); แถบ >1,700 kg 78 KIAS [LT5 p.4A-3]; การจับแถวเป็นการอนุมาน; ≈ 1.4 VS0 ที่ 1,600 kg; VAPP 82 ≥ VREF 76 (D1)"
   },
   "VA_kt": {
    "v": {
     "1542": 120,
     "1785": 126
    },
    "u": "kt IAS",
    "scope": "aircraft",
    "src": [
     "LT3"
    ],
    "conf": "สูง",
    "est": false,
    "note": "กับ MÄM 42-088 [LT3 p.2-4]"
   },
   "VNO_kt": {
    "v": 155,
    "u": "kt IAS",
    "scope": "aircraft",
    "src": [
     "LT3"
    ],
    "conf": "สูง",
    "est": false,
    "note": ""
   },
   "VNE_kt": {
    "v": 194,
    "u": "kt IAS",
    "scope": "aircraft",
    "src": [
     "LT3"
    ],
    "conf": "สูง",
    "est": false,
    "note": "192 KEAS [LT1]"
   },
   "VLE_kt": {
    "v": 194,
    "u": "kt IAS",
    "scope": "aircraft",
    "src": [
     "LT3"
    ],
    "conf": "สูง",
    "est": false,
    "note": ""
   },
   "VLO_kt": {
    "v": {
     "extend": 194,
     "retract": 156
    },
    "u": "kt IAS",
    "scope": "aircraft",
    "src": [
     "LT3"
    ],
    "conf": "สูง",
    "est": false,
    "note": ""
   },
   "VFE": {
    "v": {
     "APP": 137,
     "LDG": 111
    },
    "u": "kt IAS",
    "scope": "aircraft",
    "src": [
     "LT3"
    ],
    "conf": "สูง",
    "est": false,
    "note": ""
   },
   "VMCA_kt": {
    "v": 68,
    "u": "kt IAS",
    "scope": "aircraft",
    "src": [
     "LT3",
     "LT1"
    ],
    "conf": "สูง",
    "est": false,
    "note": "68 KEAS (72 กับ OÄM 42-252 / TAE 125-02-114) [LT1]"
   },
   "VYSE_kt": {
    "v": 82,
    "u": "kt IAS",
    "scope": "aircraft",
    "src": [
     "LT3",
     "LT5"
    ],
    "conf": "สูง",
    "est": false,
    "note": "blue radial [LT3 p.2-6]"
   },
   "VXSE_kt": {
    "v": 77,
    "u": "kt IAS",
    "scope": "aircraft",
    "src": [
     "LT16"
    ],
    "conf": "ต่ำ",
    "est": false,
    "note": "สเปก AOPA 2006 [LT16]; ไม่อยู่ใน AFM 1.5 [LT8]"
   },
   "VSSE_kt": {
    "v": 82,
    "u": "kt IAS",
    "scope": "aircraft",
    "src": [
     "LT8"
    ],
    "conf": "ต่ำ",
    "est": true,
    "note": "ค่าประมาณ = VYSE (AFM ไม่ให้ตัวเลข [LT8])"
   },
   "crosswind_demonstrated_kt": {
    "v": 20,
    "u": "kt",
    "scope": "aircraft",
    "src": [
     "LT16"
    ],
    "conf": "กลาง",
    "est": false,
    "note": "สเปก AOPA 2006 (จาก POH DA 42 1,785 kg) \"max demonstrated crosswind 20 kt\" [LT16]; NG/VI 25 kt"
   },
   "ias_cas": {
    "v": {
     "UP": [
      [
       62,
       62
      ],
      [
       155,
       155
      ],
      [
       156,
       155
      ],
      [
       194,
       192
      ]
     ],
     "APP": [
      [
       59,
       59
      ],
      [
       137,
       135
      ]
     ],
     "LDG": [
      [
       55,
       55
      ],
      [
       111,
       110
      ]
     ]
    },
    "u": "kt IAS → kt CAS",
    "scope": "aircraft",
    "src": [
     "LT1",
     "LT3"
    ],
    "conf": "ต่ำ",
    "est": true,
    "note": "คู่ TCDS (KEAS) กับ AFM 7.01.05 (KIAS); จุดใกล้ stall สมมติ KCAS = KIAS (ค่าประมาณ)"
   },
   "stall_table": {
    "v": {
     "axes": {
      "mass_kg": [
       1400,
       1700,
       1785
      ],
      "flap": [
       "UP",
       "APP",
       "LDG"
      ],
      "bank_deg": [
       0,
       30,
       45,
       60
      ]
     },
     "data": [
      [
       [
        56,
        60,
        68,
        83
       ],
       [
        53,
        58,
        65,
        78
       ],
       [
        49,
        53,
        61,
        75
       ]
      ],
      [
       [
        62,
        67,
        76,
        92
       ],
       [
        59,
        64,
        72,
        87
       ],
       [
        55,
        60,
        68,
        84
       ]
      ],
      [
       [
        64,
        69,
        78,
        95
       ],
       [
        61,
        66,
        74,
        90
       ],
       [
        57,
        62,
        70,
        86
       ]
      ]
     ]
    },
    "u": "kt IAS",
    "scope": "aircraft",
    "src": [
     "LT5"
    ],
    "conf": "กลาง",
    "est": false,
    "note": "AFM 5.3.4 idle [LT5 p.5-8] (ข้อความสกัดสับสน การจับล้อขึ้น/ลงเป็นการอนุมาน)"
   },
   "stall_altitude_loss_ft": {
    "v": 240,
    "u": "ft",
    "scope": "aircraft",
    "src": [
     "LC2",
     "LF1",
     "LG5",
     "LM0"
    ],
    "conf": "ต่ำ",
    "est": true,
    "note": "ค่าประมาณแบบค่าคลาส (วิธีเดียวกับ DA40 หัวข้อ 05): AFM DA 42 (TAE 125) ที่เปิดได้ไม่ให้ความสูงที่เสียระหว่าง stall และการแก้ จึงหารค่าที่ POH/AFM ให้ด้วย VS1² (KCAS) ของ c172s 230 ft (VS1 53 KCAS) [LC2], c152 160 ft (VS1 48 KCAS) [LF1], p2006t 180 ft (VS1 65 KCAS) [LG5] ได้สัมประสิทธิ์เฉลี่ย 0.0646 ft/kt² แล้วคูณ VS1² ที่มวลฝึก 1,600 kg (VS1 60.6 KCAS สเกลจาก 64 KIAS ที่ 1,785 kg ด้วย √m) = 240 ft (73 m); ช่วงตามสัมประสิทธิ์ต่ำสุด–สูงสุด 160–300 ft; stall ปีกระดับ สองเครื่อง ไม่รวมกรณีกำลังไม่สมมาตร"
   }
  },
  "performance": {
   "ROC_SL_fpm": {
    "v": 1060,
    "u": "fpm",
    "scope": "aircraft",
    "src": [
     "LT16"
    ],
    "conf": "กลาง",
    "est": false,
    "note": "สเปก AOPA 2006 (POH 3,935 lb) [LT16]"
   },
   "oei": {
    "v": {
     "ROC_SL_fpm": 160,
     "VYSE_kt_IAS": 82,
     "critical_engine": "left",
     "service_ceiling_ft": 10000
    },
    "u": "fpm, kt, ft",
    "scope": "aircraft",
    "src": [
     "LT16",
     "LT5"
    ],
    "conf": "กลาง",
    "est": false,
    "note": "[LT16]; เงื่อนไข AFM p.5-23 [LT5]"
   },
   "cruise_table": {
    "v": [
     {
      "h_ft": 10000,
      "power_pct": 80,
      "ktas": 156,
      "ff_lph_each": 23.8
     },
     {
      "h_ft": 10000,
      "power_pct": 60,
      "ktas": 138,
      "ff_lph_each": 16.7
     },
     {
      "h_ft": 10000,
      "power_pct": 50,
      "ktas": 127,
      "ff_lph_each": 13.6
     }
    ],
    "u": "ft, %, kt TAS, l/h",
    "scope": "aircraft",
    "src": [
     "LT16"
    ],
    "conf": "กลาง",
    "est": false,
    "note": "AOPA 2006"
   },
   "takeoff": {
    "v": {
     "ground_roll_m": 427,
     "over50ft_m": 691
    },
    "u": "m",
    "scope": "aircraft",
    "src": [
     "LT16"
    ],
    "conf": "กลาง",
    "est": false,
    "note": "1,401 / 2,267 ft SL std MTOW [LT16]"
   },
   "landing": {
    "v": {
     "ground_roll_m": 397,
     "over50ft_m": 710
    },
    "u": "m",
    "scope": "aircraft",
    "src": [
     "LT16"
    ],
    "conf": "กลาง",
    "est": false,
    "note": "1,302 / 2,329 ft [LT16]"
   },
   "glide": {
    "v": {
     "speed_kt": 82,
     "ratio": 13
    },
    "u": "kt CAS, -",
    "scope": "aircraft",
    "src": [
     "LM12"
    ],
    "conf": "ต่ำ",
    "est": true,
    "note": "ค่าประมาณจาก polar NG สเกลมวล 1,785 kg"
   }
  },
  "propulsion": {
   "layout": {
    "v": [
     {
      "id": 1,
      "side": "left",
      "pos": [
       1.47,
       -1.7,
       0.15
      ],
      "axis": [
       1,
       0,
       0
      ],
      "type": "piston",
      "model": "TAE 125 + MTV-6-A-C-F/CF187-129",
      "prop_sense": 1
     },
     {
      "id": 2,
      "side": "right",
      "pos": [
       1.47,
       1.7,
       0.15
      ],
      "axis": [
       1,
       0,
       0
      ],
      "type": "piston",
      "model": "TAE 125 + MTV-6-A-C-F/CF187-129",
      "prop_sense": 1
     }
    ],
    "u": "m FRD",
    "scope": "aircraft",
    "src": [
     "LT1"
    ],
    "conf": "กลาง",
    "est": true,
    "note": "ค่าประมาณ: CW ทั้งคู่; เครื่องซ้าย critical [LT5]"
   },
   "legacy": {
    "v": {
     "P": 198000,
     "eta": 0.9304,
     "T0": 6248,
     "idle": 0
    },
    "u": "W, -, N, -",
    "scope": "aircraft",
    "src": [
     "LT10",
     "LM0"
    ],
    "conf": "ต่ำ",
    "est": true,
    "note": "ค่าประมาณ: T0 จาก BEM (สองเครื่อง), Vc ปรับให้ ROC สูงสุดของซิม = POH (da42_tae125); idle 0 เพราะ polar ไม่รวมแรงต้านใบพัด"
   }
  },
  "piston": {
   "identity": {
    "v": {
     "model": "Technify (Thielert) TAE 125-01 / -02-99",
     "kind": "turbo_diesel",
     "displacement_L": 1.689,
     "cylinders": 4,
     "tcds": "EASA TCDS E.055"
    },
    "u": "-",
    "scope": "engine",
    "src": [
     "LT13",
     "LT1"
    ],
    "conf": "สูง",
    "est": false,
    "note": "-01: 1,689 cm³; -02-99: 1,991 cm³; เกียร์ 1:1.689; มวลแห้ง 134 kg [LT13]"
   },
   "ratings": {
    "v": {
     "P_rated": 99000,
     "rpm_rated": 2300,
     "P_mcp": 99000,
     "rpm_mcp": 2300,
     "rpm_redline": 2300
    },
    "u": "W, rpm",
    "scope": "engine",
    "src": [
     "LT3",
     "LT13",
     "LT1"
    ],
    "conf": "สูง",
    "est": false,
    "note": "99 kW (135 DIN-hp) ที่ 2,300 rpm ทั้ง take-off และต่อเนื่อง [LT3]"
   },
   "altitude": {
    "v": {
     "model": "turbo_flat"
    },
    "u": "-",
    "scope": "engine",
    "src": [
     "LT13"
    ],
    "conf": "ต่ำ",
    "est": true,
    "note": "ค่าประมาณ: turbo + FADEC; ตารางกำลังตามความสูงอยู่ใน AFM บทที่ 5"
   }
  },
  "propeller": {
   "identity": {
    "model": {
     "v": "mt-Propeller MTV-6-A-C-F/CF187-129",
     "u": "-",
     "scope": "propeller",
     "src": [
      "LT1"
     ],
     "conf": "สูง",
     "est": false,
     "note": "low pitch 12°, feather 81°, start lock 15° [LT1 A.III.7]"
    }
   },
   "engineInterface": {
    "maxShaftPower": {
     "v": 99,
     "u": "kW",
     "scope": "propeller",
     "src": [
      "LT3"
     ],
     "conf": "สูง",
     "est": false,
     "note": ""
    },
    "gearRatio": {
     "v": 1.689,
     "u": "-",
     "scope": "propeller",
     "src": [
      "LT13"
     ],
     "conf": "สูง",
     "est": false,
     "note": ""
    }
   },
   "checks": {
    "staticThrustISA": {
     "v": 3.12,
     "u": "kN",
     "scope": "propeller",
     "src": [
      "LM0",
      "LM24"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: BEM ต่อเครื่อง 99 kW"
    }
   }
  },
  "controls": {
   "surfaces": {
    "trim_tab": {
     "v": {
      "elevator": {
       "nose_up": 58,
       "nose_down": 25
      },
      "rudder": {
       "right": 30,
       "left": 29
      }
     },
     "u": "deg",
     "scope": "aircraft",
     "src": [
      "LT1"
     ],
     "conf": "สูง",
     "est": false,
     "note": "DA 42 มาตรฐาน; rudder tab RH 45 / LH 41 กับ OÄM 42-252 [LT1 A.III.16]"
    }
   }
  },
  "validation": {
   "takeoff_test": {
    "v": {
     "flap": "UP",
     "VR_kt": 72,
     "theta_deg": 9
    },
    "u": "kt IAS, deg",
    "scope": "aircraft",
    "src": [
     "LT5",
     "LT16"
    ],
    "conf": "ต่ำ",
    "est": true,
    "note": "VR 72 KIAS (>1,700 kg) [LT5 p.4A-3, LT16]; มุมเงย 9° ค่าประมาณเดียวกับ NG"
   },
   "stall_test": {
    "v": {
     "UP": 80,
     "APP": 76,
     "LDG": 72
    },
    "u": "kt",
    "scope": "aircraft",
    "src": [
     "LM1"
    ],
    "conf": "ต่ำ",
    "est": true,
    "note": "ค่าประมาณ: ความเร็วเริ่มการทดสอบ ~1.25 VS ของ TDI"
   }
  }
 }
}
```

#### da42_vi

```json
{
 "da42_vi": {
  "_inherits": {
   "v": "da42ng",
   "u": "-",
   "scope": "aircraft",
   "src": [],
   "conf": "สูง",
   "est": false,
   "note": "DA42-VI = ชื่อการค้าของ DA 42 NG ที่ทำ MÄM 42-600 [LT1 C.VI Note 13]; ทะเบียนไทยแยกไม่ได้ [LS17]; ใส่เฉพาะค่าที่ต่าง"
  },
  "airframe": {
   "identity": {
    "v": {
     "manufacturer": "Diamond Aircraft Industries GmbH (Austria)",
     "model": "DA 42 NG (DA42-VI)",
     "variant": "MÄM 42-600 (+ MÄM 42-659/678 MTOM 1,999 kg)",
     "engine": "2 × Austro E4-C (AE300)",
     "propeller": "2 × MTV-6-R-C-F/CF190-69 3 ใบ CW",
     "seats": 4,
     "category": "normal",
     "tc_ref": "EASA.A.005 Section C; AFM Doc 7.01.16"
    },
    "u": "-",
    "scope": "aircraft",
    "src": [
     "LT1",
     "LT6"
    ],
    "conf": "สูง",
    "est": false,
    "note": "ฝาครอบ/nacelle และ rudder ใหม่ [LT6 p.13]"
   },
   "weights": {
    "MTOW": {
     "v": 1999,
     "u": "kg",
     "scope": "aircraft",
     "src": [
      "LT1",
      "LT6"
     ],
     "conf": "สูง",
     "est": false,
     "note": "กับ MÄM 42-659 + 42-678 (ปกติของ VI) [LT6]"
    },
    "MLW": {
     "v": 1999,
     "u": "kg",
     "scope": "aircraft",
     "src": [
      "LT1"
     ],
     "conf": "สูง",
     "est": false,
     "note": ""
    },
    "MZFW": {
     "v": 1835,
     "u": "kg",
     "scope": "aircraft",
     "src": [
      "LT1"
     ],
     "conf": "สูง",
     "est": false,
     "note": ""
    },
    "BEW_typical": {
     "v": 1420,
     "u": "kg",
     "scope": "aircraft",
     "src": [
      "LT6"
     ],
     "conf": "กลาง",
     "est": false,
     "note": "ไม่มีอุปกรณ์เสริม"
    },
    "training_mass": {
     "v": {
      "kg": 1752,
      "empty_kg": 1450,
      "crew_kg": 170,
      "fuel_kg": 132,
      "fuel_l": 165
     },
     "u": "kg",
     "scope": "aircraft",
     "src": [
      "LT6",
      "LT10"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: มวลฝึกเดียวกับ da42ng เพื่อให้ VREF/VAPP อยู่แถบ ≤1,900 kg: empty_kg 1,450 kg = BEW_typical 1,420 kg (โบรชัวร์ VI [LT6]) + อุปกรณ์ของโรงเรียนราว 30 kg; ครูและศิษย์ 2 × 85 kg; Jet A-1 165 l × 0.80 kg/l = 132 kg"
    }
   },
   "cg": {
    "envelope": {
     "v": [
      [
       1510,
       2.357,
       2.46
      ],
      [
       1700,
       2.387,
       2.48
      ],
      [
       1900,
       2.418,
       2.48
      ],
      [
       1999,
       2.434,
       2.48
      ]
     ],
     "u": "kg, m DAT",
     "scope": "aircraft",
     "src": [
      "LT1"
     ],
     "conf": "สูง",
     "est": false,
     "note": "หน้า 2.434 m ที่ 1,999 kg; กับ OÄM 42-199 + MÄM 42-600 หลังสุด 2.460 m ที่ ≥1,510 kg [LT1 C.III.14]"
    }
   }
  },
  "speeds": {
   "VMCA_kt": {
    "v": 71,
    "u": "kt IAS",
    "scope": "aircraft",
    "src": [
     "LT9",
     "LT1"
    ],
    "conf": "กลาง",
    "est": false,
    "note": "TCDS 70 KEAS กับ MÄM 42-600 [LT1]; red radial 71 KIAS (สไลด์ VI) [LT9]; flashcard 71 UP / 68 APP [LT11]"
   },
   "VY_kt": {
    "v": 92,
    "u": "kt IAS",
    "scope": "aircraft",
    "src": [
     "LT9"
    ],
    "conf": "ต่ำ",
    "est": false,
    "note": ">1,900 kg (90 ≤1,900) [LT9]"
   },
   "VAPP_kt": {
    "v": 84,
    "u": "kt IAS",
    "scope": "aircraft",
    "src": [
     "LT9"
    ],
    "conf": "ต่ำ",
    "est": false,
    "note": "approach แฟลป APP ขั้นต่ำ 84 KIAS (43.2 m/s) ที่มวลฝึก 1,752 kg (แถบ ≤1,900 kg) จากสไลด์ของเครื่อง DA42-VI [LT9]; แถบ >1,900 kg ถึง 1,999 kg 88 KIAS; บัตรเป็นเจ้าของค่านี้ (D1)"
   },
   "VREF_kt": {
    "v": 84,
    "u": "kt IAS",
    "scope": "aircraft",
    "src": [
     "LT9"
    ],
    "conf": "ต่ำ",
    "est": false,
    "note": "final approach แฟลป LDG ขั้นต่ำ 84 KIAS ที่มวลฝึก 1,752 kg (แถบ ≤1,900 kg) [LT9]; แถบ >1,900 kg 86 KIAS; VAPP = VREF (D1)"
   },
   "VA_kt": {
    "v": {
     "1700": 112,
     "1800": 119,
     "1999": 122
    },
    "u": "kt IAS",
    "scope": "aircraft",
    "src": [
     "LT1",
     "LT2"
    ],
    "conf": "กลาง",
    "est": true,
    "note": "ค่าประมาณเฉพาะแถบ >1,800 kg: TCDS ให้ VA 125 KEAS สำหรับมวลเกิน 1,800 kg ซึ่งครอบคลุมถึง MTOM 1,999 kg (MÄM 42-659/678) [LT1 C.III.10]; แปลงเป็น 122 KIAS ด้วยคู่ของ AFM NG (vO 122 KIAS ที่ >1,800 kg [LT2 p.2-4]) เพราะ AFM ของ DA42-VI (7.01.16) เปิดไม่ได้; ≤1,700 kg 112 และ ≤1,800 kg 119 KIAS เหมือน NG"
   },
   "VS0_kt": {
    "v": 64,
    "u": "kt IAS",
    "scope": "aircraft",
    "src": [
     "LT11",
     "LT6"
    ],
    "conf": "กลาง",
    "est": false,
    "note": "1,999 kg; 62 KCAS ตามโบรชัวร์ [LT6]"
   },
   "VS1_kt": {
    "v": 72,
    "u": "kt IAS",
    "scope": "aircraft",
    "src": [
     "LT11"
    ],
    "conf": "ต่ำ",
    "est": false,
    "note": "1,999 kg (flashcard)"
   },
   "crosswind_demonstrated_kt": {
    "v": 25,
    "u": "kt",
    "scope": "aircraft",
    "src": [
     "LT6"
    ],
    "conf": "กลาง",
    "est": false,
    "note": "25 kt / 46 km/h [LT6 p.19]"
   }
  },
  "performance": {
   "ROC_SL_fpm": {
    "v": 1114,
    "u": "fpm",
    "scope": "aircraft",
    "src": [
     "LT6"
    ],
    "conf": "กลาง",
    "est": false,
    "note": "MTOM 1,999 kg ISA [LT6 p.19]"
   },
   "oei": {
    "v": {
     "service_ceiling_ft": 16000,
     "absolute_ceiling_ft": 17500,
     "critical_engine": "left"
    },
    "u": "ft",
    "scope": "aircraft",
    "src": [
     "LT6"
    ],
    "conf": "กลาง",
    "est": false,
    "note": "เพดาน OEI 16,000 ft (50 fpm) และ absolute 17,500 ft ใต้หัวตาราง \"MTOM, ISA\" [LT6 p.19] ซึ่งไม่ระบุมวลของค่านี้ และไม่มี ROC OEI ที่ SL; การตรวจความสอดคล้องกับ 210 fpm ของ NG อยู่ที่ da42ng performance.oei_ceiling_model และ §06.4.1"
   },
   "takeoff": {
    "v": {
     "ground_roll_m": 375,
     "over50ft_m": 649
    },
    "u": "m",
    "scope": "aircraft",
    "src": [
     "LT6"
    ],
    "conf": "กลาง",
    "est": false,
    "note": "short-field MSL MTOM ISA [LT6]"
   },
   "landing": {
    "v": {
     "ground_roll_m": 387,
     "over50ft_m": 647
    },
    "u": "m",
    "scope": "aircraft",
    "src": [
     "LT6"
    ],
    "conf": "กลาง",
    "est": false,
    "note": "[LT6]; หน้าเว็บอีกแห่งให้ ground roll 340 m [LT7]"
   },
   "cruise_table": {
    "v": [
     {
      "h_ft": 16000,
      "power_pct": 92,
      "ktas": 190
     },
     {
      "h_ft": 16000,
      "power_pct": 92,
      "ktas": 197,
      "tow_kg": 1760
     },
     {
      "h_ft": 16000,
      "power_pct": 75,
      "ktas": 175,
      "ff_lph_total": 49.2
     },
     {
      "h_ft": 18000,
      "power_pct": 50,
      "ktas": 141,
      "ff_lph_total": 33.3
     }
    ],
    "u": "ft, %, kt TAS, l/h",
    "scope": "aircraft",
    "src": [
     "LT6"
    ],
    "conf": "กลาง",
    "est": false,
    "note": "โบรชัวร์ [LT6 p.19 และหน้าพิสัย]: MCP 16,000 ft 190 KTAS (หัวตาราง MTOM ISA) และ 197 KTAS ที่ TOW 1,760 kg; 75 % 175 KTAS 49.2 l/h รวม; 50 % FL180 141 KTAS 33.3 l/h รวม"
   }
  },
  "piston": {
   "identity": {
    "v": {
     "model": "Austro Engine E4-C (AE300)",
     "kind": "turbo_diesel",
     "displacement_L": 1.991,
     "cylinders": 4,
     "tcds": "EASA TCDS E.200"
    },
    "u": "-",
    "scope": "engine",
    "src": [
     "LT1",
     "LT12"
    ],
    "conf": "สูง",
    "est": false,
    "note": "MCP 2,300 rpm กับ MÄM 42-600 [LT1 C.III.5]"
   },
   "ratings": {
    "v": {
     "P_rated": 123500,
     "rpm_rated": 2300,
     "P_mcp": 114000,
     "rpm_mcp": 2300,
     "rpm_redline": 2300
    },
    "u": "W, rpm",
    "scope": "engine",
    "src": [
     "LT1"
    ],
    "conf": "สูง",
    "est": false,
    "note": "MCP 92 % ที่ 2,300 rpm"
   }
  },
  "propeller": {
   "identity": {
    "model": {
     "v": "mt-Propeller MTV-6-R-C-F/CF190-69",
     "u": "-",
     "scope": "propeller",
     "src": [
      "LT1"
     ],
     "conf": "สูง",
     "est": false,
     "note": "low pitch 13°, feather 80°, start lock 15° [LT1]"
    },
    "diameter": {
     "v": 1.9,
     "u": "m",
     "scope": "propeller",
     "src": [
      "LT1"
     ],
     "conf": "สูง",
     "est": false,
     "note": "1,900 mm"
    }
   },
   "governor": {
    "betaFlightIdle": {
     "v": 13,
     "u": "deg @0.75R",
     "scope": "propeller",
     "src": [
      "LT1"
     ],
     "conf": "สูง",
     "est": false,
     "note": ""
    },
    "betaFeather": {
     "v": 80,
     "u": "deg @0.75R",
     "scope": "propeller",
     "src": [
      "LT1"
     ],
     "conf": "สูง",
     "est": false,
     "note": ""
    }
   },
   "checks": {
    "staticThrustISA": {
     "v": 3.45,
     "u": "kN",
     "scope": "propeller",
     "src": [
      "LM0",
      "LM24"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: BEM ต่อเครื่อง"
    }
   }
  },
  "controls": {
   "surfaces": {
    "trim_tab": {
     "v": {
      "elevator": {
       "nose_up": 28,
       "nose_down": 25
      },
      "rudder": {
       "right": 43,
       "left": 39
      }
     },
     "u": "deg",
     "scope": "aircraft",
     "src": [
      "LT1"
     ],
     "conf": "สูง",
     "est": false,
     "note": "MÄM 42-600 (48/36 กับ MÄM 42-885) [LT1]"
    }
   }
  },
  "aero": {
   "legacy": {
    "v": {
     "CD0": 0.04166,
     "K": 0.04413,
     "CL0": 0.35,
     "CLa": 5.511,
     "CLflap": 0.6,
     "CDflap": 0.045,
     "CDgear": 0.012,
     "Cm0": -0.02,
     "Cma": -0.535,
     "Cmflap": -0.06,
     "aStall": 15.77,
     "aStallFlap": -1.8
    },
    "u": "-",
    "scope": "aircraft",
    "src": [
     "LM1",
     "LT2",
     "LT10"
    ],
    "conf": "ต่ำ",
    "est": true,
    "note": "ค่าประมาณ: fit ของ lm_legacy_fit + lt_run.mjs (da42_vi): CD0/K รูปแบบซิม จาก glide ที่ประมาณจาก polar cruise; aStall/aStallFlap แก้ให้ CLmax ตรงเป้าด้วย elevator 15.5°; Cma −0.535 = จุดกลางค่าบินทดสอบ DA42 TDI −0.50…−0.57 [LT15] ตาม aero.static_long.Cmalpha (เดิม −1.10 คือ |Cmα| มากที่สุดที่ยัง stall ได้ภายใน elevator 15.5°; lm_derivs −1.75); CDgear ล้อพับ"
   }
  },
  "propulsion": {
   "legacy": {
    "v": {
     "P": 247000,
     "eta": 0.8626,
     "T0": 6900,
     "idle": 0
    },
    "u": "W, -, N, -",
    "scope": "aircraft",
    "src": [
     "LT10",
     "LM0"
    ],
    "conf": "ต่ำ",
    "est": true,
    "note": "ค่าประมาณ: T0 จาก BEM (สองเครื่อง), Vc ปรับให้ ROC สูงสุดของซิม = POH (da42_vi); idle 0 เพราะ polar ไม่รวมแรงต้านใบพัด"
   }
  }
 }
}
```
