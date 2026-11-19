```json
{
 "common_light": {
  "ops": {
   "rules_of_thumb": {
    "v": {
     "fpm_per_deg_pitch": "1.77 × KTAS (≈ 2 × KIAS ตาม SOP)",
     "vs_on_3deg_fpm": "5.31 × GS kt",
     "example": {
      "65kt": 345,
      "84kt": 446,
      "100kt": 531
     }
    },
    "u": "fpm",
    "scope": "sim",
    "src": [
     "LH0",
     "LH10"
    ],
    "conf": "สูง",
    "est": false,
    "note": "ฟิสิกส์ (T-LH-04, 05)"
   },
   "gust_additive": {
    "v": "½ gust factor",
    "u": "kt",
    "scope": "sim",
    "src": [
     "LH1"
    ],
    "conf": "สูง",
    "est": false,
    "note": "AFH p.9-20"
   },
   "roundout_start_ft": {
    "v": [
     10,
     20
    ],
    "u": "ft",
    "scope": "sim",
    "src": [
     "LH1"
    ],
    "conf": "สูง",
    "est": false,
    "note": "AFH p.9-8 เครื่องเล็กลูกสูบ; เทอร์โบพร็อปฝึก 5–10 ft [LH15]"
   },
   "hard_landing_ref": {
    "v": {
     "drop_6in_fpm": 340,
     "load_g": [
      3,
      4
     ]
    },
    "u": "fpm, g",
    "scope": "sim",
    "src": [
     "LH1"
    ],
    "conf": "สูง",
    "est": false,
    "note": "AFH p.9-35"
   },
   "control_force_limits": {
    "v": {
     "temporary_lbf": {
      "pitch_stick": 60,
      "pitch_wheel2": 75,
      "pitch_wheel1": 50,
      "roll_stick": 30,
      "roll_wheel2": 50,
      "roll_wheel1": 25,
      "yaw": 150
     },
     "prolonged_lbf": {
      "pitch": 10,
      "roll": 5,
      "yaw": 20
     }
    },
    "u": "lbf",
    "scope": "sim",
    "src": [
     "LH30"
    ],
    "conf": "สูง",
    "est": false,
    "note": "14 CFR 23.143(c) ก่อน Amdt 23-64"
   },
   "certification_xwind": {
    "v": "≥ 0.2 VS0 ที่ 90°",
    "u": "kt",
    "scope": "sim",
    "src": [
     "LH1"
    ],
    "conf": "สูง",
    "est": false,
    "note": "AFH p.9-19"
   },
   "accident_stats": {
    "v": {
     "instr_landing_2001_2010": 830,
     "share_of_landing": 0.22,
     "solo_student": 457,
     "dual": 373,
     "directional_control_share": 0.5,
     "solo_hard_or_stall": 228,
     "fatal_training_2000_2015": {
      "accidents": 240,
      "fatalities": 432,
      "loci": 129,
      "loci_share": 0.54,
      "stall_spin_of_loci": 0.81,
      "pattern_share_of_loci": 0.42,
      "takeoff_ga_share_of_loci": 0.29
     },
     "landing_accidents_per_year": {
      "2013": 58,
      "2014": 52,
      "2004_08": 95,
      "2009_12": 70
     }
    },
    "u": "count, -",
    "scope": "environment",
    "src": [
     "LH5",
     "LH6",
     "LH7"
    ],
    "conf": "กลาง",
    "est": false,
    "note": "สหรัฐฯ (NTSB ผ่าน AOPA); takeoff_ga_share_of_loci = ขึ้นบิน/ไต่และ go-around รวมกัน (อยู่ในกลุ่ม pattern 42 %); solo student 2001–2010: แตะก่อนรันเวย์ 2, overrun 8"
   },
   "test_standards": {
    "v": {
     "faa_private": {
      "app_kt": [
       -5,
       10
      ],
      "td_beyond_ft": 400,
      "short_td_ft": 200,
      "alt_ft": 100,
      "pattern_kt": 10,
      "hdg_deg": 10,
      "vy_kt": [
       -5,
       10
      ]
     },
     "faa_commercial": {
      "app_kt": [
       -5,
       5
      ],
      "td_beyond_ft": 200,
      "short_td_ft": 100,
      "alt_ft": 100,
      "pattern_kt": 10,
      "vy_kt": [
       -5,
       5
      ]
     },
     "afh_stabilised": {
      "app_kt": [
       -5,
       10
      ],
      "bank_max_deg": 15
     },
     "caat_lapl": {
      "app_kt": [
       -5,
       15
      ],
      "other_kt": 15,
      "alt_ft": 150
     },
     "caat_cpl": {
      "app_kt": [
       -5,
       5
      ],
      "other_kt": 10,
      "alt_ft": 100,
      "hdg_deg": 10
     },
     "easa_ppl": {
      "app_kt": [
       -5,
       15
      ],
      "other_kt": 15,
      "alt_ft": 150,
      "hdg_deg": 10
     }
    },
    "u": "kt, ft, deg",
    "scope": "sim",
    "src": [
     "LH1",
     "LH2",
     "LH3",
     "LH31",
     "LH32",
     "LH33"
    ],
    "conf": "สูง",
    "est": false,
    "note": "ACS-6C/7B (Nov 2023); AFH p.9-6; กพท. LAPL ยก AMC1 FCL.125 (p.6-1), CPL ยก TCAR PEL Part FCL Appendix 4 (p.6-2); EASA PPL ตาม AMC1 FCL.215/FCL.235"
   }
  },
  "evaluator": {
   "levels": {
    "v": {
     "ppl": {
      "spd_hi": 10,
      "spd_lo": -5,
      "long_ft": 400
     },
     "cpl": {
      "spd_hi": 5,
      "spd_lo": -5,
      "long_ft": 200
     }
    },
    "u": "kt, ft",
    "scope": "sim",
    "src": [
     "LH2",
     "LH3",
     "LH32"
    ],
    "conf": "สูง",
    "est": false,
    "note": "ppl = FAA Private (กพท. LAPL/EASA PPL หลวมกว่า +15)"
   },
   "gates": {
    "v": {
     "gate_hi_ft": 500,
     "gate_lo_ft": 300,
     "ifr_gate_ft": 1000,
     "speed": "Vapp −5/+10 (cpl ±5)",
     "vs_min_fpm": -1000,
     "bank_max_deg": 15,
     "path_dots": 1,
     "config": "แฟลปลงจอด + ล้อลง"
    },
    "u": "ft, kt, fpm, deg, dots",
    "scope": "sim",
    "src": [
     "LH1",
     "LH2",
     "R1"
    ],
    "conf": "กลาง",
    "est": false,
    "note": "แทน gate 500/200 ft ของวันนี้"
   },
   "thresholds": {
    "v": {
     "gate_hi_ft": 500,
     "gate_lo_ft": 300,
     "spd_lo": -5,
     "spd_hi_ppl": 10,
     "spd_hi_cpl": 5,
     "sink_max_fpm": 1000,
     "sink_low_fpm": 800,
     "sink_low_ft": 300,
     "bank_final_deg": 15,
     "dots": 1,
     "dots_hold_s": 5,
     "slow_hold_s": 3,
     "fast_hold_s": 5,
     "stall_margin_kt": 5,
     "skid_beta_deg": 5,
     "skid_bank_deg": 10,
     "skid_below_ft": 1000,
     "flare_high_ft": 6,
     "flare_hold_s": 1.5,
     "late_flare_ft": 5,
     "late_flare_frac": 0.75,
     "late_flare_td": 300,
     "balloon_ft": 3,
     "bounce_ft": 1,
     "bounce_s": 0.3,
     "bounce_big_ft": 5,
     "hard_fpm": 360,
     "very_hard_fpm": 600,
     "crab_td_deg": 5,
     "drift_td_ms": 1.6,
     "cl_minor_m": 5,
     "cl_major_m": 10,
     "long_ppl_ft": 400,
     "long_cpl_ft": 200,
     "float_s": 6,
     "float_ft": 3,
     "dir_hdg_deg": 10,
     "dir_latv_ms": 2,
     "dir_min_gs": 10,
     "ail_rollout_gs": 20,
     "ail_xw_kt": 5,
     "brake_hi_frac": 0.8,
     "carb_thr": 0.35,
     "carb_s": 10,
     "mixture_rich": 0.9,
     "mixture_ft": 1000,
     "trim_de_deg": 3,
     "trim_s": 10,
     "trim_below_ft": 1000,
     "ga_pitch_lead_s": 2,
     "ga_pitch_deg": 5,
     "ga_full_thr": 0.9,
     "ga_flap_s": 3,
     "ga_flap_ft": 300,
     "ga_late_ft": 100,
     "rot_early_kt": 5,
     "rot_pitch_deg": 3,
     "vy_lo": -5,
     "vy_hi": 10,
     "vy_from_ft": 200,
     "vy_to_ft": 700,
     "gear_ft": 500
    },
    "u": "ft, kt, fpm, deg, s, m",
    "scope": "sim",
    "src": [
     "LH0",
     "LH1",
     "LH2",
     "LH3",
     "LH13",
     "LH15",
     "LH30",
     "R1"
    ],
    "conf": "ต่ำ",
    "est": true,
    "note": "ค่าประมาณบางตัว (ดูคอมเมนต์ใน lh_eval.mjs ว่าตัวไหนมาจากแหล่ง ตัวไหนตั้งเอง)"
   },
   "rules": {
    "v": {
     "unstable_500": {
      "phase": "final",
      "sev": "major",
      "pts": 10,
      "src": [
       "LH1",
       "LH2"
      ],
      "th": "ยังไม่ stabilised ที่ 500 ft: ตรวจความเร็ว อัตราร่อน แนว glide path และแฟลปให้ครบก่อนถึงจุดนี้"
     },
     "unstable_300": {
      "phase": "final",
      "sev": "major",
      "pts": 10,
      "src": [
       "LH1"
      ],
      "th": "ต่ำกว่า 300 ft แล้วยังไม่ stabilised ควร go-around ทันที"
     },
     "continued_unstable": {
      "phase": "landing",
      "sev": "critical",
      "pts": 30,
      "src": [
       "LH1"
      ],
      "th": "ลงจอดต่อทั้งที่ approach ไม่ stabilised ต่ำกว่า 300 ft ครั้งหน้าให้ go-around"
     },
     "high_on_path": {
      "phase": "final",
      "sev": "minor",
      "pts": 3,
      "src": [
       "R1",
       "LH1"
      ],
      "th": "สูงกว่า glide path เกิน 1 dot ลดกำลังเล็กน้อยแล้วรักษาความเร็ว อย่าดันหัวลงแรง"
     },
     "low_on_path": {
      "phase": "final",
      "sev": "major",
      "pts": 6,
      "src": [
       "R1",
       "LH1"
      ],
      "th": "ต่ำกว่า glide path เกิน 1 dot เพิ่มกำลังพร้อมยกหัวเล็กน้อย อย่าเก็บแฟลป"
     },
     "fast": {
      "phase": "final",
      "sev": "minor",
      "pts": 3,
      "src": [
       "LH2",
       "LH3"
      ],
      "th": "ความเร็ว approach สูงเกินเกณฑ์ ระวังลอยเลยจุดแตะ"
     },
     "slow": {
      "phase": "final",
      "sev": "major",
      "pts": 8,
      "src": [
       "LH2",
       "LH1"
      ],
      "th": "ความเร็ว approach ต่ำกว่าเกณฑ์ เพิ่มกำลังทันที"
     },
     "near_stall": {
      "phase": "any",
      "sev": "critical",
      "pts": 30,
      "src": [
       "LM3",
       "LH4"
      ],
      "th": "ใกล้ stall ที่ความสูงต่ำ ลดมุมปะทะ เพิ่มกำลังเต็ม แล้วไต่"
     },
     "sink_high": {
      "phase": "final",
      "sev": "major",
      "pts": 8,
      "src": [
       "LH1"
      ],
      "th": "อัตราร่อนสูงเกินไป ลดอัตราร่อนก่อนเข้าใกล้พื้น"
     },
     "bank_final": {
      "phase": "final",
      "sev": "minor",
      "pts": 3,
      "src": [
       "LH1"
      ],
      "th": "มุมเอียงบน final เกิน 15° ปรับแนวให้เสร็จเร็วกว่านี้"
     },
     "skid_turn": {
      "phase": "base",
      "sev": "major",
      "pts": 8,
      "src": [
       "LH1",
       "LH6"
      ],
      "th": "เลี้ยวแบบ cross-control ใกล้พื้น (ball ไม่อยู่กลาง) เสี่ยง stall/spin ใช้ rudder ให้ประสาน"
     },
     "stall_warning": {
      "phase": "any",
      "sev": "major",
      "pts": 10,
      "src": [
       "LH4",
       "LH2"
      ],
      "th": "สัญญาณเตือน stall ดัง ลดมุมปะทะทันที"
     },
     "high_flare": {
      "phase": "flare",
      "sev": "major",
      "pts": 6,
      "src": [
       "LH1"
      ],
      "th": "flare สูงเกินไป เครื่องลอยอยู่เหนือพื้นแล้วความเร็วลด ระวังตก"
     },
     "late_flare": {
      "phase": "flare",
      "sev": "major",
      "pts": 8,
      "src": [
       "LH1",
       "LH5"
      ],
      "th": "flare ช้าเกินไปหรือไม่ได้ flare ทำให้กระแทก เริ่มดึงคันที่ 10–20 ft"
     },
     "balloon": {
      "phase": "flare",
      "sev": "minor",
      "pts": 4,
      "src": [
       "LH1"
      ],
      "th": "ดึงคันเร็วเกินไปจนเครื่องลอยขึ้น (balloon) ค้าง attitude และเติมกำลังเล็กน้อย"
     },
     "float": {
      "phase": "flare",
      "sev": "minor",
      "pts": 3,
      "src": [
       "LH1"
      ],
      "th": "ลอยนานเกินไป ความเร็วตอนข้าม threshold สูงเกิน"
     },
     "bounce": {
      "phase": "landing",
      "sev": "major",
      "pts": 8,
      "src": [
       "LH1"
      ],
      "th": "เครื่องเด้งหลังแตะพื้น ถ้าเด้งสูงให้ go-around กำลังเต็ม"
     },
     "bounce_big": {
      "phase": "landing",
      "sev": "critical",
      "pts": 20,
      "src": [
       "LH1"
      ],
      "th": "เด้งสูงเกิน 5 ft ต้อง go-around ไม่ใช่พยายามลงต่อ"
     },
     "porpoise": {
      "phase": "landing",
      "sev": "critical",
      "pts": 20,
      "src": [
       "LH1"
      ],
      "th": "porpoising: ล้อหน้าแตะก่อนแล้วเด้งซ้ำ ตั้ง attitude ลงจอดหรือ go-around"
     },
     "nose_first": {
      "phase": "landing",
      "sev": "major",
      "pts": 5,
      "src": [
       "LH1",
       "R1"
      ],
      "th": "ล้อหน้าแตะก่อนล้อหลัก ยกหัวให้ถึง attitude ลงจอด"
     },
     "hard_landing": {
      "phase": "landing",
      "sev": "major",
      "pts": 0,
      "src": [
       "LH1",
       "R1"
      ],
      "th": "แตะพื้นแรง (อัตราจมเกิน 360 fpm) flare ให้ต่อเนื่องจนล้อแตะ"
     },
     "very_hard_landing": {
      "phase": "landing",
      "sev": "critical",
      "pts": 0,
      "src": [
       "R1"
      ],
      "th": "แตะพื้นแรงมาก (เกิน 600 fpm) ต้องตรวจโครงสร้างเครื่อง"
     },
     "side_load": {
      "phase": "landing",
      "sev": "major",
      "pts": 5,
      "src": [
       "LH1",
       "LH2"
      ],
      "th": "แตะพื้นขณะยังมี crab หรือ drift ใช้ wing-low ให้หัวตรงกับรันเวย์"
     },
     "off_centre": {
      "phase": "landing",
      "sev": "minor",
      "pts": 0,
      "src": [
       "R1"
      ],
      "th": "แตะพื้นห่างเส้นกลางรันเวย์"
     },
     "short_landing": {
      "phase": "landing",
      "sev": "critical",
      "pts": 0,
      "src": [
       "LH5",
       "R1"
      ],
      "th": "แตะพื้นก่อน threshold"
     },
     "long_landing": {
      "phase": "landing",
      "sev": "major",
      "pts": 0,
      "src": [
       "LH2",
       "LH3"
      ],
      "th": "แตะพื้นเลยจุดเป้าเกินเกณฑ์สอบ ถ้าลอยนานควร go-around"
     },
     "dir_control": {
      "phase": "rollout",
      "sev": "major",
      "pts": 10,
      "src": [
       "LH5",
       "LH1"
      ],
      "th": "เสียการควบคุมทิศทางขณะวิ่ง ใช้ rudder ให้ทันและมองไปปลายรันเวย์"
     },
     "excursion": {
      "phase": "rollout",
      "sev": "critical",
      "pts": 0,
      "src": [
       "R1"
      ],
      "th": "ออกนอกรันเวย์"
     },
     "aileron_rollout": {
      "phase": "rollout",
      "sev": "minor",
      "pts": 2,
      "src": [
       "LH1",
       "LH15"
      ],
      "th": "ขณะวิ่งในลมขวาง ให้หมุนพวงมาลัย/คันไปทางลม"
     },
     "brake_fast": {
      "phase": "rollout",
      "sev": "minor",
      "pts": 2,
      "src": [
       "LH15",
       "LH1"
      ],
      "th": "เบรกแรงขณะยังเร็ว ให้ล้อรับน้ำหนักก่อน"
     },
     "carb_heat": {
      "phase": "downwind",
      "sev": "minor",
      "pts": 3,
      "src": [
       "LH13",
       "LH1"
      ],
      "th": "ลดกำลังโดยไม่ดึง carb heat"
     },
     "carb_heat_ga": {
      "phase": "go_around",
      "sev": "minor",
      "pts": 3,
      "src": [
       "LH1"
      ],
      "th": "go-around แล้วยังไม่ดัน carb heat กลับ"
     },
     "mixture": {
      "phase": "final",
      "sev": "minor",
      "pts": 3,
      "src": [
       "LH13"
      ],
      "th": "mixture ยังไม่ rich ระหว่าง approach"
     },
     "trim": {
      "phase": "final",
      "sev": "minor",
      "pts": 2,
      "src": [
       "LH1",
       "LH30"
      ],
      "th": "ยังถือแรงที่คันนานเกินไป trim ให้แรงหมด"
     },
     "gear_up": {
      "phase": "final",
      "sev": "critical",
      "pts": 30,
      "src": [
       "LH29"
      ],
      "th": "ล้อยังไม่ลงที่ 500 ft"
     },
     "ga_late": {
      "phase": "go_around",
      "sev": "major",
      "pts": 6,
      "src": [
       "LH1"
      ],
      "th": "ตัดสินใจ go-around ช้าเกินไป"
     },
     "ga_pitch_first": {
      "phase": "go_around",
      "sev": "major",
      "pts": 6,
      "src": [
       "LH1"
      ],
      "th": "ยกหัวก่อนเพิ่มกำลัง: เพิ่มกำลังเต็มก่อนแล้วจึงตั้ง attitude"
     },
     "ga_flaps_dump": {
      "phase": "go_around",
      "sev": "major",
      "pts": 6,
      "src": [
       "LH1"
      ],
      "th": "เก็บแฟลปทีเดียวหมดขณะต่ำ เครื่องจะจม ให้เก็บเป็นขั้น"
     },
     "ga_no_climb": {
      "phase": "go_around",
      "sev": "major",
      "pts": 6,
      "src": [
       "LH1",
       "LH2"
      ],
      "th": "go-around แล้วยังไม่ไต่ภายใน 5 วินาที"
     },
     "rotate_early": {
      "phase": "takeoff",
      "sev": "minor",
      "pts": 3,
      "src": [
       "LH11"
      ],
      "th": "ยกหัวก่อนถึง VR"
     },
     "vy_hold": {
      "phase": "climb",
      "sev": "minor",
      "pts": 3,
      "src": [
       "LH2"
      ],
      "th": "ความเร็วไต่หลุดเกณฑ์ Vy +10/−5 kt"
     }
    },
    "u": "-",
    "scope": "sim",
    "src": [
     "LH0",
     "LH1",
     "LH2",
     "LH5",
     "LH6"
    ],
    "conf": "กลาง",
    "est": true,
    "note": "ระดับและคะแนนหักเป็นค่าประมาณของหัวข้อนี้; ข้อความไทยเขียนใหม่ทั้งหมด"
   },
   "scoring": {
    "v": {
     "touchdown": {
      "sink": 40,
      "pos": 25,
      "cl": 15,
      "spd": 10,
      "att": 10
     },
     "pos_full_m": [
      "aim − 30",
      "aim + 122 (ppl) / + 61 (cpl)"
     ],
     "pos_partial_m": {
      "10": "aim + 400",
      "18": "aim + 250"
     },
     "spd": "ias ที่ 50 ft ใน Vapp −5/+10 (cpl ±5) และแตะ ≤ Vapp − 5",
     "deduction_by_sev": {
      "minor": [
       2,
       4
      ],
      "major": [
       5,
       10
      ],
      "critical": [
       20,
       30
      ]
     },
     "caps": {
      "short": 20,
      "excursion": 15,
      "sink_gt_600": 35,
      "any_critical": 40
     },
     "pass": "≥ 60 และไม่มี critical",
     "grades": {
      "ดีเยี่ยม": 90,
      "ดี": 75,
      "ผ่าน": 60
     }
    },
    "u": "-",
    "scope": "sim",
    "src": [
     "LH0",
     "LH2",
     "LH3",
     "R1"
    ],
    "conf": "กลาง",
    "est": true,
    "note": "ค่าประมาณ: โครง 100 คะแนนเดิม + หัก + เพดาน"
   },
   "signals_needed": {
    "v": [
     "nz",
     "carbHeat",
     "mixture",
     "deTrim",
     "phase",
     "stallWarn",
     "xw",
     "latV",
     "Recorder: phi, theta, beta, wow"
    ],
    "u": "-",
    "scope": "sim",
    "src": [
     "LH0",
     "R1"
    ],
    "conf": "กลาง",
    "est": false,
    "note": "วันนี้ air.load คือแรงตั้งฉากที่ล้อแต่ละล้อ [N] (0 เมื่ออยู่ในอากาศ) ยังไม่มี nz; Recorder ยังไม่เก็บ phi/theta/beta/wow"
   },
   "tests": {
    "v": {
     "script": "scripts/lh_tests.mjs",
     "cases": 52,
     "ids": "T-LH-01…T-LH-52"
    },
    "u": "-",
    "scope": "sim",
    "src": [
     "LH0"
    ],
    "conf": "สูง",
    "est": false,
    "note": "ผลล่าสุด 52/52 ผ่าน (ตรวจทาน 2026-11-18)"
   }
  }
 }
}
```

