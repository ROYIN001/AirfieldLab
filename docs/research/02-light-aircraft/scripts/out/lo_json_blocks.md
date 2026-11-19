```json
{
 "c172s": {
  "procedures": {
   "pattern": {
    "v": {
     "climb": 74,
     "downwind": 90,
     "abeam": 85,
     "base": 75,
     "final": 65,
     "flapsAt": {
      "abeam": "10",
      "base": "20",
      "final": "30"
     },
     "power": {
      "downwind": "2000-2200 rpm",
      "abeam": "~1500 rpm"
     }
    },
    "u": "kt IAS",
    "scope": "aircraft",
    "src": [
     "LC1",
     "LO17",
     "LO18",
     "LC2"
    ],
    "conf": "สูง",
    "est": false,
    "note": "ความเร็ว แฟลป และกำลังแต่ละขาจาก SOP ของโรงเรียน [LO17][LO18] และ Vy/Vapp จาก POH [LC1] (§09.1.3); final = speeds.VAPP_kt ของบัตร 04 (D1)"
   },
   "stabilised": {
    "v": {
     "Vapp": 65,
     "window_kt": [
      -5,
      10
     ],
     "landingFlaps": [
      "20",
      "30"
     ],
     "gearDown": false,
     "gates": [
      "imc",
      "vmc_straight_in",
      "vfr_circuit"
     ]
    },
    "u": "kt IAS",
    "scope": "aircraft",
    "src": [
     "LC1",
     "LO17",
     "LO18",
     "LC2",
     "LO4",
     "LO36"
    ],
    "conf": "กลาง",
    "est": false,
    "note": "Vapp = speeds.VAPP_kt ของบัตร c172s (ไฟล์ 04) 65 kt IAS ที่ airframe.weights.training_mass 1009.6 kg ตามข้อตัดสิน D1; รายการแฟลปลงจอดที่ยอมรับใช้ชื่อตาม aero.flaps.detents ของบัตร (D6) และเป็นข้อเสนอของหัวข้อนี้; ช่อง −5/+10 kt รอบ Vapp + ½ gust ใช้กับ common_light.procedures.stabilised_gates"
   },
   "short_field": {
    "v": {
     "takeoff": {
      "flaps": "10",
      "VR": 51,
      "V50": 56,
      "Vx": 62,
      "then": "Vy 74 หลัง 300 ft แฟลปขึ้น"
     },
     "landing": {
      "flaps": "30",
      "Vapp": 61
     }
    },
    "u": "kt IAS",
    "scope": "aircraft",
    "src": [
     "LC1",
     "LO17",
     "LO18",
     "LC2"
    ],
    "conf": "สูง",
    "est": false,
    "note": "ตัวเลขจาก POH/AFM, checklist หรือ SOP ตามแหล่งของแบบ (§09.4.2)"
   },
   "soft_field": {
    "v": {
     "takeoff": {
      "flaps": "10",
      "note": "อยู่ใน ground effect ถึง Vx 62"
     },
     "landing": {
      "flaps": "30",
      "Vapp": 65,
      "power": "คงกำลังเล็กน้อยถึงแตะพื้น"
     }
    },
    "u": "kt IAS",
    "scope": "aircraft",
    "src": [
     "LC1",
     "LO17",
     "LO18",
     "LC2"
    ],
    "conf": "สูง",
    "est": false,
    "note": "จาก SOP โรงเรียน/POH (§09.4.2)"
   },
   "go_around": {
    "v": {
     "speed": 60,
     "flapsSeq": [
      "20",
      "10",
      "0"
     ],
     "steps": [
      "full power",
      "pitch",
      "flaps 20, 60 KIAS",
      "positive rate: flaps 10",
      "50 ft clear of obstacles: 65 KIAS",
      "300 ft: flaps 0, Vy 74"
     ]
    },
    "u": "kt IAS",
    "scope": "aircraft",
    "src": [
     "LC1",
     "LO17",
     "LO18",
     "LC2",
     "LO4"
    ],
    "conf": "สูง",
    "est": false,
    "note": "ลำดับและความเร็วจาก POH (balked landing) และ SOP โรงเรียน [LC1][LO17] สอดคล้องกับ AFH [LO4 p9-11]; ชื่อแฟลปตาม aero.flaps.detents ของบัตร (D6)"
   },
   "checklist_summary": {
    "v": {
     "features": {
      "retract": false,
      "twin": false,
      "carb": false,
      "mixture": true,
      "mags": true,
      "csProp": false
     },
     "items": {
      "before_takeoff": [
       "doors",
       "controls",
       "instruments",
       "fuel",
       "mixture",
       "runup_mag",
       "trim",
       "flaps_to",
       "engine_fail_brief",
       "transponder_lights"
      ],
      "takeoff": [
       "power_full",
       "rotate",
       "climb_speed"
      ],
      "after_takeoff": [
       "flaps_up",
       "climb_power"
      ],
      "cruise": [
       "cruise_power",
       "fuel_mgmt"
      ],
      "descent": [
       "atis_qnh",
       "brief_arrival"
      ],
      "before_landing": [
       "fuel_sel",
       "mixture_rich",
       "flaps_app",
       "lights_belts",
       "landing_clearance"
      ],
      "final": [
       "stable",
       "flaps_land"
      ],
      "after_landing": [
       "flaps_up_gnd",
       "transponder_gnd"
      ],
      "emergency_efato": [
       "pitch_glide",
       "land_ahead",
       "secure"
      ]
     },
     "emergency": {
      "flapsUp": 70,
      "flapsDown": 65,
      "glide": 68
     },
     "demoCrosswind_kt": 15
    },
    "u": "- / kt IAS",
    "scope": "aircraft",
    "src": [
     "LC1",
     "LO17",
     "LO18",
     "LC2",
     "LO0"
    ],
    "conf": "กลาง",
    "est": true,
    "note": "ค่าประมาณ (การเรียบเรียง): รายการหัวข้อด้วยถ้อยคำของเรา (ข้อความไทยใน lo_lib.mjs) กรองด้วยคุณลักษณะของแบบ ไม่ใช่ checklist ของผู้ผลิต; ความเร็วฉุกเฉินและลมขวางสาธิตตามแหล่งของแบบใน §09.4.2"
   }
  }
 }
}
```

```json
{
 "c172r": {
  "procedures": {
   "pattern": {
    "v": {
     "climb": 79,
     "downwind": 90,
     "abeam": 80,
     "base": 70,
     "final": 65,
     "flapsAt": {
      "abeam": "10",
      "base": "20",
      "final": "30"
     }
    },
    "u": "kt IAS",
    "scope": "aircraft",
    "src": [
     "LO20"
    ],
    "conf": "ต่ำ",
    "est": true,
    "note": "ค่าประมาณบางขา: final = speeds.VAPP_kt ของบัตร (D1) และ climb = speeds.VY_kt ของบัตรเมื่อมี; ค่าที่มีแหล่งตาม §09.1.3 ส่วนขาที่ไม่มีแหล่งประมาณตาม §09.1.5 (base = final + 5–10; abeam = base + 5–10 ≤ VFE; downwind = 1.35–1.5 × final)"
   },
   "stabilised": {
    "v": {
     "Vapp": 65,
     "window_kt": [
      -5,
      10
     ],
     "landingFlaps": [
      "20",
      "30"
     ],
     "gearDown": false,
     "gates": [
      "imc",
      "vmc_straight_in",
      "vfr_circuit"
     ]
    },
    "u": "kt IAS",
    "scope": "aircraft",
    "src": [
     "LO20",
     "LE2",
     "LO4",
     "LO36"
    ],
    "conf": "กลาง",
    "est": false,
    "note": "Vapp = speeds.VAPP_kt ของบัตร c172r (ไฟล์ 10) 65 kt IAS ที่ airframe.weights.training_mass 998.7 kg ตามข้อตัดสิน D1; รายการแฟลปลงจอดที่ยอมรับใช้ชื่อตาม aero.flaps.detents ของบัตร (D6) และเป็นข้อเสนอของหัวข้อนี้; ช่อง −5/+10 kt รอบ Vapp + ½ gust ใช้กับ common_light.procedures.stabilised_gates"
   },
   "short_field": {
    "v": {
     "takeoff": {
      "flaps": "10",
      "V50": 57,
      "Vx": 60
     },
     "landing": {
      "flaps": "30",
      "Vapp": 62
     }
    },
    "u": "kt IAS",
    "scope": "aircraft",
    "src": [
     "LO20"
    ],
    "conf": "กลาง",
    "est": false,
    "note": "ตัวเลขจาก POH/AFM, checklist หรือ SOP ตามแหล่งของแบบ (§09.4.2)"
   },
   "soft_field": {
    "v": {
     "technique": "AFH: แฟลปตาม POH, ล้อหน้าเบา, ground effect ถึง Vx; ลงด้วยกำลังเล็กน้อยและประคองล้อหน้า",
     "ref": "LO5, LO6"
    },
    "u": "kt IAS",
    "scope": "aircraft",
    "src": [
     "LO20",
     "LO5",
     "LO6"
    ],
    "conf": "กลาง",
    "est": true,
    "note": "ค่าประมาณ: ใช้เทคนิคทั่วไปของ AFH [LO5 p9-23–9-24][LO6 p6-13] เพราะไม่มีตัวเลขเฉพาะแบบ"
   },
   "go_around": {
    "v": {
     "speed": 55,
     "flapsSeq": [
      "20",
      "10",
      "0"
     ],
     "steps": [
      "full power",
      "flaps 20",
      "55 KIAS",
      "flaps 10 จนพ้นสิ่งกีดขวาง",
      "flaps up ที่ความสูงปลอดภัยและ 60 KIAS"
     ]
    },
    "u": "kt IAS",
    "scope": "aircraft",
    "src": [
     "LO20",
     "LO4"
    ],
    "conf": "กลาง",
    "est": false,
    "note": "ลำดับและความเร็วจาก POH balked landing [LO20 Sec 4] สอดคล้องกับ AFH [LO4 p9-11]; ชื่อแฟลปตาม aero.flaps.detents ของบัตร (D6)"
   },
   "checklist_summary": {
    "v": {
     "features": {
      "retract": false,
      "twin": false,
      "carb": false,
      "mixture": true,
      "mags": true,
      "csProp": false
     },
     "items": {
      "before_takeoff": [
       "doors",
       "controls",
       "instruments",
       "fuel",
       "mixture",
       "runup_mag",
       "trim",
       "flaps_to",
       "engine_fail_brief",
       "transponder_lights"
      ],
      "takeoff": [
       "power_full",
       "rotate",
       "climb_speed"
      ],
      "after_takeoff": [
       "flaps_up",
       "climb_power"
      ],
      "cruise": [
       "cruise_power",
       "fuel_mgmt"
      ],
      "descent": [
       "atis_qnh",
       "brief_arrival"
      ],
      "before_landing": [
       "fuel_sel",
       "mixture_rich",
       "flaps_app",
       "lights_belts",
       "landing_clearance"
      ],
      "final": [
       "stable",
       "flaps_land"
      ],
      "after_landing": [
       "flaps_up_gnd",
       "transponder_gnd"
      ],
      "emergency_efato": [
       "pitch_glide",
       "land_ahead",
       "secure"
      ]
     },
     "emergency": {
      "flapsUp": 65,
      "flapsDown": 60,
      "glide": 65
     },
     "demoCrosswind_kt": 15
    },
    "u": "- / kt IAS",
    "scope": "aircraft",
    "src": [
     "LO20",
     "LO0"
    ],
    "conf": "กลาง",
    "est": true,
    "note": "ค่าประมาณ (การเรียบเรียง): รายการหัวข้อด้วยถ้อยคำของเรา (ข้อความไทยใน lo_lib.mjs) กรองด้วยคุณลักษณะของแบบ ไม่ใช่ checklist ของผู้ผลิต; ความเร็วฉุกเฉินและลมขวางสาธิตตามแหล่งของแบบใน §09.4.2"
   }
  }
 }
}
```

```json
{
 "c152": {
  "procedures": {
   "pattern": {
    "v": {
     "climb": 67,
     "downwind": 80,
     "abeam": 70,
     "base": 65,
     "final": 60,
     "flapsAt": {
      "abeam": "10",
      "base": "20",
      "final": "30"
     }
    },
    "u": "kt IAS",
    "scope": "aircraft",
    "src": [
     "LO19"
    ],
    "conf": "ต่ำ",
    "est": true,
    "note": "ค่าประมาณบางขา: final = speeds.VAPP_kt ของบัตร (D1) และ climb = speeds.VY_kt ของบัตรเมื่อมี; ค่าที่มีแหล่งตาม §09.1.3 ส่วนขาที่ไม่มีแหล่งประมาณตาม §09.1.5 (base = final + 5–10; abeam = base + 5–10 ≤ VFE; downwind = 1.35–1.5 × final)"
   },
   "stabilised": {
    "v": {
     "Vapp": 60,
     "window_kt": [
      -5,
      10
     ],
     "landingFlaps": [
      "20",
      "30"
     ],
     "gearDown": false,
     "gates": [
      "imc",
      "vmc_straight_in",
      "vfr_circuit"
     ]
    },
    "u": "kt IAS",
    "scope": "aircraft",
    "src": [
     "LO19",
     "LF1",
     "LO4",
     "LO36"
    ],
    "conf": "กลาง",
    "est": false,
    "note": "Vapp = speeds.VAPP_kt ของบัตร c152 (ไฟล์ 11) 60 kt IAS ที่ airframe.weights.training_mass 717.47 kg ตามข้อตัดสิน D1; รายการแฟลปลงจอดที่ยอมรับใช้ชื่อตาม aero.flaps.detents ของบัตร (D6) และเป็นข้อเสนอของหัวข้อนี้; ช่อง −5/+10 kt รอบ Vapp + ½ gust ใช้กับ common_light.procedures.stabilised_gates"
   },
   "short_field": {
    "v": {
     "takeoff": {
      "flaps": "10",
      "V50": 54,
      "Vx": 55,
      "then": "แฟลปขึ้นหลัง 60"
     },
     "landing": {
      "flaps": "30",
      "Vapp": 54
     }
    },
    "u": "kt IAS",
    "scope": "aircraft",
    "src": [
     "LO19"
    ],
    "conf": "กลาง",
    "est": false,
    "note": "ตัวเลขจาก POH/AFM, checklist หรือ SOP ตามแหล่งของแบบ (§09.4.2)"
   },
   "soft_field": {
    "v": {
     "technique": "AFH: แฟลปตาม POH, ล้อหน้าเบา, ground effect ถึง Vx; ลงด้วยกำลังเล็กน้อยและประคองล้อหน้า",
     "ref": "LO5, LO6"
    },
    "u": "kt IAS",
    "scope": "aircraft",
    "src": [
     "LO19",
     "LO5",
     "LO6"
    ],
    "conf": "กลาง",
    "est": true,
    "note": "ค่าประมาณ: ใช้เทคนิคทั่วไปของ AFH [LO5 p9-23–9-24][LO6 p6-13] เพราะไม่มีตัวเลขเฉพาะแบบ"
   },
   "go_around": {
    "v": {
     "speed": 55,
     "flapsSeq": [
      "20",
      "0"
     ],
     "steps": [
      "full throttle",
      "carb heat cold",
      "flaps 20",
      "55 KIAS",
      "flaps up slowly"
     ]
    },
    "u": "kt IAS",
    "scope": "aircraft",
    "src": [
     "LO19",
     "LO4"
    ],
    "conf": "กลาง",
    "est": false,
    "note": "ลำดับและความเร็วจาก POH balked landing [LO19 p4-3, 4-9] สอดคล้องกับ AFH [LO4 p9-11]; ชื่อแฟลปตาม aero.flaps.detents ของบัตร (D6)"
   },
   "checklist_summary": {
    "v": {
     "features": {
      "retract": false,
      "twin": false,
      "carb": true,
      "mixture": true,
      "mags": true,
      "csProp": false
     },
     "items": {
      "before_takeoff": [
       "doors",
       "controls",
       "instruments",
       "fuel",
       "mixture",
       "runup_mag",
       "carb_heat_check",
       "trim",
       "flaps_to",
       "engine_fail_brief",
       "transponder_lights"
      ],
      "takeoff": [
       "power_full",
       "rotate",
       "climb_speed"
      ],
      "after_takeoff": [
       "flaps_up",
       "climb_power"
      ],
      "cruise": [
       "cruise_power",
       "fuel_mgmt"
      ],
      "descent": [
       "atis_qnh",
       "brief_arrival",
       "carb_heat_descent"
      ],
      "before_landing": [
       "fuel_sel",
       "mixture_rich",
       "carb_heat_on",
       "flaps_app",
       "lights_belts",
       "landing_clearance"
      ],
      "final": [
       "stable",
       "flaps_land"
      ],
      "after_landing": [
       "flaps_up_gnd",
       "transponder_gnd",
       "carb_cold"
      ],
      "emergency_efato": [
       "pitch_glide",
       "land_ahead",
       "secure"
      ]
     },
     "emergency": {
      "flapsUp": 60,
      "glide": 60
     },
     "demoCrosswind_kt": 12
    },
    "u": "- / kt IAS",
    "scope": "aircraft",
    "src": [
     "LO19",
     "LO0"
    ],
    "conf": "กลาง",
    "est": true,
    "note": "ค่าประมาณ (การเรียบเรียง): รายการหัวข้อด้วยถ้อยคำของเรา (ข้อความไทยใน lo_lib.mjs) กรองด้วยคุณลักษณะของแบบ ไม่ใช่ checklist ของผู้ผลิต; ความเร็วฉุกเฉินและลมขวางสาธิตตามแหล่งของแบบใน §09.4.2"
   }
  }
 }
}
```

