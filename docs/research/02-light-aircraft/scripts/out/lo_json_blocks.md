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
    "note": "ความเร็ว แฟลป และกำลังแต่ละขาจาก SOP ของโรงเรียน [LO17][LO18] และ Vy/Vapp จาก POH [LC1] (§09.1.3)"
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
    "note": "Vapp = ความเร็ว final ของแบบตามแหล่งใน §09.1.3; รายการแฟลปลงจอดที่ยอมรับเป็นข้อเสนอ; ช่อง −5/+10 kt รอบ Vapp + ½ gust ใช้กับ common_light.procedures.stabilised_gates"
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
    "note": "ลำดับและความเร็วจาก POH (balked landing) และ SOP โรงเรียน [LC1][LO17] สอดคล้องกับ AFH [LO4 p9-11]"
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
    "note": "ค่าประมาณบางขา: ค่าที่มีแหล่งตาม §09.1.3 ส่วนขาที่ไม่มีแหล่งประมาณตาม §09.1.5 (final = ความเร็ว approach ของ POH/AFM หรือ 1.3 VS0 ปัดเป็นเลขลงท้าย 0/5 ที่ใกล้ที่สุด; base = final + 5–10; abeam = base + 5–10 ≤ VFE; downwind = 1.35–1.5 × final)"
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
     "LO4",
     "LO36"
    ],
    "conf": "ต่ำ",
    "est": true,
    "note": "ค่าประมาณ: Vapp = ความเร็ว final ของ §09.1.3 (วิธี §09.1.5) และรายการแฟลปลงจอดที่ยอมรับเป็นข้อเสนอของผู้เขียน; ช่อง −5/+10 kt รอบ Vapp + ½ gust ใช้กับ common_light.procedures.stabilised_gates"
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
    "note": "ลำดับและความเร็วจาก POH balked landing [LO20 Sec 4] สอดคล้องกับ AFH [LO4 p9-11]"
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
    "note": "ค่าประมาณบางขา: ค่าที่มีแหล่งตาม §09.1.3 ส่วนขาที่ไม่มีแหล่งประมาณตาม §09.1.5 (final = ความเร็ว approach ของ POH/AFM หรือ 1.3 VS0 ปัดเป็นเลขลงท้าย 0/5 ที่ใกล้ที่สุด; base = final + 5–10; abeam = base + 5–10 ≤ VFE; downwind = 1.35–1.5 × final)"
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
     "LO4",
     "LO36"
    ],
    "conf": "ต่ำ",
    "est": true,
    "note": "ค่าประมาณ: Vapp = ความเร็ว final ของ §09.1.3 (วิธี §09.1.5) และรายการแฟลปลงจอดที่ยอมรับเป็นข้อเสนอของผู้เขียน; ช่อง −5/+10 kt รอบ Vapp + ½ gust ใช้กับ common_light.procedures.stabilised_gates"
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
    "note": "ลำดับและความเร็วจาก POH balked landing [LO19 p4-3, 4-9] สอดคล้องกับ AFH [LO4 p9-11]"
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
     "LO22"
    ],
    "conf": "ต่ำ",
    "est": true,
    "note": "ค่าประมาณบางขา: ค่าที่มีแหล่งตาม §09.1.3 ส่วนขาที่ไม่มีแหล่งประมาณตาม §09.1.5 (final = ความเร็ว approach ของ POH/AFM หรือ 1.3 VS0 ปัดเป็นเลขลงท้าย 0/5 ที่ใกล้ที่สุด; base = final + 5–10; abeam = base + 5–10 ≤ VFE; downwind = 1.35–1.5 × final)"
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
     "LO4",
     "LO36"
    ],
    "conf": "ต่ำ",
    "est": true,
    "note": "ค่าประมาณ: Vapp = ความเร็ว final ของ §09.1.3 (วิธี §09.1.5) และรายการแฟลปลงจอดที่ยอมรับเป็นข้อเสนอของผู้เขียน; ช่อง −5/+10 kt รอบ Vapp + ½ gust ใช้กับ common_light.procedures.stabilised_gates"
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
     "LO22"
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
     "LO22"
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
     "LO4"
    ],
    "conf": "กลาง",
    "est": false,
    "note": "ลำดับและความเร็วจาก checklist โรงเรียน [LO22] (บท 4 ของ POH ในสำเนาที่เปิดได้ขาด) สอดคล้องกับ AFH [LO4 p9-11]"
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
     "final": 76,
     "flapsAt": {
      "abeam": "TO",
      "base": "TO",
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
    "note": "ค่าประมาณบางขา: ค่าที่มีแหล่งตาม §09.1.3 ส่วนขาที่ไม่มีแหล่งประมาณตาม §09.1.5 (final = ความเร็ว approach ของ POH/AFM หรือ 1.3 VS0 ปัดเป็นเลขลงท้าย 0/5 ที่ใกล้ที่สุด; base = final + 5–10; abeam = base + 5–10 ≤ VFE; downwind = 1.35–1.5 × final)"
   },
   "stabilised": {
    "v": {
     "Vapp": 76,
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
     "LD3",
     "LO35",
     "LO4",
     "LO36"
    ],
    "conf": "ต่ำ",
    "est": true,
    "note": "ค่าประมาณ: Vapp = ความเร็ว final ของ §09.1.3 (วิธี §09.1.5) และรายการแฟลปลงจอดที่ยอมรับเป็นข้อเสนอของผู้เขียน; ช่อง −5/+10 kt รอบ Vapp + ½ gust ใช้กับ common_light.procedures.stabilised_gates"
   },
   "short_field": {
    "v": {
     "takeoff": {
      "flaps": "TO",
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
      "TO",
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
    "note": "ลำดับและความเร็วจาก ความเร็ว go-around ต่ำสุดแฟลป T/O จาก checklist ของ Diamond [LD3] สอดคล้องกับ AFH [LO4 p9-11]"
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
    "note": "ค่าประมาณบางขา: ค่าที่มีแหล่งตาม §09.1.3 ส่วนขาที่ไม่มีแหล่งประมาณตาม §09.1.5 (final = ความเร็ว approach ของ POH/AFM หรือ 1.3 VS0 ปัดเป็นเลขลงท้าย 0/5 ที่ใกล้ที่สุด; base = final + 5–10; abeam = base + 5–10 ≤ VFE; downwind = 1.35–1.5 × final)"
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
    "est": true,
    "note": "ค่าประมาณ: Vapp = ความเร็ว final ของ §09.1.3 (วิธี §09.1.5) และรายการแฟลปลงจอดที่ยอมรับเป็นข้อเสนอของผู้เขียน; ช่อง −5/+10 kt รอบ Vapp + ½ gust ใช้กับ common_light.procedures.stabilised_gates"
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
    "note": "ค่าประมาณ: ลำดับทั่วไปของ AFH [LO4 p9-11, 9-12] (กำลังเต็ม → ท่าไต่ → แฟลปทีละขั้น → ล้อขึ้นเมื่อไต่ได้แน่นอน); ความเร็ว 90 KIAS จาก Vy/VY ของแหล่งแบบนั้น"
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
     "base": 78,
     "final": 73,
     "flapsAt": {
      "abeam": "TO",
      "base": "TO",
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
    "note": "ค่าประมาณบางขา: ค่าที่มีแหล่งตาม §09.1.3 ส่วนขาที่ไม่มีแหล่งประมาณตาม §09.1.5 (final = ความเร็ว approach ของ POH/AFM หรือ 1.3 VS0 ปัดเป็นเลขลงท้าย 0/5 ที่ใกล้ที่สุด; base = final + 5–10; abeam = base + 5–10 ≤ VFE; downwind = 1.35–1.5 × final)"
   },
   "stabilised": {
    "v": {
     "Vapp": 73,
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
     "LD6",
     "LD8",
     "LD1",
     "LD4",
     "LO4",
     "LO36"
    ],
    "conf": "ต่ำ",
    "est": true,
    "note": "ค่าประมาณ: Vapp = ความเร็ว final ของ §09.1.3 (วิธี §09.1.5) และรายการแฟลปลงจอดที่ยอมรับเป็นข้อเสนอของผู้เขียน; ช่อง −5/+10 kt รอบ Vapp + ½ gust ใช้กับ common_light.procedures.stabilised_gates"
   },
   "short_field": {
    "v": {
     "landing": {
      "Vapp": 73,
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
    "note": "ค่าประมาณ: ใช้ความเร็ว final ของ §09.1.3 (POH/AFM หรือ 1.3 VS0 ตาม §09.1.5) เพราะไม่มีขั้นตอน short field เฉพาะแบบ"
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
      "TO",
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
    "note": "ค่าประมาณ: ลำดับทั่วไปของ AFH [LO4 p9-11, 9-12] (กำลังเต็ม → ท่าไต่ → แฟลปทีละขั้น → ล้อขึ้นเมื่อไต่ได้แน่นอน); ความเร็ว 67 KIAS จาก Vy/VY ของแหล่งแบบนั้น"
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
     "final": 71,
     "flapsAt": {
      "abeam": "TO",
      "base": "TO",
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
    "note": "ค่าประมาณบางขา: ค่าที่มีแหล่งตาม §09.1.3 ส่วนขาที่ไม่มีแหล่งประมาณตาม §09.1.5 (final = ความเร็ว approach ของ POH/AFM หรือ 1.3 VS0 ปัดเป็นเลขลงท้าย 0/5 ที่ใกล้ที่สุด; base = final + 5–10; abeam = base + 5–10 ≤ VFE; downwind = 1.35–1.5 × final)"
   },
   "stabilised": {
    "v": {
     "Vapp": 71,
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
     "LD8",
     "LD6",
     "LO4",
     "LO36"
    ],
    "conf": "ต่ำ",
    "est": true,
    "note": "ค่าประมาณ: Vapp = ความเร็ว final ของ §09.1.3 (วิธี §09.1.5) และรายการแฟลปลงจอดที่ยอมรับเป็นข้อเสนอของผู้เขียน; ช่อง −5/+10 kt รอบ Vapp + ½ gust ใช้กับ common_light.procedures.stabilised_gates"
   },
   "short_field": {
    "v": {
     "landing": {
      "Vapp": 71,
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
    "note": "ค่าประมาณ: ใช้ความเร็ว final ของ §09.1.3 (POH/AFM หรือ 1.3 VS0 ตาม §09.1.5) เพราะไม่มีขั้นตอน short field เฉพาะแบบ"
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
      "TO",
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
    "note": "ค่าประมาณ: ลำดับทั่วไปของ AFH [LO4 p9-11, 9-12] (กำลังเต็ม → ท่าไต่ → แฟลปทีละขั้น → ล้อขึ้นเมื่อไต่ได้แน่นอน); ความเร็ว 66 KIAS จาก Vy/VY ของแหล่งแบบนั้น"
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
    "note": "ค่าประมาณบางขา: ค่าที่มีแหล่งตาม §09.1.3 ส่วนขาที่ไม่มีแหล่งประมาณตาม §09.1.5 (final = ความเร็ว approach ของ POH/AFM หรือ 1.3 VS0 ปัดเป็นเลขลงท้าย 0/5 ที่ใกล้ที่สุด; base = final + 5–10; abeam = base + 5–10 ≤ VFE; downwind = 1.35–1.5 × final)"
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
    "est": true,
    "note": "ค่าประมาณ: Vapp = ความเร็ว final ของ §09.1.3 (วิธี §09.1.5) และรายการแฟลปลงจอดที่ยอมรับเป็นข้อเสนอของผู้เขียน; ช่อง −5/+10 kt รอบ Vapp + ½ gust ใช้กับ common_light.procedures.stabilised_gates"
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
    "note": "ค่าประมาณ: ลำดับทั่วไปของ AFH [LO4 p9-11, 9-12] (กำลังเต็ม → ท่าไต่ → แฟลปทีละขั้น → ล้อขึ้นเมื่อไต่ได้แน่นอน); ความเร็ว 79 KIAS จาก Vy/VY ของแหล่งแบบนั้น"
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
     "LO24"
    ],
    "conf": "ต่ำ",
    "est": false,
    "note": "ความเร็ว แฟลป และกำลังแต่ละขาจาก flashcard ของโรงเรียน [LO24] (ตติยภูมิ ไม่ใช่ POH) ความเชื่อมั่นต่ำ"
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
     "LO4",
     "LO36"
    ],
    "conf": "กลาง",
    "est": false,
    "note": "Vapp = ความเร็ว final ของแบบตามแหล่งใน §09.1.3; รายการแฟลปลงจอดที่ยอมรับเป็นข้อเสนอ; ช่อง −5/+10 kt รอบ Vapp + ½ gust ใช้กับ common_light.procedures.stabilised_gates"
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
     "LO24"
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
      "UP"
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
     "LO4"
    ],
    "conf": "ต่ำ",
    "est": false,
    "note": "ลำดับและความเร็วจาก flashcard ของโรงเรียน [LO24] (ตติยภูมิ) สอดคล้องกับ AFH [LO4 p9-11]"
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
     "climb": 83,
     "downwind": 100,
     "abeam": 90,
     "base": 80,
     "final": 70,
     "flapsAt": {
      "abeam": "TO",
      "base": "TO",
      "final": "FULL"
     }
    },
    "u": "kt IAS",
    "scope": "aircraft",
    "src": [
     "LO26",
     "LO27"
    ],
    "conf": "ต่ำ",
    "est": true,
    "note": "ค่าประมาณบางขา: ค่าที่มีแหล่งตาม §09.1.3 ส่วนขาที่ไม่มีแหล่งประมาณตาม §09.1.5 (final = ความเร็ว approach ของ POH/AFM หรือ 1.3 VS0 ปัดเป็นเลขลงท้าย 0/5 ที่ใกล้ที่สุด; base = final + 5–10; abeam = base + 5–10 ≤ VFE; downwind = 1.35–1.5 × final)"
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
     "LO26",
     "LO27",
     "LO4",
     "LO36"
    ],
    "conf": "ต่ำ",
    "est": true,
    "note": "ค่าประมาณ: Vapp = ความเร็ว final ของ §09.1.3 (วิธี §09.1.5) และรายการแฟลปลงจอดที่ยอมรับเป็นข้อเสนอของผู้เขียน; ช่อง −5/+10 kt รอบ Vapp + ½ gust ใช้กับ common_light.procedures.stabilised_gates"
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
     "LO27"
    ],
    "conf": "ต่ำ",
    "est": true,
    "note": "ค่าประมาณ: ใช้ความเร็ว final ของ §09.1.3 (POH/AFM หรือ 1.3 VS0 ตาม §09.1.5) เพราะไม่มีขั้นตอน short field เฉพาะแบบ"
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
     "LO5",
     "LO6"
    ],
    "conf": "กลาง",
    "est": true,
    "note": "ค่าประมาณ: ใช้เทคนิคทั่วไปของ AFH [LO5 p9-23–9-24][LO6 p6-13] เพราะไม่มีตัวเลขเฉพาะแบบ"
   },
   "go_around": {
    "v": {
     "speed": 83,
     "flapsSeq": [
      "TO",
      "UP"
     ],
     "steps": [
      "full power",
      "flaps T/O",
      "pitch Vy 83",
      "positive rate: gear up",
      "flaps UP"
     ]
    },
    "u": "kt IAS",
    "scope": "aircraft",
    "src": [
     "LO26",
     "LO27",
     "LO4"
    ],
    "conf": "ต่ำ",
    "est": true,
    "note": "ค่าประมาณ: ลำดับทั่วไปของ AFH [LO4 p9-11, 9-12] (กำลังเต็ม → ท่าไต่ → แฟลปทีละขั้น → ล้อขึ้นเมื่อไต่ได้แน่นอน); ความเร็ว 83 KIAS จาก Vy/VY ของแหล่งแบบนั้น"
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
     "final": 50,
     "flapsAt": {
      "abeam": "TO",
      "base": "TO",
      "final": "LAND"
     }
    },
    "u": "kt IAS",
    "scope": "aircraft",
    "src": [
     "LO28",
     "LO29",
     "LO30"
    ],
    "conf": "ต่ำ",
    "est": true,
    "note": "ค่าประมาณบางขา: ค่าที่มีแหล่งตาม §09.1.3 ส่วนขาที่ไม่มีแหล่งประมาณตาม §09.1.5 (final = ความเร็ว approach ของ POH/AFM หรือ 1.3 VS0 ปัดเป็นเลขลงท้าย 0/5 ที่ใกล้ที่สุด; base = final + 5–10; abeam = base + 5–10 ≤ VFE; downwind = 1.35–1.5 × final)"
   },
   "stabilised": {
    "v": {
     "Vapp": 50,
     "window_kt": [
      -5,
      10
     ],
     "landingFlaps": [
      "LAND",
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
     "LO4",
     "LO36"
    ],
    "conf": "ต่ำ",
    "est": true,
    "note": "ค่าประมาณ: Vapp = ความเร็ว final ของ §09.1.3 (วิธี §09.1.5) และรายการแฟลปลงจอดที่ยอมรับเป็นข้อเสนอของผู้เขียน; ช่อง −5/+10 kt รอบ Vapp + ½ gust ใช้กับ common_light.procedures.stabilised_gates"
   },
   "short_field": {
    "v": {
     "landing": {
      "Vapp": 50,
      "note": "ไม่มีขั้นตอน short field ในแหล่งที่อ่านได้"
     }
    },
    "u": "kt IAS",
    "scope": "aircraft",
    "src": [
     "LO28",
     "LO29",
     "LO30"
    ],
    "conf": "ต่ำ",
    "est": true,
    "note": "ค่าประมาณ: ใช้ความเร็ว final ของ §09.1.3 (POH/AFM หรือ 1.3 VS0 ตาม §09.1.5) เพราะไม่มีขั้นตอน short field เฉพาะแบบ"
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
     "LO4"
    ],
    "conf": "ต่ำ",
    "est": true,
    "note": "ค่าประมาณ: ลำดับทั่วไปของ AFH [LO4 p9-11, 9-12] (กำลังเต็ม → ท่าไต่ → แฟลปทีละขั้น → ล้อขึ้นเมื่อไต่ได้แน่นอน); ความเร็ว 60 KIAS จาก Vy/VY ของแหล่งแบบนั้น"
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
     "final": 75,
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
     "LO37",
     "LO7"
    ],
    "conf": "ต่ำ",
    "est": true,
    "note": "ค่าประมาณบางขา: ค่าที่มีแหล่งตาม §09.1.3 ส่วนขาที่ไม่มีแหล่งประมาณตาม §09.1.5 (final = ความเร็ว approach ของ POH/AFM หรือ 1.3 VS0 ปัดเป็นเลขลงท้าย 0/5 ที่ใกล้ที่สุด; base = final + 5–10; abeam = base + 5–10 ≤ VFE; downwind = 1.35–1.5 × final)"
   },
   "stabilised": {
    "v": {
     "Vapp": 75,
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
     "LO37",
     "LO7",
     "LO4",
     "LO36"
    ],
    "conf": "ต่ำ",
    "est": true,
    "note": "ค่าประมาณ: Vapp = ความเร็ว final ของ §09.1.3 (วิธี §09.1.5) และรายการแฟลปลงจอดที่ยอมรับเป็นข้อเสนอของผู้เขียน; ช่อง −5/+10 kt รอบ Vapp + ½ gust ใช้กับ common_light.procedures.stabilised_gates"
   },
   "short_field": {
    "v": {
     "landing": {
      "Vapp": 75,
      "note": "ไม่มีขั้นตอน short field ในแหล่งที่อ่านได้"
     }
    },
    "u": "kt IAS",
    "scope": "aircraft",
    "src": [
     "LO31",
     "LO32",
     "LO37",
     "LO7"
    ],
    "conf": "ต่ำ",
    "est": true,
    "note": "ค่าประมาณ: ใช้ความเร็ว final ของ §09.1.3 (POH/AFM หรือ 1.3 VS0 ตาม §09.1.5) เพราะไม่มีขั้นตอน short field เฉพาะแบบ"
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
     "LO37",
     "LO7",
     "LO4"
    ],
    "conf": "ต่ำ",
    "est": true,
    "note": "ค่าประมาณ: ลำดับทั่วไปของ AFH [LO4 p9-11, 9-12] (กำลังเต็ม → ท่าไต่ → แฟลปทีละขั้น → ล้อขึ้นเมื่อไต่ได้แน่นอน); ไม่มีความเร็วเฉพาะแบบ"
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
     "climb": 90,
     "downwind": 100,
     "abeam": 90,
     "base": 80,
     "final": 70,
     "flapsAt": {
      "abeam": "10",
      "base": "20",
      "final": "FULL"
     }
    },
    "u": "kt IAS",
    "scope": "aircraft",
    "src": [
     "LO33"
    ],
    "conf": "ต่ำ",
    "est": true,
    "note": "ค่าประมาณบางขา: ค่าที่มีแหล่งตาม §09.1.3 ส่วนขาที่ไม่มีแหล่งประมาณตาม §09.1.5 (final = ความเร็ว approach ของ POH/AFM หรือ 1.3 VS0 ปัดเป็นเลขลงท้าย 0/5 ที่ใกล้ที่สุด; base = final + 5–10; abeam = base + 5–10 ≤ VFE; downwind = 1.35–1.5 × final)"
   },
   "stabilised": {
    "v": {
     "Vapp": 70,
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
     "LO4",
     "LO36"
    ],
    "conf": "ต่ำ",
    "est": true,
    "note": "ค่าประมาณ: Vapp = ความเร็ว final ของ §09.1.3 (วิธี §09.1.5) และรายการแฟลปลงจอดที่ยอมรับเป็นข้อเสนอของผู้เขียน; ช่อง −5/+10 kt รอบ Vapp + ½ gust ใช้กับ common_light.procedures.stabilised_gates"
   },
   "short_field": {
    "v": {
     "landing": {
      "Vapp": 70,
      "note": "ไม่มีขั้นตอน short field ในแหล่งที่อ่านได้"
     }
    },
    "u": "kt IAS",
    "scope": "aircraft",
    "src": [
     "LO33"
    ],
    "conf": "ต่ำ",
    "est": true,
    "note": "ค่าประมาณ: ใช้ความเร็ว final ของ §09.1.3 (POH/AFM หรือ 1.3 VS0 ตาม §09.1.5) เพราะไม่มีขั้นตอน short field เฉพาะแบบ"
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
      "0"
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
     "LO4"
    ],
    "conf": "ต่ำ",
    "est": true,
    "note": "ค่าประมาณ: ลำดับทั่วไปของ AFH [LO4 p9-11, 9-12] (กำลังเต็ม → ท่าไต่ → แฟลปทีละขั้น → ล้อขึ้นเมื่อไต่ได้แน่นอน); ไม่มีความเร็วเฉพาะแบบ"
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
      "final": "FULL"
     }
    },
    "u": "kt IAS",
    "scope": "aircraft",
    "src": [
     "LO34"
    ],
    "conf": "ต่ำ",
    "est": true,
    "note": "ค่าประมาณบางขา: ค่าที่มีแหล่งตาม §09.1.3 ส่วนขาที่ไม่มีแหล่งประมาณตาม §09.1.5 (final = ความเร็ว approach ของ POH/AFM หรือ 1.3 VS0 ปัดเป็นเลขลงท้าย 0/5 ที่ใกล้ที่สุด; base = final + 5–10; abeam = base + 5–10 ≤ VFE; downwind = 1.35–1.5 × final)"
   },
   "stabilised": {
    "v": {
     "Vapp": 60,
     "window_kt": [
      -5,
      10
     ],
     "landingFlaps": [
      "FULL",
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
     "LO4",
     "LO36"
    ],
    "conf": "ต่ำ",
    "est": true,
    "note": "ค่าประมาณ: Vapp = ความเร็ว final ของ §09.1.3 (วิธี §09.1.5) และรายการแฟลปลงจอดที่ยอมรับเป็นข้อเสนอของผู้เขียน; ช่อง −5/+10 kt รอบ Vapp + ½ gust ใช้กับ common_light.procedures.stabilised_gates"
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
     "LO34"
    ],
    "conf": "ต่ำ",
    "est": true,
    "note": "ค่าประมาณ: ใช้ความเร็ว final ของ §09.1.3 (POH/AFM หรือ 1.3 VS0 ตาม §09.1.5) เพราะไม่มีขั้นตอน short field เฉพาะแบบ"
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
     "LO4"
    ],
    "conf": "ต่ำ",
    "est": true,
    "note": "ค่าประมาณ: ลำดับทั่วไปของ AFH [LO4 p9-11, 9-12] (กำลังเต็ม → ท่าไต่ → แฟลปทีละขั้น → ล้อขึ้นเมื่อไต่ได้แน่นอน); ไม่มีความเร็วเฉพาะแบบ"
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
     "climb": 120,
     "downwind": 140,
     "abeam": 120,
     "base": 110,
     "final": 92,
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
     "LO4"
    ],
    "conf": "ต่ำ",
    "est": true,
    "note": "ค่าประมาณบางขา: ค่าที่มีแหล่งตาม §09.1.3 ส่วนขาที่ไม่มีแหล่งประมาณตาม §09.1.5 (final = ความเร็ว approach ของ POH/AFM หรือ 1.3 VS0 ปัดเป็นเลขลงท้าย 0/5 ที่ใกล้ที่สุด; base = final + 5–10; abeam = base + 5–10 ≤ VFE; downwind = 1.35–1.5 × final)"
   },
   "stabilised": {
    "v": {
     "Vapp": 92,
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
     "LO4",
     "LO36"
    ],
    "conf": "ต่ำ",
    "est": true,
    "note": "ค่าประมาณ: Vapp = ความเร็ว final ของ §09.1.3 (วิธี §09.1.5) และรายการแฟลปลงจอดที่ยอมรับเป็นข้อเสนอของผู้เขียน; ช่อง −5/+10 kt รอบ Vapp + ½ gust ใช้กับ common_light.procedures.stabilised_gates"
   },
   "short_field": {
    "v": {
     "landing": {
      "Vapp": 92,
      "note": "ไม่มีขั้นตอน short field ในแหล่งที่อ่านได้"
     }
    },
    "u": "kt IAS",
    "scope": "aircraft",
    "src": [
     "LP1",
     "LP20",
     "LO4"
    ],
    "conf": "ต่ำ",
    "est": true,
    "note": "ค่าประมาณ: ใช้ความเร็ว final ของ §09.1.3 (POH/AFM หรือ 1.3 VS0 ตาม §09.1.5) เพราะไม่มีขั้นตอน short field เฉพาะแบบ"
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
     "LO4"
    ],
    "conf": "ต่ำ",
    "est": true,
    "note": "ค่าประมาณ: ลำดับทั่วไปของ AFH [LO4 p9-11, 9-12] (กำลังเต็ม → ท่าไต่ → แฟลปทีละขั้น → ล้อขึ้นเมื่อไต่ได้แน่นอน); ไม่มีความเร็วเฉพาะแบบ"
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
     "climb": 125,
     "downwind": 150,
     "abeam": 125,
     "base": 115,
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
     "LP2",
     "LP20",
     "LO4"
    ],
    "conf": "ต่ำ",
    "est": true,
    "note": "ค่าประมาณบางขา: ค่าที่มีแหล่งตาม §09.1.3 ส่วนขาที่ไม่มีแหล่งประมาณตาม §09.1.5 (final = ความเร็ว approach ของ POH/AFM หรือ 1.3 VS0 ปัดเป็นเลขลงท้าย 0/5 ที่ใกล้ที่สุด; base = final + 5–10; abeam = base + 5–10 ≤ VFE; downwind = 1.35–1.5 × final)"
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
     "LP2",
     "LP20",
     "LO4",
     "LO36"
    ],
    "conf": "ต่ำ",
    "est": true,
    "note": "ค่าประมาณ: Vapp = ความเร็ว final ของ §09.1.3 (วิธี §09.1.5) และรายการแฟลปลงจอดที่ยอมรับเป็นข้อเสนอของผู้เขียน; ช่อง −5/+10 kt รอบ Vapp + ½ gust ใช้กับ common_light.procedures.stabilised_gates"
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
     "LP2",
     "LP20",
     "LO4"
    ],
    "conf": "ต่ำ",
    "est": true,
    "note": "ค่าประมาณ: ใช้ความเร็ว final ของ §09.1.3 (POH/AFM หรือ 1.3 VS0 ตาม §09.1.5) เพราะไม่มีขั้นตอน short field เฉพาะแบบ"
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
     "LO4"
    ],
    "conf": "ต่ำ",
    "est": true,
    "note": "ค่าประมาณ: ลำดับทั่วไปของ AFH [LO4 p9-11, 9-12] (กำลังเต็ม → ท่าไต่ → แฟลปทีละขั้น → ล้อขึ้นเมื่อไต่ได้แน่นอน); ไม่มีความเร็วเฉพาะแบบ"
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
     "climb": 125,
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
    "note": "ค่าประมาณ: final = AC.Vapp 95 ของซิม (src/20-flight.js:117), climb = VY 125 ของ trainer_r2 (หัวข้อ 07), ขาอื่นตาม §09.1.5 เทียบ pc9m; แฟลป TO = AC.flaps 0.5, LDG = 1.0"
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
     "LO36"
    ],
    "conf": "ต่ำ",
    "est": true,
    "note": "ค่าประมาณ: Vapp = ความเร็ว final ของ §09.1.3 (วิธี §09.1.5) และรายการแฟลปลงจอดที่ยอมรับเป็นข้อเสนอของผู้เขียน; ช่อง −5/+10 kt รอบ Vapp + ½ gust ใช้กับ common_light.procedures.stabilised_gates"
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
    "note": "ค่าประมาณ: ใช้ความเร็ว final ของ §09.1.3 (POH/AFM หรือ 1.3 VS0 ตาม §09.1.5) เพราะไม่มีขั้นตอน short field เฉพาะแบบ"
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
    "note": "ค่าประมาณ: ลำดับทั่วไปของ AFH [LO4 p9-11, 9-12] (กำลังเต็ม → ท่าไต่ → แฟลปทีละขั้น → ล้อขึ้นเมื่อไต่ได้แน่นอน); ไม่มีความเร็วเฉพาะแบบ"
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
    "note": "ค่าประมาณบางขา: ค่าที่มีแหล่งตาม §09.1.3 ส่วนขาที่ไม่มีแหล่งประมาณตาม §09.1.5 (final = ความเร็ว approach ของ POH/AFM หรือ 1.3 VS0 ปัดเป็นเลขลงท้าย 0/5 ที่ใกล้ที่สุด; base = final + 5–10; abeam = base + 5–10 ≤ VFE; downwind = 1.35–1.5 × final)"
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
     "LO4",
     "LO36"
    ],
    "conf": "ต่ำ",
    "est": true,
    "note": "ค่าประมาณ: Vapp = ความเร็ว final ของ §09.1.3 (วิธี §09.1.5) และรายการแฟลปลงจอดที่ยอมรับเป็นข้อเสนอของผู้เขียน; ช่อง −5/+10 kt รอบ Vapp + ½ gust ใช้กับ common_light.procedures.stabilised_gates"
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
    "note": "ค่าประมาณ: ลำดับทั่วไปของ AFH [LO4 p9-11, 9-12] (กำลังเต็ม → ท่าไต่ → แฟลปทีละขั้น → ล้อขึ้นเมื่อไต่ได้แน่นอน); ไม่มีความเร็วเฉพาะแบบ"
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
     "LO13"
    ],
    "conf": "สูง",
    "est": false,
    "note": "FAA: AIM 4-3-3 และ AC 90-66C App A (เฮลิคอปเตอร์ 500 ft: AC 90-66C 12.1.4 และ App A ข้อ 4); VTBD = join height ของ 03R/21L ใน AD 2.20 ข้อ 4.2.2 (AIRAC 2022-08-11 และ 2024-02-22 ตรงกัน); ค่าเทอร์โบพร็อปของซิมย้ายไป pattern_geometry"
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
      "class": "C"
     },
     "freq_MHz": {
      "TWR": 118.1,
      "GND": 121.9,
      "DEL": 127.7,
      "ATIS": 126.4
     },
     "speedLimit_kt": 250,
     "rwy03R_21L": "normally military, civil possible",
     "sim_03L_21R": "fictional west circuit (03L left, 21R right)"
    },
    "u": "-",
    "scope": "environment",
    "src": [
     "LO13"
    ],
    "conf": "กลาง",
    "est": false,
    "note": "AIP AD 2 VTBD: AD 2.20 ข้อ 4.1–4.2.3 และ 5.1 ตรงกันใน AIRAC 2022-08-11 และ 2024-02-22 (ผู้ตรวจทานเปิดอ่าน 2026-11-19); AD 2.17–2.18 จาก AIRAC 2022 และ ATIS 126.4 ตรงกับ AIRAC 2026-07-09; AIRAC ปัจจุบัน 29 OCT 2026 (AMDT 11/26) เปิดผ่านเครื่องมือไม่ถึง AD 2.20 จึงต้องตรวจก่อนใช้; วงจรของ 03L/21R เป็นข้อเสนอสมมติ"
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