```json
{
 "c172s": {
  "ops": {
   "attitude_power": {
    "takeoff_roll": {
     "v": {
      "ias_kt": 0,
      "pitch_deg": null,
      "power": "เต็ม (static 2,300–2,400 rpm)",
      "flap": 0,
      "rate_fpm": 0
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LH11",
      "LH8",
      "LC3",
      "LC6"
     ],
     "conf": "กลาง",
     "est": false,
     "note": "แฟลป 0 ปกติ, 10 short field; รอบสถิตจากบัตร 04"
    },
    "rotation": {
     "v": {
      "ias_kt": 55,
      "pitch_deg": 9.3,
      "power": "เต็ม",
      "flap": 0,
      "rate_fpm": 0
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LH11",
      "LH8",
      "LH0"
     ],
     "conf": "กลาง",
     "est": true,
     "note": "rotate 55 KIAS (LH11 p.4–5, LH8 p.5); short field 51 KIAS แฟลป 10; ค่าประมาณ: pitch = α + γ จาก lh_attitude.mjs"
    },
    "initial_climb": {
     "v": {
      "ias_kt": 74,
      "pitch_deg": 10.7,
      "power": "เต็ม",
      "flap": 0,
      "rate_fpm": 730
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LH11",
      "LC1",
      "LH0"
     ],
     "conf": "กลาง",
     "est": true,
     "note": "Vy SL 74 (IM p.4-5); ROC 730 fpm ที่ MTOW SL (ที่มวลฝึกไต่ได้มากกว่า); short field: Vx 62 จนพ้นสิ่งกีดขวาง เก็บแฟลปที่ 300 ft AGL (SOP); ค่าประมาณ: pitch = α + γ จาก lh_attitude.mjs"
    },
    "cruise_climb": {
     "v": {
      "ias_kt": 80,
      "pitch_deg": 8.4,
      "power": "เต็ม",
      "flap": 0,
      "rate_fpm": 600
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LC1",
      "LH11",
      "LH0"
     ],
     "conf": "กลาง",
     "est": true,
     "note": "75–85 KIAS ที่ SL, 70–80 ที่ 10,000 ft (IM p.4-5); SOP 70–85; rate ค่าประมาณ (ผู้เขียนตั้งต่ำกว่า ROC ที่ Vy); ค่าประมาณ: pitch = α + γ จาก lh_attitude.mjs"
    },
    "cruise": {
     "v": {
      "ias_kt": 105,
      "pitch_deg": 1.3,
      "power": "≈2,200–2,500 rpm (ค่าประมาณ)",
      "flap": 0,
      "rate_fpm": 0
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LC1",
      "LH12",
      "LH0"
     ],
     "conf": "กลาง",
     "est": true,
     "note": "ค่าประมาณ: rpm ในช่วง tach green arc 2,100–2,500 rpm ที่ SL ของบัตร 04 [LC1]; ias ค่าประมาณ; C172R IM แนะนำ cruise 60–80 % (p.4-26); ค่าประมาณ: pitch = α + γ จาก lh_attitude.mjs"
    },
    "descent": {
     "v": {
      "ias_kt": 100,
      "pitch_deg": -1.2,
      "power": "≈2,000 rpm",
      "flap": 0,
      "rate_fpm": -500
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LH9",
      "LH0"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ (ผู้เขียนตั้ง): rpm และอัตรา ไม่มีในแหล่ง; ค่าประมาณ: pitch = α + γ จาก lh_attitude.mjs"
    },
    "downwind": {
     "v": {
      "ias_kt": 90,
      "pitch_deg": 2.8,
      "power": "2,000–2,200 rpm",
      "flap": 0,
      "rate_fpm": 0
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LH11",
      "LH9",
      "LH0"
     ],
     "conf": "กลาง",
     "est": true,
     "note": "entry 90 KIAS ≈2,200 rpm (LH9), downwind 95 kt 2,000–2,200 rpm (LH11 p.14); abeam ≈1,500 rpm แฟลป 10 80–85 KIAS (LH8 ใช้ 1,700 rpm); ค่าประมาณ: pitch = α + γ จาก lh_attitude.mjs"
    },
    "base": {
     "v": {
      "ias_kt": 75,
      "pitch_deg": -2.1,
      "power": "≈1,500 rpm",
      "flap": 20,
      "rate_fpm": -500
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LH11",
      "LH9",
      "LH8",
      "LH0"
     ],
     "conf": "กลาง",
     "est": true,
     "note": "70–75 KIAS แฟลป 20; rate ค่าประมาณ; ค่าประมาณ: pitch = α + γ จาก lh_attitude.mjs"
    },
    "final": {
     "v": {
      "ias_kt": 65,
      "pitch_deg": -0.2,
      "power": "≈1,500 rpm ปรับตาม path",
      "flap": 30,
      "rate_fpm": -345
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LH11",
      "LC1",
      "LH1",
      "LH0"
     ],
     "conf": "กลาง",
     "est": true,
     "note": "60–70 KIAS แฟลป 30 (IM p.4-5); short field 61; 3° ที่ GS 65 kt; ค่าประมาณ: pitch = α + γ จาก lh_attitude.mjs"
    },
    "flare": {
     "v": {
      "ias_kt": 55,
      "pitch_deg": null,
      "power": "idle",
      "flap": 30,
      "rate_fpm": -100
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LH1"
     ],
     "conf": "กลาง",
     "est": true,
     "note": "เริ่ม roundout 10–20 ft (AFH p.9-8); ias และ rate ค่าประมาณ (ลดจาก Vapp)"
    },
    "touchdown": {
     "v": {
      "ias_kt": 46,
      "pitch_deg": 9.7,
      "power": "idle",
      "flap": 30,
      "rate_fpm": -120
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LH1",
      "LH9",
      "LH0"
     ],
     "conf": "กลาง",
     "est": true,
     "note": "ล้อหลักก่อน ใกล้ power-off stall attitude; ias ≈ 1.08 VS0 + 2 (ค่าประมาณ); pitch คำนวณที่ 1.05 VS0 = 50 KCAS (≈ 41 KIAS) นอก ground effect จึงเป็นขอบบน; ค่าประมาณ: pitch = α + γ จาก lh_attitude.mjs"
    },
    "go_around": {
     "v": {
      "ias_kt": 60,
      "pitch_deg": 7.7,
      "power": "เต็ม",
      "flap": 20,
      "rate_fpm": 300
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LH11",
      "LH12",
      "LH0"
     ],
     "conf": "กลาง",
     "est": true,
     "note": "แฟลป 30→20 ทันที, 65 KIAS ที่ 50 ft, Vy 74, 10 → 0 ที่ 300 ft; rate ค่าประมาณ; ค่าประมาณ: pitch = α + γ จาก lh_attitude.mjs"
    }
   },
   "crosswind_limits": {
    "v": {
     "demonstrated": 15,
     "limitation": false
    },
    "u": "kt",
    "scope": "aircraft",
    "src": [
     "LC1",
     "LH11"
    ],
    "conf": "สูง",
    "est": false,
    "note": "สาธิต ไม่ใช่ขีดจำกัด (IM p.4-5); SOP ของโรงเรียนแยก 20 kt แฟลป 0–10 / 15 kt แฟลป 20–30 (p.4)"
   },
   "stall_characteristics": {
    "v": {
     "warning": "แตร reed ขอบหน้าปีก",
     "warning_margin_kt": [
      5,
      10
     ],
     "behaviour": "conventional",
     "altitude_loss_ft": 230
    },
    "u": "kt, ft",
    "scope": "aircraft",
    "src": [
     "LH12",
     "LC2"
    ],
    "conf": "สูง",
    "est": false,
    "note": "margin จาก C172R IM p.4-30; altitude loss จากบัตร 04"
   },
   "spin": {
    "v": {
     "approved": "utility category เท่านั้น",
     "flaps": "ห้าม",
     "recovery_turns_max": 0.25,
     "alt_loss_1turn_ft": 1000,
     "complete_recovery_agl_ft": 4000,
     "training_turns": [
      1,
      2
     ],
     "recovery": "idle, aileron กลาง, rudder ตรงข้ามเต็ม, ดันคันไปหน้า, rudder กลางเมื่อหยุดหมุน"
    },
    "u": "turn, ft, s",
    "scope": "aircraft",
    "src": [
     "LH12"
    ],
    "conf": "สูง",
    "est": false,
    "note": "C172R IM p.4-30…4-32 ใช้กับ 172S (การรับรองเดียวกัน)"
   },
   "flap_effects": {
    "v": {
     "VFE": {
      "10": 110,
      "20": 85,
      "30": 85
     },
     "balloon_dn_g": {
      "0to10_85kt": 0.22,
      "10to20_80kt": 0.23,
      "20to30_70kt": 0.09
     },
     "approach_alpha_drop_deg": 4,
     "notes": "ปีกสูงแฟลป Fowler: กางแล้วลอยและเชิดหัว ต้องดันคันและ trim; เกิน 20° หลีกเลี่ยง slip ชัน"
    },
    "u": "kt, g, deg",
    "scope": "aircraft",
    "src": [
     "LH1",
     "LH12",
     "LH0"
    ],
    "conf": "กลาง",
    "est": true,
    "note": "ค่าประมาณ: balloon และ Δα จาก lh_attitude.mjs (T-LH-06, 07)"
   },
   "trim_technique": {
    "v": "attitude → power → trim; trim ใหม่ทุกครั้งที่เปลี่ยนแฟลป; go-around ดันคันต้านหัวเชิดก่อนแล้ว trim หยาบ; ล้อ trim มือ (172S NAV III มี electric trim)",
    "u": "-",
    "scope": "aircraft",
    "src": [
     "LH1",
     "LC2"
    ],
    "conf": "กลาง",
    "est": false,
    "note": ""
   },
   "crosswind_technique": {
    "v": "crab ใน pattern → wing-low ก่อน roundout; แฟลปน้อยที่สุดตามความยาวรันเวย์; ล้อด้านลมก่อน; aileron เข้าลมตลอดการวิ่ง",
    "u": "-",
    "scope": "aircraft",
    "src": [
     "LH1",
     "LH12",
     "LH13"
    ],
    "conf": "สูง",
    "est": false,
    "note": ""
   },
   "stick_feel": {
    "v": "พวงมาลัย สลิง reversible แรงเพิ่มตาม q; แฟลปเต็มและ CG หน้าทำให้แรงดึงตอน flare สูง; ไม่มีตัวเลขแรงในแหล่งเปิด",
    "u": "-",
    "scope": "aircraft",
    "src": [
     "LH1",
     "LC2"
    ],
    "conf": "ต่ำ",
    "est": false,
    "note": ""
   },
   "approach_pitch_deg": {
    "v": -0.2,
    "u": "deg",
    "scope": "aircraft",
    "src": [
     "LH0"
    ],
    "conf": "ต่ำ",
    "est": true,
    "note": "ค่าประมาณ: θ = α + γ ที่ final (65 KIAS, path 3°)"
   },
   "touchdown_pitch_deg": {
    "v": 9.7,
    "u": "deg",
    "scope": "aircraft",
    "src": [
     "LH0",
     "LH1"
    ],
    "conf": "ต่ำ",
    "est": true,
    "note": "ค่าประมาณ: α ที่ 1.05 VS0 นอก ground effect (ใกล้ power-off stall attitude ตาม AFH)"
   },
   "flare_height_m": {
    "v": 4.6,
    "u": "m",
    "scope": "aircraft",
    "src": [
     "LH1"
    ],
    "conf": "กลาง",
    "est": false,
    "note": "roundout เริ่ม 10–20 ft (กลาง 15 ft) [LH1 p.9-8]"
   },
   "stabilised_criteria": {
    "v": {
     "gate_ft": [
      500,
      300
     ],
     "speed": {
      "Vapp": 65,
      "lo": -5,
      "hi_ppl": 10,
      "hi_cpl": 5
     },
     "vs_min_fpm": -1000,
     "bank_max_deg": 15,
     "config": "แฟลปลงจอดของแบบ",
     "path_dots": 1
    },
    "u": "ft, kt, fpm, deg",
    "scope": "aircraft",
    "src": [
     "LH1",
     "LH2",
     "LH3"
    ],
    "conf": "กลาง",
    "est": false,
    "note": "เกณฑ์ร่วม common_light.evaluator ใช้ Vapp ของแบบ"
   }
  }
 }
}
```