```json
{
 "pa28_161": {
  "procedures": {
   "pattern": {
    "v": {
     "climb": 79,
     "downwind": 90,
     "abeam": 80,
     "base": 75,
     "final": 70,
     "flapsAt": {
      "abeam": "10",
      "base": "25",
      "final": "40"
     }
    },
    "u": "kt IAS",
    "scope": "aircraft",
    "src": [
     "LO21",
     "LO22",
     "LN4"
    ],
    "conf": "ต่ำ",
    "est": true,
    "note": "ค่าประมาณบางขา: final = speeds.VAPP_kt ของบัตร (D1) และ climb = speeds.VY_kt ของบัตรเมื่อมี; ค่าที่มีแหล่งตาม §09.1.3 ส่วนขาที่ไม่มีแหล่งประมาณตาม §09.1.5 (base = final + 5–10; abeam = base + 5–10 ≤ VFE; downwind = 1.35–1.5 × final)"
   },
   "stabilised": {
    "v": {
     "Vapp": 70,
     "window_kt": [
      -5,
      10
     ],
     "landingFlaps": [
      "25",
      "40"
     ],
     "gearDown": false,
     "gates": [
      "imc",
      "vmc_straight_in",
      "vfr_circuit"
     ]
    },
    "u": "kt IAS",
    "scope": "aircraft",
    "src": [
     "LO21",
     "LO22",
     "LN4",
     "LN2",
     "LO4",
     "LO36"
    ],
    "conf": "กลาง",
    "est": false,
    "note": "Vapp = speeds.VAPP_kt ของบัตร pa28_161 (ไฟล์ 13) 70 kt IAS ที่ airframe.weights.training_mass 930 kg ตามข้อตัดสิน D1; รายการแฟลปลงจอดที่ยอมรับใช้ชื่อตาม aero.flaps.detents ของบัตร (D6) และเป็นข้อเสนอของหัวข้อนี้; ช่อง −5/+10 kt รอบ Vapp + ½ gust ใช้กับ common_light.procedures.stabilised_gates"
   },
   "short_field": {
    "v": {
     "takeoff": {
      "flaps": "25",
      "VR": 52,
      "Vobs": 63,
      "then": 79
     },
     "landing": {
      "flaps": "40",
      "Vapp": 65
     }
    },
    "u": "kt IAS",
    "scope": "aircraft",
    "src": [
     "LO21",
     "LO22",
     "LN4"
    ],
    "conf": "กลาง",
    "est": false,
    "note": "ตัวเลขจาก POH/AFM, checklist หรือ SOP ตามแหล่งของแบบ (§09.4.2)"
   },
   "soft_field": {
    "v": {
     "takeoff": {
      "flaps": "25",
      "note": "เร่งใน ground effect"
     },
     "landing": {
      "flaps": "40",
      "Vapp": 65
     }
    },
    "u": "kt IAS",
    "scope": "aircraft",
    "src": [
     "LO21",
     "LO22",
     "LN4"
    ],
    "conf": "กลาง",
    "est": false,
    "note": "จาก SOP โรงเรียน/POH (§09.4.2)"
   },
   "go_around": {
    "v": {
     "speed": 63,
     "flapsSeq": [
      "25",
      "0"
     ],
     "steps": [
      "mixture rich",
      "full power",
      "flaps 25",
      "63 KIAS",
      "clear of obstacles 79",
      "flaps up slowly"
     ]
    },
    "u": "kt IAS",
    "scope": "aircraft",
    "src": [
     "LO21",
     "LO22",
     "LN4",
     "LO4"
    ],
    "conf": "กลาง",
    "est": false,
    "note": "ลำดับและความเร็วจาก checklist โรงเรียน [LO22] (บท 4 ของ POH ในสำเนาที่เปิดได้ขาด) สอดคล้องกับ AFH [LO4 p9-11]; ชื่อแฟลปตาม aero.flaps.detents ของบัตร (D6)"
   },
   "checklist_summary": {
    "v": {
     "features": {
      "retract": false,
      "twin": false,
      "carb": true,
      "mixture": true,
      "mags": true,
      "csProp": false
     },
     "items": {
      "before_takeoff": [
       "doors",
       "controls",
       "instruments",
       "fuel",
       "mixture",
       "runup_mag",
       "carb_heat_check",
       "trim",
       "flaps_to",
       "engine_fail_brief",
       "transponder_lights"
      ],
      "takeoff": [
       "power_full",
       "rotate",
       "climb_speed"
      ],
      "after_takeoff": [
       "flaps_up",
       "climb_power"
      ],
      "cruise": [
       "cruise_power",
       "fuel_mgmt"
      ],
      "descent": [
       "atis_qnh",
       "brief_arrival",
       "carb_heat_descent"
      ],
      "before_landing": [
       "fuel_sel",
       "mixture_rich",
       "carb_heat_on",
       "flaps_app",
       "lights_belts",
       "landing_clearance"
      ],
      "final": [
       "stable",
       "flaps_land"
      ],
      "after_landing": [
       "flaps_up_gnd",
       "transponder_gnd",
       "carb_cold"
      ],
      "emergency_efato": [
       "pitch_glide",
       "land_ahead",
       "secure"
      ]
     },
     "emergency": {
      "glide": 73,
      "shortest": 63
     },
     "demoCrosswind_kt": 17
    },
    "u": "- / kt IAS",
    "scope": "aircraft",
    "src": [
     "LO21",
     "LO22",
     "LN4",
     "LO0"
    ],
    "conf": "กลาง",
    "est": true,
    "note": "ค่าประมาณ (การเรียบเรียง): รายการหัวข้อด้วยถ้อยคำของเรา (ข้อความไทยใน lo_lib.mjs) กรองด้วยคุณลักษณะของแบบ ไม่ใช่ checklist ของผู้ผลิต; ความเร็วฉุกเฉินและลมขวางสาธิตตามแหล่งของแบบใน §09.4.2"
   }
  }
 }
}
```

```json
{
 "da40ng": {
  "procedures": {
   "pattern": {
    "v": {
     "climb": 72,
     "downwind": 95,
     "abeam": 78,
     "base": 78,
     "final": 74,
     "flapsAt": {
      "abeam": "T/O",
      "base": "T/O",
      "final": "LDG"
     }
    },
    "u": "kt IAS",
    "scope": "aircraft",
    "src": [
     "LD3",
     "LO35"
    ],
    "conf": "ต่ำ",
    "est": true,
    "note": "ค่าประมาณบางขา: final = speeds.VAPP_kt ของบัตร (D1) และ climb = speeds.VY_kt ของบัตรเมื่อมี; ค่าที่มีแหล่งตาม §09.1.3 ส่วนขาที่ไม่มีแหล่งประมาณตาม §09.1.5 (base = final + 5–10; abeam = base + 5–10 ≤ VFE; downwind = 1.35–1.5 × final)"
   },
   "stabilised": {
    "v": {
     "Vapp": 74,
     "window_kt": [
      -5,
      10
     ],
     "landingFlaps": [
      "LDG",
      "T/O"
     ],
     "gearDown": false,
     "gates": [
      "imc",
      "vmc_straight_in",
      "vfr_circuit"
     ]
    },
    "u": "kt IAS",
    "scope": "aircraft",
    "src": [
     "LD3",
     "LO35",
     "LO4",
     "LO36"
    ],
    "conf": "กลาง",
    "est": false,
    "note": "Vapp = speeds.VAPP_kt ของบัตร da40ng (ไฟล์ 05) 74 kt IAS ที่ airframe.weights.training_mass 1150 kg ตามข้อตัดสิน D1; รายการแฟลปลงจอดที่ยอมรับใช้ชื่อตาม aero.flaps.detents ของบัตร (D6) และเป็นข้อเสนอของหัวข้อนี้; ช่อง −5/+10 kt รอบ Vapp + ½ gust ใช้กับ common_light.procedures.stabilised_gates"
   },
   "short_field": {
    "v": {
     "takeoff": {
      "flaps": "T/O",
      "VR": {
       "940": 56,
       "1000": 58,
       "1100": 61,
       "1200": 65,
       "1280": 67
      },
      "V50": {
       "940": 62,
       "1000": 65,
       "1100": 67,
       "1200": 70,
       "1280": 72
      }
     },
     "landing": {
      "flaps": "LDG",
      "Vapp": {
       "940": 66,
       "1000": 68,
       "1100": 72,
       "1200": 76,
       "1280": 77
      }
     }
    },
    "u": "kt IAS",
    "scope": "aircraft",
    "src": [
     "LD3",
     "LO35"
    ],
    "conf": "กลาง",
    "est": false,
    "note": "ตัวเลขจาก POH/AFM, checklist หรือ SOP ตามแหล่งของแบบ (§09.4.2)"
   },
   "soft_field": {
    "v": {
     "technique": "AFH: แฟลปตาม POH, ล้อหน้าเบา, ground effect ถึง Vx; ลงด้วยกำลังเล็กน้อยและประคองล้อหน้า",
     "ref": "LO5, LO6"
    },
    "u": "kt IAS",
    "scope": "aircraft",
    "src": [
     "LD3",
     "LO35",
     "LO5",
     "LO6"
    ],
    "conf": "กลาง",
    "est": true,
    "note": "ค่าประมาณ: ใช้เทคนิคทั่วไปของ AFH [LO5 p9-23–9-24][LO6 p6-13] เพราะไม่มีตัวเลขเฉพาะแบบ"
   },
   "go_around": {
    "v": {
     "speed": 72,
     "flapsSeq": [
      "T/O",
      "UP"
     ],
     "steps": [
      "power MAX",
      "flaps T/O",
      "min 72 KIAS",
      "flaps UP ที่ความสูงปลอดภัย"
     ]
    },
    "u": "kt IAS",
    "scope": "aircraft",
    "src": [
     "LD3",
     "LO35",
     "LO4"
    ],
    "conf": "กลาง",
    "est": false,
    "note": "ลำดับและความเร็วจาก ความเร็ว go-around ต่ำสุดแฟลป T/O จาก checklist ของ Diamond [LD3] สอดคล้องกับ AFH [LO4 p9-11]; ชื่อแฟลปตาม aero.flaps.detents ของบัตร (D6)"
   },
   "checklist_summary": {
    "v": {
     "features": {
      "retract": false,
      "twin": false,
      "carb": false,
      "mixture": false,
      "mags": false,
      "fadec": true,
      "csProp": true
     },
     "items": {
      "before_takeoff": [
       "doors",
       "controls",
       "instruments",
       "fuel",
       "fadec_test",
       "trim",
       "flaps_to",
       "engine_fail_brief",
       "transponder_lights"
      ],
      "takeoff": [
       "power_full",
       "rotate",
       "climb_speed"
      ],
      "after_takeoff": [
       "flaps_up",
       "climb_power"
      ],
      "cruise": [
       "cruise_power",
       "fuel_mgmt"
      ],
      "descent": [
       "atis_qnh",
       "brief_arrival"
      ],
      "before_landing": [
       "fuel_sel",
       "flaps_app",
       "lights_belts",
       "landing_clearance"
      ],
      "final": [
       "stable",
       "flaps_land"
      ],
      "after_landing": [
       "flaps_up_gnd",
       "transponder_gnd"
      ],
      "emergency_efato": [
       "pitch_glide",
       "land_ahead",
       "secure"
      ]
     },
     "emergency": {
      "glide": 88
     }
    },
    "u": "- / kt IAS",
    "scope": "aircraft",
    "src": [
     "LD3",
     "LO35",
     "LO0"
    ],
    "conf": "กลาง",
    "est": true,
    "note": "ค่าประมาณ (การเรียบเรียง): รายการหัวข้อด้วยถ้อยคำของเรา (ข้อความไทยใน lo_lib.mjs) กรองด้วยคุณลักษณะของแบบ ไม่ใช่ checklist ของผู้ผลิต; ความเร็วฉุกเฉินและลมขวางสาธิตตามแหล่งของแบบใน §09.4.2"
   }
  }
 }
}
```

```json
{
 "da42ng": {
  "procedures": {
   "pattern": {
    "v": {
     "climb": 90,
     "downwind": 110,
     "abeam": 100,
     "base": 95,
     "final": 84,
     "flapsAt": {
      "abeam": "APP",
      "base": "APP",
      "final": "LDG"
     }
    },
    "u": "kt IAS",
    "scope": "aircraft",
    "src": [
     "LT2",
     "LT9",
     "LO7",
     "LO4"
    ],
    "conf": "ต่ำ",
    "est": true,
    "note": "ค่าประมาณบางขา: final = speeds.VAPP_kt ของบัตร (D1) และ climb = speeds.VY_kt ของบัตรเมื่อมี; ค่าที่มีแหล่งตาม §09.1.3 ส่วนขาที่ไม่มีแหล่งประมาณตาม §09.1.5 (base = final + 5–10; abeam = base + 5–10 ≤ VFE; downwind = 1.35–1.5 × final)"
   },
   "stabilised": {
    "v": {
     "Vapp": 84,
     "window_kt": [
      -5,
      10
     ],
     "landingFlaps": [
      "LDG",
      "APP"
     ],
     "gearDown": true,
     "gates": [
      "imc",
      "vmc_straight_in",
      "vfr_circuit"
     ]
    },
    "u": "kt IAS",
    "scope": "aircraft",
    "src": [
     "LT2",
     "LT9",
     "LO7",
     "LO4",
     "LO36"
    ],
    "conf": "ต่ำ",
    "est": false,
    "note": "Vapp = speeds.VAPP_kt ของบัตร da42ng (ไฟล์ 06) 84 kt IAS ที่ airframe.weights.training_mass 1752 kg ตามข้อตัดสิน D1; รายการแฟลปลงจอดที่ยอมรับใช้ชื่อตาม aero.flaps.detents ของบัตร (D6) และเป็นข้อเสนอของหัวข้อนี้; ช่อง −5/+10 kt รอบ Vapp + ½ gust ใช้กับ common_light.procedures.stabilised_gates"
   },
   "short_field": {
    "v": {
     "takeoff": {
      "flaps": "UP",
      "VR": 76,
      "Vx": 77,
      "Vy": 90
     },
     "landing": {
      "flaps": "LDG",
      "Vapp": 84
     }
    },
    "u": "kt IAS",
    "scope": "aircraft",
    "src": [
     "LT2",
     "LT9",
     "LO7",
     "LO4"
    ],
    "conf": "ต่ำ",
    "est": false,
    "note": "ตัวเลขจาก POH/AFM, checklist หรือ SOP ตามแหล่งของแบบ (§09.4.2)"
   },
   "soft_field": {
    "v": {
     "technique": "AFH: แฟลปตาม POH, ล้อหน้าเบา, ground effect ถึง Vx; ลงด้วยกำลังเล็กน้อยและประคองล้อหน้า",
     "ref": "LO5, LO6"
    },
    "u": "kt IAS",
    "scope": "aircraft",
    "src": [
     "LT2",
     "LT9",
     "LO7",
     "LO4",
     "LO5",
     "LO6"
    ],
    "conf": "กลาง",
    "est": true,
    "note": "ค่าประมาณ: ใช้เทคนิคทั่วไปของ AFH [LO5 p9-23–9-24][LO6 p6-13] เพราะไม่มีตัวเลขเฉพาะแบบ"
   },
   "go_around": {
    "v": {
     "speed": 90,
     "flapsSeq": [
      "APP",
      "UP"
     ],
     "steps": [
      "power MAX ทั้งสอง",
      "flaps APP",
      "pitch Vy",
      "positive rate: gear up",
      "flaps UP"
     ]
    },
    "u": "kt IAS",
    "scope": "aircraft",
    "src": [
     "LT2",
     "LT9",
     "LO7",
     "LO4"
    ],
    "conf": "ต่ำ",
    "est": true,
    "note": "ค่าประมาณ: ลำดับทั่วไปของ AFH [LO4 p9-11, 9-12] (กำลังเต็ม → ท่าไต่ → แฟลปทีละขั้น → ล้อขึ้นเมื่อไต่ได้แน่นอน); ความเร็ว 90 KIAS จาก Vy/VY ของบัตรหรือแหล่งของแบบนั้น; ชื่อแฟลปตาม aero.flaps.detents ของบัตร (D6)"
   },
   "checklist_summary": {
    "v": {
     "features": {
      "retract": true,
      "twin": true,
      "carb": false,
      "mixture": false,
      "mags": false,
      "fadec": true,
      "csProp": true
     },
     "items": {
      "before_takeoff": [
       "doors",
       "controls",
       "instruments",
       "fuel",
       "fadec_test",
       "trim",
       "flaps_to",
       "oei_brief",
       "transponder_lights"
      ],
      "takeoff": [
       "power_full",
       "rotate",
       "climb_speed"
      ],
      "after_takeoff": [
       "gear_up",
       "flaps_up",
       "climb_power"
      ],
      "cruise": [
       "cruise_power",
       "fuel_mgmt"
      ],
      "descent": [
       "atis_qnh",
       "brief_arrival"
      ],
      "before_landing": [
       "fuel_sel",
       "gear_down",
       "flaps_app",
       "lights_belts",
       "landing_clearance"
      ],
      "final": [
       "gear_recheck",
       "stable",
       "flaps_land"
      ],
      "after_landing": [
       "flaps_up_gnd",
       "transponder_gnd"
      ],
      "emergency_efato": [
       "control_vyse",
       "power_max",
       "clean_up",
       "identify_verify",
       "feather_secure"
      ]
     },
     "emergency": {
      "VMCA": 76,
      "VYSE": 85,
      "sequence": "AFH: control, VYSE, power, clean up, identify, verify, feather, secure"
     }
    },
    "u": "- / kt IAS",
    "scope": "aircraft",
    "src": [
     "LT2",
     "LT9",
     "LO7",
     "LO4",
     "LO0"
    ],
    "conf": "กลาง",
    "est": true,
    "note": "ค่าประมาณ (การเรียบเรียง): รายการหัวข้อด้วยถ้อยคำของเรา (ข้อความไทยใน lo_lib.mjs) กรองด้วยคุณลักษณะของแบบ ไม่ใช่ checklist ของผู้ผลิต; ความเร็วฉุกเฉินและลมขวางสาธิตตามแหล่งของแบบใน §09.4.2"
   }
  }
 }
}
```

