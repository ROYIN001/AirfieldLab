
#### da40ng

```json
{
 "da40ng": {
  "airframe": {
   "identity": {
    "v": {
     "manufacturer": "Diamond Aircraft Industries (TC holder: Diamond Aircraft Industries Inc., Canada)",
     "model": "DA 40 NG",
     "variant": "DA 40 NG (MÄM 40-662, MTOM 1310 kg)",
     "engine": "Austro Engine E4 (AE300) turbo-diesel, EECU/FADEC single lever",
     "propeller": "MT-Propeller MTV-6-R/190-69, 3 ใบ constant speed",
     "seats": 4,
     "category": "normal",
     "tc_ref": "EASA TCDS EASA.IM.A.022 Issue 24 (Section D); state of design Transport Canada A-224"
    },
    "u": "-",
    "scope": "aircraft",
    "src": [
     "LD1",
     "LD5"
    ],
    "conf": "สูง",
    "est": false,
    "note": "ปีกต่ำ cantilever โครงสร้าง composite ล้อสามล้อตายตัว หาง T, winglet เป็นอุปกรณ์เสริม [LD1 p.26]; ไม่มี DA 40 NG ในโรงเรียนพลเรือนไทย ผู้ใช้ในไทยคือผู้ใช้ทางทหาร [LS1][LS21]"
   },
   "weights": {
    "MTOW": {
     "v": 1310,
     "u": "kg",
     "scope": "aircraft",
     "src": [
      "LD1",
      "LD2"
     ],
     "conf": "สูง",
     "est": false,
     "note": "2,888 lb เมื่อทำ MÄM 40-662 (ค่ามาตรฐานเดิม 1,280 kg / 2,822 lb) [LD1 p.31 note 8][LD2 p.2-16]"
    },
    "MLW": {
     "v": 1280,
     "u": "kg",
     "scope": "aircraft",
     "src": [
      "LD1",
      "LD2"
     ],
     "conf": "สูง",
     "est": false,
     "note": "2,822 lb กับ MÄM 40-574 / OÄM 40-334 / MÄM 40-662; มาตรฐานเดิม 1,216 kg (2,681 lb) [LD1 p.31]"
    },
    "MRW": {
     "v": 1314,
     "u": "kg",
     "scope": "aircraft",
     "src": [
      "LD2"
     ],
     "conf": "สูง",
     "est": false,
     "note": "AFM อนุญาตมวลบนลานจอดเกิน MTOM ได้ 4 kg เมื่อนับเที่ยวบินตั้งแต่ติดเครื่อง [LD2 p.2-18]"
    },
    "MZFW": {
     "v": 1265,
     "u": "kg",
     "scope": "aircraft",
     "src": [
      "LD1"
     ],
     "conf": "สูง",
     "est": false,
     "note": "2,789 lb กับ MÄM 40-574/662 (มาตรฐานเดิม 1,200 kg) [LD1 p.31]"
    },
    "min_flight_mass": {
     "v": 940,
     "u": "kg",
     "scope": "aircraft",
     "src": [
      "LD1",
      "LD2"
     ],
     "conf": "สูง",
     "est": false,
     "note": "2,072 lb [LD2 p.2-16]"
    },
    "BEW_typical": {
     "v": 903,
     "u": "kg",
     "scope": "aircraft",
     "src": [
      "LD4"
     ],
     "conf": "กลาง",
     "est": false,
     "note": "ค่าโบรชัวร์ \"without options\" 1,991 lb [LD4]; ตัวอย่างใน AFM บท 6 = 900 kg ที่ 2.422 m DAT (อ่านผ่านโมเดล FlightGear ที่อ้างหน้า AFM [LB19]); เครื่องที่ติดอุปกรณ์จริงหนักกว่า"
    },
    "max_fuel_usable": {
     "v": 118,
     "u": "kg",
     "scope": "aircraft",
     "src": [
      "LD1",
      "LD4"
     ],
     "conf": "สูง",
     "est": false,
     "note": "ถังพิสัยไกล 147.6 l (39 US gal) usable × Jet A-1 0.80 kg/l [LM19] (ถังมาตรฐาน 106.0 l = 85 kg) [LD1 p.28]"
    },
    "useful_load": {
     "v": 407,
     "u": "kg",
     "scope": "aircraft",
     "src": [
      "LD4"
     ],
     "conf": "กลาง",
     "est": false,
     "note": "โบรชัวร์ (MTOM − น้ำหนักเปล่าไม่มีอุปกรณ์เสริม) [LD4]"
    },
    "training_mass": {
     "v": {
      "kg": 1150,
      "empty_kg": 903,
      "crew_kg": 170,
      "fuel_kg": 77,
      "fuel_l": 96
     },
     "u": "kg",
     "scope": "aircraft",
     "src": [
      "LD2",
      "LD4",
      "LM19"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ (D3): empty_kg = BEW_typical 903 kg (โบรชัวร์ ไม่มีอุปกรณ์เสริม [LD4]) + ครูฝึกและศิษย์ 2 × 85 kg + Jet A-1 96 l (77 kg ที่ 0.80 kg/l [LM19], ราว 90 % ของถังมาตรฐาน 106 l) = 1,150 kg (2,535 lb); อยู่ในช่วง 940–1,310 kg [LD2 p.2-16]; ฉบับก่อน 19 พ.ย. 2026 ใช้เปล่า 920 kg + 75 l ได้มวลรวมเท่ากัน จึงไม่มีผลต่อผลทดสอบ"
    }
   },
   "cg": {
    "datum": {
     "v": "ระนาบ datum อยู่หน้าขอบหน้าของ stub-wing ที่ root rib 2.194 m (86.38 in); ปรับระดับด้วยลิ่ม 600:31 บนท่อลำตัวหน้าครีบหลัง",
     "u": "-",
     "scope": "aircraft",
     "src": [
      "LD1",
      "LD2"
     ],
     "conf": "สูง",
     "est": false,
     "note": "TCDS พิมพ์ \"2.194 mm\" ซึ่งคือ 2,194 mm [LD1 p.29][LD2 p.2-18]"
    },
    "LEMAC": {
     "v": 2.229,
     "u": "m DAT",
     "scope": "aircraft",
     "src": [
      "LD2",
      "LD1"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ (scripts/ld_geom.mjs): ขอบหน้าที่ root rib 2.194 m + LE sweep 1° × ระยะ MAC จากแนวกลาง 2.63 m ของปีกเรียวตรงเทียบเท่า (taper 0.55) ≈ 87.8 in"
    },
    "MAC": {
     "v": 1.171,
     "u": "m",
     "scope": "aircraft",
     "src": [
      "LD2"
     ],
     "conf": "สูง",
     "est": false,
     "note": "3 ft 10 in [LD2 p.1-5]"
    },
    "envelope": {
     "v": [
      [
       940,
       2.4,
       2.53
      ],
      [
       1080,
       2.4,
       2.53
      ],
      [
       1280,
       2.46,
       2.53
      ],
      [
       1310,
       2.469,
       2.53
      ]
     ],
     "u": "kg, m DAT",
     "scope": "aircraft",
     "src": [
      "LD1",
      "LD2"
     ],
     "conf": "สูง",
     "est": false,
     "note": "แถว [มวล, หน้าสุด, หลังสุด] ตาม TCDS; หน้าสุดเปลี่ยนเชิงเส้น 2.40 m (94.5 in) ที่ ≤1,080 kg ถึง 2.469 m (97.2 in) ที่ 1,310 kg; หลังสุด 2.53 m (99.6 in) ทุกมวล [LD1 p.29]; ค่า %MAC ≈ 14.6–20.5 % (หน้า) และ 25.7 % (หลัง) คิดกับ airframe.cg.LEMAC ซึ่งบัตรประมาณเอง (est:true ที่ leaf นั้น) ตัวเลขช่วง CG เองมาจาก TCDS โดยตรง"
    },
    "ref": {
     "v": {
      "m_DAT": 2.47,
      "pct_mac": 20.6
     },
     "u": "m DAT",
     "scope": "aircraft",
     "src": [
      "LD1"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: CG อ้างอิงกลางช่วงที่มวลฝึก 1,150 kg (หน้าสุด 2.421, หลังสุด 2.53 m) ใช้เป็นจุดกำเนิด FRD และ inertia"
    }
   },
   "wing": {
    "S": {
     "v": 13.244,
     "u": "m2",
     "scope": "aircraft",
     "src": [
      "LD2"
     ],
     "conf": "สูง",
     "est": false,
     "note": "142.6 sq ft [LD2 p.1-5] (DA 40 รุ่นเดิม 13.54 m² [LD6])"
    },
    "b": {
     "v": 11.63,
     "u": "m",
     "scope": "aircraft",
     "src": [
      "LD2",
      "LD4"
     ],
     "conf": "สูง",
     "est": false,
     "note": "38 ft 2 in [LD2 p.1-5]"
    },
    "MAC": {
     "v": 1.171,
     "u": "m",
     "scope": "aircraft",
     "src": [
      "LD2"
     ],
     "conf": "สูง",
     "est": false,
     "note": "[LD2 p.1-5]"
    },
    "AR": {
     "v": 10.223,
     "u": "-",
     "scope": "aircraft",
     "src": [
      "LD2"
     ],
     "conf": "สูง",
     "est": false,
     "note": "[LD2 p.1-5]"
    },
    "taper": {
     "v": 0.55,
     "u": "-",
     "scope": "aircraft",
     "src": [
      "LD2"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: ปีกเรียวตรงเทียบเท่าที่ให้ S, b, MAC ตาม AFM (ld_geom.mjs): c_root 1.471 m, c_tip 0.807 m; ปีกจริงมี stub wing ตรงช่วงในแล้วเรียว"
    },
    "sweep_c4_deg": {
     "v": -0.6,
     "u": "deg",
     "scope": "aircraft",
     "src": [
      "LD6"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณจาก LE sweep ≈ 1° [LD6 p.1-6] กับ taper เทียบเท่า"
    },
    "dihedral_deg": {
     "v": 5,
     "u": "deg",
     "scope": "aircraft",
     "src": [
      "LD6"
     ],
     "conf": "กลาง",
     "est": false,
     "note": "\"approx. 5°\" ใน AFM DA 40 รุ่น IO-360 [LD6 p.1-6]; โครงปีกเดียวกับ NG (ยังไม่พบใน AFM NG)"
    },
    "incidence_deg": {
     "v": 1,
     "u": "deg",
     "scope": "aircraft",
     "src": [
      "LB19"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: ไม่พบในเอกสารเผยแพร่; ค่า Aeromatic ของโมเดล FlightGear 1.0° [LB19] ใช้เพื่อ trim เท่านั้น"
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
     "note": "ค่าประมาณ: washout ทั่วไปของปีก GA ไม่พบค่าจริง"
    },
    "airfoil": {
     "v": "Wortmann FX 63-137/20-W4",
     "u": "-",
     "scope": "aircraft",
     "src": [
      "LD2",
      "LD6"
     ],
     "conf": "สูง",
     "est": false,
     "note": "ปรับจาก FX 63-137 (หนา 13.7 %, โค้งมาก) [LD2 p.1-5]"
    },
    "position": {
     "v": "low",
     "u": "-",
     "scope": "aircraft",
     "src": [
      "LD1"
     ],
     "conf": "สูง",
     "est": false,
     "note": "cantilever low wing (Section D p.26) [LD1 p.26]"
    },
    "x_c4_root": {
     "v": 2.55,
     "u": "m",
     "scope": "aircraft",
     "src": [
      "LD1",
      "LD2"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: ระยะจากจมูก (≈ 0 m DAT ตามโมเดล FlightGear [LB19]) ถึง c/4 ของคอร์ดโคน = 2.18 + 0.25 × 1.47 m (ใช้ใน lm_derivs สำหรับผลของลำตัว)"
    }
   },
   "tail": {
    "S_h": {
     "v": 2.34,
     "u": "m2",
     "scope": "aircraft",
     "src": [
      "LD2"
     ],
     "conf": "สูง",
     "est": false,
     "note": "25.2 sq ft [LD2 p.1-6]"
    },
    "b_h": {
     "v": 3.39,
     "u": "m",
     "scope": "aircraft",
     "src": [
      "LD2"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: AR หางระดับ ≈ 4.9 (ภาพด้านบน) × S_h"
    },
    "l_h": {
     "v": 4.78,
     "u": "m",
     "scope": "aircraft",
     "src": [
      "LD2"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: c/4 หางระดับบนยอดครีบ ≈ 7.30 m DAT ลบ c/4 MAC 2.52 m (ld_geom.mjs); V_H ≈ 0.72; โมเดล FlightGear (Aeromatic) ใช้ 6.0 m [LB19]"
    },
    "S_v": {
     "v": 1.6,
     "u": "m2",
     "scope": "aircraft",
     "src": [
      "LD2"
     ],
     "conf": "สูง",
     "est": false,
     "note": "17.2 sq ft รวม rudder [LD2 p.1-6]"
    },
    "h_h": {
     "v": 0.116,
     "u": "-",
     "scope": "aircraft",
     "src": [
      "LD1"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ h_H/b: หาง T อยู่สูงกว่าระนาบปีกต่ำราว 1.35 m (ความสูงเครื่อง 1.97 m) / b 11.63 m; ใช้ใน lm_derivs (downwash ที่หาง)"
    },
    "z_v": {
     "v": 0.6,
     "u": "m",
     "scope": "aircraft",
     "src": [
      "LD2"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: จุดศูนย์กลางแรงของครีบเหนือแกนลำตัว"
    },
    "b_v": {
     "v": 1.3,
     "u": "m",
     "scope": "aircraft",
     "src": [
      "LD2"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณจากความสูงเครื่อง 1.97 m และภาพด้านข้าง"
    },
    "l_v": {
     "v": 4.38,
     "u": "m",
     "scope": "aircraft",
     "src": [
      "LD2"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: c/4 ครีบ ≈ 6.90 m DAT ลบ 2.52 m; V_V ≈ 0.046"
    },
    "airfoil_h": {
     "v": "ไม่เผยแพร่ (สมมาตร)",
     "u": "-",
     "scope": "aircraft",
     "src": [
      "LD2"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: หน้าตัดสมมาตร"
    },
    "airfoil_v": {
     "v": "ไม่เผยแพร่ (สมมาตร)",
     "u": "-",
     "scope": "aircraft",
     "src": [
      "LD2"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ"
    },
    "incidence_h_deg": {
     "v": -3,
     "u": "deg",
     "scope": "aircraft",
     "src": [
      "LD6"
     ],
     "conf": "กลาง",
     "est": false,
     "note": "\"approx. −3.0° relative to longitudinal axis\" ใน AFM DA 40 [LD6 p.1-6]; ใช้กับ NG ด้วย (หางเดียวกัน)"
    }
   },
   "surfaces": {
    "elevator": {
     "v": {
      "area_m2": 0.665,
      "chord_ratio": 0.28,
      "span_fraction": 1
     },
     "u": "-",
     "scope": "aircraft",
     "src": [
      "LD2"
     ],
     "conf": "กลาง",
     "est": true,
     "note": "พื้นที่ 7.2 sq ft [LD2 p.1-6]; chord_ratio ค่าประมาณ = S_e/S_h"
    },
    "aileron": {
     "v": {
      "area_m2": 0.654,
      "chord_ratio": 0.27,
      "span_fraction": [
       0.72,
       0.97
      ]
     },
     "u": "-",
     "scope": "aircraft",
     "src": [
      "LD2"
     ],
     "conf": "กลาง",
     "est": true,
     "note": "พื้นที่รวมสองข้าง 0.654 m² [LD2 p.1-5]; chord ratio และตำแหน่งตามช่วงปีกเป็นค่าประมาณจากพื้นที่และภาพ"
    },
    "rudder": {
     "v": {
      "area_m2": 0.47,
      "chord_ratio": 0.29,
      "span_fraction": 1
     },
     "u": "-",
     "scope": "aircraft",
     "src": [
      "LD2"
     ],
     "conf": "กลาง",
     "est": true,
     "note": "พื้นที่ 0.47 m² [LD2 p.1-6]; chord ratio ค่าประมาณ = S_r/S_v"
    },
    "flap": {
     "v": {
      "area_m2": 1.56,
      "chord_ratio": 0.25,
      "span_fraction": [
       0.1,
       0.7
      ]
     },
     "u": "-",
     "scope": "aircraft",
     "src": [
      "LD2"
     ],
     "conf": "กลาง",
     "est": true,
     "note": "พื้นที่รวม 1.56 m² [LD2 p.1-5]; chord ratio และช่วงเป็นค่าประมาณ"
    },
    "trim_tab": {
     "v": {
      "area_m2": null,
      "chord_ratio": null,
      "span_fraction": null,
      "kind": "tab บน elevator ขับด้วย Bowden cable"
     },
     "u": "-",
     "scope": "aircraft",
     "src": [
      "LD6"
     ],
     "conf": "กลาง",
     "est": false,
     "note": "ขนาดไม่เผยแพร่ [LD6 p.7-4]"
    }
   },
   "geometry": {
    "length": {
     "v": 8.06,
     "u": "m",
     "scope": "aircraft",
     "src": [
      "LD2",
      "LD4"
     ],
     "conf": "สูง",
     "est": false,
     "note": "26 ft 5 in [LD2 p.1-5]"
    },
    "span": {
     "v": 11.63,
     "u": "m",
     "scope": "aircraft",
     "src": [
      "LD2"
     ],
     "conf": "สูง",
     "est": false,
     "note": ""
    },
    "height": {
     "v": 1.97,
     "u": "m",
     "scope": "aircraft",
     "src": [
      "LD2"
     ],
     "conf": "สูง",
     "est": false,
     "note": "6 ft 6 in"
    },
    "wheelbase": {
     "v": 1.68,
     "u": "m",
     "scope": "aircraft",
     "src": [
      "LD2"
     ],
     "conf": "กลาง",
     "est": false,
     "note": "5 ft 6 in; 1.85 m ถ้าทำ MÄM 40-574 [LD2 p.1-6]; ข้อความ AFM รุ่นเดิมสลับกับ track ใน OCR [LD6 p.1-7] ส่วนโมเดล FlightGear วัดได้ 1.78 m [LB19]"
    },
    "main_track": {
     "v": 2.97,
     "u": "m",
     "scope": "aircraft",
     "src": [
      "LD2"
     ],
     "conf": "กลาง",
     "est": false,
     "note": "9 ft 9 in [LD2 p.1-6]; FlightGear 2.89 m [LB19]"
    },
    "prop_clearance": {
     "v": 0.25,
     "u": "m",
     "scope": "aircraft",
     "src": [
      "LD2"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณจากภาพ ไม่พบตัวเลข"
    },
    "eye_pos_FRD": {
     "v": [
      -0.07,
      -0.25,
      -0.75
     ],
     "u": "m FRD",
     "scope": "aircraft",
     "src": [
      "LB19"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: ที่นั่งหน้า 2.30 m DAT [LD8] (ตาอยู่หลังกว่าราว 0.1 m), y −0.25 m ที่นั่งซ้าย, ตาสูงกว่า CG ราว 0.75 m"
    },
    "eye_height_static": {
     "v": 1.65,
     "u": "m",
     "scope": "aircraft",
     "src": [
      "LB19"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: CG สูงจากพื้นราว 0.85 m + 0.75 m + ยุบตัวล้อ"
    },
    "fuselage_width": {
     "v": 1.18,
     "u": "m",
     "scope": "aircraft",
     "src": [
      "LD4"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ (ห้องโดยสารกว้างราว 1.18 m ไม่พบตัวเลขในแหล่งปฐมภูมิ)"
    },
    "fuselage_height": {
     "v": 1.25,
     "u": "m",
     "scope": "aircraft",
     "src": [
      "LD2"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณจากภาพ"
    }
   },
   "inertia": {
    "Ixx": {
     "v": 2568,
     "u": "kg m2",
     "scope": "aircraft",
     "src": [
      "LM15",
      "LM8"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: Roskam radii คลาส single_prop (Rx 0.257) × มวล 1150 kg, b 11.63 m (lm_inertia, ±30 %)"
    },
    "Iyy": {
     "v": 2380,
     "u": "kg m2",
     "scope": "aircraft",
     "src": [
      "LM15",
      "LM8"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: Ry 0.357, L 8.06 m"
    },
    "Izz": {
     "v": 4548,
     "u": "kg m2",
     "scope": "aircraft",
     "src": [
      "LM15",
      "LM8"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: Rz 0.404"
    },
    "Ixz": {
     "v": 0,
     "u": "kg m2",
     "scope": "aircraft",
     "src": [
      "LM15"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: ไม่ทราบ ตั้ง 0 ตาม lm_card DEFAULTS"
    },
    "ref_mass": {
     "v": 1150,
     "u": "kg",
     "scope": "aircraft",
     "src": [
      "LD2"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "มวลฝึก (ค่าประมาณ) ที่ CG อ้างอิง 2.47 m DAT"
    },
    "radii": {
     "v": {
      "Rx": 0.257,
      "Ry": 0.357,
      "Rz": 0.404
     },
     "u": "-",
     "scope": "aircraft",
     "src": [
      "LM15"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: ค่าคลาส single_prop ของ 01-methods §01.4 (ไม่ใช่ค่าเฉพาะ DA40)"
    },
    "method": {
     "v": "Roskam radii of gyration (lm_inertia.mjs) — ไม่มีค่าวัดของ DA40 เผยแพร่; โมเดล FlightGear ใช้ Ixx/Iyy/Izz 1,220/1,627/6,779 kg m² ที่ปรับตามความรู้สึก [LB19]",
     "u": "-",
     "scope": "aircraft",
     "src": [
      "LM15",
      "LB19"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ"
    }
   }
  }
 }
}
```

```json
{
 "da40ng": {
  "speeds": {
   "VS0_kt": {
    "v": 60,
    "u": "kt IAS",
    "scope": "aircraft",
    "src": [
     "LD3",
     "LD7"
    ],
    "conf": "กลาง",
    "est": false,
    "note": "แฟลป LDG 1,310 kg ปีกระดับ idle; ≈ 58 KCAS (Diamond ระบุ stall landing config 58 KCAS ที่ MTOM [LD4]); 59 KIAS ที่ 1,200 kg [LD3]"
   },
   "VS1_kt": {
    "v": 66,
    "u": "kt IAS",
    "scope": "aircraft",
    "src": [
     "LD3",
     "LD7"
    ],
    "conf": "กลาง",
    "est": false,
    "note": "แฟลป UP 1,310 kg; ตาราง: 58/61/64/66 KIAS ที่ 1,000/1,100/1,200/1,310 kg [LD3]"
   },
   "VY_kt": {
    "v": 72,
    "u": "kt IAS",
    "scope": "aircraft",
    "src": [
     "LD3",
     "LD7"
    ],
    "conf": "กลาง",
    "est": false,
    "note": "best rate ถึงความสูงปลอดภัย แฟลป T/O [LD3]; ไต่แบบ cruise climb แฟลป UP 88 KIAS"
   },
   "VR_kt": {
    "v": 67,
    "u": "kt IAS",
    "scope": "aircraft",
    "src": [
     "LD3"
    ],
    "conf": "กลาง",
    "est": false,
    "note": "แฟลป T/O 1,280 kg; 56/58/61/65/67 KIAS ที่ 940/1,000/1,100/1,200/1,280 kg; V50 72 KIAS ที่ 1,280 kg [LD3]"
   },
   "VAPP_kt": {
    "v": 74,
    "u": "kt IAS",
    "scope": "aircraft",
    "src": [
     "LD3"
    ],
    "conf": "กลาง",
    "est": false,
    "note": "D1: ที่ training_mass 1,150 kg แฟลป LDG ลมสงบ = ตาราง speeds.approach_table อ่านเชิงเส้นระหว่าง 72 KIAS (1,100 kg) กับ 76 KIAS (1,200 kg) [LD3]; ตรวจด้วย V ∝ √m ใน CAS จากสองแถวนั้นได้ 73.5–74.5 KIAS; ≈ 73 KCAS (38 m/s); เท่ากับ VREF เพราะ checklist ให้ความเร็ว approach ค่าเดียวไม่มีส่วนเพิ่ม และ AFM รุ่นเดิมให้นักบินเพิ่มเองเมื่อลมแรง ลมกระโชก หรือ wind shear [LD6 p.4A-34]; ที่ MLM 1,280 kg = 77 KIAS"
   },
   "VREF_kt": {
    "v": 74,
    "u": "kt IAS",
    "scope": "aircraft",
    "src": [
     "LD3"
    ],
    "conf": "กลาง",
    "est": false,
    "note": "D1: ที่ training_mass 1,150 kg แฟลป LDG (checklist เรียกความเร็ว approach นี้ว่า VREF [LD3]); วิธีเดียวกับ VAPP_kt; แฟลป T/O 75.5, UP 80 KIAS ที่มวลเดียวกัน (ตาราง approach_table)"
   },
   "approach_table": {
    "v": {
     "axes": {
      "mass_kg": [
       940,
       1000,
       1100,
       1200,
       1280
      ],
      "flap": [
       "UP",
       "T/O",
       "LDG"
      ]
     },
     "data": [
      [
       71,
       73,
       78,
       82,
       83
      ],
      [
       68,
       70,
       74,
       77,
       78
      ],
      [
       66,
       68,
       72,
       76,
       77
      ]
     ]
    },
    "u": "kt IAS",
    "scope": "aircraft",
    "src": [
     "LD3"
    ],
    "conf": "กลาง",
    "est": false,
    "note": "ความเร็ว approach (VREF) ตามมวลและแฟลปจาก checklist ของ Diamond Flight Training (ตัวเลขจัดใหม่ ไม่ได้คัดลอกรูปแบบตาราง) [LD3]; แถว 1,216 kg ให้ LDG 76 KIAS; ใช้ตั้ง VREF ของซิมที่มวลอื่นนอก training_mass (scripts/ld_tools.mjs card)"
   },
   "VX_kt": {
    "v": 78,
    "u": "kt IAS",
    "scope": "aircraft",
    "src": [
     "LD17",
     "LC1",
     "LF1",
     "LE2",
     "LM0",
     "LD3"
    ],
    "conf": "ต่ำ",
    "est": true,
    "note": "ค่าประมาณ (scripts/ld_vx.mjs, gap 7): แฟลป UP ที่ MTOM 1310 kg = k·VS1 ใน CAS = 1.19 × 64.6 = 76.9 KCAS (39.6 m/s); ที่ training_mass 1150 kg = 73 KIAS (72 KCAS); k = ค่าเฉลี่ย Vx/VS1 (CAS) ของ POH c172s 1.200, c172r 1.192, c152 1.177 (บัตร 04/10/11); AFM ไม่ให้ Vx (14 CFR 23.1585/23.1587 ไม่บังคับ [LD17]) ส่วนความเร็วไต่หลังวิ่งขึ้นแฟลป T/O ของ AFM 72 KIAS = 71.1 KCAS ตรงกับ k·VS(T/O) = 72.2 KCAS จึงทำหน้าที่ Vx ของโครงแบบวิ่งขึ้น; polar ของบัตร + ตาราง CT/CP ให้มุมไต่สูงสุดที่ 58.1 KCAS ซึ่งต่ำกว่า 1.1 VS1 (มุมไต่ยังเพิ่มจนใกล้ stall) จึงใช้ตัดสิน Vx เองไม่ได้; ซิมวันนี้ได้ 69.5 KCAS (T-LD-38…40)"
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
    "note": "ค่าประมาณ (scripts/ld_vx.mjs, gap 18): AFM ที่เปิดอ่านได้ไม่ระบุความสูงที่เสียในการแก้ stall; ใช้ค่าคลาส Δh = c·VS1² (KCAS) โดย c เฉลี่ย 0.0646 จาก POH/AFM C172S 230 ft, C152 160 ft, P2006T 180 ft (บัตร 04/11/12) × VS1 60.5 KCAS ที่ training_mass 1150 kg = 240 ft (73 m), ช่วง 160–300 ft ตาม c ต่ำสุด/สูงสุด; การแก้ stall ปกติ ปีกระดับ idle (เกณฑ์ของ evaluator)"
   },
   "VG_kt": {
    "v": 88,
    "u": "kt IAS",
    "scope": "aircraft",
    "src": [
     "LD2",
     "LD3"
    ],
    "conf": "สูง",
    "est": false,
    "note": "best glide แฟลป UP ใบพัดหมุนฟรี (ทุกมวล) [LD2 p.3-4]"
   },
   "VA_kt": {
    "v": {
     "1080": 101,
     "1180": 108,
     "1310": 113
    },
    "u": "kt IAS",
    "scope": "aircraft",
    "src": [
     "LD1",
     "LD2"
    ],
    "conf": "สูง",
    "est": false,
    "note": "AFM ใช้ vO (operating manoeuvring speed): 101 KIAS ถึง 1,080 kg, 108 KIAS 1,080–1,180 kg, 113 KIAS เกิน 1,180 kg [LD2 p.2-3][LD1 p.28]"
   },
   "VNO_kt": {
    "v": 130,
    "u": "kt IAS",
    "scope": "aircraft",
    "src": [
     "LD1",
     "LD2"
    ],
    "conf": "สูง",
    "est": false,
    "note": "[LD1 p.28]"
   },
   "VNE_kt": {
    "v": 172,
    "u": "kt IAS",
    "scope": "aircraft",
    "src": [
     "LD1",
     "LD2"
    ],
    "conf": "สูง",
    "est": false,
    "note": "[LD1 p.28]"
   },
   "VFE": {
    "v": {
     "T/O": 110,
     "LDG": 98
    },
    "u": "kt IAS",
    "scope": "aircraft",
    "src": [
     "LD1",
     "LD2"
    ],
    "conf": "สูง",
    "est": false,
    "note": "[LD1 p.28][LD2 p.2-3]"
   },
   "ias_cas": {
    "v": {
     "UP": [
      [
       60,
       58.6
      ],
      [
       66,
       64.6
      ],
      [
       99,
       99
      ],
      [
       172,
       172
      ]
     ],
     "T/O": [
      [
       56,
       54.7
      ],
      [
       62,
       60.7
      ],
      [
       93,
       93
      ],
      [
       110,
       110
      ]
     ],
     "LDG": [
      [
       54,
       52
      ],
      [
       60,
       58
      ],
      [
       90,
       90
      ],
      [
       98,
       98
      ]
     ]
    },
    "u": "kt IAS -> kt CAS",
    "scope": "aircraft",
    "src": [
     "LD3",
     "LD4"
    ],
    "conf": "ต่ำ",
    "est": true,
    "note": "ค่าประมาณ (scripts/ld_iascas.mjs): ตาราง calibration ของ AFM §5.3.1 เป็นภาพที่อ่านไม่ได้; ที่ stall ใช้ LDG 60 KIAS = 58 KCAS [LD3][LD4] และ UP/T-O จาก VREF = 1.3 VS (CAS) แล้วลดความต่างเป็นศูนย์ที่ 1.5 VS; รูปแบบ {detent: [[KIAS,KCAS],…]}"
   },
   "stall_table": {
    "v": {
     "axes": {
      "mass_kg": [
       1000,
       1100,
       1200,
       1310
      ],
      "flap": [
       "UP",
       "T/O",
       "LDG"
      ]
     },
     "data": [
      [
       58,
       61,
       64,
       66
      ],
      [
       54,
       56,
       60,
       62
      ],
      [
       55,
       57,
       59,
       60
      ]
     ],
     "bank_deg": 0
    },
    "u": "kt IAS",
    "scope": "aircraft",
    "src": [
     "LD3"
    ],
    "conf": "กลาง",
    "est": false,
    "note": "ปีกระดับ idle จาก checklist ของ Diamond Flight Training ที่คัดจาก AFM; ตารางมุมเอียงของ AFM NG ไม่ได้อ่าน; ค่า LDG ต่ำกว่า T/O ที่ 1,000 kg สะท้อน position error (ดู §05.3)"
   },
   "stall_warning_margin_kt": {
    "v": 5,
    "u": "kt",
    "scope": "aircraft",
    "src": [
     "LD12"
    ],
    "conf": "ต่ำ",
    "est": true,
    "note": "ค่าประมาณ: ค่าขั้นต่ำตามข้อกำหนด 14 CFR 23.207(c) (ก่อน Amdt 23-64) / CS-23; ระบบเตือนเป็น lift detector ที่ปีกซ้าย [LD8 p.3]; ค่าจริงของ DA40 ไม่พบ"
   },
   "crosswind_demonstrated_kt": {
    "v": 25,
    "u": "kt",
    "scope": "aircraft",
    "src": [
     "LD3",
     "LD4"
    ],
    "conf": "สูง",
    "est": false,
    "note": "46 km/h [LD4]; DA 40 รุ่น IO-360 (XLT) 20 kt [LD4]"
   },
   "icao_approach_category": {
    "v": "A",
    "u": "-",
    "scope": "aircraft",
    "src": [
     "LD3"
    ],
    "conf": "สูง",
    "est": false,
    "note": "VAT = 1.3 VS0 ≈ 76–78 kt < 91 kt (ICAO Doc 8168)"
   }
  }
 }
}
```