```json
{
 "c172r": {
  "ops": {
   "attitude_power": {
    "takeoff_roll": {
     "v": {
      "ias_kt": 0,
      "pitch_deg": null,
      "power": "เต็ม (static 2,300–2,400 rpm)",
      "flap": 0,
      "rate_fpm": 0
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LH11",
      "LH8",
      "LC3",
      "LC6"
     ],
     "conf": "กลาง",
     "est": false,
     "note": "แฟลป 0 ปกติ, 10 short field; รอบสถิตจากบัตร 04"
    },
    "rotation": {
     "v": {
      "ias_kt": 55,
      "pitch_deg": 9.3,
      "power": "เต็ม",
      "flap": 0,
      "rate_fpm": 0
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LH12",
      "LH0"
     ],
     "conf": "สูง",
     "est": true,
     "note": "lift nose wheel 55 KIAS (p.4-15); short field 57 KIAS ที่ 50 ft แฟลป 10 (p.4-5); pitch ใช้ aero ของบัตร c172s; ค่าประมาณ: pitch = α + γ จาก lh_attitude.mjs"
    },
    "initial_climb": {
     "v": {
      "ias_kt": 79,
      "pitch_deg": 9.5,
      "power": "เต็ม",
      "flap": 0,
      "rate_fpm": 720
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LH12",
      "LH0"
     ],
     "conf": "สูง",
     "est": true,
     "note": "Vy SL 79 KIAS (71 ที่ 10,000 ft), Vx SL 60; normal climb out 70–80; ROC 720 fpm ที่ 2,450 lb SL (p.ii, 4-5); pitch ใช้ aero ของบัตร c172s; ค่าประมาณ: pitch = α + γ จาก lh_attitude.mjs"
    },
    "cruise_climb": {
     "v": {
      "ias_kt": 80,
      "pitch_deg": 8.4,
      "power": "เต็ม",
      "flap": 0,
      "rate_fpm": 600
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LH12",
      "LH0"
     ],
     "conf": "สูง",
     "est": true,
     "note": "enroute climb 75–85 KIAS SL, 70–80 ที่ 10,000 ft (p.4-5); rate ค่าประมาณ; ค่าประมาณ: pitch = α + γ จาก lh_attitude.mjs"
    },
    "cruise": {
     "v": {
      "ias_kt": 105,
      "pitch_deg": 1.3,
      "power": "2,000–2,400 rpm (≤ 80 %)",
      "flap": 0,
      "rate_fpm": 0
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LH12",
      "LH0"
     ],
     "conf": "กลาง",
     "est": true,
     "note": "checklist p.4-16; ปกติ 60–80 % (p.4-26); ias ค่าประมาณ; ค่าประมาณ: pitch = α + γ จาก lh_attitude.mjs"
    },
    "descent": {
     "v": {
      "ias_kt": 100,
      "pitch_deg": -1.2,
      "power": "≈2,000 rpm",
      "flap": 0,
      "rate_fpm": -500
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LH9",
      "LH0"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ (ผู้เขียนตั้ง): rpm และอัตรา ไม่มีในแหล่ง; ค่าประมาณ: pitch = α + γ จาก lh_attitude.mjs"
    },
    "downwind": {
     "v": {
      "ias_kt": 90,
      "pitch_deg": 2.8,
      "power": "2,000–2,200 rpm",
      "flap": 0,
      "rate_fpm": 0
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LH11",
      "LH9",
      "LH0"
     ],
     "conf": "กลาง",
     "est": true,
     "note": "entry 90 KIAS ≈2,200 rpm (LH9), downwind 95 kt 2,000–2,200 rpm (LH11 p.14); abeam ≈1,500 rpm แฟลป 10 80–85 KIAS (LH8 ใช้ 1,700 rpm); ค่าประมาณ: pitch = α + γ จาก lh_attitude.mjs"
    },
    "base": {
     "v": {
      "ias_kt": 75,
      "pitch_deg": -2.1,
      "power": "≈1,500 rpm",
      "flap": 20,
      "rate_fpm": -500
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LH11",
      "LH9",
      "LH8",
      "LH0"
     ],
     "conf": "กลาง",
     "est": true,
     "note": "70–75 KIAS แฟลป 20; rate ค่าประมาณ; ค่าประมาณ: pitch = α + γ จาก lh_attitude.mjs"
    },
    "final": {
     "v": {
      "ias_kt": 65,
      "pitch_deg": -0.2,
      "power": "≈1,500 rpm ปรับตาม path",
      "flap": 30,
      "rate_fpm": -345
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LH12",
      "LH1",
      "LH0"
     ],
     "conf": "สูง",
     "est": true,
     "note": "60–70 KIAS แฟลป 30, 65–75 แฟลปขึ้น; short field 62 (p.4-5); ค่าประมาณ: pitch = α + γ จาก lh_attitude.mjs"
    },
    "flare": {
     "v": {
      "ias_kt": 55,
      "pitch_deg": null,
      "power": "idle",
      "flap": 30,
      "rate_fpm": -100
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LH1"
     ],
     "conf": "กลาง",
     "est": true,
     "note": "เริ่ม roundout 10–20 ft (AFH p.9-8); ias และ rate ค่าประมาณ (ลดจาก Vapp)"
    },
    "touchdown": {
     "v": {
      "ias_kt": 46,
      "pitch_deg": 9.7,
      "power": "idle",
      "flap": 30,
      "rate_fpm": -120
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LH1",
      "LH9",
      "LH0"
     ],
     "conf": "กลาง",
     "est": true,
     "note": "ล้อหลักก่อน ใกล้ power-off stall attitude; ias ≈ 1.08 VS0 + 2 (ค่าประมาณ); pitch คำนวณที่ 1.05 VS0 = 50 KCAS (≈ 41 KIAS) นอก ground effect จึงเป็นขอบบน; ค่าประมาณ: pitch = α + γ จาก lh_attitude.mjs"
    },
    "go_around": {
     "v": {
      "ias_kt": 55,
      "pitch_deg": 9,
      "power": "เต็ม",
      "flap": 20,
      "rate_fpm": 300
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LH12",
      "LH0"
     ],
     "conf": "กลาง",
     "est": true,
     "note": "balked landing 55 KIAS แฟลป 20 แล้ว 10 และเก็บหมดเมื่อ ≥ 60 KIAS ที่ความสูงปลอดภัย (p.4-17); rate ค่าประมาณ; ค่าประมาณ: pitch = α + γ จาก lh_attitude.mjs"
    }
   },
   "crosswind_limits": {
    "v": {
     "demonstrated": 15,
     "limitation": false
    },
    "u": "kt",
    "scope": "aircraft",
    "src": [
     "LH12"
    ],
    "conf": "สูง",
    "est": false,
    "note": "p.4-5, 4-33"
   },
   "stall_characteristics": {
    "v": {
     "warning_margin_kt": [
      5,
      10
     ],
     "behaviour": "conventional"
    },
    "u": "kt, ft",
    "scope": "aircraft",
    "src": [
     "LH12"
    ],
    "conf": "สูง",
    "est": false,
    "note": "p.4-30"
   },
   "spin": {
    "v": {
     "approved": "utility category เท่านั้น",
     "flaps": "ห้าม"
    },
    "u": "turn, ft, s",
    "scope": "aircraft",
    "src": [
     "LH12"
    ],
    "conf": "สูง",
    "est": false,
    "note": "p.2-9, 4-30"
   },
   "trim_technique": {
    "v": "attitude → power → trim; trim ใหม่ทุกครั้งที่เปลี่ยนแฟลป; go-around ดันคันต้านหัวเชิดก่อนแล้ว trim หยาบ; ล้อ trim มือ (172S NAV III มี electric trim)",
    "u": "-",
    "scope": "aircraft",
    "src": [
     "LH1",
     "LC2"
    ],
    "conf": "กลาง",
    "est": false,
    "note": ""
   },
   "crosswind_technique": {
    "v": "crab ใน pattern → wing-low ก่อน roundout; แฟลปน้อยที่สุดตามความยาวรันเวย์; ล้อด้านลมก่อน; aileron เข้าลมตลอดการวิ่ง",
    "u": "-",
    "scope": "aircraft",
    "src": [
     "LH1",
     "LH12",
     "LH13"
    ],
    "conf": "สูง",
    "est": false,
    "note": ""
   },
   "stick_feel": {
    "v": "พวงมาลัย สลิง reversible แรงเพิ่มตาม q; แฟลปเต็มและ CG หน้าทำให้แรงดึงตอน flare สูง; ไม่มีตัวเลขแรงในแหล่งเปิด",
    "u": "-",
    "scope": "aircraft",
    "src": [
     "LH1",
     "LC2"
    ],
    "conf": "ต่ำ",
    "est": false,
    "note": ""
   },
   "stabilised_criteria": {
    "v": {
     "gate_ft": [
      500,
      300
     ],
     "speed": "Vapp −5/+10",
     "vs_min_fpm": -1000,
     "bank_max_deg": 15,
     "config": "แฟลปลงจอดของแบบ",
     "path_dots": 1
    },
    "u": "ft, kt, fpm, deg",
    "scope": "aircraft",
    "src": [
     "LH1",
     "LH2",
     "LH3"
    ],
    "conf": "กลาง",
    "est": false,
    "note": "เกณฑ์ร่วม common_light.evaluator ใช้ Vapp ของแบบ"
   }
  }
 }
}
```