```json
{
 "da40_180": {
  "procedures": {
   "pattern": {
    "v": {
     "climb": 67,
     "downwind": 95,
     "abeam": 80,
     "base": 75,
     "final": 65,
     "flapsAt": {
      "abeam": "T/O",
      "base": "T/O",
      "final": "LDG"
     }
    },
    "u": "kt IAS",
    "scope": "aircraft",
    "src": [
     "LD6",
     "LD8",
     "LD1",
     "LD4"
    ],
    "conf": "ต่ำ",
    "est": true,
    "note": "ค่าประมาณบางขา: final = speeds.VAPP_kt ของบัตร (D1) และ climb = speeds.VY_kt ของบัตรเมื่อมี; ค่าที่มีแหล่งตาม §09.1.3 ส่วนขาที่ไม่มีแหล่งประมาณตาม §09.1.5 (base = final + 5–10; abeam = base + 5–10 ≤ VFE; downwind = 1.35–1.5 × final)"
   },
   "stabilised": {
    "v": {
     "Vapp": 65,
     "window_kt": [
      -5,
      10
     ],
     "landingFlaps": [
      "LDG",
      "T/O"
     ],
     "gearDown": false,
     "gates": [
      "imc",
      "vmc_straight_in",
      "vfr_circuit"
     ]
    },
    "u": "kt IAS",
    "scope": "aircraft",
    "src": [
     "LD6",
     "LD8",
     "LD1",
     "LD4",
     "LO4",
     "LO36"
    ],
    "conf": "กลาง",
    "est": false,
    "note": "Vapp = speeds.VAPP_kt ของบัตร da40_180 (ไฟล์ 05) 65 kt IAS ที่ airframe.weights.training_mass 1050 kg ตามข้อตัดสิน D1; รายการแฟลปลงจอดที่ยอมรับใช้ชื่อตาม aero.flaps.detents ของบัตร (D6) และเป็นข้อเสนอของหัวข้อนี้; ช่อง −5/+10 kt รอบ Vapp + ½ gust ใช้กับ common_light.procedures.stabilised_gates"
   },
   "short_field": {
    "v": {
     "landing": {
      "Vapp": 65,
      "note": "ไม่มีขั้นตอน short field ในแหล่งที่อ่านได้"
     }
    },
    "u": "kt IAS",
    "scope": "aircraft",
    "src": [
     "LD6",
     "LD8",
     "LD1",
     "LD4"
    ],
    "conf": "ต่ำ",
    "est": true,
    "note": "ค่าประมาณ: ใช้ Vapp ของบัตร (D1) เพราะไม่มีขั้นตอน short field เฉพาะแบบในแหล่งที่อ่านได้"
   },
   "soft_field": {
    "v": {
     "technique": "AFH: แฟลปตาม POH, ล้อหน้าเบา, ground effect ถึง Vx; ลงด้วยกำลังเล็กน้อยและประคองล้อหน้า",
     "ref": "LO5, LO6"
    },
    "u": "kt IAS",
    "scope": "aircraft",
    "src": [
     "LD6",
     "LD8",
     "LD1",
     "LD4",
     "LO5",
     "LO6"
    ],
    "conf": "กลาง",
    "est": true,
    "note": "ค่าประมาณ: ใช้เทคนิคทั่วไปของ AFH [LO5 p9-23–9-24][LO6 p6-13] เพราะไม่มีตัวเลขเฉพาะแบบ"
   },
   "go_around": {
    "v": {
     "speed": 67,
     "flapsSeq": [
      "T/O",
      "UP"
     ],
     "steps": [
      "full power, mixture rich, prop high rpm",
      "flaps T/O",
      "pitch 67 KIAS",
      "flaps UP ที่ความสูงปลอดภัย"
     ]
    },
    "u": "kt IAS",
    "scope": "aircraft",
    "src": [
     "LD6",
     "LD8",
     "LD1",
     "LD4",
     "LO4"
    ],
    "conf": "ต่ำ",
    "est": true,
    "note": "ค่าประมาณ: ลำดับทั่วไปของ AFH [LO4 p9-11, 9-12] (กำลังเต็ม → ท่าไต่ → แฟลปทีละขั้น → ล้อขึ้นเมื่อไต่ได้แน่นอน); ความเร็ว 67 KIAS จาก Vy/VY ของบัตรหรือแหล่งของแบบนั้น; ชื่อแฟลปตาม aero.flaps.detents ของบัตร (D6)"
   },
   "checklist_summary": {
    "v": {
     "features": {
      "retract": false,
      "twin": false,
      "carb": false,
      "mixture": true,
      "mags": true,
      "csProp": true
     },
     "items": {
      "before_takeoff": [
       "doors",
       "controls",
       "instruments",
       "fuel",
       "mixture",
       "runup_mag",
       "prop_cycle",
       "trim",
       "flaps_to",
       "engine_fail_brief",
       "transponder_lights"
      ],
      "takeoff": [
       "power_full",
       "rotate",
       "climb_speed"
      ],
      "after_takeoff": [
       "flaps_up",
       "climb_power"
      ],
      "cruise": [
       "cruise_power",
       "fuel_mgmt"
      ],
      "descent": [
       "atis_qnh",
       "brief_arrival"
      ],
      "before_landing": [
       "fuel_sel",
       "mixture_rich",
       "prop_high",
       "flaps_app",
       "lights_belts",
       "landing_clearance"
      ],
      "final": [
       "stable",
       "flaps_land"
      ],
      "after_landing": [
       "flaps_up_gnd",
       "transponder_gnd"
      ],
      "emergency_efato": [
       "pitch_glide",
       "land_ahead",
       "secure"
      ]
     },
     "emergency": {
      "glide": {
       "850": 60,
       "1000": 68,
       "1150": 73,
       "1200": 76
      }
     },
     "demoCrosswind_kt": 20
    },
    "u": "- / kt IAS",
    "scope": "aircraft",
    "src": [
     "LD6",
     "LD8",
     "LD1",
     "LD4",
     "LO0"
    ],
    "conf": "กลาง",
    "est": true,
    "note": "ค่าประมาณ (การเรียบเรียง): รายการหัวข้อด้วยถ้อยคำของเรา (ข้อความไทยใน lo_lib.mjs) กรองด้วยคุณลักษณะของแบบ ไม่ใช่ checklist ของผู้ผลิต; ความเร็วฉุกเฉินและลมขวางสาธิตตามแหล่งของแบบใน §09.4.2"
   }
  }
 }
}
```

```json
{
 "da40d": {
  "procedures": {
   "pattern": {
    "v": {
     "climb": 66,
     "downwind": 90,
     "abeam": 78,
     "base": 76,
     "final": 66,
     "flapsAt": {
      "abeam": "T/O",
      "base": "T/O",
      "final": "LDG"
     }
    },
    "u": "kt IAS",
    "scope": "aircraft",
    "src": [
     "LD8",
     "LD6"
    ],
    "conf": "ต่ำ",
    "est": true,
    "note": "ค่าประมาณบางขา: final = speeds.VAPP_kt ของบัตร (D1) และ climb = speeds.VY_kt ของบัตรเมื่อมี; ค่าที่มีแหล่งตาม §09.1.3 ส่วนขาที่ไม่มีแหล่งประมาณตาม §09.1.5 (base = final + 5–10; abeam = base + 5–10 ≤ VFE; downwind = 1.35–1.5 × final)"
   },
   "stabilised": {
    "v": {
     "Vapp": 66,
     "window_kt": [
      -5,
      10
     ],
     "landingFlaps": [
      "LDG",
      "T/O"
     ],
     "gearDown": false,
     "gates": [
      "imc",
      "vmc_straight_in",
      "vfr_circuit"
     ]
    },
    "u": "kt IAS",
    "scope": "aircraft",
    "src": [
     "LD8",
     "LD6",
     "LO4",
     "LO36"
    ],
    "conf": "กลาง",
    "est": false,
    "note": "Vapp = speeds.VAPP_kt ของบัตร da40d (ไฟล์ 05) 66 kt IAS ที่ airframe.weights.training_mass 1060 kg ตามข้อตัดสิน D1; รายการแฟลปลงจอดที่ยอมรับใช้ชื่อตาม aero.flaps.detents ของบัตร (D6) และเป็นข้อเสนอของหัวข้อนี้; ช่อง −5/+10 kt รอบ Vapp + ½ gust ใช้กับ common_light.procedures.stabilised_gates"
   },
   "short_field": {
    "v": {
     "landing": {
      "Vapp": 66,
      "note": "ไม่มีขั้นตอน short field ในแหล่งที่อ่านได้"
     }
    },
    "u": "kt IAS",
    "scope": "aircraft",
    "src": [
     "LD8",
     "LD6"
    ],
    "conf": "ต่ำ",
    "est": true,
    "note": "ค่าประมาณ: ใช้ Vapp ของบัตร (D1) เพราะไม่มีขั้นตอน short field เฉพาะแบบในแหล่งที่อ่านได้"
   },
   "soft_field": {
    "v": {
     "technique": "AFH: แฟลปตาม POH, ล้อหน้าเบา, ground effect ถึง Vx; ลงด้วยกำลังเล็กน้อยและประคองล้อหน้า",
     "ref": "LO5, LO6"
    },
    "u": "kt IAS",
    "scope": "aircraft",
    "src": [
     "LD8",
     "LD6",
     "LO5",
     "LO6"
    ],
    "conf": "กลาง",
    "est": true,
    "note": "ค่าประมาณ: ใช้เทคนิคทั่วไปของ AFH [LO5 p9-23–9-24][LO6 p6-13] เพราะไม่มีตัวเลขเฉพาะแบบ"
   },
   "go_around": {
    "v": {
     "speed": 66,
     "flapsSeq": [
      "T/O",
      "UP"
     ],
     "steps": [
      "power 100 %",
      "flaps T/O",
      "pitch 66 KIAS",
      "flaps UP ที่ความสูงปลอดภัย"
     ]
    },
    "u": "kt IAS",
    "scope": "aircraft",
    "src": [
     "LD8",
     "LD6",
     "LO4"
    ],
    "conf": "ต่ำ",
    "est": true,
    "note": "ค่าประมาณ: ลำดับทั่วไปของ AFH [LO4 p9-11, 9-12] (กำลังเต็ม → ท่าไต่ → แฟลปทีละขั้น → ล้อขึ้นเมื่อไต่ได้แน่นอน); ความเร็ว 66 KIAS จาก Vy/VY ของบัตรหรือแหล่งของแบบนั้น; ชื่อแฟลปตาม aero.flaps.detents ของบัตร (D6)"
   },
   "checklist_summary": {
    "v": {
     "features": {
      "retract": false,
      "twin": false,
      "carb": false,
      "mixture": false,
      "mags": false,
      "fadec": true,
      "csProp": true
     },
     "items": {
      "before_takeoff": [
       "doors",
       "controls",
       "instruments",
       "fuel",
       "fadec_test",
       "trim",
       "flaps_to",
       "engine_fail_brief",
       "transponder_lights"
      ],
      "takeoff": [
       "power_full",
       "rotate",
       "climb_speed"
      ],
      "after_takeoff": [
       "flaps_up",
       "climb_power"
      ],
      "cruise": [
       "cruise_power",
       "fuel_mgmt"
      ],
      "descent": [
       "atis_qnh",
       "brief_arrival"
      ],
      "before_landing": [
       "fuel_sel",
       "flaps_app",
       "lights_belts",
       "landing_clearance"
      ],
      "final": [
       "stable",
       "flaps_land"
      ],
      "after_landing": [
       "flaps_up_gnd",
       "transponder_gnd"
      ],
      "emergency_efato": [
       "pitch_glide",
       "land_ahead",
       "secure"
      ]
     },
     "emergency": {
      "glide": 73
     }
    },
    "u": "- / kt IAS",
    "scope": "aircraft",
    "src": [
     "LD8",
     "LD6",
     "LO0"
    ],
    "conf": "กลาง",
    "est": true,
    "note": "ค่าประมาณ (การเรียบเรียง): รายการหัวข้อด้วยถ้อยคำของเรา (ข้อความไทยใน lo_lib.mjs) กรองด้วยคุณลักษณะของแบบ ไม่ใช่ checklist ของผู้ผลิต; ความเร็วฉุกเฉินและลมขวางสาธิตตามแหล่งของแบบใน §09.4.2"
   }
  }
 }
}
```