```json
{
 "da40ng": {
  "performance": {
   "ROC_SL_fpm": {
    "v": 651,
    "u": "fpm",
    "scope": "aircraft",
    "src": [
     "LD4"
    ],
    "conf": "กลาง",
    "est": false,
    "note": "3.3 m/s ที่ MTOM 1,310 kg ISA MSL (โบรชัวร์ ไม่ระบุแฟลป; คาดว่าเป็นแฟลป T/O ที่ Vy 72 KIAS ตาม AFM)"
   },
   "service_ceiling_ft": {
    "v": 16400,
    "u": "ft",
    "scope": "aircraft",
    "src": [
     "LD1",
     "LD2"
    ],
    "conf": "สูง",
    "est": false,
    "note": "ความสูงปฏิบัติการสูงสุด (pressure altitude) 5,000 m — ไม่ใช่ service ceiling ตามนิยาม 100 fpm [LD1 p.28]"
   },
   "cruise_table": {
    "v": [
     {
      "h_ft": 16000,
      "load_pct": 92,
      "ktas": 154
     },
     {
      "h_ft": 14000,
      "load_pct": 60,
      "ktas": 124,
      "ff_lph": 19.3
     }
    ],
    "u": "ft, %, kt TAS, l/h",
    "scope": "aircraft",
    "src": [
     "LD4"
    ],
    "conf": "กลาง",
    "est": false,
    "note": "จุด cruise จากหน้าเว็บผู้ผลิต (MTOM ISA; ตัวเลขประมาณ \"approximate\") [LD4]"
   },
   "glide": {
    "v": {
     "speed_kt": 88,
     "ratio": 9.7
    },
    "u": "kt IAS, -",
    "scope": "aircraft",
    "src": [
     "LD3",
     "LD2"
    ],
    "conf": "กลาง",
    "est": false,
    "note": "แฟลป UP ใบพัดหมุนฟรี มีครอบล้อ; ไม่มีครอบล้อ 9.4 (1.54 NM/1,000 ft) [LD3]; มวลไม่ระบุ"
   },
   "takeoff": {
    "v": {
     "ground_roll_m": 397,
     "over50ft_m": 590
    },
    "u": "m",
    "scope": "aircraft",
    "src": [
     "LD4"
    ],
    "conf": "กลาง",
    "est": false,
    "note": "1,302 / 1,935 ft ที่ MTOM MSL ISA ลานแข็ง (โบรชัวร์ \"approximate\") [LD4]; แฟลป T/O VR 67–68 KIAS"
   },
   "landing": {
    "v": {
     "ground_roll_m": 318,
     "over50ft_m": 650
    },
    "u": "m",
    "scope": "aircraft",
    "src": [
     "LD4"
    ],
    "conf": "กลาง",
    "est": false,
    "note": "1,043 / 2,132 ft ที่ MTOM MSL ISA [LD4]; แฟลป LDG"
   },
   "fuel": {
    "v": {
     "fuel": "Jet A-1 / Jet A / diesel EN590 (OÄM 40-370)",
     "usable_l": {
      "standard": 106,
      "long_range": 147.6
     },
     "ff_lph_60pct": 19.3,
     "ff_lph_100pct": 35
    },
    "u": "l, l/h",
    "scope": "aircraft",
    "src": [
     "LD1",
     "LD4",
     "LM19"
    ],
    "conf": "สูง",
    "est": false,
    "note": "[LD1 p.27–28]; อัตราสิ้นเปลือง 60 % จาก [LD4], 100 % จาก factsheet AE300 [LM19]"
   },
   "tests": {
    "v": [
     {
      "case": "T-LD-01",
      "conditions": "DA40 NG AFM: span 11.63 m, wing area 13.244 m²",
      "quantity": "AR = b²/S",
      "expected": 10.223,
      "tolerance": 0.02,
      "unit": "",
      "origin": "[LD2 p.1-5] ให้ 10.223",
      "current_model": 10.213,
      "pass": true
     },
     {
      "case": "T-LD-02",
      "conditions": "CG หน้า 2.40 m (≤ 1,080 kg), 2.469 m (1,310 kg), หลัง 2.53 m DAT; LEMAC 2.229 m (ค่าประมาณ ld_geom), MAC 1.171 m",
      "quantity": "CG เป็น %MAC: หน้าสุด / หน้าที่ MTOW / หลังสุด",
      "expected": "14.6 / 20.5 / 25.7",
      "tolerance": "±1 %MAC (จาก LEMAC ค่าประมาณ)",
      "unit": "%MAC",
      "origin": "[LD1 p.29][LD2 p.2-18]; ld_geom.mjs",
      "current_model": "CG อ้างอิงของบัตร 20.6 %MAC อยู่ในช่วง",
      "pass": true
     },
     {
      "case": "T-LD-03",
      "conditions": "ตาราง stall checklist แฟลป UP: 66 KIAS ที่ 1,310 kg",
      "quantity": "VS ที่ 1,000 kg = 66·√(1000/1310)",
      "expected": 57.7,
      "tolerance": 1,
      "unit": "KIAS",
      "origin": "[LD3] ตารางให้ 58 KIAS",
      "current_model": 58,
      "pass": true
     },
     {
      "case": "T-LD-04",
      "conditions": "1,310 kg, S 13.244 m², VS 66/62/60 KIAS → 64.6/60.7/58.0 KCAS (ld_iascas) ถือเป็นความเร็วต่ำสุด (n_z 0.95)",
      "quantity": "CLmax 1 g UP / T/O / LDG",
      "expected": "1.362 / 1.543 / 1.69",
      "tolerance": 0.03,
      "unit": "",
      "origin": "lm_polar.clmaxFromStall [LM2]; [LD3][LD4]",
      "current_model": "1.363 / 1.589 / 1.691",
      "pass": false
     },
     {
      "case": "T-LD-05",
      "conditions": "ซิม: da40ng 1,310 kg, CG อ้างอิง, 3,000 ft ISA, idle, แฟลป UP, ลด 1 kt/s",
      "quantity": "Vmin (KEAS ≈ KCAS)",
      "expected": 64.6,
      "tolerance": 5,
      "unit": "KCAS",
      "origin": "[LD3] แปลงด้วย ld_iascas; ±3 kt ตาม Part 60 [R1:V2] + ±2 kt ความไม่แน่นอนของ IAS–CAS และ CLmax แฟลป UP (gap 12, §05.3)",
      "current_model": 63.4,
      "pass": true
     },
     {
      "case": "T-LD-06",
      "conditions": "ซิม: da40ng 1,310 kg, CG อ้างอิง, 3,000 ft ISA, idle, แฟลป T/O, ลด 1 kt/s",
      "quantity": "Vmin (KEAS ≈ KCAS)",
      "expected": 60.7,
      "tolerance": 3,
      "unit": "KCAS",
      "origin": "[LD3] แปลงด้วย ld_iascas; ±3 kt ตาม Part 60 [R1:V2]",
      "current_model": 58.8,
      "pass": true
     },
     {
      "case": "T-LD-07",
      "conditions": "ซิม: da40ng 1,310 kg, CG อ้างอิง, 3,000 ft ISA, idle, แฟลป LDG, ลด 1 kt/s",
      "quantity": "Vmin (KEAS ≈ KCAS)",
      "expected": 58,
      "tolerance": 3,
      "unit": "KCAS",
      "origin": "[LD3] แปลงด้วย ld_iascas; Diamond ระบุ 58 KCAS [LD4]; ±3 kt ตาม Part 60 [R1:V2]",
      "current_model": 57.2,
      "pass": true
     },
     {
      "case": "T-LD-08",
      "conditions": "ซิม: da40ng 1,310 kg, SL ISA, คันเร่งสุด, แฟลป UP, กวาด IAS",
      "quantity": "ROC สูงสุด",
      "expected": 651,
      "tolerance": "±100 fpm (หรือ 5 %)",
      "unit": "fpm",
      "origin": "[LD4] 3.3 m/s; Part 60 [R1:V2]",
      "current_model": 666,
      "pass": true
     },
     {
      "case": "T-LD-09",
      "conditions": "เหมือน T-LD-08",
      "quantity": "Vy",
      "expected": 71.1,
      "tolerance": 3,
      "unit": "KCAS",
      "origin": "Vy 72 KIAS แฟลป T/O [LD3] (ซิมไต่แฟลป UP — ต่างโครงแบบ)",
      "current_model": 79.6,
      "pass": false
     },
     {
      "case": "T-LD-10",
      "conditions": "ซิม: da40ng 1,310 kg, 3,000 ft ISA, แรงขับศูนย์, แฟลป UP",
      "quantity": "ความเร็วร่อนดีสุด / L/D",
      "expected": "87.5 / 9.7",
      "tolerance": "±3 kt / ±0.5",
      "unit": "KCAS / -",
      "origin": "[LD2 p.3-4][LD3]",
      "current_model": "87.3 / 9.7",
      "pass": true
     },
     {
      "case": "T-LD-11",
      "conditions": "ซิม: da40ng 1,310 kg, SL ISA 15 °C, แฟลป T/O, คันเร่งสุด, VR 66.9 KCAS, θ 8°",
      "quantity": "ground roll",
      "expected": 397,
      "tolerance": "±5 % หรือ ±61 m (ค่าเล็ก = ±20 m)",
      "unit": "m",
      "origin": "[LD4]; Part 60 [R1:V2]; หมายเหตุ: T0 ของซิมถูกปรับให้ตรงข้อนี้ (§05.9)",
      "current_model": 397,
      "pass": true
     },
     {
      "case": "T-LD-12",
      "conditions": "เหมือน T-LD-11",
      "quantity": "ระยะถึง 50 ft",
      "expected": 590,
      "tolerance": "±10 % (59 m; ผู้เขียนตั้ง ไม่มีเกณฑ์ Part 60 ตรง)",
      "unit": "m",
      "origin": "[LD4]",
      "current_model": 616,
      "pass": true
     },
     {
      "case": "T-LD-13",
      "conditions": "ซิม: autoland da40ng 1,310 kg (MLW จริง 1,280), ลมสงบ, 15 °C, แฟลป LDG, VREF 77 KIAS = 76 KCAS (speeds.approach_table แถว 1,280 kg, ld_tools card), เบรกเต็ม",
      "quantity": "ระยะจาก 50 ft ถึงหยุด",
      "expected": 650,
      "tolerance": "±10 % หรือ ±61 m (ค่าเล็ก = ±61 m)",
      "unit": "m",
      "origin": "[LD4]; Part 60 1.e [R1:V2]",
      "current_model": 642,
      "pass": true
     },
     {
      "case": "T-LD-14",
      "conditions": "เหมือน T-LD-13",
      "quantity": "ground roll",
      "expected": 318,
      "tolerance": "±10 % หรือ ±61 m (ค่าเล็ก = ±32 m)",
      "unit": "m",
      "origin": "[LD4]",
      "current_model": 311,
      "pass": true
     },
     {
      "case": "T-LD-15",
      "conditions": "วันร้อนที่ดอนเมือง 35 °C SL (ISA+20), da40ng 1,310 kg แฟลป T/O",
      "quantity": "ground roll = 397 × 1/(σ·σ^⅓) (เครื่อง flat-rated กำลังคงที่)",
      "expected": 434,
      "tolerance": "±10 % (ค่าประมาณ)",
      "unit": "m",
      "origin": "σ 0.935; สเกลจาก [LD4]; ค่าประมาณ ไม่มีตาราง AFM บท 5",
      "current_model": 428,
      "pass": true
     },
     {
      "case": "T-LD-16",
      "conditions": "ซิม linearise da40ng 1,310 kg: approach 76 KCAS แฟลป LDG γ −3° (Cat C) / cruise 110 KCAS 3,000 ft (Cat B)",
      "quantity": "short period ζ (approach / cruise)",
      "expected": "0.35–1.30 / 0.30–2.00",
      "tolerance": "ขอบ Level 1",
      "unit": "",
      "origin": "MIL-F-8785C Class I [R1:V7, R1:V10]",
      "current_model": "0.572 / 0.555",
      "pass": true
     },
     {
      "case": "T-LD-17",
      "conditions": "เหมือน T-LD-16",
      "quantity": "CAP = ωsp²/(n/α) (approach / cruise)",
      "expected": "0.16–3.6 (Cat C) / 0.085–3.6 (Cat B)",
      "tolerance": "ขอบ Level 1 (ขอบบน 3.6 ยังไม่ยืนยันจากต้นฉบับตามรอบที่ 1)",
      "unit": "1/s²",
      "origin": "MIL-F-8785C §3.2.2.1.1 [R1:V7][R1:V9]; ฉบับแรกใช้ 0.15 / 0.28 (0.28 เป็นของ Cat A)",
      "current_model": "2.06 / 2.03",
      "pass": true
     },
     {
      "case": "T-LD-18",
      "conditions": "เหมือน T-LD-16 (cruise)",
      "quantity": "phugoid ζ / คาบ",
      "expected": "ζ ≥ 0.04; คาบ Lanchester π√2·V/g = 26.8 s (ข้อมูลประกอบ)",
      "tolerance": "-",
      "unit": "- / s",
      "origin": "MIL-F-8785C [R1:V10]",
      "current_model": "0.116 / 30.3",
      "pass": true
     },
     {
      "case": "T-LD-19",
      "conditions": "เหมือน T-LD-16 (approach)",
      "quantity": "Dutch roll ζ / ζωn / ωn",
      "expected": "ζ ≥ 0.08, ζωn ≥ 0.15, ωn ≥ 0.4",
      "tolerance": "-",
      "unit": "- / rad/s",
      "origin": "MIL-F-8785C Table 3 Class I Cat C [R1:V10]",
      "current_model": "0.206 / 0.308 / 1.5",
      "pass": true
     },
     {
      "case": "T-LD-20",
      "conditions": "เหมือน T-LD-16",
      "quantity": "roll mode τR (approach / cruise)",
      "expected": "≤ 1.0 / ≤ 1.4",
      "tolerance": "-",
      "unit": "s",
      "origin": "MIL-F-8785C Table 5 [R1:V10]",
      "current_model": "0.252 / 0.181",
      "pass": true
     },
     {
      "case": "T-LD-21",
      "conditions": "เหมือน T-LD-16",
      "quantity": "spiral T₂ (approach / cruise)",
      "expected": "≥ 12 / ≥ 20",
      "tolerance": "-",
      "unit": "s",
      "origin": "MIL-F-8785C Table 6 [R1:V10]",
      "current_model": "61.1 / 32",
      "pass": true
     },
     {
      "case": "T-LD-22",
      "conditions": "รุ่นเดิม 1,150 kg: VREF แฟลป UP 73 KIAS [LD8] ถือว่า IAS ≈ CAS ที่ 73 kt และ VREF = 1.3 VS",
      "quantity": "VS1 (KCAS) = 73/1.3 เทียบตาราง ias_cas ที่ VS1 52 KIAS",
      "expected": 56.2,
      "tolerance": 1.5,
      "unit": "KCAS",
      "origin": "[LD8][LD6 p.5-8]; ld_iascas.mjs (ตรวจอิสระ)",
      "current_model": 55.9,
      "pass": true
     },
     {
      "case": "T-LD-23",
      "conditions": "DA40 NG 1,280 kg แฟลป T/O: V50 72 KIAS, VS(T/O) 61.5 KIAS (ตีความตาราง)",
      "quantity": "V50 / VS (KCAS)",
      "expected": 1.2,
      "tolerance": "≥ 1.20 − 0.03 (การอ่านค่า)",
      "unit": "-",
      "origin": "14 CFR 23.53 ก่อน Amdt 64 [LD12]; [LD3]",
      "current_model": "AFM 1.182; ซิม 1.183",
      "pass": true
     },
     {
      "case": "T-LD-24",
      "conditions": "MTOW 1,310 kg, S 13.244 m² → W/S 20.26 lb/ft²",
      "quantity": "limit descent velocity 4.4 (W/S)^¼",
      "expected": 9.33,
      "tolerance": 0.02,
      "unit": "fps",
      "origin": "14 CFR 23.473(d) ก่อน Amdt 64 [LD12]",
      "current_model": "ค่าในบัตร 9.33",
      "pass": true
     },
     {
      "case": "T-LD-25",
      "conditions": "ใบพัด NG 1.90 m 123.5 kW SL ISA ความเร็วศูนย์",
      "quantity": "แรงขับสถิตอุดมคติ (P²·2ρA)^⅓ / BEM (FM)",
      "expected": "4.73 kN / FM 0.55–0.80",
      "tolerance": "-",
      "unit": "kN",
      "origin": "ทฤษฎีโมเมนตัม; lm_prop [LM0]",
      "current_model": "BEM 3.45 kN (FM 0.623); T0 ซิม 4.05 kN (FM เทียบเท่า 0.79)",
      "pass": true
     },
     {
      "case": "T-LD-26",
      "conditions": "ซิม: da40ng 1,310 kg, 14,000 ft ISA, บินระดับ 124 KTAS (โบรชัวร์: load 60 %)",
      "quantity": "คันเร่งที่ซิมต้องใช้ (≈ สัดส่วนกำลัง)",
      "expected": 0.6,
      "tolerance": "±0.05",
      "unit": "-",
      "origin": "[LD4]",
      "current_model": 0.801,
      "pass": false
     },
     {
      "case": "T-LD-35",
      "conditions": "ซิม: da40ng 1,100 kg (ค่าประมาณจาก \"เชื้อเพลิงเต็ม + นักบิน 1 คน\") / 1,310 kg, 1,000 ft ISA, idle, แฟลป LDG, 88 KIAS",
      "quantity": "อัตราร่อน L/D ≈ V / (อัตราจม)",
      "expected": 6.9,
      "tolerance": "±0.7 (แหล่งความเชื่อมั่นต่ำ)",
      "unit": "-",
      "origin": "[LD13] โพสต์ 20: DA40 NG −12.5° 88 kt −1,300 fpm (ไม่ใช่จุด DA 40 TDI 73 kt ที่ใช้ปรับ CDflap)",
      "current_model": "6.24 / 6.71",
      "pass": true
     },
     {
      "case": "T-LD-36",
      "conditions": "ซิม: da40ng 1,100 kg, 1,000 ft ISA, idle, แฟลป UP, 88 KIAS",
      "quantity": "pitch attitude θ",
      "expected": -2.5,
      "tolerance": "±1.5° (ผู้เขียนตั้ง; แหล่งความเชื่อมั่นต่ำ)",
      "unit": "deg",
      "origin": "[LD13] โพสต์ 17/20: DA40 NG −2.5° 88 kt −900 to −950 fpm",
      "current_model": -2.6,
      "pass": true
     },
     {
      "case": "T-LD-37",
      "conditions": "บัตรที่ merge แล้วของ da40ng, da40_180, da40d (รุ่นย่อยรับค่าจาก NG ผ่าน _inherits)",
      "quantity": "propeller.identity.diameter = interference.slipstream.diskDiameter; controls.surfaces.* travel = controls.pitch/yaw.stops",
      "expected": "เท่ากันทุก id",
      "tolerance": "ตรงทุกค่า",
      "unit": "-",
      "origin": "[LD1 p.5, 7, 13–14, 27, 29]",
      "current_model": "da40ng: D 1.9/1.9 m, elev 21/17 vs 21/17, rud 24/26 vs 24/26; da40_180: D 1.8/1.8 m, elev 18/16 vs 18/16, rud 29/31 vs 29/31; da40d: D 1.87/1.87 m, elev 23/15 vs 23/15, rud 29/31 vs 29/31",
      "pass": true
     },
     {
      "case": "T-LD-38",
      "conditions": "ซิม: da40ng 1,310 kg (MTOM), SL ISA, คันเร่งสุด, แฟลป UP, กวาด IAS ทีละ 0.25 kt จาก 1.03 VS1 (ld_vx.mjs)",
      "quantity": "Vx (ความเร็วที่มุมไต่สูงสุด)",
      "expected": 76.9,
      "tolerance": 4,
      "unit": "KCAS",
      "origin": "ค่าประมาณ: k·VS1 = 1.19 × 64.6 KCAS (= 78 KIAS); k เฉลี่ยจาก POH C172S/C172R/C152 [LC1][LE2][LF1]; AFM ไม่ให้ Vx [LD17]; ความเร็วไต่แฟลป T/O ของ AFM 72 KIAS = 71.1 KCAS เทียบ k·VS(T/O) 72.2 KCAS; ±4 kt = ช่วง k (±1 kt) + ความไม่แน่นอนของ VS1 (gap 12)",
      "current_model": "69.5 (γmax 5.08°)",
      "pass": false
     },
     {
      "case": "T-LD-41",
      "conditions": "stall ปีกระดับ idle ลด 1 kt/s แฟลป UP ที่ training_mass (NG 1,150 / 180 1,050 / D 1,060 kg) แล้วแก้ตามวิธีมาตรฐาน: ลดมุมปะทะ คันเร่งเต็ม ปีกระดับ ดึงกลับสู่การไต่",
      "quantity": "ความสูงที่เสียจากเริ่ม stall ถึงอัตราจมเป็นศูนย์ (da40ng / da40_180 / da40d)",
      "expected": "240 / 180 / 190",
      "tolerance": "±35 % (ช่วง c ของคลาส)",
      "unit": "ft",
      "origin": "ค่าประมาณ Δh = c·VS1² (KCAS), c เฉลี่ย 0.0646 จาก C172S 230 ft [LC2], C152 160 ft [LF1], P2006T 180 ft [LG5] (ช่วง 0.0426–0.0819); AFM ที่อ่านได้ไม่ระบุ",
      "current_model": "ไม่รองรับในซิมวันนี้ (ไม่มีลำดับแก้ stall อัตโนมัติและ evaluator ไม่วัดความสูงที่เสีย)",
      "pass": null
     },
     {
      "case": "T-LD-42",
      "conditions": "บัตรที่ merge แล้วของ 3 id: speeds.VREF_kt / VAPP_kt, speeds.approach_table (แถว LDG), airframe.weights.training_mass",
      "quantity": "VAPP = approach_table ที่ training_mass; VAPP ≥ VREF; empty + crew + fuel = kg",
      "expected": "เป็นจริงทุก id",
      "tolerance": "±0.5 kt / ±2 kg",
      "unit": "kt IAS, kg",
      "origin": "D1, D3 (critic-r2); [LD3][LD6 p.4A-34][LD8]",
      "current_model": "da40ng: 1150 kg → ตาราง 74 KIAS, VREF 74 / VAPP 74; 903 + 170 + 77 = 1150 kg; da40_180: 1050 kg → ตาราง 65.2 KIAS, VREF 65 / VAPP 65; 792 + 170 + 88 = 1050 kg; da40d: 1060 kg → ตาราง 65.6 KIAS, VREF 66 / VAPP 66; 830 + 170 + 60 = 1060 kg",
      "pass": true
     },
     {
      "case": "T-LD-43",
      "conditions": "เครื่องที่ MTOM (NG 1,310 / 180 1,200 / D 1,150 kg), CG อ้างอิง, cruise trim (NG 110, รุ่นเดิม 100 KCAS) 3,000 ft, ดึงถึง limit load factor 3.8 g (normal category)",
      "quantity": "แรงดึงคันต่อ g (Fs/g) da40ng / da40_180 / da40d",
      "expected": "≥ 33 / ≥ 30 / ≥ 29",
      "tolerance": "ขั้นต่ำตามข้อกำหนด (ไม่มี tolerance)",
      "unit": "N/g",
      "origin": "14 CFR 23.155(a)(2) ก่อน Amdt 64 [LD12]: แรงดึงถึง n limit ≥ max(W/140 lb, 15 lb) = 20.6 / 18.9 / 18.1 lbf; หาร (n − 1) = 2.8; ค่าประมาณจากโมเดล hinge รอบที่ 1 กับพารามิเตอร์บัตร (controls.pitch.*) = 21.1 / 19.2 / 18.6 N/g ต่ำกว่าเกณฑ์ (ค่า Chδ/gearing ของรอบที่ 1 ต่ำไปสำหรับ DA40)",
      "current_model": "ไม่รองรับในซิมวันนี้ (ซิมไม่มีโมเดลแรงที่คัน: DIRECT สั่งมุม elevator ตรง)",
      "pass": null
     },
     {
      "case": "T-LD-44",
      "conditions": "เครื่องที่ training_mass, trim ด้วย tab ที่ VAPP แฟลป LDG 300 m และที่ cruise 3,000 ft แล้วเปลี่ยนความเร็ว ±1 kt (tab คงที่)",
      "quantity": "ความชันแรงคันต่อความเร็ว approach / cruise (ดึงเมื่อช้าลง = บวก)",
      "expected": "0.401 / 0.266; 0.396 / 0.262; 0.394 / 0.264",
      "tolerance": "±50 % (ค่าประมาณ) และต้อง > 0",
      "unit": "N/kt",
      "origin": "ค่าประมาณจากโมเดล hinge รอบที่ 1 กับพารามิเตอร์บัตร (ld_stickforce.mjs); 14 CFR 23.173(a) ต้องดึงเมื่อช้ากว่าความเร็ว trim [LD12]; เครื่องฝึกรอบที่ 1 0.63 N/kt ที่ 95 kt [R1:V10]",
      "current_model": "ไม่รองรับในซิมวันนี้ (ไม่มีโมเดลแรงที่คัน)",
      "pass": null
     }
    ],
    "u": "ตามช่อง unit ของแต่ละแถว",
    "scope": "aircraft",
    "src": [
     "LM0",
     "LD1",
     "LD2",
     "LD3",
     "LD4",
     "LD6",
     "LD8",
     "R1:V10"
    ],
    "conf": "กลาง",
    "est": false,
    "note": "แถวเดียวกับตาราง T-LD ใน §05.11 ที่ตรวจ da40ng (scripts/ld_tests.mjs 2026-11-19 → out/ld_tests.json → ld_json.mjs); expected มาจากแหล่งในช่อง origin (แถวที่ผู้เขียนประมาณเองระบุวิธีไว้ในช่องนั้น); current_model = บัตรนี้ในฟิสิกส์ของซิม commit cabf0f0; pass null = ไม่รองรับในซิมวันนี้; ผ่าน 27 ไม่ผ่าน 4 n.a. 3 จาก 34 แถว"
   }
  }
 }
}
```

```json
{
 "da40ng": {
  "propulsion": {
   "layout": {
    "v": [
     {
      "id": 1,
      "pos": [
       2.22,
       0,
       0.05
      ],
      "axis": [
       1,
       0,
       0
      ],
      "type": "piston",
      "model": "Austro Engine E4 (AE300)",
      "prop_sense": 1
     }
    ],
    "u": "m FRD",
    "scope": "aircraft",
    "src": [
     "LD1",
     "LD9"
    ],
    "conf": "ต่ำ",
    "est": true,
    "note": "ตำแหน่งดุมใบพัด ≈ 0.25 m DAT (ค่าประมาณจากภาพ) → x = 2.47 − 0.25 m; ใบพัดหมุนตามเข็มเมื่อมองจากด้านหลัง (right-hand tractor) [LD1 p.27][LD9 p.7]"
   },
   "legacy": {
    "v": {
     "P": 123500,
     "eta": 0.9821,
     "T0": 4050,
     "idle": 0
    },
    "u": "-",
    "scope": "aircraft",
    "src": [
     "LM0",
     "LD4",
     "LD3"
    ],
    "conf": "ต่ำ",
    "est": true,
    "note": "ค่าประมาณ (iteration §05.9, ld_iter.mjs): T0 4050 N เลือกให้ระยะวิ่งขึ้น (ground roll) ของซิมที่ 1,310 kg แฟลป T/O = 397 m ตาม [LD4] (BEM ให้แรงขับสถิตจริง 3,450 N, FM 0.62; T0 4050 N เทียบเท่า FM ≈ 0.80 จึงเป็นพารามิเตอร์รูปทรงของกฎแรงขับ T0·Vc/√(V²+Vc²) ไม่ใช่แรงขับสถิตจริง — ค่าจริงอยู่ที่ propeller.checks) แล้ว lm_legacy_fit โหมด static หา Vc = 29.9 m/s ให้ ROC สูงสุด = 651 fpm; eta_sim 0.9821 (> 0.95 ตามคำเตือนของ fit: polar จากการร่อนรวมแรงต้านใบพัดหมุนฟรีจึงต้องการแรงขับสูง ดู §05.12); idle 0 เพราะ polar มาจากการร่อน"
   }
  }
 }
}
```

```json
{
 "da40ng": {
  "piston": {
   "identity": {
    "v": {
     "model": "Austro Engine E4 (AE300, config. E4-A)",
     "kind": "turbo_diesel",
     "displacement_L": 1.991,
     "cylinders": 4,
     "tcds": "EASA E.200 Issue 12"
    },
    "u": "-",
    "scope": "engine",
    "src": [
     "LD10",
     "LD1"
    ],
    "conf": "สูง",
    "est": false,
    "note": "4 สูบ 4 จังหวะ ดีเซล common rail เทอร์โบ เกียร์ทด 1:1.69 น้ำหนักแห้ง 185 kg [LD10 p.5]"
   },
   "ratings": {
    "v": {
     "P_rated": 123500,
     "rpm_rated": 2300,
     "P_mcp": 114000,
     "rpm_mcp": 2100,
     "rpm_redline": 2300,
     "rpm_overspeed": 2500,
     "rpm_idle": null,
     "takeoff_time_limit_s": 300
    },
    "u": "W, rpm (ใบพัด)",
    "scope": "engine",
    "src": [
     "LD10",
     "LD1",
     "LD2"
    ],
    "conf": "สูง",
    "est": false,
    "note": "take-off 100 % = 123.5 kW (166 hp; 168 PS) ที่ 2,300 rpm ใบพัด (3,880 rpm เพลาข้อเหวี่ยง) นานสุด 5 นาที; ต่อเนื่อง 92 % = 114 kW ที่ 2,100 rpm; overspeed 2,500 rpm ≤ 20 s [LD2 p.2-5, 2-6][LD10 p.5]; รอบ idle ไม่พบ"
   },
   "altitude": {
    "v": {
     "model": "turbo_flat",
     "critical_alt_m": null,
     "max_operating_alt_m": 5490
    },
    "u": "-",
    "scope": "engine",
    "src": [
     "LD10",
     "LD4"
    ],
    "conf": "ต่ำ",
    "est": true,
    "note": "เทอร์โบ + EECU: AFM/TCDS ไม่ให้ critical altitude; จุด cruise 154 KTAS ที่ 16,000 ft ด้วย MCP [LD4] แสดงว่าคงกำลังต่อเนื่องได้สูง (ค่าประมาณ ต้องหาตาราง load สูงสุดตามความสูงจาก AFM บท 5)"
   },
   "power_map": {
    "v": {
     "axes": {
      "load_pct": [
       0,
       60,
       92,
       100
      ]
     },
     "data": [
      0,
      74100,
      114000,
      123500
     ]
    },
    "u": "W",
    "scope": "engine",
    "src": [
     "LD2",
     "LM19"
    ],
    "conf": "กลาง",
    "est": true,
    "note": "FADEC: กำลัง = load % × 123.5 kW (เชิงเส้นตามนิยาม load ของ AFM; ค่าประมาณที่ load ต่ำ)"
   },
   "fuel": {
    "v": {
     "fuel": "Jet A-1",
     "bsfc_g_per_kWh": {
      "60": 205,
      "100": 227
     },
     "ff_table": [
      [
       60,
       19.3
      ],
      [
       100,
       35
      ]
     ]
    },
    "u": "g/kWh, [load %, l/h]",
    "scope": "engine",
    "src": [
     "LM19",
     "LD4"
    ],
    "conf": "กลาง",
    "est": false,
    "note": "BSFC คำนวณใน 01-methods §01.6.3 จาก factsheet [LM19] (Jet A-1 0.80 kg/l)"
   },
   "dynamics": {
    "v": {
     "tau_throttle_s": 0.5,
     "I_engine": null,
     "friction_torque": null
    },
    "u": "s, kg m2, N m",
    "scope": "engine",
    "src": [
     "LM0"
    ],
    "conf": "ต่ำ",
    "est": true,
    "note": "ค่าประมาณตาม 01-methods §01.6.4 (FADEC + turbo lag); ยังไม่พบค่าวัด"
   },
   "fadec": {
    "v": {
     "lever_to_load": "load % = 100 × lever (single power lever)",
     "rpm_schedule": [
      [
       0,
       1800
      ],
      [
       65,
       1975
      ],
      [
       92,
       2100
      ],
      [
       100,
       2300
      ]
     ],
     "load_max_at_1975rpm_pct": 65
    },
    "u": "[load %, rpm]",
    "scope": "engine",
    "src": [
     "LD2",
     "LD3",
     "LD1"
    ],
    "conf": "ต่ำ",
    "est": true,
    "note": "จุดจริง: 2,300 rpm ที่ take-off 100 %, 2,100 rpm เป็นรอบต่อเนื่องสูงสุดที่ 92 % [LD1][LD2]; ที่ 1,975 rpm เครื่องให้ได้ถึง 65 % [LD2 p.3-19][LD3]; จุด 0 % → 1,800 rpm เป็นค่าประมาณ"
   }
  }
 }
}
```