```json
{
 "c152": {
  "ops": {
   "attitude_power": {
    "takeoff_roll": {
     "v": {
      "ias_kt": 0,
      "pitch_deg": null,
      "power": "เต็ม carb heat cold",
      "flap": 0,
      "rate_fpm": 0
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LH13"
     ],
     "conf": "สูง",
     "est": false,
     "note": "แฟลป 0–10"
    },
    "rotation": {
     "v": {
      "ias_kt": 50,
      "pitch_deg": 9.3,
      "power": "เต็ม",
      "flap": 0,
      "rate_fpm": 0
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LH13",
      "LH0"
     ],
     "conf": "สูง",
     "est": true,
     "note": "ยกล้อหน้า 50 KIAS (p.4-8); short field แฟลป 10 ไต่ 54 KIAS จนพ้นสิ่งกีดขวาง; ค่าประมาณ: pitch = α + γ จาก lh_attitude.mjs (ใช้ค่าของ c172s)"
    },
    "initial_climb": {
     "v": {
      "ias_kt": 70,
      "pitch_deg": 10.7,
      "power": "เต็ม",
      "flap": 0,
      "rate_fpm": null
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LH13",
      "LH0"
     ],
     "conf": "สูง",
     "est": true,
     "note": "65–75 หลังขึ้น; Vy 67 SL, Vx 55; ค่าประมาณ: pitch = α + γ จาก lh_attitude.mjs (ใช้ค่าของ c172s)"
    },
    "cruise_climb": {
     "v": {
      "ias_kt": 75,
      "pitch_deg": 8.4,
      "power": "เต็ม mixture rich < 3,000 ft",
      "flap": 0,
      "rate_fpm": null
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LH13",
      "LH0"
     ],
     "conf": "สูง",
     "est": true,
     "note": "70–80 KIAS; ค่าประมาณ: pitch = α + γ จาก lh_attitude.mjs (ใช้ค่าของ c172s)"
    },
    "cruise": {
     "v": {
      "ias_kt": 95,
      "pitch_deg": 1.3,
      "power": "1,900–2,550 rpm (55–75 %)",
      "flap": 0,
      "rate_fpm": 0
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LH13",
      "LH0"
     ],
     "conf": "กลาง",
     "est": true,
     "note": "rpm p.4-8, % p.4-15; ias ค่าประมาณ (ผู้เขียนตั้ง: IM ให้ cruise เป็น KTAS); ค่าประมาณ: pitch = α + γ จาก lh_attitude.mjs (ใช้ค่าของ c172s)"
    },
    "downwind": {
     "v": {
      "ias_kt": 80,
      "pitch_deg": null,
      "power": "ลดหลัง carb heat ON",
      "flap": 0,
      "rate_fpm": 0
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LH13"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ias ค่าประมาณ (ผู้เขียนตั้ง): IM ไม่ให้ความเร็ว downwind ใช้ค่าระหว่าง enroute climb 70–80 และ approach แฟลปขึ้น 60–70 KIAS; carb heat ก่อนลดกำลัง p.4-9"
    },
    "final": {
     "v": {
      "ias_kt": 60,
      "pitch_deg": -0.2,
      "power": "ปรับตาม path",
      "flap": 30,
      "rate_fpm": -320
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LH13",
      "LH0"
     ],
     "conf": "สูง",
     "est": true,
     "note": "55–65 แฟลป 30 (60–70 แฟลปขึ้น); short field 54; ค่าประมาณ: pitch = α + γ จาก lh_attitude.mjs (ใช้ค่าของ c172s)"
    },
    "touchdown": {
     "v": {
      "ias_kt": 40,
      "pitch_deg": 9.7,
      "power": "idle",
      "flap": 30,
      "rate_fpm": -120
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LH13",
      "LH0"
     ],
     "conf": "กลาง",
     "est": true,
     "note": "ล้อหลักก่อน; VS0 31–35 KIAS ตาม CG; ค่าประมาณ: pitch = α + γ จาก lh_attitude.mjs (ใช้ค่าของ c172s)"
    },
    "go_around": {
     "v": {
      "ias_kt": 55,
      "pitch_deg": 7.7,
      "power": "เต็ม carb heat cold",
      "flap": 20,
      "rate_fpm": null
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LH13",
      "LH0"
     ],
     "conf": "สูง",
     "est": true,
     "note": "แฟลป 30→20 ทันทีแล้วเก็บช้า ๆ; ค่าประมาณ: pitch = α + γ จาก lh_attitude.mjs (ใช้ค่าของ c172s)"
    }
   },
   "crosswind_limits": {
    "v": {
     "demonstrated": 12,
     "limitation": false
    },
    "u": "kt",
    "scope": "aircraft",
    "src": [
     "LH13"
    ],
    "conf": "สูง",
    "est": false,
    "note": "p.4-3, 5-10A (ไม่ใช่ขีดจำกัด)"
   },
   "stall_characteristics": {
    "v": {
     "warning_margin_kt": 10,
     "behaviour": "conventional",
     "altitude_loss_ft": 160
    },
    "u": "kt, ft",
    "scope": "aircraft",
    "src": [
     "LH13"
    ],
    "conf": "สูง",
    "est": false,
    "note": "p.4-18, 5-10"
   },
   "spin": {
    "v": {
     "approved": true,
     "flaps": "ห้าม",
     "alt_loss_1turn_ft": 1000,
     "alt_loss_6turn": "มากกว่าสองเท่าเล็กน้อย",
     "complete_recovery_agl_ft": 4000
    },
    "u": "turn, ft, s",
    "scope": "aircraft",
    "src": [
     "LH13"
    ],
    "conf": "สูง",
    "est": false,
    "note": "p.2-6 (maneuver limits), 4-18…4-20"
   },
   "flap_effects": {
    "v": {
     "notes": "เก็บแฟลป 10 ช้า ๆ หลัง 60 KIAS; balked landing เหลือ 20 ทันที"
    },
    "u": "kt, g, deg",
    "scope": "aircraft",
    "src": [
     "LH13"
    ],
    "conf": "สูง",
    "est": false,
    "note": ""
   },
   "trim_technique": {
    "v": "attitude → power → trim; trim ใหม่ทุกครั้งที่เปลี่ยนแฟลป; go-around ดันคันต้านหัวเชิดก่อนแล้ว trim หยาบ; ล้อ trim มือ (172S NAV III มี electric trim)",
    "u": "-",
    "scope": "aircraft",
    "src": [
     "LH1",
     "LC2"
    ],
    "conf": "กลาง",
    "est": false,
    "note": ""
   },
   "crosswind_technique": {
    "v": "crab ใน pattern → wing-low ก่อน roundout; แฟลปน้อยที่สุดตามความยาวรันเวย์; ล้อด้านลมก่อน; aileron เข้าลมตลอดการวิ่ง",
    "u": "-",
    "scope": "aircraft",
    "src": [
     "LH1",
     "LH12",
     "LH13"
    ],
    "conf": "สูง",
    "est": false,
    "note": ""
   },
   "stick_feel": {
    "v": "พวงมาลัย สลิง reversible แรงเพิ่มตาม q; แฟลปเต็มและ CG หน้าทำให้แรงดึงตอน flare สูง; ไม่มีตัวเลขแรงในแหล่งเปิด",
    "u": "-",
    "scope": "aircraft",
    "src": [
     "LH1",
     "LC2"
    ],
    "conf": "ต่ำ",
    "est": false,
    "note": ""
   },
   "stabilised_criteria": {
    "v": {
     "gate_ft": [
      500,
      300
     ],
     "speed": {
      "Vapp": 60,
      "lo": -5,
      "hi_ppl": 10,
      "hi_cpl": 5
     },
     "vs_min_fpm": -1000,
     "bank_max_deg": 15,
     "config": "แฟลปลงจอดของแบบ",
     "path_dots": 1
    },
    "u": "ft, kt, fpm, deg",
    "scope": "aircraft",
    "src": [
     "LH1",
     "LH2",
     "LH3"
    ],
    "conf": "กลาง",
    "est": false,
    "note": "เกณฑ์ร่วม common_light.evaluator ใช้ Vapp ของแบบ"
   }
  }
 }
}
```

```json
{
 "da40ng": {
  "ops": {
   "attitude_power": {
    "takeoff_roll": {
     "v": {
      "ias_kt": 0,
      "pitch_deg": null,
      "power": "MAX 100 % load (prop 2,200–2,300 rpm)",
      "flap": "T/O",
      "rate_fpm": 0
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LH17"
     ],
     "conf": "กลาง",
     "est": false,
     "note": ""
    },
    "rotation": {
     "v": {
      "ias_kt": 60,
      "pitch_deg": 7,
      "power": "MAX",
      "flap": "T/O",
      "rate_fpm": 0
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LH17",
      "LH18",
      "LH0"
     ],
     "conf": "กลาง",
     "est": true,
     "note": "VR 56/58/61/65/67 ที่ 940/1,000/1,100/1,200/1,280 kg (ใช้ 1,150 kg); SOP ซิม +7.5° ANU; ค่าประมาณ: pitch = α + γ จาก lh_attitude.mjs"
    },
    "initial_climb": {
     "v": {
      "ias_kt": 72,
      "pitch_deg": 7,
      "power": "MAX",
      "flap": "T/O",
      "rate_fpm": 650
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LH17",
      "LH0"
     ],
     "conf": "กลาง",
     "est": true,
     "note": "Vy ถึงความสูงปลอดภัย; ROC 651 fpm MTOM; ค่าประมาณ: pitch = α + γ จาก lh_attitude.mjs"
    },
    "cruise_climb": {
     "v": {
      "ias_kt": 88,
      "pitch_deg": 6.9,
      "power": "≈92 %",
      "flap": "UP",
      "rate_fpm": 500
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LH17",
      "LH18",
      "LH0"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "กำลังจาก SOP ของชุมชนซิม; rate ค่าประมาณ; ค่าประมาณ: pitch = α + γ จาก lh_attitude.mjs"
    },
    "cruise": {
     "v": {
      "ias_kt": 115,
      "pitch_deg": 0.6,
      "power": "60–75 %",
      "flap": "UP",
      "rate_fpm": 0
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LD4",
      "LH0"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: ias ≈ 115 KIAS จาก cruise_table ของบัตร 05 ที่ 60–75 % ระดับต่ำ; ค่าประมาณ: pitch = α + γ จาก lh_attitude.mjs"
    },
    "descent": {
     "v": {
      "ias_kt": 110,
      "pitch_deg": -1.6,
      "power": "≈35–45 %",
      "flap": "UP",
      "rate_fpm": -500
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LH0"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ (ผู้เขียนตั้ง): 110 KIAS −500 fpm ลด load ให้ได้อัตรานี้ ไม่มีในแหล่ง; ค่าประมาณ: pitch = α + γ จาก lh_attitude.mjs"
    },
    "downwind": {
     "v": {
      "ias_kt": 90,
      "pitch_deg": 3.3,
      "power": "30–40 %",
      "flap": "UP",
      "rate_fpm": 0
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LH18",
      "LH0"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "SOP ของชุมชนซิม (ต่ำ); ค่าประมาณ: pitch = α + γ จาก lh_attitude.mjs"
    },
    "base": {
     "v": {
      "ias_kt": 80,
      "pitch_deg": -3.9,
      "power": "≈25–30 %",
      "flap": "T/O",
      "rate_fpm": -500
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LH0"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ (ผู้เขียนตั้ง): 80 KIAS แฟลป T/O −500 fpm ระหว่าง circuit 90 KIAS [LH18] และ final 74; ค่าประมาณ: pitch = α + γ จาก lh_attitude.mjs"
    },
    "final": {
     "v": {
      "ias_kt": 74,
      "pitch_deg": -4.1,
      "power": "≈20–30 % → idle",
      "flap": "LDG",
      "rate_fpm": -390
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LH17",
      "LH0"
     ],
     "conf": "กลาง",
     "est": true,
     "note": "VREF LDG 66/68/72/76/76/77 ที่ 940/1,000/1,100/1,200/1,216/1,280 kg (ใช้ 74 ที่ ≈ 1,150 kg); pitch −4° สอดคล้องกับท่าบิน DA40 NG ที่นักบินรายงานในบัตร 05 (แฟลป LDG idle 84 KIAS −6.5°) ดู 08.10; ค่าประมาณ: pitch = α + γ จาก lh_attitude.mjs"
    },
    "touchdown": {
     "v": {
      "ias_kt": 58,
      "pitch_deg": 4.6,
      "power": "idle",
      "flap": "LDG",
      "rate_fpm": -120
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LH17",
      "LH0"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: ias ≈ 1.05 VS0 (VS0 LDG 55–60 KIAS ที่ 1,000–1,310 kg); ค่าประมาณ: pitch = α + γ จาก lh_attitude.mjs"
    },
    "go_around": {
     "v": {
      "ias_kt": 72,
      "pitch_deg": 5,
      "power": "MAX",
      "flap": "T/O",
      "rate_fpm": 400
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LH17",
      "LH0"
     ],
     "conf": "กลาง",
     "est": true,
     "note": "ขั้นต่ำ 72 KIAS แฟลป T/O; rate ค่าประมาณ; ค่าประมาณ: pitch = α + γ จาก lh_attitude.mjs"
    }
   },
   "crosswind_limits": {
    "v": {
     "demonstrated": 25,
     "limitation": false
    },
    "u": "kt",
    "scope": "aircraft",
    "src": [
     "LH17"
    ],
    "conf": "กลาง",
    "est": false,
    "note": "checklist p.8"
   },
   "stall_characteristics": {
    "v": {
     "warning": "lift detector ปีกซ้าย",
     "warning_margin_kt": 5,
     "behaviour": "AFM ไม่บรรยายการตกปีก",
     "dynamic_stall": "ห้าม"
    },
    "u": "kt, ft",
    "scope": "aircraft",
    "src": [
     "LD2",
     "LD8"
    ],
    "conf": "กลาง",
    "est": true,
    "note": "margin = เกณฑ์ขั้นต่ำ 23.207 (ค่าประมาณ)"
   },
   "spin": {
    "v": {
     "approved": false
    },
    "u": "turn, ft, s",
    "scope": "aircraft",
    "src": [
     "LD2"
    ],
    "conf": "สูง",
    "est": false,
    "note": "normal category ห้าม spin และ aerobatics"
   },
   "flap_effects": {
    "v": {
     "VFE": {
      "T/O": 110,
      "LDG": 98
     },
     "balloon_dn_g": {
      "UPtoTO_100kt_upper_bound": 0.99
     },
     "notes": "ปีกต่ำ แฟลป 20°/42°: ΔCL0 ของบัตร 05 (0.52/0.75) ยืนยันด้วย DATCOM และท่าบินที่นักบินรายงาน; Δn เป็นขอบบน (แฟลปกางทันทีและถือ α เดิม) จริงแฟลปไฟฟ้าใช้หลายวินาทีและ dCm0 −0.06 กดหัวลง (ดู 08.10)"
    },
    "u": "kt, g, deg",
    "scope": "aircraft",
    "src": [
     "LH17",
     "LH0",
     "LD13"
    ],
    "conf": "ต่ำ",
    "est": true,
    "note": "ค่าประมาณ: balloon จาก lh_attitude.mjs"
   },
   "trim_technique": {
    "v": "ล้อ trim มือ + electric trim (NG/NXi); FADEC คันเดียว เปลี่ยนกำลังแล้ว trim เปลี่ยนน้อยกว่าเครื่องคาร์บู",
    "u": "-",
    "scope": "aircraft",
    "src": [
     "LD7",
     "LH1"
    ],
    "conf": "ต่ำ",
    "est": false,
    "note": ""
   },
   "crosswind_technique": {
    "v": "crab → wing-low ตาม AFH; ค่าสาธิต 25 kt",
    "u": "-",
    "scope": "aircraft",
    "src": [
     "LH1",
     "LH17"
    ],
    "conf": "กลาง",
    "est": false,
    "note": ""
   },
   "stick_feel": {
    "v": "stick ระบบ push-rod ตอบสนองตรง ไม่มีตัวเลขแรงในแหล่งเปิด",
    "u": "-",
    "scope": "aircraft",
    "src": [
     "LD7"
    ],
    "conf": "ต่ำ",
    "est": false,
    "note": ""
   },
   "approach_pitch_deg": {
    "v": -4.1,
    "u": "deg",
    "scope": "aircraft",
    "src": [
     "LH0"
    ],
    "conf": "ต่ำ",
    "est": true,
    "note": "ค่าประมาณ: θ = α + γ ที่ final (74 KIAS, path 3°)"
   },
   "touchdown_pitch_deg": {
    "v": 4.6,
    "u": "deg",
    "scope": "aircraft",
    "src": [
     "LH0",
     "LH1"
    ],
    "conf": "ต่ำ",
    "est": true,
    "note": "ค่าประมาณ: α ที่ 1.05 VS0 นอก ground effect (ใกล้ power-off stall attitude ตาม AFH)"
   },
   "flare_height_m": {
    "v": 4.6,
    "u": "m",
    "scope": "aircraft",
    "src": [
     "LH1"
    ],
    "conf": "กลาง",
    "est": false,
    "note": "roundout เริ่ม 10–20 ft (กลาง 15 ft) [LH1 p.9-8]"
   },
   "stabilised_criteria": {
    "v": {
     "gate_ft": [
      500,
      300
     ],
     "speed": {
      "Vapp": 74,
      "lo": -5,
      "hi_ppl": 10,
      "hi_cpl": 5
     },
     "vs_min_fpm": -1000,
     "bank_max_deg": 15,
     "config": "แฟลปลงจอดของแบบ",
     "path_dots": 1
    },
    "u": "ft, kt, fpm, deg",
    "scope": "aircraft",
    "src": [
     "LH1",
     "LH2",
     "LH3"
    ],
    "conf": "กลาง",
    "est": false,
    "note": "เกณฑ์ร่วม common_light.evaluator ใช้ Vapp ของแบบ"
   }
  }
 }
}
```