```json
{
 "da42_tae125": {
  "procedures": {
   "pattern": {
    "v": {
     "climb": 79,
     "downwind": 105,
     "abeam": 95,
     "base": 90,
     "final": 82,
     "flapsAt": {
      "abeam": "APP",
      "base": "APP",
      "final": "LDG"
     }
    },
    "u": "kt IAS",
    "scope": "aircraft",
    "src": [
     "LT3",
     "LT5",
     "LO7"
    ],
    "conf": "ต่ำ",
    "est": true,
    "note": "ค่าประมาณบางขา: final = speeds.VAPP_kt ของบัตร (D1) และ climb = speeds.VY_kt ของบัตรเมื่อมี; ค่าที่มีแหล่งตาม §09.1.3 ส่วนขาที่ไม่มีแหล่งประมาณตาม §09.1.5 (base = final + 5–10; abeam = base + 5–10 ≤ VFE; downwind = 1.35–1.5 × final)"
   },
   "stabilised": {
    "v": {
     "Vapp": 82,
     "window_kt": [
      -5,
      10
     ],
     "landingFlaps": [
      "LDG",
      "APP"
     ],
     "gearDown": true,
     "gates": [
      "imc",
      "vmc_straight_in",
      "vfr_circuit"
     ]
    },
    "u": "kt IAS",
    "scope": "aircraft",
    "src": [
     "LT3",
     "LT5",
     "LO7",
     "LO4",
     "LO36"
    ],
    "conf": "ต่ำ",
    "est": false,
    "note": "Vapp = speeds.VAPP_kt ของบัตร da42_tae125 (ไฟล์ 06) 82 kt IAS ที่ airframe.weights.training_mass 1600 kg ตามข้อตัดสิน D1; รายการแฟลปลงจอดที่ยอมรับใช้ชื่อตาม aero.flaps.detents ของบัตร (D6) และเป็นข้อเสนอของหัวข้อนี้; ช่อง −5/+10 kt รอบ Vapp + ½ gust ใช้กับ common_light.procedures.stabilised_gates"
   },
   "short_field": {
    "v": {
     "takeoff": {
      "flaps": "UP",
      "VR": 72,
      "Vy": 79
     },
     "landing": {
      "flaps": "LDG",
      "Vapp": 82
     }
    },
    "u": "kt IAS",
    "scope": "aircraft",
    "src": [
     "LT3",
     "LT5",
     "LO7"
    ],
    "conf": "ต่ำ",
    "est": false,
    "note": "ตัวเลขจาก POH/AFM, checklist หรือ SOP ตามแหล่งของแบบ (§09.4.2)"
   },
   "soft_field": {
    "v": {
     "technique": "AFH: แฟลปตาม POH, ล้อหน้าเบา, ground effect ถึง Vx; ลงด้วยกำลังเล็กน้อยและประคองล้อหน้า",
     "ref": "LO5, LO6"
    },
    "u": "kt IAS",
    "scope": "aircraft",
    "src": [
     "LT3",
     "LT5",
     "LO7",
     "LO5",
     "LO6"
    ],
    "conf": "กลาง",
    "est": true,
    "note": "ค่าประมาณ: ใช้เทคนิคทั่วไปของ AFH [LO5 p9-23–9-24][LO6 p6-13] เพราะไม่มีตัวเลขเฉพาะแบบ"
   },
   "go_around": {
    "v": {
     "speed": 79,
     "flapsSeq": [
      "APP",
      "UP"
     ],
     "steps": [
      "power 100 % ทั้งสอง",
      "flaps APP",
      "pitch Vy",
      "positive rate: gear up",
      "flaps UP"
     ]
    },
    "u": "kt IAS",
    "scope": "aircraft",
    "src": [
     "LT3",
     "LT5",
     "LO7",
     "LO4"
    ],
    "conf": "ต่ำ",
    "est": true,
    "note": "ค่าประมาณ: ลำดับทั่วไปของ AFH [LO4 p9-11, 9-12] (กำลังเต็ม → ท่าไต่ → แฟลปทีละขั้น → ล้อขึ้นเมื่อไต่ได้แน่นอน); ความเร็ว 79 KIAS จาก Vy/VY ของบัตรหรือแหล่งของแบบนั้น; ชื่อแฟลปตาม aero.flaps.detents ของบัตร (D6)"
   },
   "checklist_summary": {
    "v": {
     "features": {
      "retract": true,
      "twin": true,
      "carb": false,
      "mixture": false,
      "mags": false,
      "fadec": true,
      "csProp": true
     },
     "items": {
      "before_takeoff": [
       "doors",
       "controls",
       "instruments",
       "fuel",
       "fadec_test",
       "trim",
       "flaps_to",
       "oei_brief",
       "transponder_lights"
      ],
      "takeoff": [
       "power_full",
       "rotate",
       "climb_speed"
      ],
      "after_takeoff": [
       "gear_up",
       "flaps_up",
       "climb_power"
      ],
      "cruise": [
       "cruise_power",
       "fuel_mgmt"
      ],
      "descent": [
       "atis_qnh",
       "brief_arrival"
      ],
      "before_landing": [
       "fuel_sel",
       "gear_down",
       "flaps_app",
       "lights_belts",
       "landing_clearance"
      ],
      "final": [
       "gear_recheck",
       "stable",
       "flaps_land"
      ],
      "after_landing": [
       "flaps_up_gnd",
       "transponder_gnd"
      ],
      "emergency_efato": [
       "control_vyse",
       "power_max",
       "clean_up",
       "identify_verify",
       "feather_secure"
      ]
     },
     "emergency": {
      "VMCA": 68,
      "VYSE": 82,
      "sequence": "AFH: control, VYSE, power, clean up, identify, verify, feather, secure"
     }
    },
    "u": "- / kt IAS",
    "scope": "aircraft",
    "src": [
     "LT3",
     "LT5",
     "LO7",
     "LO0"
    ],
    "conf": "กลาง",
    "est": true,
    "note": "ค่าประมาณ (การเรียบเรียง): รายการหัวข้อด้วยถ้อยคำของเรา (ข้อความไทยใน lo_lib.mjs) กรองด้วยคุณลักษณะของแบบ ไม่ใช่ checklist ของผู้ผลิต; ความเร็วฉุกเฉินและลมขวางสาธิตตามแหล่งของแบบใน §09.4.2"
   }
  }
 }
}
```

```json
{
 "be76": {
  "procedures": {
   "pattern": {
    "v": {
     "climb": 85,
     "downwind": 105,
     "abeam": 90,
     "base": 85,
     "final": 80,
     "flapsAt": {
      "abeam": "10",
      "base": "20",
      "final": "35"
     },
     "power": {
      "downwind": "18 inHg / 2300 rpm",
      "abeam": "15 inHg"
     },
     "singleEngine": {
      "downwind": 105,
      "abeam": 95,
      "base": 90,
      "final": 85,
      "shortFinal": 80
     }
    },
    "u": "kt IAS",
    "scope": "aircraft",
    "src": [
     "LO23",
     "LO24",
     "LN5"
    ],
    "conf": "ต่ำ",
    "est": false,
    "note": "ความเร็ว แฟลป และกำลังแต่ละขาจาก flashcard ของโรงเรียน [LO24] (ตติยภูมิ ไม่ใช่ POH) ความเชื่อมั่นต่ำ; final 80 = speeds.VAPP_kt ของบัตร 13 [LN5] (D1)"
   },
   "stabilised": {
    "v": {
     "Vapp": 80,
     "window_kt": [
      -5,
      10
     ],
     "landingFlaps": [
      "20",
      "35"
     ],
     "gearDown": true,
     "gates": [
      "imc",
      "vmc_straight_in",
      "vfr_circuit"
     ]
    },
    "u": "kt IAS",
    "scope": "aircraft",
    "src": [
     "LO23",
     "LO24",
     "LN5",
     "LO4",
     "LO36"
    ],
    "conf": "ต่ำ",
    "est": false,
    "note": "Vapp = speeds.VAPP_kt ของบัตร be76 (ไฟล์ 13) 80 kt IAS ที่ airframe.weights.training_mass 1420 kg ตามข้อตัดสิน D1; รายการแฟลปลงจอดที่ยอมรับใช้ชื่อตาม aero.flaps.detents ของบัตร (D6) และเป็นข้อเสนอของหัวข้อนี้; ช่อง −5/+10 kt รอบ Vapp + ½ gust ใช้กับ common_light.procedures.stabilised_gates"
   },
   "short_field": {
    "v": {
     "takeoff": {
      "VR": 71,
      "Vx": 71,
      "Vy": 85
     },
     "landing": {
      "flaps": "35",
      "Vapp": 76
     }
    },
    "u": "kt IAS",
    "scope": "aircraft",
    "src": [
     "LO23",
     "LO24",
     "LN5"
    ],
    "conf": "ต่ำ",
    "est": false,
    "note": "ตัวเลขจาก POH/AFM, checklist หรือ SOP ตามแหล่งของแบบ (§09.4.2)"
   },
   "soft_field": {
    "v": {
     "technique": "AFH: แฟลปตาม POH, ล้อหน้าเบา, ground effect ถึง Vx; ลงด้วยกำลังเล็กน้อยและประคองล้อหน้า",
     "ref": "LO5, LO6"
    },
    "u": "kt IAS",
    "scope": "aircraft",
    "src": [
     "LO23",
     "LO24",
     "LN5",
     "LO5",
     "LO6"
    ],
    "conf": "กลาง",
    "est": true,
    "note": "ค่าประมาณ: ใช้เทคนิคทั่วไปของ AFH [LO5 p9-23–9-24][LO6 p6-13] เพราะไม่มีตัวเลขเฉพาะแบบ"
   },
   "go_around": {
    "v": {
     "speed": 85,
     "flapsSeq": [
      "0"
     ],
     "steps": [
      "full power",
      "pitch Vy 85",
      "retract flaps",
      "positive rate: gear up"
     ]
    },
    "u": "kt IAS",
    "scope": "aircraft",
    "src": [
     "LO23",
     "LO24",
     "LN5",
     "LO4"
    ],
    "conf": "ต่ำ",
    "est": false,
    "note": "ลำดับและความเร็วจาก flashcard ของโรงเรียน [LO24] (ตติยภูมิ) สอดคล้องกับ AFH [LO4 p9-11]; ชื่อแฟลปตาม aero.flaps.detents ของบัตร (D6)"
   },
   "checklist_summary": {
    "v": {
     "features": {
      "retract": true,
      "twin": true,
      "carb": true,
      "mixture": true,
      "mags": true,
      "csProp": true
     },
     "items": {
      "before_takeoff": [
       "doors",
       "controls",
       "instruments",
       "fuel",
       "mixture",
       "runup_mag",
       "prop_cycle",
       "carb_heat_check",
       "trim",
       "flaps_to",
       "oei_brief",
       "transponder_lights"
      ],
      "takeoff": [
       "power_full",
       "rotate",
       "climb_speed"
      ],
      "after_takeoff": [
       "gear_up",
       "flaps_up",
       "climb_power"
      ],
      "cruise": [
       "cruise_power",
       "fuel_mgmt"
      ],
      "descent": [
       "atis_qnh",
       "brief_arrival",
       "carb_heat_descent"
      ],
      "before_landing": [
       "fuel_sel",
       "mixture_rich",
       "prop_high",
       "gear_down",
       "carb_heat_on",
       "flaps_app",
       "lights_belts",
       "landing_clearance"
      ],
      "final": [
       "gear_recheck",
       "stable",
       "flaps_land"
      ],
      "after_landing": [
       "flaps_up_gnd",
       "transponder_gnd",
       "carb_cold"
      ],
      "emergency_efato": [
       "control_vyse",
       "power_max",
       "clean_up",
       "identify_verify",
       "feather_secure"
      ]
     },
     "emergency": {
      "VMC": 65,
      "VYSE": 85,
      "VSSE": 71
     }
    },
    "u": "- / kt IAS",
    "scope": "aircraft",
    "src": [
     "LO23",
     "LO24",
     "LN5",
     "LO0"
    ],
    "conf": "กลาง",
    "est": true,
    "note": "ค่าประมาณ (การเรียบเรียง): รายการหัวข้อด้วยถ้อยคำของเรา (ข้อความไทยใน lo_lib.mjs) กรองด้วยคุณลักษณะของแบบ ไม่ใช่ checklist ของผู้ผลิต; ความเร็วฉุกเฉินและลมขวางสาธิตตามแหล่งของแบบใน §09.4.2"
   }
  }
 }
}
```

```json
{
 "p2006t": {
  "procedures": {
   "pattern": {
    "v": {
     "climb": 80,
     "downwind": 100,
     "abeam": 90,
     "base": 80,
     "final": 70,
     "flapsAt": {
      "abeam": "T/O",
      "base": "T/O",
      "final": "FULL"
     }
    },
    "u": "kt IAS",
    "scope": "aircraft",
    "src": [
     "LO26",
     "LO27",
     "LG3"
    ],
    "conf": "ต่ำ",
    "est": true,
    "note": "ค่าประมาณบางขา: final = speeds.VAPP_kt ของบัตร (D1) และ climb = speeds.VY_kt ของบัตรเมื่อมี; ค่าที่มีแหล่งตาม §09.1.3 ส่วนขาที่ไม่มีแหล่งประมาณตาม §09.1.5 (base = final + 5–10; abeam = base + 5–10 ≤ VFE; downwind = 1.35–1.5 × final)"
   },
   "stabilised": {
    "v": {
     "Vapp": 70,
     "window_kt": [
      -5,
      10
     ],
     "landingFlaps": [
      "FULL",
      "T/O"
     ],
     "gearDown": true,
     "gates": [
      "imc",
      "vmc_straight_in",
      "vfr_circuit"
     ]
    },
    "u": "kt IAS",
    "scope": "aircraft",
    "src": [
     "LO26",
     "LO27",
     "LG3",
     "LO4",
     "LO36"
    ],
    "conf": "กลาง",
    "est": false,
    "note": "Vapp = speeds.VAPP_kt ของบัตร p2006t (ไฟล์ 12) 70 kt IAS ที่ airframe.weights.training_mass 1128 kg ตามข้อตัดสิน D1; รายการแฟลปลงจอดที่ยอมรับใช้ชื่อตาม aero.flaps.detents ของบัตร (D6) และเป็นข้อเสนอของหัวข้อนี้; ช่อง −5/+10 kt รอบ Vapp + ½ gust ใช้กับ common_light.procedures.stabilised_gates"
   },
   "short_field": {
    "v": {
     "landing": {
      "Vapp": {
       "1180": 70,
       "1230": 71
      },
      "note": "ไม่มีขั้นตอน short field ในแหล่งที่อ่านได้"
     }
    },
    "u": "kt IAS",
    "scope": "aircraft",
    "src": [
     "LO26",
     "LO27",
     "LG3"
    ],
    "conf": "ต่ำ",
    "est": true,
    "note": "ค่าประมาณ: ใช้ Vapp ของบัตร (D1) เพราะไม่มีขั้นตอน short field เฉพาะแบบในแหล่งที่อ่านได้"
   },
   "soft_field": {
    "v": {
     "technique": "AFH: แฟลปตาม POH, ล้อหน้าเบา, ground effect ถึง Vx; ลงด้วยกำลังเล็กน้อยและประคองล้อหน้า",
     "ref": "LO5, LO6"
    },
    "u": "kt IAS",
    "scope": "aircraft",
    "src": [
     "LO26",
     "LO27",
     "LG3",
     "LO5",
     "LO6"
    ],
    "conf": "กลาง",
    "est": true,
    "note": "ค่าประมาณ: ใช้เทคนิคทั่วไปของ AFH [LO5 p9-23–9-24][LO6 p6-13] เพราะไม่มีตัวเลขเฉพาะแบบ"
   },
   "go_around": {
    "v": {
     "speed": 80,
     "flapsSeq": [
      "T/O",
      "UP"
     ],
     "steps": [
      "full power",
      "flaps T/O",
      "pitch Vy 80",
      "positive rate: gear up",
      "flaps UP"
     ]
    },
    "u": "kt IAS",
    "scope": "aircraft",
    "src": [
     "LO26",
     "LO27",
     "LG3",
     "LO4"
    ],
    "conf": "ต่ำ",
    "est": true,
    "note": "ค่าประมาณ: ลำดับทั่วไปของ AFH [LO4 p9-11, 9-12] (กำลังเต็ม → ท่าไต่ → แฟลปทีละขั้น → ล้อขึ้นเมื่อไต่ได้แน่นอน); ความเร็ว 80 KIAS จาก Vy/VY ของบัตรหรือแหล่งของแบบนั้น; ชื่อแฟลปตาม aero.flaps.detents ของบัตร (D6)"
   },
   "checklist_summary": {
    "v": {
     "features": {
      "retract": true,
      "twin": true,
      "carb": true,
      "mixture": false,
      "mags": true,
      "csProp": true
     },
     "items": {
      "before_takeoff": [
       "doors",
       "controls",
       "instruments",
       "fuel",
       "runup_mag",
       "prop_cycle",
       "carb_heat_check",
       "trim",
       "flaps_to",
       "oei_brief",
       "transponder_lights"
      ],
      "takeoff": [
       "power_full",
       "rotate",
       "climb_speed"
      ],
      "after_takeoff": [
       "gear_up",
       "flaps_up",
       "climb_power"
      ],
      "cruise": [
       "cruise_power",
       "fuel_mgmt"
      ],
      "descent": [
       "atis_qnh",
       "brief_arrival",
       "carb_heat_descent"
      ],
      "before_landing": [
       "fuel_sel",
       "prop_high",
       "gear_down",
       "carb_heat_on",
       "flaps_app",
       "lights_belts",
       "landing_clearance"
      ],
      "final": [
       "gear_recheck",
       "stable",
       "flaps_land"
      ],
      "after_landing": [
       "flaps_up_gnd",
       "transponder_gnd",
       "carb_cold"
      ],
      "emergency_efato": [
       "control_vyse",
       "power_max",
       "clean_up",
       "identify_verify",
       "feather_secure"
      ]
     },
     "emergency": {
      "VMC": 62,
      "VYSE": {
       "1180": 80,
       "1230": 84
      },
      "VXSE": {
       "1180": 79,
       "1230": 83
      },
      "onRunway": "abort before rotation",
      "airborne": "accelerate to VYSE before gear up",
      "oeiApproach": "VYSE, touchdown 70"
     }
    },
    "u": "- / kt IAS",
    "scope": "aircraft",
    "src": [
     "LO26",
     "LO27",
     "LG3",
     "LO0"
    ],
    "conf": "กลาง",
    "est": true,
    "note": "ค่าประมาณ (การเรียบเรียง): รายการหัวข้อด้วยถ้อยคำของเรา (ข้อความไทยใน lo_lib.mjs) กรองด้วยคุณลักษณะของแบบ ไม่ใช่ checklist ของผู้ผลิต; ความเร็วฉุกเฉินและลมขวางสาธิตตามแหล่งของแบบใน §09.4.2"
   }
  }
 }
}
```