```json
{
 "da40ng": {
  "propeller": {
   "identity": {
    "kind": {
     "v": "constant_speed",
     "u": "-",
     "scope": "propeller",
     "src": [
      "LD1",
      "LD9"
     ],
     "conf": "สูง",
     "est": false,
     "note": "hub ไฮดรอลิก constant speed ควบคุมโดย EECU ไม่มี feather/reverse [LD9 p.6–7]"
    },
    "model": {
     "v": "MT-Propeller MTV-6-R/190-69",
     "u": "-",
     "scope": "propeller",
     "src": [
      "LD1",
      "LD9"
     ],
     "conf": "สูง",
     "est": false,
     "note": "EASA TC P.094 ใบไม้/คอมโพสิต"
    },
    "nBlades": {
     "v": 3,
     "u": "-",
     "scope": "propeller",
     "src": [
      "LD1",
      "LD9"
     ],
     "conf": "สูง",
     "est": false,
     "note": ""
    },
    "diameter": {
     "v": 1.9,
     "u": "m",
     "scope": "propeller",
     "src": [
      "LD1",
      "LD9"
     ],
     "conf": "สูง",
     "est": false,
     "note": "190 cm (6 ft 3 in) [LD1 p.27]"
    },
    "sense": {
     "v": 1,
     "u": "-",
     "scope": "propeller",
     "src": [
      "LD1",
      "LD9"
     ],
     "conf": "สูง",
     "est": false,
     "note": "clockwise มองจากด้านหลัง (right-hand tractor)"
    },
    "massComplete": {
     "v": 14,
     "u": "kg",
     "scope": "propeller",
     "src": [
      "LD9"
     ],
     "conf": "กลาง",
     "est": false,
     "note": "ราว 14 kg สำหรับ configuration constant speed ของ MTV-6 (ไม่ระบุรายรุ่น) [LD9 p.7]"
    },
    "hubPosition": {
     "v": [
      2.22,
      0,
      0.05
     ],
     "u": "m FRD",
     "scope": "propeller",
     "src": [
      "LD2"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: ดุม ≈ 0.25 m DAT"
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
      "LD2"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: แกนแรงขับขนานแกนลำตัว เพราะไม่พบมุม right/down thrust ที่ติดตั้งในเอกสารเผยแพร่"
    }
   },
   "engineInterface": {
    "maxShaftPower": {
     "v": 123.5,
     "u": "kW",
     "scope": "propeller",
     "src": [
      "LD10",
      "LD2"
     ],
     "conf": "สูง",
     "est": false,
     "note": "take-off 5 นาที; MCP 114 kW (92 %)"
    },
    "rpmGoverned": {
     "v": 2300,
     "u": "rpm",
     "scope": "propeller",
     "src": [
      "LD1",
      "LD2"
     ],
     "conf": "สูง",
     "est": false,
     "note": "take-off; ต่อเนื่อง 2,100 rpm"
    },
    "rpmTransientLimit": {
     "v": 2500,
     "u": "rpm",
     "scope": "propeller",
     "src": [
      "LD2"
     ],
     "conf": "สูง",
     "est": false,
     "note": "overspeed สูงสุด 20 s [LD2 p.2-6]"
    },
    "gearRatio": {
     "v": 1.69,
     "u": "-",
     "scope": "propeller",
     "src": [
      "LD10"
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
      "LM0"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: ค่าในแบบจำลอง lm_prop cs3_190"
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
       0.0425,
       0.051,
       0.0578,
       0.0612,
       0.0621,
       0.0578,
       0.051,
       0.0425,
       0.0272
      ]
     },
     "u": "c/D",
     "scope": "propeller",
     "src": [
      "LM0"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: planform GA ทั่วไป × 0.85 (lm_prop cs3_190); รูปทรงใบจริงของ MT ไม่เผยแพร่"
    },
    "twistDesignJ": {
     "v": 0.95,
     "u": "-",
     "scope": "propeller",
     "src": [
      "LM0"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: helical twist ที่ J 0.95 (lm_prop)"
    },
    "activityFactor": {
     "v": 77,
     "u": "-",
     "scope": "propeller",
     "src": [
      "LM0"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ ≈ 0.85 × 90 ต่อใบ"
    }
   },
   "section": {
    "liftSlope": {
     "v": 5.65,
     "u": "1/rad",
     "scope": "propeller",
     "src": [
      "LM0"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: 0.90·2π (lm_prop)"
    },
    "alpha0": {
     "v": -3,
     "u": "deg",
     "scope": "propeller",
     "src": [
      "LM0"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: lm_prop"
    },
    "alphaStallPos": {
     "v": 14,
     "u": "deg",
     "scope": "propeller",
     "src": [
      "LM0"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: lm_prop"
    },
    "alphaStallNeg": {
     "v": -10,
     "u": "deg",
     "scope": "propeller",
     "src": [
      "LM0"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: lm_prop"
    },
    "stallBlendM": {
     "v": 10,
     "u": "1/rad",
     "scope": "propeller",
     "src": [
      "LD15"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: รอบที่ 1"
    },
    "cd0": {
     "v": 0.01,
     "u": "-",
     "scope": "propeller",
     "src": [
      "LM0"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: lm_prop"
    },
    "kcd": {
     "v": 0.012,
     "u": "-",
     "scope": "propeller",
     "src": [
      "LM0"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: lm_prop"
    },
    "Mdd": {
     "v": 0.8,
     "u": "-",
     "scope": "propeller",
     "src": [
      "LD15"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: ปลายใบที่ 2,300 rpm M_tip ≈ 0.67 ต่ำกว่า Mdd"
    },
    "stallDelayFactor": {
     "v": 3,
     "u": "-",
     "scope": "propeller",
     "src": [
      "LD15"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: Snel"
    }
   },
   "tables": {
    "CT": {
     "v": {
      "axes": {
       "beta75_deg": [
        15,
        20,
        25,
        30,
        35
       ],
       "J": [
        0,
        0.2,
        0.4,
        0.6,
        0.8,
        1,
        1.2
       ]
      },
      "data": [
       [
        0.1289,
        0.1117,
        0.0813,
        0.0402,
        -0.0073,
        -0.0572,
        -0.0967
       ],
       [
        0.1469,
        0.1441,
        0.1252,
        0.0902,
        0.0467,
        -0.0017,
        -0.0524
       ],
       [
        0.1298,
        0.1498,
        0.1562,
        0.1374,
        0.1006,
        0.0571,
        0.0093
       ],
       [
        0.0991,
        0.1147,
        0.1469,
        0.1674,
        0.1502,
        0.1144,
        0.0726
       ],
       [
        0.0927,
        0.0971,
        0.1087,
        0.1373,
        0.1768,
        0.1654,
        0.133
       ]
      ]
     },
     "u": "-",
     "scope": "propeller",
     "src": [
      "LM0"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: BEM lm_prop cs3_190 (ρ 1.225); แถว = beta75 15–35°; มุมใบจริง low 14.5° / high 35° [LD1 p.27]"
    },
    "CP": {
     "v": {
      "axes": {
       "beta75_deg": [
        15,
        20,
        25,
        30,
        35
       ],
       "J": [
        0,
        0.2,
        0.4,
        0.6,
        0.8,
        1,
        1.2
       ]
      },
      "data": [
       [
        0.0502,
        0.0519,
        0.0467,
        0.0297,
        -0.0013,
        -0.0453,
        -0.0853
       ],
       [
        0.0715,
        0.0784,
        0.0797,
        0.0689,
        0.0436,
        0.0029,
        -0.0518
       ],
       [
        0.0874,
        0.0996,
        0.1125,
        0.1138,
        0.0974,
        0.065,
        0.0163
       ],
       [
        0.106,
        0.1104,
        0.1283,
        0.1527,
        0.1555,
        0.1353,
        0.0982
       ],
       [
        0.1341,
        0.1346,
        0.1366,
        0.1545,
        0.1984,
        0.2072,
        0.187
       ]
      ]
     },
     "u": "-",
     "scope": "propeller",
     "src": [
      "LM0"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: C_P = P/(ρ n³ D⁵)"
    }
   },
   "inertia": {
    "Ip": {
     "v": 1.4,
     "u": "kg m2",
     "scope": "propeller",
     "src": [
      "LD9"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: ใบพัดไม้/คอมโพสิตราว 14 kg [LD9 p.7] (ใบละ ~3.3 kg ที่รัศมีไจเรชัน ~0.36 m + ดุม)"
    },
    "IreflectedEngine": {
     "v": 0.4,
     "u": "kg m2",
     "scope": "propeller",
     "src": [
      "LD10"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: เพลาข้อเหวี่ยง+ล้อตุนกำลัง ~0.15 kg m² × 1.69²"
    }
   },
   "governor": {
    "kGov": {
     "v": 1,
     "u": "deg/s per rpm",
     "scope": "propeller",
     "src": [
      "LD15"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: กฎเดียวกับรอบที่ 1 (JSBSim); EECU คุมรอบตามตาราง load–rpm"
    },
    "pitchRateMax": {
     "v": 15,
     "u": "deg/s",
     "scope": "propeller",
     "src": [
      "LD15"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ hub ไฮดรอลิก MT"
    },
    "rpmOverspeed": {
     "v": 2500,
     "u": "rpm",
     "scope": "propeller",
     "src": [
      "LD2"
     ],
     "conf": "สูง",
     "est": false,
     "note": "max overspeed 2,500 rpm ≤ 20 s [LD2 p.2-6]"
    },
    "oilMinRpm": {
     "v": 200,
     "u": "rpm",
     "scope": "propeller",
     "src": [
      "LD15"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: รอบที่ 1"
    },
    "betaFlightIdle": {
     "v": 14.5,
     "u": "deg @0.75R",
     "scope": "propeller",
     "src": [
      "LD1"
     ],
     "conf": "สูง",
     "est": false,
     "note": "low pitch stop 14.5° ± 0.2° [LD1 p.27]"
    },
    "betaHigh": {
     "v": 35,
     "u": "deg @0.75R",
     "scope": "propeller",
     "src": [
      "LD1"
     ],
     "conf": "สูง",
     "est": false,
     "note": "high pitch 35° ± 1° [LD1 p.27] (ไม่ใช่ feather)"
    }
   },
   "checks": {
    "staticThrustISA": {
     "v": 3.45,
     "u": "kN",
     "scope": "propeller",
     "src": [
      "LM0"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: BEM lm_prop: β75 20.2° ที่ 123.5 kW 2,300 rpm, FM 0.62"
    },
    "staticThrustVTBD31C": {
     "v": 3.39,
     "u": "kN",
     "scope": "propeller",
     "src": [
      "LM0"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: สเกลแบบโมเมนตัม T ∝ ρ^(1/3) ที่กำลังคงที่ (เทอร์โบคงกำลัง): ρ 1.160/1.225"
    },
    "momentumIdealStaticISA": {
     "v": 4.73,
     "u": "kN",
     "scope": "propeller",
     "src": [
      "LM0"
     ],
     "conf": "สูง",
     "est": false,
     "note": "(2ρA)^(1/3) P^(2/3), D 1.90 m, 123.5 kW (คำนวณจากนิยาม)"
    },
    "peakEfficiency": {
     "v": 0.89,
     "u": "-",
     "scope": "propeller",
     "src": [
      "LM0"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: สูงสุดของตาราง BEM (β75 30–35°, J 1.2)"
    }
   }
  }
 }
}
```

```json
{
 "da40ng": {
  "aero": {
   "ref": {
    "S": {
     "v": 13.244,
     "u": "m2",
     "scope": "aircraft",
     "src": [
      "LD2"
     ],
     "conf": "สูง",
     "est": false,
     "note": "[LD2 p.1-5]"
    },
    "b": {
     "v": 11.63,
     "u": "m",
     "scope": "aircraft",
     "src": [
      "LD2"
     ],
     "conf": "สูง",
     "est": false,
     "note": ""
    },
    "c": {
     "v": 1.171,
     "u": "m",
     "scope": "aircraft",
     "src": [
      "LD2"
     ],
     "conf": "สูง",
     "est": false,
     "note": "MAC"
    }
   },
   "static_long": {
    "CL0": {
     "v": {
      "UP": 0.34,
      "T/O": 0.86,
      "LDG": 1.09
     },
     "u": "-",
     "scope": "aircraft",
     "src": [
      "LM10",
      "LD13"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณที่ α ลำตัว = 0: clean จากท่าร่อน 88 KIAS θ ≈ −2.5° γ ≈ −5.8° ที่นักบินรายงาน [LD13] → CL0 0.33/0.39/0.45 ที่มวล 1,100/1,200/1,300 kg (มวลไม่ได้รายงาน) เลือก 0.34; ΔCL0 แฟลปจาก DATCOM plain flap (cf/c 0.25, τ 0.609, η_δ 0.80/0.55, K_b 0.62) = 0.527/0.761 ใช้ 0.52/0.75; ท่าบินของ DA 40 NG ใน [LD13] (โพสต์ 17 และ 20, มวลราว 1,100 kg) ให้ ΔCL0 0.48–0.57 ที่แฟลป T/O และ 0.68–0.70 ที่แฟลป LDG idle 84–88 KIAS สอดคล้องกับ DATCOM; ค่า 0.47 ที่ฉบับแรกรายงานว่าขัดแย้งมาจากจุดของ DA 40 TDI (วิดีโอทดสอบในโพสต์ 16) ไม่ใช่ NG (ตรวจทาน 2026-11-18) — scripts/ld_flaps.mjs"
    },
    "CLalpha": {
     "v": 5.45,
     "u": "1/rad",
     "scope": "aircraft",
     "src": [
      "LM10",
      "LM11"
     ],
     "conf": "กลาง",
     "est": true,
     "note": "ค่าประมาณ lm_derivs (ปีก + หาง, AR 10.2) นอก ground effect; ปีกอย่างเดียว 4.99"
    },
    "Cm0": {
     "v": {
      "UP": 0.02,
      "T/O": -0.04,
      "LDG": -0.08
     },
     "u": "-",
     "scope": "aircraft",
     "src": [
      "LM11"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณที่ CG อ้างอิง 20.6 % MAC: เลือกให้ elevator trim ใกล้กลางที่ cruise; ΔCm แฟลปลง (nose-down) −0.06/−0.10 ตามขนาดทั่วไปของแฟลปชนิดนี้ ยังไม่มีข้อมูลจริง"
    },
    "Cmalpha": {
     "v": -1.6,
     "u": "1/rad",
     "scope": "aircraft",
     "src": [
      "LM10",
      "LM11"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ lm_derivs: จุด neutral h_n 0.5 MAC, static margin 0.29 ที่ CG 20.6 % MAC; dε/dα 0.29 (หาง T อยู่สูงพ้น wake) — ค่าค่อนข้างสูง ความเชื่อมั่นต่ำ"
    },
    "CLmax_target": {
     "v": {
      "UP": 1.362,
      "T/O": 1.543,
      "LDG": 1.69
     },
     "u": "-",
     "scope": "aircraft",
     "src": [
      "LD3",
      "LD4",
      "LM2"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "CLmax 1 g แบบ trim ที่ CG หน้า MTOW 1,310 kg จาก VS (KIAS→KCAS ค่าประมาณ ld_iascas) ด้วย lm_polar.clmaxFromStall (ความเร็วต่ำสุด, n_z 0.95): UP 64.6, T/O 60.7, LDG 58.0 KCAS"
    },
    "alpha_star": {
     "v": {
      "UP": 15.29,
      "LDG": 11.06
     },
     "u": "deg",
     "scope": "aircraft",
     "src": [
      "LM0"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: จุดกลางการผสม Beard–McLain (X0 = 0.5) ที่ buildAC/lm_legacy_fit แก้หาให้ CLmax 1 g ตรงเป้า (UP 1.362, LDG 1.690)"
    },
    "alpha_star_neg": {
     "v": {
      "UP": 13,
      "LDG": 9
     },
     "u": "deg",
     "scope": "aircraft",
     "src": [
      "LD15"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: ใช้ค่าเครื่องฝึกรอบที่ 1 (ไม่มีข้อมูล stall ด้านลบของ DA40; บินหงายไม่ได้รับอนุญาต)"
    },
    "a1": {
     "v": 22,
     "u": "1/rad",
     "scope": "aircraft",
     "src": [
      "R1:A11",
      "LD15"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: ความชันการแยกตัวตามรอบที่ 1 (ช่วง Citation II 20.6–23.9)"
    },
    "CL_sep_at_alpha_star": {
     "v": {
      "UP": 0.95,
      "LDG": 1.1
     },
     "u": "-",
     "scope": "aircraft",
     "src": [
      "LD15"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณจากรอบที่ 1; AFM ไม่บรรยายการตกของแรงยกหลัง stall"
    },
    "CDmax_90": {
     "v": 1.4,
     "u": "-",
     "scope": "aircraft",
     "src": [
      "LD15"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: ปีกเดี่ยว 1.11 + 0.018 AR = 1.29 (AR 10.22) บวกหางและลำตัว"
    },
    "dCD_sep": {
     "v": 0.2,
     "u": "-",
     "scope": "aircraft",
     "src": [
      "LD15"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณจากรอบที่ 1"
    },
    "CmX": {
     "v": -0.08,
     "u": "-",
     "scope": "aircraft",
     "src": [
      "LD15",
      "LD8"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: pitch break อ่อนกว่ารอบที่ 1 (−0.12) เพราะ DA40 ขึ้นชื่อว่า stall นุ่มนวล ส่ายหัวลงเล็กน้อย (ค่าวรรณกรรม AT-26 −0.08)"
    },
    "alpha_CLmax": {
     "v": {
      "UP": 12.6,
      "T/O": 9.4,
      "LDG": 8.1
     },
     "u": "deg",
     "scope": "aircraft",
     "src": [
      "LM0"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: ผลการบิน stall 1 kt/s ใน lm_card ที่ 1,310 kg (มุมที่ CLmax) ไม่ใช่ค่าวัดจริง"
    }
   },
   "flaps": {
    "detents": {
     "v": [
      {
       "name": "UP",
       "flap_deg": 0,
       "VFE_kt": null,
       "dCL0": 0,
       "dCD0": 0,
       "dCm0": 0,
       "CLmax": 1.362
      },
      {
       "name": "T/O",
       "flap_deg": 20,
       "VFE_kt": 110,
       "dCL0": 0.52,
       "dCD0": 0.008,
       "dCm0": -0.06,
       "CLmax": 1.543
      },
      {
       "name": "LDG",
       "flap_deg": 42,
       "VFE_kt": 98,
       "dCL0": 0.75,
       "dCD0": 0.035,
       "dCm0": -0.1,
       "CLmax": 1.69
      }
     ],
     "u": "-",
     "scope": "aircraft",
     "src": [
      "LD1",
      "LM10"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "มุมแฟลปและ VFE จริง [LD1 p.28–29]; dCL0 ค่าประมาณ DATCOM (ld_flaps.mjs); dCD0 LDG 0.035 ปรับให้ polar ของซิมร่อน idle ที่ 73 KIAS แฟลป LDG ได้ L/D ≈ 7.0 ตามจุดของ DA 40 TDI ที่อ้างใน [LD13] โพสต์ 16/20 (ไม่ใช่ NG; ลดจาก 0.050 รอบแรก, ld_iter.mjs §05.9) ตรวจกับจุดของ NG แฟลป LDG idle 88 KIAS L/D 6.9 (โพสต์ 20): ซิมให้ 6.7 ที่ 1,310 kg และ 6.2 ที่ 1,100 kg (scripts/ld_review.mjs), T/O 0.008 ตามสัดส่วน (ซิมวันนี้ใช้ CDflap·f จึงได้ 0.024 ที่ T/O ดู §05.12); dCm0 ค่าประมาณจากขนาดทั่วไป; CLmax จาก VS ใน checklist [LD3]"
    },
    "transition_time_s": {
     "v": 8,
     "u": "s",
     "scope": "aircraft",
     "src": [
      "LD6"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ UP→LDG 0→42° (AFM ระบุว่าแฟลปขับด้วยมอเตอร์ไฟฟ้า 3 ตำแหน่ง แต่ไม่ระบุเวลา [LD6 §7.3]); ระดับเดียวกับแฟลปไฟฟ้าเครื่องบินเบาทั่วไป ~1.5–2 s ต่อ 10°"
    }
   },
   "derivatives": {
    "CLq": {
     "v": {
      "cruise": 8.365,
      "approach": 8.323
     },
     "u": "1/rad",
     "scope": "aircraft",
     "src": [
      "LM10",
      "LM11",
      "LM12"
     ],
     "conf": "กลาง",
     "est": true,
     "note": "ค่าประมาณ lm_derivs (แกนลำตัว, cruise 110 kt CL 0.43 / approach 77 kt CL 0.89); ความแม่นตามตาราง 01.3-3"
    },
    "CLadot": {
     "v": {
      "cruise": 1.564,
      "approach": 1.547
     },
     "u": "1/rad",
     "scope": "aircraft",
     "src": [
      "LM10",
      "LM11",
      "LM12"
     ],
     "conf": "กลาง",
     "est": true,
     "note": "ค่าประมาณ lm_derivs (แกนลำตัว, cruise 110 kt CL 0.43 / approach 77 kt CL 0.89); ความแม่นตามตาราง 01.3-3"
    },
    "CLde": {
     "v": {
      "cruise": 0.3575,
      "approach": 0.3559
     },
     "u": "1/rad",
     "scope": "aircraft",
     "src": [
      "LM10",
      "LM11",
      "LM12"
     ],
     "conf": "กลาง",
     "est": true,
     "note": "ค่าประมาณ lm_derivs (แกนลำตัว, cruise 110 kt CL 0.43 / approach 77 kt CL 0.89); ความแม่นตามตาราง 01.3-3"
    },
    "CYb": {
     "v": {
      "cruise": -0.5712,
      "approach": -0.5707
     },
     "u": "1/rad",
     "scope": "aircraft",
     "src": [
      "LM10",
      "LM11",
      "LM12"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ lm_derivs (แกนลำตัว, cruise 110 kt CL 0.43 / approach 77 kt CL 0.89); ความแม่นตามตาราง 01.3-3"
    },
    "CYdr": {
     "v": {
      "cruise": 0.1202,
      "approach": 0.12
     },
     "u": "1/rad",
     "scope": "aircraft",
     "src": [
      "LM10",
      "LM11",
      "LM12"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ lm_derivs (แกนลำตัว, cruise 110 kt CL 0.43 / approach 77 kt CL 0.89); ความแม่นตามตาราง 01.3-3"
    },
    "CYr": {
     "v": {
      "cruise": 0.2118,
      "approach": 0.2109
     },
     "u": "1/rad",
     "scope": "aircraft",
     "src": [
      "LM10",
      "LM11",
      "LM12"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ lm_derivs (แกนลำตัว, cruise 110 kt CL 0.43 / approach 77 kt CL 0.89); ความแม่นตามตาราง 01.3-3"
    },
    "Clb": {
     "v": {
      "cruise": -0.0535,
      "approach": -0.0491
     },
     "u": "1/rad",
     "scope": "aircraft",
     "src": [
      "LM10",
      "LM11",
      "LM12"
     ],
     "conf": "กลาง",
     "est": true,
     "note": "ค่าประมาณ lm_derivs (แกนลำตัว, cruise 110 kt CL 0.43 / approach 77 kt CL 0.89); ความแม่นตามตาราง 01.3-3"
    },
    "Clp": {
     "v": {
      "cruise": -0.552,
      "approach": -0.5559
     },
     "u": "1/rad",
     "scope": "aircraft",
     "src": [
      "LM10",
      "LM11",
      "LM12"
     ],
     "conf": "กลาง",
     "est": true,
     "note": "ค่าประมาณ lm_derivs (แกนลำตัว, cruise 110 kt CL 0.43 / approach 77 kt CL 0.89); ความแม่นตามตาราง 01.3-3"
    },
    "Clr": {
     "v": {
      "cruise": 0.0995,
      "approach": 0.1637
     },
     "u": "1/rad",
     "scope": "aircraft",
     "src": [
      "LM10",
      "LM11",
      "LM12"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ lm_derivs (แกนลำตัว, cruise 110 kt CL 0.43 / approach 77 kt CL 0.89); ความแม่นตามตาราง 01.3-3"
    },
    "Clda": {
     "v": {
      "cruise": 0.1724,
      "approach": 0.1745
     },
     "u": "1/rad",
     "scope": "aircraft",
     "src": [
      "LM10",
      "LM11",
      "LM12"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ lm_derivs (แกนลำตัว, cruise 110 kt CL 0.43 / approach 77 kt CL 0.89); ความแม่นตามตาราง 01.3-3"
    },
    "Cldr": {
     "v": {
      "cruise": 0.0062,
      "approach": 0.0062
     },
     "u": "1/rad",
     "scope": "aircraft",
     "src": [
      "LM10",
      "LM11",
      "LM12"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ lm_derivs (แกนลำตัว, cruise 110 kt CL 0.43 / approach 77 kt CL 0.89); ความแม่นตามตาราง 01.3-3"
    },
    "Cmq": {
     "v": {
      "cruise": -24.58,
      "approach": -24.47
     },
     "u": "1/rad",
     "scope": "aircraft",
     "src": [
      "LM10",
      "LM11",
      "LM12"
     ],
     "conf": "กลาง",
     "est": true,
     "note": "ค่าประมาณ lm_derivs (แกนลำตัว, cruise 110 kt CL 0.43 / approach 77 kt CL 0.89); ความแม่นตามตาราง 01.3-3"
    },
    "Cmadot": {
     "v": {
      "cruise": -6.451,
      "approach": -6.384
     },
     "u": "1/rad",
     "scope": "aircraft",
     "src": [
      "LM10",
      "LM11",
      "LM12"
     ],
     "conf": "กลาง",
     "est": true,
     "note": "ค่าประมาณ lm_derivs (แกนลำตัว, cruise 110 kt CL 0.43 / approach 77 kt CL 0.89); ความแม่นตามตาราง 01.3-3"
    },
    "Cmde": {
     "v": {
      "cruise": -1.475,
      "approach": -1.468
     },
     "u": "1/rad",
     "scope": "aircraft",
     "src": [
      "LM10",
      "LM11",
      "LM12"
     ],
     "conf": "กลาง",
     "est": true,
     "note": "ค่าประมาณ lm_derivs (แกนลำตัว, cruise 110 kt CL 0.43 / approach 77 kt CL 0.89); ความแม่นตามตาราง 01.3-3"
    },
    "Cnb": {
     "v": {
      "cruise": 0.0581,
      "approach": 0.0546
     },
     "u": "1/rad",
     "scope": "aircraft",
     "src": [
      "LM10",
      "LM11",
      "LM12"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ lm_derivs (แกนลำตัว, cruise 110 kt CL 0.43 / approach 77 kt CL 0.89); ความแม่นตามตาราง 01.3-3"
    },
    "Cnp": {
     "v": {
      "cruise": -0.0742,
      "approach": -0.1795
     },
     "u": "1/rad",
     "scope": "aircraft",
     "src": [
      "LM10",
      "LM11",
      "LM12"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ lm_derivs (แกนลำตัว, cruise 110 kt CL 0.43 / approach 77 kt CL 0.89); ความแม่นตามตาราง 01.3-3"
    },
    "Cnr": {
     "v": {
      "cruise": -0.0894,
      "approach": -0.0932
     },
     "u": "1/rad",
     "scope": "aircraft",
     "src": [
      "LM10",
      "LM11",
      "LM12"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ lm_derivs (แกนลำตัว, cruise 110 kt CL 0.43 / approach 77 kt CL 0.89); ความแม่นตามตาราง 01.3-3"
    },
    "Cnda": {
     "v": {
      "cruise": -0.0086,
      "approach": -0.0084
     },
     "u": "1/rad",
     "scope": "aircraft",
     "src": [
      "LM10",
      "LM11",
      "LM12"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ lm_derivs (แกนลำตัว, cruise 110 kt CL 0.43 / approach 77 kt CL 0.89); ความแม่นตามตาราง 01.3-3"
    },
    "Cndr": {
     "v": {
      "cruise": -0.0453,
      "approach": -0.0452
     },
     "u": "1/rad",
     "scope": "aircraft",
     "src": [
      "LM10",
      "LM11",
      "LM12"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ lm_derivs (แกนลำตัว, cruise 110 kt CL 0.43 / approach 77 kt CL 0.89); ความแม่นตามตาราง 01.3-3"
    },
    "CD0": {
     "v": 0.0403,
     "u": "-",
     "scope": "aircraft",
     "src": [
      "LD3"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: polar พาราโบลาจาก best glide 87.5 KCAS L/D 9.7 ที่ 1,310 kg (lm_polar.polarFromGlide) รวมแรงต้านใบพัดหมุนฟรี"
    },
    "K": {
     "v": 0.066,
     "u": "-",
     "scope": "aircraft",
     "src": [
      "LD3"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: จาก glide เดียวกัน (e ≈ 0.47 รวมแรงต้านใบพัด); lm_derivs ให้ K ทางอากาศพลศาสตร์ 0.042 (e 0.75)"
    }
   },
   "legacy": {
    "v": {
     "CL0": 0.34,
     "CLa": 5.45,
     "CLflap": 0.75,
     "CDflap": 0.035,
     "CDgear": 0,
     "Cm0": 0.02,
     "Cma": -1.6,
     "Cmflap": -0.1,
     "aStall": 15.29,
     "aStallFlap": -4.23,
     "CD0": 0.04799,
     "K": 0.08169
    },
    "u": "-",
    "scope": "aircraft",
    "src": [
     "LM0",
     "LD3",
     "LD4"
    ],
    "conf": "ต่ำ",
    "est": true,
    "note": "ค่าประมาณ lm_legacy_fit: polar ของซิม CD0 + K(CL − 0.15)² จากการร่อน 88 KIAS L/D 9.7; aStall/aStallFlap แก้หาให้ CLmax 1 g = 1.362 (UP) / 1.690 (LDG); CLflap = ΔCL0 ที่ LDG; CDflap 0.035 = dCD0 LDG หลัง iteration (§05.9); CDgear 0 (ล้อตายตัว แรงต้านอยู่ใน CD0)"
   },
   "elevator_fade": {
    "alpha_t_star": {
     "v": 20,
     "u": "deg",
     "scope": "aircraft",
     "src": [
      "LD15"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: alpha_CLmax clean ≈ 12.6° + ราว 6–7° ตามแนวทางรอบที่ 1; หาง T อยู่นอก wake ที่ α ปกติ แต่ deep-stall ไม่ได้ศึกษา"
    },
    "a_t": {
     "v": 10,
     "u": "1/rad",
     "scope": "aircraft",
     "src": [
      "LD15"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณจากรอบที่ 1"
    },
    "floor": {
     "v": 0.35,
     "u": "-",
     "scope": "aircraft",
     "src": [
      "LD15"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณจากรอบที่ 1"
    }
   },
   "separation_dynamics": {
    "tau1": {
     "v": 0.3,
     "u": "s",
     "scope": "aircraft",
     "src": [
      "LD15"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: สเกลจากรอบที่ 1 (0.4 s) ด้วยคอร์ดที่สั้นกว่า (1.17/1.65) และความเร็ว stall ต่ำกว่า"
    },
    "tau2": {
     "v": 0.15,
     "u": "s",
     "scope": "aircraft",
     "src": [
      "LD15"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: สเกลเดียวกัน (รอบที่ 1 0.2 s; airfoil 4.24c/V ≈ 0.15 s ที่ 33 m/s)"
    }
   },
   "large_beta": {
    "CY_crossflow": {
     "v": 0.49,
     "u": "-",
     "scope": "aircraft",
     "src": [
      "LD2"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: พื้นที่ด้านข้าง ≈ 6.5 m² (ยาว 8.06 m × สูงเฉลี่ย ~0.8 m) × CD 1.0 / S 13.244"
    }
   },
   "strip_wing": {
    "taper": {
     "v": 0.55,
     "u": "-",
     "scope": "aircraft",
     "src": [
      "LD2"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: ปีกเรียวตรงเทียบเท่า (ld_geom.mjs)"
    },
    "dihedral_eff": {
     "v": 5,
     "u": "deg",
     "scope": "aircraft",
     "src": [
      "LD6"
     ],
     "conf": "กลาง",
     "est": true,
     "note": "ค่าประมาณ: dihedral ≈ 5° [LD6 p.1-6]; Clb ของปีก+ลำตัวรวมจาก lm_derivs ≈ -0.049"
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
     "note": "ค่าประมาณ (ไม่พบค่าจริง)"
    },
    "kp_roll": {
     "v": 0.66,
     "u": "-",
     "scope": "aircraft",
     "src": [
      "LD15"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณจากรอบที่ 1; ต้องปรับให้ Clp(2°) ≈ -0.556 ของ lm_derivs"
    },
    "tau_aileron": {
     "v": 0.45,
     "u": "-",
     "scope": "aircraft",
     "src": [
      "LM10"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: τ ของ aileron chord ratio 0.27 (thin-airfoil ≈ 0.62 × ประสิทธิผล 0.75); ต้องปรับให้ Clda ≈ 0.174"
    },
    "aileron_span_frac": {
     "v": [
      0.72,
      0.97
     ],
     "u": "-",
     "scope": "aircraft",
     "src": [
      "LD2"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "สัดส่วนครึ่งช่วงปีก ค่าประมาณจากพื้นที่ aileron 0.327 m² ต่อข้างและภาพ"
    }
   },
   "stall_warning": {
    "min_margin": {
     "v": 5,
     "u": "kt",
     "scope": "aircraft",
     "src": [
      "LD12"
     ],
     "conf": "สูง",
     "est": false,
     "note": "14 CFR 23.207(c) (ก่อน Amdt 23-64) / CS 23.207: เตือนอย่างน้อย 5 kt ก่อน stall; DA40 มี lift detector (stall warning) ที่ปีกซ้าย [LD8 p.3]"
    },
    "alpha_warn_5kt": {
     "v": {
      "UP": 8.8,
      "LDG": 3.66
     },
     "u": "deg",
     "scope": "aircraft",
     "src": [
      "LM0"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: คำนวณ: α ลำตัวที่ CL = CLmax (V_SR/(V_SR+5))² ด้วย CL0 และ CLα ของบัตร"
    },
    "alpha_warn_design": {
     "v": {
      "UP": 8.14,
      "LDG": 2.76
     },
     "u": "deg",
     "scope": "aircraft",
     "src": [
      "LM0"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: margin 7 kt เผื่อ gust ตามแนวทางรอบที่ 1"
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
      "R1:A11",
      "LD15"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: ใช้ตัวกรองของรอบที่ 1 (Citation II 12.1 Hz); โครง composite ของ DA40 ยังไม่มีค่าวัด"
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
      "R1:A11",
      "LD15"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณจากรอบที่ 1"
    },
    "rms_full": {
     "v": {
      "az": 0.03,
      "ay": 0.01
     },
     "u": "g",
     "scope": "aircraft",
     "src": [
      "LD8"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: เบากว่าเครื่องฝึกรอบที่ 1 (0.05 g) เพราะ DA40 มีการเตือน stall ทางอากาศพลศาสตร์น้อย ผู้ฝึกพึ่งเสียงเตือน"
    }
   },
   "spin_reference": {
    "alpha_spin": {
     "v": [
      43,
      60
     ],
     "u": "deg",
     "scope": "aircraft",
     "src": [
      "LD15"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: ค่าอ้างอิง NASA ของเครื่อง GA ปีกต่ำ (รอบที่ 1); DA40 ไม่ได้รับอนุญาตให้ spin [LD1][LD2 p.2-19] จึงใช้เฉพาะจำลองการหลุดเข้า spin โดยไม่ตั้งใจ"
    },
    "turn_rate": {
     "v": [
      145,
      208
     ],
     "u": "deg/s",
     "scope": "aircraft",
     "src": [
      "LD15"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: NASA TP-2644 (รอบที่ 1)"
    },
    "omega_hat": {
     "v": [
      0.24,
      0.42
     ],
     "u": "-",
     "scope": "aircraft",
     "src": [
      "LD15"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: รอบที่ 1"
    },
    "descent_trainer": {
     "v": 6000,
     "u": "fpm",
     "scope": "aircraft",
     "src": [
      "LD15"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: เครื่อง 4 ที่นั่งเบากว่าเครื่องฝึกรอบที่ 1 (9,500 fpm) สเกลตาม √(W/S)"
    },
    "IYMP": {
     "v": 0.0012,
     "u": "-",
     "scope": "aircraft",
     "src": [
      "LM15"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "(Ixx − Iyy)/(m b²) จาก inertia ค่าประมาณ ≈ 0: กระจายมวลไม่เด่นทางลำตัว (ต่างจากเครื่องฝึกรอบที่ 1 −0.0201)"
    },
    "recovery_turns_max": {
     "v": 1,
     "u": "turn",
     "scope": "aircraft",
     "src": [
      "LD12"
     ],
     "conf": "กลาง",
     "est": false,
     "note": "ประเภท normal: กู้ได้ภายใน 1 รอบเพิ่มจาก spin 1 รอบ (14 CFR 23.221(a) เดิม / CS 23.221); DA40 ห้าม spin โดยเจตนา ขั้นตอนกู้: idle, rudder สุดทวนทิศ, ดันคันสุด, aileron กลาง, เก็บแฟลป [LD6 p.3-33]"
    }
   }
  }
 }
}
```