```json
{
 "da42ng": {
  "ops": {
   "attitude_power": {
    "takeoff_roll": {
     "v": {
      "ias_kt": 0,
      "pitch_deg": null,
      "power": "MAX ทั้งสองเครื่อง",
      "flap": "UP",
      "rate_fpm": 0
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LT9"
     ],
     "conf": "กลาง",
     "est": false,
     "note": ""
    },
    "rotation": {
     "v": {
      "ias_kt": 76,
      "pitch_deg": 8.4,
      "power": "MAX",
      "flap": "UP",
      "rate_fpm": 0
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LT9",
      "LH0"
     ],
     "conf": "กลาง",
     "est": true,
     "note": "TAE 125: 70–72; ค่าประมาณ: pitch = α + γ จาก lh_attitude.mjs"
    },
    "initial_climb": {
     "v": {
      "ias_kt": 90,
      "pitch_deg": 11.6,
      "power": "MAX",
      "flap": "UP",
      "rate_fpm": 1100
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LT9",
      "LH29",
      "LH0"
     ],
     "conf": "กลาง",
     "est": true,
     "note": "Vy; เก็บล้อเมื่อ positive rate; ROC 1,180 MTOM; ค่าประมาณ: pitch = α + γ จาก lh_attitude.mjs"
    },
    "cruise_climb": {
     "v": {
      "ias_kt": 100,
      "pitch_deg": 8.1,
      "power": "≈92 %",
      "flap": "UP",
      "rate_fpm": 900
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LH29",
      "LH0"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "rate ค่าประมาณ; แหล่งเป็นรุ่น L360; ค่าประมาณ: pitch = α + γ จาก lh_attitude.mjs"
    },
    "cruise": {
     "v": {
      "ias_kt": 140,
      "pitch_deg": -0.3,
      "power": "60–75 %",
      "flap": "UP",
      "rate_fpm": 0
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LT10",
      "LH0"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: ias ≈ 140 KIAS จาก cruise_table ของบัตร 06 ที่ 60–75 % ระดับต่ำ; ค่าประมาณ: pitch = α + γ จาก lh_attitude.mjs"
    },
    "descent": {
     "v": {
      "ias_kt": 130,
      "pitch_deg": -1.9,
      "power": "ลดให้ได้ ≈500 fpm",
      "flap": "UP",
      "rate_fpm": -500
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LH29",
      "LH0"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "130–140 KIAS (L360); ค่าประมาณ: pitch = α + γ จาก lh_attitude.mjs"
    },
    "downwind": {
     "v": {
      "ias_kt": 100,
      "pitch_deg": 3,
      "power": "≈35 %",
      "flap": "UP",
      "rate_fpm": 0
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LH29",
      "LH0"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ (ผู้เขียนตั้ง): ias และ load ไม่มีในแหล่ง (สูงกว่า base 95 KIAS เล็กน้อย); ล้อลงบน base เมื่อแน่ใจว่าลงได้ [LH29]; ค่าประมาณ: pitch = α + γ จาก lh_attitude.mjs"
    },
    "base": {
     "v": {
      "ias_kt": 95,
      "pitch_deg": -2.4,
      "power": "≈25–30 %",
      "flap": "APP",
      "rate_fpm": -500
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LH29",
      "LH0"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "base 95 KIAS ล้อลง (flashcard รุ่น L360 [LH29]); load และ rate ค่าประมาณ; ค่าประมาณ: pitch = α + γ จาก lh_attitude.mjs"
    },
    "final": {
     "v": {
      "ias_kt": 84,
      "pitch_deg": -2.7,
      "power": "≈20–30 %",
      "flap": "LDG",
      "rate_fpm": -430
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LT9",
      "LH0"
     ],
     "conf": "กลาง",
     "est": true,
     "note": "VREF ≤ 1,900 kg (86 > 1,900 kg); ค่าประมาณ: pitch = α + γ จาก lh_attitude.mjs"
    },
    "touchdown": {
     "v": {
      "ias_kt": 62,
      "pitch_deg": 7.8,
      "power": "idle",
      "flap": "LDG",
      "rate_fpm": -120
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LT2",
      "LH0"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: ias ≈ VS0 62 KIAS (ปลาย white arc ที่ 1,900 kg); ค่าประมาณ: pitch = α + γ จาก lh_attitude.mjs"
    },
    "go_around": {
     "v": {
      "ias_kt": 90,
      "pitch_deg": 4.6,
      "power": "MAX",
      "flap": "APP",
      "rate_fpm": 500
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LH29",
      "LH0"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "LDG→APP, ล้อขึ้นเมื่อ positive rate; rate ค่าประมาณ; ค่าประมาณ: pitch = α + γ จาก lh_attitude.mjs"
    }
   },
   "crosswind_limits": {
    "v": {
     "demonstrated": 25,
     "limitation": false
    },
    "u": "kt",
    "scope": "aircraft",
    "src": [
     "LT10",
     "LT6"
    ],
    "conf": "กลาง",
    "est": false,
    "note": "สเปก DA42 NG (AOPA 2010) และโบรชัวร์ DA42-VI ผ่านบัตร 06; AFM NG บท 4/5 เปิดไม่ได้"
   },
   "stall_characteristics": {
    "v": {
     "warning_margin_kt": 5,
     "note_l360": "รุ่น L360 ไม่ถึง 5 kt ที่ CG หน้า"
    },
    "u": "kt, ft",
    "scope": "aircraft",
    "src": [
     "LT4"
    ],
    "conf": "ต่ำ",
    "est": true,
    "note": "ค่าประมาณ: margin = ขั้นต่ำ 5 kt ของ 14 CFR 23.207 / CS-23 เพราะ AFM ที่เปิดได้ไม่ให้ตัวเลข"
   },
   "spin": {
    "v": {
     "approved": false
    },
    "u": "turn, ft, s",
    "scope": "aircraft",
    "src": [
     "LT2"
    ],
    "conf": "สูง",
    "est": false,
    "note": "normal category"
   },
   "flap_effects": {
    "v": {
     "VFE": {
      "APP": 133,
      "LDG": 113
     }
    },
    "u": "kt, g, deg",
    "scope": "aircraft",
    "src": [
     "LT1"
    ],
    "conf": "สูง",
    "est": false,
    "note": "ผ่านบัตร 06"
   },
   "trim_technique": {
    "v": "ล้อ trim มือ + electric trim (NG/NXi); FADEC คันเดียว เปลี่ยนกำลังแล้ว trim เปลี่ยนน้อยกว่าเครื่องคาร์บู",
    "u": "-",
    "scope": "aircraft",
    "src": [
     "LD7",
     "LH1"
    ],
    "conf": "ต่ำ",
    "est": false,
    "note": ""
   },
   "crosswind_technique": {
    "v": "crab → wing-low ตาม AFH; ค่าสาธิต 25 kt",
    "u": "-",
    "scope": "aircraft",
    "src": [
     "LH1",
     "LH17"
    ],
    "conf": "กลาง",
    "est": false,
    "note": ""
   },
   "stick_feel": {
    "v": "stick ระบบ push-rod ตอบสนองตรง ไม่มีตัวเลขแรงในแหล่งเปิด",
    "u": "-",
    "scope": "aircraft",
    "src": [
     "LD7"
    ],
    "conf": "ต่ำ",
    "est": false,
    "note": ""
   },
   "approach_pitch_deg": {
    "v": -2.7,
    "u": "deg",
    "scope": "aircraft",
    "src": [
     "LH0"
    ],
    "conf": "ต่ำ",
    "est": true,
    "note": "ค่าประมาณ: θ = α + γ ที่ final (84 KIAS, path 3°)"
   },
   "touchdown_pitch_deg": {
    "v": 7.8,
    "u": "deg",
    "scope": "aircraft",
    "src": [
     "LH0",
     "LH1"
    ],
    "conf": "ต่ำ",
    "est": true,
    "note": "ค่าประมาณ: α ที่ 1.05 VS0 นอก ground effect (ใกล้ power-off stall attitude ตาม AFH)"
   },
   "flare_height_m": {
    "v": 4.6,
    "u": "m",
    "scope": "aircraft",
    "src": [
     "LH1"
    ],
    "conf": "กลาง",
    "est": false,
    "note": "roundout เริ่ม 10–20 ft (กลาง 15 ft) [LH1 p.9-8]"
   },
   "stabilised_criteria": {
    "v": {
     "gate_ft": [
      500,
      300
     ],
     "speed": {
      "Vapp": 84,
      "lo": -5,
      "hi_ppl": 10,
      "hi_cpl": 5
     },
     "vs_min_fpm": -1000,
     "bank_max_deg": 15,
     "config": "แฟลปลงจอดของแบบ + ล้อลง",
     "path_dots": 1
    },
    "u": "ft, kt, fpm, deg",
    "scope": "aircraft",
    "src": [
     "LH1",
     "LH2",
     "LH3"
    ],
    "conf": "กลาง",
    "est": false,
    "note": "เกณฑ์ร่วม common_light.evaluator ใช้ Vapp ของแบบ"
   }
  }
 }
}
```