```json
{
 "p2002jf": {
  "procedures": {
   "pattern": {
    "v": {
     "climb": 68,
     "downwind": 75,
     "abeam": 65,
     "base": 60,
     "final": 52,
     "flapsAt": {
      "abeam": "TO",
      "base": "TO",
      "final": "LDG"
     }
    },
    "u": "kt IAS",
    "scope": "aircraft",
    "src": [
     "LO28",
     "LO29",
     "LO30",
     "LN0"
    ],
    "conf": "ต่ำ",
    "est": true,
    "note": "ค่าประมาณบางขา: final = speeds.VAPP_kt ของบัตร (D1) และ climb = speeds.VY_kt ของบัตรเมื่อมี; ค่าที่มีแหล่งตาม §09.1.3 ส่วนขาที่ไม่มีแหล่งประมาณตาม §09.1.5 (base = final + 5–10; abeam = base + 5–10 ≤ VFE; downwind = 1.35–1.5 × final)"
   },
   "stabilised": {
    "v": {
     "Vapp": 52,
     "window_kt": [
      -5,
      10
     ],
     "landingFlaps": [
      "LDG",
      "TO"
     ],
     "gearDown": false,
     "gates": [
      "imc",
      "vmc_straight_in",
      "vfr_circuit"
     ]
    },
    "u": "kt IAS",
    "scope": "aircraft",
    "src": [
     "LO28",
     "LO29",
     "LO30",
     "LN0",
     "LM25",
     "LO4",
     "LO36"
    ],
    "conf": "ต่ำ",
    "est": true,
    "note": "Vapp = speeds.VAPP_kt ของบัตร p2002jf (ไฟล์ 13) 52 kt CAS ที่ airframe.weights.training_mass 573.2 kg ตามข้อตัดสิน D1 (ค่าประมาณของบัตร วิธีอยู่ใน note ของบัตร); บัตรให้ kt CAS และไม่มีตาราง ias_cas จึงใช้เป็น KIAS ≈ KCAS (ประมาณ); รายการแฟลปลงจอดที่ยอมรับใช้ชื่อตาม aero.flaps.detents ของบัตร (D6) และเป็นข้อเสนอของหัวข้อนี้; ช่อง −5/+10 kt รอบ Vapp + ½ gust ใช้กับ common_light.procedures.stabilised_gates"
   },
   "short_field": {
    "v": {
     "landing": {
      "Vapp": 52,
      "note": "ไม่มีขั้นตอน short field ในแหล่งที่อ่านได้"
     }
    },
    "u": "kt IAS",
    "scope": "aircraft",
    "src": [
     "LO28",
     "LO29",
     "LO30",
     "LN0"
    ],
    "conf": "ต่ำ",
    "est": true,
    "note": "ค่าประมาณ: ใช้ Vapp ของบัตร (D1) เพราะไม่มีขั้นตอน short field เฉพาะแบบในแหล่งที่อ่านได้"
   },
   "soft_field": {
    "v": {
     "technique": "AFH: แฟลปตาม POH, ล้อหน้าเบา, ground effect ถึง Vx; ลงด้วยกำลังเล็กน้อยและประคองล้อหน้า",
     "ref": "LO5, LO6"
    },
    "u": "kt IAS",
    "scope": "aircraft",
    "src": [
     "LO28",
     "LO29",
     "LO30",
     "LN0",
     "LO5",
     "LO6"
    ],
    "conf": "กลาง",
    "est": true,
    "note": "ค่าประมาณ: ใช้เทคนิคทั่วไปของ AFH [LO5 p9-23–9-24][LO6 p6-13] เพราะไม่มีตัวเลขเฉพาะแบบ"
   },
   "go_around": {
    "v": {
     "speed": 60,
     "flapsSeq": [
      "TO",
      "UP"
     ],
     "steps": [
      "full power",
      "flaps T/O",
      "pitch Vx/Vy",
      "flaps UP"
     ]
    },
    "u": "kt IAS",
    "scope": "aircraft",
    "src": [
     "LO28",
     "LO29",
     "LO30",
     "LN0",
     "LO4"
    ],
    "conf": "ต่ำ",
    "est": true,
    "note": "ค่าประมาณ: ลำดับทั่วไปของ AFH [LO4 p9-11, 9-12] (กำลังเต็ม → ท่าไต่ → แฟลปทีละขั้น → ล้อขึ้นเมื่อไต่ได้แน่นอน); ความเร็ว 60 KIAS จาก Vy/VY ของบัตรหรือแหล่งของแบบนั้น; ชื่อแฟลปตาม aero.flaps.detents ของบัตร (D6)"
   },
   "checklist_summary": {
    "v": {
     "features": {
      "retract": false,
      "twin": false,
      "carb": true,
      "mixture": false,
      "mags": true,
      "csProp": false
     },
     "items": {
      "before_takeoff": [
       "doors",
       "controls",
       "instruments",
       "fuel",
       "runup_mag",
       "carb_heat_check",
       "trim",
       "flaps_to",
       "engine_fail_brief",
       "transponder_lights"
      ],
      "takeoff": [
       "power_full",
       "rotate",
       "climb_speed"
      ],
      "after_takeoff": [
       "flaps_up",
       "climb_power"
      ],
      "cruise": [
       "cruise_power",
       "fuel_mgmt"
      ],
      "descent": [
       "atis_qnh",
       "brief_arrival",
       "carb_heat_descent"
      ],
      "before_landing": [
       "fuel_sel",
       "carb_heat_on",
       "flaps_app",
       "lights_belts",
       "landing_clearance"
      ],
      "final": [
       "stable",
       "flaps_land"
      ],
      "after_landing": [
       "flaps_up_gnd",
       "transponder_gnd",
       "carb_cold"
      ],
      "emergency_efato": [
       "pitch_glide",
       "land_ahead",
       "secure"
      ]
     },
     "emergency": {
      "flaps15": 60,
      "glide": 68,
      "note": "ค่าของ P2002 Sierra (US-LSA) รุ่นใกล้เคียง"
     }
    },
    "u": "- / kt IAS",
    "scope": "aircraft",
    "src": [
     "LO28",
     "LO29",
     "LO30",
     "LN0",
     "LO0"
    ],
    "conf": "กลาง",
    "est": true,
    "note": "ค่าประมาณ (การเรียบเรียง): รายการหัวข้อด้วยถ้อยคำของเรา (ข้อความไทยใน lo_lib.mjs) กรองด้วยคุณลักษณะของแบบ ไม่ใช่ checklist ของผู้ผลิต; ความเร็วฉุกเฉินและลมขวางสาธิตตามแหล่งของแบบใน §09.4.2"
   }
  }
 }
}
```

```json
{
 "p68c": {
  "procedures": {
   "pattern": {
    "v": {
     "climb": 90,
     "downwind": 110,
     "abeam": 100,
     "base": 90,
     "final": 74,
     "flapsAt": {
      "abeam": "17",
      "base": "30",
      "final": "35"
     }
    },
    "u": "kt IAS",
    "scope": "aircraft",
    "src": [
     "LO31",
     "LO32",
     "LN0",
     "LO37",
     "LO7"
    ],
    "conf": "ต่ำ",
    "est": true,
    "note": "ค่าประมาณบางขา: final = speeds.VAPP_kt ของบัตร (D1) และ climb = speeds.VY_kt ของบัตรเมื่อมี; ค่าที่มีแหล่งตาม §09.1.3 ส่วนขาที่ไม่มีแหล่งประมาณตาม §09.1.5 (base = final + 5–10; abeam = base + 5–10 ≤ VFE; downwind = 1.35–1.5 × final)"
   },
   "stabilised": {
    "v": {
     "Vapp": 74,
     "window_kt": [
      -5,
      10
     ],
     "landingFlaps": [
      "30",
      "35"
     ],
     "gearDown": false,
     "gates": [
      "imc",
      "vmc_straight_in",
      "vfr_circuit"
     ]
    },
    "u": "kt IAS",
    "scope": "aircraft",
    "src": [
     "LO31",
     "LO32",
     "LN0",
     "LO37",
     "LO7",
     "LM25",
     "LO4",
     "LO36"
    ],
    "conf": "ต่ำ",
    "est": true,
    "note": "Vapp = speeds.VAPP_kt ของบัตร p68c (ไฟล์ 13) 74 kt CAS ที่ airframe.weights.training_mass 1796 kg ตามข้อตัดสิน D1 (ค่าประมาณของบัตร วิธีอยู่ใน note ของบัตร); บัตรให้ kt CAS และไม่มีตาราง ias_cas จึงใช้เป็น KIAS ≈ KCAS (ประมาณ); รายการแฟลปลงจอดที่ยอมรับใช้ชื่อตาม aero.flaps.detents ของบัตร (D6) และเป็นข้อเสนอของหัวข้อนี้; ช่อง −5/+10 kt รอบ Vapp + ½ gust ใช้กับ common_light.procedures.stabilised_gates"
   },
   "short_field": {
    "v": {
     "landing": {
      "Vapp": 74,
      "note": "ไม่มีขั้นตอน short field ในแหล่งที่อ่านได้"
     }
    },
    "u": "kt IAS",
    "scope": "aircraft",
    "src": [
     "LO31",
     "LO32",
     "LN0",
     "LO37",
     "LO7"
    ],
    "conf": "ต่ำ",
    "est": true,
    "note": "ค่าประมาณ: ใช้ Vapp ของบัตร (D1) เพราะไม่มีขั้นตอน short field เฉพาะแบบในแหล่งที่อ่านได้"
   },
   "soft_field": {
    "v": {
     "technique": "AFH: แฟลปตาม POH, ล้อหน้าเบา, ground effect ถึง Vx; ลงด้วยกำลังเล็กน้อยและประคองล้อหน้า",
     "ref": "LO5, LO6"
    },
    "u": "kt IAS",
    "scope": "aircraft",
    "src": [
     "LO31",
     "LO32",
     "LN0",
     "LO37",
     "LO7",
     "LO5",
     "LO6"
    ],
    "conf": "กลาง",
    "est": true,
    "note": "ค่าประมาณ: ใช้เทคนิคทั่วไปของ AFH [LO5 p9-23–9-24][LO6 p6-13] เพราะไม่มีตัวเลขเฉพาะแบบ"
   },
   "go_around": {
    "v": {
     "speed": null,
     "flapsSeq": [
      "17",
      "0"
     ],
     "steps": [
      "full power ทั้งสอง",
      "flaps ขั้นแรก",
      "pitch Vy",
      "flaps up"
     ]
    },
    "u": "kt IAS",
    "scope": "aircraft",
    "src": [
     "LO31",
     "LO32",
     "LN0",
     "LO37",
     "LO7",
     "LO4"
    ],
    "conf": "ต่ำ",
    "est": true,
    "note": "ค่าประมาณ: ลำดับทั่วไปของ AFH [LO4 p9-11, 9-12] (กำลังเต็ม → ท่าไต่ → แฟลปทีละขั้น → ล้อขึ้นเมื่อไต่ได้แน่นอน); ไม่มีความเร็วเฉพาะแบบ; ชื่อแฟลปตาม aero.flaps.detents ของบัตร (D6)"
   },
   "checklist_summary": {
    "v": {
     "features": {
      "retract": false,
      "twin": true,
      "carb": false,
      "mixture": true,
      "mags": true,
      "csProp": true
     },
     "items": {
      "before_takeoff": [
       "doors",
       "controls",
       "instruments",
       "fuel",
       "mixture",
       "runup_mag",
       "prop_cycle",
       "trim",
       "flaps_to",
       "oei_brief",
       "transponder_lights"
      ],
      "takeoff": [
       "power_full",
       "rotate",
       "climb_speed"
      ],
      "after_takeoff": [
       "flaps_up",
       "climb_power"
      ],
      "cruise": [
       "cruise_power",
       "fuel_mgmt"
      ],
      "descent": [
       "atis_qnh",
       "brief_arrival"
      ],
      "before_landing": [
       "fuel_sel",
       "mixture_rich",
       "prop_high",
       "flaps_app",
       "lights_belts",
       "landing_clearance"
      ],
      "final": [
       "stable",
       "flaps_land"
      ],
      "after_landing": [
       "flaps_up_gnd",
       "transponder_gnd"
      ],
      "emergency_efato": [
       "control_vyse",
       "power_max",
       "clean_up",
       "identify_verify",
       "feather_secure"
      ]
     },
     "emergency": {
      "VMC_KCAS": 60
     }
    },
    "u": "- / kt IAS",
    "scope": "aircraft",
    "src": [
     "LO31",
     "LO32",
     "LN0",
     "LO37",
     "LO7",
     "LO0"
    ],
    "conf": "กลาง",
    "est": true,
    "note": "ค่าประมาณ (การเรียบเรียง): รายการหัวข้อด้วยถ้อยคำของเรา (ข้อความไทยใน lo_lib.mjs) กรองด้วยคุณลักษณะของแบบ ไม่ใช่ checklist ของผู้ผลิต; ความเร็วฉุกเฉินและลมขวางสาธิตตามแหล่งของแบบใน §09.4.2"
   }
  }
 }
}
```