```json
{
 "da40ng": {
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
     "LD6",
     "LD7"
    ],
    "conf": "สูง",
    "est": false,
    "note": "aileron และ elevator ใช้ push rod, rudder ใช้สายเคเบิล, trim tab บน elevator ขับด้วย Bowden cable, แฟลปไฟฟ้า [LD6 p.7-4][LD7]"
   },
   "surfaces": {
    "elevator": {
     "v": {
      "travel_deg": {
       "up": 21,
       "down": 17
      },
      "tol": {
       "up": "+0/−1",
       "down": "+1/−0"
      },
      "rate_dps": null,
      "actuator_tau_s": null
     },
     "u": "deg",
     "scope": "aircraft",
     "src": [
      "LD1"
     ],
     "conf": "สูง",
     "est": false,
     "note": "DA 40 NG [LD1 p.29]; DA 40 รุ่นเดิม 23/15 (ถังมาตรฐาน), 23/16 (ถังพิสัยไกล), 18/16 (MÄM 40-227) [LD1 p.7]"
    },
    "aileron": {
     "v": {
      "travel_deg": {
       "up": 20,
       "down": 13
      },
      "tol": {
       "up": "±2",
       "down": "±2"
      },
      "rate_dps": null,
      "actuator_tau_s": null
     },
     "u": "deg",
     "scope": "aircraft",
     "src": [
      "LD1"
     ],
     "conf": "สูง",
     "est": false,
     "note": "[LD1 p.29] (การจับคู่ค่ากับชื่อพื้นบังคับใน PDF อ่านตามลำดับหัวข้อ ตรงกับ Section A/B)"
    },
    "rudder": {
     "v": {
      "travel_deg": {
       "left": 24,
       "right": 26
      },
      "tol": "±1",
      "rate_dps": null,
      "actuator_tau_s": null
     },
     "u": "deg",
     "scope": "aircraft",
     "src": [
      "LD1"
     ],
     "conf": "สูง",
     "est": false,
     "note": "[LD1 p.29]; DA 40 รุ่นเดิมถังมาตรฐาน 29/31"
    },
    "flap": {
     "v": {
      "travel_deg": {
       "T/O": 20,
       "LDG": 42
      },
      "tol": {
       "T/O": "±2",
       "LDG": "±1"
      },
      "rate_dps": null,
      "actuator_tau_s": null,
      "kind": "ไฟฟ้า 3 ตำแหน่ง UP / T/O / LDG (ชื่อตาม AFM)"
     },
     "u": "deg",
     "scope": "aircraft",
     "src": [
      "LD1",
      "LD6"
     ],
     "conf": "สูง",
     "est": false,
     "note": "[LD1 p.29]"
    },
    "trim_tab": {
     "v": {
      "travel_deg": {
       "nose_up": 12,
       "nose_down": 39
      },
      "tol": "±2"
     },
     "u": "deg",
     "scope": "aircraft",
     "src": [
      "LD1"
     ],
     "conf": "สูง",
     "est": false,
     "note": "มุม tab: nose up +12°, nose down −39° [LD1 p.29]"
    }
   },
   "trim": {
    "kind": {
     "v": "manual (trim wheel → Bowden cable → elevator tab)",
     "u": "-",
     "scope": "aircraft",
     "src": [
      "LD6"
     ],
     "conf": "กลาง",
     "est": false,
     "note": "AFM รุ่นเดิมบรรยาย trim tab บน elevator ขับด้วย Bowden cable [LD6 p.7-4]; NG ที่มี autopilot GFC700 มี electric trim ด้วย [LD7]"
    }
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
      "LD6"
     ],
     "conf": "สูง",
     "est": false,
     "note": "push rod + trim tab [LD6 p.7-4]"
    },
    "S_e": {
     "v": 0.665,
     "u": "m2",
     "scope": "aircraft",
     "src": [
      "LD2"
     ],
     "conf": "สูง",
     "est": false,
     "note": "[LD2 p.1-6]"
    },
    "c_e": {
     "v": 0.196,
     "u": "m",
     "scope": "aircraft",
     "src": [
      "LD2"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "S_e / b_h (ค่าประมาณ)"
    },
    "gearing": {
     "v": 2.4,
     "u": "rad/m",
     "scope": "aircraft",
     "src": [
      "LD1"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: ระยะ elevator 21°+17° = 0.663 rad ต่อระยะคัน ~0.28 m"
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
     "note": "ค่าประมาณ: หาง T"
    },
    "a_t": {
     "v": 4.11,
     "u": "1/rad",
     "scope": "aircraft",
     "src": [
      "LM10"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: lm_derivs"
    },
    "tau_e": {
     "v": 0.54,
     "u": "-",
     "scope": "aircraft",
     "src": [
      "LM10"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: lm_derivs (chord ratio 0.28)"
    },
    "l_t": {
     "v": 4.78,
     "u": "m",
     "scope": "aircraft",
     "src": [
      "LD2"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: ld_geom.mjs"
    },
    "deda": {
     "v": 0.287,
     "u": "-",
     "scope": "aircraft",
     "src": [
      "LM10"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: lm_derivs"
    },
    "Ch0": {
     "v": 0,
     "u": "-",
     "scope": "aircraft",
     "src": [
      "LD15"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ"
    },
    "Ch_alpha": {
     "v": -0.1146,
     "u": "1/rad",
     "scope": "aircraft",
     "src": [
      "LD15"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณจากรอบที่ 1 (−0.0020/deg)"
    },
    "Ch_delta": {
     "v": -0.3438,
     "u": "1/rad",
     "scope": "aircraft",
     "src": [
      "LD15"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณจากรอบที่ 1 (−0.0060/deg)"
    },
    "Ch_tab": {
     "v": -0.2005,
     "u": "1/rad",
     "scope": "aircraft",
     "src": [
      "LD15"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณจากรอบที่ 1"
    },
    "tab_max": {
     "v": {
      "nose_up": 12,
      "nose_down": 39
     },
     "u": "deg",
     "scope": "aircraft",
     "src": [
      "LD1"
     ],
     "conf": "สูง",
     "est": false,
     "note": "ระยะ trim tab ตาม TCDS [LD1 p.29]"
    },
    "trim_rate_flaps_down": {
     "v": 1,
     "u": "deg/s",
     "scope": "aircraft",
     "src": [
      "LD15"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: ล้อ trim มือ: อัตราขึ้นกับนักบิน ใช้ค่ารอบที่ 1"
    },
    "trim_rate_flaps_up": {
     "v": 1,
     "u": "deg/s",
     "scope": "aircraft",
     "src": [
      "LD15"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: ล้อ trim มือ"
    },
    "breakout": {
     "v": 4.45,
     "u": "N",
     "scope": "aircraft",
     "src": [
      "LD15"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: 1 lbf (รอบที่ 1)"
    },
    "friction": {
     "v": 4.45,
     "u": "N",
     "scope": "aircraft",
     "src": [
      "LD15"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: รอบที่ 1"
    },
    "centring_spring": {
     "v": {
      "Kc": 60,
      "qFade": 400
     },
     "u": "N/rad, Pa",
     "scope": "aircraft",
     "src": [
      "LD15"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: รอบที่ 1"
    },
    "stops": {
     "v": {
      "teu": 21,
      "ted": 17
     },
     "u": "deg",
     "scope": "aircraft",
     "src": [
      "LD1"
     ],
     "conf": "สูง",
     "est": false,
     "note": "TCDS [LD1 p.29]"
    },
    "rate_limit": {
     "v": 70,
     "u": "deg/s",
     "scope": "aircraft",
     "src": [
      "LD15"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: รอบที่ 1"
    },
    "derived_check": {
     "v": {
      "mass_kg": 1150,
      "Fs_per_g_N": {
       "approach": 19.4,
       "cruise": 19.1
      },
      "grad_N_per_kt": {
       "approach": 0.401,
       "cruise": 0.266
      },
      "at_kcas": {
       "approach": 73,
       "cruise": 110
      },
      "SM_fixed": 0.294,
      "SM_free": 0.227,
      "free_elevator_factor": 0.82,
      "mtom": {
       "mass_kg": 1310,
       "Fs_per_g_N": 21.1,
       "pull_to_nL_lbf": 13.3,
       "cfr23_155_min_lbf": 20.6
      }
     },
     "u": "N/g, N/kt, MAC",
     "scope": "aircraft",
     "src": [
      "LD12",
      "LD15",
      "LM0"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ (scripts/ld_stickforce.mjs, gap 18): สมการ elevator แบบ reversible ของรอบที่ 1 §6 (trim เชิงเส้น + Ch = Ch0 + Chα·αt + Chδ·δe + Chtab·δtab, F = G·ηt·q·Se·ce·Ch) กับ controls.pitch.* ของบัตรนี้ ที่ training_mass 1150 kg; ที่ MTOM 1310 kg แรงดึงถึง 3.8 g = 13.3 lbf (59.2 N) ต่ำกว่าขั้นต่ำ 14 CFR 23.155(a)(2) 20.6 lbf [LD12] แสดงว่า Chδ และ gearing ที่ยกมาจากรอบที่ 1 ต่ำไปสำหรับ DA40 (เครื่องจริงผ่านการรับรอง) เป้าของโมเดลแรงที่คันในอนาคตคือ Fs/g ≥ 32.8 N/g ที่ MTOM (T-LD-43) และความชันต่อความเร็วเป็นบวก (T-LD-44); ซิมวันนี้ไม่มีโมเดลแรงที่คัน"
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
      "LD6"
     ],
     "conf": "สูง",
     "est": false,
     "note": "push rod"
    },
    "S_a_each": {
     "v": 0.327,
     "u": "m2",
     "scope": "aircraft",
     "src": [
      "LD2"
     ],
     "conf": "สูง",
     "est": false,
     "note": "ครึ่งหนึ่งของ 0.654 m² [LD2 p.1-5]"
    },
    "c_a": {
     "v": 0.25,
     "u": "m",
     "scope": "aircraft",
     "src": [
      "LD2"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ"
    },
    "gearing": {
     "v": 3.2,
     "u": "rad/m",
     "scope": "aircraft",
     "src": [
      "LD1"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: aileron เฉลี่ย ±16.5° ต่อคันข้าง ±0.09 m"
    },
    "Ch_delta": {
     "v": -0.1719,
     "u": "1/rad",
     "scope": "aircraft",
     "src": [
      "LD15"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: รอบที่ 1"
    },
    "Ch_alpha": {
     "v": -0.0573,
     "u": "1/rad",
     "scope": "aircraft",
     "src": [
      "LD15"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: รอบที่ 1"
    },
    "tab_max": {
     "v": 0,
     "u": "deg",
     "scope": "aircraft",
     "src": [
      "LD6"
     ],
     "conf": "กลาง",
     "est": true,
     "note": "ค่าประมาณ: ไม่มี aileron trim ที่นักบินปรับได้ (ไม่พบใน AFM)"
    },
    "trim_rate": {
     "v": 0,
     "u": "deg/s",
     "scope": "aircraft",
     "src": [
      "LD6"
     ],
     "conf": "กลาง",
     "est": true,
     "note": "ค่าประมาณ: 0 เพราะไม่พบระบบ trim ของแกนนี้ใน AFM [LD6]"
    },
    "breakout": {
     "v": 3,
     "u": "N",
     "scope": "aircraft",
     "src": [
      "LD15"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: รอบที่ 1"
    },
    "stops": {
     "v": {
      "up": 20,
      "down": 13,
      "max": 16.5
     },
     "u": "deg",
     "scope": "aircraft",
     "src": [
      "LD1"
     ],
     "conf": "สูง",
     "est": false,
     "note": "TCDS 20° ขึ้น / 13° ลง [LD1 p.29]; max = ค่าเฉลี่ยที่ซิมใช้"
    },
    "rate_limit": {
     "v": 80,
     "u": "deg/s",
     "scope": "aircraft",
     "src": [
      "LD15"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: รอบที่ 1"
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
      "LD6"
     ],
     "conf": "สูง",
     "est": false,
     "note": "สายเคเบิล [LD6 p.7-4]"
    },
    "S_r": {
     "v": 0.47,
     "u": "m2",
     "scope": "aircraft",
     "src": [
      "LD2"
     ],
     "conf": "สูง",
     "est": false,
     "note": "[LD2 p.1-6]"
    },
    "c_r": {
     "v": 0.36,
     "u": "m",
     "scope": "aircraft",
     "src": [
      "LD2"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: S_r / b_v"
    },
    "gearing": {
     "v": 4.8,
     "u": "rad/m",
     "scope": "aircraft",
     "src": [
      "LD1"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: ±25° ต่อแป้น ±0.09 m"
    },
    "Ch_delta": {
     "v": -0.3438,
     "u": "1/rad",
     "scope": "aircraft",
     "src": [
      "LD15"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: รอบที่ 1"
    },
    "Ch_beta": {
     "v": -0.1146,
     "u": "1/rad",
     "scope": "aircraft",
     "src": [
      "LD15"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: รอบที่ 1"
    },
    "slipstream_q_ratio": {
     "v": [
      1,
      1.5
     ],
     "u": "-",
     "scope": "aircraft",
     "src": [
      "LD15"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: ครีบจมใน slipstream บางส่วน (immersionV)"
    },
    "tab_max": {
     "v": 0,
     "u": "deg",
     "scope": "aircraft",
     "src": [
      "LD6"
     ],
     "conf": "กลาง",
     "est": true,
     "note": "ค่าประมาณ: ไม่พบ rudder trim ที่นักบินปรับได้ใน AFM"
    },
    "trim_rate": {
     "v": 0,
     "u": "deg/s",
     "scope": "aircraft",
     "src": [
      "LD6"
     ],
     "conf": "กลาง",
     "est": true,
     "note": "ค่าประมาณ: 0 เพราะไม่พบระบบ trim ของแกนนี้ใน AFM [LD6]"
    },
    "breakout": {
     "v": 13.3,
     "u": "N",
     "scope": "aircraft",
     "src": [
      "LD15"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: 3 lbf (รอบที่ 1)"
    },
    "stops": {
     "v": {
      "left": 24,
      "right": 26,
      "max": 24
     },
     "u": "deg",
     "scope": "aircraft",
     "src": [
      "LD1"
     ],
     "conf": "สูง",
     "est": false,
     "note": "TCDS [LD1 p.29]; max = min(left, right)"
    },
    "rate_limit": {
     "v": 60,
     "u": "deg/s",
     "scope": "aircraft",
     "src": [
      "LD15"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: รอบที่ 1"
    }
   }
  }
 }
}
```

```json
{
 "da40ng": {
  "gear": {
   "layout": {
    "v": "tricycle_fixed",
    "u": "-",
    "scope": "gear",
    "src": [
     "LD1"
    ],
    "conf": "สูง",
    "est": false,
    "note": "fixed tricycle landing gear [LD1 p.26] (รุ่นเดิม Section A p.4, DA 40 D Section B p.12)"
   },
   "geometry": {
    "nose_contact_body_extended": {
     "v": [
      1.35,
      0,
      0.88
     ],
     "u": "m FRD",
     "scope": "gear",
     "src": [
      "LD2",
      "LB19"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: ล้อหน้า 1.12 m DAT (ล้อหลัก − wheelbase 1.68 m [LD2]); z = ความสูง CG ~0.85 m + ยุบตัวสถิต 0.03 m"
    },
    "main_contact_body_extended": {
     "v": [
      [
       -0.33,
       -1.485,
       0.91
      ],
      [
       -0.33,
       1.485,
       0.91
      ]
     ],
     "u": "m FRD",
     "scope": "gear",
     "src": [
      "LD2",
      "LB19"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: ล้อหลัก 2.80 m DAT (โมเดล FlightGear 2.81 m [LB19]); track 2.97 m [LD2]; z + ยุบตัวสถิต 0.06 m"
    },
    "cg_height_parked": {
     "v": 0.85,
     "u": "m",
     "scope": "gear",
     "src": [
      "LB19"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ (FlightGear 0.79 m)"
    }
   },
   "strut_main": {
    "kind": {
     "v": "spring_leg",
     "u": "-",
     "scope": "gear",
     "src": [
      "LD6"
     ],
     "conf": "สูง",
     "est": false,
     "note": "ขาสปริงเหล็ก \"sprung steel struts\" [LD6 p.7-13]; TCDS อ้างขา 18 mm/\"thin\"/\"tall\" [LD1 p.8]"
    },
    "stroke": {
     "v": 0.15,
     "u": "m",
     "scope": "gear",
     "src": [
      "LD6"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณระยะยุบสูงสุดที่ล้อ"
    },
    "spring": {
     "v": {
      "static_deflection": 0.06,
      "damping_ratio": 0.25
     },
     "u": "m, -",
     "scope": "gear",
     "src": [
      "LD6"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: ขาสปริงเหล็กหน่วงน้อย (ζ รวมยางและแรงเสียดทาน ~0.25); ซิมคิด k = N/δ_static"
    }
   },
   "strut_nose": {
    "kind": {
     "v": "elastomer",
     "u": "-",
     "scope": "gear",
     "src": [
      "LD6"
     ],
     "conf": "สูง",
     "est": false,
     "note": "ล้อหน้า castering รับแรงด้วย elastomer package [LD6 p.7-13]"
    },
    "stroke": {
     "v": 0.08,
     "u": "m",
     "scope": "gear",
     "src": [
      "LD6"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ"
    },
    "spring": {
     "v": {
      "static_deflection": 0.03,
      "damping_ratio": 0.4
     },
     "u": "m, -",
     "scope": "gear",
     "src": [
      "LD6"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: elastomer หน่วงมากกว่าสปริงเหล็ก"
    }
   },
   "tyre_main": {
    "size": {
     "v": {
      "size": "15x6.0-6",
      "ply": 6
     },
     "u": "-",
     "scope": "gear",
     "src": [
      "LD1"
     ],
     "conf": "สูง",
     "est": false,
     "note": "6 PR; OÄM 40-334: 8.50-6 [LD1 p.29]"
    },
    "rated_load": {
     "v": 5560,
     "u": "N",
     "scope": "gear",
     "src": [
      "LD1"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ ~1,250 lb สำหรับยาง 6 ply ขนาดนี้ (ไม่ได้เปิด data sheet ผู้ผลิตยาง); โหลดสถิตที่ 1,310 kg ≈ 5,170 N ต่อล้อ"
    },
    "rated_pressure": {
     "v": 40,
     "u": "psi",
     "scope": "gear",
     "src": [
      "LD1"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ"
    },
    "operating_pressure": {
     "v": 36,
     "u": "psi",
     "scope": "gear",
     "src": [
      "LD1"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ ~2.5 bar (ไม่ได้อ่านบท 8 ของ AFM)"
    },
    "outside_diameter": {
     "v": 0.381,
     "u": "m",
     "scope": "gear",
     "src": [
      "LD1"
     ],
     "conf": "สูง",
     "est": false,
     "note": "15 in ตามรหัสยาง"
    },
    "section_width": {
     "v": 0.152,
     "u": "m",
     "scope": "gear",
     "src": [
      "LD1"
     ],
     "conf": "สูง",
     "est": false,
     "note": "6.0 in ตามรหัสยาง"
    },
    "k_vertical": {
     "v": 150000,
     "u": "N/m",
     "scope": "gear",
     "src": [
      "LD15"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: สเกลจากรอบที่ 1 (6.50-8 ที่ 60 psi 320 kN/m) ตามแรงดันและขนาด"
    },
    "c_vertical": {
     "v": 1500,
     "u": "N s/m",
     "scope": "gear",
     "src": [
      "LD15"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: ζ ≈ 0.1"
    },
    "cornering_stiffness_coef": {
     "v": 3.2,
     "u": "1/rad",
     "scope": "gear",
     "src": [
      "LD15"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: รอบที่ 1"
    },
    "relaxation_length": {
     "v": 0.25,
     "u": "m",
     "scope": "gear",
     "src": [
      "LD15"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: สเกลตามเส้นผ่านศูนย์กลาง"
    },
    "k_longitudinal": {
     "v": 110000,
     "u": "N/m",
     "scope": "gear",
     "src": [
      "LD15"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: TN 4110 eq.52 1.2 p d (p 36 psi, d 0.381 m)"
    },
    "mu_peak_dry": {
     "v": 0.8,
     "u": "-",
     "scope": "gear",
     "src": [
      "LD15"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: รอบที่ 1"
    },
    "mu_skid_ratio_dry": {
     "v": 0.75,
     "u": "-",
     "scope": "gear",
     "src": [
      "LD15"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: รอบที่ 1"
    },
    "mu_skid_ratio_wet": {
     "v": 0.5,
     "u": "-",
     "scope": "gear",
     "src": [
      "LD15"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: รอบที่ 1"
    },
    "rolling_radius": {
     "v": 0.18,
     "u": "m",
     "scope": "gear",
     "src": [
      "LD1"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: r − δ/3"
    },
    "wheel_inertia": {
     "v": 0.12,
     "u": "kg m2",
     "scope": "gear",
     "src": [
      "LD15"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ ยาง+ล้อ+จานเบรก ~7 kg"
    }
   },
   "tyre_nose": {
    "size": {
     "v": {
      "size": "5.00-5",
      "ply": 6
     },
     "u": "-",
     "scope": "gear",
     "src": [
      "LD1"
     ],
     "conf": "สูง",
     "est": false,
     "note": "6 PR; OÄM 40-334: 6.00-6 [LD1 p.29]"
    },
    "rated_load": {
     "v": 3600,
     "u": "N",
     "scope": "gear",
     "src": [
      "LD1"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ ~800 lb; โหลดสถิตล้อหน้า ≈ 20 % ของน้ำหนัก ≈ 2,500 N"
    },
    "rated_pressure": {
     "v": 50,
     "u": "psi",
     "scope": "gear",
     "src": [
      "LD1"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ"
    },
    "operating_pressure": {
     "v": 30,
     "u": "psi",
     "scope": "gear",
     "src": [
      "LD1"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ"
    },
    "outside_diameter": {
     "v": 0.355,
     "u": "m",
     "scope": "gear",
     "src": [
      "LD1"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: ค่าทั่วไปของยาง 5.00-5 (~14 in)"
    },
    "k_vertical": {
     "v": 110000,
     "u": "N/m",
     "scope": "gear",
     "src": [
      "LD15"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: สเกลตามขนาด"
    },
    "c_vertical": {
     "v": 900,
     "u": "N s/m",
     "scope": "gear",
     "src": [
      "LD15"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: ζ ≈ 0.1"
    },
    "cornering_stiffness_coef": {
     "v": 3.2,
     "u": "1/rad",
     "scope": "gear",
     "src": [
      "LD15"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: รอบที่ 1"
    },
    "relaxation_length": {
     "v": 0.22,
     "u": "m",
     "scope": "gear",
     "src": [
      "LD15"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: รอบที่ 1"
    }
   },
   "brakes": {
    "force_limit_ratio": {
     "v": 0.6,
     "u": "-",
     "scope": "gear",
     "src": [
      "LD15"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: รอบที่ 1; เบรกจานไฮดรอลิก toe brake แยกซ้ายขวา [LD6 p.7-13]"
    },
    "pressure_rise_rate": {
     "v": 2.5,
     "u": "1/s",
     "scope": "gear",
     "src": [
      "LD15"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: รอบที่ 1"
    },
    "antiskid": {
     "v": 0,
     "u": "bool",
     "scope": "gear",
     "src": [
      "LD6"
     ],
     "conf": "สูง",
     "est": false,
     "note": "ไม่มี antiskid"
    },
    "heat_sink_mass": {
     "v": 1.5,
     "u": "kg",
     "scope": "gear",
     "src": [
      "LD15"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณจานเบรกเครื่องเล็กต่อข้าง"
    },
    "heat_sink_cool_tau": {
     "v": 600,
     "u": "s",
     "scope": "gear",
     "src": [
      "LD15"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ"
    },
    "fade_start_temp": {
     "v": 400,
     "u": "degC",
     "scope": "gear",
     "src": [
      "LD15"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: รอบที่ 1"
    },
    "fade_full_temp": {
     "v": 700,
     "u": "degC",
     "scope": "gear",
     "src": [
      "LD15"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: รอบที่ 1"
    }
   },
   "steering": {
    "mode": {
     "v": {
      "type": "castering_diff_brake",
      "caster_with_diff_brake": true,
      "pedal_linked": false
     },
     "u": "-",
     "scope": "gear",
     "src": [
      "LD6",
      "LD1"
     ],
     "conf": "สูง",
     "est": false,
     "note": "ล้อหน้า free-castering ไม่มีก้านต่อแป้น เลี้ยวด้วยเบรกแยกข้าง (และ rudder เมื่อมีลม) [LD6 p.7-13]"
    },
    "pedal_max": {
     "v": 0,
     "u": "deg",
     "scope": "gear",
     "src": [
      "LD6"
     ],
     "conf": "สูง",
     "est": false,
     "note": "ไม่มีการเลี้ยวผ่านแป้น"
    },
    "caster_max": {
     "v": 360,
     "u": "deg",
     "scope": "gear",
     "src": [
      "LB19"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ไม่พบมุมจำกัดของล้อ castering; โมเดล FlightGear ใช้ 360° [LB19]; ล้อมี friction damper (ค่าประมาณ)"
    },
    "shimmy_lag": {
     "v": 0.05,
     "u": "s",
     "scope": "gear",
     "src": [
      "LD15"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: รอบที่ 1"
    }
   },
   "certification": {
    "part23_limit_descent": {
     "v": {
      "formula": "V = 4.4 (W/S)^0.25 fps, 7..10 fps",
      "da40ng_fps": 9.33
     },
     "u": "fps",
     "scope": "gear",
     "src": [
      "LD12"
     ],
     "conf": "สูง",
     "est": false,
     "note": "14 CFR 23.473(d) (ก่อน Amdt 23-64): W/S = 2,888 lb / 142.6 ft² = 20.25 psf → 9.33 fps"
    },
    "part23_wing_lift_ratio": {
     "v": 0.667,
     "u": "-",
     "scope": "gear",
     "src": [
      "LD12"
     ],
     "conf": "สูง",
     "est": false,
     "note": "23.473(e)"
    },
    "part23_min_load_factors": {
     "v": {
      "inertia": 2.67,
      "ground_reaction": 2
     },
     "u": "g",
     "scope": "gear",
     "src": [
      "LD12"
     ],
     "conf": "สูง",
     "est": false,
     "note": "23.473(g)"
    },
    "part23_reserve_drop_factor": {
     "v": 1.44,
     "u": "x drop height",
     "scope": "gear",
     "src": [
      "LD12"
     ],
     "conf": "สูง",
     "est": false,
     "note": "23.723(b)"
    }
   }
  }
 }
}
```