```json
{
 "t6a": {
  "ops": {
   "attitude_power": {
    "takeoff_roll": {
     "v": {
      "ias_kt": 0,
      "pitch_deg": null,
      "power": "MAX",
      "flap": "TO",
      "rate_fpm": 0
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LH14"
     ],
     "conf": "สูง",
     "est": false,
     "note": ""
    },
    "rotation": {
     "v": {
      "ias_kt": 85,
      "pitch_deg": 8.5,
      "power": "MAX",
      "flap": "TO",
      "rate_fpm": 0
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LH14",
      "LH15"
     ],
     "conf": "สูง",
     "est": false,
     "note": "takeoff attitude 7–10° NH; pitch จากคู่มือ"
    },
    "initial_climb": {
     "v": {
      "ias_kt": 140,
      "pitch_deg": 15,
      "power": "MAX",
      "flap": "UP",
      "rate_fpm": null
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LH14"
     ],
     "conf": "สูง",
     "est": false,
     "note": "tech climb 140/160/180 KIAS = 15/12.5/10° NH; pattern climb 120 KIAS 60–70 % torque; pitch จากคู่มือ"
    },
    "cruise_climb": {
     "v": {
      "ias_kt": 160,
      "pitch_deg": 12.5,
      "power": "MAX",
      "flap": "UP",
      "rate_fpm": null
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LH14"
     ],
     "conf": "สูง",
     "est": false,
     "note": "pitch จากคู่มือ"
    },
    "cruise": {
     "v": {
      "ias_kt": 200,
      "pitch_deg": -0.1,
      "power": "≈50 % + 1 %/1,000 ft MSL",
      "flap": "UP",
      "rate_fpm": 0
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LH14",
      "LH0"
     ],
     "conf": "กลาง",
     "est": true,
     "note": "Table 2.1: 250 KIAS ≈ 93 % 2° NL; 200 KIAS 0°; 150 KIAS 32 % 2° NH (สูตร 08.1 ได้ −0.1° ที่ 200 KIAS, T-LH-52); ค่าประมาณ: pitch = α + γ จาก lh_attitude.mjs"
    },
    "descent": {
     "v": {
      "ias_kt": 200,
      "pitch_deg": -4.4,
      "power": "≈10–20 %",
      "flap": "UP",
      "rate_fpm": -1500
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LH15",
      "LH0"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: 10 % ใช้ลดสู่ pattern altitude; ค่าประมาณ: pitch = α + γ จาก lh_attitude.mjs"
    },
    "downwind": {
     "v": {
      "ias_kt": 120,
      "pitch_deg": 4.8,
      "power": "≈31 %",
      "flap": "UP",
      "rate_fpm": 0
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LH15",
      "LH0"
     ],
     "conf": "สูง",
     "est": true,
     "note": "ล้อลงเมื่อ < 150 KIAS; abeam ลดเป็น 15 %; ค่าประมาณ: pitch = α + γ จาก lh_attitude.mjs"
    },
    "base": {
     "v": {
      "ias_kt": 110,
      "pitch_deg": -4.2,
      "power": "≈15 %",
      "flap": "LDG",
      "rate_fpm": -800
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LH15",
      "LH0"
     ],
     "conf": "กลาง",
     "est": true,
     "note": "approach turn 120/115/110 (UP/TO/LDG), 90 position 400 ft AGL; rate ค่าประมาณ; ค่าประมาณ: pitch = α + γ จาก lh_attitude.mjs"
    },
    "final": {
     "v": {
      "ias_kt": 100,
      "pitch_deg": -1.2,
      "power": "ตามต้อง (≥ on-speed AOA)",
      "flap": "LDG",
      "rate_fpm": -530
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LH15",
      "LH0"
     ],
     "conf": "สูง",
     "est": true,
     "note": "110/105/100 KIAS (UP/TO/LDG); groove 100–150 ft ≈ 1,500 ft; ค่าประมาณ: pitch = α + γ จาก lh_attitude.mjs"
    },
    "flare": {
     "v": {
      "ias_kt": 95,
      "pitch_deg": null,
      "power": "idle",
      "flap": "LDG",
      "rate_fpm": -100
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LH15"
     ],
     "conf": "สูง",
     "est": true,
     "note": "ลดกำลังสู่ idle ที่ 5–10 ft แล้วตั้ง landing attitude และ flare ใน ground effect (Fig 6-10); ias และ rate ค่าประมาณ"
    },
    "touchdown": {
     "v": {
      "ias_kt": 85,
      "pitch_deg": 7,
      "power": "idle",
      "flap": "LDG",
      "rate_fpm": -120
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LH15",
      "LH0"
     ],
     "conf": "กลาง",
     "est": true,
     "note": "attitude สูงกว่า takeoff attitude เล็กน้อย; ias ค่าประมาณ; ค่าประมาณ: pitch = α + γ จาก lh_attitude.mjs"
    },
    "go_around": {
     "v": {
      "ias_kt": 110,
      "pitch_deg": 10.4,
      "power": "MAX",
      "flap": "TO",
      "rate_fpm": 1500
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LH15",
      "LH0"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ ias และ rate; ค่าประมาณ: pitch = α + γ จาก lh_attitude.mjs"
    }
   },
   "crosswind_limits": {
    "v": {
     "dry": 25,
     "wet": 10,
     "icy": 5,
     "touch_and_go": 20,
     "formation": 15,
     "tailwind_takeoff": 10,
     "limitation": true
    },
    "u": "kt",
    "scope": "aircraft",
    "src": [
     "LH16"
    ],
    "conf": "สูง",
    "est": false,
    "note": "ขีดจำกัดปฏิบัติการ"
   },
   "stall_characteristics": {
    "v": {
     "warning": "stick shaker",
     "warning_margin_kt": [
      5,
      10
     ],
     "buffet_margin_kt": 3,
     "roll_off": "ซ้ายเมื่อ > 60 % torque แม้ใช้ rudder/aileron ขวาเต็ม; แฟลปทำให้แย่ลง",
     "recovery": "MAX power, ผ่อนคัน, wings level, ball กลาง, AOA < 18 units"
    },
    "u": "kt, ft",
    "scope": "aircraft",
    "src": [
     "LH15",
     "LP19"
    ],
    "conf": "กลาง",
    "est": false,
    "note": "ตัวเลข margin จาก flashcard [LP19]"
   },
   "spin": {
    "v": {
     "approved": true,
     "entry_min_ft_msl": 13500,
     "prohibited_below_ft_pa": 10000,
     "prohibited_above_ft_pa": 22000,
     "max_aggravated_turns": 2,
     "s_per_turn": [
      2,
      3
     ],
     "ft_per_turn": [
      400,
      500
     ],
     "stabilised_kias": [
      120,
      135
     ],
     "recovery_ft": "≈500 ft/รอบ + 1,500–2,000 ft"
    },
    "u": "turn, ft, s",
    "scope": "aircraft",
    "src": [
     "LH16",
     "LH15",
     "LP19"
    ],
    "conf": "กลาง",
    "est": false,
    "note": "ตัวเลขลักษณะ spin จาก flashcard (ต่ำ); ขีดจำกัดความสูงจาก ops limits (สูง)"
   },
   "flap_effects": {
    "v": {
     "VFE": {
      "TO": 150,
      "LDG": 150
     },
     "final_kias": {
      "UP": 110,
      "TO": 105,
      "LDG": 100
     },
     "notes": "แฟลปเพิ่ม roll-off ตอน stall"
    },
    "u": "kt, g, deg",
    "scope": "aircraft",
    "src": [
     "LH15",
     "LH16",
     "LP19"
    ],
    "conf": "สูง",
    "est": false,
    "note": ""
   },
   "trim_technique": {
    "v": "trim ไฟฟ้า ลำดับ rudder → elevator → aileron; Trim Aid Device trim rudder ตามกำลัง/ความเร็ว (WOW off > 80 KIAS)",
    "u": "-",
    "scope": "aircraft",
    "src": [
     "LH14",
     "LP21"
    ],
    "conf": "กลาง",
    "est": false,
    "note": ""
   },
   "crosswind_technique": {
    "v": "crab ใน pattern, final ใช้ rudder จัดหัว aileron คุมเส้นกลาง wing-low จนแตะล้อด้านลม; ไม่เบรกเหนือ 80 KIAS; touch-and-go คง aileron เข้าลม",
    "u": "-",
    "scope": "aircraft",
    "src": [
     "LH15"
    ],
    "conf": "สูง",
    "est": false,
    "note": ""
   },
   "stick_feel": {
    "v": "stick, กำลังสูงที่ความเร็วต่ำทำให้ yaw/roll ซ้ายมาก; ห้าม rudder เต็มเหนือ 150 KIAS (T-6)",
    "u": "-",
    "scope": "aircraft",
    "src": [
     "LH16",
     "LP19"
    ],
    "conf": "ต่ำ",
    "est": false,
    "note": ""
   },
   "approach_pitch_deg": {
    "v": -1.2,
    "u": "deg",
    "scope": "aircraft",
    "src": [
     "LH0"
    ],
    "conf": "ต่ำ",
    "est": true,
    "note": "ค่าประมาณ: θ = α + γ ที่ final (100 KIAS, path 3°)"
   },
   "touchdown_pitch_deg": {
    "v": 8.5,
    "u": "deg",
    "scope": "aircraft",
    "src": [
     "LH15",
     "LH14"
    ],
    "conf": "ต่ำ",
    "est": true,
    "note": "ค่าประมาณ: \"สูงกว่า takeoff attitude 7–10° เล็กน้อย\""
   },
   "flare_height_m": {
    "v": 2.3,
    "u": "m",
    "scope": "aircraft",
    "src": [
     "LH15"
    ],
    "conf": "กลาง",
    "est": false,
    "note": "ลดกำลังที่ 5–10 ft แล้ว flare ใน ground effect (กลาง 7.5 ft) [LH15 Fig 6-10]"
   },
   "stabilised_criteria": {
    "v": {
     "gate_ft": [
      500,
      300
     ],
     "speed": {
      "Vapp": 100,
      "lo": -5,
      "hi_ppl": 10,
      "hi_cpl": 5
     },
     "vs_min_fpm": -1000,
     "bank_max_deg": 15,
     "config": "แฟลปลงจอดของแบบ + ล้อลง",
     "path_dots": 1
    },
    "u": "ft, kt, fpm, deg",
    "scope": "aircraft",
    "src": [
     "LH1",
     "LH2",
     "LH3"
    ],
    "conf": "กลาง",
    "est": false,
    "note": "เกณฑ์ร่วม common_light.evaluator ใช้ Vapp ของแบบ"
   }
  }
 }
}
```

```json
{
 "pc9m": {
  "ops": {
   "attitude_power": {
    "takeoff_roll": {
     "v": {
      "ias_kt": 0,
      "pitch_deg": null,
      "power": "MAX (คลาส T-6)",
      "flap": "TO",
      "rate_fpm": 0
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LH14",
      "LP2",
      "LP9"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: เทคนิคคลาส T-6 ความเร็วต่ำสเกล VS0 ×0.893"
    },
    "rotation": {
     "v": {
      "ias_kt": 76,
      "pitch_deg": 9.4,
      "power": "MAX (คลาส T-6)",
      "flap": "TO",
      "rate_fpm": 0
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LH14",
      "LH15",
      "LP2",
      "LP9",
      "LH0"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: เทคนิคคลาส T-6 ความเร็วต่ำสเกล VS0 ×0.893; ค่าประมาณ: pitch = α + γ จาก lh_attitude.mjs"
    },
    "initial_climb": {
     "v": {
      "ias_kt": 140,
      "pitch_deg": 13.9,
      "power": "MAX (คลาส T-6)",
      "flap": "UP",
      "rate_fpm": null
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LH14",
      "LP2",
      "LP9",
      "LH0"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: เทคนิคคลาส T-6 ความเร็วต่ำสเกล VS0 ×0.893; ค่าประมาณ: pitch = α + γ จาก lh_attitude.mjs"
    },
    "cruise_climb": {
     "v": {
      "ias_kt": 160,
      "pitch_deg": 9.5,
      "power": "MAX (คลาส T-6)",
      "flap": "UP",
      "rate_fpm": null
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LH14",
      "LP2",
      "LP9",
      "LH0"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: เทคนิคคลาส T-6 ความเร็วต่ำสเกล VS0 ×0.893; ค่าประมาณ: pitch = α + γ จาก lh_attitude.mjs"
    },
    "cruise": {
     "v": {
      "ias_kt": 200,
      "pitch_deg": -0.6,
      "power": "≈50 % + 1 %/1,000 ft MSL (คลาส T-6)",
      "flap": "UP",
      "rate_fpm": 0
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LH14",
      "LP2",
      "LP9",
      "LH0"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: เทคนิคคลาส T-6 ความเร็วต่ำสเกล VS0 ×0.893; ค่าประมาณ: pitch = α + γ จาก lh_attitude.mjs"
    },
    "descent": {
     "v": {
      "ias_kt": 200,
      "pitch_deg": -4.9,
      "power": "≈10–20 % (คลาส T-6)",
      "flap": "UP",
      "rate_fpm": -1500
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LH15",
      "LP2",
      "LP9",
      "LH0"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: เทคนิคคลาส T-6 ความเร็วต่ำสเกล VS0 ×0.893; ค่าประมาณ: pitch = α + γ จาก lh_attitude.mjs"
    },
    "downwind": {
     "v": {
      "ias_kt": 107,
      "pitch_deg": 5,
      "power": "≈31 % (คลาส T-6)",
      "flap": "UP",
      "rate_fpm": 0
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LH15",
      "LP2",
      "LP9",
      "LH0"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: เทคนิคคลาส T-6 ความเร็วต่ำสเกล VS0 ×0.893; ค่าประมาณ: pitch = α + γ จาก lh_attitude.mjs"
    },
    "base": {
     "v": {
      "ias_kt": 98,
      "pitch_deg": -4.4,
      "power": "≈15 % (คลาส T-6)",
      "flap": "LDG",
      "rate_fpm": -800
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LH15",
      "LP2",
      "LP9",
      "LH0"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: เทคนิคคลาส T-6 ความเร็วต่ำสเกล VS0 ×0.893; ค่าประมาณ: pitch = α + γ จาก lh_attitude.mjs"
    },
    "final": {
     "v": {
      "ias_kt": 89,
      "pitch_deg": -0.8,
      "power": "ตามต้อง (≥ on-speed AOA) (คลาส T-6)",
      "flap": "LDG",
      "rate_fpm": -530
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LH15",
      "LP2",
      "LP9",
      "LH0"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: เทคนิคคลาส T-6 ความเร็วต่ำสเกล VS0 ×0.893; ค่าประมาณ: pitch = α + γ จาก lh_attitude.mjs"
    },
    "flare": {
     "v": {
      "ias_kt": 85,
      "pitch_deg": null,
      "power": "idle (คลาส T-6)",
      "flap": "LDG",
      "rate_fpm": -100
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LH15",
      "LP2",
      "LP9"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: เทคนิคคลาส T-6 ความเร็วต่ำสเกล VS0 ×0.893"
    },
    "touchdown": {
     "v": {
      "ias_kt": 76,
      "pitch_deg": 7.6,
      "power": "idle (คลาส T-6)",
      "flap": "LDG",
      "rate_fpm": -120
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LH15",
      "LP2",
      "LP9",
      "LH0"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: เทคนิคคลาส T-6 ความเร็วต่ำสเกล VS0 ×0.893; ค่าประมาณ: pitch = α + γ จาก lh_attitude.mjs"
    },
    "go_around": {
     "v": {
      "ias_kt": 98,
      "pitch_deg": 11.7,
      "power": "MAX (คลาส T-6)",
      "flap": "TO",
      "rate_fpm": 1500
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LH15",
      "LP2",
      "LP9",
      "LH0"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: เทคนิคคลาส T-6 ความเร็วต่ำสเกล VS0 ×0.893; ค่าประมาณ: pitch = α + γ จาก lh_attitude.mjs"
    }
   },
   "crosswind_limits": {
    "v": {
     "dry": 25,
     "limitation": false
    },
    "u": "kt",
    "scope": "aircraft",
    "src": [
     "LH16"
    ],
    "conf": "ต่ำ",
    "est": false,
    "note": "ค่าประมาณ: ใช้ค่าคลาส T-6"
   },
   "stall_characteristics": {
    "v": {
     "warning_margin_kt": [
      5,
      10
     ]
    },
    "u": "kt, ft",
    "scope": "aircraft",
    "src": [
     "LP19"
    ],
    "conf": "ต่ำ",
    "est": true,
    "note": "ค่าประมาณ: คลาส T-6"
   },
   "spin": {
    "v": {
     "approved": "aerobatic category (รายละเอียดไม่เปิดเผย)"
    },
    "u": "turn, ft, s",
    "scope": "aircraft",
    "src": [
     "LP2",
     "LP9"
    ],
    "conf": "ต่ำ",
    "est": false,
    "note": "TCDS/fact sheet"
   },
   "trim_technique": {
    "v": "ไม่มี Trim Aid Device: เหยียบ rudder ขวาเองเมื่อเพิ่มกำลัง (ค่าประมาณ: เทคนิคคลาส)",
    "u": "-",
    "scope": "aircraft",
    "src": [
     "LP21"
    ],
    "conf": "ต่ำ",
    "est": false,
    "note": ""
   },
   "crosswind_technique": {
    "v": "crab ใน pattern, final ใช้ rudder จัดหัว aileron คุมเส้นกลาง wing-low จนแตะล้อด้านลม; ไม่เบรกเหนือ 80 KIAS; touch-and-go คง aileron เข้าลม",
    "u": "-",
    "scope": "aircraft",
    "src": [
     "LH15"
    ],
    "conf": "ต่ำ",
    "est": false,
    "note": ""
   },
   "stick_feel": {
    "v": "stick, กำลังสูงที่ความเร็วต่ำทำให้ yaw/roll ซ้ายมาก; ห้าม rudder เต็มเหนือ 150 KIAS (T-6)",
    "u": "-",
    "scope": "aircraft",
    "src": [
     "LH16",
     "LP19"
    ],
    "conf": "ต่ำ",
    "est": false,
    "note": ""
   },
   "approach_pitch_deg": {
    "v": -0.8,
    "u": "deg",
    "scope": "aircraft",
    "src": [
     "LH0"
    ],
    "conf": "ต่ำ",
    "est": true,
    "note": "ค่าประมาณ: θ = α + γ ที่ final (89 KIAS, path 3°)"
   },
   "touchdown_pitch_deg": {
    "v": 7.6,
    "u": "deg",
    "scope": "aircraft",
    "src": [
     "LH0",
     "LH1"
    ],
    "conf": "ต่ำ",
    "est": true,
    "note": "ค่าประมาณ: α ที่ 1.05 VS0 นอก ground effect (ใกล้ power-off stall attitude ตาม AFH)"
   },
   "flare_height_m": {
    "v": 2.3,
    "u": "m",
    "scope": "aircraft",
    "src": [
     "LH15"
    ],
    "conf": "กลาง",
    "est": false,
    "note": "ลดกำลังที่ 5–10 ft แล้ว flare ใน ground effect (กลาง 7.5 ft) [LH15 Fig 6-10]"
   },
   "stabilised_criteria": {
    "v": {
     "gate_ft": [
      500,
      300
     ],
     "speed": "Vapp −5/+10",
     "vs_min_fpm": -1000,
     "bank_max_deg": 15,
     "config": "แฟลปลงจอดของแบบ + ล้อลง",
     "path_dots": 1
    },
    "u": "ft, kt, fpm, deg",
    "scope": "aircraft",
    "src": [
     "LH1",
     "LH2",
     "LH3"
    ],
    "conf": "กลาง",
    "est": false,
    "note": "เกณฑ์ร่วม common_light.evaluator ใช้ Vapp ของแบบ"
   }
  }
 }
}
```