```json
{
 "t206h": {
  "procedures": {
   "pattern": {
    "v": {
     "climb": 89,
     "downwind": 100,
     "abeam": 90,
     "base": 80,
     "final": 75,
     "flapsAt": {
      "abeam": "10",
      "base": "20",
      "final": "FULL"
     }
    },
    "u": "kt IAS",
    "scope": "aircraft",
    "src": [
     "LO33",
     "LN20",
     "LN18"
    ],
    "conf": "ต่ำ",
    "est": true,
    "note": "ค่าประมาณบางขา: final = speeds.VAPP_kt ของบัตร (D1) และ climb = speeds.VY_kt ของบัตรเมื่อมี; ค่าที่มีแหล่งตาม §09.1.3 ส่วนขาที่ไม่มีแหล่งประมาณตาม §09.1.5 (base = final + 5–10; abeam = base + 5–10 ≤ VFE; downwind = 1.35–1.5 × final)"
   },
   "stabilised": {
    "v": {
     "Vapp": 75,
     "window_kt": [
      -5,
      10
     ],
     "landingFlaps": [
      "20",
      "FULL"
     ],
     "gearDown": false,
     "gates": [
      "imc",
      "vmc_straight_in",
      "vfr_circuit"
     ]
    },
    "u": "kt IAS",
    "scope": "aircraft",
    "src": [
     "LO33",
     "LN20",
     "LN18",
     "LO4",
     "LO36"
    ],
    "conf": "กลาง",
    "est": false,
    "note": "Vapp = speeds.VAPP_kt ของบัตร t206h (ไฟล์ 13) 75 kt IAS ที่ airframe.weights.training_mass 1354 kg ตามข้อตัดสิน D1; รายการแฟลปลงจอดที่ยอมรับใช้ชื่อตาม aero.flaps.detents ของบัตร (D6) และเป็นข้อเสนอของหัวข้อนี้; ช่อง −5/+10 kt รอบ Vapp + ½ gust ใช้กับ common_light.procedures.stabilised_gates"
   },
   "short_field": {
    "v": {
     "landing": {
      "flaps": "FULL",
      "Vapp": 67,
      "note": "short field approach แฟลป FULL 67 KIAS = speeds.VREF_kt ของบัตร 13 (POH Sec 4 ผ่าน LN20)"
     }
    },
    "u": "kt IAS",
    "scope": "aircraft",
    "src": [
     "LO33",
     "LN20",
     "LN18"
    ],
    "conf": "ต่ำ",
    "est": false,
    "note": "ตัวเลขจาก POH/AFM, checklist หรือ SOP ตามแหล่งของแบบ (§09.4.2)"
   },
   "soft_field": {
    "v": {
     "technique": "AFH: แฟลปตาม POH, ล้อหน้าเบา, ground effect ถึง Vx; ลงด้วยกำลังเล็กน้อยและประคองล้อหน้า",
     "ref": "LO5, LO6"
    },
    "u": "kt IAS",
    "scope": "aircraft",
    "src": [
     "LO33",
     "LN20",
     "LN18",
     "LO5",
     "LO6"
    ],
    "conf": "กลาง",
    "est": true,
    "note": "ค่าประมาณ: ใช้เทคนิคทั่วไปของ AFH [LO5 p9-23–9-24][LO6 p6-13] เพราะไม่มีตัวเลขเฉพาะแบบ"
   },
   "go_around": {
    "v": {
     "speed": null,
     "flapsSeq": [
      "20",
      "10",
      "UP"
     ],
     "steps": [
      "full power (MAP ไม่เกินค่าจำกัด)",
      "flaps 20",
      "pitch climb",
      "flaps up ตามความเร็ว"
     ]
    },
    "u": "kt IAS",
    "scope": "aircraft",
    "src": [
     "LO33",
     "LN20",
     "LN18",
     "LO4"
    ],
    "conf": "ต่ำ",
    "est": true,
    "note": "ค่าประมาณ: ลำดับทั่วไปของ AFH [LO4 p9-11, 9-12] (กำลังเต็ม → ท่าไต่ → แฟลปทีละขั้น → ล้อขึ้นเมื่อไต่ได้แน่นอน); ไม่มีความเร็วเฉพาะแบบ; ชื่อแฟลปตาม aero.flaps.detents ของบัตร (D6)"
   },
   "checklist_summary": {
    "v": {
     "features": {
      "retract": false,
      "twin": false,
      "carb": false,
      "mixture": true,
      "mags": true,
      "csProp": true
     },
     "items": {
      "before_takeoff": [
       "doors",
       "controls",
       "instruments",
       "fuel",
       "mixture",
       "runup_mag",
       "prop_cycle",
       "trim",
       "flaps_to",
       "engine_fail_brief",
       "transponder_lights"
      ],
      "takeoff": [
       "power_full",
       "rotate",
       "climb_speed"
      ],
      "after_takeoff": [
       "flaps_up",
       "climb_power"
      ],
      "cruise": [
       "cruise_power",
       "fuel_mgmt"
      ],
      "descent": [
       "atis_qnh",
       "brief_arrival"
      ],
      "before_landing": [
       "fuel_sel",
       "mixture_rich",
       "prop_high",
       "flaps_app",
       "lights_belts",
       "landing_clearance"
      ],
      "final": [
       "stable",
       "flaps_land"
      ],
      "after_landing": [
       "flaps_up_gnd",
       "transponder_gnd"
      ],
      "emergency_efato": [
       "pitch_glide",
       "land_ahead",
       "secure"
      ]
     },
     "emergency": {
      "flapsUp": 85,
      "flapsDown": 75,
      "glide": {
       "2800": 70,
       "3200": 75,
       "3600": 80
      },
      "precautionary": 75
     }
    },
    "u": "- / kt IAS",
    "scope": "aircraft",
    "src": [
     "LO33",
     "LN20",
     "LN18",
     "LO0"
    ],
    "conf": "กลาง",
    "est": true,
    "note": "ค่าประมาณ (การเรียบเรียง): รายการหัวข้อด้วยถ้อยคำของเรา (ข้อความไทยใน lo_lib.mjs) กรองด้วยคุณลักษณะของแบบ ไม่ใช่ checklist ของผู้ผลิต; ความเร็วฉุกเฉินและลมขวางสาธิตตามแหล่งของแบบใน §09.4.2"
   }
  }
 }
}
```

```json
{
 "ct4": {
  "procedures": {
   "pattern": {
    "v": {
     "climb": 85,
     "downwind": 90,
     "abeam": 80,
     "base": 70,
     "final": 60,
     "flapsAt": {
      "abeam": "TO",
      "base": "TO",
      "final": "LDG"
     }
    },
    "u": "kt IAS",
    "scope": "aircraft",
    "src": [
     "LO34",
     "LN0"
    ],
    "conf": "ต่ำ",
    "est": true,
    "note": "ค่าประมาณบางขา: final = speeds.VAPP_kt ของบัตร (D1) และ climb = speeds.VY_kt ของบัตรเมื่อมี; ค่าที่มีแหล่งตาม §09.1.3 ส่วนขาที่ไม่มีแหล่งประมาณตาม §09.1.5 (base = final + 5–10; abeam = base + 5–10 ≤ VFE; downwind = 1.35–1.5 × final)"
   },
   "stabilised": {
    "v": {
     "Vapp": 60,
     "window_kt": [
      -5,
      10
     ],
     "landingFlaps": [
      "LDG",
      "TO"
     ],
     "gearDown": false,
     "gates": [
      "imc",
      "vmc_straight_in",
      "vfr_circuit"
     ]
    },
    "u": "kt IAS",
    "scope": "aircraft",
    "src": [
     "LO34",
     "LN0",
     "LM25",
     "LO4",
     "LO36"
    ],
    "conf": "ต่ำ",
    "est": true,
    "note": "Vapp = speeds.VAPP_kt ของบัตร ct4 (ไฟล์ 13) 60 kt CAS ที่ airframe.weights.training_mass 1038 kg ตามข้อตัดสิน D1 (ค่าประมาณของบัตร วิธีอยู่ใน note ของบัตร); บัตรให้ kt CAS และไม่มีตาราง ias_cas จึงใช้เป็น KIAS ≈ KCAS (ประมาณ); รายการแฟลปลงจอดที่ยอมรับใช้ชื่อตาม aero.flaps.detents ของบัตร (D6) และเป็นข้อเสนอของหัวข้อนี้; ช่อง −5/+10 kt รอบ Vapp + ½ gust ใช้กับ common_light.procedures.stabilised_gates"
   },
   "short_field": {
    "v": {
     "landing": {
      "Vapp": 60,
      "note": "ไม่มีขั้นตอน short field ในแหล่งที่อ่านได้"
     }
    },
    "u": "kt IAS",
    "scope": "aircraft",
    "src": [
     "LO34",
     "LN0"
    ],
    "conf": "ต่ำ",
    "est": true,
    "note": "ค่าประมาณ: ใช้ Vapp ของบัตร (D1) เพราะไม่มีขั้นตอน short field เฉพาะแบบในแหล่งที่อ่านได้"
   },
   "soft_field": {
    "v": {
     "technique": "AFH: แฟลปตาม POH, ล้อหน้าเบา, ground effect ถึง Vx; ลงด้วยกำลังเล็กน้อยและประคองล้อหน้า",
     "ref": "LO5, LO6"
    },
    "u": "kt IAS",
    "scope": "aircraft",
    "src": [
     "LO34",
     "LN0",
     "LO5",
     "LO6"
    ],
    "conf": "กลาง",
    "est": true,
    "note": "ค่าประมาณ: ใช้เทคนิคทั่วไปของ AFH [LO5 p9-23–9-24][LO6 p6-13] เพราะไม่มีตัวเลขเฉพาะแบบ"
   },
   "go_around": {
    "v": {
     "speed": null,
     "flapsSeq": [
      "TO",
      "UP"
     ],
     "steps": [
      "full power",
      "flaps T/O",
      "climb",
      "flaps UP"
     ]
    },
    "u": "kt IAS",
    "scope": "aircraft",
    "src": [
     "LO34",
     "LN0",
     "LO4"
    ],
    "conf": "ต่ำ",
    "est": true,
    "note": "ค่าประมาณ: ลำดับทั่วไปของ AFH [LO4 p9-11, 9-12] (กำลังเต็ม → ท่าไต่ → แฟลปทีละขั้น → ล้อขึ้นเมื่อไต่ได้แน่นอน); ไม่มีความเร็วเฉพาะแบบ; ชื่อแฟลปตาม aero.flaps.detents ของบัตร (D6)"
   },
   "checklist_summary": {
    "v": {
     "features": {
      "retract": false,
      "twin": false,
      "carb": false,
      "mixture": true,
      "mags": true,
      "csProp": true
     },
     "items": {
      "before_takeoff": [
       "doors",
       "controls",
       "instruments",
       "fuel",
       "mixture",
       "runup_mag",
       "prop_cycle",
       "trim",
       "flaps_to",
       "engine_fail_brief",
       "transponder_lights"
      ],
      "takeoff": [
       "power_full",
       "rotate",
       "climb_speed"
      ],
      "after_takeoff": [
       "flaps_up",
       "climb_power"
      ],
      "cruise": [
       "cruise_power",
       "fuel_mgmt"
      ],
      "descent": [
       "atis_qnh",
       "brief_arrival"
      ],
      "before_landing": [
       "fuel_sel",
       "mixture_rich",
       "prop_high",
       "flaps_app",
       "lights_belts",
       "landing_clearance"
      ],
      "final": [
       "stable",
       "flaps_land"
      ],
      "after_landing": [
       "flaps_up_gnd",
       "transponder_gnd"
      ],
      "emergency_efato": [
       "pitch_glide",
       "land_ahead",
       "secure"
      ]
     },
     "emergency": {}
    },
    "u": "- / kt IAS",
    "scope": "aircraft",
    "src": [
     "LO34",
     "LN0",
     "LO0"
    ],
    "conf": "กลาง",
    "est": true,
    "note": "ค่าประมาณ (การเรียบเรียง): รายการหัวข้อด้วยถ้อยคำของเรา (ข้อความไทยใน lo_lib.mjs) กรองด้วยคุณลักษณะของแบบ ไม่ใช่ checklist ของผู้ผลิต; ความเร็วฉุกเฉินและลมขวางสาธิตตามแหล่งของแบบใน §09.4.2"
   }
  }
 }
}
```

```json
{
 "pc7mk2": {
  "procedures": {
   "pattern": {
    "v": {
     "climb": 136,
     "downwind": 140,
     "abeam": 120,
     "base": 110,
     "final": 89,
     "flapsAt": {
      "abeam": "TO",
      "base": "LDG",
      "final": "LDG"
     }
    },
    "u": "kt IAS",
    "scope": "aircraft",
    "src": [
     "LP1",
     "LP20",
     "LP27",
     "LO4"
    ],
    "conf": "ต่ำ",
    "est": true,
    "note": "ค่าประมาณบางขา: final = speeds.VAPP_kt ของบัตร (D1) และ climb = speeds.VY_kt ของบัตรเมื่อมี; ค่าที่มีแหล่งตาม §09.1.3 ส่วนขาที่ไม่มีแหล่งประมาณตาม §09.1.5 (base = final + 5–10; abeam = base + 5–10 ≤ VFE; downwind = 1.35–1.5 × final)"
   },
   "stabilised": {
    "v": {
     "Vapp": 89,
     "window_kt": [
      -5,
      10
     ],
     "landingFlaps": [
      "LDG",
      "TO"
     ],
     "gearDown": true,
     "gates": [
      "imc",
      "vmc_straight_in",
      "vfr_circuit"
     ]
    },
    "u": "kt IAS",
    "scope": "aircraft",
    "src": [
     "LP1",
     "LP20",
     "LP27",
     "LO4",
     "LO36"
    ],
    "conf": "ต่ำ",
    "est": true,
    "note": "Vapp = speeds.VAPP_kt ของบัตร pc7mk2 (ไฟล์ 07) 89 kt CAS ที่ airframe.weights.training_mass 2068.8 kg ตามข้อตัดสิน D1 (ค่าประมาณของบัตร วิธีอยู่ใน note ของบัตร); บัตรให้ kt CAS และ speeds.ias_cas ของบัตรเป็นตาราง identity (ค่าประมาณ ไม่มีข้อมูล PEC สาธารณะ) จึงใช้เป็น KIAS ≈ KCAS; รายการแฟลปลงจอดที่ยอมรับใช้ชื่อตาม aero.flaps.detents ของบัตร (D6) และเป็นข้อเสนอของหัวข้อนี้; ช่อง −5/+10 kt รอบ Vapp + ½ gust ใช้กับ common_light.procedures.stabilised_gates"
   },
   "short_field": {
    "v": {
     "landing": {
      "Vapp": 89,
      "note": "ไม่มีขั้นตอน short field ในแหล่งที่อ่านได้"
     }
    },
    "u": "kt IAS",
    "scope": "aircraft",
    "src": [
     "LP1",
     "LP20",
     "LP27",
     "LO4"
    ],
    "conf": "ต่ำ",
    "est": true,
    "note": "ค่าประมาณ: ใช้ Vapp ของบัตร (D1) เพราะไม่มีขั้นตอน short field เฉพาะแบบในแหล่งที่อ่านได้"
   },
   "soft_field": {
    "v": {
     "technique": "AFH: แฟลปตาม POH, ล้อหน้าเบา, ground effect ถึง Vx; ลงด้วยกำลังเล็กน้อยและประคองล้อหน้า",
     "ref": "LO5, LO6"
    },
    "u": "kt IAS",
    "scope": "aircraft",
    "src": [
     "LP1",
     "LP20",
     "LP27",
     "LO4",
     "LO5",
     "LO6"
    ],
    "conf": "กลาง",
    "est": true,
    "note": "ค่าประมาณ: ใช้เทคนิคทั่วไปของ AFH [LO5 p9-23–9-24][LO6 p6-13] เพราะไม่มีตัวเลขเฉพาะแบบ"
   },
   "go_around": {
    "v": {
     "speed": null,
     "flapsSeq": [
      "TO",
      "UP"
     ],
     "steps": [
      "PCL max",
      "pitch climb",
      "positive rate: gear up",
      "flaps up"
     ]
    },
    "u": "kt IAS",
    "scope": "aircraft",
    "src": [
     "LP1",
     "LP20",
     "LP27",
     "LO4"
    ],
    "conf": "ต่ำ",
    "est": true,
    "note": "ค่าประมาณ: ลำดับทั่วไปของ AFH [LO4 p9-11, 9-12] (กำลังเต็ม → ท่าไต่ → แฟลปทีละขั้น → ล้อขึ้นเมื่อไต่ได้แน่นอน); ไม่มีความเร็วเฉพาะแบบ; ชื่อแฟลปตาม aero.flaps.detents ของบัตร (D6)"
   },
   "checklist_summary": {
    "v": {
     "features": {
      "retract": true,
      "twin": false,
      "carb": false,
      "mixture": false,
      "mags": false,
      "turboprop": true,
      "csProp": true
     },
     "items": {
      "before_takeoff": [
       "doors",
       "controls",
       "instruments",
       "fuel",
       "trim",
       "flaps_to",
       "engine_fail_brief",
       "pcl_ignition",
       "transponder_lights"
      ],
      "takeoff": [
       "power_full",
       "rotate",
       "climb_speed"
      ],
      "after_takeoff": [
       "gear_up",
       "flaps_up",
       "climb_power"
      ],
      "cruise": [
       "cruise_power",
       "fuel_mgmt"
      ],
      "descent": [
       "atis_qnh",
       "brief_arrival"
      ],
      "before_landing": [
       "fuel_sel",
       "prop_high",
       "gear_down",
       "flaps_app",
       "lights_belts",
       "landing_clearance"
      ],
      "final": [
       "gear_recheck",
       "stable",
       "flaps_land"
      ],
      "after_landing": [
       "flaps_up_gnd",
       "transponder_gnd"
      ],
      "emergency_efato": [
       "pitch_glide",
       "land_ahead",
       "secure"
      ]
     },
     "emergency": {}
    },
    "u": "- / kt IAS",
    "scope": "aircraft",
    "src": [
     "LP1",
     "LP20",
     "LP27",
     "LO4",
     "LO0"
    ],
    "conf": "กลาง",
    "est": true,
    "note": "ค่าประมาณ (การเรียบเรียง): รายการหัวข้อด้วยถ้อยคำของเรา (ข้อความไทยใน lo_lib.mjs) กรองด้วยคุณลักษณะของแบบ ไม่ใช่ checklist ของผู้ผลิต; ความเร็วฉุกเฉินและลมขวางสาธิตตามแหล่งของแบบใน §09.4.2"
   }
  }
 }
}
```