```json
{
 "da40ng": {
  "interference": {
   "downwash": {
    "deda": {
     "v": 0.287,
     "u": "-",
     "scope": "aircraft",
     "src": [
      "LM10"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: lm_derivs: หาง T สูงเหนือระนาบปีก h_H/b 0.116 ทำให้ dε/dα ต่ำ"
    },
    "eps0": {
     "v": 0,
     "u": "rad",
     "scope": "aircraft",
     "src": [
      "LD15"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ"
    },
    "l_t": {
     "v": 4.78,
     "u": "m",
     "scope": "aircraft",
     "src": [
      "LD2"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: ld_geom.mjs"
    },
    "VH": {
     "v": 0.721,
     "u": "-",
     "scope": "aircraft",
     "src": [
      "LD2"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: S_h l_t/(S c)"
    },
    "a_t": {
     "v": 4.11,
     "u": "1/rad",
     "scope": "aircraft",
     "src": [
      "LM10"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: lm_derivs (AR หาง ≈ 4.9)"
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
     "note": "ค่าประมาณ: หาง T พ้น wake ลำตัวและส่วนใหญ่พ้น slipstream"
    },
    "CLadot": {
     "v": 1.547,
     "u": "1/(rad·c/2V)",
     "scope": "aircraft",
     "src": [
      "LM10"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: lm_derivs"
    },
    "Cmadot": {
     "v": -6.384,
     "u": "1/(rad·c/2V)",
     "scope": "aircraft",
     "src": [
      "LM10"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: lm_derivs (−CLadot l_t/c)"
    }
   },
   "groundEffect": {
    "rMac": {
     "v": [
      -0.052,
      2.63,
      0.3
     ],
     "u": "m (FRD จาก CG, y ใช้ ±)",
     "scope": "aircraft",
     "src": [
      "LD2"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "c/4 ของ MAC: x จาก ld_geom, z ปีกต่ำอยู่ใต้ CG ≈ 0.30 m (ค่าประมาณ)"
    },
    "CLa_w": {
     "v": 4.99,
     "u": "1/rad",
     "scope": "aircraft",
     "src": [
      "LM10"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: ปีก+ลำตัว (lm_derivs)"
    },
    "A": {
     "v": 10.223,
     "u": "-",
     "scope": "aircraft",
     "src": [
      "LD2"
     ],
     "conf": "สูง",
     "est": false,
     "note": "AR ปีก [LD2 p.1-5]"
    },
    "rEps": {
     "v": {
      "a": 3.99,
      "m": 0.652
     },
     "u": "-",
     "scope": "aircraft",
     "src": [
      "LD15"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: ใช้สูตร fit VLM ของรอบที่ 1 (ไม่ขึ้นกับแบบมาก); ปีกต่ำของ DA40 อยู่ใกล้พื้น (h/b ≈ 0.05 ตอนแตะ) ground effect จึงแรง"
    }
   },
   "slipstream": {
    "diskDiameter": {
     "v": 1.9,
     "u": "m",
     "scope": "propeller",
     "src": [
      "LD1"
     ],
     "conf": "สูง",
     "est": false,
     "note": "MTV-6-R/190-69 [LD1 p.27]"
    },
    "hubRadius": {
     "v": 0.13,
     "u": "m",
     "scope": "propeller",
     "src": [
      "LD2"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณรัศมี spinner"
    },
    "hubPos": {
     "v": [
      2.22,
      0,
      0.05
     ],
     "u": "m (FRD จาก CG)",
     "scope": "aircraft",
     "src": [
      "LD2"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ"
    },
    "sense": {
     "v": 1,
     "u": "-",
     "scope": "propeller",
     "src": [
      "LD1",
      "LD9"
     ],
     "conf": "สูง",
     "est": false,
     "note": "clockwise มองจากด้านหลัง"
    },
    "kappa": {
     "v": 0.43,
     "u": "-",
     "scope": "aircraft",
     "src": [
      "LD15"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณจากรอบที่ 1 (TR 690)"
    },
    "immersionH": {
     "v": {
      "axes": {
       "rs_m": [
        0.3,
        0.5,
        0.7,
        0.8,
        0.9,
        1,
        1.1,
        1.22
       ]
      },
      "data": [
       0,
       0,
       0,
       0,
       0,
       0.05,
       0.15,
       0.3
      ]
     },
     "u": "-",
     "scope": "aircraft",
     "src": [
      "LD1"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: หาง T สูงกว่าแนวแรงขับราว 1.0 m จึงแทบไม่อยู่ใน slipstream (ผลกำลังต่อ trim ทางหางน้อยกว่าหางธรรมดา)"
    },
    "immersionV": {
     "v": {
      "axes": {
       "rs_m": [
        0.3,
        0.5,
        0.7,
        0.8,
        0.9,
        1,
        1.1,
        1.22
       ]
      },
      "data": [
       0,
       0.15,
       0.31,
       0.38,
       0.46,
       0.54,
       0.62,
       0.71
      ]
     },
     "u": "-",
     "scope": "aircraft",
     "src": [
      "LD2"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: ครีบเริ่มเหนือแนวแรงขับ ~0.3 m สูง 1.3 m สัดส่วนที่จมตามรัศมี slipstream"
    },
    "kSwirl": {
     "v": 0.5,
     "u": "-",
     "scope": "aircraft",
     "src": [
      "LD15"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: รอบที่ 1"
    },
    "zSwirl": {
     "v": 0.6,
     "u": "m",
     "scope": "aircraft",
     "src": [
      "LD2"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: ศูนย์กลางแรงของครีบเหนือแนวแรงขับ"
    },
    "finArea": {
     "v": 1.6,
     "u": "m2",
     "scope": "aircraft",
     "src": [
      "LD2"
     ],
     "conf": "สูง",
     "est": false,
     "note": "รวม rudder [LD2 p.1-6]"
    },
    "finArm": {
     "v": 4.38,
     "u": "m",
     "scope": "aircraft",
     "src": [
      "LD2"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: ld_geom.mjs"
    },
    "finLiftSlope": {
     "v": 2.22,
     "u": "1/rad",
     "scope": "aircraft",
     "src": [
      "LM10"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: lm_derivs (A_v,eff)"
    },
    "eta_v": {
     "v": 0.9,
     "u": "-",
     "scope": "aircraft",
     "src": [
      "LM10"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ"
    },
    "blownSpanFactor": {
     "v": 0.9,
     "u": "D",
     "scope": "aircraft",
     "src": [
      "LD15"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: TR 941 ตามรอบที่ 1"
    },
    "blownArea": {
     "v": 0.74,
     "u": "m2",
     "scope": "aircraft",
     "src": [
      "LD2"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: (0.9 D − ความกว้างลำตัว 1.18 m) × คอร์ดโคน 1.40 m"
    },
    "kBlown": {
     "v": 0.5,
     "u": "-",
     "scope": "aircraft",
     "src": [
      "LD15"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: รอบที่ 1"
    },
    "k_deda_power": {
     "v": 0,
     "u": "-",
     "scope": "aircraft",
     "src": [
      "LD15"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: 0 เพราะหาง T อยู่เหนือ slipstream เป็นส่วนใหญ่ (ไม่มีข้อมูลวัด)"
    }
   }
  }
 }
}
```

```json
{
 "da40ng": {
  "wind": {
   "fFactor": {
    "trainerExcessTW": {
     "v": 0.033,
     "u": "-",
     "scope": "aircraft",
     "src": [
      "LM0"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: ซิมวันนี้: (T_max − D)/W ที่ approach แฟลป LDG ≈ 0.03 ต่ำกว่าจริงเพราะ polar จากการร่อนรวมแรงต้านใบพัดหมุนฟรี (§05.9)"
    }
   },
   "wake": {
    "b0_over_b": {
     "v": 0.7854,
     "u": "-",
     "scope": "aircraft",
     "src": [
      "LD15"
     ],
     "conf": "สูง",
     "est": false,
     "note": "π/4 (นิยาม)"
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
      "LD15"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: รอบที่ 1"
    },
    "trainerRollControl": {
     "v": {
      "Clda": 0.174,
      "daMax_deg": 16.5,
      "ClMax": 0.0503
     },
     "u": "-",
     "scope": "aircraft",
     "src": [
      "LM10",
      "LD1"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "อำนาจม้วนสูงสุดของ DA40 สำหรับเทียบกับโมเมนต์ม้วนจาก wake (ค่าประมาณ)"
    }
   }
  }
 }
}
```

```json
{
 "da40ng": {
  "input": {
   "keyboard": {
    "interim_trim_rate_elevator": {
     "v": 0.5,
     "u": "deg/s",
     "scope": "aircraft",
     "src": [
      "LD15"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: รอบที่ 1"
    },
    "flap_notches": {
     "v": [
      0,
      0.693,
      1
     ],
     "u": "สัดส่วน AC.flaps",
     "scope": "aircraft",
     "src": [
      "LD1",
      "LM0"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: UP/T-O/LDG: f(T/O) = dCL0(T/O)/dCL0(LDG) = 0.52/0.75 (flapMap lift)"
    }
   }
  }
 }
}
```

```json
{
 "da40ng": {
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
      "R1:V10"
     ],
     "conf": "สูง",
     "est": false,
     "note": "เครื่องเบาเครื่องยนต์เดียว (MIL-F-8785C Class I)"
    }
   },
   "procedures": {
    "v50MinFactor_singleEngine": {
     "v": 1.2,
     "u": "× VS1",
     "scope": "aircraft",
     "src": [
      "LD12"
     ],
     "conf": "สูง",
     "est": false,
     "note": "14 CFR 23.53 เดิม; DA40 NG V50 72 KIAS ที่ 1,280 kg ≈ 1.2 × VS(T/O)"
    }
   },
   "takeoff_test": {
    "v": {
     "flap": "T/O",
     "VR_kt": 66.9,
     "theta_deg": 8
    },
    "u": "kt CAS, deg",
    "scope": "aircraft",
    "src": [
     "LD3"
    ],
    "conf": "กลาง",
    "est": true,
    "note": "VR 68 KIAS ที่ 1,310 kg (สเกลจาก 67 KIAS ที่ 1,280 kg [LD3]) → 66.9 KCAS ด้วยตาราง T/O; มุมเงย 8° ค่าประมาณ"
   },
   "trim_targets": {
    "cruise": {
     "v": {
      "ias_kt": 110,
      "h_ft": 3000,
      "gamma_deg": 0
     },
     "u": "kt CAS, ft",
     "scope": "aircraft",
     "src": [
      "LD1"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: สภาพ trim ของซิม (≈ 0.85 VNO) ไม่ใช่จุดจาก AFM"
    },
    "approach": {
     "v": {
      "ias_kt": 76,
      "h_m": 300,
      "gamma_deg": -3
     },
     "u": "kt CAS, m, deg",
     "scope": "aircraft",
     "src": [
      "LD3"
     ],
     "conf": "กลาง",
     "est": true,
     "note": "ค่าประมาณ: จุด trim/linearise ของซิมที่ MTOM 1,310 kg ใช้ speeds.approach_table แถว 1,280 kg (MLW, แถวสุดท้ายของตาราง) 77 KIAS แฟลป LDG → 76 KCAS ด้วย speeds.ias_cas (ld_iascas, ค่าประมาณ); VREF/VAPP ที่ training_mass 1,150 kg = 74 KIAS อยู่ใน speeds (D1)"
    }
   },
   "currentModel": {
    "performance": {
     "v": {
      "mass_kg": 1310,
      "VSR_kcas": {
       "UP": 66.3,
       "T/O": 61.4,
       "LDG": 59.5
      },
      "Vmin_keas": {
       "UP": 63.4,
       "T/O": 58.8,
       "LDG": 57.2
      },
      "Vy_kt": 79.6,
      "ROC_fpm": 666,
      "Vx_kt": 74,
      "glide": {
       "V_kt": 87.3,
       "LD": 9.7,
       "sink_fpm": 945
      },
      "takeoff_m": {
       "flap": "T/O",
       "ground": 397,
       "d50ft": 616,
       "V_LOF_kt": 72.8
      },
      "landing_m": {
       "asIs": 843,
       "maxBrake": 642,
       "ground_maxBrake": 311,
       "vtd_kt": 72
      },
      "trim": {
       "cruise_thr": 0.818,
       "approach_thr": 0.472,
       "approach_alpha_deg": -0.4
      }
     },
     "u": "kt, fpm, -, m",
     "scope": "aircraft",
     "src": [
      "LM0"
     ],
     "conf": "สูง",
     "est": false,
     "note": "ผล lm_card da40ng --mass 1310 กับซิม commit cabf0f0 (ตัวเลข regression ของซิมวันนี้ ไม่ใช่ค่าเครื่องจริง)"
    },
    "approach": {
     "v": {
      "sp": {
       "wn": 3.29,
       "zeta": 0.572,
       "T": 2.328
      },
      "ph": {
       "wn": 0.311,
       "zeta": 0.118,
       "T": 20.323
      },
      "dr": {
       "wn": 1.499,
       "zeta": 0.206,
       "T": 4.282
      },
      "roll_tau": 0.252,
      "spiral": {
       "lam": 0.011,
       "t2": 61.127,
       "grows": true
      },
      "nAlpha": 5.261,
      "CAP": 2.057
     },
     "u": "rad/s, -, s",
     "scope": "aircraft",
     "src": [
      "LM0"
     ],
     "conf": "สูง",
     "est": false,
     "note": "โหมดเชิงเส้นของซิมวันนี้ที่ approach 76 KCAS แฟลป LDG γ −3° (1,310 kg)"
    },
    "cruise": {
     "v": {
      "sp": {
       "wn": 4.729,
       "zeta": 0.555,
       "T": 1.597
      },
      "ph": {
       "wn": 0.209,
       "zeta": 0.116,
       "T": 30.268
      },
      "dr": {
       "wn": 2.128,
       "zeta": 0.211,
       "T": 3.021
      },
      "roll_tau": 0.181,
      "spiral": {
       "lam": 0.022,
       "t2": 32.032,
       "grows": true
      },
      "nAlpha": 11.02,
      "CAP": 2.029
     },
     "u": "rad/s, -, s",
     "scope": "aircraft",
     "src": [
      "LM0"
     ],
     "conf": "สูง",
     "est": false,
     "note": "โหมดเชิงเส้นของซิมวันนี้ที่ 110 KCAS 3,000 ft (1,310 kg)"
    }
   }
  }
 }
}
```

```json
{
 "da40ng": {
  "_na": {
   "v": [
    "turbofan.*",
    "turboprop.*",
    "aero.static_long.table_clean",
    "interference.groundEffect.tablesCheck",
    "propeller.tables.CNmu",
    "propeller.tables.CMmu",
    "propeller.governor.betaFeather",
    "propeller.governor.featherRate",
    "propeller.betaReverse.*",
    "propeller.feathered.*",
    "propeller.engineInterface.flightIdleShaftPower",
    "controls.reference_types.*",
    "gear.strut_main.p_static",
    "gear.strut_main.piston_area",
    "gear.strut_main.ratio_static_to_extended",
    "gear.strut_main.ratio_compressed_to_extended",
    "gear.strut_main.polytropic_n_dynamic",
    "gear.strut_main.polytropic_n_static",
    "gear.strut_main.Kh_compression",
    "gear.strut_main.Kr_rebound",
    "gear.strut_main.c_linear",
    "gear.strut_main.seal_friction_ratio",
    "gear.strut_nose.p_static",
    "gear.strut_nose.piston_area",
    "gear.strut_nose.ratio_static_to_extended",
    "gear.strut_nose.ratio_compressed_to_extended",
    "gear.strut_nose.Kh_compression",
    "gear.strut_nose.Kr_rebound",
    "gear.strut_nose.c_linear",
    "gear.brakes.antiskid_efficiency",
    "gear.brakes.antiskid_efficiency_measured",
    "gear.brakes.antiskid_slip_setpoint",
    "gear.steering.steer_rate",
    "gear.certification.part25_limit_descent",
    "gear.certification.part25_friction_cap",
    "wind.discreteGust.cfr25_341_Fg",
    "wind.wake.leaders",
    "numerics.contact.*",
    "validation.typicalModes.*",
    "validation.currentModel.approach95",
    "validation.currentModel.cruise155",
    "otherSims.*",
    "performance.ROC_table",
    "performance.takeoff_table",
    "performance.landing_table"
   ],
   "u": "-",
   "scope": "aircraft",
   "src": [
    "LD1"
   ],
   "conf": "สูง",
   "est": false,
   "note": "turbofan.*: เครื่องลูกสูบดีเซล · turboprop.*: ไม่ใช่เทอร์โบพร็อป · aero.static_long.table_clean: ตารางตัวอย่างรูปแบบ คำนวณได้จากพารามิเตอร์ข้างบนด้วยสคริปต์รอบที่ 1 · interference.groundEffect.tablesCheck: แถวตรวจของรอบที่ 1 คำนวณจาก rEps ได้ ไม่ขึ้นกับแบบ · propeller.tables.CNmu: ยังไม่ได้คำนวณ BEM แยกมุมแอสไซเมทรี (P-factor) ของใบพัดนี้ งาน P2 · propeller.tables.CMmu: เหมือน CNmu · propeller.governor.betaFeather: MTV-6-R/190-69 ไม่มี feather · propeller.governor.featherRate: ไม่มี feather · propeller.betaReverse.*: ไม่มี reverse · propeller.feathered.*: ไม่มี feather (เครื่องยนต์เดียว) · propeller.engineInterface.flightIdleShaftPower: นิยามของเทอร์โบพร็อป; ลูกสูบ/ดีเซลใช้ piston.* · controls.reference_types.*: ค่าอ้างอิงของเครื่องโดยสาร (737, ATR) ไม่ใช่ของ DA40 · gear.strut_main.p_static: ขาสปริงเหล็ก ไม่ใช่ oleo · gear.strut_main.piston_area: ไม่ใช่ oleo · gear.strut_main.ratio_static_to_extended: ไม่ใช่ oleo · gear.strut_main.ratio_compressed_to_extended: ไม่ใช่ oleo · gear.strut_main.polytropic_n_dynamic: ไม่ใช่ oleo · gear.strut_main.polytropic_n_static: ไม่ใช่ oleo · gear.strut_main.Kh_compression: ไม่ใช่ oleo · gear.strut_main.Kr_rebound: ไม่ใช่ oleo · gear.strut_main.c_linear: ใช้ spring.damping_ratio แทน · gear.strut_main.seal_friction_ratio: ไม่ใช่ oleo · gear.strut_nose.p_static: ล้อหน้า elastomer · gear.strut_nose.piston_area: elastomer · gear.strut_nose.ratio_static_to_extended: elastomer · gear.strut_nose.ratio_compressed_to_extended: elastomer · gear.strut_nose.Kh_compression: elastomer · gear.strut_nose.Kr_rebound: elastomer · gear.strut_nose.c_linear: ใช้ spring.damping_ratio แทน · gear.brakes.antiskid_efficiency: ไม่มี antiskid · gear.brakes.antiskid_efficiency_measured: ไม่มี antiskid · gear.brakes.antiskid_slip_setpoint: ไม่มี antiskid · gear.steering.steer_rate: ล้อหน้า castering ไม่มีตัวขับเลี้ยว · gear.certification.part25_limit_descent: CS/Part 23 ไม่ใช่ Part 25 · gear.certification.part25_friction_cap: Part 25 · wind.discreteGust.cfr25_341_Fg: สูตร gust ของ Part 25 · wind.wake.leaders: รายการเครื่องนำ (A320, 737 …) ใช้ร่วมจากรอบที่ 1 ไม่ใช่ค่าของ DA40 · numerics.contact.*: ค่าตัวเลขของโมเดลสัมผัสพื้นในซิม ไม่ขึ้นกับแบบ ใช้ค่ารอบที่ 1 · validation.typicalModes.*: โหมดอ้างอิงของแบบอื่น (c172x, 737, 747, GA ทั่วไป) ไม่ใช่ของ DA40 · validation.currentModel.approach95: ชื่อผูกกับสภาพของเครื่องฝึกรอบที่ 1; ผลของ DA40 อยู่ที่ validation.currentModel.approach · validation.currentModel.cruise155: เหมือนกัน; ดู validation.currentModel.cruise · otherSims.*: หัวข้อ 03 (LB) เป็นเจ้าของ path otherSims · performance.ROC_table: AFM บท 5 ให้อัตราไต่ตามความสูง/อุณหภูมิเป็นแผนภูมิ (nomogram) ซึ่งเป็นภาพในฉบับ IO-360 ที่เปิดอ่านได้ [LD6 viewer 180–191] และสำเนา AFM NG [LD2] มีเฉพาะบท 1–3; จุด SL 30–35 °C จึงไม่มีจากเอกสาร (วันร้อนเป็นค่าประมาณใน T-LD-15/T-LD-33) · performance.takeoff_table: เหตุผลเดียวกับ performance.ROC_table: แผนภูมิระยะวิ่งขึ้นของ AFM บท 5 อ่านค่าไม่ได้; ใช้ performance.takeoff ที่ SL ISA และสเกล σ สำหรับ 35 °C (T-LD-15, T-LD-33 ค่าประมาณ) · performance.landing_table: เหตุผลเดียวกับ performance.ROC_table: แผนภูมิระยะลงจอดของ AFM บท 5 อ่านค่าไม่ได้; ใช้ performance.landing ที่ SL ISA"
  }
 }
}
```

#### da40_180

```json
{
 "da40_180": {
  "airframe": {
   "identity": {
    "v": {
     "manufacturer": "Diamond Aircraft Industries (TC holder: Diamond Aircraft Industries Inc., Canada)",
     "model": "DA 40",
     "variant": "DA 40 (CS) / DA 40 XLS / XLT, MÄM 40-227 (MTOM 1200 kg)",
     "engine": "Textron Lycoming IO-360-M1A, 4 สูบนอน หัวฉีด",
     "propeller": "MT-Propeller MTV-12-B/180-17, 3 ใบ constant speed",
     "seats": 4,
     "category": "normal (utility ≤ 980 kg)",
     "tc_ref": "EASA TCDS EASA.IM.A.022 Issue 24 (Section A)"
    },
    "u": "-",
    "scope": "aircraft",
    "src": [
     "LD1",
     "LD5"
    ],
    "conf": "สูง",
    "est": false,
    "note": "โรงเรียนการบินพลเรือนไทยมี DA 40 CS 7 ลำ [LS1][LS18]; ถ้าไม่ได้ทำ MÄM 40-227 ใช้ MTOM 1,150 kg, VA 108 KIAS และ elevator 23/15°"
   },
   "weights": {
    "MTOW": {
     "v": 1200,
     "u": "kg",
     "scope": "aircraft",
     "src": [
      "LD1",
      "LD5"
     ],
     "conf": "สูง",
     "est": false,
     "note": "2,646 lb กับ MÄM 40-227; มาตรฐาน 1,150 kg (2,535 lb); utility 980 kg [LD1 p.6]"
    },
    "MLW": {
     "v": 1150,
     "u": "kg",
     "scope": "aircraft",
     "src": [
      "LD1"
     ],
     "conf": "กลาง",
     "est": false,
     "note": "MLM 1,092 หรือ 1,150 kg ตามรุ่นย่อยใน TCDS [LD1 p.6]"
    },
    "MRW": {
     "v": 1200,
     "u": "kg",
     "scope": "aircraft",
     "src": [
      "LD1"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: ไม่พบ ramp mass แยกใน TCDS Section A จึงใช้ = MTOM"
    },
    "MZFW": {
     "v": 1200,
     "u": "kg",
     "scope": "aircraft",
     "src": [
      "LD1"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: ไม่พบขีดจำกัด MZFM ใน TCDS Section A จึงใช้ = MTOM"
    },
    "min_flight_mass": {
     "v": 850,
     "u": "kg",
     "scope": "aircraft",
     "src": [
      "LD6"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: มวลต่ำสุดในตารางความเร็ว/สมรรถนะของ AFM [LD6 §3, §5]"
    },
    "BEW_typical": {
     "v": 792,
     "u": "kg",
     "scope": "aircraft",
     "src": [
      "LD4"
     ],
     "conf": "กลาง",
     "est": false,
     "note": "น้ำหนักเปล่ารุ่น XLT ไม่รวมอุปกรณ์เสริม [LD4]; เครื่อง CS รุ่นเก่ามักหนักกว่า"
    },
    "max_fuel_usable": {
     "v": 109.6,
     "u": "kg",
     "scope": "aircraft",
     "src": [
      "LD1"
     ],
     "conf": "สูง",
     "est": false,
     "note": "152.2 l (40.2 USgal) AVGAS × 0.72 kg/l; ถังพิสัยไกล 189.2 l = 136 kg [LD1 p.5]"
    },
    "useful_load": {
     "v": 408,
     "u": "kg",
     "scope": "aircraft",
     "src": [
      "LD4"
     ],
     "conf": "กลาง",
     "est": false,
     "note": "MTOM − น้ำหนักเปล่า XLT [LD4]"
    },
    "training_mass": {
     "v": {
      "kg": 1050,
      "empty_kg": 792,
      "crew_kg": 170,
      "fuel_kg": 88,
      "fuel_l": 122
     },
     "u": "kg",
     "scope": "aircraft",
     "src": [
      "LD4",
      "LD1"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ (D3): empty_kg = BEW_typical 792 kg (XLT ไม่มีอุปกรณ์เสริม [LD4]) + ครูฝึกและศิษย์ 2 × 85 kg + AVGAS 122 l (88 kg ที่ 0.72 kg/l, ราว 80 % ของถัง 152.2 l [LD1 p.5]) = 1,050 kg (2,315 lb); ฉบับก่อน 19 พ.ย. 2026 ใช้เปล่า 825 kg + 75 l ได้มวลรวมเท่ากัน (เครื่อง CS ที่ติดอุปกรณ์จริงอาจหนักกว่า BEW_typical จึงเหลือเชื้อเพลิงน้อยกว่านี้)"
    }
   },
   "cg": {
    "LEMAC": {
     "v": 2.236,
     "u": "m DAT",
     "scope": "aircraft",
     "src": [
      "LD6"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ ld_geom.mjs จาก MAC 1.121 m และขอบหน้าปีก; ไม่มีค่าใน AFM"
    },
    "MAC": {
     "v": 1.121,
     "u": "m",
     "scope": "aircraft",
     "src": [
      "LD6"
     ],
     "conf": "สูง",
     "est": false,
     "note": "[LD6 p.1-6]"
    },
    "envelope": {
     "v": [
      [
       850,
       2.4,
       2.59
      ],
      [
       980,
       2.4,
       2.59
      ],
      [
       1200,
       2.48,
       2.59
      ]
     ],
     "u": "[kg, m DAT fwd, m DAT aft]",
     "scope": "aircraft",
     "src": [
      "LD1"
     ],
     "conf": "สูง",
     "est": false,
     "note": "หน้า 2.40 m ถึง 980 kg แล้วเชิงเส้นถึง 2.48 m ที่ 1,200 kg; หลัง 2.59 m (2.55 m เมื่อมีถังพิสัยไกล) [LD1 p.6]; จุด 850 kg เพื่อให้ครอบมวลต่ำสุดที่ประมาณ"
    },
    "ref": {
     "v": {
      "m_DAT": 2.47,
      "pct_mac": 20.9
     },
     "u": "m DAT",
     "scope": "aircraft",
     "src": [
      "LD1"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: ใช้ CG อ้างอิงเดียวกับ NG (2.47 m DAT) เพื่อให้ตำแหน่งล้อและเครื่องยนต์ใน FRD ใช้ร่วมกันได้"
    }
   },
   "wing": {
    "S": {
     "v": 13.54,
     "u": "m2",
     "scope": "aircraft",
     "src": [
      "LD6"
     ],
     "conf": "สูง",
     "est": false,
     "note": "13.54 m² (145.7 sq ft) [LD6 p.1-6]; ค่าใน AFM รุ่นเดิมต่างจาก NG (13.244) — ดู §05.12"
    },
    "b": {
     "v": 11.94,
     "u": "m",
     "scope": "aircraft",
     "src": [
      "LD6"
     ],
     "conf": "สูง",
     "est": false,
     "note": "รวม winglet ≈ 11.94 m (39 ft 2 in) [LD6 p.1-6]"
    },
    "MAC": {
     "v": 1.121,
     "u": "m",
     "scope": "aircraft",
     "src": [
      "LD6"
     ],
     "conf": "สูง",
     "est": false,
     "note": "[LD6 p.1-6]"
    },
    "AR": {
     "v": 10.53,
     "u": "-",
     "scope": "aircraft",
     "src": [
      "LD6"
     ],
     "conf": "สูง",
     "est": false,
     "note": "[LD6 p.1-6]"
    }
   },
   "geometry": {
    "length": {
     "v": 8.01,
     "u": "m",
     "scope": "aircraft",
     "src": [
      "LD6"
     ],
     "conf": "สูง",
     "est": false,
     "note": "26 ft 3 in [LD6 p.1-6]"
    },
    "span": {
     "v": 11.94,
     "u": "m",
     "scope": "aircraft",
     "src": [
      "LD6"
     ],
     "conf": "สูง",
     "est": false,
     "note": "[LD6 p.1-6]"
    }
   },
   "inertia": {
    "Ixx": {
     "v": 2472,
     "u": "kg m2",
     "scope": "aircraft",
     "src": [
      "LM15",
      "LM8"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ Roskam radii single_prop × มวลฝึก 1050 kg, b 11.94 m, L 8.01 m (lm_inertia, ±30 %)"
    },
    "Iyy": {
     "v": 2146,
     "u": "kg m2",
     "scope": "aircraft",
     "src": [
      "LM15",
      "LM8"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: เช่นเดียวกับ Ixx"
    },
    "Izz": {
     "v": 4263,
     "u": "kg m2",
     "scope": "aircraft",
     "src": [
      "LM15",
      "LM8"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: เช่นเดียวกับ Ixx"
    },
    "ref_mass": {
     "v": 1050,
     "u": "kg",
     "scope": "aircraft",
     "src": [
      "LD6"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "มวลฝึก (ค่าประมาณ) ที่ CG อ้างอิง 2.47 m DAT"
    }
   }
  }
 }
}
```