```json
{
 "pc7mk2": {
  "ops": {
   "attitude_power": {
    "takeoff_roll": {
     "v": {
      "ias_kt": 0,
      "pitch_deg": null,
      "power": "MAX (คลาส T-6)",
      "flap": "TO",
      "rate_fpm": 0
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LH14",
      "LP2",
      "LP9"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: เทคนิคคลาส T-6 ความเร็วต่ำสเกล VS0 ×0.867"
    },
    "rotation": {
     "v": {
      "ias_kt": 74,
      "pitch_deg": 9.5,
      "power": "MAX (คลาส T-6)",
      "flap": "TO",
      "rate_fpm": 0
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LH14",
      "LH15",
      "LP2",
      "LP9",
      "LH0"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: เทคนิคคลาส T-6 ความเร็วต่ำสเกล VS0 ×0.867; ค่าประมาณ: pitch = α + γ จาก lh_attitude.mjs"
    },
    "initial_climb": {
     "v": {
      "ias_kt": 140,
      "pitch_deg": 13.7,
      "power": "MAX (คลาส T-6)",
      "flap": "UP",
      "rate_fpm": null
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LH14",
      "LP2",
      "LP9",
      "LH0"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: เทคนิคคลาส T-6 ความเร็วต่ำสเกล VS0 ×0.867; ค่าประมาณ: pitch = α + γ จาก lh_attitude.mjs"
    },
    "cruise_climb": {
     "v": {
      "ias_kt": 160,
      "pitch_deg": 9.3,
      "power": "MAX (คลาส T-6)",
      "flap": "UP",
      "rate_fpm": null
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LH14",
      "LP2",
      "LP9",
      "LH0"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: เทคนิคคลาส T-6 ความเร็วต่ำสเกล VS0 ×0.867; ค่าประมาณ: pitch = α + γ จาก lh_attitude.mjs"
    },
    "cruise": {
     "v": {
      "ias_kt": 200,
      "pitch_deg": -0.7,
      "power": "≈50 % + 1 %/1,000 ft MSL (คลาส T-6)",
      "flap": "UP",
      "rate_fpm": 0
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LH14",
      "LP2",
      "LP9",
      "LH0"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: เทคนิคคลาส T-6 ความเร็วต่ำสเกล VS0 ×0.867; ค่าประมาณ: pitch = α + γ จาก lh_attitude.mjs"
    },
    "descent": {
     "v": {
      "ias_kt": 200,
      "pitch_deg": -5,
      "power": "≈10–20 % (คลาส T-6)",
      "flap": "UP",
      "rate_fpm": -1500
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LH15",
      "LP2",
      "LP9",
      "LH0"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: เทคนิคคลาส T-6 ความเร็วต่ำสเกล VS0 ×0.867; ค่าประมาณ: pitch = α + γ จาก lh_attitude.mjs"
    },
    "downwind": {
     "v": {
      "ias_kt": 104,
      "pitch_deg": 5.1,
      "power": "≈31 % (คลาส T-6)",
      "flap": "UP",
      "rate_fpm": 0
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LH15",
      "LP2",
      "LP9",
      "LH0"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: เทคนิคคลาส T-6 ความเร็วต่ำสเกล VS0 ×0.867; ค่าประมาณ: pitch = α + γ จาก lh_attitude.mjs"
    },
    "base": {
     "v": {
      "ias_kt": 95,
      "pitch_deg": -4.4,
      "power": "≈15 % (คลาส T-6)",
      "flap": "LDG",
      "rate_fpm": -800
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LH15",
      "LP2",
      "LP9",
      "LH0"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: เทคนิคคลาส T-6 ความเร็วต่ำสเกล VS0 ×0.867; ค่าประมาณ: pitch = α + γ จาก lh_attitude.mjs"
    },
    "final": {
     "v": {
      "ias_kt": 87,
      "pitch_deg": -0.8,
      "power": "ตามต้อง (≥ on-speed AOA) (คลาส T-6)",
      "flap": "LDG",
      "rate_fpm": -530
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LH15",
      "LP2",
      "LP9",
      "LH0"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: เทคนิคคลาส T-6 ความเร็วต่ำสเกล VS0 ×0.867; ค่าประมาณ: pitch = α + γ จาก lh_attitude.mjs"
    },
    "flare": {
     "v": {
      "ias_kt": 82,
      "pitch_deg": null,
      "power": "idle (คลาส T-6)",
      "flap": "LDG",
      "rate_fpm": -100
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LH15",
      "LP2",
      "LP9"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: เทคนิคคลาส T-6 ความเร็วต่ำสเกล VS0 ×0.867"
    },
    "touchdown": {
     "v": {
      "ias_kt": 74,
      "pitch_deg": 7.8,
      "power": "idle (คลาส T-6)",
      "flap": "LDG",
      "rate_fpm": -120
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LH15",
      "LP2",
      "LP9",
      "LH0"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: เทคนิคคลาส T-6 ความเร็วต่ำสเกล VS0 ×0.867; ค่าประมาณ: pitch = α + γ จาก lh_attitude.mjs"
    },
    "go_around": {
     "v": {
      "ias_kt": 95,
      "pitch_deg": 12.1,
      "power": "MAX (คลาส T-6)",
      "flap": "TO",
      "rate_fpm": 1500
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LH15",
      "LP2",
      "LP9",
      "LH0"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: เทคนิคคลาส T-6 ความเร็วต่ำสเกล VS0 ×0.867; ค่าประมาณ: pitch = α + γ จาก lh_attitude.mjs"
    }
   },
   "crosswind_limits": {
    "v": {
     "dry": 25,
     "limitation": false
    },
    "u": "kt",
    "scope": "aircraft",
    "src": [
     "LH16"
    ],
    "conf": "ต่ำ",
    "est": false,
    "note": "ค่าประมาณ: ใช้ค่าคลาส T-6"
   },
   "stall_characteristics": {
    "v": {
     "warning_margin_kt": [
      5,
      10
     ]
    },
    "u": "kt, ft",
    "scope": "aircraft",
    "src": [
     "LP19"
    ],
    "conf": "ต่ำ",
    "est": true,
    "note": "ค่าประมาณ: คลาส T-6"
   },
   "spin": {
    "v": {
     "approved": "aerobatic category (รายละเอียดไม่เปิดเผย)"
    },
    "u": "turn, ft, s",
    "scope": "aircraft",
    "src": [
     "LP2",
     "LP9"
    ],
    "conf": "ต่ำ",
    "est": false,
    "note": "TCDS/fact sheet"
   },
   "trim_technique": {
    "v": "ไม่มี Trim Aid Device: เหยียบ rudder ขวาเองเมื่อเพิ่มกำลัง (ค่าประมาณ: เทคนิคคลาส)",
    "u": "-",
    "scope": "aircraft",
    "src": [
     "LP21"
    ],
    "conf": "ต่ำ",
    "est": false,
    "note": ""
   },
   "crosswind_technique": {
    "v": "crab ใน pattern, final ใช้ rudder จัดหัว aileron คุมเส้นกลาง wing-low จนแตะล้อด้านลม; ไม่เบรกเหนือ 80 KIAS; touch-and-go คง aileron เข้าลม",
    "u": "-",
    "scope": "aircraft",
    "src": [
     "LH15"
    ],
    "conf": "ต่ำ",
    "est": false,
    "note": ""
   },
   "stick_feel": {
    "v": "stick, กำลังสูงที่ความเร็วต่ำทำให้ yaw/roll ซ้ายมาก; ห้าม rudder เต็มเหนือ 150 KIAS (T-6)",
    "u": "-",
    "scope": "aircraft",
    "src": [
     "LH16",
     "LP19"
    ],
    "conf": "ต่ำ",
    "est": false,
    "note": ""
   },
   "approach_pitch_deg": {
    "v": -0.8,
    "u": "deg",
    "scope": "aircraft",
    "src": [
     "LH0"
    ],
    "conf": "ต่ำ",
    "est": true,
    "note": "ค่าประมาณ: θ = α + γ ที่ final (87 KIAS, path 3°)"
   },
   "touchdown_pitch_deg": {
    "v": 7.8,
    "u": "deg",
    "scope": "aircraft",
    "src": [
     "LH0",
     "LH1"
    ],
    "conf": "ต่ำ",
    "est": true,
    "note": "ค่าประมาณ: α ที่ 1.05 VS0 นอก ground effect (ใกล้ power-off stall attitude ตาม AFH)"
   },
   "flare_height_m": {
    "v": 2.3,
    "u": "m",
    "scope": "aircraft",
    "src": [
     "LH15"
    ],
    "conf": "กลาง",
    "est": false,
    "note": "ลดกำลังที่ 5–10 ft แล้ว flare ใน ground effect (กลาง 7.5 ft) [LH15 Fig 6-10]"
   },
   "stabilised_criteria": {
    "v": {
     "gate_ft": [
      500,
      300
     ],
     "speed": "Vapp −5/+10",
     "vs_min_fpm": -1000,
     "bank_max_deg": 15,
     "config": "แฟลปลงจอดของแบบ + ล้อลง",
     "path_dots": 1
    },
    "u": "ft, kt, fpm, deg",
    "scope": "aircraft",
    "src": [
     "LH1",
     "LH2",
     "LH3"
    ],
    "conf": "กลาง",
    "est": false,
    "note": "เกณฑ์ร่วม common_light.evaluator ใช้ Vapp ของแบบ"
   }
  }
 }
}
```