```json
{
 "pc9m": {
  "procedures": {
   "pattern": {
    "v": {
     "climb": 136,
     "downwind": 150,
     "abeam": 125,
     "base": 115,
     "final": 90,
     "flapsAt": {
      "abeam": "TO",
      "base": "LDG",
      "final": "LDG"
     }
    },
    "u": "kt IAS",
    "scope": "aircraft",
    "src": [
     "LP2",
     "LP20",
     "LP27",
     "LO4"
    ],
    "conf": "ต่ำ",
    "est": true,
    "note": "ค่าประมาณบางขา: final = speeds.VAPP_kt ของบัตร (D1) และ climb = speeds.VY_kt ของบัตรเมื่อมี; ค่าที่มีแหล่งตาม §09.1.3 ส่วนขาที่ไม่มีแหล่งประมาณตาม §09.1.5 (base = final + 5–10; abeam = base + 5–10 ≤ VFE; downwind = 1.35–1.5 × final)"
   },
   "stabilised": {
    "v": {
     "Vapp": 90,
     "window_kt": [
      -5,
      10
     ],
     "landingFlaps": [
      "LDG",
      "TO"
     ],
     "gearDown": true,
     "gates": [
      "imc",
      "vmc_straight_in",
      "vfr_circuit"
     ]
    },
    "u": "kt IAS",
    "scope": "aircraft",
    "src": [
     "LP2",
     "LP20",
     "LP27",
     "LO4",
     "LO36"
    ],
    "conf": "ต่ำ",
    "est": true,
    "note": "Vapp = speeds.VAPP_kt ของบัตร pc9m (ไฟล์ 07) 90 kt CAS ที่ airframe.weights.training_mass 2123.8 kg ตามข้อตัดสิน D1 (ค่าประมาณของบัตร วิธีอยู่ใน note ของบัตร); บัตรให้ kt CAS และ speeds.ias_cas ของบัตรเป็นตาราง identity (ค่าประมาณ ไม่มีข้อมูล PEC สาธารณะ) จึงใช้เป็น KIAS ≈ KCAS; รายการแฟลปลงจอดที่ยอมรับใช้ชื่อตาม aero.flaps.detents ของบัตร (D6) และเป็นข้อเสนอของหัวข้อนี้; ช่อง −5/+10 kt รอบ Vapp + ½ gust ใช้กับ common_light.procedures.stabilised_gates"
   },
   "short_field": {
    "v": {
     "landing": {
      "Vapp": 90,
      "note": "ไม่มีขั้นตอน short field ในแหล่งที่อ่านได้"
     }
    },
    "u": "kt IAS",
    "scope": "aircraft",
    "src": [
     "LP2",
     "LP20",
     "LP27",
     "LO4"
    ],
    "conf": "ต่ำ",
    "est": true,
    "note": "ค่าประมาณ: ใช้ Vapp ของบัตร (D1) เพราะไม่มีขั้นตอน short field เฉพาะแบบในแหล่งที่อ่านได้"
   },
   "soft_field": {
    "v": {
     "technique": "AFH: แฟลปตาม POH, ล้อหน้าเบา, ground effect ถึง Vx; ลงด้วยกำลังเล็กน้อยและประคองล้อหน้า",
     "ref": "LO5, LO6"
    },
    "u": "kt IAS",
    "scope": "aircraft",
    "src": [
     "LP2",
     "LP20",
     "LP27",
     "LO4",
     "LO5",
     "LO6"
    ],
    "conf": "กลาง",
    "est": true,
    "note": "ค่าประมาณ: ใช้เทคนิคทั่วไปของ AFH [LO5 p9-23–9-24][LO6 p6-13] เพราะไม่มีตัวเลขเฉพาะแบบ"
   },
   "go_around": {
    "v": {
     "speed": null,
     "flapsSeq": [
      "TO",
      "UP"
     ],
     "steps": [
      "PCL max",
      "pitch climb",
      "positive rate: gear up",
      "flaps up"
     ]
    },
    "u": "kt IAS",
    "scope": "aircraft",
    "src": [
     "LP2",
     "LP20",
     "LP27",
     "LO4"
    ],
    "conf": "ต่ำ",
    "est": true,
    "note": "ค่าประมาณ: ลำดับทั่วไปของ AFH [LO4 p9-11, 9-12] (กำลังเต็ม → ท่าไต่ → แฟลปทีละขั้น → ล้อขึ้นเมื่อไต่ได้แน่นอน); ไม่มีความเร็วเฉพาะแบบ; ชื่อแฟลปตาม aero.flaps.detents ของบัตร (D6)"
   },
   "checklist_summary": {
    "v": {
     "features": {
      "retract": true,
      "twin": false,
      "carb": false,
      "mixture": false,
      "mags": false,
      "turboprop": true,
      "csProp": true
     },
     "items": {
      "before_takeoff": [
       "doors",
       "controls",
       "instruments",
       "fuel",
       "trim",
       "flaps_to",
       "engine_fail_brief",
       "pcl_ignition",
       "transponder_lights"
      ],
      "takeoff": [
       "power_full",
       "rotate",
       "climb_speed"
      ],
      "after_takeoff": [
       "gear_up",
       "flaps_up",
       "climb_power"
      ],
      "cruise": [
       "cruise_power",
       "fuel_mgmt"
      ],
      "descent": [
       "atis_qnh",
       "brief_arrival"
      ],
      "before_landing": [
       "fuel_sel",
       "prop_high",
       "gear_down",
       "flaps_app",
       "lights_belts",
       "landing_clearance"
      ],
      "final": [
       "gear_recheck",
       "stable",
       "flaps_land"
      ],
      "after_landing": [
       "flaps_up_gnd",
       "transponder_gnd"
      ],
      "emergency_efato": [
       "pitch_glide",
       "land_ahead",
       "secure"
      ]
     },
     "emergency": {}
    },
    "u": "- / kt IAS",
    "scope": "aircraft",
    "src": [
     "LP2",
     "LP20",
     "LP27",
     "LO4",
     "LO0"
    ],
    "conf": "กลาง",
    "est": true,
    "note": "ค่าประมาณ (การเรียบเรียง): รายการหัวข้อด้วยถ้อยคำของเรา (ข้อความไทยใน lo_lib.mjs) กรองด้วยคุณลักษณะของแบบ ไม่ใช่ checklist ของผู้ผลิต; ความเร็วฉุกเฉินและลมขวางสาธิตตามแหล่งของแบบใน §09.4.2"
   }
  }
 }
}
```

```json
{
 "trainer_r2": {
  "procedures": {
   "pattern": {
    "v": {
     "climb": 136,
     "downwind": 140,
     "abeam": 120,
     "base": 110,
     "final": 95,
     "flapsAt": {
      "abeam": "TO",
      "base": "LDG",
      "final": "LDG"
     }
    },
    "u": "kt IAS",
    "scope": "aircraft",
    "src": [
     "LP27",
     "LO0",
     "LO4"
    ],
    "conf": "ต่ำ",
    "est": true,
    "note": "ค่าประมาณ: final = AC.Vapp 95 ของซิม (src/20-flight.js:117) = speeds.VAPP_kt ของบัตร 07 (D1), climb = VY 136 KCAS ของ trainer_r2 (หัวข้อ 07, เดิม 125), ขาอื่นตาม §09.1.5 เทียบ pc9m; แฟลป TO = AC.flaps 0.5, LDG = 1.0; KIAS ≈ KCAS"
   },
   "stabilised": {
    "v": {
     "Vapp": 95,
     "window_kt": [
      -5,
      10
     ],
     "landingFlaps": [
      "LDG",
      "TO"
     ],
     "gearDown": true,
     "gates": [
      "imc",
      "vmc_straight_in",
      "vfr_circuit"
     ]
    },
    "u": "kt IAS",
    "scope": "aircraft",
    "src": [
     "LP27",
     "LO0",
     "LO4",
     "R1:V19",
     "LO36"
    ],
    "conf": "กลาง",
    "est": true,
    "note": "Vapp = speeds.VAPP_kt ของบัตร trainer_r2 (ไฟล์ 07) 95 kt CAS ที่ airframe.weights.training_mass 2250 kg ตามข้อตัดสิน D1 (ค่าประมาณของบัตร วิธีอยู่ใน note ของบัตร); บัตรให้ kt CAS และไม่มีตาราง ias_cas จึงใช้เป็น KIAS ≈ KCAS (ประมาณ); รายการแฟลปลงจอดที่ยอมรับใช้ชื่อตาม aero.flaps.detents ของบัตร (D6) และเป็นข้อเสนอของหัวข้อนี้; ช่อง −5/+10 kt รอบ Vapp + ½ gust ใช้กับ common_light.procedures.stabilised_gates"
   },
   "short_field": {
    "v": {
     "landing": {
      "Vapp": 95,
      "note": "ไม่มีขั้นตอน short field ในแหล่งที่อ่านได้"
     }
    },
    "u": "kt IAS",
    "scope": "aircraft",
    "src": [
     "LP27",
     "LO0",
     "LO4"
    ],
    "conf": "ต่ำ",
    "est": true,
    "note": "ค่าประมาณ: ใช้ Vapp ของบัตร (D1) เพราะไม่มีขั้นตอน short field เฉพาะแบบในแหล่งที่อ่านได้"
   },
   "soft_field": {
    "v": {
     "technique": "AFH: แฟลปตาม POH, ล้อหน้าเบา, ground effect ถึง Vx; ลงด้วยกำลังเล็กน้อยและประคองล้อหน้า",
     "ref": "LO5, LO6"
    },
    "u": "kt IAS",
    "scope": "aircraft",
    "src": [
     "LP27",
     "LO0",
     "LO4",
     "LO5",
     "LO6"
    ],
    "conf": "กลาง",
    "est": true,
    "note": "ค่าประมาณ: ใช้เทคนิคทั่วไปของ AFH [LO5 p9-23–9-24][LO6 p6-13] เพราะไม่มีตัวเลขเฉพาะแบบ"
   },
   "go_around": {
    "v": {
     "speed": null,
     "flapsSeq": [
      "TO",
      "UP"
     ],
     "steps": [
      "PCL max",
      "pitch climb",
      "positive rate: gear up",
      "flaps up"
     ]
    },
    "u": "kt IAS",
    "scope": "aircraft",
    "src": [
     "LP27",
     "LO0",
     "LO4"
    ],
    "conf": "ต่ำ",
    "est": true,
    "note": "ค่าประมาณ: ลำดับทั่วไปของ AFH [LO4 p9-11, 9-12] (กำลังเต็ม → ท่าไต่ → แฟลปทีละขั้น → ล้อขึ้นเมื่อไต่ได้แน่นอน); ไม่มีความเร็วเฉพาะแบบ; ชื่อแฟลปตาม aero.flaps.detents ของบัตร (D6)"
   },
   "checklist_summary": {
    "v": {
     "features": {
      "retract": true,
      "twin": false,
      "carb": false,
      "mixture": false,
      "mags": false,
      "turboprop": true,
      "csProp": true
     },
     "items": {
      "before_takeoff": [
       "doors",
       "controls",
       "instruments",
       "fuel",
       "trim",
       "flaps_to",
       "engine_fail_brief",
       "pcl_ignition",
       "transponder_lights"
      ],
      "takeoff": [
       "power_full",
       "rotate",
       "climb_speed"
      ],
      "after_takeoff": [
       "gear_up",
       "flaps_up",
       "climb_power"
      ],
      "cruise": [
       "cruise_power",
       "fuel_mgmt"
      ],
      "descent": [
       "atis_qnh",
       "brief_arrival"
      ],
      "before_landing": [
       "fuel_sel",
       "prop_high",
       "gear_down",
       "flaps_app",
       "lights_belts",
       "landing_clearance"
      ],
      "final": [
       "gear_recheck",
       "stable",
       "flaps_land"
      ],
      "after_landing": [
       "flaps_up_gnd",
       "transponder_gnd"
      ],
      "emergency_efato": [
       "pitch_glide",
       "land_ahead",
       "secure"
      ]
     },
     "emergency": {}
    },
    "u": "- / kt IAS",
    "scope": "aircraft",
    "src": [
     "LP27",
     "LO0",
     "LO4"
    ],
    "conf": "กลาง",
    "est": true,
    "note": "ค่าประมาณ (การเรียบเรียง): รายการหัวข้อด้วยถ้อยคำของเรา (ข้อความไทยใน lo_lib.mjs) กรองด้วยคุณลักษณะของแบบ ไม่ใช่ checklist ของผู้ผลิต; ความเร็วฉุกเฉินและลมขวางสาธิตตามแหล่งของแบบใน §09.4.2"
   }
  }
 }
}
```

```json
{
 "t6a": {
  "procedures": {
   "pattern": {
    "v": {
     "climb": 140,
     "downwind": 150,
     "abeam": 120,
     "base": 110,
     "final": 100,
     "flapsAt": {
      "abeam": "TO",
      "base": "LDG",
      "final": "LDG"
     },
     "t6": {
      "initial": 200,
      "minDownwind": 120,
      "minFinalTurn": 110
     }
    },
    "u": "kt IAS",
    "scope": "aircraft",
    "src": [
     "LP15",
     "LP20",
     "LP17"
    ],
    "conf": "ต่ำ",
    "est": true,
    "note": "ค่าประมาณบางขา: final = speeds.VAPP_kt ของบัตร (D1) และ climb = speeds.VY_kt ของบัตรเมื่อมี; ค่าที่มีแหล่งตาม §09.1.3 ส่วนขาที่ไม่มีแหล่งประมาณตาม §09.1.5 (base = final + 5–10; abeam = base + 5–10 ≤ VFE; downwind = 1.35–1.5 × final)"
   },
   "stabilised": {
    "v": {
     "Vapp": 100,
     "window_kt": [
      -5,
      10
     ],
     "landingFlaps": [
      "LDG",
      "TO",
      "UP"
     ],
     "gearDown": true,
     "gates": [
      "imc",
      "vmc_straight_in",
      "vfr_circuit"
     ]
    },
    "u": "kt IAS",
    "scope": "aircraft",
    "src": [
     "LP15",
     "LP20",
     "LP17",
     "LP29",
     "LP23",
     "LO4",
     "LO36"
    ],
    "conf": "กลาง",
    "est": false,
    "note": "Vapp = speeds.VAPP_kt ของบัตร t6a (ไฟล์ 07) 100 kt IAS ที่ airframe.weights.training_mass 2574.6 kg ตามข้อตัดสิน D1; รายการแฟลปลงจอดที่ยอมรับใช้ชื่อตาม aero.flaps.detents ของบัตร (D6) และเป็นข้อเสนอของหัวข้อนี้; ช่อง −5/+10 kt รอบ Vapp + ½ gust ใช้กับ common_light.procedures.stabilised_gates"
   },
   "short_field": {
    "v": {
     "takeoff": {
      "flaps": "TO",
      "VR": 85,
      "pitch_deg": "7-10",
      "climbout": 140
     }
    },
    "u": "kt IAS",
    "scope": "aircraft",
    "src": [
     "LP15",
     "LP20",
     "LP17"
    ],
    "conf": "ต่ำ",
    "est": false,
    "note": "ตัวเลขจาก POH/AFM, checklist หรือ SOP ตามแหล่งของแบบ (§09.4.2)"
   },
   "soft_field": {
    "v": {
     "technique": "AFH: แฟลปตาม POH, ล้อหน้าเบา, ground effect ถึง Vx; ลงด้วยกำลังเล็กน้อยและประคองล้อหน้า",
     "ref": "LO5, LO6"
    },
    "u": "kt IAS",
    "scope": "aircraft",
    "src": [
     "LP15",
     "LP20",
     "LP17",
     "LO5",
     "LO6"
    ],
    "conf": "กลาง",
    "est": true,
    "note": "ค่าประมาณ: ใช้เทคนิคทั่วไปของ AFH [LO5 p9-23–9-24][LO6 p6-13] เพราะไม่มีตัวเลขเฉพาะแบบ"
   },
   "go_around": {
    "v": {
     "speed": null,
     "flapsSeq": [
      "TO",
      "UP"
     ],
     "steps": [
      "PCL max",
      "pitch climb",
      "below 150 KIAS: gear and flaps up after positive rate"
     ]
    },
    "u": "kt IAS",
    "scope": "aircraft",
    "src": [
     "LP15",
     "LP20",
     "LP17",
     "LO4"
    ],
    "conf": "ต่ำ",
    "est": true,
    "note": "ค่าประมาณ: ลำดับทั่วไปของ AFH [LO4 p9-11, 9-12] (กำลังเต็ม → ท่าไต่ → แฟลปทีละขั้น → ล้อขึ้นเมื่อไต่ได้แน่นอน); ไม่มีความเร็วเฉพาะแบบ; ชื่อแฟลปตาม aero.flaps.detents ของบัตร (D6)"
   },
   "checklist_summary": {
    "v": {
     "features": {
      "retract": true,
      "twin": false,
      "carb": false,
      "mixture": false,
      "mags": false,
      "turboprop": true,
      "csProp": true
     },
     "items": {
      "before_takeoff": [
       "doors",
       "controls",
       "instruments",
       "fuel",
       "trim",
       "flaps_to",
       "engine_fail_brief",
       "pcl_ignition",
       "transponder_lights"
      ],
      "takeoff": [
       "power_full",
       "rotate",
       "climb_speed"
      ],
      "after_takeoff": [
       "gear_up",
       "flaps_up",
       "climb_power"
      ],
      "cruise": [
       "cruise_power",
       "fuel_mgmt"
      ],
      "descent": [
       "atis_qnh",
       "brief_arrival"
      ],
      "before_landing": [
       "fuel_sel",
       "prop_high",
       "gear_down",
       "flaps_app",
       "lights_belts",
       "landing_clearance"
      ],
      "final": [
       "gear_recheck",
       "stable",
       "flaps_land"
      ],
      "after_landing": [
       "flaps_up_gnd",
       "transponder_gnd"
      ],
      "emergency_efato": [
       "pitch_glide",
       "land_ahead",
       "secure"
      ]
     },
     "emergency": {
      "glide_clean": 125,
      "ELP": {
       "highKey_ftAGL": 3000,
       "lowKey_ftAGL": 1500
      }
     }
    },
    "u": "- / kt IAS",
    "scope": "aircraft",
    "src": [
     "LP15",
     "LP20",
     "LP17",
     "LO0"
    ],
    "conf": "กลาง",
    "est": true,
    "note": "ค่าประมาณ (การเรียบเรียง): รายการหัวข้อด้วยถ้อยคำของเรา (ข้อความไทยใน lo_lib.mjs) กรองด้วยคุณลักษณะของแบบ ไม่ใช่ checklist ของผู้ผลิต; ความเร็วฉุกเฉินและลมขวางสาธิตตามแหล่งของแบบใน §09.4.2"
   }
  }
 }
}
```