```json
{
 "da40_180": {
  "speeds": {
   "VS0_kt": {
    "v": 52,
    "u": "kt IAS",
    "scope": "aircraft",
    "src": [
     "LD6",
     "LD4"
    ],
    "conf": "กลาง",
    "est": false,
    "note": "แฟลป LDG 1,200 kg ปีกระดับ [LD6 p.5-8]; โบรชัวร์ XLT \"stall landing 52 KIAS\" [LD4]; 49 KIAS ที่ 1,150 kg"
   },
   "VS1_kt": {
    "v": 53,
    "u": "kt IAS",
    "scope": "aircraft",
    "src": [
     "LD6"
    ],
    "conf": "กลาง",
    "est": false,
    "note": "แฟลป UP 1,200 kg [LD6 p.5-8]; 52 KIAS ที่ 1,150 kg, 47 KIAS ที่ 980 kg"
   },
   "VY_kt": {
    "v": 67,
    "u": "kt IAS",
    "scope": "aircraft",
    "src": [
     "LD6"
    ],
    "conf": "ต่ำ",
    "est": false,
    "note": "ความเร็วไต่หลังวิ่งขึ้น แฟลป T/O กำลังเต็ม 1,200 kg [LD6 p.5-13] (เทียบ Vy แฟลป T/O ของ NG); ไต่แบบ cruise climb แฟลป UP 76 KIAS [LD6 p.5-15]"
   },
   "VR_kt": {
    "v": 59,
    "u": "kt IAS",
    "scope": "aircraft",
    "src": [
     "LD6"
    ],
    "conf": "กลาง",
    "est": false,
    "note": "ความเร็วยกล้อโดยประมาณตามขั้นตอนวิ่งขึ้น แฟลป T/O [LD6 p.5-10]"
   },
   "VAPP_kt": {
    "v": 65,
    "u": "kt IAS",
    "scope": "aircraft",
    "src": [
     "LD6"
    ],
    "conf": "กลาง",
    "est": false,
    "note": "D1: ที่ training_mass 1,050 kg แฟลป LDG ลมสงบ = speeds.approach_table อ่านเชิงเส้นระหว่าง 63 KIAS (1,000 kg) กับ 67 KIAS (1,092 kg) ได้ 65.2 KIAS [LD6 p.4A-34]; ≈ 66 KCAS (34 m/s) ด้วยตาราง ias_cas รุ่นเดิม; เท่ากับ VREF (AFM ให้ความเร็ว approach ค่าเดียว และให้นักบินเพิ่มเองเมื่อลมแรง/กระโชก); ที่ MTOM 1,200 kg = 73 KIAS"
   },
   "VREF_kt": {
    "v": 65,
    "u": "kt IAS",
    "scope": "aircraft",
    "src": [
     "LD6",
     "LD8"
    ],
    "conf": "กลาง",
    "est": false,
    "note": "D1: ที่ training_mass 1,050 kg แฟลป LDG วิธีเดียวกับ VAPP_kt; handout DA 40 D เรียกความเร็วนี้ว่า VREF (71 KIAS ที่ 1,150 kg ตรงกับ AFM) [LD8 p.24]; แฟลป UP หรือ T/O (แฟลปเสีย) AFM ให้ 68/73/76 KIAS ที่ 1,000/1,150/1,200 kg [LD6 p.4B-9]"
   },
   "approach_table": {
    "v": {
     "axes": {
      "mass_kg": [
       850,
       1000,
       1092,
       1150,
       1200
      ],
      "flap": [
       "LDG"
      ]
     },
     "data": [
      [
       58,
       63,
       67,
       71,
       73
      ]
     ]
    },
    "u": "kt IAS",
    "scope": "aircraft",
    "src": [
     "LD6"
    ],
    "conf": "สูง",
    "est": false,
    "note": "ความเร็ว approach แฟลป LDG ตามมวลจาก AFM 4A.3.12 [LD6 p.4A-34 (viewer 150)]; แถว 1,200 kg ใช้เมื่อทำ MÄM 40-227; ตรงกับความเร็วลงจอดฉุกเฉินแฟลป LDG [LD6 p.3-4]; ใช้ตั้ง VREF ของซิมที่มวลอื่นนอก training_mass (scripts/ld_tools.mjs card)"
   },
   "VX_kt": {
    "v": 67,
    "u": "kt IAS",
    "scope": "aircraft",
    "src": [
     "LD17",
     "LC1",
     "LF1",
     "LE2",
     "LM0",
     "LD6"
    ],
    "conf": "ต่ำ",
    "est": true,
    "note": "ค่าประมาณ (scripts/ld_vx.mjs, gap 7): แฟลป UP ที่ MTOM 1200 kg = k·VS1 ใน CAS = 1.19 × 56.7 = 67.5 KCAS (34.7 m/s); ที่ training_mass 1050 kg = 61 KIAS (63.1 KCAS); k = ค่าเฉลี่ย Vx/VS1 (CAS) ของ POH c172s 1.200, c172r 1.192, c152 1.177 (บัตร 04/10/11); AFM ไม่ให้ Vx (14 CFR 23.1585/23.1587 ไม่บังคับ [LD17]) ส่วนความเร็วไต่หลังวิ่งขึ้นแฟลป T/O ของ AFM 67 KIAS = 68.3 KCAS ตรงกับ k·VS(T/O) = 66.9 KCAS จึงทำหน้าที่ Vx ของโครงแบบวิ่งขึ้น; polar ของบัตร + ตาราง CT/CP ให้มุมไต่สูงสุดที่ 52.2 KCAS ซึ่งต่ำกว่า 1.1 VS1 (มุมไต่ยังเพิ่มจนใกล้ stall) จึงใช้ตัดสิน Vx เองไม่ได้; ซิมวันนี้ได้ 60 KCAS (T-LD-38…40)"
   },
   "stall_altitude_loss_ft": {
    "v": 180,
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
    "note": "ค่าประมาณ (scripts/ld_vx.mjs, gap 18): AFM ที่เปิดอ่านได้ไม่ระบุความสูงที่เสียในการแก้ stall; ใช้ค่าคลาส Δh = c·VS1² (KCAS) โดย c เฉลี่ย 0.0646 จาก POH/AFM C172S 230 ft, C152 160 ft, P2006T 180 ft (บัตร 04/11/12) × VS1 53.1 KCAS ที่ training_mass 1050 kg = 180 ft (55 m), ช่วง 120–230 ft ตาม c ต่ำสุด/สูงสุด; การแก้ stall ปกติ ปีกระดับ idle (เกณฑ์ของ evaluator)"
   },
   "VG_kt": {
    "v": 76,
    "u": "kt IAS",
    "scope": "aircraft",
    "src": [
     "LD6"
    ],
    "conf": "สูง",
    "est": false,
    "note": "best glide แฟลป UP ใบพัดหมุนฟรี 1,200 kg; 73/68/60 KIAS ที่ 1,150/1,000/850 kg [LD6 p.3-28]"
   },
   "VA_kt": {
    "v": {
     "1036": 94,
     "1200": 111
    },
    "u": "kt IAS",
    "scope": "aircraft",
    "src": [
     "LD1",
     "LD6"
    ],
    "conf": "สูง",
    "est": false,
    "note": "MÄM 40-227: 94 KIAS ถึง 1,036 kg, 111 KIAS เหนือกว่านั้น; มาตรฐาน 94 (≤ 980 kg) / 108 KIAS [LD1 p.6][LD6 p.2-3]"
   },
   "stall_table": {
    "v": {
     "axes": {
      "mass_kg": [
       980,
       1150,
       1200
      ],
      "flap": [
       "UP",
       "T/O",
       "LDG"
      ]
     },
     "data": [
      [
       47,
       52,
       53
      ],
      [
       44,
       51,
       52
      ],
      [
       42,
       49,
       52
      ]
     ],
     "bank_deg": 0
    },
    "u": "kt IAS",
    "scope": "aircraft",
    "src": [
     "LD6",
     "LD8"
    ],
    "conf": "กลาง",
    "est": false,
    "note": "ปีกระดับ idle [LD6 p.5-8] (DA 40 D ใช้ค่าเดียวกัน [LD8])"
   },
   "VNO_kt": {
    "v": 129,
    "u": "kt IAS",
    "scope": "aircraft",
    "src": [
     "LD1"
    ],
    "conf": "สูง",
    "est": false,
    "note": "[LD1 p.6, p.13–14]"
   },
   "VNE_kt": {
    "v": 178,
    "u": "kt IAS",
    "scope": "aircraft",
    "src": [
     "LD1"
    ],
    "conf": "สูง",
    "est": false,
    "note": "[LD1 p.6, p.13–14]"
   },
   "VFE": {
    "v": {
     "T/O": 108,
     "LDG": 91
    },
    "u": "kt IAS",
    "scope": "aircraft",
    "src": [
     "LD1",
     "LD6"
    ],
    "conf": "สูง",
    "est": false,
    "note": "[LD1 p.6][LD6 p.2-3]"
   },
   "ias_cas": {
    "v": {
     "UP": [
      [
       52,
       55.9
      ],
      [
       57,
       60
      ],
      [
       66,
       66.4
      ],
      [
       79,
       79
      ],
      [
       178,
       178
      ]
     ],
     "T/O": [
      [
       51,
       55.2
      ],
      [
       55,
       59.3
      ],
      [
       64,
       65.6
      ],
      [
       78,
       78
      ],
      [
       108,
       108
      ]
     ],
     "LDG": [
      [
       49,
       53.7
      ],
      [
       55,
       57.7
      ],
      [
       62,
       63.9
      ],
      [
       76,
       76
      ],
      [
       91,
       91
      ]
     ]
    },
    "u": "kt IAS -> kt CAS",
    "scope": "aircraft",
    "src": [
     "LD6",
     "LD8"
    ],
    "conf": "ต่ำ",
    "est": true,
    "note": "ค่าประมาณ (ld_iascas.mjs): KCAS(0°) = KIAS(60°)/√2 จากตาราง stall ตามมุมเอียงที่ 1,150 kg [LD6 p.5-8] (อ่านค่ามุมเอียงได้ไม่ชัด) → ช่วงใกล้ stall IAS อ่านต่ำกว่า CAS 4–5 kt; ตรวจกับ VREF/1.3 ได้ใกล้เคียง; เหนือ 76–79 KIAS ถือว่า IAS = CAS"
   },
   "crosswind_demonstrated_kt": {
    "v": 20,
    "u": "kt",
    "scope": "aircraft",
    "src": [
     "LD4"
    ],
    "conf": "กลาง",
    "est": false,
    "note": "DA40 XLT (IO-360) 20 kt [LD4]"
   }
  }
 }
}
```

```json
{
 "da40_180": {
  "performance": {
   "ROC_SL_fpm": {
    "v": 780,
    "u": "fpm",
    "scope": "aircraft",
    "src": [
     "LD4"
    ],
    "conf": "กลาง",
    "est": false,
    "note": "XLT MTOM 1,200 kg ISA MSL [LD4] (ไม่ระบุแฟลป); หน้าเว็บระบุว่า XLT มาตรฐานใช้ใบพัด Hartzell 2 ใบโลหะ (MT 3 ใบเป็นตัวเลือก) ขณะที่บัตรใช้ MTV-12-B/180-17 ตาม TCDS EASA (§05.12)"
   },
   "cruise_table": {
    "v": [
     {
      "h_ft": 0,
      "load_pct": 100,
      "ktas": 142
     },
     {
      "h_ft": 6000,
      "load_pct": 75,
      "ktas": 137
     }
    ],
    "u": "ft, %, kt TAS",
    "scope": "aircraft",
    "src": [
     "LD4"
    ],
    "conf": "กลาง",
    "est": false,
    "note": "max cruise MSL กำลังต่อเนื่องสูงสุด 142 KTAS; 75 % ที่ 6,000 ft 137 KTAS [LD4]"
   },
   "glide": {
    "v": {
     "speed_kt": 76,
     "ratio": 8.8
    },
    "u": "kt IAS, -",
    "scope": "aircraft",
    "src": [
     "LD6"
    ],
    "conf": "กลาง",
    "est": false,
    "note": "แฟลป UP ใบพัดหมุนฟรี 8.8 (1.45 NM/1,000 ft); ใบพัดหยุด 10.3 [LD6 p.3-28]"
   },
   "takeoff": {
    "v": {
     "ground_roll_m": 305,
     "over50ft_m": 450
    },
    "u": "m",
    "scope": "aircraft",
    "src": [
     "LD4"
    ],
    "conf": "กลาง",
    "est": false,
    "note": "XLT MTOM ISA MSL [LD4] (หน้าเว็บเขียนว่า take-off obstacle ไม่ระบุความสูง ถือเป็น 50 ft ตามบท 5 ของ AFM); แฟลป T/O; XLT ใบพัด Hartzell 2 ใบเป็นมาตรฐาน"
   },
   "landing": {
    "v": {
     "ground_roll_m": 290,
     "over50ft_m": 620
    },
    "u": "m",
    "scope": "aircraft",
    "src": [
     "LD4",
     "LD6"
    ],
    "conf": "กลาง",
    "est": false,
    "note": "XLT MTOM ISA MSL แฟลป LDG [LD4]; แฟลป UP 471/775 m ที่ 1,150 kg [LD6 p.5-21]"
   },
   "fuel": {
    "v": {
     "fuel": "AVGAS 100LL",
     "usable_l": {
      "standard": 152.2,
      "long_range": 189.2
     },
     "ff_lph_65pct": 31
    },
    "u": "l, l/h",
    "scope": "aircraft",
    "src": [
     "LD1",
     "LD4"
    ],
    "conf": "สูง",
    "est": false,
    "note": "[LD1 p.5][LD4]"
   },
   "tests": {
    "v": [
     {
      "case": "T-LD-27",
      "conditions": "ซิม: da40_180 1,200 kg, 3,000 ft ISA, idle, ลด 1 kt/s",
      "quantity": "Vmin UP / LDG",
      "expected": "56.7 / 55.7",
      "tolerance": "±5 / ±3",
      "unit": "KCAS",
      "origin": "[LD6 p.5-8][LD4] แปลงด้วยตารางรุ่นเดิม; UP ±5 kt = Part 60 ±3 kt + ±2 kt ความไม่แน่นอนของ IAS–CAS (ตาราง IAS–CAS ของ AFM รุ่นเดิมอ่านไม่ได้, gap 12)",
      "current_model": "55.9 / 55",
      "pass": true
     },
     {
      "case": "T-LD-28",
      "conditions": "ซิม: da40_180 1,200 kg SL ISA คันเร่งสุด / ร่อนแรงขับศูนย์",
      "quantity": "ROC สูงสุด / L/D ร่อน",
      "expected": "780 / 8.8",
      "tolerance": "±100 fpm / ±0.5",
      "unit": "fpm / -",
      "origin": "[LD4][LD6 p.3-28]",
      "current_model": "799 / 8.8",
      "pass": true
     },
     {
      "case": "T-LD-29",
      "conditions": "ซิม: da40_180 1,200 kg SL ISA แฟลป T/O VR ≈ 62 KCAS θ 8°",
      "quantity": "ground roll / ระยะถึง 50 ft",
      "expected": "305 / 450",
      "tolerance": "±15 m (5 %) / ±45 m (10 %)",
      "unit": "m",
      "origin": "[LD4] (XLT)",
      "current_model": "310 / 510",
      "pass": false
     },
     {
      "case": "T-LD-30",
      "conditions": "da40_180 1,200 kg SL ISA คันเร่งสุด บินระดับ (quasi-steady แบบแรงของซิม)",
      "quantity": "ความเร็วสูงสุด",
      "expected": 142,
      "tolerance": "±3 kt",
      "unit": "KTAS",
      "origin": "[LD4] max cruise MSL",
      "current_model": 113.9,
      "pass": false
     },
     {
      "case": "T-LD-37",
      "conditions": "บัตรที่ merge แล้วของ da40ng, da40_180, da40d (รุ่นย่อยรับค่าจาก NG ผ่าน _inherits)",
      "quantity": "propeller.identity.diameter = interference.slipstream.diskDiameter; controls.surfaces.* travel = controls.pitch/yaw.stops",
      "expected": "เท่ากันทุก id",
      "tolerance": "ตรงทุกค่า",
      "unit": "-",
      "origin": "[LD1 p.5, 7, 13–14, 27, 29]",
      "current_model": "da40ng: D 1.9/1.9 m, elev 21/17 vs 21/17, rud 24/26 vs 24/26; da40_180: D 1.8/1.8 m, elev 18/16 vs 18/16, rud 29/31 vs 29/31; da40d: D 1.87/1.87 m, elev 23/15 vs 23/15, rud 29/31 vs 29/31",
      "pass": true
     },
     {
      "case": "T-LD-39",
      "conditions": "ซิม: da40_180 1,200 kg (MTOM), SL ISA, คันเร่งสุด, แฟลป UP, กวาด IAS ทีละ 0.25 kt จาก 1.03 VS1 (ld_vx.mjs)",
      "quantity": "Vx (ความเร็วที่มุมไต่สูงสุด)",
      "expected": 67.5,
      "tolerance": 4,
      "unit": "KCAS",
      "origin": "ค่าประมาณ: k·VS1 = 1.19 × 56.7 KCAS (= 67 KIAS); k เฉลี่ยจาก POH C172S/C172R/C152 [LC1][LE2][LF1]; AFM ไม่ให้ Vx [LD17]; ความเร็วไต่แฟลป T/O ของ AFM 67 KIAS = 68.3 KCAS เทียบ k·VS(T/O) 66.9 KCAS; ±4 kt = ช่วง k (±1 kt) + ความไม่แน่นอนของ VS1 (gap 12)",
      "current_model": "60 (γmax 6.95°)",
      "pass": false
     },
     {
      "case": "T-LD-41",
      "conditions": "stall ปีกระดับ idle ลด 1 kt/s แฟลป UP ที่ training_mass (NG 1,150 / 180 1,050 / D 1,060 kg) แล้วแก้ตามวิธีมาตรฐาน: ลดมุมปะทะ คันเร่งเต็ม ปีกระดับ ดึงกลับสู่การไต่",
      "quantity": "ความสูงที่เสียจากเริ่ม stall ถึงอัตราจมเป็นศูนย์ (da40ng / da40_180 / da40d)",
      "expected": "240 / 180 / 190",
      "tolerance": "±35 % (ช่วง c ของคลาส)",
      "unit": "ft",
      "origin": "ค่าประมาณ Δh = c·VS1² (KCAS), c เฉลี่ย 0.0646 จาก C172S 230 ft [LC2], C152 160 ft [LF1], P2006T 180 ft [LG5] (ช่วง 0.0426–0.0819); AFM ที่อ่านได้ไม่ระบุ",
      "current_model": "ไม่รองรับในซิมวันนี้ (ไม่มีลำดับแก้ stall อัตโนมัติและ evaluator ไม่วัดความสูงที่เสีย)",
      "pass": null
     },
     {
      "case": "T-LD-42",
      "conditions": "บัตรที่ merge แล้วของ 3 id: speeds.VREF_kt / VAPP_kt, speeds.approach_table (แถว LDG), airframe.weights.training_mass",
      "quantity": "VAPP = approach_table ที่ training_mass; VAPP ≥ VREF; empty + crew + fuel = kg",
      "expected": "เป็นจริงทุก id",
      "tolerance": "±0.5 kt / ±2 kg",
      "unit": "kt IAS, kg",
      "origin": "D1, D3 (critic-r2); [LD3][LD6 p.4A-34][LD8]",
      "current_model": "da40ng: 1150 kg → ตาราง 74 KIAS, VREF 74 / VAPP 74; 903 + 170 + 77 = 1150 kg; da40_180: 1050 kg → ตาราง 65.2 KIAS, VREF 65 / VAPP 65; 792 + 170 + 88 = 1050 kg; da40d: 1060 kg → ตาราง 65.6 KIAS, VREF 66 / VAPP 66; 830 + 170 + 60 = 1060 kg",
      "pass": true
     },
     {
      "case": "T-LD-43",
      "conditions": "เครื่องที่ MTOM (NG 1,310 / 180 1,200 / D 1,150 kg), CG อ้างอิง, cruise trim (NG 110, รุ่นเดิม 100 KCAS) 3,000 ft, ดึงถึง limit load factor 3.8 g (normal category)",
      "quantity": "แรงดึงคันต่อ g (Fs/g) da40ng / da40_180 / da40d",
      "expected": "≥ 33 / ≥ 30 / ≥ 29",
      "tolerance": "ขั้นต่ำตามข้อกำหนด (ไม่มี tolerance)",
      "unit": "N/g",
      "origin": "14 CFR 23.155(a)(2) ก่อน Amdt 64 [LD12]: แรงดึงถึง n limit ≥ max(W/140 lb, 15 lb) = 20.6 / 18.9 / 18.1 lbf; หาร (n − 1) = 2.8; ค่าประมาณจากโมเดล hinge รอบที่ 1 กับพารามิเตอร์บัตร (controls.pitch.*) = 21.1 / 19.2 / 18.6 N/g ต่ำกว่าเกณฑ์ (ค่า Chδ/gearing ของรอบที่ 1 ต่ำไปสำหรับ DA40)",
      "current_model": "ไม่รองรับในซิมวันนี้ (ซิมไม่มีโมเดลแรงที่คัน: DIRECT สั่งมุม elevator ตรง)",
      "pass": null
     },
     {
      "case": "T-LD-44",
      "conditions": "เครื่องที่ training_mass, trim ด้วย tab ที่ VAPP แฟลป LDG 300 m และที่ cruise 3,000 ft แล้วเปลี่ยนความเร็ว ±1 kt (tab คงที่)",
      "quantity": "ความชันแรงคันต่อความเร็ว approach / cruise (ดึงเมื่อช้าลง = บวก)",
      "expected": "0.401 / 0.266; 0.396 / 0.262; 0.394 / 0.264",
      "tolerance": "±50 % (ค่าประมาณ) และต้อง > 0",
      "unit": "N/kt",
      "origin": "ค่าประมาณจากโมเดล hinge รอบที่ 1 กับพารามิเตอร์บัตร (ld_stickforce.mjs); 14 CFR 23.173(a) ต้องดึงเมื่อช้ากว่าความเร็ว trim [LD12]; เครื่องฝึกรอบที่ 1 0.63 N/kt ที่ 95 kt [R1:V10]",
      "current_model": "ไม่รองรับในซิมวันนี้ (ไม่มีโมเดลแรงที่คัน)",
      "pass": null
     }
    ],
    "u": "ตามช่อง unit ของแต่ละแถว",
    "scope": "aircraft",
    "src": [
     "LM0",
     "LD1",
     "LD2",
     "LD3",
     "LD4",
     "LD6",
     "LD8",
     "R1:V10"
    ],
    "conf": "กลาง",
    "est": false,
    "note": "แถวเดียวกับตาราง T-LD ใน §05.11 ที่ตรวจ da40_180 (scripts/ld_tests.mjs 2026-11-19 → out/ld_tests.json → ld_json.mjs); expected มาจากแหล่งในช่อง origin (แถวที่ผู้เขียนประมาณเองระบุวิธีไว้ในช่องนั้น); current_model = บัตรนี้ในฟิสิกส์ของซิม commit cabf0f0; pass null = ไม่รองรับในซิมวันนี้; ผ่าน 4 ไม่ผ่าน 3 n.a. 3 จาก 10 แถว"
   }
  }
 }
}
```

```json
{
 "da40_180": {
  "propulsion": {
   "layout": {
    "v": [
     {
      "id": 1,
      "pos": [
       2.22,
       0,
       0.05
      ],
      "axis": [
       1,
       0,
       0
      ],
      "type": "piston",
      "model": "Lycoming IO-360-M1A",
      "prop_sense": 1
     }
    ],
    "u": "m FRD",
    "scope": "aircraft",
    "src": [
     "LD1"
    ],
    "conf": "ต่ำ",
    "est": true,
    "note": "ตำแหน่งดุมใช้ของ NG (ค่าประมาณ); เครื่องขับตรงไม่มีเกียร์"
   },
   "legacy": {
    "v": {
     "P": 134200,
     "eta": 0.9269,
     "T0": 4131,
     "idle": 0
    },
    "u": "-",
    "scope": "engine",
    "src": [
     "LM0",
     "LD4",
     "LD6"
    ],
    "conf": "ต่ำ",
    "est": true,
    "note": "ค่าประมาณ lm_legacy_fit static (da40_180): T0 = 1.174 × แรงขับสถิตโมเมนตัม×FM 0.623 (สัดส่วนเดียวกับ iteration ของ NG §05.9) แล้วหา Vc = 30.1 m/s ให้ ROC ตรงเป้า; eta_sim 0.9269"
   }
  }
 }
}
```

```json
{
 "da40_180": {
  "piston": {
   "identity": {
    "v": {
     "model": "Textron Lycoming IO-360-M1A",
     "kind": "fuel_injected",
     "displacement_L": 5.92,
     "cylinders": 4,
     "tcds": "FAA 1E10"
    },
    "u": "-",
    "scope": "engine",
    "src": [
     "LD1",
     "LD6"
    ],
    "conf": "สูง",
    "est": false,
    "note": "4 สูบนอน ระบายความร้อนด้วยอากาศ ขับใบพัดตรง [LD1 p.4]"
   },
   "ratings": {
    "v": {
     "P_rated": 134200,
     "rpm_rated": 2700,
     "P_mcp": 119289,
     "rpm_mcp": 2400,
     "rpm_redline": 2700,
     "rpm_overspeed": null,
     "rpm_idle": null,
     "takeoff_time_limit_s": null
    },
    "u": "W, rpm",
    "scope": "engine",
    "src": [
     "LD1",
     "LD4"
    ],
    "conf": "กลาง",
    "est": true,
    "note": "180 hp ที่ 2,700 rpm [LD4]; รอบสูงสุด take-off 2,700, ต่อเนื่อง 2,400 rpm [LD1 p.4]; P_mcp ค่าประมาณ ∝ rpm"
   },
   "altitude": {
    "v": {
     "model": "gagg_ferrar",
     "critical_alt_m": 0,
     "max_operating_alt_m": 5000
    },
    "u": "-",
    "scope": "engine",
    "src": [
     "LM12",
     "LD5"
    ],
    "conf": "กลาง",
    "est": true,
    "note": "เครื่องดูดอากาศธรรมชาติ P/P0 = 1.132σ − 0.132 (Gagg–Ferrar, ค่าประมาณ); ความสูงสาธิตสูงสุด 5,000 m [LD5]"
   },
   "power_map": {
    "v": {
     "axes": {
      "rpm": [
       2400,
       2700
      ]
     },
     "data": [
      119289,
      134200
     ]
    },
    "u": "W (คันเร่งสุด SL)",
    "scope": "engine",
    "src": [
     "LD1",
     "LD4"
    ],
    "conf": "ต่ำ",
    "est": true,
    "note": "ค่าประมาณ: กำลังเต็มคันเร่งที่ SL ∝ rpm; ไม่มีตาราง MAP–rpm ที่เปิดอ่านได้"
   },
   "fuel": {
    "v": {
     "fuel": "AVGAS 100LL",
     "bsfc_g_per_kWh": {
      "65": 256
     },
     "ff_table": [
      [
       65,
       31
      ]
     ]
    },
    "u": "g/kWh, [load %, l/h]",
    "scope": "engine",
    "src": [
     "LD4"
    ],
    "conf": "กลาง",
    "est": true,
    "note": "ค่าประมาณ: BSFC คำนวณจาก 31 l/h ที่ 65 % [LD4] × 0.72 kg/l"
   },
   "dynamics": {
    "v": {
     "tau_throttle_s": 0.2,
     "I_engine": null,
     "friction_torque": null
    },
    "u": "s, kg m2, N m",
    "scope": "engine",
    "src": [
     "LM12"
    ],
    "conf": "ต่ำ",
    "est": true,
    "note": "ค่าประมาณ: เครื่องดูดอากาศธรรมชาติตอบสนองเร็วกว่าดีเซลเทอร์โบ"
   },
   "fadec": {
    "v": "none: throttle (MAP) + propeller rpm lever + mixture",
    "u": "-",
    "scope": "engine",
    "src": [
     "LD6"
    ],
    "conf": "สูง",
    "est": false,
    "note": "ไม่มี FADEC: คันเร่ง คันรอบใบพัด และคันส่วนผสม [LD6 §7]"
   }
  }
 }
}
```

```json
{
 "da40_180": {
  "propeller": {
   "identity": {
    "model": {
     "v": "MT-Propeller MTV-12-B/180-17",
     "u": "-",
     "scope": "propeller",
     "src": [
      "LD1",
      "LD16"
     ],
     "conf": "สูง",
     "est": false,
     "note": "EASA P.013 [LD1 p.4–5][LD16]; ใบไม้หุ้มคอมโพสิต 3 ใบ hub ไฮดรอลิก right-hand tractor [LD16 p.6–10]"
    },
    "diameter": {
     "v": 1.8,
     "u": "m",
     "scope": "propeller",
     "src": [
      "LD1",
      "LD16"
     ],
     "conf": "สูง",
     "est": false,
     "note": "1,800 mm [LD1 p.5]; ช่วงที่รับรอง 152–210 cm [LD16 p.6]"
    },
    "massComplete": {
     "v": 20,
     "u": "kg",
     "scope": "propeller",
     "src": [
      "LD16"
     ],
     "conf": "กลาง",
     "est": false,
     "note": "ราว 20 kg สำหรับ configuration constant speed ของ MTV-12 (ไม่ระบุรายรุ่น) [LD16 p.6]; ใบพัดตระกูลนี้รับได้ 168 kW ที่ 2,800 rpm [LD16 p.7] (NG: MTV-6 ราว 14 kg)"
    }
   },
   "inertia": {
    "Ip": {
     "v": 1.8,
     "u": "kg m2",
     "scope": "propeller",
     "src": [
      "LD16"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: สเกลจาก Ip 1.4 kg m² ของใบพัด NG ด้วยมวล 20/14 และรัศมี (0.90/0.95)²"
    }
   },
   "engineInterface": {
    "maxShaftPower": {
     "v": 134.2,
     "u": "kW",
     "scope": "propeller",
     "src": [
      "LD4"
     ],
     "conf": "กลาง",
     "est": false,
     "note": "180 hp"
    },
    "rpmGoverned": {
     "v": 2700,
     "u": "rpm",
     "scope": "propeller",
     "src": [
      "LD1"
     ],
     "conf": "สูง",
     "est": false,
     "note": "take-off [LD1 p.4]"
    },
    "rpmTransientLimit": {
     "v": 2700,
     "u": "rpm",
     "scope": "propeller",
     "src": [
      "LD1"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: ไม่พบค่าผ่อนผัน overspeed ใช้ redline"
    },
    "gearRatio": {
     "v": 1,
     "u": "-",
     "scope": "propeller",
     "src": [
      "LD1"
     ],
     "conf": "สูง",
     "est": false,
     "note": "ขับตรง"
    }
   },
   "governor": {
    "betaFlightIdle": {
     "v": 10.5,
     "u": "deg @0.75R",
     "scope": "propeller",
     "src": [
      "LD1"
     ],
     "conf": "สูง",
     "est": false,
     "note": "low pitch 10.5° [LD1 p.5]"
    },
    "betaHigh": {
     "v": 30,
     "u": "deg @0.75R",
     "scope": "propeller",
     "src": [
      "LD1"
     ],
     "conf": "สูง",
     "est": false,
     "note": "high pitch 30° [LD1 p.5]"
    },
    "rpmOverspeed": {
     "v": 2700,
     "u": "rpm",
     "scope": "propeller",
     "src": [
      "LD1"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ = redline"
    }
   },
   "checks": {
    "staticThrustISA": {
     "v": 3.52,
     "u": "kN",
     "scope": "propeller",
     "src": [
      "LM0"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: โมเมนตัม 4.82 kN × FM^(2/3) ด้วย FM 0.623 ของ BEM ใบพัด NG (ตารางไร้มิติ CT/CP รับจาก NG)"
    },
    "staticThrustVTBD31C": {
     "v": 3.32,
     "u": "kN",
     "scope": "propeller",
     "src": [
      "LM0"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ 31 °C: กำลัง × (1.132σ − 0.132) และ ρ ลดลง (σ 0.947)"
    },
    "momentumIdealStaticISA": {
     "v": 4.82,
     "u": "kN",
     "scope": "propeller",
     "src": [
      "LM0"
     ],
     "conf": "กลาง",
     "est": false,
     "note": "(P² · 2ρA)^(1/3), D 1.80 m, 134.2 kW"
    }
   }
  }
 }
}
```