```json
{
 "pa28_161": {
  "ops": {
   "attitude_power": {
    "rotation": {
     "v": {
      "ias_kt": 50,
      "pitch_deg": null,
      "power": "เต็ม",
      "flap": "ตามคู่มือ",
      "rate_fpm": 0
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LH19"
     ],
     "conf": "กลาง",
     "est": false,
     "note": "short field 50 KIAS (Warrior, p.41)"
    },
    "initial_climb": {
     "v": {
      "ias_kt": 79,
      "pitch_deg": null,
      "power": "เต็ม",
      "flap": 0,
      "rate_fpm": null
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LH19"
     ],
     "conf": "กลาง",
     "est": false,
     "note": "Vy 79, Vx 63 (p.22)"
    },
    "cruise_climb": {
     "v": {
      "ias_kt": 87,
      "pitch_deg": null,
      "power": "เต็ม",
      "flap": 0,
      "rate_fpm": null
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LH19"
     ],
     "conf": "กลาง",
     "est": false,
     "note": ""
    },
    "downwind": {
     "v": {
      "ias_kt": 90,
      "pitch_deg": null,
      "power": "ลดเริ่ม descent",
      "flap": "ตามต้อง",
      "rate_fpm": 0
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LH19"
     ],
     "conf": "กลาง",
     "est": false,
     "note": "เริ่มลดที่ abeam ≈ 90 kt"
    },
    "base": {
     "v": {
      "ias_kt": 80,
      "pitch_deg": null,
      "power": "-",
      "flap": "ตามต้อง",
      "rate_fpm": null
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LH19"
     ],
     "conf": "กลาง",
     "est": false,
     "note": "เลี้ยวที่ 45° จากจุดแตะ"
    },
    "final": {
     "v": {
      "ias_kt": 65,
      "pitch_deg": null,
      "power": "ตาม path",
      "flap": "FULL",
      "rate_fpm": null
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LH19"
     ],
     "conf": "กลาง",
     "est": false,
     "note": "+½ gust; stabilised ไม่ต่ำกว่า 300 ft AGL (p.43)"
    },
    "go_around": {
     "v": {
      "ias_kt": 63,
      "pitch_deg": null,
      "power": "เต็ม",
      "flap": "เก็บขั้นแรกทันที",
      "rate_fpm": null
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LH19"
     ],
     "conf": "กลาง",
     "est": false,
     "note": "pitch Vx แล้ว Vy"
    }
   },
   "crosswind_limits": {
    "v": {
     "demonstrated": 17,
     "limitation": false
    },
    "u": "kt",
    "scope": "aircraft",
    "src": [
     "LH19"
    ],
    "conf": "กลาง",
    "est": false,
    "note": "ตาราง V-speeds ของโรงเรียน p.22 (ไม่ระบุว่าสาธิตหรือจำกัด)"
   },
   "spin": {
    "v": {
     "approved": "ไม่ยืนยันในรอบนี้"
    },
    "u": "turn, ft, s",
    "scope": "aircraft",
    "src": [
     "LH19"
    ],
    "conf": "ต่ำ",
    "est": false,
    "note": "โรงเรียนต้นทางอนุญาต spin เฉพาะใน C152"
   },
   "stabilised_criteria": {
    "v": {
     "gate_ft": [
      500,
      300
     ],
     "speed": "Vapp −5/+10",
     "vs_min_fpm": -1000,
     "bank_max_deg": 15,
     "config": "แฟลปลงจอดของแบบ",
     "path_dots": 1
    },
    "u": "ft, kt, fpm, deg",
    "scope": "aircraft",
    "src": [
     "LH1",
     "LH2",
     "LH3"
    ],
    "conf": "กลาง",
    "est": false,
    "note": "เกณฑ์ร่วม common_light.evaluator ใช้ Vapp ของแบบ"
   }
  }
 }
}
```

```json
{
 "be76": {
  "ops": {
   "attitude_power": {
    "takeoff_roll": {
     "v": {
      "ias_kt": 0,
      "pitch_deg": null,
      "power": "เต็ม",
      "flap": 0,
      "rate_fpm": 0
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LH20"
     ],
     "conf": "ต่ำ",
     "est": false,
     "note": "flashcard ผู้ใช้: ลดเป็น 25 inHg / 2,500 rpm เมื่อพ้นปลายรันเวย์ (end of runway power)"
    },
    "cruise_climb": {
     "v": {
      "ias_kt": 100,
      "pitch_deg": null,
      "power": "25 inHg / 2,500 rpm",
      "flap": 0,
      "rate_fpm": null
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LH20"
     ],
     "conf": "ต่ำ",
     "est": false,
     "note": ""
    },
    "cruise": {
     "v": {
      "ias_kt": 120,
      "pitch_deg": null,
      "power": "21 inHg / 2,300 rpm",
      "flap": 0,
      "rate_fpm": 0
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LH20"
     ],
     "conf": "ต่ำ",
     "est": false,
     "note": ""
    },
    "descent": {
     "v": {
      "ias_kt": 115,
      "pitch_deg": null,
      "power": "20 inHg / 2,300 rpm",
      "flap": 0,
      "rate_fpm": null
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LH20"
     ],
     "conf": "ต่ำ",
     "est": false,
     "note": "หรือ 15 inHg 105 KIAS"
    },
    "downwind": {
     "v": {
      "ias_kt": 105,
      "pitch_deg": null,
      "power": "18 inHg / 2,300 rpm",
      "flap": 10,
      "rate_fpm": 0
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LH20"
     ],
     "conf": "ต่ำ",
     "est": false,
     "note": "แฟลป 10 บน downwind; abeam 15 inHg 90 KIAS"
    },
    "base": {
     "v": {
      "ias_kt": 85,
      "pitch_deg": null,
      "power": "≈15 inHg",
      "flap": 20,
      "rate_fpm": null
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LH20"
     ],
     "conf": "ต่ำ",
     "est": false,
     "note": ""
    },
    "final": {
     "v": {
      "ias_kt": 80,
      "pitch_deg": null,
      "power": "props full forward",
      "flap": 35,
      "rate_fpm": null
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LH20"
     ],
     "conf": "ต่ำ",
     "est": false,
     "note": "76 KIAS short final"
    },
    "go_around": {
     "v": {
      "ias_kt": 85,
      "pitch_deg": null,
      "power": "เต็ม",
      "flap": "ตามต้อง",
      "rate_fpm": null
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LH20"
     ],
     "conf": "ต่ำ",
     "est": false,
     "note": "pitch Vy 85"
    }
   },
   "stabilised_criteria": {
    "v": {
     "gate_ft": [
      500,
      300
     ],
     "speed": "Vapp −5/+10",
     "vs_min_fpm": -1000,
     "bank_max_deg": 15,
     "config": "แฟลปลงจอดของแบบ + ล้อลง",
     "path_dots": 1
    },
    "u": "ft, kt, fpm, deg",
    "scope": "aircraft",
    "src": [
     "LH1",
     "LH2",
     "LH3"
    ],
    "conf": "กลาง",
    "est": false,
    "note": "เกณฑ์ร่วม common_light.evaluator ใช้ Vapp ของแบบ"
   }
  }
 }
}
```

```json
{
 "p2006t": {
  "ops": {
   "attitude_power": {
    "initial_climb": {
     "v": {
      "ias_kt": 80,
      "pitch_deg": null,
      "power": "คันเร่งและใบพัดเต็ม",
      "flap": "T/O",
      "rate_fpm": 1050
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LH22"
     ],
     "conf": "ต่ำ",
     "est": false,
     "note": "บทความทดสอบเครื่องก่อนรับรอง"
    },
    "cruise": {
     "v": {
      "ias_kt": 145,
      "pitch_deg": null,
      "power": "คันเร่งเต็ม ≤ 2,265 rpm ใบพัด (MCP 92.5 hp)",
      "flap": 0,
      "rate_fpm": 0
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LH22",
      "LH21"
     ],
     "conf": "ต่ำ",
     "est": false,
     "note": "kt ไม่ระบุ IAS/TAS"
    },
    "downwind": {
     "v": {
      "ias_kt": 90,
      "pitch_deg": null,
      "power": "-",
      "flap": 0,
      "rate_fpm": 0
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LH22"
     ],
     "conf": "ต่ำ",
     "est": false,
     "note": "ล้อลงบน downwind"
    },
    "final": {
     "v": {
      "ias_kt": 70,
      "pitch_deg": null,
      "power": "-",
      "flap": "FULL",
      "rate_fpm": null
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LH22"
     ],
     "conf": "ต่ำ",
     "est": false,
     "note": "ข้าม threshold 70 kt"
    }
   },
   "stall_characteristics": {
    "v": {
     "buffet_onset_kt": 50,
     "behaviour": "ไม่รุนแรง",
     "oei_stall": "ห้าม"
    },
    "u": "kt, ft",
    "scope": "aircraft",
    "src": [
     "LH22",
     "LH21"
    ],
    "conf": "ต่ำ",
    "est": false,
    "note": "บทความทดสอบ; POH p.2-22"
   },
   "spin": {
    "v": {
     "approved": false
    },
    "u": "turn, ft, s",
    "scope": "aircraft",
    "src": [
     "LH21"
    ],
    "conf": "สูง",
    "est": false,
    "note": "POH p.2-22, 3-44"
   },
   "stabilised_criteria": {
    "v": {
     "gate_ft": [
      500,
      300
     ],
     "speed": "Vapp −5/+10",
     "vs_min_fpm": -1000,
     "bank_max_deg": 15,
     "config": "แฟลปลงจอดของแบบ + ล้อลง",
     "path_dots": 1
    },
    "u": "ft, kt, fpm, deg",
    "scope": "aircraft",
    "src": [
     "LH1",
     "LH2",
     "LH3"
    ],
    "conf": "กลาง",
    "est": false,
    "note": "เกณฑ์ร่วม common_light.evaluator ใช้ Vapp ของแบบ"
   }
  }
 }
}
```

```json
{
 "p2002jf": {
  "ops": {
   "attitude_power": {
    "initial_climb": {
     "v": {
      "ias_kt": null,
      "pitch_deg": null,
      "power": "เต็ม",
      "flap": "T/O",
      "rate_fpm": 800
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LH26"
     ],
     "conf": "กลาง",
     "est": false,
     "note": "ROC SL ที่ 620 kg"
    },
    "cruise": {
     "v": {
      "ias_kt": null,
      "pitch_deg": null,
      "power": "75 %",
      "flap": 0,
      "rate_fpm": 0
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LH26"
     ],
     "conf": "กลาง",
     "est": false,
     "note": "118 kt ที่ 6,500 ft"
    },
    "final": {
     "v": {
      "ias_kt": 52,
      "pitch_deg": null,
      "power": "-",
      "flap": "LDG",
      "rate_fpm": null
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LH26",
      "LH25"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: 1.3 × VS0 38 kt ≈ 50–55 (VFE LDG 67 KIAS)"
    }
   },
   "stabilised_criteria": {
    "v": {
     "gate_ft": [
      500,
      300
     ],
     "speed": "Vapp −5/+10",
     "vs_min_fpm": -1000,
     "bank_max_deg": 15,
     "config": "แฟลปลงจอดของแบบ",
     "path_dots": 1
    },
    "u": "ft, kt, fpm, deg",
    "scope": "aircraft",
    "src": [
     "LH1",
     "LH2",
     "LH3"
    ],
    "conf": "กลาง",
    "est": false,
    "note": "เกณฑ์ร่วม common_light.evaluator ใช้ Vapp ของแบบ"
   }
  }
 }
}
```

```json
{
 "p68c": {
  "ops": {
   "attitude_power": {
    "final": {
     "v": {
      "ias_kt": null,
      "pitch_deg": null,
      "power": "-",
      "flap": "30–35°",
      "rate_fpm": null
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LH27"
     ],
     "conf": "ต่ำ",
     "est": false,
     "note": "ไม่มีความเร็ว approach ในแหล่งเปิด; VFE 30–35° 99 KCAS, VMC 60 KCAS"
    }
   },
   "stabilised_criteria": {
    "v": {
     "gate_ft": [
      500,
      300
     ],
     "speed": "Vapp −5/+10",
     "vs_min_fpm": -1000,
     "bank_max_deg": 15,
     "config": "แฟลปลงจอดของแบบ",
     "path_dots": 1
    },
    "u": "ft, kt, fpm, deg",
    "scope": "aircraft",
    "src": [
     "LH1",
     "LH2",
     "LH3"
    ],
    "conf": "กลาง",
    "est": false,
    "note": "เกณฑ์ร่วม common_light.evaluator ใช้ Vapp ของแบบ"
   }
  }
 }
}
```

```json
{
 "t206h": {
  "ops": {
   "attitude_power": {
    "cruise_climb": {
     "v": {
      "ias_kt": null,
      "pitch_deg": null,
      "power": "2,400 rpm / 30 inHg",
      "flap": 0,
      "rate_fpm": null
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LH24"
     ],
     "conf": "กลาง",
     "est": false,
     "note": "cowl flaps open"
    },
    "cruise": {
     "v": {
      "ias_kt": null,
      "pitch_deg": null,
      "power": "65–75 % (lean 75 °F ROP TIT)",
      "flap": 0,
      "rate_fpm": 0
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LH24"
     ],
     "conf": "กลาง",
     "est": false,
     "note": "65–75 % ตาม POH p.7-38 (ช่วง 50 ชม.แรก); lean ด้วย TIT ได้ที่ ≤ 75 % MCP, 75 °F ROP p.4-37/4-38"
    },
    "final": {
     "v": {
      "ias_kt": 75,
      "pitch_deg": null,
      "power": "-",
      "flap": "10–FULL",
      "rate_fpm": null
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LH23"
     ],
     "conf": "ต่ำ",
     "est": true,
     "note": "ค่าประมาณ: ใช้ความเร็ว precautionary/forced landing ของ POH เป็นตัวแทน"
    }
   },
   "spin": {
    "v": {
     "approved": false
    },
    "u": "turn, ft, s",
    "scope": "aircraft",
    "src": [
     "LH23"
    ],
    "conf": "สูง",
    "est": false,
    "note": "POH p.2-9"
   },
   "stabilised_criteria": {
    "v": {
     "gate_ft": [
      500,
      300
     ],
     "speed": "Vapp −5/+10",
     "vs_min_fpm": -1000,
     "bank_max_deg": 15,
     "config": "แฟลปลงจอดของแบบ",
     "path_dots": 1
    },
    "u": "ft, kt, fpm, deg",
    "scope": "aircraft",
    "src": [
     "LH1",
     "LH2",
     "LH3"
    ],
    "conf": "กลาง",
    "est": false,
    "note": "เกณฑ์ร่วม common_light.evaluator ใช้ Vapp ของแบบ"
   }
  }
 }
}
```

```json
{
 "ct4": {
  "ops": {
   "attitude_power": {
    "final": {
     "v": {
      "ias_kt": null,
      "pitch_deg": null,
      "power": "-",
      "flap": "LDG",
      "rate_fpm": null
     },
     "u": "kt IAS, deg, -, -, fpm",
     "scope": "aircraft",
     "src": [
      "LH28"
     ],
     "conf": "ต่ำ",
     "est": false,
     "note": "ผู้ใช้ทางทหาร แบบทั่วไป; มีเพียง VFE TO 100 / LDG 85 kt จาก TCDS"
    }
   },
   "spin": {
    "v": {
     "approved": "CT/4E acrobatic category; CT/4A acrobatic + normal"
    },
    "u": "turn, ft, s",
    "scope": "aircraft",
    "src": [
     "LH28"
    ],
    "conf": "กลาง",
    "est": false,
    "note": "TCDS ไม่ให้รายละเอียด spin"
   },
   "stabilised_criteria": {
    "v": {
     "gate_ft": [
      500,
      300
     ],
     "speed": "Vapp −5/+10",
     "vs_min_fpm": -1000,
     "bank_max_deg": 15,
     "config": "แฟลปลงจอดของแบบ",
     "path_dots": 1
    },
    "u": "ft, kt, fpm, deg",
    "scope": "aircraft",
    "src": [
     "LH1",
     "LH2",
     "LH3"
    ],
    "conf": "กลาง",
    "est": false,
    "note": "เกณฑ์ร่วม common_light.evaluator ใช้ Vapp ของแบบ"
   }
  }
 }
}
```