```json
{
 "t6c": {
  "procedures": {
   "pattern": {
    "v": {
     "climb": 140,
     "downwind": 150,
     "abeam": 125,
     "base": 115,
     "final": 104,
     "flapsAt": {
      "abeam": "TO",
      "base": "LDG",
      "final": "LDG"
     }
    },
    "u": "kt IAS",
    "scope": "aircraft",
    "src": [
     "LP27",
     "LP20",
     "LP29"
    ],
    "conf": "ต่ำ",
    "est": true,
    "note": "ค่าประมาณ: final = speeds.VAPP_kt 104 KIAS ของบัตร t6c (หัวข้อ 07, D1), climb = VY 140 KIAS [LP29], downwind 150 เท่า t6a [LP20], abeam 125 และ base 115 = ขั้นต่ำของ T-6A 120/110 KIAS [LP20] × √(2775.5/2574.6) = 1.038 ปัดเป็นเลขลงท้าย 0/5; leaf อื่นของ procedures รับจาก t6a"
   },
   "stabilised": {
    "v": {
     "Vapp": 104,
     "window_kt": [
      -5,
      10
     ],
     "landingFlaps": [
      "LDG",
      "TO",
      "UP"
     ],
     "gearDown": true,
     "gates": [
      "imc",
      "vmc_straight_in",
      "vfr_circuit"
     ]
    },
    "u": "kt IAS",
    "scope": "aircraft",
    "src": [
     "LP27",
     "LP20",
     "LP29",
     "LP31",
     "LO4",
     "LO36"
    ],
    "conf": "ต่ำ",
    "est": true,
    "note": "Vapp = speeds.VAPP_kt ของบัตร t6c (ไฟล์ 07) 104 kt IAS ที่ airframe.weights.training_mass 2775.5 kg ตามข้อตัดสิน D1 (ค่าประมาณของบัตร วิธีอยู่ใน note ของบัตร); รายการแฟลปลงจอดที่ยอมรับใช้ชื่อตาม aero.flaps.detents ของบัตร (D6) และเป็นข้อเสนอของหัวข้อนี้; ช่อง −5/+10 kt รอบ Vapp + ½ gust ใช้กับ common_light.procedures.stabilised_gates"
   }
  }
 }
}
```

```json
{
 "common_light": {
  "procedures": {
   "pattern_geometry": {
    "v": {
     "shape": "rectangle with rounded corners",
     "D_rule": "clamp(2R(V_dw,25deg)+400 m, 0.5 sm, 1.0 sm), and >= R_b+R_f+200 m",
     "bankDeg": 25,
     "finalBankDeg": 20,
     "gpDeg": 3,
     "rolloutFt": 400,
     "baseRule": "gate",
     "turnWithinFt": 300,
     "minFinal_m": 402,
     "entry": "45 deg to downwind abeam midpoint at circuit height",
     "exit": "straight out or 45 deg turn beyond departure end after reaching circuit height",
     "descentStart": "abeam landing threshold",
     "noOrbit": true,
     "vtbdTurbopropHeight_ft": 1000
    },
    "u": "m, deg, ft",
    "scope": "sim",
    "src": [
     "LO1",
     "LO2",
     "LO3",
     "LO4",
     "LO13",
     "LO0"
    ],
    "conf": "กลาง",
    "est": true,
    "note": "กติกาจาก AIM 4-3-3/AC 90-66C 11.3–11.8/AFH บท 8; ค่าประมาณ: D, bank 25°/20°, rolloutFt 400 (§09.1.2) และ vtbdTurbopropHeight_ft (ตีความว่าเทอร์โบพร็อปเป็น conventional ของ AIP)"
   },
   "pattern_altitude_ft": {
    "v": {
     "faa_propeller": 1000,
     "faa_large_turbine": 1500,
     "helicopter": 500,
     "vtbd_light": 800,
     "vtbd_conventional": 1000,
     "vtbd_jet": 1500,
     "vtbd_helicopter": 500
    },
    "u": "ft AGL",
    "scope": "environment",
    "src": [
     "LO1",
     "LO2",
     "LO13",
     "LO39",
     "LS20"
    ],
    "conf": "สูง",
    "est": false,
    "note": "FAA: AIM 4-3-3 และ AC 90-66C App A (เฮลิคอปเตอร์ 500 ft: AC 90-66C 12.1.4 และ App A ข้อ 4); VTBD = ความสูงเข้าวงจรของ 03R/21L ใน AD 2.20 ข้อ 4.2.2 และความสูงวงจรตามหมายเหตุ Traffic Patterns and Altitude ใน AD 2.22 ข้อ 8.6.2 (light 800, conventional 1000, jet 1500, helicopter 500 ft) ข้อความเหมือนกันใน AIRAC 14 MAY, 9 JUL และ 29 OCT 2026 [LO39][LS20] (lo_aip_check.mjs, 19 พ.ย. 2026) และตรงกับ AIRAC 2022-08-11 และ 2024-02-22 [LO13]; ค่าเทอร์โบพร็อปของซิมอยู่ที่ pattern_geometry"
   },
   "stabilised_gates": {
    "v": {
     "imc_ft": 1000,
     "vmc_straight_in_ft": 500,
     "vfr_circuit_ft": 300,
     "speed_window_kt": [
      -5,
      10
     ],
     "gust": {
      "fraction": 0.5,
      "max_kt": 10
     },
     "sinkMax_fpm": 1000,
     "bankMax_deg": 15,
     "vfrPath_deg": [
      2.5,
      3.5
     ],
     "ilsDots": 1,
     "config": "landing flaps of type + gear down if retractable",
     "onFail": "GO AROUND"
    },
    "u": "ft, kt, fpm, deg",
    "scope": "sim",
    "src": [
     "LO4",
     "LO5",
     "LO8",
     "LO9",
     "LO18",
     "LO36"
    ],
    "conf": "กลาง",
    "est": true,
    "note": "ค่าจากแหล่ง ยกเว้นเพดาน gust 10 kt (ค่าประมาณจาก T-6 [LP20]) และแถบ PAPI 2.5–3.5° (ค่าใน repo)"
   },
   "radio_calls": {
    "v": [
     {
      "at": "ready",
      "pilot": "DON MUEANG TOWER, <CS>, HOLDING POINT RUNWAY <RWY>, READY FOR DEPARTURE, REQUEST CIRCUITS",
      "atc": "<CS>, RUNWAY <RWY>, CLEARED FOR TAKE-OFF, WIND <W>[, RIGHT HAND CIRCUIT]",
      "readback": true
     },
     {
      "at": "downwind",
      "pilot": "<CS>, DOWNWIND, <TOUCH AND GO|FULL STOP>",
      "atc": "<CS>, NUMBER <N>, FOLLOW <TRAFFIC>, REPORT FINAL"
     },
     {
      "at": "delay",
      "pilot": null,
      "atc": "<CS>, EXTEND DOWNWIND | ORBIT <LEFT|RIGHT>"
     },
     {
      "at": "final",
      "pilot": "<CS>, FINAL (LONG FINAL beyond 4 NM)",
      "atc": "<CS>, RUNWAY <RWY>, CLEARED TOUCH AND GO | CLEARED TO LAND, WIND <W>",
      "readback": true
     },
     {
      "at": "go_around",
      "pilot": "<CS>, GOING AROUND",
      "atc": "<CS>, ROGER, REPORT DOWNWIND"
     },
     {
      "at": "vacate",
      "pilot": null,
      "atc": "<CS>, VACATE VIA <TWY>, HOLD SHORT OF RUNWAY <RWY2>",
      "readback": true
     },
     {
      "at": "join",
      "pilot": "DON MUEANG TOWER, <CS>, <POSITION>, <ALT>, INFORMATION <ATIS>, FOR CIRCUITS",
      "atc": "<CS>, JOIN <SIDE> HAND DOWNWIND RUNWAY <RWY>, <HEIGHT>, QNH <Q>",
      "readback": true
     }
    ],
    "u": "-",
    "scope": "sim",
    "src": [
     "LO12",
     "LO13"
    ],
    "conf": "กลาง",
    "est": false,
    "note": "แม่แบบที่เรียบเรียงจากวลีของ Doc 9432 บท 4 (ไม่ใช่ข้อความคัดลอกยาว); FINAL ภายใน 4 NM (4.7.1); ระบุ RIGHT HAND CIRCUIT เฉพาะวงจรขวา เช่น 03R วงจรซ้ายไม่ต้องระบุ (4.6.1)"
   },
   "vtbd": {
    "v": {
     "circuit_03R_21L": "east of runway: 03R right-hand, 21L left-hand",
     "join": "45 deg mid-downwind east",
     "outbound": "turn east, leave at 45 deg to crosswind",
     "straightIn": "Tower approval required",
     "atz": {
      "radius_NM": 5,
      "top_ftAGL": 2000,
      "class": "C",
      "language": "English, Thai"
     },
     "freq_MHz": {
      "TWR": 118.1,
      "GND": [
       121.9,
       122.5
      ],
      "DEL": 127.7,
      "ATIS_arrival": 126.4,
      "ATIS_departure": 118.55,
      "APP_DonMueang": 119.4
     },
     "speedLimit_kt": 250,
     "vfrDay": {
      "groundVis_km": 5,
      "ceiling_ft": 1500
     },
     "svfr_groundVis_m": 1500,
     "vfrNight": "ATC may authorize; treated as special VFR",
     "items_AIRAC_2026": {
      "circuit": "AD 2.20 4.1-4.2.3",
      "vacate21L_holdShort21R": "AD 2.20 6.3 (TWY S)",
      "clearanceToLand": "AD 2.20 7.3",
      "speed250": "AD 2.22 4.1.2",
      "vfrMinima": "AD 2.22 8.1-8.4",
      "patternHeights": "AD 2.22 8.6.2 note"
     },
     "rwy03R_21L": "normally military, civil possible",
     "sim_03L_21R": "fictional west circuit (03L left, 21R right)"
    },
    "u": "-",
    "scope": "environment",
    "src": [
     "LO13",
     "LO39",
     "LS20"
    ],
    "conf": "สูง",
    "est": false,
    "note": "AIP AD 2 VTBD AIRAC 14 MAY, 9 JUL และ 29 OCT 2026 (ฉบับที่มีผล ณ 19 พ.ย. 2026) อ่านเต็มหน้าด้วย lo_aip_check.mjs: ทุกค่าเหมือนกันทั้งสามฉบับ (T-LO-33) และตรงกับการตรวจของหัวข้อ 02 [LS20] และรอบที่ 5 (5d-aip-update.md ตาราง U3); เลขข้อของ AIRAC 2022 [LO13] ต่างไป (คำเตือนแท็กซี่ 7.3 เป็น 6.3, clearance 8.3 เป็น 7.3, 250 kt จาก AD 2.20 5.1 เป็น AD 2.22 4.1.2); ATIS ขาออก 118.55 และ Don Mueang Approach 119.4 เพิ่มใหม่; วงจรของ 03L/21R เป็นข้อเสนอสมมติ"
   },
   "vtbd_vfr_light": {
    "v": {
     "routes": "AD 2.22 8.5.2 VFR entry/exit for light aircraft (charts in AD 2.24)",
     "designedBelow_kt": 130,
     "above130": "ATC may allow the routes or assign paths/altitudes",
     "daylightOnly": true,
     "radioAndTransponder": "required",
     "reportingPoints": 26,
     "routeAlt_ft": [
      1000,
      4500
     ],
     "nearFieldAlt_ft": 1000,
     "adherence": "recommended paths and altitudes, not mandatory; ATC may assign others",
     "trainingArea": {
      "designator": {
       "AIRAC 2026-05-14": "VT D72",
       "AIRAC 2026-07-09": "VT D72",
       "AIRAC 2026-10-29": "VT D6A / VT D6B"
      },
      "contact": "Don Mueang Approach 119.4 MHz",
      "out": "via BANG BUA THONG at or below 1000 ft",
      "back": "report LAT LUM KAEO at or below 1000 ft, then PATHUMTHANI, 5 NM WEST, then downwind 21L/R or 03R/L",
      "limits": "surface to 5000 ft ALT (ENR 5.1)"
     },
     "radioFailureVFR": "enter downwind with the traffic flow at type height, low approach between the runways at 500 ft rocking wings, re-enter downwind, watch light signals",
     "coordinates": "not collected (task 09.11)"
    },
    "u": "-",
    "scope": "environment",
    "src": [
     "LO39",
     "LS20",
     "LS37"
    ],
    "conf": "สูง",
    "est": false,
    "note": "ข้อเท็จจริงจาก AIP AD 2.22 ข้อ 8.5.1, 8.5.2, 8.6.2 และ 9.2 ที่ตรวจใน AIRAC 14 MAY, 9 JUL และ 29 OCT 2026 ด้วย lo_aip_check.mjs (T-LO-34) และหัวข้อ 02 (T-LS-12) [LS20]; พื้นที่ฝึกตาม ENR 5.1 [LS37] แสดงแบบทั่วไปเท่านั้น; ชื่อจุดรายงานเป็นชื่อสถานที่ตาม AIP ไม่เก็บชื่อจุดสังเกต พิกัดจุดรายงานยังไม่ได้เก็บ (งานใน §09.11)"
   },
   "wake_turbulence": {
    "v": {
     "categories_kg": {
      "L": "<=7000",
      "M": "7000-136000",
      "H": ">=136000",
      "J": "A380"
     },
     "distance_NM_to_light": {
      "M": 5,
      "H": 6,
      "J": 8
     },
     "time_min_light_landing_behind": {
      "M": 3,
      "H": 3,
      "J": 4
     },
     "departures_min": "2-4"
    },
    "u": "kg, NM, min",
    "scope": "environment",
    "src": [
     "LO16"
    ],
    "conf": "กลาง",
    "est": false,
    "note": "ICAO Doc 4444 ผ่านสรุปของ Wikipedia (แหล่งทุติยภูมิ)"
   },
   "vfr_minima_thailand": {
    "v": {
     "ctrVfrWithoutClearance": {
      "ceiling_ft": 1500,
      "groundVis_km": 5
     },
     "vmcBelow3000": {
      "vis_km": 5,
      "cloudHoriz_m": 1500,
      "cloudVert_ft": 1000
     },
     "minHeight_ft": {
      "congested_aboveHighestObstacleWithin600m": 1000,
      "other_aboveSurface": 500
     },
     "svfr_vis_m": 1500,
     "nightVfrCeiling_ft": 1500,
     "uncontrolledFreq_MHz": 123,
     "uncontrolledReport_NM": 10,
     "nightRule": "ENR 1.1 1.2: night = IFR (ดู §09.9)"
    },
    "u": "ft, km, m, MHz, NM",
    "scope": "environment",
    "src": [
     "LO14",
     "LO15"
    ],
    "conf": "สูง",
    "est": false,
    "note": "AIP Thailand ENR 1.2 (AIRAC AMDT 13/23) ข้อ 1 (VMC ชั้น A–E ต่ำกว่า 3,000 ft), 2.1–2.2 (CTR), 3.2.2.1 (VFR กลางคืน), 4.2.2 (SVFR), 6 (ความสูงต่ำสุด), 13.1.2/13.2.1.2 (สนามไม่มีหอ) และ ENR 1.1 ข้อ 1.2 (AMDT 8/19)"
   }
  }
 }
}
```