```json
{
 "da40_180": {
  "aero": {
   "ref": {
    "S": {
     "v": 13.54,
     "u": "m2",
     "scope": "aircraft",
     "src": [
      "LD6"
     ],
     "conf": "สูง",
     "est": false,
     "note": "พื้นที่อ้างอิง = พื้นที่ปีก AFM รุ่นเดิม"
    },
    "b": {
     "v": 11.94,
     "u": "m",
     "scope": "aircraft",
     "src": [
      "LD6"
     ],
     "conf": "สูง",
     "est": false,
     "note": ""
    },
    "c": {
     "v": 1.121,
     "u": "m",
     "scope": "aircraft",
     "src": [
      "LD6"
     ],
     "conf": "สูง",
     "est": false,
     "note": "MAC"
    }
   },
   "static_long": {
    "CLmax_target": {
     "v": {
      "UP": 1.583,
      "T/O": 1.611,
      "LDG": 1.642
     },
     "u": "-",
     "scope": "aircraft",
     "src": [
      "LD6",
      "LM2"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: CLmax 1 g ที่ 1,200 kg จาก VS 53/52/52 KIAS → 56.7/56.2/55.7 KCAS (ตาราง ld_iascas รุ่นเดิม) ด้วย clmaxFromStall (min, n_z 0.95); สูงกว่า NG ราว 15 % — ดูความขัดแย้ง §05.12"
    }
   },
   "flaps": {
    "detents": {
     "v": [
      {
       "name": "UP",
       "flap_deg": 0,
       "VFE_kt": null,
       "dCL0": 0,
       "dCD0": 0,
       "dCm0": 0,
       "CLmax": 1.583
      },
      {
       "name": "T/O",
       "flap_deg": 20,
       "VFE_kt": 108,
       "dCL0": 0.52,
       "dCD0": 0.008,
       "dCm0": -0.06,
       "CLmax": 1.611
      },
      {
       "name": "LDG",
       "flap_deg": 42,
       "VFE_kt": 91,
       "dCL0": 0.75,
       "dCD0": 0.035,
       "dCm0": -0.1,
       "CLmax": 1.642
      }
     ],
     "u": "-",
     "scope": "aircraft",
     "src": [
      "LD1",
      "LD6",
      "LM10"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: มุมแฟลปเท่ากับ NG [LD1 p.7]; VFE รุ่นเดิม 108/91 KIAS; dCL0/dCD0/dCm0 ใช้ของ NG (แฟลปเดียวกัน); CLmax จาก VS รุ่นเดิม (ดู CLmax_target)"
    }
   },
   "legacy": {
    "v": {
     "CL0": 0.34,
     "CLa": 5.45,
     "CLflap": 0.75,
     "CDflap": 0.035,
     "CDgear": 0,
     "Cm0": 0.02,
     "Cma": -1.6,
     "Cmflap": -0.1,
     "aStall": 17.93,
     "aStallFlap": -7.44,
     "CD0": 0.06114,
     "K": 0.07322
    },
    "u": "-",
    "scope": "aircraft",
    "src": [
     "LM0",
     "LD6"
    ],
    "conf": "ต่ำ",
    "est": true,
    "note": "ค่าประมาณ lm_legacy_fit (da40_180): polar ของซิมจากการร่อนของรุ่นนี้; aStall/aStallFlap แก้หาให้ CLmax 1 g = 1.583 (UP) / 1.642 (LDG); ค่าอื่นจาก NG"
   }
  }
 }
}
```

```json
{
 "da40_180": {
  "controls": {
   "surfaces": {
    "elevator": {
     "v": {
      "travel_deg": {
       "up": 18,
       "down": 16
      },
      "tol": null,
      "rate_dps": null,
      "actuator_tau_s": null
     },
     "u": "deg",
     "scope": "aircraft",
     "src": [
      "LD1"
     ],
     "conf": "สูง",
     "est": false,
     "note": "MTOM 1,200 kg (MÄM 40-227) 18/16°; มาตรฐาน 23±1/15±1°, ถังพิสัยไกล 23/16° [LD1 p.7]"
    },
    "rudder": {
     "v": {
      "travel_deg": {
       "left": 29,
       "right": 31
      },
      "tol": "±1",
      "rate_dps": null,
      "actuator_tau_s": null
     },
     "u": "deg",
     "scope": "aircraft",
     "src": [
      "LD1"
     ],
     "conf": "สูง",
     "est": false,
     "note": "มาตรฐาน; ถังพิสัยไกลหรือ rudder ใหญ่ 24/26° [LD1 p.7]"
    }
   },
   "pitch": {
    "stops": {
     "v": {
      "teu": 18,
      "ted": 16
     },
     "u": "deg",
     "scope": "aircraft",
     "src": [
      "LD1"
     ],
     "conf": "สูง",
     "est": false,
     "note": "MÄM 40-227 (MTOM 1,200 kg) 18/16° [LD1 p.7]"
    },
    "derived_check": {
     "v": {
      "mass_kg": 1050,
      "Fs_per_g_N": {
       "approach": 17.6,
       "cruise": 17.3
      },
      "grad_N_per_kt": {
       "approach": 0.396,
       "cruise": 0.262
      },
      "at_kcas": {
       "approach": 66,
       "cruise": 100
      },
      "SM_fixed": 0.294,
      "SM_free": 0.226,
      "free_elevator_factor": 0.82,
      "mtom": {
       "mass_kg": 1200,
       "Fs_per_g_N": 19.2,
       "pull_to_nL_lbf": 12.1,
       "cfr23_155_min_lbf": 18.9
      }
     },
     "u": "N/g, N/kt, MAC",
     "scope": "aircraft",
     "src": [
      "LD12",
      "LD15",
      "LM0"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ (scripts/ld_stickforce.mjs, gap 18): สมการ elevator แบบ reversible ของรอบที่ 1 §6 (trim เชิงเส้น + Ch = Ch0 + Chα·αt + Chδ·δe + Chtab·δtab, F = G·ηt·q·Se·ce·Ch) กับ controls.pitch.* ของบัตรนี้ ที่ training_mass 1050 kg; ที่ MTOM 1200 kg แรงดึงถึง 3.8 g = 12.1 lbf (53.8 N) ต่ำกว่าขั้นต่ำ 14 CFR 23.155(a)(2) 18.9 lbf [LD12] แสดงว่า Chδ และ gearing ที่ยกมาจากรอบที่ 1 ต่ำไปสำหรับ DA40 (เครื่องจริงผ่านการรับรอง) เป้าของโมเดลแรงที่คันในอนาคตคือ Fs/g ≥ 30 N/g ที่ MTOM (T-LD-43) และความชันต่อความเร็วเป็นบวก (T-LD-44); ซิมวันนี้ไม่มีโมเดลแรงที่คัน"
    }
   },
   "yaw": {
    "stops": {
     "v": {
      "left": 29,
      "right": 31,
      "max": 29
     },
     "u": "deg",
     "scope": "aircraft",
     "src": [
      "LD1"
     ],
     "conf": "สูง",
     "est": false,
     "note": "มาตรฐาน 29/31° [LD1 p.7]; max = min(left, right)"
    }
   }
  }
 }
}
```

```json
{
 "da40_180": {
  "interference": {
   "slipstream": {
    "diskDiameter": {
     "v": 1.8,
     "u": "m",
     "scope": "propeller",
     "src": [
      "LD1"
     ],
     "conf": "สูง",
     "est": false,
     "note": "MTV-12-B/180-17 [LD1 p.5]"
    }
   },
   "groundEffect": {
    "A": {
     "v": 10.53,
     "u": "-",
     "scope": "aircraft",
     "src": [
      "LD6"
     ],
     "conf": "สูง",
     "est": false,
     "note": "AR ปีกรุ่นเดิม [LD6 p.1-6]"
    }
   }
  }
 }
}
```

```json
{
 "da40_180": {
  "validation": {
   "takeoff_test": {
    "v": {
     "flap": "T/O",
     "VR_kt": 62.1,
     "theta_deg": 8
    },
    "u": "kt CAS, deg",
    "scope": "aircraft",
    "src": [
     "LD6"
    ],
    "conf": "กลาง",
    "est": true,
    "note": "VR ≈ 59 KIAS [LD6 p.5-10] → KCAS ด้วยตาราง T/O รุ่นเดิม; มุมเงย 8° ค่าประมาณ"
   },
   "trim_targets": {
    "approach": {
     "v": {
      "ias_kt": 73,
      "h_m": 300,
      "gamma_deg": -3
     },
     "u": "kt CAS, m, deg",
     "scope": "aircraft",
     "src": [
      "LD6"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: จุด trim/linearise ของซิมที่ MTOM 1,200 kg = speeds.approach_table 73 KIAS แฟลป LDG [LD6 p.4A-34] → KCAS ด้วยตาราง ias_cas รุ่นเดิม (ค่าประมาณ); VREF/VAPP ที่ training_mass 1,050 kg = 65 KIAS อยู่ใน speeds (D1)"
    },
    "cruise": {
     "v": {
      "ias_kt": 100,
      "h_ft": 3000,
      "gamma_deg": 0
     },
     "u": "kt CAS, ft",
     "scope": "aircraft",
     "src": [
      "LD6"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: สภาพ trim ของซิม: 100 KCAS (ไม่ใช่ 110 แบบ NG) เพราะ polar จากการร่อนใบพัดหมุนฟรีของโครงรุ่นเดิมทำให้ซิมวันนี้ต้องใช้คันเร่ง 0.96 (da40_180) และ 1.20 (da40d) ที่ 110 KCAS — ดู ld_polar_opts.mjs และ §05.12"
    }
   },
   "currentModel": {
    "performance": {
     "v": {
      "mass_kg": 1200,
      "VSR_kcas": {
       "UP": 58.2,
       "T/O": 57.5,
       "LDG": 57.1
      },
      "Vy_kt": 71.3,
      "ROC_fpm": 799,
      "glide": {
       "V_kt": 75.9,
       "LD": 8.8
      },
      "takeoff_m": {
       "flap": "T/O",
       "ground": 310,
       "d50ft": 510
      },
      "landing_m": {
       "asIs": 780,
       "maxBrake": 608
      },
      "trim": {
       "cruise_thr": 0.783,
       "approach_thr": 0.444
      }
     },
     "u": "kt, fpm, -, m",
     "scope": "aircraft",
     "src": [
      "LM0"
     ],
     "conf": "สูง",
     "est": false,
     "note": "ผล lm_card da40_180 ที่ MTOW กับซิม commit cabf0f0 (regression ของซิมวันนี้ ไม่ใช่ค่าเครื่องจริง)"
    },
    "approach": {
     "v": {
      "sp": {
       "wn": 3.311,
       "zeta": 0.58,
       "T": 2.33
      },
      "ph": {
       "wn": 0.322,
       "zeta": 0.126,
       "T": 19.681
      },
      "dr": {
       "wn": 1.528,
       "zeta": 0.227,
       "T": 4.224
      },
      "roll_tau": 0.237,
      "spiral": {
       "lam": 0.01,
       "t2": 66.272,
       "grows": true
      },
      "nAlpha": 5.42,
      "CAP": 2.023
     },
     "u": "rad/s, -, s",
     "scope": "aircraft",
     "src": [
      "LM0"
     ],
     "conf": "สูง",
     "est": false,
     "note": "โหมดเชิงเส้นของซิมวันนี้ที่ approach แฟลป LDG γ −3° (MTOW)"
    },
    "cruise": {
     "v": {
      "sp": {
       "wn": 4.503,
       "zeta": 0.564,
       "T": 1.689
      },
      "ph": {
       "wn": 0.228,
       "zeta": 0.133,
       "T": 27.807
      },
      "dr": {
       "wn": 2.059,
       "zeta": 0.235,
       "T": 3.14
      },
      "roll_tau": 0.18,
      "spiral": {
       "lam": 0.025,
       "t2": 27.788,
       "grows": true
      },
      "nAlpha": 10.165,
      "CAP": 1.995
     },
     "u": "rad/s, -, s",
     "scope": "aircraft",
     "src": [
      "LM0"
     ],
     "conf": "สูง",
     "est": false,
     "note": "โหมดเชิงเส้นของซิมวันนี้ที่ 110 KCAS 3,000 ft (MTOW)"
    }
   }
  }
 }
}
```

```json
{
 "da40_180": {
  "_inherits": {
   "v": "da40ng",
   "u": "-",
   "scope": "aircraft",
   "src": [],
   "conf": "สูง",
   "est": false,
   "note": "DA 40 / DA 40 CS / XLS / XLT เครื่อง Lycoming IO-360-M1A (TCDS Section A) โครงเดียวกับ NG ต่างที่เครื่องยนต์ ใบพัด มวล ความเร็วจำกัด และปีกตาม AFM รุ่นเดิม; ค่าที่ไม่ได้ระบุในบล็อกนี้รับจาก da40ng (ดูรายการที่ยังไม่ยืนยันใน §05.12)"
  }
 }
}
```

#### da40d

```json
{
 "da40d": {
  "airframe": {
   "identity": {
    "v": {
     "manufacturer": "Diamond Aircraft Industries (TC holder: Diamond Aircraft Industries Inc., Canada)",
     "model": "DA 40 D",
     "variant": "DA 40 D (TDI), MTOM 1150 kg",
     "engine": "Thielert / Technify TAE 125-01 หรือ TAE 125-02-99 turbo-diesel, FADEC คันเดียว",
     "propeller": "MT-Propeller MTV-6-A/187-129, 3 ใบ constant speed",
     "seats": 4,
     "category": "normal (utility ≤ 980 kg)",
     "tc_ref": "EASA TCDS EASA.IM.A.022 Issue 24 (Section B); engine EASA E.055"
    },
    "u": "-",
    "scope": "aircraft",
    "src": [
     "LD1",
     "LD5",
     "LD11"
    ],
    "conf": "สูง",
    "est": false,
    "note": "โรงเรียนการบินพลเรือนไทยมี DA 40 D 9 ลำ [LS1][LS18]"
   },
   "weights": {
    "MTOW": {
     "v": 1150,
     "u": "kg",
     "scope": "aircraft",
     "src": [
      "LD1",
      "LD5"
     ],
     "conf": "สูง",
     "est": false,
     "note": "2,535 lb; utility 980 kg [LD1 p.14]"
    },
    "MLW": {
     "v": 1150,
     "u": "kg",
     "scope": "aircraft",
     "src": [
      "LD1",
      "LD8"
     ],
     "conf": "กลาง",
     "est": false,
     "note": "MLM 1,092 หรือ 1,150 kg ตามรุ่นย่อย [LD1 p.14]; handout ใช้ 1,150 kg [LD8]"
    },
    "MRW": {
     "v": 1150,
     "u": "kg",
     "scope": "aircraft",
     "src": [
      "LD1"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ = MTOM (ไม่พบ ramp mass แยก)"
    },
    "MZFW": {
     "v": 1150,
     "u": "kg",
     "scope": "aircraft",
     "src": [
      "LD1"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ = MTOM (ไม่พบ MZFM ใน TCDS Section B)"
    },
    "min_flight_mass": {
     "v": 850,
     "u": "kg",
     "scope": "aircraft",
     "src": [
      "LD6"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: มวลต่ำสุดในตาราง AFM โครงเดียวกัน"
    },
    "BEW_typical": {
     "v": 830,
     "u": "kg",
     "scope": "aircraft",
     "src": [
      "LD8"
     ],
     "conf": "ต่ำ",
     "est": false,
     "note": "น้ำหนักเปล่าทั่วไป [LD8]"
    },
    "max_fuel_usable": {
     "v": 84.8,
     "u": "kg",
     "scope": "aircraft",
     "src": [
      "LD1"
     ],
     "conf": "สูง",
     "est": false,
     "note": "106.0 l (28 USgal) Jet A-1 × 0.80 kg/l; ถังพิสัยไกล 147.6 l = 118 kg [LD1 p.13]"
    },
    "useful_load": {
     "v": 320,
     "u": "kg",
     "scope": "aircraft",
     "src": [
      "LD8"
     ],
     "conf": "ต่ำ",
     "est": false,
     "note": "MTOM − น้ำหนักเปล่าทั่วไป"
    },
    "training_mass": {
     "v": {
      "kg": 1060,
      "empty_kg": 830,
      "crew_kg": 170,
      "fuel_kg": 60,
      "fuel_l": 75
     },
     "u": "kg",
     "scope": "aircraft",
     "src": [
      "LD8",
      "LM19"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ (D3): empty_kg = BEW_typical 830 kg [LD8] + ครูฝึกและศิษย์ 2 × 85 kg + Jet A-1 75 l (60 kg ที่ 0.80 kg/l [LM19], ราว 70 % ของถัง 106 l) = 1,060 kg (2,337 lb)"
    }
   },
   "cg": {
    "LEMAC": {
     "v": 2.236,
     "u": "m DAT",
     "scope": "aircraft",
     "src": [
      "LD6"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ ld_geom.mjs (โครงรุ่นเดิม)"
    },
    "MAC": {
     "v": 1.121,
     "u": "m",
     "scope": "aircraft",
     "src": [
      "LD6"
     ],
     "conf": "สูง",
     "est": false,
     "note": "[LD6 p.1-6]"
    },
    "envelope": {
     "v": [
      [
       850,
       2.4,
       2.59
      ],
      [
       980,
       2.4,
       2.59
      ],
      [
       1150,
       2.46,
       2.59
      ]
     ],
     "u": "[kg, m DAT fwd, m DAT aft]",
     "scope": "aircraft",
     "src": [
      "LD1",
      "LD8"
     ],
     "conf": "สูง",
     "est": false,
     "note": "หน้า 2.40 m ถึง 980 kg แล้วเชิงเส้นถึง 2.46 m ที่ 1,150 kg; หลัง 2.59 m (2.55 m ถังพิสัยไกล) [LD1 p.14]"
    },
    "ref": {
     "v": {
      "m_DAT": 2.47,
      "pct_mac": 20.9
     },
     "u": "m DAT",
     "scope": "aircraft",
     "src": [
      "LD1"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: CG อ้างอิงเดียวกับ NG"
    }
   },
   "wing": {
    "S": {
     "v": 13.54,
     "u": "m2",
     "scope": "aircraft",
     "src": [
      "LD6"
     ],
     "conf": "สูง",
     "est": false,
     "note": "13.54 m² (145.7 sq ft) [LD6 p.1-6]; ค่าใน AFM รุ่นเดิมต่างจาก NG (13.244) — ดู §05.12"
    },
    "b": {
     "v": 11.94,
     "u": "m",
     "scope": "aircraft",
     "src": [
      "LD6"
     ],
     "conf": "สูง",
     "est": false,
     "note": "รวม winglet ≈ 11.94 m (39 ft 2 in) [LD6 p.1-6]"
    },
    "MAC": {
     "v": 1.121,
     "u": "m",
     "scope": "aircraft",
     "src": [
      "LD6"
     ],
     "conf": "สูง",
     "est": false,
     "note": "[LD6 p.1-6]"
    },
    "AR": {
     "v": 10.53,
     "u": "-",
     "scope": "aircraft",
     "src": [
      "LD6"
     ],
     "conf": "สูง",
     "est": false,
     "note": "[LD6 p.1-6]"
    }
   },
   "geometry": {
    "length": {
     "v": 8.01,
     "u": "m",
     "scope": "aircraft",
     "src": [
      "LD6"
     ],
     "conf": "สูง",
     "est": false,
     "note": "26 ft 3 in [LD6 p.1-6]"
    },
    "span": {
     "v": 11.94,
     "u": "m",
     "scope": "aircraft",
     "src": [
      "LD6"
     ],
     "conf": "สูง",
     "est": false,
     "note": "[LD6 p.1-6]"
    }
   },
   "inertia": {
    "Ixx": {
     "v": 2495,
     "u": "kg m2",
     "scope": "aircraft",
     "src": [
      "LM15",
      "LM8"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ Roskam radii single_prop × มวลฝึก 1060 kg, b 11.94 m, L 8.01 m (lm_inertia, ±30 %)"
    },
    "Iyy": {
     "v": 2167,
     "u": "kg m2",
     "scope": "aircraft",
     "src": [
      "LM15",
      "LM8"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: เช่นเดียวกับ Ixx"
    },
    "Izz": {
     "v": 4304,
     "u": "kg m2",
     "scope": "aircraft",
     "src": [
      "LM15",
      "LM8"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: เช่นเดียวกับ Ixx"
    },
    "ref_mass": {
     "v": 1060,
     "u": "kg",
     "scope": "aircraft",
     "src": [
      "LD6"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "มวลฝึก (ค่าประมาณ) ที่ CG อ้างอิง 2.47 m DAT"
    }
   }
  }
 }
}
```

```json
{
 "da40d": {
  "speeds": {
   "VS0_kt": {
    "v": 49,
    "u": "kt IAS",
    "scope": "aircraft",
    "src": [
     "LD8",
     "LD6"
    ],
    "conf": "กลาง",
    "est": false,
    "note": "แฟลป LDG 1,150 kg; 42 KIAS ที่ 980 kg [LD8][LD6 p.5-8]"
   },
   "VS1_kt": {
    "v": 52,
    "u": "kt IAS",
    "scope": "aircraft",
    "src": [
     "LD8",
     "LD6"
    ],
    "conf": "กลาง",
    "est": false,
    "note": "แฟลป UP 1,150 kg; 47 KIAS ที่ 980 kg"
   },
   "VY_kt": {
    "v": 66,
    "u": "kt IAS",
    "scope": "aircraft",
    "src": [
     "LD8"
    ],
    "conf": "ต่ำ",
    "est": false,
    "note": "ความเร็วไต่หลังวิ่งขึ้น แฟลป T/O [LD8]; cruise climb แฟลป UP 73 KIAS"
   },
   "VR_kt": {
    "v": 59,
    "u": "kt IAS",
    "scope": "aircraft",
    "src": [
     "LD8"
    ],
    "conf": "กลาง",
    "est": false,
    "note": "[LD8]"
   },
   "VAPP_kt": {
    "v": 66,
    "u": "kt IAS",
    "scope": "aircraft",
    "src": [
     "LD6",
     "LD8"
    ],
    "conf": "กลาง",
    "est": false,
    "note": "D1: ที่ training_mass 1,060 kg แฟลป LDG ลมสงบ = speeds.approach_table อ่านเชิงเส้นระหว่าง 63 KIAS (1,000 kg) กับ 67 KIAS (1,092 kg) ได้ 65.6 KIAS [LD6 p.4A-34] (โครงเดียวกัน; handout ให้ 71 KIAS ที่ 1,150 kg ตรงกับ AFM [LD8 p.24]); ≈ 66 KCAS (34 m/s); เท่ากับ VREF; ที่ MTOM 1,150 kg = 71 KIAS"
   },
   "VREF_kt": {
    "v": 66,
    "u": "kt IAS",
    "scope": "aircraft",
    "src": [
     "LD6",
     "LD8"
    ],
    "conf": "กลาง",
    "est": false,
    "note": "D1: ที่ training_mass 1,060 kg; handout เรียกความเร็วนี้ว่า VREF (71 KIAS แฟลป LDG, 73 KIAS แฟลป UP ที่ 1,150 kg) [LD8 p.24]"
   },
   "approach_table": {
    "v": {
     "axes": {
      "mass_kg": [
       850,
       1000,
       1092,
       1150
      ],
      "flap": [
       "LDG"
      ]
     },
     "data": [
      [
       58,
       63,
       67,
       71
      ]
     ]
    },
    "u": "kt IAS",
    "scope": "aircraft",
    "src": [
     "LD6",
     "LD8"
    ],
    "conf": "กลาง",
    "est": false,
    "note": "ตาราง approach แฟลป LDG ของ AFM โครงรุ่นเดิม [LD6 p.4A-34] (AFM ของ DA 40 D เปิดอ่านไม่ได้; handout ของรุ่น D ให้ 71 KIAS ที่ 1,150 kg ตรงกัน [LD8 p.24]); ใช้ตั้ง VREF ของซิมที่มวลอื่นนอก training_mass (scripts/ld_tools.mjs card)"
   },
   "VX_kt": {
    "v": 66,
    "u": "kt IAS",
    "scope": "aircraft",
    "src": [
     "LD17",
     "LC1",
     "LF1",
     "LE2",
     "LM0",
     "LD6",
     "LD8"
    ],
    "conf": "ต่ำ",
    "est": true,
    "note": "ค่าประมาณ (scripts/ld_vx.mjs, gap 7): แฟลป UP ที่ MTOM 1150 kg = k·VS1 ใน CAS = 1.19 × 55.9 = 66.5 KCAS (34.2 m/s); ที่ training_mass 1060 kg = 62 KIAS (63.8 KCAS); k = ค่าเฉลี่ย Vx/VS1 (CAS) ของ POH c172s 1.200, c172r 1.192, c152 1.177 (บัตร 04/10/11); AFM ไม่ให้ Vx (14 CFR 23.1585/23.1587 ไม่บังคับ [LD17]) ส่วนความเร็วไต่หลังวิ่งขึ้นแฟลป T/O ของ AFM 66 KIAS = 67.4 KCAS ตรงกับ k·VS(T/O) = 65.7 KCAS จึงทำหน้าที่ Vx ของโครงแบบวิ่งขึ้น; polar ของบัตร + ตาราง CT/CP ให้มุมไต่สูงสุดที่ 52 KCAS ซึ่งต่ำกว่า 1.1 VS1 (มุมไต่ยังเพิ่มจนใกล้ stall) จึงใช้ตัดสิน Vx เองไม่ได้; ซิมวันนี้ได้ 59.5 KCAS (T-LD-38…40)"
   },
   "stall_altitude_loss_ft": {
    "v": 190,
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
    "note": "ค่าประมาณ (scripts/ld_vx.mjs, gap 18): AFM ที่เปิดอ่านได้ไม่ระบุความสูงที่เสียในการแก้ stall; ใช้ค่าคลาส Δh = c·VS1² (KCAS) โดย c เฉลี่ย 0.0646 จาก POH/AFM C172S 230 ft, C152 160 ft, P2006T 180 ft (บัตร 04/11/12) × VS1 53.7 KCAS ที่ training_mass 1060 kg = 190 ft (58 m), ช่วง 120–240 ft ตาม c ต่ำสุด/สูงสุด; การแก้ stall ปกติ ปีกระดับ idle (เกณฑ์ของ evaluator)"
   },
   "VG_kt": {
    "v": 73,
    "u": "kt IAS",
    "scope": "aircraft",
    "src": [
     "LD6"
    ],
    "conf": "ต่ำ",
    "est": true,
    "note": "ค่าประมาณ: best glide ของโครงรุ่นเดิม 1,150 kg [LD6 p.3-28]; ใบพัดดีเซลหมุนฟรีอาจต่างกัน"
   },
   "VA_kt": {
    "v": {
     "980": 94,
     "1150": 108
    },
    "u": "kt IAS",
    "scope": "aircraft",
    "src": [
     "LD1"
    ],
    "conf": "สูง",
    "est": false,
    "note": "[LD1 p.13–14]"
   },
   "stall_table": {
    "v": {
     "axes": {
      "mass_kg": [
       980,
       1150
      ],
      "flap": [
       "UP",
       "T/O",
       "LDG"
      ]
     },
     "data": [
      [
       47,
       52
      ],
      [
       44,
       51
      ],
      [
       42,
       49
      ]
     ],
     "bank_deg": 0
    },
    "u": "kt IAS",
    "scope": "aircraft",
    "src": [
     "LD8",
     "LD6"
    ],
    "conf": "กลาง",
    "est": false,
    "note": "[LD8] ตรงกับ [LD6 p.5-8]"
   },
   "VNO_kt": {
    "v": 129,
    "u": "kt IAS",
    "scope": "aircraft",
    "src": [
     "LD1"
    ],
    "conf": "สูง",
    "est": false,
    "note": "[LD1 p.6, p.13–14]"
   },
   "VNE_kt": {
    "v": 178,
    "u": "kt IAS",
    "scope": "aircraft",
    "src": [
     "LD1"
    ],
    "conf": "สูง",
    "est": false,
    "note": "[LD1 p.6, p.13–14]"
   },
   "VFE": {
    "v": {
     "T/O": 108,
     "LDG": 91
    },
    "u": "kt IAS",
    "scope": "aircraft",
    "src": [
     "LD1",
     "LD6"
    ],
    "conf": "สูง",
    "est": false,
    "note": "[LD1 p.6][LD6 p.2-3]"
   },
   "ias_cas": {
    "v": {
     "UP": [
      [
       52,
       55.9
      ],
      [
       57,
       60
      ],
      [
       66,
       66.4
      ],
      [
       79,
       79
      ],
      [
       178,
       178
      ]
     ],
     "T/O": [
      [
       51,
       55.2
      ],
      [
       55,
       59.3
      ],
      [
       64,
       65.6
      ],
      [
       78,
       78
      ],
      [
       108,
       108
      ]
     ],
     "LDG": [
      [
       49,
       53.7
      ],
      [
       55,
       57.7
      ],
      [
       62,
       63.9
      ],
      [
       76,
       76
      ],
      [
       91,
       91
      ]
     ]
    },
    "u": "kt IAS -> kt CAS",
    "scope": "aircraft",
    "src": [
     "LD6",
     "LD8"
    ],
    "conf": "ต่ำ",
    "est": true,
    "note": "ค่าประมาณ (ld_iascas.mjs): KCAS(0°) = KIAS(60°)/√2 จากตาราง stall ตามมุมเอียงที่ 1,150 kg [LD6 p.5-8] (อ่านค่ามุมเอียงได้ไม่ชัด) → ช่วงใกล้ stall IAS อ่านต่ำกว่า CAS 4–5 kt; ตรวจกับ VREF/1.3 ได้ใกล้เคียง; เหนือ 76–79 KIAS ถือว่า IAS = CAS"
   },
   "crosswind_demonstrated_kt": {
    "v": 20,
    "u": "kt",
    "scope": "aircraft",
    "src": [
     "LD4"
    ],
    "conf": "ต่ำ",
    "est": true,
    "note": "ค่าประมาณ: ใช้ค่าของโครงรุ่นเดิม (XLT 20 kt [LD4]); ยังไม่พบค่าของ DA 40 D"
   }
  }
 }
}
```

```json
{
 "da40d": {
  "performance": {
   "ROC_SL_fpm": {
    "v": 550,
    "u": "fpm",
    "scope": "aircraft",
    "src": [
     "LD14"
    ],
    "conf": "ต่ำ",
    "est": true,
    "note": "ค่าประมาณ: นักบินอ่านจากกราฟ AFM ≈ 500 fpm ถึง 6,000 ft, 450 fpm ที่ 7,000 ft ที่ MTOM [LD14] → ต่อลงถึงระดับน้ำทะเล (+≈ 85 fpm จากกำลังที่ต้องใช้เพิ่มตาม 1/√σ, เครื่อง turbo flat-rated)"
   },
   "cruise_table": {
    "v": [
     {
      "h_ft": 0,
      "load_pct": 70,
      "ktas": 115
     },
     {
      "h_ft": 6000,
      "load_pct": 70,
      "ktas": 121
     },
     {
      "h_ft": 10000,
      "load_pct": 70,
      "ktas": 127
     }
    ],
    "u": "ft, %, kt TAS",
    "scope": "aircraft",
    "src": [
     "LD8",
     "LD14"
    ],
    "conf": "ต่ำ",
    "est": false,
    "note": "6,000 ft [LD8]; SL และ FL100 อ่านจากกราฟโดยนักบิน (รุ่น 1.7) [LD14]"
   },
   "glide": {
    "v": {
     "speed_kt": 73,
     "ratio": 8.8
    },
    "u": "kt IAS, -",
    "scope": "aircraft",
    "src": [
     "LD6"
    ],
    "conf": "ต่ำ",
    "est": true,
    "note": "ค่าประมาณ: ใช้ของโครงรุ่นเดิม 1,150 kg (ใบพัด Lycoming หมุนฟรี) [LD6 p.3-28]"
   },
   "takeoff": {
    "v": {
     "ground_roll_m": 431,
     "over50ft_m": 640
    },
    "u": "m",
    "scope": "aircraft",
    "src": [
     "LD8",
     "LD4"
    ],
    "conf": "ต่ำ",
    "est": true,
    "note": "ระยะข้ามสิ่งกีดขวาง 50 ft 640 m SL ISA 1,150 kg [LD8]; ระยะวิ่ง ≈ 640 × (397/590 ของ NG [LD4]) เป็นค่าประมาณ"
   },
   "landing": {
    "v": {
     "ground_roll_m": 290,
     "over50ft_m": 620
    },
    "u": "m",
    "scope": "aircraft",
    "src": [
     "LD4"
    ],
    "conf": "ต่ำ",
    "est": true,
    "note": "ค่าประมาณ: ใช้ของ XLT (โครงเดียวกัน 1,200 kg) [LD4]"
   },
   "fuel": {
    "v": {
     "fuel": "Jet A-1 / Jet A",
     "usable_l": {
      "standard": 106,
      "long_range": 147.6
     },
     "ff_lph_70pct": 18.9,
     "ff_lph_100pct": 30.3
    },
    "u": "l, l/h",
    "scope": "aircraft",
    "src": [
     "LD1",
     "LD8",
     "LD14"
    ],
    "conf": "กลาง",
    "est": false,
    "note": "[LD1 p.13]; ≈ 5 USgal/h ที่ 70 % [LD8][LD14]; ≈ 8 USgal/h กำลังเต็ม [LD14]"
   },
   "tests": {
    "v": [
     {
      "case": "T-LD-31",
      "conditions": "ซิม: da40d 1,150 kg 3,000 ft idle / SL คันเร่งสุด",
      "quantity": "Vmin UP / ROC สูงสุด",
      "expected": "55.9 / 550 (ค่าประมาณ)",
      "tolerance": "±5 kt / ±100 fpm",
      "unit": "KCAS / fpm",
      "origin": "[LD8][LD14]; Vmin ±5 kt = Part 60 ±3 kt + ±2 kt ความไม่แน่นอนของ IAS–CAS (gap 12)",
      "current_model": "55.3 / 565",
      "pass": true
     },
     {
      "case": "T-LD-32",
      "conditions": "ซิม: da40d 1,150 kg SL ISA แฟลป T/O VR ≈ 62 KCAS",
      "quantity": "ระยะถึง 50 ft",
      "expected": 640,
      "tolerance": "±10 % (64 m; ผู้เขียนตั้ง)",
      "unit": "m",
      "origin": "[LD8]",
      "current_model": 577,
      "pass": true
     },
     {
      "case": "T-LD-33",
      "conditions": "วันร้อนที่ดอนเมือง 35 °C SL, da40d 1,150 kg แฟลป T/O",
      "quantity": "ระยะถึง 50 ft = 640 × 1/(σ·σ^⅓)",
      "expected": 700,
      "tolerance": "±10 % (ค่าประมาณ)",
      "unit": "m",
      "origin": "[LD8] สเกลด้วย σ; ค่าประมาณ",
      "current_model": 613,
      "pass": false
     },
     {
      "case": "T-LD-34",
      "conditions": "da40d 1,150 kg, SL ISA, คันเร่งสุด บินระดับ (quasi-steady)",
      "quantity": "ความเร็วสูงสุด",
      "expected": 125,
      "tolerance": "±5 kt (ค่าประมาณจากนักบิน ~130 KIAS ที่ความสูง)",
      "unit": "KTAS",
      "origin": "[LD14] (ต่ำ)",
      "current_model": 103,
      "pass": false
     },
     {
      "case": "T-LD-37",
      "conditions": "บัตรที่ merge แล้วของ da40ng, da40_180, da40d (รุ่นย่อยรับค่าจาก NG ผ่าน _inherits)",
      "quantity": "propeller.identity.diameter = interference.slipstream.diskDiameter; controls.surfaces.* travel = controls.pitch/yaw.stops",
      "expected": "เท่ากันทุก id",
      "tolerance": "ตรงทุกค่า",
      "unit": "-",
      "origin": "[LD1 p.5, 7, 13–14, 27, 29]",
      "current_model": "da40ng: D 1.9/1.9 m, elev 21/17 vs 21/17, rud 24/26 vs 24/26; da40_180: D 1.8/1.8 m, elev 18/16 vs 18/16, rud 29/31 vs 29/31; da40d: D 1.87/1.87 m, elev 23/15 vs 23/15, rud 29/31 vs 29/31",
      "pass": true
     },
     {
      "case": "T-LD-40",
      "conditions": "ซิม: da40d 1,150 kg (MTOM), SL ISA, คันเร่งสุด, แฟลป UP, กวาด IAS ทีละ 0.25 kt จาก 1.03 VS1 (ld_vx.mjs)",
      "quantity": "Vx (ความเร็วที่มุมไต่สูงสุด)",
      "expected": 66.5,
      "tolerance": 4,
      "unit": "KCAS",
      "origin": "ค่าประมาณ: k·VS1 = 1.19 × 55.9 KCAS (= 66 KIAS); k เฉลี่ยจาก POH C172S/C172R/C152 [LC1][LE2][LF1]; AFM ไม่ให้ Vx [LD17]; ความเร็วไต่แฟลป T/O ของ AFM 66 KIAS = 67.4 KCAS เทียบ k·VS(T/O) 65.7 KCAS; ±4 kt = ช่วง k (±1 kt) + ความไม่แน่นอนของ VS1 (gap 12)",
      "current_model": "59.5 (γmax 5.06°)",
      "pass": false
     },
     {
      "case": "T-LD-41",
      "conditions": "stall ปีกระดับ idle ลด 1 kt/s แฟลป UP ที่ training_mass (NG 1,150 / 180 1,050 / D 1,060 kg) แล้วแก้ตามวิธีมาตรฐาน: ลดมุมปะทะ คันเร่งเต็ม ปีกระดับ ดึงกลับสู่การไต่",
      "quantity": "ความสูงที่เสียจากเริ่ม stall ถึงอัตราจมเป็นศูนย์ (da40ng / da40_180 / da40d)",
      "expected": "240 / 180 / 190",
      "tolerance": "±35 % (ช่วง c ของคลาส)",
      "unit": "ft",
      "origin": "ค่าประมาณ Δh = c·VS1² (KCAS), c เฉลี่ย 0.0646 จาก C172S 230 ft [LC2], C152 160 ft [LF1], P2006T 180 ft [LG5] (ช่วง 0.0426–0.0819); AFM ที่อ่านได้ไม่ระบุ",
      "current_model": "ไม่รองรับในซิมวันนี้ (ไม่มีลำดับแก้ stall อัตโนมัติและ evaluator ไม่วัดความสูงที่เสีย)",
      "pass": null
     },
     {
      "case": "T-LD-42",
      "conditions": "บัตรที่ merge แล้วของ 3 id: speeds.VREF_kt / VAPP_kt, speeds.approach_table (แถว LDG), airframe.weights.training_mass",
      "quantity": "VAPP = approach_table ที่ training_mass; VAPP ≥ VREF; empty + crew + fuel = kg",
      "expected": "เป็นจริงทุก id",
      "tolerance": "±0.5 kt / ±2 kg",
      "unit": "kt IAS, kg",
      "origin": "D1, D3 (critic-r2); [LD3][LD6 p.4A-34][LD8]",
      "current_model": "da40ng: 1150 kg → ตาราง 74 KIAS, VREF 74 / VAPP 74; 903 + 170 + 77 = 1150 kg; da40_180: 1050 kg → ตาราง 65.2 KIAS, VREF 65 / VAPP 65; 792 + 170 + 88 = 1050 kg; da40d: 1060 kg → ตาราง 65.6 KIAS, VREF 66 / VAPP 66; 830 + 170 + 60 = 1060 kg",
      "pass": true
     },
     {
      "case": "T-LD-43",
      "conditions": "เครื่องที่ MTOM (NG 1,310 / 180 1,200 / D 1,150 kg), CG อ้างอิง, cruise trim (NG 110, รุ่นเดิม 100 KCAS) 3,000 ft, ดึงถึง limit load factor 3.8 g (normal category)",
      "quantity": "แรงดึงคันต่อ g (Fs/g) da40ng / da40_180 / da40d",
      "expected": "≥ 33 / ≥ 30 / ≥ 29",
      "tolerance": "ขั้นต่ำตามข้อกำหนด (ไม่มี tolerance)",
      "unit": "N/g",
      "origin": "14 CFR 23.155(a)(2) ก่อน Amdt 64 [LD12]: แรงดึงถึง n limit ≥ max(W/140 lb, 15 lb) = 20.6 / 18.9 / 18.1 lbf; หาร (n − 1) = 2.8; ค่าประมาณจากโมเดล hinge รอบที่ 1 กับพารามิเตอร์บัตร (controls.pitch.*) = 21.1 / 19.2 / 18.6 N/g ต่ำกว่าเกณฑ์ (ค่า Chδ/gearing ของรอบที่ 1 ต่ำไปสำหรับ DA40)",
      "current_model": "ไม่รองรับในซิมวันนี้ (ซิมไม่มีโมเดลแรงที่คัน: DIRECT สั่งมุม elevator ตรง)",
      "pass": null
     },
     {
      "case": "T-LD-44",
      "conditions": "เครื่องที่ training_mass, trim ด้วย tab ที่ VAPP แฟลป LDG 300 m และที่ cruise 3,000 ft แล้วเปลี่ยนความเร็ว ±1 kt (tab คงที่)",
      "quantity": "ความชันแรงคันต่อความเร็ว approach / cruise (ดึงเมื่อช้าลง = บวก)",
      "expected": "0.401 / 0.266; 0.396 / 0.262; 0.394 / 0.264",
      "tolerance": "±50 % (ค่าประมาณ) และต้อง > 0",
      "unit": "N/kt",
      "origin": "ค่าประมาณจากโมเดล hinge รอบที่ 1 กับพารามิเตอร์บัตร (ld_stickforce.mjs); 14 CFR 23.173(a) ต้องดึงเมื่อช้ากว่าความเร็ว trim [LD12]; เครื่องฝึกรอบที่ 1 0.63 N/kt ที่ 95 kt [R1:V10]",
      "current_model": "ไม่รองรับในซิมวันนี้ (ไม่มีโมเดลแรงที่คัน)",
      "pass": null
     }
    ],
    "u": "ตามช่อง unit ของแต่ละแถว",
    "scope": "aircraft",
    "src": [
     "LM0",
     "LD1",
     "LD2",
     "LD3",
     "LD4",
     "LD6",
     "LD8",
     "R1:V10"
    ],
    "conf": "กลาง",
    "est": false,
    "note": "แถวเดียวกับตาราง T-LD ใน §05.11 ที่ตรวจ da40d (scripts/ld_tests.mjs 2026-11-19 → out/ld_tests.json → ld_json.mjs); expected มาจากแหล่งในช่อง origin (แถวที่ผู้เขียนประมาณเองระบุวิธีไว้ในช่องนั้น); current_model = บัตรนี้ในฟิสิกส์ของซิม commit cabf0f0; pass null = ไม่รองรับในซิมวันนี้; ผ่าน 4 ไม่ผ่าน 3 n.a. 3 จาก 10 แถว"
   }
  }
 }
}
```

```json
{
 "da40d": {
  "propulsion": {
   "layout": {
    "v": [
     {
      "id": 1,
      "pos": [
       2.22,
       0,
       0.05
      ],
      "axis": [
       1,
       0,
       0
      ],
      "type": "piston",
      "model": "TAE 125-02-99",
      "prop_sense": 1
     }
    ],
    "u": "m FRD",
    "scope": "aircraft",
    "src": [
     "LD1"
    ],
    "conf": "ต่ำ",
    "est": true,
    "note": "ตำแหน่งดุมใช้ของ NG (ค่าประมาณ)"
   },
   "legacy": {
    "v": {
     "P": 99000,
     "eta": 1.0061,
     "T0": 3460,
     "idle": 0
    },
    "u": "-",
    "scope": "engine",
    "src": [
     "LM0",
     "LD4",
     "LD6"
    ],
    "conf": "ต่ำ",
    "est": true,
    "note": "ค่าประมาณ lm_legacy_fit static (da40d): T0 = 1.174 × แรงขับสถิตโมเมนตัม×FM 0.623 (สัดส่วนเดียวกับ iteration ของ NG §05.9) แล้วหา Vc = 28.8 m/s ให้ ROC ตรงเป้า; eta_sim 1.0061 (> 0.95: พารามิเตอร์รูปทรง ดู §05.12)"
   }
  }
 }
}
```

```json
{
 "da40d": {
  "piston": {
   "identity": {
    "v": {
     "model": "TAE 125-02-99 (เดิม TAE 125-01)",
     "kind": "turbo_diesel",
     "displacement_L": 1.991,
     "cylinders": 4,
     "tcds": "EASA E.055"
    },
    "u": "-",
    "scope": "engine",
    "src": [
     "LD11",
     "LD1"
    ],
    "conf": "สูง",
    "est": false,
    "note": "TAE 125-01: 1.689 l น้ำหนักแห้ง 134 kg; TAE 125-02-99: 1.991 l น้ำหนักแห้ง 153 kg; เกียร์ทด 1:1.689 ทั้งสองรุ่น [LD11 p.6]; เปลี่ยน -01 เป็น -02-99 ด้วย MÄM 40-256 + OSB D4-061 [LD1 p.17]"
   },
   "ratings": {
    "v": {
     "P_rated": 99000,
     "rpm_rated": 2300,
     "P_mcp": 99000,
     "rpm_mcp": 2300,
     "rpm_redline": 2300,
     "rpm_overspeed": null,
     "rpm_idle": null,
     "takeoff_time_limit_s": null
    },
    "u": "W, rpm (ใบพัด)",
    "scope": "engine",
    "src": [
     "LD11",
     "LD1",
     "LD8"
    ],
    "conf": "สูง",
    "est": false,
    "note": "99 kW (133 hp; ผู้ผลิตเรียก 135 hp ซึ่งเป็นแรงม้าเมตริก PS) ที่ 3,900 rpm เพลาข้อเหวี่ยง ≈ 2,300 rpm ใบพัด ทั้ง take-off และต่อเนื่อง [LD11][LD8]; TCDS เครื่องบินจำกัด 2,300 rpm ใบพัด [LD1 p.12]"
   },
   "altitude": {
    "v": {
     "model": "table",
     "critical_alt_m": 1830,
     "max_operating_alt_m": 5000,
     "table": {
      "axes": {
       "h_ft": [
        0,
        6000,
        8000,
        10000,
        16000
       ]
      },
      "data": [
       1,
       1,
       0.9,
       0.8,
       0.7
      ]
     }
    },
    "u": "-, ft, สัดส่วนกำลังสูงสุด",
    "scope": "engine",
    "src": [
     "LD14",
     "LD5"
    ],
    "conf": "ต่ำ",
    "est": true,
    "note": "ค่าประมาณ: นักบินอ่านจากกราฟ AFM ของรุ่น 1.7 l ว่ากำลังสูงสุดได้ 100 % ถึง FL60, 90 % ที่ FL80, 80 % ที่ FL100 และคง 70 % ได้ถึง FL160 [LD14] (เทอร์โบที่คงกำลังได้ถึงราว 6,000 ft ไม่ใช่ flat-rated ถึงระดับสูงแบบ AE300 ตามที่ฉบับแรกตั้งไว้); ใช้กับ -02-99 จนกว่าจะได้ AFM บท 5; ความสูงสาธิต 5,000 m [LD5]"
   },
   "power_map": {
    "v": {
     "axes": {
      "load_pct": [
       0,
       100
      ]
     },
     "data": [
      0,
      99000
     ]
    },
    "u": "W",
    "scope": "engine",
    "src": [
     "LD8"
    ],
    "conf": "กลาง",
    "est": true,
    "note": "FADEC: กำลัง = load % × 99 kW (เชิงเส้น ค่าประมาณ)"
   },
   "fuel": {
    "v": {
     "fuel": "Jet A-1",
     "bsfc_g_per_kWh": {
      "70": 218,
      "100": 245
     },
     "ff_table": [
      [
       70,
       18.9
      ],
      [
       100,
       30.3
      ]
     ]
    },
    "u": "g/kWh, [load %, l/h]",
    "scope": "engine",
    "src": [
     "LD8",
     "LD14"
    ],
    "conf": "ต่ำ",
    "est": true,
    "note": "ค่าประมาณ: BSFC คำนวณจากอัตราสิ้นเปลืองที่นักบินรายงาน × 0.80 kg/l"
   },
   "fadec": {
    "v": {
     "lever_to_load": "load % = 100 × lever (single power lever)",
     "rpm_schedule": [
      [
       100,
       2300
      ]
     ]
    },
    "u": "[load %, rpm]",
    "scope": "engine",
    "src": [
     "LD8"
    ],
    "conf": "ต่ำ",
    "est": false,
    "note": "FADEC คันเดียวคุมทั้งกำลังและรอบ; ยืนยันได้เฉพาะ 2,300 rpm ที่ 100 % [LD8]"
   }
  }
 }
}
```

```json
{
 "da40d": {
  "propeller": {
   "identity": {
    "model": {
     "v": "MT-Propeller MTV-6-A/187-129",
     "u": "-",
     "scope": "propeller",
     "src": [
      "LD1"
     ],
     "conf": "สูง",
     "est": false,
     "note": "[LD1 p.12–13]"
    },
    "diameter": {
     "v": 1.87,
     "u": "m",
     "scope": "propeller",
     "src": [
      "LD1"
     ],
     "conf": "สูง",
     "est": false,
     "note": "1,870 mm [LD1 p.13]"
    }
   },
   "engineInterface": {
    "maxShaftPower": {
     "v": 99,
     "u": "kW",
     "scope": "propeller",
     "src": [
      "LD11"
     ],
     "conf": "สูง",
     "est": false,
     "note": "[LD11 p.6]"
    },
    "rpmGoverned": {
     "v": 2300,
     "u": "rpm",
     "scope": "propeller",
     "src": [
      "LD1",
      "LD11"
     ],
     "conf": "สูง",
     "est": false,
     "note": "take-off และต่อเนื่อง 2,300 rpm ใบพัด [LD1 p.12]; 3,900 rpm เพลาข้อเหวี่ยง / 1.689 [LD11 p.6]"
    },
    "rpmTransientLimit": {
     "v": 2500,
     "u": "rpm",
     "scope": "propeller",
     "src": [
      "LD2"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: ไม่ได้เปิด AFM DA 40 D บท 2 จึงใช้ค่า overspeed ของ NG (2,500 rpm ≤ 20 s [LD2 p.2-6]) ที่ใบพัด MTV-6 รับได้ [LD9 p.8]"
    },
    "gearRatio": {
     "v": 1.689,
     "u": "-",
     "scope": "propeller",
     "src": [
      "LD11"
     ],
     "conf": "สูง",
     "est": false,
     "note": "เกียร์ทด 1:1.689 [LD11 p.6]"
    }
   },
   "governor": {
    "betaFlightIdle": {
     "v": 12,
     "u": "deg @0.75R",
     "scope": "propeller",
     "src": [
      "LD1"
     ],
     "conf": "สูง",
     "est": false,
     "note": "low pitch 12° [LD1 p.13]"
    },
    "betaHigh": {
     "v": 28,
     "u": "deg @0.75R",
     "scope": "propeller",
     "src": [
      "LD1"
     ],
     "conf": "สูง",
     "est": false,
     "note": "high pitch 28° [LD1 p.13]"
    },
    "rpmOverspeed": {
     "v": 2500,
     "u": "rpm",
     "scope": "propeller",
     "src": [
      "LD2",
      "LD9"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: ใช้ค่า overspeed ของ NG เพราะไม่ได้เปิด AFM DA 40 D บท 2"
    }
   },
   "checks": {
    "staticThrustISA": {
     "v": 2.95,
     "u": "kN",
     "scope": "propeller",
     "src": [
      "LM0"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: โมเมนตัม 4.04 kN × FM^(2/3) ด้วย FM 0.623 ของ BEM ใบพัด NG"
    },
    "staticThrustVTBD31C": {
     "v": 2.89,
     "u": "kN",
     "scope": "propeller",
     "src": [
      "LM0"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ 31 °C: เครื่อง flat-rated กำลังคงที่ แรงขับ ∝ σ^(1/3)"
    },
    "momentumIdealStaticISA": {
     "v": 4.04,
     "u": "kN",
     "scope": "propeller",
     "src": [
      "LM0"
     ],
     "conf": "กลาง",
     "est": false,
     "note": "(P² · 2ρA)^(1/3), D 1.87 m, 99 kW"
    }
   }
  }
 }
}
```

```json
{
 "da40d": {
  "aero": {
   "ref": {
    "S": {
     "v": 13.54,
     "u": "m2",
     "scope": "aircraft",
     "src": [
      "LD6"
     ],
     "conf": "สูง",
     "est": false,
     "note": "พื้นที่อ้างอิง = พื้นที่ปีก AFM รุ่นเดิม"
    },
    "b": {
     "v": 11.94,
     "u": "m",
     "scope": "aircraft",
     "src": [
      "LD6"
     ],
     "conf": "สูง",
     "est": false,
     "note": ""
    },
    "c": {
     "v": 1.121,
     "u": "m",
     "scope": "aircraft",
     "src": [
      "LD6"
     ],
     "conf": "สูง",
     "est": false,
     "note": "MAC"
    }
   },
   "static_long": {
    "CLmax_target": {
     "v": {
      "UP": 1.562,
      "T/O": 1.602,
      "LDG": 1.693
     },
     "u": "-",
     "scope": "aircraft",
     "src": [
      "LD8",
      "LD6",
      "LM2"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: CLmax 1 g ที่ 1,150 kg จาก VS 52/51/49 KIAS → 55.9/55.2/53.7 KCAS (ld_iascas รุ่นเดิม) ด้วย clmaxFromStall (min, n_z 0.95)"
    }
   },
   "flaps": {
    "detents": {
     "v": [
      {
       "name": "UP",
       "flap_deg": 0,
       "VFE_kt": null,
       "dCL0": 0,
       "dCD0": 0,
       "dCm0": 0,
       "CLmax": 1.562
      },
      {
       "name": "T/O",
       "flap_deg": 20,
       "VFE_kt": 108,
       "dCL0": 0.52,
       "dCD0": 0.008,
       "dCm0": -0.06,
       "CLmax": 1.602
      },
      {
       "name": "LDG",
       "flap_deg": 42,
       "VFE_kt": 91,
       "dCL0": 0.75,
       "dCD0": 0.035,
       "dCm0": -0.1,
       "CLmax": 1.693
      }
     ],
     "u": "-",
     "scope": "aircraft",
     "src": [
      "LD1",
      "LD6",
      "LM10"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: มุมแฟลปเท่ากับ NG [LD1 p.7]; VFE รุ่นเดิม 108/91 KIAS; dCL0/dCD0/dCm0 ใช้ของ NG (แฟลปเดียวกัน); CLmax จาก VS รุ่นเดิม (ดู CLmax_target)"
    }
   },
   "legacy": {
    "v": {
     "CL0": 0.34,
     "CLa": 5.45,
     "CLflap": 0.75,
     "CDflap": 0.035,
     "CDgear": 0,
     "Cm0": 0.02,
     "Cma": -1.6,
     "Cmflap": -0.1,
     "aStall": 17.68,
     "aStallFlap": -6.58,
     "CD0": 0.06303,
     "K": 0.0702
    },
    "u": "-",
    "scope": "aircraft",
    "src": [
     "LM0",
     "LD6"
    ],
    "conf": "ต่ำ",
    "est": true,
    "note": "ค่าประมาณ lm_legacy_fit (da40d): polar ของซิมจากการร่อนของรุ่นนี้; aStall/aStallFlap แก้หาให้ CLmax 1 g = 1.562 (UP) / 1.693 (LDG); ค่าอื่นจาก NG"
   }
  }
 }
}
```

```json
{
 "da40d": {
  "controls": {
   "surfaces": {
    "elevator": {
     "v": {
      "travel_deg": {
       "up": 23,
       "down": 15
      },
      "tol": {
       "up": "±1",
       "down": "±1"
      },
      "rate_dps": null,
      "actuator_tau_s": null
     },
     "u": "deg",
     "scope": "aircraft",
     "src": [
      "LD1"
     ],
     "conf": "สูง",
     "est": false,
     "note": "มาตรฐาน; ถังพิสัยไกล 23/16° [LD1 p.14–15]"
    },
    "rudder": {
     "v": {
      "travel_deg": {
       "left": 29,
       "right": 31
      },
      "tol": "±1",
      "rate_dps": null,
      "actuator_tau_s": null
     },
     "u": "deg",
     "scope": "aircraft",
     "src": [
      "LD1"
     ],
     "conf": "สูง",
     "est": false,
     "note": "มาตรฐาน; ถังพิสัยไกลหรือ rudder ใหญ่ 24/26° [LD1 p.14–15]"
    }
   },
   "pitch": {
    "stops": {
     "v": {
      "teu": 23,
      "ted": 15
     },
     "u": "deg",
     "scope": "aircraft",
     "src": [
      "LD1"
     ],
     "conf": "สูง",
     "est": false,
     "note": "มาตรฐาน 23/15° (ถังพิสัยไกล 23/16°) [LD1 p.14]"
    },
    "derived_check": {
     "v": {
      "mass_kg": 1060,
      "Fs_per_g_N": {
       "approach": 17.7,
       "cruise": 17.4
      },
      "grad_N_per_kt": {
       "approach": 0.394,
       "cruise": 0.264
      },
      "at_kcas": {
       "approach": 67,
       "cruise": 100
      },
      "SM_fixed": 0.294,
      "SM_free": 0.226,
      "free_elevator_factor": 0.82,
      "mtom": {
       "mass_kg": 1150,
       "Fs_per_g_N": 18.6,
       "pull_to_nL_lbf": 11.7,
       "cfr23_155_min_lbf": 18.1
      }
     },
     "u": "N/g, N/kt, MAC",
     "scope": "aircraft",
     "src": [
      "LD12",
      "LD15",
      "LM0"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ (scripts/ld_stickforce.mjs, gap 18): สมการ elevator แบบ reversible ของรอบที่ 1 §6 (trim เชิงเส้น + Ch = Ch0 + Chα·αt + Chδ·δe + Chtab·δtab, F = G·ηt·q·Se·ce·Ch) กับ controls.pitch.* ของบัตรนี้ ที่ training_mass 1060 kg; ที่ MTOM 1150 kg แรงดึงถึง 3.8 g = 11.7 lbf (52 N) ต่ำกว่าขั้นต่ำ 14 CFR 23.155(a)(2) 18.1 lbf [LD12] แสดงว่า Chδ และ gearing ที่ยกมาจากรอบที่ 1 ต่ำไปสำหรับ DA40 (เครื่องจริงผ่านการรับรอง) เป้าของโมเดลแรงที่คันในอนาคตคือ Fs/g ≥ 28.8 N/g ที่ MTOM (T-LD-43) และความชันต่อความเร็วเป็นบวก (T-LD-44); ซิมวันนี้ไม่มีโมเดลแรงที่คัน"
    }
   },
   "yaw": {
    "stops": {
     "v": {
      "left": 29,
      "right": 31,
      "max": 29
     },
     "u": "deg",
     "scope": "aircraft",
     "src": [
      "LD1"
     ],
     "conf": "สูง",
     "est": false,
     "note": "มาตรฐาน 29/31° [LD1 p.14–15]; max = min(left, right)"
    }
   }
  }
 }
}
```

```json
{
 "da40d": {
  "interference": {
   "slipstream": {
    "diskDiameter": {
     "v": 1.87,
     "u": "m",
     "scope": "propeller",
     "src": [
      "LD1"
     ],
     "conf": "สูง",
     "est": false,
     "note": "MTV-6-A/187-129 [LD1 p.13]"
    }
   },
   "groundEffect": {
    "A": {
     "v": 10.53,
     "u": "-",
     "scope": "aircraft",
     "src": [
      "LD6"
     ],
     "conf": "สูง",
     "est": false,
     "note": "AR ปีกรุ่นเดิม [LD6 p.1-6]"
    }
   }
  }
 }
}
```

```json
{
 "da40d": {
  "validation": {
   "takeoff_test": {
    "v": {
     "flap": "T/O",
     "VR_kt": 62.1,
     "theta_deg": 8
    },
    "u": "kt CAS, deg",
    "scope": "aircraft",
    "src": [
     "LD8"
    ],
    "conf": "กลาง",
    "est": true,
    "note": "ค่าประมาณ: VR 59 KIAS [LD8] → KCAS ด้วยตาราง T/O รุ่นเดิม"
   },
   "trim_targets": {
    "approach": {
     "v": {
      "ias_kt": 72,
      "h_m": 300,
      "gamma_deg": -3
     },
     "u": "kt CAS, m, deg",
     "scope": "aircraft",
     "src": [
      "LD8"
     ],
     "conf": "กลาง",
     "est": true,
     "note": "ค่าประมาณ: จุด trim/linearise ของซิมที่ MTOM 1,150 kg = speeds.approach_table 71 KIAS แฟลป LDG [LD6 p.4A-34][LD8] → KCAS ด้วยตาราง ias_cas รุ่นเดิม (ค่าประมาณ); VREF/VAPP ที่ training_mass 1,060 kg = 66 KIAS อยู่ใน speeds (D1)"
    },
    "cruise": {
     "v": {
      "ias_kt": 100,
      "h_ft": 3000,
      "gamma_deg": 0
     },
     "u": "kt CAS, ft",
     "scope": "aircraft",
     "src": [
      "LD6"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: สภาพ trim ของซิม: 100 KCAS (ไม่ใช่ 110 แบบ NG) เพราะ polar จากการร่อนใบพัดหมุนฟรีของโครงรุ่นเดิมทำให้ซิมวันนี้ต้องใช้คันเร่ง 0.96 (da40_180) และ 1.20 (da40d) ที่ 110 KCAS — ดู ld_polar_opts.mjs และ §05.12"
    }
   },
   "currentModel": {
    "performance": {
     "v": {
      "mass_kg": 1150,
      "VSR_kcas": {
       "UP": 57.3,
       "T/O": 55.8,
       "LDG": 55.1
      },
      "Vy_kt": 67.5,
      "ROC_fpm": 565,
      "glide": {
       "V_kt": 73,
       "LD": 8.8
      },
      "takeoff_m": {
       "flap": "T/O",
       "ground": 362,
       "d50ft": 577
      },
      "landing_m": {
       "asIs": 768,
       "maxBrake": 603
      },
      "trim": {
       "cruise_thr": 0.971,
       "approach_thr": 0.518
      }
     },
     "u": "kt, fpm, -, m",
     "scope": "aircraft",
     "src": [
      "LM0"
     ],
     "conf": "สูง",
     "est": false,
     "note": "ผล lm_card da40d ที่ MTOW กับซิม commit cabf0f0 (regression ของซิมวันนี้ ไม่ใช่ค่าเครื่องจริง)"
    },
    "approach": {
     "v": {
      "sp": {
       "wn": 3.352,
       "zeta": 0.589,
       "T": 2.32
      },
      "ph": {
       "wn": 0.325,
       "zeta": 0.128,
       "T": 19.509
      },
      "dr": {
       "wn": 1.541,
       "zeta": 0.233,
       "T": 4.194
      },
      "roll_tau": 0.23,
      "spiral": {
       "lam": 0.01,
       "t2": 69.852,
       "grows": true
      },
      "nAlpha": 5.501,
      "CAP": 2.043
     },
     "u": "rad/s, -, s",
     "scope": "aircraft",
     "src": [
      "LM0"
     ],
     "conf": "สูง",
     "est": false,
     "note": "โหมดเชิงเส้นของซิมวันนี้ที่ approach แฟลป LDG γ −3° (MTOW)"
    },
    "cruise": {
     "v": {
      "sp": {
       "wn": 4.621,
       "zeta": 0.573,
       "T": 1.659
      },
      "ph": {
       "wn": 0.227,
       "zeta": 0.142,
       "T": 27.967
      },
      "dr": {
       "wn": 2.104,
       "zeta": 0.24,
       "T": 3.076
      },
      "roll_tau": 0.173,
      "spiral": {
       "lam": 0.024,
       "t2": 28.638,
       "grows": true
      },
      "nAlpha": 10.607,
      "CAP": 2.013
     },
     "u": "rad/s, -, s",
     "scope": "aircraft",
     "src": [
      "LM0"
     ],
     "conf": "สูง",
     "est": false,
     "note": "โหมดเชิงเส้นของซิมวันนี้ที่ 110 KCAS 3,000 ft (MTOW)"
    }
   }
  }
 }
}
```

```json
{
 "da40d": {
  "_inherits": {
   "v": "da40ng",
   "u": "-",
   "scope": "aircraft",
   "src": [],
   "conf": "สูง",
   "est": false,
   "note": "DA 40 D (TDI) เครื่องดีเซล TAE 125 (TCDS Section B) โครงรุ่นเดิม; ค่าที่ไม่ได้ระบุในบล็อกนี้รับจาก da40ng (ดู §05.12)"
  }
 }
}
```
